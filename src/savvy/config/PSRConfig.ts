/* eslint-disable camelcase */
import { baseObjects } from '../../common/config/BaseObjects'
import Lead__x from './psr/objects/Lead__x'
import User from './psr/objects/User'
import Contact from './psr/objects/Contact'
import Customer_to_Route__c from './psr/objects/Customer_to_Route__c'
import Notification from './psr/objects/Notification'
import Task from './psr/objects/Task'
import Account from './psr/objects/Account'
import RetailStore from './psr/objects/RetailStore'
import Shipment from './psr/objects/Shipment'
import User_Stats__c from './psr/objects/User_Stats__c'
import Route_Sales_Geo__c from './psr/objects/Route_Sales_Geo__c'
import Asset from './psr/objects/Asset'
import Visit from './psr/objects/Visit'
import Breadcrumb_Timestamps__c from './psr/objects/Breadcrumb_Timestamps__c'
import Event from './psr/objects/Event'
import AccountTeamMember from './psr/objects/AccountTeamMember'
import Service_Detail__c from './psr/objects/Service_Detail__c'
import Employee_To_Route__c from './psr/objects/Employee_To_Route__c'
import Visit_List__c from './psr/objects/Visit_List__c'
import Request__c from './psr/objects/Request__c'
import Asset_Attribute__c from './psr/objects/Asset_Attribute__c'
import ShipmentItem from './psr/objects/ShipmentItem'
import OrderItem from './psr/objects/OrderItem'
import StoreProduct from './psr/objects/StoreProduct'
import Application_Configuration__mdt from './psr/objects/Application_Configuration__mdt'
import MetricsProduct from './psr/objects/MetricsProduct'
import Order from './psr/objects/Order'
import Time_Interval_Configuration__mdt from './psr/objects/Time_Interval_Configuration__mdt'
import Preset from './psr/objects/Preset'
import Segment_Hierarchy_Image_Mapping__mdt from './psr/objects/Segment_Hierarchy_Image_Mapping__mdt'
import Customer_Wiring_Users__c from './fsr/objects/Customer_Wiring_Users__c'
import Customer_Wiring_Definition__c from './fsr/objects/Customer_Wiring_Definition__c'
import Executional_Framework__c from './psr/objects/Executional_Framework__c'
import PepsiCo_Period_Calendar__mdt from './psr/objects/PepsiCo_Period_Calendar__mdt'
import Contract from './psr/objects/Contract'
import PricebookEntry from './psr/objects/PricebookEntry'
import CartItem from './psr/objects/CartItem'
import CartDetail from './psr/objects/CartDetail'
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
import Product2 from './psr/objects/Product2'
import ProductListing from './psr/objects/ProductListing'
import LogItem from './psr/objects/LogItem'
import Product_Exclusion__c from './psr/objects/Product_Exclusion__c'
import StorePriority__c from './psr/objects/StorePriority__c'
import Customer_Deal__c from './psr/objects/Customer_Deal__c'
import Deal_Product_List__c from './psr/objects/Deal_Product_List__c'
import Price_Zone__c from '../../orderade/config/Price_Zone__c'
import Deal__c from '../../orderade/config/Deal__c'
import Business_Segment_Deal__c from '../../orderade/config/Business_Segment_Deal__c'
import Natl_Account_Pricing__c from '../../orderade/config/Natl_Account_Pricing__c'
import Wholesale_Price__c from '../../orderade/config/Wholesale_Price__c'
import Tmp_fd_prc from '../../orderade/config/Tmp_fd_prc'
import Ord_Staging__c from '../../orderade/config/Ord_Staging__c'
import OrdLineItem_Staging__c from '../../orderade/config/OrdLineItem_Staging__c'

const PSRConfig = {
    name: 'PSR',
    tab: ['Sales Notifications', 'Sync'],
    objs: [
        ...baseObjects,
        Lead__x,
        User,
        Contact,
        Customer_to_Route__c,
        Notification,
        Task,
        Account,
        RetailStore,
        Shipment,
        User_Stats__c,
        Route_Sales_Geo__c,
        Asset,
        Visit,
        Breadcrumb_Timestamps__c,
        Event,
        AccountTeamMember,
        Service_Detail__c,
        Employee_To_Route__c,
        Visit_List__c,
        Request__c,
        Asset_Attribute__c,
        Preset,
        Mission_Id__mdt,
        // PSR Unique:
        ShipmentItem,
        OrderItem,
        StoreProduct,
        Application_Configuration__mdt,
        MetricsProduct,
        Order,
        Time_Interval_Configuration__mdt,
        Segment_Hierarchy_Image_Mapping__mdt,
        Customer_Wiring_Users__c,
        Customer_Wiring_Definition__c,
        Executional_Framework__c,
        PepsiCo_Period_Calendar__mdt,
        Contract,
        PricebookEntry,
        CartItem,
        CartDetail,
        RetailVisitKpi,
        Product2,
        ProductListing,
        LogItem,
        Product_Exclusion__c,
        StorePriority__c,
        Customer_Deal__c,
        Deal_Product_List__c,
        Price_Zone__c,
        Deal__c,
        Business_Segment_Deal__c,
        Natl_Account_Pricing__c,
        Wholesale_Price__c,
        Tmp_fd_prc,
        Ord_Staging__c,
        OrdLineItem_Staging__c
    ]
}

export default PSRConfig
