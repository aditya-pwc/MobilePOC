import React, { FC, useEffect, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity, Modal, SafeAreaView, FlatList } from 'react-native'
import CText from '../../../../common/components/CText'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchBar, Button } from 'react-native-elements'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import { useGetKamPriorityProducts } from '../../../hooks/KamPriorityProductHooks'
import { PriorityProductSection } from './PriorityProductSection'
import { useFreshRef } from '../../../../orderade/hooks/CommonHooks'
import Loading from '../../../../common/components/Loading'
import { renderEmptyListPlaceholder } from '../../rep/customer/innovation-tab/InnovationProductArchiveDetail'

const styles = StyleSheet.create({
    ...commonStyle,
    searchContainer: {
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 20
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    chevron_up: {
        ...commonStyle.chevron,
        marginTop: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_left: {
        ...commonStyle.chevron,
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
    expandContainer: {
        height: 60,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomColor: baseStyle.color.borderGray
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
    pageTitle: {
        flex: 1,
        lineHeight: 20,
        marginBottom: 5,
        marginRight: 21,
        textAlign: 'center',
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    },
    packageInfoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 10
    },
    packageInfoQuantity: {
        flexDirection: 'row'
    },
    listHeaderComponentStyle: {
        position: 'relative',
        zIndex: 1
    },
    bottomAddButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    buttonPositionAbsolute: {
        position: 'absolute',
        bottom: 0
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    zIndex_1: {
        zIndex: 1
    },
    buttonGrayText: {
        color: baseStyle.color.borderGray
    },
    expandTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginRight: 5
    }
})

export interface ProdPackageInfo {
    flavorName: string
    packageName: string
    quantityNum: number
    prodInfo: any
    prodSequence?: number
}

interface KamPriorityProductsViewSelectProps {
    prodPackageInfo: ProdPackageInfo
    pageTitle: string
    onBack: Function
    retailStore: any
    isSelect?: boolean
}

const HEADER_MARGIN_TOP = 5

const KamPriorityProductsViewSelect: FC<KamPriorityProductsViewSelectProps> = (
    props: KamPriorityProductsViewSelectProps
) => {
    const { prodPackageInfo, pageTitle, onBack, retailStore, isSelect } = props
    const [searchValue, setSearchValue] = useState('')
    const [isExpandOnPress, setIsExpandOnPress] = useState<boolean>(false)
    const [canLoadMoreData, setCanLoadMoreData] = useState<boolean>(false)
    const PAGE_SIZE = 10
    const SEARCH_KEY_MIN_LEN = 3

    const {
        priorityProducts,
        setIsExpand,
        setAllIsExpand,
        setQuantity,
        setCart,
        setCurrentPage,
        setSearchKey,
        hasMoreData,
        isLoading,
        totalAddedQuantity
    } = useGetKamPriorityProducts(prodPackageInfo.prodInfo, PAGE_SIZE, retailStore, prodPackageInfo.prodSequence)

    const setIsExpandRef = useFreshRef(setIsExpand)
    const setQuantityRef = useFreshRef(setQuantity)
    const insets = useSafeAreaInsets()

    useEffect(() => {
        if (isExpandOnPress) {
            setCanLoadMoreData(false)
        } else {
            setCanLoadMoreData(!isLoading && hasMoreData)
        }
    }, [isExpandOnPress, isLoading, hasMoreData])

    const renderExpandTitle = () => {
        const allExpanded = !priorityProducts.find((one) => !one.isExpand)
        return (
            <View style={[styles.expandContainer, styles.justifyContentEnd]}>
                <TouchableOpacity
                    onPress={() => {
                        setIsExpandOnPress(true)
                        setAllIsExpand(!allExpanded)
                    }}
                >
                    <View style={[styles.flexDirectionRow, styles.alignCenter]}>
                        <CText style={styles.expandTitle}>
                            {allExpanded ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                        </CText>
                        <View style={[allExpanded ? styles.chevron_up : styles.chevron_down]} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const renderProdPackageInfo = (prodPackage: ProdPackageInfo) => {
        return (
            <View style={styles.packageInfoContainer}>
                <CText style={[styles.font_24_900, styles.textAlignCenter]}>{prodPackage.flavorName}</CText>
                <CText style={[styles.font_14_700, styles.marginBottom_10, styles.marginTop_6]}>
                    {prodPackage.packageName}
                </CText>
                <View style={styles.packageInfoQuantity}>
                    <CText style={styles.font_12_400}>{t.labels.PBNA_MOBILE_IP_CART_SUGGESTED_QUANTITY}</CText>
                    <CText style={styles.font_12_700}>
                        {` ${prodPackage.quantityNum} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                    </CText>
                </View>
            </View>
        )
    }

    const renderSearchBar = () => {
        return (
            <View style={[styles.searchContainer]}>
                <View style={[styles.flexRowSpaceBet]}>
                    <View style={[styles.searchBarContainer, styles.flexDirectionRow, styles.fullWidth]}>
                        <SearchBar
                            platform="ios"
                            placeholder={t.labels.PBNA_MOBILE_SEARCH + ' ' + t.labels.PBNA_MOBILE_PRODUCTS}
                            allowFontScaling={false}
                            showCancel
                            cancelButtonTitle={''}
                            value={searchValue}
                            containerStyle={[styles.searchInputContainer, styles.greyBox]}
                            inputContainerStyle={styles.inputContainerStyle}
                            inputStyle={[styles.colorBlack, styles.marginX0, styles.searchFont]}
                            // leftIconContainerStyle={styles.marginLeft5}
                            // clearIcon={renderSearchBarClear}
                            // @ts-ignore
                            onChangeText={(text: string) => {
                                setSearchValue(text)
                            }}
                            onBlur={() => {
                                const kw = searchValue.trim()
                                if (kw.length === 0 || kw.length >= SEARCH_KEY_MIN_LEN) {
                                    setCurrentPage(1)
                                    setSearchKey(kw)
                                }
                            }}
                            onCancel={() => {
                                setSearchValue('')
                            }}
                            onClear={() => {
                                setSearchKey('')
                            }}
                        />
                        <View style={[styles.micIconContainer, styles.alignCenter, styles.iconLarge]}>
                            <TouchableOpacity hitSlop={styles.hitSlop12} onPress={() => {}}>
                                <Image source={ImageSrc.IMG_MICROPHONE} style={styles.size_20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const handlePressAddCases = () => {
        /** Will implement add cases logic later */
        setCart()
        onBack()
    }

    const INITIAL_RENDER_NUM = 10
    const MAX_TO_RENDER_PER_BATCH = 10
    const WINDOW_SIZE = 10
    const PERIOD = 300
    const THRESHOLD = 0.3
    const LIST_PADDING_BOTTOM = 80

    const hasPriorityProducts = priorityProducts?.length > 0

    return (
        <Modal visible>
            <View style={[styles.bgWhite, styles.flexGrow_1, styles.relativePosition]}>
                <View style={{ paddingTop: insets.top + HEADER_MARGIN_TOP }}>
                    <View style={[styles.fullWidth, styles.paddingHorizontal_22]}>
                        <View style={styles.headerContainer}>
                            <TouchableOpacity
                                style={[styles.chevron_left]}
                                onPress={() => {
                                    onBack()
                                }}
                                hitSlop={styles.hitSlop30}
                            />

                            <CText style={styles.pageTitle}>{pageTitle}</CText>
                        </View>
                        <View style={styles.line} />
                        {renderProdPackageInfo(prodPackageInfo)}
                        {renderSearchBar()}
                    </View>
                    {hasPriorityProducts && renderExpandTitle()}
                </View>
                {hasPriorityProducts ? (
                    <FlatList
                        style={[styles.flex_1, styles.bgWhite]}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + LIST_PADDING_BOTTOM }}
                        data={priorityProducts}
                        keyExtractor={(item) => item.groupName}
                        renderItem={({ item }) => {
                            const props = {
                                item,
                                setIsExpandRef,
                                setQuantityRef,
                                isSelect,
                                setIsExpandOnPress
                            }
                            return <PriorityProductSection {...props} />
                        }}
                        removeClippedSubviews
                        initialNumToRender={INITIAL_RENDER_NUM}
                        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
                        updateCellsBatchingPeriod={PERIOD}
                        windowSize={WINDOW_SIZE}
                        onEndReachedThreshold={THRESHOLD}
                        onScrollEndDrag={() => {
                            setIsExpandOnPress(false)
                        }}
                        onResponderStart={() => {
                            setIsExpandOnPress(false)
                        }}
                        onResponderMove={() => {
                            setIsExpandOnPress(false)
                        }}
                        onEndReached={() => {
                            canLoadMoreData && setCurrentPage((v) => v + 1)
                        }}
                    />
                ) : (
                    renderEmptyListPlaceholder()
                )}
                {/* NOTICE: this button view can be replaced with <BottomFixedButton /> */}
                {isSelect && (
                    <SafeAreaView
                        style={[
                            styles.bgWhite,
                            styles.bottomAddButton,
                            styles.flexDirectionRow,
                            styles.zIndex_1,
                            styles.buttonPositionAbsolute
                        ]}
                    >
                        <View style={styles.fullWidth}>
                            <Button
                                onPress={handlePressAddCases}
                                title={`${t.labels.PBNA_MOBILE_ADD} ${totalAddedQuantity || ''} ${
                                    t.labels.PBNA_MOBILE_PRODUCT_CASES
                                }`}
                                disabled={totalAddedQuantity === 0}
                                containerStyle={styles.buttonSize}
                                titleStyle={styles.font_12_700}
                                disabledStyle={styles.bgWhite}
                                disabledTitleStyle={[styles.buttonGrayText, styles.font_12_700]}
                                buttonStyle={[styles.bgPurpleColor, styles.buttonSize]}
                            />
                        </View>
                    </SafeAreaView>
                )}
            </View>
            <Loading isLoading={isLoading} />
        </Modal>
    )
}

export default KamPriorityProductsViewSelect
