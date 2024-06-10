/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-05-26 07:00:56
 * @LastEditTime: 2023-11-20 10:02:54
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { SectionList,FlatList} from 'react-native'
import { ManagerMeetings, renderTime, VisitOrEventCell } from './MyVisitComponent'
import PullDownLoading from './PullDownLoading'
import ScheduleVisitCard from '../ScheduleVisitCard'


interface MyPastVisitProps {
    dayList: any[]
    meetingList: any[]
    navigation: any
    isLoading: boolean
    footerComponent: any
    onPullDownRefresh: () => void
}

const PastFutureList = (props: MyPastVisitProps) => {
    const { dayList, meetingList, navigation, isLoading, onPullDownRefresh, footerComponent } = props

    const renderMeetingHeader = () => {
        return <ManagerMeetings navigation={navigation} meetingList={meetingList} />
    }

    return (
        // <SectionList
        //     sections={dayList}
        //     keyExtractor={(item) => item.Id}
        //     stickySectionHeadersEnabled={false}
        //     renderItem={({ item }) => <VisitOrEventCell item={item} navigation={navigation} />}
        //     ListHeaderComponent={renderMeetingHeader}
        //     renderSectionHeader={({ section: { visitListInfo } }) => {
        //         return renderTime(visitListInfo, true)
        //     }}
        //     renderSectionFooter={({ section: { visitListInfo } }) => {
        //         return renderTime(visitListInfo, false)
        //     }}
        //     ListFooterComponent={footerComponent}
        //     refreshControl={<PullDownLoading isLoading={isLoading} onPullDownRefresh={onPullDownRefresh} />}
        // />
         <FlatList
            data={dayList}
            renderItem={({ item }) => <ScheduleVisitCard item={item} navigation={navigation} isVisitList />}
            keyExtractor={(item) => item.Id}
        />
    )
}

export default PastFutureList
