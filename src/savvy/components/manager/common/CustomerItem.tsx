/**
 * @description Customer list component.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-30
 */
import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'
import { Divider } from 'react-native-elements'
import PhoneIcon from '../../common/PhoneIcon'
import { CommonLabel } from '../../../enums/CommonLabel'
import UserAvatar from '../../common/UserAvatar'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import { callByPhone } from '../../../../common/utils/LinkUtils'

const IMG_LOCATION = ImageSrc.ICON_LOCATION
interface CustomerProps {
    item?: any
    itemClick?: Function
    showIcon?: boolean
    isClickable?: boolean
    isSwipeable?: boolean
    isMultiAdd?: boolean
    handleCAdd?: Function
    containerStyle?: any
    showBottomView?: boolean
    touchable?: boolean
    showErr?: boolean
    showUnassigned?: boolean
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
    paddingTop_10: {
        paddingTop: 10
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
    },
    iconSize: {
        width: 26,
        height: 26,
        resizeMode: 'contain'
    },
    checkMarkSize: {
        ...commonStyle.size_24
    }
})

const renderPhoneView = (params) => {
    const { showIcon, item, itemClick } = params
    if (showIcon) {
        const isValidPhone = item?.item?.phone?.length > 0
        return (
            <View>
                <TouchableOpacity
                    hitSlop={{ left: 20, right: 20, bottom: 20 }}
                    onPress={() => (item?.item?.phone ? callByPhone(item?.item?.phone) : null)}
                >
                    <PhoneIcon isDisabled={!isValidPhone} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={commonStyle.marginTop_20}
                    hitSlop={{ left: 20, right: 20, bottom: 20 }}
                    onPress={() => {
                        itemClick && itemClick(item?.item, CommonLabel.CUSTOMER_ITEM_CLICK_LOCATION)
                    }}
                >
                    <Image style={[styles.imgLocation]} source={IMG_LOCATION} />
                </TouchableOpacity>
            </View>
        )
    }
    return null
}

const renderItemBottomView = (item, isClickable) => {
    return (
        <View style={styles.itemBottomContainer}>
            {!isClickable && <Divider style={styles.divider} />}
            <View style={styles.itemBottomContent}>
                <View style={[styles.rowCenter, commonStyle.routeTextWidth]}>
                    <UserAvatar
                        userStatsId={item?.item?.userStatsId}
                        firstName={item?.item?.firstName}
                        lastName={item?.item?.lastName}
                        avatarStyle={styles.imgBottomUserImage}
                        userNameText={{ fontSize: 12 }}
                    />
                    <View style={[styles.marginLeft_10]}>
                        <CText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[styles.fontColor_gary, styles.fontSize_12, styles.fontWeight_400]}
                        >
                            {item?.item?.userName}
                            {_.isEmpty(item?.item?.userName) && (
                                <CText style={[styles.fontWeight_700, styles.fontColor_black]}>-</CText>
                            )}
                        </CText>
                    </View>
                </View>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_gary,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth,
                        commonStyle.textAlignRight
                    ]}
                >
                    {t.labels.PBNA_MOBILE_SALES_ROUTE}
                    <CText style={[styles.fontWeight_700, styles.fontColor_black]}>
                        {' '}
                        {item?.item?.salesRoute || '-'}
                    </CText>
                </CText>
            </View>
        </View>
    )
}

const formatCityStateZip = (cityStateZip) => {
    if (cityStateZip) {
        const array = cityStateZip.split(',')
        const city = array[0].split(' ')

        const newZip = []
        for (const str of city) {
            const newStr = str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
            if (!_.isEmpty(newStr)) {
                newZip.push(newStr)
            }
        }
        const newCityStateZip = !_.isEmpty(newZip) ? newZip.join(' ') + ',' : ''
        return newCityStateZip.concat(array[1] || '')
    }
    return ''
}

export const renderAddressContent = (item) => {
    return (
        <View style={[styles.itemContentContainer]}>
            <CText
                style={[styles.fontColor_black, styles.fontWeight_900, styles.fontSize_18, styles.paddingTop_10]}
                numberOfLines={2}
            >
                {item?.item?.name}
            </CText>
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                <CText
                    style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                >
                    {item?.item?.address}
                </CText>
            </View>
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                <CText
                    style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                >
                    {formatCityStateZip(item?.item?.cityStateZip)}
                </CText>
            </View>
        </View>
    )
}

const renderMultiAdd = (params) => {
    const { isMultiAdd, item, handleCAdd } = params

    if (isMultiAdd) {
        return (
            <View>
                <TouchableOpacity onPress={() => handleCAdd(item.item)} hitSlop={commonStyle.hitSlop}>
                    {item.item.isSelected ? (
                        <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.checkMarkSize} />
                    ) : (
                        <CText style={[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]}>
                            {t.labels.PBNA_MOBILE_ADD}
                        </CText>
                    )}
                </TouchableOpacity>
            </View>
        )
    }
}

const CustomerItem = ({
    item,
    itemClick,
    showIcon = false,
    isClickable = true,
    touchable = true,
    isSwipeable = false,
    isMultiAdd = false,
    handleCAdd,
    containerStyle = null,
    showBottomView = true,
    showErr = false,
    showUnassigned = false
}: CustomerProps) => {
    console.log('Item' + JSON.stringify(item))
    return (
        <TouchableOpacity>
            <View style={[styles.teamItem_without_border, !isClickable ? styles.disabledItem : null]}>
                <View style={commonStyle.size_60}>
                    {/* <IMG_STORE_PLACEHOLDER style={styles.imgUserImage} />
                    {showErr && item?.item?.isError && item?.item?.unassignedVisitCount === 0 && (
                        <RedExclamation width={26} height={26} style={styles.errIcon} />
                    )}
                    {showUnassigned && item?.item?.unassignedVisitCount > 0 && (
                        <Image source={ImageSrc.ICON_UNASSIGNED_BADGE} style={[styles.errIcon, styles.iconSize]} />
                    )} */}
                    <Image source={ImageSrc.ICON_UNASSIGNED_BADGE} style={[styles.imgUserImage]} />
                </View>
                {/* {renderAddressContent(item)}
                {renderPhoneView({ showIcon, item, itemClick })}
                {renderMultiAdd({ isMultiAdd, item, handleCAdd })} */}
                <View style={{ flexDirection: 'column' , padding:10}}>
                    <Text>{item?.item?.Name}</Text>
                    <Text>Profile {item?.item['Profile.Name']}</Text>
                </View>
            </View>
            {/* {showBottomView && renderItemBottomView(item, isClickable)} */}
        </TouchableOpacity>
    )
}

export default CustomerItem
