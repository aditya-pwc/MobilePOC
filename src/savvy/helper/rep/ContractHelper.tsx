import { HttpStatusCode } from 'axios'
import _ from 'lodash'
import { Alert } from 'react-native'
import {
    compositeCommonCall,
    restApexCommonCall,
    restDataCommonCall,
    syncDownObj,
    syncUpObjCreateFromMem,
    syncUpObjUpdateFromMem
} from '../../api/SyncUtils'
import {
    AssessmentIndicators,
    ContractStatus,
    PercentageEnum,
    StepVal,
    IntEnum,
    ContractActionType,
    BooleanEnum,
    AgreementType,
    PogParamsProp,
    VisitType
} from '../../enums/Contract'
import { Log } from '../../../common/enums/Log'
import { DropDownType } from '../../enums/Manager'
import {
    ExecutionAndDiscountData,
    contractData,
    initColdVaultData,
    getPresentData
} from '../../hooks/CustomerContractTabHooks'
import { t } from '../../../common/i18n/t'
import {
    setActiveStep,
    setCheckedYear,
    setNextStepsActiveStep,
    setSurveyQuestions,
    setSurveyQuestionsModalVisible,
    setTimeErrMsg,
    setVisitId
} from '../../redux/action/ContractAction'
import {
    initSurveyQuestions,
    initOriginRetailVisitKpi,
    StoreVolumeSectionData
} from '../../redux/reducer/ContractReducer'
import { filterExistFields, getAllFieldsByObjName } from '../../utils/SyncUtils'
import React, { Dispatch } from 'react'
import moment from 'moment'
import { CommonParam } from '../../../common/CommonParam'
import { getStringValue } from '../../utils/LandingUtils'
import { getIdClause } from '../../components/manager/helper/MerchManagerHelper'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { reGetUserLanguage } from '../../i18n/Utils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { sendEmailWithPdfAttachment } from '../../utils/PdfUtils'
import ProcessDoneModal from '../../components/common/ProcessDoneModal'
import PopMessage from '../../components/common/PopMessage'
import { fetchPOG } from '../../api/POGService'
import { VisitStatus } from '../../enums/Visit'
import StatusCode from '../../enums/StatusCode'
import { blobToBase64 } from '../../utils/CommonUtils'
import { setAuditData } from '../../redux/action/AuditAction'
import { initAudit } from '../../redux/reducer/AuditReducer'

// Enter only numbers or decimals
export const wholeOrDecimalNumber = /^(\d+|\d+\.\d*)$/

// Enter only numbers
export const wholeNumber = /^\d*$/

// An integer that is not Zero
export const wholeNumberNotZero = /^[1-9]\d*$/

// An Number that is not Zero
export const notZeroRegExp = /(^$)|^[1-9]\d*$/

export const hasIllegalCharacter = /[\\/:*+?"'<>|$%&{}!@`=]/

export const createCdaSignatureBody = (
    assessmentTaskId: string,
    name: string,
    signature: string,
    companyFlag: string,
    isRep = false
) => ({
    method: 'POST',
    url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
    referenceId: `refContentVersion${isRep ? 'Rep' : 'Customer'}`,
    body: {
        Title: `${companyFlag}_` + name.replaceAll(' ', '_'),
        PathOnClient: `${companyFlag}_` + name.replaceAll(' ', '_') + '.png',
        VersionData: signature,
        FirstPublishLocationId: assessmentTaskId
    }
})

export const inputIntOnChange = (value: string, min: string, max: string, _initials: string = IntEnum.ZERO) => {
    const t = value.charAt(0)
    const intRegExp = /[^\d]/g
    let tmpVal = value.replace(intRegExp, '')
    tmpVal = (t === _initials ? t : '') + tmpVal
    if (!!min && !!tmpVal && parseFloat(tmpVal) < parseFloat(min)) {
        tmpVal = min
    }
    if (!!max && !!tmpVal && parseFloat(tmpVal) > parseFloat(max)) {
        tmpVal = max
    }
    return tmpVal ? parseFloat(tmpVal).toString() : tmpVal
}
export const getSumByVal = (list: any[], key: string, _sumByFun: Function | undefined = undefined) => {
    const totalSum = _.sumBy(list, (elem) => {
        if (elem) {
            return _sumByFun ? _sumByFun(elem) : parseInt(elem[key] || '0')
        }
        return 0
    })
    return Math.round(totalSum).toString()
}
export const handlePressDeclineCDA = (cdaYear: string, onPressYes: Function) =>
    Alert.alert(
        t.labels.PBNA_MOBILE_CUSTOMER_DECLINED_CDA,
        t.labels.PBNA_MOBILE_CUSTOMER_DECLINED_CDA_MESSAGE + ' ' + cdaYear,
        [
            {
                text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                onPress: () => {}
            },
            {
                text: `${t.labels.PBNA_MOBILE_CDA_YES_DECLINE}`,
                onPress: () => {
                    if (onPressYes) {
                        onPressYes()
                    }
                },
                style: 'destructive'
            }
        ]
    )

export const deleteContractRelated = async (lstVisitId: string[]) => {
    try {
        if (lstVisitId) {
            await restApexCommonCall('deleteContractRelated', 'POST', { lstVisitId })
        }
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'DeleteContractRelated',
            `Delete contract related visit KPI failed:${getStringValue(error)}`
        )
    }
}

export const updateVisitStatus = async (visitId: string, status = VisitStatus.CANCELLED) => {
    if (visitId) {
        try {
            const tempVisitObj = { Id: visitId, Status__c: status }
            const syncUpUpdateFields = ['Id', 'Status__c']
            await syncUpObjUpdateFromMem('Visit', filterExistFields('Contract', [tempVisitObj], syncUpUpdateFields))
        } catch (err) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'updateVisitStatus',
                `Update Visit Status__c failed: ${getStringValue(err)}`
            )
        }
    }
}

const handleUpdateCDAStatusToCancelled = async (
    item: any,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    dropDownRef: any,
    retailStoreID: string
) => {
    try {
        const res = await restDataCommonCall(`sobjects/Contract/${item.Id}`, 'PATCH', {
            Contract_Status__c: ContractStatus.Cancelled
        })
        if (res?.status === HttpStatusCode.Ok || res?.status === HttpStatusCode.NoContent) {
            await syncDownObj(
                'RetailStore',
                `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id='${retailStoreID}'`
            )
            updateVisitStatus(item.CDA_Visit__c)
            if (!_.isEmpty(item.CDA_Reset_Visit__c)) {
                updateVisitStatus(item.CDA_Reset_Visit__c, VisitStatus.REMOVED)
            }
            // loading will reset to false after refresh
            setRefreshFlag && setRefreshFlag((v: number) => v + 1)
        } else {
            throw new Error(getStringValue(res))
        }
    } catch (err) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_CDA_DECLINE_CDA_FAILURE, err)
        storeClassLog(
            Log.MOBILE_ERROR,
            'ContractTab-Cancel',
            `Update contract Contract_Status__c failed: ${getStringValue(err)}`
        )
    }
}

export const handleCancelCDA = (
    item: any,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    dropDownRef: any,
    retailStoreID: string
) => {
    Alert.alert(t.labels.PBNA_MOBILE_CANCEL, t.labels.PBNA_MOBILE_CANCEL_CDA_TIP_MESSAGE, [
        {
            text: `${t.labels.PBNA_MOBILE_CANCEL_CONTRACT}`,
            onPress: () => {
                handleUpdateCDAStatusToCancelled(item, setRefreshFlag, dropDownRef, retailStoreID)
            }
        },
        {
            text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`
        }
    ])
}

export const handleBackSurveyQuestionsProcess = (dispatch: any, activeStep: string) => {
    if (activeStep === StepVal.TWO) {
        dispatch(setActiveStep(StepVal.ONE))
    }
    if (activeStep === StepVal.THREE) {
        dispatch(setActiveStep(StepVal.TWO))
    }
    if (activeStep === StepVal.FOUR) {
        dispatch(setActiveStep(StepVal.THREE))
    }
}
export const handleBackSurveyQuestionsNextStepsProcess = (dispatch: any, nextStepsActiveStep: string) => {
    if (nextStepsActiveStep === StepVal.ONE) {
        dispatch(setActiveStep(StepVal.THREE))
    }
    if (nextStepsActiveStep === StepVal.TWO) {
        dispatch(setNextStepsActiveStep(StepVal.ONE))
    }
    if (nextStepsActiveStep === StepVal.THREE) {
        dispatch(setNextStepsActiveStep(StepVal.TWO))
    }
}

export const handleSendContractEmail = async (
    htmlString: string,
    handleNavigateToResetVisit: Function,
    subjectLine: string
) => {
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
            handleNavigateToResetVisit()
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
        }
    }
}

interface SaveSurveyQuestionProps {
    dispatch: any
    customerDetail: any
    surveyQuestions: any
    dropDownRef: any
    checkedYear: string
    activeStep: string
    setLoading: any
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
    visitId: string
    executionData: ExecutionAndDiscountData[]
    enabledRewards: string[]
    coldVaultData: typeof initColdVaultData
    originAgreementType: string
    setOriginAgreementType: React.Dispatch<React.SetStateAction<string>>
    ifShowLocationGroup: undefined | boolean
    isSignedContract: boolean
}
interface NextStepsProps {
    dispatch: any
    dropDownRef: any
    setLoading: any
    nextStepsActiveStep: string
    surveyQuestions: any
    isDisabled: boolean
}

type CreateProps = {
    dropDownRef: any
    surveyQuestions: typeof initSurveyQuestions
    dispatch: Dispatch<any>
    setLoading: any
    customerDetail: any
    checkedYear: string
    visitId: string
    originAgreementType: string
    setOriginAgreementType: React.Dispatch<React.SetStateAction<string>>
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
}

type UpDateToNextProps = {
    dropDownRef: any
    surveyQuestions: typeof initSurveyQuestions
    dispatch: Dispatch<any>
    setLoading: any
    syncUpUpdateFields: any[]
    draftStep: StepVal
    activeStep: StepVal
    originAgreementType: string
    setOriginAgreementType: React.Dispatch<React.SetStateAction<string>>
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
    ifShowLocationGroup: undefined | boolean
}
type UpDateNextStepsToNextProps = {
    dropDownRef: any
    surveyQuestions: typeof initSurveyQuestions
    dispatch: Dispatch<any>
    setLoading: any
    syncUpUpdateFields: any[]
    draftStep: StepVal
    nextStepsActiveStep: StepVal
}
type NextStepsToNextProps = {
    dispatch: Dispatch<any>
    nextStepsActiveStep: StepVal
}

const getProposedPepLRBSpace = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const proposedPepLRBSpaceObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE].Id,
        ActualDecimalValue: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] || null
    }
    return proposedPepLRBSpaceObj
}

const getProposedPepLRBShelves = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const proposedPepLRBShelvesObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES].Id,
        ActualDecimalValue: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] || null
    }
    return proposedPepLRBShelvesObj
}

const getProposedPerimeterShelves = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const proposedPepLRBShelvesObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES].Id,
        ActualDecimalValue: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES] || null
    }
    return proposedPepLRBShelvesObj
}

const getProposedColdVaultShelves = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const proposedPepLRBShelvesObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES].Id,
        ActualDecimalValue: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] || null
    }
    return proposedPepLRBShelvesObj
}

export const handleStoreVolumeData = (
    svsData: StoreVolumeSectionData[],
    agreementType: string = AgreementType.MEDAL_CONTRACT
) => {
    const jsonObj = _.chain(svsData)
        .filter((elem) => elem.id !== t.labels.PBNA_MOBILE_TOTAL)
        .map((elem) => {
            /**
             * JSON Structure should be this instead of the original to ensure that we do not exceed the character limit for this field by adding basic packages
                {P: 13.7 oz Frap
                A: 30
                U: 30
                G: 5
                M: F},
                P => stands for package name
                A => stands for API call
                U => user volume
                G => Volume growth
                M => stands for medal, we display T (i.e true) or F (i.e. false) based on whether it is a medal or basic package
             */

            const isAgreementTypeMedal = agreementType === AgreementType.MEDAL_CONTRACT
            if (agreementType && elem.isMedal !== isAgreementTypeMedal) {
                const sameTitleMedalElements = svsData.find(
                    (otherElem) =>
                        otherElem.title.toLocaleUpperCase() === elem.title.toLocaleUpperCase() &&
                        otherElem.isMedal === isAgreementTypeMedal
                )

                if (sameTitleMedalElements) {
                    return {
                        P: elem.title,
                        A: elem.wksVol,
                        U: elem.wksVol === sameTitleMedalElements.useVol ? '' : sameTitleMedalElements.useVol,
                        G: sameTitleMedalElements.projVolGrowth,
                        M: elem.isMedal ? BooleanEnum.TRUE : BooleanEnum.FALSE
                    }
                }
            }
            return {
                P: elem.title,
                A: elem.wksVol,
                U: elem.wksVol === elem.useVol ? '' : elem.useVol,
                G: elem.projVolGrowth,
                M: elem.isMedal ? BooleanEnum.TRUE : BooleanEnum.FALSE
            }
        })
        .value()
    return JSON.stringify(jsonObj)
}
const saveStepOneRetailVisitKpi = async (
    surveyQuestions: typeof initSurveyQuestions,
    originAgreementType: string,
    setOriginAgreementType: React.Dispatch<React.SetStateAction<string>>,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    let result = null
    if (surveyQuestions.retailVisitKpiObj && surveyQuestions.retailVisitKpiObj.Id) {
        const keyStoreVolumeData =
            surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT
                ? surveyQuestions.medalStoreVolumeData
                : surveyQuestions.basicStoreVolumeData
        const tempRetailVisitKpiObj = {
            ...surveyQuestions.retailVisitKpiObj,
            ActualLongStringValue__c: handleStoreVolumeData(
                [...surveyQuestions.StoreVolumeData, ...keyStoreVolumeData],
                surveyQuestions.Agreement_Type__c
            )
        }
        const updateObjArr = [tempRetailVisitKpiObj]
        if (surveyQuestions.Id && surveyQuestions.Agreement_Type__c !== originAgreementType) {
            const rewardsObj = {
                Id: retailOriginVisitKpi[AssessmentIndicators.REWARDS_SELECTION].Id,
                ActualLongStringValue__c: null
            }
            updateObjArr.push(rewardsObj)
        }

        try {
            await syncUpObjUpdateFromMem(
                'RetailVisitKpi',
                filterExistFields('RetailVisitKpi', updateObjArr, ['Id', 'ActualLongStringValue__c']),
                false
            )
            result = tempRetailVisitKpiObj
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Space-Review-saveStepOneRetailVisitKpi',
                `saveStepOneRetailVisitKpi failed: ${getStringValue(error)}`
            )
        }
    }
    return result
}

const getNewStoreVolumeData = (stepOneResult: any, surveyQuestions: typeof initSurveyQuestions) => {
    return stepOneResult
        ? {
              retailVisitKpiObj: stepOneResult,
              [surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT
                  ? 'basicStoreVolumeData'
                  : 'medalStoreVolumeData']: _.cloneDeep(surveyQuestions.StoreVolumeData)
          }
        : {}
}

const updateContractAndNavigateToNextStep = async ({
    dropDownRef,
    surveyQuestions,
    dispatch,
    setLoading,
    syncUpUpdateFields,
    draftStep,
    activeStep,
    originAgreementType,
    setOriginAgreementType,
    retailOriginVisitKpi,
    ifShowLocationGroup
}: UpDateToNextProps) => {
    try {
        const tempContractObj = {
            ...surveyQuestions,
            Draft_Survey_Step__c: draftStep,
            CDA_Space_Checkbox__c: ifShowLocationGroup ?? surveyQuestions.CDA_Space_Checkbox__c
        }
        setLoading(true)
        await syncUpObjUpdateFromMem('Contract', filterExistFields('Contract', [tempContractObj], syncUpUpdateFields))
        let stepOneResult = null
        if (draftStep === StepVal.ONE) {
            stepOneResult = await saveStepOneRetailVisitKpi(
                surveyQuestions,
                originAgreementType,
                setOriginAgreementType,
                retailOriginVisitKpi
            )
        }
        const obj = getNewStoreVolumeData(stepOneResult, surveyQuestions)
        let tempSelectRewards = surveyQuestions.SelectRewards
        const needUpdateOriginAgreementTypeAndSelectRewards =
            draftStep === StepVal.ONE && surveyQuestions.Agreement_Type__c !== originAgreementType
        if (needUpdateOriginAgreementTypeAndSelectRewards) {
            tempSelectRewards = {}
        }
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                ...obj,
                Draft_Survey_Step__c: draftStep,
                SelectRewards: tempSelectRewards
            })
        )

        if (needUpdateOriginAgreementTypeAndSelectRewards) {
            setOriginAgreementType(surveyQuestions.Agreement_Type__c)
        }

        dispatch(setActiveStep(activeStep))
        setLoading(false)
    } catch (err) {
        setLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'Edit save survey questions process  step 1 failure', err)
        storeClassLog(
            Log.MOBILE_ERROR,
            'HandleSaveSurveyQuestionsProcess-updateContract-editDraft',
            `Customer update contract Contract_Status__c failed: ${getStringValue(err)}`
        )
    }
}

const updateNextStepVal = async ({ dispatch, nextStepsActiveStep }: NextStepsToNextProps) => {
    dispatch(setNextStepsActiveStep(nextStepsActiveStep))
}

const updateContractAndNavigateToNextStepForStepFour = async ({
    dropDownRef,
    surveyQuestions,
    dispatch,
    setLoading,
    syncUpUpdateFields,
    draftStep,
    nextStepsActiveStep
}: UpDateNextStepsToNextProps) => {
    try {
        const tempContractObj = { ...surveyQuestions, Draft_Survey_Step__c: draftStep }

        setLoading(true)
        await syncUpObjUpdateFromMem('Contract', filterExistFields('Contract', [tempContractObj], syncUpUpdateFields))

        dispatch(setSurveyQuestions({ ...surveyQuestions, Draft_Survey_Step__c: draftStep }))
        updateNextStepVal({ dispatch, nextStepsActiveStep })
        setLoading(false)
    } catch (err) {
        setLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'Edit save survey questions process  step 1 failure', err)
        storeClassLog(
            Log.MOBILE_ERROR,
            'HandleSaveSurveyQuestionsProcess-updateContract-editDraft',
            `Customer update contract Contract_Status__c failed: ${getStringValue(err)}`
        )
    }
}

const createContractAndNavigateToStep2 = async ({
    dropDownRef,
    surveyQuestions,
    dispatch,
    setLoading,
    customerDetail,
    checkedYear,
    visitId,
    originAgreementType,
    setOriginAgreementType,
    retailOriginVisitKpi
}: CreateProps) => {
    // new contract
    try {
        const contractObj = {
            AccountId: customerDetail.AccountId,
            Status: ContractStatus.InProgress,
            Contract_Status__c: ContractStatus.InProgress,
            CDA_Year__c: checkedYear,
            Signed_Medal_Tier__c: '',
            StartDate: surveyQuestions.StartDate,
            EndDate: surveyQuestions.EndDate,
            Account_Paid__c: surveyQuestions.Account_Paid__c,
            Agreement_Type__c: surveyQuestions.Agreement_Type__c,
            Draft_Survey_Step__c: StepVal.ONE,
            CDA_Visit__c: visitId
        }

        setLoading(true)

        const contracts = await syncUpObjCreateFromMem('Contract', [contractObj])
        const stepOneResult = await saveStepOneRetailVisitKpi(
            surveyQuestions,
            originAgreementType,
            setOriginAgreementType,
            retailOriginVisitKpi
        )
        const obj = getNewStoreVolumeData(stepOneResult, surveyQuestions)
        const contract = contracts[0]?.data[0]
        if (contract?.Id) {
            dispatch(
                setSurveyQuestions({ ...surveyQuestions, Draft_Survey_Step__c: StepVal.ONE, Id: contract.Id, ...obj })
            )
            dispatch(setActiveStep(StepVal.TWO))
        }
        setLoading(false)
    } catch (error) {
        setLoading(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, 'New save survey questions step 1 process failure', error)
        storeClassLog(
            Log.MOBILE_ERROR,
            'HandleSaveSurveyQuestionsProcess-newContract-startNewCda',
            `Customer new contract failed: ${getStringValue(error)}`
        )
    }
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

export const convertEmptyStringToNull = (value: any) => {
    return value === '' ? null : value
}

export const getStepTwoKpiParams = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const syncUpUpdateFields = ['Id', 'ActualDecimalValue']
    const doorSurveyObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.DOOR_SURVEY].Id,
        ActualDecimalValue: convertEmptyStringToNull(surveyQuestions[AssessmentIndicators.DOOR_SURVEY])
    }
    const totalLRBShelves = {
        Id: retailOriginVisitKpi[AssessmentIndicators.TOTAL_LRB_SHELVES].Id,
        ActualDecimalValue: convertEmptyStringToNull(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])
    }
    const totalLRBPepsiShelves = {
        Id: retailOriginVisitKpi[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES].Id,
        ActualDecimalValue: convertEmptyStringToNull(surveyQuestions[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES])
    }

    // Clear Kpi if Total LRB has changes
    const syncUpUpdateDataArr: {}[] = [doorSurveyObj, totalLRBShelves, totalLRBPepsiShelves]
    if (!surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]) {
        syncUpUpdateDataArr.push(
            getProposedPepLRBSpace(surveyQuestions, retailOriginVisitKpi),
            getProposedPepLRBShelves(surveyQuestions, retailOriginVisitKpi),
            getProposedPerimeterShelves(surveyQuestions, retailOriginVisitKpi),
            getProposedColdVaultShelves(surveyQuestions, retailOriginVisitKpi)
        )
    }

    return {
        syncUpUpdateDataArr,
        syncUpUpdateFields
    }
}

const getRewardKpiObj = (
    enabledRewards: string[],
    selectRewards: { [x: string]: boolean | undefined },
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const filteredObj: { [x: string]: true } = {}

    for (const key in selectRewards) {
        if (selectRewards[key] && enabledRewards.includes(key)) {
            filteredObj[key] = true
        }
    }

    const rewardsObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.REWARDS_SELECTION].Id,
        ActualLongStringValue__c: JSON.stringify(filteredObj)
    }
    return rewardsObj
}

const getExecutionElementsObj = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi,
    executionData: ExecutionAndDiscountData[]
) => {
    const executionElementsAll: any = {}
    executionData.forEach((execution: ExecutionAndDiscountData) => {
        executionElementsAll[execution.kpiName] =
            surveyQuestions.ExecutionElements[execution.kpiName] === undefined
                ? ''
                : surveyQuestions.ExecutionElements[execution.kpiName]
    })
    const executionElementsObj = {
        Id: retailOriginVisitKpi[AssessmentIndicators.PROPOSED_VALUES_FOR_EXECUTION_ELEMENTS].Id,
        ActualLongStringValue__c: JSON.stringify(executionElementsAll)
    }
    return executionElementsObj
}

export const getStepThreeKpiParams = (
    surveyQuestions: typeof initSurveyQuestions,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi,
    executionData: ExecutionAndDiscountData[],
    enabledRewards: string[]
) => {
    const syncUpUpdateFields = ['Id', 'ActualDecimalValue', 'ActualLongStringValue__c']

    const syncUpUpdateDataArr = [
        getExecutionElementsObj(surveyQuestions, retailOriginVisitKpi, executionData),
        getProposedPepLRBSpace(surveyQuestions, retailOriginVisitKpi),
        getProposedPepLRBShelves(surveyQuestions, retailOriginVisitKpi),
        getProposedPerimeterShelves(surveyQuestions, retailOriginVisitKpi),
        getProposedColdVaultShelves(surveyQuestions, retailOriginVisitKpi),
        getRewardKpiObj(enabledRewards, surveyQuestions.SelectRewards, retailOriginVisitKpi)
    ]
    return { syncUpUpdateDataArr, syncUpUpdateFields }
}

export const updateContractSignedMedalTierAndStep = async (
    surveyQuestions: typeof initSurveyQuestions,
    ifShowLocationGroup: boolean | undefined,
    nextStep = false
) => {
    const syncUpUpdateFields = ['Id', 'Signed_Medal_Tier__c', 'Draft_Survey_Step__c', 'CDA_Space_Checkbox__c']
    try {
        const tempContractObj = {
            ...surveyQuestions,
            Signed_Medal_Tier__c: surveyQuestions.Signed_Medal_Tier__c,
            Draft_Survey_Step__c: nextStep ? StepVal.THREE : StepVal.TWO,
            CDA_Space_Checkbox__c: ifShowLocationGroup ?? surveyQuestions.CDA_Space_Checkbox__c
        }
        await syncUpObjUpdateFromMem('Contract', filterExistFields('Contract', [tempContractObj], syncUpUpdateFields))
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'HandleSave',
            `Customer update contract Signed_Medal_Tier__c failed: ${getStringValue(err)}`
        )
    }
}

const handleUpdateContractCompliant = (
    surveyQuestions: typeof initSurveyQuestions,
    coldVaultData: typeof initColdVaultData
) => {
    const newTier = surveyQuestions.Signed_Medal_Tier__c
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

export const handleSaveSurveyQuestionsProcess = async (props: SaveSurveyQuestionProps) => {
    const {
        dispatch,
        customerDetail,
        surveyQuestions,
        dropDownRef,
        checkedYear,
        activeStep,
        setLoading,
        retailOriginVisitKpi,
        executionData,
        visitId,
        enabledRewards,
        coldVaultData,
        originAgreementType,
        setOriginAgreementType,
        ifShowLocationGroup,
        isSignedContract
    } = props
    let syncUpUpdateContractStep = ['Id', 'Draft_Survey_Step__c']
    const syncUpUpdateFields = isSignedContract
        ? ['Id', 'Account_Paid__c', 'Agreement_Type__c', 'Draft_Survey_Step__c']
        : ['Id', 'Account_Paid__c', 'Agreement_Type__c', 'StartDate', 'EndDate', 'Draft_Survey_Step__c']

    switch (activeStep) {
        case StepVal.ONE: {
            if (!surveyQuestions.Id) {
                createContractAndNavigateToStep2({
                    dropDownRef,
                    surveyQuestions,
                    dispatch,
                    setLoading,
                    customerDetail,
                    checkedYear,
                    visitId,
                    originAgreementType,
                    setOriginAgreementType,
                    retailOriginVisitKpi
                })
            } else {
                updateContractAndNavigateToNextStep({
                    dropDownRef,
                    surveyQuestions,
                    dispatch,
                    setLoading,
                    syncUpUpdateFields,
                    draftStep: StepVal.ONE,
                    activeStep: StepVal.TWO,
                    originAgreementType,
                    setOriginAgreementType,
                    retailOriginVisitKpi,
                    ifShowLocationGroup
                })
            }

            break
        }
        case StepVal.TWO:
            await updateRetailVisitKpi(getStepTwoKpiParams(surveyQuestions, retailOriginVisitKpi))
            updateContractAndNavigateToNextStep({
                dropDownRef,
                surveyQuestions,
                dispatch,
                setLoading,
                syncUpUpdateFields: syncUpUpdateContractStep,
                draftStep: StepVal.TWO,
                activeStep: StepVal.THREE,
                originAgreementType,
                setOriginAgreementType,
                retailOriginVisitKpi,
                ifShowLocationGroup
            })

            break
        case StepVal.THREE:
            syncUpUpdateContractStep = ['Id', 'Draft_Survey_Step__c', 'Compliant__c', 'CDA_Space_Checkbox__c']
            await updateRetailVisitKpi(
                getStepThreeKpiParams(surveyQuestions, retailOriginVisitKpi, executionData, enabledRewards)
            )
            await updateContractSignedMedalTierAndStep(surveyQuestions, ifShowLocationGroup, true)

            updateContractAndNavigateToNextStep({
                dropDownRef,
                surveyQuestions: {
                    ...surveyQuestions,
                    Compliant__c: handleUpdateContractCompliant(surveyQuestions, coldVaultData)
                },
                dispatch,
                setLoading,
                syncUpUpdateFields: syncUpUpdateContractStep,
                draftStep: StepVal.THREE,
                activeStep: StepVal.FOUR,
                originAgreementType,
                setOriginAgreementType,
                retailOriginVisitKpi,
                ifShowLocationGroup
            })
            break
        case StepVal.FOUR:
            updateNextStepVal({
                dispatch,
                nextStepsActiveStep: StepVal.ONE
            })
            break
        default:
            break
    }
}

export const handleNextStepsProcess = async (props: NextStepsProps) => {
    await reGetUserLanguage()
    const { dispatch, dropDownRef, setLoading, nextStepsActiveStep, surveyQuestions, isDisabled } = props
    const syncUpUpdateFields = isDisabled
        ? ['Id', 'Account_Paid__c', 'Agreement_Type__c', 'Draft_Survey_Step__c']
        : ['Id', 'Account_Paid__c', 'Agreement_Type__c', 'StartDate', 'EndDate', 'Draft_Survey_Step__c']
    switch (nextStepsActiveStep) {
        case StepVal.ONE: {
            updateContractAndNavigateToNextStepForStepFour({
                dropDownRef,
                surveyQuestions,
                dispatch,
                setLoading,
                syncUpUpdateFields,
                draftStep: StepVal.FOUR,
                nextStepsActiveStep: StepVal.TWO
            })
            break
        }
        case StepVal.TWO:
            updateContractAndNavigateToNextStepForStepFour({
                dropDownRef,
                surveyQuestions,
                dispatch,
                setLoading,
                syncUpUpdateFields,
                draftStep: StepVal.FOUR,
                nextStepsActiveStep: StepVal.THREE
            })
            break
        case StepVal.THREE:
            break
        default:
            break
    }
}

export const handleSaveDraftContract = async (
    customerDetail: any,
    dropDownRef: any,
    checkedYear: string,
    surveyQuestions: any,
    visitId: string,
    originAgreementType: string,
    setOriginAgreementType: React.Dispatch<React.SetStateAction<string>>,
    retailOriginVisitKpi: typeof initOriginRetailVisitKpi
) => {
    const contractObj = {
        AccountId: customerDetail.AccountId,
        Status: ContractStatus.InProgress,
        Contract_Status__c: ContractStatus.InProgress,
        CDA_Year__c: checkedYear,
        Signed_Medal_Tier__c: '',
        StartDate: surveyQuestions.StartDate,
        Draft_Survey_Step__c: StepVal.ZERO,
        Agreement_Type__c: surveyQuestions.Agreement_Type__c,
        Account_Paid__c: surveyQuestions.Account_Paid__c,
        EndDate: surveyQuestions.EndDate || null,
        CDA_Visit__c: visitId
    }
    // EndDate passed to the back end must be null instead of an empty string

    if (!surveyQuestions.Id) {
        try {
            await syncUpObjCreateFromMem('Contract', [contractObj])
            await saveStepOneRetailVisitKpi(
                surveyQuestions,
                originAgreementType,
                setOriginAgreementType,
                retailOriginVisitKpi
            )
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                'New save draft survey questions process failure',
                error
            )
            storeClassLog(
                Log.MOBILE_ERROR,
                'HandleSave-newContract-editDraft',
                `Customer save new contract failed: ${getStringValue(error)}`
            )
        }
    } else {
        try {
            const syncUpUpdateFields = [
                'Id',
                'Account_Paid__c',
                'Agreement_Type__c',
                'StartDate',
                'EndDate',
                'Draft_Survey_Step__c'
            ]
            const tempContractObj = {
                ...contractObj,
                Id: surveyQuestions.Id,
                Draft_Survey_Step__c: surveyQuestions.Draft_Survey_Step__c
            }

            await syncUpObjUpdateFromMem(
                'Contract',
                filterExistFields('Contract', [tempContractObj], syncUpUpdateFields)
            )
            await saveStepOneRetailVisitKpi(
                surveyQuestions,
                originAgreementType,
                setOriginAgreementType,
                retailOriginVisitKpi
            )
        } catch (error) {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                'Edit save draft survey questions process failure',
                error
            )
            storeClassLog(
                Log.MOBILE_ERROR,
                'HandleSave-updateContract-editDraft',
                `Customer edit draft contract failed: ${getStringValue(error)}`
            )
        }
    }
}

export const refreshCustomerDetailData = async (
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    customerDetail: any
) => {
    try {
        await syncDownObj(
            'RetailStore',
            `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id IN ('${
                customerDetail.Id
            }')`
        )
        setRefreshFlag && setRefreshFlag((v: number) => v + 1)
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'ContractTab-closeSurveyQuestionMola',
            `Sync RetailStore failed: ${getStringValue(error)}`
        )
    }
}
const resetTime = (date: string) => {
    if (date) {
        const today = moment().format(TIME_FORMAT.Y_MM_DD)
        const needReset = moment(date).isBefore(moment())
        return needReset ? today : date
    }
    return date
}

export const handleOpenDraftCDA = (item: contractData, dispatch: any) => {
    const surveyQuestionsStepOne = {
        ...initSurveyQuestions,
        Id: item.Id,
        StartDate: resetTime(item.StartDate),
        EndDate: resetTime(item.EndDate),
        Agreement_Type__c: item.Agreement_Type__c,
        Account_Paid__c: item.Account_Paid__c,
        Draft_Survey_Step__c: item.Draft_Survey_Step__c,
        CDA_Year__c: item.CDA_Year__c,
        Signed_Medal_Tier__c: item.Signed_Medal_Tier__c,
        AccountId: item.AccountId,
        Status: item.Status,
        Contract_Status__c: item.Contract_Status__c,
        CustomerSignedName__c: item.CustomerSignedName__c || '',
        CustomerSignedTitle: item.CustomerSignedTitle || '',
        Description: item.Description || '',
        SignedRepName: item.CompanySigned?.Name || '',
        CDA_Space_Checkbox__c: !!item.CDA_Space_Checkbox__c
    }
    dispatch(setSurveyQuestions(surveyQuestionsStepOne))
    if (item.Contract_Status__c === ContractStatus.Signed) {
        item.Draft_Survey_Step__c = StepVal.THREE
        const activeStep = item.Draft_Survey_Step__c.toString()
        dispatch(setCheckedYear(item.CDA_Year__c))
        dispatch(setActiveStep(activeStep))
    } else {
        dispatch(
            setActiveStep(
                (item.Draft_Survey_Step__c !== StepVal.FOUR
                    ? Number(item.Draft_Survey_Step__c) + 1
                    : Number(item.Draft_Survey_Step__c)
                ).toString()
            )
        )
    }
    dispatch(setVisitId(item.CDA_Visit__c))
    dispatch(setSurveyQuestionsModalVisible(true))
}

export const handleDeleteDraft = async (
    item: contractData,
    customerDetail: any,
    setLoadingDeleteDraft: React.Dispatch<React.SetStateAction<boolean>>,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    dropDownRef: any
) => {
    setLoadingDeleteDraft(true)
    try {
        const isCurrentCdaYear = parseInt(item.CDA_Year__c || '0') === moment().toDate().getFullYear()
        const updateAccountObj = {
            method: 'PATCH',
            url: `/services/data/${CommonParam.apiVersion}/sobjects/Account/${customerDetail.AccountId}`,
            referenceId: 'refAccounts',
            body: {
                [isCurrentCdaYear ? 'CDA_Status__c' : 'CDA_NY_Status__c']: 'Not Started'
            }
        }
        const res = await compositeCommonCall([
            {
                method: 'DELETE',
                url: `/services/data/${CommonParam.apiVersion}/sobjects/Contract/${item.Id}`,
                referenceId: 'refContracts'
            },
            updateAccountObj
        ])
        if (
            res.status === HttpStatusCode.Ok &&
            res.data.compositeResponse[0].httpStatusCode === HttpStatusCode.NoContent
        ) {
            // loadingDecline will reset to false after refresh
            if (isCurrentCdaYear) {
                refreshCustomerDetailData(setRefreshFlag, customerDetail)
            } else {
                setRefreshFlag && setRefreshFlag((v: number) => v + 1)
            }
            item.CDA_Visit__c && deleteContractRelated([item.CDA_Visit__c])
        } else {
            throw new Error(getStringValue(res))
        }
    } catch (err) {
        setLoadingDeleteDraft(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA, err)
        storeClassLog(Log.MOBILE_ERROR, 'DeleteDraft', `Delete Draft: ${getStringValue(err)}`)
    }
}

export const handleAuditDeleteDraft = async (
    item: any,
    setLoadingDeleteDraft: React.Dispatch<React.SetStateAction<boolean>>,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    dropDownRef: any
) => {
    setLoadingDeleteDraft && setLoadingDeleteDraft(true)
    try {
        await deleteContractRelated([item.Id])
        setLoadingDeleteDraft && setLoadingDeleteDraft(false)
        setRefreshFlag && setRefreshFlag((v: number) => v + 1)
    } catch (err) {
        setRefreshFlag && setRefreshFlag((v: number) => v + 1)
        setLoadingDeleteDraft && setLoadingDeleteDraft(false)
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA, err)
        storeClassLog(Log.MOBILE_ERROR, 'DeleteDraft', `Delete Draft: ${getStringValue(err)}`)
    }
}

export const handleAuditDeleteDraftWithId = async (
    id: any,
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>,
    dropDownRef: any,
    navigation: any,
    isEdit: boolean,
    saveStatus: boolean,
    dispatch: Dispatch<any>
) => {
    try {
        if (!isEdit && !saveStatus) {
            await deleteContractRelated([id])
            setRefreshFlag && setRefreshFlag((v: number) => v + 1)
        }
        dispatch(setAuditData(initAudit))
        navigation.goBack()
    } catch (err) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA, err)
        storeClassLog(Log.MOBILE_ERROR, 'DeleteDraft', `Delete Draft: ${getStringValue(err)}`)
    }
}

const getRetailVisitKpiQuery = (kpiNameArr: string[], visitId: string) => {
    return `
        SELECT Id, ActualDecimalValue, AssessmentIndDefinition.Name, ActualLongStringValue__c
        FROM RetailVisitKpi
        WHERE AssessmentTaskId IN (
        SELECT Id
        FROM AssessmentTask
        WHERE ParentId IN ('${visitId}')
        AND AssessmentTaskDefinition.name = 'Pre Contract Space Review (User)'
        )
        AND AssessmentIndDefinition.Name IN (${getIdClause(kpiNameArr)})
    `
}
const getAssessmentTaskQuery = (visitId: string) => {
    return `SELECT Id,Mobile_Unique_ID__c,AssessmentTaskDefinition.name
    FROM AssessmentTask
    WHERE ParentId IN ('${visitId}') AND AssessmentTaskDefinition.name IN ('Pre Contract Space Review (FORM)', 'Pre Contract Space Review (User)')`
}

export const fetchRetailStoreKpi = (kpiNameArr: string[], visitId: string) => {
    return new Promise((resolve, reject) => {
        syncDownObj('RetailVisitKpi', encodeURIComponent(getRetailVisitKpiQuery(kpiNameArr, visitId)), false)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
export const getAssessmentTask = (visitId: string) => {
    return new Promise((resolve, reject) => {
        syncDownObj('AssessmentTask', encodeURIComponent(getAssessmentTaskQuery(visitId)), false)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const subtract = (a: number, b: number) => {
    return (
        (Math.round(a * PercentageEnum.ONE_HUNDRED) - Math.round(b * PercentageEnum.ONE_HUNDRED)) /
        PercentageEnum.ONE_HUNDRED
    )
}

export const checkCDATime = (
    startDate: string,
    endDate: string,
    dispatch: Dispatch<{ type: ContractActionType; payload: string }>
) => {
    if (_.isEmpty(startDate)) {
        dispatch(setTimeErrMsg(t.labels.PBNA_MOBILE_DATE_START_DATE_ERROR_MESSAGE))
    } else if (moment(startDate).isBefore(moment().format(TIME_FORMAT.Y_MM_DD))) {
        dispatch(setTimeErrMsg(t.labels.PBNA_MOBILE_START_DATE_CANNOT_BE_IN_THE_PAST))
    } else if (moment(startDate).isAfter(moment(endDate))) {
        dispatch(setTimeErrMsg(t.labels.PBNA_MOBILE_DATE_ERROR_MESSAGE))
    } else {
        dispatch(setTimeErrMsg(''))
    }
}

export const getMedalColorBGColor = (variant: string) => {
    switch (variant) {
        case 'Platinum':
            return { borderColor: '#C8D6FF', backgroundColor: '#E4EBFF' }

        case 'Gold':
            return { borderColor: 'rgba(255, 219, 0, 0.34)', backgroundColor: '#FFFADC' }

        case 'Silver':
            return { borderColor: '#E4E4E4', backgroundColor: '#F6F6F6' }

        case 'Bronze':
            return { borderColor: '#F3D1C2', backgroundColor: '#FFF0EA' }

        case 'Copper':
            return { borderColor: 'rgba(107, 152, 196, 0.46)', backgroundColor: 'rgba(0, 76, 151, 0.11)' }

        default:
            return { borderColor: 'rgba(0, 148, 190, 0.2)', backgroundColor: 'rgba(0, 148, 190, 0.17)' }
    }
}

export const getPOGParams = async (visitId: string, visitType: string, contractId?: string) => {
    let params = { shelf: '', year: '', customerId: '', countryCode: '' }
    try {
        let whereConditions = ''
        if (!visitId) {
            return params
        }
        if (visitType === VisitType.CDA_VISIT) {
            whereConditions = `WHERE Id = '${contractId}'`
        } else if (visitType === VisitType.RESET_VISIT) {
            whereConditions = `WHERE CDA_Reset_Visit__c = '${visitId}'`
        }
        const contractQuery = `SELECT Id,Signed_Medal_Tier__c, CDA_Year__c, CDA_Space_Checkbox__c, Account.CUST_UNIQ_ID_VAL__c, Account.LOC_PROD_ID__c,CDA_Visit__c,Contract_Status__c FROM Contract ${whereConditions}`
        const retailStoreQuery = `SELECT Id, RetailStore.CountryCode FROM Visit WHERE Id = '${visitId}'`
        const contractRes = await syncDownObj('Contract', contractQuery, false)
        const retailStoreRes = await syncDownObj('Visit', retailStoreQuery, false)
        const contract = contractRes?.data[0]

        if (contract) {
            let shelfCount: number
            const cdaVisit = contract?.CDA_Visit__c
            const locationId = contract.Account.LOC_PROD_ID__c
            const customerId = contract?.Account.CUST_UNIQ_ID_VAL__c
            const tier = contract?.Signed_Medal_Tier__c
            const year = contract?.CDA_Year__c
            const cdaSpaceCheckbox = contract?.CDA_Space_Checkbox__c
            const contactId = contract?.Id

            const proposedShelvesName = cdaSpaceCheckbox
                ? AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES
                : AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES
            const totalShelvesName = AssessmentIndicators.TOTAL_LRB_SHELVES

            const shelfCountQuery = `SELECT ActualDecimalValue, AssessmentIndDefinition.Name FROM RetailVisitKpi WHERE VisitId = '${cdaVisit}' AND AssessmentIndDefinition.Name IN ('${proposedShelvesName}', '${totalShelvesName}') AND AssessmentTask.AssessmentTaskDefinition.Name = 'Pre Contract Space Review (User)'`

            const shelfCountRes = await syncDownObj('RetailVisitKpi', shelfCountQuery, false)

            let proposedShelfCount: any
            let totalShelfCount: any

            if (shelfCountRes?.data.length) {
                proposedShelfCount = shelfCountRes.data.find(
                    (item) => item.AssessmentIndDefinition.Name === proposedShelvesName
                )?.ActualDecimalValue
                totalShelfCount =
                    shelfCountRes.data.find((item) => item.AssessmentIndDefinition.Name === totalShelvesName)
                        ?.ActualDecimalValue || 0
            }

            if (_.isNull(proposedShelfCount) || _.isUndefined(proposedShelfCount)) {
                const percentageRes: any = await getPresentData(
                    locationId,
                    year,
                    cdaVisit,
                    contactId,
                    contract.Contract_Status__c
                )

                const percentageData: any[] = percentageRes.data.compositeResponse[1].body.records

                const percentage = percentageData.filter((data) => {
                    return data.TARGET_NAME__c === tier && data.TYPE__c === 'Space Requirements'
                })[0]?.VALUE__c

                shelfCount = Math.round(percentage * totalShelfCount)
            } else {
                shelfCount = Math.round(proposedShelfCount)
            }
            const countryCode = retailStoreRes?.data[0].RetailStore.CountryCode || ''
            params = { shelf: `${shelfCount}`, year, customerId, countryCode: countryCode }
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getShelfCount', `Get Shelf Count: ${getStringValue(error)}`)
    }

    return params
}

export const getPOGFileData = async (pogParams: PogParamsProp | null) => {
    let base64Url
    try {
        if (pogParams) {
            const { shelf, year = '', customerId = '', countryCode = '' } = pogParams
            // Shelf must be an integer
            if (year && customerId) {
                const pogData = {
                    shelf: shelf ? `${Math.round(parseFloat(shelf))}` : shelf,
                    year,
                    customerId,
                    countryCode
                }
                const POGFileData: any = await fetchPOG(pogData)
                if (POGFileData.status === StatusCode.SuccessOK) {
                    base64Url = await blobToBase64(POGFileData.data)
                } else {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'getPOGFileData',
                        `Get POG File Data: ${getStringValue(POGFileData)}`
                    )
                }
            }
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getPOGFileData', `Get POG File Data: ${getStringValue(error)}`)
    }
    return base64Url
}

export const checkPOGFileData = (pogParams: PogParamsProp) => {
    try {
        if (pogParams) {
            const POGFileData: any = fetchPOG(pogParams)
            if (POGFileData.status === StatusCode.SuccessOK) {
                return POGFileData?.data || null
            }
            storeClassLog(Log.MOBILE_ERROR, 'getPOGFileData', `Get POG File Data: ${getStringValue(POGFileData)}`)
            return null
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getPOGFileData', `Get POG File Data: ${getStringValue(error)}`)
        return null
    }
}
