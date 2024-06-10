/*
 * @Description:InStoreMapService
 * @Author: Mary Qian
 * @Date: 2021-08-11 07:41:17
 * @LastEditTime: 2023-05-18 12:00:26
 * @LastEditors: Mary Qian
 */

import { CommonParam } from '../../common/CommonParam'
import { NativeModules } from 'react-native'
import { unzip } from 'react-native-zip-archive'
import { SoupService } from './SoupService'
import { transformProducts } from '../module/work-order/ProductsService'
import InStoreMapDataService from './InStoreMapDataService'
import { fetchStaticResources } from '../api/ApexApis'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import { restDataCommonCall } from '../api/SyncUtils'
import _ from 'lodash'
import { storeClassLog } from '../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../common/utils/CommonUtils'
const RNFS = require('react-native-fs')

const OUTER_FOLDER_NAME = 'PBNAImages'
const FOLDER_NAME = 'ImageFiles'
const TEMPLATE = 'PSTRLAYOT_TMPLT'
const DEPARTMENT = 'VSTORE_DEPT'
const PROMOTION = 'VSTORE_DSLPY'

const WALMART_LVL_3_VALUE = 'Large Format'
const WALMART_TEMPLATE = '2'
const DEFAULT_TEMPLATE = '1'

const getTemplateImage = (code: string) => {
    return `${CommonParam.ImageFilesPath}/${TEMPLATE}/${code}.png`
}

const getDepartmentImage = (code: string) => {
    return `${CommonParam.ImageFilesPath}/${DEPARTMENT}/${code}.png`
}

const getDisplayImage = (code: string) => {
    if (!code) {
        return null
    }
    return `${CommonParam.ImageFilesPath}/${PROMOTION}/${code}.png`
}

const convertBase64StringToZipFile = (base64String: string) => {
    const newParams = {
        Base64String: base64String,
        FileName: 'Source.zip',
        TargetFolderName: OUTER_FOLDER_NAME
    }
    const UtilsManager = NativeModules.UtilsManager

    return new Promise((resolve, reject) => {
        UtilsManager.convertBase64ToFile(newParams, (_error, events) => {
            const { sourcePath, targetPath } = events

            unzip(sourcePath, targetPath)
                .then((path) => {
                    resolve(path)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    })
}

const downloadImages = () => {
    return new Promise((resolve, reject) => {
        Instrumentation.startTimer('Get instore location maps')
        fetchStaticResources()
            .then((res) => {
                const response = res.data
                const base64String = response.substring(1, response.length - 1)
                convertBase64StringToZipFile(base64String)
                    .then((path) => {
                        const newPath = `${path}/${FOLDER_NAME}`
                        CommonParam.ImageFilesPath = newPath
                        Instrumentation.stopTimer('Get instore location maps')
                        resolve(newPath)
                    })
                    .catch((error) => {
                        Instrumentation.stopTimer('Get instore location maps')
                        reject(error)
                    })
            })
            .catch((error) => {
                Instrumentation.stopTimer('Get instore location maps')
                reject(error)
            })
    })
}

const recordPDFLog = (message: string, isError = false) => {
    storeClassLog(isError ? Log.MOBILE_ERROR : Log.MOBILE_INFO, 'DownloadPdf', message)
}

const downloadPdf = () => {
    const pdfURLTimer = 'Get premier pdf URL'
    const pathTimer = 'Get Document Path For PDF'
    const RNFSTimer = 'RNFS download PDF'

    return new Promise((resolve) => {
        const UtilsManager = NativeModules.UtilsManager
        Instrumentation.startTimer(pathTimer)
        UtilsManager.getDocumentDirectory((_error: any, events: string) => {
            Instrumentation.stopTimer(pathTimer)
            if (events) {
                const path =
                    "tooling/query/?q=Select Id,Name,Value from ExternalString WHERE Name='Public_link_of_PremierTask'"
                Instrumentation.startTimer(pdfURLTimer)
                restDataCommonCall(path, 'GET')
                    .then((res) => {
                        Instrumentation.stopTimer(pdfURLTimer)
                        let pdfDownloadURL = ''
                        if (res && res.data && res.data.records && res.data.records.length > 0) {
                            pdfDownloadURL = res.data.records[0].Value
                        }

                        if (_.isEmpty(pdfDownloadURL)) {
                            recordPDFLog(`get empty url: ${JSON.stringify(res)}`)
                            resolve('Download PDF Failed: empty url')
                            return
                        }

                        const DownloadFileOptions = {
                            // URL to download file from
                            fromUrl: pdfDownloadURL,
                            // Local filesystem path to save the file to
                            toFile: events + '/rules.pdf'
                        }

                        Instrumentation.startTimer(RNFSTimer)
                        const result = RNFS.downloadFile(DownloadFileOptions)
                        result.promise
                            .then(function (res: any) {
                                Instrumentation.stopTimer(RNFSTimer)
                                recordPDFLog(`RNFS success: ${JSON.stringify(res)}`)
                                resolve('Download PDF successfully')
                            })
                            .catch(function (error: any) {
                                Instrumentation.stopTimer(RNFSTimer)
                                recordPDFLog(`RNFS failed: ${getStringValue(error)}`, true)
                                resolve('Download PDF Failed')
                            })
                    })
                    .catch((error) => {
                        Instrumentation.stopTimer(pdfURLTimer)
                        recordPDFLog(`GetURL failed: ${getStringValue(error)}`, true)
                        resolve('Download PDF Failed')
                    })
            } else {
                recordPDFLog(`Fetch local path failed: ${getStringValue(events)}`, true)
                resolve('Download PDF Failed')
            }
        })
    })
}

const syncImageFilePath = () => {
    const UtilsManager = NativeModules.UtilsManager
    UtilsManager.getDocumentDirectory((_error, events) => {
        if (events) {
            CommonParam.ImageFilesPath = `${events}/${OUTER_FOLDER_NAME}/${FOLDER_NAME}`
        }
    })
}

const fetchTemplateByCode = async (segment: string, subSegment: string) => {
    const mappingTable = 'Segment_Hierarchy_Image_Mapping__mdt'

    let template = DEFAULT_TEMPLATE
    await exeAsyncFunc(async () => {
        const templates = await SoupService.retrieveDataFromSoup(mappingTable, {}, [], null, [
            `
            WHERE {${mappingTable}:Segment__c}='${segment}'
            AND {${mappingTable}:Sub_Segment__c}='${subSegment}'`
        ])

        if (templates?.length > 0) {
            template = templates[0].Template__c
        }
    }, 'fetchTemplateByCode')

    return template
}

const isWalmartCase = (storeName: string, lvl3: string) => {
    const pattern = /[^]*wal[ -]?mart[^]*/i
    const isNameWalmart = pattern.test(storeName)

    return isNameWalmart && lvl3 === WALMART_LVL_3_VALUE
}

const fetchInStoreTemplateByStoreIdAndName = async (storeId: string, storeName: string) => {
    let template = DEFAULT_TEMPLATE
    const account = 'Account'

    await exeAsyncFunc(async () => {
        const retailStores = await SoupService.retrieveDataFromSoup(account, {}, [], null, [
            ` WHERE {Account:Id} = (
                    SELECT {RetailStore:AccountId} FROM {RetailStore} WHERE {RetailStore:Id}='${storeId}'
                )`
        ])

        if (retailStores?.length > 0) {
            const segment = retailStores[0].BUSN_SGMNTTN_LVL_2_NM__c
            const subSegment = retailStores[0].BUSN_SGMNTTN_LVL_1_NM__c
            const lvl3 = retailStores[0].BUSN_SGMNTTN_LVL_3_NM__c

            if (isWalmartCase(storeName, lvl3)) {
                template = WALMART_TEMPLATE
            } else {
                template = await fetchTemplateByCode(segment, subSegment)
            }
        }
    }, 'fetchInStoreTemplateByStoreIdAndName')

    return template
}

const getPromotionById = async (promotionId: string) => {
    let promotion = {}
    await exeAsyncFunc(async () => {
        const promotions = await SoupService.retrieveDataFromSoup('Promotion', {}, [], null, [
            ` WHERE {Promotion:Id}="${promotionId}"`
        ])
        if (promotions?.length > 0) {
            promotion = promotions[0]
        }
    }, 'getPromotionById')
    return promotion
}

const getInStoreLocationProductsById = async (inStoreLocationId: string, isOnline = false) => {
    let products = []
    await exeAsyncFunc(async () => {
        const locationList = await InStoreMapDataService.getValidInStoreLocationByInStoreLocationId(
            inStoreLocationId,
            isOnline
        )

        if (!locationList || locationList.length === 0) {
            return []
        }

        const location = locationList[0]
        const promotionId = location.Promotion_Id__c

        if (promotionId) {
            products = await InStoreMapDataService.getPromotionProductsByPromotionIdArray([promotionId], isOnline)
        } else {
            products = await InStoreMapDataService.getStoreProductByInStoreLocationId(inStoreLocationId, isOnline)
        }

        products = InStoreMapDataService.filterProductsByQuantity(products)

        products = transformProducts(products, !!promotionId)
    }, 'getInStoreLocationProductsById')

    return products
}

export const InStoreMapService = {
    fetchInStoreTemplateByStoreIdAndName,
    getPromotionById,
    getInStoreLocationProductsById,
    syncImageFilePath,
    downloadImages,
    downloadPdf,
    getTemplateImage,
    getDepartmentImage,
    getDisplayImage
}

export default InStoreMapService
