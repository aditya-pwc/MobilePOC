/**
 * @description A bar to let the user click to end the day
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-04-01
 * @LastModifiedDate 2021-04-01 First Commit
 */
import React, { useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements'
import Utils from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: '#fff',
        height: 44,
        width: 'auto',
        borderRadius: 5,
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22
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
    onEnd
    isAllCompleted
}

const EndMyDayBar = (props: EndDayBarProps) => {
    const { onEnd, isAllCompleted } = props
    const animation = useRef(new Animated.Value(0)).current
    const handlePress = () => {
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

export default EndMyDayBar
