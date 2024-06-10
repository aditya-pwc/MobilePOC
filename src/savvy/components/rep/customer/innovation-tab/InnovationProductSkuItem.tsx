/**
 * @description Display Sku Item in Product Detail Page
 * @author Kawai Hung
 * @date 2021-11-03
 * @Lase
 */

import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import { t } from '../../../../../common/i18n/t'
import { useGTINsMap, useBarCodeMap } from '../../../../hooks/InnovationProductHooks'
import moment from 'moment'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface InnovationProductSkuItemProps {
    item: any
    accessToken: any
    spStatus: any
    snoozeModal?: boolean
    onPress?: any
}

const style = StyleSheet.create({
    container: {
        minHeight: 70,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingBottom: 10,
        paddingHorizontal: '5%'
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6
    },
    mandatedLogo: {
        height: 12,
        width: 12,
        backgroundColor: '#2DD36F',
        alignItems: 'center',
        marginLeft: 10,
        marginTop: 2,
        borderRadius: 2
    },
    statusIndicator: {
        height: 20,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    orderedIndicator: {
        minWidth: 79,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#2DD36F',
        paddingHorizontal: 5
    },
    deliveredIndicator: {
        minWidth: 50,
        backgroundColor: '#2DD36F',
        paddingHorizontal: 10
    },
    reorderIndicator: {
        minWidth: 82,
        paddingHorizontal: 10,
        backgroundColor: '#FFC409'
    },
    indicatorFont: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    skuLeftContainer: {
        flexDirection: 'column',
        width: '75%',
        justifyContent: 'center',
        minHeight: 70,
        paddingVertical: 15
    },
    line: {
        color: '#D3D3D3',
        fontSize: 12
    },
    invenText: {
        fontWeight: '400',
        color: '#000000',
        fontSize: 12,
        fontFamily: 'Gotham'
    },
    logoText: {
        fontSize: 10,
        color: '#FFFFFF',
        lineHeight: 12
    },
    productCode: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    productCodeBlack: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000000'
    },
    productInfo: {
        minHeight: 60,
        marginTop: 10,
        paddingRight: 3
    },
    width70: {
        width: '70%'
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '700'
    },
    minHeight15: {
        minHeight: 15
    },
    productPackage: {
        alignItems: 'center',
        marginTop: 3,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    productPackageText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    ltoAction: {
        minHeight: 15,
        marginTop: 3,
        width: '30%',
        alignItems: 'flex-end'
    },
    ltoText: {
        fontSize: 12,
        fontWeight: '700'
    },
    minHeight20: {
        minHeight: 20
    },
    fontSize12: {
        fontSize: 12
    },
    dateText: {
        fontSize: 12,
        color: '#565656'
    },
    icon: {
        width: 13,
        height: 13,
        marginLeft: 5
    },
    fastImage: {
        flexDirection: 'row',
        minHeight: 60,
        alignItems: 'center',
        marginTop: 10
    },
    label: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})

const InnovationProductSkuItem = (props: InnovationProductSkuItemProps) => {
    const { item, accessToken, spStatus, onPress, snoozeModal } = props

    const GTINsMap = useGTINsMap()

    const GTINsBarCodeMap = useBarCodeMap()

    const renderMandated = (itemEle) => {
        if (itemEle.Mandated_Sell__c === '1') {
            return (
                <View style={style.mandatedLogo}>
                    <CText style={style.logoText}>{t.labels.PBNA_MOBILE_IP_M}</CText>
                </View>
            )
        }
        return null
    }

    const productAvailabilityBackground = () => {
        if (item.Product_Availability__c === '0' && !snoozeModal) {
            return {
                backgroundColor: '#F2F6F9'
            }
        }
        return {
            backgroundColor: '#FFF'
        }
    }

    const productAvailabilityTextColor = () => {
        if (item.Product_Availability__c === '0' && !snoozeModal) {
            return {
                color: '#565656'
            }
        }
        return {}
    }
    const handlePressItem = () => {
        if (item.Product_Availability__c === '0') {
            Alert.alert(
                t.labels.PBNA_MOBILE_IP_PRODUCT_UNAVAILABLE_TITLE,
                '\n' + t.labels.PBNA_MOBILE_IP_PRODUCT_UNAVAILABLE_MSG,
                [{ text: 'OK' }]
            )
        }
    }
    const spaceFormatter = (text: string) => {
        if (text) {
            return text.replace(/ /g, '\u00a0')
        }
    }

    const dateDisplay = () => {
        if (item.Status__c === 'No Sale' && item.Date_Of_No_Sale__c) {
            return moment(item.Date_Of_No_Sale__c).format('MMM DD, YYYY') + ''
        } else if (item.Status__c === 'Snoozed' && item.Date_Of_Wake__c) {
            return moment(item.Date_Of_Wake__c).format('MMM DD, YYYY') + ''
        }
    }

    const renderInvenId = (skuItem: any) => {
        if (!skuItem['Product.Material_Unique_ID__c']) {
            return null
        }
        return (
            <CText style={style.line}>
                {' '}
                |<CText style={style.invenText}>{' ' + spaceFormatter(skuItem['Product.Material_Unique_ID__c'])}</CText>
            </CText>
        )
    }
    const renderUPC = (skuItem: any) => {
        if (GTINsBarCodeMap && GTINsBarCodeMap[skuItem['Product.GTIN__c']] && !snoozeModal) {
            return (
                <TouchableOpacity
                    onPress={() =>
                        onPress(
                            skuItem['Product.GTIN__c'],
                            skuItem['Product.ProductCode'],
                            skuItem.Product_Availability__c,
                            skuItem['Product.Material_Unique_ID__c']
                        )
                    }
                >
                    <CText style={style.productCode}>{spaceFormatter(skuItem['Product.ProductCode'])}</CText>
                </TouchableOpacity>
            )
        }
        return <CText style={style.productCodeBlack}>{spaceFormatter(skuItem['Product.ProductCode'])}</CText>
    }

    const marginLeft = () => {
        if (snoozeModal) {
            return { marginLeft: 0 }
        }
        return { marginLeft: 10 }
    }

    return (
        <TouchableOpacity style={productAvailabilityBackground()} onPress={handlePressItem} activeOpacity={1}>
            <View style={[style.container, snoozeModal ? {} : { borderBottomColor: '#D3D3D3', borderBottomWidth: 1 }]}>
                <View style={[style.fastImage, snoozeModal ? {} : { width: 60 }]}>
                    {GTINsMap[item['Product.GTIN__c']] && !snoozeModal && (
                        <FastImage
                            source={{
                                uri: GTINsMap[item['Product.GTIN__c']],
                                headers: {
                                    Authorization: accessToken,
                                    accept: 'image/png'
                                },
                                cache: FastImage.cacheControl.web
                            }}
                            style={style.image}
                            resizeMode={'contain'}
                        />
                    )}
                    {!GTINsMap[item['Product.GTIN__c']] && !snoozeModal && (
                        <Image
                            style={style.image}
                            source={require('../../../../../../assets/image/No_Innovation_Product.png')}
                        />
                    )}
                </View>
                <View style={[style.productInfo, snoozeModal ? { width: '100%' } : { width: '85%' }]}>
                    <View style={[style.label, marginLeft()]}>
                        <View style={style.width70}>
                            <CText style={[style.productTitle, productAvailabilityTextColor()]}>
                                {spaceFormatter(item['Product.Formatted_Flavor__c'] || item['Product.Sub_Brand__c'])}
                            </CText>
                        </View>
                        <View style={style.minHeight15} />
                    </View>
                    <View style={[style.productPackage, marginLeft()]}>
                        <View style={style.width70}>
                            <CText style={style.productPackageText}>
                                {spaceFormatter(
                                    item['Product.Formatted_Package__c'] || item['Product.Package_Type_Name__c']
                                )}
                            </CText>
                        </View>
                        <View style={style.ltoAction}>
                            {item['Product.LTO__c'] === '1' && (
                                <CText style={style.ltoText}>{t.labels.PBNA_MOBILE_IP_LTO}</CText>
                            )}
                        </View>
                    </View>
                    <View style={[style.productPackage, style.minHeight20, marginLeft()]}>
                        <View style={commonStyle.flexRowAlignCenter}>
                            {renderUPC(item)}
                            {renderInvenId(item)}
                            {renderMandated(item)}
                        </View>
                        <View style={style.minHeight20}>
                            {spStatus[item['Product.ProductCode']] &&
                                spStatus[item['Product.ProductCode']].isOrdered && (
                                    <View style={[style.orderedIndicator, style.statusIndicator]}>
                                        <CText style={[style.indicatorFont, { color: '#2DD36F' }]}>
                                            {t.labels.PBNA_MOBILE_IP_ORDERED}
                                        </CText>
                                    </View>
                                )}
                            {spStatus[item['Product.ProductCode']] &&
                                spStatus[item['Product.ProductCode']].isDelivered &&
                                !spStatus[item['Product.ProductCode']].wksCS && (
                                    <View style={[style.deliveredIndicator, style.statusIndicator]}>
                                        <CText style={[style.indicatorFont, { color: '#FFFFFF' }]}>
                                            {t.labels.PBNA_MOBILE_IP_DELIVERED}
                                        </CText>
                                    </View>
                                )}
                            {spStatus[item['Product.ProductCode']] && spStatus[item['Product.ProductCode']].wksCS && (
                                <View style={[style.reorderIndicator, style.statusIndicator]}>
                                    <CText style={[style.indicatorFont, { color: '#000000' }]}>
                                        {t.labels.PBNA_MOBILE_IP_REORDER}
                                    </CText>
                                </View>
                            )}
                        </View>
                    </View>
                    <View
                        style={[
                            commonStyle.flexRowSpaceCenter,
                            snoozeModal ? { paddingTop: 6 } : { paddingTop: 6, marginLeft: 10 }
                        ]}
                    >
                        <View>
                            {item.Vol_11_WTD__c && (
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={style.fontSize12}>11wks - WTD Vol </CText>
                                    <CText style={[style.ltoText, item.Vol_11_WTD__c < 0 ? { color: '#EB445A' } : {}]}>
                                        {parseInt(item.Vol_11_WTD__c).toLocaleString('en-US') + ' cs'}
                                    </CText>
                                </View>
                            )}
                        </View>
                        {(item.Status__c === 'No Sale' || item.Status__c === 'Snoozed') && (
                            <View style={commonStyle.flexRowAlignCenter}>
                                <CText style={style.dateText}>{dateDisplay()}</CText>
                                <Image
                                    style={style.icon}
                                    source={
                                        item.Status__c === 'No Sale'
                                            ? require('../../../../../../assets/image/icon_no_sale.png')
                                            : require('../../../../../../assets/image/icon_snooze.png')
                                    }
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default InnovationProductSkuItem
