import React, { useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CText from '../../../../../common/components/CText'
import { CardGroupImage } from './components/CardGroupImage'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'

interface PriorityProductAttributeItemProps extends React.PropsWithChildren {
    paItem: any
    renderSubItems: () => React.ReactNode[]
    onPressViewAvailableProducts: (paItem: any) => void
}

export const styles = StyleSheet.create({
    cardContainer: {
        flex: 1
    },
    card: {
        marginHorizontal: 22,
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3'
    },
    cardImage: {
        marginRight: 10,
        width: 60,
        height: 60,
        flex: 0
    },
    cardContent: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    cardTitle: {
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 0,
        flex: 1,
        marginRight: 4
    },
    cardSubtitle: {
        color: baseStyle.color.titleGray,
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 18,
        letterSpacing: 0
    },
    cardText: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 18,
        letterSpacing: 0
    },
    cardTextBold: {
        fontWeight: '700'
    },
    cardTextPipe: {
        color: baseStyle.color.borderGray
    },
    flexRow: {
        flexDirection: 'row'
    },
    productItemContentQty: {
        fontSize: 12
    },
    boldText: {
        fontWeight: '700',
        marginLeft: 4
    },
    viewAvailableProductsBtn: {
        color: baseStyle.color.tabBlue,
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
        textTransform: 'uppercase'
    }
})

export const PriorityProductAttributeItem: React.FC<PriorityProductAttributeItemProps> = ({
    paItem,
    renderSubItems,
    onPressViewAvailableProducts
}) => {
    // default to collapse
    const [isGroupOpen, setIsGroupOpen] = useState<boolean>(false)

    return (
        <View>
            {/* paItem */}
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <Image style={styles.cardImage} resizeMode={'contain'} source={ImageSrc.IMG_CAROUSEL_GUIDE} />
                    <View style={styles.cardContent}>
                        {/* Flavor */}
                        <CText style={styles.cardTitle}>{paItem.Flavor}</CText>
                        {/* Package */}
                        <CText style={styles.cardSubtitle}>{paItem.Package}</CText>
                        {/* Suggested Qty */}
                        <View style={styles.flexRow}>
                            <CText style={[styles.cardText]}>{t.labels.PBNA_MOBILE_IP_CART_SUGGESTED_QUANTITY}</CText>
                            <CText style={[styles.cardText, styles.cardTextBold]}>
                                {` ${paItem.Quantity} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                            </CText>
                        </View>
                        {/* Pushed Qty */}
                        {paItem._pushedQty > 0 && (
                            <View style={styles.flexRow}>
                                <CText style={[styles.cardText]}>
                                    {`${t.labels.PBNA_MOBILE_TOTAL} ${t.labels.PBNA_MOBILE_PUSHED_QTY}`}
                                </CText>
                                <CText style={[styles.cardText, styles.cardTextBold]}>
                                    {` ${paItem._pushedQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                                    {paItem._pushedQty < Number(paItem.Quantity) && (
                                        <>
                                            <CText> </CText>
                                            <Image
                                                style={{ width: 15, height: 15 }}
                                                source={ImageSrc.ICON_WARNING_RND_BG_Y_FG_B}
                                            />
                                        </>
                                    )}
                                </CText>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => onPressViewAvailableProducts(paItem)}>
                            <CText style={[styles.viewAvailableProductsBtn]}>
                                {t.labels.PBNA_MOBILE_VIEW_AVAILABLE_PRODUCTS}
                            </CText>
                        </TouchableOpacity>
                    </View>
                    <CardGroupImage open={isGroupOpen} onPress={() => setIsGroupOpen(!isGroupOpen)} />
                </View>
            </View>
            {isGroupOpen && renderSubItems()}
        </View>
    )
}
