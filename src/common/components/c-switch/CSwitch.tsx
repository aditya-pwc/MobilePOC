/**
 * @description A customized switch component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-13
 */

import React, { FC } from 'react'
import { StyleSheet, Switch, TextStyle, View } from 'react-native'
import CText from '../CText'

interface CSwitchProps {
    label?: string
    labelStyle?: TextStyle
    showBottomLine?: boolean
    checked?: boolean
    toggleSwitch?: () => void
    disabled?: boolean
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000'
    },
    scale: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }]
    }
})

const CSwitch: FC<CSwitchProps> = (props: CSwitchProps) => {
    return (
        <View style={[styles.container, props.showBottomLine ? styles.bottomLine : null]}>
            <CText style={[styles.label, props.labelStyle]}>{props.label}</CText>
            <Switch
                ios_backgroundColor={'#565656'}
                value={props.checked}
                onValueChange={props.toggleSwitch}
                style={styles.scale}
                disabled={props.disabled}
            />
        </View>
    )
}

export default CSwitch
