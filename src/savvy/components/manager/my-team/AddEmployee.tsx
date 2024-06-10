/**
 * @description Add employee component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-12
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Image, TouchableOpacity, ScrollView, FlatList, NativeAppEventEmitter } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { database } from '../../../common/SmartSql'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import EmployeeItem from '../common/EmployeeItem'
import {
    getTimeList,
    getFullWeekName,
    DEFAULT_DELAY_TIME,
    E_CARD_HEIGHT,
    getFTPT,
    DAY_OF_WEEK_ABBR
} from '../../../utils/MerchManagerUtils'
import { computeSmartClause, getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import { SoupService } from '../../../service/SoupService'
import { getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjUpdate, syncUpObjCreate } from '../../../api/SyncUtils'
import ReassignResultModal from '../common/ReassignResultModal'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import AddEmployeeStyle from '../../../styles/manager/AddEmployeeStyle'
import { useSelector } from 'react-redux'
import { CommonParam } from '../../../../common/CommonParam'
import Loading from '../../../../common/components/Loading'
import UserAvatar from '../../common/UserAvatar'
import {
    drawHeaderTriangle,
    renderWorkingDaySwitchLists,
    updateWorkingDayStatus,
    isFirstStep,
    isSecondStep,
    getStartTimeStr,
    getLocationList
} from '../helper/MerchManagerHelper'
import PickerModal from '../common/PickerModal'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { dataCheckWithAction } from '../service/DataCheckService'
import { DataCheckMsgIndex, DropDownType, EventEmitterType } from '../../../enums/Manager'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import _ from 'lodash'
import { setLoggedInUserTimezone } from '../../../utils/TimeZoneUtils'
import { handleRouteSalesGeo } from '../helper/ServiceDetailHelper'
import MMSearchBar from '../common/MMSearchBar'
import { filterAddEmployee } from '../helper/MMSearchBarHelper'
import { IntervalTime } from '../../../enums/Contract'
import { Log } from '../../../../common/enums/Log'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = Object.assign(AddEmployeeStyle, EmployeeDetailStyle)
interface AddEmployeeProps {
    navigation?: any
    route?: any
}

const DEFAULT_ACTIVE_STEP = 1
const SECOND_STEP = 2
const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const IMG_CLOCK_BLUE = ImageSrc.IMG_CLOCK_BLUE
const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE
const DEFAULT_LABEL = ''
const TEXT_TWELVE = 12
const ADD_EMPLOYEE_LABEL = t.labels.PBNA_MOBILE_ADD_EMPLOYEE_ADD_EMPLOYEE_LABEL
const INSERT_REMOTE_USER_STATS = t.labels.PBNA_MOBILE_ADD_EMPLOYEE_INSERT_REMOTE_USER_STATS
const INSERT_LOCAL_USER_STATS = t.labels.PBNA_MOBILE_ADD_EMPLOYEE_INSERT_LOCAL_USER_STATS
const managerReducer = (state) => state.manager

const onCardClickWithParams = (params) => {
    const { user, setActiveStep, setSelectedUser, tempWorkingOrder, setWorkingOrder } = params
    setActiveStep(SECOND_STEP)
    setSelectedUser(user)
    const workingDay = JSON.parse(JSON.stringify(tempWorkingOrder))
    setWorkingOrder(workingDay)
}

const getUsersList = (uniqueId, user, users, item) => {
    if (!uniqueId.includes(user.Id)) {
        users.push(item)
        uniqueId.push(user.Id)
    }
}

const getEmployeeData = (params) => {
    const { setOriginEmployeeList, dropDownRef, searchBarRef } = params
    const users = []
    const fields = { Merchandising_Base_Minimum_Requirement__c: '1', GM_LOC_ID__c: CommonParam.userLocationId }
    const whereClauseArr = computeSmartClause('User', fields)
    database()
        .use('User')
        .select()
        .join({
            table: 'User_Stats__c',
            alias: 'US',
            options: {
                mainField: 'User__c',
                targetField: 'Id',
                targetTable: 'User',
                fieldList: []
            },
            type: 'LEFT'
        })
        .where(whereClauseArr)
        .orderBy([{ table: 'User', field: 'LastName' }])
        .getData()
        .then((res: any) => {
            if (res?.length > 0) {
                const uniqueId = []
                res.forEach((user, index) => {
                    const item = {
                        id: user.Id,
                        index,
                        name: user.Name,
                        firstName: user.FirstName,
                        lastName: user.LastName,
                        title: user.Title,
                        gpid: user.GPID__c,
                        merchBase: user['US.Merchandising_Base__c'] === '1',
                        startTime: user['US.Start_Time__c'],
                        startLocation: user['US.Starting_Location__c'],
                        ftFlag: user.FT_EMPLYE_FLG_VAL__c && user.FT_EMPLYE_FLG_VAL__c.toLocaleLowerCase(),
                        userStatsId: user['US.Id'],
                        workingStatus: getWorkingStatus(user, 'US'),
                        userLineCode: user.LC_ID__c
                    }
                    getUsersList(uniqueId, user, users, item)
                })
                setOriginEmployeeList(users)
                searchBarRef?.current?.onChangeText(users, '')
            }
        })
        .catch((err) => {
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                ADD_EMPLOYEE_LABEL + ' ' + t.labels.PBNA_MOBILE_ADD_EMPLOYEE_QUERY_USER,
                err
            )
        })
}

const onWorkingOrderChange = (params) => {
    const { index, workingOrder, setActiveAddBtn, setWorkingOrder } = params
    const workingOrderData = JSON.parse(JSON.stringify(workingOrder))
    workingOrderData[DAY_OF_WEEK_ABBR[index]] = !workingOrderData[DAY_OF_WEEK_ABBR[index]]
    let enableAddBtn = false
    DAY_OF_WEEK_ABBR.forEach((label) => {
        enableAddBtn = workingOrderData[label] || enableAddBtn
    })
    if (enableAddBtn) {
        setActiveAddBtn(true)
    } else {
        setActiveAddBtn(false)
    }
    setWorkingOrder(workingOrderData)
}

const getUserState = (params) => {
    const { selectedUser, selectedTime, workingOrder, selectedLocation } = params
    return {
        Id: 'NeedCreate',
        User__c: selectedUser.id,
        Start_Time__c: getStartTimeStr(selectedTime),
        Sunday__c: workingOrder.SUN,
        Monday__c: workingOrder.MON,
        Tuesday__c: workingOrder.TUE,
        Wednesday__c: workingOrder.WED,
        Thursday__c: workingOrder.THU,
        Friday__c: workingOrder.FRI,
        Saturday__c: workingOrder.SAT,
        Starting_Location__c: selectedLocation,
        Merchandising_Base__c: true,
        OwnerId: selectedUser.id,
        Notification_Preference__c: CommonLabel.NOTIFICATION_PREFERENCE
    }
}

const onAddToMyTeamClick = _.debounce(async (params) => {
    const {
        selectedUser,
        setIsLoading,
        workingOrder,
        selectedTime,
        dropDownRef,
        syncUpCallback,
        setIsErrorShow,
        selectedLocation
    } = params
    const dataCheck = await dataCheckWithAction(
        'User_Stats__c',
        `WHERE User__c='${selectedUser.id}' AND RecordType.DeveloperName = 'Stats'`,
        '',
        !selectedUser.userStatsId
    )
    if (!dataCheck) {
        setIsLoading(false)
        setIsErrorShow(true)
        return
    }
    handleRouteSalesGeo({ dropDownRef, selectedUser, setIsLoading })
        .then(() => {
            if (selectedUser.userStatsId) {
                const updatedUserStats = []
                SoupService.retrieveDataFromSoup(
                    'User_Stats__c',
                    {},
                    getObjByName('User_Stats__c').syncUpCreateFields,
                    getObjByName('User_Stats__c').syncUpCreateQuery +
                        ` WHERE {User_Stats__c:User__c} = '${selectedUser.id}'`
                )
                    .then(async (res: any) => {
                        if (res?.length > 0) {
                            res[0] = updateWorkingDayStatus(res[0], workingOrder)
                            res[0].Start_Time__c = getStartTimeStr(selectedTime)
                            res[0].Starting_Location__c = selectedLocation
                            res[0].Merchandising_Base__c = true
                            res[0].OwnerId = selectedUser.id
                            updatedUserStats.push(res[0])
                        }
                        if (updatedUserStats.length > 0) {
                            SoupService.upsertDataIntoSoup('User_Stats__c', updatedUserStats, true, false)
                                .then(async () => {
                                    syncUpObjUpdate(
                                        'User_Stats__c',
                                        getObjByName('User_Stats__c').syncUpCreateFields,
                                        getObjByName('User_Stats__c').syncUpCreateQuery +
                                            " WHERE {User_Stats__c:__locally_updated__} = '1'"
                                    )
                                        .then(() => {
                                            syncUpCallback()
                                        })
                                        .catch((err) => {
                                            setIsLoading(false)
                                            dropDownRef.current.alertWithType(
                                                DropDownType.ERROR,
                                                ADD_EMPLOYEE_LABEL + INSERT_REMOTE_USER_STATS,
                                                err
                                            )
                                        })
                                })
                                .catch((err) => {
                                    setIsLoading(false)
                                    dropDownRef.current.alertWithType(
                                        DropDownType.ERROR,
                                        ADD_EMPLOYEE_LABEL + INSERT_LOCAL_USER_STATS,
                                        err
                                    )
                                })
                        }
                    })
                    .catch((err) => {
                        setIsLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            ADD_EMPLOYEE_LABEL + t.labels.PBNA_MOBILE_ADD_EMPLOYEE_QUERY_USER_STATS,
                            err
                        )
                    })
            } else {
                const userState = getUserState({ selectedUser, selectedTime, workingOrder, selectedLocation })
                // to monitor duplicate user stats issue
                storeClassLog(Log.MOBILE_INFO, 'onAddToMyTeamClick', userState)
                SoupService.upsertDataIntoSoup('User_Stats__c', [userState], true, false)
                    .then(async () => {
                        // sync up User Stats
                        syncUpObjCreate(
                            'User_Stats__c',
                            getObjByName('User_Stats__c').syncUpCreateFields,
                            getObjByName('User_Stats__c').syncUpCreateQuery + " WHERE {User_Stats__c:Id} = 'NeedCreate'"
                        )
                            .then(async () => {
                                syncUpCallback()
                            })
                            .catch((err) => {
                                setIsLoading(false)
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    ADD_EMPLOYEE_LABEL + INSERT_REMOTE_USER_STATS,
                                    err
                                )
                            })
                    })
                    .catch((err) => {
                        setIsLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            ADD_EMPLOYEE_LABEL + INSERT_LOCAL_USER_STATS,
                            err
                        )
                    })
            }
        })
        .catch((err) => {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                ADD_EMPLOYEE_LABEL + t.labels.PBNA_MOBILE_ADD_EMPLOYEE_FAILED_TO_CREATE_ROUTE,
                err
            )
        })
}, IntervalTime.FIVE_HUNDRED)

const renderBottomButton = (params) => {
    const {
        activeStep,
        onCancelClick,
        onGoBackClick,
        selectedUser,
        setIsLoading,
        workingOrder,
        selectedTime,
        dropDownRef,
        syncUpCallback,
        setIsErrorShow,
        selectedLocation,
        isAddBtnActive,
        isLoading
    } = params
    return (
        <View style={styles.bottomContainer}>
            {isFirstStep(activeStep) && (
                <TouchableOpacity
                    onPress={() => {
                        onCancelClick()
                    }}
                    style={styles.eBtnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>
            )}
            {isSecondStep(activeStep) && (
                <TouchableOpacity
                    onPress={() => {
                        onGoBackClick()
                    }}
                    style={styles.eBtnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_GO_BACK.toUpperCase()}</CText>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                activeOpacity={!isAddBtnActive() ? 1 : 0.2}
                disabled={isLoading}
                onPress={() => {
                    isAddBtnActive() && setIsLoading(true)
                    isAddBtnActive() &&
                        onAddToMyTeamClick({
                            selectedUser,
                            setIsLoading,
                            workingOrder,
                            selectedTime,
                            dropDownRef,
                            syncUpCallback,
                            setIsErrorShow,
                            selectedLocation
                        })
                }}
                style={[styles.btnAdd, isAddBtnActive() && styles.btnAddActiveColor]}
            >
                <CText style={[styles.textAdd, isAddBtnActive() && styles.textAddActive]}>
                    {t.labels.PBNA_MOBILE_ADD_TO_MY_TEAM}
                </CText>
            </TouchableOpacity>
        </View>
    )
}

const renderEditView = (params) => {
    const {
        activeStep,
        selectedUser,
        openStartingTimModal,
        selectedTime,
        workingOrder,
        setActiveAddBtn,
        setWorkingOrder,
        openStartingLocationModal,
        selectedLocation,
        dateNames,
        locationArr
    } = params

    return (
        isSecondStep(activeStep) &&
        selectedUser && (
            <View style={styles.editContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.paddingBottom_40}>
                    <View style={styles.ePortraitView}>
                        <UserAvatar
                            userStatsId={selectedUser.userStatsId}
                            firstName={selectedUser.firstName}
                            lastName={selectedUser.lastName}
                            avatarStyle={styles.eImgPortrait}
                            userNameText={{ fontSize: 24 }}
                        />
                        <View style={styles.userInfo}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.eUserName}>
                                {selectedUser?.name}
                            </CText>
                            <View style={styles.flexDirectionRow}>
                                <CText style={styles.userTitle}>{getFTPT({ item: selectedUser })}</CText>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userTitle}>
                                    {selectedUser?.title}
                                </CText>
                            </View>
                        </View>
                    </View>
                    <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_LOCATION_DEFAULT}</CText>
                    <TouchableOpacity
                        onPress={() => {
                            openStartingLocationModal()
                        }}
                    >
                        <View style={styles.eFlexSelectRow}>
                            <View style={styles.flexDirectionRow}>
                                <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_LOCATION}</CText>
                                {_.isEmpty(selectedLocation) && (
                                    <RedExclamation
                                        style={styles.exclamation_style}
                                        width={TEXT_TWELVE}
                                        height={TEXT_TWELVE}
                                    />
                                )}
                            </View>
                            <View style={styles.flexRowAlignCenter}>
                                <CText style={styles.selectText}>
                                    {locationArr.filter((item) => item.value === selectedLocation)[0]?.text}
                                </CText>
                                <Image source={IMG_TRIANGLE} style={[styles.imgTriangle]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            openStartingTimModal()
                        }}
                    >
                        <View style={styles.eFlexSelectRow}>
                            <View style={styles.flexDirectionRow}>
                                <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_TIME}</CText>
                                {_.isEmpty(selectedTime) && (
                                    <RedExclamation
                                        style={styles.exclamation_style}
                                        width={TEXT_TWELVE}
                                        height={TEXT_TWELVE}
                                    />
                                )}
                            </View>
                            <View style={styles.flexRowAlignCenter}>
                                <CText style={styles.selectText}>{selectedTime}</CText>
                                <Image source={IMG_CLOCK_BLUE} style={styles.imgClock} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <CText style={[styles.contentTitle, styles.marginTop30]}>
                        {t.labels.PBNA_MOBILE_SELECT_REGULAR_WORKING_DAYS}
                    </CText>
                    <CText style={[styles.subTitle, styles.marginBottom_20]}>
                        {t.labels.PBNA_MOBILE_WEEKLY_SCHEDULE}
                    </CText>
                    {renderWorkingDaySwitchLists(
                        dateNames,
                        styles,
                        workingOrder,
                        setActiveAddBtn,
                        setWorkingOrder,
                        onWorkingOrderChange
                    )}
                </ScrollView>
            </View>
        )
    )
}

const AddEmployee = (props: AddEmployeeProps) => {
    const { navigation } = props
    const dateNames = getFullWeekName()
    const [originEmployeeList, setOriginEmployeeList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [activeStep, setActiveStep] = useState(DEFAULT_ACTIVE_STEP)
    const [activeAddBtn, setActiveAddBtn] = useState(false)
    const tempWorkingOrder = {
        SUN: false,
        MON: false,
        TUE: false,
        WED: false,
        THU: false,
        FRI: false,
        SAT: false
    }
    const { dropDownRef } = useDropDown()
    const [workingOrder, setWorkingOrder] = useState(tempWorkingOrder)
    const [selectedUser, setSelectedUser] = useState(null)
    const [timeModalVisible, setTimeModalVisible] = useState(false)
    const [selectedTime, setSelectedTime] = useState(DEFAULT_LABEL)
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [locationPickerModalVisible, setLocationPickerModalVisible] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LABEL)
    const manager = useSelector(managerReducer)
    const searchBarRef = useRef(null)
    const locationArr = getLocationList()

    useEffect(() => {
        setLoggedInUserTimezone()
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            NativeAppEventEmitter.emit(EventEmitterType.REFRESH_MY_TEAM)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
            setLoggedInUserTimezone()
        }
    }, [])

    const onCardClick = (user) => {
        onCardClickWithParams({
            user,
            setActiveStep,
            setSelectedUser,
            tempWorkingOrder,
            setWorkingOrder
        })
    }

    const renderEItem = ({ item, index }: any) => (
        <EmployeeItem
            key={index}
            item={item}
            index={index}
            showWorkingDays={item.merchBase}
            onCardClick={onCardClick}
            containerHeight={E_CARD_HEIGHT}
            navigation={navigation}
        />
    )

    useEffect(() => {
        navigation.setOptions({ tabBarVisible: false })
        getEmployeeData({ setOriginEmployeeList, dropDownRef, searchBarRef })
    }, [selectedUser])

    const onCancelClick = () => {
        navigation.goBack()
    }

    const goBackAndRefresh = () => {
        navigation.goBack()
    }

    const onGoBackClick = () => {
        setActiveStep(DEFAULT_ACTIVE_STEP)
        setSelectedTime(DEFAULT_LABEL)
        setSelectedLocation(DEFAULT_LABEL)
        setWorkingOrder(tempWorkingOrder)
        setActiveAddBtn(false)
        setEmployeeList([])
    }

    const openStartingTimModal = () => {
        setTimeModalVisible(true)
        _.isEmpty(selectedTime) && setSelectedTime(getTimeList()[0])
    }

    const openStartingLocationModal = () => {
        setLocationPickerModalVisible(true)
        _.isEmpty(selectedLocation) && setSelectedLocation(locationArr[0].value)
    }

    const onDoneClick = () => {
        setTimeModalVisible(false)
    }

    const onLocationDoneClick = () => {
        setLocationPickerModalVisible(false)
    }

    const syncUpCallback = () => {
        setIsLoading(false)
        setResultModalVisible(true)
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId)
            navigation.goBack()
        }, DEFAULT_DELAY_TIME)
    }

    const isAddBtnActive = () => {
        return activeAddBtn && !_.isEmpty(selectedTime) && !_.isEmpty(selectedLocation)
    }

    return (
        <View style={[styles.container, isSecondStep(activeStep) && styles.whiteContainer]}>
            <View style={[styles.container, isSecondStep(activeStep) && styles.whiteContainer]}>
                <View style={[styles.eHeader, isSecondStep(activeStep) && styles.heightAuto]}>
                    <CText style={styles.eTitle}>{t.labels.PBNA_MOBILE_ADD_EMPLOYEE}</CText>
                    <View style={styles.stepView}>
                        <View style={[styles.firstStep, isFirstStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.firstStepTitle, isFirstStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_ONE}
                            </CText>
                            <View style={styles.flexRowEnd}>
                                <CText
                                    style={[styles.firstStepText, isFirstStep(activeStep) && styles.activeStepColor]}
                                >
                                    {t.labels.PBNA_MOBILE_SELECT_EMPLOYEE}
                                </CText>
                                {isSecondStep(activeStep) && (
                                    <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                                )}
                            </View>
                        </View>
                        {drawHeaderTriangle(DEFAULT_ACTIVE_STEP, activeStep, styles)}
                        <View style={[styles.secondStep, isSecondStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.secondStepTitle, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_TWO}
                            </CText>
                            <CText style={[styles.secondStepText, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_COMPLETE_PROFILE}
                            </CText>
                        </View>
                    </View>
                    {isFirstStep(activeStep) && (
                        <View style={styles.searchBarView}>
                            <MMSearchBar
                                cRef={searchBarRef}
                                placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                                originData={originEmployeeList}
                                setSearchResult={setEmployeeList}
                                onSearchTextChange={filterAddEmployee}
                            />
                        </View>
                    )}
                </View>
                {isFirstStep(activeStep) && (
                    <View style={[styles.listView, styles.marginBottom_20]}>
                        <FlatList
                            data={employeeList}
                            extraData={employeeList}
                            renderItem={renderEItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={[styles.paddingTop_22, styles.paddingBottom_40]}
                        />
                    </View>
                )}
                {renderEditView({
                    activeStep,
                    selectedUser,
                    openStartingTimModal,
                    selectedTime,
                    workingOrder,
                    setActiveAddBtn,
                    setWorkingOrder,
                    openStartingLocationModal,
                    selectedLocation,
                    dateNames,
                    locationArr
                })}
            </View>
            {renderBottomButton({
                activeStep,
                onCancelClick,
                onGoBackClick,
                selectedUser,
                setIsLoading,
                workingOrder,
                selectedTime,
                manager,
                dropDownRef,
                syncUpCallback,
                setIsErrorShow,
                selectedLocation,
                isAddBtnActive,
                isLoading
            })}
            <PickerModal
                modalVisible={timeModalVisible}
                onDoneClick={onDoneClick}
                optionsList={getTimeList()}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_TIME}
                selectedVal={selectedTime}
                defaultVal={DEFAULT_LABEL}
                updateSelectedVal={setSelectedTime}
            />
            <PickerModal
                modalVisible={locationPickerModalVisible}
                onDoneClick={onLocationDoneClick}
                optionsList={locationArr}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_LOCATION}
                selectedVal={selectedLocation}
                updateSelectedVal={setSelectedLocation}
                isTextValueObject
            />
            <ReassignResultModal
                navigation={navigation}
                isAddToMyTeam
                userName={selectedUser?.name}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default AddEmployee
