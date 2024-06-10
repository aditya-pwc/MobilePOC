import React, { useState, useEffect } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import DeviceInfo from 'react-native-device-info'
import { formatClock } from '../../utils/VisitUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

interface ClockBarProps {
    endEvent
    d
    type
    isShowStartMyDay
}

const styles = StyleSheet.create({
    zIndex1000: {
        zIndex: 1000,
        backgroundColor: '#F2F4F7'
    },
    clockStyle: {
        backgroundColor: '#FFC409',
        height: 44,
        width: 'auto',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        zIndex: 1000,
        marginTop: -20
    },
    clockWidth: {
        width: '30%'
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
        width: '40%',
        textAlign: 'center'
    },
    clockFrame: {
        width: '30%',
        alignItems: 'flex-end'
    },
    clockTextStyle: {
        marginRight: 20,
        lineHeight: 16,
        fontFamily: 'Gotham',
        fontSize: 12
    }
})
const ClockBar = (props: ClockBarProps) => {
    const { endEvent, d, type } = props
    const [breakDuration, setBreakDuration] = useState(d)
    useEffect(() => {
        setBreakDuration(d)
    }, [d])

    const handlePress = () => {
        endEvent()
    }

    return (
        <View style={styles.zIndex1000}>
            <TouchableOpacity onPress={handlePress}>
                <View
                    style={[
                        commonStyle.flexRowCenter,
                        styles.clockStyle,
                        {
                            marginRight: DeviceInfo.isTablet() ? 80 : 22,
                            marginLeft: DeviceInfo.isTablet() ? 80 : 22,
                            marginTop: props.isShowStartMyDay ? 10 : -20
                        }
                    ]}
                >
                    <View style={styles.clockWidth}>
                        <Image source={require('../../../../assets/image/ios-clock.png')} style={styles.clockImg} />
                    </View>
                    <CText style={styles.endTextStyle}>{`${t.labels.PBNA_MOBILE_END.toUpperCase()} ${type}`}</CText>
                    <View style={styles.clockFrame}>
                        <CText style={styles.clockTextStyle}>
                            {formatClock({
                                hour: Math.floor(breakDuration >= 60 ? breakDuration / 60 : 0),
                                min: breakDuration % 60
                            })}
                        </CText>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default ClockBar
