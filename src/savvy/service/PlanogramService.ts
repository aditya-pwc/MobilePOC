import axios from 'axios'
import moment from 'moment'
import { NativeModules } from 'react-native'
import { CommonApi } from '../../common/api/CommonApi'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import AsyncStorage from '@react-native-async-storage/async-storage'
import StatusCode from '../enums/StatusCode'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const RNFS = require('react-native-fs')
const Buffer = require('buffer').Buffer

const authenticate = (gpid, custid) => {
    const planogramConfig = CommonParam.planogram
    return new Promise((resolve, reject) => {
        const authValue = Buffer.from(
            planogramConfig.PBNA_PLANOGRAM_USERNAME + ':' + planogramConfig.PBNA_PLANOGRAM_PASSWORD
        ).toString('base64')
        const weekOfday = moment().format('E')
        const start = Math.round(moment().subtract(weekOfday, 'days').valueOf() / 1000)
        const end = start + 13 * 24 * 60 * 60
        const url =
            CommonApi.PBNA_MOBILE_URL_PLANOGRAM_AUTHURL +
            custid +
            '&startdt=' +
            start +
            '&enddt=' +
            end +
            '&gpid=' +
            gpid +
            '&appid=899'

        axios
            .get(url, {
                headers: {
                    Authorization: 'Basic ' + authValue,
                    cookie: planogramConfig.PBNA_PLANOGRAM_COOKIE
                }
            })
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const downloadPDF = (pdfDownloadURL, filePath) => {
    return new Promise((resolve, reject) => {
        // setSource({ uri: 'https://precisiondsd.ite.mypepsico.com/pog/getplanogram?pdffilename=' + res.data.ASSORTMENTS[0].ccoPogImgFileUrlTxt })
        const UtilsManager = NativeModules.UtilsManager
        UtilsManager.getDocumentDirectory((_error, events) => {
            if (events) {
                const DownloadFileOptions = {
                    fromUrl: pdfDownloadURL, // URL to download file from
                    toFile: events + filePath // Local filesystem path to save the file to
                }
                const result = RNFS.downloadFile(DownloadFileOptions)
                result.promise
                    .then((res) => {
                        // 0 means file download failed
                        if (res?.statusCode === StatusCode.SuccessOK && res?.bytesWritten !== 0) {
                            const absolutePath = RNFS.DocumentDirectoryPath + filePath
                            const fullpath = `file:///${absolutePath}`
                            resolve(fullpath)
                        } else {
                            reject('File not exist')
                        }
                    })
                    .catch((error) => {
                        reject(error)
                    })
            } else {
                reject('Directory not exist')
            }
        })
    })
}

const getFileInfo = (res) => {
    const files = []
    if (res && res.data && res.data.ASSORTMENTS && res.data.ASSORTMENTS.length > 0) {
        const originFiles = res.data.ASSORTMENTS
        originFiles.forEach((file) => {
            const fileInfo = {
                source: '',
                fileName: '',
                ccoPogId: ''
            }
            fileInfo.source = file.source || ''
            fileInfo.fileName = file.ccoPogImgFileUrlTxt || ''
            fileInfo.ccoPogId = file.ccoPogId || ''
            files.push(fileInfo)
        })
    }

    return files
}

const getEndPoint = (fileInfo) => {
    const planogramConfig = CommonParam.planogram
    let endPoint = ''
    if (fileInfo.source === planogramConfig.PBNA_PLANOGRAM_BEVOPT && fileInfo.fileName !== '') {
        endPoint = CommonApi.PBNA_MOBILE_URL_PLANOGRAM_BEVOPT + fileInfo.fileName
    }
    if (fileInfo.source === planogramConfig.PBNA_PLANOGRAM_POG && fileInfo.ccoPogId !== '') {
        endPoint = CommonApi.PBNA_MOBILE_URL_PLANOGRAM_POG + fileInfo.ccoPogId
        // endPoint = ENDPOINT_POG + '92951'
    }
    return endPoint
}

const downloadAllPdf = async () => {
    const customerIds = CommonParam.uniqueCustomerIds
    const gpid = CommonParam.GPID__c
    const promiseArr = []
    const filePath = (await AsyncStorage.getItem('planogramPath')) || ''
    const files = filePath.split(',')
    const customer = customerIds.filter((c) => !files.find((f) => f.includes(c)))
    customer.forEach((cid) => {
        promiseArr.push(
            // authenticate('10024676', '1257519').then(res => {
            authenticate(gpid, cid)
                .then((res) => {
                    return getFileInfo(res)
                })
                .then((fileInfos) => {
                    const downLoadArr = []
                    fileInfos.forEach((fileInfo, index) => {
                        const endPoint = getEndPoint(fileInfo)
                        if (endPoint !== '') {
                            const filePath = '/' + cid + '-planogram' + index + '.pdf'
                            downLoadArr.push(downloadPDF(endPoint, filePath))
                        }
                    })
                    return Promise.all(downLoadArr)
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'downloadAllPdf',
                        `Get planogram pdf failed ${ErrorUtils.error2String(err)}`
                    )
                    return Promise.resolve(err)
                })
        )
    })
    return Promise.all(promiseArr)
}

const retrievePDF = (cid) => {
    return new Promise((resolve, reject) => {
        const gpid = CommonParam.GPID__c || '' // '10024676'
        const custid = cid || '' // '7146459'
        authenticate(gpid, custid)
            .then((res) => {
                return getFileInfo(res)
            })
            .then((fileInfos) => {
                const downLoadArr = []
                fileInfos.forEach((fileInfo, index) => {
                    const filePath = '/' + cid + '-planogram' + index + '.pdf'
                    const endPoint = getEndPoint(fileInfo)
                    downLoadArr.push(downloadPDF(endPoint, filePath))
                })
                resolve(Promise.all(downLoadArr))
                // setSource({ uri: endPoint })
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'retrievePDF',
                    `Retrieve planogram pdf failed ${ErrorUtils.error2String(err)}`
                )
                reject(err)
            })
    })
}

const deletePDF = async (filePath: string) => {
    const isExist = await RNFS.exists(filePath)
    if (isExist) {
        return RNFS.unlink(filePath)
    }
}

const deletePDFs = (filePathArray: Array<string>) => {
    return new Promise((resolve, reject) => {
        try {
            const deleteArr = []
            filePathArray.forEach((filePath) => {
                deleteArr.push(deletePDF(filePath))
            })
            resolve(Promise.all(deleteArr))
        } catch (error) {
            reject(error)
        }
    })
}

export const PlanogramService = {
    authenticate: authenticate,
    downloadPDF: downloadPDF,
    getFileInfo: getFileInfo,
    downloadAllPdf: downloadAllPdf,
    getEndPoint: getEndPoint,
    retrievePDF: retrievePDF,
    deletePDFs: deletePDFs
}

export default PlanogramService
