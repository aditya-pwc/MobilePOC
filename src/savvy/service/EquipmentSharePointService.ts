import { serviceEquipmentSharePoint } from '../api/serviceEquipmentSharePoint'
import { CommonApi } from '../../common/api/CommonApi'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { CommonParam } from '../../common/CommonParam'
import { restApexCommonCall } from '../api/SyncUtils'
import store from '../redux/store/Store'
import { updateEquipmentPdfMap, updateEquipmentSharePointImageMap } from '../redux/Slice/EquipmentSharePointSlice'
import _ from 'lodash'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const requestPdfResourceWithNet = async () => {
    try {
        const pdfGroupUrl =
            CommonApi.PBNA_MOBILE_SHAREPOINT_SITE_BASE_URL + '/' + CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_PDF_NAME_URL
        const res = await serviceEquipmentSharePoint.get(pdfGroupUrl)
        const imageReq: { Id: any; LinkFilename: any; SubtypeCode: any }[] = []
        const imageItems = res?.data?.value || []
        imageItems.forEach((item: any) => {
            const fieldsDict = item?.fields || {}
            if (fieldsDict.XcelerateVersion && fieldsDict.EquipmentTypeCode) {
                imageReq.push({
                    Id: (fieldsDict?.id || '') + 'pdf',
                    LinkFilename: fieldsDict?.LinkFilename || '',
                    SubtypeCode: fieldsDict?.EquipmentTypeCode || ''
                })
            }
        })
        store.dispatch(updateEquipmentPdfMap(imageReq))
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'requestPdfResourceWithNet',
            `${CommonParam.userId} get TokenForEquipmentImage failed ${ErrorUtils.error2String(e)}`
        )
    }
}

export const requestImageResourceWithNet = async () => {
    try {
        const imageGroupUrl =
            CommonApi.PBNA_MOBILE_SHAREPOINT_SITE_BASE_URL + '/' + CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_IMG_NAME_URL
        const res = await serviceEquipmentSharePoint.get(imageGroupUrl)
        const imageReq: { Id: any; LinkFilename: any; SubtypeCode: any }[] = []
        const imageItems = res?.data?.value || []
        imageItems.forEach((item: any) => {
            const fieldsDict = item?.fields || {}
            if (!_.isEmpty(fieldsDict?.LinkFilename)) {
                imageReq.push({
                    Id: (fieldsDict?.id || '') + 'png',
                    LinkFilename: fieldsDict?.LinkFilename || '',
                    SubtypeCode: fieldsDict?.SubtypeCode || ''
                })
            }
        })
        await AsyncStorage.setItem('equipmentSharePointImageMap', JSON.stringify(imageReq))
        store.dispatch(updateEquipmentSharePointImageMap(imageReq))
    } catch (e) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'getImageResource',
            `${CommonParam.userId} get TokenForEquipmentImage failed ${ErrorUtils.error2String(e)}`
        )
    }
}

const EXPIRE_TIME_OFFSET = 300
export const getTokenForEquipmentImage = async () => {
    const token = await AsyncStorage.getItem('equipmentSharePointToken')
    const tokenExpireTime = await AsyncStorage.getItem('equipmentSharePointTokenExpireTime')
    const tokenInMem = CommonParam.equipmentSharePointToken
    if (_.isEmpty(token) || moment(tokenExpireTime).isBefore()) {
        try {
            const res = await restApexCommonCall(CommonApi.PBNA_MOBILE_GET_SP_EQ_TOKEN_URL, 'GET')
            const equipmentSharePointToken = res?.data?.token || ''
            const equipmentSharePointTokenExpireTime = moment()
                .add((res?.data?.expires_in || 0) - EXPIRE_TIME_OFFSET, 'seconds')
                .toISOString()
            await AsyncStorage.setItem('equipmentSharePointToken', equipmentSharePointToken)
            await AsyncStorage.setItem('equipmentSharePointTokenExpireTime', equipmentSharePointTokenExpireTime)
            CommonParam.equipmentSharePointToken = equipmentSharePointToken
            return equipmentSharePointToken
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'getTokenForEquipmentImage',
                `${CommonParam.userId} get TokenForEquipmentImage failed ${ErrorUtils.error2String(e)}`
            )
        }
    } else if (_.isEmpty(tokenInMem)) {
        const imageLocal = await AsyncStorage.getItem('equipmentSharePointImageMap')
        store.dispatch(updateEquipmentSharePointImageMap(JSON.parse(imageLocal || '')))
        CommonParam.equipmentSharePointToken = token
    }
    return token || ''
}

export const checkAndRefreshEquipmentSharePoint = async () => {
    await getTokenForEquipmentImage()
    const imageLocal = store.getState().customerReducer.equipmentSharePointReducer.equipmentImageMap
    if (_.size(imageLocal) === 0) {
        await requestImageResourceWithNet()
    }
    const pdfLocal = store.getState().customerReducer.equipmentSharePointReducer.equipmentPdfMap
    if (_.size(pdfLocal) === 0) {
        await requestPdfResourceWithNet()
    }
}
