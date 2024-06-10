import React, { FC, useRef, useState } from 'react'
import {
    View,
    SectionList,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    RefreshControl,
    Dimensions
} from 'react-native'
import { formatWithTimeZone, isTodayDayWithTimeZone, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import CText from '../../../common/components/CText'
import VisitActionBlock from './VisitActionBlock'
import { baseStyle } from '../../../common/styles/BaseStyle'
import moment from 'moment'
import { VisitStatus } from '../../enum/VisitType'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import VisitService from '../../service/VisitService'
import { NavigationProp } from '@react-navigation/native'
import MeetingList from './MeetingList'
import {
    showExistProductAlert,
    showExistInProgressVisitAlert,
    showRemoveVisitAlert,
    formatClock,
    RemoveVisitFucProp,
    useMyDayCartClickable
} from '../../utils/VisitUtils'
import { CommonParam } from '../../../common/CommonParam'
import { getRound } from '../../utils/CommonUtil'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { MyDayVisitListModel, VisitList } from '../../interface/VisitListModel'
import { appendLog, storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import { SwipeRow } from 'react-native-swipe-list-view'
import _ from 'lodash'
import dayjs from 'dayjs'
import { renderGreenCheck, renderStoreIcon } from './CustomerCard'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import ActionCellView from './ActionCellView'
import CartService from '../../service/CartService'

const screenHeight = Dimensions.get('window').height

interface MyDaySectionListRowInterface {
    item: MyDayVisitModel
    navigation: NavigationProp<any>
    setIsShowRemoveVisitModal: Function
    removedStore: React.RefObject<string>
    rowRefs: React.RefObject<Object>
    setNeedRefresh: Function
    isToday: boolean
    setMyDayScrollEnabled: Function
    dropDownRef: any
    selectedDate: string
    setSelectedDate: Function
    myDayCardClickable: boolean
    setMyDayCardClickable: Function
    isRouteInfo?: boolean
}

const styles = StyleSheet.create({
    ...commonStyle,
    flexPadding: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    titleAndTimeView: {
        display: 'flex',
        flexDirection: 'row'
    },
    status: {
        position: 'absolute',
        bottom: 0,
        height: 26,
        width: 26,
        right: 0
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    grayText: {
        color: '#565656',
        fontSize: 12,
        fontFamily: 'Gotham'
    },
    timeTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    sectionList: {
        paddingTop: 20
    },
    visitAndOrderInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    visitAndOrderInfoLine: {
        width: 1,
        height: 10,
        backgroundColor: '#565656',
        marginHorizontal: 10
    },
    iconXXL: {
        width: 58,
        height: 58
    },
    whiteLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#FFF'
    },
    orderDeliveryText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000000'
    },
    boxWithShadow: {
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 12,
        borderRadius: 6
    },
    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    boxContent_bcd: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        alignItems: 'center',
        flexGrow: 1
    },
    boxContentDisabled: {
        backgroundColor: '#F2F4F7'
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
    rowCon: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        height: 40,
        backgroundColor: '#F2F4F7'
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start',
        fontFamily: 'Gotham'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start',
        fontFamily: 'Gotham'
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
        position: 'relative',
        alignSelf: 'flex-start'
    },
    addressUse: {
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Gotham'
    },
    complete: {
        backgroundColor: '#F2F4F7'
    },
    addressUseSub: {
        fontSize: 12,
        color: '#565656',
        marginTop: 0,
        fontFamily: 'Gotham'
    },
    timeText: {
        fontSize: 12,
        color: '#000',
        fontFamily: 'Gotham'
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    newFlag: {
        borderTopLeftRadius: 5,
        borderBottomEndRadius: 21,
        backgroundColor: '#2DD36F',
        minWidth: 45,
        height: 22,
        position: 'absolute',
        top: -1
    },
    newFlagText: {
        fontSize: 12,
        fontWeight: '700',
        color: baseStyle.color.white,
        textTransform: 'uppercase'
    },
    pillContainer: {
        borderWidth: 1,
        borderColor: baseStyle.color.titleGray,
        borderRadius: 10,
        width: 60,
        height: 20
    },
    headerWrap: {
        position: 'relative',
        marginHorizontal: baseStyle.margin.mg_22
    },
    headerContent: {
        position: 'relative',
        zIndex: 2,
        paddingHorizontal: 18,
        marginVertical: 18,
        backgroundColor: baseStyle.color.bgGray,
        maxWidth: '80%'
    },
    headerLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: '48%',
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.black
    },
    sectionSeparator: {
        height: 16
    },
    paddingBottomSectionEmpty: {
        paddingBottom: 30
    },
    paddingBottomSection: {
        paddingTop: baseStyle.padding.pd_20,
        paddingBottom: 30
    },
    swipeRowBackgroundContainer: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 22
    },
    swipeRowInnerContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#EB445A'
    },
    swipeRowButton: {
        height: '100%',
        width: 90,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    swipeRowButtonText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700'
    },
    swipeRowContainer: {
        backgroundColor: '#F2F4F7',
        marginRight: 22,
        marginLeft: 22
    },
    orderNum: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 7
    },
    deliveryOrderFooterRow: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 14
    },
    orderNumText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000'
    }
})

const renderStartEndTime = (
    time: string,
    selectedDate: string,
    isHeader: boolean,
    title: string,
    hasRouteId: boolean
) => {
    if (isHeader) {
        const dateDisplayTime = time || selectedDate
        const hasDayStarted = time
        // if display time, we need to format with timezone
        // if display selectedData, is already in user timezone
        const needFormatWithTimeZone = !!time
        const isPast = dayjs(selectedDate).isBefore(dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD))
        const showTitle = !_.isEmpty(hasDayStarted)
        if (!isPast) {
            return (
                <View>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleAndTimeView}>
                            {showTitle && (
                                <>
                                    <CText style={styles.headerTitle}>{title} </CText>
                                    <CText style={styles.timeTitle}>
                                        {formatWithTimeZone(time, TIME_FORMAT.HHMMA, true, false) + ' '}
                                    </CText>
                                </>
                            )}
                            <CText style={styles.headerTitle}>
                                {(hasDayStarted ? '| ' : '') +
                                    formatWithTimeZone(
                                        dateDisplayTime,
                                        TIME_FORMAT.DDD,
                                        needFormatWithTimeZone,
                                        false
                                    ) +
                                    ', ' +
                                    formatWithTimeZone(
                                        dateDisplayTime,
                                        TIME_FORMAT.MMM_DD_YYYY,
                                        needFormatWithTimeZone,
                                        false
                                    )}
                            </CText>
                            {hasRouteId && (
                                <CText style={[styles.headerTitle, { maxWidth: 130 }]} numberOfLines={1}>
                                    {' | ' +
                                        t.labels.PBNA_MOBILE_ORDERING_ROUTE +
                                        ' ' +
                                        `${CommonParam.userRouteGTMUId}`}
                                </CText>
                            )}
                        </View>
                    </View>
                </View>
            )
        }
        return (
            <View>
                <View style={[styles.sectionHeader, { flexDirection: 'column' }]}>
                    <View style={styles.titleAndTimeView}>
                        {showTitle && (
                            <>
                                <CText style={styles.headerTitle}>{title} </CText>
                                <CText style={styles.timeTitle}>
                                    {formatWithTimeZone(time, TIME_FORMAT.HHMMA, true, false) + ' '}
                                </CText>
                            </>
                        )}
                        <CText style={styles.headerTitle}>
                            {(hasDayStarted ? '| ' : '') +
                                formatWithTimeZone(dateDisplayTime, TIME_FORMAT.DDD, needFormatWithTimeZone, false) +
                                ', ' +
                                formatWithTimeZone(
                                    dateDisplayTime,
                                    TIME_FORMAT.MMM_DD_YYYY,
                                    needFormatWithTimeZone,
                                    false
                                )}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }
    const isSameDay = moment(selectedDate).isSame(time, 'date')
    return (
        <View style={!isHeader && { marginTop: -17 }}>
            <View style={styles.sectionHeader}>
                <View style={styles.titleAndTimeView}>
                    <CText style={styles.headerTitle}>{title} </CText>
                    <CText style={styles.timeTitle}>
                        {formatWithTimeZone(time, TIME_FORMAT.HHMMA, true, false) + ' '}
                    </CText>
                    {!isSameDay && (
                        <CText style={styles.headerTitle}>
                            {'| ' +
                                formatWithTimeZone(time, TIME_FORMAT.DDD, true, false) +
                                ', ' +
                                formatWithTimeZone(time, TIME_FORMAT.MMM_DD_YYYY, true, false)}
                        </CText>
                    )}
                </View>
            </View>
        </View>
    )
}

const renderOrderPill = () => {
    return (
        <View style={[styles.pillContainer, styles.alignCenter, styles.marginTop_8]}>
            <CText style={[styles.font_12_700, styles.grayText]}>
                {t.labels.PBNA_MOBILE_ORDERING_ORDER.toUpperCase()}
            </CText>
        </View>
    )
}

const renderCenterInfo = (item: MyDayVisitModel) => {
    const cityStateZip = `${item.City ? item.City + ', ' : ''}${item.StateCode ? item.StateCode : ''}${
        item.PostalCode ? ' ' + item.PostalCode : ''
    } `
    return (
        <View style={[styles.boxContentTextArea, { flex: 1 }]}>
            <View style={commonStyle.flexRowSpaceCenter}>
                <View style={styles.contentText}>
                    <CText numberOfLines={3} ellipsizeMode="tail" style={styles.itemTile}>
                        {item?.StoreName ? item?.StoreName : 'PlaceHolder'}
                    </CText>
                </View>
            </View>
            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.font_12_700}>
                {t.labels.PBNA_MOBILE_NUMBER_SIGN + item.CustUniqId}
            </CText>
            <View style={commonStyle.flexRowSpaceCenter}>
                <View style={styles.contentText}>
                    <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUse]}>
                        {item.Street ? item.Street + ',' : ''}
                    </CText>
                    <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUseSub]}>
                        {cityStateZip}
                    </CText>
                </View>
            </View>
            {!item.isRouteInfo && renderOrderPill()}
        </View>
    )
}

const TimeRow = (props: any) => {
    const { time, duration } = props
    return (
        <View style={commonStyle.flexRowAlignCenter}>
            {time ? <CText style={styles.timeText}>{time}</CText> : <View />}
            {time ? <CText style={styles.line}> | </CText> : <View />}
            <CText style={styles.timeText}>{duration}</CText>
        </View>
    )
}

const DelQtyRow = (props: any) => {
    const { plt, cs, timeDes } = props
    return (
        <View style={[commonStyle.flexRowAlignCenter, styles.complete]}>
            <CText style={styles.grayText}>{timeDes} </CText>
            <CText style={styles.timeText}>
                {' '}
                {plt} {t.labels.PBNA_MOBILE_PLT.toLowerCase()}
            </CText>
            <CText style={styles.line}> | </CText>
            <CText style={styles.timeText}>
                {cs} {t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}
            </CText>
        </View>
    )
}

const renderDeliveryOrderFooter = (item: Partial<MyDayVisitModel>) => {
    const isSwitchBubble = item?.completedOrder === 0
    const plannedOrderNum = item.AdHoc ? 0 : item.VDelGroup && item.VDelGroup.length
    return (
        <>
            <View style={styles.whiteLine} />
            <View style={[styles.rowCon, styles.deliveryOrderFooterRow]}>
                <CText style={styles.orderDeliveryText}>{_.capitalize(t.labels.PBNA_MOBILE_DELIVERY_ORDERS)}</CText>
                {isSwitchBubble ? (
                    <View style={styles.orderNum}>
                        <CText style={styles.orderNumText}>{item.AdHoc ? 0 : plannedOrderNum || 0}</CText>
                    </View>
                ) : (
                    <CText style={styles.orderDeliveryText}>
                        {` ${t.labels.PBNA_MOBILE_COMPLETED} ${item?.completedOrder}/${
                            item?.AdHoc ? 0 : plannedOrderNum || 0
                        }`}
                    </CText>
                )}
            </View>
        </>
    )
}

const renderScheduleTimeFooter = (item, hideDelivery = false) => {
    if (item.Status !== VisitStatus.COMPLETE) {
        return <View />
    }
    const { ActualStartTime, ActualEndTime } = item
    const startTime = formatWithTimeZone(ActualStartTime, TIME_FORMAT.HHMMA, true, false)
    const endTime = item.ActualEndTime ? formatWithTimeZone(ActualEndTime, TIME_FORMAT.HHMMA, true, false) : ''
    const durationTime = startTime + (endTime && ' - ') + endTime
    const diff = moment.duration(
        moment(ActualEndTime).startOf('minute').diff(moment(ActualStartTime).startOf('minute'))
    )
    // Time limit is 99h59min
    const timeLimit = (99 * 60 * 60 + 59 * 60) * 1000
    const outputHours = Math.floor(diff.asHours()) > 99 ? 99 : Math.floor(diff.asHours())
    const outputMins =
        diff.asMilliseconds() > timeLimit ? '59+' : parseInt(moment.utc(diff.asMilliseconds()).format('mm'))
    const durationGap = formatClock({
        hour: outputHours,
        min: outputMins
    })

    return (
        <>
            <View style={styles.whiteLine} />
            <View style={[styles.rowCon]}>
                <TimeRow time={durationTime} duration={durationGap} />
                <View style={commonStyle.flex_1} />
                {!hideDelivery && (
                    <DelQtyRow
                        timeDes={t.labels.PBNA_MOBILE_SCHEDULED_QTY}
                        plt={item.SchPlt}
                        cs={getRound(item.SchCs, '0')}
                    />
                )}
            </View>
        </>
    )
}

const renderTimeFooter = (item) => {
    return <View>{renderScheduleTimeFooter(item, true)}</View>
}

const getVisitIcon = (item) => {
    if (item.Status === VisitStatus.COMPLETE) {
        return renderGreenCheck(baseStyle.color.bgGray)
    } else if (item.Status === VisitStatus.IN_PROGRESS) {
        return <Image style={styles.status} source={ImageSrc.ICON_LOCATION_CURRENT} />
    }
    return <View />
}

const renderNewFlag = (item: MyDayVisitModel) => {
    if (item.AdHoc) {
        return (
            <View style={[styles.newFlag, styles.alignCenter]}>
                <CText style={styles.newFlagText}>{t.labels.PBNA_MOBILE_IP_NEW}</CText>
            </View>
        )
    }
}

const navigateToDetail = async (
    item: MyDayVisitModel,
    navigation: NavigationProp<any>,
    isToday?: boolean,
    isFuture?: boolean
) => {
    try {
        // if there will be a popup
        // if there is an order
        const logMsg = `${CommonParam.GPID__c} has clicked on ${item.CustUniqId} customer card at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, 'orderade:clicked on customer card', logMsg)
        const storeInfo = await VisitService.getTodayVisitsWithOrderInProgress(item)
        if ((item.Status === VisitStatus.COMPLETE && !isFuture) || (!isFuture && !isToday)) {
            if (isToday) {
                if (item.User === CommonParam.userId) {
                    if (storeInfo.inProgressOrder) {
                        showExistProductAlert(storeInfo?.inProgressOrder['RS.Name'] as string)
                        return
                    }
                    // if there is other visit in progress
                    if (storeInfo.inProgressVisit) {
                        showExistInProgressVisitAlert(storeInfo.inProgressVisit['RS.Name'] as string)
                        return
                    }
                }
            }
            const cartData = await CartService.retrieveCartDataByOrderCartIdentifier(item)
            navigation.navigate('CompletedVisitScreen', {
                isToday: isToday,
                storeId: item.RetailStoreId,
                visit: item,
                cartData
            })
            return
        }
        const isAbleToView = isTodayDayWithTimeZone(item.VlDate)
        if (!isAbleToView) {
            return
        }
        if (storeInfo.inProgressOrder) {
            showExistProductAlert(storeInfo?.inProgressOrder['RS.Name'] as string)
            return
        }
        // if there is other visit in progress
        if (storeInfo.inProgressVisit) {
            showExistInProgressVisitAlert(storeInfo.inProgressVisit['RS.Name'] as string)
            return
        }
        if (isAbleToView) {
            navigation.navigate('BCDMyVisitDetail', {
                visitId: item.Id,
                storeId: item.RetailStoreId,
                visit: item
            })
        }
    } catch (err) {
        storeClassLog(Log.MOBILE_ERROR, '_onEnd', 'End My Day failed' + JSON.stringify(err))
    }
}

const isEventItem = (item: any) => {
    return item.attributes && item.attributes.type === 'Event'
}

const onRemovePress = (props: RemoveVisitFucProp) => {
    const {
        item,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    } = props
    showRemoveVisitAlert({
        item,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    })
}

const SwipeRowButton = (props: {
    opacity: Animated.Value
    item: Partial<MyDayVisitModel>
    setIsShowRemoveVisitModal: Function
    removedStore: React.RefObject<string>
    rowRefs: React.RefObject<Object>
    setNeedRefresh: Function
    dropDownRef: any
    setSelectedDate: Function
    navigation: NavigationProp<any>
}) => {
    const {
        opacity,
        item,
        removedStore,
        setIsShowRemoveVisitModal,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    } = props
    const curOpacity = opacity.interpolate({
        inputRange: [-90, 0],
        outputRange: [1, 0],
        extrapolate: 'extend'
    })
    return (
        <TouchableOpacity
            onPress={() =>
                onRemovePress({
                    item,
                    setIsShowRemoveVisitModal,
                    removedStore,
                    rowRefs,
                    setNeedRefresh,
                    dropDownRef,
                    setSelectedDate,
                    navigation
                })
            }
        >
            <Animated.View style={[styles.swipeRowButton, { opacity: curOpacity }]}>
                <CText style={styles.swipeRowButtonText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
            </Animated.View>
        </TouchableOpacity>
    )
}

const MyDaySwipeRowBackgroundLayer = (props: {
    buttonOpacity: Animated.Value
    item: Partial<MyDayVisitModel>
    setIsShowRemoveVisitModal: Function
    removedStore: React.RefObject<string>
    rowRefs: React.RefObject<Object>
    setNeedRefresh: Function
    dropDownRef: any
    setSelectedDate: Function
    navigation: NavigationProp<any>
}) => {
    const {
        buttonOpacity,
        item,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        dropDownRef,
        setSelectedDate,
        navigation
    } = props
    return (
        <View style={styles.swipeRowBackgroundContainer}>
            <View style={styles.swipeRowInnerContainer}>
                <SwipeRowButton
                    opacity={buttonOpacity}
                    item={item}
                    removedStore={removedStore}
                    setIsShowRemoveVisitModal={setIsShowRemoveVisitModal}
                    rowRefs={rowRefs}
                    setNeedRefresh={setNeedRefresh}
                    dropDownRef={dropDownRef}
                    setSelectedDate={setSelectedDate}
                    navigation={navigation}
                />
            </View>
        </View>
    )
}

const MyDaySwipeRowForegroundContentLayer = (props: {
    item: MyDayVisitModel
    navigation: NavigationProp<any>
    rowRefs: React.RefObject<Object>
    myDayCardClickable: boolean
    selectedDate: string
    isRouteInfo?: boolean
}) => {
    const { item, navigation, rowRefs, myDayCardClickable, selectedDate, isRouteInfo } = props
    const isFuture = dayjs(selectedDate).isAfter(new Date())
    const isToday = selectedDate === todayDateWithTimeZone(true)
    return (
        <View style={styles.swipeRowContainer}>
            <TouchableOpacity
                // Don't allow user to trigger card click action when dragging
                // This props is set by swipe row
                activeOpacity={1}
                onPress={() => {
                    if (!isRouteInfo) {
                        for (const key in rowRefs.current) {
                            if (key !== item._soupEntryId) {
                                // Disable typescript temporarily since it won't allow us to change the current value of the ref
                                // @ts-ignore
                                rowRefs?.current[key]?.closeRow && rowRefs?.current[key]?.closeRow()
                            }
                        }
                        if (myDayCardClickable) {
                            navigateToDetail(item, navigation, isToday, isFuture)
                        }
                    }
                }}
            >
                <View style={[styles.boxWithShadow, (item?.inGeoFence || item?.ASASCompliant) && styles.location]}>
                    <View
                        style={[styles.boxContent, item.Status === VisitStatus.COMPLETE && styles.boxContentDisabled]}
                    >
                        <View style={styles.imageGroup}>
                            {renderStoreIcon(item, styles.iconXXL, true)}
                            {!isRouteInfo && getVisitIcon(item)}
                        </View>
                        {renderCenterInfo(item)}
                        {<VisitActionBlock item={item} />}
                    </View>
                    {renderTimeFooter(item)}
                    {!isFuture && !isRouteInfo && renderDeliveryOrderFooter(item)}
                    {renderNewFlag(item)}
                    {isRouteInfo &&
                        _.size(item?.users) > 0 &&
                        item?.users.map((userData: any) => {
                            return <ActionCellView key={userData.UserId + item.RetailStoreId} userInfo={userData} />
                        })}
                </View>
            </TouchableOpacity>
        </View>
    )
}

const renderItem = (props: MyDaySectionListRowInterface) => {
    const {
        item,
        navigation,
        setIsShowRemoveVisitModal,
        removedStore,
        rowRefs,
        setNeedRefresh,
        isToday,
        setMyDayScrollEnabled,
        dropDownRef,
        selectedDate,
        setSelectedDate,
        myDayCardClickable,
        setMyDayCardClickable,
        isRouteInfo
    } = props
    const cellItem = item
    if (!isRouteInfo && isEventItem(cellItem)) {
        return <MeetingList item={cellItem} fromEmployeeSchedule key={item.Id} />
    }
    const closeAllRows = (localRowRef: React.RefObject<Object>) => {
        for (const key in localRowRef.current) {
            if (key !== `${item._soupEntryId}`) {
                // Disable typescript temporarily since it won't allow us to change the current value of the ref
                // @ts-ignore
                localRowRef?.current[key]?.closeRow && localRowRef?.current[key]?.closeRow()
            }
        }
    }
    const changingValueRef = useRef<Animated.Value>(new Animated.Value(0)) // NOSONAR
    const disableSwipe =
        item.Status === VisitStatus.IN_PROGRESS ||
        item.Status === VisitStatus.COMPLETE ||
        item.totalOrder !== 0 ||
        !item.AdHoc ||
        !isToday
    return (
        <SwipeRow
            // Disable typescript temporarily since it won't allow us to change the current value of the ref
            // @ts-ignore
            ref={(el) => (rowRefs.current[`${item._soupEntryId}`] = el)}
            key={item.Id}
            rightOpenValue={-90}
            closeOnRowPress
            disableRightSwipe
            friction={12}
            swipeToOpenPercent={5}
            swipeToOpenVelocityContribution={0}
            previewOpenValue={0.1}
            disableLeftSwipe={disableSwipe}
            setScrollEnabled={(enable: boolean) => {
                setMyDayScrollEnabled && setMyDayScrollEnabled(enable)
            }}
            onSwipeValueChange={(obj) => {
                // Animate the transparency of the hidden button
                // with the x coordinate of the button
                changingValueRef.current.setValue(obj.value)
            }}
            onRowClose={() => {
                setMyDayCardClickable(true)
            }}
            onRowOpen={() => {
                setMyDayCardClickable(false)
                // Only allow one row open at the same time
                if (!_.isEmpty(rowRefs.current)) {
                    closeAllRows(rowRefs)
                }
            }}
            recalculateHiddenLayout
        >
            <MyDaySwipeRowBackgroundLayer
                buttonOpacity={changingValueRef.current}
                item={item}
                setIsShowRemoveVisitModal={setIsShowRemoveVisitModal}
                removedStore={removedStore}
                rowRefs={rowRefs}
                setNeedRefresh={setNeedRefresh}
                dropDownRef={dropDownRef}
                setSelectedDate={setSelectedDate}
                navigation={navigation}
            />

            <MyDaySwipeRowForegroundContentLayer
                myDayCardClickable={myDayCardClickable}
                item={item}
                navigation={navigation}
                rowRefs={rowRefs}
                selectedDate={selectedDate}
                isRouteInfo={isRouteInfo}
            />
        </SwipeRow>
    )
}

export interface MyDayVisitListProps {
    myVisitsSectionList: Array<MyDayVisitListModel>
    userVisitLists: Array<VisitList>
    endDayButton: JSX.Element | null
    navigation: any
    selectedDate: string
    setIsShowRemoveVisitModal: Function
    removedStore: React.RefObject<string>
    setNeedRefresh: Function
    isToday: boolean
    dropDownRef: any
    visitRowRefs: React.RefObject<Object>
    isRefreshing: boolean
    onRefresh: () => void
    hasUncompletedOrders: boolean
    setSelectedDate: Function
    onScroll?: Function
    routeInfoData?: any
    isRouteInfo?: boolean
    selectedDateRoute?: string
}

const divider = () => {
    return <View style={styles.sectionSeparator} />
}

export interface MyDayListHeaderProps {
    startTimeToDisplay: string
    selectedDate: string
    label: string
    isRouteInfo?: boolean
    selectedDateRoute?: string
}

const MyDayListHeader: FC<MyDayListHeaderProps> = (props: MyDayListHeaderProps) => {
    const { startTimeToDisplay, selectedDate, label, isRouteInfo, selectedDateRoute } = props
    if (!isRouteInfo) {
        return renderStartEndTime(startTimeToDisplay, selectedDate, true, label, true)
    }
    return (
        <View>
            <View style={styles.sectionHeader}>
                <View style={styles.titleAndTimeView}>
                    <CText style={styles.headerTitle}>
                        {formatWithTimeZone(selectedDateRoute || '', TIME_FORMAT.DDD) +
                            ', ' +
                            formatWithTimeZone(selectedDateRoute || '', TIME_FORMAT.MMM_DD_YYYY)}
                    </CText>

                    <CText style={[styles.headerTitle, { maxWidth: 130 }]} numberOfLines={1}>
                        {' | ' + t.labels.PBNA_MOBILE_ORDERING_ROUTE + ' ' + `${CommonParam.userRouteGTMUId}`}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export interface MyDayListFooterProps {
    endTimeToDisplay: string
    endDayButton: JSX.Element | null
    selectedDate: string
    label: string
}

const MyDayListFooter: FC<MyDayListFooterProps> = (props: MyDayListFooterProps) => {
    const { endTimeToDisplay, endDayButton, selectedDate, label } = props
    if (!endTimeToDisplay && !endDayButton) {
        return <View style={styles.paddingBottomSectionEmpty} />
    }
    return (
        <View style={styles.paddingBottomSection}>
            {endTimeToDisplay ? renderStartEndTime(endTimeToDisplay, selectedDate, false, label, true) : null}
            {endDayButton}
        </View>
    )
}

export const getMyDayVisitListLength = (MyDayVisitLists: MyDayVisitListModel[]): number => {
    let returnValue = 0
    if (!_.isEmpty(MyDayVisitLists)) {
        MyDayVisitLists.forEach((MyDayVisitList) => {
            returnValue += MyDayVisitList.data?.length ?? 0
        })
    }
    return returnValue
}

export const MyDayVisitList: FC<MyDayVisitListProps> = (props: MyDayVisitListProps) => {
    const {
        myVisitsSectionList,
        userVisitLists,
        endDayButton,
        navigation,
        selectedDate,
        setIsShowRemoveVisitModal,
        hasUncompletedOrders,
        onScroll,
        removedStore,
        setNeedRefresh,
        isToday,
        dropDownRef,
        visitRowRefs,
        isRefreshing,
        onRefresh,
        setSelectedDate,
        routeInfoData,
        isRouteInfo,
        selectedDateRoute
    } = props
    // only display earliest start time and most recent end time
    const startTimeToDisplay = userVisitLists?.[0]?.StartDateTime || ''
    const endTimeToDisplay =
        (!endDayButton && [...userVisitLists].reverse().find((one) => one.EndDateTime)?.EndDateTime) || ''
    const [myDayScrollEnabled, setMyDayScrollEnabled] = useState<boolean>(true)
    const isPast = dayjs(selectedDate).isBefore(dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD))
    const { myDayCardClickable, setMyDayCardClickable } = useMyDayCartClickable()

    const headerProps = {
        startTimeToDisplay,
        selectedDate,
        label: t.labels.PBNA_MOBILE_DAY_STARTED_AT,
        isRouteInfo,
        selectedDateRoute
    }
    const footerProps = {
        endTimeToDisplay,
        endDayButton,
        selectedDate,
        label: t.labels.PBNA_MOBILE_DAY_ENDED_AT
    }
    let paddingBottom = 0
    if (hasUncompletedOrders) {
        paddingBottom = !endTimeToDisplay && !endDayButton ? 32 : 42
    }
    const minHeaderHeight = 115
    const footerHeight = 80
    const singleCartHeight = (screenHeight - minHeaderHeight - footerHeight) / 3
    const myDayListLength = getMyDayVisitListLength(myVisitsSectionList)
    const extraPadding = myDayListLength > 3 ? 0 : (4 - myDayListLength) * singleCartHeight
    return (
        <View style={[styles.flexPadding, { paddingBottom }]}>
            <SectionList
                key={selectedDate}
                sections={isRouteInfo ? routeInfoData : (myVisitsSectionList as any)}
                extraData={isRouteInfo ? routeInfoData : myVisitsSectionList}
                contentContainerStyle={{ paddingBottom: isToday ? extraPadding : 0 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={myDayScrollEnabled}
                scrollEventThrottle={20}
                onScroll={(e) => {
                    onScroll && onScroll(e)
                }}
                renderItem={({ item }) =>
                    renderItem({
                        item,
                        navigation,
                        setIsShowRemoveVisitModal,
                        removedStore,
                        rowRefs: visitRowRefs,
                        setNeedRefresh,
                        isToday,
                        setMyDayScrollEnabled,
                        dropDownRef,
                        selectedDate,
                        setSelectedDate,
                        myDayCardClickable,
                        setMyDayCardClickable,
                        isRouteInfo
                    })
                }
                ItemSeparatorComponent={divider}
                keyExtractor={(item, index) => {
                    return (isRouteInfo ? item.RetailStoreId : item.Id || '') + index
                }}
                renderSectionHeader={({ section }) => {
                    if (section.index === 0 && section.route === CommonParam.userRouteGTMUId && !isPast) {
                        return null
                    }
                    if (!isRouteInfo && section.route === '') {
                        if (section.index === 0) {
                            return null
                        }
                        return <View style={{ height: 16 }} />
                    }
                    const isTwoHeaders = section.index === 0 && section.route !== CommonParam.userRouteGTMUId
                    return (
                        !isRouteInfo && (
                            <View
                                style={[
                                    styles.headerWrap,
                                    styles.flexRowCenter,
                                    (isTwoHeaders || (isPast && section.index === 0)) && { marginTop: -20 }
                                ]}
                            >
                                <View style={styles.headerLine} />
                                <View style={[styles.headerContent, styles.flexRowCenter]}>
                                    <CText style={styles.textAlignCenter}>
                                        <CText style={styles.headerTitle}>
                                            {t.labels.PBNA_MOBILE_ORDERING_ROUTE + ' '}
                                        </CText>
                                        <CText style={styles.timeTitle}>{section.route}</CText>
                                        {section.userName && (
                                            <>
                                                <CText style={styles.headerTitle}>
                                                    {' ' + t.labels.PBNA_MOBILE_COMPLETED_BY + ' '}
                                                </CText>
                                                <CText style={styles.timeTitle}>{section.userName}</CText>
                                            </>
                                        )}
                                    </CText>
                                </View>
                            </View>
                        )
                    )
                }}
                stickySectionHeadersEnabled={false}
                ListHeaderComponent={<MyDayListHeader {...headerProps} />}
                ListFooterComponent={<MyDayListFooter {...footerProps} />}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#AAA', '#fff', '#0000ff']}
                        progressBackgroundColor="#fff"
                    />
                }
            />
        </View>
    )
}
