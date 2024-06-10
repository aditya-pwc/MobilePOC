import { NavigationProp, RouteProp, useIsFocused } from '@react-navigation/native'
import React, { useState, useEffect, useMemo } from 'react'
import { TouchableOpacity, View, StyleSheet, ScrollView, GestureResponderEvent, SafeAreaView } from 'react-native'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import CustomerCard from '../../component/visits/CustomerCard'
import { commonStyle } from '../../../common/styles/CommonStyle'
import VisitDuration from '../../component/visits/VisitDuration'
import VisitOrderCardsComponent from '../../component/order/VisitOrderCardsComponent'
import { VisitStatus } from '../../enum/VisitType'
import DraggableHamburger, { PositionType, HAMBURGER_ICON_SIZE } from '../../component/visits/DraggableHamburger'
import { useOrderData } from '../../hooks/VisitOrderHooks'
import { CommonParam } from '../../../common/CommonParam'
import { useOrderCount } from '../../hooks/OrderHooks'
import { useCart } from '../../hooks/CartHooks'

const styles = StyleSheet.create({
    ...commonStyle,
    container: {
        backgroundColor: baseStyle.color.white
    },
    grayContainer: {
        backgroundColor: baseStyle.color.bgGray
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
        marginVertical: 22
    },
    orderStatus: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    deBody: {
        paddingHorizontal: 22,
        paddingTop: 25,
        backgroundColor: baseStyle.color.white
    },
    visitTypeButton: {
        height: 30,
        borderRadius: 15,
        marginRight: 10,
        backgroundColor: baseStyle.color.borderGray
    },
    visitTypeText: {
        paddingHorizontal: 10,
        paddingVertical: 7
    },
    casesWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    mgTop_30: {
        marginTop: 30
    },
    casesColumn: {
        width: '33.3%'
    },
    casesTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray
    },
    casesNum: {
        fontSize: baseStyle.fontSize.fs_16,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    fz_14: {
        fontSize: baseStyle.fontSize.fs_14
    },
    myOrders: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    orderTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    orderAccount: {
        marginLeft: 7,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: baseStyle.color.liteGrey,
        textAlign: 'center',
        paddingTop: 2
    },
    visitType: {
        fontSize: 14,
        color: baseStyle.color.titleGray,
        marginBottom: 8
    },
    tagWrap: {
        paddingHorizontal: 10,
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        borderRadius: 15
    },
    tag: {
        fontSize: 12,
        lineHeight: 30
    },
    visitActivity: {
        height: 300,
        backgroundColor: baseStyle.color.bgGray
    },
    relative: {
        position: 'relative',
        zIndex: 12,
        elevation: 12,
        overflow: 'visible'
    }
})

interface CompletedVisitProps {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}

export const CompletedVisitScreen = (props: CompletedVisitProps) => {
    const { navigation, route } = props
    const { storeId, visit, isToday } = route?.params || {}
    const { cartData, refresh } = useCart(visit?.OrderCartIdentifier || visit?.VisitLegacyId)
    const [hamburgerPosition, setHamburgerPosition] = useState<PositionType | null>(null)
    const isFocused = useIsFocused()
    const { orderData } = useOrderData(visit, !!visit.AdHoc, isFocused)
    const orderCount = useOrderCount(orderData)
    const isCompletedVisit = visit.Status === VisitStatus.COMPLETE
    const hamburgerInitialPosition = { x: 22, y: -HAMBURGER_ICON_SIZE / 2 }
    const [initialOffsetTop, setInitialOffsetTop] = useState<number>(0)
    const [initialSiblingOffsetTop, setInitialSiblingOffsetTop] = useState<number>(0)
    const [scrollTop, setScrollTop] = useState<number>(0)

    useEffect(() => {
        refresh()
    }, [isFocused])

    const onDragRelease = (e: GestureResponderEvent) => {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent
        setHamburgerPosition({
            x: pageX - locationX,
            y: pageY - locationY
        })
    }
    const getOrderNum = () => {
        if (visit?.AdHoc) {
            return orderData?.length
        }
        if (orderData?.length === 0) {
            return 1
        }
        return orderData?.length
    }

    const resetHamburgerAndCollapseVisitDetail = () => {
        setHamburgerPosition(null)
    }

    const draggableHamburgerProps = {
        position: hamburgerInitialPosition,
        navigation,
        store: visit,
        disabledOption: 'HAMBURGER_SELLING',
        initialOffsetTop: initialOffsetTop + initialSiblingOffsetTop - scrollTop,
        onDragRelease,
        setHamburgerPosition: resetHamburgerAndCollapseVisitDetail,
        isFromCompletedVisit: true,
        cartData
    }
    const rootHamburgerProps = {
        position: hamburgerPosition || hamburgerInitialPosition,
        navigation,
        store: visit,
        disabledOption: 'HAMBURGER_SELLING',
        setHamburgerPosition: resetHamburgerAndCollapseVisitDetail,
        isFromCompletedVisit: true,
        cartData
    }

    const ordersCount = useMemo(() => {
        return visit?.AdHoc ? 0 : visit?.VDelGroup.length || 0
    }, [visit])

    const getVisitType = () => {
        const originalName = visit?.RecordTypeDeveloperName || 'Sales'
        return originalName === 'Sales' ? 'Order' : originalName
    }
    const handleScrollEnd = (event: any) => {
        setScrollTop(event.nativeEvent.contentOffset.y)
    }
    const needShowHamburger = (visit.User === CommonParam.userId || (cartData && cartData.length > 0)) && isToday
    return (
        <View style={styles.grayContainer}>
            <SafeAreaView style={styles.grayContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    style={{ overflow: 'visible' }}
                    contentContainerStyle={{ position: 'relative' }}
                    // Disable the scroll since currently the content won't be longer than 1 page
                    scrollEnabled={false}
                    onLayout={(event) => {
                        const layout = event?.nativeEvent?.layout
                        setInitialOffsetTop(layout?.y || 0)
                    }}
                >
                    <View style={[{ position: 'relative' }, styles.container]}>
                        <View style={styles.topBgContainer} />
                        <View style={styles.deHeader}>
                            <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_VISIT_DETAILS}</CText>
                            <View>
                                <TouchableOpacity
                                    onPress={async () => {
                                        navigation.goBack()
                                    }}
                                >
                                    <BlueClear height={36} width={36} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.cardHeader]}>
                            <CustomerCard storeId={storeId} store={visit} isCompletedVisit={isCompletedVisit} />
                        </View>
                    </View>

                    <View style={styles.container}>
                        <View style={[styles.deBody]}>
                            <View style={[styles.orderStatus]}>
                                <View>
                                    <CText style={[styles.casesTitle]}>{t.labels.PBNA_MOBILE_ORDER_COMPLETED}</CText>
                                    <CText style={[styles.casesNum]}>
                                        {orderData?.filter((v) => v.Order_Unique_Id__c).length || 0}/{ordersCount}
                                    </CText>
                                </View>
                                <VisitDuration visit={visit} isCompleted />
                            </View>
                            <View style={[styles.mgTop_30]}>
                                <View>
                                    <CText style={styles.visitType}>{t.labels.PBNA_MOBILE_VISIT_TYPE}</CText>
                                    <View style={styles.flexDirectionRow}>
                                        <View style={styles.tagWrap}>
                                            <CText style={styles.tag}>{getVisitType()}</CText>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.casesWrap, styles.mgTop_30]}>
                                <View style={[styles.casesColumn]}>
                                    <CText style={[styles.casesTitle]}>{t.labels.PBNA_MOBILE_PLANNED_CASES}</CText>
                                    <CText style={[styles.casesNum]}>
                                        {/* According to AC,For now, just show a "-" as we have not developed this */}-
                                    </CText>
                                </View>
                                <View style={[styles.casesColumn]}>
                                    <CText style={[styles.casesTitle]}>{t.labels.PBNA_MOBILE_ORDERED_DETAILS}</CText>
                                    <CText style={[styles.casesNum]}>
                                        {orderCount?.orderCases ||
                                            0 + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                                    </CText>
                                </View>
                                <View style={[styles.casesColumn]}>
                                    <CText style={[styles.casesTitle]}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                                    <CText style={[styles.casesNum]}>
                                        {/* According to AC,For now, just show a "-" as we have not developed this */}-
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <VisitOrderCardsComponent
                            totalOrderNum={getOrderNum()}
                            visitData={visit}
                            navigation={navigation}
                            isAdhoc={!!visit.AdHoc}
                            isFocused={isFocused}
                            isFromCompletedPage
                        />
                    </View>
                    <View style={{ position: 'relative', zIndex: 9999 }}>
                        {needShowHamburger && !hamburgerPosition && <DraggableHamburger {...draggableHamburgerProps} />}
                    </View>
                    <View
                        style={[styles.visitActivity]}
                        onLayout={(event) => {
                            const layout = event?.nativeEvent?.layout
                            setInitialSiblingOffsetTop(layout?.y || 0)
                        }}
                    />
                </ScrollView>
            </SafeAreaView>
            {needShowHamburger && hamburgerPosition && <DraggableHamburger {...rootHamburgerProps} />}
        </View>
    )
}
