/**
 * @description Component to show lead delivery and execution.
 * @author Shangmin Dou
 * @date 2021-05-25
 */
import React, { FC, useImperativeHandle, useRef, useState } from 'react'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import BaseSection from '../../../common/BaseSection'
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native'
import LeadFieldTile from '../common/LeadFieldTile'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import OperationHoursModal from './OperationHoursModal'
import LeadInput from '../common/LeadInput'
import LeadDateTimePicker from '../common/LeadDateTimePicker'
import PickerTile from '../common/PickerTile'
import { useDispatch, useSelector } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { LeadDetailSection, LeadStatus } from '../../../../enums/Lead'
import DistributionPointModal from './DistributionPointModal'
import ReadyToSelectSvg from '../../../../../../assets/image/icon-ready-to-select.svg'
import * as RNLocalize from 'react-native-localize'
import DistributionPointTile from './DistributionPointTile'
import { useDistributionPoints } from '../../../../hooks/LeadHooks'
import { judgeLeadEditable } from '../../../../helper/rep/CommonHelper'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { PAYMENT_METHOD_PICKER_VALUE } from '../../common/PickerValue'

const styles = StyleSheet.create({
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginBottom: 20
    },
    marginBottom_5: {
        marginBottom: 5
    },
    distributionSize: {
        height: 36,
        width: 30
    },
    leftBox: {
        width: 20,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    rightBox: {
        width: 3,
        height: 20,
        backgroundColor: '#00A2D9',
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    distributionPointText: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    timeColContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        height: 20
    },
    with_20_percent: {
        width: '20%'
    },
    with_10_percent: {
        width: '10%'
    },
    renderTimeContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        height: 20
    },
    operationRowContainer: {
        flexDirection: 'row',
        marginTop: 10,
        width: '100%',
        justifyContent: 'space-around'
    },
    with_30_percent: {
        width: '30%'
    },
    timeContainer: {
        flexDirection: 'row',
        width: '70%',
        justifyContent: 'flex-end'
    },
    with_48_percent: {
        width: '48%'
    },
    with_90_percent: {
        width: '90%'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    opeHoursContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    needCallTextStyle: {
        color: 'grey',
        marginBottom: 20,
        fontSize: 12.5
    },
    operationHoursModal: {
        alignItems: 'flex-end',
        width: '50%'
    },
    editTextStyle: {
        fontWeight: '700',
        color: '#0098D4'
    },
    dateTimePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    pickerLabelText: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    distributorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    distributorOptionsContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    distriTextContainer: {
        paddingHorizontal: 30,
        paddingVertical: 20
    },
    distriText: {
        fontSize: 18,
        fontWeight: '300'
    }
})

const timezone = RNLocalize.getTimeZone()
moment.tz.setDefault(timezone)

interface DeliveryExecutionProps extends LeadDetailBaseProps {
    onSaveDistributionPoint: any
}

const negotiateLeadEditReducer = (store) => store.leadReducer.negotiateLeadEditReducer

export const distributionPointBtn = (setShowDistributionPointModal, msg?) => {
    return (
        <TouchableOpacity
            onPress={() => {
                setShowDistributionPointModal(true)
            }}
            style={styles.marginBottom_5}
        >
            <View style={commonStyle.flexRowAlignCenter}>
                <View style={styles.distributionSize}>
                    <View style={styles.leftBox} />
                    <View style={styles.rightBox} />
                </View>
                <CText style={styles.distributionPointText}>
                    {msg || `${t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINT} *`}
                </CText>
            </View>
        </TouchableOpacity>
    )
}

const DeliveryExecution: FC<DeliveryExecutionProps> = (props: DeliveryExecutionProps) => {
    const { l, cRef, onSaveDistributionPoint, saveTimes } = props
    const negotiateLead = useSelector(negotiateLeadEditReducer)
    const DISTRIBUTOR_OPTIONS = ['Sysco', 'US Foods', 'PFG']
    const [showOperationHoursModal, setShowOperationHoursModal] = useState(false)
    const [showDistributionPointModal, setShowDistributionPointModal] = useState(false)
    const [refreshCount, setRefreshCount] = useState(0)
    const distributionLst = useDistributionPoints(l.ExternalId, showDistributionPointModal, refreshCount, saveTimes)
    const dispatch = useDispatch()
    const paymentMethodRef = useRef(null)
    const distributorInputRef = useRef(null)
    const [showDistributorPick, setShowDistributorPick] = useState(false)
    const resetData = () => {
        const originData = {
            Billing_Address_City_c__c: l.Billing_Address_City_c__c,
            Billing_Address_Country_c__c: l.Billing_Address_Country_c__c,
            Billing_Address_Same_as_Shipping_c__c: l.Billing_Address_Same_as_Shipping_c__c,
            Billing_Address_State_c__c: l.Billing_Address_State_c__c,
            Billing_Address_Street_c__c: l.Billing_Address_Street_c__c,
            Billing_Address_Zip_c__c: l.Billing_Address_Zip_c__c,
            CMB_Notes_c__c: l.CMB_Notes_c__c,
            Current_Distributor_c__c: l.Current_Distributor_c__c,
            Days_Open_c__c: l.Days_Open_c__c,
            Friday_End_Hours_of_Operation_c__c: l.Friday_End_Hours_of_Operation_c__c,
            Friday_Start_Hours_of_Operation_c__c: l.Friday_Start_Hours_of_Operation_c__c,
            Monday_End_Hours_of_Operation_c__c: l.Monday_End_Hours_of_Operation_c__c,
            Monday_Start_Hours_of_Operation_c__c: l.Monday_Start_Hours_of_Operation_c__c,
            Payment_Method_c__c: l.Payment_Method_c__c,
            Saturday_End_Hours_of_Operation_c__c: l.Sunday_End_Hours_of_Operation_c__c,
            Saturday_Start_Hours_of_Operation_c__c: l.Saturday_Start_Hours_of_Operation_c__c,
            Seasonal_Close_End_Date_c__c: l.Seasonal_Close_End_Date_c__c,
            Seasonal_Close_Start_Date_c__c: l.Seasonal_Close_Start_Date_c__c,
            Sunday_End_Hours_of_Operation_c__c: l.Sunday_End_Hours_of_Operation_c__c,
            Sunday_Start_Hours_of_Operation_c__c: l.Sunday_Start_Hours_of_Operation_c__c,
            Thursday_End_Hours_of_Operation_c__c: l.Thursday_End_Hours_of_Operation_c__c,
            Thursday_Start_Hours_of_Operation_c__c: l.Thursday_Start_Hours_of_Operation_c__c,
            Tuesday_End_Hours_of_Operation_c__c: l.Tuesday_End_Hours_of_Operation_c__c,
            Tuesday_Start_Hours_of_Operation_c__c: l.Tuesday_Start_Hours_of_Operation_c__c,
            Wednesday_End_Hours_of_Operation_c__c: l.Wednesday_End_Hours_of_Operation_c__c,
            Wednesday_Start_Hours_of_Operation_c__c: l.Wednesday_Start_Hours_of_Operation_c__c,
            deliveryExecutionEditCount: 0
        }
        dispatch(updateTempLeadAction(originData))
        // addressInfoRef.current.reset()
        paymentMethodRef.current.reset()
    }

    const refreshDistributionPoint = () => {
        if (onSaveDistributionPoint) {
            onSaveDistributionPoint()
        }
        setRefreshCount(refreshCount + 1)
    }

    const renderTimeCol = (formattedStartDate, formattedEndDate) => {
        return (
            <View style={styles.timeColContainer}>
                <CText style={styles.with_20_percent}>{formattedStartDate.slice(0, 5)}</CText>
                <CText style={styles.with_10_percent}>{formattedStartDate.slice(-2)}</CText>
                <CText> - </CText>
                <CText style={styles.with_20_percent}>{formattedEndDate.slice(0, 5)}</CText>
                <CText style={styles.with_10_percent}>{formattedEndDate.slice(-2)}</CText>
            </View>
        )
    }

    const renderTime = (formattedStartDate, formattedEndDate, day) => {
        if (l.Days_Open_c__c && l.Status__c === 'Open' && l.Days_Open_c__c.indexOf(day) !== -1) {
            return renderTimeCol(formattedStartDate, formattedEndDate)
        }
        if (
            negotiateLead.Days_Open_c__c &&
            l.Status__c === 'Negotiate' &&
            negotiateLead.Days_Open_c__c.indexOf(day) !== -1
        ) {
            return renderTimeCol(formattedStartDate, formattedEndDate)
        }
        return (
            <View style={styles.renderTimeContainer}>
                <CText>{t.labels.PBNA_MOBILE_CLOSED}</CText>
            </View>
        )
    }
    const renderOperationRow = (day: string, startDate, endDate) => {
        const formattedStartDate = moment(
            moment(new Date()).format(TIME_FORMAT.Y_MM_DD) +
                (startDate !== null ? 'T' + startDate + 'Z' : '').split('.')[0]
        ).format('h:mm A')
        const formattedEndDate = moment(
            moment(new Date()).format(TIME_FORMAT.Y_MM_DD) + (endDate !== null ? 'T' + endDate + 'Z' : '').split('.')[0]
        ).format('h:mm A')
        return (
            <View style={styles.operationRowContainer}>
                <View style={styles.with_30_percent}>
                    <CText>{day}</CText>
                </View>
                <View style={styles.timeContainer}>{renderTime(formattedStartDate, formattedEndDate, day)}</View>
            </View>
        )
    }

    const renderOperationSection = (leadDetail) => {
        return (
            <View style={commonStyle.fullWidth}>
                {renderOperationRow(
                    'Sunday',
                    leadDetail.Sunday_Start_Hours_of_Operation_c__c,
                    leadDetail.Sunday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Monday',
                    leadDetail.Monday_Start_Hours_of_Operation_c__c,
                    leadDetail.Monday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Tuesday',
                    leadDetail.Tuesday_Start_Hours_of_Operation_c__c,
                    leadDetail.Tuesday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Wednesday',
                    leadDetail.Wednesday_Start_Hours_of_Operation_c__c,
                    leadDetail.Wednesday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Thursday',
                    leadDetail.Thursday_Start_Hours_of_Operation_c__c,
                    leadDetail.Thursday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Friday',
                    leadDetail.Friday_Start_Hours_of_Operation_c__c,
                    leadDetail.Friday_End_Hours_of_Operation_c__c
                )}
                {renderOperationRow(
                    'Saturday',
                    leadDetail.Saturday_Start_Hours_of_Operation_c__c,
                    leadDetail.Saturday_End_Hours_of_Operation_c__c
                )}
            </View>
        )
    }

    useImperativeHandle(cRef, () => ({
        resetData
    }))
    return (
        <BaseSection>
            <View style={commonStyle.fullWidth}>
                {(judgeLeadEditable(l) || isPersonaCRMBusinessAdmin()) && (
                    <View style={commonStyle.marginBottom_15}>
                        {l.Billing_Address_Same_as_Shipping_c__c === '0' && (
                            <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                                <View style={commonStyle.halfWidth}>
                                    <View>
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_BILLING_STREET}
                                            fieldValue={l.Billing_Address_Street_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_BILLING_CITY}
                                            fieldValue={l.Billing_Address_City_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_BILLING_STATE}
                                            fieldValue={l.Billing_Address_State_c__c}
                                        />
                                    </View>
                                </View>
                                <View style={[commonStyle.marginBottom_15, commonStyle.halfWidth]}>
                                    <View>
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_BILLING_ZIP_POSTAL_CODE}
                                            fieldValue={l.Billing_Address_Zip_c__c}
                                        />
                                        <LeadFieldTile
                                            fieldName={t.labels.PBNA_MOBILE_BILLING_COUNTRY}
                                            fieldValue={l.Billing_Address_Country_c__c}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
                        <View style={commonStyle.marginBottom_15}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CURRENT_DISTRIBUTOR}
                                fieldValue={l.Current_Distributor_c__c}
                            />
                        </View>
                        {distributionLst.map((item) => {
                            return (
                                <DistributionPointTile
                                    key={item.CTRSoupEntryId}
                                    dpData={item}
                                    refresh={refreshDistributionPoint}
                                    showEdit={false}
                                    l={l}
                                    type={'Lead'}
                                />
                            )
                        })}
                        {l.Days_Open_c__c !== null && (
                            <View style={styles.opeHoursContainer}>
                                <View style={commonStyle.halfWidth}>
                                    <CText style={styles.fontWeight_700}>
                                        {t.labels.PBNA_MOBILE_HOURS_OF_OPERATION}
                                    </CText>
                                </View>
                            </View>
                        )}
                        {l.Days_Open_c__c !== null && renderOperationSection(l)}
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_START_DATE}
                                    fieldValue={l.Seasonal_Close_Start_Date_c__c}
                                />
                            </View>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_END_DATE}
                                    fieldValue={l.Seasonal_Close_End_Date_c__c}
                                />
                            </View>
                        </View>
                        <LeadFieldTile
                            fieldName={`${t.labels.PBNA_MOBILE_PAYMENT_METHOD} *`}
                            fieldValue={l.Payment_Method_c__c}
                        />
                        <View style={styles.with_90_percent}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CUSTOMER_SETUP_NOTES}
                                fieldValue={l.CMB_Notes_c__c}
                            />
                        </View>
                    </View>
                )}
                {l.Status__c === LeadStatus.NEGOTIATE &&
                    l.COF_Triggered_c__c !== '1' &&
                    !isPersonaCRMBusinessAdmin() && (
                        <View style={commonStyle.marginBottom_15}>
                            <View style={[commonStyle.flexRowSpaceCenter, commonStyle.fullWidth]}>
                                <View style={styles.with_90_percent}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_CURRENT_DISTRIBUTOR}
                                        fieldApiName={'Current_Distributor_c__c'}
                                        section={LeadDetailSection.DELIVERY_EXECUTION}
                                        cRef={distributorInputRef}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowDistributorPick(true)
                                    }}
                                >
                                    <ReadyToSelectSvg />
                                </TouchableOpacity>
                            </View>
                            {distributionLst.map((item, index) => {
                                return (
                                    <DistributionPointTile
                                        key={item.CTRSoupEntryId}
                                        dpData={item}
                                        count={index + 1}
                                        refresh={refreshDistributionPoint}
                                        showEdit={item.SLS_MTHD_NM__c !== 'FSV'}
                                        l={l}
                                        type={'Lead'}
                                    />
                                )
                            })}

                            {!(
                                l.Lead_Type_c__c === 'Repair Only' &&
                                l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService' &&
                                distributionLst.find((dp) => {
                                    return dp.SLS_MTHD_NM__c === 'Food Service Calls'
                                }) !== undefined
                            ) && distributionPointBtn(setShowDistributionPointModal)}

                            {l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService' &&
                                (distributionLst.length === 0 ||
                                    distributionLst.find((dp) => {
                                        return dp.SLS_MTHD_NM__c === 'Food Service Calls'
                                    }) === undefined) && (
                                    <CText style={styles.needCallTextStyle}>
                                        {t.labels.PBNA_MOBILE_THIS_LEAD_REQUIRES_A_FOOD_SERVICE_CALL_DISTRIBUTION_POINT}
                                    </CText>
                                )}
                            <View style={styles.opeHoursContainer}>
                                <View style={commonStyle.halfWidth}>
                                    <CText style={styles.fontWeight_700}>
                                        {t.labels.PBNA_MOBILE_HOURS_OF_OPERATION}
                                    </CText>
                                </View>
                                {l.Status__c === 'Negotiate' && (
                                    <View style={styles.operationHoursModal}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowOperationHoursModal(true)
                                            }}
                                        >
                                            <CText style={styles.editTextStyle}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {negotiateLead.Days_Open_c__c !== null && renderOperationSection(negotiateLead)}
                            <View style={styles.dateTimePickerContainer}>
                                <View style={styles.with_48_percent}>
                                    <LeadDateTimePicker
                                        fieldLabel={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_START_DATE}
                                        fieldApiName={'Seasonal_Close_Start_Date_c__c'}
                                        section={LeadDetailSection.DELIVERY_EXECUTION}
                                    />
                                </View>
                                <View style={styles.with_48_percent}>
                                    <LeadDateTimePicker
                                        fieldLabel={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_END_DATE}
                                        fieldApiName={'Seasonal_Close_End_Date_c__c'}
                                        section={LeadDetailSection.DELIVERY_EXECUTION}
                                    />
                                </View>
                            </View>
                            <PickerTile
                                data={PAYMENT_METHOD_PICKER_VALUE}
                                label={`${t.labels.PBNA_MOBILE_PAYMENT_METHOD} *`}
                                labelStyle={styles.pickerLabelText}
                                title={t.labels.PBNA_MOBILE_PAYMENT_METHOD}
                                disabled={false}
                                defValue={l.Payment_Method_c__c}
                                placeholder={t.labels.PBNA_MOBILE_SELECT}
                                required
                                noPaddingHorizontal
                                onChange={(v) => {
                                    dispatch(
                                        updateTempLeadAction(
                                            { Payment_Method_c__c: v },
                                            LeadDetailSection.DELIVERY_EXECUTION
                                        )
                                    )
                                }}
                                cRef={paymentMethodRef}
                            />
                            <LeadInput
                                fieldName={t.labels.PBNA_MOBILE_CUSTOMER_SETUP_NOTES}
                                fieldApiName={'CMB_Notes_c__c'}
                                multiline
                                section={LeadDetailSection.DELIVERY_EXECUTION}
                            />

                            {/* <LeadInput fieldName={t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT} fieldApiName={'Proposed_Key_Account_c__c'}
                            multiline section={LeadDetailSection.DELIVERY_EXECUTION}
                        />
                        <LeadInput fieldName={t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT_DIVISION}
                            fieldApiName={'Proposed_Key_Account_Division_c__c'} multiline
                            section={LeadDetailSection.DELIVERY_EXECUTION}
                        /> */}
                            <OperationHoursModal
                                showOperationHoursModal={showOperationHoursModal}
                                setShowOperationHoursModal={setShowOperationHoursModal}
                            />
                            <Modal
                                animationType="fade"
                                transparent
                                visible={showDistributorPick}
                                onRequestClose={() => {
                                    setShowDistributorPick(!showDistributorPick)
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.distributorContainer}
                                    onPress={() => {
                                        setShowDistributorPick(!showDistributorPick)
                                    }}
                                >
                                    <View style={styles.distributorOptionsContainer}>
                                        {DISTRIBUTOR_OPTIONS.map((v) => {
                                            return (
                                                <TouchableOpacity
                                                    key={v}
                                                    onPress={() => {
                                                        distributorInputRef.current.setValue(v)
                                                        setShowDistributorPick(false)
                                                    }}
                                                    style={styles.distriTextContainer}
                                                >
                                                    <CText style={styles.distriText}>{v}</CText>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        </View>
                    )}
                <DistributionPointModal
                    refresh={refreshDistributionPoint}
                    leadExternalId={l.ExternalId}
                    l={l}
                    isEdit={false}
                    showDistributionPointModal={showDistributionPointModal}
                    setShowDistributionPointModal={setShowDistributionPointModal}
                    refreshCount={refreshCount}
                    saveTimes={saveTimes}
                    type={'Lead'}
                />
            </View>
        </BaseSection>
    )
}

export default DeliveryExecution
