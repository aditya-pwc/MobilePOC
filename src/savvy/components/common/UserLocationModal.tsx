/**
 * @description UserLocationModal Component
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-10-15
 */

import React, { FC, useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import PickerModal from '../manager/common/PickerModal'
import FormBottomButton from '../../../common/components/FormBottomButton'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { formatUTCToLocalTime, getTimeList } from '../../utils/MerchManagerUtils'
import ReassignResultModal from '../manager/common/ReassignResultModal'
import MessageBar from '../manager/common/MessageBar'
import RedExclamation from '../../../../assets/image/red-exclamation.svg'
import { SoupService } from '../../service/SoupService'
import { useDispatch, useSelector } from 'react-redux'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { getObjByName } from '../../utils/SyncUtils'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import _ from 'lodash'
import { syncUpObjUpdate } from '../../api/SyncUtils'
import { getLocationList, getStartTimeStr } from '../manager/helper/MerchManagerHelper'
import { setLoggedInUserTimezone } from '../../utils/TimeZoneUtils'
import { t } from '../../../common/i18n/t'
import { DropDownType } from '../../enums/Manager'
const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE
const IMG_CLOCK_BLUE = ImageSrc.IMG_CLOCK_BLUE
const TEXT_EMPTY = ''
const TEXT_TWELVE = 12
interface UserLocationModalProps {
    modalVisible: boolean
    setLocationModalVisible?: any
    locationAddSuccessModalVisible?: any
    setLocationAddSuccessModalVisible?: any
    navigation?: any
}
const managerReducer = (state) => state.manager

const styles = StyleSheet.create({
    modalStyle: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden'
    },
    title: {
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: baseStyle.color.borderGray
    },
    titleText: {
        textAlign: 'center',
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    currentLocation: {
        marginVertical: 20
    },
    currentLocationText: {
        textAlign: 'center',
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    centeredView: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.modalBlack,
        paddingHorizontal: 22
    },
    padding_20: {
        paddingHorizontal: 20,
        paddingTop: 20
    },
    flexRow: {
        height: 16,
        marginBottom: 30,
        marginTop: 10,
        ...commonStyle.flexRowSpaceBet
    },
    flexSelectRow: {
        height: 50,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        alignItems: 'center',
        marginBottom: 10
    },
    flexDirectionRow: {
        ...commonStyle.flexRowSpaceBet
    },
    selectLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        height: 50,
        lineHeight: 50
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },
    selectText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },
    transTriangle: {
        tintColor: baseStyle.color.white
    },
    imgClock: {
        width: 18,
        height: 18,
        marginHorizontal: 10
    },
    userRedExclamation: {
        marginLeft: 5,
        alignSelf: 'center'
    },
    errBar: {
        marginBottom: 20
    },
    MB_90: {
        marginBottom: 90
    },
    uncheckContainer: {
        borderWidth: 0,
        padding: 0
    },
    goKartColor: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    gocartMargin: {
        marginRight: -10,
        marginLeft: -10
    },
    goCartContainer: {
        backgroundColor: baseStyle.color.white
    }
})
const UserLocationModal: FC<UserLocationModalProps> = (props: UserLocationModalProps) => {
    const {
        modalVisible,
        setLocationModalVisible,
        locationAddSuccessModalVisible,
        setLocationAddSuccessModalVisible,
        navigation
    } = props
    const manager = useSelector(managerReducer)
    const { dropDownRef } = useDropDown()
    const locationInfo = manager.locationInfo
    const defaultStartTime = formatUTCToLocalTime(locationInfo.startTime)
    const defaultLocation = locationInfo.userLocation || TEXT_EMPTY
    const [locationPickerModalVisible, setLocationPickerModalVisible] = useState(false)
    const [timePickerModalVisible, setTimePickerModalVisible] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(defaultLocation)
    const [selectedLocationI18n, setSelectedLocationI18n] = useState(defaultLocation)
    const [selectedStartTime, setSelectedStartTime] = useState(defaultStartTime)
    const [noLocation, setNoLocation] = useState(locationInfo?.userLocation)
    const [noStartTime, setNoStartTime] = useState(locationInfo?.startTime)
    const [checkbox] = useState(locationInfo?.gocart)
    const dispatch = useDispatch()
    const updateLocationInfo = compose(dispatch, managerAction.setUserLocationInfo)
    const defaultValue = '-'
    const locationArr = getLocationList()
    const NUMBER_ZERO = 0
    const NUMBER_ONE = 1
    let isFirstLogin = true

    useEffect(() => {
        setNoLocation(_.isEmpty(selectedLocation))
        setNoStartTime(_.isEmpty(selectedStartTime))
        const locationItem = locationArr.find((item) => {
            return selectedLocation === item.value
        })
        setSelectedLocationI18n(locationItem?.text || '')
    }, [selectedLocation, selectedStartTime])
    useEffect(() => {
        setSelectedLocation(defaultLocation)
    }, [defaultLocation])
    useEffect(() => {
        if (!_.isEmpty(defaultStartTime) && isFirstLogin) {
            setSelectedStartTime(defaultStartTime)
            isFirstLogin = false
        }
    }, [defaultStartTime])
    const saveValidation = () => {
        return !_.isEmpty(selectedStartTime) || !_.isEmpty(selectedLocation)
    }
    const onSaveClick = () => {
        setLoggedInUserTimezone()
        SoupService.retrieveDataFromSoup(
            'Route_Sales_Geo__c',
            {},
            getObjByName('Route_Sales_Geo__c').syncUpCreateFields,
            getObjByName('Route_Sales_Geo__c').syncUpCreateQuery +
                ` WHERE {Route_Sales_Geo__c:Id} = '${locationInfo.Id}'`
        )
            .then((res: any) => {
                if (saveValidation()) {
                    const tempStartTime = getStartTimeStr(selectedStartTime)
                    let tempHasNoLocation = false
                    if (_.isEmpty(selectedLocation) || _.isEmpty(selectedStartTime)) {
                        tempHasNoLocation = true
                    }
                    updateLocationInfo({
                        Id: locationInfo.Id,
                        startTime: tempStartTime,
                        userLocation: selectedLocation,
                        hasNoLocation: tempHasNoLocation,
                        unitName: locationInfo.unitName,
                        gocart: checkbox
                    })
                    const newLocationInfo = _.cloneDeep(res[0])
                    newLocationInfo.Default_Starting_Location__c = selectedLocation
                    newLocationInfo.Default_Start_Time__c = tempStartTime
                    newLocationInfo.Go_Kart_Flag__c = checkbox
                    SoupService.upsertDataIntoSoup('Route_Sales_Geo__c', [newLocationInfo]).then(() => {
                        syncUpObjUpdate(
                            'Route_Sales_Geo__c',
                            getObjByName('Route_Sales_Geo__c').syncUpCreateFields,
                            getObjByName('Route_Sales_Geo__c').syncUpCreateQuery +
                                ` WHERE {Route_Sales_Geo__c:Id} = '${locationInfo.Id}'
                            `
                        )
                            .then(() => {
                                setLoggedInUserTimezone()
                                setLocationAddSuccessModalVisible(true)
                            })
                            .catch((err) => {
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_QUERY_LOCATION_MODAL,
                                    err
                                )
                            })
                    })
                    setTimeout(() => {
                        setLocationModalVisible(false)
                    }, 1500)
                }
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_QUERY_USER_LOCATION, err)
                setTimeout(() => {
                    setLocationModalVisible(false)
                }, 1500)
            })
    }
    const onCancelClick = () => {
        setSelectedLocation(locationInfo.userLocation || TEXT_EMPTY)
        setSelectedStartTime(defaultStartTime)
        setLocationModalVisible(false)
    }
    const getDisableSave = () => {
        return _.isEmpty(selectedLocation) && _.isEmpty(selectedStartTime)
    }
    const onDoneClick = (val) => {
        if (val === NUMBER_ZERO) {
            setLocationPickerModalVisible(false)
        } else {
            setTimePickerModalVisible(false)
        }
    }
    const handleLocationClick = () => {
        if (_.isEmpty(selectedLocation)) {
            setSelectedLocation(locationArr[0].value)
        }
        setLocationPickerModalVisible(true)
    }
    const handleStartTimeClick = () => {
        if (_.isEmpty(selectedStartTime)) {
            setSelectedStartTime(getTimeList()[0])
        }
        setTimePickerModalVisible(true)
    }

    return (
        <Modal animationType="fade" transparent visible={modalVisible}>
            <TouchableOpacity
                activeOpacity={NUMBER_ONE}
                style={styles.centeredView}
                onPressOut={() => {
                    // onCancelClick()
                }}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalStyle}>
                        <View style={styles.padding_20}>
                            <View style={styles.title}>
                                <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_LOCATION_DEFAULTS}</CText>
                            </View>
                            <View style={styles.currentLocation}>
                                <CText style={styles.currentLocationText} numberOfLines={3} ellipsizeMode="tail">
                                    {locationInfo.unitName}
                                </CText>
                            </View>
                            {(noLocation || noStartTime) && (
                                <MessageBar
                                    message={t.labels.PBNA_MOBILE_NO_LOCATION_INFO}
                                    containerStyle={styles.errBar}
                                />
                            )}
                            <TouchableOpacity
                                style={[styles.flexRow, styles.flexSelectRow]}
                                onPress={handleLocationClick}
                            >
                                <View style={styles.flexDirectionRow}>
                                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_LOCATION}</CText>
                                    {noLocation && (
                                        <RedExclamation
                                            style={styles.userRedExclamation}
                                            width={TEXT_TWELVE}
                                            height={TEXT_TWELVE}
                                        />
                                    )}
                                </View>
                                <View style={styles.flexRowAlignCenter}>
                                    <CText style={styles.selectText}>{selectedLocationI18n}</CText>
                                    <Image source={IMG_TRIANGLE} style={[styles.imgTriangle]} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.flexRow, styles.flexSelectRow, styles.MB_90]}
                                onPress={handleStartTimeClick}
                            >
                                <View style={styles.flexDirectionRow}>
                                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_TIME}</CText>
                                    {noStartTime && (
                                        <RedExclamation
                                            style={styles.userRedExclamation}
                                            width={TEXT_TWELVE}
                                            height={TEXT_TWELVE}
                                        />
                                    )}
                                </View>
                                <View style={styles.flexRowAlignCenter}>
                                    <CText style={styles.selectText}>
                                        {_.isEmpty(selectedStartTime) ? defaultValue : selectedStartTime}
                                    </CText>
                                    <Image source={IMG_CLOCK_BLUE} style={styles.imgClock} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <FormBottomButton
                            onPressCancel={onCancelClick}
                            onPressSave={onSaveClick}
                            disableSave={getDisableSave()}
                            rightButtonLabel={t.labels.PBNA_MOBILE_SAVE}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>

            <PickerModal
                modalVisible={locationPickerModalVisible}
                onDoneClick={() => {
                    onDoneClick(NUMBER_ZERO)
                }}
                optionsList={locationArr}
                DEFAULT_LABEL={TEXT_EMPTY}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_LOCATION}
                selectedVal={selectedLocation}
                defaultVal={TEXT_EMPTY}
                updateSelectedVal={setSelectedLocation}
                isTextValueObject
            />
            <PickerModal
                modalVisible={timePickerModalVisible}
                onDoneClick={() => {
                    onDoneClick(NUMBER_ONE)
                }}
                optionsList={getTimeList()}
                modalTitle={t.labels.PBNA_MOBILE_STARTING_TIME}
                selectedVal={selectedStartTime}
                defaultVal={TEXT_EMPTY}
                updateSelectedVal={setSelectedStartTime}
            />
            <ReassignResultModal
                navigation={navigation}
                isLocationSavedSuccess
                modalVisible={locationAddSuccessModalVisible}
                setModalVisible={setLocationAddSuccessModalVisible}
            />
        </Modal>
    )
}

export default UserLocationModal
