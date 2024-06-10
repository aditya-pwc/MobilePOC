/**
 * @description Add a visit in review new schedule.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-27
 */

import moment from 'moment'
import 'moment-timezone'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Modal, NativeAppEventEmitter, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ScrollView } from 'react-native-gesture-handler'
import CText from '../../../../common/components/CText'
import { CommonParam } from '../../../../common/CommonParam'
import NavigationBar from '../../common/NavigationBar'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import Loading from '../../../../common/components/Loading'
import AddAVisitStyle from '../../../styles/manager/AddAVisitStyle'
import { EventEmitterType, NavigationRoute, LineCodeGroupType } from '../../../enums/Manager'
import { setLoggedInUserTimezone, formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import { syncDownObj } from '../../../api/SyncUtils'
import { RadioButton } from '../../../helper/rep/FilterLeadListLocationHelper'
import store from '../../../redux/store/Store'
import { getMyTeamUnassignedServiceDetail } from '../helper/ServiceDetailHelper'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { SoupService } from '../../../service/SoupService'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import PickerTile from '../../rep/lead/common/PickerTile'
import { Log } from '../../../../common/enums/Log'
import { SchedulePdfPage } from './SchedulePdfHelper'
import { getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DatePickerLocale } from '../../../enums/i18n'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const styles = AddAVisitStyle
interface AddAVisitProps {
    props?: any
    route?: any
    navigation?: any
    isESchedule?: boolean
    isPublished: boolean
    planDate: any
}
setLoggedInUserTimezone()
const transferString = (arrayData) => {
    if (_.isArray(arrayData)) {
        return `'${arrayData.join("','")}'`
    }
    return ''
}

const getCurrentDay = () => {
    return moment().clone().toDate()
}

const getMinDate = () => {
    return getCurrentDay()
}

const setDataPick = (selectedDate, setShowDatePicker, scheduleDate, setScheduleDate) => {
    setScheduleDate(selectedDate)
    if (
        formatWithTimeZone(selectedDate, TIME_FORMAT.DD, true) !==
        formatWithTimeZone(scheduleDate, TIME_FORMAT.DD, true)
    ) {
        setShowDatePicker(false)
    }
}

const composeMyTeamData = async (result) => {
    const items = {}
    let index = -1
    const tempSalesRoute = {}
    const tempNRID = {}
    result.forEach(async (user: any) => {
        if (!items[user.UserId]) {
            index++
        }
        if (user.LOCL_RTE_ID__c) {
            tempSalesRoute[user.UserId] = user.LOCL_RTE_ID__c
        }
        if (user.GTMU_RTE_ID__c) {
            tempNRID[user.UserId] = user.GTMU_RTE_ID__c
        }
        items[user.UserId] = {
            index,
            id: user.UserId,
            name: user.Username,
            firstName: user.FirstName,
            lastName: user.LastName,
            title: user.Title,
            phone: user.MobilePhone,
            gpid: user.GPID,
            location: user.LocationName,
            ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
            startTime: user.Start_Time__c,
            startLocation: user.StartLocation,
            salesFunction: user.Sales_Function__c,
            photoUrl: user.SmallPhotoUrl,
            userStatsId: user.UserStatsId,
            deletableDirectly: _.isEmpty(user.SDID),
            salesRoute: tempSalesRoute[user.UserId] || '-',
            nrid: tempNRID[user.UserId] || '-',
            terminateUser: !_.isEmpty(user.WRKFRC_EMPLYMT_TRMNTN_DT__c),
            lineCode: user.LC_ID__c,
            merchandisingBase: user.SMerchandising_Base__c,
            workingStatus: getWorkingStatus(user)
        }
    })
    const unassignedRouteUsers = await getMyTeamUnassignedServiceDetail()
    if (!_.isEmpty(unassignedRouteUsers)) {
        // setHasUnassignedRoute(true)
        unassignedRouteUsers.forEach((user) => {
            items[user.Id] = {
                id: user.Id,
                name: user.Name,
                firstName: user.FirstName,
                lastName: user.LastName,
                gpid: user.GPID__c,
                totalVisit: user.TotalVisit,
                unassignedRoute: true
            }
        })
    }
    return items
}

export const filterEmployeeData = (params) => {
    const { users, resolve, setIsLoading, reject, lineCodeMap } = params
    const merchUsers = []

    try {
        const lineCode = lineCodeMap.get(LineCodeGroupType.MyTeamGroup)
        const salesCodes = lineCode ? lineCode[UserType.UserType_Sales] : []
        users.forEach(async (item: any) => {
            if (!salesCodes.includes(item.lineCode) || item.unassignedRoute) {
                merchUsers.push(item)
            }
        })
        resolve(merchUsers)
        setIsLoading(false)
    } catch (error) {
        setIsLoading(false)
        reject([])
    }
}

const getEmployeeData = async (params) => {
    const { setIsLoading, showLoading = true, lineCodeMap } = params
    if (showLoading) {
        setIsLoading(true)
    }
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveMyTeamList.f,
            formatString(ScheduleQuery.retrieveMyTeamList.q, [CommonParam.userLocationId]) +
                ScheduleQuery.retrieveMyTeamList.orderBy
        )
            .then(async (result: any) => {
                const items = await composeMyTeamData(result)
                const users = Object.values(items)
                if (!_.isEmpty(users)) {
                    filterEmployeeData({
                        users,
                        resolve,
                        setIsLoading,
                        reject,
                        lineCodeMap
                    })
                } else {
                    resolve([])
                }
            })
            .catch(() => {
                setIsLoading(false)
                reject([])
            })
    })
}

const assignAllEmployeeIds = (employees, setEmployeeIds) => {
    let result = []
    if (_.isArray(employees)) {
        const ids = employees.map((employee) => {
            return employee.id
        })
        result = ids
        setEmployeeIds(ids)
    }
    return result
}

const getWeeklyIntervalOpts = (maxDate) => {
    const result = {}
    const currentDayWeekEndDay = moment().endOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
    const maxDayWeekEndDay = moment(maxDate).endOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
    const WEEK_COUNT = Math.floor(moment(maxDayWeekEndDay).diff(currentDayWeekEndDay, 'w'))
    for (let i = 0; i <= WEEK_COUNT; i++) {
        const value = []
        const endDate = moment().clone().add(i, 'w').endOf(MOMENT_STARTOF.WEEK).toDate()
        const weeklyStartDate = moment().clone().add(i, 'w').startOf(MOMENT_STARTOF.WEEK).toDate()
        const startDate = moment(weeklyStartDate).isBefore(getCurrentDay()) ? getCurrentDay() : weeklyStartDate
        for (let j = 0; !moment(startDate).add(j, 'd').isAfter(endDate); j++) {
            value.push(moment(startDate).add(j, 'd').clone().toString())
        }
        const text = `${formatWithTimeZone(startDate, TIME_FORMAT.MMM_DD, true)} - ${formatWithTimeZone(
            endDate,
            TIME_FORMAT.MMM_DD,
            true
        )}`
        result[text] = value
    }
    return result
}

const getDailyMaxDate = async (employeeIds, setMaxDailyDate, setWeeklyOptionsMap, setSelectedWeekStr) => {
    try {
        const publishedSVGList = store
            .getState()
            .manager.publishedSVGList.filter((item) => item.Status__c === 'Accepted')
        let maxDate = moment().clone().endOf(MOMENT_STARTOF.WEEK).toDate()
        if (!_.isEmpty(publishedSVGList)) {
            publishedSVGList.sort((a, b) => {
                if (moment(a.End_Date__c).isAfter(moment(b.End_Date__c))) {
                    return -1
                }
                return 1
            })
            const lastSchedule = publishedSVGList[0]
            const q = `
                SELECT
                id,
                visit_date__c
            FROM
                visit_list__c
            WHERE
                recordtype.name = 'merch daily visit list'
                and owner.Id IN (${transferString(employeeIds)})
                and visit_date__c >= ${lastSchedule.Start_Date__c} and visit_date__c <= ${lastSchedule.End_Date__c}
            ORDER by visit_date__c Desc
            LIMIT 1
            `
            const res = await syncDownObj('Visit_list__c', q, false)
            if (res?.data) {
                const maxVisitDate = res?.data[0]?.Visit_Date__c
                if (moment(maxDate).isBefore(moment(maxVisitDate))) {
                    maxDate = res?.data[0]?.Visit_Date__c
                }
            }
        }
        setMaxDailyDate(maxDate)
        const WEEKLY_OPTIONS_MAP = getWeeklyIntervalOpts(maxDate)
        setWeeklyOptionsMap(WEEKLY_OPTIONS_MAP)
        setSelectedWeekStr(Object.keys(WEEKLY_OPTIONS_MAP)[0])
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getDailyMaxDate', getStringValue(error))
    }
}
const initEmployeeData = async (param) => {
    const {
        setAllMerchOriginData,
        setEmployeeIds,
        setIsLoading,
        lineCodeMap,
        setMaxDailyDate,
        setWeeklyOptionsMap,
        setSelectedWeekStr
    } = param
    const merchEmployees = await getEmployeeData({
        setIsLoading,
        showLoading: true,
        lineCodeMap
    })
    if (_.isArray(merchEmployees)) {
        setAllMerchOriginData(merchEmployees)
        const employeeIds = assignAllEmployeeIds(merchEmployees, setEmployeeIds)
        getDailyMaxDate(employeeIds, setMaxDailyDate, setWeeklyOptionsMap, setSelectedWeekStr)
    }
}

enum ScheduleType {
    AllEmployees,
    OneEmployee
}
export enum DateType {
    FullDay,
    FullWeek
}

const ExportSchedule = ({ route, navigation }: AddAVisitProps) => {
    const { isPublished, employeePublish } = route.params
    const { dropDownRef } = useDropDown()
    const [searchEmployeeText, setSearchEmployeeText] = useState('')
    const [scheduleType, setScheduleType] = useState(ScheduleType.AllEmployees)
    const [dateType, setDateType] = useState(DateType.FullDay)
    const [scheduleDate, setScheduleDate] = useState(getCurrentDay())
    const [employeeIds, setEmployeeIds] = useState([])
    const [employeeId, setEmployeeId] = useState('')
    const [isExportButtonActive, setIsExportButtonActive] = useState(false)
    const [allMerchOriginData, setAllMerchOriginData] = useState([])
    const [maxDailyDate, setMaxDailyDate] = useState(moment().clone().endOf(MOMENT_STARTOF.WEEK))
    const [weeklyOptionsMap, setWeeklyOptionsMap] = useState({})
    const [selectedWeekStr, setSelectedWeekStr] = useState('')

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const MIN_DATE = getMinDate()
    const SEARCH_TEXT = t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE
    const TITLE = t.labels.PBNA_MOBILE_EXPORT_AND_SHARE.toLocaleUpperCase()

    const onScheduleDateChange = (_event, selectedDate) => {
        setDataPick(selectedDate, setShowDatePicker, scheduleDate, setScheduleDate)
    }

    const onSearch = (searchType, employeeData) => {
        navigation.navigate(NavigationRoute.SEARCH_MODAL, {
            searchType,
            isPublished,
            employeePublish,
            isExportSchedule: true,
            hasEmployeeData: true,
            employeeData,
            customTitle: t.labels.PBNA_MOBILE_EXPORT_AND_SHARE.toLocaleUpperCase()
        })
    }

    const onCancelClick = () => {
        navigation.goBack()
    }

    useEffect(() => {
        // query all the MDs, and push all the employeeId of MD into employeeIds

        const lineCodeMap = store.getState().manager.lineCodeMap
        initEmployeeData({
            setAllMerchOriginData,
            setEmployeeIds,
            setIsLoading,
            lineCodeMap,
            setMaxDailyDate,
            setWeeklyOptionsMap,
            setSelectedWeekStr
        })
    }, [])

    useEffect(() => {
        // is export button active
        let isEmployeeValid
        if (scheduleType === ScheduleType.OneEmployee) {
            if (employeeId) {
                isEmployeeValid = true
            }
        } else {
            isEmployeeValid = true
        }

        const isBtnActive = isEmployeeValid
        setIsExportButtonActive(isBtnActive)
    })

    useEffect(() => {
        const employeeDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.TRANSFER_EMPLOYEE_DATA,
            (item) => {
                setSearchEmployeeText(item.name)
                setEmployeeId(item.id)
            }
        )
        return () => {
            employeeDataListener && employeeDataListener.remove()
        }
    }, [])

    const queryScheduleData = async () => {
        let ownerCondition
        if (scheduleType === ScheduleType.OneEmployee) {
            ownerCondition = `owner.Id = '${employeeId}'`
        } else if (scheduleType === ScheduleType.AllEmployees) {
            ownerCondition = `owner.Id IN (${transferString(employeeIds)})`
        }

        let dateCondition, q
        if (dateType === DateType.FullDay) {
            dateCondition = `visit_date__c = ${formatWithTimeZone(scheduleDate, TIME_FORMAT.Y_MM_DD, true)}`
            q = `
            SELECT
                id,
                name,
                start_date_time__c,
                end_date_time__c,
                actual_mileage__c,
                Planned_Meeting_Time__c,
                Total_Planned_Time__c,
                Planned_Travel_Time__c,
                visit_date__c,
                owner.Id,
                Status__c,
                (
                    select
                        sequence__c,
                        pull_number__c,
                        planned_duration_minutes__c,
                        planned_travel_time__c,
                        visit_subtype__c,
                        take_order_flag__c,
                        instructiondescription,
                        Retail_Store__r.name,
                        Retail_Store__r.street,
                        Retail_Store__r.city,
                        Retail_Store__r.StateCode,
                        Retail_Store__r.account.phone,
                        Retail_Store__r.account.Sales_Rep__r.Name,
                        Retail_Store__r.account.Sales_Rep__r.MobilePhone,
                        Retail_Store__r.account.Sales_Route__r.LOCL_RTE_ID__c
                    from
                        visits__r
                    where visit.status__c != 'Removed'
                    and visit.status__c != 'Pre-Processed'
                    and visit.status__c != 'Failed'
                    order by
                        sequence__c asc
                )
            FROM
                visit_list__c
            WHERE
                recordtype.name = 'merch daily visit list'
                and ${ownerCondition}
                and ${dateCondition}
                and IsRemoved__c = false
            `
        }
        if (dateType === DateType.FullWeek) {
            const startDate = weeklyOptionsMap[selectedWeekStr][0]
            const endDate = weeklyOptionsMap[selectedWeekStr][weeklyOptionsMap[selectedWeekStr].length - 1]
            dateCondition = `visit_date__c >= ${formatWithTimeZone(
                startDate,
                TIME_FORMAT.Y_MM_DD,
                true
            )} and visit_date__c <= ${formatWithTimeZone(endDate, TIME_FORMAT.Y_MM_DD, true)}`
            q = `
            SELECT
                id,
                name,
                owner.name,
                owner.Id,
                visit_date__c,
                total_planned_time__c,
                planned_travel_time__c,
                planned_meeting_time__c,
                (
                    select
                        Retail_Store__r.name,
                        planned_duration_minutes__c,
                        sequence__c
                    from
                        visits__r
                    where visit.status__c != 'Removed'
                    and visit.status__c != 'Pre-Processed'
                    and visit.status__c != 'Failed'
                    order by
                        sequence__c asc
                )
            FROM
                visit_list__c
            WHERE
                recordtype.name = 'merch daily visit list'
                and ${ownerCondition}
                and ${dateCondition}
                and IsRemoved__c = false
            `
        }
        try {
            const res = await syncDownObj('Visit_list__c', q, false)
            return res?.data || []
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'queryScheduleData', getStringValue(error))
            return []
        }
    }

    const exportAndShare = async () => {
        try {
            setIsLoading(true)
            const res = await queryScheduleData()
            if (!_.isArray(res) || res.length === 0) {
                let timeString = formatWithTimeZone(scheduleDate, TIME_FORMAT.MMM_DD_YYYY, true)
                if (dateType === DateType.FullWeek) {
                    const startDate = weeklyOptionsMap[selectedWeekStr][0]
                    const endDate = weeklyOptionsMap[selectedWeekStr][weeklyOptionsMap[selectedWeekStr].length - 1]
                    timeString = `${formatWithTimeZone(startDate, TIME_FORMAT.Y_MM_DD, true)} ~ ${formatWithTimeZone(
                        endDate,
                        TIME_FORMAT.Y_MM_DD,
                        true
                    )}`
                }
                Alert.alert(`${t.labels.PBNA_MOBILE_EMPLOYEE_NO_SCHEDULE_FOR} ${timeString}.`, null, [
                    { text: t.labels.PBNA_MOBILE_OK }
                ])
                setIsLoading(false)
                return
            }
            const employeesMap = {}
            allMerchOriginData.forEach((item) => {
                employeesMap[item.id] = item
            })
            res.forEach((item) => {
                item.employee = employeesMap[item.Owner.Id]
            })
            const { event, error } = await SchedulePdfPage({
                data: res,
                date: scheduleDate,
                dateType,
                weekDates: weeklyOptionsMap[selectedWeekStr],
                selectedWeekStr
            })
            setIsLoading(false)
            if (event === 'sent') {
                dropDownRef.current.alertWithType('success', t.labels.PBNA_MOBILE_SEND_EMPLOYEE_SCHEDULE_SUCCESSFULLY)
            } else if (event !== 'saved' && event !== 'cancelled') {
                dropDownRef.current.alertWithType(
                    'error',
                    t.labels.PBNA_MOBILE_SEND_EMPLOYEE_SCHEDULE_FAILURE,
                    JSON.stringify(error)
                )
            }
        } catch (error) {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                'error',
                t.labels.PBNA_MOBILE_SEND_EMPLOYEE_SCHEDULE_FAILURE,
                JSON.stringify(error)
            )
            storeClassLog(Log.MOBILE_ERROR, 'exportAndShare', getStringValue(error))
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <NavigationBar title={TITLE} style={styles.navStyle} />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView>
                        <View style={styles.pageHeader}>
                            <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_EXPORT_SCHEDULE}</CText>
                        </View>

                        <View>
                            <CText style={styles.HeadText}>{t.labels.PBNA_MOBILE_SCHEDULE_TYPE}</CText>
                            <View style={[styles.RadioLine]}>
                                <RadioButton
                                    title={t.labels.PBNA_MOBILE_ALL_EMPLOYEES}
                                    onPress={() => {
                                        setScheduleType(0)
                                        assignAllEmployeeIds(allMerchOriginData, setEmployeeIds)
                                    }}
                                    disabled={false}
                                    checked={scheduleType === ScheduleType.AllEmployees}
                                    filter
                                />
                                <RadioButton
                                    title={t.labels.PBNA_MOBILE_ONE_EMPLOYEE}
                                    onPress={() => {
                                        setScheduleType(1)
                                    }}
                                    disabled={false}
                                    checked={scheduleType === ScheduleType.OneEmployee}
                                    filter
                                />
                            </View>
                        </View>
                        {scheduleType === ScheduleType.OneEmployee && (
                            <View style={[styles.formItem2, styles.searchItem]}>
                                <CText style={styles.label2}>{t.labels.PBNA_MOBILE_ADD_EMPLOYEE}</CText>
                                <TouchableOpacity
                                    onPress={onSearch.bind(
                                        this,
                                        'Employee',
                                        JSON.parse(JSON.stringify(allMerchOriginData))
                                    )}
                                    style={styles.searchContainer}
                                >
                                    <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                    <CText style={[styles.searchText, searchEmployeeText && styles.searchTextActive]}>
                                        {searchEmployeeText === '' ? SEARCH_TEXT : searchEmployeeText}
                                    </CText>
                                    {searchEmployeeText !== '' && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSearchEmployeeText('')
                                                setEmployeeId('')
                                            }}
                                        >
                                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <View>
                            <CText style={styles.HeadText}>{t.labels.PBNA_MOBILE_DATES}</CText>
                            <View style={[styles.RadioLine]}>
                                <RadioButton
                                    title={_.capitalize(t.labels.PBNA_MOBILE_FULL_DAY)}
                                    onPress={() => {
                                        setDateType(0)
                                    }}
                                    disabled={false}
                                    checked={dateType === DateType.FullDay}
                                    filter
                                />
                                <RadioButton
                                    title={_.capitalize(t.labels.PBNA_MOBILE_FULL_WEEK)}
                                    onPress={() => {
                                        setDateType(1)
                                    }}
                                    disabled={false}
                                    checked={dateType === DateType.FullWeek}
                                    filter
                                />
                            </View>
                        </View>
                        {dateType === DateType.FullDay && (
                            <View style={styles.formItem}>
                                <CText style={[styles.label, styles.colorGray]}>{t.labels.PBNA_MOBILE_DAY}</CText>
                                <View style={styles.dateContainer}>
                                    <TouchableOpacity
                                        style={styles.dateContainer}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <CText style={styles.label}>
                                            {formatWithTimeZone(scheduleDate, TIME_FORMAT.MMM_DD_YYYY, true)}
                                        </CText>
                                        <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        {dateType === DateType.FullWeek && (
                            <View style={styles.marginTop10}>
                                <PickerTile
                                    data={Object.keys(weeklyOptionsMap)}
                                    defValue={Object.keys(weeklyOptionsMap)[0]}
                                    label={t.labels.PBNA_MOBILE_SELECT_WEEK}
                                    title={t.labels.PBNA_MOBILE_SELECT_WEEK}
                                    placeholder={''}
                                    required={false}
                                    disabled={false}
                                    noPaddingHorizontal
                                    containerStyle={styles.containerStyle}
                                    labelStyle={styles.labelStyle}
                                    onChange={(value) => {
                                        setSelectedWeekStr(value)
                                    }}
                                    isFirstItemValuable
                                />
                            </View>
                        )}
                    </KeyboardAwareScrollView>
                </ScrollView>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => {
                        onCancelClick()
                    }}
                    style={styles.btnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>
                {isExportButtonActive ? (
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => {
                            exportAndShare()
                        }}
                        style={[styles.btnAccept, styles.btnAcceptActive]}
                    >
                        <CText style={[styles.textAccept, styles.textAcceptActive]}>
                            {`${t.labels.PBNA_MOBILE_EXPORT_AND_SHARE.toLocaleUpperCase()}`}
                        </CText>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.btnAccept}>
                        <CText style={styles.textAccept}>
                            {t.labels.PBNA_MOBILE_EXPORT_AND_SHARE.toLocaleUpperCase()}
                        </CText>
                    </View>
                )}
            </View>
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.calendarModalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            themeVariant={'light'}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            minimumDate={MIN_DATE}
                            maximumDate={moment(maxDailyDate).toDate()}
                            value={scheduleDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={onScheduleDateChange}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default ExportSchedule
