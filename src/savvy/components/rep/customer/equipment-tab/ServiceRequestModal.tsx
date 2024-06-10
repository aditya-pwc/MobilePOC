/**
 * @description Screen for Equipment Install Request
 * @author Kiren Cao
 * @date 2021/12/9
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { Alert, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import HeaderCircle from '../../lead/HeaderCircle'
import { t } from '../../../../../common/i18n/t'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import GlobalModal from '../../../../../common/components/GlobalModal'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import ServiceOverviewForm from './ServiceOverviewForm'
import {
    useDisableSave,
    useEnableReminder,
    useExchangeLineItemsEvenSequential,
    useExistingServiceLineItems,
    useRepairRequestTroublePicklist,
    useServiceHeaderRequest
} from '../../../../hooks/EquipmentServiceInstallRequestHooks'
import _ from 'lodash'
import { CommonParam } from '../../../../../common/CommonParam'
import { getRecordTypeIdByDeveloperName } from '../../../../utils/CommonUtils'
import { syncDownObj, syncUpObjCreateFromMem, syncUpObjDelete, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import ServiceEquipmentForm from './ServiceEquipmentForm'
import { SoupService } from '../../../../service/SoupService'
import moment from 'moment'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { filterExistFields, getAllFieldsByObjName } from '../../../../utils/SyncUtils'
import ExchangeEquipmentForm from './ExchangeEquipmentForm'
import MoveEquipmentForm from './MoveEquipmentForm'
import {
    useAllInstallRequestLineItems,
    useEquipmentGrphcPicklist,
    useEquipmentMovePurposePicklist,
    useFSVDistributionPoint,
    getMoveTypeMapping
} from '../../../../hooks/EquipmentHooks'
import { Log } from '../../../../../common/enums/Log'
import EquipmentSurvey, { judgeVisibleByRule } from './EquipmentSurvey'
import { useSelector } from 'react-redux'
import { PdfPage } from '../../../../helper/rep/PdfHelper'
import {
    initServiceRequestHeader,
    initServiceRequestLineItem,
    validateSurveyResponse
} from '../../../../utils/EquipmentUtils'
import { Button } from 'react-native-elements'
import NewTaskCreation from '../../lead/creation/NewTaskCreation'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { equipmentModalStyle } from './InstallRequestModal'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { getStringValue } from '../../../../utils/LandingUtils'
import { processNoSurveyResponseRequest, useSurveyResponse } from '../../../../hooks/EquipmentRequestHooks'
import { storeClassLog } from '../../../../../common/utils/LogUtils'

const styles = StyleSheet.create({
    ...equipmentModalStyle,
    textTransform: {
        textTransform: 'lowercase'
    }
})

interface ServiceRequestModalProps {
    cRef
    accountId
    customer
    id
    serviceType
    selectEquipmentList
    resetSelections
    setTabRefreshTimes
    onSave
    onBack
    equipmentList
    visible
    setVisible
    equipmentTypeCodeDesc
    readonly
}

const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const equipmentSurveyDataReducer = (state) => state.equipmentSurveyDataReducer
const ServiceRequestModal: FC<ServiceRequestModalProps> = (props: ServiceRequestModalProps) => {
    const {
        accountId,
        id,
        customer,
        serviceType,
        selectEquipmentList,
        resetSelections,
        setTabRefreshTimes,
        onSave,
        onBack,
        equipmentList,
        visible,
        setVisible,
        equipmentTypeCodeDesc,
        readonly
    } = props

    const serviceTypeMapping = {
        Move: 'ONS',
        Pickup: 'PIC',
        Exchange: 'EXI'
    }
    const customerId = customer['Account.CUST_UNIQ_ID_VAL__c']
    const [refreshTimes, setRefreshTimes] = useState(0)
    const [activeStep, setActiveStep] = useState(0)
    const [tempSelectedAssets, setTempSelectedAssets] = useState([])
    const [activePart, setActivePart] = useState(2)
    const [products, setProducts] = useState([])
    const editedAp = useRef(false)
    const newTaskCreationRef = useRef(null)
    const [disableStep2Navigation, setDisableStep2Navigation] = useState(true)
    const [disableStep3Navigation, setDisableStep3Navigation] = useState(true)
    const [changeSurveyAnswer, setChangeSurveyAnswer] = useState(false)

    const surveyData = useSelector(equipmentSurveyDataReducer)

    const { request, setRequest } = useServiceHeaderRequest(id, accountId, customerId, visible)

    const { troublePickList, troublePickListMapping } = useRepairRequestTroublePicklist(
        serviceType,
        tempSelectedAssets[0]?.equip_type_cde__c,
        tempSelectedAssets[0]?.equip_styp_cde__c,
        request.trbl_type_cde__c
    )

    const globalModalRef = useRef(null)
    const existingServiceLineItems = useExistingServiceLineItems(request, refreshTimes, serviceType)
    const exchangeLineItemsEvenSequential = useExchangeLineItemsEvenSequential(request?.Id, refreshTimes)

    const allInstallRequestLineItems = useAllInstallRequestLineItems(accountId, '', refreshTimes, visible)
    const [moveInStoreLocationList, setMoveInStoreLocationList] = useState([])
    const [moveInStoreLocationDuplicateMessageList, setMoveInStoreLocationDuplicateMessageList] = useState([])

    const [tempLineItemIndex, setTempLineItemIndex] = useState(0)
    const [surveyResponse, setSurveyResponse] = useState({
        headerResponse: null,
        lineItemResponseList: [],
        generalEquipmentResponseList: []
    })

    const [tempRequestLineItem, setTempRequestLineItem] = useState(initServiceRequestLineItem())
    const { movePurposeMapping } = useEquipmentMovePurposePicklist(true)
    const { equipmentGrphcPicklistObject } = useEquipmentGrphcPicklist()

    const [refreshDp, setRefreshDp] = useState(0)
    const distributionPointList = useFSVDistributionPoint(
        customer.AccountId,
        '',
        refreshDp,
        tempRequestLineItem?.FSV_Line_Item__c
    )

    const disableSave = useDisableSave({
        overview: request,
        activeStep,
        serviceType,
        existingServiceLineItems,
        exchangeLineItemsEvenSequential,
        activePart,
        moveInStoreLocationList,
        moveInStoreLocationDuplicateMessageList,
        products,
        surveyResponse,
        tempLineItemIndex,
        changeSurveyAnswer,
        tempRequestLineItem,
        readonly
    })
    const enableReminder = useEnableReminder(request, request?.Id, activeStep)

    const fsvItemIndex = exchangeLineItemsEvenSequential.findIndex((item) => item.FSV_Line_Item__c === true)

    useEffect(() => {
        const tempList = [...moveInStoreLocationDuplicateMessageList]
        moveInStoreLocationList.forEach((v, k) => {
            if (v) {
                if (allInstallRequestLineItems.length > 0 || equipmentList.length > 0) {
                    let itemsToCompare = [...allInstallRequestLineItems, ...equipmentList].map((item) => {
                        return item.equip_site_desc__c
                    })
                    const tempMoveInStoreLocationList = [...moveInStoreLocationList]
                    tempMoveInStoreLocationList.splice(k, 1)
                    itemsToCompare = [...itemsToCompare, ...tempMoveInStoreLocationList]
                    tempList[k] = !!itemsToCompare.find((item) => {
                        return item?.toLowerCase() === v?.toLowerCase()
                    })
                } else {
                    tempList[k] = false
                }
            } else {
                tempList[k] = false
            }
        })
        setMoveInStoreLocationDuplicateMessageList(tempList)
    }, [moveInStoreLocationList])

    useEffect(() => {
        const tempList = []
        selectEquipmentList.forEach((item) => {
            if (item.selected) {
                tempList.push(item)
            }
        })
        setTempSelectedAssets(tempList)
        // }
    }, [])

    useSurveyResponse(request, surveyResponse, surveyData, setSurveyResponse)

    const generateGeneralEquipmentSurvey = (lineItems) => {
        const page3 = surveyData[2]
        if (lineItems?.length > 0) {
            const originTypeList = _.uniqWith(lineItems.map((item) => item.equip_type_desc__c))
            const tempTypeScreen = []
            originTypeList.forEach((item) => {
                const questionList = _.cloneDeep(page3?.questionList)
                questionList[0].Answer = [
                    questionList[0].Choices.find((choice) => {
                        return choice.Name === item
                    })
                ]
                let show = false
                for (let i = 1; i < questionList.length; i++) {
                    if (
                        questionList[i].visibilityRule &&
                        judgeVisibleByRule(questionList[i].visibilityRule, questionList)
                    ) {
                        show = true
                    }
                }
                if (show) {
                    tempTypeScreen.push({
                        type: item,
                        questionList
                    })
                }
            })
            return tempTypeScreen
        }
        return null
    }

    useEffect(() => {
        const tempResponseList = []
        const lineItemToProcess =
            serviceTypeMapping[serviceType] === 'EXI' ? exchangeLineItemsEvenSequential : existingServiceLineItems
        if (surveyResponse.lineItemResponseList.length === 0) {
            if (lineItemToProcess?.length > 0) {
                lineItemToProcess.forEach((lineItem) => {
                    // logic below is for the draft which doesn't have survey_response__c
                    if (lineItem.survey_response__c) {
                        tempResponseList.push(JSON.parse(lineItem.survey_response__c))
                    } else {
                        tempResponseList.push(surveyData[1])
                    }
                })
            }
        } else {
            const lineItemResponseList = surveyResponse.lineItemResponseList
            lineItemToProcess.forEach((lineItem) => {
                // logic below is for the draft which doesn't have survey_response__c
                let tempResponse = lineItem.survey_response__c
                    ? JSON.parse(lineItem.survey_response__c)
                    : _.cloneDeep(surveyData[1])
                lineItemResponseList.forEach((lineItemResponse) => {
                    if (lineItem.Id === lineItemResponse.lineItemId) {
                        tempResponse = lineItemResponse
                    }
                })
                tempResponseList.push(tempResponse)
            })
        }
        setSurveyResponse({
            ...surveyResponse,
            lineItemResponseList: tempResponseList
        })
    }, [existingServiceLineItems, exchangeLineItemsEvenSequential])

    useEffect(() => {
        if (activeStep === 0) {
            setDisableStep2Navigation(disableSave)
            setDisableStep3Navigation(request.status__c === 'DRAFT')
        } else if (activeStep === 1) {
            setDisableStep2Navigation(true)
            setDisableStep3Navigation(disableSave || activePart === 4)
        } else if (activeStep === 2) {
            setDisableStep2Navigation(false)
            setDisableStep3Navigation(true)
        }
    }, [activeStep, activePart, disableSave])

    const openPopup = (content?, label?) => {
        globalModalRef?.current?.openModal(content, label)
    }

    const closePopup = () => {
        globalModalRef?.current?.closeModal()
    }

    const saveTempSurveyResponse = async () => {
        try {
            if (request.Id && request.status__c === 'DRAFT') {
                globalModalRef.current.openModal()
                const requestsToUpdate = [
                    {
                        Id: request.Id,
                        survey_response__c: JSON.stringify(surveyResponse.headerResponse),
                        survey_general_equip_details_response__c: JSON.stringify(
                            surveyResponse.generalEquipmentResponseList
                        )
                    }
                ]
                const lineItemsToProcess =
                    serviceType === 'Exchange' ? exchangeLineItemsEvenSequential : existingServiceLineItems
                lineItemsToProcess.forEach((lineItem, k) => {
                    requestsToUpdate.push({
                        Id: lineItem.Id,
                        survey_response__c: JSON.stringify(surveyResponse.lineItemResponseList[k]),
                        survey_general_equip_details_response__c: null
                    })
                })
                await syncUpObjUpdateFromMem('Request__c', requestsToUpdate)
                globalModalRef.current.closeModal()
            }
        } catch (e) {
            globalModalRef.current.closeModal()
            storeClassLog(Log.MOBILE_ERROR, 'saveTempSurveyResponse', getStringValue(e))
        }
    }

    const handleProcessBack = async () => {
        await saveTempSurveyResponse()
        setActiveStep(0)
        setTimeout(() => {
            setRequest(initServiceRequestHeader(accountId, customerId))
        }, 0)
        resetSelections()
        onBack()
        onSave()
        setVisible(false)
    }

    const handleBack = async () => {
        if (request.status__c !== 'DRAFT') {
            if (activeStep === 2 && request.status__c === 'SUBMITTED' && changeSurveyAnswer) {
                Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        onPress: async () => {
                            await saveTempSurveyResponse()
                            setActivePart(0)
                            setActiveStep(0)
                            setVisible(false)
                        }
                    }
                ])
            } else {
                handleProcessBack()
            }
        } else {
            if (serviceType === 'Exchange' && activePart > 1 && activeStep !== 0) {
                Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        onPress: async () => {
                            handleProcessBack()
                        }
                    }
                ])
            } else {
                handleProcessBack()
            }
        }
    }

    const handleCancel = () => {
        if (activeStep === 0) {
            if (request.status__c === 'DRAFT') {
                if (serviceType === 'Repair') {
                    Alert.alert('', t.labels.PBNA_MOBILE_GOING_BACK_WILL_CANCEL_THE_REQUEST_DO_YOU_WANT_TO_PROCEED, [
                        {
                            text: t.labels.PBNA_MOBILE_CANCEL,
                            style: 'cancel'
                        },
                        {
                            text: t.labels.PBNA_MOBILE_YES,
                            onPress: async () => {
                                handleProcessBack()
                            }
                        }
                    ])
                } else {
                    handleProcessBack()
                }
            } else {
                handleProcessBack()
            }
        } else if (activeStep === 1) {
            if (request.status__c === 'DRAFT') {
                if (serviceType === 'Exchange') {
                    if (activePart === 5) {
                        setActivePart(4)
                    } else {
                        Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                            {
                                text: t.labels.PBNA_MOBILE_CANCEL,
                                style: 'cancel'
                            },
                            {
                                text: t.labels.PBNA_MOBILE_YES,
                                onPress: async () => {
                                    setActiveStep(0)
                                }
                            }
                        ])
                    }
                } else {
                    setActiveStep(0)
                }
            } else {
                setActiveStep(0)
            }
        } else if (activeStep === 2 && request.status__c === 'SUBMITTED' && changeSurveyAnswer) {
            Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: async () => {
                        await saveTempSurveyResponse()
                        setActivePart(1)
                        setActiveStep(1)
                    }
                }
            ])
        } else {
            setActiveStep((v) => v - 1)
        }
    }

    const renderFormBottomButtonLabel = () => {
        if (activeStep === 0 && serviceType === 'Repair') {
            return t.labels.PBNA_MOBILE_SUBMIT
        } else if (activeStep === 1) {
            if (activePart === 4) {
                if (serviceType === 'Exchange') {
                    return t.labels.PBNA_MOBILE_NEXT
                }
                return t.labels.PBNA_MOBILE_NEXT
            }
            return t.labels.PBNA_MOBILE_NEXT
        } else if (activeStep === 2) {
            if (request.status__c !== 'DRAFT') {
                return t.labels.PBNA_MOBILE_UPDATE_DETAILS
            }
            return t.labels.PBNA_MOBILE_SUBMIT
        }
        return t.labels.PBNA_MOBILE_NEXT
    }

    const updateGeneralEquipmentDetail = async (lineItems, requestData?) => {
        const requestToUpdate = requestData || _.cloneDeep(request)
        const generalEquipmentSurveyReponse = JSON.stringify(generateGeneralEquipmentSurvey(lineItems))
        if (generalEquipmentSurveyReponse) {
            requestToUpdate.survey_general_equip_details_response__c = generalEquipmentSurveyReponse
        }
        const fieldsToUpdate = ['Id', 'survey_general_equip_details_response__c']
        const [{ data }] = await syncUpObjUpdateFromMem(
            'Request__c',
            filterExistFields('Request__c', [requestToUpdate], fieldsToUpdate)
        )
        setRequest({
            ..._.cloneDeep(data[0])
        })
        setRefreshTimes((v) => v + 1)
    }

    const handlePressRemove = async (existingServiceLineItem) => {
        if (existingServiceLineItems.length > 1) {
            globalModalRef.current?.openModal()
            try {
                await syncUpObjDelete([existingServiceLineItem.Id])
                await SoupService.removeRecordFromSoup('Request__c', [existingServiceLineItem._soupEntryId + ''])
                const tempLineItems = _.cloneDeep(existingServiceLineItems)
                _.remove(tempLineItems, (o) => {
                    // @ts-ignore
                    return o.Id === existingServiceLineItem.Id
                })
                await updateGeneralEquipmentDetail(tempLineItems)
                setRefreshTimes((v) => v + 1)
            } catch (e) {
            } finally {
                globalModalRef.current?.closeModal()
            }
        } else {
            globalModalRef.current?.openModal()
            try {
                await syncUpObjDelete([existingServiceLineItem.Id, request.Id])
                await SoupService.removeRecordFromSoup('Request__c', [
                    existingServiceLineItem._soupEntryId + '',
                    request._soupEntryId + ''
                ])
                handleProcessBack()
            } catch (e) {
            } finally {
                globalModalRef.current?.closeModal()
            }
        }
    }

    const handleDeleteOriginAndExchangeEquipment = async (existingServiceLineItem) => {
        openPopup()
        try {
            const sequence = parseInt(existingServiceLineItem.order_line_num__c)
            const exchangeLineItem = exchangeLineItemsEvenSequential.find(
                (v) => parseInt(v.order_line_num__c) === sequence + 1
            )
            let requestToDelete = [existingServiceLineItem]
            if (exchangeLineItem) {
                const res = await SoupService.retrieveDataFromSoup(
                    'Request__c',
                    {},
                    ['Id'],
                    'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                        "WHERE ({Request__c:request_subtype__c}='Move Request Product' " +
                        "OR {Request__c:request_subtype__c}='Move Request Accessory') AND " +
                        `{Request__c:parent_request_record__c}='${exchangeLineItem.Id}'`
                )
                requestToDelete = [...requestToDelete, exchangeLineItem, ...res]
            }
            const deleteRequest = existingServiceLineItems.length === 1
            if (deleteRequest) {
                requestToDelete.push(request)
            }
            await syncUpObjDelete(requestToDelete.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                requestToDelete.map((v) => v._soupEntryId + '')
            )
            if (deleteRequest) {
                handleProcessBack()
            }
            if (!deleteRequest) {
                const tempLineItems = _.cloneDeep(existingServiceLineItems)
                _.remove(tempLineItems, (o) => {
                    return o.Id === existingServiceLineItem.Id
                })
                await updateGeneralEquipmentDetail(tempLineItems)
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'ServiceRequestModal: handleDeleteOriginAndExchangeEquipment',
                getStringValue(e)
            )
        } finally {
            closePopup()
            setRefreshTimes((v) => v + 1)
        }
    }

    const syncOverView = async (targetStep?: number) => {
        const serviceTypeCode = serviceTypeMapping[serviceType]
        globalModalRef.current?.openModal()
        if (request?.Id) {
            const requestToUpdate = _.cloneDeep(request)
            requestToUpdate.Created_By_Savvy__c = true
            const fieldsToUpdate = [
                'Id',
                'requested_by__c',
                'equip_move_type_cde__c',
                'RecordTypeId',
                'request_subtype__c',
                'customer__c',
                'customer_id__c',
                'request_gpid__c',
                'caller_name__c',
                'move_purpose_cde__c',
                'move_request_date__c',
                'comments__c',
                'wndw_beg_tme__c',
                'wndw_end_tme__c',
                'equip_move_type_desc__c',
                'caller_phone_num__c',
                'email_addr_txt__c',
                'Created_By_Savvy__c'
            ]
            try {
                await syncUpObjUpdateFromMem(
                    'Request__c',
                    filterExistFields('Request__c', [requestToUpdate], fieldsToUpdate)
                )
                setRefreshTimes((v) => v + 1)
                if (targetStep) {
                    setActiveStep(targetStep)
                    setActivePart(2)
                } else {
                    setActiveStep((v) => v + 1)
                    setActivePart(2)
                }
            } catch (e) {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'Rep-syncOverView',
                    'update Request Overview Error: ' + getStringValue(e)
                )
            } finally {
                globalModalRef.current?.closeModal()
            }
        } else {
            if (tempSelectedAssets.length > 0) {
                const requestToProcess = _.cloneDeep(request)
                delete requestToProcess.Email
                delete requestToProcess.Phone
                delete requestToProcess.Title
                delete requestToProcess.Id
                const fieldsToCreate = [
                    'requested_by__c',
                    'equip_move_type_cde__c',
                    'RecordTypeId',
                    'request_subtype__c',
                    'customer__c',
                    'customer_id__c',
                    'request_gpid__c',
                    'caller_name__c',
                    'move_purpose_cde__c',
                    'move_request_date__c',
                    'comments__c',
                    'wndw_beg_tme__c',
                    'wndw_end_tme__c',
                    'display_in_asset_tab__c',
                    'display_in_service_tab__c',
                    'equip_move_type_desc__c',
                    'caller_phone_num__c',
                    'email_addr_txt__c',
                    'survey_response__c',
                    'Created_By_Savvy__c'
                ]
                try {
                    requestToProcess.equip_move_type_cde__c = serviceTypeCode
                    requestToProcess.customer__c = accountId
                    requestToProcess.survey_response__c = JSON.stringify(surveyData?.[0])
                    requestToProcess.Created_By_Savvy__c = true
                    requestToProcess.RecordTypeId = await getRecordTypeIdByDeveloperName('Move_Request', 'Request__c')
                    const [{ data }] = await syncUpObjCreateFromMem(
                        'Request__c',
                        filterExistFields('Request__c', [requestToProcess], fieldsToCreate)
                    )
                    setRequest({ ...request, ...data[0] })
                    const lineItemsToCreate = []
                    tempSelectedAssets.forEach((item) => {
                        lineItemsToCreate.push({
                            request_id__c: data[0].Id,
                            parent_request_record__c: data[0].Id,
                            Equip_type_cde__c: item.equip_type_cde__c,
                            equip_styp_cde__c: item.equip_styp_cde__c,
                            equip_move_type_cde__c: serviceTypeCode,
                            std_setup_equip_id__c: 0,
                            equip_grphc_id__c: item.equip_grphc_id__c,
                            equip_config_type_cde__c: item.equip_config_type_cde__c,
                            display_in_service_tab__c: false,
                            display_in_asset_tab__c: false,
                            RecordTypeId: requestToProcess.RecordTypeId,
                            request_subtype__c: 'Move Request Line Item',
                            requested_by__c: CommonParam.userId,
                            ident_item_id__c: item.ident_item_id__c,
                            equip_site_desc__c: item.equip_site_desc__c,
                            Sls_plan_cde__c: item.sls_plan_cde__c,
                            Serv_ctrct_id__c: item.serv_ctrct_id__c,
                            equip_type_desc__c: item.equip_type_desc__c,
                            equip_styp_desc__c: item.equip_styp_desc__c,
                            customer__c: accountId
                        })
                    })
                    if (serviceTypeCode === 'ONS' || serviceTypeCode === 'PIC') {
                        _.forEach(lineItemsToCreate, (v, k) => {
                            v.order_line_num__c = k + 1
                        })
                    } else if (serviceTypeCode === 'EXI') {
                        _.forEach(lineItemsToCreate, (v, k) => {
                            v.order_line_num__c = 2 * k + 1
                            v.ord_lne_rel_num__c = 2 * k + 2
                            v.equip_move_type_cde__c = 'EXP'
                        })
                    }
                    const [res] = await syncUpObjCreateFromMem('Request__c', lineItemsToCreate)
                    const lineItemData = res.data
                    if (serviceTypeCode !== 'EXI') {
                        const lineItemsToUpdate = []
                        lineItemData.forEach((lineItem) => {
                            const tempSurveyResponse = _.cloneDeep(surveyData[1])
                            if (tempSurveyResponse.questionList === undefined) {
                                throw new Error('Invalidate Survey Data')
                            }
                            const question1 = tempSurveyResponse.questionList[0]
                            const question2 = tempSurveyResponse.questionList[1]
                            const moveType = getMoveTypeMapping()[serviceTypeCode]
                            const typeDescription = equipmentTypeCodeDesc[lineItem.Equip_type_cde__c]
                            if (typeDescription === undefined) {
                                throw new Error('Invalidate Equipment Type Code: ' + lineItem.Equip_type_cde__c)
                            }
                            question1?.Choices?.forEach((choice) => {
                                if (choice.Name === moveType) {
                                    question1.Answer = [choice]
                                }
                            })
                            question2?.Choices?.forEach((choice) => {
                                if (choice.Name.toLowerCase() === typeDescription.toLowerCase()) {
                                    question2.Answer = [choice]
                                }
                            })
                            tempSurveyResponse.lineItemId = lineItem.Id
                            lineItemsToUpdate.push({
                                Id: lineItem.Id,
                                survey_response__c: JSON.stringify(tempSurveyResponse)
                            })
                        })
                        await syncUpObjUpdateFromMem('Request__c', lineItemsToUpdate)
                        await updateGeneralEquipmentDetail(lineItemData, data[0])
                    }
                    setRefreshTimes((v) => v + 1)
                    if (targetStep) {
                        setActiveStep(targetStep)
                        setActivePart(2)
                    } else {
                        setActiveStep((v) => v + 1)
                        setActivePart(2)
                    }
                } catch (e) {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'Rep-syncOverView',
                        'sync Request Overview Error: ' + getStringValue(e)
                    )
                } finally {
                    globalModalRef.current?.closeModal()
                }
            }
        }
    }

    const onRequestSubmitted = () => {
        global.$globalModal.openModal(
            <ProcessDoneModal type="success">
                <PopMessage>
                    {t.labels.PBNA_MOBILE_YOUR}&nbsp;
                    <CText style={styles.textTransform}>{serviceType}</CText>{' '}
                    {t.labels.PBNA_MOBILE_REQUEST_HAS_BEEN_SUBMITTED.toLowerCase()}&nbsp;!
                </PopMessage>
            </ProcessDoneModal>
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
        setActiveStep(0)
        setRequest(initServiceRequestHeader(accountId, customerId))
        setMoveInStoreLocationDuplicateMessageList([])
        setMoveInStoreLocationList([])
        resetSelections()
        onSave()
        onBack()
        setVisible(false)
    }

    const noticeSendEmail = () => {
        globalModalRef?.current?.openModal(
            <ProcessDoneModal type={'failed'}>
                <PopMessage>{t.labels.PBNA_MOBILE_NOTIVE_SEND_EMAIL}</PopMessage>
            </ProcessDoneModal>,
            'OK'
        )
        setTimeout(() => {
            globalModalRef?.current?.closeModal()
        }, 3000)
    }

    const submitRequest = async (fsvContract) => {
        let mailResponse = {
            mailRes: '',
            usedImg: []
        }
        const installRequestDate = moment(request.move_request_date__c)
        if (installRequestDate.isAfter(moment().add(serviceTypeMapping[serviceType] !== 'EXI' ? 0 : 6, 'days'))) {
            openPopup()
            const surveyHeaderResponse = _.cloneDeep(surveyResponse.headerResponse)
            surveyHeaderResponse.questionList.forEach((question) => {
                question.done = true
            })
            const surveyLineItemResponse = _.cloneDeep(surveyResponse.lineItemResponseList)
            surveyLineItemResponse.forEach((lineItemResponse) => {
                lineItemResponse.questionList.forEach((question) => {
                    question.done = true
                })
            })
            const surveyGeneralDetailResponse = _.cloneDeep(surveyResponse.generalEquipmentResponseList)
            surveyGeneralDetailResponse.forEach((equipmentResponse) => {
                equipmentResponse.questionList.forEach((question) => {
                    question.done = true
                })
            })
            const headerRequestToUpdate = {
                Id: request.Id,
                Send_to_CETS__c: true,
                submitted_date__c: moment().format('YYYY-MM-DD'),
                survey_response__c: JSON.stringify(surveyHeaderResponse),
                survey_general_equip_details_response__c: JSON.stringify(surveyGeneralDetailResponse),
                details_revision_num__c: request.details_revision_num__c,
                fsv_contract__c: serviceType === 'Exchange' && fsvContract
            }
            const installRequestLineItemsToUpdate = existingServiceLineItems.map((v, k) => {
                return {
                    Id: v.Id,
                    submitted_date__c: moment().format('YYYY-MM-DD'),
                    order_line_num__c: serviceType === 'Exchange' ? 2 * k + 1 : k + 1,
                    ord_lne_rel_num__c: serviceType === 'Exchange' ? 2 * k + 2 : null,
                    equip_site_desc__c: serviceType === 'Move' ? moveInStoreLocationList[k] : v.equip_site_desc__c,
                    survey_response__c: serviceType !== 'Exchange' ? JSON.stringify(surveyLineItemResponse[k]) : null,
                    details_revision_num__c: request.details_revision_num__c
                }
            })
            let installRequestLineItemsExchangeToUpdate = []
            if (serviceType === 'Exchange') {
                installRequestLineItemsExchangeToUpdate = exchangeLineItemsEvenSequential.map((v, k) => {
                    return {
                        Id: v.Id,
                        submitted_date__c: moment().format('YYYY-MM-DD'),
                        order_line_num__c: 2 * k + 2,
                        ord_lne_rel_num__c: 2 * k + 1,
                        survey_response__c: JSON.stringify(surveyLineItemResponse[k]),
                        details_revision_num__c: request.details_revision_num__c
                    }
                })
            }
            closePopup()
            try {
                let requestLineItem
                if (serviceType === 'Exchange') {
                    requestLineItem = exchangeLineItemsEvenSequential
                } else {
                    requestLineItem = existingServiceLineItems
                }
                openPopup()
                mailResponse = await PdfPage(
                    surveyHeaderResponse,
                    surveyLineItemResponse,
                    requestLineItem,
                    customer,
                    '',
                    'RetailStore',
                    request,
                    movePurposeMapping,
                    equipmentGrphcPicklistObject,
                    surveyGeneralDetailResponse
                )
                closePopup()
            } catch (e) {
                closePopup()
                storeClassLog(Log.MOBILE_ERROR, 'serviceSubmitRequest', getStringValue(e))
            } finally {
                if (mailResponse.mailRes === 'sent') {
                    openPopup()
                    if (!headerRequestToUpdate.details_revision_num__c) {
                        headerRequestToUpdate.details_revision_num__c = 1
                        if (serviceType === 'Exchange') {
                            installRequestLineItemsExchangeToUpdate.forEach((item) => {
                                item.details_revision_num__c = 1
                            })
                        }
                        installRequestLineItemsToUpdate.forEach((item) => {
                            item.details_revision_num__c = 1
                        })
                    } else {
                        headerRequestToUpdate.details_revision_num__c =
                            parseInt(headerRequestToUpdate.details_revision_num__c) + 1
                        if (serviceType === 'Exchange') {
                            installRequestLineItemsExchangeToUpdate.forEach((item) => {
                                item.details_revision_num__c = parseInt(item.details_revision_num__c) + 1
                            })
                        }
                        installRequestLineItemsToUpdate.forEach((item) => {
                            item.details_revision_num__c = parseInt(item.details_revision_num__c) + 1
                        })
                    }
                    await syncUpObjUpdateFromMem('Request__c', [
                        headerRequestToUpdate,
                        ...installRequestLineItemsToUpdate,
                        ...installRequestLineItemsExchangeToUpdate
                    ])
                    if (exchangeLineItemsEvenSequential[0]?.FSV_Line_Item__c) {
                        if (
                            distributionPointList[0]['Request__r.status__c'] === 'DRAFT' ||
                            _.isEmpty(distributionPointList[0]['Request__r.status__c'])
                        ) {
                            await syncUpObjUpdateFromMem('Customer_to_Route__c', [
                                {
                                    Id: distributionPointList[0]?.Id,
                                    Request__c: exchangeLineItemsEvenSequential[0].Id,
                                    Send_New_DP__c: true
                                }
                            ])
                        } else {
                            await syncUpObjUpdateFromMem('Customer_to_Route__c', [
                                {
                                    Id: distributionPointList[0]?.Id,
                                    Send_New_DP__c: true
                                }
                            ])
                        }
                        await syncUpObjUpdateFromMem('Account', [{ Id: customer.AccountId, Send_New_DP__c: true }])
                    }
                    if (request.status__c === 'DRAFT') {
                        Instrumentation.reportMetric('Submit a request', 1)
                    } else {
                        Instrumentation.reportMetric('Update a request', 1)
                    }
                    await syncDownObj(
                        'Customer_to_Route__c',
                        `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join(',')} FROM 
                            Customer_to_Route__c WHERE Customer__c = '${accountId}' AND ACTV_FLG__c = true 
                            AND SLS_MTHD_NM__c = 'FSV' AND Merch_Flag__c = false`
                    )
                    setTabRefreshTimes((v) => v + 1)
                    setVisible(false)
                    onRequestSubmitted()
                } else {
                    noticeSendEmail()
                }
            }
        } else {
            globalModalRef?.current?.openModal(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_INSTALL_DATE_MUST_BE_FUTURE_MSG}</PopMessage>
                </ProcessDoneModal>,
                'OK'
            )
            setActiveStep(0)
        }
    }

    const submitRepairRequest = async () => {
        if (tempSelectedAssets.length > 0) {
            openPopup()
            let requestToSubmit = {}
            try {
                requestToSubmit = {
                    requested_by__c: CommonParam.userId,
                    RecordTypeId: await getRecordTypeIdByDeveloperName('Service_Request', 'Request__c'),
                    request_subtype__c: 'Service Request',
                    customer__c: accountId,
                    customer_id__c: customerId,
                    asset_id__c: tempSelectedAssets[0].Id,
                    request_gpid__c: CommonParam.GPID__c,
                    requester_phone_num__c: CommonParam.MobilePhone,
                    ident_item_id__c: tempSelectedAssets[0].ident_item_id__c,
                    caller_name__c: request.caller_name__c,
                    caller_phone_num__c: request.Phone,
                    email_addr_txt__c: request.email_addr_txt__c,
                    comments__c: request.comments__c,
                    display_in_asset_tab__c: false,
                    display_in_service_tab__c: true,
                    equip_move_type_cde__c: 'Repair',
                    Send_to_CETS__c: true,
                    submitted_date__c: moment().format('YYYY-MM-DD'),
                    trbl_type_cde__c: request.trbl_type_cde__c,
                    Created_By_Savvy__c: true
                }
                await syncUpObjCreateFromMem('Request__c', [requestToSubmit])
                closePopup()
                setTabRefreshTimes((v) => v + 1)
                onRequestSubmitted()
                setVisible(false)
            } catch (e) {
                closePopup()
                storeClassLog(Log.MOBILE_ERROR, 'ServiceRequestModal: submitRepairRequest', getStringValue(e), {
                    Data__c: requestToSubmit
                })
            }
        }
    }
    const handleSave = () => {
        switch (activeStep) {
            case 0:
                if (serviceType !== 'Repair') {
                    if (request.status__c === 'DRAFT') {
                        syncOverView()
                    } else {
                        setActiveStep((v) => v + 1)
                    }
                } else {
                    submitRepairRequest()
                }
                break
            case 1:
                if (activePart === 4) {
                    if (serviceType === 'Exchange') {
                        setActivePart((v) => v + 1)
                        editedAp.current = true
                    } else {
                        setActiveStep(2)
                    }
                } else {
                    processNoSurveyResponseRequest(
                        serviceTypeMapping[serviceType] === 'EXI'
                            ? exchangeLineItemsEvenSequential
                            : existingServiceLineItems,
                        surveyData,
                        request,
                        globalModalRef,
                        setRefreshTimes,
                        setActiveStep
                    )
                }
                break
            case 2:
                if (serviceType === 'Exchange' && fsvItemIndex !== -1) {
                    Alert.alert('', t.labels.PBNA_MOBILE_FSV_CONTRACT_SETUP, [
                        {
                            text: t.labels.PBNA_MOBILE_NO,
                            onPress: () => {
                                submitRequest(false)
                            }
                        },
                        {
                            text: t.labels.PBNA_MOBILE_YES,
                            onPress: () => {
                                submitRequest(true)
                            }
                        }
                    ])
                } else {
                    submitRequest(false)
                }
                break
            default:
        }
    }

    const renderForm = () => {
        switch (activeStep) {
            case 0:
                return (
                    <ServiceOverviewForm
                        readonly={readonly}
                        overview={request}
                        setOverView={setRequest}
                        accountId={accountId}
                        serviceType={serviceType}
                        troublePickList={troublePickList}
                        troublePickListMapping={troublePickListMapping}
                    />
                )
            case 1:
                if (serviceTypeMapping[serviceType] !== 'EXI') {
                    if (serviceTypeMapping[serviceType] === 'ONS') {
                        return (
                            <MoveEquipmentForm
                                readonly={readonly}
                                existingServiceLineItems={existingServiceLineItems}
                                equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                                handlePressRemove={handlePressRemove}
                                inStoreLocationList={moveInStoreLocationList}
                                setInStoreLocationList={setMoveInStoreLocationList}
                                duplicateMessageList={moveInStoreLocationDuplicateMessageList}
                                setDuplicateMessageList={setMoveInStoreLocationDuplicateMessageList}
                                overview={request}
                            />
                        )
                    }
                    return (
                        <ServiceEquipmentForm
                            readonly={readonly}
                            existingServiceLineItems={existingServiceLineItems}
                            equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                            serviceType={serviceType}
                            handlePressRemove={handlePressRemove}
                            overview={request}
                        />
                    )
                }
                return (
                    <ExchangeEquipmentForm
                        readonly={readonly}
                        existingServiceLineItems={existingServiceLineItems}
                        serviceType={serviceType}
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        handlePressRemove={handlePressRemove}
                        customer={customer}
                        request={request}
                        products={products}
                        setProducts={setProducts}
                        editedAp={editedAp}
                        refreshTimes={refreshTimes}
                        setRefreshTimes={setRefreshTimes}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        accountId={accountId}
                        equipmentList={equipmentList}
                        activePart={activePart}
                        setActivePart={setActivePart}
                        exchangeLineItemsEvenSequential={exchangeLineItemsEvenSequential}
                        handleDeleteOriginAndExchangeEquipment={handleDeleteOriginAndExchangeEquipment}
                        allInstallRequestLineItems={allInstallRequestLineItems}
                        surveyData={surveyData}
                        tempIndex={tempLineItemIndex}
                        setTempIndex={setTempLineItemIndex}
                        tempRequestLineItem={tempRequestLineItem}
                        setTempRequestLineItem={setTempRequestLineItem}
                        distributionPointList={distributionPointList}
                        setRefreshDp={setRefreshDp}
                        updateGeneralEquipmentDetail={updateGeneralEquipmentDetail}
                    />
                )
            case 2:
                return (
                    <EquipmentSurvey
                        request={request}
                        installRequestLineItems={
                            serviceTypeMapping[serviceType] === 'EXI'
                                ? exchangeLineItemsEvenSequential
                                : existingServiceLineItems
                        }
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        surveyResponse={surveyResponse}
                        setSurveyResponse={setSurveyResponse}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        setChangeSurveyAnswer={setChangeSurveyAnswer}
                        readonly={!enableReminder || isPersonaCRMBusinessAdmin() || readonly}
                    />
                )
            default:
                break
        }
    }

    const drawHeaderTriangle = (defaultActive, activeStepNum, drawStyles) => {
        return (
            <View>
                {activeStepNum === defaultActive && (
                    <View>
                        <View style={drawStyles.selectTriangle} />
                        <View style={[drawStyles.selectTriangle, drawStyles.bottomLeftTriangle]} />
                    </View>
                )}
                {activeStepNum !== defaultActive && (
                    <View>
                        <View style={drawStyles.unselectTriangle} />
                        <View style={[drawStyles.unselectTriangle, drawStyles.bottomLeftTriangle]} />
                    </View>
                )}
            </View>
        )
    }

    return (
        <Modal visible>
            <SafeAreaView style={[styles.container, activeStep === 1 && styles.whiteContainer]}>
                <View style={styles.eHeader}>
                    <View style={styles.equipmentContainer}>
                        <CText style={styles.eTitle}>
                            {_.capitalize(t.labels.PBNA_MOBILE_NEW)} {serviceType} {t.labels.PBNA_MOBILE_REQUEST}
                        </CText>
                        <HeaderCircle
                            onPress={() => {
                                handleBack()
                            }}
                            transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                            color={'#0098D4'}
                        />
                    </View>
                    <View style={styles.stepView}>
                        <TouchableOpacity
                            style={[
                                styles.firstStep,
                                activeStep === 0 && styles.activeStep,
                                serviceType === 'Repair' ? { width: '96.5%' } : {}
                            ]}
                            disabled={activeStep === 0}
                            onPress={() => {
                                if (activeStep === 1) {
                                    if (request.status__c === 'DRAFT') {
                                        if (serviceType === 'Exchange' && activePart > 1) {
                                            Alert.alert(
                                                '',
                                                t.labels
                                                    .PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
                                                [
                                                    {
                                                        text: t.labels.PBNA_MOBILE_CANCEL,
                                                        style: 'cancel'
                                                    },
                                                    {
                                                        text: t.labels.PBNA_MOBILE_YES,
                                                        onPress: async () => {
                                                            setActiveStep(0)
                                                        }
                                                    }
                                                ]
                                            )
                                        } else {
                                            setActiveStep(0)
                                        }
                                    } else {
                                        setActiveStep(0)
                                    }
                                }
                                if (activeStep === 2) {
                                    setActiveStep(0)
                                }
                            }}
                        >
                            <CText style={[styles.firstStepTitle, activeStep === 0 && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_ONE}
                            </CText>
                            <View style={styles.flexRowEnd}>
                                <CText style={[styles.firstStepText, activeStep === 0 && styles.activeStepColor]}>
                                    {t.labels.PBNA_MOBILE_OVERVIEW}
                                </CText>
                                {(activeStep === 1 || activeStep === 2) && (
                                    <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={commonStyle.flexDirectionRow}>
                            {drawHeaderTriangle(0, activeStep, styles)}
                            <View style={styles.headerContainer}>
                                <View style={styles.headerContainer2} />
                                <View>
                                    <View style={styles.bottomTriangle} />
                                    <View style={[styles.bottomTriangle, styles.bottomLeftTriangle]} />
                                </View>
                            </View>
                        </View>
                        {serviceType !== 'Repair' && (
                            <TouchableOpacity
                                style={[styles.secondStep, activeStep === 1 && styles.activeStep]}
                                disabled={disableStep2Navigation}
                                onPress={() => {
                                    if (activeStep === 0) {
                                        if (request.status__c === 'DRAFT') {
                                            syncOverView()
                                        } else {
                                            setActiveStep((v) => v + 1)
                                        }
                                    }
                                    if (activeStep === 2) {
                                        setActiveStep(1)
                                    }
                                }}
                            >
                                <CText style={[styles.secondStepTitle, activeStep === 1 && styles.activeStepColor]}>
                                    {t.labels.PBNA_MOBILE_STEP_TWO}
                                </CText>
                                <View style={styles.flexRowEnd}>
                                    <CText style={[styles.secondStepText, activeStep === 1 && styles.activeStepColor]}>
                                        {t.labels.PBNA_MOBILE_EQUIPMENT}
                                    </CText>
                                    {(activeStep === 2 || (request.status__c !== 'DRAFT' && activeStep !== 1)) && (
                                        <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        {serviceType !== 'Repair' && (
                            <View style={styles.bottomTriangleContainer}>
                                {drawHeaderTriangle(1, activeStep, styles)}
                                <View style={styles.headerContainer3}>
                                    <View style={styles.headerContainer4} />
                                    <View>
                                        <View style={styles.bottomTriangle} />
                                        <View style={[styles.bottomTriangle, styles.bottomLeftTriangle]} />
                                    </View>
                                </View>
                            </View>
                        )}
                        {serviceType !== 'Repair' && (
                            <TouchableOpacity
                                style={[styles.thirdStep, activeStep === 2 && styles.activeStep]}
                                onPress={async () => {
                                    if (activeStep === 0) {
                                        if (request.status__c === 'DRAFT') {
                                            syncOverView(2)
                                        } else {
                                            setActiveStep(2)
                                        }
                                    } else {
                                        setActiveStep(2)
                                    }
                                }}
                                disabled={disableStep3Navigation}
                            >
                                <CText style={[styles.secondStepTitle, activeStep === 2 && styles.activeStepColor]}>
                                    {t.labels.PBNA_MOBILE_STEP_THREE.toLocaleUpperCase()}
                                </CText>
                                <View style={styles.flexRowEnd}>
                                    <CText style={[styles.secondStepText, activeStep === 2 && styles.activeStepColor]}>
                                        {t.labels.PBNA_MOBILE_DETAILS}
                                    </CText>
                                    {activeStep !== 2 &&
                                        request.status__c !== 'DRAFT' &&
                                        validateSurveyResponse(surveyResponse) && (
                                            <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                                        )}
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.formContainer}>{renderForm()}</View>
                    {activeStep === 2 && enableReminder && !isPersonaCRMBusinessAdmin() && !readonly && (
                        <Button
                            title={
                                <CText style={styles.updateDetailsText}>
                                    {t.labels.PBNA_MOBILE_UPDATE_DETAILS_REMINDER.toUpperCase()}
                                </CText>
                            }
                            containerStyle={styles.updateDetailsContainer}
                            buttonStyle={styles.updateDetailsBtn}
                            onPress={() => {
                                Instrumentation.reportMetric(
                                    `${CommonParam.PERSONA__c} Presses Update Details Reminder Button`,
                                    1
                                )
                                newTaskCreationRef?.current?.open()
                            }}
                        />
                    )}
                    <FormBottomButton
                        onPressCancel={handleCancel}
                        leftButtonLabel={t.labels.PBNA_MOBILE_BACK}
                        rightButtonLabel={renderFormBottomButtonLabel()}
                        onPressSave={handleSave}
                        relative
                        disableSave={disableSave}
                    />
                </View>
            </SafeAreaView>
            <GlobalModal ref={globalModalRef} />
            <NewTaskCreation
                l={customer}
                cRef={newTaskCreationRef}
                onSave={onSave}
                type={'RetailStore'}
                isSurvey
                openPopup={openPopup}
                closePopup={closePopup}
            />
        </Modal>
    )
}

export default ServiceRequestModal
