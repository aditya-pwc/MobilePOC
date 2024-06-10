import React, { FC, useEffect, useRef, useState } from 'react'
import {
    Modal,
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardTypeOptions,
    ReturnKeyTypeOptions,
    NativeSyntheticEvent,
    TextInputKeyPressEventData
} from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { commonStyle } from '../../../common/styles/CommonStyle'
import PriceService from '../../service/PriceService'
import { GestureResponderEvent } from 'react-native-modal'

const styles = StyleSheet.create({
    ...commonStyle,
    modalBgPadding: {
        paddingHorizontal: 64,
        flexDirection: 'row'
    },
    pricePopContainer: {
        borderRadius: 8,
        backgroundColor: baseStyle.color.white,
        overflow: 'hidden',
        flex: 1
    },
    pricePopTopSection: {
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 50
    },
    pricePopMiddleSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: baseStyle.color.bgGray
    },
    pricePopTopHeader: {
        fontSize: 18,
        lineHeight: 24,
        fontFamily: 'Gotham-Black',
        textAlign: 'center'
    },
    pricePopAlertIcon: {
        marginTop: 2
    },
    pricePopAlertText: {
        lineHeight: 18,
        color: baseStyle.color.red,
        marginLeft: 8
    },
    pricePopInputWrap: {
        marginTop: 20,
        padding: 12,
        width: 92,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: baseStyle.color.LightBlue
    },
    pricePopInputPrefix: {
        fontWeight: 'bold',
        color: baseStyle.color.borderGray,
        marginRight: 4
    },
    pricePopInputInner: {
        fontWeight: 'bold',
        fontSize: 14,
        lineHeight: 18,
        width: 2
    },
    pricePopMaximum: {
        fontSize: 12,
        lineHeight: 18,
        color: baseStyle.color.titleGray
    },
    pricePopMaximumValue: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: 'bold',
        marginLeft: 3
    },
    pricePopBottomSection: {
        height: 60,
        backgroundColor: baseStyle.color.white
    },
    pricePopSubmit: {
        flex: 1,
        height: 60,
        shadowOffset: {
            width: 0,
            height: -1
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: baseStyle.color.white
    },
    pricePopSubmitText: {
        fontSize: 12,
        lineHeight: 60,
        fontWeight: 'bold',
        color: baseStyle.color.purple,
        textAlign: 'center'
    },
    pricePopSubmitActive: {
        backgroundColor: baseStyle.color.purple
    },
    pricePopSubmitTextActive: {
        color: baseStyle.color.white
    },
    pricePopSubmitTextInActive: {
        color: baseStyle.color.borderGray
    },
    pricePopBorderLeft: {
        shadowColor: baseStyle.color.black,
        borderLeftColor: baseStyle.color.borderGray
    },
    priceTextEqualWidth: {
        fontVariant: ['tabular-nums'],
        fontWeight: 'bold'
    }
})

interface ReturnPricingPopProps {
    packageName: string
    custUniqId: string
    price: string
    relativeDelDate: number
    onCancel: (event: GestureResponderEvent) => void
    onSubmit: Function
}

const ReturnPricingPop: FC<ReturnPricingPopProps> = (props) => {
    const { packageName, custUniqId, price, relativeDelDate, onCancel, onSubmit } = props
    const [digits, setDigits] = useState<number[]>([])
    const [maximum, setMaximum] = useState<number>(0)
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        if (packageName && custUniqId) {
            PriceService.getMaximumWholeSalePriceForProduct(packageName, custUniqId, relativeDelDate).then((res) => {
                setMaximum(res)
            })
        }
    }, [packageName, custUniqId])

    useEffect(() => {
        const initialDigits = Number(price)
            .toFixed(2)
            .split('')
            .filter((digit) => digit !== '.')
            .map((digit) => Number(digit))
        const padded = [...new Array(5).fill(0), ...initialDigits]
        setDigits(padded.slice(padded.length - 5))
    }, [price])

    const onChangeText = (text: string) => {
        const inputDigit = text[text.length - 1]
        if (!inputDigit.match(/\d/) || digits[0] > 0) {
            return
        }
        const newDigits = [...digits, Number(inputDigit)]
        setDigits(newDigits.slice(1))
    }

    const onKeyPress = ({ nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        if (nativeEvent.key === 'Backspace') {
            const newDigits = [0, ...digits].slice(0, 5)
            setDigits(newDigits)
        }
    }

    const priceText = digits.slice(0, 3).join('') + '.' + digits.slice(3).join('')
    const priceTextStyle = Number(priceText) === 0 && { color: baseStyle.color.borderGray }
    const maximumMet = !maximum || maximum >= Number(priceText)
    const inputValid = Number(priceText) > 0
    const isActive = inputValid && maximumMet

    const textInputProps = {
        ref: inputRef,
        value: '',
        keyboardType: 'number-pad' as KeyboardTypeOptions,
        returnKeyType: 'done' as ReturnKeyTypeOptions,
        onChangeText,
        onKeyPress
    }
    const onSubmitPress = () => {
        onSubmit(priceText)
    }
    return (
        <Modal visible transparent>
            <TouchableOpacity style={[styles.modalBg, styles.alignCenter, styles.modalBgPadding]}>
                <TouchableOpacity
                    style={styles.pricePopContainer}
                    activeOpacity={1}
                    onPress={() => {
                        inputRef?.current?.blur()
                    }}
                >
                    <View style={styles.pricePopTopSection}>
                        <CText style={styles.pricePopTopHeader}>
                            {t.labels.PBNA_MOBILE_INPUT_OR_ADJUST_THE_CASE_COST}
                        </CText>
                        <TouchableOpacity
                            style={styles.flexRowCenter}
                            onPress={() => {
                                inputRef?.current?.focus()
                            }}
                        >
                            <View
                                style={[
                                    styles.pricePopInputWrap,
                                    styles.flexRowCenter,
                                    inputValid && !maximumMet && { borderColor: baseStyle.color.red }
                                ]}
                            >
                                <CText style={styles.pricePopInputPrefix}>{t.labels.PBNA_MOBILE_ORDER_D}</CText>
                                <CText style={[styles.priceTextEqualWidth, priceTextStyle]}>{priceText}</CText>
                                <TextInput {...textInputProps} style={styles.pricePopInputInner} />
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.flexRowCenter, styles.marginTop_5]}>
                            <CText style={styles.pricePopMaximum}>{t.labels.PBNA_MOBILE_MAXIMUM}</CText>
                            <CText style={styles.pricePopMaximumValue}>
                                {t.labels.PBNA_MOBILE_ORDER_D}
                                {maximum.toFixed(2)}
                            </CText>
                        </View>
                    </View>
                    {!maximumMet && (
                        <View style={styles.pricePopMiddleSection}>
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={baseStyle.fontSize.fs_16}
                                color={baseStyle.color.red}
                                style={styles.pricePopAlertIcon}
                            />
                            <CText style={styles.pricePopAlertText}>
                                {t.labels.PBNA_MOBILE_RETURN_PRICE_MAXIMUM_INVALID}
                            </CText>
                        </View>
                    )}
                    <View style={[styles.pricePopBottomSection, styles.flexRowAlignCenter]}>
                        <TouchableOpacity style={styles.pricePopSubmit} onPress={onCancel}>
                            <CText style={styles.pricePopSubmitText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.pricePopSubmit,
                                isActive ? styles.pricePopSubmitActive : styles.pricePopBorderLeft
                            ]}
                            disabled={!isActive}
                            onPress={onSubmitPress}
                        >
                            <CText
                                style={[
                                    styles.pricePopSubmitText,
                                    isActive ? styles.pricePopSubmitTextActive : styles.pricePopSubmitTextInActive
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_ADD}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default ReturnPricingPop
