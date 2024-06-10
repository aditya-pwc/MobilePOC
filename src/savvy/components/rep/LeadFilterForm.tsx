/**
 * @description Component of filter form in lead screen
 * @author Sheng Huang
 * @date 2021/10/26
 */

import React, { FC, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import CollapseContainer from '../common/CollapseContainer'
import { Input } from 'react-native-elements'
import _ from 'lodash'
import { useFilterRoute } from '../../hooks/UserHooks'
import {
    employeesFilterObj,
    getCustomerNumberList,
    getFilterText,
    getLeadStatusList,
    getLeadTypeList,
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
import { useFilterBusinessSegment } from '../../hooks/LeadHooks'
import { t } from '../../../common/i18n/t'
import { CommonParam } from '../../../common/CommonParam'
import { isPersonaFSManager } from '../../../common/enums/Persona'

interface LeadFilterFormProps {
    filterList: any
    setFilterList: any
    isAllLead: boolean
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
        fontFamily: 'Gotham'
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Gotham',
        color: '#565656'
    },
    sectionContainer: {
        height: 40,
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
        marginVertical: 30,
        height: 30,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sortItemLabel: {
        width: '33%',
        fontSize: 12,
        color: '#565656'
    },
    collapseCont: {
        marginTop: 20
    },
    inputCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    bottom15: {
        marginBottom: 15
    }
})

const LeadFilterForm: FC<LeadFilterFormProps> = (props: LeadFilterFormProps) => {
    const {
        filterList,
        setFilterList,
        isAllLead,
        selectedEmployees,
        setSelectedEmployees,
        employeesFilterList,
        setEmployeesFilterList,
        cRef
    } = props
    const routeNumber = useFilterRoute(CommonParam.userId)
    const businessSegList = useFilterBusinessSegment()
    const [showPreQ, setShowPreQ] = useState(!_.isEmpty(filterList.preQualified))
    const [showLeadsStat, setShowLeadsStat] = useState(!_.isEmpty(filterList.leadStatus))
    const [showCustomerNum, setShowCustomerNum] = useState(!_.isEmpty(filterList.customerNumber))
    const [showBusinessSeg, setShowBusinessSeg] = useState(!_.isEmpty(filterList.businessSegment))
    const [showSuggestRoute, setShowSuggestRoute] = useState(!_.isEmpty(filterList.suggestedFSRoute))
    const [showCityZip, setShowCityZip] = useState(!_.isEmpty(filterList.city) || !_.isEmpty(filterList.zip))
    const [showLeadType, setShowLeadType] = useState(!_.isEmpty(filterList.leadType))
    const [showTier, setShowTier] = useState(!_.isEmpty(filterList.tier))
    const [showSchedule, setShowSchedule] = useState(!_.isEmpty(filterList.scheduledTasks))
    const [showSelectEmployee, setShowSelectEmployee] = useState(!_.isEqual(employeesFilterList, employeesFilterObj))
    const pickModalRef = useRef(null)

    const preQList = getPreQList()

    const tierList = getTierList()

    const leadStatusList = getLeadStatusList(isAllLead)

    const customerNumberList = getCustomerNumberList()

    const leadTypeList = getLeadTypeList()

    const scheduleList = getScheduleList()

    useImperativeHandle(cRef, () => ({
        reset: () => {
            pickModalRef.current?.resetNull()
        }
    }))

    return (
        <View>
            <CText style={styles.filterTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
            <View style={styles.collapseCont}>
                <CollapseContainer
                    showContent={showPreQ}
                    setShowContent={setShowPreQ}
                    title={t.labels.PBNA_MOBILE_PRE_QUALIFIED}
                    titleStyle={styles.sectionLabel}
                    containerStyle={styles.sectionContainer}
                    chevronStyle={styles.chevronStyle}
                    noTopLine
                >
                    {renderCheckBoxGroup(preQList, filterList, setFilterList, true)}
                </CollapseContainer>
            </View>
            <CollapseContainer
                showContent={showLeadsStat}
                setShowContent={setShowLeadsStat}
                title={t.labels.PBNA_MOBILE_LEAD_STATUS}
                titleStyle={styles.sectionLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <View style={styles.blockItem}>{renderButtonGroup(leadStatusList, filterList, setFilterList)}</View>
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
                <View style={styles.blockItem}>{renderButtonGroup(tierList, filterList, setFilterList)}</View>
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
                <View style={styles.blockItem}>{renderButtonGroup(customerNumberList, filterList, setFilterList)}</View>
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
                <View style={styles.blockItem}>{renderButtonGroup(leadTypeList, filterList, setFilterList)}</View>
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
                <View style={styles.blockItem}>{renderCheckBoxGroup(businessSegList, filterList, setFilterList)}</View>
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
                <View style={styles.inputCont}>
                    <Input
                        value={getFilterText('city', 'City__c', filterList)}
                        label={t.labels.PBNA_MOBILE_CITY}
                        labelStyle={styles.inputLabelStyle}
                        inputStyle={styles.inputTextStyle}
                        containerStyle={[styles.noPaddingHorizontal, styles.halfItem]}
                        onChangeText={(v) => {
                            setFilterText(
                                'city',
                                { fieldName: 'City__c', value: `%%${v}%%`, operator: 'LIKE' },
                                filterList,
                                setFilterList
                            )
                        }}
                    />
                    <Input
                        value={getFilterText('zip', 'PostalCode__c', filterList)}
                        label={t.labels.PBNA_MOBILE_ZIP}
                        inputStyle={styles.inputTextStyle}
                        labelStyle={styles.inputLabelStyle}
                        containerStyle={[styles.noPaddingHorizontal, styles.halfItem]}
                        onChangeText={(v) => {
                            setFilterText(
                                'zip',
                                { fieldName: 'PostalCode__c', value: `%%${v}%%`, operator: 'LIKE' },
                                filterList,
                                setFilterList
                            )
                        }}
                    />
                </View>
            </CollapseContainer>
            <CollapseContainer
                showContent={showSuggestRoute}
                setShowContent={setShowSuggestRoute}
                title={t.labels.PBNA_MOBILE_SUGGESTED_FS_ROUTE}
                titleStyle={styles.sectionLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
            >
                <View style={styles.bottom15}>{renderRouteCheckBox(routeNumber, filterList, setFilterList)}</View>
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
                    {renderFilterButton(scheduleList, filterList, setFilterList, t.labels.PBNA_MOBILE_SCHEDULED_TASKS)}
                </View>
            </CollapseContainer>
            {isPersonaFSManager() && !isAllLead && (
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

export default LeadFilterForm
