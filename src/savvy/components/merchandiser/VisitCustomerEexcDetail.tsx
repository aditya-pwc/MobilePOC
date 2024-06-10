/* eslint-disable camelcase */

import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import { workOrderStyles } from '../../module/work-order/WorkOrderStyle'
import { SoupService } from '../../service/SoupService'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CollapseButton from '../common/CollapseButton'
import CText from '../../../common/components/CText'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */

const styles = StyleSheet.create({
    customerEevcContainer: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    visitEevcInner: {
        width: '100%',
        height: 70,
        padding: 22
    },
    deliveryExecutionText: {
        fontWeight: '700',
        fontSize: 18
    },
    padding22AndMargin20: {
        paddingHorizontal: 22,
        marginBottom: 20
    }
})
const VisitCustomerEexcDetail = (parentProps) => {
    const { customerData } = parentProps
    const [isExpanded, setIsExpanded] = useState(true)
    const handleCollapse = () => {
        setIsExpanded(!isExpanded)
    }
    const [ctrData, setCTRData] = useState({
        productGroup: '',
        deliveryMethod: '',
        salesMethod: '',
        deliveryFreq: ''
    })
    const getFormattedDate = (date) => {
        if (!date || date === '') {
            return ''
        }
        return moment(date).format('DD MMM, YYYY')
    }
    useEffect(() => {
        SoupService.retrieveDataFromSoup('Customer_to_Route__c', {}, [], null, [
            ` WHERE {Customer_to_Route__c:Customer__c}='${customerData.accountId}'`
        ])
            .then((res) => {
                if (res && res.length > 0) {
                    const data = res[0]
                    data.productGroup = data.PROD_GRP_NM__c
                    data.deliveryMethod = data.DLVRY_MTHD_NM__c
                    data.salesMethod = data.SLS_MTHD_NM__c
                    SoupService.retrieveDataFromSoup('Route_Frequency_Mapping__mdt', {}, [], null).then((type) => {
                        const t = type.find((ty) => ty.Code__c === data.CUST_RTE_FREQ_CDE__c)
                        data.deliveryFreq = t.Label
                        setCTRData(data)
                    })
                } else {
                    storeClassLog(Log.MOBILE_WARN, 'VisitCustomerDetail.useEffect', 'No CTR')
                }
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'VisitCustomerDetail.useEffect', ErrorUtils.error2String(err))
            })
    }, [])
    return (
        <View style={styles.customerEevcContainer}>
            <TouchableOpacity
                onPress={() => {
                    handleCollapse()
                }}
                activeOpacity={1}
                style={[commonStyle.flexRowSpaceBet, styles.visitEevcInner]}
            >
                <View style={commonStyle.flexRowAlignCenter}>
                    <CText style={styles.deliveryExecutionText}>{t.labels.PBNA_MOBILE_DELIVERY_EXECUTION}</CText>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <CollapseButton isExpanded={isExpanded} />
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!isExpanded}>
                <View style={styles.padding22AndMargin20}>
                    <View style={[workOrderStyles.rowWithCenter, workOrderStyles.baseLine]}>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>
                                {t.labels.PBNA_MOBILE_CD_DELIVERY_EXECUTION}
                            </CText>
                            <CText style={workOrderStyles.valueStyle}>{ctrData.deliveryFreq}</CText>
                        </View>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>{t.labels.PBNA_MOBILE_CD_PRODUCT_GROUP}</CText>
                            <CText style={workOrderStyles.valueStyle}>{ctrData.productGroup}</CText>
                        </View>
                    </View>
                    <View style={[workOrderStyles.rowWithCenter, workOrderStyles.baseLine]}>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>{t.labels.PBNA_MOBILE_CD_SALES_METHOD}</CText>
                            <CText style={workOrderStyles.valueStyle}>{ctrData.salesMethod}</CText>
                        </View>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>{t.labels.PBNA_MOBILE_CD_DELIVERY_METHOD}</CText>
                            <CText style={workOrderStyles.valueStyle}>{ctrData.deliveryMethod}</CText>
                        </View>
                    </View>
                    <View style={[workOrderStyles.rowWithCenter, workOrderStyles.baseLine]}>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>
                                {t.labels.PBNA_MOBILE_CD_SEASONAL_CLOSE_START_DATE}
                            </CText>
                            <CText style={workOrderStyles.valueStyle}>
                                {getFormattedDate(customerData.SSONL_CLSD_STRT_DT__c)}
                            </CText>
                        </View>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>
                                {t.labels.PBNA_MOBILE_CD_SEASONAL_CLOSE_END_DATE}
                            </CText>
                            <CText style={workOrderStyles.valueStyle}>
                                {getFormattedDate(customerData.SSONL_CLSD_END_DT__c)}
                            </CText>
                        </View>
                    </View>
                    <View style={[workOrderStyles.rowWithCenter, workOrderStyles.baseLine]}>
                        <View style={[workOrderStyles.propertyStyle, { width: '45%' }]}>
                            <CText style={workOrderStyles.labelStyle}>{t.labels.PBNA_MOBILE_CD_PAYMENT_METHOD}</CText>
                            <CText style={workOrderStyles.valueStyle}>{customerData.PAYMT_MTHD_NM__c}</CText>
                        </View>
                    </View>
                </View>
            </Collapsible>
        </View>
    )
}

export default VisitCustomerEexcDetail
