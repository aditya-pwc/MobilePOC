import React, { useState, useImperativeHandle } from 'react'
import { View, Image, StyleSheet } from 'react-native'

import { Button } from 'react-native-elements'
import _ from 'lodash'

import CText from '../../../common/components/CText'
import TitleModal from '../../../common/components/TitleModal'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

interface ModalProps {
    cRef
    navigation
    enterClock
}

const styles = StyleSheet.create({
    logTimeStyle: {
        height: 390,
        flexDirection: 'column',
        width: '100%'
    },
    frameStyle: {
        marginTop: 39,
        marginBottom: 20
    },
    pleaseChooseStyle: {
        width: 161,
        height: 48,
        fontSize: 18,
        fontWeight: '900',
        lineHeight: 24,
        textAlign: 'center'
    },
    flexDirectionStyle: {
        flexDirection: 'column'
    },
    lunchStyle: {
        height: 16,
        width: 28,
        marginRight: 13
    },
    eventTextStyle: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    eventButtonStyle: {
        height: 45,
        backgroundColor: '#6C0CC3'
    },
    eventButtonContainer: {
        width: '90%',
        borderRadius: 5,
        height: 45,
        backgroundColor: '#6C0CC3'
    },
    breakStyle: {
        height: 28,
        width: 28,
        marginRight: 13
    },
    marginTop15: {
        marginTop: 15
    },
    meetingStyle: {
        height: 25,
        width: 25,
        marginRight: 10
    },
    personalTimeStyle: {
        height: 20,
        width: 24,
        marginRight: 10
    }
})
const BreakModal = (props: ModalProps) => {
    const { cRef, navigation, enterClock } = props
    const [showTitleModal, setShowTitleModal] = useState(false)

    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        setShowTitleModal(true)
    }

    const closeModal = () => {
        navigation.setOptions({ tabBarVisible: true })
        setShowTitleModal(false)
    }

    useImperativeHandle(cRef, () => ({
        openModal: () => {
            openModal()
        },
        closeModal: () => {
            closeModal()
        }
    }))

    const handleClock = _.throttle((type) => {
        enterClock(type, {})
        setShowTitleModal(false)
    }, 2000)

    return (
        <TitleModal title={t.labels.PBNA_MOBILE_LOG_TIME} visible={showTitleModal} onClose={closeModal}>
            <View style={styles.logTimeStyle}>
                <View style={[commonStyle.alignCenter, styles.frameStyle]}>
                    <CText style={styles.pleaseChooseStyle}>{t.labels.PBNA_MOBILE_PLEASE_CHOOSE}</CText>
                </View>
                <View style={[commonStyle.alignCenter, styles.flexDirectionStyle]}>
                    <Button
                        onPress={() => handleClock('Lunch')}
                        icon={
                            <Image
                                style={styles.lunchStyle}
                                source={require('../../../../assets/image/icon-lunch.png')}
                            />
                        }
                        title={<CText style={styles.eventTextStyle}>{t.labels.PBNA_MOBILE_LUNCH.toUpperCase()}</CText>}
                        containerStyle={styles.eventButtonContainer}
                        buttonStyle={styles.eventButtonStyle}
                    />
                    <Button
                        onPress={() => handleClock('Break')}
                        icon={
                            <Image
                                style={styles.breakStyle}
                                source={require('../../../../assets/image/icon-break.png')}
                            />
                        }
                        title={<CText style={styles.eventTextStyle}>{t.labels.PBNA_MOBILE_BREAK.toUpperCase()}</CText>}
                        containerStyle={[styles.eventButtonContainer, styles.marginTop15]}
                        buttonStyle={styles.eventButtonStyle}
                    />
                    <Button
                        onPress={() => handleClock('Meeting')}
                        icon={
                            <Image
                                style={styles.meetingStyle}
                                source={require('../../../../assets/image/icon-meeting.png')}
                            />
                        }
                        title={
                            <CText style={styles.eventTextStyle}>{t.labels.PBNA_MOBILE_MEETING.toUpperCase()}</CText>
                        }
                        containerStyle={[styles.eventButtonContainer, styles.marginTop15]}
                        buttonStyle={styles.eventButtonStyle}
                    />
                    <Button
                        onPress={() => handleClock('Personal Time')}
                        icon={
                            <Image
                                style={styles.personalTimeStyle}
                                source={require('../../../../assets/image/icon-personal-time.png')}
                            />
                        }
                        title={<CText style={styles.eventTextStyle}>Personal</CText>}
                        containerStyle={[styles.eventButtonContainer, styles.marginTop15]}
                        buttonStyle={styles.eventButtonStyle}
                    />
                </View>
            </View>
        </TitleModal>
    )
}

export default BreakModal
