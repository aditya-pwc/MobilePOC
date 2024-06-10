import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import { t } from '../i18n/t'
import { baseStyle } from '../styles/BaseStyle'

interface FormBottomButtonProps {
    onPressCancel: any
    onPressSave: any
    disableCancel?: boolean
    disableSave?: boolean
    rightButtonLabel?: string
    leftButtonLabel?: string
    relative?: boolean
    roundedBottom?: boolean
    leftTitleStyle?: any
    rightTitleStyle?: any
}

export const styles = StyleSheet.create({
    bgWhiteColor: {
        backgroundColor: '#FFFFFF'
    },
    disableTitleColor: {
        color: '#D3D3D3'
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    shadowButton: {
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    halfLayout: {
        width: '50%'
    },
    bottomButton: {
        backgroundColor: 'white',
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        marginBottom: 30
    },
    smallFontSize: {
        fontSize: 14
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    textAlign: {
        textAlign: 'center'
    },
    borderRightShadow: {
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack
    },
    buttonPositionAbsolute: {
        position: 'absolute',
        bottom: 0
    },
    buttonPositionRelative: {
        position: 'relative'
    },
    bottomLeftRadius: {
        borderBottomLeftRadius: 8
    },
    bottomRightRadius: {
        borderBottomRightRadius: 8
    }
})

const FormBottomButton = (props: FormBottomButtonProps) => {
    const {
        onPressCancel,
        onPressSave,
        disableCancel,
        disableSave,
        leftButtonLabel,
        rightButtonLabel,
        relative,
        roundedBottom,
        leftTitleStyle,
        rightTitleStyle
    } = props
    return (
        <View
            style={[
                styles.bottomButton,
                styles.flexDirectionRow,
                { zIndex: 1 },
                relative ? styles.buttonPositionRelative : styles.buttonPositionAbsolute
            ]}
        >
            <View style={[styles.halfLayout, styles.shadowButton]}>
                <Button
                    onPress={onPressCancel}
                    title={leftButtonLabel || t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                    titleStyle={leftTitleStyle || [styles.fontFamily, styles.fontPurpleColor, styles.smallFontSize]}
                    buttonStyle={[
                        styles.buttonSize,
                        styles.bgWhiteColor,
                        styles.borderRightShadow,
                        roundedBottom ? styles.bottomLeftRadius : {}
                    ]}
                    disabled={disableCancel}
                    containerStyle={styles.buttonSize}
                    disabledStyle={styles.bgWhiteColor}
                    disabledTitleStyle={styles.disableTitleColor}
                />
            </View>
            <View style={[styles.halfLayout, styles.shadowButton]}>
                <Button
                    onPress={onPressSave}
                    title={rightButtonLabel || t.labels.PBNA_MOBILE_ADD_LEAD}
                    titleStyle={rightTitleStyle || [styles.fontFamily, styles.fontWhiteColor, styles.smallFontSize]}
                    disabled={disableSave}
                    containerStyle={styles.buttonSize}
                    disabledStyle={styles.bgWhiteColor}
                    disabledTitleStyle={styles.disableTitleColor}
                    buttonStyle={[
                        styles.bgPurpleColor,
                        styles.buttonSize,
                        roundedBottom ? styles.bottomRightRadius : {}
                    ]}
                />
            </View>
        </View>
    )
}

export default FormBottomButton
