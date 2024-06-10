/**
 * @description Component to show customer delivery and execution.
 * @author Kiren Cao
 * @date 2022-11-08
 */
import React, { FC, useState } from 'react'
import BaseSection from '../../common/BaseSection'
import { View, StyleSheet } from 'react-native'
import moment from 'moment'
import { t } from '../../../../common/i18n/t'
import CustomerDistributionPointTile from './CustomerDistributionPointTile'
import { useCustomerDistributionPoints } from '../../../hooks/CustomerProfileHooks'
import _ from 'lodash'
import LeadFieldTile from '../lead/common/LeadFieldTile'
import DistributionPointModal from '../lead/offer-tab/DistributionPointModal'
import { distributionPointBtn } from '../lead/offer-tab/DeliveryExecution'
import { isPersonaCRMBusinessAdmin, isPersonaManager } from '../../../../common/enums/Persona'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import DeliveryTimeWindow from './profile-tab/DeliveryTimeWindow'

interface CustomerDeliveryExecutionProps {
    navigation?
    retailStore
    onSaveDistributionPoint
    refreshFlag
}
const styles = StyleSheet.create({
    bgWhite: {
        backgroundColor: 'white'
    },
    distributionPointBtnStyle: {
        marginTop: 20,
        marginBottom: 20
    }
})

const CustomerDeliveryExecution: FC<CustomerDeliveryExecutionProps> = (props: CustomerDeliveryExecutionProps) => {
    const { retailStore, onSaveDistributionPoint, refreshFlag, navigation } = props
    const [refreshCount, setRefreshCount] = useState(0)
    const [showDistributionPointModal, setShowDistributionPointModal] = useState(false)
    const distributionPointList = useCustomerDistributionPoints(retailStore?.AccountId, refreshFlag)

    const refreshDistributionPoint = () => {
        if (onSaveDistributionPoint) {
            onSaveDistributionPoint()
        }
        setRefreshCount(refreshCount + 1)
    }
    return (
        <BaseSection>
            <View style={commonStyle.fullWidth}>
                {(retailStore?.Account?.Id || retailStore?.AccountId) && isPersonaManager() && (
                    <DeliveryTimeWindow
                        accountId={retailStore?.Account?.Id || retailStore?.AccountId}
                        navigation={navigation}
                        customerUniqId={
                            retailStore?.Account?.CUST_UNIQ_ID_VAL__c || retailStore['Account.CUST_UNIQ_ID_VAL__c']
                        }
                    />
                )}
                {!_.isEmpty(retailStore['Account.SSONL_CLSD_STRT_DT__c']) &&
                    retailStore['Account.SSONL_CLSD_STRT_DT__c'] !== '1900-01-01' &&
                    !_.isEmpty(retailStore['Account.SSONL_CLSD_END_DT__c']) &&
                    retailStore['Account.SSONL_CLSD_END_DT__c'] !== '1900-01-01' && (
                        <View
                            style={[
                                commonStyle.flexDirectionRow,
                                styles.bgWhite,
                                { marginBottom: distributionPointList.length > 0 ? 30 : 0 }
                            ]}
                        >
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_START_DATE}
                                    fieldValue={moment(retailStore['Account.SSONL_CLSD_STRT_DT__c']).format(
                                        TIME_FORMAT.MMMM_D
                                    )}
                                />
                            </View>
                            <View style={commonStyle.halfWidth}>
                                <LeadFieldTile
                                    fieldName={t.labels.PBNA_MOBILE_SEASONAL_CLOSE_END_DATE}
                                    fieldValue={moment(retailStore['Account.SSONL_CLSD_END_DT__c']).format(
                                        TIME_FORMAT.MMMM_D
                                    )}
                                />
                            </View>
                        </View>
                    )}
                <View style={[styles.bgWhite]}>
                    {distributionPointList.map((item, index) => {
                        return (
                            <CustomerDistributionPointTile
                                dpData={item}
                                key={item.Id}
                                noTopLine
                                navigation={navigation}
                                noBottomLine={index === distributionPointList.length - 1}
                            />
                        )
                    })}
                    {!isPersonaCRMBusinessAdmin() && (
                        <View style={styles.distributionPointBtnStyle}>
                            {distributionPointBtn(setShowDistributionPointModal)}
                        </View>
                    )}
                </View>
                <DistributionPointModal
                    refresh={refreshDistributionPoint}
                    customer={retailStore}
                    isEdit={false}
                    showDistributionPointModal={showDistributionPointModal}
                    setShowDistributionPointModal={setShowDistributionPointModal}
                    refreshCount={refreshCount}
                    saveTimes={refreshFlag}
                    type={'RetailStore'}
                    originalDPList={distributionPointList}
                />
            </View>
        </BaseSection>
    )
}

export default CustomerDeliveryExecution
