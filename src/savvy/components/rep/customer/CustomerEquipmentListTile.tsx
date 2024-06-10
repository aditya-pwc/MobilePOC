/**
 * @description Component to show customer equipment list tile
 * @author Pawn
 * @date 2021-11-05
 */
import React from 'react'
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native'
import CText from '../../../../common/components/CText'
import moment from 'moment'
import CCheckBox from '../../../../common/components/CCheckBox'
import CRadioButton from '../../common/CRadioButton'
import { t } from '../../../../common/i18n/t'
import { moveTypeMapping, requestStatusMapping } from '../../../utils/EquipmentUtils'
import _ from 'lodash'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { CommonApi } from '../../../../common/api/CommonApi'
import EquipmentImageDisplay from './equipment-tab/EquipmentImageDisplay'

interface CustomerEquipmentListTileProps {
    equipment: {
        // eslint-disable-next-line camelcase
        request_subtype__c: string
        // eslint-disable-next-line camelcase
        serv_ord_type_cde__c: string
        // eslint-disable-next-line camelcase
        status__c: string
        // eslint-disable-next-line camelcase
        cets_ord_stat_cde__c: string
        // eslint-disable-next-line camelcase
        sched_beg_dte__c: string
        LastModifiedDate: string
        TotalCount: number
        CompletedCount: number
        // eslint-disable-next-line camelcase
        submitted_date__c: string
        // eslint-disable-next-line camelcase
        ord_rcv_dte_tme__c: string
        // eslint-disable-next-line camelcase
        equip_move_type_desc__c: string
        RequestId: string
        Id: string
        Name: string
        AccountId: string
        // sf field's API name is not in camelcase.
        // eslint-disable-next-line camelcase
        ident_asset_num__c: string
        // eslint-disable-next-line camelcase
        serv_cntrt_nm__c: string
        // eslint-disable-next-line camelcase
        equip_site_desc__c: string
        // eslint-disable-next-line camelcase
        equip_inst_dte__c: string
        // eslint-disable-next-line camelcase
        equip_last_svc_dte__c: string
        // eslint-disable-next-line camelcase
        equip_type_desc__c: string
        // eslint-disable-next-line camelcase
        equip_styp_desc__c: string
        SerialNumber: string
        // eslint-disable-next-line camelcase
        equip_ownr_nm__c: string
        // eslint-disable-next-line camelcase
        net_book_val_amt__c: string
        selected: boolean
        // eslint-disable-next-line camelcase
        serv_ctrct_nme__c: string
        // eslint-disable-next-line camelcase
        equip_type_cde__c: string
        // eslint-disable-next-line camelcase
        equip_ownr_cde__c: string
        // eslint-disable-next-line camelcase
        equip_styp_cde__c: string
    }
    navigation: any
    setHasAdded?: any
    isGoBack?: boolean
    refreshList?: any
    needCheckData?: boolean
    setAssetDetail: any
    setCurrentAsset: any
    setSelected
    activeServiceTypes
    pepsiColaNationalAccount
    equipmentTypeCodeDesc: any
    selectAllEquipments: boolean
}

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    equipmentImageAndBodyContainer: {
        flexDirection: 'row'
    },
    equipmentDetailView: {
        marginBottom: 10,
        marginTop: 10,
        flexDirection: 'column',
        width: '70%',
        marginLeft: 10
    },
    equipmentImage: {
        height: 80,
        width: 80,
        marginTop: 10,
        marginRight: 20,
        resizeMode: 'contain'
    },
    equipmentTitle: {
        fontSize: 20,
        fontWeight: '700',
        overflow: 'hidden',
        marginBottom: 5
    },
    equipmentBodyPrefix: {
        fontSize: 12,
        overflow: 'hidden',
        fontWeight: '300',
        color: 'grey'
    },
    equipmentDateFormat: {
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center'
    },
    equipmentBodyFormat: {
        fontSize: 12,
        marginLeft: 5,
        overflow: 'hidden',
        fontWeight: '300',
        marginRight: 30
    },
    equipmentBody: {
        marginBottom: 5,
        overflow: 'hidden',
        fontWeight: '300',
        flexDirection: 'row'
    },
    equipmentInstallDate: {
        flexDirection: 'row',
        fontSize: 12,
        marginLeft: 5,
        overflow: 'hidden',
        fontWeight: '300',
        marginRight: screenWidth / 16
    },
    equipmentLastServiceDateLabel: {
        fontSize: 12,
        overflow: 'hidden',
        fontWeight: '300',
        color: 'grey'
    },
    equipmentLastServiceDate: {
        fontSize: 12,
        marginLeft: 5,
        overflow: 'hidden',
        fontWeight: '300',
        marginRight: 5
    },
    serviceInfo: {
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: '#565656',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        paddingHorizontal: 5,
        paddingVertical: 2
    },
    draftIcon: {
        color: '#565656',
        fontWeight: '700'
    },
    extraLine: {
        marginRight: 100
    },
    fontSize: {
        fontSize: 12
    },
    fontColor: {
        color: '#595959'
    },
    typeRadioContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row-reverse'
    },
    alignItemsFlexEnd: {
        alignItems: 'flex-end'
    },
    marginRight_15: {
        marginRight: -15
    },
    dateContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '50%'
    },
    lineSeparatorStyle: {
        height: 12,
        width: 1,
        backgroundColor: '#D3D3D3',
        marginRight: 10
    }
})
const MAX_EQUIPMENT_BODY_LENGTH = 20
const MAX_EQUIPMENT_EXTRA_LENGTH = 8
const CustomerEquipmentListTile = (props: CustomerEquipmentListTileProps) => {
    const {
        setSelected,
        activeServiceTypes,
        pepsiColaNationalAccount,
        equipment,
        equipmentTypeCodeDesc,
        selectAllEquipments
    } = props
    const statusList = requestStatusMapping()
    const { width } = Dimensions.get('window')
    const judgeRenderCheckbox = () => {
        if (
            equipment.status__c === 'CANCELLED' ||
            equipment.status__c === 'CLOSED' ||
            equipment.status__c === 'FAILED' ||
            _.isEmpty(equipment.RequestId) ||
            (equipment.serv_ord_type_cde__c === 'PM' && equipment.request_subtype__c === 'Service Request')
        ) {
            if (pepsiColaNationalAccount === '1') {
                if (
                    activeServiceTypes[0].serviceActive ||
                    activeServiceTypes[1].serviceActive ||
                    activeServiceTypes[3].serviceActive
                ) {
                    return (
                        equipment.equip_ownr_cde__c === 'PEP' &&
                        (equipment.equip_type_cde__c === 'COO' || equipment.equip_type_cde__c === 'VEN')
                    )
                }
                return false
            }
            return selectAllEquipments ? equipment.selected : true
        }
        return false
    }
    const judgeRenderRadioButton = () => {
        if (
            equipment.status__c === 'CANCELLED' ||
            equipment.status__c === 'CLOSED' ||
            equipment.status__c === 'FAILED' ||
            _.isEmpty(equipment.RequestId) ||
            (equipment.serv_ord_type_cde__c === 'PM' && equipment.request_subtype__c === 'Service Request')
        ) {
            if (pepsiColaNationalAccount === '1') {
                return (
                    equipment.equip_ownr_cde__c === 'PEP' &&
                    (equipment.equip_type_cde__c === 'COO' || equipment.equip_type_cde__c === 'VEN')
                )
            }
            return true
        }
        return false
    }
    const renderSubmittedAndScheduled = (item) => {
        const handlePMLogic =
            (item.request_subtype__c === 'Service Request' && item.serv_ord_type_cde__c !== 'PM') ||
            item.request_subtype__c !== 'Service Request'
        if (
            _.isEmpty(item.submitted_date__c) &&
            (_.isEmpty(item.sched_beg_dte__c) || item.sched_beg_dte__c === '1900-01-01') &&
            !_.isEmpty(item.ord_rcv_dte_tme__c) &&
            handlePMLogic
        ) {
            return (
                <View style={styles.equipmentBody}>
                    <CText style={styles.fontSize}>
                        <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                        <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_VIA}&nbsp;</CText>
                        <CText>{t.labels.PBNA_MOBILE_EXTERNAL_SYSTEM}</CText>
                    </CText>
                </View>
            )
        }
        if (item.sched_beg_dte__c && item.sched_beg_dte__c !== '1900-01-01' && handlePMLogic) {
            return (
                <View style={styles.equipmentBody}>
                    <CText style={styles.fontSize}>
                        <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SCHEDULED}&nbsp;</CText>
                        <CText>{item.equip_move_type_desc__c}&nbsp;</CText>
                        <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_ON.toLowerCase()}&nbsp;</CText>
                        <CText>{moment(item.sched_beg_dte__c).format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
                    </CText>
                </View>
            )
        }
        return (
            <>
                {handlePMLogic && (
                    <View style={styles.equipmentBody}>
                        <CText style={styles.fontSize}>
                            <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_SUBMITTED}&nbsp;</CText>
                            <CText>{item.equip_move_type_desc__c}&nbsp;</CText>
                            <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_ON.toLowerCase()}&nbsp;</CText>
                            <CText>{moment(item.submitted_date__c).format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
                            <CText style={styles.fontColor}>&nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;</CText>
                            <CText>{item['requested_by__r.Name']}</CText>
                        </CText>
                    </View>
                )}
            </>
        )
    }
    const switchStatus = (v) => {
        switch (v.status__c) {
            case 'DRAFT':
                return {
                    pillStyle: {
                        borderColor: '#565656',
                        backgroundColor: 'white'
                    },
                    textStyle: {
                        color: '#565656'
                    },
                    line: (
                        <View style={styles.equipmentBody}>
                            <CText style={styles.fontSize}>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_CREATED}&nbsp;</CText>
                                <CText>{v.equip_move_type_desc__c}&nbsp;</CText>
                                <CText style={styles.fontColor}>{t.labels.PBNA_MOBILE_ON.toLowerCase()}&nbsp;</CText>
                                <CText>{moment(v.CreatedDate).format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
                                <CText style={styles.fontColor}>
                                    &nbsp;{t.labels.PBNA_MOBILE_BY.toLowerCase()}&nbsp;
                                </CText>
                                <CText>{v['CreatedBy.Name']}</CText>
                            </CText>
                        </View>
                    )
                }
            case 'INCOMPLETE':
            case 'SUBMITTED':
                return {
                    pillStyle: {
                        borderColor: '#FFC337',
                        backgroundColor: '#FFC337'
                    },
                    textStyle: {
                        color: 'black'
                    },
                    line: renderSubmittedAndScheduled(v)
                }
            default:
                return {
                    pillStyle: {},
                    textStyle: {},
                    line: <View />
                }
        }
    }
    const renderExtraLine = (v) => {
        const statusStats = switchStatus(v)

        return (
            v.status__c !== 'CANCELLED' &&
            v.status__c !== 'CLOSED' &&
            v.status__c !== 'FAILED' && (
                <View>
                    <View style={[styles.equipmentBody, { alignItems: 'center' }]}>
                        {((v.request_subtype__c === 'Service Request' && v.serv_ord_type_cde__c !== 'PM') ||
                            v.request_subtype__c !== 'Service Request') && (
                            <>
                                <CText style={styles.equipmentBodyPrefix}>{t.labels.PBNA_MOBILE_SERVICE_REQUEST}</CText>
                                <CText style={[styles.equipmentBodyFormat, { fontWeight: '800', marginRight: 0 }]}>
                                    {v.equip_move_type_desc__c &&
                                    moveTypeMapping()[v.equip_move_type_cde__c].length > MAX_EQUIPMENT_EXTRA_LENGTH
                                        ? moveTypeMapping()[v.equip_move_type_cde__c].slice(
                                              0,
                                              MAX_EQUIPMENT_EXTRA_LENGTH - 3
                                          ) + '...'
                                        : moveTypeMapping()[v.equip_move_type_cde__c]}
                                </CText>
                                <View style={[styles.serviceInfo, statusStats.pillStyle]}>
                                    <CText
                                        style={[
                                            styles.draftIcon,
                                            statusStats.textStyle,
                                            { fontSize: width < 400 ? 8 : 12 }
                                        ]}
                                    >
                                        {statusList[v.status__c].label}
                                    </CText>
                                </View>
                            </>
                        )}
                    </View>
                    {statusStats.line}
                </View>
            )
        )
    }
    return (
        <TouchableOpacity
            onPress={async () => {
                const item = {
                    ...equipment,
                    equipmentSrc: equipmentTypeCodeDesc[equipment.equip_type_cde__c]
                }
                props.setCurrentAsset(item)
                props.setAssetDetail(true)
            }}
        >
            <View style={styles.container}>
                <View style={styles.equipmentImageAndBodyContainer}>
                    <EquipmentImageDisplay
                        subtypeCde={equipment.equip_styp_cde__c}
                        imageStyle={styles.equipmentImage}
                        filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                        equipTypeDesc={equipmentTypeCodeDesc[equipment.equip_type_cde__c]}
                    />
                    <View style={styles.equipmentDetailView}>
                        <CText style={styles.equipmentTitle} numberOfLines={2}>
                            {equipment.Name}
                        </CText>
                        <View style={styles.equipmentBody}>
                            <CText style={styles.equipmentBodyPrefix}>
                                {t.labels.PBNA_MOBILE_ASSET_NUMBER_HASHTAG}
                            </CText>
                            <CText style={styles.equipmentBodyFormat}>
                                {equipment.ident_asset_num__c &&
                                equipment.ident_asset_num__c.length > MAX_EQUIPMENT_BODY_LENGTH
                                    ? equipment.ident_asset_num__c.slice(0, MAX_EQUIPMENT_BODY_LENGTH - 3) + '...'
                                    : equipment.ident_asset_num__c}
                            </CText>
                        </View>
                        <View style={styles.equipmentBody}>
                            <CText style={styles.equipmentBodyPrefix}>{t.labels.PBNA_MOBILE_SERVICE_CONTRACT}</CText>
                            <CText style={styles.equipmentBodyFormat}>
                                {equipment.serv_ctrct_nme__c &&
                                equipment.serv_ctrct_nme__c.length > MAX_EQUIPMENT_BODY_LENGTH
                                    ? equipment.serv_ctrct_nme__c.slice(0, MAX_EQUIPMENT_BODY_LENGTH - 3) + '...'
                                    : equipment.serv_ctrct_nme__c}
                            </CText>
                        </View>
                        <View style={styles.equipmentBody}>
                            <CText style={styles.equipmentBodyPrefix}>{t.labels.PBNA_MOBILE_ASSET_LOCATION}</CText>
                            <CText style={styles.equipmentBodyFormat}>
                                {equipment.equip_site_desc__c &&
                                equipment.equip_site_desc__c.length > MAX_EQUIPMENT_BODY_LENGTH
                                    ? equipment.equip_site_desc__c.slice(0, MAX_EQUIPMENT_BODY_LENGTH - 3) + '...'
                                    : equipment.equip_site_desc__c}
                            </CText>
                        </View>
                        {!_.isEmpty(equipment.RequestId) && renderExtraLine(equipment)}
                    </View>
                    {activeServiceTypes.find((serviceType) => serviceType.serviceActive) && (
                        <View style={styles.typeRadioContainer}>
                            {activeServiceTypes[2].serviceActive &&
                                judgeRenderRadioButton() &&
                                !equipment.serv_ctrct_nme__c?.toLowerCase().includes('no service') && (
                                    <View style={styles.alignItemsFlexEnd}>
                                        <CRadioButton
                                            onPress={() => {
                                                setSelected(equipment)
                                            }}
                                            checked={equipment.selected}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        />
                                    </View>
                                )}
                            {!activeServiceTypes[2].serviceActive && judgeRenderCheckbox() && (
                                <View style={styles.marginRight_15}>
                                    <CCheckBox
                                        checked={equipment.selected}
                                        onPress={() => {
                                            setSelected(equipment)
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.equipmentDateFormat}>
                    <View style={styles.dateContainer}>
                        <CText style={styles.equipmentBodyPrefix}>{t.labels.PBNA_MOBILE_INSTALL_DATE}</CText>
                        <CText style={styles.equipmentInstallDate}>
                            {equipment.equip_inst_dte__c
                                ? moment(equipment.equip_inst_dte__c).format('DD MMM YYYY')
                                : null}
                        </CText>
                    </View>
                    <View style={styles.lineSeparatorStyle} />
                    {equipment.equip_last_svc_dte__c !== '1900-01-01' && (
                        <View
                            style={{
                                flexDirection:
                                    t.labels.PBNA_MOBILE_LAST_SERVICE_DATE.length > MAX_EQUIPMENT_BODY_LENGTH
                                        ? 'column'
                                        : 'row',
                                width: '50%'
                            }}
                        >
                            <CText style={styles.equipmentLastServiceDateLabel}>
                                {t.labels.PBNA_MOBILE_LAST_SERVICE_DATE}
                            </CText>
                            <CText style={styles.equipmentLastServiceDate}>
                                {equipment.equip_last_svc_dte__c
                                    ? moment(equipment.equip_last_svc_dte__c).format('DD MMM YYYY')
                                    : null}
                            </CText>
                        </View>
                    )}
                    {equipment.equip_last_svc_dte__c === '1900-01-01' && (
                        <View
                            style={{
                                flexDirection:
                                    t.labels.PBNA_MOBILE_LAST_SERVICE_DATE.length > MAX_EQUIPMENT_BODY_LENGTH
                                        ? 'column'
                                        : 'row',
                                width: '50%',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <CText style={styles.equipmentLastServiceDate}>
                                {t.labels.PBNA_MOBILE_NO_SERVICE_HISTORY}
                            </CText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default CustomerEquipmentListTile
