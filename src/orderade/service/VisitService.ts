/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-19 15:54:42
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-03-25 11:01:11
 */

import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { appendLog, storeClassLog } from '../../common/utils/LogUtils'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../common/utils/TimeZoneUtils'
import { DropDownType, OrderLineActivityCde } from '../enum/Common'
import { VisitList, VisitListDataModel } from '../interface/VisitListModel'
import dayjs from 'dayjs'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { t } from '../../common/i18n/t'
import _ from 'lodash'
import VisitData from '../domain/visit/VisitData'
import VisitDM from '../domain/visit/VisitDM'
import LocationService, { getInLocation } from './LocationService'
import moment from 'moment'
import { CustomerToRouteType } from '../interface/CustomerToRoute'
import { getIdClause } from '../../common/utils/CommonUtils'
import { LocalVisitListModal } from '../interface/Visit_List__c'
import { VisitListStatus } from '../enum/VisitListStatus'
import PriceDM from '../domain/price/PriceDM'
import { VisitStatus } from '../enum/VisitType'
import { VisitListSubtype } from '../enum/VisitListSubtype'
import { MyDayVisitModel } from '../interface/MyDayVisit'
import { redefinePositionCoords } from '../utils/VisitUtils'
import AccountDM from '../domain/account/AccountDM'
import { MapType, MyDaySectionListData } from '../interface/Visit'
import { RecordTypeEnum } from '../../savvy/enums/RecordType'
import ProductDM from '../domain/product/ProductDM'
import PriceService from './PriceService'
import { AddVisitModel } from '../interface/AddVisitModel'
import CommonDM from '../domain/common/CommonDM'
import OrderDM from '../domain/order/OrderDM'
import SyncUpService from './SyncUpService'
import { getRecordTypeIdByDeveloperName } from '../../savvy/utils/CommonUtils'

const productDM = new ProductDM()

class VisitService {
    static async fetchVisitDataByDay(inputDate: string, dropDownRef: any): Promise<VisitListDataModel> {
        let visits: Partial<VisitList>[] = []
        let userVLs: Array<VisitList> = []
        let eventData: any = []
        const isPast = dayjs(inputDate).isBefore(dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD))
        try {
            visits = await VisitData.fetchVisitRelatedDataByDate(inputDate)
            userVLs = await VisitDM.getUserVLFormatted(inputDate)
            if (isPast) {
                visits = VisitDM.filterPastVisits(
                    visits,
                    userVLs.map((userVL) => userVL.Id)
                )
            }
            // prepare data for determining if user is in geofence
            const currentVisits = visits.map((v) => VisitDM.mapVisitData(v))
            const uniqueStores = _.uniqBy(currentVisits, 'RetailStoreId')
            CommonParam.geoLocationList = VisitDM.getStoreGeoFences(uniqueStores)
            const cLocation = await LocationService.getCurrentPosition()
            await VisitDM.refreshGeoFence(cLocation, visits)
            const isToday = inputDate === todayDateWithTimeZone(true)
            if (isToday) {
                const events = await VisitDM.fetchEventDataByToday()
                eventData = events.filter((event) => event.VisitDate === inputDate)
            } else {
                const events = await VisitDM.fetchEventDataByPastFuture()
                eventData = events.filter((event) => event.VisitDate === inputDate)
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: My Day Screen',
                `Fetch visits list failed: ${ErrorUtils.error2String(err)}`
            )
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_MY_DAY_VIEW_MODEL_ERR, err)
        }
        return VisitDM.mapVisitResultToView(visits.concat(eventData), userVLs, isPast, inputDate)
    }

    private static async preparePriceForAdHocVisit(visitArr: Array<AddVisitModel>) {
        const needPreparePriceStore = visitArr.map((visit) => {
            return {
                CustUniqId: visit.CustomerId,
                AccountId: visit.AccountId
            }
        })
        await Promise.allSettled(
            needPreparePriceStore?.map((storeInfo) => {
                return PriceService.priceCalculateProcess(storeInfo, [], true)
            })
        ).then((results) => {
            results?.forEach((result) => {
                if (result.status === 'rejected') {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Orderade: getPriceWhenAdHocVisit',
                        `getPriceWhenAdHocVisit failed` + ErrorUtils.error2String(result.reason)
                    )
                }
            })
        })
    }

    private static async syncDownExtraDataForProduct(retailStoreFromOtherRoutes: Array<AddVisitModel>) {
        const accountIds = _.uniq(retailStoreFromOtherRoutes.map((el) => el.AccountId))
        const custUniqIds = _.uniq(retailStoreFromOtherRoutes.map((el) => el.CustomerId))
        // need to download related price zone data first, because we need the related pz ids in price zone object
        await PriceService.syncDownPricingDataForAdHocVisits(accountIds)
        const [ctr] = await Promise.all([
            VisitDM.getRouteInfoByAccount(getIdClause(accountIds)),
            productDM.syncDownProductExclusionByAPI(custUniqIds),
            PriceDM.syncDownCustomerDealForAdHocs(accountIds, custUniqIds)
        ])
        await VisitService.preparePriceForAdHocVisit(retailStoreFromOtherRoutes)
        return ctr
    }

    static async createVisit(addVisitList: Array<AddVisitModel>, todayDate: string, now: number) {
        const { vlId, vlSoupEntryId, userVlsCount } = await VisitDM.getVisitListId(todayDate, 0)
        // if we have online retailStore as a new visit, which doesn't have routeId
        // it means we have network connection, then we get ctr using online and sync down necessary rsgs
        const retailStoreFromOtherRoutes = addVisitList.filter((v) => v.RouteId !== CommonParam.userRouteId)
        const retailStoreFromRoutes = addVisitList.filter((v) => v.RouteId === CommonParam.userRouteId)
        await VisitService.preparePriceForAdHocVisit(retailStoreFromRoutes)
        let ctr: Array<CustomerToRouteType> = []
        if (retailStoreFromOtherRoutes.length) {
            ctr = await VisitService.syncDownExtraDataForProduct(retailStoreFromOtherRoutes)
        }
        let curRouteCTR: Array<CustomerToRouteType> = []
        if (retailStoreFromRoutes) {
            const param = getIdClause(_.uniq(retailStoreFromRoutes.map((el) => el.AccountId)))
            curRouteCTR = await VisitDM.getCurRoute(param)
        }
        await VisitDM.upsertVisitData({
            vlId,
            addVisitList,
            todayDate,
            vlSoupEntryId,
            now,
            userVlsCount,
            ctr,
            curRouteCTR
        })
        await SyncUpService.syncUpLocalData()
    }

    static async getTodayVisitsWithOrderInProgress(visit?: any) {
        const visits = await VisitDM.getTodayVisitsWithOrderInProgress()
        const inProgressVisit = visits.find(
            (vis) =>
                vis['Vis._soupEntryId'] !== visit?._soupEntryId &&
                vis['Vis.Status__c'] === VisitStatus.IN_PROGRESS &&
                vis.Visit_List_Subtype__c === VisitListSubtype.USER_VISIT_LIST
        )
        const inProgressOrder = visits.find(
            (vis) =>
                (visit?.OrderCartIdentifier &&
                    vis['Vis.Order_Cart_Identifier__c'] !== visit?.OrderCartIdentifier &&
                    Number(vis['CI.Quantity']) > 0) ||
                (visit?.VisitLegacyId &&
                    vis['Vis.Visit_Legacy_ID__c'] !== visit?.VisitLegacyId &&
                    Number(vis['CI.Quantity']) > 0) ||
                (!visit && Number(vis['CI.Quantity']) > 0)
        )
        return {
            inProgressOrder: inProgressOrder,
            inProgressVisit: inProgressVisit
        }
    }

    public static async syncUpVLLocalData() {
        await VisitDM.syncUpVLLocalData()
    }

    public static async syncUpVisitLocalData() {
        await VisitDM.syncUpVisitLocalData()
    }

    public static async retrieveVisitBySoupEntryId(soupEntryId: string) {
        return await VisitDM.retrieveVisitBySoupEntryId(soupEntryId)
    }

    public static async updatedVisit(visit: MyDayVisitModel) {
        const visits = await this.retrieveVisitBySoupEntryId(visit._soupEntryId)
        if (visits && visits.length > 0) {
            const currentVisit = visits[0]
            const order = await OrderDM.getAllVisitRelatedOrderData(currentVisit.Id, currentVisit._soupEntryId)
            return {
                ...visit,
                Id: currentVisit.Id,
                Status: currentVisit.Status__c,
                ActualEndTime: currentVisit.ActualVisitEndTime,
                ActualStartTime: currentVisit.ActualVisitStartTime,
                User: currentVisit.User__c,
                completedOrder: order.length,
                onGoingOrderNum: order?.filter(
                    (item: any) => item.ord_lne_actvy_cde__c === OrderLineActivityCde.DELIVERY
                ).length
            }
        }
        return visit
    }

    private static async isStartDay() {
        const vls = await VisitDM.getInProgressVisitList()
        if (vls && vls.length > 0) {
            return true
        }
        return false
    }

    private static async startDayFirst(visit: MyDayVisitModel, dropDownRef: any) {
        // only start day when there is no visit list which is in progress and the visit is not in progress
        if (visit.Status === VisitStatus.IN_PROGRESS) {
            return
        }
        const visitsData: VisitListDataModel = await this.fetchVisitDataByDay(todayDateWithTimeZone(true), dropDownRef)
        const isDayStart = await this.isStartDay()
        // if not start day, then start day first
        if (!isDayStart) {
            await this.startDay(visitsData.userVisitLists, true)
        }
    }

    private static async retryToUpdateVisit(
        updateVisit: any,
        errorTraceClass: string,
        retryCount: number,
        dropDownRef: any
    ) {
        if (retryCount > 0) {
            try {
                await VisitDM.upsertVisit(updateVisit)
            } catch (err) {
                retryCount = retryCount - 1
                this.retryToUpdateVisit(updateVisit, errorTraceClass, retryCount, dropDownRef)
                if (retryCount === 0) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        errorTraceClass,
                        `orderade get position failed for starting visit: ${JSON.stringify(err)}`
                    )
                    dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_VISIT_DETAIL_ERROR, err)
                }
            }
        }
    }

    private static checkIfInFence(location: any, store?: MyDayVisitModel) {
        if (!store) {
            return false
        }
        const isInFence = getInLocation(location, store)
        return isInFence
    }

    private static async startVisit(visit: MyDayVisitModel, dropDownRef: any) {
        const now = moment().toISOString()
        const updateVisit = {
            Id: visit.Id,
            _soupEntryId: visit._soupEntryId,
            ActualVisitStartTime: now,
            Status__c: VisitStatus.IN_PROGRESS,
            Check_In_Location__Latitude__s: '0',
            Check_In_Location__Longitude__s: '0',
            Check_In_Location_Flag__c: false,
            User__c: CommonParam.userId,
            User_Visit_List__c: '',
            userVlRefId: '',
            ASAS_Compliant__c: visit?.inGeoFence
        }
        const vls = await VisitDM.getInProgressVisitList()
        if (vls && vls.length > 0) {
            updateVisit.User_Visit_List__c = vls[0].Id
            if (!vls[0].Id) {
                updateVisit.userVlRefId = vls[0]._soupEntryId
            }
        }
        const errorTraceClass = 'Orderade: StartVisit'
        try {
            const position = await LocationService.getCurrentPosition()
            if (position && position.coords) {
                const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                updateVisit.Check_In_Location__Latitude__s = coords.latitude
                updateVisit.Check_In_Location__Longitude__s = coords.longitude
                updateVisit.Check_In_Location_Flag__c = this.checkIfInFence(position, visit)
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                errorTraceClass,
                `orderade get position failed for starting visit: ${JSON.stringify(err)}`
            )
        }
        // update to local
        try {
            await VisitDM.upsertVisit(updateVisit)
        } catch (err) {
            this.retryToUpdateVisit(updateVisit, errorTraceClass, 3, dropDownRef)
        }
        // sync up
        await SyncUpService.syncUpLocalData()
    }

    private static async endVisit(visit: MyDayVisitModel, dropDownRef: any) {
        // update related field
        const now = moment().toISOString()
        const updateVisit = {
            Id: visit.Id,
            _soupEntryId: visit._soupEntryId,
            ActualVisitEndTime: now,
            Status__c: VisitStatus.COMPLETE,
            Check_Out_Location__Latitude__s: '0',
            Check_Out_Location__Longitude__s: '0',
            Check_Out_Location_Flag__c: false
        }
        // update to local
        const errorTraceClass = 'Orderade: EndVisit'
        try {
            const position = await LocationService.getCurrentPosition()
            if (position && position.coords) {
                const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                updateVisit.Check_Out_Location__Latitude__s = coords.latitude
                updateVisit.Check_Out_Location__Longitude__s = coords.longitude
                updateVisit.Check_Out_Location_Flag__c = this.checkIfInFence(position, visit)
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                errorTraceClass,
                `orderade get position failed for ending visit: ${JSON.stringify(err)}`
            )
        }
        try {
            await VisitDM.upsertVisit(updateVisit)
        } catch (err) {
            this.retryToUpdateVisit(updateVisit, errorTraceClass, 3, dropDownRef)
        }
        // sync up
        await SyncUpService.syncUpLocalData()
    }

    public static async startOrEndMyVisit(visit: MyDayVisitModel, isVisitStart: boolean, dropDownRef: any) {
        if (!isVisitStart) {
            await this.startDayFirst(visit, dropDownRef)
            await this.startVisit(visit, dropDownRef)
        } else {
            await this.endVisit(visit, dropDownRef)
        }
    }

    public static async fetchRetailStoreData(storeId: string, dropDownRef: any) {
        return VisitDM.fetchRetailStoreData(storeId, dropDownRef)
    }

    private static tempStoreItem = (store: any) => {
        return {
            AccountId: store.AccountId,
            Name: store.Name,
            Street: store.Street || '',
            City: store.City || '',
            State: store.State || '',
            StateCode: store.StateCode || '',
            PostalCode: store.PostalCode || '',
            Id: store.Id,
            isAdded: false,
            CustomerId: store['Account.CUST_UNIQ_ID_VAL__c'],
            IsOTS: store.IsOTS,
            CDAMedal: store.CDAMedal,
            RouteId: store.RouteId,
            GTMUId: store.GTMUId
        }
    }

    static async setRetailStoreDataBySearch(
        searchStr: string,
        addVisitList: Array<AddVisitModel>,
        setRsData: Function
    ) {
        const searchText = searchStr
            .replaceAll("'", '%')
            .replaceAll('`', '%')
            .replaceAll('‘', '%')
            .replaceAll('’', '%')
            .replaceAll('}', '')
            .replaceAll('｝', '')
            .replaceAll('{', '')
            .replaceAll('｛', '')
        const res = await AccountDM.getRetailStoreBySearch(searchText)
        if (res && res.length > 0) {
            const map: MapType = {}
            res.forEach((el) => {
                if (!map[el.Id] || map[el.Id].RouteId !== CommonParam.userRouteId) {
                    map[el.Id] = el
                }
            })
            const _res = Object.values(map)
            const tempStoreList: Array<AddVisitModel> = []
            const addedVisits = [...addVisitList]
            const deepCopy = _.cloneDeep(_res)
            const records = !_.isEmpty(searchText)
                ? [
                      ...deepCopy.filter((a) => a.RouteId === CommonParam.userRouteId),
                      ...deepCopy.filter((a) => a.RouteId !== CommonParam.userRouteId)
                  ]
                : [
                      ...deepCopy
                          .filter((a) => a.RouteId === CommonParam.userRouteId)
                          .sort((a, b) => `${a.Name ?? ''}`.localeCompare(`${b.Name ?? ''}`)),
                      ...deepCopy
                          .filter((a) => a.RouteId !== CommonParam.userRouteId)
                          .sort((a, b) => `${a.Name ?? ''}`.localeCompare(`${b.Name ?? ''}`))
                  ]
            records.forEach((store) => {
                const item = VisitService.tempStoreItem(store)
                if (addedVisits.find((vis) => item.Id === vis.Id)) {
                    item.isAdded = true
                }
                tempStoreList.push(item)
            })
            return setRsData(tempStoreList)
        }
        return setRsData([])
    }

    public static async updateRemovedVisitIntoSoup(soupEntryId: any) {
        return await VisitDM.updateRemovedVisitIntoSoup(soupEntryId)
    }

    private static async updateVisitListWithPatch(patch: Partial<LocalVisitListModal>, fromStartVisit = false) {
        await VisitDM.updateVisitListIntoSoup(patch)
        if (!fromStartVisit) {
            SyncUpService.syncUpLocalData()
        }
    }

    public static async startDay(userVLs: VisitList[], fromStartVisit = false) {
        const availableVl = userVLs.find(
            (one) => one.Status === VisitListStatus.IN_PROGRESS || one.Status === VisitListStatus.NOT_STARTED
        )
        const visitListSequence = userVLs.length + 1
        const RecordTypeId = await CommonDM.getRecordTypeIdByRecordTypeName('Sales Daily Visit List')
        const safeFirstName = `${CommonParam.userInfo.FirstName}`.substring(0, 27)
        const safeLastName = `${CommonParam.userInfo.LastName}`.substring(0, 27)
        const safeGPID = `${CommonParam.GPID__c}`.substring(0, 80)
        let userVL
        // if we need to insert userVl before start visit, then this vl should be not started without time related fields.
        if (fromStartVisit) {
            if (!availableVl) {
                // create user vl with status not started, do not set start time and location
                userVL = {
                    User__c: CommonParam.userId,
                    Status__c: VisitListStatus.NOT_STARTED,
                    Location_Id__c: CommonParam.userLocationId,
                    OwnerId: CommonParam.userId,
                    Visit_Date__c: todayDateWithTimeZone(true),
                    RecordTypeId,
                    Name: `${todayDateWithTimeZone(true)} - ${safeFirstName} ${safeLastName} - ${visitListSequence}`,
                    Visit_List_Subtype__c: 'User Visit List',
                    Visit_List_Legacy_ID__c: `${safeGPID}_${todayDateWithTimeZone(true)}_${visitListSequence}`
                }
            } else {
                return
            }
        } else {
            // if we have not started vl created before start visit, just update it
            if (availableVl) {
                userVL = {
                    _soupEntryId: availableVl._soupEntryId,
                    Start_Date_Time__c: new Date().toISOString(),
                    Status__c: VisitListStatus.IN_PROGRESS,
                    Start_Location__Latitude__s: '0',
                    Start_Location__Longitude__s: '0',
                    Start_Date__c: todayDateWithTimeZone(true)
                }
                // create new visit
            } else {
                userVL = {
                    User__c: CommonParam.userId,
                    Start_Date_Time__c: new Date().toISOString(),
                    Status__c: VisitListStatus.IN_PROGRESS,
                    Location_Id__c: CommonParam.userLocationId,
                    OwnerId: CommonParam.userId,
                    Visit_Date__c: todayDateWithTimeZone(true),
                    RecordTypeId,
                    Name: `${todayDateWithTimeZone(true)} - ${safeFirstName} ${safeLastName} - ${visitListSequence}`,
                    Visit_List_Subtype__c: 'User Visit List',
                    Visit_List_Legacy_ID__c: `${safeGPID}_${todayDateWithTimeZone(true)}_${visitListSequence}`,
                    Start_Location__Latitude__s: '0',
                    Start_Location__Longitude__s: '0',
                    Start_Date__c: todayDateWithTimeZone(true)
                }
                const logMsg = `User Visit List has been generated for ${CommonParam.GPID__c} at ${formatWithTimeZone(
                    moment(),
                    TIME_FORMAT.YMDTHMS,
                    true,
                    true
                )}`
                appendLog(Log.MOBILE_INFO, 'orderade: create user visit list', logMsg)
            }
        }

        const errorTraceInfo = {
            UserId: CommonParam.userId,
            VisitListLegacyId: userVL?.Visit_List_Legacy_ID__c || ''
        }
        const errorTraceClass = 'Orderade: MyDayStartMyDay'
        try {
            const position = await LocationService.getCurrentPosition()
            if (position?.coords) {
                const formattedCoords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                userVL.Start_Location__Latitude__s = formattedCoords.latitude
                userVL.Start_Location__Longitude__s = formattedCoords.longitude
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                errorTraceClass,
                `Orderade Start My Day Location Error: ${JSON.stringify(errorTraceInfo)} ${JSON.stringify(e)}`
            )
        } finally {
            if (userVL.Start_Location__Latitude__s === '0' || userVL.Start_Location__Longitude__s === '0') {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    errorTraceClass,
                    `Orderade Start My Day Location Error: ${JSON.stringify(errorTraceInfo)}`
                )
            }
        }
        return this.updateVisitListWithPatch(userVL, fromStartVisit)
    }

    public static async endDay(userVLs: VisitList[]) {
        const inProgressVisit = userVLs.find((one) => {
            return one.Status === VisitListStatus.IN_PROGRESS
        })
        const patch = {
            _soupEntryId: inProgressVisit?._soupEntryId,
            Status__c: VisitListStatus.COMPLETED,
            End_Date__c: todayDateWithTimeZone(true),
            End_Date_Time__c: new Date().toISOString(),
            End_Location__Latitude__s: '0',
            End_Location__Longitude__s: '0'
        }
        const errorTraceInfo = {
            UserId: CommonParam.userId,
            VisitListLegacyId: inProgressVisit?.VisitListLegacyId || ''
        }
        const errorTraceClass = 'Orderade: MyDayEndMyDay'
        try {
            const position = await LocationService.getCurrentPosition()
            if (position?.coords) {
                const formattedCoords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                patch.End_Location__Latitude__s = formattedCoords.latitude
                patch.End_Location__Longitude__s = formattedCoords.longitude
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                errorTraceClass,
                `Orderade End My Day Location Error: ${JSON.stringify(errorTraceInfo)} ${JSON.stringify(e)}`
            )
        } finally {
            if (patch.End_Location__Latitude__s === '0' || patch.End_Location__Longitude__s === '0') {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    errorTraceClass,
                    `Orderade End My Day Location Error: ${JSON.stringify(errorTraceInfo)}`
                )
            }
        }
        await this.updateVisitListWithPatch(patch)
    }

    public static async getCurrentVisitByVisitId(visitId: string) {
        return await VisitDM.getCurrentVisitByVisitId(visitId)
    }

    static checkIsAnyCurrentUserVisitsInProgress(
        inputDate: string,
        setInProgressVisit: Function,
        allData: Array<Partial<MyDaySectionListData>>,
        dropDownRef: any
    ) {
        const outputValue = false
        if (_.isEmpty(allData) || _.isEmpty(allData[0].data)) {
            setInProgressVisit(!outputValue)
            return
        }
        VisitDM.checkIsAnyCurrentUserVisitsInProgress(inputDate, setInProgressVisit, dropDownRef)
    }

    private static getStatusLabelWithVisits(visitArr: any) {
        const proVisits = visitArr.filter((visitItem: any) => visitItem.Status__c === VisitStatus.IN_PROGRESS)
        const plannedVisits = visitArr.filter((visitItem: any) => visitItem.Status__c === VisitStatus.PUBLISHED)
        const compVisits = visitArr.filter((visitItem: any) => visitItem.Status__c === VisitStatus.COMPLETE)
        if (_.size(proVisits) > 0) {
            return {
                statusString: VisitStatus.IN_PROGRESS,
                statusLang: t.labels.PBNA_MOBILE_IN_PROGRESS
            }
        }
        if (_.size(proVisits) === 0 && _.size(plannedVisits) > 0) {
            return {
                statusString: VisitStatus.PUBLISHED,
                statusLang: t.labels.PBNA_MOBILE_NOT_STARTED
            }
        }
        if (_.size(proVisits) === 0 && _.size(plannedVisits) === 0 && _.size(compVisits) > 0) {
            return {
                statusString: VisitStatus.COMPLETE,
                statusLang: t.labels.PBNA_MOBILE_COMPLETED
            }
        }
        return {
            statusString: '',
            statusLang: ''
        }
    }

    private static getActionIconNameWithVisits(visitArr: any) {
        const delVisits = visitArr.filter((visitItem: any) => visitItem['RecordType.Name'] === RecordTypeEnum.DELIVERY)
        const merchVisits = visitArr.filter(
            (visitItem: any) => visitItem['RecordType.Name'] === RecordTypeEnum.MERCHANDISING
        )
        const saleVisits = visitArr.filter((visitItem: any) => visitItem['RecordType.Name'] === RecordTypeEnum.SALES)
        const actionNames = []
        if (_.size(delVisits) > 0) {
            actionNames.push(RecordTypeEnum.DELIVERY)
        }
        if (_.size(merchVisits) > 0) {
            actionNames.push(RecordTypeEnum.MERCHANDISING)
        }
        if (_.size(saleVisits) > 0) {
            actionNames.push(RecordTypeEnum.SALES)
        }
        return actionNames
    }

    static groupDataWithRetailStore(originData: any[]) {
        const groupedStore = _.groupBy(originData, 'RetailStoreId')
        return _.values(groupedStore).map((storeArr) => {
            const eleFirst = _.size(storeArr) > 0 ? storeArr[0] : {}
            const groupedUser = _.groupBy(storeArr, 'UserId')
            const userData: any = []
            _.values(groupedUser).forEach((userVisitArr) => {
                const groupedVisits = _.groupBy(userVisitArr, 'RecordType.Name')
                const visitData = _.values(groupedVisits).map((visitArr, indexVisit) => {
                    const visitFirst = _.size(visitArr) > 0 ? visitArr[0] : {}
                    const adHocVisits = visitArr.filter(
                        (visitItem: any) =>
                            visitItem.AdHoc === '1' && visitItem['RecordType.Name'] === RecordTypeEnum.SALES
                    )
                    const hadOff = visitArr.filter((visitItem: any) => visitItem.OrderCount > 0)

                    const statusData = VisitService.getStatusLabelWithVisits(visitArr)
                    return {
                        UserId: visitFirst?.UserId,
                        UserName: visitFirst?.UserName,
                        LastName: visitFirst?.LastName,
                        FirstName: visitFirst?.FirstName,
                        userStatsId: visitFirst?.UserStatsId,
                        visits: visitArr,
                        showOffScheduleIcon: _.size(adHocVisits) > 0 && _.size(hadOff) > 0,
                        statusString: statusData?.statusString,
                        statusLang: statusData?.statusLang,
                        actionIcons: VisitService.getActionIconNameWithVisits(visitArr),
                        showRadius: indexVisit + 1 === _.size(visitArr)
                    }
                })
                userData.push(...visitData)
            })
            return {
                isRouteInfo: true,
                City: eleFirst?.City,
                StoreName: eleFirst?.StoreName,
                State: eleFirst?.State,
                StateCode: eleFirst?.StateCode,
                PostalCode: eleFirst?.PostalCode,
                RetailStoreId: eleFirst?.RetailStoreId,
                Street: eleFirst?.Street,
                CustUniqId: eleFirst['Account.CUST_UNIQ_ID_VAL__c'],
                'Account.CUST_UNIQ_ID_VAL__c': eleFirst['Account.CUST_UNIQ_ID_VAL__c'],
                AccountId: eleFirst?.AccountId,
                PhoneNum: eleFirst['Account.Phone'],
                Latitude: eleFirst?.Latitude,
                Longitude: eleFirst?.Longitude,
                CustomerLongitude: eleFirst?.Customer_Longitude__c,
                CustomerLatitude: eleFirst?.Customer_Latitude__c,
                Geofence__c: eleFirst?.Geofence__c,
                'Account.IsOTSCustomer__c': eleFirst['Account.IsOTSCustomer__c'],
                'Account.CDA_Medal__c': eleFirst['Account.CDA_Medal__c'],
                'Account.Is_Customer_PO_Number_Required__c': eleFirst['Account.Is_Customer_PO_Number_Required__c'],
                IsOTS: eleFirst['Account.IsOTSCustomer__c'],
                CDAMedal: eleFirst['Account.CDA_Medal__c'],
                users: userData
            }
        })
    }

    static async getRouteInfoVisitData(selectedDate: string, setRouteInfoData: Function) {
        const statsId = await getRecordTypeIdByDeveloperName('Stats', 'User_Stats__c')
        const res: any = await VisitDM.getRouteInfoVisitData(selectedDate, statsId)
        if (res) {
            setRouteInfoData([
                {
                    route: CommonParam.userRouteId,
                    data: VisitService.groupDataWithRetailStore(res),
                    index: 0
                }
            ])
        }
    }

    static syncDownCurUserUVLs = VisitDM.syncDownCurUserUVLs
    static syncDownUVLVisits = VisitDM.syncDownUVLVisits
    static getCustUniqIdsFromVisitOnOtherRoutes = VisitDM.getCustUniqIdsFromVisitOnOtherRoutes

    public static async syncUpCurrentVisit(visitId: string) {
        await VisitDM.syncUpCurrentVisit(visitId)
    }
}

export default VisitService
