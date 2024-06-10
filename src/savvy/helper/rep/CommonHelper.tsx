/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-11-10 02:01:27
 * @LastEditTime: 2022-11-21 19:44:06
 * @LastEditors: Yi Li
 */
import moment from 'moment'
import LeadFieldTile from '../../components/rep/lead/common/LeadFieldTile'
import React from 'react'
import { LeadStatus } from '../../enums/Lead'
import CCheckBox from '../../../common/components/CCheckBox'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'

export const renderDeferredDateTile = (l) => {
    return (
        <LeadFieldTile
            fieldName={'Date for Re-Engagement'}
            showPurpleDot={
                moment(l.Deferred_Resume_Date_c__c).isAfter(moment().add(-30, MOMENT_STARTOF.DAY)) &&
                moment(l.Deferred_Resume_Date_c__c).isBefore(moment())
            }
            fieldValue={moment(l.Deferred_Resume_Date_c__c).format('MMM D, YYYY')}
        />
    )
}

export const renderCheckBox = (customer, onCheck) => {
    return (
        <CCheckBox
            checked={customer.checked}
            containerStyle={{ position: 'absolute', right: 13 }}
            onPress={() => {
                onCheck()
            }}
        />
    )
}

export const judgeLeadEditable = (l) => {
    return (
        l.Status__c === LeadStatus.NO_SALE ||
        l.Status__c === LeadStatus.OPEN ||
        l.Status__c === LeadStatus.BUSINESS_WON ||
        l.COF_Triggered_c__c === '1'
    )
}
