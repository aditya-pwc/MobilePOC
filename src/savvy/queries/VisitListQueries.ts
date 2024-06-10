const targetKeys = [
    'Id',
    'Name',
    'OwnerId',
    'Visit_List_Group__c',
    'RecordType.Name',
    'LastModifiedDate',
    'Start_Location__latitude__s',
    'Start_Location__longitude__s',
    'Start_Location__c',
    'End_Location__latitude__s',
    'End_Location__longitude__s',
    'Start_Date__c',
    'End_Date__c',
    'Start_Time__c',
    'End_Time__c',
    'Visit_Date__c',
    'RecordTypeId',
    'Status__c',
    'Planned_Service_Time__c',
    'Planned_Travel_Time__c',
    'Total_Planned_Time__c'
]
const VisitListQueries = {
    getWeekVisitList: {
        queriesStr:
            'SELECT {Visit_List__c:Id}, {Visit_List__c:Name}, {Visit_List__c:OwnerId}, {Visit_List__c:Visit_List_Group__c}' +
            ', {Visit_List__c:RecordType.Name}, {Visit_List__c:LastModifiedDate}, {Visit_List__c:Start_Location__latitude__s},{Visit_List__c:Start_Location__longitude__s}' +
            ', {Visit_List__c:Start_Location__c}, {Visit_List__c:End_Location__latitude__s}, {Visit_List__c:End_Location__longitude__s}' +
            ', {Visit_List__c:Start_Date__c}, {Visit_List__c:End_Date__c}, {Visit_List__c:Start_Date_Time__c}, {Visit_List__c:End_Date_Time__c}' +
            ',{Visit_List__c:Visit_Date__c},{Visit_List__c:RecordTypeId},{Visit_List__c:Status__c},{Visit_List__c:Planned_Service_Time__c},{Visit_List__c:Planned_Travel_Time__c},{Visit_List__c:Total_Planned_Time__c}' +
            ',{Visit_List__c:_soupEntryId},{Visit_List__c:__local__},{Visit_List__c:__locally_created__},{Visit_List__c:__locally_updated__},{Visit_List__c:__locally_deleted__}' +
            " FROM {Visit_List__c} WHERE {Visit_List__c:OwnerId}='%s' AND {Visit_List__c:Start_Date__c}='%s' AND {Visit_List__c:End_Date__c}='%s' AND {Visit_List__c:RecordType.Name}='Visit List Group' ORDER BY {Visit_List__c:Start_Time__c} DESC",
        targetValues: targetKeys
    },
    getDailyVisitList: {
        queriesStr:
            'SELECT {Visit_List__c:Id}, {Visit_List__c:Name}, {Visit_List__c:OwnerId}, {Visit_List__c:Visit_List_Group__c}' +
            ', {Visit_List__c:RecordType.Name}, {Visit_List__c:LastModifiedDate}, {Visit_List__c:Start_Location__latitude__s},{Visit_List__c:Start_Location__longitude__s}' +
            ', {Visit_List__c:Start_Location__c}, {Visit_List__c:End_Location__latitude__s}, {Visit_List__c:End_Location__longitude__s}' +
            ', {Visit_List__c:Start_Date__c}, {Visit_List__c:End_Date__c}, {Visit_List__c:Start_Date_Time__c}, {Visit_List__c:End_Date_Time__c}' +
            ',{Visit_List__c:Visit_Date__c},{Visit_List__c:RecordTypeId},{Visit_List__c:Status__c},{Visit_List__c:Planned_Service_Time__c},{Visit_List__c:Planned_Travel_Time__c},{Visit_List__c:Total_Planned_Time__c}' +
            ',{Visit_List__c:_soupEntryId},{Visit_List__c:__local__},{Visit_List__c:__locally_created__},{Visit_List__c:__locally_updated__},{Visit_List__c:__locally_deleted__}' +
            " FROM {Visit_List__c} WHERE {Visit_List__c:OwnerId}='%s' AND {Visit_List__c:RecordType.Name}='Daily Visit List'" +
            " AND (({Visit_List__c:Visit_Date__c}='%s' AND {Visit_List__c:End_Date_Time__c} IS NULL AND {Visit_List__c:Start_Date_Time__c} IS NOT NULL)" +
            " OR ({Visit_List__c:Visit_Date__c} ='%s' AND {Visit_List__c:End_Date_Time__c} IS NULL))" +
            ' ORDER BY {Visit_List__c:Visit_Date__c} ASC,{Visit_List__c:Start_Date_Time__c} ASC',
        targetValues: targetKeys
    }
}

export default VisitListQueries
