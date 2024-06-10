/**
 * @description //Sort Form for MyCustomer
 * @author Kiren Cao
 * @date 2022/1/17
 */
import { StyleSheet, View } from 'react-native'
import React, { FC, useState } from 'react'
import CText from '../../../../common/components/CText'
import { renderSortPickList, SortModal } from '../../../helper/rep/FilterLeadListLocationHelper'
import { t } from '../../../../common/i18n/t'

interface CustomerSortFormProps {
    customerSortList: any
    setCustomerSortList: any
}

const styles = StyleSheet.create({
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Gotham',
        color: '#565656'
    },
    sectionContainer: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    chevronStyle: {
        width: 18,
        height: 13,
        marginRight: 5
    },
    titleLabel: {
        fontSize: 18,
        fontFamily: 'Gotham',
        color: '#000000',
        fontWeight: '900'
    },
    marginBottom_20: {
        marginBottom: 20
    }
})

const CustomerSortForm: FC<CustomerSortFormProps> = (props: CustomerSortFormProps) => {
    const { customerSortList, setCustomerSortList } = props
    const [tempCustomerSortList, setTempCustomerSortList] = useState([])
    const [showCustomerPickList, setShowCustomerPickList] = useState(0)

    const sortCustomerList = [
        {
            title: t.labels.PBNA_MOBILE_YTD_PERCENTAGE_VOLUME_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Volume_Percentage__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Volume_Percentage__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Volume_Percentage__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Volume_Percentage__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_PERCENTAGE_REVENUE_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Revenue_Percentage__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Revenue_Percentage__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_VOLUME,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.CY_LCW_Volume__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.CY_LCW_Volume__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.CY_LCW_Volume__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.CY_LCW_Volume__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_REVENUE,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.CY_LCW_Revenue__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.CY_LCW_Revenue__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.CY_LCW_Revenue__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.CY_LCW_Revenue__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_VOLUME_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Volume__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Volume__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Volume__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Volume__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_REVENUE_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Revenue__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Revenue__c',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Revenue__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Revenue__c',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_DSD_DELIVERY_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'ActualDeliveryDate COLLATE NOCASE DESC NULLS LAST',
                fieldName: 'ActualDeliveryDate',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'ActualDeliveryDate COLLATE NOCASE ASC NULLS LAST',
                fieldName: 'ActualDeliveryDate',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_SALES_VISIT,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'SalesVisitDate DESC NULLS LAST',
                fieldName: 'SalesVisitDate',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'SalesVisitDate ASC NULLS LAST',
                fieldName: 'SalesVisitDate',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_NAME,
            button1: {
                title: t.labels.PBNA_MOBILE_A_Z,
                order: 'COLLATE NOCASE ASC',
                fieldName: 'Name'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_Z_A,
                order: 'COLLATE NOCASE DESC',
                fieldName: 'Name'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_CUSTOMER_CREATED_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'COLLATE NOCASE DESC NULLS LAST',
                fieldName: 'Account.CUST_STRT_DT__c'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'COLLATE NOCASE ASC NULLS LAST',
                fieldName: 'Account.CUST_STRT_DT__c'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_DISTANCE,
            button1: {
                title: t.labels.PBNA_MOBILE_CLOSE_FAR,
                order: 'Distance ASC NULLS LAST',
                fieldName: 'Distance',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_FAR_CLOSE,
                order: 'Distance DESC NULLS LAST',
                fieldName: 'Distance',
                complex: true
            }
        },
        {
            title: t.labels.PBNA_MOBILE_CALLS,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'CallDate DESC NULLS LAST',
                fieldName: 'CallDate',
                complex: true
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'CallDate ASC NULLS LAST',
                fieldName: 'CallDate',
                complex: true
            }
        }
    ]

    return (
        <View>
            <CText style={[styles.filterTitle, { marginVertical: 20 }]}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
            <View style={styles.marginBottom_20}>
                {renderSortPickList(0, customerSortList, setShowCustomerPickList, setTempCustomerSortList)}
                <CText style={[styles.sectionLabel, { marginTop: 30 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                {renderSortPickList(1, customerSortList, setShowCustomerPickList, setTempCustomerSortList)}
                <CText style={[styles.sectionLabel, { marginTop: 30 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                {renderSortPickList(2, customerSortList, setShowCustomerPickList, setTempCustomerSortList)}
            </View>
            <SortModal
                showPickList={showCustomerPickList}
                setShowPickList={setShowCustomerPickList}
                sortButtonList={sortCustomerList}
                sortList={customerSortList}
                setSortList={setCustomerSortList}
                tempSortList={tempCustomerSortList}
                setTempSortList={setTempCustomerSortList}
                title={t.labels.PBNA_MOBILE_CUSTOMER_SORT.toUpperCase()}
            />
        </View>
    )
}

export default CustomerSortForm
