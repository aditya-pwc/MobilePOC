/**
 * @description A modal to ask if the user want to end the day with one or more visit open
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-04-01
 * @LastModifiedDate 2021-04-01 First Commit
 */
import React, { useRef, useImperativeHandle } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import CText from '../../../common/components/CText'
import { Button } from 'react-native-elements'
import { Modalize } from 'react-native-modalize'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    containerStyle: {
        height: 465,
        flexDirection: 'column'
    },
    headerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
        borderBottomWidth: 1,
        paddingBottom: 15,
        marginLeft: 25,
        marginRight: 25,
        borderColor: '#D3D3D3'
    },
    headerTextStyle: {
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase'
    },
    contentStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
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
    buttonLocation: {
        bottom: 0,
        position: 'absolute',
        width: '100%',
        height: 60
    },
    buttonContainer: {
        width: '100%',
        height: 60,
        backgroundColor: '#6C0CC3',
        borderRadius: 0
    },
    buttonTitle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12
    },
    buttonStyle: {
        backgroundColor: '#6C0CC3',
        height: '100%',
        width: '100%'
    },
    imageStyle: {
        backgroundColor: '#FFFFFF',
        width: 204,
        height: 145,
        marginTop: 30,
        marginBottom: 30
    }
})
interface EndDayModalProps {
    cRef
    navigation
    onEnd
}

const EndMyDayModal = (props: EndDayModalProps) => {
    const { cRef, navigation, onEnd } = props
    const modalizeRef = useRef<Modalize>(null)

    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        modalizeRef.current.open()
    }

    const closeModal = () => {
        navigation.setOptions({ tabBarVisible: true })
        modalizeRef.current.close()
    }
    useImperativeHandle(cRef, () => ({
        openModal: () => {
            openModal()
        },
        closeModal: () => {
            closeModal()
        }
    }))

    const handleEndDay = () => {
        onEnd()
        modalizeRef.current.close()
    }

    return (
        <Modalize
            ref={modalizeRef}
            adjustToContentHeight
            onClose={() => {
                navigation.setOptions({ tabBarVisible: true })
            }}
        >
            <View style={styles.containerStyle}>
                <View style={styles.headerStyle}>
                    <CText style={styles.headerTextStyle}>{t.labels.PBNA_MOBILE_END_DAY}</CText>
                </View>
                <View style={styles.contentStyle}>
                    <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_OEPN_VISIT_WARN}</CText>
                    <Image
                        style={styles.imageStyle}
                        source={require('../../../../assets/image/graphic_element_end-my-day.png')}
                    />
                    <CText style={styles.contentText}>{t.labels.PBNA_MOBILE_CONTINUE_END_DAY}</CText>
                </View>
                <View style={styles.buttonLocation}>
                    <Button
                        onPress={() => handleEndDay()}
                        title={<CText style={styles.buttonTitle}>{t.labels.PBNA_MOBILE_CONFIRM_END_DAY}</CText>}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonStyle}
                    />
                </View>
            </View>
        </Modalize>
    )
}

export default EndMyDayModal
