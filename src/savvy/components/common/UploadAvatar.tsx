/**
 * @description Upload Avatar
 * @author Sheng Huang
 * @date 2021/9/27
 */

import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import React from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import { compressBase64Image } from '../../utils/MerchManagerUtils'
import { restApexCommonCall, syncUpObjCreateFromMem } from '../../api/SyncUtils'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import { useDispatch } from 'react-redux'
import { t } from '../../../common/i18n/t'

interface UploadAvatarProp {
    setUploadLoading: any
    dropDownRef: any
    usId: any
    userData?: any
    setNewUserStatsData?: any
}

const styles = StyleSheet.create({
    imgCamera: {
        width: 24,
        height: 24,
        position: 'absolute',
        alignSelf: 'center',
        bottom: -10,
        right: -10
    }
})

const imagePickerOption: any = {
    mediaType: 'photo',
    width: 400,
    height: 400,
    compressImageQuality: 0.2,
    cropping: true,
    includeBase64: true
}
const ERROR_UPLOAD_PHOTO_FAILED = 'Employee Detail - Upload Photo Failed'
const NO_USERSTATS_ID = 'Userstats id is null, can not upload photos'

const UploadAvatar = (props: UploadAvatarProp) => {
    const { setUploadLoading, dropDownRef, usId, userData, setNewUserStatsData } = props
    const dispatch = useDispatch()
    const refreshAvatarFlag = compose(dispatch, managerAction.setRefreshAvatarFlag)

    const addUserStats = async () => {
        return new Promise((resolve, reject) => {
            const userStatsObj = {
                OwnerId: userData.id,
                User__c: userData.id
            }
            syncUpObjCreateFromMem('User_Stats__c', [userStatsObj])
                .then((res) => {
                    resolve(res[0]?.data[0]?.Id)
                })
                .catch((error) => {
                    dropDownRef.current.alertWithType('error', NO_USERSTATS_ID)
                    reject(error)
                })
        })
    }

    const storePictureIntoSoup = async (image) => {
        setUploadLoading && setUploadLoading(true)
        let data = image.data
        let newUserStatsId = usId
        const imageSize = image.size / 1024
        const maxLength = 200
        if (imageSize > maxLength) {
            const newData = await compressBase64Image(image.data, maxLength).catch(() => {
                return null
            })
            if (!newData) {
                setUploadLoading && setUploadLoading(false)
                dropDownRef.current.alertWithType('error', ERROR_UPLOAD_PHOTO_FAILED)
                return
            }
            data = newData
        }
        if (!usId) {
            const userStatsId = await addUserStats()
            const allData = { ...userData, userStatsId }
            setNewUserStatsData(allData)
            newUserStatsId = userStatsId
            if (!userStatsId) {
                setUploadLoading && setUploadLoading(false)
                dropDownRef.current.alertWithType('error', NO_USERSTATS_ID)
                return
            }
        }
        const body = { strUserStatsId: newUserStatsId, strUserPhoto: data }
        restApexCommonCall('userPhoto/', 'POST', body)
            .then(async (res: any) => {
                const jsonResult = res.data && JSON.parse(res.data)
                setUploadLoading && setUploadLoading(false)
                if (jsonResult && !jsonResult.boolIsSuccess) {
                    dropDownRef.current.alertWithType('error', ERROR_UPLOAD_PHOTO_FAILED)
                    return
                }
                refreshAvatarFlag()
            })
            .catch((err) => {
                setUploadLoading && setUploadLoading(false)
                dropDownRef.current.alertWithType('error', ERROR_UPLOAD_PHOTO_FAILED, err)
            })
    }

    // storePicture
    const uploadFromCamera = () => {
        ImagePicker.openCamera(imagePickerOption).then((image) => {
            storePictureIntoSoup(image)
        })
    }
    const uploadFromLibrary = () => {
        ImagePicker.openPicker(imagePickerOption).then((image) => {
            storePictureIntoSoup(image)
        })
    }

    const uploadAvatar = () => {
        Alert.alert(t.labels.PBNA_MOBILE_CHANGE_EMPLOYEE_PHOTO, '', [
            {
                text: t.labels.PBNA_MOBILE_CAMERA,
                onPress: uploadFromCamera
            },
            {
                text: t.labels.PBNA_MOBILE_PHOTO_ALBUM,
                onPress: uploadFromLibrary
            },
            { text: t.labels.PBNA_MOBILE_CANCEL, style: 'cancel' }
        ])
    }

    return (
        <TouchableOpacity
            onPress={() => {
                uploadAvatar()
            }}
        >
            <Image source={ImageSrc.IMG_CAMERA} style={styles.imgCamera} />
        </TouchableOpacity>
    )
}

export default UploadAvatar
