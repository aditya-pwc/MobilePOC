import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import UserAvatar from '../../common/UserAvatar'
import RowMsgPhoneView from '../../manager/common/RowMsgPhoneView'
import { renderIndicator } from '../../manager/common/EmployeeCell'
import { VisitStatus, VisitRecordType } from '../../../enums/Visit'
import FavoriteIcon from '../../../../../assets/image/favorite.svg'
import { COLOR_TYPE } from '../../../enums/MerchandiserEnums'
import WhiteTriangle from '../../../../../assets/image/Triangle-sdl-copilot.svg'

const VanIcon = require('../../../../../assets/image/moving-truck.png')

const styles = StyleSheet.create({
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    infoText: {
        fontSize: 12,
        color: baseStyle.color.black,
        lineHeight: 16,
        fontFamily: 'Gotham'
    },
    avatarContainer: {
        width: 40,
        height: 40
    },
    titleView: { marginHorizontal: 22, marginTop: 30, marginBottom: 10 },
    titleViewSdl: {
        marginHorizontal: 22,
        marginTop: 30,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleText: { fontSize: 24, color: baseStyle.color.black, fontWeight: '900', fontFamily: 'Gotham' },
    titleTextsdl: { fontSize: 14, color: baseStyle.color.black, fontWeight: '400', fontFamily: 'Gotham' },
    infoTextBold: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
        fontFamily: 'Gotham'
    },
    sumCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        marginTop: 30
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    statusIcon: {
        marginRight: 8,
        width: 8,
        height: 8,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4
    },
    statusText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham'
    },
    itemCon: {
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: baseStyle.color.white
    },
    nameText: { fontSize: 16, fontWeight: 'bold', lineHeight: 18, fontFamily: 'Gotham' },
    bottomLine: { backgroundColor: baseStyle.color.borderGray, marginLeft: 77, height: 1 },
    rowMsg: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
    itemCenterView: { flex: 1, marginLeft: 15 },
    itemCenterViewMyDay: { flex: 1, marginLeft: 15 },
    userImg: { fontSize: 16 },
    blackText: { fontSize: 12, color: baseStyle.color.black, fontFamily: 'Gotham' },
    grayText: { color: baseStyle.color.titleGray, fontSize: 12, fontFamily: 'Gotham' },
    liteGreyText: { color: baseStyle.color.liteGrey, fontSize: 12, fontFamily: 'Gotham' },
    trian: {
        width: 10,
        height: 5,
        transform: [{ rotate: '180deg' }],
        marginTop: 6,
        marginLeft: 3
    },
    flexStyle: { flexDirection: 'row' },
    dispatchBtn: { flexDirection: 'row', alignItems: 'center' },
    dispatchText: { fontSize: 12, fontWeight: 'bold', color: '#00A2D9' },
    dispatchIcon: { marginLeft: 8, width: 20, height: 20, resizeMode: 'contain' },
    favoriteIcon: { position: 'absolute', top: 0, right: 12 },
    phoneIcon: { flex: 1, paddingTop: 8 },
    raceTrack: { height: 5, marginVertical: 2, marginHorizontal: 1.5, flex: 1 },
    marginTop_10: { marginTop: 10 },
    middleView: { flex: 1, flexGrow: 0, flexShrink: 1, flexBasis: 240 },
    whiteTriangle: { marginTop: 7, marginLeft: 6 }
})

export const ScheduleSumInfoType = {
    LEFT: 'flex-start',
    CENTER: 'center',
    RIGHT: 'flex-end'
}
export const SumDataItem = (props: any) => {
    const { des, val, type } = props
    return (
        // keep in-line style for dynamic UI component
        <View style={{ alignItems: type, ...commonStyle.flex_1 }}>
            <CText style={styles.infoText}>{des}</CText>
            <CText style={styles.infoTextBold}>{val || 0}</CText>
        </View>
    )
}
export const ScheduleSumInfoHeader = (props: { data: any; isForOrder?: boolean; activeTab?: any }) => {
    const isForOrder = props.isForOrder
    if (isForOrder) {
        const { stopsCount, caseCount, offScheduleCount } = props.data
        return (
            <View style={styles.sumCon}>
                <SumDataItem type={ScheduleSumInfoType.LEFT} des={t.labels.PBNA_MOBILE_STOPS} val={stopsCount} />
                <SumDataItem type={ScheduleSumInfoType.CENTER} des={t.labels.PBNA_MOBILE_CASES} val={caseCount} />
                <SumDataItem
                    type={ScheduleSumInfoType.RIGHT}
                    des={_.capitalize(t.labels.PBNA_MOBILE_OFF_SCHEDULE)}
                    val={offScheduleCount}
                />
            </View>
        )
    }
    if (props.activeTab === 1) {
        const { deliveryCount, caseCount, offScheduleCount } = props.data
        return (
            <View style={styles.sumCon}>
                <SumDataItem
                    type={ScheduleSumInfoType.LEFT}
                    des={t.labels.PBNA_MOBILE_DELIVERIES}
                    val={deliveryCount}
                />
                <SumDataItem type={ScheduleSumInfoType.CENTER} des={t.labels.PBNA_MOBILE_CASES} val={caseCount} />
                <SumDataItem
                    type={ScheduleSumInfoType.RIGHT}
                    des={_.capitalize(t.labels.PBNA_MOBILE_OFF_SCHEDULE)}
                    val={offScheduleCount}
                />
            </View>
        )
    }
    const { completeCount, inProgressCount, noStartCount } = props.data
    return (
        <View style={styles.sumCon}>
            <SumDataItem type={ScheduleSumInfoType.LEFT} des={t.labels.PBNA_MOBILE_YET_TO_START} val={noStartCount} />
            <SumDataItem
                type={ScheduleSumInfoType.CENTER}
                des={t.labels.PBNA_MOBILE_IN_PROGRESS}
                val={inProgressCount}
            />
            <SumDataItem type={ScheduleSumInfoType.RIGHT} des={t.labels.PBNA_MOBILE_COMPLETED} val={completeCount} />
        </View>
    )
}

interface DelEmployeeItemProps {
    item?: any
    onItemPress?: Function
    type?: boolean
    isLastItem?: boolean
}

const LiteGrayText = (props: any) => {
    return <Text style={styles.liteGreyText}>{props.msg}</Text>
}

const GrayText = (props: any) => {
    const { msg, lineText } = props

    return (
        <Text style={styles.grayText}>
            {msg}
            <LiteGrayText msg={lineText} />
        </Text>
    )
}

export const RowText = (props: any) => {
    const { des, val, style, lineText } = props
    return (
        <View style={[styles.rowCenter, style]}>
            <LiteGrayText msg={lineText} />
            <GrayText msg={des} />
            <Text style={styles.blackText}>{val}</Text>
        </View>
    )
}

const DayWorkStatus = (props: any) => {
    const { status, style } = props
    const statusConfigure = {
        completed: { title: t.labels.PBNA_MOBILE_COMPLETED, color: baseStyle.color.loadingGreen },
        inProgress: { title: t.labels.PBNA_MOBILE_IN_PROGRESS, color: baseStyle.color.yellow },
        yet2Start: { title: t.labels.PBNA_MOBILE_YET_TO_START, color: baseStyle.color.red }
    }
    return (
        <View style={[styles.rowCenter, style]}>
            <View style={[styles.statusIcon, { backgroundColor: statusConfigure[status]?.color }]} />
        </View>
    )
}
const calculateGeofenceIssues = (item: any) => {
    let cnt = 0
    if (!_.isEmpty(item?.visits) && Array.isArray(item?.visits)) {
        item?.visits?.forEach((visit) => {
            if (visit['RecordType.Name']) {
                if (
                    visit['RecordType.Name'] === VisitRecordType.DELIVERY &&
                    visit?.Status__c === VisitStatus.COMPLETE &&
                    visit?.Check_In_Location_Flag__c === '0' &&
                    visit?.Check_Out_Location_Flag__c === '0'
                ) {
                    cnt++
                }
            }
        })
    }
    return cnt
}

const renderRouteAndNationalId = (type, item) => {
    return (
        <View style={styles.rowMsg}>
            <RowText
                des={type ? `${t.labels.PBNA_MOBILE_SALES_ROUTE} ` : `${t.labels.PBNA_MOBILE_LOCAL_ROUTE} `}
                val={item.LocalRoute ? item.LocalRoute : t.labels.PBNA_MOBILE_DASH}
            />
            <RowText
                des={` ${t.labels.PBNA_MOBILE_NATIONAL_ID} `}
                val={item.NationalId ? item.NationalId : t.labels.PBNA_MOBILE_DASH}
                lineText={'  | '}
            />
        </View>
    )
}

const renderRaceTrack = (visit) => {
    if (visit.finalStatus === VisitStatus.COMPLETE) {
        return <View style={[styles.raceTrack, { backgroundColor: visit.color }]} />
    }
    return <View style={[styles.raceTrack, { backgroundColor: COLOR_TYPE.GRAY }]} />
}

export const DelEmployeeItem = (props: DelEmployeeItemProps) => {
    const { onItemPress, item, type, isLastItem } = props
    const indicatorDimension = 20
    return (
        <TouchableOpacity key={item?.id} activeOpacity={1} onPress={() => onItemPress && onItemPress(item)}>
            <View style={[styles.itemCon, item.isFavorited && { height: 'auto' }]}>
                {item.isFavorited && <FavoriteIcon style={styles.favoriteIcon} width={19} height={24} />}
                <View style={styles.avatarContainer}>
                    <UserAvatar
                        isUnassigned={item.unassign}
                        userStatsId={item.userStatsId}
                        avatarStyle={styles.imgAvatar}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        userNameText={styles.userImg}
                        needBorder={item.isMyDirect}
                    />
                    {renderIndicator(indicatorDimension, calculateGeofenceIssues(item))}
                </View>
                <View style={[type ? styles.itemCenterViewMyDay : styles.itemCenterView]}>
                    <View style={styles.flexStyle}>
                        <View style={styles.middleView}>
                            <CText style={styles.nameText}>{item.name}</CText>
                            {item.unassign ? (
                                <View style={styles.rowMsg}>
                                    <RowText des={t.labels.PBNA_MOBILE_LOAD + ' '} val={item.LoadNum} />
                                </View>
                            ) : (
                                renderRouteAndNationalId(type, item)
                            )}
                            <View style={[styles.rowMsg, { width: 310 }]}>
                                {item.status && <DayWorkStatus status={item.status} />}
                                {!type && <GrayText msg={item.totalHrs} lineText={' | '} />}
                                {!type && (
                                    <GrayText
                                        msg={`${item.finishCs}/${
                                            item.allCs
                                        } ${t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()} `}
                                        lineText={' | '}
                                    />
                                )}
                                {type ? (
                                    <GrayText
                                        msg={` ${item.finished}/${item.all} ${t.labels.PBNA_MOBILE_VISITS}`}
                                        lineText={' |'}
                                    />
                                ) : (
                                    <GrayText
                                        msg={` ${item.finished}/${
                                            item.all
                                        } ${t.labels.PBNA_MOBILE_STOPS.toLowerCase()}   `}
                                    />
                                )}
                                {type && (
                                    <GrayText
                                        msg={` ${item.OrderNumber || 0}/${item.OrderDenominator || 0} ${
                                            t.labels.PBNA_MOBILE_DELIVERY_ORDERS
                                        }   `}
                                    />
                                )}
                            </View>
                        </View>
                        <View style={styles.phoneIcon}>{!item.unassign && RowMsgPhoneView(item.phone)}</View>
                    </View>
                    <View style={[styles.flexStyle, styles.marginTop_10]}>
                        {item?.all === 0 ? (
                            <View style={[styles.raceTrack, { backgroundColor: COLOR_TYPE.GRAY }]} />
                        ) : (
                            item?.amas?.map((visit) => {
                                return renderRaceTrack(visit)
                            })
                        )}
                    </View>
                </View>
            </View>
            {!(isLastItem && item.isFavorited) && <View style={styles.bottomLine} />}
        </TouchableOpacity>
    )
}
// PBNA_MOBILE_LOCAL_ROUTE
export const DelHeader = (props: any) => {
    const { navigation } = props
    return (
        <View style={[styles.titleView, commonStyle.flexRowSpaceBet]}>
            <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_MY_DAY}</CText>
            <TouchableOpacity style={styles.dispatchBtn} onPress={() => navigation.navigate('DispatchReport')}>
                <CText style={styles.dispatchText}>{t.labels.PBNA_MOBILE_DISPATCH_REPORT.toLocaleUpperCase()}</CText>
                <Image source={VanIcon} style={styles.dispatchIcon} />
            </TouchableOpacity>
        </View>
    )
}

interface SDLHeaderProps {
    setTypeModalVisible: Function
    typeModalVisible: boolean
    selectRouteNum: number
    style?: any
    textStyle?: any
    titleName?: string
}

export const SDLHeader = (props: SDLHeaderProps) => {
    const { setTypeModalVisible, typeModalVisible, selectRouteNum, titleName, style, textStyle } = props
    return (
        <View style={[styles.titleViewSdl, style]}>
            <CText style={styles.titleText}>{titleName}</CText>
            <TouchableOpacity
                onPress={() => {
                    setTypeModalVisible && setTypeModalVisible(!typeModalVisible)
                }}
            >
                <View style={commonStyle.flexDirectionRow}>
                    <CText style={[styles.titleTextsdl, textStyle]}>
                        {`${t.labels.PBNA_MOBILE_TERRITORY}(${selectRouteNum})`}
                    </CText>
                    {titleName ? (
                        <Image source={ImageSrc.ICON_TRIANGLE_UP} style={styles.trian} />
                    ) : (
                        <WhiteTriangle style={styles.whiteTriangle} />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}
