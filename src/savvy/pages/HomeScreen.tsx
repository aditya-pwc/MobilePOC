import React, { useRef, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CText from '../../common/components/CText'
import { SoupService } from '../service/SoupService'
import CopilotModal from '../components/common/CopilotModal'
import HeadView from '../components/common/HeadView'
import { isPersonaManager } from '../../common/enums/Persona'
import { useDropDown } from '../../common/contexts/DropdownContext'
import InStoreMapService from '../service/InStoreMapService'
import { initManager } from '../utils/MerchManagerUtils'
import { t } from '../../common/i18n/t'
import { commonStyle } from '../../common/styles/CommonStyle'
import BaseInstance from '../../common/BaseInstance'

interface HomeScreenInterface {
    props
    navigation
}

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: '#00A2D9',
        height: 44,
        width: 120,
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 20
    },
    linearGradientStyle: {
        overflow: 'hidden'
    },
    buttonStyle: {
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
    userInfoView: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    nameView: {
        marginTop: 58,
        marginLeft: 22,
        marginBottom: 37,
        width: screenWidth - 22 - 40 - 60,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    userType: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    imgAvatar: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginLeft: 10
    },
    userNameText: {
        fontSize: 18
    },
    row: {
        height: 100,
        justifyContent: 'center',
        padding: 20,
        borderBottomWidth: 3,
        borderBottomColor: 'black',
        backgroundColor: 'white'
    },
    rowTitle: {
        fontSize: 30
    }
})

const HomeScreen = (parentProps: HomeScreenInterface) => {
    const { navigation } = parentProps
    const copilotModal: any = useRef()
    const [userInfo] = useState(CommonParam.userInfo)
    const { dropDownRef } = useDropDown()
    const [disableRefreshBtn, setDisableRefreshBtn] = useState(false)
    const isManager = isPersonaManager()
    const getCleanArr = () => {
        const cleanArr = []
        CommonParam.objs.forEach((obj) => {
            if (obj.name !== 'Notification') {
                cleanArr.push(SoupService.clearSoup(obj.name))
            }
        })
        return cleanArr
    }

    const refresh = async () => {
        global.$globalModal.openModal()
        setDisableRefreshBtn(true)
        const cleanArr = getCleanArr()
        await Promise.all(cleanArr)
        Promise.all([InStoreMapService.downloadImages(), initManager()])
            .then(() => {
                global.$globalModal.closeModal()
                setDisableRefreshBtn(false)
                dropDownRef.current.alertWithType('success', 'Refresh Done', '')
            })
            .catch(() => {
                global.$globalModal.closeModal()
                setDisableRefreshBtn(false)
            })
    }

    const logout = () => {
        CommonParam.userId = null
        CommonParam.user = null
        CommonParam.lastModifiedDate = new Date('2021-01-01').toISOString()
        if (isManager) {
            const cleanArr = []
            CommonParam.objs.forEach((obj) => {
                cleanArr.push(SoupService.clearSoup(obj.name))
            })
            const itemsToRemove = ['clientInfo', 'user', 'lastModifiedDate', 'isSyncSuccessfully', 'user_account']
            Promise.all([
                // SoupService.removeStore(),
                cleanArr,
                AsyncStorage.multiRemove(itemsToRemove)
            ]).then(() => {
                BaseInstance.sfOauthEngine.logout()
            })
        } else {
            const itemsToRemove = ['clientInfo', 'user', 'user_account']
            Promise.all([
                AsyncStorage.multiRemove(itemsToRemove),
                AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
            ]).then(() => {
                BaseInstance.sfOauthEngine.logout()
            })
        }
    }
    return (
        <View style={commonStyle.flex_1}>
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                colors={['#00A1D9', '#6C0CC3']}
                style={styles.linearGradientStyle}
            >
                <HeadView
                    hasLocation
                    navigation={navigation}
                    userInfoView={styles.userInfoView}
                    nameView={styles.nameView}
                    titleStr={'Good Morning,'}
                    titleStyle={styles.userName}
                    subtitleStyle={styles.userType}
                    subtitleStr={userInfo.Name}
                    userInfo={userInfo}
                    imgAvatar={styles.imgAvatar}
                    userNameText={styles.userNameText}
                    onPress={() => {
                        copilotModal.current.show()
                    }}
                />
            </LinearGradient>
            {/* <Text>Build No: {buildId.buildId}</Text> */}
            {isManager && (
                <Button
                    onPress={() => !disableRefreshBtn && refresh()}
                    activeOpacity={disableRefreshBtn ? 1 : 0.2}
                    title={<CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_REFRESH_DATA}</CText>}
                    buttonStyle={styles.buttonStyle}
                    containerStyle={styles.containerStyle}
                    titleStyle={styles.titleStyle}
                />
            )}
            <CopilotModal
                cRef={copilotModal}
                navigation={navigation}
                userInfo={userInfo}
                logout={logout}
                type={CommonParam.PERSONA__c}
            />
        </View>
    )
}

export default HomeScreen
