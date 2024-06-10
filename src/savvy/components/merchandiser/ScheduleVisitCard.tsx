/*
 * @Author: Yue Yuan
 * @Date: 2021-10-22 18:09:30
 * @LastEditTime: 2023-01-04 14:47:17
 * @LastEditors: Mary Qian
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/merchandiser/ScheduleVisitCard.tsx
 */

import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import Utils from '../../common/DateTimeUtils'
import IMG_PEPSICO from '../../../../assets/image/Icon-store-placeholder.svg'
import CCheckBox from '../../../common/components/CCheckBox'
import { getTimeFromMins, getVisitSubTypeStr } from '../../utils/MerchManagerUtils'
import VisitCardFooter from './VisitCardFooter'
import VisitActionBlock from './VisitActionBlock'
import VisitTimelineBlock from './VisitTimelineBlock'
import VisitSubTypeBlock from './VisitSubTypeBlock'
import VisitAddedButton from './VisitAddedButton'
import UserAvatar from '../common/UserAvatar'
import { commonStyle, commonStyle as CommonStyle } from '../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
import { Locale } from '../../enums/i18n'
import { getAdHocNewImage, getManagerAdHocNewImage } from '../manager/helper/VisitHelper'
import { CommonParam } from '../../../common/CommonParam'
import VisitTimeAndSequence from './VisitTimeAndSequence'
import GeofenceBar from '../manager/schedule/GeofenceBar'

const IMG_UNASSIGNED = ImageSrc.IMG_UNASSIGNED

const gotoStore = (isVisitList, navigation, item) => {
    console.log('after pressing gotoStore ')
    if (isVisitList) {
        navigation.navigate('VisitDetail', {
            item: item
        })
    }
}

const goToVisitDetails = (navigation, item) => {
    console.log('after pressing goToVisitDetails ')
    navigation.navigate('VisitDetails', {
        item: item
    })
}

const styles = StyleSheet.create({
    ...commonStyle,

    boxWithShadow: {
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22,
        shadowColor: '#004C97',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        elevation: 5,
        shadowRadius: 10,
        borderRadius: 6,
        marginBottom: 17
    },
    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        paddingTop: 26,
        paddingBottom: 26,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    box: {
        overflow: 'hidden',
        borderRadius: 6
    },
    boxContentTouch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContent: {
        alignItems: 'flex-end',
        flex: 0.2,
        flexDirection: 'column'
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
    columnContainer: {
        flexGrow: 1,
        flexDirection: 'column'
    },
    rowContainer: {
        flexGrow: 1,
        flexDirection: 'row'
    },
    statusBarFont: {
        fontSize: 12
    },
    statusBarContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center'
    },
    pillContainer: {
        paddingHorizontal: 5,
        borderColor: '#565656',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 1,
        marginLeft: 10
    },
    pillText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#565656'
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    imgNew: {
        width: 45,
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
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
    borderBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    borderMMModalBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    imgCircle: {
        width: 20,
        height: 20
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
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        marginRight: -10
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
        color: '#565656',
        fontWeight: '400'
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    },
    addressUseSub: {
        fontSize: 12,
        color: '#565656',
        marginTop: 0
    },
    marginTop5: {
        marginTop: 5
    },
    geoBarView: {
        backgroundColor: '#F2F4F7',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    geoBar: {
        flex: 1,
        marginTop: 12,
        marginBottom: -15
    }
})

interface ScheduleVisitCardProps {
    navigation?: any
    item?: any
    isVisitList?: boolean
    addVisits?: any
    withOutIcon?: boolean
    withoutCallIcon?: boolean
    fromEmployeeSchedule?: boolean
    fromMerch?: boolean
    managerDetail?: boolean
    onPress?: Function
    fromManagerDetail?: boolean
    fromMMModal?: boolean
    notShowTimeCard?: boolean
    hasUserInfo?: boolean
    fromSMap?: boolean
    showSubTypeBlock?: boolean
    isAddVisit?: boolean
    deliveryInfo?: {
        haveDelivery: boolean
        haveOpenStatus: boolean
        totalCertified: string
        totalDelivered: string
        totalOrdered: string
    }
    showCompletedWO?: boolean
    handleCustomerSchedulePress?: Function
    onCheckBoxClick?: Function
    hideSequence?: boolean
}

const renderUserInfo = (item) => {
    if (item?.unassignedRoute) {
        return (
            <View style={styles.userInfo}>
                <Image style={styles.eImgPortrait} source={IMG_UNASSIGNED} />
                <View style={styles.marginTop5}>
                    <CText numberOfLines={2} style={styles.nameText}>
                        {_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) + ' ' + t.labels.PBNA_MOBILE_VISIT}
                    </CText>
                </View>
            </View>
        )
    }
    if (!item.VisitorId && !item.Visit_List__c) {
        return (
            <View style={styles.userInfo}>
                <Image style={styles.eImgPortrait} source={IMG_UNASSIGNED} />
                <View style={styles.marginTop5}>
                    <CText numberOfLines={1} style={styles.nameText}>
                        {_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)}
                    </CText>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.userInfo}>
            <UserAvatar
                userStatsId={item.UserStatsId}
                firstName={item.FirstName}
                lastName={item.LastName}
                avatarStyle={styles.eImgPortrait}
                userNameText={styles.userNameText}
            />
            <View style={styles.marginTop5}>
                {item.FirstName && (
                    <CText numberOfLines={1} style={styles.nameText}>
                        {item.FirstName}
                    </CText>
                )}
                <CText numberOfLines={1} style={styles.nameText}>
                    {item.LastName}
                </CText>
            </View>
        </View>
    )
}

const getVisitIcon = (item) => {
    if (item.status === 'Complete') {
        return <Image style={styles.status} source={require('../../../../assets/image/icon_checkmark_circle.png')} />
    } else if (item.status === 'In Progress') {
        return <Image style={styles.status} source={require('../../../../assets/image/icon-location-current.png')} />
    }
    return null
}

const getMaxTypeWidth = (durationInMinutes: number, defaultWidth: number, subtypeNumString: string) => {
    let typeMaxWidth = 0
    const hrInMinutes = 60
    const maxHourInMinutes = 600
    const twoDigitsHourInMinutes = 5940
    const extraDeduction = subtypeNumString === '' ? 0 : 26
    if (
        durationInMinutes < hrInMinutes ||
        (durationInMinutes % hrInMinutes === 0 && durationInMinutes <= twoDigitsHourInMinutes)
    ) {
        typeMaxWidth = 120 - extraDeduction
    } else if (durationInMinutes >= hrInMinutes && durationInMinutes < maxHourInMinutes) {
        typeMaxWidth = 90 - extraDeduction
    } else {
        typeMaxWidth = defaultWidth - extraDeduction
    }
    return typeMaxWidth
}

export const StatusBar = (Props) => {
    const { fromEmployeeSchedule, item } = Props
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item?.Visit_Subtype__c)
    if (!fromEmployeeSchedule) {
        return null
    }
    const SPLIT_LINE = ' | '
    let maxTypeWidth = 0
    const defaultWidth = 85
    maxTypeWidth = getMaxTypeWidth(+item?.PlannedDurationMinutes, defaultWidth, subtypeNumString)
    return (
        <View style={styles.statusBarContainer}>
            <CText style={[styles.statusBarFont, { maxWidth: defaultWidth }]} numberOfLines={1}>
                {getTimeFromMins(item?.PlannedDurationMinutes)}
            </CText>
            <CText style={styles.statusBarFont}>{SPLIT_LINE}</CText>
            <CText style={[styles.statusBarFont, { maxWidth: maxTypeWidth }]} numberOfLines={1}>
                {subtypeString}
            </CText>
            <CText style={styles.statusBarFont}>{subtypeNumString}</CText>
            {item?.Pull_Number__c && <CText style={styles.statusBarFont}>{SPLIT_LINE}</CText>}
            {item?.Pull_Number__c && <CText style={styles.statusBarFont}>P{item?.Pull_Number__c}</CText>}
            {item?.Take_Order_Flag__c === '1' && (
                <View style={styles.pillContainer}>
                    <CText style={styles.pillText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                </View>
            )}
        </View>
    )
}

const ScheduleVisitCard = (props: ScheduleVisitCardProps) => {
    const {
        navigation,
        item,
        isVisitList,
        addVisits,
        withOutIcon,
        showSubTypeBlock,
        withoutCallIcon,
        fromEmployeeSchedule,
        showCompletedWO,
        fromMerch,
        managerDetail,
        onPress,
        fromMMModal,
        notShowTimeCard,
        hasUserInfo,
        fromSMap,
        deliveryInfo,
        handleCustomerSchedulePress,
        onCheckBoxClick,
        hideSequence
    } = props
    const subtypes = item.Visit_Subtype__c
    let plusNum = 0
    let visitSubtypes = []
    if (subtypes?.length > 0) {
        const newList = subtypes.split(';')
        visitSubtypes = newList
        plusNum = newList.length - 1
    } else {
        visitSubtypes = []
    }

    const handlePress = () => {
        if (fromSMap) {
            return false
        }
        if (fromMerch) {
            console.log('Merch')
            gotoStore(isVisitList, navigation, item)
            return
        }
        if (!fromEmployeeSchedule && !managerDetail) {
            gotoStore(isVisitList, navigation, item)
            return
        }
        if ((fromEmployeeSchedule || fromMMModal) && item.isEdit) {
            onPress && onPress()
            return
        }
        goToVisitDetails(navigation, item)
    }

    const handleCheckBoxClick = () => {
        if (onCheckBoxClick && !fromEmployeeSchedule) {
            onCheckBoxClick(item?.index)
        } else if (onCheckBoxClick && fromEmployeeSchedule) {
            onCheckBoxClick(item)
        }
    }

    const ManagerAdHocNew = getManagerAdHocNewImage()
    const AdHocNew = getAdHocNewImage()

    return (
        <View>
            <TouchableOpacity
                // disabled={item.isEdit}
                // onPress={() => {
                //     handleCustomerSchedulePress ? handleCustomerSchedulePress() : handlePress()
                // }}
                onPress={() => {
                    handlePress()
                }}
            >
                <View style={[styles.boxWithShadow, item.inLocation && isVisitList && styles.location]}>
                    <View style={styles.box}>
                        <View style={[styles.boxContent, isVisitList && item.status === 'Complete' && styles.complete]}>
                            {item.showNew && (
                                <ManagerAdHocNew
                                    style={styles.imgNew}
                                    width={CommonParam.locale === Locale.fr ? 82 : 45}
                                    height={22}
                                />
                            )}
                            {item.showNewHollow && (
                                <AdHocNew
                                    style={styles.imgNew}
                                    width={CommonParam.locale === Locale.fr ? 82 : 45}
                                    height={22}
                                />
                            )}
                            <View style={[styles.imageGroup, fromEmployeeSchedule && { alignSelf: 'flex-start' }]}>
                                <IMG_PEPSICO style={styles.iconXXL} />
                                {!withOutIcon && getVisitIcon(item)}
                            </View>
                            <View style={styles.columnContainer}>
                                <View style={styles.rowContainer}>
                                    <View style={[styles.boxContentTextArea, hasUserInfo && { flex: 1.1 }]}>
                                        <View style={styles.rowWithCenter}>
                                            <View style={styles.contentText}>
                                                <CText numberOfLines={2} ellipsizeMode="tail" style={styles.itemTile}>
                                                    {/* {item.name} */}
                                                    {item.Nm}
                                                </CText>
                                            </View>
                                        </View>
                                        <View style={styles.rowWithCenter}>
                                            <View style={styles.contentText}>
                                                <CText
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={[styles.itemSubTile, hasUserInfo && styles.addressUse]}
                                                >
                                                    {item.Ln1}
                                                    {/* {item.address} */}
                                                </CText>
                                                <CText
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={[styles.itemSubTile, hasUserInfo && styles.addressUseSub]}
                                                >
                                                    {/* {item.cityStateZip} */}
                                                    {item.Pstl}
                                                </CText>
                                            </View>
                                        </View>
                                    </View>
                                    {/* <VisitActionBlock
                                        item={item}
                                        isVisitList={isVisitList}
                                        withoutCallIcon={withoutCallIcon}
                                        hasUserInfo={hasUserInfo}
                                    /> */}
                                    {/* {hasUserInfo && renderUserInfo(item)}
                                    {item.isEdit && (
                                        <CCheckBox
                                            hitSlop={CommonStyle.hitSlop}
                                            onPress={() => handleCheckBoxClick()}
                                            disabled={!fromEmployeeSchedule}
                                            checked={item.select}
                                            containerStyle={styles.checkBoxItem}
                                        />
                                    )} */}
                                    {/* <VisitAddedButton isVisitList={isVisitList} addVisits={addVisits} item={item} /> */}
                                </View>
                                {/* {!fromMerch && <StatusBar fromEmployeeSchedule={fromEmployeeSchedule} item={item} />} */}
                            </View>
                        </View>
                        {/* <VisitSubTypeBlock
                            item={item}
                            showSubTypeBlock={showSubTypeBlock}
                            isVisitList={isVisitList}
                            visitSubtypes={visitSubtypes}
                            plusNum={plusNum}
                        /> */}

                        {/* {isVisitList &&
                            ((deliveryInfo && deliveryInfo.haveDelivery) ||
                                item.workOrders > 0 ||
                                item.CompletedWorkOrders > 0) && (
                                <VisitCardFooter
                                    item={item}
                                    fromMMModal={fromMMModal}
                                    haveDelivery={deliveryInfo.haveDelivery || false}
                                    haveOpenStatus={deliveryInfo.haveOpenStatus || false}
                                    fromEmployeeSchedule={fromEmployeeSchedule}
                                    showCompletedWO={showCompletedWO}
                                    deliveryInfo={{
                                        totalCertified: deliveryInfo.totalCertified || 0,
                                        totalDelivered: deliveryInfo.totalDelivered || 0,
                                        totalOrdered: deliveryInfo.totalOrdered || 0
                                    }}
                                    isVisitList={isVisitList}
                                />
                            )} */}
                        {/* {!fromMerch && (
                            <VisitTimeAndSequence
                                item={item}
                                notShowTimeCard={notShowTimeCard}
                                fromEmployeeSchedule={fromEmployeeSchedule}
                                isVisitList={isVisitList}
                                hideSequence={hideSequence}
                            />
                        )} */}
                        {/* <VisitTimelineBlock
                            item={item}
                            notShowTimeCard={notShowTimeCard}
                            fromEmployeeSchedule={fromEmployeeSchedule}
                            isVisitList={isVisitList}
                            fromMerch={fromMerch}
                        /> */}
                        {/* {!fromMerch &&
                            fromEmployeeSchedule &&
                            (item.ActualVisitStartTime || item.ActualVisitEndTime) && (
                                <View style={styles.geoBarView}>
                                    <View style={styles.geoBar}>
                                        <GeofenceBar visit={item} fromEmployeeSchedule={fromEmployeeSchedule} />
                                    </View>
                                </View>
                            )} */}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default ScheduleVisitCard
