import { CheckBox } from 'react-native-elements'
import { Image, StyleSheet } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import React, { FC } from 'react'

const styles = StyleSheet.create({
    radioContainer: {
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: '400'
    },
    radioTile: {
        flexDirection: 'row',
        marginTop: 30,
        height: 30,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    }
})

interface CRadioButtonProps {
    title?: string
    onPress: any
    disabled?: boolean
    checked: any
    filter?: boolean
    hitSlop?: any
    autoWidth?: boolean
}

const CRadioButton: FC<CRadioButtonProps> = (props: CRadioButtonProps) => {
    let width = props.filter ? '45%' : '33%'
    if (props.autoWidth) {
        width = 'auto'
    }
    return (
        <CheckBox
            title={props.title}
            onPress={() => {
                props.onPress()
            }}
            disabled={props.disabled}
            checked={props.checked}
            checkedIcon={
                <Image
                    source={props.disabled ? ImageSrc.IMG_CHECK_CIRCLE_GRAY : ImageSrc.IMG_CHECK_CIRCLE}
                    style={styles.checkedIcon}
                />
            }
            uncheckedIcon={
                <Image
                    source={props.disabled ? ImageSrc.IMG_UNCHECK_CIRCLE_GRAY : ImageSrc.IMG_UNCHECK_CIRCLE}
                    style={styles.checkedIcon}
                />
            }
            containerStyle={[styles.radioContainer, { width }]}
            textStyle={[props.filter ? { fontSize: 14 } : { fontSize: 12 }, styles.radioLabel]}
            hitSlop={props.hitSlop}
        />
    )
}

export default CRadioButton
