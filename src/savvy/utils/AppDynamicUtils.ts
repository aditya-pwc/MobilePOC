import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../common/CommonParam'

export const recordWebSocialMediaMetrics = (index: string) => {
    switch (index) {
        case '0':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks customer website`, 1)
            break
        case '1':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Facebook`, 1)
            break
        case '2':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Foursquare`, 1)
            break
        case '3':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Yelp`, 1)
            break
        case '4':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Firefly`, 1)
            break
        case '5':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Doordash`, 1)
            break
        case '6':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Ubereats`, 1)
            break
        case '7':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Postmates`, 1)
            break
        case '8':
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Grubhub`, 1)
            break
        default:
            break
    }
    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks Web & Social Media Link`, 1)
}

export const reportToolingDonut = (showAgingLeads: boolean) => {
    if (showAgingLeads) {
        Instrumentation.reportMetric(
            `${CommonParam.PERSONA__c} Toggling on Donut Chart from Aging to Business Won Leads`,
            1
        )
    }
}
