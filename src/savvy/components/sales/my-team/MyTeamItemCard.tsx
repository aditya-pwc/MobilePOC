/**
 * @description sales Item.
 * @author  Yue Yuan
 * @email yue.yuan@pwc.com
 * @date 2021-04-30
 */
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import UserAvatar from '../../common/UserAvatar'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import { TabIndex } from '../../../redux/types/H01_Manager/data-tabIndex'
import CText from '../../../../common/components/CText'
import { getFTPT } from '../../../utils/MerchManagerUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import SVGPhoneMsgView from '../../manager/common/SVGPhoneMsgView'
import { isPersonaUGM } from '../../../../common/enums/Persona'
import { renderWorkStatus } from '../../manager/my-team/MyTeam'

const styles = MyTeamStyle

interface MyTeamItemCardProps {
    item?: any
    itemClick?: Function
    activeTab: number
    noMargin?: boolean
}

const renderPhoneView = (item) => {
    return (
        <View>
            <SVGPhoneMsgView phone={item.phone} noteStyle={styles.rowWithCenter} phoneStyle={[styles.rowWithCenter]} />
        </View>
    )
}

const renderItemContent = (item) => {
    return (
        <View style={[styles.itemContentContainer]}>
            <CText
                style={[
                    styles.fontColor_black,
                    styles.fontWeight_700,
                    styles.fontSize_16,
                    styles[!isPersonaUGM() && item.item.userType ? 'marginTop_10' : 'undefined']
                ]}
                numberOfLines={1} // marginTop_16 for del-sup tab
            >
                {item.item.name}
            </CText>
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                    {getFTPT(item)}
                </CText>
                <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]} numberOfLines={1}>
                    {item.item.title}
                </CText>
            </View>
            {item?.item?.startTime && renderWorkStatus(item)}
        </View>
    )
}

const renderItemBottomView = (activeTab, item) => {
    if (activeTab === TabIndex.TabIndex_Sales) {
        return (
            <View style={styles.itemBottomContainer}>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth
                    ]}
                >
                    {t.labels.PBNA_MOBILE_SALES_ROUTE}
                    <CText style={[styles.fontWeight_700]}> {item.salesRoute}</CText>
                </CText>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth,
                        commonStyle.textAlignRight
                    ]}
                >
                    {t.labels.PBNA_MOBILE_NATIONAL_ID}
                    <CText style={[styles.fontWeight_700]}> {item.nationalId}</CText>
                </CText>
            </View>
        )
    }
    if (
        [TabIndex.TabIndex_Delivery, TabIndex.TabIndex_Miscellaneous].includes(activeTab) &&
        (item.localRoute !== '-' || item.nationalId !== '-')
    ) {
        return (
            <View style={styles.itemBottomContainer}>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth
                    ]}
                >
                    {t.labels.PBNA_MOBILE_LOCAL_ROUTE}
                    <CText style={[styles.fontWeight_700]}> {item.localRoute}</CText>
                </CText>
                <CText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                        styles.fontColor_black,
                        styles.fontSize_12,
                        styles.fontWeight_400,
                        commonStyle.routeTextWidth,
                        commonStyle.textAlignRight
                    ]}
                >
                    {t.labels.PBNA_MOBILE_NATIONAL_ID}
                    <CText style={[styles.fontWeight_700]}> {item.nationalId}</CText>
                </CText>
            </View>
        )
    }

    return null
}

const MyTeamItemCard = ({ item, itemClick, activeTab, noMargin }: MyTeamItemCardProps) => {
    return (
        <View style={[styles.teamItem, noMargin && styles.noMargin]}>
            <View style={[styles.containerStyle]}>
                <TouchableOpacity
                    hitSlop={{ left: 20, right: 20, bottom: 20 }}
                    onPress={() => {
                        itemClick && itemClick(item?.item)
                    }}
                >
                    <View style={styles.teamItem_without_border}>
                        <View style={styles.userAvatar}>
                            <UserAvatar
                                userStatsId={item.item.userStatsId}
                                firstName={item.item.firstName}
                                lastName={item.item.lastName}
                                avatarStyle={styles.imgUserImage}
                                userNameText={{ fontSize: 24 }}
                                needBorder={item.item.isMyDirect}
                            />
                        </View>
                        {renderItemContent(item)}
                        {renderPhoneView(item.item)}
                    </View>
                    {renderItemBottomView(activeTab, item.item)}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default MyTeamItemCard
