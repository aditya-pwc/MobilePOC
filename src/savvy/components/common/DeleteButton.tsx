/**
 * @description The wrapper for delete button in the form.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC } from 'react'
import CText from '../../../common/components/CText'
import { TouchableOpacity, StyleSheet } from 'react-native'

interface DeleteButtonProps {
    label: string
    handlePress: () => void
}

const styles = StyleSheet.create({
    baseContainer: {
        borderWidth: 1,
        borderColor: '#EB445A',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: '100%',
        marginTop: 20
    },
    label: {
        color: '#EB445A',
        fontWeight: '500'
    }
})

export const DeleteButton: FC<DeleteButtonProps> = (props: DeleteButtonProps) => {
    const { label, handlePress } = props
    return (
        <TouchableOpacity
            style={styles.baseContainer}
            onPress={() => {
                handlePress && handlePress()
            }}
        >
            <CText style={styles.label}>{label}</CText>
        </TouchableOpacity>
    )
}

export default DeleteButton
