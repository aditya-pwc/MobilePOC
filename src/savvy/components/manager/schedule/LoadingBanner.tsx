/**
 * @description Loading Banner Component.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-14
 */

import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import Draggable from 'react-native-draggable'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    toastContainer: {
        width,
        position: 'absolute'
    },
    toastContent: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20
    },
    toastLoading: {
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#2DD36F'
    },
    toastSuccess: {
        backgroundColor: '#6C0CC3'
    },
    loadingBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgIcon: {
        width: 35,
        height: 35,
        marginRight: 6
    },
    imgIconLoaded: {
        width: 26,
        height: 26,
        marginRight: 10
    },
    loadingBannerText: {
        color: '#fff'
    },
    loadingBannerButton: {
        color: '#fff',
        fontWeight: 'bold'
    },
    disableCancel: {
        opacity: 0.5
    }
})
interface LoadingBannerProps {
    cancelGenerate?: any
    reviewSchedule?: any
    isLoading?: boolean
    isCompleted?: boolean
    visitListId?: string
    disableCancelBtn?: boolean
    setDisableCancelBtn?: any
}

const screenHight = Dimensions.get('window').height
const distanceToBottom = 146
const coordinateX = 0
const coordinateY = screenHight - distanceToBottom
const coordinateYMin = 90
const ICON_LOADED = ImageSrc.ICON_LOADED
const ICON_LOADING = ImageSrc.ICON_LOADING

const LoadingBanner = (props: LoadingBannerProps) => {
    const {
        cancelGenerate,
        reviewSchedule,
        isLoading,
        isCompleted,
        visitListId,
        disableCancelBtn,
        setDisableCancelBtn
    } = props
    const handleCancel = () => {
        setDisableCancelBtn(true)
        cancelGenerate()
    }
    const handleReview = () => {
        reviewSchedule()
    }
    return (
        <Draggable
            x={coordinateX}
            y={coordinateY}
            minX={coordinateX}
            minY={coordinateYMin}
            maxX={coordinateX}
            maxY={coordinateY}
        >
            <View style={styles.toastContainer}>
                {isCompleted && (
                    <View style={[styles.toastContent, styles.toastSuccess]}>
                        <View style={styles.loadingBannerLeft}>
                            <Image style={styles.imgIconLoaded} source={ICON_LOADED} />
                            <CText style={styles.loadingBannerText}>
                                {t.labels.PBNA_MOBILE_NEW_SCHEDULE_GENERATED}
                            </CText>
                        </View>
                        <TouchableOpacity onPress={handleReview} hitSlop={commonStyle.hitSlop}>
                            <CText style={styles.loadingBannerButton}>{t.labels.PBNA_MOBILE_REVIEW}</CText>
                        </TouchableOpacity>
                    </View>
                )}
                {isLoading && !isCompleted && (
                    <View style={[styles.toastContent, styles.toastLoading]}>
                        <View style={styles.loadingBannerLeft}>
                            <Image style={styles.imgIcon} source={ICON_LOADING} />
                            <CText style={styles.loadingBannerText}>
                                {t.labels.PBNA_MOBILE_GENERATING_NEW_SCHEDULE}
                            </CText>
                        </View>
                        {visitListId !== '' && (
                            <TouchableOpacity
                                onPress={handleCancel}
                                disabled={disableCancelBtn}
                                hitSlop={commonStyle.hitSlop}
                            >
                                <CText
                                    style={[styles.loadingBannerButton, disableCancelBtn ? styles.disableCancel : null]}
                                >
                                    {t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </Draggable>
    )
}

export default LoadingBanner
