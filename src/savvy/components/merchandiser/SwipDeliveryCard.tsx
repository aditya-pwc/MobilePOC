import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import 'moment-timezone'
import { SoupService } from '../../service/SoupService'
import DeliveryCard from './DeliveryCard'
import Swiper from 'react-native-swiper'
import { ShipmentStatus } from '../../enums/Visit'
import { Log } from '../../../common/enums/Log'
import { CommonParam } from '../../../common/CommonParam'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { getStringValue } from '../../utils/LandingUtils'
import { getPortraitModeScreenWidthAndHeight } from '../../../common/utils/CommonUtils'
const { width } = getPortraitModeScreenWidthAndHeight()
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        width: width - 44
    },
    dotStyle: {
        backgroundColor: '#D3D3D3',
        width: 10,
        height: 10,
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 5
    },
    empContainer: {
        height: 1,
        width,
        marginBottom: 30
    },
    shadowContainer: {
        shadowColor: '#004C97',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.17
    },
    bottom10: {
        bottom: 10
    }
})

interface SwipDeliveyCard {
    visit
    navigation
    showHalfDeliveryCard?
    showDeliveryRoute?
}

const SwipDeliveryCard = (props: SwipDeliveyCard) => {
    const { visit, navigation, showHalfDeliveryCard, showDeliveryRoute } = props
    const [dataSource, setDataSource] = useState([])
    const [swipHeight, setSwipHeight] = useState(0)
    const [showDot, setShowDot] = useState(false)
    const culateH = (data) => {
        let height = 0
        if (data?.length === 1) {
            height = 180
        } else if (data?.length > 1) {
            height = 200
        }

        return height
    }

    const getDataFromSoup = () => {
        const visitDate = visit.Planned_Date__c || visit.date || visit.PlannedVisitStartTime.split('T')[0]
        SoupService.retrieveDataFromSoup(
            'Order',
            {},
            [
                'OrderId',
                'Dlvry_Rqstd_Dtm__c',
                'Order_Pallet_Count__c',
                'Id',
                'Retail_Store__c',
                'OwnerId',
                'Pallet_Count__c',
                'ActualDeliveryDate',
                'ExpectedDeliveryDate',
                'CreatedDate',
                'TotalItemsQuantity',
                'ShipToName',
                'Description',
                'Employee_Id__c',
                'Total_Certified__c',
                'Total_Delivered__c',
                'Total_Ordered__c',
                'UserId',
                'UserName',
                'FirstName',
                'MobilePhone',
                'LastName',
                'Phone',
                'userStatsId',
                'orderQuantity',
                'DeliveryVisitDate',
                'DeliveryPlannedDate'
            ],
            ` SELECT
            ORD.{Order:Ordr_Id__c},
            ORD.{Order:Dlvry_Rqstd_Dtm__c},
            ORD.{Order:Pallet_Total_IntCount__c},
            SHP.{Shipment:Id},
            SHP.{Shipment:Retail_Store__c},
            SHP.{Shipment:OwnerId},
            SHP.{Shipment:Pallet_Count__c},
            SHP.{Shipment:ActualDeliveryDate},
            SHP.{Shipment:ExpectedDeliveryDate},
            SHP.{Shipment:CreatedDate},
            SHP.{Shipment:TotalItemsQuantity},
            SHP.{Shipment:ShipToName},
            SHP.{Shipment:Description},
            SHP.{Shipment:Employee_Id__c},
            SHP.{Shipment:Total_Certified__c},
            SHP.{Shipment:Total_Delivered__c},
            SHP.{Shipment:Total_Ordered__c},
            {User:Id},
            {User:Name},
            {User:FirstName},
            {User:MobilePhone},
            {User:LastName},
            {User:Phone},
            {User_Stats__c:Id},
            {Order:Total_Ordered_IntCount__c},
            {Visit:ActualVisitStartTime},
            {Visit:PlannedVisitStartTime}
            FROM {Order} ORD
            LEFT JOIN {Shipment} SHP ON SHP.{Shipment:Order_Id__c} = ORD.{Order:Ordr_Id__c}
            LEFT JOIN {Visit} ON ({Order:RetailStore__c} = {Visit:PlaceId}
            AND {Visit:Planned_Date__c} = '${visitDate}'
            AND {Visit:RecordType.DeveloperName} = 'Delivery') OR {Visit:Id} = {Shipment:Visit__c}
            LEFT JOIN {User} ON {User:Id} = {Visit:VisitorId}
            LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
            WHERE ORD.{Order:RetailStore__c} = '${visit ? visit.storeId : 0}' 
            AND
            (date(REPLACE(ORD.{Order:Dlvry_Rqstd_Dtm__c}, '+0000', ''), '${
                CommonParam.userTimeZoneOffset
            }') = '${visitDate}'
            OR
            date(REPLACE(SHP.{Shipment:ActualDeliveryDate}, '+0000', ''), '${
                CommonParam.userTimeZoneOffset
            }') = '${visitDate}'
            )            
            `
        )
            .then((result: any[]) => {
                const statusArr = result.map((item) => {
                    item.Status = item.Id ? ShipmentStatus.CLOSED : ShipmentStatus.OPEN
                    return item
                })
                setDataSource(statusArr)
                setSwipHeight(culateH(statusArr))
                setShowDot(result.length > 1)
            })
            .catch((err) => {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'getDataFromSoup',
                    'Swip delivery card get data error: ' + getStringValue(err)
                )
            })
    }
    useEffect(() => {
        getDataFromSoup()
    }, [])

    return (
        <View
            style={[
                dataSource.length > 0 ? styles.container : styles.empContainer,
                { height: swipHeight },
                styles.shadowContainer
            ]}
        >
            {dataSource.length > 0 && (
                <Swiper
                    height={150}
                    loop
                    horizontal
                    bounces
                    removeClippedSubviews={false}
                    paginationStyle={styles.bottom10}
                    showsPagination={showDot}
                    dot={<View style={styles.dotStyle} />}
                    activeDot={<View style={[styles.dotStyle, { backgroundColor: '#000000' }]} />}
                >
                    {dataSource.map((item: any) => {
                        return (
                            <DeliveryCard
                                showHalfDeliveryCard={showHalfDeliveryCard}
                                showDeliveryRoute={showDeliveryRoute}
                                key={item.OrderId}
                                navigation={navigation}
                                visit={visit}
                                shipment={item}
                            />
                        )
                    })}
                </Swiper>
            )}
        </View>
    )
}

export default SwipDeliveryCard
