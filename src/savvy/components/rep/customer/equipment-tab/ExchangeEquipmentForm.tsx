import React, { FC, useRef, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import {
    useEquipmentTypeList,
    useExistingAccessoryRequests,
    useExistingProductRequests,
    useInstallRequestLineItems,
    getMoveTypeMapping,
    useRequestRecordTypeId
} from '../../../../hooks/EquipmentHooks'
import EquipmentTypeListTile from './EquipmentTypeListTile'
import EquipmentForm from './EquipmentForm'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { syncUpObjCreateFromMem, syncUpObjDelete, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { SoupService } from '../../../../service/SoupService'
import { CommonParam } from '../../../../../common/CommonParam'
import { Log } from '../../../../../common/enums/Log'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import _ from 'lodash'
import RequestLineItemBottomStatus from './RequestLineItemBottomStatus'
import { t } from '../../../../../common/i18n/t'
import { initServiceRequestLineItem } from '../../../../utils/EquipmentUtils'
import { isNullSpace } from '../../../manager/helper/MerchManagerHelper'
import ExchangeBlue from '../../../../../../assets/image/Exchange_Blue_Background.svg'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'
import EquipmentPdfModal from './EquipmentPdfModal'

interface ExchangeEquipmentFormProps {
    existingServiceLineItems
    serviceType
    handlePressRemove
    customer
    request
    products
    setProducts
    editedAp
    refreshTimes
    setRefreshTimes
    openPopup
    closePopup
    accountId
    equipmentList
    activePart
    setActivePart
    exchangeLineItemsEvenSequential
    handleDeleteOriginAndExchangeEquipment
    allInstallRequestLineItems
    equipmentTypeCodeDesc: any
    surveyData
    tempIndex
    setTempIndex
    tempRequestLineItem
    setTempRequestLineItem
    setRefreshDp
    distributionPointList
    updateGeneralEquipmentDetail?: Function
    readonly: boolean
}

const styles = StyleSheet.create({
    exchangeTileContainer: {
        paddingHorizontal: 22,
        marginTop: -5,
        marginBottom: 5
    },
    exchangeTileTouchable: {
        minHeight: 95,
        width: '100%',
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        padding: 22,
        marginBottom: 3,
        borderRadius: 10
    },
    equipmentImgSrcContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    equipmentImgSrcStyle: {
        height: 35,
        width: 27,
        resizeMode: 'contain'
    },
    setupDescText: {
        fontWeight: '500',
        overflow: 'hidden',
        width: 275
    },
    siteDescText: {
        overflow: 'hidden',
        width: 210
    },
    editEquipmentContainer: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center'
    },
    editText: {
        fontWeight: '500',
        color: '#00A2D9'
    },
    emptySetUpContainer: {
        height: 10,
        width: 2,
        backgroundColor: '#565656',
        marginHorizontal: 5
    },
    removeText: {
        fontWeight: '500',
        color: '#EB445A'
    },
    existingLineItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    backStyle: {
        width: 12,
        height: 20,
        marginRight: 20
    },
    exchangeText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        fontFamily: 'Gotham'
    },
    equipmentImgSrcContainer2: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    exchangeBlue: {
        position: 'absolute',
        left: 25,
        top: 25
    },
    assetNumStyle: {
        width: 160,
        overflow: 'hidden'
    },
    exchangeScrollView: {
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 22
    },
    itemToExchangeContainer: {
        marginTop: 20,
        flex: 1
    },
    exchangeWith: {
        paddingHorizontal: 22,
        marginBottom: -30
    },
    marginLeft_20: {
        marginLeft: 20
    },
    colorGray: {
        color: 'gray'
    },
    marginBottom_30: {
        marginBottom: 30
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    },
    marginTop_4: {
        marginTop: 4
    },
    imgContainer: {
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        padding: 22,
        marginBottom: 10,
        borderRadius: 10
    },
    height_95: {
        height: 95
    },
    height_120: {
        height: 120
    },
    textTransform: {
        textTransform: 'lowercase'
    }
})
const ExchangeEquipmentForm: FC<ExchangeEquipmentFormProps> = (props: ExchangeEquipmentFormProps) => {
    const {
        existingServiceLineItems,
        serviceType,
        customer,
        request,
        products,
        setProducts,
        editedAp,
        refreshTimes,
        setRefreshTimes,
        openPopup,
        closePopup,
        accountId,
        equipmentList,
        activePart,
        setActivePart,
        exchangeLineItemsEvenSequential,
        handleDeleteOriginAndExchangeEquipment,
        allInstallRequestLineItems,
        equipmentTypeCodeDesc,
        surveyData,
        tempIndex,
        setTempIndex,
        tempRequestLineItem,
        setTempRequestLineItem,
        setRefreshDp,
        distributionPointList,
        updateGeneralEquipmentDetail,
        readonly
    } = props
    const customerId = customer['Account.CUST_UNIQ_ID_VAL__c']
    const [tempItemToExchange, setTempItemToExchange] = useState(initServiceRequestLineItem())
    const [accessories, setAccessories] = useState([])
    const [selectedEquipSetupId, setSelectedEquipSetupId] = useState('')

    const [tempType, setTempType] = useState({})
    const [tempEquipment, setTempEquipment] = useState({})

    const installRequestLineItems = useInstallRequestLineItems(request?.Id, refreshTimes)

    const requestRecordTypeId = useRequestRecordTypeId()

    const existingAccessoryRequests = useExistingAccessoryRequests(tempRequestLineItem?.Id, refreshTimes)
    const existingProductRequests = useExistingProductRequests(tempRequestLineItem?.Id, refreshTimes)

    const equipmentTypeList = useEquipmentTypeList(customer['Account.PEPSI_COLA_NATNL_ACCT__c'])
    const equipmentFormRef = useRef(null)
    const equipmentPdfRef = useRef(null)

    const handleClickType = (item, lineItem, k) => {
        setTempItemToExchange(lineItem)
        setTempIndex(k)
        setTempType(item)
    }

    const handleEditEquipment = (item, lineItem, k) => {
        setTempItemToExchange(item)
        setTempIndex(k)
        setTempEquipment(lineItem)
    }
    const onClickSpecs = (pdfSource: string) => {
        if (!_.isEmpty(pdfSource)) {
            equipmentPdfRef?.current?.open(pdfSource)
        }
    }

    const renderTypeTile = (lineItem, k) => {
        if (equipmentTypeList.length > 0) {
            const tile = equipmentTypeList.find((v) => {
                return v.equip_type_cde__c === lineItem.Equip_type_cde__c
            })
            if (tile) {
                return (
                    <EquipmentTypeListTile
                        item={tile}
                        onClick={() => handleClickType(tile, lineItem, k)}
                        isSubType={false}
                    />
                )
            }
        }
    }

    const handleDeleteEquipment = async (item) => {
        try {
            openPopup()
            const res = await SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                ['Id'],
                'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                    "WHERE ({Request__c:request_subtype__c}='Move Request Product' " +
                    "OR {Request__c:request_subtype__c}='Move Request Accessory') AND " +
                    `{Request__c:parent_request_record__c}='${item.Id}'`
            )
            const requestToDelete = [...res, item]
            await syncUpObjDelete(requestToDelete.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                requestToDelete.map((v) => v._soupEntryId + '')
            )
            if (updateGeneralEquipmentDetail) {
                const tempLineItems = _.cloneDeep(installRequestLineItems)
                _.remove(tempLineItems, (o) => {
                    // @ts-ignore
                    return o.Id === item.Id
                })
                await updateGeneralEquipmentDetail(tempLineItems)
            }
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'ExchangeEquipmentForm: handleDeleteEquipment',
                'HandleDeleteEquipment Error: ' + getStringValue(e)
            )
        } finally {
            setRefreshTimes((v) => v + 1)
            closePopup()
        }
    }

    const handlePressRemoveTopRightCorner = (existingServiceLineItem) => {
        if (existingServiceLineItems.length > 1) {
            Alert.alert(isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING), t.labels.PBNA_MOBILE_REMOVE_ASSET_MSG, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: () => {
                        handleDeleteOriginAndExchangeEquipment(existingServiceLineItem)
                    }
                }
            ])
        } else {
            Alert.alert(isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING), t.labels.PBNA_MOBILE_CANCEL_REQUEST_MSG, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: async () => {
                        handleDeleteOriginAndExchangeEquipment(existingServiceLineItem)
                    }
                }
            ])
        }
    }

    const renderExchangeTile = (existingServiceLineItem, k) => {
        const sequence = parseInt(existingServiceLineItem.order_line_num__c)
        const exchangeLineItem = exchangeLineItemsEvenSequential.find(
            (v) => parseInt(v.order_line_num__c) === sequence + 1
        )
        if (exchangeLineItem) {
            return (
                <View style={styles.exchangeTileContainer}>
                    <TouchableOpacity
                        style={styles.exchangeTileTouchable}
                        onPress={() => {
                            handleEditEquipment(existingServiceLineItem, exchangeLineItem, k)
                        }}
                        disabled={request.status__c === 'DRAFT'}
                    >
                        <View>
                            <View style={styles.equipmentImgSrcContainer}>
                                <EquipmentImageDisplay
                                    subtypeCde={exchangeLineItem.std_setup_equip_id__c}
                                    imageStyle={styles.equipmentImgSrcStyle}
                                    filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_BRANDING_URL}
                                    equipTypeDesc={equipmentTypeCodeDesc[existingServiceLineItem.Equip_type_cde__c]}
                                />
                            </View>
                        </View>
                        <View style={styles.marginLeft_20}>
                            <CText style={styles.setupDescText} numberOfLines={1}>
                                {exchangeLineItem.equip_setup_desc__c}
                            </CText>
                            {exchangeLineItem.equip_site_desc__c && (
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_LOCATION}&nbsp;</CText>
                                    <CText style={styles.siteDescText} numberOfLines={1}>
                                        {exchangeLineItem.equip_site_desc__c}
                                    </CText>
                                </View>
                            )}
                            {request.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                                <View style={styles.editEquipmentContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            handleEditEquipment(existingServiceLineItem, exchangeLineItem, k)
                                        }}
                                    >
                                        <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                                    </TouchableOpacity>
                                    <View style={styles.emptySetUpContainer} />

                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING),
                                                t.labels.PBNA_MOBILE_REMOVE_STANDARD_SETUP_MSG,
                                                [
                                                    {
                                                        text: t.labels.PBNA_MOBILE_CANCEL,
                                                        style: 'cancel'
                                                    },
                                                    {
                                                        text: t.labels.PBNA_MOBILE_YES,
                                                        onPress: async () => {
                                                            handleDeleteEquipment(exchangeLineItem)
                                                        }
                                                    }
                                                ]
                                            )
                                        }}
                                    >
                                        <CText style={styles.removeText}>
                                            {t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {request.status__c !== 'DRAFT' && <RequestLineItemBottomStatus item={exchangeLineItem} />}
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View style={styles.marginBottom_30}>
                <View style={styles.paddingHorizontal_22}>
                    <CText>{t.labels.PBNA_MOBILE_SELECT_NEW_EQUIPMENT_TYPE}</CText>
                </View>
                {renderTypeTile(existingServiceLineItem, k)}
            </View>
        )
    }

    const renderExistingLineItem = (existingServiceLineItem, k?) => {
        return (
            <View style={styles.paddingHorizontal_22}>
                <View style={styles.existingLineItemContainer}>
                    <View style={commonStyle.flexRowCenter}>
                        {k === undefined && (
                            <TouchableOpacity
                                onPress={() => {
                                    setTempRequestLineItem(initServiceRequestLineItem())
                                    setTempItemToExchange(initServiceRequestLineItem())
                                    setTempType({})
                                    setTempEquipment({})
                                    setProducts([])
                                    setAccessories([])
                                    setActivePart(1)
                                }}
                            >
                                <Image source={ImageSrc.IMG_BACK} style={styles.backStyle} />
                            </TouchableOpacity>
                        )}
                        <CText style={styles.exchangeText}>
                            {t.labels.PBNA_MOBILE_EXCHANGE} {k === undefined ? tempIndex + 1 : k + 1}
                        </CText>
                    </View>
                    {k !== undefined && request.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                        <TouchableOpacity
                            onPress={() => {
                                handlePressRemoveTopRightCorner(existingServiceLineItem)
                            }}
                        >
                            <CText style={styles.removeText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={[styles.imgContainer, { minHeight: 95 }]}>
                    <View style={styles.equipmentImgSrcContainer2}>
                        <EquipmentImageDisplay
                            subtypeCde={existingServiceLineItem.equip_styp_cde__c}
                            imageStyle={styles.equipmentImgSrcStyle}
                            filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                            equipTypeDesc={equipmentTypeCodeDesc[existingServiceLineItem.Equip_type_cde__c]}
                        />
                        <ExchangeBlue width={20} height={20} style={styles.exchangeBlue} />
                    </View>
                    <View style={styles.marginLeft_20}>
                        <CText style={styles.setupDescText} numberOfLines={1}>
                            {existingServiceLineItem.Name}
                        </CText>
                        <View style={styles.marginTop_4}>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_ASSET} #&nbsp;</CText>
                                <CText style={styles.assetNumStyle} numberOfLines={1} ellipsizeMode="tail">
                                    {existingServiceLineItem.ident_asset_num__c}
                                </CText>
                            </View>
                            <View style={commonStyle.flexDirectionRow}>
                                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_LOCATION}&nbsp;</CText>
                                <CText style={styles.assetNumStyle} numberOfLines={1}>
                                    {existingServiceLineItem.equip_site_desc__c}
                                </CText>
                            </View>
                        </View>
                        {request.status__c !== 'DRAFT' && (
                            <RequestLineItemBottomStatus item={existingServiceLineItem} />
                        )}
                    </View>
                </View>
            </View>
        )
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
                    customer_id__c: customerId,
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
        if (productsToProcess.length > 0) {
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
                    customer_id__c: customerId,
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
                    customer_id__c: customerId,
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
                        customer_id__c: request.customer_id__c,
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
                        FSV_COMM_RATE_T5__c: tempRequestLineItem.FSV_COMM_RATE_T5__c || null,
                        prev_equip_site_id__c: tempRequestLineItem.FSV_Line_Item__c
                            ? tempItemToExchange.asset_equip_site_id__c
                            : ''
                    }
                ]
                const [{ data }] = await syncUpObjUpdateFromMem('Request__c', requestEquipmentToUpdate)
                await syncUpObjUpdateFromMem('Request__c', [
                    {
                        Id: tempItemToExchange.Id,
                        equip_site_id__c: tempRequestLineItem.FSV_Line_Item__c
                            ? tempItemToExchange.asset_equip_site_id__c
                            : ''
                    }
                ])
                await syncAccessory(data[0].Id)
                await syncProduct(data[0].Id, data[0].Equip_type_cde__c)
            } else {
                const tempSurveyResponse = _.cloneDeep(surveyData[1])
                const question1 = tempSurveyResponse.questionList[0]
                const question2 = tempSurveyResponse.questionList[1]
                const moveType = getMoveTypeMapping()[request.equip_move_type_cde__c]
                question1?.Choices?.forEach((choice) => {
                    if (choice.Name === moveType) {
                        question1.Answer = [choice]
                    }
                })
                question2?.Choices?.forEach((choice) => {
                    if (choice.Name.toLowerCase() === tempRequestLineItem.equip_type_desc__c.toLowerCase()) {
                        question2.Answer = [choice]
                    }
                })
                const requestEquipmentToCreate = [
                    {
                        customer__c: request.customer__c,
                        customer_id__c: request.customer_id__c,
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
                        order_line_num__c: parseInt(tempItemToExchange.order_line_num__c) + 1,
                        ord_lne_rel_num__c: parseInt(tempItemToExchange.order_line_num__c),
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
                        FSV_COMM_RATE_T5__c: tempRequestLineItem.FSV_COMM_RATE_T5__c || null,
                        prev_equip_site_id__c: tempRequestLineItem.FSV_Line_Item__c
                            ? tempItemToExchange.asset_equip_site_id__c
                            : ''
                    }
                ]
                const [{ data }] = await syncUpObjCreateFromMem('Request__c', requestEquipmentToCreate)
                await syncUpObjUpdateFromMem('Request__c', [
                    {
                        Id: tempItemToExchange.Id,
                        equip_site_id__c: tempRequestLineItem.FSV_Line_Item__c
                            ? tempItemToExchange.asset_equip_site_id__c
                            : ''
                    }
                ])
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
            }
            setTempRequestLineItem(initServiceRequestLineItem())
            setTempItemToExchange(initServiceRequestLineItem())
            setTempType({})
            setTempEquipment({})
            closePopup()
            setRefreshTimes((v) => v + 1)
            setActivePart(2)
        } catch (e) {
            closePopup()
            await storeClassLog(Log.MOBILE_ERROR, 'confirmEquipment', 'Create new request: ' + getStringValue(e))
            openPopup(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_CREATE_REQUEST_FAILED}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }
    return (
        <View style={commonStyle.flex_1}>
            {!tempItemToExchange.Id && (
                <ScrollView>
                    <View style={styles.exchangeScrollView}>
                        <CText style={styles.textTransform}>
                            {existingServiceLineItems.length} {t.labels.PBNA_MOBILE_SELECTED_FOR} {serviceType}
                        </CText>
                    </View>

                    {existingServiceLineItems.map((existingServiceLineItem, k) => {
                        return (
                            <View key={existingServiceLineItem.Id}>
                                {renderExistingLineItem(existingServiceLineItem, k)}
                                {renderExchangeTile(existingServiceLineItem, k)}
                            </View>
                        )
                    })}
                </ScrollView>
            )}
            {tempItemToExchange.Id && (
                <View style={styles.itemToExchangeContainer}>
                    {renderExistingLineItem(tempItemToExchange)}
                    <View style={styles.exchangeWith}>
                        <CText>{t.labels.PBNA_MOBILE_EXCHANGE_WITH}</CText>
                    </View>
                    <EquipmentForm
                        customer={customer}
                        equipment={tempRequestLineItem}
                        overview={request}
                        setEquipment={setTempRequestLineItem}
                        activePart={activePart}
                        setActivePart={setActivePart}
                        accessories={accessories}
                        setAccessories={setAccessories}
                        editedAp={editedAp}
                        products={products}
                        setProducts={setProducts}
                        selectedEquipSetupId={selectedEquipSetupId}
                        setSelectedEquipSetupId={setSelectedEquipSetupId}
                        existingAccessoryRequests={existingAccessoryRequests}
                        existingProductRequests={existingProductRequests}
                        setRefreshTimes={setRefreshTimes}
                        setRefreshDp={setRefreshDp}
                        installRequestLineItems={installRequestLineItems}
                        equipmentList={equipmentList}
                        allInstallRequestLineItems={allInstallRequestLineItems}
                        confirmEquipment={confirmEquipment}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        cRef={equipmentFormRef}
                        exchangeMode
                        initType={tempType}
                        initEquipment={tempEquipment}
                        itemToExchange={tempItemToExchange}
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        distributionPointList={distributionPointList}
                        readonly={isPersonaCRMBusinessAdmin() || readonly}
                        l={''}
                        type={'RetailStore'}
                        updateGeneralEquipmentDetail={updateGeneralEquipmentDetail}
                        onClickSpecsBtn={onClickSpecs}
                    />
                </View>
            )}
            <EquipmentPdfModal cRef={equipmentPdfRef} />
        </View>
    )
}

export default ExchangeEquipmentForm
