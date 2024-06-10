/*
 * @Description:
 * @Author: Aimee Zhang
 * @Date: 2021-12-20 17:45:05
 * @LastEditTime: 2023-11-20 16:32:57
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import CustomerCellStyle from '../../../styles/manager/CustomerCellStyle'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import CText from '../../../../common/components/CText'

interface CustomerProps {
    hasAvatar?: boolean
    item: any
    index?: number
    onCellPress?: any
}

const styles = CustomerCellStyle

export const SDLVisitSegmentCell = (props: CustomerProps) => {
    const { item, onCellPress } = props

    return (
        <View style={[styles.container, styles.selectContainer]}>
            <TouchableOpacity
                onPress={() => {
                    onCellPress && onCellPress(item)
                }}
                style={styles.touchableArea}
            >
                <View style={styles.marginRight15}>
                    <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
                </View>
                <View style={styles.cellContent}>
                    <View style={styles.cellInfo}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={[styles.storeName]}>
                            {item.storeName}
                        </CText>
                        <View style={styles.flexShrinkCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                                {item.address}
                            </CText>
                            <CText numberOfLines={1} style={styles.itemSubTile}>
                                {item.cityStateZip}
                            </CText>
                        </View>
                        <View style={[styles.subtypeContainer]}>
                            {item?.type?.length > 0 &&
                                item.type.map((t) => {
                                    return (
                                        <View
                                            key={item?.Id + t}
                                            style={[styles.merchContainer, styles.merchContainerW]}
                                        >
                                            <CText style={styles.orderText}>{t}</CText>
                                        </View>
                                    )
                                })}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}
