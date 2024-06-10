/**
 * @description Component to show lead card.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
/* eslint-disable camelcase */
import React from 'react'
import { StyleSheet } from 'react-native'
import LeadTile from './LeadTile'
import { renderLocation, renderPhone } from '../../../../../common/helpers/IconHelper'

interface OpenLeadCardProps {
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
        isAdded?: boolean
        Phone__c: number
        Lead_Latitude_c__c: number
        Lead_Longitude_c__c: number
    }
    inCustomerProfile?: boolean
}

const styles = StyleSheet.create({
    containerStyle: {
        marginTop: 0,
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0,
        shadowRadius: 0
    },
    locationButton: {
        height: 20.58,
        width: 18
    },
    callButton: {
        height: 18.35,
        width: 18,
        marginBottom: 20
    },
    customerProfileContainerStyle: {
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        flexDirection: 'column'
    }
})

const OpenLeadCard = (props: OpenLeadCardProps) => {
    const { l, inCustomerProfile } = props
    return (
        <LeadTile
            l={l}
            containerStyle={inCustomerProfile ? styles.customerProfileContainerStyle : styles.containerStyle}
        >
            {!inCustomerProfile && renderPhone(l.Phone__c)}
            {!inCustomerProfile && renderLocation(l.Lead_Latitude_c__c, l.Lead_Longitude_c__c)}
        </LeadTile>
    )
}

export default OpenLeadCard
