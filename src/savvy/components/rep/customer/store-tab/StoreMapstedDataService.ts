import axios from 'axios'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { CommonParam } from '../../../../../common/CommonParam'
import { CommonApi } from '../../../../../common/api/CommonApi'

/*
 * @Description:
 * @Author: Jiaxiang Wang
 * @Date: 2024-02-22
 */
const getTweaksToken = () => {
    return new Promise<any>((resolve) => {
        const body = {
            email: CommonParam.mapsted.PBNA_MAPSTEDTWEAKS_USERNAME,
            passwordHash: CommonParam.mapsted.PBNA_MAPSTEDTWEAKS_PASSWORD
        }
        axios
            .post(CommonApi.PBNA_MOBILE_MAPSTED_TWEAKS_AUTH_URL, body)
            .then(function (response) {
                if (response.data.token) {
                    resolve(response.data.token)
                }
                if (response.data.error) {
                    storeClassLog(Log.MOBILE_ERROR, 'getTweaksToken', JSON.stringify(response.data.error))
                }
            })
            .catch((e) => {
                resolve(e)
                storeClassLog(Log.MOBILE_ERROR, 'getTweaksToken', JSON.stringify(e))
            })
    })
}

export const StoreMapstedDataService = {
    getTweaksToken
}

export default StoreMapstedDataService
