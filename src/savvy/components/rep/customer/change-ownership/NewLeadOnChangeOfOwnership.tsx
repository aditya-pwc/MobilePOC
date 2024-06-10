/**
 * @description Component to create leads.
 * @author Qiulin Deng
 * @date 2021-04-29
 * @Lase
 */
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Input } from 'react-native-elements'
import { CommonParam } from '../../../../../common/CommonParam'
import AddressInput from '../../lead/common/AddressInput'
import LeadSegmentHierarchyPicker from '../../lead/common/LeadSegmentHierarchyPicker'
import { useBusinessSegmentPicklist, useFindKAName, useRouteLists } from '../../../../hooks/LeadHooks'
import PhoneNumberInput from '../../lead/common/PhoneNumberInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import EmailAddressInput from '../../lead/common/EmailAddressInput'
import { t } from '../../../../../common/i18n/t'
import SearchablePicklist from '../../lead/common/SearchablePicklist'
import { getParentRoute } from '../../../../utils/LeadUtils'
import { getParentAccount, OverviewLeadProps } from '../../../../utils/ChangeOfOwnershipUtils'
import { useKeyAccount } from '../../../../hooks/ChangeOfOwnershipHooks'
import _ from 'lodash'
import LeadFieldTile from '../../lead/common/LeadFieldTile'
import { addressGroup } from '../../lead/overview-tab/LeadDetails'
import { subTitle, styles as changeOfOwnershipCommonStyles } from '../ChangeOfOwnership'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import PickerTile from '../../lead/common/PickerTile'
import { PAYMENT_METHOD_PICKER_VALUE } from '../../common/PickerValue'

interface NewLeadOnChangeOfOwnershipProps {
    navigation?: any
    isChangeOwnership?: boolean
    objLead?: OverviewLeadProps
    setObjLead?: any
    cRef?: any
    setActiveStep?: any
    onLeadCreated?: any
    setDisableNextBtn?: any
    customer?: any
    readOnly?: boolean
}

const styles = StyleSheet.create({
    ...changeOfOwnershipCommonStyles,
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    bgMatteColor: {
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    blackFontColor: {
        color: '#000000'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    fontRedColor: {
        color: 'red'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    labelFontColor: {
        color: '#565656'
    },
    fontBold: {
        fontWeight: '700'
    },
    shadowButton: {
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.5,
        shadowRadius: 3
    },
    fullHeight: {
        height: '100%'
    },
    defPaddingHorizontal: {
        paddingHorizontal: '2.25%'
    },
    titleFont: {
        fontSize: 24,
        fontWeight: '700',
        paddingLeft: 10
    },
    varAlign: {
        alignItems: 'center'
    },
    horAlign: {
        justifyContent: 'center'
    },
    flexAlign: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },

    flexLayout: {
        flex: 1
    },
    bottomButton: {
        position: 'absolute',
        bottom: 24
    },
    iconTouch: {
        marginRight: 10
    },
    closeIcon: {
        height: 36,
        width: 36
    },
    topBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    formBlock: {
        marginTop: 40
    },
    smallFontSize: {
        fontSize: 12
    },
    midFontSize: {
        fontSize: 14
    },
    largeFontSize: {
        fontSize: 18
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    buttonSize: {
        height: 55
    },
    pickerBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.9
    },
    inputContainer: {
        height: 65
    },
    nonLabelInput: {
        height: 50
    },
    createSuccessIcon: {
        width: 60,
        marginTop: 45,
        marginBottom: 15,
        height: 57
    },
    syncIcon: {
        width: 70,
        marginTop: 65,
        height: 70
    },
    successMsg: {
        fontSize: 18,
        textAlign: 'center'
    },
    successModalSize: {
        height: 280,
        width: 330,
        borderRadius: 8
    },
    syncModalSize: {
        height: 200,
        width: 200,
        borderRadius: 8
    },
    dupMsgBlock: {
        height: 120
    },
    textAlign: {
        textAlign: 'center'
    },
    headerRadius: {
        borderRadius: 10
    },
    borderGrayColor: {
        borderBottomColor: '#D3D3D3'
    },
    largeMargin: {
        marginBottom: 100
    },
    bgGrayColor: {
        backgroundColor: '#EFF3F6'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: 'bold'
    },
    searchablePicklist: {
        paddingHorizontal: 10
    },
    pendingStyle: {
        width: '100%',
        height: 100
    },
    container: {
        width: Dimensions.get('window').width,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: '2.25%',
        marginTop: -20
    }
})
const HIDE_KEY_ACCOUNT = false
const NewLeadOnChangeOfOwnership = (props: NewLeadOnChangeOfOwnershipProps) => {
    const { cRef, onLeadCreated, setDisableNextBtn, objLead, setObjLead, readOnly } = props
    const leadHierarchyRef = useRef(null)
    const addressInfoRef = useRef(null)
    const emailInputRef = useRef(null)
    const [tempRegion, setTempRegion] = useState('')
    const [tempMarket, setTempMarket] = useState('')
    const [tempLocation, setTempLocation] = useState('')
    const regionList = useRouteLists(tempRegion, ['Region'], true)
    const marketList = useRouteLists(tempMarket, ['Market'], true, objLead?.Region_ID_c__c)
    const locationList = useRouteLists(
        tempLocation,
        ['Location'],
        false,
        objLead?.Market_ID_c__c,
        objLead?.Region_ID_c__c
    )
    const regionRef = useRef(null)
    const marketRef = useRef(null)
    const locationRef = useRef(null)
    const keyAccountRef = useRef(null)
    const keyAccountDivisionRef = useRef(null)
    const [tempKeyAccount, setTempKeyAccount] = useState(null)
    const [tempKeyAccountDivision, setTempKeyAccountDivision] = useState(null)
    const keyAccountList = useKeyAccount(tempKeyAccount, ['Key Account'])
    const keyAccountDivisionList = useKeyAccount(
        tempKeyAccountDivision,
        ['Key Account Division'],
        objLead?.Proposed_Key_Account_c__c
    )

    const { channelList, segmentList, subSegmentList, countryList, stateList } = useBusinessSegmentPicklist()

    const { KAName, KADName } = useFindKAName(objLead)

    /**
     * @description Confirm the required value and display the 'ADD LEAD' button
     */
    useEffect(() => {
        if (readOnly) {
            setDisableNextBtn(false)
        } else {
            const isKANull = _.isEmpty(objLead.Proposed_Key_Account_Name)
            const isKADNull = _.isEmpty(objLead.Proposed_Key_Account_Division_Name)
            const kaEnable = (isKANull && isKADNull) || (!isKANull && !isKADNull)
            if (
                objLead.Company__c &&
                objLead.Phone__c &&
                objLead.Country__c !== 'Select' &&
                objLead.City__c &&
                objLead.State__c !== 'Select State' &&
                !_.isEmpty(objLead.State__c) &&
                objLead.Street__c &&
                objLead.PostalCode__c &&
                objLead.Phone__c.replace(/\D/g, '').length === 10 &&
                !addressInfoRef?.current?.zipError &&
                !addressInfoRef?.current?.streetError &&
                emailInputRef?.current?.correct &&
                !_.isEmpty(objLead.Market_c__c) &&
                !_.isEmpty(objLead.Region_c__c) &&
                !_.isEmpty(objLead.Location_c__c) &&
                !_.isEmpty(objLead.BUSN_SGMNTTN_LVL_3_NM_c__c) &&
                !_.isEmpty(objLead.BUSN_SGMNTTN_LVL_2_NM_c__c) &&
                !_.isEmpty(objLead.BUSN_SGMNTTN_LVL_1_NM_c__c) &&
                kaEnable
            ) {
                setDisableNextBtn(false)
            } else {
                setDisableNextBtn(true)
            }
        }
    }, [objLead, addressInfoRef?.current?.streetError])

    const renderReadOnly = () => {
        return (
            <View style={styles.container}>
                <View style={commonStyle.halfWidth}>
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_NAME} fieldValue={objLead.Company__c} />

                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_PHONE_NUMBER} fieldValue={objLead.Phone__c} />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_CHANNEL}
                        fieldValue={objLead.BUSN_SGMNTTN_LVL_3_NM_c__c}
                    />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT}
                        fieldValue={objLead.BUSN_SGMNTTN_LVL_1_NM_c__c}
                    />

                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_MARKET_NAME} fieldValue={objLead.Market_c__c} />

                    {/* 12191266 Hide proposed key account */}
                    {HIDE_KEY_ACCOUNT && (
                        <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_KEY_ACCOUNT_OPTIONAL} fieldValue={KAName} />
                    )}

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_PAYMENT_METHOD}
                        fieldValue={objLead.Payment_Method_c__c}
                    />
                </View>

                <View style={commonStyle.halfWidth}>
                    <View style={commonStyle.fullWidth}>{addressGroup(objLead, t.labels.PBNA_MOBILE_ADDRESS)}</View>

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_COMPANY_EMAIL_OPTIONAL}
                        fieldValue={objLead.Email__c}
                    />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                        fieldValue={objLead.BUSN_SGMNTTN_LVL_2_NM_c__c}
                    />

                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_REGION_NAME} fieldValue={objLead.Region_c__c} />

                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_LOCATION_NAME} fieldValue={objLead.Location_c__c} />

                    {/* 12191266 Hide proposed key account */}
                    {HIDE_KEY_ACCOUNT && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_KEY_ACCOUNT_DIVISION_OPTIONAL}
                            fieldValue={KADName}
                        />
                    )}
                </View>
            </View>
        )
    }

    useImperativeHandle(cRef, () => ({
        handleSave: () => {
            onLeadCreated()
        }
    }))

    return (
        <>
            <View style={styles.fullHeight}>
                <View style={[styles.bgWhiteColor, styles.fullHeight, styles.defPaddingHorizontal]}>
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        {subTitle(t.labels.PBNA_MOBILE_GENERAL)}

                        {readOnly && renderReadOnly()}

                        {!readOnly && (
                            <>
                                <Input
                                    inputStyle={[styles.midFontSize, styles.blackFontColor]}
                                    labelStyle={[styles.smallFontSize, styles.labelFontColor]}
                                    value={objLead.Company__c}
                                    label={t.labels.PBNA_MOBILE_NAME}
                                    placeholder={t.labels.PBNA_MOBILE_ENTER_NAME}
                                    inputContainerStyle={styles.borderGrayColor}
                                    containerStyle={styles.inputContainer}
                                    onChangeText={(value) => {
                                        setObjLead({
                                            ...objLead,
                                            Company__c: value,
                                            LastName__c: value
                                        })
                                    }}
                                    maxLength={35}
                                />
                                <AddressInput
                                    label={t.labels.PBNA_MOBILE_ADDRESS}
                                    showCountry
                                    value={{
                                        Street__c: objLead.Street__c,
                                        City__c: objLead.City__c,
                                        State__c: objLead.State__c,
                                        Country__c: CommonParam.CountryCode === 'CA' ? 'Canada' : 'United States',
                                        PostalCode__c: objLead.PostalCode__c
                                    }}
                                    lstCountry={countryList}
                                    mapState={stateList}
                                    cRef={addressInfoRef}
                                    onChange={(addressInfo) => {
                                        setObjLead({
                                            ...objLead,
                                            Street__c: addressInfo.Street__c,
                                            City__c: addressInfo.City__c,
                                            Country__c: addressInfo.Country__c,
                                            State__c: addressInfo.State__c,
                                            PostalCode__c: addressInfo.PostalCode__c
                                        })
                                    }}
                                />

                                <PhoneNumberInput
                                    label={t.labels.PBNA_MOBILE_PHONE_NUMBER}
                                    placeholder={'(000) 000-0000'}
                                    value={objLead.Phone__c}
                                    onChange={(value) => {
                                        setObjLead({
                                            ...objLead,
                                            Phone__c: value
                                        })
                                    }}
                                />
                                <EmailAddressInput
                                    cRef={emailInputRef}
                                    value={objLead.Email__c}
                                    label={t.labels.PBNA_MOBILE_COMPANY_EMAIL_OPTIONAL}
                                    placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                                    onChange={(value) => {
                                        setObjLead({
                                            ...objLead,
                                            Email__c: value
                                        })
                                    }}
                                />
                                <LeadSegmentHierarchyPicker
                                    labels={{
                                        channelLabel: `${t.labels.PBNA_MOBILE_BUSINESS_CHANNEL}`,
                                        segmentLabel: `${t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}`,
                                        subSegmentLabel: `${t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT}`
                                    }}
                                    defValue={{
                                        channel: objLead.BUSN_SGMNTTN_LVL_3_NM_c__c,
                                        segment: objLead.BUSN_SGMNTTN_LVL_2_NM_c__c,
                                        subsegment: objLead.BUSN_SGMNTTN_LVL_1_NM_c__c
                                    }}
                                    lstChannel={channelList}
                                    mapSegment={segmentList}
                                    mapSubSegment={subSegmentList}
                                    cRef={leadHierarchyRef}
                                    onChangeValue={(params) => {
                                        setObjLead({
                                            ...objLead,
                                            BUSN_SGMNTTN_LVL_1_NM_c__c: params.subSegment,
                                            BUSN_SGMNTTN_LVL_2_NM_c__c: params.segment,
                                            BUSN_SGMNTTN_LVL_3_NM_c__c: params.channel
                                        })
                                    }}
                                />

                                <View style={styles.searchablePicklist}>
                                    <SearchablePicklist
                                        cRef={regionRef}
                                        noMarginRight
                                        labelStyle={styles.labelStyle}
                                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                                        label={t.labels.PBNA_MOBILE_REGION_NAME}
                                        data={regionList}
                                        showValue={(v) => {
                                            return v?.SLS_UNIT_NM__c
                                        }}
                                        defValue={objLead.Region_c__c}
                                        onSearchChange={(v) => setTempRegion(v)}
                                        onApply={(v) => {
                                            setObjLead({
                                                ...objLead,
                                                Location_c__c: null,
                                                Location_ID_c__c: null,
                                                Market_c__c: null,
                                                Market_ID_c__c: null,
                                                Region_c__c: v.SLS_UNIT_NM__c,
                                                Region_ID_c__c: v.SLS_UNIT_ID__c
                                            })
                                            locationRef.current?.resetNull()
                                            marketRef.current?.resetNull()
                                        }}
                                    />
                                    <SearchablePicklist
                                        cRef={marketRef}
                                        noMarginRight
                                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                                        labelStyle={styles.labelStyle}
                                        label={t.labels.PBNA_MOBILE_MARKET_NAME}
                                        data={marketList}
                                        showValue={(v) => {
                                            return v?.SLS_UNIT_NM__c
                                        }}
                                        defValue={objLead.Market_c__c}
                                        onSearchChange={(v) => setTempMarket(v)}
                                        onApply={async (v) => {
                                            const parentNode = await getParentRoute(v.SLS_UNIT_ID__c, 'Market')

                                            setObjLead({
                                                ...objLead,
                                                Location_c__c: null,
                                                Location_ID_c__c: null,
                                                Market_c__c: v.SLS_UNIT_NM__c,
                                                Market_ID_c__c: v.SLS_UNIT_ID__c,
                                                Region_c__c: parentNode.Parent_Node__r?.SLS_UNIT_NM__c,
                                                Region_ID_c__c: parentNode.Parent_Node__r?.SLS_UNIT_ID__c
                                            })

                                            regionRef.current?.setValue(parentNode.Parent_Node__r?.SLS_UNIT_NM__c)
                                            locationRef.current?.resetNull()
                                        }}
                                    />
                                    <SearchablePicklist
                                        cRef={locationRef}
                                        noMarginRight
                                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                                        labelStyle={styles.labelStyle}
                                        label={`${t.labels.PBNA_MOBILE_LOCATION_NAME}`}
                                        data={locationList}
                                        showValue={(v) => {
                                            return v?.SLS_UNIT_NM__c
                                        }}
                                        defValue={objLead.Location_c__c}
                                        onSearchChange={(v) => setTempLocation(v)}
                                        onApply={async (v) => {
                                            const parentNode = await getParentRoute(v.SLS_UNIT_ID__c, 'Location')
                                            setObjLead({
                                                ...objLead,
                                                Location_c__c: v.SLS_UNIT_NM__c,
                                                Location_ID_c__c: v.SLS_UNIT_ID__c,
                                                Market_c__c: parentNode.Parent_Node__r?.SLS_UNIT_NM__c,
                                                Market_ID_c__c: parentNode.Parent_Node__r?.SLS_UNIT_ID__c,
                                                Region_c__c: parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c,
                                                Region_ID_c__c:
                                                    parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_ID__c
                                            })

                                            marketRef.current?.setValue(parentNode.Parent_Node__r?.SLS_UNIT_NM__c)
                                            regionRef.current?.setValue(
                                                parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c
                                            )
                                        }}
                                    />
                                    {/* 12191266 Hide proposed key account */}
                                    {HIDE_KEY_ACCOUNT && (
                                        <SearchablePicklist
                                            cRef={keyAccountRef}
                                            noMarginRight
                                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                                            labelStyle={styles.labelStyle}
                                            label={`${t.labels.PBNA_MOBILE_KEY_ACCOUNT_OPTIONAL}`}
                                            data={keyAccountList}
                                            showValue={(v) => {
                                                return v?.Name
                                            }}
                                            defValue={objLead.Proposed_Key_Account_Name}
                                            onSearchChange={(v) => setTempKeyAccount(v)}
                                            onApply={async (v) => {
                                                setObjLead({
                                                    ...objLead,
                                                    Proposed_Key_Account_c__c: v.Id,
                                                    Proposed_Key_Account_Name: v.Name,
                                                    Proposed_Key_Account_Division_c__c: null,
                                                    Proposed_Key_Account_Division_Name: null
                                                })
                                                keyAccountDivisionRef.current?.resetNull()
                                            }}
                                        />
                                    )}
                                    {HIDE_KEY_ACCOUNT && (
                                        <SearchablePicklist
                                            noMarginRight
                                            cRef={keyAccountDivisionRef}
                                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                                            labelStyle={styles.labelStyle}
                                            label={`${t.labels.PBNA_MOBILE_KEY_ACCOUNT_DIVISION_OPTIONAL}`}
                                            data={keyAccountDivisionList}
                                            showValue={(v) => {
                                                return v?.Name
                                            }}
                                            defValue={objLead.Proposed_Key_Account_Division_Name}
                                            onSearchChange={(v) => setTempKeyAccountDivision(v)}
                                            onApply={async (v) => {
                                                const parentNode = await getParentAccount(v.Id)
                                                setObjLead({
                                                    ...objLead,
                                                    Proposed_Key_Account_c__c: parentNode?.Parent?.Id,
                                                    Proposed_Key_Account_Name: parentNode?.Parent?.Name,
                                                    Proposed_Key_Account_Division_c__c: v.Id,
                                                    Proposed_Key_Account_Division_Name: v.Name
                                                })
                                                keyAccountRef.current?.setValue(parentNode?.Parent?.Name)
                                            }}
                                        />
                                    )}
                                </View>
                                <PickerTile
                                    data={PAYMENT_METHOD_PICKER_VALUE}
                                    label={t.labels.PBNA_MOBILE_PAYMENT_METHOD}
                                    labelStyle={styles.labelStyle}
                                    title={t.labels.PBNA_MOBILE_PAYMENT_METHOD}
                                    disabled={false}
                                    defValue={objLead.Payment_Method_c__c}
                                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                                    required
                                    onChange={(v: string) => {
                                        setObjLead({
                                            ...objLead,
                                            Payment_Method_c__c: v
                                        })
                                    }}
                                />
                                <View style={styles.pendingStyle} />
                            </>
                        )}
                    </KeyboardAwareScrollView>
                </View>
            </View>
        </>
    )
}

export default NewLeadOnChangeOfOwnership
