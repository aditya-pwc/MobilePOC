/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-12-05 01:48:08
 * @LastEditTime: 2022-11-21 14:44:15
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState, useReducer } from 'react'
import { View, NativeAppEventEmitter } from 'react-native'
import { useDispatch } from 'react-redux'
import { compose } from '@reduxjs/toolkit'
import { CommonParam } from '../../../common/CommonParam'
import { Constants } from '../../../common/Constants'
import { Persona } from '../../../common/enums/Persona'
import { t } from '../../../common/i18n/t'
import { EventEmitterType } from '../../enums/Manager'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import { getNewWrapString } from '../../utils/CommonUtils'
import { updateLocationInfoInCopilot } from '../../utils/MerchManagerUtils'
import ReassignResultModal from '../manager/common/ReassignResultModal'
import Copilot from '../manager/copilot/Copilot'
import CopilotPage from '../merchandiser/CopilotPage'
import { commonStyle } from '../../../common/styles/CommonStyle'

const CopilotEntry = (props: any) => {
    const { navigation } = props
    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    const [switchLocSuc, setSwitchLocSuc] = useState(false)
    const dispatch = useDispatch()
    const updateLocationInfo = compose(dispatch, managerAction.setUserLocationInfo)
    useEffect(() => {
        if (CommonParam.PERSONA__c !== Persona.MERCHANDISER) {
            updateLocationInfoInCopilot(updateLocationInfo)
            setTimeout(() => {
                updateLocationInfoInCopilot(updateLocationInfo)
                if (CommonParam.isSwitchLocation) {
                    CommonParam.isSwitchLocation = false
                    setSwitchLocSuc(true)
                }
            }, Constants.ONE_SECOND_DELAY)
        }
        if (CommonParam.isSwitchPersona) {
            CommonParam.isSwitchPersona = false
        }
        const copilotEntryListener = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_COPILOT, async () => {
            forceUpdate()
        })
        return () => {
            copilotEntryListener && copilotEntryListener.remove()
        }
    }, [])
    return (
        <View style={commonStyle.flex_1}>
            {CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER && <Copilot navigation={navigation} />}
            {CommonParam.PERSONA__c === Persona.DELIVERY_SUPERVISOR && <Copilot navigation={navigation} />}
            {CommonParam.PERSONA__c === Persona.MERCH_MANAGER && <Copilot navigation={navigation} />}
            {CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER && <Copilot navigation={navigation} />}
            {CommonParam.PERSONA__c === Persona.MERCHANDISER && <CopilotPage navigation={navigation} />}
            <ReassignResultModal
                navigation={navigation}
                isLocationSwitchSuc
                switchSucMsg={
                    getNewWrapString(t.labels.PBNA_MOBILE_DELIVERIES_SWITCH_LOCATION_SUC_MSG) +
                    ' ' +
                    CommonParam.userLocationName
                }
                modalVisible={switchLocSuc}
                setModalVisible={setSwitchLocSuc}
            />
        </View>
    )
}

export default CopilotEntry
