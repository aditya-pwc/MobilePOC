/**
 * @description Pepsi Direct Order Detail Modal
 * @author Sheng Huang
 * @date 2023-03-08
 */

import React, { FC, useEffect, useState } from 'react'
import { Image, Route, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { NavigationProp } from '@react-navigation/native'
import CustomerListTile from '../CustomerListTile'
import { useSelector } from 'react-redux'
import { usePDOrderDetail } from '../../../../hooks/CustomerHooks'
import moment from 'moment'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import _ from 'lodash'
import CollapseContainer from '../../../common/CollapseContainer'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface PepsiDirectOrderDetailProps {
    route: Route
    navigation: NavigationProp<any>
}

const styles = StyleSheet.create({
    ...commonStyle,
    distributionPointModal: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f7'
    },
    titleContainer: {
        paddingHorizontal: 22,
        paddingVertical: 22
    },
    sumView: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 22,
        marginTop: 50
    },
    visitCardContain: {
        marginTop: -70,
        marginHorizontal: 22
    },
    lineContainer: {
        flexDirection: 'row',
        marginTop: 30,
        width: '100%'
    },
    infoBody: {
        width: '50%',
        paddingRight: 20
    },
    infoLabel: {
        fontSize: 13,
        overflow: 'hidden',
        fontWeight: '300',
        color: 'grey'
    },
    infoValue: {
        fontSize: 18,
        overflow: 'hidden',
        fontWeight: 'bold',
        color: 'black',
        marginTop: 8
    },
    showAllContainer: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 22
    },
    showAllText: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10,
        fontFamily: 'Gotham-Bold'
    },
    lineItemTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 10
    },
    collapseContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 22
    },
    invoiceContainer: {
        paddingHorizontal: 22
    },
    lineStyle: {
        width: '100%',
        height: 1,
        backgroundColor: 'black',
        marginTop: 10
    },
    splitLineStyle: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3',
        marginTop: 22
    },
    productInfoContainer: {
        height: 80,
        marginHorizontal: 22,
        marginTop: 22
    },
    productInfoLineContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    collapseTitleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between'
    },
    backgroundStyle: {
        backgroundColor: 'white',
        flex: 1
    },
    infoContainer: {
        paddingHorizontal: 22,
        paddingBottom: 22
    },
    collapseTitle: {
        flexDirection: 'row',
        width: '85%',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    collapseTitleLeft: {
        flexDirection: 'column',
        flexGrow: 1,
        flexBasis: 0
    },
    collapseTitleRight: {
        textAlign: 'left',
        height: '100%',
        marginLeft: 5,
        width: '25%'
    }
})

const PepsiDirectOrderDetail: FC<PepsiDirectOrderDetailProps> = (props: PepsiDirectOrderDetailProps) => {
    const { route, navigation } = props
    const orderId = route?.params?.orderId
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const { orderDetail, lineItems } = usePDOrderDetail(orderId)
    const [showCollapse, setShowCollapse] = useState<Array<boolean>>([])
    const [showAll, setShowAll] = useState<boolean>(false)

    const onClose = () => {
        navigation.goBack()
    }

    useEffect(() => {
        if (!_.isEmpty(lineItems)) {
            const tempCollapseState: Array<boolean> = []
            _.keys(lineItems).forEach(() => {
                tempCollapseState.push(false)
            })
            setShowCollapse(tempCollapseState)
        }
    }, [lineItems])

    useEffect(() => {
        let allState: boolean = false
        showCollapse.forEach((v) => {
            allState = allState || v
        })
        setShowAll(allState)
    }, [showCollapse])

    const extendCollapseAll = () => {
        setShowCollapse((prevState) => {
            const newState: Array<boolean> = []
            prevState.forEach(() => {
                newState.push(!showAll)
            })
            return newState
        })
    }

    const setCollapseState = (state: boolean, index: number) => {
        setShowCollapse((prevState) => {
            const newState = _.cloneDeep(prevState)
            newState[index] = state
            return newState
        })
    }

    // eslint-disable-next-line camelcase
    const renderProductInfo = (
        value: {
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Product2: { Name: string; ProductCode: string; Material_Unique_ID__c: string }
            TotalPrice: number
            Quantity: string
        },
        index: number
    ) => {
        return (
            <View key={index} style={styles.productInfoContainer}>
                <View style={styles.productInfoLineContainer}>
                    <View style={{ maxWidth: '70%' }}>
                        <CText style={styles.infoValue}>{value?.Product2?.Name}</CText>
                        <CText style={styles.infoLabel}>
                            {value?.Product2?.ProductCode}
                            {!_.isEmpty(value?.Product2?.ProductCode) && '/'}
                            {value?.Product2?.Material_Unique_ID__c}
                        </CText>
                    </View>
                    <View>
                        <CText style={[styles.infoValue, { fontSize: 14 }]}>
                            $ {value?.TotalPrice?.toFixed(2)}
                            &nbsp;|&nbsp;
                            <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_QTY}&nbsp;</CText>
                            {value?.Quantity}
                        </CText>
                    </View>
                </View>
                <View style={styles.splitLineStyle} />
            </View>
        )
    }

    const renderCollapse = (value: Array<any>, index: number) => {
        let totalQty = 0
        value.forEach((v) => {
            totalQty += v.Quantity
        })
        return (
            <CollapseContainer
                showContent={showCollapse[index]}
                setShowContent={(state: boolean) => {
                    setCollapseState(state, index)
                }}
                title={value[0]?.Product2?.Package_Type_Name__c}
                titleComponents={
                    <View style={styles.collapseTitle}>
                        <View style={styles.collapseTitleLeft}>
                            <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_PACKAGE}</CText>
                            <CText style={styles.infoValue}>{value[0]?.Product2?.Package_Type_Name__c}</CText>
                        </View>
                        <CText style={[styles.infoLabel, styles.collapseTitleRight]}>
                            {t.labels.PBNA_MOBILE_QTY}&nbsp;
                            <CText style={[styles.infoValue, { fontSize: 14 }]}>
                                {totalQty} {t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}
                            </CText>
                        </CText>
                    </View>
                }
                containerStyle={styles.collapseContainer}
                key={index}
                noBottomLine
            >
                <View style={styles.invoiceContainer}>
                    <CText style={[styles.infoValue, { fontSize: 14 }]}>
                        {t.labels.PBNA_MOBILE_PRODUCT_INFO.toUpperCase()}
                    </CText>
                    <View style={styles.lineStyle} />
                </View>

                {value.map((v, k) => {
                    return renderProductInfo(v, k)
                })}
            </CollapseContainer>
        )
    }

    return (
        <SafeAreaView style={styles.distributionPointModal}>
            <ScrollView style={styles.greyBox}>
                <View style={[styles.titleContainer, styles.rowWithCenter]}>
                    <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_PEPSI_DIRECT}</CText>
                    <TouchableOpacity
                        onPress={() => {
                            onClose()
                        }}
                    >
                        <Image
                            style={styles.iconLarge}
                            source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.sumView}>
                    <View style={styles.visitCardContain}>
                        <CustomerListTile customer={customerDetail} hideAppendage showShadow />
                    </View>
                </View>

                <View style={styles.backgroundStyle}>
                    <View style={styles.infoContainer}>
                        <View style={styles.lineContainer}>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_ORDER_NUMBER}</CText>
                                <CText style={styles.infoValue} numberOfLines={2}>
                                    {orderDetail?.Ordr_Id__c}
                                </CText>
                            </View>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_ORDER_DATE}</CText>
                                <CText style={styles.infoValue}>
                                    {orderDetail?.EffectiveDate
                                        ? moment.utc(orderDetail?.EffectiveDate).format(TIME_FORMAT.MMMDDYYYY)
                                        : '-'}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.lineContainer}>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_ORDER_TIME}</CText>
                                <CText style={styles.infoValue}>
                                    {orderDetail?.EffectiveDate
                                        ? moment.utc(orderDetail.EffectiveDate).format('hh:mm:ss A')
                                        : '-'}
                                </CText>
                            </View>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>
                                <CText style={styles.infoValue}>
                                    {orderDetail?.Dlvry_Rqstd_Dtm__c
                                        ? moment.utc(orderDetail?.Dlvry_Rqstd_Dtm__c).format(TIME_FORMAT.MMMDDYYYY)
                                        : '-'}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.lineContainer}>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_ORDER_QUANTITY}</CText>
                                <CText style={styles.infoValue}>
                                    {orderDetail?.Total_Ordered_IntCount__c?.toString() ||
                                        orderDetail?.Total_Ordered__c?.toString() ||
                                        '-'}{' '}
                                    {t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}
                                </CText>
                            </View>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_TOTAL_AMOUNT}</CText>
                                <CText style={styles.infoValue}>$ {orderDetail?.TotalAmount?.toFixed(2) || '-'}</CText>
                            </View>
                        </View>
                    </View>
                    {!_.isEmpty(lineItems) && (
                        <TouchableOpacity
                            style={styles.showAllContainer}
                            onPress={() => {
                                extendCollapseAll()
                            }}
                        >
                            <CText style={styles.showAllText}>
                                {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                            </CText>
                            <ChevronBlue
                                width={19}
                                height={20}
                                style={{
                                    transform: [{ rotate: showAll ? '0deg' : '180deg' }]
                                }}
                            />
                        </TouchableOpacity>
                    )}
                    {Object.keys(lineItems).map((v, k) => {
                        return renderCollapse(lineItems[v], k)
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PepsiDirectOrderDetail
