import { getRecordTypeIdByDeveloperName } from '../../savvy/utils/CommonUtils'
import {
    getCompletedDeliveryCount,
    getCompletedMerchandisingCount,
    getCompletedOrderCount,
    getPlannedDeliveryCount,
    getPlannedMerchandisingCount,
    getPlannedOrderCount
} from '../domain/my-day/MyDayMetricData'

export const getRouteInfoMetrics = async (selectedDate: string) => {
    const salesRecordTypeId = await getRecordTypeIdByDeveloperName('Sales', 'Visit')
    const ctrRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
    const deliveryRecordTypeId = await getRecordTypeIdByDeveloperName('Delivery', 'Visit')
    const merchandisingRecordTypeId = await getRecordTypeIdByDeveloperName('Merchandising', 'Visit')
    const plannedOrderCount = await getPlannedOrderCount(salesRecordTypeId, ctrRecordTypeId, selectedDate)
    const completedOrderCount = await getCompletedOrderCount(ctrRecordTypeId, selectedDate)
    const plannedDeliveryCount = await getPlannedDeliveryCount(deliveryRecordTypeId, ctrRecordTypeId, selectedDate)
    const completedDeliveryCount = await getCompletedDeliveryCount(deliveryRecordTypeId, ctrRecordTypeId, selectedDate)
    const plannedMerchandisingCount = await getPlannedMerchandisingCount(
        merchandisingRecordTypeId,
        ctrRecordTypeId,
        selectedDate
    )
    const completedMerchandisingCount = await getCompletedMerchandisingCount(
        merchandisingRecordTypeId,
        ctrRecordTypeId,
        selectedDate
    )
    return {
        plannedOrderCount,
        completedOrderCount,
        plannedDeliveryCount,
        completedDeliveryCount,
        plannedMerchandisingCount,
        completedMerchandisingCount
    }
}
