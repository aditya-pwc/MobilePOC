/*
 * @Description:
 * @LastEditors: Yi Li
 */
/* eslint-disable camelcase */
import { baseObjects } from '../../common/config/BaseObjects'
import Lead__x from './fs-manager/objects/Lead__x'
import User from './fs-manager/objects/User'
import Contact from './fs-manager/objects/Contact'
import Customer_to_Route__c from './fs-manager/objects/Customer_to_Route__c'
import Notification from './fs-manager/objects/Notification'
import Task from './fs-manager/objects/Task'
import Account from './fs-manager/objects/Account'
import RetailStore from './fs-manager/objects/RetailStore'
import Shipment from './fs-manager/objects/Shipment'
import User_Stats__c from './fs-manager/objects/User_Stats__c'
import Route_Sales_Geo__c from './fs-manager/objects/Route_Sales_Geo__c'
import Asset from './fs-manager/objects/Asset'
import Breadcrumb_Timestamps__c from './fs-manager/objects/Breadcrumb_Timestamps__c'
import Event from './fs-manager/objects/Event'
import AccountTeamMember from './fs-manager/objects/AccountTeamMember'
import Service_Detail__c from './fs-manager/objects/Service_Detail__c'
import Employee_To_Route__c from './fs-manager/objects/Employee_To_Route__c'
import Visit_List__c from './fs-manager/objects/Visit_List__c'
import Request__c from './fs-manager/objects/Request__c'
import Asset_Attribute__c from './fs-manager/objects/Asset_Attribute__c'
import Time_Interval_Configuration__mdt from './fs-manager/objects/Time_Interval_Configuration__mdt'
import Order from './fs-manager/objects/Order'
import OrderItem from './fs-manager/objects/OrderItem'
import Segment_Hierarchy_Image_Mapping__mdt from './fs-manager/objects/Segment_Hierarchy_Image_Mapping__mdt'
import Customer_Wiring_Users__c from './fsr/objects/Customer_Wiring_Users__c'
import Customer_Wiring_Definition__c from './fsr/objects/Customer_Wiring_Definition__c'
import ShipmentItem from './fs-manager/objects/ShipmentItem'
import Visit from './crm-manager/objects/Visit'
import PepsiCo_Period_Calendar__mdt from './crm-manager/objects/PepsiCo_Period_Calendar__mdt'
import Contract from './psr/objects/Contract'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'
import StoreProduct from './StoreProduct'

const CRMBusinessAdminConfig = {
    name: 'CRM Business Admin',
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
        RetailVisitKpi,
        Mission_Id__mdt,
        StoreProduct
    ]
}

export default CRMBusinessAdminConfig
