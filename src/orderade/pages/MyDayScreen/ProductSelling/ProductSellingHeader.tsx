import React, { FC } from 'react'
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, ViewStyle } from 'react-native'
import moment from 'moment'
import { SearchBar } from 'react-native-elements'
import { BottomSelectModalHeaderStyles } from '../../../component/common/BottomSelectModalHeader'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { VisitStatus } from '../../../enum/VisitType'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { renderGreenCheck, renderStoreIcon, styles as customerCardStyles } from '../../../component/visits/CustomerCard'
import CText from '../../../../common/components/CText'
import RevampTooltip from '../../../component/visits/RevampTooltip'
import { ImageSrc } from '../../../constants/ImageSrc'

const screenWidth = Dimensions.get('window').width
export const HEADER_MARGIN_TOP = 5

const styles = StyleSheet.create({
    ...commonStyle,
    ...BottomSelectModalHeaderStyles,
    searchContainer: {
        flexDirection: 'column',
        paddingTop: 8,
        marginTop: 12,
        paddingBottom: 55
    },
    micIconContainer: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: baseStyle.color.LightBlue
    },
    searchBarContainer: {
        height: 36
    },
    searchInputContainer: {
        height: 36,
        marginTop: 0,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
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
    inputContainerStyle: {
        height: 36,
        backgroundColor: '#F2F4F7',
        padding: 0,
        borderRadius: 10
    },
    searchFont: {
        fontSize: baseStyle.fontSize.fs_14
    },
    chevron_left: {
        ...commonStyle.chevron,
        marginTop: 15,
        width: 15,
        height: 15,
        borderTopWidth: 3,
        borderRightWidth: 3
    },
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
        maxWidth: screenWidth * 0.47
    },
    calendarEditIcon: {
        width: 25,
        height: 20
    },
    calendarEditText: {
        ...commonStyle.font_12_700,
        ...commonStyle.colorLightBlue,
        marginLeft: 4
    }
})

interface ProductSellingHeaderProps {
    isStartDate: boolean
    startDate: string
    endDate: string
    setIsStartDate: Function
    setStartDate: Function
    setEndDate: Function
    navigation: any
    saveCart: Function
    insetTop: number
    store: any
    setSearchStr: Function
    searchValue: string
    setSearchValue: Function
    setHeaderFullHeight: Function
    setSearchBarHeight: Function
    returnRef: any
    calendarVisible: boolean
    setCalendarVisible: Function
}

const ProductSellingHeader: FC<ProductSellingHeaderProps> = (props) => {
    const {
        startDate,
        endDate,
        navigation,
        saveCart,
        insetTop,
        store,
        setSearchStr,
        searchValue,
        setSearchValue,
        setHeaderFullHeight,
        setSearchBarHeight,
        returnRef,
        calendarVisible,
        setCalendarVisible
    } = props

    const renderSearchBarClear = () => {
        if (searchValue) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setSearchValue('')
                        setSearchStr('')
                    }}
                >
                    <Image style={styles.iconSmall} source={ImageSrc.ICON_CLEAR} />
                </TouchableOpacity>
            )
        }
    }

    const renderSearchBar = () => {
        return (
            <View
                style={[styles.searchContainer]}
                onLayout={(event) => {
                    const { height } = event?.nativeEvent?.layout
                    setSearchBarHeight(height)
                }}
            >
                <View style={[styles.flexRowSpaceBet]}>
                    <View style={[styles.searchBarContainer, styles.flexDirectionRow, styles.fullWidth]}>
                        <SearchBar
                            platform="ios"
                            containerStyle={[styles.searchInputContainer, styles.greyBox]}
                            inputContainerStyle={styles.inputContainerStyle}
                            inputStyle={[styles.colorBlack, styles.marginX0, styles.searchFont]}
                            leftIconContainerStyle={styles.marginLeft5}
                            clearIcon={renderSearchBarClear}
                            cancelButtonTitle={''}
                            cancelButtonProps={{ style: { width: 0 } }}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH + ' ' + t.labels.PBNA_MOBILE_PRODUCTS}
                            onChangeText={(text: string) => {
                                setSearchValue(text)
                            }}
                            value={searchValue}
                            allowFontScaling={false}
                        />
                        <View style={[styles.micIconContainer, styles.alignCenter, styles.iconLarge]}>
                            <TouchableOpacity hitSlop={styles.hitSlop12} onPress={() => {}}>
                                <Image source={ImageSrc.IMG_MICROPHONE} style={styles.size_20} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.barCodeContainer, styles.alignCenter, styles.marginLeft20]}>
                            <TouchableOpacity onPress={() => {}} hitSlop={styles.hitSlop12}>
                                <Image source={ImageSrc.IMG_BAR_CODE} style={styles.iconMedium} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const isCompletedVisit = store.Status === VisitStatus.COMPLETE
    const isInProgressVisit = store.Status === VisitStatus.IN_PROGRESS

    return (
        <View
            onLayout={(event) => {
                const { height } = event?.nativeEvent?.layout
                setHeaderFullHeight(height)
            }}
        >
            <View
                style={[
                    styles.fullWidth,
                    styles.paddingHorizontal_22,
                    { paddingTop: insetTop + HEADER_MARGIN_TOP, backgroundColor: baseStyle.color.white }
                ]}
            >
                <View style={[styles.marginBottom_20, styles.flexDirectionRow]}>
                    <TouchableOpacity
                        style={[styles.chevron_left]}
                        onPress={async () => {
                            await saveCart()
                            navigation.goBack()
                        }}
                        hitSlop={styles.hitSlop30}
                    />
                    <View style={customerCardStyles.imageGroup}>
                        {renderStoreIcon(store, [styles.iconXXL, styles.marginLeft20])}
                        {isCompletedVisit && renderGreenCheck(baseStyle.color.white)}
                        {isInProgressVisit && (
                            <Image style={customerCardStyles.checkWrap} source={ImageSrc.ICON_LOCATION_CURRENT} />
                        )}
                    </View>

                    <View style={[styles.headerCustomerContainer, styles.marginLeft10, styles.marginRight_10]}>
                        <CText style={styles.headerCustomerName} numberOfLines={3}>
                            {store.StoreName}
                        </CText>
                        <CText style={styles.headerCustomerNumber} numberOfLines={1}>
                            {t.labels.PBNA_MOBILE_NUMBER_SIGN + store.CustUniqId}
                        </CText>
                        <View>
                            <CText style={[styles.headerCustomerAddress, styles.font_12_400]} numberOfLines={1}>
                                {`${store.Street ? store.Street + ',' : ''}`}
                            </CText>
                            <CText style={[styles.headerCustomerAddress, styles.font_12_400]} numberOfLines={2}>
                                {`${store.City ? store.City + ',' : ''} ${store.StateCode || ''} ${
                                    store.PostalCode || ''
                                }`}
                            </CText>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <RevampTooltip
                            navigation={navigation}
                            beforeNavigate={saveCart}
                            containerStyle={{ marginRight: 0 } as ViewStyle}
                            store={store}
                            returnRef={returnRef}
                        />
                    </View>
                </View>
                <View style={styles.line} />
                <View style={[styles.flexRowSpaceCenter, styles.marginTop_20]}>
                    <View style={styles.flexDirectionColumn}>
                        <CText style={styles.colorTitleGray}>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>
                        <CText style={styles.marginTop_5}>{startDate ? moment(startDate).format('LL') : ''}</CText>
                    </View>
                    <View>
                        <CText style={styles.colorTitleGray}>
                            {`${t.labels.PBNA_MOBILE_NEXT} ${t.labels.PBNA_MOBILE_DELIVERY_DATE}`}
                        </CText>
                        <CText style={styles.marginTop_5}>{endDate ? moment(endDate).format('LL') : ''}</CText>
                    </View>
                    <TouchableOpacity
                        style={styles.flexRowAlignCenter}
                        onPress={() => {
                            setCalendarVisible(!calendarVisible)
                        }}
                    >
                        <Image style={styles.calendarEditIcon} source={ImageSrc.CALENDAR_EDIT} />
                        <CText style={styles.calendarEditText}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                    </TouchableOpacity>
                </View>
                {renderSearchBar()}
            </View>
        </View>
    )
}

export default ProductSellingHeader
