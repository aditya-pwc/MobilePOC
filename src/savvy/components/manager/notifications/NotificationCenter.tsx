/**
 * @description Notification Center
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-06-23
 */

import React, { useEffect, useState } from 'react'
import {
    View,
    StyleSheet,
    Dimensions,
    Alert,
    DeviceEventEmitter,
    Animated,
    TouchableOpacity,
    RefreshControl,
    NativeModules,
    NativeEventEmitter
} from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import moment from 'moment'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import CText from '../../../../common/components/CText'
import UserAvatar from '../../common/UserAvatar'
import { getNotificationsWithNet } from '../../../utils/MerchManagerUtils'
import NotificationService, {
    handleFormNotification,
    navigateToCustomerDetail
} from '../../../service/NotificationService'
import MarkWords from '../common/MarkWords'
import EmpytNotification from '../../../../../assets/image/empty-notification.svg'
import {
    clearNotifications,
    updateNotificationRead,
    updateNotificationSeen
} from '../../../api/connect/NotificationUtils'
import { formatWithTimeZone, isTodayDayWithTimeZone } from '../../../utils/TimeZoneUtils'
import { NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { t } from '../../../../common/i18n/t'
import { useIsFocused } from '@react-navigation/native'
import { sortArrByParamsDESC } from '../helper/MerchManagerHelper'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import { commonStyle, commonStyle as CommonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { checkIsFormNotification } from '../../../helper/rep/AuditHelper'
import { checkIsRealogramNotification } from '../../../pages/rep/SalesNotificationCenter'
import { RealogramNotificationType } from '../../../enums/Contract'

const { width } = Dimensions.get('window')
let isAnimation = false
interface VisibleItemProps {
    data?: any
    rowMap?: any
    rowHeightAnimatedValue?: any
    removeRow?: any
    leftActionState?: any
    rightActionState?: any
    onPressCell?: Function
    navigation?: any
}

interface HiddenitemWithActionsProps {
    swipeAnimatedValue?: any
    leftActionActivated?: any
    rightActionActivated?: any
    rowActionAnimatedValue?: any
    rowHeightAnimatedValue?: any
    onRead?: () => void
    onDelete?: () => void
    data?: any
}

const styles = StyleSheet.create({
    ...commonStyle,
    emptyContain: {
        width: width,
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    emptyTitle: {
        width: 196,
        fontWeight: '700',
        color: '#000000',
        fontSize: 16,
        textAlign: 'center'
    },
    emptySubTitle: {
        width: 384,
        fontWeight: '400',
        color: '#565656',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20
    },
    navTitle: {
        marginLeft: 22,
        marginTop: 13,
        marginBottom: 27
    },
    headView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width,
        backgroundColor: '#FFFFFF'
    },
    headTitle: {
        fontWeight: '900',
        color: '#000000',
        fontSize: 18,
        marginVertical: 20,
        marginLeft: 22
    },
    clearLable: {
        fontWeight: '700',
        color: '#00A2D9',
        fontSize: 12,
        marginVertical: 20,
        marginRight: 22
    },
    cellContainer: {
        flexDirection: 'row',
        width: width,
        overflow: 'hidden'
    },
    cellButtom: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    activeBg: {
        backgroundColor: '#F2F4F7'
    },
    inactiveBg: {
        backgroundColor: '#FFFFFF'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    rightContainer: {
        flexDirection: 'column',
        width: width - 40 - 22 - 15,
        marginLeft: 15,
        marginRight: 22
    },
    titleView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12
    },
    bloodText: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 10,
        maxWidth: width - 40 - 22 - 15 - 35
    },
    purpleIcon: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C0CC3',
        marginLeft: 5
    },
    unreadIcon: {
        marginLeft: 5
    },
    bloodSubTitle: {
        color: '#000000',
        fontSize: 14,
        marginRight: 22
    },
    bloodFontWeigth: {
        fontWeight: '700'
    },
    subtitleWidth: {
        width: 297
    },
    normalFontWeigth: {
        fontWeight: '400'
    },
    timeLabel: {
        fontWeight: '400',
        color: '#565656',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 22,
        textAlign: 'right'
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    backRightBtn: {
        alignItems: 'flex-end',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 98
    },
    backRightBtnRight: {
        backgroundColor: '#EB445A',
        right: 0
    },
    trash: {
        height: 25,
        width: 25,
        marginRight: 7
    },
    markText: {
        marginHorizontal: 19,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center'
    },
    markBtnView: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#2DD36F',
        bottom: 0,
        position: 'absolute',
        top: 0,
        width: 98,
        right: 98
    },
    markBtn: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    modalStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    avatarView: {
        marginLeft: 22,
        marginTop: 25
    },
    emptyNotification: {
        marginTop: 210,
        marginBottom: 50
    }
})

const getTime = (timeStr) => {
    const isToday = isTodayDayWithTimeZone(timeStr, true)
    if (isToday) {
        const timeGap = moment(new Date()).diff(moment(timeStr), 'minute')
        if (timeGap >= 60) {
            return Math.floor(timeGap / 60) + 'h ' + t.labels.PBNA_MOBILE_AGO.toLowerCase()
        }
        return timeGap + 'm ' + t.labels.PBNA_MOBILE_AGO.toLowerCase()
    }
    return formatWithTimeZone(timeStr, TIME_FORMAT.MMMDDYHHMMA, true, true)
}

export const getFinalDate = (result) => {
    const finalData = result.dataSource
    if (!finalData) {
        return []
    }
    const sortedData = _.groupBy(finalData, (item: any) => {
        return formatWithTimeZone(item.lastModified, TIME_FORMAT.Y_MM_DD, true, false)
    })
    const resultArr = []
    _.forEach(sortedData, (v, k) => {
        const res = sortArrByParamsDESC(v, 'LastTime')
        resultArr.push({
            title: k,
            data: res
        })
    })
    return sortArrByParamsDESC(resultArr, 'title') || []
}

const closeRow = (rowMap) => {
    Object.values(rowMap).forEach((row: any) => {
        if (row) {
            row.closeRow()
        }
    })
}
const onRowDidOpen = () => {}

const onLeftActionStatusChange = () => {}

const onRightActionStatusChange = () => {}

const onRightAction = () => {}

const onLeftAction = () => {}

const VisibleItem = (props: VisibleItemProps) => {
    const { data, rowMap, rowHeightAnimatedValue, removeRow, rightActionState, onPressCell, navigation } = props
    const item = data.item || {}
    const isSeen = item.seen === '1' || item.seen === true
    let jsonBody = null

    try {
        jsonBody = item.jsonBody
        jsonBody.UserStatsId = item.userStatsId
    } catch (error) {
        jsonBody = null
    }
    const kerArr = []
    if (jsonBody) {
        if (jsonBody.Object === 'Shipment') {
            kerArr.push(jsonBody.RetailStoreName)
        } else if (jsonBody.Object === 'Visit') {
            kerArr.push(jsonBody.RetailStoreName)
            kerArr.push(jsonBody.UserName)
        } else if (jsonBody.Object === 'Visit_List__c') {
            kerArr.push(jsonBody.UserName)
            kerArr.push(jsonBody.TimeNum)
        } else if (jsonBody.Object === 'Order') {
            kerArr.push(jsonBody.UserName)
        } else if (jsonBody.Object === 'Customer_Deal__c') {
            kerArr.push(jsonBody.CustNum)
            kerArr.push(jsonBody.TarName)
        }
    }
    if (rightActionState) {
        Animated.timing(rowHeightAnimatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(
            _.debounce(() => {
                removeRow()
            }, 1000)
        )
    }
    return (
        <Animated.View
            style={[
                styles.cellContainer,
                styles.cellButtom,
                isSeen ? styles.inactiveBg : styles.activeBg,
                { height: rowHeightAnimatedValue }
            ]}
        >
            <TouchableOpacity
                style={[styles.cellContainer]}
                onPress={() => {
                    global.$globalModal.openModal()
                    if (item.seen === '0' || item.seen === false) {
                        item.seen = true
                        updateNotificationSeen(item.id, true).then(() => {
                            onPressCell(item)
                        })
                    }
                    closeRow(rowMap)
                    if (checkIsFormNotification(jsonBody?.CType) || checkIsRealogramNotification(jsonBody?.CType)) {
                        handleFormNotification(jsonBody, navigation)
                        global.$globalModal.closeModal()
                    } else if (jsonBody?.CType === 'REJECTEDPG') {
                        navigateToCustomerDetail(item.target, navigation).finally(() => {
                            global.$globalModal.closeModal()
                        })
                    } else {
                        NotificationService.checkManagerNotification(jsonBody || {}, navigation)
                            .then(() => {
                                global.$globalModal.closeModal()
                            })
                            .catch(() => {
                                global.$globalModal.closeModal()
                            })
                    }
                }}
            >
                <View style={styles.avatarView}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.FirstName}
                        lastName={item.LastName}
                        avatarStyle={styles.avatar}
                        userNameText={{ fontSize: 16 }}
                    />
                </View>
                <View style={styles.rightContainer}>
                    <View style={styles.titleView}>
                        <CText style={styles.bloodText} numberOfLines={1}>
                            {item.translatedTitle}
                        </CText>
                        {!isSeen && <View style={styles.purpleIcon} />}
                    </View>
                    <MarkWords
                        searchStr={item.translatedBody}
                        keyArr={kerArr}
                        markItemStyle={[styles.bloodSubTitle, styles.normalFontWeigth]}
                        markActiveStyle={[styles.bloodSubTitle, styles.bloodFontWeigth]}
                        markBoxStyle={[styles.bloodSubTitle, styles.bloodFontWeigth, styles.subtitleWidth]}
                    />
                    <CText style={styles.timeLabel}>{getTime(item.LastTime)}</CText>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}

const HiddenitemWithActions = (props: HiddenitemWithActionsProps) => {
    const {
        leftActionActivated,
        rightActionActivated,
        rowActionAnimatedValue,
        rowHeightAnimatedValue,
        onRead,
        onDelete,
        data
    } = props
    const item = data.item || {}
    const isSeen = item.seen === '1' || item.seen === true
    if (rightActionActivated) {
        Animated.spring(rowActionAnimatedValue, {
            toValue: 500,
            useNativeDriver: false
        }).start()
    } else {
        Animated.spring(rowActionAnimatedValue, {
            toValue: 98,
            useNativeDriver: false
        }).start()
    }

    return (
        <Animated.View style={[styles.rowBack, { height: rowHeightAnimatedValue }]}>
            {!leftActionActivated && rowActionAnimatedValue._value < 500 && (
                <View style={[styles.markBtnView]}>
                    <TouchableOpacity style={styles.markBtn} onPress={onRead}>
                        <CText style={styles.markText}>
                            {isSeen ? t.labels.PBNA_MOBILE_MARK_AS_UNREAD : t.labels.PBNA_MOBILE_MARK_AS_READ}
                        </CText>
                    </TouchableOpacity>
                </View>
            )}
            {!leftActionActivated && rowActionAnimatedValue._value < 500 && (
                <Animated.View
                    style={[
                        styles.backRightBtn,
                        styles.backRightBtnRight,
                        {
                            flex: 1,
                            width: rowActionAnimatedValue
                        }
                    ]}
                >
                    <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={onDelete}>
                        {rightActionActivated ? (
                            <MaterialCommunityIcons
                                style={CommonStyle.marginRight_22}
                                name="trash-can-outline"
                                size={29}
                                color="#fff"
                            />
                        ) : (
                            <CText style={styles.markText}>{t.labels.PBNA_MOBILE_REMOVE}</CText>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    )
}

const renderSectionItem = (section, action) => {
    const time = section.data[0].LastTime
    const isToday = isTodayDayWithTimeZone(time, true)
    const timeStr = formatWithTimeZone(time, TIME_FORMAT.DDDDMMMDD, true, false)
    const title = isToday ? t.labels.PBNA_MOBILE_TODAY : timeStr
    return (
        <View style={styles.headView}>
            <CText style={styles.headTitle}>{title}</CText>
            <TouchableOpacity
                onPress={() => {
                    Alert.alert(t.labels.PBNA_MOBILE_CLEAR_ALL, t.labels.PBNA_MOBILE_CLEAR_ALL_MSG, [
                        {
                            text: t.labels.PBNA_MOBILE_CANCEL,
                            onPress: () => {}
                        },
                        {
                            text: t.labels.PBNA_MOBILE_CONTINUE,
                            onPress: () => {
                                const items = section.data
                                action(items)
                            }
                        }
                    ])
                }}
            >
                <CText style={styles.clearLable}>{t.labels.PBNA_MOBILE_CLEAR_ALL.toUpperCase()}</CText>
            </TouchableOpacity>
        </View>
    )
}
interface NotificationCenterProps {
    navigation
}
const managerReducer = (state) => state.manager
const NotificationCenter = (props: NotificationCenterProps) => {
    const { navigation } = props
    const { dropDownRef } = useDropDown()
    const { PushNotification } = NativeModules
    const notificationEvent = new NativeEventEmitter(PushNotification)
    const manager = useSelector(managerReducer)
    const [dataSource, setDataSource] = useState([])
    const [isRefresh, setRefreshStatus] = useState(false)

    const isFocused = useIsFocused()

    const refreshToReloadData = () => {
        if (isAnimation) {
            return
        }
        setRefreshStatus(true)
        isAnimation = true
        getNotificationsWithNet()
            .then((res: any) => {
                isAnimation = false
                if (!res) {
                    return
                }
                DeviceEventEmitter.emit('NotificationCenterUnreadCount', res.count || 0)
                setDataSource(getFinalDate(res))
                setRefreshStatus(false)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(DropDownType.ERROR, err)
                setRefreshStatus(false)
                isAnimation = false
            })
    }

    const clearNotificationWithItem = async (itemArr) => {
        if (isAnimation) {
            return
        }
        isAnimation = true
        const items = _.cloneDeep(itemArr)
        const ids = []
        items.forEach((element) => {
            element.read = true
            ids.push(element.id)
        })
        await clearNotifications(ids)
        isAnimation = false
        refreshToReloadData()
    }

    const readNotification = (rowMap, data) => {
        if (isAnimation) {
            return
        }
        isAnimation = true
        const item = data.item
        item.seen = !(item.seen === '1' || item.seen === true)
        closeRow(rowMap)
        updateNotificationSeen(item.id, item.seen)
            .then(() => {
                isAnimation = false
                refreshToReloadData()
            })
            .catch(() => {
                isAnimation = false
            })
    }

    const removeBtnClick = (rowMap, data) => {
        if (isAnimation) {
            return
        }
        isAnimation = true
        const item = data.item
        item.read = !(item.read === '1' || item.read === true)
        closeRow(rowMap)
        updateNotificationRead(item.id, true)
            .then(() => {
                isAnimation = false
                refreshToReloadData()
            })
            .catch(() => {
                isAnimation = false
            })
    }

    useEffect(() => {
        setDataSource(getFinalDate(manager.notificationData))
    }, [manager.notificationData])

    useEffect(() => {
        const notificationEmitter = notificationEvent.addListener('receiveMerchAndManagerRemoteNotification', () => {
            refreshToReloadData()
        })
        return () => {
            notificationEmitter && notificationEmitter.remove()
        }
    }, [])

    useEffect(() => {
        if (isFocused) {
            refreshToReloadData()
        }
    }, [isFocused])

    const renderListEmptyComponent = () => {
        return (
            <View style={styles.emptyContain}>
                <EmpytNotification style={styles.emptyNotification} />
                <CText style={styles.emptyTitle} numberOfLines={NUMBER_VALUE.TWO_NUM}>
                    {t.labels.PBNA_MOBILE_WAY_TO_GO},
                </CText>
                <CText style={styles.emptyTitle} numberOfLines={NUMBER_VALUE.TWO_NUM}>
                    {t.labels.PBNA_MOBILE_YOU_ARE_ALL_CAUGHT}
                </CText>
                <CText style={styles.emptySubTitle}>{t.labels.PBNA_MOBILE_NO_NEW_NOTIFICATIONS}</CText>
            </View>
        )
    }

    const renderItem = (data, rowMap) => {
        // As the number of new message lines increases, the height is increased
        const rowHeightAnimatedValue = new Animated.Value(
            data?.item?.jsonBody?.CType === RealogramNotificationType.IRNotLoad ? 155 : 130
        )
        return (
            <VisibleItem
                navigation={navigation}
                data={data}
                rowMap={rowMap}
                rowHeightAnimatedValue={rowHeightAnimatedValue}
                removeRow={() => {
                    // closeRow(rowMap, data.item.key)
                    removeBtnClick(rowMap, data)
                }}
                onPressCell={() => {
                    refreshToReloadData()
                }}
            />
        )
    }

    const renderHiddenItem = (data, rowMap) => {
        const rowActionAnimatedValue = new Animated.Value(98)
        const rowHeightAnimatedValue = new Animated.Value(60)
        return (
            <HiddenitemWithActions
                data={data}
                rowActionAnimatedValue={rowActionAnimatedValue}
                rowHeightAnimatedValue={rowHeightAnimatedValue}
                onRead={() => {
                    readNotification(rowMap, data)
                }}
                onDelete={() => {
                    removeBtnClick(rowMap, data)
                }}
            />
        )
    }
    const getListView = () => {
        return (
            <SwipeListView
                closeOnRowPress
                useSectionList
                disableRightSwipe
                sections={dataSource}
                renderItem={renderItem}
                showsVerticalScrollIndicator={dataSource.length > 0} // Hide Scrollbar in Empty View
                ListEmptyComponent={renderListEmptyComponent}
                renderHiddenItem={renderHiddenItem}
                renderSectionHeader={({ section }) =>
                    renderSectionItem(section, (items) => {
                        clearNotificationWithItem(items)
                    })
                }
                leftOpenValue={75}
                rightOpenValue={-196}
                onRowDidOpen={onRowDidOpen}
                leftActivationValue={100}
                rightActivationValue={-250}
                leftActionValue={0}
                rightActionValue={-500}
                onLeftAction={onLeftAction}
                onRightAction={onRightAction}
                onRightActionStatusChange={onLeftActionStatusChange}
                onLeftActionStatusChange={onRightActionStatusChange}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefresh}
                        onRefresh={refreshToReloadData}
                        colors={['#AAA', '#fff', '#0000ff']}
                        progressBackgroundColor="#fff"
                    />
                }
            />
        )
    }
    return (
        <View style={[CommonStyle.flex_1, styles.inactiveBg]}>
            <View style={[styles.marginTop51, styles.rowWithCenter]}>
                <CText style={[styles.fontBolder, styles.navTitle]}>{t.labels.PBNA_MOBILE_NOTIFICATIONS}</CText>
            </View>
            {getListView()}
        </View>
    )
}

export default NotificationCenter
