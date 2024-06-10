/**
 * @description Employee item component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-06-10
 */

import React from 'react'
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native'
import CText from '../../../../common/components/CText'
import WeekDayAndNumStyle from '../../../styles/manager/WeekDayAndNumStyle'
import { t } from '../../../../common/i18n/t'
import UserAvatar from '../../common/UserAvatar'
import { ImageSrc } from '../../../../common/enums/ImageSrc'

const styles = WeekDayAndNumStyle
const avatarStyle = StyleSheet.create({
    avatarStyle: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginLeft: 6
    }
})

interface User {
    firstName: string
    lastName: string
    userStatsId: string
    isUnassigned: boolean
}

interface WeekDayAndNumProps {
    key?: any
    item?: any
    minNum?: number
    maxNum?: number
    decreaseClick?: any
    increaseClick?: any
    exitNum?: number
    users?: User[]
}

const WeekDayAndNum = (props: WeekDayAndNumProps) => {
    const { item, minNum, maxNum, decreaseClick, increaseClick, exitNum, users } = props
    return (
        <View style={styles.weekView}>
            <View style={styles.dayContainer}>
                <CText style={styles.weekLabel}>{item.label}</CText>
                <View style={styles.avatarContainer}>
                    {users.map((item) => {
                        return item.isUnassigned ? (
                            <Image source={ImageSrc.IMG_UNASSIGNED} style={avatarStyle.avatarStyle} />
                        ) : (
                            <UserAvatar
                                key={item.userStatsId}
                                userStatsId={item.userStatsId}
                                firstName={item.firstName}
                                lastName={item.lastName}
                                avatarStyle={avatarStyle.avatarStyle}
                            />
                        )
                    })}
                </View>
            </View>
            <View style={styles.numContainer}>
                <View style={styles.numView}>
                    {/* <CText style={styles.tipLabel}>{`${exitNum} Visit(s) Exited`}</CText> */}
                    {item.numOfVisit <= minNum ? (
                        <CText style={styles.disableSymbolText}>-</CText>
                    ) : (
                        <TouchableOpacity hitSlop={styles.hitSlopStyle} onPress={() => decreaseClick()}>
                            <CText style={styles.symbolText}>-</CText>
                        </TouchableOpacity>
                    )}
                    <View style={styles.numMidView}>
                        <CText style={styles.numText}>{item.numOfVisit}</CText>
                        <CText style={styles.subNumText}>{t.labels.PBNA_MOBILE_VISITS_WITH_BRACKET}</CText>
                    </View>
                    {item.numOfVisit >= maxNum - exitNum ? (
                        <CText style={styles.disableSymbolText}>+</CText>
                    ) : (
                        <TouchableOpacity hitSlop={styles.hitSlopStyle} onPress={() => increaseClick()}>
                            <CText style={styles.symbolText}>+</CText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    )
}

export default WeekDayAndNum
