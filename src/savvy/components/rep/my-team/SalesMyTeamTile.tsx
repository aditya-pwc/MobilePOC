/**
 * @description team member information tile for sales manager
 * @author Sheng Huang
 * @date 2022/1/5
 */
import React, { FC, useState, useRef } from 'react'
import { Animated, StyleSheet, View, Alert } from 'react-native'
import UserAvatar from '../../common/UserAvatar'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import moment from 'moment'
import { RectButton, Swipeable } from 'react-native-gesture-handler'
import SalesRemoveEmployee from './SalesRemoveEmployee'
import { t } from '../../../../common/i18n/t'
import SVGPhoneMsgView from '../../manager/common/SVGPhoneMsgView'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

interface SalesMyTeamTileProps {
    item: any
    setRemoveFlag?: any
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        marginVertical: 11,
        borderRadius: 5,
        flexDirection: 'column',
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.4,
        flex: 1,
        marginHorizontal: '5%'
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    imgPhoneAndMsg: {
        width: 23,
        height: 25
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    userAvatar: {
        position: 'relative'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    lineText: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12
    },
    rightAction: {
        alignItems: 'center',
        height: 150,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 10
    },
    rightActionCont: {
        width: 90,
        marginRight: '5%',
        marginLeft: '-6%'
    },
    rightAnimationV: {
        flex: 1,
        marginTop: 11
    },
    phoneView: {
        paddingLeft: 20
    },
    contentView: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    beginDateT: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12
    },
    routeCont: {
        height: 40,
        backgroundColor: '#F2F4F7',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    rteId: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12
    }
})
export const getFullTime = (value) => {
    const v = value?.toString().toLowerCase()
    if (v === 'false') {
        return 'PT'
    } else if (v === 'true') {
        return 'FT'
    }
    return null
}
const SalesMyTeamTile: FC<SalesMyTeamTileProps> = (props: SalesMyTeamTileProps) => {
    const { item, setRemoveFlag } = props

    let swipeableRow: Swipeable
    const close = () => {
        swipeableRow?.close()
    }
    const [isShowRemoveModal, setIsShowRemoveModal] = useState(false)
    const renderPopUp = async () => {
        Alert.alert(t.labels.PBNA_MOBILE_REMOVE_TEAM_MEMBER, t.labels.PBNA_MOBILE_REMOVE_EMPLOYEE_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL
            },
            {
                text: _.capitalize(t.labels.PBNA_MOBILE_REMOVE),
                onPress: () => {
                    setIsShowRemoveModal(true)
                }
            }
        ])
    }
    const renderRightActions = () => {
        const pressHandler = () => {
            close()
            renderPopUp()
        }
        return (
            <View style={styles.rightActionCont}>
                <Animated.View style={styles.rightAnimationV}>
                    <View style={[styles.rightAction, { backgroundColor: '#EB445A' }]}>
                        <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                            <CText style={styles.actionText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </RectButton>
                    </View>
                </Animated.View>
            </View>
        )
    }

    const renderPhoneView = (teamItem) => {
        return (
            <View style={styles.phoneView}>
                <SVGPhoneMsgView
                    phone={teamItem.MobilePhone}
                    noteStyle={styles.rowWithCenter}
                    phoneStyle={[styles.rowWithCenter]}
                />
            </View>
        )
    }
    const renderContent = (contentItem) => {
        return (
            <View style={styles.itemContentContainer}>
                <CText style={styles.contentView} numberOfLines={1}>
                    {contentItem.Name}
                </CText>
                <View style={styles.rowCenter}>
                    <CText style={styles.lineText}>{getFullTime(contentItem.FT_EMPLYE_FLG_VAL__c)}</CText>
                    {!_.isEmpty(contentItem.Title) && !_.isEmpty(contentItem.FT_EMPLYE_FLG_VAL__c) && (
                        <CText style={styles.itemLine}>{' | '}</CText>
                    )}
                    <CText style={styles.lineText} numberOfLines={1}>
                        {contentItem.Title || ''}
                    </CText>
                </View>
                <View style={styles.rowCenter}>
                    <CText style={styles.lineText} numberOfLines={1}>
                        {t.labels.PBNA_MOBILE_JOINED_TEAM}
                    </CText>
                    {contentItem.relationship_begin_date__c && (
                        <CText style={styles.beginDateT}>
                            {` ${moment(contentItem.relationship_begin_date__c).format(TIME_FORMAT.MMMDDY)}`}
                        </CText>
                    )}
                </View>
            </View>
        )
    }
    const renderRoute = (routeItem) => {
        return (
            <View style={styles.routeCont}>
                <View style={commonStyle.flexDirectionRow}>
                    <CText style={styles.beginDateT}>{t.labels.PBNA_MOBILE_LOCAL_ROUTE}</CText>
                    <CText style={styles.rteId}>{` ${routeItem.LOCL_RTE_ID__c || ''}`}</CText>
                </View>
                <View style={commonStyle.flexDirectionRow}>
                    <CText style={styles.beginDateT}>{t.labels.PBNA_MOBILE_NATIONAL_ID}</CText>
                    <CText style={styles.rteId}>{` ${routeItem.GTMU_RTE_ID__c || ''}`}</CText>
                </View>
            </View>
        )
    }
    const removeRef = useRef()
    const renderModal = (modalItem) => {
        const removeEmployee = async () => {
            setIsShowRemoveModal(false)
        }
        return (
            <SalesRemoveEmployee
                setRemoveFlag={setRemoveFlag}
                onLeftButtonPress={() => setIsShowRemoveModal(false)}
                onRightButtonPress={removeEmployee}
                detail={modalItem}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                rightButtonLabel={t.labels.PBNA_MOBILE_CONFIRM.toUpperCase()}
                cRef={removeRef}
            />
        )
    }
    return (
        <View>
            <Swipeable
                ref={(ref) => {
                    if (ref !== undefined) {
                        swipeableRow = ref
                    }
                }}
                friction={1}
                enableTrackpadTwoFingerGesture
                renderRightActions={() => renderRightActions()}
                overshootRight={false}
                enabled
            >
                <View style={styles.container}>
                    <View style={[styles.teamItem_without_border, { display: 'flex', width: '100%' }]}>
                        <View style={styles.userAvatar}>
                            <UserAvatar
                                userStatsId={item.userStatsId}
                                firstName={item.FirstName}
                                lastName={item.LastName}
                                avatarStyle={styles.imgUserImage}
                                userNameText={{ fontSize: 24 }}
                            />
                        </View>
                        {renderContent(item)}
                        {renderPhoneView(item)}
                    </View>
                    {renderRoute(item)}
                </View>
            </Swipeable>
            {isShowRemoveModal && renderModal(item)}
        </View>
    )
}

export default SalesMyTeamTile
