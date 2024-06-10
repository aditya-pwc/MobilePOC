/**
 * SVGDataCheckStatus
 * 0: hard delete or other errors
 * 1: create svg but exists same week
 * 2: data changed but status not
 * 3: status changed to cancelled
 * 4: status changed to published
 * 5: no changes
 * */
export enum SVGDataCheckStatus {
    HARD_DELETE_OR_OTHER_ERROR = 0,
    CREATE_BUT_EXIST = 1,
    DATA_CHANGED_BUT_STATUS = 2,
    STATUS_CHANGED_TO_CANCELLED = 3,
    STATUS_CHANGED_TO_PUBLISHED = 4,
    NO_CHANGES = 5
}

/**
 * DataCheckMsgIndex
 * 0: common msg
 * 1: schedule published
 * 2: schedule cancelled
 * */
export enum DataCheckMsgIndex {
    COMMON_MSG = 0,
    SVG_PUBLISHED_MSG = 1,
    SVG_CANCELLED_MSG = 2
}

/**
 * navigation pop number
 * 1: go back one level
 * 2: go back two levels
 * */
export enum NavigationPopNum {
    POP_ONE = 1,
    POP_TWO = 2,
    POP_THREE = 3
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

/**
 * Event Emitter Type
 */
export enum EventEmitterType {
    REFRESH_NSL = 'refreshNSL',
    REFRESH_SS_MEETING = 'refreshSSMeeting',
    REFRESH_ESL = 'refreshESL',
    REFRESH_RNM = 'refreshRNM',
    REFRESH_RNS = 'refreshRNS',
    REFRESH_COPILOT = 'RefreshCopilot',
    REFRESH_MY_CUSTOMERS = 'RefreshMyCustomers',
    REFRESH_MY_TEAM = 'RefreshMyTeam',
    TRANSFER_LOCATION_DATA = 'locationData',
    TRANSFER_ATTENDEES_ITEM = 'attendeesItem',
    TRANSFER_EMPLOYEE_DATA = 'employeeItemData',
    TRANSFER_CUSTOMER_DATA = 'customerItemData',
    REFRESH_CUSTOMER_SD = 'refreshCustomerSD',
    REFRESH_EMPLOYEE_SD = 'refreshEmployeeSD',
    REFRESH_SCHEDULE_SUMMARY = 'RefreshScheduleSummary',
    BEFORE_REMOVE = 'beforeRemove',
    NOTIFICATION_SHIPMENT = 'notification-shipment',
    MY_CUSTOMER_FILTER = 'myCustomerFilter',
    REFRESH_MAPSTED = 'refreshMapsted'
}

/**
 * Navigation navigate route
 */
export enum NavigationRoute {
    SEARCH_MODAL = 'SearchModal',
    ADD_A_MEETING = 'AddAMeeting',
    SCHEDULE_SUMMARY = 'ScheduleSummary',
    ADD_A_VISIT = 'AddAVisit',
    EMPLOYEE_SCHEDULE_LIST = 'EmployeeScheduleList',
    REVIEW_NEW_SCHEDULE = 'ReviewNewSchedule',
    SELECT_SCHEDULE = 'SelectSchedule',
    UNASSIGN_VISIT = 'UnassignVisit',
    UNASSIGN_EMPLOYEE = 'UnassignEmployee',
    REVIEW_NEW_MEETING = 'ReviewNewMeeting',
    RECURRING_VISIT_DETAIL = 'RecurringVisitDetail',
    CUSTOMER_CAROUSEL_DETAIL = 'CustomerCarouselDetail',
    ADD_RECURRING_VISIT = 'AddRecurringVisit',
    EDIT_DELIVERY_TIME_WINDOW = 'EditDeliveryTimeWindow',
    CUSTOMER_DETAIL = 'CustomerDetail',
    ADD_CUSTOMER = 'AddCustomer',
    EMPLOYEE_DETAIL = 'EmployeeDetail',
    ADD_EMPLOYEE = 'AddEmployee',
    VISIT_DETAILS = 'VisitDetails',
    EMPLOYEE_PROFILE_OVERVIEW = 'EmployeeProfileOverview',
    SDL_VISIT_DETAIL = 'SDLVisitDetails',
    EXPORT_SCHEDULE = 'ExportSchedule'
}

/**
 * Reassign Modal type
 */
export enum ReassignType {
    REASSIGN = 'Reassign',
    DELETE = 'Delete',
    UNASSIGN = 'Unassign',
    RECURRING = 'Recurring'
}

export enum DropDownType {
    INFO = 'info',
    SUCCESS = 'success',
    ERROR = 'error'
}

export enum InitialOrDeltaType {
    INITIAL = 'Initial',
    DELTA = 'Delta'
}

export enum InitialOrDeltaQuery {
    INITIAL_QUERIES = 'initialQueries',
    DELTA_QUERIES = 'deltaQueries'
}

export enum SetTime {
    SEVEN = ' 07:00:00'
}
export enum AccessLevelType {
    // Multi-Location/Region/Market
    MultiLocation = 'Multi-Location',
    Region = 'Region',
    Market = 'Market',
    NBU = 'NBU'
}

export enum WeekDayIndex {
    SUNDAY_NUM = 0,
    SATURDAY_NUM = 6
}

export enum LineCodeGroupType {
    MyTeamGroup = 'MyTeamGroup',
    LandingPageGroup = 'LandingPageGroup'
}

export enum CommonString {
    EMPTY = ''
}

export enum DispatchActionTypeEnum {
    DELETE = 'Delete',
    RESCHEDULE = 'Reschedule',
    GEO_PALLET_OVERRIDE = 'Geo Pallet Override',
    ORDER_SPECIFIC_TIME_WINDOW = 'Order Specific Time Window'
}
export enum PalletType {
    LARGE_PALLET = 'Large Pallet',
    HALF_PALLET = 'Half Pallet'
}

export enum MeetingType {
    SCHEDULED_MEETING = 'Scheduled Meeting',
    MEETING = 'Meeting'
}

export enum MerchEventType {
    LUNCH = 'Lunch',
    BREAK = 'Break',
    PERSONAL_TIME = 'Personal Time',
    MEETING = 'Meeting'
}

export enum ScrollThreshold {
    SCROLL_UP_THRESHOLD = 10,
    SCROLL_DOWN_THRESHOLD = -10
}

export enum OrderDetailType {
    ORDER = 'Order',
    VISIT = 'Visit'
}

export enum VisitDurationIncrement {
    FIFTEEN_MINUTES = 15
}
