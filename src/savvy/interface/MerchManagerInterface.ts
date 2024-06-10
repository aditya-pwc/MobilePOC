export interface EmployeeProps {
    item?: any
    isLandScape?: boolean
    manager?: any
    index?: number
    isReview?: boolean
    isReassign?: boolean
    navigation?: any
    hasCallIcon?: boolean
    disabled?: boolean
    itemKey?: string
    click?: Function
    selectForAssign?: any
    onCellPress?: any
    reassignCallBack?: any
    fromEmployeeSchedule?: boolean
    isEdit?: boolean
    isFuture?: boolean
    extraItemKey?: any
    type?: any
    setIsLoading?: any
    closeModal?: any
    onCheckBoxClick?: Function
    visitListId?: string
    setIsErrorShow?: Function
    setErrorMsgType?: Function
    swipeableRows?: Object
    handleBtnClick?: Function
    reassignModalRef?: any
    needArrowIcon?: boolean
    isUGMPersona?: boolean
    isLastItem?: boolean
    isOptimized?: boolean
}

export interface GetDataInterface {
    visitListId?: string
    dropDownRef?: any
    lineCodesQuery?: string
    scheduleDate?: string
}

export interface GetDataForReassignInterface {
    visitListId?: string
    dropDownRef?: any
    userLocationId?: string
    scheduleDate?: string
    isOnlyMyTeamEmployees?: boolean
}

export interface PointInterface {
    latitude?: string
    longitude?: string
}

export type Points = Array<PointInterface>

export interface CalculateDetailInterface {
    distance: string
    travelTime: string
}
export interface CalculateResultInterface {
    totalDistance?: number
    totalTravelTime?: number
    detailList?: Array<CalculateDetailInterface>
}

export interface QueryAndSyncScheduleInterface {
    startDate: string
    endDate: string
    dropDownRef: any
    setIsLoading: any
}

export interface QueryWeeklyForReassignInterface {
    item: any
    startDate: string
    endDate: string
    isPublished: boolean
    dropDownRef: any
    setIsLoading: any
}

export interface QueryDailyForReassignInterface {
    item: any
    clause?: string
    visitDates: any
    weekVisitList: any
    isPublished: boolean
    dropDownRef?: any
    setIsLoading: any
    dailyRecordTypeId?: string
}

export interface DeleteCTRInterface {
    CTRIDs: any
    dropDownRef: any
    selectDayKey: any
    setData: any
    setWeekDays: any
    refMonthWeek: any
    setSelectDayKey: any
    setSortList: any
    customerDetail?: boolean
    setUserData?: any
    userData?: any
    setReassignUserData?: any
    customerData?: any
}

export interface RefreshCTRInterface {
    customerToRouteMap: any
    dropDownRef: any
    userData?: any
    selectDayKey: any
    setData: any
    setWeekDays: any
    refMonthWeek: any
    setSelectDayKey: any
    setSortList: any
    customerDetail?: boolean
    setReassignUserData?: any
    setUserData?: any
    customerData?: any
}

export interface DeleteSelectToSoupProps {
    callback: any
    dropDownRef: any
    deleteSelectData: any
    data: any
    selectDayKey: any
    setData: any
    setWeekDays: any
    refMonthWeek: any
    setSelectDayKey: any
    setSortList: any
    setReassignUserData?: any
    userData?: any
    customerDetail?: boolean
    customerData?: any
    setUserData?: any
    lineCodeMap?: any
}

export interface QueryAndSyncWeeklyForAddInterface {
    employeeId: string
    startDate: string
    endDate: string
    searchEmployeeText: string
    scheduleAdHoc: boolean
    durationTime: any
    visitCase: any
    setIsLoading: any
    dropDownRef: any
}
