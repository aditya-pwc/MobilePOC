import React, { useEffect, useRef, useState } from 'react'
import { NavigationProp, RouteProp, useIsFocused } from '@react-navigation/native'
import { View, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { renderCardTitle, renderStartAndEndDate } from './InnovationProductTile'
import { renderCardTitleLine3 } from './InnovationProductDetail'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import ImagePicker, { Image as ImageType } from 'react-native-image-crop-picker'
import { handleExecutePriority, getStorePriorityIdFromExeId } from '../../../../utils/InnovationProductUtils'
import { EventEmitterType } from '../../../../enums/Manager'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import _ from 'lodash'
import PreviewImages from '../../../common/PreviewImage'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import CText from '../../../../../common/components/CText'
import BlueClear from '../../../../../../assets/image/ios-close-circle-outline-blue.svg'
import CustomerListTile from '../CustomerListTile'
import SuccessView, { SuccessViewRef } from '../../../common/SuccessView'
import { useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import { CommonApi } from '../../../../../common/api/CommonApi'
import {
    createPhotoExecutionContentVersion,
    uploadExecutionPhotoToSharePoint
} from '../../../../helper/rep/PriorityPhotoExecutionHelper'
import Loading from '../../../../../common/components/Loading'
import { CommonParam } from '../../../../../common/CommonParam'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { getStringValue } from '../../../../utils/LandingUtils'
import { IntervalTime } from '../../../../enums/Contract'
import {
    syncExternalDataSourceId,
    syncSharePointSiteInfo,
    useSPExternalDataSourceId,
    useSPUrlInfo
} from '../../../../hooks/PriorityPhotoExecutionHooks'

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 22,
        backgroundColor: baseStyle.color.bgGray
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: baseStyle.color.black
    },
    content: {
        flex: 1,
        paddingHorizontal: 22,
        position: 'relative'
    },
    customerCardWrapper: {
        position: 'absolute',
        width: '100%',
        left: 22,
        marginTop: -68,
        zIndex: 20
    },
    priorityInfo: {
        paddingTop: 112,
        justifyContent: 'center'
    },
    priorityNameText: {
        fontSize: 18,
        color: baseStyle.color.black,
        fontWeight: '900'
    },
    takeAndPreviewPhotoWrapper: {
        marginTop: 22
    },
    imgCameraIcon: {
        width: 16,
        height: 13,
        marginRight: 10
    },
    takePhotoBtnWrapper: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 20
    },
    takePhotoText: {
        fontWeight: '700',
        color: baseStyle.color.LightBlue
    },
    disabledText: {
        color: baseStyle.color.cGray
    },
    imagePreviewWrapper: {
        flex: 1
    },
    executionPhotoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    photoStyle: {
        width: 80,
        height: 80,
        marginRight: 16,
        borderRadius: 6,
        position: 'relative',
        marginBottom: 18
    },
    deleteIcon: {
        position: 'absolute',
        left: 64,
        bottom: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderColor: baseStyle.color.white,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: baseStyle.color.LightBlue
    },
    modalViewStyle: {
        width: 320,
        height: 300,
        paddingHorizontal: 20
    }
})

interface PriorityPhotoExecutionProps {
    navigation: NavigationProp<any>
    route?: RouteProp<any>
}

const COMPRESS_MAX_SIZE = 1080
const COMPRESS_QUALITY = 0.6
const TOP_HEIGHT = 182
const MAX_PHOTO_NUM = 10

const pickerCameraOption: any = {
    mediaType: 'photo',
    compressImageQuality: COMPRESS_QUALITY,
    compressImageMaxHeight: COMPRESS_MAX_SIZE,
    compressImageMaxWidth: COMPRESS_MAX_SIZE,
    cropping: false,
    includeBase64: true,
    forceJpg: true,
    width: Dimensions.get('window').width
}

const pickerAlbumOption: any = {
    mediaType: 'photo',
    compressImageQuality: COMPRESS_QUALITY,
    cropping: false,
    includeBase64: true,
    compressImageMaxHeight: COMPRESS_MAX_SIZE,
    multiple: true
}

const sharePointPath = '%2FShared%20Documents%2FExecution%20Photos'

const PriorityPhotoExecution: React.FC<PriorityPhotoExecutionProps> = (props: PriorityPhotoExecutionProps) => {
    const { navigation, route } = props
    const { priorityItem, retailStore, setFlagAction, setExecutedPriorityId } = route?.params || {}

    const [executionPhotos, setExecutionPhotos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const successRef = useRef<SuccessViewRef>(null)

    const insets = useSafeAreaInsets()
    const isFocused = useIsFocused()

    const sharepointToken = useSharePointToken(true)

    const externalDataSourceId = useSPExternalDataSourceId(isFocused)

    const { sharePointSiteName } = useSPUrlInfo(isFocused)

    const handleTakeOrAddPhoto = async () => {
        const TITLE = `${t.labels.PBNA_MOBILE_PHOTO_EXECUTION} ${t.labels.PBNA_MOBILE_REQUIRED}`
        const MESSAGE = t.labels.PBNA_MOBILE_PHOTO_EXECUTION_MSG
        Alert.alert(TITLE, MESSAGE, [
            {
                text: t.labels.PBNA_MOBILE_PRIORITY_TAKE_A_PICTURE,
                onPress: async () => {
                    const data = (await ImagePicker.openCamera(pickerCameraOption)) as ImageType
                    setExecutionPhotos((prev) => [...prev, data])
                }
            },
            {
                text: t.labels.PBNA_MOBILE_PRIORITY_CAMERA_ROLL,
                onPress: async () => {
                    const dataList = (await ImagePicker.openPicker({
                        ...pickerAlbumOption,
                        maxFiles: MAX_PHOTO_NUM - executionPhotos.length
                    })) as ImageType[]
                    setExecutionPhotos((prev) => [...prev, ...dataList])
                }
            },
            { text: t.labels.PBNA_MOBILE_CANCEL, style: 'cancel' }
        ])
    }

    useEffect(() => {
        isFocused && handleTakeOrAddPhoto()
    }, [isFocused])

    useEffect(() => {
        const unsubscribe = navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            if (setExecutedPriorityId) {
                setExecutedPriorityId(priorityItem.Id)
            }
        })
        return unsubscribe
    }, [])

    const onExecuteClick = async () => {
        setIsLoading(true)
        let ALL_SUCCESS = true
        try {
            let EXTERNAL_DATA_SOURCE_ID = externalDataSourceId
            let SITE_NAME = sharePointSiteName
            if (!EXTERNAL_DATA_SOURCE_ID) {
                EXTERNAL_DATA_SOURCE_ID = await syncExternalDataSourceId()
            }
            if (!SITE_NAME) {
                const siteInfo = await syncSharePointSiteInfo()
                SITE_NAME = siteInfo.SITE_NAME
            }
            if (!EXTERNAL_DATA_SOURCE_ID || !SITE_NAME) {
                return
            }
            const storePriorityId = await getStorePriorityIdFromExeId(priorityItem.Id, retailStore.Id)

            for (const file of executionPhotos) {
                const fileName = `${storePriorityId}_${new Date().getTime().toString()}.jpg`
                const EXECUTION_PHOTO_URL = `${
                    CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API
                }${'root:/Execution Photos/'}${fileName}:/content`
                const { isSuccess, uploadResultId } = await uploadExecutionPhotoToSharePoint(
                    sharepointToken,
                    file.data,
                    EXECUTION_PHOTO_URL
                )

                if (!isSuccess) {
                    Alert.alert('', t.labels.PBNA_MOBILE_UPLOAD_EXECUTION_PHOTO_FAILED, [
                        {
                            text: `${t.labels.PBNA_MOBILE_OK.toLocaleUpperCase()}`,
                            onPress: async () => {}
                        }
                    ])
                    setIsLoading(false)
                    ALL_SUCCESS = false
                    break
                } else {
                    await createPhotoExecutionContentVersion(
                        storePriorityId,
                        'Execution Photo',
                        fileName,
                        EXTERNAL_DATA_SOURCE_ID,
                        uploadResultId,
                        SITE_NAME,
                        sharePointPath
                    )
                }
            }

            if (ALL_SUCCESS) {
                setIsLoading(false)
                await handleExecutePriority(priorityItem.Id, retailStore.Id, setFlagAction)
                successRef.current?.openModal()
                setTimeout(() => {
                    navigation?.goBack()
                }, IntervalTime.THREE_THOUSAND)
            }
        } catch (error) {
            setIsLoading(false)
            Alert.alert('', t.labels.PBNA_MOBILE_PRIORITY_EXECUTION_FAILED, [
                {
                    text: `${t.labels.PBNA_MOBILE_OK.toLocaleUpperCase()}`,
                    onPress: async () => {}
                }
            ])
            storeClassLog(
                Log.MOBILE_ERROR,
                `PriorityPhotoExecution`,
                `${CommonParam.PERSONA__c} Execute Priority With Photo Failure ${getStringValue(error)}`
            )
        }
    }

    const onDeleteExecutionPhoto = (index: number) => {
        const tempList = [...executionPhotos]
        tempList.splice(index, 1)
        setExecutionPhotos(tempList)
    }

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.contentWrapper}>
                <View style={[styles.header, { height: TOP_HEIGHT - insets.top }]}>
                    <CText style={styles.title}>{t.labels.PBNA_MOBILE_PHOTO_EXECUTION}</CText>
                    <TouchableOpacity
                        hitSlop={commonStyle.hitSlop}
                        onPress={() => {
                            navigation?.goBack()
                        }}
                        activeOpacity={1}
                    >
                        <BlueClear height={36} width={36} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {!_.isUndefined(retailStore) && (
                        <CustomerListTile
                            containerStyle={styles.customerCardWrapper}
                            customer={retailStore}
                            showShadow
                        />
                    )}
                    <View style={styles.priorityInfo}>
                        {renderCardTitle(priorityItem, true, true)}
                        {renderCardTitleLine3(priorityItem, true)}
                        {renderStartAndEndDate(priorityItem, true, true)}
                    </View>
                    <View style={styles.takeAndPreviewPhotoWrapper}>
                        <TouchableOpacity
                            disabled={executionPhotos.length === MAX_PHOTO_NUM}
                            style={styles.takePhotoBtnWrapper}
                            onPress={() => {
                                handleTakeOrAddPhoto()
                            }}
                        >
                            <Image source={ImageSrc.IMG_CAMERA1} style={styles.imgCameraIcon} />
                            <CText
                                style={[
                                    styles.takePhotoText,
                                    executionPhotos.length === MAX_PHOTO_NUM && styles.disabledText
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_ADD_TAKE_PHOTO}
                            </CText>
                        </TouchableOpacity>
                        <PreviewImages
                            containerStyle={styles.executionPhotoContainer}
                            imageStyle={styles.photoStyle}
                            localImages={executionPhotos}
                            onDeleteImage={onDeleteExecutionPhoto}
                            showDeleteIcon
                            deleteIconStyle={styles.deleteIcon}
                        />
                    </View>
                </View>
            </View>
            <FormBottomButton
                onPressCancel={() => navigation?.goBack()}
                onPressSave={onExecuteClick}
                disableSave={!executionPhotos.length}
                rightButtonLabel={t.labels.PBNA_MOBILE_EXECUTE}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
            />
            <SuccessView
                ref={successRef}
                title={`${t.labels.PBNA_MOBILE_SUCCESS}\n${t.labels.PBNA_MOBILE_PRIORITY_EXECUTION_SUCCESS}`}
                modalViewStyle={styles.modalViewStyle}
                afterTimeClose={IntervalTime.THREE_THOUSAND}
                noClickable
            />
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default PriorityPhotoExecution
