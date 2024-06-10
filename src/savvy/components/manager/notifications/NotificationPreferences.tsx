/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-09-01 02:19:43
 * @LastEditTime: 2023-11-20 15:47:17
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native'
import CText from '../../../../common/components/CText'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import _ from 'lodash'
import { Persona } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import { CommonApi } from '../../../../common/api/CommonApi'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    viewContainer: {
        paddingTop: 56,
        backgroundColor: '#F2F4F7'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        marginBottom: 16
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    clear: {},
    scrollViewContainer: {
        marginBottom: 56
    },
    sectionTitle: {
        marginTop: 40,
        marginBottom: 20,
        marginLeft: 22,
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 15,
        backgroundColor: '#fff'
    },
    underlineWrapper: {
        backgroundColor: '#FFF',
        height: 1
    },
    underline: {
        marginLeft: 22,
        backgroundColor: '#D3D3D3',
        height: '100%'
    },
    description: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: '#565656'
    },
    switch: {
        marginLeft: 40
    }
})

interface NotificationPreferencesProps {
    navigation?: any
    route?: any
}

const NotificationPreferences = (props: NotificationPreferencesProps) => {
    const { navigation, route } = props

    const [preferences, setPreferences] = useState([])
    let onPressBack = null
    if (route.params.onPressBack) {
        onPressBack = route.params.onPressBack
    }

    const originalData = {
        merchandiser: [
            {
                section: t.labels.PBNA_MOBILE_NOT_MERCH_VISIT_UPDATES,
                list: [
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MERCH_ADHOC_VISIT,
                        value: CommonApi.PBNA_MOBILE_NOT_MERCH_ADHOC_VISIT,
                        description: t.labels.PBNA_MOBILE_NOT_MERCH_VISIT_UPDATES_DESC,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_RE_SEQUENCE_VISIT,
                        value: CommonApi.PBNA_MOBILE_RE_SEQUENCE_VISIT,
                        description: t.labels.PBNA_MOBILE_NOTIFY_MD_RE_SEQUENCED_VISITS,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MM_SCHEDULE_CHANGE,
                        value: CommonApi.PBNA_MOBILE_NOT_MM_SCHEDULE_CHANGE,
                        description: t.labels.PBNA_MOBILE_NOT_MM_REASSIGN_VISITS,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MERCH_REMOVE_VISIT,
                        value: CommonApi.PBNA_MOBILE_NOT_MERCH_REMOVE_VISIT,
                        description: t.labels.PBNA_MOBILE_NOT_MERCH_REMOVE_VISITS,
                        isOpen: false
                    }
                ]
            },
            {
                section: t.labels.PBNA_MOBILE_NOT_MERCH_DELIVERY_UPDATES,
                list: [
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MERCH_SHIPMENT,
                        value: CommonApi.PBNA_MOBILE_NOT_MERCH_SHIPMENT,
                        description: t.labels.PBNA_MOBILE_NOT_MERCH_DELIVERY_UPDATES_DESC,
                        isOpen: false
                    }
                ]
            }
        ],
        managers: [
            {
                section: t.labels.PBNA_MOBILE_MERCHANDISING.toLocaleUpperCase(),
                list: [
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MM_INCOMPLETE_VISIT,
                        value: CommonApi.PBNA_MOBILE_NOT_MM_INCOMPLETE_VISIT,
                        description: t.labels.PBNA_MOBILE_NOT_MM_VISIT_UPDATES_DESC,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MM_ADHOC_VISIT,
                        value: CommonApi.PBNA_MOBILE_NOT_MM_ADHOC_VISIT,
                        description: t.labels.PBNA_MOBILE_NOT_MM_SCHEDULING_UPDATES_DESC,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_MM_GAP_TIME,
                        value: CommonApi.PBNA_MOBILE_NOT_MM_GAP_TIME,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EMPLOYEE_UPDATES_DESC,
                        isOpen: false
                    }
                ]
            },
            {
                section: t.labels.PBNA_MOBILE_SALES.toLocaleUpperCase(),
                list: [
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_SDL_OFF_SCHEDULE,
                        value: CommonApi.PBNA_MOBILE_NOT_SDL_OFF_SCHEDULE,
                        description: t.labels.PBNA_MOBILE_NOT_MM_VU_SALES_ORDER,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_SDL_NO_START,
                        value: CommonApi.PBNA_MOBILE_NOT_SDL_NO_START,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EU_SALES_NOT_START,
                        isOpen: false
                    }
                ]
            },
            {
                section: t.labels.PBNA_MOBILE_DELIVERY.toLocaleUpperCase(),
                list: [
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_DELSUP_NO_START,
                        value: CommonApi.PBNA_MOBILE_NOT_DELSUP_NO_START,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EU_DRIVER_NOT_START,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_DELSUP_OVER_HOUR,
                        value: CommonApi.PBNA_MOBILE_NOT_DELSUP_OVER_HOUR,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EU_DRIVER_OVER_HRS,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_DELSUP_GATE_DELAY,
                        value: CommonApi.PBNA_MOBILE_NOT_DELSUP_GATE_DELAY,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EU_DRIVER_DELAY,
                        isOpen: false
                    },
                    {
                        key: CommonApi.PBNA_MOBILE_NOT_DELSUP_LATE_START,
                        value: CommonApi.PBNA_MOBILE_NOT_DELSUP_LATE_START,
                        description: t.labels.PBNA_MOBILE_NOT_MM_EU_DRIVER_START_LATE,
                        isOpen: false
                    }
                ]
            }
        ]
    }

    const fetchUserStatsByUserId = async () => {
        const userId = CommonParam.userId
        if (!userId || userId.length === 0) {
            storeClassLog(Log.MOBILE_WARN, 'fetchUserStatsByUserId', `No user id: ${JSON.stringify(CommonParam)}`)
            return ''
        }
        try {
            const res = await restDataCommonCall(
                `query/?q=SELECT Id, User__c, Notification_Preference__c FROM User_Stats__c WHERE User__c ='${userId}'`,
                'GET'
            )
            if (res && res.data && res.data.records && res.data.records.length > 0) {
                return res.data.records[0]
            }
            storeClassLog(Log.MOBILE_WARN, 'fetchUserStatsByUserId', `res: ${JSON.stringify(res)}`)
            return ''
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'fetchUserStatsByUserId', `error: ${ErrorUtils.error2String(error)}`)
        }
        return ''
    }

    const fetchPreferences = async () => {
        let data = []
        switch (CommonParam.PERSONA__c) {
            case Persona.MERCHANDISER:
                data = originalData.merchandiser
                break
            case Persona.MERCH_MANAGER:
            case Persona.SALES_DISTRICT_LEADER:
            case Persona.DELIVERY_SUPERVISOR:
            case Persona.UNIT_GENERAL_MANAGER:
                data = originalData.managers
                break
            default:
                break
        }
        const userStats = await fetchUserStatsByUserId()
        const noUserStats = userStats === undefined
        const preference = userStats?.Notification_Preference__c || ''
        const preferenceList = preference.split(';')
        data.forEach((section) => {
            section.list.forEach((item) => {
                item.isOpen = preferenceList.includes(item.value) || noUserStats
            })
        })
        setPreferences(data)
    }

    const updatePreferences = async () => {
        const data = []
        preferences.forEach((section) => {
            section.list.forEach((item) => {
                if (item.isOpen) {
                    data.push(item.value)
                }
            })
        })

        const preferenceString = data.join(';')

        await exeAsyncFunc(async () => {
            const userStats = await fetchUserStatsByUserId()
            if (userStats) {
                const userStatsId = userStats.Id
                await restDataCommonCall(`sobjects/User_Stats__c/${userStatsId}`, 'PATCH', {
                    Notification_Preference__c: preferenceString
                })
            } else {
                if (!_.isEmpty(CommonParam.userId)) {
                    const userStatsObj = {
                        Notification_Preference__c: preferenceString,
                        User__c: CommonParam.userId,
                        OwnerId: CommonParam.userId
                    }
                    await restDataCommonCall('sobjects/User_Stats__c', 'POST', userStatsObj)
                } else {
                    storeClassLog(Log.MOBILE_WARN, 'updatePreferences', `No user id ${JSON.stringify(CommonParam)}`)
                }
            }
        }, 'updatePreferences')
    }

    const goBack = () => {
        onPressBack && onPressBack()
        navigation.goBack()
    }

    const onClickClose = () => {
        updatePreferences()
        goBack()
    }

    const onClickIsOpen = (index, data) => {
        const cloneObj = _.cloneDeep(preferences)
        cloneObj[index].list.forEach((item) => {
            if (item.key === data.key) {
                item.isOpen = !item.isOpen
            }
        })
        setPreferences(cloneObj)
    }

    useEffect(() => {
        fetchPreferences()
    }, [])

    const renderPreferenceItem = (index, data, isLastItem) => {
        return (
            <View key={data.key}>
                <View style={[styles.switchContainer]}>
                    <CText style={styles.description}>{data.description}</CText>
                    <Switch
                        ios_backgroundColor={'#565656'}
                        value={data.isOpen}
                        onValueChange={() => {
                            onClickIsOpen(index, data)
                        }}
                        style={styles.switch}
                    />
                </View>
                {!isLastItem && (
                    <View style={styles.underlineWrapper}>
                        <View style={styles.underline} />
                    </View>
                )}
            </View>
        )
    }

    return (
        <View style={styles.viewContainer}>
            <View style={styles.titleContainer}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_NOTIFICATION_PREFERENCES}</CText>

                <TouchableOpacity onPress={onClickClose}>
                    <BlueClear height={36} width={36} style={styles.clear} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
                {preferences?.map((item, index) => {
                    return (
                        <View key={item.section}>
                            <CText style={styles.sectionTitle}>{item.section.toUpperCase()}</CText>
                            {item?.list?.map((data, idx) => {
                                return renderPreferenceItem(index, data, idx === item.list.length - 1)
                            })}
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export default NotificationPreferences
