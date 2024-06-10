/**
 * @description Add a visit in review new schedule.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-27
 */

import moment from 'moment'
import 'moment-timezone'
import React, { useEffect, useState } from 'react'
import { Image, Modal, NativeAppEventEmitter, Switch, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TimePicker } from 'react-native-simple-time-picker'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import CText from '../../../../common/components/CText'
import AddVisitModal from '../notifications/AddVisitModal'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { useInput } from '../../../hooks/CommonHooks'
import NavigationBar from '../../common/NavigationBar'
import SmallCell from '../common/SmallCell'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    DEFAULT_DELAY_TIME,
    getRecordTypeIdByDeveloperName,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import Loading from '../../../../common/components/Loading'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import AddAVisitStyle from '../../../styles/manager/AddAVisitStyle'
import SubTypeModal from '../common/SubTypeModal'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import {
    DropDownType,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute,
    VisitDurationIncrement
} from '../../../enums/Manager'
import { CommonLabel } from '../../../enums/CommonLabel'
import _ from 'lodash'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { addMultiVisits } from '../../../api/ApexApis'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { DatePickerLocale } from '../../../enums/i18n'
import {
    getVisitSubtypes,
    onCancelSubType,
    onRemoveSubType,
    SCHEDULE_VISIT_GROUP_IS_BEING_USED,
    updateVisitSubType
} from '../helper/VisitHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { IntervalTime } from '../../../enums/Contract'

const styles = AddAVisitStyle
interface AddAVisitProps {
    props?: any
    route?: any
    navigation?: any
    isESchedule?: boolean
    fullData?: any
    isFromSelectSchedule?: boolean
}

setLoggedInUserTimezone()
const managerReducer = (store) => store.manager

const getMinDate = (isPublished, dateArr) => {
    const tomorrow = moment(moment().add(1, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD))
    const firstDay =
        moment(dateArr[0]).format(TIME_FORMAT.Y_MM_DD) !== dateArr[0]
            ? moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME)
            : moment(dateArr[0])
    if (!isPublished) {
        return firstDay.isBefore(tomorrow) ? tomorrow.toDate() : firstDay.toDate()
    }
    return moment().clone().toDate()
}

const getMaxDate = (isPublished, dateArr) => {
    if (!isPublished) {
        return moment(dateArr[0] + CommonLabel.END_OF_DAY_TIME)
            .endOf(MOMENT_STARTOF.WEEK)
            .toDate()
    }
    return moment().clone().add(4, 'w').endOf(MOMENT_STARTOF.WEEK).toDate()
}

const getPlaceholder = (isPublished) => {
    if (isPublished) {
        return t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE
    }
    return t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES
}

const setDataPick = (selectedDate, setPlannedDate, plannedDate, setShowDatePicker) => {
    setPlannedDate(selectedDate)
    if (moment(selectedDate).format('DD') !== moment(plannedDate).format('DD')) {
        setShowDatePicker(false)
    }
}

const initCustomerData = (customerData, selectedCustomers, setSelectedCustomers) => {
    if (!_.isEmpty(customerData)) {
        selectedCustomers.push?.(customerData)
        setSelectedCustomers(_.cloneDeep(selectedCustomers))
    }
}

const initEmployeeData = (setSearchEmployeeText, setEmployeeId, userData) => {
    if (!userData?.unassignedRoute) {
        setSearchEmployeeText(userData?.name || '')
        setEmployeeId(userData?.id || '')
    }
}

const getCurrentDay = (planDay, isPublished) => {
    if (!isPublished) {
        const tomorrow = moment(moment().add(1, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD))
        return moment(planDay).isBefore(tomorrow) ? tomorrow.toDate() : planDay.toDate()
    }
    const currentDay = moment()
    return moment(planDay).isBefore(currentDay) ? currentDay.toDate() : planDay.toDate()
}

const poolingCalStatus = async (visitListId, dropDownRef) => {
    return new Promise((resolve, reject) => {
        const intId = setInterval(() => {
            restDataCommonCall(
                `query/?q=SELECT Calculation_Complete__c FROM Visit_List__c WHERE Id='${visitListId}'`,
                'GET'
            )
                .then((res) => {
                    if (res?.data?.records[0]?.Calculation_Complete__c === true) {
                        clearInterval(intId)
                        resolve(true)
                    }
                })
                .catch((err) => {
                    clearInterval(intId)
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_ADD_A_VISIT_QUERY_CALCULATION_COMPLETE_FAILED,
                        err
                    )
                    reject(false)
                })
        }, DEFAULT_DELAY_TIME)
    })
}

const AddAVisit = ({ route, navigation }: AddAVisitProps) => {
    const { customerData, userData, planDate, isPublished, employeePublish, isFromSelectSchedule } = route.params
    const visitSubtypes = getVisitSubtypes()
    const [selectedCustomers, setSelectedCustomers] = useState([])
    const [searchEmployeeText, setSearchEmployeeText] = useState('')
    const [employeeId, setEmployeeId] = useState('')
    const [isEnabled, setIsEnabled] = useState(false)
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [durationModalVisible, setDurationModalVisible] = useState(false)
    const [isAddButtonActive, setIsAddButtonActive] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState(JSON.parse(JSON.stringify(visitSubtypes)))
    const [durationHours, setDurationHours] = React.useState(0)
    const [durationMinutes, setDurationMinutes] = React.useState(0)
    const [durationTime, setDurationTime] = React.useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const [isShowMore, setIsShowMore] = useState(false)
    const [isShowTotalTime, setIsShowTotalTime] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [selectedSubType, setSelectedSubType] = useState(JSON.parse(JSON.stringify(visitSubtypes)))
    const { dropDownRef } = useDropDown()

    const manager = useSelector(managerReducer)
    const visitListId = manager.visitListId
    const dateArr = manager.scheduleDate
    const MIN_DATE = getMinDate(isPublished, dateArr)
    const NOW_PLUS_ONE_YEAR = getMaxDate(isPublished, dateArr)
    const originDate = planDate ? moment(planDate).toDate() : MIN_DATE
    const planDay = moment(originDate).isValid() ? moment(originDate) : moment()
    const filterDay = getCurrentDay(planDay, isPublished)
    const [plannedDate, setPlannedDate] = useState(filterDay)
    const instructionText = useInput('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()
    const addVisit = compose(dispatch, managerAction.addVisit)

    const FORMAT_DATE_STRING = TIME_FORMAT.Y_MM_DD
    const SEARCH_TEXT = getPlaceholder(isPublished)
    const title = isPublished ? t.labels.PBNA_MOBILE_PUBLISHED_SCHEDULE : t.labels.PBNA_MOBILE_NEW_SCHEDULE
    const TITLE = employeePublish ? t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE : title

    const onPlannedDateChange = (_event, selectedDate) => {
        setDataPick(selectedDate, setPlannedDate, plannedDate, setShowDatePicker)
    }

    const handleDurationChange = (value: { hours: number; minutes: number }) => {
        const hoursNum = Number(value.hours)
        const minsNum = Number(value.minutes)
        setDurationHours(hoursNum)
        setDurationMinutes(minsNum)
        setDurationTime(hoursNum * 60 + minsNum)
    }

    const toggleSwitch = () => {
        setIsEnabled(!isEnabled)
    }

    const onSearch = (searchType) => {
        navigation.navigate(NavigationRoute.SEARCH_MODAL, {
            searchType,
            isPublished,
            employeePublish,
            selectedCustomers
        })
    }

    const onRemoveCustomer = (item) => {
        for (let i = 0; i < selectedCustomers.length; i++) {
            if (selectedCustomers[i].name === item.name) {
                selectedCustomers.splice(i, 1)
                setSelectedCustomers(_.cloneDeep(selectedCustomers))
            }
        }
    }

    const onCancelClick = () => {
        navigation.goBack()
        navigation.setOptions({ tabBarVisible: true })
    }

    useEffect(() => {
        initCustomerData(customerData, selectedCustomers, setSelectedCustomers)
        initEmployeeData(setSearchEmployeeText, setEmployeeId, userData)
    }, [])

    const successAndGoBack = async () => {
        setIsLoading(false)
        setAddModalVisible(true)
        if (!isPublished) {
            await addVisit({
                visitListId,
                userLocationId: CommonParam.userLocationId,
                dropDownRef,
                scheduleDate: manager.scheduleDate
            })
            const timeId = setTimeout(() => {
                setAddModalVisible(false)
                if (isFromSelectSchedule) {
                    navigation?.pop(NavigationPopNum.POP_ONE)
                    clearTimeout(timeId)
                }
                clearTimeout(timeId)
                navigation?.pop()
            }, DEFAULT_DELAY_TIME)
        } else {
            const timeId = setTimeout(() => {
                setAddModalVisible(false)
                employeePublish && NativeAppEventEmitter.emit(EventEmitterType.REFRESH_ESL)
                clearTimeout(timeId)
                navigation?.pop()
            }, DEFAULT_DELAY_TIME)
        }
    }

    const onAddVisit = _.debounce(async () => {
        try {
            Instrumentation.startTimer('Merch Manager add visit')
            const visitDate = moment(plannedDate).format(FORMAT_DATE_STRING)
            const subTypeArr = selectedSubType
                .filter((item) => item.select === true)
                .map((item) => item.id)
                .join(';')
            const visitRecordTypeId = await getRecordTypeIdByDeveloperName('Merchandising', 'Visit')
            const customerListId = selectedCustomers
                .map((item) => {
                    return item.id
                })
                .join(',')
                .split(',')
            const newVisit = {
                OwnerId: '',
                VisitorId: null,
                RecordTypeId: visitRecordTypeId,
                Planned_Date__c: visitDate,
                Take_Order_Flag__c: isEnabled,
                Planned_Duration_Minutes__c: durationTime,
                Visit_Subtype__c: subTypeArr,
                InstructionDescription: instructionText.value
            }

            if (employeeId) {
                newVisit.OwnerId = employeeId
                newVisit.VisitorId = employeeId
            } else {
                newVisit.OwnerId = CommonParam.userId
            }

            const data = {
                objNewVisit: newVisit,
                customerListId: customerListId
            }

            addMultiVisits(data)
                .then(async (res) => {
                    await successAndGoBack()
                    Instrumentation.stopTimer('Merch Manager add visit')
                    setIsLoading(false)
                    return poolingCalStatus(res.data, dropDownRef)
                })
                .then(async () => {
                    await syncDownDataByTableNames()
                })
                .catch((err) => {
                    setIsLoading(false)
                    if (err?.error?.data === SCHEDULE_VISIT_GROUP_IS_BEING_USED) {
                        dropDownRef?.current?.alertWithType(
                            DropDownType.INFO,
                            t.labels.PBNA_MOBILE_SCHEDULE_IS_CANCELING,
                            t.labels.PBNA_MOBILE_SCHEDULE_IS_HANDLING_BY_OTHERS
                        )
                    }
                    storeClassLog(Log.MOBILE_ERROR, 'AddAVisit.addMultiVisits', getStringValue(err))
                })
        } catch (err) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'AddAVisit.onAddVisit', getStringValue(err))
        }
    }, IntervalTime.FIVE_HUNDRED)

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const calculateTime = (time) => {
        const hours = Math.floor(time / CommonLabel.SIXTY_MINUTE)
        const mins = Math.floor(time % CommonLabel.SIXTY_MINUTE)
        let strHours = hours.toString()
        let strMins = mins.toString()
        strHours = hours === CommonLabel.NUMBER_ZERO ? `${CommonLabel.NUMBER_ZERO}` + hours : strHours
        strMins = mins === CommonLabel.NUMBER_ZERO ? `${CommonLabel.NUMBER_ZERO}` + mins : strMins
        return `${strHours} ${t.labels.PBNA_MOBILE_HR} ${strMins} ${t.labels.PBNA_MOBILE_MIN}`
    }

    const renderBottomAddText = () => {
        return _.isEmpty(selectedCustomers) ? (
            <CText style={styles.textAccept}>
                {`${t.labels.PBNA_MOBILE_ADD} ${t.labels.PBNA_MOBILE_VISITS_WITH_BRACKET.toLocaleUpperCase()}`}
            </CText>
        ) : (
            <CText style={styles.textAccept}>
                {`${t.labels.PBNA_MOBILE_ADD} ${
                    selectedCustomers.length
                } ${t.labels.PBNA_MOBILE_VISITS_WITH_BRACKET.toLocaleUpperCase()}`}
            </CText>
        )
    }

    useEffect(() => {
        navigation.setOptions({ tabBarVisible: false })
        const isBtnActive =
            selectedCustomers.length !== 0 &&
            !!plannedDate &&
            selectedSubType.some((item) => item.select) &&
            !!durationTime
        setIsAddButtonActive(isBtnActive)
    })

    useEffect(() => {
        const employeeDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.TRANSFER_EMPLOYEE_DATA,
            (item) => {
                setSearchEmployeeText(item.name)
                setEmployeeId(item.id)
            }
        )
        const customerDataListener = NativeAppEventEmitter.addListener(
            EventEmitterType.TRANSFER_CUSTOMER_DATA,
            (items) => {
                setSelectedCustomers(Object.values(items))
            }
        )
        return () => {
            employeeDataListener && employeeDataListener.remove()
            customerDataListener && customerDataListener.remove()
        }
    }, [])

    useEffect(() => {
        const isShow = selectedCustomers.length !== 0 && !!durationTime
        const isShowMoreCell = selectedCustomers.length > CommonLabel.NUMBER_EIGHT

        if (isShow) {
            const time = durationTime * selectedCustomers.length
            setTotalTime(time)
        }
        setIsShowTotalTime(isShow)

        if (isShowMoreCell) {
            setIsShowMore(true)
        } else {
            setIsShowMore(false)
        }
    }, [selectedCustomers, durationTime])

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <NavigationBar title={TITLE} style={styles.navStyle} />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView>
                        <View style={styles.pageHeader}>
                            <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_ADD_VISITS}</CText>
                        </View>
                        <View
                            style={[
                                styles.formItem2,
                                styles.searchItem,
                                selectedCustomers.length !== 0 && styles.marginBottom_10
                            ]}
                        >
                            <CText style={styles.label2}>{t.labels.PBNA_MOBILE_ADD_CUSTOMERS_WITH_BRACKET}</CText>
                            <TouchableOpacity onPress={onSearch.bind(this, 'Customer')} style={styles.searchContainer}>
                                <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                <CText style={styles.searchText}>{t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}</CText>
                            </TouchableOpacity>
                        </View>
                        {selectedCustomers.length !== 0 && (
                            <View style={[styles.formItem2, styles.searchItem]}>
                                <CText style={styles.label2}>
                                    {`${t.labels.PBNA_MOBILE_ADD_CUSTOMERS_ADDED} (${
                                        Object.keys(selectedCustomers).length
                                    })`}
                                </CText>
                                <SmallCell
                                    itemArr={selectedCustomers}
                                    handleRemove={onRemoveCustomer}
                                    enableHide
                                    isShowMore={isShowMore}
                                    setIsShowMore={setIsShowMore}
                                    controlNum={CommonLabel.NUMBER_EIGHT}
                                />
                            </View>
                        )}
                        <View style={styles.formItem}>
                            <CText style={styles.label}>{t.labels.PBNA_MOBILE_PLANNED_DATE}</CText>
                            <View style={styles.dateContainer}>
                                <TouchableOpacity style={styles.dateContainer} onPress={() => setShowDatePicker(true)}>
                                    <CText style={styles.label}>{moment(plannedDate).format('MMM DD, YYYY')}</CText>
                                    <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.formItem2}>
                            <View style={styles.formSubItem}>
                                <CText style={styles.label}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                                <TouchableOpacity
                                    style={styles.rightCol}
                                    onPress={() => {
                                        setTypeModalVisible(true)
                                    }}
                                >
                                    <Image source={ImageSrc.IMG_TRIANGLE} style={styles.imgTriangle} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.selectedContainer}>
                                {selectedSubType
                                    .filter((item: any) => item.select)
                                    .map((item: any) => {
                                        return (
                                            <View style={styles.subTypeCell} key={`select${item.id}`}>
                                                <CText>{item.name}</CText>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        onRemoveSubType(
                                                            item,
                                                            subTypeArray,
                                                            setSubTypeArray,
                                                            setSelectedSubType
                                                        )
                                                    }
                                                    style={styles.clearSubTypeContainer}
                                                >
                                                    <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })}
                            </View>
                            <SubTypeModal
                                subTypeArray={subTypeArray}
                                typeModalVisible={typeModalVisible}
                                setTypeModalVisible={setTypeModalVisible}
                                onCheckClick={(index) => {
                                    checkClick(index)
                                }}
                                onCancelSubType={() => {
                                    onCancelSubType(
                                        setTypeModalVisible,
                                        typeModalVisible,
                                        selectedSubType,
                                        setSubTypeArray
                                    )
                                }}
                                updateVisitSubType={() => {
                                    updateVisitSubType(
                                        setTypeModalVisible,
                                        typeModalVisible,
                                        subTypeArray,
                                        setSelectedSubType
                                    )
                                }}
                            />
                        </View>
                        <View style={styles.formItem}>
                            <CText style={styles.label}>{t.labels.PBNA_MOBILE_TAKE_ORDER}</CText>
                            <Switch ios_backgroundColor="#565656" value={isEnabled} onValueChange={toggleSwitch} />
                        </View>
                        <View style={[styles.formItem, isShowTotalTime && styles.marginBottom_10]}>
                            <CText style={styles.label}>{t.labels.PBNA_MOBILE_PLANNED_DURATION}</CText>
                            <TouchableOpacity
                                style={styles.rightCol}
                                onPress={() => {
                                    setDurationModalVisible(true)
                                }}
                            >
                                <CText style={styles.textValue}>
                                    {durationHours || '00'}
                                    {` ${t.labels.PBNA_MOBILE_HR} `}
                                    {durationMinutes || '00'}
                                    {` ${t.labels.PBNA_MOBILE_MIN} `}
                                </CText>
                                <Image source={ImageSrc.IMG_CLOCK_BLUE} style={styles.imgClockBlue} />
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent
                                visible={durationModalVisible}
                                onRequestClose={() => {
                                    setDurationModalVisible(!durationModalVisible)
                                }}
                            >
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <View style={styles.modalHeader}>
                                            <CText>{t.labels.PBNA_MOBILE_PLANNED_DURATION}</CText>
                                            <TouchableOpacity
                                                hitSlop={commonStyle.smallHitSlop}
                                                onPress={() => {
                                                    setDurationModalVisible(!durationModalVisible)
                                                }}
                                            >
                                                <CText style={styles.modalButton}>{t.labels.PBNA_MOBILE_DONE}</CText>
                                            </TouchableOpacity>
                                        </View>
                                        <TimePicker
                                            hoursUnit={t.labels.PBNA_MOBILE_HOUR.toLocaleLowerCase()}
                                            minutesUnit={t.labels.PBNA_MOBILE_MIN}
                                            value={{
                                                hours: durationHours,
                                                minutes: durationMinutes
                                            }}
                                            onChange={handleDurationChange}
                                            minutesInterval={VisitDurationIncrement.FIFTEEN_MINUTES}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        </View>
                        {isShowTotalTime && (
                            <View style={styles.formItem3}>
                                <CText style={styles.label2}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                                <CText style={[styles.label2, styles.black_color]}>
                                    {` ${calculateTime(totalTime)}`}
                                </CText>
                            </View>
                        )}
                        <View style={[styles.formItem2, styles.formItemInstruction]}>
                            <CText style={styles.label2}>{t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS_OPTIONAL}</CText>
                            <TextInput
                                style={styles.text2}
                                autoCorrect={false}
                                editable
                                multiline
                                {...instructionText}
                            />
                        </View>
                        <View style={[styles.formItem2, styles.searchItem]}>
                            <CText style={styles.label2}>{t.labels.PBNA_MOBILE_EMPLOYEE_OPTIONAL}</CText>
                            <TouchableOpacity onPress={onSearch.bind(this, 'Employee')} style={styles.searchContainer}>
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
                {isAddButtonActive ? (
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => {
                            setIsLoading(true)
                            onAddVisit()
                        }}
                        style={[styles.btnAccept, styles.btnAcceptActive]}
                    >
                        <CText style={[styles.textAccept, styles.textAcceptActive]}>
                            {`${t.labels.PBNA_MOBILE_ADD} ${
                                selectedCustomers.length
                            } ${t.labels.PBNA_MOBILE_VISITS_WITH_BRACKET.toLocaleUpperCase()}`}
                        </CText>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.btnAccept}>{renderBottomAddText()}</View>
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
                            maximumDate={NOW_PLUS_ONE_YEAR}
                            value={plannedDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={onPlannedDateChange}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <AddVisitModal
                modalVisible={addModalVisible}
                setModalVisible={setAddModalVisible}
                visitNum={selectedCustomers.length}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default AddAVisit
