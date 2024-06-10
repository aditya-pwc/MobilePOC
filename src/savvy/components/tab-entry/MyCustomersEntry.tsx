/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-12-05 00:15:32
 * @LastEditTime: 2022-11-21 14:44:05
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { commonStyle } from '../../../common/styles/CommonStyle'
import MyCustomers from '../manager/my-customers/MyCustomers'
import SDLMyCustomer from '../sales/my-customer/SDLMyCustomer'

const MyCustomersEntry = (props: any) => {
    const { navigation, route } = props

    return (
        <View style={commonStyle.flex_1}>
            {CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER && (
                <SDLMyCustomer navigation={navigation} route={route} />
            )}
            {CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR && (
                <SDLMyCustomer navigation={navigation} route={route} />
            )}
            {CommonParam.PERSONA__c === Persona.MERCH_MANAGER && <MyCustomers navigation={navigation} route={route} />}
            {CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER && (
                <SDLMyCustomer navigation={navigation} route={route} />
            )}
        </View>
    )
}

export default MyCustomersEntry
