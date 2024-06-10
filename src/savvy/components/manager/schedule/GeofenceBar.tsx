/**
 * @description visual comparison of Geofence
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-10-13
 */

import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import CText from '../../../../common/components/CText'
import moment from 'moment'
import { COLOR_TYPE, ENTRY_TYPE, NUMBER_VALUE, POINT_TYPE } from '../../../enums/MerchandiserEnums'
import {
    getOriginDataWithNet,
    getTimeWithNum,
    getVisitInfoAndRecordRange,
    isDelEndInProgressFlag,
    isDelInProgress,
    showGrayLine
} from './GeofenceBarHelper'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
const screenWidth = Dimensions.get('window').width

interface GeofenceBarProps {
    cRef?
    navigation?
    visit
    fromEmployeeSchedule?
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth - 44,
        marginTop: 10,
        marginBottom: 30,
        flex: 1
    },
    popover: {
        flexDirection: 'row',
        minWidth: 90,
        height: 34,
        borderRadius: 6,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowColor: '#004C97',
        shadowOpacity: 0.17
    },
    popLabel: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 14
    },
    arrowStyle: {
        width: 21,
        height: 19
    },
    popoverPositionView: {
        width: 3,
        height: 5,
        top: 3,
        backgroundColor: 'transparent',
        position: 'absolute'
    },
    barContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth - 44
    },
    sumView: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'space-between'
    },
    sumTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 20
    },
    sumTitleLabel: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    },
    colorView: {
        width: 14,
        height: 14,
        marginLeft: 5
    },
    colorPurple: {
        backgroundColor: '#6C0CC3'
    },
    colorRed: {
        backgroundColor: '#EB445A'
    },
    timeLabel: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 5
    },
    timeLabelGray: {
        color: '#D3D3D3'
    },
    blueFlag: {
        width: 5,
        height: 23,
        backgroundColor: '#00A2D9'
    },
    btnStyle: {
        height: 15
    },
    borderStyle: {
        borderColor: '#FFFFFF',
        borderWidth: 1
    },
    progressItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    popView: {
        backgroundColor: 'transparent'
    },
    unfinishedView: {
        backgroundColor: COLOR_TYPE.GRAY,
        height: 15,
        borderColor: '#FFFFFF',
        borderWidth: 1
    },
    lowHeight: {
        height: 9
    },
    lowGreyView: {
        width: screenWidth - 76,
        marginHorizontal: 15
    }
})

const sumTimeView = (title, colorType, sunTime, showGray) => {
    const viewColor = { backgroundColor: colorType }
    const timeStr = showGray ? '0:00 mins' : sunTime
    return (
        <View style={styles.sumTimeContainer}>
            <CText style={styles.sumTitleLabel}>{title}</CText>
            <View style={[styles.colorView, viewColor]} />
            <CText style={[styles.timeLabel, showGray && styles.timeLabelGray]}>{timeStr}</CText>
        </View>
    )
}

const GeofenceBar = (props: GeofenceBarProps) => {
    const { visit, fromEmployeeSchedule } = props
    const ProgressBarRef = useRef(null)
    const showGray = showGrayLine(visit)
    const [currentVisit, srtCurrentVisit] = useState(visit)
    const [dataSource, setDataSource] = useState([])
    const [totalTime, setTotalTime] = useState(NUMBER_VALUE.ZERO_NUM)
    const [isVisible, setIsVisible] = useState(false)
    const [leftPosition, setLeftPosition] = useState(NUMBER_VALUE.ZERO_NUM)
    const [popTitle, setPopTitle] = useState('')
    const [popTime, setPopTime] = useState('')
    const [purpleTime, setPurpleTime] = useState('')
    const [redTime, setRedTime] = useState('')
    const [uiLength, setUiLength] = useState(NUMBER_VALUE.ZERO_NUM)
    const getVisitDataFromLocal = () => {
        getVisitInfoAndRecordRange(visit).then((resultData: any) => {
            srtCurrentVisit(resultData.visitInfo)
            getOriginDataWithNet(resultData.visitInfo, resultData.configuration).then((result) => {
                if (!result) {
                    return
                }
                setPurpleTime(result.purpleTime)
                setRedTime(result.redTime)
                setTotalTime(result.totalTime)

                const marginWidth = NUMBER_VALUE.MARGIN_WIDTH + (fromEmployeeSchedule ? 20 : 0)
                const fullLength = screenWidth - marginWidth - NUMBER_VALUE.TEN_WIDTH
                const inProgressLength = screenWidth - marginWidth - baseStyle.margin.mg_5 - baseStyle.margin.mg_267
                setUiLength(isDelInProgress(resultData.visitInfo) ? inProgressLength : fullLength)
                setDataSource(result.originSource)
            })
        })
    }

    const showPopover = (item, index) => {
        const { pointType, pointTitle, timeLength, entryType, timePoint } = item
        let currentPositionX = NUMBER_VALUE.ZERO_NUM
        dataSource.forEach((elem, itemIndex) => {
            const progressWidth = (elem.timeLength / totalTime) * uiLength
            if (itemIndex < index) {
                currentPositionX = currentPositionX + progressWidth
            } else if (itemIndex === index) {
                currentPositionX = currentPositionX + progressWidth / NUMBER_VALUE.TWO_NUM
            }
        })
        if (
            moment(timePoint) >= moment(currentVisit.ActualVisitStartTime) &&
            (moment(timePoint) < moment(currentVisit.ActualVisitEndTime) || !currentVisit.ActualVisitEndTime)
        ) {
            currentPositionX = currentPositionX + NUMBER_VALUE.FIVE_NUM
        } else if (moment(timePoint) >= moment(currentVisit.ActualVisitEndTime)) {
            currentPositionX = currentPositionX + NUMBER_VALUE.TEN_WIDTH
        }
        setLeftPosition(currentPositionX)
        setPopTitle(pointType === POINT_TYPE.EVENT && entryType === ENTRY_TYPE.START ? pointTitle : '')
        setPopTime(getTimeWithNum(timeLength))
        setIsVisible(true)
    }

    const closePopover = () => {
        setIsVisible(false)
    }

    useEffect(() => {
        getVisitDataFromLocal()
    }, [props])

    const renderProgressView = (progressItem, index) => {
        const { colorType, pointType, timeLength } = progressItem
        const isFlag = pointType === POINT_TYPE.FLAG && !isDelEndInProgressFlag(currentVisit, progressItem)
        let progressWidth = (timeLength / totalTime) * uiLength

        if (showGray && fromEmployeeSchedule) {
            progressWidth = progressWidth - 40
        }
        const progressStyle = isDelEndInProgressFlag(currentVisit, progressItem)
            ? { width: baseStyle.margin.mg_267, backgroundColor: COLOR_TYPE.GRAY }
            : { width: progressWidth, backgroundColor: colorType }
        return (
            <View style={styles.progressItem} key={index}>
                {isFlag && !fromEmployeeSchedule && <View style={[styles.blueFlag, styles.borderStyle]} />}
                <TouchableOpacity
                    style={[
                        styles.btnStyle,
                        styles.borderStyle,
                        progressStyle,
                        fromEmployeeSchedule && styles.lowHeight
                    ]}
                    onPress={() => {
                        if (isDelEndInProgressFlag(currentVisit, progressItem) || fromEmployeeSchedule) {
                            return
                        }
                        showPopover(progressItem, index)
                    }}
                />
            </View>
        )
    }

    return (
        <View style={[styles.container]}>
            <View style={commonStyle.flex_1}>
                <View
                    style={[
                        styles.barContainer,
                        showGray && styles.unfinishedView,
                        fromEmployeeSchedule && styles.lowHeight,
                        showGray && fromEmployeeSchedule && styles.lowGreyView
                    ]}
                >
                    {!showGray &&
                        dataSource.map((item, index) => {
                            return renderProgressView(item, index)
                        })}
                </View>
                <View ref={ProgressBarRef} style={[styles.popoverPositionView, { left: leftPosition }]} />
            </View>
            {!fromEmployeeSchedule && (
                <View style={styles.sumView}>
                    {sumTimeView(t.labels.PBNA_MOBILE_INSIDE_GEOFENCE, COLOR_TYPE.GREEN, purpleTime, showGray)}
                    {sumTimeView(t.labels.PBNA_MOBILE_OUTSIDE_GEOFENCE, COLOR_TYPE.RED, redTime, showGray)}
                </View>
            )}
            <Popover
                isVisible={isVisible}
                placement={PopoverPlacement.TOP}
                arrowStyle={styles.arrowStyle}
                from={ProgressBarRef}
                backgroundStyle={styles.popView}
                onRequestClose={closePopover}
            >
                <View style={styles.popover}>
                    {popTitle.length > NUMBER_VALUE.ZERO_NUM && <CText style={styles.sumTitleLabel}>{popTitle} </CText>}
                    <CText style={styles.popLabel}>{popTime}</CText>
                </View>
            </Popover>
        </View>
    )
}
export default GeofenceBar
