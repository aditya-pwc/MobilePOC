/* eslint-disable camelcase */
/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import 'moment-timezone'
import { visitStyle } from './VisitStyle'
import CText from '../../../common/components/CText'
import MyTeamStyle from '../../styles/manager/MyTeamStyle'
import UserAvatar from '../common/UserAvatar'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { renderPhoneView } from '../manager/my-team/MyTeam'
import { getWorkingStatus } from '../../utils/MerchManagerComputeUtils'
import { formatUTCToLocalTime } from '../../utils/MerchManagerUtils'
import { SoupService } from '../../service/SoupService'
import { t } from '../../../common/i18n/t'

const VisitCustomerUser = (parentProps) => {
    const userCardStyles = MyTeamStyle
    const { customerData } = parentProps
    const [customerUser, setCustomerUser] = useState({
        userName: customerData['Sales_Rep__r.Name'] || 'No sales rep available',
        phone: customerData['Sales_Rep__r.MobilePhone'] || '',
        firstName: customerData['Sales_Rep__r.FirstName'],
        lastName: customerData['Sales_Rep__r.LastName'],
        title: customerData['Sales_Rep__r.Title'],
        startTime: null,
        workingStatus: [],
        statsId: null,
        salesRoute: customerData['Sales_Route__r.LOCL_RTE_ID__c'],
        routeType: customerData['Sales_Route__r.GTMU_RTE_ID__c']
    })
    useEffect(() => {
        SoupService.retrieveDataFromSoup('User_Stats__c', {}, [], null, [
            ` WHERE {User_Stats__c:User__c}='${customerData.Sales_Rep__c}'`
        ]).then((res: any) => {
            customerUser.workingStatus = getWorkingStatus(res[0])
            customerUser.startTime = res[0].Start_Time__c
            customerUser.statsId = res[0].Id
            setCustomerUser(JSON.parse(JSON.stringify(customerUser)))
        })
    }, [])

    const renderWStautsText = (wStatus, index) => {
        return (
            <CText
                key={index}
                style={
                    wStatus.attend
                        ? [
                              userCardStyles.fontSize_12,
                              userCardStyles.fontWeight_700,
                              userCardStyles.fontColor_black,
                              userCardStyles.marginRight_8
                          ]
                        : [
                              userCardStyles.fontSize_12,
                              userCardStyles.fontWeight_700,
                              userCardStyles.fontColor_lightGary,
                              userCardStyles.marginRight_8
                          ]
                }
            >
                {wStatus.label}
            </CText>
        )
    }

    return (
        <View style={[visitStyle.cardBox]}>
            <View style={[userCardStyles.teamItem_without_border]}>
                <View style={userCardStyles.userAvatar}>
                    <UserAvatar
                        userStatsId={customerUser.statsId}
                        firstName={customerUser.firstName}
                        lastName={customerUser.lastName}
                        avatarStyle={userCardStyles.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                </View>
                <View style={[userCardStyles.itemContentContainer]}>
                    <CText
                        style={[
                            userCardStyles.fontColor_black,
                            userCardStyles.fontWeight_700,
                            userCardStyles.fontSize_16
                        ]}
                        numberOfLines={1}
                    >
                        {customerUser.userName}
                    </CText>
                    <View style={[userCardStyles.rowCenter, userCardStyles.marginTop_6, userCardStyles.marginRight_20]}>
                        <CText
                            style={[
                                userCardStyles.fontColor_gary,
                                userCardStyles.fontWeight_400,
                                userCardStyles.fontSize_12
                            ]}
                            numberOfLines={1}
                        >
                            {customerUser.title}
                        </CText>
                    </View>
                    <View style={[userCardStyles.rowCenter, userCardStyles.marginTop_6]}>
                        <CText
                            style={[
                                userCardStyles.fontColor_gary,
                                userCardStyles.fontWeight_400,
                                userCardStyles.fontSize_12
                            ]}
                        >
                            {formatUTCToLocalTime(customerUser.startTime)}
                        </CText>
                        {customerUser.startTime && <View style={userCardStyles.itemLine} />}
                        {customerUser.workingStatus.map((wStatus, index) => {
                            return renderWStautsText(wStatus, index)
                        })}
                    </View>
                </View>
                {renderPhoneView(customerUser)}
            </View>
            <View style={MyTeamStyle.itemBottomContainer}>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        MyTeamStyle.fontColor_black,
                        MyTeamStyle.fontSize_12,
                        MyTeamStyle.fontWeight_400,
                        commonStyle.routeTextWidth
                    ]}
                >
                    {t.labels.PBNA_MOBILE_SALES_ROUTE}
                    <CText style={[MyTeamStyle.fontWeight_700]}> {customerUser.salesRoute}</CText>
                </CText>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        MyTeamStyle.fontColor_black,
                        MyTeamStyle.fontSize_12,
                        MyTeamStyle.fontWeight_400,
                        commonStyle.routeTextWidth,
                        commonStyle.textAlignRight
                    ]}
                >
                    {t.labels.PBNA_MOBILE_NRID}
                    <CText style={[MyTeamStyle.fontWeight_700]}> {customerUser.routeType}</CText>
                </CText>
            </View>
        </View>
    )
}

export default VisitCustomerUser
