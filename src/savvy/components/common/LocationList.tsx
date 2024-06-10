/**
 * @description Location List
 * @author Fangfang ji
 * @date 2021-12-21
 */

import React, { FC, useEffect, useRef, useState } from 'react'
import {
    View,
    SectionList,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    DeviceEventEmitter,
    Keyboard
} from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import CText from '../../../common/components/CText'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../../../common/components/Loading'
import { t } from '../../../common/i18n/t'
import SearchBarWithFilter from '../sales/my-customer/SearchBarWithFilter'
import FormBottomButton from '../../../common/components/FormBottomButton'
import { SoupService } from '../../service/SoupService'
import GreenCheck from '../../../../assets/image/Green-Check.svg'
import { getUserCityName, getNotificationsWithNet } from '../../utils/MerchManagerUtils'
import { compose } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import { getNewWrapString } from '../../utils/CommonUtils'
import { updateLastViewedLocation } from '../../api/ApexApis'
import { restDataCommonCall } from '../../api/SyncUtils'
import StatusCode from '../../enums/StatusCode'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { getFinalDate } from '../manager/notifications/NotificationCenter'
import { clearNotifications } from '../../api/connect/NotificationUtils'
import { isPersonaManager, isPersonaPSR } from '../../../common/enums/Persona'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { SafeAreaView } from 'react-native-safe-area-context'
import StarOutlined from '../../../../assets/image/icon-star-outlined.svg'
import { AssetAttributeService } from '../../service/AssetAttributeService'
import _ from 'lodash'
import SyncUpService from '../../../orderade/service/SyncUpService'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { loadRoutesForSwitch } from '../../utils/InnovationProductUtils'
import NetInfo from '@react-native-community/netinfo'
import { resetReduxState } from '../../utils/InitUtils'
import OrderService from '../../../orderade/service/OrderService'

let selLocObj: any = {}
let selRouteObj: any = {}
interface LocationListProps {
    props?: any
    navigation?: any
    route?: any
}
const styles = StyleSheet.create({
    con: { flex: 1, backgroundColor: '#fff' },
    title: {
        fontSize: 24,
        color: '#000',
        marginBottom: 34,
        marginTop: 10,
        fontWeight: '900'
    },
    headCon: { paddingHorizontal: 22, marginBottom: 30 },
    list: { flex: 1, marginBottom: 60 },
    sectionHeadCon: {
        height: 60,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        paddingLeft: 22
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    itemCon: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        marginLeft: 22,
        paddingRight: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    starIconStyle: {
        marginLeft: 10,
        transform: [{ translateY: 1 }],
        color: '#01a2d9'
    }
})
const LocationList: FC<LocationListProps> = ({ navigation, route }: LocationListProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [dataArr, setDataArr] = useState<Array<any>>([])
    const [searchText, setSearchText] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [disableSave, setDisableSave] = useState(true)
    const [selLocId, setSelLocId] = useState(CommonParam.userLocationId)
    const [psrUserRoute, setPSRUserRoute] = useState({
        Id: ''
    })
    const dispatch = useDispatch()
    const updateIsInCanada = compose(dispatch, managerAction.setIsInCanada)
    const { dropDownRef } = useDropDown()
    const listType = route?.params?.listType
    const [selRouteId, setSelRouteId] = useState('')
    const searchBarRef: any = useRef(null)
    const [locationChanged, setLocationChanged] = useState(false)

    const getLocationArr = async () => {
        const tempDataArr = [
            // no recent location recent temp
            // {
            //     title: 'Recent Locations',
            //     key: 'recent',
            //     data: []
            // },
            {
                title: isPersonaPSR()
                    ? t.labels.PBNA_MOBILE_ATC_AVAILABLE_LOCATION
                    : t.labels.PBNA_MOBILE_OTHER_LOCATION,
                key: 'other',
                data: CommonParam.locationArr
            }
        ]
        setDataArr(tempDataArr)
    }

    const refreshAvailableRouteList = async (oldRouteArr: Array<any>) => {
        const state = await NetInfo.fetch()
        if (!state?.isInternetReachable) {
            return oldRouteArr
        }
        const freshRoutes = await loadRoutesForSwitch(
            `AND LOC_ID__c = '${CommonParam.userLocationId}' ORDER BY GTMU_RTE_ID__c ASC `
        )
        const curRoute = await AsyncStorage.getItem('psrUserRoute')
        if (!curRoute) {
            return freshRoutes
        }
        const curRouteData = oldRouteArr.find((oldRoute) => oldRoute?.Id === JSON.parse(curRoute || '')?.Id)
        const isCurRouteValid = !_.isEmpty(freshRoutes.find((freshRoute) => freshRoute?.Id === curRouteData?.Id))
        if (!isCurRouteValid) {
            freshRoutes.push(curRouteData)
        }
        return freshRoutes
    }

    const getRouteArr = async () => {
        AsyncStorage.getItem('psrRouteArr').then(async (res) => {
            let routeArr: any = []
            if (res) {
                routeArr = JSON.parse(res)
                global.$globalModal.openModal()
                routeArr = await refreshAvailableRouteList(routeArr)
                global.$globalModal.closeModal()
            }
            setDataArr([
                {
                    title: t.labels.PBNA_MOBILE_ATC_AVAILABLE_ROUTE,
                    key: 'other',
                    data: routeArr
                }
            ])
        })
    }

    const getCurRoute = () => {
        AsyncStorage.getItem('psrUserRoute').then((res) => {
            if (res) {
                const curRoute = JSON.parse(res)
                setSelRouteId(curRoute.Id)
                setPSRUserRoute(curRoute)
            }
        })
    }

    useEffect(() => {
        if (listType === 'Route') {
            getRouteArr()
            getCurRoute()
        } else {
            getLocationArr()
        }
    }, [])
    const onItemPress = (item) => {
        if (listType === 'Route') {
            const routeId = item.Id
            selRouteObj = item
            setSelRouteId(routeId)
            setDisableSave(routeId === psrUserRoute.Id)
        } else {
            const locId = item.SLS_UNIT_ID__c
            selLocObj = item
            setSelLocId(locId)
            setDisableSave(locId === CommonParam.userLocationId)
        }
        Keyboard.dismiss()
    }

    const onChangeLocation = async () => {
        getUserCityName(updateIsInCanada)
        setIsLoading(true)
        Instrumentation.startTimer('Switch Location')
        if (isPersonaPSR()) {
            const logMsg = `User switched location to ${selLocObj?.SLS_UNIT_NM__c} at ${formatWithTimeZone(
                moment(),
                TIME_FORMAT.YMDTHMS,
                true,
                true
            )}`
            Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
            appendLog(Log.MOBILE_INFO, 'orderade:change location', logMsg)
            await SyncUpService.syncUpLocalData()
            const param = await AsyncStorage.getItem('Persona')
            const persona = JSON.parse(param)
            persona.userLocationId = selLocObj?.SLS_UNIT_ID__c
            persona.userLocationName = selLocObj.SLS_UNIT_NM__c
            persona.Last_Location_Viewed__c = selLocObj?.SLS_UNIT_ID__c
            persona.userRouteGTMUId = ''
            persona.userRouteId = ''
            CommonParam.isSwitchLocation = true
            await AsyncStorage.setItem('Persona', JSON.stringify(persona))
            Instrumentation.stopTimer('Switch Location')
        } else {
            const requestBody = {
                strUserId: CommonParam.userId,
                strLOCID: selLocObj?.SLS_UNIT_ID__c
            }
            const res = await updateLastViewedLocation(requestBody)
            if (res.status === StatusCode.SuccessOK && res.data === 'Success') {
                const param = await AsyncStorage.getItem('Persona')
                const persona = JSON.parse(param)
                persona.userLocationId = selLocObj?.SLS_UNIT_ID__c
                persona.userLocationName = selLocObj.SLS_UNIT_NM__c
                CommonParam.isSwitchLocation = true
                if (isPersonaManager()) {
                    const notificationList = await getNotificationsWithNet()
                    const finalNotification = getFinalDate(notificationList)
                    const ids = []
                    if (finalNotification.length > 0) {
                        finalNotification.forEach((element) => {
                            element?.data.forEach((item) => {
                                item.read = true
                                ids.push(item.id)
                            })
                        })
                        await clearNotifications(ids)
                    }
                    PushNotificationIOS.removeAllDeliveredNotifications()
                    DeviceEventEmitter.emit('NotificationCenterUnreadCount', 0)
                }
                await AsyncStorage.removeItem('user')
                await AsyncStorage.removeItem('lastModifiedDate')
                await AsyncStorage.removeItem('isSyncSuccessfully')
                await AsyncStorage.setItem('Persona', JSON.stringify(persona))
                await AsyncStorage.removeItem('SDLMyDayTerritoryList')
                await AssetAttributeService.removeAssetAttributeLastSyncTime()
                await SoupService.removeStore()
                Instrumentation.stopTimer('Switch Location')
                setIsLoading(false)
                navigation.navigate('LandingSavvy')
            } else {
                setIsLoading(false)
                dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_SWITCH_LOCATION_FAILURE)
            }
        }
    }

    const onChangeRoute = async () => {
        const logMsg = `User switched route to ${selRouteObj.GTMU_RTE_ID__c} at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade:change route', logMsg)
        setIsLoading(true)
        const res = await restDataCommonCall(`sobjects/User/${CommonParam.userId}`, 'PATCH', {
            Last_Route_Viewed__c: selRouteObj.GTMU_RTE_ID__c
        })
        if (res.status === StatusCode.SuccessNoContent) {
            if (isPersonaPSR()) {
                await SyncUpService.syncUpLocalData()
                await AsyncStorage.removeItem('configLastSyncTime')
                await resetReduxState()
            }
            await AsyncStorage.removeItem('user')
            await AsyncStorage.removeItem('lastModifiedDate')
            await AsyncStorage.removeItem('isSyncSuccessfully')
            await AsyncStorage.removeItem('SDLMyDayTerritoryList')
            const objs = CommonParam.objs
            for (const obj of objs) {
                if (
                    [
                        'Preset',
                        'CartDetail',
                        'CartItem',
                        'LogItem',
                        'Ord_Staging__c',
                        'OrdLineItem_Staging__c'
                    ].includes(obj.name)
                ) {
                    continue
                }
                if (obj.name === 'Order') {
                    OrderService.deleteOrderKeepLocal()
                    continue
                } else if (obj.name === 'OrderItem') {
                    OrderService.deleteOrderItemKeepLocal()
                    continue
                }
                await SoupService.clearSoup(obj.name)
            }
            CommonParam.isSwitchRoute = true
            setIsLoading(false)
            // navigation.navigate('Landing', {
            //     isSwitchRoute: true
            // })
            navigation.navigate('LandingSavvy')
        } else {
            setIsLoading(false)
            dropDownRef.current.alertWithType('error', res.status)
        }
    }

    const onPressSave = async () => {
        let title, msg
        if (listType === 'Route') {
            title = `${t.labels.PBNA_MOBILE_ATC_SWITCH_ROUTE_TO} \n${selRouteObj.GTMU_RTE_ID__c || ''} - ${
                selRouteObj?.User__r?.Name || ''
            }`
            msg = getNewWrapString(t.labels.PBNA_MOBILE_ATC_SWITCH_ROUTE_MSG)
            Alert.alert(title, msg, [
                {
                    text: t.labels.PBNA_MOBILE_NO
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: async () => {
                        if (locationChanged) {
                            await onChangeLocation()
                        }
                        await onChangeRoute()
                    }
                }
            ])
        } else {
            if (isPersonaPSR()) {
                if (CommonParam.userLocationId !== selLocObj?.SLS_UNIT_ID__c) {
                    CommonParam.userLocationId = selLocObj?.SLS_UNIT_ID__c
                    CommonParam.userLocationName = selLocObj.SLS_UNIT_NM__c
                    setLocationChanged(true)
                    CommonParam.isSwitchLocation = true
                    await AsyncStorage.removeItem('psrUserRoute')
                }
                navigation.goBack()
            } else {
                onChangeLocation()
            }
        }
    }
    const onPressCancel = () => {
        navigation && navigation.goBack()
    }
    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    const searchAction = (text: string) => {
        const processedString = escapeRegExp(text)
        const searchRegExp = new RegExp(processedString, 'i')
        setSearchText(processedString)
        if (listType === 'Route') {
            if (!_.isEmpty(processedString)) {
                setSearchResult(
                    (dataArr?.[0]?.data || []).filter((el) => {
                        return (
                            (el.GTMU_RTE_ID__c && el.GTMU_RTE_ID__c.match(searchRegExp)) ||
                            (el?.User__r?.Name && el.User__r?.Name.match(searchRegExp)) ||
                            (el?.User__r?.GPID__c && el.User__r?.GPID__c.match(searchRegExp)) ||
                            (el?.LOCL_RTE_ID__c && el?.LOCL_RTE_ID__c.match(searchRegExp))
                        )
                    })
                )
            }
        } else {
            const tempList: any = []
            CommonParam.locationArr.forEach((item: any) => {
                const name = item?.SLS_UNIT_NM__c?.toUpperCase()
                const LocId = item?.SLS_UNIT_ID__c
                if ((name && name.match(searchRegExp)) || (LocId && LocId.match(searchRegExp))) {
                    tempList.push(item)
                }
            })

            setSearchResult(tempList)
        }
    }
    const renderItem = ({ item, index, section = null }: { item?; index?; section? } = {}) => {
        let isCurLocation
        if (listType === 'Route') {
            isCurLocation = selRouteId === item.Id
        } else {
            isCurLocation = selLocId === item.SLS_UNIT_ID__c
        }
        return (
            <TouchableOpacity onPress={() => onItemPress(item)}>
                <View style={[styles.itemCon, index === section?.data?.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                    <CText>
                        {listType === 'Route'
                            ? `${item.GTMU_RTE_ID__c || ''} - ${item?.User__r?.Name || ''}`
                            : item.SLS_UNIT_NM__c}
                    </CText>
                    {listType === 'Route' && item?.User__r?.GPID__c === CommonParam.GPID__c && (
                        <StarOutlined style={styles.starIconStyle} />
                    )}
                    <View style={styles.list} />
                    {isCurLocation && <GreenCheck />}
                </View>
            </TouchableOpacity>
        )
    }
    const renderSectionHeader = ({ section }) => {
        const { title } = section
        return (
            <View style={styles.sectionHeadCon}>
                <CText style={styles.sectionTitle}>{title}</CText>
            </View>
        )
    }
    const renderHeader = () => {
        return (
            <View style={styles.headCon}>
                <CText style={styles.title}>
                    {listType === 'Route'
                        ? t.labels.PBNA_MOBILE_ATC_CHOOSE_ROUTE
                        : t.labels.PBNA_MOBILE_CHOOSE_LOCATION}
                </CText>
                <SearchBarWithFilter
                    cRef={searchBarRef}
                    hideFilterBtn
                    placeholder={
                        listType === 'Route'
                            ? t.labels.PBNA_MOBILE_ATC_SEARCH_ROUTE
                            : t.labels.PBNA_MOBILE_SEARCH_LOCATION
                    }
                    onChangeSearchBarText={searchAction}
                    onClickClearIcon={() => {
                        setSearchText('')
                    }}
                    onFocus={() => {
                        searchBarRef?.current?.onResetClick()
                        setSearchText('')
                    }}
                />
            </View>
        )
    }

    const keyExtractor = listType === 'Route' ? (item) => item.Id : (item) => item.SLS_UNIT_ID__c

    return (
        <SafeAreaView style={styles.con}>
            {renderHeader()}
            {searchText ? (
                <FlatList
                    keyboardShouldPersistTaps="always"
                    style={styles.list}
                    data={searchResult}
                    extraData={searchResult}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                />
            ) : (
                <SectionList
                    keyboardShouldPersistTaps="always"
                    style={styles.list}
                    sections={dataArr}
                    extraData={dataArr}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    renderSectionHeader={renderSectionHeader}
                />
            )}
            <FormBottomButton
                disableSave={disableSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_SAVE}
                onPressCancel={onPressCancel}
                onPressSave={onPressSave}
            />
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default LocationList
