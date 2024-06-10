import React, { useState, useEffect, useRef, useMemo } from 'react'
import { View, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { NavigationProp, RouteProp, useIsFocused } from '@react-navigation/native'
import CustomerCard from '../../component/visits/CustomerCard'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { baseStyle } from '../../../common/styles/BaseStyle'
import SalesActionOverview from '../../component/visits/SalesActionOverview'
import TabBar from '../../component/common/TabBar'
import { useTabs } from '../../hooks/MyVisitDetailHooks'
import { MyVisitTab } from '../../enum/MyVisitTab'
import DraggableHamburger, { PositionType } from '../../component/visits/DraggableHamburger'
import { StartEndVisitButton } from '../../component/visits/StartEndVisitButton'
import { useCart, useCartDetail } from '../../hooks/CartHooks'
import { commonStyle } from '../../../common/styles/CommonStyle'
import EndVisitCheckModal from '../../component/visits/EndVisitCheckModal'
import POSTab from '../../component/pos/POSTab'
import { VisitStatus } from '../../enum/VisitType'
import { ScrollView } from 'react-native-gesture-handler'
import BottomSelectModal, { returnModalProps } from '../../component/common/BottomSelectModal'
import { PriceMissingCheckEffect } from './MyDayHooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ReturnOrderSuffix } from '../../enum/Common'
import { Store } from '../../interface/RetailStoreModel'
import OrderService from '../../service/OrderService'
import VisitService from '../../service/VisitService'
import PriceService from '../../service/PriceService'
import CartService from '../../service/CartService'

interface TabDataType {
    name: string
    value: string
    dot: boolean
}
const styles = StyleSheet.create({
    ...commonStyle,
    baCont: {
        flex: 1,
        height: '100%',
        backgroundColor: baseStyle.color.white
    },
    headerContainer: {
        flexDirection: 'row',
        marginTop: 57
    },
    chevron_left: {
        ...commonStyle.chevron,
        marginTop: 5,
        marginLeft: 5,
        width: 15,
        height: 15,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: baseStyle.color.white
    },
    hitSlop30: {
        left: 30,
        top: 30,
        right: 30,
        bottom: 30
    },
    bgContainer: {
        paddingRight: DeviceInfo.isTablet() ? 80 : 22,
        paddingLeft: DeviceInfo.isTablet() ? 80 : 22,
        backgroundColor: baseStyle.color.black,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        paddingBottom: 14
    },
    styleEmptyV: {
        backgroundColor: 'black',
        width: '100%',
        height: 150
    },
    customerCardContainer: {
        marginTop: 33,
        width: '100%'
    },
    tabBarWrap: {
        paddingTop: 15
    },
    placeholderTab: {
        height: 800,
        backgroundColor: 'white'
    }
})

interface MyVisitDetailProps {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}

const MyVisitDetail = (props: MyVisitDetailProps) => {
    const { navigation, route } = props
    const tabs = useTabs()
    const [activeTab, setActiveTab] = useState<string>(tabs[0].value)
    const [hamburgerPosition, setHamburgerPosition] = useState<PositionType | null>(null)
    const { storeId, visit } = route?.params || {}
    const orderCartIdentifier = visit.OrderCartIdentifier || visit.VisitLegacyId
    const { cartData, refresh } = useCart(orderCartIdentifier, visit)
    const { cartDetail, setCartDetail, refreshCartDetail } = useCartDetail(visit, orderCartIdentifier)
    const isFocused = useIsFocused()
    const [currentVisit, setCurrentVisit] = useState(visit)
    const endVisitModalRef = useRef(null)
    const startEndBtnRef = useRef(null)
    const salesActionRef = useRef()
    const insetBottom = 22
    const [scrollTop, setScrollTop] = useState<number>(0)
    const [offsetTop, setOffsetTop] = useState<number>(0)
    const [selected, setSelected] = useState('')
    const returnRef = useRef(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const resetHamburgerAndCollapseVisitDetail = () => {
        salesActionRef?.current?.setCollapsed(true)
        setHamburgerPosition(null)
    }
    PriceMissingCheckEffect(cartData, orderCartIdentifier)

    const header = useMemo(() => {
        return (
            <ImageBackground
                source={ImageSrc.PATTERN_BLUE_BACKGROUND}
                imageStyle={{
                    resizeMode: 'cover',
                    height: 150,
                    bottom: undefined
                }}
                style={[styles.bgContainer]}
            >
                <View style={[styles.headerContainer, styles.flexRowAlignCenter]}>
                    <TouchableOpacity
                        style={[styles.chevron_left]}
                        onPress={() => {
                            navigation.goBack()
                        }}
                        hitSlop={styles.hitSlop30}
                    />
                    {isLoading && <ActivityIndicator style={styles.marginLeft20} />}
                </View>
                <View style={[styles.customerCardContainer]}>
                    <CustomerCard
                        storeId={storeId}
                        isInProgressVisit={currentVisit.Status === VisitStatus.IN_PROGRESS}
                    />
                </View>
                <View style={[styles.tabBarWrap]}>
                    <TabBar
                        tabs={tabs}
                        defaultTab={tabs.map((el) => el.name).indexOf(activeTab)}
                        setActiveSection={(k: number, v: TabDataType) => {
                            setActiveTab(v.value)
                        }}
                    />
                </View>
            </ImageBackground>
        )
    }, [currentVisit, isLoading])

    const renderTabContent = () => {
        let jsx
        switch (activeTab) {
            case MyVisitTab.MY_VISIT:
                jsx = (
                    <SalesActionOverview
                        cartData={cartData}
                        visit={currentVisit}
                        navigation={navigation}
                        hamburgerPosition={hamburgerPosition}
                        setHamburgerPosition={setHamburgerPosition}
                        cartDetail={cartDetail}
                        isFocused={isFocused}
                        offsetTop={offsetTop - scrollTop}
                        returnRef={returnRef}
                    />
                )
                break
            case MyVisitTab.POS:
                jsx = <POSTab visit={currentVisit} navigation={navigation} />
                break
            default:
                jsx = <View style={styles.placeholderTab} />
                break
        }
        return jsx
    }
    const updateVisit = async () => {
        const visit = await VisitService.updatedVisit(currentVisit)
        setCurrentVisit(visit)
    }

    useEffect(() => {
        updateVisit()
        if (isFocused) {
            setIsLoading(true)
            Promise.allSettled([
                OrderService.deltaSyncAndReplaceOrder().then(() => {
                    updateVisit()
                }),
                PriceService.priceCalculateProcess(visit, [])
            ]).finally(() => {
                setIsLoading(false)
            })
        }
    }, [isFocused])

    useEffect(() => {
        // recover cart data when made change but not save, then killed app
        // clear return only cart item data
        OrderService.clearCart(orderCartIdentifier, true)
        const returnOngoingIdentifier = orderCartIdentifier + ReturnOrderSuffix.ONGOING_ORDER_BACKUP
        AsyncStorage.getItem(returnOngoingIdentifier).then(async (result) => {
            if (result) {
                const returnOngoingBackupCartItems = JSON.parse(result)
                await CartService.clearNotApplyReturnCart(visit, { current: returnOngoingBackupCartItems })
                if (returnOngoingBackupCartItems && returnOngoingBackupCartItems.length > 0) {
                    // if we don't apply the changes, we need to revert the changes in local cart item
                    await CartService.revertLocalCartData(visit, returnOngoingBackupCartItems)
                    await AsyncStorage.removeItem(returnOngoingIdentifier)
                    refresh()
                }
            }
        })
        const returnMyCartOngoingIdentifier = orderCartIdentifier + ReturnOrderSuffix.ONGOING_ORDER_MY_CART_BACKUP
        AsyncStorage.getItem(returnMyCartOngoingIdentifier).then(async (result) => {
            if (result) {
                const returnOngoingBackupCartItems = JSON.parse(result)
                if (returnOngoingBackupCartItems && returnOngoingBackupCartItems.length > 0) {
                    // if we don't apply the changes, we need to revert the changes in local cart item
                    await CartService.revertLocalCartData(visit, returnOngoingBackupCartItems)
                    await AsyncStorage.removeItem(returnMyCartOngoingIdentifier)
                    refresh()
                }
            }
        })
    }, [cartData])

    const checkOutHandler = async () => {
        await OrderService.clearCart(orderCartIdentifier)
        refresh()
        const visitStore: Store = {
            storeId: visit.RetailStoreId,
            storeName: visit.StoreName
        }
        const storeInfo = await OrderService.getExistedProductInCurrentVisitCart(visitStore)
        // only complete visit when cleared cart
        if (!storeInfo) {
            setTimeout(() => {
                startEndBtnRef.current && startEndBtnRef.current.completeVisit()
            }, 100)
        }
    }

    const onCheckVisitStatus = () => {
        endVisitModalRef.current && endVisitModalRef.current.openModal()
    }

    useEffect(() => {
        if (isFocused) {
            refresh()
            refreshCartDetail()
        }
        return () => {
            setCartDetail(null)
        }
    }, [isFocused])

    const handleScrollEnd = (event: any) => {
        setScrollTop(event.nativeEvent.contentOffset.y)
    }

    return (
        <View style={[styles.baCont, { paddingBottom: insetBottom }]}>
            <ScrollView
                style={[styles.flex_1]}
                contentContainerStyle={styles.flex_1}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
            >
                {header}
                <View
                    style={styles.flex_1}
                    onLayout={(event) => {
                        const layout = event?.nativeEvent?.layout
                        setOffsetTop(layout?.y || 0)
                    }}
                >
                    {renderTabContent()}
                </View>
            </ScrollView>
            {activeTab === MyVisitTab.MY_VISIT && (
                <StartEndVisitButton
                    {...props}
                    cRef={startEndBtnRef}
                    visit={currentVisit}
                    cartData={cartData}
                    updateVisitStatus={updateVisit}
                    checkVisitStatus={onCheckVisitStatus}
                />
            )}
            {activeTab === MyVisitTab.MY_VISIT && hamburgerPosition && (
                <DraggableHamburger
                    position={hamburgerPosition}
                    navigation={navigation}
                    store={currentVisit}
                    disabledOption="HAMBURGER_SELLING"
                    setHamburgerPosition={resetHamburgerAndCollapseVisitDetail}
                />
            )}
            <EndVisitCheckModal cRef={endVisitModalRef} navigation={navigation} onCheckOut={checkOutHandler} />
            <BottomSelectModal {...returnModalProps(selected, setSelected, navigation, currentVisit, returnRef)} />
        </View>
    )
}

export default MyVisitDetail
