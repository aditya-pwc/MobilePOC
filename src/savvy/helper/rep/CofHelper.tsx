/*
 * @Description:
 * @LastEditors: Yi Li
 */
import { View, StyleSheet, Alert, Image } from 'react-native'
import LeadFieldTile from '../../components/rep/lead/common/LeadFieldTile'
import moment from 'moment'
import React from 'react'
import { t } from '../../../common/i18n/t'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { getRecordTypeId } from '../../utils/CommonUtils'
import { syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../api/SyncUtils'
import { filterExistFields } from '../../utils/SyncUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { checkLeadContacts, checkLeadDPs } from '../../utils/LeadUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import CText from '../../../common/components/CText'
import ProcessDoneModal from '../../components/common/ProcessDoneModal'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
const styles = StyleSheet.create({
    contView: {
        flexDirection: 'row',
        width: '100%'
    },
    width50: {
        width: '50%'
    },
    iconSuccessStyle: {
        width: 60,
        height: 57,
        marginBottom: 20
    },
    noLeadFailedText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    }
})
export const renderBaseReqInfo = (activity) => {
    return (
        <View style={styles.contView}>
            <View style={styles.width50}>
                <LeadFieldTile
                    fieldName={t.labels.PBNA_MOBILE_DATE_REQUESTED}
                    fieldValue={moment(activity.COF_Requested_Date__c).format('MMM D, YYYY')}
                />
            </View>
            <View style={styles.width50}>
                <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_REQUESTED_BY} fieldValue={activity['Owner.Name']} />
            </View>
        </View>
    )
}

export const requestCof = async (leadDetail: any, setLeadDetail: any, setSaveTimes: any) => {
    Alert.alert(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER, t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_MSG, [
        {
            text: t.labels.PBNA_MOBILE_CANCEL,
            style: 'cancel'
        },
        {
            text: t.labels.PBNA_MOBILE_PROCEED,
            onPress: async () => {
                global.$globalModal.openModal()
                try {
                    const leadToUpdate = { ...leadDetail }
                    leadToUpdate.COF_Triggered_c__c = '1'
                    leadToUpdate.COF_Rejected_c__c = '0'
                    leadToUpdate.Send_for_COF_c__c = '1'
                    leadToUpdate.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
                    leadToUpdate.Customer_Submitted_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
                    const taskRecordTypeId = await getRecordTypeId('Lead Activity', 'Task')
                    const newTask = {
                        Subject: 'Customer Requested',
                        Type: 'Customer Requested',
                        COF_Requested_Date__c: new Date().toISOString(),
                        RecordTypeId: taskRecordTypeId,
                        Lead__c: leadDetail.ExternalId,
                        Status: 'Complete'
                    }
                    const leadSyncUpFields = [
                        'Id',
                        'Last_Task_Modified_Date_c__c',
                        'COF_Triggered_c__c',
                        'COF_Rejected_c__c',
                        'Send_for_COF_c__c',
                        'Customer_Submitted_Date_c__c'
                    ]
                    await Promise.all([
                        syncUpObjUpdateFromMem(
                            'Lead__x',
                            filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields)
                        ),
                        syncUpObjCreateFromMem('Task', [newTask])
                    ])
                    setLeadDetail({
                        ...leadDetail,
                        COF_Triggered_c__c: '1'
                    })
                    global.$globalModal.closeModal()
                    global.$globalModal.openModal(
                        <View style={commonStyle.alignItemsCenter}>
                            <Image style={styles.iconSuccessStyle} source={ImageSrc.ICON_SUCCESS} />
                            <CText style={styles.noLeadFailedText}>
                                {t.labels.PBNA_MOBILE_SUCCESSFULLY_REQUESTED_FOR_CUSTOMER_MSG}
                            </CText>
                        </View>
                    )
                    setTimeout(() => {
                        setSaveTimes((prevSaveTimes: number) => prevSaveTimes + 1)
                        global.$globalModal.closeModal()
                    }, 3000)
                } catch (err) {
                    global.$globalModal.openModal(
                        <ProcessDoneModal type={'failed'}>
                            <CText numberOfLines={3} style={styles.noLeadFailedText}>
                                {t.labels.PBNA_MOBILE_REQUEST_COF_FAILED}
                            </CText>
                        </ProcessDoneModal>,
                        t.labels.PBNA_MOBILE_OK
                    )
                    storeClassLog(Log.MOBILE_ERROR, 'requestCof', 'request cof: ' + ErrorUtils.error2String(err))
                }
            }
        }
    ])
}

export const onSubmitForCustomer = async (
    leadDetail: any,
    setLeadDetail: any,
    saveTimes: number,
    setSaveTimes: any,
    cofCheckObj: any,
    tooltipRef?: any
) => {
    tooltipRef && tooltipRef.current.toggleTooltip()
    const messages = []
    if (!leadDetail?.ExternalId) {
        return
    }
    if (!cofCheckObj.isAddressCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_ADDRESS)
    }
    if (!cofCheckObj.isLocationCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_LOCATION)
    }
    if (!cofCheckObj.isSubSegmentCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_SUBSEGMENT)
    }
    if (!cofCheckObj.isPaymentMethodCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_PAYMENT)
    }
    if (!cofCheckObj.isSeasonalDateCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_SEASONAL_DATE)
    }
    const isContactsCorrect = await checkLeadContacts(leadDetail)
    const { hasFoodServiceCallsDP, hasSellingDP, hasBcDP } = await checkLeadDPs(leadDetail)
    if (!isContactsCorrect) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_CONTACT)
    }
    if (leadDetail.Lead_Type_c__c === 'Repair Only') {
        if (!hasFoodServiceCallsDP) {
            messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_FSC_DP)
        }
    } else {
        if (leadDetail.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService') {
            if (!hasFoodServiceCallsDP && !hasSellingDP) {
                messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_ALL_DP)
            } else if (!hasFoodServiceCallsDP) {
                messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_FSC_DP)
            } else if (!hasSellingDP) {
                messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_SELLING_DP)
            }
        } else {
            if (!hasSellingDP) {
                messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_SELLING_DP)
            }
        }
    }
    if (!hasBcDP) {
        messages.push(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_BC_DP)
    }
    if (messages.length > 0) {
        Alert.alert(t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER_REQUIRED_TITLE, messages.join(', '), [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'cancel'
            }
        ])
    } else {
        await requestCof(leadDetail, setLeadDetail, setSaveTimes)
    }
}
