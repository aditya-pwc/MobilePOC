import React, { FC, useRef, useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import moment from 'moment'
import _ from 'lodash'
import UserAvatar from '../../common/UserAvatar'
import TeamDateTimePicker from '../lead/common/TeamDateTimePicker'
import { updateUserStatus } from '../../../utils/FSManagerSyncUtils'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { t } from '../../../../common/i18n/t'
import SVGPhoneMsgView from '../../manager/common/SVGPhoneMsgView'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

interface SalesRemoveEmployeeProps {
    icon?: any
    message?: any
    onLeftButtonPress?: any
    onRightButtonPress?: any
    leftButtonLabel: string
    rightButtonLabel: string
    detail: any
    cRef: any
    setRemoveFlag: any
}

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container: {
        backgroundColor: 'white',
        marginTop: 22,
        borderRadius: 5,
        flexDirection: 'column',
        // height: 200,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        flex: 1

        // marginHorizontal: '5%'
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    imgPhoneAndMsg: {
        width: 23,
        height: 25
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    userAvatar: {
        // position: 'relative'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    lineText: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12
    },
    rightAction: {
        alignItems: 'center',
        height: 150,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 10
    },
    successModal: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700',
        paddingHorizontal: 40
    },
    detailCont: {
        flexDirection: 'row',
        padding: 20
    },
    detailName: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    beginDate: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12
    },
    phoneSvg: {
        paddingLeft: 20
    },
    localRoute: {
        height: 40,
        backgroundColor: '#F2F4F7',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    rteIdText: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    timeRef: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        borderRadius: 10
    },
    removeView: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    removeText: {
        fontWeight: 'bold',
        lineHeight: 50
    },
    emptyCont: {
        width: '100%',
        paddingHorizontal: 20,
        marginHorizontal: 20
    },
    emptyView: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    renderDetailV: {
        height: 160,
        width: '100%',
        paddingHorizontal: 20
    },
    teamPickerCont: {
        width: '100%',
        padding: 20,
        marginTop: 10
    },
    leftBtnCont: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 60,
        borderBottomLeftRadius: 8,
        elevation: 1,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2
    },
    leftText: {
        color: '#6105BD',
        fontWeight: '700'
    },
    rightBtn: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6105BD',
        height: 60,
        borderBottomRightRadius: 8,
        elevation: 1,
        shadowColor: 'black',
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.2
    },
    rightText: {
        color: 'white',
        fontWeight: '700'
    }
})

const SalesRemoveEmployee: FC<SalesRemoveEmployeeProps> = (props: SalesRemoveEmployeeProps) => {
    const { onLeftButtonPress, onRightButtonPress, leftButtonLabel, rightButtonLabel, detail, setRemoveFlag } = props
    const getFullTime = (value) => {
        const v = value?.toString().toLowerCase()
        if (v === 'false') {
            return 'PT'
        } else if (v === 'true') {
            return 'FT'
        }
        return null
    }
    const [endDate, setEndDate] = useState(moment(new Date()).format(TIME_FORMAT.Y_MM_DD))
    const processAfterUpdate = (eeDetail: any, eeEndDate: string) => {
        global.$globalModal.closeModal()
        global.$globalModal.openModal(
            <ProcessDoneModal type={'success'}>
                <CText numberOfLines={4} style={styles.successModal}>
                    {`${eeDetail.Name} ${t.labels.PBNA_MOBILE_SUCCESSFULLY_REMOVED_TO_MY_TEAM} ${moment(
                        eeEndDate
                    ).format('MMM DD, YYYY')} `}
                </CText>
            </ProcessDoneModal>,
            null
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
        setRemoveFlag && setRemoveFlag()
    }
    const renderDetail = () => {
        return (
            <View style={styles.container}>
                <View style={styles.detailCont}>
                    <View style={styles.userAvatar}>
                        <UserAvatar
                            userStatsId={detail.userStatsId}
                            firstName={detail.FirstName}
                            lastName={detail.LastName}
                            avatarStyle={styles.imgUserImage}
                            userNameText={{ fontSize: 24 }}
                        />
                    </View>
                    <View style={styles.itemContentContainer}>
                        <CText style={styles.detailName} numberOfLines={1}>
                            {detail.Name}
                        </CText>
                        <View style={styles.rowCenter}>
                            <CText style={styles.lineText}>{getFullTime(detail.FT_EMPLYE_FLG_VAL__c)}</CText>
                            {!_.isEmpty(detail.Title) && !_.isEmpty(getFullTime(detail.FT_EMPLYE_FLG_VAL__c)) && (
                                <CText style={styles.itemLine} />
                            )}
                            <CText style={styles.lineText} numberOfLines={1}>
                                {detail.Title || ''}
                            </CText>
                        </View>
                        <View style={styles.rowCenter}>
                            <CText style={styles.lineText} numberOfLines={1}>
                                {t.labels.PBNA_MOBILE_JOINED_TEAM}
                            </CText>
                            {detail.relationship_begin_date__c && (
                                <CText style={styles.beginDate}>
                                    {` ${moment(detail.relationship_begin_date__c).format(TIME_FORMAT.MMMDDY)}`}
                                </CText>
                            )}
                        </View>
                    </View>
                    <View style={styles.phoneSvg}>
                        <SVGPhoneMsgView
                            phone={detail.MobilePhone}
                            noteStyle={styles.rowWithCenter}
                            phoneStyle={[styles.rowWithCenter]}
                        />
                    </View>
                </View>
                <View style={styles.localRoute}>
                    <View style={commonStyle.flexDirectionRow}>
                        <CText style={styles.beginDate}>{t.labels.PBNA_MOBILE_LOCAL_ROUTE}</CText>
                        <CText style={styles.rteIdText}>{` ${detail.LOCL_RTE_ID__c || ''}`}</CText>
                    </View>
                    <View style={commonStyle.flexDirectionRow}>
                        <CText style={styles.beginDate}>{t.labels.PBNA_MOBILE_NATIONAL_ID}</CText>
                        <CText style={styles.rteIdText}>{` ${detail.GTMU_RTE_ID__c || ''}`}</CText>
                    </View>
                </View>
            </View>
        )
    }
    const fromTimeRef = useRef(null)
    return (
        <Modal animationType="fade" transparent visible>
            <View style={styles.modalContainer}>
                <View style={styles.timeRef}>
                    <View style={styles.removeView}>
                        <CText style={styles.removeText}>{t.labels.PBNA_MOBILE_REMOVE_EMPLOYEE_FROM_MY_TEAM}</CText>
                        <View style={styles.emptyCont}>
                            <View style={styles.emptyView} />
                        </View>
                        <View style={styles.renderDetailV}>{renderDetail()}</View>
                        <View style={styles.teamPickerCont}>
                            <TeamDateTimePicker
                                fieldLabel={t.labels.PBNA_MOBILE_SELECT_DATE_FOR_REMOVAL}
                                value={endDate}
                                minDate={detail.relationship_begin_date__c}
                                onChange={(v) => {
                                    setEndDate(moment(v).format(TIME_FORMAT.Y_MM_DD))
                                }}
                                cRef={fromTimeRef}
                            />
                        </View>
                    </View>
                    <View style={commonStyle.flexDirectionRow}>
                        <TouchableOpacity
                            style={styles.leftBtnCont}
                            onPress={() => {
                                if (onLeftButtonPress) {
                                    onLeftButtonPress()
                                }
                            }}
                        >
                            <CText style={styles.leftText}>{leftButtonLabel}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rightBtn}
                            onPress={() => {
                                if (onRightButtonPress) {
                                    onRightButtonPress()
                                    const updateObject = {
                                        Id: detail.managerRelationshipId,
                                        relationship_end_date__c: endDate
                                    }
                                    updateUserStatus(updateObject, () => processAfterUpdate(detail, endDate))
                                }
                            }}
                        >
                            <CText style={styles.rightText}>{rightButtonLabel}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default SalesRemoveEmployee
