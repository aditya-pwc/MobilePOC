import RNHTMLtoPDF from 'react-native-html-to-pdf'
import React, { Dispatch } from 'react'
import { Log } from '../../../common/enums/Log'
import { Alert, Linking } from 'react-native'
import { t } from '../../../common/i18n/t'
import { getStringValue } from '../../utils/LandingUtils'
import _ from 'lodash'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { restApexCommonCall, restDataCommonCall } from '../../api/SyncUtils'
import { setVisitId, setVisitKpiIsGenerating } from '../../redux/action/ContractAction'
import { fetchRetailStoreKpi, getPOGFileData, getPOGParams, refreshCustomerDetailData } from './ContractHelper'
import {
    AssessmentIndicators,
    AuditAssessmentIndicators,
    ContentTypeEnum,
    GeneralAuditAssessmentIndicators,
    GeneralAuditSumKpi,
    IndexEnum,
    IntervalTime,
    PercentageEnum,
    PogParamsProp,
    StartDateType,
    StaticResourceBase64Obj,
    VisitType,
    isAgreementMedal,
    isMedal
} from '../../enums/Contract'
import { alertManuallyFill } from '../../components/rep/customer/contract-tab/SurveyQuestionsModal'
import { CommonApi } from '../../../common/api/CommonApi'
import { CommonParam } from '../../../common/CommonParam'
import { parseJSON } from '../../hooks/StartNewCDAHooks'
import {
    EstimatedData,
    ExecutionAndDiscountData,
    getCurrentOrNextYear,
    getLocationGroupName,
    initColdVaultData
} from '../../hooks/CustomerContractTabHooks'
import { initEvaluationReferenceData, initSurveyQuestions } from '../../redux/reducer/ContractReducer'
import { contractPdfHtml } from '../../components/rep/customer/contract-tab/ContractPdfHtml'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import dayjs from 'dayjs'
import { NavigationProp } from '@react-navigation/native'
import { syncDownObj } from '../../../common/utils/CommonUtils'
import { NUMBER_VALUE } from '../../enums/MerchandiserEnums'
import NetInfo from '@react-native-community/netinfo'
import moment from 'moment'
import { HttpStatusCode } from 'axios'
import { DropDownType } from '../../enums/Manager'
import { checkAuditRetailVisitKpi } from './AuditHelper'
import { isPersonaSDLOrPsrOrMDOrKAMOrUGM } from '../../../common/enums/Persona'

export interface CustomerDetailParamProps {
    Account: {
        // eslint-disable-next-line camelcase
        CUST_UNIQ_ID_VAL__c: string
    }
    'Account.CUST_UNIQ_ID_VAL__c': string
}

interface EditAuditVisitProps {
    customerDetail: any
    visit: any
    selectedMission: string
    locProdId: string
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    navigation: any
    setSelectedMission: React.Dispatch<React.SetStateAction<string>>
}

const generateUniqueID = () => {
    // uniqueId is an ID that will never be repeated
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2)
    return `${CommonParam.GPID__c}${timestamp}${random}`
}

export const alertNoCustomerSetting = () => {
    Alert.alert(t.labels.PBNA_MOBILE_NO_CUSTOMER_SETTING, t.labels.PBNA_MOBILE_ERROR, [
        {
            text: `${_.capitalize(t.labels.PBNA_MOBILE_OK)}`
        }
    ])
}

const goToGoSpotCheck = (
    GSCId: string,
    customerDetail: CustomerDetailParamProps,
    missionId: string,
    visitId: string,
    isRealogram: boolean,
    existingMobileUniqueId: string
) => {
    const callBackUrl = CommonApi.PBNA_MOBILE_SAVVY_SCHEME
    const GSCUrl = CommonApi.PBNA_MOBILE_GO_SPOT_CHECK_URL
    const appStoreGSCDeepLinkUrl = CommonApi.PBNA_MOBILE_GSP_APP_STORE_URL
    const COF = customerDetail?.['Account.CUST_UNIQ_ID_VAL__c'] || customerDetail?.Account?.CUST_UNIQ_ID_VAL__c
    if (!callBackUrl || !GSCUrl || !appStoreGSCDeepLinkUrl) {
        alertNoCustomerSetting()
        return
    }
    const mobileUniqueId = existingMobileUniqueId || generateUniqueID()
    const customerDataValue = encodeURIComponent(
        `{"CUST_UNIQ_ID_VAL__c":"${COF}","mobileUniqueId":"${mobileUniqueId}","visitId":"${visitId}"}`
    )
    const completionTrigger = encodeURIComponent(
        `{"action_type":"url_redirect","value":"${callBackUrl}","mx_options":["status","mx_user_id",]}`
    )

    const formUrl = `${GSCUrl}/missions/${missionId}/places/${GSCId}/mission_responses/?start=true&customer_data=${customerDataValue}&completion_trigger=${completionTrigger}`

    Linking.canOpenURL(formUrl)
        .then((supported) => {
            if (supported) {
                Linking.openURL(formUrl)
            } else {
                // If there is no GSC APP , The 'supported' would be false
                Linking.openURL(appStoreGSCDeepLinkUrl)
            }
        })
        .catch((err) => {
            // Check Info.plist
            alertManuallyFill(customerDetail, visitId, missionId, GSCId, isRealogram, existingMobileUniqueId)
            storeClassLog(
                Log.MOBILE_ERROR,
                'StartSpaceReview-OpenFormUrl',
                `Open form app failed,please check info list:${getStringValue(err)}`
            )
        })
}

export const getPlaceIdAndMissionThenGoToGoSpotCheck = async (
    customerDetail: CustomerDetailParamProps,
    visitId: string,
    missionId: string,
    GSCId: string,
    isRealogram: boolean,
    existingMobileUniqueId: string
) => {
    if (!CommonApi.PBNA_MOBILE_API_GO_SPOT_CHECK_BASE_URL) {
        alertNoCustomerSetting()
        return
    }

    // If mission Id is null will execute alertManuallyFill
    if (missionId && GSCId) {
        goToGoSpotCheck(GSCId, customerDetail, missionId, visitId, isRealogram, existingMobileUniqueId)
    } else {
        alertManuallyFill(customerDetail, visitId, missionId, GSCId, isRealogram, existingMobileUniqueId)
        storeClassLog(Log.MOBILE_INFO, 'StartSpaceReview-GetMissionId', 'Mission Id Or GSCId is null')
    }
}

export const handleUrl = (callBackUrl: string) => {
    const url = decodeURIComponent(callBackUrl)
    const params = url.split('?')[1]
    const formParams: { [key: string]: string } = {
        status: '',
        mobileUniqueId: ''
    }
    if (params) {
        const keyValuePairs = params.split('&')
        for (const pair of keyValuePairs) {
            const [key, value] = pair.split('=')
            if (key === 'mx_options' && !_.isEmpty(value)) {
                formParams.status = parseJSON(`${value}`, 'handleUrl_parseUrlJSON')?.status
            }
            if (key === 'customer_data' && !_.isEmpty(value)) {
                // Remove extra closing quotes
                const customerDataString = value.slice(0, -2)
                formParams.mobileUniqueId = parseJSON(customerDataString, 'handleUrl_parseUrlJSON')?.mobileUniqueId
            }
        }
    }

    return formParams
}

export const noVisibleTierMatch = async () => {
    Alert.alert(t.labels.PBNA_MOBILE_NO_VISIBLE_TIER_MATCH_TITLE, t.labels.PBNA_MOBILE_NO_VISIBLE_TIER_MATCH_BODY, [
        {
            text: `${_.capitalize(t.labels.PBNA_MOBILE_OK)}`,
            onPress: () => {
                // Future
            }
        }
    ])
}

export const kpiParams = [
    AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES,
    AssessmentIndicators.DOOR_SURVEY,
    AssessmentIndicators.TOTAL_LRB_SHELVES,
    AssessmentIndicators.REWARDS_SELECTION,
    AssessmentIndicators.PROPOSED_VALUES_FOR_EXECUTION_ELEMENTS,
    AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE,
    AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES,
    AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES,
    AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES,
    AssessmentIndicators.OTHER_LRB_TOTAL
]
const stateCode = (customerDetail: any) => {
    if (customerDetail.StateCode === undefined) {
        return customerDetail.State ? customerDetail.State : ''
    }
    return customerDetail.StateCode ? customerDetail.StateCode : ''
}

export const getAddress = (customerDetail: any) => {
    return `${customerDetail.Street ? customerDetail.Street : ''}${
        customerDetail.Street && customerDetail.City ? ' ' : ''
    }${customerDetail.City ? customerDetail.City + ', ' : ''}${stateCode(customerDetail)}${
        customerDetail.PostalCode ? ' ' + customerDetail.PostalCode : ''
    }`
}
const checkRetailVisitKpi = async (visitId: string, popSelectTheYear: Function, dispatch: Dispatch<any>) => {
    const pollInterval = IntervalTime.THREE_THOUSAND
    const timeout = IntervalTime.TEN * IntervalTime.ONE_THOUSAND
    const startTime = new Date().getTime()

    const poll = setInterval(async () => {
        try {
            const currentTime = new Date().getTime()
            const elapsedTime = currentTime - startTime

            const retailVisitKpi: any = await fetchRetailStoreKpi(kpiParams, visitId)

            if (elapsedTime >= timeout) {
                // When the timeout period is reached, stop polling and process the timeout logic
                clearInterval(poll)
                dispatch(setVisitKpiIsGenerating(false))
            } else {
                if (retailVisitKpi?.data?.length > 0) {
                    // retail visit kpi success
                    clearInterval(poll)
                    dispatch(setVisitKpiIsGenerating(false))
                    popSelectTheYear()
                }
            }
        } catch (error) {
            dispatch(setVisitKpiIsGenerating(false))
            clearInterval(poll)
            storeClassLog(
                Log.MOBILE_ERROR,
                'CheckRetailVisitKpi',
                `Check Retail Visit Kpi failed: ${getStringValue(error)}`
            )
        }
    }, pollInterval)
}

export const createRetailVisitKPI = async (
    customerDetail: any,
    dispatch: Dispatch<any>,
    popSelectTheYear: Function
) => {
    dispatch(setVisitKpiIsGenerating(true))

    const body = {
        strLocationId: customerDetail['Account.LOC_PROD_ID__c'],
        strRetailStoreId: customerDetail.Id
    }

    try {
        const res = await restApexCommonCall('createCdaVisit', 'POST', body)
        const visitId = res.data

        dispatch(setVisitId(res.data))
        // Polling to see if visitKPI is generated
        await checkRetailVisitKpi(visitId, popSelectTheYear, dispatch)
    } catch (error) {
        dispatch(setVisitKpiIsGenerating(false))
        storeClassLog(
            Log.MOBILE_ERROR,
            'startNewCDA-createRetailVisitKPI',
            `create retail visit KPI failed:${getStringValue(error)}`
        )
    }
}

const isValidNumber = (num: number) => {
    return typeof num === 'number' && !isNaN(num)
}

const multiplyNumbers = (a: string, b: string, roundIndex = IndexEnum.TWO) => {
    if (isValidNumber(Number(a)) && isValidNumber(Number(b))) {
        return _.round(_.multiply(Number(a), Number(b)), roundIndex)
    }
    return 0
}

export const getUserEmail = async () => {
    let res = {}

    try {
        const queryContract = `query/?q=
            SELECT Email
            FROM User
            WHERE Id ='${CommonParam.userId}'`
        res = await restDataCommonCall(queryContract, 'GET')
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'handelGeneratePDF-getContractInfo',
            `Fetch Contract Object failure ${getStringValue(error)}`
        )
    }

    return res
}

interface HandelGeneratePDFParams {
    subjectLine: string
    surveyQuestions: typeof initSurveyQuestions
    customerDetail: any
    evaluationReferenceData: typeof initEvaluationReferenceData
    coldVaultData: typeof initColdVaultData
    rewardsData: any
    executionData: ExecutionAndDiscountData[]
    discountData: ExecutionAndDiscountData[]
    POGBase64: string
    agreementCheck: boolean
    emailAddress: string | null
    staticResourceBase64Obj: StaticResourceBase64Obj
}

export const handelGeneratePDF = async ({
    subjectLine,
    surveyQuestions,
    customerDetail,
    evaluationReferenceData,
    coldVaultData,
    rewardsData,
    executionData,
    discountData,
    POGBase64,
    agreementCheck,
    emailAddress,
    staticResourceBase64Obj
}: HandelGeneratePDFParams) => {
    try {
        const routeSalesGeoRes = evaluationReferenceData?.data?.compositeResponse?.[0]?.body?.records?.[0]
        const medal = surveyQuestions.Signed_Medal_Tier__c || ''
        const tempLRBSpace = coldVaultData?.SpaceRequirements[medal] || '0'
        const fundingPackage = discountData.filter((i: EstimatedData) => medal in i.kpiRequirements)
        const filteredRewards = rewardsData.filter(
            (reward: any) => surveyQuestions.SelectRewards[reward.TARGET_NAME__c]
        )
        const tempTotalColdVaultLRBShelves = surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]

        const contractInfo = {
            // contract info
            Signed_Medal_Tier__c: medal || '',
            CDA_Year__c: surveyQuestions.CDA_Year__c || '',
            contractStartDate: surveyQuestions.StartDate || '',
            contractEndDate: surveyQuestions.EndDate || '',
            customerName: customerDetail?.Name || '',
            customerId: customerDetail?.['Account.CUST_UNIQ_ID_VAL__c'] || '',
            customerAddress: getAddress(customerDetail),
            regionName: routeSalesGeoRes ? routeSalesGeoRes.Parent_Node__r.Parent_Node__r.SLS_UNIT_NM__c : '',
            locationName: routeSalesGeoRes ? routeSalesGeoRes.SLS_UNIT_NM__c : '',
            marketName: routeSalesGeoRes ? routeSalesGeoRes.Parent_Node__r.SLS_UNIT_NM__c : '',
            dateSigned: dayjs().format(TIME_FORMAT.Y_MM_DD),
            dateAgreed: dayjs().format(TIME_FORMAT.Y_MM_DD),
            contactName: surveyQuestions.SignedRepName || '',
            contactEmail: emailAddress || '',
            description: surveyQuestions.Description || '',
            customerSignedName: surveyQuestions.CustomerSignedName__c || '',
            customerSignedTitle: surveyQuestions.CustomerSignedTitle || '',

            // Survey Info
            totalColdVaultLRBShelves: tempTotalColdVaultLRBShelves || '',
            totalColdVaultPepsiLRBShelves: surveyQuestions[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES] || '',
            doorSurvey: surveyQuestions[AssessmentIndicators.DOOR_SURVEY] || '',

            // Pepsi Program  DSD Rewards and PWS CDA
            LRBSpace: multiplyNumbers(tempLRBSpace, `${PercentageEnum.ONE_HUNDRED}`, IndexEnum.ZERO) || '',
            LRBShelvesSpace: multiplyNumbers(tempLRBSpace, tempTotalColdVaultLRBShelves),
            ProposedTotalLRBSpace: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] || '',
            ProposedTotalPepLRBShelves: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES] || '',
            ProposedPEPPerimeterShelves: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES] || '',
            ProposedPepColdVaultShelves: surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES] || '',
            fundingPackage: fundingPackage,
            rewards: filteredRewards,
            Equipment: executionData.filter((i) => i.VALUE_TYPE__c === 'Equipment'),
            Display: executionData.filter((i) => i.VALUE_TYPE__c === 'Display'),
            base64List: staticResourceBase64Obj,
            POGUrl: agreementCheck ? POGBase64 : '',
            CustomerSignature: surveyQuestions.CustomerSignature,
            RepSignature: surveyQuestions.RepSignature
        }

        const htmlContent = contractPdfHtml(contractInfo, subjectLine)
        const pdfFile = await RNHTMLtoPDF.convert({
            html: htmlContent,
            fileName: subjectLine,
            pageSize: 'Letter',
            padding: 0,
            base64: true
        })

        return { htmlString: htmlContent, base64: pdfFile.base64 }
    } catch (error) {
        Alert.alert(t.labels.PBNA_MOBILE_SUBMIT_CONTRACT_FAILED)
        storeClassLog(
            Log.MOBILE_ERROR,
            `handelGeneratePDF-${subjectLine}`,
            `Generate PDF failure ${getStringValue(error)}`
        )
        throw new Error(`Generate PDF failure ${getStringValue(error)}`)
    }
}

const base64ToBlob = async (base64String: string) => {
    const url = `${ContentTypeEnum.PDF}${base64String}`
    const res = await fetch(url)
    const blob = await res?.blob()
    return blob
}

export const uploadToSharePoint = async (sharepointToken: string, base64String: string, sharepointUrl: string) => {
    try {
        const blob = await base64ToBlob(base64String)
        const spUrl = encodeURI(sharepointUrl)
        const res = await fetch(spUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/pdf',
                Authorization: `Bearer ${sharepointToken}`
            },
            body: blob
        })
        return res.status === HttpStatusCode.Ok || res.status === HttpStatusCode.Created
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, `uploadToSharePoint`, `Upload To SharePoint failure ${getStringValue(e)}`)
        return false
    }
}

export const getReferShelfCount = (
    coldVaultData: typeof initColdVaultData,
    medal: string,
    surveyQuestions: typeof initSurveyQuestions
) => {
    let referencePepLrbShelves = ''
    if (coldVaultData?.SpaceRequirements?.[medal] && surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]) {
        referencePepLrbShelves = `${_.round(
            Number(coldVaultData.SpaceRequirements[medal]) *
                Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]),
            0
        )}`
    }
    return referencePepLrbShelves
}

export const getShelfCount = (
    surveyQuestions: typeof initSurveyQuestions,
    coldVaultData: typeof initColdVaultData,
    medal: string,
    useReferenceValue = true
) => {
    let shelfCount = ''
    if (!surveyQuestions.CDA_Space_Checkbox__c) {
        shelfCount = useReferenceValue
            ? getReferShelfCount(coldVaultData, medal, surveyQuestions)
            : surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]
    } else {
        shelfCount = useReferenceValue
            ? getReferShelfCount(coldVaultData, medal, surveyQuestions)
            : surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]
    }

    return shelfCount === '' || shelfCount === null || shelfCount === undefined
        ? ''
        : `${_.round(Number(shelfCount), 0)}`
}

const hasValue = (value: any): boolean => {
    return !(value === '' || value === null || value === undefined)
}

export const getPDFShelfCount = (
    surveyQuestions: typeof initSurveyQuestions,
    coldVaultData: typeof initColdVaultData,
    medal: string
) => {
    // Take the recommended value first
    let shelfCount = ''
    if (!surveyQuestions.CDA_Space_Checkbox__c) {
        shelfCount = hasValue(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES])
            ? surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]
            : getReferShelfCount(coldVaultData, medal, surveyQuestions)
    } else {
        shelfCount = hasValue(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES])
            ? surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]
            : getReferShelfCount(coldVaultData, medal, surveyQuestions)
    }

    return hasValue(shelfCount) ? `${_.round(Number(shelfCount), 0)}` : ''
}

export const openFile = async (
    setPogLoading: Function,
    isResetVisit: boolean,
    navigation: NavigationProp<any>,
    pogParams: PogParamsProp | null,
    visit?: any,
    setPogItem?: Function
) => {
    // If pogParams is null, visit is mandatory
    try {
        setPogLoading(true)
        if (isResetVisit) {
            let pogParamsTemp: PogParamsProp | null = pogParams
            if (_.isEmpty(pogParams)) {
                pogParamsTemp = await getPOGParams(visit.Id, VisitType.RESET_VISIT, '')
            }
            const POGFileUrl = await getPOGFileData(pogParamsTemp)
            if (POGFileUrl) {
                if (!setPogItem) {
                    navigation.navigate('ContractPDFPage', {
                        fileName: t.labels.PBNA_MOBILE_PLANOGRAMS,
                        link: POGFileUrl
                    })
                } else {
                    setPogItem({
                        fileName: t.labels.PBNA_MOBILE_PLANOGRAMS,
                        link: POGFileUrl
                    })
                }
            } else {
                Alert.alert(t.labels.PBNA_MOBILE_NO_PLANOGRAMS_AVAILABLE, '', [
                    {
                        text: `${t.labels.PBNA_MOBILE_OK.toUpperCase()}`
                    }
                ])
            }
        } else {
            navigation.navigate('PremierTaskScreen', {
                visit
            })
        }
        setPogLoading(false)
    } catch (error) {
        setPogLoading(false)
        storeClassLog(Log.MOBILE_ERROR, 'getPOGFileData', `Get POG File Data: ${getStringValue(error)}`)
    }
}

function getLastSaturdayOfYear(checkedYear: string) {
    const lastDayOfMonth = new Date(parseInt(checkedYear), 11, 31) // December 31st of the input year
    const dayOfWeek = lastDayOfMonth.getDay() // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const daysUntilLastSaturday = (dayOfWeek + 1) % 7 // Calculate how many days to subtract to get to the last Saturday
    const lastSaturday = new Date(lastDayOfMonth)
    lastSaturday.setDate(lastDayOfMonth.getDate() - daysUntilLastSaturday)
    return moment(lastSaturday).format(TIME_FORMAT.Y_MM_DD)
}

export interface CDAStartDataProps {
    customerDetail: any
    checkedYear: string
    pepsicoCalendar: any[]
}

export const getCDAStartDate = async ({ customerDetail, checkedYear, pepsicoCalendar }: CDAStartDataProps) => {
    const locationId = customerDetail?.['Account.LOC_PROD_ID__c']
    try {
        const groupName = await getLocationGroupName(locationId, checkedYear)

        const targetsQuery = `SELECT Id,CDA_Default_Start_Date__c
        FROM Targets_Forecasts__c
        Where Target_id__c  ='${groupName}' AND Sub_Target_ID__c='${checkedYear}' AND Status__c='Published' And Type__c='Overview' And UNIT__c = 'Retail'`

        const targetRes = await syncDownObj('Targets_Forecasts__c', targetsQuery, false)

        if (targetRes.data.length > 0) {
            if (targetRes.data[0].CDA_Default_Start_Date__c === StartDateType.TODAY) {
                const tomorrow = dayjs().add(NUMBER_VALUE.ONE_NUM, 'day').format(TIME_FORMAT.Y_MM_DD)
                return { startDate: tomorrow || '' }
            }
            if (targetRes.data[0].CDA_Default_Start_Date__c === StartDateType.FISCAL_YEAR) {
                const currentYearCalendar = pepsicoCalendar.filter(
                    (calendar) => calendar.Year__c === getCurrentOrNextYear().currentYear
                )

                if (checkedYear === getCurrentOrNextYear().currentYear) {
                    const fiscalYearDayOne = currentYearCalendar.filter((calendar) => calendar.Sequence__c === '1.0')[0]
                        .Start_Date__c
                    const tomorrow = dayjs().add(NUMBER_VALUE.ONE_NUM, 'day').format(TIME_FORMAT.Y_MM_DD)

                    // If start date that is past the current date (fiscal year day 1 in the cda admin tool)
                    // Need to see the default start date will be Today's date + 1

                    if (dayjs(new Date()).isAfter(dayjs(fiscalYearDayOne))) {
                        return { startDate: tomorrow || '' }
                    }
                    return { startDate: fiscalYearDayOne || '' }
                }
                if (checkedYear === getCurrentOrNextYear().nextYear) {
                    const fiscalYearEndDayItem = currentYearCalendar.find((calendar) => calendar.Sequence__c === '13.0')
                    const fiscalYearEndDay = fiscalYearEndDayItem?.End_Date__c
                    if (fiscalYearEndDay) {
                        const nextFiscalYearEndTwo = moment(fiscalYearEndDay)
                            .add(NUMBER_VALUE.TWO_NUM, 'day')
                            .format(TIME_FORMAT.Y_MM_DD)
                        return { startDate: nextFiscalYearEndTwo || '' }
                    }
                    const nextFiscalYearEndTwo = moment(getLastSaturdayOfYear((parseInt(checkedYear) - 1).toString()))
                        .add(NUMBER_VALUE.TWO_NUM, 'day')
                        .format(TIME_FORMAT.Y_MM_DD)
                    return { startDate: nextFiscalYearEndTwo || '' }
                }
            }
        }
        return { startDate: '' }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getStartDate', `Get Start Date failure: ${getStringValue(error)}`)
        return { startDate: '' }
    }
}

export const getAuditKpiList = () => {
    const lstAuditVisitKPIs = Object.keys(AuditAssessmentIndicators).map((key: string) => {
        return AuditAssessmentIndicators[key as keyof typeof AuditAssessmentIndicators]
    }) as any[]
    const lstGeneralAuditVisitKPIs = Object.keys(GeneralAuditAssessmentIndicators).map((key: string) => {
        return GeneralAuditAssessmentIndicators[key as keyof typeof GeneralAuditAssessmentIndicators]
    }) as any[]
    const lstGeneralAuditVisitSumKPIs = Object.keys(GeneralAuditSumKpi).map((key) => {
        return GeneralAuditSumKpi[key as keyof typeof GeneralAuditSumKpi]
    })
    lstAuditVisitKPIs.push(AssessmentIndicators.DOOR_SURVEY)
    lstAuditVisitKPIs.push(...lstGeneralAuditVisitKPIs)
    lstAuditVisitKPIs.push(...lstGeneralAuditVisitSumKPIs)

    return lstAuditVisitKPIs
}

export const alertUserInfo = () => {
    Alert.alert('', t.labels.PBNA_MOBILE_SUBMIT_CLICK_EDIT_AUDIT, [
        {
            text: t.labels.PBNA_MOBILE_OK.toLocaleUpperCase(),
            onPress: () => {}
        }
    ])
}

interface CreateAuditVisitProps {
    customerDetail: any
    strSubtype: string
    strContractId: string
    selectedMission: string
    locProdId: string
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    setIsLoading: Function
    setBtnLoading: Function
    dispatch: Dispatch<any>
    navigation: any
    dropDownRef: any
    setSelectedMission: React.Dispatch<React.SetStateAction<string>>
}
export const createAuditVisit = async ({
    customerDetail,
    strSubtype,
    strContractId,
    selectedMission,
    locProdId,
    setRefreshFlag,
    setIsLoading,
    setBtnLoading,
    dispatch,
    navigation,
    dropDownRef,
    setSelectedMission
}: CreateAuditVisitProps) => {
    dispatch(setIsLoading(true))
    dispatch(setBtnLoading(true))
    const body = {
        strLocationId: locProdId,
        strRetailStoreId: customerDetail?.Id,
        strSubtype,
        strContractId
    }
    try {
        const res = await restApexCommonCall('createCdaAuditVisit', 'POST', body)
        const obj = JSON.parse(res.data)

        if (obj.strMessage) {
            // create retail visit KPI fail
            // setIsPostCDAAuditLoading or setIsGeneralAuditLoading false
            dispatch(setBtnLoading(false))
            dispatch(setIsLoading(false))
            storeClassLog(
                Log.MOBILE_ERROR,
                'startNewCDAHelper-createAuditVisit',
                `create retail visit KPI url:createCdaAuditVisit, body:${JSON.stringify(body)}, error: ${
                    obj.strMessage
                }`
            )
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'startNewCDAHelper-createAuditVisit', obj.strMessage)
        } else {
            const visitId = obj?.objData?.visitId || ''
            const isVisitKpiReady: boolean = await checkAuditRetailVisitKpi(visitId, getAuditKpiList(), locProdId)
            if (isVisitKpiReady) {
                navigation.navigate('AuditScreen', {
                    visitSubtype: strSubtype,
                    setRefreshFlag,
                    auditVisitId: visitId,
                    selectedMission: selectedMission || '',
                    locProdId,
                    retailStore: customerDetail
                })
            } else {
                alertUserInfo()
            }

            dispatch(setIsLoading(false))
            dispatch(setBtnLoading(false))
            if (setRefreshFlag) {
                refreshCustomerDetailData(setRefreshFlag, customerDetail)
            }
        }
        setSelectedMission('')
    } catch (error) {
        setSelectedMission('')
        dispatch(setIsLoading(false))
        dispatch(setBtnLoading(false))
        storeClassLog(
            Log.MOBILE_ERROR,
            'startNewCDA-createAuditVisit',
            `create retail visit KPI failed:${getStringValue(error)}`
        )
    }
}
export const editAuditVisit = async ({
    customerDetail,
    visit,
    selectedMission,
    locProdId,
    setRefreshFlag,
    navigation,
    setSelectedMission
}: EditAuditVisitProps) => {
    try {
        navigation.navigate('AuditScreen', {
            visitSubtype: visit.Visit_Subtype__c,
            setRefreshFlag,
            auditVisitId: visit.Id,
            selectedMission,
            locProdId,
            retailStore: customerDetail,
            isEdit: true
        })
        if (setRefreshFlag) {
            refreshCustomerDetailData(setRefreshFlag, customerDetail)
        }
        setSelectedMission('')
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'startNewCDA-createAuditVisit',
            `create retail visit KPI failed:${getStringValue(error)}`
        )
        setSelectedMission('')
    }
}

export const getCDAEndDate = (checkedYear: string, pepsicoCalendar: any[]) => {
    let fiscalYearEndDay
    if (checkedYear === getCurrentOrNextYear().currentYear) {
        const currentYearCalendar = pepsicoCalendar.filter(
            (calendar) => calendar.Year__c === getCurrentOrNextYear().currentYear
        )
        fiscalYearEndDay = currentYearCalendar.filter((calendar) => calendar.Sequence__c === '13.0')[0]?.End_Date__c
    } else {
        const nextYearCalendar = pepsicoCalendar.filter(
            (calendar) => calendar.Year__c === getCurrentOrNextYear().nextYear
        )
        fiscalYearEndDay = nextYearCalendar.filter((calendar) => calendar.Sequence__c === '13.0')[0]?.End_Date__c
    }
    if (!fiscalYearEndDay) {
        fiscalYearEndDay = getLastSaturdayOfYear(checkedYear)
    }
    if (moment(fiscalYearEndDay).subtract(NUMBER_VALUE.ONE_NUM, 'day').isSameOrAfter(moment(), 'day')) {
        return moment(fiscalYearEndDay).format(TIME_FORMAT.Y_MM_DD)
    }
    return moment().add(NUMBER_VALUE.TWO_NUM, 'day').format(TIME_FORMAT.Y_MM_DD)
}

export const openPDFFile = async (url: any, navigation: NavigationProp<any>) => {
    try {
        if (url) {
            navigation.navigate('ContractPDFPage', {
                fileName: t.labels.PBNA_MOBILE_PLANOGRAMS,
                link: url
            })
        } else {
            Alert.alert(t.labels.PBNA_MOBILE_NO_PLANOGRAMS_AVAILABLE, '', [
                {
                    text: `${t.labels.PBNA_MOBILE_OK.toUpperCase()}`
                }
            ])
        }
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'getPOGFileData', `Get POG File Data: ${getStringValue(error)}`)
    }
}

export const handlePressFormBtnHelper = (
    customerDetail: any,
    visitId: string,
    missionId: string,
    GSCId: string,
    onFormButtonClicked: Function,
    isRealogram: boolean = false,
    existingMobileUniqueId: string = ''
) => {
    // The save and proceed button should only be activated with a single click,FORMStateToStart will activate the save btn
    onFormButtonClicked && onFormButtonClicked()

    NetInfo.fetch()
        .then((state) => {
            if (state.isInternetReachable) {
                getPlaceIdAndMissionThenGoToGoSpotCheck(
                    customerDetail,
                    visitId,
                    missionId,
                    GSCId,
                    isRealogram,
                    existingMobileUniqueId
                )
            } else {
                Alert.alert(
                    '',
                    isPersonaSDLOrPsrOrMDOrKAMOrUGM()
                        ? t.labels.PBNA_MOBILE_FORM_SLOW_CONNECTION
                        : t.labels.PBNA_MOBILE_FORM_NO_CONNECTION_MESSAGE,
                    [
                        {
                            text: t.labels.PBNA_MOBILE_OK,
                            onPress: () => {
                                getPlaceIdAndMissionThenGoToGoSpotCheck(
                                    customerDetail,
                                    visitId,
                                    missionId,
                                    GSCId,
                                    isRealogram,
                                    existingMobileUniqueId
                                )
                            }
                        }
                    ]
                )
            }
        })
        .catch((err) => {
            storeClassLog(Log.MOBILE_ERROR, 'OpenFormUrl', `'network not available:${getStringValue(err)}`)
        })
}

const checkAgreementMedalTierTypeEqualsNewTierType = (agreementType: string, newTier: string) => {
    return (
        (isMedal(newTier) && isAgreementMedal(agreementType)) || (!isMedal(newTier) && !isAgreementMedal(agreementType))
    )
}

export const checkIsChangedMedalTierType = (surveyQuestions: typeof initSurveyQuestions, newTier: string) => {
    if (newTier) {
        let isChangedMedalTierType = false
        if (!surveyQuestions.Signed_Medal_Tier__c) {
            isChangedMedalTierType = !checkAgreementMedalTierTypeEqualsNewTierType(
                surveyQuestions.Agreement_Type__c,
                newTier
            )
        } else {
            isChangedMedalTierType = isMedal(newTier) !== isMedal(surveyQuestions.Signed_Medal_Tier__c)
        }
        return isChangedMedalTierType
    }
    return true
}
