import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAllFieldsByObjName } from '../SyncUtils'
import { setLoggedInUserTimezone, transferDateTimeInQuery } from '../TimeZoneUtils'
import { addLastModifiedDate, condRegExMap, processRegExpMap } from '../../service/SyncService'
import moment from 'moment'
import { formatString } from '../CommonUtils'
import { syncDownObj } from '../../api/SyncUtils'
import { Log } from '../../../common/enums/Log'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../common/CommonParam'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'

export const formatDatetime = (q, datetimeArray) => {
    return formatString(q, datetimeArray)
}

export const buildQuery = (q, datetimeArray, lastSyncTime?) => {
    const incrementalQuery = transferDateTimeInQuery(formatDatetime(q, datetimeArray))
    if (lastSyncTime) {
        return addLastModifiedDate(processRegExpMap([incrementalQuery], condRegExMap())[0], lastSyncTime)
    }
    return processRegExpMap([incrementalQuery], condRegExMap())
}

export const buildSyncGroup = (selectedDate, beginTime, endTime, startOfWeek, lastSyncTime?) => {
    // (Visit_Date__c >= LAST_N_DAYS:14:DATE
    const visitListQ1 = `SELECT ${getAllFieldsByObjName('Visit_List__c')} 
                         FROM Visit_List__c 
                         WHERE 
                         Status__c != 'Pre-Processed' 
                         AND (Location_Id__c = APPLY_USER_LOCATION OR USER__r.GM_LOC_ID__c = APPLY_USER_LOCATION)
                         AND (
                            (Visit_Date__c = %s
                                AND (
                                    RecordType.DeveloperName = 'Daily_Visit_List'
                                    OR RecordType.DeveloperName = 'Delivery_Daily_Visit_List'
                                    OR RecordType.DeveloperName = 'Sales_Daily_Visit_List'
                                    )
                            )
                         OR (Start_Date__c = %s AND RecordType.DeveloperName = 'Visit_List_Group')
                         OR (Start_Date__c = %s AND RecordType.DeveloperName = 'Schedule_Visit_Group'))`

    // AND Visit_Date__c >= LAST_N_DAYS:14:DATE
    // FROM Visit WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION AND Planned_Date__c >= LAST_N_DAYS:14:DATE
    const visitListQ2 = `SELECT ${getAllFieldsByObjName('Visit_List__c')} 
                         FROM Visit_List__c 
                         WHERE 
                         Status__c != 'Pre-Processed' 
                         AND Id IN 
                             (SELECT Visit_List__c 
                             FROM Visit WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION AND Planned_Date__c = %s
                             AND Status__c NOT IN ('Pre-Processed', 'Removed', 'Failed') 
                             AND Visit_List__r.Location_Id__c = null)
                         AND Visit_Date__c = %s
                         AND (
                             RecordType.DeveloperName = 'Delivery_Daily_Visit_List'
                             OR RecordType.DeveloperName = 'Sales_Daily_Visit_List'
                         )`

    // AND Planned_Date__c >= LAST_N_DAYS:14:DATE
    const visitQ = `SELECT ${getAllFieldsByObjName('Visit')}
                    FROM Visit
                    WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION 
                    AND Planned_Date__c = %s
                    AND Status__c != 'Pre-Processed'`

    // AND (
    //     (ExpectedDeliveryDate >= LAST_N_DAYS:14:TIME AND ExpectedDeliveryDate <= NEXT_N_DAYS:35:TIME)
    // OR
    // (ActualDeliveryDate >= LAST_N_DAYS:14:TIME AND ActualDeliveryDate <= NEXT_N_DAYS:35:TIME)
    // )
    const shipmentQ = `SELECT ${getAllFieldsByObjName('Shipment')}
                   FROM Shipment
                   WHERE Retail_Store__r.LOC_PROD_ID__c = APPLY_USER_LOCATION 
                   AND Status IN ('Open','Closed') AND Retail_Store__r.Account.Merchandising_Base_Minimum_Requirement__c = true
                   AND (
                        (ExpectedDeliveryDate >= %s AND ExpectedDeliveryDate <= %s) 
                        OR 
                        (ActualDeliveryDate >= %s AND ActualDeliveryDate <= %s)
                       )`

    // AND Dlvry_Rqstd_Dtm__c >= LAST_N_DAYS:14:TIME
    // AND Dlvry_Rqstd_Dtm__c <= NEXT_N_DAYS:35:TIME
    const orderQ = `SELECT ${getAllFieldsByObjName('Order')}
                    FROM Order
                    WHERE Account.LOC_PROD_ID__c = APPLY_USER_LOCATION
                    AND Dlvry_Rqstd_Dtm__c >= %s  
                    AND Dlvry_Rqstd_Dtm__c <= %s`

    const eventQ = `SELECT ${getAllFieldsByObjName('Event')}
                    FROM Event
                    WHERE isChild = false 
                    AND StartDateTime >= %s 
                    AND Location__c = APPLY_USER_LOCATION`

    const taskQ = `SELECT ${getAllFieldsByObjName('Task')}
                   FROM Task
                   WHERE
                   What.type = 'RetailStore' 
                   AND RecordType.Name = 'Work Order'
                   AND ActivityDate <= %s 
                   AND WhatId IN (SELECT Id FROM RetailStore WHERE Account.LOC_PROD_ID__c = '${
                       CommonParam.userLocationId
                   }')
    `

    return [
        {
            name: 'Visit_List__c',
            q: buildQuery(visitListQ1, [selectedDate, startOfWeek, startOfWeek], lastSyncTime)
        },
        {
            name: 'Visit_List__c',
            q: buildQuery(visitListQ2, [selectedDate, selectedDate], lastSyncTime)
        },
        {
            name: 'Visit',
            q: buildQuery(visitQ, [selectedDate], lastSyncTime)
        },
        {
            name: 'Shipment',
            q: buildQuery(shipmentQ, [beginTime, endTime, beginTime, endTime], lastSyncTime)
        },
        {
            name: 'Order',
            q: buildQuery(orderQ, [beginTime, endTime], lastSyncTime)
        },
        {
            name: 'Event',
            q: buildQuery(eventQ, [beginTime], lastSyncTime)
        },
        {
            name: 'Task',
            q: buildQuery(taskQ, [selectedDate], lastSyncTime)
        }
    ]
}

export const getData = async (date) => {
    try {
        Instrumentation.startTimer(`${CommonParam.PERSONA__c} sync down data by select day`)
        setLoggedInUserTimezone()
        const lastSyncTimeString = moment().toISOString()
        const selectedDate = date || moment()
        const beginTime = moment(selectedDate).startOf('day').toISOString()
        const endTime = moment(selectedDate).endOf('day').toISOString()
        const startOfWeek = moment(selectedDate).startOf('week').startOf('day').format(TIME_FORMAT.Y_MM_DD)
        const selectedDateString = moment(selectedDate).format(TIME_FORMAT.Y_MM_DD)
        const myDayTimeTableString = await AsyncStorage.getItem('myDaySyncTimeTable')
        let syncGroup
        const MyDayTimeTable = myDayTimeTableString ? JSON.parse(myDayTimeTableString) : {}
        if (MyDayTimeTable && MyDayTimeTable[selectedDateString]) {
            const lastSyncTime = MyDayTimeTable[selectedDateString]
            syncGroup = buildSyncGroup(selectedDateString, beginTime, endTime, startOfWeek, lastSyncTime)
        } else {
            syncGroup = buildSyncGroup(selectedDateString, beginTime, endTime, startOfWeek)
        }
        for (const obj of syncGroup) {
            await syncDownObj(obj.name, obj.q)
        }
        // @ts-ignore
        const newMyDayTimeTable = { ...MyDayTimeTable }
        newMyDayTimeTable[selectedDateString] = lastSyncTimeString
        await AsyncStorage.setItem('myDaySyncTimeTable', JSON.stringify(newMyDayTimeTable))
        Instrumentation.stopTimer(`${CommonParam.PERSONA__c} sync down data by select day`)
    } catch (e) {
        Instrumentation.stopTimer(`${CommonParam.PERSONA__c} sync down data by select day`)
        storeClassLog(
            Log.MOBILE_ERROR,
            'ManagerSyncUtils.getData',
            `${CommonParam.PERSONA__c} sync down data error: ${e}`
        )
    }
}
