/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-17 19:12:14
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-25 18:03:37
 */
import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { NationalAccountPriceConstant, PricePriority } from '../../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'

class VolumeHurdlePrice {
    static async getVolumeHurdlePrice(
        store: MyDayVisitModel,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            const nationalAccountFlag = await AccountData.isNationalAccount(store)
            if (nationalAccountFlag) {
                const prodVolumeHurdlePrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
                    'Natl_Account_Pricing__c',
                    ['NatlAccountPrice', 'Inven_Id__c', 'NCStartDate', 'NCEndDate', 'volumeHurdle'],
                    `
        SELECT
            {Natl_Account_Pricing__c:Price__c},
            {Natl_Account_Pricing__c:Inven_Id__c},
            {Natl_Account_Pricing__c:Price_Start_Date__c},
            {Natl_Account_Pricing__c:Price_End_Date__c},
            {Natl_Account_Pricing__c:Volume_Hurdle__c}
        FROM {Natl_Account_Pricing__c}
        WHERE {Natl_Account_Pricing__c:Price_Start_Date__c} <= '${todayAfter43}'
        AND {Natl_Account_Pricing__c:Price_End_Date__c} > '${today}'
        AND {Natl_Account_Pricing__c:Natl_Acct_Type_Id__c} != '${NationalAccountPriceConstant.ACC_TYPE_ID_000}'
        AND {Natl_Account_Pricing__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
        AND {Natl_Account_Pricing__c:Bu_Id__c} = '${buId}'
        AND {Natl_Account_Pricing__c:Is_Active__c} IS TRUE
         `,
                    [],
                    {},
                    false,
                    false
                )
                const tempPriceList = prodVolumeHurdlePrice.map((prod) => {
                    const relativeStartVal = compareDateToToday(prod.NCStartDate)
                    const relativeEndVal = compareDateToToday(prod.NCEndDate)
                    return {
                        Cust_Id__c: store.CustUniqId,
                        Inven_Id__c: prod.Inven_Id__c,
                        Force_Deal_Flag__c: true,
                        Price: prod.NatlAccountPrice,
                        Deal_Name__c: 'Base National Price',
                        Priority: pricePriorityMap.get(PricePriority.BASE_NATIONAL_PRICE),
                        Effective_Date: prod.NCStartDate,
                        Expiration_Date: prod.NCEndDate,
                        Minimum_Quantity: prod.volumeHurdle,
                        Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                        Relative_End_Value:
                            relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                        BuId: buId
                    }
                })
                await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
            }
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getVolumeHurdlePrice',
                `getVolumeHurdlePrice failed` + ErrorUtils.error2String(err)
            )
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default VolumeHurdlePrice
