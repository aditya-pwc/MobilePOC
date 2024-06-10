import React, { ForwardRefRenderFunction, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import UserAvatar from '../../UserAvatar'
import QuickLinks, { QuickLinkDataArray } from '../../QuickLinks'
import CText from '../../CText'
import { t } from '../../../i18n/t'
import { SidePanelBase, SidePanelHandle } from '../side-panel-base/SidePanelBase'
import { BackgroundCircle } from './BackgroundCircle'
import { SettingCellType } from '../setting-cell/SettingCell'
import { needShowRedDot, renderRedDot } from '../../../../savvy/components/common/CopilotModal'
import { useIsFocused } from '@react-navigation/native'
import { useDropDown } from '../../../contexts/DropdownContext'
import { AlertDataType } from 'react-native-dropdownalert'

const styles = StyleSheet.create({
    userInfoView: {
        paddingHorizontal: '5%',
        marginTop: 58,
        marginBottom: 37,
        position: 'relative',
        zIndex: 5
    },
    psrUserInfoView: {
        marginBottom: 57
    },
    nameView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
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
        borderRadius: 5
    },
    userNameText: {
        fontSize: 18
    },
    lineGarden: {
        width: '100%',
        overflow: 'hidden'
    },
    quickLinksContainer: {
        backgroundColor: '#F0F2F6',
        width: '100%'
    },

    switchLocAndRoute: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative'
    },
    locationText: {
        color: '#fff',
        fontFamily: 'Gotham',
        fontSize: 14
    },
    switchLocAndRouteBtn: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: -15,
        paddingVertical: 25
    },
    switchLocAndRouteBtnRight: {
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 0,
        top: -8,
        paddingTop: 18,
        paddingBottom: 25
    },
    starIconStyle: {
        color: 'white',
        marginLeft: 5,
        transform: [{ translateY: 1 }]
    },
    redDot: {
        position: 'absolute',
        bottom: 2,
        right: -2
    }
})

interface CopilotScreenBaseProps {
    url: string
    firstName: string
    lastName: string
    quickLinkData: QuickLinkDataArray
    subTitle: ReactNode
    sidePanelOptions: SettingCellType[]
    onSyncPress: () => void | Promise<void>
    dashboard: ReactNode
    footList: ReactNode
    extraItems: ReactNode
    onLogoutPress: () => void | Promise<void>
    sidePanelExtraItems: ReactNode
    cRef: any
    needRedDot?: boolean
}

export type SidePanelAlertDataType = AlertDataType

export interface CopilotScreenBaseHandle {
    showSidePanel: () => {}
    hideSidePanel: () => {}
    showDropDownMessage: (messageObject: AlertDataType) => void
}

export const CopilotScreenBase: ForwardRefRenderFunction<CopilotScreenBaseHandle, CopilotScreenBaseProps> = (props) => {
    const {
        url,
        firstName,
        lastName,
        subTitle,
        quickLinkData,
        sidePanelOptions,
        onSyncPress,
        dashboard,
        footList,
        extraItems,
        onLogoutPress,
        sidePanelExtraItems,
        cRef,
        needRedDot
    } = props

    const { dropDownRef } = useDropDown()

    const sidePanelRef = useRef<SidePanelHandle>()
    const isFocused = useIsFocused()
    const [showRedDot, setShowRedDot] = useState(false)

    const showRedDotCB = async () => {
        const flag = await needShowRedDot()
        setShowRedDot(flag)
    }

    useEffect(() => {
        isFocused && showRedDotCB()
    }, [isFocused])

    const showSidePanel = () => {
        sidePanelRef.current?.show()
    }

    useImperativeHandle(cRef, () => ({
        showSidePanel: () => {
            sidePanelRef.current?.show()
        },
        hideSidePanel: () => {
            sidePanelRef.current?.hide()
        },
        showDropDownMessage: (messageObject: AlertDataType) => {
            const { type, title, message } = messageObject
            dropDownRef.current.alertWithType(type, title, message)
        }
    }))

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={['#00A1D9', '#6C0CC3']}
                    style={styles.lineGarden}
                >
                    <BackgroundCircle />
                    <TouchableOpacity
                        testID="CopilotBaseAvatar"
                        accessible={false}
                        onPress={showSidePanel}
                        style={[styles.userInfoView, styles.psrUserInfoView]}
                    >
                        <View style={styles.nameView}>
                            <TouchableOpacity activeOpacity={1}>
                                <CText style={styles.userName} numberOfLines={1} ellipsizeMode={'tail' as 'tail'}>
                                    {firstName && t.labels.PBNA_MOBILE_COPILOT_HELLO}
                                    {!firstName && t.labels.PBNA_MOBILE_COPILOT_HELLO.replace(',', '!')}
                                </CText>
                                {firstName && <CText style={styles.userType}>{`${firstName} !`}</CText>}
                            </TouchableOpacity>
                            <UserAvatar
                                url={url}
                                avatarStyle={styles.imgAvatar}
                                firstName={firstName}
                                lastName={lastName}
                            />
                            {needRedDot && showRedDot && <View style={styles.redDot}>{renderRedDot(true)}</View>}
                        </View>
                        <View style={styles.switchLocAndRoute}>{subTitle}</View>
                    </TouchableOpacity>
                    {dashboard}
                </LinearGradient>
                {footList}
                <View style={styles.quickLinksContainer}>
                    <QuickLinks data={quickLinkData} />
                </View>
            </ScrollView>
            <SidePanelBase
                onLogoutPress={onLogoutPress}
                firstName={firstName}
                lastName={lastName}
                url={url}
                optionsData={sidePanelOptions}
                onSyncPress={onSyncPress}
                extraItems={sidePanelExtraItems}
                cRef={sidePanelRef}
                showRedDot={showRedDot}
            />
            {extraItems}
        </View>
    )
}
