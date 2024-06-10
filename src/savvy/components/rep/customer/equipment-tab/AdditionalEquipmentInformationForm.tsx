import React, { FC, useEffect, useRef } from 'react'
import CText from '../../../../../common/components/CText'
import { Alert, View, StyleSheet } from 'react-native'
import PickerTile from '../../lead/common/PickerTile'
import {
    useDisableEquipmentAdditionalInformationConfirmButton,
    useSalesPlanNamePicklist,
    useServiceNameContractPicklist,
    useShowDuplicateInStoreLocationErrorMessage
} from '../../../../hooks/EquipmentHooks'
import LeadInput from '../../lead/common/LeadInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ConfirmButton from '../../../common/ConfirmButton'
import { syncUpObjDelete } from '../../../../api/SyncUtils'
import DeleteButton from '../../../common/DeleteButton'
import _ from 'lodash'
import { SoupService } from '../../../../service/SoupService'
import SearchablePicklist from '../../lead/common/SearchablePicklist'
import { t } from '../../../../../common/i18n/t'
import { isNullSpace } from '../../../manager/helper/MerchManagerHelper'
import { initInstallRequestLineItem } from '../../../../utils/EquipmentUtils'
import { Log } from '../../../../../common/enums/Log'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'

interface AdditionalEquipmentInformationFormProps {
    equipment: any
    setEquipment: any
    setActivePart: any
    installRequestLineItems
    equipmentList
    allInstallRequestLineItems
    setRefreshTimes
    confirmEquipment
    exchangeMode
    retailStore
    itemToExchange
    openPopup
    closePopup
    readonly: boolean
}

const EXTRA_HEIGHT = -20

const styles = StyleSheet.create({
    confirmButtonView: {
        paddingBottom: 20
    },
    scrollViewContainer: {
        paddingHorizontal: 22,
        marginTop: 36,
        marginBottom: 36
    },
    textStyle: {
        fontSize: 18,
        fontWeight: '900',
        paddingBottom: 25
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    }
})

export const AdditionalEquipmentInformationForm: FC<AdditionalEquipmentInformationFormProps> = (
    props: AdditionalEquipmentInformationFormProps
) => {
    const {
        equipment,
        setActivePart,
        setEquipment,
        // installRequestLineItems,
        equipmentList,
        allInstallRequestLineItems,
        setRefreshTimes,
        confirmEquipment,
        exchangeMode,
        retailStore,
        itemToExchange,
        openPopup,
        closePopup,
        readonly
    } = props
    const { salesPlanNamePicklist, salesPlanNamePicklistObject } = useSalesPlanNamePicklist(
        false,
        equipment?.FSV_Line_Item__c
    )
    const { serviceNameContractPicklist, serviceNameContractPicklistObject } =
        useServiceNameContractPicklist(retailStore)
    const showDuplicateInStoreLocationErrorMessage = useShowDuplicateInStoreLocationErrorMessage(
        allInstallRequestLineItems,
        equipmentList,
        equipment.equip_site_desc__c,
        equipment.Id,
        itemToExchange
    )
    const disableEquipmentConfirmButton = useDisableEquipmentAdditionalInformationConfirmButton(
        showDuplicateInStoreLocationErrorMessage,
        equipment,
        salesPlanNamePicklistObject
    )
    const salesPlanNamePickTileRef = useRef(null)
    const serviceNameContractPickTileRef = useRef(null)
    const handlePressConfirm = async () => {
        confirmEquipment()
    }
    const handlePressDelete = async () => {
        try {
            openPopup()
            const res = await SoupService.retrieveDataFromSoup(
                'Request__c',
                {},
                ['Id'],
                'SELECT {Request__c:Id},{Request__c:_soupEntryId} FROM {Request__c} ' +
                    "WHERE ({Request__c:request_subtype__c}='Move Request Product' " +
                    "OR {Request__c:request_subtype__c}='Move Request Accessory') AND " +
                    `{Request__c:parent_request_record__c}='${equipment.Id}'`
            )
            const requestToDelete = [
                ...res,
                {
                    Id: equipment.Id,
                    _soupEntryId: equipment._soupEntryId
                }
            ]
            await syncUpObjDelete(requestToDelete.map((v) => v.Id))
            await SoupService.removeRecordFromSoup(
                'Request__c',
                requestToDelete.map((v) => v._soupEntryId + '')
            )
        } catch (e) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'AdditionalEquipmentInformationForm: handlePressDelete',
                'Information Form delete error: ' + getStringValue(e)
            )
        } finally {
            setActivePart(exchangeMode ? 2 : 1)
            setEquipment(initInstallRequestLineItem())
            setRefreshTimes((v) => v + 1)
            closePopup()
        }
    }
    const getNameByCode = (code, picklistObj) => {
        let name = ''
        _.forEach(picklistObj, (v, k) => {
            if (v === code) {
                name = k
            }
        })
        return name
    }
    const initPicklistValue = (value, picklistObj) => {
        if (value) {
            return getNameByCode(value, picklistObj)
        }
        return t.labels.PBNA_MOBILE_SELECT
    }
    useEffect(() => {
        if (!(_.isEmpty(salesPlanNamePicklistObject) && _.isEmpty(serviceNameContractPicklistObject))) {
            salesPlanNamePickTileRef.current?.setValue(
                initPicklistValue(equipment.Sls_plan_cde__c, salesPlanNamePicklistObject)
            )
            serviceNameContractPickTileRef.current?.setValue(
                getNameByCode(equipment.Serv_ctrct_id__c, serviceNameContractPicklistObject) ||
                    t.labels.PBNA_MOBILE_PEPSI_FREE
            )
        }
    }, [salesPlanNamePicklistObject, serviceNameContractPicklistObject])

    useEffect(() => {
        if (!equipment.Serv_ctrct_id__c) {
            setEquipment({
                ...equipment,
                Serv_ctrct_id__c: '2'
            })
        }
    }, [equipment.Serv_ctrct_id__c])

    // const setServiceContractValue

    return (
        <KeyboardAwareScrollView extraScrollHeight={EXTRA_HEIGHT}>
            <View style={styles.scrollViewContainer}>
                <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_ADDITIONAL_INFORMATION}</CText>
                {readonly ? (
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_SALES_PLAN}
                        trackedValue={initPicklistValue(equipment.Sls_plan_cde__c, salesPlanNamePicklistObject)}
                        disabled
                    />
                ) : (
                    <PickerTile
                        data={[
                            t.labels.PBNA_MOBILE_SELECT_SALES_PLAN,
                            ...salesPlanNamePicklist.map((v) => {
                                return v.Sls_plan_desc__c
                            })
                        ]}
                        label={t.labels.PBNA_MOBILE_SALES_PLAN}
                        labelStyle={styles.labelStyle}
                        borderStyle={commonStyle.pickTileBorderStyle}
                        title={t.labels.PBNA_MOBILE_SALES_PLAN}
                        disabled={false}
                        defValue={initPicklistValue(equipment.Sls_plan_cde__c, salesPlanNamePicklistObject)}
                        // defValue={salesPlanNamePicklistObject[equipment.Sls_plan_cde__c]}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        required
                        noPaddingHorizontal
                        containerStyle={{ marginBottom: 20 }}
                        onChange={(v) => {
                            setEquipment({
                                ...equipment,
                                Sls_plan_cde__c: salesPlanNamePicklistObject[v],
                                Mnth_pymt_amt__c:
                                    salesPlanNamePicklistObject[v] === 'FSR' || salesPlanNamePicklistObject[v] === 'REN'
                                        ? equipment.Mnth_pymt_amt__c
                                        : null
                            })
                        }}
                        cRef={salesPlanNamePickTileRef}
                    />
                )}
                {(equipment.Sls_plan_cde__c === 'FSR' || equipment.Sls_plan_cde__c === 'REN') && (
                    <LeadInput
                        fieldName={t.labels.PBNA_MOBILE_MONTHLY_PAYMENT_AMOUNT_DOLLARS}
                        initValue={equipment.Mnth_pymt_amt__c}
                        onChangeText={(v) => {
                            setEquipment({
                                ...equipment,
                                Mnth_pymt_amt__c: v
                            })
                        }}
                        placeholder={t.labels.PBNA_MOBILE_ENTER_AMOUNT}
                        number
                        currency
                        disabled={readonly}
                    />
                )}

                <SearchablePicklist
                    label={t.labels.PBNA_MOBILE_SERVICE_CONTRACT}
                    data={serviceNameContractPicklist.map((v) => {
                        return v.serv_ctrct_nme__c
                    })}
                    showValue={(v) => {
                        return v
                    }}
                    // defValue={'Pepsi Free'}
                    onApply={(v) => {
                        setEquipment({
                            ...equipment,
                            Serv_ctrct_id__c: serviceNameContractPicklistObject[v]
                        })
                    }}
                    cRef={serviceNameContractPickTileRef}
                    search
                    disabled={readonly}
                />

                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_IN_STORE_LOCATION}
                    initValue={equipment.equip_site_desc__c}
                    onChangeText={(v) => {
                        setEquipment({
                            ...equipment,
                            equip_site_desc__c: v
                        })
                    }}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_UNIQUE_LOCATION}
                    maxLength={255}
                    customErrorMessage={
                        showDuplicateInStoreLocationErrorMessage
                            ? t.labels.PBNA_MOBILE_UNIQUE_LOCATION_REQUIREDE
                            : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)
                    }
                    disabled={readonly}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_ASSET_PREP_INSTRUCTIONS}
                    initValue={equipment.comments__c}
                    onChangeText={(v) => {
                        setEquipment({
                            ...equipment,
                            comments__c: v
                        })
                    }}
                    placeholder={t.labels.PBNA_MOBILE_COMMENTS_ABOUT_THE_LOCATION}
                    maxLength={235}
                    multiline
                    disabled={readonly}
                />
                {!readonly && (
                    <View style={styles.confirmButtonView}>
                        <ConfirmButton
                            label={t.labels.PBNA_MOBILE_CONFIRM_EQUIPMENT}
                            handlePress={handlePressConfirm}
                            disabled={disableEquipmentConfirmButton}
                        />
                    </View>
                )}
                {equipment.Id && !readonly && (
                    <DeleteButton
                        label={t.labels.PBNA_MOBILE_REMOVE_EQUIPMENT}
                        handlePress={() => {
                            Alert.alert('', t.labels.PBNA_MOBILE_REMOVE_EQUIPMENT_MSG, [
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                    style: 'cancel'
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_YES,
                                    onPress: async () => {
                                        handlePressDelete()
                                    }
                                }
                            ])
                        }}
                    />
                )}
            </View>
        </KeyboardAwareScrollView>
    )
}
