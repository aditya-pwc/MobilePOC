/* eslint-disable camelcase */
/**
 * @description Wiring Hooks
 * @author Sheng Huang
 * @date 2022/5/27
 */

import { restDataCommonCall, syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../api/SyncUtils'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import { replaceQuotesToWildcard } from '../utils/RepUtils'

export const useCustomerWiring = (userId: string, wiringRefreshTimes: number) => {
    const [userWringDefinition, setUserWringDefinition] = useState([])
    useEffect(() => {
        const path =
            'query/?q=SELECT Definition_Name__c,CUST_WRNG_DEF__c,apply_to_cust__c,Apply_To_Leads__c ' +
            `FROM Customer_Wiring_Users__c WHERE USER__c = '${userId}' ORDER BY CUST_WRNG_DEF__c ASC`
        restDataCommonCall(path, 'GET').then((res) => {
            const customerWiringUsersData = res?.data?.records || []
            if (!_.isEmpty(customerWiringUsersData)) {
                const customerWiringDefList = res?.data?.records.map((v) => {
                    return `'${v?.CUST_WRNG_DEF__c}'`
                })
                const customerWiringPath =
                    'query/?q=SELECT SLS_UNIT_LVL__c,SLS_UNIT_CODE__c,SLS_UNIT_NODE__c,' +
                    'BUSN_SGMNTTN_LVL__c,BUSN_SGMNTTN_CODE__c,BUSN_SGMNTTN_NODE__c,CUST_LVL__c,CUST_LVL_NODE__c ' +
                    `FROM Customer_Wiring_Definition__c WHERE Id IN (${customerWiringDefList.join(
                        ','
                    )}) ORDER BY Id ASC`
                restDataCommonCall(customerWiringPath, 'GET').then((result) => {
                    const customerWiringDefinitionData = result?.data?.records || []
                    const wiringList = []
                    customerWiringDefinitionData?.forEach((v, k) => {
                        wiringList.push({
                            ...v,
                            Definition_Name__c: customerWiringUsersData[k]?.Definition_Name__c,
                            CUST_WRNG_DEF__c: customerWiringUsersData[k]?.CUST_WRNG_DEF__c,
                            apply_to_cust__c: customerWiringUsersData[k]?.apply_to_cust__c,
                            Apply_To_Leads__c: customerWiringUsersData[k]?.Apply_To_Leads__c
                        })
                    })
                    setUserWringDefinition(_.orderBy(wiringList, ['Definition_Name__c'], ['asc']) || [])
                })
            } else {
                setUserWringDefinition([])
            }
        })
    }, [wiringRefreshTimes])
    return userWringDefinition
}

export const getWiringDefinition = async (wiring) => {
    const processedWiringData = _.mapValues(wiring, (value) => {
        if (_.isString(value)) {
            return encodeURIComponent(replaceQuotesToWildcard(value))
        }
        return value
    })
    const path =
        'query/?q=SELECT+Id,NAME__c+' +
        `FROM+Customer_Wiring_Definition__c+WHERE+SLS_UNIT_LVL__c=%27${processedWiringData?.SLS_UNIT_LVL__c}%27+AND+SLS_UNIT_NODE__c=%27${processedWiringData?.SLS_UNIT_NODE__c}%27+` +
        `AND+BUSN_SGMNTTN_LVL__c=%27${processedWiringData?.BUSN_SGMNTTN_LVL__c}%27+AND+BUSN_SGMNTTN_CODE__c=%27${processedWiringData?.BUSN_SGMNTTN_CODE__c}%27+` +
        `AND+CUST_LVL__c=%27${processedWiringData?.CUST_LVL__c}%27+AND+CUST_LVL_NODE__c=%27${processedWiringData?.CUST_LVL_NODE__c}%27`
    const res = await restDataCommonCall(path, 'GET')
    if (res?.data?.records?.length > 0) {
        return res.data.records[0]?.Id
    }
    // No wiring definition exists, create new
    _.unset(wiring, 'apply_to_cust__c')
    _.unset(wiring, 'Apply_To_Leads__c')
    const wiringToCreate = _.assign(wiring, {
        NAME__c: `${wiring.SLS_UNIT_NODE__c} ${wiring?.CUST_LVL_NODE__c || ''} ${wiring.BUSN_SGMNTTN_NODE__c}`
    })
    const createdWiring = await restDataCommonCall('sobjects/Customer_Wiring_Definition__c', 'POST', wiringToCreate)
    return createdWiring?.data?.id
}

export const getWiringUser = async (wiringId: string, userId: string) => {
    const path =
        'query/?q=SELECT Id ' +
        `FROM Customer_Wiring_Users__c WHERE USER__c = '${userId}' AND CUST_WRNG_DEF__c = '${wiringId}'`
    return await restDataCommonCall(path, 'GET')
}

export const createWiringUser = async (
    wiringId: string,
    apply_to_cust__c: boolean,
    Apply_To_Leads__c: boolean,
    userId: string,
    persona: string
) => {
    const wiringUserToCreat = {
        USER__c: userId,
        CUST_WRNG_DEF__c: wiringId,
        USER_ROLE__c: persona,
        apply_to_cust__c: apply_to_cust__c,
        Apply_To_Leads__c: Apply_To_Leads__c
    }
    await syncUpObjCreateFromMem('Customer_Wiring_Users__c', [wiringUserToCreat], false)
}

export const updateWiringUser = async (wiringId: string, apply_to_cust__c: boolean, Apply_To_Leads__c: boolean) => {
    const wiringUserToUpDate = [
        {
            Id: wiringId,
            apply_to_cust__c: apply_to_cust__c,
            Apply_To_Leads__c: Apply_To_Leads__c
        }
    ]
    await syncUpObjUpdateFromMem('Customer_Wiring_Users__c', wiringUserToUpDate)
}
