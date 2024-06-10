/*
 * @Description: A expandalbe card shows work order of the retail store
 * @Author: Christopher ZANG
 * @Date: 2021-08-23 13:59:18
 * @LastEditTime: 2021-12-03 17:03:48
 * @LastEditors: Aimee Zhang
 */
import React from 'react'
import { View } from 'react-native'
import 'moment-timezone'
import CText from '../../../common/components/CText'
import CustomerDetailStyle from '../../styles/manager/CustomerDetailStyle'
import { handleDayStatus } from '../../utils/MerchManagerUtils'
import { wStatusView } from '../manager/my-customers/CustomerDetail'
import { t } from '../../../common/i18n/t'

const businessSegMap = (businessSeg) => {
    const businessSegObj = {
        'Large Format': t.labels.PBNA_MOBILE_LARGE_FORMAT,
        'Small Format': t.labels.PBNA_MOBILE_SMALL_FORMAT,
        'FoodService Format': t.labels.PBNA_MOBILE_FOOD_SERVICE
    }
    return businessSeg ? businessSegObj[businessSeg] : ''
}
const VisitCustomerDetail = (parentProps) => {
    const customerStyle = CustomerDetailStyle
    const { customerData } = parentProps
    customerData.orderDays = handleDayStatus(customerData.Merchandising_Order_Days__c || '')
    customerData.deliveryDays = handleDayStatus(customerData.Merchandising_Delivery_Days__c || '')
    return (
        <View style={[customerStyle.daysViewContainer, { backgroundColor: '#FFF' }]}>
            <View style={customerStyle.daysViewRowContainer}>
                <View style={customerStyle.daysViewRowItemView}>
                    <CText style={customerStyle.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_CD_STORE_NUMBER}</CText>
                    <CText style={customerStyle.daysViewRowItemValue} numberOfLines={2}>
                        {customerData.CUST_ID__c || ''}
                    </CText>
                </View>
                <View style={customerStyle.daysViewRowItemView}>
                    <CText style={customerStyle.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}</CText>
                    <CText style={customerStyle.daysViewRowItemValue} numberOfLines={2}>
                        {businessSegMap(customerData.BUSN_SGMNTTN_LVL_3_NM__c || '')}
                    </CText>
                </View>
            </View>
            <View style={[customerStyle.daysViewRowContainer, customerStyle.paddingTop_15]}>
                <View style={customerStyle.daysViewRowItemView}>
                    <CText style={customerStyle.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                    <View style={customerStyle.daysViewRowItemDayItemView}>
                        {customerData.orderDays.map((wStatus, index) => {
                            return wStatusView(wStatus, index)
                        })}
                    </View>
                </View>
                <View style={customerStyle.daysViewRowItemView}>
                    <CText style={customerStyle.daysViewRowItemTitle}>{t.labels.PBNA_MOBILE_DELIVERY_DAYS}</CText>
                    <View style={customerStyle.daysViewRowItemDayItemView}>
                        {customerData.deliveryDays.map((wStatus, index) => {
                            return wStatusView(wStatus, index)
                        })}
                    </View>
                </View>
            </View>
        </View>
    )
}

export default VisitCustomerDetail
