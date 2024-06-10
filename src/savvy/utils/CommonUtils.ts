import { SoupService } from '../service/SoupService'
import { Log } from '../../common/enums/Log'
import _ from 'lodash'
import { storeClassLog } from '../../common/utils/LogUtils'

const vsprintf = require('sprintf-js').vsprintf

export const formatString = (src: string, array: string[]) => {
    return vsprintf(src, array)
}

export const isTrueInDB = (item: any) => {
    return item === '1' || item === true
}

export const transferBooleanField = (v) => {
    if (v === '1') {
        return 'Yes'
    }
    if (v === '0') {
        return 'No'
    }
    return null
}

export const getRecordTypeId = async (name, sobjectType) => {
    const res = await SoupService.retrieveDataFromSoup(
        'RecordType',
        {},
        ['Id', 'Name', 'SobjectType'],
        'SELECT {RecordType:Id}, {RecordType:Name}, {RecordType:SobjectType} FROM {RecordType} ' +
            `WHERE {RecordType:Name} = '${name}' AND {RecordType:SobjectType} = '${sobjectType}'`
    )
    if (_.isEmpty(res?.[0])) {
        throw new Error('No RecordType available')
    }
    return res[0]?.Id
}

export const getRecordTypeIdByDeveloperName = async (developerName, sobjectType) => {
    const res = await SoupService.retrieveDataFromSoup(
        'RecordType',
        {},
        ['Id', 'Name', 'SobjectType'],
        'SELECT {RecordType:Id}, {RecordType:DeveloperName}, {RecordType:SobjectType} FROM {RecordType} ' +
            `WHERE {RecordType:DeveloperName} = '${developerName}' AND {RecordType:SobjectType} = '${sobjectType}'`
    )
    if (_.isEmpty(res?.[0])) {
        throw new Error('No RecordType available')
    }
    return res[0]?.Id
}

/**
 * @description Binary search for match Id.
 * @param array
 * @param low
 * @param high
 * @param target
 */
export const binarySearchWithoutRecursion = (array, low, high, target) => {
    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        if (array[mid].Id > target) {
            high = mid - 1
        } else if (array[mid].Id < target) {
            low = mid + 1
        } else {
            return mid
        }
    }
    return -1
}

export const customDelay = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'E0' })
        }, time)
    })
}

export const getNewWrapString = (str: string) => {
    return str.replace(/\\n/g, ' \n ')
}

export const exeAsyncFuncTemp = async <T, U extends any[]>(
    func: (...params: U[]) => Promise<T>,
    className?: string,
    finallyFunc?: () => void
) => {
    try {
        func && (await func())
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, className || func?.name, JSON.stringify(e))
    } finally {
        finallyFunc && finallyFunc()
    }
}

export const getRound = (number: string | number, nullValue = '-') => {
    if (!number || !Number(number)) {
        return nullValue
    }
    return Math.round(Number(number)).toString()
}

export const isSameArray = (arr1: string[], arr2: string[]) => {
    return (
        _.cloneDeep(arr1)
            .sort((a, b) => (a > b ? 1 : -1))
            .join('') ===
        _.cloneDeep(arr2)
            .sort((a, b) => (a > b ? 1 : -1))
            .join('')
    )
}

export const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
            const base64Data = reader.result as string
            resolve(base64Data)
        }

        reader.onerror = () => {
            reject(new Error('Error converting blob to Base64'))
        }

        reader.readAsDataURL(blob)
    })

interface AnyObject {
    [key: string]: any
}

export const convertKeysToCamelCase = (source: AnyObject): AnyObject =>
    Object.keys(source).reduce((result, key) => {
        const camelKey = _.camelCase(key)
        result[camelKey] = source[key]
        return result
    }, {} as AnyObject)
