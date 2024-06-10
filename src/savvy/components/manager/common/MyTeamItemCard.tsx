/**
 * @description sales Item.
 * @author  Yue Yuan
 * @email yue.yuan@pwc.com
 * @date 2021-04-30
 */
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import UserAvatar from '../../common/UserAvatar'
import RedExclamation from '../../../../../assets/image/red-exclamation.svg'
import _ from 'lodash'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import { renderItemBottomView, renderItemContent, renderPhoneView } from '../my-team/MyTeam'

const styles = MyTeamStyle
const SIZE_26 = 26

interface MyTeamItemCardProps {
    item?: any
    itemClick?: Function
    activeTab: number
}

const MyTeamItemCard = ({ item, itemClick, activeTab }: MyTeamItemCardProps) => {
    return (
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
                    />
                    {(item.item.noWorkingDay ||
                        item.item.terminateUser ||
                        _.isEmpty(item.item.startTime) ||
                        item.item.SDHasError) && (
                        <RedExclamation style={styles.userRedExclamation} width={SIZE_26} height={SIZE_26} />
                    )}
                </View>
                {renderItemContent(item)}
                {renderPhoneView(item.item)}
            </View>
            {renderItemBottomView(activeTab, item.item)}
        </TouchableOpacity>
    )
}

export default MyTeamItemCard
