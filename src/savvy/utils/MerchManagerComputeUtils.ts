import moment from 'moment'
import { CommonParam } from '../../common/CommonParam'
import _ from 'lodash'
import { BooleanStr } from '../enums/Manager'
import { setLoggedInUserTimezone } from './TimeZoneUtils'
import { CommonLabel } from '../enums/CommonLabel'
import { t } from '../../common/i18n/t'
import { isTrueInDB } from './CommonUtils'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'

export const getTotalMinus = (durationTime: any, travelTime: any) => {
    durationTime = durationTime ? Number(durationTime) : 0
    travelTime = travelTime ? Number(travelTime) : 0
    return durationTime + travelTime
}

export const getTotalHours = (durationTime: any, travelTime: any) => {
    durationTime = durationTime ? Number(durationTime) : 0
    travelTime = travelTime ? Number(travelTime) : 0
    return Math.round(((durationTime + travelTime) / 60) * 10) / 10
}

export const getTotalTruncHours = (durationTime: any, travelTime: any) => {
    durationTime = durationTime ? Number(durationTime) : 0
    travelTime = travelTime ? Number(travelTime) : 0
    return Math.trunc((durationTime + travelTime) / 60)
}

export const getDurationTruncHours = (startTime: any, endTime?: any) => {
    if (!_.isEmpty(endTime)) {
        return Math.trunc(moment(endTime).diff(moment(startTime), 'm') / CommonLabel.SIXTY_MINUTE)
    }
    return Math.trunc(moment().diff(moment(startTime), 'm') / CommonLabel.SIXTY_MINUTE)
}

/**
 * @description Get i18n week name like ['SUN', 'MON', ..., 'SAT']
 * @returns weekLabel array
 */
export const getWeekLabel = () => {
    setLoggedInUserTimezone()
    const today = moment()
    const thisSunday = today.clone().day(0)
    const weekLabel = []
    for (let i = 0; i <= 6; i++) {
        const wl = thisSunday.clone().add(i, MOMENT_STARTOF.DAY).format('ddd').toUpperCase()
        weekLabel.push(wl)
    }
    return weekLabel
}

export const getWorkDayArr = () => {
    const weekLabel = getWeekLabel()

    const weekArr = [
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY, value: 'SUN', localeValue: weekLabel[0] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY, value: 'MON', localeValue: weekLabel[1] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY, value: 'TUE', localeValue: weekLabel[2] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY, value: 'WED', localeValue: weekLabel[3] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY, value: 'THU', localeValue: weekLabel[4] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY, value: 'FRI', localeValue: weekLabel[5] },
        { label: t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY, value: 'SAT', localeValue: weekLabel[6] }
    ]
    return weekArr
}

/*
 * @description get working day status form user stats
 * @returns arr [{ attend: true, label: 'S', name: 'SUN', i18nLabel: 'SUN' },...]
 */
export const getWorkingStatus = (userStats, alias = '') => {
    const trueVal = '1'
    const sun = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY
    const mon = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY
    const tue = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY
    const wed = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY
    const thu = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY
    const fri = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY
    const sat = t.labels.PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY
    const weekLabels = getWeekLabel()
    if (alias) {
        return [
            { attend: userStats[alias + '.Sunday__c'] === trueVal, label: sun, name: weekLabels[0] },
            { attend: userStats[alias + '.Monday__c'] === trueVal, label: mon, name: weekLabels[1] },
            { attend: userStats[alias + '.Tuesday__c'] === trueVal, label: tue, name: weekLabels[2] },
            { attend: userStats[alias + '.Wednesday__c'] === trueVal, label: wed, name: weekLabels[3] },
            { attend: userStats[alias + '.Thursday__c'] === trueVal, label: thu, name: weekLabels[4] },
            { attend: userStats[alias + '.Friday__c'] === trueVal, label: fri, name: weekLabels[5] },
            { attend: userStats[alias + '.Saturday__c'] === trueVal, label: sat, name: weekLabels[6] }
        ]
    }
    if (typeof userStats.Sunday__c === 'boolean') {
        return [
            { attend: userStats.Sunday__c, label: sun, name: weekLabels[0] },
            { attend: userStats.Monday__c, label: mon, name: weekLabels[1] },
            { attend: userStats.Tuesday__c, label: tue, name: weekLabels[2] },
            { attend: userStats.Wednesday__c, label: wed, name: weekLabels[3] },
            { attend: userStats.Thursday__c, label: thu, name: weekLabels[4] },
            { attend: userStats.Friday__c, label: fri, name: weekLabels[5] },
            { attend: userStats.Saturday__c, label: sat, name: weekLabels[6] }
        ]
    }
    return [
        { attend: userStats.Sunday__c === trueVal, label: sun, name: weekLabels[0] },
        { attend: userStats.Monday__c === trueVal, label: mon, name: weekLabels[1] },
        { attend: userStats.Tuesday__c === trueVal, label: tue, name: weekLabels[2] },
        { attend: userStats.Wednesday__c === trueVal, label: wed, name: weekLabels[3] },
        { attend: userStats.Thursday__c === trueVal, label: thu, name: weekLabels[4] },
        { attend: userStats.Friday__c === trueVal, label: fri, name: weekLabels[5] },
        { attend: userStats.Saturday__c === trueVal, label: sat, name: weekLabels[6] }
    ]
}

export const getOverworkStatus = (workingHour: number, DAILY_OVER_WORK_LIMIT_MINUTE: number) => {
    if (workingHour === 0) {
        return 'no_visit'
    } else if (workingHour >= DAILY_OVER_WORK_LIMIT_MINUTE) {
        return 'over'
    } else if (workingHour > 0 && workingHour < DAILY_OVER_WORK_LIMIT_MINUTE) {
        return 'normal'
    }
    return ''
}

/*
 * @description get Visit Detail Related data
 * @returns { id: true, visitId: '', ... }
 */
export const getVisitDetailRelated = (visit) => {
    return {
        id: visit?.UserId,
        visitId: visit?.Id,
        storeId: visit?.StoreId,
        name: visit?.Username,
        firstName: visit?.FirstName,
        lastName: visit?.LastName,
        title: visit?.Title,
        phone: visit?.MobilePhone,
        ftFlag: visit?.FT_EMPLYE_FLG_VAL__c && visit?.FT_EMPLYE_FLG_VAL__c?.toLocaleLowerCase(),
        startTime: visit?.Start_Time__c,
        workingStatus: getWorkingStatus(visit),
        userStatsId: visit?.UserStatsId,
        pullNum: visit?.Pull_Number__c,
        takeOrder: visit?.Take_Order_Flag__c,
        subtype: visit?.Visit_Subtype__c,
        plannedDate: visit?.Planned_Date__c,
        durationMinutes: visit?.Planned_Duration_Minutes__c || 0,
        insDescription: visit?.InstructionDescription
    }
}

export const computeSmartClause = (objName, fields) => {
    const whereClauseArr = []
    for (const key of Object.keys(fields)) {
        const value = fields[key]
        const clauseForSmartSql = {
            leftTable: objName,
            leftField: key,
            rightField: `'${value}'`,
            operator: '=',
            type: 'AND'
        }
        whereClauseArr.push(clauseForSmartSql)
    }
    return whereClauseArr
}

export const computeShipAddress = (shippingAddress) => {
    const city = shippingAddress?.city ? shippingAddress?.city + ', ' : ''
    const state = shippingAddress?.state ? shippingAddress?.state : ''
    const postalCode = shippingAddress?.postalCode ? ' ' + shippingAddress?.postalCode : ''
    return `${city}${state}${postalCode}`
}

export const computeStoreAddress = (addrsss) => {
    const city = addrsss?.City ? addrsss?.City + ', ' : ''
    const state = addrsss?.State ? addrsss?.State : ''
    const postalCode = addrsss?.PostalCode ? ' ' + addrsss?.PostalCode : ''
    return `${city}${state}${postalCode}`
}

export const computeVisitAddress = (visit) => {
    const city = visit?.City ? visit?.City + ', ' : ''
    const state = visit?.State ? visit?.State : ''
    const postalCode = visit?.PostalCode ? ' ' + visit?.PostalCode : ''
    return `${city}${state}${postalCode}`
}

export const computeVisitObj = (visit, tmpTotalMinus, tmpTotalHours) => {
    const shippingAddress = JSON.parse(visit.ShippingAddress)
    if (shippingAddress) {
        shippingAddress.street = shippingAddress?.street?.replace(/[\r\n]/g, ' ')
    }
    return {
        id: visit?.Id,
        dVisitListId: visit?.DVisitListId,
        wVisitListId: visit?.WVisitListId,
        date: visit?.Planned_Date__c,
        ownerId: visit?.OwnerId,
        visitor: visit?.VisitorId,
        status: visit?.Status__c,
        sales_visit__c: visit?.Sales_Visit__c,
        // sequence: visit?.Pull_Number__c,
        sequence: visit?.Sequence__c,
        mangerAdHoc: visit?.Manager_Ad_Hoc__c === '1',
        totalDuration: Number(visit?.Planned_Duration_Minutes__c) || 0,
        totalMinus: tmpTotalMinus,
        totalHours: tmpTotalHours,
        travelTime: Number(visit?.Planned_Travel_Time__c) || 0,
        totalCases: Number(visit?.Scheduled_Case_Quantity__c) || 0,
        totalMiles: Number(visit?.Planned_Mileage__c) || 0,
        pullNum: parseInt(visit?.Pull_Number__c) || 0,
        subtype: visit?.Visit_Subtype__c,
        takeOrder: visit?.Take_Order_Flag__c,
        dfFlag: visit?.Dynamic_Frequency_Add__c,
        store: {
            id: visit?.StoreId,
            name: visit.AccountName,
            address: shippingAddress?.street || '',
            cityStateZip: computeShipAddress(shippingAddress),
            phone: visit?.AccountPhone,
            latitude: JSON.parse(visit?.Store_Location__c)?.latitude,
            longitude: JSON.parse(visit?.Store_Location__c)?.longitude,
            storeLocation: visit?.Store_Location__c,
            shippingAddress
        }
    }
}

export const computeEmployeeItem = (
    visit,
    tmpTotalMinus,
    tmpTotalHours,
    weekName,
    visitObj,
    DAILY_OVER_WORK_LIMIT_MINUTE
) => {
    return {
        id: visit?.UserId,
        userStatsId: visit?.UserStatsId,
        name: visit?.Username,
        totalVisit: 1,
        visitor: visit?.UserId,
        firstName: visit?.FirstName,
        lastName: visit?.LastName,
        title: visit?.Title,
        ftFlag: visit?.FT_EMPLYE_FLG_VAL__c?.toLocaleLowerCase(),
        gpid: visit?.GPID,
        sales_visit__c: visitObj.sales_visit__c === '1',
        LC_ID__c: visit?.LC_ID__c,
        totalDuration: Number(visit?.Planned_Duration_Minutes__c) || 0,
        totalMinus: Math.round(tmpTotalMinus),
        totalHours: tmpTotalHours,
        travelTime: Number(visit?.Planned_Travel_Time__c) || 0,
        totalCases: Number(visit?.Scheduled_Case_Quantity__c) || 0,
        totalMiles: Number(visit?.Planned_Mileage__c) || 0,
        weeklyVisitList: {
            id: visit.WVisitListId,
            startDate: visit.WStart_Date__c,
            endDate: visit.WEnd_Date__c
        },
        dailyVisitList: {
            [visit.DVisitListId]: {
                id: visit.DVisitListId,
                date: visit.DVisit_Date__c,
                updated: false,
                weeklyVisitId: visit.DVisit_List_Group__c,
                totalDuration: Number(visit?.Total_Planned_Time__c) || 0,
                totalTravelTime: Number(visit?.DPlanned_Travel_Time__c) || 0
            }
        },
        visits: {
            [weekName]: [visitObj]
        },
        workingStatus: getWorkingStatus(visit),
        overwork: {
            [weekName]: {
                totalPlannedTime: tmpTotalMinus,
                owStatus: getOverworkStatus(tmpTotalMinus, DAILY_OVER_WORK_LIMIT_MINUTE)
            }
        },
        unassignedRoute: !_.isEmpty(visit.Route_Group__c),
        dfVisitNum: isTrueInDB(visit?.Dynamic_Frequency_Add__c) ? 1 : 0
    }
}

export const computeDaily = (visit) => {
    return {
        id: visit.DVisitListId,
        date: visit.DVisit_Date__c,
        updated: false,
        weeklyVisitId: visit.DVisit_List_Group__c,
        totalDuration: Number(visit?.Total_Planned_Time__c) || 0,
        totalTravelTime: Number(visit?.DPlanned_Travel_Time__c) || 0
    }
}

export const computeEmployeeList = (result) => {
    const DAILY_OVER_WORK_LIMIT_MINUTE = CommonParam.dailyHourThreshold * 60
    const weekLabel = getWeekLabel()
    const items = {}
    result.forEach((visit: any) => {
        if (visit.Route_Group__c) {
            visit.UserId = visit.Route_Group__c
        }
        const weekName = weekLabel[moment(visit?.Planned_Date__c).weekday()]
        if (
            (moment(visit?.Planned_Date__c).isSameOrBefore(moment(), MOMENT_STARTOF.DAY) &&
                visit?.Manager_Ad_Hoc__c === BooleanStr.STR_TRUE) ||
            moment(visit?.Planned_Date__c).isBefore(moment(), MOMENT_STARTOF.DAY)
        ) {
            return
        }
        const tmpTotalMinus = getTotalMinus(visit?.Planned_Duration_Minutes__c, visit?.Planned_Travel_Time__c)
        const tmpTotalHours = getTotalHours(visit?.Planned_Duration_Minutes__c, visit?.Planned_Travel_Time__c)
        const visitObj = computeVisitObj(visit, tmpTotalMinus, tmpTotalHours)
        if (!items[visit?.UserId]) {
            items[visit?.UserId] = computeEmployeeItem(
                visit,
                tmpTotalMinus,
                tmpTotalHours,
                weekName,
                visitObj,
                DAILY_OVER_WORK_LIMIT_MINUTE
            )
        } else {
            // user exist
            items[visit.UserId].totalVisit++
            items[visit.UserId].totalMinus += tmpTotalMinus
            items[visit.UserId].totalHours = Math.round((items[visit.UserId].totalMinus / 60) * 10) / 10
            items[visit.UserId].totalCases += Number(visit?.Scheduled_Case_Quantity__c) || 0
            items[visit.UserId].totalMiles += Number(visit?.Planned_Mileage__c) || 0
            items[visit.UserId].totalDuration += Number(visit?.Planned_Duration_Minutes__c) || 0
            items[visit.UserId].travelTime += Number(visit?.Planned_Travel_Time__c) || 0
            items[visit.UserId].dfVisitNum = isTrueInDB(visit?.Dynamic_Frequency_Add__c)
                ? ++items[visit.UserId].dfVisitNum
                : items[visit.UserId].dfVisitNum
            // Add Daily List
            if (!items[visit.UserId].dailyVisitList[visit.DVisitListId]) {
                items[visit.UserId].dailyVisitList[visit.DVisitListId] = computeDaily(visit)
            }

            // Push Visit to the List
            if (items[visit.UserId].visits[weekName]) {
                items[visit.UserId].visits[weekName].push(visitObj)
            } else {
                items[visit.UserId].visits[weekName] = [visitObj]
            }
            if (items[visit.UserId].overwork[weekName]) {
                items[visit.UserId].overwork[weekName].totalPlannedTime += tmpTotalMinus
                items[visit.UserId].overwork[weekName].owStatus = getOverworkStatus(
                    items[visit.UserId].overwork[weekName].totalPlannedTime,
                    DAILY_OVER_WORK_LIMIT_MINUTE
                )
            } else {
                items[visit.UserId].overwork[weekName] = {
                    totalPlannedTime: tmpTotalMinus,
                    owStatus: getOverworkStatus(tmpTotalMinus, DAILY_OVER_WORK_LIMIT_MINUTE)
                }
            }
            for (const key in items[visit.UserId].visits) {
                if (Object.prototype.hasOwnProperty.call(items[visit.UserId].visits, key)) {
                    items[visit.UserId].visits[key] &&
                        items[visit.UserId].visits[key].forEach((t) => {
                            if (t.sales_visit__c === '0') {
                                items[visit.UserId].sales_visit__c = false
                            }
                        })
                }
            }
        }
    })
    return items
}
export const unionMListAndUser = (mAttObj, userData) => {
    const mAttIds = Object.keys(mAttObj)
    const mAttList = Object.values(mAttObj)

    if (!userData && !mAttIds?.length) {
        return []
    }
    if (!mAttIds.length) {
        return userData
    }
    const weekLabel = getWeekLabel()
    mAttList.forEach((user: any) => {
        weekLabel.forEach((label: any) => {
            if (!user.overwork[label]) {
                user.overwork[label] = { owStatus: 'no_visit' }
            }
            return user.overwork[label]
        })
        return user
    })
    if (!userData) {
        return mAttList
    }
    const DAILY_OVER_WORK_LIMIT_MINUTE = CommonParam.dailyHourThreshold * 60
    mAttIds.forEach((userId) => {
        const userList = userData.filter((user: any) => user?.id === userId)
        if (userList.length) {
            userList[0].totalMinus += mAttObj[userId].totMTime
            userList[0].totalHours = getTotalHours(userList[0].totalMinus, 0)
            const owWeekMNames = Object.keys(mAttObj[userId].dayMeetingTime)
            owWeekMNames.forEach((weekName) => {
                const dayOverWork = userList[0].overwork[weekName]
                const oldTotPlanTime = dayOverWork.totalPlannedTime || 0
                dayOverWork.totalPlannedTime = oldTotPlanTime + mAttObj[userId].dayMeetingTime[weekName]
                dayOverWork.owStatus = getOverworkStatus(dayOverWork.totalPlannedTime, DAILY_OVER_WORK_LIMIT_MINUTE)
            })
        }
    })

    const newList = _.concat(userData, mAttList)

    return _.unionWith(newList, (a: any, b: any) => a.id === b.id)
}
