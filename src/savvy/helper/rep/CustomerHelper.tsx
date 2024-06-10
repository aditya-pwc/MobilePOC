import _ from 'lodash'
import { Alert, Animated, FlatList, I18nManager, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { RecordTypeEnum } from '../../enums/RecordType'
import React, { Dispatch, SetStateAction } from 'react'
import DeliveryVisitSvg from '../../../../assets/image/delivery_visit.svg'
import CText from '../../../common/components/CText'
import MerchVisitSvg from '../../../../assets/image/merch_visit.svg'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import CallTelWhiteSvg from '../../../../assets/image/icon-call-tel-white.svg'
import CallWhiteSvg from '../../../../assets/image/icon-call-white.svg'
import moment from 'moment'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { syncDownVisitDetail } from '../../hooks/CustomerHooks'
import { Log } from '../../../common/enums/Log'
import { DropDownType } from '../../enums/Manager'
import { moveTypeMapping, requestStatusMapping } from '../../utils/EquipmentUtils'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import TaskSvg from '../../../../assets/image/task.svg'
import ActivityCustomerSVG from '../../../../assets/image/activity-customer.svg'
import { getTaskLabel } from './TaskHelper'
import { RectButton } from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { deleteTask, markTaskAsComplete } from '../../utils/TaskUtils'
import ProcessDoneModal from '../../components/common/ProcessDoneModal'
import PopMessage from '../../components/common/PopMessage'
import { CommonParam } from '../../../common/CommonParam'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaFSR,
    isPersonaPSR
} from '../../../common/enums/Persona'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { calculateFailedDate } from '../../hooks/EquipmentHooks'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        paddingVertical: 30
    },
    containerUpcoming: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    imageSectionContainer: {
        paddingBottom: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    scheduleWhiteStyle: {
        borderRadius: 4,
        marginRight: 15,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    visitBackGround: {
        alignItems: 'center',
        backgroundColor: '#4656DF',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        width: 40
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 2.5
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    displayTimeCont: {
        marginLeft: 20
    },
    displayText: {
        color: '#706E6B',
        fontSize: 12,
        marginRight: 6,
        marginBottom: 4
    },
    deliveryText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        marginBottom: 4
    },
    scheduledQty: {
        color: '#706E6B',
        fontSize: 12,
        marginRight: 6
    },
    pltText: {
        fontSize: 12,
        marginRight: 6
    },
    salesIcon: {
        height: 40,
        width: 40
    },
    finalTimeText: {
        color: '#706E6B',
        fontSize: 12,
        marginRight: 6,
        marginBottom: 4
    },
    deliveryOrderCont: {
        flexDirection: 'row',
        marginBottom: 4
    },
    fontSize12: {
        fontSize: 12
    },
    merchandiserCont: {
        flexDirection: 'row',
        marginRight: 40
    },
    subtypeText: {
        color: '#706E6B',
        fontSize: 12
    },
    subtypeInner: {
        color: '#000'
    },
    rightCont: {
        width: 180,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
    },
    swipeCont: {
        flex: 1,
        width: '100%'
    },
    inHistoryCont: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    inHistoryView: {
        alignItems: 'center',
        backgroundColor: '#FFC409',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        width: 40
    },
    statusCont: {
        marginLeft: 20
    },
    completeText: {
        color: 'gray',
        marginBottom: 3
    },
    submittedText: {
        fontWeight: '500',
        marginBottom: 3
    },
    dueDateText: {
        color: 'gray'
    },
    scheduledCall: {
        fontWeight: baseStyle.fontWeight.fw_500,
        marginTop: 5,
        fontSize: 14,
        marginBottom: 3
    },
    contactCont: {
        flexDirection: 'row',
        width: '85%'
    },
    textBlack: {
        color: 'black'
    },
    contactText: {
        marginTop: 5,
        color: 'grey'
    },
    nameContactCont: {
        width: '70%',
        marginTop: 5
    },
    contactBlackText: {
        color: 'black'
    },
    activityTitleCont: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 30,
        width: 3,
        backgroundColor: '#F4F4F7',
        marginVertical: -20,
        marginLeft: 40
    },
    submittedTextColor: {
        fontSize: 12,
        color: '#535353'
    },
    informationCard: {
        marginTop: 10,
        marginBottom: 15
    },
    incompleteView: {
        width: '60%',
        overflow: 'hidden'
    },
    statusMappingView: {
        backgroundColor: '#FFFFFF',
        width: 120,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        marginTop: 8,
        borderColor: '#565656',
        borderWidth: 1
    },
    mappingText: {
        fontWeight: '700',
        color: '#565656'
    },
    createdView: {
        flexDirection: 'row',
        marginTop: 8
    },
    requestFF: {
        backgroundColor: '#FFC337'
    },
    requestView: {
        width: 120,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        marginTop: 8
    },
    fontWeight700: {
        fontWeight: '700'
    },
    cancelStatusEB: {
        backgroundColor: '#EB445A'
    },
    blackText: {
        color: '#FFFFFF'
    },
    cancelOnView: {
        flexDirection: 'row',
        marginTop: 8
    },
    cancelStatusD3: {
        backgroundColor: '#D3D3D3'
    },
    serviceInfoView: {
        height: 1,
        width: '100%',
        backgroundColor: '#D3D3D3'
    },
    failedStyle: {
        backgroundColor: baseStyle.color.borderGray,
        borderColor: baseStyle.color.borderGray
    }
})

const formatTime = (date) => {
    if (!(isPersonaCRMBusinessAdmin() || isPersonaFSManager() || isPersonaPSR() || isPersonaFSR())) {
        return formatWithTimeZone(date, TIME_FORMAT.MMM_D_YYYY_HH_MM_A, true, false)
    }

    return moment(date).format(TIME_FORMAT.MMM_D_YYYY_HH_MM_A)
}

const goToSDLVisitDetails = async (data, navigation, dropDownRef?, globalModalRef?) => {
    globalModalRef.current.openModal()
    try {
        await syncDownVisitDetail(data)
        globalModalRef.current.closeModalWithTimeout()
        navigation.navigate('SDLVisitDetails', {
            item: data,
            isFromRep: true
        })
    } catch (err) {
        globalModalRef.current.closeModalWithTimeout()
        if (dropDownRef) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'SDL Visit Details Error', err)
        }
        storeClassLog(
            Log.MOBILE_ERROR,
            'goToSDLVisitDetails',
            'sync down SDL visit details: ' + ErrorUtils.error2String(err)
        )
    }
}
const gotoVisitDetails = async (data, navigation, navName, dropDownRef?, globalModalRef?) => {
    globalModalRef.current.openModal()
    try {
        await syncDownVisitDetail(data)
        globalModalRef.current.closeModalWithTimeout()
        navigation.navigate(navName, {
            item: {
                Id: data.Id,
                storeId: data.PlaceId,
                VisitDate: data.Planned_Date__c,
                status: data.Status__c,
                OwnerId: data.OwnerId,
                ActualVisitStartTime: data.ActualVisitStartTime,
                ActualVisitEndTime: data.ActualVisitEndTime,
                inLocation: data.Check_In_Location_Flag__c,
                Planned_Date__c: data.Planned_Date__c,
                PlannedVisitStartTime: data.PlannedVisitStartTime
            },
            isFromRep: true
        })
    } catch (err) {
        globalModalRef.current.closeModalWithTimeout()
        if (dropDownRef) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'Visit Details Error', err)
        }
        storeClassLog(Log.MOBILE_ERROR, 'gotoVisitDetails', 'syncdown visit details: ' + ErrorUtils.error2String(err))
    }
}

type DeliveryCardsListType = 'UpcomingList' | 'futureTaskList' | 'historyList'
const renderDeliveryCards = (listType: DeliveryCardsListType, v, k, navigation, dropDownRef?, globalModalRef?) => {
    const navName = 'DeliveryVisitDetail'
    const isHistory = listType === 'historyList'
    return (
        <TouchableOpacity
            style={[!isHistory && styles.containerUpcoming, styles.container]}
            key={k}
            onPress={() => {
                gotoVisitDetails(v, navigation, navName, dropDownRef, globalModalRef)
            }}
        >
            <View style={styles.visitBackGround}>
                <DeliveryVisitSvg />
            </View>
            <View style={styles.displayTimeCont}>
                {isHistory && v?.finalDisplayTime && (
                    <CText style={styles.displayText}>{formatTime(v.finalDisplayTime)}</CText>
                )}
                <CText style={styles.deliveryText}>{t.labels.PBNA_MOBILE_CUSTOMERS_DELIVERY}</CText>
                <View style={commonStyle.flexDirectionRow}>
                    {!_.isEmpty(v.Pallet_Count__c) && (
                        <View style={commonStyle.flexDirectionRow}>
                            <CText style={styles.scheduledQty}>{t.labels.PBNA_MOBILE_SCHEDULED_QTY}&nbsp;</CText>
                            <CText style={styles.pltText}>{_.floor(v.Pallet_Count__c)}plt</CText>
                        </View>
                    )}
                    {!_.isEmpty(v.TotalOrdered) && !_.isEmpty(v.Pallet_Count__c) && (
                        <CText style={styles.pltText}>{'|'}</CText>
                    )}
                    {!_.isEmpty(v.TotalOrdered) && (
                        <CText style={styles.pltText}>{_.floor(v.TotalOrdered)}&nbsp;cs</CText>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const renderVisitCards = (listType: DeliveryCardsListType, v, k, navigation, dropDownRef, globalModalRef) => {
    const navName = 'VisitDetails'
    let isMerchandiser = false
    if (v['RecordType.Name'] === RecordTypeEnum.MERCHANDISING) {
        isMerchandiser = true
    }
    const isHistory = listType === 'historyList'

    return (
        <TouchableOpacity
            style={[!isHistory && styles.containerUpcoming, styles.container]}
            key={k}
            onPress={() => {
                switch (v['RecordType.Name']) {
                    case RecordTypeEnum.MERCHANDISING:
                        gotoVisitDetails(v, navigation, navName, dropDownRef, globalModalRef)
                        break
                    case RecordTypeEnum.SALES:
                        goToSDLVisitDetails(v, navigation, dropDownRef, globalModalRef)
                        break
                    case RecordTypeEnum.DELIVERY:
                        break
                    default:
                        return null
                }
            }}
        >
            {isMerchandiser && (
                <View style={styles.visitBackGround}>
                    <MerchVisitSvg />
                </View>
            )}
            {!isMerchandiser && <Image source={ImageSrc.IMG_SALES_VISIT} style={styles.salesIcon} />}
            <View style={styles.displayTimeCont}>
                {isHistory && v?.finalDisplayTime && (
                    <CText style={styles.finalTimeText}>{formatTime(v.finalDisplayTime)}</CText>
                )}
                <CText style={styles.deliveryText}>
                    {isMerchandiser
                        ? t.labels.PBNA_MOBILE_MERCHANDISER_VISIT
                        : t.labels.PBNA_MOBILE_SALE_REPRESENTATIVE_VISIT}
                </CText>
                <View style={styles.deliveryOrderCont}>
                    {v.Take_Order_Flag__c === '1' && (
                        <CText style={styles.fontSize12}>{t.labels.PBNA_MOBILE_DELIVERY_ORDER}</CText>
                    )}
                    <View style={commonStyle.flexDirectionRow}>
                        {v.Take_Order_Flag__c === '1' && v.Pull_Number__c && (
                            <CText style={styles.fontSize12}>{' | '}</CText>
                        )}
                        {v.Pull_Number__c && <CText style={styles.fontSize12}>P{_.floor(v.Pull_Number__c)}</CText>}
                    </View>
                </View>
                {isMerchandiser && (
                    <View style={styles.merchandiserCont}>
                        <CText style={styles.subtypeText}>
                            {t.labels.PBNA_MOBILE_VISIT_SUBTYPE}&nbsp;
                            <CText style={styles.subtypeInner}>{v.Visit_Subtype__c}</CText>
                        </CText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const renderTaskCards = (
    listType: DeliveryCardsListType,
    v: any,
    k: React.Key,
    onClick?: Function,
    onMarkAsComplete?: React.Dispatch<React.SetStateAction<boolean>>,
    l?: any,
    setEditCall?: Dispatch<SetStateAction<any>>,
    logCallFormRef?: React.MutableRefObject<null>
) => {
    const isHistory = listType === 'historyList'
    let swipeableRow: Swipeable
    const close = () => {
        swipeableRow?.close()
    }
    const renderRightAction = (
        text: string,
        color: string,
        x: number,
        progress: Animated.AnimatedInterpolation,
        type: string
    ) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0]
        })
        const handleDeleteTask = () => {
            const isTask = v.Subject === 'Lead Task' || v.Subject === 'Customer Task'
            Alert.alert(
                isTask ? t.labels.PBNA_MOBILE_DELETE_TASK : t.labels.PBNA_MOBILE_DELETE_CALL,
                isTask ? t.labels.PBNA_MOBILE_DELETE_TASK_MESSAGE : t.labels.PBNA_MOBILE_DELETE_CALL_MESSAGE,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'default'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_DELETE,
                        style: 'default',
                        onPress: () => {
                            ;(async () => {
                                try {
                                    global.$globalModal.openModal()
                                    await deleteTask(v.Id, v._soupEntryId)
                                    onMarkAsComplete && onMarkAsComplete()
                                    global.$globalModal.closeModal()
                                    global.$globalModal.openModal(
                                        <ProcessDoneModal type="success">
                                            <PopMessage>
                                                {isTask
                                                    ? t.labels.PBNA_MOBILE_TASK_DELETE_SUCCESS_MSG
                                                    : t.labels.PBNA_MOBILE_CALL_DELETE_SUCCESS_MSG}
                                            </PopMessage>
                                        </ProcessDoneModal>
                                    )
                                    setTimeout(() => {
                                        global.$globalModal.closeModal()
                                    }, 3000)
                                } catch (e) {
                                    storeClassLog(
                                        Log.MOBILE_ERROR,
                                        'handleDeleteTask',
                                        'delete task: ' + ErrorUtils.error2String(e)
                                    )
                                    global.$globalModal.closeModal()
                                    global.$globalModal.openModal(
                                        <ProcessDoneModal type="failed">
                                            <PopMessage>
                                                {isTask
                                                    ? t.labels.PBNA_MOBILE_DELETE_TASK_FAILED
                                                    : t.labels.PBNA_MOBILE_DELETE_CALL_FAILED}
                                            </PopMessage>
                                        </ProcessDoneModal>,
                                        t.labels.PBNA_MOBILE_OK
                                    )
                                }
                            })()
                        }
                    }
                ]
            )
        }
        const handleMarkAsComplete = () => {
            Alert.alert(t.labels.PBNA_MOBILE_MARK_COMPLETE, t.labels.PBNA_MOBILE_ALERT_MESSAGE_MARK_COMPLETE, [
                {
                    text: t.labels.PBNA_MOBILE_GO_BACK
                },
                {
                    text: t.labels.PBNA_MOBILE_YES_PROCEED,
                    onPress: () => {
                        ;(async () => {
                            try {
                                global.$globalModal.openModal()
                                await markTaskAsComplete(v)
                                onMarkAsComplete && onMarkAsComplete()
                                global.$globalModal.closeModal()
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type="success">
                                        <PopMessage>{t.labels.PBNA_MOBILE_TASK_MARKED_SUCCESS_MSG}</PopMessage>
                                    </ProcessDoneModal>
                                )
                                setTimeout(() => {
                                    global.$globalModal.closeModal()
                                }, 3000)
                            } catch (e) {
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'pressHandler',
                                    'update task (mark as complete): ' + ErrorUtils.error2String(e)
                                )
                                global.$globalModal.closeModal()
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type="failed">
                                        <PopMessage>{t.labels.PBNA_MOBILE_TASK_MARK_FAILED_MESSAGE}</PopMessage>
                                    </ProcessDoneModal>,
                                    t.labels.PBNA_MOBILE_OK
                                )
                            }
                        })()
                    }
                }
            ])
        }
        const pressHandler = async () => {
            close()
            if (type === 'markAsComplete') {
                handleMarkAsComplete()
            } else if (type === 'delete') {
                handleDeleteTask()
            }
        }
        const pressCallHandler = () => {
            close()
            if (type === 'markAsComplete') {
                setEditCall(v)
                logCallFormRef?.current?.open()
            } else if (type === 'delete') {
                handleDeleteTask()
            }
        }
        return (
            <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
                <View style={[styles.rightAction, { backgroundColor: color }]}>
                    <RectButton
                        activeOpacity={0}
                        style={[styles.rightAction]}
                        onPress={v.Subject === 'Customer Logging Calls' ? pressCallHandler : pressHandler}
                    >
                        {type === 'markAsComplete' ? (
                            <View style={styles.rightAction}>
                                <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_MARK_AS}</CText>
                                <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_COMPLETE.toUpperCase()}</CText>
                            </View>
                        ) : (
                            <CText style={styles.actionText}>{text}</CText>
                        )}
                    </RectButton>
                </View>
            </Animated.View>
        )
    }
    const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
        <View style={styles.rightCont}>
            {renderRightAction(
                t.labels.PBNA_MOBILE_MARK_COMPLETE.toUpperCase(),
                '#2DD36F',
                90,
                progress,
                'markAsComplete'
            )}
            {renderRightAction(t.labels.PBNA_MOBILE_DELETE.toUpperCase(), '#EB445A', 90, progress, 'delete')}
        </View>
    )

    return (
        <Swipeable
            ref={(ref) => {
                if (ref !== undefined) {
                    swipeableRow = ref
                }
            }}
            containerStyle={styles.swipeCont}
            friction={1}
            enableTrackpadTwoFingerGesture
            rightThreshold={10}
            renderRightActions={renderRightActions}
            enabled={!isHistory && v.OwnerId === CommonParam.userId}
        >
            <TouchableOpacity
                style={[styles.container, !isHistory && styles.containerUpcoming]}
                key={k}
                onPress={() => {
                    if (isHistory && v.Subject === 'Change of Ownership Submitted') {
                        onClick && onClick(v, 'Change of Ownership Submitted')
                    } else {
                        if (onClick) {
                            onClick(v)
                        }
                    }
                }}
            >
                {isHistory && v.Subject === 'Change of Ownership Submitted' && (
                    <View style={styles.inHistoryCont}>
                        <View style={styles.inHistoryView}>
                            <ActivityCustomerSVG />
                        </View>
                        <View style={styles.statusCont}>
                            {v.Status === 'Complete' && (
                                <CText style={styles.completeText}>
                                    {moment(v.LastModifiedDate).format(TIME_FORMAT.MMM_D_YYYY_HH_MM_A)}
                                </CText>
                            )}
                            <CText style={styles.submittedText}>
                                {t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_SUBMITTED_LABEL}
                            </CText>
                            {v.Status === 'Open' && (
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.dueDateText}>{t.labels.PBNA_MOBILE_DUE_DATE}&nbsp;</CText>

                                    <CText
                                        style={{
                                            color:
                                                v.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                                v.Status === 'Open'
                                                    ? '#EB445A'
                                                    : 'black'
                                        }}
                                    >
                                        {moment(v.ActivityDate).format('MMM D, YYYY')}
                                    </CText>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                {v.Subject === 'Customer Task' && (
                    <View style={styles.inHistoryCont}>
                        <View style={styles.inHistoryView}>
                            <TaskSvg />
                        </View>
                        <View style={styles.statusCont}>
                            {v.Status === 'Complete' && (
                                <CText style={styles.completeText}>
                                    {moment(v.LastModifiedDate).format(TIME_FORMAT.MMM_D_YYYY_HH_MM_A)}
                                </CText>
                            )}
                            <CText style={styles.submittedText}>{getTaskLabel(v.Type)}</CText>
                            {v.Status === 'Open' && (
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.dueDateText}>{t.labels.PBNA_MOBILE_DUE_DATE}&nbsp;</CText>

                                    <CText
                                        style={{
                                            color:
                                                v.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                                v.Status === 'Open'
                                                    ? '#EB445A'
                                                    : 'black'
                                        }}
                                    >
                                        {moment(v.ActivityDate).format('MMM D, YYYY')}
                                    </CText>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                {(v.Subject === 'PD Call' || v.Subject === 'Customer Logging Calls') && (
                    <View style={styles.inHistoryCont}>
                        <View style={styles.inHistoryView}>
                            {v.Contact_Made__c === '1' ? <CallTelWhiteSvg /> : <CallWhiteSvg />}
                        </View>
                        <View style={styles.statusCont}>
                            {v.Status === 'Complete' && (
                                <CText style={styles.dueDateText}>
                                    {moment(v.LastModifiedDate).format(TIME_FORMAT.MMM_D_YYYY_HH_MM_A)}
                                </CText>
                            )}
                            <CText style={styles.scheduledCall}>
                                {v.Call_Subject__c || t.labels.PBNA_MOBILE_SCHEDULED_CALL}
                            </CText>
                            {v.Status === 'Open' && (
                                <View style={commonStyle.flexDirectionColumn}>
                                    <View style={commonStyle.flexDirectionRow}>
                                        <CText style={styles.dueDateText}>{t.labels.PBNA_MOBILE_DUE_DATE}&nbsp;</CText>
                                        <CText
                                            style={{
                                                color:
                                                    v.ActivityDate < moment().format(TIME_FORMAT.Y_MM_DD) &&
                                                    v.Status === 'Open'
                                                        ? '#EB445A'
                                                        : 'black'
                                            }}
                                        >
                                            {moment(v.ActivityDate).format('MMM D, YYYY')}&nbsp;
                                        </CText>
                                    </View>
                                    {v.Name_of_Contact__c && (
                                        <View style={styles.contactCont}>
                                            <CText style={styles.dueDateText}>
                                                {t.labels.PBNA_MOBILE_CONTACT}&nbsp;
                                            </CText>
                                            <CText style={styles.textBlack} numberOfLines={1}>
                                                {v.Name_of_Contact__c}
                                            </CText>
                                        </View>
                                    )}
                                </View>
                            )}
                            {v.Contact_Made__c === '1' && (
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.contactText}>{t.labels.PBNA_MOBILE_CONTACT}&nbsp;</CText>
                                    <View style={styles.nameContactCont}>
                                        <CText style={styles.contactBlackText} numberOfLines={1}>
                                            {v.Name_of_Contact__c}
                                        </CText>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </Swipeable>
    )
}

const renderPepsiDirectCards = (v: any, k: React.Key, navigation: any) => {
    return (
        <TouchableOpacity
            style={[styles.container]}
            key={k}
            onPress={() => {
                navigation.navigate('PepsiDirectOrderDetail', {
                    orderId: v.Id
                })
            }}
        >
            <View style={styles.visitBackGround}>
                <Image style={{ width: 40, height: 40 }} source={ImageSrc.ICON_BAG} />
            </View>
            <View style={styles.displayTimeCont}>
                {!_.isEmpty(v?.EffectiveDate) && (
                    <CText style={styles.displayText}>{formatTime(v.EffectiveDate)}</CText>
                )}
                <CText style={styles.deliveryText}>{t.labels.PBNA_MOBILE_PEPSI_DIRECT}</CText>
                <View style={commonStyle.flexDirectionRow}>
                    <CText style={styles.pltText}>{_.capitalize(t.labels.PBNA_MOBILE_ORDER)}</CText>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export const renderActivityTile = (
    listType: DeliveryCardsListType,
    list: Array<any>,
    navigation: any,
    globalModalRef: any,
    onClick?: any,
    dropDownRef?: any,
    setRefreshFlag?: Dispatch<SetStateAction<boolean>>,
    l?: any,
    setEditCall?: Dispatch<SetStateAction<any>>,
    logCallFormRef?: any
) => {
    return (
        <FlatList
            data={list}
            renderItem={({ item, index }) => {
                if (item['RecordType.Name'] === RecordTypeEnum.DELIVERY) {
                    return renderDeliveryCards(listType, item, index, navigation, dropDownRef, globalModalRef)
                } else if (
                    item['RecordType.Name'] === RecordTypeEnum.MERCHANDISING ||
                    item['RecordType.Name'] === RecordTypeEnum.SALES
                ) {
                    return renderVisitCards(listType, item, index, navigation, dropDownRef, globalModalRef)
                } else if (item.Sls_Mthd_Descr__c === 'Pepsi Direct') {
                    return renderPepsiDirectCards(item, index, navigation)
                }
                return renderTaskCards(listType, item, index, onClick, setRefreshFlag, l, setEditCall, logCallFormRef)
            }}
            ItemSeparatorComponent={() => {
                if (listType === 'historyList') {
                    return <View style={styles.activityTitleCont} />
                }
                return null
            }}
        />
    )
}

const renderSubmittedAndScheduled = (v) => {
    if (
        _.isEmpty(v.submitted_date__c) &&
        (_.isEmpty(v.sched_beg_dte__c) || v.sched_beg_dte__c === '1900-01-01') &&
        !_.isEmpty(v.ord_rcv_dte_tme__c)
    ) {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_VIA}&nbsp;</CText>
                <CText style={[styles.fontSize12, styles.textBlack]}>{t.labels.PBNA_MOBILE_EXTERNAL_SYSTEM}</CText>
            </View>
        )
    }
    if (v.sched_beg_dte__c && v.sched_beg_dte__c !== '1900-01-01') {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <CText style={styles.submittedTextColor}>{_.capitalize(t.labels.PBNA_MOBILE_SCHEDULED_ON)}&nbsp;</CText>
                <CText style={[styles.fontSize12, styles.textBlack]}>
                    {moment(v.sched_beg_dte__c).format(TIME_FORMAT.MMM_DD_YYYY)}&nbsp;
                </CText>
            </View>
        )
    }
    return (
        <View style={commonStyle.flexDirectionRow}>
            <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_SUBMITTED_ON}&nbsp;</CText>
            <CText style={[styles.fontSize12, styles.textBlack]}>
                {moment(v.submitted_date__c).format('MMM DD, YYYY')}&nbsp;
            </CText>
            <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_BY}&nbsp;</CText>
            <CText style={[styles.fontSize12, styles.textBlack]}>{v['requested_by__r.Name']}</CText>
        </View>
    )
}

const renderServiceInformationCards = (v, k, onClick) => {
    const moveMap = moveTypeMapping()
    switch (v['parent_request_record__r.status__c'] || v.status__c) {
        case 'FAILED':
            return (
                <TouchableOpacity
                    key={k}
                    onPress={() => {
                        onClick(v)
                    }}
                >
                    <View style={styles.informationCard}>
                        <View style={commonStyle.flexRowSpaceCenter}>
                            <View style={styles.incompleteView}>
                                <CText numberOfLines={1} style={styles.deliveryText}>
                                    {moveMap[v.equip_move_type_cde__c] || ''}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View style={[styles.statusMappingView, styles.failedStyle]}>
                                <CText style={styles.mappingText}>
                                    {
                                        requestStatusMapping()[v['parent_request_record__r.status__c'] || v.status__c]
                                            .label
                                    }
                                </CText>
                            </View>
                        </View>
                        <View style={styles.createdView}>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_FAILED_ON}&nbsp;</CText>
                                <CText style={[styles.fontSize12, styles.textBlack]}>
                                    {calculateFailedDate(v)}&nbsp;
                                </CText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        case 'DRAFT':
            return (
                <TouchableOpacity
                    key={k}
                    onPress={() => {
                        onClick(v)
                    }}
                >
                    <View style={styles.informationCard}>
                        <View style={commonStyle.flexRowSpaceCenter}>
                            <View style={styles.incompleteView}>
                                <CText numberOfLines={1} style={styles.deliveryText}>
                                    {t.labels.PBNA_MOBILE_INCOMPLETE}&nbsp;{moveMap[v.equip_move_type_cde__c] || ''}
                                    &nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View style={styles.statusMappingView}>
                                <CText style={styles.mappingText}>
                                    {
                                        requestStatusMapping()[v['parent_request_record__r.status__c'] || v.status__c]
                                            .label
                                    }
                                </CText>
                            </View>
                        </View>
                        <View style={styles.createdView}>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_CREATED_ON}&nbsp;</CText>
                                <CText style={[styles.fontSize12, styles.textBlack]}>
                                    {moment(v.CreatedDate).format('MMM DD, YYYY')}&nbsp;
                                </CText>
                                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_BY}&nbsp;</CText>
                                <CText style={[styles.fontSize12, styles.textBlack]}>{v['CreatedBy.Name']}</CText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        case 'INCOMPLETE':
        case 'SUBMITTED':
            return (
                <TouchableOpacity
                    key={k}
                    onPress={() => {
                        onClick(v)
                    }}
                >
                    <View style={styles.informationCard}>
                        <View style={commonStyle.flexRowSpaceCenter}>
                            <View style={styles.incompleteView}>
                                <CText numberOfLines={1} style={styles.deliveryText}>
                                    {moveMap[v.equip_move_type_cde__c] || ''}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View style={[styles.requestView, styles.requestFF]}>
                                <CText style={styles.fontWeight700}>
                                    {
                                        requestStatusMapping()[v['parent_request_record__r.status__c'] || v.status__c]
                                            .label
                                    }
                                </CText>
                            </View>
                        </View>
                        <View style={styles.createdView}>{renderSubmittedAndScheduled(v)}</View>
                    </View>
                </TouchableOpacity>
            )
        case 'CANCELLED':
            return (
                <TouchableOpacity
                    key={k}
                    onPress={() => {
                        onClick(v)
                    }}
                >
                    <View style={styles.informationCard}>
                        <View style={commonStyle.flexRowSpaceCenter}>
                            <View style={styles.incompleteView}>
                                <CText numberOfLines={1} style={styles.deliveryText}>
                                    {moveMap[v.equip_move_type_cde__c] || ''}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View style={[styles.requestView, styles.cancelStatusEB]}>
                                <CText style={[styles.fontWeight700, styles.blackText]}>
                                    {requestStatusMapping()[v.status__c].label}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.cancelOnView}>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.submittedTextColor}>
                                    {t.labels.PBNA_MOBILE_CANCELLED_ON}&nbsp;
                                </CText>
                                <CText style={[styles.fontSize12, styles.textBlack]}>
                                    {moment(v.LastModifiedDate).format('MMM DD, YYYY')}
                                </CText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        case 'CLOSED':
            return (
                <TouchableOpacity
                    key={k}
                    onPress={() => {
                        onClick(v)
                    }}
                >
                    <View style={styles.informationCard}>
                        <View style={commonStyle.flexRowSpaceCenter}>
                            <View style={styles.incompleteView}>
                                <CText numberOfLines={1} style={styles.deliveryText}>
                                    {moveMap[v.equip_move_type_cde__c] || ''}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View style={[styles.requestView, styles.cancelStatusD3]}>
                                <CText style={styles.mappingText}>
                                    {
                                        requestStatusMapping()[v['parent_request_record__r.status__c'] || v.status__c]
                                            .label
                                    }
                                </CText>
                            </View>
                        </View>
                        <View style={styles.cancelOnView}>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.submittedTextColor}>{t.labels.PBNA_MOBILE_CLOSED_ON}&nbsp;</CText>
                                <CText style={[styles.fontSize12, styles.textBlack]}>
                                    {moment(v.LastModifiedDate).format('MMM DD, YYYY')}
                                </CText>
                            </View>
                        </View>
                        {v.request_subtype__c === 'Move Request Line Item' && (
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.submittedTextColor}>{v.completedCount} /</CText>
                                <CText style={styles.submittedTextColor}>
                                    {' '}
                                    {v.totalCount}&nbsp;{t.labels.PBNA_MOBILE_COMPLETED}
                                </CText>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            )
        default:
            return null
    }
}
export const renderServiceInformationTile = (list, onClick) => {
    return _.map(list, (v, k) => {
        if (
            (v.request_subtype__c === 'Service Request' && v.serv_ord_type_cde__c !== 'PM') ||
            v.request_subtype__c !== 'Service Request'
        ) {
            if (v === 'p') {
                return <View style={styles.serviceInfoView} key={k} />
            }
            return renderServiceInformationCards(v, k, onClick)
        }
        return null
    })
}
