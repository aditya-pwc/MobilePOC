/**
 * @description MyWeek Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-23
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import CText from '../../../common/components/CText'
import { getWeekArrByDate } from '../../utils/MerchManagerUtils'
import TitleContainer from './TitleContainer'
import { restApexCommonCall } from '../../api/SyncUtils'
import { SoupService } from '../../service/SoupService'
import { getObjByName } from '../../utils/SyncUtils'
import { convertMileData } from '../common/UnitUtils'
import { NUMBER_VALUE } from '../../enums/MerchandiserEnums'
import { CommonApi } from '../../../common/api/CommonApi'
import { t } from '../../../common/i18n/t'
import { assignWorkDay } from '../manager/schedule/EmployeeScheduleListHelper'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_UNIT } from '../../../common/enums/MomentUnit'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
interface MyWeekProps {
    cRef
    navigation?
    onPress?
}
interface SectionViewProps {
    sectionData
    isDafault
}

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#004C97'
    },
    dateContainer: {
        flexDirection: 'row',
        width: screenWidth - 22,
        marginLeft: 22
    },
    dateIconView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 32,
        borderRadius: 16,
        marginTop: 30,
        marginRight: 7
    },
    selectIconBg: {
        backgroundColor: '#00A2D9'
    },
    unselectIconBg: {
        backgroundColor: 'transparent'
    },
    dateTitleView: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 10,
        marginRight: 10
    },
    selectTitlecolor: {
        color: '#FFFFFF'
    },
    unselectTitlecolor: {
        color: '#00A2D9'
    },
    forbiddencolor: {
        color: '#D3D3D3'
    },
    titleContain: {
        flexDirection: 'row',
        width: screenWidth,
        marginTop: 25
    },
    titleStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 22
    },
    filtContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: 22
    },
    filtTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF'
    },
    filtImg: {
        marginLeft: 10,
        width: 10,
        height: 5
    },
    dataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 22,
        marginRight: 22,
        marginTop: 20,
        marginBottom: 34,
        width: screenWidth - 44,
        borderRadius: 6,
        backgroundColor: '#FFFFFF'
    },
    dataIconView: {
        height: 80,
        justifyContent: 'center'
    },
    dataTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    dataSubTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginTop: 4
    },
    lineView: {
        height: 40,
        width: 1
    },
    grayLine: {
        backgroundColor: '#D3D3D3'
    },
    headView: {
        width: screenWidth,
        marginTop: 30,
        marginBottom: 20
    },
    headTitle: {
        marginLeft: 22,
        fontSize: 16,
        lineHeight: 19,
        fontWeight: '700',
        color: '#000000'
    },
    cellView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 22,
        marginRight: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    cellLeftview: {
        flex: 4
    },
    cellTitleView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellMargin: {
        marginTop: 24,
        marginBottom: 10
    },
    cellMarginshort: {
        marginTop: 17,
        marginBottom: 17
    },
    cellImg: {},
    cellTitle: {
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        color: '#000000'
    },
    cellSubtitle: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: '400',
        color: '#000000',
        marginBottom: 24
    },
    callBtn: {
        width: 18,
        height: 19
    },
    callImg: {
        width: 18,
        height: 19
    },
    dateTimeContainer: {
        alignItems: 'center'
    }
})

const getTimeString = (timeStr, unitNum = 60000) => {
    const timeNum = Number(timeStr || 0)
    const durationStr = _.floor(timeNum / unitNum)
    const hourStr = _.floor(durationStr / 60)
    const minStr = _.floor(durationStr % 60)
    return `${hourStr} ${_.capitalize(t.labels.PBNA_MOBILE_HR)} ${minStr} ${_.capitalize(t.labels.PBNA_MOBILE_MIN)}`
}

const isWorkingDay = (dayIndex, workSchedule) => {
    const workDay = assignWorkDay(dayIndex, workSchedule)
    return workDay === '1' || workDay === true
}

const dateTimeIcon = (item, index, onPress) => {
    let titeleStyle
    if (item.selected) {
        titeleStyle = styles.selectTitlecolor
    } else {
        titeleStyle = item.workingDay ? styles.unselectTitlecolor : styles.forbiddencolor
    }
    return (
        <TouchableOpacity
            style={[styles.dateIconView, item.selected ? styles.selectIconBg : styles.unselectIconBg]}
            key={index}
            onPress={() => {
                onPress && onPress(item)
            }}
        >
            <CText style={[styles.dateTitleView, titeleStyle]}>{item.weekLabel}</CText>
        </TouchableOpacity>
    )
}

const dataIcon = (title, subTitle, hideData) => {
    return (
        <View style={styles.dataIconView}>
            <CText style={styles.dataTitle}>{title}</CText>
            {<CText style={styles.dataSubTitle}>{hideData ? '' : subTitle}</CText>}
        </View>
    )
}

export const SectionView = (props: SectionViewProps) => {
    const { sectionData } = props
    return (
        <View style={styles.dataContainer}>
            <View style={styles.lineView} />
            {dataIcon(t.labels.PBNA_MOBILE_COPILOT_ACTUAL, getTimeString(sectionData.total), sectionData.hideData)}
            <View style={[styles.lineView, styles.grayLine]} />
            {dataIcon(t.labels.PBNA_MOBILE_SCHEDULED, getTimeString(sectionData.overtime, 1), sectionData.hideData)}
            <View style={[styles.lineView, styles.grayLine]} />
            {dataIcon(
                sectionData.isPastDay ? t.labels.PBNA_MOBILE_COPILOT_ACTUAL : t.labels.PBNA_MOBILE_COPILOT_PLANNED,
                convertMileData(sectionData.driven, t.labels.PBNA_MOBILE_MILES, t.labels.PBNA_MOBILE_KM_UNIT),
                sectionData.hideData
            )}
            <View style={styles.lineView} />
        </View>
    )
}

const MyWeek: FC<MyWeekProps> = (props: MyWeekProps) => {
    const { cRef, onPress } = props
    const defaultWeek = t.labels.PBNA_MOBILE_THIS_WEEK
    const defaultDay = t.labels.PBNA_MOBILE_TODAY.toLocaleUpperCase()
    const [workSchedule, setWorkSchedule] = useState({})
    const [dateLabelArr, setDateLabelArr] = useState([])
    const [thisKipData, setThisKipData] = useState([])
    const [lastKipData, setLastKipData] = useState([])
    const [selectWeek, setselectWeek] = useState(defaultWeek)
    const [selectDay, setselectDay] = useState(defaultDay)
    const [currentData, setCurrentData] = useState({})

    const getSelectedData = (netDateArr, labelArr, type, selectedItem) => {
        if (selectedItem.weekLabel !== t.labels.PBNA_MOBILE_COPILOT_WTD) {
            let selectedKpiData: any = {}
            netDateArr.forEach((element) => {
                const kpiDay = moment(element.day || '').format(TIME_FORMAT.MD)
                if (kpiDay === selectedItem.dateLabel) {
                    selectedKpiData = element
                }
            })
            selectedKpiData.isPastDay =
                moment(selectedItem.fullYearDate).diff(moment(), MOMENT_UNIT.DAYS) < NUMBER_VALUE.ZERO_NUM
            setCurrentData(selectedKpiData)
        } else {
            const filterKpiData =
                type === defaultWeek ? netDateArr.filter((kipItem) => moment(kipItem.day) <= moment()) : netDateArr
            const totalTotal = filterKpiData.reduce((a, b) => a + parseFloat(b.total || 0), 0)
            const totalOvertime = filterKpiData.reduce((a, b) => a + parseFloat(b.overtime || 0), 0)
            const totalDriven = filterKpiData.reduce((a, b) => a + parseFloat(b.driven || 0), 0)
            setCurrentData({
                day: t.labels.PBNA_MOBILE_COPILOT_WTD,
                driven: totalDriven,
                overtime: totalOvertime,
                total: totalTotal,
                isPastDay: true
            })
        }
        const selectedDateArr = labelArr.map((item) => {
            return {
                fullYearDate: item.fullYearDate,
                dateLabel: item.dateLabel,
                weekLabel: item.weekLabel,
                dayIndex: item.dayIndex,
                workingDay: item.workingDay,
                selected: item.dateLabel === selectedItem.dateLabel
            }
        })
        setDateLabelArr(selectedDateArr)
    }

    const getDateWithSelectedWeek = (type, scheduleData) => {
        const selectDate = type === defaultWeek ? moment() : moment().add(-7, MOMENT_STARTOF.DAY)
        const weekArr = getWeekArrByDate(selectDate)
        const workDateArr = weekArr.map((item) => {
            return {
                fullYearDate: item.fullYearDate,
                dateLabel: item.dateLabel,
                weekLabel: item.weekLabel,
                dayIndex: item.dayIndex,
                workingDay: isWorkingDay(item.dayIndex, scheduleData)
            }
        })
        return [
            {
                dateLabel: t.labels.PBNA_MOBILE_COPILOT_WTD,
                weekLabel: t.labels.PBNA_MOBILE_COPILOT_WTD,
                dayIndex: 9,
                workingDay: true
            },
            ...workDateArr
        ]
    }

    const prepareOriginData = () => {
        const currentDay = moment()
        const firstDay = moment(currentDay.startOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)
        const lastDay = moment(currentDay.endOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)
        let thisWeek
        if (
            !_.isEmpty(CommonParam.userId) &&
            !_.isEmpty(firstDay) &&
            !_.isEmpty(lastDay) &&
            !_.isEmpty(CommonParam.userLocationId)
        ) {
            thisWeek = restApexCommonCall(
                `${CommonApi.PBNA_MOBILE_API_GET_MERCHANDISE_KPI}/${CommonParam.userId}&${firstDay}&${lastDay}&${CommonParam.userLocationId}`,
                'GET'
            )
        }
        const passedDay = moment().add(-7, MOMENT_STARTOF.DAY)
        const firstPassDay = moment(passedDay.startOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)
        const lastPassDay = moment(passedDay.endOf(MOMENT_STARTOF.WEEK)).format(TIME_FORMAT.Y_MM_DD)
        let lastWeek
        if (
            !_.isEmpty(CommonParam.userId) &&
            !_.isEmpty(firstPassDay) &&
            !_.isEmpty(lastPassDay) &&
            !_.isEmpty(CommonParam.userLocationId)
        ) {
            lastWeek = restApexCommonCall(
                `${CommonApi.PBNA_MOBILE_API_GET_MERCHANDISE_KPI}/${CommonParam.userId}&${firstPassDay}&${lastPassDay}&${CommonParam.userLocationId}`,
                'GET'
            )
        }
        const scheduleQuery = SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            getObjByName('User_Stats__c').syncUpCreateFields,
            getObjByName('User_Stats__c').syncUpCreateQuery + ` WHERE {User_Stats__c:User__c} = '${CommonParam.userId}'`
        )
        Promise.all([thisWeek, lastWeek, scheduleQuery]).then((results) => {
            const thisWeekData = JSON.parse(results[0]?.data || '')
            const passedWeekData = JSON.parse(results[1]?.data || '')
            const scheduleArr = results[2] || []
            const scheduleData = scheduleArr[0] || {}
            setThisKipData(thisWeekData)
            setLastKipData(passedWeekData)
            setWorkSchedule(scheduleData)
            const dateTimeArr = getDateWithSelectedWeek(selectWeek, scheduleData)
            let defaultItem = {}
            dateTimeArr.forEach((element) => {
                if (element.weekLabel === selectDay) {
                    defaultItem = element
                }
            })
            const defaultKipData = selectWeek === defaultWeek ? thisWeekData : passedWeekData
            getSelectedData(defaultKipData, dateTimeArr, selectWeek, defaultItem)
        })
    }

    useEffect(() => {
        prepareOriginData()
    }, [])

    useImperativeHandle(cRef, () => ({
        onChangeSelectWeek: (type) => {
            setselectWeek(type)
            const selectStr =
                type === defaultWeek ? t.labels.PBNA_MOBILE_TODAY.toLocaleUpperCase() : t.labels.PBNA_MOBILE_COPILOT_WTD
            setselectDay(selectStr)
            const dateTimeArr = getDateWithSelectedWeek(type, workSchedule)
            let defaultItem = {}
            dateTimeArr.forEach((element) => {
                if (element.weekLabel === selectStr) {
                    defaultItem = element
                }
            })
            const currentKipData = type === defaultWeek ? thisKipData : lastKipData
            getSelectedData(currentKipData, dateTimeArr, selectWeek, defaultItem)
        },
        pullToRefreshData: () => {
            prepareOriginData()
        }
    }))

    const onClickToSelectDate = (selectItem) => {
        const currentKipData = selectWeek === defaultWeek ? thisKipData : lastKipData
        setselectDay(selectItem.weekLabel)
        getSelectedData(currentKipData, dateLabelArr, selectWeek, selectItem)
    }

    return (
        <View style={styles.container}>
            <TitleContainer
                titleContain={styles.titleContain}
                titleStyle={styles.titleStyle}
                filtContainer={styles.filtContainer}
                filtTitleStyle={styles.filtTitle}
                filtImgStyle={styles.filtImg}
                title={t.labels.PBNA_MOBILE_COPILOT_MY_WEEK_AT_A_GLANCE}
                subtitle={selectWeek}
                onPress={() => {
                    onPress && onPress()
                }}
            />
            <ScrollView
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.dateContainer}
                contentContainerStyle={styles.dateTimeContainer}
            >
                {dateLabelArr.map((item, index) => {
                    return dateTimeIcon(item, index, () => {
                        onClickToSelectDate(item)
                    })
                })}
            </ScrollView>
            <SectionView sectionData={currentData} isDafault={selectWeek === defaultWeek} />
        </View>
    )
}

export default MyWeek
