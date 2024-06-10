import React, { FC, useMemo } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { normalize } from '../../utils/FontSizeUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

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
    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    quantityInputWrap: {
        width: 49,
        height: 40,
        borderColor: baseStyle.color.liteGrey,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 5
    },
    quantityUnitText: {
        fontSize: baseStyle.fontSize.fs_8,
        color: baseStyle.color.titleGray
    },
    quantityInput: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        left: 0
    },
    textInput: {
        backgroundColor: 'transparent',
        paddingTop: 5,
        paddingBottom: 17,
        paddingHorizontal: 5,
        fontFamily: 'Gotham',
        color: '#000',
        lineHeight: 18,
        textAlign: 'center'
    },
    plusBtn1: {
        backgroundColor: '#00A2D9',
        width: 15.68,
        height: 2,
        top: 11,
        left: 4
    },
    plusBtn2: {
        backgroundColor: '#00A2D9',
        height: 16,
        width: 2,
        left: 11,
        top: 4
    },
    upcText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_700
    },
    InvenIdText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_400
    },
    height_p75: {
        height: '75%'
    }
})

interface OrderInfoProductSkuTileProps {
    product?: any
}

export const OrderInfoProductSkuTile: FC<OrderInfoProductSkuTileProps> = (props: OrderInfoProductSkuTileProps) => {
    const { product } = props

    const renderProdImg = () => {
        return <Image style={styles.size_60} source={require('../../../../assets/image/No_Innovation_Product.png')} />
    }

    const getTotalAmount = () => {
        return (product?.item?.unitPrice * product?.item?.quantity).toFixed(2)
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
                    <View style={[styles.flexDirectionRow, { marginVertical: 20 }]}>
                        <View style={[styles.flexDirectionRow, styles.flexCenter]}>
                            <View style={[styles.flexDirectionRow]}>{renderProdImg()}</View>
                            <View style={[styles.flex_1, styles.marginLeft10]}>
                                <CText numberOfLines={3} style={styles.font_14_700}>
                                    {product.item['Product.Sub_Brand__c'] || product.item['Product.Name']}
                                </CText>
                                <View style={[styles.flexRowAlignCenter]}>
                                    <TouchableOpacity>
                                        <CText style={[styles.colorLightBlue, styles.upcText, styles.lineHeight_20]}>
                                            {product.item['Product.ProductCode']}
                                        </CText>
                                    </TouchableOpacity>
                                    <View style={[styles.vLine, styles.height_p75]} />
                                    <CText style={[styles.InvenIdText, styles.lineHeight_20]}>
                                        {product.item['Product.Material_Unique_ID__c']}
                                    </CText>
                                </View>
                            </View>
                            <View style={[styles.flexDirectionRow, styles.alignCenter, { justifyContent: 'flex-end' }]}>
                                <CText style={[styles.font_12_700, styles.colorBlack]}>
                                    {t.labels.PBNA_MOBILE_ORDER_D + getTotalAmount()}
                                </CText>
                                <View style={styles.vLine} />
                                <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                                    {t.labels.PBNA_MOBILE_QTY}
                                </CText>
                                <CText style={[styles.font_12_700, styles.colorBlack]}>
                                    {` ${parseInt(product.item.quantity)}`}
                                </CText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.line} />
            </View>
        )
    }, [])
}
