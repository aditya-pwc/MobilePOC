/**
 * @description Component to show my leads list tile.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
/* eslint-disable camelcase */
import React from 'react'
import { TouchableOpacity } from 'react-native'
import LeadTile from './LeadTile'
import { goToLeadDetail } from '../../../../utils/LeadUtils'
import { renderLocation, renderPhone } from '../../../../../common/helpers/IconHelper'

interface AllLeadsListTileProps {
    l: {
        Pre_qualified_c__c: string
        Company__c: string
        Street__c: string
        City__c: string
        PostalCode__c: string
        State__c: string
        Last_Task_Modified_Date_c__c: string
        Tier_c__c: string
        Call_Counter_c__c: number
        Phone__c: number
        Lead_Latitude_c__c: number
        Lead_Longitude_c__c: number
    }
    navigation: any
    isGoBack?: boolean
    needCheckData?: boolean
}

const MyLeadsListTile: React.FunctionComponent<any> = (props: AllLeadsListTileProps) => {
    const { l, navigation, isGoBack, needCheckData } = props
    const goToLeadDetailLocal = (leadDetail) => {
        navigation.navigate('LeadDetailScreen', {
            lead: leadDetail,
            type: 'Negotiate',
            goBackDp: isGoBack
        })
    }
    return (
        <TouchableOpacity
            onPress={async () => {
                if (needCheckData) {
                    await goToLeadDetail(navigation, l)
                } else {
                    goToLeadDetailLocal(l)
                }
            }}
        >
            <LeadTile l={l}>
                {renderPhone(l.Phone__c)}
                {renderLocation(l.Lead_Latitude_c__c, l.Lead_Longitude_c__c)}
            </LeadTile>
        </TouchableOpacity>
    )
}

export default MyLeadsListTile
