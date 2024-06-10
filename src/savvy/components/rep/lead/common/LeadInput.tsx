import React, { useEffect, useImperativeHandle, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Input, InputProps } from 'react-native-elements'
import store from '../../../../redux/store/Store'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import DollarSvg from '../../../../../../assets/image/icon-dollar.svg'
import LeadFieldTile from './LeadFieldTile'
import _ from 'lodash'
import { addZeroes } from '../../../../utils/LeadUtils'
import { t } from '../../../../../common/i18n/t'
interface LeadInputProps {
    fieldName: string
    fieldValue?: string
    onChangeText?: any
    multiline?: boolean
    disabled?: boolean
    fieldApiName?: string
    number?: boolean
    currency?: boolean
    section?: string
    url?: boolean
    onValidate?: any
    labelStyle?: any
    cRef?: any
    initValue?: string
    placeholder?: string
    noMargin?: boolean
    maxLength?: number
    required?: boolean
    requiredText?: string
    trackedValue?: string
    customErrorMessage?: string
}

const styles = StyleSheet.create({
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        marginTop: 5,
        fontFamily: 'Gotham-Book'
    },
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        fontFamily: 'Gotham-Book'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    disabledInputStyle: {
        backgroundColor: '#f1f1f1'
    },
    inputContainerStyle: {
        borderBottomColor: '#D3D3D3',
        marginBottom: 6
    },
    errorInputContainerStyle: {
        borderBottomColor: '#EB445A',
        marginBottom: 6
    },
    errorStyle: {
        color: '#EB445A',
        marginLeft: 0
    },
    leftIconContainerStyle: {
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 2,
        alignItems: 'flex-start',
        paddingRight: 0
    },
    fieldLabelStyle: {
        marginTop: 0
    },
    fieldContainerStyle: {
        marginBottom: 30
    }
})

const LeadInput = (props: LeadInputProps & InputProps) => {
    const dispatch = useDispatch()
    const {
        cRef,
        currency,
        disabled,
        fieldApiName,
        fieldName,
        initValue,
        multiline,
        noMargin,
        number,
        onChangeText,
        onValidate,
        placeholder,
        section,
        url,
        maxLength,
        required,
        requiredText,
        trackedValue,
        customErrorMessage,
        ...restProps
    } = props
    const keyboardType = number !== undefined || currency !== undefined ? 'numeric' : 'default'
    const setInitialState = () => {
        if (initValue) {
            return initValue
        }
        if (
            fieldApiName !== null &&
            fieldApiName !== undefined &&
            store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName] !== null
        ) {
            return store.getState().leadReducer.negotiateLeadEditReducer[fieldApiName] + ''
        }
        return ''
    }
    const [errorMessage, setErrorMessage] = useState('')
    const [value, setValue] = useState(setInitialState())
    const trim = (v) => {
        return _.cloneDeep(v?.replace(/(^\s+)|(\s+$)/g, ''))
    }
    const validateUrl = (v) => {
        const pattern = new RegExp(
            // protocol
            '^(https?:\\/\\/)?' +
                // domain name
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
                // OR ip (v4) address
                '((\\d{1,3}\\.){3}\\d{1,3}))' +
                // port and path
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
                // query string
                '(\\?[;&a-z\\d%_.~+=-]*)?' +
                // fragment locator
                '(\\#[-a-z\\d_]*)?$',
            'i'
        )
        if (!pattern.test(v)) {
            setErrorMessage(t.labels.PBNA_MOBILE_URL_INVALID)
            if (onValidate) {
                onValidate(false)
            }
        } else {
            setErrorMessage('')
            if (onValidate) {
                onValidate(true)
            }
        }
    }
    const vaildateRequired = (v) => {
        if (v === '') {
            setErrorMessage(requiredText)
            if (onValidate) {
                onValidate(false)
            }
        } else {
            setErrorMessage('')
            if (onValidate) {
                onValidate(true)
            }
        }
    }
    useEffect(() => {
        if (!onChangeText) {
            return store.subscribe(() => {
                setValue(setInitialState())
            })
        }
    }, [])

    const processWithoutRedux = (v) => {
        const trimmedV = trim(v)
        if (maxLength && v.length > maxLength) {
            onChangeText(v.substring(0, maxLength))
            setValue(v.substring(0, maxLength))
        } else {
            let newValue = v
            if (currency && newValue !== '') {
                newValue = newValue.replace(/^\D*(\d{0,16}(?:\.\d{0,2})?).*$/g, '$1')
                if (newValue.replace(/\D/g, '').length > 18) {
                    newValue = value
                }
                onChangeText(newValue)
                setValue(newValue)
            } else {
                onChangeText(trimmedV)
                setValue(v)
            }
        }
    }

    const processNumber = (v) => {
        let newValue = v
        if (number && newValue !== '') {
            newValue = newValue.replace(/\D/g, '')
            if (newValue.length > 16) {
                newValue = value
            }
        }
        if (currency && newValue !== '') {
            newValue = newValue.replace(/^\D*(\d{0,16}(?:\.\d{0,2})?).*$/g, '$1')
            if (newValue.replace(/\D/g, '').length > 18) {
                newValue = value
            }
        }
        return newValue
    }

    const handleChangeText = (v) => {
        if (required) {
            vaildateRequired(v)
        }
        if (url) {
            validateUrl(v)
        }
        if (onChangeText) {
            processWithoutRedux(v)
        } else {
            const newValue = processNumber(v)
            let newObj = {}
            if (fieldApiName === 'Company__c') {
                newObj = { LastName__c: newValue }
            }
            newObj[fieldApiName] = newValue
            dispatch(updateTempLeadAction(newObj, section))
        }
    }

    const handleBlur = ({ nativeEvent }) => {
        if (currency && !onChangeText) {
            const newValue = addZeroes(nativeEvent.text)
            const newObj = {}
            newObj[fieldApiName] = newValue
            dispatch(updateTempLeadAction(newObj, section))
        }
    }

    useEffect(() => {
        if (trackedValue === '' || trackedValue) {
            setValue(trackedValue)
        }
    }, [trackedValue])

    useEffect(() => {
        setErrorMessage(customErrorMessage)
    }, [customErrorMessage])

    useImperativeHandle(cRef, () => ({
        setValue: (v) => {
            setValue(v)
            handleChangeText(v)
        },
        reset: () => {
            setValue(initValue)
        }
    }))
    if (disabled) {
        return (
            <LeadFieldTile
                fieldName={fieldName}
                fieldValue={value}
                fieldValueStyle={styles.inputStyle}
                containerStyle={styles.fieldContainerStyle}
                labelStyle={styles.fieldLabelStyle}
            />
        )
    }
    return (
        <Input
            {...restProps}
            inputStyle={noMargin ? [styles.inputStyle, { marginTop: 0 }] : [styles.inputStyle]}
            labelStyle={[styles.title, props.labelStyle]}
            value={value}
            label={fieldName}
            inputContainerStyle={errorMessage ? styles.errorInputContainerStyle : styles.inputContainerStyle}
            containerStyle={styles.noPaddingHorizontal}
            onChangeText={(e) => {
                handleChangeText(e)
            }}
            placeholder={placeholder || ''}
            multiline={multiline}
            disabled={disabled}
            keyboardType={keyboardType}
            disabledInputStyle={styles.disabledInputStyle}
            errorMessage={errorMessage}
            errorStyle={styles.errorStyle}
            leftIcon={currency ? <DollarSvg height={18} width={18} /> : null}
            scrollEnabled={!multiline}
            leftIconContainerStyle={styles.leftIconContainerStyle}
            allowFontScaling={false}
            onBlur={handleBlur}
            maxLength={maxLength}
        />
    )
}
export default LeadInput
