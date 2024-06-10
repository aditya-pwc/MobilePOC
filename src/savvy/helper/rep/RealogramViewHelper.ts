import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as RNFS from 'react-native-fs'
import dayjs from 'dayjs'
import _ from 'lodash'
import { syncDownObj } from '../../api/SyncUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { allPepsiUPCsKey, cacheProductServiceName } from '../../hooks/RealogramViewHook'
import { CommonParam } from '../../../common/CommonParam'
import { CacheManager, CacheSourceBackend, cachedFilesMap } from '../../../common/helpers/CacheHelper'

export const imageLastSyncTime = 'Product-Image-Last-Sync-Time'

async function getDAMToken() {
    try {
        const token = await AsyncStorage.getItem('DAMAccessToken')
        return JSON.parse(token ?? '{}')
    } catch {
        return {}
    }
}

const getImgUrlObjNew = async (locationId: string): Promise<{ [k: string]: string | null }[]> => {
    try {
        if (!locationId) {
            return []
        }
        const res = await syncDownObj(
            '',
            `
                SELECT ProductCode,A1N1_Non_Pack_Photo_URL__c, C1N1_Non_Pack_Photo_URL__c,
                C1C1_Non_Pack_Photo_URL__c, A1N1_Pack_Photo_URL__c, C1N1_Pack_Photo_URL__c, C1C1_Pack_Photo_URL__c,
                A2C1_Photo_URL__c, A1C1_Photo_URL__c, A1L1_Photo_URL__c, A1R1_Photo_URL__c, French_Photo_URL__c,
                URL_Updated_Date__c
                FROM Product2 WHERE Id IN (
                    SELECT ProductId
                    FROM StoreProduct
                    WHERE Is_Visible_Product__c = true
                    AND Account.LOC_PROD_ID__c ='${locationId}'
                ) AND IsActive = true AND RecordType.Name = 'Product' AND Package_Type_Name__c != 'Supplies' AND Product_GTIN__c != null`,
            false
        )
        return res.data
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Realogram-getImgMap', ErrorUtils.error2String(error))
        return []
    }
}

const cancelPreviousDLTask = async () => {
    try {
        for (let i = 0; i <= 2000; i++) {
            await RNFS.stopDownload(i)
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'cancelPreviousDLTask', ErrorUtils.error2String(error))
    }
}

const cacheAllUpc = async () => {
    try {
        const { data }: { data: { ProductCode: string | null }[] } = await syncDownObj(
            '',
            `
        SELECT ProductCode
        FROM Product2
        WHERE IsActive = true
        AND RecordType.Name = 'Product'
        AND Package_Type_Name__c != 'Supplies'
        AND Product_GTIN__c != null`,
            false
        )
        const upcSet: Set<string> = new Set()
        data.forEach((upcObj) => upcObj.ProductCode && upcSet.add(upcObj.ProductCode))
        const allUpcObj = _.zipObject(Array.from(upcSet), Array(upcSet.size).fill(true))
        AsyncStorage.setItem(allPepsiUPCsKey, JSON.stringify(allUpcObj))
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Realogram-cacheAllUpc', ErrorUtils.error2String(error))
    }
}

export const preloadImgs = async () => {
    try {
        const cacheFolderPath = RNFS.DocumentDirectoryPath + '/' + cacheProductServiceName
        cacheAllUpc()
        const linkObjArr = await getImgUrlObjNew(CommonParam.userLocationId)
        await cancelPreviousDLTask()
        const localUpcSet = new Set<string>()
        linkObjArr.forEach((product2Obj) => {
            product2Obj.ProductCode && localUpcSet.add(product2Obj.ProductCode)
        })
        const localUpcObj = _.zipObject(Array.from(localUpcSet), Array(localUpcSet.size).fill(true))

        // For skip images that already been cached
        const cacheFolderExist = await RNFS.exists(cacheFolderPath)
        if (cacheFolderExist) {
            const cachedFileArr = await RNFS.readdir(cacheFolderPath)
            cachedFileArr.forEach((fileName) => {
                const fileUpc = fileName.split('-')[0]
                // if Offline linkObjArr will be empty
                if (localUpcObj[fileUpc] || linkObjArr.length === 0) {
                    cachedFilesMap.set(fileName, true)
                }
            })
            storeClassLog(Log.MOBILE_INFO, 'PreloadImgs-Metrics', `${String(cachedFilesMap.size)} images cached.`)
            // Update Staled Image
            const lastSyncTime = await AsyncStorage.getItem(`${CommonParam.userLocationId}_${imageLastSyncTime}`)
            // Update Staled Image
            if (lastSyncTime) {
                const lastSyncTimeStamp = parseInt(lastSyncTime)
                for (const linkObj of linkObjArr) {
                    try {
                        if (linkObj.URL_Updated_Date__c && linkObj.ProductCode) {
                            const productTimeStamp = new Date(linkObj.URL_Updated_Date__c).getTime()
                            if (productTimeStamp > lastSyncTimeStamp) {
                                const staleFilesArr = []
                                for (const fileName of _.keys(cachedFilesMap)) {
                                    fileName.startsWith(linkObj.ProductCode + '-') && staleFilesArr.push(fileName)
                                }
                                for (const fileName of staleFilesArr) {
                                    await RNFS.unlink(cacheFolderPath + '/' + fileName)
                                    cachedFilesMap.delete(fileName)
                                }
                            }
                        }
                    } catch {}
                }
            }
        }
        const preloadArr: CacheSourceBackend[] = []
        const damToken = await getDAMToken()
        Object.values(linkObjArr).forEach((v) => {
            const upc = v.ProductCode
            if (upc) {
                Object.entries(v).forEach(([key, imgUrl]) => {
                    if (key !== 'ProductCode' && key !== 'attributes' && key !== 'URL_Updated_Date__c' && imgUrl) {
                        if (!cachedFilesMap.has(upc + '-' + key)) {
                            // Limit 2000 each batch
                            preloadArr.length < 2000 &&
                                preloadArr.push({
                                    id: upc + '-' + key,
                                    uri: imgUrl,
                                    headers: { Authorization: damToken },
                                    cb: () => cachedFilesMap.set(upc + '-' + key, true)
                                })
                        }
                    }
                })
            }
        })
        AsyncStorage.setItem(`${CommonParam.userLocationId}_${imageLastSyncTime}`, dayjs().unix().toString())
        const cachedManager = CacheManager.getInstance({ serviceName: cacheProductServiceName })
        await cachedManager.backgroundPreload(preloadArr, false)
        storeClassLog(Log.MOBILE_INFO, 'PreloadImgs-Metrics', `${String(preloadArr.length)} tasks submitted`)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Realogram-preloadImgs', ErrorUtils.error2String(error))
    }
}
