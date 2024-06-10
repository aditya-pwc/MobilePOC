/**
 * @description Component for the open task.
 * @author Qiulin Deng
 * @date 2021-09-1
 */
import React, { FC, useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import CText from '../../../../common/components/CText'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import OpenTaskTile from './activity-tab/OpenTaskTile'
import PickerTile from './common/PickerTile'
import _ from 'lodash'
import { useIsFocused } from '@react-navigation/native'
import { useGetOpenTasks } from '../../../hooks/LeadHooks'
import { t } from '../../../../common/i18n/t'
import { useSortOpenTaskList } from '../../../helper/rep/TaskHelper'
import LogCallForm from './LogCallForm'

interface AllOpenTaskProps {
    navigation: any
    route: any
}

const styles = StyleSheet.create({
    bgtContainer: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    titleFontStyle: {
        marginTop: 5.5,
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    goBackIcon: {
        position: 'absolute',
        left: '5%',
        top: 5
    },
    goBackIconSize: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderTopColor: '#00A2D9',
        borderRightColor: '#00A2D9',
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }]
    },
    centerWithPaddingHorizontal_5: {
        justifyContent: 'center',
        paddingHorizontal: '5%'
    },
    containerStyle: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF'
    },
    safeAreaViewStyle: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tileContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
    },
    keyboardAwareScrollViewStyle: {
        height: '100%',
        width: '100%',
        marginBottom: '3%'
    },
    color_grey: {
        color: 'gray'
    },
    height_100: {
        height: 100
    },
    maxWidth35: {
        maxWidth: '35.5%'
    },
    width_45: {
        width: '45%'
    }
})

const OpenTaskListTab: FC<AllOpenTaskProps> = (props: AllOpenTaskProps) => {
    const { navigation, route } = props
    const ownerId = route.params.ownerId
    const taskTypeRef = useRef(null)
    const taskTimeRef = useRef(null)
    const logCallModalRef = useRef(null)
    const [editCall, setEditCall] = useState('')
    const leadContactTabRef = useRef(null)
    const onAddContact = () => {
        leadContactTabRef?.current?.addCount()
    }
    const [taskSaveTimes, setTaskSaveTimes] = useState(0)
    const isFocused = useIsFocused()
    const [task, setTask] = useState({
        times: route.params.times,
        type: 'All Types'
    })
    const { openTaskList, openTaskListSize, openCustomerTaskList, openCustomerTaskListSize } = useGetOpenTasks(
        ownerId,
        task.times,
        taskSaveTimes,
        task.type,
        isFocused
    )
    const openList = useSortOpenTaskList(openTaskList, openCustomerTaskList)
    const timePickMapping = [
        { k: t.labels.PBNA_MOBILE_THIS_WEEK, v: 'This Week' },
        { k: t.labels.PBNA_MOBILE_NEXT_WEEK, v: 'Next Week' }
    ]
    const handleClick = (activityDetail) => {
        if (activityDetail.WhatId) {
            navigation.navigate('CustomerDetailScreen', {
                customer: { AccountId: activityDetail.WhatId },
                type: 'Negotiate',
                isGoBackToCustomer: true,
                showDetail: true,
                tab: 'ACTIVITIES',
                taskId: activityDetail.Id
            })
        } else {
            navigation?.navigate('LeadDetailScreen', {
                lead: { ExternalId: activityDetail.Lead__c },
                type: 'Negotiate',
                goBackDp: true,
                showDetail: true,
                tab: 3,
                taskId: activityDetail.Id
            })
        }
    }
    const renderOpenTaskList = (taskList, setEditCall) => {
        if (openTaskListSize + openCustomerTaskListSize > 0) {
            return _.map(taskList, (v) => {
                return (
                    <View style={styles.height_100} key={v._soupEntryId}>
                        <OpenTaskTile
                            activity={v}
                            onMarkAsComplete={() => {
                                setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            enable
                            onClick={handleClick}
                            showLead
                            setEditCall={setEditCall}
                            logCallFormRef={logCallModalRef}
                            isCopilot
                        />
                    </View>
                )
            })
        }
        return (
            <View style={styles.centerWithPaddingHorizontal_5}>
                <CText style={styles.color_grey}>
                    {t.labels.PBNA_MOBILE_NO_OPEN_TASKS_FOR_THIS_SELECTED_TIMEFRAME}
                </CText>
            </View>
        )
    }
    return (
        <View style={styles.containerStyle}>
            <SafeAreaView style={styles.safeAreaViewStyle}>
                <View style={styles.bgtContainer}>
                    <CText style={styles.titleFontStyle}>{t.labels.PBNA_MOBILE_OPEN_TASKS}</CText>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack()
                        }}
                        hitSlop={{
                            left: 30,
                            right: 30,
                            top: 30,
                            bottom: 30
                        }}
                        style={styles.goBackIcon}
                    >
                        <View style={styles.goBackIconSize} />
                    </TouchableOpacity>
                </View>
                <View style={styles.tileContainer}>
                    <View style={styles.maxWidth35}>
                        <PickerTile
                            data={[
                                `-- ${t.labels.PBNA_MOBILE_SELECT_TASK_TYPE} --`,
                                'All Types',
                                'Scheduled Call',
                                'Contract/CDA Renewal',
                                'Business Review',
                                'Resubmit Equipment Site Details',
                                'Follow-up/Customer Issue',
                                'Complete BAM',
                                'Complete RFP',
                                'Gather Tax Documents'
                            ]}
                            label={''}
                            title={t.labels.PBNA_MOBILE_TASK_TYPE}
                            disabled={false}
                            defValue={'All Types'}
                            placeholder={t.labels.PBNA_MOBILE_ALL_TASK}
                            required
                            borderStyle={{}}
                            noPaddingHorizontal
                            onDone={(v) => {
                                setTask({ ...task, type: v })
                                setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            cRef={taskTypeRef}
                            numberOfLines={2}
                        />
                    </View>
                    <View style={styles.width_45}>
                        <PickerTile
                            data={[
                                t.labels.PBNA_MOBILE_SELECT_TIME_INTERVAL,
                                ...timePickMapping.map((v) => {
                                    return v.k
                                })
                            ]}
                            label={''}
                            title={t.labels.PBNA_MOBILE_TIME_INTERVAL}
                            disabled={false}
                            defValue={task.times}
                            placeholder={t.labels.PBNA_MOBILE_THIS_WEEK}
                            required
                            borderStyle={{}}
                            noPaddingHorizontal
                            onDone={(v) => {
                                setTask({
                                    ...task,
                                    times: _.find(timePickMapping, (value) => value.k === v)?.v
                                })
                                setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            cRef={taskTimeRef}
                        />
                    </View>
                </View>
                <KeyboardAwareScrollView
                    style={styles.keyboardAwareScrollViewStyle}
                    showsVerticalScrollIndicator={false}
                >
                    {renderOpenTaskList(openList, setEditCall)}
                </KeyboardAwareScrollView>
            </SafeAreaView>
            <LogCallForm
                onAddContact={onAddContact}
                cRef={logCallModalRef}
                onSave={() => {
                    setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                }}
                type={editCall?.Subject === 'Lead Logging Calls' ? 'Lead' : 'RetailStore'}
                customer={editCall}
                l={editCall}
                isEdit
                editCall={editCall}
                isCopilot
            />
        </View>
    )
}

export default OpenTaskListTab
