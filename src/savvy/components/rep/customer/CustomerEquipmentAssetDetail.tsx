/**
 * @description Screen to show Customer Equipment Detail.
 * @author Pawn
 * @date 2021-11-09
 */
import React, { FC, useMemo, useRef, useState } from 'react'
import { StyleSheet, View, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { useDetailScreenHeaderTabAnimation } from '../../../hooks/AnimationHooks'
import CText from '../../../../common/components/CText'
import moment from 'moment'
import ServiceInformationList from './equipment-tab/ServiceInformationList'
import { t } from '../../../../common/i18n/t'
import { useCommissionStruct, useServiceInformation } from '../../../hooks/EquipmentHooks'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CollapseContainer from '../../common/CollapseContainer'
import _ from 'lodash'
import { addZeroes } from '../../../utils/LeadUtils'
import { NUMBER_FORMATTER } from '../../manager/my-customers/SalesSnapshot/TrendsLineChart/TrendsLineChart'
import { CommonApi } from '../../../../common/api/CommonApi'
import EquipmentImageDisplay from './equipment-tab/EquipmentImageDisplay'

interface CustomerEquipmentAssetDetailProps {
    asset?: any
    isLoading?: boolean
    setDetailPage: (isDetailPage: boolean) => void
    navigation: any
    onClick: Function
}

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width
const ZERO_AMOUNT = '$0.00'

enum SalesPlanCdeEnum {
    REN = 'REN',
    FSR = 'FSR',
    FSV = 'FSV'
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        minHeight: screenHeight / 1.5,
        flexDirection: 'column',
        marginLeft: 20,
        marginRight: 20
    },
    equipmentTitle: {
        // alignItems: 'center',
        marginTop: 35,
        marginLeft: screenWidth / 3
    },
    backArrowContainer: {
        position: 'absolute',
        top: 0,
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
        paddingBottom: 10
    },
    equipmentImage: {
        height: 250,
        width: 200,
        marginTop: 35,
        resizeMode: 'contain'
    },
    equipmentAssetDetailContainer: {
        flexDirection: 'column',
        marginTop: 30
    },
    equipmentFieldLabel: {
        fontSize: 13,
        overflow: 'hidden',
        fontWeight: '300',
        color: 'grey'
        // width: '50%'
    },
    equipmentBody: {
        width: '50%'
    },
    equipmentBodyValue: {
        fontSize: 15,
        overflow: 'hidden',
        color: 'black',
        marginTop: 8
    },
    equipmentAssetInfoLayout: {
        flexDirection: 'row',
        marginTop: 30,
        width: '100%'
    },
    containerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        height: 80
    },
    titleStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        color: 'black'
    },
    backgroundColor_Red: {
        backgroundColor: 'red'
    },
    backArrowContainer2: {
        flexDirection: 'row',
        marginTop: -15,
        height: 30
    },
    hitSlop: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    lineStyle: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3',
        marginTop: 30
    },
    padding: {
        marginBottom: 80
    },
    chevron: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }]
    },
    collapseContainer: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    productLineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        flex: 1
    },
    productAndSelectNumber: {
        flexDirection: 'row',
        flex: 4
    },
    productsLabel: {
        fontSize: 14,
        fontWeight: '700'
    },
    productsValue: {
        fontSize: 15,
        flex: 6,
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center'
    },
    commissionContainer: {
        fontSize: 15,
        width: screenWidth * 0.5,
        marginRight: 10
    },
    commissionValue: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    productValueBold: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center'
    },
    merchRateContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10
    },
    selectNumberContainer: {
        justifyContent: 'center',
        width: 30
    },
    assetNameStyle: {
        fontWeight: 'bold',
        fontSize: 16
    }
})

const CustomerEquipmentAssetDetail: FC<CustomerEquipmentAssetDetailProps> = (
    props: CustomerEquipmentAssetDetailProps
) => {
    const { asset, setDetailPage, onClick } = props
    const scrollYAnimatedValue = useRef(new Animated.Value(0)).current
    const { equipmentLeftChevronColor } = useDetailScreenHeaderTabAnimation(scrollYAnimatedValue)
    const { serviceDraftList, serviceSubmittedList, serviceCancelledList, serviceClosedList, serviceFailedList } =
        useServiceInformation(asset.ident_item_id__c)
    const [showProduct, setShowProduct] = useState(false)
    const [showCommission, setShowCommission] = useState(false)
    const commissionStruct = useCommissionStruct(asset.Id)
    const calcMethod = useMemo(() => {
        return commissionStruct.calcMethod
    }, [commissionStruct])
    const getPercentValue = () => {
        const tierRate = commissionStruct?.assetConfig?.[0]?.tier_rate__c
        if (tierRate !== undefined) {
            return (Number(tierRate) * 100).toFixed(2)
        }

        return '--'
    }

    const renderCommissionTier = (item: any, index: number) => {
        if (index <= 5) {
            const isFinalTier = index === 5
            const revOrQty = calcMethod === '001' ? t.labels.PBNA_MOBILE_QTY_B_C : t.labels.PBNA_MOBILE_REV_B_C
            const leftTierLabel = isFinalTier
                ? `${t.labels.PBNA_MOBILE_FINAL_TIER} ${revOrQty}`
                : `${t.labels.PBNA_MOBILE_MAX_TIER} ${index} ${revOrQty}`
            const qtyValue = item?.tierRate ? addZeroes(item?.tierRate, 9, 2, true) : '--'
            const revValue = item?.tierRate ? Number(item?.tierRate * 100).toFixed(2) : '--'

            return (
                <View style={styles.equipmentAssetInfoLayout} key={index}>
                    <View style={styles.equipmentBody}>
                        <CText style={styles.equipmentFieldLabel}>{leftTierLabel}</CText>
                        <CText numberOfLines={1} style={[styles.equipmentBodyValue]}>
                            {calcMethod === '001'
                                ? `${Number(item?.rangeHighAmount).toFixed(0)}`
                                : `$ ${Number(item?.rangeHighAmount).toFixed(2)}`}
                        </CText>
                    </View>
                    <View style={styles.equipmentBody}>
                        <CText style={styles.equipmentFieldLabel}>
                            {`${t.labels.PBNA_MOBILE_TIER} ${index} ${
                                calcMethod === '001'
                                    ? t.labels.PBNA_MOBILE_AMOUNT_UNIT
                                    : t.labels.PBNA_MOBILE_PERCENTAGE
                            }`}
                        </CText>
                        <CText numberOfLines={1} style={[styles.equipmentBodyValue]}>
                            {calcMethod === '001' ? `$ ${qtyValue}` : `${revValue} %`}
                        </CText>
                    </View>
                </View>
            )
        }
    }

    const renderCommissionVariableByProduct = (item: any, index: number) => {
        const commissionRate = `${
            item?.fsvInvenCommissionRate ? (item.fsvInvenCommissionRate * 100).toFixed(2) : '--'
        } %`
        return (
            <View style={styles.productLineContainer} key={index}>
                <View style={styles.productAndSelectNumber}>
                    <CText style={styles.productValueBold}>{item.selectNum}</CText>
                    <CText style={styles.productsValue}>{item.productName}</CText>
                </View>
                <View style={[styles.merchRateContainer]}>
                    <CText style={styles.productValueBold}>
                        {calcMethod === '001'
                            ? `$ ${Number(item?.fsvInvenCommissionRate).toFixed(2) || '--'}`
                            : commissionRate}
                    </CText>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerStyle}>
                <View style={styles.equipmentTitle}>
                    <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_EQUIPMENT_DETAIL}</CText>
                </View>
                <View style={styles.backgroundColor_Red}>
                    <Animated.View style={styles.backArrowContainer}>
                        <Animated.View style={styles.backArrowContainer2}>
                            <TouchableOpacity
                                onPress={async () => {
                                    setDetailPage(false)
                                }}
                                hitSlop={styles.hitSlop}
                            >
                                <Animated.View
                                    style={[
                                        styles.chevron,
                                        {
                                            borderTopColor: equipmentLeftChevronColor,
                                            borderRightColor: equipmentLeftChevronColor
                                        }
                                    ]}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </View>
            </View>
            <View style={commonStyle.alignItemsCenter}>
                <EquipmentImageDisplay
                    subtypeCde={asset.equip_styp_cde__c}
                    imageStyle={styles.equipmentImage}
                    filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                    equipTypeDesc={asset.equipmentSrc}
                />
            </View>
            <View style={styles.equipmentAssetDetailContainer}>
                <View>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_EQUIPMENT_NAME}</CText>
                    <CText numberOfLines={1} style={[styles.equipmentBodyValue, styles.assetNameStyle]}>
                        {asset.Name ? asset.Name : '-'}
                    </CText>
                </View>
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_EQUIPMENT_TYPE}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.equip_type_desc__c ? asset.equip_type_desc__c : '-'}
                    </CText>
                </View>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_EQUIPMENT_SUB_TYPE}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.equip_styp_desc__c ? asset.equip_styp_desc__c : '-'}
                    </CText>
                </View>
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_ASSET_NUMBER}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.ident_asset_num__c ? asset.ident_asset_num__c : '-'}
                    </CText>
                </View>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_SERIAL_NUMBER}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.SerialNumber ? asset.SerialNumber : '-'}
                    </CText>
                </View>
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_EQUIPMENT_OWNER}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.equip_ownr_nm__c ? asset.equip_ownr_nm__c : '-'}
                    </CText>
                </View>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_SERVICE_CONTRACT}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.serv_ctrct_nme__c ? asset.serv_ctrct_nme__c : '-'}
                    </CText>
                </View>
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_IN_STORE_LOCATION}</CText>
                    <CText numberOfLines={2} style={[styles.equipmentBodyValue]}>
                        {asset.equip_site_desc__c ? asset.equip_site_desc__c : '-'}
                    </CText>
                </View>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_SALES_PLAN}</CText>
                    <CText numberOfLines={1} style={styles.equipmentBodyValue}>
                        {asset.Sls_plan_desc__c ? asset.Sls_plan_desc__c : '-'}
                    </CText>
                </View>
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_INSTALL_DATE}</CText>
                    <CText style={styles.equipmentBodyValue}>
                        {asset.equip_inst_dte__c ? moment(asset.equip_inst_dte__c).format('DD MMM YYYY') : '-'}
                    </CText>
                </View>
                {asset.equip_last_svc_dte__c !== '1900-01-01' && (
                    <View style={styles.equipmentBody}>
                        <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_LAST_SERVICE_DATE}</CText>
                        <CText style={styles.equipmentBodyValue}>
                            {asset.equip_last_svc_dte__c
                                ? moment(asset.equip_last_svc_dte__c).format('DD MMM YYYY')
                                : '-'}
                        </CText>
                    </View>
                )}
                {asset.equip_last_svc_dte__c === '1900-01-01' && (
                    <View style={styles.equipmentBody}>
                        <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_LAST_SERVICE_DATE}</CText>
                        <CText style={styles.equipmentBodyValue}>{t.labels.PBNA_MOBILE_NO_SERVICE_HISTORY}</CText>
                    </View>
                )}
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View style={styles.equipmentBody}>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_NET_BOOK_VALUE}</CText>
                    <CText numberOfLines={1} style={[styles.equipmentBodyValue]}>
                        {asset.net_book_val_amt__c ? asset.net_book_val_amt__c : '-'}
                    </CText>
                </View>
                {(asset.sls_plan_cde__c === SalesPlanCdeEnum.REN || asset.sls_plan_cde__c === SalesPlanCdeEnum.FSR) && (
                    <View style={styles.equipmentBody}>
                        <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_RENT_MONTH}</CText>
                        <CText numberOfLines={1} style={[styles.equipmentBodyValue]}>
                            {asset.mnth_pymt_amt__c ? NUMBER_FORMATTER.format(asset.mnth_pymt_amt__c) : ZERO_AMOUNT}
                        </CText>
                    </View>
                )}
            </View>
            <View style={styles.equipmentAssetInfoLayout}>
                <View>
                    <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_INSTALLED_ACCESSORIES}</CText>
                    <CText style={styles.equipmentBodyValue}>
                        {_.isEmpty(commissionStruct.accDescription) ? '-' : commissionStruct.accDescription.join(', ')}
                    </CText>
                </View>
            </View>
            {asset.equip_type_cde__c === 'VEN' &&
                (asset.sls_plan_cde__c === SalesPlanCdeEnum.FSV || asset.sls_plan_cde__c === SalesPlanCdeEnum.FSR) && (
                    <View style={styles.equipmentAssetInfoLayout}>
                        <View style={styles.equipmentBody}>
                            <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_SUPPLIER}</CText>
                            <CText style={[styles.equipmentBodyValue]}>
                                {commissionStruct.supplier === '' ? '-' : `${commissionStruct.supplier}`}
                            </CText>
                        </View>
                        <View style={styles.equipmentBody}>
                            <CText style={styles.equipmentFieldLabel}>{t.labels.PBNA_MOBILE_RATE_TYPE}</CText>
                            <CText numberOfLines={1} style={[styles.equipmentBodyValue]}>
                                {commissionStruct.rateType}
                            </CText>
                        </View>
                    </View>
                )}
            {(asset.equip_type_cde__c === 'POS' || asset.equip_type_cde__c === 'VEN') && (
                <CollapseContainer
                    showContent={showProduct}
                    setShowContent={setShowProduct}
                    title={t.labels.PBNA_MOBILE_PRODUCTS_MECH_RATE}
                    noTopLine
                    containerStyle={styles.collapseContainer}
                >
                    <View style={{ paddingBottom: 20 }}>
                        <View style={styles.productLineContainer}>
                            <CText style={styles.productsLabel}>
                                {commissionStruct.productList.length}{' '}
                                {commissionStruct.productList.length > 1
                                    ? t.labels.PBNA_MOBILE_PRODUCTS.toUpperCase()
                                    : t.labels.PBNA_MOBILE_PRODUCT.toUpperCase()}
                            </CText>
                            {asset.equip_type_cde__c === 'VEN' && (
                                <CText style={styles.productsLabel}>
                                    {t.labels.PBNA_MOBILE_MECH_RATE.toUpperCase()}
                                </CText>
                            )}
                        </View>
                        {commissionStruct.productList.map((product) => {
                            return (
                                <View style={styles.productLineContainer} key={product.invenId}>
                                    <View style={styles.productAndSelectNumber}>
                                        <CText style={styles.productValueBold}>{product.selectNum}</CText>
                                        <CText style={[styles.productsValue]}>{product.productName}</CText>
                                    </View>
                                    {asset.equip_type_cde__c === 'VEN' && (
                                        <View style={styles.merchRateContainer}>
                                            <CText style={styles.productValueBold}>
                                                $ {product.mechRate ? addZeroes(product.mechRate + '') : '--'}
                                            </CText>
                                        </View>
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </CollapseContainer>
            )}
            {asset.equip_type_cde__c === 'VEN' &&
                (asset.sls_plan_cde__c === SalesPlanCdeEnum.FSV || asset.sls_plan_cde__c === SalesPlanCdeEnum.FSR) && (
                    <CollapseContainer
                        showContent={showCommission}
                        setShowContent={setShowCommission}
                        title={t.labels.PBNA_MOBILE_COMMISSION_STRUCTURE}
                        noTopLine
                        containerStyle={styles.collapseContainer}
                    >
                        <View style={{ paddingBottom: 20 }}>
                            {commissionStruct.rateType === 'Tier' &&
                                commissionStruct.equipmentSupplier?.map((asset, index) => {
                                    return renderCommissionTier(asset, index + 1)
                                })}
                            {commissionStruct.rateType === 'Variable by Product' && (
                                <View>
                                    <View style={styles.productLineContainer}>
                                        <CText style={styles.productsLabel}>
                                            {commissionStruct.productList.length}{' '}
                                            {commissionStruct.productList.length > 1
                                                ? t.labels.PBNA_MOBILE_PRODUCTS.toUpperCase()
                                                : t.labels.PBNA_MOBILE_PRODUCT.toUpperCase()}
                                        </CText>
                                        <CText style={styles.productsLabel}>
                                            {calcMethod === '001'
                                                ? t.labels.PBNA_MOBILE_AMOUNT_UNIT
                                                : t.labels.PBNA_MOBILE_PERCENTAGE}
                                        </CText>
                                    </View>
                                    {commissionStruct.productList.map((asset, index) => {
                                        return renderCommissionVariableByProduct(asset, index)
                                    })}
                                </View>
                            )}
                            {commissionStruct.rateType === 'Flat at Asset' && (
                                <View>
                                    <View>
                                        <CText style={styles.equipmentFieldLabel}>
                                            {calcMethod === '001'
                                                ? t.labels.PBNA_MOBILE_AMOUNT_UNIT
                                                : t.labels.PBNA_MOBILE_PERCENTAGE}
                                        </CText>
                                        <CText style={styles.equipmentBodyValue}>
                                            {calcMethod === '001'
                                                ? `$ ${Number(commissionStruct.assetConfig[0]?.tier_rate__c).toFixed(
                                                      2
                                                  )}`
                                                : `${getPercentValue()} %`}
                                        </CText>
                                    </View>
                                </View>
                            )}
                        </View>
                    </CollapseContainer>
                )}
            <ServiceInformationList
                serviceDraftList={serviceDraftList}
                serviceSubmittedList={serviceSubmittedList}
                serviceCancelledList={serviceCancelledList}
                serviceClosedList={serviceClosedList}
                serviceFailedList={serviceFailedList}
                onClick={onClick}
            />
            <View style={styles.padding} />
        </View>
    )
}

export default CustomerEquipmentAssetDetail
