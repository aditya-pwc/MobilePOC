import { combineReducers } from '@reduxjs/toolkit'
import { AssessmentIndicators, ContractActionType, ContractBtnType, StepVal, TierDataObj } from '../../enums/Contract'
import { EstimatedData, ExecutionAndDiscountData, getCurrentOrNextYear } from '../../hooks/CustomerContractTabHooks'
import { parseReducer, replaceReducer } from '../common/common'

const defaultSelectYear = {
    [ContractBtnType.START_NEW_CDA]: {
        checkedYear: getCurrentOrNextYear().currentYear,
        disabledYear: ''
    },
    [ContractBtnType.CUSTOMER_DECLINED]: {
        checkedYear: getCurrentOrNextYear().currentYear,
        disabledYear: ''
    }
}
export const initSurveyQuestions = {
    Id: '',
    Account_Paid__c: '',
    Agreement_Type__c: '',
    formButtonClicked: false,
    StartDate: '',
    EndDate: '',
    Draft_Survey_Step__c: StepVal.ZERO,
    AccountId: '',
    Status: '',
    Contract_Status__c: '',
    CDA_Year__c: '',
    Signed_Medal_Tier__c: '',
    // SpaceReview
    [AssessmentIndicators.DOOR_SURVEY]: '', // Number of LRB Doors, Excluding Beer and Dairy Cold Vault
    [AssessmentIndicators.TOTAL_LRB_SHELVES]: '', // Total LRB Shelves
    [AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]: '', // Total Pepsi LRB Shelves
    SpaceReviewCvsN: '',
    SpaceReviewWithTotal: {
        SpaceReviewCvsTotal: ['', '', ''],
        CSD: ['', '', ''],
        Isotonic: ['', '', ''],
        Tea: ['', '', ''],
        Coffee: ['', '', ''],
        Energy: ['', '', ''],
        'Enhanced Water': ['', '', ''],
        Water: ['', '', ''],
        'Juice Drinks': ['', '', ''],
        Protein: ['', '', ''],
        'Chilled Juice': ['', '', ''],
        'Other LRB Total': ['', '', '']
    },
    // Present
    PresentTier: [],
    CDA_Space_Checkbox__c: false,
    [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: '',
    [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: '',
    [AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]: '',
    [AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]: '',
    SelectRewards: {} as { [x: string]: boolean | undefined },
    ExecutionElements: {} as any,
    StoreVolumeData: [] as StoreVolumeSectionData[],
    medalStoreVolumeData: [] as StoreVolumeSectionData[],
    basicStoreVolumeData: [] as StoreVolumeSectionData[],
    retailVisitKpiObj: {} as any,
    isTruckVolume: false,
    isTruckVolumeError: false,
    CustomerSignedName__c: '',
    CustomerSignedTitle: '',
    CustomerSignature: '',
    // Sales Rep Title
    Description: '',
    SignedRepName: '',
    RepSignature: '',
    Compliant__c: true
}

export interface StoreVolumeSectionData {
    id: string
    order: string
    title: string
    showBottomBorder: boolean
    wksVol: string
    useVol: string
    projVolGrowth: string
    projVol: string
    isMedal: boolean
}
export const initOriginRetailVisitKpi = {
    // Step two
    [AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.DOOR_SURVEY]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.TOTAL_LRB_SHELVES]: {
        Id: '',
        ActualDecimalValue: ''
    },
    // Step three
    [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]: {
        Id: '',
        ActualDecimalValue: ''
    },
    [AssessmentIndicators.PROPOSED_VALUES_FOR_EXECUTION_ELEMENTS]: {
        Id: '',
        ActualLongStringValue__c: ''
    },
    [AssessmentIndicators.REWARDS_SELECTION]: {
        Id: '',
        ActualLongStringValue__c: ''
    },
    [AssessmentIndicators.OTHER_LRB_TOTAL]: {
        Id: '',
        ActualDecimalValue: ''
    }
}

export const EnabledRewards = [] as string[]
export const initExecutionData: ExecutionAndDiscountData[] = []
export const initAssessmentTask = { Id: '', Mobile_Unique_ID__c: '', UserAssessmentTaskId: '' }
export const initEvaluationReferenceData = {} as object
export const initTierData: TierDataObj[] = []
export const initEstimated = [] as EstimatedData[]
export const equipmentTokenStr = ''
export const agreementCheck: boolean = true
export const POGBase64: string = ''
export const initNeedUpdateFormStatus: boolean = false

const contractReducer = combineReducers({
    defaultYear: parseReducer(ContractActionType.UPDATE_DEFAULT_YEAR, defaultSelectYear),
    buttonClicked: replaceReducer(ContractActionType.BUTTON_CLICKED, ''),
    checkedYear: replaceReducer(ContractActionType.CHECKED_YEAR, ''),
    disabledYear: replaceReducer(ContractActionType.DISABLED_YEAR, ''),
    surveyQuestionsModalVisible: replaceReducer(ContractActionType.SURVEY_QUESTIONS_MODAL_VISIBLE, false),
    surveyQuestions: parseReducer(ContractActionType.SURVEY_QUESTIONS, initSurveyQuestions),
    pepsicoCalendar: replaceReducer(ContractActionType.PEPSICO_CALENDAR, []),
    activeStep: replaceReducer(ContractActionType.ACTIVE_STEP, StepVal.ZERO),
    nextStepsActiveStep: replaceReducer(ContractActionType.NEXT_STEPS_ACTIVE_STEP, StepVal.ONE),
    disableNewButton: replaceReducer(ContractActionType.DISABLE_NEW_BUTTON, true),
    timeErrMsg: replaceReducer(ContractActionType.DISABLE_TIME_ERR_MSG, ''),
    retailOriginVisitKpi: parseReducer(ContractActionType.RETAIL_VISIT_KPI_ID, initOriginRetailVisitKpi),
    visitId: replaceReducer(ContractActionType.VISIT_ID, ''),
    executionData: replaceReducer(ContractActionType.EXECUTION_DATA, initExecutionData),
    assessmentTask: parseReducer(ContractActionType.FORM_ASSESSMENT_TASK, initAssessmentTask),
    visitKpiIsGenerating: replaceReducer(ContractActionType.VISIT_KPI_IS_GENERATING, false),
    enabledRewards: replaceReducer(ContractActionType.ENABLED_REWARDS, EnabledRewards),
    evaluationReferenceData: parseReducer(ContractActionType.EVALUATION_REFERENCE_DATA, initEvaluationReferenceData),
    estimatedData: replaceReducer(ContractActionType.ESTIMATED, []),
    tierData: replaceReducer(ContractActionType.TIER_DATA, initTierData),
    equipmentTokenData: replaceReducer(ContractActionType.EQUIPMENT_TOKEN, equipmentTokenStr),
    agreementCheck: replaceReducer(ContractActionType.AGREEMENT_CHECK, true),
    POGBase64: replaceReducer(ContractActionType.POG_BASE64, ''),
    needUpdateFormStatus: replaceReducer(ContractActionType.NEED_UPDATE_FORM_STATUS, initNeedUpdateFormStatus)
})

export default contractReducer
