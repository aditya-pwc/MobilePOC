/*
 * @Description: Related to SDL VisitDetails
 * @Author: Matthew Huang (fork from DriverCard)
 * @Date: 2022-1-6 00:16:35
 * @LastEditTime: 2022-05-17 03:48:35
 * @LastEditors: Yi Li
 */

import React, { useEffect, useState } from 'react'
import { Dimensions, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { t } from '../../../common/i18n/t'
import { SoupService } from '../../service/SoupService'
import CText from '../../../common/components/CText'
import { FTPTWithTitleView } from '../common/FTPTWithTitleView'
import UserAvatar from '../common/UserAvatar'
import PhoneMsgView from '../manager/common/PhoneMsgView'
import { commonStyle } from '../../../common/styles/CommonStyle'
const { width } = Dimensions.get('window')
const styles = StyleSheet.create({
    ...commonStyle,
    containBgStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    containStyle: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: 22,
        paddingHorizontal: 20,
        width: width - 44,
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
        minHeight: 60,
        marginVertical: 25,
        marginLeft: 15,
        flex: 1
    },
    textCell: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    textTitle: {
        flexDirection: 'row',
        color: '#565656',
        fontSize: 12,
        fontWeight: '400',
        flex: 1
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
    },
    phoneMsgContainer: {
        flex: 1,
        alignItems: 'flex-end'
    }
})

interface SalesCardProps {
    navigation?: any
    name: string
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
            <CText style={[styles.textTitle, titleStyle]} numberOfLines={1} ellipsizeMode={'tail'}>
                {title}
            </CText>
            {titleValue && <CText style={styles.titleValueStyle}> {titleValue}</CText>}
            <View style={styles.lineView} />
            <CText style={styles.textTitle} numberOfLines={1} ellipsizeMode={'tail'}>
                {subTitle}
            </CText>
            {subTitleValue && <CText style={styles.titleValueStyle}> {subTitleValue}</CText>}
        </View>
    )
}

function SalesCard(props: SalesCardProps) {
    const { name, firstName, lastName, userStatsId, roleFlag, roleTitle, localRout, nationalId, phoneString } = props

    return (
        <View style={[styles.containBgStyle, styles.containStyle]}>
            <View style={[styles.containBgStyle, { flex: 8 }]}>
                <UserAvatar
                    userStatsId={userStatsId}
                    firstName={firstName}
                    lastName={lastName}
                    avatarStyle={styles.eImgPortrait}
                    userNameText={styles.userNameText}
                />
                <View style={styles.textContain}>
                    <CText style={styles.userName}>{name}</CText>
                    <FTPTWithTitleView ftFlag={roleFlag} title={roleTitle} fontSize={12} />
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
            <PhoneMsgView
                style={styles.phoneMsgContainer}
                phone={phoneString}
                phoneStyle={styles.phoneStyle}
                noteStyle={styles.noteStyle}
            />
        </View>
    )
}

export const BetterSalesCard = ({ userId, boxStyle }: { userId: string; boxStyle: {} }) => {
    const [userData, setUserData] = useState<SalesCardProps | null>(null)
    const field = [
        'name',
        'firstName',
        'lastName',
        'userStatsId',
        'roleFlag',
        'roleTitle',
        'localRout',
        'nationalId',
        'phoneString'
    ]
    const query = `
        SELECT
            {User:Name},
            {User:FirstName},
            {User:LastName},
            {User_Stats__c:Id},
            {User:FT_EMPLYE_FLG_VAL__c},
            {User:Title},
            {Route_Sales_Geo__c:LOCL_RTE_ID__c},
            {Route_Sales_Geo__c:GTMU_RTE_ID__c},
            {User:MobilePhone}       
        FROM {User} 
        LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
        LEFT JOIN {Employee_To_Route__c} ON {User:Id} = {Employee_To_Route__c:User__c}
        LEFT JOIN {Route_Sales_Geo__c} ON {Employee_To_Route__c:Route__c} = {Route_Sales_Geo__c:Id}
        WHERE {User:Id} = '${userId}'`

    useEffect(() => {
        SoupService.retrieveDataFromSoup('User', {}, field, query).then((data) => {
            setUserData(data[0])
        })
    }, [])

    if (!userData) {
        return <></>
    }
    return (
        <View style={boxStyle}>
            <SalesCard {...userData} />
        </View>
    )
}

export default SalesCard
