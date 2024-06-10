import { CommonParam } from '../../../../common/CommonParam'
import { SoupService } from '../../../service/SoupService'
import _ from 'lodash'
import { filterExistFields } from '../../../utils/SyncUtils'
import { getObjByName, restDataCommonCall, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { Persona } from '../../../../common/enums/Persona'
import { createUserStats } from './FavoriteEmployeeHelper'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface MerchManagerItem {
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    GM_LOC_ID__c: string
    Id: string
    LastName: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    PERSONA__c: string
    teamMembersId: string[]
}

export interface SelectTeamOption {
    isChecked: boolean
    text: string
    mmId: string
}

const getSameLocationManager = (
    persona: Persona.MERCH_MANAGER | Persona.DELIVERY_SUPERVISOR
): Promise<MerchManagerItem[]> => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['Id', 'LastName', 'PERSONA__c', 'GM_LOC_ID__c'],
            `
            SELECT
                {User:Id}, 
                {User:LastName}, 
                {User:PERSONA__c},
                {User:GM_LOC_ID__c}
            FROM {User}
            WHERE {User:GM_LOC_ID__c} = '${CommonParam.userLocationId}'
            AND {User:PERSONA__c} LIKE '%${persona}%'
            AND {User:IsActive} IS TRUE
            `
        )
            .then((result) => {
                resolve(result)
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'getSameLocationManager', getStringValue(e))
                reject([])
            })
    })
}

export const getSameLocationManagerTeamMember = async (
    selectTeamOptions: SelectTeamOption[],
    setSelectTeamOptions,
    persona: Persona.MERCH_MANAGER | Persona.DELIVERY_SUPERVISOR
) => {
    const merchManagers = await getSameLocationManager(persona)
    const mmObj = {}
    merchManagers.forEach((mm) => {
        mmObj[mm.Id] = mm
    })

    const mmArr = Object.values(mmObj) as MerchManagerItem[]
    const lastSelectTeamOptObj = {}
    const isEmpty = _.isEmpty(selectTeamOptions)
    !isEmpty &&
        selectTeamOptions.forEach((option) => {
            lastSelectTeamOptObj[option.mmId] = option
        })
    let myDirectOptIndex = -1
    let options = mmArr.map((mm, index) => {
        const isMe = mm.Id === CommonParam.userId
        if (isMe) {
            myDirectOptIndex = index
        }
        return {
            text: isMe ? t.labels.PBNA_MOBILE_MY_DIRECTS : `${t.labels.PBNA_MOBILE_TEAM} ${mm.LastName}`,
            mmId: mm.Id,
            isChecked: isEmpty ? true : lastSelectTeamOptObj[mm.Id]?.isChecked
        }
    })
    if (myDirectOptIndex > -1) {
        const myDirectOpt = JSON.parse(JSON.stringify(options[myDirectOptIndex]))
        options = options.slice(0, myDirectOptIndex).concat(options.slice(myDirectOptIndex + 1, options.length))
        options.unshift(myDirectOpt)
    } else {
        options.unshift({
            text: t.labels.PBNA_MOBILE_MY_DIRECTS,
            mmId: CommonParam.userId,
            isChecked: true
        })
    }
    options.push({
        text: `${t.labels.PBNA_MOBILE_TEAM} ${_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)}`,
        mmId: 'Team Unassigned',
        isChecked: isEmpty ? true : lastSelectTeamOptObj['Team Unassigned']?.isChecked
    })
    const allOptChecked = options.every((opt) => {
        return opt.isChecked
    })
    options.unshift({
        text: t.labels.PBNA_MOBILE_ALL_EMPLOYEES.toLocaleUpperCase(),
        mmId: 'All Employees',
        isChecked: isEmpty || allOptChecked ? true : lastSelectTeamOptObj['ALL Employees']?.isChecked
    })
    setSelectTeamOptions(options)
    return options
}

export const handleDirectEmployee = async (item, employeeList, setEmployeeList, setIsLoading, isRemoveDirect?) => {
    try {
        let userStatsId = item?.userStatsId
        if (_.isEmpty(userStatsId)) {
            userStatsId = await createUserStats(item)
        }
        const query = 'SELECT Id, Manager_Directs__c FROM User_Stats__c' + ` WHERE Id = '${userStatsId}'`
        const path = `query/?q=${query}`
        const res = await restDataCommonCall(path, 'GET')
        const latestData = res?.data?.records
        const userStats = await SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            getObjByName('User_Stats__c').syncUpCreateFields,
            getObjByName('User_Stats__c').syncUpCreateQuery + ` WHERE {User_Stats__c:Id} = '${userStatsId}'`
        )
        if (isRemoveDirect) {
            const managerIds = latestData[0].Manager_Directs__c?.split(',') || []
            managerIds.splice(managerIds.indexOf(CommonParam.userId), 1)
            userStats[0].Manager_Directs__c = managerIds.length > 0 ? managerIds.join(',') : ''
        } else {
            if (_.isEmpty(latestData[0].Manager_Directs__c)) {
                userStats[0].Manager_Directs__c = CommonParam.userId
            } else {
                if (!latestData[0].Manager_Directs__c.includes(CommonParam.userId)) {
                    latestData[0].Manager_Directs__c += ',' + CommonParam.userId
                    userStats[0].Manager_Directs__c = latestData[0].Manager_Directs__c
                }
            }
        }

        await SoupService.upsertDataIntoSoup('User_Stats__c', userStats)
        await syncUpObjUpdateFromMem(
            'User_Stats__c',
            filterExistFields('User_Stats__c', [...userStats], getObjByName('User_Stats__c').syncUpCreateFields)
        )
        employeeList.forEach((employee) => {
            if (employee.id === item.id) {
                employee.isFavorited = !isRemoveDirect
            }
        })
        setEmployeeList && setEmployeeList(_.cloneDeep(employeeList))
    } catch (e) {
        setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, handleDirectEmployee.name, getStringValue(e))
    }
}
