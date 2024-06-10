import { useEffect, useState } from 'react'
import _, { isEmpty } from 'lodash'
import { restDataCommonCall, syncDownObj, syncUpObjCreateFromMem } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { checkEmailAddressCorrect } from '../components/rep/lead/common/EmailAddressInput'
import { getCheckPhoneNumberResult } from '../components/rep/lead/common/PhoneNumberInput'
import { CommonParam } from '../../common/CommonParam'
import moment from 'moment'
import { getRecordTypeIdByDeveloperName } from '../utils/CommonUtils'
import { SoupService } from '../service/SoupService'
import { baseStyle } from '../../common/styles/BaseStyle'
import { formatWithTimeZone } from '../utils/TimeZoneUtils'
import { t } from '../../common/i18n/t'
import { replaceQuotesToWildcard } from '../utils/RepUtils'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const computeShipAddressForPos = (shippingAddress: {
    city: string
    state: string
    postalCode: string
    street: string
    stateCode: string
}) => {
    const street = shippingAddress?.street ? shippingAddress?.street : ''
    const city = shippingAddress?.city ? shippingAddress?.city : ''
    const state = shippingAddress?.state ? shippingAddress?.state : ''
    const postalCode = shippingAddress?.postalCode ? shippingAddress?.postalCode : ''
    const stateCode = shippingAddress?.stateCode ? shippingAddress?.stateCode : ''
    return {
        address: street,
        city: city,
        state: state,
        ZIP: postalCode,
        stateCode: stateCode
    }
}
export const initPosRequestOverview = (customer: any) => {
    const customerShippingAddress = computeShipAddressForPos(JSON.parse(customer['Account.ShippingAddress'] ?? '{}'))
    return {
        Id: null,
        Reason_Cde__c: null,
        customer__c: customer?.AccountId,
        customer_id__c: customer['Account.CUST_UNIQ_ID_VAL__c'] || '',
        caller_name__c: null,
        Address__c: customerShippingAddress.address,
        City__c: customerShippingAddress.city,
        State__c: customerShippingAddress.stateCode,
        Zip__c: customerShippingAddress.ZIP,
        email_addr_txt__c: null,
        caller_phone_num__c: null
    }
}

export const usePosDisableSave = (
    overview: any,
    activePart: number,
    activeStep: number,
    posDetailList: any,
    isSubmitting: boolean
) => {
    const [disableSave, setDisableSave] = useState(true)
    useEffect(() => {
        if (activeStep === 0) {
            setDisableSave(
                isEmpty(overview.Reason_Cde__c) ||
                    isEmpty(overview.Address__c) ||
                    isEmpty(overview.City__c) ||
                    isEmpty(overview.State__c) ||
                    isEmpty(overview.Zip__c) ||
                    isEmpty(overview.caller_phone_num__c) ||
                    !isEmpty(checkEmailAddressCorrect(overview?.email_addr_txt__c || '').msg) ||
                    !isEmpty(getCheckPhoneNumberResult(overview?.caller_phone_num__c || '').msg)
            )
        } else {
            setDisableSave(_.size(posDetailList) === 0 || isSubmitting)
        }
    }, [overview, activePart, activeStep, posDetailList, isSubmitting])
    return disableSave
}
export const usePOSCategory = (searchValue: string, locationId: string) => {
    const [category, setCategory] = useState<any>([])

    useEffect(() => {
        let query =
            'SELECT Id,Category_Name__c,Category_Id__c,Discont_Loc_Id__c FROM Asset WHERE Product_Active__c' +
            ' = True and Product_Discontinued__c = False AND Catalog_Flag__c = TRUE'
        if (searchValue && searchValue.length >= 3) {
            query += " AND Category_Name__c LIKE '%" + replaceQuotesToWildcard(searchValue) + "%'"
        }
        query += ' ORDER BY Category_Name__c ASC'
        syncDownObj('Asset', query, false)
            .then((res) => {
                const data = res.data
                const locCategoryList = _.filter(data, (v) => {
                    return !_.includes(_.split(v?.Discont_Loc_Id__c, ','), locationId)
                })
                const list = _.uniqBy(locCategoryList, (v: any) => v?.Category_Id__c)
                setCategory(list)
            })
            .catch((e) => {
                setCategory([])
                storeClassLog(Log.MOBILE_ERROR, 'usePOSCategory', 'fetch POS category: ' + ErrorUtils.error2String(e))
            })
    }, [searchValue])

    return category
}
export const usePOSList = (searchValue: string, categoryId: string, locationId: string) => {
    const [list, setList] = useState<any>([])

    useEffect(() => {
        if (categoryId) {
            const query =
                'query/?q=SELECT Id,Product_Name__c,Product_Subtype__c,Package_Size_Name__c,' +
                'Color_Name__c,Brand_Name__c,Notes__c,Quantity,Default_Cost__c,Category_Id__c,Category_Name__c,Discont_Loc_Id__c FROM ' +
                `Asset WHERE Category_Id__c=${categoryId} AND Product_Active__c = True AND ` +
                'Product_Discontinued__c = False AND Catalog_Flag__c = TRUE'
            restDataCommonCall(query, 'GET')
                .then((res) => {
                    const records = res.data.records
                    const locCategoryProductList = _.filter(records, (v) => {
                        return !_.includes(_.split(v?.Discont_Loc_Id__c, ','), locationId)
                    })
                    let filteredRecords = locCategoryProductList
                    if (searchValue && searchValue.length >= 3) {
                        const lowerValue = _.toLower(searchValue)
                        try {
                            const pattern = new RegExp(replaceQuotesToWildcard(lowerValue, '.'))
                            filteredRecords = _.filter(locCategoryProductList, (o) => {
                                return (
                                    pattern.test(_.toLower(o.Product_Name__c)) ||
                                    pattern.test(_.toLower(o.Product_Subtype__c)) ||
                                    pattern.test(_.toLower(o.Package_Size_Name__c)) ||
                                    pattern.test(_.toLower(o.Color_Name__c)) ||
                                    pattern.test(_.toLower(o.Brand_Name__c))
                                )
                            })
                        } catch (e) {
                            setList([])
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'usePOSList',
                                'search POS list: ' + ErrorUtils.error2String(e)
                            )
                        }
                    }
                    const sortedList = _.orderBy(
                        filteredRecords,
                        ['Product_Name__c', 'Product_Subtype__c', 'Package_Size_Name__c'],
                        ['asc']
                    )
                    setList(sortedList)
                })
                .catch((e) => {
                    setList([])
                    storeClassLog(Log.MOBILE_ERROR, 'usePOSList', 'fetch POS list: ' + ErrorUtils.error2String(e))
                })
        } else {
            setList([])
        }
    }, [searchValue, categoryId])

    return list
}

export const getPOSStatusViewStyle = (status: string) => {
    if (status === 'Delivered') {
        return {
            backgroundColor: baseStyle.color.loadingGreen
        }
    } else if (status === 'Declined') {
        return {
            backgroundColor: baseStyle.color.borderGray
        }
    }
    return {
        backgroundColor: baseStyle.color.yellow
    }
}
export const getPOSStatusTitleStyle = (status: string) => {
    if (status === 'Delivered') {
        return {
            color: baseStyle.color.white
        }
    } else if (status === 'Declined') {
        return {
            color: baseStyle.color.titleGray
        }
    }
    return {
        color: baseStyle.color.black
    }
}

export const getPOSStatusLabel = (status: string) => {
    switch (status) {
        case 'Delivered':
            return _.toUpper(t.labels.PBNA_MOBILE_IP_DELIVERED)
        case 'Declined':
            return _.toUpper(t.labels.PBNA_MOBILE_DECLINED)
        default:
            return _.toUpper(t.labels.PBNA_MOBILE_DELIVERY_PENDING)
    }
}

export const usePOSListHooks = (customer: any, refreshFlag: number) => {
    const [posList, setPosList] = useState([])
    const fetchData = async () => {
        const recordTypeId = await getRecordTypeIdByDeveloperName('POS_Order', 'Request__c')
        return SoupService.retrieveDataFromSoup('Request__c', {}, [], null, [
            `WHERE {Request__c:request_subtype__c}='POS Header' AND 
            {Request__c:RecordTypeId}='${recordTypeId}' AND 
            {Request__c:customer_id__c}='${customer['Account.CUST_UNIQ_ID_VAL__c'] || ''}' 
            ORDER BY {Request__c:CreatedDate} DESC
            `
        ])
    }

    useEffect(() => {
        fetchData()
            .then((res: any) => {
                const resData = res.map((item: any) => {
                    return {
                        ...item,
                        title: t.labels.PBNA_MOBILE_POS_POS_ORDER + (item?.Inquiry_Id__c || ''),
                        subTitle:
                            t.labels.PBNA_MOBILE_POS_REQUEST_ON +
                            ' ' +
                            formatWithTimeZone(item?.CreatedDate, TIME_FORMAT.MMMDDYYYY, true, false),
                        tagTitle: item?.status__c,
                        tagStyle: getPOSStatusViewStyle(item.status__c),
                        tagTitleStyle: getPOSStatusTitleStyle(item.status__c)
                    }
                })
                setPosList(resData)
            })
            .catch((e) => {
                setPosList([])
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'usePOSListHooks',
                    'fetch POS header list: ' + ErrorUtils.error2String(e)
                )
            })
    }, [customer, refreshFlag])

    return posList
}

export const usePOSLineItems = (headerId: string) => {
    const [lineItems, setLineItems] = useState([])

    useEffect(() => {
        if (headerId) {
            restDataCommonCall(
                'query/?q=SELECT Id,asset_id__r.Brand_Name__c,asset_id__r.Category_Id__c,' +
                    'asset_id__r.Category_Name__c,asset_id__r.Color_Name__c,asset_id__r.Default_Cost__c,asset_id__r.Notes__c,' +
                    'asset_id__r.Package_Size_Name__c,asset_id__r.Product_Name__c,asset_id__r.Product_Subtype__c,' +
                    'asset_id__r.Quantity,Order_Quantity__c ' +
                    `FROM request__c where parent_request_record__c='${headerId}'`,
                'GET'
            )
                .then((res) => {
                    setLineItems(res?.data?.records || [])
                })
                .catch((e) => {
                    setLineItems([])
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'usePOSLineItems',
                        'fetch POS line items: ' + ErrorUtils.error2String(e)
                    )
                })
        } else {
            setLineItems([])
        }
    }, [headerId])

    return lineItems
}

export const onSubmitRequestData = (overview: any, posDetailList: any) => {
    return new Promise((resolve, reject) => {
        getRecordTypeIdByDeveloperName('POS_Order', 'Request__c')
            .then((recordTypeId) => {
                const orderId =
                    CommonParam.GPID__c +
                    '_' +
                    overview?.customer_id__c +
                    '_' +
                    moment().format(TIME_FORMAT.YMMDD) +
                    '_' +
                    moment().format(TIME_FORMAT.YMD_HMS)
                const posHeader = {
                    Reason_Cde__c: overview?.Reason_Cde__c || '',
                    caller_name__c: overview?.caller_name__c || '',
                    requested_by__c: CommonParam.userId,
                    request_gpid__c: CommonParam.GPID__c,
                    Address__c: overview?.Address__c || '',
                    City__c: overview?.City__c || '',
                    State__c: overview?.State__c || '',
                    Zip__c: overview?.Zip__c || '',
                    email_addr_txt__c: overview?.email_addr_txt__c || '',
                    customer_id__c: overview?.customer_id__c || '',
                    customer__c: overview?.customer__c || '',
                    order_id__c: orderId,
                    Created_By_Savvy__c: true,
                    RecordTypeId: recordTypeId || '',
                    request_subtype__c: 'POS Header',
                    Name: orderId,
                    Send_Outbound__c: true,
                    caller_phone_num__c: overview?.caller_phone_num__c || ''
                }
                syncUpObjCreateFromMem('Request__c', [posHeader])
                    .then((res) => {
                        const uploadedHeader = res[0]?.data[0] || {}
                        const posItems = posDetailList.map((item: any) => {
                            return {
                                caller_name__c: overview?.caller_name__c || '',
                                requested_by__c: CommonParam.userId,
                                request_gpid__c: CommonParam.GPID__c,
                                Order_Quantity__c: item?.Order_Quantity__c || 0,
                                Spcl_Inst__c: item?.Spcl_Inst__c || '',
                                customer_id__c: overview?.customer_id__c || '',
                                customer__c: overview?.customer__c || '',
                                Created_By_Savvy__c: true,
                                RecordTypeId: recordTypeId || '',
                                request_subtype__c: 'POS Item',
                                Name: orderId,
                                parent_request_record__c: uploadedHeader?.Id,
                                caller_phone_num__c: overview?.caller_phone_num__c || '',
                                asset_id__c: item?.Id || '',
                                BannerText1__c: item?.BannerText1__c || '',
                                BannerText2__c: item?.BannerText2__c || '',
                                BannerText3__c: item?.BannerText3__c || '',
                                BannerText4__c: item?.BannerText4__c || '',
                                BannerText5__c: item?.BannerText5__c || ''
                            }
                        })
                        syncUpObjCreateFromMem('Request__c', posItems)
                            .then((resItems) => {
                                const uploadedItems = resItems[0]?.data || []
                                resolve(uploadedItems)
                            })
                            .catch((err) => {
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'onSubmitRequestData',
                                    'syncUp POS Item : ' + ErrorUtils.error2String(err)
                                )
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'onSubmitRequestData',
                            'syncUp POS Header : ' + ErrorUtils.error2String(err)
                        )
                        reject(err)
                    })
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'onSubmitRequestData',
                    'get RecordTypeId : ' + ErrorUtils.error2String(err)
                )
                reject(err)
            })
    })
}

export const useDisablePOSButton = (customer: any, refreshFlag: number) => {
    const [disableButton, setDisableButton] = useState(true)
    useEffect(() => {
        if (customer['Account.CUST_UNIQ_ID_VAL__c']) {
            getRecordTypeIdByDeveloperName('POS_Order', 'Request__c')
                .then((recordTypeIdRes) => {
                    const POSPath =
                        'SELECT Id,status__c FROM Request__c ' +
                        "WHERE request_subtype__c  = 'POS Header' " +
                        `AND RecordTypeId = '${recordTypeIdRes}' ` +
                        `AND customer_id__c = '${customer['Account.CUST_UNIQ_ID_VAL__c']}' ` +
                        "AND status__c = 'Delivery Pending' LIMIT 1"
                    syncDownObj('Request__c', POSPath, false).then((resDate) => {
                        setDisableButton(!_.isEmpty(resDate?.data[0]?.Id))
                    })
                })
                .catch((e) => {
                    storeClassLog(Log.MOBILE_ERROR, 'useDisablePOSButton', ErrorUtils.error2String(e))
                })
        }
    }, [customer, refreshFlag])

    return disableButton
}
