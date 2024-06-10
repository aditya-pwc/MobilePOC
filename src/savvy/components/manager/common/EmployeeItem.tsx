/**
 * @description Employee item component.
 * @author Jack Niu
 * @email chuang.niu@pwc.com
 * @date 2021-04-30
 */

import React from 'react'
import { View, NativeAppEventEmitter, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import UserAvatar from '../../common/UserAvatar'
import styles from '../../../styles/manager/EmployeeItemStyle'
import PhoneMsgView from './PhoneMsgView'
import WorkingDaysView from './WorkingDaysView'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { getFTPT } from '../../../utils/MerchManagerUtils'
import { EventEmitterType } from '../../../enums/Manager'
interface EmployeeProps {
    item?: any
    index?: number
    navigation?: any
    disabled?: boolean
    containerHeight?: number
    onCardClick?: Function
    showWorkingDays?: boolean
    showContact?: boolean
    isClickable?: boolean
}
const onGoBack = (item, navigation) => {
    NativeAppEventEmitter.emit(EventEmitterType.TRANSFER_EMPLOYEE_DATA, item)
    navigation.goBack()
}
const onItemPress = (item, isClickable, onCardClick, navigation) => {
    if (!isClickable) {
        return
    }
    if (onCardClick) {
        !item?.merchBase && onCardClick(item)
        return
    }
    onGoBack(item, navigation)
}

const EmployeeItem = (props: EmployeeProps) => {
    const {
        item,
        navigation,
        disabled,
        containerHeight,
        onCardClick,
        showWorkingDays,
        showContact,
        isClickable = true
    } = props

    return (
        <TouchableOpacity
            activeOpacity={item?.merchBase || !isClickable ? 1 : 0.2}
            disabled={disabled}
            hitSlop={commonStyle.hitSlop}
            onPress={() => onItemPress(item, isClickable, onCardClick, navigation)}
        >
            <View
                style={[
                    styles.container,
                    containerHeight ? styles.height110 : null,
                    item?.merchBase ? styles.grayBg : null
                ]}
            >
                <View style={styles.marginRight15}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={styles.imgAvatar}
                        userNameText={styles.userNameText}
                    />
                </View>
                <View style={styles.content}>
                    <View style={styles.middle}>
                        <View style={styles.topRow}>
                            <View style={styles.leftCol}>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                    {item.name}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.flexDirectionRow}>
                            <CText style={styles.textRole}>{getFTPT({ item: item })}</CText>
                            <CText numberOfLines={1} style={[styles.textRole, styles.marginRight15]}>
                                {item.title}
                            </CText>
                        </View>
                        {showWorkingDays && (
                            <WorkingDaysView startTime={item.startTime} workingStatus={item.workingStatus} />
                        )}
                    </View>
                </View>
                {showContact && <PhoneMsgView phone={item.phone} />}
            </View>
        </TouchableOpacity>
    )
}

export default EmployeeItem
