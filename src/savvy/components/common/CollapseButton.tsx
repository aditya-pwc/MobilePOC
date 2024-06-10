import React, { FC } from 'react'
import { View, StyleSheet } from 'react-native'

interface CollapseButtonProps {
    isExpanded: boolean
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 4,
        marginTop: 2,
        marginRight: 4,
        width: 14,
        height: 14,
        borderTopWidth: 2.5,
        borderRightWidth: 2.5,
        borderTopColor: '#000',
        borderRightColor: '#000'
    }
})

const CollapseButton: FC<CollapseButtonProps> = (props: CollapseButtonProps) => {
    const { isExpanded } = props

    return (
        <View
            style={[
                styles.container,
                {
                    top: isExpanded ? 5 : -5,
                    transform: [
                        {
                            rotate: isExpanded ? '-45deg' : '135deg'
                        }
                    ]
                }
            ]}
        />
    )
}

export default CollapseButton
