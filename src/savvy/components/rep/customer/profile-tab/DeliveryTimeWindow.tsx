/* eslint-disable camelcase */
/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-07 12:51:42
 * @LastEditTime: 2024-01-29 11:32:38
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import CollapseContainer from '../../../common/CollapseContainer'
import { NavigationRoute } from '../../../../enums/Manager'
import { t } from '../../../../../common/i18n/t'
import { isPersonaDelSup } from '../../../../../common/enums/Persona'
import {
    DefaultDeliveryTimeWindow,
    DeliveryTimeObjProps,
    DeliveryTimeProps,
    getDeliveryTimeObj
} from './EditDeliveryTimeWindowHelper'
import BaseInstance from '../../../../../common/BaseInstance'
import { CommonApi } from '../../../../../common/api/CommonApi'
import _ from 'lodash'
import { Log } from '../../../../../common/enums/Log'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { useIsFocused } from '@react-navigation/native'

const styles = StyleSheet.create({
    collapseTitleView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 4,
        height: 62
    },
    titleText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700'
    },
    editText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    dayTimeView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        marginLeft: 4,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    dayText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '700'
    },
    timeView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeText: {
        color: '#565656',
        fontSize: 12,
        fontWeight: '400'
    }
})

interface DeliveryTimeWindowProps {
    navigation: any
    accountId: string
    customerUniqId: string
}

const USERNAME_LABEL = 'PBNA_OMNITRACS_USER_ID'
const PASSWORD_LABEL = 'PBNA_OMNITRACS_USER_PASSWORD'

const DeliveryTimeWindow = (props: DeliveryTimeWindowProps) => {
    const { navigation, accountId, customerUniqId } = props

    const [deliveryTimeObj, setDeliveryTimeObj] = useState<DeliveryTimeObjProps>(DefaultDeliveryTimeWindow)
    const [showContent, setShowContent] = useState(false)
    const [omToken, setOMToken] = useState('')
    const [isAPICallFinished, setIsAPICallFinished] = useState(false)
    const [isAPICallFailed, setIsAPICallFailed] = useState(false)
    const isFocused = useIsFocused()

    const fetchOmnitractAPIToken = async () => {
        try {
            const res = await BaseInstance.sfHttpClient.callData(
                `query/?q=SELECT Id, OwnerId, Category__c, Type__c, Value__c, Name FROM Integration_Setting__c WHERE Category__c = 'Omnitract'`,
                'GET'
            )
            const records = res?.data?.records
            const username = records.filter((item) => item.Name === USERNAME_LABEL)?.[0]?.Value__c
            const password = records.filter((item) => item.Name === PASSWORD_LABEL)?.[0]?.Value__c
            const tokenRes = await BaseInstance.sfHttpClient._post(CommonApi.PBNA_OMNITRACS_AUTH_URL, {
                username,
                password
            })
            const token = tokenRes?.data?.token
            setOMToken(token)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'fetchOmnitractAPIToken', ErrorUtils.error2String(e))
        }
    }

    const fetchOmnitractAPIData = async () => {
        try {
            if (_.isEmpty(customerUniqId) || _.isEmpty(omToken)) {
                return
            }
            const dataRes = await BaseInstance.sfHttpClient._get(
                CommonApi.PBNA_OMNITRACS_TIMEWINDOW_URL + customerUniqId,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${omToken}`
                    }
                }
            )
            const serviceLocationInfo = dataRes?.data?.items?.[0]?.serviceLocationInfo
            const serviceWindowOverrides = serviceLocationInfo?.overrides?.serviceWindowOverrides
            const timeObj: any = {}
            if (!_.isEmpty(serviceWindowOverrides)) {
                const resultMap = new Map()
                for (const item of serviceWindowOverrides) {
                    for (const day of item?.daysOfWeek) {
                        if (!resultMap.has(day)) {
                            resultMap.set(day, [{ startTime: item?.startTimeOfDay, endTime: item?.endTimeOfDay }])
                        } else {
                            const arr = resultMap.get(day)
                            if (item?.startTimeOfDay > arr[0]?.startTime) {
                                arr.push({ startTime: item?.startTimeOfDay, endTime: item?.endTimeOfDay })
                            } else {
                                arr.unshift({ startTime: item?.startTimeOfDay, endTime: item?.endTimeOfDay })
                            }
                            resultMap.set(day, arr)
                        }
                    }
                }
                for (const [key, value] of resultMap.entries()) {
                    const res = getDeliveryTimeObj(
                        value[0]?.startTime,
                        value[0]?.endTime,
                        value[1]?.startTime,
                        value[1]?.endTime
                    )
                    timeObj[key.substring(0, 3).toUpperCase()] = res
                }
                setDeliveryTimeObj(timeObj as DeliveryTimeObjProps)
            } else {
                setDeliveryTimeObj(DefaultDeliveryTimeWindow)
            }
            setIsAPICallFailed(false)
            return { timeObj, isAPICallFailed: false }
        } catch (e) {
            setIsAPICallFailed(true)
            setShowContent(false)
            storeClassLog(Log.MOBILE_ERROR, 'fetchOmnitractAPIData', ErrorUtils.error2String(e))
            Alert.alert(t.labels.PBNA_MOBILE_TECHNICAL_DIFFICULTIES, t.labels.PBNA_MOBILE_HAVING_TECHNICAL_DIFFICULTIES)
            return { timeObj: DefaultDeliveryTimeWindow, isAPICallFailed: true }
        } finally {
            setIsAPICallFinished(true)
        }
    }

    const onClickEditTimeWindow = _.debounce(async () => {
        const res = await fetchOmnitractAPIData()
        !res?.isAPICallFailed &&
            navigation.navigate(NavigationRoute.EDIT_DELIVERY_TIME_WINDOW, {
                deliveryTimeObj: _.isEmpty(res?.timeObj) ? deliveryTimeObj : res?.timeObj,
                accountId,
                navigation
            })
    }, 1000)

    useEffect(() => {
        fetchOmnitractAPIToken()
    }, [isFocused])

    useEffect(() => {
        showContent && fetchOmnitractAPIData()
    }, [showContent, customerUniqId, omToken])

    const renderDayTimeWindow = (weekday: string, deliveryTime: DeliveryTimeProps) => {
        return (
            <View style={styles.dayTimeView} key={weekday}>
                <CText style={styles.dayText}>{weekday.toUpperCase()}</CText>
                <View style={styles.timeView}>
                    <CText style={styles.timeText}>{deliveryTime?.displayString}</CText>
                </View>
            </View>
        )
    }

    return (
        <View>
            <CollapseContainer
                showContent={showContent && isAPICallFinished && !isAPICallFailed}
                setShowContent={setShowContent}
                title={t.labels.PBNA_MOBILE_DELIVERY_TIME_WINDOW}
                titleComponents={
                    <View style={styles.titleView}>
                        <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_DELIVERY_TIME_WINDOW}</CText>
                        {isPersonaDelSup() && (
                            <TouchableOpacity onPress={() => onClickEditTimeWindow()}>
                                <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT.toUpperCase()}</CText>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                containerStyle={styles.collapseTitleView}
                noBottomLine={false}
                noTopLine={false}
            >
                <>
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_SUNDAY, deliveryTimeObj.SUN)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_MONDAY, deliveryTimeObj.MON)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_TUESDAY, deliveryTimeObj.TUE)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_WEDNESDAY, deliveryTimeObj.WED)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_THURSDAY, deliveryTimeObj.THU)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_FRIDAY, deliveryTimeObj.FRI)}
                    {renderDayTimeWindow(t.labels.PBNA_MOBILE_SATURDAY, deliveryTimeObj.SAT)}
                </>
            </CollapseContainer>
        </View>
    )
}

export default DeliveryTimeWindow
