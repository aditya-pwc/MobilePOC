/**
 * @description Screen to show Lead Equipment Detail.
 * @author Kiren Cao
 * @date 2022-8-29
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import InstallRequestModal from '../../customer/equipment-tab/InstallRequestModal'
import { useEquipmentTypeCodeDesc, useInProgressEquipmentList } from '../../../../hooks/EquipmentHooks'
import _ from 'lodash'
import CText from '../../../../../common/components/CText'
import InProgressEquipmentList from '../../customer/equipment-tab/InProgressEquipmentList'
import { LeadStatus } from '../../../../enums/Lead'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { t } from '../../../../../common/i18n/t'

interface LeadEquipmentTabProps {
    showShadow?: boolean
    equipmentList: any
    leadId: any
    isLoading?: boolean
    lead: any
    setLeadDetail: any
    onSave: any
    cRef
    selectEquipmentCount: number
    setSelectEquipmentCount: (selectEquipmentCount: number) => void
    activeServiceTypes: Array<any>
    setActiveServiceTypes: (activeServiceTypes: Array<any>) => void
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EFF3F6',
        justifyContent: 'center'
    },
    equipmentDetailContainer: {
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    segment: {
        marginVertical: 15
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%'
    },
    searchBarInnerContainer: {
        width: '85%',
        height: 36,
        borderRadius: 10,
        backgroundColor: 'white'
    },
    searchBarInputContainer: {
        backgroundColor: 'white'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    centerWithMarginTop_65: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 65
    },
    noRequestIconStyle: {
        width: 200,
        height: 200,
        marginHorizontal: 50
    },
    titleTextStyle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 25
    },
    textStyle: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 10,
        color: '#565656'
    },
    blankView: {
        height: 100,
        width: '100%'
    }
})

const NoRequestIcon = require('../../../../../../assets/image/no-new-request.png')

const LeadEquipmentTab: FC<LeadEquipmentTabProps> = (props: LeadEquipmentTabProps) => {
    const {
        leadId,
        equipmentList,
        lead,
        setLeadDetail,
        onSave,
        cRef,
        selectEquipmentCount,
        setSelectEquipmentCount,
        activeServiceTypes,
        setActiveServiceTypes
    } = props
    const [tabRefreshTimes, setTabRefreshTimes] = useState(0)
    const inProgressEquipmentList = useInProgressEquipmentList('', leadId, tabRefreshTimes, equipmentList)
    const installRequestRef = useRef(null)
    const [requestId, setRequestId] = useState(null)
    const [selectEquipmentList, setSelectEquipmentList] = useState([])
    const [installRequestModalVisible, setInstallRequestModalVisible] = useState(false)
    const equipmentTypeCodeDesc = useEquipmentTypeCodeDesc()

    useEffect(() => {
        if (selectEquipmentCount === 0) {
            const tempList = _.cloneDeep(equipmentList)
            tempList.forEach((item) => {
                item.selected = false
            })
            setTimeout(() => {
                setSelectEquipmentList(tempList)
            }, 0)
        }
    }, [equipmentList])

    useEffect(() => {
        const tempEquipmentList = _.cloneDeep(selectEquipmentList)
        tempEquipmentList.forEach((item) => {
            item.selected = false
        })
        setSelectEquipmentList(tempEquipmentList)
        setSelectEquipmentCount(0)
    }, [activeServiceTypes])

    useImperativeHandle(cRef, () => ({
        openInstallRequestModal: () => {
            setInstallRequestModalVisible(true)
        }
    }))

    const openRequestDetail = (item) => {
        setRequestId(item.Id)
        if (item.equip_move_type_cde__c === 'INS') {
            setInstallRequestModalVisible(true)
        } else {
            let index
            switch (item.equip_move_type_cde__c) {
                case 'ONS':
                    index = 0
                    break
                case 'PIC':
                    index = 1
                    break
                case 'Repair':
                    index = 2
                    break
                case 'EXI':
                case 'EXP':
                    index = 3
                    break
                default:
                    return
            }
            const tempActiveServiceTypes = _.cloneDeep(activeServiceTypes)
            tempActiveServiceTypes[index].serviceActive = true
            setActiveServiceTypes(tempActiveServiceTypes)
        }
    }

    return (
        <View style={styles.container}>
            {_.isEmpty(inProgressEquipmentList) ? (
                <View style={styles.centerWithMarginTop_65}>
                    <Image source={NoRequestIcon} style={styles.noRequestIconStyle} resizeMode="contain" />
                    <CText style={styles.titleTextStyle}>{t.labels.PBNA_MOBILE_NO_NEW_EQUIPMENT_REQUESTS}</CText>
                    <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_NEW_EQUIPMENT_INSTALL_REQUESTS_MSG}</CText>
                </View>
            ) : (
                <View>
                    <InProgressEquipmentList
                        inProgressEquipmentList={inProgressEquipmentList}
                        allowDeleteDraft
                        onSave={onSave}
                        lead={lead}
                        onClick={(item) => {
                            const request = {
                                Id: item.parent_request_record__c,
                                equip_move_type_cde__c: item.equip_move_type_cde__c
                            }
                            openRequestDetail(request)
                        }}
                        equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                    />
                    <View style={styles.blankView} />
                </View>
            )}
            {installRequestModalVisible && (
                <InstallRequestModal
                    cRef={installRequestRef}
                    accountId={''}
                    customer={lead}
                    id={requestId}
                    onSave={onSave}
                    onBack={() => {
                        setTimeout(() => {
                            setRequestId(null)
                        }, 0)
                    }}
                    setTabRefreshTimes={setTabRefreshTimes}
                    equipmentList={equipmentList}
                    equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                    visible={installRequestModalVisible}
                    setVisible={setInstallRequestModalVisible}
                    type={'Lead'}
                    l={lead}
                    setLeadDetail={setLeadDetail}
                    leadId={leadId}
                    readonly={
                        lead.COF_Triggered_c__c === '1' ||
                        lead.Status__c !== LeadStatus.NEGOTIATE ||
                        isPersonaCRMBusinessAdmin()
                    }
                />
            )}
        </View>
    )
}

export default LeadEquipmentTab
