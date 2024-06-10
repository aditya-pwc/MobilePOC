/**
 * @description CoPilot Hooks
 * @author Dashun Fu
 * @email drake.fu@pwc.com
 * @date 2023-05-16
 */

import { useEffect, useState } from 'react'
import { t } from '../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { callByPhone, openLink } from '../../common/utils/LinkUtils'
import { CommonApi } from '../../common/api/CommonApi'
import { CommonParam } from '../../common/CommonParam'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaFSR,
    isPersonaKAM,
    isPersonaPSR
} from '../../common/enums/Persona'
import { QuickLinkDataItem } from '../../common/components/QuickLinks'

// header circle line background UI
export const useHeaderCircle = () => {
    const [circle, setCircle] = useState<any>([])

    const generateCircles = () => {
        const tempCircle = []
        for (let i = 1; i < 8; i++) {
            tempCircle.push({
                width: 110 * i,
                height: 80 * i,
                left: -50 * i * 1.25,
                bottom: -50 * i,
                borderRadius: (100 * i) / 2,
                key: i
            })
        }
        return tempCircle
    }

    useEffect(() => {
        setCircle(generateCircles())
    }, [])

    return circle
}

// return different persona quick link data
export const useQuickLinkData = () => {
    const [quickLinkData, setQuickLinkData] = useState<QuickLinkDataItem[]>([])

    useEffect(() => {
        if (isPersonaPSR() || isPersonaKAM()) {
            setQuickLinkData([
                {
                    title: t.labels.PBNA_MOBILE_COPILOT_MY_PEPSICO,
                    hasSubtitle: false,
                    subtitle: '',
                    linkPress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} Open My PepsiCo from the Co-pilot page`,
                            1
                        )
                        openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_MYPEPSICO)
                    }
                },
                {
                    title: t.labels.PBNA_MOBILE_COPILOT_JOB_HURT,
                    hasSubtitle: true,
                    subtitle: t.labels.PBNA_MOBILE_COPILOT_NUM_JOB_HURT,
                    linkPress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} Open Job Hurt from the Co-pilot page`,
                            1
                        )
                        openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_JOB_HURT)
                    },
                    phonePress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} Call Job Hurt from the Co-pilot page`,
                            1
                        )
                        callByPhone(CommonApi.PBNA_MOBILE_NUM_COPILOT_PHONE)
                    }
                },
                {
                    title: t.labels.PBNA_MOBILE_COPILOT_HELP_DESK,
                    hasSubtitle: true,
                    subtitle: t.labels.PBNA_MOBILE_COPILOT_PEPSICO,
                    linkPress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} Open Help Desk from the Co-pilot page`,
                            1
                        )
                        openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_HELP_DESK)
                    },
                    phonePress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} Call Help Desk from the Co-pilot page`,
                            1
                        )
                        callByPhone(CommonApi.PBNA_MOBILE_NUM_COPILOT_PHONE_TWO)
                    }
                },
                {
                    title: t.labels.PBNA_MOBILE_EQUIPMENT_SERVICE.toUpperCase(),
                    hasSubtitle: true,
                    subtitle: t.labels.PBNA_MOBILE_COPILOT_EQUIPMENT_SERVICE_NUM,
                    linkPress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} clicks the equipment service website`,
                            1
                        )
                        openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_EQUIP_SERVICE)
                    },
                    phonePress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the equipment service phone`, 1)
                        callByPhone(CommonApi.PBNA_MOBILE_NUM_COPILOT_PHONE_THREE)
                    }
                },
                {
                    title: t.labels.PBNA_MOBILE_SAVVY_CENTER,
                    hasSubtitle: false,
                    linkPress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the SAVVY Center`, 1)
                        openLink(CommonApi.PBNA_MOBILE_URL_SAVVY_CENTER)
                    }
                }
            ])
        } else if (isPersonaFSR() || isPersonaFSManager() || isPersonaCRMBusinessAdmin()) {
            setQuickLinkData([
                {
                    id: '1',
                    title: t.labels.PBNA_MOBILE_PEPSICO_DIRECT,
                    hasSubtitle: true,
                    subtitle: t.labels.PBNA_MOBILE_PEPSICO_DIRECT_SUB_TITLE_ONE,
                    subtitle2: t.labels.PBNA_MOBILE_PEPSICO_DIRECT_SUB_TITLE_TWO,
                    linkPress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the pepsico direct website`, 1)
                        openLink(CommonApi.PBNA_MOBILE_URL_PEPSICO_DIRECT)
                    },
                    phonePress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the pepsico direct phone`, 1)
                        callByPhone(CommonApi.PBNA_MOBILE_NUM_PEPSICO_DIRECT_PHONE)
                    }
                },
                {
                    id: '2',
                    title: t.labels.PBNA_MOBILE_ACCOUNTS_RECEIVABLE,
                    hasSubtitle: true,
                    hideArrow: true,
                    subtitle:
                        CommonParam.CountryCode === 'US'
                            ? t.labels.PBNA_MOBILE_NUM_ACCOUNTS_RECEIVABLE_ONE
                            : t.labels.PBNA_MOBILE_NUM_ACCOUNTS_RECEIVABLE_TWO,
                    phonePress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} clicks the accounts receivable phone`,
                            1
                        )
                        callByPhone(
                            CommonParam.CountryCode === 'US'
                                ? CommonApi.PBNA_MOBILE_NUM_AR_PHONE_ONE
                                : CommonApi.PBNA_MOBILE_NUM_AR_PHONE_TWO
                        )
                    }
                },
                {
                    id: '3',
                    title: t.labels.PBNA_MOBILE_EQUIPMENT_SERVICE,
                    hasSubtitle: true,
                    subtitle: t.labels.PBNA_MOBILE_NUM_EQUIPMENT_SERVICE,
                    linkPress: () => {
                        Instrumentation.reportMetric(
                            `${CommonParam.PERSONA__c} clicks the equipment service website`,
                            1
                        )
                        openLink(CommonApi.PBNA_MOBILE_URL_EQUIPMENT_SERVICE)
                    },
                    phonePress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the equipment service phone`, 1)
                        callByPhone(CommonApi.PBNA_MOBILE_NUM_EQUIP_SERVICE_PHONE)
                    }
                },
                {
                    id: '4',
                    title: t.labels.PBNA_MOBILE_SAVVY_CENTER,
                    hasSubtitle: false,
                    linkPress: () => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks the SAVVY Center`, 1)
                        openLink(CommonApi.PBNA_MOBILE_URL_SAVVY_CENTER)
                    }
                }
            ])
        }
    }, [])

    return quickLinkData
}
