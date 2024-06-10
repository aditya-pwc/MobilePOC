import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Mailer from 'react-native-mail'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { getIdClause } from '../helper/MerchManagerHelper'
import { syncDownObj } from '../../../api/SyncUtils'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import { DateType } from './ExportSchedule'
import { formatPhoneNumber } from '../../../utils/MerchManagerUtils'
import _ from 'lodash'
import { getVisitSubtypes } from '../helper/VisitHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const htmlStyles = `
body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    margin:0
}

h1 {
    font: bold 100% sans-serif;
    text-transform: uppercase;
    color: #00A2D9
}

h2 {
    color: #00A2D9
}

table {
    border: 1px solid #000000;
    border-collapse: collapse;
    border-spacing: 0
}

td, th {
    border: 1px solid #000000;
    padding: 5px 3px;
    font-size: 12px;
    max-width:200px;
    word-break: break-word;
    white-space: normal;
}
p {
    margin: 0
}

.label-cell {
    background-color: #777;
    color: #fff;
    font-weight: 800;
}

.align-center {
    text-align: center;
}

main {
    max-width: 1200px;
    width:1000px;
    box-sizing: border-box;
    padding:40px;
    margin: 0 auto;
    position:relative;
}

.metrics {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
.metrics table {
    flex-grow: 1;
}
.margin-right{
    margin-right: 20px;
}
.margin-left{
    margin-left: 20px;
}
.weight{
    font-weight: 800;
}
.no-padding {
    padding: 0
}
.no-border-left {
    border-left-width: 0;
}
.no-border-top {
    border-top-width: 0;
}
.no-border-right {
    border-right-width: 0;
}
.no-border-bottom {
    border-bottom-width: 0;
}
`
interface SchedulePdfParam {
    data: any
    date: any
    dateType: DateType
    weekDates: any[]
    selectedWeekStr: string
}

interface VisitItem {
    retailStore: string
    plannedDurationMinutes: number
    sequence: number
}
interface VisitListItem {
    Id: string
    Name: string
    Owner: {
        Name: string
        Id: string
    }
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Visit_Date__c: string // '2022-08-05'
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Total_Planned_Time__c: number
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Planned_Travel_Time__c: number
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Planned_Meeting_Time__c: number
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Visits__r: {
        totalSize: number
        records: Array<{
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Retail_Store__r: {
                Name: string
            }
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Planned_Duration_Minutes__c: number
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            sequence__c: number
        }>
    }
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    GM_LOC_ID__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    SLS_UNIT_NM__c: string // Merchandiser's Location
}
interface DataPerDay {
    [day: string]: {
        plannedMinutes: number
        meetingMinutes: number
        travelMinutes: number
        visitCount: number
        visits: Array<VisitItem>
    }
}

class WeeklyScheduleDataModel {
    maxVisitCount: number
    dataPerDay: DataPerDay
    merchName: string
    merchLocation: string
    summaryTotalVisitCount: number
    summaryTotalMinutes: number

    constructor(arrayVisitList: Array<VisitListItem>) {
        this.merchName = arrayVisitList[0].Owner.Name
        this.merchLocation = arrayVisitList[0].SLS_UNIT_NM__c
        this.dataPerDay = {}
        arrayVisitList.forEach((visitList) => {
            this.addDataPerDay(visitList)
        })
        const arrayVisitCount: number[] = Object.values(this.dataPerDay)
            .map((item) => item.visitCount)
            .sort((a, b) => b - a)
        this.maxVisitCount = arrayVisitCount[0] || 0

        this.summaryTotalVisitCount = 0
        this.summaryTotalMinutes = 0
        Object.values(this.dataPerDay).forEach((item) => {
            this.summaryTotalVisitCount += item.visitCount
            this.summaryTotalMinutes += item.plannedMinutes
        })
    }

    addDataPerDay(item: VisitListItem) {
        const day = formatWithTimeZone(item.Visit_Date__c, TIME_FORMAT.DDDD, true).toLocaleLowerCase()
        if (this.dataPerDay[day]) {
            //  the same employee has multiple visit list records on the same day
            this.dataPerDay[day].plannedMinutes += _.isNumber(item.Total_Planned_Time__c)
                ? item.Total_Planned_Time__c
                : 0
            this.dataPerDay[day].meetingMinutes += _.isNumber(item.Planned_Meeting_Time__c)
                ? item.Planned_Meeting_Time__c
                : 0
            this.dataPerDay[day].travelMinutes += _.isNumber(item.Planned_Travel_Time__c)
                ? item.Planned_Travel_Time__c
                : 0
            if (item.Visits__r && _.isArray(item.Visits__r.records)) {
                item.Visits__r.records.forEach((record) => {
                    this.dataPerDay[day].visits.push({
                        retailStore: record.Retail_Store__r.Name,
                        plannedDurationMinutes: record.Planned_Duration_Minutes__c,
                        sequence: record.sequence__c
                    })
                })
                // all visits are ordered by sequence
                this.dataPerDay[day].visits.sort((a, b) => {
                    const sequenceA = _.isNumber(a.sequence) ? a.sequence : -Infinity
                    const sequenceB = _.isNumber(b.sequence) ? b.sequence : -Infinity
                    return sequenceA - sequenceB
                })

                this.dataPerDay[day].visitCount += _.isNumber(item?.Visits__r?.totalSize)
                    ? item?.Visits__r?.totalSize
                    : 0
            }
        } else {
            this.dataPerDay[day] = {
                plannedMinutes: item.Total_Planned_Time__c || 0,
                meetingMinutes: item.Planned_Meeting_Time__c || 0,
                travelMinutes: item.Planned_Travel_Time__c || 0,
                visitCount: item?.Visits__r?.totalSize || 0,
                visits: []
            }
            if (item.Visits__r && !_.isEmpty(item.Visits__r.records)) {
                this.dataPerDay[day].visits = item.Visits__r.records.map((record) => {
                    return {
                        retailStore: record.Retail_Store__r.Name,
                        plannedDurationMinutes: record.Planned_Duration_Minutes__c,
                        sequence: record.sequence__c
                    }
                })
            }
        }
    }
}

export interface MailResponse {
    event: any
    error: any
}
const transferMinutes = (mins) => {
    if (!mins) {
        return '0'
    }
    const hr = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (hr) {
        return `${hr} ${t.labels.PBNA_MOBILE_HR} ${m} ${t.labels.PBNA_MOBILE_MIN}`
    }
    return `${m} ${t.labels.PBNA_MOBILE_MIN}`
}

const capitalized = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const getUserLocationId = async (data) => {
    const employeeIds = data.map((schedule) => {
        return schedule.employee.id
    })
    const ids: string[] = Array.from(new Set(employeeIds))
    try {
        const q = `
        SELECT
            Id,
            GM_LOC_ID__c,
            Email
        FROM
            User
        WHERE
            Id IN (${getIdClause(ids)})
        `
        const res = await syncDownObj('Visit_list__c', q, false)
        const result = res?.data || []
        result.forEach((item) => {
            for (const schedule of data) {
                if (schedule?.employee?.id === item.Id) {
                    schedule.GM_LOC_ID__c = item.GM_LOC_ID__c
                    schedule.Email = item.Email
                }
            }
        })
        const gmLocIds: string[] = result.map((item) => {
            return item.GM_LOC_ID__c
        })
        return {
            gmLocIds: Array.from(new Set(gmLocIds)),
            employeeIds: ids
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'SchedulePdfHelper.getUserLocationId', getStringValue(error))
        return { gmLocIds: [], employeIds: [] }
    }
}

const getSaleLocationName = async (data, gmLocIds: string[]) => {
    try {
        const q = `
        SELECT
            SLS_UNIT_NM__c,
            SLS_UNIT_ID__c
        FROM
            Route_Sales_Geo__c
        WHERE
            SLS_UNIT_ID__c IN (${getIdClause(gmLocIds)})
        `
        const res = await syncDownObj('Visit_list__c', q, false)
        const result = res?.data || []
        result.forEach((item) => {
            for (const schedule of data) {
                if (schedule.GM_LOC_ID__c === item.SLS_UNIT_ID__c) {
                    schedule.SLS_UNIT_NM__c = item.SLS_UNIT_NM__c
                }
            }
        })
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'SchedulePdfHelper.getSaleLocationName', getStringValue(error))
        return []
    }
}

const transformData = (data): Array<WeeklyScheduleDataModel> => {
    const employeeMap = {}
    data.forEach((item) => {
        if (employeeMap[item.Owner.Id]) {
            employeeMap[item.Owner.Id].push(item)
        } else {
            employeeMap[item.Owner.Id] = [item]
        }
    })

    return Object.values(employeeMap).map((employeeSchedules: VisitListItem[]) => {
        return new WeeklyScheduleDataModel(employeeSchedules)
    })
}
const getSubtypeI18n = (subtype: string) => {
    const visitSubtypes = getVisitSubtypes()
    const subtypeMap = {}
    visitSubtypes.forEach((item) => {
        subtypeMap[item.id] = item.name
    })
    return subtype
        .split(';')
        .map((item) => {
            return subtypeMap[item] || item
        })
        .join(';')
}
const getHtmlContent = (data, date, dateType: DateType, weekDates: any[]) => {
    const PAGE_HEIGHT_PX = 743
    let result = ''

    if (dateType === DateType.FullDay) {
        // render header
        result += `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                ${htmlStyles}
            </style>
        </head>
        
        <body>
        `

        for (const schedule of data) {
            // render main
            result += `
            <main>
                <h3 class="align-center">${t.labels.PBNA_MOBILE_MERCHANDISER_DAILY_SCHEDULE}</h3>
                <div class="align-center">${formatWithTimeZone(date, TIME_FORMAT.Y_MM_DD, true)}</div>
                <div class="align-center">${schedule.employee.name} ${
                schedule.SLS_UNIT_NM__c ? ' - ' + schedule.SLS_UNIT_NM__c : ''
            }</div>
                <div class="metrics">
                    <table class="margin-right" style="margin-left:58px; width:30%">
                        <tr>
                            <td align="center" class="label-cell">${t.labels.PBNA_MOBILE_HOURS}</td>
                            <td align="center">${transferMinutes(schedule.Total_Planned_Time__c)}</td>
                        </tr>
                    </table>
                    <table class="margin-right" style="width:30%">
                        <tr>
                            <td align="center" class="label-cell">${t.labels.PBNA_MOBILE_DRIVE_TIME}</td>
                            <td align="center">${transferMinutes(schedule.Planned_Travel_Time__c)}</td>
                        </tr>
                    </table>
                    <table style="width:%33">
                        <tr>
                            <td align="center" class="label-cell">${t.labels.PBNA_MOBILE_MEETING_TIME}</td>
                            <td align="center">${transferMinutes(schedule.Planned_Meeting_Time__c)}</td>
                        </tr>
                    </table>
                </div>
            `

            const visits = schedule.Visits__r
            if (visits) {
                result += `
                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="label-cell" align="center" style="width: 50px;">${t.labels.PBNA_MOBILE_SHORT_FOR_SEQUENCE} #</td>
                        <td class="label-cell" align="center">${t.labels.PBNA_MOBILE_VISITS}</td>
                        <td class="label-cell" align="center">${t.labels.PBNA_MOBILE_SALES_REPRESENTATIVE_INLINE}</td>
                        <td class="label-cell" align="center">${t.labels.PBNA_MOBILE_WORK_SCHEDULE}</td>
                    </tr>
                    <tbody>
                `
                for (let j = 0; j < visits.records.length; j++) {
                    const visit = visits.records[j]
                    const retailStore = visit.Retail_Store__r
                    const account = retailStore?.Account || {}
                    const saleRep = account?.Sales_Rep__r || {}
                    const saleRoute = account?.Sales_Route__r || {}
                    // render table row
                    result += `
                    <tr>
                        <td align="center">${j + 1}</td>
                            <td>
                                <p>${retailStore.Name || ''}</p>
                                <p>${retailStore.Street || ''}</p>
                                <p>${retailStore.City || ''}${retailStore.City ? ',' : ''} ${
                        retailStore.StateCode || ''
                    }</p>
                                <P>${account.Phone ? formatPhoneNumber(account.Phone) : ''}</P>
                            </td>
                            <td>
                                <p>${saleRep.Name || ''}</p>
                                <p>${saleRep.MobilePhone ? formatPhoneNumber(saleRep.MobilePhone) : ''}</p>
                                <p>${
                                    saleRoute.LOCL_RTE_ID__c
                                        ? t.labels.PBNA_MOBILE_ROUTE + ' #' + saleRoute.LOCL_RTE_ID__c
                                        : ''
                                }</p>
                            </td>
                            <td valign="top" class="no-padding">
                                <table style="width: 100%;border: none">
                                    <tr>
                                        <td align="center" class="no-border-top no-border-left label-cell" width="50%">${
                                            t.labels.PBNA_MOBILE_HOURS
                                        }</td>
                                        <td align="center" class="no-border-top no-border-right label-cell" width="50%">${
                                            t.labels.PBNA_MOBILE_VISIT_SUBTYPE
                                        }</td>
                                    </tr>
                                    <tr>
                                        <td align="center" class="no-border-left">${transferMinutes(
                                            visit.Planned_Duration_Minutes__c
                                        )}</td>
                                        <td align="center" class="no-border-right">${getSubtypeI18n(
                                            visit.Visit_Subtype__c
                                        )}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" class="no-border-bottom no-border-left no-border-right">
                                            <span class="weight">${
                                                t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS
                                            }: </span> ${
                        visit.InstructionDescription ? visit.InstructionDescription : ''
                    }
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    `
                }
                result += `
                </tbody>
                </table>
                `
            } else {
                result += `<p style="margin-left:50px">${t.labels.PBNA_MOBILE_NO_VISITS_BEEN_SCHEDULED}</p>`
            }
            result += `
            </main>
            `
        }

        // render footer
        result += `
            <script>
                const pages = document.querySelectorAll('main')
                pages.forEach((page,index) => {
                    const elementHeight = page.clientHeight                  
                    const h = Math.ceil(elementHeight / ${PAGE_HEIGHT_PX}) * ${PAGE_HEIGHT_PX}
                    page.style.height = h + 'px'
                })
            </script>
            </body>
        </html>
    `
    }

    if (dateType === DateType.FullWeek) {
        const schedules = transformData(data)
        const weekDays = [
            t.labels.PBNA_MOBILE_SUNDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_MONDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_TUESDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_WEDNESDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_THURSDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_FRIDAY.toLocaleLowerCase(),
            t.labels.PBNA_MOBILE_SATURDAY.toLocaleLowerCase()
        ]
        const weekStartDay = formatWithTimeZone(weekDates[0], TIME_FORMAT.Y_MM_DD, true)
        // render header
        result += `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                ${htmlStyles}
            </style>
        </head>
        <body>
        `

        schedules.forEach((schedule, index) => {
            result += `
                <main id='schedule-${index}'>
                <h3 class="align-center">${t.labels.PBNA_MOBILE_MERCHANDISER_WEEKLY_SCHEDULE}</h3>
                <div class="align-center">${t.labels.PBNA_MOBILE_WEEK.toLocaleUpperCase()} ${weekStartDay}</div>
                <div class="align-center">${schedule.merchName}${
                schedule.merchLocation ? ' - ' + schedule.merchLocation : ''
            }</div>
                <div class="metrics">
                    <table style="margin-left:30px">
                        <tr>
                            <td class="label-cell aligh-center" align="center">${t.labels.PBNA_MOBILE_TOTAL_VISIT}</td>
                            <td>${schedule.summaryTotalVisitCount}</td>
                        </tr>
                    </table>
                    <table style="margin-left:30px">
                        <tr>
                            <td class="label-cell aligh-center" align="center">${t.labels.PBNA_MOBILE_TOTAL_HOURS}</td>
                            <td>${transferMinutes(schedule.summaryTotalMinutes)}</td>
                        </tr>
                    </table>
                </div>
                <table style="border:none; width: 100%">
                    <tr>
                        <th></th>
            `
            // render table-header
            for (const day of weekDays) {
                result += `
                <th class="label-cell">${day}</th>
                `
            }
            result += '</tr>'

            // render visits
            for (let visitIndex = 0; visitIndex < schedule.maxVisitCount; visitIndex++) {
                result += `
                <tr>
                    <th  class="label-cell">${t.labels.PBNA_MOBILE_VISITS}</th>
                `
                for (const weekDay of weekDays) {
                    const visits = schedule?.dataPerDay[weekDay]?.visits || []
                    const visit = visits[visitIndex]
                    const retailStoreName = _.isEmpty(visit) ? '' : visit.retailStore
                    result += `
                    <td>${retailStoreName}</td>
                    `
                }
                result += `
                </tr>
                <tr>
                    <th class="label-cell">${t.labels.PBNA_MOBILE_HOURS}</th>
                `
                for (const weekDay of weekDays) {
                    const visits = schedule?.dataPerDay[weekDay]?.visits || []
                    const visit = visits[visitIndex]
                    const plannedHours = _.isEmpty(visit) ? '' : transferMinutes(visit.plannedDurationMinutes)
                    result += `
                    <td>${plannedHours}</td>
                    `
                }
                result += `
                </tr>
                <tr>
                    <td style="height: 20px;border: none"></td>
                </tr>
                `
            }

            result += `
            <tr>
                <th class="label-cell">${t.labels.PBNA_MOBILE_MEETING_TIME}</th>
            `
            for (const day of weekDays) {
                let text = ''
                if (schedule?.dataPerDay[day]) {
                    const meetingMinutes = schedule?.dataPerDay[day]?.meetingMinutes || null
                    text = transferMinutes(meetingMinutes)
                }
                result += `
                <td>${text}</td>
                `
            }
            result += `
            </tr>
            <tr>
                <th class="label-cell">${t.labels.PBNA_MOBILE_DRIVE_TIME}</th>
            `
            for (const day of weekDays) {
                let text = ''
                if (schedule?.dataPerDay[day]) {
                    const driveTime = schedule?.dataPerDay[day]?.travelMinutes || null
                    text = transferMinutes(driveTime)
                }
                result += `
                <td>${text}</td>
                `
            }
            result += `
            </tr>
            <tr><td style="height: 20px;border: none"></td></tr>
            <tr>
            <th class="label-cell">${t.labels.PBNA_MOBILE_TOTAL_VISIT}</th>
            `
            for (const day of weekDays) {
                let text: any = ''
                if (schedule?.dataPerDay[day]) {
                    text = schedule?.dataPerDay[day]?.visitCount || '0'
                }
                result += `
                <td>${text}</td>
                `
            }
            result += `
            </tr>
            <tr>
                <th class="label-cell">${t.labels.PBNA_MOBILE_TOTAL_HOURS}</th>
            `
            for (const day of weekDays) {
                let text = ''
                if (schedule?.dataPerDay[day]) {
                    const totalHours = schedule?.dataPerDay[day]?.plannedMinutes || null
                    text = transferMinutes(totalHours)
                }
                result += `
                <td>${text}</td>
                `
            }
            result += `
                </tr>
                </table>
            </main>
            `
        })
        result += `
            <script>
                const pages = document.querySelectorAll('main')
                pages.forEach((page,index) => {
                    const elementHeight = page.clientHeight                  
                    const h = Math.ceil(elementHeight / ${PAGE_HEIGHT_PX}) * ${PAGE_HEIGHT_PX}
                    page.style.height = h + 'px'
                })
            </script>
            </body>
        </html>
        `
    }
    const reg = /\n(\n)*( )*(\n)*\n/g
    result = result.replace(reg, '\n')
    return result
}

const getSubjectLine = (names: string[], date, dateType: DateType, selectedWeekStr?: string) => {
    let strNames = t.labels.PBNA_MOBILE_MERCH_MERCHANDISER + "s'"
    let strDate = ''
    if (names.length === 1) {
        strNames = `${capitalized(names[0])}'s`
    }
    if (dateType === DateType.FullDay) {
        strDate = formatWithTimeZone(date, TIME_FORMAT.MMM_DD_YYYY, true)
    }
    if (dateType === DateType.FullWeek) {
        strDate = selectedWeekStr
    }
    return `${strNames} ${t.labels.PBNA_MOBILE_PUBLISHED_SCHEDULE_FOR} ${strDate}`
}

const handleSendMail = async (file, subjectLine, emails) => {
    return new Promise<MailResponse>((resolve) => {
        Mailer.mail(
            {
                subject: subjectLine,
                recipients: emails,
                isHTML: true,
                attachments: [
                    {
                        type: 'pdf',
                        path: file.filePath,
                        name: `${subjectLine}.pdf`
                    }
                ]
            },
            (error, event) => {
                error && storeClassLog(Log.MOBILE_ERROR, 'SchedulePdfHelper.handleSendMail', getStringValue(error))
                resolve({
                    event,
                    error
                })
            }
        )
    })
}

const createPDF = async (htmlContent, subjectLine, pageHeight, pageWidth) => {
    const options = {
        html: htmlContent,
        fileName: subjectLine,
        directory: 'Documents',
        height: pageHeight,
        width: pageWidth,
        padding: 0,
        bgColor: '#eeeeee'
    }
    const file = await RNHTMLtoPDF.convert(options)
    return file
}
const getNameEmail = (data) => {
    const names = []
    const emails = []
    data.forEach((schedule) => {
        if (!names.includes(schedule?.employee?.name)) {
            names.push(schedule?.employee?.name)
            schedule?.Email && emails.push(schedule.Email)
        }
    })
    return { names, emails }
}
export const SchedulePdfPage = async (param: SchedulePdfParam) => {
    const { data, date, dateType, weekDates, selectedWeekStr } = param
    // A4 size in points
    const PAGE_HEIGHT = 595
    const PAGE_WIDTH = 842
    try {
        const { gmLocIds } = await getUserLocationId(data)
        await getSaleLocationName(data, gmLocIds)
        const { names, emails } = getNameEmail(data)
        const subjectLine = getSubjectLine(names, date, dateType, selectedWeekStr)
        const htmlContent = getHtmlContent(data, date, dateType, weekDates)
        const file = await createPDF(htmlContent, subjectLine, PAGE_HEIGHT, PAGE_WIDTH)
        const mailRes: MailResponse = await handleSendMail(file, subjectLine, emails)
        if (mailRes) {
            return Promise.resolve(mailRes)
        }
        return Promise.reject()
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'SchedulePdfHelper.SchedulePdfPage', getStringValue(error))
        return Promise.reject(error)
    }
}
