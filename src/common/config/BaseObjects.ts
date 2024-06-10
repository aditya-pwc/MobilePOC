export const baseObjects = [
    {
        name: 'RecordType',
        soupName: 'RecordType',
        base: true,
        initQuery: 'SELECT Id, SobjectType, Name, DeveloperName FROM RecordType',
        fieldList: [
            {
                name: 'Id',
                type: 'string'
            },
            {
                name: 'SobjectType',
                type: 'string'
            },
            {
                name: 'Name',
                type: 'string'
            },
            {
                name: 'DeveloperName',
                type: 'string'
            }
        ]
    },
    {
        name: 'SDF_LGR_Log__c',
        soupName: 'SDF_LGR_Log__c',
        base: true,
        fieldList: [
            {
                name: 'Message__c',
                type: 'string'
            },
            {
                name: 'Level__c',
                type: 'string'
            },
            {
                name: 'Data__c',
                type: 'string'
            },
            {
                name: 'Class__c',
                type: 'string'
            },
            {
                name: 'Reference__c',
                type: 'string'
            }
        ]
    }
]
