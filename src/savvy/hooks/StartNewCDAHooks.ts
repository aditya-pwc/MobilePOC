import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    AgreementType,
    AssessmentIndicators,
    BooleanEnum,
    DatumType,
    FORMStatusEnum,
    FORMUrlStatusEnum,
    FormType,
    IntervalTime,
    LocalFormData
} from '../enums/Contract'
import { fetchRetailStoreKpi, getAssessmentTask } from '../helper/rep/ContractHelper'
import { Linking } from 'react-native'
import { handleUrl, kpiParams } from '../helper/rep/StartNewCDAHelper'
import { FormStatus } from '../components/rep/customer/contract-tab/SurveyQuestionsModal'
import {
    setAssessmentTask,
    setDisableNewButton,
    setNeedUpdateFormStatus,
    setOriginRetailVisitKpi,
    setSurveyQuestions
} from '../redux/action/ContractAction'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import _, { debounce } from 'lodash'
import {
    StartDataProps,
    getCurrentOrNextYear,
    getLocationGroupQuery,
    getStoreVolumeSectionInitData,
    presentStepQueries
} from './CustomerContractTabHooks'
import { useDropDown } from '../../common/contexts/DropdownContext'
import { VisitStatus } from '../enums/Visit'
import NetInfo, { addEventListener, fetch } from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doRetailVisitKpi, storeMobileUniqueIdLog } from './AuditHooks'
import { isPersonaSDLOrPsrOrMDOrKAM, isPersonaSDLOrPsrOrMDOrKAMOrUGM } from '../../common/enums/Persona'
import { HttpStatusCode } from 'axios'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { compositeCommonCall, restDataCommonCall } from '../api/SyncUtils'
import moment from 'moment'
import { CommonParam } from '../../common/CommonParam'

interface BodyType {
    // eslint-disable-next-line
    Status__c: VisitStatus
    // eslint-disable-next-line
    Mobile_Unique_ID__c: string
    // eslint-disable-next-line
    Tag_Edit_Deep_Link__c?: boolean
    // eslint-disable-next-line
    Realogram_IR_Results__c?: string | null
    // eslint-disable-next-line
    IR_Processing_Time__c?: string
    // eslint-disable-next-line
    Notification_Sent__c?: boolean
}

export const parseJSON = (str: string, errMsg: string) => {
    try {
        return JSON.parse(str || '{}')
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, errMsg, getStringValue(error))
        return {}
    }
}

export const numberToString = (input: null | number | string) => {
    if (input !== null && input !== undefined) {
        return String(input)
    }
    return ''
}

export const useStartNewCdaInitData = (startDataParams: StartDataProps) => {
    const { visitId, dispatch, setFormStatus, setIsLoading } = startDataParams
    const surveyQuestions = useSelector((state: any) => state.contractReducer.surveyQuestions)
    const { dropDownRef } = useDropDown()
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const locationId = customerDetail['Account.LOC_PROD_ID__c']
    const customerId = customerDetail['Account.CUST_UNIQ_ID_VAL__c']
    const [isPerimeter, setIsPerimeter] = useState<boolean>(false)
    const [ifShowLocationGroup, setIfShowLocationGroup] = useState<undefined | boolean>(undefined)
    const CDAYear = checkedYear || surveyQuestions.CDA_Year__c
    const isThisYear = CDAYear === getCurrentOrNextYear().currentYear
    const groupField = isThisYear ? 'Location_Group_Current_Year_Name__c' : 'Location_Group_Next_Year_Name__c'
    let needUpdateCheckBoxAndValue: boolean = false

    const handleFetchError = (error: any, logMessage: string, subMessage: string) => {
        setIsLoading && setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, logMessage, `${subMessage} ${getStringValue(error)}`)
    }

    const fetchCheckBoxConfig = (locationId: string, isThisYear: boolean, groupField: string, CDAYear: string) => {
        return compositeCommonCall([
            {
                method: 'GET',
                url: `/services/data/${CommonParam.apiVersion}/query/?q=${getLocationGroupQuery(
                    locationId,
                    isThisYear
                )}`,
                referenceId: 'refLocationGroup'
            },
            {
                method: 'GET',
                url: `/services/data/${CommonParam.apiVersion}/query/?q=${presentStepQueries.getShowCheckBoxValueQuery(
                    `@{refLocationGroup.records[0].${groupField}}`,
                    CDAYear
                )}`,
                referenceId: 'refColdVault'
            }
        ])
    }

    const handleFetchRetailStoreKpi = async () => {
        setIsLoading && setIsLoading(true)
        dispatch(setDisableNewButton(true))
        try {
            const kpiRes: any = await fetchRetailStoreKpi(kpiParams, visitId)
            const kpiData = kpiRes?.data
            const combinedKpiObject: any = {}
            kpiData.forEach((item: any) => {
                const key = item.AssessmentIndDefinition.Name
                combinedKpiObject[key] = {
                    Id: item.Id,
                    ActualDecimalValue: item.ActualDecimalValue,
                    ActualLongStringValue__c: item.ActualLongStringValue__c
                }
            })
            let svData: any
            try {
                svData = await getStoreVolumeSectionInitData(customerId, locationId, CDAYear, visitId, dropDownRef)
            } catch (error) {
                handleFetchError(error, 'StartNewCDA-Init-Visit-Kpi', 'getStoreVolumeSectionInitData:')
            }

            try {
                const checkBoxConfig = await fetchCheckBoxConfig(locationId, isThisYear, groupField, CDAYear)
                const showCheckBoxValueResult = checkBoxConfig?.data?.compositeResponse[1]?.body?.records
                const firstValueType = showCheckBoxValueResult[0]?.VALUE_TYPE__c
                const firstValue = showCheckBoxValueResult[0]?.VALUE__c

                if (firstValueType !== DatumType.COLD_VAULT_OR_PERIMETER) {
                    setIsPerimeter(true)
                } else {
                    setIfShowLocationGroup(firstValue === BooleanEnum.VALUE)
                    needUpdateCheckBoxAndValue = firstValue !== BooleanEnum.VALUE
                }
            } catch (error) {
                handleFetchError(error, 'StartNewCDA-Init-Visit-Kpi', 'fetchCheckBoxConfig:')
            }

            const isSvDataEmpty = _.isEmpty(svData)
            const StoreVolumeData = _.cloneDeep(
                surveyQuestions.Agreement_Type__c === AgreementType.BASIC_WHITE_SPACE_CONTRACT
                    ? svData?.svsBasicDataRes
                    : svData?.svsMedalDataRes
            )

            const dataToUpdate = {
                [AssessmentIndicators.DOOR_SURVEY]: numberToString(
                    combinedKpiObject[AssessmentIndicators.DOOR_SURVEY]?.ActualDecimalValue
                ),
                [AssessmentIndicators.TOTAL_LRB_SHELVES]: numberToString(
                    combinedKpiObject[AssessmentIndicators.TOTAL_LRB_SHELVES]?.ActualDecimalValue
                ),
                [AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]: numberToString(
                    combinedKpiObject[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]?.ActualDecimalValue
                ),
                [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: numberToString(
                    combinedKpiObject[AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]?.ActualDecimalValue
                ),
                [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: numberToString(
                    combinedKpiObject[AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]?.ActualDecimalValue
                ),
                [AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]: needUpdateCheckBoxAndValue
                    ? ''
                    : numberToString(
                          combinedKpiObject[AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]?.ActualDecimalValue
                      ),
                [AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]: needUpdateCheckBoxAndValue
                    ? ''
                    : numberToString(
                          combinedKpiObject[AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]?.ActualDecimalValue
                      ),
                ExecutionElements: parseJSON(
                    numberToString(
                        combinedKpiObject[AssessmentIndicators.PROPOSED_VALUES_FOR_EXECUTION_ELEMENTS]
                            ?.ActualLongStringValue__c
                    ),
                    'StartNewCDAHooks-parseKpiJSON'
                ),
                SelectRewards: parseJSON(
                    numberToString(combinedKpiObject[AssessmentIndicators.REWARDS_SELECTION]?.ActualLongStringValue__c),
                    'StartNewCDAHooks-parseKpiJSON'
                ),
                StoreVolumeData: !isSvDataEmpty ? StoreVolumeData : [],
                basicStoreVolumeData: !isSvDataEmpty ? _.cloneDeep(svData.svsBasicDataRes) : [],
                medalStoreVolumeData: !isSvDataEmpty ? _.cloneDeep(svData.svsMedalDataRes) : [],
                retailVisitKpiObj: !isSvDataEmpty ? svData.retailVisitKpiObj : {},
                isTruckVolumeError: !isSvDataEmpty ? svData.isTruckVolumeError : false,
                CDA_Space_Checkbox__c: needUpdateCheckBoxAndValue ? false : surveyQuestions.CDA_Space_Checkbox__c
            }

            dispatch(
                setSurveyQuestions({
                    ...surveyQuestions,
                    ...dataToUpdate
                })
            )

            dispatch(setOriginRetailVisitKpi(combinedKpiObject))
            setIsLoading && setIsLoading(false)
        } catch (error) {
            handleFetchError(error, 'StartNewCDA-Init-Visit-Kpi', 'Init Visit Kpi failed:')
        }
    }

    useEffect(() => {
        handleFetchRetailStoreKpi()
    }, [])

    useEffect(() => {
        visitId &&
            getAssessmentTask(visitId)
                .then((res: any) => {
                    const assessmentFormTask: any = {
                        ...res?.data.find(
                            (task: any) => task?.AssessmentTaskDefinition?.Name === 'Pre Contract Space Review (FORM)'
                        ),
                        UserAssessmentTaskId: res?.data.find(
                            (task: any) => task?.AssessmentTaskDefinition?.Name === 'Pre Contract Space Review (User)'
                        )?.Id
                    }

                    dispatch(setAssessmentTask(assessmentFormTask))
                    if (!_.isEmpty(assessmentFormTask.Mobile_Unique_ID__c)) {
                        setFormStatus(FORMStatusEnum.COMPLETE)
                    }
                })
                .catch((error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'StartNewCDA-Init-Assessment-Task',
                        `Init Visit Assessment Task failed: ${getStringValue(error)}`
                    )
                })
    }, [visitId])

    return { isPerimeter, ifShowLocationGroup }
}

export const handleCDAOnlineFormData = async (visitId: string, mobileUniqueId: string) => {
    try {
        await doRetailVisitKpi(visitId, mobileUniqueId)
    } catch (error: any) {
        storeMobileUniqueIdLog(error)
    }
}

const updateRealogramFormVisitErrorLog = (error: string) => {
    storeClassLog(
        Log.MOBILE_ERROR,
        'Space-Review-updateRealogramFormVisit',
        `Update Realogram Visit mobileUniqueId failed: ${error}`
    )
}

export const handleCDAOfflineFormData = async (
    visitId: string,
    mobileUniqueId: string,
    type: string,
    isEditForm: boolean = false
) => {
    try {
        const formDataString = await AsyncStorage.getItem('formData')
        const contractFormData: LocalFormData[] = [
            {
                type,
                visitId,
                mobileUniqueId,
                isEditForm
            }
        ]
        const localFormData = formDataString ? [...contractFormData, ...JSON.parse(formDataString)] : contractFormData
        AsyncStorage.setItem('formData', JSON.stringify(localFormData))
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, 'Save offline contract form data failed', `${getStringValue(error)}`)
    }
}

export const doRealogramVisitUpdate = async (visitId: string, mobileUniqueId: string, isEditForm: boolean) => {
    const body: BodyType = {
        Status__c: VisitStatus.IR_PROCESSING,
        Mobile_Unique_ID__c: mobileUniqueId,
        // Store Current Time to SF DT
        IR_Processing_Time__c: moment().utc().format()
    }
    if (isEditForm) {
        body.Tag_Edit_Deep_Link__c = true
        body.Realogram_IR_Results__c = null
        body.Notification_Sent__c = false
    }

    const res = await restDataCommonCall(`sobjects/Visit/${visitId}`, 'PATCH', body)
    return res
}

export const updateRealogramFormVisit = async (
    visitId: string,
    setVisitStatus: any,
    mobileUniqueId: string,
    isEditForm: boolean = false
) => {
    try {
        const res = await doRealogramVisitUpdate(visitId, mobileUniqueId, isEditForm)
        if (!(res?.status === HttpStatusCode.Ok || res?.status === HttpStatusCode.NoContent)) {
            setVisitStatus(VisitStatus.IN_PROGRESS)
            updateRealogramFormVisitErrorLog(getStringValue(res))
        }
    } catch (error) {
        setVisitStatus(VisitStatus.IN_PROGRESS)
        updateRealogramFormVisitErrorLog(getStringValue(error))
    }
}

export const useListenFormUrl = (setFormStatus: Dispatch<SetStateAction<FormStatus>>) => {
    const visitId = useSelector((state: any) => state.contractReducer.visitId)

    useEffect(() => {
        const linkEmit = Linking.addEventListener('url', (e) => {
            const { status, mobileUniqueId } = handleUrl(JSON.stringify(e))
            if (status === FORMUrlStatusEnum.COMPLETED) {
                setFormStatus(FORMStatusEnum.PENDING)
                if (!_.isEmpty(mobileUniqueId)) {
                    NetInfo.fetch().then(async (state) => {
                        if (isPersonaSDLOrPsrOrMDOrKAMOrUGM() && !state.isInternetReachable) {
                            await handleCDAOfflineFormData(visitId, mobileUniqueId, FormType.Contract)
                        } else {
                            await handleCDAOnlineFormData(visitId, mobileUniqueId)
                        }
                    })
                } else {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'There is no mobileUniqueId CDA',
                        ` ${getStringValue(e)}, if personal is right: ${isPersonaSDLOrPsrOrMDOrKAMOrUGM()}`
                    )
                }
            }
        })

        return () => {
            linkEmit && linkEmit.remove()
        }
    }, [])
}

export const useListenFormNetwork = () => {
    const [isSendingFormData, setIsSendingFormData] = useState(false)
    const dispatch = useDispatch()
    const retryOperationWithDelay = async (operation: Function, delay: number) => {
        let retryCount = 0
        dispatch(setNeedUpdateFormStatus(false))
        const retry = async () => {
            try {
                await operation()
                AsyncStorage.removeItem('formData')
                setIsSendingFormData(false)
            } catch (error) {
                if (retryCount < 2) {
                    retryCount++
                    setTimeout(retry, delay)
                } else {
                    setIsSendingFormData(false)
                    dispatch(setNeedUpdateFormStatus(true))
                    AsyncStorage.removeItem('formData')
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'retryOperationWithDelay-sendFormData',
                        `Send Form Data failed: ` + ErrorUtils.error2String(error)
                    )
                }
            }
        }

        await retry()
    }

    const sendFormData = async (formData: LocalFormData[]) => {
        const delay = 5 * 60 * 1000
        try {
            const sendDataOperation = async () => {
                await Promise.all(
                    formData.map((dataItem: LocalFormData) => {
                        if (dataItem.type === FormType.Realogram) {
                            return doRealogramVisitUpdate(
                                dataItem.visitId,
                                dataItem.mobileUniqueId,
                                dataItem.isEditForm
                            )
                        }
                        return doRetailVisitKpi(dataItem.visitId, dataItem.mobileUniqueId)
                    })
                )
            }
            setIsSendingFormData(true)
            await retryOperationWithDelay(sendDataOperation, delay)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'sendFormData', `Send Form Data failed: ${error},formData: ${formData}`)
        }
    }

    const checkAndSendFormData = async () => {
        if (!isSendingFormData) {
            const formDataString = await AsyncStorage.getItem('formData')
            if (formDataString) {
                const formData = JSON.parse(formDataString)
                await sendFormData(formData)
            }
        }
    }

    useEffect(() => {
        if (isPersonaSDLOrPsrOrMDOrKAMOrUGM()) {
            const debouncedFetch = debounce(
                async () => {
                    const currentState = await fetch()
                    if (currentState.isConnected) {
                        await checkAndSendFormData()
                    }
                },
                IntervalTime.TWO_THOUSAND,
                { leading: true, trailing: false }
            )
            const unsubscribe = addEventListener(async (state) => {
                // If off network: Is connected will return twice, false >true
                // So we need to make sure that there is a network when the network changes
                if (state.isConnected) {
                    debouncedFetch()
                }
            })

            return () => {
                unsubscribe()
            }
        }
    }, [])
}

export const useUpdateLocalRealogramFormStatus = (
    visitStatus: string,
    needUpdateFormStatus: boolean,
    setVisitStatus: any
) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (needUpdateFormStatus && visitStatus === VisitStatus.IR_PROCESSING && isPersonaSDLOrPsrOrMDOrKAM()) {
            setVisitStatus(VisitStatus.IN_PROGRESS)
            dispatch(setNeedUpdateFormStatus(false))
        }
    }, [needUpdateFormStatus])
}

export const useUpdateLocalFormStatus = (
    formStatus: FormStatus,
    needUpdateFormStatus: boolean,
    setFormStatus: Dispatch<SetStateAction<FormStatus>>
) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (needUpdateFormStatus && formStatus === FORMStatusEnum.PENDING && isPersonaSDLOrPsrOrMDOrKAMOrUGM()) {
            setFormStatus(FORMStatusEnum.START)
            dispatch(setNeedUpdateFormStatus(false))
        }
    }, [needUpdateFormStatus])
}

export const useListenRealogramFormUrl = (visitId: string, setVisitStatus: any) => {
    useEffect(() => {
        if (visitId) {
            const linkEmit = Linking.addEventListener('url', (e) => {
                const { status, mobileUniqueId } = handleUrl(JSON.stringify(e))
                if (status === FORMUrlStatusEnum.COMPLETED) {
                    setVisitStatus(VisitStatus.IR_PROCESSING)
                    if (!_.isEmpty(mobileUniqueId)) {
                        NetInfo.fetch().then(async (state) => {
                            if (isPersonaSDLOrPsrOrMDOrKAM() && !state.isInternetReachable) {
                                await handleCDAOfflineFormData(visitId, mobileUniqueId, FormType.Realogram)
                            } else {
                                await updateRealogramFormVisit(visitId, setVisitStatus, mobileUniqueId)
                            }
                        })
                    } else {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'There is no mobileUniqueId useListenRealogramFormUrl',
                            ` ${getStringValue(e)}`
                        )
                    }
                }
            })
            return () => {
                linkEmit && linkEmit.remove()
            }
        }
    }, [visitId])
}
