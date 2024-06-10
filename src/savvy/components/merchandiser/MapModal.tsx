import React, { useEffect, useImperativeHandle, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { Button } from 'react-native-elements'
import LocationService from '../../service/LocationService'
import SwipDeliveryCard from './SwipDeliveryCard'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import TitleModal from '../../../common/components/TitleModal'
import CText from '../../../common/components/CText'
import PhoneIcon from '../common/PhoneIcon'

import { callByPhone } from '../../../common/utils/LinkUtils'
import { t } from '../../../common/i18n/t'
import { isPersonaMD } from '../../../common/enums/Persona'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    ...commonStyle,
    containerView: {
        alignItems: 'center'
    },
    messageAndCallWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    touchStyle: {
        alignSelf: 'flex-start'
    },
    baseGrayTitleStyle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    storeInfo: {
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center'
    },
    logoImg: {
        width: 58,
        height: 58,
        borderRadius: 29,
        marginTop: 30,
        marginBottom: 30,
        marginLeft: 22,
        resizeMode: 'stretch'
    },
    storeTitleContainer: {
        justifyContent: 'center',
        width: 217
    },
    storeTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginLeft: 10
    },
    storeSubTitle: {
        marginLeft: 10,
        marginTop: 5
    },
    startTimeContainStyle: {
        flex: 1,
        justifyContent: 'center'
    },
    stareTimeTitle: {
        marginLeft: 22
    },
    stareTime: {
        marginLeft: 22,
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginTop: 5
    },
    headImg: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginLeft: 15,
        resizeMode: 'stretch'
    },
    deliverName: {
        marginLeft: 10
    },
    msgStyle: {
        width: 24,
        height: 24,
        marginRight: 20
    },
    phoneStyle: {
        width: 19,
        height: 20,
        marginRight: 20
    },
    tabContain: {
        width: '100%',
        height: 80,
        paddingBottom: 20,
        flexDirection: 'row',
        backgroundColor: '#F2F4F7',
        alignItems: 'center'
    },
    tabItemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabButton: {
        flex: 1
    },
    tabLocationIcon: {
        width: 18,
        height: 21,
        resizeMode: 'stretch'
    },
    tabTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 10
    },
    tabPhoneIcon: {
        width: 18,
        height: 19,
        resizeMode: 'stretch'
    },
    tabLine: {
        width: 1,
        height: 20,
        backgroundColor: '#D3D3D3'
    },
    buttonIconStyle: {
        height: 45,
        backgroundColor: 'transparent'
    }
})

interface MapModalProps {
    region
    cRef
    visible
    onHideMapModal
    navigation
    fromMMModal
}

export const tabView = (tabItemView, titleStyle, titleStr, onPress, isDisabledPhone, iconView) => {
    const phoneColor = isDisabledPhone ? '#D3D3D3' : '#000'
    return (
        <View style={tabItemView}>
            <Button
                containerStyle={[tabItemView, styles.tabButton]}
                onPress={() => {
                    onPress()
                }}
                buttonStyle={styles.buttonIconStyle}
                icon={iconView}
                title={<CText style={[titleStyle, { color: phoneColor }]}>{titleStr}</CText>}
            />
        </View>
    )
}

export const titleContainView = (titleContainStyle, titleStyle, subTitleStyle, titleStr, subTitleStr) => {
    return (
        <View style={titleContainStyle}>
            <CText numberOfLines={2} style={titleStyle}>
                {titleStr}
            </CText>
            <CText style={subTitleStyle}>{subTitleStr}</CText>
        </View>
    )
}
const phoneBtn = (phoneParam) => {
    return (
        <TouchableOpacity
            onPress={() => {
                phoneParam.onPress()
            }}
        >
            <Image style={phoneParam.imgStyle} source={phoneParam.imgIcon} />
        </TouchableOpacity>
    )
}

export const accountInfo = (
    paramsStyles,
    logoImg,
    titleStr,
    subTitleStr,
    phoneViewPrams,
    newnavigation,
    fromMMModal,
    mark
) => {
    const {
        storeInfo: itemContainStyle,
        logoImg: logoStyle,
        storeTitleContainer: titleContainStyle,
        storeTitle: titleStyle
    } = paramsStyles
    const subTitleStyle = [paramsStyles.baseGrayTitleStyle, paramsStyles.storeSubTitle]

    return (
        <TouchableOpacity
            style={styles.touchStyle}
            onPress={() => {
                const item = { ...mark }
                item.name = mark.title || mark.name
                if (isPersonaMD()) {
                    newnavigation.navigate('VisitDetail', { item })
                }
            }}
        >
            <View style={itemContainStyle}>
                <Image style={logoStyle} source={logoImg} />
                {titleContainView(titleContainStyle, titleStyle, subTitleStyle, titleStr, subTitleStr)}
                {phoneViewPrams && (
                    <View style={styles.messageAndCallWrapper}>
                        {phoneBtn(phoneViewPrams.msg)}
                        {phoneBtn(phoneViewPrams.phoneCall)}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const MapModal = (props: MapModalProps) => {
    const { region, visible, onHideMapModal, navigation, fromMMModal, cRef } = props
    const [modalVisible, setModalVisible] = useState(visible)
    const [visitDuration, setVisitDuration] = useState('')
    const [mark, setMarks] = useState({
        storeLocation: '',
        title: '',
        name: '',
        plannedDuration: 0,
        cityStateZip: '',
        address: '',
        AccountPhone: '',
        Planned_Duration_Minutes__c: 0
    })

    useImperativeHandle(cRef, () => ({
        openModal: (item) => {
            setMarks(item)
        }
    }))

    useEffect(() => {
        navigation.setOptions({ tabBarVisible: !visible })
        setModalVisible(visible)
        const plannedDuration = mark.plannedDuration || mark.Planned_Duration_Minutes__c
        const durationStr =
            Math.floor((plannedDuration || 0) / 60) + ' hr ' + Math.floor((plannedDuration || 0) % 60) + ' min'
        setVisitDuration(durationStr)
    }, [mark, visible])

    const detailAddress = (mark.address ?? '') + '\n' + (mark.cityStateZip ?? '')
    const locationView = <Image style={styles.tabLocationIcon} source={ImageSrc.ICON_LOCATION} />
    const phoneView = <PhoneIcon isDisabled={!mark.AccountPhone} />

    return (
        <TitleModal title={t.labels.PBNA_MOBILE_VISIT_INFO} visible={modalVisible} onClose={onHideMapModal}>
            <View style={styles.containerView}>
                {accountInfo(
                    styles,
                    ImageSrc.STORE_KROGER,
                    mark.title || mark.name,
                    detailAddress,
                    null,
                    navigation,
                    fromMMModal,
                    mark
                )}
                <View style={styles.storeInfo}>
                    {titleContainView(
                        styles.startTimeContainStyle,
                        [styles.baseGrayTitleStyle, styles.stareTimeTitle],
                        styles.stareTime,
                        t.labels.PBNA_MOBILE_ESTIMATED_DURATION,
                        visitDuration
                    )}
                </View>
                <View style={[styles.deliveryContain, styles.paddingX]}>
                    <SwipDeliveryCard visit={mark} navigation={navigation} showHalfDeliveryCard />
                </View>
                <View style={styles.tabContain}>
                    {tabView(
                        styles.tabItemView,
                        styles.tabTitle,
                        'ROUTE TO STORE',
                        () => {
                            LocationService.gotoLocation(region, JSON.parse(mark.storeLocation))
                        },
                        false,
                        locationView
                    )}
                    <View style={styles.tabLine} />
                    {tabView(
                        styles.tabItemView,
                        styles.tabTitle,
                        'CALL STORE',
                        () => {
                            callByPhone(mark.AccountPhone)
                        },
                        !mark.AccountPhone,
                        phoneView
                    )}
                </View>
            </View>
        </TitleModal>
    )
}
export default MapModal
