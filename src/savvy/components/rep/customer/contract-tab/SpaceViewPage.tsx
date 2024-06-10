import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import {
    AssessmentIndicators,
    AuditAssessmentIndicators,
    BooleanEnum,
    DatumType,
    FORMStatusEnum,
    IntEnum,
    Languages,
    ShelfSurveyKeyEnum
} from '../../../../enums/Contract'
import { useDispatch, useSelector } from 'react-redux'
import { FORMCard } from '../../../common/FORMCard'
import AuditStyle from '../../../../styles/manager/AuditStyle'
import { BottomLine, KpiRowCustomColumn, SectionTitle } from './Present'
import CText from '../../../../../common/components/CText'
import { renderCDAStoreIcon } from '../CustomerListTile'
import CollapseContainer from '../../../common/CollapseContainer'
import { t } from '../../../../../common/i18n/t'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { RewardData, RewardDetailModal, RewardDetailRefType, getImageSourceObj } from './RewardsModals'
import { useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { setAuditData } from '../../../../redux/action/AuditAction'
import { ExecutionAndDiscountData } from '../../../../hooks/CustomerContractTabHooks'
import { handlePressFormBtnHelper, openFile } from '../../../../helper/rep/StartNewCDAHelper'
import _ from 'lodash'
import { Input } from 'react-native-elements'
import { getSumByVal, inputIntOnChange, wholeNumber } from '../../../../helper/rep/ContractHelper'
import { initAudit } from '../../../../redux/reducer/AuditReducer'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { CURRENT_LANGUAGE } from '../../../../i18n/Utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import { getContractedShelves, multiplyBy100KeepInteger } from '../../../../helper/rep/AuditHelper'
import { singleQuestionTile } from './ContractSpaceReviewPage'

const auditStyles = StyleSheet.create({
    ...AuditStyle
})

const ContractComparison = () => {
    const auditData = useSelector((state: any) => state.AuditReducer.auditData)

    return (
        <View style={auditStyles.comparisonBox}>
            <View style={[commonStyle.flexDirectionRow]}>
                <SectionTitle title={t.labels.PBNA_MOBILE_CONTRACT_COMPARISON} />
            </View>
            <View style={auditStyles.actualBox}>
                <CText style={auditStyles.actualText}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                <View style={[auditStyles.iconSectionBox]}>
                    <View style={auditStyles.iconBox}>
                        {renderCDAStoreIcon(auditData.contract.Signed_Medal_Tier__c, auditStyles.CDAStoreIconSize)}
                    </View>
                    <CText style={auditStyles.contractText}>{t.labels.PBNA_MOBILE_CONTRACT}</CText>
                </View>
            </View>
        </View>
    )
}

interface RewardListProps {
    rewardsData: RewardData[]
    selectRewards: any
    setSelectRewards: Function
    handleOpenDetail: Function
}

const RewardCardList: React.FC<RewardListProps> = ({
    rewardsData,
    selectRewards,
    setSelectRewards,
    handleOpenDetail
}) => {
    const sharepointToken = useSharePointToken(true)

    return (
        <>
            {rewardsData.map((reward: RewardData) => (
                <View key={reward.Id} style={auditStyles.rewardsBox}>
                    <View style={auditStyles.fastImage}>
                        <FastImage
                            style={[auditStyles.rewardCardImg, { backgroundColor: '#FFFFFF' }]}
                            resizeMode="contain"
                            source={getImageSourceObj(reward, sharepointToken)}
                        />
                        <View style={auditStyles.rewardCardMiddleContainer}>
                            <CText style={auditStyles.rewardCardNameText}>{reward.TARGET_NAME__c}</CText>
                            <TouchableOpacity onPress={handleOpenDetail(reward)}>
                                <CText style={auditStyles.blueBoldText12}>
                                    {t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <CCheckBox
                        containerStyle={{ marginRight: -5 }}
                        onPress={() =>
                            setSelectRewards({
                                ...selectRewards,
                                [reward.TARGET_NAME__c]: !selectRewards[reward.TARGET_NAME__c]
                            })
                        }
                        checked={selectRewards[reward.TARGET_NAME__c]}
                    />
                </View>
            ))}
        </>
    )
}
const CustomTitle = ({
    title,
    icon,
    icon1,
    titleStyle,
    viewStyle
}: {
    title: string
    icon?: any
    icon1?: any
    titleStyle?: any
    viewStyle?: any
}) => {
    return (
        <View style={[commonStyle.flexRowAlignCenter, viewStyle || null]}>
            <CText style={titleStyle || auditStyles.backupTitleStyle}>{title}</CText>
            {icon}
            {icon1}
        </View>
    )
}

const TableRowHeader = ({
    children,
    viewStyle,
    isRequired = false
}: {
    children: string
    viewStyle?: any
    isRequired?: boolean
}) => {
    const [isFr, setIsFr] = useState(false)
    useEffect(() => {
        AsyncStorage.getItem(CURRENT_LANGUAGE, (error: any, language: any) => {
            if (!error && language) {
                setIsFr(language === Languages.French.toString())
            }
        })
    }, [])
    return (
        <View style={[auditStyles.tableRowHeaderView, viewStyle || auditStyles.headerInputTitle]}>
            {isRequired && (
                <CText
                    style={[
                        auditStyles.tableRowHeaderRequiredText,
                        isFr ? auditStyles.tableRowFrHeaderRequiredText : null
                    ]}
                >
                    *
                </CText>
            )}
            <CText style={auditStyles.tableRowHeaderText}>{children} </CText>
        </View>
    )
}

const TableRow = ({ item, onChange }: { item: any; onChange: Function }) => {
    const isTotal = item.id === ShelfSurveyKeyEnum.TOTAL
    const getInputStyle = (key: string, initKey: string) => {
        let inputTotalStyle = auditStyles.tableRowInput
        if (isTotal || item[key] === 'NA') {
            inputTotalStyle = auditStyles.tableRowDisabledInput
        } else if (item[key] !== item[initKey]) {
            inputTotalStyle = auditStyles.tableRowYellowInput
        }
        return inputTotalStyle
    }

    const commonInput = (key: string, initKey: string) => {
        return (
            <Input
                key={`${item.id}${key}`}
                editable={!(isTotal || item[key] === 'NA')}
                containerStyle={[getInputStyle(key, initKey), { marginRight: 15 }]}
                returnKeyType="done"
                placeholder={''}
                textAlign="center"
                inputContainerStyle={auditStyles.borderBottomColor0}
                keyboardType="number-pad"
                inputStyle={[auditStyles.tableRowInputStyle, auditStyles.auditTableInputStyle]}
                value={item[key]}
                onChangeText={(text) => {
                    const tmpVal = inputIntOnChange(text, '', IntEnum.NINE_HUNDRED_AND_NINETY_NINE, '')
                    onChange(item.id, key, tmpVal)
                }}
                onBlur={(e: any) => {
                    const tmpVal = e.nativeEvent.text
                    if (!tmpVal) {
                        onChange(item.id, key, '0')
                    }
                }}
            />
        )
    }
    return (
        <View style={[auditStyles.tableRowView, { borderBottomColor: '#fff', paddingHorizontal: 0 }]}>
            <View style={[auditStyles.tableRowInputContainer, { paddingLeft: 22 }]}>
                <CText style={auditStyles.tableRowTitleText}>{item.title}</CText>
            </View>
            <View style={auditStyles.newTableRowHeaderContainer}>
                <Input
                    key={`${item.id}${ShelfSurveyKeyEnum.TOTAL_VOL}`}
                    editable={false}
                    containerStyle={[auditStyles.tableRowDisabledInput, { marginRight: 20 }]}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    maxLength={4}
                    inputContainerStyle={auditStyles.borderBottomColor0}
                    keyboardType="number-pad"
                    inputStyle={[auditStyles.tableRowInputStyle, auditStyles.auditTableInputStyle]}
                    value={item[ShelfSurveyKeyEnum.TOTAL_VOL]}
                />
                {commonInput(ShelfSurveyKeyEnum.PEPSI_VOL, ShelfSurveyKeyEnum.PEPSI)}
                {commonInput(ShelfSurveyKeyEnum.COKE_VOL, ShelfSurveyKeyEnum.COKE)}
                {commonInput(ShelfSurveyKeyEnum.OTHER_VOL, ShelfSurveyKeyEnum.OTHER)}
            </View>
        </View>
    )
}

const RequireBox = ({ value }: { value: string }) => {
    return (
        <View style={auditStyles.requireBox}>
            <CText style={SurveyQuestionsStyle.fourteenBlackBold}>{value}</CText>
        </View>
    )
}

interface SpaceViewPageProps {
    formStatus: FORMStatusEnum.START | FORMStatusEnum.PENDING | FORMStatusEnum.COMPLETE
    missionId: string
    onFormButtonClicked: () => void
    visitId: string
    GSCId: string
    loading: boolean
}

type NumberVal = string | null | undefined | number

export const formatNullValue = (val: NumberVal) => {
    if (val === null || val === undefined) {
        return ''
    }
    return `${val}`
}

export const formatSaveValueForActualDecimalValue = (val: NumberVal) => {
    //  "" will be format as 0 in  SF backend
    if (val === undefined || val === '' || val === null) {
        return null
    }
    return val
}
export const getOmitZeroDigitalRoundNumber = (val: NumberVal) => {
    // if the value is ends with '.0' after round, we will just show as integer.
    const formatNum = formatNullValue(val).length > 0 ? Number(formatNullValue(val)) : 0
    const roundNumberStr = Number(Math.round(formatNum * 10) / 10).toString()
    return roundNumberStr
}
const SpaceViewPage = (props: SpaceViewPageProps) => {
    const { formStatus, missionId, onFormButtonClicked, visitId, GSCId, loading } = props
    const auditData = useSelector((state: any) => state.AuditReducer.auditData) as typeof initAudit
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const perimetersData = useSelector((state: any) => state.AuditReducer.auditData.perimetersData)
    const dispatch = useDispatch()
    const sharepointToken = useSharePointToken(true)
    const rewardDetailRef: RewardDetailRefType = useRef(null)
    const navigation = useNavigation()
    const cof = customerDetail['Account.CUST_UNIQ_ID_VAL__c']
    const [showSOContainer, setShowSOContainer] = useState(true)
    const [showEEContainer, setShowEEContainer] = useState(true)
    const [showCOContainer, setShowCOContainer] = useState(false)
    const [showRewardsContainer, setShowRewardsContainer] = useState(true)
    const [showColdVaultSurvey, setShowColdVaultSurvey] = useState(true)
    const [showShelfSurvey, setShowShelfSurvey] = useState(true)
    const [pogLoading, setPogLoading] = useState<boolean>(false)
    const [isPerimeter, setIsPerimeter] = useState(true)

    useEffect(() => {
        if (perimetersData.VALUE_TYPE__c === DatumType.COLD_VAULT_OR_PERIMETER) {
            setIsPerimeter(false)
        }
        if (perimetersData.VALUE__c === BooleanEnum.VALUE) {
            dispatch(
                setAuditData({
                    ...auditData,
                    contract: {
                        ...auditData.contract,
                        CDA_Space_Checkbox__c: true
                    }
                })
            )
        } else {
            dispatch(
                setAuditData({
                    ...auditData,
                    contract: {
                        ...auditData.contract,
                        CDA_Space_Checkbox__c: false
                    },
                    auditVisitKpi: {
                        ...auditData.auditVisitKpi,
                        [AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT]: {
                            ...auditData.auditVisitKpi[AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT],
                            Id: '',
                            ActualDecimalValue: null,
                            ActualLongStringValue__c: null
                        },
                        [AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT]: {
                            ...auditData.auditVisitKpi[AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT],
                            Id: '',
                            ActualDecimalValue: null,
                            ActualLongStringValue__c: null
                        }
                    }
                })
            )
        }
    }, [perimetersData])

    const setSelectRewards = (selectRewardObj: { [x: string]: boolean | undefined }) =>
        dispatch(
            setAuditData({
                ...auditData,
                selectRewards: selectRewardObj
            })
        )

    const handlePressFormBtn = () => {
        handlePressFormBtnHelper(customerDetail, visitId, missionId, GSCId, onFormButtonClicked, false, '')
    }
    const handleOpenDetail = (reward: RewardData) => () => {
        rewardDetailRef.current?.openModal(reward)
    }

    const setExecutionElements = (executionKpiName: string, value: string) => {
        dispatch(
            setAuditData({
                ...auditData,
                executionInputValue: { ...auditData.executionInputValue, [executionKpiName]: value }
            })
        )
    }

    const handlePressPOGBtn = () => {
        const pogParams = {
            shelf: getContractedShelves(auditData),
            year: auditData.contract.CDA_Year__c,
            customerId: cof,
            countryCode: customerDetail.CountryCode
        }
        openFile(setPogLoading, true, navigation, pogParams)
    }
    const onChangeAnswer = (k: keyof typeof initAudit, v: string) => {
        dispatch(setAuditData({ ...auditData, [k]: v }))
    }

    const onChangeShelfSurveyData = (id: string, key: string, val: string) => {
        const shelfSurveyData = _.cloneDeep(auditData.shelfSurveyData)
        const totalItem: any = shelfSurveyData[0]
        const idx = shelfSurveyData.findIndex((elem) => elem.id === id)
        const updateItem: any = shelfSurveyData[idx]
        const isOther = shelfSurveyData.length - 1 === idx
        updateItem[key] = val
        const getTotal = (shelfSurveyObj: any) => {
            const pepsi = isOther ? 0 : parseInt(shelfSurveyObj[ShelfSurveyKeyEnum.PEPSI_VOL] || '0')
            const coke = isOther ? 0 : parseInt(shelfSurveyObj[ShelfSurveyKeyEnum.COKE_VOL] || '0')
            const other = parseInt(shelfSurveyObj[ShelfSurveyKeyEnum.OTHER_VOL] || '0')
            return (pepsi + coke + other).toString()
        }
        updateItem[ShelfSurveyKeyEnum.TOTAL_VOL] = getTotal(updateItem)
        shelfSurveyData[idx] = updateItem
        const lastShelfSurveyData = shelfSurveyData.filter((elem) => elem.id !== ShelfSurveyKeyEnum.TOTAL)
        totalItem[ShelfSurveyKeyEnum.TOTAL_VOL] = getSumByVal(lastShelfSurveyData, ShelfSurveyKeyEnum.TOTAL_VOL)
        totalItem[key] = getSumByVal(lastShelfSurveyData, '', (elem: any) => {
            return elem[key] === 'NA' ? 0 : parseInt(elem[key] || '0')
        })
        shelfSurveyData[0] = totalItem
        dispatch(
            setAuditData({
                ...auditData,
                shelfSurveyData: shelfSurveyData
            })
        )
    }

    return (
        <View pointerEvents={loading ? 'none' : undefined}>
            <FORMCard variant={formStatus} handlePressFormBtn={handlePressFormBtn} isAudit />
            {auditData.contract?.Id ? (
                <>
                    <ContractComparison />
                    <CollapseContainer
                        noTopLine
                        noBottomLine
                        preload
                        showContent={showSOContainer}
                        setShowContent={setShowSOContainer}
                        title={t.labels.PBNA_MOBILE_SPACE_OVERVIEW}
                    >
                        {isPerimeter && (
                            <TouchableOpacity style={auditStyles.presentCheckBox} disabled>
                                <CCheckBox disabled readonly checked={auditData.contract.CDA_Space_Checkbox__c} />
                                <View style={{ width: 350 }}>
                                    <CText>{t.labels.PBNA_MOBILE_SPACE_OVERVIEW_CHECK_MSG}</CText>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View style={auditStyles.marginRight22}>
                            <View style={[auditStyles.KpiRowView, { justifyContent: 'space-between' }]}>
                                <View style={[auditStyles.KpiRowCustomColumn, auditStyles.flexRowItem]}>
                                    <KpiRowCustomColumn
                                        disabled
                                        kpiRowCustomContainer={auditStyles.flexRowWithSpaceBetween}
                                        kpiName={t.labels.PBNA_MOBILE_CONTRACT_TOTAL_PEP_LRB_PERCENT}
                                        keyboardType={'numeric'}
                                        value={formatNullValue(
                                            multiplyBy100KeepInteger(
                                                auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]
                                                    ?.ActualDecimalValue
                                            )
                                        )}
                                        kpiNameLabelContainer={auditStyles.width110}
                                    />
                                </View>
                                <View style={auditStyles.executionKpiRowMedalData}>
                                    <RequireBox
                                        value={formatNullValue(auditData.requiredKPIValue.requiredShelves.totalPepLRB)}
                                    />
                                </View>
                            </View>
                            <View style={[auditStyles.KpiRowView, { justifyContent: 'space-between' }]}>
                                <View style={[auditStyles.KpiRowCustomColumn, auditStyles.flexRowItem]}>
                                    <KpiRowCustomColumn
                                        disabled
                                        kpiRowCustomContainer={auditStyles.flexRowWithSpaceBetween}
                                        kpiName={t.labels.PBNA_MOBILE_CONTRACT_TOTAL_PEP_LRB_SHELVES}
                                        keyboardType={'numeric'}
                                        value={formatNullValue(
                                            auditData.auditVisitKpi?.[
                                                AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT
                                            ]?.ActualDecimalValue
                                        )}
                                        kpiNameLabelContainer={auditStyles.width110}
                                    />
                                </View>
                                <View style={auditStyles.executionKpiRowMedalData}>
                                    <RequireBox
                                        value={formatNullValue(
                                            auditData.requiredKPIValue.requiredShelves.totalPepLRBShelves
                                        )}
                                    />
                                </View>
                            </View>
                            {auditData.contract.CDA_Space_Checkbox__c && (
                                <>
                                    <View style={[auditStyles.KpiRowView, { justifyContent: 'space-between' }]}>
                                        <View style={[auditStyles.KpiRowCustomColumn, auditStyles.flexRowItem]}>
                                            <KpiRowCustomColumn
                                                disabled
                                                kpiRowCustomContainer={auditStyles.flexRowWithSpaceBetween}
                                                kpiNameLabelContainer={auditStyles.width110}
                                                kpiName={t.labels.PBNA_MOBILE_CONTRACT_PEP_COLD_VAULT_SHELVES}
                                                value={formatNullValue(
                                                    auditData.auditVisitKpi?.[
                                                        AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT
                                                    ]?.ActualDecimalValue
                                                )}
                                            />
                                        </View>
                                        <View style={auditStyles.executionKpiRowMedalData}>
                                            <RequireBox
                                                value={formatNullValue(
                                                    auditData.requiredKPIValue.requiredShelves.PEPColdVaultShelves
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={[auditStyles.KpiRowView, { justifyContent: 'space-between' }]}>
                                        <View style={[auditStyles.KpiRowCustomColumn, auditStyles.flexRowItem]}>
                                            <KpiRowCustomColumn
                                                disabled
                                                kpiRowCustomContainer={auditStyles.flexRowWithSpaceBetween}
                                                kpiNameLabelContainer={auditStyles.width110}
                                                kpiName={t.labels.PBNA_MOBILE_CONTRACT_PEP_PERIMETER_SHELVES}
                                                value={formatNullValue(
                                                    auditData.auditVisitKpi?.[
                                                        AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT
                                                    ]?.ActualDecimalValue
                                                )}
                                            />
                                        </View>
                                        <View style={auditStyles.executionKpiRowMedalData}>
                                            <RequireBox
                                                value={formatNullValue(
                                                    auditData.requiredKPIValue.requiredShelves.PEPPerimeterShelves
                                                )}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}
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
                        <View style={[auditStyles.executionKpiRowView]}>
                            <View style={auditStyles.executionKpiRowCustomColumnBox}>
                                {auditData.executionData?.map((data: ExecutionAndDiscountData) => (
                                    <React.Fragment key={data.id}>
                                        <KpiRowCustomColumn
                                            maxLength={3}
                                            kpiNameLabelContainer={auditStyles.width110}
                                            kpiRowCustomContainer={auditStyles.executionKpiRowCustomContainer}
                                            kpiName={data.kpiName}
                                            onChangeText={(v) =>
                                                wholeNumber.test(v) && setExecutionElements(data.kpiName, v)
                                            }
                                            keyboardType="number-pad"
                                            value={auditData.executionInputValue[data.kpiName] || ''}
                                        />
                                    </React.Fragment>
                                ))}
                            </View>
                            <View style={auditStyles.executionKpiRowMedalData}>
                                {auditData.executionData?.map((data: ExecutionAndDiscountData) => (
                                    <RequireBox
                                        key={data.id}
                                        value={formatNullValue(
                                            auditData.requiredKPIValue.requiredExecutionData[data.kpiName]
                                        )}
                                    />
                                ))}
                            </View>
                        </View>
                        <BottomLine lineStyle={{ marginTop: 20 }} />
                    </CollapseContainer>
                    <CollapseContainer
                        noTopLine
                        noBottomLine
                        preload
                        showContent={showCOContainer}
                        setShowContent={setShowCOContainer}
                        title={t.labels.PBNA_MOBILE_COMPETITOR_OVERVIEW}
                    >
                        <View>
                            <View style={[auditStyles.KpiRowView, auditStyles.competitorContainer]}>
                                <KpiRowCustomColumn
                                    kpiRowCustomContainer={auditStyles.actualCompetitorCustomContainer}
                                    disabled
                                    kpiName={t.labels.PBNA_MOBILE_ACTUAL_COMP}
                                    keyboardType={'numeric'}
                                    value={formatNullValue(
                                        multiplyBy100KeepInteger(
                                            auditData.auditVisitKpi?.[AuditAssessmentIndicators.ACTUAL_COMP]
                                                ?.ActualDecimalValue
                                        )
                                    )}
                                    kpiNameLabelContainer={{ width: 235 }}
                                />
                            </View>
                            <View style={[auditStyles.KpiRowView, auditStyles.competitorContainer]}>
                                <KpiRowCustomColumn
                                    kpiRowCustomContainer={auditStyles.actualCompetitorCustomContainer}
                                    disabled
                                    kpiName={t.labels.PBNA_MOBILE_ACTUAL_COMP_SHELVES}
                                    keyboardType={'numeric'}
                                    value={formatNullValue(
                                        auditData.auditVisitKpi?.[AuditAssessmentIndicators.ACTUAL_COMP_SHELVES]
                                            ?.ActualDecimalValue
                                    )}
                                    kpiNameLabelContainer={{ width: 235 }}
                                />
                            </View>
                        </View>
                        <BottomLine lineStyle={{ marginTop: 15 }} />
                    </CollapseContainer>
                    <CollapseContainer
                        noTopLine
                        noBottomLine
                        showContent={showRewardsContainer}
                        setShowContent={setShowRewardsContainer}
                        title={t.labels.PBNA_MOBILE_REWARDS}
                    >
                        <RewardCardList
                            rewardsData={auditData?.requiredKPIValue?.requiredReward || []}
                            selectRewards={auditData.selectRewards}
                            setSelectRewards={setSelectRewards}
                            handleOpenDetail={handleOpenDetail}
                        />
                    </CollapseContainer>
                    <TouchableOpacity disabled={pogLoading} style={auditStyles.POGBox} onPress={handlePressPOGBtn}>
                        <Image
                            source={require('../../../../../../assets/image/ios-doc.png')}
                            style={auditStyles.docImage}
                        />
                        <CText style={auditStyles.POGText}>
                            {t.labels.PBNA_MOBILE_ATTACHED_CUSTOMER_CDA_PLANOGRAM}
                        </CText>
                    </TouchableOpacity>
                    <RewardDetailModal sharepointToken={sharepointToken} cRef={rewardDetailRef} />
                </>
            ) : (
                // General Audit No Contract
                auditData.auditVisit?.Id && (
                    <>
                        <CollapseContainer
                            noTopLine
                            showContent={showColdVaultSurvey}
                            setShowContent={setShowColdVaultSurvey}
                            titleComponents={
                                <CustomTitle
                                    title={t.labels.PBNA_MOBILE_CDA_COLD_VAULT_SURVEY}
                                    icon={
                                        <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={auditStyles.imageIcon} />
                                    }
                                />
                            }
                            title={''}
                        >
                            <CustomTitle
                                title={t.labels.PBNA_MOBILE_DOOR_SURVEY}
                                titleStyle={auditStyles.customTitleStyle}
                                viewStyle={auditStyles.customViewStyle}
                            />
                            <View style={[auditStyles.tableView, commonStyle.marginBottom_15]}>
                                {singleQuestionTile({
                                    text: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_DOOR_Q,
                                    answer: auditData[AssessmentIndicators.DOOR_SURVEY],
                                    setAnswer: (text: string) => onChangeAnswer(AssessmentIndicators.DOOR_SURVEY, text),
                                    longText: true,
                                    initAnswer:
                                        auditData.auditVisitKpiForm[AssessmentIndicators.DOOR_SURVEY].ActualDecimalValue
                                })}
                            </View>
                        </CollapseContainer>
                        <CollapseContainer
                            noTopLine
                            showContent={showShelfSurvey}
                            setShowContent={setShowShelfSurvey}
                            titleComponents={
                                <CustomTitle
                                    title={t.labels.PBNA_MOBILE_SHELF_SURVEY}
                                    icon={
                                        <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={auditStyles.imageIcon} />
                                    }
                                />
                            }
                            title={''}
                        >
                            <View>
                                <View style={[auditStyles.revertNewContainer]}>
                                    <TouchableOpacity style={auditStyles.tableRowHeaderContainer} />
                                    <View style={auditStyles.newTableRowHeaderContainer}>
                                        <TableRowHeader viewStyle={auditStyles.headerTotalTitle}>
                                            {t.labels.PBNA_MOBILE_TOTAL}
                                        </TableRowHeader>
                                        <TableRowHeader isRequired>{t.labels.PBNA_MOBILE_PEPSI_SHELVES}</TableRowHeader>
                                        <TableRowHeader>{t.labels.PBNA_MOBILE_CDA_COKE_SHELVES}</TableRowHeader>
                                        <TableRowHeader>{t.labels.PBNA_MOBILE_CDA_OTHER_SHELVES}</TableRowHeader>
                                    </View>
                                </View>
                                <View style={auditStyles.tableView}>
                                    {auditData.shelfSurveyData.slice(0, 1).map((item: any) => {
                                        return <TableRow key={item.id} item={item} onChange={onChangeShelfSurveyData} />
                                    })}
                                </View>
                                <CustomTitle
                                    title={t.labels.PBNA_MOBILE_CDA_CATEGORY_BREAKDOWN}
                                    titleStyle={auditStyles.customTitleStyle}
                                    viewStyle={[auditStyles.customViewStyle, commonStyle.marginTop_15]}
                                />
                                <View style={auditStyles.tableView}>
                                    {auditData.shelfSurveyData.slice(1, 10).map((item: any) => {
                                        return <TableRow key={item.id} item={item} onChange={onChangeShelfSurveyData} />
                                    })}
                                </View>
                                <CustomTitle
                                    title={t.labels.PBNA_MOBILE_OTHER}
                                    titleStyle={auditStyles.customTitleStyle}
                                    viewStyle={[auditStyles.customViewStyle, commonStyle.marginTop_15]}
                                />
                                <View style={auditStyles.tableView}>
                                    {auditData.shelfSurveyData.slice(10, 12).map((item: any) => {
                                        return <TableRow key={item.id} item={item} onChange={onChangeShelfSurveyData} />
                                    })}
                                </View>
                            </View>
                        </CollapseContainer>
                    </>
                )
            )}
        </View>
    )
}

export default SpaceViewPage
