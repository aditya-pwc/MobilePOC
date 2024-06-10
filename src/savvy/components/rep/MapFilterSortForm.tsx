/**
 * @description Component of sort filter modal for lead
 * @author Sheng Huang
 * @date 2021/10/29
 */

import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import React, { FC, useImperativeHandle, useRef, useState } from 'react'
import { CommonParam } from '../../../common/CommonParam'
import _ from 'lodash'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormBottomButton from '../../../common/components/FormBottomButton'
import {
    assembleCustomerFilterForBackend,
    assembleLeadFilterForBackend,
    BusinessSegmentFilter,
    businessSegmentFilterObj,
    changeBusSegNameToCde,
    CityZipFilter,
    cityZipFilterObj,
    CustomerFilter,
    customerFilterObj,
    EmployeesFilter,
    employeesFilterObj,
    getFilterQuery,
    getSortQuery,
    LeadFilter,
    leadFilterObj,
    RequestFilter,
    requestFilterObj
} from '../../utils/LeadCustomerFilterUtils'
import MapSortForm from './MapSortForm'
import MapFilterForm from './MapFilterForm'
import { t } from '../../../common/i18n/t'
import { formatString } from '../../utils/CommonUtils'
import { useMyTeamList } from '../../hooks/UserHooks'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { isPersonaCRMBusinessAdmin } from '../../../common/enums/Persona'
import { useBusinessSegmentPicklist } from '../../hooks/LeadHooks'
import FilterSortQueries from '../../queries/FilterSortQueries'

interface MapFilterSortFormProps {
    cRef: any
    leadQuery?: any
    customerQuery: any
    setShowLeads?: (showLeads: boolean) => void
    setShowCustomers?: (showCustomers: boolean) => void
    geolocation?: any
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        marginTop: 60,
        ...commonStyle.alignCenter,
        position: 'relative',
        marginBottom: 20
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    btnBack: {
        position: 'absolute',
        left: 22
    },
    imgBack: {
        width: 12,
        height: 20
    },
    line: {
        height: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: '5%'
    },
    mapFilterCont: {
        paddingTop: 20,
        marginHorizontal: '5%'
    },
    emptyView: {
        height: 40
    }
})

const EXTRA_HEIGHT = 60
const MapFilterSortForm: FC<MapFilterSortFormProps> = (props: MapFilterSortFormProps) => {
    const { cRef, leadQuery, customerQuery, setShowLeads, setShowCustomers, geolocation } = props
    const [showForm, setShowForm] = useState(false)
    const [leadFilterList, setLeadFilterList] = useState<LeadFilter>(leadFilterObj)
    const [customerFilterList, setCustomerFilterList] = useState<CustomerFilter>(customerFilterObj)
    const [busSegFilterList, setBusSegFilterList] = useState<BusinessSegmentFilter>(businessSegmentFilterObj)
    const [cityZipFilterList, setCityZipFilterList] = useState<CityZipFilter>(cityZipFilterObj)
    const [employeesFilterList, setEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [requestFilterList, setRequestFilterList] = useState<RequestFilter>(requestFilterObj)
    const [selectedEmployees, setSelectedEmployees] = useState({})
    const [leadSortList, setLeadSortList] = useState([])
    const [mapSortList, setMapSortList] = useState([])
    const [tempLeadFilterList, setTempLeadFilterList] = useState<LeadFilter>(leadFilterObj)
    const [tempCustomerFilterList, setTempCustomerFilterList] = useState<CustomerFilter>(customerFilterObj)
    const [tempBusSegFilterList, setTempBusSegFilterList] = useState<BusinessSegmentFilter>(businessSegmentFilterObj)
    const [tempCityZipFilterList, setTempCityZipFilterList] = useState<CityZipFilter>(cityZipFilterObj)
    const [tempEmployeesFilterList, setTempEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [tempRequestFilterList, setTempRequestFilterList] = useState<RequestFilter>(requestFilterObj)
    const [tempSelectedEmployees, setTempSelectedEmployees] = useState({})
    const [tempLeadSortList, setTempLeadSortList] = useState([])
    const [tempMapSortList, setTempMapSortList] = useState([])
    const [showAllLeads, setShowAllLeads] = useState(false)
    const [showAllCustomer, setShowAllCustomer] = useState(false)
    const teamList = useMyTeamList(false)
    const filterRef = useRef(null)
    const { segmentOption } = useBusinessSegmentPicklist()

    const openModal = () => {
        setShowForm(true)
    }

    const closeModal = () => {
        setShowForm(false)
        setTempLeadFilterList(leadFilterList)
        setTempLeadSortList(leadSortList)
        setTempCustomerFilterList(customerFilterList)
        setTempMapSortList(mapSortList)
        setTempBusSegFilterList(busSegFilterList)
        setTempEmployeesFilterList(employeesFilterList)
        setTempSelectedEmployees(selectedEmployees)
        setTempCityZipFilterList(cityZipFilterList)
        setTempRequestFilterList(requestFilterList)
    }
    const reset = () => {
        setTempLeadFilterList(leadFilterObj)
        setTempLeadSortList([])
        setTempCustomerFilterList(customerFilterObj)
        setTempMapSortList([])
        setTempBusSegFilterList(businessSegmentFilterObj)
        setTempEmployeesFilterList(employeesFilterObj)
        setTempSelectedEmployees({})
        setTempCityZipFilterList(cityZipFilterObj)
        setTempRequestFilterList(requestFilterObj)
        setLeadFilterList(leadFilterObj)
        setLeadSortList([])
        setCustomerFilterList(customerFilterObj)
        setMapSortList([])
        setBusSegFilterList(businessSegmentFilterObj)
        setEmployeesFilterList(employeesFilterObj)
        setSelectedEmployees({})
        setCityZipFilterList(cityZipFilterObj)
        setRequestFilterList(requestFilterObj)
        setShowAllLeads(false)
        setShowAllCustomer(false)
        filterRef.current?.reset()
    }

    const handlePressCancel = () => {
        reset()
    }

    const processLeadQuery = () => {
        const tempFilterList = _.cloneDeep(tempLeadFilterList)
        const tempBusSegList = _.cloneDeep(tempBusSegFilterList)
        const tempCityZipList = _.cloneDeep(tempCityZipFilterList)
        const tempEmployeesList = _.cloneDeep(tempEmployeesFilterList)
        if (
            !showAllLeads &&
            _.isEqual(tempBusSegList, businessSegmentFilterObj) &&
            _.isEqual(tempEmployeesList, employeesFilterObj) &&
            _.isEqual(tempCityZipList, cityZipFilterObj) &&
            _.isEmpty(tempLeadSortList)
        ) {
            return ''
        }
        if (isPersonaCRMBusinessAdmin()) {
            if (!_.isEqual(tempEmployeesList, employeesFilterObj)) {
                return assembleLeadFilterForBackend(
                    tempFilterList,
                    tempLeadSortList,
                    tempBusSegList,
                    tempCityZipList,
                    tempEmployeesList,
                    showAllLeads,
                    segmentOption
                )
            }
            return ''
        }
        let query = formatString(FilterSortQueries.filterMapLeadsQuery.q, [
            geolocation.longitude,
            geolocation.longitude,
            geolocation.latitude,
            geolocation.latitude
        ])
        switch (tempFilterList.leads.length) {
            case 1:
                if (tempFilterList.leads[0].value === 'MyLeads') {
                    query =
                        query +
                        `AND {Lead__x:Status__c} != "Open" AND {Lead__x:Owner_GPID_c__c} = '${CommonParam.GPID__c}' `
                } else if (tempFilterList.leads[0].value === 'OpenLeads') {
                    query = query + 'AND {Lead__x:Status__c} = "Open" '
                } else if (tempFilterList.leads[0].value === 'MyTeamLeads') {
                    const employeesFilterId = teamList.map((item) => item.GPID__c).join("', '")
                    query =
                        query +
                        `AND {Lead__x:Status__c} != "Open" AND {Lead__x:Owner_GPID_c__c} in ('${employeesFilterId}')`
                }
                break
            case 0:
            case 2:
            default:
                break
        }
        if (showAllLeads) {
            if (_.isEmpty(tempFilterList.leadStatus)) {
                tempFilterList.leadStatus.push({ fieldName: 'Status__c', value: 'No Sale', operator: '!=' })
            }
            query = getFilterQuery(tempFilterList, query, 'Lead__x')
        }
        query = getFilterQuery(tempCityZipList, query, 'Lead__x')
        changeBusSegNameToCde(tempBusSegList, segmentOption, 'Lead')
        query = getFilterQuery(tempBusSegList, query, 'Lead__x')
        tempEmployeesList.employees.forEach((value) => {
            value.value = value.GPID
        })
        if (!_.isEmpty(tempEmployeesList.employees)) {
            query = getFilterQuery(tempEmployeesList, query, 'Lead__x')
        }
        if (tempLeadSortList.length !== 0) {
            query = `${query} ${getSortQuery(tempLeadSortList, 'Lead__x')}`
        } else {
            query = `${query} ${FilterSortQueries.filterMapLeadsQuery.s}`
        }
        return query
    }

    const processCustomerQuery = () => {
        const tempFilterList = _.cloneDeep(tempCustomerFilterList)
        const tempBusSegList = _.cloneDeep(tempBusSegFilterList)
        const tempMapCityZipList = _.cloneDeep(tempCityZipFilterList)
        const tempEmployeesList = _.cloneDeep(tempEmployeesFilterList)
        const tempRequestList = _.cloneDeep(tempRequestFilterList)
        if (
            !showAllCustomer &&
            _.isEqual(tempBusSegList, businessSegmentFilterObj) &&
            _.isEqual(tempEmployeesList, employeesFilterObj) &&
            _.isEqual(tempMapCityZipList, cityZipFilterObj) &&
            _.isEqual(tempRequestList, requestFilterObj) &&
            _.isEmpty(tempMapSortList)
        ) {
            return ''
        }
        if (isPersonaCRMBusinessAdmin()) {
            if (!_.isEqual(tempEmployeesList, employeesFilterObj)) {
                return assembleCustomerFilterForBackend(
                    tempCustomerFilterList,
                    tempMapSortList,
                    tempBusSegList,
                    tempMapCityZipList,
                    tempEmployeesList,
                    tempRequestFilterList,
                    showAllCustomer,
                    segmentOption
                )
            }
            return ''
        }
        let query = formatString(FilterSortQueries.filterMapCustomersQuery.q, [
            geolocation.longitude,
            geolocation.longitude,
            geolocation.latitude,
            geolocation.latitude
        ])
        if (showAllCustomer) {
            query = getFilterQuery(tempFilterList, query, 'RetailStore')
            query = getFilterQuery(tempRequestList, query, 'RetailStore')
        }
        tempMapCityZipList.city.forEach((value) => {
            value.fieldName = 'City'
        })
        tempMapCityZipList.zip.forEach((value) => {
            value.fieldName = 'PostalCode'
        })
        query = getFilterQuery(tempMapCityZipList, query, 'RetailStore')
        changeBusSegNameToCde(tempBusSegList, segmentOption, 'Customer')
        query = getFilterQuery(tempBusSegList, query, 'RetailStore')
        if (!_.isEmpty(tempEmployeesList.employees)) {
            const employeesFilterId = tempEmployeesList.employees.map((item) => item.value).join("', '")
            const temp =
                '{RetailStore:AccountId} in (SELECT {AccountTeamMember:AccountId} ' +
                'FROM {AccountTeamMember} ' +
                `WHERE {AccountTeamMember:UserId} IN ('${employeesFilterId}'))`
            const tempEmployees: EmployeesFilter = {
                employees: [
                    {
                        fieldName: 'AccountId',
                        value: temp,
                        params: temp,
                        complex: true
                    }
                ]
            }
            query = getFilterQuery(tempEmployees, query, 'RetailStore')
        }
        if (tempMapSortList.length !== 0) {
            query = `${query} ${getSortQuery(tempMapSortList, 'RetailStore')}`
        } else {
            query = `${query} ${FilterSortQueries.filterMapCustomersQuery.s}`
        }
        return query
    }

    const handlePressSave = async () => {
        leadQuery(processLeadQuery())
        customerQuery(processCustomerQuery())
        if (showAllCustomer === showAllLeads) {
            setShowLeads(true)
            setShowCustomers(true)
        } else if (showAllCustomer) {
            setShowLeads(false)
            setShowCustomers(true)
        } else if (showAllLeads) {
            setShowLeads(true)
            setShowCustomers(false)
        }
        setShowForm(false)
        setLeadFilterList(tempLeadFilterList)
        setLeadSortList(tempLeadSortList)
        setCustomerFilterList(tempCustomerFilterList)
        setMapSortList(tempMapSortList)
        setBusSegFilterList(tempBusSegFilterList)
        setEmployeesFilterList(tempEmployeesFilterList)
        setSelectedEmployees(tempSelectedEmployees)
        setCityZipFilterList(tempCityZipFilterList)
        setRequestFilterList(tempRequestFilterList)
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
    }

    useImperativeHandle(cRef, () => ({
        open: () => {
            openModal()
        },
        close: () => {
            closeModal()
        }
    }))
    return (
        <Modal style={styles.safeArea} visible={showForm} animationType={'fade'}>
            <View style={styles.header}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_SORT_FILTER}</CText>
                <TouchableOpacity
                    style={styles.btnBack}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        closeModal()
                    }}
                >
                    <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <KeyboardAwareScrollView
                style={styles.mapFilterCont}
                extraHeight={EXTRA_HEIGHT}
                showsVerticalScrollIndicator={false}
            >
                <MapFilterForm
                    leadFilterList={tempLeadFilterList}
                    setLeadFilterList={setTempLeadFilterList}
                    customerFilterList={tempCustomerFilterList}
                    setCustomerFilterList={setTempCustomerFilterList}
                    busSegFilterList={tempBusSegFilterList}
                    setBusSegFilterList={setTempBusSegFilterList}
                    employeesFilterList={tempEmployeesFilterList}
                    setEmployeesFilterList={setTempEmployeesFilterList}
                    setSelectedEmployees={setTempSelectedEmployees}
                    selectedEmployees={tempSelectedEmployees}
                    cityZipFilterList={tempCityZipFilterList}
                    setCityZipFilterList={setTempCityZipFilterList}
                    showAllLeads={showAllLeads}
                    setShowAllLeads={setShowAllLeads}
                    showAllCustomer={showAllCustomer}
                    setShowAllCustomer={setShowAllCustomer}
                    cRef={filterRef}
                    requestFilterList={tempRequestFilterList}
                    setRequestFilterList={setTempRequestFilterList}
                />
                <View style={styles.emptyView} />
                <MapSortForm
                    leadSortList={tempLeadSortList}
                    setLeadSortList={setTempLeadSortList}
                    mapSortList={tempMapSortList}
                    setMapSortList={setTempMapSortList}
                />
                <View style={{ height: EXTRA_HEIGHT }} />
            </KeyboardAwareScrollView>
            <FormBottomButton
                onPressCancel={handlePressCancel}
                onPressSave={handlePressSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_APPLY}
                leftButtonLabel={t.labels.PBNA_MOBILE_RESET}
                relative
                disableSave={
                    isPersonaCRMBusinessAdmin() &&
                    _.isEqual(employeesFilterObj, tempEmployeesFilterList) &&
                    !(
                        _.isEqual(businessSegmentFilterObj, tempBusSegFilterList) &&
                        _.isEqual(cityZipFilterObj, tempCityZipFilterList) &&
                        _.isEqual(requestFilterObj, tempRequestFilterList) &&
                        _.isEmpty(tempMapSortList) &&
                        _.isEmpty(tempLeadSortList) &&
                        _.isEqual(customerFilterObj, tempCustomerFilterList) &&
                        _.isEqual(leadFilterObj, tempLeadFilterList)
                    )
                }
            />
        </Modal>
    )
}

export default MapFilterSortForm
