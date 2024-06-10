/*
 * @Description:WorkOrderProduct
 * @Author: Mary Qian
 * @Date: 2021-08-19 03:26:22
 * @LastEditTime: 2023-11-20 16:21:09
 * @LastEditors: Mary Qian
 */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../common/components/CText'
import { workOrderStyles } from './WorkOrderStyle'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    ...workOrderStyles,
    productView: {
        flex: 1
    },
    headerStyle: {
        width: '100%',
        paddingBottom: 10,
        paddingTop: 25,
        borderColor: '#000',
        borderBottomWidth: 1
    },
    headerTextStyle: {
        fontSize: 12,
        fontWeight: '700',
        borderBottomColor: '#000000',
        textTransform: 'uppercase'
    },
    productContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    productWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        marginRight: 10
    },
    RtlQtyWrapper: {
        flex: 1,
        marginRight: 10
    },
    priceWrapper: {
        width: '42%'
    },
    splitLine: {
        borderRightColor: '#D3D3D3',
        borderRightWidth: 1
    },
    verticalLine: {
        alignSelf: 'center',
        marginLeft: 5,
        marginRight: 6,
        width: 1,
        height: 10,
        backgroundColor: '#D3D3D3'
    },
    displayQtyWrapper: {
        width: '16%'
    },
    boldStyle: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15
    },
    underLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    productStyle: {
        paddingTop: 4,
        paddingBottom: 0,
        fontWeight: '700',
        fontSize: 16
    }
})

const WorkOrderProduct = (props: any) => {
    const isForTimeline = props.isForTimeline
    const [products, setProducts] = useState([])

    useEffect(() => {
        if (props.workOrder && props.workOrder.promotion_product) {
            setProducts(props.workOrder.promotion_product)
        } else {
            setProducts([])
        }
    }, [props])

    const renderQty = (title: string, quantity: any) => {
        return (
            <CText style={styles.labelStyle} numberOfLines={1}>
                {title}&nbsp;
                <CText style={styles.qtyValue} numberOfLines={1}>
                    {quantity}
                </CText>
            </CText>
        )
    }

    const renderProduct = (flavor) => {
        return (
            <View style={[styles.underLine, styles.productContainer, { width: '100%' }]} key={flavor.id}>
                <CText style={[styles.flavorName, { width: flavor.isPromotion ? '40%' : '75%' }]} numberOfLines={1}>
                    {flavor.name}
                </CText>
                {flavor.isPromotion && (
                    <View style={styles.productWrapper}>
                        <View style={[styles.RtlQtyWrapper, styles.splitLine]}>
                            {renderQty(t.labels.PBNA_MOBILE_REAL_QTY, flavor.RET_QUANTITY__c)}
                        </View>
                        <View style={[styles.priceWrapper, styles.splitLine]}>
                            <CText style={styles.qtyValue} numberOfLines={1}>
                                {flavor.RET_PRICE__c}
                            </CText>
                        </View>
                    </View>
                )}
                <View style={styles.displayQtyWrapper}>
                    {renderQty(t.labels.PBNA_MOBILE_QTY, flavor.DISPLAY_QUANTITY__c)}
                </View>
            </View>
        )
    }

    const renderProductForTimeline = (flavor) => {
        return (
            <View style={[styles.underLine, styles.rowWithCenter, styles.timelineProductContainer]} key={flavor.id}>
                <View style={commonStyle.flex_1}>
                    <CText style={[styles.flavorName, { width: '100%' }]} numberOfLines={1}>
                        {flavor.name}
                    </CText>

                    <View style={styles.timelineProductValueContainer}>
                        {flavor.isPromotion && (
                            <View style={commonStyle.flexDirectionRow}>
                                {renderQty(t.labels.PBNA_MOBILE_REAL_QTY, flavor.RET_QUANTITY__c)}
                                <View style={styles.verticalLine} />
                                <CText style={[styles.qtyValue]} numberOfLines={1}>
                                    {flavor.RET_PRICE__c}
                                </CText>
                                <View style={styles.verticalLine} />
                            </View>
                        )}
                        <View>{renderQty(t.labels.PBNA_MOBILE_QTY, flavor.DISPLAY_QUANTITY__c)}</View>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.productView}>
            <View style={styles.headerStyle}>
                <CText style={styles.headerTextStyle}>{t.labels.PBNA_MOBILE_PROD_INFO}</CText>
            </View>
            {products?.map((prod) => {
                return (
                    <View key={prod.PACKAGING__c}>
                        <View style={styles.rowWithCenter}>
                            <View style={[styles.propertyStyle, { width: '100%', paddingTop: 20 }]}>
                                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_PACKAGE}</CText>
                                <CText style={[styles.boldValueStyle, styles.productStyle]} numberOfLines={1}>
                                    {prod.PACKAGING__c}
                                </CText>
                            </View>
                        </View>

                        <View style={[styles.rowWithCenter, { flexDirection: 'column' }]}>
                            {prod?.flavorList?.map((flavor: any) => {
                                return isForTimeline ? renderProductForTimeline(flavor) : renderProduct(flavor)
                            })}
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

export default WorkOrderProduct
