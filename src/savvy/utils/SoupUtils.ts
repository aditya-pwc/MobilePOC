/**
 * @description Utils for getting data from local soup.
 * @author Christopher ZANG
 * @date 2021-03-16
 */
import { CommonParam } from '../../common/CommonParam'
import { SoupService } from '../service/SoupService'
import { Log } from '../../common/enums/Log'
import DeviceInfo from 'react-native-device-info'
import { storeClassLog } from '../../common/utils/LogUtils'

/**
 * @description When getting data from local soup, the structure of the data is flatted,
 * this function is used to rebuild the depth.
 * @param obj
 */
export const rebuildObjectDepth = (obj: any) => {
    const result = {}
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            const keys = key.split('.')
            let nestedObj = result as any
            for (let i = 0; i < keys.length - 1; i++) {
                const nestedKey = keys[i]
                if (!Object.prototype.hasOwnProperty.call(nestedObj, nestedKey)) {
                    nestedObj[nestedKey] = {}
                }
                nestedObj = nestedObj[nestedKey]
            }
            nestedObj[keys[keys.length - 1]] = value
        }
    }
    return result
}

export const checkRecordType = (position: string) => {
    SoupService.retrieveDataFromSoup('RecordType', {}, [])
        .then((res) => {
            storeClassLog(
                Log.MOBILE_INFO,
                'checkRecordType',
                `checkRecordTypeId: ${DeviceInfo.getVersion()} haveSoup${position}` + JSON.stringify(res)
            )
        })
        .catch((err) => {
            storeClassLog(
                Log.MOBILE_INFO,
                'checkRecordType',
                `checkRecordTypeId: ${DeviceInfo.getVersion()} error${position}` + JSON.stringify(err)
            )
        })
}

export const cleanAllSoups = async () => {
    const objs = CommonParam.objs
    for (const obj of objs) {
        await SoupService.clearSoup(obj.name)
    }
}
