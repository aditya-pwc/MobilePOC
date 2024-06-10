/**
 * @description Utils for syncing data between Salesforce and mobile.
 * @author Shangmin Dou
 * @date 2021-03-16
 */
import { CommonParam } from '../../common/CommonParam'

export const isHttpStatusCodeSuccess = (statusCode: number) => {
    return Math.floor(statusCode / 100) === 2
}

/**
 * @description Get all fields of an obj.
 * @param objName
 */
export const getObjByName = (objName: string) => {
    return CommonParam.objs.find((obj) => {
        return obj.name === objName
    })
}
/**
 * @description Get all fields of an obj.
 * @param objName
 */
export const getAllFieldsByObjName = (objName: string) => {
    return getObjByName(objName)
        .fieldList.filter((field) => !field.isLocal)
        .map((field) => {
            return field.name
        })
}
/**
 * @description Get all fields need to create when sync up of an obj.
 * @param objName
 */
export const getSyncUpCreateFieldsByObjName = (objName: string) => {
    return getObjByName(objName)
        .fieldList.filter((field) => {
            return field.syncUpCreate
        })
        .map((field) => {
            return field.name
        })
}
/**
 * @description Get all fields need to update when sync up of an obj.
 * @param objName
 */
export const getSyncUpUpdateFieldsByObjName = (objName: string) => {
    return getObjByName(objName)
        .fieldList.filter((field) => {
            return field.syncUpUpdate
        })
        .map((field) => {
            return field.name
        })
}
/**
 * @description Generate "SELECT *" query.
 * @param objName
 */
export const genGetAllFieldsQueryByObjName = (objName: string) => {
    const fieldList = getAllFieldsByObjName(objName)
    return `SELECT ${fieldList.join(', ')} FROM ${objName}`
}
/**
 * @description Field type 'string' to Salesforce type 'boolean'
 * @param soupName
 * @param sourceObjs
 * @param isCreate Create/true or Update/false
 * @returns
 */
export const getObjectStringToBoolean = (soupName, sourceObjs, isCreate) => {
    const objsToDo = []
    const needToBoolean = getObjByName(soupName).fieldList.map((field) => {
        if (field.type === 'boolean') {
            return field.name
        }
        return ''
    })
    for (const sourceObj of sourceObjs) {
        const objToDo = {}
        Object.keys(sourceObj).forEach((key) => {
            if (key === 'Id' && !isCreate) {
                objToDo[key] = sourceObj[key]
            }
            if (
                key !== 'Id' &&
                key !== '__local__' &&
                key !== '__locally_created__' &&
                key !== '__locally_updated__' &&
                key !== '__locally_deleted__'
            ) {
                objToDo[key] = sourceObj[key]
            }
            if (needToBoolean.indexOf(key) !== -1) {
                objToDo[key] = sourceObj[key] === '1' || sourceObj[key] === true
            }
        })
        objsToDo.push(objToDo)
    }
    return objsToDo
}

export const genSyncUpQueryByFields = (objName, fields, operation: 'insert' | 'update') => {
    const operationField = operation === 'insert' ? '__locally_created__' : '__locally_updated__'
    const fieldString = fields
        .map((v) => {
            return `{${objName}:${v}}`
        })
        .join(',')
    const standardFieldString =
        `{${objName}:_soupEntryId},{${objName}:__local__},{${objName}:__locally_created__},` +
        `{${objName}:__locally_updated__},{${objName}:__locally_deleted__}`
    return `SELECT ${fieldString},${standardFieldString} FROM {${objName}} WHERE {${objName}:${operationField}}='1'`
}

export const genQueryAllFieldsString = (objName: string) => {
    const allFields = getAllFieldsByObjName(objName)
    const allFieldsString = allFields.map((field) => `{${objName}:${field}}`).join(',')
    return {
        allFields,
        allFieldsString
    }
}

export const filterExistFields = (soupName: string, objs: any[], fieldList?: any[]) => {
    const objsToDo = []
    const filterListToUse = fieldList || getObjByName(soupName).fieldList
    objs.forEach((obj) => {
        const objToDo = {}
        Object.keys(obj).forEach((key) => {
            if (filterListToUse.indexOf(key) !== -1) {
                objToDo[key] = obj[key]
            }
        })
        objsToDo.push(objToDo)
    })
    return objsToDo
}
