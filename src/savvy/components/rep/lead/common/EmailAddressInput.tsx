/**
 * @description Component to input phone number.
 * @author Qiulin Deng
 * @date 2021-04-29
 * @Lase
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

export const checkEmailAddressCorrect = (emailStr: string) => {
    const result = {
        msg: '',
        msgHeight: 65
    }
    if (
        !/^[a-zA-Z0-9%'+_-]+(?:\.[a-zA-Z0-9%'+_-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/.test(
            emailStr
        ) &&
        emailStr !== ''
    ) {
        result.msg = t.labels.PBNA_MOBILE_PLEASE_INPUT_A_VALID_EMAIL_ADDRESS
        result.msgHeight = 80
    } else {
        result.msg = ''
        result.msgHeight = 65
    }
    return result
}

const EmailAddressInput = (props: NegotiateLeadProps) => {
    const { label, placeholder, onChange, labelStyle, noPaddingHorizontal, value, inputStyle, cRef } = props

    const [emailAddress, setEmailAddress] = useState(value || '')
    const [errMsg, setErrMsg] = useState('')
    const [errorPhoneBlock, setErrorEmailBlock] = useState(65)
    const [initFlag, setInitFlag] = useState(false)
    const [flag, setFlag] = useState(false)
    /**
     * @description Verify that the email address is in the correct format
     */
    const checkEmailAddress = (email, dispatchChange?) => {
        const emailValue = email.replace(/[‘’`]/, "'")
        if (onChange && !dispatchChange) {
            onChange(emailValue)
        }
        setEmailAddress(emailValue)
        const checkRes = checkEmailAddressCorrect(emailValue)
        setErrMsg(checkRes.msg)
        setErrorEmailBlock(checkRes.msgHeight)
    }

    useImperativeHandle(cRef, () => ({
        reset: () => {
            setEmailAddress(value)
            if (value != null) {
                checkEmailAddress(value, true)
            }
        },
        setValue: (v) => {
            setEmailAddress(v)
        },
        correct: errMsg === ''
    }))

    useEffect(() => {
        if (value != null && !flag && initFlag) {
            checkEmailAddress(value)
        } else {
            setFlag(false)
        }
        setInitFlag(true)
    }, [])

    return (
        <Input
            inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
            labelStyle={labelStyle || [styles.smallFontSize, styles.labelFontColor]}
            value={emailAddress}
            label={label}
            inputContainerStyle={errMsg ? commonStyle.errorBorderBottomGrayColor : commonStyle.borderBottomGrayColor}
            placeholder={placeholder || ''}
            containerStyle={
                noPaddingHorizontal
                    ? [styles.noPaddingHorizontal, { height: errorPhoneBlock }]
                    : { height: errorPhoneBlock }
            }
            errorStyle={styles.fontRedColor}
            errorMessage={errMsg}
            onChangeText={(v) => checkEmailAddress(v)}
        />
    )
}

export default EmailAddressInput
