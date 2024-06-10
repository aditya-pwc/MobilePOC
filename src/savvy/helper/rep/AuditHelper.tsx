import React, { Dispatch } from 'react'

import {
    AssessmentIndicators,
    AuditAssessmentIndicators,
    CSVApiKey,
    ContractAndAuditSubTab,
    FormNotificationType,
    GeneralAuditAssessmentIndicators,
    GeneralAuditSumKpi,
    IntervalTime,
    PercentageEnum,
    ShelfSurveyKeyEnum,
    StepVal,
    getMedalMap
} from '../../enums/Contract'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import { setAuditData, setButtonBeingClicked } from '../../redux/action/AuditAction'
import { initAudit } from '../../redux/reducer/AuditReducer'
import { restApexCommonCall, restDataCommonCall, syncDownObj, syncUpObjUpdateFromMem } from '../../api/SyncUtils'
import { filterExistFields, getAllFieldsByObjName } from '../../utils/SyncUtils'
import { getStringValue } from '../../utils/LandingUtils'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { refreshCustomerDetailData } from './ContractHelper'
import { VisitStatus, VisitSubType } from '../../enums/Visit'
import _ from 'lodash'
import { AuditScreenDataParams, getAuditScreenData } from '../../hooks/AuditHooks'
import { Alert } from 'react-native'
import { getAuditHtml, getGeneralAuditHtml } from '../../components/rep/customer/contract-tab/ContractPdfHtml'
import { CommonApi } from '../../../common/api/CommonApi'
import { SharePointTokenManager } from './SharePointTokenHelper'
import { base64ToBlob } from '../../../common/utils/CommonUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import moment from 'moment'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { t } from '../../../common/i18n/t'
import { ScoreState } from '../../components/rep/customer/contract-tab/SpaceBreakdownPage'
import {
    formatNullValue,
    formatSaveValueForActualDecimalValue
} from '../../components/rep/customer/contract-tab/SpaceViewPage'
import { ActiveTabName } from '../../pages/rep/customer/CustomerDetailScreen'
import { SoupService } from '../../service/SoupService'
import { NUMBER_VALUE } from '../../enums/MerchandiserEnums'

interface RetailStoreData {
    Id: string
    Street: string
    City: string
    PostalCode: string
    State: string
    StateCode: string
    Name: string
    Account: {
        // eslint-disable-next-line camelcase
        LOC_PROD_ID__c: string
        Name: string
        Id: string
        // eslint-disable-next-line camelcase
        IsCDACustomer__c: boolean
        // eslint-disable-next-line camelcase
        IsOTSCustomer__c: boolean
        // eslint-disable-next-line camelcase
        CDA_Medal__c: string
        // eslint-disable-next-line camelcase
        CUST_UNIQ_ID_VAL__c: string
    }
    CountryCode: string
    Country: string
}

const medalMap = getMedalMap()

export const handlePressCancel = (activeStep: string, setActiveStep: Function) => {
    if (activeStep === StepVal.TWO) {
        setActiveStep(StepVal.ONE)
    }
    if (activeStep === StepVal.THREE) {
        setActiveStep(StepVal.TWO)
    }
}

export const getExecutionElementsData = (auditData: any) =>
    auditData.executionData.map((elem: any) => {
        const actualVal = parseFloat(auditData.executionInputValue[elem.kpiName] || '0')
        const requiredVal = parseFloat(elem.kpiRequirements[auditData.contract.Signed_Medal_Tier__c] || '0')
        const differenceVal = actualVal - requiredVal
        const isFloat = (val: number) => {
            const arr = val.toString().split('.')
            return arr.length === 1 ? val.toString() : val.toFixed(1)
        }
        return {
            id: elem.kpiName,
            title: elem.kpiName,
            VALUE_TYPE__c: elem.valueType,
            actualVal,
            actual: isFloat(actualVal),
            requiredVal,
            required: isFloat(requiredVal),
            differenceVal,
            difference: isFloat(differenceVal)
        }
    })

interface SpaceBreakdownPageApiItem {
    id: string
    title: string
    actualKey: AuditAssessmentIndicators
    requiredKey: AuditAssessmentIndicators
    csvApiKey: CSVApiKey
}

const spaceBreakdownListWithContract: () => SpaceBreakdownPageApiItem[] = () => {
    return [
        {
            id: 'CSD',
            title: t.labels.PBNA_MOBILE_CDA_CSD,
            actualKey: AuditAssessmentIndicators.CSD_ACTUAL,
            requiredKey: AuditAssessmentIndicators.CSD_REQUIRED,
            csvApiKey: CSVApiKey.CSD
        },
        {
            id: 'Isotonic',
            title: t.labels.PBNA_MOBILE_CDA_ISOTONIC,
            actualKey: AuditAssessmentIndicators.ISOTONIC_ACTUAL,
            requiredKey: AuditAssessmentIndicators.ISOTONIC_REQUIRED,
            csvApiKey: CSVApiKey.ISOTONIC
        },
        {
            id: 'Tea',
            title: t.labels.PBNA_MOBILE_CDA_TEA,
            actualKey: AuditAssessmentIndicators.TEA_ACTUAL,
            requiredKey: AuditAssessmentIndicators.TEA_REQUIRED,
            csvApiKey: CSVApiKey.TEA
        },
        {
            id: 'Coffee',
            title: t.labels.PBNA_MOBILE_CDA_COFFEE,
            actualKey: AuditAssessmentIndicators.COFFEE_ACTUAL,
            requiredKey: AuditAssessmentIndicators.COFFEE_REQUIRED,
            csvApiKey: CSVApiKey.COFFEE
        },
        {
            id: 'Energy',
            title: t.labels.PBNA_MOBILE_CDA_ENERGY,
            actualKey: AuditAssessmentIndicators.ENERGY_ACTUAL,
            requiredKey: AuditAssessmentIndicators.ENERGY_REQUIRED,
            csvApiKey: CSVApiKey.ENERGY
        },
        {
            id: 'Enhanced Water',
            title: t.labels.PBNA_MOBILE_CDA_ENHANCED_WATER,
            actualKey: AuditAssessmentIndicators.ENHANCED_WATER_ACTUAL,
            requiredKey: AuditAssessmentIndicators.ENHANCED_WATER_REQUIRED,
            csvApiKey: CSVApiKey.ENHANCED_WATER
        },
        {
            id: 'Water',
            title: t.labels.PBNA_MOBILE_CDA_WATER,
            actualKey: AuditAssessmentIndicators.WATER_ACTUAL,
            requiredKey: AuditAssessmentIndicators.WATER_REQUIRED,
            csvApiKey: CSVApiKey.WATER
        },
        {
            id: 'Juice Drinks',
            title: t.labels.PBNA_MOBILE_CDA_JUICE_DRINKS,
            actualKey: AuditAssessmentIndicators.JUICE_DRINKS_ACTUAL,
            requiredKey: AuditAssessmentIndicators.JUICE_DRINKS_REQUIRED,
            csvApiKey: CSVApiKey.JUICE_DRINKS
        },
        {
            id: 'Protein',
            title: t.labels.PBNA_MOBILE_CDA_PROTEIN,
            actualKey: AuditAssessmentIndicators.PROTEIN_ACTUAL,
            requiredKey: AuditAssessmentIndicators.PROTEIN_REQUIRED,
            csvApiKey: CSVApiKey.PROTEIN
        },
        {
            id: 'Chilled Juice',
            title: t.labels.PBNA_MOBILE_CDA_CHILLED_JUICE,
            actualKey: AuditAssessmentIndicators.CHILLED_JUICE_ACTUAL,
            requiredKey: AuditAssessmentIndicators.CHILLED_JUICE_REQUIRED,
            csvApiKey: CSVApiKey.CHILLED_JUICE
        }
    ]
}

export const getExecutionData = (auditData: typeof initAudit, spaceBreakdownRequired: any) =>
    spaceBreakdownListWithContract().map((elem: SpaceBreakdownPageApiItem) => {
        const actualSFVal = auditData.auditVisitKpi?.[elem.actualKey]?.ActualDecimalValue
        const requiredSFVal = spaceBreakdownRequired?.[elem.id]
        const actualIsNullOrUndefined = _.isNull(actualSFVal) || _.isUndefined(actualSFVal)
        const requiredIsNullOrUndefined = _.isNull(requiredSFVal) || _.isUndefined(requiredSFVal)
        const actualVal = _.round(parseFloat(actualSFVal || '0'), 1)
        const requiredVal = _.round(parseFloat(requiredSFVal || '0'), 1)
        const differenceVal = _.round(actualVal - requiredVal, 1)
        return {
            id: elem.id,
            title: elem.title,
            actualVal,
            actual: actualIsNullOrUndefined ? '-' : actualVal.toString(),
            requiredVal,
            required: requiredIsNullOrUndefined ? '-' : requiredVal.toString(),
            differenceVal: actualIsNullOrUndefined || requiredIsNullOrUndefined ? null : differenceVal,
            difference: actualIsNullOrUndefined || requiredIsNullOrUndefined ? '-' : differenceVal.toString() // display value
        }
    })
export const resetAuditAndRefreshContractTab = (
    dispatch: Dispatch<any>,
    navigation: any,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    customerDetail: any
) => {
    dispatch(setAuditData(initAudit))
    refreshCustomerDetailData(setRefreshFlag, customerDetail)
    dispatch(setButtonBeingClicked(''))
    navigation.goBack()
}

export const updateRetailVisitKpi = async ({
    syncUpUpdateDataArr,
    syncUpUpdateFields
}: {
    syncUpUpdateDataArr: any[]
    syncUpUpdateFields: any[]
}) => {
    try {
        await syncUpObjUpdateFromMem(
            'RetailVisitKpi',
            filterExistFields('RetailVisitKpi', syncUpUpdateDataArr, syncUpUpdateFields),
            false
        )
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'Space-Review-updateRetailVisitKpi',
            `Update Retail Visit Kpi failed: ${getStringValue(error)}`
        )
    }
}
const decimalsRound = (number: number, decimals = 0) => {
    const strNum = '' + number
    const negConfig = number < 0 ? -1 : 1
    const dotIndex = strNum.indexOf('.')
    const start = dotIndex + decimals + 1
    const dec = Number.parseInt(strNum.substring(start, start + 1))
    const remainder = dec >= 5 ? 1 / Math.pow(10, decimals) : 0
    const result = Number.parseFloat(strNum.substring(0, start)) + remainder * negConfig
    return Number(result.toFixed(decimals))
}
export const multiplyBy100KeepInteger = (number: null | number) => {
    if (number === null) {
        return ''
    }
    return parseInt((decimalsRound(number, NUMBER_VALUE.TWO_NUM) * PercentageEnum.ONE_HUNDRED).toString())
}

const getComplianceStatus = (auditData: any) => {
    const complianceData = [
        {
            actual: multiplyBy100KeepInteger(
                auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]?.ActualDecimalValue
            ),
            required: parseFloat(auditData.coldVaultData.VALUE__c || '0') * PercentageEnum.ONE_HUNDRED
        },
        {
            actual: Number(
                auditData.auditVisitKpi[AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]?.ActualDecimalValue || 0
            ),
            required:
                parseFloat(auditData.coldVaultData.VALUE__c || '0') *
                parseFloat(auditData.CDAVisitKpi[AssessmentIndicators.TOTAL_LRB_SHELVES]?.ActualDecimalValue || '0')
        }
    ]
    const executionData = auditData.executionData.map((elem: any) => {
        return {
            actual: parseFloat(auditData.executionInputValue[elem.kpiName] || '0'),
            required: parseFloat(elem.kpiRequirements[auditData.contract.Signed_Medal_Tier__c] || '0')
        }
    })
    const isFloat = (val: any) => {
        const arr = val.toString().split('.')
        return arr.length === 1 ? val.toString() : val.toFixed(1)
    }
    const isComplianceData = complianceData.every((elem: any) => isFloat(elem.actual) - isFloat(elem.required) >= 0)
    const isExecutionData = executionData.every((elem: any) => isFloat(elem.actual) - isFloat(elem.required) >= 0)
    return (
        isComplianceData &&
        isExecutionData &&
        Object.keys(auditData.selectRewards).every((key) => auditData.selectRewards[key])
    )
}
const getUpdateShelfSurveyDataKPIs = (auditData: typeof initAudit) => {
    const lstGeneralAuditVisitKPIs = Object.keys(GeneralAuditAssessmentIndicators).map((key: string) => {
        return GeneralAuditAssessmentIndicators[key as keyof typeof GeneralAuditAssessmentIndicators]
    }) as any[]
    const lastShelfSurveyData = auditData.shelfSurveyData
        .filter((elem) => elem.id !== ShelfSurveyKeyEnum.TOTAL)
        .filter((elem) => {
            const idx = lstGeneralAuditVisitKPIs.findIndex((key) => key === elem.id)
            return idx === -1
        })
    const dataToSyncUp: any = lastShelfSurveyData.map((elem) => {
        const obj: any = {}
        if (
            elem[ShelfSurveyKeyEnum.PEPSI_VOL] !== elem[ShelfSurveyKeyEnum.PEPSI] &&
            elem[ShelfSurveyKeyEnum.PEPSI_VOL] !== 'NA'
        ) {
            obj[ShelfSurveyKeyEnum.PEPSI] = parseInt(elem[ShelfSurveyKeyEnum.PEPSI_VOL])
        }
        if (
            elem[ShelfSurveyKeyEnum.COKE_VOL] !== elem[ShelfSurveyKeyEnum.COKE] &&
            elem[ShelfSurveyKeyEnum.COKE_VOL] !== 'NA'
        ) {
            obj[ShelfSurveyKeyEnum.COKE] = parseInt(elem[ShelfSurveyKeyEnum.COKE_VOL])
        }
        if (elem[ShelfSurveyKeyEnum.OTHER_VOL] !== elem[ShelfSurveyKeyEnum.OTHER]) {
            obj[ShelfSurveyKeyEnum.OTHER] = parseInt(elem[ShelfSurveyKeyEnum.OTHER_VOL])
        }
        return {
            Id: elem.id,
            ActualLongStringValue__c: _.isEmpty(obj) ? null : JSON.stringify(obj)
        }
    })

    const sumKPI = auditData.shelfSurveyData.find((elem) => elem.id === ShelfSurveyKeyEnum.TOTAL)
    if (sumKPI) {
        dataToSyncUp.push({
            Id: auditData.auditVisitKpiUser[GeneralAuditSumKpi.TOTAL_LRB_SHELVES]?.Id,
            ActualDecimalValue: formatSaveValueForActualDecimalValue(sumKPI[ShelfSurveyKeyEnum.TOTAL_VOL])
        })
        dataToSyncUp.push({
            Id: auditData.auditVisitKpiUser[GeneralAuditSumKpi.TOTAL_PEP_SHELVES]?.Id,
            ActualDecimalValue: formatSaveValueForActualDecimalValue(sumKPI[ShelfSurveyKeyEnum.PEPSI_VOL])
        })
        dataToSyncUp.push({
            Id: auditData.auditVisitKpiUser[GeneralAuditSumKpi.TOTAL_COKE_SHELVES]?.Id,
            ActualDecimalValue: formatSaveValueForActualDecimalValue(sumKPI[ShelfSurveyKeyEnum.COKE_VOL])
        })
        dataToSyncUp.push({
            Id: auditData.auditVisitKpiUser[GeneralAuditSumKpi.TOTAL_OTHER_SHELVES]?.Id,
            ActualDecimalValue: formatSaveValueForActualDecimalValue(sumKPI[ShelfSurveyKeyEnum.OTHER_VOL])
        })
    }
    return dataToSyncUp
}

interface CSVKpiData {
    Shelf?: string
    CSD?: string
    Isotonic?: string
    Energy?: string
    Water?: string
    'Enhanced Water'?: string
    Coffee?: string
    'Juice Drinks'?: string
    Tea?: string
    Protein?: string
    'Chilled Juice'?: string
}

export interface SpaceBreakdownRequired extends CSVKpiData {
    error?: string
}

const getSpaceBreakDownFormKpiSyncList = (auditData: typeof initAudit, formRequiredKpi: CSVKpiData) => {
    return spaceBreakdownListWithContract().map((kpiItem: SpaceBreakdownPageApiItem) => {
        const csvApiKey = kpiItem.csvApiKey
        const requiredKpi = kpiItem.requiredKey
        return {
            Id: auditData.auditVisitKpi?.[requiredKpi]?.Id,
            ActualDecimalValue: formRequiredKpi?.[csvApiKey] || null
        }
    })
}

export const checkShowOptimizationOrStash = (auditData: typeof initAudit, spaceBreakdownRequired: any) => {
    const hasActual = Object.values(auditData.auditVisitKpi).some((item: any) => item.ActualDecimalValue != null)
    const hasRequired = !spaceBreakdownRequired.error
    return hasActual && hasRequired
}

export const syncAuditKPIs = async ({
    auditData,
    step,
    spaceBreakdownRequired
}: {
    auditData: typeof initAudit
    step: StepVal
    spaceBreakdownRequired: SpaceBreakdownRequired
}) => {
    try {
        if (auditData.contract?.Id) {
            const rewardsDataKpiObj = {
                Id: auditData.auditVisitKpi[AuditAssessmentIndicators.REWARDS_AUDITED].Id,
                ActualLongStringValue__c: JSON.stringify(auditData.selectRewards)
            }
            const executionKpiObj = {
                Id: auditData.auditVisitKpi[AuditAssessmentIndicators.EXECUTION_ELEMENTS_AUDITED].Id,
                ActualLongStringValue__c: JSON.stringify(auditData.executionInputValue)
            }

            let syncList: any = []
            if (medalMap[auditData.contract.Signed_Medal_Tier__c]) {
                const optimizationScore = {
                    Id: auditData.auditVisitKpi?.[AuditAssessmentIndicators.OPTIMIZATION_SCORE]?.Id,
                    ActualDecimalValue: formatSaveValueForActualDecimalValue(
                        checkShowOptimizationOrStash(auditData, spaceBreakdownRequired)
                            ? auditData.executionDataScore.OptimizationScore
                            : null
                    )
                }
                const contractShelvesObj = {
                    Id: auditData.auditVisitKpi?.[AuditAssessmentIndicators.CONTRACTED_SHELVES]?.Id,
                    ActualDecimalValue: formatSaveValueForActualDecimalValue(auditData.contractedShelves)
                }

                if (step === StepVal.ONE) {
                    syncList = [rewardsDataKpiObj, executionKpiObj]
                }
                if (step === StepVal.TWO) {
                    syncList = [
                        optimizationScore,
                        contractShelvesObj,
                        // Audit step 2 space Breakdown
                        ...getSpaceBreakDownFormKpiSyncList(auditData, spaceBreakdownRequired)
                    ]
                }
            } else {
                const executionKpiObjScore = {
                    Id: auditData.auditVisitKpi?.[AuditAssessmentIndicators.EXECUTION_SCORE]?.Id,
                    ActualDecimalValue: formatSaveValueForActualDecimalValue(
                        auditData.executionDataScore.executionScore
                    )
                }
                syncList = [rewardsDataKpiObj, executionKpiObj, executionKpiObjScore]
            }
            await syncUpObjUpdateFromMem(
                'RetailVisitKpi',
                filterExistFields('RetailVisitKpi', syncList, ['Id', 'ActualDecimalValue', 'ActualLongStringValue__c']),
                false
            )

            await syncUpObjUpdateFromMem('Visit', [
                {
                    Id: auditData.auditVisit.Id,
                    CDA_Compliance__c:
                        auditData.auditVisit.Status__c === VisitStatus.PENDING_REVIEW
                            ? getComplianceStatus(auditData)
                            : null,
                    InstructionDescription: auditData.auditVisit.InstructionDescription || ''
                }
            ])
        } else {
            if (
                auditData.auditVisitKpiUser[AssessmentIndicators.DOOR_SURVEY].Id ||
                auditData.auditVisitKpiUser[AssessmentIndicators.DOOR_SURVEY].id
            ) {
                const doorSurveyKPIObj = {
                    Id:
                        auditData.auditVisitKpiUser[AssessmentIndicators.DOOR_SURVEY].Id ||
                        auditData.auditVisitKpiUser[AssessmentIndicators.DOOR_SURVEY].id,
                    ActualDecimalValue: formatSaveValueForActualDecimalValue(
                        auditData[AssessmentIndicators.DOOR_SURVEY]
                    )
                }
                await syncUpObjUpdateFromMem(
                    'RetailVisitKpi',
                    filterExistFields('RetailVisitKpi', [doorSurveyKPIObj], ['Id', 'ActualDecimalValue']),
                    false
                )
            }
            const updateRetailVisitKPIs = getUpdateShelfSurveyDataKPIs(auditData)
            if (updateRetailVisitKPIs.length > 0) {
                await syncUpObjUpdateFromMem('RetailVisitKpi', updateRetailVisitKPIs, false)
            }
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'handleSubmitAudit-SyncAuditKPIs',
            `Sync Audit KPI failed: ${getStringValue(error)}`
        )
    }
}

const createAuditPDF = async (htmlContent: string) => {
    const pdfFile = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: new Date().getTime().toString(),
        pageSize: 'Letter',
        directory: 'Documents',
        padding: 0,
        bgColor: '#ffffff',
        base64: true
    })
    return pdfFile.base64 as string
}

const getSharepointUrl = (fileName: string, isVisitSubtypeGeneralAudit: boolean) =>
    CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API +
    (isVisitSubtypeGeneralAudit
        ? CommonApi.PBNA_MOBILE_PDF_GENERAL_AUDITS
        : CommonApi.PBNA_MOBILE_PDF_POST_CDA_AUDITS) +
    fileName +
    '.pdf:/content'

const uploadAuditToSp = async (htmlContent: string, sharepointUrl: string) => {
    const pdfBs64 = await createAuditPDF(htmlContent)
    const tokenManager = SharePointTokenManager.getInstance()
    const sharepointToken = await tokenManager.getToken()
    const blob = await base64ToBlob(pdfBs64)
    const spUrl = encodeURI(sharepointUrl)
    const res = await fetch(spUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${sharepointToken}`,
            'Content-Type': 'application/octet-stream'
        },
        body: blob
    })
    if (!res.ok) {
        throw new Error(res.toString())
    }
}

const submitAudit = async (
    auditData: typeof initAudit,
    customerDetail: any,
    retailStore: any,
    spaceBreakdownRequired: any,
    isPostAudit = true
) => {
    const isVisitSubtypeGeneralAudit = auditData.auditVisit.Visit_Subtype__c === VisitSubType.GENERAL_AUDIT
    try {
        const fileName =
            (retailStore?.customerId || customerDetail['Account.CUST_UNIQ_ID_VAL__c']) +
            (isVisitSubtypeGeneralAudit ? '_General Audit_' : '_Post CDA Audit_') +
            moment(auditData.auditVisit.LastModifiedDate).format(TIME_FORMAT.Y_MM_DD)
        const sharepointUrl = getSharepointUrl(fileName, isVisitSubtypeGeneralAudit)
        const html = isPostAudit
            ? getAuditHtml(auditData, customerDetail, retailStore, spaceBreakdownRequired)
            : getGeneralAuditHtml(auditData, customerDetail, retailStore)
        await uploadAuditToSp(html, sharepointUrl)
        const visitObj = {
            Id: auditData.auditVisit.Id,
            CDA_Audit_Sharepoint_URL__c: sharepointUrl,
            Status__c: VisitStatus.COMPLETE,
            InstructionDescription: auditData.auditVisit.InstructionDescription || ''
        }
        await syncUpObjUpdateFromMem('Visit', [visitObj])

        return true
    } catch (error) {
        Alert.alert(
            (isVisitSubtypeGeneralAudit ? t.labels.PBNA_MOBILE_GENERAL : t.labels.PBNA_MOBILE_POST_CDA) +
                ' ' +
                t.labels.PBNA_MOBILE_AUDIT_SUBMIT_FAIL
        )
        storeClassLog(Log.MOBILE_ERROR, `Upload-Audit-Contract`, `Submit Audit Fail` + ErrorUtils.error2String(error))
    }
}

interface AuditFormParams {
    auditData: typeof initAudit
    activeStep: string
    setActiveStep: React.Dispatch<React.SetStateAction<StepVal>>
    navigation: any
    dispatch: any
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    customerDetail: any
    retailStore: any
    setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>
    spaceBreakdownRequired: any
}
export const handleSubmitAudit = async ({
    auditData,
    activeStep,
    setActiveStep,
    navigation,
    dispatch,
    setRefreshFlag,
    customerDetail,
    retailStore,
    setShowSuccess,
    spaceBreakdownRequired
}: AuditFormParams) => {
    switch (activeStep) {
        case StepVal.ONE:
            if (auditData?.contract?.Id) {
                await syncAuditKPIs({ auditData, step: StepVal.ONE, spaceBreakdownRequired })
                if (medalMap[auditData.contract.Signed_Medal_Tier__c]) {
                    setActiveStep(StepVal.TWO)
                } else {
                    await submitAudit(auditData, customerDetail, retailStore, spaceBreakdownRequired).then(
                        (success) => {
                            if (success) {
                                setShowSuccess(true)
                                setTimeout(() => {
                                    setActiveStep(StepVal.ONE)
                                    resetAuditAndRefreshContractTab(
                                        dispatch,
                                        navigation,
                                        setRefreshFlag,
                                        customerDetail
                                    )
                                }, 3000)
                            }
                        }
                    )
                }
            } else {
                // For General Audit No Contract
                await syncAuditKPIs({ auditData, step: StepVal.ONE, spaceBreakdownRequired })
                await submitAudit(auditData, customerDetail, retailStore, spaceBreakdownRequired, false).then(
                    (success) => {
                        if (success) {
                            setShowSuccess(true)
                            setTimeout(() => {
                                setActiveStep(StepVal.ONE)
                                resetAuditAndRefreshContractTab(dispatch, navigation, setRefreshFlag, customerDetail)
                            }, 3000)
                        }
                    }
                )
            }

            break
        case StepVal.TWO:
            await syncAuditKPIs({ auditData, step: StepVal.TWO, spaceBreakdownRequired })
            dispatch(
                setAuditData({
                    ...auditData,
                    auditVisit: {
                        ...auditData.auditVisit,
                        CDA_Compliance__c:
                            auditData.auditVisit.Status__c === VisitStatus.PENDING_REVIEW &&
                            getComplianceStatus(auditData)
                    }
                })
            )
            setActiveStep(StepVal.THREE)
            break
        case StepVal.THREE:
            await submitAudit(auditData, customerDetail, retailStore, spaceBreakdownRequired).then((success) => {
                if (success) {
                    setShowSuccess(true)
                    setTimeout(() => {
                        setActiveStep(StepVal.ONE)
                        resetAuditAndRefreshContractTab(dispatch, navigation, setRefreshFlag, customerDetail)
                    }, 3000)
                }
            })
            break
        default:
            break
    }
}

export const handleAuditVisitKpiIsNull = ({
    customerDetail,
    locProdId,
    auditVisitId,
    setFormStatus,
    dispatch
}: AuditScreenDataParams) => {
    Alert.alert(t.labels.PBNA_MOBILE_LOW_CONNECTIVITY, undefined, [
        {
            text: t.labels.PBNA_MOBILE_CANCEL
        },
        {
            text: t.labels.PBNA_MOBILE_RETRY,
            onPress: () => {
                getAuditScreenData({ customerDetail, locProdId, auditVisitId, setFormStatus, dispatch })
            }
        }
    ])
}
export const getScore = async ({ params }: { params: any }): Promise<ScoreState> => {
    try {
        const results = await restApexCommonCall('calculateOptimizationScore/', 'POST', params)
        const score: ScoreState = JSON.parse(results.data)
        return score
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `getScore-Audit`,
            `Get Audit Score Fail` + ErrorUtils.error2String(error),
            `params: ` + ErrorUtils.error2String(params)
        )
        return {
            executionScore: '',
            OptimizationScore: ''
        }
    }
}

const retrieveRetailStoreAndSetFlag = async (retailStoreId: string) => {
    try {
        // syncDownObj RetailStore record
        const retailStoreQuery = `SELECT ${getAllFieldsByObjName(
            'RetailStore'
        ).join()} FROM RetailStore WHERE Id='${retailStoreId}'`
        const retailStoreData = await syncDownObj('RetailStore', retailStoreQuery)

        // set needDeleteFlag
        const needDeleteFlag = retailStoreData.length === 0

        // retrieve RetailStore record from local
        const newRetailStoreQuery = `SELECT {RetailStore:Id},{RetailStore:_soupEntryId},{RetailStore:AccountId} FROM {RetailStore} WHERE {RetailStore:Id} = '${retailStoreId}'`
        const newResult = await SoupService.retrieveDataFromSoup(
            'RetailStore',
            {},
            ['Id', '_soupEntryId', 'AccountId'],
            newRetailStoreQuery
        )

        return {
            retailStoreData,
            needDeleteFlag,
            newResult
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `getScore-Audit`,
            `Error in retrieveRetailStoreAndSetFlag for retailStoreId:` + ErrorUtils.error2String(error),
            `retailStoreId: ` + ErrorUtils.error2String(retailStoreId)
        )
        throw error
    }
}

export const goToAuditAndContractTab = async ({
    navigation,
    retailStoreId
}: {
    navigation: any
    retailStoreId: string
}) => {
    try {
        if (!retailStoreId) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'handleFormNotification',
                `Handle Form Notification Failed: retailStoreId: ${retailStoreId}`
            )
        }
        const { needDeleteFlag, newResult } = await retrieveRetailStoreAndSetFlag(retailStoreId)
        navigation.navigate('CustomerDetailScreen', {
            customer: { _soupEntryId: newResult[0]._soupEntryId, AccountId: newResult[0].AccountId },
            tab: ActiveTabName.CONTRACT,
            subTab: ContractAndAuditSubTab.AUDIT,
            needDelete: needDeleteFlag
        })
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `goToAuditAndContractTab-CDANotification`,
            `Error in goToAuditAndContractTab for retailStoreId:` + ErrorUtils.error2String(error),
            `retailStoreId: ` + ErrorUtils.error2String(retailStoreId)
        )
    }
}

const fetchRetailStoreDataByRetailStoreId = (retailStoreId: string) => {
    const queryRetailStore = `query/?q=
    SELECT Id,Street,City,PostalCode,State,StateCode,Name,Account.LOC_PROD_ID__c,
    Account.Name,Account.Id,Account.IsCDACustomer__c,CountryCode,Country,
    Account.IsOTSCustomer__c,Account.CDA_Medal__c,Account.CUST_UNIQ_ID_VAL__c
            FROM RetailStore
            WHERE Id = '${retailStoreId}'`

    return restDataCommonCall(queryRetailStore, 'GET')
        .then((res: any) => {
            const retailStore = res?.data?.records
            if (retailStore && retailStore.length > 0) {
                return retailStore[0] as RetailStoreData
            }
            return {}
        })
        .catch((err: any) => {
            const errorMessage = `Error retrieving contract retail store data: ${ErrorUtils.error2String(err)}`
            storeClassLog(Log.MOBILE_ERROR, 'retrieve contract retail store data failed', errorMessage)
        })
}

export const goToRealogramScreen = async ({
    navigation,
    retailStoreId
}: {
    navigation: any
    retailStoreId: string
}) => {
    try {
        if (!retailStoreId) {
            throw new Error(`Handle click realogram notification failed: retailStoreId: ${retailStoreId}`)
        }
        const customerDetail = await fetchRetailStoreDataByRetailStoreId(retailStoreId)
        if (!_.isEmpty(customerDetail)) {
            navigation.navigate('RealogramScreen', { customerDetail, isFromNotification: true })
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `goToAuditAndContractTab-CDANotification`,
            `Error in goToAuditAndContractTab for retailStoreId:` + ErrorUtils.error2String(error),
            `retailStoreId: ` + ErrorUtils.error2String(retailStoreId)
        )
    }
}

export const getContractedShelves = (auditData: any) => {
    const hasCDA = auditData.contract.CDA_Space_Checkbox__c
    const requiredShelves = auditData.requiredKPIValue.requiredShelves
    const pepColdVaultShelves = requiredShelves?.PEPColdVaultShelves
    const totalPepLRBShelves = requiredShelves?.totalPepLRBShelves
    if (hasCDA) {
        return formatNullValue(pepColdVaultShelves) || formatNullValue(totalPepLRBShelves)
    }
    return formatNullValue(totalPepLRBShelves)
}

export const safeJsonParse = (jsonString: string) => {
    if (typeof jsonString !== 'string') {
        return jsonString
    }

    try {
        return JSON.parse(jsonString)
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            `safeJsonParse`,
            `Json Parse Fail: ${jsonString}` + ErrorUtils.error2String(error)
        )
        return null
    }
}

export const checkIsFormNotification = (notificationType: string) => {
    return notificationType === FormNotificationType.FORM_KPI || notificationType === FormNotificationType.NOT_LOAD
}

export const checkAuditRetailVisitKpi = async (
    visitId: string,
    kpiParams: string[],
    locProdId: string
): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
        const pollInterval = IntervalTime.THREE_THOUSAND
        const timeout = IntervalTime.TEN * IntervalTime.ONE_THOUSAND
        const startTime = new Date().getTime()
        const poll = setInterval(async () => {
            try {
                const currentTime = new Date().getTime()
                const elapsedTime = currentTime - startTime
                const params = {
                    strLocationId: locProdId,
                    strAuditVisitId: visitId,
                    lstAuditVisitKPIs: kpiParams,
                    lstCDAVisitKPIs: []
                }
                const retailVisitKpi: any = await restApexCommonCall('getCDAKpi/', 'POST', params)
                if (elapsedTime >= timeout) {
                    clearInterval(poll)
                    resolve(false) // Resolve with false when timeout
                }
                if (retailVisitKpi?.data.auditVisitKpi) {
                    clearInterval(poll)
                    resolve(true) // Resolve with true when data is available
                }
            } catch (error) {
                clearInterval(poll)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Audit_Init-Visit-Kpi',
                    `Init Visit Kpi Poll failed: ${getStringValue(error)},visitId: ${visitId},locProdId: ${locProdId}`
                )
                resolve(false) // Resolve with false in case of error
            }
        }, pollInterval)
    })
}

export const showTextWithUnit = (num: string | number) => {
    return num ? `${num}%` : num
}

export const showComplianceScoreFormat = (showValue: boolean, complianceScore: any) => {
    return showValue ? showTextWithUnit(complianceScore) : '-'
}
