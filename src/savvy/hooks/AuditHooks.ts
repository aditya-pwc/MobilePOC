import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
    AuditAssessmentIndicators,
    GeneralAuditAssessmentIndicators,
    AssessmentIndicators,
    CountryType,
    FORMStatusEnum,
    MissionType,
    StepVal,
    VisitSubtypeEnum,
    ShelfSurveyKeyEnum,
    getMedalMap,
    kpiKey,
    FormType
} from '../enums/Contract'
import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash'
import { setAuditData } from '../redux/action/AuditAction'
import { compositeCommonCall, restApexCommonCall, restDataCommonCall } from '../api/SyncUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { ShelfSurveyData, initAudit } from '../redux/reducer/AuditReducer'
import { getAllFieldsByObjName } from '../utils/SyncUtils'
import { FormStatus } from '../components/rep/customer/contract-tab/SurveyQuestionsModal'
import { Linking } from 'react-native'
import { getAuditKpiList, handleUrl } from '../helper/rep/StartNewCDAHelper'
import { HttpStatusCode } from 'axios'
import { MissionMdtData, getCountryLabel } from './CustomerContractTabHooks'
import { t } from '../../common/i18n/t'
import { getSumByVal } from '../helper/rep/ContractHelper'
import { handleCDAOfflineFormData, handleCDAOnlineFormData } from './StartNewCDAHooks'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { CommonParam } from '../../common/CommonParam'
import { getContractedShelves, handleAuditVisitKpiIsNull } from '../helper/rep/AuditHelper'
import { fetPOGCsv } from '../api/POGService'
import { VisitStatus } from '../enums/Visit'
import { getOmitZeroDigitalRoundNumber } from '../../savvy/components/rep/customer/contract-tab/SpaceViewPage'
import NetInfo from '@react-native-community/netinfo'
interface AuditDataParams {
    visitSubtype: string
    customerDetail: any
    auditVisitId: string
    locProdId: string
    setFormStatus: Dispatch<SetStateAction<FormStatus>>
}

const populateValues = (originData: any[], kpiValue: string, key: string, resetVal: any) => {
    const kpiObjectValue = !_.isEmpty(kpiValue) ? JSON.parse(kpiValue) : {}
    const finalData: any = {}
    if (_.isEmpty(originData)) {
        return finalData
    }

    for (const item of originData) {
        const keyName = item[key]

        if (keyName in kpiObjectValue) {
            finalData[keyName] = kpiObjectValue[keyName]
        } else {
            finalData[keyName] = resetVal
        }
    }
    return finalData
}

const initializeIfEmpty = (data: any, initValue: any) => {
    return _.isEmpty(data) ? initValue : data
}
const getRoundIntegerNum = (val: string) => {
    return Number(parseInt(getOmitZeroDigitalRoundNumber(val)))
}
const initializeShelfSurveyData = (kpiData: any, visitKPIs: string[]) => {
    let shelfSurveyData: ShelfSurveyData[] = visitKPIs.map((key) => {
        const formObj = kpiData.auditVisitKpiForm[key] || {}
        const userObj = kpiData.auditVisitKpiUser[key] || {}
        const formVolObj = formObj?.ActualStringValue ? JSON.parse(formObj?.ActualStringValue) : {}
        const userVolObj = userObj?.ActualLongStringValue__c ? JSON.parse(userObj?.ActualLongStringValue__c) : {}
        const isOther = key === GeneralAuditAssessmentIndicators.OTHER_LRB_SHELVES
        const getVol = (vol: any) => {
            return _.isNull(vol) || _.isUndefined(vol) ? '' : vol.toString()
        }
        const getTitle = () => {
            switch (key) {
                case GeneralAuditAssessmentIndicators.CSD_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_CSD
                case GeneralAuditAssessmentIndicators.ISOTONIC_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_ISOTONIC
                case GeneralAuditAssessmentIndicators.TEA_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_TEA
                case GeneralAuditAssessmentIndicators.COFFEE_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_COFFEE
                case GeneralAuditAssessmentIndicators.ENERGY_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_ENERGY
                case GeneralAuditAssessmentIndicators.ENHANCED_WATER_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_ENHANCED_WATER
                case GeneralAuditAssessmentIndicators.WATER_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_WATER
                case GeneralAuditAssessmentIndicators.JUICE_DRINKS_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_JUICE_DRINKS
                case GeneralAuditAssessmentIndicators.PROTEIN_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_PROTEIN
                case GeneralAuditAssessmentIndicators.CHILLED_JUICE_SHELVES:
                    return t.labels.PBNA_MOBILE_CDA_CHILLED_JUICE
                default:
                    return t.labels.PBNA_MOBILE_OTHER_LRB
            }
        }
        const getTotal = (shelfSurveyObj: any) => {
            const pepsi = isOther ? 0 : getRoundIntegerNum(shelfSurveyObj[ShelfSurveyKeyEnum.PEPSI_VOL] || '0')
            const coke = isOther ? 0 : getRoundIntegerNum(shelfSurveyObj[ShelfSurveyKeyEnum.COKE_VOL] || '0')
            const other = getRoundIntegerNum(shelfSurveyObj[ShelfSurveyKeyEnum.OTHER_VOL] || '0')
            return (pepsi + coke + other).toString()
        }
        const obj = {
            id: userObj?.Id || userObj?.id || key,
            title: getTitle(),
            [ShelfSurveyKeyEnum.TOTAL_VOL]: '',
            [ShelfSurveyKeyEnum.PEPSI]: isOther ? 'NA' : getVol(formVolObj[ShelfSurveyKeyEnum.PEPSI]) || '0',
            [ShelfSurveyKeyEnum.PEPSI_VOL]: isOther
                ? 'NA'
                : getVol(userVolObj[ShelfSurveyKeyEnum.PEPSI]) || getVol(formVolObj[ShelfSurveyKeyEnum.PEPSI]) || '0',
            [ShelfSurveyKeyEnum.COKE]: isOther ? 'NA' : getVol(formVolObj[ShelfSurveyKeyEnum.COKE]) || '0',
            [ShelfSurveyKeyEnum.COKE_VOL]: isOther
                ? 'NA'
                : getVol(userVolObj[ShelfSurveyKeyEnum.COKE]) || getVol(formVolObj[ShelfSurveyKeyEnum.COKE]) || '0',
            [ShelfSurveyKeyEnum.OTHER]: getVol(formVolObj[ShelfSurveyKeyEnum.OTHER]) || '0',
            [ShelfSurveyKeyEnum.OTHER_VOL]:
                getVol(userVolObj[ShelfSurveyKeyEnum.OTHER]) || getVol(formVolObj[ShelfSurveyKeyEnum.OTHER]) || '0'
        }
        obj[ShelfSurveyKeyEnum.TOTAL_VOL] = getTotal(obj)
        return obj
    })
    const totalShelfSurvey: ShelfSurveyData = {
        id: ShelfSurveyKeyEnum.TOTAL,
        title: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_TOTAL_SHELVES_Q,
        [ShelfSurveyKeyEnum.TOTAL_VOL]: getSumByVal(shelfSurveyData, ShelfSurveyKeyEnum.TOTAL_VOL),
        [ShelfSurveyKeyEnum.PEPSI]: '',
        [ShelfSurveyKeyEnum.PEPSI_VOL]: getSumByVal(shelfSurveyData, '', (elem: any) => {
            return elem[ShelfSurveyKeyEnum.PEPSI_VOL] === 'NA'
                ? 0
                : getRoundIntegerNum(elem[ShelfSurveyKeyEnum.PEPSI_VOL] || '0')
        }),
        [ShelfSurveyKeyEnum.COKE]: '',
        [ShelfSurveyKeyEnum.COKE_VOL]: getSumByVal(shelfSurveyData, '', (elem: any) => {
            return elem[ShelfSurveyKeyEnum.COKE_VOL] === 'NA'
                ? 0
                : getRoundIntegerNum(elem[ShelfSurveyKeyEnum.COKE_VOL] || '0')
        }),
        [ShelfSurveyKeyEnum.OTHER]: '',
        [ShelfSurveyKeyEnum.OTHER_VOL]: getSumByVal(shelfSurveyData, ShelfSurveyKeyEnum.OTHER_VOL, (elem: any) => {
            return elem[ShelfSurveyKeyEnum.OTHER_VOL] === 'NA'
                ? 0
                : getRoundIntegerNum(elem[ShelfSurveyKeyEnum.OTHER_VOL] || '0')
        })
    }
    shelfSurveyData.unshift(totalShelfSurvey)
    shelfSurveyData = shelfSurveyData.map((obj: ShelfSurveyData) => {
        const newObj = {} as ShelfSurveyData
        for (const key in obj) {
            if (obj[key] === 'NA' || Number.isInteger(obj[key]) || [kpiKey.ID, kpiKey.TITLE].includes(key as kpiKey)) {
                newObj[key] = obj[key]
            } else {
                newObj[key] = getOmitZeroDigitalRoundNumber(obj[key])
            }
        }
        return newObj
    })
    return shelfSurveyData
}

export const useSpaceBreakdown = (auditData: any, customerDetail: any) => {
    const [data, setData] = useState({})
    useEffect(() => {
        const contractedShelves = getContractedShelves(auditData)
        if (!auditData.contract.CDA_Year__c || !customerDetail['Account.CUST_UNIQ_ID_VAL__c'] || !contractedShelves) {
            return
        }

        const params = {
            shelf: _.round(Number(contractedShelves)),
            year: auditData.contract.CDA_Year__c,
            customerId: customerDetail['Account.CUST_UNIQ_ID_VAL__c'],
            countryCode: customerDetail.CountryCode
        }
        fetPOGCsv(params)
            .then((res) => {
                setData(res.data)
            })
            .catch((err) => {
                const timestamp = Date.now().toString(36)
                setData({
                    error: ' '
                })
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'getSpaceBreakdown',
                    timestamp + ErrorUtils.error2String(params) + ErrorUtils.error2String(err)
                )
            })
    }, [auditData, customerDetail])
    return data
}

export interface AuditScreenDataParams {
    customerDetail: any
    locProdId: string
    auditVisitId: string
    setFormStatus: Dispatch<SetStateAction<FormStatus>>
    dispatch: Dispatch<any>
}
const roundActualDecimalValue = (obj: any) => {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && !key.includes('%')) {
            roundActualDecimalValue(obj[key])
        } else if (key === kpiKey.ACTUAL_DECIMAL_VALUE) {
            if (obj[key] !== null && !isNaN(obj[key])) {
                obj[key] = getOmitZeroDigitalRoundNumber(obj[key])
            }
        }
    }
}

export const getAuditScreenData = (props: AuditScreenDataParams) => {
    const { customerDetail, locProdId, auditVisitId, setFormStatus, dispatch } = props
    let queryAuditVisit: any
    let params: any
    let lstGeneralAuditVisitKPIs: any
    const locationId = customerDetail?.['Account.LOC_PROD_ID__c']
    try {
        lstGeneralAuditVisitKPIs = Object.keys(GeneralAuditAssessmentIndicators).map((key: string) => {
            return GeneralAuditAssessmentIndicators[key as keyof typeof GeneralAuditAssessmentIndicators]
        }) as any[]
        params = {
            strLocationId: locationId || locProdId,
            strAuditVisitId: auditVisitId,
            lstAuditVisitKPIs: getAuditKpiList(),
            lstCDAVisitKPIs: [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES, AssessmentIndicators.TOTAL_LRB_SHELVES]
        }
        const visitSql = `query/?q=SELECT ${getAllFieldsByObjName('Visit').join(
            ', '
        )}, CDA_Compliance__c, CDA_Contract__c, CreatedBy.Name from Visit`
        queryAuditVisit = `${visitSql} WHERE Id = '${auditVisitId}'`
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'useAuditData-parameters',
            `Error preparing parameters and query
        ' ${ErrorUtils.error2String(error)}`
        )
    }

    Promise.all([restApexCommonCall('getCDAKpi/', 'POST', params), restDataCommonCall(queryAuditVisit, 'GET')])
        .then((results) => {
            const kpiData = results[0]?.data
            if (!_.isEmpty(kpiData.mobileUniqueId)) {
                setFormStatus(FORMStatusEnum.PENDING)
            }
            const auditVisitList = results[1]?.data?.records || []
            const auditVisit = auditVisitList.length > 0 ? auditVisitList[0] : { Id: auditVisitId }
            if (kpiData.success) {
                if (!kpiData.auditVisitKpi) {
                    handleAuditVisitKpiIsNull({ customerDetail, locProdId, auditVisitId, setFormStatus, dispatch })
                } else {
                    const executionInputValue = populateValues(
                        kpiData.executionData,
                        kpiData.auditVisitKpi
                            ? kpiData.auditVisitKpi?.[AuditAssessmentIndicators.EXECUTION_ELEMENTS_AUDITED]
                                  ?.ActualLongStringValue__c
                            : '',
                        'kpiName',
                        ''
                    )

                    const selectRewards = populateValues(
                        kpiData.requiredKPIValue?.requiredReward || [],
                        kpiData.auditVisitKpi
                            ? kpiData.auditVisitKpi?.[AuditAssessmentIndicators.REWARDS_AUDITED]
                                  ?.ActualLongStringValue__c
                            : '',
                        'TARGET_NAME__c',
                        false
                    )
                    const contract = initializeIfEmpty(kpiData.contract, initAudit.contract)
                    auditVisit.contractObj = contract
                    const kpiDataTemp: any = {
                        rewardsData: initializeIfEmpty(kpiData?.rewardsData, []),
                        executionData: initializeIfEmpty(kpiData?.executionData, []),
                        coldVaultData: initializeIfEmpty(kpiData?.coldVaultData, initAudit.coldVaultData),
                        perimetersData: initializeIfEmpty(kpiData?.objPerimetersData, initAudit.perimetersData),
                        CDAVisitKpi: initializeIfEmpty(kpiData?.CDAVisitKpi, initAudit.CDAVisitKpi),
                        auditVisitKpi: initializeIfEmpty(kpiData.auditVisitKpi, initAudit.auditVisitKpi),
                        contract,
                        selectRewards,
                        executionInputValue,
                        locationInfo: kpiData.locationInfo,
                        logo: kpiData.PepsiPartnerShip,
                        retailVisitKpiPOGApiValue: {},
                        auditVisit: auditVisit,
                        [AssessmentIndicators.DOOR_SURVEY]: getOmitZeroDigitalRoundNumber(
                            kpiData.auditVisitKpiUser[AssessmentIndicators.DOOR_SURVEY]?.ActualDecimalValue ||
                                kpiData.auditVisitKpiForm[AssessmentIndicators.DOOR_SURVEY]?.ActualDecimalValue
                        ),
                        auditVisitKpiForm: initializeIfEmpty(kpiData.auditVisitKpiForm, {}),
                        auditVisitKpiUser: initializeIfEmpty(kpiData.auditVisitKpiUser, {}),
                        shelfSurveyData: initializeShelfSurveyData(kpiData, lstGeneralAuditVisitKPIs),
                        requiredKPIValue: {
                            requiredExecutionData: kpiData.requiredKPIValue?.requiredExecutionData || {},
                            requiredReward: kpiData.requiredKPIValue?.requiredReward || [],
                            requiredShelves: kpiData.requiredKPIValue?.requiredShelves || {}
                        }
                    }
                    // round data:
                    roundActualDecimalValue(kpiDataTemp)
                    dispatch(setAuditData(kpiDataTemp))
                }
            }
        })
        .catch((err) => {
            handleAuditVisitKpiIsNull({ customerDetail, locProdId, auditVisitId, setFormStatus, dispatch })
            storeClassLog(
                Log.MOBILE_ERROR,
                'useAuditData',
                `Fetch audit data failure' ${ErrorUtils.error2String(err)}, auditVisitId: ${auditVisitId}
                ,params:${ErrorUtils.error2String(params)}`
            )
        })
}

export const useAuditData = (AuditDataParams: AuditDataParams) => {
    const { customerDetail, auditVisitId, locProdId, setFormStatus } = AuditDataParams
    const dispatch = useDispatch()
    useEffect(() => {
        getAuditScreenData({ customerDetail, locProdId, auditVisitId, setFormStatus, dispatch })
    }, [auditVisitId])
}

export const useDisableSave = (activeStep: string, formStatus: string) => {
    const [disable, setDisable] = useState(true)
    const [disableSubmit, setDisableSubmit] = useState(false)

    const auditData = useSelector((state: any) => state.AuditReducer.auditData)

    const medalMap = getMedalMap()
    const isBasic = !medalMap[auditData.contract.Signed_Medal_Tier__c]

    useEffect(() => {
        if (activeStep === StepVal.ONE) {
            const checkWhetherFormBeenClicked = !!auditData.formButtonClicked
            if (auditData.contract?.Id) {
                let allKeysHaveValue = true
                for (const key in auditData.executionInputValue) {
                    if (auditData.executionInputValue[key] === '') {
                        allKeysHaveValue = false
                        break
                    }
                }

                if (formStatus === FORMStatusEnum.START) {
                    setDisable(!(allKeysHaveValue && !!checkWhetherFormBeenClicked))
                } else {
                    setDisable(!allKeysHaveValue)
                }
            } else {
                if (auditData.auditVisit?.Id && formStatus === FORMStatusEnum.START) {
                    setDisable(!checkWhetherFormBeenClicked)
                } else {
                    setDisable(false)
                }
            }
        } else {
            setDisable(false)
        }
    }, [auditData])

    useEffect(() => {
        const shouldDisable = auditData.auditVisit?.Status__c === VisitStatus.IN_PROGRESS
        if (shouldDisable) {
            if (auditData.contract?.Id && !isBasic) {
                // Post / General Audit Step 3 submit
                if (activeStep === StepVal.THREE) {
                    return setDisable(true)
                }
            } else {
                // Basic / No contract only one step
                setDisable(true)
            }
        } else {
            setDisableSubmit(false)
        }
    })

    return { disable: disable || disableSubmit }
}

export const doRetailVisitKpi = async (visitId: string, mobileUniqueId: string) => {
    try {
        const res = await restApexCommonCall('doRetailVisitKpi/', 'POST', {
            strVisitId: visitId,
            strMobileUniqueVal: mobileUniqueId
        })

        if (res.status !== HttpStatusCode.Ok) {
            throw new Error(`${JSON.stringify(res)}`)
        }

        return { success: true }
    } catch (err) {
        throw new Error(`${JSON.stringify(err)}`)
    }
}

export const storeMobileUniqueIdLog = (err: object) => {
    storeClassLog(
        Log.MOBILE_ERROR,
        'useListenAuditFormUrl',
        `Failed to save mobileUniqueId' ${ErrorUtils.error2String(err)}`
    )
}

export const useListenAuditFormUrl = (setFormStatus: Dispatch<SetStateAction<FormStatus>>, visitId: string) => {
    useEffect(() => {
        const linkEmit = Linking.addEventListener('url', async (e) => {
            const { status, mobileUniqueId } = handleUrl(JSON.stringify(e))
            if (status === 'completed') {
                setFormStatus(FORMStatusEnum.PENDING)
                if (!_.isEmpty(mobileUniqueId)) {
                    NetInfo.fetch().then((state) => {
                        if (state.isInternetReachable) {
                            handleCDAOnlineFormData(visitId, mobileUniqueId)
                        } else {
                            handleCDAOfflineFormData(visitId, mobileUniqueId, FormType.Audit)
                        }
                    })
                } else {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useListenAuditFormUrl',
                        `There is no mobileUniqueId Audit ${ErrorUtils.error2String(e)}`
                    )
                }
            }
        })

        return () => {
            linkEmit && linkEmit.remove()
        }
    }, [])
}

export const useMissionId = (btnType: VisitSubtypeEnum, selectedMission: string, retailStore: any) => {
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const [missionId, setMissionId] = useState<string>('')
    const [GSCId, setGSCId] = useState<string>('')
    useEffect(() => {
        const fetchMissionId = async () => {
            compositeCommonCall([
                {
                    method: 'GET',
                    url: `/services/data/${
                        CommonParam.apiVersion
                    }/query/?q=SELECT Id, CountryCode, Account.LOC_PROD_ID__c,Account.GSC_ID__c FROM RetailStore WHERE Id='${
                        customerDetail?.Id || retailStore?.Id
                    }'`,
                    referenceId: 'refRetailStore'
                },
                {
                    method: 'GET',
                    url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Id, Mission_Name__c, Mission_Type__c, Country__c, Mission_Id_Value__c, Mission_Division__c,DeveloperName,Language
                    FROM Mission_Id__mdt`,
                    referenceId: 'refMissionIdMdt'
                },
                {
                    method: 'GET',
                    url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Division__c FROM Route_Sales_Geo__c
                    WHERE SLS_UNIT_ID__c = '@{refRetailStore.records[0].Account.LOC_PROD_ID__c}'
                    AND SLS_UNIT_ACTV_FLG_VAL__c = 'ACTIVE'
                    AND Operational_Location__c = TRUE
                    AND HRCHY_LVL__c = 'Location'
                    AND RecordType.Name = 'Sales Unit'`,
                    referenceId: 'refRSG'
                }
            ])
                .then((results) => {
                    const ok = results?.data?.compositeResponse?.[0]?.httpStatusCode === HttpStatusCode.Ok
                    if (ok) {
                        const retailStoreObj = results.data.compositeResponse[0].body.records[0]
                        const division = results.data.compositeResponse[2].body.records?.[0]?.Division__c || ''
                        const missionIdArr: MissionMdtData[] = results.data.compositeResponse[1].body.records
                        setGSCId(retailStoreObj?.Account?.GSC_ID__c || '')
                        if (btnType === VisitSubtypeEnum.GENERAL_AUDIT) {
                            setMissionId(selectedMission || '')
                        } else {
                            if (!_.isEmpty(missionIdArr)) {
                                let missionId
                                if (btnType === VisitSubtypeEnum.POST_CONTRACT_AUDIT) {
                                    missionId = missionIdArr.find(
                                        (item: MissionMdtData) =>
                                            item.Mission_Division__c === division &&
                                            item.Mission_Type__c === MissionType.MISSION_POST_CDA_AUDIT
                                    )
                                } else if (btnType === VisitSubtypeEnum.CDA_CONTRACT) {
                                    // CDA contract
                                    const country = getCountryLabel(
                                        retailStoreObj,
                                        CountryType.UNITED_STATES,
                                        CountryType.CANADA
                                    )
                                    missionId = missionIdArr.find(
                                        (item: MissionMdtData) =>
                                            item.Country__c === country &&
                                            item.Mission_Type__c === MissionType.MISSION_SPACE_REVIEW
                                    )
                                } else if (btnType === VisitSubtypeEnum.REALOGRAM) {
                                    // Realogram:find mission id by mission type and mission country
                                    missionId = missionIdArr.find(
                                        (item: MissionMdtData) =>
                                            item.Mission_Type__c === MissionType.MISSION_REALOGRAM &&
                                            item.Country__c?.includes(customerDetail?.Country || retailStore?.Country)
                                    )
                                }
                                const extractedMissionId = missionId ? missionId.Mission_Id_Value__c : ''
                                setMissionId(extractedMissionId || '')
                            }
                        }
                    } else {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            `useMissionId_retailStore`,
                            `Get Mission Id failed:${ErrorUtils.error2String(results)}`
                        )
                    }
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        `useMissionId`,
                        `Get Mission Id failed:${ErrorUtils.error2String(err)} customerId: ${
                            customerDetail?.Id
                        } retailStoreId:${retailStore?.Id}`
                    )
                })
        }

        fetchMissionId()
    }, [btnType])

    return { missionId, GSCId }
}
