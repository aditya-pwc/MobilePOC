/**
 * @description Equipment form for Step 2.
 * @author  Jack Niu
 * @date 2021-12-21
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { syncUpObjDelete } from '../../../../api/SyncUtils'
import EquipmentTypeListTile from './EquipmentTypeListTile'
import EquipmentBrandingListTile from './EquipmentBrandingListTile'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { SoupService } from '../../../../service/SoupService'
import { AdditionalEquipmentInformationForm } from './AdditionalEquipmentInformationForm'
import CText from '../../../../../common/components/CText'
import EquipmentBreadcrumbs from './EquipmentBreadcrumbs'
import {
    useCommissionStruct,
    useEquipmentBrandingList,
    useEquipmentSubTypeList,
    useEquipmentTypeList
} from '../../../../hooks/EquipmentHooks'
import _ from 'lodash'
import RequestLineItemBottomStatus from './RequestLineItemBottomStatus'
import { t } from '../../../../../common/i18n/t'
import { float2Integer, initInstallRequestLineItem } from '../../../../utils/EquipmentUtils'
import { isNullSpace } from '../../../manager/helper/MerchManagerHelper'
import AccessoriesAndProductsForm from './AccessoriesAndProductsForm'
import { addZeroes } from '../../../../utils/LeadUtils'
import { fetchRecommendedProducts } from '../../../../api/ApexApis'
import { Log } from '../../../../../common/enums/Log'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'
import SetUpCommission, { SetUpCommissionRef } from './SetUpCommission'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'
import { useAppSelector } from '../../../../redux/ReduxHooks'
import { downloadEquipmentPdf, getBaseEquipmentPdfPath } from '../../../../service/EquipmentPdfService'
import { exists } from 'react-native-fs'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface EquipmentFormProps {
    customer: any
    equipment: any
    setEquipment: any
    activePart: any
    setActivePart: any
    overview: any
    accessories: any
    setAccessories: any
    products: any
    setProducts: any
    editedAp
    selectedEquipSetupId: any
    setSelectedEquipSetupId: any
    existingAccessoryRequests
    existingProductRequests
    installRequestLineItems
    equipmentList
    setRefreshTimes
    setRefreshDp
    allInstallRequestLineItems
    confirmEquipment
    openPopup
    closePopup
    isAboveMaximum?: boolean
    cRef?
    exchangeMode?
    itemToExchange?
    initType?
    initEquipment?
    equipmentTypeCodeDesc: any
    distributionPointList?
    type: 'Lead' | 'RetailStore'
    l: any
    readonly?: boolean
    updateGeneralEquipmentDetail?: Function
    onClickSpecsBtn?: Function
}

const styles = StyleSheet.create({
    equipmentContent: {
        flex: 1,
        flexDirection: 'column'
    },
    typeContent: {
        marginTop: 20
    },
    brandingContent: {
        marginTop: 20,
        paddingBottom: 20
    },
    marginTop_26: {
        marginTop: 26
    },
    installRequestLineItemContainer: {
        minHeight: 105,
        width: '100%',
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        paddingHorizontal: 22,
        paddingVertical: 18,
        marginBottom: 3
    },
    imgContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgStyle: {
        height: 35,
        width: 27,
        resizeMode: 'contain'
    },
    descTextStyle: {
        fontWeight: '500',
        overflow: 'hidden',
        width: 275
    },
    descTextStyle2: {
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
    copyEquipmentContainer: {
        height: 10,
        width: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 10
    },
    alertContainer: {
        height: 10,
        width: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 10
    },
    removeText: {
        fontWeight: '500',
        color: '#EB445A'
    }
})

const EquipmentForm: FC<EquipmentFormProps> = (props: EquipmentFormProps) => {
    const {
        customer,
        equipment,
        setEquipment,
        activePart,
        setActivePart,
        accessories,
        setAccessories,
        editedAp,
        products,
        setProducts,
        selectedEquipSetupId,
        setSelectedEquipSetupId,
        existingAccessoryRequests,
        existingProductRequests,
        installRequestLineItems,
        setRefreshTimes,
        setRefreshDp,
        equipmentList,
        allInstallRequestLineItems,
        confirmEquipment,
        openPopup,
        closePopup,
        cRef,
        exchangeMode,
        itemToExchange,
        initType,
        initEquipment,
        overview,
        isAboveMaximum,
        equipmentTypeCodeDesc,
        distributionPointList = [],
        type,
        l,
        readonly = false,
        updateGeneralEquipmentDetail,
        onClickSpecsBtn
    } = props
    const busTypeCode = type === 'Lead' ? l.BUSN_SGMNTTN_LVL_1_NM_c__c : customer['Account.BUSN_SGMNTTN_LVL_1_CDV__c']
    const locationProductId = type === 'Lead' ? l.Location_ID_c__c : customer['Account.LOC_PROD_ID__c']
    // Below 4 are the items that the user selected.
    const [selectedType, setSelectedType] = useState('')
    const [selectedTypeCode, setSelectedTypeCode] = useState('')
    const [selectedSubType, setSelectedSubType] = useState('')
    const [selectedSubTypeCode, setSelectedSubTypeCode] = useState('')
    const [selectedBranding, setSelectedBranding] = useState('')
    const [pdfPath, setPdfPath] = useState('')
    // Below 3 is the list for the user to choose.
    const typeList = useEquipmentTypeList(customer['Account.PEPSI_COLA_NATNL_ACCT__c'] || '')
    const subTypeList = useEquipmentSubTypeList(
        selectedTypeCode,
        customer.LOC_PROD_ID__c || l.Location_ID_c__c,
        customer['Account.BUSN_SGMNTTN_LVL_1_CDV__c'] || l.BUSN_SGMNTTN_LVL_1_CDV_c__c
    )
    const brandingList = useEquipmentBrandingList(
        busTypeCode,
        locationProductId,
        selectedTypeCode,
        selectedSubTypeCode,
        type === 'Lead' ? 'Lead' : null
    )

    const [editMode, setEditMode] = useState(false)

    const accessoryFormRef = useRef(null)
    const imageLocalMap = useAppSelector((state) => state.customerReducer.equipmentSharePointReducer.equipmentPdfMap)
    const commissionRef = useRef<SetUpCommissionRef>(null)
    const commissionStruct = useCommissionStruct(itemToExchange?.assetId)

    const downLoadPdf = async (typeCode: string) => {
        const imageLocal = typeCode ? imageLocalMap[typeCode] : ''
        const basePath = await getBaseEquipmentPdfPath()
        if (imageLocal) {
            const localPath = `${basePath}${typeCode || ''}.pdf`
            const isExist = await exists(localPath)
            if (isExist) {
                setPdfPath(localPath)
            } else {
                downloadEquipmentPdf(imageLocal?.LinkFilename, localPath)
                    .then((res: any) => {
                        setPdfPath(res)
                    })
                    .catch((error: any) => {
                        setPdfPath('')
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'downloadEquipmentPdf',
                            `${CommonParam.userId} downloadEquipmentPdf failed: ${ErrorUtils.error2String(error)}`
                        )
                    })
            }
        }
    }
    useEffect(() => {
        if (activePart === 1) {
            setPdfPath('')
        }
    }, [activePart])
    const handleClickType = (item) => {
        setSelectedType(item.equip_type_desc__c)
        setSelectedTypeCode(item.equip_type_cde__c)
        downLoadPdf(item.equip_type_cde__c)
        setEquipment({
            ...equipment,
            Equip_type_cde__c: item.equip_type_cde__c,
            equip_type_desc__c: item.equip_type_desc__c
        })
        setActivePart(2)
    }

    const handleClickSubType = (item) => {
        setSelectedSubType(item.equip_styp_desc__c)
        setSelectedSubTypeCode(item.equip_styp_cde__c)
        setEquipment({
            ...equipment,
            Equip_styp_cde__c: item.equip_styp_cde__c,
            equip_styp_desc__c: item.equip_styp_desc__c
        })
        setActivePart(3)
    }
    const onClickEquipment = async (item) => {
        setSelectedEquipSetupId(item.std_equip_setup_id__c)
        setSelectedBranding(item.Description)
        setEquipment({
            ...equipment,
            Equip_type_cde__c: selectedTypeCode,
            equip_type_desc__c: selectedType,
            Equip_styp_cde__c: selectedSubTypeCode,
            equip_styp_desc__c: selectedSubType,
            std_setup_equip_id__c: item.std_equip_setup_id__c,
            equip_grphc_id__c: item.equip_grphc_id__c,
            equip_config_type_cde__c: item.equip_config_type_cde__c,
            display_in_service_tab__c: false,
            display_in_asset_tab__c: true,
            request_subtype__c: 'Move Request Line Item',
            equip_setup_desc__c: item.Description,
            Sls_plan_cde__c: itemToExchange?.Sls_plan_cde__c ? itemToExchange?.Sls_plan_cde__c : null,
            Serv_ctrct_id__c: itemToExchange?.Serv_ctrct_id__c ? itemToExchange?.Serv_ctrct_id__c : null,
            equip_site_desc__c: itemToExchange?.equip_site_desc__c ? itemToExchange?.equip_site_desc__c : null,
            Mnth_pymt_amt__c: itemToExchange?.Mnth_pymt_amt__c
                ? _.round(itemToExchange?.Mnth_pymt_amt__c, 2).toString()
                : null,
            prev_equip_site_id__c: itemToExchange?.equip_site_id__c
        })
        setProducts([])
        setAccessories([])
        setEditMode(false)
        editedAp.current = false
        setActivePart(4)
    }

    const calculateAndSetAccessoriesAndProducts = (
        accessoriesRequests,
        productsRequests,
        originalRecommendedProduct
    ) => {
        if (accessoriesRequests.length > 0) {
            setAccessories(accessoriesRequests.map((accessory) => accessory.std_attr_cde__c))
        } else {
            setAccessories([])
        }
        if (productsRequests.length > 0) {
            const tempRecommendedProducts = []
            for (const existingProductRequest of productsRequests) {
                let isRecommended = false
                for (const recommendedProduct of originalRecommendedProduct) {
                    if (existingProductRequest.inven_id__c === recommendedProduct.inven_id__c) {
                        isRecommended = true
                    }
                }
                if (isRecommended) {
                    tempRecommendedProducts.push({
                        Material_UOM_Identifier__c: existingProductRequest.inven_id__c,
                        Name: existingProductRequest.inven_label__c,
                        slct_num__c: existingProductRequest.slct_num__c,
                        inven_id__c: existingProductRequest.inven_id__c,
                        FSV_UNIT_T1__c: float2Integer(existingProductRequest.FSV_UNIT_T1__c),
                        FSV_COMM_RATE_T1__c: addZeroes(existingProductRequest.FSV_COMM_RATE_T1__c),
                        equip_mech_rte_amt__c: addZeroes(existingProductRequest.equip_mech_rte_amt__c + '')
                    })
                } else {
                    tempRecommendedProducts.push({
                        Material_UOM_Identifier__c: existingProductRequest.inven_id__c,
                        Name: existingProductRequest.inven_label__c,
                        slct_num__c: existingProductRequest.slct_num__c,
                        FSV_UNIT_T1__c: float2Integer(existingProductRequest.FSV_UNIT_T1__c),
                        FSV_COMM_RATE_T1__c: addZeroes(existingProductRequest.FSV_COMM_RATE_T1__c),
                        equip_mech_rte_amt__c: addZeroes(existingProductRequest.equip_mech_rte_amt__c + '')
                    })
                }
            }
            setProducts(tempRecommendedProducts)
        } else {
            setProducts([])
        }
    }

    const handleEditEquipment = async (item) => {
        setEquipment(item)
        setSelectedType(item.equip_type_desc__c)
        setSelectedSubType(item.equip_styp_desc__c)
        setSelectedTypeCode(item.Equip_type_cde__c)
        downLoadPdf(item.Equip_type_cde__c)
        setSelectedSubTypeCode(item.Equip_styp_cde__c)
        setSelectedBranding(item.equip_setup_desc__c)
        setSelectedEquipSetupId(item.std_setup_equip_id__c)
        setEditMode(true)

        const originalRecommendedProductRes = await fetchRecommendedProducts(selectedEquipSetupId)
        const originalRecommendedProduct = originalRecommendedProductRes.data

        const accessoriesRequests = await SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            ['Id', 'std_attr_cde__c'],
            'SELECT {Request__c:Id},{Request__c:std_attr_cde__c},{Request__c:_soupEntryId} FROM {Request__c}' +
                ` WHERE {Request__c:parent_request_record__c}='${item.Id}' ` +
                "AND {Request__c:request_subtype__c}='Move Request Accessory'"
        )
        const productsRequests = await SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            [
                'Id',
                'inven_id__c',
                'inven_label__c',
                'equip_mech_rte_amt__c',
                'slct_num__c',
                'FSV_UNIT_T1__c',
                'FSV_COMM_RATE_T1__c'
            ],
            '' +
                'SELECT {Request__c:Id},{Request__c:inven_id__c},{Request__c:inven_label__c},' +
                '{Request__c:equip_mech_rte_amt__c},{Request__c:slct_num__c},{Request__c:FSV_UNIT_T1__c},{Request__c:FSV_COMM_RATE_T1__c},{Request__c:_soupEntryId} FROM {Request__c} ' +
                `WHERE {Request__c:parent_request_record__c}='${item.Id}' ` +
                "AND {Request__c:request_subtype__c}='Move Request Product' ORDER BY CAST({Request__c:slct_num__c} as INTEGER)"
        )
        calculateAndSetAccessoriesAndProducts(accessoriesRequests, productsRequests, originalRecommendedProduct)
        setActivePart(4)
    }

    const handleCopyEquipment = async (originItem) => {
        const item = _.cloneDeep(originItem)
        // Clean the store location.
        item.equip_site_desc__c = null
        item.Id = null
        setEquipment(item)
        setSelectedType(item.equip_type_desc__c)
        setSelectedSubType(item.equip_styp_desc__c)
        downLoadPdf(item.Equip_type_cde__c)
        setSelectedTypeCode(item.Equip_type_cde__c)
        setSelectedSubTypeCode(item.Equip_styp_cde__c)
        setSelectedBranding(item.equip_setup_desc__c)
        setSelectedEquipSetupId(item.std_setup_equip_id__c)

        const originalRecommendedProductRes = await fetchRecommendedProducts(selectedEquipSetupId)
        const originalRecommendedProduct = originalRecommendedProductRes.data

        const accessoriesRequests = await SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            ['Id', 'std_attr_cde__c'],
            'SELECT {Request__c:Id},{Request__c:std_attr_cde__c},{Request__c:_soupEntryId} FROM {Request__c}' +
                ` WHERE {Request__c:parent_request_record__c}='${originItem.Id}' ` +
                "AND {Request__c:request_subtype__c}='Move Request Accessory'"
        )
        const productsRequests = await SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            [
                'Id',
                'inven_id__c',
                'inven_label__c',
                'equip_mech_rte_amt__c',
                'slct_num__c',
                'FSV_UNIT_T1__c',
                'FSV_COMM_RATE_T1__c'
            ],
            '' +
                'SELECT {Request__c:Id},{Request__c:inven_id__c},{Request__c:inven_label__c},' +
                '{Request__c:equip_mech_rte_amt__c},{Request__c:slct_num__c},{Request__c:FSV_UNIT_T1__c},{Request__c:FSV_COMM_RATE_T1__c},{Request__c:_soupEntryId} FROM {Request__c} ' +
                `WHERE {Request__c:parent_request_record__c}='${originItem.Id}' ` +
                "AND {Request__c:request_subtype__c}='Move Request Product' ORDER BY CAST({Request__c:slct_num__c} as INTEGER)"
        )
        calculateAndSetAccessoriesAndProducts(accessoriesRequests, productsRequests, originalRecommendedProduct)
        setEditMode(false)
        setActivePart(5)
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} copies an equipment`, 1)
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
                'EquipmentForm: handleDeleteEquipment',
                'HandleDeleteEquipment error: ' + getStringValue(e)
            )
        } finally {
            if (exchangeMode && !_.isEmpty(initEquipment)) {
                setEquipment({
                    Equip_type_cde__c: initEquipment.Equip_type_cde__c,
                    equip_type_desc__c: initEquipment.equip_type_desc__c,
                    Equip_styp_cde__c: initEquipment.Equip_styp_cde__c,
                    equip_styp_desc__c: initEquipment.equip_styp_desc__c
                })
            } else {
                setEquipment(initInstallRequestLineItem())
            }
            setRefreshTimes((v) => v + 1)
            closePopup()
        }
    }
    const handleDefaultExchangeEquipment = (item) => {
        setEquipment({
            ...equipment,
            Rate_Type__c: item?.Rate_Type__c,
            Contract_Type__c: item?.Contract_Type__c,
            Supplier__c: item?.Supplier__c,
            'Supplier__r.supplier_no__c': item?.Supplier_no__c,
            'Supplier__r.supplier_name__c': item?.Supplier_name__c,
            FSV_Line_Item__c: item?.FSV_Line_Item__c,
            Commission_Basis__c: item?.Commission_Basis__c,
            Commission_Basis_CDE__c: item?.Commission_Basis__c,
            FSV_UNIT_T1__c: item?.CommissionRate[0]?.FSVUnit || null,
            FSV_COMM_RATE_T1__c: item?.CommissionRate[0]?.FSVRate || null,
            FSV_UNIT_T2__c: item?.CommissionRate[1]?.FSVUnit || null,
            FSV_COMM_RATE_T2__c: item?.CommissionRate[1]?.FSVRate || null,
            FSV_UNIT_T3__c: item?.CommissionRate[2]?.FSVUnit || null,
            FSV_COMM_RATE_T3__c: item?.CommissionRate[2]?.FSVRate || null,
            FSV_UNIT_T4__c: item?.CommissionRate[3]?.FSVUnit || null,
            FSV_COMM_RATE_T4__c: item?.CommissionRate[3]?.FSVRate || null,
            FSV_UNIT_T5__c: item?.CommissionRate[4]?.FSVUnit || null,
            FSV_COMM_RATE_T5__c: item?.CommissionRate[4]?.FSVRate || null
        })
    }

    useImperativeHandle(cRef, () => ({
        setType: (item) => {
            handleClickType(item)
        },
        enterEdit: (item) => {
            handleEditEquipment(item)
        },
        deleteEquipment: (item) => {
            handleDeleteEquipment(item)
        }
    }))

    useEffect(() => {
        if (exchangeMode && !_.isEmpty(initType)) {
            handleClickType(initType)
        }
    }, [initType])

    useEffect(() => {
        if (exchangeMode && !_.isEmpty(initEquipment)) {
            handleEditEquipment(initEquipment)
        }
    }, [initEquipment])

    useEffect(() => {
        if (existingAccessoryRequests.length > 0) {
            setAccessories(existingAccessoryRequests.map((accessory) => accessory.std_attr_cde__c))
        } else {
            setAccessories([])
        }
    }, [existingAccessoryRequests])

    useEffect(() => {
        if (
            exchangeMode &&
            !editMode &&
            (itemToExchange?.Sls_plan_cde__c === 'FSV' || itemToExchange?.Sls_plan_cde__c === 'FSR') &&
            activePart === 4
        ) {
            const commissionRateList = commissionStruct?.assetConfig || commissionStruct?.equipmentSupplier || []
            const calcMethodCodeMap = {
                '000': 'No Commission',
                '001': 'Quantity',
                '002': 'Revenue'
            }
            const calcMethCode = commissionStruct?.calcMethod || ''
            const tempCommissionRateList = []
            const isSameSubType = _.isEqual(itemToExchange?.equip_styp_cde__c, selectedSubTypeCode)
            const contractType = commissionStruct?.calcMethod ? calcMethodCodeMap[calcMethCode] : null
            const commissionBasis =
                isSameSubType && !_.isEmpty(commissionStruct?.rateType) && !_.isEqual(calcMethCode, '002')
                    ? 'Flat'
                    : null
            const commissionRateLimit = equipment.Contract_Type__c === 'Revenue' ? 4 : 2
            const toFixedNum = calcMethCode === '001' ? 0 : 2

            commissionRateList.forEach((v, k) => {
                if (commissionStruct?.rateType === 'Tier') {
                    tempCommissionRateList.push({
                        FSVUnit: isSameSubType ? addZeroes(v?.rangeHighAmount, 9, toFixedNum, true) : null,
                        FSVRate: isSameSubType ? addZeroes(v?.tierRate, 9, commissionRateLimit, true) : null
                    })
                } else if (commissionStruct.rateType === 'Variable by Product') {
                    tempCommissionRateList.push({
                        FSVUnit: null,
                        FSVRate:
                            isSameSubType && k === 0
                                ? addZeroes(v?.fsvInvenCommissionRate, 9, commissionRateLimit, true)
                                : null
                    })
                } else if (commissionStruct.rateType === 'Flat at Asset') {
                    tempCommissionRateList.push({
                        FSVUnit: null,
                        FSVRate:
                            isSameSubType && k === 0 ? addZeroes(v?.tier_rate__c, 9, commissionRateLimit, true) : null
                    })
                }
            })
            const defaultExchangeEquipmentItem = {
                CommissionRate: tempCommissionRateList,
                Rate_Type__c: isSameSubType ? commissionStruct?.rateType : null,
                Contract_Type__c: isSameSubType ? contractType : null,
                Supplier__c: commissionStruct?.assetAttributeId || '',
                Supplier_no__c: commissionStruct?.supplierId || '',
                Supplier_name__c: commissionStruct?.supplierName || '',
                Commission_Basis__c: commissionBasis,
                Commission_Basis_CDE__c: commissionBasis,
                FSV_Line_Item__c: itemToExchange?.Equip_type_cde__c === 'VEN' || false
            }

            handleDefaultExchangeEquipment(defaultExchangeEquipmentItem)
        }
    }, [editMode, commissionStruct, selectedSubTypeCode, activePart, equipment?.Contract_Type__c])
    const handleReselectEquipment = async () => {
        if (equipment.Id) {
            try {
                await handleDeleteEquipment(equipment)
                openPopup(
                    <ProcessDoneModal type={'success'}>
                        <PopMessage>
                            {t.labels.PBNA_MOBILE_THE_EQUIPMENT}&nbsp;{equipment.equip_setup_desc__c}&nbsp;
                            {t.labels.PBNA_MOBILE_IS_DELETED}
                        </PopMessage>
                    </ProcessDoneModal>
                )
                setTimeout(() => {
                    closePopup()
                }, 3000)
            } catch (e) {
                openPopup(
                    <ProcessDoneModal type={'failed'}>
                        <PopMessage>
                            {t.labels.PBNA_MOBILE_THE_EQUIPMENT}&nbsp;{equipment.equip_setup_desc__c}&nbsp;
                            {t.labels.PBNA_MOBILE_IS_NOT_DELETED}
                        </PopMessage>
                    </ProcessDoneModal>,
                    t.labels.PBNA_MOBILE_OK
                )
            }
        } else {
            openPopup()
            if (exchangeMode && !_.isEmpty(initEquipment)) {
                setEquipment({
                    Equip_type_cde__c: initEquipment.Equip_type_cde__c,
                    equip_type_desc__c: initEquipment.equip_type_desc__c,
                    Equip_styp_cde__c: initEquipment.Equip_styp_cde__c,
                    equip_styp_desc__c: initEquipment.equip_styp_desc__c
                })
            } else {
                setEquipment(initInstallRequestLineItem())
            }
            setRefreshTimes((v) => v + 1)
            closePopup()
        }
    }

    const renderInstallLineItemRequestList = () => {
        if (exchangeMode) {
            return <View />
        }
        return (
            <View style={{ marginTop: 10 }}>
                {installRequestLineItems.map((item, index) => {
                    const indexKey = index.toString()
                    return (
                        <TouchableOpacity
                            key={indexKey}
                            style={styles.installRequestLineItemContainer}
                            disabled={
                                !(
                                    overview.status__c !== 'DRAFT' &&
                                    (overview.equip_move_type_cde__c === 'EXI' ||
                                        overview.equip_move_type_cde__c === 'INS')
                                )
                            }
                            onPress={() => {
                                handleEditEquipment(item)
                            }}
                        >
                            <View>
                                <View style={styles.imgContainer}>
                                    <EquipmentImageDisplay
                                        subtypeCde={item.std_setup_equip_id__c}
                                        imageStyle={styles.imgStyle}
                                        filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_BRANDING_URL}
                                        equipTypeDesc={equipmentTypeCodeDesc[item.Equip_type_cde__c]}
                                    />
                                </View>
                            </View>
                            <View
                                style={{
                                    marginLeft: 20
                                }}
                            >
                                <CText style={styles.descTextStyle} numberOfLines={1}>
                                    {item.equip_setup_desc__c}
                                </CText>
                                {overview.status__c === 'DRAFT' && item.copyCount !== null && (
                                    <CText>
                                        Copy Count: <CText style={{ fontWeight: '500' }}>{item.copyCount}</CText>
                                    </CText>
                                )}
                                {item.equip_site_desc__c && (
                                    <View style={commonStyle.flexDirectionRow}>
                                        <CText style={{ color: 'gray' }}>{t.labels.PBNA_MOBILE_LOCATION}&nbsp;</CText>
                                        <CText style={styles.descTextStyle2} numberOfLines={1}>
                                            {item.equip_site_desc__c}
                                        </CText>
                                    </View>
                                )}
                                {overview.status__c === 'DRAFT' && !readonly && (
                                    <View style={styles.editEquipmentContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleEditEquipment(item)
                                            }}
                                        >
                                            <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT}</CText>
                                        </TouchableOpacity>
                                        <View style={styles.copyEquipmentContainer} />
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleCopyEquipment(item)
                                            }}
                                            disabled={isAboveMaximum}
                                        >
                                            <CText
                                                style={{
                                                    fontWeight: '500',
                                                    color: isAboveMaximum ? '#565656' : '#00A2D9'
                                                }}
                                            >
                                                {t.labels.PBNA_MOBILE_COPY.toUpperCase()}
                                            </CText>
                                        </TouchableOpacity>
                                        <View style={styles.alertContainer} />
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
                                                                handleDeleteEquipment(item)
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
                                {overview.status__c !== 'DRAFT' && <RequestLineItemBottomStatus item={item} />}
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    const renderTypeItem = ({ item }) => {
        return <EquipmentTypeListTile item={item} onClick={() => handleClickType(item)} isSubType={false} />
    }
    const renderSubTypeItem = ({ item }) => {
        return (
            <EquipmentTypeListTile
                item={item}
                onClick={() => handleClickSubType(item)}
                isSubType
                selectedType={selectedType}
            />
        )
    }
    const renderTypes = () => {
        if (!isAboveMaximum) {
            return (
                <View style={{ marginBottom: 30 }}>
                    <FlatList
                        data={typeList}
                        renderItem={renderTypeItem}
                        keyExtractor={(item) => item.Id}
                        ListHeaderComponent={() => {
                            return (
                                <View>
                                    {renderInstallLineItemRequestList()}
                                    <EquipmentBreadcrumbs
                                        activePart={activePart}
                                        selectedType={selectedType}
                                        selectedSubType={selectedSubType}
                                        selectedBranding={selectedBranding}
                                        setActivePart={setActivePart}
                                        handleReselectEquipment={handleReselectEquipment}
                                        exchangeMode={exchangeMode}
                                    />
                                </View>
                            )
                        }}
                    />
                </View>
            )
        }

        return <ScrollView style={commonStyle.flex_1}>{renderInstallLineItemRequestList()}</ScrollView>
    }
    const renderSubTypes = () => {
        return (
            <View style={[commonStyle.flex_1]}>
                <EquipmentBreadcrumbs
                    activePart={activePart}
                    selectedType={selectedType}
                    selectedSubType={selectedSubType}
                    selectedBranding={selectedBranding}
                    setActivePart={setActivePart}
                    handleReselectEquipment={handleReselectEquipment}
                    exchangeMode={exchangeMode}
                />
                <FlatList
                    style={styles.marginTop_26}
                    data={subTypeList}
                    renderItem={renderSubTypeItem}
                    keyExtractor={(item) => item.Id}
                />
            </View>
        )
    }

    const renderBrandingItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    await onClickEquipment(item)
                }}
            >
                <EquipmentBrandingListTile
                    item={item}
                    selectedType={selectedType}
                    pdfPath={pdfPath}
                    onClickSpecs={() => {
                        onClickSpecsBtn && onClickSpecsBtn(pdfPath)
                    }}
                />
            </TouchableOpacity>
        )
    }
    const renderBrandings = () => {
        return (
            <View style={[commonStyle.flex_1]}>
                <EquipmentBreadcrumbs
                    activePart={activePart}
                    selectedType={selectedType}
                    selectedSubType={selectedSubType}
                    selectedBranding={selectedBranding}
                    setActivePart={setActivePart}
                    handleReselectEquipment={handleReselectEquipment}
                    exchangeMode={exchangeMode}
                />
                <FlatList
                    style={styles.marginTop_26}
                    data={brandingList}
                    renderItem={renderBrandingItem}
                    keyExtractor={(item) => item.Id}
                />
            </View>
        )
    }
    const renderAccessoryAndProductForm = () => {
        return (
            <View style={styles.equipmentContent}>
                <EquipmentBreadcrumbs
                    activePart={activePart}
                    selectedType={selectedType}
                    selectedSubType={selectedSubType}
                    selectedBranding={selectedBranding}
                    setActivePart={setActivePart}
                    handleReselectEquipment={handleReselectEquipment}
                    exchangeMode={exchangeMode}
                    readonly={overview.status__c !== 'DRAFT' || readonly}
                />
                <AccessoriesAndProductsForm
                    cRef={accessoryFormRef}
                    selectedEquipSetupId={selectedEquipSetupId}
                    selectedSubTypeCode={selectedSubTypeCode}
                    selectedTypeCode={selectedTypeCode}
                    equipment={{ ...equipment, ...{ equip_move_type_cde__c: overview.equip_move_type_cde__c } }}
                    setEquipment={setEquipment}
                    accessories={accessories}
                    setAccessories={setAccessories}
                    products={products}
                    setProducts={setProducts}
                    editedAp={editedAp}
                    existingAccessoryRequests={existingAccessoryRequests}
                    existingProductRequests={existingProductRequests}
                    editMode={editMode}
                    customer={customer}
                    confirmAddOns={() => {
                        setActivePart(6)
                        editedAp.current = true
                    }}
                    distributionPointList={distributionPointList}
                    setRefreshDp={setRefreshDp}
                    readonly={overview.status__c !== 'DRAFT' || readonly}
                    type={type}
                    l={l}
                    itemToExchange={itemToExchange}
                    commissionStruct={commissionStruct}
                />
            </View>
        )
    }
    const renderAdditionalEquipmentInformationForm = () => {
        return (
            <View style={commonStyle.flex_1}>
                <EquipmentBreadcrumbs
                    activePart={activePart}
                    selectedType={selectedType}
                    selectedSubType={selectedSubType}
                    selectedBranding={selectedBranding}
                    setActivePart={setActivePart}
                    handleReselectEquipment={handleReselectEquipment}
                    exchangeMode={exchangeMode}
                    equipment={equipment}
                    readonly={overview.status__c !== 'DRAFT' || readonly}
                />
                <AdditionalEquipmentInformationForm
                    equipment={equipment}
                    setActivePart={setActivePart}
                    setEquipment={setEquipment}
                    installRequestLineItems={installRequestLineItems}
                    allInstallRequestLineItems={allInstallRequestLineItems}
                    equipmentList={equipmentList}
                    setRefreshTimes={setRefreshTimes}
                    confirmEquipment={confirmEquipment}
                    exchangeMode={exchangeMode}
                    retailStore={customer}
                    itemToExchange={itemToExchange}
                    openPopup={openPopup}
                    closePopup={closePopup}
                    readonly={overview.status__c !== 'DRAFT' || readonly}
                />
            </View>
        )
    }

    const renderCommissionForm = () => {
        return (
            <View style={commonStyle.flex_1}>
                <EquipmentBreadcrumbs
                    activePart={activePart}
                    selectedType={selectedType}
                    selectedSubType={selectedSubType}
                    selectedBranding={selectedBranding}
                    setActivePart={setActivePart}
                    handleReselectEquipment={handleReselectEquipment}
                    exchangeMode={exchangeMode}
                    readonly={overview.status__c !== 'DRAFT'}
                    handleBackToEquipmentDetails={() => {
                        commissionRef?.current?.processCommissionRate()
                    }}
                />
                <SetUpCommission
                    equipment={equipment}
                    setEquipment={setEquipment}
                    setUpCommission={() => {
                        setActivePart(5)
                    }}
                    products={products}
                    setProducts={setProducts}
                    readonly={overview.status__c !== 'DRAFT' || readonly}
                    cRef={commissionRef}
                />
            </View>
        )
    }

    const renderPage = () => {
        if (overview.status__c === 'DRAFT' && !readonly) {
            switch (activePart) {
                case 1:
                    return renderTypes()
                case 2:
                    return renderSubTypes()
                case 3:
                    return renderBrandings()
                case 4:
                    return renderAccessoryAndProductForm()
                case 5:
                    return renderAdditionalEquipmentInformationForm()
                case 6:
                    return renderCommissionForm()
                default:
                    break
            }
        } else {
            switch (activePart) {
                case 4:
                    return renderAccessoryAndProductForm()
                case 5:
                    return renderAdditionalEquipmentInformationForm()
                case 6:
                    return renderCommissionForm()
                default:
                    return <ScrollView style={commonStyle.flex_1}>{renderInstallLineItemRequestList()}</ScrollView>
            }
        }
    }
    return renderPage()
}
export default EquipmentForm
