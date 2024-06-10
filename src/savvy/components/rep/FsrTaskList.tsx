import React, { useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import PickerTile from './lead/common/PickerTile'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import OpenTaskTile from './lead/activity-tab/OpenTaskTile'
import { useGetOpenTasks } from '../../hooks/LeadHooks'
import { useSortOpenTaskList } from '../../helper/rep/TaskHelper'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import LogCallForm from './lead/LogCallForm'
import CoPilotStyle from '../../styles/CoPilotStyle'
import { Instrumentation } from '@appdynamics/react-native-agent'

const styles = CoPilotStyle

export const FsrTaskList = ({ refreshTimes }: { refreshTimes: any }) => {
    const isFocused = useIsFocused()
    const navigation = useNavigation()
    const [activityDays, setActivityDays] = useState('This Week')
    const [taskSaveTimes, setTaskSaveTimes] = useState(0)
    const [editCall, setEditCall] = useState('')
    const leadContactTabRef = useRef(null)
    const timePickMapping = [
        { k: t.labels.PBNA_MOBILE_THIS_WEEK, v: 'This Week' },
        { k: t.labels.PBNA_MOBILE_NEXT_WEEK, v: 'Next Week' }
    ]

    const onAddContact = () => {
        leadContactTabRef?.current?.addCount()
    }

    const { openTaskList, openTaskListSize, openCustomerTaskList, openCustomerTaskListSize } = useGetOpenTasks(
        CommonParam.userId,
        activityDays,
        taskSaveTimes,
        'All Types',
        isFocused,
        refreshTimes
    )
    const openList = useSortOpenTaskList(openTaskList, openCustomerTaskList)
    const logCallModalRef = useRef(null)
    const openTaskListRef = useRef(null)

    const handleClick = (activityDetail) => {
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Open a Task from the Co-pilot page`, 1)
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
        const showOpenTaskList = _.cloneDeep(taskList)
        const listLength = openTaskListSize + openCustomerTaskListSize
        if (listLength > 0) {
            if (listLength > 5) {
                showOpenTaskList.splice(5)
            }
            return _.map(showOpenTaskList, (v, k) => {
                return (
                    <View style={styles.taskTitleHeight} key={k}>
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
            <View style={styles.noTaskView}>
                <CText style={styles.noTaskGray}>{t.labels.PBNA_MOBILE_NO_OPEN_TASK_FOR_THIS_SELECTED_TIMEFRAME}</CText>
            </View>
        )
    }

    return (
        <View>
            <View style={styles.pickViewCont}>
                <View style={commonStyle.flexDirectionRow}>
                    <CText style={styles.openTaskText}>{t.labels.PBNA_MOBILE_OPEN_TASKS}</CText>
                    <CText style={styles.listSizeText}>
                        {'(' + (openTaskListSize + openCustomerTaskListSize) + ')'}
                    </CText>
                </View>
                <View style={styles.pickView}>
                    <PickerTile
                        data={[
                            t.labels.PBNA_MOBILE_SELECT_TIME_INTERVAL,
                            ...timePickMapping.map((v) => {
                                return v.k
                            })
                        ]}
                        label={''}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_TIME_INTERVAL_CAPITALIZE}
                        required
                        disabled={false}
                        borderStyle={{}}
                        defValue={t.labels.PBNA_MOBILE_THIS_WEEK}
                        onDone={(v: any) => {
                            setActivityDays(_.find(timePickMapping, (value) => value.k === v)?.v)
                        }}
                    />
                </View>
            </View>
            {renderOpenTaskList(openList, setEditCall)}
            {openTaskListSize + openCustomerTaskListSize > 5 && (
                <View style={styles.viewAllCont}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation?.navigate('OpenTaskListTab', {
                                ownerId: CommonParam.userId,
                                times: activityDays
                            })
                            openTaskListRef.current?.open()
                        }}
                    >
                        <CText style={styles.viewAllText}>{t.labels.PBNA_MOBILE_VIEW_ALL.toUpperCase()}</CText>
                    </TouchableOpacity>
                </View>
            )}
            <LogCallForm
                onAddContact={onAddContact}
                cRef={logCallModalRef}
                onSave={() => {
                    setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                }}
                type={editCall?.Subject === 'Lead Logging Calls' ? 'Lead' : 'RetailStore'}
                l={editCall}
                customer={editCall}
                isEdit
                editCall={editCall}
                isCopilot
            />
        </View>
    )
}
