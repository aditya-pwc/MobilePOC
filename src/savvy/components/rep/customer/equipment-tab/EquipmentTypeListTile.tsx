/**
 * @description Component to show equipment type list tile
 * @author Jack Niu
 * @date 2021-12-20
 */
import React from 'react'
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { getEquipmentImgSrc } from '../../../../utils/EquipmentUtils'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

interface EquipmentTypeListTileProps {
    item: {
        Id: string
        Name: string
        AccountId: string
        // sf field's API name is not in camelcase.
        // eslint-disable-next-line camelcase
        equip_styp_desc__c: string
        // eslint-disable-next-line camelcase
        equip_type_desc__c: string
        // eslint-disable-next-line camelcase
        equip_styp_cde__c: string
    }
    onClick: any
    isSubType: boolean
    selectedType?: string
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 22,
        paddingRight: 22
    },
    imgStyle: {
        width: 48,
        height: 49,
        marginRight: 15,
        resizeMode: 'contain'
    },
    rightContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 28,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    textType: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    imgChevron: {
        width: 16,
        height: 26
    }
})
const IMG_CHEVRON = ImageSrc.IMG_CHEVRON
const MAX_EQUIPMENT__TITLE_LENGTH = 30
const formatText = (text) => {
    return text && text.length > MAX_EQUIPMENT__TITLE_LENGTH
        ? text.slice(0, MAX_EQUIPMENT__TITLE_LENGTH - 3) + '...'
        : text
}
const EquipmentTypeListTile = (props: EquipmentTypeListTileProps) => {
    const { item, onClick, isSubType, selectedType } = props

    return (
        <TouchableOpacity
            onPress={async () => {
                onClick()
            }}
            style={styles.container}
        >
            <View>
                {isSubType ? (
                    <EquipmentImageDisplay
                        subtypeCde={item.equip_styp_cde__c}
                        imageStyle={styles.imgStyle}
                        filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL}
                        equipTypeDesc={selectedType}
                    />
                ) : (
                    <Image source={getEquipmentImgSrc(item.equip_type_desc__c)} style={styles.imgStyle} />
                )}
            </View>
            <View style={styles.rightContainer}>
                <View>
                    <CText style={styles.textType}>
                        {isSubType ? formatText(item.equip_styp_desc__c) : formatText(item.equip_type_desc__c)}
                    </CText>
                </View>
                <View>
                    <Image source={IMG_CHEVRON} style={styles.imgChevron} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default EquipmentTypeListTile
