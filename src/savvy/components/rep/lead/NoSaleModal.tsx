/**
 * @description Component to let the user move a lead to no sale status.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { DeviceEventEmitter, StyleSheet, View } from 'react-native'
import CText from '../../../../common/components/CText'
import TitleModal from '../../../../common/components/TitleModal'
import LeadInput from './common/LeadInput'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import LeadDateTimePicker from './common/LeadDateTimePicker'
import { LeadStatus } from '../../../enums/Lead'
import _ from 'lodash'
import { syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import * as RNLocalize from 'react-native-localize'
import moment from 'moment'
import { DeviceEvent } from '../../../enums/DeviceEvent'
import { filterExistFields } from '../../../utils/SyncUtils'
import { updateRelatedTask, queryComment } from '../../../utils/LeadUtils'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import PickerTile from './common/PickerTile'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface NoSaleModalProps {
    cRef: any
    leadDetail: any
    onSave: any
}

const timezone = RNLocalize.getTimeZone()
moment.tz.setDefault(timezone)
const styles = StyleSheet.create({
    textStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    pickerTileTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 30,
        marginBottom: 20
    },
    pickerTileContainer: {
        width: '100%',
        paddingHorizontal: '5%',
        height: 625
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    }
})
const NoSaleModal: FC<NoSaleModalProps> = (props: NoSaleModalProps) => {
    const { cRef, leadDetail, onSave } = props

    const initReason = {
        unqualifiedForBusiness: false,
        businessClosed: false,
        prospectLost: false,
        duplicateCustomerFound: false,
        deferred: false,
        corporateDecision: false
    }
    const reasonMap = {
        [t.labels.PBNA_MOBILE_UNQUALIFIED_FOR_BUSINESS]: 'unqualifiedForBusiness',
        [t.labels.PBNA_MOBILE_BUSINESS_CLOSED]: 'businessClosed',
        [t.labels.PBNA_MOBILE_PROSPECT_LOST]: 'prospectLost',
        [t.labels.PBNA_MOBILE_DUPLICATE_CUSTOMER_FOUND]: 'duplicateCustomerFound',
        [t.labels.PBNA_MOBILE_DEFERRED]: 'deferred',
        [t.labels.PBNA_MOBILE_CORPORATE_DECISION]: 'corporateDecision'
    }

    const initReasonLabel = [
        `-- ${t.labels.PBNA_MOBILE_SELECT_REASON.toUpperCase()} --`,
        t.labels.PBNA_MOBILE_UNQUALIFIED_FOR_BUSINESS,
        t.labels.PBNA_MOBILE_BUSINESS_CLOSED,
        t.labels.PBNA_MOBILE_PROSPECT_LOST,
        t.labels.PBNA_MOBILE_DUPLICATE_CUSTOMER_FOUND,
        t.labels.PBNA_MOBILE_DEFERRED,
        t.labels.PBNA_MOBILE_CORPORATE_DECISION
    ]

    const noSaleModalRef = useRef(null)
    const [radioGroup, setRadioGroup] = useState(initReason)
    const [cofNumber, setCofNumber] = useState('')
    const [comments, setComments] = useState('')
    const [deferredDate, setDeferredDate] = useState(null)
    const [disableSave, setDisableSave] = useState(true)
    const [originComment, setOriginComment] = useState('')
    const pickModalRef = useRef(null)
    useImperativeHandle(cRef, () => ({
        closeModal: () => {
            noSaleModalRef.current?.closeModal()
        },
        openModal: () => {
            noSaleModalRef.current?.openModal()
        }
    }))
    const calDisableSave = () => {
        return !(
            radioGroup.deferred ||
            radioGroup.unqualifiedForBusiness ||
            radioGroup.businessClosed ||
            radioGroup.prospectLost ||
            radioGroup.duplicateCustomerFound ||
            radioGroup.corporateDecision
        )
    }

    useEffect(() => {
        setDisableSave(calDisableSave())
        queryComment(leadDetail.Id, setOriginComment)
    }, [radioGroup, cofNumber, deferredDate])

    const updateDeferredDate = (leadToUpdate) => {
        leadToUpdate.Deferred_Resume_Date_c__c = deferredDate || moment().add(1, 'y').format(TIME_FORMAT.Y_MM_DD)
    }
    const handlePressSave = async () => {
        noSaleModalRef.current?.closeModal()
        global.$globalModal.openModal()
        const leadToUpdate = _.cloneDeep(leadDetail)
        leadToUpdate.Status__c = LeadStatus.NO_SALE
        const separator = comments && originComment ? ' / ' : ''
        leadToUpdate.Additional_Prospect_Comments_c__c =
            comments || originComment ? 'No Sale Comments: ' + comments + separator + originComment : ''
        leadToUpdate.Move_To_No_Sale_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        let subStatus = null
        _.forEach(radioGroup, (v, k) => {
            if (v) {
                subStatus = k
            }
        })
        switch (subStatus) {
            case 'unqualifiedForBusiness':
                leadToUpdate.Lead_Sub_Status_c__c = 'Unqualified for Business'
                break
            case 'businessClosed':
                leadToUpdate.Lead_Sub_Status_c__c = 'Business Closed'
                break
            case 'prospectLost':
                leadToUpdate.Lead_Sub_Status_c__c = 'Prospect Lost'
                updateDeferredDate(leadToUpdate)
                break
            case 'duplicateCustomerFound':
                leadToUpdate.Lead_Sub_Status_c__c = 'Duplicate Customer Found'
                leadToUpdate.DUP_COF_c__c = cofNumber
                break
            case 'deferred':
                leadToUpdate.Lead_Sub_Status_c__c = 'Deferred'
                updateDeferredDate(leadToUpdate)
                break
            case 'corporateDecision':
                leadToUpdate.Lead_Sub_Status_c__c = 'Corporate Decision'
                break
            default:
                break
        }
        try {
            const leadSyncUpFields = [
                'Id',
                'Status__c',
                'Lead_Sub_Status_c__c',
                'Deferred_Resume_Date_c__c',
                'DUP_COF_c__c',
                'Move_To_No_Sale_Date_c__c',
                'Additional_Prospect_Comments_c__c'
            ]
            await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
            await updateRelatedTask(leadToUpdate.ExternalId, true)
            DeviceEventEmitter.emit(DeviceEvent.REFRESH_OPEN_LEAD_LIST)
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type={'success'}>
                    <CText numberOfLines={3} style={styles.textStyle}>
                        {t.labels.PBNA_MOBILE_LEAD_STATUS_HAS_BEEN_SUCCESSFULLY_UPDATED_TO_NO_SALE}
                    </CText>
                </ProcessDoneModal>
            )
            setTimeout(() => {
                onSave && onSave()
            }, 500)
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 3000)
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'handlePressSave', 'move to no sale: ' + ErrorUtils.error2String(e))
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <ProcessDoneModal type={'failed'}>
                    <CText numberOfLines={3} style={styles.textStyle}>
                        {t.labels.PBNA_MOBILE_MOVE_TO_NO_SALE_FAILED}
                    </CText>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }

    const onSelectChange = (v) => {
        const currentLabel = reasonMap[v]
        setRadioGroup({
            ...initReason,
            [currentLabel]: true
        })
    }
    return (
        <TitleModal title={t.labels.PBNA_MOBILE_CHANGE_STATUS_TO_NO_SALE} cRef={noSaleModalRef}>
            <CText style={styles.pickerTileTitle}>{t.labels.PBNA_MOBILE_PLEASE_SELECT_A_REASON}</CText>

            <View style={styles.pickerTileContainer}>
                <PickerTile
                    cRef={pickModalRef}
                    data={initReasonLabel}
                    label={t.labels.PBNA_MOBILE_PLEASE_SELECT_A_REASON}
                    labelStyle={styles.labelStyle}
                    disabled={false}
                    defValue={''}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    noPaddingHorizontal
                    onChange={(v: any) => {
                        onSelectChange(v)
                    }}
                    required
                    title={''}
                    containerStyle={{ marginBottom: 15 }}
                />

                {radioGroup.duplicateCustomerFound && (
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_ENTER_COF}
                        onChangeText={(v: any) => {
                            setCofNumber(v)
                        }}
                        initValue={cofNumber}
                        noMargin
                    />
                )}

                {(radioGroup.deferred || radioGroup.prospectLost) && (
                    <LeadDateTimePicker
                        fieldLabel={t.labels.PBNA_MOBILE_DATE_FOR_RE_ENGAGEMENT}
                        onChange={(v) => {
                            setDeferredDate(moment(v).format(TIME_FORMAT.Y_MM_DD))
                        }}
                    />
                )}

                {
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_NO_SALE_COMMENTS}
                        onChangeText={(v: any) => {
                            setComments(v)
                        }}
                        multiline
                        initValue={comments}
                        noMargin
                        labelStyle={radioGroup.duplicateCustomerFound ? { marginTop: -20 } : {}}
                    />
                }
            </View>

            <FormBottomButton
                onPressCancel={() => {
                    setRadioGroup({
                        unqualifiedForBusiness: false,
                        businessClosed: false,
                        prospectLost: false,
                        duplicateCustomerFound: false,
                        deferred: false,
                        corporateDecision: false
                    })
                    setCofNumber('')
                    setComments('')
                    setDeferredDate(null)
                    pickModalRef?.current?.resetNull()
                    noSaleModalRef.current?.closeModal()
                }}
                onPressSave={handlePressSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                disableSave={disableSave}
            />
        </TitleModal>
    )
}

export default NoSaleModal
