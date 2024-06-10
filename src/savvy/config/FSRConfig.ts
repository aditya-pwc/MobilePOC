/*
 * @Description:
 * @LastEditors: Yi Li
 */
/* eslint-disable camelcase */
import { baseObjects } from '../../common/config/BaseObjects'
import Lead__x from './fsr/objects/Lead__x'
import User from './fsr/objects/User'
import Contact from './fsr/objects/Contact'
import Customer_to_Route__c from './fsr/objects/Customer_to_Route__c'
import Notification from './fsr/objects/Notification'
import Task from './fsr/objects/Task'
import Account from './fsr/objects/Account'
import RetailStore from './fsr/objects/RetailStore'
import Shipment from './fsr/objects/Shipment'
import User_Stats__c from './fsr/objects/User_Stats__c'
import Route_Sales_Geo__c from './fsr/objects/Route_Sales_Geo__c'
import Asset from './fsr/objects/Asset'
import Visit from './fsr/objects/Visit'
import Breadcrumb_Timestamps__c from './fsr/objects/Breadcrumb_Timestamps__c'
import Event from './fsr/objects/Event'
import AccountTeamMember from './fsr/objects/AccountTeamMember'
import Service_Detail__c from './fsr/objects/Service_Detail__c'
import Employee_To_Route__c from './fsr/objects/Employee_To_Route__c'
import Visit_List__c from './fsr/objects/Visit_List__c'
import Request__c from './fsr/objects/Request__c'
import Asset_Attribute__c from './fsr/objects/Asset_Attribute__c'
import Time_Interval_Configuration__mdt from './fsr/objects/Time_Interval_Configuration__mdt'
import Order from './fsr/objects/Order'
import OrderItem from './fsr/objects/OrderItem'
import Segment_Hierarchy_Image_Mapping__mdt from './fsr/objects/Segment_Hierarchy_Image_Mapping__mdt'
import Customer_Wiring_Users__c from './fsr/objects/Customer_Wiring_Users__c'
import Customer_Wiring_Definition__c from './fsr/objects/Customer_Wiring_Definition__c'
import ShipmentItem from './fsr/objects/ShipmentItem'
import PepsiCo_Period_Calendar__mdt from './fsr/objects/PepsiCo_Period_Calendar__mdt'
import Contract from './fsr/objects/Contract'
import Application_Configuration__mdt from './fsr/objects/Application_Configuration__mdt'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'
import StoreProduct from './StoreProduct'
import Customer_Deal__c from './psr/objects/Customer_Deal__c'

const FSRConfig = {
    name: 'FSR',
    tab: ['Lead', 'Sales Notifications', 'Sync'],
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
        Time_Interval_Configuration__mdt,
        Order,
        OrderItem,
        Segment_Hierarchy_Image_Mapping__mdt,
        Customer_Wiring_Users__c,
        Customer_Wiring_Definition__c,
        ShipmentItem,
        PepsiCo_Period_Calendar__mdt,
        Contract,
        Application_Configuration__mdt,
        RetailVisitKpi,
        Mission_Id__mdt,
        StoreProduct,
        Customer_Deal__c
    ]
}

export default FSRConfig
