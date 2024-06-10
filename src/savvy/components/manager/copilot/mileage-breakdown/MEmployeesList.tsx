/*
 * @Author: Yuan Yue
 * @Date: 2021-10-14 15:56:21
 * @LastEditTime: 2022-04-27 03:48:27
 * @LastEditors: Aimee Zhang
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/mileage-breakdown/EmployeesList.tsx
 */

import React, { FC, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import CText from '../../../../../common/components/CText'
import { getParamsDay, getCurrentPeriod, getPepsiCoPeriodCalendar } from '../../../merchandiser/MyPerformance'
import { CommonParam } from '../../../../../common/CommonParam'
import { restApexCommonCall } from '../../../../api/SyncUtils'
import { getFTPT } from '../../../../utils/MerchManagerUtils'
import UserAvatar from '../../../common/UserAvatar'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import _ from 'lodash'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { convertMileData } from '../../../common/UnitUtils'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { t } from '../../../../../common/i18n/t'
import SearchBarFilter from '../../common/SearchBarFilter'
import { existParamsEmpty } from '../../../../api/ApiUtil'
interface MEmployeesListProps {
    weekTitle: string
    from?: string
    selDay?: any
    setIsloading?: any
}

export const styles = StyleSheet.create({
    containerBox: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: '#fff'
    },
    searchContainer: {
        paddingHorizontal: 22,
        paddingBottom: 20
    },
    employeeContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        paddingTop: 20
    },
    splitLine: {
        borderRightColor: '#D3D3D3',
        borderRightWidth: 1,
        height: 37
    },
    userAvatar: {
        marginLeft: 20,
        marginRight: 15
    },
    imgUserImage: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    itemContentContainer: {
        flex: 1,
        paddingRight: 22,
        paddingBottom: 19,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: baseStyle.color.gray
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_lightGary: {
        color: '#D3D3D3'
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    marginRight_20: {
        marginRight: 20
    },
    fontSize_16: {
        fontSize: 16
    },
    marginTop_8: {
        marginTop: 8
    },
    eeCardRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    eeCardLeft: {
        flex: 1
    },
    driveTitle: {
        fontSize: 12,
        color: '#565656',
        lineHeight: 18
    },
    driveValue: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
        color: '#000'
    },
    driveBox: {
        width: 65
    },
    marginHorizontal_15: {
        marginHorizontal: 15
    },
    redText: {
        color: '#EB445A'
    }
})

const ADAS = 'adas'
const HOURS = 'hours'
const MC = 'mc'

const sortEmployeeList = (list) => {
    list.forEach((element) => {
        element.difference = element.drivenActual - element.drivenPlanned
        element.color = element.difference > 0 ? '#EB445A' : '#000'
    })

    return _.orderBy(list, ['difference'], ['desc'])
}

const sortEmployeeListForADAS = (list, from) => {
    list.forEach((element) => {
        if (from === 'adas') {
            element.difference = element.actualADAS - element.targetADAS
        } else if (from === 'manifest') {
            element.difference = element.actualManifest - element.targetManifest
        } else if (from === 'hours') {
            element.difference = element.targetHours - element.actualHours
        }
        element.color = element.difference < 0 ? '#EB445A' : '#000'
    })

    return _.orderBy(list, ['difference'], ['desc'])
}

const EListRightForMileageAndADAS = (item, from) => {
    const getTAData = (item, fromFlag) => {
        let targetData, actualData
        if (fromFlag === 'adas') {
            targetData = `${item.targetADAS}%`
            actualData = `${item.actualADAS}%`
        } else if (fromFlag === 'hours') {
            targetData = `${item.targetHours} ${t.labels.PBNA_MOBILE_HRS}`
            actualData = `${item.actualHours} ${t.labels.PBNA_MOBILE_HRS}`
        } else {
            targetData = convertMileData(
                item.originDrivenPlanned,
                t.labels.PBNA_MOBILE_MI_UNIT,
                t.labels.PBNA_MOBILE_KM_UNIT
            )
            actualData = convertMileData(
                item.originDrivenActual,
                t.labels.PBNA_MOBILE_MI_UNIT,
                t.labels.PBNA_MOBILE_KM_UNIT
            )
        }
        return { targetData, actualData }
    }
    const { targetData, actualData } = getTAData(item, from)
    return (
        <View style={styles.eeCardRight}>
            <View style={[styles.driveBox]}>
                <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                <CText style={[styles.driveValue, { color: item.color }]}>{actualData}</CText>
            </View>
            <View style={styles.splitLine} />
            <View style={[styles.driveBox, { marginLeft: 14 }]}>
                {(!from || from === 'hours') && (
                    <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_COPILOT_PLANNED}</CText>
                )}
                {from === 'adas' && <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_TARGET}</CText>}
                <CText style={styles.driveValue}>{targetData}</CText>
            </View>
        </View>
    )
}

const EListRightForManifest = (item) => {
    return (
        <View style={styles.eeCardRight}>
            <View style={styles.driveBox}>
                <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                <CText style={[styles.driveValue, { color: item.color }]}>{item.actualManifest}%</CText>
            </View>
        </View>
    )
}

const MEmployeesList: FC<MEmployeesListProps> = (props: MEmployeesListProps) => {
    const { weekTitle, from, selDay, setIsloading } = props
    const searchBarFilter: any = useRef()
    const [employeeOriginList, setEmployeeOriginList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const { dropDownRef } = useDropDown()

    const getDrivenList = (selectPerformance, periodData) => {
        const firstDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const secondDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay
        if (existParamsEmpty([firstDay, secondDay, CommonParam.userLocationId])) {
            return
        }
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_PERFORMANCE_DETAIL}/${CommonParam.userLocationId}&${firstDay}&${secondDay}`,
            'GET'
        )
            .then((res) => {
                const list = JSON.parse(res.data)

                list.forEach((element) => {
                    element.originDrivenActual = element.drivenActual
                    element.originDrivenPlanned = element.drivenPlanned
                    element.drivenActual = convertMileData(element.drivenActual)
                    element.drivenPlanned = convertMileData(element.drivenPlanned)
                })
                setEmployeeOriginList(sortEmployeeList(list))
                searchBarFilter?.current?.clearText()
            })
            .catch((err) => {
                dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
            })
    }

    const getDrivenListForADAS = (periodData, selectDay, tab) => {
        setIsloading(true)
        let firstDay, secondDay
        if (selectDay === t.labels.PBNA_MOBILE_WEEK_TO_DATE) {
            firstDay = getParamsDay(selectDay, periodData, getCurrentPeriod).firstDay
            secondDay = getParamsDay(selectDay, periodData, getCurrentPeriod).secondDay
        } else {
            firstDay = secondDay = selectDay
        }
        const getInterfaceName = (tabName: string) => {
            let interfaceFlag
            if (tabName === ADAS) {
                interfaceFlag = ADAS.toUpperCase()
            } else if (tabName === HOURS) {
                interfaceFlag = HOURS.toUpperCase()
            } else {
                interfaceFlag = MC.toUpperCase()
            }
            return interfaceFlag
        }
        const interfaceFlag = getInterfaceName(tab)
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_API_DEL_DUP_PERFORMANCE}/${CommonParam.userLocationId}&${firstDay}&${secondDay}&${interfaceFlag}`,
            'GET'
        )
            .then((res) => {
                const list = JSON.parse(res.data)
                setEmployeeOriginList(sortEmployeeListForADAS(list, tab))
                searchBarFilter?.current?.clearText()
                setIsloading(false)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
            })
    }
    const renderItem = ({ item }) => {
        const cardRightItem = (flag) => {
            if (flag === 'adas' || !flag || flag === 'hours') {
                return EListRightForMileageAndADAS(item, flag)
            } else if (flag === 'manifest') {
                return EListRightForManifest(item)
            }
        }
        return (
            <View key={item.userID} style={styles.employeeContainer}>
                <View style={styles.userAvatar}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={styles.imgUserImage}
                        userNameText={{ fontSize: 14 }}
                    />
                </View>
                <View style={styles.itemContentContainer}>
                    <View style={styles.eeCardLeft}>
                        <CText
                            style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]}
                            numberOfLines={1}
                        >
                            {item.firstName ? `${item.firstName} ${item.lastName}` : `${item.lastName}`}
                        </CText>
                        <View style={[styles.rowCenter, styles.marginTop_8, styles.marginRight_20]}>
                            <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                                {getFTPT({ item })}
                            </CText>
                            <CText
                                style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </CText>
                        </View>
                    </View>
                    {cardRightItem(from)}
                </View>
            </View>
        )
    }

    const filterEmployee = (params) => {
        let { searchText, users } = params
        const newList = users
        searchText = searchText.toUpperCase()
        if (!searchText) {
            searchBarFilter?.current?.onApplyClick(newList, searchText)
        } else {
            const filteredEmployees = []
            newList.forEach((employee) => {
                const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
                if (fullName?.indexOf(searchText) >= 0) {
                    filteredEmployees.push(employee)
                }
            })
            searchBarFilter?.current?.onApplyClick(filteredEmployees, searchText)
        }
    }

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            if (!from) {
                getDrivenList(weekTitle, result)
            } else {
                getDrivenListForADAS(result, selDay, from)
            }
        })
    }, [weekTitle, selDay])

    return (
        <View style={styles.containerBox}>
            <View style={styles.searchContainer}>
                <SearchBarFilter
                    cRef={searchBarFilter}
                    isEmployee
                    setListData={setEmployeeList}
                    originData={employeeOriginList}
                    originListData={employeeList}
                    disabledFilterBtn
                    placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                    searchTextChange={(text) => {
                        filterEmployee({ searchText: text, users: employeeOriginList })
                    }}
                    notShowFilterBtn
                />
            </View>
            <FlatList data={employeeList} renderItem={renderItem} keyExtractor={(item) => item.userID} />
        </View>
    )
}

export default MEmployeesList
