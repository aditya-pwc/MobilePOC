import { Dimensions } from 'react-native'
import { storeClassLog } from './LogUtils'
import { Log } from '../enums/Log'
import { BaseInstance } from '../BaseInstance'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { setDefaultTimezone, setLoggedInUserTimezone } from './TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../enums/TimeFormat'
import { isPersonaPSR } from '../enums/Persona'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const getPortraitModeScreenWidthAndHeight = () => {
    let width
    let height
    const windowWidth = Dimensions.get('window').width
    const windowHeight = Dimensions.get('window').height
    if (windowHeight < windowWidth) {
        width = windowHeight
        height = windowWidth
    } else {
        width = windowWidth
        height = windowHeight
    }
    return {
        width,
        height
    }
}
export const exeAsyncFunc = async <T, U extends any[]>(func: (...params: U[]) => Promise<T>, className?: string) => {
    try {
        func && (await func())
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, className || func?.name, ErrorUtils.error2String(e))
    }
}

export const getIdClause = (idArr: Array<string>) => {
    let idClause = ''
    idArr.forEach((id, index) => {
        idClause += `'${id}'` + (index !== idArr.length - 1 ? ',' : '')
    })
    return idClause
}

export const syncDownObj = async (objName: string, q: string, updateLocaldata = true, allOrNone = true) => {
    const config = {
        name: objName,
        query: q,
        updateLocalSoup: updateLocaldata,
        allOrNone
    }
    const data = await BaseInstance.sfSyncEngine.syncDown(config)
    return {
        status: 'E0',
        data
    }
}

export const buildSyncDownObjPromise = (objName: string, q: string) => {
    return async () => {
        await syncDownObj(objName, q)
    }
}

export const promiseQueue = async (list: Array<any>) => {
    let index = 0
    const length = list.length
    while (index >= 0 && index < length) {
        await list[index]()
        index++
    }
}

export const checkDBStructure = async (initUtil: Function, objs: Array<Object>, callBack: Function) => {
    const soupInitialized = await AsyncStorage.getItem('soup_initialized')
    initUtil()
    if (soupInitialized === 'Yes') {
        await BaseInstance.sfSoupEngine.initialize(false)
        const lastSoupStructure = await AsyncStorage.getItem('last_soup_structure')
        if (!_.isEqual(JSON.parse(JSON.stringify(objs)), JSON.parse(lastSoupStructure))) {
            await BaseInstance.sfSoupEngine.alterAllSoupModel(objs)
            callBack()
            await AsyncStorage.removeItem('isSyncSuccessfully')
            await AsyncStorage.setItem('last_soup_structure', JSON.stringify(objs))
        }
    } else {
        await Promise.all([
            BaseInstance.sfSoupEngine.initialize(false),
            AsyncStorage.setItem('soup_initialized', 'Yes'),
            AsyncStorage.setItem('last_soup_structure', JSON.stringify(objs))
        ])
    }
}

export const recordSyncFlag = async () => {
    try {
        const isSyncSuccessfully = ['isSyncSuccessfully', 'true']
        setDefaultTimezone()
        const lastSyncDate = ['lastSyncDate', moment().format(TIME_FORMAT.Y_MM_DD)]
        await AsyncStorage.multiSet([isSyncSuccessfully, lastSyncDate])
        // if user switched time zone without logout and login, the CommonParam.userTimeZone is not updated
        // after click on resync, the follow method will still set the old CommonParam.userTimeZone, causing the global timezone not updating
        // also, since lastSyncDate is in updated local timezone and the global timezone set to old CommonParam.userTimeZone, it will cause infinite forceInitSync
        // we are skipping this for PSR only, because the setDefaultTimezone already suffices
        if (!isPersonaPSR()) {
            setLoggedInUserTimezone()
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'recordSyncFlag', ErrorUtils.error2String(e))
    }
}

export const base64ToBlob = async (base64Content: string) => {
    const res = await fetch('data:application/octet-stream;base64,' + base64Content)
    const blob = res.blob()
    return blob
}

export const isTrueInDB = (item: any) => {
    return item === '1' || item === true
}
