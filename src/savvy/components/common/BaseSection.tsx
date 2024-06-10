/*
 * @Description:
 * @LastEditors: Yi Li
 */
/**
 * @description Base section wrapper for lead details section.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC, ReactComponentElement } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingHorizontal: '5%',
        flexDirection: 'row',
        width: '100%'
    }
})

interface BaseSectionProps {
    containerStyle?: StyleProp<ViewStyle>
    children?: ReactComponentElement<any>
}

const BaseSection: FC<BaseSectionProps> = (props: BaseSectionProps) => {
    const { children, containerStyle } = props
    return <View style={containerStyle || styles.container}>{children}</View>
}

export default BaseSection
