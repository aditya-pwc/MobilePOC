/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-06-08 21:54:17
 * @LastEditTime: 2022-10-11 16:19:14
 * @LastEditors: Mary Qian
 */
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { Alert } from 'react-native'
import { CommonApi } from '../../../../common/api/CommonApi'
import { t } from '../../../../common/i18n/t'

const showAlert = (title: string, subTitle: string) => {
    Alert.alert(title, subTitle, [{ text: t.labels.PBNA_MOBILE_OK }], { cancelable: false })
}

export const showEndMyDayAlert = (onConfirm: () => void) => {
    Alert.alert(t.labels.PBNA_MOBILE_END_DAY, t.labels.PBNA_MOBILE_END_DAY_ALERT, [
        { text: t.labels.PBNA_MOBILE_YES, onPress: onConfirm },
        { text: t.labels.PBNA_MOBILE_NO }
    ])
}

export const showVisitOutDatedAlert = () => {
    const title = t.labels.PBNA_MOBILE_VISIT_LIST_OUTDATED
    const subTitle = t.labels.PBNA_MOBILE_VISIT_LIST_OUTDATED_CONTENT
    showAlert(title, subTitle)
}

export const getAlertMinutes = (plannedDuration) => {
    let alertMinutes = 0
    if (!plannedDuration || !parseInt(plannedDuration) || parseInt(plannedDuration) === 0) {
        alertMinutes = 240
    } else {
        alertMinutes = parseInt(plannedDuration) * (parseInt(CommonApi.PBNA_MOBILE_OPEN_VISIT_DURATION) / 100.0)
    }
    return alertMinutes
}

const calculateHourAndMinutes = (alertMinutes) => {
    const hour = Math.floor(alertMinutes / 60) || 0
    const minute = Math.floor(alertMinutes % 60) || 0

    const hourUnit = hour > 1 ? t.labels.PBNA_MOBILE_HOURS : t.labels.PBNA_MOBILE_HOUR
    const minuteUnit = minute > 1 ? t.labels.PBNA_MOBILE_MINUTES : t.labels.PBNA_MOBILE_MINUTE
    const hourString = hour > 0 ? `${hour} ${hourUnit.toLocaleLowerCase()}` : ''
    const minuteString = minute > 0 ? `${minute} ${minuteUnit}` : ''
    const timeString = hourString + (hour > 0 && minute > 0 ? ' ' : '') + minuteString
    return { timeString }
}

const showVisitDurationUpdateAlert = (storeName: string, timeString: string) => {
    const title = t.labels.PBNA_MOBILE_VISIT_DURATION_UPDATE
    const subTitle = `${t.labels.PBNA_MOBILE_YOU_HAVE_BEEN_IN} ${storeName} ${t.labels.PBNA_MOBILE_FOR} ${timeString}. ${t.labels.PBNA_MOBILE_DURATION_ALERT}.`
    showAlert(title, subTitle)
}

export const showAlertInVisitDetail = (visit, actualTimeDuration) => {
    const actualMinutes = Math.floor(actualTimeDuration) || 0

    const plannedMinutes = getAlertMinutes(visit.plannedDuration)
    if (actualTimeDuration > plannedMinutes) {
        const { timeString } = calculateHourAndMinutes(actualMinutes)
        showVisitDurationUpdateAlert(visit.name, timeString)
    }
}

export const setupDurationAlert = (visit, fromMyVisit?, alertTime?, alertPlanTime?) => {
    const { plannedDuration, name } = visit
    let timeObj, alertMinutes
    if (fromMyVisit) {
        timeObj = calculateHourAndMinutes(alertPlanTime)
        alertMinutes = alertTime
    } else {
        alertMinutes = getAlertMinutes(plannedDuration)
        timeObj = calculateHourAndMinutes(alertMinutes)
    }

    PushNotificationIOS.addNotificationRequest({
        id: visit.Id || visit.id,
        title: 'Visit Duration Update',
        body: `You have been in ${name} for ${timeObj.timeString}.`,
        badge: 1,
        fireDate: new Date(Date.now() + alertMinutes * 60 * 1000)
    })
}

export const cancelDurationAlert = () => {
    PushNotificationIOS.removeAllPendingNotificationRequests()
}

export const sendLunchOverTimeNotification = (eventId: string) => {
    PushNotificationIOS.addNotificationRequest({
        id: eventId,
        title: t.labels.PBNA_MOBILE_END_LUNCH_REMINDER,
        body: t.labels.PBNA_MOBILE_END_LUNCH_MESSAGE,
        badge: 1
    })
}
