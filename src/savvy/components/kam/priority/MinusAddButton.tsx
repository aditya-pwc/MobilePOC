import React from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'

interface MinusAddButtonProps extends React.PropsWithChildren {
    minus: Function
    add: Function
    edit: Function
    product: any
    inputRef: any
}

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
    }
})

export const MinusAddButton: React.FC<MinusAddButtonProps> = ({ minus, add, edit, product, inputRef }) => {
    return (
        <View style={[styles.flexDirectionColumn, styles.alignCenter, styles.marginLeft_Auto]}>
            <View style={styles.flexRowAlignCenter}>
                <TouchableOpacity
                    style={[styles.alignCenter, styles.height_40]}
                    onPress={() => {
                        minus(product.quantity, product.Id)
                    }}
                >
                    <View style={[styles.size_24, styles.alignCenter, styles.relativePosition]}>
                        <View style={styles.minusBtn} />
                    </View>
                </TouchableOpacity>
                <View style={[styles.justifyContentEnd, styles.alignItemsCenter, styles.quantityInputWrap]}>
                    <View style={[styles.relativePosition, styles.marginBottom_5]}>
                        <CText style={styles.quantityUnitText}>{t.labels.PBNA_MOBILE_QTY}</CText>
                    </View>
                    <View style={[styles.quantityInput, styles.fullHeight, styles.fullWidth]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, styles.font_16_700, styles.fullHeight, styles.fullWidth]}
                            keyboardType={'numeric'}
                            maxLength={3}
                            placeholderTextColor={'#000'}
                            editable
                            selectTextOnFocus
                            returnKeyType={'done'}
                            onChangeText={(text = '') => {
                                const numInput = (parseInt(text.replace('.', '')) || '') + ''
                                if (numInput === '') {
                                    edit('0', product.Id)
                                } else {
                                    edit(numInput, product.Id)
                                }
                            }}
                            onBlur={() => {
                                if (product.Id === '') {
                                    edit('0', product.Id)
                                }
                            }}
                            value={`${product.quantity}` || '0'}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.alignCenter, styles.height_40]}
                    onPress={() => add(product.quantity, product.Id)}
                >
                    <View style={[styles.alignCenter, styles.size_24, styles.relativePosition]}>
                        <View style={[styles.plusBtn1, styles.absolutePosition]} />
                        <View style={[styles.plusBtn2, styles.absolutePosition]} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}
