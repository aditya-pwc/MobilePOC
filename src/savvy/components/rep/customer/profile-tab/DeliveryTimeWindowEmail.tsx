/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-12-18 11:42:20
 * @LastEditTime: 2024-01-05 11:48:31
 * @LastEditors: Mary Qian
 */

import RNHTMLtoPDF from 'react-native-html-to-pdf'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { DeliveryTimeObjProps, getDeliveryTimeObj, getFullNameOfWeek } from './EditDeliveryTimeWindowHelper'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { SoupService } from '../../../../service/SoupService'
import { CommonParam } from '../../../../../common/CommonParam'
import { t } from '../../../../../common/i18n/t'

const DelTimeWindowEmailStyles = `
    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        margin: 0
    }

    p {
        margin: 0
    }

    .email-container {
        margin-top: 22px;
        padding-left: 22px;
        padding-right: 22px;
    }

    .customer-info-title {
        margin-bottom: 20px;
        font-size: 16px;
        color: #000;
        font-weight: 700;
    }

    .label-text {
        margin-bottom: 9px;
        font-size: 12px;
        color: #000;
        font-weight: 400;
    }

    .value-text {
        margin-bottom: 20px;
        font-size: 14px;
        color: #000;
        font-weight: 400;
    }

    .propose-time-container {
        margin-top: 30px;
    }

    .week-day-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid #D3D3D3;
    }

    .week-day-text {
        font-size: 12px;
        color: #000;
        font-weight: 700;
    }

    .time-text {
        font-size: 12px;
        color: #000;
        font-weight: 400;
    }
`

export const DelTimeWindowEmailEvent = 'ReadyToSendDelTimeWindowEmail'

export interface DTWEmailInfo {
    file: any
    title: string
    emails: string[]
}

export interface DeliveryTimeWindowEmailProps {
    customerName: string
    customerNumber: string
    LocationName: string
    userName: string
}

export const getDeliveryTimeWindowEmailHtmlContent = (
    deliveryTimeObj: DeliveryTimeObjProps,
    emailInfo: DeliveryTimeWindowEmailProps
) => {
    let html = `  
    <html>  
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                ${DelTimeWindowEmailStyles}
            </style>
        </head>
        <body>  
            <div class="email-container">
                <p class="customer-info-title">${t.labels.PBNA_MOBILE_CUSTOMER_INFORMATION}</p>

                <p class="label-text">${t.labels.PBNA_MOBILE_FILTER_CUST_NAME}</p>
                <p class="value-text">${emailInfo.customerName}</p>

                <p class="label-text">${t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}</p>
                <p class="value-text">#${emailInfo.customerNumber}</p>

                <p class="label-text">${t.labels.PBNA_MOBILE_PEPSI_LOCATION_NAME}</p>
                <p class="value-text">${emailInfo.LocationName}</p>

                <p class="label-text">${t.labels.PBNA_MOBILE_USER_NAME}</p>
                <p class="value-text">${emailInfo.userName}</p>

                <p class="customer-info-title propose-time-container">${t.labels.PBNA_MOBILE_PROPOSED_NEW_TIME_WINDOW}</p>
`

    for (const [key, value] of Object.entries(deliveryTimeObj)) {
        html += `<div class="week-day-container">
            <p class="week-day-text">${getFullNameOfWeek(key).toUpperCase()}</p>
            <p class="time-text">${value.displayString}</p>
        </div>`
    }

    html += `
            </div>
        </body>  
    </html>  
  `

    return html
}

export const getRetailStoreInfo = async (accountId: string): Promise<DeliveryTimeWindowEmailProps> => {
    const defaultRetailStoreInfo: DeliveryTimeWindowEmailProps = {
        customerName: '',
        customerNumber: '',
        LocationName: '',
        userName: ''
    }
    try {
        const retailStore = await SoupService.retrieveDataFromSoup('RetailStore', {}, [], null, [
            ` WHERE {RetailStore:AccountId}='${accountId}'`
        ])

        if (_.isEmpty(retailStore)) {
            return defaultRetailStoreInfo
        }

        const store = retailStore[0]
        return {
            customerName: store['Account.Name'] as string,
            customerNumber: store['Account.CUST_UNIQ_ID_VAL__c'] as string,
            LocationName: CommonParam.userLocationName,
            userName: CommonParam.userName
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, '', ErrorUtils.error2String(error))
        return defaultRetailStoreInfo
    }
}

export const getDTWEmailInfo = async (
    deliveryTimeObj: DeliveryTimeObjProps,
    accountId: string
): Promise<DTWEmailInfo> => {
    try {
        const newTimeObj: DeliveryTimeObjProps = {}
        for (const [day, dayTimeWindow] of Object.entries(deliveryTimeObj)) {
            const { startTime1, startTime2, endTime1, endTime2 } = dayTimeWindow

            newTimeObj[day] = getDeliveryTimeObj(startTime1, endTime1, startTime2, endTime2)
        }

        const title = t.labels.PBNA_MOBILE_TIME_WINDOW_EMAIL_TITLE
        const emails = [CommonParam.Email]
        const emailInfo = await getRetailStoreInfo(accountId)
        const htmlContent = getDeliveryTimeWindowEmailHtmlContent(newTimeObj, emailInfo)
        const options = {
            html: htmlContent,
            fileName: title,
            directory: 'Documents',
            height: 820,
            width: 450,
            padding: 0,
            bgColor: '#000'
        }
        const file = await RNHTMLtoPDF.convert(options)

        return {
            file,
            title,
            emails
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, '', ErrorUtils.error2String(error))
        return Promise.reject(error)
    }
}
