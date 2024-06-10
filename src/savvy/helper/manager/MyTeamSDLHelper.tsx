import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import { checkNoWorkingDay } from '../../components/manager/helper/MerchManagerHelper'
import ScheduleQuery from '../../queries/ScheduleQuery'
import { UserType } from '../../redux/types/H01_Manager/data-userType'
import { SoupService } from '../../service/SoupService'
import { formatString, getRecordTypeIdByDeveloperName, isTrueInDB } from '../../utils/CommonUtils'
import { getWorkingStatus } from '../../utils/MerchManagerComputeUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isPersonaDelSup, isPersonaSDL, isPersonaUGM } from '../../../common/enums/Persona'
import { RecordTypeEnum } from '../../enums/RecordType'
import { getUnassignedRouteUserByDate } from '../../components/manager/helper/VisitHelper'
import { ScreenMapping } from '../../config/ScreenMapping'
import { syncDownDataByTableNames } from '../../utils/MerchManagerUtils'

export const merchLCodes = []
export const salesLCodes = []
export const deliveryLCodes = []
export const delSupOtherLCodes = []

// Call hierarchy: getUserData => getEmployeeData => employeeDataDropByTab

export const employeeDataGroupByTab = (params) => {
    const { users, setUserListGroupByTab, resolve, employeeTitle, setIsLoading, reject, routeUserInfo } = params
    const [merchUsers, salesUsers, deliveryUsers, otherUsers] = [[], [], [], [], []]
    try {
        users.forEach(async (item: any) => {
            if (merchLCodes.includes(item.lineCode)) {
                if (_.isEmpty(routeUserInfo?.find((routeUser) => routeUser.id === item.id))) {
                    merchUsers.push(item)
                }
            } else if (salesLCodes.includes(item.lineCode)) {
                salesUsers.push(item)
            } else if ((isPersonaUGM() || isPersonaDelSup()) && deliveryLCodes.includes(item.lineCode)) {
                item.userType = UserType.UserType_Delivery // used in myTeamCard for now
                deliveryUsers.push(item)
            } else if (!isPersonaDelSup() && item.lineCode) {
                otherUsers.push(item)
            } else if (delSupOtherLCodes.includes(item.lineCode)) {
                item.userType = UserType.UserType_Miscellaneous
                otherUsers.push(item)
            } else {
                otherUsers.push(item)
            }
        })
        const userObj = {}
        userObj[UserType.UserType_Merch] = [...routeUserInfo, ...merchUsers]
        userObj[UserType.UserType_Sales] = salesUsers
        userObj[UserType.UserType_Others] = otherUsers
        userObj[UserType.UserType_Delivery] = deliveryUsers
        if (isPersonaUGM()) {
            for (const usersTab in userObj) {
                if (usersTab !== UserType.UserType_Delivery) {
                    userObj[usersTab] = userObj[usersTab]?.filter(
                        (user) => isTrueInDB(user.isActive) || user?.unassignedRoute
                    )
                }
            }
        }
        if (setUserListGroupByTab) {
            setUserListGroupByTab(userObj)
        }
        resolve(userObj[employeeTitle])
    } catch (error) {
        setIsLoading(false)
        reject([])
    }
}

const reorganizationEmployeeData = async (result) => {
    const items = {}
    let index = -1

    result.forEach(async (user: any) => {
        if (!isPersonaUGM() && salesLCodes.includes(user.LC_ID__c) && _.isEmpty(user.TRouteSales_RTE_TERR_NM__c)) {
            // If the TRouteSales_RTE_TERR_NM__c field of sales is empty, delete the employee
            return
        }
        if (!items[user.UserId]) {
            index++
        }
        items[user.UserId] = {
            index,
            id: user.UserId,
            name: user.Username,
            persona: user.Persona,
            firstName: user.FirstName,
            lastName: user.LastName,
            title: user.Title,
            phone: user.MobilePhone,
            gpid: user.GPID,
            location: user.LocationName,
            ftFlag: user.FT_EMPLYE_FLG_VAL && user.FT_EMPLYE_FLG_VAL.toLocaleLowerCase(),
            startTime: user.Start_Time__c,
            startLocation: user.StartLocation,
            salesFunction: user.Sales_Function__c,
            photoUrl: user.SmallPhotoUrl,
            userStatsId: user.UserStatsId,
            workingStatus: getWorkingStatus(user),
            sdlWorkingStatus: getWorkingStatus(user),
            noWorkingDay: checkNoWorkingDay(user),
            salesRoute: user.TRouteSales_LOCL_RTE_ID__c || '-',
            localRoute: user.TRouteSales_LOCL_RTE_ID__c || '-',
            nationalId: user.TRouteSales_GTMU_RTE_ID__c || '-',
            terminateUser: !_.isEmpty(user.WRKFRC_EMPLYMT_TRMNTN_DT__c),
            lineCode: user.LC_ID__c || '',
            TRouteSales_RTE_TERR_NM__c: user.TRouteSales_RTE_TERR_NM__c,
            managerDirects: user.Manager_Directs__c || '',
            isMyDirect: user.Manager_Directs__c?.includes(CommonParam.userId),
            isActive: user.IsActive
        }

        if (!salesLCodes.includes(user.LC_ID__c)) {
            items[user.UserId].TRouteSales_RTE_TERR_NM__c = null
        }

        if (!merchLCodes.includes(user.LC_ID__c) && !salesLCodes.includes(user.LC_ID__c)) {
            // Delivery tab not show the following two short words
            items[user.UserId].startTime = null
            items[user.UserId].workingStatus = []
        }
    })
    return items
}

export const getPopUpData = async (geoData) => {
    const res = await AsyncStorage.getItem('SDLMyTeamData')
    const pacResultArr = []
    // Delete the item whose TRouteSales_RTE_TERR_NM__c is empty
    const geoDataTemp = _.cloneDeep(geoData).filter((item) => !!item.TRouteSales_RTE_TERR_NM__c)
    const groupData = _.groupBy(geoDataTemp, (item: any) => {
        if (item.TRouteSales_RTE_TERR_NM__c) {
            return item.TRouteSales_RTE_TERR_NM__c
        }
    })
    _.forEach(groupData, (val, keyStr) => {
        pacResultArr.push({
            name: keyStr,
            items: val,
            select: true
        })
    })

    if (res) {
        const storageArr = JSON.parse(res)
        CommonParam.pendingSync = storageArr
        pacResultArr.forEach((element) => {
            element.select = false
            storageArr.forEach((item) => {
                if (element.name === item.name) {
                    element.select = true
                }
            })
        })
    }

    return pacResultArr
}

export const getEmployeeData = async (params) => {
    const { employeeTitle, setIsLoading, dropDownRef, setUserListGroupByTab, setSubTypeArray, setSelectedSubType } =
        params

    const query = {
        f: ScheduleQuery.retrieveMyTeamSDLList[isPersonaDelSup() ? 'fDelSup' : 'f'],
        q: ScheduleQuery.retrieveMyTeamSDLList[isPersonaDelSup() ? 'qDelSup' : 'q']
    }
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            query.f,
            formatString(query.q, [CommonParam.userLocationId]) + ScheduleQuery.retrieveMyTeamSDLList.orderBy
        )
            .then(async (result: any) => {
                const items = await reorganizationEmployeeData(result)
                const users = Object.values(items)
                let routeUserInfo = []
                if (isPersonaUGM()) {
                    routeUserInfo = await getUnassignedRouteUserByDate('', true)
                }
                if (!_.isEmpty(users)) {
                    employeeDataGroupByTab({
                        users,
                        dropDownRef,
                        setUserListGroupByTab,
                        resolve,
                        employeeTitle,
                        setIsLoading,
                        reject,
                        setSubTypeArray,
                        setSelectedSubType,
                        routeUserInfo
                    })
                } else {
                    resolve([])
                }
            })
            .catch(() => {
                setIsLoading(false)
                reject([])
            })
    })
}

export const filterEmployeeBySearchText = ({ searchText, users, employeeOriginList }) => {
    const newList = users
    searchText = searchText.toUpperCase()

    if (!searchText) {
        return employeeOriginList
    }
    const filteredEmployees = []
    newList?.forEach((employee) => {
        const fullName = (employee.firstName + ' ' + employee.lastName)?.toUpperCase()
        if (fullName?.indexOf(searchText) >= 0) {
            filteredEmployees.push(employee)
        }
    })
    return filteredEmployees
}

export const filterWithSelectedSubType = (typeData) => {
    let filterData = []
    let hasSelectItem = false
    typeData.forEach((element) => {
        const cloneData = _.cloneDeep(filterData)
        if (element.select) {
            hasSelectItem = true
            filterData = [...cloneData, ...element.items]
        }
    })
    if (!hasSelectItem) {
        filterData = []
    }
    return filterData
}

export const filterWithSelectedSubTypeAndSearchText = (typeData, searchText) => {
    const filterWithSelectedSubTypeResult: any[] = filterWithSelectedSubType(typeData)
    return filterEmployeeBySearchText({
        searchText,
        users: filterWithSelectedSubTypeResult,
        employeeOriginList: filterWithSelectedSubTypeResult
    })
}

export const getUserData = async (params) => {
    const { dropDownRef, userType, setIsLoading, setUserListGroupByTab, setSubTypeArray, setSelectedSubType } = params
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Line_Code_Grouping_Definition__mdt',
            {},
            ScheduleQuery.getLineCodeQuery.f,
            ScheduleQuery.getLineCodeQuery.q
        ).then((res) => {
            res.forEach((item) => {
                const type = item.teamGroup
                const code = item.lineCode
                if (!code) {
                    return
                }
                switch (type) {
                    case UserType.UserType_Merch:
                        merchLCodes.push(code)
                        break
                    case UserType.UserType_Sales:
                        salesLCodes.push(code)
                        break
                    case UserType.UserType_Delivery:
                        deliveryLCodes.push(code)
                        break
                    case UserType.UserType_Miscellaneous:
                        delSupOtherLCodes.push(code)
                        break
                    default:
                        break
                }
            })
            getEmployeeData({
                employeeTitle: userType,
                setIsLoading,
                dropDownRef,
                setUserListGroupByTab,
                setSubTypeArray,
                setSelectedSubType
            })
                .then(async (users: Array<any>) => {
                    resolve(users)
                })
                .catch((err) => {
                    setIsLoading(false)
                    reject(err)
                })
        })
    })
}

export const getVisitRecordTypeId = async (accountId: string, allVisits: any) => {
    const recordTypeId = await getRecordTypeIdByDeveloperName(RecordTypeEnum.MERCHANDISING, 'Visit')
    const v = allVisits.find((val) => val.AccountId === accountId && val.RecordTypeId === recordTypeId)

    return v.RecordTypeId
}

export const syncVisitsAndCustomersTabLatestData = async (userType) => {
    if (
        (isPersonaUGM() || isPersonaSDL()) &&
        (userType === UserType.UserType_Sales || userType === UserType.UserType_Merch)
    ) {
        await syncDownDataByTableNames(ScreenMapping.SDLMyTeamVisit)
        if (userType === UserType.UserType_Sales) {
            await syncDownDataByTableNames(ScreenMapping.SDLMyCustomer)
        }
    }
}
