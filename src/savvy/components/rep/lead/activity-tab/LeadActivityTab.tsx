/**
 * @description The component is the container of the lead activity tab.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { FC, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import ActivityTile from './ActivityTile'
import { useTasks } from '../../../../hooks/LeadHooks'
import _ from 'lodash'
import CofRequestedDetail from './CofRequestedDetail'
import CofRejectedDetail from './CofRejectedDetail'
import CallDetail from './CallDetail'
import { getRecentCofRejectedActivity } from '../../../../utils/LeadUtils'
import CText from '../../../../../common/components/CText'
import Collapsible from 'react-native-collapsible'
import CommonTaskDetail from './CommonTaskDetail'
import OpenTaskTile from './OpenTaskTile'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import { t } from '../../../../../common/i18n/t'
import moment from 'moment'
import LogCallForm from '../LogCallForm'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useTaskDetail } from '../../../../hooks/CustomerHooks'

export interface LeadActivityTabRef {
    showCofRejectTaskDetail: (task: any) => void
}
interface LeadActivityTabProps {
    saveTimes: number
    showRecentRejection: boolean
    disableShowRecentRejection: () => void
    l: any
    showDetail?: boolean
    taskId?: string
    onAddContact?: any
    cRef: Ref<LeadActivityTabRef>
}

const styles = StyleSheet.create({
    taskListSeparatorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 50
    },
    taskListSeparator: {
        height: 30,
        width: 3,
        backgroundColor: '#F4F4F7'
    },
    fullWidthWithPadding: {
        width: '100%',
        paddingHorizontal: '5%'
    },
    leadActivityText: {
        fontSize: 18,
        fontWeight: '700',
        marginVertical: 25
    },
    sectionContainer: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
    },
    upcomingText: {
        fontWeight: '700',
        fontSize: 16
    },
    fullWithHeight_110: {
        height: 110,
        width: '100%'
    },
    showActivityDetailContainer: {
        position: 'absolute',
        left: 20,
        top: 23
    },
    showActivityDetailArrow: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }],
        borderTopColor: '#00A2D9',
        borderRightColor: '#00A2D9'
    },
    fullWidthWhiteBackground: {
        height: '100%',
        backgroundColor: 'white'
    }
})

const LeadActivityTab: FC<LeadActivityTabProps> = (props: LeadActivityTabProps) => {
    const { saveTimes, showRecentRejection, disableShowRecentRejection, l, showDetail, taskId, onAddContact, cRef } =
        props
    const [taskSaveTimes, setTaskSaveTimes] = useState(0)
    const { historyTaskList, openTaskList } = useTasks(l.ExternalId, saveTimes, taskSaveTimes)
    const [showHistorySection, setShowHistorySection] = useState(false)
    const [showOpenSection, setShowOpenSection] = useState(true)
    const [historyTasks, setHistoryTasks] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [editCall, setEditCall] = useState('')
    const logCallModalRef = useRef(null)
    const { activity, setActivity, showActivityDetail, setShowActivityDetail } = useTaskDetail(showDetail, taskId)

    useEffect(() => {
        if (historyTaskList.length > 0) {
            const tempActivities = []
            historyTaskList.forEach((v) => {
                tempActivities.push(v)
                tempActivities.push('p')
            })
            tempActivities.pop()
            setHistoryTasks(tempActivities)
        } else {
            setHistoryTasks([])
        }
        if (showRecentRejection && disableShowRecentRejection) {
            disableShowRecentRejection()
            getRecentCofRejectedActivity(l.ExternalId).then((res) => {
                if (res) {
                    setActivity(res)
                    setShowActivityDetail(true)
                }
            })
        }
    }, [historyTaskList])

    useImperativeHandle(cRef, () => ({
        showCofRejectTaskDetail: (task) => {
            setActivity(task)
            setShowActivityDetail(true)
        }
    }))

    const handleClick = (activityDetail) => {
        setActivity(activityDetail)
        setShowActivityDetail(true)
    }

    const sortData = (data) => {
        const recordTypes = ['Lead Logging Calls', 'Lead Task']
        const timestampFormat = 'x'
        return _(data)
            .groupBy((item) => {
                return moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
            })
            .map((arr, key) => {
                const tmpArr = _.sortBy(arr, key)
                const groupedDataByDay = _(tmpArr)
                    .groupBy((item) => {
                        let result = ''
                        if (item?.Subject === 'Lead Logging Calls') {
                            result = moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
                        }
                        if (item?.Subject === 'Lead Task') {
                            result = moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
                        }
                        return result
                    })
                    .map((element, k) => {
                        const sortedArr = _.sortBy(element, k)
                        return _.sortBy(sortedArr, (item) => {
                            let result = ''
                            if (item?.Subject === 'Lead Logging Calls') {
                                result = moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
                            }
                            if (item?.Subject === 'Lead Task') {
                                result = moment(item.CreatedDate).format(timestampFormat)
                            }
                            return result
                        })
                    })
                    .flatten()
                    .value()
                return _.sortBy(groupedDataByDay, (item) => {
                    return recordTypes.map((i) => {
                        return item.Subject === i
                    })
                })
            })
            .flatten()
            .value()
            .reverse()
    }

    const renderOpenTaskList = (taskList, setEditCall) => {
        const tempList = sortData(taskList)
        return _.map(tempList, (v, k) => {
            return (
                <OpenTaskTile
                    activity={v}
                    onMarkAsComplete={() => {
                        setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                    }}
                    enable={l.COF_Triggered_c__c === '0'}
                    onClick={handleClick}
                    key={k}
                    setEditCall={setEditCall}
                    logCallFormRef={logCallModalRef}
                />
            )
        })
    }

    const renderTaskList = (taskList) => {
        return _.map(taskList, (v, k) => {
            if (v === 'p') {
                return (
                    <View style={styles.taskListSeparatorContainer} key={k}>
                        <View style={styles.taskListSeparator} />
                    </View>
                )
            }
            return <ActivityTile onClick={handleClick} activity={v} key={k} />
        })
    }

    const renderTaskListSection = () => {
        return (
            <View
                style={{
                    backgroundColor: 'white'
                }}
            >
                <View style={styles.fullWidthWithPadding}>
                    <CText style={styles.leadActivityText}>{t.labels.PBNA_MOBILE_LEAD_ACTIVITIES}</CText>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setShowOpenSection((showOpenSection) => !showOpenSection)
                    }}
                    style={styles.sectionContainer}
                >
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={styles.upcomingText}>{t.labels.PBNA_MOBILE_UPCOMING_ACTIVITIES}</CText>
                    </View>
                    <View style={commonStyle.flexRowCenter}>
                        <ChevronSvg
                            width={19}
                            height={20}
                            style={{
                                transform: [{ rotate: showOpenSection ? '0deg' : '180deg' }]
                            }}
                        />
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!showOpenSection}>{renderOpenTaskList(openTaskList, setEditCall)}</Collapsible>
                <TouchableOpacity
                    onPress={() => {
                        setShowHistorySection((showHistorySection) => !showHistorySection)
                    }}
                    style={styles.sectionContainer}
                >
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText style={styles.upcomingText}>{t.labels.PBNA_MOBILE_ACTIVITY_HISTORY}</CText>
                    </View>
                    <View style={commonStyle.flexRowCenter}>
                        <ChevronSvg
                            width={19}
                            height={20}
                            style={{
                                transform: [{ rotate: showHistorySection ? '0deg' : '180deg' }]
                            }}
                        />
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!showHistorySection} style={{ paddingHorizontal: '5%' }}>
                    {renderTaskList(historyTasks)}
                </Collapsible>
                <View style={styles.fullWithHeight_110} />
            </View>
        )
    }

    const renderTaskDetail = () => {
        return (
            <View style={commonStyle.fullWidth}>
                <View style={[commonStyle.fullWidth, commonStyle.alignCenter]}>
                    {activity.Subject === 'Customer Requested' && <CofRequestedDetail activity={activity} />}
                    {activity.Subject === 'Customer Rejected' && <CofRejectedDetail activity={activity} l={l} />}
                    {(activity.Subject === 'Lead Logging Calls' || activity.Subject === 'PD Call') && (
                        <CallDetail
                            activity={activity}
                            onEdit={(v) => {
                                setEditMode(v)
                            }}
                            onSave={() => {
                                setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            type={'Lead'}
                            l={l}
                            setShowActivityDetail={setShowActivityDetail}
                            onAddContact={onAddContact}
                        />
                    )}
                </View>
                <View style={[commonStyle.fullWidth, commonStyle.alignCenter]}>
                    {activity.Subject === 'Lead Task' && (
                        <CommonTaskDetail
                            activity={activity}
                            onEdit={(v) => {
                                setEditMode(v)
                            }}
                            onSave={() => {
                                setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            l={l}
                            setShowActivityDetail={setShowActivityDetail}
                        />
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (editMode) {
                            setEditMode(false)
                            Alert.alert(t.labels.PBNA_MOBILE_ALERT, t.labels.PBNA_MOBILE_ALERT_MESSAGE_NOT_SAVED, [
                                {
                                    text: _.capitalize(t.labels.PBNA_MOBILE_GO_BACK)
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_YES_PROCEED,
                                    onPress: async () => {
                                        setShowActivityDetail(false)
                                    }
                                }
                            ])
                        } else {
                            setShowActivityDetail(false)
                        }
                    }}
                    hitSlop={{
                        left: 30,
                        right: 30,
                        top: 30,
                        bottom: 30
                    }}
                    style={styles.showActivityDetailContainer}
                >
                    <View style={styles.showActivityDetailArrow} />
                </TouchableOpacity>
            </View>
        )
    }

    const renderPage = () => {
        if (!showActivityDetail) {
            return renderTaskListSection()
        }
        return renderTaskDetail()
    }

    return (
        <View>
            <View style={styles.fullWidthWhiteBackground}>{renderPage()}</View>
            <LogCallForm
                onAddContact={onAddContact}
                cRef={logCallModalRef}
                onSave={() => {
                    setTaskSaveTimes((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                }}
                type={'Lead'}
                l={l}
                isEdit
                editCall={editCall}
            />
        </View>
    )
}

export default LeadActivityTab
