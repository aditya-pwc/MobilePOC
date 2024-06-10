/* eslint-disable camelcase */
import React, { FC, useMemo, MutableRefObject, useState } from 'react'
import { View, Image, TouchableOpacity, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { Input } from 'react-native-elements'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import _ from 'lodash'
import { ReturnProductCardStyle as styles } from './ReturnProductCardStyle'
import { TmpFdPrc } from '../../../../interface/TmpFdPrc'
import { Picker } from '@react-native-picker/picker'
import PickerTile from '../../../../../savvy/components/rep/lead/common/PickerTile'
import { DefaultNumber, PriceIndexType } from '../../../../enum/Common'
import { formatPriceWithComma } from '../ReturnProductScreen/ReturnProductUtils'
import { formatPrice } from '../../../../utils/PriceUtils'
import { SwipeRow } from 'react-native-swipe-list-view'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ellipsisWithMaxSize } from '../../../../utils/CommonUtil'
import ReturnPricingPop from '../../../../component/return/ReturnPricingPop'
import PriceService from '../../../../service/PriceService'

interface ProductReturnCardProps {
    onChangeCasePriceOrActiveReturn?: MutableRefObject<Function>
    onApplyReturn?: MutableRefObject<Function>
    product?: any
    isReturnList?: boolean
    setEnableResetScrollToCoordsRef?: MutableRefObject<Function>
    isMyCartPage?: boolean
    setSingleReturnProductActiveRef?: MutableRefObject<Function>
    isOrderInfo?: boolean
    isEditable?: boolean
    onRemoveCartItemRef?: MutableRefObject<Function>
    onRefreshCartDataRef?: MutableRefObject<Function>
    index: number
    swipeAble?: boolean
    itemRefs: MutableRefObject<[]>
    setScreenScrollEnabled?: Function
    currentOpenRowRef?: MutableRefObject<Function>
    setIsModified?: Function
    enableSingleUnitReturn?: boolean
}

const renderPicklistItemOverride = (data: TmpFdPrc) => {
    if (Array.isArray(data)) {
        return data.map((el) => {
            return <Picker.Item label={el.label} value={el.index} key={el.label + el.index} />
        })
    }
    return null
}

const RETURN_PRODUCT_PRICE_BUTTON_HITSLOP = { top: 3, right: 20, left: 0, bottom: 30 }
const RETURN_PRODUCT_TOGGLE_HITSLOP = { top: 28, left: 20, bottom: 28, right: 20 }

export const ReturnProductCard: FC<ProductReturnCardProps> = (props: ProductReturnCardProps) => {
    const {
        product,
        onChangeCasePriceOrActiveReturn,
        isReturnList,
        onApplyReturn,
        setEnableResetScrollToCoordsRef,
        isMyCartPage,
        setSingleReturnProductActiveRef,
        isOrderInfo,
        isEditable,
        onRemoveCartItemRef,
        onRefreshCartDataRef,
        index,
        swipeAble,
        itemRefs,
        setScreenScrollEnabled,
        currentOpenRowRef,
        setIsModified,
        enableSingleUnitReturn
    } = props
    const ImageRevertGrey = ImageSrc.REVERT_GREY
    const ImageRevert = ImageSrc.REVERT
    const ImageInnovationProduct = ImageSrc.IMG_NO_INNOVATION_PRODUCT
    const [pricePopVisible, setPricePopVisible] = useState<boolean>(false)
    const onEditPriceOrActiveReturn = async (patch: any) => {
        onChangeCasePriceOrActiveReturn &&
            !setSingleReturnProductActiveRef &&
            (await onChangeCasePriceOrActiveReturn?.current(product?.item?.ProductId, patch, product.item))
        setSingleReturnProductActiveRef && setSingleReturnProductActiveRef?.current(product?.item?.Product2Id, patch)
    }

    const closeSwipeRow = (itemRef: any) => {
        itemRef && itemRef.closeRow && itemRef.closeRow()
    }

    const closeCurrentRow = () => {
        if (currentOpenRowRef?.current === itemRefs.current[index]) {
            return
        }
        currentOpenRowRef?.current?.closeRow && currentOpenRowRef?.current?.closeRow()
        currentOpenRowRef.current = itemRefs.current[index]
    }
    // decide if the apply button is available
    // meets: unitPrice > 0 and one of the cases and units is changed
    // previous cases, units and price
    const values = [
        product.item.breakageCases,
        product.item.breakageUnits,
        product.item.outOfDateCases,
        product.item.outOfDateUnits,
        product.item.saleableCases,
        product.item.saleableUnits,
        product.item.unitPrice
    ]
    const [previousValues, setPreviousValues] = useState(values)
    const isRevertActive = isReturnList
        ? true
        : values.slice(0, values.length - 1).some((value) => {
              return value && parseFloat(value) > 0
          })

    const applyReturn = async () => {
        setPreviousValues(values)
        // if zero out all cases and units, then delete this product from the return section
        if (values.slice(0, values.length - 1).every((value) => parseInt(value) === 0 || !value)) {
            onRemoveCartItemRef?.current && (await onRemoveCartItemRef.current(product.item))
        } else {
            onApplyReturn?.current(product?.item, isReturnList)
            onRefreshCartDataRef?.current()
        }
        closeSwipeRow(itemRefs.current[index])
        closeCurrentRow()
        if (isMyCartPage) {
            setIsModified && setIsModified(false)
        }
    }
    const isAbleToClear = values.slice(0, values.length - 1).some((value) => value && parseInt(value) !== 0)
    const handlePrice = () => {
        // textinput in prompt will trigger keyboardAwareFlatList's keyboard will hide event
        // need to disable enableResetScrollToCoords temporarily disable this to prevent page's scroll being reset
        setEnableResetScrollToCoordsRef?.current(false)

        setPricePopVisible(true)
        closeSwipeRow(itemRefs.current[index])
        closeCurrentRow()
    }

    const renderProdPrice = (product: any) => {
        const { priceArr, priceIndex, priceDisplayRange, relativeDelDate, unitPrice } = product || {}
        const hasValidUnitPrice = Number(priceIndex) !== PriceIndexType.UNSELECTED
        let priceSection
        // if return applied, just display black final value
        if (!isEditable) {
            priceSection = (
                <CText style={[styles.font_12_700, styles.colorBlack]}>{`$ ${formatPrice(unitPrice)}`}</CText>
            )
            // for authorized products
            // if they have forced price: priceIndex > -1
            // if they have prices to choose: priceDisplayRange.length > 0
            // if none of above two is meet, then we move to else, let user manual input
        } else if (priceDisplayRange?.length || parseInt(priceIndex) > PriceIndexType.UNSELECTED) {
            let priceFormatted = ''
            let defaultValue = -1
            if (priceArr[priceIndex]) {
                priceFormatted = `$` + formatPrice(priceArr[priceIndex].Price)
                defaultValue = priceArr[priceIndex].index
            }
            // if we don't allow user to select from display range
            // then it's a forced price should be rendered as black
            if (!priceDisplayRange.length) {
                priceSection = <CText style={[styles.font_12_700, styles.colorBlack]}>{priceFormatted || '--'}</CText>
                // else render pickertile
            } else {
                const pickerOptions = priceArr.filter((one: TmpFdPrc) => {
                    return (
                        priceDisplayRange.includes(one.Priority) &&
                        Number(one.Relative_Start_Value) <= relativeDelDate &&
                        Number(one.Relative_End_Value) >= relativeDelDate
                    )
                })
                pickerOptions.unshift({
                    label: `-- ${t.labels.PBNA_MOBILE_CHOOSE_PRICE} --`,
                    index: -1
                })
                const labelStyle = [styles.font_12_700, styles.colorLightBlue]
                priceSection = (
                    <PickerTile
                        data={pickerOptions}
                        renderPicklistItem={renderPicklistItemOverride}
                        label={''}
                        defValue={defaultValue}
                        disabled={false}
                        noPaddingHorizontal
                        isFirstItemValuable
                        placeholder={t.labels.PBNA_MOBILE_CHOOSE_PRICE}
                        onDone={(v: any) => {
                            onEditPriceOrActiveReturn({
                                unitPrice: priceArr[v]?.Price || '0',
                                priceIndex: v
                            })
                            setIsModified && setIsModified(true)
                        }}
                        pickContainerStyle={{
                            padding: 0
                        }}
                        required
                        modalStyle={{
                            width: '90%'
                        }}
                        borderStyle={{}}
                        title={t.labels.PBNA_MOBILE_PRICING}
                        customLabel={
                            <CText style={labelStyle}>
                                {formatPriceWithComma(priceFormatted) || t.labels.PBNA_MOBILE_CHOOSE_PRICE}
                            </CText>
                        }
                        pickViewStyle={styles.pickViewStyle}
                        customIconWrapStyle={styles.customIconWrapStyle}
                        hitSlop={RETURN_PRODUCT_PRICE_BUTTON_HITSLOP}
                    />
                )
            }
        } else {
            const priceFormatted = hasValidUnitPrice
                ? formatPrice(unitPrice)
                : t.labels.PBNA_MOBILE_ADD_PRICE.toUpperCase()
            const textStyle = [styles.font_12_700, styles.colorLightBlue]
            priceSection = (
                <TouchableOpacity onPress={handlePrice} hitSlop={RETURN_PRODUCT_PRICE_BUTTON_HITSLOP}>
                    <CText style={textStyle}>{`$ ${formatPriceWithComma(priceFormatted)}`}</CText>
                </TouchableOpacity>
            )
        }
        const priceMissing = isReturnList && PriceService.checkProductPriceMissing(product, true)
        return (
            <View style={[styles.flexRowAlignCenter]}>
                <CText style={[styles.lineHeight_20, styles.font_12_700, styles.colorTitleGray]}>
                    {`${t.labels.PBNA_MOBILE_CASE_COST}  `}
                </CText>
                {priceSection}
                {priceMissing && (
                    <MaterialCommunityIcons
                        name="alert-circle"
                        size={baseStyle.fontSize.fs_16}
                        color={baseStyle.color.red}
                        style={[commonStyle.marginHorizontal_3]}
                    />
                )}
            </View>
        )
    }
    const kpiRow = (item: any) => {
        const isSaleable = item.name === 'Saleable'
        function disabledUnit(product: any) {
            if (product.Config_Qty__c && Number(product.Config_Qty__c) > 0 && enableSingleUnitReturn) {
                return false
            }
            return true
        }
        const getUnitValue = (unitsNum: number, isSaleable: boolean, isUnitEditable: boolean) => {
            if (isSaleable || !isUnitEditable) {
                return t.labels.PBNA_MOBILE_NA
            }
            return `${unitsNum}`
        }
        const totalMaxSize = 7
        return (
            <View style={styles.KpiDataRowCustomColumn} key={item.name}>
                <CText style={styles.KpiDataRowCustomColumnName}>{item.name}</CText>
                <View style={styles.KpiDataRowCustomColumnInputs}>
                    <Input
                        editable={false}
                        containerStyle={[styles.tableRowInputTotal, styles.borderBottomColor]}
                        returnKeyType="done"
                        keyboardType="number-pad"
                        textAlign="center"
                        inputContainerStyle={styles.borderBottomColor0}
                        value={formatPriceWithComma(ellipsisWithMaxSize(item.total, totalMaxSize))}
                        inputStyle={styles.tableRowInputStyle}
                        selectTextOnFocus
                    />
                    <Input
                        maxLength={5}
                        editable={isEditable}
                        containerStyle={[styles.tableRowInput, isOrderInfo && { borderColor: '#D3D3D3' }]}
                        returnKeyType="done"
                        keyboardType="number-pad"
                        textAlign="center"
                        inputContainerStyle={styles.borderBottomColor0}
                        inputStyle={styles.tableRowInputStyle}
                        value={`${item.cases}`}
                        onChangeText={(text) => {
                            let final = parseInt(text.replace(/\D/g, ''))
                            if (isNaN(final) || final <= 0) {
                                final = 0
                            }
                            onEditPriceOrActiveReturn({
                                [_.camelCase(item.name) + 'Cases']: final.toString()
                            })
                            setIsModified && setIsModified(true)
                        }}
                        selectTextOnFocus
                        onFocus={() => {
                            closeSwipeRow(itemRefs.current[index])
                            closeCurrentRow()
                        }}
                    />
                    <Input
                        maxLength={5}
                        editable={isEditable && !disabledUnit(item) && !isSaleable}
                        containerStyle={[
                            styles.tableRowInput,
                            (isOrderInfo || disabledUnit(item) || isSaleable) && { borderColor: '#D3D3D3' }
                        ]}
                        returnKeyType="done"
                        keyboardType="number-pad"
                        textAlign="center"
                        inputContainerStyle={styles.borderBottomColor0}
                        inputStyle={[
                            styles.tableRowInputStyle,
                            (disabledUnit(item) || isSaleable) && { color: 'black', fontWeight: 'bold' }
                        ]}
                        value={getUnitValue(item.units, isSaleable, !disabledUnit(item))}
                        onChangeText={(text) => {
                            if (!disabledUnit(item) && !isSaleable) {
                                let final = parseInt(text.replace(/\D/g, ''))
                                if (isNaN(final) || final <= 0) {
                                    final = 0
                                }
                                onEditPriceOrActiveReturn({
                                    [_.camelCase(item.name) + 'Units']: final.toString()
                                })
                                setIsModified && setIsModified(true)
                            }
                        }}
                        selectTextOnFocus
                        onFocus={() => {
                            closeSwipeRow(itemRefs.current[index])
                            closeCurrentRow()
                        }}
                    />
                </View>
            </View>
        )
    }

    const returnPricingPopProps = {
        packageName: product.item['Product.Package_Type_Name__c'],
        custUniqId: product.item.custUniqId,
        price: product.item.unitPrice,
        relativeDelDate: product.item.relativeDelDate,
        onCancel: () => {
            setPricePopVisible(false)
        },
        onSubmit: (price: string) => {
            onEditPriceOrActiveReturn({
                unitPrice: price,
                priceIndex: PriceIndexType.MANUAL_INPUT
            })
            setPricePopVisible(false)
        }
    }

    return useMemo(
        () => {
            const {
                breakageCases,
                breakageUnits,
                breakageTotal,
                outOfDateCases,
                outOfDateUnits,
                outOfDateTotal,
                saleableCases,
                saleableUnits,
                saleableTotal,
                isActiveReturn,
                priceIndex,
                Config_Qty__c
            } = product.item
            const kpiRows = [
                {
                    name: t.labels.PBNA_MOBILE_BREAKAGE,
                    total: `$ ${breakageTotal || DefaultNumber.stringZero000}`,
                    cases: breakageCases || '0',
                    units: breakageUnits || '0',
                    Config_Qty__c
                },
                {
                    name: t.labels.PBNA_MOBILE_OUT_OF_DATE,
                    total: `$ ${outOfDateTotal || DefaultNumber.stringZero000}`,
                    cases: outOfDateCases || '0',
                    units: outOfDateUnits || '0',
                    Config_Qty__c
                },
                {
                    name: t.labels.PBNA_MOBILE_SALEABLE,
                    total: `$ ${saleableTotal || DefaultNumber.stringZero000}`,
                    cases: saleableCases || '0',
                    units: saleableUnits || '0',
                    Config_Qty__c
                }
            ]
            const applyDisabled = !(Number(priceIndex) !== PriceIndexType.UNSELECTED && isRevertActive)

            const TopCard = (
                <View
                    style={[
                        styles.fullWidth,
                        styles.justifyContentCenter,
                        styles.paddingLeft_22,
                        styles.cardStyle,
                        !isOrderInfo && !isEditable && !isMyCartPage && styles.bgGray
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.flexDirectionRow, styles.marginVertical_20]}
                        onPress={() => {
                            onEditPriceOrActiveReturn({
                                isActiveReturn: !isActiveReturn
                            })
                        }}
                        hitSlop={RETURN_PRODUCT_TOGGLE_HITSLOP}
                    >
                        <View style={[styles.flexDirectionRow, styles.flexCenter]}>
                            <View style={[styles.flexDirectionRow]}>
                                <Image style={styles.size_60} source={ImageInnovationProduct} />
                            </View>
                            <View style={[styles.flex_1, styles.marginLeft10]}>
                                <CText numberOfLines={3} style={styles.font_14_700}>
                                    {product.item['Product.Sub_Brand__c'] || product.item['Product.Name']}
                                </CText>
                                <View style={[styles.flexRowAlignCenter]}>
                                    <TouchableOpacity>
                                        <CText style={[styles.colorLightBlue, styles.upcText, styles.lineHeight_20]}>
                                            {product.item['Product.ProductCode']}
                                        </CText>
                                    </TouchableOpacity>
                                    <View style={[styles.vLine, styles.height_p75]} />
                                    <CText style={[styles.InvenIdText, styles.lineHeight_20]}>
                                        {product.item['Product.Material_Unique_ID__c']}
                                    </CText>
                                </View>
                                {renderProdPrice(product?.item)}
                            </View>
                        </View>
                        <View style={[styles.flexDirectionColumn, styles.alignCenter, styles.isActiveReturnIcon]}>
                            <View
                                style={[
                                    product?.item?.isActiveReturn ? styles.chevron_up_black : styles.chevron_down_black
                                ]}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            )
            return (
                <View style={styles.bgWhite}>
                    {!swipeAble ? (
                        TopCard
                    ) : (
                        <SwipeRow
                            ref={(el) => (itemRefs.current[index] = el)}
                            key={product.ProductId}
                            rightOpenValue={-120}
                            closeOnRowPress
                            disableRightSwipe
                            friction={4}
                            tension={4}
                            swipeToOpenPercent={5}
                            previewOpenValue={0.1}
                            setScrollEnabled={(enable: boolean) => {
                                setScreenScrollEnabled && setScreenScrollEnabled(enable)
                            }}
                            onRowOpen={() => {
                                closeCurrentRow()
                            }}
                            disableLeftSwipe={!swipeAble}
                            recalculateHiddenLayout
                        >
                            <View style={styles.swipeRowWrap}>
                                <TouchableOpacity
                                    style={[styles.swipeRowBtn]}
                                    onPress={() => {
                                        Alert.alert(
                                            t.labels.PBNA_MOBILE_REMOVE,
                                            t.labels.PBNA_MOBILE_REMOVE_CART_ITEM_MESSAGE,
                                            [
                                                {
                                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                                    onPress: () => {
                                                        closeSwipeRow(itemRefs.current[index])
                                                    }
                                                },
                                                {
                                                    text: t.labels.PBNA_MOBILE_REMOVE_CHECK_MESSAGE,
                                                    style: 'default',
                                                    onPress: async () => {
                                                        onRemoveCartItemRef?.current &&
                                                            (await onRemoveCartItemRef.current(product.item))
                                                    }
                                                }
                                            ]
                                        )
                                    }}
                                >
                                    <CText style={[styles.font_12_700, styles.colorWhite]}>
                                        {t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}
                                    </CText>
                                </TouchableOpacity>
                            </View>
                            {TopCard}
                        </SwipeRow>
                    )}
                    {product?.item?.isActiveReturn && (
                        <View style={styles.KpiRowView}>
                            <View
                                style={[
                                    styles.KpiRowCustomColumn,
                                    !isEditable && !isOrderInfo && !isMyCartPage ? styles.bgGray : styles.bgWhite
                                ]}
                            >
                                {isOrderInfo ? (
                                    <View style={styles.KpiRowCustomColumnRevert} />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.KpiRowCustomColumnRevert}
                                        onPress={() => {
                                            onEditPriceOrActiveReturn({
                                                breakageCases: '0',
                                                breakageUnits: '0',
                                                breakageTotal: '0',
                                                outOfDateCases: '0',
                                                outOfDateUnits: '0',
                                                outOfDateTotal: '0',
                                                saleableCases: '0',
                                                saleableUnits: '0',
                                                saleableTotal: '0'
                                            })
                                            closeSwipeRow(itemRefs.current[index])
                                            closeCurrentRow()
                                            setIsModified && setIsModified(true)
                                        }}
                                        disabled={!isAbleToClear && isEditable}
                                    >
                                        <Image
                                            style={styles.revertIcon}
                                            source={isAbleToClear && isEditable ? ImageRevert : ImageRevertGrey}
                                        />
                                        <CText
                                            style={
                                                isAbleToClear && isEditable
                                                    ? styles.revertIconTextActive
                                                    : styles.revertIconText
                                            }
                                        >
                                            {t.labels.PBNA_MOBILE_CLEAR.toLocaleUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                )}
                                <View style={styles.KpiRowCustomColumnTitle}>
                                    <CText style={styles.KpiRowCustomColumnTitleTextTotal}>
                                        {t.labels.PBNA_MOBILE_TOTAL}
                                    </CText>
                                    <CText style={styles.KpiRowCustomColumnTitleText}>
                                        {t.labels.PBNA_MOBILE_CASES}
                                    </CText>
                                    <CText style={styles.KpiRowCustomColumnTitleText}>
                                        {t.labels.PBNA_MOBILE_UNITS}
                                    </CText>
                                </View>
                            </View>
                            {kpiRows.map((item) => kpiRow(item))}
                            {isEditable && (
                                <TouchableOpacity
                                    style={styles.applyButtonView}
                                    disabled={applyDisabled}
                                    onPress={applyReturn}
                                >
                                    <View
                                        style={[
                                            styles.applyButton,
                                            applyDisabled ? styles.applyButtonInActive : styles.applyButtonActive
                                        ]}
                                    >
                                        <CText
                                            style={[
                                                styles.applyButtonText,
                                                applyDisabled
                                                    ? styles.applyButtonTextInActive
                                                    : styles.applyButtonTextActive
                                            ]}
                                        >
                                            {t.labels.PBNA_MOBILE_APPLY}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    <View style={styles.line} />
                    {pricePopVisible && <ReturnPricingPop {...returnPricingPopProps} />}
                </View>
            )
        },
        !isEditable
            ? [product?.item?.ProductId, product?.item?.isActiveReturn]
            : [product.item, previousValues, pricePopVisible]
    )
}
