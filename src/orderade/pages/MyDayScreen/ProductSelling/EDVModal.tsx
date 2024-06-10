import { View, StyleSheet } from 'react-native'
import { Button, Input } from 'react-native-elements'
import CText from '../../../../common/components/CText'
import React, { useRef, useState } from 'react'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { t } from '../../../../common/i18n/t'
import CCheckBox from '../../../../common/components/CCheckBox'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { wholeOrDecimalNumber } from '../../../../common/helpers/NumberHelper'
import _ from 'lodash'
import { DefaultNumber } from '../../../enum/Common'
import { ellipsis } from '../../../utils/PriceUtils'

interface EDVParams {
    qty: any
    price: any
    handlePressConfirm: Function
    closeEDVPopup: any
}
const styles = StyleSheet.create({
    ...commonStyle,
    EDVModalView: {
        backgroundColor: 'white',
        height: 287,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 8
    },
    tableRowInput: {
        paddingRight: 0,
        width: 70,
        height: 40,
        borderColor: baseStyle.color.tabBlue,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white
    },
    priceInput: {
        paddingRight: 0,
        borderRadius: 6,
        width: 50,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white
    },
    borderBottomColor0: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },
    tableRowInputStyle: {
        fontSize: 12,
        height: 40,
        fontWeight: '700'
    },
    EDVModalBottomButtonView: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    disableTitleColor: {
        color: '#D3D3D3'
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    shadowButton: {
        width: '50%',
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    halfLayout: {
        width: '50%'
    },
    bottomButton: {
        backgroundColor: 'white',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    smallFontSize: {
        fontSize: 14
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    textAlign: {
        textAlign: 'center'
    },
    borderRightShadow: {
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack
    },
    buttonPositionAbsolute: {
        position: 'absolute',
        bottom: 0
    },
    buttonPositionRelative: {
        position: 'relative'
    },
    bottomLeftRadius: {
        borderBottomLeftRadius: 8
    },
    bottomRightRadius: {
        borderBottomRightRadius: 8
    },
    EDVModalViewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24
    },
    EDVModalViewTitleView: {
        marginTop: 39,
        marginBottom: 20
    },
    EDVModalViewInput: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    EDVModalViewInputFor: {
        marginHorizontal: 10
    },
    EDVModalViewInputDollar: {
        color: baseStyle.color.liteGrey,
        marginLeft: 10
    },
    EDVModalViewPriceView: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: baseStyle.color.tabBlue,
        borderRadius: 6
    },
    EDVModalViewAllApplyView: {
        height: 60,
        backgroundColor: baseStyle.color.bgGray,
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },
    EDVModalViewAllApplyCheckBox: {
        backgroundColor: baseStyle.color.bgGray
    },
    EDVModalViewAllApplyCheckBoxText: {
        fontSize: 14,
        fontWeight: baseStyle.fontWeight.fw_400,
        width: '80%'
    }
})
const EDVModal = (props: EDVParams) => {
    const { qty, price, handlePressConfirm, closeEDVPopup } = props
    const [currentQty, setCurrentQty] = useState(qty || '')
    const [displayQty, setDisplayQty] = useState(ellipsis(qty.toString(), 4) || '')
    const [currentPrice, setCurrentPrice] = useState((price && Number(price).toString()) || '')
    const [applyAll, setApplyAll] = useState(false)
    const inputQty = useRef(null)
    return (
        <View style={styles.EDVModalView}>
            <View style={styles.EDVModalViewTitleView}>
                <CText style={styles.EDVModalViewTitle}>
                    {t.labels.PBNA_MOBILE_INPUT_OR_ADJUST_EDV_EVERYDAY_VALUE_PRICE.replace('{space}', '\n')}
                </CText>
            </View>
            <View style={styles.EDVModalViewInput}>
                <Input
                    ref={inputQty}
                    maxLength={8}
                    onBlur={() => {
                        setCurrentQty(displayQty)
                        setDisplayQty(ellipsis(displayQty.toString(), 4))
                    }}
                    onFocus={() => setDisplayQty(currentQty)}
                    containerStyle={styles.tableRowInput}
                    returnKeyType="done"
                    keyboardType="number-pad"
                    textAlign="center"
                    inputContainerStyle={styles.borderBottomColor0}
                    inputStyle={styles.tableRowInputStyle}
                    value={displayQty.toString()}
                    onChangeText={(text: any) => {
                        let final = parseInt(text.replace(/\D/g, ''))
                        if (isNaN(final) || final <= 0) {
                            final = 0
                        }
                        setDisplayQty(final)
                    }}
                />
                <CText style={styles.EDVModalViewInputFor}>{t.labels.PBNA_MOBILE_FOR}</CText>
                <View style={styles.EDVModalViewPriceView}>
                    <CText style={styles.EDVModalViewInputDollar}>{DefaultNumber.dollar}</CText>
                    <Input
                        maxLength={currentPrice && currentPrice.includes('.') ? 5 : 4}
                        containerStyle={styles.priceInput}
                        returnKeyType="done"
                        keyboardType="decimal-pad"
                        textAlign="center"
                        inputContainerStyle={styles.borderBottomColor0}
                        inputStyle={styles.tableRowInputStyle}
                        value={currentPrice}
                        onChangeText={(text: any) => {
                            if (_.isEmpty(text) || wholeOrDecimalNumber.test(text)) {
                                if (/^0+/.test(text)) {
                                    setCurrentPrice(text.replace(/^0+/, '0'))
                                } else {
                                    setCurrentPrice(text)
                                }
                            }
                        }}
                    />
                </View>
            </View>
            <View style={styles.EDVModalViewAllApplyView}>
                <CCheckBox
                    containerStyle={styles.EDVModalViewAllApplyCheckBox}
                    textStyle={styles.EDVModalViewAllApplyCheckBoxText}
                    checked={applyAll}
                    onPress={() => setApplyAll(!applyAll)}
                    title={t.labels.PBNA_MOBILE_APPLY_TO_ALL_SKUS_IN_THIS_PACKAGE_GROUP}
                />
            </View>
            <View style={styles.EDVModalBottomButtonView}>
                <View style={[styles.shadowButton]}>
                    <Button
                        onPress={closeEDVPopup}
                        title={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                        titleStyle={[styles.fontFamily, styles.fontPurpleColor, styles.smallFontSize]}
                        buttonStyle={[
                            styles.buttonSize,
                            styles.bgWhiteColor,
                            styles.borderRightShadow,
                            styles.bottomLeftRadius
                        ]}
                        containerStyle={styles.buttonSize}
                        disabledStyle={styles.bgWhiteColor}
                        disabledTitleStyle={styles.disableTitleColor}
                    />
                </View>
                <View style={[styles.shadowButton]}>
                    <Button
                        onPress={() => {
                            handlePressConfirm(
                                Number(inputQty.current.input.isFocused() ? displayQty : currentQty),
                                Number(currentPrice),
                                applyAll
                            )
                            closeEDVPopup()
                        }}
                        title={t.labels.PBNA_MOBILE_ADD.toLocaleUpperCase()}
                        titleStyle={[styles.fontFamily, styles.fontWhiteColor, styles.smallFontSize]}
                        disabled={!currentPrice}
                        containerStyle={styles.buttonSize}
                        disabledStyle={styles.bgWhiteColor}
                        disabledTitleStyle={styles.disableTitleColor}
                        buttonStyle={[styles.bgPurpleColor, styles.buttonSize, styles.bottomRightRadius]}
                    />
                </View>
            </View>
        </View>
    )
}
export default EDVModal
