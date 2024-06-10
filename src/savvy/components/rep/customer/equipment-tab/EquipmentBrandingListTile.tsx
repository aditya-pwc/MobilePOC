/**
 * @description Component to show equipment type list tile
 * @author Jack Niu
 * @date 2021-12-20
 */
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'
import _ from 'lodash'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

interface EquipmentBrandingListTileProps {
    item: {
        Id: string
        Name: string
        Description: string
        // sf field's API name is not in camelcase.
        // eslint-disable-next-line camelcase
        equip_grphc_desc__c: string
        // eslint-disable-next-line camelcase
        equip_wdth__c: string
        // eslint-disable-next-line camelcase
        equip_depth__c: string
        // eslint-disable-next-line camelcase
        equip_hgt__c: string
        // eslint-disable-next-line camelcase
        abc_anlys_prrty_cde__c: string
        // eslint-disable-next-line camelcase
        std_equip_setup_id__c: string
    }
    selectedType: string
    onClickSpecs: Function
    pdfPath: string
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 22,
        paddingRight: 22
    },
    imgStyle: {
        width: 80,
        height: 104,
        marginRight: 15,
        resizeMode: 'contain'
    },
    rightContainer: {
        flex: 1,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    nameView: {
        marginBottom: 5
    },
    nameText: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    descriptionText: {
        fontSize: 12,
        lineHeight: 16,
        color: '#565656'
    },
    equipmentDescText: {
        fontSize: 12,
        lineHeight: 20,
        color: '#565656'
    },
    detailText: {
        fontSize: 12,
        color: '#000000'
    },
    hubContView: {
        flexDirection: 'row'
    },
    hubAvailabilityView: {
        flex: 3,
        flexDirection: 'row',
        marginTop: 13
    },
    hubAvailabilityPrefix: {
        fontSize: 12,
        color: '#565656'
    },
    hubAvailabilityText: {
        fontSize: 12,
        color: '#000000'
    },
    specsBtn: {
        flex: 1,
        marginTop: 13,
        paddingRight: 25,
        alignItems: 'flex-end'
    },
    specsText: {
        fontSize: 14,
        color: '#00A2D9',
        fontWeight: '500'
    }
})
const EquipmentBrandingListTile = (props: EquipmentBrandingListTileProps) => {
    const { item, selectedType, onClickSpecs, pdfPath } = props
    const [showSpecsBtn, setShowSpecsBtn] = useState(false)

    useEffect(() => {
        setShowSpecsBtn(!_.isEmpty(pdfPath))
    }, [pdfPath])

    return (
        <View style={styles.container}>
            <View>
                <EquipmentImageDisplay
                    subtypeCde={item.std_equip_setup_id__c}
                    imageStyle={styles.imgStyle}
                    filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_BRANDING_URL}
                    equipTypeDesc={selectedType}
                />
            </View>
            <View style={styles.rightContainer}>
                <View style={styles.nameView}>
                    <CText style={styles.nameText}>{item.Name}</CText>
                </View>
                <View>
                    <CText style={[styles.descriptionText, { overflow: 'hidden' }]} numberOfLines={1}>
                        {item.Description}
                    </CText>
                </View>
                <View>
                    <CText style={[styles.equipmentDescText, { overflow: 'hidden' }]} numberOfLines={1}>
                        {item.equip_grphc_desc__c}
                    </CText>
                </View>
                <View>
                    <CText style={styles.detailText}>
                        W: {item.equip_wdth__c}” | D: {item.equip_depth__c}” | H: {item.equip_hgt__c}”
                    </CText>
                </View>
                <View style={styles.hubContView}>
                    {!_.isEmpty(item.abc_anlys_prrty_cde__c) && (
                        <View style={styles.hubAvailabilityView}>
                            <CText style={styles.hubAvailabilityPrefix}>
                                {t.labels.PBNA_MOBILE_HUB_AVAILABILITY}:&nbsp;
                            </CText>
                            <CText style={styles.hubAvailabilityText}>{item.abc_anlys_prrty_cde__c}</CText>
                        </View>
                    )}
                    {showSpecsBtn && (
                        <TouchableOpacity
                            style={styles.specsBtn}
                            onPress={() => {
                                onClickSpecs && onClickSpecs()
                            }}
                        >
                            <CText style={styles.specsText}>{t.labels.PBNA_MOBILE_SPECS}</CText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    )
}

export default EquipmentBrandingListTile
