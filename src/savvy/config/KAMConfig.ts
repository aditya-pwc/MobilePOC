/* eslint-disable camelcase */
import { baseObjects } from '../../common/config/BaseObjects'
import Lead__x from './kam/objects/Lead__x'
import User from './kam/objects/User'
import Contact from './kam/objects/Contact'
import Customer_to_Route__c from './kam/objects/Customer_to_Route__c'
import Notification from './kam/objects/Notification'
import Task from './kam/objects/Task'
import Account from './kam/objects/Account'
import RetailStore from './kam/objects/RetailStore'
import Shipment from './kam/objects/Shipment'
import User_Stats__c from './kam/objects/User_Stats__c'
import Route_Sales_Geo__c from './kam/objects/Route_Sales_Geo__c'
import Asset from './kam/objects/Asset'
import Visit from './kam/objects/Visit'
import Breadcrumb_Timestamps__c from './kam/objects/Breadcrumb_Timestamps__c'
import Event from './kam/objects/Event'
import AccountTeamMember from './kam/objects/AccountTeamMember'
import Service_Detail__c from './kam/objects/Service_Detail__c'
import Employee_To_Route__c from './kam/objects/Employee_To_Route__c'
import Visit_List__c from './kam/objects/Visit_List__c'
import Request__c from './kam/objects/Request__c'
import Asset_Attribute__c from './kam/objects/Asset_Attribute__c'
import Time_Interval_Configuration__mdt from './kam/objects/Time_Interval_Configuration__mdt'
import Order from './kam/objects/Order'
import OrderItem from './kam/objects/OrderItem'
import Segment_Hierarchy_Image_Mapping__mdt from './kam/objects/Segment_Hierarchy_Image_Mapping__mdt'
import Customer_Wiring_Users__c from './kam/objects/Customer_Wiring_Users__c'
import Customer_Wiring_Definition__c from './kam/objects/Customer_Wiring_Definition__c'
import ShipmentItem from './kam/objects/ShipmentItem'
import PepsiCo_Period_Calendar__mdt from './kam/objects/PepsiCo_Period_Calendar__mdt'
import StoreProduct from './kam/objects/StoreProduct'
import Executional_Framework__c from './kam/objects/Executional_Framework__c'
import RetailVisitKpi from './psr/objects/RetailVisitKpi'
import Contract from './psr/objects/Contract'
import StorePriority__c from './kam/objects/StorePriority__c'
import Mission_Id__mdt from './psr/objects/Mission_Id__mdt'
import Customer_Deal__c from './kam/objects/Customer_Deal__c'

const KAMConfig = {
    name: 'Key Account Manager',
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
        StoreProduct,
        Executional_Framework__c,
        Contract,
        StorePriority__c,
        RetailVisitKpi,
        PepsiCo_Period_Calendar__mdt,
        Mission_Id__mdt,
        Customer_Deal__c
    ]
}

export default KAMConfig
