/**
 * @description Employee list component
 * @author Kevin Gu
 * @email kevin.l.gu@pwc.com
 * @date 2021-05-13
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TabID } from '../../../redux/types/H01_Manager/data-tabIndex'
import MyTeamTabs from '../my-team/MyTeamTabs'
import {
    getAllVisitByRecordType,
    getAllVisits,
    parasVisits,
    getSalesOverlapVisits
} from '../../../helper/manager/mapHelper'
import { RecordTypeEnum } from '../../../enums/RecordType'
import { CommonParam } from '../../../../common/CommonParam'
import { isPersonaManager, isPersonaMD, Persona } from '../../../../common/enums/Persona'
import { getOverlapVisits } from '../../merchandiser/MyVisit'
import Loading from '../../../../common/components/Loading'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { t } from '../../../../common/i18n/t'
import _ from 'lodash'
import moment from 'moment'
import { VisitStatus } from '../../../enums/Visit'
interface MapTabProps {
    isOverAllMap: boolean
    employeeList: any[]
    isLandscape: boolean
    selectedDay: string
    setCurrentVisits: (visit) => void
    handleSelectedTab: (tabIndex) => void
    employeeId?: string
    employeeOwnerId?: string
    employItem?: any
}

const styles = StyleSheet.create({
    finalTabContainer: {
        marginTop: -23,
        zIndex: 100
    }
})

const MapTab = (props: MapTabProps) => {
    const {
        employeeList,
        setCurrentVisits,
        handleSelectedTab,
        selectedDay,
        isOverAllMap,
        employeeId = '',
        employeeOwnerId,
        employItem
    } = props
    const [allDeliveryVisits, setAllDeliveryVisits] = useState([])
    const [allSales, setAllSales] = useState([])
    const [allMerchVisit, setAllMerchVisit] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const MyRoutRepTab = {
        tabIndex: TabID.TabID_Merch,
        userType: UserType.UserType_Merch,
        label: t.labels.PBNA_MOBILE_MY_ROUTE,
        RecordType: RecordTypeEnum.MERCHANDISING
    }
    const SalesRepTab = {
        tabIndex: TabID.TabID_Sales,
        RecordType: RecordTypeEnum.SALES,
        userType: UserType.UserType_Sales,
        label: t.labels.PBNA_MOBILE_SALES_REP
    }
    const SalesTab = {
        tabIndex: TabID.TabID_Sales,
        userType: UserType.UserType_Sales,
        label: t.labels.PBNA_MOBILE_SALES,
        RecordType: RecordTypeEnum.SALES
    }
    const MerchTab = {
        tabIndex: TabID.TabID_Merch,
        userType: UserType.UserType_Merch,
        label: t.labels.PBNA_MOBILE_MERCH,
        RecordType: RecordTypeEnum.MERCHANDISING
    }
    const DeliveryTab = {
        tabIndex: TabID.TabID_Delivery,
        userType: UserType.UserType_Delivery,
        label: t.labels.PBNA_MOBILE_DELIVERY,
        RecordType: RecordTypeEnum.DELIVERY
    }

    const sortByActualEndTime = (sortVisits) => {
        function compareFn(a, b) {
            if (moment(a.ActualVisitEndTime).isBefore(b.ActualVisitEndTime)) {
                return -1
            }
            if (moment(a.ActualVisitEndTime).isAfter(b.ActualVisitEndTime)) {
                return 1
            }
            return 0
        }
        if (_.isArray(sortVisits) && !_.isEmpty(sortVisits)) {
            sortVisits
                .filter((visit) => !_.isEmpty(visit.ActualVisitEndTime) && visit.status === VisitStatus.COMPLETE)
                .sort((a, b) => compareFn(a, b))
                .forEach((vt, index) => {
                    vt.Sequence__c = index + 1
                })
            sortVisits
                .filter((visit) => _.isEmpty(visit.ActualVisitEndTime) || visit.status !== VisitStatus.COMPLETE)
                .forEach((vt) => {
                    vt.Sequence__c = null
                })
        }

        return sortVisits
    }

    const handleCurrentTabVisits = (tabIndex) => {
        if (tabIndex === TabID.TabID_Merch) {
            return allMerchVisit
        }
        if (tabIndex === TabID.TabID_Delivery) {
            return allDeliveryVisits
        }
        if (tabIndex === TabID.TabID_Sales) {
            return allSales
        }
    }

    const getIndividualMapTab = () => {
        let finalTabTemp = null
        const persona = CommonParam.selectedTab

        switch (persona) {
            case Persona.MERCH_MANAGER:
                finalTabTemp = [MerchTab, DeliveryTab, SalesTab]
                break
            case Persona.DELIVERY_SUPERVISOR:
                finalTabTemp = [DeliveryTab]
                break
            default:
                finalTabTemp = [SalesTab]
        }

        return finalTabTemp
    }

    const getOverAllMapTab = () => {
        const persona = CommonParam.PERSONA__c
        let finalTabArr = null

        switch (persona) {
            case Persona.MERCH_MANAGER:
                finalTabArr = [MerchTab, DeliveryTab, SalesTab]
                break
            case Persona.DELIVERY_SUPERVISOR:
                finalTabArr = [DeliveryTab, MerchTab, SalesTab]
                break
            default:
                finalTabArr = [SalesTab, DeliveryTab, MerchTab]
        }

        return finalTabArr
    }

    const getMerchandiserMapTab = () => {
        return [MyRoutRepTab, DeliveryTab, SalesRepTab]
    }

    const mapTabArr = [
        { isManager: true, isOverAllMap: false, fn: getIndividualMapTab },
        { isManager: true, isOverAllMap: true, fn: getOverAllMapTab },
        { isManager: false, isOverAllMap: false, fn: getMerchandiserMapTab }
    ]

    const finalTab = mapTabArr
        .find((item) => item.isManager === isPersonaManager() && item.isOverAllMap === isOverAllMap)
        .fn()

    const [activeTab, setActiveTab] = useState(finalTab[0].tabIndex)

    const handleMapTabData = {
        [RecordTypeEnum.DELIVERY]: setAllDeliveryVisits,
        [RecordTypeEnum.SALES]: setAllSales,
        [RecordTypeEnum.MERCHANDISING]: setAllMerchVisit
    }

    const handleChangeTab = (tabItem) => {
        const { tabIndex } = tabItem
        setActiveTab(tabIndex)
        handleSelectedTab(tabIndex)
        if (isPersonaMD() && tabIndex === TabID.TabID_Delivery) {
            return // MD Delivery Tab handled in MapScreen syncDownDeliveryRoute
        }
        setCurrentVisits(handleCurrentTabVisits(tabIndex))
    }

    useEffect(() => {
        // manager map is employeeList but individual map is visitList
        let incomingVisit = []
        incomingVisit = isOverAllMap ? parasVisits(employeeList) : employeeList

        const initVisitList = {}
        const visitTypesSales = [RecordTypeEnum.SALES]
        const visitTypesOther = [RecordTypeEnum.MERCHANDISING, RecordTypeEnum.DELIVERY]
        handleSelectedTab(activeTab)
        // mm's delivery map logic need base on same StoreIds but mm's sales map and SDL and DelSup do not need base on same StoreIds
        // setIsLoading(true)
        Promise.all([
            getAllVisitByRecordType(selectedDay, visitTypesSales, null, true),
            getAllVisitByRecordType(selectedDay, visitTypesOther)
        ])
            .then((visits) => {
                let deliveryOverLapVisits = []
                let merchOverLapVisits = []
                let salesOverLapVisits = []

                if (isOverAllMap) {
                    deliveryOverLapVisits = getAllVisits(selectedDay, visits[1], RecordTypeEnum.DELIVERY)
                    // eslint-disable-next-line camelcase
                    merchOverLapVisits = getAllVisits(selectedDay, visits[1], RecordTypeEnum.MERCHANDISING).filter(
                        // Salesforce API Name
                        // eslint-disable-next-line camelcase
                        ({ Visit_List__c }) => Visit_List__c
                    )
                    salesOverLapVisits = getAllVisits(selectedDay, visits[0], RecordTypeEnum.SALES)
                    if (CommonParam.selectedTab === Persona.SALES_DISTRICT_LEADER) {
                        // SDL sales map tab  data need filter  by territory
                        // incomingVisit is filter by territory so just need 'getOverlap' with incomingVisit
                        salesOverLapVisits = getSalesOverlapVisits(
                            incomingVisit.filter((v) => v.DeveloperName === RecordTypeEnum.SALES),
                            salesOverLapVisits
                        )
                    }
                    if (CommonParam.selectedTab === Persona.MERCH_MANAGER) {
                        // MM delivery map tab  data need getOverlap with merchVisit
                        deliveryOverLapVisits = getOverlapVisits(incomingVisit, deliveryOverLapVisits)
                    }
                } else {
                    // MERCHANDISING and merch manager individual map  logic should get over lap
                    // pay attention md's  individual map  can use offline

                    merchOverLapVisits = isPersonaMD()
                        ? incomingVisit.filter((v) => v.RecordType_DeveloperName === RecordTypeEnum.MERCHANDISING)
                        : getOverlapVisits(
                              incomingVisit,
                              visits[1].filter((res) => res.DeveloperName === RecordTypeEnum.MERCHANDISING)
                          )
                    deliveryOverLapVisits = getOverlapVisits(
                        incomingVisit,
                        visits[1].filter((res) => res.DeveloperName === RecordTypeEnum.DELIVERY)
                    )
                    salesOverLapVisits = getOverlapVisits(
                        incomingVisit,
                        visits[0].filter((res) => res.DeveloperName === RecordTypeEnum.SALES)
                    )
                    if (CommonParam.selectedTab === Persona.SALES_DISTRICT_LEADER) {
                        salesOverLapVisits = salesOverLapVisits.filter(
                            (sales) =>
                                sales.RouteId === employItem.RouteSalesGeoId &&
                                (sales.gpId === employeeId || sales.OwnerId === employeeOwnerId)
                        )
                    }
                    if (CommonParam.selectedTab === Persona.DELIVERY_SUPERVISOR) {
                        deliveryOverLapVisits = deliveryOverLapVisits.filter(
                            (delivery) => delivery.gpId === employeeId || delivery.OwnerId === employeeOwnerId
                        )
                    }
                    if (CommonParam.selectedTab === Persona.MERCH_MANAGER) {
                        merchOverLapVisits = merchOverLapVisits.filter(
                            (delivery) => delivery.gpId === employeeId || delivery.OwnerId === employeeOwnerId
                        )
                    }
                }
                salesOverLapVisits = sortByActualEndTime(salesOverLapVisits)
                initVisitList[RecordTypeEnum.DELIVERY] = deliveryOverLapVisits
                handleMapTabData[RecordTypeEnum.DELIVERY](deliveryOverLapVisits)
                initVisitList[RecordTypeEnum.MERCHANDISING] = merchOverLapVisits
                handleMapTabData[RecordTypeEnum.MERCHANDISING](merchOverLapVisits)
                initVisitList[RecordTypeEnum.SALES] = salesOverLapVisits
                handleMapTabData[RecordTypeEnum.SALES](salesOverLapVisits)

                const activeTabRecordType = finalTab.find((item) => item.tabIndex === activeTab)
                if (!(isPersonaMD() && activeTabRecordType.RecordType === 'Delivery')) {
                    setCurrentVisits(initVisitList[activeTabRecordType.RecordType])
                }
                setIsLoading(false)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [employeeList, selectedDay])

    return (
        <>
            {finalTab.length > 1 && (
                <View style={styles.finalTabContainer}>
                    <MyTeamTabs activeTab={activeTab} tabArr={finalTab} changeTab={handleChangeTab} />
                    <Loading isLoading={isLoading} />
                </View>
            )}
        </>
    )
}

export default MapTab
