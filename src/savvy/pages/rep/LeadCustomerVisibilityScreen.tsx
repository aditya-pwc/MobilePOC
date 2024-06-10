/**
 * @description A page for view and edit lead and customer visibility
 * @author Sheng Huang
 * @date 2022/5/24
 */
import React, { FC, useRef, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import HeaderCircle from '../../components/rep/lead/HeaderCircle'
import { baseStyle } from '../../../common/styles/BaseStyle'
import LeadCustomerVisibilityTile from '../../components/rep/lead-customer-visibility/LeadCustomerVisibilityTile'
import { CommonParam } from '../../../common/CommonParam'
import AddNewVisibilityModal from '../../components/rep/lead-customer-visibility/AddNewVisibilityModal'
import ProcessDoneModal from '../../components/common/ProcessDoneModal'
import { refreshAllLeads } from '../../utils/refresh/RepRefreshUtils'
import { useDispatch } from 'react-redux'
import { useCustomerWiring } from '../../hooks/WiringHooks'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { updatingLeadWiringAction } from '../../redux/action/LeadActionType'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    floatButton: {
        height: 49,
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#00A2D9',
        borderWidth: 1,
        position: 'absolute',
        bottom: 40,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.17,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    doneModal: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    headContain: {
        marginVertical: 15,
        paddingHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    visibilityCont: {
        width: '80%'
    },
    listStyle: {
        paddingTop: 15,
        paddingBottom: 300
    },
    visibilityText: {
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_bold,
        fontSize: baseStyle.fontSize.fs_12
    }
})

interface LeadCustomerVisibilityModalProps {
    cRef?: any
    navigation: any
}

const LeadCustomerVisibilityScreen: FC<LeadCustomerVisibilityModalProps> = (
    props: LeadCustomerVisibilityModalProps
) => {
    const { navigation } = props
    const dispatch = useDispatch()
    const [wiringRefreshTimes, setWiringRefreshTimes] = useState(0)
    const userId = CommonParam.userId
    const customerWiringList = useCustomerWiring(userId, wiringRefreshTimes)
    const modalRef = useRef<any>(null)

    const closeModal = () => {
        navigation.navigate('MyProfile')
    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity onPress={() => {}} disabled>
                <LeadCustomerVisibilityTile item={item} userId={userId} setWiringRefreshTimes={setWiringRefreshTimes} />
            </TouchableOpacity>
        )
    }

    const onSuccess = async (status: string) => {
        global.$globalModal.openModal(
            <ProcessDoneModal type={'success'}>
                <CText style={styles.doneModal}>
                    {status === 'create'
                        ? t.labels.PBNA_MOBILE_A_NEW_VISIBILITY_ADDED_SUCCESSFULLY
                        : t.labels.PBNA_MOBILE_ALREADY_ASSOCIATE_TO_THIS_WIRING}
                </CText>
            </ProcessDoneModal>
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
        setWiringRefreshTimes((v) => v + 1)
        await refreshAllLeads(dispatch)
    }

    const onFail = () => {
        global.$globalModal.openModal(
            <ProcessDoneModal type={'failed'}>
                <CText numberOfLines={3} style={styles.doneModal}>
                    {t.labels.PBNA_MOBILE_ADD_NEW_VISIBILITY_FAILED}
                </CText>
            </ProcessDoneModal>
        )
        dispatch(updatingLeadWiringAction(false))
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={commonStyle.flex_1}>
                <View>
                    <View style={styles.headContain}>
                        <View style={styles.visibilityCont}>
                            <CText style={styles.eTitle}>{t.labels.PBNA_MOBILE_LEAD_CUSTOMER_VISIBILITY}</CText>
                        </View>
                        <HeaderCircle
                            color={baseStyle.color.tabBlue}
                            onPress={closeModal}
                            transform={[{ rotate: '45deg' }]}
                        />
                    </View>
                    <FlatList
                        data={customerWiringList}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listStyle}
                    />
                </View>
                <TouchableOpacity
                    style={styles.floatButton}
                    onPress={() => {
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} click add new visibility`, 1)
                        modalRef.current?.showModal()
                    }}
                >
                    <CText style={styles.visibilityText}>{_.upperCase(t.labels.PBNA_MOBILE_ADD_NEW_VISIBILITY)}</CText>
                </TouchableOpacity>
                <AddNewVisibilityModal cRef={modalRef} onSuccess={onSuccess} onFail={onFail} />
            </SafeAreaView>
        </View>
    )
}

export default LeadCustomerVisibilityScreen
