import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import { SoupService } from '../../../service/SoupService'
import { syncDownObj } from '../../../api/SyncUtils'
import { decryptWithString } from '../../../utils/Aes'
import { Persona } from '../../../../common/enums/Persona'
import _ from 'lodash'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

export interface IVisit {
    id: string // "0Z501000000aSIwCAM"
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Status__c: string // "Planned",
    payRateHourly: string
    payRateHourlyNumber: number
    forecastCost: number
    visitDuration: number
}

export const getAveragePayRate = async () => {
    const locationId = CommonParam.userLocationId
    const q = `
    SELECT 
        {User:BS_PAY_RT_AMT__c},
        {User:IsActive}
    FROM
        {User}
    Where
        {User:GM_LOC_ID__c} = '${locationId}'
        AND {User:PERSONA__c} = '${Persona.MERCHANDISER}'
        AND {User:IsActive} = true
    `
    try {
        const res = await SoupService.retrieveDataFromSoup('User', {}, ['hourlyPayRate', 'IsActive'], q)
        const arr = res.map((item) => {
            if (item.hourlyPayRate) {
                return _.toNumber(decryptWithString(item.hourlyPayRate))
            }
            return 0
        })

        if (_.isEmpty(arr)) {
            return 0
        }

        const averageHourPayRate = arr.reduce((a, b) => a + b) / arr.length
        return Math.round(averageHourPayRate * 100) / 100
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getAveragePayRate', error)
    }
}

// keep this function temporarily
export const getFixedVisitTimeObj = async (addedVisits = [], removedVisits = []) => {
    try {
        const visits = addedVisits.concat(removedVisits)
        if (visits.length === 0) {
            return
        }
        let cofs = visits.map((item) => {
            if (item.COF) {
                return `'${item.COF}'`
            }
            return null
        })
        cofs.push(`'${CommonParam.userLocationId}'`)
        cofs = cofs.filter((item) => !!item)
        cofs = _.uniq(cofs)
        const q = `
        SELECT
            TYPE__c,
            UNIT__c,
            VALUE_TYPE__c,
            VALUE__c,
            target_id__C
        FROM
            Targets_Forecasts__c
        WHERE
            VALUE_TYPE__c = 'fixedvisittime' 
            and target_id__C in (${cofs.join(',')})
        `
        const res = await syncDownObj('Targets_Forecasts__c', q, false)
        const fixedVisitTimeObj = {}
        res?.data?.forEach((item) => {
            let fixedVisitTime
            let value = item.VALUE__c
            if (isNaN(Number(value))) {
                value = 0
            } else {
                value = Math.round(Number(value))
            }
            if (item.UNIT__c === 'Minutes') {
                fixedVisitTime = value
            }
            if (item.UNIT__c === 'Hours') {
                fixedVisitTime = value * 60
            }
            fixedVisitTimeObj[item.TARGET_ID__c] = fixedVisitTime
        })
        return fixedVisitTimeObj
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getFixedVisitTimeObj', getStringValue(error))
    }
}

export const getHours = (minus: number) => {
    let num = Number(minus)
    if (!_.isNumber(num)) {
        return 0
    }
    num = Math.abs(num)
    return Math.round((num / 60) * 10) / 10
}

export const getAmount = (amount: number) => {
    let num = Number(amount)
    if (!_.isNumber(num)) {
        return 0
    }
    num = Math.abs(num)
    if (num < 1000) {
        return Math.round(num)
    }
    return Math.round(num / 1000) + 'K'
}

export const sumVisitMetric = (visits: IVisit[] = []) => {
    const count = visits?.length || 0
    let duration = 0
    let cost = 0
    visits.forEach((visit) => {
        duration += Number(visit.visitDuration)
        cost += visit.forecastCost
    })
    return {
        count,
        duration: getHours(duration),
        cost: Math.round(cost)
    }
}

export const groupAndSumVisitMetric = (visits: IVisit[] = []) => {
    const count = visits?.length || 0
    let duration = 0
    let cost = 0
    // group visit by date
    const groupedVisits = _.groupBy(visits, 'Planned_Date__c')
    const metricsPerDay = {}
    for (const day in groupedVisits) {
        metricsPerDay[day] = sumVisitMetric(groupedVisits[day])
    }
    Object.values(metricsPerDay).forEach((item: { duration: number; cost: number }) => {
        duration += item.duration * 10
        cost += item.cost
    })
    return {
        count,
        duration: duration / 10,
        cost: Math.round(cost)
    }
}
