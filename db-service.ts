import { enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage'
import * as Cblite from 'react-native-cblite'
import * as RNFS from 'react-native-fs'
enablePromise(true)
const tableName = 'Customer'
const CouchbaseNativeModule = Cblite
// export const getDBConnection = async () => {
//     return openDatabase(
//         { name: 'test1.sqlite', location: 'default' },
//         (success) => {
//             console.log('succesfully created Database: ' + success)
//         },
//         (error) => {
//             console.error('Could not connect to database' + error)
//             throw Error('Could not connect to database')
//         }
//     )
// }
const success_callback = (SuccessResponse) => {
    if (SuccessResponse === 'Success' || SuccessResponse === 'Database already exists') {
        console.log('sequence 1')
        console.log('Successfully Created Db' + SuccessResponse)
    } else {
        alert('There was a problem while login.')
    }
}
const error_callback = (ErrorResponse) => {
    console.log(ErrorResponse)
    alert('There was a problem while login : ' + ErrorResponse)
    this.dismissLoading()
}

export const getDBConnection = async () => {
    const newDirectory = RNFS.DocumentDirectoryPath + '/customer'
    console.log('directory: ' + newDirectory)
    console.log('directory: ' + newDirectory)
    const newdbName = 'Customer'
    const newconfig = {
        Directory: newDirectory
    }

    CouchbaseNativeModule.CreateOrOpenDatabase(newdbName, newconfig, success_callback, error_callback)

    // console.log("Universities db exists:",dbexists)

    // if (dbexists) {
    //     CouchbaseNativeModule.CreateOrOpenDatabase(newdbName, newconfig, this.dbexists_success_callback, this.error_callback);

    // }
}
// export const createEmployeeTable = async (db: SQLiteDatabase) => {
//     // create table if not exists
//     const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
//         _id TEXT PRIMARY KEY ,
//         FirstName TEXT,
//         LastName TEXT,
//         Name TEXT ,
//         Profile TEXT,
//         GPID__c TEXT,
//         GM_LOC_ID__c TEXT,
//         Phone INTEGER);`

//     await db.executeSql(query)
// }
export const createCustomerTableCB = async () => {
    console.log('inside createEmployeeTable ')
    // create table if not exists
    const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        Id TEXT PRIMARY KEY , 
        LgcyId TEXT,
        StorNum TEXT,
        Nm TEXT ,
        Addr_Ln1 TEXT,
        Addr_Ln2 TEXT,
        Addr_Ct TEXT,
        Addr_Terr TEXT,
        Addr_Pstl TEXT,
        Lat TEXT,
        Lngtd TEXT,
        GeofncRd INT);`

    CouchbaseNativeModule.createQuery('Customer', query)
}
export const createCustomerTable = async (db: SQLiteDatabase) => {
    console.log('createCustomerTable')
    // create table if not exists
    const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        Id TEXT PRIMARY KEY , 
        LgcyId TEXT,
        StorNum TEXT,
        Nm TEXT ,
        Addr_Ln1 TEXT,
        Addr_Ln2 TEXT,
        Addr_Ct TEXT,
        Addr_Terr TEXT,
        Addr_Pstl TEXT,
        Lat TEXT,
        Lngtd TEXT,
        GeofncRd INT);`

    await db.executeSql(query)
}
export const getCustomerData = async (db: SQLiteDatabase) => {
    try {
        const employeeItems = []
        const results = await db.executeSql(`SELECT * FROM ${tableName}`)
        results.forEach((result) => {
            for (let index = 0; index < result.rows.length; index++) {
                employeeItems.push(result.rows.item(index))
            }
        })
        return employeeItems
    } catch (error) {
        console.error(error)
        throw Error('Failed to get todoItems !!!')
    }
}

export const saveEmployeeItems = async (db: SQLiteDatabase, todoItems: []) => {
    console.log('saveEmployeeItems')

    const insertValues = todoItems
        .map((i) => {
            return `('${i._id}', '${i.FirstName.replace(/'/g, "''")}', '${i.LastName.replace(/'/g, "''")}', ${
                i.Phone === null ? 'NULL' : `'${i.Phone}'`
            }, '${i.Name.replace(/'/g, "''")}', ${i.GM_LOC_ID__c}, ${i.GPID__c}, '${i['Profile.Name'].replace(
                /'/g,
                "''"
            )}')`
        })
        .join(', ')
    const insertQuery = `INSERT OR REPLACE INTO ${tableName}(_id, FirstName, LastName,Phone,Name,GM_LOC_ID__c,GPID__c,Profile) values ${insertValues}`

    return db.executeSql(insertQuery)
}
// export const saveCustomerItems = async (db: SQLiteDatabase, CustomerItems: []) => {
//     const insertValues = CustomerItems.map((i) => {
//         // Extract address fields from the Addr object
//         const addrLn1 = i.Addr?.Ln1
//         const addrLn2 = i.Addr?.Ln2 === 'null' ? 'null' : i.Addr?.Ln2
//         const addrCt = i.Addr?.Ct
//         const addrTerr = i.Addr?.Terr
//         const addrPstl = i.Addr?.Pstl

//         // Extract other fields
//         const { Id, LgcyId, StorNum, Nm, Lat, Lngtd, GeofncRd } = i

//         // Return a string with all the extracted values
//         return `('${Id}', '${LgcyId}', '${StorNum}', '${Nm}', '${addrLn1}', '${addrLn2}', '${addrCt}', '${addrTerr}', '${addrPstl}', ${Lat}, ${Lngtd}, ${GeofncRd})`
//     }).join(',')
//     console.log(insertValues)
//     // Construct the insert query with the insertValues
//     const insertQuery = `INSERT OR REPLACE INTO ${tableName} (Id, LgcyId, StorNum, Nm, Addr_Ln1, Addr_Ln2, Addr_Ct, Addr_Terr, Addr_Pstl, Lat, Lngtd, GeofncRd) VALUES ${insertValues};`

//     return db.executeSql(insertQuery)
// }
let customerData = []
export const saveCustomerCB = async (CustomerItems: []) => {
    console.log('saveCustomerCB')
    console.log(CustomerItems)

    const insertValues = CustomerItems.map((i) => {
        // Extract address fields from the Addr object
        const addrLn1 = i.Addr?.Ln1
        const addrLn2 = i.Addr?.Ln2 === 'null' ? 'null' : i.Addr?.Ln2
        const addrCt = i.Addr?.Ct
        const addrTerr = i.Addr?.Terr
        const addrPstl = i.Addr?.Pstl
        // Extract other fields
        const { Id, LgcyId, StorNum, Nm, Lat, Lngtd, GeofncRd } = i

        // Return a string with all the extracted values
        return `('${Id}', '${LgcyId}', '${StorNum}', '${Nm}', '${addrLn1}', '${addrLn2}', '${addrCt}', '${addrTerr}', '${addrPstl}', ${Lat}, ${Lngtd}, ${GeofncRd})`
    }).join(',')
    // Construct the insert query with the insertValues
    // const insertQuery = `INSERT INTO Customer (Id, LgcyId, StorNum, Nm, Addr_Ln1, Addr_Ln2, Addr_Ct, Addr_Terr, Addr_Pstl, Lat, Lngtd, GeofncRd) VALUES ${insertValues}`

    const indexExpression = [
        'Id',
        'LgcyId',
        'StorNum',
        'Nm',
        'Addr_Ln1',
        'Addr_Ln2',
        'Addr_Ct',
        'Addr_Terr',
        'Addr_Pstl',
        'Lat',
        'Lngtd',
        'GeofncRd'
    ]
    const resp = CouchbaseNativeModule.createValueIndex('Customer', 'Id', indexExpression)
    console.log('sequence 2' + resp)
    const json = {
        Ct: 'EVERETT',
        Ln1: '12906 BOTHELL EVERETT HWY',
        Ln2: null,
        Pstl: '98208-6645',
        Terr: 'WA',
        GeofncRd: 150,
        Id: 'Customer::2003466992_US',
        Lat: 47.8797777,
        LgcyId: 'Customer::1636316_157',
        Lngtd: -122.2092078,
        Nm: 'FRED MEYER #458',
        StorNum: '000458'
    }
    // setTimeout(() => {
    //     delayMethod(json)
    // }, 3000)
    const result = await delayMethod(json)
    console.log('result: ', result)
    return result
}
// export const fetchCustomerData = () => {
// }
function delayMethod(insertValues) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            CouchbaseNativeModule.setDocument(
                'Customer',
                'Id',
                JSON.stringify(insertValues),
                (result) => {
                    if (result === 'Success') {
                        alert('Data inserted ,successfully')
                        CouchbaseNativeModule.query(
                            'Customer',
                            'Select * from Customer;',
                            (response) => {
                                if (response != null) {
                                    // customerData = response
                                    resolve(response) // Resolve the promise with customerData
                                } else {
                                    reject('No response from query')
                                }
                            },
                            (error) => {
                                console.log('error in query' + error)
                                reject(error) // Reject the promise on error
                            }
                        )
                    } else {
                        reject('There was a problem while updating the data. Details: ' + result)
                    }
                },
                (error) => {
                    console.log('error setDocument')
                    alert(error)
                    reject(error) // Reject the promise on error
                }
            )
        }, 3000)
    })
}
// function delayMethod(insertValues) {
//     // do whatever you want here
//     CouchbaseNativeModule.setDocument('Customer', 'Id', JSON.stringify(insertValues), OnSetDocSuccess, (error) => {
//         console.log('error setDocument')
//         alert(error)
//     })
// }
function OnSetDocSuccess(result) {
    if (result === 'Success') {
        alert('Data inserted ,successfully')
        CouchbaseNativeModule.query(
            'Customer',
            'Select * from Customer;',
            (response) => {
                if (response != null) {
                    customerData = response
                    console.log('response' + customerData)
                }
            },
            (error) => {
                console.log('error in query' + error)
            }
        )
    } else {
        alert('There was a problem while updating the data. Details : ' + result)
    }
}
export const deleteTodoItem = async (db: SQLiteDatabase, id: number) => {
    const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`
    await db.executeSql(deleteQuery)
}

export const deleteTable = async (db: SQLiteDatabase) => {
    const query = `drop table ${tableName}`

    await db.executeSql(query)
}

// const db = await getDBConnection()
