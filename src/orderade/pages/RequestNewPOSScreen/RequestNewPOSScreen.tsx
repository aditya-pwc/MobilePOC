import { NavigationProp, RouteProp } from '@react-navigation/native'
import React, { FC, useState } from 'react'
import { SafeAreaView, TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import CustomerCard from '../../component/visits/CustomerCard'
import { baseStyle } from '../../../common/styles/BaseStyle'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { FlatList } from 'react-native-gesture-handler'
import SearchBarWithScan from '../../component/common/SearchBarWithScan'
import IconInfoBlue from '../../../../assets/image/icon-info-blue.svg'
import Tooltip from 'react-native-walkthrough-tooltip'
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
    posHeaderInfoLine: {
        height: 60
    },
    infoIcon: {
        width: 18,
        height: 18,
        marginLeft: 6
    },
    tooltipContainer: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        transform: [{ translateX: 56 }]
    },
    tooltipArrow: {
        left: 22,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    tooltipText: {
        fontSize: 14,
        width: 152,
        textAlign: 'center'
    },
    submitBtn: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
    }
})

interface RequestNewPOSScreenProps {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}
interface POSListHeaderProps {
    search: string | ''
    setSearch: Function
    orderQty: number
    inventory: number
}
const POSListHeader: FC<POSListHeaderProps> = (props) => {
    const { search, setSearch, orderQty, inventory } = props
    const [isShowTooltip, setIsShowTooltip] = useState<boolean>(false)
    const searchBarWithScanProps = {
        search,
        setSearch,
        hideScan: true
    }
    return (
        <View style={[styles.paddingHorizontal_22, styles.bgWhite]}>
            <SearchBarWithScan {...searchBarWithScanProps} />
            <View style={[styles.flexRowSpaceCenter, styles.posHeaderInfoLine, { marginTop: 10 }]}>
                <View style={[styles.flexRowAlignCenter]}>
                    <CText style={styles.font_12_700}>{t.labels.PBNA_MOBILE_TEMPORARY_MERCH}</CText>
                    <Tooltip
                        content={<CText style={styles.tooltipText}>{t.labels.PBNA_MOBILE_POS_ORDER_COUNT_LIMIT}</CText>}
                        placement={'top'}
                        isVisible={isShowTooltip}
                        onClose={() => {
                            setIsShowTooltip(false)
                        }}
                        backgroundColor={'#ffffff00'}
                        tooltipStyle={styles.tooltipContainer}
                        arrowStyle={styles.tooltipArrow}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setIsShowTooltip(true)
                            }}
                            activeOpacity={1}
                        >
                            <IconInfoBlue style={styles.infoIcon} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>

                <CText style={[styles.colorTitleGray, styles.font_12_400]}>
                    {t.labels.PBNA_MOBILE_ORDER_QTY_FULL + ' '}
                    <CText style={styles.colorBlack}>{orderQty}</CText> | {t.labels.PBNA_MOBILE_DIV_INVENTORY + ' '}
                    <CText style={styles.colorBlack}>{inventory}</CText>
                </CText>
            </View>
        </View>
    )
}
const RequestNewPOSScreen: FC<RequestNewPOSScreenProps> = (props) => {
    const { route, navigation } = props
    const [search, setSearch] = useState<string>('')
    const { storeId } = route.params || {}
    const disabled = true
    const posListHeaderProps = {
        search,
        setSearch,
        orderQty: '-',
        inventory: '-'
    }
    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBgContainer} />
                <View style={styles.deHeader}>
                    <CText style={styles.deTitle}>{t.labels.PBNA_MOBILE_NEW_POS_REQUEST}</CText>
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
                    <CustomerCard storeId={storeId} />
                </View>
                <FlatList
                    ListHeaderComponent={<POSListHeader {...posListHeaderProps} />}
                    data={undefined}
                    renderItem={undefined}
                    stickyHeaderIndices={[0]}
                />
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        { backgroundColor: disabled ? baseStyle.color.white : baseStyle.color.purple }
                    ]}
                >
                    <CText
                        style={[
                            styles.font_12_700,
                            { color: disabled ? baseStyle.color.liteGrey : baseStyle.color.white }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_ORDER_TEMP_MERCH}
                    </CText>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    )
}

export default RequestNewPOSScreen
