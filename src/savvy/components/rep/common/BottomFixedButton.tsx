import { View, SafeAreaView, StyleSheet } from 'react-native'
import { Button, ButtonProps } from 'react-native-elements'
import React from 'react'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'

const styles = StyleSheet.create({
    ...commonStyle,
    bottomButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    zIndex_1: {
        zIndex: 1
    },
    buttonPositionAbsolute: {
        position: 'absolute',
        bottom: 0
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    buttonGrayText: {
        color: baseStyle.color.borderGray
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    }
})

type BottomFixedButtonProps = Partial<ButtonProps>

export const BottomFixedButton: React.FC<BottomFixedButtonProps> = ({
    title,
    disabled = false,
    onPress = () => {}
}) => {
    return (
        <SafeAreaView
            style={[
                styles.bgWhite,
                styles.bottomButton,
                styles.flexDirectionRow,
                styles.zIndex_1,
                styles.buttonPositionAbsolute
            ]}
        >
            <View style={styles.fullWidth}>
                <Button
                    title={title}
                    disabled={disabled}
                    onPress={onPress}
                    containerStyle={styles.buttonSize}
                    titleStyle={styles.font_12_700}
                    disabledStyle={styles.bgWhite}
                    disabledTitleStyle={[styles.buttonGrayText, styles.font_12_700]}
                    buttonStyle={[styles.bgPurpleColor, styles.buttonSize]}
                />
            </View>
        </SafeAreaView>
    )
}
