import React, { useState, useImperativeHandle } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Button } from 'react-native-elements'
import { NavigationProp } from '@react-navigation/native'
import CText from '../../../common/components/CText'
import TitleModal from '../../../common/components/TitleModal'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    containerStyle: {
        height: 440,
        flexDirection: 'column',
        alignItems: 'center'
    },
    contentStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    contentTitle: {
        fontWeight: '700',
        fontSize: 18,
        maxWidth: '80%',
        textAlign: 'center'
    },
    contentText: {
        fontWeight: '700',
        fontSize: 14,
        marginTop: 15
    },
    imageStyle: {
        backgroundColor: '#FFFFFF',
        width: 164,
        height: 158,
        marginTop: 30,
        marginBottom: 30
    },
    buttonPosition: {
        bottom: 0,
        position: 'absolute',
        width: '100%',
        height: 60
    },
    buttonTitle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    buttonContainer: {
        width: '100%',
        height: 60,
        backgroundColor: '#6C0CC3',
        borderRadius: 0
    },
    buttonStyle: {
        backgroundColor: '#6C0CC3',
        height: '100%',
        width: '100%'
    }
})

interface ModalProps {
    cRef: any
    navigation: NavigationProp<any>
    onCheckOut: Function
}

const EndVisitCheckModal = (props: ModalProps) => {
    const { cRef, navigation, onCheckOut } = props
    const [showTitleModal, setShowTitleModal] = useState(false)

    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        setShowTitleModal(true)
    }

    const closeModal = () => {
        navigation.setOptions({ tabBarVisible: true })
        setShowTitleModal(false)
    }

    const handleCheckOut = () => {
        onCheckOut()
        setShowTitleModal(false)
    }

    useImperativeHandle(cRef, () => ({
        openModal: () => {
            openModal()
        }
    }))

    return (
        <TitleModal title={t.labels.PBNA_MOBILE_COMPLETE_VISIT} visible={showTitleModal} onClose={closeModal}>
            <View style={styles.containerStyle}>
                <View style={styles.contentStyle}>
                    <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_VISIT_EXIST_ORDERS}</CText>
                    <Image
                        style={styles.imageStyle}
                        source={require('../../../../assets/image/graphic_element_complete-visit.png')}
                    />
                    <CText style={styles.contentText}>{t.labels.PBNA_MOBILE_COMPLETE_VISIT_CHECK}</CText>
                </View>
                <View style={styles.buttonPosition}>
                    <Button
                        onPress={handleCheckOut}
                        title={<CText style={styles.buttonTitle}>{t.labels.PBNA_MOBILE_COMPLETE_VISIT_CONFIRM}</CText>}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonStyle}
                    />
                </View>
            </View>
        </TitleModal>
    )
}

export default EndVisitCheckModal
