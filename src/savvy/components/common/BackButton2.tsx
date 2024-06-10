import React, { FC } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'

interface BackButton2Props {
    onPress: any
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0
    },
    content: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }],
        borderTopColor: '#0098D4',
        borderRightColor: '#0098D4'
    }
})

const BackButton2: FC<BackButton2Props> = (props: BackButton2Props) => {
    const { onPress } = props
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                onPress && onPress()
            }}
            hitSlop={commonStyle.hitSlop30}
        >
            <View style={styles.content} />
        </TouchableOpacity>
    )
}

export default BackButton2
