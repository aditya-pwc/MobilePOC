/**
 * @description Component to input phone number.
 * @author Qiulin Deng
 * @date 2021-04-29
 */
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Input } from 'react-native-elements'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface NegotiateLeadProps {
    labelStyle?: any
    inputStyle?: any
    onChange?: any
    label: string
    placeholder?: string
    noPaddingHorizontal?: any
    value?: any
    cRef?: any
}

const VALIDATION_RULES = {
    NUMBER_NOT_NUMBER: /\D/g,
    PHONE_MATCH_NUMBER: /^(\d{1,3})(\d{0,3})(\d{0,4})$/,
    PHONE_LENGTH: 10,
    DEFAULT_BLOCK_HEIGHT: 65,
    DEFAULT_BLOCK_MSG_HEIGHT: 80
}

const styles = StyleSheet.create({
    midFontSize: {
        fontSize: 14
    },
    blackFontColor: {
        color: '#000000'
    },
    smallFontSize: {
        fontSize: 12
    },
    labelFontColor: {
        color: '#565656'
    },
    fontRedColor: {
        color: '#EB445A'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    }
})

const MatchResult = (match) => {
    let formatPhone = ''
    if (match) {
        formatPhone = `(${match[1]}${match[2] ? ') ' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`
    }
    return formatPhone
}

const getFormatPhone = (phone: string) => {
    let matchRes
    if (phone.length <= VALIDATION_RULES.PHONE_LENGTH) {
        matchRes = phone.match(VALIDATION_RULES.PHONE_MATCH_NUMBER)
        return MatchResult(matchRes)
    }
    matchRes = phone.slice(0, phone.length - 1).match(VALIDATION_RULES.PHONE_MATCH_NUMBER)
    return MatchResult(matchRes)
}

export const getFormatPhoneForGeoFence = (phone: string) => {
    if (phone.length <= VALIDATION_RULES.PHONE_LENGTH) {
        return getFormatPhone(phone)
    }

    return phone
}

export const getCheckPhoneNumberResult = (phoneStr: string) => {
    const checkResult = {
        msg: '',
        value: '',
        msgHeight: VALIDATION_RULES.DEFAULT_BLOCK_HEIGHT
    }
    phoneStr = phoneStr.replace(VALIDATION_RULES.NUMBER_NOT_NUMBER, '')
    if (phoneStr.length < VALIDATION_RULES.PHONE_LENGTH && phoneStr !== '') {
        checkResult.msg = t.labels.PBNA_MOBILE_PLEASE_INPUT_A_VALID_PHONE_NUMBER
        checkResult.msgHeight = VALIDATION_RULES.DEFAULT_BLOCK_MSG_HEIGHT
    }
    checkResult.value = getFormatPhone(phoneStr)
    return checkResult
}

const PhoneNumberInput = (props: NegotiateLeadProps) => {
    const { label, placeholder, onChange, labelStyle, noPaddingHorizontal, value, inputStyle, cRef } = props

    const [phoneNumber, setPhoneNumber] = useState(value || '')
    const [errMsg, setErrMsg] = useState('')
    const [errorPhoneBlock, setErrorPhoneBlock] = useState(65)
    const [initFlag, setInitFlag] = useState(false)
    const [flag, setFlag] = useState(false)
    /**
     * @description Verify that the phone number entered is a U.S. phone number
     */
    const checkPhoneNumber = (phone, dispatchChange?) => {
        const res = getCheckPhoneNumberResult(phone)
        setErrMsg(res.msg)
        setErrorPhoneBlock(res.msgHeight)
        setPhoneNumber(res.value)
        if (onChange && !dispatchChange) {
            onChange(res.value)
        }
    }

    useImperativeHandle(cRef, () => ({
        reset: () => {
            setPhoneNumber(value)
            if (value != null) {
                checkPhoneNumber(value, true)
            }
        },
        setValue: (v) => {
            setPhoneNumber(v)
        }
    }))

    useEffect(() => {
        if (value != null && !flag && initFlag) {
            checkPhoneNumber(value)
        } else {
            setFlag(false)
        }
        setInitFlag(true)
    }, [value])

    return (
        <Input
            inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
            labelStyle={labelStyle || [styles.smallFontSize, styles.labelFontColor]}
            value={phoneNumber}
            label={label}
            placeholder={placeholder || ''}
            containerStyle={
                noPaddingHorizontal
                    ? [styles.noPaddingHorizontal, { height: errorPhoneBlock }]
                    : { height: errorPhoneBlock }
            }
            errorStyle={styles.fontRedColor}
            keyboardType={'numeric'}
            inputContainerStyle={errMsg ? commonStyle.errorBorderBottomGrayColor : commonStyle.borderBottomGrayColor}
            errorMessage={errMsg}
            onChangeText={(v) => checkPhoneNumber(v)}
        />
    )
}

export default PhoneNumberInput
