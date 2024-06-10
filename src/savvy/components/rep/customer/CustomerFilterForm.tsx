/**
 * @description //Filter Form for MyCustomerPage
 * @author Kiren Cao
 * @date 2022/1/17
 */

import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../common/components/CText'
import CollapseContainer from '../../common/CollapseContainer'
import { Input } from 'react-native-elements'
import _ from 'lodash'
import {
    businessSegmentFilterObj,
    cityZipFilterObj,
    getCancelEquipmentRequestsList,
    getCustomerCreatedDateMap,
    getCustomerDateTextList,
    getFilterLabel,
    getFilterText,
    getNationalFlagList,
    getOpenEquipmentRequestsList,
    setFilterText,
    getScheduleList,
    employeesFilterObj,
    getDeliveryTimeframeList
} from '../../../utils/LeadCustomerFilterUtils'
import {
    renderButtonGroup,
    renderCheckBoxGroup,
    renderFilterButton,
    SelectEmployeeSection
} from '../../../helper/rep/FilterLeadListLocationHelper'
import SearchablePicklist from '../lead/common/SearchablePicklist'
import PickerTile from '../lead/common/PickerTile'
import { useKeyAccount } from '../../../hooks/CustomerHooks'
import { useFilterBusinessSegment } from '../../../hooks/LeadHooks'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { isNullSpace } from '../../manager/helper/MerchManagerHelper'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager } from '../../../../common/enums/Persona'

interface CustomerFilterFormProps {
    customerFilterList: any
    setCustomerFilterList: any
    busSegFilterList: any
    setBusSegFilterList: any
    cityZipFilterList: any
    setCityZipFilterList: any
    requestFilterList: any
    setRequestFilterList: any
    selectedEmployees: any
    setSelectedEmployees: any
    employeesFilterList: any
    setEmployeesFilterList: any
    cRef?: any
}

const styles = StyleSheet.create({
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Gotham',
        marginBottom: 30
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Gotham',
        color: '#565656'
    },
    titleLabel: {
        fontSize: 18,
        fontFamily: 'Gotham',
        color: '#000000',
        fontWeight: '900'
    },
    sectionContainer: {
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
        marginVertical: 15,
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
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    nationFlagMsgStyle: {
        color: '#565656',
        marginTop: 10,
        fontSize: 14
    }
})

const CustomerFilterForm: FC<CustomerFilterFormProps> = (props: CustomerFilterFormProps) => {
    const {
        customerFilterList,
        setCustomerFilterList,
        busSegFilterList,
        setBusSegFilterList,
        cityZipFilterList,
        setCityZipFilterList,
        requestFilterList,
        setRequestFilterList,
        selectedEmployees,
        setSelectedEmployees,
        employeesFilterList,
        setEmployeesFilterList,
        cRef
    } = props
    const [searchV, setSearchV] = useState('')
    const keyAccount = useKeyAccount(searchV)
    const businessSegList = useFilterBusinessSegment()
    const [showBusinessSeg, setShowBusinessSeg] = useState(!_.isEqual(busSegFilterList, businessSegmentFilterObj))
    const [showCityZip, setShowCityZip] = useState(!_.isEqual(cityZipFilterList, cityZipFilterObj))
    const [showRequest, setShowRequest] = useState(!_.isEmpty(requestFilterList.request))
    const [showRequestCancel, setShowRequestCancel] = useState(!_.isEmpty(requestFilterList.requestCancel))
    const [showCreatedDate, setShowCreateDate] = useState(!_.isEmpty(customerFilterList.customerCreatedDate))
    const [showNationalFlag, setShowNationalFlag] = useState(!_.isEmpty(customerFilterList.nationalFlag))
    const [showKeyAccount, setShowKeyAccount] = useState(!_.isEmpty(customerFilterList.keyAccount))
    const [showSelectEmployee, setShowSelectEmployee] = useState(!_.isEqual(employeesFilterList, employeesFilterObj))
    const pickModalRef = useRef(null)
    const pickListRef = useRef(null)
    const nationalFlagList = getNationalFlagList()
    const customerCreatedDateMap = getCustomerCreatedDateMap()
    const customerDateTextList = getCustomerDateTextList()
    const [openEquipmentRequestsList, setOpenEquipmentRequestsList] = useState([])
    const [cancelEquipmentRequestsList, setCancelEquipmentRequestsList] = useState([])
    const scheduleList = getScheduleList('customer')
    const [showSchedule, setShowSchedule] = useState(!_.isEmpty(customerFilterList.scheduledTasks))
    const deliveryTimeframe = getDeliveryTimeframeList()
    const [showDeliveryTimeframe, setShowDeliveryTimeframe] = useState(
        !_.isEmpty(customerFilterList.deliveryTimeframes)
    )
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
                showContent={showCreatedDate}
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
                    labelStyle={styles.labelStyle}
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
                    }}
                    required
                    title={''}
                    borderStyle={{}}
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
                showContent={showBusinessSeg}
                setShowContent={setShowBusinessSeg}
                title={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                titleStyle={styles.sectionLabel}
                containerStyle={styles.sectionContainer}
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
                titleStyle={styles.sectionLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <View style={styles.inputContainer}>
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
                        }}
                    />
                    <Input
                        value={getFilterText('zip', 'PostalCode__c', cityZipFilterList)}
                        label={t.labels.PBNA_MOBILE_ZIP.toUpperCase()}
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
            <CollapseContainer
                showContent={showNationalFlag}
                setShowContent={setShowNationalFlag}
                title={t.labels.PBNA_MOBILE_NATIONAL_FLAG}
                titleStyle={styles.sectionLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <CText style={styles.nationFlagMsgStyle}>{t.labels.PBNA_MOBILE_NATIONAL_FLAG_MSG}</CText>
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
                    label={isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                    data={keyAccount}
                    showValue={(v) => {
                        return v.Name
                    }}
                    defValue={getFilterText('keyAccount', 'Account.ParentId', customerFilterList)}
                    onSearchChange={(v) => {
                        setSearchV(v)
                    }}
                    onApply={(v) => {
                        setFilterText(
                            'keyAccount',
                            {
                                fieldName: 'Account.ParentId',
                                value: v.Name,
                                complex: true,
                                params: `{RetailStore:Account.ParentId} IN (SELECT {Account:Id} From {Account} WHERE {Account:ParentId} = '${v.Id}')`
                            },
                            customerFilterList,
                            setCustomerFilterList
                        )
                    }}
                />
            </CollapseContainer>
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
                        customerFilterList,
                        setCustomerFilterList,
                        t.labels.PBNA_MOBILE_SCHEDULED_TASKS
                    )}
                </View>
            </CollapseContainer>
            {!isPersonaCRMBusinessAdmin() && (
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
            )}
            {isPersonaFSManager() && (
                <CollapseContainer
                    showContent={showSelectEmployee}
                    setShowContent={setShowSelectEmployee}
                    title={`${t.labels.PBNA_MOBILE_EMPLOYEES}`}
                    titleStyle={styles.sectionLabel}
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
        </View>
    )
}

export default CustomerFilterForm
