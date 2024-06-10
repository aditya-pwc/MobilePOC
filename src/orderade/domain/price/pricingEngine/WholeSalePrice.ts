/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2024-01-17 18:49:48
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-25 18:03:51
 */
import BaseInstance from '../../../../common/BaseInstance'
import { Log } from '../../../../common/enums/Log'
import { getIdClause } from '../../../../common/utils/CommonUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { PricePriority } from '../../../enum/Common'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AccountData from '../../account/AccountData'
import { compareDateToToday } from '../../../utils/CommonUtil'
import { MyDayVisitModel } from '../../../interface/MyDayVisit'

class WholeSalePrice {
    static async getProdWholeSalePrice(
        store: Partial<MyDayVisitModel>,
        today: string,
        todayAfter43: string,
        activeProdArr: Array<string>,
        buId: string,
        pricePriorityMap: Map<string, string>,
        greaterThan6weeks: string
    ) {
        try {
            const pzId = await AccountData.getPzId(store)
            const allProductsWithWhlsPrice: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
                'Wholesale_Price__c',
                ['whlslPrice', 'pzId', 'PStartDate', 'PEndDate', 'InvenId'],
                `
            SELECT
                {Wholesale_Price__c:Wholesale_Price__c},
                {Wholesale_Price__c:Pz_Id__c},
                {Wholesale_Price__c:Price_Start_Date__c},
                {Wholesale_Price__c:Price_Term_Date__c},
                {Wholesale_Price__c:Inven_Id__c}
            FROM {Wholesale_Price__c} 
            WHERE {Wholesale_Price__c:Inven_Id__c} IN (${getIdClause(activeProdArr)})
                AND {Wholesale_Price__c:Pz_Id__c} = '${pzId}'
                AND {Wholesale_Price__c:Price_Start_Date__c} <= '${todayAfter43}'
                AND {Wholesale_Price__c:Price_Term_Date__c} > '${today}'
                AND {Wholesale_Price__c:Is_Active__c} IS TRUE
            `,
                [],
                {},
                false,
                false
            )
            const tempPriceList = allProductsWithWhlsPrice.map((prod) => {
                const relativeStartVal = compareDateToToday(prod.PStartDate)
                const relativeEndVal = compareDateToToday(prod.PEndDate)
                return {
                    Cust_Id__c: store.CustUniqId,
                    Inven_Id__c: prod.InvenId,
                    Force_Deal_Flag__c: false,
                    Price: prod.whlslPrice,
                    BuId: buId,
                    PzId: prod.pzId,
                    Effective_Date: prod.PStartDate,
                    Expiration_Date: prod.PEndDate,
                    Priority: pricePriorityMap.get(PricePriority.WHOLESALE_PRICE),
                    Relative_Start_Value: relativeStartVal > 0 ? relativeStartVal : 0,
                    Relative_End_Value:
                        relativeEndVal > Number(greaterThan6weeks) ? Number(greaterThan6weeks) : relativeEndVal,
                    Deal_Name__c: PricePriority.WHOLESALE_PRICE,
                    Minimum_Quantity: 0
                }
            })
            await BaseInstance.sfSoupEngine.upsert('Tmp_fd_prc', tempPriceList)
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getProdWholeSalePrice',
                `getProdWholeSalePrice failed` + ErrorUtils.error2String(err)
            )
            throw new Error(ErrorUtils.error2String(err))
        }
    }
}

export default WholeSalePrice
