/**
 * @description Button to Export Contact.
 * @author Kiren Cao
 * @date 2022-09-19
 */
import React, { FC } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
interface ExportButtonProps {
    color: any
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        marginRight: 20,
        marginTop: 11
    },
    line_1: {
        width: 28,
        height: 25,
        borderRadius: 4,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderTopWidth: 0
    },
    line_2: {
        width: 6,
        height: 3,
        position: 'absolute',
        left: 2,
        top: 0.1,
        borderTopLeftRadius: 20
    },
    line_3: {
        width: 6,
        height: 3,
        position: 'absolute',
        right: 2,
        top: 0.1,
        borderTopRightRadius: 20
    },
    line_4: {
        width: 3,
        height: 22,
        position: 'absolute',
        left: 12.5,
        bottom: 13,
        borderRadius: 8
    },
    line_5: {
        width: 11,
        height: 12,
        borderTopWidth: 2.5,
        borderRightWidth: 2.5,
        borderTopRightRadius: 3,
        position: 'absolute',
        left: 9,
        bottom: 24,
        transform: [{ rotate: '-45deg' }]
    }
})
const ExportButton: FC<ExportButtonProps> = (props: ExportButtonProps) => {
    const { color } = props

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.line_1, { borderColor: color }]} />
            <Animated.View style={[styles.line_2, { backgroundColor: color }]} />
            <Animated.View style={[styles.line_3, { backgroundColor: color }]} />
            <Animated.View style={[styles.line_4, { backgroundColor: color }]} />
            <Animated.View style={[styles.line_5, { borderColor: color }]} />
        </View>
    )
}
export default ExportButton
