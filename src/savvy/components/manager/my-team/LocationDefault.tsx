/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-11-21 17:09:34
 * @LastEditTime: 2023-11-28 16:58:22
 * @LastEditors: Mary Qian
 */
import React, { useEffect, useState } from 'react'
import { View, Image, TouchableOpacity, NativeAppEventEmitter } from 'react-native'
import _ from 'lodash'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import PickerModal from '../common/PickerModal'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import { getLocationList, getStartTimeStr } from '../helper/MerchManagerHelper'
import { formatUTCToLocalTime, getTimeList } from '../../../utils/MerchManagerUtils'
import { DropDownType, EventEmitterType } from '../../../enums/Manager'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import {
    CURRENT_OPACITY,
    EmployeeProfileStatsProps,
    checkUserStats,
    getDefaultStartTime,
    getOpacity,
    getUserStats,
    syncUpUserStats
} from './EmployeeProfileHelper'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = EmployeeDetailStyle
const { IMG_TRIANGLE, IMG_CLOCK_BLUE } = ImageSrc
const DEFAULT_LABEL = ''
const SIZE_12 = 12
let DEFAULT_START_TIME = ''

interface FormatEmployeeProfileProps {
    res: any
    updatedWorkingHours: any
}

interface LocationDefaultProps {
    userData: any
    setIsErrorShow?: any
    isSales: boolean
}

const LocationDefault = (props: LocationDefaultProps) => {
    const { userData, setIsErrorShow, isSales } = props

    const [isStartingTimeModal, setIsStartingTimeModal] = useState(false)
    const [startLocationModalVisible, setStartLocationModalVisible] = useState(false)
    const [startTimeModalVisible, setStartTimeModalVisible] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(userData?.startLocation || '')
    const [selectedTime, setSelectedTime] = useState('')

    const StartTimeOptions = isSales ? getTimeList(NUMBER_VALUE.FOUR_NUM) : getTimeList()
    const StartLocationOptions = getLocationList()
    const { dropDownRef } = useDropDown()

    const showError = (title: string, err: any) => {
        dropDownRef?.current?.alertWithType(DropDownType.ERROR, title, err)
    }

    const formatStartTime = (params: FormatEmployeeProfileProps) => {
        const { res, updatedWorkingHours } = params
        if (res?.length > 0) {
            let time = selectedTime
            if (!time) {
                time = DEFAULT_START_TIME
            }
            res[0].Start_Time__c = getStartTimeStr(time)
            userData.startTime = res[0].Start_Time__c
            setSelectedTime(time)
            updatedWorkingHours.push(res[0])
        }
    }

    const formatStartLocation = (params: FormatEmployeeProfileProps) => {
        const { res, updatedWorkingHours } = params
        if (!_.isEmpty(res)) {
            res[0].Starting_Location__c = selectedLocation
            userData.startLocation = selectedLocation
            updatedWorkingHours.push(res[0])
        }
    }

    const onDoneClickTemp = async () => {
        setStartTimeModalVisible(false)

        if (userData.startTime && selectedTime?.split(' ')[0] + ':00' === userData?.startTime.split('.')[0]) {
            return
        }

        userData.startTime = selectedTime
        userData.startLocation = selectedLocation

        const updatedWorkingHours: Array<EmployeeProfileStatsProps> = []
        getUserStats(userData?.id)
            .then(async (res: any) => {
                // isStartingTimeModal => click time modal Done button
                if (isStartingTimeModal) {
                    formatStartTime({ res, updatedWorkingHours })
                } else {
                    formatStartLocation({ res, updatedWorkingHours })
                }
                await syncUpUserStats(updatedWorkingHours, showError)
                NativeAppEventEmitter.emit(EventEmitterType.REFRESH_EMPLOYEE_SD, { onlyRefreshSD: true })
            })
            .catch((err) => {
                showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_QUERY_USER_STATS, err)
            })
    }

    // Starting Location
    const openStartingLocationModal = () => {
        setStartLocationModalVisible(true)
        setIsStartingTimeModal(false)
        _.isEmpty(selectedLocation) && setSelectedLocation(StartLocationOptions[0].value)
    }

    const onLocationDoneClick = async () => {
        setStartLocationModalVisible(false)
        const dataCheck = await checkUserStats(userData?.id)
        if (!dataCheck) {
            setIsErrorShow && setIsErrorShow(true)
            return
        }
        onDoneClickTemp()
    }

    // Start Time
    const openStartingTimModal = () => {
        setStartTimeModalVisible(true)
        setIsStartingTimeModal(true)
        _.isEmpty(selectedTime) && setSelectedTime(StartTimeOptions[0])
    }

    const onTimeOutsideClick = () => {
        setStartTimeModalVisible(false)
        if (isStartingTimeModal) {
            setSelectedTime(formatUTCToLocalTime(userData.startTime))
        }
    }

    const onTimeDoneClick = async () => {
        setStartTimeModalVisible(false)
        const dataCheck = await checkUserStats(userData?.id)
        if (!dataCheck) {
            setIsErrorShow && setIsErrorShow(true)
            return
        }
        onDoneClickTemp()
    }

    const setupInitSelectedTime = async () => {
        try {
            const time = await getDefaultStartTime(isSales)
            DEFAULT_START_TIME = time
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'setupInitSelectedTime', 'failed: ' + ErrorUtils.error2String(error))
        }

        if (userData?.startTime) {
            setSelectedTime(formatUTCToLocalTime(userData?.startTime))
        } else {
            setSelectedTime(DEFAULT_START_TIME)
        }
    }

    useEffect(() => {
        setupInitSelectedTime()
    }, [])

    const renderRedAlert = () => {
        return <RedExclamation width={SIZE_12} height={SIZE_12} style={styles.startingTimeErrorIcon} />
    }

    return (
        <View>
            <CText style={[styles.contentTitle, commonStyle.marginTop_20]}>
                {t.labels.PBNA_MOBILE_LOCATION_DEFAULT}
            </CText>
            <TouchableOpacity
                onPress={() => {
                    openStartingLocationModal()
                }}
            >
                <View style={[styles.flexRow, styles.flexSelectRow]}>
                    <View style={styles.flexDirectionRow}>
                        <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_LOCATION}</CText>
                        {_.isEmpty(selectedLocation) && renderRedAlert()}
                    </View>
                    <View style={styles.flexRowAlignCenter}>
                        <CText style={styles.selectText}>
                            {StartLocationOptions?.filter((item) => item.value === selectedLocation)[0]?.text}
                        </CText>
                        <Image source={IMG_TRIANGLE} style={[styles.imgTriangle]} />
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={getOpacity({ noWorkingDay: userData.noWorkingDay, currentOpacity: CURRENT_OPACITY })}
                onPress={() => {
                    openStartingTimModal()
                }}
            >
                <View style={[styles.flexRow, styles.flexSelectRow]}>
                    <View style={styles.flexDirectionRow}>
                        <CText style={[styles.selectLabel]}>{t.labels.PBNA_MOBILE_START_TIME}</CText>
                        {_.isEmpty(selectedTime) && renderRedAlert()}
                    </View>
                    <View style={styles.flexRowAlignCenter}>
                        <CText style={styles.selectText}>{selectedTime || '-'}</CText>
                        <Image source={IMG_CLOCK_BLUE} style={styles.imgClock} />
                    </View>
                </View>
            </TouchableOpacity>

            <PickerModal
                modalVisible={startLocationModalVisible}
                onDoneClick={onLocationDoneClick}
                optionsList={StartLocationOptions}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_LOCATION}
                selectedVal={selectedLocation}
                updateSelectedVal={setSelectedLocation}
                isTextValueObject
            />

            <PickerModal
                modalVisible={startTimeModalVisible}
                onOutsideClick={onTimeOutsideClick}
                onDoneClick={onTimeDoneClick}
                optionsList={StartTimeOptions}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_TIME}
                selectedVal={selectedTime}
                defaultVal={DEFAULT_START_TIME}
                updateSelectedVal={setSelectedTime}
            />
        </View>
    )
}

export default LocationDefault
