import { t } from '../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../common/CommonParam'
import { LanguageSwitcher } from '../components/common/language-switcher/LanguageSwitcher'
import React, { RefObject } from 'react'
import { NavigationProp } from '@react-navigation/native'
import { isPersonaPSR } from '../../common/enums/Persona'
import { sendLogs } from '../../common/utils/LogUtils'
import { isCopilotInternetReachable } from '../../orderade/utils/VisitUtils'
import {
    CopilotScreenBaseHandle,
    SidePanelAlertDataType
} from '../../common/components/buz/copilot-base/CopilotScreenBase'

export const useSidePanelOptions = (
    navigation: NavigationProp<any>,
    copilotScreenBaseRef: RefObject<CopilotScreenBaseHandle>
) => {
    const options = [
        {
            title: t.labels.PBNA_MOBILE_MY_PROFILE,
            onPress: () => {
                copilotScreenBaseRef.current?.hideSidePanel()
                navigation.navigate('MyProfile')
                Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks on profile`, 1)
            }
        },
        {
            title: t.labels.PBNA_MOBILE_SETTINGS,
            onPress: async () => {
                copilotScreenBaseRef.current?.hideSidePanel()
                navigation.navigate('Settings')
            }
        },
        {
            // this title only serve as key for rendering
            title: t.labels.PBNA_MOBILE_SWITCH_LANGUAGE,
            component: (
                <LanguageSwitcher
                    onHideSidePanel={(messageObject?: SidePanelAlertDataType) => {
                        copilotScreenBaseRef.current?.hideSidePanel()
                        messageObject && copilotScreenBaseRef.current?.showDropDownMessage(messageObject)
                    }}
                />
            )
        },
        {
            title: t.labels.PBNA_MOBILE_WHATS_NEW,
            onPress: () => {
                copilotScreenBaseRef.current?.hideSidePanel()
                navigation?.navigate('ReleaseNotes', {
                    navigation,
                    onPressBack: () => {
                        copilotScreenBaseRef.current?.showSidePanel()
                    }
                })
            }
        }
    ]
    const insertOption = {
        title: t.labels.PBNA_MOBILE_SEND_LOGS,
        onPress: async () => {
            copilotScreenBaseRef.current?.hideSidePanel()
            const isNetInfoOK = await isCopilotInternetReachable(t.labels.PBNA_MOBILE_SEND_LOGS_OFFLINE)
            if (!isNetInfoOK) {
                return
            }
            sendLogs()
        }
    }
    if (isPersonaPSR() && CommonParam.OrderingFeatureToggle) {
        options.splice(1, 0, insertOption)
    }
    return options
}
