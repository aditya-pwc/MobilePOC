/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-08-30 17:20:12
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2023-10-24 09:55:05
 */

import React, { FC, MutableRefObject, useMemo, useRef } from 'react'
import { TouchableOpacity, View, Image, StyleSheet, TextInput } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import { qtyAdjustBlock } from './AdjustQtyProdSkuTile'
import { CommonLabel } from '../../enum/CommonLabel'

const styles = StyleSheet.create({
    ...commonStyle,
    minusBtn: {
        backgroundColor: baseStyle.color.LightBlue,
        width: 13.72,
        height: 2
    },
    lineHeight_20: {
        lineHeight: 20
    },
    line: {
        height: 1,
        backgroundColor: baseStyle.color.borderGray
    },
    textPrice: {
        color: baseStyle.color.tabBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12,
        marginTop: 3
    }
})
interface InactiveProductSkuTileProps {
    product: any
    onChangeQtyNum?: MutableRefObject<Function>
    onClickActivate?: MutableRefObject<Function>
}

const InactiveProductSkuTile: FC<InactiveProductSkuTileProps> = (props) => {
    const { product, onChangeQtyNum, onClickActivate } = props
    const qtyCount = product.item.quantity
    const isVisible = product.item.Is_Visible_Product__c
    const inputRef = useRef<TextInput>(null)

    const onEditQtyCount = (quantity: string) => {
        onChangeQtyNum?.current(quantity, product?.item || {})
    }

    const renderProdImg = () => {
        return <Image style={styles.size_60} source={require('../../../../assets/image/No_Innovation_Product.png')} />
    }

    const onPressActivate = (qty: string) => {
        onClickActivate && onClickActivate.current(product?.item, qty)
    }

    const renderActivate = () => {
        return (
            <View style={[styles.flexRowAlignCenter]}>
                <TouchableOpacity
                    onPress={() => {
                        onPressActivate(qtyCount)
                    }}
                >
                    <CText style={[styles.lineHeight_20, styles.font_14_700, styles.colorLightBlue]}>
                        {t.labels.PBNA_MOBILE_ACTIVATE}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }

    const renderButtons = (isVisible: boolean) => {
        if (!isVisible) {
            return renderActivate()
        }
        return qtyAdjustBlock(qtyCount, inputRef, onEditQtyCount, false)
    }

    return useMemo(() => {
        return (
            <View>
                <View
                    style={[
                        styles.bgWhite,
                        styles.fullWidth,
                        styles.justifyContentCenter,
                        styles.paddingHorizontal_22,
                        { flex: 1 }
                    ]}
                >
                    <View style={[styles.flexDirectionRow, styles.marginVertical_20]}>
                        <View style={[styles.flexDirectionRow, styles.flexCenter]}>
                            <View style={[styles.flexDirectionRow]}>
                                <TouchableOpacity
                                    disabled={!isVisible}
                                    onPress={() => {
                                        if (isVisible) {
                                            if (parseInt(qtyCount || '0') < CommonLabel.MAX_PROD_COUNT) {
                                                if (inputRef?.current?.isFocused()) {
                                                    inputRef.current.blur()
                                                }
                                                const plusCount = parseInt(qtyCount || '0') + 1
                                                onEditQtyCount(plusCount + '')
                                            }
                                        }
                                    }}
                                >
                                    {renderProdImg()}
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.flex_1, styles.marginLeft10]}>
                                <CText numberOfLines={3} style={styles.font_14_700}>
                                    {product.item['Product.Sub_Brand__c'] || product.item['Product.Name']}
                                </CText>
                            </View>
                        </View>
                        {renderButtons(isVisible)}
                    </View>
                </View>
                <View style={styles.line} />
            </View>
        )
    }, [isVisible, qtyCount])
}

export default InactiveProductSkuTile
