/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-26 05:46:59
 * @LastEditTime: 2023-11-20 15:46:45
 * @LastEditors: Mary Qian
 */

import React, { useState } from 'react'

import { Dimensions, Modal, TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { Constants } from '../../../common/Constants'
import { commonStyle } from '../../../common/styles/CommonStyle'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface PreviewImagesProps {
    localImages: Array<any>
    containerStyle: any
    imageStyle: any
    onDeleteImage?: Function
    showDeleteIcon?: boolean
    deleteIconStyle?: any
}

const styles = StyleSheet.create({
    previewImageView: {
        height: Dimensions.get('window').height
    }
})

const PreviewImages = (props: PreviewImagesProps) => {
    const { containerStyle, imageStyle, localImages, onDeleteImage, showDeleteIcon, deleteIconStyle } = props

    const [showImgModal, setImgModalVisible] = useState(false)
    const [images, setImages] = useState<any[]>([])
    const [imageIndex, setImagesIndex] = useState(0)

    const onClickImage = (imageArr: Array<any>, index: number) => {
        const resultArr = imageArr.map((imgItem) => {
            return {
                url: Constants.IMAGE_DATA_PREFIX + (imgItem.Data || imgItem.data)
            }
        })
        setImagesIndex(index)
        setImages(resultArr)
        setImgModalVisible(true)
    }
    return (
        <View>
            <Modal style={commonStyle.flex_1} visible={showImgModal} transparent>
                <ImageViewer
                    style={styles.previewImageView}
                    imageUrls={images}
                    index={imageIndex}
                    backgroundColor="#00000099"
                    onClick={() => {
                        setImgModalVisible(false)
                    }}
                />
            </Modal>

            <View style={containerStyle}>
                {localImages?.map((p, i) => {
                    return (
                        <TouchableOpacity
                            key={p._soupEntryId || 'idx' + i}
                            activeOpacity={1}
                            onPress={() => onClickImage(localImages, i)}
                        >
                            <Image
                                style={imageStyle}
                                source={{ uri: Constants.IMAGE_DATA_PREFIX + (p.Data || p.data) }}
                            />
                            {showDeleteIcon && (
                                <TouchableOpacity
                                    style={deleteIconStyle}
                                    onPress={() => {
                                        onDeleteImage && onDeleteImage(i)
                                    }}
                                >
                                    <MaterialCommunityIcons name="trash-can-outline" size={14} color="white" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export default PreviewImages
