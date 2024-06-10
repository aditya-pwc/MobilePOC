import React, { useRef } from 'react'
import { TouchableOpacity, Image, View, StyleSheet, ViewStyle } from 'react-native'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CommonTooltip from '../../../savvy/components/common/CommonTooltip'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { RevampTooltipScreen, ScreenName } from '../../enum/Common'
import { MyDayTabEnum, MyDayTimeRangeEnum, selectTab, selectTimeRange } from '../../redux/slice/MyDaySlice'
import { useAppDispatch } from '../../../savvy/redux/ReduxHooks'

const styles = StyleSheet.create({
    ...commonStyle,
    tooltipIconSize: {
        width: 26,
        height: 26
    },
    tooltipLabel: {
        fontFamily: 'Gotham',
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    tooltipContain: {
        height: 60,
        width: 240,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15
    },
    tooltipLabelContain: {
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 1,
        height: '100%',
        width: '70%',
        justifyContent: 'center',
        marginLeft: 15
    },
    disableLabelColor: {
        color: baseStyle.color.liteGrey2
    }
})

interface RevampTooltipProps {
    navigation: any
    beforeNavigate?: Function
    containerStyle?: ViewStyle
    store: any
    setShowModalVisible?: any
    returnRef: any
    pageName?: ScreenName
}

const TOOLTIP_CONTENT_WIDTH = 240
const TOOLTIP_CONTENT_HEIGHT = 480

const RevampTooltip = (props: RevampTooltipProps) => {
    const { navigation, beforeNavigate, containerStyle, store, returnRef, pageName } = props
    const dispatch = useAppDispatch()
    const toolTipRef = useRef(null)
    const renderTooltipItem = () => {
        return (
            <View style={styles.fullWidth}>
                <TouchableOpacity
                    onPress={async () => {
                        toolTipRef?.current?.toggleTooltip()
                        beforeNavigate && (await beforeNavigate())
                        await dispatch(selectTab(MyDayTabEnum.RouteInfo))
                        await dispatch(selectTimeRange(MyDayTimeRangeEnum.Today))
                        navigation.goBack()
                    }}
                >
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_MY_ROUTE} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={styles.tooltipLabel}>
                                {t.labels.PBNA_MOBILE_MY_ROUTE.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        if (pageName === ScreenName.OrderSummaryScreen) {
                            return
                        }
                        toolTipRef?.current?.toggleTooltip()
                        beforeNavigate && (await beforeNavigate())
                        navigation.navigate(RevampTooltipScreen.InactiveProductScreen, {
                            storeId: store.PlaceId,
                            store
                        })
                    }}
                >
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_MY_PRODUCT_CATALOG} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText
                                style={[
                                    styles.tooltipLabel,
                                    pageName === ScreenName.OrderSummaryScreen && styles.disableLabelColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_INACTIVE_PRODUCT.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_MY_PICK_LIST} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={[styles.tooltipLabel, styles.disableLabelColor]}>
                                {t.labels.PBNA_MOBILE_PICK_LIST.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    // Hiding Feature for future use
                    onPress={async () => {
                        toolTipRef?.current?.toggleTooltip()
                        beforeNavigate && (await beforeNavigate())
                        returnRef?.current.openModal()
                    }}
                >
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_RETURNS} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={styles.tooltipLabel}>
                                {t.labels.PBNA_MOBILE_RETURNS.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        toolTipRef?.current?.toggleTooltip()
                        beforeNavigate && (await beforeNavigate())
                        navigation.navigate(RevampTooltipScreen.RequestNewPOSScreen, {
                            storeId: store.PlaceId
                        })
                    }}
                >
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_POP_ORDER} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={styles.tooltipLabel}>
                                {t.labels.PBNA_MOBILE_POS_ORDER.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_WORK_ORDER} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={[styles.tooltipLabel, styles.disableLabelColor]}>
                                {t.labels.PBNA_MOBILE_WORK_ORDER.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_REPACK} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={[styles.tooltipLabel, styles.disableLabelColor]}>
                                {t.labels.PBNA_MOBILE_REPACK.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View style={styles.tooltipContain}>
                        <Image source={ImageSrc.IMG_AUDIT_SURVEY} style={styles.size_20} />
                        <View style={styles.tooltipLabelContain}>
                            <CText style={[styles.tooltipLabel, styles.disableLabelColor]}>
                                {t.labels.PBNA_MOBILE_AUDIT_SURVEY.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <CommonTooltip
            tooltip={renderTooltipItem()}
            width={TOOLTIP_CONTENT_WIDTH}
            height={TOOLTIP_CONTENT_HEIGHT}
            cRef={toolTipRef}
        >
            <View style={[{ marginRight: 30 }, containerStyle]}>
                <Image source={ImageSrc.IMG_ICON_TOOLTIP} style={styles.iconLarge} />
            </View>
        </CommonTooltip>
    )
}

export default RevampTooltip
