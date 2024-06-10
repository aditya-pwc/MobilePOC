import React, { FC, MutableRefObject, useMemo, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ProductSKUType } from '../../../../hooks/ProductSellingHooks'
import { t } from '../../../../../common/i18n/t'
import { ReturnProductListStyle } from './ReturnProductListStyle'
import { ReturnProductCard } from '../ReturnProductCard/ReturnProductCard'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { ellipsisWithMaxSize } from '../../../../utils/CommonUtil'
import PriceService from '../../../../service/PriceService'

const styles = ReturnProductListStyle
interface CollapsibleProps {
    item: ProductSKUType
    setIsActiveRef?: MutableRefObject<Function>
    onRemoveCartItemRef?: MutableRefObject<Function>
    swipeAble?: boolean
    cRef?: any
    closeSectionOpenRow?: Function
    sectionIndex?: number
    setCasePriceOrActiveReturnRef?: MutableRefObject<Function>
    setApplyReturnRef?: MutableRefObject<Function>
    isReturnList?: boolean
    setEnableResetScrollToCoordsRef?: MutableRefObject<Function>
    isMyCartPage?: boolean
    setSingleReturnProductActiveRef?: MutableRefObject<Function>
    setIsReturnListActiveRef?: MutableRefObject<Function>
    isOrderInfo?: boolean
    setScreenScrollEnabled?: Function
    currentOpenRowRef?: MutableRefObject<Function | null>
    isEditable?: boolean
    onRefreshCartDataRef?: MutableRefObject<Function>
    setIsModified?: Function
    enableSingleUnitReturn?: boolean
}
export const ReturnProductList: FC<CollapsibleProps> = (props: CollapsibleProps) => {
    const {
        setIsActiveRef,
        item,
        onRemoveCartItemRef,
        swipeAble,
        isReturnList = false,
        setEnableResetScrollToCoordsRef,
        setCasePriceOrActiveReturnRef,
        setApplyReturnRef,
        isMyCartPage = false,
        setSingleReturnProductActiveRef,
        isOrderInfo,
        setIsReturnListActiveRef,
        setScreenScrollEnabled,
        currentOpenRowRef,
        isEditable = true,
        onRefreshCartDataRef,
        setIsModified,
        enableSingleUnitReturn
    } = props
    const { label, isActive, packageCases, packageUnits, products = [], isReturnActive } = item
    const itemRefs = useRef([])
    const returnPriceMissingCheck =
        isReturnList &&
        products.some((product) => {
            return PriceService.checkProductPriceMissing(product, true)
        })
    const renderOrdQty = () => {
        const casesAndUnitsMaxSize = 6
        if (isReturnList) {
            const packageCasesVal = Number(
                ellipsisWithMaxSize((packageCases || 0).toString(), casesAndUnitsMaxSize) || 0
            )
            const packageUnitsVal = Number(
                ellipsisWithMaxSize((packageUnits || 0).toString(), casesAndUnitsMaxSize) || 0
            )
            const textStyle = packageCasesVal > 0 || packageUnitsVal > 0 ? styles.colorRed : null
            return (
                <View style={[styles.flexRowSpaceBet]}>
                    <CText style={[styles.font_12_400, styles.colorTitleGray]}>{t.labels.PBNA_MOBILE_QTY}</CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5, textStyle]}>
                        {packageCasesVal > 0 || packageUnitsVal > 0 ? ` ${t.labels.PBNA_MOBILE_DASH}` : ` `}
                        {`${ellipsisWithMaxSize((packageCases || 0).toString(), casesAndUnitsMaxSize)}`}
                    </CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5, textStyle]}>
                        {t.labels.PBNA_MOBILE_QUANTITY_CS}
                    </CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5, textStyle]}>
                        {` ${ellipsisWithMaxSize((packageUnits || 0).toString(), casesAndUnitsMaxSize)}`}
                    </CText>
                    <CText style={[styles.font_12_700, styles.marginLeft5, textStyle]}>
                        {t.labels.PBNA_MOBILE_QUANTITY_UN}
                    </CText>
                </View>
            )
        }
    }
    return useMemo(() => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setIsActiveRef && setIsActiveRef?.current(label)
                        setIsReturnListActiveRef && setIsReturnListActiveRef.current(label)
                    }}
                >
                    <View
                        style={[
                            styles.paddingHorizontal_22,
                            styles.fullWidth,
                            (!isOrderInfo && isActive) || (isReturnActive && isOrderInfo)
                                ? styles.packageRowStyleOpen
                                : styles.packageRowStyle,
                            !isOrderInfo && isReturnList && !isMyCartPage && styles.bgGray
                        ]}
                    >
                        <View
                            style={[
                                styles.flexRowSpaceBet,
                                styles.fullHeight,
                                styles.alignItemsCenter,
                                styles.fullWidth
                            ]}
                        >
                            <View style={[styles.flexGrow_1]}>
                                <CText style={[styles.font_12_400, styles.colorTitleGray, styles.packageNameLabel]}>
                                    {t.labels.PBNA_MOBILE_PACKAGE}
                                </CText>
                                <View style={[styles.flexRowSpaceBet, styles.marginBottom_6]}>
                                    <CText style={[styles.font_12_700, styles.packageName]} numberOfLines={1}>
                                        {label}
                                    </CText>
                                </View>
                                <View style={[styles.flexRowSpaceBet]}>{renderOrdQty()}</View>
                            </View>
                            <View style={[styles.flexRowAlignCenter, styles.marginLeft20]}>
                                {returnPriceMissingCheck && (
                                    <MaterialCommunityIcons
                                        name="alert-circle"
                                        size={baseStyle.fontSize.fs_18}
                                        color={baseStyle.color.red}
                                        style={styles.marginRight_10}
                                    />
                                )}
                                <View
                                    style={[
                                        (!isOrderInfo && isActive) || (isReturnActive && isOrderInfo)
                                            ? styles.chevron_up_black
                                            : styles.chevron_down_black
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                {((!isOrderInfo && isActive) || (isReturnActive && isOrderInfo)) && (
                    <>
                        <View
                            style={[
                                styles.paddingHorizontal_22,
                                styles.fullWidth,
                                isReturnList && !isMyCartPage && !isOrderInfo && styles.bgGray
                            ]}
                        >
                            <CText style={[styles.font_12_700, styles.marginBottom_15]}>
                                {t.labels.PBNA_MOBILE_PRODUCT_INFO.toUpperCase()}
                            </CText>
                            <View style={styles.lineBold} />
                        </View>
                        {products.map((product, index) => {
                            const adjustQtyProdSkuTile = (
                                <ReturnProductCard
                                    key={product.ProductId}
                                    product={{ item: product }}
                                    onChangeCasePriceOrActiveReturn={setCasePriceOrActiveReturnRef}
                                    onApplyReturn={setApplyReturnRef}
                                    isReturnList={isReturnList}
                                    isOrderInfo={isOrderInfo}
                                    setEnableResetScrollToCoordsRef={setEnableResetScrollToCoordsRef}
                                    setSingleReturnProductActiveRef={setSingleReturnProductActiveRef}
                                    isMyCartPage={isMyCartPage}
                                    isEditable={isEditable}
                                    onRemoveCartItemRef={onRemoveCartItemRef}
                                    onRefreshCartDataRef={onRefreshCartDataRef}
                                    itemRefs={itemRefs}
                                    index={index}
                                    swipeAble={swipeAble}
                                    setScreenScrollEnabled={setScreenScrollEnabled}
                                    currentOpenRowRef={currentOpenRowRef}
                                    setIsModified={setIsModified}
                                    enableSingleUnitReturn={enableSingleUnitReturn}
                                />
                            )
                            return adjustQtyProdSkuTile
                        })}
                    </>
                )}
            </View>
        )
    }, [item, item.products])
}
