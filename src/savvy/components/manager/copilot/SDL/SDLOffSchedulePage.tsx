import moment from 'moment'
import React, { useEffect, useState, FC, useRef } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { Log } from '../../../../../common/enums/Log'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { t } from '../../../../../common/i18n/t'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { existParamsEmpty } from '../../../../api/ApiUtil'
import {
    getSDLCopilotASASEmployees,
    getSDLCopilotOffScheduleCustomers,
    getSDLOffScheduleData
} from '../../../../helper/manager/AllManagerMyDayHelper'
import SelectTab from '../../../common/SelectTab'
import { getCurrentPeriod, getParamsDay } from '../../../merchandiser/MyPerformance'
import CalendarWithTD from '../../common/CalendarWithTD'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import Loading from '../../../../../common/components/Loading'
import ASASEmployeeCard, { ASASEmployee } from './ASASEmployeeCard'
import CopilotNavHeader from '../CopilotNavHeader'
import MMSearchBar from '../../common/MMSearchBar'
import { filterEmployeeByName } from '../../helper/MMSearchBarHelper'
import { sortArrByParamsDESC } from '../../helper/MerchManagerHelper'
import OffScheduleCustomerCard from './OffScheduleCustomerCard'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { LottieSrc } from '../../../../../common/enums/LottieSrc'
import LottieView from 'lottie-react-native'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { SoupService } from '../../../../service/SoupService'
import _ from 'lodash'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    containerBox: {
        width: '100%',
        height: 117,
        backgroundColor: '#fff'
    },
    marginTop_13: {
        marginTop: -13
    },
    selectTap: { marginTop: -22, marginHorizontal: 22 },
    totalStyle: {
        marginTop: 22,
        marginLeft: 22
    },
    totalTextStyle: {
        fontSize: 12,
        color: '#000000'
    },
    totalNumStyle: {
        marginTop: 4,
        fontSize: 18,
        fontWeight: '900'
    },
    containerListBox: {
        paddingTop: 20,
        backgroundColor: '#fff'
    },
    searchContainer: {
        paddingHorizontal: 22,
        paddingBottom: 20
    },
    borderBottomGray: {
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: baseStyle.color.gray
    },
    flatListBottom: {
        marginBottom: 30
    },
    tinyLoading: {
        width: 30,
        height: 30
    }
})

const ACTIVE_TAB = 0

export interface OffScheduleMetrics {
    objDelivery: number
    objOrder: number
}

interface OffScheduleProps {
    navigation: any
    route: any
}

export interface OffScheduleCustomerItem {
    idUser: string
    idVisit: string
    idOrder: string
    strName: string
    strDeliveryDay: string
    strDeliveryOffSchedule: string
    strOrderDay: string
    strOrderOffSchedule: string
    boolOrder: boolean
    boolDelivery: boolean
}

const SDLOffSchedulePage: FC<OffScheduleProps> = (props: OffScheduleProps) => {
    const { navigation, route } = props
    const selectedTerritory = route?.params?.selectedTerritoryId
    const [activeTab, setActiveTab] = useState(ACTIVE_TAB)
    const [selDay, setSelDay] = useState(moment().format(TIME_FORMAT.Y_MM_DD))
    const [resData, setResData] = useState({ objDelivery: 0, objOrder: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const selectTabData = [
        {
            name: t.labels.PBNA_MOBILE_ORDER_DAY.toLocaleUpperCase()
        },
        {
            name: t.labels.PBNA_MOBILE_DELIVERY_DAY.toLocaleUpperCase()
        }
    ]
    const [employeeOriginList, setEmployeeOriginList] = useState(Array<ASASEmployee>)
    const [employeeList, setEmployeeList] = useState(Array<ASASEmployee>)
    const [startDay, setStartDay] = useState('')
    const [endDay, setEndDay] = useState('')
    const initialCustomerCardData: Array<OffScheduleCustomerItem> = []
    const [customerCardData, setCustomerCardData] = useState(initialCustomerCardData)
    const [isCustomerLoading, setIsCustomerLoading] = useState(false)
    const searchBarRef: any = useRef()

    const onTabChanged = (index: number) => {
        setActiveTab(index)
    }
    const onChangeDate = (date: string) => {
        if (date === t.labels.PBNA_MOBILE_WEEK_TO_DATE) {
            setSelDay(t.labels.PBNA_MOBILE_WEEK_TO_DATE)
        } else {
            const dateFormat = moment(date).format(TIME_FORMAT.Y_MM_DD)
            setSelDay(dateFormat)
        }
    }

    const onEECardClick = async (item: ASASEmployee) => {
        setCustomerCardData([])
        setIsCustomerLoading(true)
        item.isOpen = !item.isOpen
        const tempEmployeeList = employeeList.map((eeItem: ASASEmployee) => {
            if (eeItem.isOpen && eeItem.userID !== item.userID) {
                eeItem.isOpen = false
            }
            return eeItem
        })
        setEmployeeList(tempEmployeeList)
        if (item.isOpen) {
            const resData = await getSDLCopilotOffScheduleCustomers(startDay, endDay, item.userID)
            const filteredData = resData.filter((item) =>
                activeTab === ACTIVE_TAB ? item.boolOrder : item.boolDelivery
            )
            setCustomerCardData(filteredData as Array<OffScheduleCustomerItem>)
        }
        setIsCustomerLoading(false)
    }

    const queryVisitData = async (visitId: string) => {
        try {
            const res = await SoupService.retrieveDataFromSoup(
                'Visit',
                {},
                ['Id', 'PlaceId', 'Planned_Date__c', 'VisitorId', 'Check_In_Location_Flag__c', 'PlannedVisitStartTime'],
                `
                SELECT
                    {Visit:Id},
                    {Visit:PlaceId},
                    {Visit:Planned_Date__c},
                    {Visit:VisitorId},
                    {Visit:Check_In_Location_Flag__c},
                    {Visit:PlannedVisitStartTime}
                    FROM {Visit}
                WHERE {Visit:Id} = '${visitId}'
            `
            )
            return res[0]
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'SDL-OffSchedule-' + queryVisitData.name, ErrorUtils.error2String(e))
        }
    }

    const renderItem = ({ item }: ListRenderItemInfo<ASASEmployee>) => {
        item.totalCount = activeTab === ACTIVE_TAB ? item.orderCount : item.deliveryCount
        return (
            <View style={[item.isOpen && styles.borderBottomGray]}>
                <ASASEmployeeCard
                    item={item}
                    showTotal
                    needFullBorderBottom
                    onPressFunc={() => {
                        onEECardClick(item)
                    }}
                />
                {item.isOpen && isCustomerLoading && (
                    <View style={commonStyle.alignCenter}>
                        <LottieView
                            source={LottieSrc.LOADING as unknown as string}
                            autoPlay
                            loop
                            style={styles.tinyLoading}
                        />
                    </View>
                )}
                {item.isOpen &&
                    customerCardData?.map((cardItem, index) => {
                        return (
                            <OffScheduleCustomerCard
                                key={cardItem.idOrder}
                                item={cardItem}
                                onPressFunc={async () => {
                                    const visitData = await queryVisitData(cardItem.idVisit)
                                    if (!_.isEmpty(visitData)) {
                                        navigation.navigate('SDLVisitDetails', {
                                            navigation,
                                            item: visitData
                                        })
                                    }
                                }}
                                isLastItem={index === customerCardData?.length - 1}
                            />
                        )
                    })}
            </View>
        )
    }

    const getOffScheduleData = async (selDay: string) => {
        try {
            setIsLoading(true)
            let startDay, endDay
            if (selDay === t.labels.PBNA_MOBILE_WEEK_TO_DATE) {
                startDay = getParamsDay(t.labels.PBNA_MOBILE_WEEK_TO_DATE, '', getCurrentPeriod).firstDay
                endDay = getParamsDay(t.labels.PBNA_MOBILE_WEEK_TO_DATE, '', getCurrentPeriod).secondDay
            } else {
                startDay = endDay = selDay
            }
            setStartDay(startDay)
            setEndDay(endDay)
            if (existParamsEmpty([startDay, endDay, selectedTerritory])) {
                setIsLoading(false)
                return
            }
            getSDLOffScheduleData(startDay, endDay, setResData, selectedTerritory)
            const listData = await getSDLCopilotASASEmployees(startDay, endDay, selectedTerritory, 'OFF')
            const orderByCountList = sortArrByParamsDESC(
                listData.filter((item) => (activeTab === ACTIVE_TAB ? item.orderCount > 0 : item.deliveryCount > 0)),
                activeTab === ACTIVE_TAB ? 'orderCount' : 'deliveryCount'
            )
            setEmployeeOriginList(orderByCountList)
            setEmployeeList(orderByCountList)
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, getOffScheduleData.name, ErrorUtils.error2String(e))
        }
    }
    useEffect(() => {
        getOffScheduleData(selDay)
        searchBarRef?.current?.reset()
    }, [activeTab, selDay])

    return (
        <View style={styles.container}>
            <CopilotNavHeader navigation={navigation} title={t.labels.PBNA_MOBILE_SDL_OFF_SCHEDULE} />
            <View style={styles.containerBox}>
                <CalendarWithTD
                    style={styles.marginTop_13}
                    needWTD
                    onDateChange={(date: string) => onChangeDate(date)}
                />
            </View>
            <SelectTab
                style={styles.selectTap}
                listData={selectTabData}
                changeTab={onTabChanged}
                activeTab={activeTab}
            />
            <View style={styles.totalStyle}>
                <CText style={styles.totalTextStyle}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                <CText style={styles.totalNumStyle}>{activeTab === 0 ? resData.objOrder : resData.objDelivery}</CText>
            </View>
            <View style={styles.containerListBox}>
                <View style={styles.searchContainer}>
                    <MMSearchBar
                        cRef={searchBarRef}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                        originData={employeeOriginList}
                        setSearchResult={setEmployeeList}
                        onSearchTextChange={filterEmployeeByName}
                    />
                </View>
            </View>
            <FlatList
                style={styles.flatListBottom}
                data={employeeList}
                renderItem={renderItem}
                keyExtractor={(item) => item.userID}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default SDLOffSchedulePage
