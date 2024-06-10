export default {
    name: 'Segment_Hierarchy_Image_Mapping__mdt',
    soupName: 'Segment_Hierarchy_Image_Mapping__mdt',
    initQuery:
        'SELECT Id, Channel__c, Segment__c, Sub_Segment__c, Template__c FROM Segment_Hierarchy_Image_Mapping__mdt',
    fieldList: [
        {
            name: 'Id',
            type: 'string'
        },
        {
            name: 'Channel__c',
            type: 'string'
        },
        {
            name: 'Segment__c',
            type: 'string'
        },
        {
            name: 'Sub_Segment__c',
            type: 'string'
        },
        {
            name: 'Template__c',
            type: 'string'
        }
    ]
}
