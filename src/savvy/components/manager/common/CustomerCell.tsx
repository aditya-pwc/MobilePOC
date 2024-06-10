/**
 * @description Customer item component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-19
 */

import React, { useState } from 'react'
import { View, Image, TouchableOpacity, ScrollView } from 'react-native'
import CText from '../../../../common/components/CText'
import { Tooltip, CheckBox } from 'react-native-elements'
import CCheckBox from '../../../../common/components/CCheckBox'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CustomerCellStyle from '../../../styles/manager/CustomerCellStyle'
import UserAvatar from '../../common/UserAvatar'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import { getVisitSubTypeStr, getTimeFromMins } from '../../../utils/MerchManagerUtils'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { isNullSpace } from '../helper/MerchManagerHelper'
import _ from 'lodash'
import { getTimeFromMinsWithHrs } from '../../../common/DateTimeUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Locale } from '../../../enums/i18n'
import { getManagerAdHocNewImage } from '../helper/VisitHelper'
import { getWorkDayArr } from '../../../utils/MerchManagerComputeUtils'

const IMG_CHEVRON = ImageSrc.IMG_CHEVRON
const IMG_UNCHECK = ImageSrc.UNCHECK_BLUE
const TOOLTIP_USER_HEIGHT = 50
const TOOLTIP_MAX_USER_COUNT = 9
const WHITE_COLOR = '#fff'
const TAKE_ORDER_STATUS_CODE = '1'
const SUBTYPE_PRE_TITLE = 'P'
const SPLIT_LINE = '|'
interface CustomerProps {
    hasAvatar?: boolean
    item?: any
    index?: number
    itemKey?: string
    isReview?: boolean
    isReassign?: boolean
    disabled?: boolean
    onCellPress?: any
    isEdit?: boolean
    onCheckBoxPress?: Function
    onCheckBoxClick?: Function
    fromOptimized?: boolean
    isEditMode?: boolean
}

const styles = CustomerCellStyle

const getContainerBottom = (hasAvatar, isReview) => {
    if (hasAvatar && !isReview) {
        return styles.borderBottomWidth1
    }
    return styles.borderBottomWidth0
}
const getContainerColor = (hasAvatar, isReview) => {
    if (!hasAvatar && !isReview) {
        return styles.backgroundColorGrey
    }
    return styles.backgroundColorWhite
}

const haveNoAvatarComponent = (isReassign, disabled, item) => {
    return (
        <View style={styles.assignStyle}>
            {isReassign ? (
                <CText style={styles.fontSize12}>{t.labels.PBNA_MOBILE_ASSIGN}</CText>
            ) : (
                <CheckBox
                    disabled={disabled}
                    checked={item.select}
                    uncheckedIcon={<Image source={IMG_UNCHECK} style={styles.uncheckStyle} />}
                    containerStyle={styles.checkBoxContainerStyle}
                />
            )}
        </View>
    )
}

const getNameString = (item: any) => {
    let firstName: string = ''
    let lastName: string = ''
    if (item.UserStatsId) {
        firstName = item.FirstName
        lastName = item.LastName
    } else if (item?.longestDurationVisitor?.userStatsId) {
        firstName = item?.longestDurationVisitor?.firstName
        lastName = item?.longestDurationVisitor?.lastName
    } else {
        firstName = _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)
        lastName = _.capitalize(t.labels.PBNA_MOBILE_VISIT)
    }
    return {
        firstName,
        lastName
    }
}

const haveAvatarComponent = (item, fromOptimized) => {
    const { firstName, lastName } = getNameString(item)
    return (
        <View key={item.id} style={[styles.flexGrow1]}>
            {_.isEmpty(item.moreVisitors) && (
                <View>
                    {(item?.longestDurationVisitor?.userStatsId || item?.UserStatsId) && (
                        <UserAvatar
                            userStatsId={item?.longestDurationVisitor?.userStatsId || item.UserStatsId}
                            firstName={firstName}
                            lastName={lastName}
                            avatarStyle={styles.avatar}
                            userNameText={{ fontSize: 12 }}
                        />
                    )}
                    {_.isEmpty(item?.longestDurationVisitor?.userStatsId || item.UserStatsId) && (
                        <Image style={[styles.unassignImage, styles.avatar]} source={ImageSrc.IMG_UNASSIGNED} />
                    )}
                    <CText
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.userName, styles.textAlignRight, { marginTop: 4 }]}
                    >
                        {firstName}
                    </CText>
                    <CText
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.userName, styles.textAlignRight, { marginTop: 2 }]}
                    >
                        {lastName}
                    </CText>
                </View>
            )}
            {item.moreVisitors?.length > 0 && (
                <Tooltip
                    withOverlay={false}
                    containerStyle={styles.tooltipContainer}
                    pointerColor={WHITE_COLOR}
                    withPointer
                    height={
                        item.moreVisitors.length > TOOLTIP_MAX_USER_COUNT
                            ? TOOLTIP_MAX_USER_COUNT * TOOLTIP_USER_HEIGHT
                            : item.moreVisitors.length * TOOLTIP_USER_HEIGHT
                    }
                    popover={
                        <ScrollView>
                            {item?.moreVisitors.map((visitor, index) => {
                                return (
                                    <View key={visitor?.id}>
                                        {index < TOOLTIP_MAX_USER_COUNT - 1 && (
                                            <View style={styles.moreVisitors}>
                                                {visitor.userStatsId && (
                                                    <UserAvatar
                                                        userStatsId={visitor.userStatsId}
                                                        firstName={visitor.firstName}
                                                        lastName={visitor.lastName}
                                                        avatarStyle={[
                                                            styles.avatar,
                                                            styles.tooltipAvatar,
                                                            styles.radiusMask
                                                        ]}
                                                        userNameText={{ fontSize: 12 }}
                                                    />
                                                )}
                                                {_.isEmpty(visitor.userStatsId) && (
                                                    <Image
                                                        style={[
                                                            styles.unassignImage,
                                                            styles.avatar,
                                                            styles.tooltipAvatar
                                                        ]}
                                                        source={ImageSrc.IMG_UNASSIGNED}
                                                    />
                                                )}
                                                <View
                                                    style={[
                                                        index === item.moreVisitors.length - 1
                                                            ? styles.borderBottomWidth0
                                                            : styles.borderBottomWidth1,
                                                        styles.tooltipView
                                                    ]}
                                                >
                                                    <CText
                                                        numberOfLines={1}
                                                        ellipsizeMode="tail"
                                                        style={[styles.tooltipUserName]}
                                                    >
                                                        {visitor.name || t.labels.PBNA_MOBILE_UNASSIGNED_VISITS}
                                                    </CText>
                                                </View>
                                            </View>
                                        )}
                                        {index === TOOLTIP_MAX_USER_COUNT && (
                                            <View style={styles.moreUsers}>
                                                <CText>......</CText>
                                            </View>
                                        )}
                                    </View>
                                )
                            })}
                        </ScrollView>
                    }
                >
                    {item?.longestDurationVisitor?.userStatsId && (
                        <UserAvatar
                            userStatsId={item?.longestDurationVisitor?.userStatsId}
                            firstName={firstName}
                            lastName={lastName}
                            avatarStyle={styles.avatar}
                            userNameText={{ fontSize: 12 }}
                        />
                    )}
                    {_.isEmpty(item?.longestDurationVisitor?.userStatsId) && !fromOptimized && (
                        <Image style={[styles.unassignImage, styles.avatar]} source={ImageSrc.IMG_UNASSIGNED} />
                    )}
                    <CText
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.userName, styles.textAlignRight, { marginTop: 4 }]}
                    >
                        {firstName}
                    </CText>
                    <CText style={[styles.userName, styles.textAlignRight, { marginTop: 2 }]}>
                        {lastName}, <CText style={styles.moreText}>+{item.moreVisitors?.length}</CText>
                    </CText>
                </Tooltip>
            )}
        </View>
    )
}

const avatarComponent = (item, hasAvatar, isReassign, disabled, fromOptimized?) => {
    if (hasAvatar) {
        return haveAvatarComponent(item, fromOptimized)
    }
    return haveNoAvatarComponent(isReassign, disabled, item)
}

const isReviewComponent = () => {
    return (
        <View style={[{ width: 30 }]}>
            <Image style={styles.avatar} source={IMG_CHEVRON} />
        </View>
    )
}

const renderWorkingDayStatus = (item, workDayArr) => {
    const workingDay = Object.keys(item.visits)
    return (
        <View style={styles.workingDayView}>
            {workDayArr &&
                workDayArr.map((day) => {
                    return (
                        <CText
                            key={day.label}
                            style={[
                                styles.workingStatus,
                                workingDay.includes(day.localeValue) && styles.activeWorkingStatus
                            ]}
                        >
                            {day.label}
                        </CText>
                    )
                })}
        </View>
    )
}

const CustomerCell = (props: CustomerProps) => {
    const { hasAvatar, item, isReview, isReassign, disabled, onCellPress } = props

    const [workDayArr] = useState(() => getWorkDayArr())

    return (
        <TouchableOpacity
            disabled={disabled}
            activeOpacity={1}
            onPress={() => {
                onCellPress && onCellPress()
            }}
        >
            <View
                style={[
                    styles.container,
                    styles.borderBottomColorWhite,
                    getContainerBottom(hasAvatar, isReview),
                    getContainerColor(hasAvatar, isReview)
                ]}
            >
                <View style={styles.marginRight15}>
                    <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
                    {item.hasUnassignVisit && (
                        <Image
                            style={[styles.unassignImage, styles.unassignContainer]}
                            source={ImageSrc.IMG_UNASSIGNED}
                        />
                    )}
                </View>
                <View
                    style={[
                        styles.rightInfo,
                        hasAvatar || isReview ? styles.borderBottomWidth1 : styles.borderBottomWidth0
                    ]}
                >
                    <View style={styles.flexShrinkCol}>
                        <View style={styles.flexDirectionCol}>
                            <CText numberOfLines={2} ellipsizeMode="tail" style={styles.storeName}>
                                {item.name}
                            </CText>
                        </View>
                        <View style={styles.flexShrinkCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                                {item.address}
                            </CText>
                            <CText style={styles.itemSubTile}>{item.cityStateZip}</CText>
                        </View>
                        <View style={[commonStyle.flexDirectionRow, styles.marginTop_2]}>
                            <CText style={[styles.itemSubTile, styles.textColorBlack]}>
                                {getTimeFromMinsWithHrs(item.totalPlanedVisitDuration)}
                            </CText>
                            <CText style={[styles.greyColor, { marginTop: 4 }]}> |</CText>
                            {renderWorkingDayStatus(item, workDayArr)}
                        </View>
                    </View>
                    {avatarComponent(item, hasAvatar, isReassign, disabled)}
                    {isReview && isReviewComponent()}
                </View>
            </View>
        </TouchableOpacity>
    )
}

export const SelectCustomerCell = (props: CustomerProps) => {
    const ManagerAdHocNew = getManagerAdHocNewImage()
    const { item, onCellPress, onCheckBoxClick, itemKey, fromOptimized, isEditMode, hasAvatar, isReassign, disabled } =
        props
    // handle subtype
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item?.subtype || item?.Visit_Subtype__c)
    return (
        <View style={[styles.container, styles.selectContainer, fromOptimized && styles.paddingRight_22]}>
            <TouchableOpacity
                onPress={() => {
                    onCellPress && onCellPress(item)
                }}
                style={[styles.touchableArea, styles.sortableCard]}
            >
                <View style={styles.marginRight15}>
                    <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
                </View>
                <View style={styles.cellContent}>
                    <View style={fromOptimized ? commonStyle.flex_1 : styles.cellInfo}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={[styles.storeName]}>
                            {item?.store?.name || item.StoreName}
                        </CText>
                        <View style={styles.flexShrinkCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                                {item?.store?.address || item.address}
                            </CText>
                            <CText numberOfLines={1} style={styles.itemSubTile}>
                                {item?.store?.cityStateZip || item.cityStateZip}
                            </CText>
                            <View style={styles.visitInfoContainer}>
                                <CText style={styles.fontSize12}>
                                    {getTimeFromMins(
                                        fromOptimized
                                            ? item.Planned_Duration_Minutes__c
                                            : item.totalDuration || item.Planned_Duration_Minutes__c
                                    )}
                                </CText>
                                <CText style={styles.splitLine}>|</CText>
                                <CText
                                    style={[styles.subtype, styles.textMaxWidth_180, commonStyle.flexShrink_1]}
                                    numberOfLines={1}
                                >
                                    {subtypeString}
                                </CText>
                                <CText style={[styles.subtype, styles.textMaxWidth_30]} numberOfLines={1}>
                                    {subtypeNumString}
                                </CText>
                                <CText style={styles.splitLine}>
                                    {item.pullNum || item.Pull_Number__c
                                        ? SPLIT_LINE
                                        : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                                </CText>
                                <CText style={styles.subtype}>
                                    {item.pullNum || item.Pull_Number__c
                                        ? 'P' + (item.pullNum || item.Pull_Number__c)
                                        : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                                </CText>
                                {/* will be add back in future */}
                                {/* <CText style={styles.spiltLineNoSpace}>{isTrueInDB(item?.dfFlag) ? ' | ' : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}</CText> */}
                                {/* <CText style={styles.subtype}>{isTrueInDB(item?.dfFlag) ? t.labels.PBNA_MOBILE_OPT_VISIT : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}</CText> */}
                                {fromOptimized && (
                                    <View style={commonStyle.flexDirectionRow}>
                                        <CText style={styles.splitLine}>
                                            {!_.isNull(item.forecastCost)
                                                ? SPLIT_LINE
                                                : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                                        </CText>
                                        <CText
                                            style={[styles.subtype, styles.textMaxWidth_180, commonStyle.flexShrink_1]}
                                            numberOfLines={1}
                                        >
                                            {!_.isNull(item.forecastCost)
                                                ? t.labels.PBNA_MOBILE_ORDER_D + item.forecastCost
                                                : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                                        </CText>
                                    </View>
                                )}
                                {(item?.takeOrder || item?.Take_Order_Flag__c) === TAKE_ORDER_STATUS_CODE && (
                                    <View style={[styles.orderContainer]}>
                                        <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            {!fromOptimized && (
                <CCheckBox
                    hitSlop={commonStyle.smallHitSlop}
                    onPress={() => {
                        onCheckBoxClick(itemKey)
                    }}
                    checked={item.select}
                    containerStyle={styles.uncheckContainer}
                />
            )}
            {fromOptimized && (
                <View style={[styles.flexDirectionCol, { alignItems: 'flex-end', height: '100%', paddingTop: 24 }]}>
                    {avatarComponent(item, hasAvatar, isReassign, disabled, fromOptimized)}
                    {isEditMode && (
                        <CCheckBox
                            hitSlop={commonStyle.smallHitSlop}
                            onPress={() => {
                                onCheckBoxClick(itemKey)
                            }}
                            checked={item.select}
                            containerStyle={styles.optimizedCheckBox}
                        />
                    )}
                </View>
            )}
            {/* <CCheckBox disabled checked={item.select} /> */}
            {item.mangerAdHoc && (
                <ManagerAdHocNew style={styles.imgNew} width={CommonParam.locale === Locale.fr ? 82 : 45} height={22} />
            )}
        </View>
    )
}

export const EmployeeDetailCustomerCell = (props: CustomerProps) => {
    const { item, onCellPress, onCheckBoxPress, itemKey, isEdit } = props
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item.subtype)
    return (
        <View style={[styles.container, styles.selectContainer]}>
            <TouchableOpacity
                onPress={() => {
                    onCellPress && onCellPress(item)
                }}
                style={styles.touchableArea}
            >
                <View style={styles.marginRight15}>
                    <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
                </View>
                <View style={styles.cellContent}>
                    <View style={styles.cellInfo}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={[styles.storeName]}>
                            {item.store.name}
                        </CText>
                        <View style={styles.flexShrinkCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                                {item.store.address}
                            </CText>
                            <CText numberOfLines={1} style={styles.itemSubTile}>
                                {item.store.cityStateZip}
                            </CText>
                        </View>
                        <View style={[styles.subtypeContainer]}>
                            <CText
                                style={[styles.subtype, styles.textMaxWidth_180, commonStyle.flexShrink_1]}
                                numberOfLines={1}
                            >
                                {subtypeString}
                            </CText>
                            <CText style={[styles.subtype, styles.textMaxWidth_30]} numberOfLines={1}>
                                {subtypeNumString}
                            </CText>
                            <CText style={styles.subtypeLine}>
                                {item.pullNum ? SPLIT_LINE : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            <CText style={styles.subtype}>
                                {item.pullNum
                                    ? SUBTYPE_PRE_TITLE + item.pullNum
                                    : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            {item.takeOrder === TAKE_ORDER_STATUS_CODE && (
                                <View style={[styles.orderContainer]}>
                                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.checkBoxTouchArea}
                onPress={() => onCheckBoxPress && onCheckBoxPress(itemKey)}
            >
                {isEdit && <CCheckBox disabled checked={item.select} containerStyle={styles.uncheckContainer} />}
            </TouchableOpacity>
        </View>
    )
}

export const SummaryCustomerList = (props: CustomerProps) => {
    const { item } = props
    return (
        <View style={[styles.container, commonStyle.flex_1]}>
            <View style={styles.marginRight15}>
                <IMG_STORE_PLACEHOLDER style={styles.imgStore} />
            </View>
            <View style={[styles.flexContainer, commonStyle.flexShrink_1]}>
                <View style={commonStyle.flexGrow_1}>
                    <CText numberOfLines={2} ellipsizeMode="tail" style={styles.storeName}>
                        {item?.name}
                    </CText>
                    <View style={styles.flexShrinkCol}>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.itemSubTile}>
                            {item?.address}
                        </CText>
                        <CText style={styles.itemSubTile}>{item?.cityStateZip}</CText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default CustomerCell
