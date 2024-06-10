/*
 * @Author: fangfang ji
 * @Date: 2021-12-20
 * @LastEditTime: 2022-12-06 16:20:30
 * @FilePath: /Halo_Mobile/src/components/merchandiser/ScheduleVisitCard.tsx
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import Utils from '../../../common/DateTimeUtils'
import CText from '../../../../common/components/CText'
import IMG_PEPSICO from '../../../../../assets/image/Icon-store-placeholder.svg'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { t } from '../../../../common/i18n/t'
import CCheckBox from '../../../../common/components/CCheckBox'
import { commonStyle as CommonStyle } from '../../../../common/styles/CommonStyle'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import moment from 'moment'
import { DispatchActionTypeEnum } from '../../../enums/Manager'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import CommonTooltip from '../../common/CommonTooltip'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
const styles = StyleSheet.create({
    iconXXL: {
        width: 50,
        height: 50
    },
    boxWithShadow: {
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22,
        shadowColor: '#004C97',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        elevation: 5,
        // shadowRadius: 10,
        borderRadius: 6,
        marginBottom: 17
    },

    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        paddingTop: 26,
        paddingBottom: 26,
        alignItems: 'flex-start',
        flexGrow: 1
    },
    box: {
        overflow: 'hidden',
        borderRadius: 6
    },
    userInfo: {
        alignItems: 'flex-end',
        flex: 0.4,
        flexDirection: 'column'
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column'
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    location: {
        shadowColor: 'rgba(108, 12, 195, 0.8)',
        borderColor: 'rgba(108, 12, 195, 0.8)',
        borderWidth: 0,
        borderTopWidth: 0,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5
    },

    imageGroup: {
        marginRight: 15,
        position: 'relative'
    },
    status: {
        position: 'absolute',
        bottom: 0,
        height: 22,
        width: 22,
        right: 0
    },
    eImgPortrait: {
        width: 20,
        height: 20,
        borderRadius: 4
    },
    userNameText: {
        fontSize: 12,
        borderRadius: 4
    },
    nameText: {
        textAlign: 'right',
        fontSize: 12,
        color: '#565656'
    },
    addressUse: {
        fontSize: 12,
        color: '#565656'
    },
    complete: {
        backgroundColor: '#F2F4F7'
    },
    addressUseSub: {
        fontSize: 12,
        color: '#565656',
        marginTop: 0
    },
    pillContainer: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: -10
    },
    pillView: {
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginRight: 8,
        height: 20,
        borderColor: '#565656',
        borderWidth: 1,
        borderRadius: 10
    },
    pillText: {
        color: '#565656',
        fontSize: 12,
        fontWeight: '700'
    },
    timeText: {
        fontSize: 12,
        color: '#000'
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    grayText: {
        color: '#565656',
        fontSize: 12
    },
    rowCon: { flexDirection: 'row', paddingHorizontal: 22, height: 40, backgroundColor: '#F2F4F7' },
    horLineContainer: { height: 1, backgroundColor: '#F2F4F7' },
    horLine: { marginHorizontal: 22, height: 1, backgroundColor: '#fff' },
    numberContainer: { paddingLeft: 18, flex: 1 },
    marginBottom: { marginBottom: 6 },
    orderDataWrap: {
        backgroundColor: '#F2F4F7',
        paddingVertical: 10,
        flexDirection: 'row',
        marginTop: 15,
        paddingHorizontal: 6
    },
    bold12font: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
    moreBtnDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#000000', marginBottom: 4 },
    moreBtn: { flexDirection: 'column', width: 33, height: 33, justifyContent: 'center', alignItems: 'center' },
    tooltipContainer: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 0
    },
    tooltipTap: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000'
    },
    padding14: {
        padding: 14
    },
    paddingandwidth: {
        paddingHorizontal: 14,
        width: '100%'
    },
    linestyle: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    tool: {
        width: 100,
        height: 100,
        backgroundColor: 'red'
    },
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        marginRight: -10
    },
    imgCalendar: {
        width: 20,
        height: 18,
        marginRight: 5
    },
    imgClock: {
        width: 19,
        height: 19,
        marginRight: 5
    },
    dispatchCon: { paddingHorizontal: 22, backgroundColor: '#F2F4F7', paddingTop: 15, paddingBottom: 10 },
    redExclamationIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0
    },
    orderNumberContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10
    },
    dispatchCompContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5
    },
    marginRight_5: {
        marginRight: 5
    }
})
export interface IDelOrderItemProps {
    item: IDelOrderItemData
    onItemPress: (item: IDelOrderItemData) => void
    onOperationBtnPress: (item: IDelOrderItemData) => void
    actionClick: any
    isEdit?: boolean
    handleCheckBoxClick?: any
    select?: boolean
    actionArr?: Array<string>
    tooltipHeight: any
    navigation?: any
}
export interface IDelOrderItemData {
    AccountName: string
    COF: string
    OrderDlvryRqstdDtm: string
    Id: string
    OrderNumber: string
    RetailStoreCity: string
    RetailStoreCountry: string
    RetailStoreName: string
    RetailStorePostalCode: string
    RetailStoreState: string
    RetailStoreStreet: string
    DispatchActions?: Array<any>
    OffSchedule: '1' | '0'
    fountainCount: number
    DeliveryMethodCode: string
    deliveryMethod: string
    TotalOrdered: string
    bcCount: number
    otherCount: number
    volume: number
}
const getAddressBy = (street, postalCode, city, state, country) => {
    return `${street} ${city}, ${state} ${postalCode} ${country}`
}

/*
6.1 iteration, we set xxx field value as mock data, we will update these fields population logic in future
*/
export const renderOrderData = (item) => {
    return (
        <View style={styles.orderDataWrap}>
            <View style={styles.numberContainer}>
                <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_VOLUME}</CText>
                <CText style={styles.bold12font}>{_.isNumber(item.volume) ? Math.round(item.volume) : '--'}</CText>
            </View>
            <View style={styles.numberContainer}>
                <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_BC}</CText>
                <CText style={styles.bold12font}>
                    {_.isNumber(_.toNumber(item.bcCount)) ? Math.round(_.toNumber(item.bcCount)) : '--'}
                </CText>
            </View>
            <View style={styles.numberContainer}>
                <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_FOUNTAIN}</CText>
                <CText style={styles.bold12font}>{item.fountainCount ? Math.round(item.fountainCount) : '--'}</CText>
            </View>
            <View style={styles.numberContainer}>
                <CText style={[styles.grayText, styles.marginBottom]}>
                    {_.capitalize(t.labels.PBNA_MOBILE_OTHERS)}
                </CText>
                <CText style={styles.bold12font}>{item.otherCount ? Math.round(item.otherCount) : '--'}</CText>
            </View>
        </View>
    )
}

const DelOrderItem = (props: IDelOrderItemProps) => {
    const {
        item,
        actionArr,
        onOperationBtnPress,
        actionClick,
        isEdit,
        select,
        handleCheckBoxClick,
        tooltipHeight,
        navigation
    } = props
    const address = getAddressBy(
        item.RetailStoreStreet,
        item.RetailStorePostalCode,
        item.RetailStoreCity,
        item.RetailStoreState,
        item.RetailStoreCountry
    )
    const redExclamationIconSize = 20
    const PallTypeMap = {
        'Large Pallet': t.labels.PBNA_MOBILE_LARGE_PALLET,
        'Half Pallet': t.labels.PBNA_MOBILE_HALF_PALLET
    }
    const timeZoneName = CommonParam.userTimeZone ? ` (${moment().tz(CommonParam.userTimeZone).zoneName()})` : ''

    const renderCenterInfo = () => {
        return (
            <View style={[styles.boxContentTextArea, { flex: 1 }]}>
                <View>
                    <View style={styles.contentText}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={styles.itemTile}>
                            {item.AccountName}
                        </CText>
                    </View>
                </View>
                <View>
                    <View style={styles.contentText}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUse]}>
                            {address}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }
    const renderOrderNumber = () => {
        return (
            <View style={styles.orderNumberContainer}>
                <View style={styles.numberContainer}>
                    <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_ORDER_NUMBER}</CText>
                    <CText>{item.OrderNumber}</CText>
                </View>
                <View style={styles.numberContainer}>
                    <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}</CText>
                    <CText>{item.COF || '--'}</CText>
                </View>
                <View style={styles.numberContainer}>
                    <CText style={[styles.grayText, styles.marginBottom]}>{t.labels.PBNA_MOBILE_DELIVERY_METHOD}</CText>
                    <CText numberOfLines={1}>{item.deliveryMethod}</CText>
                </View>
            </View>
        )
    }

    const reshedule = () => {
        return (
            <View style={CommonStyle.fullWidth}>
                {actionArr.map((item: string, index) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                actionClick && actionClick(item)
                            }}
                            key={item}
                        >
                            <View style={styles.padding14}>
                                <CText style={styles.tooltipTap}>{item}</CText>
                            </View>
                            {index !== actionArr.length - 1 && (
                                <View style={styles.paddingandwidth}>
                                    <View style={styles.linestyle} />
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }
    const renderBottomInfo = () => {
        const { DispatchActions } = item
        const timeFormat = TIME_FORMAT.HHMMA
        if (DispatchActions.length === 0) {
            return <View />
        }
        return (
            <View style={styles.dispatchCon}>
                {DispatchActions.map((item: any) => {
                    return (
                        <View key={item?.Id} style={styles.dispatchCompContainer}>
                            {item?.Dispatch_Action__c === DispatchActionTypeEnum.ORDER_SPECIFIC_TIME_WINDOW && (
                                <>
                                    <Image source={ImageSrc.IMG_CLOCK_BLUE} style={styles.imgClock} />
                                    <View>
                                        <CText>
                                            {t.labels.PBNA_MOBILE_DOCK_START_TIME}{' '}
                                            {formatWithTimeZone(item.Dock_Start_Time__c, timeFormat, true, false)}
                                            {timeZoneName}
                                        </CText>
                                        <CText>
                                            {t.labels.PBNA_MOBILE_DOCK_END_TIME}{' '}
                                            {formatWithTimeZone(item.Dock_End_Time__c, timeFormat, true, false)}
                                            {timeZoneName}
                                        </CText>
                                    </View>
                                </>
                            )}
                            {item?.Dispatch_Action__c === DispatchActionTypeEnum.GEO_PALLET_OVERRIDE && (
                                <CText>
                                    {t.labels.PBNA_MOBILE_GEO_PALLET_OVERRIDE}{' '}
                                    {t.labels.PBNA_MOBILE_TO.toLocaleLowerCase()}: {PallTypeMap[item.Pallet_Type__c]}
                                </CText>
                            )}
                            {item?.Dispatch_Action__c === DispatchActionTypeEnum.DELETE && (
                                <>
                                    <BlueClear height={18} width={18} style={styles.marginRight_5} />
                                    <CText>{t.labels.PBNA_MOBILE_ORDER_DELETE_MESSAGE}</CText>
                                </>
                            )}
                            {item?.Dispatch_Action__c === DispatchActionTypeEnum.RESCHEDULE && (
                                <>
                                    <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                                    <CText>
                                        {t.labels.PBNA_MOBILE_RESCHEDULE} {t.labels.PBNA_MOBILE_TO.toLocaleLowerCase()}{' '}
                                        {moment(item.New_Delivery_Date__c).format(TIME_FORMAT.DDD_MMM_D_YYYY)}
                                    </CText>
                                </>
                            )}
                        </View>
                    )
                })}
            </View>
        )
    }

    const goToDetail = () => {
        navigation?.navigate('OrderInformation', { orderId: item.Id })
    }

    return (
        <TouchableOpacity onPress={goToDetail}>
            <View style={[styles.boxContent]}>
                <View style={styles.imageGroup}>
                    <IMG_PEPSICO style={styles.iconXXL} />
                    {item.OffSchedule === '1' && (
                        <RedExclamation
                            width={redExclamationIconSize}
                            height={redExclamationIconSize}
                            style={styles.redExclamationIcon}
                        />
                    )}
                </View>
                {renderCenterInfo()}
                {isEdit ? (
                    <CCheckBox
                        hitSlop={CommonStyle.hitSlop}
                        onPress={() => handleCheckBoxClick && handleCheckBoxClick()}
                        checked={select}
                        containerStyle={styles.checkBoxItem}
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            onOperationBtnPress && onOperationBtnPress(item)
                        }}
                    >
                        <CommonTooltip tooltip={reshedule()} width={240} height={tooltipHeight}>
                            <View style={styles.moreBtn}>
                                <View style={styles.moreBtnDot} />
                                <View style={styles.moreBtnDot} />
                                <View style={styles.moreBtnDot} />
                            </View>
                        </CommonTooltip>
                    </TouchableOpacity>
                )}
            </View>
            {renderOrderNumber()}
            {renderOrderData(item)}
            {renderBottomInfo()}
        </TouchableOpacity>
    )
}

export default DelOrderItem
