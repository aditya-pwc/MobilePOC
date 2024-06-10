import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export const useAccessToken = () => {
    const [accessToken, setAccessToken] = useState('')

    useEffect(() => {
        AsyncStorage.getItem('DAMAccessToken').then((param: string | null) => {
            if (typeof param === 'string') {
                try {
                    setAccessToken(JSON.parse(param))
                } catch (e) {}
            }
        })
    }, [])

    return accessToken
}
