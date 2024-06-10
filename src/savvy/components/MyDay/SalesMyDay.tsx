/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-08-10 23:28:34
 * @LastEditTime: 2023-07-26 14:36:37
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */
import React from 'react'
import { View, SectionList, StyleSheet } from 'react-native'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import CText from '../../../common/components/CText'
import DelScheduleVisitCard from '../del-sup/deliveries/DelScheduleCard'
import RefreshControlM from '../manager/common/RefreshControlM'
import ERROR_DELIVERY from '../../../../assets/image/icon-error-visit-list.svg'
import { t } from '../../../common/i18n/t'
import { isPersonaPSR } from '../../../common/enums/Persona'
import MapScreen from '../../pages/MapScreen'
import { getIncomingVisits } from '../../helper/manager/mapHelper'
import { renderKronosActual, renderTravelTime } from '../manager/schedule/EmployeeScheduleList'
import { formatTravelTime } from '../manager/schedule/EmployeeScheduleListHelper'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    flexPadding: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    paddingBottom22: {
        paddingBottom: 22
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    titleAndTimeView: {
        display: 'flex',
        flexDirection: 'row'
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginBottom: 10
    },
    timeTitle: {
        fontFamily: 'Gotham',
        fontSize: 12,
        color: '#000000',
        fontWeight: '400'
    },
    overTime: {
        marginLeft: 7
    },
    sectionLine: {
        marginLeft: 38,
        marginRight: 38,
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    visitAndOrderInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    visitAndOrderInfoLine: {
        width: 1,
        height: 10,
        backgroundColor: '#565656',
        marginHorizontal: 10
    },
    dayEndTitle: {
        marginTop: -5
    },
    sectionListMargin: {
        marginTop: 20
    },
    marginBottom_0: {
        marginBottom: 0
    },
    marginTop_10: {
        marginTop: 10
    },
    marginBottom_10: {
        marginBottom: 10
    }
})

const renderPSRVisitAndOrderInfo = (visitNum) => {
    const completeNum = visitNum?.completeNum || 0
    const totalNum = visitNum?.totalNum || 0
    const orderCompleteNum = visitNum?.orderCompleteNum || 0
    const orderTotalNum = visitNum?.orderTotalNum || 0
    return (
        <View style={styles.visitAndOrderInfoContainer}>
            <CText style={styles.timeTitle}>
                {completeNum + '/' + totalNum}
                {' ' + t.labels.PBNA_MOBILE_VISITS}
            </CText>
            <View style={styles.visitAndOrderInfoLine} />
            <CText style={styles.timeTitle}>
                {orderCompleteNum + '/' + orderTotalNum + ' '}
                {' ' + t.labels.PBNA_MOBILE_DELIVERY_ORDERS}
            </CText>
        </View>
    )
}

const renderHeaderAndFooter = (title: string, section, isStart: boolean, userFirstName: string, visitNum?) => {
    let timeAM = null
    let dateStr = ''
    let showHeard = false
    let showTime = false
    const titleStr = (isStart ? section.title : section.footTitle) || ''

    const isToday = todayDateWithTimeZone(true) === section.visitDate
    const punchInTime = section?.punchIn
        ? ` ${formatWithTimeZone(section.punchIn, TIME_FORMAT.HMMA, true, false)}`
        : null
    const punchOutTime = section?.punchOut
        ? ` ${formatWithTimeZone(section.punchOut, TIME_FORMAT.HMMA, true, false)}`
        : null
    const hadStarted = titleStr.indexOf('+000') > -1
    const isFirstSec = section.indexSection === 0
    if (isToday && !hadStarted && isStart && isFirstSec) {
        if (isPersonaPSR()) {
            timeAM = formatWithTimeZone(new Date(), TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)
        } else {
            timeAM = (userFirstName || '') + ' ' + t.labels.PBNA_MOBILE_NOT_START
        }

        showHeard = true
    } else if (hadStarted) {
        timeAM = ` ${formatWithTimeZone(titleStr, TIME_FORMAT.HMMA, true, true)}`
        if (!isPersonaPSR()) {
            dateStr = ` | ${formatWithTimeZone(titleStr, TIME_FORMAT.DDD_MMM_DD_YYYY, true, false)}`
        }
        showHeard = true
        showTime = true
    }
    const showLineSec = section.indexSection > 0

    if (showHeard) {
        const shouldShowVisitAndOrderView = isStart && hadStarted && !showLineSec && isPersonaPSR()
        return (
            <View>
                {isStart && showLineSec && <View style={styles.sectionLine} />}
                {title === t.labels.PBNA_MOBILE_DAY_STARTED_AT &&
                    punchInTime &&
                    renderKronosActual(punchInTime, styles.marginTop_10, styles.marginBottom_0)}
                <View
                    style={[
                        styles.sectionHeader,
                        isPersonaPSR() &&
                            hadStarted && {
                                paddingHorizontal: 20,
                                justifyContent: 'space-between'
                            }
                    ]}
                >
                    <View
                        style={[
                            styles.titleAndTimeView,
                            title === t.labels.PBNA_MOBILE_DAY_ENDED_AT && styles.dayEndTitle
                        ]}
                    >
                        {showTime && <CText style={styles.headerTitle}>{title}</CText>}
                        <CText style={styles.timeTitle}>{timeAM}</CText>
                        <CText style={styles.headerTitle}>{dateStr}</CText>
                        {isStart && section.overTime && (
                            <ERROR_DELIVERY width={12} height={12} style={styles.overTime} />
                        )}
                    </View>

                    {shouldShowVisitAndOrderView && renderPSRVisitAndOrderInfo(visitNum)}
                </View>
                {title === t.labels.PBNA_MOBILE_DAY_ENDED_AT &&
                    punchOutTime &&
                    renderKronosActual(
                        punchOutTime,
                        { ...styles.marginBottom_10, ...styles.dayEndTitle },
                        styles.marginBottom_0
                    )}
            </View>
        )
    }
    if ((punchInTime || punchOutTime) && !titleStr) {
        return (
            <View>
                {title === t.labels.PBNA_MOBILE_DAY_STARTED_AT &&
                    punchInTime &&
                    renderKronosActual(punchInTime, styles.marginBottom_10, styles.marginBottom_0)}
                {title === t.labels.PBNA_MOBILE_DAY_ENDED_AT &&
                    punchOutTime &&
                    renderKronosActual(
                        punchOutTime,
                        { ...styles.marginBottom_10, ...styles.dayEndTitle },
                        styles.marginBottom_0
                    )}
            </View>
        )
    }
}

const renderItem = (item, navigation) => {
    const { plannedTravelTime, plannedTravelTimeStr, actualTravelTimeStr } = formatTravelTime(item)
    return (
        <>
            {item?.showTravelTime &&
                renderTravelTime(
                    plannedTravelTime,
                    item.actualTravelTime,
                    plannedTravelTimeStr,
                    actualTravelTimeStr,
                    false
                )}
            <DelScheduleVisitCard
                key={item.Id}
                item={item}
                hideUserInfo
                showIndicator
                showPhoneAndLoc
                isForSDLEmployeeSchedule
                onItemPress={() => {
                    if (isPersonaPSR()) {
                        navigation.navigate('CustomerDetailScreen', {
                            customer: {
                                AccountId: item.AccountId
                            },
                            tab: 'SALES ACTIONS'
                        })
                    } else {
                        navigation?.navigate('SDLVisitDetails', {
                            navigation,
                            item
                        })
                    }
                }}
            />
        </>
    )
}

const getSectionTitle = (isDayStarted: boolean) => {
    if (isDayStarted) {
        return t.labels.PBNA_MOBILE_DAY_STARTED_AT
    }
    return t.labels.PBNA_MOBILE_DAY_ENDED_AT
}

export const renderSalesMyDayList = (visitList, navigation, dataLoading, refresh, userFirstName, visitNum?) => {
    const list = visitList[0]?.data ? visitList : []
    return (
        <View style={styles.flexPadding}>
            <SectionList
                sections={list}
                extraData={list}
                style={styles.sectionListMargin}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => renderItem(item, navigation)}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({ section }) => {
                    return renderHeaderAndFooter(getSectionTitle(true), section, true, userFirstName, visitNum)
                }}
                renderSectionFooter={({ section }) => {
                    return renderHeaderAndFooter(getSectionTitle(false), section, false, userFirstName)
                }}
                contentContainerStyle={styles.paddingBottom22}
                stickySectionHeadersEnabled={false}
                refreshControl={<RefreshControlM loading={dataLoading} refreshAction={refresh} />}
            />
        </View>
    )
}

export interface MapEmployeeDataProps {
    persona: string
    buid: string
    gpid: string
}

export const renderSalesMyDayMapView = (
    selectedDate: string,
    navigation,
    employeeListData,
    employeeData: MapEmployeeDataProps
) => {
    return (
        <MapScreen
            selectedDay={selectedDate}
            navigation={navigation}
            mapScreenStyle={{ flex: 1 }}
            incomingVisits={getIncomingVisits(false, employeeListData)}
            employeeListData={employeeListData}
            isMM
            employItem={employeeData}
        />
    )
}
