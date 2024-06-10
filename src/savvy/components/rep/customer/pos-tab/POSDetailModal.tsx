/**
 * @description POS Detail Modal
 * @author Sheng Huang
 * @date 2023-03-30
 */

import React, { FC, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import StorePlaceholderSvg from '../../../../../../assets/image/Icon-store-placeholder-small.svg'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import CollapseContainer from '../../../common/CollapseContainer'
import _ from 'lodash'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import {
    getPOSStatusLabel,
    getPOSStatusTitleStyle,
    getPOSStatusViewStyle,
    usePOSLineItems
} from '../../../../hooks/POSHooks'

interface POSDetailModalProps {
    cRef: any
    customer: any
    posHeaderDetail: any
}

const styles = StyleSheet.create({
    ...commonStyle,
    distributionPointModal: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    titleContainer: {
        paddingVertical: 22,
        marginHorizontal: 22,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    infoContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1
    },
    storePlaceHolder: {
        marginRight: 15
    },
    marginTop_22: {
        marginTop: 22
    },
    textStyle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '400'
    },
    labelStyle: {
        fontSize: 14,
        color: '#565656',
        fontWeight: '400'
    },
    InquiryStyle: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: '800'
    },
    titleStyle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '800'
    },
    pillBackground: {
        padding: 3,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        marginTop: 8,
        alignSelf: 'flex-start'
    },
    statusStyle: {
        fontWeight: '500'
    },
    iconLarge: {
        width: 36,
        height: 36
    },
    fontBolder: {
        fontWeight: '900',
        fontSize: 24
    },
    showAllContainer: {
        marginVertical: 10,
        marginHorizontal: 22,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    showAllText: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10,
        fontFamily: 'Gotham-Bold'
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
    listTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginBottom: 5
    },
    posInfoContainer: {
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    lineView: {
        height: 1,
        backgroundColor: '#D3D3D3'
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
        width: '25%'
    },
    posBodyContainer: {
        marginHorizontal: 22,
        marginBottom: 30
    }
})

const POSDetailModal: FC<POSDetailModalProps> = (props: POSDetailModalProps) => {
    const { cRef, customer, posHeaderDetail } = props
    const posLineItem = usePOSLineItems(posHeaderDetail.Id)
    const [showModal, setShowModal] = useState(false)
    const [showCollapse, setShowCollapse] = useState<Array<boolean>>([])
    const [showAll, setShowAll] = useState<boolean>(false)
    const groupedPOSLineItem = useMemo(() => {
        return Object.values(_.groupBy(posLineItem, 'asset_id__r.Category_Id__c'))
    }, [posLineItem])
    const totalQty = useMemo(() => {
        return _.sum(
            posLineItem.map((v: any) => {
                return v?.Order_Quantity__c * v?.asset_id__r?.Quantity
            })
        )
    }, [posLineItem])
    const totalCost = useMemo(() => {
        return _.sum(
            posLineItem.map((v: any) => {
                return v?.asset_id__r?.Default_Cost__c * v?.Order_Quantity__c
            })
        )
    }, [posLineItem])
    useEffect(() => {
        if (!_.isEmpty(groupedPOSLineItem)) {
            const tempCollapseState: Array<boolean> = []
            groupedPOSLineItem.forEach(() => {
                tempCollapseState.push(false)
            })
            setShowCollapse(tempCollapseState)
        }
    }, [groupedPOSLineItem])

    useEffect(() => {
        let allState: boolean = false
        showCollapse.forEach((v) => {
            allState = allState || v
        })
        setShowAll(allState)
    }, [showCollapse])
    const extendCollapseAll = () => {
        setShowCollapse((prevState) => {
            const newState: boolean[] = []
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
    const openModal = () => {
        setShowModal(true)
    }
    const closeModal = () => {
        setShowModal(false)
    }
    useImperativeHandle(cRef, () => ({
        openModal: () => openModal(),
        closeModal: () => closeModal()
    }))

    const renderPOSInfo = (value: any, index: number) => {
        const secondLineList = _.compact([
            value?.asset_id__r?.Package_Size_Name__c,
            value?.asset_id__r?.Color_Name__c,
            value?.asset_id__r?.Brand_Name__c
        ])
        const secondLine = secondLineList.join(' ')
        return (
            <View style={styles.posInfoContainer} key={index}>
                <View style={{ width: '80%' }}>
                    <CText style={styles.listTitle}>{value?.asset_id__r?.Product_Name__c}</CText>
                    {!_.isEmpty(value?.asset_id__r?.Product_Subtype__c) && (
                        <CText style={{ marginBottom: 5 }}>{value?.asset_id__r?.Product_Subtype__c}</CText>
                    )}
                    {(!_.isEmpty(value?.asset_id__r?.Package_Size_Name__c) ||
                        !_.isEmpty(value?.asset_id__r?.Color_Name__c) ||
                        !_.isEmpty(value?.asset_id__r?.Brand_Name__c)) && (
                        <CText numberOfLines={1} style={styles.labelStyle}>
                            {secondLine}
                        </CText>
                    )}
                </View>
                <CText style={styles.labelStyle}>
                    {t.labels.PBNA_MOBILE_QTY}&nbsp;<CText style={styles.titleStyle}>{value?.Order_Quantity__c}</CText>
                </CText>
            </View>
        )
    }

    const renderCollapse = (value: any, index: number) => {
        const qty = _.sum(
            value.map((v: any) => {
                return v.Order_Quantity__c
            })
        )
        return (
            <CollapseContainer
                showContent={showCollapse[index]}
                setShowContent={(state: boolean) => {
                    setCollapseState(state, index)
                }}
                title={value[0]?.asset_id__r?.Category_Name__c || ''}
                titleComponents={
                    <View style={styles.collapseTitle}>
                        <View style={styles.collapseTitleLeft}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_POS_CATEGORY}</CText>
                            <CText style={[styles.InquiryStyle, { maxWidth: '90%' }]}>
                                {value[0]?.asset_id__r?.Category_Name__c}
                            </CText>
                        </View>
                        <CText style={[styles.labelStyle, styles.collapseTitleRight]}>
                            {t.labels.PBNA_MOBILE_QTY}&nbsp;<CText style={styles.titleStyle}>{qty}</CText>
                        </CText>
                    </View>
                }
                containerStyle={styles.collapseContainer}
                key={index}
                noBottomLine
            >
                <View style={styles.invoiceContainer}>
                    <View style={styles.infoContainer}>
                        <CText style={styles.titleStyle}>{_.upperCase(t.labels.PBNA_MOBILE_POS_INFO)}</CText>
                    </View>
                    {value?.map((item: any, index: number) => {
                        return renderPOSInfo(item, index)
                    })}
                </View>
            </CollapseContainer>
        )
    }

    return (
        <Modal visible={showModal}>
            <SafeAreaView style={styles.distributionPointModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.titleContainer, styles.flexRowSpaceCenter]}>
                        <View style={[styles.flexRowSpaceCenter, { maxWidth: '75%' }]}>
                            <StorePlaceholderSvg style={styles.storePlaceHolder} />
                            <CText style={styles.fontBolder} numberOfLines={1}>
                                {customer.Name}
                            </CText>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                closeModal()
                            }}
                        >
                            <Image
                                style={styles.iconLarge}
                                source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.posBodyContainer}>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.InquiryStyle}>
                                {t.labels.PBNA_MOBILE_INQUIRY + ' ' + posHeaderDetail?.Inquiry_Id__c || '-'}
                            </CText>
                        </View>
                        <View
                            style={[
                                getPOSStatusViewStyle(posHeaderDetail?.status__c),
                                styles.pillBackground,
                                styles.marginTop_22
                            ]}
                        >
                            <CText style={[styles.statusStyle, getPOSStatusTitleStyle(posHeaderDetail?.status__c)]}>
                                {getPOSStatusLabel(posHeaderDetail?.status__c)}
                            </CText>
                        </View>
                        <View style={styles.marginTop_30}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_METRICS_STATUS}</CText>
                            <CText style={styles.textStyle}>{posHeaderDetail?.Siebel_Status__c || '-'}</CText>
                        </View>
                        <View style={[styles.marginTop_22, commonStyle.flexDirectionRow]}>
                            <View style={styles.halfWidth}>
                                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_COF_NUMBER}</CText>
                                <CText style={styles.textStyle}>{customer['Account.CUST_UNIQ_ID_VAL__c'] || '-'}</CText>
                            </View>
                            <View style={styles.halfWidth}>
                                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_SUBMITTED_BY}</CText>
                                <CText style={styles.textStyle}>{posHeaderDetail['requested_by__r.Name'] || '-'}</CText>
                            </View>
                        </View>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_ADDRESS}</CText>
                            <CText style={styles.textStyle}>{posHeaderDetail?.Address__c || '-'}</CText>
                        </View>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_EMAIL_ADDRESS}</CText>
                            <CText style={styles.textStyle}>{posHeaderDetail?.email_addr_txt__c || '-'}</CText>
                        </View>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}</CText>
                            <CText style={styles.textStyle}>
                                {customer['Account.BUSN_SGMNTTN_LVL_1_NM__c'] || '-'}
                            </CText>
                        </View>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_INQUIRY_ID}</CText>
                            <CText style={styles.textStyle}>{posHeaderDetail?.Inquiry_Id__c || '-'}</CText>
                        </View>
                        <View style={styles.marginTop_22}>
                            <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_REASON}</CText>
                            <CText style={styles.textStyle}>{posHeaderDetail?.Reason_Cde__c || '-'}</CText>
                        </View>
                        <View style={[styles.marginTop_22, commonStyle.flexDirectionRow]}>
                            <View style={styles.halfWidth}>
                                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_ORDER_QUANTITY}</CText>
                                <CText style={styles.InquiryStyle}>{totalQty || '-'}</CText>
                            </View>
                            <View style={styles.halfWidth}>
                                <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_TOTAL_AMOUNT}</CText>
                                <CText style={styles.InquiryStyle}>$ {totalCost?.toFixed(2) || '--'}</CText>
                            </View>
                        </View>
                    </View>
                    {groupedPOSLineItem?.length > 0 && (
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
                    {groupedPOSLineItem?.map((value, index) => {
                        return renderCollapse(value, index)
                    })}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

export default POSDetailModal
