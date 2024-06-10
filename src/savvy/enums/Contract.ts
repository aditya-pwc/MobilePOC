import { t } from '../../common/i18n/t'
import React from 'react'

export const getMedalMap = () => {
    return {
        Copper: t.labels.PBNA_MOBILE_CDA_MEDAL_COPPER,
        Bronze: t.labels.PBNA_MOBILE_CDA_MEDAL_BRONZE,
        Silver: t.labels.PBNA_MOBILE_CDA_MEDAL_SILVER,
        Gold: t.labels.PBNA_MOBILE_CDA_MEDAL_GOLD,
        Platinum: t.labels.PBNA_MOBILE_CDA_MEDAL_PLATINUM
    } as { [key: string]: string }
}
export const isMedal = (tier: string) => {
    const medalList = ['Copper', 'Bronze', 'Silver', 'Gold', 'Platinum']
    return medalList.includes(tier)
}

export enum medalOrder {
    Basic,
    Blue,
    Copper,
    Bronze,
    Silver,
    Gold,
    Platinum
}

export enum ContractRecordTypeName {
    FSContracts = 'Food Service contracts',
    RetailContracts = 'Retail CDA contracts',
    DeploymentUser = 'Deployment User'
}

export const AgreementTypeMap = () => ({
    [t.labels.PBNA_MOBILE_FS_CONTRACT_VENDING]: t.labels.PBNA_MOBILE_VENDING,
    [t.labels.PBNA_MOBILE_FS_CONTRACT_BEVERAGE]: t.labels.PBNA_MOBILE_BEVERAGE,
    [t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING]: t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING,
    [t.labels.PBNA_MOBILE_OTHER]: t.labels.PBNA_MOBILE_OTHER,
    [t.labels.PBNA_MOBILE_VENDING_AGREEMENT]: t.labels.PBNA_MOBILE_VENDING,
    [t.labels.PBNA_MOBILE_BEVERAGE_AGREEMENT]: t.labels.PBNA_MOBILE_BEVERAGE,
    [t.labels.PBNA_MOBILE_OTHER_CONTRACT]: t.labels.PBNA_MOBILE_OTHER
})

export const medalOrderWithoutBasic = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Copper']

export enum SyncedScrollViewIdEnum {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5
}

export enum IndexEnum {
    MINUS_ONE = -1,
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5
}

export enum PercentageEnum {
    ONE_HUNDRED = 100,
    ONE_THOUSAND = 1000
}

export enum ContractBtnType {
    START_NEW_CDA = 'Start New',
    CUSTOMER_DECLINED = 'Customer Declined',
    EDIT_DRAFT = 'Edit Draft',
    POST_CDA_AUDIT = 'Post CDA Audit',
    GENERAL_AUDIT = 'General Audit'
}

export enum PdfIconType {
    WHITE = 'white',
    BLUE = 'blue'
}

export enum BaseId {
    ONE_THOUSAND = 1000,
    TWO_THOUSAND = 2000,
    THREE_THOUSAND = 3000
}

export enum ContractActionType {
    UPDATE_DEFAULT_YEAR = 'update_default_year',
    BUTTON_CLICKED = 'button_clicked',
    CHECKED_YEAR = 'checked_year',
    DISABLED_YEAR = 'disabled_year',
    SURVEY_QUESTIONS_MODAL_VISIBLE = 'survey_questions_modal_visible',
    SURVEY_QUESTIONS = 'survey_question',
    PEPSICO_CALENDAR = 'pepsico_calendar',
    ACTIVE_STEP = 'active_step',
    NEXT_STEPS_ACTIVE_STEP = 'next_steps_active_step',
    DISABLE_NEW_BUTTON = 'disable_new_button',
    DISABLE_TIME_ERR_MSG = 'time_err_msg',
    RETAIL_VISIT_KPI_ID = 'retail_visit_kpi_id',
    VISIT_ID = 'visit_id',
    EXECUTION_DATA = 'execution_data',
    FORM_ASSESSMENT_TASK = 'form_Assessment_Task',
    VISIT_KPI_IS_GENERATING = 'visit_kpi_is_generating',
    ENABLED_REWARDS = 'Enabled_Rewards',
    EVALUATION_REFERENCE_DATA = 'Evaluation_Reference_Data',
    ESTIMATED = 'estimated',
    TIER_DATA = 'tierData',
    AGREEMENT_CHECK = 'agreementCheck',
    POG_BASE64 = 'pogBase64',
    EQUIPMENT_TOKEN = 'equipment_token',
    NEED_UPDATE_FORM_STATUS = 'needUpdateFormStatus'
}

export enum AuditActionType {
    AUDIT = 'Audit',
    BTN_TYPE = 'Button Being Clicked'
}

export enum NumberConstants {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FIFTEEN = 15,
    TWENTY_ONE = 21
}

export const enum ContractStatus {
    InProgress = 'In progress',
    Signed = 'Signed',
    Declined = 'Declined',
    Cancelled = 'Cancelled'
}

export const enum AgreementType {
    MEDAL_CONTRACT = 'Medal Contract',
    BASIC_WHITE_SPACE_CONTRACT = 'Basic/White Space Contract'
}

export const isAgreementMedal = (agreementType: string) => {
    return agreementType === AgreementType.MEDAL_CONTRACT
}

export const enum StartDateType {
    TODAY = 'Current day + 1',
    FISCAL_YEAR = 'Day one of Pepsi fiscal year'
}

export const enum AccountPaidVal {
    ON_TICKET = 'On Ticket',
    OFF_TICKET = 'Off Ticket'
}

export const enum TargetsForecastsValueType {
    FREE_CASES = 'Free Cases',
    FUNDING = 'Funding'
}

export type MyAction = { type: string; payload: any }

export const enum StepVal {
    ZERO = '0',
    ONE = '1',
    TWO = '2',
    THREE = '3',
    FOUR = '4'
}

export const enum StepNumVal {
    ZERO = 0,
    ONE = 1,
    TWO = 2
}

export interface BtnGroupProps {
    disableNewButton: boolean
    disableDeclineButton: boolean
    readonly: boolean
    setShowYearModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    declinedCDALoading: boolean
    visitKpiIsGenerating: boolean
    retailStore: any
}
export interface TierDataObj {
    name: string
    select: boolean
}
export interface PogParamsProp {
    shelf: string
    year: string
    customerId: string
    countryCode: string
}

export const enum AssessmentIndicators {
    TOTAL_LRB_PEPSI_SHELVES = 'Total LRB Pepsi Shelves',
    DOOR_SURVEY = 'Door Survey',
    TOTAL_LRB_SHELVES = 'Total LRB Shelves',
    PROPOSED_VALUES_FOR_EXECUTION_ELEMENTS = 'Proposed Values for Execution Elements',
    REWARDS_SELECTION = 'Rewards Selection',
    PROPOSED_PEP_LRB_PERCENTAGE = 'Proposed Pep LRB Space %',
    PROPOSED_PEP_LRB_SHELVES = 'Proposed Pep LRB Shelves',
    PROPOSED_PEP_PERIMETER_SHELVES = 'Proposed pep perimeter shelves',
    PROPOSED_PEP_COLD_VAULT_SHELVES = 'Proposed pep Cold vault shelves',
    OTHER_LRB_TOTAL = 'Other LRB Total'
}

export enum CSVApiKey {
    CSD = 'CSD',
    ISOTONIC = 'Isotonic',
    ENERGY = 'Energy',
    WATER = 'Water',
    ENHANCED_WATER = 'Enhanced Water',
    COFFEE = 'Coffee',
    JUICE_DRINKS = 'Juice Drinks',
    TEA = 'Tea',
    PROTEIN = 'Protein',
    CHILLED_JUICE = 'Chilled Juice'
}

export enum AuditAssessmentIndicators {
    TOTAL_PEP_LRB_AUDIT = 'Total Pep LRB % (Audit)',
    TOTAL_PEP_LRB_SHELVES_AUDIT = 'Total Pep LRB Shelves (Audit)',
    REP_COLD_VAULT_SHELVES_AUDIT = 'Pep Cold Vault Shelves (Audit)',
    PEP_PERIMETER_SHELVES_AUDIT = 'Pep Perimeter Shelves (Audit)',
    ACTUAL_COMP = 'Actual Comp %',
    ACTUAL_COMP_SHELVES = 'Actual Comp Shelves',
    EXECUTION_ELEMENTS_AUDITED = 'Execution Elements Audited',
    REWARDS_AUDITED = 'Rewards Audited',
    CSD_ACTUAL = 'CSD Actual',
    ISOTONIC_ACTUAL = 'Isotonic Actual',
    TEA_ACTUAL = 'Tea Actual',
    COFFEE_ACTUAL = 'Coffee Actual',
    ENERGY_ACTUAL = 'Energy Actual',
    ENHANCED_WATER_ACTUAL = 'Enhanced Water Actual',
    WATER_ACTUAL = 'Water Actual',
    JUICE_DRINKS_ACTUAL = 'Juice Drinks Actual',
    PROTEIN_ACTUAL = 'Protein Actual',
    CHILLED_JUICE_ACTUAL = 'Chilled Juice Actual',
    CSD_REQUIRED = 'CSD Required',
    ISOTONIC_REQUIRED = 'Isotonic Required',
    TEA_REQUIRED = 'Tea Required',
    COFFEE_REQUIRED = 'Coffee Required',
    ENERGY_REQUIRED = 'Energy Required',
    ENHANCED_WATER_REQUIRED = 'Enhanced Water Required',
    WATER_REQUIRED = 'Water Required',
    JUICE_DRINKS_REQUIRED = 'Juice Drinks Required',
    PROTEIN_REQUIRED = 'Protein Required',
    CHILLED_JUICE_REQUIRED = 'Chilled Juice Required',
    EXECUTION_SCORE = 'Execution Score',
    OPTIMIZATION_SCORE = 'Optimization Score',
    CONTRACTED_SHELVES = 'Contracted Shelves'
}
export enum GeneralAuditAssessmentIndicators {
    CSD_SHELVES = 'CSD Shelves',
    ISOTONIC_SHELVES = 'Isotonic Shelves',
    TEA_SHELVES = 'Tea Shelves',
    COFFEE_SHELVES = 'Coffee Shelves',
    ENERGY_SHELVES = 'Energy Shelves',
    ENHANCED_WATER_SHELVES = 'Enhanced Water Shelves',
    WATER_SHELVES = 'Water Shelves',
    JUICE_DRINKS_SHELVES = 'Juice Drinks Shelves',
    PROTEIN_SHELVES = 'Protein Shelves',
    CHILLED_JUICE_SHELVES = 'Chilled Juice Shelves',
    OTHER_LRB_SHELVES = 'Other Shelves LRB'
}

export enum GeneralAuditSumKpi {
    TOTAL_LRB_SHELVES = 'Total LRB Shelves',
    TOTAL_PEP_SHELVES = 'Total LRB Pepsi Shelves',
    TOTAL_COKE_SHELVES = 'Total LRB Coke Shelves',
    TOTAL_OTHER_SHELVES = 'Total LRB Other Shelves'
}

export const enum IntervalTime {
    TEN = 10,
    ONE_HUNDRED = 100,
    FIVE_HUNDRED = 500,
    ONE_THOUSAND = 1000,
    TWO_THOUSAND = 2000,
    THREE_THOUSAND = 3000,
    FIVE_THOUSAND = 5000
}

export const enum DataType {
    OVERVIEW = 'Overview',
    PERCENTAGE = 'Percentage',
    SPACE_REQUIREMENTS = 'Space Requirements'
}

export const enum DatumType {
    REWARDS = 'Rewards',
    SELL_SHEET = 'Sell Sheet',
    FUNDING_PACKAGES = 'Funding Packages',
    FUNDING_PACKAGES_CRITERIA_GROUPS = 'Funding Packages Criteria Groups',
    COLD_VAULT_OR_PERIMETER = 'Cold Vault or Perimeter'
}

export const enum SubType {
    MEDAL = 'Medal',
    BASIC = 'Basic',
    BOTH = 'Both'
}

export const enum TierShowEntryType {
    TIER_SELECTION = 'Tier Selection'
}

export const enum Country {
    US = 'United States',
    Canada = 'Canada'
}

export const enum Languages {
    English = 'English',
    French = 'French'
}

export const enum MedalSubType {
    MEDAL = 'Medal',
    BASIC = 'Basic'
}

export const enum CountryType {
    CA = 'CA',
    US = 'US',
    CANADA = 'Canada Space Review',
    UNITED_STATES = 'United States Space Review',
    UNITED_STATES_AUDIT = 'United States Audit',
    CANADA_AUDIT = 'Canada Audit'
}

export const enum MissionType {
    MISSION_POST_CDA_AUDIT = 'Post CDA Audit',
    MISSION_GENERAL_AUDIT = 'General Audit',
    MISSION_SPACE_REVIEW = 'Space Review',
    MISSION_REALOGRAM = 'Realogram'
}

export enum IntEnum {
    ZERO = '0',
    ONE = '1',
    ONE_HUNDRED = '100',
    NINE_HUNDRED_AND_NINETY_NINE = '999',
    NINE_THOUSAND_NINE_HUNDRED_AND_NINETY_NINE = '9999' // Nine thousand nine hundred and ninety-nine
}

export enum BooleanEnum {
    TRUE = 'T',
    FALSE = 'F',
    VALUE = 'True'
}

export enum ContentTypeEnum {
    PDF = `data:application/pdf;base64,`
}

export enum EstimatedValuesEnum {
    ZERO = '0.00',
    UNDEFINED = 'N/A'
}

export enum VisitSubtypeEnum {
    POST_CONTRACT_AUDIT = 'Post Contract Audit',
    GENERAL_AUDIT = 'General Audit',
    CDA_CONTRACT = 'CDA',
    REALOGRAM = 'Realogram'
}

export interface AuditBtnGroupProps {
    disablePostCDAAuditBtn: boolean
    disableGeneralAuditBtn: boolean
    onGeneralAudit: any
    onPostCDAAudit: any
    isPostCDAAuditLoading: boolean
    isGeneralAuditLoading: boolean
}

export enum FORMStatusEnum {
    NOT_START = 'not start',
    START = 'start',
    PENDING = 'pending',
    COMPLETE = 'complete',
    IR_PROCESSING_WITH_EDIT_TAG = 'IR Processing Edit rue',
    IR_PROCESSING_WITHOUT_EDIT_TAG = 'IR Processing Edit False',
    PENDING_REVIEW_WITH_EDIT_TAG = 'Pending Review Edit rue',
    PENDING_REVIEW_WITHOUT_EDIT_TAG = 'Pending Review Edit False'
}

export enum ShelfSurveyKeyEnum {
    TOTAL = 'Total',
    TOTAL_VOL = 'TotalVol',
    PEPSI = 'Pepsi',
    PEPSI_VOL = 'PepsiVol',
    COKE = 'Coke',
    COKE_VOL = 'CokeVol',
    OTHER = 'Other',
    OTHER_VOL = 'OtherVol'
}

export enum VisitType {
    CDA_VISIT = 'CDA Visit',
    RESET_VISIT = 'reset Visit'
}

export enum FormNotificationType {
    'FORM_KPI' = 'FORM_KPI',
    'NOT_LOAD' = 'NOT_LOAD'
}

export enum RealogramNotificationType {
    'REALOGRAM' = 'Realogram',
    IRNotLoad = 'IR_NOT_LOAD'
}

export enum ContractAndAuditSubTab {
    'AUDIT' = 'Audit',
    'CONTRACT' = 'Contract'
}

export const enum kpiKey {
    ACTUAL_DECIMAL_VALUE = 'ActualDecimalValue',
    ID = 'id',
    TITLE = 'title'
}

export interface StaticResourceBase64Obj {
    lstContractFile: string[]
    lstPepsiPartnerShip: string[]
}

export enum HttpError {
    NETWORK_ERROR = 'Network Error'
}

export enum FORMUrlStatusEnum {
    COMPLETED = 'completed'
}

export enum FormType {
    Contract = 'contract',
    Realogram = 'Realogram',
    Audit = 'audit'
}

export interface LocalFormData {
    type: string
    visitId: string
    mobileUniqueId: string
    isEditForm: boolean
}

export enum TFStatus {
    Deactivated = 'Deactivated'
}
