/**
 * @description wiring tile
 * @author Sheng Huang
 * @date 2022/5/24
 */
import React, { FC } from 'react'
import { Animated, StyleSheet, View, Alert } from 'react-native'
import { RectButton, Swipeable } from 'react-native-gesture-handler'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { restDataCommonCall, syncUpObjDelete } from '../../../api/SyncUtils'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { Log } from '../../../../common/enums/Log'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { keyAccountTypeNameMapping, routeHierarchyNameMapping } from './AddNewVisibilityModal'
import { refreshAllLeads } from '../../../utils/refresh/RepRefreshUtils'
import { useDispatch } from 'react-redux'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface LeadCustomerVisibilityTileProps {
    cRef?: any
    item: any
    userId: string
    setWiringRefreshTimes: any
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        marginVertical: 11,
        borderRadius: 5,
        flexDirection: 'column',
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.17,
        shadowRadius: 10,
        flex: 1,
        marginHorizontal: '5%'
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        marginBottom: 11,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        paddingTop: 11
    },
    definitionText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    failedText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    containView: {
        width: 90,
        marginRight: '5%',
        marginLeft: '-6%'
    },
    animateView: {
        flex: 1,
        marginTop: 11
    },
    definitionCont: {
        flex: 1,
        margin: 20
    },
    definitionName: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginBottom: 10
    },
    subTitle: {
        color: baseStyle.color.titleGray
    }
})
export const handleSegmentOptionMapping = {
    Channel: 'Channel',
    Segment: 'Segment',
    Subsegment: 'Sub-Seg'
}
const LeadCustomerVisibilityTile: FC<LeadCustomerVisibilityTileProps> = (props: LeadCustomerVisibilityTileProps) => {
    const { item, userId, setWiringRefreshTimes } = props
    let swipeableRow: Swipeable
    const close = () => {
        swipeableRow?.close()
    }
    const subAndAlertTitle = (applyToCustomer, applyToLeads, alertTitle) => {
        if (applyToCustomer && applyToLeads) {
            return alertTitle
                ? t.labels.PBNA_MOBILE_REMOVE_LEAD_AND_CUS_VISIBILITY
                : t.labels.PBNA_MOBILE_LEAD_CUSTOMER_VISIBILITY
        } else if (applyToLeads) {
            return alertTitle ? t.labels.PBNA_MOBILE_REMOVE_LEAD_VISIBILITY : t.labels.PBNA_MOBILE_LEAD_VISIBILITY
        } else if (applyToCustomer) {
            return alertTitle
                ? t.labels.PBNA_MOBILE_REMOVE_CUSTOMER_VISIBILITY
                : t.labels.PBNA_MOBILE_CUSTOMER_VISIBILITY
        }
        return alertTitle ? t.labels.PBNA_MOBILE_REMOVE_LEAD_VISIBILITY : t.labels.PBNA_MOBILE_LEAD_VISIBILITY
    }
    const dispatch = useDispatch()

    const renderRightActions = (wiringItem) => {
        const pressHandler = async () => {
            close()
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} click remove on existing visibility definitions`, 1)
            Alert.alert(
                subAndAlertTitle(item?.item?.apply_to_cust__c, item?.item?.Apply_To_Leads__c, true),
                `${t.labels.PBNA_MOBILE_COMFIRM_REMOVE_WIRING} '${wiringItem.Definition_Name__c}'?`,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'default'
                    },
                    {
                        text: _.capitalize(t.labels.PBNA_MOBILE_REMOVE),
                        style: 'default',
                        onPress: async () => {
                            global.$globalModal.openModal()
                            try {
                                const path =
                                    'query/?q=SELECT Id ' +
                                    `FROM Customer_Wiring_Users__c WHERE USER__c = '${userId}' ` +
                                    `AND CUST_WRNG_DEF__c = '${wiringItem.CUST_WRNG_DEF__c}'`
                                const res = await restDataCommonCall(path, 'GET')
                                const requestToDelete = [...res.data.records]
                                await syncUpObjDelete(requestToDelete.map((v) => v.Id))
                                setWiringRefreshTimes((v) => v + 1)
                                refreshAllLeads(dispatch)
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type={'success'}>
                                        <CText style={styles.definitionText}>
                                            {`${wiringItem.Definition_Name__c} ${t.labels.PBNA_MOBILE_REMOVE_SUCCESS}`}
                                        </CText>
                                    </ProcessDoneModal>
                                )
                                setTimeout(() => {
                                    global.$globalModal.closeModal()
                                }, 3000)
                            } catch (e) {
                                storeClassLog(Log.MOBILE_ERROR, 'renderRightActions', getStringValue(e))
                                global.$globalModal.closeModal()
                                global.$globalModal.openModal(
                                    <ProcessDoneModal type={'failed'}>
                                        <CText numberOfLines={3} style={styles.failedText}>
                                            {t.labels.PBNA_MOBILE_REMOVE_VISIBILITY_FAILED}
                                        </CText>
                                    </ProcessDoneModal>,
                                    t.labels.PBNA_MOBILE_OK
                                )
                            }
                        }
                    }
                ]
            )
        }
        return (
            <View style={styles.containView}>
                <Animated.View style={styles.animateView}>
                    <View style={[styles.rightAction, { backgroundColor: '#EB445A' }]}>
                        <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                            <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </RectButton>
                    </View>
                </Animated.View>
            </View>
        )
    }
    return (
        <View>
            <Swipeable
                ref={(ref) => {
                    if (ref !== undefined) {
                        swipeableRow = ref
                    }
                }}
                friction={1}
                enableTrackpadTwoFingerGesture
                renderRightActions={() => renderRightActions(item.item)}
                overshootRight={false}
                enabled
            >
                <View style={styles.container}>
                    <View style={styles.definitionCont}>
                        {item?.item?.CUST_LVL_NODE__c && (
                            <CText style={styles.definitionName} numberOfLines={2}>
                                {item.item.CUST_LVL_NODE__c} - {keyAccountTypeNameMapping[item?.item?.CUST_LVL__c]}
                            </CText>
                        )}
                        {item?.item?.SLS_UNIT_NODE__c && (
                            <CText style={styles.definitionName} numberOfLines={2}>
                                {item.item.SLS_UNIT_NODE__c} - {routeHierarchyNameMapping[item?.item?.SLS_UNIT_LVL__c]}
                            </CText>
                        )}
                        {item?.item?.BUSN_SGMNTTN_NODE__c && (
                            <CText style={styles.definitionName} numberOfLines={2}>
                                {item.item.BUSN_SGMNTTN_NODE__c} -{' '}
                                {handleSegmentOptionMapping[item?.item?.BUSN_SGMNTTN_LVL__c]}
                            </CText>
                        )}
                        <CText style={styles.subTitle}>
                            {subAndAlertTitle(item?.item?.apply_to_cust__c, item?.item?.Apply_To_Leads__c, false)}
                        </CText>
                    </View>
                </View>
            </Swipeable>
        </View>
    )
}

export default LeadCustomerVisibilityTile
