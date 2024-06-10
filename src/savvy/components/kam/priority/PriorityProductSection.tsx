import React, { FC, MutableRefObject, useMemo, useRef } from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { renderNeedsAuthPill } from '../../rep/customer/innovation-tab/PriorityProductAttributeList'
import { MinusAddButton } from './MinusAddButton'

const styles = StyleSheet.create({
    ...commonStyle,
    chevron_up_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderBottomWidth: 2,
        borderRightWidth: 2
    },
    chevron_down_black: {
        ...commonStyle.chevron,
        borderColor: baseStyle.color.black,
        borderTopWidth: 2,
        borderLeftWidth: 2
    },
    width_p90: {
        width: '90%'
    },
    productItem: {
        marginHorizontal: 22,
        paddingVertical: 20
    },
    borderBottomStyle: {
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    lineHeight_20: {
        lineHeight: 20
    },
    minusBtn: {
        backgroundColor: baseStyle.color.LightBlue,
        width: 13.72,
        height: 2
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
    marginLeft_Auto: {
        marginLeft: 'auto'
    },
    maxWidth_230: {
        maxWidth: 230
    },
    maxWidth_190: {
        maxWidth: 190
    },
    maxWidth_180: {
        maxWidth: 180
    },
    height_42: {
        height: 42
    },
    marginVertical_15: {
        marginVertical: 15
    },
    lineBoldGray: {
        height: 1,
        backgroundColor: baseStyle.color.borderGray
    },
    paddingHorizontal_12: {
        paddingHorizontal: 12
    },
    priorityProductCard: {
        backgroundColor: baseStyle.color.white,
        paddingTop: 20,
        paddingBottom: 10,
        marginHorizontal: 22,
        borderRadius: 6,
        marginBottom: 16,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.17,
        shadowRadius: 10
    },
    celsiusPriorityProductItem: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    alignItemsStart: {
        alignItems: 'flex-start'
    },
    offInWhsePillCon: {
        width: 106,
        height: 20,
        borderRadius: 10,
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.titleGray,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pillText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham'
    },
    marginTop_10: {
        marginTop: 10
    },
    width_230: {
        width: 230
    }
})

interface ProductSKUType {
    groupName: string
    isExpand?: boolean
    products?: Array<any>
}

interface PriorityProductSectionProps {
    item: ProductSKUType
    setIsExpandRef: MutableRefObject<Function>
    setQuantityRef?: MutableRefObject<Function>
    isSelect?: boolean
    setIsExpandOnPress?: any
}

export const PriorityProductSection: FC<PriorityProductSectionProps> = (props: PriorityProductSectionProps) => {
    const { item, setIsExpandRef, setQuantityRef, isSelect, setIsExpandOnPress } = props
    const { groupName, isExpand, products = [] } = item
    const inputRef = useRef<TextInput>(null)
    const MAX_NUM = 999

    const handleEditQuantity = (quantity: string, prodId: string) => {
        setQuantityRef?.current(quantity, groupName, prodId)
    }

    const handleMinusCount = (quantity: string, Id: string) => {
        if (parseInt(quantity) > 0) {
            if (inputRef?.current?.isFocused()) {
                inputRef.current.blur()
            }
            const minusCount = parseInt(quantity) - 1
            handleEditQuantity(minusCount + '', Id)
        }
    }

    const handleAddCount = (quantity: string, Id: string) => {
        if (parseInt(quantity || '0') < MAX_NUM) {
            if (inputRef?.current?.isFocused()) {
                inputRef.current.blur()
            }
            const addCount = parseInt(quantity || '0') + 1
            handleEditQuantity(addCount + '', Id)
        }
    }

    return useMemo(() => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setIsExpandOnPress(true)
                        setIsExpandRef?.current(groupName)
                    }}
                >
                    <View
                        style={[
                            styles.height_42,
                            styles.paddingHorizontal_22,
                            styles.fullWidth,
                            styles.marginVertical_15
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
                            <View style={[styles.width_p90, { paddingBottom: 5 }]}>
                                <CText style={[styles.font_12_400, styles.colorTitleGray, styles.marginBottom_5]}>
                                    {t.labels.PBNA_MOBILE_PACKAGE}
                                </CText>
                                <View style={[styles.flexRowSpaceBet]}>
                                    <CText style={[styles.font_14_700, styles.maxWidth_230]} numberOfLines={1}>
                                        {groupName}
                                    </CText>
                                </View>
                            </View>
                            <View style={[isExpand ? styles.chevron_up_black : styles.chevron_down_black]} />
                        </View>
                    </View>
                    {!isExpand && <View style={styles.lineBoldGray} />}
                </TouchableOpacity>
                {isExpand && (
                    <>
                        <View style={[styles.paddingHorizontal_22, styles.fullWidth]}>
                            <CText style={[styles.font_12_700, styles.marginVertical_15]}>
                                {`${t.labels.PBNA_MOBILE_PRODUCT_INFO.toUpperCase()} (${products.length})`}
                            </CText>
                            <View style={styles.lineBold} />
                        </View>
                        <View>
                            {products.map((product, index) => {
                                return (
                                    <View
                                        key={product.Id}
                                        style={[
                                            styles.productItem,
                                            index !== products.length - 1 && styles.borderBottomStyle
                                        ]}
                                    >
                                        <View
                                            style={[styles.fullWidth, styles.flexDirectionRow, styles.alignItemsCenter]}
                                        >
                                            <Image style={styles.size_60} source={ImageSrc.IMG_NO_INNOVATION_PRODUCT} />
                                            <View
                                                style={[
                                                    styles.marginLeft10,
                                                    isSelect ? styles.maxWidth_190 : styles.flexShrink_1
                                                ]}
                                            >
                                                <CText
                                                    style={[styles.font_14_700, styles.lineHeight_20]}
                                                    numberOfLines={1}
                                                >
                                                    {product.Sub_Brand__c}
                                                </CText>
                                                <View
                                                    style={[
                                                        styles.flexDirectionRow,
                                                        styles.alignItemsCenter,
                                                        styles.marginTop_5
                                                    ]}
                                                >
                                                    <CText style={[styles.font_12_700]}>{product.ProductCode}</CText>
                                                    <View style={[styles.vLine]} />
                                                    <CText style={[styles.font_12_400]}>
                                                        {product.Material_Unique_ID__c}
                                                    </CText>
                                                </View>
                                                {product.isNeedsAuth && renderNeedsAuthPill(true)}
                                            </View>
                                            {isSelect && (
                                                <MinusAddButton
                                                    minus={handleMinusCount}
                                                    add={handleAddCount}
                                                    edit={handleEditQuantity}
                                                    product={product}
                                                    inputRef={inputRef}
                                                />
                                            )}
                                        </View>
                                    </View>
                                )
                            })}
                        </View>

                        <View style={styles.lineBoldGray} />
                    </>
                )}
            </View>
        )
    }, [item, item.products])
}
