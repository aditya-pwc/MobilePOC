/**
 * @description Employee item component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-06-10
 */

import React, { useEffect, useState } from 'react'
import { View, Image, Alert, SafeAreaView, TouchableOpacity, ScrollView, NativeAppEventEmitter } from 'react-native'
import AddRecurringVisitStyle from '../../../styles/manager/AddRecurringVisitStyle'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import CText from '../../../../common/components/CText'
import LocationService from '../../../service/LocationService'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    addServiceDetail,
    DEFAULT_DELAY_TIME,
    getCustomerData,
    getOrderDayObj,
    getRecordTypeIdByDeveloperName,
    handleOriginData,
    updateTakeOrderFlag
} from '../../../utils/MerchManagerUtils'
import WeekDayAndNum from '../common/WeekDayAndNum'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import Loading from '../../../../common/components/Loading'
import SubTypeModal from '../common/SubTypeModal'
import {
    DataCheckMsgIndex,
    DropDownType,
    EventEmitterType,
    NavigationPopNum,
    NavigationRoute
} from '../../../enums/Manager'
import { renderPhoneButton } from '../../../helper/manager/CustomerTileHelper'
import { Constants } from '../../../../common/Constants'
import { checkDataForAddSD, dataCheckWithAction } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { useSelector } from 'react-redux'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import ReassignResultModal from '../common/ReassignResultModal'
import moment from 'moment'
import { getVisitSubtypes } from '../helper/VisitHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { useHandleVisitSubtype } from '../../../helper/manager/AllManagerMyDayHelper'
import { MOMENT_STARTOF } from '../../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { IntervalTime } from '../../../enums/Contract'

const styles = AddRecurringVisitStyle

const defaultData = [
    {
        dayOfWeek: 'Sunday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Monday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Tuesday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Wednesday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Thursday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Friday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    },
    {
        dayOfWeek: 'Saturday',
        numOfVisit: 0,
        label: '',
        dayKey: ''
    }
]

const getDayLabelAndCount = () => {
    const sunday = moment().day(0)
    defaultData.forEach((item, i) => {
        const label = _.capitalize(sunday.clone().add(i, MOMENT_STARTOF.DAY).format('dddd'))
        const dayKey = sunday.clone().add(i, MOMENT_STARTOF.DAY).format('ddd').toUpperCase()
        item.label = label
        item.dayKey = dayKey
    })
    return defaultData
}

const managerReducer = (state) => state.manager

interface AddRecurringVisitInterface {
    navigation: any
    route: any
}

const AddRecurringVisit = ({ navigation, route }: AddRecurringVisitInterface) => {
    const { data, customerData, mapInfo, selectDayKey, isFromEmployee, userData } = route.params
    const visitSubtypes = getVisitSubtypes()
    const dayLabelAndCount = getDayLabelAndCount()
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState(JSON.parse(JSON.stringify(visitSubtypes)))
    const [selectedSubType, setSelectedSubType] = useState(JSON.parse(JSON.stringify(visitSubtypes)))
    const [employeeData, setEmployeeData] = useState({}) as any
    const [searchEmployeeText, setSearchEmployeeText] = useState('')
    const [employeeId, setEmployeeId] = useState('')
    const [weekDayNum, setWeekDayNum] = useState(JSON.parse(JSON.stringify(dayLabelAndCount)))
    const [isAddButtonActive, setIsAddButtonActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const { dropDownRef } = useDropDown()
    const manager = useSelector(managerReducer)
    const lineCodeMap = manager.lineCodeMap
    const EMPLOYEE = 'Employee'
    const [searchCustomerResult, setSearchCustomerResult] = useState({}) as any
    const [searchCustomerText, setSearchCustomerText] = useState('')
    const [SDData, setSDData] = useState({})
    const [addSDModalVisible, setAddSDModalVisible] = useState(false)
    const [totalSDCount, setTotalSDCount] = useState(0)
    const { updateVisitSubType, onCancelSubType } = useHandleVisitSubtype({
        setTypeModalVisible,
        typeModalVisible,
        subTypeArray,
        setSelectedSubType,
        selectedSubType,
        setSubTypeArray
    })

    const onRemoveSubType = (item) => {
        subTypeArray.find((sub) => sub.id === item.id).select = false
        setSubTypeArray([...subTypeArray])
        setSelectedSubType(_.cloneDeep(subTypeArray))
    }

    const onSearch = (searchType) => {
        navigation.navigate(NavigationRoute.SEARCH_MODAL, {
            searchType,
            needBase: true,
            selectedCustomers: [],
            onlyNeedOneCustomer: true
        })
    }

    useEffect(() => {
        if (isFromEmployee && !userData?.unassignedRoute) {
            setEmployeeData(userData)
            setSearchEmployeeText(userData?.name || '')
            setEmployeeId(userData?.id || '')
        }
        const searchEmployee = NativeAppEventEmitter.addListener(EventEmitterType.TRANSFER_EMPLOYEE_DATA, (item) => {
            setEmployeeData(item)
            setSearchEmployeeText(item.name)
            setEmployeeId(item.id)
        })
        const searchCustomer = NativeAppEventEmitter.addListener(EventEmitterType.TRANSFER_CUSTOMER_DATA, (item) => {
            const customerItem: any = Object.values(item)[0]
            setSearchCustomerResult(customerItem)
            setSearchCustomerText(customerItem?.name)
            getCustomerData({ dropDownRef, customerDetail: true, customerData: customerItem }).then((store: any) => {
                const { visits } = store
                const resData = handleOriginData({ data: visits, customerDetail: true })
                setSDData(resData || {})
                setWeekDayNum(_.cloneDeep(dayLabelAndCount))
            })
        })
        return () => {
            searchEmployee && searchEmployee.remove()
            searchCustomer && searchCustomer.remove()
        }
    }, [])

    const increase = (item, index) => {
        const tmpData = weekDayNum
        tmpData[index].numOfVisit += 1
        setWeekDayNum(JSON.parse(JSON.stringify(tmpData)))
    }

    const decrease = (item, index) => {
        const tmpData = weekDayNum
        tmpData[index].numOfVisit -= 1
        setWeekDayNum(JSON.parse(JSON.stringify(tmpData)))
    }

    useEffect(() => {
        const isActive =
            selectedSubType.some((item) => item.select) &&
            weekDayNum.some((item) => item.numOfVisit !== 0) &&
            (isFromEmployee ? !_.isEmpty(searchCustomerText) : !isFromEmployee)
        setIsAddButtonActive(isActive)
    })

    const onCancelClick = () => {
        navigation.goBack()
        navigation.setOptions({ tabBarVisible: true })
    }

    const onAddVisitClick = _.debounce(async () => {
        const accountId = customerData?.accountId || searchCustomerResult?.accountId
        const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
        const dataCheck = await checkDataForAddSD(employeeId, accountId, weekDayNum, CTRRecordTypeId)
        if (!dataCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        const dataCheckUS = await dataCheckWithAction(
            'User_Stats__c',
            `WHERE User__c='${employeeId}' AND RecordType.DeveloperName = 'Stats'`,
            '',
            false
        )
        if (!dataCheckUS && !_.isEmpty(employeeId)) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        let count = 0
        weekDayNum
            .filter((item) => item.numOfVisit !== 0)
            .forEach((weekDay) => {
                count += weekDay.numOfVisit
            })
        const subType = selectedSubType
            .filter((item) => item.select === true)
            .map((item) => item.id)
            .join(';')
        const orderDays = getOrderDayObj(customerData)
        const isUnassign = _.isEmpty(employeeId)
        const tmpId = isUnassign ? CommonParam.userId : employeeId
        addServiceDetail({
            subType,
            employeeId: tmpId,
            weekDayNum,
            accountId,
            data,
            dropDownRef,
            setIsLoading,
            orderDays,
            isUnassign
        })
            .then(async () => {
                const updatedResult = []
                const updatedDay = weekDayNum.filter((day) => day?.numOfVisit > 0)
                // to monitor duplicate SD issue
                storeClassLog(Log.MOBILE_INFO, 'onAddSDClick', `user: ${tmpId} - MM: ${CommonParam.userId}`)
                for (const weekDay of weekDayNum) {
                    if (weekDay?.numOfVisit > 0) {
                        const updatedVal = await updateTakeOrderFlag({
                            weekDayString: weekDay.dayOfWeek,
                            CTRRecordTypeId,
                            accountId,
                            dropDownRef,
                            orderDays,
                            lineCodeMap
                        }).catch((err) => {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'AddRecurringVisit.updateTakeOrderFlag',
                                getStringValue(err)
                            )
                            setIsLoading(false)
                        })
                        updatedResult.push(updatedVal)
                        if (updatedResult.length === updatedDay.length) {
                            if (isFromEmployee && _.isEmpty(userData)) {
                                setIsLoading(false)
                                setTotalSDCount(count)
                                setAddSDModalVisible(true)
                            }
                            const timeoutId = setTimeout(() => {
                                clearTimeout(timeoutId)
                                setIsLoading(false)
                                if (isFromEmployee && !_.isEmpty(userData)) {
                                    NativeAppEventEmitter.emit(EventEmitterType.REFRESH_EMPLOYEE_SD, {
                                        count,
                                        selectDayKey
                                    })
                                } else {
                                    NativeAppEventEmitter.emit(EventEmitterType.REFRESH_CUSTOMER_SD, {
                                        count,
                                        selectDayKey
                                    })
                                }
                                NativeAppEventEmitter.emit(EventEmitterType.REFRESH_MY_TEAM)
                                navigation.pop()
                            }, DEFAULT_DELAY_TIME)
                        }
                    }
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_ADD_RECURRING_VISIT,
                    JSON.stringify(err)
                )
                storeClassLog(Log.MOBILE_ERROR, 'AddRecurringVisit.onAddVisitClick', getStringValue(err))
                setIsLoading(false)
            })
    }, IntervalTime.FIVE_HUNDRED)

    const renderPhoneView = () => {
        return (
            <View>
                {renderPhoneButton(customerData.phone)}
                <TouchableOpacity
                    onPress={() => {
                        const originLocation = {
                            latitude: mapInfo.region?.latitude,
                            longitude: mapInfo.region?.longitude
                        }
                        const targetLocation = { latitude: customerData.latitude, longitude: customerData.longitude }
                        if (!targetLocation.latitude || !targetLocation.longitude) {
                            Alert.alert(t.labels.PBNA_MOBILE_NO_GEOLOCATION_FOUND)
                        } else {
                            LocationService.gotoLocation(originLocation, targetLocation)
                        }
                    }}
                >
                    <Image style={styles.imgLocation} source={ImageSrc.ICON_LOCATION} />
                </TouchableOpacity>
            </View>
        )
    }

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const refreshData = async () => {
        navigation.pop(NavigationPopNum.POP_TWO)
    }

    const getSearchCustomerText = () => {
        return searchCustomerText === '' ? t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS : searchCustomerText
    }

    const renderWStautsText = (wStatus: any, index: any) => {
        return (
            <CText key={wStatus.label + index} style={wStatus.attend ? styles.textWorking : styles.textOffDay}>
                {wStatus.label}
            </CText>
        )
    }

    return (
        <View style={commonStyle.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <CText style={styles.title}>{t.labels.PBNA_MOBILE_ADD_A_RECURRING_VISIT}</CText>
                        {isFromEmployee ? (
                            <View style={[styles.formItem, styles.margin_Hor]}>
                                <CText style={styles.label2}>{t.labels.PBNA_MOBILE_ADD_CUSTOMER_LOWER}</CText>
                                <TouchableOpacity onPress={() => onSearch('Customer')} style={styles.searchContainer}>
                                    <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                    <CText style={[styles.searchText, searchCustomerText && styles.searchTextActive]}>
                                        {getSearchCustomerText()}
                                    </CText>
                                    {searchCustomerText !== '' && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSearchCustomerResult({})
                                                setSearchCustomerText('')
                                            }}
                                        >
                                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.headerView}>
                                <View>
                                    <IMG_STORE_PLACEHOLDER style={styles.imgUserImage} />
                                </View>
                                <View style={[styles.itemContentContainer]}>
                                    <CText style={styles.customerNameText} numberOfLines={2}>
                                        {customerData.name}
                                    </CText>
                                    <View style={styles.addressView}>
                                        <CText style={styles.addressText} numberOfLines={1}>
                                            {customerData.address}
                                        </CText>
                                    </View>
                                    <View style={styles.addressView}>
                                        <CText style={styles.addressText} numberOfLines={1}>
                                            {customerData.cityStateZip}
                                        </CText>
                                    </View>
                                </View>
                                {renderPhoneView()}
                            </View>
                        )}
                        <View style={styles.formItem}>
                            <View>
                                <TouchableOpacity
                                    style={styles.formSubItem}
                                    onPress={() => {
                                        setTypeModalVisible(true)
                                    }}
                                >
                                    <CText style={styles.label}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                                    <Image source={ImageSrc.IMG_TRIANGLE} style={styles.imgTriangle} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.selectedContainer}>
                                {selectedSubType
                                    .filter((item: any) => item.select)
                                    .map((item) => {
                                        return (
                                            <View style={styles.subTypeCell} key={JSON.stringify(item)}>
                                                <CText>{item.name}</CText>
                                                <TouchableOpacity
                                                    onPress={() => onRemoveSubType(item)}
                                                    style={styles.clearSubTypeContainer}
                                                >
                                                    <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })}
                            </View>
                        </View>
                        <View style={[styles.formItem, styles.margin_Hor]}>
                            <CText style={styles.label2}>{t.labels.PBNA_MOBILE_EMPLOYEE_OPTIONAL}</CText>
                            <TouchableOpacity onPress={() => onSearch(EMPLOYEE)} style={styles.searchContainer}>
                                <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
                                <CText style={[styles.searchText, searchEmployeeText && styles.searchTextActive]}>
                                    {searchEmployeeText === ''
                                        ? t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES
                                        : searchEmployeeText}
                                </CText>
                                {searchEmployeeText !== '' && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEmployeeData({})
                                            setSearchEmployeeText('')
                                            setEmployeeId('')
                                        }}
                                    >
                                        <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>
                        {employeeData && employeeData.workingStatus && (
                            <View style={[styles.workDayView]}>
                                <CText style={styles.workDayTitle}>{t.labels.PBNA_MOBILE_WORKING_DAYS}</CText>
                                <View style={styles.workStatusView}>
                                    {employeeData.workingStatus?.map((wStatus: any, index: any) => {
                                        return renderWStautsText(wStatus, index)
                                    })}
                                </View>
                            </View>
                        )}
                        <CText style={styles.selectTitle}>{t.labels.PBNA_MOBILE_SELECT_EACH_DAY}</CText>
                        <CText style={[styles.addressText, styles.margin_Hor]}>
                            {t.labels.PBNA_MOBILE_ADD_NEW_WEEKLY_SCHEDULES}
                        </CText>
                        {weekDayNum.map((item, index) => {
                            const dayKey = item.dayKey
                            const day = (isFromEmployee ? SDData[dayKey] : data[dayKey]) || {}
                            const users = []
                            for (const i in day) {
                                const { firstName, lastName, userStatsId, isUnassigned } = day[i]
                                users.push({
                                    firstName,
                                    lastName,
                                    userStatsId,
                                    isUnassigned
                                })
                            }
                            return (
                                <WeekDayAndNum
                                    key={item.label}
                                    item={item}
                                    users={users}
                                    exitNum={Object.keys((isFromEmployee ? SDData[dayKey] : data[dayKey]) || {}).length}
                                    minNum={Constants.RECURRING_VISIT_MIN_NUM}
                                    maxNum={Constants.RECURRING_VISIT_MAX_NUM}
                                    decreaseClick={() => decrease(item, index)}
                                    increaseClick={() => increase(item, index)}
                                />
                            )
                        })}
                    </ScrollView>
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
                                    onAddVisitClick()
                                }}
                                style={[styles.btnAccept, styles.btnAcceptActive]}
                            >
                                <CText style={[styles.textAccept, styles.textAcceptActive]}>
                                    {t.labels.PBNA_MOBILE_ADD_VISITS.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.btnAccept}>
                                <CText style={styles.textAccept}>
                                    {t.labels.PBNA_MOBILE_ADD_VISITS.toLocaleUpperCase()}
                                </CText>
                            </View>
                        )}
                    </View>
                </View>
                <SubTypeModal
                    subTypeArray={subTypeArray}
                    typeModalVisible={typeModalVisible}
                    setTypeModalVisible={setTypeModalVisible}
                    onCheckClick={(index) => {
                        checkClick(index)
                    }}
                    onCancelSubType={() => {
                        onCancelSubType()
                    }}
                    updateVisitSubType={() => {
                        updateVisitSubType()
                    }}
                />
            </SafeAreaView>
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={refreshData}
            />
            <ReassignResultModal
                navigation={navigation}
                isServiceDetail
                totalAssign={totalSDCount.toString()}
                modalVisible={addSDModalVisible}
                setModalVisible={setAddSDModalVisible}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default AddRecurringVisit
