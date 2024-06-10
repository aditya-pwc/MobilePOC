import BaseInstance from '../../../common/BaseInstance'
import { getIdClause } from '../../../common/utils/CommonUtils'
import { TmpFdPrc } from '../../interface/TmpFdPrc'
import _ from 'lodash'
import { MetaLabelTypes, PricePriority } from '../../enum/Common'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export default class PriceData {
    static async getPriceGroupForAllProduct(
        allProducts: { 'Product.Material_Unique_ID__c': string }[],
        custUniqId: string,
        isReturn?: boolean,
        wholeSalePriority?: number | null
    ) {
        const priceData = (await BaseInstance.sfSoupEngine.retrieve(
            'Tmp_fd_prc',
            [
                'Uniq_Id',
                'Deal_Id__c',
                'Inven_Id__c',
                'Price',
                'Force_Deal_Flag__c',
                'Deal_Name__c',
                'Minimum_Quantity',
                'Priority',
                'Relative_Start_Value',
                'Relative_End_Value',
                'Deal_Category_Code__c',
                'Cust_Id__c',
                'Effective_Date',
                'Expiration_Date'
            ],
            `
        SELECT
            {Tmp_fd_prc:Inven_Id__c} ||
                COALESCE({Tmp_fd_prc:Deal_Name__c}, '') ||
                COALESCE({Tmp_fd_prc:Deal_Id__c}, '') ||
                COALESCE({Tmp_fd_prc:Price}, '0.0') ||
                {Tmp_fd_prc:Effective_Date} ||
            COALESCE({Tmp_fd_prc:Minimum_Quantity}, '0.0'),
            {Tmp_fd_prc:Deal_Id__c},
            {Tmp_fd_prc:Inven_Id__c},
            {Tmp_fd_prc:Price},
            {Tmp_fd_prc:Force_Deal_Flag__c},
            {Tmp_fd_prc:Deal_Name__c},
            COALESCE({Tmp_fd_prc:Minimum_Quantity}, '0.0'),
            {Tmp_fd_prc:Priority},
            {Tmp_fd_prc:Relative_Start_Value},
            {Tmp_fd_prc:Relative_End_Value},
            {Tmp_fd_prc:Deal_Category_Code__c},
            {Tmp_fd_prc:Cust_Id__c},
            {Tmp_fd_prc:Effective_Date},
            {Tmp_fd_prc:Expiration_Date}
        FROM {Tmp_fd_prc}
        WHERE {Tmp_fd_prc:Inven_Id__c} IN (${getIdClause(
            allProducts.map((prod) => prod['Product.Material_Unique_ID__c'])
        )})
        AND {Tmp_fd_prc:Cust_Id__c} = '${custUniqId}'
        ${isReturn ? `AND COALESCE({Tmp_fd_prc:Minimum_Quantity}, '0.0') = '0.0'` : ''}
        ${
            !Number.isNaN(wholeSalePriority) && wholeSalePriority
                ? `AND {Tmp_fd_prc:Priority} = '${wholeSalePriority}'`
                : ''
        }
        AND {Tmp_fd_prc:Price} IS NOT NULL
        ORDER BY {Tmp_fd_prc:Priority} * 1 DESC, 
        {Tmp_fd_prc:Option_Priority} * 1 DESC,
        {Tmp_fd_prc:Price} * 1 ASC,
        {Tmp_fd_prc:Minimum_Quantity} * 1 DESC
        `,
            [],
            {},
            false,
            false
        )) as unknown as TmpFdPrc[]
        return _.groupBy(_.uniqBy(priceData, 'Uniq_Id'), 'Inven_Id__c')
    }

    static async getPricePriorityMap() {
        const pricePriorityName = [
            PricePriority.WHOLESALE_PRICE,
            PricePriority.BUSINESS_SEGMENT_DEAL,
            PricePriority.CUSTOMER_DEAL,
            PricePriority.BU_RESTRICTED_DEAL,
            PricePriority.PO_DEAL,
            PricePriority.SDC,
            PricePriority.BASE_NATIONAL_PRICE,
            PricePriority.NATIONAL_ACCOUNT_DEAL,
            PricePriority.OVERRIDE,
            PricePriority.CS_GRID,
            PricePriority.BU_QUERY_TARGET,
            PricePriority.OTHER_DEALS
        ]
        const pricePriority = await BaseInstance.sfSoupEngine.retrieve('Application_Configuration__mdt', [], '', [
            `WHERE {Application_Configuration__mdt:MasterLabel} IN (${getIdClause(pricePriorityName)})`
        ])
        const pricePriorityMap = new Map()
        pricePriority.forEach((pp) => {
            pricePriorityMap.set(pp.MasterLabel, pp.Value__c)
        })
        return pricePriorityMap
    }

    static async getGreaterThan6Weeks() {
        const greaterThan6weeks: Array<any> = await BaseInstance.sfSoupEngine.retrieve(
            'Application_Configuration__mdt',
            [],
            '',
            [`WHERE {Application_Configuration__mdt:MasterLabel} = 'Greater than 6 weeks'`]
        )
        return greaterThan6weeks
    }

    static async getExistPriceDataForStore(store: any) {
        const existPriceDataForStore = await BaseInstance.sfSoupEngine
            .dynamicRetrieve('Tmp_fd_prc')
            .select(['Cust_Id__c'])
            .where([
                {
                    leftField: 'Cust_Id__c',
                    operator: '=',
                    rightField: `'${store.CustUniqId}'`
                }
            ])
            .getData(false)
        return existPriceDataForStore
    }

    static async deleteDataFromTempTable(store: any) {
        try {
            const deleteData = await BaseInstance.sfSoupEngine.retrieve('Tmp_fd_prc', ['_soupEntryId'], '', [
                `WHERE {Tmp_fd_prc:Cust_Id__c} = '${store.CustUniqId}'`
            ])
            await BaseInstance.sfSoupEngine.removeRecords(
                'Tmp_fd_prc',
                deleteData.map((v) => v._soupEntryId)
            )
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: priceCalculateProcess',
                `priceCalculateProcess failed` + ErrorUtils.error2String(e)
            )
        }
    }

    static async retrieveLocalPZData(PZIds: Array<string>) {
        const PZData = await BaseInstance.sfSoupEngine.retrieve('Price_Zone__c', ['Id', 'Pz_Id__c'], undefined, [
            `
            WHERE {Price_Zone__c:Is_Active__c} = true AND {Price_Zone__c:PBG_Pz_Id__c} IN (${getIdClause(PZIds)})
        `
        ])
        return _.isEmpty(PZData) ? [] : PZData.map((priceZoneRecord) => `${priceZoneRecord?.Pz_Id__c}`)
    }

    static async getWholeSalePriceRules(
        materialIds: string[],
        custUniqIds: string[],
        priority: string,
        relativeDelDate: number
    ) {
        const where: string[] = [`{Tmp_fd_prc:Priority} = '${priority}'`]
        if (custUniqIds.length) {
            where.push(`{Tmp_fd_prc:Cust_Id__c} IN (${getIdClause(custUniqIds)})`)
        }
        if (materialIds.length) {
            where.push(`{Tmp_fd_prc:Inven_Id__c} IN (${getIdClause(materialIds)})`)
        }
        const all = (await BaseInstance.sfSoupEngine.retrieve('Tmp_fd_prc', [], '', [
            `WHERE ${where.join(' AND ')}`
        ])) as unknown as TmpFdPrc[]
        return all.filter((a) => {
            return Number(a.Relative_Start_Value) <= relativeDelDate && Number(a.Relative_End_Value) >= relativeDelDate
        })
    }

    static async getWholeSaleMaxPriceFromMeta() {
        const [metaRecord] = await BaseInstance.sfSoupEngine.retrieve('Application_Configuration__mdt', [], undefined, [
            `WHERE {Application_Configuration__mdt:MasterLabel} = '${MetaLabelTypes.WHOLESALE_MAX_PRICE}'`
        ])
        const wholeSaleMaxPriceFromMeta = metaRecord?.Value__c
        if (Number(wholeSaleMaxPriceFromMeta) > 0) {
            return wholeSaleMaxPriceFromMeta
        }
        return MetaLabelTypes.WHOLESALE_MAX_PRICE_FALLBACK
    }
}
