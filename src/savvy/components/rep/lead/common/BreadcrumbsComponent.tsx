/**
 * @description Breadcrumbs Component
 * @author Sheng Huang
 * @date 2023-03-21
 */

import React, { Dispatch, FC, Ref, SetStateAction } from 'react'
import { Image, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export type BreadcrumbType = {
    id: any
    label: string
    onPress: (index: number) => void
}

interface BreadcrumbsComponentProps {
    breadcrumbsList: Array<BreadcrumbType>
    containerStyle?: ViewStyle
    cRef?: Ref<any>
    readonly?: boolean
}

const styles = StyleSheet.create({
    breadcrumbsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    breadcrumbView: {
        marginRight: 6,
        flexDirection: 'row',
        alignItems: 'center'
    },
    breadcrumbText: {
        color: '#00A2D9',
        fontWeight: '700',
        lineHeight: 20,
        fontSize: 12,
        fontFamily: 'Gotham-Bold'
    },
    imgChevron: {
        width: 16,
        height: 16,
        marginLeft: 6,
        marginTop: 2
    }
})

const IMG_CHEVRON = ImageSrc.IMG_CHEVRON

export const sliceBreadcrumbsList = (
    setBreadcrumbsList: Dispatch<SetStateAction<Array<BreadcrumbType>>>,
    index: number
) => {
    return setBreadcrumbsList((prevState) => prevState.slice(0, index))
}

const BreadcrumbsComponent: FC<BreadcrumbsComponentProps> = (props: BreadcrumbsComponentProps) => {
    const { readonly, breadcrumbsList } = props

    const renderBreadcrumb = (breadcrumb: BreadcrumbType, index: number) => {
        return (
            <View style={styles.breadcrumbView} key={`${breadcrumb.label}${index}`}>
                <TouchableOpacity
                    disabled={readonly}
                    onPress={() => {
                        breadcrumb.onPress(index)
                    }}
                    style={commonStyle.flexDirectionRow}
                >
                    <CText style={styles.breadcrumbText}>
                        {breadcrumb.label}
                        {index !== breadcrumbsList.length - 1 && (
                            <View>
                                <Image source={IMG_CHEVRON} style={styles.imgChevron} />
                            </View>
                        )}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={[styles.breadcrumbsContainer, props.containerStyle]}>
            {breadcrumbsList?.map((breadcrumb, index: number) => {
                return renderBreadcrumb(breadcrumb, index)
            })}
        </View>
    )
}

BreadcrumbsComponent.defaultProps = {
    readonly: false
}

export default BreadcrumbsComponent
