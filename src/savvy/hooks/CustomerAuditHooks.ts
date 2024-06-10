import { useEffect, useState } from 'react'
import { CommonParam } from '../../common/CommonParam'
import { compositeCommonCall } from '../api/SyncUtils'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { DropDownType } from '../enums/Manager'
import { HttpStatusCode } from 'axios'
import { Log } from '../../common/enums/Log'

const getAuditComplianceQuery = (Subtype: string, COF: string) => `
        SELECT Id 
        FROM Visit 
        WHERE Subtype__c = '${Subtype}' 
            AND Account.CUST_UNIQ_ID_VAL__c ='${COF}'
        `

const getAuditComplianceData = async (Subtype: string, COF: string) => {
    return await compositeCommonCall([
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getAuditComplianceQuery(Subtype, COF)}`,
            referenceId: 'refAuditCompliance'
        }
    ])
}

export const useAuditCompliance = (Subtype: string, COF: string, dropDownRef: any) => {
    const [auditComplianceData, setAuditComplianceData] = useState('')
    useEffect(() => {
        Subtype &&
            COF &&
            getAuditComplianceData(Subtype, COF)
                .then((res) => {
                    if (res.data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                        throw Error(getStringValue(res.data))
                    }
                    const resAuditCompliance = res.data.compositeResponse[0].body.records[0]
                    setAuditComplianceData(resAuditCompliance)
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'CONTRACT-SURVEY-NEXT-STEPS',
                        `Fetch NextSteps Data failure' ${getStringValue(error)}`
                    )
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'Fetch AuditCompliance Data failure',
                        getStringValue(error)
                    )
                })
    }, [Subtype, COF])

    return auditComplianceData
}
