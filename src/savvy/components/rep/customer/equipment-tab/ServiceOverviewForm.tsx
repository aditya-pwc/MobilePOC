/**
 * @description Overview for equipment request
 * @author  Kiren Cao
 * @date 2021-12-9
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import PickerTile from '../../lead/common/PickerTile'
import LeadInput from '../../lead/common/LeadInput'
import moment from 'moment'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import { Input } from 'react-native-elements'
import { useContacts } from '../../../../hooks/LeadHooks'
import ContactForm from '../../lead/ContactForm'
import ServiceRequestDateTimePicker from './ServiceRequestDateTimePicker'
import { useServiceRequestMovePurposePicklist } from '../../../../hooks/EquipmentServiceInstallRequestHooks'
import CustomerDateTimePicker from './CustomerDateTimePicker'
import LeadFieldTile from '../../lead/common/LeadFieldTile'
import { t } from '../../../../../common/i18n/t'
import { useRequestContact } from '../../../../hooks/EquipmentHooks'
import CreatablePickList from './CreatablePickList'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { equipmentFormStyle } from './InstallOverviewForm'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface ServiceOverviewFormProps {
    setOverView: any
    accountId: any
    overview: any
    serviceType
    troublePickList
    troublePickListMapping
    readonly: boolean
}

const styles = StyleSheet.create({
    ...equipmentFormStyle,
    marginTop_44: {
        marginTop: 44
    },
    marginTop_20: {
        marginTop: 20
    },
    timePicker: {
        width: '60%',
        marginLeft: 20
    }
})
const EXTRA_HEIGHT = 60
const ServiceOverviewForm: FC<ServiceOverviewFormProps> = (props: ServiceOverviewFormProps) => {
    const { accountId, setOverView, overview, serviceType, troublePickList, troublePickListMapping, readonly } = props
    const contactRef = useRef(null)
    const installDateRef = useRef(null)
    const movePurposeRef = useRef(null)
    const troubleTypeRef = useRef(null)
    const noteRef = useRef(null)
    const fromTimeRef = useRef(null)
    const toTimeRef = useRef(null)
    const [saveTimes, setSaveTimes] = useState(0)
    const { movePurposePicklist, movePurposeMapping } = useServiceRequestMovePurposePicklist(serviceType)
    const contactCreationFormRef = useRef(null)
    const handlePressAddContact = () => {
        contactCreationFormRef.current.open()
    }

    const showFailureStatus = () => {
        return (
            (overview.cets_ord_stat_cde__c === 'RJT' || overview.cets_ord_stat_cde__c === 'INV') &&
            _.capitalize(overview.status__c) === 'Failed' &&
            overview.request_subtype__c === 'Service Request' &&
            overview.equip_move_type_cde__c === 'Repair'
        )
    }

    const getMovePurposeDescriptionByCode = () => {
        let movePurposeDescription = ''
        if (overview) {
            for (const key in movePurposeMapping) {
                if (movePurposeMapping[key] === overview.move_purpose_cde__c) {
                    movePurposeDescription = key
                    break
                }
            }
        }
        return movePurposeDescription
    }

    const getTroubleDescriptionByCode = () => {
        let troubleDescription = ''
        if (overview) {
            for (const key in troublePickListMapping) {
                if (troublePickListMapping[key] === overview.trbl_type_cde__c) {
                    troubleDescription = key
                    break
                }
            }
        }
        return troubleDescription
    }

    const getRepairConfirmationNum = () => {
        const orderId = overview?.order_id__c || ''
        const orderLneNum = overview?.cets_ord_lne_num__c || ''
        const shortBar = !_.isEmpty(overview?.order_id__c) && !_.isEmpty(overview?.cets_ord_lne_num__c) ? '-' : ''
        return `${orderId}${shortBar}${orderLneNum}`
    }

    const setValue = (v) => {
        contactRef.current?.setValue(v.caller_name__c)
        installDateRef.current?.setValue(v.move_request_date__c)
        let movePurposeDescription = ''
        for (const key in movePurposeMapping) {
            if (movePurposeMapping[key] === v.move_purpose_cde__c) {
                movePurposeDescription = key
                break
            }
        }
        movePurposeRef.current?.setValue(movePurposeDescription)
        v.comments__c && noteRef.current?.setValue(v.comments__c)
        v.wndw_beg_tme__c &&
            fromTimeRef.current?.setValue(
                `${moment().utc(true).format('YYYY-MM-DD')}T${v.wndw_beg_tme__c}`.slice(0, -1)
            )
        v.wndw_end_tme__c &&
            toTimeRef.current?.setValue(`${moment().utc(true).format('YYYY-MM-DD')}T${v.wndw_end_tme__c}`.slice(0, -1))
    }

    useEffect(() => {
        if (overview.Id && movePurposeMapping !== {}) {
            setValue(overview)
        }
    }, [overview.Id, movePurposeMapping])

    const contactList = useContacts('RetailStore', accountId, saveTimes)
    const requestContact = useRequestContact(accountId, overview.caller_name__c, 'RetailStore')
    const setContact = (value) => {
        const temp = _.cloneDeep(overview)
        temp.Phone = value.Phone
        temp.Email = value.Email
        temp.Title = value.Title
        temp.caller_name__c = `${value.FirstName} ${value.LastName}`
        temp.caller_phone_num__c = value.Phone
        temp.email_addr_txt__c = value.Email
        setSaveTimes(saveTimes + 1)
        setOverView(temp)
        contactRef.current?.setValue(temp.caller_name__c)
    }
    const renderForm = () => {
        return (
            <View>
                <ContactForm
                    cRef={contactCreationFormRef}
                    accountId={accountId}
                    onIngestFinished={setContact}
                    contactType={'RetailStore'}
                />
            </View>
        )
    }
    const picklistBottom = () => {
        return (
            <View>
                <View style={commonStyle.flexRowAlignCenter}>
                    <View style={styles.pickListContainer}>
                        <View style={styles.pickIconStyle} />
                        <View style={styles.pickIconStyle2} />
                    </View>
                    <CText style={styles.addText}>{t.labels.PBNA_MOBILE_ADD_NEW_CONTACT.toUpperCase()}</CText>
                </View>
            </View>
        )
    }

    return (
        <View style={commonStyle.flex_1}>
            {overview.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <CText style={styles.generalText}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                    <View style={styles.marginTop_44}>
                        <CreatablePickList
                            label={t.labels.PBNA_MOBILE_SELECT_CONTACT}
                            data={contactList}
                            showValue={(v) => {
                                return v?.Name
                            }}
                            defValue={overview.caller_name__c}
                            onApply={(v: any) => {
                                setContact(v)
                            }}
                            setOverView={setOverView}
                            lastListItem={picklistBottom()}
                            onLastItemClick={() => {
                                handlePressAddContact()
                            }}
                            cRef={contactRef}
                        />
                    </View>
                    {renderForm()}
                    {(requestContact[0]?.Phone || overview.Phone) && (
                        <Input
                            label={t.labels.PBNA_MOBILE_PHONE}
                            labelStyle={styles.labelStyle}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Phone || overview.Phone}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={{ color: 'black', opacity: 1 }}
                        />
                    )}
                    {(requestContact[0]?.Email || overview.caller_name__c) && (
                        <Input
                            label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                            labelStyle={styles.labelStyle}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Email || overview.Email || '-'}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={{ color: 'black', opacity: 1 }}
                        />
                    )}
                    {(requestContact[0]?.Title || overview.caller_name__c) && (
                        <Input
                            label={t.labels.PBNA_MOBILE_ROLE_OPTIONAL}
                            labelStyle={styles.labelStyle}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Title || overview.Title || '-'}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={{ color: 'black', opacity: 1 }}
                        />
                    )}
                    {serviceType !== 'Repair' && (
                        <ServiceRequestDateTimePicker
                            fieldLabel={t.labels.PBNA_MOBILE_REQUEST_DATE}
                            value={overview.move_request_date__c && new Date(overview.move_request_date__c)}
                            onChange={(v) => {
                                setOverView({
                                    ...overview,
                                    move_request_date__c: moment(v).format(TIME_FORMAT.Y_MM_DD)
                                })
                            }}
                            cRef={installDateRef}
                            weekAfter={serviceType === 'Exchange'}
                        />
                    )}
                    {serviceType !== 'Repair' && (
                        <PickerTile
                            data={movePurposePicklist}
                            label={t.labels.PBNA_MOBILE_EQUIPMENT_MOVE_PURPOSE}
                            borderStyle={commonStyle.pickTileBorderStyle}
                            labelStyle={styles.labelStyle}
                            placeholder={t.labels.PBNA_MOBILE_SELECT_MOVE_PURPOSE}
                            title={t.labels.PBNA_MOBILE_MOVE_PURPOSE}
                            disabled={false}
                            required
                            inputStyle={styles.inputStyle2}
                            onChange={(v: any) => {
                                setOverView({
                                    ...overview,
                                    move_purpose_cde__c: movePurposeMapping[v]
                                })
                            }}
                            noPaddingHorizontal
                            defValue={overview.equip_move_purp_descr__c}
                            cRef={movePurposeRef}
                        />
                    )}
                    {serviceType === 'Repair' && (
                        <PickerTile
                            data={troublePickList}
                            label={t.labels.PBNA_MOBILE_TROUBLE_TYPE}
                            labelStyle={styles.labelStyle}
                            placeholder={t.labels.PBNA_MOBILE_SELECT_TROUBLE_TYPE}
                            title={t.labels.PBNA_MOBILE_TROUBLE_TYPE}
                            disabled={false}
                            required
                            inputStyle={styles.inputStyle2}
                            onChange={(v: any) => {
                                setOverView({
                                    ...overview,
                                    trbl_type_cde__c: troublePickListMapping[v]
                                })
                            }}
                            noPaddingHorizontal
                            defValue={null}
                            cRef={troubleTypeRef}
                        />
                    )}
                    <View style={styles.marginTop_20}>
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_COMMENTS_SPECIAL_INSTRUCTIONS_OPTIONAL}
                            placeholder={t.labels.PBNA_MOBILE_COMMENTS_SPECIAL_ENTER_INSTRUCTIONS}
                            onChangeText={(v) => {
                                setOverView({
                                    ...overview,
                                    comments__c: v
                                })
                            }}
                            maxLength={235}
                            initValue={overview.comments__c || ''}
                            cRef={noteRef}
                            multiline
                        />
                    </View>
                    {serviceType !== 'Repair' && (
                        <View>
                            <CText style={styles.titleLabel}>{t.labels.PBNA_MOBILE_SERVICE_HOURS}</CText>
                            <View style={commonStyle.flexRowSpaceBet}>
                                <View style={styles.fromContainer}>
                                    <CText style={styles.fromStyle}>{t.labels.PBNA_MOBILE_FROM}</CText>
                                    <View style={styles.timePicker}>
                                        <CustomerDateTimePicker
                                            cRef={fromTimeRef}
                                            onDone={(date) => {
                                                const temp = _.cloneDeep(overview)
                                                temp.wndw_beg_tme__c = moment(date).format('HH:mm:ss.ms[Z]')
                                                setOverView(temp)
                                            }}
                                            defValue={
                                                overview.wndw_beg_tme__c
                                                    ? `${moment().utc(true).format('YYYY-MM-DD')}T${
                                                          overview.wndw_beg_tme__c
                                                      }`.slice(0, -1)
                                                    : `${moment().utc(true).format('YYYY-MM-DD')}T08:00:00.000`
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styles.toContainer}>
                                    <CText style={styles.fromStyle}>{t.labels.PBNA_MOBILE_TO}</CText>
                                    <View style={styles.timePicker}>
                                        <CustomerDateTimePicker
                                            cRef={toTimeRef}
                                            startTime={
                                                overview.wndw_beg_tme__c
                                                    ? `${moment().utc(true).format('YYYY-MM-DD')}T${
                                                          overview.wndw_beg_tme__c
                                                      }`
                                                    : `${moment().utc(true).format('YYYY-MM-DD')}T08:00:00.000`
                                            }
                                            onDone={(date) => {
                                                const temp = _.cloneDeep(overview)
                                                temp.wndw_end_tme__c = moment(date).format('HH:mm:ss.ms[Z]')
                                                setOverView(temp)
                                            }}
                                            defValue={
                                                overview.wndw_end_tme__c
                                                    ? `${moment().utc(true).format('YYYY-MM-DD')}T${
                                                          overview.wndw_end_tme__c
                                                      }`.slice(0, -1)
                                                    : `${moment().utc(true).format('YYYY-MM-DD')}T17:00:00.000`
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.lineContainer}>
                                <View style={styles.lineStyle} />
                                <View style={styles.lineStyle} />
                            </View>
                        </View>
                    )}
                    <View style={{ height: EXTRA_HEIGHT }} />
                </KeyboardAwareScrollView>
            )}
            {(overview.status__c !== 'DRAFT' || isPersonaCRMBusinessAdmin() || readonly) && (
                <ScrollView contentContainerStyle={styles.readonlyScrollView}>
                    <CText style={styles.generalText}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                    <View style={styles.generalContainer}>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CONTACT}
                                fieldValue={overview.caller_name__c}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_EMAIL_ADDRESS}
                                fieldValue={requestContact[0]?.Email}
                            />
                            {overview.equip_move_type_cde__c !== 'Repair' && (
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_REQUESTED_DATE}
                                    fieldValue={moment(overview.move_request_date__c).format('MMM DD, YYYY')}
                                />
                            )}
                            {overview.equip_move_type_cde__c === 'Repair' && (
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_TROUBLE_TYPE}
                                    fieldValue={getTroubleDescriptionByCode()}
                                />
                            )}
                        </View>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_PHONE}
                                fieldValue={requestContact[0]?.Phone}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_ROLE}
                                fieldValue={requestContact[0]?.Title}
                            />
                            {overview.equip_move_type_cde__c !== 'Repair' && (
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_EQUIPMENT_MOVE_PURPOSE}
                                    fieldValue={getMovePurposeDescriptionByCode()}
                                />
                            )}
                            {overview.equip_move_type_cde__c === 'Repair' && overview.status__c !== 'DRAFT' && (
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_REPAIR_CONFIRMATION_NUMBER}
                                    fieldValue={getRepairConfirmationNum()}
                                />
                            )}
                        </View>
                    </View>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_COMMENTS_SPECIAL_INSTRUCTIONS}
                        fieldValue={overview.comments__c}
                    />
                    {showFailureStatus() && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_FAILURE_REASON}
                            fieldValue={t.labels.PBNA_MOBILE_REPROCESSING}
                        />
                    )}
                    {overview.status__c === 'CANCELLED' && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_CANCELLED_REASON}
                            fieldValue={overview.canc_reas_cde_descri__c}
                        />
                    )}
                    {overview.wndw_beg_tme__c &&
                        overview.wndw_end_tme__c &&
                        overview.equip_move_type_cde__c !== 'Repair' && (
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_HOURS_OF_OPERATION_NO_DOT}
                                fieldValue={`${_.capitalize(t.labels.PBNA_MOBILE_FROM)} ${moment(
                                    `${moment().format('YYYY-MM-DD')}T${overview.wndw_beg_tme__c}`.slice(0, -1)
                                ).format('h:mm A')} ${t.labels.PBNA_MOBILE_TO.toLowerCase()} ${moment(
                                    `${moment().format('YYYY-MM-DD')}T${overview.wndw_end_tme__c}`.slice(0, -1)
                                ).format('h:mm A')}`}
                            />
                        )}
                    {overview.equip_move_type_cde__c === 'Repair' && overview.status__c !== 'DRAFT' && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_TECHNICIAN_NOTES}
                            fieldValue={overview?.tech_cmnt_txt__c || ''}
                        />
                    )}
                </ScrollView>
            )}
        </View>
    )
}
export default ServiceOverviewForm
