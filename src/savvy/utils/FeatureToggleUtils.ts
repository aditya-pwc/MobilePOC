import { restApexCommonCall, restDataCommonCall } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { CommonParam } from '../../common/CommonParam'
import { CommonApi } from '../../common/api/CommonApi'
import { FeatureToggle } from '../../common/enums/FeatureToggleName'
import StatusCode from '../enums/StatusCode'

interface FeatureToggleBundleData {
    [key: string]: {
        [toggleName in FeatureToggle]: boolean
    }
}

const setDefaultFeatureToggle = () => {
    const toggleObj = {} as Record<FeatureToggle, boolean>
    const keys: FeatureToggle[] = Object.values(FeatureToggle)
    for (const key of keys) {
        toggleObj[key] = false
    }
    return toggleObj
}

const getSupportAnyMobileToggles = (featureToggleData: FeatureToggleBundleData) => {
    const toggleObj = {} as Record<FeatureToggle, boolean>
    const keys: FeatureToggle[] = Object.values(FeatureToggle)
    for (const key of keys) {
        let newValue = false
        for (const innerKey in featureToggleData) {
            if (featureToggleData[innerKey][key] === true) {
                newValue = true
                break
            }
        }
        toggleObj[key] = newValue
    }
    return toggleObj
}

export const syncFeatureToggle = async () => {
    try {
        CommonParam.FeatureToggle = setDefaultFeatureToggle()
        let rteId = ''
        const routeRes = await restDataCommonCall(
            `query/?q=SELECT Id, RTE_ID__c From Route_Sales_Geo__c WHERE Id='${CommonParam.userRouteId}'`,
            'GET'
        )
        if (routeRes.status === StatusCode.SuccessOK && routeRes.data && routeRes.data.records.length > 0) {
            rteId = routeRes.data.records[0].RTE_ID__c || ''
        }
        const reqBody = {
            Location: CommonParam.userLocationId,
            Persona: CommonParam.PERSONA__c,
            Route: rteId,
            GPID: CommonParam.GPID__c
        }
        const res = await restApexCommonCall(CommonApi.PBNA_MOBILE_FEATURE_TOGGLE_SYNC, 'POST', reqBody)
        const featureToggle = JSON.parse(res.data)
        CommonParam.FeatureToggleBundle = featureToggle
        CommonParam.FeatureToggle = getSupportAnyMobileToggles(featureToggle)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'SYS-FeatureToggleUtils.syncFeatureToggle', error)
    }
}
