/**
 * @description Location List Component
 * @author Sheng Huang
 * @date 2021/8/24
 */
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import IMG_PEPSI_LOGO from '../../../../../assets/image/Pepsi_Logo.svg'
import CText from '../../../../common/components/CText'
import React from 'react'
import { renderAddressContent } from '../common/CustomerItem'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'

interface LocationProps {
    item?: any
    itemClick?: Function
    containerStyle?: any
}

const styles = StyleSheet.create({
    imgLocation: {
        width: 18,
        height: 21
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    imgBottomUserImage: {
        width: 26,
        height: 26,
        borderRadius: 4
    },
    fontWeight_900: {
        fontWeight: '900'
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    fontSize_16: {
        fontSize: 16
    },
    fontSize_18: {
        fontSize: 18
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_lightGary: {
        color: '#D3D3D3'
    },
    fontColor_blue: {
        color: '#00A2D9'
    },
    marginTop_6: {
        marginTop: 6
    },
    marginTop_16: {
        marginTop: 16
    },
    marginRight_8: {
        marginRight: 8
    },
    marginRight_20: {
        marginRight: 20
    },
    marginLeft_10: {
        marginLeft: 10
    },
    teamItem: {
        backgroundColor: 'white',
        marginBottom: 16,
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    disabledItem: {
        backgroundColor: '#F2F4F7'
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemBottomContainer: {
        width: '100%',
        height: 40,
        backgroundColor: '#F2F4F7',
        flexDirection: 'column',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    itemBottomContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch'
    },
    routeTextWidth: {
        width: '45%'
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    divider: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        height: 1
    },
    errIcon: {
        position: 'absolute',
        right: -5,
        bottom: -5
    }
})

const LocationItem = ({ item, itemClick, containerStyle = null }: LocationProps) => {
    return (
        <TouchableOpacity
            activeOpacity={1}
            style={[styles.teamItem, item.index === 0 ? commonStyle.marginTop_20 : null, containerStyle]}
        >
            <View style={[styles.teamItem_without_border]}>
                <View style={commonStyle.size_60}>
                    {item.item.isPepsi ? (
                        <IMG_PEPSI_LOGO style={styles.imgUserImage} />
                    ) : (
                        <IMG_STORE_PLACEHOLDER style={styles.imgUserImage} />
                    )}
                </View>
                {renderAddressContent(item)}
                <TouchableOpacity
                    onPress={() => itemClick(`${item.item.name}  ${item.item.address} ${item.item.cityStateZip}`)}
                    hitSlop={commonStyle.hitSlop}
                >
                    <CText style={[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]}>
                        {t.labels.PBNA_MOBILE_ADD}
                    </CText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default LocationItem
