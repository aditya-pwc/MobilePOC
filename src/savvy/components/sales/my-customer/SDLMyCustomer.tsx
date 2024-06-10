/*
 * @Description: SDL My Customer
 * @Author: Yi Li
 * @Date: 2021-11-28 21:36:45
 * @LastEditTime: 2023-11-02 17:17:46
 * @LastEditors: Mary Qian
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NativeAppEventEmitter, View } from 'react-native'
import CText from '../../../../common/components/CText'
import MyCustomersStyle from '../../../styles/manager/MyCustomersStyle'
import SubTypeModal from '../../manager/common/SubTypeModal'
import {
    queryTargetRouteSalesGeoToGetAccount,
    filterWithSelectedSubTypeAndInputString,
    getPopUpData
} from './SDLMyCustomerHelper'
import _ from 'lodash'
import SDLMyCustomerList from './SDLMyCustomerList'
import { SoupService } from '../../../service/SoupService'
import { handleCTROrderDay, handleCustomerFrequency } from './SDLEmployeeDetail'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonParam } from '../../../../common/CommonParam'
import { isPersonaUGM, Persona } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import { useIsFocused } from '@react-navigation/core'
import SDLMyCustomerQueries from '../../../queries/SDLMyCustomerQueries'
import { formatString } from '../../../utils/CommonUtils'
import { Log } from '../../../../common/enums/Log'
import { DropDownType, EventEmitterType } from '../../../enums/Manager'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import SearchBarWithFilter from './SearchBarWithFilter'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import EmptyImage from '../../../../../assets/image/emptyViewForMyCustomers.svg'
import { LocationService } from '../../../service/LocationService'
import { Constants } from '../../../../common/Constants'
import { sortArrByParamsASC } from '../../manager/helper/MerchManagerHelper'
import { syncDownDataByTableNames } from '../../../utils/MerchManagerUtils'
import { useSelector } from 'react-redux'
import { ScreenMapping } from '../../../config/ScreenMapping'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import SelectTab from '../../common/SelectTab'
import Loading from '../../../../common/components/Loading'
import MapDraggable from '../../common/MapDraggable'
import SDLMyCustomerMapView from './SDLMyCustomerMapView'

const SDLMyCustomerData = 'SDLMyCustomerData'
interface MyCustomersProps {
    props?: any
    route?: any
    navigation: any
    userData?: any
    isEmployeeProfile?: boolean
}

enum SALES_METHOD_TYPE {
    ALL = 'all',
    LARGE = 'Large Format',
    SMALL = 'Small Format',
    FOOD_SERVICE = 'FoodService'
}

const styles = MyCustomersStyle

const managerReducer = (state) => state.manager

const SDLMyCustomer = ({ navigation, isEmployeeProfile, userData }: MyCustomersProps) => {
    const customerCell: any = useRef()
    const [customerOriginList, setCustomerOriginList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [subTypeArray, setSubTypeArray] = useState([])
    const [selectedSubType, setSelectedSubType] = useState([])
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [selectInput, setSelectInput] = useState('')
    const [hideFilterBtn, setHideFilterBtn] = useState(isEmployeeProfile)
    const [activeTab, setActiveTab] = useState(0)
    const isFocused = useIsFocused()
    const { dropDownRef } = useDropDown()
    const [customerFilters, setCustomerFilters] = useState({ switchOnStoreNearMe: false, distanceStoreNearMe: 0 })
    const manager = useSelector(managerReducer)
    const searchBarRef: any = useRef()
    const [isLoading, setIsLoading] = useState(false)
    const [isMapView, setIsMapView] = useState(false)

    const salesMethodsObj: any = {
        all: {
            index: 0,
            sfValue: SALES_METHOD_TYPE.ALL,
            name: t.labels.PBNA_MOBILE_ALL.toLocaleUpperCase()
        },
        large: {
            index: 1,
            sfValue: SALES_METHOD_TYPE.LARGE,
            name: t.labels.PBNA_MOBILE_LARGE.toLocaleUpperCase()
        },
        small: {
            index: 2,
            sfValue: SALES_METHOD_TYPE.SMALL,
            name: t.labels.PBNA_MOBILE_SMALL.toLocaleUpperCase()
        },
        foodService: {
            index: 3,
            sfValue: SALES_METHOD_TYPE.FOOD_SERVICE,
            name: t.labels.PBNA_MOBILE_CDA_FOOD_SERVICE.toLocaleUpperCase()
        }
    }

    const salesMethodsData = [
        { name: salesMethodsObj.all.name },
        { name: salesMethodsObj.large.name },
        { name: salesMethodsObj.small.name },
        { name: salesMethodsObj.foodService.name }
    ]

    const filterCustomerList = (filteredData: any) => {
        const storesNearMe: any = filteredData.filter(
            (item: any) =>
                item.distanceFromMe <=
                // since the minimumValue of slider filter is 0, but label shows 1, need to convert here
                (customerFilters?.distanceStoreNearMe === 0 ? 1 : customerFilters?.distanceStoreNearMe)
        )
        sortArrByParamsASC(storesNearMe, 'distanceFromMe')
        const slicedStoreList = storesNearMe.slice(0, 500)
        setCustomerList(slicedStoreList)
    }

    const filterByTypeTextMethod = (originData: any[], typeData?: any[], inputString?: string) => {
        const filteredData: any = filterWithSelectedSubTypeAndInputString(originData, typeData, inputString)
        let val = ''
        switch (activeTab) {
            case salesMethodsObj.large.index:
                val = SALES_METHOD_TYPE.LARGE
                break
            case salesMethodsObj.small.index:
                val = SALES_METHOD_TYPE.SMALL
                break
            case salesMethodsObj.foodService.index:
                val = SALES_METHOD_TYPE.FOOD_SERVICE
                break
            default:
                break
        }
        if (val.length > 0) {
            const dataFilteredBySalesMethods = filteredData.filter((i: any) => i.BUSN_SGMNTTN_LVL_3_NM__c === val)
            return dataFilteredBySalesMethods
        }

        return filteredData
    }

    const getCustomerListForSDL = () => {
        isPersonaUGM() && !isEmployeeProfile && setIsLoading(true)
        Promise.all([queryTargetRouteSalesGeoToGetAccount(), AsyncStorage.getItem(SDLMyCustomerData)])
            .then(async (dataArr) => {
                const soupArr = dataArr.length > 0 ? dataArr[0] : []
                const storageArr = dataArr.length > 1 ? JSON.parse(dataArr[1]) : []
                const popData = getPopUpData(soupArr, storageArr)
                setSubTypeArray(popData)
                setSelectedSubType(popData)
                !customerFilters?.switchOnStoreNearMe && setCustomerOriginList(soupArr)
                if (isPersonaUGM() && !isEmployeeProfile) {
                    const position = await LocationService.getCurrentPosition()
                    const currentLatitude = position.coords.latitude
                    const currentLongitude = position.coords.longitude
                    soupArr.forEach((item) => {
                        if (!_.isEmpty(item.Customer_Latitude__c) && !_.isEmpty(item.Customer_Longitude__c)) {
                            const distance = LocationService.getDistance(
                                currentLatitude,
                                currentLongitude,
                                item.Customer_Latitude__c,
                                item.Customer_Longitude__c
                            )
                            // if in Canada, need to use km, otherwise mileage, unit of distance default is meter
                            item.distanceFromMe = manager?.isInCanada
                                ? distance / Constants.METER_TO_KILOMETER
                                : distance * Constants.METER_TO_MILEAGE_FACTOR
                        }
                    })
                }
                const filteredData: any = filterByTypeTextMethod(soupArr, isEmployeeProfile ? popData : [], selectInput)
                if (customerFilters?.switchOnStoreNearMe) {
                    setCustomerOriginList(soupArr)
                    filterCustomerList(filteredData)
                } else {
                    setCustomerList(filteredData)
                }
                isPersonaUGM() && !isEmployeeProfile && setIsLoading(false)
            })
            .catch((error) => {
                isPersonaUGM() && !isEmployeeProfile && setIsLoading(false)
                storeClassLog(Log.MOBILE_ERROR, 'getCustomerListForSDL', ErrorUtils.error2String(error))
            })
    }

    const combineDataWithSoupService = async () => {
        try {
            const dataArr = await Promise.all([
                queryTargetRouteSalesGeoToGetAccount(userData.id),
                SoupService.retrieveDataFromSoup(
                    'Customer_to_Route__c',
                    {},
                    SDLMyCustomerQueries.getEmployeeProfileQuery.f,
                    formatString(SDLMyCustomerQueries.getEmployeeProfileQuery.q, [userData.id])
                ),
                SoupService.retrieveDataFromSoup('Route_Frequency_Mapping__mdt', {}, [], null)
            ])
            const res = dataArr[0]
            const ctrList = dataArr[1] || []
            const rfmList = dataArr[2] || []
            const combineData = res.map((item) => {
                const cloneItem = _.cloneDeep(item)
                cloneItem.ctrFrequency = handleCustomerFrequency(item.AccountId, ctrList, rfmList)
                cloneItem.ctrOrderDay = handleCTROrderDay(item.AccountId, ctrList)
                return cloneItem
            })
            setCustomerOriginList(combineData)
            setCustomerList(combineData)
        } catch (error) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_EDIT_LOCATION_REFRESH, error)
            storeClassLog(Log.MOBILE_ERROR, 'combineDataWithSoupService', ErrorUtils.error2String(error))
        }
    }

    const getSoupDataBasedOnPersonalAnd = () => {
        if (
            CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER ||
            CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER
        ) {
            if (isEmployeeProfile) {
                combineDataWithSoupService()
            } else {
                getCustomerListForSDL()
            }
        } else if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
            setHideFilterBtn(true)
            queryTargetRouteSalesGeoToGetAccount()
                .then((res) => {
                    setCustomerOriginList(res)
                    setCustomerList(res)
                })
                .catch((error) => {
                    storeClassLog(Log.MOBILE_ERROR, 'getSoupDataBasedOnPersonalAnd', ErrorUtils.error2String(error))
                })
        }
    }

    const debounceSearch = useCallback(
        _.debounce((inputString) => {
            const filteredData: any = filterByTypeTextMethod(
                customerOriginList,
                isEmployeeProfile ? subTypeArray : [],
                inputString
            )
            if (customerFilters?.switchOnStoreNearMe) {
                filterCustomerList(filteredData)
            } else {
                setCustomerList(filteredData)
            }
        }, 350),
        [customerOriginList, subTypeArray, customerFilters?.switchOnStoreNearMe, selectInput, activeTab]
    )

    const onChangeSearchBarText = (inputString: string) => {
        setSelectInput(inputString)
        debounceSearch(inputString)
    }
    useEffect(() => {
        if (isFocused) {
            if (isEmployeeProfile) {
                setSelectInput('')
                setCustomerList([])
            } else {
                !isPersonaUGM() && setSelectInput('')
            }
            _.isEmpty(selectInput) && !customerFilters?.switchOnStoreNearMe && getSoupDataBasedOnPersonalAnd()
            if (!customerFilters?.switchOnStoreNearMe) {
                setActiveTab(0)
            }
        }
    }, [isFocused])

    useEffect(() => {
        const myCustomerFilter = NativeAppEventEmitter.addListener(EventEmitterType.MY_CUSTOMER_FILTER, (item) => {
            setCustomerFilters(item)
            if (!item?.switchOnStoreNearMe) {
                searchBarRef?.current?.onResetClick()
                setSelectInput('')
                setCustomerList([])
            }
        })
        return () => {
            myCustomerFilter && myCustomerFilter.remove()
        }
    }, [customerOriginList])

    useEffect(() => {
        if (customerFilters?.switchOnStoreNearMe) {
            const filteredData: any = filterByTypeTextMethod(customerOriginList, [], selectInput)
            filterCustomerList(filteredData)
        }
    }, [customerFilters, selectInput, activeTab])

    const onClickFilterBtn = () => {
        isPersonaUGM()
            ? navigation.navigate('MyCustomerFilter', {
                  switchOnStoreNearMe: customerFilters?.switchOnStoreNearMe,
                  distanceStoreNearMe: customerFilters?.distanceStoreNearMe
              })
            : setTypeModalVisible(!typeModalVisible)
    }

    const onCancelSubType = () => {
        setTypeModalVisible(false)
        const changeSubType = JSON.parse(JSON.stringify(selectedSubType))
        setSubTypeArray(changeSubType)
    }
    const updateVisitSubType = () => {
        setTypeModalVisible(false)
        const changeSubType = JSON.parse(JSON.stringify(subTypeArray))
        setSelectedSubType(changeSubType)
        const filterData = filterByTypeTextMethod(customerOriginList, changeSubType, selectInput)
        setCustomerList(filterData)
        AsyncStorage.setItem(SDLMyCustomerData, JSON.stringify(changeSubType))
    }
    const onClickCheck = (index: number) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray(_.cloneDeep([...subTypeArray]))
    }

    const renderEmptyPage = () => {
        if (
            CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER &&
            selectInput.length === 0 &&
            !customerFilters?.switchOnStoreNearMe
        ) {
            return (
                <View style={styles.emptyView}>
                    <EmptyImage style={[styles.emptyImage, isEmployeeProfile && styles.customerNum]} />
                    <CText style={styles.emptyTitle}>{t.labels.PBNA_MOBILE_USE_SEARCH_BAR_TIP}</CText>
                    <CText style={styles.emptyDescription}>{t.labels.PBNA_MOBILE_SEARCH_CUSTOMER_CRITERIA}</CText>
                </View>
            )
        }
    }

    const pullDownSyncLatestData = async () => {
        await syncDownDataByTableNames(ScreenMapping.UGMMyCustomer)
        getSoupDataBasedOnPersonalAnd()
    }

    const onTabChanged = (index: number) => {
        setActiveTab(index)
    }

    const renderMapView = () => {
        return (
            <View style={{ flex: 1, marginTop: -22 }}>
                <SDLMyCustomerMapView customerList={customerList} navigation={navigation} />
            </View>
        )
    }

    return (
        <View style={[isEmployeeProfile ? styles.container_SDL : styles.container]}>
            <View style={[isEmployeeProfile ? styles.sdlContainer : styles.mainContainer]}>
                {!isEmployeeProfile && (
                    <View style={styles.headerContainer}>
                        <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_CUSTOMERS}</CText>
                    </View>
                )}
                {!isMapView && (
                    <View style={[isEmployeeProfile ? styles.metrics_employee : styles.metrics]}>
                        <SearchBarWithFilter
                            cRef={searchBarRef}
                            hideFilterBtn={hideFilterBtn}
                            initSearchValue={selectInput}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMERS}
                            onChangeSearchBarText={onChangeSearchBarText}
                            onClickFilter={onClickFilterBtn}
                            filterSelected={customerFilters?.switchOnStoreNearMe}
                        />
                        {isEmployeeProfile && (
                            <CText style={styles.customerNum}>
                                {customerList.length} {_.capitalize(t.labels.PBNA_MOBILE_CUSTOMERS)}
                            </CText>
                        )}
                    </View>
                )}
                {isMapView && <View style={styles.mapViewTopPlaceholder} />}
            </View>

            {customerFilters?.switchOnStoreNearMe && (
                <SelectTab
                    style={styles.salesMethodView}
                    listData={salesMethodsData}
                    specialWidth
                    specialIndex={salesMethodsObj.foodService.index}
                    changeTab={onTabChanged}
                    activeTab={activeTab}
                />
            )}

            {!isEmployeeProfile && !isMapView && renderEmptyPage()}

            {!isMapView && (
                <SDLMyCustomerList
                    dataSource={customerList}
                    cellRef={customerCell}
                    isEmployeeProfile={isEmployeeProfile}
                    onClickCell={async (account) => {
                        navigation.navigate('CustomerDetailScreen', {
                            customer: { AccountId: account?.item?.AccountId },
                            readonly: true
                        })
                    }}
                    pullDownSyncCB={!isEmployeeProfile && isPersonaUGM() && pullDownSyncLatestData}
                />
            )}
            {isMapView && renderMapView()}
            {customerFilters?.switchOnStoreNearMe && <MapDraggable setIsMapView={setIsMapView} isMapView={isMapView} />}

            <SubTypeModal
                cancelTitle={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                doneTitle={t.labels.PBNA_MOBILE_DONE}
                customTitle={t.labels.PBNA_MOBILE_SELECT_TERRITORY}
                customSubTitle={t.labels.PBNA_MOBILE_SELECT_SUBTITLE}
                subTypeArray={subTypeArray}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    onClickCheck(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType()
                }}
                updateVisitSubType={() => {
                    updateVisitSubType()
                }}
            />
            {isPersonaUGM() && !isEmployeeProfile && <Loading isLoading={isLoading} />}
        </View>
    )
}

export default SDLMyCustomer
