import { useEffect, useState } from 'react'
import _ from 'lodash'

export const useDisableSave = (distributionPoint: any, isEdit: any, copyDPList: any, isDuplicate: boolean) => {
    const [disableSave, setDisableSave] = useState(true)
    useEffect(() => {
        const isCopy = copyDPList.length > 0 && copyDPList.filter((i) => i.Id === distributionPoint.Id).length > 0
        // checkIsCopy

        if (isEdit && isCopy) {
            setDisableSave(
                !(
                    (!_.isEmpty(distributionPoint.DLVRY_MTHD_NM__c) &&
                        !_.isEmpty(distributionPoint.SLS_MTHD_NM__c) &&
                        !_.isEmpty(distributionPoint.PROD_GRP_NM__c) &&
                        !_.isEmpty(distributionPoint.Route_Text__c)) ||
                    (distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls' &&
                        !_.isEmpty(distributionPoint.Route_Text__c))
                ) || isDuplicate
            )
        } else {
            setDisableSave(
                !(
                    (!_.isEmpty(distributionPoint.DELY_DAYS__c) &&
                        !_.isEmpty(distributionPoint.DLVRY_MTHD_NM__c) &&
                        !_.isEmpty(distributionPoint.SLS_MTHD_NM__c) &&
                        !_.isEmpty(distributionPoint.PROD_GRP_NM__c) &&
                        !_.isEmpty(distributionPoint.Route_Text__c) &&
                        !_.isEmpty(distributionPoint.CUST_RTE_FREQ_CDE__c)) ||
                    (distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls' &&
                        !_.isEmpty(distributionPoint.Route_Text__c))
                ) || isDuplicate
            )
        }
    }, [distributionPoint, isDuplicate])
    return disableSave
}

export const useDistributionPointDays = (distributionPoint, setDistributionPoint, daysOpen) => {
    useEffect(() => {
        const daysOpenList = []
        _.map(daysOpen, (v, k) => {
            if (v) {
                daysOpenList.push(k)
            }
        })
        setDistributionPoint({
            ...distributionPoint,
            DELY_DAYS__c: daysOpenList.join(';')
        })
    }, [daysOpen])
}

export const SELLING_DP_SLS_METH_LIST = ['Conventional', 'Pepsi Direct', 'Pre-Sell']
