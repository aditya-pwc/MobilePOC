/*
 * @Description:
 * @LastEditors: Yi Li
 */
import React, { useContext } from 'react'
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import UserAvatar from '../../../common/components/UserAvatar'
import { CommonParam } from '../../../common/CommonParam'
import { CommonApi } from '../../../common/api/CommonApi'
import CText from '../../../common/components/CText'
import DeliveryIcon from '../../../../assets/image/icon-delivery-route-1.svg'
import MerchIcon from '../../../../assets/image/icon-merch-route.svg'
import OrderIcon from '../../../../assets/image/icon-sales-route.svg'
import _ from 'lodash'
import { VisitStatus } from '../../enum/VisitType'
import { RecordTypeEnum } from '../../../savvy/enums/RecordType'
import { t } from '../../../common/i18n/t'
import { RouteModalContext } from '../../pages/MyDayScreen/MyDayScreen'
import { useAppSelector } from '../../../savvy/redux/ReduxHooks'
import { myDaySelectedDateSelector } from '../../redux/slice/MyDaySlice'
interface ActionCellViewProps {
    userInfo: any
}

const styles = StyleSheet.create({
    whiteCont: {
        backgroundColor: '#FFFFFF',
        width: Dimensions.get('window').width - 44,
        flex: 1
    },
    contRadius: {
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5
    },
    contView: {
        width: Dimensions.get('window').width - 46,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#F2F4F7',
        borderRadius: 5,
        marginHorizontal: 1,
        marginVertical: 1
    },
    leftCont: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    imgAvatar: {
        width: 26,
        height: 26,
        borderRadius: 4,
        marginVertical: 7
    },
    nameText: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        height: 16,
        marginLeft: 5
    },
    rightCont: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginLeft: 5
    },
    redPill: {
        width: 40,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EB445A',
        alignItems: 'center',
        justifyContent: 'center'
    },
    osText: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500'
    },
    statusIcon: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 6
    },
    actionCont: {
        flexDirection: 'row',
        marginRight: 4,
        marginLeft: 8
    },
    actionIcon: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 4
    },
    arrowIcon: {
        width: 15,
        height: 24
    }
})

const getBgWithStatus = (visitStatus: string) => {
    if (VisitStatus.PUBLISHED === visitStatus) {
        return {
            backgroundColor: '#EB445A'
        }
    } else if (VisitStatus.IN_PROGRESS === visitStatus) {
        return {
            backgroundColor: '#FFC409'
        }
    } else if (VisitStatus.COMPLETE === visitStatus) {
        return {
            backgroundColor: '#2DD36F'
        }
    }
}

const getActionIcon = (actionType: string) => {
    return (
        <View style={styles.actionIcon}>
            {actionType === RecordTypeEnum.DELIVERY && <DeliveryIcon />}
            {actionType === RecordTypeEnum.MERCHANDISING && <MerchIcon />}
            {actionType === RecordTypeEnum.SALES && <OrderIcon />}
        </View>
    )
}

const ActionCellView = (props: ActionCellViewProps) => {
    const { userInfo } = props
    const routeModalRef = useContext(RouteModalContext)
    const selectedDate = useAppSelector(myDaySelectedDateSelector)

    const getNameWidth = () => {
        let defaultWidth = 240
        if (_.size(userInfo?.actionIcons) > 0) {
            defaultWidth = defaultWidth - _.size(userInfo?.actionIcons) * 25
        }
        if (userInfo?.showOffScheduleIcon) {
            defaultWidth = defaultWidth - 50
        }
        if (!_.isEmpty(userInfo?.statusString)) {
            defaultWidth = defaultWidth - 70
        }

        return defaultWidth
    }
    const onPressRouteModal = () => {
        routeModalRef?.current?.openModal(userInfo?.UserId, selectedDate, userInfo?.actionIcons?.[0]) // Since the requirement change, actionIcons will always only have one obj
    }
    const disabledRouteModal = () => {
        return _.isEmpty(userInfo?.UserId)
    }
    return (
        <View style={[styles.whiteCont, userInfo.showRadius && styles.contRadius]}>
            <View style={styles.contView}>
                <View style={styles.leftCont}>
                    {userInfo && (
                        <UserAvatar
                            url={`${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${userInfo.userStatsId}`}
                            firstName={userInfo?.FirstName}
                            lastName={userInfo?.LastName}
                            avatarStyle={styles.imgAvatar}
                            isUnassigned={_.isEmpty(userInfo?.UserId)}
                        />
                    )}
                    <CText style={[styles.nameText, { width: getNameWidth() }]} numberOfLines={1} ellipsizeMode="tail">
                        {userInfo?.UserId ? userInfo?.UserName : t.labels.PBNA_MOBILE_UNASSIGNED_VISIT}
                    </CText>
                </View>
                <View style={[styles.rightCont]}>
                    {userInfo?.showOffScheduleIcon && (
                        <View style={styles.redPill}>
                            <CText style={styles.osText}>OS</CText>
                        </View>
                    )}
                    {userInfo?.statusString.length > 0 && (
                        <View style={[styles.statusIcon, getBgWithStatus(userInfo?.statusString)]} />
                    )}
                    {userInfo?.statusString.length > 0 && <CText style={styles.nameText}>{userInfo?.statusLang}</CText>}
                    <TouchableOpacity
                        onPress={onPressRouteModal}
                        disabled={disabledRouteModal()}
                        style={styles.rightCont}
                    >
                        <View style={styles.actionCont}>
                            {userInfo?.actionIcons.map((actionName: string) => {
                                return getActionIcon(actionName)
                            })}
                        </View>
                        <View>
                            <Image style={styles.arrowIcon} source={ImageSrc.IMG_CHEVRON} resizeMode="contain" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
export default ActionCellView
