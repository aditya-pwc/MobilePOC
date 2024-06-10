export const BCDPSRInitConfig = {
    UserInitFields: [
        'Id',
        'Name',
        'FirstName',
        'LastName',
        'PERSONA__c',
        'GM_LOC_ID__c',
        'TimeZoneSidKey',
        'MobilePhone',
        'Authorized_Locations__c',
        'GPID__c'
    ],
    getLocFields: ['Id', 'SLS_UNIT_ID__c', 'SLS_UNIT_NM__c', 'LOC_ID__c', 'Tme_Zone_Cde__c'],
    getETRFields: ['Route__r.Id', 'Route__r.LOC_ID__c', 'Route__r.GTMU_RTE_ID__c'],
    getETRForLoadFields: ['User__r.Name', 'User__r.GPID__c', 'Route__r.Id'],
    getETRLocFields: [
        'Id',
        'SLS_UNIT_ID__c',
        'SLS_UNIT_NM__c',
        'LOC_ID__c',
        'Tme_Zone_Cde__c',
        'UNIQ_ID_VAL__c',
        'RTE_STRT_DT__c'
    ]
}
