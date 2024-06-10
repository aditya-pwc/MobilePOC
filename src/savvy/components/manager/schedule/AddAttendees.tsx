/**
 * @description add attendees for meeting
 * @author Sheng Huang
 * @date 2021/8/23
 */

import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Image, FlatList, StyleSheet, NativeAppEventEmitter } from 'react-native'
import { CommonParam } from '../../../../common/CommonParam'
import { SoupService } from '../../../service/SoupService'
import CText from '../../../../common/components/CText'
import SearchBarFilter from '../common/SearchBarFilter'
import { TabIndex } from '../../../redux/types/H01_Manager/data-tabIndex'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import UserAvatar from '../../common/UserAvatar'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import Loading from '../../../../common/components/Loading'
import _ from 'lodash'
import { computeMyTeamData } from '../helper/MerchManagerHelper'
import CCheckBox from '../../../../common/components/CCheckBox'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { filterEmployee, filterEmployeeData, renderItemContent } from '../my-team/MyTeam'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { EventEmitterType, LineCodeGroupType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { useDispatch } from 'react-redux'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import store from '../../../redux/store/Store'

interface AddAttendeesProps {
    props: any
    route: any
    navigation: any
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    mainContainer: {
        paddingTop: 60,
        paddingLeft: 22,
        paddingRight: 22,
        backgroundColor: '#FFFFFF'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    topTabsContainer: {
        height: 44,
        marginBottom: 20,
        padding: 6,
        borderWidth: 1,
        borderRadius: 4,
        shadowOpacity: 0.4,
        backgroundColor: 'white',
        borderColor: '#D3D3D3',
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row'
    },
    topTabsItemActiveContainer: {
        flex: 1,
        backgroundColor: '#00A2D9',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTabsItemNormalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTabsItemActiveText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700'
    },
    topTabsItemNormalText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    metrics: {
        marginTop: 22,
        marginBottom: 20
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
    fontSize_16: {
        fontSize: 16
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
    fontColor_blue: {
        color: '#00A2D9'
    },
    marginTop_6: {
        marginTop: 6
    },
    marginRight_8: {
        marginRight: 8
    },
    marginRight_20: {
        marginRight: 20
    },
    teamItem: {
        flex: 1,
        backgroundColor: 'white',
        marginBottom: 20,
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    userAvatar: {
        position: 'relative'
    },
    topTitle: {
        paddingBottom: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topTitleText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 3
    },
    backButton: {
        width: 30,
        height: 30,
        position: 'absolute',
        left: 0,
        top: 0
    },
    backButtonImage: {
        width: 12,
        height: 21
    },
    height_95: {
        height: 95
    },
    flexDirectionReverse: {
        flexDirection: 'row-reverse'
    },
    checkBoxContainer: {
        backgroundColor: '#F2F4F7',
        marginTop: 20,
        marginRight: 22,
        marginBottom: 20
    }
})

const getEmployeeData = async (params) => {
    const { employeeTitle, setIsLoading, dropDownRef, setAllUserData } = params
    setIsLoading(true)
    const lineCodeMap = store.getState().manager.lineCodeMap
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveMyTeamList.f,
            formatString(ScheduleQuery.retrieveMyTeamList.q + ScheduleQuery.retrieveMyTeamList.c, [
                CommonParam.userLocationId
            ]) + ScheduleQuery.retrieveMyTeamList.orderBy
        )
            .then(async (result: any) => {
                const items = await computeMyTeamData(result)
                const users = Object.values(items)
                if (!_.isEmpty(users)) {
                    filterEmployeeData({
                        users,
                        dropDownRef,
                        setAllUserData,
                        resolve,
                        employeeTitle,
                        setIsLoading,
                        reject,
                        merchLCodes: lineCodeMap.get(LineCodeGroupType.MyTeamGroup)[UserType.UserType_Merch] || [],
                        salesLCodes: lineCodeMap.get(LineCodeGroupType.MyTeamGroup)[UserType.UserType_Sales] || []
                    })
                } else {
                    setIsLoading(false)
                    resolve([])
                }
            })
            .catch(() => {
                setIsLoading(false)
                reject([])
            })
    })
}
const getUserLineCodes = async (params) => {
    const {
        userType,
        searchText,
        searchBarFilter,
        setSearchText,
        setEmployeeOriginList,
        setIsLoading,
        dropDownRef,
        setAllUserData,
        getLineCodeMap
    } = params
    await getLineCodeMap()
    const users = await getEmployeeData({ employeeTitle: userType, setIsLoading, dropDownRef, setAllUserData })
    filterEmployee({ searchText, users, searchBarFilter, setSearchText })
    setEmployeeOriginList(users)
    setIsLoading(false)
}

const AddAttendees = ({ route, navigation }: AddAttendeesProps) => {
    const { selectedAttendees } = route.params
    const searchBarFilter: any = useRef()
    const [employeeOriginList, setEmployeeOriginList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [employeeTempList, setEmployeeTempList] = useState([])
    const [activeTab, setActiveTab] = useState(1)
    const [searchText, setSearchText] = useState('')
    const [userType, setUserType] = useState('Merch')
    const [allSelectedCount, setAllSelectedCount] = useState(0)
    const [currentSelectedCount, setCurrentSelectedCount] = useState(0)
    const [currentCount, setCurrentCount] = useState(0)
    const [selectedData, setSelectedData] = useState({})
    const [isSelectAll, setIsSelectAll] = useState(false)
    const [saveStatus, setSaveStatus] = useState(false)

    const { dropDownRef } = useDropDown()
    const [isLoading, setIsLoading] = useState(false)
    const [allUserData, setAllUserData] = useState({
        [UserType.UserType_Merch]: [],
        [UserType.UserType_Sales]: [],
        [UserType.UserType_Others]: []
    })

    const dispatch = useDispatch()
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)

    useEffect(() => {
        getUserLineCodes({
            dropDownRef,
            userType,
            searchText,
            searchBarFilter,
            setSearchText,
            setEmployeeOriginList,
            setIsLoading,
            setAllUserData,
            getLineCodeMap
        })
        setSelectedData(_.cloneDeep(selectedAttendees))
    }, [])

    const getEmployeeMap = () => {
        const data = {}
        employeeList.forEach((e) => {
            data[e.id] = e
        })
        return data
    }

    const checkIsSelectedAll = () => {
        if (currentSelectedCount === employeeList.length && currentCount !== 0) {
            setIsSelectAll(true)
        } else {
            setIsSelectAll(false)
        }
    }

    const checkSelectedData = () => {
        const data = getEmployeeMap()
        let count = 0
        for (const key in selectedData) {
            if (data[selectedData[key].id]) {
                data[selectedData[key].id].isSelected = true
                count++
            }
        }
        setCurrentSelectedCount(count)
        checkIsSelectedAll()
        return Object.values(data)
    }

    useEffect(() => {
        setIsSelectAll(false)
        setCurrentSelectedCount(0)
        setCurrentCount(employeeList.length)
        setEmployeeTempList(checkSelectedData())
    }, [employeeList])

    useEffect(() => {
        setSaveStatus(allSelectedCount > 0 && allSelectedCount <= 50)
    }, [allSelectedCount])

    useEffect(() => {
        setAllSelectedCount(Object.keys(selectedData).length)
    }, [selectedData])

    useEffect(() => {
        checkIsSelectedAll()
    }, [currentSelectedCount])

    const searchBarFilterReset = () => {
        setSearchText('')
    }

    const changeTab = (params) => {
        const { tabIndex, type } = params
        searchBarFilter?.current?.onResetClick()
        if (TabIndex.TabIndex_Merch === tabIndex) {
            setUserType(UserType.UserType_Merch)
        }
        if (TabIndex.TabIndex_Sales === tabIndex) {
            setUserType(UserType.UserType_Sales)
        }
        if (TabIndex.TabIndex_Others === tabIndex) {
            setUserType(UserType.UserType_Others)
        }
        setActiveTab(tabIndex)
        const users = allUserData[type]
        setSearchText('')
        setEmployeeOriginList(users)
        searchBarFilter?.current?.onApplyClick(users, '', 'reset')
    }

    const clickItem = (item) => {
        const data = getEmployeeMap()
        data[item.id].isSelected = !data[item.id].isSelected
        setEmployeeTempList(Object.values(data))
        if (data[item.id].isSelected) {
            setCurrentSelectedCount(currentSelectedCount + 1)
            selectedData[item.id] = item
            setSelectedData(JSON.parse(JSON.stringify(selectedData)))
        } else {
            setCurrentSelectedCount(currentSelectedCount - 1)
            delete selectedData[item.id]
            setSelectedData(JSON.parse(JSON.stringify(selectedData)))
        }
    }

    const selectAll = () => {
        const selected = !isSelectAll
        if (selected) {
            employeeList.forEach((e) => {
                e.isSelected = selected
                selectedData[e.id] = e
            })
            setCurrentSelectedCount(currentCount)
        } else {
            employeeList.forEach((e) => {
                e.isSelected = selected
                delete selectedData[e.id]
            })
            setCurrentSelectedCount(0)
        }
        setSelectedData(JSON.parse(JSON.stringify(selectedData)))
        setIsSelectAll(selected)
        setEmployeeTempList(JSON.parse(JSON.stringify(employeeList)))
    }

    const onClickAdd = () => {
        NativeAppEventEmitter.emit(EventEmitterType.TRANSFER_ATTENDEES_ITEM, selectedData)
        navigation.goBack()
    }

    const renderItem = (item) => {
        return (
            <View style={styles.teamItem}>
                <View style={styles.teamItem_without_border}>
                    <View style={styles.userAvatar}>
                        <UserAvatar
                            userStatsId={item.item.userStatsId}
                            firstName={item.item.firstName}
                            lastName={item.item.lastName}
                            avatarStyle={styles.imgUserImage}
                            userNameText={{ fontSize: 24 }}
                        />
                    </View>
                    {renderItemContent(item)}
                    <TouchableOpacity onPress={() => clickItem(item.item)} hitSlop={commonStyle.hitSlop}>
                        {item.item.isSelected ? (
                            <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={commonStyle.size_24} />
                        ) : (
                            <CText style={[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]}>
                                {t.labels.PBNA_MOBILE_ADD}
                            </CText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.topTitle}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack && navigation.goBack()
                        }}
                        style={styles.backButton}
                        hitSlop={commonStyle.hitSlop}
                    >
                        <Image
                            source={require('../../../../../assets/image/icon-back.png')}
                            style={styles.backButtonImage}
                        />
                    </TouchableOpacity>
                    <CText style={styles.topTitleText}>{t.labels.PBNA_MOBILE_ADD_ATTENDEES.toUpperCase()}</CText>
                </View>
                <View style={styles.metrics}>
                    <SearchBarFilter
                        cRef={searchBarFilter}
                        setListData={setEmployeeList}
                        originData={employeeOriginList}
                        originListData={employeeList}
                        reset={searchBarFilterReset}
                        isEmployee
                        isMyTeam
                        isAttendee
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        searchTextChange={(text) => {
                            filterEmployee({
                                searchText: text,
                                users: employeeOriginList,
                                searchBarFilter,
                                setSearchText
                            })
                        }}
                    />
                </View>
                <View style={[styles.topTabsContainer]}>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 1,
                                type: UserType.UserType_Merch
                            })
                        }
                        style={activeTab === 1 ? styles.topTabsItemActiveContainer : styles.topTabsItemNormalContainer}
                    >
                        <CText style={activeTab === 1 ? styles.topTabsItemActiveText : styles.topTabsItemNormalText}>
                            {t.labels.PBNA_MOBILE_MERCH}
                        </CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 2,
                                type: UserType.UserType_Sales
                            })
                        }
                        style={activeTab === 2 ? styles.topTabsItemActiveContainer : styles.topTabsItemNormalContainer}
                    >
                        <CText style={activeTab === 2 ? styles.topTabsItemActiveText : styles.topTabsItemNormalText}>
                            {t.labels.PBNA_MOBILE_SALES}
                        </CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            changeTab({
                                tabIndex: 3,
                                type: UserType.UserType_Others
                            })
                        }
                        style={activeTab === 3 ? styles.topTabsItemActiveContainer : styles.topTabsItemNormalContainer}
                    >
                        <CText style={activeTab === 3 ? styles.topTabsItemActiveText : styles.topTabsItemNormalText}>
                            {t.labels.PBNA_MOBILE_OTHERS}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
            {!_.isEmpty(employeeTempList) && (
                <View style={styles.flexDirectionReverse}>
                    <CCheckBox
                        title={
                            <CText style={[[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]]}>
                                {t.labels.PBNA_MOBILE_SELECT_ALL}
                            </CText>
                        }
                        containerStyle={styles.checkBoxContainer}
                        checked={isSelectAll}
                        onPress={() => selectAll()}
                    />
                </View>
            )}
            <FlatList data={employeeTempList} renderItem={renderItem} keyExtractor={(item) => item.id} />
            <View style={styles.height_95} />
            <FormBottomButton
                onPressCancel={() => {
                    navigation.goBack && navigation.goBack()
                }}
                onPressSave={() => {
                    onClickAdd()
                }}
                disableSave={!saveStatus}
                rightButtonLabel={
                    allSelectedCount === 0
                        ? t.labels.PBNA_MOBILE_ADD_ATTENDEES_WITH_BRACKET
                        : `${t.labels.PBNA_MOBILE_ADD} ${allSelectedCount} ${t.labels.PBNA_MOBILE_ATTENDEES_WITH_BRACKET}`
                }
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default AddAttendees
