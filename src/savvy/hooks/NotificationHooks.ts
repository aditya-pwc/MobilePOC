/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-09-09 05:01:23
 * @LastEditTime: 2024-02-05 17:27:14
 * @LastEditors: Yi Li
 */
/**
 * @description Notification hooks.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-07-27
 */
import { useEffect, useState } from 'react'
import { SoupService } from '../service/SoupService'
import { NotificationQueries } from '../queries/NotificationQueries'
import _ from 'lodash'
import moment from 'moment'
import { t } from '../../common/i18n/t'
import { decode, encode } from 'html-entities'
import { Log } from '../../common/enums/Log'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import { RealogramNotificationType, VisitSubtypeEnum } from '../enums/Contract'
import { checkIsRealogramNotification } from '../pages/rep/SalesNotificationCenter'
import { NativeEventEmitter, NativeModules } from 'react-native'
import { checkIsFormNotification, safeJsonParse } from '../helper/rep/AuditHelper'
import { useNavigation } from '@react-navigation/native'
import { handleFormNotification } from '../service/NotificationService'
import { updateNotificationSeen } from '../api/connect/NotificationUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const useNotificationCount = () => {
    const [count, setCount] = useState(0)
    const [refreshTimes, setRefreshTimes] = useState(0)
    useEffect(() => {
        SoupService.retrieveDataFromSoup(
            'Notification',
            {},
            ['count'],
            'SELECT COUNT(*) FROM {Notification} ' +
                'WHERE {Notification:read} IS NOT TRUE AND {Notification:seen} IS NOT TRUE'
        ).then((res) => {
            setCount(res[0].count)
        })
    }, [refreshTimes])
    return { count, setRefreshTimes }
}

const getEmptyText = (blodText?: string, hasDot = false) => {
    if (!_.isEmpty(blodText)) {
        const dotStr = hasDot ? `${blodText}. ` : blodText
        return blodText === 'null' ? '' : dotStr
    }
    return ''
}
const salesNotificationMap = (items) => {
    // formatNumberString('{0} {1}', ['foo', 'bar']) => 'foo bar'
    function formatNumberString(str, arr) {
        return str.replace(/{(\d)}/g, function (_, m) {
            return arr[m]
        })
    }
    const boldText = (str) => '<' + str + '>' // => &lt; + str +  &lt;
    const strategies: { [k: string]: (i: unknown) => string } = {
        /* spellchecker: disable */
        ACTIONR: (i) =>
            t.labels.PBNA_MOBILE_LEAD_ACTION_REQUIRED_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_ACTION_REQUIRED_TITLE, [boldText(i.Company)]),

        REQAPP: (i) =>
            t.labels.PBNA_MOBILE_LEAD_APPROVED_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_APPROVED_TITLE, [boldText(i.Company), boldText(i.Number)]),

        CREATED: (i) =>
            t.labels.PBNA_MOBILE_LEAD_CUSTOMER_ASSOCIATED_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_CUSTOMER_ASSOCIATED_TITLE, [boldText(i.Company), i.Number]),

        INAC: (i) =>
            t.labels.PBNA_MOBILE_LEAD_INACTIVITY_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_INACTIVITY_TITLE, [boldText(i.Company), i.Day]),

        REJECT: (i) =>
            t.labels.PBNA_MOBILE_LEAD_REJECTED_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_REJECTED_TITLE, [boldText(i.Company)]),

        DRAFT: (i) =>
            t.labels.PBNA_MOBILE_LEAD_DRAFT_REQUEST_T +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_DRAFT_REQUEST_TITLE, [boldText(i.Company), boldText(i.Number)]),
        REQCHA: (i) =>
            t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_REQUEST_APPROVED +
            '-' +
            formatNumberString(t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_REQUEST_APPROVED_BODY, [
                boldText(i.Company),
                boldText(i.Number)
            ]),
        FORM_KPI: (i: any) =>
            t.labels.PBNA_MOBILE_FORM_KPI +
            '-' +
            formatNumberString(
                i.VisitSubType === VisitSubtypeEnum.POST_CONTRACT_AUDIT
                    ? t.labels.PBNA_MOBILE_SALES_FORM_POST_KPI_MESSAGE
                    : t.labels.PBNA_MOBILE_SALES_FORM_GENERAL_KPI_MESSAGE,
                [boldText(i.RetailStoreName)]
            ),
        NOT_LOAD: (i: any) =>
            t.labels.PBNA_MOBILE_FORM_KPI +
            '-' +
            formatNumberString(
                i.VisitSubType === VisitSubtypeEnum.POST_CONTRACT_AUDIT
                    ? t.labels.PBNA_MOBILE_SALES_FORM_NOT_LOAD_POST
                    : t.labels.PBNA_MOBILE_SALES_FORM_NOT_LOAD_GENERAL,
                [boldText(i.RetailStoreName)]
            ),
        Realogram: (i: any) =>
            t.labels.PBNA_MOBILE_REALOGRAM +
            '-' +
            formatNumberString(t.labels.PBNA_MOBILE_REALOGRAM_RESULTS, [boldText(i.RetailStoreName)]),
        [RealogramNotificationType.IRNotLoad]: (i: any) =>
            t.labels.PBNA_MOBILE_REALOGRAM +
            '-' +
            formatNumberString(t.labels.PBNA_MOBILE_REALOGRAM_RESULTS_FAILED, [boldText(i.RetailStoreName)]),
        REJECTEDPG: (i: any) =>
            t.labels.PBNA_REJECTED_PRICE_GROUP_TITLE +
            '-' +
            formatNumberString(t.labels.PBNA_LEAD_REJECTEDPG_CONTENT, [
                boldText(getEmptyText(i.TarName)),
                boldText(getEmptyText(i.CustNum)),
                getEmptyText(i.ErrMsg, true)
            ])
    } /* spellchecker: enable */
    items.forEach((item) => {
        try {
            item.originalMessageBody = item.messageBody
            const messageBody = decode(item.messageBody)
            item.jsonBody = JSON.parse(messageBody.indexOf('{') > -1 ? messageBody : '{' + messageBody + '}')
            const cType = item.jsonBody.CType
            item.messageBody = encode(strategies[cType](item.jsonBody))
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'salesNotificationMap',
                `Parsing Sales Notification: ${ErrorUtils.error2String(err)},${ErrorUtils.error2String(item)}`
            )
        }
    })
    return items
}

export const useNotifications = (isFocused, editTimes, isLoading) => {
    const [data, setData] = useState([])
    const getNotification = async () => {
        if (!isLoading) {
            const res = await SoupService.retrieveDataFromSoup(
                'Notification',
                {},
                NotificationQueries.getNotificationQuery.f,
                NotificationQueries.getNotificationQuery.q
            )
            const resTemp = salesNotificationMap(_.cloneDeep(res))
            if (resTemp.length > 0) {
                const tempData = _.groupBy(resTemp, (item: any) => {
                    return moment(item.lastModified).format(TIME_FORMAT.Y_MM_DD)
                })
                const finalData = []
                _.forEach(tempData, (v, k) => {
                    finalData.push({
                        title: k,
                        data: v
                    })
                })
                const dataSource = _.sortBy(finalData, (v) => {
                    return v.title
                }).reverse()
                setData(dataSource)
            } else {
                setData([])
            }
        }
    }
    useEffect(() => {
        getNotification()
    }, [isFocused, editTimes, isLoading])
    return data
}

export const useFormNotificationHooks = () => {
    const { PushNotification } = NativeModules
    const navigation = useNavigation()
    const notificationEvent = new NativeEventEmitter(PushNotification)
    useEffect(() => {
        const notificationAuditEmitter = notificationEvent.addListener('reciveRemoteNotification', (userInfo) => {
            const messageBody = userInfo?.aps?.alert?.body
            const notificationMsg = safeJsonParse(messageBody.indexOf('{') > -1 ? messageBody : '{' + messageBody + '}')
            const notificationType = notificationMsg?.CType
            PushNotification.cleanNotification()
            updateNotificationSeen(userInfo.nid, true).then(() => {
                if (checkIsFormNotification(notificationType) || checkIsRealogramNotification(notificationType)) {
                    handleFormNotification(notificationMsg, navigation)
                }
            })
        })
        return () => {
            notificationAuditEmitter && notificationAuditEmitter.remove()
        }
    }, [])
}
