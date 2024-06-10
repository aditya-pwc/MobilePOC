/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-12-05 00:15:24
 * @LastEditTime: 2022-11-21 14:43:44
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { commonStyle } from '../../../common/styles/CommonStyle'
import MyTeam from '../manager/my-team/MyTeam'
import MyTeamSDL from '../sales/my-team/MyTeamSDL'

const MyTeamEntry = (props: any) => {
    const { navigation, route } = props

    return (
        <View style={commonStyle.flex_1}>
            {CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER && (
                <MyTeamSDL navigation={navigation} route={route} />
            )}
            {(CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER ||
                CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR) && (
                <MyTeamSDL navigation={navigation} route={route} />
            )}
            {CommonParam.PERSONA__c === Persona.MERCH_MANAGER && <MyTeam navigation={navigation} route={route} />}
        </View>
    )
}

export default MyTeamEntry
