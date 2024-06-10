/* eslint-disable camelcase */
import Account from './Account'
import Application_Configuration__mdt from './Application_Configuration__mdt'
import CartDetail from './CartDetail'
import CartItem from './CartItem'
import Customer_to_Route__c from './Customer_to_Route__c'
import Employee_To_Route__c from './Employee_To_Route__c'
import Order from './Order'
import OrderItem from './OrderItem'
import PricebookEntry from './PricebookEntry'
import Product2 from './Product2'
import RecordType from './RecordType'
import RetailStore from './RetailStore'
import Route_Sales_Geo__c from './Route_Sales_Geo__c'
import Product_Listing__c from '../config/ProductListing'
import SDF_LGR_Log__c from './SDF_LGR_Log__c'
import Shipment from './Shipment'
import ShipmentItem from './ShipmentItem'
import StoreProduct from './StoreProduct'
import Task from './Task'
import User from './User'
import User_Stats__c from './User_Stats__c'
import Visit from './Visit'
import VisitList from './VisitList'
import Event from './Event'
import Product_Exclusion__c from './Product_Exclusion__c'
import LogItem from './LogItem'
import Tmp_fd_prc from './Tmp_fd_prc'

const ORDConfig = {
    name: 'PSR',
    tab: ['Copilot', 'My day', 'My Customer'],
    objs: [
        RetailStore,
        StoreProduct,
        Visit,
        Task,
        VisitList,
        RecordType,
        Order,
        PricebookEntry,
        Event,
        CartItem,
        Shipment,
        ShipmentItem,
        OrderItem,
        User_Stats__c,
        Customer_to_Route__c,
        Route_Sales_Geo__c,
        CartDetail,
        Account,
        SDF_LGR_Log__c,
        Product2,
        Product_Listing__c,
        Application_Configuration__mdt,
        User,
        Employee_To_Route__c,
        Product_Exclusion__c,
        LogItem,
        Tmp_fd_prc
    ]
}

export default ORDConfig
