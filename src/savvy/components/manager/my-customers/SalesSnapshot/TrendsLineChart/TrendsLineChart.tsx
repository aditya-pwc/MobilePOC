import React, { FC, useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { VictoryLabel, VictoryLine, VictoryChart, VictoryTheme, VictoryScatter, VictoryAxis } from 'victory-native'
import CText from '../../../../../../common/components/CText'
import _ from 'lodash'
import { t } from '../../../../../../common/i18n/t'
import { NumberFormatterLocale, Locale } from '../../../../../enums/i18n'
import { CommonParam } from '../../../../../../common/CommonParam'
import { getCurrentQuarter, getPeriodsWeeksRanges } from '../../../../../api/serviceCustomerMetrics'

export interface TrendsLineChartProps {
    lineData: IUnitLineData
    currentPeriod: number
    unitType: string // 'VOLUME_YTD' | 'VOLUME_QTD' | 'VOLUME_PTD' | 'REVENUE_YTD' | 'REVENUE_QTD' | 'REVENUE_PTD'
}
export interface IUnitLineData {
    cy: number[]
    py: number[]
}
export interface IAllLineData {
    VOLUME_YTD: IUnitLineData
    VOLUME_QTD: IUnitLineData
    VOLUME_PTD: IUnitLineData
    REVENUE_YTD: IUnitLineData
    REVENUE_QTD: IUnitLineData
    REVENUE_PTD: IUnitLineData
}
export enum UNIT_TYPE {
    VOLUME_YTD = 'VOLUME_YTD',
    VOLUME_QTD = 'VOLUME_QTD',
    VOLUME_PTD = 'VOLUME_PTD',
    REVENUE_YTD = 'REVENUE_YTD',
    REVENUE_QTD = 'REVENUE_QTD',
    REVENUE_PTD = 'REVENUE_PTD'
}
export const NUMBER_FORMATTER = new Intl.NumberFormat(
    CommonParam.locale === Locale.fr ? NumberFormatterLocale.fr : NumberFormatterLocale.en,
    {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    }
)
const PY_COLOR = '#6C0CC3'
const CY_COLOR = '#2DD36F'
const TOOLTIP_W = 200
const TOOLTIP_H = 60 + 19
const SCREEN_WIDTH = Dimensions.get('window').width
const KILO_TICK = 1000

const styles = StyleSheet.create({
    linecut: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15
    },
    linecutIcon: {
        position: 'relative',
        width: 15,
        height: 8,
        marginLeft: 3
    },
    line: {
        height: 0,
        position: 'absolute',
        width: 15,
        borderTopWidth: 1,
        top: 3
    },
    circle: {
        width: 7,
        height: 7,
        borderRadius: 4,
        borderWidth: 1,
        position: 'absolute',
        left: 4,
        zIndex: 2,
        backgroundColor: '#fff'
    },
    lightFont: {
        fontSize: 10,
        color: '#565656'
    },
    linecutPosition: {
        position: 'absolute',
        right: 25,
        top: 20
    },
    toolTip: {
        backgroundColor: '#fff',
        borderRadius: 6,
        shadowOpacity: 0.17,
        shadowColor: '#004C97',
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        width: TOOLTIP_W,
        paddingVertical: 11,
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute'
    },
    triangle: {
        width: 22,
        height: 40,
        borderTopWidth: 20,
        borderColor: '#fff',
        borderLeftWidth: 11,
        borderRightWidth: 11,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        position: 'absolute',
        backgroundColor: 'transparent',
        left: TOOLTIP_W / 2 - 22 / 2,
        bottom: -40,
        shadowOpacity: 0.17,
        shadowColor: '#004C97',
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 }
    },
    col50: {
        width: '50%',
        paddingHorizontal: 15
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderColor: '#d3d3d3'
    },
    greyFont: {
        fontSize: 12,
        color: '#565656'
    },
    strongFont: {
        fontSize: 13,
        color: '#000',
        fontWeight: 'bold',
        marginTop: 4
    },
    paddingLeft_4: {
        paddingLeft: 4
    }
})

const getLineData = (originData: number[]) => {
    return originData.map((item, index) => {
        return {
            volume: item,
            period: `P${index + 1}`
        }
    })
}

const CustomTooltip = (props: any) => {
    const { x, y, datum, lineData, active, isDisplayTooltip, unitType } = props
    const getLocation = (x: number, y: number) => {
        let left = Math.floor(x) - TOOLTIP_W / 2
        if (left + TOOLTIP_W > SCREEN_WIDTH) {
            left = SCREEN_WIDTH - TOOLTIP_W - 10
        }
        if (left < 0) {
            left = 0
        }
        const triangleLeft = x - left - 11
        const top = Math.floor(y) - TOOLTIP_H - 3
        return { left, top, triangleLeft }
    }
    const { left, top, triangleLeft } = getLocation(x, y)
    let cyVolume = null
    let pyVolume = null
    if (datum.year === 'cy') {
        cyVolume = datum.volume
        pyVolume = lineData.py[datum._x - 1]
    } else {
        pyVolume = datum.volume
        cyVolume = lineData.cy[datum._x - 1]
    }
    if (!_.isNumber(cyVolume)) {
        cyVolume = t.labels.PBNA_MOBILE_NA.toLocaleUpperCase()
    }
    if (!_.isNumber(pyVolume)) {
        pyVolume = t.labels.PBNA_MOBILE_NA.toLocaleUpperCase()
    }
    if (!isDisplayTooltip) {
        return null
    }
    if (!active) {
        return null
    }
    let typeLabel = t.labels.PBNA_MOBILE_VOLUME.toLocaleLowerCase()
    if (unitType?.indexOf('REVENUE') > -1) {
        typeLabel = t.labels.PBNA_MOBILE_REVENUE.toLocaleLowerCase()
        cyVolume = _.isNumber(cyVolume) ? NUMBER_FORMATTER.format(cyVolume) : cyVolume
        pyVolume = _.isNumber(pyVolume) ? NUMBER_FORMATTER.format(pyVolume) : pyVolume
    }
    return (
        <View style={[styles.toolTip, { left, top }]}>
            <View style={styles.col50}>
                <CText style={styles.greyFont}>
                    {t.labels.PBNA_MOBILE_CY.toLocaleUpperCase()} {typeLabel}
                </CText>
                <CText style={styles.strongFont} adjustsFontSizeToFit numberOfLines={1}>
                    {cyVolume}
                </CText>
            </View>
            <View style={[styles.col50, styles.borderLeft]}>
                <CText style={styles.greyFont}>
                    {t.labels.PBNA_MOBILE_PY.toLocaleUpperCase()} {typeLabel}
                </CText>
                <CText style={styles.strongFont} adjustsFontSizeToFit numberOfLines={1}>
                    {pyVolume}
                </CText>
            </View>
            <View style={[styles.triangle, { left: triangleLeft }]} />
        </View>
    )
}

const TrendsLineChart: FC<TrendsLineChartProps> = (props: TrendsLineChartProps) => {
    const { lineData = { cy: [], py: [] }, currentPeriod, unitType } = props
    const [isDisplayTooltip, setIsDisplayTooltip] = useState(true)

    // @ts-ignore
    CustomTooltip.defaultEvents = [
        {
            target: 'data',
            eventHandlers: {
                onPressIn: () => {
                    setIsDisplayTooltip(true)
                    return [
                        {
                            target: 'labels',
                            eventKey: 'all',
                            mutation: () => ({ active: false })
                        },
                        {
                            target: 'labels',
                            mutation: () => ({ active: true })
                        }
                    ]
                }
            }
        }
    ]

    const cyData = getLineData(lineData.cy)
    const pyData = getLineData(lineData.py)
    const allData: any[] = []
    cyData.forEach((item) => {
        allData.push({
            volume: item.volume,
            period: item.period,
            year: 'cy'
        })
    })
    pyData.forEach((item) => {
        allData.push({
            volume: item.volume,
            period: item.period,
            year: 'py'
        })
    })
    const rates = lineData.py.map((py, index) => {
        if (!py || !_.isNumber(py)) {
            return t.labels.PBNA_MOBILE_NA.toLocaleUpperCase()
        }
        const cy = lineData.cy[index]
        if (!_.isNumber(cy)) {
            return t.labels.PBNA_MOBILE_NA.toLocaleUpperCase()
        }
        return `${Math.round((lineData.cy[index] / py) * 100)}%`
    })
    let yDomin = null
    let xDomin = null
    const isAllZero = allData.map((item) => (_.isNumber(item.volume) ? item.volume : 0)).every((item) => item === 0)
    if (isAllZero) {
        yDomin = { y: [0, 100], x: [1, 5] }
        xDomin = { x: [1, 5] }
    }
    const { periodsRange, weeksRange } = getPeriodsWeeksRanges()
    const currentQuarter = getCurrentQuarter(periodsRange, currentPeriod)
    let xDomainValue = _.range(1, 5)
    const getXDomainByDate = () => {
        if (unitType?.indexOf('QTD') > -1) {
            xDomainValue = periodsRange[currentQuarter - 1]
        }
        if (unitType?.indexOf('PTD') > -1) {
            xDomainValue = weeksRange[currentPeriod > 0 ? currentPeriod - 1 : 0]
        }
    }
    getXDomainByDate()
    const formatXAxisX = (value: any, index: number) => {
        let word = 'P'
        if (unitType?.indexOf('YTD') > -1) {
            word = 'Q'
        } else if (unitType?.indexOf('PTD') > -1) {
            word = 'W'
        }
        let rate = rates[index]
        if (_.isUndefined(rate)) {
            rate = ''
        }
        if (xDomainValue[index]) {
            return `${word}${xDomainValue[index]} \n \n ${rate}`
        }
        if (index > xDomainValue.length - 1) {
            return 'N/A'
        }
        return `${word}${index + 1} \n \n ${rate}`
    }
    let xAxisLabel = t.labels.PBNA_MOBILE_PERIODS.toLocaleUpperCase()
    if (unitType?.indexOf('YTD') > -1) {
        xAxisLabel = t.labels.PBNA_MOBILE_QUARTERS.toLocaleUpperCase()
    } else if (unitType?.indexOf('PTD') > -1) {
        xAxisLabel = t.labels.PBNA_MOBILE_WEEKS.toLocaleUpperCase()
    }

    const victoryAxisStyle = {
        axisLabel: { fontSize: 10, fontWeight: 'bolder' },
        tickLabels: { fontSize: 8, padding: 5 }
    }
    return (
        <View style={styles.paddingLeft_4}>
            <View style={[styles.linecut, styles.linecutPosition]}>
                <View style={styles.linecut}>
                    <CText style={styles.lightFont}>{t.labels.PBNA_MOBILE_CY.toLocaleUpperCase()}</CText>
                    <View style={styles.linecutIcon}>
                        <View style={[styles.line, { borderColor: CY_COLOR }]} />
                        <View style={[styles.circle, { borderColor: CY_COLOR }]} />
                    </View>
                </View>
                <View style={styles.linecut}>
                    <CText style={styles.lightFont}>{t.labels.PBNA_MOBILE_PY.toLocaleUpperCase()}</CText>
                    <View style={styles.linecutIcon}>
                        <View style={[styles.line, { borderColor: PY_COLOR }]} />
                        <View style={[styles.circle, { borderColor: PY_COLOR }]} />
                    </View>
                </View>
            </View>
            <VictoryChart
                theme={VictoryTheme.material}
                minDomain={{ y: 0 }}
                padding={{ top: 40, bottom: 80, left: 60, right: 30 }}
                events={[
                    {
                        target: 'parent',
                        eventHandlers: {
                            onPress: () => {
                                setIsDisplayTooltip(false)
                            }
                        }
                    }
                ]}
            >
                <VictoryAxis
                    crossAxis
                    label={xAxisLabel}
                    axisLabelComponent={<VictoryLabel dy={38} />}
                    style={victoryAxisStyle}
                    tickFormat={(t, index) => {
                        return formatXAxisX(t, index)
                    }}
                    domain={xDomin}
                />
                <VictoryAxis
                    dependentAxis
                    crossAxis
                    label={
                        unitType?.indexOf('REVENUE') > -1
                            ? t.labels.PBNA_MOBILE_REVENUE.toLocaleUpperCase()
                            : t.labels.PBNA_MOBILE_VOLUME.toLocaleUpperCase()
                    }
                    axisLabelComponent={<VictoryLabel dy={-25} />}
                    style={victoryAxisStyle}
                    domain={yDomin}
                    tickFormat={(t) => {
                        // Transfer 1000 to 1k, for reducing text length.
                        if (t >= KILO_TICK) {
                            return t / KILO_TICK + 'k'
                        }
                        return t
                    }}
                />
                <VictoryLine
                    width={300}
                    height={300}
                    data={cyData}
                    x={'period'}
                    y={'volume'}
                    style={{
                        data: {
                            stroke: CY_COLOR,
                            strokeWidth: 1
                        }
                    }}
                />
                <VictoryLine
                    width={300}
                    height={300}
                    data={pyData}
                    x={'period'}
                    y={'volume'}
                    style={{
                        data: {
                            stroke: PY_COLOR,
                            strokeWidth: 1
                        }
                    }}
                />
                <VictoryScatter
                    style={{
                        data: {
                            stroke: ({ datum }) => (datum.year === 'cy' ? CY_COLOR : PY_COLOR),
                            strokeWidth: 1,
                            fill: '#fff'
                        }
                    }}
                    data={allData}
                    x={'period'}
                    y={'volume'}
                />
                <VictoryScatter
                    name="scatter"
                    style={{
                        data: {
                            strokeWidth: 1,
                            fill: 'transparent'
                            // fill: '#eee'
                        }
                    }}
                    data={allData}
                    x={'period'}
                    y={'volume'}
                    labels={() => ['']}
                    size={16}
                    labelComponent={
                        <CustomTooltip lineData={lineData} isDisplayTooltip={isDisplayTooltip} unitType={unitType} />
                    }
                />
            </VictoryChart>
        </View>
    )
}

export default TrendsLineChart
