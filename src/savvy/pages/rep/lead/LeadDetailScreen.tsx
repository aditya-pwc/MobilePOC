/**
 * @description Screen to show Open Lead detail.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { useState, useRef, useEffect, FC } from 'react'
import {
    Image,
    ImageBackground,
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
    Alert,
    DeviceEventEmitter,
    ScrollView,
    SafeAreaView,
    Dimensions,
    RefreshControl
} from 'react-native'
import Utils from '../../../common/DateTimeUtils'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    unAssignLeadOwner,
    updateLeadInfo,
    updateLeadOwner,
    updateLeadToBackend,
    updateRelatedTask
} from '../../../utils/LeadUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import TabBar from '../../../components/common/TabBar'
import LeadOverviewTab from '../../../components/rep/lead/overview-tab/LeadOverviewTab'
import LeadOfferElementsTab from '../../../components/rep/lead/offer-tab/LeadOfferElementsTab'
import {
    useLeadDetail,
    useLeadDetailTabs,
    useLeadDetailSaveButton,
    useContacts,
    useCofCheckData,
    usePriceOriginListWithLead,
    useSellingDpCount,
    syncUpCustomerDeal,
    deleteCustomerDeal,
    usePriceGroupTotalList
} from '../../../hooks/LeadHooks'
import UpdateLeadSuccessModal from '../../../components/rep/lead/UpdateLeadSuccessModal'
import { Tooltip } from 'react-native-elements'
import LeadDetailScreenHeader from '../../../components/rep/lead/LeadDetailScreenHeader'
import { useDispatch } from 'react-redux'
import { refreshKpiBarAction, updateTempLeadAction } from '../../../redux/action/LeadActionType'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import store from '../../../redux/store/Store'
import ContactForm from '../../../components/rep/lead/ContactForm'
import LeadContactTab from '../../../components/rep/lead/contact-tab/LeadContactTab'
import LeadFloatButton from '../../../components/rep/lead/common/LeadFloatButton'
import ErrorSvg from '../../../../../assets/image/icon-error.svg'
import _ from 'lodash'
import LeadActivityTab, { LeadActivityTabRef } from '../../../components/rep/lead/activity-tab/LeadActivityTab'
import NoSaleModal from '../../../components/rep/lead/NoSaleModal'
import LogCallForm from '../../../components/rep/lead/LogCallForm'
import { compositeQueryObjsBySoql } from '../../../api/SyncUtils'
import { LeadStatus, LeadSubStatus } from '../../../enums/Lead'
import { DeviceEvent } from '../../../enums/DeviceEvent'
import { Log } from '../../../../common/enums/Log'
import { Instrumentation } from '@appdynamics/react-native-agent'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import NewTaskCreation from '../../../components/rep/lead/creation/NewTaskCreation'
import moment from 'moment'
import { useDetailScreenHeaderTabAnimation } from '../../../hooks/AnimationHooks'
import { t } from '../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager } from '../../../../common/enums/Persona'
import { genSingleLeadCompositeGroup } from '../../../api/composite-template/LeadCompositeTemplate'
import { genLeadSuggestedRouteCompositeGroup } from '../../../api/composite-template/LeadSuggestedRouteCompositeTemplate'
import OpenLeadCard from '../../../components/rep/lead/tile/OpenLeadCard'
import CustomerEquipmentReqButton from '../../../components/rep/customer/CustomerEquipmentReqButton'
import { retrieveLeadEquipRequest, useEquipmentAssets } from '../../../hooks/EquipmentHooks'
import LeadEquipmentTab from '../../../components/rep/lead/equipment-tab/LeadEquipmentTab'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateSurveyDataAction } from '../../../redux/action/EquipmentSurveyActionType'
import { useRepPullDownRefresh } from '../../../hooks/RefreshHooks'
import ExportContactsModal from '../../../components/rep/lead/contact-tab/ExportContactsModal'
import ContactExportButton from '../../../components/rep/lead/common/ContactExportButton'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { SoupService } from '../../../service/SoupService'
import { getStringValue } from '../../../utils/LandingUtils'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { exeAsyncFunc } from '../../../../common/utils/CommonUtils'
import { onSubmitForCustomer } from '../../../helper/rep/CofHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import {
    updateNewPriceGroupList,
    updatePriceGroupList,
    updateSellingDP,
    updateSearchOriginList
} from '../../../redux/reducer/PriceName'
import { useAppSelector } from '../../../redux/ReduxHooks'

interface LeadDetailScreenProps {
    navigation: any
    route: any
}
const screenHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    container: {
        paddingRight: Utils.isTablet ? 80 : 22,
        paddingLeft: Utils.isTablet ? 80 : 22,
        height: 168
    },
    leadCardContainer: {
        marginTop: 0,
        width: '100%',
        position: 'absolute',
        top: 100,
        paddingHorizontal: '5%'
    },
    tooltipContainer: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 0
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700',
        marginTop: 20
    },
    noLeadFailedText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    height_20: {
        height: 20
    },
    addToMyLeadText: {
        fontSize: 12,
        fontWeight: '700'
    },
    iconSuccessStyle: {
        width: 60,
        height: 57,
        marginBottom: 20
    },
    padding_14: {
        padding: 14
    },
    unassignLeadText: {
        fontSize: 12,
        fontWeight: '700'
    },
    color_grey: {
        color: 'gray'
    },
    color_black: {
        color: 'black'
    },
    paddingHorizontal_14: {
        paddingHorizontal: 14
    },
    buttonStyle: {
        height: 2,
        backgroundColor: '#D3D3D3'
    },
    padding_5: {
        padding: 5
    },
    background_black: {
        backgroundColor: 'black'
    },
    height_100: {
        height: 100
    },
    threePointIcon: {
        height: 22,
        width: 16
    },
    safeArea: {
        height: screenHeight / 18,
        position: 'absolute',
        bottom: 22,
        width: '100%',
        justifyContent: 'center',
        zIndex: 2
    },
    animatedContainer: {
        padding: 15,
        paddingHorizontal: '5%'
    },
    detailContainer: {
        height: '100%',
        backgroundColor: '#F2F4F7'
    }
})
const judgeNum = -1
const judgeIndex = 0
const LeadDetailScreen: FC<LeadDetailScreenProps> = (props: LeadDetailScreenProps) => {
    const { navigation, route } = props
    const l = route.params.lead
    const goBackDP = route.params.goBackDp ? route.params.goBackDp : false
    const needDelete = route.params.needDelete ? route.params.needDelete : false
    const [activeTab, setActiveTab] = useState(route?.params?.tab ? route?.params?.tab : 0)
    const [saveTimes, setSaveTimes] = useState(0)
    const [refreshFlag, setRefreshFlag] = useState(0)
    const { leadDetail, setLeadDetail, setRefreshTimes } = useLeadDetail(l._soupEntryId, saveTimes, l.Id, l.ExternalId)
    const { disableSave, showBottomButton } = useLeadDetailSaveButton(leadDetail)
    const [cancelButtonCount, setCancelButtonCount] = useState(0)
    const [showRecentRejection, setShowRecentRejection] = useState(false)
    const [searchContactValue, setSearchContactValue] = useState('')
    const contactList = useContacts('Lead', leadDetail.ExternalId, 0, false, saveTimes, searchContactValue)
    const leadContactTabRef = useRef(null)
    const overviewTabRef = useRef(null)
    const offerTabRef = useRef(null)
    const contactCreationFormRef = useRef(null)
    const noSaleModalRef = useRef(null)
    const logCallModalRef = useRef(null)
    const tabBarRef = useRef(null)
    const equipmentTabRef = useRef(null)
    const { equipmentList } = useEquipmentAssets(false, leadDetail?.ExternalId, saveTimes)
    const [selectEquipmentCount, setSelectEquipmentCount] = useState(0)
    const [activeServiceTypes, setActiveServiceTypes] = useState([
        {
            serviceType: 'Move',
            serviceIndex: 0,
            serviceActive: false
        },
        {
            serviceType: 'Pickup',
            serviceIndex: 1,
            serviceActive: false
        },
        {
            serviceType: 'Repair',
            serviceIndex: 2,
            serviceActive: false
        },
        {
            serviceType: 'Exchange',
            serviceIndex: 3,
            serviceActive: false
        }
    ])
    const newTaskCreationRef = useRef(null)
    const exportContactsRef = useRef(null)
    const { dropDownRef } = useDropDown()
    const threeDotRef = useRef(null)
    const isMounted = useRef(null)
    const { tabs } = useLeadDetailTabs()
    const scrollYAnimatedValue = useRef(new Animated.Value(0)).current
    const { headerBackgroundColor, headerTitleColor, headerLeftChevronColor, tabBarTop } =
        useDetailScreenHeaderTabAnimation(scrollYAnimatedValue)
    const tooltipRef = useRef(null)
    const dispatch = useDispatch()
    const { isLoading, setIsLoading } = useRepPullDownRefresh(
        `LeadDetailScreenTab${activeTab}`,
        dispatch,
        false,
        leadDetail
    )
    const activityTabRef = useRef<LeadActivityTabRef>(null)

    const [disableInstallRequest, setDisableInstallRequest] = useState(false)
    const cofCheckObj = useCofCheckData(leadDetail, saveTimes)
    const retrieveLeadDetails = async () => {
        if (leadDetail?.Id) {
            await exeAsyncFunc(async () => {
                await compositeQueryObjsBySoql(genSingleLeadCompositeGroup(leadDetail.Id))
            })
        }
        if (leadDetail?.Suggested_FSR_Nat_Route_Number_c__c) {
            await exeAsyncFunc(async () => {
                await compositeQueryObjsBySoql(
                    genLeadSuggestedRouteCompositeGroup(leadDetail.Suggested_FSR_Nat_Route_Number_c__c)
                )
            })
        }
        await exeAsyncFunc(async () => {
            await retrieveLeadEquipRequest(leadDetail?.ExternalId)
        })
        await exeAsyncFunc(async () => {
            const surveyData = JSON.parse(await AsyncStorage.getItem('equipment_survey_data'))
            if (surveyData) {
                dispatch && dispatch(updateSurveyDataAction(surveyData))
            }
        })
    }
    const [showInitLoadingIndicator, setShowInitLoadingIndicator] = useState(false)
    const dpCount = useSellingDpCount(leadDetail, saveTimes)
    const [hadQueried, setHadQueried] = useState<boolean>(false)
    const dealData = usePriceOriginListWithLead(leadDetail, dpCount, saveTimes, setHadQueried)
    const locationId = store.getState().leadReducer.negotiateLeadEditReducer.Location_ID_c__c
    const { priceGroupSearchList, pricingLevelId } = usePriceGroupTotalList(locationId, true)
    const newPgList = useAppSelector((state) => state.leadReducer.priceGroupSlice.newPgList)
    const refreshPriceNameGroupData = () => {
        if (dpCount === 0) {
            dispatch && dispatch(updateNewPriceGroupList([]))
            dispatch && dispatch(updatePriceGroupList([]))
            if (_.size(dealData) > 0) {
                deleteCustomerDeal(dealData, 'refreshPriceNameGroupData', dpCount)
            }
        } else {
            dispatch && dispatch(updatePriceGroupList(_.size(dealData) > 0 ? dealData : []))
        }
        dispatch && dispatch(updateSellingDP(dpCount === 0))
    }
    useEffect(() => {
        if (dpCount > judgeNum) {
            refreshPriceNameGroupData()
        }
    }, [dealData])

    useEffect(() => {
        if (hadQueried) {
            dispatch && dispatch(updateNewPriceGroupList(_.size(dealData) > 0 ? dealData : []))
        }
    }, [hadQueried])

    useEffect(() => {
        if (priceGroupSearchList) {
            dispatch && dispatch(updateSearchOriginList(priceGroupSearchList))
        }
    }, [priceGroupSearchList])

    useEffect(() => {
        setShowInitLoadingIndicator(true)
        retrieveLeadDetails().finally(() => {
            setSaveTimes((v) => v + 1)
            setShowInitLoadingIndicator(false)
        })
    }, [leadDetail.ExternalId, refreshFlag, activeTab])
    const addLead = async () => {
        global.$globalModal.openModal()
        const leadToUpdate = _.cloneDeep(leadDetail)
        leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        leadToUpdate.PD_Assigned_c__c = false
        leadToUpdate.Assigned_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        updateLeadOwner(leadToUpdate, CommonParam.GPID__c)
        tooltipRef.current.toggleTooltip()
        try {
            await updateLeadToBackend(leadToUpdate, dropDownRef)
            await updateRelatedTask(leadToUpdate.ExternalId, false)
            setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
            dispatch(refreshKpiBarAction())
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <UpdateLeadSuccessModal company={leadToUpdate.Company__c} leadType={leadToUpdate.Status__c} />
            )
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 3000)
        } catch (e) {
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <View style={commonStyle.alignItemsCenter}>
                    <ErrorSvg width={50} height={50} />
                    <CText style={styles.errorText}>{t.labels.PBNA_MOBILE_ERROR}</CText>
                    <CText numberOfLines={3} style={styles.noLeadFailedText}>
                        {t.labels.PBNA_MOBILE_ADD_LEAD_FAILED}
                    </CText>
                </View>,
                t.labels.PBNA_MOBILE_OK
            )
            storeClassLog(
                Log.MOBILE_ERROR,
                'addLead',
                'lead detail page: add to my leads: ' + ErrorUtils.error2String(e) + JSON.stringify(leadToUpdate)
            )
        }
    }
    const renderOpenButtons = () => {
        return (
            <TouchableOpacity
                style={[styles.height_20, commonStyle.alignCenter]}
                onPress={async () => {
                    await addLead()
                    setRefreshFlag((v) => v + 1)
                }}
            >
                <CText style={styles.addToMyLeadText}>{t.labels.PBNA_MOBILE_ADD_TO_MY_LEADS.toUpperCase()}</CText>
            </TouchableOpacity>
        )
    }
    const unAssignLead = async () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_UNASSIGN_LEAD,
            t.labels.PBNA_MOBILE_ARE_YOU_SURE_WANT_TO_UNASSIGN_THIS_LEAD_MSG,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: _.capitalize(t.labels.PBNA_MOBILE_UNASSIGN),
                    onPress: async () => {
                        Instrumentation.reportMetric('FSR/PSR Presses Unassign', 1)
                        global.$globalModal.openModal()
                        const leadToUpdate = JSON.parse(JSON.stringify(leadDetail))
                        unAssignLeadOwner(leadToUpdate, CommonParam.GPID__c)
                        tooltipRef.current.toggleTooltip()
                        await updateLeadToBackend(leadToUpdate, dropDownRef)
                        setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                        dispatch(refreshKpiBarAction())
                        global.$globalModal.closeModal()
                        global.$globalModal.openModal(
                            <UpdateLeadSuccessModal
                                company={leadToUpdate.Company__c}
                                leadType={leadToUpdate.Status__c}
                            />
                        )
                        if (!goBackDP) {
                            navigation.navigate('Leads', {
                                page: 'My Leads',
                                needRefreshLead: true
                            })
                        } else {
                            setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                        }
                        setTimeout(() => {
                            global.$globalModal.closeModal()
                        }, 3000)
                    }
                }
            ]
        )
    }

    const renderNoSaleButtons = () => {
        return (
            <View style={commonStyle.fullWidth}>
                <View style={styles.padding_14}>
                    <CText style={[styles.unassignLeadText, styles.color_grey]}>
                        {t.labels.PBNA_MOBILE_UNASSIGN_LEAD.toUpperCase()}
                    </CText>
                </View>
                <View style={[styles.paddingHorizontal_14, commonStyle.fullWidth]}>
                    <View style={[styles.buttonStyle, commonStyle.fullWidth]} />
                </View>
                <View style={styles.padding_14}>
                    <CText style={[styles.unassignLeadText, styles.color_grey]}>
                        {t.labels.PBNA_MOBILE_REQUEST_CUSTOMER.toUpperCase()}
                    </CText>
                </View>
                <View style={[styles.paddingHorizontal_14, commonStyle.fullWidth]}>
                    <View style={[styles.buttonStyle, commonStyle.fullWidth]} />
                </View>
                <View style={styles.padding_14}>
                    <CText style={[styles.unassignLeadText, styles.color_grey]}>
                        {t.labels.PBNA_MOBILE_MOVE_TO_NO_SALE.toUpperCase()}
                    </CText>
                </View>
            </View>
        )
    }

    const renderSpecialNoSaleButtons = () => {
        return (
            <View style={commonStyle.fullWidth}>
                <TouchableOpacity style={styles.padding_14} onPress={addLead}>
                    <CText style={[styles.unassignLeadText, styles.color_black]}>
                        {t.labels.PBNA_MOBILE_ADD_TO_MY_LEADS.toUpperCase()}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }

    const renderNegotiateButtons = () => {
        return (
            <View style={[styles.padding_5, commonStyle.fullWidth]}>
                <TouchableOpacity
                    style={styles.padding_14}
                    onPress={async () => {
                        await unAssignLead()
                    }}
                    disabled={
                        leadDetail.COF_Triggered_c__c === '1' || leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                    }
                >
                    <CText
                        style={[
                            styles.unassignLeadText,
                            {
                                color:
                                    leadDetail.COF_Triggered_c__c === '1' ||
                                    leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                                        ? 'gray'
                                        : 'black'
                            }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_UNASSIGN_LEAD.toUpperCase()}
                    </CText>
                </TouchableOpacity>
                <View style={[styles.paddingHorizontal_14, commonStyle.fullWidth]}>
                    <View style={[commonStyle.fullWidth, styles.buttonStyle]} />
                </View>
                <TouchableOpacity
                    style={styles.padding_14}
                    onPress={async () => {
                        await onSubmitForCustomer(
                            leadDetail,
                            setLeadDetail,
                            saveTimes,
                            setSaveTimes,
                            cofCheckObj,
                            tooltipRef
                        )
                    }}
                    disabled={
                        showBottomButton ||
                        leadDetail.COF_Triggered_c__c === '1' ||
                        leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                    }
                >
                    <CText
                        style={[
                            styles.unassignLeadText,
                            {
                                color:
                                    showBottomButton ||
                                    leadDetail.COF_Triggered_c__c === '1' ||
                                    leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                                        ? 'gray'
                                        : 'black'
                            }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_SUBMIT_FOR_CUSTOMER.toUpperCase()}
                    </CText>
                </TouchableOpacity>
                <View style={[styles.paddingHorizontal_14, commonStyle.fullWidth]}>
                    <View style={[commonStyle.fullWidth, styles.buttonStyle]} />
                </View>
                <TouchableOpacity
                    style={styles.padding_14}
                    disabled={
                        leadDetail.COF_Triggered_c__c === '1' || leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                    }
                    onPress={() => {
                        tooltipRef.current.toggleTooltip()
                        noSaleModalRef.current?.openModal()
                    }}
                >
                    <CText
                        style={[
                            styles.unassignLeadText,
                            {
                                color:
                                    leadDetail.COF_Triggered_c__c === '1' ||
                                    leadDetail.Owner_GPID_c__c !== CommonParam.GPID__c
                                        ? 'gray'
                                        : 'black'
                            }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_MOVE_TO_NO_SALE.toUpperCase()}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }
    const renderMoreOptions = () => {
        let renderFunction = null
        let tooltipHeight = null
        let leadList = null
        if (leadDetail.Status__c) {
            switch (leadDetail.Status__c) {
                case LeadStatus.OPEN:
                    renderFunction = renderOpenButtons()
                    tooltipHeight = 60
                    leadList = 'Open Leads'
                    break
                case LeadStatus.NEGOTIATE:
                    renderFunction =
                        leadDetail.Owner_GPID_c__c === CommonParam.GPID__c
                            ? renderNegotiateButtons()
                            : renderNoSaleButtons()
                    tooltipHeight = 160
                    leadList = 'My Leads'
                    break
                case LeadStatus.NO_SALE:
                    renderFunction = renderNoSaleButtons()
                    tooltipHeight = 160
                    if (
                        leadDetail.Lead_Sub_Status_c__c === LeadSubStatus.UNQUALIFIED_FOR_BUSINESS ||
                        leadDetail.Lead_Sub_Status_c__c === LeadSubStatus.BUSINESS_CLOSED ||
                        leadDetail.Lead_Sub_Status_c__c === LeadSubStatus.DUPLICATE_CUSTOMER_FOUND ||
                        leadDetail.Lead_Sub_Status_c__c === LeadSubStatus.CORPORATE_DECISION
                    ) {
                        tooltipHeight = 60
                        renderFunction = renderSpecialNoSaleButtons()
                    }
                    leadList = 'My Leads'
                    break
                case LeadStatus.BUSINESS_WON:
                    renderFunction = renderNoSaleButtons()
                    tooltipHeight = 160
                    leadList = 'My Leads'
                    break
                default:
                    renderFunction = <View />
                    tooltipHeight = 10
                    leadList = 'My Leads'
                    break
            }
        }
        return [renderFunction, tooltipHeight, leadList]
    }
    const resetCount = () => {
        const tempLeadDetail = {
            leadDetailsEditCount: 0,
            webSocialMediaEditCount: 0,
            customerAttributesEditCount: 0,
            pepsiCoDataEditCount: 0,
            offerDetailsEditCount: 0,
            equipmentNeedsEditCount: 0,
            prospectNotesEditCount: 0,
            deliveryExecutionEditCount: 0,
            PriceGroupEditCount: 0
        }
        dispatch(updateTempLeadAction(tempLeadDetail))
    }
    const savePriceGroupList = async () => {
        const deletePgL: any[] = []
        const upsetPgL: any[] = []
        dealData.forEach((element) => {
            const indexI = newPgList.findIndex((originI) => originI?.Id === element?.Id)
            if (indexI < judgeIndex) {
                deletePgL.push(element)
            }
        })
        newPgList.forEach((element) => {
            if (leadDetail.ExternalId !== element?.Lead_id__c) {
                upsetPgL.push(element)
            }
        })
        if (_.size(deletePgL) > 0) {
            deleteCustomerDeal(deletePgL, 'savePriceGroupList').then(async () => {
                if (_.size(upsetPgL) > 0) {
                    await syncUpCustomerDeal(leadDetail, pricingLevelId || '', upsetPgL)
                }
            })
        } else {
            if (_.size(upsetPgL) > 0) {
                await syncUpCustomerDeal(leadDetail, pricingLevelId || '', upsetPgL)
            }
        }
    }
    const saveData = async () => {
        const updatedLead = store.getState().leadReducer.negotiateLeadEditReducer
        const updatedLeadTodo = _.cloneDeep(updatedLead)
        try {
            global.$globalModal.openModal()
            await savePriceGroupList()
            setHadQueried(false)
            await updateLeadInfo(updatedLeadTodo, leadDetail, dispatch)
            resetCount()
            setSaveTimes((prevSaveTimes) => {
                return prevSaveTimes + 1
            })
            global.$globalModal.closeModal()
            global.$globalModal.openModal(
                <View style={commonStyle.alignItemsCenter}>
                    <Image style={styles.iconSuccessStyle} source={ImageSrc.ICON_SUCCESS} />
                    <CText style={styles.noLeadFailedText}>{t.labels.PBNA_MOBILE_SUCCESS}</CText>
                    <CText numberOfLines={3} style={styles.noLeadFailedText}>
                        {t.labels.PBNA_MOBILE_CHANGES_HAVE_BEEN_SAVED}
                    </CText>
                </View>
            )
            setTimeout(() => {
                global.$globalModal.closeModal()
            }, 3000)
        } catch (e) {
            global.$globalModal.closeModal()
            storeClassLog(
                Log.MOBILE_ERROR,
                'saveData',
                'save lead data: ' + ErrorUtils.error2String(e) + JSON.stringify(updatedLeadTodo)
            )
            global.$globalModal.openModal(
                <View style={commonStyle.alignItemsCenter}>
                    <ErrorSvg width={50} height={50} />
                    <CText style={styles.errorText}>{t.labels.PBNA_MOBILE_ERROR}</CText>
                    <CText numberOfLines={3} style={styles.noLeadFailedText}>
                        {t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED}
                    </CText>
                </View>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }
    const cancelChanges = (backToList) => {
        if (overviewTabRef && activeTab === 0) {
            overviewTabRef.current?.resetAllData()
        }
        if (offerTabRef && activeTab === 1) {
            offerTabRef.current?.resetAllData()
        }
        setCancelButtonCount(cancelButtonCount + 1)
        if (backToList) {
            navigation.navigate('Leads', {
                page: 'My Leads'
            })
        }
    }
    const handlePressAddContact = () => {
        contactCreationFormRef?.current?.open()
    }
    const openAlert = (backToList?) => {
        Alert.alert(t.labels.PBNA_MOBILE_ALERT, t.labels.PBNA_MOBILE_ALERT_MESSAGE_NOT_SAVED, [
            {
                text: t.labels.PBNA_MOBILE_BACK,
                style: 'cancel'
            },
            {
                text: t.labels.PBNA_MOBILE_PROCEED,
                style: 'default',
                onPress: () => {
                    cancelChanges(backToList)
                }
            }
        ])
    }
    const handleContactIngestFinished = () => {
        setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
        if (leadContactTabRef.current !== null) {
            leadContactTabRef.current.addCount()
        }
    }
    const onAddContact = () => {
        leadContactTabRef?.current?.addCount()
    }
    const handleClickCofRejectedViewMore = async () => {
        try {
            const cofRejectTask = await SoupService.retrieveDataFromSoup('Task', {}, [], null, [
                `WHERE {Task:Lead__c}='${l.ExternalId}' 
                        AND {Task:Status}='Complete' AND {Task:Subject}='Customer Rejected' 
                        ORDER BY {Task:LastModifiedDate} DESC`
            ])
            activityTabRef?.current?.showCofRejectTaskDetail(cofRejectTask[0])
            setActiveTab(3)
            tabBarRef?.current?.setActiveTab(3)
            setShowRecentRejection(true)
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'Rep-handleClickCofRejectedViewMore',
                'Go to Cof Reject Task Detail Failed:' + getStringValue(e)
            )
        }
    }
    const getLeadDetailStatus = () => {
        return (
            leadDetail.Status__c === LeadStatus.NEGOTIATE ||
            leadDetail.Status__c === LeadStatus.NO_SALE ||
            leadDetail.Status__c === LeadStatus.OPEN ||
            (isPersonaFSManager() && leadDetail.Status__c !== LeadStatus.BUSINESS_WON)
        )
    }
    const showAddBtn = () => {
        return getLeadDetailStatus() && leadDetail.COF_Triggered_c__c !== '1' && !isPersonaCRMBusinessAdmin()
    }

    useEffect(() => {
        if (route?.params?.tab) {
            setActiveTab(route?.params?.tab)
            tabBarRef?.current?.setActiveTab(route?.params?.tab)
            tabBarRef?.current?.setRefreshTab()
        }
    }, [])
    useEffect(() => {
        setDisableInstallRequest(
            !(
                !isPersonaCRMBusinessAdmin() &&
                leadDetail.BUSN_SGMNTTN_LVL_1_NM_c__c &&
                leadDetail.Location_ID_c__c &&
                leadDetail.Status__c === LeadStatus.NEGOTIATE &&
                leadDetail.COF_Triggered_c__c === '0'
            )
        )
        isMounted.current = true
        const refreshLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_LEAD_LIST, () => {
            if (leadDetail.COF_Triggered_c__c === '1' && isMounted.current) {
                setRefreshTimes((refreshTimes) => {
                    return refreshTimes + 1
                })
            }
        })
        return () => {
            refreshLeadListEvent.remove()
            isMounted.current = false
        }
    }, [leadDetail])
    useEffect(() => {
        if (getLeadDetailStatus()) {
            const tempLeadDetail = {
                ...leadDetail,
                leadDetailsEditCount: 0,
                webSocialMediaEditCount: 0,
                customerAttributesEditCount: 0,
                pepsiCoDataEditCount: 0,
                offerDetailsEditCount: 0,
                equipmentNeedsEditCount: 0,
                prospectNotesEditCount: 0,
                deliveryExecutionEditCount: 0,
                PriceGroupEditCount: 0,
                phoneValidationFlag: true,
                addressValidationFlag: true,
                deliveryExecutionZipCodeValidationFlag: true,
                emailValidationFlag: true
            }
            dispatch(updateTempLeadAction(tempLeadDetail))
        }
    }, [leadDetail.Status__c, cancelButtonCount])

    const renderForm = () => {
        if (getLeadDetailStatus()) {
            return (
                <View>
                    <ContactForm
                        cRef={contactCreationFormRef}
                        leadExternalId={leadDetail.ExternalId}
                        onIngestFinished={handleContactIngestFinished}
                        l={leadDetail}
                        contactType={'Lead'}
                    />
                    <LogCallForm
                        onAddContact={onAddContact}
                        cRef={logCallModalRef}
                        l={leadDetail}
                        onSave={() => {
                            setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                        }}
                        type={'Lead'}
                        isEdit={false}
                        editCall={''}
                    />
                </View>
            )
        }
    }

    return (
        <View style={styles.detailContainer}>
            {activeTab === 4 && (
                <SafeAreaView style={styles.safeArea}>
                    <CustomerEquipmentReqButton
                        label={t.labels.PBNA_MOBILE_NEW_EQUIPMENT_INSTALL.toUpperCase()}
                        handlePress={() => {
                            equipmentTabRef?.current?.openInstallRequestModal()
                        }}
                        disable={disableInstallRequest}
                    />
                </SafeAreaView>
            )}
            <ScrollView
                scrollEventThrottle={0}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollYAnimatedValue } } }], {
                    useNativeDriver: false
                })}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl
                        title={t.labels.PBNA_MOBILE_LOADING}
                        tintColor={'#00A2D9'}
                        titleColor={'#00A2D9'}
                        refreshing={isLoading}
                        onRefresh={() => {
                            if (!showInitLoadingIndicator) {
                                setIsLoading(true)
                            }
                        }}
                        progressViewOffset={6}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <ImageBackground
                        source={ImageSrc.PATTERN_BLUE_BACKGROUND}
                        resizeMode="cover"
                        style={[styles.container, { flex: 1 }]}
                    />
                    <View style={[styles.background_black, commonStyle.fullWidth, styles.height_100]} />
                    <View style={styles.leadCardContainer}>
                        <OpenLeadCard l={leadDetail} />
                    </View>
                </View>
                <View
                    style={[
                        styles.animatedContainer,
                        styles.background_black,
                        commonStyle.fullWidth,
                        commonStyle.flexRowAlignEnd
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.background_black,
                            commonStyle.fullWidth,
                            {
                                height: tabBarTop
                            }
                        ]}
                    />
                    <View style={[commonStyle.flexRowSpaceCenter, commonStyle.fullWidth]}>
                        <View
                            style={{
                                width: isPersonaFSManager() || isPersonaCRMBusinessAdmin() ? '100%' : '94%'
                            }}
                        >
                            <TabBar
                                tabs={tabs}
                                setActiveSection={(v) => {
                                    setActiveTab(v)
                                }}
                                cRef={tabBarRef}
                            />
                        </View>
                        {!isPersonaFSManager() && !isPersonaCRMBusinessAdmin() && (
                            <Tooltip
                                ref={tooltipRef}
                                popover={renderMoreOptions()[0]}
                                containerStyle={styles.tooltipContainer}
                                pointerColor={'white'}
                                withOverlay={false}
                                height={renderMoreOptions()[1]}
                                width={leadDetail.Status__c === LeadStatus.NEGOTIATE ? 200 : 170}
                            >
                                <Image
                                    source={ImageSrc.ICON_THREE_POINTS}
                                    style={styles.threePointIcon}
                                    ref={threeDotRef}
                                />
                            </Tooltip>
                        )}
                    </View>
                </View>
                <KeyboardAwareScrollView>
                    {activeTab === 0 && (
                        <LeadOverviewTab
                            l={leadDetail}
                            cRef={overviewTabRef}
                            saveTimes={saveTimes}
                            onClickCofRejectedViewMore={handleClickCofRejectedViewMore}
                        />
                    )}
                    {activeTab === 1 && (
                        <LeadOfferElementsTab
                            l={leadDetail}
                            cRef={offerTabRef}
                            onSaveDistributionPoint={() => {
                                setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                            }}
                            saveTimes={saveTimes}
                        />
                    )}
                    {activeTab === 2 && (
                        <LeadContactTab
                            leadExternalId={leadDetail.ExternalId}
                            cRef={leadContactTabRef}
                            leadStatus={leadDetail.Status__c}
                            cofTriggered={leadDetail.COF_Triggered_c__c}
                            onIngest={() => {
                                setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                            }}
                            l={leadDetail}
                            saveTimes={saveTimes}
                        />
                    )}
                    {activeTab === 3 && (
                        <LeadActivityTab
                            l={leadDetail}
                            saveTimes={saveTimes}
                            disableShowRecentRejection={() => {
                                setShowRecentRejection(false)
                            }}
                            showRecentRejection={showRecentRejection}
                            showDetail={route?.params?.showDetail}
                            taskId={route?.params?.taskId}
                            onAddContact={onAddContact}
                            cRef={activityTabRef}
                        />
                    )}
                    {activeTab === 4 && (
                        <LeadEquipmentTab
                            equipmentList={equipmentList}
                            leadId={leadDetail?.ExternalId}
                            lead={leadDetail}
                            setLeadDetail={setLeadDetail}
                            onSave={() => {
                                setSaveTimes((v) => v + 1)
                            }}
                            cRef={equipmentTabRef}
                            selectEquipmentCount={selectEquipmentCount}
                            setSelectEquipmentCount={setSelectEquipmentCount}
                            activeServiceTypes={activeServiceTypes}
                            setActiveServiceTypes={setActiveServiceTypes}
                        />
                    )}
                </KeyboardAwareScrollView>
            </ScrollView>
            <LeadDetailScreenHeader
                company={leadDetail.Company__c}
                headerBackgroundColor={headerBackgroundColor}
                headerLeftChevronColor={headerLeftChevronColor}
                headerTitleColor={headerTitleColor}
                navigation={navigation}
                isGoBack={goBackDP}
                needDelete={needDelete}
                l={leadDetail}
                leadList={renderMoreOptions()[2]}
                setShowCancelConfirmModal={() => {
                    openAlert(true)
                }}
                fromNotification={route.params.fromNotification}
                showLoading={showInitLoadingIndicator}
            />
            <ContactExportButton
                headerCircleColor={headerLeftChevronColor}
                onExportContacts={() => {
                    exportContactsRef.current?.open()
                }}
                overlayStyle={{
                    right: showAddBtn() ? 40 : 0
                }}
            />
            {showAddBtn() && (
                <LeadFloatButton
                    headerCircleColor={headerLeftChevronColor}
                    onPressContact={() => {
                        handlePressAddContact()
                    }}
                    onPressCall={() => {
                        logCallModalRef.current?.open()
                    }}
                    onNewTask={() => {
                        newTaskCreationRef.current?.open()
                    }}
                    l={leadDetail}
                />
            )}
            {showBottomButton && (
                <FormBottomButton
                    onPressCancel={() => {
                        openAlert()
                    }}
                    onPressSave={saveData}
                    rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                    disableSave={disableSave}
                />
            )}
            {renderForm()}
            {leadDetail.Status__c === LeadStatus.NEGOTIATE && (
                <NoSaleModal
                    cRef={noSaleModalRef}
                    leadDetail={leadDetail}
                    onSave={() => {
                        navigation.goBack()
                    }}
                />
            )}
            {
                <NewTaskCreation
                    l={leadDetail}
                    cRef={newTaskCreationRef}
                    onSave={() => {
                        setSaveTimes((prevSaveTimes) => prevSaveTimes + 1)
                    }}
                    type={'Lead'}
                />
            }
            {
                <ExportContactsModal
                    type={'Lead'}
                    cRef={exportContactsRef}
                    l={leadDetail}
                    contactList={contactList}
                    setSearchContactValue={setSearchContactValue}
                    showInitLoadingIndicator={showInitLoadingIndicator}
                />
            }
        </View>
    )
}

export default LeadDetailScreen
