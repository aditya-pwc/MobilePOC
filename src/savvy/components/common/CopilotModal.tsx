/**
 * @description CopilotModal Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-18
 */

import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import Modal from 'react-native-modal'
import { Button } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Log } from '../../../common/enums/Log'
import CText from '../../../common/components/CText'
import HeadView from './HeadView'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import RedExclamation from '../../../../assets/image/red-exclamation.svg'
import UserLocationModal from './UserLocationModal'
import { useDispatch, useSelector } from 'react-redux'
import Loading from '../../../common/components/Loading'
import { updateLocationInfoInCopilot } from '../../utils/MerchManagerUtils'
import { DropDownType, EventEmitterType } from '../../enums/Manager'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import PickerModal from '../manager/common/PickerModal'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../redux/action/H01_Manager/managerAction'
import ReassignResultModal from '../manager/common/ReassignResultModal'
import { getPersonaMap, isPersonaDelSupOrSDL, isPersonaManager } from '../../../common/enums/Persona'
import { t } from '../../../common/i18n/t'
import { getLanguageI18nText, getLanguageOptions, switchLanguage } from '../../i18n/Utils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import DeviceInfo from 'react-native-device-info'
import { CommonParam } from '../../../common/CommonParam'
import { getStringValue } from '../../utils/LandingUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { fetchVersionNumbers } from './releaseNotesFiles/ReleaseNotes'
import _ from 'lodash'
import { useIsFocused } from '@react-navigation/native'
import { clearCDATermsCache } from '../../hooks/CustomerContractTabHooks'

interface CopilotModalProps {
    cRef
    navigation?
    logout?
    type?
    userInfo?
    refresh?
}
const managerReducer = (state) => state.manager
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    iconStyle: {
        width: 14,
        height: 16,
        marginLeft: 6,
        marginRight: 6
    },
    locationWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    leftLocationWrap: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    currentLocation: {
        fontSize: 14,
        fontWeight: '400'
    },
    userRedExclamation: {
        marginHorizontal: 5
    },
    editBtn: {
        fontWeight: '700',
        fontSize: 12,
        color: '#00A2D9'
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
    },
    containerStyle: {
        backgroundColor: '#00A2D9',
        height: 44,
        width: 120,
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 20
    },
    refreshButtonStyle: {
        backgroundColor: '#00A2D9'
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12,
        textAlign: 'center',
        width: 100
    },
    modalStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    safeViewContain: {
        marginTop: 0,
        marginLeft: 0,
        width: screenWidth - 62,
        height: screenHeight,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6
    },
    userInfoView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 49
    },
    nameView: {
        marginLeft: 22,
        marginTop: 4,
        width: screenWidth - 62 - 22 - 40 - 50,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    userName: {
        flexDirection: 'column',
        fontSize: 16,
        fontWeight: '700',
        color: '#000000'
    },
    userType: {
        marginTop: 4,
        flexDirection: 'column',
        fontSize: 14,
        fontWeight: '400',
        color: '#565656'
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginLeft: 10
    },
    userNameText: {
        fontSize: 16
    },
    settingCellView: {
        marginLeft: 22,
        marginRight: 42,
        height: 70,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3',
        justifyContent: 'center'
    },
    cellTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000'
    },
    settingContain: {
        flex: 3,
        marginTop: 57
    },
    logoutContain: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    buttonStyle: {
        marginBottom: 44,
        marginLeft: 22,
        marginRight: 42,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EB445A',
        borderRadius: 6
    },
    logoutTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF'
    },
    flexShrinkWrap: {
        flexShrink: 1,
        maxWidth: 70
    },
    commonMargin: {
        marginLeft: 22,
        marginRight: 42
    },
    signatureStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40
    },
    versionStyle: {
        marginBottom: 4,
        textAlign: 'center',
        fontSize: 14,
        color: '#565656'
    },
    heartStyle: {
        textAlign: 'center',
        fontSize: 14,
        color: '#D3D3D3',
        fontWeight: '700'
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EB435A',
        marginLeft: 7
    },
    whiteBorder: {
        borderWidth: 1,
        borderColor: 'white'
    },
    titleAndDot: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

const CURRENT_LANGUAGE = 'current_language'

export const needShowRedDot = async () => {
    const localVersion = await AsyncStorage.getItem('localVersion')
    const versions = await fetchVersionNumbers()
    return _.isEmpty(localVersion) || (versions?.[0] || '') > (localVersion || '')
}

export const renderRedDot = (hasBorder?: boolean) => {
    return <View style={[styles.redDot, hasBorder && styles.whiteBorder]} />
}

const settingCell = (
    title,
    index,
    onPress,
    userLocation,
    isLocation,
    isLanguage,
    hasNoLocation,
    isManager,
    hasNoUnitName,
    currentLanguage,
    showRedDot
) => {
    return (
        <View key={index}>
            {!isLocation && !isLanguage && (
                <TouchableOpacity style={styles.settingCellView} onPress={onPress}>
                    <View style={[title === t.labels.PBNA_MOBILE_WHATS_NEW && styles.titleAndDot]}>
                        <CText style={styles.cellTitle}>{title}</CText>
                        {showRedDot && title === t.labels.PBNA_MOBILE_WHATS_NEW && renderRedDot()}
                    </View>
                </TouchableOpacity>
            )}
            {isLocation && isManager && (
                <View style={[styles.settingCellView, styles.locationWrap]}>
                    <View style={styles.leftLocationWrap}>
                        <CText style={styles.cellTitle}>{title}</CText>
                        {!hasNoUnitName && (
                            <View style={styles.leftLocationWrap}>
                                <Image source={ImageSrc.PIN_YET_TO_START} style={styles.iconStyle} />
                                <View style={styles.flexShrinkWrap}>
                                    <CText style={styles.currentLocation} numberOfLines={1} ellipsizeMode="tail">
                                        {userLocation}
                                    </CText>
                                </View>
                                {hasNoLocation && (
                                    <RedExclamation style={styles.userRedExclamation} width={12} height={12} />
                                )}
                            </View>
                        )}
                    </View>
                    {!hasNoUnitName && (
                        <TouchableOpacity hitSlop={commonStyle.smallHitSlop} onPress={onPress}>
                            <CText style={styles.editBtn}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            {isLanguage && (
                <View style={[styles.settingCellView, styles.locationWrap]}>
                    <View style={styles.leftLocationWrap}>
                        <CText style={styles.cellTitle}>{title}</CText>
                    </View>
                    <TouchableOpacity
                        hitSlop={commonStyle.smallHitSlop}
                        style={styles.languageContainer}
                        onPress={onPress}
                    >
                        <CText style={styles.languageBtn}>{getLanguageI18nText(currentLanguage)}</CText>
                        <Image style={styles.downArrow} source={ImageSrc.IMG_TRIANGLE} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

export const onLanguagechange = (params: any) => {
    const {
        setLanguageModalVisible,
        setLanguageSwitchSuccessModalVisible,
        setCurrentLanguage,
        hidePanel,
        setVisible,
        setSelectedLanguage,
        currentLanguage,
        navigation
    } = params
    const changeLanguage = (val) => {
        setLanguageModalVisible(false)
        if (val !== currentLanguage) {
            switchLanguage(val)
                .then(() => {
                    setLanguageSwitchSuccessModalVisible(true)
                    setCurrentLanguage(val)
                    DeviceEventEmitter.emit(EventEmitterType.REFRESH_COPILOT)
                    setTimeout(() => {
                        hidePanel && hidePanel()
                        setVisible && setVisible(false)
                        clearCDATermsCache()
                        setLanguageSwitchSuccessModalVisible(false)
                        navigation.navigate('LandingSavvy')
                    }, 1500)
                })
                .catch((error) => {
                    setSelectedLanguage(currentLanguage)
                    const messageObject = {
                        type: DropDownType.INFO,
                        title: t.labels.PBNA_MOBILE_SWITCH_LANGUAGE,
                        message: error
                    }
                    hidePanel && hidePanel(messageObject)
                    setVisible && setVisible(false)
                    storeClassLog(
                        Log.MOBILE_INFO,
                        'onLanguagechange',
                        `language switch failed: ${getStringValue(error)}`
                    )
                })
        }
    }
    return changeLanguage
}

const CopilotModal: FC<CopilotModalProps> = (props: CopilotModalProps) => {
    const { cRef, logout, userInfo, navigation, refresh } = props
    const headView: any = useRef()
    const scrollV: any = useRef()
    const manager = useSelector(managerReducer)
    const [visible, setVisible] = useState(false)
    const [scrollOffset, setScrollOffset] = useState(0)
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [locationAddSuccessModalVisible, setLocationAddSuccessModalVisible] = useState(false)
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [languageSwitchSuccessModalVisible, setLanguageSwitchSuccessModalVisible] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('English')
    const [currentLanguage, setCurrentLanguage] = useState('English')
    const isManager = isPersonaManager()
    const [isLoading, setIsLoading] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState([])
    const [selectedSubType, setSelectedSubType] = useState([])
    const { dropDownRef } = useDropDown()
    const dispatch = useDispatch()
    const updateLocationInfo = compose(dispatch, managerAction.setUserLocationInfo)
    const changeLanguage = onLanguagechange({
        setLanguageModalVisible,
        setLanguageSwitchSuccessModalVisible,
        setCurrentLanguage,
        setVisible,
        setSelectedLanguage,
        dropDownRef,
        currentLanguage,
        navigation
    })
    const [showRedDot, setShowRedDot] = useState(false)
    const isFocused = useIsFocused()

    const navigateInCopilotModal = (navigatePageName: string) => {
        setVisible(false)
        navigation?.navigate(navigatePageName, {
            navigation,
            onPressBack: () => {
                setVisible(true)
            }
        })
    }

    const onClickPreferences = () => {
        navigateInCopilotModal('NotificationPreferences')
    }

    const clickReleaseNotes = () => {
        navigateInCopilotModal('ReleaseNotes')
    }

    const dataSource = [
        {
            title: t.labels.PBNA_MOBILE_NOTIFICATION_PREFERENCES,
            onPress: onClickPreferences
        },
        {
            title: t.labels.PBNA_MOBILE_LANGUAGE,
            isLanguage: true,
            onPress: () => {
                try {
                    setIsLoading(true)
                    setLanguageModalVisible(true)
                    setIsLoading(false)
                } catch (error) {
                    setIsLoading(false)
                }
            }
        },
        {
            title: t.labels.PBNA_MOBILE_MY_LOCATIONS,
            isLocation: true,
            onPress: async () => {
                try {
                    setIsLoading(true)
                    updateLocationInfoInCopilot(updateLocationInfo)
                    setLocationModalVisible(true)
                    setLocationAddSuccessModalVisible(false)
                    setIsLoading(false)
                } catch (error) {
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_EDIT_LOCATION_REFRESH,
                        error
                    )
                    setIsLoading(false)
                }
            }
        },
        {
            title: t.labels.PBNA_MOBILE_WHATS_NEW,
            onPress: clickReleaseNotes
        }
    ]

    const getNameString = (userInf) => {
        let name = userInf.Name || ''
        if (name.length > 28) {
            name = `${userInf.FirstName || ''}
${userInf.LastName || ''}`
        }
        return name
    }
    const personaMap = getPersonaMap()
    const currentPersona = personaMap[CommonParam.PERSONA__c].title || ''
    const translatePersona = currentPersona.replace(/\\n/g, ' ')
    useImperativeHandle(cRef, () => ({
        show: () => {
            setVisible(true)
        },
        hide: () => {
            setVisible(false)
        }
    }))

    const showRedDotCB = async () => {
        const flag = await needShowRedDot()
        setShowRedDot(flag)
    }

    useEffect(() => {
        AsyncStorage.getItem(CURRENT_LANGUAGE, (error, language) => {
            if (!error && language) {
                setCurrentLanguage(language)
            }
        })
        isFocused && showRedDotCB()
    }, [isFocused])

    const handleScrollTo = (p) => {
        scrollV.current.scrollTo(p)
    }

    const handleOnScroll = (event) => {
        setScrollOffset(event.nativeEvent.contentOffset.x)
    }

    const renderColumn = () => {
        return (
            <View style={styles.settingContain}>
                {dataSource.map((item, index) => {
                    if (item.title === t.labels.PBNA_MOBILE_MY_LOCATIONS && isPersonaDelSupOrSDL()) {
                        return null
                    }
                    return settingCell(
                        item.title,
                        index,
                        item.onPress,
                        manager.locationInfo?.unitName,
                        item.isLocation,
                        item.isLanguage,
                        manager.locationInfo?.hasNoLocation,
                        isManager,
                        manager.locationInfo?.hasNoUnitName,
                        currentLanguage,
                        showRedDot
                    )
                })}
                {
                    <TouchableOpacity
                        style={styles.settingCellView}
                        key={dataSource.length + 1}
                        onPress={() => refresh()}
                    >
                        <CText style={styles.cellTitle}>{t.labels.PBNA_MOBILE_SYNC}</CText>
                    </TouchableOpacity>
                }
            </View>
        )
    }
    return (
        <Modal
            isVisible={visible}
            backdropOpacity={0.2}
            coverScreen
            useNativeDriver={false}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            onSwipeComplete={() => {
                setVisible(false)
            }}
            swipeDirection={['right']}
            scrollTo={handleScrollTo}
            scrollOffset={scrollOffset}
            scrollOffsetMax={100}
            propagateSwipe
            style={{ margin: 0 }}
        >
            <ScrollView
                ref={scrollV}
                horizontal
                showsHorizontalScrollIndicator
                onScroll={handleOnScroll}
                scrollEventThrottle={20}
                style={commonStyle.flexDirectionRow}
            >
                <View
                    style={{ width: 62, height: screenHeight }}
                    onTouchEnd={() => {
                        setVisible(false)
                    }}
                />
                <View style={styles.safeViewContain}>
                    <HeadView
                        cRef={headView}
                        userInfoView={styles.userInfoView}
                        nameView={styles.nameView}
                        titleStr={getNameString(userInfo)}
                        titleStyle={styles.userName}
                        subtitleStyle={styles.userType}
                        subtitleStr={translatePersona}
                        userInfo={userInfo}
                        imgAvatar={styles.imgAvatar}
                        userNameText={styles.userNameText}
                        isLoading={isLoading}
                        setSubTypeArray={setSubTypeArray}
                        subTypeArray={subTypeArray}
                        selectedSubType={selectedSubType}
                        setSelectedSubType={setSelectedSubType}
                        sideBarVisible={visible}
                        needRedDot={false}
                    />

                    {renderColumn()}
                    <View style={styles.logoutContain}>
                        <CText style={[styles.commonMargin, styles.versionStyle]}>
                            {t.labels.PBNA_MOBILE_VERSION}: {DeviceInfo.getVersion()}
                        </CText>
                        <View style={[styles.commonMargin, styles.signatureStyle]}>
                            <CText style={styles.heartStyle}>{t.labels.PBNA_MOBILE_MADE_WITH} </CText>
                            <Text allowFontScaling={false} style={styles.heartStyle}>
                                ♥
                            </Text>
                            <CText style={styles.heartStyle}> {t.labels.PBNA_MOBILE_BY_PEPSI}</CText>
                        </View>
                        <Button
                            onPress={() => {
                                logout(dropDownRef)
                            }}
                            title={
                                <CText style={styles.logoutTitle}>{t.labels.PBNA_MOBILE_LOGOUT.toUpperCase()}</CText>
                            }
                            buttonStyle={styles.buttonStyle}
                        />
                    </View>
                </View>
                <UserLocationModal
                    modalVisible={locationModalVisible}
                    setLocationModalVisible={setLocationModalVisible}
                    locationAddSuccessModalVisible={locationAddSuccessModalVisible}
                    setLocationAddSuccessModalVisible={setLocationAddSuccessModalVisible}
                />
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
                <Loading isLoading={isLoading} />
            </ScrollView>
        </Modal>
    )
}

export default CopilotModal
