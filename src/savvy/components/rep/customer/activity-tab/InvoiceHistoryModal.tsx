/**
 * @description Invoice History Modal
 * @author Sheng Huang
 * @date 2023-02-06
 */

import React, { FC, Ref, useEffect, useImperativeHandle, useState } from 'react'
import { Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import BackButton2 from '../../../common/BackButton2'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import ExportButton from '../../lead/common/ExportButton'
import CollapseContainer from '../../../common/CollapseContainer'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import { generateCustomerInvoicePdf } from './CustomerInvoicePdfHelper'
import { useCustomerInvoiceVolumes } from '../../../../hooks/CustomerInvoiceHooks'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface InvoiceHistoryModalProps {
    cRef: Ref<any>
    retailStore: any
}

const styles = StyleSheet.create({
    distributionPointModal: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    contentBox: {
        width: '100%',
        paddingHorizontal: '5%'
    },
    editAndBackBtnContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50
    },
    opeTextStyle: {
        fontSize: 12,
        fontWeight: '500'
    },
    exportIconContainer: {
        position: 'absolute',
        right: 0
    },
    dividerLine: {
        height: 1.5,
        width: '100%',
        backgroundColor: '#CFCFCF'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    invoiceTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 10
    },
    invoiceInfoLayout: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%'
    },
    infoBody: {
        width: '50%'
    },
    infoLabel: {
        fontSize: 13,
        overflow: 'hidden',
        fontWeight: '300',
        color: 'grey'
    },
    infoValue: {
        fontSize: 15,
        overflow: 'hidden',
        color: 'black',
        marginTop: 8
    },
    invoiceContainer: {
        flexDirection: 'row',
        marginBottom: 20
    },
    invoiceBlock: {
        flexDirection: 'column',
        width: '33%'
    },
    invoiceValue: {
        fontSize: 16,
        marginTop: 5,
        fontWeight: 'bold'
    },
    showAllContainer: {
        marginVertical: 10,
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
        marginVertical: 20
    }
})

const InvoiceHistoryModal: FC<InvoiceHistoryModalProps> = (props: InvoiceHistoryModalProps) => {
    const { cRef, retailStore } = props
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [showCollapse, setShowCollapse] = useState<Array<boolean>>([])
    const [invoiceId, setInvoiceId] = useState('')
    const invoiceVolume = useCustomerInvoiceVolumes(invoiceId, retailStore['Account.CUST_ID__c'])
    const [showAll, setShowAll] = useState(false)

    const closeModal = () => {
        setInvoiceId('')
        setShowInvoiceModal(false)
    }

    useEffect(() => {
        if (invoiceVolume?.InvoiceLineVolumesByYear) {
            const tempCollapseState: boolean[] = []
            invoiceVolume?.InvoiceLineVolumesByYear?.forEach(() => {
                tempCollapseState.push(false)
            })
            setShowCollapse(tempCollapseState)
        }
    }, [invoiceVolume?.InvoiceLineVolumesByYear?.length])

    useEffect(() => {
        let allState = false
        showCollapse.forEach((v) => {
            allState = allState || v
        })
        setShowAll(allState)
    }, [showCollapse])

    useImperativeHandle(cRef, () => ({
        openModal: (invoiceId: string) => {
            setShowInvoiceModal(true)
            setInvoiceId(invoiceId)
        },
        closeModal: () => {
            closeModal()
        }
    }))

    const setCollapseState = (state: boolean, index: number) => {
        setShowCollapse((prevState) => {
            const newState = _.cloneDeep(prevState)
            newState[index] = state
            return newState
        })
    }

    const extendCollapseAll = () => {
        setShowCollapse((prevState) => {
            const newState: boolean[] = []
            prevState.forEach(() => {
                newState.push(!showAll)
            })
            return newState
        })
    }

    const formatCases = (number: number) => {
        if (number || number === 0) {
            return number.toFixed(2)
        }
        return '-'
    }

    const renderCollapse = (value: any, index: number) => {
        return (
            <CollapseContainer
                showContent={showCollapse[index]}
                setShowContent={(state: boolean) => {
                    setCollapseState(state, index)
                }}
                title={value?.HRZN_PKG_GRP_DESC}
                titleComponents={
                    <View style={{ width: '85%' }}>
                        <CText style={styles.invoiceTitle}>
                            {value?.HRZN_PROD_GRP_DESC}&nbsp;{value?.HRZN_PKG_GRP_DESC}
                        </CText>
                        <CText style={styles.infoLabel}>
                            SKU&nbsp;<CText style={[styles.infoValue, { fontSize: 13 }]}>{value?.UPC_CDE}</CText>
                        </CText>
                    </View>
                }
                containerStyle={styles.collapseContainer}
                key={index}
                noBottomLine
            >
                <View style={styles.invoiceContainer}>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_CASES}</CText>
                        <CText style={styles.invoiceValue}>{formatCases(value?.INVC_VOL_RAWCS_QTY)}</CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_REVENUE}</CText>
                        <CText style={styles.invoiceValue}>
                            {`$ ${value?.INVC_ONTKT_REV_PER_UNIT_AMT?.toFixed(2) || '-'}`}
                        </CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_DISCOUNT}</CText>
                        <CText style={styles.invoiceValue}>
                            {`$ ${value?.INVC_DSCNT_PER_UNIT_AMT?.toFixed(2) || '-'}`}
                        </CText>
                    </View>
                </View>
                <View style={styles.invoiceContainer}>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_NET_PRICE}</CText>
                        <CText style={styles.invoiceValue}>
                            {`$ ${value?.INVC_NET_PRC_PER_UNIT_AMT?.toFixed(2) || '-'}`}
                        </CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_PEPSI_DEPOSIT}</CText>
                        <CText style={styles.invoiceValue}>{`$ ${value?.INV_TOT_DPST_AMT?.toFixed(2) || '-'}`}</CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_NET_AMNT}</CText>
                        <CText style={styles.invoiceValue}>{`$ ${value?.INVC_NET_AMT?.toFixed(2) || '-'}`}</CText>
                    </View>
                </View>
            </CollapseContainer>
        )
    }

    return (
        <Modal animationType="fade" transparent visible={showInvoiceModal}>
            <SafeAreaView style={styles.distributionPointModal}>
                <View style={styles.contentBox}>
                    <View style={styles.editAndBackBtnContainer}>
                        <BackButton2
                            onPress={() => {
                                setShowInvoiceModal(false)
                            }}
                        />
                        <CText style={styles.opeTextStyle}>{_.toUpper(t.labels.PBNA_MOBILE_INVOICE_HISTORY)}</CText>
                        <TouchableOpacity
                            style={styles.exportIconContainer}
                            onPress={async () => {
                                await generateCustomerInvoicePdf(invoiceVolume, retailStore)
                            }}
                        >
                            <ExportButton color={'#00A2D9'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dividerLine} />
                </View>
                <ScrollView>
                    <View style={styles.contentBox}>
                        <View style={styles.titleContainer}>
                            <CText style={styles.invoiceTitle}>{`${t.labels.PBNA_MOBILE_INVOICE} ${invoiceId}`}</CText>
                        </View>
                        <View style={styles.invoiceInfoLayout}>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_INVOICE_DATE}</CText>
                                <CText style={styles.infoValue}>
                                    {invoiceVolume?.InvoiceLineVolumesByYear[0]?.CUST_INV_DTE
                                        ? moment
                                              .utc(invoiceVolume?.InvoiceLineVolumesByYear[0]?.CUST_INV_DTE)
                                              .format(TIME_FORMAT.DDMMMY)
                                        : '-'}
                                </CText>
                            </View>
                            <View style={styles.infoBody}>
                                <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>
                                <CText style={styles.infoValue}>
                                    {invoiceVolume?.InvoiceLineVolumesByYear[0]?.DELY_DTE
                                        ? moment
                                              .utc(invoiceVolume?.InvoiceLineVolumesByYear[0]?.DELY_DTE)
                                              .format(TIME_FORMAT.DDMMMY)
                                        : '-'}
                                </CText>
                            </View>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <View style={styles.invoiceInfoLayout}>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_TOTAL_CASES}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.totalSalesVolume?.toFixed(0) || '-'}
                                    </CText>
                                </View>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_LOCATION}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.DELY_ADR_CITY || '-'}&nbsp;
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.DELY_ADR_STATE}
                                    </CText>
                                </View>
                            </View>
                            <View style={styles.invoiceInfoLayout}>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_ROUTE}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.DW_PROD_RTE_ID || '-'}
                                    </CText>
                                </View>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_STORE_NUMBER}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.CUST_STOR_NUM_VAL || '-'}
                                    </CText>
                                </View>
                            </View>
                            <View style={styles.invoiceInfoLayout}>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_PAYMENT_TERM}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.INV_PYMT_MTHD_DESC || '-'}
                                    </CText>
                                </View>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_TAX_ID}</CText>
                                    <CText style={styles.infoValue}>
                                        {invoiceVolume?.InvoiceLineVolumesByYear[0]?.TAX_EXEMPT_NUM || '-'}
                                    </CText>
                                </View>
                            </View>
                            <View style={styles.invoiceInfoLayout}>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_SALES_TAX}</CText>
                                    <CText style={styles.infoValue}>
                                        {`$ ${
                                            invoiceVolume?.InvoiceLineVolumesByYear[0]?.SLS_TAX_AMT.toFixed(2) || '-'
                                        }`}
                                    </CText>
                                </View>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_STATE_CHARGE_AMOUNT}</CText>
                                    <CText style={styles.infoValue}>
                                        {`$ ${
                                            invoiceVolume?.InvoiceLineVolumesByYear[0]?.ST_CHRG_AMT.toFixed(2) || '-'
                                        }`}
                                    </CText>
                                </View>
                            </View>
                            <View style={styles.invoiceInfoLayout}>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_SALES_REVENUE}</CText>
                                    <CText style={styles.infoValue}>
                                        {`$ ${
                                            invoiceVolume?.InvoiceLineVolumesByYear[0]?.CUST_INV_SOLD_AMT?.toFixed(2) ||
                                            '-'
                                        }`}
                                    </CText>
                                </View>
                                <View style={styles.infoBody}>
                                    <CText style={styles.infoLabel}>{t.labels.PBNA_MOBILE_NET_REVENUE_RETURN}</CText>
                                    <CText style={styles.infoValue}>
                                        {`$ ${
                                            invoiceVolume?.InvoiceLineVolumesByYear[0]?.CUST_INV_RTND_AMT?.toFixed(2) ||
                                            '-'
                                        }`}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        {invoiceVolume?.InvoiceLineVolumesByYear?.length > 0 && (
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
                        {invoiceVolume?.InvoiceLineVolumesByYear?.map((value, index) => {
                            return renderCollapse(value, index)
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

export default InvoiceHistoryModal
