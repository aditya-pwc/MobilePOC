/**
 * @description Add a visit in review new schedule.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-27
 */

import React, { useEffect, useState, useRef } from 'react'
import { View, FlatList, Image, TouchableOpacity, NativeAppEventEmitter, Alert } from 'react-native'
import { SoupService } from '../../../service/SoupService'
import SearchBarFilter from './SearchBarFilter'
import EmployeeItem from './EmployeeItem'
import CustomerItem from './CustomerItem'
import CText from '../../../../common/components/CText'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { CommonParam } from '../../../../common/CommonParam'
import { getWorkingStatus } from '../../../utils/MerchManagerComputeUtils'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { getAllCustomerData } from '../helper/MerchManagerHelper'
import LocationItem from '../schedule/LocationItem'
import Loading from '../../../../common/components/Loading'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import SearchModalStyle from '../../../styles/manager/SearchModalStyle'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import MMSearchBar from './MMSearchBar'
import { filterAddAttendee, filterLocation, filterSearchCustomer } from '../helper/MMSearchBarHelper'
import { EventEmitterType } from '../../../enums/Manager'

const styles = SearchModalStyle
interface SearchModalProps {
    props?: any
    route?: any
    navigation?: any
    selectedCustomers?: any
    hasEmployeeData?: boolean
    employeeData?: any
    customTitle?: string
}

const MAX_NUM_OF_VISIT = 20

const SearchModal = ({ route, navigation }: SearchModalProps) => {
    const {
        searchType,
        needBase,
        isPublished,
        employeePublish,
        selectedCustomers,
        onlyNeedOneCustomer,
        hasEmployeeData,
        employeeData,
        customTitle
    } = route.params
    const [activeTab, setActiveTab] = useState(searchType)
    const [originEmployeeList, setOriginEmployeeList] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [originCustomerList, setOriginCustomerList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [selectedCList, setSelectedCList] = useState([])
    const [selectedCount, setSelectedCount] = useState(0)
    const [saveStatus, setSaveStatus] = useState(false)
    const [buttonText, setButtonText] = useState('')
    const [originLocationList, setOriginLocationList] = useState([])
    const [locationList, setLocationList] = useState([])
    const [routeList, setRouteList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const eFlatListRef = useRef<FlatList>()
    const cFlatListRef = useRef<FlatList>()
    const { dropDownRef } = useDropDown()
    const visitTitle = needBase
        ? t.labels.PBNA_MOBILE_ADD_A_RECURRING_VISIT.toUpperCase()
        : t.labels.PBNA_MOBILE_NEW_SCHEDULE
    const title = isPublished ? t.labels.PBNA_MOBILE_PUBLISHED_SCHEDULE : visitTitle
    let TITLE = employeePublish ? t.labels.PBNA_MOBILE_EMPLOYEE_SCHEDULE : title
    TITLE = customTitle || TITLE
    const titles = activeTab === 'Location' ? t.labels.PBNA_MOBILE_MEETING_LOCATION.toUpperCase() : TITLE
    const SEARCH_TEXT = isPublished ? t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE : t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES

    useEffect(() => {
        setLocationList(originLocationList)
    }, [originLocationList])

    useEffect(() => {
        setSelectedCList(_.cloneDeep(_.isEmpty(selectedCustomers) ? [] : selectedCustomers))
        setSelectedCount(_.isEmpty(selectedCustomers) ? 0 : selectedCustomers.length)
    }, [])

    useEffect(() => {
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            setSelectedCList(_.isEmpty(selectedCustomers) ? [] : selectedCustomers)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [])

    useEffect(() => {
        if (onlyNeedOneCustomer) {
            setSaveStatus(selectedCount === 1)
            setButtonText(`${t.labels.PBNA_MOBILE_ADD} ${selectedCount} ${t.labels.PBNA_MOBILE_CUSTOMERS_WITH_BRACKET}`)
        } else {
            setSaveStatus(selectedCount > 0 && selectedCount <= MAX_NUM_OF_VISIT)
            if (selectedCount === 0) {
                setButtonText(t.labels.PBNA_MOBILE_ADD_CUSTOMERS_WITH_BRACKET)
            } else if (selectedCount > MAX_NUM_OF_VISIT) {
                setButtonText(`${t.labels.PBNA_MOBILE_MAX_CUSTOMERS}  (${selectedCount} ${t.labels.PBNA_MOBILE_ADDED})`)
            } else {
                setButtonText(
                    `${t.labels.PBNA_MOBILE_ADD} ${selectedCount} ${t.labels.PBNA_MOBILE_CUSTOMERS_WITH_BRACKET}`
                )
            }
        }
    }, [selectedCount])

    const renderEItem = ({ item, index }) => (
        <EmployeeItem
            item={item}
            index={index}
            showWorkingDays={item.merchandisingBase === '1'}
            navigation={navigation}
        />
    )

    const onClickAdd = () => {
        NativeAppEventEmitter.emit(EventEmitterType.TRANSFER_CUSTOMER_DATA, selectedCList)
        navigation.goBack()
    }

    const handleCAdd = (item) => {
        item.isSelected = !item.isSelected
        setCustomerList(_.cloneDeep(customerList))
        // clear and search again need to show selected items
        originCustomerList.forEach((originCustomer) => {
            if (originCustomer.id === item.id) {
                originCustomer.isSelected = item.isSelected
            }
        })
        setOriginCustomerList(_.cloneDeep(originCustomerList))
        if (item.isSelected) {
            setSelectedCount(selectedCount + 1)
            selectedCList.push(item)
        } else {
            setSelectedCount(selectedCount - 1)
            for (let i = 0; i < selectedCList.length; i++) {
                if (selectedCList[i].name === item.name) {
                    selectedCList.splice(i, 1)
                }
            }
        }
        setSelectedCList(_.cloneDeep(selectedCList))

        if (onlyNeedOneCustomer) {
            onClickAdd()
        }
    }

    const handleGoBack = () => {
        setSelectedCList(_.isEmpty(selectedCustomers) ? [] : selectedCustomers)
        navigation.goBack()
    }

    const renderCItem = (item) => <CustomerItem item={item} isMultiAdd handleCAdd={handleCAdd} />

    const locationClickMethod = (item) => {
        if (item.trim() !== '') {
            NativeAppEventEmitter.emit(EventEmitterType.TRANSFER_LOCATION_DATA, item)
            navigation.goBack()
        } else {
            Alert.alert(t.labels.PBNA_MOBILE_MEETING_LOCATION_CANNOT_BE_EMPTY)
        }
    }

    const renderLItem = (item) => <LocationItem item={item} itemClick={locationClickMethod} />

    const getEmployeeData = () => {
        const clause = needBase
            ? "WHERE {User_Stats__c:Merchandising_Base__c} = '1' "
            : "WHERE {User:Profile.Name} != 'manager' AND {User:Merchandising_Base_Minimum_Requirement__c} = '1' "
        return new Promise((resolve, reject) => {
            SoupService.retrieveDataFromSoup(
                'User',
                {},
                ScheduleQuery.retrieveSearchModalEE.f,
                ScheduleQuery.retrieveSearchModalEE.q +
                    clause +
                    ` AND {User:GM_LOC_ID__c} = '${CommonParam.userLocationId}' 
                AND {User:IsActive} IS TRUE ORDER BY {User:Name}`
            )
                .then((result: any) => {
                    const items = {}
                    result.forEach((user: any) => {
                        items[user.UserId] = {
                            id: user.UserId,
                            userStatsId: user.UserStatsId,
                            name: user.Username,
                            firstName: user.FirstName,
                            lastName: user.LastName,
                            title: user.Title,
                            phone: user.Phone,
                            gpid: user.GPID,
                            location: user.LocationName,
                            ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
                            startTime: user.Start_Time__c,
                            startLocation: user.StartLocation,
                            merchandisingBase: user.SMerchandising_Base__c,
                            workingStatus: getWorkingStatus(user),
                            noWorkingDay: user?.Sunday__c === null
                        }
                    })
                    const users = Object.values(items)
                    setOriginEmployeeList(users)
                    resolve(users)
                })
                .catch(() => {
                    reject([])
                })
        })
    }

    const addIsSelectedKey = (items) => {
        const selectedIds = []
        for (const selectedItem of selectedCustomers) {
            selectedIds.push(selectedItem.id)
        }
        for (const item of items) {
            item.isSelected = selectedIds.includes(item.id)
        }
        return items
    }

    const getCustomerData = () => {
        setIsLoading(true)
        getAllCustomerData(false, dropDownRef).then((items: Array<any>) => {
            const filterItems = addIsSelectedKey(items)
            setOriginCustomerList(filterItems)
            setIsLoading(false)
        })
    }

    const getRouteData = () => {
        return new Promise((resolve, reject) => {
            SoupService.retrieveDataFromSoup(
                'Route_Sales_Geo__c',
                {},
                ScheduleQuery.retrieveSearchModalLocation.f,
                ScheduleQuery.retrieveSearchModalLocation.q +
                    ` WHERE {Route_Sales_Geo__c:SLS_UNIT_ID__c} = '${CommonParam.userLocationId}'`
            )
                .then((result: any) => {
                    const items = {}
                    result.forEach((location: any) => {
                        items[location.RouteId] = {
                            name: `${location.SLS_UNIT_NM__c || ''} Pepsi Location`,
                            address: `${location.ADDR_LN_1_TXT__c || ''} ${
                                location.ADDR_LN_2_TXT__c ? location.ADDR_LN_2_TXT__c : ''
                            }`,
                            cityStateZip: `${location.CITY_NM__c || ''} ${location.PSTL_AREA_VAL__c || ''}`,
                            isPepsi: true
                        }
                    })
                    const routes = Object.values(items)
                    resolve(routes)
                })
                .catch(() => {
                    reject([])
                })
        })
    }

    const getLocationData = () => {
        setIsLoading(true)
        getRouteData()
            .then((routes: any) => {
                getAllCustomerData(false, dropDownRef).then((items: Array<any>) => {
                    setRouteList(routes)
                    setOriginCustomerList(items)
                    setOriginLocationList(routes.concat(items))
                    setIsLoading(false)
                })
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const renderFilter = () => {
        if (activeTab === 'Employee') {
            return (
                <SearchBarFilter
                    setListData={setEmployeeList}
                    originData={originEmployeeList}
                    originListData={employeeList}
                    isEmployee
                    isAddVisit
                    placeholder={SEARCH_TEXT}
                    searchTextChange={(text) => filterAddAttendee(originEmployeeList, text, setEmployeeList)}
                />
            )
        } else if (activeTab === 'Location') {
            return (
                <MMSearchBar
                    needAddBtn
                    onAddClick={locationClickMethod}
                    placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMER_OR_TYPE}
                    originData={originLocationList}
                    setSearchResult={setLocationList}
                    onSearchTextChange={(originList, text) => filterLocation(originList, text, routeList)}
                />
            )
        }
        return (
            <MMSearchBar
                placeholder={t.labels.PBNA_MOBILE_SEARCH_BY_C_R_R}
                originData={originCustomerList}
                setSearchResult={setCustomerList}
                onSearchTextChange={filterSearchCustomer}
            />
        )
    }

    const renderList = () => {
        if (activeTab === 'Employee') {
            return (
                <FlatList
                    ref={eFlatListRef}
                    data={employeeList}
                    extraData={employeeList}
                    renderItem={renderEItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.paddingVertical_22}
                />
            )
        } else if (activeTab === 'Location') {
            return (
                <FlatList
                    ref={cFlatListRef}
                    data={locationList}
                    extraData={locationList}
                    renderItem={renderLItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={commonStyle.paddingBottom_22}
                />
            )
        }
        return (
            <FlatList
                ref={cFlatListRef}
                data={customerList}
                extraData={customerList}
                renderItem={renderCItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={commonStyle.paddingBottom_22}
            />
        )
    }

    useEffect(() => {
        setActiveTab(searchType)
        if (activeTab === 'Employee') {
            if (hasEmployeeData) {
                setOriginEmployeeList(employeeData)
            } else {
                getEmployeeData()
            }
            eFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
        } else if (activeTab === 'Location') {
            getLocationData()
            eFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
        } else {
            getCustomerData()
            cFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
        }
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.topTitle}>
                    <TouchableOpacity
                        onPress={() => {
                            handleGoBack()
                        }}
                        style={styles.backButton}
                        hitSlop={commonStyle.hitSlop}
                    >
                        <Image
                            source={require('../../../../../assets/image/icon-back.png')}
                            style={styles.backButtonImage}
                        />
                    </TouchableOpacity>
                    <CText style={styles.topTitleText}>{titles}</CText>
                </View>
                <View style={styles.metrics}>{renderFilter()}</View>
            </View>
            {renderList()}
            {activeTab === 'Customer' && !onlyNeedOneCustomer && (
                <FormBottomButton
                    onPressCancel={() => {
                        handleGoBack()
                    }}
                    onPressSave={() => {
                        onClickAdd()
                    }}
                    disableSave={!saveStatus}
                    rightButtonLabel={buttonText}
                />
            )}
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default SearchModal
