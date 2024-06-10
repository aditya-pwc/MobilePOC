import React, { FC, useRef } from 'react'
import CText from '../../../../../common/components/CText'
import { TouchableOpacity, View, StyleSheet, FlatList } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import InvoiceHistoryModal from './InvoiceHistoryModal'
import moment from 'moment'
import _ from 'lodash'
import { cRound } from '../../../../hooks/CustomerInvoiceHooks'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface CustomerInvoiceHistoryProps {
    navigation?: any
    route?: any
    invoiceHeader: any
    retailStore: any
}

const styles = StyleSheet.create({
    editView: {
        justifyContent: 'center'
    },
    editText: {
        color: '#00A2D9',
        fontWeight: '500'
    },
    splitLine: {
        height: 1,
        width: '100%',
        backgroundColor: 'black',
        marginTop: 10
    },
    invoiceContainer: {
        flexDirection: 'row',
        marginVertical: 10
    },
    invoiceBlock: {
        flexDirection: 'column',
        flex: 1
    },
    invoiceTitle: {
        color: '#565656'
    },
    invoiceValue: {
        fontSize: 16,
        marginTop: 5
    },
    invoiceHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    invoiceHeaderTitle: {
        fontWeight: '800',
        fontSize: 16
    }
})

const CustomerInvoiceHistory: FC<CustomerInvoiceHistoryProps> = (props: CustomerInvoiceHistoryProps) => {
    const { invoiceHeader, retailStore } = props
    const invoiceModalRef = useRef<any>(null)

    const renderInvoiceView = ({ item, index }: any) => {
        return (
            <View key={index} style={{ marginBottom: 20 }}>
                <View style={styles.invoiceHeaderContainer}>
                    <CText style={styles.invoiceHeaderTitle}>
                        {`${_.toUpper(t.labels.PBNA_MOBILE_INVOICE)} ${item?.CUST_INV_ID || ''}`}
                    </CText>
                    <TouchableOpacity
                        style={styles.editView}
                        onPress={() => {
                            invoiceModalRef?.current?.openModal(item?.CUST_INV_ID)
                        }}
                    >
                        <CText style={styles.editText}>{t.labels.PBNA_MOBILE_VIEW}</CText>
                    </TouchableOpacity>
                </View>
                <View style={styles.splitLine} />
                <View style={styles.invoiceContainer}>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.invoiceTitle}>{t.labels.PBNA_MOBILE_INVOICE_DATE}</CText>
                        <CText style={styles.invoiceValue}>
                            {`${item?.CUST_INV_DTE ? moment.utc(item?.CUST_INV_DTE).format(TIME_FORMAT.DDMMMY) : '-'}`}
                        </CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.invoiceTitle}>{t.labels.PBNA_MOBILE_TOTAL_CASES}</CText>
                        <CText style={styles.invoiceValue}>
                            {`${
                                cRound(
                                    _.add(item?.INVC_TOT_SLS_VOL_CS_QTY || 0, item?.INVC_TOT_RTRN_CS_QTY || 0)
                                ).toFixed(0) || '-'
                            }`}
                        </CText>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <CText style={styles.invoiceTitle}>{t.labels.PBNA_MOBILE_TOTAL_AMOUNT_DUE}</CText>
                        <CText style={styles.invoiceValue}>
                            {`$ ${cRound(item?.CUST_INV_NET_AMT, 2).toFixed(2) || '-'}`}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View
            style={{
                paddingHorizontal: '5%'
            }}
        >
            <FlatList data={invoiceHeader?.InvoiceHeaderVolumesByYear} renderItem={renderInvoiceView} />
            <InvoiceHistoryModal cRef={invoiceModalRef} retailStore={retailStore} />
        </View>
    )
}

export default CustomerInvoiceHistory
