/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-18 17:20:35
 * @LastEditTime: 2024-01-11 15:50:54
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import NonDisplayPromotionService from '../../service/NonDisplayPromotionService'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import UpDownArrow from './UpDownArrow'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const PADDING_HORIZONTAL = 23

const styles = StyleSheet.create({
    nonDisplayPromotionContainer: {
        flexDirection: 'column',
        marginTop: 20,
        width: '100%',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#D3D3D3'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: PADDING_HORIZONTAL,
        height: 70,
        backgroundColor: '#FFF'
    },
    titleText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 18
    },
    promotionContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 20,
        width: '100%',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        backgroundColor: '#FFF'
    },
    promotionInfoWrapper: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 6,
        backgroundColor: '#fff'
    },
    promotionName: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 20
    },
    separateLine: {
        color: '#D3D3D3'
    },
    promotionInfoText: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 20
    },
    promotionDateText: {
        color: '#000'
    },
    packageInfoView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        height: 40
    },
    packageItemView: {
        width: '50%'
    },
    packageHint: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16
    },
    packageName: {
        marginTop: 4,
        marginRight: 10,
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 20
    },
    brandContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    brandName: {
        flex: 1,
        marginRight: 10,
        color: '#565656',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20
    },
    brandPrice: {
        maxWidth: 120,
        textAlign: 'right',
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 20
    },
    bottomSpaceView: {
        height: 17,
        width: '100%',
        backgroundColor: 'transparent'
    },
    width56: { width: '56%' },
    marginTop23: { marginTop: 23 }
})

const PromotionBox = (props: any) => {
    const [isExpand, setIsExpand] = useState(false)

    const { promotion } = props
    const promotionInfo = promotion.promotionInfo

    const renderProducts = (products) => {
        return (
            <View>
                {products.map((item) => {
                    const { name, price } = item.packageInfo

                    return (
                        <View key={name}>
                            <View style={styles.packageInfoView}>
                                <View style={styles.width56}>
                                    <CText style={styles.packageHint}>{t.labels.PBNA_MOBILE_PACKAGE}</CText>
                                    <CText style={styles.packageName} numberOfLines={1} ellipsizeMode="tail">
                                        {name}
                                    </CText>
                                </View>

                                <View style={commonStyle.flex_1}>
                                    <CText style={styles.packageHint}>{t.labels.PBNA_MOBILE_REAL_PRICE} </CText>
                                    <CText style={styles.packageName}>{price}</CText>
                                </View>
                            </View>
                            {item.brandArray.map((product) => {
                                return (
                                    <View style={styles.brandContainer} key={product.Id}>
                                        <CText style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
                                            {product.name}
                                        </CText>
                                        <CText style={styles.brandPrice} numberOfLines={1} ellipsizeMode="tail">
                                            {product.priceText}
                                        </CText>
                                    </View>
                                )
                            })}
                        </View>
                    )
                })}
                {products.length > 0 && <View style={styles.bottomSpaceView} />}
            </View>
        )
    }

    return (
        <View style={styles.promotionContainer}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                    setIsExpand(!isExpand)
                }}
            >
                <View style={commonStyle.flexRowSpaceBet}>
                    <View style={styles.promotionInfoWrapper}>
                        <CText style={styles.promotionName} numberOfLines={2} ellipsizeMode="tail">
                            {promotionInfo.name}
                        </CText>
                        <CText style={styles.promotionInfoText}>{promotionInfo.priceText}</CText>

                        <CText style={[styles.promotionInfoText]}>
                            <CText style={[styles.promotionDateText]}>{promotionInfo.startDate} </CText>
                            {t.labels.PBNA_MOBILE_TO.toLowerCase()}
                            <CText style={[styles.promotionDateText]}> {promotionInfo.endDate} </CText>
                            <CText style={[styles.separateLine]}>|</CText> {t.labels.PBNA_MOBILE_SHIP_DATE}
                            <CText style={[styles.promotionDateText]}> {promotionInfo.deliveryDate}</CText>
                        </CText>
                    </View>

                    <UpDownArrow style={styles.marginTop23} isExpand={isExpand} />
                </View>
            </TouchableOpacity>
            {isExpand && renderProducts(promotion.products)}
        </View>
    )
}

interface NonDisplayPromotionProps {
    accountId
    onDataLoaded?: (isSuccess: boolean) => void
    isOnline?
}

const NonDisplayPromotion = (props: NonDisplayPromotionProps) => {
    const { accountId, isOnline, onDataLoaded } = props
    const [promotionData, setPromotionData] = useState([])
    const [isExpand, setIsExpand] = useState(false)

    const fetchListData = async () => {
        try {
            const res = await NonDisplayPromotionService.getAllData(accountId, isOnline)
            setPromotionData(res)
            onDataLoaded && onDataLoaded(true)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'NonDisplayPromotion', ErrorUtils.error2String(error))
            onDataLoaded && onDataLoaded(false)
        }
    }

    useEffect(() => {
        fetchListData()
    }, [])

    const renderNonDisplayPromotions = () => {
        if (!promotionData || promotionData.length === 0) {
            return (
                <View style={[styles.nonDisplayPromotionContainer, { borderBottomWidth: 1 }]}>
                    <View style={styles.titleContainer}>
                        <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_NON_DIS_PROMOTIONS}</CText>
                    </View>
                </View>
            )
        }

        return (
            <View>
                <View style={[styles.nonDisplayPromotionContainer, { borderBottomWidth: isExpand ? 0 : 1 }]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                            setIsExpand(!isExpand)
                        }}
                    >
                        <View style={styles.titleContainer}>
                            <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_NON_DIS_PROMOTIONS}</CText>
                            <UpDownArrow isExpand={isExpand} />
                        </View>
                    </TouchableOpacity>

                    {isExpand &&
                        promotionData.map((promotion) => {
                            const promotionInfo = promotion.promotionInfo
                            return <PromotionBox key={promotionInfo.name} promotion={promotion} />
                        })}
                </View>
            </View>
        )
    }

    return renderNonDisplayPromotions()
}

export default NonDisplayPromotion
