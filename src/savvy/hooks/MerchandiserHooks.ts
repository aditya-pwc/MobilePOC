/**
 * @description Merchandiser hooks.
 * @author Sylvia Yuan
 * @email  yue.yuan@pwc.com
 * @date 2023-4-12
 */

import { useEffect, useState } from 'react'
import { restDataCommonCall } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { t } from '../../common/i18n/t'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const useGetRetailStore = (accountId: string, refreshFlag: number) => {
    const getInitComponentArr = () => {
        return [
            { name: t.labels.PBNA_MOBILE_MY_VISIT.toUpperCase() },
            { name: t.labels.PBNA_MOBILE_OVERVIEW.toUpperCase() },
            { name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase() }
        ]
    }
    const [retailStoreDetail, setRetailStoreDetail] = useState<any>({})
    const [componentArr, setComponentArr] = useState(getInitComponentArr)
    useEffect(() => {
        setComponentArr([...getInitComponentArr(), ...[{ name: t.labels.PBNA_MOBILE_CONTRACT_AUDIT.toUpperCase() }]])
        if (accountId) {
            const queryRetailStore = `query/?q=SELECT Id,Street,City,PostalCode,State,StateCode,MapstedPropertyId__c,Account.LOC_PROD_ID__c,Account.Name,Account.Id,Account.IsCDACustomer__c,Account.IsOTSCustomer__c,Account.CDA_Medal__c,Account.CUST_UNIQ_ID_VAL__c, Account.BUSN_SGMNTTN_LVL_3_CDV__c
            FROM RetailStore
            WHERE Account.Id='${accountId}'
            `
            restDataCommonCall(queryRetailStore, 'GET')
                .then((res) => {
                    const retailStore = res?.data?.records
                    if (retailStore.length > 0) {
                        const retailStoreTemp = {
                            ...retailStore[0],
                            'Account.CDA_Medal__c': retailStore[0].Account.CDA_Medal__c,
                            'Account.IsOTSCustomer__c': retailStore[0].Account.IsOTSCustomer__c ? '1' : '0',
                            'Account.LOC_PROD_ID__c': retailStore[0].Account.LOC_PROD_ID__c,
                            'Account.CUST_UNIQ_ID_VAL__c': retailStore[0].Account.CUST_UNIQ_ID_VAL__c,
                            AccountId: accountId
                        }
                        setRetailStoreDetail(retailStoreTemp)
                    } else {
                        setRetailStoreDetail({})
                    }
                })
                .catch((err) => {
                    setRetailStoreDetail({})
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'retrieve contract retail store data failed',
                        `retrieve contract retail store data failed:${ErrorUtils.error2String(err)}`
                    )
                })
        }
    }, [accountId, refreshFlag])

    return { retailStoreDetail, componentArr }
}
