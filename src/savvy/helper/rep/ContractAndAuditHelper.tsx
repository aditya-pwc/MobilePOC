import { HttpStatusCode } from 'axios'
import { initAssessmentTask, initSurveyQuestions } from '../../redux/reducer/ContractReducer'
import { CommonParam } from '../../../common/CommonParam'
import { filterExistFields } from '../../utils/SyncUtils'
import { Constants } from '../../../common/Constants'
import { currentYear } from '../../hooks/CustomerContractTabHooks'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { uploadToSharePoint } from './StartNewCDAHelper'
import { ContractStatus, HttpError, StepVal } from '../../enums/Contract'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createCdaSignatureBody } from './ContractHelper'
import { compositeCommonCall, restDataCommonCall } from '../../api/SyncUtils'
import _ from 'lodash'
import { getIdClause } from '../../../common/utils/CommonUtils'
import NetInfo from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import { t } from '../../../common/i18n/t'

export const updateContractStepFour = async (stepParams: {
    step: string
    isSubmit?: boolean
    // eslint-disable-next-line camelcase
    Sharepoint_URL__c?: string
    surveyQuestions: typeof initSurveyQuestions
    assessmentTask?: typeof initAssessmentTask
    checkedYear?: any
    customerDetail?: any
    visitId?: any
    CustomerSignedDate?: string
    CompanySignedDate?: string
}) => {
    const {
        step,
        isSubmit,
        // eslint-disable-next-line camelcase
        Sharepoint_URL__c,
        surveyQuestions,
        assessmentTask,
        checkedYear,
        customerDetail,
        visitId,
        CustomerSignedDate,
        CompanySignedDate
    } = stepParams
    const isDisabled = surveyQuestions.Contract_Status__c === ContractStatus.Signed
    const syncUpUpdateFields = isDisabled
        ? ['Draft_Survey_Step__c', 'Sharepoint_URL__c']
        : ['StartDate', 'EndDate', 'Draft_Survey_Step__c', 'Sharepoint_URL__c']
    // update contract if signature input
    if (!isDisabled) {
        surveyQuestions.CustomerSignature && syncUpUpdateFields.push('CustomerSignedName__c', 'CustomerSignedTitle')
    }
    if (isDisabled) {
        surveyQuestions.RepSignature && syncUpUpdateFields.push('CompanySignedId')
    } else {
        surveyQuestions.RepSignature && syncUpUpdateFields.push('CompanySignedId', 'Description')
        surveyQuestions.CustomerSignature && syncUpUpdateFields.push('CustomerSignedDate', 'CompanySignedDate')
    }
    isSubmit && syncUpUpdateFields.push('Contract_Status__c')
    const tempContractObj = {
        ...surveyQuestions,
        Draft_Survey_Step__c: step,
        CompanySignedId: CommonParam.userId,
        CustomerSignedDate: CustomerSignedDate,
        CompanySignedDate: CompanySignedDate,
        Contract_Status__c: ContractStatus.Signed,
        Sharepoint_URL__c: Sharepoint_URL__c
    }

    try {
        const compositeRequestBody = [
            {
                method: 'PATCH',
                url: `/services/data/${CommonParam.apiVersion}/sobjects/Contract/${surveyQuestions.Id}`,
                referenceId: 'refContract',
                body: filterExistFields('Contract', [tempContractObj], syncUpUpdateFields)[0]
            }
        ]
        if (isSubmit && assessmentTask && visitId && customerDetail) {
            compositeRequestBody.push(
                createCdaSignatureBody(
                    assessmentTask.UserAssessmentTaskId,
                    surveyQuestions.CustomerSignedName__c,
                    surveyQuestions.CustomerSignature.replace(Constants.IMAGE_DATA_PREFIX, ''),
                    'Customer',
                    false
                ),
                createCdaSignatureBody(
                    assessmentTask.UserAssessmentTaskId,
                    surveyQuestions.SignedRepName,
                    surveyQuestions.RepSignature.replace(Constants.IMAGE_DATA_PREFIX, ''),
                    'PepsiCo',
                    true
                ),
                {
                    method: 'PATCH',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/Visit/${visitId}`,
                    referenceId: 'refVisit',
                    body: {
                        Status__c: 'Complete'
                    }
                }
            )
            if (currentYear === checkedYear || currentYear === surveyQuestions.CDA_Year__c) {
                compositeRequestBody.push({
                    method: 'PATCH',
                    url: `/services/data/${CommonParam.apiVersion}/sobjects/Account/${customerDetail.AccountId}`,
                    referenceId: 'refAccount',
                    body: {
                        CDA_Status__c: 'Signed'
                    }
                })
            }
        }
        const uploadRes = await compositeCommonCall(compositeRequestBody)
        if (
            ![HttpStatusCode.Ok, HttpStatusCode.NoContent].includes(uploadRes.data.compositeResponse[0].httpStatusCode)
        ) {
            throw new Error(ErrorUtils.error2String(uploadRes))
        }

        return true
    } catch (err) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'HandleSave',
            `Customer update contract updateContractStepFour failed: ${ErrorUtils.error2String(err)}`
        )
        return false
    }
}

type OfflineContractType = {
    pdfBase64: string
    sharepointUrl: string
    assessmentTask: typeof initAssessmentTask
    surveyQuestions: typeof initSurveyQuestions
    checkedYear: string
    customerDetail: any
    visitId: string
    CustomerSignedDate: string
    CompanySignedDate: string
}

export const uploadOfflineContract = async (jobKey: string, sharepointToken: string) => {
    try {
        const jobJson = await AsyncStorage.getItem('PendingUploadCDA' + jobKey)
        if (jobJson) {
            const uploadObj = (await JSON.parse(jobJson)) as OfflineContractType
            const {
                pdfBase64,
                sharepointUrl,
                assessmentTask,
                surveyQuestions,
                checkedYear,
                customerDetail,
                visitId,
                CustomerSignedDate,
                CompanySignedDate
            } = uploadObj

            const uploadToSharePointSuccess = await uploadToSharePoint(sharepointToken, pdfBase64, sharepointUrl)

            if (uploadToSharePointSuccess) {
                const success = await updateContractStepFour({
                    step: StepVal.FOUR,
                    isSubmit: true,
                    // eslint-disable-next-line camelcase
                    Sharepoint_URL__c: sharepointUrl,
                    surveyQuestions,
                    assessmentTask,
                    checkedYear: checkedYear,
                    customerDetail,
                    visitId,
                    CustomerSignedDate: CustomerSignedDate,
                    CompanySignedDate: CompanySignedDate
                })
                if (!success) {
                    throw new Error('Fail update contract')
                }
                // If all Success
                return true
            }
            throw new Error(`Fail upload pdf ${jobJson}`)
        }
    } catch (error: any) {
        if (error?.error === HttpError.NETWORK_ERROR) {
            Alert.alert(t.labels.PBNA_MOBILE_LOW_CONNECTIVITY, undefined, [])
        }
        storeClassLog(
            Log.MOBILE_ERROR,
            'CDAContract_uploadOfflineContract',
            `CDA contract upload offline failed: ${ErrorUtils.error2String(error)}`
        )
        return false
    }
}

export const findUploadInprogressContract = async (contractList: any[]): Promise<string | null> => {
    try {
        let inProgressItemId = null
        if (_.isEmpty(contractList)) {
            return inProgressItemId
        }

        // NewCDAPendingUploads{key is contract ID: value is account id }
        const json = await AsyncStorage.getItem('NewCDAPendingUploads')
        const jobs = JSON.parse(json || '{}')
        const inProgressItem = contractList.find((item) => item.Contract_Status__c === ContractStatus.InProgress)
        if (inProgressItem?.Id && jobs?.[inProgressItem?.Id]) {
            inProgressItemId = inProgressItem?.Id
        }
        return inProgressItemId
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'CDA_checkPendingUploadContract',
            `CDA check Pending Upload error: ${ErrorUtils.error2String(error)}`
        )
        return null
    }
}

export const getContracts = (contractKeys: string[]) => {
    return new Promise<any>((resolve) => {
        restDataCommonCall(
            `query/?q=
            SELECT Id, Status, Contract_Status__c,CDA_Year__c, CDA_Reset_Visit__c, Name,
            Signed_Medal_Tier__c,StartDate, EndDate,CreatedDate,Agreement_Type__c, CreatedBy.Name,
            Account_Paid__c,Draft_Survey_Step__c,CDA_Visit__c, Sharepoint_URL__c, RecordType.Name,
            CustomerSignedName__c, CustomerSignedTitle, CompanySigned.Name, Description, CDA_Space_Checkbox__c
            from Contract where 
            ` + `Id in (${getIdClause(contractKeys)})`,
            'GET'
        )
            .then((res) => {
                resolve(res?.data?.records || [])
            })
            .catch((error) => {
                resolve([])
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'CDA_getContracts',
                    `CDA get contract error: ${ErrorUtils.error2String(error)}`
                )
            })
    })
}

export const getInprogressContracts = async (customerUniqId: string) => {
    try {
        const contractSql = `query/?q=
        SELECT Id, Status, Contract_Status__c,CDA_Year__c, CDA_Reset_Visit__c, Name,
        Signed_Medal_Tier__c,StartDate, EndDate,CreatedDate,Agreement_Type__c,
        Account_Paid__c,Draft_Survey_Step__c,CDA_Visit__c
        from Contract`

        const queryContract = `${contractSql} WHERE Account.CUST_UNIQ_ID_VAL__c ='${customerUniqId}' And Contract_Status__c = '${ContractStatus.InProgress}' `

        const res = await restDataCommonCall(queryContract, 'GET')
        return res?.data?.records || []
    } catch (error: any) {
        if (error?.error === HttpError.NETWORK_ERROR) {
            Alert.alert(t.labels.PBNA_MOBILE_LOW_CONNECTIVITY, undefined, [])
        }
        storeClassLog(Log.MOBILE_ERROR, 'CDA_getContracts', `CDA get contract error: ${ErrorUtils.error2String(error)}`)
        return []
    }
}

export const deleteDataLocalIsNotInprogressContract = async () => {
    // Check whether local state that is not Inprogress, and delete it if so
    const json = await AsyncStorage.getItem('NewCDAPendingUploads')
    const jobs = await JSON.parse(json || '{}')
    const contractKeys = Object.keys(jobs)
    if (_.isEmpty(contractKeys)) {
        return
    }

    NetInfo.fetch().then(async (state) => {
        if (state.isInternetReachable) {
            // Remote pull ID based on local contract ID
            const contractList = await getContracts(contractKeys)
            const onlineContractIdList = contractList.map((item: any) => item.Id)

            const updatedJobs = { ...jobs }
            for (const contractId in jobs) {
                const isContractDelete = !onlineContractIdList.includes(contractId)
                const contract = contractList.find((item: any) => item.Id === contractId)
                if ((contract && contract.Contract_Status__c !== ContractStatus.InProgress) || isContractDelete) {
                    delete updatedJobs[contractId]
                    await AsyncStorage.removeItem('PendingUploadCDA' + contractId)
                }
            }

            await AsyncStorage.setItem('NewCDAPendingUploads', JSON.stringify(updatedJobs))
        }
    })
}

const getResetVisitDataQuery = {
    getContractResetVisitQuery: (contractId: string) => `
        SELECT
            CDA_Reset_Visit__c,
            CDA_Reset_Visit__r.Status__c
        FROM Contract
        WHERE Id = '${contractId}'`
}

export const getResetVisitData = async (contractId: string) => {
    return await compositeCommonCall([
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getResetVisitDataQuery.getContractResetVisitQuery(
                contractId
            )}`,
            referenceId: 'refContractResetVisit'
        }
    ])
}
