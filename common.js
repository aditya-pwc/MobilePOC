import '@react-navigation/bottom-tabs'
import 'react-native-gesture-handler'
import 'react-native-safe-area-context'
import 'react-native-screens'
import 'react-native/Libraries/Core/InitializeCore'
import 'react-native-force'

// common library start
import './src/common/CommonStyle'
import './src/common/interface/SyncInterface'
import './src/common/PhoneIcon'
import './src/common/CommonParam'
import './src/common/enums/TimeFormat'
import './src/common/enums/ImageSrc'
import './src/common/enums/MomentUnit'
import './src/common/enums/Persona'
import './src/common/enums/LottieSrc'
import './src/common/enums/Tips'
import './src/common/enums/MomentStartOf'
import './src/common/enums/Log'
import './src/common/utils/OktaUtils'
import './src/common/utils/DateUtils'
import './src/common/utils/YMDUtils'
import './src/common/utils/TimeZoneUtils'
import './src/common/utils/LogUtils'
import './src/common/utils/CommonUtils'
import './src/common/utils/LinkUtils'
import './src/common/BaseInstance'
import './src/common/styles/CommonStyle'
import './src/common/styles/ButtonStyle'
import './src/common/styles/BaseStyle'
import './src/common/components/WeekBar'
import './src/common/components/DatePickView'
import './src/common/components/FormBottomButton'
import './src/common/components/rating/Rating'
import './src/common/components/c-switch/CSwitch'
import './src/common/components/BrandingLoading'
import './src/common/components/CText'
import './src/common/components/CCheckBox'
import './src/common/components/buz/setting-cell/SettingCell'
import './src/common/components/buz/side-panel-base/SidePanelBase'
import './src/common/components/buz/copilot-base/BackgroundCircle'
import './src/common/components/buz/copilot-base/CopilotScreenBase'
import './src/common/components/QuickLinks'
import './src/common/components/TitleModal'
import './src/common/components/Loading'
import './src/common/components/CModal'
import './src/common/components/Collapsible'
import './src/common/components/UserAvatar'
import './src/common/components/badge/Badge'
import './src/common/Constants'
import './src/common/api/CommonApi'
import './src/common/i18n/t'
import './src/common/i18n/ContractLabel'
import './src/common/i18n/MerchandiserLabel'
import './src/common/i18n/LocationListLabels'
import './src/common/i18n/PSRLabels'
import './src/common/i18n/picklist/Contact'
import './src/common/i18n/picklist/allPicklist'
import './src/common/i18n/MyDayLabels'
import './src/common/i18n/AllLabels'
import './src/common/i18n/SDLLabel'
import './src/common/i18n/RepLabels'
import './src/common/i18n/BaseLabel'
import './src/common/i18n/Config'
import './src/common/i18n/ManagerLabel'
import './src/common/i18n/DelSupLabel'
import './src/common/pages/LandingScreenBase/LandingScreenBase'
import './src/common/pages/LoginScreen/UserHooks'
import './src/common/pages/LoginScreen/UserUtils'
import './src/common/helpers/IconHelper'
import './src/common/MessageIcon'

// common library end

import React from 'react'
import { AppRegistry } from 'react-native'
import LoginScreen from './src/common/pages/LoginScreen/LoginScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { DropDownComponentProvider } from './src/common/contexts/DropdownContext'
import { GlobalModalComponentProvider } from './src/savvy/contexts/GlobalModalContext'
import GlobalModal from './src/common/components/GlobalModal'

const Stack = createStackNavigator()

const App = () => {
    return (
        <DropDownComponentProvider>
            <GlobalModalComponentProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name={'Login'} component={LoginScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
                <GlobalModal
                    ref={(globalModalRef) => {
                        global.$globalModal = globalModalRef
                    }}
                />
            </GlobalModalComponentProvider>
        </DropDownComponentProvider>
    )
}

AppRegistry.registerComponent('Common', () => App)
