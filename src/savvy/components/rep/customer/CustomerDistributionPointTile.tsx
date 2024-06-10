/**
 * @description This component is the tile of distribution point in list.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import _ from 'lodash'
import { useBusinessSegmentPicklist } from '../../../hooks/LeadHooks'
import CText from '../../../../common/components/CText'
import LeadFieldTile from '../lead/common/LeadFieldTile'
import CollapseContainer from '../../common/CollapseContainer'
import { t } from '../../../../common/i18n/t'
import { FSVFrequencyMapReverse } from '../lead/offer-tab/DistributionPointModal'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface CustomerDistributionPointProps {
    dpData: any
    noBottomLine?: boolean
    noTopLine?: boolean
}

const styles = StyleSheet.create({
    pillBackground: {
        width: 100,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60
    },
    titleStyle: {
        fontSize: 16,
        fontWeight: '500'
    },
    titleStyle2: {
        fontWeight: '500',
        color: 'black'
    },
    containerStyle: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    width_48: {
        width: '48%'
    },
    textStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    orderDaysContainer: {
        marginTop: 5,
        flexDirection: 'row',
        marginBottom: 5
    },
    padding: {
        width: '100%',
        height: 40
    },
    activeDay: {
        color: 'black',
        marginRight: 8,
        fontWeight: '700'
    },
    inactiveDay: {
        color: '#D3D3D3',
        marginRight: 8,
        fontWeight: '700'
    },
    submitLabel: {
        backgroundColor: '#FFC337',
        marginLeft: 10
    }
})

const CustomerDistributionPointTile = (props: CustomerDistributionPointProps) => {
    const { dpData, noBottomLine = false, noTopLine = false } = props
    const initDeliveryDays = () => {
        return {
            Sunday: false,
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false
        }
    }
    const { dpOptions } = useBusinessSegmentPicklist()
    const [deliveryDays, setDeliveryDays] = useState(initDeliveryDays())
    const [orderDays, setOrderDays] = useState(initDeliveryDays())
    const [showContent, setShowContent] = useState(false)
    useEffect(() => {
        const deliveryDayCheck =
            dpData['RecordType.Name'] === 'CTR' && !dpData.Pending__c && dpData.SLS_MTHD_NM__c === 'Pepsi Direct'
        // #9551120 The days for PD Dist Pts will no longer be reflected as Order Days, they should be reflected as the Delivery Days.
        const deliveryDay = deliveryDayCheck ? dpData.ORD_DAYS__c || '' : dpData.DELY_DAYS__c || ''
        const deliveryDaysList = deliveryDay.split(';')
        if (deliveryDaysList.length === 0 && deliveryDaysList[0] === '') {
            return
        }
        const tempDeliveryDays = initDeliveryDays()
        _.forEach(deliveryDaysList, (v) => {
            tempDeliveryDays[v] = true
        })
        setDeliveryDays(tempDeliveryDays)
        const dpOrderDays = deliveryDayCheck ? dpData.DELY_DAYS__c || '' : dpData.ORD_DAYS__c || ''
        const orderDaysList = dpOrderDays.split(';')
        if (orderDaysList.length === 0 && orderDaysList[0] === '') {
            return
        }
        const tempOrderDays = initDeliveryDays()
        _.forEach(orderDaysList, (v) => {
            tempOrderDays[v] = true
        })
        setOrderDays(tempOrderDays)
    }, [dpData])
    return (
        <CollapseContainer
            showContent={showContent}
            setShowContent={setShowContent}
            title={`${dpData.SLS_MTHD_NM__c} ${t.labels.PBNA_MOBILE_DISTRIBUTION}`}
            showReset={false}
            titleStyle={styles.titleStyle}
            titleComponents={
                <View style={commonStyle.flexRowSpaceCenter}>
                    <CText style={styles.titleStyle}>
                        {dpData.SLS_MTHD_NM__c} {t.labels.PBNA_MOBILE_DISTRIBUTION}
                    </CText>
                    {dpData.Pending__c && (
                        <View style={[styles.submitLabel, styles.pillBackground]}>
                            <CText style={styles.titleStyle2}>{t.labels.PBNA_MOBILE_SUBMITTED}</CText>
                        </View>
                    )}
                </View>
            }
            containerStyle={styles.containerStyle}
            noBottomLine={noBottomLine}
            noTopLine={noTopLine}
        >
            <View>
                <View style={commonStyle.flexRowSpaceBet}>
                    <View style={styles.width_48}>
                        <View>
                            <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                            <View style={styles.orderDaysContainer}>
                                <CText style={orderDays.Monday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY}
                                </CText>
                                <CText style={orderDays.Tuesday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY}
                                </CText>
                                <CText style={orderDays.Wednesday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY}
                                </CText>
                                <CText style={orderDays.Thursday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY}
                                </CText>
                                <CText style={orderDays.Friday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY}
                                </CText>
                                <CText style={orderDays.Saturday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY}
                                </CText>
                                <CText style={orderDays.Sunday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY}
                                </CText>
                            </View>
                        </View>
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_SALES_METHOD}
                            fieldValue={dpData.SLS_MTHD_NM__c}
                            containerStyle={{ marginBottom: 5 }}
                        />
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_PRODUCT_GROUP}
                            fieldValue={dpData.PROD_GRP_NM__c}
                            containerStyle={{ marginBottom: 5 }}
                        />
                    </View>
                    <View style={styles.width_48}>
                        <View>
                            <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_DELIVERY_DAYS}</CText>
                            <View style={styles.orderDaysContainer}>
                                <CText style={deliveryDays.Monday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY}
                                </CText>
                                <CText style={deliveryDays.Tuesday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY}
                                </CText>
                                <CText style={deliveryDays.Wednesday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY}
                                </CText>
                                <CText style={deliveryDays.Thursday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY}
                                </CText>
                                <CText style={deliveryDays.Friday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY}
                                </CText>
                                <CText style={deliveryDays.Saturday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY}
                                </CText>
                                <CText style={deliveryDays.Sunday ? styles.activeDay : styles.inactiveDay}>
                                    {t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY}
                                </CText>
                            </View>
                        </View>
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_DELIVERY_METHOD}
                            fieldValue={dpData.DLVRY_MTHD_NM__c}
                            containerStyle={{ marginBottom: 5 }}
                        />
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_DELIVERY_FREQUENCY}
                            fieldValue={
                                dpData.SLS_MTHD_NM__c === 'FSV'
                                    ? FSVFrequencyMapReverse[dpData.CUST_RTE_FREQ_CDE__c]
                                    : dpOptions.DELIVERY_FREQUENCY_MAPPING_CODE[dpData.CUST_RTE_FREQ_CDE__c]
                            }
                            containerStyle={{ marginBottom: 5 }}
                        />
                    </View>
                </View>
                <LeadFieldTile
                    fieldName={t.labels.PBNA_MOBILE_ROUTE_NUMBER}
                    fieldValue={
                        dpData.Lead_DP_Route_Disp_NM__c ||
                        `${dpData['Route__r.GTMU_RTE_ID__c']} ${dpData['Route__r.RTE_TYP_GRP_NM__c'] || '-'} ${
                            dpData['User__r.Name'] || ''
                        }`
                    }
                />
                <View style={styles.padding} />
            </View>
        </CollapseContainer>
    )
}

export default CustomerDistributionPointTile
