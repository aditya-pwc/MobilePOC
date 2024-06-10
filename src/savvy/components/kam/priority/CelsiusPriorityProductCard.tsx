import React, { useMemo, useState } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import { selectCelsiusCartItem, updateCelsiusCartItem } from '../../../redux/Slice/PriorityCartSlice'
import QuantityInputBox from '../../rep/lead/common/QuantityInputBox'
import { renderNeedsAuthPill } from '../../rep/customer/innovation-tab/PriorityProductAttributeList'

interface CelsiusPriorityProductCardProps extends React.PropsWithChildren {
    productItem?: any
    isAddToCartPage?: boolean
}

const styles = StyleSheet.create({
    ...commonStyle,
    chevron_up_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    width_p90: {
        width: '90%'
    },
    productItem: {
        marginHorizontal: 22,
        paddingVertical: 20
    },
    borderBottomStyle: {
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    lineHeight_20: {
        lineHeight: 20
    },
    minusBtn: {
        backgroundColor: baseStyle.color.LightBlue,
        width: 13.72,
        height: 2
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
    marginLeft_Auto: {
        marginLeft: 'auto'
    },
    maxWidth_230: {
        maxWidth: 230
    },
    maxWidth_190: {
        maxWidth: 190
    },
    maxWidth_180: {
        maxWidth: 180
    },
    height_42: {
        height: 42
    },
    marginVertical_15: {
        marginVertical: 15
    },
    lineBoldGray: {
        height: 1,
        backgroundColor: baseStyle.color.borderGray
    },
    paddingHorizontal_12: {
        paddingHorizontal: 12
    },
    priorityProductCard: {
        backgroundColor: baseStyle.color.white,
        paddingTop: 20,
        paddingBottom: 10,
        marginHorizontal: 22,
        borderRadius: 6,
        marginBottom: 16,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.17,
        shadowRadius: 10
    },
    celsiusPriorityProductItem: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    alignItemsStart: {
        alignItems: 'flex-start'
    },
    offInWhsePillCon: {
        width: 106,
        height: 20,
        borderRadius: 10,
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.titleGray,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pillText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham'
    },
    marginTop_10: {
        marginTop: 10
    },
    width_230: {
        width: 230
    }
})

const renderOffInWhsePill = (hasNeedsAuthPill = false, isAddToCartPage?: boolean) => {
    const marginStyle = hasNeedsAuthPill
        ? isAddToCartPage
            ? styles.marginLeft10
            : styles.marginTop_10
        : isAddToCartPage
        ? {}
        : commonStyle.marginTop_5
    return (
        <View style={[styles.offInWhsePillCon, marginStyle]}>
            <CText style={styles.pillText}>{t.labels.PBNA_MOBILE_PRODUCT_OFF_IN_WHSE}</CText>
        </View>
    )
}

const renderCelsiusPills = (product: any, isAddToCartPage?: boolean) => {
    return (
        <View
            style={
                isAddToCartPage
                    ? [commonStyle.flexRowAlignCenter, styles.width_230, styles.marginTop_10]
                    : commonStyle.alignItemsEnd
            }
        >
            {product.isNeedsAuth && renderNeedsAuthPill()}
            {product.isOffInWhse && renderOffInWhsePill(product.isNeedsAuth, isAddToCartPage)}
        </View>
    )
}

export const CelsiusPriorityProductCard: React.FC<CelsiusPriorityProductCardProps> = ({
    productItem: item,
    isAddToCartPage
}) => {
    const celsiusCartItem = useSelector(selectCelsiusCartItem(item.Material_Unique_ID__c))

    const isWarnCelsiusPresoldQty =
        _.isNumber(celsiusCartItem?.quantity) &&
        celsiusCartItem?.quantity >= 0 &&
        celsiusCartItem?.quantity < Number(item.PresoldQty)

    // productItem combines cart
    const productItem = useMemo(() => {
        if (item && celsiusCartItem) {
            return {
                ...item,
                quantity: celsiusCartItem.quantity || 0
            }
        }
        return item
    }, [item, celsiusCartItem])

    const [tempQty, setTempQty] = useState(productItem.quantity)

    const dispatch = useDispatch()

    const setNewQuantity = (value: number) => {
        if (_.isNumber(value)) {
            dispatch(
                updateCelsiusCartItem({
                    inventoryId: productItem.Material_Unique_ID__c,
                    quantity: value
                })
            )
        }
    }

    return (
        <View
            key={productItem.Id}
            style={[isAddToCartPage ? styles.priorityProductCard : styles.celsiusPriorityProductItem]}
        >
            <View
                style={[styles.fullWidth, styles.flexDirectionRow, styles.alignItemsStart, styles.paddingHorizontal_12]}
            >
                <Image style={styles.size_60} source={ImageSrc.IMG_NO_INNOVATION_PRODUCT} />
                <View style={[styles.marginLeft10, styles.flex_1]}>
                    <CText style={[styles.font_14_700, styles.lineHeight_20]}>{productItem.Sub_Brand__c}</CText>
                    <View style={[styles.flexDirectionRow, styles.alignItemsCenter, styles.marginTop_5]}>
                        <CText style={[styles.font_12_400]}>{productItem.Package_Type_Name__c}</CText>
                    </View>
                    {!isAddToCartPage && (
                        <View style={[styles.flexDirectionRow, styles.alignItemsCenter, styles.marginTop_5]}>
                            <CText style={[styles.font_12_700]}>{productItem.ProductCode}</CText>
                            <View style={[styles.vLine]} />
                            <CText style={[styles.font_12_400]}>{productItem.Material_Unique_ID__c}</CText>
                        </View>
                    )}
                    <CText style={styles.marginTop_5}>
                        {`${t.labels.PBNA_MOBILE_PRE_SOLD} ${t.labels.PBNA_MOBILE_QTY} `}
                        <CText style={styles.font_12_700}>
                            {`${productItem.PresoldQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                        </CText>
                    </CText>
                    {isAddToCartPage && renderCelsiusPills(productItem, isAddToCartPage)}
                </View>
                {!isAddToCartPage && renderCelsiusPills(productItem, isAddToCartPage)}
                {isAddToCartPage && (
                    <QuantityInputBox
                        keyboardType="number-pad"
                        value={`${tempQty}`}
                        onPressMinus={() => {
                            const newValue = Number(productItem.quantity - 1)
                            setNewQuantity(newValue < 0 ? productItem.quantity : newValue)
                        }}
                        onPressPlus={() => {
                            const newValue = Number(productItem.quantity) + 1
                            setNewQuantity(newValue)
                        }}
                        onChangeText={(value) => {
                            if (!value.trim()) {
                                setTempQty(0)
                            } else {
                                const newValue = Number(value)
                                if (newValue > 0) {
                                    setTempQty(newValue)
                                }
                            }
                        }}
                        onBlurInput={() => {
                            setNewQuantity(tempQty)
                        }}
                    />
                )}
            </View>
            {isAddToCartPage && (
                <View>
                    <View style={[styles.lineBoldGray, styles.marginTop_20, styles.marginBottom_10]} />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <CText style={[styles.textAlignRight, styles.paddingHorizontal_12]}>
                            {t.labels.PBNA_MOBILE_IP_CART_ADDED_QTY}
                            <CText style={styles.font_16_700}>
                                {` ${productItem.quantity} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                                {isWarnCelsiusPresoldQty && (
                                    <Image
                                        style={{ width: 15, height: 15, transform: [{ translateX: 15 }] }}
                                        source={ImageSrc.ICON_WARNING_RND_BG_Y_FG_B}
                                    />
                                )}
                            </CText>
                        </CText>
                    </View>
                </View>
            )}
        </View>
    )
}
