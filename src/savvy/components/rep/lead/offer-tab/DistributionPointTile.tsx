/**
 * @description This component is the tile of distribution point in list.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { MutableRefObject, useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import LeadFieldTile from '../common/LeadFieldTile'
import { useBusinessSegmentPicklist } from '../../../../hooks/LeadHooks'
import _ from 'lodash'
import DistributionPointModal, { FSVFrequencyMapReverse } from './DistributionPointModal'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    editTextStyle: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    width_48_percent: {
        width: '48%'
    },
    deliveryDaysTextStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    textContainer: {
        marginTop: 5,
        flexDirection: 'row'
    },
    color_black: {
        color: 'black'
    },
    color_D3: {
        color: '#D3D3D3'
    },
    daysTextStyle: {
        marginRight: 8,
        fontWeight: '700'
    },
    dividerLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3',
        marginTop: 10,
        marginBottom: 10
    }
})

interface DistributionPointProps {
    dpData: any
    refresh: any
    showEdit: boolean
    count?: any
    l?: any
    isFromRequest?: boolean
    customer?: any
    globalModalRef?: MutableRefObject<any>
    type?: 'Lead' | 'RetailStore'
    copyDPList?: any
}

const DistributionPointTile = (props: DistributionPointProps) => {
    const {
        dpData,
        refresh,
        showEdit,
        count,
        l,
        isFromRequest,
        customer,
        globalModalRef,
        type = 'Lead',
        copyDPList = []
    } = props
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
    const [showDPModal, setShowDPModal] = useState(false)
    const refreshMT = () => {
        refresh()
    }
    useEffect(() => {
        if (!_.isEmpty(dpData.DELY_DAYS__c)) {
            const deliveryDay = dpData.DELY_DAYS__c
            const deliveryDaysList = deliveryDay.split(';')
            if (deliveryDaysList.length === 0 && deliveryDaysList[0] === '') {
                return
            }
            const tempDeliveryDays = initDeliveryDays()
            _.forEach(deliveryDaysList, (v) => {
                tempDeliveryDays[v] = true
            })
            setDeliveryDays(tempDeliveryDays)
        } else {
            setDeliveryDays(initDeliveryDays())
        }
    }, [dpData])
    return (
        <View>
            <View style={styles.editContainer}>
                <View>
                    <CText style={styles.fontWeight_700}>
                        {t.labels.PBNA_MOBILE_DISTRIBUTION_POINT}&nbsp;{count}
                    </CText>
                </View>
                {showEdit && (
                    <View style={commonStyle.flexDirectionRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDPModal(true)
                            }}
                        >
                            <CText style={styles.editTextStyle}>{t.labels.PBNA_MOBILE_EDIT.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={commonStyle.flexRowSpaceBet}>
                <View style={styles.width_48_percent}>
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_SALES_METHOD} fieldValue={dpData.SLS_MTHD_NM__c} />
                    <LeadFieldTile fieldName={t.labels.PBNA_MOBILE_PRODUCT_GROUP} fieldValue={dpData.PROD_GRP_NM__c} />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_ROUTE_NUMBER}
                        fieldValue={
                            dpData.Lead_DP_Route_Disp_NM__c ||
                            (dpData.SLS_MTHD_NM__c === 'FSV' &&
                                `${dpData['Route__r.GTMU_RTE_ID__c']} ${dpData['Route__r.RTE_TYP_GRP_NM__c'] || '-'} ${
                                    dpData['User__r.Name'] || ''
                                }`) ||
                            dpData.Route_Text__c
                        }
                        containerStyle={{ marginBottom: 5 }}
                    />
                    <View>
                        <CText style={styles.deliveryDaysTextStyle}>{t.labels.PBNA_MOBILE_DAYS}</CText>
                        <View style={styles.textContainer}>
                            <CText
                                style={[
                                    deliveryDays.Monday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                M
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Tuesday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                T
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Wednesday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                W
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Thursday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                T
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Friday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                F
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Saturday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                S
                            </CText>
                            <CText
                                style={[
                                    deliveryDays.Sunday ? styles.color_black : styles.color_D3,
                                    styles.daysTextStyle
                                ]}
                            >
                                S
                            </CText>
                        </View>
                    </View>
                </View>
                <View style={styles.width_48_percent}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_DELIVERY_METHOD}
                        fieldValue={dpData.DLVRY_MTHD_NM__c}
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
            <View style={styles.dividerLine} />
            <DistributionPointModal
                dpData={dpData}
                refresh={refreshMT}
                showDistributionPointModal={showDPModal}
                setShowDistributionPointModal={setShowDPModal}
                l={l}
                copyDPList={copyDPList}
                isEdit
                isFromRequest={isFromRequest}
                customer={customer}
                globalModalRef={globalModalRef}
                type={type}
            />
        </View>
    )
}

export default DistributionPointTile
