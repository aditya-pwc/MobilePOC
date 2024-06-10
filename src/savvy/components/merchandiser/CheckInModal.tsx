/**
/**
 * @description A modal to ask if the user want to take a lunch or have a break.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-03-21
 * @LastModifiedDate 2021-03-21 First Commit
 */
import React, { useState, useImperativeHandle, useCallback } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import CText from '../../../common/components/CText'
import TitleModal from '../../../common/components/TitleModal'
import { Button } from 'react-native-elements'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'

const styles = StyleSheet.create({
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 23
    },
    titleStyle: {
        width: 'auto',
        height: 48,
        fontSize: 18,
        fontWeight: '900',
        lineHeight: 24,
        textAlign: 'center'
    },
    imgContainer: {
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imgStyle: {
        width: 180,
        height: 180
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 23
    },
    textStyle: {
        width: 'auto',
        height: 48,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 24,
        textAlign: 'center'
    },
    buttonView: {
        flexDirection: 'row',
        bottom: 0,
        position: 'absolute'
    },
    buttonText: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    buttonContainer: {
        width: '100%',
        borderRadius: 0,
        height: 60,
        backgroundColor: '#6C0CC3'
    },
    buttonStyle: {
        height: 60,
        backgroundColor: '#6C0CC3',
        paddingBottom: 30
    },
    buttonTitle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    startVisitStyle: {
        height: 420,
        flexDirection: 'column',
        alignItems: 'center'
    }
})
interface ModalProps {
    cRef
    navigation
    onCheckin
    visit
    checkinPosition
    inGeofence
}

const CheckInModal = (props: ModalProps) => {
    const { cRef, navigation, onCheckin, visit, checkinPosition, inGeofence } = props
    const [showTitleModal, setShowTitleModal] = useState(false)

    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        setShowTitleModal(true)
    }

    const closeModal = () => {
        navigation.setOptions({ tabBarVisible: true })
        setShowTitleModal(false)
    }

    const handleBreak = () => {
        onCheckin()
        setShowTitleModal(false)
    }

    const onClickCheckInBtn = useCallback(_.throttle(handleBreak, 2000, { leading: true, trailing: false }), [
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
        <TitleModal title={t.labels.PBNA_MOBILE_START_VISIT} visible={showTitleModal} onClose={closeModal}>
            <View style={styles.startVisitStyle}>
                <View style={styles.titleContainer}>
                    <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_NOT_IN_LOCATION}</CText>
                </View>
                <View style={styles.imgContainer}>
                    <Image
                        style={styles.imgStyle}
                        source={require('../../../../assets/image/graphic_element_not-in-geofence.png')}
                    />
                </View>
                <View style={styles.textContainer}>
                    <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_CONTINUE_VISIT}</CText>
                </View>
                <View style={styles.buttonView}>
                    <Button
                        onPress={() => onClickCheckInBtn()}
                        title={
                            <CText style={styles.buttonText}>
                                {`${t.labels.PBNA_MOBILE_YES.toUpperCase()}, ${t.labels.PBNA_MOBILE_START_VISIT}`}
                            </CText>
                        }
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonStyle}
                        titleStyle={styles.buttonTitle}
                    />
                </View>
            </View>
        </TitleModal>
    )
}

export default CheckInModal
