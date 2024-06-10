/**
 * @description Select schedule component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-05-17
 */
import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { NavigationBarProps } from '../../interface/BaseInterface'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    left: {
        flex: 1,
        flexDirection: 'row'
    },
    navStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        bottom: 10
    },
    right: {
        flex: 1,
        flexDirection: 'row-reverse'
    }
})

const NavigationBar: FC<NavigationBarProps> = (props: NavigationBarProps) => {
    return (
        <View style={[styles.container, props.style]}>
            <View style={[styles.left, props.leftStyle]}>{props.left}</View>
            <View style={styles.navStyle}>
                <CText style={styles.title}>{props.title}</CText>
            </View>
            <View style={[styles.right, props.rightStyle]}>{props.right}</View>
        </View>
    )
}

export default NavigationBar
