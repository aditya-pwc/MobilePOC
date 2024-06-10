export const NotificationQueries = {
    getNotificationQuery: {
        f: [
            'key',
            'additionalData',
            'communityId',
            'communityName',
            'count',
            'Id',
            'image',
            'lastModified',
            'messageBody',
            'messageTitle',
            'mostRecentActivityDate',
            'organizationId',
            'read',
            'recipientId',
            'seen',
            'target',
            'targetPageRef',
            'type',
            'url',
            'jsonBody'
        ],
        q:
            'SELECT {Notification:Id},{Notification:additionalData},{Notification:communityId},' +
            '{Notification:communityName},{Notification:count},{Notification:Id},{Notification:image},' +
            '{Notification:lastModified},{Notification:messageBody},{Notification:messageTitle},' +
            '{Notification:mostRecentActivityDate},{Notification:organizationId},{Notification:read},' +
            '{Notification:recipientId},{Notification:seen},{Notification:target},{Notification:targetPageRef},' +
            '{Notification:type},{Notification:url},{Notification:jsonBody},{Notification:_soupEntryId},{Notification:__local__},' +
            '{Notification:__locally_created__},{Notification:__locally_updated__},{Notification:__locally_deleted__} ' +
            'FROM {Notification} WHERE {Notification:read} IS NOT TRUE ORDER BY {Notification:lastModified} DESC'
    }
}
