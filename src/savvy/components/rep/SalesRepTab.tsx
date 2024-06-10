/**
 * @description Main entry of the app for the sales rep.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-07-19
 * @lastModifiedDate 2021-07-19
 */
import React, { FC, useEffect, useState } from 'react'
import {
    AppState,
    DeviceEventEmitter,
    Image,
    ImageBackground,
    NativeEventEmitter,
    NativeModules,
    View,
    Alert
} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import LeadScreen from '../../pages/rep/lead/LeadScreen'
import CoPilotScreen from '../../pages/rep/CoPilotScreen'
import { CommonParam } from '../../../common/CommonParam'
import LeadBlueSvg from '../../../../assets/image/icon_lead_tab_highlight.svg'
import LeadSvg from '../../../../assets/image/icon_leads.svg'
import SalesNotificationCenter from '../../pages/rep/SalesNotificationCenter'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { refreshAllLeads, refreshLeadsBackground } from '../../utils/LeadUtils'
import { DeviceEvent } from '../../enums/DeviceEvent'
import { refreshKpiBarAction } from '../../redux/action/LeadActionType'
import { useDispatch } from 'react-redux'
import { useFormNotificationHooks, useNotificationCount } from '../../hooks/NotificationHooks'
import { syncUpLogs } from '../../utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import PopMessage from '../common/PopMessage'
import LottieView from 'lottie-react-native'
import { checkLeadWiring } from '../../api/ApexApis'
import ExploreScreen from '../../pages/rep/ExploreScreen'
import MapBlueSvg from '../../../../assets/image/icon-map-blue.svg'
import MapSvg from '../../../../assets/image/icon-map.svg'
import { checkRecordType } from '../../utils/SoupUtils'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaFSR,
    isPersonaPSR,
    Persona
} from '../../../common/enums/Persona'
import SalesMyTeam from '../../pages/rep/SalesMyTeam'
import { t } from '../../../common/i18n/t'
import { checkDbAndAppVersion, forceInitSyncDaily } from '../../utils/InitUtils'
import _ from 'lodash'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { fetchLogContentVersion } from '../../utils/BlobUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import {
    getATCCacheDupOnline,
    getCacheForLaterATCData,
    removeDup,
    sendCacheForLaterATCReq
} from '../../helper/rep/InnovationProductHelper'
import { syncDownSalesDocumentsBack } from '../../utils/InnovationProductUtils'
import MyDayScreen from '../../../orderade/pages/MyDayScreen/MyDayScreen'
import CustomerListScreen from '../../pages/rep/CustomerListScreen'
import TabStyle from '../../styles/TabStyle'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { getStringValue } from '../../utils/LandingUtils'
import { exeAsyncFunc } from '../../../common/utils/CommonUtils'
import { useSharePointToken } from '../../helper/rep/SharePointTokenHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { RepLocationTrackerService } from '../../service/RepLocationTrackerService'
import BaseInstance from '../../../common/BaseInstance'
import { useListenFormNetwork } from '../../hooks/StartNewCDAHooks'
import PSRMyDay from '../MyVisit/PSRMyDay'
import OrderService from '../../../orderade/service/OrderService'
import SyncUpService from '../../../orderade/service/SyncUpService'
import { EventArg, useIsFocused } from '@react-navigation/native'

const styles = TabStyle

const Tab = createBottomTabNavigator()

interface SalesRepTabProps {
    navigation: any
    route?: any
}
const { PushNotification, CatchSystemLog } = NativeModules
const notificationEvent = new NativeEventEmitter(PushNotification)
const catchLogEvent = new NativeEventEmitter(CatchSystemLog)
const SalesRepTab: FC<SalesRepTabProps> = (props: SalesRepTabProps) => {
    const { navigation } = props
    const { count, setRefreshTimes } = useNotificationCount()
    const dispatch = useDispatch()
    const sharepointToken = useSharePointToken(true)
    const updateLeadWiring = async () => {
        try {
            const oldWiringString = await AsyncStorage.getItem('lead_wiring_check')
            if (oldWiringString) {
                const oldWiring = JSON.parse(oldWiringString)
                if (moment().format(TIME_FORMAT.Y_MM_DD) > oldWiring.date) {
                    const { data } = await checkLeadWiring()
                    await AsyncStorage.setItem(
                        'lead_wiring_check',
                        JSON.stringify({
                            date: moment().format(TIME_FORMAT.Y_MM_DD),
                            wiring: data.leadWiring
                        })
                    )
                    if (data.leadWiring !== oldWiring.wiring) {
                        global.$globalModal.openModalWithDisableTap(
                            <View style={commonStyle.alignItemsCenter}>
                                <View style={commonStyle.marginBottom_20}>
                                    <LottieView
                                        source={require('../../../../assets/animation/loading.json')}
                                        autoPlay
                                        loop
                                        style={styles.lottieView}
                                    />
                                </View>
                                <PopMessage>{t.labels.PBNA_MOBILE_WIRING_DEFINITION_CHANGED_MSG}</PopMessage>
                                <PopMessage>{t.labels.PBNA_MOBILE_WAIT_DATA_MSG}</PopMessage>
                            </View>
                        )
                        await refreshAllLeads()
                        DeviceEventEmitter.emit(DeviceEvent.REFRESH_LEAD_LIST)
                        global.$globalModal.closeModal()
                    }
                }
            } else {
                const { data } = await checkLeadWiring()
                await AsyncStorage.setItem(
                    'lead_wiring_check',
                    JSON.stringify({
                        date: moment().format(TIME_FORMAT.Y_MM_DD),
                        wiring: data.leadWiring
                    })
                )
            }
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'SalesRepTab.updateLeadWiring',
                'Update Lead Wiring: ' + ErrorUtils.error2String(e)
            )
            global.$globalModal.closeModal()
        }
    }
    const [needDisableTab, setNeedDisableTab] = useState(false)
    const isFocused = useIsFocused()

    const refreshData = () => {
        refreshLeadsBackground()
            .then(() => {
                DeviceEventEmitter.emit(DeviceEvent.REFRESH_LEAD_LIST)
                setRefreshTimes((refreshTimes) => {
                    return refreshTimes + 1
                })
                dispatch(refreshKpiBarAction())
            })
            .catch(async (e) => {
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'SalesRepTab.refreshData',
                    'RefreshLeadsBackground Error: ' + getStringValue(e)
                )
            })
    }

    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            exeAsyncFunc(async () => {
                await checkDbAndAppVersion(navigation)
            })
            forceInitSyncDaily(navigation)
            refreshData()
        }
        if (nextAppState === 'background') {
            checkRecordType('SalesRepTabBackground')
        }
    }

    useEffect(() => {
        !CommonParam.isPSRForceDailySync && (CommonParam.isPSRForceDailySync = false)
        // sync down sales support documents for PSR
        let timer: any
        if (isPersonaPSR() && sharepointToken) {
            timer = setTimeout(() => syncDownSalesDocumentsBack(dispatch, sharepointToken), 5000)
        }
        return () => {
            clearTimeout(timer)
        }
    }, [sharepointToken])

    useListenFormNetwork()

    useEffect(() => {
        checkRecordType('SalesRepTabUseEffect')
        const notificationEmitter = notificationEvent.addListener('receiveLeadRemoteNotification', () => {
            refreshData()
        })
        const catchLogEmitter = catchLogEvent.addListener('reveiveDiagnostic', (e) => {
            fetchLogContentVersion(e)
        })
        const appStateListener = AppState.addEventListener('change', handleAppStateChange)
        const refreshBadgeEventListener = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_BADGE, () => {
            setRefreshTimes((refreshTimes) => {
                return refreshTimes + 1
            })
        })
        refreshData()
        const interval = setInterval(async () => {
            await syncUpLogs()
        }, 60000)
        let atcInterval: any = null
        if (isPersonaPSR()) {
            try {
                atcInterval = setInterval(async () => {
                    OrderService.deltaSyncAndReplaceOrder()
                    if (CommonParam.OrderingFeatureToggle) {
                        await SyncUpService.syncUpLocalData()
                    }
                    const cacheForLaterData = await getCacheForLaterATCData()
                    if (!_.isEmpty(cacheForLaterData)) {
                        const dupDataOnline = await getATCCacheDupOnline(cacheForLaterData)
                        const newReq = removeDup(dupDataOnline, cacheForLaterData, true)
                        if (!_.isEmpty(newReq)) {
                            await AsyncStorage.setItem('ATCCacheForLater', JSON.stringify(newReq))
                            sendCacheForLaterATCReq(newReq).then(() => {
                                AsyncStorage.removeItem('ATCCacheForLater')
                            })
                        } else {
                            AsyncStorage.removeItem('ATCCacheForLater')
                        }
                    }
                }, 60000 * CommonParam.OCHRetryInterVal)
            } catch (err) {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'SalesRepTab.ATCCacheForLaterError',
                    'ATC Cache For Later Error: ' + getStringValue(err)
                )
            }
        }
        updateLeadWiring()
        return () => {
            notificationEmitter && notificationEmitter.remove()
            catchLogEmitter && catchLogEmitter.remove()
            refreshBadgeEventListener.remove()
            appStateListener.remove()
            clearInterval(interval)
            clearInterval(atcInterval)
        }
    }, [])

    useFormNotificationHooks()

    useEffect(() => {
        if (props.route?.params?.isGoBackToCustomer) {
            navigation.navigate('Customers')
        }
    }, [])

    useEffect(() => {
        BaseInstance.sfSoupEngine
            .retrieve('RetailStore', ['count'], 'Select count(*) From {RetailStore}')
            .then((res) => {
                // #10882559, stop tracking if FSR have more than 5000 customers
                if (CommonParam.PERSONA__c === Persona.FSR && res?.[0]?.count <= 5000) {
                    RepLocationTrackerService.startTracker()
                }
            })
    }, [])

    const showSelectRouteAlert = () => {
        Alert.alert(t.labels.PBNA_MOBILE_PLEASE_SELECT_A_ROUTE)
    }

    const getPSRUserRoute = async () => {
        const res = await AsyncStorage.getItem('psrUserRoute')
        if (_.isEmpty(res)) {
            setNeedDisableTab(true)
        }
    }

    useEffect(() => {
        isPersonaPSR() && getPSRUserRoute()
    }, [isFocused])

    const getTabIcon = (route, focused) => {
        switch (route?.name) {
            case 'Co-pilot':
                return (
                    <Image
                        source={focused ? ImageSrc.IMG_ACTIVE_DASHBOARD : ImageSrc.IMG_DASHBOARD}
                        style={styles.imgAchieve}
                    />
                )
            case 'Leads':
                return focused ? <LeadBlueSvg style={commonStyle.size_20} /> : <LeadSvg style={commonStyle.size_20} />
            case 'Customers':
                return (
                    <Image
                        source={focused ? ImageSrc.IMG_ACTIVE_CUSTOMER : ImageSrc.IMG_CUSTOMER}
                        style={styles.customerImg}
                    />
                )
            case 'Explore':
                return focused ? <MapBlueSvg /> : <MapSvg />
            case 'MyVisit':
                return (
                    <Image
                        source={focused ? ImageSrc.IMG_ACTIVE_DOLLAR_SQUARE : ImageSrc.IMG_DOLLAR_SQUARE}
                        style={styles.iconStyle}
                    />
                )
            case 'Notifications':
                return (
                    <ImageBackground
                        style={styles.iconStyle}
                        source={focused ? ImageSrc.IMG_ACTIVE_NOTIFICATION : ImageSrc.IMG_NOTIFICATION}
                    >
                        {count > 0 && (
                            <View style={styles.iconRedStyle}>
                                <CText style={styles.textBadge}>{count}</CText>
                            </View>
                        )}
                    </ImageBackground>
                )
            case 'My Team':
                return (
                    <Image source={focused ? ImageSrc.IMG_ACTIVE_TEAM : ImageSrc.IMG_TEAM} style={styles.customerImg} />
                )
            default:
                return null
        }
    }
    const checkLeadFuncBundle = () => {
        let showLeadTab = false
        if (isPersonaFSR() || isPersonaPSR() || isPersonaFSManager()) {
            showLeadTab = true
        }
        return showLeadTab
    }

    const disableTabAndShowAlertForPSR = (e: EventArg<'tabPress', true, undefined>) => {
        if (needDisableTab) {
            showSelectRouteAlert()
            e.preventDefault()
        }
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    return getTabIcon(route, focused)
                },
                headerShown: false,
                tabBarAllowFontScaling: false,
                tabBarLabelStyle: styles.labelStyle,
                tabBarActiveTintColor: '#00A2D9',
                tabBarInactiveTintColor: '#565656'
            })}
        >
            <Tab.Screen
                name={'Co-pilot'}
                component={CoPilotScreen}
                key={'CoPilot'}
                options={{ tabBarLabel: t.labels.PBNA_MOBILE_COPILOT }}
            />
            {isPersonaPSR() &&
                (CommonParam.OrderingFeatureToggle ? (
                    <Tab.Screen
                        name={'MyVisit'}
                        component={MyDayScreen}
                        key={'MyVisit'}
                        options={{ tabBarLabel: _.capitalize(t.labels.PBNA_MOBILE_MY_DAY) }}
                        listeners={() => ({
                            tabPress: (e) => {
                                disableTabAndShowAlertForPSR(e)
                            }
                        })}
                    />
                ) : (
                    <Tab.Screen
                        name={'MyVisit'}
                        component={PSRMyDay}
                        key={'MyVisit'}
                        options={{ tabBarLabel: _.capitalize(t.labels.PBNA_MOBILE_MY_DAY) }}
                        listeners={() => ({
                            tabPress: (e) => {
                                disableTabAndShowAlertForPSR(e)
                            }
                        })}
                    />
                ))}
            {(checkLeadFuncBundle() || isPersonaFSManager()) && (
                <Tab.Screen
                    name={'Leads'}
                    component={LeadScreen}
                    key={'Lead'}
                    options={{ tabBarLabel: _.capitalize(t.labels.PBNA_MOBILE_LEADS) }}
                    listeners={() => ({
                        tabPress: (e) => {
                            disableTabAndShowAlertForPSR(e)
                        }
                    })}
                />
            )}
            <Tab.Screen
                name={'Explore'}
                component={ExploreScreen}
                key={'Explore'}
                options={{ tabBarLabel: t.labels.PBNA_MOBILE_EXPLORE }}
                listeners={() => ({
                    tabPress: (e) => {
                        disableTabAndShowAlertForPSR(e)
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks on Explore Tab`, 1)
                    }
                })}
            />
            {!isPersonaCRMBusinessAdmin() && (
                <Tab.Screen
                    name={'Customers'}
                    component={CustomerListScreen}
                    key={'Customer'}
                    options={{ tabBarLabel: _.capitalize(t.labels.PBNA_MOBILE_CUSTOMERS) }}
                    listeners={() => ({
                        tabPress: (e) => {
                            disableTabAndShowAlertForPSR(e)
                        }
                    })}
                />
            )}
            {isPersonaFSManager() && (
                <Tab.Screen
                    name={'My Team'}
                    component={SalesMyTeam}
                    key={'My Team'}
                    options={{ tabBarLabel: t.labels.PBNA_MOBILE_MY_TEAM }}
                />
            )}
            {!isPersonaFSManager() && !isPersonaCRMBusinessAdmin() && (
                <Tab.Screen
                    name={'Notifications'}
                    component={SalesNotificationCenter}
                    key={'Notifications'}
                    options={{ tabBarLabel: t.labels.PBNA_MOBILE_NOTIFICATIONS }}
                    listeners={() => ({
                        tabPress: (e) => {
                            disableTabAndShowAlertForPSR(e)
                        }
                    })}
                />
            )}
        </Tab.Navigator>
    )
}

export default SalesRepTab
