import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { ATCModal } from './components/ATCModal'
import { ATCButton } from './components/ATCButton'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'

interface ATCSuccessHandlerProps extends React.PropsWithChildren {
    onGoToArchive: Function
}

const styles = StyleSheet.create({
    modalMessage: {
        marginVertical: 39,
        marginHorizontal: 39
    },
    modalButtons: {
        marginTop: 30,
        flexDirection: 'row'
    },
    modalMessageText: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center'
    },
    imgSuccess: {
        width: 60,
        height: 60,
        marginTop: 10,
        marginBottom: 25,
        alignSelf: 'center'
    }
})

export const ATCSuccessHandler: React.FC<ATCSuccessHandlerProps> = ({ onGoToArchive }) => {
    const isFocused = useIsFocused()
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        const showMessage = async () => {
            const atcSuccessMessage = await AsyncStorage.getItem('atc.successMessage')
            await AsyncStorage.removeItem('atc.successMessage')

            if (atcSuccessMessage) {
                setSuccessMessage(atcSuccessMessage)
            }
        }

        if (isFocused) {
            showMessage()
        }
    }, [isFocused])

    return (
        <>
            {successMessage.length > 0 && (
                <ATCModal visible>
                    <>
                        <View style={styles.modalMessage}>
                            <Image source={ImageSrc.ICON_SUCCESS} style={styles.imgSuccess} />
                            <CText style={styles.modalMessageText}>{successMessage}</CText>
                        </View>
                        <View style={styles.modalButtons}>
                            <ATCButton type={'cancel'} onPress={() => setSuccessMessage('')}>
                                <CText>OK</CText>
                            </ATCButton>
                            <ATCButton
                                type={'confirm'}
                                onPress={async () => {
                                    setSuccessMessage('')
                                    onGoToArchive()
                                }}
                            >
                                <CText>GO TO ARCHIVE</CText>
                            </ATCButton>
                        </View>
                    </>
                </ATCModal>
            )}
        </>
    )
}
