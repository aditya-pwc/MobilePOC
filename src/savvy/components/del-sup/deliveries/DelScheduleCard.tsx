/*
 * @Author: fangfang ji
 * @Date: 2021-12-20
 * @LastEditTime: 2023-05-17 14:39:37
 * @FilePath: /Halo_Mobile/src/components/merchandiser/ScheduleVisitCard.tsx
 */

import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import Utils, { formatClock } from '../../../common/DateTimeUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import UserAvatar from '../../common/UserAvatar'
import IMG_PEPSICO from '../../../../../assets/image/Icon-store-placeholder.svg'
import ERROR_DELIVERY from '../../../../../assets/image/icon-error-visit-list.svg'
import { VisitStatus } from '../../../enums/Visit'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import { getTimeFromMins } from '../../../utils/MerchManagerUtils'
import { t } from '../../../../common/i18n/t'
import VisitActionBlock from '../../merchandiser/VisitActionBlock'
import moment from 'moment'
import { getRound } from '../../../utils/CommonUtils'
import renderPill from '../../common/COrderPill'
import _ from 'lodash'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../../common/enums/MomentUnit'

const styles = StyleSheet.create({
    iconXXL: {
        width: 58,
        height: 58
    },
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
        position: 'relative'
    },
    status: {
        position: 'absolute',
        bottom: 0,
        height: 26,
        width: 26,
        right: 0
    },
    eImgPortrait: {
        width: 26,
        height: 26,
        borderRadius: 4
    },
    userNameText: {
        fontSize: 12,
        borderRadius: 4,
        fontFamily: 'Gotham'
    },
    nameText: {
        textAlign: 'right',
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Gotham'
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
    pillContainer: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: -10
    },
    timeText: {
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Gotham'
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    grayText: {
        color: '#565656',
        fontSize: 12,
        fontFamily: 'Gotham'
    },
    rowCon: { flexDirection: 'row', paddingHorizontal: 22, height: 40, backgroundColor: '#F2F4F7', paddingTop: 10 },
    horLineContainer: { height: 1, backgroundColor: '#F2F4F7' },
    horLine: { marginHorizontal: 22, height: 1, backgroundColor: '#fff' },
    flexWrap: {
        flexWrap: 'wrap'
    },
    marginTop_5: {
        marginTop: 5
    },
    errorDeliveryStyle: {
        marginLeft: 5,
        alignSelf: 'center'
    },
    sequenceLabel: {
        fontWeight: '400',
        color: '#565656',
        fontSize: 12
    },
    sequenceView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    greenCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 7,
        borderWidth: 1,
        borderColor: '#2DD36F'
    },
    redCircle: {
        borderColor: '#EB445A'
    },
    sequenceText: {
        fontWeight: '700',
        color: '#000',
        fontSize: 12
    },
    boxFooterView: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    }
})
interface DelScheduleVisitCardProps {
    item?: any
    hideUserInfo?: boolean
    showPhoneAndLoc?: boolean
    showIndicator?: boolean
    onItemPress?: Function
    isForSDLEmployeeSchedule?: boolean
    myDay?: boolean
    isEmployeeSchedule?: boolean
}

const renderUserInfo = (item) => {
    return (
        <View style={styles.userInfo}>
            <UserAvatar
                isUnassigned={item.unassign}
                userStatsId={item.UserStatsId}
                firstName={item.FirstName}
                lastName={item.LastName}
                avatarStyle={styles.eImgPortrait}
                userNameText={styles.userNameText}
            />
            <View style={styles.marginTop_5}>
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
    if (item.status === VisitStatus.COMPLETE) {
        return <Image style={styles.status} source={require('../../../../../assets/image/icon_checkmark_circle.png')} />
    } else if (item.status === VisitStatus.IN_PROGRESS) {
        return <Image style={styles.status} source={require('../../../../../assets/image/icon-location-current.png')} />
    }
    return <View />
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
const DelScheduleVisitCard = (props: DelScheduleVisitCardProps) => {
    const { item, onItemPress, myDay, isEmployeeSchedule } = props
    const renderActualTimeFooter = (hideDelivery = false) => {
        if (item.status !== VisitStatus.COMPLETE) {
            return <View />
        }
        const durationMin = item.ActualVisitEndTime
            ? moment(item.ActualVisitEndTime).diff(moment(item.ActualVisitStartTime), MOMENT_UNIT.MINUTES)
            : 0
        const startTime = formatWithTimeZone(item.ActualVisitStartTime, TIME_FORMAT.HHMMA, true, false)
        const endTime = item.ActualVisitEndTime
            ? ' - ' + formatWithTimeZone(item.ActualVisitEndTime, TIME_FORMAT.HHMMA, true, false)
            : ''
        const durationTime = startTime + endTime
        const durationGap = formatClock({
            hour: Math.floor(durationMin >= 60 ? durationMin / 60 : 0),
            min: durationMin % 60
        })

        const showRedIndicator =
            (((item.Check_Out_Location_Flag__c === '0' || item.Check_Out_Location_Flag__c === false) &&
                item.ActualVisitEndTime) ||
                ((item.InLocation === '0' || item.InLocation === false) && item.ActualVisitStartTime)) &&
            props.showIndicator

        return (
            <View>
                <View style={styles.horLineContainer}>
                    <View style={styles.horLine} />
                </View>

                <View style={[styles.rowCon, styles.flexWrap]}>
                    <TimeRow time={durationTime} duration={durationGap} />
                    <View style={commonStyle.flex_1} />
                    {!hideDelivery && (
                        <DelQtyRow
                            timeDes={t.labels.PBNA_MOBILE_DEL_QTY}
                            plt={item.delPlt}
                            cs={getRound(item.actCs, '0')}
                        />
                    )}
                    {showRedIndicator && <ERROR_DELIVERY width={20} height={20} style={styles.errorDeliveryStyle} />}
                </View>
            </View>
        )
    }

    const renderScheduleTimeFooter = () => {
        const durationMin = item.PlanEndTime
            ? moment(item.PlanEndTime).diff(moment(item.PlanStartTime), MOMENT_UNIT.MINUTES)
            : 0
        const startTime = formatWithTimeZone(item.PlanStartTime, TIME_FORMAT.HHMMA, true, false)
        const duration = getTimeFromMins(durationMin)

        return (
            <View>
                <View style={styles.horLineContainer}>
                    <View style={styles.horLine} />
                </View>
                <View style={styles.rowCon}>
                    <TimeRow time={startTime} duration={duration} />
                    <View style={commonStyle.flex_1} />
                    <DelQtyRow
                        timeDes={t.labels.PBNA_MOBILE_SCHEDULED_QTY}
                        plt={item.schPlt}
                        cs={getRound(item.schCs, '0')}
                    />
                </View>
            </View>
        )
    }

    const renderSequence = () => {
        return (
            <View style={styles.rowCon}>
                <View style={styles.boxFooterView} />
                <View style={styles.sequenceView}>
                    <CText style={styles.sequenceLabel}>{t.labels.PBNA_MOBILE_PLANNED_SEQUENCE}</CText>
                    <View style={[styles.greenCircle, item.actualSequence !== item.sequence && styles.redCircle]}>
                        <CText style={styles.sequenceText}>
                            {!_.isEmpty(item.actualSequence) && item.actualSequence === item.sequence
                                ? item.actualSequence
                                : item.sequence}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }

    const renderTimeFooter = () => {
        if (props.isForSDLEmployeeSchedule) {
            return renderActualTimeFooter(true)
        }
        return (
            <View>
                {isEmployeeSchedule && item.status !== VisitStatus.PUBLISH && renderSequence()}
                {renderScheduleTimeFooter()}
                {renderActualTimeFooter()}
            </View>
        )
    }

    const renderPillsForSDLEmployeeSchedule = (textString: string[]) => {
        if (!props.isForSDLEmployeeSchedule || !textString || textString.length === 0) {
            return <View />
        }

        return (
            <View style={styles.pillContainer}>
                {textString.map((text) => {
                    return renderPill(text)
                })}
            </View>
        )
    }

    const renderCenterInfo = () => {
        return (
            <View style={[styles.boxContentTextArea, { flex: 1 }]}>
                <View style={commonStyle.flexRowSpaceCenter}>
                    <View style={styles.contentText}>
                        <CText numberOfLines={2} ellipsizeMode="tail" style={styles.itemTile}>
                            {item.name}
                        </CText>
                    </View>
                </View>
                <View style={commonStyle.flexRowSpaceCenter}>
                    <View style={styles.contentText}>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUse]}>
                            {item.address}
                        </CText>
                        <CText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[styles.itemSubTile, styles.addressUseSub]}
                        >
                            {item.cityStateZip}
                        </CText>
                    </View>
                </View>
                {renderPillsForSDLEmployeeSchedule(item.pills)}
            </View>
        )
    }
    return (
        <TouchableOpacity
            onPress={() => {
                onItemPress && onItemPress()
            }}
        >
            <View style={[styles.boxWithShadow, item?.inGeoFence && styles.location]}>
                <View style={[styles.boxContent, item.status === VisitStatus.COMPLETE && styles.complete]}>
                    <View style={styles.imageGroup}>
                        <IMG_PEPSICO style={styles.iconXXL} />
                        {getVisitIcon(item)}
                    </View>
                    {renderCenterInfo()}
                    {!props.hideUserInfo && renderUserInfo(item)}
                    {props.showPhoneAndLoc && (
                        <VisitActionBlock item={item} isVisitList hasUserInfo={false} withoutCallIcon={false} />
                    )}
                </View>
                {!myDay && renderTimeFooter()}
            </View>
        </TouchableOpacity>
    )
}

export default DelScheduleVisitCard
