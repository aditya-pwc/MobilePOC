/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-08-30 15:18:31
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2024-01-22 14:02:00
 */

import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { NavigationProp, RouteProp, useIsFocused } from '@react-navigation/native'
import CText from '../../../common/components/CText'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { t } from '../../../common/i18n/t'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import CustomerCard from '../../component/visits/CustomerCard'
import SearchBarWithScan from '../../component/common/SearchBarWithScan'
import { ProductSection } from '../../component/visits/ProductSection'
import { useDebounce, useFreshRef } from '../../hooks/CommonHooks'
import { useCart, useActivatedProdNum, useCartDetail } from '../../hooks/CartHooks'
import { useProduct } from '../../hooks/ProductSellingHooks'
import { renderExpand } from '../MyDayScreen/ProductSellingScreen'
import { VisitStatus } from '../../enum/VisitType'
import EmptyListPlaceholder from '../../../common/components/EmptyListPlaceholder'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import CModal from '../../../common/components/CModal'
import { PageNames } from '../../enum/Common'
import OrderService from '../../service/OrderService'
import ProductService from '../../service/ProductService'

interface InactiveProductScreenProp {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}

const styles = StyleSheet.create({
    ...commonStyle,
    marginBottom_30: {
        marginBottom: 30
    },
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        zIndex: 9
    },
    textSave: {
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    deHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between'
    },
    deTitle: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    },
    cardHeader: {
        paddingHorizontal: 22,
        marginVertical: 22,
        zIndex: 999
    },
    notesContainer: {
        flex: 1,
        borderBottomColor: baseStyle.color.borderGray,
        borderBottomWidth: 1,
        paddingBottom: 9
    },
    emptyImageSize: {
        height: 206,
        width: 160,
        marginBottom: 38
    },
    searchEmptyImageSize: {
        height: 119,
        width: 157,
        marginBottom: 38
    },
    topBgContainer: {
        height: 150,
        width: '100%',
        backgroundColor: baseStyle.color.bgGray,
        top: 0,
        right: 0,
        position: 'absolute',
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    absoluteBase: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60
    },
    headerMarginTop: {
        marginTop: 5
    },
    addProdBtnBorder: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3'
    },
    paddingBottom_22: {
        paddingBottom: 22
    },
    emptyCartTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham',
        color: baseStyle.color.black,
        textAlign: 'center',
        marginBottom: 10
    },
    emptyCartMessage: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontFamily: 'Gotham',
        color: baseStyle.color.titleGray,
        textAlign: 'center',
        marginBottom: 20
    },
    height_550: {
        height: 550
    },
    textGray: {
        color: baseStyle.color.liteGrey
    },
    headMarginBottom: {
        marginBottom: 50
    },
    containerExtraStyle: {
        marginTop: 80
    }
})
interface InactiveProductHeaderProps {
    search: string | ''
    setSearch: Function
}

const InactiveProductHeader: FC<InactiveProductHeaderProps> = (props) => {
    const { search, setSearch } = props
    const searchBarWithScanProps = {
        search,
        setSearch,
        hideScan: true,
        onTapVoice: () => {},
        placeholder: `${t.labels.PBNA_MOBILE_SEARCH} ${t.labels.PBNA_MOBILE_PRODUCTS}`
    }
    return (
        <View style={[styles.paddingHorizontal_22, styles.bgWhite]}>
            <SearchBarWithScan {...searchBarWithScanProps} />
        </View>
    )
}

const InactiveProductScreen: FC<InactiveProductScreenProp> = (props) => {
    const { route, navigation } = props
    const { storeId, store } = route.params || {}
    const [search, setSearch] = useState<string>('')
    const [searchStr, setSearchStr] = useState('')
    const [showAddSuccessModal, setShowAddSuccessModal] = useState(false)

    const InactiveProductPopupRef = useRef(null)
    const isFocused = useIsFocused()
    const isCompletedVisit = store.Status === VisitStatus.COMPLETE
    const isInProgressVisit = store.Status === VisitStatus.IN_PROGRESS
    const [sucMessage, setSucMessage] = useState<string>('')
    const orderCartIdentifier = store.OrderCartIdentifier || store.VisitLegacyId
    const { cartData, setCartData, refresh } = useCart(orderCartIdentifier)
    const { refreshCartDetail } = useCartDetail(store, orderCartIdentifier)
    const [deliveryDate, setDeliveryDate] = useState<string>('')
    const [needRefreshCartAndRender, setNeedRefreshCartAndRender] = useState<boolean>(false)
    const {
        prodLst,
        setQuantity,
        setIsActive,
        setAllIsActive,
        setOffset,
        setNeedRefreshCursor,
        totalProdNum,
        setIsProdVisible
    } = useProduct({
        searchStr,
        store,
        cartData,
        setCartData,
        pageName: PageNames.INACTIVE_PROD,
        orderCartIdentifier,
        deliveryDate
    })
    const { totalActivatedProd } = useActivatedProdNum(cartData)
    useDebounce(() => setSearchStr(search), 300, [search])
    const setIsActiveRef = useFreshRef(setIsActive)
    const setQuantityRef = useFreshRef(setQuantity)
    const setIsProdVisibleRef = useFreshRef(setIsProdVisible)
    const finalProdLst = prodLst || null
    const posListHeaderProps = {
        search,
        setSearch,
        orderQty: '-',
        inventory: '-'
    }
    const initPage = async () => {
        const cartDetail = await refreshCartDetail()
        setDeliveryDate(cartDetail?.DeliveryDate || '')
        setNeedRefreshCartAndRender(true)
    }

    useEffect(() => {
        if (needRefreshCartAndRender) {
            refresh()
            setNeedRefreshCursor()
            setNeedRefreshCartAndRender(false)
        }
    }, [needRefreshCartAndRender])

    useEffect(() => {
        if (isFocused) {
            initPage()
        }
        return () => {
            setCartData([])
        }
    }, [isFocused])

    const renderEmptyListComponent = () => {
        const title = searchStr
            ? t.labels.PBNA_MOBILE_NO_RESULTS
            : t.labels.PBNA_MOBILE_ORDERADE_PRODUCT_NO_RESULT_MASSAGE
        const subTitle = searchStr ? t.labels.PBNA_MOBILE_ORDERADE_PRODUCT_SEARCH_NO_RESULT_MASSAGE : ' '
        const sourceImageUrl = searchStr ? ImageSrc.IMG_NOFILTER_PRODUCT : ImageSrc.IMG_NO_ITEM_RESULT
        const imageStyle = searchStr ? styles.searchEmptyImageSize : styles.emptyImageSize
        return (
            <EmptyListPlaceholder
                sourceImageUrl={sourceImageUrl}
                title={title}
                subTitle={subTitle}
                imageStyle={imageStyle}
                containerExtraStyle={[styles.alignCenter, styles.containerExtraStyle]}
            />
        )
    }

    const onPressAdd = async (setSucMessage: React.Dispatch<React.SetStateAction<string>>) => {
        await ProductService.activateProduct(cartData, store, setSucMessage)
        await OrderService.saveProductsToCart(store.PlaceId, cartData, store.OrderCartIdentifier || store.VisitLegacyId)
        refresh()
        setNeedRefreshCursor()
        // resolve the issue that successful pop do not display
        const DELAY_TIME_OUT2 = 2000
        setTimeout(() => {
            setShowAddSuccessModal(true)
            setTimeout(() => {
                setShowAddSuccessModal(false)
            }, DELAY_TIME_OUT2)
        }, DELAY_TIME_OUT2)
    }

    return (
        <View style={[styles.flex_1, styles.paddingBottom_22]}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBgContainer} />
                <View style={styles.deHeader}>
                    <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_INACTIVE_PRODUCT}</CText>
                    <View style={styles.flexDirectionRow}>
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.goBack()
                                }}
                            >
                                <BlueClear height={36} width={36} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={[styles.cardHeader]}>
                    <CustomerCard
                        storeId={storeId}
                        store={store}
                        isCompletedVisit={isCompletedVisit}
                        isInProgressVisit={isInProgressVisit}
                    />
                </View>
                <View style={[styles.flexDirectionRow]} />
                <InactiveProductHeader {...posListHeaderProps} />
                {useMemo(
                    () => renderExpand(finalProdLst, setAllIsActive, totalProdNum || '0'),
                    [prodLst, setAllIsActive, totalProdNum]
                )}
                <FlatList
                    style={[styles.flexGrow_1, styles.bgWhite, styles.headerMarginTop, styles.headMarginBottom]}
                    showsVerticalScrollIndicator={false}
                    data={finalProdLst}
                    renderItem={({ item, index }) => {
                        const props = {
                            item,
                            setIsActiveRef,
                            setQuantityRef,
                            InactiveProductPopupRef,
                            isInactiveProd: true,
                            setIsProductVisibleRef: setIsProdVisibleRef
                        }
                        return <ProductSection {...props} swipeAble sectionIndex={index} />
                    }}
                    ListEmptyComponent={renderEmptyListComponent()}
                    removeClippedSubviews
                    initialNumToRender={2}
                    maxToRenderPerBatch={2}
                    updateCellsBatchingPeriod={1000}
                    onEndReachedThreshold={0.3}
                    onEndReached={() => {
                        setOffset()
                    }}
                />
                {totalActivatedProd === 0 && (
                    <View style={[styles.absoluteBase, styles.addProdBtnBorder]}>
                        <CText style={[styles.textSave, styles.textGray]}>
                            {`${t.labels.PBNA_MOBILE_ADD} ${t.labels.PBNA_MOBILE_PRODUCT_BRACES.toUpperCase()}`}
                        </CText>
                    </View>
                )}
                {totalActivatedProd > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            onPressAdd(setSucMessage)
                        }}
                    >
                        <View style={[styles.absoluteBase, { backgroundColor: '#6C0CC3' }]}>
                            <CText style={styles.textSave}>
                                {`${
                                    t.labels.PBNA_MOBILE_ADD
                                } ${totalActivatedProd} ${t.labels.PBNA_MOBILE_PRODUCT_BRACES.toUpperCase()}`}
                            </CText>
                        </View>
                    </TouchableOpacity>
                )}
                <CModal
                    imgSrc={ImageSrc.IMG_SUCCESS_ICON}
                    showModal={showAddSuccessModal}
                    content={sucMessage}
                    disabled
                />
            </SafeAreaView>
        </View>
    )
}

export default InactiveProductScreen
