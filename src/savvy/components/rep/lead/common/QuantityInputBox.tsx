/**
 * @description Quantity Input Box
 * @author Sheng Huang
 * @date 2023-03-22
 */

import React, { FC } from 'react'
import { KeyboardTypeOptions, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'

interface QuantityInputBoxProps {
    value: string
    title?: string
    disablePlus?: boolean
    disableMinus?: boolean
    noTitle?: boolean
    keyboardType?: KeyboardTypeOptions
    onPressMinus: () => void
    onPressPlus: () => void
    onFocusInput?: () => void
    onChangeText: (text: string) => void
    onBlurInput?: (e: any) => void
    containerStyle?: ViewStyle
}

export const styles = StyleSheet.create({
    boxQuantity: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    quantityBtnTouch: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityBtnWrap: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    minusBtn: {
        width: 13.72,
        height: 2
    },
    quantityInputWrap: {
        alignSelf: 'center',
        minWidth: 49,
        height: 40,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 5
    },
    quantityUnit: {
        position: 'relative',
        marginBottom: 5
    },
    quantityUnitText: {
        fontSize: 8,
        color: '#565656'
    },
    quantityInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        top: 0,
        left: 0
    },
    plusBtn1: {
        position: 'absolute',
        width: 15.68,
        height: 2,
        top: 11,
        left: 4
    },
    plusBtn2: {
        position: 'absolute',
        height: 16,
        width: 2,
        left: 11,
        top: 4
    },
    textInput: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        paddingTop: 5,
        paddingBottom: 17,
        paddingHorizontal: 5,
        fontSize: 16,
        fontFamily: 'Gotham',
        color: '#000',
        fontWeight: '700',
        lineHeight: 18,
        textAlign: 'center'
    },
    disabledBtn: {
        backgroundColor: '#D3D3D3'
    },
    enabledBtn: {
        backgroundColor: '#00A2D9'
    },
    paddingBottom_5: {
        paddingBottom: 5
    },
    paddingBottom_17: {
        paddingBottom: 17
    }
})

const QuantityInputBox: FC<QuantityInputBoxProps> = (props: QuantityInputBoxProps) => {
    const {
        value,
        title,
        disablePlus = false,
        disableMinus = false,
        noTitle = false,
        keyboardType = 'numeric',
        onPressMinus,
        onPressPlus,
        onFocusInput,
        onBlurInput,
        onChangeText
    } = props
    return (
        <View style={[styles.boxQuantity, props.containerStyle]}>
            <TouchableOpacity style={styles.quantityBtnTouch} onPress={onPressMinus} disabled={disableMinus}>
                <View style={styles.quantityBtnWrap}>
                    <View style={[styles.minusBtn, disableMinus ? styles.disabledBtn : styles.enabledBtn]} />
                </View>
            </TouchableOpacity>
            <View style={styles.quantityInputWrap}>
                {!noTitle && (
                    <View style={styles.quantityUnit}>
                        <CText style={styles.quantityUnitText}>{title || t.labels.PBNA_MOBILE_QTY}</CText>
                    </View>
                )}
                <View style={styles.quantityInput}>
                    <TextInput
                        onFocus={onFocusInput}
                        keyboardType={keyboardType}
                        maxLength={3}
                        placeholderTextColor={'#000'}
                        editable
                        selectTextOnFocus
                        returnKeyType={'done'}
                        onChangeText={onChangeText}
                        onBlur={(e) => {
                            if (onBlurInput) {
                                onBlurInput(e)
                            }
                        }}
                        value={value.toString()}
                        style={[styles.textInput, noTitle ? styles.paddingBottom_5 : styles.paddingBottom_17]}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.quantityBtnTouch} onPress={onPressPlus} disabled={disablePlus}>
                <View style={styles.quantityBtnWrap}>
                    <View style={[styles.plusBtn1, disablePlus ? styles.disabledBtn : styles.enabledBtn]} />
                    <View style={[styles.plusBtn2, disablePlus ? styles.disabledBtn : styles.enabledBtn]} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

QuantityInputBox.defaultProps = {
    onPressMinus: () => {},
    onPressPlus: () => {},
    onFocusInput: () => {},
    onBlurInput: () => {},
    onChangeText: () => {}
}

export default QuantityInputBox
