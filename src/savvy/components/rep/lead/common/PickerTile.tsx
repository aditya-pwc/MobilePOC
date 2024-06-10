/**
 * @description Component to create picker.
 * @author Qiulin Deng
 * @date 2021-05-24
 * @Lase
 */
import React, { useState, useRef, useImperativeHandle, useEffect } from 'react'
import { Insets, Modal, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import CText from '../../../../../common/components/CText'
import { Picker } from '@react-native-picker/picker'
import { t } from '../../../../../common/i18n/t'

interface PickerTileInterface {
    data: any
    label: string
    placeholder: string
    title: string
    disabled: boolean
    defValue: string | number
    required: boolean
    cRef?: any
    borderStyle?: any
    onChange?: any
    noPaddingHorizontal?: any
    labelStyle?: any
    inputStyle?: any
    titleStyle?: any
    onDone?: any
    containerStyle?: any
    modalStyle?: any
    pickContainerStyle?: any
    filterNumber?: string
    placeholderStyle?: any
    showWhiteIcon?: boolean
    isFirstItemValuable?: any
    numberOfLines?: any
    itemStyle?: TextStyle
    pickViewStyle?: any
    showCustomIcon?: boolean
    customLabel?: React.JSX.Element
    customIconWrapStyle?: ViewStyle
    renderPicklistItem?: Function
    onLabelClicked?: Function
    hitSlop?: null | Insets | number
    isSliderOpen?: React.MutableRefObject<boolean>
}

const styles = StyleSheet.create({
    modalPickSize: {
        borderRadius: 8,
        height: 300,
        width: 300
    },
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginRight: 12
    },
    pickerBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    labelFontColor: {
        color: '#565656'
    },
    pickLabel: {
        marginBottom: 2.5
    },
    smallFontSize: {
        fontSize: 12
    },
    fontBold: {
        fontWeight: '700'
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    defPickerContainer: {
        height: 40,
        paddingTop: 10
    },
    defPickerLabelLayout: {
        flexGrow: 1
    },

    midFontSize: {
        fontSize: 14
    },
    pickFontColor: {
        color: '#86939e'
    },
    defPickerIconLayout: {
        paddingLeft: 10,
        paddingTop: 5
    },
    downIcon: {
        height: 5,
        width: 15
    },
    pickPadding: {
        paddingHorizontal: 9,
        marginBottom: 8
    },
    flexAlign: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    flexLayout: {
        flex: 1
    },
    bgMatteColor: {
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    defPaddingHorizontal: {
        paddingHorizontal: 22
    },
    pickHeader: {
        height: 50,
        justifyContent: 'space-between'
    },
    pickLabelLayout: {
        width: '80%'
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    fontGotham: {
        fontFamily: 'Gotham-Bold'
    },
    horAlign: {
        justifyContent: 'center'
    },
    modalPickerFont: {
        fontSize: 14,
        fontWeight: '400'
    },
    blueFontColor: {
        color: '#00A2D9'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    margins: {
        marginBottom: 0
    },
    whiteIcon: {
        width: 0,
        height: 0,
        marginTop: 2.5,
        borderWidth: 5,
        borderTopWidth: 5,
        borderColor: 'transparent',
        borderTopColor: '#fff'
    },
    blueIcon: {
        width: 0,
        height: 0,
        marginTop: 2.5,
        borderWidth: 5,
        borderTopWidth: 5,
        borderColor: 'transparent',
        borderTopColor: '#00A2D9'
    },

    garyIcon: {
        width: 0,
        height: 0,
        marginTop: 2.5,
        borderWidth: 5,
        borderTopWidth: 5,
        borderColor: 'transparent',
        borderTopColor: '#D3D3D3'
    },
    flexEnd: {
        alignItems: 'flex-end'
    },
    iconDownWrapper: {
        width: 16,
        height: 16,
        paddingTop: 3,
        backgroundColor: '#E0E0E1',
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 5
    },
    iconDown: {
        width: 7,
        height: 7,
        borderTopWidth: 1,
        borderRightWidth: 1,
        transform: [{ rotate: '135deg' }],
        borderColor: 'gray'
    }
})

const renderPicklistItem = (data) => {
    if (Array.isArray(data)) {
        return data.map((element) => {
            return <Picker.Item label={element} value={element} key={element} />
        })
    }
    return null
}

const PickerTile = (props: PickerTileInterface) => {
    const {
        data,
        label,
        placeholder,
        title,
        disabled,
        defValue,
        required,
        cRef,
        onChange,
        noPaddingHorizontal,
        labelStyle,
        inputStyle,
        titleStyle,
        containerStyle,
        borderStyle,
        modalStyle,
        onDone,
        pickContainerStyle,
        filterNumber,
        placeholderStyle,
        showWhiteIcon,
        isFirstItemValuable,
        numberOfLines,
        pickViewStyle,
        itemStyle,
        showCustomIcon,
        customLabel,
        customIconWrapStyle = {},
        renderPicklistItem: renderPicklistItemOverride,
        hitSlop,
        isSliderOpen,
        onLabelClicked
    } = props
    const [showPicker, setShowPicker] = useState(false)
    const [selectedValue, setSelectedValue] = useState(defValue)
    const pickerRef = useRef()

    useImperativeHandle(cRef, () => ({
        reset: () => {
            setSelectedValue(defValue)
        },
        resetNull: () => {
            setSelectedValue('')
        },
        setValue: (v) => {
            setSelectedValue(v)
        },
        selectedItem: selectedValue
    }))

    const _renderPicklistItem = renderPicklistItemOverride || renderPicklistItem

    useEffect(() => {
        _renderPicklistItem(data)
    }, [data])
    const renderPickerBlock = () => {
        if (disabled) {
            return (
                <TouchableOpacity style={[borderStyle || styles.pickerBorder]} disabled>
                    {label !== '' && (
                        <CText
                            style={
                                labelStyle || [
                                    styles.labelFontColor,
                                    styles.smallFontSize,
                                    styles.fontBold,
                                    styles.pickLabel
                                ]
                            }
                        >
                            {label}
                        </CText>
                    )}
                    <View style={[styles.flexDirectionRow, styles.defPickerContainer]}>
                        <View style={styles.defPickerLabelLayout}>
                            <CText style={placeholderStyle || [styles.midFontSize, styles.pickFontColor]}>
                                {defValue || placeholder}
                            </CText>
                        </View>
                        <View style={[styles.defPickerIconLayout, styles.flexEnd]}>
                            <View style={styles.garyIcon} />
                        </View>
                    </View>
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity
                style={[borderStyle || styles.pickerBorder]}
                onPress={() => {
                    isSliderOpen?.current === false && (isSliderOpen.current = true)
                    setShowPicker(true)
                    onLabelClicked && onLabelClicked()
                }}
                hitSlop={hitSlop}
            >
                {label !== '' && (
                    <CText
                        style={
                            labelStyle || [
                                styles.labelFontColor,
                                styles.smallFontSize,
                                styles.fontBold,
                                styles.pickLabel
                            ]
                        }
                    >
                        {label}
                    </CText>
                )}
                <View style={[styles.flexDirectionRow, styles.defPickerContainer, pickViewStyle]}>
                    {!customLabel && (
                        <View style={[styles.defPickerLabelLayout]}>
                            {selectedValue !== '' &&
                                selectedValue !== undefined &&
                                selectedValue !== null &&
                                !filterNumber && (
                                    <CText
                                        style={inputStyle || [styles.midFontSize]}
                                        numberOfLines={numberOfLines || 0}
                                    >
                                        {selectedValue}
                                    </CText>
                                )}
                            {selectedValue !== '' &&
                                selectedValue !== undefined &&
                                selectedValue !== null &&
                                filterNumber && (
                                    <CText style={inputStyle || [styles.midFontSize]}>
                                        {selectedValue.concat(` (${filterNumber})`)}
                                    </CText>
                                )}
                            {(selectedValue === '' || selectedValue === undefined || selectedValue === null) &&
                                !filterNumber && (
                                    <CText style={[styles.midFontSize, styles.pickFontColor, placeholderStyle]}>
                                        {placeholder}
                                    </CText>
                                )}
                            {(selectedValue === '' || selectedValue === undefined || selectedValue === null) &&
                                filterNumber && (
                                    <CText style={[styles.midFontSize]}>
                                        {placeholder.concat(` (${filterNumber})`)}
                                    </CText>
                                )}
                        </View>
                    )}
                    {customLabel && <View style={[styles.defPickerLabelLayout]}>{customLabel}</View>}
                    <View style={[!showCustomIcon && styles.defPickerIconLayout, styles.flexEnd, customIconWrapStyle]}>
                        {showCustomIcon && (
                            <View style={styles.iconDownWrapper}>
                                <View style={[styles.iconDown]} />
                            </View>
                        )}
                        {!showCustomIcon &&
                            (showWhiteIcon ? <View style={styles.whiteIcon} /> : <View style={styles.blueIcon} />)}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const setSelectedItem = (item) => {
        setSelectedValue(item)
        if (onChange) {
            onChange(item)
        }
    }

    return (
        <View style={containerStyle || styles.margins}>
            <Modal
                animationType="fade"
                transparent
                visible={showPicker}
                onRequestClose={() => {
                    setShowPicker(!showPicker)
                    isSliderOpen?.current === true && (isSliderOpen.current = false)
                }}
            >
                <View style={[styles.flexAlign, styles.flexLayout, styles.bgMatteColor]}>
                    <View
                        style={[styles.bgWhiteColor, modalStyle || styles.modalPickSize, styles.defPaddingHorizontal]}
                    >
                        <View style={[styles.flexDirectionRow, styles.pickHeader, styles.pickerBorder]}>
                            <View style={[styles.pickLabelLayout, styles.horAlign]}>
                                <CText style={[styles.fontGotham, titleStyle || styles.modalPickerFont]}>{title}</CText>
                            </View>
                            <View style={[styles.horAlign]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowPicker(false)
                                        isSliderOpen?.current === true && (isSliderOpen.current = false)
                                        if (onDone) {
                                            onDone(selectedValue)
                                        }
                                    }}
                                >
                                    <CText
                                        style={[
                                            styles.fontFamily,
                                            styles.modalPickerFont,
                                            styles.blueFontColor,
                                            styles.fontBold
                                        ]}
                                    >
                                        {t.labels.PBNA_MOBILE_DONE}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Picker
                            ref={pickerRef}
                            selectedValue={selectedValue}
                            itemStyle={itemStyle || styles.midFontSize}
                            onValueChange={(itemValue, index) => {
                                if (isFirstItemValuable) {
                                    setSelectedItem(itemValue)
                                } else {
                                    if (required && index !== 0) {
                                        setSelectedItem(itemValue)
                                    } else if (!required && index !== 0) {
                                        setSelectedItem(itemValue)
                                    } else if (!required && index === 0) {
                                        setSelectedValue('')
                                        if (onChange) {
                                            onChange('')
                                        }
                                    }
                                }
                            }}
                        >
                            {_renderPicklistItem(data)}
                        </Picker>
                    </View>
                </View>
            </Modal>

            <View
                style={
                    noPaddingHorizontal
                        ? [pickContainerStyle || styles.pickPadding, styles.noPaddingHorizontal]
                        : pickContainerStyle || styles.pickPadding
                }
            >
                {renderPickerBlock()}
            </View>
        </View>
    )
}

export default PickerTile
