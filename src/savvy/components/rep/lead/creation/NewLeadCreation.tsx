/**
 * @description Component to create leads.
 * @author Qiulin Deng
 * @date 2021-04-29
 * @Lase
 */
import React, { useEffect, useRef, useState } from 'react'
import { Modal, Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import CText from '../../../../../common/components/CText'
import { CommonParam } from '../../../../../common/CommonParam'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { Modalize } from 'react-native-modalize'
import PickerTile from '../common/PickerTile'
import AddressInput from '../common/AddressInput'
import LeadSegmentHierarchyPicker from '../common/LeadSegmentHierarchyPicker'
import { useBusinessSegmentPicklist, useRelatedCustomerList, useRouteLists } from '../../../../hooks/LeadHooks'
import PhoneNumberInput from '../common/PhoneNumberInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import EmailAddressInput from '../common/EmailAddressInput'
import _ from 'lodash'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { compositeQueryObjsBySoql, restApexCommonCall, syncUpObjCreateFromMem } from '../../../../api/SyncUtils'
import { refreshKpiBarAction } from '../../../../redux/action/LeadActionType'
import { useDispatch } from 'react-redux'
import { Instrumentation } from '@appdynamics/react-native-agent'
import SearchLeadTile from '../tile/SearchLeadTile'
import { Log } from '../../../../../common/enums/Log'
import moment from 'moment'
import { t } from '../../../../../common/i18n/t'
import CustomerListTile from '../../customer/CustomerListTile'
import { SoupService } from '../../../../service/SoupService'
import { genSingleRetailStoreRelationshipCompositeGroup } from '../../../../api/composite-template/RetailStoreCompositeTemplate'
import { Persona } from '../../../../../common/enums/Persona'
import SearchablePicklist from '../common/SearchablePicklist'
import { getParentRoute } from '../../../../utils/LeadUtils'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface NewLeadCreationProps {
    navigation: any
}

const DEFAULT_VALUE = {
    VALIDATION_RULES: {
        NET_ERROR_CODE: 400,
        MAX_SUC_MSG_LEN: 48,
        NUMBER_NOT_NUMBER: /\D/g,
        PHONE_MATCH_NUMBER: /^(\d{1,3})(\d{0,3})(\d{0,4})$/,
        PHONE_LENGTH: 10
    }
}

const styles = StyleSheet.create({
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
    halfLayout: {
        width: '50%'
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
    paddingHorizontal_10: {
        paddingHorizontal: 10
    },
    blankView: {
        width: '100%',
        height: 100
    }
})

const NewLeadCreation = (props: NewLeadCreationProps) => {
    const { navigation } = props
    const modalizeRef = useRef<Modalize>(null)
    const leadHierarchyRef = useRef(null)
    const leadTypeRef = useRef(null)
    const addressInfoRef = useRef(null)
    const emailInputRef = useRef(null)
    const { dropDownRef } = useDropDown()
    const isMounted = useRef(null)

    const [objLead, setObjLead] = useState({
        Company__c: '',
        Street__c: '',
        City__c: '',
        State__c: '',
        Country__c: 'United States',
        PostalCode__c: '',
        Lead_Type_c__c: '',
        Phone__c: '',
        LastName__c: '',
        Email__c: '',
        BUSN_SGMNTTN_LVL_3_NM_c__c: '',
        BUSN_SGMNTTN_LVL_2_NM_c__c: '',
        BUSN_SGMNTTN_LVL_1_NM_c__c: '',
        BUSN_SGMNTTN_LVL_1_CDV_c__c: '',
        BUSN_SGMNTTN_LVL_2_CDV_c__c: '',
        BUSN_SGMNTTN_LVL_3_CDV_c__c: '',
        LeadSource__c: 'Cold Call',
        Status__c: 'Negotiate',
        Lead_Sub_Status_c__c: 'Assigned',
        Moved_to_Negotiate_Time_c__c: '',
        Call_Counter_c__c: 0,
        Last_Task_Modified_Date_c__c: '',
        Owner_GPID_c__c: null,
        CreatedBy_GPID_c__c: null,
        LastModifiedBy_GPID_c__c: null,
        Source_ID_c__c: null,
        Device_Source_c__c: null,
        Rep_Last_Modified_Date_c__c: null,
        Assigned_Date_c__c: null,
        Location_c__c: '',
        Location_ID_c__c: null,
        Market_c__c: '',
        Market_ID_c__c: null,
        Region_c__c: '',
        Region_ID_c__c: null,
        original_customer_c__c: null,
        original_customer_number_c__c: null
    })
    const [showAddButton, setShowAddButton] = useState(true)
    const [showName, setShowName] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [dupItemList, setDuplicateItemList] = useState([])
    const [dupAcctList, setDupAcctList] = useState([])
    const [soupEntryId, setSoupEntryId] = useState('')
    const [locationSearchValue, setLocationSearchValue] = useState('')
    const [relatedCustomerSearchVal, setRelatedCustomerSearchVal] = useState('')
    const locationList = useRouteLists(locationSearchValue, ['Location'])
    const relatedCustomerList = useRelatedCustomerList(relatedCustomerSearchVal)
    const leadTypeMapping = [
        { k: t.labels.PBNA_MOBILE_CONVERSION, v: 'Conversion' },
        { k: t.labels.PBNA_MOBILE_PRE_OPEN_LABEL, v: 'Pre Open' },
        { k: t.labels.PBNA_MOBILE_ADDITIONAL_OUTLET, v: 'Additional Outlet' },
        { k: t.labels.PBNA_MOBILE_REPAIR_ONLY, v: 'Repair Only' }
    ]
    const dispatch = useDispatch()
    const { channelList, segmentList, subSegmentList, countryList, stateList, segmentOption } =
        useBusinessSegmentPicklist()
    /**
     * @description Control duplicate lead modal to open
     */
    const onOpen = () => {
        modalizeRef.current?.open()
    }

    /**
     * @description Control duplicate lead modal to close
     */
    const onClose = () => {
        modalizeRef.current?.close()
    }

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    /**
     * @description Confirm the required value and display the 'ADD LEAD' button
     */
    useEffect(() => {
        if (
            objLead.Company__c &&
            objLead.Phone__c &&
            objLead.Country__c !== 'Select' &&
            objLead.Lead_Type_c__c !== 'Select' &&
            objLead.City__c &&
            objLead.State__c !== 'Select State' &&
            objLead.State__c !== '' &&
            objLead.Street__c &&
            objLead.PostalCode__c &&
            objLead.Phone__c.replace(/\D/g, '').length === 10 &&
            !addressInfoRef?.current?.zipError &&
            !addressInfoRef?.current?.streetError &&
            emailInputRef.current.correct &&
            objLead.Location_c__c !== ''
        ) {
            setShowAddButton(false)
        } else {
            setShowAddButton(true)
        }
    }, [objLead])

    /**
     * @description If the company name is too long, shorten it
     */
    const getShowName = () => {
        if (objLead.Company__c.length + objLead.Street__c.length > DEFAULT_VALUE.VALIDATION_RULES.MAX_SUC_MSG_LEN) {
            const cutName = objLead.Company__c.split(' ')
            const spliceName = objLead.Company__c.split(' ')
            for (let index = 0; index < cutName.length; index++) {
                spliceName.splice(cutName.length - (1 + index), 1 + index)
                if (
                    (spliceName.join(' ') + '...').length + objLead.Street__c.length <=
                    DEFAULT_VALUE.VALIDATION_RULES.MAX_SUC_MSG_LEN
                ) {
                    setShowName(spliceName.join(' ') + '...')
                    break
                }
            }
        } else {
            setShowName(objLead.Company__c)
        }
    }
    /**
     * @description sync new lead to org
     */
    const syncNewLead = async () => {
        Instrumentation.startTimer('Create a new lead')
        global.$globalModal.openModal()
        const leadObj = _.cloneDeep(objLead)
        if (CommonParam.PERSONA__c === Persona.PSR || CommonParam.PERSONA__c === Persona.FSR) {
            leadObj.Source_ID_c__c = '002'
        } else {
            leadObj.Source_ID_c__c = '003'
        }
        leadObj.Phone__c = leadObj.Phone__c.replace(/[^\d.]/g, '')
        leadObj.BUSN_SGMNTTN_LVL_1_NM_c__c = leadHierarchyRef.current.subSegment
        leadObj.BUSN_SGMNTTN_LVL_2_NM_c__c = leadHierarchyRef.current.segment
        leadObj.BUSN_SGMNTTN_LVL_3_NM_c__c = leadHierarchyRef.current.channel
        leadObj.BUSN_SGMNTTN_LVL_1_CDV_c__c =
            _.findKey(segmentOption?.SUB_SEGMENT_CODE, (v) => {
                return v === leadHierarchyRef.current.subSegment
            }) || ''
        leadObj.BUSN_SGMNTTN_LVL_2_CDV_c__c =
            _.findKey(segmentOption?.SEGMENT_CODE, (v) => {
                return v === leadHierarchyRef.current.segment
            }) || ''
        leadObj.BUSN_SGMNTTN_LVL_3_CDV_c__c =
            _.findKey(segmentOption?.CHANNEL_CODE, (v) => {
                return v === leadHierarchyRef.current.channel
            }) || ''
        leadObj.Moved_to_Negotiate_Time_c__c = new Date().toISOString()
        leadObj.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        leadObj.Owner_GPID_c__c = CommonParam.GPID__c
        leadObj.CreatedBy_GPID_c__c = CommonParam.GPID__c
        leadObj.LastModifiedBy_GPID_c__c = CommonParam.GPID__c
        leadObj.Device_Source_c__c = 'Mobile'
        leadObj.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        leadObj.Assigned_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        leadObj.original_customer_c__c =
            objLead.Lead_Type_c__c === 'Additional Outlet' ? leadObj.original_customer_c__c : ''
        leadObj.original_customer_number_c__c =
            objLead.Lead_Type_c__c === 'Additional Outlet' ? leadObj.original_customer_number_c__c : ''
        try {
            const [data] = await syncUpObjCreateFromMem('Lead__x', [leadObj])
            setSoupEntryId(data.data[0]._soupEntryId)
            global.$globalModal.closeModal()
            getShowName()
            setShowSuccess(true)
            Instrumentation.stopTimer('Create a new lead')
            dispatch(refreshKpiBarAction())
        } catch (e) {
            global.$globalModal.closeModal()
            dropDownRef.current.alertWithType('error', 'Create lead failed', ErrorUtils.error2String(e))
            storeClassLog(Log.MOBILE_ERROR, 'syncNewLead', 'Create lead failed: ' + ErrorUtils.error2String(e))
        }
    }

    /**
     * @description Verify that the Leads duplicate
     */
    const checkIsDuplicate = async () => {
        Instrumentation.startTimer('Check Duplicate Leads')
        global.$globalModal.openModal()
        const leadObj = {
            FirstName: objLead.Company__c.replace(/['‘’`]/, ''),
            Company: objLead.Company__c.replace(/['‘’`]/, ''),
            Street: objLead.Street__c,
            City: objLead.City__c,
            State: objLead.State__c,
            Country: objLead.Country__c,
            PostalCode: objLead.PostalCode__c,
            Lead_Type_c: objLead.Lead_Type_c__c,
            Phone: objLead.Phone__c.replace(/[^\d.]/g, ''),
            LastName: objLead.Company__c.replace(/['‘’`]/, ''),
            Email: objLead.Email__c,
            Status: 'Negotiate',
            LeadSource: 'Cold Call',
            Is_Active: null,
            BusinessSegment: leadHierarchyRef.current.segment
        }
        const leadObjLst = []
        leadObjLst.push(leadObj)
        const params = {
            objDuplicateCustomerInterface: {
                HasDuplicate: null,
                DuplicateCustomerList: leadObjLst
            }
        }
        restApexCommonCall('getduplicateleadfromspoke', 'POST', params)
            .then((response) => {
                const json = response.data
                if (json.HasDuplicate) {
                    Instrumentation.reportMetric('FSR/PSR Duplicate Check Screen Display', 1)
                    const dupLeadList = []
                    const dupAccountList = []
                    json.DuplicateCustomerList.map((element) => {
                        if (element.Is_Account) {
                            dupAccountList.push(element)
                        } else {
                            const l = {
                                Id: element.ExternalId,
                                Pre_qualified_c__c: element.Pre_qualified_c ? '1' : '0',
                                Company__c: element.Company,
                                Street__c: element.Street,
                                City__c: element.City,
                                PostalCode__c: element.PostalCode,
                                State__c: element.State,
                                Last_Task_Modified_Date_c__c: element.Last_Task_Modified_Date_c,
                                Tier_c__c: element.Tier_c,
                                Call_Counter_c__c: element.Call_Counter_c,
                                Status__c: element.Status,
                                Contact_Made_Counter_c__c: element.Contact_Made_Counter_c,
                                PD_Contact_Made_Counter_c__c: element.PD_Contact_Made_Counter_c,
                                PD_Call_Counter_c__c: element.PD_Call_Counter_c__c,
                                ExternalId: element.Id
                            }
                            dupLeadList.push(l)
                        }
                        return null
                    })
                    setDuplicateItemList(dupLeadList)
                    setDupAcctList(dupAccountList)
                    global.$globalModal.closeModal()
                    Instrumentation.stopTimer('Check Duplicate Leads')
                    onOpen()
                } else {
                    syncNewLead()
                }
            })
            .catch((err) => {
                global.$globalModal.closeModal()
                dropDownRef.current.alertWithType('error', 'Check Duplicate Error', err.toString())
            })
    }

    const moveToDetail = () => {
        navigation.navigate('LeadDetailScreen', {
            lead: { _soupEntryId: soupEntryId },
            type: 'Negotiate'
        })
    }

    const checkDupList = () => {
        if (dupAcctList.length > 0 && dupItemList.length > 0) {
            return (
                <View>
                    <CText style={[styles.fontBold, styles.largeFontSize, styles.textAlign]}>
                        {dupAcctList.length}&nbsp;{t.labels.PBNA_MOBILE_MATCHING_CUSTOMERS_FOUND}
                    </CText>
                    <CText style={[styles.fontBold, styles.largeFontSize, styles.textAlign]}>
                        &&nbsp;{dupItemList.length}&nbsp;{t.labels.PBNA_MOBILE_MATCHING_LEADS_FOUND}
                    </CText>
                </View>
            )
        } else if (dupAcctList.length > 0 && dupItemList.length === 0) {
            return (
                <CText style={[styles.fontBold, styles.largeFontSize, styles.textAlign]}>
                    {dupAcctList.length}&nbsp;{t.labels.PBNA_MOBILE_MATCHING_CUSTOMERS_FOUND}.
                </CText>
            )
        } else if (dupAcctList.length === 0 && dupItemList.length > 0) {
            return (
                <CText style={[styles.fontBold, styles.largeFontSize, styles.textAlign]}>
                    {dupItemList.length}&nbsp;{t.labels.PBNA_MOBILE_MATCHING_LEADS_FOUND}
                </CText>
            )
        }
    }

    const renderHeader = () => {
        return (
            <View style={[styles.bgWhiteColor, styles.headerRadius]}>
                <View style={styles.defPaddingHorizontal}>
                    <View style={[styles.nonLabelInput, styles.pickerBorder, styles.flexAlign]}>
                        <CText style={[styles.smallFontSize, { fontWeight: '700' }]}>
                            {t.labels.PBNA_MOBILE_DUPLICATES_FOUND}
                        </CText>
                    </View>
                    <View style={[styles.dupMsgBlock, styles.flexAlign]}>
                        {checkDupList()}
                        <CText style={[styles.fontBold, styles.largeFontSize]}>
                            {t.labels.PBNA_MOBILE_WOULD_YOU_LIKE_TO_PROCEED}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }

    const renderFooter = () => (
        <FormBottomButton
            rightButtonLabel={t.labels.PBNA_MOBILE_YES_ADD_LEAD}
            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
            onPressCancel={() => {
                Instrumentation.reportMetric('FSR/PSR Presses Duplicate Cancel Button', 1)
                onClose()
            }}
            onPressSave={() => {
                Instrumentation.reportMetric('FSR/PSR Adds Lead On Duplicate Check Screen', 1)
                onClose()
                syncNewLead()
            }}
        />
    )

    const renderSucButton = () => (
        <View style={[styles.bottomButton, { bottom: 0 }, styles.flexDirectionRow]}>
            <View style={[styles.halfLayout, styles.shadowButton]}>
                <Button
                    onPress={() => {
                        setShowSuccess(false)
                        navigation.navigate('Leads')
                    }}
                    title={t.labels.PBNA_MOBILE_BACK_TO_LIST}
                    titleStyle={[styles.fontFamily, styles.fontPurpleColor, styles.smallFontSize]}
                    type="clear"
                    buttonStyle={[styles.buttonSize, styles.bgWhiteColor]}
                />
            </View>
            <View style={styles.halfLayout}>
                <Button
                    onPress={() => {
                        setShowSuccess(false)
                        moveToDetail()
                    }}
                    title={t.labels.PBNA_MOBILE_VIEW_LEAD}
                    titleStyle={[styles.fontFamily, styles.fontWhiteColor, styles.smallFontSize]}
                    buttonStyle={[styles.buttonSize, styles.bgPurpleColor]}
                />
            </View>
        </View>
    )

    const renderSuccessModal = () => (
        <View style={[styles.flexAlign, styles.flexLayout, styles.bgMatteColor]}>
            <View style={[styles.bgWhiteColor, styles.successModalSize]}>
                <View style={[styles.defPaddingHorizontal, styles.flexAlign]}>
                    <Image
                        style={styles.createSuccessIcon}
                        source={require('../../../../../../assets/image/icon-success.png')}
                    />
                    <CText numberOfLines={3} style={[styles.successMsg, styles.fontBold]}>
                        {showName}&nbsp;{t.labels.PBNA_MOBILE_AT}&nbsp;{objLead.Street__c}&nbsp;
                        {t.labels.PBNA_MOBILE_SUCCESSFUL_ADDED_AS_A_LEAD}!
                    </CText>
                </View>
                {renderSucButton()}
            </View>
        </View>
    )

    const handlePressCustomerTile = async (customer) => {
        if (customer.ExternalId) {
            global.$globalModal.openModal()
            try {
                const res = await SoupService.retrieveDataFromSoup(
                    'RetailStore',
                    {},
                    [],
                    'SELECT {RetailStore:Id} FROM {RetailStore} ' +
                        `WHERE {RetailStore:AccountId}='${customer.ExternalId}'`
                )
                if (res.length > 0) {
                    navigation.navigate('CustomerDetailScreen', {
                        customer: { AccountId: customer.ExternalId }
                    })
                    global.$globalModal.closeModal()
                } else {
                    const { data } = await compositeQueryObjsBySoql(
                        genSingleRetailStoreRelationshipCompositeGroup(customer.ExternalId)
                    )
                    global.$globalModal.closeModal()
                    if (data[0].body.records.length > 0) {
                        navigation.navigate('CustomerDetailScreen', {
                            customer: { AccountId: customer.ExternalId },
                            needDelete: true
                        })
                    }
                }
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'handlePressCustomerTile', ErrorUtils.error2String(e))
                global.$globalModal.closeModal()
            }
        }
    }

    const dupLeadItems = () => {
        return (
            <View style={[styles.flexLayout, styles.bgWhiteColor, styles.largeMargin, styles.defPaddingHorizontal]}>
                {dupAcctList
                    .map((item) => {
                        return {
                            ...item,
                            'Account.change_initiated__c': item.Change_Initiated,
                            Name: item.LastName,
                            'Account.Phone': item.Phone,
                            AccountId: item.ExternalId
                        }
                    })
                    .map((item) => {
                        return (
                            <TouchableOpacity
                                key={item.ExternalId}
                                onPress={() => {
                                    handlePressCustomerTile(item)
                                }}
                            >
                                <CustomerListTile customer={item} showShadow />
                            </TouchableOpacity>
                        )
                    })}
                {dupItemList.map((item) => {
                    return <SearchLeadTile l={item} navigation={navigation} key={item.Id} />
                })}
            </View>
        )
    }

    const debounceSetText = _.debounce((v) => {
        setRelatedCustomerSearchVal(v)
    }, 500)

    return (
        <View>
            <SafeAreaView style={styles.bgWhiteColor}>
                <View style={styles.fullHeight}>
                    <View style={[styles.bgWhiteColor, styles.fullHeight, styles.defPaddingHorizontal]}>
                        <Modal
                            animationType="fade"
                            transparent
                            visible={showSuccess}
                            onRequestClose={() => {
                                setShowSuccess(!showSuccess)
                            }}
                        >
                            {renderSuccessModal()}
                        </Modal>
                        <View style={[styles.topBlock]}>
                            <CText style={styles.titleFont}>{t.labels.PBNA_MOBILE_ADD_A_NEW_LEAD}</CText>
                            <TouchableOpacity
                                style={styles.iconTouch}
                                onPress={() => {
                                    navigation.navigate('Leads')
                                }}
                            >
                                <Image
                                    source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                                    style={styles.closeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <KeyboardAwareScrollView style={styles.formBlock} showsVerticalScrollIndicator={false}>
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
                                value={{
                                    Street__c: '',
                                    City__c: '',
                                    State__c: '',
                                    Country__c: CommonParam.CountryCode === 'CA' ? 'Canada' : 'United States',
                                    PostalCode__c: ''
                                }}
                            />
                            <PickerTile
                                data={[
                                    t.labels.PBNA_MOBILE_SELECT_LEAD_TYPE,
                                    ...leadTypeMapping.map((v) => {
                                        return v.k
                                    })
                                ]}
                                label={t.labels.PBNA_MOBILE_LEAD_TYPE}
                                title={t.labels.PBNA_MOBILE_LEAD_TYPE}
                                disabled={false}
                                defValue={''}
                                placeholder={t.labels.PBNA_MOBILE_SELECT}
                                required
                                cRef={leadTypeRef}
                                onChange={(item) => {
                                    setObjLead({
                                        ...objLead,
                                        Lead_Type_c__c: _.find(leadTypeMapping, (value) => value.k === item)?.v
                                    })
                                }}
                            />
                            {objLead.Lead_Type_c__c === 'Additional Outlet' && (
                                <View style={styles.paddingHorizontal_10}>
                                    <SearchablePicklist
                                        label={t.labels.PBNA_MOBILE_ORIGINAL_CUSTOMER_OPTIONAL}
                                        labelStyle={styles.labelStyle}
                                        data={relatedCustomerList}
                                        showValue={(v) => {
                                            return `${v?.Name} ${v?.CUST_UNIQ_ID_VAL__c}`
                                        }}
                                        defValue={''}
                                        onSearchChange={(v) => {
                                            debounceSetText(v)
                                        }}
                                        onClear={() => {
                                            setObjLead({
                                                ...objLead,
                                                original_customer_number_c__c: '',
                                                original_customer_c__c: ''
                                            })
                                        }}
                                        onApply={async (v) => {
                                            setObjLead({
                                                ...objLead,
                                                original_customer_number_c__c: v?.CUST_UNIQ_ID_VAL__c,
                                                original_customer_c__c: v.Id
                                            })
                                        }}
                                    />
                                </View>
                            )}
                            <PhoneNumberInput
                                label={t.labels.PBNA_MOBILE_PHONE_NUMBER}
                                placeholder={'(000) 000-0000'}
                                onChange={(value) => {
                                    setObjLead({
                                        ...objLead,
                                        Phone__c: value
                                    })
                                }}
                            />
                            <EmailAddressInput
                                cRef={emailInputRef}
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
                                    channelLabel: t.labels.PBNA_MOBILE_BUSINESS_CHANNEL_OPTIONAL,
                                    segmentLabel: t.labels.PBNA_MOBILE_BUSINESS_SEGMENT_OPTIONAL,
                                    subSegmentLabel: t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT_OPTIONAL
                                }}
                                lstChannel={channelList}
                                mapSegment={segmentList}
                                mapSubSegment={subSegmentList}
                                cRef={leadHierarchyRef}
                            />
                            <View style={styles.paddingHorizontal_10}>
                                <SearchablePicklist
                                    label={`${t.labels.PBNA_MOBILE_LOCATION_NAME}`}
                                    labelStyle={styles.labelStyle}
                                    data={locationList}
                                    showValue={(v) => {
                                        return v?.SLS_UNIT_NM__c
                                    }}
                                    defValue={''}
                                    onSearchChange={(v) => setLocationSearchValue(v)}
                                    onApply={async (v) => {
                                        const parentNode = await getParentRoute(v.SLS_UNIT_ID__c, 'Location')
                                        setObjLead({
                                            ...objLead,
                                            Location_c__c: v.SLS_UNIT_NM__c,
                                            Location_ID_c__c: v.SLS_UNIT_ID__c,
                                            Market_c__c: parentNode.Parent_Node__r?.SLS_UNIT_NM__c,
                                            Market_ID_c__c: parentNode.Parent_Node__r?.SLS_UNIT_ID__c,
                                            Region_c__c: parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c,
                                            Region_ID_c__c: parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_ID__c
                                        })
                                    }}
                                />
                            </View>
                            <View style={styles.blankView} />
                        </KeyboardAwareScrollView>
                    </View>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={() => {
                    navigation.navigate('Leads')
                }}
                onPressSave={checkIsDuplicate}
                disableSave={showAddButton}
            />
            <Modalize
                ref={modalizeRef}
                HeaderComponent={renderHeader()}
                FloatingComponent={renderFooter()}
                closeSnapPointStraightEnabled={false}
                adjustToContentHeight
                closeOnOverlayTap={false}
                scrollViewProps={{ showsVerticalScrollIndicator: false }}
            >
                {dupLeadItems()}
            </Modalize>
        </View>
    )
}

export default NewLeadCreation
