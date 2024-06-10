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
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import { Input } from 'react-native-elements'
import { useContacts } from '../../../../hooks/LeadHooks'
import CustomerDateTimePicker from './CustomerDateTimePicker'
import ContactForm from '../../lead/ContactForm'
import EquipmentDateTimePicker from '../../lead/common/EquipmentDateTimePicker'
import { useEquipmentMovePurposePicklist, useRequestContact } from '../../../../hooks/EquipmentHooks'
import LeadFieldTile from '../../lead/common/LeadFieldTile'
import { t } from '../../../../../common/i18n/t'
import CreatablePickList from './CreatablePickList'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface InstallOverviewFormProps {
    setOverView: any
    accountId: any
    leadId: any
    overview: any
    type: 'Lead' | 'RetailStore'
    l: any
    readonly?: boolean
}

export const equipmentFormStyle = StyleSheet.create({
    titleLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        height: 14,
        marginBottom: -5,
        color: baseStyle.color.titleGray
    },
    inputStyle: {
        flexWrap: 'wrap',
        maxHeight: 60,
        marginBottom: 8,
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    pickListContainer: {
        height: 36,
        width: 30
    },
    pickIconStyle: {
        width: 20,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    pickIconStyle2: {
        width: 3,
        height: 20,
        backgroundColor: '#00A2D9',
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    addText: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    scrollViewContainer: {
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: '5%'
    },
    generalText: {
        marginTop: 40,
        fontSize: 18,
        fontWeight: '900'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    disabledInputStyle: {
        color: 'black',
        opacity: 1
    },
    emailAddressText: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputStyle2: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '400'
    },
    marginTop20: { marginTop: 20 },
    fromContainer: {
        width: '50%',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    fromStyle: {
        width: '25%',
        marginTop: 20,
        color: '#565656',
        fontSize: 12
    },
    timerPickerContainer: {
        width: '60%',
        marginLeft: 20,
        paddingRight: 10
    },
    toContainer: {
        width: '50%',
        flexDirection: 'row',
        marginLeft: 20
    },
    lineContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 5
    },
    lineStyle: {
        width: '45%',
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    readonlyScrollView: {
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: '5%'
    },
    generalContainer: {
        marginTop: 29,
        flexDirection: 'row'
    }
})
const EXTRA_HEIGHT = 60

export const picklistBottom = () => {
    return (
        <View>
            <View style={commonStyle.flexRowAlignCenter}>
                <View style={equipmentFormStyle.pickListContainer}>
                    <View style={equipmentFormStyle.pickIconStyle} />
                    <View style={equipmentFormStyle.pickIconStyle2} />
                </View>
                <CText style={equipmentFormStyle.addText}>{t.labels.PBNA_MOBILE_ADD_NEW_CONTACT.toUpperCase()}</CText>
            </View>
        </View>
    )
}
const InstallOverviewForm: FC<InstallOverviewFormProps> = (props: InstallOverviewFormProps) => {
    const { accountId, leadId, setOverView, overview, type, l, readonly = false } = props
    const contactRef = useRef(null)
    const installDateRef = useRef(null)
    const movePurposeRef = useRef(null)
    const noteRef = useRef(null)
    const fromTimeRef = useRef(null)
    const toTimeRef = useRef(null)
    const [saveTimes, setSaveTimes] = useState(0)
    const { movePurposePicklist, movePurposeMapping } = useEquipmentMovePurposePicklist()
    const contactCreationFormLeadRef = useRef(null)
    const contactCreationFormStoreRef = useRef(null)
    const handlePressAddContact = () => {
        type === 'RetailStore' && contactCreationFormStoreRef.current.open()
        type === 'Lead' && contactCreationFormLeadRef.current.open()
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

    const contactList = useContacts(type, type === 'Lead' ? leadId : accountId, saveTimes)
    const requestContact = useRequestContact(type === 'Lead' ? leadId : accountId, overview.caller_name__c, type)
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
                {type !== 'Lead' ? (
                    <ContactForm
                        cRef={contactCreationFormStoreRef}
                        accountId={accountId}
                        onIngestFinished={setContact}
                        contactType={type}
                    />
                ) : (
                    <ContactForm
                        cRef={contactCreationFormLeadRef}
                        leadExternalId={leadId}
                        onIngestFinished={setContact}
                        contactType={type}
                        l={l}
                    />
                )}
            </View>
        )
    }
    return (
        <View style={commonStyle.flex_1}>
            {overview.status__c === 'DRAFT' && !readonly && (
                <KeyboardAwareScrollView contentContainerStyle={equipmentFormStyle.scrollViewContainer}>
                    <CText style={equipmentFormStyle.generalText}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                    <View style={{ marginTop: 44 }}>
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
                            labelStyle={equipmentFormStyle.labelStyle}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Phone || overview.Phone}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={equipmentFormStyle.disabledInputStyle}
                        />
                    )}
                    {(requestContact[0]?.Email || overview.caller_name__c) && (
                        <Input
                            label={t.labels.PBNA_MOBILE_EMAIL_ADDRESS_OPTIONAL}
                            labelStyle={equipmentFormStyle.emailAddressText}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Email || overview.Email || '-'}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={equipmentFormStyle.disabledInputStyle}
                        />
                    )}
                    {(requestContact[0]?.Title || overview.caller_name__c) && (
                        <Input
                            label={t.labels.PBNA_MOBILE_ROLE_OPTIONAL}
                            labelStyle={equipmentFormStyle.labelStyle}
                            containerStyle={{ paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomColor: '#D3D3D3' }}
                            value={requestContact[0]?.Title || overview.Title || '-'}
                            inputStyle={{ fontSize: 14 }}
                            disabled
                            disabledInputStyle={equipmentFormStyle.disabledInputStyle}
                        />
                    )}
                    <EquipmentDateTimePicker
                        fieldLabel={t.labels.PBNA_MOBILE_INSTALL_REQUEST_DATE}
                        value={overview.move_request_date__c && new Date(overview.move_request_date__c)}
                        onChange={(v) => {
                            setOverView({
                                ...overview,
                                move_request_date__c: moment(v).format(TIME_FORMAT.Y_MM_DD)
                            })
                        }}
                        cRef={installDateRef}
                        weekAfter
                    />
                    <PickerTile
                        data={movePurposePicklist}
                        borderStyle={commonStyle.pickTileBorderStyle}
                        label={t.labels.PBNA_MOBILE_EQUIPMENT_MOVE_PURPOSE}
                        labelStyle={equipmentFormStyle.labelStyle}
                        placeholder={t.labels.PBNA_MOBILE_SELECT_MOVE_PURPOSE}
                        title={t.labels.PBNA_MOBILE_MOVE_PURPOSE}
                        disabled={false}
                        required
                        inputStyle={equipmentFormStyle.inputStyle2}
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
                    <View style={equipmentFormStyle.marginTop20}>
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
                    <CText style={equipmentFormStyle.titleLabel}>{t.labels.PBNA_MOBILE_SERVICE_HOURS}</CText>
                    <View style={commonStyle.flexRowSpaceBet}>
                        <View style={equipmentFormStyle.fromContainer}>
                            <CText style={equipmentFormStyle.fromStyle}>{t.labels.PBNA_MOBILE_FROM}</CText>
                            <View style={equipmentFormStyle.timerPickerContainer}>
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
                        <View style={equipmentFormStyle.toContainer}>
                            <CText style={equipmentFormStyle.fromStyle}>{t.labels.PBNA_MOBILE_TO}</CText>
                            <View style={equipmentFormStyle.timerPickerContainer}>
                                <CustomerDateTimePicker
                                    cRef={toTimeRef}
                                    startTime={`${moment().utc(true).format('YYYY-MM-DD')}T${overview.wndw_beg_tme__c}`}
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
                    <View style={equipmentFormStyle.lineContainer}>
                        <View style={equipmentFormStyle.lineStyle} />
                        <View style={equipmentFormStyle.lineStyle} />
                    </View>
                    <View style={{ height: EXTRA_HEIGHT }} />
                </KeyboardAwareScrollView>
            )}
            {(overview.status__c !== 'DRAFT' || readonly) && (
                <ScrollView contentContainerStyle={equipmentFormStyle.readonlyScrollView}>
                    <CText style={equipmentFormStyle.generalText}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                    <View style={equipmentFormStyle.generalContainer}>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CONTACT}
                                fieldValue={overview.caller_name__c}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_EMAIL_ADDRESS}
                                fieldValue={requestContact[0]?.Email}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_REQUESTED_INSTALL_DATE}
                                fieldValue={moment(overview.move_request_date__c).format('MMM DD, YYYY')}
                                containerStyle={{ marginBottom: 10 }}
                            />
                        </View>
                        <View style={commonStyle.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_PHONE}
                                fieldValue={requestContact[0]?.Phone}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_ROLE}
                                fieldValue={requestContact[0]?.Title}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_EQUIPMENT_MOVE_PURPOSE}
                                fieldValue={getMovePurposeDescriptionByCode()}
                                containerStyle={{ marginBottom: 10 }}
                            />
                        </View>
                    </View>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_COMMENTS_SPECIAL_INSTRUCTIONS}
                        fieldValue={overview.comments__c}
                        containerStyle={{ marginBottom: 10 }}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_HOURS_OF_OPERATION_NO_DOT}
                        fieldValue={`${_.capitalize(t.labels.PBNA_MOBILE_FROM)} ${moment(
                            `${moment().format('YYYY-MM-DD')}T${overview.wndw_beg_tme__c}`.slice(0, -1)
                        ).format('h:mm A')} ${t.labels.PBNA_MOBILE_TO.toLowerCase()} ${moment(
                            `${moment().format('YYYY-MM-DD')}T${overview.wndw_end_tme__c}`.slice(0, -1)
                        ).format('h:mm A')}`}
                    />
                </ScrollView>
            )}
        </View>
    )
}
export default InstallOverviewForm
