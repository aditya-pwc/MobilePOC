import React, { FC, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, Animated, I18nManager, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { syncUpObjDelete } from '../../../../api/SyncUtils'
import { SoupService } from '../../../../service/SoupService'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'
import { Log } from '../../../../../common/enums/Log'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { LeadStatus } from '../../../../enums/Lead'
import moment from 'moment'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import { moveTypeMapping, requestStatusMapping } from '../../../../utils/EquipmentUtils'
import { Request } from '../../../../interface/RequstInterface'
import Collapsible from '../../../../../common/components/Collapsible'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

interface InProgressEquipmentListProps {
    inProgressEquipmentList: Array<Request>
    onClick: any
    equipmentTypeCodeDesc: any
    allowDeleteDraft?: boolean
    onSave?: any
    lead?: any
    readonly?: boolean
}

const styles = StyleSheet.create({
    line1: {
        fontWeight: '500',
        fontSize: 16,
        marginTop: 6,
        overflow: 'hidden'
    },
    line2: {
        marginTop: 6,
        overflow: 'hidden'
    },
    pillBackground: {
        width: 120,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        marginTop: 8
    },
    collapsibleArrowView: { flexDirection: 'row-reverse', paddingHorizontal: '5%', paddingVertical: 10 },
    arrowPress: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    collapsibleArrowText: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10
    },
    inProgressEquipmentListTouchBox: {
        backgroundColor: 'white',
        borderRadius: 10
    },
    inProgressEquipmentListView: {
        height: 90,
        width: 90,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0
    },
    inProgressEquipmentItemImg: {
        height: 52 * 1.5,
        width: 40 * 1.5,
        resizeMode: 'contain'
    },
    InProgressEquipmentListItem: {
        height: '100%',
        width: '75%'
    },
    rootView: { paddingHorizontal: 22 },
    spacer: { marginBottom: 10 },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 10,
        padding: 5,
        flex: 1,
        flexDirection: 'row'
    },
    itemRightContainer: {
        flex: 1
    },
    containerStyle: {
        borderRadius: 10,
        flex: 1,
        width: '100%'
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
    statusStyle: {
        fontWeight: '500',
        color: 'black'
    },
    statusStyle2: {
        fontWeight: '500',
        color: '#565656'
    },
    deleteDraftMsg: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    statusLabel: {
        backgroundColor: 'white',
        borderColor: '#565656',
        borderWidth: 1
    }
})

const InProgressEquipmentList: FC<InProgressEquipmentListProps> = (props: InProgressEquipmentListProps) => {
    const {
        inProgressEquipmentList,
        onClick,
        equipmentTypeCodeDesc,
        allowDeleteDraft,
        onSave,
        lead,
        readonly = false
    } = props
    const [showAll, setShowAll] = useState(true)

    const renderSubmittedAndScheduled = (item) => {
        if (
            _.isEmpty(item.submitted_date__c) &&
            (_.isEmpty(item.sched_beg_dte__c) || item.sched_beg_dte__c === '1900-01-01') &&
            !_.isEmpty(item.ord_rcv_dte_tme__c)
        ) {
            return (
                <View style={styles.itemRightContainer}>
                    <CText style={styles.line1}>{item.equip_setup_desc__c}</CText>
                    <CText style={styles.line2}>
                        <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                        {moveTypeMapping()[item.equip_move_type_cde__c]}
                        <CText style={{ color: 'gray' }}>
                            &nbsp;{t.labels.PBNA_MOBILE_VIA}&nbsp;{t.labels.PBNA_MOBILE_EXTERNAL_SYSTEM}
                        </CText>
                    </CText>
                    <View
                        style={[
                            {
                                backgroundColor: '#FFC337'
                            },
                            styles.pillBackground
                        ]}
                    >
                        <CText style={styles.statusStyle}>{requestStatusMapping()[item.status__c].label}</CText>
                    </View>
                </View>
            )
        }
        if (item.sched_beg_dte__c && item.sched_beg_dte__c !== '1900-01-01') {
            return (
                <View style={styles.itemRightContainer}>
                    <CText style={styles.line1}>{item.equip_setup_desc__c}</CText>
                    <CText style={styles.line2}>
                        <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_SCHEDULED}&nbsp;</CText>
                        {moveTypeMapping()[item.equip_move_type_cde__c]}
                        <CText style={{ color: 'gray' }}>&nbsp;{t.labels.PBNA_MOBILE_ON}&nbsp;</CText>
                        {moment(item.sched_beg_dte__c).format(TIME_FORMAT.MMM_DD_YYYY)}
                    </CText>
                    <View
                        style={[
                            {
                                backgroundColor: '#FFC337'
                            },
                            styles.pillBackground
                        ]}
                    >
                        <CText style={styles.statusStyle}>{requestStatusMapping()[item.status__c].label}</CText>
                    </View>
                </View>
            )
        }
        return (
            <View style={styles.itemRightContainer}>
                <CText style={styles.line1}>{item.equip_setup_desc__c}</CText>
                <CText style={styles.line2}>
                    <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                    {moveTypeMapping()[item.equip_move_type_cde__c]}
                    <CText style={{ color: 'gray' }}>&nbsp;{t.labels.PBNA_MOBILE_REQUEST_ON}&nbsp;</CText>
                    {moment(item.submitted_date__c).format(TIME_FORMAT.MMM_DD_YYYY)}
                    <CText style={{ color: 'gray' }}>&nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;</CText>
                    {item['requested_by__r.Name']}
                </CText>
                <View
                    style={[
                        {
                            backgroundColor: '#FFC337'
                        },
                        styles.pillBackground
                    ]}
                >
                    <CText style={styles.statusStyle}>{requestStatusMapping()[item.status__c].label}</CText>
                </View>
            </View>
        )
    }

    const renderFailed = (item) => {
        return (
            <View style={styles.itemRightContainer}>
                <CText style={styles.line1}>{item.equip_setup_desc__c}</CText>
                <CText style={styles.line2}>
                    <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_FAILED_ON}&nbsp;</CText>
                    {item.failedDate}
                </CText>
                <View
                    style={[
                        {
                            backgroundColor: baseStyle.color.borderGray
                        },
                        styles.pillBackground
                    ]}
                >
                    <CText style={styles.statusStyle}>{requestStatusMapping()[item.status__c].label}</CText>
                </View>
            </View>
        )
    }

    const renderLeftImage = (item) => {
        return (
            <View style={styles.inProgressEquipmentListView}>
                <EquipmentImageDisplay
                    subtypeCde={item.Equip_styp_cde__c}
                    imageStyle={styles.inProgressEquipmentItemImg}
                    filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                    equipTypeDesc={equipmentTypeCodeDesc[item.Equip_type_cde__c]}
                />
            </View>
        )
    }

    const renderDraftItemContent = (item) => {
        return (
            <View style={styles.itemRightContainer}>
                <CText style={styles.line1}>{item.equip_setup_desc__c}</CText>
                <CText style={styles.line2}>
                    <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_CREATED}&nbsp;</CText>
                    {moveTypeMapping()[item.equip_move_type_cde__c]}
                    <CText style={{ color: 'gray' }}>&nbsp;{t.labels.PBNA_MOBILE_REQUEST_ON}&nbsp;</CText>
                    {moment(item.CreatedDate).format(TIME_FORMAT.MMM_DD_YYYY)}
                    <CText style={{ color: 'gray' }}>&nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;</CText>
                    {item['CreatedBy.Name']}
                </CText>
                <View style={[styles.statusLabel, styles.pillBackground]}>
                    <CText style={styles.statusStyle2}>{requestStatusMapping()[item.status__c].label}</CText>
                </View>
            </View>
        )
    }

    const renderDraftItemContainer = (item, isSwiper?: boolean) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    onClick(item)
                }}
            >
                <View style={[styles.itemContainer, { borderRadius: isSwiper ? 0 : 10 }]}>
                    {renderLeftImage(item)}
                    {renderDraftItemContent(item)}
                </View>
            </TouchableOpacity>
        )
    }

    const isAllowed = () => {
        // readonly for no sales/open/business lead
        return (
            allowDeleteDraft &&
            !isPersonaCRMBusinessAdmin() &&
            !readonly &&
            lead?.BUSN_SGMNTTN_LVL_1_NM_c__c &&
            lead?.Location_ID_c__c &&
            lead?.Status__c === LeadStatus.NEGOTIATE &&
            lead?.COF_Triggered_c__c === '0'
        )
    }

    const renderDraftItem = (item) => {
        let swipeableRow: Swipeable
        const close = () => {
            swipeableRow?.close()
        }
        const pressHandler = async () => {
            close()
            Alert.alert(
                t.labels.PBNA_MOBILE_DELETE_DRAFT_TITLE,
                t.labels.PBNA_MOBILE_DELETE_LEAD_DRAFT_MESSAGE + t.labels.PBNA_MOBILE_DELETE_LEAD_DRAFT_MSG,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'default'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_DELETE,
                        style: 'default',
                        onPress: async () => {
                            global.$globalModal.openModal()
                            try {
                                // the parent_request_record__c maybe changed via Exchange
                                const res = await SoupService.retrieveDataFromSoup(
                                    'Request__c',
                                    {},
                                    ['Id'],
                                    'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                                        `WHERE {Request__c:request_id__c}= '${item.parent_request_record__c}'` +
                                        `OR {Request__c:Id}='${item.parent_request_record__c}'`
                                )
                                const requestToDelete = [...res]
                                await syncUpObjDelete(requestToDelete.map((v) => v.Id))
                                await SoupService.removeRecordFromSoup(
                                    'Request__c',
                                    requestToDelete.map((v) => v._soupEntryId + '')
                                )
                                onSave && onSave()
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type={'success'}>
                                        <CText numberOfLines={3} style={styles.deleteDraftMsg}>
                                            {t.labels.PBNA_MOBILE_DELETE_DRAFT_SUCCESS}
                                        </CText>
                                    </ProcessDoneModal>
                                )
                                setTimeout(() => {
                                    global.$globalModal.closeModal()
                                }, 3000)
                                Instrumentation.reportMetric(
                                    `${CommonParam.PERSONA__c} deletes the draft equipment request of lead`,
                                    1
                                )
                            } catch (e) {
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'InProgressEquipmentList.renderDraftItem',
                                    'delete draft from lead equipment list: ' + getStringValue(e)
                                )
                                global.$globalModal.closeModal()
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type={'failed'}>
                                        <CText numberOfLines={3} style={styles.deleteDraftMsg}>
                                            {t.labels.PBNA_MOBILE_DELETE_DRAFT_FAILED}
                                        </CText>
                                    </ProcessDoneModal>,
                                    t.labels.PBNA_MOBILE_OK
                                )
                            }
                        }
                    }
                ]
            )
        }
        const renderRightAction = (
            text: string,
            color: string,
            x: number,
            progress: Animated.AnimatedInterpolation
        ) => {
            const trans = progress.interpolate({
                inputRange: [0, 1],
                outputRange: [x, 0]
            })
            return (
                <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
                    <View style={[styles.rightAction, { backgroundColor: color }]}>
                        <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                            <CText style={styles.actionText}>{text}</CText>
                        </RectButton>
                    </View>
                </Animated.View>
            )
        }
        const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
            <View
                style={{
                    width: 120,
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
                }}
            >
                {renderRightAction(t.labels.PBNA_MOBILE_DELETE.toUpperCase(), '#EB445A', 90, progress)}
            </View>
        )
        return (
            <View style={styles.spacer} key={item.Id}>
                {isAllowed() && (
                    <Swipeable
                        friction={1}
                        containerStyle={styles.containerStyle}
                        enableTrackpadTwoFingerGesture
                        rightThreshold={10}
                        renderRightActions={renderRightActions}
                    >
                        {renderDraftItemContainer(item, true)}
                    </Swipeable>
                )}
                {!isAllowed() && renderDraftItemContainer(item)}
            </View>
        )
    }

    const renderNonDraftItem = (item) => {
        if (item.status__c !== 'FAILED') {
            return (
                <View style={styles.spacer} key={item.Id}>
                    <TouchableOpacity
                        style={styles.inProgressEquipmentListTouchBox}
                        onPress={() => {
                            onClick(item)
                        }}
                    >
                        <View style={styles.itemContainer}>
                            {renderLeftImage(item)}
                            {renderSubmittedAndScheduled(item)}
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View style={styles.spacer} key={item.Id}>
                <TouchableOpacity
                    style={styles.inProgressEquipmentListTouchBox}
                    onPress={() => {
                        onClick(item)
                    }}
                >
                    <View style={styles.itemContainer}>
                        {renderLeftImage(item)}
                        {renderFailed(item)}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const renderItem = (item) => {
        switch (item.status__c) {
            case 'DRAFT':
                return renderDraftItem(item)
            case 'INCOMPLETE':
            case 'SUBMITTED':
            case 'FAILED':
                return renderNonDraftItem(item)
            default:
                return <View />
        }
    }

    return (
        <View style={styles.rootView}>
            {inProgressEquipmentList.length > 0 && (
                <View style={styles.collapsibleArrowView}>
                    <TouchableOpacity
                        style={styles.arrowPress}
                        onPress={() => {
                            setShowAll(!showAll)
                        }}
                    >
                        <CText style={styles.collapsibleArrowText}>
                            {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                        </CText>
                        <ChevronBlue
                            width={19}
                            height={20}
                            style={{ transform: [{ rotate: showAll ? '0deg' : '180deg' }] }}
                        />
                    </TouchableOpacity>
                </View>
            )}

            <Collapsible collapsed={!showAll}>
                {inProgressEquipmentList.map((item) => {
                    return renderItem(item)
                })}
            </Collapsible>
        </View>
    )
}

export default InProgressEquipmentList
