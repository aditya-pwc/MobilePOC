/*
 * @Description: A bar to show that the user is in lunch.
 * @Author: Christopher ZANG
 * @Date: 2021-03-21 22:59:04
 * @LastEditTime: 2023-10-23 10:23:45
 * @LastEditors: Mary Qian
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import Utils, { formatClock } from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { MerchEventType } from '../../enums/Manager'
import { sendLunchOverTimeNotification } from './MyVisitTab/InAppNoti'
import { NUMBER_VALUE } from '../../enums/MerchandiserEnums'
import _ from 'lodash'

interface ClockBarProps {
    endEvent
    d
    type
    eventId: string
}

const styles = StyleSheet.create({
    zIndex1000: {
        zIndex: 1000
    },
    clockStyle: {
        marginBottom: 20,
        backgroundColor: '#FFC409',
        height: 44,
        width: 'auto',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        zIndex: 1000
    },
    clockImg: {
        width: 16,
        height: 16,
        marginLeft: 20
    },
    endTextStyle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        fontSize: 12,
        color: '#000',
        textAlign: 'center'
    },
    clockTextStyle: {
        marginRight: 20,
        lineHeight: 16,
        fontFamily: 'Gotham',
        fontSize: 12,
        textAlign: 'right'
    },
    redEventBar: {
        backgroundColor: baseStyle.color.red
    },
    redEventBarText: {
        color: baseStyle.color.white
    },
    threeSameWidth: {
        flexGrow: 1
    }
})

const MAX_LUNCH_DURATION = 30

const ClockBar = (props: ClockBarProps) => {
    const { endEvent, d, type, eventId } = props
    const [breakDuration, setBreakDuration] = useState(d)
    const [isSentNotification, setIsSendNotification] = useState(false)

    useEffect(() => {
        setBreakDuration(d)
    }, [d])

    const handlePress = useCallback(
        _.throttle(
            () => {
                BreadcrumbsService.endBreak()
                endEvent()
            },
            2000,
            { leading: true, trailing: false }
        ),
        [endEvent]
    )

    const isLunchTimeMoreThanExpected = () => {
        return breakDuration > MAX_LUNCH_DURATION && type === MerchEventType.LUNCH
    }

    const isLunchTimeMoreThanExp = isLunchTimeMoreThanExpected()

    useEffect(() => {
        if (!isSentNotification && isLunchTimeMoreThanExp) {
            sendLunchOverTimeNotification(eventId)
            setIsSendNotification(true)
        }
    }, [breakDuration])

    return (
        <View style={styles.zIndex1000}>
            <TouchableOpacity onPress={handlePress}>
                <View
                    style={[
                        commonStyle.flexRowCenter,
                        styles.clockStyle,
                        isLunchTimeMoreThanExp && styles.redEventBar,
                        {
                            marginRight: Utils.isTablet ? 80 : 22,
                            marginLeft: Utils.isTablet ? 80 : 22
                        }
                    ]}
                >
                    <View style={styles.threeSameWidth}>
                        <Image
                            source={require('../../../../assets/image/ios-clock.png')}
                            style={[styles.clockImg, isLunchTimeMoreThanExp && { tintColor: baseStyle.color.white }]}
                        />
                    </View>
                    <CText
                        style={[
                            styles.endTextStyle,
                            styles.threeSameWidth,
                            isLunchTimeMoreThanExp && styles.redEventBarText
                        ]}
                    >
                        {`${t.labels.PBNA_MOBILE_END.toUpperCase()} ${type}`}
                    </CText>
                    <View style={styles.threeSameWidth}>
                        <CText style={[styles.clockTextStyle, isLunchTimeMoreThanExp && styles.redEventBarText]}>
                            {isLunchTimeMoreThanExp
                                ? `+${formatClock({
                                      hour: Math.floor(
                                          breakDuration - MAX_LUNCH_DURATION >= NUMBER_VALUE.TIME_UNIT
                                              ? (breakDuration - MAX_LUNCH_DURATION) / NUMBER_VALUE.TIME_UNIT
                                              : 0
                                      ),
                                      min: (breakDuration - MAX_LUNCH_DURATION) % NUMBER_VALUE.TIME_UNIT
                                  })}`
                                : formatClock({
                                      hour: Math.floor(
                                          breakDuration >= NUMBER_VALUE.TIME_UNIT
                                              ? breakDuration / NUMBER_VALUE.TIME_UNIT
                                              : 0
                                      ),
                                      min: breakDuration % NUMBER_VALUE.TIME_UNIT
                                  })}
                        </CText>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default ClockBar
