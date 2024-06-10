/**
 * @description Main entry of the app.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-02-11
 * @lastModifiedDate 2021-02-11
 */
import React, { useEffect, useState } from 'react'
import { compose } from '@reduxjs/toolkit'
import HomeScreen from '../pages/HomeScreen'
import MyVisit from './merchandiser/MyVisit'
import { AppState, DeviceEventEmitter, Image, NativeEventEmitter, NativeModules, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { CommonParam } from '../../common/CommonParam'
import { ImageSrc } from '../../common/enums/ImageSrc'
import { useDispatch } from 'react-redux'
import NotificationService, {
    handleMZNotificationClick,
    clearNotifications,
    handleFormNotification
} from '../service/NotificationService'
import NotificationCenter from './manager/notifications/NotificationCenter'
import {
    getDataInEmployeeDetail,
    getNotificationsWithNet,
    getRecordTypeIdByDeveloperName
} from '../utils/MerchManagerUtils'
import managerAction from '../redux/action/H01_Manager/managerAction'
import { isPersonaManager, Persona } from '../../common/enums/Persona'
import SalesNotificationCenter, { checkIsRealogramNotification } from '../pages/rep/SalesNotificationCenter'
import { CommonLabel } from '../enums/CommonLabel'
import { syncUpLogs } from '../utils/LogUtils'
import { updateNotificationSeen } from '../api/connect/NotificationUtils'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import AutoRefreshOfSchedule from './merchandiser/AutoRefreshOfSchedule'
import { openLocationConsent } from '../utils/PermissionUtils'
import Deliveries from './del-sup/deliveries/Deliveries'
import MyCustomersEntry from './tab-entry/MyCustomersEntry'
import MyTeamEntry from './tab-entry/MyTeamEntry'
import CopilotEntry from './tab-entry/CopilotEntry'
import MyDay from './del-sup/deliveries/MyDay'
import _ from 'lodash'
import { t } from '../../common/i18n/t'
import { checkDbAndAppVersion, forceInitSyncDaily, genConfigArray } from '../utils/InitUtils'
import { checkAndRefreshBreadcrumbsToken } from '../service/BreadcrumbsService'
import { fetchLogContentVersion } from '../utils/BlobUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addLogInRNS, RNSAppStatus } from './manager/schedule/ReviewNewSchedule'
import ExploreScreen from '../pages/rep/ExploreScreen'
import MapBlueSvg from '../../../assets/image/icon-map-blue.svg'
import MapSvg from '../../../assets/image/icon-map.svg'
import LeadScreen from '../pages/rep/lead/LeadScreen'
import LeadBlueSvg from '../../../assets/image/icon_lead_tab_highlight.svg'
import LeadSvg from '../../../assets/image/icon_leads.svg'
import { getCurrUserStatesId } from '../../common/pages/LoginScreen/UserUtils'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { checkIsFormNotification, safeJsonParse } from '../helper/rep/AuditHelper'
import { SoupService } from '../service/SoupService'
import ScheduleQuery from '../queries/ScheduleQuery'
import { formatString } from '../utils/CommonUtils'
import { composeMyTeamData } from './manager/my-team/MyTeam'
import { checkVisitsTabAllError, getAllCustomerData, getWorkingStatusObj } from './manager/helper/MerchManagerHelper'
import { sortCustomerList } from './manager/my-customers/MyCustomers'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { NotificationType } from '../../common/enums/NotificationType'
import { useListenFormNetwork } from '../hooks/StartNewCDAHooks'
import { DeviceEvent } from '../enums/DeviceEvent'

interface TabProps {
    navigation?: any
}

const styles = StyleSheet.create({
    iconStyle: {
        width: 30,
        height: 30
    },
    labelStyle: {
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: -50,
        fontSize: 9.5,
        fontWeight: '500',
        fontFamily: 'Gotham-Book'
    },
    iconBadgeStyle: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconRedStyle: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        backgroundColor: '#EB445A',
        marginTop: -5,
        marginLeft: 16
    },
    textBadge: {
        fontSize: 10,
        fontWeight: '500',
        color: '#FFFFFF'
    },
    leadFocus: {
        width: 20,
        height: 20
    }
})

const Tab = createBottomTabNavigator()

const getTabIcon = (tabName: string, focused: boolean) => {
    let iconPath
    switch (tabName) {
        case CommonLabel.DASHBOARD:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_DASHBOARD : ImageSrc.IMG_DASHBOARD
            break
        case CommonLabel.MY_TEAM:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_TEAM : ImageSrc.IMG_TEAM
            break
        case CommonLabel.MY_CUSTOMERS:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_CUSTOMER : ImageSrc.IMG_CUSTOMER
            break
        case CommonLabel.SALES_NOTIFICATIONS:
        case CommonLabel.NOTIFICATIONS:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_NOTIFICATION : ImageSrc.IMG_NOTIFICATION
            break
        case CommonLabel.LEAD:
            iconPath = focused ? ImageSrc.TAB_LEAD_ACTIVE : ImageSrc.TAB_LEAD_INACTIVE
            break
        case CommonLabel.SYNC:
            iconPath = focused ? ImageSrc.TAB_SYNC_ACTIVE : ImageSrc.TAB_SYNC_INACTIVE
            break
        case CommonLabel.COPILOT:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_DASHBOARD : ImageSrc.IMG_DASHBOARD
            break
        case CommonLabel.MY_VISIT:
            iconPath = focused ? ImageSrc.IMG_ACTIVE_CUSTOMER : ImageSrc.IMG_CUSTOMER
            break
        case CommonLabel.MY_DAY:
            if (CommonParam.PERSONA__c === Persona.MERCH_MANAGER) {
                iconPath = focused ? ImageSrc.IMG_ACTIVE_SCHEDULE : ImageSrc.IMG_SCHEDULE
            }
            if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
                iconPath = focused ? ImageSrc.IMG_ACTIVE_DOLLAR_SQUARE : ImageSrc.IMG_DOLLAR_SQUARE
            }
            if (CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER) {
                iconPath = focused ? ImageSrc.IMG_ACTIVE_DOLLAR_SQUARE : ImageSrc.IMG_DOLLAR_SQUARE
            }
            if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
                iconPath = focused ? ImageSrc.TAB_DELIVERY_ACTIVE : ImageSrc.TAB_DELIVERY
            }
            break
        case CommonLabel.DELIVERIES:
            iconPath = focused ? ImageSrc.TAB_DELIVERY_ACTIVE : ImageSrc.TAB_DELIVERY
            break
        default:
            break
    }
    return iconPath
}

const generateTabName = (name) => {
    if (name === CommonLabel.SALES_NOTIFICATIONS) {
        return CommonLabel.NOTIFICATIONS
    }
    if (name === CommonLabel.DELIVERIES) {
        if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
            return CommonLabel.MY_DAY
        }
    }
    return name
}

const generateTabTitle = (componentItem) => {
    if (componentItem.name === CommonLabel.DELIVERIES) {
        if (CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) {
            return t.labels.PBNA_MOBILE_MY_DAY
        }
    }
    return componentItem.text
}

const TabComponent = (props: TabProps) => {
    const { navigation } = props
    const dispatch = useDispatch()
    const setNotificationData = compose(dispatch, managerAction.setNotificationData)
    const [badgeNum, setBadgeNum] = useState(0)
    const [myTeamBadgeNum, setMyTeamBadgeNum] = useState(0)
    const [myCustomerBadgeNum, setMyCustomerBadgeNum] = useState(0)
    const [isLandScape, setIsLandScape] = useState(false)
    const [currentTabName, setCurrentTabName] = useState('')
    const { PushNotification, CatchSystemLog, AppTerminateTime } = NativeModules
    const notificationEvent = new NativeEventEmitter(PushNotification)
    const catchLogEvent = new NativeEventEmitter(CatchSystemLog)
    const RNSTerminateTime = new NativeEventEmitter(AppTerminateTime)
    const getBadgeNumWithNet = () => {
        if (isPersonaManager()) {
            getNotificationsWithNet().then((res: any) => {
                setBadgeNum(res.count)
                setNotificationData(res)
            })
        }
    }

    const componentMap = [
        {
            name: CommonLabel.DASHBOARD,
            component: HomeScreen,
            text: t.labels.PBNA_MOBILE_DASHBOARD
        },
        {
            name: CommonLabel.MY_VISIT,
            component: MyVisit,
            text: t.labels.PBNA_MOBILE_MY_VISIT
        },
        {
            name: CommonLabel.MY_TEAM,
            component: MyTeamEntry,
            text: t.labels.PBNA_MOBILE_MY_TEAM
        },
        {
            name: CommonLabel.MY_CUSTOMERS,
            component: MyCustomersEntry,
            text: t.labels.PBNA_MOBILE_MY_CUSTOMERS
        },
        {
            name: CommonLabel.NOTIFICATIONS,
            component: NotificationCenter,
            text: t.labels.PBNA_MOBILE_NOTIFICATIONS
        },
        {
            name: CommonLabel.SALES_NOTIFICATIONS,
            component: SalesNotificationCenter,
            text: t.labels.PBNA_MOBILE_NOTIFICATIONS
        },
        {
            name: CommonLabel.SYNC,
            component: HomeScreen,
            text: t.labels.PBNA_MOBILE_SYNC
        },
        {
            name: CommonLabel.DELIVERIES,
            component: Deliveries,
            text: t.labels.PBNA_MOBILE_DELIVERIES
        },
        {
            name: CommonLabel.COPILOT,
            component: CopilotEntry,
            text: t.labels.PBNA_MOBILE_COPILOT_TAB
        },
        {
            name: CommonLabel.MY_DAY,
            component: MyDay,
            text: t.labels.PBNA_MOBILE_MY_DAY
        },
        {
            name: CommonLabel.EXPLORE,
            component: ExploreScreen,
            text: t.labels.PBNA_MOBILE_CDA
        },
        {
            name: CommonLabel.LEADS,
            component: LeadScreen,
            text: _.capitalize(t.labels.PBNA_MOBILE_LEADS)
        }
    ]
    const getComponentArr = () => {
        const config = genConfigArray().find((conf) => {
            return conf.name === CommonParam.PERSONA__c
        })

        const components = []
        const tempTabList = config.tab
        if (
            !CommonParam.leadFuncBundle &&
            (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER ||
                CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER)
        ) {
            _.remove(tempTabList, (tab) => {
                return tab === CommonLabel.LEADS
            })
        }
        tempTabList.forEach((tab) => {
            const item = componentMap.find((i) => i.name === tab)
            item && components.push(item)
        })

        return components
    }
    const componentArr = getComponentArr()

    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            exeAsyncFunc(async () => {
                await checkDbAndAppVersion(navigation)
            })
            forceInitSyncDaily(navigation)
            checkAndRefreshBreadcrumbsToken()
        }
        if (nextAppState === 'active' && CommonParam.PERSONA__c === Persona.MERCHANDISER) {
            openLocationConsent()
            // AutoRefreshOfSchedule.autoRefresh()
            PushNotificationIOS.setApplicationIconBadgeNumber(0)
            clearNotifications()
        }
    }

    useEffect(() => {
        PushNotificationIOS.setApplicationIconBadgeNumber(badgeNum)
    }, [badgeNum])

    const getMyTeamBadge = async () => {
        const CTRRecordTypeId = await getRecordTypeIdByDeveloperName('CTR', 'Customer_to_Route__c')
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ScheduleQuery.retrieveMyTeamList.f,
            formatString(ScheduleQuery.retrieveMyTeamList.q + ScheduleQuery.retrieveMyTeamList.c, [
                CommonParam.userLocationId
            ]) + ScheduleQuery.retrieveMyTeamList.orderBy
        )
            .then(async (result: any) => {
                const items = await composeMyTeamData(result)
                const users = Object.values(items)
                if (!_.isEmpty(users)) {
                    let countErrorUsers = 0
                    let count = 0
                    users.forEach(async (item: any) => {
                        const customerData: any = await getDataInEmployeeDetail(item, CTRRecordTypeId, null, false)
                        item.serviceDetails = customerData.visits
                        count++
                        if (
                            item.noWorkingDay ||
                            item.terminateUser ||
                            _.isEmpty(item.startTime) ||
                            checkVisitsTabAllError(getWorkingStatusObj(item.workingStatus), customerData.visits)
                        ) {
                            countErrorUsers++
                        }
                        if (count === users.length) {
                            setMyTeamBadgeNum(countErrorUsers)
                        }
                    })
                } else {
                    setMyTeamBadgeNum(0)
                }
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'getMyTeamBadge', ErrorUtils.error2String(e))
            })
    }

    const getMyCustomerBadge = () => {
        getAllCustomerData(true, null)
            .then((stores) => {
                const { errCustCount, unassignedCount, bothUnassignAndErr } = sortCustomerList(stores)
                setMyCustomerBadgeNum(errCustCount + unassignedCount - bothUnassignAndErr)
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'getMyCustomerBadge', ErrorUtils.error2String(e))
            })
    }

    const setUpMyTeamAndCustomerBadge = () => {
        getMyTeamBadge()
        getMyCustomerBadge()

        DeviceEventEmitter.addListener(NotificationType.UPDATE_MY_TEAM_BADGE, (newVal) => {
            setMyTeamBadgeNum(newVal)
        })
        DeviceEventEmitter.addListener(NotificationType.UPDATE_MY_CUSTOMER_BADGE, (newVal) => {
            setMyCustomerBadgeNum(newVal)
        })

        DeviceEventEmitter.addListener(NotificationType.RECALCULATE_MY_TEAM_AND_CUSTOMER_BADGE, () => {
            getMyTeamBadge()
            getMyCustomerBadge()
        })
    }
    useListenFormNetwork()
    useEffect(() => {
        getBadgeNumWithNet()
        if (CommonParam.PERSONA__c === Persona.MERCH_MANAGER) {
            setUpMyTeamAndCustomerBadge()
        }

        AppState.addEventListener('change', handleAppStateChange)
        const notificationEmitter = notificationEvent.addListener('reciveRemoteNotification', (userInfo) => {
            PushNotification.cleanNotification()
            updateNotificationSeen(userInfo.nid, true).then(() => {
                NotificationService.checkNotification(userInfo, navigation)
                const messageBody = userInfo?.aps?.alert?.body
                const notificationMsg = safeJsonParse(
                    messageBody.indexOf('{') > -1 ? messageBody : '{' + messageBody + '}'
                )
                const notificationType = notificationMsg?.CType
                if (checkIsFormNotification(notificationType) || checkIsRealogramNotification(notificationType)) {
                    handleFormNotification(notificationMsg, navigation)
                } else {
                    CommonParam.PERSONA__c === Persona.MERCHANDISER && handleMZNotificationClick(userInfo, navigation)
                }

                getBadgeNumWithNet()
            })
        })
        CommonParam.inRNSScreen = false
        const terminateTimeEmitter = RNSTerminateTime.addListener('appLastTerminateTime', (time) => {
            AsyncStorage.getItem('leaveFromRNS', (error, vLId) => {
                if (!error && vLId) {
                    AsyncStorage.removeItem('leaveFromRNS')
                    addLogInRNS(vLId, new Date(time), RNSAppStatus.KILLED_APP)
                }
            })
        })
        AppTerminateTime.getTerminateTime()
        AsyncStorage.getItem('logoutTime', (error, logout) => {
            if (!error && logout) {
                const logoutObj = JSON.parse(logout)
                if (logoutObj.userId === CommonParam.userId) {
                    addLogInRNS(logoutObj.svgId, new Date(logoutObj.time), RNSAppStatus.LOGGED_OUT)
                    AsyncStorage.removeItem('logoutTime')
                }
            }
        })

        const catchLogEmitter = catchLogEvent.addListener('reveiveDiagnostic', (e) => {
            fetchLogContentVersion(e)
        })
        let willPresentNotificationEmitter = null

        if (CommonParam.PERSONA__c === Persona.MERCHANDISER) {
            willPresentNotificationEmitter = notificationEvent.addListener(
                'receiveMerchAndManagerRemoteNotification',
                () => {
                    AutoRefreshOfSchedule.autoRefresh()
                }
            )
        }

        const event = notificationEvent.addListener('CustomNotification', (notification) => {
            NotificationService.checkNotification(notification, navigation)
            PushNotification.cleanNotification()
        })
        PushNotification.sendPushNotification()
        DeviceEventEmitter.addListener('NotificationCenterUnreadCount', (unreadCount) => {
            setBadgeNum(unreadCount)
        })
        const interval = setInterval(async () => {
            await syncUpLogs()
        }, 60000)

        return () => {
            notificationEmitter && notificationEmitter.remove()
            catchLogEmitter && catchLogEmitter.remove()
            terminateTimeEmitter && terminateTimeEmitter.remove()
            willPresentNotificationEmitter && willPresentNotificationEmitter.remove()
            event && event.remove()
            clearInterval(interval)
        }
    }, [])

    const messageIcon = (route, focused) => {
        const routeName = route.name
        if (routeName === CommonLabel.EXPLORE) {
            return focused ? <MapBlueSvg /> : <MapSvg />
        }
        if (CommonParam.leadFuncBundle && route.name === CommonLabel.LEADS) {
            return focused ? <LeadBlueSvg style={styles.leadFocus} /> : <LeadSvg style={styles.leadFocus} />
        }

        return <Image source={getTabIcon(routeName, focused)} style={styles.iconStyle} />
    }

    const handleTabPress = async (e: any) => {
        setCurrentTabName(e.target)
        if (e.target.includes(CommonLabel.COPILOT)) {
            if (_.isEmpty(CommonParam?.userInfo?.userStatsId)) {
                CommonParam.userInfo.userStatsId = await getCurrUserStatesId(CommonParam.userId)
            }
        }
    }
    useEffect(() => {
        DeviceEventEmitter.addListener(DeviceEvent.IS_LANDSCAPE_MODE, (newVal) => {
            if (currentTabName.includes(CommonLabel.MY_DAY)) {
                setIsLandScape(newVal)
            } else {
                setIsLandScape(false)
            }
        })
    }, [currentTabName])

    const renderTabWithBadge = (component: any, badgeNum: number) => {
        return (
            <Tab.Screen
                listeners={() => ({
                    tabPress: (e) => {
                        handleTabPress(e)
                    }
                })}
                name={generateTabName(component.name)}
                component={component.component}
                key={component.name}
                options={{ tabBarBadge: badgeNum, title: generateTabTitle(component) }}
            />
        )
    }

    return (
        <Tab.Navigator
            initialRouteName={!CommonParam.isSwitchLocation && CommonLabel.COPILOT}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    return messageIcon(route, focused)
                },
                headerShown: false,
                tabBarAllowFontScaling: false,
                tabBarLabelStyle: styles.labelStyle,
                tabBarActiveTintColor: '#00A2D9',
                tabBarInactiveTintColor: '#565656'
            })}
            tabBar={isLandScape ? () => null : undefined}
        >
            {componentArr.map((component) => {
                if (component.name === CommonLabel.NOTIFICATIONS && badgeNum > 0) {
                    return renderTabWithBadge(component, badgeNum)
                }

                if (CommonParam.PERSONA__c === Persona.MERCH_MANAGER) {
                    if (component.name === CommonLabel.MY_TEAM && myTeamBadgeNum > 0) {
                        return renderTabWithBadge(component, myTeamBadgeNum)
                    }

                    if (component.name === CommonLabel.MY_CUSTOMERS && myCustomerBadgeNum > 0) {
                        return renderTabWithBadge(component, myCustomerBadgeNum)
                    }
                }

                return (
                    <Tab.Screen
                        listeners={() => ({
                            tabPress: (e) => {
                                handleTabPress(e)
                            }
                        })}
                        name={generateTabName(component.name)}
                        component={component.component}
                        key={component.name}
                        options={{ title: generateTabTitle(component) }}
                    />
                )
            })}
        </Tab.Navigator>
    )
}

export default TabComponent
