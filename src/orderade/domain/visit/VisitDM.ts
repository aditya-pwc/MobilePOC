import moment from 'moment'
import { MyDayVisitListModel, VisitList, VisitListDataModel } from '../../interface/VisitListModel'
import { VisitStatus } from '../../enum/VisitType'
import { addDaysToToday, getLastSundayDate, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import { VisitListSubtype } from '../../enum/VisitListSubtype'
import { TodayMetricProps } from '../../component/visits/VisitMetric'
import OrderData from '../order/OrderData'
import { MapType, VisitModel } from '../../interface/Visit'
import VisitData from './VisitData'
import { checkInRange } from '../../service/LocationService'
import { allLabels } from '../../../common/i18n/AllLabels'
import VisitSync from './VisitSync'
import { RetailStoreModel } from '../../pages/MyDayScreen/MyVisitDetailViewModel'
import { VisitListStatus } from '../../enum/VisitListStatus'
import { RecordType } from '../../interface/RecordTypeModel'
import CommonData from '../common/CommonData'
import BaseInstance from '../../../common/BaseInstance'
import VisitQueries from '../../queries/VisitQueries'
import { AddVisitModel } from '../../interface/AddVisitModel'
import { LocalVisitListModal } from '../../interface/Visit_List__c'
import { CustomerToRouteType } from '../../interface/CustomerToRoute'
import { getIdClause } from '../../../common/utils/CommonUtils'
import SyncUpService from '../../service/SyncUpService'

interface UpsertVisitDataInput {
    vlId: string
    addVisitList: Array<AddVisitModel>
    todayDate: string
    vlSoupEntryId: string
    now: number
    userVlsCount: number
    ctr: Array<CustomerToRouteType>
    curRouteCTR: Array<CustomerToRouteType>
}

class VisitDM {
    static mapVisitListToInteface = (input: any): Array<VisitList> => {
        if (!input || !input.length) {
            return []
        }
        return input.map((el: any) => {
            return {
                Id: el.Id,
                _soupEntryId: el._soupEntryId,
                Name: el.Name,
                OwnerId: el.OwnerId,
                LastModifiedDate: el.LastModifiedDate,
                StartDate: el.Start_Date__c,
                EndDate: el.End_Date__c,
                StartDateTime: el.Start_Date_Time__c,
                EndDateTime: el.End_Date_Time__c,
                VisitDate: el.Visit_Date__c,
                RecordTypeId: el.RecordTypeId,
                Status: el.Status__c,
                LocationId: el.Location_Id__c,
                RecordTypeDeveloperName: el['RecordType.DeveloperName'],
                VisitListSubtype: el.Visit_List_Subtype__c,
                VisitListLegacyId: el.Visit_List_Legacy_ID__c
            }
        })
    }

    static getUserVLFormatted = async (inputDate: string): Promise<Array<VisitList>> => {
        // default all fields are missing _soupEntryId, so here is a walkaround
        const userVLs = await VisitData.getUserVLData(inputDate)
        return this.mapVisitListToInteface(userVLs).sort((a, b) => {
            if (a.StartDateTime && b.StartDateTime) {
                return moment(a.StartDateTime).unix() - moment(b.StartDateTime).unix()
            }
            return a.StartDateTime ? -1 : 1
        })
    }

    static filterPastVisits = (visits: any, userVl: Array<string>) => {
        if (_.isEmpty(visits)) {
            return visits
        }
        const filteredVisits: any = visits.filter((visit: any) => {
            // Include Visits where User Visit List field = Logged In User and Status__c = In Progress or Completed
            // And Not started (published) Visits where Completed Order on the visit has Created By = Logged In User
            if (_.isEmpty(userVl)) {
                return visit.myOrders > 0 && visit['Vis.Status__c'] === VisitStatus.PUBLISHED
            }
            return (
                (userVl.includes(`${visit['Vis.User_Visit_List__c']}`) &&
                    (visit['Vis.Status__c'] === VisitStatus.IN_PROGRESS ||
                        visit['Vis.Status__c'] === VisitStatus.COMPLETE)) ||
                (visit.myOrders > 0 && visit['Vis.Status__c'] === VisitStatus.PUBLISHED)
            )
        })
        return filteredVisits
    }

    private static excludeNullDate = (date: string | null, date1: string | null, date2: string | null) => {
        return [date, date1, date2].filter((item) => item != null)
    }

    static mapVisitData = (vis: any) => {
        return {
            Id: vis['Vis.Id'],
            ScheduledCaseQuantity: vis['Vis.Scheduled_Case_Quantity__c'],
            PlaceId: vis['Vis.PlaceId'],
            Status: vis['Vis.Status__c'],
            VisitListId: vis['Vis.Visit_List__c'],
            ActualStartTime: vis['Vis.ActualVisitStartTime'],
            ActualEndTime: vis['Vis.ActualVisitEndTime'],
            ActualEndTimeUnix: moment(vis['Vis.ActualVisitEndTime']).unix(),
            City: vis['RS.City'],
            StoreName: vis['RS.Name'],
            State: vis['RS.State'],
            StateCode: vis['RS.StateCode'],
            PostalCode: vis['RS.PostalCode'],
            RetailStoreId: vis['RS.Id'],
            Street: vis['RS.Street'],
            AdHoc: vis['Vis.Ad_Hoc__c'] === '1',
            CustUniqId: vis['RS.Account.CUST_UNIQ_ID_VAL__c'],
            AccountId: vis['RS.AccountId'],
            PhoneNum: vis['RS.Account.Phone'],
            Latitude: vis['RS.Latitude'],
            Longitude: vis['RS.Longitude'],
            Geofence: vis['RS.Geofence__c'],
            Is_Customer_PO_Number_Required__c: vis['RS.Account.Is_Customer_PO_Number_Required__c'],
            Single_Unit_Return__c: vis['RS.Account.Single_Unit_Return__c'],
            WorkOrders: vis.workOrders,
            CompletedWorkOrders: vis.completedWorkOrders,
            SchPlt: vis.schPlt,
            DelCs: vis.delCs,
            CustomerLongitude: vis['RS.Customer_Longitude__c'],
            CustomerLatitude: vis['RS.Customer_Latitude__c'],
            ReturnCs: vis.returnCs,
            ReturnUn: vis.returnUn,
            SoldQty: vis.soldQty,
            totalOrder: (vis.offlineOrders ? 1 : 0) + (vis.onlineOrders ? parseInt(vis.onlineOrders) : 0),
            completedOrder: vis.onlineOrders ? parseInt(vis.onlineOrders) : 0,
            PlannedCs: vis['Vis.Cases_Goal_Quantity__c'],
            RecordTypeDeveloperName: vis['RT.DeveloperName'],
            _soupEntryId: vis['Vis._soupEntryId'],
            User: vis['Vis.User__c'],
            UserName: vis['Vis.User__r.Name'],
            UserVisitList: vis['Vis.User_Visit_List__c'],
            UserVlRefId: vis['Vis.userVlRefId'],
            VlRefId: vis['Vis.vlRefId'],
            RteId: vis['Vis.RTE_ID__c'],
            GTMUId: vis['Vis.RTE_ID__r.GTMU_RTE_ID__c'],
            VlSubType: vis.Visit_List_Subtype__c,
            VlDate: vis.Visit_Date__c,
            OrderCartIdentifier: vis['Vis.Order_Cart_Identifier__c'],
            VisitLegacyId: vis['Vis.Visit_Legacy_ID__c'],
            IsOTS: vis['RS.Account.IsOTSCustomer__c'],
            CDAMedal: vis['RS.Account.CDA_Medal__c'],
            VDelDate: vis['Vis.Delivery_Date__c'],
            VDelDate2: vis['Vis.Delivery_Date2__c'],
            VDelDate3: vis['Vis.Delivery_Date3__c'],
            VNDelDate: vis['Vis.Next_Delivery_Date__c'],
            VNDelDate2: vis['Vis.Next_Delivery_Date2__c'],
            VNDelDate3: vis['Vis.Next_Delivery_Date3__c'],
            VDelGroup: this.excludeNullDate(
                vis['Vis.Delivery_Date__c'],
                vis['Vis.Delivery_Date2__c'],
                vis['Vis.Delivery_Date3__c']
            ),
            onGoingOrderNum: vis.onGoingOrderNum,
            DeliveryMethodCode: vis['Vis.Customer_to_Route__r.DELY_MTHD_CDE__c'],
            inGeoFence: vis.inGeoFence,
            ASASCompliant: vis['Vis.ASAS_Compliant__c'] === '1'
        }
    }

    static isVisitNotStartedOrInProgress(v: MyDayVisitModel) {
        return (
            [VisitStatus.PUBLISHED, VisitStatus.NOT_STARTED, VisitStatus.IN_PROGRESS].indexOf(
                v.Status as VisitStatus
            ) !== -1
        )
    }

    static sortByRetailStoreName(a: MyDayVisitModel, b: MyDayVisitModel) {
        return a.StoreName > b.StoreName ? 1 : -1
    }

    static async calculateMetricsData(
        visitsData: Array<MyDayVisitModel>,
        isPast: boolean,
        inputDate: string
    ): Promise<TodayMetricProps> {
        let totalVisits = 0
        let completedVisits = 0
        let returnCs = 0
        let returnUn = 0
        let plannedCs = 0
        const visitWithoutEvent = visitsData.filter((v) => !v.Subject)
        const visits = visitWithoutEvent.filter(
            (v) =>
                (v.RteId !== CommonParam.userRouteId && v.Status !== allLabels.PBNA_MOBILE_PUBLISHED) ||
                v.RteId === CommonParam.userRouteId ||
                v.AdHoc
        )
        const currentPsrSoldCases = await OrderData.fetchOrderMetrics(isPast, inputDate)
        if (!_.isEmpty(visits)) {
            totalVisits += visits.length
            visits.forEach((visit) => {
                if (
                    (visit.Status === VisitStatus.COMPLETE && visit.User === CommonParam.userId) ||
                    (visit.Status === VisitStatus.COMPLETE && visit.GTMUId === CommonParam.userRouteGTMUId)
                ) {
                    completedVisits++
                }
                returnCs += visit?.ReturnCs || 0
                returnUn += visit?.ReturnUn || 0
                plannedCs += visit?.PlannedCs || 0
            })
        }
        return {
            statusTotal: {
                total: totalVisits,
                completed: completedVisits,
                remaining: totalVisits - completedVisits
            },
            caseInfo: {
                plannedCases: plannedCs,
                casesSold: currentPsrSoldCases,
                returnsCS: returnCs,
                returnsUN: returnUn
            }
        }
    }

    static groupUserRemainVisits(userRemainVisits: Array<MyDayVisitModel>) {
        const userRemainVisitsGroup: MapType = {}
        const grouped: Array<MyDayVisitListModel> = []
        userRemainVisits.forEach((v) => {
            if (!userRemainVisitsGroup[v.GTMUId]) {
                userRemainVisitsGroup[v.GTMUId] = []
            }
            userRemainVisitsGroup[v.GTMUId].push(v)
        })
        Object.keys(userRemainVisitsGroup)
            .sort((a, b) => {
                return a > b ? 1 : -1
            })
            .forEach((key) => {
                const visits = userRemainVisitsGroup[key].sort(this.sortByRetailStoreName)
                grouped.push({
                    route: key,
                    data: visits,
                    meta: 'In Progress Not Started On User VL'
                })
            })
        return grouped
    }

    static async mapVisitResultToView(
        visitData: Array<MyDayVisitModel>,
        userVLs: Array<VisitList>,
        isPast: boolean,
        inputDate: string
    ): Promise<VisitListDataModel> {
        const mappingResult: VisitListDataModel = {
            myVisitsSectionList: [],
            metric: null,
            userVisitLists: userVLs
        }

        // for now we are not rendering events
        let formattedVisitData = visitData
            .filter((v) => {
                return !v.Subject
            })
            .map((v) => {
                return this.mapVisitData(v)
            })
        // de-duplicate the visits, because of the join, a single visit may have 2 records, one joined with routeVl, one with userVl
        // according to the requirement, userVl is higher priority.
        const dedupMap: MapType = {}
        const adhocsInLocal: Array<MyDayVisitModel> = []
        formattedVisitData.forEach((v) => {
            // for local visit not yet synced, we don't have id for de-dup and no need to de-dup
            // we directly use this v
            if (!v.Id && v.AdHoc) {
                adhocsInLocal.push(v)
            } else if (!dedupMap[v.Id] || dedupMap[v.Id].VlSubType === 'Route Visit List') {
                dedupMap[v.Id] = v
            }
        })
        formattedVisitData = _.values(dedupMap).concat(adhocsInLocal)

        // we will render this using a section list with list header and footer as timestamp
        // IMPORTANT! DO NOT use User_Visit_List__c or Visit_List__c field on visit to group the data
        // before VL sync up, visit is bind to VL using refId, the fields above could be empty
        let myVisitsSectionList: Array<MyDayVisitListModel> = []

        // In progress / Not started visits on current route
        // ordered by store name asc
        // also ad-hoc visits on current route is also displayed here
        // above the route visit, and sorted within themselves (new update)
        let routeRemainVisits = formattedVisitData.filter((v) => {
            return v.GTMUId === CommonParam.userRouteGTMUId && this.isVisitNotStartedOrInProgress(v)
        })
        routeRemainVisits = [
            ...routeRemainVisits.filter((v) => v.AdHoc).sort(this.sortByRetailStoreName),
            ...routeRemainVisits.filter((v) => !v.AdHoc).sort(this.sortByRetailStoreName)
        ]
        routeRemainVisits.length &&
            myVisitsSectionList.push({
                route: CommonParam.userRouteGTMUId,
                data: routeRemainVisits,
                meta: 'In Progress Not Started On Route (Including ad-hoc on same route)'
            })

        // In progress / Not started ad-hoc visits on user vl
        // sectioned by route, section ordered by route id numerically
        // also ad hoc on the top， normal route vl visits on bottom
        // inside section ordered by store name asc
        // ad-hoc visits on current route is moved to the first block (new update)
        const userRemainVisits = formattedVisitData.filter((v) => {
            return (
                v.VlSubType === VisitListSubtype.USER_VISIT_LIST &&
                v.GTMUId !== CommonParam.userRouteGTMUId &&
                this.isVisitNotStartedOrInProgress(v)
            )
        })
        myVisitsSectionList = myVisitsSectionList.concat(
            this.groupUserRemainVisits(userRemainVisits.filter((one) => one.AdHoc))
        )
        myVisitsSectionList = myVisitsSectionList.concat(
            this.groupUserRemainVisits(userRemainVisits.filter((one) => !one.AdHoc))
        )

        // Orders completed by current user
        // ordered by end time, if consecutive visit are in same route, merge them into a section
        let curRouteGroup = {
            route: '',
            data: [] as Array<MyDayVisitModel>,
            meta: 'Completed by Current User'
        }
        const completedVisitByCurrentUser = formattedVisitData.filter((v) => {
            return (
                v.VlSubType === VisitListSubtype.USER_VISIT_LIST &&
                v.User === CommonParam.userId &&
                v.Status === VisitStatus.COMPLETE
            )
        })
        const completedEventsByCurrentUser = visitData.filter((v) => {
            return v.Subject
        })
        completedEventsByCurrentUser.forEach((e) => (e.ActualEndTimeUnix = moment(e.ActualEndTime).unix()))
        const completedVisitsAndEventsByCurrentUser = [...completedVisitByCurrentUser, ...completedEventsByCurrentUser]
        completedVisitsAndEventsByCurrentUser.sort((a, b) => {
            return a.ActualEndTimeUnix - b.ActualEndTimeUnix
        })
        completedVisitsAndEventsByCurrentUser.forEach((v) => {
            if (v?.GTMUId !== curRouteGroup.route && v?.GTMUId) {
                curRouteGroup.data.length && myVisitsSectionList.push(curRouteGroup)
                curRouteGroup = {
                    route: '',
                    data: [] as Array<MyDayVisitModel>,
                    meta: 'Completed by Current User'
                }
                curRouteGroup.route = v.GTMUId
                curRouteGroup.data = [v]
            } else {
                curRouteGroup.data.push(v)
            }
        })
        curRouteGroup.data.length && myVisitsSectionList.push(curRouteGroup)

        // even sections from different blocks should be merged if from the same route
        // eg. the route123 from the bottom of block1 should be merged with the route123 from the top of block2
        const myVisitsSectionListMerge: Array<MyDayVisitListModel> = []
        myVisitsSectionList.forEach((el) => {
            const last = myVisitsSectionListMerge[myVisitsSectionListMerge.length - 1]
            if (!last || last.route !== el.route) {
                myVisitsSectionListMerge.push(el)
            } else {
                last.data = (last.data || []).concat(el.data || [])
            }
        })
        myVisitsSectionList = myVisitsSectionListMerge

        // Orders completed on this route by another user
        // sectioned by user, section ordered by the end time of first visit inside section
        // visits ordered by end time inside section
        const userMap: MapType = {}
        formattedVisitData
            .filter((v) => {
                return v.User !== CommonParam.userId && v.Status === VisitStatus.COMPLETE
            })
            .forEach((v) => {
                if (!userMap[v.User]) {
                    userMap[v.User] = []
                }
                userMap[v.User].push(v)
            })
        Object.keys(userMap).forEach((key) => {
            userMap[key].sort((a: MyDayVisitModel, b: MyDayVisitModel) => {
                return a.ActualEndTimeUnix - b.ActualEndTimeUnix
            })
        })
        Object.keys(userMap)
            .sort((a, b) => {
                return userMap[a][0].ActualEndTimeUnix - userMap[b][0].ActualEndTimeUnix
            })
            .forEach((key) => {
                myVisitsSectionList.push({
                    route: CommonParam.userRouteGTMUId,
                    userName: userMap[key][0].UserName,
                    data: userMap[key]
                })
            })
        myVisitsSectionList.forEach((section, index) => {
            section.index = index
        })
        mappingResult.myVisitsSectionList = myVisitsSectionList
        mappingResult.metric = await this.calculateMetricsData(formattedVisitData, isPast, inputDate)
        return mappingResult
    }

    static getStoreGeoFences(stores: MyDayVisitModel[]) {
        const geoFences = stores.map((store) => {
            const geoFence = JSON.parse(store.Geofence)
            if (geoFence) {
                geoFence.CustomId = store.AccountId
                geoFence.Id = store.RetailStoreId
            }
            return geoFence
        })
        return geoFences
    }

    static async fetchEventDataByToday() {
        const start = addDaysToToday(-2, true)
        const end = addDaysToToday(2, true)
        const events = await VisitData.fetchEventDataByDay(start, end)
        return events
    }

    static async fetchEventDataByPastFuture() {
        const start = getLastSundayDate()
        const end = addDaysToToday(7, true)
        const events = await VisitData.fetchEventDataByDay(start, end, true)
        return events
    }

    static async isTodayVisit(visitListId?: string, vlRefId?: string) {
        const today = todayDateWithTimeZone(true)
        const relatedVls = await VisitData.getCurrentVisitRelatedVisitList(visitListId, vlRefId)
        if (relatedVls && relatedVls.length > 0) {
            const visitDate = relatedVls[0].Visit_Date__c
            if (visitDate === today) {
                return true
            }
            return false
        }
        return true
    }

    static refreshGeoFence = async (cLocation: any, visitListData: Partial<VisitList>[]) => {
        const data = visitListData || []
        if (!_.isEmpty(data)) {
            data.forEach((store: any) => {
                store.inGeoFence = false
            })
            const locations = checkInRange(cLocation)
            const visitsToBeUpdated: any = []
            locations.forEach((location) => {
                const stores = data.filter((visit: any) => visit['RS.Id'] === location.Id)
                stores.forEach((store: any) => {
                    store.inGeoFence = true
                    if (store['Vis.Status__c'] === VisitStatus.IN_PROGRESS && store['Vis.ASAS_Compliant__c'] !== '1') {
                        store['Vis.ASAS_Compliant__c'] = '1'
                        visitsToBeUpdated.push(store)
                    }
                })
            })
            visitsToBeUpdated.forEach(async (item) => {
                const updatedVisit = {
                    Id: item['Vis.Id'],
                    _soupEntryId: item['Vis._soupEntryId'],
                    ASAS_Compliant__c: '1'
                }
                await VisitDM.upsertVisit(updatedVisit)
            })
            // Not await for this sync task to finish since it will block the page rendering
            SyncUpService.syncUpLocalData()
        }
    }

    static async upsertSalesDailyVisitList(userVlsCount: number, todayDate: any) {
        const recordTypes: Partial<RecordType>[] = await CommonData.getRecordTypeIdByRecordTypeName(
            'Sales Daily Visit List'
        )
        const vlRecordTypeId = recordTypes[0]?.Id || ''
        return await VisitData.upsertUserVisitListData(vlRecordTypeId, userVlsCount, todayDate)
    }

    static async getCurRoute(retailStoreFromRoutes: string) {
        return await VisitData.getCurRouteData(retailStoreFromRoutes)
    }

    static async getRouteInfoByAccount(accountIds: string) {
        const ctrFields = CommonData.getAllFieldsByObjName('Customer_to_Route__c', 'Remote')
        return await VisitSync.getRouteInfoByAccountList(accountIds, ctrFields)
    }

    public static async getVisitListBySoupEntryId(vlSoupEntryId: string) {
        return await VisitData.getVisitListBySoupEntryId(vlSoupEntryId)
    }

    public static async getTodayVisitsWithOrderInProgress() {
        const today = todayDateWithTimeZone(true)
        return await VisitData.getVisitsWithOrderInProgressList(today)
    }

    public static async syncUpVLLocalData() {
        const visitListData = await VisitData.getVLDataWithIdIsNull()
        const vlObjsToUpdate: any[] = []
        const vlObjsToInsert: any[] = []
        if (!_.isEmpty(visitListData)) {
            visitListData.forEach((vlItem) => {
                if (!_.isEmpty(vlItem.Id)) {
                    vlObjsToUpdate.push(vlItem)
                } else {
                    vlObjsToInsert.push(vlItem)
                }
            })
        }
        await VisitSync.syncUpVLLocalData(vlObjsToUpdate, vlObjsToInsert)
    }

    public static async syncUpVisitLocalData() {
        const visitData = await VisitData.getVisitDataWithIdIsNull()
        const noIdVisRefVLs = await VisitData.getVLIdsWithVIdOrUVLIdIsNull()
        if (!_.isEmpty(visitData)) {
            visitData.forEach((visItem) => {
                const uvl = noIdVisRefVLs.find((vl) => vl._soupEntryId === visItem.userVlRefId)
                if (uvl?.Id) {
                    visItem.User_Visit_List__c = uvl.Id
                }
                const rvl = noIdVisRefVLs.find((vl) => vl._soupEntryId === visItem.vlRefId)
                if (rvl?.Id) {
                    visItem.Visit_List__c = rvl.Id
                }
                delete visItem.vlRefId
                delete visItem.userVlRefId
            })
            await VisitSync.syncUpVisitLocalData(visitData)
        }
    }

    public static async retrieveVisitBySoupEntryId(soupEntryId: string) {
        return await VisitData.retrieveVisitBySoupEntryId(soupEntryId)
    }

    public static async getInProgressVisitList() {
        return await VisitData.getInProgressVisitList()
    }

    private static breakDots(obj: any) {
        Object.keys(obj).forEach((key) => {
            if (key.indexOf('.') !== -1) {
                const value = obj[key]
                let cur = obj
                const pathSegs = key.split('.')
                delete obj[key]
                pathSegs.forEach((pathSeg, index) => {
                    const isLast = index === pathSegs.length - 1
                    if (!isLast) {
                        if (!cur[pathSeg]) {
                            cur[pathSeg] = {}
                        }
                        cur = cur[pathSeg]
                    } else {
                        cur[pathSeg] = value
                    }
                })
            }
        })
        return obj
    }

    public static async upsertVisit(updateVisit: any) {
        const original = await VisitData.retrieveOriginalVisit(updateVisit._soupEntryId)
        const patched = this.breakDots({
            ...original[0],
            ...updateVisit
        })
        await VisitData.updateVisitIntoSoup(patched)
    }

    private static mapToStore(res: any) {
        return {
            City: res.City,
            StoreName: res.Name,
            State: res.State,
            PostalCode: res.PostalCode,
            RetailStoreId: res.Id,
            Street: res.Street,
            CustUniqId: res['Account.CUST_UNIQ_ID_VAL__c'],
            AccountId: res.AccountId,
            PhoneNum: res['Account.Phone'],
            StateCode: res.StateCode,
            Geofence: res['Account.CUST_GEOFNC__c'],
            CustomerLongitude: res.Customer_Longitude__c,
            CustomerLatitude: res.Customer_Latitude__c,
            IsOTS: res['Account.IsOTSCustomer__c'],
            CDAMedal: res['Account.CDA_Medal__c'],
            PzId: res['Account.Pz_Id__c'],
            BsId: res['Account.BUSN_SGMNTTN_LVL_1_CDV__c']
        }
    }

    public static async fetchRetailStoreData(storeId: string, dropDownRef: any) {
        const stores = (await VisitData.fetchRetailStoreData(storeId, dropDownRef)) || []
        const mappedStore: RetailStoreModel = this.mapToStore(stores[0])
        return mappedStore
    }

    public static async updateRemovedVisitIntoSoup(soupEntryId: string) {
        return await VisitData.updateRemovedVisitIntoSoup(soupEntryId)
    }

    public static async updateVisitListIntoSoup(record: any) {
        return await VisitData.updateVisitListIntoSoup(record)
    }

    public static async getCurrentVisitByVisitId(visitId: string) {
        return await VisitData.getCurrentVisitByVisitId(visitId)
    }

    static async checkIsAnyCurrentUserVisitsInProgress(
        inputDate: string,
        setInProgressVisit: Function,
        dropDownRef: any
    ) {
        let outputValue = false
        VisitData.getCurrentUserVisits(inputDate)
            .then((visits: Array<Partial<VisitModel>>) => {
                if (!_.isEmpty(visits)) {
                    const result = visits.find((visit) => visit?.Status__c === VisitListStatus.IN_PROGRESS)
                    outputValue = !result
                } else {
                    outputValue = true
                }
                setInProgressVisit(outputValue)
            })
            .catch((err) => {
                setInProgressVisit(false)
                dropDownRef.current.alertWithType('error', 'Check Visit List Status Failed', err)
            })
    }

    static async getRouteInfoVisitData(selectedDate: string, statsId: string) {
        return await VisitData.getRouteInfoVisitData(selectedDate, statsId)
    }

    static getCustUniqIdsFromVisitOnOtherRoutes = VisitData.getCustUniqIdsFromVisitOnOtherRoutes
    static getRVLIdsCurRoute = VisitData.getRVLIdsCurRoute
    static getUVLIdsCurUser = VisitData.getUVLIdsCurUser
    static getAllVisitIdsByVLIds = VisitData.getAllVisitIdsByVLIds
    static getAllStoresForPriceCalculation = VisitData.getAllStoresForPriceCalculation

    static syncDownCurUserUVLs() {
        const ctrFields = CommonData.getAllFieldsByObjName('Visit_List__c', 'Remote')
        return VisitSync.syncDownCurUserUVLs(ctrFields)
    }

    static syncDownUVLVisits(uvls: VisitList[]) {
        const ctrFields = CommonData.getAllFieldsByObjName('Visit', 'Remote')
        return VisitSync.syncDownUVLVisits(uvls, ctrFields)
    }

    static async deltaSyncDownVLsAndVisits(tab: string, lastModifiedDate: string) {
        const today = todayDateWithTimeZone(true)
        let vlDateQuery
        let vlSoupQuery
        if (tab === 'past') {
            vlDateQuery = '(Visit_Date__c >= LAST_N_DAYS:14 AND Visit_Date__c < TODAY)'
            vlSoupQuery = `WHERE {Visit_List__c:Visit_Date__c} < '${today}'`
        } else if (tab === 'future') {
            vlDateQuery = '(Visit_Date__c <= NEXT_N_DAYS:7 AND Visit_Date__c > TODAY)'
            vlSoupQuery = `WHERE {Visit_List__c:Visit_Date__c} > '${today}'`
        } else {
            vlDateQuery = 'Visit_Date__c = TODAY'
            vlSoupQuery = `WHERE {Visit_List__c:Visit_Date__c} = '${today}'`
        }
        const visitListSyncFields = CommonData.getAllFieldsByObjName('Visit_List__c', 'Remote')
        await VisitSync.deltaSyncDownVLs(vlDateQuery, lastModifiedDate, visitListSyncFields)
        const allVisitLists = await VisitData.getAllVisitList(vlSoupQuery)
        const visitListIds = getIdClause(allVisitLists.map((visitList) => visitList.Id).filter((Id) => !!Id))
        if (!_.isEmpty(visitListIds)) {
            const visitSyncFields = CommonData.getAllFieldsByObjName('Visit', 'Remote')
            await VisitSync.deltaSyncDownVisits(visitListIds, lastModifiedDate, visitSyncFields)
        }
    }

    static async getVisitListId(todayDate: string, queryCount: number): Promise<any> {
        const visitLstData = (await VisitData.getVisitListIdData(todayDate)) as unknown as Array<LocalVisitListModal>
        const availableVL = visitLstData.find(
            (one) => one.Status__c === VisitListStatus.IN_PROGRESS || one.Status__c === VisitListStatus.NOT_STARTED
        )
        if (availableVL) {
            return { vlId: availableVL.Id || '', vlSoupEntryId: availableVL._soupEntryId || '' }
        } else if (!availableVL && queryCount < 5) {
            return await VisitDM.getVisitListId(todayDate, queryCount + 1)
        }
        return { vlId: '', vlSoupEntryId: '', userVlsCount: visitLstData.length }
    }

    static async upsertVisitData(inputData: UpsertVisitDataInput) {
        const { vlId, addVisitList, todayDate, vlSoupEntryId, now, userVlsCount, ctr, curRouteCTR } = inputData
        const recordTypes: Partial<RecordType>[] = await CommonData.getRecordTypeIdByRecordTypeName('Sales')
        const vRecordTypeId = recordTypes[0]?.Id || ''

        const localVisitLst: Array<any> = []
        addVisitList.forEach((item) => {
            const ctrMatch = ctr.find((one) => one.Customer__c === item.AccountId)
            const orderCartIdentifier = CommonParam.GPID__c + item.Id + now
            const newVisitItem = {
                RecordTypeId: vRecordTypeId,
                PlaceId: item.Id,
                Planned_Date__c: todayDate,
                User_Visit_List__c: '',
                Status__c: VisitQueries.CreateVisitQuery.CREATE_VISIT_STATUS,
                Ad_Hoc__c: true,
                User__c: BaseInstance.userAccount.userId,
                PlannedVisitStartTime: moment().parseZone().tz('America/New_York', true).toISOString(),
                VisitorId: BaseInstance.userAccount.userId,
                RTE_ID__c: item.RouteId || ctrMatch?.Route__c,
                RTE_ID__r: {
                    GTMU_RTE_ID__c: item.GTMUId || ctrMatch?.Route__r?.GTMU_RTE_ID__c
                },
                userVlRefId: '',
                Order_Cart_Identifier__c: orderCartIdentifier,
                Retail_Store__c: item.Id,
                Customer_to_Route__c: curRouteCTR[0]?.Id || ctrMatch?.Id,
                Customer_to_Route__r: {
                    DELY_MTHD_CDE__c: curRouteCTR[0]?.DELY_MTHD_CDE__c || ctrMatch?.DELY_MTHD_CDE__c
                }
            }
            localVisitLst.push(newVisitItem)
        })
        if (!_.isEmpty(vlId)) {
            localVisitLst.forEach((v) => {
                v.User_Visit_List__c = vlId
            })
        } else if (vlSoupEntryId !== '') {
            localVisitLst.forEach((v) => {
                v.userVlRefId = vlSoupEntryId
            })
        } else {
            await VisitDM.upsertSalesDailyVisitList(userVlsCount, todayDate)
            const localVl = await VisitDM.getVisitListId(todayDate, 0)
            localVisitLst.forEach((v) => {
                v.userVlRefId = localVl.vlSoupEntryId
            })
        }
        await VisitData.upsertVisitData(localVisitLst)
    }

    public static async syncUpCurrentVisit(visitId: string) {
        const currentVisit = await VisitData.retrieveCurrentLocallyUpdatedVisitById(visitId)
        if (currentVisit.length) {
            await VisitSync.syncUpCurrentVisitData(currentVisit)
        }
    }

    static async getVisitDataByRoute(storeData: any[]) {
        const visitSyncFields = CommonData.getAllFieldsByObjName('Visit', 'Remote')
        return VisitSync.getVisitDataByRoute(
            storeData.map((storeItem) => storeItem.Id),
            visitSyncFields
        )
    }
}

export default VisitDM
