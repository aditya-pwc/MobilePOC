import React, { FC } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import RequestLineItemBottomStatus from './RequestLineItemBottomStatus'
import { t } from '../../../../../common/i18n/t'
import { Request } from '../../../../interface/RequstInterface'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

interface ServiceEquipmentFormProps {
    existingServiceLineItems: Array<Request>
    serviceType
    handlePressRemove: Function
    overview
    equipmentTypeCodeDesc: any
    readonly: boolean
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        paddingHorizontal: '5%'
    },
    selectedContainer: {
        marginTop: 40,
        marginBottom: 10
    },
    textTransform: {
        textTransform: 'lowercase'
    },
    existingServiceLineItemContainer: {
        minHeight: 120,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        padding: 22,
        marginBottom: 10,
        borderRadius: 10
    },
    equipmentImgSrcContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        height: 45,
        width: 45,
        alignItems: 'center',
        justifyContent: 'center'
    },
    equipmentImgSrcStyle: {
        height: 52 * 0.9,
        width: 40 * 0.9,
        resizeMode: 'contain'
    },
    marginLeft_20: {
        marginLeft: 20
    },
    nameText: {
        fontWeight: '500',
        overflow: 'hidden',
        width: 240
    },
    marginTop_4: {
        marginTop: 4
    },
    colorGray: {
        color: 'gray'
    },
    assetNumStyle: {
        width: 140,
        overflow: 'hidden'
    },
    removeText: {
        fontWeight: '500',
        color: '#EB445A'
    }
})
const ServiceEquipmentForm: FC<ServiceEquipmentFormProps> = (props: ServiceEquipmentFormProps) => {
    const { existingServiceLineItems, serviceType, handlePressRemove, overview, equipmentTypeCodeDesc, readonly } =
        props

    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.selectedContainer}>
                <CText style={styles.textTransform}>
                    {existingServiceLineItems.length} {t.labels.PBNA_MOBILE_SELECTED_FOR.toLowerCase()} {serviceType}
                </CText>
            </View>
            {existingServiceLineItems.map((existingServiceLineItem) => {
                return (
                    <View key={existingServiceLineItem.Id} style={styles.existingServiceLineItemContainer}>
                        <View>
                            <View style={styles.equipmentImgSrcContainer}>
                                <EquipmentImageDisplay
                                    subtypeCde={existingServiceLineItem.Equip_styp_cde__c}
                                    imageStyle={styles.equipmentImgSrcStyle}
                                    filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                                    equipTypeDesc={equipmentTypeCodeDesc[existingServiceLineItem.Equip_type_cde__c]}
                                />
                            </View>
                        </View>
                        <View style={styles.marginLeft_20}>
                            <CText style={styles.nameText} numberOfLines={1}>
                                {existingServiceLineItem.Name}
                            </CText>
                            <View style={styles.marginTop_4}>
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_ASSET} #&nbsp;</CText>
                                    <CText style={styles.assetNumStyle} numberOfLines={1} ellipsizeMode="tail">
                                        {existingServiceLineItem.ident_asset_num__c}
                                    </CText>
                                </View>
                                <View style={commonStyle.flexDirectionRow}>
                                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_LOCATION}&nbsp;</CText>
                                    <CText style={styles.assetNumStyle} numberOfLines={1}>
                                        {existingServiceLineItem.equip_site_desc__c}
                                    </CText>
                                </View>
                            </View>
                            {overview.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                                <View style={[styles.marginTop_4, commonStyle.flexRowAlignCenter]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (existingServiceLineItems.length > 1) {
                                                Alert.alert(
                                                    '',
                                                    t.labels
                                                        .PBNA_MOBILE_YOU_ARE_REMOVING_AN_ASSET_WOULD_YOU_LIKE_TO_PROCEED,
                                                    [
                                                        {
                                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                                            style: 'cancel'
                                                        },
                                                        {
                                                            text: t.labels.PBNA_MOBILE_YES,
                                                            onPress: async () => {
                                                                handlePressRemove(existingServiceLineItem)
                                                            }
                                                        }
                                                    ]
                                                )
                                            } else {
                                                Alert.alert(
                                                    '',
                                                    t.labels
                                                        .PBNA_MOBILE_REMOVING_THIS_ASSET_WILL_CANCEL_THE_REQUEST_DO_YOU_WANT_TO_PROCEED,
                                                    [
                                                        {
                                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                                            style: 'cancel'
                                                        },
                                                        {
                                                            text: t.labels.PBNA_MOBILE_YES,
                                                            onPress: async () => {
                                                                handlePressRemove(existingServiceLineItem)
                                                            }
                                                        }
                                                    ]
                                                )
                                            }
                                        }}
                                    >
                                        <CText style={styles.removeText}>
                                            {t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(overview.status__c !== 'DRAFT' || isPersonaCRMBusinessAdmin() || readonly) && (
                                <RequestLineItemBottomStatus item={existingServiceLineItem} />
                            )}
                        </View>
                    </View>
                )
            })}
        </ScrollView>
    )
}

export default ServiceEquipmentForm
