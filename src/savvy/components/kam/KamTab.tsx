/**
 * @description Tab for KAM
 * @author Dashun Fu
 * @email drake.fu@pwc.com
 */

import React, { FC } from 'react'
import { Image, ImageBackground } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import KamCustomerListScreen from '../../pages/kam/KamCustomerListScreen'
import MapBlueSvg from '../../../../assets/image/icon-map-blue.svg'
import MapSvg from '../../../../assets/image/icon-map.svg'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
import ExploreScreen from '../../pages/rep/ExploreScreen'

import KamNotificationCenter from '../../pages/kam/KamNotificationCenter'
import KamCoPilotScreen from '../../pages/kam/KamCoPilotScreen'
import { useSyncUpLogs } from '../../hooks/SyncUpLogHooks'
import TabStyle from '../../styles/TabStyle'
import { useFormNotificationHooks } from '../../hooks/NotificationHooks'
import { useListenFormNetwork } from '../../hooks/StartNewCDAHooks'

const Tab = createBottomTabNavigator()

const styles = TabStyle

interface KamTabProps {
    navigation: any
    route?: any
}

const KamTab: FC<KamTabProps> = () => {
    const getTabIcon = (route: any, focused: boolean) => {
        switch (route?.name) {
            case 'Copilot':
                return (
                    <Image
                        source={focused ? ImageSrc.IMG_ACTIVE_DASHBOARD : ImageSrc.IMG_DASHBOARD}
                        style={styles.imgAchieve}
                    />
                )
            case 'Customers':
                return (
                    <Image
                        source={focused ? ImageSrc.IMG_ACTIVE_CUSTOMER : ImageSrc.IMG_CUSTOMER}
                        style={styles.customerImg}
                    />
                )
            case 'Explore':
                return focused ? <MapBlueSvg /> : <MapSvg />
            case 'Notifications':
                return (
                    <ImageBackground
                        style={styles.iconStyle}
                        source={focused ? ImageSrc.IMG_ACTIVE_NOTIFICATION : ImageSrc.IMG_NOTIFICATION}
                    />
                )
            default:
                return null
        }
    }

    useSyncUpLogs()

    useFormNotificationHooks()

    useListenFormNetwork()

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
            initialRouteName={'Customers'}
        >
            <Tab.Screen
                name={'Copilot'}
                component={KamCoPilotScreen}
                key={'CoPilot'}
                options={{ tabBarLabel: t.labels.PBNA_MOBILE_COPILOT_TAB }}
            />
            <Tab.Screen
                name={'Explore'}
                component={ExploreScreen}
                key={'Explore'}
                options={{ tabBarLabel: t.labels.PBNA_MOBILE_EXPLORE }}
            />
            <Tab.Screen
                name={'Customers'}
                component={KamCustomerListScreen}
                key={'Customer'}
                options={{ tabBarLabel: _.capitalize(t.labels.PBNA_MOBILE_CUSTOMERS) }}
            />
            <Tab.Screen
                name={'Notifications'}
                component={KamNotificationCenter}
                key={'Notifications'}
                options={{ tabBarLabel: t.labels.PBNA_MOBILE_NOTIFICATIONS }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault()
                    }
                })}
            />
        </Tab.Navigator>
    )
}

export default KamTab
