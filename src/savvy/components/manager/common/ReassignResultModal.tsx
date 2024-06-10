/**
 * @description A modal to show reassign result.
 * @author Bao Xupeng
 * @email xupeng.bao@pwc.com
 * @date 2021-04-14
 */

import React, { useEffect } from 'react'
import { View, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { DEFAULT_DELAY_TIME } from '../../../utils/MerchManagerUtils'
import { ReassignType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'

const OPACITY = 1

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 200,
        height: 220,
        alignItems: 'center'
    },
    imgSuccess: {
        width: 60,
        height: 60,
        marginTop: 50,
        marginBottom: 23
    },
    reassignMsg: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        textAlign: 'center',
        maxWidth: 250
    },
    marginTop35: {
        marginTop: 35
    },
    width_300: {
        width: 300
    },
    flexRow: {
        flexDirection: 'row'
    },
    alignCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    height_300: {
        width: 300,
        height: 260
    }
})

interface PropsType {
    cRef?: any
    reassignType?: string
    visitType?: string
    totalAssign?: string
    navigation?: any
    modalVisible?: boolean
    setModalVisible?: any
    isAddToMyTeam?: boolean
    isAddToCustomer?: boolean
    userName?: string
    isRemovedFromMyTeam?: boolean
    isPublishedSuccessfully?: boolean
    isServiceDetail?: boolean
    isRemovedFromMyCustomer?: boolean
    isUpdatedServiceDetail?: boolean
    isAddMeetingSuccess?: boolean
    isMeetingDeletedSuccess?: boolean
    isMeetingUpdatedSuccess?: boolean
    isLocationSavedSuccess?: boolean
    isLocationSwitchSuc?: boolean
    isLanguageSwitchSuccess?: boolean
    selectedLanguage?: string
    switchSucMsg?: string
    isNeedThreeHundredSize?: boolean
    isRemovedFromMyDirect?: boolean
    isAddToMyDirect?: boolean
}

const getTipText = (reassignType) => {
    if (reassignType === ReassignType.REASSIGN) {
        return t.labels.PBNA_MOBILE_BEEN_REASSIGNED
    }
    if (reassignType === ReassignType.DELETE) {
        return t.labels.PBNA_MOBILE_BEEN_DELETED_WITH_EXCLAMATION
    }
    if (reassignType === ReassignType.UNASSIGN) {
        return t.labels.PBNA_MOBILE_BEEN_UNASSIGNED
    }
    return ''
}

const isShowTotalAssign = (reassignType) => {
    return (
        reassignType === ReassignType.REASSIGN ||
        reassignType === ReassignType.DELETE ||
        reassignType === ReassignType.UNASSIGN
    )
}

const needWidthThreeHundred = (
    isAddToMyTeam,
    isAddToCustomer,
    isRemovedFromMyTeam,
    isRemovedFromMyCustomer,
    isUpdatedServiceDetail,
    isAddMeetingSuccess,
    isMeetingDeletedSuccess,
    isMeetingUpdatedSuccess,
    isLocationSavedSuccess,
    isLocationSwitchSuc,
    isLanguageSwitchSuccess,
    isRemovedFromMyDirect,
    isAddToMyDirect
) => {
    return (
        isAddToMyTeam ||
        isAddToCustomer ||
        isRemovedFromMyTeam ||
        isRemovedFromMyCustomer ||
        isUpdatedServiceDetail ||
        isAddMeetingSuccess ||
        isMeetingDeletedSuccess ||
        isMeetingUpdatedSuccess ||
        isLocationSavedSuccess ||
        isLocationSwitchSuc ||
        isLanguageSwitchSuccess ||
        isRemovedFromMyDirect ||
        isAddToMyDirect
    )
}

const renderVisitMsg = (totalAssign, visitType) => {
    if (totalAssign === '1') {
        if (visitType === ReassignType.RECURRING) {
            return t.labels.PBNA_MOBILE_RECURRING_VISIT_HAS
        }
        return t.labels.PBNA_MOBILE_VISIT_HAS
    }
    if (visitType === ReassignType.RECURRING) {
        return t.labels.PBNA_MOBILE_RECURRING_VISITS_HAVE
    }
    return t.labels.PBNA_MOBILE_VISITS_HAVE
}

const ReassignResultModal = (props: PropsType) => {
    const {
        reassignType,
        totalAssign,
        modalVisible,
        setModalVisible,
        isAddToMyTeam,
        isAddToCustomer,
        userName,
        isRemovedFromMyTeam,
        isPublishedSuccessfully,
        isServiceDetail,
        isRemovedFromMyCustomer,
        isUpdatedServiceDetail,
        visitType,
        isAddMeetingSuccess,
        isMeetingDeletedSuccess,
        isMeetingUpdatedSuccess,
        isLocationSavedSuccess,
        isLocationSwitchSuc,
        isLanguageSwitchSuccess,
        selectedLanguage,
        switchSucMsg,
        isNeedThreeHundredSize,
        isRemovedFromMyDirect,
        isAddToMyDirect
    } = props
    const ICON_SUCCESS = ImageSrc.ICON_SUCCESS

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setModalVisible(false)
        }, DEFAULT_DELAY_TIME)
        return () => {
            clearTimeout(timeoutId)
        }
    })

    return (
        <Modal animationType="fade" transparent visible={modalVisible}>
            <TouchableOpacity
                activeOpacity={OPACITY}
                style={styles.centeredView}
                // onPressOut={() => { setModalVisible(!modalVisible) }}
            >
                <TouchableWithoutFeedback>
                    <View
                        style={[
                            styles.modalView,
                            needWidthThreeHundred(
                                isAddToMyTeam,
                                isAddToCustomer,
                                isRemovedFromMyTeam,
                                isRemovedFromMyCustomer,
                                isUpdatedServiceDetail,
                                isAddMeetingSuccess,
                                isMeetingDeletedSuccess,
                                isMeetingUpdatedSuccess,
                                isLocationSavedSuccess,
                                isLocationSwitchSuc,
                                isLanguageSwitchSuccess,
                                isRemovedFromMyDirect,
                                isAddToMyDirect
                            ) && styles.width_300,
                            isServiceDetail && styles.height_300,
                            isNeedThreeHundredSize && styles.width_300
                        ]}
                    >
                        <Image
                            style={[styles.imgSuccess, !isShowTotalAssign(reassignType) && styles.marginTop35]}
                            source={ICON_SUCCESS}
                        />
                        {isShowTotalAssign(reassignType) && (
                            <View>
                                <CText style={styles.reassignMsg}>
                                    {totalAssign} {renderVisitMsg(totalAssign, visitType)}
                                </CText>
                                <CText style={styles.reassignMsg}>{getTipText(reassignType)}</CText>
                            </View>
                        )}
                        {isPublishedSuccessfully && (
                            <View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SCHEDULE}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_PUBLISHED}</CText>
                            </View>
                        )}
                        {isAddToMyTeam && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_IS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_ADDED_TO}</CText>
                                <CText style={styles.reassignMsg}>‘{t.labels.PBNA_MOBILE_MY_TEAM}’</CText>
                            </View>
                        )}
                        {isAddToCustomer && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_IS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_ADDED_TO}</CText>
                                <CText style={styles.reassignMsg}>‘{t.labels.PBNA_MOBILE_MY_CUSTOMERS}’</CText>
                            </View>
                        )}
                        {isRemovedFromMyTeam && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_WAS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_REMOVED}</CText>
                                <CText style={styles.reassignMsg}>
                                    {t.labels.PBNA_MOBILE_FROM} ‘{t.labels.PBNA_MOBILE_MY_TEAM}’
                                </CText>
                            </View>
                        )}
                        {isRemovedFromMyCustomer && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_WAS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_REMOVED}</CText>
                                <CText style={styles.reassignMsg}>
                                    {t.labels.PBNA_MOBILE_FROM} ‘{t.labels.PBNA_MOBILE_MY_CUSTOMERS}’
                                </CText>
                            </View>
                        )}
                        {isServiceDetail && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {totalAssign}
                                    </CText>
                                    <CText style={styles.reassignMsg}>
                                        {` ${t.labels.PBNA_MOBILE_VISIT_HAVE_BEEN_ADDED}`}
                                    </CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_RECURRING_VISIT}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_ADDED_TO_NEW_WEEKLY}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SCHEDULES}</CText>
                            </View>
                        )}
                        {isUpdatedServiceDetail && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_VISIT_HAS_BEEN}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_UPDATED_SUCCESSFULLY}</CText>
                            </View>
                        )}
                        {isAddMeetingSuccess && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_YOUR_MEETING_HAS}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_BEEN_ADDED}</CText>
                            </View>
                        )}
                        {isMeetingDeletedSuccess && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_MEETING_HAS}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_BEEN_DELETED}</CText>
                            </View>
                        )}
                        {isMeetingUpdatedSuccess && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_YOUR_MEETING_HAS_BEEN}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_UPDATED}</CText>
                            </View>
                        )}
                        {isLocationSavedSuccess && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_LOCATION_DEFAULTS_HAVE}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_BEEN_SET_SUCCESSFULLY}</CText>
                            </View>
                        )}
                        {isLocationSwitchSuc && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{switchSucMsg}</CText>
                            </View>
                        )}
                        {isLanguageSwitchSuccess && (
                            <View style={styles.alignCenter}>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_LANGUAGE_HAS_BEEN}</CText>
                                <CText style={styles.reassignMsg}>
                                    {t.labels.PBNA_MOBILE_LANGUAGE_CHANGED_TO} {selectedLanguage}
                                </CText>
                            </View>
                        )}
                        {isRemovedFromMyDirect && (
                            <View style={[styles.alignCenter, { width: 400 }]}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_WAS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_REMOVED}</CText>
                                <CText style={styles.reassignMsg}>
                                    {t.labels.PBNA_MOBILE_FROM} {t.labels.PBNA_MOBILE_MY_DIRECT}
                                </CText>
                            </View>
                        )}
                        {isAddToMyDirect && (
                            <View style={styles.alignCenter}>
                                <View style={styles.flexRow}>
                                    <CText ellipsizeMode="tail" numberOfLines={1} style={styles.reassignMsg}>
                                        {userName}
                                    </CText>
                                    <CText style={styles.reassignMsg}>{` ${t.labels.PBNA_MOBILE_WAS}`}</CText>
                                </View>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_SUCCESSFULLY_ADDED_TO}</CText>
                                <CText style={styles.reassignMsg}>{t.labels.PBNA_MOBILE_MY_DIRECT}</CText>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default ReassignResultModal
