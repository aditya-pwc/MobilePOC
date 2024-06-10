/**
 * @description Component to create leads.
 * @author Qiulin Deng
 * @date 2021-05-25
 * @Lase
 */
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input } from 'react-native-elements'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import PickerTile from './PickerTile'

interface AddressInfo {
    label: string
    showCountry: boolean
    lstCountry: any
    mapState: any
    cRef: any
    onChange?: any
    noPaddingHorizontal?: boolean
    labelStyle?: any
    value?: any
    inputStyle?: any
    containerStyle?: any
}

const VALIDATION_RULES = {
    US_POSTAL_CODE_VALIDATION: /^\d{5}(?:[-]\d{4})?$/,
    MX_POSTAL_CODE_VALIDATION: /^\d{5}$/,
    NUMBER_NOT_NUMBER: /\D/g,
    US_ZIP_CODE: /^(\d{0,5})(\d{0,4})$/,
    CA_ZIP_CODE: /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1}[ ]\d{1}[A-Z]{1}\d{1}$/,
    DEFAULT_BLOCK_HEIGHT: 65,
    DEFAULT_BLOCK_NO_MSG_HEIGHT: 50,
    HIGHER_BLOCK_HEIGHT: 80
}
const styles = StyleSheet.create({
    midFontSize: {
        fontSize: 14
    },
    blackFontColor: {
        color: '#000000'
    },
    nonLabelInput: {
        height: 50
    },
    fontRedColor: {
        color: 'red'
    },
    smallFontSize: {
        fontSize: 12
    },
    labelFontColor: {
        color: '#565656'
    },
    inputContainer: {
        height: 65
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    halfLayout: {
        width: '50%'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    }
})

enum DEFAULT_VALUE {
    US = 'United States',
    MX = 'Mexico',
    CA = 'Canada',
    State = 'Select State',
    ErrMSG = 'Please input a valid ZIP code!',
    Placeholder = 'Enter Street Address'
}

const STREET_LENGTH_LIMIT = 60

const getUSFormatZIP = (code: string) => {
    let formatCode = ''
    if (code.length <= 9) {
        const match = code.match(VALIDATION_RULES.US_ZIP_CODE)
        if (match) {
            formatCode = `${match[1]}${match[2] ? '-' : ''}${match[2]}`
        }
    } else {
        const match = code.slice(0, code.length - 1).match(VALIDATION_RULES.US_ZIP_CODE)
        if (match) {
            formatCode = `${match[1]}${match[2] ? '-' : ''}${match[2]}`
        }
    }
    return formatCode
}

const checkUSZIPCode = (value: string) => {
    const checkResult = {
        error: false,
        errMsgHeight: VALIDATION_RULES.DEFAULT_BLOCK_NO_MSG_HEIGHT,
        value: ''
    }
    if (!VALIDATION_RULES.US_POSTAL_CODE_VALIDATION.test(value) && value !== '') {
        value = value.replace(VALIDATION_RULES.NUMBER_NOT_NUMBER, '')
        if (value.length < 9 && value !== '' && value.length !== 5) {
            checkResult.error = true
            checkResult.errMsgHeight = VALIDATION_RULES.DEFAULT_BLOCK_HEIGHT
        }
        checkResult.value = getUSFormatZIP(value)
    } else {
        checkResult.value = value
    }
    return checkResult
}

const checkCAZIPCode = (value) => {
    const checkResult = {
        error: false,
        errMsgHeight: VALIDATION_RULES.DEFAULT_BLOCK_NO_MSG_HEIGHT,
        value: ''
    }
    value = value.toUpperCase()
    checkResult.value = value
    if (!VALIDATION_RULES.CA_ZIP_CODE.test(value) && value !== '') {
        checkResult.error = true
        checkResult.errMsgHeight = VALIDATION_RULES.DEFAULT_BLOCK_HEIGHT
    }
    return checkResult
}

const checkMXZIPCode = (value) => {
    const checkResult = {
        error: false,
        errMsgHeight: VALIDATION_RULES.DEFAULT_BLOCK_NO_MSG_HEIGHT,
        value: ''
    }
    if (!VALIDATION_RULES.MX_POSTAL_CODE_VALIDATION.test(value) && value !== '') {
        value = value.replace(VALIDATION_RULES.NUMBER_NOT_NUMBER, '')
        if (value.length < 5 && value !== '') {
            checkResult.error = true
            checkResult.errMsgHeight = VALIDATION_RULES.DEFAULT_BLOCK_HEIGHT
        }
        if (value.length <= 5) {
            checkResult.value = value
        } else {
            checkResult.value = value.slice(0, value.length - 1)
        }
    } else {
        checkResult.value = value
    }
    return checkResult
}

const getPaddingHorizontalStyle = (noPaddingHorizontal, containerStyle) => {
    if (noPaddingHorizontal) {
        return [styles.inputContainer, styles.noPaddingHorizontal, containerStyle]
    }
    return [styles.inputContainer, containerStyle]
}

const getCityPaddingStyle = (noPaddingHorizontal, containerStyle) => {
    if (noPaddingHorizontal) {
        return [styles.nonLabelInput, containerStyle, { paddingLeft: 0 }]
    }
    return [styles.nonLabelInput, containerStyle]
}

const checkPropsAddressValue = (checkValue) => {
    const address = {
        Street__c: '',
        City__c: '',
        State__c: t.labels.PBNA_MOBILE_SELECT_STATE,
        Country__c: DEFAULT_VALUE.US,
        PostalCode__c: ''
    }
    if (checkValue) {
        address.Street__c = checkValue.Street__c
        address.City__c = checkValue.City__c
        address.State__c = checkValue.State__c
        address.Country__c = checkValue.Country__c
        address.PostalCode__c = checkValue.PostalCode__c
    }
    return address
}

const AddressInput = (props: AddressInfo) => {
    const {
        label,
        showCountry,
        lstCountry,
        mapState,
        cRef,
        onChange,
        noPaddingHorizontal,
        labelStyle,
        inputStyle,
        value,
        containerStyle
    } = props
    const countryRef = useRef(null)
    const stateRef = useRef(null)
    const checkAddressValue = checkPropsAddressValue(value)
    const [addressInfo, setAddressInfo] = useState({
        Street__c: checkAddressValue.Street__c,
        City__c: checkAddressValue.City__c,
        State__c: checkAddressValue.State__c,
        Country__c: checkAddressValue.Country__c,
        PostalCode__c: checkAddressValue.PostalCode__c
    })
    const [zipError, setZipError] = useState(false)
    const [streetError, setStreetError] = useState(false)
    const [errorZIPBlock, setErrorZIPBlock] = useState(50)
    const [flag, setFlag] = useState(false)
    const [initFlag, setInitFlag] = useState(false)
    useEffect(() => {
        if (value?.Street__c?.length > STREET_LENGTH_LIMIT) {
            setStreetError(true)
        }
    }, [value?.Street__c])
    useEffect(() => {
        if (onChange && !flag && initFlag) {
            onChange(addressInfo)
        } else {
            setFlag(false)
        }
        setInitFlag(true)
    }, [addressInfo])

    useImperativeHandle(cRef, () => ({
        addressInfo,
        zipError,
        streetError,
        reset: () => {
            setFlag(true)
            setZipError(false)
            setAddressInfo({
                Street__c: value ? value.Street__c : '',
                City__c: value ? value.City__c : '',
                State__c: value ? value.State__c : t.labels.PBNA_MOBILE_SELECT_STATE,
                Country__c: value ? value.Country__c : DEFAULT_VALUE.US,
                PostalCode__c: value ? value.PostalCode__c : ''
            })
            setStreetError(value?.Street__c?.length > STREET_LENGTH_LIMIT)
            countryRef.current.reset()
            stateRef.current.reset()
        }
    }))

    const getUSZIPCode = (ZIPCode) => {
        const checkRes = checkUSZIPCode(ZIPCode)
        setZipError(checkRes.error)
        setErrorZIPBlock(checkRes.errMsgHeight)
        setAddressInfo({
            ...addressInfo,
            PostalCode__c: checkRes.value
        })
    }

    const getCAZIPCode = (ZIPCode) => {
        const checkRes = checkCAZIPCode(ZIPCode)
        setZipError(checkRes.error)
        setErrorZIPBlock(checkRes.errMsgHeight)
        setAddressInfo({
            ...addressInfo,
            PostalCode__c: checkRes.value
        })
    }

    const getMXZIPCode = (ZIPCode) => {
        const checkRes = checkMXZIPCode(ZIPCode)
        setZipError(checkRes.error)
        setErrorZIPBlock(checkRes.errMsgHeight)
        setAddressInfo({
            ...addressInfo,
            PostalCode__c: checkRes.value
        })
    }

    /**
     * @description Verify that the phone number entered ZIP code
     */
    const checkZIPCode = (ZIPCode) => {
        switch (addressInfo.Country__c) {
            case DEFAULT_VALUE.US:
                return getUSZIPCode(ZIPCode)
            case DEFAULT_VALUE.MX:
                return getMXZIPCode(ZIPCode)
            case DEFAULT_VALUE.CA:
                return getCAZIPCode(ZIPCode)
            default:
                return null
        }
    }

    const renderZipCodeInput = () => {
        if (addressInfo.Country__c === DEFAULT_VALUE.CA) {
            return (
                <Input
                    inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
                    value={addressInfo.PostalCode__c}
                    placeholder={t.labels.PBNA_MOBILE_ZIP_CODE}
                    inputContainerStyle={commonStyle.borderBottomGrayColor}
                    errorStyle={styles.fontRedColor}
                    errorMessage={zipError ? t.labels.PBNA_MOBILE_PLEASE_INPUT_A_VALID_ZIP_CODE : ''}
                    containerStyle={
                        noPaddingHorizontal
                            ? [
                                  styles.nonLabelInput,
                                  containerStyle,
                                  styles.noPaddingHorizontal,
                                  { height: errorZIPBlock }
                              ]
                            : [styles.nonLabelInput, containerStyle, { height: errorZIPBlock }]
                    }
                    onChangeText={(ZIPCodeText) => {
                        checkZIPCode(ZIPCodeText)
                    }}
                />
            )
        }
        return (
            <Input
                inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
                value={addressInfo.PostalCode__c}
                placeholder={t.labels.PBNA_MOBILE_ZIP_CODE}
                errorStyle={styles.fontRedColor}
                inputContainerStyle={commonStyle.borderBottomGrayColor}
                errorMessage={zipError ? t.labels.PBNA_MOBILE_PLEASE_INPUT_A_VALID_ZIP_CODE : ''}
                containerStyle={
                    noPaddingHorizontal
                        ? [styles.nonLabelInput, containerStyle, styles.noPaddingHorizontal, { height: errorZIPBlock }]
                        : [styles.nonLabelInput, containerStyle, { height: errorZIPBlock }]
                }
                keyboardType={'numeric'}
                onChangeText={(ZIPCodeText) => {
                    checkZIPCode(ZIPCodeText)
                }}
            />
        )
    }

    return (
        <View>
            <Input
                inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
                labelStyle={[styles.smallFontSize, styles.labelFontColor, labelStyle]}
                value={addressInfo.Street__c}
                label={label}
                placeholder={t.labels.PBNA_MOBILE_ENTER_STREET_ADDRESS}
                inputContainerStyle={commonStyle.borderBottomGrayColor}
                containerStyle={[
                    getPaddingHorizontalStyle(noPaddingHorizontal, containerStyle),
                    streetError && {
                        height: VALIDATION_RULES.HIGHER_BLOCK_HEIGHT
                    }
                ]}
                onChangeText={(streetText) => {
                    if (streetText.length > STREET_LENGTH_LIMIT) {
                        setStreetError(true)
                    } else {
                        setStreetError(false)
                    }
                    setAddressInfo({
                        ...addressInfo,
                        Street__c: streetText
                    })
                }}
                maxLength={STREET_LENGTH_LIMIT}
                errorMessage={streetError ? t.labels.PBNA_MOBILE_ADDRESS_MUST_BE_LESS_THAN_60_CHARACTERS : ''}
            />

            {showCountry && (
                <PickerTile
                    data={lstCountry}
                    label={''}
                    title={t.labels.PBNA_MOBILE_COUNTRY}
                    disabled={false}
                    defValue={value.Country__c}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    inputStyle={inputStyle}
                    required
                    containerStyle={containerStyle}
                    noPaddingHorizontal={noPaddingHorizontal}
                    cRef={countryRef}
                    onChange={(countryText) => {
                        setAddressInfo({
                            ...addressInfo,
                            Country__c: countryText,
                            Street__c: '',
                            PostalCode__c: '',
                            City__c: '',
                            State__c: t.labels.PBNA_MOBILE_SELECT_STATE
                        })
                        stateRef.current.resetNull()
                    }}
                />
            )}

            <View style={[styles.flexDirectionRow]}>
                <View style={styles.halfLayout}>
                    <Input
                        inputStyle={inputStyle || [styles.midFontSize, styles.blackFontColor]}
                        value={addressInfo.City__c}
                        containerStyle={getCityPaddingStyle(noPaddingHorizontal, containerStyle)}
                        inputContainerStyle={commonStyle.borderBottomGrayColor}
                        placeholder={t.labels.PBNA_MOBILE_ENTER_CITY}
                        onChangeText={(cityText) => {
                            setAddressInfo({
                                ...addressInfo,
                                City__c: cityText.replace(/[^a-zA-Z ]/g, '')
                            })
                        }}
                    />
                </View>
                <View style={[styles.halfLayout]}>
                    <PickerTile
                        data={mapState[addressInfo.Country__c]}
                        label={''}
                        title={t.labels.PBNA_MOBILE_STATE}
                        inputStyle={inputStyle}
                        containerStyle={containerStyle}
                        disabled={false}
                        defValue={value.State__c}
                        placeholder={t.labels.PBNA_MOBILE_SELECT_STATE}
                        required
                        noPaddingHorizontal={noPaddingHorizontal}
                        cRef={stateRef}
                        onChange={(item) => {
                            setAddressInfo({
                                ...addressInfo,
                                State__c: item
                            })
                        }}
                    />
                </View>
            </View>
            {renderZipCodeInput()}
        </View>
    )
}

export default AddressInput
