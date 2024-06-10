/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-11-18 01:04:56
 * @LastEditTime: 2023-12-14 13:19:55
 * @LastEditors: Yi Li
 */
import moment from 'moment'
import { CommonParam } from '../../common/CommonParam'
import { decode } from 'html-entities'
import { restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import { SoupService } from './SoupService'
import { Persona, isPersonaKAM, isPersonaMD, isPersonaPSR, isPersonaSDL } from '../../common/enums/Persona'
import { sameDay } from '../common/DateTimeUtils'
import { Log } from '../../common/enums/Log'
import { CommonApi } from '../../common/api/CommonApi'
import SyncService from './SyncService'
import { NativeAppEventEmitter } from 'react-native'
import { EventEmitterType, NavigationRoute } from '../enums/Manager'
import { CommonLabel } from '../enums/CommonLabel'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { storeClassLog } from '../../common/utils/LogUtils'
import AutoRefreshOfSchedule from '../components/merchandiser/AutoRefreshOfSchedule'
import { goToAuditAndContractTab, goToRealogramScreen } from '../helper/rep/AuditHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { formatString } from '../utils/CommonUtils'
import ScheduleQuery from '../queries/ScheduleQuery'
import { assembleCustomerData } from '../components/manager/helper/MerchManagerHelper'
import { ActiveTabName } from '../pages/rep/customer/CustomerDetailScreen'
import { RealogramNotificationType } from '../enums/Contract'

export const clearNotifications = () => {
    restDataCommonCall(`${CommonApi.PBNA_MOBILE_API_CONNECT_NOTIFICATION}/`, 'PATCH', {
        read: 'true'
    })
        .then(() => {})
        .catch(() => {
            // dropDownRef.current.alertWithType('error', '/connect/notifications/notificationId', err)
        })
}

const downLoadTargetObjectQuerySting = (obj, recordId) => {
    let q = obj.initQuery.split('WHERE')[0]
    if (q.indexOf('WHERE') > -1) {
        q += " AND Id = '" + recordId + "'"
    } else {
        q += " WHERE Id = '" + recordId + "'"
    }
    return q
}

const getWeekArrWithDate = (today) => {
    const tempWeekArr = []
    const thisSunday = today.clone().day(0)
    for (let index = 0; index <= 6; index++) {
        const wl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.DDD).toUpperCase()
        const dl = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.MDD)
        const targetDate = thisSunday.clone().add(index, MOMENT_STARTOF.DAY)
        const isToday = sameDay(targetDate.format(TIME_FORMAT.Y_MM_DD))
        const fullYearDate = thisSunday.clone().add(index, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)
        if (isToday) {
            tempWeekArr.push({ weekLabel: 'TODAY', dateLabel: dl, fullYearDate })
        } else {
            tempWeekArr.push({ weekLabel: wl, dateLabel: dl, fullYearDate })
        }
    }
    return tempWeekArr
}

const preparePushData = (navigation, visitListId, recordId, userStatsId) => {
    Promise.all([
        SoupService.retrieveDataFromSoup('Visit_List__c', {}, [], null, [` WHERE {Visit_List__c:Id}='${visitListId}'`]),
        SoupService.retrieveDataFromSoup('User', {}, [], null, [` WHERE {User:Id}='${recordId}'`])
    ]).then((values) => {
        try {
            const visitLists = values[0]
            const employeeInfos = values[1]

            const visitListInfo = visitLists.length > 0 ? visitLists[0] : {}
            const employeeInfo = employeeInfos.length > 0 ? employeeInfos[0] : {}
            const todayDate = moment(new Date())
            const dataStr = visitListInfo.Visit_Date__c
            const sameWeek = todayDate.isSame(dataStr, MOMENT_STARTOF.WEEK)
            const dayIndex = moment(dataStr).format('d')
            const utcTime = dataStr
            const weekArr = getWeekArrWithDate(moment(utcTime))
            let pageName = 'EmployeeScheduleList'
            if (Persona.FSR === employeeInfo.PERSONA__c || Persona.PSR === employeeInfo.PERSONA__c) {
                pageName = 'SDLEmployeeSchedule'
            } else if (Persona.DRIVER === employeeInfo.PERSONA__c) {
                pageName = 'DelEmployeeSchedule'
            }
            navigation?.navigate(pageName, {
                navigation: navigation,
                selectedDay: parseInt(dayIndex),
                selectedWeek: sameWeek ? 1 : 0,
                reloadDate: moment(utcTime),
                tmpWeekArr: weekArr,
                employeeData: {
                    firstName: employeeInfo.FirstName,
                    lastName: employeeInfo.LastName,
                    name: employeeInfo.Name,
                    id: employeeInfo.Id,
                    userStatsId: userStatsId,
                    Id: employeeInfo.Id,
                    gpid: employeeInfo.GPID__c,
                    buid: employeeInfo.BU_ID__c,
                    persona: employeeInfo.PERSONA__c
                }
            })
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'NotificationService.preparePushData',
                `failed: ${ErrorUtils.error2String(error)}`
            )
        }
    })
}

const getVisitListQuery = (visitListId) => {
    const currentObj = CommonParam.objs.find((o) => o.soupName === 'Visit_List__c')
    let currentQuery = currentObj.initQuery.split('WHERE')[0]
    if (currentQuery.indexOf('WHERE') > -1) {
        currentQuery += " AND Id = '" + visitListId + "'"
    } else {
        currentQuery += " WHERE Id = '" + visitListId + "'"
    }
    return currentQuery
}
const getVisitQuery = (visitListId) => {
    const currentObj = CommonParam.objs.find((o) => o.soupName === 'Visit')
    let currentQuery = currentObj.initQuery.split('WHERE')[0]
    if (currentQuery.indexOf('WHERE') > -1) {
        currentQuery += " AND Visit_List__c = '" + visitListId + "'"
    } else {
        currentQuery += " WHERE Visit_List__c = '" + visitListId + "'"
    }
    return currentQuery
}

const checkManagerNotification = (messageBody, navigation) => {
    return new Promise((resolve, reject) => {
        try {
            const visitListId = messageBody.VisitListId || null
            const recordId = messageBody.UserId || null
            const userStatsId = messageBody.UserStatsId || null
            if (!recordId || !visitListId) {
                reject('')
                return
            }
            if (!messageBody.Object) {
                reject('')
                return
            }
            const objType = messageBody.Object
            const obj = CommonParam.objs.find((o) => o.soupName === objType)
            const objUser = CommonParam.objs.find((o) => o.soupName === 'User')
            if (!obj || !objUser) {
                reject('')
                return
            }
            if (obj.soupName === 'Visit_List__c') {
                Promise.all([
                    syncDownObj(objType, downLoadTargetObjectQuerySting(obj, visitListId)),
                    syncDownObj('Visit', getVisitQuery(visitListId))
                ])
                    .then(() => {
                        resolve('success')
                        preparePushData(navigation, visitListId, recordId, userStatsId)
                    })
                    .catch(() => {
                        reject('')
                    })
            }
            if (obj.soupName === 'Visit') {
                Promise.all([
                    syncDownObj(objType, downLoadTargetObjectQuerySting(obj, messageBody.Id)),
                    syncDownObj('Visit_List__c', getVisitListQuery(visitListId))
                ])
                    .then(() => {
                        resolve('success')
                        preparePushData(navigation, visitListId, recordId, userStatsId)
                    })
                    .catch(() => {
                        reject('')
                    })
            }

            if (obj.soupName === 'Shipment') {
                // FUTURE: may use userStatsId to show photo
                SoupService.retrieveDataFromSoup('Shipment', {}, [], null, [` WHERE {Shipment:Id}='${recordId}'`]).then(
                    (res) => {
                        resolve('success')
                        navigation?.navigate('DeliveryInformation', {
                            shipment: res[0]
                        })
                    }
                )
            }
        } catch (err) {
            reject('')
        }
    })
}

// #1232557 Merchandiser Notifications Selecting push notifications
export const handleMZNotificationClick = (notificationObj, navigation) => {
    let body
    const recordId = notificationObj?.sid || null
    try {
        body = JSON.parse(notificationObj?.aps?.alert?.body)
    } catch {}

    if (!recordId || !body) {
        return
    }

    const objType = body.Object
    const vlList = CommonParam.objs.find((soup) => soup.name === 'Visit_List__c')
    if (objType === 'Visit') {
        // Expect Visit Obj to Sync Down by AutoRefreshOfSchedule.autoRefresh() in TabComponent
        SyncService.syncDownObjWithCond(vlList).then(() => {
            navigation.navigate(CommonLabel.MY_VISIT)
            NativeAppEventEmitter.emit('notification', body)
            AutoRefreshOfSchedule.autoRefresh()
        })
    }
    if (objType === 'Shipment') {
        const q =
            CommonParam.objs.find((o) => o.soupName === 'Shipment').initQuery.split('WHERE')[0] +
            " WHERE Id = '" +
            recordId +
            "'"
        syncDownObj('Shipment', q).then(() => {
            SoupService.retrieveDataFromSoup(
                'Order',
                {},
                [
                    'OrderId',
                    'Dlvry_Rqstd_Dtm__c',
                    'Order_Pallet_Count__c',
                    'Id',
                    'Retail_Store__c',
                    'OwnerId',
                    'Pallet_Count__c',
                    'ActualDeliveryDate',
                    'ExpectedDeliveryDate',
                    'CreatedDate',
                    'TotalItemsQuantity',
                    'ShipToName',
                    'Description',
                    'Employee_Id__c',
                    'Total_Certified__c',
                    'Total_Delivered__c',
                    'Total_Ordered__c',
                    'UserId',
                    'UserName',
                    'FirstName',
                    'MobilePhone',
                    'LastName',
                    'Phone',
                    'userStatsId',
                    'orderQuantity'
                ],
                ` SELECT
                {Order:Ordr_Id__c},
                {Order:Dlvry_Rqstd_Dtm__c},
                {Order:Pallet_Total_IntCount__c},
                {Shipment:Id},
                {Shipment:Retail_Store__c},
                {Shipment:OwnerId},
                {Shipment:Pallet_Count__c},
                {Shipment:ActualDeliveryDate},
                {Shipment:ExpectedDeliveryDate},
                {Shipment:CreatedDate},
                {Shipment:TotalItemsQuantity},
                {Shipment:ShipToName},
                {Shipment:Description},
                {Shipment:Employee_Id__c},
                {Shipment:Total_Certified__c},
                {Shipment:Total_Delivered__c},
                {Shipment:Total_Ordered__c},
                {User:Id},
                {User:Name},
                {User:FirstName},
                {User:MobilePhone},
                {User:LastName},
                {User:Phone},
                {User_Stats__c:Id},
                {Order:Total_Ordered_IntCount__c}
                FROM {Order} 
                LEFT JOIN {Shipment} ON {Shipment:Order_Id__c} = {Order:Ordr_Id__c}
                LEFT JOIN {User} ON {Shipment:Employee_Id__c} = {User:GPID__c}
                LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id} 
                WHERE {Shipment:Id}='${recordId}'
                `
            ).then((res: any[]) => {
                navigation?.navigate('DeliveryInformation', {
                    shipment: res[0]
                })
                NativeAppEventEmitter.emit(EventEmitterType.NOTIFICATION_SHIPMENT, res[0])
            })
        })
    }
}

export const navigateToCustomerDetail = (target: string, navigation: any) => {
    return new Promise((resolve, reject) => {
        try {
            SoupService.retrieveDataFromSoup(
                'RetailStore',
                {},
                ScheduleQuery.getMyCustomerQuery.f,
                formatString(ScheduleQuery.getMyCustomerQuery.q, ['']) + ` WHERE {RetailStore:AccountId}='${target}'`
            )
                .then((result: any[]) => {
                    const items = assembleCustomerData(result, null)
                    const stores = Object.values(items)
                    navigation.navigate(NavigationRoute.CUSTOMER_DETAIL, {
                        customerData: stores[0],
                        mapInfo: {
                            region: null
                        },
                        actTab: ActiveTabName.PROFILE
                    })
                    resolve('')
                })
                .catch((err) => {
                    reject('')
                    storeClassLog(Log.MOBILE_ERROR, 'prepareRetailStoreData', ErrorUtils.error2String(err))
                })
        } catch (e) {
            reject('')
            storeClassLog(Log.MOBILE_ERROR, 'navigateToCustomerDetail ', ErrorUtils.error2String(e))
        }
    })
}

export const handleFormNotification = (notificationMsg: any, navigation: any) => {
    const retailStoreId = notificationMsg?.RetailStoreId
    const CType = notificationMsg?.CType
    if ([RealogramNotificationType.REALOGRAM, RealogramNotificationType.IRNotLoad].includes(CType)) {
        goToRealogramScreen({ navigation, retailStoreId })
    } else {
        if (isPersonaMD()) {
            navigation.navigate(CommonLabel.MY_VISIT)
        } else if (isPersonaSDL() || isPersonaPSR() || isPersonaKAM()) {
            goToAuditAndContractTab({ navigation, retailStoreId })
        }
    }
}

const checkNotification = (content, navigation) => {
    try {
        if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
            clearNotifications()
        }
        const recordId = content?.sid || null
        const notificationId = content?.nid || null
        if (!recordId || !notificationId) {
            return
        }
        if (!content.alertBody) {
            return
        }

        restDataCommonCall(`${CommonApi.PBNA_MOBILE_API_CONNECT_NOTIFICATION}/${notificationId}`, 'GET')
            .then((res) => {
                const resBody = res.data
                let jsonBody = null
                try {
                    const messageBody = decode(resBody.messageBody)
                    jsonBody = JSON.parse(messageBody)
                } catch (error) {
                    jsonBody = null
                }

                checkManagerNotification(jsonBody, navigation)
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'NotificationService.checkNotification.checkManagerNotification',
                    `get notification ${notificationId} failed: ${ErrorUtils.error2String(err)}`
                )
            })
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'NotificationService.checkNotification',
            ` failed: ${ErrorUtils.error2String(err)}`
        )
    }
}

export const NotificationService = {
    checkNotification,
    clearNotifications,
    checkManagerNotification
}

export default NotificationService
