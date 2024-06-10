/**
 * @description Location consent Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-09-15
 */
import React, { useState, useEffect, useImperativeHandle, FC } from 'react'
import { StyleSheet, View, Dimensions, Image, Modal } from 'react-native'
import { Button } from 'react-native-elements'
import { t } from '../../../common/i18n/t'
import { refreshLocationPermission } from '../../utils/PermissionUtils'
import CText from '../../../common/components/CText'
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
interface LocationConsentInterface {
    navigation?: any
    route?: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F2F4F7'
    },
    noticeImg: {
        width: 264,
        height: 264,
        marginTop: screenHeight * 0.21
    },
    noticeLabel: {
        fontSize: 16,
        color: '#000000',
        marginTop: screenHeight * 0.15,
        textAlign: 'center',
        fontWeight: '700',
        width: 300
    },
    noticeSubLabel: {
        marginTop: 50,
        fontSize: 12,
        color: '#565656',
        textAlign: 'center',
        fontWeight: '400'
    },
    buttonStyle: {
        width: screenWidth - 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6
    },
    btnTopMargin: {
        backgroundColor: '#00A2D9',
        marginTop: 50
    },
    btnTopMarginSub: {
        backgroundColor: '#FFFFFF',
        marginTop: 10
    },
    logoutTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF'
    },
    logoutTitleColor: {
        color: '#FFFFFF'
    },
    logoutTitleColorSub: {
        color: '#D3D3D3'
    }
})

const LocationConsent: FC<LocationConsentInterface> = React.forwardRef((props: LocationConsentInterface, ref) => {
    const [hasPermission, setHasPermission] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const getPremissionWhenBlocked = () => {
        if (!hasPermission) {
            refreshLocationPermission().then((result) => {
                if (result) {
                    setHasPermission(result)
                } else {
                    getPremissionWhenBlocked()
                }
            })
        }
    }

    useEffect(() => {
        getPremissionWhenBlocked()
    }, [])

    const openModal = (isPermission) => {
        setShowModal(true)
        setHasPermission(isPermission)
    }

    const closeModal = () => {
        setShowModal(false)
    }
    useImperativeHandle(ref, () => ({
        openModal: (isPermission) => {
            openModal(isPermission)
        },
        closeModal: () => {
            closeModal()
        }
    }))

    return (
        <Modal
            animationType="fade"
            visible={showModal}
            onRequestClose={() => {
                setShowModal(!showModal)
            }}
        >
            <View style={styles.container}>
                <Image
                    style={styles.noticeImg}
                    resizeMode="stretch"
                    source={require('../../../../assets/image/location_consent.png')}
                />
                <CText style={styles.noticeLabel}>{t.labels.PBNA_MOBILE_LOCATION_DIALOG}</CText>
                {!hasPermission && <CText style={styles.noticeSubLabel}>{t.labels.PBNA_MOBILE_LOCATION_TIPS}</CText>}
                <Button
                    onPress={() => {
                        if (hasPermission) {
                            closeModal()
                        }
                    }}
                    title={
                        <CText
                            style={[
                                styles.logoutTitle,
                                hasPermission ? styles.logoutTitleColor : styles.logoutTitleColorSub
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_OK}
                        </CText>
                    }
                    buttonStyle={[styles.buttonStyle, hasPermission ? styles.btnTopMargin : styles.btnTopMarginSub]}
                />
            </View>
        </Modal>
    )
})
LocationConsent.displayName = 'LocationConsent'

export default LocationConsent
