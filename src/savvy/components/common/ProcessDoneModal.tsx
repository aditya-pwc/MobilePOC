/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-23 11:10:45
 * @LastEditTime: 2022-11-21 22:28:57
 * @LastEditors: Mary Qian
 */
import React, { FC } from 'react'
import { Image, View, StyleSheet } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import ErrorSvg from '../../../../assets/image/icon-error.svg'
import { commonStyle } from '../../../common/styles/CommonStyle'

interface ProcessDoneModalProps {
    type: 'success' | 'failed'
    children: any
}

const styles = StyleSheet.create({
    marginBottom20: {
        marginBottom: 20
    },
    successImage: {
        width: 60,
        height: 57
    }
})

const ProcessDoneModal: FC<ProcessDoneModalProps> = (props: ProcessDoneModalProps) => {
    const { children, type } = props
    return (
        <View style={commonStyle.alignItemsCenter}>
            <View style={styles.marginBottom20}>
                {type === 'success' && <Image style={styles.successImage} source={ImageSrc.ICON_SUCCESS} />}
                {type === 'failed' && <ErrorSvg width={50} height={50} />}
            </View>
            {children}
        </View>
    )
}

export default ProcessDoneModal
