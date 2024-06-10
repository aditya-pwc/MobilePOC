/**
 * @description Search related methods.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-03-29
 */

import _ from 'lodash'
import React from 'react'
import { TouchableOpacity, Image, View } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import SearchBarFilterStyle from '../../../styles/manager/SearchBarFilterStyle'
import { replaceSpace } from '../../../utils/MerchManagerUtils'
import CCheckBox from '../../../../common/components/CCheckBox'
import CText from '../../../../common/components/CText'
import FavoriteIcon from '../../../../../assets/image/favorite.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'

const styles = SearchBarFilterStyle
const IMG_CLEAR = ImageSrc.IMG_CLEAR

export const renderClearIcon = (needAddBtn, searchText, isCleared, onAddClick, clearIconMethod) => {
    if (needAddBtn && searchText.trim() !== '') {
        return (
            !isCleared && (
                <TouchableOpacity onPress={() => onAddClick(searchText)}>
                    <CText style={[styles.addStyle]}>{t.labels.PBNA_MOBILE_ADD}</CText>
                </TouchableOpacity>
            )
        )
    }
    return (
        !isCleared && (
            <TouchableOpacity onPress={clearIconMethod}>
                <Image style={styles.imgClear} source={IMG_CLEAR} />
            </TouchableOpacity>
        )
    )
}

export const filterEmployees = (originalData, text) => {
    const searchText = text?.toUpperCase().trim()
    const filteredEmployees = []
    originalData?.forEach((employee) => {
        const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
        const gpId = employee.gpid?.toUpperCase()
        if (fullName?.indexOf(searchText) >= 0 || gpId?.indexOf(searchText) >= 0) {
            filteredEmployees.push(employee)
        }
    })
    return filteredEmployees
}

export const filterEmployeeByName = (originalData: Array<any>, text: string) => {
    const searchText = text?.toUpperCase().trim()
    const filteredEmployees: Array<any> = []
    originalData?.forEach((employee) => {
        const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
        if (fullName?.includes(searchText)) {
            filteredEmployees.push(employee)
        }
    })
    return filteredEmployees
}

export const filterAddEmployee = (originEmployeeList, searchText) => {
    if (!searchText) {
        return []
    }
    const tmpFilteredEmployees = filterEmployees(originEmployeeList, searchText)
    const greyCardEmployee = []
    const whiteCardEmployee = []
    tmpFilteredEmployees.forEach((employee) => {
        if (employee?.merchBase) {
            greyCardEmployee.push(employee)
        } else {
            whiteCardEmployee.push(employee)
        }
    })
    return greyCardEmployee.concat(whiteCardEmployee)
}

export const filterAddAttendee = (originEmployeeList, searchText, setEmployeeList) => {
    if (!searchText) {
        setEmployeeList([])
    } else {
        const filteredEmployees = filterEmployees(originEmployeeList, searchText)
        setEmployeeList(filteredEmployees)
    }
}

export const filterCustomer = (originCustomerList, text) => {
    const searchText = replaceSpace(text).toUpperCase()
    const filteredCustomer = []
    _.cloneDeep(originCustomerList).forEach((customer) => {
        const name = replaceSpace(customer.name)?.toUpperCase() || ''
        const customNumber = replaceSpace(customer.customNumber)?.toUpperCase() || ''
        const address = replaceSpace(customer.address + ', ' + customer.cityStateZip)?.toUpperCase() || ''
        const cof = replaceSpace(customer.cof)?.toUpperCase() || ''
        const userName = replaceSpace(customer.userName)?.toUpperCase()
        const salesRoute = replaceSpace(customer.salesRoute)?.toUpperCase()
        const nrid = replaceSpace(customer.nrid)?.toUpperCase()
        if (
            salesRoute?.indexOf(searchText) >= 0 ||
            name.indexOf(searchText) >= 0 ||
            customNumber?.indexOf(searchText) >= 0 ||
            address?.indexOf(searchText) >= 0 ||
            cof?.indexOf(searchText) >= 0 ||
            userName?.indexOf(searchText) >= 0 ||
            nrid?.indexOf(searchText) >= 0
        ) {
            filteredCustomer.push(customer)
        }
    })
    return filteredCustomer
}

export const filterLocationId = (searchText, originCardCustomer) => {
    const customerListByLocId = []
    const customerList = []
    for (const customer of originCardCustomer) {
        if (customer?.salesRoute === searchText) {
            customerListByLocId.push(customer)
        } else {
            customerList.push(customer)
        }
    }
    return customerListByLocId.concat(customerList)
}

export const filterSearchCustomer = (originList, searchText) => {
    if (!searchText) {
        return []
    }
    const tmpFilteredCustomers = filterCustomer(originList, searchText)
    return filterLocationId(searchText, tmpFilteredCustomers)
}

export const filterAddCustomer = (originList, searchText) => {
    if (!searchText) {
        return []
    }
    const tmpFilteredCustomers = filterCustomer(originList, searchText)
    let greyCardCustomer = []
    let whiteCardCustomer = []
    for (const customer of tmpFilteredCustomers) {
        if (customer?.merchandisingBase) {
            greyCardCustomer.push(customer)
        } else {
            whiteCardCustomer.push(customer)
        }
    }
    greyCardCustomer = filterLocationId(searchText, greyCardCustomer)
    whiteCardCustomer = filterLocationId(searchText, whiteCardCustomer)
    return greyCardCustomer.concat(whiteCardCustomer)
}

export const filterLocation = (originLocationList, searchText, defaultLocation) => {
    searchText = replaceSpace(searchText).toUpperCase()
    if (!searchText) {
        return originLocationList
    }
    const filteredLocations = []
    originLocationList.forEach((location) => {
        const name = replaceSpace(location.name)?.toUpperCase()
        const customNumber = replaceSpace(location.customNumber)?.toUpperCase()
        const address = replaceSpace(location.address + ', ' + location.cityStateZip)?.toUpperCase()
        const cof = replaceSpace(location.cof)?.toUpperCase()
        if (
            name.indexOf(searchText) >= 0 ||
            customNumber?.indexOf(searchText) >= 0 ||
            address?.indexOf(searchText) >= 0 ||
            cof?.indexOf(searchText) >= 0
        ) {
            filteredLocations.push(location)
        }
    })
    return defaultLocation.concat(filteredLocations)
}

export const FavoriteEmployeeOnly = (props: any) => {
    const { checked, onCheckBoxPress } = props
    return (
        <CCheckBox
            title={
                <View style={commonStyle.flexRowAlignCenter}>
                    <FavoriteIcon width={16} height={20} style={styles.redExclamationIcon} />
                    <CText>{t.labels.PBNA_MOBILE_FAVORITE_ONLY}</CText>
                </View>
            }
            onPress={() => onCheckBoxPress && onCheckBoxPress()}
            checked={checked}
            containerStyle={[styles.checkBoxMulti, styles.GeofenceIssueCheckBoxContainer]}
        />
    )
}

export const filterByFavoriteOnly = (employeeList) => {
    const favoritedEmployees = []
    employeeList.forEach((employee) => {
        if (employee.isFavorited) {
            favoritedEmployees.push(employee)
        }
    })
    return favoritedEmployees
}

export const setFavoriteOnlyFilterStatus = async (isSelected) => {
    await AsyncStorage.setItem('isFavoriteOnlySelected', isSelected.toString())
}

export const getFavoriteOnlyFilterStatus = async (setFavoriteEmployeeOnly?) => {
    const isFavoriteOnlySelected = JSON.parse(await AsyncStorage.getItem('isFavoriteOnlySelected'))
    setFavoriteEmployeeOnly && setFavoriteEmployeeOnly(isFavoriteOnlySelected)
    return isFavoriteOnlySelected
}

export const MyDirectEmployeesOnly = (props: any) => {
    const { checked, onCheckBoxPress } = props
    return (
        <CCheckBox
            title={
                <View style={commonStyle.flexRowAlignCenter}>
                    <CText>{t.labels.PBNA_MOBILE_MY_DIRECT_ONLY}</CText>
                </View>
            }
            onPress={() => onCheckBoxPress && onCheckBoxPress()}
            checked={checked}
            containerStyle={[styles.checkBoxMulti, styles.GeofenceIssueCheckBoxContainer]}
        />
    )
}

export const filterByMyDirectOnly = (employeeList) => {
    const myDirectEmployees = []
    employeeList.forEach((employee) => {
        if (employee.isMyDirect) {
            myDirectEmployees.push(employee)
        }
    })
    return myDirectEmployees
}

export const setMyDirectOnlyFilterStatus = async (isSelected) => {
    await AsyncStorage.setItem('isMyDirectOnlySelected', isSelected.toString())
}
export const getMyDirectOnlyFilterStatus = async (setMyDirectEmployeeOnly?) => {
    const isMyDirectOnlySelected = JSON.parse(await AsyncStorage.getItem('isMyDirectOnlySelected'))
    setMyDirectEmployeeOnly && setMyDirectEmployeeOnly(isMyDirectOnlySelected)
    return isMyDirectOnlySelected
}
export const setFiltersWhenRenderedFirstTime = async (setFavoriteEmployeeOnly, setMyDirectEmployeeOnly, callback?) => {
    const isFavoriteOnlySelected = await getFavoriteOnlyFilterStatus(setFavoriteEmployeeOnly)
    const isMyDirectOnlySelected = await getMyDirectOnlyFilterStatus(setMyDirectEmployeeOnly)
    callback && callback(isFavoriteOnlySelected, isMyDirectOnlySelected)
}
