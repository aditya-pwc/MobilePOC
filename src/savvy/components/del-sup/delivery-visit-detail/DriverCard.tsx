/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-23 00:16:35
 * @LastEditTime: 2024-03-18 11:02:17
 * @LastEditors: Yi Li
 */

import React from 'react'
import { Dimensions, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { t } from '../../../../common/i18n/t'
import CText from '../../../../common/components/CText'
import { FTPTWithTitleView } from '../../common/FTPTWithTitleView'
import UserAvatar from '../../common/UserAvatar'
import { renderPhoneView } from '../../manager/my-team/MyTeam'
import { commonStyle } from '../../../../common/styles/CommonStyle'
const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    ...commonStyle,
    containBgStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    containStyle: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: 22,
        paddingHorizontal: 20,
        borderRadius: 6,
        shadowColor: '#004C97',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    eImgPortrait: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    userNameText: {
        fontSize: 22,
        borderRadius: 4
    },
    textContain: {
        justifyContent: 'space-between',
        height: 60,
        marginVertical: 25,
        marginLeft: 15,
        maxWidth: width - 84 - 60 - 50
    },
    textCell: {
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    textTitle: {
        flexDirection: 'row',
        color: '#565656',
        fontSize: 12,
        fontWeight: '400'
    },
    lineView: {
        height: 16,
        width: 1,
        marginHorizontal: 5,
        backgroundColor: '#D3D3D3'
    },
    ftText: {
        color: '#565656'
    },
    titleValueStyle: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '400'
    },
    userName: {
        height: 20,
        color: '#000000',
        fontSize: 16,
        fontWeight: '700'
    },
    phoneStyle: {
        width: 19,
        height: 22,
        resizeMode: 'contain'
    },
    noteStyle: {
        width: 20,
        height: 24,
        resizeMode: 'contain'
    }
})

interface DriverCardProps {
    navigation?: any
    firstName?: string
    lastName?: string
    userStatsId?: string
    roleFlag?: string
    roleTitle?: string
    localRout?: string
    nationalId?: string
    phoneString?: string
}

const renderTextCell = (
    title: string,
    subTitle: string,
    titleStyle?: StyleProp<TextStyle>,
    titleValue?: string,
    subTitleValue?: string
) => {
    return (
        <View style={styles.textCell}>
            <CText style={[styles.textTitle, titleStyle]}>
                {title}
                {titleValue && <CText style={styles.titleValueStyle}> {titleValue}</CText>}
            </CText>
            <View style={styles.lineView} />
            <CText style={styles.textTitle}>
                {subTitle}
                {subTitleValue && <CText style={styles.titleValueStyle}> {subTitleValue}</CText>}
            </CText>
        </View>
    )
}

const DriverCard = (props: DriverCardProps) => {
    const { firstName, lastName, userStatsId, roleFlag, roleTitle, localRout, nationalId, phoneString } = props

    const phoneItem = {
        phone: phoneString
    }

    return (
        <View style={[styles.containBgStyle, styles.containStyle]}>
            <View style={styles.containBgStyle}>
                <UserAvatar
                    userStatsId={userStatsId}
                    firstName={firstName}
                    lastName={lastName}
                    avatarStyle={styles.eImgPortrait}
                    userNameText={styles.userNameText}
                />
                <View style={styles.textContain}>
                    <CText style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                        {firstName} {lastName}
                    </CText>
                    <FTPTWithTitleView ftFlag={roleFlag} title={roleTitle} />
                    {(localRout || nationalId) &&
                        renderTextCell(
                            t.labels.PBNA_MOBILE_LOCAL_ROUTE,
                            t.labels.PBNA_MOBILE_NATIONAL_ID,
                            null,
                            localRout,
                            nationalId
                        )}
                </View>
            </View>
            {renderPhoneView(phoneItem)}
        </View>
    )
}

export default DriverCard
