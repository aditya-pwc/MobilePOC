import React, { ForwardRefRenderFunction, ReactNode, Ref, useImperativeHandle, useState } from 'react'
import Modal from 'react-native-modal'
import { Button } from 'react-native-elements'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimensions, StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import CText from '../../CText'
import { CommonParam } from '../../../CommonParam'
import UserAvatar from '../../UserAvatar'
import { t } from '../../../i18n/t'
import DeviceInfo from 'react-native-device-info'
import { SettingCell, SettingCellType } from '../setting-cell/SettingCell'

interface SidePanelProps {
    onLogoutPress: () => void
    optionsData: SettingCellType[]
    onSyncPress: () => void
    firstName: string
    lastName: string
    url: string
    extraItems: ReactNode
    cRef: Ref<any>
    showRedDot?: boolean
}

export interface SidePanelHandle {
    show: () => {}
    hide: () => {}
}

const screenWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    modalStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    container: {
        flex: 1,
        marginTop: -24,
        marginLeft: 62,
        marginRight: -20,
        marginBottom: -44
    },
    safeViewContain: {
        flex: 1,
        marginBottom: 24,
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
        shadowOpacity: 0.5,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 19
    },
    userInfoView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32
    },
    nameView: {
        marginLeft: 22,
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
    leftLocationWrap: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    logoutContain: {
        width: '100%',
        position: 'absolute',
        bottom: 0
    },
    buttonStyle: {
        marginBottom: 64,
        marginLeft: 22,
        marginRight: 22,
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
    syncCont: {
        paddingLeft: 22,
        marginTop: 22
    },
    syncText: {
        color: '#00A2D9',
        fontWeight: '500',
        marginLeft: 10
    },
    syncIcon: {
        height: 20,
        width: 20,
        marginTop: -2
    },
    heartCont: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40
    }
})

export const SidePanelBase: ForwardRefRenderFunction<SidePanelHandle, SidePanelProps> = (props: SidePanelProps) => {
    const { onLogoutPress, optionsData, onSyncPress, firstName, lastName, url, cRef, extraItems, showRedDot } = props
    const [visible, setVisible] = useState(false)
    const insets = useSafeAreaInsets()

    useImperativeHandle(cRef, () => ({
        show: () => {
            setVisible(true)
        },
        hide: () => {
            setVisible(false)
        }
    }))

    return (
        <Modal
            isVisible={visible}
            backdropOpacity={0.2}
            presentationStyle={'overFullScreen'}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            onBackdropPress={() => {
                setVisible(false)
            }}
        >
            <View style={styles.container}>
                <SafeAreaView style={[styles.safeViewContain, { paddingTop: insets.top }]}>
                    <View style={styles.userInfoView}>
                        <View style={styles.nameView}>
                            <CText style={styles.userName} numberOfLines={2} ellipsizeMode={'tail' as 'tail'}>
                                {firstName ? `${firstName} ${lastName}` : lastName}
                            </CText>
                            <CText style={styles.userType}>{CommonParam.PERSONA__c}</CText>
                        </View>
                        <UserAvatar
                            url={url}
                            firstName={firstName}
                            lastName={lastName}
                            avatarStyle={styles.imgAvatar}
                        />
                    </View>
                    <View style={styles.settingContain}>
                        {optionsData.map((item, index: number) => (
                            <SettingCell
                                title={item.title}
                                index={index}
                                onPress={() => {
                                    item?.onPress && item.onPress()
                                }}
                                key={item.title}
                                component={item.component}
                                showRedDot={showRedDot}
                            />
                        ))}
                        <TouchableOpacity style={styles.settingCellView} onPress={onSyncPress}>
                            <CText style={styles.cellTitle}>{t.labels.PBNA_MOBILE_SYNC}</CText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <View style={styles.logoutContain}>
                    <CText style={styles.versionStyle}>
                        {t.labels.PBNA_MOBILE_VERSION}: {DeviceInfo.getVersion()}
                    </CText>
                    <View style={styles.heartCont}>
                        <CText style={styles.heartStyle}>{t.labels.PBNA_MOBILE_MADE_WITH} </CText>
                        <Text allowFontScaling={false} style={styles.heartStyle}>
                            ♥
                        </Text>
                        <CText style={styles.heartStyle}> {t.labels.PBNA_MOBILE_BY_PEPSI}</CText>
                    </View>
                    <Button
                        onPress={() => {
                            setVisible(false)
                            onLogoutPress && onLogoutPress()
                        }}
                        title={<CText style={styles.logoutTitle}>{t.labels.PBNA_MOBILE_LOGOUT}</CText>}
                        buttonStyle={styles.buttonStyle}
                    />
                </View>
            </View>
            {extraItems}
        </Modal>
    )
}
