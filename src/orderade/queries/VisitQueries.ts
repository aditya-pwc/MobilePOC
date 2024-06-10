const VisitQueries = {
    CreateVisitQuery: {
        CREATE_VISIT_STATUS: 'Published',
        f: [
            'RecordTypeId',
            'PlaceId',
            'Planned_Date__c',
            'Status__c',
            'Ad_Hoc__c',
            'User__c',
            'VisitorId',
            'RTE_ID__c',
            'Visit_List__c',
            '_soupEntryId'
        ]
    }
}

export default VisitQueries
