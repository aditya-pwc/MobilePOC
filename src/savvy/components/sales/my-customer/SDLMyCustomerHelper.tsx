/*
 * @Description: logic for My customer
 * @Author: Yi Li
 * @Date: 2021-11-26 00:08:12
 * @LastEditTime: 2023-08-04 13:19:59
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */
import SDLMyCustomerQueries from '../../../queries/SDLMyCustomerQueries'
import { SoupService } from '../../../service/SoupService'
import { formatString } from '../../../utils/CommonUtils'
import _ from 'lodash'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { SDLMyCustomerCellModel } from './SDLMyCustomerModel'
import { CommonParam } from '../../../../common/CommonParam'
import { isPersonaSDL, isPersonaUGM, Persona } from '../../../../common/enums/Persona'

export const assembledDataModelForCell = (param): SDLMyCustomerCellModel => {
    const itemIndex = param.index || NUMBER_VALUE.ZERO_NUM
    const item = param.item || {}
    const shippingAddress = JSON.parse(item.Account_ShippingAddress || '{}')
    let latitude = shippingAddress.latitude || ''
    let longitude = shippingAddress.longitude || ''
    if (item.CUST_GEOFNC__c && item.CUST_GEOFNC__c.Geofences) {
        const geofences = item.CUST_GEOFNC__c.Geofences
        const point = geofences[0]?.Geolocations[0]
        if (point.latitude && point.longitude) {
            latitude = point.latitude
            longitude = point.longitude
        }
    }
    return {
        ...item,
        index: itemIndex,
        title: item.AccountName || '',
        subTitle: shippingAddress.street ? shippingAddress?.street : '',
        contentTitle: `${shippingAddress?.city ? shippingAddress.city + ', ' : ''}${
            shippingAddress.state ? shippingAddress.state : ''
        }${shippingAddress.postalCode ? ' ' + shippingAddress.postalCode : ''} `,
        phone: item.AccountPhone,
        userId: item.UserId,
        lastName: item.UserLastName,
        firstName: item.UserFirstName,
        userName: item.UserName,
        salesRoute: item.TRouteSales_LOCL_RTE_ID__c,
        latitude: latitude,
        longitude: longitude
    }
}

export const getPopUpData = (geoData: any, storageArr?: any) => {
    const groupData = _.groupBy(geoData, (item: any) => {
        return item.TRouteSales_RTE_TERR_NM__c
    })
    const pacResultArr = []
    _.forEach(groupData, (val, keyStr) => {
        pacResultArr.push({
            name: keyStr,
            items: val,
            select: true
        })
    })
    const selectedData = []
    if (storageArr?.length > 0) {
        pacResultArr.forEach((element) => {
            element.select = false
            storageArr.forEach((item) => {
                if (element.name === item.name) {
                    element.select = item.select
                }
            })
            selectedData.push(element)
        })
        return selectedData
    }
    return pacResultArr
}

export const containKeyInStringArray = (stringArr, inputString) => {
    let isContain = false
    stringArr.forEach((element) => {
        const elementStr = element || ''
        const targetString = elementStr.toUpperCase()
        if (targetString && targetString.indexOf(inputString.toUpperCase()) >= NUMBER_VALUE.ZERO_NUM) {
            isContain = true
        }
    })
    return isContain
}

export const filterWithSelectedSubTypeAndInputString = (originData: any[], typeData?: any[], inputString?: string) => {
    let filterData = []
    if (typeData?.length > 0) {
        typeData.forEach((element) => {
            const cloneData = filterData.slice(0)
            if (element.select) {
                filterData = [...cloneData, ...element.items]
            }
        })
    } else {
        filterData = originData
    }
    if (inputString) {
        const searchData = []
        filterData.forEach((item) => {
            const fieldList = [
                item.AccountName,
                item.Account_RTLR_STOR_NUM__c,
                item.Account_ShippingAddress,
                item.CUST_UNIQ_ID_VAL__c
            ]
            if (CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER) {
                // NRID  SalesRoute SalesRep
                fieldList.push(...[item.GTMU_RTE_ID__c, item.TRouteSales_LOCL_RTE_ID__c, item.UserName])
            }
            const isContain = containKeyInStringArray(fieldList, inputString)
            if (isContain) {
                searchData.push(item)
            }
        })
        return searchData
    }
    return filterData
}

const uniqueDataWithCustomerCAndRouteC = (dataSource) => {
    const uniqueCustomers = _.groupBy(dataSource, (item: any) => {
        return item.RouteCustomer_Customer__c
    })
    const finalCustomerData = []
    _.forEach(uniqueCustomers, (v) => {
        if (v.length > NUMBER_VALUE.ZERO_NUM) {
            finalCustomerData.push(v[0])
        }
    })
    return finalCustomerData
}

export const queryTargetRouteSalesGeoToGetAccount = (uid?) => {
    return new Promise<any[]>((resolve, reject) => {
        const { q, f, sdlF, sdlQuery, ugmF, ugmQuery } = SDLMyCustomerQueries.getMyCustomers
        let finalQuery = ''
        let field: string[]
        if (isPersonaUGM() && !uid) {
            finalQuery = formatString(ugmQuery, [CommonParam.userLocationId])
            field = ugmF
        } else if (isPersonaSDL() || (isPersonaUGM() && uid)) {
            finalQuery = formatString(sdlQuery, [CommonParam.userLocationId])
            field = sdlF
        } else {
            finalQuery = formatString(q, [CommonParam.userLocationId])
            field = f
        }
        if (uid) {
            finalQuery += ` AND {User:Id} = '${uid}'`
        }
        SoupService.retrieveDataFromSoup('Route_Sales_Geo__c', {}, field, finalQuery)
            .then((customerData: any) => {
                const uniqueData = uniqueDataWithCustomerCAndRouteC(customerData)
                resolve(uniqueData)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
