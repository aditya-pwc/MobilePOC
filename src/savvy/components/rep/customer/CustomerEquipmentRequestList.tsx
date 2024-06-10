/**
 * @description Customer Equipment Draft List Component
 * @author Lu
 * @date 2021-12-8
 */
import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, Animated, Alert, I18nManager } from 'react-native'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { syncUpObjDelete } from '../../../api/SyncUtils'
import { SoupService } from '../../../service/SoupService'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { Log } from '../../../../common/enums/Log'
import _ from 'lodash'
import moment from 'moment'
import { moveTypeMapping, requestStatusMapping } from '../../../utils/EquipmentUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../common/CommonParam'
import { isPersonaCRMBusinessAdmin } from '../../../../common/enums/Persona'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'
const styles = StyleSheet.create({
    serviceItem: {
        flex: 1,
        backgroundColor: 'white'
    },
    serviceItemTopBorder: {
        borderTopColor: '#d3d3d3',
        borderTopWidth: 1
    },
    serviceItemWithoutBorder: {
        backgroundColor: 'white',
        flex: 1
    },
    serviceInfo: {
        marginRight: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        width: 120,
        borderColor: '#565656',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    requestInfo: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    draftIcon: {
        color: '#565656',
        fontWeight: '700'
    },
    containerStyle: {
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
    fontSize: {
        fontSize: 12
    },
    fontColor: {
        color: '#595959'
    },
    textStyle: {
        fontSize: 16,
        lineHeight: 25,
        fontWeight: '700'
    },
    alertMsg: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    listStyle: {
        height: 1,
        backgroundColor: '#d3d3d3',
        marginHorizontal: 20
    },
    rightActionRow: {
        width: 120,
        flexDirection: 'row'
    },
    rightActionReverse: {
        width: 120,
        flexDirection: 'row-reverse'
    },
    contentItemContainer: {
        padding: 20,
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    failedStyle: {
        backgroundColor: baseStyle.color.borderGray,
        borderColor: baseStyle.color.borderGray
    }
})

const CustomerEquipmentRequestList = (props: { draftList; onClick; onSave; setTabRefreshTimes; readonly }) => {
    const { draftList, onClick, onSave, setTabRefreshTimes, readonly } = props

    const renderSubmittedAndScheduled = (item) => {
        if (
            _.isEmpty(item.submitted_date__c) &&
            (_.isEmpty(item.sched_beg_dte__c) || item.sched_beg_dte__c === '1900-01-01') &&
            !_.isEmpty(item.ord_rcv_dte_tme__c)
        ) {
            return (
                <CText style={styles.fontSize}>
                    <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                    <CText> {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;</CText>
                    <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_VIA}&nbsp;</CText>
                    <CText>{t.labels.PBNA_MOBILE_EXTERNAL_SYSTEM}</CText>
                </CText>
            )
        }
        if (item.sched_beg_dte__c && item.sched_beg_dte__c !== '1900-01-01') {
            return (
                <CText style={styles.fontSize}>
                    <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SCHEDULED}&nbsp;</CText>
                    <CText> {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;</CText>
                    <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_ON.toLowerCase()}&nbsp;</CText>
                    <CText>{moment(item.sched_beg_dte__c).format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
                </CText>
            )
        }
        return (
            <CText style={styles.fontSize}>
                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                <CText> {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;</CText>
                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_ON.toLowerCase()}&nbsp;</CText>
                <CText>{item.submitted_date__c}</CText>
                <CText style={styles.fontColor}>&nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;</CText>
                <CText>{item.requestedByName}</CText>
            </CText>
        )
    }

    const contentItem = (item) => {
        switch (item.status__c) {
            case 'DRAFT':
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {t.labels.PBNA_MOBILE_INCOMPLETE}&nbsp;
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View style={styles.serviceInfo}>
                                    <CText style={styles.draftIcon}>
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_CREATED_ON}&nbsp;</CText>
                                <CText>{item.createdDate}</CText>
                                <CText style={styles.fontColor}>
                                    &nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;
                                </CText>
                                <CText>{item.createdName}</CText>
                            </CText>
                        </View>
                    </View>
                )
            case 'INCOMPLETE':
            case 'SUBMITTED':
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View
                                    style={[
                                        styles.serviceInfo,
                                        {
                                            backgroundColor: '#FFC337',
                                            borderColor: '#FFC337'
                                        }
                                    ]}
                                >
                                    <CText
                                        style={[
                                            styles.draftIcon,
                                            {
                                                color: 'black'
                                            }
                                        ]}
                                    >
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>{renderSubmittedAndScheduled(item)}</View>
                        {item.request_subtype__c === 'Move Request' && (
                            <View style={styles.requestInfo}>
                                <CText style={styles.fontSize}>
                                    <CText>
                                        {item.CompletedCount}/{item.TotalCount}
                                    </CText>
                                    <CText style={styles.fontColor}>&nbsp;{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                                </CText>
                            </View>
                        )}
                    </View>
                )
            case 'CANCELLED':
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View
                                    style={[
                                        styles.serviceInfo,
                                        {
                                            backgroundColor: '#EB445A',
                                            borderColor: '#EB445A'
                                        }
                                    ]}
                                >
                                    <CText
                                        style={[
                                            styles.draftIcon,
                                            {
                                                color: 'white'
                                            }
                                        ]}
                                    >
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_CANCELLED_ON}&nbsp;</CText>
                                <CText>{item.LastModifiedDate}</CText>
                            </CText>
                        </View>
                    </View>
                )
            case 'CLOSED':
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View
                                    style={[
                                        styles.serviceInfo,
                                        {
                                            backgroundColor: '#d3d3d3',
                                            borderColor: '#d3d3d3'
                                        }
                                    ]}
                                >
                                    <CText
                                        style={[
                                            styles.draftIcon,
                                            {
                                                color: '#565656'
                                            }
                                        ]}
                                    >
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_CLOSED_ON}&nbsp;</CText>
                                <CText>{item.LastModifiedDate}</CText>
                            </CText>
                        </View>
                        {item.request_subtype__c === 'Move Request' && (
                            <View style={styles.requestInfo}>
                                <CText style={styles.fontSize}>
                                    <CText>
                                        {item.CompletedCount}/{item.TotalCount}
                                    </CText>
                                    <CText style={styles.fontColor}>&nbsp;{t.labels.PBNA_MOBILE_COMPLETED}</CText>
                                </CText>
                            </View>
                        )}
                    </View>
                )
            case 'FAILED':
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View style={[styles.serviceInfo, styles.failedStyle]}>
                                    <CText style={styles.draftIcon}>
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_FAILED_ON}&nbsp;</CText>
                                <CText>{item.failedDate}</CText>
                            </CText>
                        </View>
                    </View>
                )
            default:
                return (
                    <View style={styles.serviceItem}>
                        <View
                            style={[
                                styles.serviceItemWithoutBorder,
                                { flexDirection: 'row', justifyContent: 'space-between' }
                            ]}
                        >
                            <View style={commonStyle.flex_1}>
                                <CText style={styles.textStyle}>
                                    {moveTypeMapping()[item.equip_move_type_cde__c]}&nbsp;{t.labels.PBNA_MOBILE_REQUEST}
                                </CText>
                            </View>
                            <View>
                                <View style={styles.serviceInfo}>
                                    <CText style={styles.draftIcon}>
                                        {requestStatusMapping()[item.status__c].label}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.requestInfo}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_CREATED_ON}&nbsp;</CText>
                                <CText>{item.createdDate}</CText>
                                <CText style={styles.fontColor}>
                                    &nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;
                                </CText>
                                <CText>{item.createdName}</CText>
                            </CText>
                        </View>
                    </View>
                )
        }
    }

    const renderItem = (item) => {
        const isDraft = item.item.status__c === 'DRAFT'
        let swipeableRow: Swipeable
        const close = () => {
            swipeableRow?.close()
        }
        const pressHandler = async () => {
            close()
            Alert.alert(t.labels.PBNA_MOBILE_DELETE_DRAFT_TITLE, t.labels.PBNA_MOBILE_DELETE_DRAFT_MESSAGE, [
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
                            const res = await SoupService.retrieveDataFromSoup(
                                'Request__c',
                                {},
                                ['Id'],
                                'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                                    `WHERE {Request__c:request_id__c}= '${item.item.Id}'` +
                                    `OR {Request__c:Id}='${item.item.Id}'`
                            )
                            const requestToDelete = [...res]
                            await syncUpObjDelete(requestToDelete.map((v) => v.Id))
                            await SoupService.removeRecordFromSoup(
                                'Request__c',
                                requestToDelete.map((v) => v._soupEntryId + '')
                            )
                            onSave()
                            setTabRefreshTimes((v) => v + 1)
                            global.$globalModal.openModal(
                                <ProcessDoneModal type={'success'}>
                                    <CText numberOfLines={3} style={styles.alertMsg}>
                                        {t.labels.PBNA_MOBILE_DELETE_DRAFT_SUCCESS}
                                    </CText>
                                </ProcessDoneModal>
                            )
                            setTimeout(() => {
                                global.$globalModal.closeModal()
                            }, 3000)
                            Instrumentation.reportMetric(
                                `${CommonParam.PERSONA__c} deletes the draft equipment request`,
                                1
                            )
                        } catch (e) {
                            storeClassLog(Log.MOBILE_ERROR, 'delete contact from left scroll', getStringValue(e))
                            global.$globalModal.closeModal()
                            global.$globalModal.openModal(
                                <ProcessDoneModal type={'failed'}>
                                    <CText numberOfLines={3} style={styles.alertMsg}>
                                        {t.labels.PBNA_MOBILE_DELETE_DRAFT_FAILED}
                                    </CText>
                                </ProcessDoneModal>,
                                t.labels.PBNA_MOBILE_OK
                            )
                        }
                    }
                }
            ])
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
                <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                    <View style={[styles.rightAction, { backgroundColor: color }]}>
                        <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                            <CText style={styles.actionText}>{text}</CText>
                        </RectButton>
                    </View>
                </Animated.View>
            )
        }
        const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
            <View style={[I18nManager.isRTL ? styles.rightActionReverse : styles.rightActionRow]}>
                {renderRightAction(t.labels.PBNA_MOBILE_DELETE.toUpperCase(), '#EB445A', 90, progress)}
            </View>
        )
        return (
            <>
                {((item.item.request_subtype__c === 'Service Request' && item.item.serv_ord_type_cde__c !== 'PM') ||
                    item.item.request_subtype__c !== 'Service Request') && (
                    <View>
                        {isDraft && (
                            <Swipeable
                                ref={(ref) => {
                                    if (ref !== undefined) {
                                        swipeableRow = ref
                                    }
                                }}
                                friction={1}
                                containerStyle={styles.containerStyle}
                                enableTrackpadTwoFingerGesture
                                rightThreshold={10}
                                renderRightActions={!isPersonaCRMBusinessAdmin() && !readonly && renderRightActions}
                            >
                                <View style={styles.contentItemContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onClick(item.item)
                                        }}
                                    >
                                        <View>{contentItem(item.item)}</View>
                                    </TouchableOpacity>
                                </View>
                            </Swipeable>
                        )}
                        {!isDraft && (
                            <View style={styles.contentItemContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        onClick(item.item)
                                    }}
                                >
                                    <View>{contentItem(item.item)}</View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </>
        )
    }
    const handleFilterNonPMRequest = (draftList) => {
        return draftList.filter((item) => {
            return (
                (item.request_subtype__c === 'Service Request' && item.serv_ord_type_cde__c !== 'PM') ||
                item.request_subtype__c !== 'Service Request'
            )
        })
    }
    const renderSplitLine = () => {
        return <View style={styles.listStyle} />
    }

    return (
        <FlatList
            renderItem={renderItem}
            data={handleFilterNonPMRequest(draftList)}
            ItemSeparatorComponent={renderSplitLine}
        />
    )
}

export default CustomerEquipmentRequestList
