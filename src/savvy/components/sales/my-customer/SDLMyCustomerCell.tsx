/*
 * @Description: My Customer Cell
 * @Author: Yi Li
 * @Date: 2021-11-29 00:42:06
 * @LastEditTime: 2023-01-09 15:10:41
 * @LastEditors: Yi Li
 */

import React, { FC } from 'react'
import { Linking, StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import _ from 'lodash'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import PhoneIcon from '../../common/PhoneIcon'
import UserAvatar from '../../common/UserAvatar'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { SDLMyCustomerCellModel } from './SDLMyCustomerModel'
import MyCustomersStyle from '../../../styles/manager/MyCustomersStyle'
import CustomerDetailStyle from '../../../styles/manager/CustomerDetailStyle'
import { wStatusView } from '../../manager/my-customers/CustomerDetail'
import { t } from '../../../../common/i18n/t'
import LocationService from '../../../service/LocationService'
import { renderCDAStoreIcon, renderNetRevPercent } from '../../rep/customer/CustomerListTile'
import LocationIconGray from '../../../../../assets/image/icon_location-1.svg'
import { baseStyle } from '../../../../common/styles/BaseStyle'

interface SDLMyCustomerCellProps {
    cRef
    navigation?
    onPressCell?
    itemModal: SDLMyCustomerCellModel
    isClickable?
    isEmployeeProfile?: boolean
    showDistance?: boolean
}

const styles = StyleSheet.create({
    ...MyCustomersStyle,
    ...CustomerDetailStyle,
    teamItem: {
        marginTop: 12,
        marginBottom: 10,
        backgroundColor: 'white',
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 140,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    fontColor_black: {
        color: '#000000'
    },
    fontWeight_900: {
        fontWeight: '900'
    },
    fontSize_18: {
        fontSize: 18
    },
    imgBottomUserImage: {
        width: 26,
        height: 26,
        borderRadius: 4
    },
    itemBottomContent: {
        flex: 1,
        marginHorizontal: 1,
        marginBottom: 1,
        paddingHorizontal: 14,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderRadius: 6,
        backgroundColor: '#F2F4F7'
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    hitSlop: {
        left: 20,
        right: 20,
        bottom: 20
    },
    daysViewRowItemDayItemView: {
        flexDirection: 'row',
        marginTop: 4
    },
    valueStyle: {
        color: '#565656',
        paddingTop: 4,
        fontSize: 12
    },
    storeImageContainer: {
        width: 60,
        height: 60
    },
    customerIdStyle: {
        marginTop: 5,
        fontSize: 12,
        color: '#000000',
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    distanceView: {
        marginHorizontal: 22,
        marginBottom: 5
    },
    distanceLabel: {
        fontSize: 12,
        color: baseStyle.color.titleGray
    },
    distanceValue: {
        color: baseStyle.color.black
    }
})

const renderTailText = (textString?: string, textStyle?: any, contentView?: any) => {
    return (
        <CText numberOfLines={1} ellipsizeMode="tail" style={textStyle}>
            {textString}
            {contentView}
        </CText>
    )
}

const renderItemBottomView = (item: SDLMyCustomerCellModel) => {
    return (
        <View style={styles.itemBottomContent}>
            <View style={[styles.rowCenter, commonStyle.routeTextWidth]}>
                <UserAvatar
                    userStatsId={item?.UserStatsId}
                    firstName={item?.firstName}
                    lastName={item?.lastName}
                    avatarStyle={styles.imgBottomUserImage}
                    userNameText={{ fontSize: 12 }}
                />
                <View style={[styles.marginLeft_10]}>
                    {renderTailText(
                        item?.userName,
                        [styles.fontColor_gary, styles.fontSize_12, styles.fontWeight_400],
                        _.isEmpty(item?.userName) && (
                            <CText style={[styles.fontWeight_700, styles.fontColor_black]}>-</CText>
                        )
                    )}
                </View>
            </View>
            {renderTailText(
                t.labels.PBNA_MOBILE_SALES_ROUTE,
                [
                    styles.fontColor_gary,
                    styles.fontSize_12,
                    styles.fontWeight_400,
                    commonStyle.routeTextWidth,
                    commonStyle.textAlignRight
                ],
                <CText style={[styles.fontWeight_700, styles.fontColor_black]}> {item?.salesRoute || '-'}</CText>
            )}
        </View>
    )
}

const renderItemBottomWeekly = (item) => {
    return (
        <View style={styles.itemBottomContent}>
            <View style={[styles.rowCenter, styles.daysViewRowItemDayItemView]}>
                {item.ctrOrderDay?.map((wStatus, index) => {
                    return wStatusView(wStatus, index, styles.fontSize_12)
                })}
            </View>
            <CText style={styles.valueStyle}>{item.ctrFrequency || ''}</CText>
        </View>
    )
}

const renderPhoneAndLocationView = (item: SDLMyCustomerCellModel) => {
    const isValidPhone = item?.phone?.length > 0
    return (
        <View>
            <TouchableOpacity
                hitSlop={styles.hitSlop}
                disabled={!isValidPhone}
                onPress={() => (item?.phone ? Linking.openURL(`tel:${item?.phone}`) : null)}
            >
                <PhoneIcon isDisabled={!isValidPhone} />
            </TouchableOpacity>
            {!_.isEmpty(item?.latitude?.toString()) && !_.isEmpty(item?.longitude?.toString()) ? (
                <TouchableOpacity
                    style={commonStyle.marginTop_20}
                    hitSlop={styles.hitSlop}
                    onPress={async () => {
                        const currentLocation = await LocationService.getCurrentPosition()
                        LocationService.gotoLocation(currentLocation.coords, {
                            latitude: item?.latitude,
                            longitude: item?.longitude
                        })
                    }}
                >
                    <Image style={[styles.imgLocation]} source={ImageSrc.ICON_LOCATION} />
                </TouchableOpacity>
            ) : (
                <LocationIconGray style={commonStyle.marginTop_20} />
            )}
        </View>
    )
}

const renderAddressContent = (item: SDLMyCustomerCellModel) => {
    return (
        <View style={[styles.itemContentContainer]}>
            <CText style={[styles.fontColor_black, styles.fontWeight_900, styles.fontSize_18]} numberOfLines={2}>
                {item?.title}
            </CText>
            {item?.CUST_UNIQ_ID_VAL__c && (
                <CText style={styles.customerIdStyle}>{`#${item?.CUST_UNIQ_ID_VAL__c}`}</CText>
            )}
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                {renderTailText(item?.subTitle, [styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12])}
            </View>
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                {renderTailText(item?.contentTitle, [styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12])}
            </View>
        </View>
    )
}

const SDLMyCustomerCell: FC<SDLMyCustomerCellProps> = (props: SDLMyCustomerCellProps) => {
    const { onPressCell, itemModal, isClickable, isEmployeeProfile = false, showDistance } = props
    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    if (isClickable) {
                        onPressCell && onPressCell()
                    }
                }}
                style={styles.teamItem}
            >
                <View style={styles.teamItem_without_border}>
                    <View>
                        <View style={styles.storeImageContainer}>
                            {itemModal['Account.IsOTSCustomer__c'] === '1' ? (
                                renderCDAStoreIcon('')
                            ) : (
                                <IMG_STORE_PLACEHOLDER style={styles.imgUserImage} />
                            )}
                        </View>
                        {itemModal?.Delta_Revenue_Percentage__c &&
                            renderNetRevPercent(itemModal?.Delta_Revenue_Percentage__c)}
                    </View>
                    {renderAddressContent(itemModal)}
                    {renderPhoneAndLocationView(itemModal)}
                </View>
                {isEmployeeProfile ? renderItemBottomWeekly(itemModal) : renderItemBottomView(itemModal)}
            </TouchableOpacity>
            {showDistance && (
                <View style={styles.distanceView}>
                    <CText style={styles.distanceLabel}>
                        {t.labels.PBNA_MOBILE_DISTANCE}{' '}
                        <CText style={styles.distanceValue}>{itemModal?.distanceFromMe?.toFixed(1)}</CText>
                    </CText>
                </View>
            )}
        </>
    )
}
export default SDLMyCustomerCell
