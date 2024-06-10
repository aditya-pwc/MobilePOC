/*
 * @Description:
 * @LastEditors: Yi Li
 */

import { DocumentDirectoryPath, downloadFile, exists, mkdir } from 'react-native-fs'
import { NativeModules } from 'react-native'
import { CommonParam } from '../../common/CommonParam'
import { CommonApi } from '../../common/api/CommonApi'

export const getBaseEquipmentPdfPath = async () => {
    const basePath = `${DocumentDirectoryPath}/${CommonParam.userId}/EquipmentPdf/`
    const isExist = await exists(basePath)
    if (!isExist) {
        await mkdir(basePath)
    }
    return basePath
}
export const downloadEquipmentPdf = (imageName: string, localPath: string) => {
    return new Promise<string | undefined>((resolve, reject) => {
        const fullUrl =
            CommonApi.PBNA_MOBILE_SHAREPOINT_DRIVES_BASE_URL + '/' + CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_PDF_URL
        const UtilsManager = NativeModules.UtilsManager
        UtilsManager.getDocumentDirectory(async (_error: any, events: any) => {
            if (events) {
                const DownloadFileOptions = {
                    fromUrl: encodeURI(fullUrl.replace('{PDFName}', imageName)),
                    toFile: localPath,
                    headers: {
                        Authorization: `Bearer ${CommonParam.equipmentSharePointToken}`,
                        responseType: 'blob'
                    }
                }
                const result = downloadFile(DownloadFileOptions)
                result.promise
                    .then((res) => {
                        if (res?.statusCode === 200 && res?.bytesWritten !== 0) {
                            resolve(localPath)
                        } else {
                            reject(res)
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
