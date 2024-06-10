import React, { useEffect, useState } from 'react'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { syncDownObj } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { cachedFilesMap } from '../../common/helpers/CacheHelper'

export type RealogramJSON = {
    dNumber: number
    width: number
    // Third Party structure
    // eslint-disable-next-line camelcase
    max_tag_img_height: number
    shelves: [
        {
            sNumber: number
            // Third Party structure
            // eslint-disable-next-line camelcase
            total_width: number
            height: number
            products: { upc: string; w: number; h: number; ps: 'Y' | 'N' | null }[][]
        }
    ]
}[]

export const unknownPepsiUPCsKey = 'Realogram-Pepsi-UPCs'
export const allPepsiUPCsKey = 'Realogram-Pepsi-UPCs-All'

export const cacheProductServiceName = 'Cached-Product-Image'

const imgMap: {
    [key in string]: string | null
} = {}

const onlyWords = /\w+/

// Online Mode for uncached UPC
const getImgUrlMap = async (upcObj: { [k: string]: string }, isCA: boolean) => {
    try {
        const upcSet = new Set(Object.values(upcObj))
        // pepsi upc will not contain special character
        const upcArr = Array.from(upcSet).filter((upc) => onlyWords.test(upc))
        const data = await syncDownObj(
            '',
            `SELECT ProductCode,Package_Type_Name__c,A1N1_Non_Pack_Photo_URL__c, C1N1_Non_Pack_Photo_URL__c,
        C1C1_Non_Pack_Photo_URL__c, A1N1_Pack_Photo_URL__c, C1N1_Pack_Photo_URL__c, C1C1_Pack_Photo_URL__c,
        A2C1_Photo_URL__c, A1C1_Photo_URL__c, A1L1_Photo_URL__c, A1R1_Photo_URL__c, French_Photo_URL__c 
        FROM Product2 WHERE ProductCode IN ('${upcArr.join(
            "','"
        )}') AND IsActive = true AND RecordType.Name = 'Product' AND Package_Type_Name__c != 'Supplies' AND Product_GTIN__c != null`,
            false
        )
        data.data.forEach((record: any) => {
            const productKey = record.ProductCode
            const isPack = !!upcObj[record.ProductCode + 'Y']
            const isNonPack = !!upcObj[record.ProductCode + 'N']
            if (isCA && record.French_Photo_URL__c) {
                if (isPack) {
                    imgMap[productKey + 'Y'] = record.French_Photo_URL__c
                }
                if (isNonPack) {
                    imgMap[productKey + 'N'] = record.French_Photo_URL__c
                }
            } else {
                if (isPack) {
                    if (!imgMap[productKey + 'Y']) {
                        imgMap[productKey + 'Y'] =
                            record.A1N1_Pack_Photo_URL__c ??
                            record.C1N1_Pack_Photo_URL__c ??
                            record.C1C1_Pack_Photo_URL__c ??
                            record.A2C1_Photo_URL__c ??
                            record.A1C1_Photo_URL__c
                    }
                }
                if (!imgMap[productKey + 'N']) {
                    imgMap[productKey + 'N'] =
                        record.A1N1_Non_Pack_Photo_URL__c ??
                        record.C1N1_Non_Pack_Photo_URL__c ??
                        record.C1C1_Non_Pack_Photo_URL__c
                }
            }
        })
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Realogram-getImgMap', ErrorUtils.error2String(error))
    }
}

const filterOutGeneralCache = async (upcObj: { [k: string]: string }, isCA: boolean) => {
    const imageMap = new Map()
    cachedFilesMap.forEach((_v, fileName) => {
        const nameParts = fileName.split('-')
        imageMap.set(nameParts[0] + '-' + nameParts[nameParts.length - 1], fileName)
    })
    Object.entries(upcObj).forEach(([key, upc]) => {
        if (isCA && imageMap.has(upc + '-' + 'French_Photo_URL__c')) {
            imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'French_Photo_URL__c')
            return
        }
        const isPack = upc + 'Y' === key
        const isNonPack = upc + 'N' === key
        if (isPack) {
            if (imageMap.has(upc + '-' + 'A1N1_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'A1N1_Pack_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'C1N1_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'C1N1_Pack_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'C1C1_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'C1C1_Pack_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'A2C1_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'A2C1_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'A1C1_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'A1C1_Photo_URL__c')
                delete upcObj[key]
                return
            }
        }
        if (isNonPack) {
            if (imageMap.has(upc + '-' + 'A1N1_Non_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'A1N1_Non_Pack_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'C1N1_Non_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'C1N1_Non_Pack_Photo_URL__c')
                delete upcObj[key]
                return
            }
            if (imageMap.has(upc + '-' + 'C1C1_Non_Pack_Photo_URL__c')) {
                imgMap[key] = cacheProductServiceName + '/' + imageMap.get(upc + '-' + 'C1C1_Non_Pack_Photo_URL__c')
                delete upcObj[key]
            }
        }
    })
}

const preloadRealogramImg = async (
    realogramJSON: RealogramJSON,
    isCA: boolean,
    setCompleteFlag: React.Dispatch<React.SetStateAction<number>>
) => {
    try {
        const upcObj: { [k: string]: 'Y' | 'N' } = {}
        Object.values(realogramJSON).forEach((door) => {
            Object.values(door.shelves).forEach((shelf) => {
                Object.values(shelf.products).forEach((product) => {
                    product.forEach(async (p) => {
                        if (p.upc && p.ps !== null) {
                            Object.assign(upcObj, { [p.upc + p.ps]: p.upc })
                        }
                    })
                })
            })
        })
        await filterOutGeneralCache(upcObj, isCA)
        setTimeout(() => setCompleteFlag((p) => p + 1), 1000)
        // Online Logic for uncached UPC
        await getImgUrlMap(upcObj, isCA)
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Realogram-preloadRealogramImg', ErrorUtils.error2String(error))
    } finally {
        setCompleteFlag((p) => p + 1)
    }
}

export const usePreloadRealogram = (realogramData: RealogramJSON, isCA: boolean) => {
    const [completeFlag, setCompleteFlag] = useState(0)
    const [allPepsiUpc, setAllPepsiUpc] = useState<{ [k: string]: true }>({})
    useEffect(() => {
        AsyncStorage.getItem(allPepsiUPCsKey)
            .then((upcJson) => {
                if (upcJson) {
                    const upcArr = JSON.parse(upcJson)
                    setAllPepsiUpc(upcArr)
                }
            })
            .catch((error) =>
                storeClassLog(Log.MOBILE_ERROR, 'Realogram-preloadAllPepsiUPCsKey', ErrorUtils.error2String(error))
            )

        if (!_.isEmpty(realogramData)) {
            preloadRealogramImg(realogramData, isCA, setCompleteFlag)
        }
    }, [realogramData])
    return { completeFlag, imgMap, allPepsiUpc }
}
