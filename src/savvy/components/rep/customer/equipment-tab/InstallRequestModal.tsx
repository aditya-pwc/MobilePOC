/**
 * @description Screen for Equipment Install Request
 * @author Kiren Cao
 * @date 2021/12/9
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import HeaderCircle from '../../lead/HeaderCircle'
import _ from 'lodash'
import { syncDownObj, syncUpObjCreateFromMem, syncUpObjDelete, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { Log } from '../../../../../common/enums/Log'
import { CommonParam } from '../../../../../common/CommonParam'
import { filterExistFields, getAllFieldsByObjName } from '../../../../utils/SyncUtils'
import {
    processNoSurveyResponseRequest,
    useDisableSave,
    useSurveyResponse
} from '../../../../hooks/EquipmentRequestHooks'
import {
    useAllInstallRequestLineItems,
    useExistingAccessoryRequests,
    useExistingProductRequests,
    useInstallHeaderRequest,
    useInstallRequestLineItems,
    getMoveTypeMapping,
    useRequestRecordTypeId,
    useEquipmentMovePurposePicklist,
    useEquipmentGrphcPicklist,
    useFSVDistributionPoint
} from '../../../../hooks/EquipmentHooks'
import EquipmentForm from './EquipmentForm'
import { SoupService } from '../../../../service/SoupService'
import moment from 'moment'
import GlobalModal from '../../../../../common/components/GlobalModal'
import EquipmentSurvey, { judgeVisibleByRule } from './EquipmentSurvey'
import { useSelector } from 'react-redux'
import { PdfPage } from '../../../../helper/rep/PdfHelper'
import {
    initInstallRequestHeader,
    initInstallRequestLineItem,
    validateSurveyResponse
} from '../../../../utils/EquipmentUtils'
import InstallOverviewForm from './InstallOverviewForm'
import { Button } from 'react-native-elements'
import NewTaskCreation from '../../lead/creation/NewTaskCreation'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { useEnableReminder } from '../../../../hooks/EquipmentServiceInstallRequestHooks'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import EquipmentPdfModal from './EquipmentPdfModal'
import { onSubmitForCustomer } from '../../../../helper/rep/CofHelper'
import { useCofCheckData } from '../../../../hooks/LeadHooks'

interface EquipmentRequestModalProps {
    cRef: any
    accountId: string
    customer: any
    id?: string
    onSave: any
    onBack: any
    setTabRefreshTimes
    equipmentList
    equipmentTypeCodeDesc
    visible
    setVisible
    type: 'Lead' | 'RetailStore'
    l: any
    leadId: string
    readonly?: boolean
    setLeadDetail?: any
}

export const equipmentModalStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    stepView: {
        marginTop: 45,
        height: 50,
        flexDirection: 'row'
    },
    activeStep: {
        backgroundColor: baseStyle.color.loadingGreen
    },
    firstStep: {
        width: '32%',
        paddingLeft: 22,
        justifyContent: 'center',
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray
    },
    firstStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    firstStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    activeStepColor: {
        color: baseStyle.color.white
    },
    selectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.loadingGreen,
        borderLeftColor: baseStyle.color.transparent
    },
    unselectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.bgGray,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.white,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomLeftTriangle: {
        transform: [{ rotateX: '180deg' }]
    },
    secondStep: {
        width: '35%',
        left: -13,
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -2
    },
    thirdStep: {
        width: '33%',
        left: -25,
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -4
    },
    secondStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    secondStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 8
    },
    flexRowEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    maximumText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.red
    },
    equipmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
        paddingHorizontal: '5%'
    },
    headerContainer: {
        position: 'absolute',
        zIndex: -2,
        flexDirection: 'row'
    },
    headerContainer2: {
        zIndex: -2,
        width: 3,
        height: '100%',
        backgroundColor: 'white'
    },
    bottomTriangleContainer: {
        flexDirection: 'row',
        left: -13
    },
    headerContainer3: {
        position: 'absolute',
        zIndex: -4,
        flexDirection: 'row'
    },
    headerContainer4: {
        zIndex: -4,
        width: 3,
        height: '100%',
        backgroundColor: 'white'
    },
    formContainer: {
        flex: 1,
        marginTop: -8,
        zIndex: -10
    },
    updateDetailsText: {
        fontWeight: '500',
        color: 'white'
    },
    updateDetailsContainer: {
        width: '100%',
        padding: 0,
        borderRadius: 5,
        paddingHorizontal: '5%',
        marginBottom: 20,
        backgroundColor: 'transparent'
    },
    updateDetailsBtn: {
        backgroundColor: '#00A2D9',
        height: 40
    },
    leadCofSucContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    leadCofSucInnerContainer: {
        backgroundColor: '#FFFFFF',
        height: 280,
        width: 330,
        borderRadius: 8
    },
    sucPopupPadding: {
        paddingHorizontal: '2.25%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sucImage: {
        width: 60,
        marginTop: 45,
        marginBottom: 15,
        height: 57
    },
    sucMsg: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    sucButtonContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row'
    },
    sucButtonStyle: {
        width: '50%',
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.5,
        shadowRadius: 3
    },
    cancelTitle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        color: '#6C0CC3',
        fontSize: 12
    },
    cancelButtonStyle: {
        height: 55,
        backgroundColor: '#FFFFFF'
    },
    halfWidth: {
        width: '50%'
    },
    submitTitle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        fontSize: 12
    },
    submitButtonStyle: {
        height: 55,
        backgroundColor: '#6C0CC3'
    }
})

const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const MAX_LINE_ITEMS_NUMBER = 99
const equipmentSurveyDataReducer = (state) => state.equipmentSurveyDataReducer
const InstallRequestModal: FC<EquipmentRequestModalProps> = (props: EquipmentRequestModalProps) => {
    const {
        cRef,
        accountId,
        customer,
        id,
        onSave,
        onBack,
        setTabRefreshTimes,
        equipmentList,
        equipmentTypeCodeDesc,
        visible,
        setVisible,
        type,
        l,
        setLeadDetail,
        leadId,
        readonly = false
    } = props

    const customerId = customer['Account.CUST_UNIQ_ID_VAL__c'] || ''
    const surveyData = useSelector(equipmentSurveyDataReducer)

    const { request, setRequest } = useInstallHeaderRequest(id, accountId, customerId, leadId, l?.LEAD_ID_c__c)

    const [refreshTimes, setRefreshTimes] = useState(0)
    const [activeStep, setActiveStep] = useState(0)
    const [tempRequestLineItem, setTempRequestLineItem] = useState(initInstallRequestLineItem)
    const installRequestLineItems = useInstallRequestLineItems(request?.Id, refreshTimes)
    const allInstallRequestLineItems = useAllInstallRequestLineItems(accountId, leadId, refreshTimes, visible)
    const [activePart, setActivePart] = useState(1)
    const requestRecordTypeId = useRequestRecordTypeId()
    const [accessories, setAccessories] = useState([])
    const [products, setProducts] = useState([])
    const editedAp = useRef(false)
    const [selectedEquipSetupId, setSelectedEquipSetupId] = useState('')
    const existingAccessoryRequests = useExistingAccessoryRequests(tempRequestLineItem?.Id, refreshTimes, visible)
    const existingProductRequests = useExistingProductRequests(tempRequestLineItem?.Id, refreshTimes, visible)
    const [refreshDp, setRefreshDp] = useState(0)
    const distributionPointList = useFSVDistributionPoint(
        customer.AccountId,
        l.ExternalId,
        refreshDp,
        tempRequestLineItem?.FSV_Line_Item__c
    )
    const globalModalRef = useRef(null)
    const newTaskCreationRef = useRef(null)
    const equipmentPdfRef = useRef(null)
    const [disableStep2Navigation, setDisableStep2Navigation] = useState(true)
    const { movePurposeMapping } = useEquipmentMovePurposePicklist()
    const { equipmentGrphcPicklistObject } = useEquipmentGrphcPicklist()
    const [changeSurveyAnswer, setChangeSurveyAnswer] = useState(false)
    const equipmentFormRef = useRef(null)
    const fsvItemIndex = installRequestLineItems.findIndex((item) => item.FSV_Line_Item__c === true)

    const [surveyResponse, setSurveyResponse] = useState({
        headerResponse: null,
        lineItemResponseList: [],
        generalEquipmentResponseList: []
    })
    const cofCheckObj = useCofCheckData(l, refreshTimes)
    const openPopup = (content?, label?) => {
        globalModalRef?.current?.openModal(content, label)
    }

    const closePopup = () => {
        globalModalRef?.current?.closeModal()
    }
    const [disableSubmit, setDisableSubmit] = useState(false)
    const disableSave = useDisableSave(
        request,
        activePart,
        activeStep,
        installRequestLineItems,
        products,
        tempRequestLineItem,
        surveyResponse,
        changeSurveyAnswer,
        disableSubmit,
        readonly
    )

    const enableReminder = useEnableReminder(request, request?.Id, activeStep)

    const isAboveMaximum = () => {
        return installRequestLineItems.length >= MAX_LINE_ITEMS_NUMBER
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
                installRequestLineItems.forEach((lineItem, k) => {
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
            storeClassLog(
                Log.MOBILE_ERROR,
                'saveTempSurveyResponse',
                'Save Temp Survey Response Error: ' + getStringValue(e)
            )
        }
    }

    const goBack = () => {
        setSurveyResponse({
            headerResponse: null,
            lineItemResponseList: [],
            generalEquipmentResponseList: []
        })
        onBack()
        setRequest(initInstallRequestHeader(accountId, customerId, leadId, l?.LEAD_ID_c__c))
        setVisible(false)
    }
    useImperativeHandle(cRef, () => ({
        open: () => {
            setVisible(true)
        }
    }))
    useEffect(() => {
        if (activeStep === 1 && activePart === 1) {
            setTempRequestLineItem(initInstallRequestLineItem())
        }
    }, [activeStep, activePart])

    useEffect(() => {
        if (activeStep === 0) {
            setDisableStep2Navigation(disableSave)
        } else if (activeStep === 1) {
            setDisableStep2Navigation(true)
        } else if (activeStep === 2) {
            setDisableStep2Navigation(false)
        }
    }, [activeStep, activePart, disableSave])

    useSurveyResponse(request, surveyResponse, surveyData, setSurveyResponse)

    useEffect(() => {
        const tempResponseList = []
        if (surveyResponse.lineItemResponseList.length === 0) {
            if (installRequestLineItems?.length > 0) {
                installRequestLineItems.forEach((lineItem) => {
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
            installRequestLineItems.forEach((lineItem) => {
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
    }, [installRequestLineItems])

    const deleteLeadOverview = async () => {
        global.$globalModal.openModal()
        try {
            const res = await SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                ['Id'],
                'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                    `WHERE {Request__c:Id}= '${request.Id}'`
            )
            const requestToDelete = [...res]
            await syncUpObjDelete(requestToDelete.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                requestToDelete.map((v) => v._soupEntryId + '')
            )
            onSave()
            setTabRefreshTimes((v) => v + 1)
            global.$globalModal.closeModal()
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'InstallRequestModal.deleteLeadOverview', getStringValue(e))
        }
    }
    const handleGoBack = async () => {
        if (activeStep > 0) {
            if (activeStep === 2) {
                if (request.status__c === 'SUBMITTED' && changeSurveyAnswer) {
                    Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                        {
                            text: t.labels.PBNA_MOBILE_CANCEL,
                            style: 'cancel'
                        },
                        {
                            text: t.labels.PBNA_MOBILE_YES,
                            onPress: () => {
                                setActivePart(1)
                                setActiveStep(1)
                            }
                        }
                    ])
                } else {
                    setActivePart(1)
                    setTempRequestLineItem(initInstallRequestLineItem())
                    setActiveStep(1)
                }
            } else if (activeStep === 1 && activePart !== 1 && request.status__c === 'DRAFT') {
                Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        onPress: async () => {
                            setActiveStep((v) => v - 1)
                        }
                    }
                ])
            } else {
                setActiveStep((v) => v - 1)
            }
        } else {
            await saveTempSurveyResponse()
            if (!readonly && type === 'Lead' && _.isEmpty(installRequestLineItems)) {
                await deleteLeadOverview()
            }
            goBack()
        }
    }
    const handleBoolean = (v) => {
        if (!_.isBoolean(v)) {
            return v === '1'
        }
        return v
    }
    const renderSucButton = () => (
        <View style={equipmentModalStyle.sucButtonContainer}>
            <View style={equipmentModalStyle.sucButtonStyle}>
                <Button
                    onPress={() => {
                        global.$globalModal.closeModal()
                    }}
                    title={t.labels.PBNA_MOBILE_DO_NOT_SUBMIT}
                    titleStyle={equipmentModalStyle.cancelTitle}
                    type="clear"
                    buttonStyle={equipmentModalStyle.cancelButtonStyle}
                />
            </View>
            <View style={equipmentModalStyle.halfWidth}>
                <Button
                    onPress={async () => {
                        await onSubmitForCustomer(l, setLeadDetail, refreshTimes, setRefreshTimes, cofCheckObj)
                        global.$globalModal.closeModal()
                    }}
                    title={t.labels.PBNA_MOBILE_SUBMIT}
                    titleStyle={equipmentModalStyle.submitTitle}
                    buttonStyle={equipmentModalStyle.submitButtonStyle}
                />
            </View>
        </View>
    )

    const renderLeadSuccessModal = () => (
        <View style={equipmentModalStyle.leadCofSucContainer}>
            <View style={equipmentModalStyle.leadCofSucInnerContainer}>
                <View style={equipmentModalStyle.sucPopupPadding}>
                    <Image
                        style={equipmentModalStyle.sucImage}
                        source={require('../../../../../../assets/image/icon-success.png')}
                    />
                    <CText numberOfLines={3} style={equipmentModalStyle.sucMsg}>
                        {t.labels.PBNA_MOBILE_LEAD_YOUR_EQUIPMENT_REQUEST_HAS_BEEN_SUBMITTED}
                    </CText>
                </View>
                {renderSucButton()}
            </View>
        </View>
    )

    const renderCustomerSuccessModal = () => {
        global.$globalModal.openModal(
            <ProcessDoneModal type="success">
                <PopMessage>{t.labels.PBNA_MOBILE_YOUR_EQUIPMENT_REQUEST_HAS_BEEN_SUBMITTED}</PopMessage>
            </ProcessDoneModal>
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
    }

    const showLeadCofSuccessModal = () => {
        global.$globalModal.openModal(renderLeadSuccessModal())
    }

    const onRequestSubmitted = () => {
        if (type === 'Lead' && l.COF_Triggered_c__c === '0' && l.Owner_GPID_c__c === CommonParam.GPID__c) {
            showLeadCofSuccessModal()
        } else {
            renderCustomerSuccessModal()
        }
        setActiveStep(0)
        if (onSave) {
            onSave()
        }
        goBack()
    }
    const onRequestFailed = async (e) => {
        await storeClassLog(Log.MOBILE_ERROR, 'onRequestFailed', 'create new request: ' + getStringValue(e))
        globalModalRef?.current?.openModal(
            <ProcessDoneModal type={'failed'}>
                <PopMessage>{t.labels.PBNA_MOBILE_CREATE_REQUEST_FAILED}</PopMessage>
            </ProcessDoneModal>,
            'OK'
        )
    }

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
            return JSON.stringify(tempTypeScreen)
        }
        return null
    }

    const onClickSpecs = (pdfSource: string) => {
        if (!_.isEmpty(pdfSource)) {
            equipmentPdfRef?.current?.open(pdfSource)
        }
    }

    const syncOverView = async (targetStep?: number, generalEquipmentDetail = null, goBackToActivePartOne = true) => {
        openPopup()
        try {
            const requestOverviewToUpdate = []
            const requestOverviewToCreate = []
            const requestOverview = _.cloneDeep(request)
            requestOverview.customer__c = accountId
            requestOverview.Lead__c = leadId || request?.Lead__c
            requestOverview.customer_id__c = customerId
            requestOverview.Lead_id__c = l?.LEAD_ID_c__c || request?.LEAD_ID_c__c
            requestOverview.request_gpid__c = CommonParam.GPID__c
            requestOverview.RecordTypeId = requestRecordTypeId
            requestOverview.display_in_asset_tab__c = handleBoolean(request.display_in_asset_tab__c)
            requestOverview.display_in_service_tab__c = handleBoolean(request.display_in_service_tab__c)
            requestOverview.Created_By_Savvy__c = true
            if (!requestOverview.survey_response__c) {
                requestOverview.survey_response__c = JSON.stringify(surveyData[0])
            }
            if (generalEquipmentDetail) {
                requestOverview.survey_general_equip_details_response__c = generalEquipmentDetail
            }
            if (!_.isEmpty(request.Id)) {
                requestOverviewToUpdate.push(requestOverview)
            } else {
                requestOverviewToCreate.push(requestOverview)
            }
            const requestSyncUpFields = [
                'Id',
                'customer__c',
                'Lead__c',
                'customer_id__c',
                'Lead_id__c',
                'request_gpid__c',
                'caller_name__c',
                'move_purpose_cde__c',
                'move_request_date__c',
                'comments__c',
                'wndw_beg_tme__c',
                'wndw_end_tme__c',
                'display_in_asset_tab__c',
                'display_in_service_tab__c',
                'equip_move_type_cde__c',
                'requested_by__c',
                'RecordTypeId',
                'request_subtype__c',
                'caller_phone_num__c',
                'email_addr_txt__c',
                'survey_response__c',
                'survey_general_equip_details_response__c',
                'Created_By_Savvy__c'
            ]
            if (requestOverviewToCreate.length > 0) {
                const [{ data }] = await syncUpObjCreateFromMem(
                    'Request__c',
                    filterExistFields('Request__c', requestOverviewToCreate, requestSyncUpFields)
                )
                setRequest({
                    ..._.cloneDeep(data[0])
                })
            }
            if (requestOverviewToUpdate.length > 0) {
                const [{ data }] = await syncUpObjUpdateFromMem(
                    'Request__c',
                    filterExistFields('Request__c', requestOverviewToUpdate, requestSyncUpFields)
                )
                setRequest({
                    ..._.cloneDeep(data[0])
                })
            }
            closePopup()
            if (goBackToActivePartOne) {
                setActivePart(1)
            }
            if (targetStep) {
                setActiveStep(targetStep)
            } else {
                setActiveStep((v) => v + 1)
            }
        } catch (e) {
            closePopup()
            onRequestFailed(e)
        }
    }
    const syncAccessory = async (lineItemId: string) => {
        const accessoriesToProcess = _.cloneDeep(accessories)
        if (existingAccessoryRequests.length > 0) {
            await syncUpObjDelete(existingAccessoryRequests.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                existingAccessoryRequests.map((v) => v._soupEntryId + '')
            )
        }
        if (accessoriesToProcess.length > 0) {
            const requestsToCreate = _.map(accessoriesToProcess, (v, k) => {
                return {
                    RecordTypeId: requestRecordTypeId,
                    request_subtype__c: 'Move Request Accessory',
                    parent_request_record__c: lineItemId,
                    request_id__c: request.Id,
                    attr_seq_num__c: `${k + 1}`,
                    std_attr_cde__c: v,
                    customer__c: accountId,
                    Lead__c: leadId,
                    customer_id__c: customerId,
                    Lead_id__c: l?.LEAD_ID_c__c || '',
                    request_gpid__c: CommonParam.GPID__c,
                    requested_by__c: CommonParam.userId
                }
            })
            await syncUpObjCreateFromMem('Request__c', requestsToCreate)
        }
    }
    const syncProduct = async (lineItemId: string, equipTypeCde: string) => {
        const productsToProcess = _.cloneDeep(products)
        if (existingProductRequests.length > 0) {
            await syncUpObjDelete(existingProductRequests.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                existingProductRequests.map((v) => v._soupEntryId + '')
            )
        }
        if (productsToProcess.length > 0 && (equipTypeCde === 'VEN' || equipTypeCde === 'POS')) {
            const recommendedProductsToProcess = []
            const selectedProductsToProcess = []
            productsToProcess.forEach((product) => {
                if (product.inven_id__c) {
                    recommendedProductsToProcess.push(product)
                } else {
                    selectedProductsToProcess.push(product)
                }
            })
            const recommendedProductsRequestsToCreate = _.map(recommendedProductsToProcess, (v) => {
                return {
                    RecordTypeId: requestRecordTypeId,
                    request_subtype__c: 'Move Request Product',
                    parent_request_record__c: lineItemId,
                    request_id__c: request.Id,
                    slct_num__c: v.slct_num__c,
                    inven_id__c: v.inven_id__c,
                    inven_label__c: v.Name,
                    customer__c: accountId,
                    Lead__c: leadId,
                    customer_id__c: customerId,
                    Lead_id__c: l?.LEAD_ID_c__c || '',
                    request_gpid__c: CommonParam.GPID__c,
                    requested_by__c: CommonParam.userId,
                    equip_mech_rte_amt__c: equipTypeCde === 'POS' ? '0' : v.equip_mech_rte_amt__c,
                    FSV_UNIT_T1__c: v.FSV_UNIT_T1__c,
                    FSV_COMM_RATE_T1__c: v.FSV_COMM_RATE_T1__c
                }
            })
            const selectedProductsRequestsToCreate = _.map(selectedProductsToProcess, (v) => {
                return {
                    RecordTypeId: requestRecordTypeId,
                    request_subtype__c: 'Move Request Product',
                    parent_request_record__c: lineItemId,
                    request_id__c: request.Id,
                    slct_num__c: v.slct_num__c,
                    inven_id__c: v.Material_UOM_Identifier__c,
                    inven_label__c: v.Name,
                    customer__c: accountId,
                    Lead__c: leadId,
                    customer_id__c: customerId,
                    Lead_id__c: l?.LEAD_ID_c__c,
                    request_gpid__c: CommonParam.GPID__c,
                    requested_by__c: CommonParam.userId,
                    equip_mech_rte_amt__c: equipTypeCde === 'POS' ? '0' : v.equip_mech_rte_amt__c,
                    FSV_UNIT_T1__c: v.FSV_UNIT_T1__c,
                    FSV_COMM_RATE_T1__c: v.FSV_COMM_RATE_T1__c
                }
            })
            await syncUpObjCreateFromMem('Request__c', [
                ...recommendedProductsRequestsToCreate,
                ...selectedProductsRequestsToCreate
            ])
        }
    }

    const updateGeneralEquipmentDetail = async (lineItems) => {
        await syncOverView(activeStep, generateGeneralEquipmentSurvey(lineItems), false)
    }

    const confirmEquipment = async () => {
        try {
            openPopup()
            if (existingAccessoryRequests.length > 0) {
                await syncUpObjDelete(existingAccessoryRequests.map((v) => v.Id))
                await SoupService.removeRecordFromSoup(
                    'Request__c',
                    existingAccessoryRequests.map((v) => v._soupEntryId + '')
                )
            }
            if (existingProductRequests.length > 0) {
                await syncUpObjDelete(existingProductRequests.map((v) => v.Id))
                await SoupService.removeRecordFromSoup(
                    'Request__c',
                    existingProductRequests.map((v) => v._soupEntryId + '')
                )
            }
            if (tempRequestLineItem.Id) {
                const requestEquipmentToUpdate = [
                    {
                        Id: tempRequestLineItem.Id,
                        customer__c: request.customer__c,
                        Lead__c: request.Lead__c,
                        customer_id__c: request.customer_id__c,
                        Lead_id__c: request.Lead_id__c,
                        request_gpid__c: request.request_gpid__c,
                        parent_request_record__c: request.Id,
                        request_id__c: request.Id,
                        Equip_type_cde__c: tempRequestLineItem.Equip_type_cde__c,
                        Equip_styp_cde__c: tempRequestLineItem.Equip_styp_cde__c,
                        equip_type_desc__c: tempRequestLineItem.equip_type_desc__c,
                        equip_styp_desc__c: tempRequestLineItem.equip_styp_desc__c,
                        equip_move_type_cde__c: request.equip_move_type_cde__c,
                        std_setup_equip_id__c: tempRequestLineItem.std_setup_equip_id__c,
                        equip_setup_desc__c: tempRequestLineItem.equip_setup_desc__c,
                        equip_grphc_id__c: tempRequestLineItem.equip_grphc_id__c,
                        equip_config_type_cde__c: tempRequestLineItem.equip_config_type_cde__c,
                        display_in_service_tab__c: false,
                        display_in_asset_tab__c: true,
                        RecordTypeId: requestRecordTypeId,
                        request_subtype__c: 'Move Request Line Item',
                        requested_by__c: CommonParam.userId,
                        Sls_plan_cde__c: tempRequestLineItem.Sls_plan_cde__c,
                        Mnth_pymt_amt__c: tempRequestLineItem.Mnth_pymt_amt__c,
                        Serv_ctrct_id__c: tempRequestLineItem.Serv_ctrct_id__c,
                        equip_site_desc__c: tempRequestLineItem.equip_site_desc__c,
                        comments__c: tempRequestLineItem.comments__c,
                        ident_item_id__c: 0,
                        survey_response__c: tempRequestLineItem.survey_response__c,
                        FSV_Line_Item__c: tempRequestLineItem.FSV_Line_Item__c,
                        Rate_Type__c: tempRequestLineItem.Rate_Type__c,
                        Contract_Type__c: tempRequestLineItem.Contract_Type__c,
                        Commission_Basis__c: tempRequestLineItem.Commission_Basis__c,
                        Commission_Basis_CDE__c: tempRequestLineItem.Commission_Basis_CDE__c,
                        Payment_Schedule__c: tempRequestLineItem.Payment_Schedule__c,
                        Deposit_Amount__c: tempRequestLineItem.Deposit_Amount__c || null,
                        Deduct_Deposit__c: tempRequestLineItem.Deduct_Deposit__c,
                        Supplier__c: tempRequestLineItem.Supplier__c,
                        FSV_Notes__c: tempRequestLineItem.FSV_Notes__c,
                        FSV_UNIT_T1__c: tempRequestLineItem.FSV_UNIT_T1__c || null,
                        FSV_COMM_RATE_T1__c: tempRequestLineItem.FSV_COMM_RATE_T1__c || null,
                        FSV_UNIT_T2__c: tempRequestLineItem.FSV_UNIT_T2__c || null,
                        FSV_COMM_RATE_T2__c: tempRequestLineItem.FSV_COMM_RATE_T2__c || null,
                        FSV_UNIT_T3__c: tempRequestLineItem.FSV_UNIT_T3__c || null,
                        FSV_COMM_RATE_T3__c: tempRequestLineItem.FSV_COMM_RATE_T3__c || null,
                        FSV_UNIT_T4__c: tempRequestLineItem.FSV_UNIT_T4__c || null,
                        FSV_COMM_RATE_T4__c: tempRequestLineItem.FSV_COMM_RATE_T4__c || null,
                        FSV_UNIT_T5__c: tempRequestLineItem.FSV_UNIT_T5__c || null,
                        FSV_COMM_RATE_T5__c: tempRequestLineItem.FSV_COMM_RATE_T5__c || null
                    }
                ]
                const [{ data }] = await syncUpObjUpdateFromMem('Request__c', requestEquipmentToUpdate)
                await syncAccessory(data[0].Id)
                await syncProduct(data[0].Id, data[0].Equip_type_cde__c)
                setTempRequestLineItem(initInstallRequestLineItem())
            } else {
                const tempSurveyResponse = _.cloneDeep(surveyData[1])
                const question1 = tempSurveyResponse.questionList[0]
                const question2 = tempSurveyResponse.questionList[1]
                const moveType = getMoveTypeMapping()[request.equip_move_type_cde__c]
                const typeDescription = tempRequestLineItem?.equip_type_desc__c || ''
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
                const requestEquipmentToCreate = [
                    {
                        customer__c: request.customer__c,
                        Lead__c: request.Lead__c,
                        customer_id__c: request.customer_id__c,
                        Lead_id__c: request.Lead_id__c,
                        request_gpid__c: request.request_gpid__c,
                        parent_request_record__c: request.Id,
                        request_id__c: request.Id,
                        Equip_type_cde__c: tempRequestLineItem.Equip_type_cde__c,
                        Equip_styp_cde__c: tempRequestLineItem.Equip_styp_cde__c,
                        equip_type_desc__c: tempRequestLineItem.equip_type_desc__c,
                        equip_styp_desc__c: tempRequestLineItem.equip_styp_desc__c,
                        equip_move_type_cde__c: request.equip_move_type_cde__c,
                        std_setup_equip_id__c: tempRequestLineItem.std_setup_equip_id__c,
                        equip_setup_desc__c: tempRequestLineItem.equip_setup_desc__c,
                        equip_grphc_id__c: tempRequestLineItem.equip_grphc_id__c,
                        equip_config_type_cde__c: tempRequestLineItem.equip_config_type_cde__c,
                        display_in_service_tab__c: false,
                        display_in_asset_tab__c: true,
                        RecordTypeId: requestRecordTypeId,
                        request_subtype__c: 'Move Request Line Item',
                        requested_by__c: CommonParam.userId,
                        Sls_plan_cde__c: tempRequestLineItem.Sls_plan_cde__c,
                        Mnth_pymt_amt__c: tempRequestLineItem.Mnth_pymt_amt__c,
                        Serv_ctrct_id__c: tempRequestLineItem.Serv_ctrct_id__c,
                        equip_site_desc__c: tempRequestLineItem.equip_site_desc__c,
                        comments__c: tempRequestLineItem.comments__c,
                        ident_item_id__c: 0,
                        order_line_num__c: installRequestLineItems.length + 1,
                        FSV_Line_Item__c: tempRequestLineItem.FSV_Line_Item__c,
                        Rate_Type__c: tempRequestLineItem.Rate_Type__c,
                        Contract_Type__c: tempRequestLineItem.Contract_Type__c,
                        Commission_Basis__c: tempRequestLineItem.Commission_Basis__c,
                        Commission_Basis_CDE__c: tempRequestLineItem.Commission_Basis_CDE__c,
                        Payment_Schedule__c: tempRequestLineItem.Payment_Schedule__c,
                        Deposit_Amount__c: tempRequestLineItem.Deposit_Amount__c || null,
                        Deduct_Deposit__c: tempRequestLineItem.Deduct_Deposit__c,
                        Supplier__c: tempRequestLineItem.Supplier__c,
                        FSV_Notes__c: tempRequestLineItem.FSV_Notes__c,
                        FSV_UNIT_T1__c: tempRequestLineItem.FSV_UNIT_T1__c || null,
                        FSV_COMM_RATE_T1__c: tempRequestLineItem.FSV_COMM_RATE_T1__c || null,
                        FSV_UNIT_T2__c: tempRequestLineItem.FSV_UNIT_T2__c || null,
                        FSV_COMM_RATE_T2__c: tempRequestLineItem.FSV_COMM_RATE_T2__c || null,
                        FSV_UNIT_T3__c: tempRequestLineItem.FSV_UNIT_T3__c || null,
                        FSV_COMM_RATE_T3__c: tempRequestLineItem.FSV_COMM_RATE_T3__c || null,
                        FSV_UNIT_T4__c: tempRequestLineItem.FSV_UNIT_T4__c || null,
                        FSV_COMM_RATE_T4__c: tempRequestLineItem.FSV_COMM_RATE_T4__c || null,
                        FSV_UNIT_T5__c: tempRequestLineItem.FSV_UNIT_T5__c || null,
                        FSV_COMM_RATE_T5__c: tempRequestLineItem.FSV_COMM_RATE_T5__c || null
                    }
                ]
                const [{ data }] = await syncUpObjCreateFromMem('Request__c', requestEquipmentToCreate)
                tempSurveyResponse.lineItemId = data[0].Id
                await syncUpObjUpdateFromMem('Request__c', [
                    {
                        Id: data[0].Id,
                        survey_response__c: JSON.stringify(tempSurveyResponse)
                    }
                ])
                const tempLineItem = _.cloneDeep(installRequestLineItems)
                tempLineItem.push(tempRequestLineItem)
                await updateGeneralEquipmentDetail(tempLineItem)
                await syncAccessory(data[0].Id)
                await syncProduct(data[0].Id, data[0].Equip_type_cde__c)
                setTempRequestLineItem(initInstallRequestLineItem())
            }
            closePopup()
            setRefreshTimes((v) => v + 1)
            setActivePart(1)
        } catch (e) {
            closePopup()
            storeClassLog(Log.MOBILE_ERROR, 'confirmEquipment', 'create new request: ' + getStringValue(e))
            globalModalRef?.current?.openModal(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_CREATE_REQUEST_FAILED}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }

    const submitRequest = async (fsvContract) => {
        let mailResponse = { mailRes: '', usedImg: [] }
        const installRequestDate = moment(request.move_request_date__c)
        if (installRequestDate.isAfter(moment().add(6, 'days'))) {
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
                Send_to_CETS__c: type === 'RetailStore',
                submitted_date__c: moment().format('YYYY-MM-DD'),
                survey_response__c: JSON.stringify(surveyHeaderResponse),
                survey_general_equip_details_response__c: JSON.stringify(surveyGeneralDetailResponse),
                details_revision_num__c: request.details_revision_num__c,
                fsv_contract__c: fsvContract
            }
            const installRequestLineItemsToUpdate = installRequestLineItems.map((v, k) => {
                return {
                    Id: v.Id,
                    order_line_num__c: k + 1,
                    submitted_date__c: moment().format('YYYY-MM-DD'),
                    survey_response__c: JSON.stringify(surveyLineItemResponse[k]),
                    details_revision_num__c: request.details_revision_num__c
                }
            })
            try {
                mailResponse = await PdfPage(
                    surveyHeaderResponse,
                    surveyLineItemResponse,
                    installRequestLineItems,
                    customer,
                    l,
                    type,
                    request,
                    movePurposeMapping,
                    equipmentGrphcPicklistObject,
                    surveyGeneralDetailResponse
                )
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'installSubmitRequest', getStringValue(e))
            } finally {
                if (mailResponse.mailRes === 'sent') {
                    if (!headerRequestToUpdate.details_revision_num__c) {
                        headerRequestToUpdate.details_revision_num__c = 1
                        installRequestLineItemsToUpdate.forEach((item) => {
                            item.details_revision_num__c = 1
                        })
                    } else {
                        headerRequestToUpdate.details_revision_num__c =
                            parseInt(headerRequestToUpdate.details_revision_num__c) + 1
                        installRequestLineItemsToUpdate.forEach((item) => {
                            item.details_revision_num__c = parseInt(item.details_revision_num__c) + 1
                        })
                    }
                    await syncUpObjUpdateFromMem('Request__c', [
                        headerRequestToUpdate,
                        ...installRequestLineItemsToUpdate
                    ])
                    if (installRequestLineItems[0]?.FSV_Line_Item__c) {
                        if (
                            distributionPointList[0]['Request__r.status__c'] === 'DRAFT' ||
                            _.isEmpty(distributionPointList[0]['Request__r.status__c'])
                        ) {
                            await syncUpObjUpdateFromMem('Customer_to_Route__c', [
                                {
                                    Id: distributionPointList[0]?.Id,
                                    Request__c: installRequestLineItems[0].Id,
                                    Send_New_DP__c: type === 'RetailStore'
                                }
                            ])
                        } else {
                            await syncUpObjUpdateFromMem('Customer_to_Route__c', [
                                {
                                    Id: distributionPointList[0]?.Id,
                                    Send_New_DP__c: type === 'RetailStore'
                                }
                            ])
                        }
                        if (type === 'RetailStore') {
                            await syncUpObjUpdateFromMem('Account', [{ Id: customer.AccountId, Send_New_DP__c: true }])
                        }
                    }
                    if (request.status__c === 'DRAFT') {
                        Instrumentation.reportMetric('Submit a request', 1)
                    } else {
                        Instrumentation.reportMetric('Update a request', 1)
                    }
                    const leadCustomerFilterClause =
                        type === 'RetailStore' ? `Customer__c = '${accountId}'` : `Lead__c = '${l.ExternalId}'`
                    await syncDownObj(
                        'Customer_to_Route__c',
                        `SELECT ${getAllFieldsByObjName('Customer_to_Route__c').join(',')} FROM 
                            Customer_to_Route__c WHERE ${leadCustomerFilterClause} AND ACTV_FLG__c = true 
                            AND SLS_MTHD_NM__c = 'FSV' AND Merch_Flag__c = false`
                    )
                    setVisible(false)
                    setTabRefreshTimes((v) => v + 1)
                    onRequestSubmitted()
                    closePopup()
                } else {
                    globalModalRef?.current?.openModal(
                        <ProcessDoneModal type={'failed'}>
                            <PopMessage>{t.labels.PBNA_MOBILE_NOTIVE_SEND_EMAIL}</PopMessage>
                        </ProcessDoneModal>,
                        t.labels.PBNA_MOBILE_OK
                    )
                    setTimeout(() => {
                        globalModalRef?.current?.closeModal()
                    }, 3000)
                }
            }
        } else {
            globalModalRef?.current?.openModal(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>
                        {t.labels.PBNA_MOBILE_THE_REQUESTED_INSTALL_DATE_MUST_BE_7_DAYS_IN_THE_FUTURE}
                    </PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
            setActiveStep(0)
        }
    }

    const handleSave = async () => {
        switch (activeStep) {
            case 0: {
                if (request.status__c === 'DRAFT' && !readonly) {
                    await syncOverView()
                } else {
                    setActivePart(1)
                    setActiveStep((v) => v + 1)
                }
                break
            }
            case 1:
                if (activePart === 1 || (activePart !== 4 && request.status__c !== 'DRAFT')) {
                    await processNoSurveyResponseRequest(
                        installRequestLineItems,
                        surveyData,
                        request,
                        globalModalRef,
                        setRefreshTimes,
                        setActiveStep
                    )
                }
                if (activePart === 4) {
                    editedAp.current = true
                    setActivePart(5)
                }
                break
            case 2:
                if (fsvItemIndex !== -1) {
                    Alert.alert(
                        '',
                        type === 'RetailStore'
                            ? t.labels.PBNA_MOBILE_FSV_CONTRACT_SETUP
                            : t.labels.PBNA_MOBILE_LEAD_FSV_CONTRACT_SETUP,
                        [
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
                        ]
                    )
                } else {
                    await submitRequest(false)
                }
                break
            default:
                break
        }
    }
    const renderForm = () => {
        switch (activeStep) {
            case 0:
                return (
                    <InstallOverviewForm
                        overview={request}
                        setOverView={setRequest}
                        accountId={accountId}
                        leadId={l?.ExternalId}
                        type={type}
                        l={l}
                        readonly={readonly}
                    />
                )
            case 1:
                return (
                    <EquipmentForm
                        customer={customer}
                        equipment={tempRequestLineItem}
                        overview={request}
                        setEquipment={setTempRequestLineItem}
                        activePart={activePart}
                        setActivePart={setActivePart}
                        // requestRecordTypeId={requestRecordTypeId}
                        accessories={accessories}
                        setAccessories={setAccessories}
                        products={products}
                        setProducts={setProducts}
                        editedAp={editedAp}
                        selectedEquipSetupId={selectedEquipSetupId}
                        setSelectedEquipSetupId={setSelectedEquipSetupId}
                        existingAccessoryRequests={existingAccessoryRequests}
                        existingProductRequests={existingProductRequests}
                        setRefreshTimes={setRefreshTimes}
                        setRefreshDp={setRefreshDp}
                        installRequestLineItems={installRequestLineItems}
                        equipmentList={equipmentList}
                        allInstallRequestLineItems={allInstallRequestLineItems}
                        // originalRecommendedProduct={originalRecommendedProduct}
                        confirmEquipment={confirmEquipment}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        isAboveMaximum={isAboveMaximum()}
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        cRef={equipmentFormRef}
                        distributionPointList={distributionPointList}
                        type={type}
                        l={l}
                        readonly={readonly}
                        updateGeneralEquipmentDetail={updateGeneralEquipmentDetail}
                        onClickSpecsBtn={onClickSpecs}
                    />
                )
            case 2:
                return (
                    <EquipmentSurvey
                        request={request}
                        installRequestLineItems={installRequestLineItems}
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        surveyResponse={surveyResponse}
                        setSurveyResponse={setSurveyResponse}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        setChangeSurveyAnswer={setChangeSurveyAnswer}
                        readonly={!enableReminder || readonly}
                    />
                )
            default:
                return null
        }
    }

    const renderFormBottomButtonLabel = () => {
        if (activeStep === 2) {
            if (request.status__c !== 'DRAFT') {
                return t.labels.PBNA_MOBILE_UPDATE_DETAILS
            }
            return t.labels.PBNA_MOBILE_SUBMIT.toUpperCase()
        }
        return t.labels.PBNA_MOBILE_NEXT.toUpperCase()
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
            <SafeAreaView
                style={[equipmentModalStyle.container, activeStep === 1 && equipmentModalStyle.whiteContainer]}
            >
                <View style={equipmentModalStyle.eHeader}>
                    <View style={equipmentModalStyle.equipmentContainer}>
                        <View>
                            <CText style={equipmentModalStyle.eTitle}>
                                {t.labels.PBNA_MOBILE_NEW_EQUIPMENT_REQUEST}
                            </CText>
                            {isAboveMaximum() && activeStep === 1 && (
                                <CText style={equipmentModalStyle.maximumText}>Maximum Number of Selections</CText>
                            )}
                        </View>
                        <HeaderCircle
                            onPress={async () => {
                                if (activeStep === 1 && request.status__c === 'DRAFT') {
                                    if (activePart === 1) {
                                        if (!readonly && type === 'Lead' && _.isEmpty(installRequestLineItems)) {
                                            await deleteLeadOverview()
                                        }
                                        setTabRefreshTimes((v) => v + 1)
                                        onSave()
                                        setDisableSubmit(true)
                                        goBack()
                                        setActivePart(1)
                                        setActiveStep(0)
                                    } else {
                                        Alert.alert(
                                            '',
                                            t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
                                            [
                                                {
                                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                                    style: 'cancel'
                                                },
                                                {
                                                    text: t.labels.PBNA_MOBILE_YES,
                                                    onPress: async () => {
                                                        await saveTempSurveyResponse()
                                                        if (
                                                            !readonly &&
                                                            type === 'Lead' &&
                                                            _.isEmpty(installRequestLineItems)
                                                        ) {
                                                            await deleteLeadOverview()
                                                        }
                                                        setTabRefreshTimes((v) => v + 1)
                                                        onSave()
                                                        setDisableSubmit(true)
                                                        goBack()
                                                        setActivePart(1)
                                                        setActiveStep(0)
                                                    }
                                                }
                                            ]
                                        )
                                    }
                                } else if (
                                    activeStep === 2 &&
                                    request.status__c === 'SUBMITTED' &&
                                    changeSurveyAnswer
                                ) {
                                    Alert.alert(
                                        '',
                                        t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
                                        [
                                            {
                                                text: t.labels.PBNA_MOBILE_CANCEL,
                                                style: 'cancel'
                                            },
                                            {
                                                text: t.labels.PBNA_MOBILE_YES,
                                                onPress: async () => {
                                                    await saveTempSurveyResponse()
                                                    setTabRefreshTimes((v) => v + 1)
                                                    onSave()
                                                    setDisableSubmit(true)
                                                    goBack()
                                                    setActivePart(1)
                                                    setActiveStep(0)
                                                }
                                            }
                                        ]
                                    )
                                } else {
                                    await saveTempSurveyResponse()
                                    if (!readonly && type === 'Lead' && _.isEmpty(installRequestLineItems)) {
                                        await deleteLeadOverview()
                                    }
                                    setTabRefreshTimes((v) => v + 1)
                                    onSave()
                                    setDisableSubmit(true)
                                    goBack()
                                    setActivePart(1)
                                    setActiveStep(0)
                                }
                            }}
                            transform={[{ scale: 1 }, { rotate: '45deg' }]}
                            color={'#0098D4'}
                        />
                    </View>
                    <View style={equipmentModalStyle.stepView}>
                        <TouchableOpacity
                            style={[equipmentModalStyle.firstStep, activeStep === 0 && equipmentModalStyle.activeStep]}
                            disabled={activeStep === 0}
                            onPress={() => {
                                if (activeStep === 1) {
                                    if (request.status__c === 'DRAFT') {
                                        Alert.alert(
                                            '',
                                            t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
                                            [
                                                {
                                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                                    style: 'cancel'
                                                },
                                                {
                                                    text: t.labels.PBNA_MOBILE_YES,
                                                    onPress: async () => {
                                                        setActiveStep(0)
                                                        setActivePart(1)
                                                    }
                                                }
                                            ]
                                        )
                                    } else {
                                        setActiveStep(0)
                                        setActivePart(1)
                                    }
                                }
                                if (activeStep === 2) {
                                    setActiveStep(0)
                                }
                            }}
                        >
                            <CText
                                style={[
                                    equipmentModalStyle.firstStepTitle,
                                    activeStep === 0 && equipmentModalStyle.activeStepColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_STEP_ONE}
                            </CText>
                            <View style={equipmentModalStyle.flexRowEnd}>
                                <CText
                                    style={[
                                        equipmentModalStyle.firstStepText,
                                        activeStep === 0 && equipmentModalStyle.activeStepColor
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_OVERVIEW}
                                </CText>
                                {(activeStep === 1 || activeStep === 2) && (
                                    <Image source={IMG_GREEN_CHECK} style={equipmentModalStyle.eImgCheck} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={commonStyle.flexDirectionRow}>
                            {drawHeaderTriangle(0, activeStep, equipmentModalStyle)}
                            <View style={equipmentModalStyle.headerContainer}>
                                <View style={equipmentModalStyle.headerContainer2} />
                                <View>
                                    <View style={equipmentModalStyle.bottomTriangle} />
                                    <View
                                        style={[
                                            equipmentModalStyle.bottomTriangle,
                                            equipmentModalStyle.bottomLeftTriangle
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[equipmentModalStyle.secondStep, activeStep === 1 && equipmentModalStyle.activeStep]}
                            disabled={disableStep2Navigation}
                            onPress={async () => {
                                setTempRequestLineItem(initInstallRequestLineItem())
                                if (activeStep === 0) {
                                    if (request.status__c === 'DRAFT') {
                                        await syncOverView()
                                    } else {
                                        setActivePart(1)
                                        setActiveStep((v) => v + 1)
                                    }
                                }
                                if (activeStep === 2) {
                                    setActiveStep(1)
                                    setActivePart(1)
                                }
                            }}
                        >
                            <CText
                                style={[
                                    equipmentModalStyle.secondStepTitle,
                                    activeStep === 1 && equipmentModalStyle.activeStepColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_STEP_TWO}
                            </CText>
                            <View style={equipmentModalStyle.flexRowEnd}>
                                <CText
                                    style={[
                                        equipmentModalStyle.secondStepText,
                                        activeStep === 1 && equipmentModalStyle.activeStepColor
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_EQUIPMENT}
                                </CText>
                                {((activeStep !== 1 && request.status__c !== 'DRAFT') ||
                                    (activeStep === 2 && request.status__c === 'DRAFT')) && (
                                    <Image source={IMG_GREEN_CHECK} style={equipmentModalStyle.eImgCheck} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={equipmentModalStyle.bottomTriangleContainer}>
                            {drawHeaderTriangle(1, activeStep, equipmentModalStyle)}
                            <View style={equipmentModalStyle.headerContainer3}>
                                <View style={equipmentModalStyle.headerContainer4} />
                                <View>
                                    <View style={equipmentModalStyle.bottomTriangle} />
                                    <View
                                        style={[
                                            equipmentModalStyle.bottomTriangle,
                                            equipmentModalStyle.bottomLeftTriangle
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[equipmentModalStyle.thirdStep, activeStep === 2 && equipmentModalStyle.activeStep]}
                            disabled={installRequestLineItems.length === 0}
                            onPress={async () => {
                                if (activeStep === 0 && request.status__c === 'DRAFT') {
                                    try {
                                        openPopup()
                                        await syncOverView(2)
                                    } catch (e) {
                                        storeClassLog(
                                            Log.MOBILE_ERROR,
                                            'InstallRequestModal: syncOverView',
                                            getStringValue(e)
                                        )
                                    } finally {
                                        closePopup()
                                    }
                                } else {
                                    setActiveStep(2)
                                }
                                if (activeStep === 1) {
                                    if (activePart !== 1 && request.status__c === 'DRAFT') {
                                        Alert.alert(
                                            '',
                                            t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
                                            [
                                                {
                                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                                    style: 'cancel'
                                                },
                                                {
                                                    text: t.labels.PBNA_MOBILE_YES,
                                                    onPress: async () => {
                                                        setActiveStep(2)
                                                    }
                                                }
                                            ]
                                        )
                                    } else {
                                        setActiveStep(2)
                                    }
                                }
                            }}
                        >
                            <CText
                                style={[
                                    equipmentModalStyle.secondStepTitle,
                                    activeStep === 2 && equipmentModalStyle.activeStepColor
                                ]}
                            >
                                {t.labels.PBNA_MOBILE_STEP_THREE.toLocaleUpperCase()}
                            </CText>
                            <View style={equipmentModalStyle.flexRowEnd}>
                                <CText
                                    style={[
                                        equipmentModalStyle.secondStepText,
                                        activeStep === 2 && equipmentModalStyle.activeStepColor
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_DETAILS}
                                </CText>
                                {activeStep !== 2 &&
                                    request.status__c !== 'DRAFT' &&
                                    validateSurveyResponse(surveyResponse) && (
                                        <Image source={IMG_GREEN_CHECK} style={equipmentModalStyle.eImgCheck} />
                                    )}
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={equipmentModalStyle.formContainer}>{renderForm()}</View>
                    {activeStep === 2 && enableReminder && !readonly && (
                        <Button
                            title={
                                <CText style={equipmentModalStyle.updateDetailsText}>
                                    {t.labels.PBNA_MOBILE_UPDATE_DETAILS_REMINDER.toUpperCase()}
                                </CText>
                            }
                            containerStyle={equipmentModalStyle.updateDetailsContainer}
                            buttonStyle={equipmentModalStyle.updateDetailsBtn}
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
                        onPressCancel={handleGoBack}
                        leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toUpperCase()}
                        rightButtonLabel={renderFormBottomButtonLabel()}
                        onPressSave={handleSave}
                        relative
                        disableSave={disableSave}
                    />
                </View>
            </SafeAreaView>
            <GlobalModal ref={globalModalRef} />
            <NewTaskCreation
                l={type === 'RetailStore' ? customer : l}
                cRef={newTaskCreationRef}
                onSave={onSave}
                type={type}
                isSurvey
                openPopup={openPopup}
                closePopup={closePopup}
            />
            <EquipmentPdfModal cRef={equipmentPdfRef} />
        </Modal>
    )
}
export default InstallRequestModal
