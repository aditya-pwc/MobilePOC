import { NativeModules } from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import BaseInstance from '../../BaseInstance'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Dispatch, SetStateAction, useEffect } from 'react'
import AppInitUtils from '../../../savvy/utils/AppInitUtils'
import Orientation from 'react-native-orientation-locker'
import { CommonParam } from '../../CommonParam'
import { UserAccount } from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/Interface'
import { getUserInfo } from './UserUtils'
import { storeClassLog } from '../../utils/LogUtils'
import { Log } from '../../enums/Log'
import _ from 'lodash'

const { MultiBundleLoad } = NativeModules

const setCommonParam = (userAccount: UserAccount) => {
    CommonParam.user = userAccount
    CommonParam.userId = userAccount.userId
    CommonParam.accessToken = userAccount.accessToken
    CommonParam.endpoint = userAccount.instanceUrl
}

const setExtraItems = async () => {
    const extraKeys = [
        'pendingSyncItems',
        'user',
        'lastModifiedDate',
        'breadcrumbs_refresh_hours',
        'breadcrumbs_last_sync_time'
    ]
    const extraList = await AsyncStorage.multiGet(extraKeys)
    CommonParam.pendingSync = extraList[0][1] ? JSON.parse(extraList[0][1]) : CommonParam.pendingSync
    CommonParam.userName = extraList[1][1] ? JSON.parse(extraList[1][1])[0].Name : CommonParam.userName
    CommonParam.lastModifiedDate = extraList[2][1] ? extraList[2][1] : CommonParam.lastModifiedDate
    CommonParam.breadcrumbsRefreshHours = extraList[3][1] ? extraList[3][1] : CommonParam.breadcrumbsRefreshHours
    CommonParam.breadcrumbsLastSyncTime = extraList[4][1] ? extraList[4][1] : CommonParam.breadcrumbsLastSyncTime
}

export const loadingBundleByPersona = (navigation: NavigationProp<any>) => {
    MultiBundleLoad.isMultiBundleExist((res: string) => {
        const isBundleExist = res
        if (__DEV__ || isBundleExist === 'NO') {
            navigation.navigate('LandingSavvy')
        } else {
            MultiBundleLoad.LoadingBundleWithName('SAVVY')
        }
    })
}

const auth = async (navigation: NavigationProp<any>, setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    try {
        setIsLoading(true)
        AppInitUtils.initOauthEngine()
        const userAccount = await BaseInstance.sfOauthEngine.authenticate()
        BaseInstance.userAccount = userAccount
        await AsyncStorage.setItem('user_account', JSON.stringify(userAccount))
        setCommonParam(userAccount)
        if (_.isEmpty(userAccount.userId)) {
            storeClassLog(Log.MOBILE_ERROR, 'userAccount', userAccount)
        }
        AppInitUtils.initBaseInstance()
        await getUserInfo(userAccount.userId)
        loadingBundleByPersona(navigation)
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'auth', e)
    } finally {
        setIsLoading(false)
    }
}

const checkIfLoggedIn = async (navigation: NavigationProp<any>, setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    setIsLoading(true)
    try {
        const values = await AsyncStorage.multiGet(['user_account', 'isSyncSuccessfully'])
        const userAccountString = values[0][1]
        const isSyncSuccessfully = values[1][1]
        // User is already logged in
        if (userAccountString) {
            await setExtraItems()
            BaseInstance.userAccount = JSON.parse(userAccountString)
            setCommonParam(BaseInstance.userAccount)
            AppInitUtils.initOauthEngine()
            AppInitUtils.initBaseInstance()
            if (isSyncSuccessfully === 'true') {
                CommonParam.isFirstTimeUser = false
            }
            await getUserInfo(BaseInstance.userAccount.userId)
            loadingBundleByPersona(navigation)
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'auth', e)
    } finally {
        setIsLoading(false)
    }
}

const initApp = async (navigation: NavigationProp<any>, setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    await checkIfLoggedIn(navigation, setIsLoading)
}

export const useUser = (navigation: NavigationProp<any>, setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    return {
        auth: () => auth(navigation, setIsLoading)
    }
}

export const useInitApp = (navigation: NavigationProp<any>, setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    useEffect(() => {
        Orientation.lockToPortrait()
        initApp(navigation, setIsLoading)
    }, [])
}
