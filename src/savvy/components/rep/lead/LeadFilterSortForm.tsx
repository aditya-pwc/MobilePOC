/**
 * @description Component of sort filter modal for lead
 * @author Sheng Huang
 * @date 2021/10/22
 */
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import React, { FC, useImperativeHandle, useState } from 'react'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeadFilterForm from '../LeadFilterForm'
import LeadSortForm from './LeadSortForm'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import { teamQuery } from '../../../queries/LeadQueries'
import {
    EmployeesFilter,
    employeesFilterObj,
    getFilterQuery,
    getSortQuery,
    leadFilterObj
} from '../../../utils/LeadCustomerFilterUtils'
import { t } from '../../../../common/i18n/t'
import { formatString } from '../../../utils/CommonUtils'
import { isPersonaFSManager } from '../../../../common/enums/Persona'
import { getRecordTypeIdByDeveloperName } from '../../../utils/MerchManagerUtils'
import FilterSortQueries from '../../../queries/FilterSortQueries'

interface LeadFilterSortFormProps {
    cRef: any
    geolocation: any
    isAllLead: boolean
    onApply?: any
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
    keyboardAwareScrollView: {
        paddingTop: 30,
        marginHorizontal: '5%'
    }
})

const EXTRA_HEIGHT = 60

const LeadFilterSortForm: FC<LeadFilterSortFormProps> = (props: LeadFilterSortFormProps) => {
    const { cRef, isAllLead, onApply, geolocation } = props
    const [showForm, setShowForm] = useState(false)
    const [filterList, setFilterList] = useState(leadFilterObj)
    const [sortList, setSortList] = useState([])
    const [tempFilterList, setTempFilterList] = useState(leadFilterObj)
    const [tempSortList, setTempSortList] = useState([])
    const [employeesFilterList, setEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [tempEmployeesFilterList, setTempEmployeesFilterList] = useState<EmployeesFilter>(employeesFilterObj)
    const [selectedEmployees, setSelectedEmployees] = useState({})
    const [tempSelectedEmployees, setTempSelectedEmployees] = useState({})

    const openModal = () => {
        setShowForm(true)
    }

    const closeModal = () => {
        setShowForm(false)
        setTempSortList(sortList)
        setTempFilterList(filterList)
        setTempEmployeesFilterList(employeesFilterList)
        setTempSelectedEmployees(selectedEmployees)
    }
    const reset = () => {
        setTempFilterList(leadFilterObj)
        setTempSortList([])
        setTempEmployeesFilterList(employeesFilterObj)
        setFilterList(leadFilterObj)
        setSortList([])
        setEmployeesFilterList(employeesFilterObj)
        setSelectedEmployees({})
        setTempSelectedEmployees({})
    }

    const handlePressCancel = () => {
        reset()
    }

    const handlePressSave = async () => {
        const tempFilter = _.cloneDeep(tempFilterList)
        const tempEmployeesList = _.cloneDeep(tempEmployeesFilterList)
        if (
            _.isEqual(tempFilter, leadFilterObj) &&
            _.isEmpty(tempSortList) &&
            _.isEqual(tempEmployeesList, employeesFilterObj)
        ) {
            onApply('')
        } else {
            let query
            if (isAllLead) {
                query = formatString(FilterSortQueries.filterAllLeadsQuery.q, [
                    geolocation.longitude,
                    geolocation.longitude,
                    geolocation.latitude,
                    geolocation.latitude
                ])
            } else {
                const managerId = await getRecordTypeIdByDeveloperName('Manager_Relationship', 'User_Stats__c')
                const queryGPID = isPersonaFSManager()
                    ? `AND {Lead__x:Lead_Type_c__c} != 'Change of Ownership' ${formatString(teamQuery, [
                          managerId || '',
                          CommonParam.userId
                      ])}`
                    : `AND {Lead__x:Owner_GPID_c__c} = '${CommonParam.GPID__c}'  AND {Lead__x:Lead_Type_c__c}!='Change of Ownership' `
                query =
                    formatString(FilterSortQueries.filterMyLeadsQuery.q, [
                        geolocation.longitude,
                        geolocation.longitude,
                        geolocation.latitude,
                        geolocation.latitude
                    ]) +
                    (_.isEqual(tempFilter, leadFilterObj)
                        ? 'WHERE {Lead__x:Status__c} = "Negotiate" '
                        : 'WHERE {Lead__x:Status__c} != "Open" ') +
                    queryGPID
            }
            query = getFilterQuery(tempFilter, query, 'Lead__x')
            if (!_.isEmpty(tempEmployeesList.employees)) {
                const employeesFilterId = tempEmployeesList.employees.map((item) => item.GPID).join("', '")
                const temp = `{Lead__x:Owner_GPID_c__c} in ('${employeesFilterId}')`
                const tempEmployees: EmployeesFilter = {
                    employees: [
                        {
                            fieldName: 'Owner_GPID_c__c',
                            value: temp,
                            params: temp,
                            complex: true
                        }
                    ]
                }
                query = getFilterQuery(tempEmployees, query, 'RetailStore')
            }
            if (tempSortList.length !== 0) {
                query = `${query} ${getSortQuery(tempSortList, 'Lead__x')}`
            } else {
                query = `${query} ${FilterSortQueries.filterAllLeadsQuery.s}`
            }
            onApply(query)
        }
        setFilterList(tempFilterList)
        setSortList(tempSortList)
        setEmployeesFilterList(tempEmployeesList)
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
                style={styles.keyboardAwareScrollView}
                extraHeight={EXTRA_HEIGHT}
                showsVerticalScrollIndicator={false}
            >
                <LeadFilterForm
                    filterList={tempFilterList}
                    setFilterList={setTempFilterList}
                    isAllLead={isAllLead}
                    employeesFilterList={tempEmployeesFilterList}
                    selectedEmployees={tempSelectedEmployees}
                    setEmployeesFilterList={setTempEmployeesFilterList}
                    setSelectedEmployees={setTempSelectedEmployees}
                />
                <LeadSortForm
                    sortList={tempSortList}
                    setSortList={setTempSortList}
                    isAllLead={isPersonaFSManager() || isAllLead}
                />
                <View style={{ height: EXTRA_HEIGHT }} />
            </KeyboardAwareScrollView>
            <FormBottomButton
                onPressCancel={handlePressCancel}
                onPressSave={handlePressSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_APPLY.toUpperCase()}
                leftButtonLabel={t.labels.PBNA_MOBILE_RESET.toUpperCase()}
                relative
            />
        </Modal>
    )
}

export default LeadFilterSortForm
