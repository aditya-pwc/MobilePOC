import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import style from './SalesSnapshot.style'
import PickerModal from '../../common/PickerModal'
import TrendsLineChart, { IAllLineData, UNIT_TYPE } from './TrendsLineChart/TrendsLineChart'
import PackageBreakdown from './PackageBreakDown'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { ProductMix } from './ProductMix'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import InnovationSnapShot from './InnovationSnapShot'
import { Persona, judgePersona } from '../../../../../common/enums/Persona'
import { getCurrentPeriod } from '../../../merchandiser/MyPerformance'
import moment from 'moment'
import { TypeSelector } from '../../../rep/customer/activity-tab/TypeSelector'

const FolderImage = require('../../../../../../assets/image/folder.png')
const UnfolderImage = require('../../../../../../assets/image/unfolder.png')
const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE
const DEFAULT_LABEL = ''
const VOLUME_YTD_VALUE = 'Volume YTD'
const DSD_CONDITION = '003' // 7472052 requirement:  BUSN_SGMNTTN_LVL_3_CDV__c = '003'
const screenWidth = Dimensions.get('window').width
let periodArr = [t.labels.PBNA_MOBILE_YTD, t.labels.PBNA_MOBILE_QTD, t.labels.PBNA_MOBILE_PTD]
let periodMap = {
    YTD: t.labels.PBNA_MOBILE_YTD,
    QTD: t.labels.PBNA_MOBILE_QTD,
    PTD: t.labels.PBNA_MOBILE_PTD
}
const mixArr = () => [
    t.labels.PBNA_MOBILE_VOLUME_YTD,
    t.labels.PBNA_MOBILE_REVENUE_YTD,
    t.labels.PBNA_MOBILE_VOLUME_QTD,
    t.labels.PBNA_MOBILE_REVENUE_QTD,
    t.labels.PBNA_MOBILE_VOLUME_PTD,
    t.labels.PBNA_MOBILE_REVENUE_PTD
]
const mixMap = () => {
    return {
        'Volume YTD': t.labels.PBNA_MOBILE_VOLUME_YTD,
        'Revenue YTD': t.labels.PBNA_MOBILE_REVENUE_YTD,
        'Volume QTD': t.labels.PBNA_MOBILE_VOLUME_QTD,
        'Revenue QTD': t.labels.PBNA_MOBILE_REVENUE_QTD,
        'Volume PTD': t.labels.PBNA_MOBILE_VOLUME_PTD,
        'Revenue PTD': t.labels.PBNA_MOBILE_REVENUE_PTD
    }
}
const graphFilterMap = () => [
    {
        text: t.labels.PBNA_MOBILE_VOLUME_YTD,
        value: UNIT_TYPE.VOLUME_YTD
    },
    {
        text: t.labels.PBNA_MOBILE_REVENUE_YTD,
        value: UNIT_TYPE.REVENUE_YTD
    },
    {
        text: t.labels.PBNA_MOBILE_VOLUME_QTD,
        value: UNIT_TYPE.VOLUME_QTD
    },
    {
        text: t.labels.PBNA_MOBILE_REVENUE_QTD,
        value: UNIT_TYPE.REVENUE_QTD
    },
    {
        text: t.labels.PBNA_MOBILE_VOLUME_PTD,
        value: UNIT_TYPE.VOLUME_PTD
    },
    {
        text: t.labels.PBNA_MOBILE_REVENUE_PTD,
        value: UNIT_TYPE.REVENUE_PTD
    }
]

export enum MixTypesEnum {
    MIX_TOTAL = 'Total',
    MIX_PDP = 'PDP',
    MIX_DSD = 'DSD',
    MIX_ICEE = 'ICEE'
}

const produceMixTypes = () => {
    return [
        {
            name: t.labels.PBNA_MOBILE_TOTAL,
            type: MixTypesEnum.MIX_TOTAL
        },
        {
            name: t.labels.PBNA_MOBILE_DSD,
            type: MixTypesEnum.MIX_DSD
        },
        {
            name: t.labels.PBNA_MOBILE_PDP,
            type: MixTypesEnum.MIX_PDP
        },
        {
            name: t.labels.PBNA_MOBILE_ICEE,
            type: MixTypesEnum.MIX_ICEE
        }
    ]
}

export const getFolderImage = (isExpand: boolean) => {
    return !isExpand ? FolderImage : UnfolderImage
}

export const MockLineData = {
    cy: [10, 13, 10, 9, 10, 10, 10, 15, 10, 10, 10],
    py: [20, 15, 16, 12, 18, 15, 15, 16, 14, 17, 20]
}
interface ISalesSnapshot {
    lineData: IAllLineData
    periodCalendar: any
    packageDownData: Array<any>
    productMixData: any
    toplineMetricsData: {
        volume: {
            YTD: number
            QTD: number
            PTD: number
        }
        revenue: {
            YTD: number
            QTD: number
            PTD: number
        }
    }
    retailStore?: any
    pdpData?: any
}

const renderArrowBtn = (title: string, onPress?: Function, btnStyle?: any) => {
    return (
        <TouchableOpacity
            style={btnStyle}
            onPress={() => {
                onPress && onPress()
            }}
        >
            <View style={style.flexRowAlignCenter}>
                <CText style={style.selectText}>{title}</CText>
                <Image source={IMG_TRIANGLE} style={style.imgTriangle} />
            </View>
        </TouchableOpacity>
    )
}

const SalesSnapshot = (props: ISalesSnapshot) => {
    const { lineData, periodCalendar, packageDownData, productMixData, toplineMetricsData, retailStore, pdpData } =
        props
    const currentPeriod = _.isEmpty(periodCalendar)
        ? 0
        : parseInt(getCurrentPeriod(moment(), periodCalendar)?.Sequence__c || 0, 10)
    const isFocused = useIsFocused()
    const [toplinePickerModalVisible, setToplinePickerModalVisible] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState(t.labels.PBNA_MOBILE_YTD)
    const [selectedUnitVal, setSelectedUnitVal] = useState('YTD')
    const [graphUnitVal, setGraphUnitVal] = useState<`${UNIT_TYPE}`>(UNIT_TYPE.VOLUME_YTD)
    const [graphModalVisible, setGraphModalVisible] = useState(false)
    const [isSalesPerformanceExpand, setIsSalesPerformanceExpand] = useState(true)
    const [isProductMixExpand, setIsProductMixExpand] = useState(true)
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [mixModalVisible, setMixModalVisible] = useState(false)
    const [mixChange, setMixChange] = useState(t.labels.PBNA_MOBILE_VOLUME_YTD)
    const [mixSelected, setMixSelected] = useState(VOLUME_YTD_VALUE)
    const [selectMixData, setSelectMixData] = useState([])
    const [isRev, setIsRev] = useState(false)
    const [selectedType, setSelectedType] = useState(MixTypesEnum.MIX_TOTAL)
    const salesPerformanceTabsArr = [
        t.labels.PBNA_MOBILE_TRENDS.toLocaleUpperCase(),
        t.labels.PBNA_MOBILE_PACKAGE_BREAKDOWN.toLocaleUpperCase()
    ]
    const openToplinePickerModal = () => {
        setToplinePickerModalVisible(true)
    }
    const onPeriodDoneClick = (val) => {
        for (const [key, value] of Object.entries(periodMap)) {
            if (value === val) {
                setSelectedUnitVal(key)
                break
            }
        }
        setToplinePickerModalVisible(false)
    }
    const scrollViewOffsetPage = (index: number) => {
        setActiveTabIndex(index)
    }
    const toggleSalesPerformance = () => {
        setIsSalesPerformanceExpand(!isSalesPerformanceExpand)
    }

    const onToggleGraphFilter = () => {
        setGraphModalVisible((v) => !v)
    }

    const getGraphFilterCurrentLabel = () => {
        return _.find(graphFilterMap(), (item) => item.value === graphUnitVal)?.text || ''
    }

    const getVolume = () => {
        if (!toplineMetricsData || !toplineMetricsData.volume) {
            return '--'
        }
        return _.isNull(toplineMetricsData.volume[selectedUnitVal])
            ? '--'
            : toplineMetricsData.volume[selectedUnitVal] + ' ' + t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()
    }

    const getRevenue = () => {
        if (!toplineMetricsData || !toplineMetricsData.revenue) {
            return '--'
        }
        return _.isNull(toplineMetricsData.revenue[selectedUnitVal])
            ? '--'
            : toplineMetricsData.revenue[selectedUnitVal].toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2
              })
    }

    const onPressSalesPerformanceFilter = () => {
        setMixModalVisible(true)
    }
    const onMixFilterDoneClick = (val: string) => {
        setSelectedType(MixTypesEnum.MIX_TOTAL)
        for (const [key, value] of Object.entries(mixMap())) {
            if (value === val) {
                setMixSelected(key)
                setSelectMixData(productMixData[key])
                setIsRev(key.indexOf('Revenue') > -1)
                break
            }
        }
        setMixModalVisible(false)
    }

    useEffect(() => {
        if (
            mixSelected === VOLUME_YTD_VALUE &&
            retailStore &&
            retailStore['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] === DSD_CONDITION
        ) {
            if (selectedType !== MixTypesEnum.MIX_TOTAL) {
                setSelectMixData(pdpData[selectedType])
            } else {
                setSelectMixData(productMixData[VOLUME_YTD_VALUE])
            }
        }
    }, [selectedType, mixSelected])

    useEffect(() => {
        if (productMixData?.[VOLUME_YTD_VALUE] && _.size(selectMixData) === 0) {
            setSelectMixData(productMixData[VOLUME_YTD_VALUE])
        }
    }, [productMixData])

    useEffect(() => {
        if (isFocused) {
            periodArr = [...[t.labels.PBNA_MOBILE_YTD, t.labels.PBNA_MOBILE_QTD, t.labels.PBNA_MOBILE_PTD]]
            periodMap = Object.assign(
                {},
                {
                    YTD: t.labels.PBNA_MOBILE_YTD,
                    QTD: t.labels.PBNA_MOBILE_QTD,
                    PTD: t.labels.PBNA_MOBILE_PTD
                }
            )
        }
    }, [isFocused])

    const containerStyle = {
        width: screenWidth,
        height: Dimensions.get('window').height - 278,
        backgroundColor: '#F2F4F7'
    }

    return (
        <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
            <View style={style.paddingBottom_40}>
                <View style={style.toplineBlock}>
                    <View style={style.flexSpaceBet}>
                        <CText style={[style.toplineTitle]}>{t.labels.PBNA_MOBILE_TOPLINE_METRICS}</CText>
                        {renderArrowBtn(selectedUnit, openToplinePickerModal)}
                    </View>
                    <View style={style.toplineContent}>
                        <View style={style.toplineSection}>
                            <CText style={style.lightFont12}>{t.labels.PBNA_MOBILE_VOLUME}</CText>
                            <CText style={[style.boldFont16, commonStyle.marginTop_5]}>{getVolume()}</CText>
                        </View>
                        {judgePersona([
                            Persona.PSR,
                            Persona.FSR,
                            Persona.FS_MANAGER,
                            Persona.UNIT_GENERAL_MANAGER,
                            Persona.SALES_DISTRICT_LEADER,
                            Persona.DELIVERY_SUPERVISOR,
                            Persona.CRM_BUSINESS_ADMIN,
                            Persona.KEY_ACCOUNT_MANAGER,
                            Persona.MERCH_MANAGER
                        ]) && (
                            <View style={[style.flexRow, commonStyle.halfWidth]}>
                                <View style={style.topVerticalLine} />
                                <View style={style.toplineRightSection}>
                                    <CText style={style.lightFont12}>{t.labels.PBNA_MOBILE_REVENUE}</CText>
                                    <CText style={[style.boldFont16, commonStyle.marginTop_5]}>{getRevenue()}</CText>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                <View style={style.block}>
                    <TouchableOpacity
                        onPress={() => {
                            toggleSalesPerformance()
                        }}
                    >
                        <View style={style.blockHead}>
                            <CText style={style.boldFont18}>{t.labels.PBNA_MOBILE_SALES_PERFORMANCE}</CText>
                            <Image source={getFolderImage(isSalesPerformanceExpand)} style={style.imgFolder} />
                        </View>
                    </TouchableOpacity>
                    <View>
                        {isSalesPerformanceExpand && (
                            <View>
                                <View style={style.headerTab}>
                                    <ScrollView horizontal bounces={false}>
                                        {salesPerformanceTabsArr.map((value, index) => {
                                            return (
                                                <TouchableOpacity
                                                    key={value}
                                                    onPress={() => scrollViewOffsetPage(index)}
                                                    style={[
                                                        style.tabButton,
                                                        activeTabIndex === index ? style.isActive : null
                                                    ]}
                                                >
                                                    <CText
                                                        style={[
                                                            style.tabTitle,
                                                            activeTabIndex === index ? style.isActive : null
                                                        ]}
                                                    >
                                                        {value}
                                                    </CText>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                                {activeTabIndex === 0 ? (
                                    <View>
                                        {renderArrowBtn(
                                            getGraphFilterCurrentLabel(),
                                            onToggleGraphFilter,
                                            style.mixFilter
                                        )}
                                        <TrendsLineChart
                                            lineData={lineData[graphUnitVal]}
                                            currentPeriod={currentPeriod}
                                            unitType={graphUnitVal}
                                        />
                                    </View>
                                ) : (
                                    <PackageBreakdown packagesDataArr={packageDownData} />
                                )}
                            </View>
                        )}
                    </View>
                </View>
                <View style={style.mixHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            setIsProductMixExpand(!isProductMixExpand)
                        }}
                    >
                        <View style={[style.blockHead, { borderTopWidth: 0 }]}>
                            <CText style={style.boldFont18}>{t.labels.PBNA_MOBILE_PRODUCT_MIX}</CText>
                            <Image source={getFolderImage(isProductMixExpand)} style={style.imgFolder} />
                        </View>
                    </TouchableOpacity>
                </View>
                {isProductMixExpand && (
                    <View style={commonStyle.bgWhite}>
                        {renderArrowBtn(mixChange, onPressSalesPerformanceFilter, style.mixFilter)}
                    </View>
                )}
                {isProductMixExpand &&
                    retailStore &&
                    retailStore['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] === DSD_CONDITION &&
                    mixSelected === VOLUME_YTD_VALUE && (
                        <View style={style.mixPDP}>
                            <TypeSelector
                                type={selectedType}
                                setType={setSelectedType}
                                typeArray={produceMixTypes()}
                                itemStyle={style.pdpItem}
                            />
                        </View>
                    )}
                {isProductMixExpand && selectMixData && <ProductMix dataArr={selectMixData} isRevenue={isRev} />}
                <InnovationSnapShot retailStore={retailStore} innovationData={toplineMetricsData} />
            </View>
            <PickerModal
                modalVisible={toplinePickerModalVisible}
                onDoneClick={onPeriodDoneClick}
                optionsList={periodArr}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_PERIOD_OF_TIME_CASING}
                selectedVal={selectedUnit}
                updateSelectedVal={setSelectedUnit}
            />
            <PickerModal
                modalVisible={mixModalVisible}
                onDoneClick={onMixFilterDoneClick}
                optionsList={mixArr()}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_PERIOD_OF_TIME_CASING}
                selectedVal={mixChange}
                updateSelectedVal={setMixChange}
            />
            <PickerModal
                modalVisible={graphModalVisible}
                onDoneClick={onToggleGraphFilter}
                optionsList={graphFilterMap()}
                DEFAULT_LABEL={DEFAULT_LABEL}
                modalTitle={t.labels.PBNA_MOBILE_PERIOD_OF_TIME_CASING}
                selectedVal={graphUnitVal}
                updateSelectedVal={setGraphUnitVal}
                isTextValueObject
            />
        </ScrollView>
    )
}

export default SalesSnapshot
