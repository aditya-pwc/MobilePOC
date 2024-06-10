/**
 * @description Component to show store operation section.
 * @author Qiulin Deng
 * @date 2021-05-024
 */
import React, { useState, useRef, useImperativeHandle } from 'react'
import { useDispatch } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import CText from '../../../../../common/components/CText'
import LeadInput from '../common/LeadInput'
import PickerTile from '../common/PickerTile'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import LeadCheckBox from '../common/LeadCheckBox'
import store from '../../../../redux/store/Store'
import { t } from '../../../../../common/i18n/t'
import { isNullSpace } from '../../../manager/helper/MerchManagerHelper'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%'
    },
    inputContainer: {
        height: 65
    },
    smallFontSize: {
        fontSize: 12
    },
    blackFontColor: {
        color: '#000000'
    },
    midFontSize: {
        fontSize: 14
    },
    labelFontColor: {
        color: '#565656'
    },
    leadDetailFieldTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    leadDetailFieldContent: {
        fontSize: 14,
        color: 'black',
        fontWeight: '400',
        marginTop: 5
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    buttonSize: {
        height: 55
    },
    bgGrayColor: {
        backgroundColor: '#f3f4f7'
    },
    fontBlueColor: {
        color: '#45a2d5'
    },
    checkBoxMulti: {
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    labelStyle: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    },
    smallWidth: {
        width: '45%'
    },
    pickerTileContainer: {
        marginLeft: '10%',
        width: '45%'
    }
})

enum CustomerAttributesSection {
    sectionName = 'customer_attributes',
    CateringApi = 'Lodging_Catering__c',
    TakeoutApi = 'ff_MEAL_TAKEOUT_c__c',
    ServesAlcoholApi = 'Alcohol_c__c',
    GasStationApi = 'gas_station_c__c',
    ServesBreakfastApi = 'ff_MEAL_BREAKFAST_c__c',
    ServesLunchApi = 'ff_MEAL_LUNCH_c__c',
    ServesDinnerApi = 'ff_MEAL_DINNER_c__c',
    isChecked = 'Yes',
    NoSiteApi = 'VENUES_ON_SITE_c__c',
    HotelStarRatingApi = 'Star_Level_c__c',
    KEnrollmentApi = 'K_12_Enrollment_c__c',
    ActiveBaseApi = 'Active_Base_Population_c__c',
    HQStreetApi = 'HQ_Address_Street_c__c',
    HQCityApi = 'HQ_Address_City_c__c',
    HQZipCodeApi = 'HQ_Address_Postal_Code_c__c',
    HQPhoneApi = 'HQ_Phone_c__c'
}

const CustomerAttributesEdit = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props

    const HQCountryRef = useRef(null)
    const outletsRef = useRef(null)
    const annualRef = useRef(null)
    const yearBusnRef = useRef(null)
    const noRoomRef = useRef(null)
    const HQStateRef = useRef(null)
    const dispatch = useDispatch()
    const [leadData, setLeadData] = useState({
        Lodging_Catering_c__c: l.Lodging_Catering_c__c,
        ff_MEAL_TAKEOUT_c__c: l.ff_MEAL_TAKEOUT_c__c,
        Alcohol_c__c: l.Alcohol_c__c,
        gas_station_c__c: l.gas_station_c__c,
        ff_MEAL_BREAKFAST_c__c: l.ff_MEAL_BREAKFAST_c__c,
        ff_MEAL_LUNCH_c__c: l.ff_MEAL_LUNCH_c__c,
        ff_MEAL_DINNER_c__c: l.ff_MEAL_DINNER_c__c
    })

    const judgeOutlet = () => {
        return (
            (l.Status__c === 'Open' && l.Chain_c__c === '1') ||
            (l.Status__c === 'Negotiate' && store.getState().leadReducer.negotiateLeadEditReducer.Chain_c__c === true)
        )
    }

    const resetData = () => {
        const originData = {
            Number_of_Rooms_c__c: l.Number_of_Rooms_c__c,
            VENUES_ON_SITE_c__c: l.VENUES_ON_SITE_c__c,
            Annual_Sales_c__c: l.Annual_Sales_c__c,
            Number_Units_c__c: l.Number_Units_c__c,
            Lodging_Catering_c__c: l.Lodging_Catering_c__c,
            ff_MEAL_TAKEOUT_c__c: l.ff_MEAL_TAKEOUT_c__c,
            Alcohol_c__c: l.Alcohol_c__c,
            gas_station_c__c: l.gas_station_c__c,
            ff_MEAL_BREAKFAST_c__c: l.ff_MEAL_BREAKFAST_c__c,
            ff_MEAL_LUNCH_c__c: l.ff_MEAL_LUNCH_c__c,
            ff_MEAL_DINNER_c__c: l.ff_MEAL_DINNER_c__c,
            customerAttributesEditCount: 0
        }
        setLeadData({
            ...leadData,
            Lodging_Catering_c__c: l.Lodging_Catering_c__c,
            ff_MEAL_TAKEOUT_c__c: l.ff_MEAL_TAKEOUT_c__c,
            Alcohol_c__c: l.Alcohol_c__c,
            gas_station_c__c: l.gas_station_c__c,
            ff_MEAL_BREAKFAST_c__c: l.ff_MEAL_BREAKFAST_c__c,
            ff_MEAL_LUNCH_c__c: l.ff_MEAL_LUNCH_c__c,
            ff_MEAL_DINNER_c__c: l.ff_MEAL_DINNER_c__c
        })
        dispatch(updateTempLeadAction(originData))
        noRoomRef.current.reset()
        annualRef.current.reset()
        if (judgeOutlet()) {
            outletsRef.current.reset()
        }
    }

    useImperativeHandle(cRef, () => ({
        resetData: () => {
            resetData()
        }
    }))

    return (
        <View style={styles.container}>
            <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_10]}>
                <View style={commonStyle.halfWidth}>
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_CATERING}</CText>}
                        checked={leadData.Lodging_Catering_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.CateringApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                Lodging_Catering_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction(
                                    { Lodging_Catering_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_TAKEOUT}</CText>}
                        checked={leadData.ff_MEAL_TAKEOUT_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.TakeoutApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                ff_MEAL_TAKEOUT_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction(
                                    { ff_MEAL_TAKEOUT_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_SERVES_ALCOHOL}</CText>}
                        checked={leadData.Alcohol_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.ServesAlcoholApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                Alcohol_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction({ Alcohol_c__c: value }, CustomerAttributesSection.sectionName)
                            )
                        }}
                    />
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_GAS_STATION}?</CText>}
                        checked={leadData.gas_station_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.GasStationApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                gas_station_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction({ gas_station_c__c: value }, CustomerAttributesSection.sectionName)
                            )
                        }}
                    />
                </View>
                <View style={commonStyle.halfWidth}>
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_SERVES_BREAKFAST}?</CText>}
                        checked={leadData.ff_MEAL_BREAKFAST_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.ServesBreakfastApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                ff_MEAL_BREAKFAST_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction(
                                    { ff_MEAL_BREAKFAST_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_SERVES_LUNCH}</CText>}
                        checked={leadData.ff_MEAL_LUNCH_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.ServesLunchApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                ff_MEAL_LUNCH_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction(
                                    { ff_MEAL_LUNCH_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                    <LeadCheckBox
                        title={<CText>{t.labels.PBNA_MOBILE_SERVES_DINNER}</CText>}
                        checked={leadData.ff_MEAL_DINNER_c__c === CustomerAttributesSection.isChecked}
                        editable
                        containerStyle={styles.checkBoxMulti}
                        fieldApiName={CustomerAttributesSection.ServesDinnerApi}
                        section={CustomerAttributesSection.sectionName}
                        onChange={(value) => {
                            setLeadData({
                                ...leadData,
                                ff_MEAL_DINNER_c__c: value
                            })
                            dispatch(
                                updateTempLeadAction(
                                    { ff_MEAL_DINNER_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                </View>
            </View>
            <View style={[commonStyle.flexDirectionRow, commonStyle.marginTop_20]}>
                <View style={styles.smallWidth}>
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_NUMBER_OF_VENUES_ON_SITE}
                        fieldApiName={CustomerAttributesSection.NoSiteApi}
                        section={CustomerAttributesSection.sectionName}
                        disabled={l.VENUES_ON_SITE_c__c !== null}
                        number
                    />
                </View>
                <View style={styles.pickerTileContainer}>
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_HOTEL_STAR_RATING}
                        fieldApiName={CustomerAttributesSection.HotelStarRatingApi}
                        section={CustomerAttributesSection.sectionName}
                        disabled
                        number
                    />
                </View>
            </View>
            <View style={commonStyle.flexDirectionRow}>
                <View style={styles.smallWidth}>
                    <PickerTile
                        data={[
                            t.labels.PBNA_MOBILE_SELECT_NUMBER_OF_ROOMS,
                            '1 - 25',
                            '26 - 50',
                            '51 - 100',
                            '101 - 200',
                            '201 - 500',
                            '500+'
                        ]}
                        label={t.labels.PBNA_MOBILE_NUMBER_OF_ROOMS}
                        title={t.labels.PBNA_MOBILE_NUMBER_OF_ROOMS.toUpperCase()}
                        defValue={l.Number_of_Rooms_c__c}
                        placeholder={''}
                        required={false}
                        disabled={l.Number_of_Rooms_c__c !== null}
                        noPaddingHorizontal
                        containerStyle={commonStyle.marginBottom_20}
                        labelStyle={styles.labelStyle}
                        cRef={noRoomRef}
                        onChange={(value) => {
                            dispatch(
                                updateTempLeadAction(
                                    { Number_of_Rooms_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                </View>
                <View style={styles.pickerTileContainer}>
                    <PickerTile
                        data={[]}
                        label={t.labels.PBNA_MOBILE_YEARS_IN_BUSINESS}
                        title={t.labels.PBNA_MOBILE_YEARS_IN_BUSINESS.toUpperCase()}
                        defValue={l.Years_In_Business_c__c}
                        placeholder={''}
                        required={false}
                        disabled
                        noPaddingHorizontal
                        containerStyle={commonStyle.marginBottom_20}
                        labelStyle={styles.labelStyle}
                        cRef={yearBusnRef}
                    />
                </View>
            </View>
            <LeadInput
                fieldName={t.labels.PBNA_MOBILE_K_12_ENROLLMENT}
                fieldApiName={CustomerAttributesSection.KEnrollmentApi}
                section={CustomerAttributesSection.sectionName}
                disabled
                number
            />
            <LeadInput
                fieldName={t.labels.PBNA_MOBILE_ACTIVE_BASE_POPULATION}
                fieldApiName={CustomerAttributesSection.ActiveBaseApi}
                section={CustomerAttributesSection.sectionName}
                disabled
                number
            />
            <PickerTile
                data={[
                    `-- ${t.labels.PBNA_MOBILE_SELECT_ANNUAL_SALES} --`,
                    'Less than $500,000',
                    '$500,000 to $1,000,000',
                    '$1,000,000 to $2,500,000',
                    '$2,500,000 to $5,000,000',
                    'Greater than $5,000,000'
                ]}
                label={t.labels.PBNA_MOBILE_Annual_Sales}
                title={t.labels.PBNA_MOBILE_Annual_Sales.toUpperCase()}
                defValue={l.Annual_Sales_c__c}
                placeholder={''}
                required={false}
                disabled
                noPaddingHorizontal
                containerStyle={commonStyle.marginBottom_20}
                labelStyle={styles.labelStyle}
                cRef={annualRef}
            />
            {judgeOutlet() && (
                <View>
                    <PickerTile
                        data={[
                            `-- ${t.labels.PBNA_MOBILE_SELECT_NUMBER_OF_OUTLETS} --`,
                            '1',
                            '2 to 10',
                            '11 to 20',
                            '21 to 50',
                            '51 to 250',
                            '>250'
                        ]}
                        label={t.labels.PBNA_MOBILE_NUMBER_OF_OUTLETS}
                        title={t.labels.PBNA_MOBILE_NUMBER_OF_OUTLETS.toUpperCase()}
                        defValue={l.Number_Units_c__c}
                        placeholder={''}
                        required={false}
                        disabled={false}
                        noPaddingHorizontal
                        containerStyle={commonStyle.marginBottom_20}
                        labelStyle={styles.labelStyle}
                        cRef={outletsRef}
                        onChange={(value) => {
                            dispatch(
                                updateTempLeadAction(
                                    { Number_Units_c__c: value },
                                    CustomerAttributesSection.sectionName
                                )
                            )
                        }}
                    />
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_HQ_ADDRESS_STREET}
                        fieldApiName={CustomerAttributesSection.HQStreetApi}
                        section={CustomerAttributesSection.sectionName}
                        disabled
                    />
                    <View style={commonStyle.flexDirectionRow}>
                        <View style={styles.smallWidth}>
                            <LeadInput
                                fieldName={''}
                                fieldApiName={CustomerAttributesSection.HQCityApi}
                                section={CustomerAttributesSection.sectionName}
                                disabled
                            />
                        </View>
                        <View style={styles.pickerTileContainer}>
                            <PickerTile
                                data={[]}
                                label={''}
                                title={t.labels.PBNA_MOBILE_HQ_ADDRESS_STATE}
                                disabled
                                defValue={l.HQ_Address_State_c__c}
                                placeholder={''}
                                required={false}
                                noPaddingHorizontal
                                containerStyle={commonStyle.marginTop_5}
                                labelStyle={styles.labelStyle}
                                cRef={HQStateRef}
                            />
                        </View>
                    </View>
                    <LeadInput
                        fieldName={''}
                        fieldApiName={CustomerAttributesSection.HQZipCodeApi}
                        section={CustomerAttributesSection.sectionName}
                        disabled
                    />
                    <PickerTile
                        data={[]}
                        label={t.labels.PBNA_MOBILE_HQ_ADDRESS_COUNTRY}
                        title={isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                        disabled
                        defValue={l.HQ_Address_Country_c__c}
                        placeholder={''}
                        required={false}
                        noPaddingHorizontal
                        labelStyle={styles.labelStyle}
                        cRef={HQCountryRef}
                    />
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_HQ_PHONE_NUMBER}
                        fieldApiName={CustomerAttributesSection.HQPhoneApi}
                        section={CustomerAttributesSection.sectionName}
                        disabled
                    />
                </View>
            )}
        </View>
    )
}

export default CustomerAttributesEdit
