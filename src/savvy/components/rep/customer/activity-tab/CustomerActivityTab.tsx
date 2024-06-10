/**
 * @description The component is the container of the customer activity tab.
 * @author Kiren cao
 * @email wenjie.cao@pwc.com
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native'
import CollapseContainer from '../../../common/CollapseContainer'
import moment from 'moment'
import CallDetail from '../../lead/activity-tab/CallDetail'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { Visit } from '../../../../interface/VisitInterface'
import { Task } from '../../../../interface/LeadModel'
import UpcomingTile from './UpcomingTile'
import CofRequestedDetail from '../../lead/activity-tab/CofRequestedDetail'
import CofRejectedDetail from '../../lead/activity-tab/CofRejectedDetail'
import CommonTaskDetail from '../../lead/activity-tab/CommonTaskDetail'
import ChangeOfOwnership from '../ChangeOfOwnership'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CustomerInvoiceHistory from './CustomerInvoiceHistory'
import { FutureTaskCallsTile } from './FutureTaskCallsTile'
import { CustomerActivityTile } from './CustomerActivityTile'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useTaskDetail } from '../../../../hooks/CustomerHooks'

interface CustomerActivityTabProps {
    deliveryDetailList: Array<Visit>
    preSellDetailList: Array<Visit>
    merDetailList: Array<Visit>
    historyTaskList: Array<Task>
    openTaskList: Array<Task>
    navigation: any
    dropDownRef: any
    taskId?: string
    showDetail?: boolean
    retailStore?: any
    setRefreshFlag?: any
    onAddContact?: any
    invoiceHeader: any
}

const styles = StyleSheet.create({
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    sectionLabel: {
        fontSize: 18,
        fontFamily: 'Gotham',
        color: '#000000',
        fontWeight: 'bold'
    },
    titleLabel: {
        fontSize: 18,
        fontFamily: 'Gotham',
        color: '#000000',
        fontWeight: '900'
    },
    sectionContainer: {
        marginVertical: 40,
        marginHorizontal: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    chevronStyle: {
        width: 18,
        height: 13,
        marginRight: 5
    },
    blockItem: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%'
    },
    container: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    visitBackGround: {
        alignItems: 'center',
        backgroundColor: '#4656DF',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        width: 40
    },
    taskDetailContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    goBackStyle: {
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
    goBackContainer: {
        position: 'absolute',
        left: 20,
        top: 23
    },
    taskListContainer: {
        backgroundColor: 'white',
        width: '100%'
    },
    pendingContainer: {
        height: 150,
        width: '100%'
    },
    hitSlopStyle: {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30
    }
})
export const formatTime = (date) => {
    return moment(date).format(TIME_FORMAT.MMM_D_YYYY_HH_MM_A)
}

const CustomerActivityTab: FC<CustomerActivityTabProps> = (props: CustomerActivityTabProps) => {
    const {
        deliveryDetailList,
        preSellDetailList,
        merDetailList,
        historyTaskList,
        openTaskList,
        navigation,
        dropDownRef,
        taskId,
        showDetail,
        retailStore,
        setRefreshFlag,
        onAddContact,
        invoiceHeader
    } = props
    const [showUpComingTile, setShowUpComingTile] = useState(true)
    const [showActivityHistory, setShowActivityHistory] = useState(false)
    const [showFutureTasksCalls, setShowFutureTasksCalls] = useState(false)
    const [showInvoiceHistory, setShowInvoiceHistory] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const { activity, setActivity, showActivityDetail, setShowActivityDetail } = useTaskDetail(showDetail, taskId)
    const [refreshComplete, setRefreshComplete] = useState<number>(0)
    const changeOfOwnershipRef = useRef(null)

    useEffect(() => {
        if (showUpComingTile) {
            setShowActivityHistory(false)
            setShowFutureTasksCalls(false)
        }
    }, [showUpComingTile])

    useEffect(() => {
        if (showActivityHistory) {
            setShowUpComingTile(false)
            setShowFutureTasksCalls(false)
        }
    }, [showActivityHistory])

    useEffect(() => {
        if (showFutureTasksCalls) {
            setShowUpComingTile(false)
            setShowActivityHistory(false)
        }
    }, [showFutureTasksCalls])

    useEffect(() => {
        if (refreshComplete > 0) {
            const compTask = [...historyTaskList, ...openTaskList].find((taskItem) => taskItem.Id === activity.Id)
            if (compTask) {
                setActivity(compTask)
            }
        }
    }, [historyTaskList, openTaskList])
    const goToChangeOfOwnership = (task) => {
        changeOfOwnershipRef?.current?.openReadOnly(task.Lead__c)
    }

    const handleClick = (activityDetail, type?) => {
        if (type === 'Change of Ownership Submitted') {
            goToChangeOfOwnership(activityDetail)
        } else {
            setRefreshComplete(0)
            setActivity(activityDetail)
            setShowActivityDetail(true)
        }
    }

    const renderTaskListSection = () => {
        return (
            <View style={styles.taskListContainer}>
                <CollapseContainer
                    showContent={showUpComingTile}
                    setShowContent={setShowUpComingTile}
                    title={t.labels.PBNA_MOBILE_UPCOMING_ACTIVITIES}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <UpcomingTile
                        preSellDetailList={preSellDetailList}
                        merDetailList={merDetailList}
                        deliveryDetailList={deliveryDetailList}
                        openTaskList={openTaskList}
                        navigation={navigation}
                        onClick={handleClick}
                        dropDownRef={dropDownRef}
                        setRefreshFlag={() => {
                            setRefreshFlag((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                        }}
                        onAddContact={onAddContact}
                        l={retailStore}
                    />
                </CollapseContainer>
                <CollapseContainer
                    showContent={showFutureTasksCalls}
                    setShowContent={setShowFutureTasksCalls}
                    title={t.labels.PBNA_MOBILE_FUTURE_TASKS_CALLS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                    showInfo={t.labels.PBNA_MOBILE_BEYOND_2_WEEKS}
                >
                    <FutureTaskCallsTile
                        futureOpenTaskList={openTaskList}
                        navigation={navigation}
                        onClick={handleClick}
                        dropDownRef={dropDownRef}
                        setRefreshFlag={() => {
                            setRefreshFlag((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                        }}
                        onAddContact={onAddContact}
                        l={retailStore}
                    />
                </CollapseContainer>
                <CollapseContainer
                    showContent={showActivityHistory}
                    setShowContent={setShowActivityHistory}
                    title={t.labels.PBNA_MOBILE_ACTIVITY_HISTORY}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <CustomerActivityTile
                        preSellDetailList={preSellDetailList}
                        merDetailList={merDetailList}
                        deliveryDetailList={deliveryDetailList}
                        historyTaskList={historyTaskList}
                        navigation={navigation}
                        onClick={handleClick}
                        dropDownRef={dropDownRef}
                        setRefreshFlag={() => {
                            setRefreshFlag((prevTaskSaveTimes: number) => prevTaskSaveTimes + 1)
                        }}
                    />
                </CollapseContainer>
                <CollapseContainer
                    showContent={showInvoiceHistory}
                    setShowContent={setShowInvoiceHistory}
                    title={t.labels.PBNA_MOBILE_INVOICE_HISTORY}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <CustomerInvoiceHistory invoiceHeader={invoiceHeader} retailStore={retailStore} />
                </CollapseContainer>
                <View style={styles.pendingContainer} />
            </View>
        )
    }
    const renderTaskDetail = () => {
        return (
            <View style={commonStyle.fullWidth}>
                <View style={styles.taskDetailContainer}>
                    {activity.Subject === 'Customer Requested' && <CofRequestedDetail activity={activity} />}
                    {activity.Subject === 'Customer Rejected' && <CofRejectedDetail activity={activity} />}
                    {activity.Subject === 'Customer Logging Calls' && (
                        <CallDetail
                            activity={activity}
                            onEdit={(v) => {
                                setEditMode(v)
                            }}
                            type={'RetailStore'}
                            onSave={() => {
                                setRefreshComplete((compSaveTimes) => compSaveTimes + 1)
                                setRefreshFlag((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            l={retailStore}
                            setShowActivityDetail={setShowActivityDetail}
                            onAddContact={onAddContact}
                        />
                    )}
                </View>
                <View style={styles.taskDetailContainer}>
                    {activity.Subject === 'Customer Task' && (
                        <CommonTaskDetail
                            activity={activity}
                            onEdit={(v) => {
                                setEditMode(v)
                            }}
                            onSave={() => {
                                setRefreshFlag((prevTaskSaveTimes) => prevTaskSaveTimes + 1)
                            }}
                            l={retailStore}
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
                    hitSlop={styles.hitSlopStyle}
                    style={styles.goBackContainer}
                >
                    <View style={styles.goBackStyle} />
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
        <View style={styles.taskListContainer}>
            {renderPage()}
            <ChangeOfOwnership
                readOnly
                onSave={() => {
                    setRefreshFlag((v) => v + 1)
                }}
                cRef={changeOfOwnershipRef}
                customer={{}}
            />
        </View>
    )
}

export default CustomerActivityTab
