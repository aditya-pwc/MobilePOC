import React, { useEffect, useState, useImperativeHandle } from 'react'
import { View, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import styles from '../../../styles/manager/SelectTeamModalStyle'
import { t } from '../../../../common/i18n/t'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { getSameLocationManagerTeamMember, SelectTeamOption } from '../helper/AsDirectEmployeeHelper'
import { Persona } from '../../../../common/enums/Persona'
import _ from 'lodash'
const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE

interface SelectTeamProps {
    data: any[]
    setData: any
    originalData
    cRef: any
    persona: Persona.MERCH_MANAGER | Persona.DELIVERY_SUPERVISOR
    searchText?: string
    filterEmployeeBySearchText?: any
}

const SelectTeamFilter = (props: SelectTeamProps) => {
    const { data, setData, originalData, cRef, persona, filterEmployeeBySearchText, searchText } = props
    const [modalVisible, setModalVisible] = useState(false)
    const [options, setOptions] = useState([])

    const handleApply = (newOptions?) => {
        const optObj = {}
        const selectedManagerIds = []
        const opts = newOptions || options
        opts.forEach((opt) => {
            optObj[opt.mmId] = opt
            if (opt.isChecked) {
                selectedManagerIds.push(opt.mmId)
            }
        })
        let employees = _.cloneDeep(originalData) || []
        if (filterEmployeeBySearchText) {
            employees = filterEmployeeBySearchText({
                searchText: searchText || '',
                users: employees,
                employeeOriginList: employees
            })
        }

        if (optObj['All Employees']?.isChecked) {
            setModalVisible(false)
            setData(employees)
            return
        }
        const isUnassignedChecked = optObj['Team Unassigned']?.isChecked
        const filteredData = employees?.filter((employee) => {
            const isTeamMember = employee?.managerDirects?.split(',').some((id) => {
                return selectedManagerIds.includes(id)
            })
            return isTeamMember || (isUnassignedChecked && _.isEmpty(employee.managerDirects))
        })
        setData(filteredData)
        setModalVisible(false)
    }

    const init = async () => {
        const newOptions = await getSameLocationManagerTeamMember(options, setOptions, persona)
        handleApply(newOptions)
    }

    useImperativeHandle(cRef, () => ({
        refreshSelectTeamFilter: () => {
            init()
        }
    }))

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        handleApply()
    }, [originalData, searchText])

    const handleOptionClicked = (index: number) => {
        const lastOptions: SelectTeamOption[] = JSON.parse(JSON.stringify(options))
        lastOptions[index].isChecked = !lastOptions[index].isChecked
        if (index === 0) {
            lastOptions.forEach((opt) => {
                opt.isChecked = lastOptions[0].isChecked
            })
        } else {
            const optionsExceptFirst = lastOptions.slice(1, lastOptions.length)
            const isAllCheckedExceptFirstOpt = optionsExceptFirst.every((opt) => opt.isChecked)
            lastOptions[0].isChecked = isAllCheckedExceptFirstOpt
        }
        setOptions(lastOptions)
    }

    const getTeamSelectLabel = (): string => {
        const checkedOpts = options.filter((opt) => opt.isChecked)
        if (checkedOpts.length === 1) {
            return checkedOpts[0].text
        }
        if (checkedOpts.length === options.length) {
            return t.labels.PBNA_MOBILE_ALL_EMPLOYEES
        }
        return `${t.labels.PBNA_MOBILE_TEAM_SELECTED} (${checkedOpts.length})`
    }
    return (
        <View>
            <View style={styles.employeeFilterLine}>
                <CText style={commonStyle.marginTop_5}>
                    {data?.length} {t.labels.PBNA_MOBILE_EMPLOYEE}(s)
                </CText>
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(true)
                    }}
                    style={styles.employeeFilterButtonWrap}
                >
                    <CText style={styles.employeeFilterButton}>{getTeamSelectLabel()}</CText>
                    <Image style={styles.triangleDown} source={IMG_TRIANGLE} />
                </TouchableOpacity>
            </View>
            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableOpacity activeOpacity={1} style={styles.centeredView} onPressOut={() => {}}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalView}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalTitle}>
                                    <CText style={[styles.sortTitle, styles.fontSize_14]}>
                                        {t.labels.PBNA_MOBILE_SELECT_TEAM}
                                    </CText>
                                </View>
                                <View style={styles.modalContent}>
                                    {options.map((option, index) => {
                                        return (
                                            <CCheckBox
                                                key={option.mmId}
                                                onPress={() => {
                                                    handleOptionClicked(index)
                                                }}
                                                checked={option.isChecked}
                                                title={
                                                    <View style={commonStyle.flexRowAlignCenter}>
                                                        <CText style={index === 0 && styles.bolder}>
                                                            {option.text}
                                                        </CText>
                                                    </View>
                                                }
                                                containerStyle={[
                                                    styles.checkBoxMulti,
                                                    { marginLeft: 0, marginTop: 20 }
                                                ]}
                                            />
                                        )
                                    })}
                                </View>
                            </View>
                            <View style={styles.modalBtn}>
                                <TouchableOpacity
                                    style={styles.buttonReset}
                                    onPress={() => {
                                        setModalVisible(false)
                                    }}
                                >
                                    <View>
                                        <CText style={styles.resetText}>
                                            {t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonApply}
                                    onPress={() => {
                                        handleApply()
                                    }}
                                >
                                    <View>
                                        <CText style={styles.applyText}>{t.labels.PBNA_MOBILE_APPLY}</CText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SelectTeamFilter
