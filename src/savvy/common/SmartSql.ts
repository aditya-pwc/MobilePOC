/**
 * @description Utils for getting data from local soup.
 * @author Christopher ZANG
 * @date 2021-05-09
 *
 */

import { isArray } from 'lodash'
import { SoupService } from '../service/SoupService'
import { CommonParam } from '../../common/CommonParam'

export type JoinType = 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER'
export type OrderType = 'ASC' | 'DESC' | 'asc' | 'desc'
export type ConditionType = 'OR' | 'AND' | 'or' | 'and' | 'IN'
export type ConditionOperator = '=' | '!=' | '>=' | '<=' | '>' | '<' | 'IS NULL' | 'IS NOT NULL'
interface DataTableInterface {
    name: string
    fieldList: Array<string>
    options?: TableOptionsInterface
    alias?: string
}

interface TableOptionsInterface {
    mainField: string
    targetField: string
    targetTable: string
    alias?: string
    type?: string
    fieldList?: Array<string>
}

interface JoinTableInterface {
    table: string
    options: TableOptionsInterface
    type?: JoinType
    alias?: string
}

interface OrderByInterface {
    table: string
    field: string
    type?: OrderType
}

interface GroupByInterface {
    table: string
    field: string
}

interface ConditionTypeInterface {
    type?: ConditionType
    operator: ConditionOperator
    leftField: string
    leftTable: string
    rightField: string
    rightTable?: string
}

const buildCond = (finalQuery, tempCond) => {
    let finalQueryTemp = ''
    const rightFieldArray = JSON.parse(tempCond.rightField).value
    if (isArray(rightFieldArray)) {
        rightFieldArray.forEach((rightFieldItem, index) => {
            finalQueryTemp =
                finalQueryTemp +
                (index === 0 ? '' : ' OR ') +
                '{' +
                tempCond.leftTable +
                ':' +
                tempCond.leftField +
                '} ' +
                tempCond.operator +
                ' '
            if (tempCond.rightTable) {
                finalQueryTemp += ' {' + tempCond.rightTable + ':' + ("'" + rightFieldItem + "'") + '} '
            } else {
                finalQueryTemp += "'" + rightFieldItem + "'"
            }
        })
    }
    finalQuery = finalQuery + (finalQueryTemp.length > 0 ? ' AND ( ' + finalQueryTemp + ' ) ' : '')
    return finalQuery
}

export function database(db?) {
    const tables: Array<DataTableInterface> = []
    let conditions: Array<ConditionTypeInterface> = []
    let orderBy: Array<OrderByInterface> = []
    let groupBy: GroupByInterface = null

    const getFields = () => {
        let fieldList = []
        if (tables.length === 0) {
            throw new Error('Get Data Failed: No Table Selected')
        }
        if (tables.length === 1) {
            fieldList = tables[0].fieldList
        } else {
            fieldList = [].concat(
                ...tables.map((table) => table.fieldList.map((b) => (table.alias ? table.alias + '.' : '') + b))
            )
        }
        return fieldList
    }
    const findFieldList = (ob) => {
        return CommonParam.objs.find((model) => model.soupName === ob).fieldList.map((field) => field.name)
    }
    const buildWhereQuery = (initQuery: string) => {
        let finalQuery = initQuery + ' WHERE '
        let tempCond = conditions.shift()
        if (tempCond.type === 'IN') {
            finalQuery = buildCond(finalQuery, tempCond)
        } else {
            finalQuery =
                finalQuery + ' {' + tempCond.leftTable + ':' + tempCond.leftField + '} ' + tempCond.operator + ' '
            if (tempCond.rightTable) {
                finalQuery += ' {' + tempCond.rightTable + ':' + tempCond.rightField + '} '
            } else {
                finalQuery += tempCond.rightField + ' '
            }
        }
        while (conditions.length > 0) {
            tempCond = conditions.shift()
            if (tempCond.type === 'IN') {
                finalQuery = buildCond(finalQuery, tempCond)
            } else {
                finalQuery += tempCond.type || ' AND '
                finalQuery =
                    finalQuery + ' {' + tempCond.leftTable + ':' + tempCond.leftField + '} ' + tempCond.operator + ' '
                if (tempCond.rightTable) {
                    finalQuery += ' {' + tempCond.rightTable + ':' + tempCond.rightField + '} '
                } else {
                    finalQuery += tempCond.rightField + ' '
                }
            }
        }
        return finalQuery
    }
    const buildOrderByQuery = (initQuery) => {
        let finalQuery = initQuery + ' ORDER BY'
        orderBy.forEach((item, index) => {
            finalQuery +=
                ' {' +
                item.table +
                ':' +
                item.field +
                '} ' +
                (item.type || '') +
                (orderBy.length > 1 && index !== orderBy.length - 1 ? ',' : '')
        })
        return finalQuery
    }
    const buildSmartQuery = () => {
        let finalQuery = 'SELECT '
        const tmpTable = JSON.parse(JSON.stringify(tables))
        const mainTable = tmpTable[0]
        let fieldList = mainTable.fieldList
        const tableName = mainTable.name
        let tablejoin = ''
        tmpTable.forEach((table) => {
            fieldList = table.fieldList
            tablejoin = table.name
            finalQuery =
                finalQuery +
                fieldList.reduce((a, field) => {
                    return a + (table.alias ? table.alias + '.' : '') + '{' + tablejoin + ':' + field + '},'
                }, '')
        })
        finalQuery += '{' + tableName + ':_soupEntryId},'
        finalQuery += '{' + tableName + ':__local__},'
        finalQuery += '{' + tableName + ':__locally_created__},'
        finalQuery += '{' + tableName + ':__locally_updated__},'
        finalQuery += '{' + tableName + ':__locally_deleted__}'
        finalQuery += ' FROM {' + tableName + '}' + (mainTable.alias || '')
        tmpTable.shift()
        tmpTable.forEach((table) => {
            const targetTable = table.options.targetTable
            const targetField = table.options.targetField
            const mainField = table.options.mainField
            finalQuery =
                finalQuery +
                (table.options.type ? ' ' + table.options.type : '') +
                ' JOIN {' +
                table.name +
                '} ' +
                (table.alias ? table.alias : '') +
                ' ON ' +
                (table.options.alias ? table.options.alias + '.' : ' ') +
                '{' +
                targetTable +
                ':' +
                targetField +
                '} = ' +
                (table.alias ? table.alias + '.' : '') +
                '{' +
                table.name +
                ':' +
                mainField +
                '}'
        })
        if (conditions.length > 0) {
            finalQuery = buildWhereQuery(finalQuery)
        }
        if (groupBy) {
            finalQuery = finalQuery + ' GROUP BY {' + groupBy.table + ':' + groupBy.field + '} '
        }
        if (orderBy?.length > 0) {
            finalQuery = buildOrderByQuery(finalQuery)
        }
        return finalQuery
    }
    const q = {
        use: (table) => {
            if (tables.length > 0) {
                throw new Error('Use table failed: Already choosed one table')
            }
            tables.push({
                name: table,
                fieldList: []
            })
            return q
        },
        select: (fieldList?: Array<string>) => {
            if (tables.length < 1) {
                throw new Error('No table defined')
            }
            const lastTable = tables[tables.length - 1]
            if (!fieldList || fieldList.length === 0) {
                fieldList = findFieldList(lastTable.name)
            }
            lastTable.fieldList = fieldList
            return q
        },
        getData: () => {
            const query = buildSmartQuery()
            const fields = getFields()
            return SoupService.retrieveDataFromSoup(db || tables[0].name, {}, fields, query)
        },
        getQuery: () => {
            return buildSmartQuery()
        },
        getFieldList: () => {
            return getFields()
        },
        join: (joinTable: JoinTableInterface) => {
            const target = tables.find(
                (table) => table.name === joinTable.options.targetTable || table.alias === joinTable.options.targetTable
            )
            const targetFieldList = findFieldList(target.name)
            const currentFields = findFieldList(joinTable.table)
            if (!target) {
                throw new Error('Join failed: Target Table Do Not Exist')
            }
            if (targetFieldList.indexOf(joinTable.options.targetField) === -1) {
                throw new Error('Join failed: Field Do Not Exist On Target Table')
            }
            let fieldList = joinTable.options.fieldList
            if (currentFields.indexOf(joinTable.options.mainField) === -1) {
                throw new Error('Join failed: Join field Not Exisit on current table')
            }
            if (!fieldList || fieldList.length === 0) {
                fieldList = findFieldList(joinTable.table)
            }
            const t: DataTableInterface = {
                name: joinTable.table,
                fieldList: fieldList,
                options: {
                    type: joinTable.type,
                    targetTable: target.name,
                    targetField: joinTable.options.targetField,
                    mainField: joinTable.options.mainField,
                    alias: target.alias
                }
            }
            if (joinTable.alias) {
                t.alias = joinTable.alias
            }
            tables.push(t)
            return q
        },
        where: (cond: Array<ConditionTypeInterface>) => {
            if (conditions.length > 0) {
                throw new Error('Where failed: Already has condition applied')
            }
            if (cond[0].type === 'OR' || cond[0].type === 'or') {
                throw new Error('Where failed: First condition cannot be OR')
            }
            conditions = cond
            return q
        },
        groupBy: (opt: GroupByInterface) => {
            const target = findFieldList(opt.table)
            if (!target) {
                throw new Error('group by failed: Target Table Do Not Exist')
            }
            if (target.indexOf(opt.field) === -1) {
                throw new Error('group by failed: Field Do Not Exist On Table')
            }
            groupBy = opt
            return q
        },
        orderBy: (opt: Array<OrderByInterface>) => {
            opt.forEach((item) => {
                const target = findFieldList(item.table)
                if (!target) {
                    throw new Error('Order by failed: Target Table Do Not Exist')
                }
                if (target.indexOf(item.field) === -1) {
                    throw new Error('Order by failed: Field Do Not Exist On Table')
                }
            })
            orderBy = opt
            return q
        }
    }
    return q
}

// Usage 1
// database().use('Visit').select().join({
//     table: 'RetailStore',
//     alias: 'Store',
//     options: {
//         mainField: 'Id',
//         targetField: 'PlaceId',
//         targetTable: 'Visit'
//     }
// }).where([
//     {
//         leftTable: 'Visit',
//         leftField: 'VisitorId',
//         rightField: "'" + CommonParam.userId + "'",
//         operator: '='
//     },
//     {
//         leftTable: 'Visit',
//         leftField: 'Planned_Date__c',
//         rightField: "date('now', 'start of day', '-1 day')",
//         operator: '>='
//     },
//     {
//         leftTable: 'Visit',
//         leftField: 'Planned_Date__c',
//         rightField: "date('now', 'start of day', '+8 day')",
//         operator: '<'
//     }
// ]).orderBy({
//     table: 'Visit',
//     field: 'Sequence__c'
// }).getData().then(res => {
//     console.log(res[0])
// })
//
// Usage 2
// database('Visit').use('User').select(['Name']).join({
//     table: 'Visit',
//     alias: 'Visit',
//     options: {
//         mainField: 'VisitorId',
//         targetField: 'Id',
//         targetTable: 'User',
//         fieldList: ['Name']
//     },
//     type: 'LEFT'
// }).join({
//     table: 'Visit_List__c',
//     alias: 'DVL',
//     options: {
//         mainField: 'Id',
//         targetField: 'Visit_List__c',
//         targetTable: 'Visit',
//         fieldList: ['Name', 'RecordTypeId']
//     },
//     type: 'LEFT'
// }).join({
//     table: 'Visit_List__c',
//     alias: 'WVL',
//     options: {
//         mainField: 'Id',
//         targetField: 'Visit_List_Group__c',
//         targetTable: 'DVL',
//         fieldList: ['Name', 'RecordTypeId']
//     },
//     type: 'LEFT'
// }).join({
//     table: 'RetailStore',
//     alias: 'Store',
//     options: {
//         mainField: 'Id',
//         targetField: 'PlaceId',
//         targetTable: 'Visit',
//         fieldList: ['Name']
//     },
//     type: 'LEFT'
// }).getData().then(res => {
//     console.log(res[0])
// })
