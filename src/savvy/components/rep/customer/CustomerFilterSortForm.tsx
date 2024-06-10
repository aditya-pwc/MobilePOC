/**
 * @description //Filter Sort Form for MyCustomerPage
 * @author Kiren Cao
 * @date 2022/1/17
 */

import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import React, { FC, useImperativeHandle, useRef, useState } from 'react'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import {
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
    RequestFilter,
    requestFilterObj
} from '../../../utils/LeadCustomerFilterUtils'
import { t } from '../../../../common/i18n/t'
import CustomerFilterForm from './CustomerFilterForm'
import CustomerSortForm from './CustomerSortForm'
import { formatString } from '../../../utils/CommonUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { useBusinessSegmentPicklist } from '../../../hooks/LeadHooks'
import FilterSortQueries from '../../../queries/FilterSortQueries'
import { isPersonaFSManager } from '../../../../common/enums/Persona'

interface CustomerFilterSortFormProps {
    cRef: any
    customerQuery: any
    geolocation: any
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
    container: {
        paddingTop: 20,
        marginHorizontal: '5%'
    },
    height_30: { height: 30 }
})

const EXTRA_HEIGHT = 60
const CustomerFilterSortForm: FC<CustomerFilterSortFormProps> = (props: CustomerFilterSortFormProps) => {
    const { cRef, customerQuery, geolocation } = props
    const [showForm, setShowForm] = useState(false)
    const [customerFilterList, setCustomerFilterList] = useState<CustomerFilter>(customerFilterObj)
    const [busSegFilterList, setBusSegFilterList] = useState<BusinessSegmentFilter>(businessSegmentFilterObj)
    const [cityZipFilterList, setCityZipFilterList] = useState<CityZipFilter>(cityZipFilterObj)
    const [requestFilterList, setRequestFilterList] = useState<RequestFilter>(requestFilterObj)
    const [employeesFilterList, setEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [customerSortList, setCustomerSortList] = useState([])
    const [selectedEmployees, setSelectedEmployees] = useState({})
    const [tempCustomerFilterList, setTempCustomerFilterList] = useState<CustomerFilter>(customerFilterObj)
    const [tempBusSegFilterList, setTempBusSegFilterList] = useState<BusinessSegmentFilter>(businessSegmentFilterObj)
    const [tempCityZipFilterList, setTempCityZipFilterList] = useState<CityZipFilter>(cityZipFilterObj)
    const [tempRequestFilterList, setTempRequestFilterList] = useState<RequestFilter>(requestFilterObj)
    const [tempEmployeesFilterList, setTempEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [tempCustomerSortList, setTempCustomerSortList] = useState([])
    const [tempSelectedEmployees, setTempSelectedEmployees] = useState({})
    const filterRef = useRef(null)
    const { segmentOption } = useBusinessSegmentPicklist()
    const openModal = () => {
        setShowForm(true)
    }

    const closeModal = () => {
        setShowForm(false)
        setTempCustomerFilterList(customerFilterList)
        setTempCustomerSortList(customerSortList)
        setTempBusSegFilterList(busSegFilterList)
        setTempCityZipFilterList(cityZipFilterList)
        setTempRequestFilterList(requestFilterList)
        setTempEmployeesFilterList(employeesFilterList)
        setTempSelectedEmployees(selectedEmployees)
    }
    const reset = () => {
        setTempCustomerFilterList(customerFilterObj)
        setTempCustomerSortList([])
        setTempBusSegFilterList(businessSegmentFilterObj)
        setTempCityZipFilterList(cityZipFilterObj)
        setTempRequestFilterList(requestFilterObj)
        setTempEmployeesFilterList(employeesFilterObj)
        setTempSelectedEmployees({})
        setCustomerFilterList(customerFilterObj)
        setCustomerSortList([])
        setBusSegFilterList(businessSegmentFilterObj)
        setCityZipFilterList(cityZipFilterObj)
        setRequestFilterList(requestFilterObj)
        setEmployeesFilterList(employeesFilterObj)
        setSelectedEmployees({})
        filterRef.current?.reset()
    }

    const handlePressCancel = () => {
        reset()
    }
    const calculateQuery = () => {
        if (isPersonaFSManager()) {
            return FilterSortQueries.filterCustomerListQuery.q + FilterSortQueries.filterCustomerListQuery.fsmCondition
        }
        return FilterSortQueries.filterCustomerListQuery.q + FilterSortQueries.filterCustomerListQuery.fsrCondition
    }
    const processCustomerQuery = () => {
        const tempFilterList = _.cloneDeep(tempCustomerFilterList)
        const tempBusSegList = _.cloneDeep(tempBusSegFilterList)
        const tempCityZipList = _.cloneDeep(tempCityZipFilterList)
        const tempRequestList = _.cloneDeep(tempRequestFilterList)
        const tempEmployeesList = _.cloneDeep(tempEmployeesFilterList)
        if (
            _.isEqual(tempBusSegList, businessSegmentFilterObj) &&
            _.isEmpty(tempRequestFilterList.request) &&
            _.isEmpty(tempRequestFilterList.requestCancel) &&
            _.isEqual(tempCityZipList, cityZipFilterObj) &&
            _.isEmpty(tempCustomerFilterList.customerCreatedDate) &&
            _.isEmpty(tempCustomerFilterList.nationalFlag) &&
            _.isEmpty(tempCustomerFilterList.keyAccount) &&
            _.isEmpty(tempCustomerFilterList.scheduledTasks) &&
            _.isEmpty(tempCustomerFilterList.deliveryTimeframes) &&
            _.isEqual(tempEmployeesList, employeesFilterObj) &&
            _.isEmpty(tempCustomerSortList)
        ) {
            return ''
        }
        let query = formatString(calculateQuery(), [
            geolocation.longitude,
            geolocation.longitude,
            geolocation.latitude,
            geolocation.latitude,
            CommonParam.userId
        ])
        query = getFilterQuery(tempRequestList, query, 'RetailStore')
        query = getFilterQuery(tempFilterList, query, 'RetailStore')
        tempCityZipList.city.forEach((value) => {
            value.fieldName = 'City'
        })
        tempCityZipList.zip.forEach((value) => {
            value.fieldName = 'PostalCode'
        })
        query = getFilterQuery(tempCityZipList, query, 'RetailStore')
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
        if (tempCustomerSortList.length !== 0) {
            query = `${query} ${getSortQuery(tempCustomerSortList, 'RetailStore')}`
        } else {
            query = `${query} ${FilterSortQueries.filterCustomerListQuery.s}`
        }
        return query
    }

    const handlePressSave = async () => {
        customerQuery(processCustomerQuery())
        setCustomerFilterList(tempCustomerFilterList)
        setCustomerSortList(tempCustomerSortList)
        setBusSegFilterList(tempBusSegFilterList)
        setCityZipFilterList(tempCityZipFilterList)
        setRequestFilterList(tempRequestFilterList)
        setEmployeesFilterList(tempEmployeesFilterList)
        setSelectedEmployees(tempSelectedEmployees)
        setShowForm(false)
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
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_SORT_AND_FILTER}</CText>
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
                style={styles.container}
                extraHeight={EXTRA_HEIGHT}
                showsVerticalScrollIndicator={false}
            >
                <CustomerFilterForm
                    customerFilterList={tempCustomerFilterList}
                    setCustomerFilterList={setTempCustomerFilterList}
                    busSegFilterList={tempBusSegFilterList}
                    setBusSegFilterList={setTempBusSegFilterList}
                    cityZipFilterList={tempCityZipFilterList}
                    setCityZipFilterList={setTempCityZipFilterList}
                    requestFilterList={tempRequestFilterList}
                    setRequestFilterList={setTempRequestFilterList}
                    employeesFilterList={tempEmployeesFilterList}
                    setEmployeesFilterList={setTempEmployeesFilterList}
                    selectedEmployees={tempSelectedEmployees}
                    setSelectedEmployees={setTempSelectedEmployees}
                    cRef={filterRef}
                />
                <View style={styles.height_30} />
                <CustomerSortForm
                    customerSortList={tempCustomerSortList}
                    setCustomerSortList={setTempCustomerSortList}
                />
                <View style={{ height: EXTRA_HEIGHT }} />
            </KeyboardAwareScrollView>
            <FormBottomButton
                onPressCancel={handlePressCancel}
                onPressSave={handlePressSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_APPLY}
                leftButtonLabel={t.labels.PBNA_MOBILE_RESET}
                relative
            />
        </Modal>
    )
}

export default CustomerFilterSortForm
