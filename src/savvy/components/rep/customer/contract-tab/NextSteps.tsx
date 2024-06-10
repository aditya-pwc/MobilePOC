import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CText from '../../../../../common/components/CText'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import { equipmentModalStyle } from '../equipment-tab/InstallRequestModal'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import {
    AssessmentIndicators,
    ContentTypeEnum,
    ContractStatus,
    PercentageEnum,
    StepVal
} from '../../../../enums/Contract'
import { t } from '../../../../../common/i18n/t'
import { useDispatch, useSelector } from 'react-redux'
import {
    checkCDATime,
    getMedalColorBGColor,
    getPOGFileData,
    handleNextStepsProcess
} from '../../../../helper/rep/ContractHelper'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import IconTick from '../../../../../../assets/image/icon-tick.svg'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { setAgreementCheck, setPOGBase64, setSurveyQuestions } from '../../../../redux/action/ContractAction'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import Pdf from 'react-native-pdf'
import { initSurveyQuestions } from '../../../../redux/reducer/ContractReducer'
import {
    initColdVaultData,
    usePreloadAgreementPDF,
    useContractData,
    useNextStepsData
} from '../../../../hooks/CustomerContractTabHooks'
import LinearGradient from 'react-native-linear-gradient'
import { renderCDAStoreIcon } from '../CustomerListTile'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { Log } from '../../../../../common/enums/Log'
import { CDASignatureTab } from './CDASignature'
import { getAddress, getPDFShelfCount } from '../../../../helper/rep/StartNewCDAHelper'
import _ from 'lodash'
import { DatePickerLegacy } from '../../../common/DatePicker'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    ...equipmentModalStyle,
    ...SurveyQuestionsStyle,
    snapShotContent: {
        paddingHorizontal: 22
    },
    snapShotTopText: {
        display: 'flex',
        justifyContent: 'center',
        marginVertical: 25
    },
    snapShotTopTextItem: {
        color: '#FFFFFF'
    },
    snapShotTopCard: {
        backgroundColor: baseStyle.color.white,
        marginHorizontal: 8,
        borderRadius: 6,
        borderColor: baseStyle.color.borderGray,
        borderWidth: 1,
        height: 64,
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    snapShotTopCardView: {
        width: 44,
        height: 44,
        borderRadius: 6,
        ...commonStyle.alignCenter
    },
    snapShotTopCardImage: {
        width: 30,
        height: 30
    },
    snapShotTopCardTextView: {
        marginLeft: 10
    },
    snapShotTopCardText: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    snapShotTopCardSubText: {
        color: baseStyle.color.titleGray
    },
    nextStepsSegment: {
        ...commonStyle.marginTop_20
    },
    nextStepsSegmentItem: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 61
    },
    nextStepsSegmentItemLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 32,
        paddingLeft: 22
    },
    nextStepsSegmentTouchable: {
        display: 'flex',
        ...commonStyle.alignItemsCenter
    },
    nextStepsSegmentLine: {
        height: 1,
        backgroundColor: baseStyle.color.borderGray,
        width: '38%'
    },
    nextStepsSegmentLineComplete: {
        backgroundColor: baseStyle.color.LightBlue
    },
    nextStepsSegmentItemRadio: {
        width: 12,
        height: 12,
        borderRadius: 50,
        backgroundColor: baseStyle.color.borderGray,
        borderWidth: 4,
        borderColor: baseStyle.color.transparent
    },
    nextStepsSegmentItemRadioActive: {
        width: 17,
        height: 17,
        borderRadius: 50,
        backgroundColor: baseStyle.color.transparent,
        borderWidth: 4,
        borderColor: baseStyle.color.LightBlue
    },
    nextStepsSegmentItemRadioComplete: {
        width: 17,
        height: 17,
        borderRadius: 50,
        backgroundColor: baseStyle.color.green,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    nextStepsSegmentIcon: {
        width: 13,
        height: 13
    },
    nextStepsSegmentItemText: {
        marginTop: 8,
        fontSize: 12
    },
    nextStepsSegmentItemTextActive: {
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    nextStepsSegmentItemAgreementText: {
        marginRight: 12
    },
    nextStepsSegmentContent: {
        marginTop: 27
    },
    nextStepsSegmentContentOne: {
        marginTop: 13
    },
    nextStepsSegmentContentOneTitle: {
        fontWeight: baseStyle.fontWeight.fw_900,
        fontSize: baseStyle.fontSize.fs_18
    },
    nextStepsSegmentContentFieldTitle: {
        ...SurveyQuestionsStyle.contentFieldTitle,
        marginTop: 30
    },
    nextStepsSegmentContentDataField: {
        marginTop: 30
    },
    nextStepsSegmentContentFieldValue: {
        ...SurveyQuestionsStyle.contentFieldValue,
        marginTop: 9
    },
    oneLineTwoItems: {
        flex: 1
    },
    nextStepsSegmentContentOneBtn: {
        marginTop: 10,
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 6,
        flex: 1,
        paddingVertical: 15,
        ...commonStyle.alignItemsCenter
    },
    nextStepsSegmentContentOneBtnDisabled: {
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.borderGray,
        borderWidth: 1
    },
    nextStepsSegmentContentOneBtnText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    nextStepsSegmentContentTwoBtnDisableText: {
        color: baseStyle.color.borderGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    nextStepsSegmentContentTwoValue: {
        marginTop: 30,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    nextStepsSegmentContentTwoTitle: {
        marginTop: 18,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    nextStepsSegmentContentTwoButton: {
        borderColor: baseStyle.color.tabShadowBlue
    },
    nextStepsSegmentContentTwoBtn: {
        backgroundColor: baseStyle.color.tabBlue,
        borderRadius: 6,
        flex: 1,
        paddingVertical: 15
    },
    nextStepsSegmentContentTwoBtnDisable: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 6,
        flex: 1,
        paddingVertical: 15,
        ...commonStyle.alignItemsCenter,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        color: baseStyle.color.borderGray
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: 260
    },
    pdfShadow: {
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.17,
        shadowRadius: 6
    },
    pageBackgroundImg: {
        resizeMode: 'cover',
        height: 100
    },
    snapShotErrorView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        fontSize: 14,
        fontWeight: '700'
    }
})

const notMatchAlert = (subText?: string) => {
    Alert.alert(t.labels.PBNA_MOBILE_NO_RELATED_TERMS_AND_CONDITIONS, subText || '', [
        {
            text: `${t.labels.PBNA_MOBILE_OK.toUpperCase()}`
        }
    ])
}

export const CDASnapshotContent: React.FC<{
    coldVaultData: typeof initColdVaultData
    surveyQuestions: any
    contractShelf: any
}> = ({ surveyQuestions, contractShelf }) => {
    const [loading, setLoading] = useState(false)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const locationId = customerDetail['Account.LOC_PROD_ID__c']
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const agreementCheck = useSelector((state: any) => state.contractReducer.agreementCheck)
    const dispatch = useDispatch()
    const { dropDownRef } = useDropDown()
    const timeErrMsg = useSelector((state: any) => state.contractReducer.timeErrMsg)
    const nextStepsActiveStep = useSelector((state: any) => state.contractReducer.nextStepsActiveStep) as string
    const locationData = useNextStepsData(locationId, checkedYear || surveyQuestions.CDA_Year__c, dispatch)
    const CDAYear = checkedYear || surveyQuestions.CDA_Year__c
    const cof = customerDetail['Account.CUST_UNIQ_ID_VAL__c']
    const [loadingDecline, setLoadingDecline] = useState(false)
    const POGBase64 = useSelector((state: any) => state.contractReducer.POGBase64)
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed

    useEffect(() => {
        if (nextStepsActiveStep === StepVal.ONE) {
            setLoadingDecline(true)
            const pogParams = {
                shelf: contractShelf,
                year: CDAYear,
                customerId: cof,
                countryCode: customerDetail.CountryCode
            }
            if (pogParams.shelf !== '') {
                getPOGFileData(pogParams)
                    .then((POGBase64) => {
                        if (POGBase64) {
                            dispatch(setAgreementCheck(true))
                            dispatch(setPOGBase64(POGBase64))
                        } else {
                            dispatch(setAgreementCheck(false))
                            dispatch(setPOGBase64(''))
                        }
                        setLoadingDecline(false)
                    })
                    .catch((error) => {
                        setLoadingDecline(false)
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'getPOGFileData',
                            `Get POG File Data: ${ErrorUtils.error2String(error)}`
                        )
                        dispatch(setAgreementCheck(false))
                        dispatch(setPOGBase64(''))
                    })
            }
        }
        if (surveyQuestions.Contract_Status__c === ContractStatus.Signed) {
            dispatch(
                setSurveyQuestions({
                    ...surveyQuestions,
                    CustomerSignedName__c: '',
                    CustomerSignedTitle: '',
                    Description: ''
                })
            )
        }
    }, [contractShelf])

    return (
        <View style={[styles.nextStepsSegmentContentOne, styles.snapShotContent]}>
            <CText style={styles.nextStepsSegmentContentOneTitle}>{t.labels.PBNA_MOBILE_CDA_SNAPSHOT}</CText>
            <CText style={styles.nextStepsSegmentContentFieldTitle}>{t.labels.PBNA_MOBILE_STORE_NAME}</CText>
            <CText style={styles.nextStepsSegmentContentFieldValue}>{customerDetail.Name || ''}</CText>
            <View style={commonStyle.flexRowSpaceBet}>
                <View style={styles.oneLineTwoItems}>
                    <CText style={styles.nextStepsSegmentContentFieldTitle}>{t.labels.PBNA_MOBILE_CUSTOMER_ID}</CText>
                    <CText style={styles.nextStepsSegmentContentFieldValue}>
                        {customerDetail['Account.CUST_UNIQ_ID_VAL__c']}
                    </CText>
                </View>
                <View style={styles.oneLineTwoItems}>
                    <CText style={styles.nextStepsSegmentContentFieldTitle}>{t.labels.PBNA_MOBILE_LOCATION}</CText>
                    <CText style={styles.nextStepsSegmentContentFieldValue}>
                        {locationData ? locationData.SLS_UNIT_NM__c : ''}
                    </CText>
                </View>
            </View>
            <CText style={styles.nextStepsSegmentContentFieldTitle}>{t.labels.PBNA_MOBILE_ADDRESS1}</CText>
            <CText style={styles.nextStepsSegmentContentFieldValue}>{getAddress(customerDetail)}</CText>
            <View style={[commonStyle.flexRowSpaceBet, styles.nextStepsSegmentContentDataField]}>
                {!!timeErrMsg && (
                    <View style={styles.snapShotErrorView}>
                        <CText style={styles.errorStyle}>{timeErrMsg}</CText>
                    </View>
                )}
                <View style={styles.startTime}>
                    <View style={{ flex: 1 }}>
                        <DatePickerLegacy
                            disabled={isDisabled}
                            fieldLabel={t.labels.PBNA_MOBILE_CDA_START_DATE}
                            value={surveyQuestions.StartDate ? surveyQuestions.StartDate : ''}
                            onChange={(v: Date) => {
                                const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                dispatch(
                                    setSurveyQuestions({
                                        ...surveyQuestions,
                                        StartDate: date
                                    })
                                )
                                checkCDATime(date, surveyQuestions.EndDate, dispatch)
                            }}
                            deferred
                        />
                    </View>
                </View>
                <View style={styles.startTime}>
                    <View style={{ flex: 1 }}>
                        <DatePickerLegacy
                            disabled={isDisabled}
                            fieldLabel={t.labels.PBNA_MOBILE_CDA_END_DATE}
                            value={surveyQuestions.EndDate ? surveyQuestions.EndDate : ''}
                            onChange={(v: Date) => {
                                const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)

                                dispatch(
                                    setSurveyQuestions({
                                        ...surveyQuestions,
                                        EndDate: date
                                    })
                                )

                                checkCDATime(surveyQuestions.StartDate, date, dispatch)
                            }}
                            deferred
                        />
                    </View>
                </View>
            </View>
            <View style={styles.nextStepsSegmentContentTwoButton}>
                <TouchableOpacity
                    style={[styles.agreementCheckBox, POGBase64 && agreementCheck && styles.agreementChecked]}
                    onPress={() => dispatch(setAgreementCheck(!agreementCheck))}
                    disabled={!POGBase64}
                >
                    <View
                        style={[
                            styles.agreementCheckBoxIconView,
                            styles.agreementCheckBoxActive,
                            agreementCheck && styles.agreementCheckBoxChecked
                        ]}
                    >
                        {agreementCheck ? <IconTick style={styles.agreementCheckBoxIcon} fill={'#fff'} /> : null}
                    </View>
                    <CText style={{ width: 320 }}>{t.labels.PBNA_MOBILE_INCLUDE_PROPOSED_PLANOGRAM_IN_CONTACT}</CText>
                    {loadingDecline && <ActivityIndicator style={commonStyle.marginLeft5} />}
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!!timeErrMsg || loading || loadingDecline}
                    style={[
                        styles.nextStepsSegmentContentOneBtn,
                        (!!timeErrMsg || loadingDecline) && styles.nextStepsSegmentContentOneBtnDisabled
                    ]}
                    onPress={() => {
                        handleNextStepsProcess({
                            dispatch,
                            dropDownRef,
                            setLoading,
                            nextStepsActiveStep,
                            surveyQuestions,
                            isDisabled
                        })
                    }}
                >
                    <CText
                        style={[
                            styles.nextStepsSegmentContentOneBtnText,
                            (!!timeErrMsg || loadingDecline) && styles.nextStepsSegmentContentTwoBtnDisableText
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_SAVE_PROCEED.toUpperCase()}
                    </CText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export const AgreementContent: React.FC = () => {
    const { dropDownRef } = useDropDown()
    const [loading, setLoading] = useState(false)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const dispatch = useDispatch()
    const [agreementCheckBoxDisable, setAgreementCheckBoxDisable] = useState(true)
    const nextStepsActiveStep = useSelector((state: any) => state.contractReducer.nextStepsActiveStep) as string
    const pdfBs64 = usePreloadAgreementPDF(customerDetail.Country, checkedYear || surveyQuestions.CDA_Year__c)
    const { specialTerms, setSpecialTerms } = useContractData(surveyQuestions.Id, dropDownRef)
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed
    const updateContractSpecialTerms = async (specialTerms: boolean) => {
        try {
            await syncUpObjUpdateFromMem('Contract', [
                {
                    Id: surveyQuestions.Id,
                    SpecialTerms: specialTerms.toString()
                }
            ])
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'updateContractSpecialTerms',
                `Customer update contract SpecialTerms failed: ${ErrorUtils.error2String(err)}`
            )
        }
    }
    const handleAgreement = () => {
        setSpecialTerms(!specialTerms)
        updateContractSpecialTerms(!specialTerms)
    }

    useEffect(() => {
        pdfBs64 === null && notMatchAlert()
    }, [pdfBs64])
    return (
        <View style={styles.nextStepsSegmentContentOne}>
            <LinearGradient colors={['rgb(160,179,210)', '#fff']} style={{ height: 5 }} />
            <Pdf
                style={styles.pdf}
                source={{
                    uri: pdfBs64 ? ContentTypeEnum.PDF + pdfBs64 : undefined
                }}
                scale={1.25}
                minScale={1.25}
                onPageChanged={(page, numberOfPages) => {
                    if (page === numberOfPages) {
                        setAgreementCheckBoxDisable(false)
                    }
                }}
            />
            <LinearGradient colors={['#fff', 'rgb(160,179,210)']} style={{ height: 5 }} />
            <View style={[styles.nextStepsSegmentContentTwoButton, styles.snapShotContent]}>
                <TouchableOpacity
                    style={[styles.agreementCheckBox, specialTerms && styles.agreementChecked]}
                    onPress={() => handleAgreement()}
                    disabled={agreementCheckBoxDisable}
                >
                    <View
                        style={[
                            styles.agreementCheckBoxIconView,
                            (!agreementCheckBoxDisable || specialTerms) && styles.agreementCheckBoxActive,
                            specialTerms && styles.agreementCheckBoxChecked
                        ]}
                    >
                        {specialTerms ? <IconTick style={styles.agreementCheckBoxIcon} fill={'#fff'} /> : null}
                    </View>
                    <CText style={{ width: 350 }}>{t.labels.PBNA_MOBILE_I_AGREE_WITH_CDA_TERMS_AND_CONDITIONS}</CText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.nextStepsSegmentContentTwoBtnDisable,
                        specialTerms && styles.nextStepsSegmentContentTwoBtn
                    ]}
                    onPress={() => {
                        handleNextStepsProcess({
                            dispatch,
                            dropDownRef,
                            setLoading,
                            nextStepsActiveStep,
                            surveyQuestions,
                            isDisabled
                        })
                    }}
                    disabled={!specialTerms || loading}
                >
                    <CText
                        style={[
                            styles.nextStepsSegmentContentTwoBtnDisableText,
                            specialTerms && styles.nextStepsSegmentContentOneBtnText
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_SAVE_PROCEED.toUpperCase()}
                    </CText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const NextSteps: React.FC<{ coldVaultData: typeof initColdVaultData }> = ({ coldVaultData }) => {
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const stepThreeComplete = Boolean(surveyQuestions.CustomerSignature && surveyQuestions.RepSignature)
    const nextStepsActiveStep = useSelector((state: any) => state.contractReducer.nextStepsActiveStep) as string
    const getContractShelf = () => {
        return `${t.labels.PBNA_MOBILE_CONTRACT_SHELF_COUNT}: ${
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] ||
            _.round(
                Number(coldVaultData?.SpaceRequirements[surveyQuestions.Signed_Medal_Tier__c]) *
                    Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]),
                1
            )
        } | ${
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] ||
            _.round(
                Number(coldVaultData?.SpaceRequirements[surveyQuestions.Signed_Medal_Tier__c]) *
                    PercentageEnum.ONE_HUNDRED,
                1
            )
        }%`
    }

    return (
        <View>
            <ImageBackground source={ImageSrc.PATTERN_BLUE_BACKGROUND} imageStyle={styles.pageBackgroundImg} />
            <View style={[styles.snapShotTopText, styles.snapShotContent]}>
                <CText style={styles.snapShotTopTextItem}>{getContractShelf()}</CText>
            </View>
            <View style={[styles.snapShotTopCard, styles.snapShotContent]}>
                <View
                    style={[
                        styles.snapShotTopCardView,
                        {
                            backgroundColor: getMedalColorBGColor(surveyQuestions.Signed_Medal_Tier__c).backgroundColor
                        }
                    ]}
                >
                    {renderCDAStoreIcon(surveyQuestions.Signed_Medal_Tier__c, styles.snapShotTopCardImage)}
                </View>

                <View style={styles.snapShotTopCardTextView}>
                    <CText style={styles.snapShotTopCardSubText}>
                        {coldVaultData?.MedalOverview?.includes(surveyQuestions?.Signed_Medal_Tier__c as never)
                            ? t.labels.PBNA_MOBILE_SELECTED_MEDAL
                            : t.labels.PBNA_MOBILE_SELECTED}
                    </CText>
                    <CText style={styles.snapShotTopCardText}>
                        {surveyQuestions.Signed_Medal_Tier__c +
                            ' ' +
                            (coldVaultData?.MedalOverview?.includes(surveyQuestions?.Signed_Medal_Tier__c as never)
                                ? t.labels.PBNA_MOBILE_MEDAL
                                : '')}
                    </CText>
                </View>
            </View>
            <View style={styles.nextStepsSegment}>
                <View style={styles.nextStepsSegmentItem}>
                    <View
                        style={[
                            styles.nextStepsSegmentItemRadio,
                            nextStepsActiveStep === StepVal.ONE && styles.nextStepsSegmentItemRadioActive,
                            nextStepsActiveStep !== StepVal.ONE && styles.nextStepsSegmentItemRadioComplete
                        ]}
                    >
                        {nextStepsActiveStep !== StepVal.ONE && (
                            <IconTick fill={'#fff'} style={styles.nextStepsSegmentIcon} />
                        )}
                    </View>
                    <View
                        style={[
                            styles.nextStepsSegmentLine,
                            nextStepsActiveStep !== StepVal.ONE && styles.nextStepsSegmentLineComplete
                        ]}
                    />
                    <View
                        style={[
                            styles.nextStepsSegmentItemRadio,
                            nextStepsActiveStep === StepVal.TWO && styles.nextStepsSegmentItemRadioActive,
                            nextStepsActiveStep === StepVal.THREE && styles.nextStepsSegmentItemRadioComplete
                        ]}
                    >
                        {nextStepsActiveStep === StepVal.THREE && (
                            <IconTick fill={'#fff'} style={styles.nextStepsSegmentIcon} />
                        )}
                    </View>
                    <View
                        style={[
                            styles.nextStepsSegmentLine,
                            nextStepsActiveStep === StepVal.THREE && styles.nextStepsSegmentLineComplete
                        ]}
                    />
                    <View
                        style={[
                            styles.nextStepsSegmentItemRadio,
                            nextStepsActiveStep === StepVal.THREE &&
                                !stepThreeComplete &&
                                styles.nextStepsSegmentItemRadioActive,
                            nextStepsActiveStep === StepVal.THREE &&
                                stepThreeComplete &&
                                styles.nextStepsSegmentItemRadioComplete
                        ]}
                    >
                        {nextStepsActiveStep === StepVal.THREE && stepThreeComplete && (
                            <IconTick fill={'#fff'} style={styles.nextStepsSegmentIcon} />
                        )}
                    </View>
                </View>
                <View style={styles.nextStepsSegmentItemLabel}>
                    <CText style={[styles.nextStepsSegmentItemText, styles.nextStepsSegmentItemTextActive]}>
                        {t.labels.PBNA_MOBILE_CDA_SNAPSHOT.toUpperCase()}
                    </CText>
                    <CText
                        style={[
                            styles.nextStepsSegmentItemText,
                            styles.nextStepsSegmentItemAgreementText,
                            nextStepsActiveStep !== StepVal.ONE && styles.nextStepsSegmentItemTextActive
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_AGREEMENT.toUpperCase()}
                    </CText>
                    <CText
                        style={[
                            styles.nextStepsSegmentItemText,
                            nextStepsActiveStep === StepVal.THREE && styles.nextStepsSegmentItemTextActive
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_SIGNATURE.toUpperCase()}
                    </CText>
                </View>
                <View style={styles.nextStepsSegmentContent}>
                    {nextStepsActiveStep === StepVal.ONE && (
                        <CDASnapshotContent
                            coldVaultData={coldVaultData}
                            surveyQuestions={surveyQuestions}
                            contractShelf={getPDFShelfCount(
                                surveyQuestions,
                                coldVaultData,
                                surveyQuestions.Signed_Medal_Tier__c
                            )}
                        />
                    )}
                    {nextStepsActiveStep === StepVal.TWO && <AgreementContent />}
                    {nextStepsActiveStep === StepVal.THREE && <CDASignatureTab />}
                </View>
            </View>
        </View>
    )
}
export default NextSteps
