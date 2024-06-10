import React, { FC, useState } from 'react'
import { View, StyleSheet, Dimensions, Image, GestureResponderEvent } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { NavigationProp } from '@react-navigation/native'
import DraggableHamburger, { HAMBURGER_ICON_SIZE, PositionType } from './DraggableHamburger'
import OrderCartComponent from '../order/OrderCartComponent'
import { CartDetail } from '../../interface/CartDetail'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import EmptyListPlaceholder from '../../../common/components/EmptyListPlaceholder'
import IMG_NO_SELLING_OBJECTIVES from '../../../../assets/image/no-selling-objectives.svg'
import { ReturnCartItem } from '../../interface/ReturnProduct'

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    ...commonStyle,
    productPanel: {
        backgroundColor: baseStyle.color.black,
        minHeight: 300,
        shadowOffset: { width: 0, height: -5 },
        shadowRadius: 10,
        shadowOpacity: 1,
        shadowColor: 'rgba(0, 76, 151, 0.17)',
        flex: 1
    },
    topLine: {
        marginTop: -29,
        position: 'relative',
        zIndex: 5,
        flexDirection: 'row-reverse',
        height: 58
    },
    shoppingCartContainer: {
        height: 44,
        width: screenWidth * 0.47,
        paddingVertical: 12,
        backgroundColor: baseStyle.color.LightBlue,
        borderRadius: 6,
        borderColor: baseStyle.color.white,
        borderWidth: 1
    },
    clockImgRight: {
        height: 26,
        width: 28
    },
    salesActionText: {
        fontSize: 24,
        fontWeight: '900',
        color: baseStyle.color.white
    },
    archiveText: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 10,
        color: baseStyle.color.LightBlue
    },
    panelTitle: {
        marginTop: 30
    },
    iconStyle: {
        width: 106,
        height: 142
    },
    containerExtraStyle: {
        paddingHorizontal: 22,
        paddingVertical: 20
    }
})
interface SalesActionProductPanelProps {
    navigation: NavigationProp<any>
    store: MyDayVisitModel
    cartData: ReturnCartItem[]
    hamburgerPosition: PositionType | null
    setHamburgerPosition: Function
    setCollapsed: Function
    offsetTop: number
    cartDetail?: CartDetail
}

const SalesActionProductPanel: FC<SalesActionProductPanelProps> = (props) => {
    const {
        navigation,
        cartData,
        store,
        hamburgerPosition,
        setHamburgerPosition,
        cartDetail,
        setCollapsed,
        offsetTop
    } = props
    const [initialOffsetTop, setInitialOffsetTop] = useState<number>(0)
    const emptyListPlaceholderProps = {
        dark: true,
        transparentBackground: true,
        title: t.labels.PBNA_MOBILE_NO_SELLING_OBJECTIVES,
        subTitle: t.labels.PBNA_MOBILE_NO_SELLING_OBJECTIVES_MSG,
        imageContainer: <IMG_NO_SELLING_OBJECTIVES style={styles.iconStyle} />,
        containerExtraStyle: styles.containerExtraStyle
    }
    const hamburgerInitialPosition = { x: 22, y: 0 }
    const onDragRelease = (e: GestureResponderEvent) => {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent
        setHamburgerPosition({
            x: pageX - locationX,
            y: pageY - locationY
        })
    }
    const resetHamburgerAndCollapseVisitDetail = () => {
        setCollapsed(true)
        setHamburgerPosition(null)
    }
    const draggableHamburgerProps = {
        position: hamburgerInitialPosition,
        navigation,
        store,
        onDragRelease,
        disabledOption: 'HAMBURGER_SELLING',
        initialOffsetTop: initialOffsetTop + offsetTop,
        setHamburgerPosition: resetHamburgerAndCollapseVisitDetail,
        cartData
    }
    return (
        <View
            style={styles.productPanel}
            onLayout={(event) => {
                const layout = event?.nativeEvent?.layout
                setInitialOffsetTop((layout?.y || 0) - HAMBURGER_ICON_SIZE / 2)
            }}
        >
            <View
                style={[
                    styles.paddingX,
                    styles.flexRowSpaceCenter,
                    styles.topLine,
                    hamburgerPosition && { justifyContent: 'flex-start' }
                ]}
            >
                <OrderCartComponent
                    cartData={cartData}
                    navigation={navigation}
                    store={store}
                    checkDeliveryDate={cartDetail?.DeliveryDate && cartDetail?.NextDeliveryDate}
                    setHamburgerPosition={resetHamburgerAndCollapseVisitDetail}
                    from={'My Visit'}
                />
                {!hamburgerPosition && <DraggableHamburger {...draggableHamburgerProps} />}
            </View>
            <View style={[styles.panelTitle, styles.paddingX, styles.flexRowSpaceCenter]}>
                <CText style={styles.salesActionText}>{t.labels.PBNA_MOBILE_SALES_ACTIONS}</CText>
                <View style={[styles.flexDirectionRow, styles.flexRowAlignCenter]}>
                    <CText style={styles.archiveText}>{t.labels.PBNA_MOBILE_IP_ARCHIVE}</CText>
                    <Image source={ImageSrc.IMG_ARCHIVE_CLOCK} style={styles.clockImgRight} />
                </View>
            </View>
            <EmptyListPlaceholder {...emptyListPlaceholderProps} />
        </View>
    )
}

export default SalesActionProductPanel
