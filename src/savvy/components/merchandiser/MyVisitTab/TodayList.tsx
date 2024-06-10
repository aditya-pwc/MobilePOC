/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-30 01:15:36
 * @LastEditTime: 2023-11-20 10:02:29
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, SectionList, StyleSheet } from 'react-native'
import { CommonParam } from '../../../../common/CommonParam'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ManagerMeetings, renderTime, VisitOrEventCell } from './MyVisitComponent'
import PullDownLoading from './PullDownLoading'

const scrollThrottle = 20
const offsetY = 55

const styles = StyleSheet.create({
    paddingButton20: {
        paddingBottom: 20
    }
})

const TodayList = (props: any) => {
    const {
        navigation,
        todayData,
        isLoading,
        dayStart,
        onPullDownRefresh,
        clockStart,
        onStartMeeting,
        onEndMeeting,
        onContentOffsetYChange,
        footerComponent
    } = props

    const handleScroll = (event) => {
        const listOffset = event.nativeEvent.contentOffset.y
        if (listOffset > 0) {
            onContentOffsetYChange(event.nativeEvent.contentOffset.y)
        }
    }

    const onScrollEnd = (event) => {
        if (event.nativeEvent.contentOffset.y <= offsetY) {
            onContentOffsetYChange(0)
        }
        if (event.nativeEvent.contentOffset.y > offsetY) {
            onContentOffsetYChange(event.nativeEvent.contentOffset.y)
        }
    }

    const renderMeetingHeader = () => {
        return (
            <ManagerMeetings
                navigation={navigation}
                meetingList={todayData?.managerMeetingArray || []}
                clockStart={clockStart}
                dayStart={dayStart}
                onStartMeeting={onStartMeeting}
                onEndMeeting={onEndMeeting}
            />
        )
    }

    return (
        <View style={commonStyle.flex_1}>
            <SectionList
                contentContainerStyle={styles.paddingButton20}
                sections={todayData?.visitAndEventArray || []}
                keyExtractor={(item) => item.Id || item.Actual_Start_Time__c}
                stickySectionHeadersEnabled={false}
                renderItem={({ item }) => <VisitOrEventCell item={item} navigation={navigation} />}
                ListHeaderComponent={renderMeetingHeader}
                scrollEventThrottle={scrollThrottle}
                onScroll={handleScroll}
                onMomentumScrollEnd={onScrollEnd}
                renderSectionHeader={({ section: { visitListInfo } }) => {
                    return renderTime(visitListInfo, true)
                }}
                renderSectionFooter={(item) => {
                    const visitListInfo = item.section.visitListInfo
                    if (visitListInfo.visitListId === CommonParam.visitList?.Id) {
                        return footerComponent()
                    }
                    return renderTime(visitListInfo, false)
                }}
                refreshControl={<PullDownLoading isLoading={isLoading} onPullDownRefresh={onPullDownRefresh} />}
            />
        </View>
    )
}

export default TodayList
