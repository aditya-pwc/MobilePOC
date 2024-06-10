/*
 * @Author: Howard Xiao
 * @Date: 2023-07-12
 * @Description: SDL Accounts Serviced As Scheduled employee card
 */

import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { getFTPT } from '../../../../utils/MerchManagerUtils'
import UserAvatar from '../../../common/UserAvatar'
import { styles } from '../../copilot/mileage-breakdown/MEmployeesList'
import { DEFAULT_TARGET } from './SDLCopilotPerformance'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { AMASEmployee } from '../AMASPage'

export interface ASASEmployee {
    actualASAS: number
    targetASAS: number
    firstName: string
    lastName: string
    ftFlag: string
    title: string
    userGPID: string
    userID: string
    userStatsId: string
    gpid: string
    routeSalesGeoId: string
    totalCount: number
    orderCount: number
    deliveryCount: number
    isOpen?: boolean
}

interface ASASEmployeeCardProps {
    item: ASASEmployee | AMASEmployee
    onPressFunc: Function
    showTargetAndActual?: boolean
    showTotal?: boolean
    needFullBorderBottom?: boolean
    isAccordionOpen?: boolean
    showAMASTotal?: boolean
    activeOpacity?: number
}

const employeeStyles = StyleSheet.create({
    borderBottomGray: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: baseStyle.color.gray
    },
    borderBottom_0: {
        borderBottomWidth: 0
    },
    marginRight_30: {
        marginRight: 30
    },
    chevron: {
        width: 20,
        height: 20,
        transform: [{ rotate: '180deg' }]
    },
    rotatedChevron: {
        transform: [{ rotate: '360deg' }]
    },
    marginRight_20: {
        marginRight: 20
    }
})

const ASASEmployeeCard = (props: ASASEmployeeCardProps) => {
    const { item, onPressFunc, showTargetAndActual, showTotal, needFullBorderBottom, showAMASTotal, activeOpacity } =
        props
    item.ftFlag = item.ftFlag.toLocaleLowerCase()
    return (
        <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => onPressFunc()}
            key={item.userID}
            style={[styles.employeeContainer, !item.isOpen && needFullBorderBottom && employeeStyles.borderBottomGray]}
        >
            <View style={styles.userAvatar}>
                <UserAvatar
                    userStatsId={item.userStatsId}
                    firstName={item.firstName}
                    lastName={item.lastName}
                    avatarStyle={styles.imgUserImage}
                    userNameText={{ fontSize: 14 }}
                />
            </View>
            <View style={[styles.itemContentContainer, needFullBorderBottom && employeeStyles.borderBottom_0]}>
                <View style={styles.eeCardLeft}>
                    <CText
                        style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]}
                        numberOfLines={1}
                    >
                        {item.firstName ? `${item.firstName} ${item.lastName}` : `${item.lastName}`}
                    </CText>
                    <View style={[styles.rowCenter, styles.marginTop_8, styles.marginRight_20]}>
                        <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                            {getFTPT({ item })}
                        </CText>
                        <CText
                            style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </CText>
                    </View>
                </View>
                {showTargetAndActual && (
                    <View style={styles.eeCardRight}>
                        <View>
                            <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</CText>
                            <CText
                                style={[
                                    styles.driveValue,
                                    Math.round(item.actualASAS) < DEFAULT_TARGET && styles.redText
                                ]}
                            >
                                {`${Math.round(item.actualASAS)}${'%'}`}
                            </CText>
                        </View>
                        <View style={[styles.splitLine, styles.marginHorizontal_15]} />
                        <View>
                            <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_TARGET}</CText>
                            <CText style={styles.driveValue}>{`${item.targetASAS}${'%'}`}</CText>
                        </View>
                    </View>
                )}
                {showTotal && (
                    <View style={styles.eeCardRight}>
                        <View style={employeeStyles.marginRight_30}>
                            <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                            <CText style={styles.driveValue}>{item.totalCount}</CText>
                        </View>
                        <View>
                            <ChevronSvg
                                style={[employeeStyles.chevron, item.isOpen && employeeStyles.rotatedChevron]}
                            />
                        </View>
                    </View>
                )}
                {showAMASTotal && (
                    <View style={styles.eeCardRight}>
                        <View style={employeeStyles.marginRight_20}>
                            <CText style={styles.driveTitle}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                            <CText style={styles.driveValue}>{item.totalCount}</CText>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}
export default ASASEmployeeCard
