/**
 * @description Component of sort form for explore screen
 * @author Sheng Huang
 * @date 2021/11/2
 */

import { StyleSheet, Switch, View } from 'react-native'
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { getLeadSortList, SortCustomerList } from '../../utils/LeadCustomerFilterUtils'
import CText from '../../../common/components/CText'
import CollapseContainer from '../common/CollapseContainer'
import { renderSortPickList, SortModal } from '../../helper/rep/FilterLeadListLocationHelper'
import _ from 'lodash'
import { t } from '../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager, isPersonaFSR } from '../../../common/enums/Persona'

interface MapSortFormProps {
    leadSortList: Array<string>
    setLeadSortList: Dispatch<SetStateAction<[]>>
    mapSortList: Array<string>
    setMapSortList: Dispatch<SetStateAction<[]>>
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
    sortListBottom: {
        marginBottom: 20
    }
})

const MapSortForm: FC<MapSortFormProps> = (props: MapSortFormProps) => {
    const { leadSortList, setLeadSortList, mapSortList, setMapSortList } = props
    const [tempLeadSortList, setTempLeadSortList] = useState([])
    const [showLeadPickList, setShowLeadPickList] = useState(0)
    const [tempCustomerSortList, setTempCustomerSortList] = useState([])
    const [showCustomerPickList, setShowCustomerPickList] = useState(0)
    const [showLead, setShowLead] = useState(!_.isEmpty(leadSortList))
    const [showCustomer, setShowCustomer] = useState(!_.isEmpty(mapSortList))
    const sortLeadList = getLeadSortList(true, true)

    useEffect(() => {
        if (!showCustomer) {
            setMapSortList([])
        }
        if (!showLead) {
            setLeadSortList([])
        }
    }, [showCustomer, showLead])

    const basicSortCustomerList: SortCustomerList[] = _.compact([
        !isPersonaCRMBusinessAdmin() && {
            title: t.labels.PBNA_MOBILE_DSD_DELIVERY_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'ActualDeliveryDate COLLATE NOCASE DESC NULLS LAST',
                fieldName: 'ActualDeliveryDate',
                complex: true,
                value: 'DESC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'ActualDeliveryDate COLLATE NOCASE ASC NULLS LAST',
                fieldName: 'ActualDeliveryDate',
                complex: true,
                value: 'ASC'
            }
        },
        !isPersonaCRMBusinessAdmin() && {
            title: t.labels.PBNA_MOBILE_SALES_VISIT,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'SalesVisitDate DESC NULLS LAST',
                fieldName: 'SalesVisitDate',
                complex: true,
                value: 'DESC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'SalesVisitDate ASC NULLS LAST',
                fieldName: 'SalesVisitDate',
                complex: true,
                value: 'ASC'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_NAME,
            button1: {
                title: t.labels.PBNA_MOBILE_A_Z,
                order: 'COLLATE NOCASE ASC',
                fieldName: 'Name',
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_Z_A,
                order: 'COLLATE NOCASE DESC',
                fieldName: 'Name',
                value: 'DESC'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_CUSTOMER_CREATED_DATE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'COLLATE NOCASE DESC NULLS LAST',
                fieldName: 'Account.CUST_STRT_DT__c',
                value: 'DESC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'COLLATE NOCASE ASC NULLS LAST',
                fieldName: 'Account.CUST_STRT_DT__c',
                value: 'ASC'
            }
        },
        !isPersonaCRMBusinessAdmin() && {
            title: t.labels.PBNA_MOBILE_DISTANCE,
            button1: {
                title: t.labels.PBNA_MOBILE_NEAR_FAR,
                order: 'Distance ASC NULLS LAST',
                fieldName: 'Distance',
                complex: true,
                value: 'ASC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_FAR_NEAR,
                order: 'Distance DESC NULLS LAST',
                fieldName: 'Distance',
                complex: true,
                value: 'DESC'
            }
        },
        !isPersonaCRMBusinessAdmin() && {
            title: t.labels.PBNA_MOBILE_CALLS,
            button1: {
                title: t.labels.PBNA_MOBILE_NEW_OLD,
                order: 'CallDate DESC NULLS LAST',
                fieldName: 'CallDate',
                complex: true,
                value: 'DESC'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_OLD_NEW,
                order: 'CallDate ASC NULLS LAST',
                fieldName: 'CallDate',
                complex: true,
                value: 'ASC'
            }
        }
    ])
    const volumeRevenueSortList: SortCustomerList[] = [
        {
            title: t.labels.PBNA_MOBILE_YTD_PERCENTAGE_VOLUME_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Volume_Percentage__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Volume_Percentage__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Volume_Percentage__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Volume_Percentage__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_PERCENTAGE_REVENUE_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Revenue_Percentage__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Revenue_Percentage__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Revenue_Percentage__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_VOLUME,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.CY_LCW_Volume__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.CY_LCW_Volume__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.CY_LCW_Volume__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.CY_LCW_Volume__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_REVENUE,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.CY_LCW_Revenue__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.CY_LCW_Revenue__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.CY_LCW_Revenue__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.CY_LCW_Revenue__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_VOLUME_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Volume__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Volume__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Volume__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Volume__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        },
        {
            title: t.labels.PBNA_MOBILE_YTD_REVENUE_GROWTH,
            button1: {
                title: t.labels.PBNA_MOBILE_SORT_HIGH_LOW,
                order: 'CAST({RetailStore:Account.Delta_Revenue__c} AS DOUBLE) DESC NULLS LAST',
                fieldName: 'Account.Delta_Revenue__c',
                complex: true,
                value: 'DESC NULLS LAST'
            },
            button2: {
                title: t.labels.PBNA_MOBILE_SORT_LOW_HIGH,
                order: 'CAST({RetailStore:Account.Delta_Revenue__c} AS DOUBLE) ASC NULLS LAST',
                fieldName: 'Account.Delta_Revenue__c',
                complex: true,
                value: 'ASC NULLS LAST'
            }
        }
    ]
    const sortCustomerList: SortCustomerList[] =
        isPersonaFSManager() || isPersonaFSR() || isPersonaCRMBusinessAdmin()
            ? _.concat(volumeRevenueSortList, basicSortCustomerList)
            : basicSortCustomerList
    return (
        <View>
            <CText style={[styles.filterTitle, { marginVertical: 20 }]}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
            <CollapseContainer
                showContent={showLead}
                setShowContent={setShowLead}
                title={_.capitalize(t.labels.PBNA_MOBILE_LEADS)}
                titleStyle={styles.titleLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
                noBottomLine={showLead}
                chevronIcon={
                    <Switch
                        value={showLead}
                        onValueChange={(value) => {
                            setShowLead(value)
                        }}
                        ios_backgroundColor={'#565656'}
                    />
                }
            >
                <View style={styles.sortListBottom}>
                    {renderSortPickList(0, leadSortList, setShowLeadPickList, setTempLeadSortList)}
                    <CText style={[styles.sectionLabel, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                    {renderSortPickList(1, leadSortList, setShowLeadPickList, setTempLeadSortList)}
                    <CText style={[styles.sectionLabel, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                    {renderSortPickList(2, leadSortList, setShowLeadPickList, setTempLeadSortList)}
                </View>
            </CollapseContainer>
            <CollapseContainer
                showContent={showCustomer}
                setShowContent={setShowCustomer}
                title={t.labels.PBNA_MOBILE_CUSTOMER}
                titleStyle={styles.titleLabel}
                containerStyle={styles.sectionContainer}
                chevronStyle={styles.chevronStyle}
                noTopLine
                noBottomLine={showCustomer}
                chevronIcon={
                    <Switch
                        value={showCustomer}
                        onValueChange={(value) => {
                            setShowCustomer(value)
                        }}
                        ios_backgroundColor={'#565656'}
                    />
                }
            >
                <View style={styles.sortListBottom}>
                    {renderSortPickList(0, mapSortList, setShowCustomerPickList, setTempCustomerSortList)}
                    <CText style={[styles.sectionLabel, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                    {renderSortPickList(1, mapSortList, setShowCustomerPickList, setTempCustomerSortList)}
                    {!isPersonaCRMBusinessAdmin() && (
                        <View>
                            <CText style={[styles.sectionLabel, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
                            {renderSortPickList(2, mapSortList, setShowCustomerPickList, setTempCustomerSortList)}
                        </View>
                    )}
                </View>
            </CollapseContainer>
            <SortModal
                showPickList={showLeadPickList}
                setShowPickList={setShowLeadPickList}
                sortButtonList={sortLeadList}
                sortList={leadSortList}
                setSortList={setLeadSortList}
                tempSortList={tempLeadSortList}
                setTempSortList={setTempLeadSortList}
                title={t.labels.PBNA_MOBILE_LEAD_SORT.toUpperCase()}
            />
            <SortModal
                showPickList={showCustomerPickList}
                setShowPickList={setShowCustomerPickList}
                sortButtonList={sortCustomerList}
                sortList={mapSortList}
                setSortList={setMapSortList}
                tempSortList={tempCustomerSortList}
                setTempSortList={setTempCustomerSortList}
                title={t.labels.PBNA_MOBILE_CUSTOMER_SORT.toUpperCase()}
            />
        </View>
    )
}

export default MapSortForm
