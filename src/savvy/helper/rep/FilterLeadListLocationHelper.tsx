import LeadCheckBox from '../../components/rep/lead/common/LeadCheckBox'
import CText from '../../../common/components/CText'
import {
    employeesFilterObj,
    FilterObject,
    FilterValue,
    getFilterSelected,
    getSort,
    getSortSelected,
    LeadFilter,
    setFilterListSelected,
    setFilterSelected,
    setFilterText,
    setSort
} from '../../utils/LeadCustomerFilterUtils'
import CapsuleButton from '../../components/rep/lead/common/CapsuleButton'
import { Image, Modal, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { Button, CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../common/CommonParam'
import FilterSelectEmployeeModal from '../../components/rep/lead/FilterSelectEmployeeModal'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { CommonLabel } from '../../enums/CommonLabel'

const styles = StyleSheet.create({
    checkboxLabel: {
        fontSize: 14,
        fontFamily: 'Gotham-Book',
        color: '#000000',
        fontWeight: '400'
    },
    checkBoxContainer: {
        padding: 0,
        backgroundColor: '#FFFFFF',
        height: 35
    },
    checkedDefIcon: {
        width: 20,
        height: 20,
        marginRight: 0
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
        marginTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        borderColor: '#D3D3D3'
    },
    checkedIcon: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 6,
        marginRight: 5
    },
    unCheckedIcon: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 1,
        marginRight: 5
    },
    radioContainer: {
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: '400'
    },
    radioTile: {
        flexDirection: 'row',
        marginTop: 30,
        height: 30,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sortItemLabel: {
        width: '33%',
        fontSize: 12,
        color: '#565656'
    },
    sortSectionBackground: {
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 0.4,
        paddingVertical: 20,
        borderColor: '#D3D3D3'
    },
    shadowButton: {
        width: '50%',
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: -1
        },
        shadowOpacity: 0.3,
        shadowRadius: 6
    },
    buttonSize: {
        borderRadius: 0,
        height: 55
    },
    buttonText: {
        fontFamily: 'Gotham-Bold',
        fontSize: 12
    },
    leadCheckBoxText: {
        marginHorizontal: 10,
        color: '#565656'
    },
    leadCheckBoxBlockText: {
        color: 'black'
    },
    checkedIconSize: {
        width: 26,
        height: 26,
        margin: -3
    },
    checkBoxWidth: {
        width: '80%'
    },
    modalContentView: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    modalContentViewBackground: {
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        zIndex: 2,
        width: '90%',
        maxHeight: '70%'
    },
    modalContentViewWidth: {
        paddingHorizontal: 20,
        marginBottom: 75
    },
    modalContentViewWeight: {
        fontSize: 12,
        fontWeight: '700'
    },
    modalContentViewPosition: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        zIndex: 1
    },
    titleColor: {
        color: '#6C0CC3'
    },
    buttonStyle: {
        backgroundColor: '#ffffff',
        borderBottomStartRadius: 8
    },
    buttonTitleColor: {
        color: '#D3D3D3'
    },
    buttonBackgroundColor: {
        backgroundColor: '#6C0CC3',
        borderBottomEndRadius: 8
    },
    buttonDisableColor: {
        backgroundColor: 'white'
    },
    paddingHeight: { height: 50 },
    disabledRadioStyle: {
        borderColor: '#D3D3D3'
    },
    radioStyle: {
        borderColor: '#565656'
    },
    selectedRadioStyle: {
        borderColor: '#00A2D9'
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
    contentContainer: {
        flex: 1
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
    }
})

export const renderRouteCheckBox = (
    routeNumber: Array<any>,
    filterList: LeadFilter,
    setFilterList: Dispatch<SetStateAction<LeadFilter>>
) => {
    const filterRoute = (v, k) => {
        return (
            <LeadCheckBox
                outerForm
                editable
                title={
                    <CText numberOfLines={2} style={styles.leadCheckBoxText}>
                        {t.labels.PBNA_MOBILE_LEADS_NEAR_MY_ROUTE}
                        <CText style={styles.leadCheckBoxBlockText}>
                            {' '}
                            ({t.labels.PBNA_MOBILE_NATIONAL_ROUTE_NUMBER}: {v.NationalId})
                        </CText>
                    </CText>
                }
                textStyle={styles.checkboxLabel}
                containerStyle={styles.checkBoxContainer}
                checkedIconStyles={styles.checkedDefIcon}
                key={k}
                checked={getFilterSelected(
                    'suggestedFSRoute',
                    { fieldName: 'Suggested_FSR_Nat_Route_Number_c__c', value: v.GTMUId },
                    filterList
                )}
                onChange={() => {
                    setFilterSelected(
                        'suggestedFSRoute',
                        { fieldName: 'Suggested_FSR_Nat_Route_Number_c__c', value: v.GTMUId },
                        filterList,
                        setFilterList
                    )
                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select 'Suggested Route Filter'`, 1)
                }}
                checkedIcon={<Image source={ImageSrc.IMG_CHECK} style={styles.checkedIconSize} />}
                uncheckedIcon={<Image source={ImageSrc.IMG_LEAD_UNCHECKED_BLUE} style={styles.checkedDefIcon} />}
            />
        )
    }

    if (_.isEmpty(routeNumber)) {
        return (
            <LeadCheckBox
                outerForm
                editable
                title={
                    <CText numberOfLines={2} style={styles.leadCheckBoxText}>
                        {t.labels.PBNA_MOBILE_LEADS_NEAR_MY_ROUTE}
                        <CText style={styles.leadCheckBoxBlockText}>
                            {` (${t.labels.PBNA_MOBILE_NO_FOODSERVICE_ROUTE_ASSIGNED})`}
                        </CText>
                    </CText>
                }
                textStyle={styles.checkboxLabel}
                containerStyle={styles.checkBoxContainer}
                checkedIconStyles={styles.checkedDefIcon}
                checked={getFilterSelected(
                    'suggestedFSRoute',
                    {
                        fieldName: 'Suggested_FSR_Nat_Route_Number_c__c',
                        value: null
                    },
                    filterList
                )}
                onChange={() => {
                    setFilterSelected(
                        'suggestedFSRoute',
                        {
                            fieldName: 'Suggested_FSR_Nat_Route_Number_c__c',
                            value: null
                        },
                        filterList,
                        setFilterList
                    )
                }}
                checkedIcon={<Image source={ImageSrc.IMG_CHECK} style={styles.checkedIconSize} />}
                uncheckedIcon={<Image source={ImageSrc.IMG_LEAD_UNCHECKED_BLUE} style={styles.checkedDefIcon} />}
            />
        )
    }
    return <>{_.map(routeNumber, filterRoute)}</>
}
export const renderButtonGroup = (
    list: Array<any>,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>,
    title?: string
) => {
    const renderButton = (v, k) => {
        return (
            <CapsuleButton
                label={v.label}
                onChange={() => {
                    setFilterSelected(v.groupName, v.value, filterList, setFilterList)
                    if (title === t.labels.PBNA_MOBILE_OPEN_EQUIPMENT_REQUESTS) {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} select filtering by equipment open order filter`,
                            1
                        )
                    } else if (title === t.labels.PBNA_MOBILE_EQUIPMENT_CANCELLATIONS_LAST_30_DAYS) {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} select filtering by cancelled last 30 days filter`,
                            1
                        )
                    } else {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                    }
                }}
                checked={getFilterSelected(v.groupName, v.value, filterList)}
                key={k}
            />
        )
    }
    return <>{_.map(list, renderButton)}</>
}

export const renderCheckBoxGroup = (
    list: Array<any>,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>,
    allLine: boolean = false
) => {
    const renderCheckBox = (v, k) => {
        return (
            <View style={{ width: allLine ? '100%' : '50%' }} key={k}>
                <LeadCheckBox
                    outerForm
                    editable
                    title={v.label}
                    onChange={() => {
                        setFilterSelected(v.groupName, v.value, filterList, setFilterList)
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                    }}
                    checked={getFilterSelected(v.groupName, v.value, filterList)}
                    textStyle={styles.checkboxLabel}
                    containerStyle={styles.checkBoxContainer}
                    checkedIconStyles={styles.checkedDefIcon}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK} style={styles.checkedIconSize} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_LEAD_UNCHECKED_BLUE} style={styles.checkedDefIcon} />}
                />
            </View>
        )
    }
    return <>{_.map(list, renderCheckBox)}</>
}

export const renderSortPickList = (weight: number, sortList, setShowPickList, setTempSortList) => {
    const disabled = !getSort(weight - 1, sortList) && weight !== 0
    return (
        <TouchableOpacity
            onPress={() => {
                setShowPickList(weight + 1)
                setTempSortList(sortList)
                Instrumentation.reportMetric(`${CommonParam.PERSONA__c} selects a sort`, 1)
            }}
            disabled={disabled}
        >
            <View style={styles.pickerContainer}>
                <CText>{sortList[weight]?.label || t.labels.PBNA_MOBILE_NONE}</CText>
                <View style={[disabled ? styles.grayIcon : styles.blueIcon, styles.downIconContainer]} />
            </View>
        </TouchableOpacity>
    )
}

export const RadioButton = (props: {
    title: string
    onPress: any
    disabled: boolean
    checked: any
    filter?: boolean
}) => {
    return (
        <CheckBox
            title={
                <View style={styles.checkBoxWidth}>
                    <CText
                        numberOfLines={2}
                        style={[
                            props.filter ? { fontSize: 14 } : { fontSize: 10 },
                            styles.radioLabel,
                            props.disabled ? { color: '#D3D3D3' } : { color: '#000000' }
                        ]}
                    >
                        {props.title}
                    </CText>
                </View>
            }
            onPress={() => {
                props.onPress()
            }}
            disabled={props.disabled}
            checked={props.checked}
            checkedIcon={
                <View
                    style={[props.disabled ? styles.disabledRadioStyle : styles.selectedRadioStyle, styles.checkedIcon]}
                />
            }
            uncheckedIcon={
                <View style={[props.disabled ? styles.disabledRadioStyle : styles.radioStyle, styles.unCheckedIcon]} />
            }
            containerStyle={[
                props.filter ? { width: '45%' } : { width: '33%' },
                props.title.length > 20 ? { height: props.filter ? 35 : 25 } : {},
                styles.radioContainer
            ]}
            textStyle={[props.filter ? { fontSize: 14 } : { fontSize: 12 }, styles.radioLabel]}
        />
    )
}

export const renderFilterButton = (
    list: Array<any>,
    filterList: FilterObject,
    setFilterList: Dispatch<SetStateAction<FilterObject>>,
    title?: any
) => {
    const renderButton = (v, k) => {
        return (
            <RadioButton
                title={v.label}
                onPress={() => {
                    setFilterText(v.groupName, v.value, filterList, setFilterList)
                    if (title === t.labels.PBNA_MOBILE_SCHEDULED_TASKS) {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select 'Task Filter'`, 1)
                    }
                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} select a filter`, 1)
                }}
                disabled={false}
                checked={getFilterSelected(v.groupName, v.value, filterList)}
                key={k}
                filter
            />
        )
    }
    return <>{_.map(list, renderButton)}</>
}

export const renderSortForm = (list, sortList, weight, tempSortList, setTempSortList) => {
    const renderSortButton = (v: { title; button1; button2 }, k) => {
        let disabled = false
        for (let i = 0; i < sortList.length; i++) {
            if (i === weight) {
                continue
            }
            if (sortList[i]?.fieldName === v.button1.fieldName || sortList[i]?.fieldName === v.button2.fieldName) {
                disabled = true
            }
        }
        return (
            <View style={styles.radioTile} key={k}>
                <CText style={styles.sortItemLabel} numberOfLines={3}>
                    {v.title}
                </CText>
                <RadioButton
                    title={v.button1.title}
                    onPress={() => {
                        setSort(v.title, v.button1, weight, tempSortList, setTempSortList)
                    }}
                    disabled={disabled}
                    checked={getSortSelected(v.button1.fieldName, v.button1.order, tempSortList)}
                />
                <RadioButton
                    title={v.button2.title}
                    onPress={() => {
                        setSort(v.title, v.button2, weight, tempSortList, setTempSortList)
                    }}
                    disabled={disabled}
                    checked={getSortSelected(v.button2.fieldName, v.button2.order, tempSortList)}
                />
            </View>
        )
    }
    return (
        <ScrollView>
            {_.map(list, renderSortButton)}
            <View style={styles.paddingHeight} />
        </ScrollView>
    )
}

export const SortModal = (props: {
    showPickList
    setShowPickList
    sortButtonList
    sortList
    setSortList
    tempSortList
    setTempSortList
    title
}) => {
    const {
        showPickList,
        setShowPickList,
        sortButtonList,
        sortList,
        setSortList,
        tempSortList,
        setTempSortList,
        title
    } = props
    return (
        <Modal animationType="fade" transparent visible={Boolean(showPickList)}>
            <View style={styles.modalContentView}>
                <View style={styles.modalContentViewBackground}>
                    <View style={styles.modalContentViewWidth}>
                        <View style={styles.sortSectionBackground}>
                            <CText style={styles.modalContentViewWeight}>{title}</CText>
                        </View>
                        {renderSortForm(sortButtonList, sortList, showPickList - 1, tempSortList, setTempSortList)}
                    </View>
                    <View style={styles.modalContentViewPosition}>
                        <View style={styles.shadowButton}>
                            <Button
                                onPress={() => {
                                    setShowPickList(0)
                                    setTempSortList([])
                                }}
                                title={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                                titleStyle={[styles.buttonText, styles.titleColor]}
                                containerStyle={styles.buttonSize}
                                buttonStyle={[styles.buttonSize, styles.buttonStyle]}
                            />
                        </View>
                        <View style={styles.shadowButton}>
                            <Button
                                onPress={() => {
                                    setSortList(tempSortList)
                                    setShowPickList(0)
                                }}
                                disabled={tempSortList.length === 0}
                                title={t.labels.PBNA_MOBILE_SAVE}
                                titleStyle={[styles.buttonText, styles.buttonTitleColor]}
                                containerStyle={styles.buttonSize}
                                buttonStyle={[styles.buttonSize, styles.buttonBackgroundColor]}
                                disabledStyle={[styles.buttonSize, styles.buttonDisableColor]}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

interface SelectEmployeeProps {
    selectedEmployees: any
    setSelectedEmployees: any
    employeesFilterList: any
    setEmployeesFilterList: any
}
export const SelectEmployeeSection: FC<SelectEmployeeProps> = (props: SelectEmployeeProps) => {
    const { selectedEmployees, setSelectedEmployees, employeesFilterList, setEmployeesFilterList } = props
    const filterEmployeeRef = useRef(null)
    const [selectedTempArr, setSelectedTempArr] = useState([])
    const onRemoveEmployees = (item: any) => {
        const tempEmployees = _.cloneDeep(selectedEmployees)
        delete tempEmployees[item]
        const tempEmployee = Object.values(tempEmployees)
        const tempEmployeesList: (FilterValue & { GPID: string })[] = []
        _.forEach(tempEmployee, (v: any) => {
            tempEmployeesList.push({
                fieldName: 'Owner_GPID_c__c',
                value: v.Id,
                GPID: v.GPID__c
            })
        })
        setFilterListSelected(
            'employees',
            tempEmployeesList,
            employeesFilterList,
            setEmployeesFilterList,
            employeesFilterObj
        )
        setSelectedEmployees(tempEmployees)
    }
    const showEmployees = () => {
        if (!_.isEmpty(selectedEmployees)) {
            const selectedArr = Object.values(selectedEmployees).sort(function (a: any, b: any) {
                const nameA = a.Name.toUpperCase()
                const nameB = b.Name.toUpperCase()
                if (nameA < nameB) {
                    return CommonLabel.NUMBER_MINUS_ONE
                }
                if (nameA > nameB) {
                    return CommonLabel.NUMBER_ONE
                }
                return CommonLabel.NUMBER_ZERO
            })
            setSelectedTempArr(selectedArr)
        } else {
            setSelectedTempArr([])
        }
    }

    useEffect(() => {
        showEmployees()
    }, [selectedEmployees, employeesFilterList])
    return (
        <>
            <View>
                <CText style={styles.selectTitle}>{t.labels.PBNA_MOBILE_SELECT_EMPLOYEES}</CText>
                <TouchableOpacity
                    onPress={() => {
                        filterEmployeeRef.current?.open()
                    }}
                >
                    <View style={styles.searchImgContain}>
                        <Image style={styles.searchImg} source={ImageSrc.IMG_SEARCH} />
                        <CText style={styles.searchText}>{` ${t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}`}</CText>
                    </View>
                </TouchableOpacity>
                {Object.keys(selectedEmployees).length > 0 && (
                    <View style={[styles.contentContainer]}>
                        <View style={styles.addedCont} />
                        <CText style={styles.addedText}>
                            {`${_.capitalize(t.labels.PBNA_MOBILE_EMPLOYEES_ADDED)} `} (
                            {Object.keys(selectedEmployees).length})
                        </CText>
                        <View style={styles.selectedContainer}>
                            {selectedTempArr.map((item) => {
                                return (
                                    <View style={styles.subTypeCell} key={item.Id}>
                                        <CText style={styles.employeesText}>{item.Name}</CText>
                                        <TouchableOpacity
                                            onPress={() => onRemoveEmployees(item.Id)}
                                            style={styles.clearSubTypeContainer}
                                        >
                                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}
            </View>
            <FilterSelectEmployeeModal
                cRef={filterEmployeeRef}
                selectedEmployees={_.cloneDeep(selectedEmployees)}
                setSelectedEmployees={setSelectedEmployees}
                employeesFilterList={employeesFilterList}
                setEmployeesFilterList={setEmployeesFilterList}
            />
        </>
    )
}
