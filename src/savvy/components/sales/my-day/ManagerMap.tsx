/*
 * @Description: Employee list component
 * @Author: Kevin Gu
 * @Date: 2021-05-13 16:47:33
 * @LastEditTime: 2022-07-28 15:01:27
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useRef, useState } from 'react'
import { getMapModalInfo } from '../../../helper/merchandiser/MyVisitMapHelper'

import { TabID } from '../../../redux/types/H01_Manager/data-tabIndex'
import SwitchableMapModal from '../../common/SwitchableMapModal'
import MapTab from './MapTab'
import SwitchableMap from './SwitchableMap'
interface SalesMapProps {
    employeeList
    isLandscape
    navigation
    currentCardId?: any
    handleSelectedEmployee?: any
    selectedDay: string
}

const ManagerMap = (props: SalesMapProps) => {
    const { employeeList, isLandscape, navigation, currentCardId = null, selectedDay } = props
    const [currentTab, setCurrentTab] = useState(null)
    const [currentVisits, setCurrentVisits] = useState([])
    const [mapModalVisible, setMapModalVisible] = useState(false)
    const refChangeMarker: any = useRef()
    const handleSelectedTab = (tab) => {
        refChangeMarker.current?.setMarker()
        setCurrentTab(tab)
    }

    useEffect(() => {}, [selectedDay])

    const merchMapModal: any = useRef()
    const deliveryMapModal: any = useRef()
    const salesMapModal: any = useRef()

    const onPressMark = async (marker) => {
        const mapInfo: any = await getMapModalInfo([marker])
        const mapItem = mapInfo.find((info) => info.visitId === marker.Id)
        marker = { ...marker, ...mapItem }

        if (currentTab === TabID.TabID_Merch) {
            merchMapModal.current.openModal(marker)
        }
        if (currentTab === TabID.TabID_Sales) {
            salesMapModal.current.openModal(marker)
        }
        if (currentTab === TabID.TabID_Delivery) {
            deliveryMapModal.current.openModal(marker)
        }

        navigation.setOptions({ tabBarVisible: false })
        setMapModalVisible(true)
    }

    return (
        <>
            <MapTab
                employeeList={employeeList}
                selectedDay={selectedDay}
                isOverAllMap
                handleSelectedTab={handleSelectedTab}
                isLandscape={isLandscape}
                setCurrentVisits={setCurrentVisits}
            />

            <SwitchableMap
                currentCardId={currentCardId}
                onPressMark={onPressMark}
                activeTab={currentTab}
                selectedDay={selectedDay}
                currentVisits={currentVisits}
                isLandscape={isLandscape}
                cRef={refChangeMarker}
            />

            <SwitchableMapModal
                currentTab={currentTab}
                navigation={navigation}
                isIndividual={false}
                setMapModalVisible={setMapModalVisible}
                merchMapModal={merchMapModal}
                mapModalVisible={mapModalVisible}
                deliveryMapModal={deliveryMapModal}
                salesMapModal={salesMapModal}
            />
        </>
    )
}

export default ManagerMap
