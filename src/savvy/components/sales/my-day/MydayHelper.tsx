import { CommonParam } from '../../../../common/CommonParam'
import { BooleanStr } from '../../../enums/Manager'
import { RecordTypeEnum, VisitListRecordTypeEnum } from '../../../enums/RecordType'
import { VisitRecordType, VisitStatus } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import { SoupService } from '../../../service/SoupService'
import { formatString, getRecordTypeIdByDeveloperName, isTrueInDB } from '../../../utils/CommonUtils'
import { getTotalHours } from '../../../utils/MerchManagerComputeUtils'
import { SDLMydayEmployeeList, SDLMyDayEmployeeOrderCount, SDLMyDayQueries, SDLMydayVisitList } from './MydayQuery'
import _ from 'lodash'
import { COLOR_TYPE } from '../../../enums/MerchandiserEnums'
import { Persona } from '../../../../common/enums/Persona'
import { getRaceTrackColorForDelivery, getUserHoursAndStatus } from '../../del-sup/deliveries/DeliveriesHelper'
import { VisitListStatus } from '../../../enums/VisitList'
import { Log } from '../../../../common/enums/Log'
import { getGeoFenceDataInDeliver } from '../../del-sup/deliveries/DelEmployeeScheduleHelper'
import { fetchSalesVisitsBreadcrumb } from '../../MyDay/SalesMyDayHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const filterWithSelectedSubType = (subTypeArray, employeeList, customerList) => {
    let selectedRoutes = []
    let selectedNum = 0

    subTypeArray.forEach((element) => {
        if (element.select) {
            selectedNum++
            const itemsId = element.items.map((item) => item.TRouteSalesId)
            selectedRoutes = selectedRoutes.concat(itemsId)
        }
    })

    const employeeLisTemp = employeeList.filter((employee) => {
        return employee.unassign || selectedRoutes.indexOf(employee.RouteSalesGeoId) >= 0
    })

    const visitListTemp = customerList.filter((visit) => {
        return visit.unassign || selectedRoutes.indexOf(visit.RouteSalesGeoId) >= 0
    })

    return { employeeList: employeeLisTemp, visitList: visitListTemp, selectedNum: selectedNum }
}

export const queryTerritory = async () => {
    const territory = await SoupService.retrieveDataFromSoup(
        'Route_Sales_Geo__c',
        {},
        SDLMyDayQueries.getRoutes.f,
        formatString(SDLMyDayQueries.getRoutes.q, [CommonParam.userLocationId])
    )
    return (
        _.chain(territory)
            // Group the elements of Array based on `TRouteSalesId` property
            .groupBy('SRouteSales_SLS_UNIT_NM__c')
            // `key` is group's name (TRouteSalesId), `value` is the array of objects
            .map((value, key) => ({
                name: key,
                items: value,
                select: true
            }))
            .value()
    )
}

const filterVisitDataWithTerritory = (visits, territory) => {
    let selectedRoutes = []
    territory &&
        territory.forEach((element) => {
            const itemsId = element.items.map((item) => item.TRouteSalesId)
            if (element.select) {
                selectedRoutes = selectedRoutes.concat(itemsId)
            }
        })
    return visits.filter((visit: any) => {
        return !visit.UserId || selectedRoutes.indexOf(visit.RouteSalesGeoId) >= 0
    })
}

const getIdClause = (idArr: Array<string>) => {
    let idClause = ''
    idArr.forEach((id, index) => {
        idClause += `'${id}'` + (index !== idArr.length - 1 ? ',' : '')
    })
    return idClause
}
const queryOrdersInVisits = async (visitArr) => {
    try {
        const visitIdArr = visitArr.map((visit) => visit.VisitId)
        const res = await SoupService.retrieveDataFromSoup(
            'Order',
            {},
            ['Id', 'Visit__c'],
            `
            SELECT
                {Order:Id},
                {Order:Visit__c}
            FROM
                {Order}
            WHERE
                {Order:Visit__c} IN (${getIdClause(visitIdArr)}) AND {Order:Order_ATC_Type__c} = 'Normal'
            `
        )
        const orderArr = res || []
        orderArr.forEach((order) => {
            const matchIndex = visitIdArr.indexOf(order.Visit__c)
            if (matchIndex > -1) {
                if (_.isArray(visitArr[matchIndex].orders)) {
                    visitArr[matchIndex].orders.push(order)
                } else {
                    visitArr[matchIndex].orders = [order]
                }
            }
        })
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'queryOrdersInVisits', ErrorUtils.error2String(error))
        return []
    }
}
const getUserOrderCount = async (userObj, dateStr) => {
    const arrayUserId = Object.keys(userObj)
    const userIdAndRouteIds = arrayUserId.map((item) => item.split('-'))
    const userIds = _.uniq(userIdAndRouteIds.map((twoIds) => twoIds[0]))
    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        SDLMyDayEmployeeOrderCount.f,
        formatString(SDLMyDayEmployeeOrderCount.q, [dateStr, getIdClause(userIds)])
    )
    const salesVisits = visits.filter((visit) => visit.RecordTypeDeveloperName === VisitRecordType.SALES)
    await queryOrdersInVisits(salesVisits)
    const userSalesVisitObj = {}
    salesVisits.forEach((visit) => {
        const userId = visit.VisitorId
        const routeId = visit.RouteId
        if (userSalesVisitObj[`${userId}-${routeId}`]) {
            userSalesVisitObj[`${userId}-${routeId}`].OrderDenominator += 1
            _.isArray(visit.orders) && (userSalesVisitObj[`${userId}-${routeId}`].OrderNumber += visit.orders.length)
        } else {
            userSalesVisitObj[`${userId}-${routeId}`] = {
                OrderDenominator: 1,
                OrderNumber: _.isArray(visit.orders) ? visit.orders.length : 0
            }
        }
    })
    Object.keys(userObj).forEach((userId) => {
        if (userSalesVisitObj[userId]) {
            userObj[userId].OrderDenominator = userSalesVisitObj[userId].OrderDenominator
            userObj[userId].OrderNumber = userSalesVisitObj[userId].OrderNumber
        }
    })
}

const configureInitUser = (user) => {
    return {
        Id: user.UserId,
        id: user.UserId,
        unassign: user.unassign,
        name: user.Name,
        storeName: user.StoreName,
        AccountPhone: user.AccountPhone,
        firstName: user.FirstName,
        lastName: user.LastName,
        RouteSalesGeoId: user.RouteSalesGeoId,
        VisitListId: user.Visit_List__c,
        gpid: user.GPID__c,
        buid: user.BU_ID__c,
        persona: user.PERSONA__c,
        visits: [user],
        amas: [],
        all: 1,
        storeId: user.storeId,
        finished: user.Status__c === VisitStatus.COMPLETE ? 1 : 0,
        inProgress: user.Status__c === VisitStatus.IN_PROGRESS ? 1 : 0,
        status: '',
        phone: user.MobilePhone,
        totalDuration: parseInt(user.Planned_Duration_Minutes__c),
        address: `${user.Street || ''}`,
        storeLocation: user.Store_Location__c,
        cityStateZip: `${user.City || ''}, ${user.State || ''}, ${user.PostalCode || ''} `,
        userStatsId: user.UserStatsId,
        LocalRoute: user.LocalRoute,
        NationalId: user.NationalId,
        LoadNum: user.LoadNum || '-',
        isFavorited: user.Schedule_Favorited__c?.includes(CommonParam.userId)
    }
}
const configureUser = (user, item) => {
    const vStatus = item.Status__c
    user.visits.push(item)
    user.totalDuration += parseInt(item.Planned_Duration_Minutes__c)
    user.all++
    user.LocalRoute = user.LocalRoute || item.LocalRoute
    user.NationalId = user.NationalId || item.NationalId
    if (vStatus === VisitStatus.COMPLETE) {
        user.finished++
    } else if (vStatus === VisitStatus.IN_PROGRESS) {
        user.inProgress++
    }
}

export const configureTotalVisit = (user, item) => {
    item.statusTag = item.Status__c
    user.amas.push(item)
}

const addMerchFieldToSalesVisit = (item, tempVisits) => {
    // merch + sales
    const completeMerchVisit = tempVisits.find((visit) => visit.Status__c === VisitStatus.COMPLETE)
    if (!_.isEmpty(completeMerchVisit)) {
        const isAMASTrue = tempVisits
            .filter((v) => v.Status__c === VisitStatus.COMPLETE)
            .some((visit) => isTrueInDB(visit.AMAS_Compliant__c))
        if (_.isEmpty(item.ActualVisitStartTime)) {
            item.ActualVisitStartTime = completeMerchVisit.ActualVisitStartTime
        }
        if (item.color !== COLOR_TYPE.GREEN && item.Status__c === VisitStatus.COMPLETE) {
            item.color = isAMASTrue ? COLOR_TYPE.GREEN : COLOR_TYPE.RED
        }
    }
}

export const sortByDateFieldAscNullAsLast = (a, b, fieldName) => {
    return (
        Number(_.isEmpty(a[fieldName])) - Number(_.isEmpty(b[fieldName])) ||
        +(a[fieldName] > b[fieldName]) ||
        -(a[fieldName] < b[fieldName])
    )
}

const mergeSalesAndMerchVisits = (visitArray: any[], breadcrumbRecords: any[]) => {
    const visitsToBeDelete = []
    const setComStoreId = []
    for (const item of visitArray) {
        if (!visitsToBeDelete.includes(item.VisitId)) {
            item.finalStatus = item.statusTag
            if (item.DeveloperName === RecordTypeEnum.SALES) {
                let hasBreadcrumbRecord
                if (item.Status__c === VisitStatus.COMPLETE) {
                    hasBreadcrumbRecord = breadcrumbRecords.find(
                        (record) =>
                            record.Customer__c === item.storeId &&
                            record.User__c === item.VisitorId &&
                            record.Time__c >= item.ActualVisitStartTime &&
                            record.Time__c <= item.ActualVisitEndTime
                    )
                    item.color = !_.isEmpty(hasBreadcrumbRecord) ? COLOR_TYPE.GREEN : COLOR_TYPE.RED
                }
                const tempVisits = visitArray.filter((vis) => {
                    return (
                        vis.VisitId !== item.VisitId &&
                        vis.DeveloperName === RecordTypeEnum.MERCHANDISING &&
                        item.storeId === vis.storeId
                    )
                })

                if (tempVisits.length > 0) {
                    visitsToBeDelete.push(...tempVisits.map((tempI) => tempI.VisitId))
                    if (
                        item.statusTag === VisitStatus.COMPLETE ||
                        (item.statusTag !== VisitStatus.COMPLETE && !setComStoreId.includes(item.storeId))
                    ) {
                        setComStoreId.push(item.storeId)
                        // merch + sales
                        addMerchFieldToSalesVisit(item, tempVisits)
                    }
                }
            }
            // merch only
            if (item.DeveloperName === RecordTypeEnum.MERCHANDISING) {
                item.color = isTrueInDB(item.AMAS_Compliant__c) ? COLOR_TYPE.GREEN : COLOR_TYPE.RED
            }
        }
    }

    // sort by ActualVisitStartTime and Start_Date_Time__c of visit list, null as last
    return visitArray
        .filter((item) => !visitsToBeDelete.includes(item.VisitId))
        .sort((a, b) => {
            return sortByDateFieldAscNullAsLast(a, b, 'ActualVisitStartTime')
        })
        .sort((a, b) => {
            return sortByDateFieldAscNullAsLast(a, b, 'Start_Date_Time__c')
        })
}

export const composeVisitRacetrackData = (userObj, breadcrumbRecords, fromDelivery?) => {
    const allUserIds = Object.keys(userObj)
    allUserIds.forEach((userId) => {
        const user = userObj[userId]
        if (user.Id) {
            let temp
            if (fromDelivery) {
                temp = getRaceTrackColorForDelivery(user.amas)
            } else {
                temp = mergeSalesAndMerchVisits(user.amas, breadcrumbRecords)
            }
            user.amas = temp
        }
    })
}

const addFinishedCountWhenOnlyMerchComplete = (user, item) => {
    const vStatus = item.Status__c
    if (vStatus === VisitStatus.COMPLETE) {
        user.finished++
        user?.visits?.forEach((visit) => {
            if (visit.storeId === item.storeId) {
                visit.Status__c = VisitStatus.COMPLETE
            }
        })
    } else if (vStatus === VisitStatus.IN_PROGRESS) {
        user.inProgress++
    }
}

const roundFloat = (num) => {
    let result = 0
    if (_.isNumber(_.toNumber(num))) {
        result = _.round(_.toNumber(num))
    }
    return result
}

const configureDayVisitListInfo = (userObj, statusData) => {
    let completeCount = 0
    let inProgressCount = 0
    let noStartCount = 0
    const allUserIds = Object.keys(userObj)
    allUserIds.forEach((userId) => {
        const user = userObj[userId]
        user.totalHrs = getTotalHours(user.totalDuration, 0)
        user.LocalRoute = user.LocalRoute || '-'
        user.NationalId = user.NationalId || '-'
        user.finishCs = roundFloat(user.finishCs)
        user.allCs = roundFloat(user.allCs)
        const statusUser = statusData[userId]
        const completeVl = statusUser.filter((visit) => visit.Visit_List_Status === VisitListStatus.COMPLETED)
        const inProgressVl = statusUser.filter((visit) => visit.Visit_List_Status === VisitListStatus.IN_PROGRESS)
        const otherVl = statusUser.filter(
            (visit) =>
                visit.Visit_List_Status !== VisitListStatus.COMPLETED &&
                visit.Visit_List_Status !== VisitListStatus.IN_PROGRESS
        )
        if (!_.isEmpty(completeVl) && _.isEmpty(inProgressVl) && _.isEmpty(otherVl)) {
            user.status = 'completed'
            completeCount++
        } else if (!_.isEmpty(inProgressVl) || !_.isEmpty(completeVl)) {
            user.status = 'inProgress'
            inProgressCount++
        } else {
            if (user.all === user.finished) {
                user.status = 'completed'
                completeCount++
            } else if (user.finished > 0 || user.inProgress > 0) {
                user.status = 'inProgress'
                inProgressCount++
            } else {
                user.status = 'yet2Start'
                noStartCount++
            }
        }
    })
    return { completeCount, inProgressCount, noStartCount }
}

const addUnassignVisitRoutes = (visitArr) => {
    const unassignVisitRouteIds = visitArr[0]?.visits?.map((visit) => visit.RouteSalesGeoId)
    const uniqUnassignRoutes = _.uniq(unassignVisitRouteIds)
    if (!_.isEmpty(uniqUnassignRoutes)) {
        visitArr[0].uniqUnassignRoutes = uniqUnassignRoutes
    }
}

const judgeTotalVisitsNum = (salesByUserAndRoute, merchVisit, merchFlag?) => {
    let flag = true
    salesByUserAndRoute?.visits?.forEach((visit) => {
        if (!merchFlag) {
            if (visit.storeId === merchVisit.storeId && visit.DeveloperName !== RecordTypeEnum.MERCHANDISING) {
                flag = false
            }
        } else {
            if (visit.storeId === merchVisit.storeId && visit.Status__c === 'Complete') {
                flag = false
            }
        }
    })
    return flag
}

export const getSDLMyDayEmployeeList = async (date, territory) => {
    const dateStr = date.format(TIME_FORMAT.Y_MM_DD)
    const dvlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.SalesDailyVisitList,
        'Visit_List__c'
    )
    const merchRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.MerchDailyVisitList,
        'Visit_List__c'
    )
    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        SDLMydayEmployeeList.f,
        formatString(SDLMydayEmployeeList.q, [dateStr, dvlRecordTypeId, merchRecordTypeId, CommonParam.userLocationId])
    )
    const salesVisits = visits.filter(
        (visit) => visit.DeveloperName === RecordTypeEnum.SALES && visit.RouteSalesGeoId !== ''
    )
    const merchVisits = visits.filter(
        (visit) => visit.DeveloperName === RecordTypeEnum.MERCHANDISING && visit.VisitId !== ''
    )
    const userObj = {}
    const tempArr = filterVisitDataWithTerritory(salesVisits, territory)
    const visitArr = _.unionBy(tempArr, 'VisitId')
    const userIdArr = []

    visitArr.forEach((item: any) => {
        if (!item.VisitId) {
            return
        }
        let userId = item.UserId
        if (!userId) {
            userId = 'unassign'
            item.Name = _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)
            item.unassign = true
        }
        if (userId !== 'unassign') {
            if (!userObj[`${userId}-${item.RouteSalesGeoId}`]) {
                userObj[`${userId}-${item.RouteSalesGeoId}`] = configureInitUser(item)
                !item.unassign && userIdArr.push(userId)
            } else {
                configureUser(userObj[`${userId}-${item.RouteSalesGeoId}`], item)
            }
            configureTotalVisit(userObj[`${userId}-${item.RouteSalesGeoId}`], item)
        } else {
            if (!userObj[`${userId}`]) {
                userObj[`${userId}`] = configureInitUser(item)
            } else {
                configureUser(userObj[`${userId}`], item)
            }
        }
    })
    const salesGroup = Object.keys(userObj)
    merchVisits?.forEach((visit) => {
        salesGroup?.forEach((group) => {
            const userId = group.split('-')[0]
            if (visit.UserId === userId) {
                if (judgeTotalVisitsNum(userObj[`${group}`], visit)) {
                    configureUser(userObj[`${group}`], visit)
                }
                configureTotalVisit(userObj[`${group}`], visit)
                if (visit.Status__c === VisitStatus.COMPLETE && judgeTotalVisitsNum(userObj[`${group}`], visit, true)) {
                    addFinishedCountWhenOnlyMerchComplete(userObj[`${group}`], visit)
                }
            }
        })
    })

    // filter unique VisitorId from sales visits
    const completeSalesVisitorIds = _.uniq(
        salesVisits
            .filter((item) => item.Status__c === VisitStatus.COMPLETE && !_.isEmpty(item.VisitorId))
            .map((item) => item?.VisitorId?.toString())
    )
    const breadcrumbRecords = await fetchSalesVisitsBreadcrumb(completeSalesVisitorIds, date)
    // amas racetrack
    composeVisitRacetrackData(userObj, breadcrumbRecords)

    const unassignVisitIds = userObj.unassign?.visits.map((v) => v.VisitId) || []
    const uniqUserIds = _.uniq(userIdArr)
    const statusData = await getUserHoursAndStatus(
        {
            lstUserId: uniqUserIds,
            strDate: dateStr,
            strPersona: Persona.SALES_DISTRICT_LEADER,
            lstVisitId: unassignVisitIds
        },
        visitArr,
        true
    )
    const tempInfo = configureDayVisitListInfo(userObj, statusData)
    // calculate order count for users
    await getUserOrderCount(userObj, dateStr)
    const list = Object.values(userObj)
    const unassignedVisits = list.filter((item: any) => _.isEmpty(item?.Id))
    addUnassignVisitRoutes(unassignedVisits)
    const normalVisits = list.filter((item: any) => !_.isEmpty(item?.Id))
    return { list: [...unassignedVisits, ...normalVisits], scheduleInfo: tempInfo }
}

export const getSDLMyDayVisitList = async (date, territory) => {
    const dateStr = date.format(TIME_FORMAT.Y_MM_DD)
    const dvlRecordTypeId = await getRecordTypeIdByDeveloperName(
        VisitListRecordTypeEnum.SalesDailyVisitList,
        'Visit_List__c'
    )

    const visits = await SoupService.retrieveDataFromSoup(
        'Visit',
        {},
        SDLMydayVisitList.f,
        formatString(SDLMydayVisitList.q, [dateStr, dvlRecordTypeId, CommonParam.userLocationId])
    )
    let geoFenceData = []
    if (visits.length > 0) {
        await exeAsyncFunc(async () => {
            geoFenceData = await getGeoFenceDataInDeliver(visits, dateStr)
        })
    }
    const tempVisitList = []
    let completeCount = 0
    let inProgressCount = 0
    let noStartCount = 0
    const tempArr = filterVisitDataWithTerritory(visits, territory)
    const visitArr = _.unionBy(tempArr, 'Id')
    visitArr.forEach((item: any) => {
        if (!item.UserId) {
            item.unassign = true
        }
        if (item.status === VisitStatus.COMPLETE) {
            completeCount++
        } else if (item.status === VisitStatus.IN_PROGRESS) {
            inProgressCount++
        } else {
            noStartCount++
        }
        const address = JSON.parse(item.ShippingAddress)
        item.id = item.Id
        item.cityStateZip = `${address?.city ? address?.city + ', ' : ''}${address?.state ? address?.state : ''}${
            address?.postalCode ? ' ' + address.postalCode : ''
        } `
        item.address = address?.street || ''
        item.inLocation = item.InLocation === BooleanStr.STR_TRUE
        tempVisitList.push(item)
    })
    const tempInfo = { completeCount, inProgressCount, noStartCount }
    return { list: _.unionBy(tempVisitList, 'Id'), scheduleInfo: tempInfo, geoFenceData }
}
