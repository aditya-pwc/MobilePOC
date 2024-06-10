/**
 * @description Component of filter form in explorer screen
 * @author Sheng Huang
 * @date 2021/11/9
 */

import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import CText from '../../../common/components/CText'
import CollapseContainer from '../common/CollapseContainer'
import { Input } from 'react-native-elements'
import _ from 'lodash'
import { useFilterRoute } from '../../hooks/UserHooks'
import {
    businessSegmentFilterObj,
    cityZipFilterObj,
    employeesFilterObj,
    getCancelEquipmentRequestsList,
    getCustomerCreatedDateMap,
    getCustomerDateTextList,
    getCustomerNumberList,
    getDeliveryTimeframeList,
    getFilterLabel,
    getFilterText,
    getLeadList,
    getLeadStatusList,
    getLeadTypeList,
    getNationalFlagList,
    getOpenEquipmentRequestsList,
    getPreQList,
    getScheduleList,
    getTierList,
    setFilterText
} from '../../utils/LeadCustomerFilterUtils'
import {
    renderButtonGroup,
    renderCheckBoxGroup,
    renderFilterButton,
    renderRouteCheckBox,
    SelectEmployeeSection
} from '../../helper/rep/FilterLeadListLocationHelper'
import SearchablePicklist from './lead/common/SearchablePicklist'
import PickerTile from './lead/common/PickerTile'
import { useKeyAccount } from '../../hooks/CustomerHooks'
import { useFilterBusinessSegment } from '../../hooks/LeadHooks'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager } from '../../../common/enums/Persona'
import { CommonParam } from '../../../common/CommonParam'
import { Instrumentation } from '@appdynamics/react-native-agent'

interface MapFilterFormProps {
    leadFilterList: any
    setLeadFilterList: any
    customerFilterList: any
    setCustomerFilterList: any
    busSegFilterList: any
    setBusSegFilterList: any
    employeesFilterList: any
    setEmployeesFilterList: any
    cityZipFilterList: any
    setCityZipFilterList: any
    showAllLeads: boolean
    setShowAllLeads: (showAllLeads: boolean) => void
    showAllCustomer: boolean
    setShowAllCustomer: (showAllCustomer: boolean) => void
    cRef?: any
    setSelectedEmployees: any
    selectedEmployees: any
    requestFilterList: any
    setRequestFilterList: any
}

const styles = StyleSheet.create({
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Gotham',
        color: '#565656'
    },
    titleLabel: {
        fontSize: 18,
        fontFamily: 'Gotham',
        color: '#000000',
        fontWeight: '900'
    },
    smallTitleLabel: {
        fontSize: 14,
        fontFamily: 'Gotham',
        color: '#000000'
    },
    sectionContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    toggleContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    chevronStyle: {
        width: 18,
        height: 13,
        marginRight: 5
    },
    blockItem: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%'
    },
    halfItem: {
        width: '48%'
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    inputLabelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        fontFamily: 'Gotham'
    },
    inputTextStyle: {
        fontSize: 14,
        fontFamily: 'Gotham'
    },
    segmentBlock: {
        flexDirection: 'row',
        marginVertical: 15,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    grayIcon: {
        borderTopColor: '#D3D3D3'
    },
    downIconContainer: {
        width: 0,
        height: 0,
        marginTop: 6,
        borderWidth: 5,
        borderTopWidth: 5,
        borderColor: 'transparent'
    },
    blueIcon: {
        borderTopColor: '#00A2D9'
    },
    pickerContainer: {
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        marginTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        borderColor: '#D3D3D3'
    },
    radioTile: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 10,
        height: 30,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sortItemLabel: {
        width: '33%',
        fontSize: 12,
        color: '#565656'
    },
    contentContainer: {
        flex: 1
    },
    MB_200: {
        marginBottom: 200
    },
    BorderBottom_none: {
        borderBottomWidth: 0
    },
    selectedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        paddingBottom: 8,
        paddingTop: 10
    },
    subTypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        paddingVertical: 7,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        marginVertical: 4,
        alignItems: 'center'
    },
    employeesText: {
        flexShrink: 1
    },
    clearSubTypeContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    routeBoxBottom: {
        marginBottom: 15
    },
    pickLabelTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    selectTitle: {
        color: '#565656'
    },
    searchImgContain: {
        flexDirection: 'row',
        marginTop: 10
    },
    searchImg: {
        width: 22,
        height: 22
    },
    searchText: {
        top: 3,
        color: '#D3D3D3'
    },
    addedCont: {
        width: 400,
        height: 1,
        backgroundColor: '#D3D3D3',
        marginTop: 5,
        marginBottom: 10
    },
    addedText: {
        color: '#565656'
    },
    cityInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    }
})

const MapFilterForm: FC<MapFilterFormProps> = (props: MapFilterFormProps) => {
    const {
        leadFilterList,
        setLeadFilterList,
        customerFilterList,
        setCustomerFilterList,
        busSegFilterList,
        setBusSegFilterList,
        cityZipFilterList,
        setCityZipFilterList,
        employeesFilterList,
        setEmployeesFilterList,
        showAllLeads,
        setShowAllLeads,
        showAllCustomer,
        setShowAllCustomer,
        setSelectedEmployees,
        selectedEmployees,
        requestFilterList,
        setRequestFilterList,
        cRef
    } = props
    const routeNumber = useFilterRoute(CommonParam.userId)
    const [searchV, setSearchV] = useState('')
    const keyAccount = useKeyAccount(searchV)
    const businessSegList = useFilterBusinessSegment()
    const [showLeads, setShowLeads] = useState(!_.isEmpty(leadFilterList.leads))
    const [showPreQ, setShowPreQ] = useState(!_.isEmpty(leadFilterList.preQualified))
    const [showLeadsStat, setShowLeadsStat] = useState(!_.isEmpty(leadFilterList.leadStatus))
    const [showCustomerNum, setShowCustomerNum] = useState(!_.isEmpty(leadFilterList.customerNumber))
    const [showSelectEmployee, setShowSelectEmployee] = useState(!_.isEqual(employeesFilterList, employeesFilterObj))
    const [showBusinessSeg, setShowBusinessSeg] = useState(!_.isEqual(busSegFilterList, businessSegmentFilterObj))
    const [showSuggestRoute, setShowSuggestRoute] = useState(!_.isEmpty(leadFilterList.suggestedFSRoute))
    const [showCityZip, setShowCityZip] = useState(!_.isEqual(cityZipFilterList, cityZipFilterObj))
    const [showLeadType, setShowLeadType] = useState(!_.isEmpty(leadFilterList.leadType))
    const [showTier, setShowTier] = useState(!_.isEmpty(leadFilterList.tier))
    const [showSchedule, setShowSchedule] = useState(!_.isEmpty(leadFilterList.scheduledTasks))
    const [showCretedDate, setShowCreateDate] = useState(!_.isEmpty(customerFilterList.customerCreatedDate))
    const [showRequest, setShowRequest] = useState(!_.isEmpty(requestFilterList.request))
    const [showRequestCancel, setShowRequestCancel] = useState(!_.isEmpty(requestFilterList.requestCancel))
    const [showNationalFlag, setShowNationalFlag] = useState(!_.isEmpty(customerFilterList.nationalFlag))
    const [showKeyAccount, setShowKeyAccount] = useState(!_.isEmpty(customerFilterList.keyAccount))
    const [openEquipmentRequestsList, setOpenEquipmentRequestsList] = useState([])
    const [cancelEquipmentRequestsList, setCancelEquipmentRequestsList] = useState([])
    const pickModalRef = useRef(null)
    const pickListRef = useRef(null)

    const preQList = getPreQList()

    const leadList = getLeadList()

    const tierList = getTierList()

    const leadStatusList = getLeadStatusList(false, true)

    const customerNumberList = getCustomerNumberList()

    const leadTypeList = getLeadTypeList()

    const scheduleList = getScheduleList()
    const customerScheduleList = getScheduleList('customer')
    const [showCustomerSchedule, setShowCustomerSchedule] = useState(!_.isEmpty(customerFilterList.scheduledTasks))
    const deliveryTimeframe = getDeliveryTimeframeList()
    const [showDeliveryTimeframe, setShowDeliveryTimeframe] = useState(
        !_.isEmpty(customerFilterList.deliveryTimeframes)
    )

    const nationalFlagList = getNationalFlagList()

    const customerCreatedDateMap = getCustomerCreatedDateMap()
    const customerDateTextList = getCustomerDateTextList()
    useImperativeHandle(cRef, () => ({
        reset: () => {
            pickListRef.current?.resetNull()
            pickModalRef.current?.resetNull()
        }
    }))
    useEffect(() => {
        getOpenEquipmentRequestsList().then((res: any[]) => {
            setOpenEquipmentRequestsList(res)
        })
        getCancelEquipmentRequestsList().then((res: any[]) => {
            setCancelEquipmentRequestsList(res)
        })
    }, [])
    return (
        <View>
            <CText style={styles.filterTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
            <CollapseContainer
                showContent={showAllLeads}
                setShowContent={setShowAllLeads}
                title={t.labels.PBNA_MOBILE_ALL_LEADS}
                titleStyle={styles.titleLabel}
                containerStyle={[styles.toggleContainer, { marginTop: 20 }]}
                chevronStyle={styles.chevronStyle}
                noTopLine
                chevronIcon={
                    <Switch
                        value={showAllLeads}
                        onValueChange={(value) => {
                            setShowAllLeads(value)
                        }}
                        ios_backgroundColor={'#565656'}
                    />
                }
            >
                {!isPersonaCRMBusinessAdmin() && (
                    <CollapseContainer
                        showContent={showLeads}
                        setShowContent={setShowLeads}
                        title={_.capitalize(t.labels.PBNA_MOBILE_LEADS)}
                        titleStyle={styles.sectionLabel}
                        containerStyle={styles.sectionContainer}
                        chevronStyle={styles.chevronStyle}
                        noTopLine
                    >
                        <View style={styles.blockItem}>
                            {renderButtonGroup(leadList, leadFilterList, setLeadFilterList)}
                        </View>
                    </CollapseContainer>
                )}
                <CollapseContainer
                    showContent={showPreQ}
                    setShowContent={setShowPreQ}
                    title={t.labels.PBNA_MOBILE_PRE_QUALIFIED}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    {renderCheckBoxGroup(preQList, leadFilterList, setLeadFilterList, true)}
                </CollapseContainer>
                <CollapseContainer
                    showContent={showLeadsStat}
                    setShowContent={setShowLeadsStat}
                    title={t.labels.PBNA_MOBILE_LEAD_STATUS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(leadStatusList, leadFilterList, setLeadFilterList)}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showTier}
                    setShowContent={setShowTier}
                    title={t.labels.PBNA_MOBILE_LEAD_TIER}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(tierList, leadFilterList, setLeadFilterList)}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showCustomerNum}
                    setShowContent={setShowCustomerNum}
                    title={t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(customerNumberList, leadFilterList, setLeadFilterList)}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showLeadType}
                    setShowContent={setShowLeadType}
                    title={t.labels.PBNA_MOBILE_LEAD_TYPE}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(leadTypeList, leadFilterList, setLeadFilterList)}
                    </View>
                </CollapseContainer>
                {!isPersonaCRMBusinessAdmin() && (
                    <CollapseContainer
                        showContent={showSuggestRoute}
                        setShowContent={setShowSuggestRoute}
                        title={t.labels.PBNA_MOBILE_SUGGESTED_FS_ROUTE}
                        titleStyle={styles.sectionLabel}
                        containerStyle={styles.sectionContainer}
                        chevronStyle={styles.chevronStyle}
                        noTopLine
                    >
                        <View style={styles.routeBoxBottom}>
                            {renderRouteCheckBox(routeNumber, leadFilterList, setLeadFilterList)}
                        </View>
                    </CollapseContainer>
                )}
                <CollapseContainer
                    showContent={showSchedule}
                    setShowContent={setShowSchedule}
                    title={t.labels.PBNA_MOBILE_SCHEDULED_TASKS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderFilterButton(
                            scheduleList,
                            leadFilterList,
                            setLeadFilterList,
                            t.labels.PBNA_MOBILE_SCHEDULED_TASKS
                        )}
                    </View>
                </CollapseContainer>
            </CollapseContainer>
            <CollapseContainer
                showContent={showAllCustomer}
                setShowContent={setShowAllCustomer}
                title={t.labels.PBNA_MOBILE_ALL_CUSTOMERS}
                titleStyle={styles.titleLabel}
                containerStyle={styles.toggleContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
                chevronIcon={
                    <Switch
                        value={showAllCustomer}
                        onValueChange={(value) => {
                            setShowAllCustomer(value)
                        }}
                        ios_backgroundColor={'#565656'}
                    />
                }
            >
                <CollapseContainer
                    showContent={showCretedDate}
                    setShowContent={setShowCreateDate}
                    title={t.labels.PBNA_MOBILE_CUSTOMER_CREATED_DATE}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <PickerTile
                        cRef={pickModalRef}
                        data={customerDateTextList}
                        label={''}
                        labelStyle={styles.pickLabelTitle}
                        disabled={false}
                        defValue={getFilterLabel('customerCreatedDate', 'CUST_STRT_DT__c', customerFilterList)}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        noPaddingHorizontal
                        onChange={(v: any) => {
                            setFilterText(
                                'customerCreatedDate',
                                customerCreatedDateMap[_.indexOf(customerDateTextList, v)],
                                customerFilterList,
                                setCustomerFilterList
                            )
                            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                        }}
                        required
                        title={''}
                    />
                </CollapseContainer>
                <CollapseContainer
                    showContent={showRequest}
                    setShowContent={setShowRequest}
                    title={t.labels.PBNA_MOBILE_OPEN_EQUIPMENT_REQUESTS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(
                            openEquipmentRequestsList,
                            requestFilterList,
                            setRequestFilterList,
                            t.labels.PBNA_MOBILE_OPEN_EQUIPMENT_REQUESTS
                        )}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showRequestCancel}
                    setShowContent={setShowRequestCancel}
                    title={t.labels.PBNA_MOBILE_EQUIPMENT_CANCELLATIONS_LAST_30_DAYS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderButtonGroup(
                            cancelEquipmentRequestsList,
                            requestFilterList,
                            setRequestFilterList,
                            t.labels.PBNA_MOBILE_EQUIPMENT_CANCELLATIONS_LAST_30_DAYS
                        )}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showNationalFlag}
                    setShowContent={setShowNationalFlag}
                    title={t.labels.PBNA_MOBILE_NATIONAL_FLAG}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.radioTile}>
                        {renderFilterButton(nationalFlagList, customerFilterList, setCustomerFilterList)}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showKeyAccount}
                    setShowContent={setShowKeyAccount}
                    title={t.labels.PBNA_MOBILE_KEY_ACCOUNT}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <SearchablePicklist
                        cRef={pickListRef}
                        label={''}
                        data={keyAccount}
                        showValue={(v) => {
                            return v.Name
                        }}
                        defValue={getFilterLabel('keyAccount', 'Account.ParentId', customerFilterList)}
                        onSearchChange={(v) => {
                            setSearchV(v)
                        }}
                        onApply={(v) => {
                            setFilterText(
                                'keyAccount',
                                {
                                    fieldName: 'Account.ParentId',
                                    value: v.Id,
                                    label: v.Name,
                                    complex: true,
                                    params: `{RetailStore:Account.ParentId} IN (SELECT {Account:Id} From {Account} WHERE {Account:ParentId} = '${v.Id}')`
                                },
                                customerFilterList,
                                setCustomerFilterList
                            )
                            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                        }}
                    />
                </CollapseContainer>
                <CollapseContainer
                    showContent={showCustomerSchedule}
                    setShowContent={setShowCustomerSchedule}
                    title={t.labels.PBNA_MOBILE_SCHEDULED_TASKS}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderFilterButton(
                            customerScheduleList,
                            customerFilterList,
                            setCustomerFilterList,
                            t.labels.PBNA_MOBILE_SCHEDULED_TASKS
                        )}
                    </View>
                </CollapseContainer>
                <CollapseContainer
                    showContent={showDeliveryTimeframe}
                    setShowContent={setShowDeliveryTimeframe}
                    title={t.labels.PBNA_MOBILE_DELIVERY_TIMEFRAMES}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        {renderFilterButton(
                            deliveryTimeframe,
                            customerFilterList,
                            setCustomerFilterList,
                            t.labels.PBNA_MOBILE_DELIVERY_TIMEFRAMES
                        )}
                    </View>
                </CollapseContainer>
            </CollapseContainer>
            {(isPersonaFSManager() || isPersonaCRMBusinessAdmin()) && (
                <CollapseContainer
                    showContent={showSelectEmployee}
                    setShowContent={setShowSelectEmployee}
                    title={`${t.labels.PBNA_MOBILE_EMPLOYEES}${isPersonaCRMBusinessAdmin() ? '*' : ''}`}
                    titleStyle={styles.titleLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    <View style={styles.blockItem}>
                        <SelectEmployeeSection
                            selectedEmployees={selectedEmployees}
                            setSelectedEmployees={setSelectedEmployees}
                            employeesFilterList={employeesFilterList}
                            setEmployeesFilterList={setEmployeesFilterList}
                        />
                    </View>
                </CollapseContainer>
            )}
            <CollapseContainer
                showContent={showBusinessSeg}
                setShowContent={setShowBusinessSeg}
                title={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                titleStyle={styles.smallTitleLabel}
                containerStyle={styles.toggleContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <View style={styles.blockItem}>
                    {renderCheckBoxGroup(businessSegList, busSegFilterList, setBusSegFilterList)}
                </View>
            </CollapseContainer>
            <CollapseContainer
                showContent={showCityZip}
                setShowContent={setShowCityZip}
                title={t.labels.PBNA_MOBILE_CITY_ZIP}
                titleStyle={styles.smallTitleLabel}
                containerStyle={styles.toggleContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <View style={styles.cityInput}>
                    <Input
                        value={getFilterText('city', 'City__c', cityZipFilterList)}
                        label={t.labels.PBNA_MOBILE_CITY}
                        labelStyle={styles.inputLabelStyle}
                        inputStyle={styles.inputTextStyle}
                        containerStyle={[styles.noPaddingHorizontal, styles.halfItem]}
                        onChangeText={(v) => {
                            setFilterText(
                                'city',
                                { fieldName: 'City__c', value: `%%${v}%%`, operator: 'LIKE' },
                                cityZipFilterList,
                                setCityZipFilterList
                            )
                            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                        }}
                    />
                    <Input
                        value={getFilterText('zip', 'PostalCode__c', cityZipFilterList)}
                        label={t.labels.PBNA_MOBILE_ZIP}
                        inputStyle={styles.inputTextStyle}
                        labelStyle={styles.inputLabelStyle}
                        containerStyle={[styles.noPaddingHorizontal, styles.halfItem]}
                        onChangeText={(v) => {
                            setFilterText(
                                'zip',
                                { fieldName: 'PostalCode__c', value: `%%${v}%%`, operator: 'LIKE' },
                                cityZipFilterList,
                                setCityZipFilterList
                            )
                        }}
                    />
                </View>
            </CollapseContainer>
        </View>
    )
}

export default MapFilterForm
