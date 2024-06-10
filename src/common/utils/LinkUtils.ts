import { Linking, Alert } from 'react-native'

const checkPhone = (phone: string) => {
    return !(!phone || phone.length === 0)
}

export const callByPhone = (phone: string) => {
    if (!checkPhone(phone)) {
        return
    }
    Linking.openURL('tel:' + phone)
}

export const smsByPhone = (phone: string) => {
    if (!checkPhone(phone)) {
        return
    }
    Linking.openURL('sms:' + phone)
}

export const openLink = async (url: string) => {
    if (url.indexOf('http') === -1) {
        // Static prefix
        // eslint-disable-next-line no-restricted-syntax
        url = 'https://' + url
    }
    const supported = await Linking.canOpenURL(url)
    if (supported) {
        await Linking.openURL(url)
    } else {
        Alert.alert(`Don't know how to open this URL: ${url}`)
    }
}
