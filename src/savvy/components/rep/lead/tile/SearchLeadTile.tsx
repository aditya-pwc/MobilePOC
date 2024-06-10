/**
 * @description Component to show open leads list tile.
 * @author Qiulin Deng
 * @date 2021-07-26
 */
/* eslint-disable camelcase */
import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import LeadTile from './LeadTile'
import { goToLeadDetail } from '../../../../utils/LeadUtils'

interface SearchLeadTileProps {
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
        Status__c: string
        Contact_Made_Counter_c__c: number
        PD_Contact_Made_Counter_c__c: number
        PD_Call_Counter_c__c: number
        isAdded?: boolean
    }
    navigation: any
}

const styles = StyleSheet.create({
    dupContainer: {
        backgroundColor: 'white',
        marginTop: 22,
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

const SearchLeadTile = (props: SearchLeadTileProps) => {
    const { l, navigation } = props
    return (
        <TouchableOpacity
            onPress={async () => {
                await goToLeadDetail(navigation, l)
            }}
        >
            <LeadTile l={l} containerStyle={styles.dupContainer} />
        </TouchableOpacity>
    )
}

export default SearchLeadTile
