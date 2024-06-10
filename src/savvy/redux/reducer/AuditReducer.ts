import { combineReducers } from '@reduxjs/toolkit'
import {
    AssessmentIndicators,
    AuditActionType,
    AuditAssessmentIndicators,
    ShelfSurveyKeyEnum
} from '../../enums/Contract'
import { parseReducer, replaceReducer } from '../common/common'
import { ScoreState } from '../../components/rep/customer/contract-tab/SpaceBreakdownPage'

export const initAudit = {
    contractedShelves: null as null | number,
    formButtonClicked: false,
    logo: '',
    rewardsData: [],
    executionData: [],
    coldVaultData: {
        Id: '',
        VALUE__c: '',
        VALUE_TYPE__c: '',
        SUBTYPE__c: '',
        TARGET_NAME__c: '',
        TYPE__c: '',
        CDA_Admin_Display_Order__c: ''
    },
    perimetersData: {
        Id: '',
        SUBTYPE__c: '',
        Status__c: '',
        TARGET_NAME__c: '',
        TYPE__c: '',
        VALUE_TYPE__c: '',
        VALUE__c: '',
        attributes: ''
    },
    CDAVisitKpi: {
        [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: {
            Id: '',
            ActualDecimalValue: '',
            ActualLongStringValue__c: ''
        },
        [AssessmentIndicators.TOTAL_LRB_SHELVES]: {
            Id: '',
            ActualDecimalValue: '',
            ActualLongStringValue__c: ''
        }
    },
    auditVisitKpi: {
        [AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.ACTUAL_COMP]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.ACTUAL_COMP_SHELVES]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.EXECUTION_ELEMENTS_AUDITED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.REWARDS_AUDITED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.EXECUTION_SCORE]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.OPTIMIZATION_SCORE]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.CONTRACTED_SHELVES]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        // CSV require kpi
        [AuditAssessmentIndicators.CSD_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.ISOTONIC_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.ENERGY_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.WATER_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.ENHANCED_WATER_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.COFFEE_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.JUICE_DRINKS_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.TEA_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.PROTEIN_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        },
        [AuditAssessmentIndicators.CHILLED_JUICE_REQUIRED]: {
            Id: '',
            ActualDecimalValue: null,
            ActualLongStringValue__c: null
        }
    } as Record<
        AuditAssessmentIndicators,
        {
            Id: string
            ActualDecimalValue: null | number
            // eslint-disable-next-line camelcase
            ActualLongStringValue__c: null | string
        }
    >,
    contract: {
        Id: '',
        Signed_Medal_Tier__c: '',
        CDA_Year__c: '',
        CDA_Visit__c: '',
        CDA_Space_Checkbox__c: false
    },
    selectRewards: {},
    executionInputValue: {} as any,
    retailVisitKpiPOGApiValue: {},
    auditVisit: { InstructionDescription: '' } as any,
    [AssessmentIndicators.DOOR_SURVEY]: '', // Number of LRB Doors, Excluding Beer and Dairy Cold Vault
    shelfSurveyData: [] as ShelfSurveyData[],
    auditVisitKpiForm: {} as any,
    auditVisitKpiUser: {} as any,
    requiredKPIValue: {
        requiredExecutionData: {} as any,
        requiredReward: [] as any,
        requiredShelves: {} as any
    },
    executionDataScore: {
        OptimizationScore: '',
        executionScore: ''
    } as ScoreState
}

export interface ShelfSurveyData {
    id: string
    title: string
    [ShelfSurveyKeyEnum.TOTAL_VOL]: string
    [ShelfSurveyKeyEnum.PEPSI]: string
    [ShelfSurveyKeyEnum.PEPSI_VOL]: string
    [ShelfSurveyKeyEnum.COKE]: string
    [ShelfSurveyKeyEnum.COKE_VOL]: string
    [ShelfSurveyKeyEnum.OTHER]: string
    [ShelfSurveyKeyEnum.OTHER_VOL]: string
    [key: string]: string
}

const AuditReducer = combineReducers({
    auditData: parseReducer(AuditActionType.AUDIT, initAudit),
    buttonBeingClicked: replaceReducer(AuditActionType.BTN_TYPE, '')
})

export default AuditReducer
