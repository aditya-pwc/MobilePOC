import { ContractActionType } from '../../enums/Contract'

import {
    EnabledRewards,
    initAssessmentTask,
    initEstimated,
    initEvaluationReferenceData,
    initExecutionData,
    initSurveyQuestions,
    initTierData
} from '../reducer/ContractReducer'

export const updateDefaultYearAction = (defaultYear: object) => {
    return {
        type: ContractActionType.UPDATE_DEFAULT_YEAR,
        payload: defaultYear
    }
}

export const setButtonClicked = (type: string) => {
    return {
        type: ContractActionType.BUTTON_CLICKED,
        payload: type
    }
}

export const setCheckedYear = (year: string) => {
    return {
        type: ContractActionType.CHECKED_YEAR,
        payload: year
    }
}

export const setDisabledYear = (year: string) => {
    return {
        type: ContractActionType.DISABLED_YEAR,
        payload: year
    }
}

export const setSurveyQuestionsModalVisible = (modalVisible: boolean) => {
    return {
        type: ContractActionType.SURVEY_QUESTIONS_MODAL_VISIBLE,
        payload: modalVisible
    }
}

export const setSurveyQuestions = (surveyQuestions: typeof initSurveyQuestions) => {
    return {
        type: ContractActionType.SURVEY_QUESTIONS,
        payload: surveyQuestions
    }
}

export const setPepsicoCalendar = (calendar: any[]) => {
    return {
        type: ContractActionType.PEPSICO_CALENDAR,
        payload: calendar
    }
}

export const setActiveStep = (step: string) => {
    return {
        type: ContractActionType.ACTIVE_STEP,
        payload: step
    }
}
export const setNextStepsActiveStep = (nextStep: string) => {
    return {
        type: ContractActionType.NEXT_STEPS_ACTIVE_STEP,
        payload: nextStep
    }
}

export const setDisableNewButton = (disable: boolean) => {
    return {
        type: ContractActionType.DISABLE_NEW_BUTTON,
        payload: disable
    }
}

export const setTimeErrMsg = (errMsg: string) => {
    return {
        type: ContractActionType.DISABLE_TIME_ERR_MSG,
        payload: errMsg
    }
}

export const setOriginRetailVisitKpi = (idsObj: object) => {
    return {
        type: ContractActionType.RETAIL_VISIT_KPI_ID,
        payload: idsObj
    }
}

export const setVisitId = (visitId: string) => {
    return {
        type: ContractActionType.VISIT_ID,
        payload: visitId
    }
}

export const setVisitKpiIsGenerating = (isGenerating: boolean) => {
    return {
        type: ContractActionType.VISIT_KPI_IS_GENERATING,
        payload: isGenerating
    }
}

export const setExecutionData = (executionData: typeof initExecutionData) => {
    return {
        type: ContractActionType.EXECUTION_DATA,
        payload: executionData
    }
}

export const setEnabledRewards = (enabledRewards: typeof EnabledRewards) => {
    return {
        type: ContractActionType.ENABLED_REWARDS,
        payload: enabledRewards
    }
}

export const setAssessmentTask = (assessmentTask: typeof initAssessmentTask) => {
    return {
        type: ContractActionType.FORM_ASSESSMENT_TASK,
        payload: assessmentTask
    }
}

export const setEvaluationReferenceData = (evaluationReferenceData: typeof initEvaluationReferenceData) => {
    return {
        type: ContractActionType.EVALUATION_REFERENCE_DATA,
        payload: evaluationReferenceData
    }
}

export const setEstimatedData = (estimated: typeof initEstimated) => {
    return {
        type: ContractActionType.ESTIMATED,
        payload: estimated
    }
}

export const setTierData = (tierData: typeof initTierData) => {
    return {
        type: ContractActionType.TIER_DATA,
        payload: tierData
    }
}

export const setEquipmentTokenData = (tokenString: string) => {
    return {
        type: ContractActionType.EQUIPMENT_TOKEN,
        payload: tokenString
    }
}
export const setAgreementCheck = (agreementCheck: boolean) => {
    return {
        type: ContractActionType.AGREEMENT_CHECK,
        payload: agreementCheck
    }
}

export const setPOGBase64 = (base64: string) => {
    return {
        type: ContractActionType.POG_BASE64,
        payload: base64
    }
}

export const setNeedUpdateFormStatus = (needUpdateFormStatus: boolean) => {
    return {
        type: ContractActionType.NEED_UPDATE_FORM_STATUS,
        payload: needUpdateFormStatus
    }
}
