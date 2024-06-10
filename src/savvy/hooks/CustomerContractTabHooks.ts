import _ from 'lodash'
import moment from 'moment'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { compositeCommonCall, restApexCommonCall, restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import {
    AgreementType,
    AssessmentIndicators,
    ContractBtnType,
    ContractRecordTypeName,
    DataType,
    DatumType,
    StepVal,
    IndexEnum,
    MedalSubType,
    SubType,
    medalOrder,
    medalOrderWithoutBasic,
    IntervalTime,
    BooleanEnum,
    TierDataObj,
    PercentageEnum,
    CountryType,
    MissionType,
    StaticResourceBase64Obj,
    TFStatus
} from '../enums/Contract'
import { Log } from '../../common/enums/Log'
import { DropDownType } from '../enums/Manager'
import { NUMBER_VALUE } from '../enums/MerchandiserEnums'
import {
    setDisableNewButton,
    setExecutionData,
    setEnabledRewards,
    updateDefaultYearAction,
    setSurveyQuestions,
    setEvaluationReferenceData,
    setEstimatedData,
    setTierData
} from '../redux/action/ContractAction'
import { StoreVolumeSectionData, initSurveyQuestions } from '../redux/reducer/ContractReducer'
import { Alert } from 'react-native'
import { t } from '../../common/i18n/t'
import { getSumByVal, handleStoreVolumeData, subtract } from '../helper/rep/ContractHelper'
import { CommonParam } from '../../common/CommonParam'
import { HttpStatusCode } from 'axios'
import { sortByParamsASC } from '../components/manager/helper/MerchManagerHelper'
import { RewardData } from '../components/rep/customer/contract-tab/RewardsModals'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { storeClassLog } from '../../common/utils/LogUtils'
import { FormStatus } from '../components/rep/customer/contract-tab/SurveyQuestionsModal'
import { getAllFieldsByObjName } from '../utils/SyncUtils'
import { VisitStatus, VisitSubType } from '../enums/Visit'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { getTruckVolume } from '../api/ApexApis'
import { checkIsChangedMedalTierType, getUserEmail } from '../helper/rep/StartNewCDAHelper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonApi } from '../../common/api/CommonApi'

const enum ContractStatus {
    InProgress = 'In progress',
    Signed = 'Signed',
    Declined = 'Declined',
    Cancelled = 'Cancelled'
}

export const getCurrentOrNextYear = () => {
    return {
        currentYear: moment().format(TIME_FORMAT.Y),
        nextYear: moment().add(NUMBER_VALUE.ONE_NUM, 'year').format(TIME_FORMAT.Y)
    }
}

export const currentYear = getCurrentOrNextYear().currentYear
export const nextYear = getCurrentOrNextYear().nextYear

const calculateSelectYearModalLogic = (publishThisYear: boolean, publishNextYear: boolean) => {
    let tempCheckedYear = ''
    let tempDisableThisOrNextYear = ''
    let tempDisabledYear = ''

    if (publishThisYear) {
        tempCheckedYear = currentYear
        tempDisableThisOrNextYear = nextYear
    } else if (publishNextYear) {
        tempCheckedYear = nextYear
        tempDisableThisOrNextYear = currentYear
    }

    tempDisabledYear = publishThisYear && publishNextYear ? '' : tempDisableThisOrNextYear

    return {
        tempCheckedYear,
        tempDisabledYear
    }
}

const handleSelectYearData = (
    signedOrDeclinedTodayYearContract: boolean,
    signedOrDeclinedNextYearContract: boolean,
    signedTodayYearContract: boolean,
    signedNextYearContract: boolean,
    publishThisYear: boolean,
    publishNextYear: boolean
) => {
    const defaultSelectYear = {
        [ContractBtnType.START_NEW_CDA]: {
            checkedYear: '',
            disabledYear: ''
        },
        [ContractBtnType.CUSTOMER_DECLINED]: {
            checkedYear: '',
            disabledYear: ''
        }
    }

    // Decline btn Select year logic
    if (!signedOrDeclinedTodayYearContract && !signedOrDeclinedNextYearContract) {
        defaultSelectYear[ContractBtnType.CUSTOMER_DECLINED] = {
            checkedYear: currentYear,
            disabledYear: ''
        }
    } else if (!signedOrDeclinedTodayYearContract) {
        defaultSelectYear[ContractBtnType.CUSTOMER_DECLINED] = {
            checkedYear: currentYear,
            disabledYear: nextYear
        }
    } else if (!signedOrDeclinedNextYearContract) {
        defaultSelectYear[ContractBtnType.CUSTOMER_DECLINED] = {
            checkedYear: nextYear,
            disabledYear: currentYear
        }
    }

    // New btn Select year logic
    if (!signedTodayYearContract && !signedNextYearContract) {
        defaultSelectYear[ContractBtnType.START_NEW_CDA] = {
            checkedYear: calculateSelectYearModalLogic(publishThisYear, publishNextYear).tempCheckedYear,
            disabledYear: calculateSelectYearModalLogic(publishThisYear, publishNextYear).tempDisabledYear
        }
    } else if (!signedTodayYearContract) {
        if (publishThisYear) {
            defaultSelectYear[ContractBtnType.START_NEW_CDA] = {
                checkedYear: currentYear,
                disabledYear: nextYear
            }
        }
    } else if (!signedNextYearContract) {
        if (publishNextYear) {
            defaultSelectYear[ContractBtnType.START_NEW_CDA] = {
                checkedYear: nextYear,
                disabledYear: currentYear
            }
        }
    }

    return defaultSelectYear
}

const handleBtnLogic = (
    contract: any,
    setDisableDeclineButton: Dispatch<SetStateAction<boolean>>,
    dispatch: any,
    customerDetail: string
) => {
    const locationId = customerDetail['Account.LOC_PROD_ID__c']

    const routeQuery = `SELECT Id,Location_Group_Current_Year_Name__c,Location_Group_Next_Year_Name__c,Current_Year_Status__c,Next_Year_Status__c
    FROM Route_Sales_Geo__c
    WHERE Operational_Location__c = true AND HRCHY_LVL__c ='Location' AND SLS_UNIT_ID__c ='${locationId}' AND (Current_Year_Status__c = 'Published' OR Next_Year_Status__c = 'Published') `

    syncDownObj('Route_Sales_Geo__c', routeQuery, false)
        .then((locationRes) => {
            const locations = locationRes?.data || []

            const publishThisYear =
                locations.find((location) => location.Current_Year_Status__c === 'Published') !== undefined
            const publishNextYear =
                locations.find((location) => location.Next_Year_Status__c === 'Published') !== undefined
            const contracts: contractData[] = contract.data.records

            if (contract.data.records.length > 0) {
                let inProgressContract = false
                let signedTodayYearContract = false
                let signedNextYearContract = false
                let signedOrDeclinedTodayYearContract = false
                let signedOrDeclinedNextYearContract = false

                contracts.forEach((contractItem) => {
                    if (contractItem.Contract_Status__c === ContractStatus.InProgress) {
                        inProgressContract = true
                    }
                    if (contractItem.CDA_Year__c === currentYear) {
                        if (contractItem.Contract_Status__c === ContractStatus.Signed) {
                            signedTodayYearContract = true
                        }
                        if (
                            contractItem.Contract_Status__c === ContractStatus.Signed ||
                            contractItem.Contract_Status__c === ContractStatus.Declined
                        ) {
                            signedOrDeclinedTodayYearContract = true
                        }
                    }
                    if (contractItem.CDA_Year__c === nextYear) {
                        if (contractItem.Contract_Status__c === ContractStatus.Signed) {
                            signedNextYearContract = true
                        }
                        if (
                            contractItem.Contract_Status__c === ContractStatus.Signed ||
                            contractItem.Contract_Status__c === ContractStatus.Declined
                        ) {
                            signedOrDeclinedNextYearContract = true
                        }
                    }
                })

                if (inProgressContract || (signedTodayYearContract && signedNextYearContract)) {
                    dispatch(setDisableNewButton(true))
                } else {
                    if (!inProgressContract) {
                        if (!signedTodayYearContract && !signedNextYearContract) {
                            dispatch(setDisableNewButton(!(publishThisYear || publishNextYear)))
                        } else if (!signedTodayYearContract) {
                            dispatch(setDisableNewButton(!publishThisYear))
                        } else if (!signedNextYearContract) {
                            dispatch(setDisableNewButton(!publishNextYear))
                        }
                    }
                }

                // Decline button logic
                setDisableDeclineButton(
                    inProgressContract || (signedOrDeclinedTodayYearContract && signedOrDeclinedNextYearContract)
                )

                // Decline btn and New btn select year logic
                const defaultSelectYear = handleSelectYearData(
                    signedOrDeclinedTodayYearContract,
                    signedOrDeclinedNextYearContract,
                    signedTodayYearContract,
                    signedNextYearContract,
                    publishThisYear,
                    publishNextYear
                )

                dispatch(updateDefaultYearAction(defaultSelectYear))
            } else {
                dispatch(
                    updateDefaultYearAction({
                        [ContractBtnType.START_NEW_CDA]: {
                            checkedYear: calculateSelectYearModalLogic(publishThisYear, publishNextYear)
                                .tempCheckedYear,
                            disabledYear: calculateSelectYearModalLogic(publishThisYear, publishNextYear)
                                .tempDisabledYear
                        },
                        [ContractBtnType.CUSTOMER_DECLINED]: {
                            checkedYear: currentYear,
                            disabledYear: ''
                        }
                    })
                )
                dispatch(setDisableNewButton(!(publishThisYear || publishNextYear)))
                setDisableDeclineButton(false)
            }
        })
        .catch((error) => {
            dispatch(setDisableNewButton(true))
            storeClassLog(
                Log.MOBILE_ERROR,
                'CDA_handleBtnLogic',
                `Fetch Route_Sales_Geo__c Object failure' ${ErrorUtils.error2String(error)}`
            )
        })
}

export type contractData = {
    Id: string
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    CDA_Year__c: string
    Contract_Status__c: 'Signed' | 'In progress' | 'Cancelled' | 'Declined' // Not include unused status
    Signed_Medal_Tier__c: string
    StartDate: string
    EndDate: string
    CreatedDate: string
    Draft_Survey_Step__c: StepVal
    Agreement_Type__c: string
    Account_Paid__c: string
    AccountId: string
    Status: string
    CDA_Visit__c: string
    Sharepoint_URL__c: string | null
    RecordType: {
        Name: ContractRecordTypeName
    } | null
    CreatedBy: {
        Name: string
    }
    CustomerSignedName__c: string | null
    CustomerSignedTitle: string | null
    Description: string | null
    CompanySigned: {
        Name: string
    } | null
    RecordTyspeId: string
    CDA_Reset_Visit__c: string
    resetVisitObj: any
    CDA_Space_Checkbox__c: boolean
    Name: string
}

export interface ShellSheetData {
    Id: string
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    Image_Link__c: string | null
    TARGET_NAME__c: string | null
    /* eslint-enable camelcase */
}
export interface PogData {
    fileName: string | null
    link: string | null
}
export interface MissionMdtData {
    Id: string
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    Mission_Name__c?: string | null
    Mission_Type__c?: string | null
    Country__c?: string | null
    Mission_Division__c?: string | null
    Mission_Id_Value__c?: string | null
}
function filterAndSortData(contractArr = [] as contractData[], resetVisitArr: any[] = [], auditVisitArr: any[] = []) {
    const [currentArr, futureArr, historyArr]: contractData[][] = [[], [], []]
    const [auditCurrentArr, auditHistoryArr]: any[][] = [[], []]
    let isPostAuditDisabled = true
    let isGeneralAuditDisabled = false
    let isPostAuditTips = false
    let auditValidContract = ''
    let auditValidResetVisit = false
    const time = moment().startOf('day').toDate()
    const today = time.getTime()
    const [thisYear, nextYear] = [time.getFullYear(), time.getFullYear() + 1]
    contractArr.forEach((i) => {
        const [startDate, endDate] = [moment(i.StartDate).valueOf(), moment(i.EndDate).valueOf()]
        const CDAYear = parseInt(i.CDA_Year__c || '0')
        const resetVisitObj = resetVisitArr.find((elem) => elem.Id === i.CDA_Reset_Visit__c)
        const contractType = i.RecordType ? i.RecordType?.Name : ''
        i.resetVisitObj = resetVisitObj
        if (i.Contract_Status__c === 'Signed') {
            if (
                startDate <= today &&
                endDate >= today &&
                contractType === ContractRecordTypeName.RetailContracts &&
                !_.isEmpty(i.CDA_Visit__c)
            ) {
                auditValidContract = i.Id
                if (_.isEmpty(i.CDA_Reset_Visit__c)) {
                    auditValidResetVisit = true
                } else {
                    if (resetVisitObj && resetVisitObj.Status__c === VisitStatus.COMPLETE) {
                        auditValidResetVisit = true
                    }
                }
            }

            if (startDate > today) {
                return futureArr.push(i)
            }
            if (endDate < today) {
                return historyArr.push(i)
            }
            if (startDate <= today && endDate >= today) {
                return currentArr.push(i)
            }
        }
        if (i.Contract_Status__c === ContractStatus.InProgress) {
            return futureArr.push(i)
        }
        if (i.Contract_Status__c === ContractStatus.Cancelled) {
            return historyArr.push(i)
        }
        if (i.Contract_Status__c === ContractStatus.Declined) {
            if (CDAYear === thisYear) {
                return currentArr.push(i)
            }
            if (CDAYear === nextYear) {
                return futureArr.push(i)
            }
            if (CDAYear < thisYear) {
                // Any year before this year will be added to history
                return historyArr.push(i)
            }
        }
    })
    const completePostContractAudit = auditVisitArr.some(
        (elem) =>
            elem.Visit_Subtype__c === VisitSubType.POST_CONTRACT_AUDIT &&
            elem.Status__c === VisitStatus.COMPLETE &&
            auditValidContract &&
            auditValidContract === elem.CDA_Contract__c
    )
    isPostAuditTips = !completePostContractAudit && !!(auditValidContract && auditValidResetVisit)
    auditVisitArr.forEach((elem) => {
        const isInProgress = elem.Status__c !== VisitStatus.COMPLETE
        const isGeneralAudit = elem.Visit_Subtype__c === VisitSubType.GENERAL_AUDIT
        elem.contractObj = contractArr.find(
            (elemContract) => !!elem.CDA_Contract__c && elemContract.Id === elem.CDA_Contract__c
        )
        if (isInProgress) {
            if (isGeneralAudit) {
                isGeneralAuditDisabled = true
            }
            auditCurrentArr.push(elem)
        } else {
            auditHistoryArr.push(elem)
        }
    })
    // Check for POST_CONTRACT_AUDIT for inprogress future Deployment User
    const haveInprogressPostContractAudit = auditCurrentArr.some(
        (elem) => elem.Visit_Subtype__c === VisitSubType.POST_CONTRACT_AUDIT
    )
    // Button light logic postAudit without Inprogress + with qualified contract + with qualified reset visit
    isPostAuditDisabled = !(auditValidContract && auditValidResetVisit && !haveInprogressPostContractAudit)
    historyArr.sort((a, b) => {
        const [aEndDate, bEndDate] = [new Date(a.EndDate || 0).getTime(), new Date(b.EndDate || 0).getTime()]
        if (aEndDate === bEndDate) {
            const [aStartDate, bStartDate] = [
                new Date(a.StartDate || 0).getTime(),
                new Date(b.StartDate || 0).getTime()
            ]
            return bStartDate - aStartDate
        }
        return bEndDate - aEndDate
    })
    return {
        currentArr,
        futureArr,
        historyArr,
        auditCurrentArr,
        auditHistoryArr,
        isPostAuditDisabled,
        isGeneralAuditDisabled,
        auditValidContract,
        isPostAuditTips
    }
}

export const getCountryLabel = (retailStoreObj: any, US: string, CA: string) => {
    let country = ''
    if (retailStoreObj?.CountryCode === CountryType.US) {
        country = US
    } else if (retailStoreObj?.CountryCode === CountryType.CA) {
        country = CA
    }
    return country
}

export const useCDABtnVisible = (retailStore: any) => {
    const customerUniqId = retailStore?.['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c

    const [cdaBtnVisible, setCdaBtnVisible] = useState(false)
    useEffect(() => {
        restDataCommonCall(
            `query/?q=
        SELECT Id
        From Account
        WHERE CUST_UNIQ_ID_VAL__c = '${customerUniqId}'
        AND isCDACustomer__c = true
        AND IsOTSFoodService__c = false
        `,
            'GET'
        )
            .then((res) => {
                !_.isEmpty(res?.data?.records) && setCdaBtnVisible(true)
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'useEnabledCDABtn', ErrorUtils.error2String(err))
            })
    }, [retailStore])
    return cdaBtnVisible
}

export const useContractTab = (
    retailStore: any,
    readonly: boolean,
    refreshFlag: number | undefined,
    dropDownRef: any,
    isFocused: boolean
) => {
    const [disableDeclineButton, setDisableDeclineButton] = useState(true)
    const [isPotentialCDACustomer, setIsPotentialCDACustomer] = useState(true)
    const [locProdId, setLocProdId] = useState('')
    const [contractArr, setContractArr] = useState(filterAndSortData)
    const {
        currentArr,
        futureArr,
        historyArr,
        auditCurrentArr,
        auditHistoryArr,
        isPostAuditDisabled,
        isGeneralAuditDisabled,
        auditValidContract,
        isPostAuditTips
    } = contractArr
    const [missionArr, setMissionArr] = useState<MissionMdtData[]>([])
    const [postMissionId, setPostMissionId] = useState<string | null>(null)
    const dispatch = useDispatch()

    useEffect(() => {
        const customerUniqId = retailStore?.['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c
        const retailStoreId = retailStore?.Id || ''
        if (customerUniqId) {
            const contractSql = `query/?q=
            SELECT Id, Status, Contract_Status__c,CDA_Year__c, CDA_Reset_Visit__c, Name,
            Signed_Medal_Tier__c,StartDate, EndDate,CreatedDate,Agreement_Type__c, CreatedBy.Name,
            Account_Paid__c,Draft_Survey_Step__c,CDA_Visit__c, Sharepoint_URL__c, RecordType.Name,
            CustomerSignedName__c, CustomerSignedTitle, CompanySigned.Name, Description, CDA_Space_Checkbox__c 
            from Contract`
            const visitSql = `query/?q=SELECT ${getAllFieldsByObjName('Visit').join(
                ', '
            )}, CDA_Audit_Sharepoint_URL__c, CDA_Compliance__c, CDA_Contract__c, CreatedBy.Name from Visit`
            const queryContract = `${contractSql} WHERE Account.CUST_UNIQ_ID_VAL__c ='${encodeURIComponent(
                customerUniqId
            )}'`
            const queryResetVisit = `${visitSql} WHERE id in (select CDA_Reset_Visit__c from Contract WHERE Account.CUST_UNIQ_ID_VAL__c ='${encodeURIComponent(
                customerUniqId
            )}') and Status__c != '${VisitStatus.REMOVED}'`
            const visitStatusArr = [
                VisitStatus.COMPLETE,
                VisitStatus.IN_PROGRESS,
                VisitStatus.IR_PROCESSING,
                VisitStatus.PENDING_REVIEW
            ]
            const queryAuditVisit = `${visitSql} WHERE Retail_Store__c = '${retailStoreId}' AND Visit_Subtype__c IN ('${
                VisitSubType.POST_CONTRACT_AUDIT
            }', '${VisitSubType.GENERAL_AUDIT}') AND Status__c IN ('${visitStatusArr.join(
                "', '"
            )}') ORDER BY LastModifiedDate DESC`
            const queryMission = `query/?q=SELECT Id, Mission_Name__c, Mission_Type__c, Country__c,Mission_Id_Value__c, Mission_Division__c FROM Mission_Id__mdt `
            Promise.all([
                restDataCommonCall(queryContract, 'GET'),
                restDataCommonCall(queryResetVisit, 'GET'),
                compositeCommonCall(
                    [
                        {
                            method: 'GET',
                            url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id, CountryCode, Account.LOC_PROD_ID__c FROM RetailStore WHERE Id='${retailStore?.Id}'`,
                            referenceId: 'refRetailStore'
                        },
                        {
                            method: 'GET',
                            url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Division__c FROM Route_Sales_Geo__c
                            WHERE SLS_UNIT_ID__c = '@{refRetailStore.records[0].Account.LOC_PROD_ID__c}'
                            AND SLS_UNIT_ACTV_FLG_VAL__c = 'ACTIVE'
                            AND Operational_Location__c = TRUE
                            AND HRCHY_LVL__c = 'Location'
                            AND RecordType.Name = 'Sales Unit'
                            `,
                            referenceId: 'refRSG'
                        }
                    ],
                    { allOrNone: false }
                ),
                restDataCommonCall(queryMission, 'GET'),
                restDataCommonCall(queryAuditVisit, 'GET')
            ])
                .then((results) => {
                    const contract = results[0]
                    const resetVisits = results[1]
                    const auditVisits = results[4]?.data?.records || []
                    const retailStoreObj = results[2].data.compositeResponse[0].body.records[0]
                    const division = results[2].data.compositeResponse[1].body.records?.[0]?.Division__c || ''
                    setLocProdId(retailStoreObj?.Account?.LOC_PROD_ID__c || '')

                    const missionTableData: MissionMdtData[] = results[3].data?.records as unknown as MissionMdtData[]
                    const generalMissionList = !_.isEmpty(division)
                        ? _.chain(missionTableData)
                              .filter((elem) => {
                                  return (
                                      elem.Mission_Division__c === division &&
                                      elem.Mission_Type__c === MissionType.MISSION_GENERAL_AUDIT
                                  )
                              })
                              .orderBy('Mission_Name__c', 'asc')
                              .value()
                        : ([] as MissionMdtData[])
                    setMissionArr(generalMissionList)

                    const postMissionIdObj = missionTableData.find(
                        (item: MissionMdtData) =>
                            item.Mission_Division__c === division &&
                            item.Mission_Type__c === MissionType.MISSION_POST_CDA_AUDIT
                    )
                    const extractedMissionId = postMissionIdObj?.Mission_Id_Value__c || ''
                    setPostMissionId(extractedMissionId)

                    setContractArr(
                        filterAndSortData(
                            contract?.data?.records as unknown as contractData[],
                            resetVisits?.data?.records as unknown as any[],
                            auditVisits
                        )
                    )
                    setIsPotentialCDACustomer(contract?.data?.records.length === 0)
                    if (readonly) {
                        setDisableDeclineButton(true)
                        dispatch(setDisableNewButton(true))
                    } else {
                        handleBtnLogic(contract, setDisableDeclineButton, dispatch, retailStore, dropDownRef)
                    }
                })
                .catch((err) => {
                    setDisableDeclineButton(true)
                    dispatch(setDisableNewButton(true))
                    setContractArr(filterAndSortData())
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'retrieve contract data failed',
                        `retrieve contract data failed:` + ErrorUtils.error2String(err)
                    )
                })
        }
    }, [retailStore, readonly, refreshFlag, isFocused])

    return {
        currentArr,
        futureArr,
        historyArr,
        isPotentialCDACustomer,
        disableDeclineButton,
        missionArr,
        auditCurrentArr,
        auditHistoryArr,
        isPostAuditDisabled,
        isGeneralAuditDisabled,
        auditValidContract,
        isPostAuditTips,
        locProdId,
        postMissionId
    }
}

export interface StartDataProps {
    customerDetail: object
    checkedYear: string
    dropDownRef: any
    pepsicoCalendar: any[]
    dispatch: any
    surveyQuestions: typeof initSurveyQuestions
    buttonClicked: string
    visitId: string
    setIsLoading: any
    setFormStatus: Dispatch<SetStateAction<FormStatus>>
}
export const getLocationGroupQuery = (locationId: string, isThisYear: boolean) => `
        SELECT Id
        ,SLS_UNIT_NM__c,Parent_Node__r.SLS_UNIT_NM__c,Parent_Node__r.Parent_Node__r.SLS_UNIT_NM__c
        ${isThisYear ? ',Location_Group_Current_Year_Name__c' : ',Location_Group_Next_Year_Name__c'}
        FROM Route_Sales_Geo__c
        WHERE Operational_Location__c = true
            AND HRCHY_LVL__c ='Location'
            AND SLS_UNIT_ID__c ='${locationId}'
            ${isThisYear ? "AND Current_Year_Status__c = 'Published'" : "AND Next_Year_Status__c = 'Published'"}
        `
const getSpecialTermsQuery = (Id: string) => `
        SELECT SpecialTerms 
        FROM Contract 
        WHERE Id='${Id}' 
        `
export const getLocationGroupName = (locationId: string, checkedYear: string) => {
    const isThisYear = checkedYear === getCurrentOrNextYear().currentYear

    return syncDownObj(
        'Route_Sales_Geo__c',
        encodeURIComponent(getLocationGroupQuery(locationId, isThisYear)),
        false
    ).then(
        (locationRes) =>
            new Promise((resolve, reject) => {
                if (locationRes.data.length > 0) {
                    // eslint-disable-next-line camelcase
                    const location = locationRes.data[0] as {
                        // Salesforce API Name
                        // eslint-disable-next-line camelcase
                        Location_Group_Current_Year_Name__c: string
                        // Salesforce API Name
                        // eslint-disable-next-line camelcase
                        Location_Group_Next_Year_Name__c: string
                    }
                    resolve(
                        checkedYear === getCurrentOrNextYear().currentYear
                            ? location.Location_Group_Current_Year_Name__c
                            : location.Location_Group_Next_Year_Name__c
                    )
                } else {
                    reject(locationRes)
                }
            })
    )
}
export const getBackendVisitStatus = async (visitId: string, setVisitBackendStatus: any) => {
    try {
        const res = await syncDownObj('Visit', `SELECT Id,Status__c FROM Visit where Id= '${visitId}'`)
        setVisitBackendStatus(res.data[0].Status__c)
    } catch (err) {
        setVisitBackendStatus(VisitStatus.IN_PROGRESS)
        storeClassLog(Log.MOBILE_ERROR, 'getBackendVisitStatus', 'Get Status__c failed' + JSON.stringify(err))
    }
}
export const useDisableSave = (
    surveyQuestions: typeof initSurveyQuestions,
    activeStep: StepVal[keyof StepVal],
    ifShowLocationGroup: undefined | boolean,
    visitStatus: string
) => {
    const [disable, setDisable] = useState(true)
    const timeErrMsg = useSelector((state: any) => state.contractReducer.timeErrMsg)

    useEffect(() => {
        if (activeStep === StepVal.ONE) {
            const judgmentEmptyData = (surveyQuestions: typeof initSurveyQuestions) => {
                return !surveyQuestions.StartDate || !surveyQuestions.EndDate
            }

            const isStartDateGreaterEndDate = moment(surveyQuestions.StartDate).isAfter(moment(surveyQuestions.EndDate))

            setDisable(
                _.isEmpty(surveyQuestions.Account_Paid__c) ||
                    _.isEmpty(surveyQuestions.Agreement_Type__c) ||
                    judgmentEmptyData(surveyQuestions) ||
                    isStartDateGreaterEndDate ||
                    !!timeErrMsg
            )
        }
        const isCurrentStepTwo = activeStep === StepVal.TWO

        if (isCurrentStepTwo) {
            const isDoorSurveyAnswered = surveyQuestions[AssessmentIndicators.DOOR_SURVEY]
            const isTotalLrbShelvesAnswered = surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES]
            const isTotalLrbPepsiShelvesAnswered = surveyQuestions[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]

            const areAllQuestionsAnswered =
                isDoorSurveyAnswered && isTotalLrbShelvesAnswered && isTotalLrbPepsiShelvesAnswered

            const isFormButtonClicked =
                visitStatus === VisitStatus.IR_PROCESSING || visitStatus === VisitStatus.PENDING_REVIEW
                    ? true
                    : surveyQuestions.formButtonClicked
            setDisable(!(areAllQuestionsAnswered && isFormButtonClicked))
        }

        if (activeStep === StepVal.THREE) {
            let isDisable = false
            if (!surveyQuestions.Signed_Medal_Tier__c) {
                isDisable = true
            }
            if (
                !surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] ||
                !surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]
            ) {
                isDisable = true
            }
            if (surveyQuestions.CDA_Space_Checkbox__c || ifShowLocationGroup) {
                if (!surveyQuestions[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]) {
                    isDisable = true
                }
                if (!surveyQuestions[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]) {
                    isDisable = true
                }
            }
            setDisable(isDisable)
        }
    }, [surveyQuestions, activeStep])

    return { disable }
}

export const useNextStepsDisableSave = (nextStepsActiveStep: StepVal[keyof StepVal]) => {
    const [nextStepDisable, setDisable] = useState(true)

    useEffect(() => {
        if (nextStepsActiveStep === StepVal.ONE) {
            setDisable(true)
        }

        if (nextStepsActiveStep === StepVal.TWO) {
            setDisable(true)
        }

        if (nextStepsActiveStep === StepVal.THREE) {
            setDisable(false)
        }
    }, [nextStepsActiveStep])

    return { nextStepDisable }
}

export const presentStepQueries = {
    getShowCheckBoxValueQuery: (locationGroupName: string, checkedYear: string) => `
        SELECT
            TARGET_NAME__c,
            SUBTYPE__c,
            TYPE__c,
            VALUE_TYPE__c,
            VALUE__c
        FROM Targets_Forecasts__c
        WHERE TARGET_ID__c = '${locationGroupName}'
            AND TYPE__c = 'Overview'
            AND UNIT__c = 'Retail'
            AND Sub_Target_ID__c = '${checkedYear}'
            AND Status__c = 'Published'`,
    getColdVaultQuery: (locationGroupName: string, checkedYear: string) => `
        SELECT
            TARGET_NAME__c,
            SUBTYPE__c,
            TYPE__c,
            VALUE_TYPE__c,
            VALUE__c
        FROM Targets_Forecasts__c
        WHERE TARGET_ID__c = '${locationGroupName}'
            AND TYPE__c IN ('Overview', 'Space Requirements')
            AND UNIT__c = 'Retail'
            AND Sub_Target_ID__c = '${checkedYear}'
            AND Status__c = 'Published'`,
    getExecutionQuery: (locationGroupName: string, checkedYear: string) => `
        SELECT
            TARGET_NAME__c,
            VALUE_TYPE__c,
            Sub_Target_Name__c,
            VALUE__c,
            CDA_Admin_Display_Order__c
        FROM Targets_Forecasts__c
        WHERE TARGET_ID__c = '${locationGroupName}'
        AND TYPE__c = 'Equipment %26 Displays'
        AND UNIT__c = 'Retail'
        AND VALUE_TYPE__c IN ('Equipment', 'Display')
        AND Sub_Target_ID__c = '${checkedYear}'
        AND Status__c = 'Published'`, // TYPE__c = 'Equipment %26 Displays' 'Equipment & Displays'
    getPresentOtherQuery: (locationGroupName: string, checkedYear: string, Contract_Status__c: string) => `
        SELECT
            Id,
            VALUE__c,
            VALUE_TYPE__c,
            EDV__c,
            DNP__c,
            CDA_Admin_Display_Order__c,
            Image_Link__c,
            SUBTYPE__c,
            Rewards_Description__c,
            TARGET_NAME__c,
            Sub_target_name__c,
            TYPE__c,
            Model__c,
            FREQ_TYPE__c,
            Status__c
        FROM Targets_Forecasts__c
        WHERE TYPE__c IN ('Rewards', 'Sell Sheet', 'Funding Packages')
            AND TARGET_ID__c = '${locationGroupName}'
            AND UNIT__c = 'Retail'
            ${
                Contract_Status__c === ContractStatus.Signed
                    ? "AND Status__c IN ('Published', 'Deactivated')"
                    : "AND Status__c = 'Published'"
            }
            AND Sub_Target_ID__c = '${checkedYear}'`,
    getFundingPackagesQuery: (locationGroupName: string, checkedYear: string) =>
        `SELECT Sub_Target_Name__c, CDA_Admin_Display_Order__c, SUBTYPE__c FROM Targets_Forecasts__c WHERE TYPE__c = 'Funding Packages' AND TARGET_ID__c = '${locationGroupName}' AND UNIT__c = 'Retail' AND Status__c = 'Published' AND SUBTYPE__c IN ('${SubType.MEDAL}', '${MedalSubType.BASIC}') AND Sub_Target_ID__c = '${checkedYear}'`,
    getRetailVisitKpiQuery: (visitId: string) =>
        `SELECT Id, ActualLongStringValue__c FROM RetailVisitKpi WHERE VisitId = '${visitId}' AND AssessmentTask.AssessmentTaskDefinition.Name = 'Pre Contract Space Review (User)' AND AssessmentIndDefinition.Name = 'Truck Volume'`
}

export const showNoTierMatchAlert = () =>
    Alert.alert(t.labels.PBNA_MOBILE_NO_VISIBLE_TIER_MATCH_TITLE, t.labels.PBNA_MOBILE_NO_VISIBLE_TIER_MATCH_BODY)

export interface ExecutionAndDiscountData {
    id: string
    kpiName: string
    order: string
    // eslint-disable-next-line camelcase
    VALUE_TYPE__c: string
    kpiRequirements: {}
}
export interface EstimatedData {
    id: string
    kpiName: string
    kpiRequirements: {}
}

export const getPresentData = async (
    locationId: string,
    checkedYear: string,
    visitId: string,
    contractId: string,
    Contract_Status__c: string
) => {
    const isThisYear = checkedYear === getCurrentOrNextYear().currentYear
    const groupField = isThisYear ? 'Location_Group_Current_Year_Name__c' : 'Location_Group_Next_Year_Name__c'
    const compositeCommonCallPromise = compositeCommonCall([
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getLocationGroupQuery(locationId, isThisYear)}`,
            referenceId: 'refLocationGroup'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getColdVaultQuery(
                `@{refLocationGroup.records[0].${groupField}}`,
                checkedYear
            )}`,
            referenceId: 'refColdVault'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getExecutionQuery(
                `@{refLocationGroup.records[0].${groupField}}`,
                checkedYear
            )}`,
            referenceId: 'refExecution'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getPresentOtherQuery(
                `@{refLocationGroup.records[0].${groupField}}`,
                checkedYear,
                Contract_Status__c
            )}`,
            referenceId: 'refOther'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getRetailVisitKpiQuery(
                visitId
            )}`,
            referenceId: `refRetailVisitKpi`
        }
    ])
    const getCDAOverviewPromise = async (locationId: string, contactId: string) => {
        return restApexCommonCall(
            `/${CommonApi.PBNA_MOBILE_API_PRESENT_VISIT}?contractId=${contactId}&locationId=${locationId}`,
            'GET'
        )
    }
    const [compositeCommonCallResult, getCDAOverviewResult] = await Promise.all([
        compositeCommonCallPromise,
        getCDAOverviewPromise(locationId, contractId)
    ])
    return [compositeCommonCallResult, getCDAOverviewResult]
}

const getNextStepData = async (locationId: string, checkedYear: string) => {
    const isThisYear = checkedYear === getCurrentOrNextYear().currentYear
    return await compositeCommonCall([
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getLocationGroupQuery(locationId, isThisYear)}`,
            referenceId: 'refLocationGroup'
        }
    ])
}

export interface ResExecutionData {
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    Sub_Target_Name__c: string | null
    // eslint-disable-next-line camelcase
    VALUE_TYPE__c: string | null
    // eslint-disable-next-line camelcase
    TARGET_NAME__c: string | null
    // eslint-disable-next-line camelcase
    VALUE__c: string | null
    // eslint-disable-next-line camelcase
    CDA_Admin_Display_Order__c: string | null
    /* eslint-enable camelcase */
}
export const initColdVaultData = {
    MedalOverview: [],
    BasicOverview: [],
    SpaceRequirements: {} as { [k: string]: string | null }
}

interface RetailVisitKpiData {
    // A => stands for API call
    A: string
    // G => Volume growth
    G: string
    // M => stands for medal, we display T (i.e true) or F (i.e. false) based on whether it is a medal or basic package
    M: string
    // P => stands for package name
    P: string
    // U => user volume
    U: string
}

export const usePresentData = (
    locationId: string,
    checkedYear: string,
    dropDownRef: any,
    surveyQuestions: typeof initSurveyQuestions,
    visitId: string,
    contractId: string
) => {
    const dispatch = useDispatch()
    const tierData = useSelector((state: any) => state.contractReducer.tierData)
    const [discountData, setDiscountData] = useState<ExecutionAndDiscountData[]>([])
    const [rewardsData, setRewardsData] = useState<RewardData[]>([])
    const [shellSheetsData, setShellSheetsData] = useState<ShellSheetData[]>([])
    const [coldVaultData, setColdVaultData] = useState(initColdVaultData)
    const setTierStatus = (index: number) => {
        if (tierData.filter((tier: TierDataObj) => tier.select).length === 5) {
            if (tierData[index].select === false) {
                return
            }
        }
        tierData[index].select = !tierData[index].select
        dispatch(setTierData([...tierData]))
    }

    const autoSelectTier = () => {
        const calculatePercentage = _.round(
            (Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE] || -Infinity) /
                Number(surveyQuestions[AssessmentIndicators.TOTAL_LRB_SHELVES])) *
                PercentageEnum.ONE_HUNDRED,
            1
        )
        const percentage =
            Number(surveyQuestions[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]) ||
            calculatePercentage ||
            -Infinity
        const enabledTierReverse = tierData
            .filter((tier: TierDataObj) => tier.select)
            .map((tier: TierDataObj) => tier.name)
            .reverse()

        let [highestTierRequirements, toSelectedTier] = [-Infinity, '']
        const noRequirementTier = [] // To store tier spaceRequirement equals 0
        for (const tier of enabledTierReverse) {
            if (coldVaultData.SpaceRequirements[tier] === '0') {
                noRequirementTier.push(tier)
                continue
            }
            const tierRequirements = _.round(Number(coldVaultData.SpaceRequirements[tier]) * 100, 1)
            if (percentage >= tierRequirements) {
                if (tierRequirements > highestTierRequirements) {
                    // if requirements is same, lower tier is prior
                    highestTierRequirements = tierRequirements
                    toSelectedTier = tier
                }
            }
        }
        if (noRequirementTier.length && !toSelectedTier) {
            noRequirementTier.sort(
                (a, b) =>
                    medalOrderWithoutBasic.findIndex((i) => i === a) - medalOrderWithoutBasic.findIndex((i) => i === b)
            )
            toSelectedTier = noRequirementTier.pop() as string
        }
        const newSurveyQuestions = {
            ...surveyQuestions,
            Signed_Medal_Tier__c: toSelectedTier,
            SelectRewards: checkIsChangedMedalTierType(surveyQuestions, toSelectedTier)
                ? {}
                : surveyQuestions.SelectRewards
        }
        dispatch(setSurveyQuestions(newSurveyQuestions))
        !toSelectedTier && showNoTierMatchAlert()
    }

    const backfillSignedMedalTierWhenEditing = (tempTierData: { name: any; select: boolean }[]) => {
        const signedMedalTier = surveyQuestions.Signed_Medal_Tier__c
        if (signedMedalTier) {
            const signedMedalTierIndex = tempTierData.findIndex(
                (tier: { name: any; select: boolean }) => tier.name === signedMedalTier && tier.select === false
            )
            if (signedMedalTierIndex !== IndexEnum.MINUS_ONE) {
                //  Add if not selected
                tempTierData[signedMedalTierIndex].select = true

                // Add more than 5 and then delete the excess
                const filteredSelectedList = tempTierData.filter((tier) => tier.select === true)

                if (filteredSelectedList.length > IndexEnum.FIVE) {
                    const findSignedMedalIndexInDisplayList = filteredSelectedList.findIndex(
                        (tier: { name: any; select: boolean }) => tier.name === signedMedalTier
                    )
                    if (findSignedMedalIndexInDisplayList === IndexEnum.ZERO) {
                        const findLastSelectedItemIndex = tempTierData.findIndex(
                            (tier) =>
                                tier.name === filteredSelectedList[filteredSelectedList.length - IndexEnum.ONE].name
                        )
                        if (findLastSelectedItemIndex !== IndexEnum.MINUS_ONE) {
                            tempTierData[findLastSelectedItemIndex].select = false
                        }
                    } else {
                        const findFirstSelectedItemIndex = tempTierData.findIndex(
                            (tier) => tier.name === filteredSelectedList[IndexEnum.ZERO].name
                        )
                        if (findFirstSelectedItemIndex !== IndexEnum.MINUS_ONE) {
                            tempTierData[findFirstSelectedItemIndex].select = false
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        locationId &&
            checkedYear &&
            visitId &&
            contractId &&
            getPresentData(locationId, checkedYear, visitId, contractId, surveyQuestions.Contract_Status__c)
                .then((res) => {
                    if (res[0].data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                        throw Error(ErrorUtils.error2String(res[0].data))
                    }
                    dispatch(setEvaluationReferenceData(res))
                    const groupedData: any[] = res[0].data.compositeResponse[3].body.records
                    const [resMedalDiscount, resBasicDiscount, resRewards, resSellSheets] = [
                        [] as any[],
                        [] as any[],
                        [] as RewardData[],
                        [] as ShellSheetData[]
                    ]
                    const retailVisitKpiObj: any =
                        res[0].data.compositeResponse[4].body.records &&
                        res[0].data.compositeResponse[4].body.records.length > 0
                            ? res[0].data.compositeResponse[4].body.records[0]
                            : {}
                    for (const datum of groupedData) {
                        switch (datum.TYPE__c) {
                            case DatumType.FUNDING_PACKAGES:
                                if (datum.Status__c !== TFStatus.Deactivated) {
                                    if (datum.SUBTYPE__c === MedalSubType.MEDAL) {
                                        resMedalDiscount.push(datum)
                                    }
                                    if (datum.SUBTYPE__c === MedalSubType.BASIC) {
                                        resBasicDiscount.push(datum)
                                    }
                                }
                                continue
                            case DatumType.REWARDS:
                                resRewards.push(datum)
                                continue
                            case DatumType.SELL_SHEET:
                                if (datum.Status__c !== TFStatus.Deactivated) {
                                    resSellSheets.push(datum)
                                }
                                continue
                            default:
                                continue
                        }
                    }
                    // Discount Logic
                    const discount: ExecutionAndDiscountData[] = []
                    const estimated: EstimatedData[] = []
                    const svsDataObjs: RetailVisitKpiData[] = retailVisitKpiObj.ActualLongStringValue__c
                        ? (JSON.parse(retailVisitKpiObj.ActualLongStringValue__c) as RetailVisitKpiData[])
                        : []

                    resMedalDiscount.sort(
                        (a, b) => Number(a.CDA_Admin_Display_Order__c) - Number(b.CDA_Admin_Display_Order__c)
                    )
                    resBasicDiscount.sort(
                        (a, b) => Number(a.CDA_Admin_Display_Order__c) - Number(b.CDA_Admin_Display_Order__c)
                    )
                    resMedalDiscount.concat(resBasicDiscount).forEach((data) => {
                        const index = discount.findIndex(
                            (i) => i.id.toLocaleUpperCase() === data.Sub_Target_Name__c.toLocaleUpperCase()
                        )
                        const subType = data.SUBTYPE__c === MedalSubType.MEDAL ? BooleanEnum.TRUE : BooleanEnum.FALSE
                        const svsObj = svsDataObjs.find((a) => a.P === data.Sub_Target_Name__c && a.M === subType)
                        if (index !== -1) {
                            if (data.SUBTYPE__c === SubType.MEDAL) {
                                discount[index].id = data.Sub_Target_Name__c
                                discount[index].kpiName = data.Sub_Target_Name__c
                                discount[index].order = data.CDA_Admin_Display_Order__c
                                estimated[index].id = data.Sub_Target_Name__c
                                estimated[index].kpiName = data.Sub_Target_Name__c
                            }
                            _.assign(discount[index].kpiRequirements, {
                                [data.TARGET_NAME__c]: _.floor((subtract(data.EDV__c, data.DNP__c) * 100) / 100, 2)
                            })
                            _.assign(estimated[index].kpiRequirements, {
                                [data.TARGET_NAME__c]: _.floor(
                                    (Number(subtract(data.EDV__c, data.DNP__c)) *
                                        100 *
                                        (_.isEmpty(svsObj)
                                            ? 0
                                            : Number(svsObj.U || svsObj.A || '0') *
                                              ((100 + Number(svsObj.G || 0)) / 100))) /
                                        100,
                                    2
                                )
                            })
                        } else {
                            discount.push({
                                // discount
                                id: data.Sub_Target_Name__c,
                                VALUE_TYPE__c: data.VALUE_TYPE__c || '',
                                kpiName: data.Sub_Target_Name__c,
                                order: data.CDA_Admin_Display_Order__c,
                                kpiRequirements: {
                                    [data.TARGET_NAME__c]: _.floor((subtract(data.EDV__c, data.DNP__c) * 100) / 100, 2)
                                }
                            })
                            estimated.push({
                                // estimated
                                id: data.Sub_Target_Name__c,
                                kpiName: data.Sub_Target_Name__c,
                                kpiRequirements: {
                                    [data.TARGET_NAME__c]: _.floor(
                                        (Number(subtract(data.EDV__c, data.DNP__c)) *
                                            100 *
                                            (_.isEmpty(svsObj)
                                                ? 0
                                                : Number(svsObj.U || svsObj.A || '0') *
                                                  ((100 + Number(svsObj.G || 0)) / 100))) /
                                            100,
                                        2
                                    )
                                }
                            })
                        }
                    })

                    const total = {} as any
                    estimated.forEach((elem) => {
                        const kpiRequirements = elem.kpiRequirements as any
                        Object.keys(kpiRequirements).forEach((key) => {
                            if (total[key]) {
                                total[key] += kpiRequirements[key] <= 0 ? 0 : kpiRequirements[key]
                            } else {
                                total[key] = kpiRequirements[key] <= 0 ? 0 : kpiRequirements[key]
                            }
                            kpiRequirements[key] = _.round(kpiRequirements[key])
                        })
                    })
                    Object.keys(total).forEach((key) => {
                        total[key] = _.round(total[key])
                    })
                    estimated.push({
                        // estimated
                        id: t.labels.PBNA_MOBILE_TOTAL,
                        kpiName: t.labels.PBNA_MOBILE_TOTAL,
                        kpiRequirements: total
                    })

                    setDiscountData(discount)
                    dispatch(setEstimatedData(estimated))

                    // sort reward by CDA_Admin_Display_Order__c ascending
                    resRewards.sort(
                        (a, b) => Number(a.CDA_Admin_Display_Order__c || 0) - Number(b.CDA_Admin_Display_Order__c || 0)
                    )
                    setRewardsData(resRewards)

                    // sort shell sheet by file name ascending
                    resSellSheets.sort((a, b) => sortByParamsASC(a.TARGET_NAME__c || '', b.TARGET_NAME__c || ''))
                    setShellSheetsData(resSellSheets)

                    const [resColdValue, resExecution] = [
                        res[0].data.compositeResponse[1].body.records,
                        res[0].data.compositeResponse[2].body.records as ResExecutionData[]
                    ]

                    const coldVault = {
                        MedalOverview: [],
                        BasicOverview: [],
                        SpaceRequirements: {}
                    }
                    resColdValue.forEach((data: any) => {
                        if (data.TYPE__c === DataType.OVERVIEW) {
                            if (data.TARGET_NAME__c) {
                                coldVault.MedalOverview = data?.TARGET_NAME__c?.split(',')
                            }
                            if (data.SUBTYPE__c) {
                                coldVault.BasicOverview = data?.SUBTYPE__c?.split(',')
                            }
                        } else if (
                            data.TYPE__c === DataType.SPACE_REQUIREMENTS &&
                            data.VALUE_TYPE__c === DataType.PERCENTAGE
                        ) {
                            if ((data.TARGET_NAME__c || data.VALUE_TYPE__c) && data.VALUE__c) {
                                _.assign(coldVault.SpaceRequirements, { [data.TARGET_NAME__c]: data.VALUE__c })
                            }
                        }
                    })
                    // Order by medalOrder
                    coldVault.MedalOverview.sort((a: keyof typeof medalOrder, b: keyof typeof medalOrder) => {
                        return (medalOrder[b] || -1) - (medalOrder[a] || -1)
                    })
                    // Order by Alphabet
                    coldVault.BasicOverview.sort((a: string, b: string) => sortByParamsASC(a, b))
                    setColdVaultData(coldVault)

                    // Set Tier Data
                    const tempTierData: { name: any; select: boolean }[] = []
                    if (surveyQuestions.Agreement_Type__c === AgreementType.MEDAL_CONTRACT) {
                        coldVault.MedalOverview.forEach((medal, index) =>
                            tempTierData.push({ name: medal, select: index < 5 })
                        )
                        coldVault.BasicOverview.forEach((medal) => tempTierData.push({ name: medal, select: false }))
                    } else if (surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT) {
                        coldVault.MedalOverview.forEach((medal) =>
                            tempTierData.push({ name: medal, select: medal === 'Bronze' })
                        )
                        if (tempTierData.filter((tier) => tier.select).length > 0) {
                            coldVault.BasicOverview.forEach((medal, index) =>
                                tempTierData.push({ name: medal, select: index < 4 })
                            )
                        } else {
                            coldVault.BasicOverview.forEach((medal, index) =>
                                tempTierData.push({ name: medal, select: index < 5 })
                            )
                        }
                    }

                    backfillSignedMedalTierWhenEditing(tempTierData)
                    dispatch(setTierData(tempTierData))

                    const execution: ExecutionAndDiscountData[] = []
                    resExecution.forEach((data) => {
                        const index = execution.findIndex(
                            (i) => i.id === (data.Sub_Target_Name__c || '') + data.VALUE_TYPE__c
                        )
                        if (index !== -1) {
                            _.assign(execution[index].kpiRequirements, {
                                [data.TARGET_NAME__c || '']: data.VALUE__c || ''
                            })
                        } else {
                            execution.push({
                                // 'Equipment', 'Display'
                                id: (data.Sub_Target_Name__c || '') + data.VALUE_TYPE__c,
                                VALUE_TYPE__c: data.VALUE_TYPE__c || '',
                                kpiName: data.Sub_Target_Name__c || '',
                                order: data.CDA_Admin_Display_Order__c || '',
                                kpiRequirements: { [data.TARGET_NAME__c || '']: data.VALUE__c || '' }
                            })
                        }
                    })
                    const executionActualStringVal: any = {}
                    execution.forEach((execution: ExecutionAndDiscountData) => {
                        executionActualStringVal[execution.kpiName] = ''
                    })

                    dispatch(setEnabledRewards(resRewards.map((reward) => reward.TARGET_NAME__c)))

                    // Order by ascending
                    execution.sort((a, b) => Number(a.order) - Number(b.order))

                    dispatch(setExecutionData(execution))
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'CONTRACT-SURVEY-PRESENT',
                        `Fetch Present Data failure' ${ErrorUtils.error2String(error)}`
                    )
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'Fetch Present Data failure',
                        ErrorUtils.error2String(error)
                    )
                })
    }, [locationId, checkedYear, contractId])
    return {
        coldVaultData,
        setTierStatus,
        setTierData,
        autoSelectTier,
        discountData,
        rewardsData,
        shellSheetsData
    }
}
export interface ImageLinkData {
    Channel: string
    Category: string
    Material: string
    Size: string
    Trademark: string[]
    Brand: string[]
}
const getStoreVolumeSectionData = async (locationId: string, checkedYear: string, visitId: string) => {
    const isThisYear = checkedYear === getCurrentOrNextYear().currentYear
    const groupField = isThisYear ? 'Location_Group_Current_Year_Name__c' : 'Location_Group_Next_Year_Name__c'
    const body = [
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getLocationGroupQuery(locationId, isThisYear)}`,
            referenceId: 'refLocationGroup'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getFundingPackagesQuery(
                `@{refLocationGroup.records[0].${groupField}}`,
                checkedYear
            )}`,
            referenceId: 'refFundingPackages'
        },
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getRetailVisitKpiQuery(
                visitId
            )}`,
            referenceId: `refRetailVisitKpi`
        }
    ]
    return await compositeCommonCall(body)
}
export const getStoreVolumeSectionInitData = (
    customerId: string,
    locationId: string,
    checkedYear: string,
    visitId: string,
    dropDownRef: any
) => {
    return new Promise((resolve, reject) => {
        getStoreVolumeSectionData(locationId, checkedYear, visitId)
            .then((res) => {
                if (res.data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                    throw Error(ErrorUtils.error2String(res.data))
                }
                const groupField =
                    checkedYear === getCurrentOrNextYear().currentYear
                        ? 'Location_Group_Current_Year_Name__c'
                        : 'Location_Group_Next_Year_Name__c'
                const locationGroups = res.data.compositeResponse[0].body.records || []
                const locationGroupName = !_.isEmpty(locationGroups) ? locationGroups[0][groupField] : ''
                const fundingPackages: any[] = res.data.compositeResponse[1].body.records
                const medalFundingPackageGroupBy = _.groupBy(
                    fundingPackages.filter((elem) => elem.SUBTYPE__c === MedalSubType.MEDAL),
                    'Sub_Target_Name__c'
                )
                const basicFundingPackageGroupBy = _.groupBy(
                    fundingPackages.filter((elem) => elem.SUBTYPE__c === MedalSubType.BASIC),
                    'Sub_Target_Name__c'
                )
                const getFundingPackageList = (fundingPackageGroupBy: any) => {
                    return Object.keys(fundingPackageGroupBy)
                        .filter((key) => !!key)
                        .map((key) => {
                            const orders = fundingPackageGroupBy[key].map(
                                (FPGBElem: any) => FPGBElem.CDA_Admin_Display_Order__c
                            )
                            const order = _.max(orders)
                            return {
                                Sub_Target_Name__c: key,
                                order: order || ''
                            }
                        })
                }
                const medalFundingPackageList = getFundingPackageList(medalFundingPackageGroupBy)
                const basicFundingPackageList = getFundingPackageList(basicFundingPackageGroupBy)
                const retailVisitKpiObj: any =
                    res.data.compositeResponse[2].body.records && res.data.compositeResponse[2].body.records.length > 0
                        ? res.data.compositeResponse[2].body.records[0]
                        : {}
                const svsDataObjs: any[] = retailVisitKpiObj.ActualLongStringValue__c
                    ? JSON.parse(retailVisitKpiObj.ActualLongStringValue__c)
                    : []
                const getSvsDataRes = (fundingPackageList: any[], isMedal = false) => {
                    const subType = isMedal ? BooleanEnum.TRUE : BooleanEnum.FALSE
                    return _.chain(fundingPackageList)
                        .map((elem) => {
                            const stnItem = svsDataObjs.find(
                                (sdoElem) => sdoElem.P === elem.Sub_Target_Name__c && sdoElem.M === subType
                            )
                            /**
                             * ContractHelper handleStoreVolumeData with notes
                             */
                            const isEmptyStnItem = _.isEmpty(stnItem)
                            const wksVol = !isEmptyStnItem ? stnItem.A : ''
                            const useVol = !isEmptyStnItem ? stnItem.U || wksVol : ''
                            const projVolGrowth = !isEmptyStnItem ? stnItem.G : ''
                            return {
                                id: elem.Sub_Target_Name__c,
                                order: elem.order,
                                title: elem.Sub_Target_Name__c,
                                showBottomBorder: true,
                                wksVol: wksVol,
                                useVol: useVol,
                                projVolGrowth: projVolGrowth,
                                projVol: stnItem
                                    ? Math.round(
                                          (parseFloat(useVol || '0') *
                                              (IntervalTime.ONE_HUNDRED + parseFloat(projVolGrowth || '0'))) /
                                              IntervalTime.ONE_HUNDRED
                                      ).toString()
                                    : '',
                                isMedal: isMedal
                            }
                        })
                        .orderBy(['order', 'title'], ['asc', 'asc'])
                        .value()
                }
                const isEmptySvsData = _.isEmpty(svsDataObjs)
                const initStoreVolumeData = (resObj: any = {}, isError = false) => {
                    const svsMedalDataRes = getSvsDataRes(medalFundingPackageList, true)
                    const svsBasicDataRes = getSvsDataRes(basicFundingPackageList)
                    const getTotalSVS = (svsDataRes: any[], isMedal = false) => {
                        const totalSVS: StoreVolumeSectionData = {
                            id: t.labels.PBNA_MOBILE_TOTAL,
                            order: '',
                            title: t.labels.PBNA_MOBILE_TOTAL_PEPSI_TRUCK,
                            showBottomBorder: true,
                            wksVol: getSumByVal(svsDataRes, 'wksVol'),
                            useVol: getSumByVal(svsDataRes, 'useVol'),
                            projVolGrowth: '',
                            projVol: getSumByVal(svsDataRes, '', (elem: any) => {
                                return (
                                    (parseFloat(elem.useVol || '0') *
                                        (IntervalTime.ONE_HUNDRED + parseFloat(elem.projVolGrowth || '0'))) /
                                    IntervalTime.ONE_HUNDRED
                                )
                            }),
                            isMedal: isMedal
                        }
                        const projVolGrowth =
                            (parseFloat(totalSVS.projVol) - parseFloat(totalSVS.useVol)) /
                            (parseFloat(totalSVS.useVol) || 1)
                        totalSVS.projVolGrowth = Math.round(projVolGrowth * IntervalTime.ONE_HUNDRED).toString()
                        return totalSVS
                    }

                    const updateStoreVolumeData = () => {
                        const medalTotalSVS = getTotalSVS(svsMedalDataRes, true)
                        svsMedalDataRes.unshift(medalTotalSVS as any)
                        const basicTotalSVS = getTotalSVS(svsBasicDataRes, false)
                        svsBasicDataRes.unshift(basicTotalSVS as any)
                        if (isEmptySvsData) {
                            retailVisitKpiObj.ActualLongStringValue__c = handleStoreVolumeData([
                                ...svsMedalDataRes,
                                ...svsBasicDataRes
                            ])
                        }
                        resolve({ retailVisitKpiObj, svsMedalDataRes, svsBasicDataRes, isTruckVolumeError: isError })
                    }
                    if (isEmptySvsData) {
                        const svsDataResInitData = (svsDataRes: any[], subTargetObj: any = {}) => {
                            svsDataRes.forEach((elem) => {
                                elem.wksVol = Math.round(subTargetObj[elem.title] || 0).toString() || '0'
                                elem.useVol = ''
                                elem.projVol = ''
                            })
                        }
                        svsDataResInitData(svsMedalDataRes, resObj[MedalSubType.MEDAL] || {})
                        svsDataResInitData(svsBasicDataRes, resObj[MedalSubType.BASIC] || {})
                        updateStoreVolumeData()
                    } else {
                        updateStoreVolumeData()
                    }
                }
                if (isEmptySvsData) {
                    const url = `?gpid=${CommonParam.GPID__c}&locid=${locationId}&custid=${customerId}&langcde=ENG`
                    getTruckVolume({
                        strLocationGroupName: locationGroupName,
                        strCDAYear: checkedYear,
                        strUrlSuffix: url
                    })
                        .then((resObj) => {
                            const truckVolumeRes = resObj?.data || {}
                            // Plus API values for the same title
                            if (!_.isEmpty(truckVolumeRes)) {
                                for (const medalKey in truckVolumeRes.Medal) {
                                    for (const basicKey in truckVolumeRes.Basic) {
                                        if (basicKey.toLocaleUpperCase() === medalKey.toLocaleUpperCase()) {
                                            const totalApiVal = Math.round(
                                                truckVolumeRes.Basic[basicKey] + truckVolumeRes.Medal[medalKey]
                                            )

                                            truckVolumeRes.Basic[basicKey] = totalApiVal
                                            truckVolumeRes.Medal[medalKey] = totalApiVal
                                        }
                                    }
                                }
                            }
                            initStoreVolumeData(truckVolumeRes)
                        })
                        .catch((callError) => {
                            initStoreVolumeData({}, true)
                            reject(callError)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'CustomerContractTabHooks',
                                `getTruckVolumeByCode' ${ErrorUtils.error2String(callError)}`
                            )
                        })
                } else {
                    initStoreVolumeData()
                }
            })
            .catch((error) => {
                reject(error)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'CONTRACT-SURVEY-PRESENT',
                    `CustomerContractTabHooks - useStoreVolumeSectionData' ${ErrorUtils.error2String(error)}`
                )
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    'CustomerContractTabHooks - useStoreVolumeSectionData',
                    ErrorUtils.error2String(error)
                )
            })
    })
}
export interface LocationData {
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    SLS_UNIT_NM__c: string
    // eslint-disable-next-line camelcase
    Location_Group_Current_Year_Name__c: string
    // eslint-disable-next-line camelcase
    Location_Group_Next_Year_Name__c: string
    /* eslint-enable camelcase */
}
export interface ContractData {
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    SpecialTerms: string
    /* eslint-enable camelcase */
}
export const useNextStepsData = (locationId: string, checkedYear: string, dropDownRef: any) => {
    const [locationData, setLocationData] = useState<LocationData>()
    useEffect(() => {
        locationId &&
            checkedYear &&
            getNextStepData(locationId, checkedYear)
                .then((res) => {
                    if (res.data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                        throw Error(ErrorUtils.error2String(res.data))
                    }
                    const resLocation = res.data.compositeResponse[0].body.records[0] as LocationData
                    setLocationData(resLocation)
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'CONTRACT-SURVEY-NEXT-STEPS',
                        `Fetch NextSteps Data failure' ${ErrorUtils.error2String(error)}`
                    )
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'Fetch NextSteps Data failure',
                        ErrorUtils.error2String(error)
                    )
                })
    }, [locationId, checkedYear])

    return locationData
}

const getContractData = async (contractId: string) => {
    return await compositeCommonCall([
        {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=${getSpecialTermsQuery(contractId)}`,
            referenceId: 'refContract'
        }
    ])
}

export const useContractData = (contractId: string, dropDownRef: any) => {
    const [specialTerms, setSpecialTerms] = useState(false)
    useEffect(() => {
        if (!_.isEmpty(contractId)) {
            getContractData(contractId)
                .then((res) => {
                    if (res.data.compositeResponse[0].httpStatusCode !== HttpStatusCode.Ok) {
                        throw Error(ErrorUtils.error2String(res.data))
                    }
                    const contract = res.data.compositeResponse[0].body.records[0] as ContractData
                    setSpecialTerms(contract?.SpecialTerms === 'true')
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'CONTRACT-SURVEY-NEXT-STEPS-AGREEMENT',
                        `Fetch Agreement Data failure' ${ErrorUtils.error2String(error)}`
                    )
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        'Fetch Agreement Data failure',
                        ErrorUtils.error2String(error)
                    )
                })
        }
    }, [contractId])
    return { specialTerms, setSpecialTerms }
}

/**
 * Hook to preload CDA Agreement PDF
 * *If no related Terms & Conditions or other error will return null
 */
const cachedPDF: { [key: string]: { [k: string]: string | null } } = {}

export const clearCDATermsCache = () =>
    _.forEach(cachedPDF, (_v, key) => {
        _.unset(cachedPDF, key)
    })
export const usePreloadAgreementPDF = (country: string, selectYear?: string) => {
    const [pdfBs64, setPDFBs64] = useState<string | null>('')

    const preload = async () => {
        if (country) {
            if (cachedPDF[country]) {
                if (selectYear) {
                    setPDFBs64(cachedPDF[country][selectYear])
                }
            } else {
                try {
                    const apexParams = { year: [currentYear, nextYear].join(), country }
                    const res: { data: { [k: string]: string | null } | undefined } = await restApexCommonCall(
                        'getCDATermsPDF',
                        'GET',
                        apexParams
                    )
                    if (res.data) {
                        cachedPDF[country] = res.data
                        selectYear && setPDFBs64(cachedPDF[country][selectYear])
                    } else {
                        // Handle no related Terms & Conditions
                        setPDFBs64(null)
                        storeClassLog(
                            Log.MOBILE_WARN,
                            'useAgreementData',
                            `'No related Terms & Conditions ${ErrorUtils.error2String(res)}`
                        )
                    }
                } catch (error) {
                    setPDFBs64(null)
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useAgreementData',
                        `Fetch Agreement Data failure' ${ErrorUtils.error2String(error)}`
                    )
                }
            }
        } else {
            setPDFBs64(null)
        }
    }
    useEffect(() => {
        preload()
    }, [country])
    return pdfBs64
}

export const useShowContractUploadBar = (
    contractList: any[],
    setShowContractUploadBar: React.Dispatch<React.SetStateAction<boolean>>,
    customerDetail: any
) => {
    const checkIsShowContractUploadBar = async () => {
        try {
            const json = await AsyncStorage.getItem('NewCDAPendingUploads')
            if (json) {
                const offlineContract = JSON.parse(json)
                if (customerDetail?.AccountId) {
                    const haveOfflineContract = Object.values(offlineContract).includes(customerDetail?.AccountId)
                    setShowContractUploadBar(haveOfflineContract)
                } else {
                    throw new Error(JSON.stringify(customerDetail))
                }
            }
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'checkIsShowContractUploadBar',
                `check contract bar error' ${ErrorUtils.error2String(error)}`
            )
        }
    }
    useEffect(() => {
        checkIsShowContractUploadBar()
    }, [contractList])
}

export const useCDAPendingUploads = (futureContract: contractData[]) => {
    const [pendingUploadContracts, setPendingUploadContracts] = useState<{ string: boolean } | {}>({})

    useEffect(() => {
        AsyncStorage.getItem('NewCDAPendingUploads')
            .then((res) => {
                const pendingContracts = JSON.parse(res || '{}')
                setPendingUploadContracts(pendingContracts)
            })
            .catch((error) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Get_NewCDAPendingUploads',
                    `Get CDA Pending Upload Data failure' ${ErrorUtils.error2String(error)}`
                )
            })
    }, [futureContract])

    return { pendingUploadContracts }
}

export const useEmailAndCDAStaticResource = (country: string, selectYear: string, visitId: string) => {
    const [emailAddress, setEmailAddress] = useState<string | null>(null)
    const [staticResourceBase64Obj, setStaticResourceBase64Obj] = useState<StaticResourceBase64Obj>({
        lstContractFile: [],
        lstPepsiPartnerShip: []
    })

    const preloadEmailAndCDAStaticResource = async () => {
        const res: any = await getUserEmail()
        const userEmail = res?.data?.records?.[0].Email
        setEmailAddress(userEmail)

        if (country && visitId && selectYear) {
            try {
                const cdaStaticResource = await restApexCommonCall(
                    `getCDAStaticResource?country=${country}&visitId=${visitId}&year=${selectYear}`,
                    'GET'
                )
                setStaticResourceBase64Obj(cdaStaticResource.data)
            } catch (error) {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    `preloadEmailAndCDAStaticResource-getCdaStaticResource`,
                    `Generate PDF failure: ${country}, ${visitId}, ${selectYear}, ${ErrorUtils.error2String(error)}`
                )
            }
        }
    }
    useEffect(() => {
        preloadEmailAndCDAStaticResource()
    }, [country, visitId, selectYear])
    return {
        emailAddress,
        staticResourceBase64Obj
    }
}
