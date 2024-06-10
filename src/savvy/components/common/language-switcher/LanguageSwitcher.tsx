import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import React, { ForwardRefRenderFunction, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { t } from '../../../../common/i18n/t'
import { onLanguagechange } from '../CopilotModal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CURRENT_LANGUAGE, getLanguageOptions } from '../../../i18n/Utils'
import PickerModal from '../../manager/common/PickerModal'
import ReassignResultModal from '../../manager/common/ReassignResultModal'
import { useNavigation } from '@react-navigation/native'
import { SidePanelAlertDataType } from '../../../../common/components/buz/copilot-base/CopilotScreenBase'

const styles = StyleSheet.create({
    cellTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000'
    },
    settingContain: {
        flex: 3,
        marginTop: 57
    },
    leftLocationWrap: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    settingCellView: {
        marginLeft: 22,
        marginRight: 22,
        height: 70,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3',
        justifyContent: 'center'
    },
    locationWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    languageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    languageBtn: {
        fontSize: 14
    },
    downArrow: {
        marginLeft: 10,
        width: 12,
        height: 7
    }
})

interface LanguageSwitcherModalProps {
    cRef: Ref<any>
    hidePanel: (msg?: SidePanelAlertDataType) => void
}

interface LanguageSwitcherModalHandle {
    show: () => void
    hide: () => void
}

const LanguageSwitcherModal: ForwardRefRenderFunction<LanguageSwitcherModalHandle, LanguageSwitcherModalProps> = ({
    cRef,
    hidePanel
}) => {
    const navigation = useNavigation()

    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [languageSwitchSuccessModalVisible, setLanguageSwitchSuccessModalVisible] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('English')
    const [currentLanguage, setCurrentLanguage] = useState('English')

    useImperativeHandle(cRef, () => ({
        show: () => {
            setLanguageModalVisible(true)
        },
        hide: () => {
            setLanguageModalVisible(false)
        }
    }))

    useEffect(() => {
        AsyncStorage.getItem(CURRENT_LANGUAGE, (error, language) => {
            if (!error && language) {
                setCurrentLanguage(language)
            }
        })
    }, [])

    const changeLanguage = onLanguagechange({
        setLanguageModalVisible,
        setLanguageSwitchSuccessModalVisible,
        setCurrentLanguage,
        hidePanel,
        setSelectedLanguage,
        currentLanguage,
        navigation
    })

    return (
        <>
            <PickerModal
                modalVisible={languageModalVisible}
                onDoneClick={changeLanguage}
                optionsList={getLanguageOptions()}
                DEFAULT_LABEL={currentLanguage}
                modalTitle={t.labels.PBNA_MOBILE_LANGUAGE}
                selectedVal={selectedLanguage}
                updateSelectedVal={setSelectedLanguage}
                isTextValueObject
            />
            <ReassignResultModal
                navigation={navigation}
                isLanguageSwitchSuccess
                selectedLanguage={selectedLanguage}
                modalVisible={languageSwitchSuccessModalVisible}
                setModalVisible={setLanguageSwitchSuccessModalVisible}
            />
        </>
    )
}

interface LanguageSwitcherProps {
    onHideSidePanel: (msg?: SidePanelAlertDataType) => void
}

export const LanguageSwitcher = (props: LanguageSwitcherProps) => {
    const { onHideSidePanel } = props

    const [currentLanguage, setCurrentLanguage] = useState('English')

    const modalRef = useRef<LanguageSwitcherModalHandle>(null)

    useEffect(() => {
        AsyncStorage.getItem(CURRENT_LANGUAGE, (error, language) => {
            if (!error && language) {
                setCurrentLanguage(language)
            }
        })
    }, [])

    return (
        <View style={[styles.settingCellView, styles.locationWrap]}>
            <View style={styles.leftLocationWrap}>
                <CText style={styles.cellTitle}>{t.labels.PBNA_MOBILE_LANGUAGE}</CText>
            </View>
            <TouchableOpacity
                hitSlop={{
                    top: 20,
                    bottom: 20,
                    left: 10,
                    right: 10
                }}
                style={styles.languageContainer}
                onPress={() => {
                    modalRef.current?.show()
                }}
            >
                <CText style={styles.languageBtn}>{currentLanguage}</CText>
                <Image style={styles.downArrow} source={ImageSrc.IMG_TRIANGLE} />
            </TouchableOpacity>
            <LanguageSwitcherModal cRef={modalRef} hidePanel={onHideSidePanel} />
        </View>
    )
}
