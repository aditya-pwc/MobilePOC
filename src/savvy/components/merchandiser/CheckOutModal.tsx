/**
 * @description A modal to ask if the user want to complete visit when one or more workorder are open
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-04-01
 * @LastModifiedDate 2021-04-09 First Commit
 */
import React, { useState, useImperativeHandle, useCallback } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import CText from '../../../common/components/CText'
import { Button } from 'react-native-elements'
import TitleModal from '../../../common/components/TitleModal'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'

const styles = StyleSheet.create({
    containerStyle: {
        height: 405,
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
    cRef
    navigation
    onCheckOut
    visit
    checkinPosition
    inGeofence
}

const CheckOutModal = (props: ModalProps) => {
    const { cRef, navigation, onCheckOut, visit, checkinPosition, inGeofence } = props
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

    const onClickCheckOutBtn = useCallback(_.throttle(handleCheckOut, 2000, { leading: true, trailing: false }), [
        visit,
        inGeofence,
        checkinPosition
    ])

    useImperativeHandle(cRef, () => ({
        openModal: () => {
            openModal()
        }
    }))

    return (
        <TitleModal title={t.labels.PBNA_MOBILE_COMPLETE_VISIT} visible={showTitleModal} onClose={closeModal}>
            <View style={styles.containerStyle}>
                <View style={styles.contentStyle}>
                    <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_NO_MORE_WORK_ORDERS}</CText>
                    <Image
                        style={styles.imageStyle}
                        source={require('../../../../assets/image/graphic_element_complete-visit.png')}
                    />
                    <CText style={styles.contentText}>{t.labels.PBNA_MOBILE_COMPLETE_VISIT_CHECK}</CText>
                </View>
                <View style={styles.buttonPosition}>
                    <Button
                        onPress={onClickCheckOutBtn}
                        title={<CText style={styles.buttonTitle}>{t.labels.PBNA_MOBILE_COMPLETE_VISIT_CONFIRM}</CText>}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonStyle}
                    />
                </View>
            </View>
        </TitleModal>
    )
}

export default CheckOutModal
