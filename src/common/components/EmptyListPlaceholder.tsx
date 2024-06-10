import React, { FC } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { ImageSrc } from '../enums/ImageSrc'
import CText from './CText'
import { t } from '../i18n/t'
import { commonStyle } from '../styles/CommonStyle'

interface EmptyListPlaceholderProps {
    titleContainer?: any
    title?: any
    subTitle?: any
    transparentBackground?: boolean
    containerStyle?: object
    containerExtraStyle?: object
    imageStyle?: object
    sourceImageUrl?: any
    imageContainer?: object
    fixMarginTop?: boolean
    dark?: boolean
}

const IMG_NOFILTER_RESULT = ImageSrc.IMG_NOFILTER_RESULT
const styles = StyleSheet.create({
    ResultIcon: {
        width: 180,
        height: 135
    },
    ResultIconContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: '15%',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    alignCenter: {
        alignItems: 'center'
    },
    noResult: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    noResultMsg: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    negativeMarginTop: {
        marginTop: -22
    }
})

const EmptyListPlaceholder: FC<EmptyListPlaceholderProps> = (props: EmptyListPlaceholderProps) => {
    const {
        title,
        transparentBackground,
        containerStyle,
        sourceImageUrl,
        imageContainer,
        fixMarginTop,
        dark,
        subTitle,
        containerExtraStyle,
        titleContainer,
        imageStyle
    } = props
    const renderImage = () => {
        if (imageContainer) {
            return imageContainer
        }
        return <Image source={sourceImageUrl || IMG_NOFILTER_RESULT} style={imageStyle || styles.ResultIcon} />
    }
    const renderTitle = () => {
        if (titleContainer) {
            return titleContainer
        }
        return (
            <View style={styles.alignCenter}>
                <CText style={[styles.noResult, dark && commonStyle.colorWhite]}>
                    {title || t.labels.PBNA_MOBILE_NO_RESULTS}
                </CText>
                <CText style={[styles.noResultMsg, dark && commonStyle.colorWhite]}>
                    {subTitle || t.labels.PBNA_MOBILE_REVIEW_SEARCH_FILTER_CRITERIA_MSG}
                </CText>
            </View>
        )
    }
    return (
        <View
            style={
                containerStyle || [
                    styles.ResultIconContainer,
                    { backgroundColor: transparentBackground ? 'transparent' : 'white' },
                    fixMarginTop && styles.negativeMarginTop,
                    containerExtraStyle
                ]
            }
        >
            {renderImage()}
            {renderTitle()}
        </View>
    )
}

export default EmptyListPlaceholder
