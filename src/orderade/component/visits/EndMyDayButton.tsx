/**
 * @description A bar to let the user click to end the day
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-04-01
 * @LastModifiedDate 2021-04-01 First Commit
 */
import React, { useRef } from 'react'
import { View, Animated, StyleSheet, Alert } from 'react-native'
import { Button } from 'react-native-elements'
import DeviceInfo from 'react-native-device-info'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { t } from '../../../common/i18n/t'
import { subjectMap } from '../../utils/VisitUtils'
import EventService from '../../service/EventService'

const isTablet = DeviceInfo.isTablet()
const styles = StyleSheet.create({
    containerStyle: {
        marginTop: 20,
        backgroundColor: '#fff',
        height: 44,
        width: 'auto',
        borderRadius: 5,
        marginRight: isTablet ? 80 : 22,
        marginLeft: isTablet ? 80 : 22
    },
    highlightContainerStyle: {
        backgroundColor: '#6C0CC3'
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    titleHighlighted: {
        color: '#FFF'
    },
    titleNormal: {
        color: '#6C0CC3'
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    disable: {
        backgroundColor: 'rgb(211, 211, 211)'
    },
    buttonStyle: {
        height: 44,
        lineHeight: 44,
        width: 'auto',
        borderRadius: 5
    },
    highlighted: {
        backgroundColor: '#6C0CC3'
    },
    normal: {
        backgroundColor: '#FFF'
    }
})
interface EndDayBarProps {
    onEnd: Function
    isAllCompleted: boolean
}

const EndMyDayButton: React.FC<EndDayBarProps> = (props) => {
    const { onEnd, isAllCompleted } = props
    const animation = useRef(new Animated.Value(0)).current
    const { dropDownRef } = useDropDown()
    const handlePress = async () => {
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }
        const activeEvent = await EventService.getActiveEvent()
        if (activeEvent) {
            const msg = `${t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_FIRST} ${subjectMap(activeEvent.Subject)} ${
                t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_FIRST3
            }`
            Alert.alert(t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_TITLE_END_DAY, msg, [
                {
                    text: t.labels.PBNA_MOBILE_OK
                }
            ])
            return
        }
        Animated.timing(animation, {
            toValue: 100,
            useNativeDriver: false,
            duration: 2000
        }).start()
        onEnd()
    }

    return (
        <View>
            {isAllCompleted && (
                <Button
                    onPress={handlePress}
                    title={
                        <CText style={[styles.titleStyle, styles.titleHighlighted]}>
                            {t.labels.PBNA_MOBILE_END_DAY}
                        </CText>
                    }
                    buttonStyle={[styles.buttonStyle, styles.highlighted]}
                    containerStyle={[styles.containerStyle, styles.highlightContainerStyle]}
                />
            )}
            {!isAllCompleted && (
                <Button
                    onPress={handlePress}
                    title={
                        <CText style={[styles.titleStyle, styles.titleNormal]}>{t.labels.PBNA_MOBILE_END_DAY}</CText>
                    }
                    buttonStyle={[styles.buttonStyle, styles.normal]}
                    containerStyle={styles.containerStyle}
                />
            )}
        </View>
    )
}

export default EndMyDayButton
