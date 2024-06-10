import React, { FC, MutableRefObject, useMemo, useRef } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { getSectionQty } from '../../pages/MyDayScreen/ProductSellingViewModal'
import { ProductSKUType } from '../../hooks/ProductSellingHooks'
import { SwipeRow } from 'react-native-swipe-list-view'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { OrderInfoProductSkuTile } from '../order/OrderInfoProductSkuTile'
import InactiveProductSkuTile from './InactiveProductSkuTile'
import { AdjustQtyProdSkuTile } from './AdjustQtyProdSkuTile'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import _ from 'lodash'
import IconVolumeHurdle from '../../../../assets/image/icon_pricing_hurdle.svg'
import { StoreProduct } from '../../interface/StoreProduct'
import { isTrueInDB } from '../../../savvy/utils/CommonUtils'
import PriceDM from '../../domain/price/PriceDM'
import { formatPrice } from '../../utils/PriceUtils'

const styles = StyleSheet.create({
    ...commonStyle,
    headerCustomerContainer: {
        flexDirection: 'column',
        flex: 1
    },
    headerCustomerName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginBottom: 6
    },
    headerCustomerNumber: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginBottom: 6
    },
    headerCustomerAddress: {
        color: baseStyle.color.titleGray,
        maxWidth: 200
    },
    searchContainer: {
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 58
    },
    searchIconSize: {
        height: 22,
        width: 24
    },
    micIconContainer: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: baseStyle.color.LightBlue
    },
    searchIconContainer: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: '#f0f3f6'
    },
    searchBarContainer: {
        height: 36
    },
    searchInputContainer: {
        height: 36,
        marginTop: 0,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1
    },
    barCodeContainer: {
        height: 36,
        width: 36,
        borderRadius: 4,
        backgroundColor: baseStyle.color.LightBlue
    },
    chevron_up: {
        ...commonStyle.chevron,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_left: {
        ...commonStyle.chevron,
        marginTop: 15,
        width: 15,
        height: 15,
        borderTopWidth: 3,
        borderRightWidth: 3
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    chevron_up_black: {
        width: 11,
        height: 11,
        transform: [{ translateY: 2 }, { rotate: '-135deg' }],
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down_black: {
        width: 11,
        height: 11,
        transform: [{ translateY: -2 }, { rotate: '-135deg' }],
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3',
        marginBottom: 100
    },
    accordionSize: {
        paddingVertical: 20,
        height: '40%',
        backgroundColor: '#FFF'
    },
    expandContainer: {
        height: 60,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    width_p90: {
        width: '90%'
    },
    sectionHeaderMargin: {
        marginTop: 7,
        marginBottom: 15
    },
    swipeRowWrap: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    swipeRowBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 98,
        right: 22,
        backgroundColor: baseStyle.color.red
    },
    borderTop_1: { borderBottomWidth: 1, borderBottomColor: '#D3D3D3' },
    actionBtnBgColor: { backgroundColor: '#FFC409' },
    packageLevelView: {
        paddingHorizontal: 22,
        height: 90,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center'
    },
    packageLevelViewName: {
        marginVertical: 6,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    packageLevelViewNameIcon: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    packageLevelViewQty: {
        paddingHorizontal: 22,
        height: 90,
        paddingVertical: 14
    },
    priceMissingErrorText: {
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.red,
        fontWeight: baseStyle.fontWeight.fw_400,
        marginLeft: 7
    },
    volumeHurdleContainer: {
        backgroundColor: '#F2F6F9',
        borderRadius: 8,
        marginHorizontal: 20,
        paddingLeft: 15,
        paddingVertical: 5,
        marginBottom: 30
    },
    marginRight_10: {
        marginRight: 10
    }
})

export enum ItemActionType {
    ACTION_PRODUCT_SKU_LIST,
    ACTION_ORDER_SUMMARY
}
interface CollapsibleProps {
    item: ProductSKUType
    setIsActiveRef: MutableRefObject<Function>
    setQuantityRef?: MutableRefObject<Function>
    onRemoveCartItemRef?: MutableRefObject<Function>
    swipeAble?: boolean
    setScreenScrollEnabled?: Function
    cRef?: any
    sectionIndex?: number
    isOrderInfo?: boolean
    isInactiveProd?: boolean
    setIsProductVisibleRef?: MutableRefObject<Function>
    actionType?: ItemActionType
    onDeactivateClickRef?: MutableRefObject<Function>
    currentOpenRowRef?: MutableRefObject<any>
    openEDVPopup?: any
    closeEDVPopup?: any
    setEDVRef?: MutableRefObject<any>
}

interface ItemActionViewProps {
    type?: ItemActionType
    onRemoveCartItemRef?: MutableRefObject<Function>
    closeSwipeRow: Function
    itemRefs?: any
    index: number
    product: any
    onDeactivateClickRef?: MutableRefObject<Function>
}

const ItemActionView = (props: ItemActionViewProps) => {
    switch (props.type) {
        case ItemActionType.ACTION_ORDER_SUMMARY:
            return (
                <View style={[styles.swipeRowWrap]}>
                    <TouchableOpacity
                        style={[styles.swipeRowBtn]}
                        onPress={() => {
                            Alert.alert(t.labels.PBNA_MOBILE_REMOVE, t.labels.PBNA_MOBILE_REMOVE_CART_ITEM_MESSAGE, [
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                    onPress: () => {
                                        props.closeSwipeRow(props.itemRefs.current[props.index])
                                    }
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_REMOVE_CHECK_MESSAGE,
                                    style: 'default',
                                    onPress: async () => {
                                        props.onRemoveCartItemRef?.current &&
                                            (await props.onRemoveCartItemRef.current(
                                                props.product.ProductId,
                                                props.product['Product.Sub_Brand__c']
                                            ))
                                    }
                                }
                            ])
                        }}
                    >
                        <CText style={[styles.font_12_700, styles.colorWhite]}>
                            {t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}
                        </CText>
                    </TouchableOpacity>
                </View>
            )
        case ItemActionType.ACTION_PRODUCT_SKU_LIST:
            return (
                <View style={[styles.swipeRowWrap]}>
                    <TouchableOpacity
                        style={[styles.swipeRowBtn, styles.actionBtnBgColor]}
                        onPress={() => {
                            Alert.alert(t.labels.PBNA_MOBILE_DEACTIVATE, t.labels.PBNA_MOBILE_DEACTIVATE_ITEM_MESSAGE, [
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                    onPress: () => {
                                        props.closeSwipeRow(props.itemRefs.current[props.index])
                                    }
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_DEACTIVATE_BUTTON,
                                    style: 'default',
                                    onPress: async () => {
                                        props.onDeactivateClickRef && props.onDeactivateClickRef?.current(props.product)
                                    }
                                }
                            ])
                        }}
                    >
                        <CText style={[styles.font_12_700, styles.colorBlack]}>
                            {t.labels.PBNA_MOBILE_DEACTIVATE.toUpperCase()}
                        </CText>
                    </TouchableOpacity>
                </View>
            )
        default:
            return null
    }
}

export const ProductSection: FC<CollapsibleProps> = (props: CollapsibleProps) => {
    const {
        item,
        setQuantityRef,
        onRemoveCartItemRef,
        swipeAble,
        setScreenScrollEnabled,
        isOrderInfo,
        isInactiveProd,
        setIsProductVisibleRef,
        setIsActiveRef,
        currentOpenRowRef,
        openEDVPopup,
        closeEDVPopup,
        setEDVRef
    } = props
    const { label, isActive, products = [] } = item
    const itemRefs = useRef([])
    const isSliderOpen = useRef(false)

    const volumeHurldeLines = useMemo(() => {
        // volumeHurdleLines only on product sku and my cart page
        if (isOrderInfo || isInactiveProd) {
            return []
        }
        return PriceDM.getVolumeHurldeInfo(item.products || [])
    }, [item.products, isOrderInfo])

    const volumnHurdleLinesJSX = useMemo(() => {
        if (!volumeHurldeLines?.length) {
            return null
        }
        return (
            <View style={styles.volumeHurdleContainer}>
                {volumeHurldeLines.map((el) => {
                    return (
                        <View style={[styles.flexRowAlignCenter, { height: 40 }]} key={el.Deal_Id__c}>
                            <IconVolumeHurdle style={[styles.iconSmall, { marginRight: 8 }]} />
                            <CText>{t.labels.PBNA_MOBILE_VOLUME_HURDLE + ' '}</CText>
                            <CText style={styles.font_14_700}>
                                {t.labels.PBNA_MOBILE_ORDER_D +
                                    formatPrice(el.Price) +
                                    '/' +
                                    parseInt(el.Minimum_Quantity)}
                            </CText>
                            <CText>{' | ' + t.labels.PBNA_MOBILE_IP_CART_ADDED_QTY + ' '}</CText>
                            <CText
                                style={[
                                    styles.font_14_700,
                                    { color: el.met ? baseStyle.color.black : baseStyle.color.lightRed }
                                ]}
                            >
                                {el.quantity + ' ' + t.labels.PBNA_MOBILE_QUANTITY_CS}
                            </CText>
                        </View>
                    )
                })}
            </View>
        )
    }, [volumeHurldeLines])

    const priceMissingCheck = useMemo(() => {
        if (isOrderInfo || isInactiveProd) {
            return false
        }
        return !!products.some((item: StoreProduct) => {
            return (_.toNumber(item.priceIndex) < 0 || _.toNumber(item.unitPrice) < 0) && _.toNumber(item.quantity) > 0
        })
    }, [item.products])

    const closeSwipeRow = (itemRef: any) => {
        itemRef.closeRow()
    }

    const renderWhichItem = (
        product: any,
        isSliderOpen: React.MutableRefObject<boolean>,
        onPickerLabelClicked: Function
    ) => {
        let adjustQtyProdSkuTile
        if (isOrderInfo) {
            adjustQtyProdSkuTile = <OrderInfoProductSkuTile key={product.ProductId} product={{ item: product }} />
        } else if (isInactiveProd) {
            adjustQtyProdSkuTile = (
                <InactiveProductSkuTile
                    key={product.ProductId}
                    product={{ item: product }}
                    onChangeQtyNum={setQuantityRef}
                    onClickActivate={setIsProductVisibleRef}
                />
            )
        } else {
            adjustQtyProdSkuTile = (
                <AdjustQtyProdSkuTile
                    key={product.ProductId}
                    product={{ item: product }}
                    onChangeQtyNum={setQuantityRef}
                    showSugQty
                    showProdTrend
                    currentOpenRowRef={currentOpenRowRef}
                    openEDVPopup={openEDVPopup}
                    closeEDVPopup={closeEDVPopup}
                    setEDVRef={setEDVRef}
                    isSliderOpen={isSliderOpen}
                    onPickerLabelClicked={onPickerLabelClicked}
                />
            )
        }
        return adjustQtyProdSkuTile
    }

    const renderOrdQty = () => {
        if (!isInactiveProd) {
            return (
                <View style={[styles.flexDirectionRow]}>
                    <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                        {t.labels.PBNA_MOBILE_ORDERADE_ORDER_QTY}
                    </CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5]}>{`${getSectionQty(products)}`}</CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5]}>{t.labels.PBNA_MOBILE_QUANTITY_CS}</CText>
                </View>
            )
        }
    }

    const closeRow = () => {
        currentOpenRowRef?.current?.closeRow()
    }

    return useMemo(() => {
        return (
            <View style={styles.borderTop_1}>
                <TouchableOpacity
                    onPress={() => {
                        setIsActiveRef?.current(label)
                        currentOpenRowRef?.current?.closeRow()
                    }}
                    style={[styles.packageLevelView, !isActive && styles.borderTop_1]}
                >
                    <View style={[styles.flexGrow_1, styles.marginRight_22]}>
                        <View>
                            <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                                {t.labels.PBNA_MOBILE_PACKAGE}
                            </CText>
                        </View>
                        <View style={styles.packageLevelViewName}>
                            <CText style={[styles.font_12_700, { maxWidth: 230 }]} numberOfLines={1}>
                                {label}
                            </CText>
                        </View>
                        {renderOrdQty()}
                    </View>
                    <View style={styles.flexRowAlignCenter}>
                        {priceMissingCheck && (
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={baseStyle.fontSize.fs_18}
                                color={baseStyle.color.red}
                                style={styles.marginRight_10}
                            />
                        )}
                        {!!volumnHurdleLinesJSX && (
                            <IconVolumeHurdle style={[styles.iconSmall, styles.marginRight_10]} />
                        )}
                        <View style={[isActive ? styles.chevron_up_black : styles.chevron_down_black]} />
                    </View>
                </TouchableOpacity>
                {isActive && (
                    <>
                        {volumnHurdleLinesJSX}
                        <View style={[styles.paddingHorizontal_22, styles.fullWidth]}>
                            <CText style={[styles.font_12_700, styles.marginBottom_15]}>
                                {t.labels.PBNA_MOBILE_PRODUCT_INFO.toUpperCase()}
                            </CText>
                            <View style={styles.lineBold} />
                        </View>
                        {products.map((product, index) => {
                            if (!isTrueInDB(product.searchMatch) && !isOrderInfo && !isInactiveProd) {
                                return null
                            }
                            const adjustQtyProdSkuTile = (isSliderOpen: React.MutableRefObject<boolean>) => {
                                return renderWhichItem(product, isSliderOpen, closeRow)
                            }
                            if (!swipeAble) {
                                return adjustQtyProdSkuTile(isSliderOpen)
                            }
                            return (
                                <SwipeRow
                                    ref={(el) => (itemRefs.current[index] = el)}
                                    key={product.ProductId}
                                    rightOpenValue={-120}
                                    closeOnRowPress
                                    disableRightSwipe
                                    friction={4}
                                    tension={4}
                                    swipeToOpenPercent={5}
                                    previewOpenValue={0.1}
                                    setScrollEnabled={(enable: boolean) => {
                                        setScreenScrollEnabled && setScreenScrollEnabled(enable)
                                    }}
                                    onRowOpen={() => {
                                        if (currentOpenRowRef?.current === itemRefs.current[index]) {
                                            return
                                        }
                                        currentOpenRowRef?.current?.closeRow && currentOpenRowRef?.current?.closeRow()
                                        currentOpenRowRef.current = itemRefs.current[index]
                                    }}
                                    disableLeftSwipe={!swipeAble || isInactiveProd || isSliderOpen?.current}
                                    recalculateHiddenLayout
                                >
                                    <ItemActionView
                                        type={props.actionType}
                                        itemRefs={itemRefs}
                                        product={product}
                                        index={index}
                                        onRemoveCartItemRef={onRemoveCartItemRef}
                                        closeSwipeRow={closeSwipeRow}
                                        onDeactivateClickRef={props.onDeactivateClickRef}
                                    />
                                    {adjustQtyProdSkuTile(isSliderOpen)}
                                </SwipeRow>
                            )
                        })}
                    </>
                )}
            </View>
        )
    }, [item, item.products, priceMissingCheck, isSliderOpen?.current])
}
