/* eslint-disable camelcase */
import React, { FC, useMemo, useRef, MutableRefObject } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { TextInput } from 'react-native-gesture-handler'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { normalize } from '../../utils/FontSizeUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { CommonLabel } from '../../enum/CommonLabel'
import { t } from '../../../common/i18n/t'
import PickerTile from '../../../savvy/components/rep/lead/common/PickerTile'
import { TmpFdPrc } from '../../interface/TmpFdPrc'
import { Picker } from '@react-native-picker/picker'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { DefaultNumber, EDVDealCategoryCodes } from '../../enum/Common'
import EDVModal from '../../pages/MyDayScreen/ProductSelling/EDVModal'
import { ellipsis, formatPrice } from '../../utils/PriceUtils'
import IconVolumeHurdle from '../../../../assets/image/icon_pricing_hurdle.svg'
import Regex from '../../constants/Regex'

const styles = StyleSheet.create({
    ...commonStyle,
    minusBtn: {
        backgroundColor: baseStyle.color.LightBlue,
        width: 13.72,
        height: 2
    },
    lineHeight_20: {
        lineHeight: 20
    },
    chevron_down: {
        ...commonStyle.chevron,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    quantityInputWrap: {
        width: 49,
        height: 40,
        borderColor: baseStyle.color.liteGrey,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 5
    },
    quantityUnitText: {
        fontSize: baseStyle.fontSize.fs_8,
        color: baseStyle.color.titleGray
    },
    quantityInput: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        left: 0
    },
    textInput: {
        backgroundColor: 'transparent',
        paddingTop: 5,
        paddingBottom: 17,
        paddingHorizontal: 5,
        fontFamily: 'Gotham',
        color: '#000',
        lineHeight: 18,
        textAlign: 'center'
    },
    plusBtn1: {
        backgroundColor: '#00A2D9',
        width: 15.68,
        height: 2,
        top: 11,
        left: 4
    },
    plusBtn2: {
        backgroundColor: '#00A2D9',
        height: 16,
        width: 2,
        left: 11,
        top: 4
    },
    upcText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_700
    },
    InvenIdText: {
        fontSize: normalize(11.6),
        fontWeight: baseStyle.fontWeight.fw_400
    },
    height_p75: {
        height: '75%'
    },
    marginBottom_10: {
        marginBottom: 10
    },
    priceText: {
        fontWeight: '700',
        color: baseStyle.color.LightBlue
    },
    choosePriceRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 45
    },
    caseEDVPromo: {
        height: 55,
        color: baseStyle.color.LightBlue,
        marginRight: 10
    },
    iconXXS: {
        width: 16,
        height: 16
    }
})

interface AdjustQtyProdSkuTileProps {
    quantityContStyle?: any
    title?: string
    subTitle?: string
    defaultQtyNum?: string
    onChangeQtyNum?: MutableRefObject<Function>
    product?: any
    showSugQty?: boolean
    showProdTrend?: boolean
    currentOpenRowRef?: MutableRefObject<any>
    openEDVPopup?: any
    closeEDVPopup?: any
    setEDVRef?: MutableRefObject<any>
    isSliderOpen?: React.MutableRefObject<boolean>
    onPickerLabelClicked?: Function
}

const renderSugQty = (showSugQty: boolean | undefined) => {
    if (showSugQty) {
        return (
            <View style={[styles.alignCenter, styles.marginTop_5]}>
                <CText style={[styles.colorTitleGray, styles.font_12_400]}>{'Sug Qty'}</CText>
                <CText style={[styles.colorTitleGray, styles.font_12_400]}>{'0'}</CText>
            </View>
        )
    }
}

export const qtyAdjustBlock = (
    qtyCount: any,
    inputRef: any,
    onEditQtyCount: (quantity: string) => void,
    showSugQty: boolean | undefined
) => {
    return (
        <View style={[styles.flexDirectionColumn, styles.alignCenter]}>
            <View style={styles.flexRowAlignCenter}>
                <TouchableOpacity
                    style={[styles.alignCenter, styles.height_40]}
                    onPress={() => {
                        if (parseInt(qtyCount) > 0) {
                            if (inputRef?.current?.isFocused()) {
                                inputRef.current.blur()
                            }
                            const minusCount = parseInt(qtyCount) - 1
                            onEditQtyCount(minusCount + '')
                        }
                    }}
                >
                    <View style={[styles.size_24, styles.alignCenter, styles.relativePosition]}>
                        <View style={styles.minusBtn} />
                    </View>
                </TouchableOpacity>
                <View style={[styles.justifyContentEnd, styles.alignItemsCenter, styles.quantityInputWrap]}>
                    <View style={[styles.relativePosition, styles.marginBottom_5]}>
                        <CText style={styles.quantityUnitText}>{'Qty'}</CText>
                    </View>
                    <View style={[styles.quantityInput, styles.fullHeight, styles.fullWidth]}>
                        <TextInput
                            ref={inputRef}
                            keyboardType={'numeric'}
                            maxLength={3}
                            placeholderTextColor={'#000'}
                            editable
                            selectTextOnFocus
                            returnKeyType={'done'}
                            onChangeText={(text = '') => {
                                const numInput = (parseInt(text.replace('.', '')) || '') + ''
                                if (numInput === '') {
                                    onEditQtyCount('0')
                                } else {
                                    onEditQtyCount(numInput)
                                }
                            }}
                            onBlur={() => {
                                if (qtyCount === '') {
                                    onEditQtyCount('0')
                                }
                            }}
                            value={qtyCount}
                            style={[styles.textInput, styles.font_16_700, styles.fullHeight, styles.fullWidth]}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.alignCenter, styles.height_40]}
                    onPress={() => {
                        if (parseInt(qtyCount || '0') < 999) {
                            if (inputRef?.current?.isFocused()) {
                                inputRef.current.blur()
                            }
                            const plusCount = parseInt(qtyCount || '0') + 1
                            onEditQtyCount(plusCount + '')
                        }
                    }}
                >
                    <View style={[styles.alignCenter, styles.size_24, styles.relativePosition]}>
                        <View style={[styles.plusBtn1, styles.absolutePosition]} />
                        <View style={[styles.plusBtn2, styles.absolutePosition]} />
                    </View>
                </TouchableOpacity>
            </View>
            {renderSugQty(showSugQty)}
        </View>
    )
}

const renderPicklistItemOverride = (data: TmpFdPrc) => {
    if (Array.isArray(data)) {
        return data.map((el) => {
            return <Picker.Item label={el.label} value={el.index} key={el.label + el.index} />
        })
    }
    return null
}

export const AdjustQtyProdSkuTile: FC<AdjustQtyProdSkuTileProps> = (props: AdjustQtyProdSkuTileProps) => {
    const inputRef = useRef<TextInput>(null)
    const {
        product,
        onChangeQtyNum,
        showSugQty,
        showProdTrend,
        currentOpenRowRef,
        openEDVPopup,
        closeEDVPopup,
        setEDVRef,
        isSliderOpen,
        onPickerLabelClicked
    } = props
    const qtyCount = product.item.quantity

    const onEditQtyCount = (quantity: string) => {
        currentOpenRowRef?.current?.closeRow && currentOpenRowRef?.current?.closeRow()
        onChangeQtyNum?.current(quantity, product?.item || {})
    }

    const onSelectPricing = (index: number) => {
        onChangeQtyNum?.current(qtyCount, product?.item || {}, index)
    }
    const renderProdImg = () => {
        return <Image style={styles.size_60} source={require('../../../../assets/image/No_Innovation_Product.png')} />
    }

    const renderProdTrend = () => {
        if (showProdTrend) {
            return (
                <TouchableOpacity style={styles.flexDirectionRow} onPress={() => {}}>
                    <CText style={[styles.colorLightBlue, styles.font_12_700, styles.lineHeight_20]}>
                        {'PRODUCT  TREND'}
                    </CText>
                    <View style={[styles.chevron_down, styles.marginLeft5]} />
                </TouchableOpacity>
            )
        }
    }

    // if product have quantity without price will have warning icon
    const renderWarningIcon = () => {
        if (_.toNumber(product.item.priceIndex) < 0 && _.toNumber(product.item.quantity)) {
            return (
                <MaterialCommunityIcons
                    name="alert-circle"
                    size={baseStyle.fontSize.fs_16}
                    color={baseStyle.color.red}
                    style={commonStyle.marginHorizontal_3}
                />
            )
        }
    }

    return useMemo(() => {
        const { priceArr, priceIndex, priceDisplayRange, relativeDelDate } = product.item
        let priceFormatted = DefaultNumber.twoHorizontalLine.toString()
        let minimumQuantity = 0
        let defaultValue = -1
        const curPriceRule = priceArr[priceIndex]
        if (curPriceRule) {
            priceFormatted = t.labels.PBNA_MOBILE_ORDER_D + formatPrice(curPriceRule.Price)
            minimumQuantity = parseInt(curPriceRule.Minimum_Quantity)
            defaultValue = curPriceRule.index
        }
        let pickerOptions = []
        if (priceDisplayRange.length) {
            pickerOptions = priceArr.filter((one: TmpFdPrc) => {
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
        }
        let EDVValue = DefaultNumber.twoHorizontalLine.toString()
        if (product?.item && product?.item?.EDV_Price__c) {
            const qty =
                ellipsis(parseInt(product.item.EDV_Qty__c || 0).toString(), 4) || DefaultNumber.twoHorizontalLine
            const price = parseFloat(product.item.EDV_Price__c).toFixed(2)
            EDVValue = `${qty}/$${price}`
        } else if (
            priceArr[priceIndex]?.Deal_Name__c &&
            priceArr[priceIndex]?.Deal_Category_Code__c === EDVDealCategoryCodes.EDV
        ) {
            const temp = Regex.EDVPriceRegex.exec(priceArr[priceIndex].Deal_Name__c)
            if (temp && temp.length > 0) {
                EDVValue = temp[0].trim()
                setEDVRef?.current(EDVValue.split('/$')[0], EDVValue.split('/$')[1], false, product.item)
            }
        }
        const EDV = () => {
            return (
                <TouchableOpacity
                    onPress={() => {
                        openEDVPopup(
                            <EDVModal
                                qty={product?.item?.EDV_Qty__c || ''}
                                price={product?.item?.EDV_Price__c || ''}
                                closeEDVPopup={closeEDVPopup}
                                handlePressConfirm={(qty: any, price: any, applyAll: boolean) => {
                                    setEDVRef?.current(qty, price, applyAll, product?.item)
                                }}
                            />
                        )
                    }}
                >
                    <CText style={[styles.font_12_700, styles.priceText]}>
                        {EDVValue !== DefaultNumber.twoHorizontalLine.toString()
                            ? EDVValue
                            : `+ ${t.labels.PBNA_MOBILE_ADD_EDV}`}
                    </CText>
                </TouchableOpacity>
            )
        }
        let volumeHurdleAndPickerLine
        if (minimumQuantity > 0 || pickerOptions.length) {
            volumeHurdleAndPickerLine = (
                <View style={[styles.flexRowAlignCenter, styles.flexRowSpaceBet]}>
                    <View style={[styles.flexRowAlignCenter]}>
                        {minimumQuantity > 0 && (
                            <>
                                <IconVolumeHurdle style={[styles.iconXXS, { marginRight: 6 }]} />
                                <CText style={styles.font_12_400}>{t.labels.PBNA_MOBILE_VOLUME_HURDLE + ' '}</CText>
                                <CText style={styles.font_12_700}>{priceFormatted + '/' + minimumQuantity}</CText>
                            </>
                        )}
                    </View>
                    <View>
                        {pickerOptions.length ? (
                            <View style={[styles.flexRowCenter]}>
                                {renderWarningIcon()}
                                <PickerTile
                                    key={product.item['Product.Material_Unique_ID__c'] + defaultValue}
                                    data={pickerOptions}
                                    renderPicklistItem={renderPicklistItemOverride}
                                    label={''}
                                    defValue={defaultValue}
                                    disabled={false}
                                    noPaddingHorizontal
                                    isFirstItemValuable
                                    placeholder={t.labels.PBNA_MOBILE_CHOOSE_PRICE}
                                    onDone={(v: any) => {
                                        onSelectPricing(v)
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
                                        <CText style={[styles.colorLightBlue, styles.font_14_700]}>
                                            {priceFormatted !== DefaultNumber.twoHorizontalLine
                                                ? ''
                                                : t.labels.PBNA_MOBILE_CHOOSE_PRICE}
                                        </CText>
                                    }
                                    hitSlop={20}
                                    isSliderOpen={isSliderOpen}
                                    onLabelClicked={onPickerLabelClicked}
                                />
                            </View>
                        ) : null}
                    </View>
                </View>
            )
        }
        return (
            <View>
                <View
                    style={[
                        styles.bgWhite,
                        styles.fullWidth,
                        styles.justifyContentCenter,
                        styles.paddingHorizontal_22,
                        { flex: 1 }
                    ]}
                >
                    <View style={[styles.flexDirectionRow, styles.marginVertical_20, styles.marginBottom_10]}>
                        <View style={[styles.flexDirectionRow, styles.flexCenter]}>
                            <View style={[styles.flexDirectionRow]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (parseInt(qtyCount || '0') < CommonLabel.MAX_PROD_COUNT) {
                                            if (inputRef?.current?.isFocused()) {
                                                inputRef?.current?.blur()
                                            }
                                            const plusCount = parseInt(qtyCount || '0') + 1
                                            onEditQtyCount(plusCount + '')
                                        }
                                    }}
                                >
                                    {renderProdImg()}
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.flex_1, styles.marginLeft10]}>
                                <CText numberOfLines={3} style={styles.font_14_700}>
                                    {product?.item['Product.Sub_Brand__c'] || product?.item['Product.Name']}
                                </CText>
                                <View style={[styles.flexRowAlignCenter]}>
                                    <TouchableOpacity>
                                        <CText style={[styles.colorLightBlue, styles.upcText, styles.lineHeight_20]}>
                                            {product?.item['Product.ProductCode']}
                                        </CText>
                                    </TouchableOpacity>
                                    <View style={[styles.vLine, styles.height_p75]} />
                                    <CText style={[styles.InvenIdText, styles.lineHeight_20]}>
                                        {product?.item['Product.Material_Unique_ID__c']}
                                    </CText>
                                </View>
                                {renderProdTrend()}
                            </View>
                        </View>
                        {qtyAdjustBlock(qtyCount, inputRef, onEditQtyCount, showSugQty)}
                    </View>
                    {volumeHurdleAndPickerLine}
                    <View style={[styles.flexRowAlignCenter, styles.caseEDVPromo]}>
                        <View style={styles.oneThird}>
                            {!!priceFormatted && (
                                <View style={commonStyle.flexDirectionColumn}>
                                    <CText style={styles.font_12_400}>{t.labels.PBNA_MOBILE_CASE_COST} </CText>
                                    <View style={styles.flexDirectionRow}>
                                        <CText style={[styles.font_12_700, styles.priceText]}>{priceFormatted}</CText>
                                        {pickerOptions.length === 0 &&
                                            priceFormatted === DefaultNumber.twoHorizontalLine &&
                                            renderWarningIcon()}
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={styles.oneThird}>
                            <View style={commonStyle.flexDirectionColumn}>
                                <CText style={styles.font_12_400}>{t.labels.PBNA_MOBILE_EDV} </CText>
                                {EDV()}
                            </View>
                        </View>
                        <View style={styles.oneThird}>
                            <View style={commonStyle.flexDirectionColumn}>
                                <CText style={styles.font_12_400}>{t.labels.PBNA_MOBILE_PROMO} </CText>
                                <CText>{DefaultNumber.twoHorizontalLine}</CText>
                            </View>
                        </View>
                    </View>
                    <View style={styles.line} />
                </View>
            </View>
        )
    }, [qtyCount, showProdTrend, showSugQty, product.item])
}
