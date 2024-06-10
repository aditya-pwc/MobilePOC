import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'
import CText from '../../../../../../common/components/CText'
import QuantityInputBox from '../../../lead/common/QuantityInputBox'
import { t } from '../../../../../../common/i18n/t'
import { colors } from 'react-native-elements'
import { useDispatch, useSelector } from 'react-redux'
import { removeCartItem, selectPAProducts, updateCartItem } from '../../../../../redux/Slice/PriorityCartSlice'
import { CardGroupImage } from './CardGroupImage'
import { renderNeedsAuthPill } from '../PriorityProductAttributeList'

/* eslint-disable camelcase */
// The following kind of fields are queried from API,
//  the names on Salesforce are conflicting to the eslint rules.
type Item = {
    _id: string // temporary id is generated on AddToCartScreen component
    Channel: string[]
    Flavor: string
    Package: string
    Quantity: number
    Sub_Brand: string
    Sub_Category: string
}
/* eslint-enable camelcase */

const styles = StyleSheet.create({
    card: {
        borderRadius: 6,
        opacity: 1,
        backgroundColor: 'rgba(255,255,255, 1)'
    },
    product: {
        border: 1,
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row'
    },
    productImage: {
        width: 60,
        height: 60,
        marginRight: 10
    },
    productInfo: {
        width: 140,
        flexGrow: 1,
        flexDirection: 'column'
    },
    font: {
        fontStyle: 'normal',
        letterSpacing: 0,
        textAlign: 'left',
        lineHeight: 18
    },
    bold: {
        fontWeight: '700'
    },
    font12: {
        fontSize: 12
    },
    font14: {
        fontSize: 14
    },
    font16: {
        fontSize: 16
    },
    colorBlack: {
        color: 'rgba(0,0,0,1)'
    },
    colorGrey: {
        color: 'rgba(86,86,86,1)'
    },
    productInfoTitle: {
        flexGrow: 1,
        color: 'rgba(0,0,0,1)',
        fontSize: 14,
        fontWeight: '700'
    },
    productInfoSubtitle: {
        color: 'rgba(86,86,86,1)',
        fontSize: 12,
        fontWeight: '400'
    },
    productInfoQtyDesc: {
        color: 'rgba(0,0,0,1)',
        fontSize: 12,
        fontWeight: '400'
    },
    footer: {
        paddingVertical: 13,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    borderTop1: {
        borderTopWidth: 0.5,
        borderTopColor: colors.grey5
    },
    selectProducts: {
        color: 'rgba(0,162,217,1)',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    borderBottom: {
        borderBottom: 1,
        borderTopColor: colors.grey5
    },
    removeTextStyle: {
        marginTop: 6,
        color: '#EB445A',
        fontWeight: '700'
    }
})

interface AddToCartItemProps {
    item: Item
    onQuantityChange: (quantity: number) => void
    onSelectProducts: (prod: any) => void
    needAuthProducts: string[]
}

const ATCPriorityCartItem: React.FC<AddToCartItemProps> = ({
    item,
    onQuantityChange,
    onSelectProducts,
    needAuthProducts
}) => {
    const [isGroupOpen, setIsGroupOpen] = useState<boolean>(true)

    const products = useSelector(selectPAProducts(item._id))
    const dispatch = useDispatch()

    const setNewQuantity = (product: any, value: number) => {
        dispatch(
            updateCartItem({
                productAttributeId: item._id,
                productId: product.id,
                groupName: product.packageGroupName,
                productQuantity: value
            })
        )
        typeof onQuantityChange === 'function' && onQuantityChange(value)
    }

    const quantitySubtotal = useMemo(() => {
        return products.reduce((res, prod) => res + Number(prod.quantity), 0)
    }, [products])

    // Should the Cart Item - Added Qty show Qty warn if there are any products in the cart
    const isWarnQty =
        products.length > 0 && Number(quantitySubtotal) >= 0 && Number(quantitySubtotal) < Number(item.Quantity)

    return (
        <View style={styles.card}>
            {/* Cart Group Item */}
            <View style={[styles.product]}>
                {/* product or package image */}
                <Image style={styles.productImage} resizeMode={'contain'} source={ImageSrc.IMG_CAROUSEL_GUIDE} />
                {/* product or package detail info */}
                <View style={styles.productInfo}>
                    <CText style={[styles.productInfoTitle, styles.font]}>{item.Flavor}</CText>
                    <CText style={[styles.productInfoSubtitle, styles.font]}>{item.Package}</CText>
                    <CText style={[styles.productInfoQtyDesc, styles.font]}>
                        {t.labels.PBNA_MOBILE_IP_CART_SUGGESTED_QUANTITY + ' '}
                        <CText style={[styles.bold, styles.font12]}>
                            {item.Quantity} {t.labels.PBNA_MOBILE_IP_CART_SUGGESTED_QUANTITY_CS}
                        </CText>
                    </CText>
                </View>
                {/* product group operator */}
                <CardGroupImage open={isGroupOpen} onPress={() => setIsGroupOpen(!isGroupOpen)} />
            </View>
            {/* Cart Grouped Items */}
            {isGroupOpen &&
                products.map((product) => (
                    <View key={product.id} style={[styles.product, styles.borderBottom]}>
                        {/* product or package image */}
                        <Image
                            style={styles.productImage}
                            resizeMode={'contain'}
                            source={ImageSrc.IMG_CAROUSEL_GUIDE}
                        />
                        {/* product or package detail info */}
                        <View style={styles.productInfo}>
                            <View>
                                <CText style={[styles.productInfoTitle, styles.font]}>{product.subBrand}</CText>
                                <CText style={[styles.productInfoSubtitle, styles.font]}>
                                    {product.packageGroupName}
                                </CText>
                                <CText style={[styles.productInfoQtyDesc, styles.font]}>
                                    <CText style={[{ color: '#00A2D9', fontWeight: '700' }]}>
                                        {product.productCode}
                                    </CText>
                                    <CText style={{ color: '#D3D3D3' }}>{` | `}</CText>
                                    <CText>{product.materialUniqueID}</CText>
                                </CText>
                            </View>
                            {needAuthProducts.includes(product.materialUniqueID) && renderNeedsAuthPill(true)}
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(
                                        removeCartItem({
                                            productAttributeId: item._id,
                                            productId: product.id,
                                            groupName: product.packageGroupName
                                        })
                                    )
                                }}
                            >
                                <CText style={styles.removeTextStyle}>
                                    {t.labels.PBNA_MOBILE_REMOVE.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        </View>
                        {/* product qty operator */}
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <QuantityInputBox
                                keyboardType="number-pad"
                                value={`${product.quantity}`}
                                onPressMinus={() => {
                                    const newValue = Number(product.quantity - 1)
                                    setNewQuantity(product, newValue < 0 ? product.quantity : newValue)
                                }}
                                onPressPlus={() => {
                                    const newValue = Number(product.quantity) + 1
                                    // feature(10944066): the user should be able to add more products than suggested qs, so there shouldn't be any limitation here.
                                    setNewQuantity(product, newValue)
                                }}
                                onChangeText={(value) => {
                                    if (!value.trim()) {
                                        setNewQuantity(product, 0)
                                    } else {
                                        const newValue = Number(value)
                                        // feature(10944066): the user should be able to add more products than suggested qs, so there shouldn't be any limitation here.
                                        if (newValue > 0) {
                                            setNewQuantity(product, newValue)
                                        }
                                    }
                                }}
                            />
                        </View>
                    </View>
                ))}
            {/* Footer */}
            <View style={[styles.footer, styles.borderTop1]}>
                <TouchableOpacity onPress={() => onSelectProducts(item)}>
                    <CText style={[styles.selectProducts, styles.font12]}>{t.labels.PBNA_MOBILE_SELECT_PRODUCTS}</CText>
                </TouchableOpacity>
                <CText style={[styles.font12, styles.colorGrey, { justifyContent: 'center', alignItems: 'center' }]}>
                    <CText>{`${t.labels.PBNA_MOBILE_IP_CART_ADDED_QTY} `}</CText>
                    <CText style={[styles.font16, styles.bold, styles.colorBlack, { alignItems: 'center' }]}>
                        <CText>{`${quantitySubtotal} ${t.labels.PBNA_MOBILE_IP_CART_SUGGESTED_QUANTITY_CS}`}</CText>
                        {isWarnQty && (
                            <>
                                <CText> </CText>
                                <Image style={{ width: 15, height: 15 }} source={ImageSrc.ICON_WARNING_RND_BG_Y_FG_B} />
                            </>
                        )}
                    </CText>
                </CText>
            </View>
        </View>
    )
}

export default ATCPriorityCartItem
