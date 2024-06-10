/**
 * @description Hooks for KAM Customer List
 * @author Dashun Fu
 * @date 2023-04-16
 */

import _ from 'lodash'
import { useState, useEffect } from 'react'
import { restApexCommonCall, syncDownObj } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { useFetchCustomersFromBackend } from './CustomerHooks'
import { storeClassLog } from '../../common/utils/LogUtils'
import { CommonApi } from '../../common/api/CommonApi'
import { updateCustomerDataFields } from './MapHooks'
import { getStringValue } from '../utils/LandingUtils'
import { usePrevious } from './CommonHooks'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

/**
 * GET RetailStore data from apex call
 * @param limit page size
 * @param isRefreshing refresh data flag
 * @param setIsRefreshing React SetState
 * @param query Basic SOQL query string without condition
 * @param filterData filter params
 * @param isSearching optional param, is searching flag
 * @param sort optional param, sort
 * @returns {Object}
 */
export const useKAMRetailStoreOnline = (
    limit: number,
    isRefreshing: boolean,
    setIsRefreshing: any,
    query: string,
    filterData: any,
    isSearching?: boolean,
    sort?: string
) => {
    const [records, setRecords] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [hasMoreData, setHasMoreData] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [needRefreshData, setNeedRefreshData] = useState<boolean>(false)

    const previousFilterData = usePrevious(filterData)

    const filterDataChange = !_.isEqual(previousFilterData, filterData)

    useEffect(() => {
        if (isRefreshing) {
            if (currentPage === 1) {
                setNeedRefreshData((prevFlag) => !prevFlag)
            } else {
                setCurrentPage(1)
                setHasMoreData(true)
            }
        }
    }, [isRefreshing])

    useEffect(() => {
        if (filterDataChange) {
            if (currentPage === 1) {
                setNeedRefreshData((prevFlag) => !prevFlag)
            }
            setCurrentPage(1)
            setHasMoreData(true)
        }
    }, [sort, filterDataChange])

    useEffect(() => {
        if (isLoading) {
            isRefreshing && setIsRefreshing(false)
            return
        }
        !isSearching && setIsLoading(true)
        const newOffset = (currentPage - 1) * limit
        const offsetQuery = `LIMIT ${limit} OFFSET ${newOffset}`

        const { isOTSCustomer, merchOrderDays, segName, kaIds, accountIds, orderQuery, searchValue, wiredGroupNames } =
            filterData

        const queryData = {
            strBasicQuery: query,
            strUserId: CommonParam.userId || '',
            boolIsOTSCustomer: isOTSCustomer || null,
            lstMerchOrderDays: merchOrderDays || [],
            lstBusSegL3Name: segName || [],
            lstAccountId: accountIds || [],
            lstKAsIds: kaIds || [],
            strSearchValue: searchValue,
            strExtraOptions: orderQuery + offsetQuery,
            lstWiringGroupName: wiredGroupNames || []
        }

        restApexCommonCall(`${CommonApi.PBNA_MOBILE_API_GET_KAM_RETAILSTORE}`, 'POST', queryData)
            .then((res) => {
                const list = res.data?.lstRetailStore ? updateCustomerDataFields(res.data?.lstRetailStore) : []
                if (newOffset > 0) {
                    setRecords((preList) => [...preList, ...list])
                } else {
                    setRecords(list)
                }
                setHasMoreData(list.length === limit)
                setIsLoading(false)
                isRefreshing && setIsRefreshing(false)
            })
            .catch(async (err) => {
                setIsLoading(false)
                isRefreshing && setIsRefreshing(false)
                await storeClassLog(
                    Log.MOBILE_ERROR,
                    'useKAMRetailStoreOnline',
                    'Get Records Online:' + getStringValue(err)
                )
            })
    }, [currentPage, needRefreshData])

    return {
        records,
        setCurrentPage,
        hasMoreData,
        isLoading
    }
}

/**
 * get customer data online
 * @param limit page limit
 * @param searchString search input string
 * @param sort 'ASC' or 'DESC' sort
 * @param filterData filter and sort object
 * @returns {Object}
 */
export const useKamCustomersOnline = (
    limit: number,
    searchString?: any,
    sort?: string,
    cFlatListRef?: any,
    filterData?: object
) => {
    const MIN_SEARCH_STRING_LENGTH = 3
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('')

    const baseQuery =
        'SELECT Id, Name, Street, City, State, StateCode, Country, PostalCode, Latitude, Longitude, LOC_PROD_ID__c, CUST_UNIQ_ID_VAL__c,' +
        ' Customer_Longitude__c, Customer_Latitude__c,' +
        ' LocationId, AccountId, Account.Name, Account.Phone, Account.change_initiated__c, Account.CUST_LVL__c, Account.CUST_ID__c, Account.ShippingAddress,' +
        ' Account.Merchandising_Delivery_Days__c, Account.Merchandising_Order_Days__c,' +
        ' Account.IsCDACustomer__c, Account.CDA_Status__c, Account.CDA_Medal__c,' +
        ' Account.BUSN_SGMNTTN_LVL_1_CDV__c, Account.BUSN_SGMNTTN_LVL_1_NM__c,' +
        ' Account.BUSN_SGMNTTN_LVL_2_CDV__c, Account.BUSN_SGMNTTN_LVL_2_NM__c,' +
        ' Account.BUSN_SGMNTTN_LVL_3_CDV__c, Account.BUSN_SGMNTTN_LVL_3_NM__c,' +
        ' Account.ff_FACEBOOK__c, Account.ff_FOURSQUARE__c, Account.ff_YELP__c,' +
        ' Account.FF_LINK__c, Account.Rating__c, Account.ff_UBEREATS__c, Account.Website,' +
        ' Account.ff_POSTMATES__c, Account.ff_GRUBHUB__c, Account.ff_DOORDASH__c,' +
        ' Account.User_Link_Label_1__c, Account.User_Link_1__c,' +
        ' Account.User_Link_Label_2__c, Account.User_Link_2__c,' +
        ' Account.User_Link_Label_3__c, Account.User_Link_3__c,' +
        ' Account.Parent.Name, Account.Parent.Parent.Name, Account.Parent.Parent.Parent.Name,' +
        ' Account.CUST_UNIQ_ID_VAL__c, Account.IsOTSCustomer__c, Account.Delta_Revenue_Percentage__c FROM RetailStore'

    const [orderQuery, setOrderQuery] = useState<string>('ORDER BY Name NULLS LAST ')

    useEffect(() => {
        if (searchString) {
            searchString = searchString
                .replaceAll("'", '%')
                .replaceAll('`', '%')
                .replaceAll('’', '%')
                .replaceAll('‘', '%')
            if (searchString.length >= MIN_SEARCH_STRING_LENGTH) {
                setIsSearching(true)
                setSearchValue(searchString)
            }
        } else {
            setIsSearching(false)
            setSearchValue('')
        }
        if (sort) {
            setOrderQuery(`ORDER BY Name ${sort} NULLS LAST `)
        } else {
            setOrderQuery(`ORDER BY Name NULLS LAST `)
        }
        cFlatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
    }, [searchString, sort])

    const { records, setCurrentPage, hasMoreData, isLoading } = useKAMRetailStoreOnline(
        limit,
        isRefreshing,
        setIsRefreshing,
        baseQuery,
        { ...filterData, orderQuery, searchValue },
        isSearching,
        sort
    )
    const backendResult = useFetchCustomersFromBackend(searchString)
    return {
        kamCustomers: _.unionBy(backendResult.customers, records, 'Id'),
        setCurrentPage,
        isRefreshing,
        setIsRefreshing,
        hasMoreData,
        isLoading,
        isRightLoading: backendResult.isLoading
    }
}

export const useGetKamAccountIds = (isShowSelector: boolean) => {
    const [accountIds, setAccountIds] = useState<any[]>([])
    useEffect(() => {
        if (isShowSelector) {
            const query = `SELECT AccountId FROM AccountTeamMember WHERE UserId = '${CommonParam.userId}' AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true`
            syncDownObj('AccountTeamMember', query, false)
                .then((data) => {
                    setAccountIds(data?.data || [])
                })
                .catch(async (err) => {
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'useGetKamAccountIds',
                        `Get Account Id data list from ATM for KAM persona Failed: ${ErrorUtils.error2String(err)}`
                    )
                })
        }
    }, [isShowSelector])
    return accountIds
}

interface GEOTreeNode {
    CcId: string[]
    Name: string
    uId: string
    level: string
    parentUId?: string
    children: GEOTreeNode[]
}

interface GEOItem {
    Id: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Market__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Location__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Territory__c: string
    CcId: string
}

const transformGEODataToTree = (input: GEOItem[]): GEOTreeNode[] => {
    return input.reduce((acc: GEOTreeNode[], item: GEOItem) => {
        const marketIndex = acc.findIndex((x) => x.uId === item.Market__c)
        if (marketIndex === -1) {
            acc.push({ CcId: [item.CcId], uId: item.Market__c, level: 'Market', Name: item.Market__c, children: [] })
        }
        const market = acc.find((x) => x.uId === item.Market__c)
        market?.CcId.findIndex((x) => x === item.CcId) === -1 && market?.CcId.push(item.CcId)
        const locationIndex: any = market?.children.findIndex((x) => x.uId === item.Location__c)
        if (locationIndex === -1) {
            market?.children.push({
                uId: item.Location__c,
                CcId: [item.CcId],
                Name: item.Location__c,
                level: 'Location',
                children: [],
                parentUId: market.uId
            })
        } else {
            market?.children[locationIndex].CcId.push(item.CcId)
        }
        const location = market?.children.find((x) => x.uId === item.Location__c)
        location?.CcId.findIndex((x) => x === item.CcId) === -1 && market?.CcId.push(item.CcId)
        const territoryIndex: any = location?.children.findIndex((x) => x.uId === item.Territory__c)

        if (territoryIndex === -1) {
            location?.children.push({
                uId: item.Territory__c,
                Name: item.Territory__c,
                CcId: [item.CcId],
                level: 'Territory',
                children: [],
                parentUId: location.uId
            })
        } else {
            location?.children[territoryIndex].CcId.push(item.CcId)
        }
        return acc
    }, [])
}

const computeGEOData = (list: any[]) => {
    return list.map((li) => {
        return {
            uId: li.Route__r.Market__c,
            CcId: li.Customer__c,
            Id: li.Route__r.Id,
            Market__c: li.Route__r.Market__c,
            Location__c: li.Route__r.Location__c,
            Territory__c: li.Route__r.Territory__c
        }
    })
}

export const useGetKamCustomerFilterGEOs = (isShowSelector: boolean) => {
    const [geographyTree, setGeographyTree] = useState<any>([])
    useEffect(() => {
        if (isShowSelector) {
            const query = `SELECT Customer__c, Route__c, Route__r.Id, Route__r.Location__c, Route__r.Market__c, Route__r.Territory__c FROM Customer_to_Route__c WHERE Customer__c IN (SELECT AccountId FROM AccountTeamMember WHERE UserId = '${CommonParam.userId}' AND kam_active_flag__c = true AND If_Populated_By_KAM__c = true AND Account.IS_ACTIVE__c = true) AND ACTV_FLG__c = true and RecordType.Name = 'CTR' AND Route__r.Market__c != null AND Route__r.Location__c != null AND Route__r.Territory__c != null ORDER BY Route__r.Market__c`
            syncDownObj('Customer_to_Route__c', query, false)
                .then((data) => {
                    const geos: any[] = transformGEODataToTree(computeGEOData(data.data))
                    setGeographyTree(geos)
                })
                .catch(async (err) => {
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'useGetKamCustomerFilterGEOs',
                        `Get Kam geography Failed: ${ErrorUtils.error2String(err)}`
                    )
                    setGeographyTree([])
                })
        }
    }, [isShowSelector])

    return geographyTree
}

const findChildrenNodes = (nodes: any[], itemId: string): any[] => {
    const children = nodes.filter((node) => node.parentUId === itemId)
    const result: any[] = []
    children.forEach((child) => {
        const grandchildren = findChildrenNodes(nodes, child.uId)
        result.push(child, ...grandchildren)
    })
    return result
}

const findParentNodes = (nodes: any[], parentId: string): any[] => {
    const result: any[] = []
    const parent = nodes.find((node) => node.uId === parentId)
    if (parent) {
        result.push(parent, ...findParentNodes(nodes, parent.parentUId))
    }
    return result
}

const deleteRelatedGEOs = (list: any, index: number) => {
    let tempList = JSON.parse(JSON.stringify(list))
    const deleteItem = tempList[index]
    const childrenNodes = findChildrenNodes(list, deleteItem.uId)
    const parentNodes = findParentNodes(list, deleteItem.parentUId)
    const filterUIds = [deleteItem, ...childrenNodes, ...parentNodes].map((item) => item.uId)
    tempList = tempList.filter((geoItem: any) => !filterUIds.includes(geoItem.uId))
    return tempList
}

export const useDeleteRelatedGEOs = () => {
    return {
        deleteRelatedGEOs
    }
}

export const useGetGEOEachLevelCount = (geos: any) => {
    const [GEOEachLevelCount, setGEOEachLevelCount] = useState<any>({})
    useEffect(() => {
        if (geos.length) {
            setGEOEachLevelCount(_.countBy(geos, 'level'))
        }
    }, [geos])
    const { Market: marketCount = 0, Location: locationCount = 0, Territory: territoryCount = 0 } = GEOEachLevelCount

    return {
        marketCount,
        locationCount,
        territoryCount
    }
}

export const useGetKamWiredGroups = (isShowSelector: boolean) => {
    const [wiredGroupsList, setWiredGroupsList] = useState<any>([])
    useEffect(() => {
        if (isShowSelector) {
            const query = `SELECT KAM_Group_Name__c, COUNT(AccountId) customerNum FROM AccountTeamMember WHERE kam_active_flag__c = true AND If_Populated_By_KAM__c = true AND Account.IS_ACTIVE__c = true AND UserId = '${CommonParam.userId}' GROUP BY KAM_Group_Name__c`
            syncDownObj('AccountTeamMember', query, false)
                .then((data) => {
                    const list: any[] = data?.data
                        .map((item) => {
                            if (item?.KAM_Group_Name__c) {
                                return {
                                    GroupName: item?.KAM_Group_Name__c.toLocaleUpperCase(),
                                    CustomerNumber: item?.customerNum || 0
                                }
                            }
                            return ''
                        })
                        .filter(Boolean)

                    setWiredGroupsList(list)
                })
                .catch(async (err) => {
                    setWiredGroupsList([])
                    await storeClassLog(
                        Log.MOBILE_ERROR,
                        'useGetKamWiredGroups',
                        'Get KAM Wired Groups Data:' + getStringValue(err)
                    )
                })
        }
    }, [isShowSelector])

    return wiredGroupsList
}
