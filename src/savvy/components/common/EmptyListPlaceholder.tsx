import React, { FC } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'

interface EmptyListPlaceholderProps {
    image?: any
    title?: any
    transparentBackground?: boolean
    containerStyle?: object
    sourceImageUrl?: any
    imageContainer?: object
    fixMarginTop?: boolean
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
    const { image, title, transparentBackground, containerStyle, sourceImageUrl, imageContainer, fixMarginTop } = props
    const renderImage = () => {
        if (image) {
            return image
        }
        return <Image source={sourceImageUrl || IMG_NOFILTER_RESULT} style={imageContainer || styles.ResultIcon} />
    }
    const renderTitle = () => {
        if (title) {
            return title
        }
        return (
            <View style={styles.alignCenter}>
                <CText style={styles.noResult}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                <CText style={styles.noResultMsg}>{t.labels.PBNA_MOBILE_REVIEW_SEARCH_FILTER_CRITERIA_MSG}</CText>
            </View>
        )
    }
    return (
        <View
            style={
                containerStyle || [
                    styles.ResultIconContainer,
                    { backgroundColor: transparentBackground ? 'transparent' : 'white' },
                    fixMarginTop && styles.negativeMarginTop
                ]
            }
        >
            {renderImage()}
            {renderTitle()}
        </View>
    )
}

export default EmptyListPlaceholder
