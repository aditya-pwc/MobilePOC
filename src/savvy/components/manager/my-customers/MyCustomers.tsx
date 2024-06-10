import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Image, FlatList, Alert, TouchableOpacity, NativeAppEventEmitter, DeviceEventEmitter } from 'react-native'
import CText from '../../../../common/components/CText'
import SearchBarFilter from '../common/SearchBarFilter'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CustomerItem from '../common/CustomerItem'
import {
    closeOtherRows,
    closeAllOpenRow,
    onRemoveCustomerBtnClick,
    refreshManager,
    syncDownInStoreMap,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import { LocationService } from '../../../service/LocationService'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import MyCustomersStyle from '../../../styles/manager/MyCustomersStyle'
import SwipeableRow from '../../common/SwipeableRow'
import Loading from '../../../../common/components/Loading'
import ReassignResultModal from '../common/ReassignResultModal'
import { CommonLabel } from '../../../enums/CommonLabel'
import { getAllCustomerData, syncRemoteUserStatsWithoutInsertLocalSoup } from '../helper/MerchManagerHelper'
import MessageBar from '../common/MessageBar'
import { dataCheckWithAction } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { BooleanStr, DataCheckMsgIndex, DropDownType, EventEmitterType, NavigationRoute } from '../../../enums/Manager'
import { useDispatch } from 'react-redux'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import SubTypeModal from '../common/SubTypeModal'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { MerchManagerScreenMapping } from '../../../config/ScreenMapping'
import RefreshControlM from '../common/RefreshControlM'
import { CommonParam } from '../../../../common/CommonParam'
import { Persona } from '../../../../common/enums/Persona'
import { getLocationPosition } from '../helper/VisitHelper'
import { NotificationType } from '../../../../common/enums/NotificationType'
import { Buffer } from 'buffer'
import { createEmployeeTable, getDBConnection, getEmployeeData, saveEmployeeItems } from '../../../../../db-service'

// let db = openDatabase(
//     { name:"testDB.db", createFromLocation: 1 },
//     // { name: 'testDB.db', location: 'default' },
//     (success) => console.log('succesfully connected'),
//     (error) => {
//         console.log('error' + error.message)
//     }
// )
// console.log('here in mycustomer'+ JSON.stringify(db))
const iconAdd = ImageSrc.ADD_BLUE_CIRCLE

export const UserType = {
    UserType_Merch: 'Account Merchandiser',
    UserType_Sales: 'Sales Representative',
    UserType_Others: 'Others'
}

interface MyCustomersProps {
    route: any
    navigation: any
}
const GETOKTA_URL =
    'https://secure.ite.pepsico.com/oauth2/default/v1/token?grant_type=client_credentials&client_id=0oa1l1a1j5ugmmKnG0h8&client_secret=gVfSzOaODk4PUJ_39k1mSOUz51gm-5DdM4fy9pKB'
const GET_CUSTOMER_URL =
    'https://shonline.dev.mypepsico.com/qamerch/master/schedules/71086034/20240404/Customers_20240404.json'
const GET_SCHEDULE_URL =
    'https://shonline.dev.mypepsico.com/qamerch/master/schedules/71086034/20240404/Schedule_20240404.json'

// function getOktaBearer() {
//     const url = 'https://secure.ite.pepsico.com/oauth2/default/v1/token'
//     const clientId = '0oa1l1a1j5ugmmKnG0h8'
//     const clientSecret = 'gVfSzOaODk4PUJ_39k1mSOUz51gm-5DdM4fy9pKB'
//     const requestBody = {
//         grant_type: 'client_credentials',
//         client_id: clientId,
//         client_secret: clientSecret
//     }

//     fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: Object.keys(requestBody)
//             .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]))
//             .join('&')
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok')
//             }
//             return response.json()
//         })
//         .then((data) => {
//             // console.log('Token-->', data.access_token)
//             return data.access_token
//         })
//         .catch((error) => {
//             console.error('Error:', error)
//         })
// }
async function getBearer() {
    const url = 'https://secure.ite.pepsico.com/oauth2/default/v1/token'
    const clientId = '0oa1l1a1j5ugmmKnG0h8'
    const clientSecret = 'gVfSzOaODk4PUJ_39k1mSOUz51gm-5DdM4fy9pKB'
    const requestBody = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: Object.keys(requestBody)
                .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]))
                .join('&')
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        console.error('Error:', error)
        return null // or handle error accordingly
    }
}

async function getCustomer(BearerToken) {
    try {
        const response = await fetch(GET_CUSTOMER_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${BearerToken}`,
                Accept: 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Network error')
        }

        const data = await response.json()
        return data.Cust
    } catch (error) {
        throw new Error('Error fetching customer data: ' + error.message)
    }
}

function getSchedule(BearerToken) {
    fetch(GET_SCHEDULE_URL, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${BearerToken}`,
            Accept: 'application/json'
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network error')
            }
            return response.json()
        })
        .then((data) => {
            console.log(data)
        })
}
async function fetchBearerAndLog() {
    console.log('calling api')
    try {
        const bearer = await getBearer()
        const customer = await getCustomer(bearer)
        // console.log('customer await' + JSON.stringify(customer))
        // getSchedule(bearer)
    } catch (error) {
        console.error('Error in fetchBearerAndLog:', error)
    }
}

fetchBearerAndLog()

const styles = MyCustomersStyle
const itemClick = async (
    item,
    type,
    navigation,
    setSwipeableRows,
    swipeableRows,
    mapInfo,
    setIsLoading,
    getCustomerList,
    setIsErrorShow
) => {
    setIsLoading(true)
    if (type === CommonLabel.CUSTOMER_ITEM_CLICK_MODAL) {
        try {
            const rsCheck = await dataCheckWithAction('RetailStore', `WHERE Id='${item?.id}'`, '', false)
            const accountCheck = await dataCheckWithAction('Account', `WHERE Id='${item?.accountId}'`, '', false)
            if (!rsCheck || !accountCheck) {
                closeAllOpenRow(swipeableRows)
                setIsLoading(false)
                setIsErrorShow(true)
                return
            }
            await syncDownDataByTableNames(MerchManagerScreenMapping.MyCustomer)
            const customerList = await getCustomerList()
            await syncDownInStoreMap(item.id)
            const userStats = await syncRemoteUserStatsWithoutInsertLocalSoup(item.userId)
            const checkItem = customerList.find((customer) => customer.id === item.id)
            if (!checkItem) {
                setIsLoading(false)
                setIsErrorShow(true)
                return
            }
            item = Object.assign(checkItem, userStats)
            setIsLoading(false)
            navigation.navigate(NavigationRoute.CUSTOMER_DETAIL, { customerData: item, mapInfo })
        } catch (error) {
            setIsLoading(false)
        }
    }
    if (type === CommonLabel.CUSTOMER_ITEM_CLICK_LOCATION) {
        const originLocation = { latitude: mapInfo.region?.latitude, longitude: mapInfo.region?.longitude }
        const targetLocation = { latitude: item.latitude, longitude: item.longitude }
        if (!targetLocation.latitude || !targetLocation.longitude) {
            Alert.alert(t.labels.PBNA_MOBILE_CUSTOMER_DETAIL_NO_GEOLOCATION)
        } else {
            LocationService.gotoLocation(originLocation, targetLocation)
        }
        setIsLoading(false)
    }
    setSwipeableRows(swipeableRows)
}
export const sortCustomerList = (stores) => {
    const errList = []
    const norList = []
    let unassignedCount = 0
    let bothUnassignAndErr = 0
    stores.forEach((store) => {
        if (store.isError) {
            errList.push(store)
        } else {
            norList.push(store)
        }
        if (store.unassignedVisitCount > 0) {
            unassignedCount++
        }
        if (store.unassignedVisitCount > 0 && store.isError) {
            bothUnassignAndErr++
        }
    })
    const custList = errList.concat(norList)
    const errCustCount = errList.length
    return { custList, errCustCount, unassignedCount, bothUnassignAndErr }
}
const MyCustomers = ({ navigation }: MyCustomersProps) => {
    const searchBarFilter: any = useRef()
    const [customerOriginList, setCustomerOriginList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [swipeableRows, setSwipeableRows] = useState({})
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [customerName, setCustomerName] = useState('')
    const [errCusCount, setErrCusCount] = useState(0)
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [isPullDownSync, setIsPullDownSync] = useState(false)
    const [employee, setEmployee] = useState([])

    const [customer, setCustomers] = useState([])

    const [mapInfo, setMapInfo] = useState({
        region: null
    })
    const [unassignedCount, setUnassignedCount] = useState(0)
    const [bothUnassignAndErr, setBothUnassignAndErr] = useState(0)
    const { dropDownRef } = useDropDown()
    const dispatch = useDispatch()
    const getLineCodeMap = compose(dispatch, managerAction.getLineCodeMap)

    const subTypeArray = [
        {
            select: false,
            name: t.labels.PBNA_MOBILE_TERRITORY_ONE
        },
        {
            select: false,
            name: t.labels.PBNA_MOBILE_TERRITORY_TWO
        },
        {
            select: false,
            name: t.labels.PBNA_MOBILE_TERRITORY_THREE
        },
        {
            select: false,
            name: t.labels.PBNA_MOBILE_TERRITORY_FOUR
        },
        {
            select: false,
            name: t.labels.PBNA_MOBILE_TERRITORY_FIVE
        }
    ]

    const getCustomerList = async () => {
        return new Promise((resolve, reject) => {
            getAllCustomerData(true, dropDownRef)
                .then((stores: Array<any>) => {
                    const { custList, errCustCount, unassignedCount, bothUnassignAndErr } = sortCustomerList(stores)
                    searchBarFilter?.current?.onApplyClick(custList)
                    setCustomerOriginList(custList)
                    setErrCusCount(errCustCount)
                    setUnassignedCount(unassignedCount)
                    setBothUnassignAndErr(bothUnassignAndErr)
                    DeviceEventEmitter.emit(
                        NotificationType.UPDATE_MY_CUSTOMER_BADGE,
                        errCustCount + unassignedCount - bothUnassignAndErr
                    )
                    resolve(custList)
                })
                .catch((e) => {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        CommonLabel.MY_CUSTOMERS + ' - getCustomerList',
                        e
                    )
                    reject(e)
                })
        })
    }
    const getCustomerListWithLoading = async () => {
        setIsLoading(true)
        const customerLists = await getCustomerList()
        setIsLoading(false)
        return customerLists
    }
    const refreshAndGetData = async () => {
        await refreshManager()
        await getCustomerList()
    }
    const getRegion = () => {
        getLocationPosition(setMapInfo)
    }

    const syncWhenClickTab = async (showLoading: boolean) => {
        if (showLoading) {
            setIsLoading(true)
        }
        try {
            await syncDownDataByTableNames(MerchManagerScreenMapping.MyCustomer)
            await getCustomerList()
            getRegion()
            if (showLoading) {
                setIsLoading(false)
            }
        } catch (error) {
            if (showLoading) {
                setIsLoading(false)
            }
        }
    }

    const url =
        'https://zalu452hr1nzt1yc.apps.cloud.couchbase.com:4984/demoemployee/_all_docs?include_docs=true&limit=5'
    const username = 'halomobile'
    const password = 'Halo@123'
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64')

    let cbData = []
    let outputData = []
    const CBfetchData = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: 'Basic ' + encodedCredentials
                }
            })

            if (!response.ok) {
                throw new Error('Netwrok response was not ok. Status' + response.status)
            }
            const jsonData = await response.json()
            cbData = jsonData.rows
            outputData = cbData.map((item) => item.doc)
            return outputData
        } catch (e) {
            console.error('Error', e)
        }
    }
    const tableName = 'Employee'
    // const createEmployeeTable = () => {
    //     // create table if not exists
    //     const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
    //         _id INTEGER PRIMARY KEY ,
    //         FirstName TEXT,
    //         LastName TEXT,
    //         Name Text ,
    //         Profile Text,
    //         GPID__c TEXT,
    //         GM_LOC_ID__c TEXT,
    //         Phone INTEGER);`
    //     db.transaction((txn) => {
    //         txn.executeSql(
    //             query,
    //             [],
    //             (sqlTxn, res) => {
    //                 console.log('table created succesfully', sqlTxn)
    //             },
    //             (error) => console.log('error creating table' + error.message)
    //         )
    //     })
    // }
    const loadDataCallback = useCallback(async () => {
        try {
            // await CBfetchData()
            console.log('here')
            const db = await getDBConnection()
            console.log(outputData)
            await db.executeSql(`DROP TABLE IF EXISTS ${tableName}`)
            await createEmployeeTable(db)
            await saveEmployeeItems(db, outputData)
            const data = await getEmployeeData(db)
            setEmployee(data)

            // const insertQuery = `INSERT OR REPLACE INTO ${tableName} (_id, FirstName, LastName, Phone, Name, GM_LOC_ID__c, GPID__c, Profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

            // const values = [1, 'Aditya', 'Goswami', '898999', 'Aditya', 1234, 111, 'Supervisor']

            // Assuming you have a db object from opening the database connection
            // db.transaction((tx) => {
            //     tx.executeSql(
            //         insertQuery,
            //         values,
            //         (_, result) => {
            //             console.log('Insert successful user', result.rows)
            //         },
            //         (_, error) => {
            //             console.error('Error inserting data', error)
            //         }
            //     )
            // })
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        getLineCodeMap()
        loadDataCallback()

        syncWhenClickTab(true)
        const myCustomerListener = NativeAppEventEmitter.addListener(
            EventEmitterType.REFRESH_MY_CUSTOMERS,
            async () => {
                closeAllOpenRow(swipeableRows)
                await syncWhenClickTab(false)
            }
        )
        return () => {
            myCustomerListener && myCustomerListener.remove()
        }
    }, [])
    const onRemoveCustomerClick = async (customerData) => {
        setIsLoading(true)
        const rsCheck = await dataCheckWithAction('RetailStore', `WHERE Id='${customerData?.item?.id}'`, '', false)
        const accountCheck = await dataCheckWithAction(
            'Account',
            `WHERE Id='${customerData?.item?.accountId}'`,
            '',
            false
        )
        if (!rsCheck || !accountCheck) {
            closeAllOpenRow(swipeableRows)
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        setIsLoading(false)
        onRemoveCustomerBtnClick({
            updateVal: BooleanStr.STR_FALSE,
            selectedCustomer: customerData.item,
            setIsLoading,
            setResultModalVisible,
            navigation,
            dropDownRef,
            setCustomerName,
            swipeableRows
        })
            .then(() => {
                getCustomerListWithLoading()
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    CommonLabel.MY_CUSTOMERS + ' - Remove Customer',
                    err
                )
            })
    }

    const swipeButtonProps = [
        {
            label: t.labels.PBNA_MOBILE_REMOVE,
            color: baseStyle.color.red,
            onBtnClick: onRemoveCustomerClick
        }
    ]

    const renderItem = (item) => {
        return (
            <View style={styles.teamItem}>
                <SwipeableRow
                    uniqKey={item?.item?.id}
                    swipeableRows={swipeableRows}
                    closeOtherRows={closeOtherRows}
                    params={item}
                    swipeButtonConfig={swipeButtonProps}
                >
                    <CustomerItem
                        item={item}
                        isSwipeable
                        showIcon
                        showErr
                        showUnassigned
                        itemClick={(item, type) => {
                            itemClick(
                                item,
                                type,
                                navigation,
                                setSwipeableRows,
                                swipeableRows,
                                mapInfo,
                                setIsLoading,
                                getCustomerList,
                                setIsErrorShow
                            )
                        }}
                    />
                </SwipeableRow>
            </View>
        )
    }

    const refreshData = async () => {
        setIsLoading(true)
        await syncDownDataByTableNames(MerchManagerScreenMapping.MyCustomer)
        getRegion()
        getCustomerList()
        setIsLoading(false)
    }

    // TBD
    if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
        return (
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_CUSTOMERS}</CText>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_CUSTOMERS}</CText>
                    <TouchableOpacity
                        hitSlop={styles.hitSlop}
                        onPress={() => {
                            navigation.navigate(NavigationRoute.ADD_CUSTOMER)
                        }}
                    >
                        <Image style={styles.imgAdd} source={iconAdd} />
                    </TouchableOpacity>
                </View>
                {errCusCount > 0 && (
                    <MessageBar
                        message={
                            <CText>
                                <CText style={styles.errCountText}>
                                    {errCusCount + unassignedCount - bothUnassignAndErr}
                                </CText>{' '}
                                {t.labels.PBNA_MOBILE_CUSTLISTERRSTR}
                            </CText>
                        }
                        containerStyle={styles.errBar}
                        noImage={unassignedCount > 0}
                    />
                )}
                {unassignedCount > 0 && errCusCount === 0 && (
                    <MessageBar
                        message={
                            <CText>
                                <CText style={styles.errCountText}>{unassignedCount}</CText>{' '}
                                {t.labels.PBNA_MOBILE_CUSTOMER_WITH_UNASSIGNED_VISITS}
                            </CText>
                        }
                        containerStyle={styles.errBar}
                        imageUrl={ImageSrc.ICON_UNASSIGNED_BANNER}
                    />
                )}
                <View style={styles.metrics}>
                    <SearchBarFilter
                        cRef={searchBarFilter}
                        isCustomer
                        showErrBar
                        setListData={setCustomerList}
                        originData={customerOriginList}
                        originListData={customerList}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_BY_C_R_R}
                        onFilterClick={() => closeAllOpenRow(swipeableRows)}
                        onFocus={() => closeAllOpenRow(swipeableRows)}
                    />
                </View>
            </View>
            <View style={styles.customerList}>
                <FlatList
                    data={employee}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControlM
                            loading={isPullDownSync}
                            refreshAction={async () => {
                                setIsPullDownSync(true)
                                await refreshAndGetData()
                                setIsPullDownSync(false)
                            }}
                        />
                    }
                />
            </View>
            <ReassignResultModal
                navigation={navigation}
                isRemovedFromMyCustomer
                userName={customerName}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={refreshData}
            />
            <SubTypeModal
                customTitle={t.labels.PBNA_MOBILE_SELECT_TERRITORY}
                customSubTitle={t.labels.PBNA_MOBILE_SELECT_SUBTITLE}
                subTypeArray={subTypeArray}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default MyCustomers
