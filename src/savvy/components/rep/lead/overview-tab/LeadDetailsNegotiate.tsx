/**
 * @description Component to show lead details negotiate section.
 * @author Sheng Huang
 * @date 2021-05-17
 */
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import LeadFieldTile from '../common/LeadFieldTile'
import DateTimePicker from '@react-native-community/datetimepicker'
import EmailAddressInput from '../common/EmailAddressInput'
import AddressInput from '../common/AddressInput'
import { useBusinessSegmentPicklist, useRelatedCustomerList, useSuggestedRoute } from '../../../../hooks/LeadHooks'
import PickerTile from '../common/PickerTile'
import PhoneNumberInput from '../common/PhoneNumberInput'
import LeadInput from '../common/LeadInput'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { useDispatch } from 'react-redux'
import store from '../../../../redux/store/Store'
import { LeadDetailSection } from '../../../../enums/Lead'
import LeadCheckBox from '../common/LeadCheckBox'
import _ from 'lodash'
import CText from '../../../../../common/components/CText'
import { renderDeferredDateTile } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { CommonParam } from '../../../../../common/CommonParam'
import { DatePickerLocale } from '../../../../enums/i18n'
import SearchablePicklist from '../common/SearchablePicklist'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    lookUpStyle: {
        height: 40,
        lineHeight: 40
    },
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    checkboxTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginLeft: 0
    },
    leadDetailFieldTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    pickerBorder: {
        borderBottomColor: '#8a959f',
        borderBottomWidth: 1,
        marginBottom: 18,
        flexDirection: 'row',
        marginRight: 0,
        alignItems: 'center'
    },
    searchIconLayout: {
        position: 'absolute',
        left: 0,
        paddingTop: 10
    },
    searchIcon: {
        height: 25,
        width: 20
    },
    clearIconLayout: {
        position: 'absolute',
        right: 0,
        paddingTop: 4
    },
    clearIcon: {
        height: 15,
        width: 15
    },
    halfIconLayout: {
        position: 'absolute',
        right: 0,
        paddingTop: 4
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 300,
        width: 300
    },
    datePicker: {
        margin: 20
    },
    formItem: {
        paddingRight: 0,
        marginBottom: 22,
        borderBottomColor: '#8a959f',
        borderBottomWidth: 1
    },
    imgCalendar: {
        marginTop: 12,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    marginBottom28: {
        marginBottom: 28
    },
    phoneInputView: {
        marginTop: -20,
        marginBottom: 18
    },
    leadSourceView: {
        marginBottom: 10,
        flexDirection: 'row'
    },
    pickerCont: {
        flex: 1,
        marginTop: 15
    },
    outletCont: {
        flex: 1,
        marginTop: 10
    },
    searchText: {
        fontSize: 12,
        color: 'grey'
    },
    fontWeight700: {
        fontWeight: '700'
    },
    marginBottom27: {
        marginBottom: 27
    },
    checkBox: {
        marginTop: 0,
        padding: 0,
        marginBottom: 25
    }
})

const LeadDetailsNegotiate = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const [showDatePicker, setShowDatePicker] = useState(false)
    const { countryList, stateList } = useBusinessSegmentPicklist()
    const { localRoute, nationalRoute } = useSuggestedRoute(l)
    const [relatedCustomerSearchVal, setRelatedCustomerSearchVal] = useState('')
    const relatedCustomerList = useRelatedCustomerList(relatedCustomerSearchVal)
    const addressInfoRef = useRef(null)
    const leadTypeRef = useRef(null)
    const phoneRef = useRef(null)
    const emailInputRef = useRef(null)
    const dispatch = useDispatch()
    const leadTypeMapping = [
        { k: t.labels.PBNA_MOBILE_CONVERSION, v: 'Conversion' },
        { k: t.labels.PBNA_MOBILE_PRE_OPEN_LABEL, v: 'Pre Open' },
        { k: t.labels.PBNA_MOBILE_ADDITIONAL_OUTLET, v: 'Additional Outlet' },
        { k: t.labels.PBNA_MOBILE_REPAIR_ONLY, v: 'Repair Only' }
    ]
    const [tempLeadDetail, setTempLeadDetail] = useState({
        Phone__c: l.Phone__c,
        Chain_c__c: l.Chain_c__c,
        Lead_Type_c__c: l.Lead_Type_c__c,
        original_customer_c__c: l.original_customer_c__c,
        original_customer_number_c__c: l.original_customer_number_c__c,
        Deferred_Resume_Date_c__c: l.Deferred_Resume_Date_c__c,
        Street__c: l.Street__c,
        City__c: l.City__c,
        State__c: l.Street__c,
        Country__c: l.Country__c,
        PostalCode__c: l.PostalCode__c
    })

    const debounceSetText = _.debounce((v) => {
        setRelatedCustomerSearchVal(v)
    }, 500)
    const resetData = () => {
        const originData = {
            Phone__c: l.Phone__c,
            Chain_c__c: l.Chain_c__c,
            Lead_Type_c__c: l.Lead_Type_c__c,
            original_customer_c__c: l.original_customer_c__c,
            original_customer_number_c__c: l.original_customer_number_c__c,
            Deferred_Resume_Date_c__c: l.Deferred_Resume_Date_c__c,
            Company__c: l.Company__c,
            Street__c: l.Street__c,
            City__c: l.City__c,
            State__c: l.State__c,
            Country__c: l.Country__c,
            Email__c: l.Email__c,
            PostalCode__c: l.PostalCode__c,
            Chain_Store_Number_c__c: l.Chain_Store_Number_c__c,
            LastName__c: l.Company__c,
            leadDetailsEditCount: 0
        }
        dispatch(updateTempLeadAction(originData))
        leadTypeRef.current?.reset()
        phoneRef.current?.reset()
        addressInfoRef.current?.reset()
        emailInputRef.current?.reset()
    }
    useImperativeHandle(cRef, () => ({
        resetData: () => {
            resetData()
        }
    }))
    const onPhoneChange = (value) => {
        dispatch(
            updateTempLeadAction(
                {
                    Phone__c: value.replace(/\D/g, ''),
                    phoneValidationFlag: value.replace(/\D/g, '').length === 10 || value.replace(/\D/g, '').length === 0
                },
                LeadDetailSection.LEAD_DETAILS
            )
        )
    }
    const onEmailChange = (value) => {
        dispatch(
            updateTempLeadAction(
                {
                    emailValidationFlag:
                        /^[a-zA-Z0-9%'+_-]+(?:\.[a-zA-Z0-9%'+_-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/.test(
                            value
                        ) || value === '',
                    Email__c: value
                },
                LeadDetailSection.LEAD_DETAILS
            )
        )
    }
    const onRelatedCustomerChange = (val) => {
        dispatch(
            updateTempLeadAction(
                { original_customer_number_c__c: val.CUST_UNIQ_ID_VAL__c },
                LeadDetailSection.LEAD_DETAILS
            )
        )
        dispatch(updateTempLeadAction({ original_customer_c__c: val.Id }, LeadDetailSection.LEAD_DETAILS))
    }

    const onLeadTypeChange = (value) => {
        const leadTypeVal = _.find(leadTypeMapping, (item) => item.k === value).v
        if (leadTypeVal !== 'Additional Outlet') {
            onRelatedCustomerChange({ Name: '', CUST_UNIQ_ID_VAL__c: '', Id: '' })
        }
        dispatch(updateTempLeadAction({ Lead_Type_c__c: leadTypeVal }, LeadDetailSection.LEAD_DETAILS))
    }

    const onDateChange = (event, selectedDate) => {
        dispatch(
            updateTempLeadAction(
                { Deferred_Resume_Date_c__c: selectedDate.toISOString() },
                LeadDetailSection.LEAD_DETAILS
            )
        )
        setShowDatePicker(false)
    }
    const handleChangeChain = () => {
        dispatch(updateTempLeadAction({ Chain_c__c: !tempLeadDetail.Chain_c__c }, LeadDetailSection.LEAD_DETAILS))
    }

    const onChangeAddress = (value) => {
        const checkInput =
            !addressInfoRef.current.zipError &&
            !addressInfoRef.current.streetError &&
            value.Street__c !== '' &&
            value.City__c !== '' &&
            value.State__c !== '' &&
            value.State__c !== 'Select State' &&
            value.Country__c !== '' &&
            value.PostalCode__c !== ''
        dispatch(
            updateTempLeadAction(
                {
                    Street__c: value.Street__c,
                    City__c: value.City__c,
                    Country__c: value.Country__c,
                    State__c: value.State__c,
                    PostalCode__c: value.PostalCode__c,
                    addressValidationFlag: checkInput
                },
                LeadDetailSection.LEAD_DETAILS
            )
        )
    }
    useEffect(() => {
        return store.subscribe(() => {
            const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
            tempLead.Chain_c__c = tempLead.Chain_c__c === '1' || tempLead.Chain_c__c === true
            setTempLeadDetail({
                Phone__c: tempLead.Phone__c,
                Lead_Type_c__c: tempLead.Lead_Type_c__c,
                original_customer_c__c: tempLead.original_customer_c__c,
                original_customer_number_c__c: tempLead.original_customer_number_c__c,
                Chain_c__c: tempLead.Chain_c__c,
                Deferred_Resume_Date_c__c: tempLead.Deferred_Resume_Date_c__c,
                Street__c: tempLead.Street__c,
                City__c: tempLead.City__c,
                State__c: tempLead.State__c,
                Country__c: tempLead.Country__c,
                PostalCode__c: tempLead.PostalCode__c
            })
        })
    }, [])
    return (
        <View style={commonStyle.fullWidth}>
            <View style={commonStyle.marginBottom_22}>
                <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_ID} fieldValue={l.LEAD_ID_c__c} />
            </View>
            <LeadInput
                fieldName={`${t.labels.PBNA_MOBILE_COMPANY} *`}
                fieldApiName={'Company__c'}
                section={LeadDetailSection.LEAD_DETAILS}
                maxLength={35}
            />
            {!_.isEmpty(l.Deferred_Resume_Date_c__c) && (
                <View style={styles.marginBottom28}>{renderDeferredDateTile(l)}</View>
            )}
            <View style={commonStyle.marginBottom_22}>
                <AddressInput
                    label={`${t.labels.PBNA_MOBILE_ADDRESS} *`}
                    labelStyle={styles.title}
                    inputStyle={styles.inputStyle}
                    showCountry
                    lstCountry={countryList}
                    mapState={stateList}
                    containerStyle={commonStyle.marginBottom_15}
                    cRef={addressInfoRef}
                    noPaddingHorizontal
                    value={{
                        Street__c: l.Street__c,
                        City__c: l.City__c,
                        State__c: l.State__c,
                        Country__c: l.Country__c,
                        PostalCode__c: l.PostalCode__c
                    }}
                    onChange={(value) => onChangeAddress(value)}
                />
            </View>
            <View style={styles.phoneInputView}>
                <PhoneNumberInput
                    label={t.labels.PBNA_MOBILE_PHONE_NUMBER}
                    noPaddingHorizontal
                    value={l.Phone__c}
                    labelStyle={styles.title}
                    inputStyle={styles.inputStyle}
                    placeholder={''}
                    onChange={onPhoneChange}
                    cRef={phoneRef}
                />
            </View>
            <EmailAddressInput
                cRef={emailInputRef}
                label={t.labels.PBNA_MOBILE_COMPANY_EMAIL}
                placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                value={l.Email__c}
                noPaddingHorizontal
                inputStyle={styles.inputStyle}
                labelStyle={styles.title}
                onChange={(value) => {
                    onEmailChange(value)
                }}
            />
            <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_OWNER} fieldValue={l.Owner_Name_c__c} />
            <View style={styles.leadSourceView}>
                <View style={commonStyle.flex_1}>
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LEAD_SOURCE} fieldValue={l.LeadSource__c} />
                </View>
            </View>
            <View style={styles.leadSourceView}>
                <View style={styles.pickerCont}>
                    <PickerTile
                        data={[
                            t.labels.PBNA_MOBILE_SELECT_LEAD_TYPE,
                            ...leadTypeMapping.map((v) => {
                                return v.k
                            })
                        ]}
                        label={t.labels.PBNA_MOBILE_LEAD_TYPE}
                        labelStyle={styles.title}
                        title={t.labels.PBNA_MOBILE_LEAD_TYPE}
                        disabled={false}
                        defValue={l.Lead_Type_c__c}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        required
                        noPaddingHorizontal
                        cRef={leadTypeRef}
                        onChange={onLeadTypeChange}
                    />
                </View>
            </View>
            {/* additional as a value do not need multi language */}
            {tempLeadDetail.Lead_Type_c__c === 'Additional Outlet' && (
                <View style={styles.leadSourceView}>
                    <View style={styles.outletCont}>
                        <SearchablePicklist
                            label={t.labels.PBNA_MOBILE_ORIGINAL_CUSTOMER_OPTIONAL}
                            labelStyle={styles.searchText}
                            onClear={() => {
                                onRelatedCustomerChange({ Name: '', CUST_UNIQ_ID_VAL__c: '', Id: '' })
                            }}
                            data={relatedCustomerList}
                            showValue={(v) => {
                                return `${v?.Name} ${v?.CUST_UNIQ_ID_VAL__c}`
                            }}
                            defValue={l.relatedCustomerLabel}
                            onSearchChange={(v) => {
                                debounceSetText(v)
                            }}
                            onApply={(v) => {
                                onRelatedCustomerChange(v)
                            }}
                        />
                    </View>
                </View>
            )}

            <View>
                <CText style={styles.fontWeight700}>{t.labels.PBNA_MOBILE_SUGGESTED_FS_ROUTE}</CText>
            </View>
            <View style={styles.marginBottom27}>
                <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_NATIONAL_ROUTE} fieldValue={nationalRoute} />
                <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LOCAL_ROUTE} fieldValue={localRoute} />
            </View>
            <LeadCheckBox
                fieldApiName={'Chain_c__c'}
                section={LeadDetailSection.LEAD_DETAILS}
                title={<CText>{t.labels.PBNA_MOBILE_MULTI_OUTLET}</CText>}
                textStyle={styles.title}
                checked={tempLeadDetail.Chain_c__c}
                containerStyle={styles.checkBox}
                editable
                onChange={handleChangeChain}
            />
            {(tempLeadDetail.Chain_c__c === true || tempLeadDetail.Chain_c__c === '1') && (
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_CD_STORE_NUMBER}
                    fieldApiName={'Chain_Store_Number_c__c'}
                    section={LeadDetailSection.LEAD_DETAILS}
                />
            )}
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.modalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            // @ts-ignore
                            // To ignore the wrong type definition
                            themeVariant={'light'}
                            testID={'dateTimePicker'}
                            mode={'date'}
                            display={'inline'}
                            value={
                                tempLeadDetail.Deferred_Resume_Date_c__c
                                    ? tempLeadDetail.Deferred_Resume_Date_c__c
                                    : new Date()
                            }
                            onChange={onDateChange}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default LeadDetailsNegotiate
