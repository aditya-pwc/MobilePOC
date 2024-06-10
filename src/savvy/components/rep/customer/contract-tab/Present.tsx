import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, KeyboardTypeOptions } from 'react-native'
import CollapseContainer from '../../../common/CollapseContainer'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CText from '../../../../../common/components/CText'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import { equipmentModalStyle } from '../equipment-tab/InstallRequestModal'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import SubTypeModal from '../../../manager/common/SubTypeModal'
import BluePdf from '../../../../../../assets/image/blue-pdf.svg'
import WhitePdf from '../../../../../../assets/image/white-pdf.svg'
import { CheckBox, Input } from 'react-native-elements'
import { SyncedScrollViewContext, syncedScrollViewState } from './contexts/SyncedScrollViewContext'
import { SyncedScrollView } from './SyncedScrollView'
import { renderCDAStoreIcon } from '../CustomerListTile'
import {
    AssessmentIndicators,
    EstimatedValuesEnum,
    PercentageEnum,
    SyncedScrollViewIdEnum,
    TierDataObj,
    getMedalMap,
    isAgreementMedal,
    isMedal,
    SubType,
    StepVal,
    ContractStatus
} from '../../../../enums/Contract'
import { unCheckCircle } from './SelectYearModalChildren'
import { t } from '../../../../../common/i18n/t'
import { useDispatch, useSelector } from 'react-redux'
import { initSurveyQuestions } from '../../../../redux/reducer/ContractReducer'
import {
    ExecutionAndDiscountData,
    PogData,
    ShellSheetData,
    initColdVaultData,
    usePresentData
} from '../../../../hooks/CustomerContractTabHooks'
import { setSurveyQuestions, setTierData } from '../../../../redux/action/ContractAction'
import _ from 'lodash'
import { getMedalColorBGColor, wholeNumber, wholeOrDecimalNumber } from '../../../../helper/rep/ContractHelper'
import IconBlueAdd from '../../../../../../assets/image/icon-blue-add.svg'
import { ScrollView } from 'react-native-gesture-handler'
import {
    AddRewardsModal,
    RewardCardList,
    RewardData,
    RewardDetailModal,
    RewardDetailRefType,
    removeFileNameExtension
} from './RewardsModals'
import { ContractPDFModal } from './ContractPDF'
import { useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { checkIsChangedMedalTierType, getShelfCount, openFile } from '../../../../helper/rep/StartNewCDAHelper'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import CCheckBox from '../../../../../common/components/CCheckBox'

const styles = StyleSheet.create({
    ...equipmentModalStyle,
    ...SurveyQuestionsStyle
})

interface KpiRowMedalDataProps {
    enabledTiers: string[]
    kpiRequirements: { [k: string]: string | null }
    multiply?: number
    round?: boolean
    unit?: string
    maxDigit?: number
    isMinus?: boolean
    kpiReferenceValueContainer?: object
    changeBackgroundColor?: boolean
}

interface KpiRowCustomColumnProps {
    kpiName: string
    onChangeText?: (text: string) => void
    keyboardType?: KeyboardTypeOptions
    onBlur?: () => void
    value?: string
    noInput?: boolean
    disabled?: boolean
    kpiRowCustomContainer?: object
    kpiNameLabelContainer?: object
    maxLength?: number
    redStar?: boolean
}

export const KpiRowCustomColumn = ({
    kpiName,
    keyboardType,
    onChangeText,
    value,
    onBlur,
    noInput,
    disabled,
    kpiRowCustomContainer = {},
    kpiNameLabelContainer = {},
    redStar,
    maxLength = 4
}: KpiRowCustomColumnProps) => {
    const [input, setInput] = useState('') // Future Story
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed
    return (
        <View style={[styles.kpiNameView, kpiRowCustomContainer]}>
            <View style={[styles.kpiNameLabel, kpiNameLabelContainer]}>
                <CText style={styles.twelveBlackRegular}>
                    {kpiName}
                    {redStar && <CText style={styles.redStar}>*</CText>}
                </CText>
            </View>
            {!noInput && (
                <Input
                    disabled={disabled || isDisabled}
                    onBlur={onBlur}
                    containerStyle={[
                        styles.tableRowInput,
                        (disabled || isDisabled) && {
                            borderColor: '#D3D3D3'
                        }
                    ]}
                    disabledInputStyle={{ opacity: 1 }}
                    returnKeyType="done"
                    textAlign="center"
                    maxLength={maxLength}
                    inputContainerStyle={styles.borderBottomColor0}
                    keyboardType={keyboardType || 'decimal-pad'}
                    inputStyle={styles.tableRowInputStyle}
                    value={String(value) || input}
                    onChangeText={onChangeText || setInput}
                />
            )}
        </View>
    )
}

export const BottomLine = ({ lineStyle }: { lineStyle: object }) => {
    return <View style={[styles.bottomLine, lineStyle]} />
}

export const SectionTitle = ({ title }: { title: string }) => {
    return (
        <View>
            <CText style={styles.sectionTitle}>{title}</CText>
        </View>
    )
}

export const KpiRowMedalData = ({
    enabledTiers,
    kpiRequirements,
    multiply = 1,
    round = false,
    unit = '',
    maxDigit,
    isMinus = false,
    kpiReferenceValueContainer,
    changeBackgroundColor = true
}: KpiRowMedalDataProps) => {
    const getDisplayValue = (v: string | null) => {
        if (v == null || v === '') {
            if (isMinus) {
                return EstimatedValuesEnum.ZERO
            }
            return ''
        }
        if (v === '0') {
            return v
        }
        const result = round ? _.round(Number(v) * multiply, 1) : Number(v) * multiply
        if (isMinus && result <= 0) {
            return EstimatedValuesEnum.ZERO
        }
        if (maxDigit) {
            if (result.toString().length > maxDigit) {
                return [result.toString().slice(0, maxDigit), '\n', result.toString().slice(maxDigit)].join('')
            }
        }
        return result
    }
    const addUnit = (unit: string, v: string | null) => {
        if (v === undefined) {
            if (isMinus) {
                return `${unit}${EstimatedValuesEnum.ZERO}`
            }
            return EstimatedValuesEnum.UNDEFINED
        }

        return `${unit}${getDisplayValue(v)}`
    }
    return (
        <View style={styles.kpiReferenceView}>
            {enabledTiers.map((medal) => {
                return (
                    <View
                        key={medal}
                        style={[
                            styles.kpiReferenceValueView,
                            {
                                backgroundColor: changeBackgroundColor
                                    ? getMedalColorBGColor(medal).backgroundColor
                                    : '#E4EBFF'
                            },
                            kpiReferenceValueContainer || {}
                        ]}
                    >
                        <CText style={styles.fourteenBlackBold}>
                            {unit ? addUnit(unit, kpiRequirements[medal]) : getDisplayValue(kpiRequirements[medal])}
                        </CText>
                    </View>
                )
            })}
        </View>
    )
}

const Circle = ({ disable }: { disable: boolean }) => {
    return (
        <View style={[styles.circleStyle, { backgroundColor: disable ? '#D3D3D3' : '#fff' }, styles.pdfShadow]}>
            {!disable && <BluePdf />}
            {disable && <WhitePdf />}
        </View>
    )
}

const MedalsSelector = ({ handleOpenMedalsSelector }: { handleOpenMedalsSelector: Function }) => {
    return (
        <TouchableOpacity
            hitSlop={commonStyle.smallHitSlop}
            style={styles.medalSelectionBtn}
            onPress={() => {
                handleOpenMedalsSelector && handleOpenMedalsSelector()
            }}
        >
            <CText style={styles.medalsTextStyle}>{t.labels.PBNA_MOBILE_TIERS}</CText>
            <Image style={styles.downArrow} source={ImageSrc.IMG_TRIANGLE} />
        </TouchableOpacity>
    )
}

const MedalCard = ({
    tier,
    selected = false,
    setSelectedTier,
    surveyQuestions,
    coldVaultData,
    navigation,
    year,
    customerId,
    setPogItem,
    pogLoading,
    setPogLoading
}: {
    tier: string
    selected: boolean
    setSelectedTier: Function
    surveyQuestions: typeof initSurveyQuestions
    coldVaultData: typeof initColdVaultData
    navigation: NavigationProp<any>
    year: string
    customerId: string
    setPogItem: Function
    pogLoading: boolean
    setPogLoading: Function
}) => {
    const medalMap = getMedalMap()
    const shelfCount = getShelfCount(surveyQuestions, coldVaultData, tier)
    const disablePog = shelfCount === '' || shelfCount === null || shelfCount === undefined
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed

    return (
        <TouchableOpacity disabled={isDisabled} style={styles.medalCardView} onPress={() => setSelectedTier(tier)}>
            <View
                style={[
                    styles.medalCardSquareView,
                    {
                        backgroundColor: getMedalColorBGColor(tier).backgroundColor,
                        borderColor: getMedalColorBGColor(tier).borderColor
                    }
                ]}
            >
                <CheckBox
                    disabled
                    checked={selected}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={unCheckCircle()}
                />
                <View style={{ marginTop: 15 }}>{renderCDAStoreIcon(tier, styles.CDAStoreIconSize)}</View>
                <CText numberOfLines={2} style={[styles.twelveBlackRegular, { marginTop: 10 }]}>
                    {medalMap[tier] || tier}
                </CText>
            </View>
            <View style={styles.circleView}>
                <TouchableOpacity
                    disabled={disablePog || pogLoading || isDisabled}
                    onPress={() => {
                        const pogParams = {
                            shelf: getShelfCount(surveyQuestions, coldVaultData, tier),
                            year,
                            customerId,
                            countryCode: customerDetail.CountryCode
                        }
                        openFile(setPogLoading, true, navigation, pogParams, null, setPogItem)
                    }}
                >
                    <Circle disable={disablePog || pogLoading || isDisabled} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

let [cvUpdating, perimeterUpdating, totalUpdating] = [false, false, false]

const Present = (props: any) => {
    const {
        coldVaultData,
        setTierStatus,
        autoSelectTier,
        discountData,
        rewardsData,
        shellSheetsData,
        isPerimeter,
        ifShowLocationGroup
    } = props
    const dispatch = useDispatch()
    const { dropDownRef } = useDropDown()
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const tierData = useSelector((state: any) => state.contractReducer.tierData)
    const estimatedData = useSelector((state: any) => state.contractReducer.estimatedData)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const executionData = useSelector((state: any) => state.contractReducer.executionData)
    const locationId = customerDetail['Account.LOC_PROD_ID__c']
    const contractId = surveyQuestions.Id
    const [showCVContainer, setShowCVContainer] = useState(true)
    const [showEEContainer, setShowEEContainer] = useState(false)
    const [showDiscountContainer, setShowDiscountContainer] = useState(false)
    const [showEstimatedContainer, setShowEstimatedContainer] = useState(false)
    const [showRewardsContainer, setShowRewardsContainer] = useState(true)
    const [pogLoading, setPogLoading] = useState<boolean>(false)
    const [showMedals, setShowMedals] = useState(false)
    const [showAddRewardMedal, setShowAddRewardMedal] = useState(false)
    const [sellSheetItem, setSellSheetItem] = useState<ShellSheetData | null>(null)
    const [pogItem, setPogItem] = useState<PogData | null>(null)
    const visitId = useSelector((state: any) => state.contractReducer.visitId)
    const [tempTierData, setTempTierData] = useState(tierData)
    const sharepointToken = useSharePointToken(true)
    const enabledTier = tierData.filter((tier: TierDataObj) => tier.select).map((t: TierDataObj) => t.name)
    const rewardDetailRef: RewardDetailRefType = useRef(null)
    const navigation = useNavigation()
    const CDAYear = checkedYear || surveyQuestions.CDA_Year__c
    const cof = customerDetail['Account.CUST_UNIQ_ID_VAL__c']
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed
    const isShowLocationGroup = ifShowLocationGroup ?? surveyQuestions.CDA_Space_Checkbox__c

    const handleUpdateContractCompliant = (newTier: string) => {
        if (
            newTier &&
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] &&
            coldVaultData &&
            coldVaultData.SpaceRequirements
        ) {
            return (
                Number(coldVaultData.SpaceRequirements[newTier]) * PercentageEnum.ONE_HUNDRED <=
                Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE])
            )
        }
        return true
    }

    const setSelectedTier = (newTier: string) => {
        const compliant = handleUpdateContractCompliant(newTier)
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                Signed_Medal_Tier__c: newTier,
                Compliant__c: compliant,
                SelectRewards: checkIsChangedMedalTierType(surveyQuestions, newTier)
                    ? {}
                    : surveyQuestions.SelectRewards
            })
        )
    }

    const setExecutionElements = (executionKpiName: string, value: string) => {
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                ExecutionElements: { ...surveyQuestions.ExecutionElements, [executionKpiName]: value }
            })
        )
    }

    const selectRewards = surveyQuestions.SelectRewards

    const setSelectRewards = (selectRewardObj: { [x: string]: boolean | undefined }) =>
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                SelectRewards: selectRewardObj
            })
        )

    const setProposedPercentage = (value: string) => {
        const percentage = Number(value)
        if ((value !== '' && !wholeOrDecimalNumber.test(value)) || percentage > PercentageEnum.ONE_HUNDRED) {
            return
        }
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: value,
                [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: value
                    ? String(
                          _.round(
                              (percentage / PercentageEnum.ONE_HUNDRED) *
                                  Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]),
                              1
                          )
                      )
                    : ''
            })
        )
    }

    const setProposedTotalPepShelves = (value: string) => {
        if (
            (value !== '' && !wholeOrDecimalNumber.test(value)) ||
            Number(value) > Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])
        ) {
            return
        }
        const percentage =
            (Number(value) / Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])) *
            PercentageEnum.ONE_HUNDRED
        const newSurveyQuestion = {
            ...surveyQuestions,
            [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: value ? String(_.round(percentage, 1)) : '',
            [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: value
        }

        if (
            !cvUpdating &&
            !perimeterUpdating &&
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] &&
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]
        ) {
            newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] = ''
            newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES] = ''
        } else if (
            perimeterUpdating ||
            (surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] &&
                !surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES])
        ) {
            perimeterUpdating = true
            const newSub = Number(value) - Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES])
            if (newSub >= 0) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES] = String(_.round(newSub, 1))
            }
            if (!value) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES] = ''
            }
        } else if (
            cvUpdating ||
            (!surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] &&
                surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES])
        ) {
            cvUpdating = true
            const newSub = Number(value) - Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES])
            if (newSub >= 0) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] = String(_.round(newSub, 1))
            }
            if (!value) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] = ''
            }
        }
        dispatch(setSurveyQuestions(newSurveyQuestion))
    }

    const calculateTotalPepShelves = () => {
        cvUpdating = false
        perimeterUpdating = false
        totalUpdating = false
        surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] && autoSelectTier(true)
    }

    const setProposedCVorPerimeter = (value: string, isCV = true) => {
        const numberValue = Number(value)
        const newSurveyQuestion = { ...surveyQuestions }
        const [main, sub] = isCV
            ? ([
                  AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES,
                  AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES
              ] as const)
            : ([
                  AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES,
                  AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES
              ] as const)
        if (
            (value !== '' && !wholeOrDecimalNumber.test(value)) ||
            numberValue > Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]) ||
            (!totalUpdating &&
                numberValue > (Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]) || Infinity))
        ) {
            return
        }
        newSurveyQuestion[main] = value
        // All inputted
        if (
            surveyQuestions[sub] &&
            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] &&
            !cvUpdating &&
            !totalUpdating
        ) {
            newSurveyQuestion[sub] = ''
            newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] = ''
            newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] = ''
        } else if (!cvUpdating && surveyQuestions[sub]) {
            totalUpdating = true
            const newTotal = numberValue + Number(surveyQuestions[sub])
            if (!value) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] = ''
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] = ''
            } else if (newTotal <= Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])) {
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] = String(
                    _.round(Number(value) + Number(surveyQuestions[sub]), 1)
                )
                const percentage =
                    ((Number(value) + Number(surveyQuestions[sub])) /
                        Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])) *
                    PercentageEnum.ONE_HUNDRED
                newSurveyQuestion[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] = String(_.round(percentage, 1))
            } else {
                return
            }
        } else if (cvUpdating || surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] !== '') {
            cvUpdating = true
            const newSub = Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]) - numberValue
            if (newSub >= 0) {
                newSurveyQuestion[sub] = String(_.round(newSub, 1))
            } else {
                return
            }
            if (!value) {
                newSurveyQuestion[sub] = ''
            }
        }
        dispatch(setSurveyQuestions(newSurveyQuestion))
    }

    const handleOpenMedalsSelector = () => {
        if (isDisabled) {
            setShowMedals(false)
        } else {
            setTempTierData(tierData)
            setShowMedals(true)
        }
    }

    const onCancelMedals = () => {
        dispatch(setTierData(tempTierData))
        setShowMedals(!showMedals)
    }

    const updateMedals = () => {
        setTempTierData(tierData)
        autoSelectTier()
        setShowMedals(!showMedals)
    }

    const handleToggleCheckBox = () => {
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                [AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]: '',
                [AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]: '',
                CDA_Space_Checkbox__c: !surveyQuestions.CDA_Space_Checkbox__c
            })
        )
    }

    const displayRow = (enabledTiers: string[], discountRowData: any) => {
        let isShowRow = false
        const rowMedals = Object.keys(discountRowData.kpiRequirements)

        for (const tier of enabledTiers) {
            isShowRow = rowMedals.findIndex((rowMedal) => rowMedal === tier) !== -1
            if (isShowRow) {
                break
            }
        }
        return isShowRow
    }

    const onBlurProposedTotal = () => {
        cvUpdating = false
        perimeterUpdating = false
        totalUpdating = false
        autoSelectTier()
    }

    const getHandleOpenDetailFunc = (item: RewardData) => () => rewardDetailRef.current?.openModal(item)

    usePresentData(locationId, CDAYear, dropDownRef, surveyQuestions, visitId, contractId)
    useEffect(() => {
        if (
            surveyQuestions.Contract_Status__c === ContractStatus.Signed &&
            surveyQuestions.Draft_Survey_Step__c !== StepVal.THREE
        ) {
            setShowAddRewardMedal(true)
        }
    }, [])

    const shelfCountProposed = getShelfCount(
        surveyQuestions,
        coldVaultData,
        surveyQuestions.Signed_Medal_Tier__c,
        false
    )
    const getPepShelvesDisplayVal = (v: string) => {
        if (v) {
            return `${_.round(Number(v), 0)}`
        }
        return v
    }

    const getRewardsDataByMedalType = (rewardData: RewardData[]) => {
        const getIsMedal = surveyQuestions.Signed_Medal_Tier__c
            ? isMedal(surveyQuestions.Signed_Medal_Tier__c)
            : isAgreementMedal(surveyQuestions.Agreement_Type__c)
        return rewardData.filter((i: RewardData) => {
            return getIsMedal
                ? i.SUBTYPE__c === SubType.MEDAL || i.SUBTYPE__c === SubType.BOTH
                : i.SUBTYPE__c === SubType.BASIC || i.SUBTYPE__c === SubType.BOTH
        })
    }

    return (
        <SyncedScrollViewContext.Provider value={syncedScrollViewState}>
            <View style={styles.tierSectionView}>
                <View style={styles.tierTitleView}>
                    <SectionTitle title={t.labels.PBNA_MOBILE_TIER_SELECTION} />
                    <MedalsSelector handleOpenMedalsSelector={handleOpenMedalsSelector} />
                </View>
                <View style={styles.medalSelectionBody}>
                    <View style={styles.phonogramBox}>
                        <View style={styles.planographyView}>
                            <CText style={[styles.fourteenBlackBold]}>{t.labels.PBNA_MOBILE_PLANOGRAMS}</CText>
                        </View>

                        <View style={styles.proposedBox}>
                            <CText style={styles.twelveBlackRegular}>{t.labels.PBNA_MOBILE_PROPOSED}</CText>
                            <TouchableOpacity
                                disabled={!shelfCountProposed || pogLoading || isDisabled}
                                onPress={() => {
                                    const pogParams = {
                                        shelf: shelfCountProposed,
                                        year: CDAYear,
                                        customerId: cof,
                                        countryCode: customerDetail.CountryCode
                                    }
                                    openFile(setPogLoading, true, navigation, pogParams, null, setPogItem)
                                }}
                            >
                                <Circle disable={!shelfCountProposed || pogLoading || isDisabled} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <SyncedScrollView
                        id={SyncedScrollViewIdEnum.ONE}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        {enabledTier.map((tier: any) => (
                            <MedalCard
                                tier={tier}
                                key={tier}
                                surveyQuestions={surveyQuestions}
                                selected={tier === surveyQuestions.Signed_Medal_Tier__c}
                                setSelectedTier={setSelectedTier}
                                coldVaultData={coldVaultData}
                                navigation={navigation}
                                year={CDAYear}
                                customerId={cof}
                                setPogItem={setPogItem}
                                pogLoading={pogLoading}
                                setPogLoading={setPogLoading}
                            />
                        ))}
                    </SyncedScrollView>
                </View>
            </View>

            <CollapseContainer
                noTopLine
                noBottomLine
                preload
                showContent={showCVContainer}
                setShowContent={setShowCVContainer}
                title={t.labels.PBNA_MOBILE_SPACE_OVERVIEW}
            >
                {isPerimeter && (
                    <TouchableOpacity style={styles.presentCheckBox} onPress={handleToggleCheckBox}>
                        <CCheckBox disabled checked={surveyQuestions.CDA_Space_Checkbox__c} />
                        <View style={{ width: 350 }}>
                            <CText>{t.labels.PBNA_MOBILE_SPACE_OVERVIEW_CHECK_MSG}</CText>
                        </View>
                    </TouchableOpacity>
                )}
                <View style={styles.KpiRowView}>
                    <View style={styles.KpiColumnView}>
                        <View style={styles.KpiRowCustomColumn}>
                            <KpiRowCustomColumn
                                onBlur={autoSelectTier}
                                kpiName={t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_TOTAL_PEP_LRB_PERCENT}
                                keyboardType={'numeric'}
                                value={String(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE])}
                                onChangeText={setProposedPercentage}
                                disabled={isShowLocationGroup}
                                redStar
                            />
                        </View>
                        <View style={styles.KpiRowCustomColumn}>
                            <KpiRowCustomColumn
                                onBlur={onBlurProposedTotal}
                                kpiName={t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_TOTAL_PEP_LRB_SHELVES}
                                keyboardType="number-pad"
                                value={getPepShelvesDisplayVal(
                                    surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]
                                )}
                                onChangeText={setProposedTotalPepShelves}
                                redStar
                            />
                        </View>
                        {isShowLocationGroup && (
                            <>
                                <View style={styles.KpiRowCustomColumn}>
                                    <KpiRowCustomColumn
                                        onBlur={calculateTotalPepShelves}
                                        keyboardType="number-pad"
                                        kpiName={t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_PEP_COLD_VAULT_SHELVES}
                                        value={getPepShelvesDisplayVal(
                                            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]
                                        )}
                                        onChangeText={setProposedCVorPerimeter}
                                        redStar
                                    />
                                </View>
                                <View style={styles.KpiRowCustomColumn}>
                                    <KpiRowCustomColumn
                                        onBlur={calculateTotalPepShelves}
                                        keyboardType="number-pad"
                                        kpiName={t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_PEP_PERIMETER_SHELVES}
                                        value={getPepShelvesDisplayVal(
                                            surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]
                                        )}
                                        onChangeText={(t: string) => setProposedCVorPerimeter(t, false)}
                                        redStar
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    <SyncedScrollView
                        id={SyncedScrollViewIdEnum.TWO}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.KpiColumnView}>
                            <View style={{ flexDirection: 'column' }}>
                                <KpiRowMedalData
                                    kpiRequirements={coldVaultData?.SpaceRequirements}
                                    enabledTiers={enabledTier}
                                    round
                                    multiply={PercentageEnum.ONE_HUNDRED}
                                />
                            </View>
                            <View style={{ flexDirection: 'column' }}>
                                <KpiRowMedalData
                                    kpiRequirements={coldVaultData?.SpaceRequirements}
                                    enabledTiers={enabledTier}
                                    multiply={Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]) || 0}
                                    round
                                />
                            </View>
                            {isShowLocationGroup && (
                                <>
                                    <View style={{ flexDirection: 'column' }}>
                                        <KpiRowMedalData kpiRequirements={{}} enabledTiers={enabledTier} />
                                    </View>
                                    <View style={{ flexDirection: 'column' }}>
                                        <KpiRowMedalData kpiRequirements={{}} enabledTiers={enabledTier} />
                                    </View>
                                </>
                            )}
                        </View>
                    </SyncedScrollView>
                </View>

                <View style={styles.shelvesBox}>
                    <CText style={styles.fourteenBlackRegular}>{t.labels.PBNA_MOBILE_CURRENT_LRB_SHELVES}</CText>
                    <View style={styles.shelvesValueBox}>
                        <CText style={styles.sixteenBlackBold}>
                            {surveyQuestions[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]}
                        </CText>
                    </View>
                </View>
                <BottomLine lineStyle={{ marginTop: 15 }} />
            </CollapseContainer>

            <CollapseContainer
                noTopLine
                noBottomLine
                preload
                showContent={showEEContainer}
                setShowContent={setShowEEContainer}
                title={t.labels.PBNA_MOBILE_EXECUTION_ELEMENTS}
            >
                <View style={styles.KpiRowView}>
                    <View style={styles.KpiRowCustomColumn}>
                        {executionData?.map((data: ExecutionAndDiscountData) => (
                            <KpiRowCustomColumn
                                maxLength={3}
                                key={data.id}
                                kpiName={data.kpiName}
                                keyboardType="number-pad"
                                value={surveyQuestions.ExecutionElements[data.kpiName] || ''}
                                onChangeText={(v) => {
                                    wholeNumber.test(v) && setExecutionElements(data.kpiName, v)
                                }}
                            />
                        ))}
                    </View>

                    <SyncedScrollView
                        id={SyncedScrollViewIdEnum.THREE}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={{ flexDirection: 'column' }}>
                            {executionData?.map((data: ExecutionAndDiscountData) => (
                                <KpiRowMedalData
                                    key={data.id}
                                    kpiRequirements={data.kpiRequirements}
                                    enabledTiers={enabledTier}
                                />
                            ))}
                        </View>
                    </SyncedScrollView>
                </View>
                <BottomLine lineStyle={{ marginTop: 20 }} />
            </CollapseContainer>

            <CollapseContainer
                noTopLine
                noBottomLine
                preload
                showContent={showDiscountContainer}
                setShowContent={setShowDiscountContainer}
                title={t.labels.PBNA_MOBILE_DISCOUNT}
            >
                <View style={styles.KpiRowView}>
                    <View style={styles.KpiRowCustomColumn}>
                        {discountData.map((data) => {
                            return (
                                displayRow(enabledTier, data) && (
                                    <KpiRowCustomColumn noInput key={data.id} kpiName={data.kpiName} />
                                )
                            )
                        })}
                    </View>

                    <SyncedScrollView
                        id={SyncedScrollViewIdEnum.FOUR}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={{ flexDirection: 'column' }}>
                            {discountData.map((data) => {
                                return (
                                    displayRow(enabledTier, data) && (
                                        <KpiRowMedalData
                                            key={data.id}
                                            unit={t.labels.PBNA_MOBILE_ORDER_D}
                                            kpiRequirements={data.kpiRequirements}
                                            enabledTiers={enabledTier}
                                        />
                                    )
                                )
                            })}
                        </View>
                    </SyncedScrollView>
                </View>
                <BottomLine lineStyle={{ marginTop: 20 }} />
            </CollapseContainer>

            <CollapseContainer
                noTopLine
                noBottomLine
                preload
                showContent={showEstimatedContainer}
                setShowContent={setShowEstimatedContainer}
                title={t.labels.PBNA_MOBILE_TOTAL_ESTIMATED_SAVINGS}
            >
                <View style={styles.KpiRowView}>
                    <View style={styles.KpiRowCustomColumn}>
                        {estimatedData.map((data) => {
                            const enabledTierCopy = _.cloneDeep(enabledTier)
                            enabledTierCopy.push(t.labels.PBNA_MOBILE_TOTAL)
                            return (
                                displayRow(enabledTierCopy, data) && (
                                    <KpiRowCustomColumn noInput key={data.id} kpiName={data.kpiName} />
                                )
                            )
                        })}
                    </View>

                    <SyncedScrollView
                        id={SyncedScrollViewIdEnum.FIVE}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={{ flexDirection: 'column' }}>
                            {estimatedData.map((data) => {
                                const enabledTierCopy = _.cloneDeep(enabledTier)
                                enabledTierCopy.push(t.labels.PBNA_MOBILE_TOTAL)
                                return (
                                    displayRow(enabledTierCopy, data) && (
                                        <KpiRowMedalData
                                            key={data.id}
                                            unit={t.labels.PBNA_MOBILE_ORDER_D}
                                            kpiRequirements={data.kpiRequirements}
                                            enabledTiers={enabledTier}
                                            maxDigit={5}
                                            isMinus
                                        />
                                    )
                                )
                            })}
                        </View>
                    </SyncedScrollView>
                </View>
                <BottomLine lineStyle={{ marginTop: 20 }} />
            </CollapseContainer>

            <CollapseContainer
                noTopLine
                noBottomLine
                showContent={showRewardsContainer}
                setShowContent={setShowRewardsContainer}
                title={t.labels.PBNA_MOBILE_REWARDS}
            >
                <RewardCardList
                    rewardsData={rewardsData}
                    selectRewards={selectRewards}
                    setSelectRewards={setSelectRewards}
                    handleOpenDetail={getHandleOpenDetailFunc}
                    sharepointToken={sharepointToken}
                />
                <TouchableOpacity
                    hitSlop={styles.addRewardHitSlop}
                    style={styles.addRewardC}
                    onPress={() => setShowAddRewardMedal(true)}
                >
                    <IconBlueAdd style={commonStyle.marginRight_10} height={16} width={16} />
                    <CText style={styles.blueBoldText12}>{t.labels.PBNA_MOBILE_ADD_REWARDS.toLocaleUpperCase()}</CText>
                </TouchableOpacity>
            </CollapseContainer>

            <View style={styles.sellSheetContainer}>
                <CText style={styles.sellSheetHeaderText}>{t.labels.PBNA_MOBILE_SELL_SHEETS.toLocaleUpperCase()}</CText>
                <ScrollView horizontal contentContainerStyle={styles.sellSheetScrollContainer}>
                    {shellSheetsData.map((item) => (
                        <TouchableOpacity
                            disabled={isDisabled}
                            key={item.Id}
                            style={[styles.shellSheetTile, styles.pdfShadow]}
                            onPress={() => {
                                setSellSheetItem(item)
                            }}
                        >
                            <Image
                                source={require('../../../../../../assets/image/ios-doc.png')}
                                style={styles.sellSheetDocIcon}
                            />
                            <CText style={styles.sellSheetText}>{removeFileNameExtension(item.TARGET_NAME__c)}</CText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <AddRewardsModal
                rewardData={getRewardsDataByMedalType(rewardsData)}
                sharepointToken={sharepointToken}
                rewardDetailRef={rewardDetailRef}
                selectRewards={selectRewards}
                setSelectRewards={setSelectRewards}
                visible={showAddRewardMedal}
                setVisible={setShowAddRewardMedal}
            />
            <RewardDetailModal sharepointToken={sharepointToken} cRef={rewardDetailRef} />

            {sellSheetItem && (
                <ContractPDFModal
                    file={{
                        fileName: sellSheetItem.TARGET_NAME__c,
                        link: sellSheetItem.Image_Link__c
                    }}
                    onClose={() => setSellSheetItem(null)}
                    token={sharepointToken}
                />
            )}

            {pogItem && (
                <ContractPDFModal
                    file={{
                        fileName: pogItem.fileName,
                        link: pogItem.link
                    }}
                    onClose={() => setPogItem(null)}
                    token={sharepointToken}
                />
            )}

            <SubTypeModal
                customSubTitle={t.labels.PBNA_MOBILE_ONLY_FIVE_TIERS}
                customTitle={t.labels.PBNA_MOBILE_TIERS.toUpperCase()}
                subTypeArray={tierData}
                showInfoSvg
                customSubTitleStyle={styles.customSubTitleStyle}
                typeModalVisible={showMedals}
                setTypeModalVisible={setShowMedals}
                onCheckClick={setTierStatus}
                onCancelSubType={onCancelMedals}
                updateVisitSubType={updateMedals}
            />
        </SyncedScrollViewContext.Provider>
    )
}

export default Present
