/**
 * @description This file is a series of utils to call the salesforce standard connect notification api
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import { restDataCommonCall } from '../SyncUtils'
import { SoupService } from '../../service/SoupService'
import moment from 'moment'

export const updateNotificationSeen = (id: string, newStatus: boolean) => {
    return restDataCommonCall(`connect/notifications/${id}`, 'PATCH', { seen: newStatus })
}

export const updateNotificationRead = (id: string, newStatus: boolean) => {
    return restDataCommonCall(`connect/notifications/${id}`, 'PATCH', { read: newStatus })
}

export const clearNotifications = (ids: string[]) => {
    return restDataCommonCall('connect/notifications', 'PATCH', {
        notificationIds: ids,
        read: true
    })
}

export const getLatestNotificationTime = async () => {
    const res = await SoupService.retrieveDataFromSoup(
        'Notification',
        {},
        ['lastModified'],
        'SELECT {Notification:lastModified} FROM {Notification} ' + ' ORDER BY {Notification:lastModified} DESC LIMIT 1'
    )
    if (res.length > 0) {
        return res[0].lastModified
    }
    return moment().subtract(21, 'day').toISOString()
}
