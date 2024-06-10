/**
 * @description Distribution point modal
 * @author Qiulin Deng
 * @date 2021-06-15
 */
import React, { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import { Modal, ScrollView, View, Alert, StyleSheet, Dimensions } from 'react-native'
import CText from '../../../../../common/components/CText'
import PickerTile from '../common/PickerTile'
import DistributionPointDayTile from './DistributionPointDayTile'
import { SoupService } from '../../../../service/SoupService'
import { filterExistFields } from '../../../../utils/SyncUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import { useDistributionPoints, useDpOptions, useSuggestedRoute } from '../../../../hooks/LeadHooks'
import { restDataCommonCall, syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { getRecordTypeId } from '../../../../utils/CommonUtils'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { useDisableSave, useDistributionPointDays } from '../../../../hooks/DistributionPointHooks'
import { updateLeadInDp } from '../../../../utils/LeadUtils'
import { Log } from '../../../../../common/enums/Log'
import _ from 'lodash'
import { LeadStatus } from '../../../../enums/Lead'
import DeleteButton from '../../../common/DeleteButton'
import moment from 'moment'
import SearchablePicklist from '../common/SearchablePicklist'
import { useDpPicklistData } from '../../../../hooks/UserHooks'
import { t } from '../../../../../common/i18n/t'
import { useCustomerDistributionPoints } from '../../../../hooks/CustomerProfileHooks'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { DAY_OF_WEEKS } from '../../../../utils/MerchManagerUtils'

const SCREEN_HEIGHT = Dimensions.get('window').height

const styles = StyleSheet.create({
    processDoneModalText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    distributionPointModal: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    contentBox: {
        width: '100%',
        paddingHorizontal: '5%'
    },
    editAndBackBtnContainer: {
        justifyContent: 'center',
        height: 50,
        marginTop: 50
    },
    opeTextStyle: {
        fontSize: 24,
        fontWeight: '900'
    },
    contentContainer: {
        height: SCREEN_HEIGHT - 100 - 94
    },
    allPickerContainer: {
        marginBottom: 22
    },
    width_48_percent: {
        width: '48%'
    },
    pickerTileContainer: {
        width: '100%',
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    pickerLabelText: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    deliveryDayText: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 10
    }
})

interface DistributionPointModalProps {
    dpData?: any
    refresh: any
    leadExternalId?: any
    showDistributionPointModal: boolean
    setShowDistributionPointModal: (showDistributionPointModal: boolean) => void
    l?: any
    isEdit?: boolean
    saveTimes?: number
    refreshCount?: number
    isFromRequest?: boolean
    customer?: any
    type?: 'Lead' | 'RetailStore'
    globalModalRef?: MutableRefObject<any>
    successMsg?: any
    copyDPList?: any
    originalDPList?: any
}

const FSVFrequency = ['-- Select --', 'Bi-weekly', 'Every Third Week', 'Monthly', 'Weekly']
const FSVFrequencyMap = {
    'Bi-weekly': '001',
    'Every Third Week': '002',
    Monthly: '003',
    Weekly: '004'
}
export const SLS_MTHD_NM_PEPSI_DIRECT = 'Pepsi Direct'
export const PROD_GRP_NM_FOUNTAIN = 'Fountain'
export const PROD_GRP_NM_BC = 'B & C'
const DLVRY_MTHD_NM_DISP_BAY = 'Disp. Bay'
const SLS_MTHD_NM_THIRD_PARTY_SALES = 'Third Party Sales'
const WEEEKLYCDE = '002'

export const FSVFrequencyMapReverse = {
    '001': 'Bi-weekly',
    '002': 'Every Third Week',
    '003': 'Monthly',
    '004': 'Weekly'
}

const dpCreateFields = [
    'SLS_MTHD_NM__c',
    'PROD_GRP_NM__c',
    'DLVRY_MTHD_NM__c',
    'DELY_DAYS__c',
    'Route_Text__c',
    'Lead__c',
    'Customer__c',
    'RecordTypeId',
    'CUST_RTE_FREQ_CDE__c',
    'SLS_MTHD_CDE__c',
    'DELY_MTHD_CDE__c',
    'PROD_GRP_CDE__c',
    'Lead_DP_Route_Disp_NM__c',
    'ACTV_FLG__c',
    'Route__c',
    'Pending__c',
    'Send_New_DP__c'
]

const DistributionPointModal: FC<DistributionPointModalProps> = (props: DistributionPointModalProps) => {
    const {
        dpData,
        refresh,
        leadExternalId,
        showDistributionPointModal,
        setShowDistributionPointModal,
        l,
        isEdit,
        saveTimes,
        refreshCount,
        isFromRequest = false,
        customer,
        type = 'Lead',
        globalModalRef,
        successMsg,
        copyDPList = [],
        originalDPList = []
    } = props
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [isSameRoute, setIsSameRoute] = useState(false)
    const [isReadyToAdd, setIsReadyToAdd] = useState(false)
    const [isNeedBC, setIsNeedBC] = useState(false)
    const dpOptions = useDpOptions(type, l, customer, showDistributionPointModal)
    const { nationalRoute } = useSuggestedRoute(l)
    const initDaysOpen = () => {
        if (isEdit && dpData?.SLS_MTHD_NM__c !== 'Food Service Calls') {
            // dpData?.DELY_DAYS__c will be null then null.search('Sunday') will be undefined
            return {
                Sunday:
                    dpData?.DELY_DAYS__c?.search('Sunday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Sunday') !== undefined,
                Monday:
                    dpData?.DELY_DAYS__c?.search('Monday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Monday') !== undefined,
                Tuesday:
                    dpData?.DELY_DAYS__c?.search('Tuesday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Tuesday') !== undefined,
                Wednesday:
                    dpData?.DELY_DAYS__c?.search('Wednesday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Wednesday') !== undefined,
                Thursday:
                    dpData?.DELY_DAYS__c?.search('Thursday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Thursday') !== undefined,
                Friday:
                    dpData?.DELY_DAYS__c?.search('Friday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Friday') !== undefined,
                Saturday:
                    dpData?.DELY_DAYS__c?.search('Saturday') !== -1 &&
                    dpData?.DELY_DAYS__c?.search('Saturday') !== undefined
            }
        }
        return {
            Sunday: false,
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false
        }
    }
    const [daysOpen, setDaysOpen] = useState(initDaysOpen())
    const initDistributionPoint = () => {
        if (isFromRequest) {
            return {
                Id: null,
                SLS_MTHD_NM__c: 'FSV',
                SLS_MTHD_CDE__c: '004',
                DELY_MTHD_CDE__c: '001',
                PROD_GRP_CDE__c: '001',
                DLVRY_MTHD_NM__c: 'Disp. Bay ',
                Route_Text__c: null,
                PROD_GRP_NM__c: 'B & C',
                DELY_DAYS__c: null,
                CUST_RTE_FREQ_CDE__c: null,
                RecordTypeId: null,
                Customer__c: type === 'RetailStore' ? customer?.AccountId : '',
                CUST_ID__c: type === 'RetailStore' ? customer?.Account?.CUST_UNIQ_ID_VAL__c : '',
                Lead__c: type === 'RetailStore' ? null : l?.ExternalId,
                ACTV_FLG__c: true,
                created_by_savvy__c: true,
                Pending__c: type === 'RetailStore'
            }
        }
        return {
            Id: null,
            SLS_MTHD_NM__c: null,
            SLS_MTHD_CDE__c: null,
            DELY_MTHD_CDE__c: null,
            PROD_GRP_CDE__c: null,
            DLVRY_MTHD_NM__c: null,
            Route_Text__c: null,
            PROD_GRP_NM__c: null,
            DELY_DAYS__c: null,
            CUST_RTE_FREQ_CDE__c: null,
            Lead__c: type === 'Lead' ? leadExternalId : null,
            Customer__c: type === 'Lead' ? null : customer.AccountId,
            RecordTypeId: null,
            ACTV_FLG__c: type === 'RetailStore',
            Pending__c: type === 'RetailStore',
            Send_New_DP__c: type === 'RetailStore'
        }
    }
    const [distributionPoint, setDistributionPoint] = useState(isEdit ? dpData : initDistributionPoint())
    const productGroupRef = useRef(null)
    const dfRef = useRef(null)
    const smRef = useRef(null)
    const dmRef = useRef(null)
    const spRef = useRef(null)
    const disableSave = useDisableSave(distributionPoint, isEdit, copyDPList, isDuplicate)
    const [routeSearchValue, setRouteSearchValue] = useState('')
    const routeNumber = useDpPicklistData(
        distributionPoint.SLS_MTHD_NM__c,
        type === 'RetailStore' ? customer?.LOC_PROD_ID__c : l?.Location_ID_c__c,
        routeSearchValue
    )
    const processAfterContactIngest = (type: 'success' | 'failed', message: string) => {
        setTimeout(() => {
            if (globalModalRef) {
                globalModalRef.current?.closeModal()
            } else {
                global.$globalModal.closeModal()
            }
        }, 2000)
        if (globalModalRef) {
            globalModalRef.current?.openModal(
                <ProcessDoneModal type={type}>
                    <CText numberOfLines={3} style={styles.processDoneModalText}>
                        {message}
                    </CText>
                </ProcessDoneModal>,
                type === 'failed' ? 'OK' : null
            )
        } else {
            global.$globalModal.openModal(
                <ProcessDoneModal type={type}>
                    <CText numberOfLines={3} style={styles.processDoneModalText}>
                        {message}
                    </CText>
                </ProcessDoneModal>,
                type === 'failed' ? 'OK' : null
            )
        }
        if (type === 'success') {
            setTimeout(() => {
                if (globalModalRef) {
                    globalModalRef.current?.closeModal()
                } else {
                    global.$globalModal.closeModal()
                }
            }, 3000)
        }
    }
    useDistributionPointDays(distributionPoint, setDistributionPoint, daysOpen)
    const [distributionLst, setDistributionLst] = useState([])
    const leadDistributionPoints = useDistributionPoints(
        l?.ExternalId,
        showDistributionPointModal,
        refreshCount,
        saveTimes
    )
    const customerDistributionPoints = useCustomerDistributionPoints(customer?.AccountId, refreshCount)
    useEffect(() => {
        if (type === 'Lead') {
            setDistributionLst(_.isEmpty(originalDPList) ? leadDistributionPoints : originalDPList)
        } else {
            setDistributionLst(_.isEmpty(originalDPList) ? customerDistributionPoints : originalDPList)
        }
    }, [leadDistributionPoints, customerDistributionPoints, originalDPList])
    const resetData = () => {
        setDaysOpen(initDaysOpen())
        productGroupRef.current?.resetNull()
        dfRef.current?.resetNull()
        smRef.current?.resetNull()
        dmRef.current?.resetNull()
        setDistributionPoint(isEdit ? dpData : initDistributionPoint())
        setIsReadyToAdd(false)
        setIsSameRoute(false)
        setIsNeedBC(false)
    }
    const duplicateCheck = _.cloneDeep(distributionPoint.SLS_MTHD_NM__c + distributionPoint.PROD_GRP_NM__c)
    const duplicateEditCheck = _.cloneDeep(dpData?.SLS_MTHD_NM__c + dpData?.PROD_GRP_NM__c)
    const sameRouteCheck = _.cloneDeep(
        distributionPoint?.DELY_DAYS__c +
            ',' +
            distributionPoint?.CUST_RTE_FREQ_CDE__c +
            ',' +
            distributionPoint?.Route__c
    )
    const noEmptyRoutList = _.filter(distributionLst, (item) => {
        return (
            !_.isEmpty(item.DELY_MTHD_CDE__c) &&
            !_.isEmpty(item.PROD_GRP_CDE__c) &&
            !_.isEmpty(item.CUST_RTE_FREQ_CDE__c) &&
            !_.isEmpty(item.DELY_DAYS__c) &&
            !_.isEmpty(item.Route__c) &&
            item?.SLS_MTHD_NM__c === distributionPoint?.SLS_MTHD_NM__c &&
            (isEdit ? item?.Id !== dpData?.Id : true)
        )
    })
    const pdCheck =
        distributionPoint?.SLS_MTHD_NM__c === SLS_MTHD_NM_PEPSI_DIRECT &&
        distributionPoint?.PROD_GRP_NM__c === PROD_GRP_NM_FOUNTAIN
    const onlyHasBCDp = dpData?.SLS_MTHD_NM__c === SLS_MTHD_NM_PEPSI_DIRECT && dpData?.PROD_GRP_NM__c === PROD_GRP_NM_BC
    const existRoutList = _.map(noEmptyRoutList, (item) => {
        const daysArray = item?.DELY_DAYS__c?.split(';')
        const sortedDaysArray = _.sortBy(daysArray, (day) => DAY_OF_WEEKS.indexOf(day))
        return sortedDaysArray?.join(';') + ',' + item?.CUST_RTE_FREQ_CDE__c + ',' + item?.Route__c
    })

    const hasFountainDp = _.some(distributionLst, {
        SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
        PROD_GRP_NM__c: PROD_GRP_NM_FOUNTAIN
    })
    const hasBCDp = _.some(distributionLst, {
        SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
        PROD_GRP_NM__c: PROD_GRP_NM_BC
    })
    const checkNeedBCOnDelete = () => {
        return onlyHasBCDp && hasFountainDp
    }

    useEffect(() => {
        const tempList = _.map(_.cloneDeep(distributionLst), (item) => {
            return item?.SLS_MTHD_NM__c + item?.PROD_GRP_NM__c
        })

        if (isEdit) {
            const dropDuplicateList = _.pull(tempList, duplicateEditCheck)
            setIsDuplicate(_.includes(dropDuplicateList, duplicateCheck))
            setIsSameRoute(_.isEmpty(existRoutList) ? false : !_.includes(existRoutList, sameRouteCheck))
            setIsNeedBC((pdCheck && !hasBCDp) || (onlyHasBCDp && pdCheck))
        } else {
            setIsDuplicate(_.includes(tempList, duplicateCheck))
            setIsSameRoute(_.isEmpty(existRoutList) ? false : !_.includes(existRoutList, sameRouteCheck))
            setIsNeedBC(pdCheck && !hasBCDp)
        }
    }, [duplicateCheck, duplicateEditCheck, existRoutList, sameRouteCheck])

    const handleClickCancel = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_ALERT,
            t.labels.PBNA_MOBILE_YOU_CHANGES_ARE_NOT_SAVED_WOULD_YOU_LIKE_TO_PROCEED,
            [
                {
                    text: _.capitalize(t.labels.PBNA_MOBILE_GO_BACK),
                    style: 'default'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES_PROCEED,
                    style: 'default',
                    onPress: () => {
                        resetData()
                        setShowDistributionPointModal(false)
                    }
                }
            ]
        )
    }
    const handleClickDelete = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT,
            t.labels.PBNA_MOBILE_ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_DISTRIBUTION_POINT,
            [
                {
                    text: _.capitalize(t.labels.PBNA_MOBILE_CANCEL),
                    style: 'default'
                },
                {
                    text: _.capitalize(t.labels.PBNA_MOBILE_DELETE),
                    style: 'default',
                    onPress: () => {
                        ;(async () => {
                            setShowDistributionPointModal(false)
                            if (globalModalRef) {
                                globalModalRef.current?.openModal()
                            } else {
                                global.$globalModal.openModal()
                            }
                            try {
                                await restDataCommonCall(`sobjects/Customer_to_Route__c/${dpData.Id}`, 'DELETE')
                                await SoupService.removeRecordFromSoup('Customer_to_Route__c', [
                                    dpData?.CTRSoupEntryId || dpData?._soupEntryId + ''
                                ])
                                if (type === 'Lead') {
                                    const leadToUpdate = _.cloneDeep(l)
                                    if (leadToUpdate.Lead_Sub_Status_c__c !== LeadStatus.NEGOTIATE) {
                                        leadToUpdate.Lead_Sub_Status_c__c = 'Negotiate'
                                        leadToUpdate.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
                                    }
                                    leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
                                    const leadSyncUpFields = [
                                        'Id',
                                        'Rep_Last_Modified_Date_c__c',
                                        'Lead_Sub_Status_c__c',
                                        'Last_Task_Modified_Date_c__c'
                                    ]
                                    await syncUpObjUpdateFromMem(
                                        'Lead__x',
                                        filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields)
                                    )
                                }
                                setTimeout(() => {
                                    if (globalModalRef) {
                                        globalModalRef.current?.closeModal()
                                    } else {
                                        global.$globalModal.closeModal()
                                    }
                                }, 2000)
                                refresh()
                                if (globalModalRef) {
                                    globalModalRef.current?.openModal(
                                        <ProcessDoneModal type={'success'}>
                                            <CText numberOfLines={3} style={styles.processDoneModalText}>
                                                {t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT_SUCCESSFULLY}
                                            </CText>
                                        </ProcessDoneModal>
                                    )
                                } else {
                                    global.$globalModal.openModal(
                                        <ProcessDoneModal type={'success'}>
                                            <CText numberOfLines={3} style={styles.processDoneModalText}>
                                                {t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT_SUCCESSFULLY}
                                            </CText>
                                        </ProcessDoneModal>
                                    )
                                }
                                setTimeout(() => {
                                    if (globalModalRef) {
                                        globalModalRef.current?.closeModal()
                                    } else {
                                        global.$globalModal.closeModal()
                                    }
                                    refresh()
                                }, 3000)
                            } catch (e) {
                                if (globalModalRef) {
                                    globalModalRef.current?.closeModal()
                                    globalModalRef.current?.openModal(
                                        <ProcessDoneModal type={'failed'}>
                                            <CText numberOfLines={3} style={styles.processDoneModalText}>
                                                {t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT_FAILED}
                                            </CText>
                                        </ProcessDoneModal>,
                                        t.labels.PBNA_MOBILE_OK
                                    )
                                    storeClassLog(
                                        Log.MOBILE_ERROR,
                                        'handleClickDelete',
                                        'edit dp: ' + ErrorUtils.error2String(e)
                                    )
                                } else {
                                    global.$globalModal.closeModal()
                                    global.$globalModal.openModal(
                                        <ProcessDoneModal type={'failed'}>
                                            <CText numberOfLines={3} style={styles.processDoneModalText}>
                                                {t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT_FAILED}
                                            </CText>
                                        </ProcessDoneModal>,
                                        t.labels.PBNA_MOBILE_OK
                                    )
                                    storeClassLog(
                                        Log.MOBILE_ERROR,
                                        'handleClickDelete',
                                        'edit dp: ' + ErrorUtils.error2String(e)
                                    )
                                }
                            }
                        })()
                    }
                }
            ]
        )
    }

    const handleClickBCOnDelete = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_PEPSI_DIRECT_BC_DISTRIBUTION_POINT_REQUIRED,
            t.labels.PBNA_MOBILE_PEPSI_DIRECT_REQUIRES_BC_DISTRIBUTION_POINT_MSG +
                ' ' +
                t.labels.PBNA_MOBILE_DELETE_PEPSI_DIRECT_FOUNTAIN_DISTRIBUTION_POINT_FIRST +
                t.labels.PBNA_MOBILE_DELETE_PEPSI_DIRECT_FOUNTAIN_DISTRIBUTION_POINT_SECOND,
            [
                {
                    text: t.labels.PBNA_MOBILE_OK,
                    style: 'default'
                }
            ]
        )
    }

    const handlePressButton = () => {
        if (checkNeedBCOnDelete()) {
            handleClickBCOnDelete()
        } else {
            handleClickDelete()
        }
    }

    const handleClickSameRoute = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_ROUTE_FREQUENCY_AND_DAY_MISMATCH_HEADER,
            t.labels.PBNA_MOBILE_DISTRIBUTION_POINT_HAS_THE_SAME_SALES_METHOD_MSG +
                ' ' +
                t.labels.PBNA_MOBILE_MATCH_FREQUENCY_ROUTE_AND_ROUTE_DAYS_MSG,
            [
                {
                    text: t.labels.PBNA_MOBILE_NO,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    style: 'default',
                    onPress: () => {
                        const tempExistingDp = _.orderBy(noEmptyRoutList, ['LastModifiedDate'], ['desc'])[0]
                        const route =
                            type === 'RetailStore'
                                ? `${tempExistingDp['Route__r.GTMU_RTE_ID__c']} ${
                                      tempExistingDp['Route__r.RTE_TYP_GRP_NM__c'] || '-'
                                  } ${tempExistingDp['User__r.Name'] || ''}`
                                : ''
                        dfRef.current?.setValue(
                            dpOptions?.DELIVERY_FREQUENCY_MAPPING_CODE[tempExistingDp?.CUST_RTE_FREQ_CDE__c]
                        )
                        spRef.current?.setValue(
                            tempExistingDp?.Lead_DP_Route_Disp_NM__c || tempExistingDp?.Route_Text__c || route
                        )
                        setDistributionPoint({
                            ...distributionPoint,
                            CUST_RTE_FREQ_CDE__c: tempExistingDp.CUST_RTE_FREQ_CDE__c,
                            DELY_DAYS__c: tempExistingDp.DELY_DAYS__c,
                            Lead_DP_Route_Disp_NM__c:
                                type === 'RetailStore' ? route : tempExistingDp.Lead_DP_Route_Disp_NM__c,
                            Route__c: tempExistingDp?.Route__c,
                            Route_Text__c:
                                type === 'RetailStore'
                                    ? tempExistingDp['Route__r.GTMU_RTE_ID__c']
                                    : tempExistingDp?.Route_Text__c
                        })
                        setDaysOpen({
                            Sunday:
                                tempExistingDp?.DELY_DAYS__c?.search('Sunday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Sunday') !== undefined,
                            Monday:
                                tempExistingDp?.DELY_DAYS__c?.search('Monday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Monday') !== undefined,
                            Tuesday:
                                tempExistingDp?.DELY_DAYS__c?.search('Tuesday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Tuesday') !== undefined,
                            Wednesday:
                                tempExistingDp?.DELY_DAYS__c?.search('Wednesday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Wednesday') !== undefined,
                            Thursday:
                                tempExistingDp?.DELY_DAYS__c?.search('Thursday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Thursday') !== undefined,
                            Friday:
                                tempExistingDp?.DELY_DAYS__c?.search('Friday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Friday') !== undefined,
                            Saturday:
                                tempExistingDp?.DELY_DAYS__c?.search('Saturday') !== -1 &&
                                tempExistingDp?.DELY_DAYS__c?.search('Saturday') !== undefined
                        })

                        setIsSameRoute(false)
                        setIsReadyToAdd(true)
                    }
                }
            ]
        )
    }
    const addData = async () => {
        if (globalModalRef) {
            globalModalRef.current?.openModal()
        } else {
            global.$globalModal.openModal()
        }
        const dpToUpdate = _.cloneDeep(distributionPoint)
        try {
            if (isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV') {
                dpToUpdate.RecordTypeId = await getRecordTypeId(
                    type === 'RetailStore' ? 'Requested Customer DP' : 'Lead DP',
                    'Customer_to_Route__c'
                )
                resetData()
                const requestDpCreateFields = [
                    'SLS_MTHD_NM__c',
                    'PROD_GRP_NM__c',
                    'DLVRY_MTHD_NM__c',
                    'DELY_DAYS__c',
                    'Route_Text__c',
                    'RecordTypeId',
                    'CUST_RTE_FREQ_CDE__c',
                    'SLS_MTHD_CDE__c',
                    'DELY_MTHD_CDE__c',
                    'PROD_GRP_CDE__c',
                    'Lead_DP_Route_Disp_NM__c',
                    'Customer__c',
                    'CUST_ID__c',
                    'Lead__c',
                    'ACTV_FLG__c',
                    'created_by_savvy__c',
                    'Route__c',
                    'Pending__c'
                ]
                await syncUpObjCreateFromMem(
                    'Customer_to_Route__c',
                    filterExistFields('Customer_to_Route__c', [dpToUpdate], requestDpCreateFields)
                )
            } else {
                dpToUpdate.DELY_DAYS__c =
                    dpToUpdate.SLS_MTHD_NM__c === 'Food Service Calls' ? 'Sunday' : dpToUpdate.DELY_DAYS__c
                dpToUpdate.RecordTypeId = await getRecordTypeId(
                    type === 'RetailStore' ? 'Requested Customer DP' : 'Lead DP',
                    'Customer_to_Route__c'
                )
                resetData()
                const leadSyncUpFields = [
                    'Id',
                    'Rep_Last_Modified_Date_c__c',
                    'Lead_Sub_Status_c__c',
                    'Last_Task_Modified_Date_c__c'
                ]
                const dpToCreate = isNeedBC
                    ? [
                          dpToUpdate,
                          {
                              ...dpToUpdate,
                              PROD_GRP_NM__c: PROD_GRP_NM_BC,
                              PROD_GRP_CDE__c: '001',
                              DELY_MTHD_CDE__c: '001',
                              DLVRY_MTHD_NM__c: DLVRY_MTHD_NM_DISP_BAY
                          }
                      ]
                    : [dpToUpdate]
                await syncUpObjCreateFromMem(
                    'Customer_to_Route__c',
                    filterExistFields('Customer_to_Route__c', dpToCreate, dpCreateFields)
                )
                if (type === 'Lead') {
                    const leadToUpdate = updateLeadInDp(l)
                    await syncUpObjUpdateFromMem(
                        'Lead__x',
                        filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields)
                    )
                } else {
                    await syncUpObjUpdateFromMem('Account', [{ Id: customer.AccountId, Send_New_DP__c: true }])
                }
            }
            refresh()
            processAfterContactIngest('success', successMsg || t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINT_SUCCESSFULLY)
        } catch (err) {
            if (globalModalRef) {
                globalModalRef.current?.closeModal()
            } else {
                global.$globalModal.closeModal()
            }
            processAfterContactIngest('failed', t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINT_FAILED + err)
            storeClassLog(Log.MOBILE_ERROR, 'addData', 'create dp: ' + ErrorUtils.error2String(err), {
                Data__c: ErrorUtils.error2String(dpToUpdate)
            })
        }
    }

    const saveData = async () => {
        if (globalModalRef) {
            globalModalRef.current?.openModal()
        } else {
            global.$globalModal.openModal()
        }
        const dpObj = _.cloneDeep(distributionPoint)
        try {
            if (isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV') {
                const dpUpdateFields = [
                    'Id',
                    'SLS_MTHD_NM__c',
                    'PROD_GRP_NM__c',
                    'DLVRY_MTHD_NM__c',
                    'DELY_DAYS__c',
                    'Route_Text__c',
                    'RecordTypeId',
                    'CUST_RTE_FREQ_CDE__c',
                    'SLS_MTHD_CDE__c',
                    'DELY_MTHD_CDE__c',
                    'PROD_GRP_CDE__c',
                    'Lead_DP_Route_Disp_NM__c',
                    'Route__c',
                    'Pending__c'
                ]
                await syncUpObjUpdateFromMem(
                    'Customer_to_Route__c',
                    filterExistFields('Customer_to_Route__c', [dpObj], dpUpdateFields)
                )
            } else {
                dpObj.DELY_DAYS__c = dpObj.SLS_MTHD_NM__c === 'Food Service Calls' ? 'Sunday' : dpObj.DELY_DAYS__c
                if (type === 'Lead') {
                    const leadToUpdate = updateLeadInDp(l)
                    const leadSyncUpFields = [
                        'Id',
                        'Rep_Last_Modified_Date_c__c',
                        'Lead_Sub_Status_c__c',
                        'Last_Task_Modified_Date_c__c'
                    ]
                    await syncUpObjUpdateFromMem(
                        'Lead__x',
                        filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields)
                    )
                } else {
                    await syncUpObjUpdateFromMem('Account', [{ Id: customer.AccountId, Send_New_DP__c: true }])
                }
                const dpUpdateFields = [
                    'Id',
                    'SLS_MTHD_NM__c',
                    'PROD_GRP_NM__c',
                    'DLVRY_MTHD_NM__c',
                    'DELY_DAYS__c',
                    'Route_Text__c',
                    'CUST_RTE_FREQ_CDE__c',
                    'SLS_MTHD_CDE__c',
                    'DELY_MTHD_CDE__c',
                    'PROD_GRP_CDE__c',
                    'Lead_DP_Route_Disp_NM__c',
                    'Route__c',
                    'Pending__c',
                    'Send_New_DP__c'
                ]
                await syncUpObjUpdateFromMem(
                    'Customer_to_Route__c',
                    filterExistFields('Customer_to_Route__c', [dpObj], dpUpdateFields)
                )
                if (isNeedBC) {
                    const dpToCreate = {
                        ...dpObj,
                        PROD_GRP_NM__c: PROD_GRP_NM_BC,
                        Lead__c: type === 'Lead' ? dpObj.Lead__c : null,
                        Customer__c: type === 'Lead' ? null : dpObj.Customer__c,
                        ACTV_FLG__c: type === 'RetailStore',
                        Pending__c: type === 'RetailStore',
                        Send_New_DP__c: type === 'RetailStore'
                    }
                    await syncUpObjCreateFromMem(
                        'Customer_to_Route__c',
                        filterExistFields('Customer_to_Route__c', [dpToCreate], dpCreateFields)
                    )
                }
            }
            refresh()
            processAfterContactIngest('success', t.labels.PBNA_MOBILE_UPDATE_DISTRIBUTION_POINT_SUCCESSFULLY)
        } catch (err) {
            if (globalModalRef) {
                globalModalRef.current?.closeModal()
            } else {
                global.$globalModal.closeModal()
            }
            refresh()
            processAfterContactIngest('failed', t.labels.PBNA_MOBILE_UPDATE_DISTRIBUTION_POINT_FAILED)
        }
    }
    const handleClickNeedBC = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_PEPSI_DIRECT_BC_DISTRIBUTION_POINT_REQUIRED,
            t.labels.PBNA_MOBILE_PEPSI_DIRECT_REQUIRED_BC_DISTRIBUTION_POINT_MSG +
                ' ' +
                t.labels.PBNA_MOBILE_SUBMIT_FOR_PEPSI_DIRECT_BC_DISTRIBUTION_POINT_MSG,
            [
                {
                    text: t.labels.PBNA_MOBILE_NO,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    style: 'default',
                    onPress: async () => {
                        setShowDistributionPointModal(false)
                        if (isEdit) {
                            await saveData()
                        } else {
                            await addData()
                        }
                    }
                }
            ]
        )
    }
    const renderButton = () => {
        if (isEdit) {
            return (
                <FormBottomButton
                    onPressCancel={handleClickCancel}
                    onPressSave={async () => {
                        if (isSameRoute && !isReadyToAdd) {
                            handleClickSameRoute()
                        } else if (isNeedBC) {
                            handleClickNeedBC()
                        } else {
                            setShowDistributionPointModal(false)
                            await saveData()
                        }
                    }}
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                    rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                    disableSave={disableSave}
                />
            )
        }
        return (
            <FormBottomButton
                onPressCancel={handleClickCancel}
                onPressSave={() => {
                    if (isSameRoute && !isReadyToAdd) {
                        handleClickSameRoute()
                    } else if (isNeedBC) {
                        handleClickNeedBC()
                    } else {
                        resetData()
                        setShowDistributionPointModal(false)
                        if (globalModalRef) {
                            globalModalRef.current?.openModal()
                        } else {
                            global.$globalModal.openModal()
                        }
                        addData()
                    }
                }}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                rightButtonLabel={
                    type === 'RetailStore' && !isFromRequest
                        ? t.labels.PBNA_MOBILE_SUBMIT.toUpperCase()
                        : t.labels.PBNA_MOBILE_ADD.toUpperCase()
                }
                disableSave={disableSave}
            />
        )
    }

    const frequencyDataList =
        isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV'
            ? FSVFrequency
            : dpOptions.SALES_DELIVERY_FREQUENCY_MAPPING[
                  distributionPoint.SLS_MTHD_NM__c || dpOptions.SALES_METHOD_OPTIONS[1]
              ]
    return (
        <Modal animationType="fade" transparent visible={showDistributionPointModal}>
            <View style={styles.distributionPointModal}>
                <View style={styles.contentBox}>
                    <View style={styles.editAndBackBtnContainer}>
                        <CText style={styles.opeTextStyle}>
                            {isEdit
                                ? t.labels.PBNA_MOBILE_EDIT_DISTRIBUTION_POINT
                                : t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINTS}
                        </CText>
                    </View>
                    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.pickerTileContainer}>
                            <View style={styles.width_48_percent}>
                                <PickerTile
                                    containerStyle={styles.allPickerContainer}
                                    data={dpOptions.SALES_METHOD_OPTIONS}
                                    label={t.labels.PBNA_MOBILE_SALES_METHOD}
                                    labelStyle={styles.pickerLabelText}
                                    title={t.labels.PBNA_MOBILE_SALES_METHOD}
                                    disabled={isFromRequest}
                                    defValue={(() => {
                                        if (isEdit) {
                                            return distributionPoint.SLS_MTHD_NM__c
                                        }
                                        return isFromRequest ? 'FSV' : ''
                                    })()}
                                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        dmRef.current?.resetNull()
                                        productGroupRef.current?.resetNull()
                                        dfRef.current?.resetNull()
                                        if (v === 'Food Service Calls') {
                                            setDaysOpen({
                                                Sunday: false,
                                                Monday: false,
                                                Tuesday: false,
                                                Wednesday: false,
                                                Thursday: false,
                                                Friday: false,
                                                Saturday: false
                                            })
                                            spRef.current?.setValue(nationalRoute)
                                            setDistributionPoint({
                                                ...distributionPoint,
                                                SLS_MTHD_NM__c: v,
                                                SLS_MTHD_CDE__c: dpOptions.SALES_METHOD_MAPPING[v],
                                                DLVRY_MTHD_NM__c: dpOptions.SALES_DELIVERY_METHOD_MAPPING[v][1],
                                                DELY_MTHD_CDE__c:
                                                    dpOptions.DELIVERY_METHOD_MAPPING[
                                                        dpOptions.SALES_DELIVERY_METHOD_MAPPING[v][1]
                                                    ],
                                                PROD_GRP_CDE__c:
                                                    dpOptions.PRODUCT_GROUP_MAPPING[
                                                        dpOptions.SALES_PRODUCT_GROUP_MAPPING[v][1]
                                                    ],
                                                PROD_GRP_NM__c: dpOptions.SALES_PRODUCT_GROUP_MAPPING[v][1],
                                                CUST_RTE_FREQ_CDE__c: '-01',
                                                Route_Text__c: l?.Suggested_FSR_Nat_Route_Number_c__c || null,
                                                Lead_DP_Route_Disp_NM__c: nationalRoute
                                            })
                                        } else if (v === 'FSV') {
                                            setDistributionPoint({
                                                ...distributionPoint,
                                                SLS_MTHD_NM__c: 'FSV',
                                                SLS_MTHD_CDE__c: '004',
                                                DELY_MTHD_CDE__c: '001',
                                                PROD_GRP_CDE__c: '001',
                                                DLVRY_MTHD_NM__c: DLVRY_MTHD_NM_DISP_BAY,
                                                Route_Text__c: null,
                                                Lead_DP_Route_Disp_NM__c: null,
                                                PROD_GRP_NM__c: 'B & C',
                                                DELY_DAYS__c: null,
                                                CUST_RTE_FREQ_CDE__c: null,
                                                RecordTypeId: null,
                                                Customer__c: type === 'RetailStore' ? customer?.AccountId : null,
                                                CUST_ID__c:
                                                    type === 'RetailStore'
                                                        ? customer?.Account?.CUST_UNIQ_ID_VAL__c
                                                        : null,
                                                Lead__c: type === 'RetailStore' ? null : l?.ExternalId,
                                                ACTV_FLG__c: true,
                                                created_by_savvy__c: true,
                                                Pending__c: type === 'RetailStore'
                                            })
                                            spRef.current?.resetNull()
                                        } else if (v === SLS_MTHD_NM_THIRD_PARTY_SALES) {
                                            setDistributionPoint({
                                                ...distributionPoint,
                                                SLS_MTHD_NM__c: v,
                                                SLS_MTHD_CDE__c: dpOptions.SALES_METHOD_MAPPING[v],
                                                DLVRY_MTHD_NM__c: dpOptions.SALES_DELIVERY_METHOD_MAPPING[v][1],
                                                DELY_MTHD_CDE__c:
                                                    dpOptions.DELIVERY_METHOD_MAPPING[
                                                        dpOptions.SALES_DELIVERY_METHOD_MAPPING[v][1]
                                                    ],
                                                PROD_GRP_CDE__c:
                                                    dpOptions.PRODUCT_GROUP_MAPPING[
                                                        dpOptions.SALES_PRODUCT_GROUP_MAPPING[v][1]
                                                    ],
                                                PROD_GRP_NM__c: dpOptions.SALES_PRODUCT_GROUP_MAPPING[v][1],
                                                CUST_RTE_FREQ_CDE__c: WEEEKLYCDE,
                                                Route_Text__c: null,
                                                Lead_DP_Route_Disp_NM__c: null,
                                                Route__c: null
                                            })
                                            dmRef.current?.setValue(dpOptions.SALES_DELIVERY_METHOD_MAPPING[v][1])
                                            productGroupRef.current?.setValue(
                                                dpOptions.SALES_PRODUCT_GROUP_MAPPING[v][1]
                                            )
                                            dfRef.current?.setValue(
                                                dpOptions.DELIVERY_FREQUENCY_MAPPING_CODE[WEEEKLYCDE]
                                            )
                                            spRef.current?.resetNull()
                                        } else {
                                            setDistributionPoint({
                                                ...distributionPoint,
                                                SLS_MTHD_NM__c: v,
                                                SLS_MTHD_CDE__c: dpOptions.SALES_METHOD_MAPPING[v],
                                                DLVRY_MTHD_NM__c: null,
                                                DELY_MTHD_CDE__c: null,
                                                PROD_GRP_CDE__c: null,
                                                PROD_GRP_NM__c: null,
                                                CUST_RTE_FREQ_CDE__c: null,
                                                Route_Text__c: null,
                                                Lead_DP_Route_Disp_NM__c: null,
                                                DELY_DAYS__c:
                                                    distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'
                                                        ? null
                                                        : distributionPoint.DELY_DAYS__c,
                                                Pending__c: type === 'RetailStore',
                                                Route__c: null
                                            })
                                            spRef.current?.resetNull()
                                        }
                                        setIsReadyToAdd(false)
                                    }}
                                    cRef={smRef}
                                />
                                <PickerTile
                                    containerStyle={styles.allPickerContainer}
                                    data={
                                        dpOptions.SALES_PRODUCT_GROUP_MAPPING[
                                            distributionPoint.SLS_MTHD_NM__c || dpOptions.SALES_METHOD_OPTIONS[1]
                                        ]
                                    }
                                    label={t.labels.PBNA_MOBILE_PRODUCT_GROUP}
                                    labelStyle={styles.pickerLabelText}
                                    title={t.labels.PBNA_MOBILE_PRODUCT_GROUP}
                                    disabled={
                                        distributionPoint.SLS_MTHD_NM__c === '' ||
                                        distributionPoint.SLS_MTHD_NM__c === null ||
                                        distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls' ||
                                        distributionPoint.SLS_MTHD_NM__c === 'FSV' ||
                                        isFromRequest
                                    }
                                    defValue={(() => {
                                        if (isEdit) {
                                            return distributionPoint.PROD_GRP_NM__c
                                        }
                                        return isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV'
                                            ? 'B & C'
                                            : ''
                                    })()}
                                    placeholder={
                                        distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'
                                            ? t.labels.PBNA_MOBILE_NOT_APPLICABLE
                                            : t.labels.PBNA_MOBILE_SELECT
                                    }
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        setIsReadyToAdd(false)
                                        setDistributionPoint({
                                            ...distributionPoint,
                                            PROD_GRP_NM__c: v,
                                            PROD_GRP_CDE__c: dpOptions.PRODUCT_GROUP_MAPPING[v]
                                        })
                                    }}
                                    cRef={productGroupRef}
                                />
                            </View>
                            <View style={styles.width_48_percent}>
                                <PickerTile
                                    containerStyle={styles.allPickerContainer}
                                    data={
                                        dpOptions.SALES_DELIVERY_METHOD_MAPPING[
                                            distributionPoint.SLS_MTHD_NM__c || dpOptions.SALES_METHOD_OPTIONS[1]
                                        ]
                                    }
                                    label={t.labels.PBNA_MOBILE_DELIVERY_METHOD}
                                    labelStyle={styles.pickerLabelText}
                                    title={t.labels.PBNA_MOBILE_DELIVERY_METHOD}
                                    disabled={
                                        distributionPoint.SLS_MTHD_NM__c === '' ||
                                        distributionPoint.SLS_MTHD_NM__c === null ||
                                        distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls' ||
                                        distributionPoint.SLS_MTHD_NM__c === 'FSV' ||
                                        isFromRequest
                                    }
                                    defValue={(() => {
                                        if (isEdit) {
                                            return distributionPoint.DLVRY_MTHD_NM__c
                                        }
                                        return isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV'
                                            ? 'Disp. Bay'
                                            : ''
                                    })()}
                                    placeholder={
                                        distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'
                                            ? t.labels.PBNA_MOBILE_NO_DELIVERY
                                            : t.labels.PBNA_MOBILE_SELECT
                                    }
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        setIsReadyToAdd(false)
                                        setDistributionPoint({
                                            ...distributionPoint,
                                            DLVRY_MTHD_NM__c: v,
                                            DELY_MTHD_CDE__c: dpOptions.DELIVERY_METHOD_MAPPING[v]
                                        })
                                    }}
                                    cRef={dmRef}
                                />
                                <PickerTile
                                    containerStyle={styles.allPickerContainer}
                                    data={frequencyDataList}
                                    label={t.labels.PBNA_MOBILE_DELIVERY_FREQUENCY}
                                    labelStyle={styles.pickerLabelText}
                                    title={t.labels.PBNA_MOBILE_DELIVERY_FREQUENCY}
                                    disabled={
                                        distributionPoint.SLS_MTHD_NM__c === '' ||
                                        distributionPoint.SLS_MTHD_NM__c === null ||
                                        distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls' ||
                                        _.isEmpty(frequencyDataList)
                                    }
                                    defValue={(() => {
                                        if (isEdit) {
                                            return isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV'
                                                ? FSVFrequencyMapReverse?.[distributionPoint?.CUST_RTE_FREQ_CDE__c]
                                                : dpOptions?.DELIVERY_FREQUENCY_MAPPING_CODE[
                                                      distributionPoint?.CUST_RTE_FREQ_CDE__c
                                                  ]
                                        }
                                        return ''
                                    })()}
                                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                                    required
                                    noPaddingHorizontal
                                    onChange={(v: any) => {
                                        setIsReadyToAdd(false)
                                        setDistributionPoint({
                                            ...distributionPoint,
                                            CUST_RTE_FREQ_CDE__c:
                                                isFromRequest || distributionPoint.SLS_MTHD_NM__c === 'FSV'
                                                    ? FSVFrequencyMap[v]
                                                    : dpOptions.DELIVERY_FREQUENCY_MAPPING[v]
                                        })
                                    }}
                                    cRef={dfRef}
                                />
                            </View>
                        </View>
                        <SearchablePicklist
                            label={t.labels.PBNA_MOBILE_ROUTE_NUMBER}
                            data={routeNumber}
                            showValue={(v) => {
                                return `${v?.GTMU_RTE_ID__c} ${v?.RTE_TYP_GRP_NM__c || '-'} ${
                                    v?.Employee_To_Routes__r?.records[0]?.User__r?.Name || ''
                                }`
                            }}
                            defValue={isEdit ? dpData.Lead_DP_Route_Disp_NM__c || dpData.Route_Text__c : ''}
                            onApply={(v) => {
                                setIsReadyToAdd(false)
                                setDistributionPoint({
                                    ...distributionPoint,
                                    Route_Text__c: v.GTMU_RTE_ID__c,
                                    Lead_DP_Route_Disp_NM__c: `${v.GTMU_RTE_ID__c} ${v.RTE_TYP_GRP_NM__c || '-'} ${
                                        v.Employee_To_Routes__r?.records[0]?.User__r?.Name || ''
                                    }`,
                                    Route__c: v.Id
                                })
                            }}
                            onSearchChange={(v) => {
                                setRouteSearchValue(v)
                            }}
                            cRef={spRef}
                            search={false}
                        />
                        {distributionPoint.SLS_MTHD_NM__c !== 'Food Service Calls' && (
                            <View>
                                <CText style={styles.deliveryDayText}>{t.labels.PBNA_MOBILE_DAYS}</CText>
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Sunday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Monday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Tuesday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Wednesday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Thursday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Friday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                                <DistributionPointDayTile
                                    daysOpen={daysOpen}
                                    setDaysOpen={setDaysOpen}
                                    weekDay={'Saturday'}
                                    disabled={distributionPoint.SLS_MTHD_NM__c === 'Food Service Calls'}
                                    setIsReadyToAdd={setIsReadyToAdd}
                                />
                            </View>
                        )}
                        {isEdit && (
                            <DeleteButton
                                label={t.labels.PBNA_MOBILE_DELETE_DISTRIBUTION_POINT.toUpperCase()}
                                handlePress={handlePressButton}
                            />
                        )}
                    </ScrollView>
                </View>
                {renderButton()}
            </View>
        </Modal>
    )
}

export default DistributionPointModal
