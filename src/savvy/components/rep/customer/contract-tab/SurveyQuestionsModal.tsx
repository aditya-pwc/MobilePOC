import React, { Dispatch, FC, useEffect, useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, View, Image, Alert, Switch } from 'react-native'
import { CheckBox, Input } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import { equipmentModalStyle } from '../equipment-tab/InstallRequestModal'
import InfoSvg from '../../../../../../assets/image/tips.svg'
import Tooltip from 'react-native-walkthrough-tooltip'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { useDispatch, useSelector } from 'react-redux'
import {
    setSurveyQuestions,
    setSurveyQuestionsModalVisible,
    setActiveStep,
    setTimeErrMsg,
    setOriginRetailVisitKpi,
    setVisitId,
    setNextStepsActiveStep,
    setExecutionData,
    setEvaluationReferenceData,
    setTierData,
    setEstimatedData,
    setEnabledRewards,
    setAssessmentTask,
    setVisitKpiIsGenerating,
    setAgreementCheck,
    setPOGBase64
} from '../../../../redux/action/ContractAction'
import _ from 'lodash'
import {
    AccountPaidVal,
    AgreementType,
    AssessmentIndicators,
    ContractBtnType,
    StepVal,
    IntervalTime,
    IntEnum,
    BooleanEnum,
    VisitSubtypeEnum,
    FORMStatusEnum,
    ContractStatus
} from '../../../../enums/Contract'
import {
    getBackendVisitStatus,
    useDisableSave,
    useEmailAndCDAStaticResource,
    useNextStepsDisableSave,
    usePreloadAgreementPDF,
    usePresentData
} from '../../../../hooks/CustomerContractTabHooks'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import {
    EnabledRewards,
    StoreVolumeSectionData,
    initAssessmentTask,
    initEstimated,
    initEvaluationReferenceData,
    initExecutionData,
    initOriginRetailVisitKpi,
    initSurveyQuestions,
    initTierData
} from '../../../../redux/reducer/ContractReducer'
import {
    handleBackSurveyQuestionsProcess,
    handleSaveDraftContract,
    refreshCustomerDetailData,
    updateRetailVisitKpi,
    getStepTwoKpiParams,
    getStepThreeKpiParams,
    handleBackSurveyQuestionsNextStepsProcess,
    handleSaveSurveyQuestionsProcess,
    inputIntOnChange,
    checkCDATime,
    getSumByVal,
    updateContractSignedMedalTierAndStep,
    handleSendContractEmail
} from '../../../../helper/rep/ContractHelper'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import HeaderOfModal from '../../lead/common/HeaderOfModal'
import {
    CustomerDetailParamProps,
    getPlaceIdAndMissionThenGoToGoSpotCheck,
    handelGeneratePDF,
    uploadToSharePoint
} from '../../../../helper/rep/StartNewCDAHelper'
import { useListenFormUrl, useStartNewCdaInitData, useUpdateLocalFormStatus } from '../../../../hooks/StartNewCDAHooks'
import { restApexCommonCall, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { Log } from '../../../../../common/enums/Log'
import { filterExistFields } from '../../../../utils/SyncUtils'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import NextSteps from './NextSteps'
import Present from './Present'
import IconAlertSolid from '../../../../../../assets/image/icon-alert-solid.svg'
import { CDASuccessModal } from './CDASuccessModal'
import { useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { CommonApi } from '../../../../../common/api/CommonApi'
import StepView from './StepView'
import ContractSpaceReviewPage from './ContractSpaceReviewPage'
import { replaceAccountNameQuotesToWildcard } from '../../../../utils/RepUtils'
import Loading from '../../../../../common/components/Loading'
import { DatePickerLegacy } from '../../../common/DatePicker'
import dayjs from 'dayjs'
import { useMissionId } from '../../../../hooks/AuditHooks'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { getResetVisitData, updateContractStepFour } from '../../../../helper/rep/ContractAndAuditHelper'
import { isPersonaSDLOrPsrOrMDOrKAM } from '../../../../../common/enums/Persona'
import { HttpStatusCode } from 'axios'
import { sendEmailWithPdfAttachment } from '../../../../utils/PdfUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { VisitStatus } from '../../../../enums/Visit'

// The distance to the left is the screen width *  percentage of styles.stepView (0.34)
const transformLength = -180
export const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE

export const styles = StyleSheet.create({
    ...equipmentModalStyle,
    ...SurveyQuestionsStyle,
    mainAlertIcon: {
        marginRight: 7
    },
    mainAlertTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 5,
        marginHorizontal: 22
    },
    alertText: {
        color: '#ea455b',
        textAlign: 'left',
        fontSize: 14
    }
})

interface SurveyQuestionsModalProps {
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
}

export type FormStatus = FORMStatusEnum.START | FORMStatusEnum.PENDING | FORMStatusEnum.COMPLETE

interface SurveyFormBottomButtonProps {
    dispatch: any
    activeStep: string
    disable: any
    loading: any
    handlePressSaveSurveyQuestionsProcess: any
}
interface StepFourFormBottomButtonProps {
    dispatch: Dispatch<any>
    loading: boolean
    nextStepsActiveStep: string
    nextStepDisable: boolean
    onPressSave: (...args: any) => any
}

const AccountPaidSection = () => {
    const dispatch = useDispatch()
    const surveyQuestions = useSelector((state: any) => state.contractReducer.surveyQuestions)
    const timeErrMsg = useSelector((state: any) => state.contractReducer.timeErrMsg)

    return (
        <>
            <View style={styles.accountPaidSectionContainer}>
                <View style={styles.redStartBox}>
                    <CText style={styles.subTitle}>{t.labels.PBNA_MOBILE_ACCOUNT_PAID}</CText>
                    <CText style={styles.redStar}>*</CText>
                </View>

                <View style={styles.checkBoxContainer}>
                    <CheckBox
                        title={t.labels.PBNA_MOBILE_ON_TICKET}
                        onPress={() => {
                            dispatch(
                                setSurveyQuestions({
                                    ...surveyQuestions,
                                    ...{ Account_Paid__c: AccountPaidVal.ON_TICKET }
                                })
                            )
                        }}
                        disabled={false}
                        checked={surveyQuestions.Account_Paid__c === AccountPaidVal.ON_TICKET}
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={<View style={styles.uncheckCircleView} />}
                        containerStyle={[styles.radioContainer]}
                        textStyle={[styles.radioLabelText]}
                    />
                    <CheckBox
                        title={t.labels.PBNA_MOBILE_OFF_TICKET}
                        onPress={() => {
                            dispatch(
                                setSurveyQuestions({
                                    ...surveyQuestions,
                                    ...{ Account_Paid__c: AccountPaidVal.OFF_TICKET }
                                })
                            )
                        }}
                        disabled={false}
                        checked={surveyQuestions.Account_Paid__c === AccountPaidVal.OFF_TICKET}
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={<View style={styles.uncheckCircleView} />}
                        containerStyle={[styles.radioContainer]}
                        textStyle={[styles.radioLabelText]}
                    />
                </View>
            </View>

            <View style={[styles.timeContainer]}>
                {!!timeErrMsg && (
                    <View style={styles.errorView}>
                        <CText style={styles.errorStyle}>{timeErrMsg}</CText>
                    </View>
                )}

                <View style={styles.startTime}>
                    <View style={{ flex: 1 }}>
                        <DatePickerLegacy
                            require
                            fieldLabel={t.labels.PBNA_MOBILE_START_DATE}
                            value={surveyQuestions.StartDate ? surveyQuestions.StartDate : ''}
                            onChange={(v: Date) => {
                                if (v) {
                                    const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                    dispatch(
                                        setSurveyQuestions({
                                            ...surveyQuestions,
                                            StartDate: date
                                        })
                                    )
                                    checkCDATime(date, surveyQuestions.EndDate, dispatch)
                                }
                            }}
                            deferred
                        />
                    </View>
                </View>

                <View style={styles.startTime}>
                    <View style={{ flex: 1 }}>
                        <DatePickerLegacy
                            require
                            fieldLabel={t.labels.PBNA_MOBILE_END_DATE}
                            value={surveyQuestions.EndDate ? surveyQuestions.EndDate : ''}
                            onChange={(v: Date) => {
                                if (v) {
                                    const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)

                                    dispatch(
                                        setSurveyQuestions({
                                            ...surveyQuestions,
                                            EndDate: date
                                        })
                                    )

                                    checkCDATime(surveyQuestions.StartDate, date, dispatch)
                                }
                            }}
                            deferred
                        />
                    </View>
                </View>
            </View>
        </>
    )
}
const updateStoreVolumeData = (
    surveyQuestions: typeof initSurveyQuestions,
    StoreVolumeData: StoreVolumeSectionData[],
    isTruckVolume: boolean,
    isRevert = false,
    subType = BooleanEnum.TRUE
) => {
    //  Checks the duplicate in the array that the user just filled in
    const arrayContainingSameTitle = surveyQuestions.StoreVolumeData
    const svsDataObjs: any[] = surveyQuestions.retailVisitKpiObj.ActualLongStringValue__c
        ? JSON.parse(surveyQuestions.retailVisitKpiObj.ActualLongStringValue__c)
        : []
    const totalItem = StoreVolumeData[0]
    const lastStoreVolumeData = StoreVolumeData.filter((elem) => elem.id !== t.labels.PBNA_MOBILE_TOTAL)
    lastStoreVolumeData.forEach((elem) => {
        const stnItem = svsDataObjs.find((sdoElem) => sdoElem.P === elem.title && sdoElem.M === subType)
        const isEmptyStnItem = _.isEmpty(stnItem)
        const isSameTitleObj = arrayContainingSameTitle.find(
            (item) => item.title.toLocaleUpperCase() === elem.title.toLocaleUpperCase()
        )
        // projVolGrowth will not be affected by isRevert and isTruckVolume
        if (isSameTitleObj) {
            elem.projVolGrowth = isSameTitleObj.projVolGrowth
        }

        if (isRevert) {
            /**
             * ContractHelper handleStoreVolumeData with notes
             */
            elem.useVol = !isEmptyStnItem && isTruckVolume ? stnItem.A || '' : ''
        } else {
            if (isTruckVolume) {
                elem.useVol = !isEmptyStnItem ? stnItem.A || '' : ''
            } else {
                const userVol = !isEmptyStnItem ? stnItem.U || '' : ''
                if (isSameTitleObj && isSameTitleObj.useVol !== isSameTitleObj.wksVol) {
                    elem.useVol = isSameTitleObj.useVol
                } else {
                    elem.useVol = elem.useVol !== elem.wksVol ? elem.useVol : userVol
                }
            }
        }
        elem.projVol = Math.round(
            (parseFloat(elem.useVol || '0') * (IntervalTime.ONE_HUNDRED + parseFloat(elem.projVolGrowth || '0'))) /
                IntervalTime.ONE_HUNDRED
        ).toString()
    })
    totalItem.useVol = getSumByVal(lastStoreVolumeData, 'useVol')
    totalItem.projVol = getSumByVal(lastStoreVolumeData, '', (elem: any) => {
        return (
            (parseFloat(elem.useVol || '0') * (IntervalTime.ONE_HUNDRED + parseFloat(elem.projVolGrowth || '0'))) /
            IntervalTime.ONE_HUNDRED
        )
    })
    const projVolGrowth =
        (parseFloat(totalItem.projVol) - parseFloat(totalItem.useVol)) / (parseFloat(totalItem.useVol) || 1)
    totalItem.projVolGrowth = Math.round(projVolGrowth * IntervalTime.ONE_HUNDRED).toString()
    StoreVolumeData[0] = totalItem
    const obj: any = { StoreVolumeData: StoreVolumeData }
    if (!isRevert) {
        obj.isTruckVolume = isTruckVolume
    }
    return obj
}
const AgreementTypeSection = () => {
    const dispatch = useDispatch()
    const surveyQuestions = useSelector((state: any) => state.contractReducer.surveyQuestions)

    return (
        <View style={styles.agreementTypeContainer}>
            <View style={styles.redStartBox}>
                <CText style={styles.subTitle}>{t.labels.PBNA_MOBILE_AGREEMENT_TYPE}</CText>
                <CText style={styles.redStar}>*</CText>
            </View>

            <View style={commonStyle.flexDirectionColumn}>
                <CheckBox
                    title={t.labels.PBNA_MOBILE_MEDAL_CONTRACT}
                    onPress={() => {
                        const obj =
                            surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT
                                ? updateStoreVolumeData(
                                      surveyQuestions,
                                      _.cloneDeep(surveyQuestions.medalStoreVolumeData),
                                      surveyQuestions.isTruckVolume,
                                      false,
                                      BooleanEnum.TRUE
                                  )
                                : {}
                        dispatch(
                            setSurveyQuestions({
                                ...surveyQuestions,
                                ...{ Agreement_Type__c: AgreementType.MEDAL_CONTRACT },
                                ...obj
                            })
                        )
                    }}
                    disabled={_.isEmpty(surveyQuestions.medalStoreVolumeData)}
                    checked={surveyQuestions.Agreement_Type__c === AgreementType.MEDAL_CONTRACT}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<View style={styles.uncheckCircleView} />}
                    containerStyle={[styles.radioContainer]}
                    textStyle={[styles.radioLabelText]}
                />
                <CheckBox
                    title={t.labels.PBNA_MOBILE_BASIC_WHITE}
                    onPress={() => {
                        const obj =
                            surveyQuestions.Agreement_Type__c !== AgreementType.BASIC_WHITE_SPACE_CONTRACT
                                ? updateStoreVolumeData(
                                      surveyQuestions,
                                      _.cloneDeep(surveyQuestions.basicStoreVolumeData),
                                      surveyQuestions.isTruckVolume,
                                      false,
                                      BooleanEnum.FALSE
                                  )
                                : {}
                        dispatch(
                            setSurveyQuestions({
                                ...surveyQuestions,
                                ...{ Agreement_Type__c: AgreementType.BASIC_WHITE_SPACE_CONTRACT },
                                ...obj
                            })
                        )
                    }}
                    disabled={_.isEmpty(surveyQuestions.basicStoreVolumeData)}
                    checked={surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<View style={styles.uncheckCircleView} />}
                    containerStyle={[styles.radioContainer]}
                    textStyle={[styles.radioLabelText]}
                />
            </View>
        </View>
    )
}

const TableRow = ({ item, onChange }: { item: StoreVolumeSectionData; onChange: Function }) => {
    const isTotal = item.id === t.labels.PBNA_MOBILE_TOTAL
    let inputTotalStyle = styles.tableRowInput
    if (isTotal) {
        inputTotalStyle = styles.tableRowDisabledInput
    } else if (item.useVol && item.useVol !== item.wksVol) {
        inputTotalStyle = styles.tableRowYellowInput
    }
    return (
        <View style={[styles.tableRowView, { borderBottomColor: item.showBottomBorder ? '#fff' : '#F2F4F7' }]}>
            <View style={styles.tableRowTitleView}>
                <CText style={styles.tableRowTitleText}>{item.title}</CText>
            </View>

            <View style={styles.tableRowInputContainer}>
                <Input
                    disabled={isTotal}
                    containerStyle={inputTotalStyle}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={styles.borderBottomColor0}
                    keyboardType="number-pad"
                    inputStyle={styles.tableRowInputStyle}
                    value={item.useVol}
                    onChangeText={(text) => {
                        const tmpVal = inputIntOnChange(text, '', IntEnum.NINE_HUNDRED_AND_NINETY_NINE, '')
                        onChange(item.id, 'useVol', tmpVal)
                    }}
                />

                <Input
                    disabled={isTotal}
                    containerStyle={isTotal ? styles.tableRowDisabledInput : styles.tableRowInput}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={styles.borderBottomColor0}
                    keyboardType="number-pad"
                    inputStyle={styles.tableRowInputStyle}
                    value={item.projVolGrowth}
                    onChangeText={(text) => {
                        const tmpVal = inputIntOnChange(text, '', IntEnum.ONE_HUNDRED, '')
                        onChange(item.id, 'projVolGrowth', tmpVal)
                    }}
                />

                <Input
                    disabled
                    containerStyle={styles.tableRowDisabledInput}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    maxLength={4}
                    inputContainerStyle={styles.borderBottomColor0}
                    keyboardType="number-pad"
                    inputStyle={styles.tableRowInputStyle}
                    value={item.projVol}
                />
            </View>
        </View>
    )
}

const TableRowHeader = ({ children }: { children: string }) => {
    return (
        <View style={styles.tableRowHeaderView}>
            <CText style={styles.tableRowHeaderText}>{children} </CText>
        </View>
    )
}

const StoreVolumeSection = () => {
    const ImageRevert = ImageSrc.REVERT
    const [toolTipOpen, setToolTipOpen] = useState(false)
    const dispatch = useDispatch()
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const updateSVSChange = (id: string, key: string, val: string) => {
        const StoreVolumeData = surveyQuestions.StoreVolumeData
        const totalItem = StoreVolumeData[0]
        const idx = StoreVolumeData.findIndex((elem) => elem.id === id)
        const updateItem: any = StoreVolumeData[idx]
        updateItem[key] = val
        updateItem.projVol = Math.round(
            (parseFloat(updateItem.useVol || '0') *
                (IntervalTime.ONE_HUNDRED + parseFloat(updateItem.projVolGrowth || '0'))) /
                IntervalTime.ONE_HUNDRED
        ).toString()
        StoreVolumeData[idx] = updateItem
        const lastStoreVolumeData = StoreVolumeData.filter((elem) => elem.id !== t.labels.PBNA_MOBILE_TOTAL)
        totalItem.useVol = getSumByVal(lastStoreVolumeData, 'useVol')
        totalItem.projVol = getSumByVal(lastStoreVolumeData, '', (elem: any) => {
            return (
                (parseFloat(elem.useVol || '0') * (IntervalTime.ONE_HUNDRED + parseFloat(elem.projVolGrowth || '0'))) /
                IntervalTime.ONE_HUNDRED
            )
        })
        const projVolGrowth =
            (parseFloat(totalItem.projVol) - parseFloat(totalItem.useVol)) / (parseFloat(totalItem.useVol) || 1)
        totalItem.projVolGrowth = Math.round(projVolGrowth * IntervalTime.ONE_HUNDRED).toString()
        StoreVolumeData[0] = totalItem
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                StoreVolumeData: StoreVolumeData
            })
        )
    }
    const commonUpdateStoreVolumeData = (isTruckVolume: boolean, isRevert = false) => {
        const subType =
            surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT
                ? BooleanEnum.FALSE
                : BooleanEnum.TRUE
        const obj = updateStoreVolumeData(
            surveyQuestions,
            surveyQuestions.StoreVolumeData,
            isTruckVolume,
            isRevert,
            subType
        )
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                ...obj
            })
        )
    }
    const onChangeTruckVolume = () => {
        const isTruckVolume = !surveyQuestions.isTruckVolume
        commonUpdateStoreVolumeData(isTruckVolume)
    }
    const onChangeRevert = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_REVERT_CHANGES,
            surveyQuestions.isTruckVolume ? t.labels.PBNA_MOBILE_REVERT_MESSAGE : t.labels.PBNA_MOBILE_CLEAR_MESSAGE,
            [
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                    onPress: () => {}
                },
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_REVERT)}`,
                    onPress: () => {
                        const isTruckVolume = surveyQuestions.isTruckVolume
                        commonUpdateStoreVolumeData(isTruckVolume, true)
                    }
                }
            ]
        )
    }
    return (
        <>
            <View style={styles.storeVolumeView}>
                <CText style={styles.storeVolumeText}>{t.labels.PBNA_MOBILE_TRUCK_VOLUME}</CText>
                <Tooltip
                    content={<CText>{t.labels.PBNA_MOBILE_ROLLING_VOLUME}</CText>}
                    placement={'top'}
                    isVisible={toolTipOpen}
                    onClose={() => {
                        setToolTipOpen(false)
                    }}
                    backgroundStyle={commonStyle.bgWhite}
                    backgroundColor={'rgba(0,0,0,0)'}
                    tooltipStyle={styles.storeVolumeTipsContainer}
                >
                    <TouchableOpacity
                        onPress={() => {
                            setToolTipOpen(true)
                        }}
                        hitSlop={commonStyle.hitSlop15}
                    >
                        <InfoSvg style={styles.storeVolumeTips} />
                    </TouchableOpacity>
                </Tooltip>
            </View>
            <View style={styles.storeVolumeContainer}>
                <CText style={styles.pullVolumeText}>{t.labels.PBNA_MOBILE_PULL_IN_VOLUME_DATA}</CText>
                <Switch
                    value={surveyQuestions.isTruckVolume}
                    onValueChange={onChangeTruckVolume}
                    disabled={_.isEmpty(surveyQuestions.StoreVolumeData)}
                    ios_backgroundColor={surveyQuestions.isTruckVolume ? '#2DD36F' : '#dddddd'}
                />
            </View>
            {surveyQuestions.isTruckVolume && surveyQuestions.isTruckVolumeError && (
                <View style={styles.mainAlertTextContainer}>
                    <>
                        <IconAlertSolid width="15" height="15" style={styles.mainAlertIcon} />
                        <CText style={styles.alertText}>{t.labels.PBNA_MOBILE_TRUCK_VOLUME_ERROR}</CText>
                    </>
                </View>
            )}
            <View style={styles.tableContainer}>
                <View style={[styles.revertContainer]}>
                    <TouchableOpacity
                        onPress={_.debounce(onChangeRevert, IntervalTime.FIVE_HUNDRED)}
                        style={styles.tableHeaderContainer}
                    >
                        <Image source={ImageRevert} style={styles.tableHeaderImage} />
                        <CText style={styles.revertText}>{t.labels.PBNA_MOBILE_REVERT.toLocaleUpperCase()}</CText>
                    </TouchableOpacity>

                    <View style={styles.tableRowHeaderContainer}>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_WKS_VOL}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_PROJ_VOL}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_PROJ_VOLUME}</TableRowHeader>
                    </View>
                </View>
                <View style={styles.tableView}>
                    {surveyQuestions.StoreVolumeData.map((item) => {
                        return <TableRow key={item.id} item={item} onChange={updateSVSChange} />
                    })}
                </View>
            </View>
        </>
    )
}

const GeneralInfoPage = () => {
    return (
        <View>
            <CText style={styles.generalText}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
            <AccountPaidSection />
            <AgreementTypeSection />
            <StoreVolumeSection />
        </View>
    )
}

// Fixed circular references to ESLINT
export const alertManuallyFill = (
    customerDetail: CustomerDetailParamProps,
    visitId: string,
    missionId: string,
    GSCId: string,
    isRealogram: boolean,
    existingMobileUniqueId: string
) => {
    Alert.alert(
        '',
        isRealogram ? t.labels.PBNA_MOBILE_REALOGRAM_FORM_ERROR_MESSAGE : t.labels.PBNA_MOBILE_FORM_ERROR_MESSAGE,
        [
            {
                text: t.labels.PBNA_MOBILE_CONTINUE,
                onPress: () => {}
            },
            {
                text: t.labels.PBNA_MOBILE_RETRY,
                onPress: () => {
                    getPlaceIdAndMissionThenGoToGoSpotCheck(
                        customerDetail,
                        visitId,
                        missionId,
                        GSCId,
                        isRealogram,
                        existingMobileUniqueId
                    )
                }
            }
        ]
    )
}

const SurveyFormBottomButton = ({
    dispatch,
    activeStep,
    disable,
    loading,
    handlePressSaveSurveyQuestionsProcess
}: SurveyFormBottomButtonProps) => {
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed
    return (
        <View style={{ marginTop: 20 }}>
            <FormBottomButton
                onPressCancel={() => {
                    handleBackSurveyQuestionsProcess(dispatch, activeStep)
                }}
                disableSave={disable || loading}
                disableCancel={activeStep === StepVal.ONE || (activeStep === StepVal.THREE && isDisabled)}
                onPressSave={_.debounce(handlePressSaveSurveyQuestionsProcess, IntervalTime.FIVE_HUNDRED)}
                rightButtonLabel={t.labels.PBNA_MOBILE_SAVE_PROCEED.toLocaleLowerCase()}
                leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toLocaleUpperCase()}
                relative
            />
        </View>
    )
}
const StepFourFormBottomButton = ({
    dispatch,
    loading,
    nextStepsActiveStep,
    nextStepDisable,
    onPressSave
}: StepFourFormBottomButtonProps) => {
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    return (
        <View style={{ marginTop: 20 }}>
            <FormBottomButton
                onPressCancel={() => {
                    handleBackSurveyQuestionsNextStepsProcess(dispatch, nextStepsActiveStep)
                }}
                disableSave={
                    loading || nextStepDisable || !(surveyQuestions.CustomerSignature && surveyQuestions.RepSignature)
                }
                disableCancel={loading}
                onPressSave={_.debounce(onPressSave, IntervalTime.ONE_THOUSAND)}
                rightButtonLabel={t.labels.PBNA_MOBILE_SUBMIT_CDA.toLocaleLowerCase()}
                leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toLocaleUpperCase()}
                relative
            />
        </View>
    )
}

const handleOfflineCDAContract = async (offlineContractParams: {
    pdfBase64: string
    sharepointUrl: string
    assessmentTask: typeof initAssessmentTask
    surveyQuestions: typeof initSurveyQuestions
    checkedYear: string
    customerDetail: any
    visitId: string
    CustomerSignedDate: string
    CompanySignedDate: string
}) => {
    try {
        const { surveyQuestions, customerDetail } = offlineContractParams
        const json = await AsyncStorage.getItem('NewCDAPendingUploads')
        const jobs = json ? JSON.parse(json) : {}
        // Collect the contract ID to be uploaded,surveyQuestions.Id is contractId, customerDetail.Id is account Id
        Object.assign(jobs, { [`${surveyQuestions.Id}`]: `${customerDetail.AccountId}` })
        const newCDAPendingUploadsList: [string, string] = ['NewCDAPendingUploads', JSON.stringify(jobs)]
        const contractData: [string, string] = [
            'PendingUploadCDA' + surveyQuestions.Id,
            JSON.stringify(offlineContractParams)
        ]
        await AsyncStorage.multiSet([newCDAPendingUploadsList, contractData])
        return true
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `handleOfflineCDAContract`,
            `Submit offline CDA failure ${ErrorUtils.error2String(error)}`
        )
        return false
    }
}

const SurveyQuestionsModal: FC<SurveyQuestionsModalProps> = (props: SurveyQuestionsModalProps) => {
    const dispatch = useDispatch()
    const navigation: NavigationProp<any> = useNavigation()
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const sharepointToken = useSharePointToken(true)
    const assessmentTask: typeof initAssessmentTask = useSelector((state: any) => state.contractReducer.assessmentTask)
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const activeStep = useSelector((state: any) => state.contractReducer.activeStep) as string
    const nextStepsActiveStep = useSelector((state: any) => state.contractReducer.nextStepsActiveStep) as string
    const buttonClicked = useSelector((state: any) => state.contractReducer.buttonClicked)
    const visitId = useSelector((state: any) => state.contractReducer.visitId)
    const contractId = surveyQuestions.Id
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const executionData = useSelector((state: any) => state.contractReducer.executionData)
    const enabledRewards = useSelector((state: any) => state.contractReducer.enabledRewards)
    const pepsicoCalendar = useSelector((state: any) => state.contractReducer.pepsicoCalendar)
    const evaluationReferenceData = useSelector((state: any) => state.contractReducer.evaluationReferenceData)
    const estimatedData = useSelector((state: any) => state.contractReducer.estimatedData)
    const locationId = customerDetail['Account.LOC_PROD_ID__c']
    const POGBase64 = useSelector((state: any) => state.contractReducer.POGBase64)
    const contractReducer = (state: any) => state.contractReducer
    const contract = useSelector(contractReducer)
    const needUpdateFormStatus = contract.needUpdateFormStatus
    const agreementCheck = useSelector((state: any) => state.contractReducer.agreementCheck)
    const [originAgreementType, setOriginAgreementType] = useState(surveyQuestions.Agreement_Type__c)

    usePreloadAgreementPDF(customerDetail.Country, checkedYear || surveyQuestions.CDA_Year__c)

    const { emailAddress, staticResourceBase64Obj } = useEmailAndCDAStaticResource(
        customerDetail.Country,
        checkedYear || surveyQuestions.CDA_Year__c,
        visitId
    )

    const retailOriginVisitKpi = useSelector(
        (state: any) => state.contractReducer.retailOriginVisitKpi
    ) as typeof initOriginRetailVisitKpi
    const [formStatus, setFormStatus] = useState<FormStatus>(FORMStatusEnum.START)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const { dropDownRef } = useDropDown()
    const [loading, setLoading] = useState(false)
    const [backBtnLoading, setBackBtnLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { setRefreshFlag } = props
    const isSignedContract = surveyQuestions.Contract_Status__c === ContractStatus.Signed

    const resetSurveyDataAndRefreshContractTab = () => {
        dispatch(setSurveyQuestions(initSurveyQuestions))
        dispatch(setActiveStep(StepVal.ZERO))
        dispatch(setNextStepsActiveStep(StepVal.ONE))
        refreshCustomerDetailData(setRefreshFlag, customerDetail)
        dispatch(setSurveyQuestionsModalVisible(false))
        dispatch(setTimeErrMsg(''))
        dispatch(setOriginRetailVisitKpi(initOriginRetailVisitKpi))
        dispatch(setVisitId(''))
        dispatch(setExecutionData(initExecutionData))
        dispatch(setEvaluationReferenceData(initEvaluationReferenceData))
        dispatch(setTierData(initTierData))
        dispatch(setEstimatedData(initEstimated))
        dispatch(setEnabledRewards(EnabledRewards))
        dispatch(setAssessmentTask(initAssessmentTask))
        dispatch(setVisitKpiIsGenerating(false))
        dispatch(setOriginRetailVisitKpi(retailOriginVisitKpi))
        dispatch(setAgreementCheck(true))
        dispatch(setPOGBase64(''))

        setTimeout(() => {
            dispatch(setSurveyQuestionsModalVisible(false))
        }, IntervalTime.ONE_THOUSAND)
    }

    const updateContractStepTwo = async (toNextStep: boolean, ifShowLocationGroup: boolean | undefined) => {
        const syncUpUpdateFields = ['Id', 'Draft_Survey_Step__c', 'CDA_Space_Checkbox__c']
        !surveyQuestions.Signed_Medal_Tier__c && syncUpUpdateFields.push('Signed_Medal_Tier__c')

        try {
            const tempContractObj = {
                ...surveyQuestions,
                Draft_Survey_Step__c: toNextStep ? StepVal.TWO : StepVal.ONE,
                CDA_Space_Checkbox__c: ifShowLocationGroup ?? surveyQuestions.CDA_Space_Checkbox__c
            }
            await syncUpObjUpdateFromMem(
                'Contract',
                filterExistFields('Contract', [tempContractObj], syncUpUpdateFields)
            )
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'HandleSave',
                `Customer update contract Draft_Survey_Step__c failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }

    const checkStepTwo = () => {
        return !(
            surveyQuestions[AssessmentIndicators.DOOR_SURVEY] &&
            surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES] &&
            surveyQuestions[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]
        )
    }

    const { nextStepDisable } = useNextStepsDisableSave(nextStepsActiveStep)
    const [visitStatus, setVisitStatus] = useState(VisitStatus.IN_PROGRESS)
    useEffect(() => {
        getBackendVisitStatus(visitId, setVisitStatus)
    }, [])
    useListenFormUrl(setFormStatus)

    useUpdateLocalFormStatus(formStatus, needUpdateFormStatus, setFormStatus)

    const { isPerimeter, ifShowLocationGroup } = useStartNewCdaInitData({
        visitId,
        setFormStatus,
        dispatch,
        surveyQuestions,
        customerDetail,
        checkedYear,
        dropDownRef,
        pepsicoCalendar,
        buttonClicked,
        setIsLoading
    })

    const goBack = async () => {
        if (backBtnLoading || loading) {
            return
        }
        Alert.alert(
            t.labels.PBNA_MOBILE_EXIT_CDA,
            t.labels.PBNA_MOBILE_EXIT_CHANGES_CDA_MESSAGE,
            isSignedContract
                ? [
                      {
                          text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                          onPress: () => {
                              setBackBtnLoading(false)
                              resetSurveyDataAndRefreshContractTab()
                          }
                      },
                      {
                          text: `${_.capitalize(t.labels.PBNA_MOBILE_CANCEL)}`
                      }
                  ]
                : [
                      {
                          text: `${_.capitalize(t.labels.PBNA_MOBILE_SAVE)}`,
                          onPress: async () => {
                              setBackBtnLoading(true)
                              if (activeStep === StepVal.ONE) {
                                  const isStartDateNull = _.isEmpty(surveyQuestions.StartDate)
                                  if (isStartDateNull) {
                                      dispatch(setTimeErrMsg(t.labels.PBNA_MOBILE_DATE_START_DATE_ERROR_MESSAGE))
                                  } else if (
                                      !dayjs(surveyQuestions.StartDate).isAfter(dayjs(surveyQuestions.EndDate))
                                  ) {
                                      // Set the disableNewButton value to disable to prevent repeated clicking. The refresh method will reset the status later
                                      await handleSaveDraftContract(
                                          customerDetail,
                                          dropDownRef,
                                          checkedYear,
                                          surveyQuestions,
                                          visitId,
                                          originAgreementType,
                                          setOriginAgreementType,
                                          retailOriginVisitKpi
                                      )
                                      resetSurveyDataAndRefreshContractTab()
                                  }
                                  setBackBtnLoading(false)
                              }
                              if (activeStep === StepVal.TWO) {
                                  await updateRetailVisitKpi(getStepTwoKpiParams(surveyQuestions, retailOriginVisitKpi))
                                  if (checkStepTwo() || !surveyQuestions.Signed_Medal_Tier__c) {
                                      await updateContractStepTwo(false, ifShowLocationGroup)
                                  }
                                  resetSurveyDataAndRefreshContractTab()
                                  setBackBtnLoading(false)
                              }
                              if (activeStep === StepVal.THREE) {
                                  if (!surveyQuestions.Signed_Medal_Tier__c) {
                                      await updateContractStepTwo(true, ifShowLocationGroup)
                                  } else {
                                      await updateContractSignedMedalTierAndStep(surveyQuestions, ifShowLocationGroup)
                                  }

                                  await updateRetailVisitKpi(
                                      getStepThreeKpiParams(
                                          surveyQuestions,
                                          retailOriginVisitKpi,
                                          executionData,
                                          enabledRewards
                                      )
                                  )
                                  resetSurveyDataAndRefreshContractTab()
                                  setBackBtnLoading(false)
                              }
                              if (activeStep === StepVal.FOUR) {
                                  await updateContractStepFour({
                                      step: StepVal.FOUR,
                                      isSubmit: false,
                                      Sharepoint_URL__c: '',
                                      surveyQuestions
                                  })
                                  resetSurveyDataAndRefreshContractTab()
                                  setBackBtnLoading(false)
                              }
                          }
                      },
                      {
                          text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                          onPress: () => {
                              resetSurveyDataAndRefreshContractTab()
                          }
                      },
                      {
                          text: `${_.capitalize(t.labels.PBNA_MOBILE_CANCEL)}`
                      }
                  ]
        )
    }

    const { coldVaultData, setTierStatus, autoSelectTier, discountData, rewardsData, shellSheetsData } = usePresentData(
        locationId,
        checkedYear || surveyQuestions.CDA_Year__c,
        dropDownRef,
        surveyQuestions,
        visitId,
        contractId
    )
    const { disable } = useDisableSave(surveyQuestions, activeStep, ifShowLocationGroup, visitStatus)
    const { missionId, GSCId } = useMissionId(VisitSubtypeEnum.CDA_CONTRACT, '', customerDetail)
    const handleNavigateToResetVisit = (contractId: string) => {
        const startDate = surveyQuestions.StartDate
        navigation.navigate('ResetVisitScreen', {
            setRefreshFlag: setRefreshFlag,
            contractId,
            startDate,
            CDAvisitId: visitId,
            agreementCheck
        })
        resetSurveyDataAndRefreshContractTab()
    }

    const handleOnlineSubmit = async (
        base64: string,
        sharepointUrl: string,
        checkedYearTmp: string,
        htmlString: string,
        subjectLine: string
    ) => {
        const uploadToSharePointSuccess = await uploadToSharePoint(sharepointToken, base64, sharepointUrl)
        if (uploadToSharePointSuccess) {
            const success = await updateContractStepFour({
                step: StepVal.FOUR,
                isSubmit: true,
                // eslint-disable-next-line camelcase
                Sharepoint_URL__c: sharepointUrl,
                surveyQuestions,
                assessmentTask,
                checkedYear: checkedYearTmp,
                customerDetail,
                visitId,
                CustomerSignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD),
                CompanySignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD)
            })
            if (success) {
                setShowSuccessModal(true)
                await new Promise((resolve) => setTimeout(resolve, IntervalTime.TWO_THOUSAND))
                setShowSuccessModal(false)
                let contractId = surveyQuestions.Id
                if (surveyQuestions.Contract_Status__c === ContractStatus.Signed) {
                    try {
                        const res = await restApexCommonCall(CommonApi.PBNA_MOBILE_API_REWARDS_PROGRAMS, 'POST', {
                            strContractId: surveyQuestions.Id,
                            strCustomerSignedName: surveyQuestions.CustomerSignedName__c,
                            strCustomerSignedTitle: surveyQuestions.CustomerSignedTitle,
                            strDescription: surveyQuestions.Description,
                            datCustomerSignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD),
                            datCompanySignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD),
                            datStartDate: surveyQuestions.StartDate
                        })
                        if (res.status === HttpStatusCode.Ok) {
                            contractId = res.data
                        }
                    } catch (error) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            `Upload-Rewards-Programs`,
                            `Check Data Fail` + ErrorUtils.error2String(error)
                        )
                    }
                }
                try {
                    const res = await getResetVisitData(contractId || surveyQuestions.Id)
                    if (res.data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                        throw Error(ErrorUtils.error2String(res.data))
                    }
                    const resetVisitId = res.data.compositeResponse[0].body.records[0].CDA_Reset_Visit__c
                    if (resetVisitId === null) {
                        await handleSendContractEmail(
                            htmlString,
                            () => handleNavigateToResetVisit(contractId || surveyQuestions.Id),
                            subjectLine
                        )
                    } else {
                        let mailResponse: any = {}
                        try {
                            mailResponse = await sendEmailWithPdfAttachment(subjectLine, [], htmlString)
                        } catch (e) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'Space-handleSendContractEmail',
                                `Send Contract PDF Email failed: ${getStringValue(e)}`
                            )
                        } finally {
                            const status = mailResponse?.mailRes
                            const validStatuses = ['sent', 'saved', 'cancelled']
                            if (validStatuses.includes(status)) {
                                resetSurveyDataAndRefreshContractTab()
                            } else {
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type={'failed'}>
                                        <PopMessage>{t.labels.PBNA_MOBILE_SEND_EMAIL_FAILED}</PopMessage>
                                    </ProcessDoneModal>,
                                    t.labels.PBNA_MOBILE_OK
                                )
                                setTimeout(() => {
                                    global.$globalModal.closeModal()
                                }, 3000)
                                resetSurveyDataAndRefreshContractTab()
                            }
                        }
                    }
                } catch (error) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        `Get-ResetVisit-Data`,
                        `Check Data Fail` + ErrorUtils.error2String(error)
                    )
                }
            } else {
                Alert.alert(t.labels.PBNA_MOBILE_SUBMIT_CDA_FAIL)
            }
        } else {
            Alert.alert('', t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_FAILED, [
                {
                    text: `${t.labels.PBNA_MOBILE_OK.toLocaleUpperCase()}`
                }
            ])
        }
        setLoading(false)
    }

    const handleOfflineSubmit = async (base64: string, sharepointUrl: string, checkedYearTmp: string) => {
        // Data stored locally
        const contractData = {
            pdfBase64: base64,
            sharepointUrl,
            assessmentTask,
            surveyQuestions,
            checkedYear: checkedYearTmp,
            customerDetail,
            visitId,
            CustomerSignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD),
            CompanySignedDate: dayjs().format(TIME_FORMAT.Y_MM_DD)
        }
        const handleOfflineResult = await handleOfflineCDAContract(contractData)
        setLoading(false)
        if (handleOfflineResult) {
            setRefreshFlag && setRefreshFlag((v: number) => v + 1)
            resetSurveyDataAndRefreshContractTab()
            setBackBtnLoading(false)
        } else {
            Alert.alert('', t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_FAILED, [
                {
                    text: `${t.labels.PBNA_MOBILE_OK.toLocaleUpperCase()}`
                }
            ])
        }
    }

    const handleSubmitCDA: (...args: any) => any = async () => {
        setLoading(true)
        try {
            if (loading) {
                return
            }
            const checkedYearTmp = checkedYear || surveyQuestions.CDA_Year__c
            const subjectLine = `${customerDetail.Name} ${surveyQuestions.Signed_Medal_Tier__c} Medal - ${checkedYearTmp} CDA Contract`
            let contractName = `${customerDetail['Account.CUST_UNIQ_ID_VAL__c'] || ''}_${
                surveyQuestions.Signed_Medal_Tier__c || ''
            }_${dayjs().format(TIME_FORMAT.Y_MM_DD)}_${checkedYearTmp}`
            contractName = replaceAccountNameQuotesToWildcard(contractName, '')
            const sharepointUrl = `${CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API}${CommonApi.PBNA_MOBILE_PDF_FILE_DIRECTORY}${contractName}.pdf:/content`
            const { htmlString, base64 }: { htmlString: string; base64: string } = await handelGeneratePDF({
                subjectLine,
                surveyQuestions,
                customerDetail,
                evaluationReferenceData,
                coldVaultData,
                rewardsData,
                executionData,
                discountData,
                POGBase64,
                agreementCheck,
                emailAddress,
                staticResourceBase64Obj
            })
            if (isPersonaSDLOrPsrOrMDOrKAM()) {
                const state = await NetInfo.fetch()
                if (state.isInternetReachable) {
                    handleOnlineSubmit(base64, sharepointUrl, checkedYearTmp, htmlString, subjectLine)
                } else {
                    handleOfflineSubmit(base64, sharepointUrl, checkedYearTmp)
                }
            } else {
                handleOnlineSubmit(base64, sharepointUrl, checkedYearTmp, htmlString, subjectLine)
            }
        } catch (error) {
            setLoading(false)
            storeClassLog(Log.MOBILE_ERROR, `handleSubmitCDA`, `Submit CDA failure ${ErrorUtils.error2String(error)}`)
        }
    }

    const handlePressSaveSurveyQuestionsProcess = () => {
        handleSaveSurveyQuestionsProcess({
            dispatch,
            customerDetail,
            surveyQuestions,
            dropDownRef,
            checkedYear,
            activeStep,
            setLoading,
            retailOriginVisitKpi,
            visitId,
            executionData,
            enabledRewards,
            coldVaultData,
            originAgreementType,
            setOriginAgreementType,
            ifShowLocationGroup,
            isSignedContract
        })
    }
    const CDAStepStyleList = [styles.firstStep, styles.secondStep, styles.thirdStepCDA, styles.fourthStepCDA]

    return (
        <Modal>
            <SafeAreaView style={styles.container}>
                <HeaderOfModal
                    handleOnPress={_.debounce(goBack, IntervalTime.FIVE_HUNDRED)}
                    title={`${t.labels.PBNA_MOBILE_CDA} ${
                        buttonClicked === ContractBtnType.START_NEW_CDA ? checkedYear : surveyQuestions.CDA_Year__c
                    }`}
                />
                {!!activeStep && (
                    <StepView
                        activeStep={Number(activeStep)}
                        titleList={[
                            t.labels.PBNA_MOBILE_GENERAL_INFO,
                            t.labels.PBNA_MOBILE_SPACE_REVIEW,
                            t.labels.PBNA_MOBILE_PRESENT,
                            t.labels.PBNA_MOBILE_NEXT_STEP
                        ]}
                        CDAStepStyleList={CDAStepStyleList}
                        transformLength={transformLength}
                    />
                )}

                <KeyboardAwareScrollView extraHeight={-20}>
                    {activeStep === StepVal.ONE && <GeneralInfoPage />}
                    {activeStep === StepVal.TWO && (
                        <ContractSpaceReviewPage
                            formStatus={formStatus}
                            answer={surveyQuestions}
                            setAnswer={(k: keyof typeof surveyQuestions, v: string) => {
                                dispatch(setSurveyQuestions({ ...surveyQuestions, [k]: v }))
                            }}
                            GSCId={GSCId}
                            missionId={missionId}
                            setTotalAnswer={(k: keyof typeof surveyQuestions.SpaceReviewWithTotal, v: string) =>
                                dispatch(
                                    setSurveyQuestions({
                                        ...surveyQuestions,
                                        SpaceReviewWithTotal: {
                                            ...surveyQuestions.SpaceReviewWithTotal,
                                            [k]: v
                                        }
                                    })
                                )
                            }
                            onFormButtonClicked={() => {
                                dispatch(
                                    setSurveyQuestions({
                                        ...surveyQuestions,
                                        formButtonClicked: true
                                    })
                                )
                            }}
                        />
                    )}
                    {activeStep === StepVal.THREE && (
                        <Present
                            coldVaultData={coldVaultData}
                            setTierStatus={setTierStatus}
                            autoSelectTier={autoSelectTier}
                            discountData={discountData}
                            rewardsData={rewardsData}
                            shellSheetsData={shellSheetsData}
                            estimatedData={estimatedData}
                            isPerimeter={isPerimeter}
                            ifShowLocationGroup={ifShowLocationGroup}
                        />
                    )}
                    {activeStep === StepVal.FOUR && <NextSteps coldVaultData={coldVaultData} />}
                </KeyboardAwareScrollView>
                {activeStep === StepVal.FOUR ? (
                    <StepFourFormBottomButton
                        dispatch={dispatch}
                        loading={loading}
                        nextStepsActiveStep={nextStepsActiveStep}
                        nextStepDisable={nextStepDisable}
                        onPressSave={handleSubmitCDA}
                    />
                ) : (
                    <SurveyFormBottomButton
                        dispatch={dispatch}
                        loading={loading}
                        disable={disable}
                        activeStep={activeStep}
                        handlePressSaveSurveyQuestionsProcess={handlePressSaveSurveyQuestionsProcess}
                    />
                )}
                <CDASuccessModal
                    modalVisible={showSuccessModal}
                    message={t.labels.PBNA_MOBILE_CDA_SUBMITTED_SUCCESSFULLY}
                />
            </SafeAreaView>
            <Loading isLoading={isLoading} />
        </Modal>
    )
}

export default SurveyQuestionsModal
