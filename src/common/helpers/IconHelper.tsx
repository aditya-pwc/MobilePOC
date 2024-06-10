import { Image, Linking, StyleSheet, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../enums/ImageSrc'
import PhoneIcon from '../PhoneIcon'
import React from 'react'
import LocationService from '../../orderade/service/LocationService'
import LocationIconGray from '../../../assets/image/icon_location-1.svg'
import { storeClassLog } from '../utils/LogUtils'
import { Log } from '../enums/Log'

const styles = StyleSheet.create({
    callImg: {
        height: 18.35,
        width: 18,
        marginBottom: 20
    },
    locationImg: {
        height: 20.58,
        width: 18
    }
})

export const callPhone = async (phone: string | number, callback?: () => Promise<any>) => {
    const url = 'tel://' + phone
    const supported = await Linking.canOpenURL(url)
    if (supported) {
        await Linking.openURL(url)
        callback && (await callback())
    } else {
        storeClassLog(Log.MOBILE_ERROR, 'callPhone', 'Call phone failed:' + phone)
    }
}

export const smsPhone = async (phone: string | number, callback?: () => Promise<any>) => {
    const url = 'sms://' + phone
    const supported = await Linking.canOpenURL(url)
    if (supported) {
        await Linking.openURL(url)
        callback && (await callback())
    } else {
        storeClassLog(Log.MOBILE_ERROR, 'smsPhone', 'SMS phone failed:' + phone)
    }
}

export const renderPhone = (phone: string | number, callback?: () => Promise<any>) => {
    if (phone) {
        return (
            <TouchableOpacity
                hitSlop={{ left: 30, right: 30, bottom: 25 }}
                onPress={async () => {
                    await callPhone(phone, callback)
                }}
            >
                <Image source={ImageSrc.ICON_CALL} style={styles.callImg} />
            </TouchableOpacity>
        )
    }
    return <PhoneIcon isDisabled imageStyle={{ marginBottom: 20 }} />
}
export const renderLocation = (latitude, longitude) => {
    if (latitude && longitude) {
        return (
            <TouchableOpacity
                hitSlop={{ left: 30, right: 30, bottom: 25 }}
                onPress={async () => {
                    const currentLocation = await LocationService.getCurrentPosition()
                    LocationService.gotoLocation(currentLocation.coords, { latitude, longitude })
                }}
            >
                <Image source={ImageSrc.ICON_LOCATION} style={styles.locationImg} />
            </TouchableOpacity>
        )
    }
    return <LocationIconGray />
}
