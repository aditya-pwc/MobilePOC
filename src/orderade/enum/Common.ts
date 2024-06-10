export enum DropDownType {
    INFO = 'info',
    SUCCESS = 'success',
    ERROR = 'error'
}

/**
 * boolean string
 * '0': false
 * '1': true
 */
export enum BooleanStr {
    STR_FALSE = '0',
    STR_TRUE = '1'
}

export enum BCDAccessType {
    BCDCompanyName = 'BCD_Company',
    BCDPersona = 'BCD_Persona',
    BCDPriceBook = 'BCD_Pricebook',
    PBNAPriceBook = 'PBNA_Pricebook',
    PBNALogDevelopmentName = 'Mobile_Log_File'
}

export enum PricePriority {
    WHOLESALE_PRICE = 'Wholesale Price',
    BUSINESS_SEGMENT_DEAL = 'Business Segment Deal',
    CUSTOMER_DEAL = 'Customer Deal',
    BU_RESTRICTED_DEAL = 'BU Restricted Deal',
    PO_DEAL = 'PO Deal',
    SDC = 'SDC',
    BASE_NATIONAL_PRICE = 'Base National Price',
    NATIONAL_ACCOUNT_DEAL = 'National Account Deal',
    OVERRIDE = 'Override',
    CS_GRID = 'CS Grid',
    BU_QUERY_TARGET = 'BU Query Target',
    OTHER_DEALS = 'Other Deals'
}

export enum PriceTypeCode {
    TRI = 'TRI',
    CST = 'CST'
}

export enum PriceCustomerDealConstant {
    CD_TYPE_QTV = 'qry_trgt_val',
    CD_TYPE_TL = 'target_list',
    CD_TYPE_CT = 'customer_target',
    CD_TYPE_CGC = 'cust_group_cust',
    CD_TYPE_CGM = 'cust_grp_mbr',
    CD_TARGET_NAME_BU = 'BusinessUnit',
    CD_TARGET_NAME_BS = 'BusinessSegment',
    CD_TARGET_NAME_PZ = 'PriceZone',
    CD_TARGET_NAME_CG = 'CustomerGroup',
    CD_TARGET_NAME_CQT = 'CS Query Target',
    CD_TARGET_FIELD_QT = 'Query Target'
}

export enum PriceDealConstant {
    DEAL_TYPE_CODE_BU = 'BU',
    DEAL_TYPE_CODE_PZ = 'PZ',
    DEAL_TYPE_ID_5 = '5',
    DEAL_VOLUME_QUANTITY_O = 0
}

export enum NationalAccountPriceConstant {
    ACC_TYPE_ID_000 = '000',
    ACC_VOLUME_HURDLE_O = '0.0'
}

export enum ProductListingConstant {
    PL_LEVEL = 'Location'
}

export enum CustomerToRouteConstant {
    CTR_SMC_003 = '003',
    CTR_RECORD_TYPE_NAME_CTR = 'CTR'
}

export enum RouteSalesGEOConstant {
    RSG_HL_LOCATION = 'Location',
    RSG_HL_ROUTE = 'Route',
    RSG_SLS_UNIT_FLG_ACTIVE = 'ACTIVE',
    RSG_RTE_TYPE_CDV_001 = '001',
    RSG_RTE_TYPE_CDV_003 = '003'
}

export enum OrderLineActivityCde {
    RETURN = 'RET',
    DELIVERY = 'DEL'
}

export enum OrderLineActivityCdv {
    PBNA = '001',
    BCD = '0'
}

export enum ReturnConditionLabels {
    SALEABLE = 'Saleable',
    BREAKAGE = 'Breakage',
    OUTOFDATE = 'OutOfDate'
}

export const ReturnConditionStatusCodeMap = {
    Saleable: '001',
    Breakage: '002',
    OutOfDate: '003'
}

export const OCHSettingMetaDataTypes = {
    AUTO_SYNC_UP_INTERVAL: 'Auto SyncUp Interval',
    ORDER_TIME_OUT: 'Order Time Out',
    ORDER_RETRY_COUNT: 'Order Retry Count',
    ORDER_RETRY_TIMING: 'Order Retry Timing'
}

export enum ReturnOrderSuffix {
    RETURN_ONLY = 'RETURN_ONLY',
    ONGOING_ORDER = 'ONGOING_ORDER',
    RETURN_ONLY_BACKUP = 'RETURN_ONLY_BACKUP',
    ONGOING_ORDER_BACKUP = 'ONGOING_ORDER_BACKUP',
    ONGOING_ORDER_MY_CART_BACKUP = 'ONGOING_ORDER_MY_CART_BACKUP'
}

export enum DefaultNumber {
    stringZero000 = '0.00',
    twoHorizontalLine = '--',
    dollar = '$',
    verticalLine = '|'
}

export enum RevampTooltipScreen {
    InactiveProductScreen = 'InactiveProductScreen',
    RequestNewPOSScreen = 'RequestNewPOSScreen'
}

export enum ScreenName {
    OrderSummaryScreen = 'OrderSummaryScreen'
}

export enum EDVDealCategoryCodes {
    EDV = 'EDV'
}

export enum PageNames {
    INACTIVE_PROD = 'inactive product',
    ORDER_SUMMARY = 'order summary',
    PROD_SELLING = 'product selling'
}

export enum VisitRecordTypes {
    SALES = 'Sales'
}

export enum MetaLabelTypes {
    WHOLESALE_MAX_PRICE = 'Wholesale Max Price',
    WHOLESALE_MAX_PRICE_FALLBACK = '60.00'
}

export enum PriceIndexType {
    MANUAL_INPUT = -2,
    UNSELECTED = -1
}
