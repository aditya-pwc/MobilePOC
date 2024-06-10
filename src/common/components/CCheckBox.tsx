/**
 * @description In order to use custom image in checkbox.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-04-02
 * @lastModifiedDate 2021-04-02
 */

import React, { FC } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../enums/ImageSrc'
import BlackCheckbox from '../../../assets/image/black_checkbox.svg'

const IMG_CHECK = ImageSrc.IMG_CHECK
const UNCHECK_BLUE = ImageSrc.UNCHECK_BLUE

interface CCheckBoxProps {
    title?: any
    containerStyle?: any
    textStyle?: any
    checked?: boolean
    disabled?: boolean
    onPress?: any
    readonly?: boolean
    hitSlop?: any
}

const styles = StyleSheet.create({
    checkedIcon: {
        width: 24,
        height: 24,
        marginRight: 5
    },
    containerStyle: {
        borderWidth: 0,
        padding: 0
    },
    disabledBorder: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 5,
        height: 18,
        width: 18,
        marginRight: 5
    },
    readonly: {
        borderRadius: 3,
        backgroundColor: '#000',
        height: 18,
        width: 18,
        marginRight: 5
    }
})

const CCheckBox: FC<CCheckBoxProps> = (props: CCheckBoxProps) => {
    return (
        <CheckBox
            {...props}
            checkedIcon={
                !props.readonly ? (
                    <Image source={IMG_CHECK} style={styles.checkedIcon} />
                ) : (
                    <BlackCheckbox width={24} height={24} />
                )
            }
            uncheckedIcon={
                !props.readonly ? (
                    <Image source={UNCHECK_BLUE} style={styles.checkedIcon} />
                ) : (
                    <View style={[styles.disabledBorder]} />
                )
            }
            containerStyle={[styles.containerStyle, props.containerStyle]}
            textStyle={[props.textStyle]}
        />
    )
}

export default CCheckBox
