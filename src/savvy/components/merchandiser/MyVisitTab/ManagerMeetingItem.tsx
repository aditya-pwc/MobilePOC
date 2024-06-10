/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-30 00:51:21
 * @LastEditTime: 2022-05-30 01:04:47
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { t } from '../../../../common/i18n/t'
import { MeetingItem } from '../../manager/schedule/MeetingItem'

interface MyEventProps {
    item: any
    navigation: any
    clockStart?: any
    dayStart?: any
    onStartMeeting?: any
    onEndMeeting?: any
}

export const ManagerMeetingItem = (props: MyEventProps) => {
    const { item, navigation, clockStart, dayStart, onStartMeeting, onEndMeeting } = props

    const { dropDownRef } = useDropDown()

    return (
        <MeetingItem
            item={item}
            isMerchandiser
            onPress={() => {
                if (CommonParam.isSyncing) {
                    dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
                    return
                }
                navigation?.navigate('AddAMeeting', {
                    Id: item.Id,
                    isReadOnly: true,
                    isEmployee: true,
                    isDuplicate: true,
                    isMerchandiser: true,
                    eventItem: item,
                    clockStart,
                    dayStart,
                    onPressStartMeeting: (event) => {
                        if (!clockStart && !CommonParam.inMeeting) {
                            onStartMeeting('Meeting', event)
                        }
                    },
                    onPressEndMeeting: (event) => {
                        onEndMeeting(event)
                    }
                })
            }}
        />
    )
}
