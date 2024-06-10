import BaseInstance from '../../../common/BaseInstance'
import { CommonParam } from '../../../common/CommonParam'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { blobToBase64 } from '../../utils/CommonUtils'
import { getStringValue } from '../../utils/LandingUtils'

export const getImageFile = async (itemId: string, apexAPI: string): Promise<string> => {
    try {
        // use BaseInstance to refresh token when CommonParam.accessToken expires
        const res = await BaseInstance.sfHttpClient.callApex(
            `${apexAPI}/${itemId}`,
            'GET',
            {},
            {
                headers: {
                    Accept: 'image/png'
                },
                responseType: 'blob'
            }
        )
        const base64String = await blobToBase64(res?.data)
        return base64String
    } catch (error: any) {
        const { data, config, status, statusText } = error?.error

        await storeClassLog(
            Log.MOBILE_ERROR,
            'getImageFile',
            `${CommonParam.PERSONA__c} Get Image File Failed From API ${apexAPI}: ` +
                getStringValue({
                    data,
                    headers: config.headers,
                    url: config.url,
                    baseURL: config.baseURL,
                    status,
                    statusText
                })
        )
        return ''
    }
}
