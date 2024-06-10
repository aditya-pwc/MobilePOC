/*
 * @Description: SDL Profile Overview
 * @Author: Aimee Zhang
 * @Date: 2021-12-16 04:32:27
 * @LastEditTime: 2022-03-22 04:11:25
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import SelectScheduleStyle from '../../../styles/manager/SelectScheduleStyle'
import MonthWeek, { MonthWeekType } from '../../common/MonthWeek'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import EmptyVisit from '../../../../../assets/image/empty_visit.svg'
import { t } from '../../../../common/i18n/t'

const selectStyles = SelectScheduleStyle

interface VisitSegmentTabPros {
    userData?: any
    key?: string | number
    weekDayClick: any
    refMonthWeek: any
    weekDays: any
    sortList: any
    renderRow: any
}
const styles = StyleSheet.create({
    sectionTitleContain: {
        marginTop: 25
    },
    sectionTitleMargin: {
        marginVertical: 5
    },
    sectionTitleStyle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    cellTitleStyle: {
        marginVertical: 15
    },
    imgCheck: {
        width: 14,
        height: 14,
        marginLeft: 8
    },
    shortCellTitle: {
        marginTop: 20,
        marginBottom: 16
    },
    shortCellSubTitle: {
        fontSize: baseStyle.fontSize.fs_14
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },
    imgClock: {
        width: 18,
        height: 18,
        marginHorizontal: 10
    },
    editContainer: {
        marginTop: 40
    },
    editBtnColor: {
        color: '#00A2D9'
    },
    noticeText: {
        marginLeft: 22,
        marginTop: 12,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    roundLabel: {
        width: 42,
        height: 42,
        marginRight: 15,
        borderRadius: 21,
        backgroundColor: baseStyle.color.tabShadowBlue,
        ...commonStyle.alignCenter
    },
    greyRound: {
        backgroundColor: baseStyle.color.borderGray
    },
    roundText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    weekNum: {
        marginTop: 20,
        marginBottom: 100,
        marginHorizontal: 22,
        paddingRight: 22,
        ...commonStyle.flexRowSpaceBet
    },
    flexRowAlignCenter: {
        ...commonStyle.flexRowAlignCenter
    },
    lineHeight_25: {
        lineHeight: 25
    },
    emptyListContainer: {
        width: 184,
        alignItems: 'center'
    },
    emptyVisitStyle: {
        width: 184,
        height: 246
    },
    noVisitScheduledText: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 40
    },
    marginHorizontal_20: {
        marginHorizontal: 20
    }
})

const SDLVisitSegmentTab = (props: VisitSegmentTabPros) => {
    const { key, refMonthWeek, renderRow, weekDays, weekDayClick, sortList } = props

    const [dataList, setDataList] = useState([])

    useEffect(() => {
        const newList = Object.values(sortList)
        setDataList(newList)
    }, [sortList])

    const getVisitCountText = () => {
        const count = Object.keys(sortList)?.length
        if (count > 1) {
            return `${count} ` + t.labels.PBNA_MOBILE_VISITS
        }
        return `${count} ` + t.labels.PBNA_MOBILE_VISIT
    }

    const renderView = () => {
        return (
            <View style={commonStyle.windowWidth} key={key}>
                <View style={[selectStyles.weekContainer, styles.marginHorizontal_20]}>
                    <MonthWeek
                        cRef={refMonthWeek}
                        weekDays={weekDays}
                        onclick={weekDayClick}
                        type={MonthWeekType.MonthWeekType_WithoutDay}
                    />
                </View>
                <View style={[selectStyles.checkBoxContainer, styles.marginHorizontal_20]}>
                    <CText style={[selectStyles.checkBoxTitle, styles.lineHeight_25]}>{getVisitCountText()}</CText>
                </View>

                {_.isEmpty(sortList) && (
                    <View style={[commonStyle.flex_1, commonStyle.alignCenter]}>
                        <View style={styles.emptyListContainer}>
                            <EmptyVisit style={styles.emptyVisitStyle} />
                            <CText style={styles.noVisitScheduledText}>
                                {t.labels.PBNA_MOBILE_NO_VISITS_BEEN_SCHEDULED}
                            </CText>
                        </View>
                    </View>
                )}

                {!_.isEmpty(dataList) && (
                    <FlatList data={dataList} renderItem={renderRow} keyExtractor={(item) => item.Id} />
                )}
            </View>
        )
    }

    return useMemo(() => renderView(), [dataList])
}

export default SDLVisitSegmentTab
