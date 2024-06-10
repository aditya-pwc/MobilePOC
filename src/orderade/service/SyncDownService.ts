import _ from 'lodash'
import { isTrueInDB } from '../../savvy/utils/CommonUtils'
import EventService from '../service/EventService'
import OrderService from '../service/OrderService'
import PriceService from '../service/PriceService'
import ProductService from '../service/ProductService'
import VisitService from '../service/VisitService'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import VisitDM from '../domain/visit/VisitDM'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { todayDateWithTimeZone } from '../../common/utils/TimeZoneUtils'
import moment from 'moment'
import AccountDM from '../domain/account/AccountDM'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import CommonService from './CommonService'
import UserService from './UserService'
export default class SyncDownService {
    static async getExtraDataForMyDayScreen() {
        try {
            // Since my day screen will display not only the visits from the current route,
            // but also the visits from other routes that belongs to the current user,
            // We will pull extra data basing on the extra visit lists
            const [productListings, , uvls] = await Promise.all([
                ProductService.syncDownProductListingAndProductData(),
                ProductService.syncDownProductExclusionData(),
                VisitService.syncDownCurUserUVLs()
            ])
            const productIds = _.uniq(
                productListings.filter((el: any) => isTrueInDB(el.Inven_Avail_Flag__c)).map((el) => el.Inven_Id__c)
            ) as string[]
            const [dealProdListData] = await Promise.all([
                PriceService.syncDownDealProductListData(productIds),
                VisitService.syncDownUVLVisits(uvls)
            ])
            // need to download related price zone data first, because we need the related pz ids
            // in fetchCustomerDealOtherRouteData and fetchCustomerDealData method
            await PriceService.syncDownPricingDataForAdHocVisits([], true)
            await Promise.all([
                ProductService.syncDownProductExclusionOtherRouteData(),
                OrderService.getAllOrderData(uvls, false),
                PriceService.syncDownPriceBookEntryData(),
                PriceService.incrementalSyncPricingData(
                    productIds,
                    dealProdListData?.map((dealProd) => dealProd?.Deal_Id__c) || []
                ),
                EventService.syncDownEventDataForMyDayScreen(),
                ProductService.syncDownStoreProduct([], productIds)
            ])
            await PriceService.syncDownCustomerDealData()
            await PriceService.syncDownCustomerDealOtherRouteData()
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: getExtraDataForMyDayScreen',
                'Fetch Data Fail: ' + ErrorUtils.error2String(e)
            )
        }
    }

    static async deltaSyncDown(date: string, dropDownRef: any) {
        try {
            const today = todayDateWithTimeZone(true)
            // if the user is psr user, initial sync happens at lastModifiedDate
            const psrLastModifiedDate = (await AsyncStorage.getItem('configLastSyncTime')) || ''
            let lastModifiedDate
            let tab
            const newStamp = new Date().toISOString()
            // delta sync should has separate last sync date for past today and future tab
            if (moment(date) < moment(today)) {
                lastModifiedDate =
                    (await AsyncStorage.getItem('OrderadeMyDayPastLastSyncedDate')) || psrLastModifiedDate
                tab = 'past'
            } else if (moment(date) > moment(today)) {
                lastModifiedDate =
                    (await AsyncStorage.getItem('OrderadeMyDayFutureLastSyncedDate')) || psrLastModifiedDate
                tab = 'future'
            } else {
                lastModifiedDate =
                    (await AsyncStorage.getItem('OrderadeMyDayTodayLastSyncedDate')) || psrLastModifiedDate
                tab = 'today'
            }
            await VisitDM.deltaSyncDownVLsAndVisits(tab, lastModifiedDate)

            const tasks = []
            if (tab === 'past') {
                tasks.push(OrderService.deltaSyncDownPastOrders(lastModifiedDate))
            }
            tasks.push(AccountDM.deltaSyncDownRetailStoreAndCTR(lastModifiedDate))
            await Promise.all(tasks)

            await Promise.all([
                ProductService.deltaSyncDownStoreProduct(lastModifiedDate),
                OrderService.deltaSyncAndReplaceOrder()
            ])

            if (tab === 'past') {
                await AsyncStorage.setItem('OrderadeMyDayPastLastSyncedDate', newStamp)
            } else if (tab === 'future') {
                await AsyncStorage.setItem('OrderadeMyDayFutureLastSyncedDate', newStamp)
            } else {
                await AsyncStorage.setItem('OrderadeMyDayTodayLastSyncedDate', newStamp)
            }
        } catch (e) {
            dropDownRef.current.alertWithType('error', 'Refresh Failed:' + ErrorUtils.error2String(e))
            storeClassLog(Log.MOBILE_ERROR, 'Orderade Pull Down Refresh', 'Refresh Fail: ' + ErrorUtils.error2String(e))
            Instrumentation.leaveBreadcrumb(
                'Pull down refresh failed: ' + ErrorUtils.error2String(e),
                BreadcrumbVisibility.CRASHES_AND_SESSIONS
            )
        }
    }

    static async syncDownVisitAndRelatedOrder(visitId: string) {
        try {
            await VisitService.syncUpCurrentVisit(visitId)
            const visitSyncFields = CommonService.getAllFieldsByObjName('Visit', 'Remote')
            const orderSyncFields = CommonService.getAllFieldsByObjName('Order', 'Remote')
            const orderItemSyncFields = CommonService.getAllFieldsByObjName('OrderItem', 'Remote')
            const [orderData] = await Promise.all([
                CommonService.syncDown({
                    name: 'Order',
                    whereClause: `Visit__c = '${visitId}'`,
                    updateLocalSoup: true,
                    fields: orderSyncFields,
                    allOrNone: true
                }),
                CommonService.syncDown({
                    name: 'OrderItem',
                    whereClause: `Order.Visit__c = '${visitId}'`,
                    updateLocalSoup: true,
                    fields: orderItemSyncFields,
                    allOrNone: true
                }),
                CommonService.syncDown({
                    name: 'Visit',
                    whereClause: `Id = '${visitId}'`,
                    updateLocalSoup: true,
                    fields: visitSyncFields,
                    allOrNone: true
                })
            ])
            const userGPIds = _.uniq(orderData.map((v: any) => v.Created_By_GPID__c))
            if (userGPIds.length) {
                await UserService.syncDownOrderRelatedData(userGPIds)
            }
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'Orderade: syncDownVisitAndRelatedOrder',
                `syncDownVisitAndRelatedOrder failed: ${JSON.stringify(e)}`
            )
        }
    }
}
