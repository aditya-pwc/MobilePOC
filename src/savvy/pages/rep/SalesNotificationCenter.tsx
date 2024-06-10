/**
 * @description Notification center for the Sales Rep
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-07-08
 */
import React, { FC, useEffect, useState } from 'react'
import {
    View,
    StyleSheet,
    Dimensions,
    Alert,
    DeviceEventEmitter,
    Animated,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView
} from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { decode } from 'html-entities'
import moment from 'moment'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { getTimeWithFormat } from '../../common/DateTimeUtils'
import { SoupService } from '../../service/SoupService'
import CText from '../../../common/components/CText'
import NoResultsSvg from '../../../../assets/image/no-results-icon.svg'
import { useIsFocused } from '@react-navigation/native'
import _ from 'lodash'
import { syncDownNotification } from '../../api/SyncUtils'
import { DeviceEvent } from '../../enums/DeviceEvent'
import { useNotifications } from '../../hooks/NotificationHooks'
import { Instrumentation } from '@appdynamics/react-native-agent'
import {
    clearNotifications,
    getLatestNotificationTime,
    updateNotificationRead,
    updateNotificationSeen
} from '../../api/connect/NotificationUtils'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { handleGoToDetailScreen } from '../../helper/rep/NotificationHelper'
import { t } from '../../../common/i18n/t'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { FormNotificationType, RealogramNotificationType } from '../../enums/Contract'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    ...commonStyle,
    headerContainer: {
        width: '100%',
        paddingHorizontal: 22,
        height: '100%',
        justifyContent: 'space-between'
    },
    headerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTextInnerContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyContain: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyTitle: {
        width: 196,
        fontWeight: '700',
        color: '#000000',
        fontSize: 16,
        textAlign: 'center'
    },
    navTitle: {
        marginLeft: '3.5%',
        marginTop: 13,
        marginBottom: 27
    },
    headView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '3.5%'
    },
    headTitle: {
        fontWeight: '900',
        color: '#000000',
        fontSize: 18,
        marginVertical: 20
    },
    clearLabel: {
        fontWeight: '700',
        color: '#00A2D9',
        fontSize: 12,
        marginVertical: 20
    },
    cellContainer: {
        flexDirection: 'row',
        width
    },
    cellBottom: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    activeBg: {
        backgroundColor: '#F2F4F7'
    },
    inactiveBg: {
        backgroundColor: '#FFFFFF'
    },
    rightContainer: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: '3.5%',
        height: '100%',
        justifyContent: 'space-between'
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
        marginBottom: 10
    },
    purpleIcon: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C0CC3',
        marginLeft: 5
    },
    timeLabel: {
        fontWeight: '400',
        color: '#565656',
        fontSize: 12,
        textAlign: 'right',
        position: 'absolute',
        bottom: 10,
        right: '3.5%'
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    backRightBtn: {
        alignItems: 'center',
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
    markText: {
        marginHorizontal: 13,
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
    marginBottom40: {
        marginBottom: 40
    },
    fontWeightBold: {
        fontWeight: 'bold'
    },
    fontSize12: {
        fontSize: 12
    },
    marginRight22: {
        marginRight: 22
    },
    bgCont: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    notificationText: {
        fontWeight: '900',
        fontSize: 24,
        color: 'black'
    },
    flex1: {
        flex: 1
    },
    flex9: {
        flex: 9
    }
})

interface SalesNotificationCenterProps {
    navigation: any
}

interface HiddenItemWithActionsProps {
    swipeAnimatedValue?: any
    leftActionActivated?: any
    rightActionActivated?: any
    rowActionAnimatedValue: any
    rowHeightAnimatedValue: any
    onRead: any
    onDelete: any
    data: any
    rowMap: any
}

interface VisibleItemProps {
    data: any
    rowMap: any
    rowHeightAnimatedValue: any
    removeRow: any
    leftActionState?: any
    rightActionState?: any
    handleClickTile: (item: any, rowMap: any) => Promise<void>
}

const getTime = (timeStr) => {
    const isToday = moment().isSame(new Date(timeStr), MOMENT_STARTOF.DAY)
    if (isToday) {
        const timeGap = moment(new Date()).diff(moment(timeStr), 'minute')
        if (timeGap >= 60) {
            return getTimeWithFormat(timeGap, 'h') + 'h ' + t.labels.PBNA_MOBILE_AGO.toLowerCase()
        }
        return timeGap + 'm ' + t.labels.PBNA_MOBILE_AGO.toLowerCase()
    }
    return formatWithTimeZone(timeStr, TIME_FORMAT.MMMDDYHHMMA, true)
}
export const checkIsIR = (msg: string) => {
    if (!msg) {
        return false
    }
    return msg.includes(FormNotificationType.NOT_LOAD) || msg.includes(FormNotificationType.FORM_KPI)
}

export const checkIsRealogramNotification = (msg: string) => {
    if (!msg) {
        return false
    }
    return msg.includes(RealogramNotificationType.REALOGRAM) || msg.includes(RealogramNotificationType.IRNotLoad)
}

const SalesVisibleItem: FC<VisibleItemProps> = (visibleItemProps: VisibleItemProps) => {
    const { data, rowMap, rowHeightAnimatedValue, removeRow, rightActionState, handleClickTile } = visibleItemProps
    const item = data.item || {}
    const isSeen = item.seen === '1' || item.seen === true
    const notificationDisplay = []
    let notificationBody
    const notificationTitle = decode(item.messageBody).split('-')[0]
    const isFormData = checkIsIR(item?.originalMessageBody) || checkIsRealogramNotification(item?.originalMessageBody)
    if (isFormData) {
        const msgArr = decode(item.messageBody).split('-')[1]?.split(/[><]/)
        notificationBody = msgArr.filter((item) => item !== '')
        notificationBody.unshift(notificationTitle)
    } else {
        notificationBody = decode(item?.messageBody)?.split(/[><]/)
    }

    for (let index = 1; index < notificationBody.length; index++) {
        const boldOdd = index % 2 === 0
        if (isFormData ? !boldOdd : boldOdd) {
            isFormData && notificationDisplay.push(<CText key={index}>{notificationBody[index]}</CText>)
            !isFormData && notificationDisplay.push(<CText key={index}>{' ' + notificationBody[index] + ' '}</CText>)
        } else {
            notificationDisplay.push(
                <CText key={index} style={styles.fontWeightBold}>
                    {notificationBody[index]}
                </CText>
            )
        }
    }
    if (rightActionState) {
        Animated.timing(rowHeightAnimatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            removeRow()
        })
    }
    return (
        <Animated.View
            style={[
                styles.cellContainer,
                styles.cellBottom,
                isSeen ? styles.inactiveBg : styles.activeBg,
                { height: rowHeightAnimatedValue }
            ]}
        >
            <TouchableOpacity
                style={[styles.cellContainer]}
                onPress={async () => {
                    await handleClickTile(item, rowMap)
                }}
            >
                <View style={styles.rightContainer}>
                    <View>
                        <View style={styles.titleView}>
                            <CText style={styles.bloodText} numberOfLines={1}>
                                {notificationTitle}
                            </CText>
                            {!isSeen && <View style={styles.purpleIcon} />}
                        </View>
                        <CText style={styles.fontSize12} numberOfLines={3}>
                            {notificationDisplay}
                        </CText>
                    </View>
                    <CText style={styles.timeLabel}>{getTime(item.lastModified)}</CText>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}

const HiddenItemWithActions: FC<HiddenItemWithActionsProps> = (hiddenItemProps: HiddenItemWithActionsProps) => {
    const {
        leftActionActivated,
        rightActionActivated,
        rowActionAnimatedValue,
        rowHeightAnimatedValue,
        onRead,
        onDelete,
        data
    } = hiddenItemProps
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
    const renderRightAction = () => {
        if (rightActionActivated) {
            return (
                <MaterialCommunityIcons style={styles.marginRight22} name="trash-can-outline" size={29} color="#fff" />
            )
        }
        return <CText style={styles.markText}>{t.labels.PBNA_MOBILE_CLEAR.toUpperCase()}</CText>
    }

    return (
        <Animated.View style={[styles.rowBack, { height: rowHeightAnimatedValue }]}>
            {!leftActionActivated && (
                <View style={[styles.markBtnView]}>
                    <TouchableOpacity style={styles.markBtn} onPress={onRead}>
                        <CText style={styles.markText}>
                            {isSeen ? t.labels.PBNA_MOBILE_MARK_AS_UNREAD : t.labels.PBNA_MOBILE_MARK_AS_READ}
                        </CText>
                    </TouchableOpacity>
                </View>
            )}
            {!leftActionActivated && (
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
                        {renderRightAction()}
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    )
}

const SalesNotificationCenter: FC<SalesNotificationCenterProps> = (props: SalesNotificationCenterProps) => {
    const { navigation } = props
    const isFocused = useIsFocused()
    const [editTimes, setEditTimes] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const dataSource = useNotifications(isFocused, editTimes, isLoading)

    useEffect(() => {
        const refreshLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_LEAD_LIST, () => {
            setEditTimes((prevEditTimes) => {
                return prevEditTimes + 1
            })
        })
        return () => {
            refreshLeadListEvent.remove()
        }
    }, [])

    const getTitle = (title) => {
        if (moment(title).isSame(moment(), MOMENT_STARTOF.DAY)) {
            return t.labels.PBNA_MOBILE_TODAY
        }
        return moment(title).format('dddd, MMM D')
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

    const readNotification = async (rowMap, data) => {
        global.$globalModal.openModal()
        const item = _.cloneDeep(data.item)
        if (!(item.seen === '1' || item.seen === true)) {
            await updateNotificationSeen(item.Id, true)
            PushNotificationIOS.getApplicationIconBadgeNumber((v) => {
                PushNotificationIOS.setApplicationIconBadgeNumber(v - 1)
            })
            item.seen = true
        } else {
            await updateNotificationSeen(item.Id, false)
            PushNotificationIOS.getApplicationIconBadgeNumber((v) => {
                PushNotificationIOS.setApplicationIconBadgeNumber(v + 1)
            })
            item.seen = false
        }
        await SoupService.upsertDataIntoSoup('Notification', [item])
        closeRow(rowMap)
        setEditTimes((prevEditTimes) => {
            return prevEditTimes + 1
        })
        DeviceEventEmitter.emit(DeviceEvent.REFRESH_BADGE)
        global.$globalModal.closeModal()
    }

    const removeBtnClick = async (rowMap, data) => {
        global.$globalModal.openModal()
        const item = _.cloneDeep(data.item)
        await updateNotificationRead(item.Id, true)
        if (item.seen === false || item.seen === '0') {
            PushNotificationIOS.getApplicationIconBadgeNumber((v) => {
                PushNotificationIOS.setApplicationIconBadgeNumber(v - 1)
            })
        }
        item.read = true
        await SoupService.upsertDataIntoSoup('Notification', [item])
        closeRow(rowMap)
        setEditTimes((prevEditTimes) => {
            return prevEditTimes + 1
        })
        DeviceEventEmitter.emit(DeviceEvent.REFRESH_BADGE)
        Instrumentation.reportMetric('FSR/PSR clicks clear button', 1)
        global.$globalModal.closeModal()
    }

    const refreshToReloadData = async () => {
        setIsLoading(true)
        syncDownNotification(new Date().toISOString(), await getLatestNotificationTime())
            .then(() => {
                setIsLoading(false)
                DeviceEventEmitter.emit(DeviceEvent.REFRESH_BADGE)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const renderListEmptyComponent = () => {
        return (
            <View style={styles.emptyContain}>
                <NoResultsSvg style={styles.marginBottom40} />
                <CText style={styles.emptyTitle} numberOfLines={2}>
                    {t.labels.PBNA_MOBILE_NO_NOTIFICATIONS}
                </CText>
            </View>
        )
    }
    const renderSectionItem = (section) => {
        return (
            <View style={styles.headView}>
                <CText style={styles.headTitle}>{getTitle(section.title)}</CText>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(_.capitalize(t.labels.PBNA_MOBILE_CLEAR_ALL), t.labels.PBNA_MOBILE_CLEAR_ALL_MSG, [
                            {
                                text: t.labels.PBNA_MOBILE_CANCEL,
                                onPress: () => {}
                            },
                            {
                                text: t.labels.PBNA_MOBILE_CONTINUE,
                                onPress: () => {
                                    ;(async () => {
                                        global.$globalModal.openModal()
                                        const items = _.cloneDeep(section.data)
                                        const ids = []
                                        let badgeToMinus = 0
                                        items.forEach((element) => {
                                            if (element.seen === '0' || element.seen === false) {
                                                badgeToMinus = badgeToMinus + 1
                                            }
                                            element.read = true
                                            ids.push(element.Id)
                                        })
                                        await clearNotifications(ids)
                                        if (badgeToMinus > 0) {
                                            PushNotificationIOS.getApplicationIconBadgeNumber((v) => {
                                                PushNotificationIOS.setApplicationIconBadgeNumber(v - badgeToMinus)
                                            })
                                        }
                                        await SoupService.upsertDataIntoSoup('Notification', items)
                                        setEditTimes((prevEditTimes) => {
                                            return prevEditTimes + 1
                                        })
                                        DeviceEventEmitter.emit(DeviceEvent.REFRESH_BADGE)
                                        Instrumentation.reportMetric('FSR/PSR clicks clear all button', 1)
                                        global.$globalModal.closeModal()
                                    })()
                                }
                            }
                        ])
                    }}
                >
                    <CText style={styles.clearLabel}>{t.labels.PBNA_MOBILE_CLEAR_ALL.toUpperCase()}</CText>
                </TouchableOpacity>
            </View>
        )
    }

    const handleClickTile = async (item, rowMap) => {
        global.$globalModal.openModal()
        const SR_CLICKS_NOTIFICATIONS = 'FSR/PSR clicks notifications'
        Instrumentation.startTimer(SR_CLICKS_NOTIFICATIONS)
        if (item.seen === '0' || item.seen === false) {
            try {
                await updateNotificationSeen(item.Id, true)
                PushNotificationIOS.getApplicationIconBadgeNumber((v) => {
                    PushNotificationIOS.setApplicationIconBadgeNumber(v - 1)
                })
                item.seen = true
                await SoupService.upsertDataIntoSoup('Notification', [
                    {
                        ...item,
                        messageBody: item.originalMessageBody // avoid expose raw data to user
                    }
                ])
            } catch (e) {
                global.$globalModal.closeModal()
            }
        }
        closeRow(rowMap)
        setEditTimes((prevEditTimes) => {
            return prevEditTimes + 1
        })

        DeviceEventEmitter.emit(DeviceEvent.REFRESH_BADGE)
        if (item?.target && item?.messageBody) {
            await handleGoToDetailScreen(item, navigation)
        }
        global.$globalModal.closeModal()
    }

    const renderItem = (data, rowMap) => {
        const rowHeightAnimatedValue = new Animated.Value(120)
        return (
            <SalesVisibleItem
                data={data}
                rowMap={rowMap}
                rowHeightAnimatedValue={rowHeightAnimatedValue}
                removeRow={() => {
                    removeBtnClick(rowMap, data)
                }}
                handleClickTile={handleClickTile}
            />
        )
    }

    const renderHiddenItem = (data, rowMap) => {
        const rowActionAnimatedValue = new Animated.Value(98)
        const rowHeightAnimatedValue = new Animated.Value(60)
        return (
            <HiddenItemWithActions
                data={data}
                rowMap={rowMap}
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
    return (
        <View style={styles.bgCont}>
            <SafeAreaView style={styles.flex1}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerTextContainer}>
                        <View style={styles.headerTextInnerContainer}>
                            <TouchableOpacity onPress={() => {}}>
                                <CText style={styles.notificationText}>{t.labels.PBNA_MOBILE_NOTIFICATIONS}</CText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            <View style={styles.flex9}>
                {dataSource.length > 0 && (
                    <SwipeListView
                        closeOnRowPress
                        useSectionList
                        disableRightSwipe
                        ListEmptyComponent={renderListEmptyComponent}
                        sections={dataSource}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        renderSectionHeader={({ section }) => renderSectionItem(section)}
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
                                refreshing={isLoading}
                                onRefresh={refreshToReloadData}
                                colors={['#AAA', '#fff', '#0000ff']}
                                progressBackgroundColor="#fff"
                            />
                        }
                    />
                )}
                {dataSource.length === 0 && renderListEmptyComponent()}
            </View>
        </View>
    )
}

export default SalesNotificationCenter
