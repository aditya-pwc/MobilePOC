/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-11-21 17:09:34
 * @LastEditTime: 2023-11-30 17:16:22
 * @LastEditors: Mary Qian
 */
import React, { useState } from 'react'
import { View, TouchableOpacity, NativeAppEventEmitter, Modal, TouchableWithoutFeedback } from 'react-native'
import CText from '../../../../common/components/CText'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import { getWorkingStatusObj, renderWorkingDaySwitchLists, updateWorkingDayStatus } from '../helper/MerchManagerHelper'
import { DAY_OF_WEEK_ABBR, getFullWeekName } from '../../../utils/MerchManagerUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType, EventEmitterType } from '../../../enums/Manager'
import { getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import {
    CURRENT_OPACITY,
    EmployeeProfileStatsProps,
    OPACITY,
    checkUserStats,
    getOpacity,
    getUserStats,
    updateLocalUserStats,
    updateRemoteUserStats
} from './EmployeeProfileHelper'

const styles = EmployeeDetailStyle
const SIZE_20 = 20

const getGreyRoundStyle = (params: any) => {
    if (!params) {
        return styles.greyRound
    }
}

interface RegularWorkingDaysProps {
    userData: any
    setIsErrorShow?: any
    originalWorkingOrder: any
    setOriginalWorkingOrder?: any
}

const RegularWorkingDays = (props: RegularWorkingDaysProps) => {
    const { userData, setIsErrorShow, originalWorkingOrder, setOriginalWorkingOrder } = props

    const weekLabel = getWeekLabel()
    const dateNames = getFullWeekName()
    const tempWorkingOrder = getWorkingStatusObj(userData.workingStatus)

    const [modalVisible, setModalVisible] = useState(false)
    const [workingOrder, setWorkingOrder] = useState(tempWorkingOrder)
    const [activeAddBtn, setActiveAddBtn] = useState(false)
    const [showNoWorkingDaysAlert, setShowNoWorkingDaysAlert] = useState(userData.noWorkingDay)

    const { dropDownRef } = useDropDown()

    const showError = (title: string, err: any) => {
        dropDownRef?.current?.alertWithType(DropDownType.ERROR, title, err)
    }

    const onCancelClick = () => {
        setModalVisible(!modalVisible)
        setWorkingOrder(originalWorkingOrder)
        setActiveAddBtn(false)
    }

    const onSaveClick = async () => {
        setModalVisible(!modalVisible)
        const dataCheck = await checkUserStats(userData?.id)
        if (!dataCheck) {
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                setIsErrorShow && setIsErrorShow(true)
            }, 400)
            return
        }
        userData.noWorkingDay = false
        setShowNoWorkingDaysAlert(false)
        const updatedWorkingHours: Array<EmployeeProfileStatsProps> = []
        getUserStats(userData?.id)
            .then(async (res: any) => {
                if (res?.length > 0) {
                    res[0] = updateWorkingDayStatus(res[0], workingOrder)
                    updatedWorkingHours.push(res[0])
                }

                updateLocalUserStats(updatedWorkingHours)
                    ?.then(async () => {
                        Object.keys(tempWorkingOrder).forEach((key: any) => {
                            tempWorkingOrder[key] = workingOrder[key]
                        })
                        setOriginalWorkingOrder && setOriginalWorkingOrder(JSON.parse(JSON.stringify(tempWorkingOrder)))
                        userData?.workingStatus?.forEach((item) => {
                            item.attend = tempWorkingOrder[item.name]
                        })
                        NativeAppEventEmitter.emit(EventEmitterType.REFRESH_EMPLOYEE_SD, { onlyRefreshSD: true })

                        updateRemoteUserStats().catch((err) => {
                            showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_SYNC_USER, err)
                        })
                    })
                    .catch((err) => {
                        showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_INSERT_USER, err)
                    })
            })
            .catch((err) => {
                showError(t.labels.PBNA_MOBILE_EMPLOYEE_DETAIL_QUERY_USER_STATS, err)
            })
    }

    const onWorkingOrderChangeTemp = (params: any) => {
        const { index, workingOrder, setActiveAddBtn, setWorkingOrder } = params
        const workingOrderData = JSON.parse(JSON.stringify(workingOrder))
        workingOrderData[DAY_OF_WEEK_ABBR[index]] = !workingOrderData[DAY_OF_WEEK_ABBR[index]]
        let disabled = false
        DAY_OF_WEEK_ABBR.forEach((label) => {
            disabled = workingOrderData[label] || disabled
        })
        if (!disabled) {
            setActiveAddBtn(true)
        } else {
            setActiveAddBtn(false)
        }
        setWorkingOrder(workingOrderData)
    }

    const onWorkingOrderChange = (params: any) => {
        onWorkingOrderChangeTemp(params)
    }

    return (
        <View>
            <View style={styles.workingDayRow}>
                <CText style={[styles.contentTitle, styles.lineHeight_25]}>
                    {t.labels.PBNA_MOBILE_REGULAR_WORKING_DAYS}{' '}
                    {showNoWorkingDaysAlert && <RedExclamation width={SIZE_20} height={SIZE_20} />}
                </CText>
                <TouchableOpacity
                    activeOpacity={getOpacity({
                        noWorkingDay: showNoWorkingDaysAlert,
                        currentOpacity: CURRENT_OPACITY
                    })}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => setModalVisible(true)}
                >
                    <CText style={[styles.editBtn]}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                </TouchableOpacity>
            </View>
            <CText style={styles.subTitle}>{t.labels.PBNA_MOBILE_WEEKLY_SCHEDULE}</CText>
            <View style={styles.weekNum}>
                {weekLabel.map((value, index) => {
                    return (
                        <View
                            key={value}
                            style={[styles.roundLabel, getGreyRoundStyle(Object.values(workingOrder)[index])]}
                        >
                            <CText style={styles.roundText}>{value}</CText>
                        </View>
                    )
                })}
            </View>

            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableOpacity
                    activeOpacity={OPACITY}
                    style={styles.centeredView}
                    onPressOut={() => {
                        onCancelClick()
                    }}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalView}>
                            <View style={styles.modalPadding}>
                                <View style={styles.modalTitle}>
                                    <CText style={styles.modalTitleText}>
                                        {t.labels.PBNA_MOBILE_REGULAR_WORKING_DAYS.toLocaleUpperCase()}
                                    </CText>
                                </View>
                                <View style={[styles.modalContent, styles.marginTop_15]}>
                                    <CText style={[styles.subTitle, styles.modalSubTitle]}>
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
                                </View>
                            </View>
                            <View style={styles.modalBtn}>
                                <TouchableOpacity
                                    style={styles.btnCancel}
                                    onPress={() => {
                                        onCancelClick()
                                    }}
                                >
                                    <View>
                                        <CText style={styles.cancelText}>
                                            {t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={getOpacity({ noWorkingDay: activeAddBtn, currentOpacity: 0.5 })}
                                    style={[styles.btnSave, activeAddBtn && styles.disabledSaveBtn]}
                                    onPress={() => {
                                        !activeAddBtn && onSaveClick()
                                    }}
                                >
                                    <View>
                                        <CText style={styles.saveText}>{t.labels.PBNA_MOBILE_SAVE}</CText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default RegularWorkingDays
