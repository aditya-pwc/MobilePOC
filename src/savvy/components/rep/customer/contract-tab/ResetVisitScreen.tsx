/**
 * @description Reset Visit Screen Page(just a blank page, function will be implemented in next sprint)
 * @author Dashun Fu
 * @date 2023-06-27
 */

import React, { FC, useEffect, useState } from 'react'
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import dayjs from 'dayjs'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { t } from '../../../../../common/i18n/t'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import { CDASuccessModal } from './CDASuccessModal'
import { IntervalTime, VisitType } from '../../../../enums/Contract'
import { addResetVisit } from '../../../../api/ApexApis'
import { getRecordTypeIdByDeveloperName } from '../../../../utils/MerchManagerUtils'
import { SCHEDULE_VISIT_GROUP_IS_BEING_USED } from '../../../manager/helper/VisitHelper'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../../enums/Manager'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { CommonParam } from '../../../../../common/CommonParam'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useSelector } from 'react-redux'
import { HourAbbreviationLocale, MinuteAbbreviationLocale } from '../../../../enums/i18n'
import { syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { refreshCustomerDetailData, getPOGParams, getPOGFileData } from '../../../../helper/rep/ContractHelper'
import PickerModal from '../../../manager/common/PickerModal'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import IconTick from '../../../../../../assets/image/icon-tick.svg'
import { openPDFFile } from '../../../../helper/rep/StartNewCDAHelper'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { DatePickerLegacy } from '../../../common/DatePicker'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { LinearProgress } from 'react-native-elements'

const styles = StyleSheet.create({
    ...SurveyQuestionsStyle,
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        paddingHorizontal: 22
    },
    headerText: {
        fontWeight: '700',
        fontSize: 12,
        fontStyle: 'normal',
        color: '#000000',
        paddingBottom: 26,
        paddingTop: 26
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    headerText1: {
        fontWeight: '900',
        fontSize: 24,
        fontStyle: 'normal',
        color: '#000000',
        paddingBottom: 30,
        paddingTop: 20
    },
    successView: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 8,
        paddingVertical: 13,
        paddingHorizontal: 20,
        marginBottom: 30
    },
    successImage: {
        width: 24,
        height: 23
    },
    successText: {
        flex: 1,
        marginLeft: 10,
        fontWeight: '400',
        fontSize: 14,
        fontStyle: 'normal',
        color: '#000000'
    },
    commonView: {
        marginBottom: 20
    },
    commonView1: {
        marginBottom: 30
    },
    commonLabel: {
        fontWeight: '400',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
        color: '#565656',
        marginBottom: 10
    },
    commonLabel1: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 14,
        flex: 1,
        color: '#565656',
        marginTop: 6
    },
    commonText: {
        fontWeight: '400',
        fontSize: 14,
        fontStyle: 'normal',
        color: '#000000',
        marginBottom: 10
    },
    commonTextInput: {
        lineHeight: 18,
        maxHeight: 200
    },
    takePictureView: {
        marginTop: 30,
        marginBottom: 40,
        display: 'none'
    },
    errorStyle: {
        color: 'red',
        fontSize: 12,
        fontWeight: '400'
    },
    takePictureTouchableStyle: {
        flexDirection: 'row'
    },
    takePictureIcon: {
        width: 16,
        height: 13,
        marginRight: 10
    },
    takePictureLabel: {
        fontFamily: 'Gotham',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
        color: '#565656'
    },
    takePictureLabelBold: {
        fontWeight: '700',
        color: '#00A2D9'
    },
    attachedView: {
        paddingVertical: 27,
        marginBottom: 30,
        backgroundColor: '#F2F4F7'
    },
    attachedIcon: {
        width: 20,
        height: 25,
        marginRight: 6
    },
    attachedLabel: {
        fontFamily: 'Gotham',
        fontWeight: '700',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
        color: '#00A2D9'
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    lookUpStyle: {
        height: 40,
        lineHeight: 50
    },
    clockStyle: {
        marginTop: 15,
        width: 20,
        height: 20,
        marginLeft: 10
    },
    attachedLabelGray: {
        fontFamily: 'Gotham',
        fontWeight: '700',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
        color: baseStyle.color.liteGrey
    }
})

interface ResetVisitScreenProps {
    navigation: NavigationProp<any>
    route: any
}
const ResetVisitScreen: FC<ResetVisitScreenProps> = (props) => {
    const { navigation, route } = props
    const setRefreshFlag = route.params.setRefreshFlag
    const contractId = route.params.contractId
    const contractStartDate = route.params.startDate
    const CDAvisitId = route.params.CDAvisitId
    const isOfflineModalTmp = !!route.params.isOfflineModal
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const accountName = customerDetail['Account.Name']
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showModalVisible, setShowModalVisible] = useState(false)
    const [selectedHour, setSelectedHour] = useState('00')
    const [selectedMinutes, setSelectedMinutes] = useState('00')
    const [durationTimeStr, setDurationTimeStr] = useState('00:00')
    const [plannedDate, setPlannedDate] = useState(
        dayjs(contractStartDate, TIME_FORMAT.Y_MM_DD).add(14, 'days').format(TIME_FORMAT.Y_MM_DD)
    )
    const [agreementCheck, setAgreementCheck] = useState(route.params.agreementCheck)
    const [durationTime, setDurationTime] = useState(0)
    const [instructionText, setInstructionText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { dropDownRef } = useDropDown()
    const [base64String, setBase64String] = useState<string>('')
    const [loadingDecline, setLoadingDecline] = useState(false)

    const fetchPOGBase64 = async () => {
        try {
            setLoadingDecline(true)
            const pogParams = await getPOGParams(CDAvisitId, VisitType.CDA_VISIT, contractId)
            const base64Url = await getPOGFileData(pogParams)
            setBase64String(base64Url || '')
            setLoadingDecline(false)
        } catch (error) {
            setLoadingDecline(false)
            storeClassLog(Log.MOBILE_ERROR, 'fetchPOGBase64', `Get POG File Data: ${ErrorUtils.error2String(error)}`)
        }
    }

    useEffect(() => {
        fetchPOGBase64()
    }, [])

    const handleAgreementCheck = async (agreementCheckTemp: any) => {
        setAgreementCheck(agreementCheckTemp)
    }
    const onPressCancel = () => {
        Alert.alert(t.labels.PBNA_MOBILE_RESET_VISIT_CANCEL_TITLE, t.labels.PBNA_MOBILE_RESET_VISIT_CANCEL_TIPS, [
            {
                text: `${t.labels.PBNA_MOBILE_CANCEL}`,
                onPress: () => {}
            },
            {
                text: `${t.labels.PBNA_MOBILE_SKIP_RESET}`,
                onPress: () => {
                    navigation.goBack()
                }
            }
        ])
    }
    const onAddVisit = async () => {
        try {
            setIsLoading(true)
            const visitDate = dayjs(plannedDate).format(TIME_FORMAT.Y_MM_DD)
            const visitRecordTypeId = await getRecordTypeIdByDeveloperName('Merchandising', 'Visit')
            const newVisit = {
                OwnerId: CommonParam.userId,
                VisitorId: null,
                RecordTypeId: visitRecordTypeId,
                Planned_Date__c: visitDate,
                Take_Order_Flag__c: false,
                Planned_Duration_Minutes__c: durationTime,
                InstructionDescription: instructionText,
                Visit_Subtype__c: 'Resets'
            }
            const data = {
                objNewVisit: newVisit,
                strCustomerId: customerDetail.Id
            }
            addResetVisit(data)
                .then(async (res: any) => {
                    const resObj = JSON.parse(res?.data)
                    await syncUpObjUpdateFromMem('Contract', [
                        {
                            Id: contractId,
                            CDA_Reset_Visit__c: resObj?.data?.visitId || null
                        }
                    ])
                    if (setRefreshFlag) {
                        refreshCustomerDetailData(setRefreshFlag, customerDetail)
                    }
                    setShowSuccessModal(true)
                    setTimeout(() => {
                        navigation.goBack()
                    }, 2000)
                })
                .catch((err) => {
                    setIsLoading(false)
                    setShowSuccessModal(false)
                    if (err?.error?.data === SCHEDULE_VISIT_GROUP_IS_BEING_USED) {
                        dropDownRef?.current?.alertWithType(
                            DropDownType.INFO,
                            t.labels.PBNA_MOBILE_SCHEDULE_IS_CANCELING,
                            t.labels.PBNA_MOBILE_SCHEDULE_IS_HANDLING_BY_OTHERS
                        )
                    }
                    storeClassLog(Log.MOBILE_ERROR, 'AddAVisit.addMultiVisits', ErrorUtils.error2String(err))
                })
        } catch (err) {
            setIsLoading(false)
            setShowSuccessModal(false)
            storeClassLog(Log.MOBILE_ERROR, 'AddAVisit.onAddVisit', ErrorUtils.error2String(err))
        }
    }
    const onPressSave = () => {
        onAddVisit()
    }
    const tempDateFun = () => {
        const locale: 'en' | 'fr' = CommonParam.locale as any
        const splitStr = ` ${HourAbbreviationLocale[locale]} `
        return `${durationTimeStr.replace(':', splitStr)} ${MinuteAbbreviationLocale[locale]}`
    }
    const openDurationTime = () => {
        const dateArr = durationTimeStr.split(':')
        setSelectedHour(dateArr[0])
        setSelectedMinutes(dateArr[1])
        setShowModalVisible(true)
    }
    const changePickerModal = () => {
        setDurationTimeStr(`${selectedHour}:${selectedMinutes}`)
        const hours = parseInt(selectedHour || '0')
        const minutes = parseInt(selectedMinutes || '0')
        setDurationTime(hours * 60 + minutes)
        setShowModalVisible(false)
    }
    const getLocationTimeList = () => {
        return [
            {
                type: 'hour',
                selectedVal: selectedHour,
                updateSelectedVal: setSelectedHour,
                optionsList: _.range(0, 24, 1).map((val) => {
                    return val < 10 ? '0' + val : val.toString()
                })
            },
            {
                type: 'minutes',
                selectedVal: selectedMinutes,
                updateSelectedVal: setSelectedMinutes,
                optionsList: _.range(0, 60, 1).map((val) => {
                    return val < 10 ? '0' + val : val.toString()
                })
            }
        ]
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView>
                <View style={styles.content}>
                    <View style={[commonStyle.alignCenter, styles.bottomLine]}>
                        <CText style={styles.headerText}>
                            {_.toUpper(t.labels.PBNA_MOBILE_CDA_EXPORTS_NEXT_STEPS)}
                        </CText>
                    </View>
                    <View style={commonStyle.alignCenter}>
                        <CText style={styles.headerText1}>{t.labels.PBNA_MOBILE_CREATE_RESET_VISIT}</CText>
                    </View>
                    <View style={[styles.successView, commonStyle.flexRowCenter]}>
                        <Image
                            source={require('../../../../../../assets/image/icon-success.png')}
                            style={[styles.successImage]}
                        />
                        <CText style={styles.successText}>{t.labels.PBNA_MOBILE_SUCCESS_TIPS}</CText>
                    </View>
                    <View style={styles.commonView}>
                        <CText style={styles.commonLabel}>{t.labels.PBNA_MOBILE_CUSTOMER_STORE_NAME}</CText>
                        <CText style={styles.commonText}>{accountName}</CText>
                    </View>
                    <View style={[commonStyle.flexRowCenter]}>
                        <View style={{ flex: 1 }}>
                            <DatePickerLegacy
                                fieldLabel={t.labels.PBNA_MOBILE_REQUESTED_RESET_DATE}
                                value={plannedDate}
                                onChange={(v: Date) => {
                                    if (v) {
                                        const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                        setPlannedDate(date)
                                    }
                                }}
                                deferred
                                titleHorizontal
                            />
                        </View>
                    </View>
                    <View style={[commonStyle.flexRowCenter, styles.bottomLine, styles.commonView1]}>
                        <CText style={styles.commonLabel1}>{t.labels.PBNA_MOBILE_ESTIMATED_DURATION_LABEL}</CText>
                        <View>
                            <TouchableOpacity onPress={openDurationTime} style={styles.timePickerContainer}>
                                <CText style={[styles.inputStyle, styles.lookUpStyle]}>{tempDateFun()}</CText>
                                <View style={{ right: 0 }}>
                                    <Image source={ImageSrc.IMG_CLOCK_BLUE} style={styles.clockStyle} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.commonView]}>
                        <View style={styles.bottomLine}>
                            <CText style={styles.commonLabel}>
                                {t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS_OPTIONAL}
                            </CText>
                            <TextInput
                                editable
                                multiline
                                numberOfLines={4}
                                value={instructionText}
                                onChangeText={(text: string) => {
                                    setInstructionText(text)
                                }}
                                style={[styles.commonText, styles.commonTextInput]}
                            />
                        </View>
                        {instructionText.length > 1000 && (
                            <CText style={styles.errorStyle}>
                                {`${t.labels.PBNA_MOBILE_STRING_LENGTH_CONNOT_EXCEED} 1000`}
                            </CText>
                        )}
                    </View>
                    <View style={styles.takePictureView}>
                        <TouchableOpacity style={styles.takePictureTouchableStyle}>
                            <Image source={ImageSrc.IMG_CAMERA1} style={styles.takePictureIcon} />
                            <CText style={[styles.takePictureLabel, styles.takePictureLabelBold]}>
                                {t.labels.PBNA_MOBILE_TAKE_A_PICTURE}
                            </CText>
                            <CText style={styles.takePictureLabel}>{t.labels.PBNA_MOBILE_OPTIONAL}</CText>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={[styles.agreementCheckBox, agreementCheck && styles.agreementChecked]}
                            disabled={!base64String}
                            onPress={() => handleAgreementCheck(!agreementCheck)}
                        >
                            <View
                                style={[
                                    styles.agreementCheckBoxIconView,
                                    styles.agreementCheckBoxActive,
                                    agreementCheck && styles.agreementCheckBoxChecked
                                ]}
                            >
                                {agreementCheck ? (
                                    <IconTick style={styles.agreementCheckBoxIcon} fill={'#fff'} />
                                ) : null}
                            </View>
                            <CText style={{ width: 320 }}>
                                {t.labels.PBNA_MOBILE_INCLUDE_PROPOSED_PLANOGRAM_IN_THE_RESET_VISIT}
                            </CText>
                            {loadingDecline && <ActivityIndicator style={commonStyle.marginLeft5} />}
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    style={[commonStyle.flexRowCenter, styles.attachedView]}
                    disabled={!agreementCheck || loadingDecline}
                    onPress={() => openPDFFile(base64String, navigation)}
                >
                    <Image source={ImageSrc.IMG_FILE} style={styles.attachedIcon} />
                    <CText style={agreementCheck && !loadingDecline ? styles.attachedLabel : styles.attachedLabelGray}>
                        {t.labels.PBNA_MOBILE_ATTACHED_CUSTOMER_CDA_PLANOGRAM}
                    </CText>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
            <View>
                {isLoading && <LinearProgress color="#7CFC00" />}
                <FormBottomButton
                    onPressCancel={_.debounce(onPressCancel, IntervalTime.ONE_THOUSAND, {
                        leading: true,
                        trailing: false
                    })}
                    disableSave={
                        isLoading ||
                        durationTime === 0 ||
                        instructionText.length > 1000 ||
                        showSuccessModal ||
                        isOfflineModalTmp
                    }
                    disableCancel={isLoading || showSuccessModal}
                    onPressSave={_.debounce(onPressSave, IntervalTime.ONE_THOUSAND, { leading: true, trailing: false })}
                    rightButtonLabel={t.labels.PBNA_MOBILE_CREATE_VISIT}
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                    relative
                />
            </View>
            <CDASuccessModal
                modalVisible={showSuccessModal}
                message={t.labels.PBNA_MOBILE_RESET_VISIT_CREATED_SUCCESSFULLY}
            />
            <PickerModal
                modalVisible={showModalVisible}
                onDoneClick={changePickerModal}
                onOutsideClick={() => {
                    setShowModalVisible(false)
                }}
                modalTitle={t.labels.PBNA_MOBILE_ESTIMATED_DURATION_LABEL}
                locationTimeList={getLocationTimeList()}
                isLocationTime
            />
        </SafeAreaView>
    )
}

export default ResetVisitScreen
