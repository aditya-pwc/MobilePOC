/**
 * @description Component for the user to log a call.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'

import DistributionPointModal, {
    PROD_GRP_NM_BC,
    PROD_GRP_NM_FOUNTAIN,
    SLS_MTHD_NM_PEPSI_DIRECT
} from '../../lead/offer-tab/DistributionPointModal'
import { distributionPointBtn } from '../../lead/offer-tab/DeliveryExecution'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import DistributionPointTile from '../../lead/offer-tab/DistributionPointTile'
import { restDataCommonCall, syncUpObjCreate, syncUpObjDelete, syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { filterExistFields, genSyncUpQueryByFields } from '../../../../utils/SyncUtils'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import _ from 'lodash'
import { SoupService } from '../../../../service/SoupService'
import { formatString, getRecordTypeId } from '../../../../utils/CommonUtils'
import moment from 'moment'
import {
    deleteContactOnLeadAndUpdateAsPrimaryContact,
    OverviewLeadProps
} from '../../../../utils/ChangeOfOwnershipUtils'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import CustomerToRouteQueries from '../../../../queries/CustomerToRouteQueries'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface DistributionProps {
    l: OverviewLeadProps
    customer: any
    globalModalRef: any
    setShowDistributionPointModal: any
    showDistributionPointModal: any
    setDisableNextBtn: any
    cRef: any
    handlePressClose: any
    onSave: any
    contactList: any
    contact: any
    readOnly: boolean
    copyDPList: any
}

const styles = StyleSheet.create({
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    generalView: {
        marginTop: 30,
        marginBottom: 44
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    scrollViewBox: {
        flex: 1,
        marginTop: 30,
        marginBottom: 50
    },
    alertSuccessPopText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    distributionContainer: {
        width: '100%',
        height: '100%',
        paddingHorizontal: '5%'
    },
    warningText: {
        color: 'grey',
        fontSize: 12.5
    },
    marginBottom_20: {
        marginBottom: 20
    },
    marginBottom_10: {
        marginBottom: 10
    }
})

const Distribution: FC<DistributionProps> = (props: DistributionProps) => {
    const {
        l,
        globalModalRef,
        customer,
        setShowDistributionPointModal,
        showDistributionPointModal,
        setDisableNextBtn,
        cRef,
        handlePressClose,
        onSave,
        contactList,
        contact,
        readOnly,
        copyDPList
    } = props
    const [refreshCount, setRefreshCount] = useState(0)
    const [distributionLst, setDistributionLst] = useState([])
    const { dropDownRef } = useDropDown()

    useEffect(() => {
        if (l.ExternalId) {
            if (readOnly) {
                restDataCommonCall(
                    `query/?q=SELECT Id,SLS_MTHD_NM__c,PROD_GRP_NM__c ,DLVRY_MTHD_NM__c,DELY_DAYS__c,Route_Text__c,Lead_DP_Route_Disp_NM__c,Lead__c,RecordTypeId, CUST_RTE_FREQ_CDE__c,SLS_MTHD_CDE__c,DELY_MTHD_CDE__c,PROD_GRP_CDE__c FROM Customer_to_Route__c WHERE Lead__c = '${l.ExternalId}'`,
                    'GET'
                ).then((result) => {
                    const DP = _.cloneDeep(result.data?.records)
                    setDistributionLst(DP)
                })
            } else {
                SoupService.retrieveDataFromSoup(
                    'Customer_to_Route__c',
                    {},
                    CustomerToRouteQueries.getDistributionPointsByLeadExternalId.f,
                    formatString(CustomerToRouteQueries.getDistributionPointsByLeadExternalId.q, [l.ExternalId])
                ).then((res) => {
                    setDistributionLst(res)
                })
            }
        }
    }, [l.ExternalId, showDistributionPointModal, refreshCount, 0])

    const checkHasNoBcDp = (distributionLst: any) => {
        let hasBcDp
        if (
            _.some(distributionLst, {
                SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
                PROD_GRP_NM__c: PROD_GRP_NM_FOUNTAIN
            })
        ) {
            hasBcDp = _.some(distributionLst, {
                SLS_MTHD_NM__c: SLS_MTHD_NM_PEPSI_DIRECT,
                PROD_GRP_NM__c: PROD_GRP_NM_BC
            })
        } else {
            hasBcDp = true
        }
        return !hasBcDp
    }

    useEffect(() => {
        if (readOnly) {
            setDisableNextBtn(true)
        }
        if (!readOnly) {
            if (distributionLst?.length > 0) {
                const hasFSCDP =
                    distributionLst.find((dp) => {
                        return dp.SLS_MTHD_NM__c === 'Food Service Calls'
                    }) !== undefined
                const hasNonFSCDP =
                    distributionLst.find((dp) => {
                        return dp.SLS_MTHD_NM__c !== 'Food Service Calls'
                    }) !== undefined
                let hasDeliveryDate = true
                const hasNoBcDp = checkHasNoBcDp(distributionLst)
                distributionLst.forEach((v) => {
                    hasDeliveryDate = hasDeliveryDate && !_.isEmpty(v.DELY_DAYS__c)
                })

                if (
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService' ||
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService Format'
                ) {
                    if (customer['Account.CUST_SRVC_FLG__c'] === '1' && customer['Account.CUST_PROD_FLG__c'] === '0') {
                        setDisableNextBtn(!hasFSCDP || !hasDeliveryDate || hasNoBcDp)
                    } else {
                        setDisableNextBtn(!(hasFSCDP && hasNonFSCDP) || !hasDeliveryDate || hasNoBcDp)
                    }
                }
                if (
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c !== 'FoodService' &&
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c !== 'FoodService Format'
                ) {
                    if (customer['Account.CUST_SRVC_FLG__c'] === '1' && customer['Account.CUST_PROD_FLG__c'] === '0') {
                        setDisableNextBtn(!hasDeliveryDate || hasNoBcDp)
                    } else {
                        setDisableNextBtn((hasFSCDP && !hasNonFSCDP) || !hasDeliveryDate || hasNoBcDp)
                    }
                }
            } else {
                if (
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c !== 'FoodService' &&
                    l.BUSN_SGMNTTN_LVL_3_NM_c__c !== 'FoodService Format' &&
                    customer['Account.CUST_SRVC_FLG__c'] === '1' &&
                    customer['Account.CUST_PROD_FLG__c'] === '0'
                ) {
                    setDisableNextBtn(false)
                } else {
                    setDisableNextBtn(true)
                }
            }
        }
    }, [distributionLst])

    const refreshDistributionPoint = () => {
        setRefreshCount(refreshCount + 1)
        // alertSuccessPop(t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_ADD_DP_SUCCESSFULLY, false)
    }

    const deleteAllDP = () => {
        if (distributionLst?.length > 0) {
            syncUpObjDelete(distributionLst.map((DP) => DP.Id))
            SoupService.removeRecordFromSoup(
                'Customer_to_Route__c',
                distributionLst.map((v) => v.CTRSoupEntryId)
            )
        }
    }

    const alertSuccessPop = (msg, isCloseChangeOfOwnership) => {
        globalModalRef.current?.openModal(
            <ProcessDoneModal type={'success'}>
                <CText numberOfLines={3} style={styles.alertSuccessPopText}>
                    {msg}
                </CText>
            </ProcessDoneModal>
        )

        setTimeout(() => {
            globalModalRef.current?.closeModal()
            isCloseChangeOfOwnership && handlePressClose(true)
        }, 3000)
    }
    const updateCustomer = () => {
        const customerSyncUpFields = ['Id', 'change_initiated__c']
        const customerToUpdate = {
            Id: customer?.AccountId,
            change_initiated__c: true
        }
        syncUpObjUpdateFromMem('Account', filterExistFields('Account', [customerToUpdate], customerSyncUpFields))
    }

    const submitToLead = () => {
        globalModalRef?.current?.openModal()
        const leadSyncUpFields = [
            'Id',
            'original_customer_c__c',
            'Lead_Type_c__c',
            'Send_for_COF_c__c',
            'COF_Triggered_c__c',
            'original_customer_number_c__c'
        ]
        const leadToUpdate = {
            Id: l.Id,
            original_customer_c__c: customer?.AccountId,
            Lead_Type_c__c: 'Change of Ownership',
            Send_for_COF_c__c: '1',
            COF_Triggered_c__c: '1',
            original_customer_number_c__c: customer['Account.CUST_UNIQ_ID_VAL__c']
        }
        syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
            .then(() => {
                alertSuccessPop(t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_SUBMITTED, true)
            })
            .catch(() => {
                globalModalRef?.current?.closeModal()
            })
    }
    const createTask = async () => {
        const taskToCreate = {
            Type: 'Change of Ownership Submitted',
            ActivityDate: moment().format(TIME_FORMAT.Y_MM_DD),
            Status: 'Complete',
            Subject: 'Change of Ownership Submitted',
            RecordTypeId: null,
            WhatId: customer?.AccountId,
            Lead__c: l.Id
        }
        taskToCreate.RecordTypeId = await getRecordTypeId('Customer Activity', 'Task')

        const taskSyncUpFields = ['Type', 'ActivityDate', 'Status', 'Subject', 'RecordTypeId', 'WhatId', 'Lead__c']

        await SoupService.upsertDataIntoSoup('Task', [taskToCreate])
        await syncUpObjCreate('Task', taskSyncUpFields, genSyncUpQueryByFields('Task', taskSyncUpFields, 'insert'))

        onSave()
    }

    const submitTheForm = () => {
        updateCustomer()
        submitToLead()
        deleteContactOnLeadAndUpdateAsPrimaryContact(
            contactList.filter((v) => v.Id !== contact.Id),
            true,
            contact,
            dropDownRef
        )
        createTask()
    }

    const resetDistributionLst = () => {
        setDistributionLst(null)
    }

    useImperativeHandle(cRef, () => ({
        submitForm: () => {
            submitTheForm()
        },
        resetNull: () => {
            resetDistributionLst()
        },
        deleteDPOnLead: () => {
            deleteAllDP()
        }
    }))

    return (
        <SafeAreaView style={styles.distributionContainer}>
            <ScrollView style={styles.scrollViewBox}>
                {distributionLst?.length > 0 &&
                    distributionLst.map((item, index) => {
                        return (
                            <DistributionPointTile
                                globalModalRef={globalModalRef}
                                key={item.CTRSoupEntryId}
                                dpData={item}
                                count={index + 1}
                                isFromRequest={item.SLS_MTHD_NM__c === 'FSV'}
                                customer={customer}
                                refresh={refreshDistributionPoint}
                                showEdit={!readOnly}
                                copyDPList={copyDPList}
                                l={l}
                            />
                        )
                    })}
                {!readOnly &&
                    distributionPointBtn(setShowDistributionPointModal, t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINT)}
                <View style={styles.marginBottom_20}>
                    {!readOnly &&
                        (l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService' ||
                            l.BUSN_SGMNTTN_LVL_3_NM_c__c === 'FoodService Format') &&
                        (distributionLst.length === 0 ||
                            distributionLst.find((dp) => {
                                return dp.SLS_MTHD_NM__c === 'Food Service Calls'
                            }) === undefined) && (
                            <CText style={[styles.warningText, styles.marginBottom_10]}>
                                {t.labels.PBNA_MOBILE_THIS_LEAD_REQUIRES_A_FOOD_SERVICE_CALL_DISTRIBUTION_POINT}
                            </CText>
                        )}
                    {!readOnly && checkHasNoBcDp(distributionLst) && (
                        <CText style={styles.warningText}>
                            {t.labels.PBNA_MOBILE_THIS_LEAD_REQUIRES_A_PEPSI_DIRECT_REQUIRES_BC_DISTRIBUTION_POINT}
                        </CText>
                    )}
                </View>

                <DistributionPointModal
                    refresh={refreshDistributionPoint}
                    leadExternalId={l.ExternalId}
                    l={l}
                    globalModalRef={globalModalRef}
                    isEdit={false}
                    showDistributionPointModal={showDistributionPointModal}
                    setShowDistributionPointModal={setShowDistributionPointModal}
                    refreshCount={refreshCount}
                    saveTimes={0}
                    successMsg={t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP_ADD_DP_SUCCESSFULLY}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default Distribution
