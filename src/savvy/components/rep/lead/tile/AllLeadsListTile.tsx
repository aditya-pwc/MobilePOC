/**
 * @description Component to show open leads list tile.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
/* eslint-disable camelcase */
import React, { useState } from 'react'
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { CommonParam } from '../../../../../common/CommonParam'
import { filterExistFields } from '../../../../utils/SyncUtils'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { goToLeadDetail, updateLeadOwner, updateRelatedTask } from '../../../../utils/LeadUtils'
import LeadTile from './LeadTile'
import { syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'
import { useDispatch } from 'react-redux'
import { refreshKpiBarAction } from '../../../../redux/action/LeadActionType'
import moment from 'moment'
import { isPersonaCRMBusinessAdmin, isPersonaFSManager } from '../../../../../common/enums/Persona'
import { t } from '../../../../../common/i18n/t'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface AllLeadsListTileProps {
    l: {
        Pre_qualified_c__c: string
        Company__c: string
        Street__c: string
        City__c: string
        PostalCode__c: string
        State__c: string
        Last_Task_Modified_Date_c__c: string
        Tier_c__c: string
        Call_Counter_c__c: number
        Status__c: string
        isAdded?: boolean
    }
    navigation: any
    setHasAdded?: any
    isGoBack?: boolean
    refreshList?: any
    needCheckData?: boolean
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        marginTop: 22,
        borderRadius: 5,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 5,
            height: 5
        },
        shadowOpacity: 1,
        shadowRadius: 3,
        flexDirection: 'column'
    },
    preQualifiedOuterContainer: {
        height: 22
    },
    preQualifiedContainer: {
        height: 22,
        width: 63,
        backgroundColor: '#2DD36F',
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 20,
        justifyContent: 'center'
    },
    preQualifiedText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 7
    },
    addressContainer: {
        height: 108,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 19.38,
        justifyContent: 'space-between'
    },
    addressInnerContainer: {
        width: '90%',
        marginTop: 5,
        paddingLeft: '6%'
    },
    companyText: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 12
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    addButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    addButton: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#00A2D9'
    },
    bottomBarContainer: {
        height: 39,
        backgroundColor: '#F0F3F6',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 19
    },
    lastModifiedTaskText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: '#706E6B',
        marginRight: 4
    },
    lastModifiedTaskDateText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: 'black'
    },
    tierText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#565656'
    },
    callCounterContainer: {
        borderColor: '#D3D3D3',
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 2,
        backgroundColor: 'white'
    },
    callCounterText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: 'black',
        marginLeft: 2
    },
    addedContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkmark: {
        width: 18,
        height: 18
    },
    addedText: {
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16
    },
    whiteBoxContainer: {
        height: 128,
        flexDirection: 'row'
    },
    whiteBoxInfoContainer: {
        width: '85%',
        flexDirection: 'column'
    },
    buttonOuterContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    callCounterIcon: {
        height: 12,
        width: 12,
        margin: 1,
        marginTop: 2
    }
})

const AllLeadsListTile = (props: AllLeadsListTileProps) => {
    const { l, navigation, setHasAdded, isGoBack, refreshList, needCheckData } = props
    const { dropDownRef } = useDropDown()
    const [isAdded, setIsAdded] = useState(false)
    const dispatch = useDispatch()
    const addLead = async (lead) => {
        global.$globalModal.openModal()
        setIsAdded(true)
        setHasAdded && setHasAdded(true)
        const leadToUpdate = JSON.parse(JSON.stringify(lead))
        leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        leadToUpdate.PD_Assigned_c__c = false
        leadToUpdate.Assigned_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        updateLeadOwner(leadToUpdate, CommonParam.GPID__c)
        try {
            const leadSyncUpFields = [
                'Id',
                'PD_Assigned_c__c',
                'Status__c',
                'Lead_Sub_Status_c__c',
                'Owner_GPID_c__c',
                'Moved_to_Negotiate_Time_c__c',
                'LastModifiedBy_GPID_c__c',
                'Rep_Last_Modified_Date_c__c',
                'CreatedDate__c',
                'Assigned_Date_c__c'
            ]
            await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
            await updateRelatedTask(lead.ExternalId, false)
            refreshList && refreshList(leadToUpdate)
            dispatch(refreshKpiBarAction())
            dropDownRef.current.alertWithType('success', t.labels.PBNA_MOBILE_LEAD_ADDED_SUCCESSFULLY, '')
        } catch (err) {
            dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_SOMETHING_WRONG, err)
        }
        global.$globalModal.closeModal()
    }
    const renderButtonGroups = () => {
        if (isAdded) {
            return (
                <View style={styles.addedContainer}>
                    <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.checkmark} />
                    <CText style={styles.addedText}>{t.labels.PBNA_MOBILE_ADDED}</CText>
                </View>
            )
        }
        if (l.Status__c === 'Open') {
            return (
                <TouchableOpacity
                    onPress={async () => {
                        await addLead(l)
                    }}
                    hitSlop={{ left: 30, right: 30, top: 30, bottom: 30 }}
                >
                    <CText style={[styles.addButton, t.labels.PBNA_MOBILE_ADD.length > 5 && { right: 15 }]}>
                        {t.labels.PBNA_MOBILE_ADD}
                    </CText>
                </TouchableOpacity>
            )
        }
        return null
    }
    const goToLeadDetailLocal = (leadDetail) => {
        navigation.navigate('LeadDetailScreen', {
            lead: leadDetail,
            type: 'Open',
            goBackDp: isGoBack
        })
    }
    return (
        <TouchableOpacity
            onPress={async () => {
                if (needCheckData) {
                    await goToLeadDetail(navigation, l)
                } else {
                    goToLeadDetailLocal(l)
                }
            }}
        >
            <LeadTile l={l}>{!isPersonaFSManager() && !isPersonaCRMBusinessAdmin() && renderButtonGroups()}</LeadTile>
        </TouchableOpacity>
    )
}

export default AllLeadsListTile
