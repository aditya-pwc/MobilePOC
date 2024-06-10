export const ScreenMapping = {
    SDLMyTeam: ['User', 'Employee_To_Route__c', 'Route_Sales_Geo__c', 'User_Stats__c'],
    SDLMyTeamVisit: ['Visit', 'RetailStore', 'Visit_List__c'],
    SDLMyCustomer: [
        'Route_Sales_Geo__c',
        'Customer_to_Route__c',
        'Account',
        'Employee_To_Route__c',
        'User',
        'Route_Frequency_Mapping__mdt'
    ],
    SDLEmployeeProfile: ['Visit', 'RetailStore'],
    SDLEmployeeSchedule: ['Visit', 'RetailStore', 'Visit_List__c', 'User_Stats__c', 'User'],
    DelEmployeeSchedule: ['Visit', 'RetailStore', 'Visit_List__c', 'Shipment', 'User_Stats__c', 'User'],
    SDLVisitDetail: ['Shipment', 'Visit'],
    DelSupMyDay: [],
    SDLMyDay: [
        'Visit',
        'Visit_List__c',
        'RetailStore',
        'Route_Sales_Geo__c',
        'Account',
        'User_Stats__c',
        'Order',
        'Shipment'
    ],
    UGMMyCustomer: [
        'Route_Sales_Geo__c',
        'Customer_to_Route__c',
        'Account',
        'Employee_To_Route__c',
        'User',
        'RetailStore'
    ]
}

export const MerchManagerScreenMapping = {
    MyTeam: [
        'User',
        'Employee_To_Route__c',
        'Route_Sales_Geo__c',
        'User_Stats__c',
        'Service_Detail__c',
        'Customer_to_Route__c'
    ],
    MyCustomer: [
        'Route_Sales_Geo__c',
        'Customer_to_Route__c',
        'Account',
        'Employee_To_Route__c',
        'User',
        'RetailStore',
        'Service_Detail__c'
    ],
    ServiceDetailRelated: ['Service_Detail__c', 'Customer_to_Route__c', 'User', 'User_Stats__c', 'Account']
}
