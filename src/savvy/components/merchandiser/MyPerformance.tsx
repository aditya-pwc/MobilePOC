/**
 * @description MyPerformance Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-23
 */

import React, { FC, useImperativeHandle, useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import moment from 'moment'
import { CommonParam } from '../../../common/CommonParam'
import CText from '../../../common/components/CText'
import TitleContainer from './TitleContainer'
import { SoupService } from '../../service/SoupService'
import ICON_ARROW_GREEN from '../../../../assets/image/arrow_green.svg'

import { restApexCommonCall } from '../../api/SyncUtils'
import { ARROW_TYPE } from '../../enums/MerchandiserEnums'
import { CommonApi } from '../../../common/api/CommonApi'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
import { Constants } from '../../../common/Constants'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
interface MyPerformanceProps {
    cRef
    navigation?
    logout?
    type?
    userInfo?
    onPress?
}
interface PerformanceIconProps {
    fromMM: boolean
    sectionTitle?
    leftTitle: string
    rightTitle: string
    index?
    leftValue: string | number
    rightValue: string | number
    defaultTarget?
}
const screenWidth = Dimensions.get('window').width
export const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent'
    },
    dateContainer: {
        flexDirection: 'row',
        width: screenWidth - 22,
        marginLeft: 22
    },
    titleContain: {
        flexDirection: 'row',
        width: screenWidth,
        marginTop: 30
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
    performanceContain: {
        marginLeft: 22,
        marginRight: 22,
        width: screenWidth - 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: 13
    },
    iconContain: {
        width: screenWidth / 2 - 28,
        height: 100,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        marginTop: 10
    },
    performanceTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 15,
        marginTop: 15
    },
    latestContain: {
        flexDirection: 'row',
        marginTop: 10
    },
    latestView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 5
    },
    leftTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginLeft: 16
    },
    latestStr: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 16
    },
    arrowImg: {
        width: 10,
        height: 10,
        marginLeft: 5,
        color: '#2DD36F'
    },
    arrowRed: {
        width: 10,
        height: 10,
        marginLeft: 5,
        color: '#EB445A'
    },
    arrowRot180: {
        transform: [{ rotateX: '180deg' }]
    },
    lastContain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    }
})

export const getPepsiCoPeriodCalendar = () => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'PepsiCo_Period_Calendar__mdt',
            {},
            ['Id', 'End_Date__c', 'Sequence__c', 'Start_Date__c', 'Year__c'],
            `
            SELECT
            {PepsiCo_Period_Calendar__mdt:Id},
           {PepsiCo_Period_Calendar__mdt:End_Date__c},
           {PepsiCo_Period_Calendar__mdt:Sequence__c},
           {PepsiCo_Period_Calendar__mdt:Start_Date__c},
           {PepsiCo_Period_Calendar__mdt:Year__c}
           FROM {PepsiCo_Period_Calendar__mdt}
           `
        )
            .then((result: any[]) => {
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getParamsDay = (selectPerformance, periodData, getCurrentPeriodFn) => {
    let firstDay = ''
    let secondDay = ''
    switch (selectPerformance) {
        case t.labels.PBNA_MOBILE_LAST_CLOSED_DAY:
            firstDay = moment().add(-1, MOMENT_STARTOF.DAY).format(TIME_FORMAT.Y_MM_DD)
            secondDay = firstDay
            break
        case t.labels.PBNA_MOBILE_LAST_CLOSED_WEEK:
            {
                const passedDay = moment().add(-7, MOMENT_STARTOF.DAY)
                firstDay = passedDay.startOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
                secondDay = passedDay.endOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
            }
            break
        case t.labels.PBNA_MOBILE_LAST_CLOSED_PERIOD:
            {
                const currentDay = moment().add(-28, MOMENT_STARTOF.DAY)
                const currentPeriod = getCurrentPeriodFn(currentDay, periodData)
                firstDay = currentPeriod.Start_Date__c || ''
                secondDay = currentPeriod.End_Date__c || ''
            }
            break
        case t.labels.PBNA_MOBILE_PERIOD_TO_DATE:
            {
                const currentPeriod = getCurrentPeriodFn(moment(), periodData)
                firstDay = currentPeriod.Start_Date__c || ''
                secondDay = moment().format(TIME_FORMAT.Y_MM_DD)
            }
            break
        case t.labels.PBNA_MOBILE_WEEK_TO_DATE:
            firstDay = moment().startOf(MOMENT_STARTOF.WEEK).format(TIME_FORMAT.Y_MM_DD)
            secondDay = moment().format(TIME_FORMAT.Y_MM_DD)
            break
        default:
            break
    }

    return { firstDay, secondDay }
}

export const getCurrentPeriod = (currentMoment, periodData) => {
    let currentPeriod = {}
    periodData.forEach((element) => {
        const startDay = element.Start_Date__c || ''
        const endDay = element.End_Date__c || ''
        if (
            moment(currentMoment).isSameOrAfter(startDay, MOMENT_STARTOF.DAY) &&
            moment(currentMoment).isSameOrBefore(endDay, MOMENT_STARTOF.DAY)
        ) {
            currentPeriod = element
        }
    })
    return currentPeriod
}

export const GreenUpArrow = <ICON_ARROW_GREEN style={styles.arrowImg} />
export const RedDownArrow = <ICON_ARROW_GREEN style={[styles.arrowRed, styles.arrowRot180]} />

const latestContain = (title, subtitle, arrowType) => {
    return (
        <View style={styles.latestView}>
            <CText style={styles.leftTitle}>{title}</CText>
            <View style={styles.lastContain}>
                <CText style={styles.latestStr}>{subtitle}</CText>
                {arrowType === ARROW_TYPE.GREEN_UP && GreenUpArrow}
                {arrowType === ARROW_TYPE.GREEN_DOWN && (
                    <ICON_ARROW_GREEN style={[styles.arrowImg, styles.arrowRot180]} />
                )}
                {arrowType === ARROW_TYPE.RED_UP && <ICON_ARROW_GREEN style={styles.arrowRed} />}
                {arrowType === ARROW_TYPE.RED_DOWN && RedDownArrow}
            </View>
        </View>
    )
}

export const PerformanceIcon = (props: PerformanceIconProps) => {
    const { sectionTitle, leftTitle, rightTitle, index, leftValue, rightValue, defaultTarget, fromMM } = props

    let type = ARROW_TYPE.HIDDEN
    if (fromMM && rightValue !== null && leftValue !== null) {
        if (sectionTitle === t.labels.PBNA_MOBILE_COPILOT_GAP_TIME_TITLE) {
            const isLessThan10 = leftValue === Constants.LESS_10 && rightValue === 0
            type = leftValue >= rightValue || isLessThan10 ? ARROW_TYPE.GREEN_DOWN : ARROW_TYPE.RED_UP
        }
        if (sectionTitle === t.labels.PBNA_MOBILE_COPILOT_AMAS || sectionTitle === t.labels.PBNA_MOBILE_COPILOT_ASAS) {
            type = leftValue > rightValue ? ARROW_TYPE.RED_DOWN : ARROW_TYPE.GREEN_UP
        }
    }
    if (!fromMM) {
        if (index === 0) {
            if (leftValue > rightValue) {
                type = ARROW_TYPE.GREEN_UP
            } else if (rightValue > leftValue) {
                type = ARROW_TYPE.RED_DOWN
            } else {
                type = ARROW_TYPE.HIDDEN
            }
        } else if (index === 1) {
            if (leftValue > rightValue) {
                type = ARROW_TYPE.RED_DOWN
            } else if (rightValue > leftValue) {
                type = ARROW_TYPE.GREEN_UP
            } else {
                type = ARROW_TYPE.HIDDEN
            }
        }
    }

    const renderContain = () => {
        if (fromMM) {
            return (
                <>
                    {latestContain(leftTitle, leftValue, ARROW_TYPE.HIDDEN)}
                    {latestContain(rightTitle, rightValue, type)}
                </>
            )
        }
        return (
            <>
                {latestContain(leftTitle, leftValue, type)}
                {latestContain(rightTitle, rightValue || defaultTarget, ARROW_TYPE.HIDDEN)}
            </>
        )
    }

    return (
        <View style={styles.iconContain} key={index}>
            <CText style={styles.performanceTitle}>{sectionTitle}</CText>
            <View style={styles.latestContain}>{renderContain()}</View>
        </View>
    )
}

const MyPerformance: FC<MyPerformanceProps> = (props: MyPerformanceProps) => {
    const { cRef, onPress } = props
    const [performanceTitle, setPerformanceTitle] = useState(t.labels.PBNA_MOBILE_WEEK_TO_DATE)
    const [resData, setResData] = useState({})
    const [periodCalendar, setPeriodCalendar] = useState([])

    const getPerformanceWithNet = (selectPerformance, periodData, resolve?, reject?) => {
        const firstDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).firstDay
        const secondDay = getParamsDay(selectPerformance, periodData, getCurrentPeriod).secondDay

        if (!_.isEmpty(CommonParam.userId) && !_.isEmpty(firstDay) && !_.isEmpty(secondDay)) {
            restApexCommonCall(
                `${CommonApi.PBNA_MOBILE_API_GET_PERFORMANCE}/${CommonParam.userId}&${firstDay}&${secondDay}`,
                'GET'
            )
                .then((res) => {
                    const resultData = JSON.parse(res.data || {})
                    setResData(resultData)
                    resolve && resolve('')
                })
                .catch((err) => {
                    reject && reject(err)
                })
        }
    }

    useImperativeHandle(cRef, () => ({
        onChangeSelectPerformance: (type) => {
            setPerformanceTitle(type)
            getPerformanceWithNet(type, periodCalendar)
        },
        pullToRefreshData: () => {
            return new Promise((resolve, reject) => {
                getPerformanceWithNet(performanceTitle, periodCalendar, resolve, reject)
            })
        }
    }))

    useEffect(() => {
        getPepsiCoPeriodCalendar().then((result: any[]) => {
            setPeriodCalendar(result)
            getPerformanceWithNet(performanceTitle, result)
        })
    }, [])

    return (
        <View style={styles.container}>
            <TitleContainer
                titleContain={styles.titleContain}
                titleStyle={styles.titleStyle}
                filtContainer={styles.filtContainer}
                filtTitleStyle={styles.filtTitle}
                filtImgStyle={styles.filtImg}
                title={t.labels.PBNA_MOBILE_MY_PERFORMANCE}
                subtitle={performanceTitle}
                onPress={() => {
                    onPress && onPress()
                }}
            />
            <View style={styles.performanceContain}>
                <PerformanceIcon
                    sectionTitle={t.labels.PBNA_MOBILE_COPILOT_AMAS}
                    leftTitle={t.labels.PBNA_MOBILE_COPILOT_LATEST}
                    fromMM={false}
                    rightTitle={t.labels.PBNA_MOBILE_TARGET}
                    index={0}
                    leftValue={resData.amasLastest || 0}
                    rightValue={resData.amasTarget || 99}
                />
                <PerformanceIcon
                    sectionTitle={t.labels.PBNA_MOBILE_COPILOT_GAP_TIME_TITLE}
                    leftTitle={t.labels.PBNA_MOBILE_COPILOT_LATEST}
                    rightTitle={t.labels.PBNA_MOBILE_TARGET}
                    index={1}
                    fromMM={false}
                    leftValue={resData.gapLastest || 0}
                    rightValue={resData.gapTarget}
                    defaultTarget={'< 10'}
                />
            </View>
        </View>
    )
}

export default MyPerformance
