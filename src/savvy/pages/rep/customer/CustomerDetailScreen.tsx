/**
 * @description Screen to show Customer detail.
 * @author Shangmin Dou
 * @date 2021-09-27
 */
import React, { FC, useRef, useState, useEffect, SetStateAction } from 'react'
import {
    Animated,
    ImageBackground,
    StyleSheet,
    View,
    RefreshControl,
    Dimensions,
    SafeAreaView,
    NativeAppEventEmitter,
    ViewStyle
} from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import TabBar from '../../../components/common/TabBar'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    useCustomerDetail,
    useCustomerDetailTabs,
    useCustomerActivity,
    useInternalContacts,
    useInitCustomerDetail,
    usePepsiDirectOrder,
    useInitStoreProductData
} from '../../../hooks/CustomerHooks'
import CustomerListTile from '../../../components/rep/customer/CustomerListTile'
import Utils from '../../../common/DateTimeUtils'
import { CommonParam } from '../../../../common/CommonParam'
import CustomerDetailScreenHeader from './CustomerDetailScreenHeader'
import InnovationProductCarousel from '../../../components/rep/customer/innovation-tab/InnovationProductCarousel'
import { useDetailScreenHeaderTabAnimation } from '../../../hooks/AnimationHooks'
import { useSellingDataFromLocalHook, useInnovationCarouselDetail } from '../../../hooks/InnovationProductHooks'
import EquipmentTab from '../../../components/rep/customer/EquipmentTab'
import ContactForm from '../../../components/rep/lead/ContactForm'
import CustomerContactTab from '../../../components/rep/customer/CustomerContactTab'
import CustomerActivityTab from '../../../components/rep/customer/activity-tab/CustomerActivityTab'
import LogCallForm from '../../../components/rep/lead/LogCallForm'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSR,
    isPersonaPSR,
    isPersonaSDL,
    isPersonaUGMOrSDL,
    Persona,
    isPersonaManager,
    isPersonaKAM,
    isPersonaPSROrKAM,
    judgePersona
} from '../../../../common/enums/Persona'

import { useRepPullDownRefresh } from '../../../hooks/RefreshHooks'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import CustomerEquipmentReqButton from '../../../components/rep/customer/CustomerEquipmentReqButton'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import _ from 'lodash'
import CustomerProfileTab from '../../../components/common/CustomerProfileTab'
import { Instrumentation } from '@appdynamics/react-native-agent'
import SalesSnapshot from '../../../components/manager/my-customers/SalesSnapshot/SalesSnapshot'
import { useSalesSnapshotData } from '../../../hooks/SalesSnapshotHooks'
import { useEquipmentAssets, useService } from '../../../hooks/EquipmentHooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { t } from '../../../../common/i18n/t'
import CustomerMyStoreTab from '../../../components/rep/customer/CustomerMyStoreTab'
import LeadFloatButton from '../../../components/rep/lead/common/LeadFloatButton'
import NewTaskCreation from '../../../components/rep/lead/creation/NewTaskCreation'
import ChangeOfOwnership from '../../../components/rep/customer/ChangeOfOwnership'
import ExportContactsModal from '../../../components/rep/lead/contact-tab/ExportContactsModal'
import ContactExportButton from '../../../components/rep/lead/common/ContactExportButton'
import { useContacts } from '../../../hooks/LeadHooks'
import { restDataCommonCall } from '../../../api/SyncUtils'
import { useGlobalModal } from '../../../contexts/GlobalModalContext'
import ProcessDoneModal from '../../../components/common/ProcessDoneModal'
import PopMessage from '../../../components/common/PopMessage'
import { useCustomerDistributionPoints, usePriceGroupWithRequest } from '../../../hooks/CustomerProfileHooks'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { getPepsiCoPeriodCalendar } from '../../../components/merchandiser/MyPerformance'
import POSView from '../../../components/rep/customer/pos-tab/POSView'
import { useCustomerInvoiceHeader } from '../../../hooks/CustomerInvoiceHooks'
import CustomerContractTab from '../../../components/rep/customer/CustomerContractTab'
import { deleteUselessSurveyPhoto } from '../../../utils/CustomerSyncUtils'
import { AssetAttributeService } from '../../../service/AssetAttributeService'
import { FullScreenModalRef } from '../../../components/rep/lead/common/FullScreenModal'
import { setPepsicoCalendar } from '../../../redux/action/ContractAction'
import { useDisablePOSButton, usePOSListHooks } from '../../../hooks/POSHooks'
import { syncDownSalesDocumentsBack } from '../../../utils/InnovationProductUtils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Loading from '../../../../common/components/Loading'
import { isTodayDayWithTimeZone } from '../../../utils/TimeZoneUtils'
import { useSharePointToken } from '../../../helper/rep/SharePointTokenHelper'
import { useAppDispatch, useAppSelector } from '../../../redux/ReduxHooks'
import { checkAndRefreshEquipmentSharePoint } from '../../../service/EquipmentSharePointService'
import { useIsFocused } from '@react-navigation/native'
import PushOrderBar from '../../../../orderade/component/visits/PushOrderBar'
import { IntervalTime } from '../../../enums/Contract'
import Mailer from 'react-native-mail'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'
import {
    DTWEmailInfo,
    DelTimeWindowEmailEvent
} from '../../../components/rep/customer/profile-tab/DeliveryTimeWindowEmail'
import { useGetRetailStore } from '../../../hooks/MerchandiserHooks'
import SelectGeoFenceTypeModal, {
    GEO_FENCE_TYPE
} from '../../../components/rep/customer/profile-tab/EditGeoFence/SelectGeoFenceTypeModal'
import { DefaultGeoFence, GeoFenceProps } from '../../../components/rep/customer/profile-tab/EditGeoFence/GeoFenceModal'
import SuccessView, { SuccessViewRef } from '../../../components/common/SuccessView'
import { GeoFenceUpdateSuccessEvent } from '../../../components/rep/customer/profile-tab/EditGeoFence/EditGeoFenceHelper'
import { useSelector } from 'react-redux'
import { selectRedirectAction, setRedirectAction } from '../../../redux/Slice/CustomerDetailSlice'
import { renderSuccessViewJSX } from '../../../components/rep/customer/innovation-tab/InnovationProductArchiveDetail'
import { customDelay } from '../../../utils/CommonUtils'

interface CustomerScreenProps {
    navigation: any
    route: any
}

const screenHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    pushOrderBarBox: {
        position: 'relative',
        bottom: 10
    },
    container: {
        paddingRight: Utils.isTablet ? 80 : 22,
        paddingLeft: Utils.isTablet ? 80 : 22,
        height: screenHeight / 5.5
    },
    customerCardContainer: {
        marginTop: 0,
        width: '100%',
        position: 'absolute',
        top: 105, // (fix this top value dynamic)
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
    customerScrollView: {
        backgroundColor: '#f3f4f7'
    },
    equipmentContainer: {
        // paddingTop: 20,
        // height: 500
    },
    contactsContainer: {
        backgroundColor: 'white'
    },
    baCont: {
        flex: 1,
        height: '100%'
    },
    equipmentCon: {
        height: screenHeight / 18,
        position: 'absolute',
        bottom: 22,
        width: '100%',
        justifyContent: 'center',
        zIndex: 2
    },
    styleEmptyV: {
        backgroundColor: 'black',
        width: '100%'
    },
    animateBg: {
        flexDirection: 'row',
        backgroundColor: 'black',
        padding: 15,
        paddingHorizontal: '5%',
        width: '100%',
        alignItems: 'flex-end'
    },
    animateV: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    width100: {
        width: '100%'
    },
    successModalView: {
        width: 384,
        height: 254
    },
    geoFenceSuccessView: {
        paddingHorizontal: 22,
        width: 384,
        height: 254
    }
})

export enum ActiveTabName {
    SALES_ACTIONS = 'SALES ACTIONS',
    SALES_SNAPSHOT = 'SALES SNAPSHOT',
    MY_STORE = 'MY STORE',
    ACTIVITIES = 'ACTIVITIES',
    EQUIPMENT = 'EQUIPMENT',
    CONTRACT = 'CONTRACT',
    CONTACTS = 'CONTACTS',
    PROFILE = 'PROFILE',
    POS = 'POS'
}

const DEFAULT_HEIGHT = 60
const PSR_OR_KAM_HEIGHT = 60
// CustomerDetailScreenHeader component Icon height (constant)
const CUS_HEADER_ICON_HEIGHT = 30

const CustomerDetailScreen: FC<CustomerScreenProps> = (props: CustomerScreenProps) => {
    const { navigation, route } = props
    const needDelete = route.params.needDelete ? route.params.needDelete : false
    const readonly = !!route.params.readonly
    const customerFromRoute = route.params.customer
    const isGoBackToCustomer = route?.params?.isGoBackToCustomer ? route.params.isGoBackToCustomer : false
    const isOnline = route.params?.isOnline
    const contractAndAuditSubTab = route?.params?.subTab
    const dispatch = useAppDispatch()
    const changeOfOwnershipRef = useRef(null)
    const { globalModalRef } = useGlobalModal()
    const contractRef = useRef(null)
    const selectGeoFenceTypeModal = useRef(null)
    const [geoFenceData, setGeoFenceData] = useState<GeoFenceProps>(DefaultGeoFence)
    const successRef = useRef<SuccessViewRef>(null)
    const geoFenceSuccessRef = useRef<SuccessViewRef>(null)
    const onGoBackToKamCustomerList = route.params?.onGoBackToKamCustomerList
    const CALCULATE_HEIGHT_BY_PERSONA = isPersonaPSROrKAM() ? PSR_OR_KAM_HEIGHT : DEFAULT_HEIGHT

    const scrollYAnimatedValue = useRef(new Animated.Value(0)).current
    const { headerBackgroundColor, headerTitleColor, headerLeftChevronColor, tabBarTop } =
        useDetailScreenHeaderTabAnimation(scrollYAnimatedValue)
    const getDefaultTab = () => {
        if (route?.params?.tab) {
            return route?.params?.tab
        } else if (isPersonaPSROrKAM()) {
            return ActiveTabName.SALES_ACTIONS
        }
        return ActiveTabName.SALES_SNAPSHOT
    }
    const [activeTab, setActiveTab] = useState<ActiveTabName>(getDefaultTab())
    const contactCreationFormRef = useRef(null)
    const customerContactTabRef = useRef(null)
    const [refreshFlag, setRefreshFlag] = useState<number>(0)
    const [submitChangeOfOwnership, setSubmitChangeOfOwnership] = useState(false)
    const [showContractUploadBar, setShowContractUploadBar] = useState(false)
    const { retailStoreDetail } = useGetRetailStore(customerFromRoute.AccountId, refreshFlag)
    const customerDetail: any = useCustomerDetail(customerFromRoute, refreshFlag, dispatch)
    const { tabs } = useCustomerDetailTabs(customerDetail)
    const [offlineLoading, setOfflineLoading] = useState<boolean>(false)

    const [showInitLoadingIndicator, setShowInitLoadingIndicator] = useState(false)
    const tabBarRef = useRef(null)
    useInitCustomerDetail(
        customerDetail?.AccountId,
        customerDetail?.Id,
        setRefreshFlag,
        setShowInitLoadingIndicator,
        dispatch,
        submitChangeOfOwnership
    )

    useInitStoreProductData(customerDetail?.Id, setRefreshFlag)

    const { isLoading, setIsLoading } = useRepPullDownRefresh(
        `CustomerDetailScreenTab${activeTab}`,
        dispatch,
        false,
        customerDetail
    ) // `!!` for ts check
    const [searchContactValue, setSearchContactValue] = useState('')
    const userList = useInternalContacts(
        customerDetail?.AccountId,
        isLoading,
        refreshFlag,
        searchContactValue,
        isOnline
    )
    const contactList = useContacts(
        'RetailStore',
        customerDetail?.AccountId,
        0,
        isLoading,
        refreshFlag,
        searchContactValue
    )
    const [updateCarousel, setUpdateCarousel] = useState(0)
    const [returnFromDetail, setReturnFromDetail] = useState(false)
    const { carouselInfo, accessToken } = useInnovationCarouselDetail(
        customerDetail?.Id,
        isLoading,
        refreshFlag,
        '',
        updateCarousel
    )
    const [exeItemId, setExeItemId] = useState('')
    // when init customer detail data for different persona successfully(particularly online)
    // use flag to refresh data
    const getRefreshSellingDataFlag = () => {
        if (
            judgePersona([
                Persona.SALES_DISTRICT_LEADER,
                Persona.UNIT_GENERAL_MANAGER,
                Persona.KEY_ACCOUNT_MANAGER,
                Persona.PSR
            ])
        ) {
            return refreshFlag
        }
        return 0
    }
    const getRefreshSellingDataFlagAction = () => {
        if (
            judgePersona([
                Persona.SALES_DISTRICT_LEADER,
                Persona.UNIT_GENERAL_MANAGER,
                Persona.KEY_ACCOUNT_MANAGER,
                Persona.PSR
            ])
        ) {
            return setRefreshFlag
        }
        return undefined
    }
    const isFocused = useIsFocused()
    const useSellingDataFromLocalHookProps = {
        isLoading,
        retailStore: customerDetail,
        shouldLandOnTab: route.params?.shouldLandOnTab,
        exeItemId,
        refreshFlag: getRefreshSellingDataFlag(),
        isFocused,
        showInitLoadingIndicator
    }
    const {
        isLoadingPriorities,
        carouselSelling,
        activeCarouselTab,
        archivedPriorities,
        prioritiesTabReady,
        storePriorities
    } = useSellingDataFromLocalHook(useSellingDataFromLocalHookProps)
    const logCallFormRef = useRef(null)
    const newTaskCreationRef = useRef(null)
    const exportContactsRef = useRef(null)
    const equipmentTabRef = useRef(null)
    const customerProfileTabRef = useRef(null)
    const requestPosModalRef = useRef<FullScreenModalRef>(null)
    const [assetSearchValue, setAssetSearchValue] = useState('')
    const { equipmentList, isEquipmentListLoading } = useEquipmentAssets(
        isLoading,
        customerDetail?.AccountId,
        refreshFlag,
        assetSearchValue
    )
    const activityListRefreshTime = useAppSelector(
        (state) => state.customerReducer.customerDetailReducer.activityListRefreshTime
    )
    const { deliveryList, preSellDetailList, merDetailList, historyTaskList, openTaskList } = useCustomerActivity(
        customerDetail,
        isLoading,
        refreshFlag + activityListRefreshTime
    )
    usePepsiDirectOrder(customerDetail?.['Account.CUST_ID__c'], isLoading, refreshFlag, dispatch)
    const invoiceHeader = useCustomerInvoiceHeader(customerDetail?.['Account.CUST_ID__c'])
    const requestList = useService(customerDetail?.AccountId, isLoading, refreshFlag, 'RetailStore')
    const posList = usePOSListHooks(customerDetail, refreshFlag)
    const disablePOSButton = useDisablePOSButton(customerDetail, refreshFlag)
    const { dropDownRef } = useDropDown()
    const [selectEquipmentCount, setSelectEquipmentCount] = useState(0)
    const distributionPointList = useCustomerDistributionPoints(customerDetail?.AccountId, refreshFlag)
    const [periodCalendar, setPeriodCalendar] = useState([])
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

    const onReceiveDelTimeWindowEmailEvent = (res: DTWEmailInfo) => {
        const { file, title, emails } = res

        const attachments = [
            {
                type: 'pdf',
                path: file.filePath,
                name: `${title}.pdf`
            }
        ]
        Mailer.mail(
            {
                subject: title,
                recipients: emails,
                isHTML: true,
                attachments
            },
            (error, event) => {
                if (event === 'sent') {
                    dropDownRef?.current?.alertWithType('success', t.labels.PBNA_MOBILE_SEND_TIME_WINDOW_SUCCESS, '')
                }

                if (!_.isEmpty(error)) {
                    storeClassLog(Log.MOBILE_ERROR, 'Send Email Failed', error)
                    dropDownRef?.current?.alertWithType('error', 'Send Email Failed', error)
                }

                successRef.current?.openModal()
            }
        )
    }

    // deal with redirect page --BEGIN--
    const redirectAction = useSelector(selectRedirectAction)

    useEffect(() => {
        if (isFocused && redirectAction.reloadPriorities) {
            dispatch(setRedirectAction({ type: 'reloadPriorities', data: null }))
            setRefreshFlag((v) => v + 1)
        }
    }, [isFocused, redirectAction.reloadPriorities])

    const [successViewJSX, setSuccessViewJSX] = useState<React.ReactNode>('')
    const [successViewConStyle, setSuccessViewConStyle] = useState<ViewStyle>({} as ViewStyle)
    const pushToSmartRSuccessRef = useRef<SuccessViewRef>(null)

    const handleShowPushToSmartRMessage = async () => {
        const { pushToSMARTrMessageTitle } = route.params
        const successViewJSX = renderSuccessViewJSX(pushToSMARTrMessageTitle)
        setSuccessViewJSX(successViewJSX)
        setSuccessViewConStyle({
            width: '75%',
            height: 'auto',
            paddingHorizontal: 20,
            paddingBottom: 30
        })
        await customDelay(200)
        pushToSmartRSuccessRef.current?.openModal()
    }

    useEffect(() => {
        // try to refresh the page
        const { actionType } = route.params as { actionType: string; actionData: any }
        if (isFocused) {
            if (actionType === 'priorityNoSale' || actionType === 'atcSuccess') {
                setRefreshFlag((v) => v + 1)
            }
            if (actionType === 'atcSuccess') {
                handleShowPushToSmartRMessage()
            }
        }
    }, [isFocused, route.params?.actionType, route.params?.actionData])
    // deal with redirect page --END--

    useEffect(() => {
        const notificationEmitter = NativeAppEventEmitter.addListener(
            DelTimeWindowEmailEvent,
            async (res: DTWEmailInfo) => {
                onReceiveDelTimeWindowEmailEvent(res)
            }
        )
        const geoFenceNotificationEmitter = NativeAppEventEmitter.addListener(GeoFenceUpdateSuccessEvent, () => {
            geoFenceSuccessRef.current?.openModal()
        })

        ;(async () => await checkAndRefreshEquipmentSharePoint())()

        return () => {
            notificationEmitter && notificationEmitter.remove()
            geoFenceNotificationEmitter && geoFenceNotificationEmitter.remove()
        }
    }, [])

    const [customerProfileTabEditCount, setCustomerProfileTabEditCount] = useState({ editCount: 0, disableSave: false })
    const [customerTileMeasure, setCustomerCardTileMeasure] = useState(null)

    const { breakdownData, productMixData, lineChartData, toplineMetricsData, pdpData } = useSalesSnapshotData(
        customerDetail,
        periodCalendar,
        'YTD'
    )
    const priceGroup = usePriceGroupWithRequest(customerDetail)

    const [isSyncingAssetAttr, setIsSyncingAssetAttr] = useState(false)

    // get device content position value, such as `insets.top` is 59 (in iPhone14 series)
    const insets = useSafeAreaInsets()

    const sharepointToken = useSharePointToken(true)

    useEffect(() => {
        const refreshSuccessFlag = getRefreshSellingDataFlag()
        if (isPersonaKAM() || isPersonaUGMOrSDL()) {
            // start sync down files after refresh success(refreshSuccessFlag > 0)
            !isLoading &&
                refreshSuccessFlag &&
                sharepointToken &&
                syncDownSalesDocumentsBack(dispatch, sharepointToken, true)
        }
    }, [getRefreshSellingDataFlag(), sharepointToken, isLoading])

    useEffect(() => {
        if (isPersonaPSROrKAM() || isPersonaUGMOrSDL()) {
            navigation.addListener('beforeRemove', () => {
                if (isPersonaKAM()) {
                    onGoBackToKamCustomerList && onGoBackToKamCustomerList()
                }
                Instrumentation.stopTimer('PSR Time Spent On Customer Detail Page')
                AsyncStorage.setItem('carousel_page', '')
            })
            return () => {
                navigation.removeListener('beforeRemove')
            }
        }
        deleteUselessSurveyPhoto()
    }, [])

    useEffect(() => {
        isPersonaManager() && AssetAttributeService.syncLatestAssetAttributeWithLoading(setIsSyncingAssetAttr)
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            setPeriodCalendar(result)
            dispatch(setPepsicoCalendar(result))
        })
    }, [])

    useEffect(() => {
        if (route?.params?.tab && (!isPersonaPSR || !activeTab)) {
            setActiveTab(route?.params?.tab)
            tabBarRef.current.setActiveTab(tabs.findIndex((v) => v.value === route?.params?.tab))
            tabBarRef?.current?.setRefreshTab()
        }
    }, [route.params?.tab, tabs])
    const handleContactIngestFinished = () => {
        customerContactTabRef?.current?.addCount()
    }

    const handleSetExecutedPriorityId = (id: string) => {
        setExeItemId(id)
    }

    const onClickExecute = async (exeItem: any, storeId: string, setFlag?: React.Dispatch<SetStateAction<number>>) => {
        Instrumentation.reportMetric('Savvy Selling Carousel Card - Execute button', 1)
        if (exeItem?.Id) {
            navigation.navigate('PriorityPhotoExecution', {
                priorityItem: exeItem,
                retailStore: customerDetail,
                setFlagAction: setFlag || getRefreshSellingDataFlagAction(),
                setExecutedPriorityId: handleSetExecutedPriorityId
            })
        }
    }

    const renderForm = () => {
        return (
            <View>
                <ContactForm
                    cRef={contactCreationFormRef}
                    accountId={customerDetail?.AccountId}
                    onIngestFinished={handleContactIngestFinished}
                    contactType={'RetailStore'}
                />
            </View>
        )
    }
    const handlePressAddContact = () => {
        contactCreationFormRef.current.open()
    }
    const customerTileContainerTopStyle = () => {
        if (isPersonaPSROrKAM()) {
            const topValue = insets.top + CUS_HEADER_ICON_HEIGHT
            return { top: topValue }
        }
        return {}
    }

    const calculateServiceRequestFormButtonLabel = () => {
        const activeServiceTypeObj = activeServiceTypes.find((serviceType) => serviceType.serviceActive)
        if (activeServiceTypeObj) {
            if (activeServiceTypeObj.serviceType === 'Repair') {
                return t.labels.PBNA_MOBILE_CONFIRM_ONE_ASSET.toUpperCase()
            }
            return `${
                t.labels.PBNA_MOBILE_CONFIRM
            } ${selectEquipmentCount} ${t.labels.PBNA_MOBILE_ASSET_S.toUpperCase()}`
        }
        return ''
    }

    const handlePressChangeOfOwnership = async () => {
        const res = await restDataCommonCall(
            `query/?q=SELECT count() FROM Request__c WHERE status__c = 'SUBMITTED' AND serv_ord_type_cde__c !='PM'  AND customer__c = '${customerDetail?.AccountId}'`,
            'GET'
        )
        const submitRequestCount = res.data.totalSize
        if (submitRequestCount === 0) {
            changeOfOwnershipRef.current?.open()
        } else {
            globalModalRef.current?.openModal(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>
                        {`${t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_NOT_ALLOWED}. ${t.labels.PBNA_MOBILE_OPEN_EQUIPMENT_REQUESTS}`}
                    </PopMessage>
                </ProcessDoneModal>
            )
            setTimeout(() => {
                globalModalRef.current?.closeModal()
            }, 3000)
        }
    }

    const throttledOnClickPushContract = _.throttle(
        async () => {
            if (offlineLoading) {
                return
            }
            setOfflineLoading(true)
            await contractRef?.current?.onClickPushContract()
        },
        // eslint-disable-next-line no-undef
        IntervalTime.ONE_THOUSAND,
        { leading: true, trailing: false }
    )

    const onEditGeoFence = (data: GeoFenceProps) => {
        setGeoFenceData(data)
        selectGeoFenceTypeModal?.current?.openModal()
    }

    const onSelectGeoFenceType = (type: GEO_FENCE_TYPE) => {
        navigation.navigate('EditGeoFence', {
            navigation,
            type,
            geoFenceData,
            accountId: customerFromRoute.AccountId
        })
    }

    return (
        <View style={styles.baCont}>
            {(activeTab === ActiveTabName.EQUIPMENT || activeTab === ActiveTabName.POS) && (
                <SafeAreaView style={styles.equipmentCon}>
                    {!isPersonaCRMBusinessAdmin() && (
                        <CustomerEquipmentReqButton
                            label={
                                activeTab === ActiveTabName.POS
                                    ? t.labels.PBNA_MOBILE_REQUEST_NEW_POS.toUpperCase()
                                    : t.labels.PBNA_MOBILE_REQUEST_NEW_INSTALL.toUpperCase()
                            }
                            disable={
                                customerDetail?.['Account.change_initiated__c'] === '1' ||
                                (isPersonaManager() && isSyncingAssetAttr) ||
                                (activeTab === ActiveTabName.POS &&
                                    (disablePOSButton || isTodayDayWithTimeZone(customerDetail?.CreatedDate, true)))
                            }
                            handlePress={() => {
                                if (activeTab === ActiveTabName.POS) {
                                    requestPosModalRef?.current?.openModal()
                                }
                                equipmentTabRef?.current?.openInstallRequestModal()
                            }}
                        />
                    )}
                    {selectEquipmentCount > 0 && (
                        <FormBottomButton
                            onPressCancel={() => {
                                const tempActiveServiceTypes = _.cloneDeep(activeServiceTypes)
                                tempActiveServiceTypes.forEach((serviceType) => {
                                    serviceType.serviceActive = false
                                })
                                setActiveServiceTypes(tempActiveServiceTypes)
                            }}
                            onPressSave={() => {
                                equipmentTabRef?.current?.openServiceRequestModal()
                            }}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                            rightButtonLabel={calculateServiceRequestFormButtonLabel()}
                        />
                    )}
                </SafeAreaView>
            )}

            <KeyboardAwareScrollView
                scrollEventThrottle={0}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollYAnimatedValue } } }], {
                    useNativeDriver: false
                })}
                stickyHeaderIndices={[1]}
                style={styles.customerScrollView}
                refreshControl={
                    !isPersonaManager() ? (
                        <RefreshControl
                            title={t.labels.PBNA_MOBILE_LOADING}
                            tintColor={'#00A2D9'}
                            titleColor={'#00A2D9'}
                            refreshing={isLoading}
                            onRefresh={() => {
                                if (!showInitLoadingIndicator) {
                                    setReturnFromDetail(false)
                                    setIsLoading(true)
                                }
                            }}
                            progressViewOffset={6}
                        />
                    ) : (
                        // to fix ts type mismatch error
                        <></>
                    )
                }
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <ImageBackground
                        source={ImageSrc.PATTERN_BLUE_BACKGROUND}
                        resizeMode="cover"
                        style={[styles.container, commonStyle.flex_1]}
                    />
                    <View
                        style={[
                            styles.styleEmptyV,
                            {
                                height: customerTileMeasure?.height
                                    ? customerTileMeasure?.height - CALCULATE_HEIGHT_BY_PERSONA
                                    : 100
                            }
                        ]}
                    />
                    <View style={[styles.customerCardContainer, customerTileContainerTopStyle()]}>
                        <View
                            onLayout={(event) => {
                                setCustomerCardTileMeasure(event?.nativeEvent?.layout)
                            }}
                        >
                            <CustomerListTile
                                customer={customerDetail}
                                hideAppendage={isPersonaPSR() || isPersonaSDL() || isPersonaKAM()}
                                isCDAMapView={!!route.params.isCDAMapView}
                                isOnDetailPage
                                refreshFlag={refreshFlag}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.animateBg, { paddingTop: isPersonaPSROrKAM() ? 0 : 15 }]}>
                    <Animated.View
                        style={{
                            width: '100%',
                            height: tabBarTop
                        }}
                    />
                    <View style={styles.animateV}>
                        <View style={styles.width100}>
                            <TabBar
                                tabs={tabs}
                                setActiveSection={(k, v) => {
                                    setActiveTab(v.value)
                                }}
                                barInitialPosition={route.params.barInitialPosition}
                                cRef={tabBarRef}
                            />
                        </View>
                    </View>
                </View>
                {activeTab === ActiveTabName.SALES_ACTIONS && isPersonaPSROrKAM() && (
                    <InnovationProductCarousel
                        data={carouselInfo}
                        isGoBackToCustomer={isGoBackToCustomer}
                        navigation={navigation}
                        isLoading={isLoading || isLoadingPriorities}
                        accessToken={accessToken}
                        retailStore={customerDetail}
                        updateCarousel={() => setUpdateCarousel((prevUpdateCarousel) => prevUpdateCarousel + 1)}
                        showInitLoadingIndicator={showInitLoadingIndicator}
                        returnFromDetail={returnFromDetail}
                        setReturnFromDetail={(v) => setReturnFromDetail(v)}
                        carouselTab={activeCarouselTab}
                        carouselSelling={carouselSelling}
                        storePriorities={storePriorities}
                        onClickExecute={onClickExecute}
                        archivedPriorities={archivedPriorities}
                        prioritiesTabReady={prioritiesTabReady}
                        priorityIndex={route.params?.priorityIndex}
                    />
                )}
                {activeTab === ActiveTabName.SALES_SNAPSHOT && (
                    <SalesSnapshot
                        lineData={lineChartData}
                        periodCalendar={periodCalendar}
                        packageDownData={breakdownData}
                        productMixData={productMixData}
                        toplineMetricsData={toplineMetricsData}
                        retailStore={customerDetail}
                        pdpData={pdpData}
                    />
                )}
                {activeTab === ActiveTabName.SALES_ACTIONS && isPersonaUGMOrSDL() && (
                    <InnovationProductCarousel
                        data={carouselInfo}
                        isGoBackToCustomer={isGoBackToCustomer}
                        navigation={navigation}
                        isLoading={isLoading || isLoadingPriorities}
                        accessToken={accessToken}
                        retailStore={customerDetail}
                        updateCarousel={() => setUpdateCarousel((prevUpdateCarousel) => prevUpdateCarousel + 1)}
                        showInitLoadingIndicator={showInitLoadingIndicator}
                        returnFromDetail={returnFromDetail}
                        setReturnFromDetail={(v) => setReturnFromDetail(v)}
                        carouselTab={activeCarouselTab}
                        carouselSelling={carouselSelling}
                        storePriorities={storePriorities}
                        onClickExecute={onClickExecute}
                        archivedPriorities={archivedPriorities}
                        prioritiesTabReady={prioritiesTabReady}
                        priorityIndex={route.params?.priorityIndex}
                    />
                )}
                {activeTab === ActiveTabName.MY_STORE && (
                    <CustomerMyStoreTab
                        storeTabVisible
                        isOTSCustomer={customerDetail?.['Account.IsOTSCustomer__c']}
                        retailStoreId={customerDetail.Id}
                        accountId={customerDetail?.AccountId}
                        retailStoreName={customerDetail?.Name}
                        customerUniqueVal={customerDetail?.['Account.CUST_UNIQ_ID_VAL__c']}
                        isOnline
                        storePropertyId={retailStoreDetail?.MapstedPropertyId__c}
                    />
                )}
                {activeTab === ActiveTabName.ACTIVITIES && (
                    <CustomerActivityTab
                        deliveryDetailList={deliveryList}
                        preSellDetailList={preSellDetailList}
                        merDetailList={merDetailList}
                        historyTaskList={historyTaskList}
                        openTaskList={openTaskList}
                        navigation={navigation}
                        dropDownRef={dropDownRef}
                        taskId={route?.params?.taskId}
                        showDetail={route?.params?.showDetail}
                        setRefreshFlag={setRefreshFlag}
                        retailStore={customerDetail}
                        onAddContact={handleContactIngestFinished}
                        invoiceHeader={invoiceHeader}
                    />
                )}
                {activeTab === ActiveTabName.EQUIPMENT && (
                    <View style={styles.equipmentContainer}>
                        <EquipmentTab
                            retailStore={customerDetail}
                            accountId={customerDetail?.AccountId}
                            equipmentList={equipmentList}
                            navigation={navigation}
                            isLoading={isLoading}
                            requestList={requestList}
                            onSave={() => {
                                setRefreshFlag((v) => v + 1)
                            }}
                            cRef={equipmentTabRef}
                            selectEquipmentCount={selectEquipmentCount}
                            setSelectEquipmentCount={setSelectEquipmentCount}
                            activeServiceTypes={activeServiceTypes}
                            setActiveServiceTypes={setActiveServiceTypes}
                            readonly={isPersonaCRMBusinessAdmin()}
                            assetSearchValue={assetSearchValue}
                            setAssetSearchValue={setAssetSearchValue}
                            isEquipmentListLoading={isEquipmentListLoading}
                        />
                    </View>
                )}
                {activeTab === ActiveTabName.CONTACTS && (
                    <CustomerContactTab
                        retailStore={customerDetail}
                        cRef={customerContactTabRef}
                        userList={userList}
                        onIngest={() => {}}
                        setRefreshFlag={setRefreshFlag}
                    />
                )}
                {activeTab === ActiveTabName.PROFILE && (
                    <CustomerProfileTab
                        navigation={navigation}
                        retailStore={customerDetail}
                        distributionPointList={distributionPointList}
                        setCustomerProfileTabEditCount={setCustomerProfileTabEditCount}
                        cRef={customerProfileTabRef}
                        setRefreshFlag={setRefreshFlag}
                        readonly={isPersonaCRMBusinessAdmin() || readonly}
                        refreshFlag={refreshFlag}
                        priceGroup={priceGroup}
                        onEditGeoFence={onEditGeoFence}
                    />
                )}
                {/*  CustomerContractTab Tab To preserve state */}
                {
                    <CustomerContractTab
                        defaultSuTab={contractAndAuditSubTab}
                        refreshFlag={refreshFlag}
                        offlineLoading={offlineLoading}
                        setOfflineLoading={setOfflineLoading}
                        setRefreshFlag={setRefreshFlag}
                        cRef={contractRef}
                        retailStore={customerDetail}
                        activeTab={activeTab}
                        editable
                        setShowContractUploadBar={setShowContractUploadBar}
                    />
                }
                {activeTab === ActiveTabName.POS && (
                    <POSView
                        ref={requestPosModalRef}
                        customer={customerDetail}
                        posList={posList}
                        setRefreshListFlag={setRefreshFlag}
                    />
                )}
            </KeyboardAwareScrollView>

            {activeTab === ActiveTabName.CONTRACT && showContractUploadBar && (
                <View style={styles.pushOrderBarBox}>
                    <PushOrderBar
                        icon={ImageSrc.ICON_PUSH_ORDER}
                        text={
                            `${customerDetail['Account.CUST_UNIQ_ID_VAL__c'] || ''} ` +
                            t.labels.PBNA_MOBILE_CONTRACT_NOT_SUBMITTED
                        }
                        buttonText={t.labels.PBNA_MOBILE_PUSH_ORDER_BUTTON.toLocaleUpperCase()}
                        onPress={throttledOnClickPushContract}
                        disabled={offlineLoading}
                    />
                </View>
            )}

            <CustomerDetailScreenHeader
                company={customerDetail?.Name}
                headerBackgroundColor={headerBackgroundColor}
                headerLeftChevronColor={headerLeftChevronColor}
                headerTitleColor={headerTitleColor}
                navigation={navigation}
                needDelete={needDelete}
                customerDetail={customerDetail}
                isGoBackToCustomer={isGoBackToCustomer}
                showLoading={showInitLoadingIndicator && !isPersonaManager()}
                onShowDetailScreen={() => {
                    route?.params?.onShowDetailScreen && route?.params?.onShowDetailScreen()
                }}
            />
            <ContactExportButton
                headerCircleColor={headerLeftChevronColor}
                onExportContacts={() => {
                    exportContactsRef.current?.open()
                }}
                overlayStyle={{
                    right:
                        CommonParam.PERSONA__c !== Persona.UNIT_GENERAL_MANAGER && !isPersonaCRMBusinessAdmin() ? 40 : 0
                }}
            />
            {CommonParam.PERSONA__c !== Persona.UNIT_GENERAL_MANAGER && !isPersonaCRMBusinessAdmin() && (
                <LeadFloatButton
                    headerCircleColor={headerLeftChevronColor}
                    onPressContact={() => {
                        handlePressAddContact()
                    }}
                    showAddContact={customerDetail['Account.change_initiated__c'] !== '1'}
                    showChangeOfOwnership={
                        customerDetail['Account.change_initiated__c'] !== '1' && (isPersonaFSR() || isPersonaPSROrKAM())
                    }
                    onPressCall={() => {
                        logCallFormRef?.current?.open()
                    }}
                    onNewTask={() => {
                        newTaskCreationRef?.current?.open()
                    }}
                    onPressChangeOfOwnership={async () => {
                        await handlePressChangeOfOwnership()
                    }}
                    l={customerDetail}
                />
            )}
            {renderForm()}

            <ChangeOfOwnership
                onSave={() => {
                    setShowInitLoadingIndicator(true)
                    setRefreshFlag((v) => v + 1)
                    setSubmitChangeOfOwnership(true)
                }}
                cRef={changeOfOwnershipRef}
                customer={customerDetail}
            />

            <LogCallForm
                onAddContact={handleContactIngestFinished}
                cRef={logCallFormRef}
                onSave={() => {
                    setRefreshFlag((v) => v + 1)
                }}
                type={'RetailStore'}
                customer={customerDetail}
                isEdit={false}
                editCall={''}
            />
            {
                <NewTaskCreation
                    l={customerDetail}
                    cRef={newTaskCreationRef}
                    onSave={() => {
                        setRefreshFlag((prevSaveTimes) => prevSaveTimes + 1)
                    }}
                    type={'RetailStore'}
                />
            }
            {activeTab === ActiveTabName.PROFILE && customerProfileTabEditCount.editCount > 0 && (
                <FormBottomButton
                    rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                    onPressSave={() => {
                        customerProfileTabRef.current?.saveData()
                    }}
                    onPressCancel={() => {
                        customerProfileTabRef.current?.cancel()
                    }}
                    disableSave={customerProfileTabEditCount.disableSave}
                />
            )}
            {
                <ExportContactsModal
                    cRef={exportContactsRef}
                    type={'RetailStore'}
                    l={customerDetail}
                    userList={userList}
                    contactList={contactList}
                    setSearchContactValue={setSearchContactValue}
                    showInitLoadingIndicator={showInitLoadingIndicator}
                />
            }
            {isPersonaManager() && <Loading isLoading={showInitLoadingIndicator || isSyncingAssetAttr} />}

            <SelectGeoFenceTypeModal cRef={selectGeoFenceTypeModal} onConfirm={onSelectGeoFenceType} />
            <SuccessView
                ref={successRef}
                title={`${t.labels.PBNA_MOBILE_SUCCESS}\n${t.labels.PBNA_MOBILE_EDIT_TIME_WINDOW_SUCCESS1}\n${t.labels.PBNA_MOBILE_EDIT_TIME_WINDOW_SUCCESS2}`}
                modalViewStyle={styles.successModalView}
                afterTimeClose={2000}
            />
            <SuccessView
                ref={geoFenceSuccessRef}
                title={`${t.labels.PBNA_MOBILE_SUCCESS}\n${t.labels.PBNA_MOBILE_EDIT_GEO_FENCE_SUCCESS}`}
                modalViewStyle={styles.geoFenceSuccessView}
                afterTimeClose={2000}
            />
            <SuccessView
                ref={pushToSmartRSuccessRef}
                successViewJSX={successViewJSX}
                modalViewStyle={successViewConStyle}
                afterTimeClose={IntervalTime.FIVE_THOUSAND}
                noClickable
            />
        </View>
    )
}

export default CustomerDetailScreen
