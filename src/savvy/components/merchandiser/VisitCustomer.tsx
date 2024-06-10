/* eslint-disable camelcase */
/**
 * @description A expandalbe card shows work order of the retail store
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-04-020
 * @LastModifiedDate 2021-04-20
 */
import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import 'moment-timezone'
import VisitCustomerMap from './VisitCustomerMap'
import VisitCustomerDetail from './VisitCustomerDetail'
import VisitCustomerUser from './VisitCustomerUser'
import VisitCustomerSocial from './VisitCustomerSocial'
import VisitCustomerAttr from './VisitCustomerAttr'
// import VisitCustomerOHours from './VisitCustomerOHours'
import VisitCustomerEexcDetail from './VisitCustomerEexcDetail'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    visitCustomerContainer: {
        backgroundColor: 'white'
    }
})

const VisitCustomer = (parentProps) => {
    const { customDetail } = parentProps
    const [customerData, setCustomerData] = useState(customDetail)

    useEffect(() => {
        setCustomerData(customDetail)
    })

    return (
        <View style={[styles.visitCustomerContainer, commonStyle.fullHeight]}>
            <VisitCustomerMap customerData={customerData} />
            <VisitCustomerDetail customerData={customerData} />
            {customerData.Sales_Rep__c && <VisitCustomerUser customerData={customerData} />}
            {/* <VisitCustomerOHours
                customerData={customerData}
            /> */}
            <VisitCustomerEexcDetail customerData={customerData} />
            <VisitCustomerSocial customerData={customerData} />
            <VisitCustomerAttr customerData={customerData} />
        </View>
    )
}

export default VisitCustomer
