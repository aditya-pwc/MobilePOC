/**
 * @description Screen to show Lead detail header.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React, { FC } from 'react'
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import store from '../../../redux/store/Store'
import { checkLeadEdited } from '../../../utils/LeadUtils'
import { SoupService } from '../../../service/SoupService'
import { LeadStatus } from '../../../enums/Lead'
import { CommonParam } from '../../../../common/CommonParam'
import { isPersonaCRMBusinessAdmin } from '../../../../common/enums/Persona'
import { commonStyle } from '../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        paddingHorizontal: '5%',
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
        paddingBottom: 10
    },
    viewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        height: 30
    },
    viewStyle2: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }]
    },
    companyContainer: {
        marginLeft: 20,
        maxWidth: '75%',
        flexDirection: 'row'
    },
    companyText: {
        fontSize: 18,
        fontWeight: '900'
    }
})

interface LeadDetailScreenHeaderProps {
    headerBackgroundColor: any
    headerLeftChevronColor: any
    headerTitleColor: any
    navigation: any
    company: string
    leadList: any
    setShowCancelConfirmModal?: any
    isGoBack?: any
    fromNotification: boolean
    needDelete?: boolean
    l: any
    showLoading
}

const LeadDetailScreenHeader: FC<LeadDetailScreenHeaderProps> = (props: LeadDetailScreenHeaderProps) => {
    const {
        headerBackgroundColor,
        headerLeftChevronColor,
        headerTitleColor,
        navigation,
        company,
        leadList,
        setShowCancelConfirmModal,
        isGoBack,
        fromNotification,
        needDelete,
        l,
        showLoading
    } = props
    const handlePressArrow = () => {
        const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
        if (checkLeadEdited(tempLead)) {
            setShowCancelConfirmModal(true)
        } else {
            if (fromNotification) {
                navigation.navigate('Notifications')
            } else {
                navigation.navigate('Leads', {
                    page: leadList
                })
            }
        }
    }

    const deleteLeadRelationRecord = () => {
        SoupService.retrieveDataFromSoup(
            'Contact',
            {},
            ['Id', 'Lead__c'],
            'SELECT {Contact:Id},{Contact:Lead__c},{Contact:_soupEntryId} FROM {Contact} ' +
                `WHERE {Contact:Lead__c} = '${l.ExternalId}'`
        ).then((contactResult) => {
            if (contactResult.length > 0) {
                SoupService.removeRecordFromSoup(
                    'Contact',
                    contactResult.map((v) => v._soupEntryId)
                )
            }
        })
        SoupService.retrieveDataFromSoup(
            'Task',
            {},
            ['Id', 'Lead__c'],
            'SELECT {Task:Id},{Task:Lead__c},{Task:_soupEntryId} ' +
                `FROM {Task} WHERE {Task:Lead__c} = '${l.ExternalId}'`
        ).then((taskResult) => {
            if (taskResult.length > 0) {
                SoupService.removeRecordFromSoup(
                    'Task',
                    taskResult.map((v) => v._soupEntryId)
                )
            }
        })
        SoupService.retrieveDataFromSoup(
            'Customer_to_Route__c',
            {},
            ['Id', 'Lead__c'],
            'SELECT {Customer_to_Route__c:Id},' +
                '{Customer_to_Route__c:Lead__c},{Customer_to_Route__c:_soupEntryId} ' +
                `FROM {Customer_to_Route__c} WHERE {Customer_to_Route__c:Lead__c} = '${l.ExternalId}'`
        ).then((dpResult) => {
            if (dpResult.length > 0) {
                SoupService.removeRecordFromSoup(
                    'Customer_to_Route__c',
                    dpResult.map((v) => v._soupEntryId)
                )
            }
        })
    }
    return (
        <Animated.View style={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}>
            <SafeAreaView style={commonStyle.fullWidth}>
                <Animated.View style={styles.viewStyle}>
                    <TouchableOpacity
                        onPress={async () => {
                            if (isGoBack) {
                                const needDelRecord =
                                    needDelete &&
                                    l.Status__c !== LeadStatus.NEGOTIATE &&
                                    l.Owner_GPID_c__c !== CommonParam.GPID__c
                                if (isPersonaCRMBusinessAdmin() || needDelRecord) {
                                    global.$globalModal.openModal()
                                    await SoupService.removeRecordFromSoup('Lead__x', [l._soupEntryId])
                                    deleteLeadRelationRecord()
                                    global.$globalModal.closeModal()
                                }
                                navigation.goBack()
                            } else {
                                handlePressArrow()
                            }
                        }}
                        hitSlop={{
                            left: 30,
                            right: 30,
                            top: 30,
                            bottom: 30
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.viewStyle2,
                                {
                                    borderTopColor: headerLeftChevronColor,
                                    borderRightColor: headerLeftChevronColor
                                }
                            ]}
                        />
                    </TouchableOpacity>
                    <View style={styles.companyContainer}>
                        {showLoading && <ActivityIndicator style={{ marginRight: 10 }} />}
                        <Animated.Text
                            allowFontScaling={false}
                            style={[styles.companyText, { color: headerTitleColor }]}
                            numberOfLines={1}
                        >
                            {company}
                        </Animated.Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </Animated.View>
    )
}

export default LeadDetailScreenHeader
