import React, { FC } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import LeadInput from '../../lead/common/LeadInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RequestLineItemBottomStatus from './RequestLineItemBottomStatus'
import { t } from '../../../../../common/i18n/t'
import { Request } from '../../../../interface/RequstInterface'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

interface MoveEquipmentFormProps {
    existingServiceLineItems: Array<Request>
    handlePressRemove: Function
    inStoreLocationList
    setInStoreLocationList
    duplicateMessageList
    overview
    setDuplicateMessageList
    readonly: boolean
    equipmentTypeCodeDesc: any
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        paddingHorizontal: '5%',
        paddingTop: 40
    },
    existingServiceLineItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    existingServiceLineItemStyle: {
        fontSize: 18,
        fontWeight: '500'
    },
    removeAssetAlertContainer: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center'
    },
    removeText: {
        fontWeight: '500',
        color: '#EB445A',
        fontSize: 12
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
    nameText: {
        fontWeight: '500',
        overflow: 'hidden',
        width: 240
    },
    assetNumText: {
        width: 140,
        overflow: 'hidden'
    },
    marginTop_4: {
        marginTop: 4
    },
    marginLeft_20: {
        marginLeft: 20
    },
    colorGray: {
        color: 'gray'
    },
    imgContainer: {
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        paddingHorizontal: 22,
        paddingVertical: 15,
        marginBottom: 10,
        borderRadius: 10
    },
    height_120: {
        height: 120
    },
    height_100: {
        height: 100
    }
})

const MoveEquipmentForm: FC<MoveEquipmentFormProps> = (props: MoveEquipmentFormProps) => {
    const {
        existingServiceLineItems,
        handlePressRemove,
        inStoreLocationList,
        setInStoreLocationList,
        duplicateMessageList,
        overview,
        setDuplicateMessageList,
        equipmentTypeCodeDesc,
        readonly
    } = props

    return (
        <KeyboardAwareScrollView style={styles.scrollViewContainer}>
            {existingServiceLineItems.map((existingServiceLineItem, k) => {
                return (
                    <View key={existingServiceLineItem.Id}>
                        <View style={styles.existingServiceLineItemContainer}>
                            <CText style={styles.existingServiceLineItemStyle}>
                                {t.labels.PBNA_MOBILE_MOVE} {k + 1}
                            </CText>
                            {overview.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                                <View style={styles.removeAssetAlertContainer}>
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
                                                                const tempLocationList = [...inStoreLocationList]
                                                                const tempLocationMessageList = [
                                                                    ...duplicateMessageList
                                                                ]
                                                                tempLocationList.splice(k, 1)
                                                                tempLocationMessageList.splice(k, 1)
                                                                setInStoreLocationList(tempLocationList)
                                                                setDuplicateMessageList(tempLocationMessageList)
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
                                                                const tempLocationList = [...inStoreLocationList]
                                                                const tempLocationMessageList = [
                                                                    ...duplicateMessageList
                                                                ]
                                                                tempLocationList.splice(k, 1)
                                                                tempLocationMessageList.splice(k, 1)
                                                                setInStoreLocationList(tempLocationList)
                                                                setDuplicateMessageList(tempLocationMessageList)
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
                        </View>
                        <View style={[styles.imgContainer, { minHeight: 100 }]}>
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
                                        <CText style={styles.assetNumText} numberOfLines={1} ellipsizeMode="tail">
                                            {existingServiceLineItem.ident_asset_num__c}
                                        </CText>
                                    </View>
                                    <View style={commonStyle.flexDirectionRow}>
                                        <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_LOCATION}&nbsp;</CText>
                                        <CText style={styles.assetNumText} numberOfLines={1}>
                                            {existingServiceLineItem.equip_site_desc__c}
                                        </CText>
                                    </View>
                                </View>
                                {overview.status__c !== 'DRAFT' && (
                                    <RequestLineItemBottomStatus item={existingServiceLineItem} />
                                )}
                            </View>
                        </View>
                        {overview.status__c === 'DRAFT' && !isPersonaCRMBusinessAdmin() && !readonly && (
                            <View>
                                <LeadInput
                                    fieldName={t.labels.PBNA_MOBILE_SELECT_NEW_IN_STORE_LOCATION}
                                    placeholder={t.labels.PBNA_MOBILE_ENTER_LOCATION}
                                    onChangeText={(v) => {
                                        const tempList = [...inStoreLocationList]
                                        tempList[k] = v
                                        setInStoreLocationList(tempList)
                                    }}
                                    trackedValue={inStoreLocationList[k]}
                                    maxLength={255}
                                    customErrorMessage={
                                        duplicateMessageList[k] ? t.labels.PBNA_MOBILE_UNIQUE_LOCATION_REQUIRED : ''
                                    }
                                    noMargin
                                />
                            </View>
                        )}
                    </View>
                )
            })}
        </KeyboardAwareScrollView>
    )
}

export default MoveEquipmentForm
