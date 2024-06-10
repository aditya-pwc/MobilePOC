import _ from 'lodash'
import React from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'

const colors = {
    blue: '#00A2D9', // rgba(0,162,217, 1)
    white: '#FFFFFF',
    grey: '#D3D3D3'
} as const

const styles = StyleSheet.create({
    button: {
        borderRadius: 6,
        borderWidth: 1,
        paddingVertical: 15,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonDefaultColor: {
        color: colors.blue,
        borderColor: colors.blue
    },
    buttonPrimaryColor: {
        color: colors.white,
        backgroundColor: colors.blue,
        borderColor: colors.blue
    },
    buttonIconLayout: {
        display: 'flex',
        flexDirection: 'row'
    },
    label: {
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase'
    },
    labelDefault: {
        color: colors.blue
    },
    labelPrimary: {
        color: colors.white
    },
    disablePrimary: {
        backgroundColor: colors.grey,
        borderColor: colors.grey
    }
})

export type TTypeProp = 'primary' | 'default'

interface ButtonDebouncedProps extends TouchableOpacityProps {
    wait?: number
    type?: TTypeProp
    imageSource?: any
    title?: string
}

const IconButton: React.FC<ButtonDebouncedProps> = ({
    type = 'default',
    wait = 500,
    imageSource,
    title,
    onPress,
    disabled = false,
    children,
    ...props
}) => {
    const buttonStyles: any[] = [styles.button, styles.buttonIconLayout]
    const labelStyles: any[] = [styles.label]

    if (type === 'primary') {
        buttonStyles.push(styles.buttonPrimaryColor)
        labelStyles.push(styles.labelPrimary)
        if (disabled) {
            buttonStyles.push(styles.disablePrimary)
        }
    } else {
        if (disabled) {
            buttonStyles.push({ borderColor: colors.grey, backgroundColor: colors.white })
            labelStyles.push({ color: colors.grey })
        } else {
            buttonStyles.push(styles.buttonDefaultColor)
            labelStyles.push(styles.labelDefault)
        }
    }

    return (
        <TouchableOpacity
            style={buttonStyles}
            {...props}
            disabled={disabled}
            onPress={onPress && _.throttle(onPress, wait, { trailing: false })}
        >
            {imageSource && (
                <Image
                    source={imageSource}
                    style={{
                        width: 16,
                        height: 13,
                        marginRight: 10
                    }}
                />
            )}
            <CText style={labelStyles}>{title}</CText>
            {children}
        </TouchableOpacity>
    )
}

export const renderDefaultButtonExample = () => {
    return (
        <IconButton
            type={'default'}
            imageSource={ImageSrc.IMG_CAMERA1}
            title={'Execute'}
            onPress={() => {
                Alert.alert('button pressed')
            }}
        />
    )
}

export default IconButton
