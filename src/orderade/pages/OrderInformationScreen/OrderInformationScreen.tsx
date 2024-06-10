import { NavigationProp, useIsFocused } from '@react-navigation/native'
import React, { FC, useState, useEffect } from 'react'
import { SafeAreaView, TouchableOpacity, View, StyleSheet, FlatList, Dimensions, Image } from 'react-native'
import CText from '../../../common/components/CText'
import CustomerCard from '../../component/visits/CustomerCard'
import { baseStyle } from '../../../common/styles/BaseStyle'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import { useOrderItem } from '../../hooks/OrderHooks'
import { useCartPrice } from '../../hooks/CartHooks'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { useFreshRef } from '../../hooks/CommonHooks'
import _ from 'lodash'
import { ProductSection } from '../../component/visits/ProductSection'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import OrderUserInfoComponent from '../../component/order/OrderUserInfoComponent'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { OrderDetailPanel } from '../../component/order/OrderDetailPanel'
import { ReturnProductList } from '../MyDayScreen/ReturnProduct/ReturnProductList/ReturnProductList'
import { OrderLineActivityCde } from '../../enum/Common'
import { useCalculateTotal } from '../../utils/ProductUtils'
import { isTrueInDB } from '../../../common/utils/CommonUtils'

const screenWidth = Dimensions.get('window').width

interface OrderInformationScreenProps {
    navigation: NavigationProp<any>
    route?: any
}

interface FoldableTitleComponent {
    orderItemLst: Array<any>
    finalProdLst: Array<any>
    setShowOrderItemLst: React.Dispatch<React.SetStateAction<boolean>>
    setAllIsActive: (isActive: boolean) => void
    showOrderItemLst: boolean
    getGrandTotal: () => string
    totalQty: number
}

interface FoldableReturnTitleComponent {
    setExpandReturns: React.Dispatch<React.SetStateAction<boolean>>
    expandReturns: boolean
}

const styles = StyleSheet.create({
    ...commonStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    deHeader: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        justifyContent: 'space-between',
        alignItems: 'center'
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
    content: {
        backgroundColor: baseStyle.color.white,
        zIndex: 0
    },
    expandContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: baseStyle.color.borderGray
    },
    returnTitleContainer: {
        borderBottomWidth: 1,
        borderColor: baseStyle.color.borderGray
    },
    expandTitle: {
        fontSize: baseStyle.fontSize.fs_18,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_900,
        fontFamily: 'Gotham'
    },
    chevron_up: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    headerMarginTop: {
        marginTop: 5
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
    userCardContainer: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 22
    },
    userCardBg: {
        backgroundColor: baseStyle.color.bgGray,
        height: 90,
        width: screenWidth,
        bottom: 0,
        zIndex: -1,
        position: 'absolute'
    },
    exportIconSize: {
        height: 36,
        width: 29
    },
    expandTotalContainer: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        marginBottom: 25
    },
    colorRed: {
        color: baseStyle.color.red
    }
})

const FoldableOrderSummaryTitle: FC<FoldableTitleComponent> = (props: FoldableTitleComponent) => {
    const {
        setAllIsActive,
        setShowOrderItemLst,
        showOrderItemLst,
        getGrandTotal,
        finalProdLst,
        orderItemLst,
        totalQty
    } = props
    const totalQtyStyle = totalQty >= 0 ? styles.colorBlack : styles.colorRed
    const grandTotalStyle = Number(getGrandTotal() || 0) >= 0 ? styles.colorBlack : styles.colorRed
    if (_.isEmpty(orderItemLst)) {
        return null
    }
    if (!_.isEmpty(finalProdLst)) {
        return (
            <View style={[styles.expandContainer]}>
                <TouchableOpacity
                    onPress={() => {
                        setShowOrderItemLst(!showOrderItemLst)
                        setAllIsActive(!showOrderItemLst)
                    }}
                >
                    <View style={[styles.flexRowSpaceCenter, styles.paddingHorizontal_22, { paddingVertical: 25 }]}>
                        <CText style={styles.expandTitle}>{t.labels.PBNA_MOBILE_PRODUCT_SUMMARY}</CText>
                        <View style={[showOrderItemLst ? styles.chevron_up : styles.chevron_down]} />
                    </View>
                    {showOrderItemLst && (
                        <View style={styles.expandTotalContainer}>
                            <View style={[styles.halfWidth, styles.flexDirectionColumn]}>
                                <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                                    {t.labels.PBNA_MOBILE_ORDER_QUANTITY}
                                </CText>
                                <CText style={[styles.font_16_700, totalQtyStyle]}>
                                    {`${totalQty} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                                </CText>
                            </View>
                            <View style={[styles.halfWidth, styles.flexDirectionColumn]}>
                                <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                                    {t.labels.PBNA_MOBILE_TOTAL_AMOUNT}
                                </CText>
                                <CText style={[styles.font_16_700, grandTotalStyle]}>
                                    {`${t.labels.PBNA_MOBILE_ORDER_D + getGrandTotal()}`}
                                </CText>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        )
    }
}

const FoldableReturnTitle: FC<FoldableReturnTitleComponent> = (props: FoldableReturnTitleComponent) => {
    const { setExpandReturns, expandReturns } = props
    return (
        <View style={[styles.flex_1, !expandReturns && styles.returnTitleContainer]}>
            <TouchableOpacity
                onPress={() => {
                    setExpandReturns(!expandReturns)
                }}
            >
                <View style={[styles.flexRowSpaceCenter, styles.paddingHorizontal_22, { paddingVertical: 25 }]}>
                    <CText style={styles.expandTitle}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                    <View style={[expandReturns ? styles.chevron_up : styles.chevron_down]} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

const filterReturnData = (prodLst: Array<any>, orderType: string) => {
    const outputProdLst: Array<any> = []
    if (!_.isEmpty(prodLst)) {
        prodLst.forEach((order) => {
            if (!_.isEmpty(order?.products)) {
                const targetProds = order?.products?.filter((prod: any) => prod.ord_lne_actvy_cde__c === orderType)
                if (!_.isEmpty(targetProds)) {
                    outputProdLst.push({
                        ...order,
                        products: targetProds
                    })
                }
            }
        })
    }
    return outputProdLst
}

const getDeTitle = (orderProdLst: Array<any>, returnTotal: number) => {
    if (orderProdLst.length === 0 && returnTotal === 0) {
        return ''
    } else if (orderProdLst.length > 0) {
        return t.labels.PBNA_MOBILE_ORDER_INFORMATION
    }
    return t.labels.PBNA_MOBILE_RETURN_INFORMATION
}

const OrderInformationScreen: FC<OrderInformationScreenProps> = (props) => {
    const { navigation, route } = props
    const store = route?.params?.visit
    const storeId = store?.PlaceId
    const order = route?.params?.order
    const isFocused = useIsFocused()
    const {
        prodLst: orderItemLst,
        loading,
        allOrderItem,
        setIsActive,
        setAllIsActive,
        setSingleReturnProductActive,
        setIsReturnListActive,
        refreshOrderData
    } = useOrderItem(order)
    const { saleTotalQty, getGrandTotal, returnTotalCs, returnTotalUn, totalQty } = useCartPrice(
        allOrderItem,
        store.AccountId
    )
    const [expandReturns, setExpandReturns] = useState(false)
    const [screenScrollEnabled, setScreenScrollEnabled] = useState(true)
    const setIsActiveRef = useFreshRef(setIsActive)
    const setIsReturnListActiveRef = useFreshRef(setIsReturnListActive)
    const setSingleReturnProductActiveRef = useFreshRef(setSingleReturnProductActive)
    const [showOrderItemLst, setShowOrderItemLst] = useState(true)
    const enableSingleUnitReturn = isTrueInDB(store?.Single_Unit_Return__c)

    useEffect(() => {
        if (isFocused) {
            refreshOrderData()
        }
    }, [isFocused])

    const orderProdLst = !loading ? filterReturnData(orderItemLst, OrderLineActivityCde.DELIVERY) : []
    const orderTotal = _.isEmpty(orderItemLst) ? 0 : orderItemLst?.length
    const returnProdLst = !loading ? filterReturnData(orderItemLst, OrderLineActivityCde.RETURN) : []
    const returnTotal = _.isEmpty(returnProdLst) ? 0 : returnProdLst?.length
    const returnData = { totalCases: Number(returnTotalCs), totalUnits: Number(returnTotalUn) }

    const deTitleText = getDeTitle(orderProdLst, returnTotal)
    const renderReturnSection = () => {
        if (returnTotal === 0) {
            return
        }
        return (
            <>
                <FoldableReturnTitle setExpandReturns={setExpandReturns} expandReturns={expandReturns} />
                {expandReturns && (
                    <FlatList
                        style={[styles.flexGrow_1, styles.bgWhite, styles.headerMarginTop]}
                        showsVerticalScrollIndicator={false}
                        data={useCalculateTotal(returnProdLst, true)}
                        keyExtractor={(item) => item.label}
                        renderItem={({ item }) => {
                            const props = {
                                item,
                                setIsReturnListActiveRef: setIsReturnListActiveRef,
                                setSingleReturnProductActiveRef: setSingleReturnProductActiveRef,
                                isReturnList: true,
                                isOrderInfo: true,
                                isEditable: false,
                                enableSingleUnitReturn: enableSingleUnitReturn
                            }
                            return <ReturnProductList {...props} />
                        }}
                        removeClippedSubviews
                        initialNumToRender={8}
                        maxToRenderPerBatch={8}
                        updateCellsBatchingPeriod={100}
                        windowSize={15}
                    />
                )}
            </>
        )
    }

    const renderOrderSummarySection = () => {
        if (orderTotal === 0) {
            return
        }
        return (
            <>
                <FoldableOrderSummaryTitle
                    setAllIsActive={setAllIsActive}
                    setShowOrderItemLst={setShowOrderItemLst}
                    showOrderItemLst={showOrderItemLst}
                    getGrandTotal={getGrandTotal}
                    finalProdLst={orderProdLst}
                    orderItemLst={orderItemLst}
                    totalQty={totalQty}
                />
                {showOrderItemLst && (
                    <FlatList
                        style={[styles.flexGrow_1, styles.bgWhite, styles.headerMarginTop]}
                        showsVerticalScrollIndicator={false}
                        data={orderProdLst}
                        keyExtractor={(item) => item.label}
                        renderItem={({ item, index }) => {
                            const props = {
                                item,
                                setIsActiveRef,
                                setScreenScrollEnabled
                            }
                            return <ProductSection {...props} sectionIndex={index} isOrderInfo />
                        }}
                        removeClippedSubviews
                        initialNumToRender={8}
                        maxToRenderPerBatch={8}
                        updateCellsBatchingPeriod={100}
                        windowSize={15}
                    />
                )}
            </>
        )
    }

    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBgContainer} />
                <View style={styles.deHeader}>
                    <CText style={styles.deTitle} testID="OD_Order_INFO_TITLE">
                        {deTitleText}
                    </CText>
                    <View style={styles.flexDirectionRow}>
                        <View style={styles.marginRight_22}>
                            <Image source={ImageSrc.IMG_ICON_EXPORT_BLUE} style={styles.exportIconSize} />
                        </View>
                        <View>
                            <TouchableOpacity
                                testID="OD_Order_INFO_BACK_ICON"
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
                    <CustomerCard storeId={storeId} store={store} />
                </View>
                <KeyboardAwareFlatList
                    style={[styles.flex_1, styles.content]}
                    data={null}
                    renderItem={null}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={screenScrollEnabled}
                    ListHeaderComponent={
                        <>
                            <SafeAreaView>
                                <View>
                                    <OrderDetailPanel
                                        order={order}
                                        totalOrderCases={saleTotalQty}
                                        returnData={returnData}
                                        accountId={store?.AccountId}
                                        store={store}
                                        summaryData={allOrderItem}
                                    />
                                    <View style={styles.userCardContainer}>
                                        <OrderUserInfoComponent order={order} />
                                        <View style={styles.userCardBg} />
                                    </View>
                                </View>
                                <View>
                                    {renderOrderSummarySection()}
                                    {renderReturnSection()}
                                </View>
                            </SafeAreaView>
                        </>
                    }
                />
            </SafeAreaView>
        </View>
    )
}

export default OrderInformationScreen
