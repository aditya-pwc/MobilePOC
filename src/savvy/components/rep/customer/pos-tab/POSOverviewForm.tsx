/**
 * @description Overview for POS request
 * @author  Kiren Cao
 * @date 2022-3-17
 */
import React, { FC, Ref, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import PickerTile from '../../lead/common/PickerTile'
import LeadInput from '../../lead/common/LeadInput'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { t } from '../../../../../common/i18n/t'
import EmailAddressInput from '../../lead/common/EmailAddressInput'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { updateCustomerPOSOverview } from '../../../../redux/action/CustomerActionType'
import PhoneNumberInput from '../../lead/common/PhoneNumberInput'

interface POSOverviewFormProps {
    cRef?: Ref<any>
    stateCode?: any
}

export const posFormStyle = StyleSheet.create({
    scrollViewContainer: {
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: '5%'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputStyle2: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '400'
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    marginTop20: { marginTop: 20 },
    marginTop40: { marginTop: 40 },
    phoneNumberInputContainer: {
        marginTop: 20,
        marginBottom: 40
    }
})
const EXTRA_HEIGHT = 400
const ReasonCodeData = () => {
    return [
        `-- ${t.labels.PBNA_MOBILE_CHOOSE_REASON_CODE} --`,
        '1 - Customer Request',
        '2 - New Account',
        '4 - Sales Blitz',
        '5 - Other',
        '8 - TPM'
    ]
}

const StateData = () => {
    const acList = [
        'AL',
        'AK',
        'AB',
        'AZ',
        'AR',
        'BC',
        'CA',
        'CO',
        'CT',
        'DE',
        'DC',
        'FL',
        'GA',
        'GU',
        'HI',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'MB',
        'MD',
        'MA',
        'ME',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NB',
        'NH',
        'NJ',
        'NM',
        'NY',
        'NL',
        'NC',
        'ND',
        'NT',
        'NS',
        'NU',
        'OH',
        'OK',
        'ON',
        'OR',
        'PA',
        'PE',
        'PR',
        'QC',
        'RI',
        'SK',
        'SC',
        'SD',
        'TN',
        'TX',
        'VI',
        'UT',
        'VT',
        'VA',
        'WA',
        'WV',
        'WI',
        'WY',
        'YT'
    ]
    return [`-- ${t.labels.PBNA_MOBILE_CHOOSE_STATE_CODE} --`, ...acList.sort()]
}
const POSOverviewForm: FC<POSOverviewFormProps> = () => {
    const addressRef = useRef(null)
    const cityRef = useRef(null)
    const stateRef = useRef(null)
    const zipRef = useRef(null)
    const overview = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posOverview)
    const dispatch = useDispatch()
    const [addressChangeTimes, setAddressChangeTimes] = useState(0)

    const refreshAddress = () => {
        if (
            !_.isEmpty(overview.Address__c) ||
            !_.isEmpty(overview.City__c) ||
            !_.isEmpty(overview.State__c) ||
            !_.isEmpty(overview.Zip__c)
        ) {
            setAddressChangeTimes((changeTimes) => changeTimes + 1)
        } else {
            setAddressChangeTimes(2)
        }
    }
    useEffect(() => {
        if (addressChangeTimes === 1) {
            addressRef.current?.setValue('')
            cityRef.current?.setValue('')
            stateRef.current?.resetNull()
            zipRef.current?.setValue('')
            dispatch(
                updateCustomerPOSOverview({
                    ...overview,
                    Address__c: null,
                    City__c: null,
                    State__c: null,
                    Zip__c: null
                })
            )
        }
    }, [addressChangeTimes])
    return (
        <View style={commonStyle.flex_1}>
            <KeyboardAwareScrollView
                contentContainerStyle={posFormStyle.scrollViewContainer}
                extraHeight={EXTRA_HEIGHT}
            >
                <View style={posFormStyle.marginTop40} />
                <PickerTile
                    data={ReasonCodeData()}
                    borderStyle={commonStyle.pickTileBorderStyle}
                    label={t.labels.PBNA_MOBILE_REASON_CODE}
                    labelStyle={posFormStyle.labelStyle}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    title={t.labels.PBNA_MOBILE_SELECT_REASON_CODE}
                    disabled={false}
                    required
                    inputStyle={posFormStyle.inputStyle2}
                    onChange={(v: string) => {
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                Reason_Cde__c: v
                            })
                        )
                    }}
                    noPaddingHorizontal
                    defValue={overview?.Reason_Cde__c}
                />
                <View style={posFormStyle.marginTop20}>
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_CARE_OF_OPTIONAL}
                        placeholder={t.labels.PBNA_MOBILE_ENTER_CARE_OF}
                        onChangeText={(v: string) => {
                            dispatch(
                                updateCustomerPOSOverview({
                                    ...overview,
                                    caller_name__c: v
                                })
                            )
                        }}
                        noMargin
                        initValue={overview.caller_name__c}
                    />
                </View>
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_ADDRESS}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_ADDRESS}
                    cRef={addressRef}
                    onChangeText={(v: string) => {
                        refreshAddress()
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                Address__c: v
                            })
                        )
                    }}
                    noMargin
                    initValue={overview.Address__c}
                    multiline
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_CITY}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_CITY}
                    cRef={cityRef}
                    onChangeText={(v: string) => {
                        refreshAddress()
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                City__c: v
                            })
                        )
                    }}
                    noMargin
                    initValue={overview.City__c}
                />
                <PickerTile
                    cRef={stateRef}
                    data={StateData()}
                    borderStyle={[commonStyle.pickTileBorderStyle, commonStyle.marginBottom_20]}
                    label={t.labels.PBNA_MOBILE_STATE_PROVINCE}
                    labelStyle={posFormStyle.labelStyle}
                    defValue={overview.State__c}
                    title={t.labels.PBNA_MOBILE_SELECT_STATE_CODE}
                    disabled={false}
                    required
                    inputStyle={posFormStyle.inputStyle2}
                    onChange={() => {
                        refreshAddress()
                    }}
                    onDone={(v: string) => {
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                State__c: v
                            })
                        )
                    }}
                    noPaddingHorizontal
                    placeholder={t.labels.PBNA_MOBILE_ENTER_STATE}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_ZIP}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_ZIP}
                    cRef={zipRef}
                    onChangeText={(v: string) => {
                        refreshAddress()
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                Zip__c: v
                            })
                        )
                    }}
                    noMargin
                    initValue={overview.Zip__c}
                />
                <EmailAddressInput
                    label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_EMAIL_ADDRESS}
                    value={overview.email_addr_txt__c}
                    noPaddingHorizontal
                    inputStyle={posFormStyle.inputStyle}
                    labelStyle={posFormStyle.labelStyle}
                    onChange={(v: string) => {
                        dispatch(
                            updateCustomerPOSOverview({
                                ...overview,
                                email_addr_txt__c: v
                            })
                        )
                    }}
                />
                <View style={posFormStyle.phoneNumberInputContainer}>
                    <PhoneNumberInput
                        label={t.labels.PBNA_MOBILE_PHONE_NUMBER}
                        placeholder={'(000) 000-0000'}
                        value={overview.caller_phone_num__c}
                        noPaddingHorizontal
                        inputStyle={posFormStyle.inputStyle}
                        labelStyle={posFormStyle.labelStyle}
                        onChange={(v: string) => {
                            dispatch(
                                updateCustomerPOSOverview({
                                    ...overview,
                                    caller_phone_num__c: v
                                })
                            )
                        }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}
export default POSOverviewForm
