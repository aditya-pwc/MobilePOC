/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-23 11:11:01
 * @LastEditTime: 2022-11-21 21:59:12
 * @LastEditors: Mary Qian
 */
import React, { FC } from 'react'
import CText from '../../../common/components/CText'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'

interface EditButtonProps {
    onClick: any
}

const styles = StyleSheet.create({
    editView: {
        justifyContent: 'center'
    },
    editText: {
        color: '#00A2D9',
        fontWeight: '500'
    }
})

const EditButton: FC<EditButtonProps> = (props: EditButtonProps) => {
    const { onClick } = props
    return (
        <TouchableOpacity
            style={styles.editView}
            onPress={() => {
                onClick && onClick()
            }}
        >
            <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT}</CText>
        </TouchableOpacity>
    )
}

export default EditButton
