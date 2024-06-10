import React, { FC, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import CollapseContainer from './CollapseContainer'
import LeadFieldTile from '../rep/lead/common/LeadFieldTile'
import MapView, { Marker, Polygon } from 'react-native-maps'
import CustomerSvg from '../../../../assets/image/icon-blue-location.svg'
import {
    useAddedPriceGroup,
    useCustomerProfileRouteSalesGeo,
    useCustomerTileForCustomerProfile,
    useGeofenceData,
    useLeadTileForCustomerProfile
} from '../../hooks/CustomerProfileHooks'
import OpenLeadCard from '../rep/lead/tile/OpenLeadCard'
import { goToLeadDetail } from '../../utils/LeadUtils'
import CustomerWebSocialMedia from '../rep/customer/CustomerWebSocialMedia'
import CustomerWebSocialMediaEditModal from '../rep/customer/CustomerWebSocialMediaEditModal'
import { t } from '../../../common/i18n/t'
import ChevronBlue from '../../../../assets/image/ios-chevron-blue.svg'
import { syncDownObj, syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../api/SyncUtils'
import { getAllFieldsByObjName } from '../../utils/SyncUtils'
import LeadCheckBox from '../rep/lead/common/LeadCheckBox'
import _ from 'lodash'
import PickerTile from '../rep/lead/common/PickerTile'
import LeadInput from '../rep/lead/common/LeadInput'
import { Log } from '../../../common/enums/Log'
import CustomerDetailStyle from '../../styles/manager/CustomerDetailStyle'
import CCheckBox from '../../../common/components/CCheckBox'
import { useLocationLevelGoCart } from '../../hooks/CustomerHooks'
import { BooleanStr } from '../../enums/Manager'
import { isPersonaMerchManager, judgePersona, Persona } from '../../../common/enums/Persona'
import { goToCustomerDetail } from '../../utils/CustomerUtils'
import CustomerListTile from '../rep/customer/CustomerListTile'
import { CommonParam } from '../../../common/CommonParam'
import CustomerDeliveryExecution from '../rep/customer/CustomerDeliveryExecution'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { getMedalMap } from '../../enums/Contract'
import { storeClassLog } from '../../../common/utils/LogUtils'
import dayjs from 'dayjs'
import CustomerPriceGroupExecution from '../rep/customer/CustomerPriceGroupExecution'
import { usePriceGroupTotalList } from '../../hooks/LeadHooks'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { SELLING_DP_SLS_METH_LIST } from '../../hooks/DistributionPointHooks'
import { GeoFenceProps } from '../rep/customer/profile-tab/EditGeoFence/GeoFenceModal'
import LocationService from '../../service/LocationService'

interface CustomerProfileTabProps {
    retailStore
    distributionPointList
    navigation
    cRef
    setCustomerProfileTabEditCount
    setRefreshFlag
    refreshFlag
    readonly
    onEditGeoFence: (data: GeoFenceProps) => void
    priceGroup: any[]
}

const styles = StyleSheet.create({
    mapView: {
        width: '100%',
        height: 222
    },
    geoFenceView: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 22,
        paddingRight: 22,
        width: '100%',
        height: 40,
        backgroundColor: '#FFFFFF',
        opacity: 0.8,
        zIndex: 999
    },
    editGeoBtn: {
        height: 40
    },
    editGeoFenceText: {
        fontSize: 12,
        lineHeight: 40,
        color: '#00A2D9',
        fontWeight: 'bold'
    },
    circle: {
        marginRight: 5,
        width: 10,
        height: 10,
        borderRadius: 5
    },
    geoFenceTypeText: {
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    flexReverse: {
        flexDirection: 'row-reverse',
        paddingHorizontal: '5%',
        paddingVertical: 10
    },
    toggleLabel: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10
    },
    flexRow: {
        flexDirection: 'row'
    },
    bgWhite: {
        paddingHorizontal: '5%',
        backgroundColor: 'white',
        paddingBottom: '5%'
    },
    halfWidth: {
        width: '50%'
    },
    marginBottom: {
        marginBottom: 10
    },
    gap: {
        width: '100%',
        height: 100
    },
    width90: {
        width: '90%'
    },
    marginTop15: {
        marginTop: 15
    },
    marginTop35: {
        marginTop: 35
    },
    marginTopMinus15: {
        marginTop: -15
    },
    marginTopMinus20: {
        marginTop: -20
    },
    pickerLabel: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    },
    priceCont: {
        flex: 1,
        paddingBottom: 30,
        backgroundColor: 'white'
    },
    priceStyle: {
        flex: 1,
        paddingBottom: 30,
        backgroundColor: 'white',
        marginHorizontal: 22
    },
    priceName: {
        marginTop: 16,
        marginBottom: 18,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    priceCell: {
        flex: 1,
        paddingHorizontal: 22
    },
    priceCellStyle: {
        flex: 1
    },
    priceBorder: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    whiteBg: {
        backgroundColor: 'white'
    },
    marginTop_5: {
        marginTop: 5
    },
    distributionSize: {
        height: 16,
        width: 16,
        marginRight: 10
    },
    leftBox: {
        width: 16,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 6,
        position: 'absolute'
    },
    rightBox: {
        width: 3,
        height: 16,
        backgroundColor: '#00A2D9',
        left: 6.5,
        top: 0,
        position: 'absolute'
    },
    priceGroupCTAText: {
        color: '#00A2D9',
        fontWeight: '700'
    }
})

export const renderPriceGroupDetail = (priceList: any[], contStyle?: any) => {
    if (_.size(priceList) === 0) {
        return null
    }
    return (
        <View style={styles.priceCont}>
            {priceList.map((item: any, index: number) => {
                return (
                    <View key={item?.Id} style={[styles.priceCell, index !== 0 && styles.priceBorder, contStyle]}>
                        <CText style={styles.priceName} numberOfLines={0}>
                            {item?.Target_Name__c}
                        </CText>
                    </View>
                )
            })}
        </View>
    )
}
export const renderCustomerPriceGroupDetail = (priceList: any[], showPriceGroupCTA: boolean, titleStyle?: any) => {
    return (
        <View style={styles.priceStyle}>
            {_.size(priceList) > 0 &&
                priceList.map((item: any, index: number) => {
                    return (
                        <View key={item?.Id} style={[styles.priceCellStyle, index !== 0 && styles.priceBorder]}>
                            <CText style={[styles.priceName, titleStyle]} numberOfLines={0}>
                                {item?.Target_Name__c}
                            </CText>
                        </View>
                    )
                })}
            {showPriceGroupCTA && _.size(priceList) > 0 && <View style={[styles.marginBottom, styles.priceBorder]} />}
            {showPriceGroupCTA && (
                <TouchableOpacity onPress={() => {}} style={styles.marginTop_5}>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <View style={styles.distributionSize}>
                            <View style={styles.leftBox} />
                            <View style={styles.rightBox} />
                        </View>
                        <CText style={styles.priceGroupCTAText}>
                            {`${t.labels.PBNA_MOBILE_CD_ADD_PRICE_GROUP.toUpperCase()}`}
                        </CText>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    )
}

const CustomerProfileTab: FC<CustomerProfileTabProps> = (props: CustomerProfileTabProps) => {
    const {
        retailStore,
        distributionPointList,
        navigation,
        setCustomerProfileTabEditCount,
        cRef,
        setRefreshFlag,
        refreshFlag,
        readonly,
        priceGroup,
        onEditGeoFence
    } = props
    const medalMap = getMedalMap()
    const [showDeliveryExecution, setShowDeliveryExecution] = useState(false)
    const [showCustomerDetails, setShowCustomerDetails] = useState(false)
    const [showRelatedLeadDetail, setShowRelatedLeadDetail] = useState(false)
    const [showRelatedCustomerDetail, setShowRelatedCustomerDetail] = useState(false)
    const [showCustomerAttributes, setShowCustomerAttributes] = useState(false)
    const [showPepsiCoData, setShowPepsiCoData] = useState(false)
    const [showPaymentsAndTax, setShowPaymentsAndTax] = useState(false)

    const [showWebSocialMedia, setShowWebSocialMedia] = useState(false)
    const [showPriceGroup, setShowPriceGroup] = useState(false)
    const [tempAccountToUpdate, setTempAccountToUpdate] = useState({
        Id: null,
        Catering__c: null,
        Takeout__c: null,
        Serves_Alcohol__c: null,
        Gas_Station__c: null,
        Serves_Breakfast__c: null,
        Serves_Lunch__c: null,
        Serves_Dinner__c: null,
        Number_of_Rooms__c: null,
        VENUES_ON_SITE__c: null
    })
    const [tempWebSocialMedia, setTempWebSocialMedia] = useState({
        Website: null,
        ff_FACEBOOK__c: null,
        ff_FOURSQUARE__c: null,
        ff_YELP__c: null,
        FF_LINK__c: null,
        ff_UBEREATS__c: null,
        ff_POSTMATES__c: null,
        ff_GRUBHUB__c: null,
        ff_DOORDASH__c: null,
        User_Link_Label_1__c: null,
        User_Link_1__c: null,
        User_Link_Label_2__c: null,
        User_Link_2__c: null,
        User_Link_Label_3__c: null,
        User_Link_3__c: null,
        Rating__c: null
    })
    const [tempAdditionalList, setTempAdditionalList] = useState([])
    const [showWebSocialMediaEditModal, setShowWebSocialMediaEditModal] = useState(false)

    const [webSocialMediaEditCount, setWebSocialMediaEditCount] = useState(0)
    const [customerAttributesEditCount, setCustomerAttributesEditCount] = useState(0)
    const [customerPriceGroupCount, setCustomerPriceGroupCount] = useState(0)
    const [showPriceGroupSearch, setShowPriceGroupSearch] = useState(false)
    const numberOfRoomsRef = useRef(null)
    const numberOfVenuesRef = useRef(null)
    const priceGroupRef = useRef(null)
    const [priceGroupList, setPriceGroupList] = useState([])
    const { priceGroupSearchList, pricingLevelId } = usePriceGroupTotalList(retailStore.AccountId, false)
    const addedPriceGroup = useAddedPriceGroup(retailStore['Account.CUST_UNIQ_ID_VAL__c'], refreshFlag)
    const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null })

    const initValidAdditional = () => {
        return [
            [true, true],
            [true, true],
            [true, true]
        ]
    }
    const [validAdditional, setValidAdditional] = useState(initValidAdditional)

    const [showAll, setShowAll] = useState(false)
    const [showPriceGroupCTA, setShowPriceGroupCTA] = useState(false)

    const routeSalesGeo = useCustomerProfileRouteSalesGeo(retailStore?.LOC_PROD_ID__c)

    const showCDAMedal = Boolean(
        retailStore['Account.IsOTSCustomer__c'] === '1' || retailStore['Account.IsOTSCustomer__c'] === true
    )

    const initWebSocialMedia = (customerAttributes: any) => {
        const webSocialMediaToProcess = {
            Website: retailStore['Account.Website'],
            ff_FACEBOOK__c: retailStore['Account.ff_FACEBOOK__c'],
            ff_FOURSQUARE__c: retailStore['Account.ff_FOURSQUARE__c'],
            ff_YELP__c: retailStore['Account.ff_YELP__c'],
            FF_LINK__c: retailStore['Account.FF_LINK__c'],
            Rating__c: retailStore['Account.Rating__c'],
            ff_UBEREATS__c: retailStore['Account.ff_UBEREATS__c'],
            ff_POSTMATES__c: retailStore['Account.ff_POSTMATES__c'],
            ff_GRUBHUB__c: retailStore['Account.ff_GRUBHUB__c'],
            ff_DOORDASH__c: retailStore['Account.ff_DOORDASH__c'],
            User_Link_Label_1__c: retailStore['Account.User_Link_Label_1__c'],
            User_Link_1__c: retailStore['Account.User_Link_1__c'],
            User_Link_Label_2__c: retailStore['Account.User_Link_Label_2__c'],
            User_Link_2__c: retailStore['Account.User_Link_2__c'],
            User_Link_Label_3__c: retailStore['Account.User_Link_Label_3__c'],
            User_Link_3__c: retailStore['Account.User_Link_3__c']
        }
        setTempWebSocialMedia(webSocialMediaToProcess)
        setTempAccountToUpdate({
            ...tempAccountToUpdate,
            ...webSocialMediaToProcess,
            ...customerAttributes
        })
        const lstAdd = []
        if (retailStore['Account.User_Link_Label_1__c']) {
            lstAdd[0] = {
                Label: retailStore['Account.User_Link_Label_1__c'],
                Link: retailStore['Account.User_Link_1__c']
            }
        }
        if (retailStore['Account.User_Link_Label_2__c']) {
            lstAdd[1] = {
                Label: retailStore['Account.User_Link_Label_2__c'],
                Link: retailStore['Account.User_Link_2__c']
            }
        }
        if (retailStore['Account.User_Link_Label_3__c']) {
            lstAdd[2] = {
                Label: retailStore['Account.User_Link_Label_3__c'],
                Link: retailStore['Account.User_Link_3__c']
            }
        }
        setTempAdditionalList(lstAdd)
    }

    const initCustomerAttributes = () => {
        const tempCustomAttributesToProcess = {
            Catering__c: retailStore['Account.Catering__c'],
            Takeout__c: retailStore['Account.Takeout__c'],
            Serves_Alcohol__c: retailStore['Account.Serves_Alcohol__c'],
            Gas_Station__c: retailStore['Account.Gas_Station__c'],
            Serves_Breakfast__c: retailStore['Account.Serves_Breakfast__c'],
            Serves_Lunch__c: retailStore['Account.Serves_Lunch__c'],
            Serves_Dinner__c: retailStore['Account.Serves_Dinner__c'],
            VENUES_ON_SITE__c: _.isNumber(retailStore['Account.VENUES_ON_SITE__c'])
                ? retailStore['Account.VENUES_ON_SITE__c'] + ''
                : '',
            Number_of_Rooms__c: retailStore['Account.Number_of_Rooms__c']
        }
        setTimeout(() => {
            setTempAccountToUpdate({
                ...tempAccountToUpdate,
                ...tempCustomAttributesToProcess
            })
        }, 0)
        numberOfRoomsRef.current?.resetNull()
        numberOfVenuesRef.current?.reset()
    }

    const initFormValue = () => {
        const tempCustomAttributesToProcess = {
            Catering__c: retailStore['Account.Catering__c'],
            Takeout__c: retailStore['Account.Takeout__c'],
            Serves_Alcohol__c: retailStore['Account.Serves_Alcohol__c'],
            Gas_Station__c: retailStore['Account.Gas_Station__c'],
            Serves_Breakfast__c: retailStore['Account.Serves_Breakfast__c'],
            Serves_Lunch__c: retailStore['Account.Serves_Lunch__c'],
            Serves_Dinner__c: retailStore['Account.Serves_Dinner__c'],

            VENUES_ON_SITE__c: _.isNumber(retailStore['Account.VENUES_ON_SITE__c'])
                ? retailStore['Account.VENUES_ON_SITE__c'] + ''
                : '',
            Number_of_Rooms__c: retailStore['Account.Number_of_Rooms__c']
        }
        initWebSocialMedia(tempCustomAttributesToProcess)
    }

    const mapRef = useRef<MapView>(null)

    const { initialRegion, polygonData, initialDeliveryRegion, deliveryGeoFence } = useGeofenceData(
        retailStore?.Geofence__c,
        retailStore
    )

    if (polygonData.length > 0) {
        mapRef?.current?.fitToCoordinates(polygonData)
    } else if (deliveryGeoFence.length > 0) {
        mapRef?.current?.fitToCoordinates(deliveryGeoFence)
    } else {
        mapRef?.current?.fitToElements({ animated: true })
    }

    const leadData = useLeadTileForCustomerProfile(retailStore?.AccountId)
    const relatedCustomerDate = useCustomerTileForCustomerProfile(leadData?.original_customer_c__c)
    const locationGoCart = useLocationLevelGoCart()
    const accountGoCart = retailStore['Account.Go_Kart_Flag__c'] === BooleanStr.STR_TRUE

    useImperativeHandle(cRef, () => ({
        saveData: async () => {
            global.$globalModal.openModal()
            try {
                const isPriceGroup = !_.isEmpty(priceGroupList)
                const accountToUpdate = {
                    ...tempAccountToUpdate,
                    Id: retailStore.AccountId,
                    Catering__c: tempAccountToUpdate.Catering__c === '1',
                    Takeout__c: tempAccountToUpdate.Takeout__c === '1',
                    Serves_Alcohol__c: tempAccountToUpdate.Serves_Alcohol__c === '1',
                    Gas_Station__c: tempAccountToUpdate.Gas_Station__c === '1',
                    Serves_Breakfast__c: tempAccountToUpdate.Serves_Breakfast__c === '1',
                    Serves_Lunch__c: tempAccountToUpdate.Serves_Lunch__c === '1',
                    Serves_Dinner__c: tempAccountToUpdate.Serves_Dinner__c === '1',
                    VENUES_ON_SITE__c:
                        tempAccountToUpdate.VENUES_ON_SITE__c === '' ? null : tempAccountToUpdate.VENUES_ON_SITE__c
                }

                const priceGroupToCreateArray = isPriceGroup
                    ? priceGroupList.map((priceGroupItem: any) => {
                          return {
                              Cust_Id__c: retailStore['Account.CUST_UNIQ_ID_VAL__c'],
                              Target_Id__c: priceGroupItem.Target_Id__c,
                              Target_Name__c: priceGroupItem.Target_Name__c,
                              Status__c: 'Submitted',
                              Send_outbound__c: true,
                              Pricing_Level_Id__c: pricingLevelId,
                              Type__c: 'prc_grp_request',
                              Effective_date__c: dayjs(priceGroupItem.Effective_date__c)
                                  .utc()
                                  .format(TIME_FORMAT.YMDTHMSSZZ),
                              External_Id__c: `${retailStore['Account.CUST_UNIQ_ID_VAL__c']}_${
                                  priceGroupItem.Target_Id__c
                              }_${dayjs().utc().format(TIME_FORMAT.YMDTHMSSZZ)}`,
                              Is_removed__c: false
                          }
                      })
                    : []
                if (isPriceGroup) {
                    await syncUpObjCreateFromMem('Customer_Deal__c', priceGroupToCreateArray)
                }
                await syncUpObjUpdateFromMem('Account', [accountToUpdate])
                await syncDownObj(
                    'RetailStore',
                    `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id='${
                        retailStore.Id
                    }'`
                )
                setRefreshFlag((v) => v + 1)
                setCustomerAttributesEditCount(0)
                setWebSocialMediaEditCount(0)
                setCustomerPriceGroupCount(0)
                setPriceGroupList([])
                setShowPriceGroupSearch(false)
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'CustomerProfileTab:Save', e)
            } finally {
                global.$globalModal.closeModal()
            }
        },
        cancel: () => {
            initFormValue()
            numberOfRoomsRef.current?.resetNull()
            numberOfVenuesRef.current?.reset()
            setCustomerAttributesEditCount(0)
            setWebSocialMediaEditCount(0)
            setCustomerPriceGroupCount(0)
            setPriceGroupList([])
            setShowPriceGroupSearch(false)
        }
    }))

    const setAllTab = () => {
        setShowDeliveryExecution(!showAll)
        setShowCustomerDetails(!showAll)
        setShowRelatedLeadDetail(!showAll)
        setShowWebSocialMedia(!showAll)
        setShowCustomerAttributes(!showAll)
        setShowPepsiCoData(!showAll)
        setShowRelatedCustomerDetail(!showAll)
        setShowPaymentsAndTax(!showAll)
        setShowAll(!showAll)
        setShowPriceGroup(!showAll)
    }
    useEffect(() => {
        setShowAll(
            showDeliveryExecution ||
                showCustomerDetails ||
                showRelatedLeadDetail ||
                showWebSocialMedia ||
                showCustomerAttributes ||
                showPepsiCoData
        )
    }, [
        showDeliveryExecution,
        showCustomerDetails,
        showRelatedLeadDetail,
        showWebSocialMedia,
        showCustomerAttributes,
        showPepsiCoData
    ])

    useEffect(() => {
        if (retailStore.Id) {
            initFormValue()
        }
    }, [retailStore])

    useEffect(() => {
        const priceGroupSearchCount = showPriceGroupSearch ? 1 : 0
        const count =
            webSocialMediaEditCount + customerAttributesEditCount + customerPriceGroupCount + priceGroupSearchCount
        setCustomerProfileTabEditCount({ editCount: count, disableSave: count === 1 && showPriceGroupSearch })
    }, [webSocialMediaEditCount, customerAttributesEditCount, customerPriceGroupCount, showPriceGroupSearch])

    useEffect(() => {
        const enableCTA = false
        setShowPriceGroupCTA(
            _.some(
                distributionPointList,
                (item) => item['RecordType.Name'] === 'CTR' && SELLING_DP_SLS_METH_LIST.includes(item?.SLS_MTHD_NM__c)
            ) &&
                judgePersona([
                    Persona.FSR,
                    Persona.PSR,
                    Persona.FS_MANAGER,
                    Persona.KEY_ACCOUNT_MANAGER,
                    Persona.UNIT_GENERAL_MANAGER,
                    Persona.DELIVERY_SUPERVISOR,
                    Persona.SALES_DISTRICT_LEADER,
                    Persona.MERCH_MANAGER
                ]) &&
                enableCTA
        )
    }, [distributionPointList])

    const calculateCustomerType = () => {
        if (retailStore['Account.CUST_PROD_FLG__c'] === '1') {
            return t.labels.PBNA_MOBILE_PRODUCT_AND_SERVICE
        }
        if (retailStore['Account.CUST_SRVC_FLG__c'] === '1') {
            return t.labels.PBNA_MOBILE_REPAIR_ONLY
        }
        if (retailStore['Account.CUST_BLG_FLG__c'] === '1') {
            return t.labels.PBNA_MOBILE_BILLING_ONLY
        }
        return t.labels.PBNA_MOBILE_MISCELLANEOUS
    }

    const calculateIsFSV = () => {
        return !_.isEmpty(_.find(distributionPointList, { 'RecordType.Name': 'CTR', SLS_MTHD_CDE__c: '004' }))
            ? t.labels.PBNA_MOBILE_YES
            : t.labels.PBNA_MOBILE_NO
    }

    const getCurrentLocation = async () => {
        const res = await LocationService.getCurrentPosition()
        setCurrentLocation({ latitude: res?.coords?.latitude, longitude: res?.coords?.longitude })
    }

    useEffect(() => {
        getCurrentLocation()
    }, [])

    const onClickEditGeoFence = useCallback(
        _.throttle(
            () => {
                onEditGeoFence({
                    retailStore,
                    salesPin:
                        !initialRegion.latitude || !initialRegion.longitude
                            ? {
                                  ...initialRegion,
                                  latitude: retailStore.Latitude || currentLocation?.latitude,
                                  longitude: retailStore.Longitude || currentLocation?.longitude
                              }
                            : initialRegion,
                    salesGeoFence: polygonData,
                    deliveryPin:
                        !initialDeliveryRegion.latitude || !initialDeliveryRegion.longitude
                            ? {
                                  ...initialDeliveryRegion,
                                  latitude: retailStore.Latitude || currentLocation?.latitude,
                                  longitude: retailStore.Longitude || currentLocation?.longitude
                              }
                            : initialDeliveryRegion,
                    deliveryGeoFence: deliveryGeoFence
                })
            },
            2000,
            { leading: true, trailing: false }
        ),
        [initialRegion, polygonData, initialDeliveryRegion, deliveryGeoFence, retailStore, currentLocation]
    )

    return (
        <View style={styles.whiteBg}>
            {
                <View style={styles.mapView}>
                    <View style={styles.geoFenceView}>
                        <TouchableOpacity style={styles.editGeoBtn} onPress={onClickEditGeoFence}>
                            <CText style={styles.editGeoFenceText}>{t.labels.PBNA_MOBILE_EDIT_GEO_FENCE}</CText>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <View style={[styles.circle, { backgroundColor: '#6C0CC3' }]} />
                        <CText style={styles.geoFenceTypeText}>{_.capitalize(t.labels.PBNA_MOBILE_SALES)}</CText>
                        <View style={{ width: 30 }} />
                        <View style={[styles.circle, { backgroundColor: '#0095BE' }]} />
                        <CText style={styles.geoFenceTypeText}>{_.capitalize(t.labels.PBNA_MOBILE_DELIVERY)}</CText>
                    </View>

                    <MapView style={commonStyle.flex_1} ref={mapRef} loadingEnabled>
                        {initialRegion.latitude && initialRegion.longitude && (
                            <Marker coordinate={initialRegion}>
                                <CustomerSvg />
                            </Marker>
                        )}
                        <Polygon coordinates={polygonData} strokeColor={'#6A1ABE'} fillColor={'rgba(106,26,190,0.1)'} />
                        <Polygon
                            coordinates={deliveryGeoFence}
                            strokeColor={'#0095BE'}
                            fillColor={'rgba(0,149,190,0.38)'}
                        />
                    </MapView>
                </View>
            }
            {locationGoCart && !isPersonaMerchManager() && (
                <View style={CustomerDetailStyle.goCartView}>
                    <CCheckBox
                        disabled
                        readonly
                        checked={accountGoCart}
                        title={<CText style={CustomerDetailStyle.marginLeft_5}>{t.labels.PBNA_MOBILE_GOKART}</CText>}
                        containerStyle={[CustomerDetailStyle.readonlyContainer]}
                    />
                </View>
            )}
            <View style={styles.flexReverse}>
                <TouchableOpacity
                    style={commonStyle.flexRowCenter}
                    onPress={() => {
                        setAllTab()
                    }}
                >
                    <CText style={styles.toggleLabel}>
                        {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                    </CText>
                    <ChevronBlue
                        width={19}
                        height={20}
                        style={{
                            transform: [{ rotate: showAll ? '0deg' : '180deg' }]
                        }}
                    />
                </TouchableOpacity>
            </View>
            <CollapseContainer
                showContent={showDeliveryExecution}
                setShowContent={setShowDeliveryExecution}
                title={t.labels.PBNA_MOBILE_DELIVERY_EXECUTION}
                reset={() => {}}
                showReset={false}
            >
                <CustomerDeliveryExecution
                    retailStore={retailStore}
                    onSaveDistributionPoint={() => {
                        setRefreshFlag((v) => v + 1)
                    }}
                    navigation={navigation}
                    refreshFlag={refreshFlag}
                />
            </CollapseContainer>
            <CollapseContainer
                showContent={showCustomerDetails}
                setShowContent={setShowCustomerDetails}
                title={t.labels.PBNA_MOBILE_CUSTOMER_DETAILS}
                reset={() => {}}
                showReset={false}
            >
                <View style={styles.bgWhite}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_CUSTOMER_NUMBER_PEPSI_COF_NUMBER}
                        fieldValue={retailStore['Account.CUST_UNIQ_ID_VAL__c']}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_STORE_NUMBER_CUSTOMER_STORE_NUMBER}
                        fieldValue={retailStore['Account.RTLR_STOR_NUM__c']}
                    />
                    {showCDAMedal && (
                        <LeadFieldTile
                            fieldName={t.labels.PBNA_MOBILE_CDA_MEDAL_TIER}
                            fieldValue={
                                medalMap[retailStore['Account.CDA_Medal__c'] as string] ||
                                retailStore['Account.CDA_Medal__c']
                            }
                        />
                    )}
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_CUSTOMER_LANGUAGE}
                        fieldValue={retailStore['Account.CUST_BUSN_LANG_ISO_NM__c']}
                    />
                </View>
            </CollapseContainer>
            {leadData?.Id &&
                leadData.Lead_Type_c__c !== 'Change of Ownership' &&
                leadData?.Status__c !== 'Customer Associated' && (
                    <CollapseContainer
                        showContent={showRelatedLeadDetail}
                        setShowContent={setShowRelatedLeadDetail}
                        title={t.labels.PBNA_MOBILE_RELATED_LEAD_DETAIL}
                        reset={() => {}}
                        showReset={false}
                    >
                        <View style={styles.bgWhite}>
                            <TouchableOpacity
                                onPress={() => {
                                    goToLeadDetail(navigation, leadData)
                                }}
                            >
                                <OpenLeadCard l={leadData} inCustomerProfile />
                            </TouchableOpacity>
                        </View>
                    </CollapseContainer>
                )}
            {leadData?.Id && leadData.Lead_Type_c__c === 'Change of Ownership' && relatedCustomerDate && (
                <CollapseContainer
                    showContent={showRelatedCustomerDetail}
                    setShowContent={setShowRelatedCustomerDetail}
                    title={t.labels.PBNA_MOBILE_RELATED_CUSTOMER_DETAIL}
                    reset={() => {}}
                    showReset={false}
                >
                    <View style={styles.bgWhite}>
                        <TouchableOpacity
                            onPress={async () => {
                                await goToCustomerDetail(relatedCustomerDate, navigation, true)
                            }}
                        >
                            <CustomerListTile
                                customer={relatedCustomerDate}
                                showShadow
                                hideAppendage={
                                    CommonParam.PERSONA__c !== Persona.PSR &&
                                    CommonParam.PERSONA__c !== Persona.FSR &&
                                    CommonParam.PERSONA__c !== Persona.FS_MANAGER &&
                                    CommonParam.PERSONA__c !== Persona.CRM_BUSINESS_ADMIN
                                }
                                customerListAppendage={CommonParam.PERSONA__c === Persona.PSR}
                            />
                        </TouchableOpacity>
                    </View>
                </CollapseContainer>
            )}
            <CollapseContainer
                showContent={showWebSocialMedia}
                setShowContent={setShowWebSocialMedia}
                title={t.labels.PBNA_MOBILE_CD_WEB_SOCIAL_MEDIA}
                showReset={webSocialMediaEditCount > 0}
                showEdit={!readonly}
                onPressEdit={() => {
                    setShowWebSocialMediaEditModal(true)
                }}
                reset={() => {
                    initWebSocialMedia({})
                    setWebSocialMediaEditCount(0)
                }}
            >
                <CustomerWebSocialMedia retailStore={tempAccountToUpdate} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showCustomerAttributes}
                setShowContent={setShowCustomerAttributes}
                title={t.labels.PBNA_MOBILE_CUSTOMER_ATTRIBUTES}
                reset={() => {
                    initCustomerAttributes()
                    setCustomerAttributesEditCount(0)
                }}
                showReset={customerAttributesEditCount > 0}
            >
                <View style={[styles.bgWhite, styles.marginTopMinus15]}>
                    <View style={[commonStyle.flexDirectionRow, styles.marginBottom]}>
                        <View style={styles.halfWidth}>
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_CATERING}</CText>}
                                checked={tempAccountToUpdate.Catering__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Catering__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_TAKEOUT}</CText>}
                                checked={tempAccountToUpdate.Takeout__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Takeout__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_SERVES_ALCOHOL}</CText>}
                                checked={tempAccountToUpdate.Serves_Alcohol__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Serves_Alcohol__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_GAS_STATION}?</CText>}
                                checked={tempAccountToUpdate.Gas_Station__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Gas_Station__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_SERVES_BREAKFAST}?</CText>}
                                checked={tempAccountToUpdate.Serves_Breakfast__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Serves_Breakfast__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_SERVES_LUNCH}</CText>}
                                checked={tempAccountToUpdate.Serves_Lunch__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Serves_Lunch__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                            <LeadCheckBox
                                title={<CText>{t.labels.PBNA_MOBILE_SERVES_DINNER}</CText>}
                                checked={tempAccountToUpdate.Serves_Dinner__c === '1'}
                                editable={!readonly}
                                customTrueValue={'1'}
                                customFalseValue={'0'}
                                onChange={(value) => {
                                    setTempAccountToUpdate({
                                        ...tempAccountToUpdate,
                                        Serves_Dinner__c: value
                                    })
                                    setCustomerAttributesEditCount((v) => v + 1)
                                }}
                                outerForm
                            />
                        </View>
                    </View>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_TYPE_SECONDARY_CUISINE}
                        fieldValue={
                            retailStore['Account.Secondary_Cuisine__c']
                                ? `${retailStore['Account.Business_Type__c']}-${retailStore['Account.Secondary_Cuisine__c']}`
                                : retailStore['Account.Business_Type__c']
                        }
                    />
                    <View style={styles.marginTop15}>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={styles.halfWidth}>
                                <View style={[styles.marginTop15, styles.width90]}>
                                    <LeadInput
                                        fieldName={t.labels.PBNA_MOBILE_NUMBER_OF_VENUES_ON_SITE}
                                        initValue={
                                            _.isNumber(retailStore['Account.VENUES_ON_SITE__c'])
                                                ? retailStore['Account.VENUES_ON_SITE__c'] + ''
                                                : ''
                                        }
                                        disabled={_.isNumber(retailStore['Account.VENUES_ON_SITE__c']) || readonly}
                                        number
                                        onChangeText={(v) => {
                                            setTempAccountToUpdate({
                                                ...tempAccountToUpdate,
                                                VENUES_ON_SITE__c: v
                                            })
                                            setCustomerAttributesEditCount((cusEditCount) => cusEditCount + 1)
                                        }}
                                        cRef={numberOfVenuesRef}
                                        noMargin
                                    />
                                </View>
                            </View>
                            <View style={styles.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_HOTEL_STAR_RATING}
                                    fieldValue={retailStore['Account.Star_Level__c']}
                                />
                            </View>
                        </View>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={styles.halfWidth}>
                                <View style={[styles.width90]}>
                                    <PickerTile
                                        data={[
                                            t.labels.PBNA_MOBILE_SELECT_NUMBER_OF_ROOMS,
                                            '1 - 25',
                                            '26 - 50',
                                            '51 - 100',
                                            '101 - 200',
                                            '201 - 500',
                                            '500+'
                                        ]}
                                        label={t.labels.PBNA_MOBILE_NUMBER_OF_ROOMS}
                                        title={t.labels.PBNA_MOBILE_NUMBER_OF_ROOMS.toUpperCase()}
                                        defValue={tempAccountToUpdate.Number_of_Rooms__c}
                                        placeholder={''}
                                        required={false}
                                        disabled={!_.isEmpty(retailStore['Account.Number_of_Rooms__c']) || readonly}
                                        noPaddingHorizontal
                                        labelStyle={styles.pickerLabel}
                                        cRef={numberOfRoomsRef}
                                        onChange={(value) => {
                                            setTempAccountToUpdate({
                                                ...tempAccountToUpdate,
                                                Number_of_Rooms__c: value
                                            })
                                            setCustomerAttributesEditCount((v) => v + 1)
                                        }}
                                    />
                                </View>
                            </View>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_YEARS_IN_BUSINESS}
                                fieldValue={retailStore['Account.Years_In_Business__c']}
                                containerStyle={styles.marginTopMinus15}
                            />
                        </View>
                    </View>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_K_12_ENROLLMENT}
                        fieldValue={retailStore['Account.K_12_Enrollment__c']}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_ACTIVE_BASE_POPULATION}
                        fieldValue={retailStore['Account.Active_Base_Population__c']}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_Annual_Sales}
                        fieldValue={retailStore['Account.Annual_Sales__c']}
                    />
                </View>
            </CollapseContainer>
            <CollapseContainer
                showContent={showPriceGroup}
                setShowContent={setShowPriceGroup}
                title={t.labels.PBNA_MOBILE_CD_PRICE_GROUP}
            >
                <CustomerPriceGroupExecution
                    priceGroup={priceGroup}
                    addedPriceGroup={addedPriceGroup}
                    priceGroupRef={priceGroupRef}
                    addingPriceGroup={priceGroupList}
                    setAddingPriceGroup={setPriceGroupList}
                    setCustomerPriceGroupCount={setCustomerPriceGroupCount}
                    showPriceGroupSearch={showPriceGroupSearch}
                    setShowPriceGroupSearch={setShowPriceGroupSearch}
                    showPriceGroupCTA={showPriceGroupCTA}
                    priceGroupOriginSearchList={priceGroupSearchList}
                    setRefreshFlag={setRefreshFlag}
                    custId={retailStore['Account.CUST_UNIQ_ID_VAL__c']}
                    pricingLevelId={pricingLevelId}
                />
            </CollapseContainer>
            <CollapseContainer
                showContent={showPepsiCoData}
                setShowContent={setShowPepsiCoData}
                title={t.labels.PBNA_MOBILE_PEPSICO_DATA}
                reset={() => {}}
                showReset={false}
            >
                <View style={[styles.bgWhite, styles.marginTopMinus15]}>
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_CHANNEL}
                        fieldValue={retailStore['Account.BUSN_SGMNTTN_LVL_3_NM__c']}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                        fieldValue={retailStore['Account.BUSN_SGMNTTN_LVL_2_NM__c']}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT}
                        fieldValue={retailStore['Account.BUSN_SGMNTTN_LVL_1_NM__c']}
                        containerStyle={styles.marginBottom}
                    />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_REGION}
                        fieldValue={routeSalesGeo.region}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_MARKET}
                        fieldValue={routeSalesGeo.market}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_LOCATION}
                        fieldValue={routeSalesGeo.location}
                        containerStyle={styles.marginBottom}
                    />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_KEY_ACCOUNT_OWNER}
                        fieldValue={retailStore['Account.Parent.Parent.Parent.Name']}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_KEY_ACCOUNT}
                        fieldValue={retailStore['Account.Parent.Parent.Name']}
                        containerStyle={styles.marginBottom}
                    />
                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_KEY_ACCOUNT_DIVISION}
                        fieldValue={retailStore['Account.Parent.Name']}
                        containerStyle={styles.marginBottom}
                    />

                    <LeadFieldTile
                        fieldName={t.labels.PBNA_MOBILE_PEPSICO_NATIONAL_FLAG}
                        fieldValue={
                            retailStore['Account.PEPSI_COLA_NATNL_ACCT__c'] === '1'
                                ? t.labels.PBNA_MOBILE_YES
                                : t.labels.PBNA_MOBILE_NO
                        }
                        containerStyle={styles.marginBottom}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '50%' }}>
                            <LeadFieldTile
                                fieldName={`${t.labels.PBNA_MOBILE_CUSTOMER_TYPE}`}
                                fieldValue={calculateCustomerType()}
                            />
                        </View>
                        <View style={{ width: '50%' }}>
                            <LeadFieldTile fieldName={`${t.labels.PBNA_MOBILE_FSV}?`} fieldValue={calculateIsFSV()} />
                        </View>
                    </View>
                </View>
            </CollapseContainer>
            <CollapseContainer
                showContent={showPaymentsAndTax}
                setShowContent={setShowPaymentsAndTax}
                title={t.labels.PBNA_MOBILE_PAYMENT_TERMS_TAX_INFO}
            >
                <View style={styles.bgWhite}>
                    <View style={commonStyle.flexDirectionRow}>
                        <View style={styles.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_PAYMENT_TERMS}
                                fieldValue={retailStore['Account.PAYMT_MTHD_NM__c']}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_RESALE_CERTIFICATE}
                                fieldValue={retailStore['Account.resale_cert__c']}
                            />
                        </View>
                    </View>
                    <View style={commonStyle.flexDirectionRow}>
                        <View style={styles.halfWidth}>
                            <LeadFieldTile
                                fieldName={`${t.labels.PBNA_MOBILE_FEDERAL_TIN} #`}
                                fieldValue={retailStore['Account.LGL_RGSTRTN_NUM_VAL__c']}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_CREDIT_STATUS}
                                fieldValue={retailStore['Account.credit_status__c']}
                            />
                        </View>
                    </View>
                    <View style={commonStyle.flexDirectionRow}>
                        <View style={styles.halfWidth}>
                            <LeadFieldTile
                                fieldName={t.labels.PBNA_MOBILE_TAX_EXEMPT}
                                fieldValue={
                                    retailStore['Account.tax_exempt_flg__c'] === '1'
                                        ? t.labels.PBNA_MOBILE_YES
                                        : t.labels.PBNA_MOBILE_NO
                                }
                            />
                        </View>
                    </View>
                </View>
            </CollapseContainer>
            <View style={styles.gap} />
            <CustomerWebSocialMediaEditModal
                tempAccount={tempAccountToUpdate}
                setTempAccount={setTempAccountToUpdate}
                showModal={showWebSocialMediaEditModal}
                setShowModal={setShowWebSocialMediaEditModal}
                account={tempWebSocialMedia}
                setAccount={setTempWebSocialMedia}
                additionalList={tempAdditionalList}
                setAdditionalList={setTempAdditionalList}
                validAdditional={validAdditional}
                setValidAdditional={setValidAdditional}
                retailStore={retailStore}
                setEditCount={setWebSocialMediaEditCount}
            />
        </View>
    )
}

export default CustomerProfileTab
