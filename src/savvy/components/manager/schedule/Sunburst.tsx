/**
 * @description Sunburst component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-04-01
 */

import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { G, Path, Svg } from 'react-native-svg'
import * as d3 from 'd3'
import CText from '../../../../common/components/CText'
import { SunburstEmployeeCell } from '../common/EmployeeCell'
import SunburstStyle from '../../../styles/manager/SunburstStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType, NavigationRoute } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import Carousel from '../../common/carousel'
import { useSelector } from 'react-redux'

interface SunburstProps {
    sourceData?: Array<any>
    cRef?: any
    navigation?: any
    activeTab?: number
}

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const isIp12 = () => {
    return SCREEN_HEIGHT < 845
}
const OUTER_RADIUS = isIp12() ? 130 : 170
// set the dimensions and margins of the graph
const INNER_RADIUS = 80

const TRANSLATE_STRING = 'translate(' + SCREEN_WIDTH / 2 + ',' + SCREEN_WIDTH / 2 + ')'
const RED = baseStyle.color.red
const GREEN = baseStyle.color.loadingGreen
const YELLOW = baseStyle.color.yellow
const TAB_ALL_INDEX = 0
const TAB_RED_INDEX = 1
const TAB_YELLOW_INDEX = 2
const TAB_GREEN_INDEX = 3
const DEFAULT_OPACITY = 1
const LOWLIGHT_OPACITY = 0.2
const HOUR_INTERVAL = [0, 40, 50]
const employeeCardContainerMargin = 30
const employeeCardMargin = 40
const managerReducer = (state) => state.manager

const innerCircleStyle = StyleSheet.create({
    picInnerView: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: INNER_RADIUS,
        width: INNER_RADIUS * 2,
        height: INNER_RADIUS * 2,
        position: 'absolute',
        top: SCREEN_WIDTH / 2 - INNER_RADIUS,
        left: SCREEN_WIDTH / 2 - INNER_RADIUS,
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowColor: '#004C97',
        shadowOpacity: 0.3,
        backgroundColor: 'white'
    },
    mt_10: {
        marginTop: -10
    },
    mt_45: {
        marginTop: -45
    }
})

const styles = Object.assign(SunburstStyle, innerCircleStyle)

const handleAllTabColor = (value, color) => {
    if (value > HOUR_INTERVAL[0] && value < HOUR_INTERVAL[1]) {
        color = GREEN
    } else if (value < HOUR_INTERVAL[2] && value >= HOUR_INTERVAL[1]) {
        color = YELLOW
    } else if (value >= HOUR_INTERVAL[2]) {
        color = RED
    } else {
        color = baseStyle.color.bgGray
    }
    return color
}

const handleEmployeeData = (employeeData, tabIndex) => {
    const filteredEmployees = []
    if (!tabIndex) {
        tabIndex = TAB_ALL_INDEX
    }
    employeeData.forEach((item) => {
        let color = ''
        const value = item.value
        switch (tabIndex) {
            case TAB_ALL_INDEX:
                color = handleAllTabColor(value, color)
                filteredEmployees.push({ name: item.label, color: color, ...item })
                break
            case TAB_RED_INDEX:
                if (value >= HOUR_INTERVAL[2]) {
                    color = RED
                    filteredEmployees.push({ name: item.label, color: color, ...item })
                }
                break
            case TAB_YELLOW_INDEX:
                if (value < HOUR_INTERVAL[2] && value >= HOUR_INTERVAL[1]) {
                    color = YELLOW
                    filteredEmployees.push({ name: item.label, color: color, ...item })
                }
                break
            case TAB_GREEN_INDEX:
                if (value > HOUR_INTERVAL[0] && value < HOUR_INTERVAL[1]) {
                    color = GREEN
                    filteredEmployees.push({ name: item.label, color: color, ...item })
                }
                break
            default:
                break
        }
    })
    return filteredEmployees.sort((a, b) => {
        return b.value - a.value
    })
}

const handleSVGClick = (index, employeeChartDatas, setEmployeeChartDatas, setEmployeeCardData) => {
    employeeChartDatas.forEach((item, ind) => {
        if (index !== ind) {
            item.opacity = LOWLIGHT_OPACITY
        } else {
            item.opacity = DEFAULT_OPACITY
        }
        return item
    })
    setEmployeeChartDatas(JSON.parse(JSON.stringify(employeeChartDatas)))
    // employeeCardData.position = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }
    setEmployeeCardData({ show: true })
}

const handleCarouselConfig = (index, dataLength, setLoopClone, setCurrentIndex) => {
    let loopCopiesPerSide = 3
    const threshold = 6
    if (dataLength > threshold) {
        loopCopiesPerSide = Math.ceil(dataLength / 2)
    }
    setLoopClone(loopCopiesPerSide)
    setCurrentIndex(index)
}

const Sunburst = (props: SunburstProps) => {
    const { sourceData, cRef, activeTab, navigation } = props
    const EMPLOYEE = t.labels.PBNA_MOBILE_EMPLOYEE
    const EMPLOYEES = t.labels.PBNA_MOBILE_EMPLOYEES

    const initialEmployeeCardData = { show: false, position: { x: 0, y: 0 } }
    const [employeeChartDatas, setEmployeeChartDatas] = useState([])
    const [employeeCardData, setEmployeeCardData] = useState(initialEmployeeCardData)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loopClone, setLoopClone] = useState(5)
    const { dropDownRef } = useDropDown()
    const manager = useSelector(managerReducer)
    const employeeData = []
    let maxValue = 0
    sourceData?.forEach((employee) => {
        return employeeData.push({
            label: employee.name,
            value: employee.totalHours,
            opacity: DEFAULT_OPACITY,
            ...employee
        })
    })

    const handlePathDatas = () => {
        try {
            const filteredEmployeeDatas = handleEmployeeData(employeeData, activeTab)
            maxValue = filteredEmployeeDatas[0]?.value || 0
            const xx = d3
                .scaleBand()
                .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
                .align(0)
                .domain(
                    filteredEmployeeDatas.map(function (d) {
                        return d.id
                    })
                ) // The domain of the X axis is the list of states.
            const yy = d3
                .scaleLinear()
                .range([INNER_RADIUS, OUTER_RADIUS]) // Domain will be define later.
                .domain([0, maxValue]) // Domain of Y is from 0 to the max seen in the data
            const arcGenerator = d3.arc()

            const tempPathDatas = []
            filteredEmployeeDatas.forEach((item) => {
                const pathData = arcGenerator({
                    startAngle: xx(item.id),
                    endAngle: xx(item.id) + xx.bandwidth(),
                    innerRadius: INNER_RADIUS,
                    outerRadius: yy(item.value),
                    padAngle: 0.01,
                    padRadius: INNER_RADIUS
                })
                tempPathDatas.push({ data: pathData, ...item })
            })
            return tempPathDatas
        } catch (err) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, err, t.labels.PBNA_MOBILE_SUNBURST)
        }
    }

    const pathDatas = handlePathDatas()

    const handleSunburstDatas = () => {
        setEmployeeCardData(initialEmployeeCardData)
        setEmployeeChartDatas(pathDatas)
    }

    useImperativeHandle(cRef, () => ({
        setSunburstDatas: () => {
            handleSunburstDatas()
        }
    }))

    useEffect(() => {
        handleSunburstDatas()
    }, [activeTab])

    const goToSelectSchedule = (item) => {
        navigation?.navigate(NavigationRoute.SELECT_SCHEDULE, {
            isESchedule: true,
            userData: item,
            isFromScheduleSummary: true
        })
    }

    const renderEmployeeItem = (manager) => {
        let view = null
        const { show } = employeeCardData
        if (show) {
            view = (
                <View style={styles.employeeItemContainer}>
                    <Carousel
                        enableSnap
                        loopClonesPerSide={loopClone}
                        loop
                        lockScrollWhileSnapping
                        onSnapToItem={(index) => {
                            handleCarouselConfig(index, employeeChartDatas.length, setLoopClone, setCurrentIndex)
                            handleSVGClick(index, employeeChartDatas, setEmployeeChartDatas, setEmployeeCardData)
                        }}
                        horizontal
                        firstItem={currentIndex}
                        sliderWidth={SCREEN_WIDTH - employeeCardContainerMargin}
                        itemWidth={SCREEN_WIDTH - employeeCardContainerMargin}
                        data={employeeChartDatas}
                        renderItem={({ item }) => (
                            <View
                                key={item?.id}
                                style={[
                                    styles.employeeCardContainer,
                                    { width: SCREEN_WIDTH - employeeCardContainerMargin }
                                ]}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={[styles.employeeCard, { width: SCREEN_WIDTH - employeeCardMargin }]}>
                                        <SunburstEmployeeCell
                                            click={goToSelectSchedule}
                                            item={item}
                                            manager={manager}
                                        />
                                        {/* <View style={[styles.arrow, { left: position.x - 25 }]} /> */}
                                    </View>
                                    {/* <View style={[styles.employeeCard, { width: SCREEN_WIDTH - 44, top: position.y - 110 }]}> */}
                                </TouchableWithoutFeedback>
                            </View>
                        )}
                    />
                </View>
            )
        }
        return view
    }

    return (
        <TouchableOpacity
            activeOpacity={DEFAULT_OPACITY}
            onPress={() => {
                setEmployeeChartDatas(pathDatas)
                setEmployeeCardData(initialEmployeeCardData)
            }}
            disabled={employeeChartDatas.length === 0}
        >
            {renderEmployeeItem(manager)}
            <Svg
                onTouchStart={() => setEmployeeChartDatas(pathDatas)}
                width={SCREEN_WIDTH}
                height={SCREEN_WIDTH}
                style={isIp12() ? styles.mt_45 : styles.mt_10}
            >
                <View style={styles.picInnerView}>
                    <CText style={[styles.textFontSize_24, styles.textFontWeight_900]}>
                        {employeeChartDatas.length}
                    </CText>
                    <CText style={[styles.textFontSize_14, styles.textFontWeight_700]}>
                        {employeeChartDatas.length === 1 ? EMPLOYEE : EMPLOYEES}
                    </CText>
                </View>
                <G transform={TRANSLATE_STRING}>
                    {employeeChartDatas.map((item, index) => (
                        <Path
                            onPress={() => {
                                handleCarouselConfig(index, employeeChartDatas.length, setLoopClone, setCurrentIndex)
                                handleSVGClick(index, employeeChartDatas, setEmployeeChartDatas, setEmployeeCardData)
                            }}
                            key={item?.id}
                            d={item.data}
                            fill={item.color}
                            opacity={item.opacity}
                        />
                    ))}
                </G>
            </Svg>
        </TouchableOpacity>
    )
}

export default Sunburst
