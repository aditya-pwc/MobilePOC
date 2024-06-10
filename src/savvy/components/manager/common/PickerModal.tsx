/**
 * @description PickerModal component.
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-08-22
 */
import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { View, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import { isNullSpace } from '../helper/MerchManagerHelper'

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: baseStyle.color.modalBlack
    },
    modalView: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 8,
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '92%',
        alignItems: 'center'
    },
    tModalView: {
        height: 284
    },
    tModalTitle: {
        ...commonStyle.flexRowSpaceBet
    },
    tModalTitleText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    tDoneBtn: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    modalPadding: {
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    modalTitle: {
        height: 55,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        ...commonStyle.alignCenter
    },
    modalTitleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    modalContent: {
        marginTop: 30,
        ...commonStyle.fullWidth,
        paddingBottom: 40
    },
    modalSelectRow: {
        height: 41,
        ...commonStyle.flexRowSpaceCenter
    },
    modalBtn: {
        height: 60,
        borderTopColor: baseStyle.color.cGray,
        borderTopWidth: 1,
        flexDirection: 'row',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        ...commonStyle.alignCenter,
        textAlign: 'center'
    },
    pickerItem: {
        height: 170
    },
    locationWrap: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    locationPickerItem: {
        height: 170,
        width: 100
    },
    hitSlop: {
        top: 30,
        bottom: 30,
        left: 50,
        right: 50
    }
})
interface TimeSalesModalParams {
    modalVisible?: boolean
    onOutsideClick?: any
    onDoneClick?: any
    optionsList?: any
    DEFAULT_LABEL?: string
    modalTitle?: string
    selectedVal?: any
    defaultVal?: any
    updateSelectedVal?: any
    isEndTimeModal?: boolean
    getDoneDisabled?: any
    isLocationTime?: any
    locationTimeList?: Array<any>
    isTextValueObject?: boolean
}

let doneDisabled = false

const PickerModal = (params: TimeSalesModalParams) => {
    const {
        modalVisible,
        onOutsideClick,
        onDoneClick,
        optionsList,
        DEFAULT_LABEL,
        modalTitle,
        selectedVal,
        defaultVal,
        updateSelectedVal,
        isEndTimeModal,
        getDoneDisabled,
        isLocationTime,
        locationTimeList,
        isTextValueObject
    } = params
    const onValueChange = (itemValue) => {
        updateSelectedVal(itemValue)
        if (getDoneDisabled) {
            doneDisabled = getDoneDisabled(isEndTimeModal, itemValue)
        }
    }
    return (
        <Modal animationType="fade" transparent visible={modalVisible}>
            <TouchableOpacity
                activeOpacity={1}
                style={styles.centeredView}
                onPressOut={() => {
                    onOutsideClick && onOutsideClick(selectedVal || defaultVal)
                }}
            >
                <TouchableWithoutFeedback>
                    <View style={[styles.modalView, styles.tModalView]}>
                        <View style={styles.modalPadding}>
                            <View style={[styles.modalTitle, styles.tModalTitle]}>
                                <CText style={styles.tModalTitleText}>{modalTitle}</CText>
                                <TouchableOpacity
                                    hitSlop={styles.hitSlop}
                                    onPressOut={() => {
                                        onDoneClick(selectedVal || defaultVal)
                                    }}
                                    disabled={doneDisabled}
                                >
                                    <CText
                                        style={[
                                            styles.tDoneBtn,
                                            doneDisabled
                                                ? { color: baseStyle.color.gray }
                                                : { color: baseStyle.color.tabBlue }
                                        ]}
                                    >
                                        {t.labels.PBNA_MOBILE_DONE}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalContent}>
                                {!isLocationTime ? (
                                    <Picker
                                        selectedValue={selectedVal || defaultVal}
                                        onValueChange={onValueChange}
                                        itemStyle={styles.pickerItem}
                                    >
                                        {optionsList.map((val) => {
                                            if (isTextValueObject) {
                                                const text = val?.text || ''
                                                const value = val.value
                                                return (
                                                    <Picker.Item
                                                        key={value}
                                                        label={
                                                            text +
                                                            (value === defaultVal
                                                                ? DEFAULT_LABEL
                                                                : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING))
                                                        }
                                                        value={value}
                                                    />
                                                )
                                            }
                                            return (
                                                <Picker.Item
                                                    key={val}
                                                    label={
                                                        val +
                                                        (val === defaultVal
                                                            ? DEFAULT_LABEL
                                                            : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING))
                                                    }
                                                    value={val}
                                                />
                                            )
                                        })}
                                    </Picker>
                                ) : (
                                    <View style={styles.locationWrap}>
                                        {locationTimeList.map((val) => {
                                            return (
                                                <Picker
                                                    key={val.type}
                                                    selectedValue={val.selectedVal}
                                                    onValueChange={val.updateSelectedVal}
                                                    itemStyle={styles.locationPickerItem}
                                                >
                                                    {val?.optionsList?.map((val, index) => {
                                                        const indexKey = index.toString()
                                                        return <Picker.Item key={indexKey} label={val} value={val} />
                                                    })}
                                                </Picker>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}
export default PickerModal
