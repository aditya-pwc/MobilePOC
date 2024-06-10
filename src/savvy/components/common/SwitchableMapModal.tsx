import React, { FC } from 'react'
import { callByPhone, smsByPhone } from '../../../common/utils/LinkUtils'
import { TabID } from '../../redux/types/H01_Manager/data-tabIndex'
import LocationService from '../../service/LocationService'
import DeliveryMapModal from '../merchandiser/DeliveryMapModal'
import ManagerMapModal from '../merchandiser/ManagerMapModal'
import MapModal from '../merchandiser/MapModal'

interface SwitchableMapModalProps {
    navigation
    setMapModalVisible: Function
    currentTab: number
    merchMapModal
    mapModalVisible: boolean
    deliveryMapModal
    salesMapModal
    isIndividual: boolean
    region?: object
}

const SwitchableMapModal: FC<SwitchableMapModalProps> = (props: SwitchableMapModalProps) => {
    const {
        navigation,
        setMapModalVisible,
        currentTab,
        isIndividual,
        merchMapModal,
        mapModalVisible,
        deliveryMapModal,
        salesMapModal,
        region = {}
    } = props

    const onHideMapModal = () => {
        navigation.setOptions({ tabBarVisible: true })
        setMapModalVisible(false)
    }

    const handleOnPressTabIcons = (modalData, index) => {
        if (index === 0) {
            smsByPhone(modalData.phoneNumber)
        }
        if (index === 1) {
            callByPhone(modalData.phoneNumber)
        }
        if (index === 2) {
            LocationService.gotoLocation('', JSON.parse(modalData.storeLocation))
        }
    }

    return (
        <>
            {currentTab === TabID.TabID_Merch && isIndividual && (
                <MapModal
                    cRef={merchMapModal}
                    visible={mapModalVisible}
                    region={region}
                    navigation={navigation}
                    fromMMModal={false}
                    onHideMapModal={onHideMapModal}
                />
            )}
            {currentTab === TabID.TabID_Merch && !isIndividual && (
                <ManagerMapModal
                    currentTab={currentTab}
                    cRef={merchMapModal}
                    navigation={navigation}
                    isShowRouteTab={false}
                    showSubTypeBlock={false}
                    visible={mapModalVisible}
                    onPressTabIcons={(modalData, index) => {
                        handleOnPressTabIcons(modalData, index)
                    }}
                    onHideMapModal={onHideMapModal}
                />
            )}
            {currentTab === TabID.TabID_Delivery && (
                <DeliveryMapModal
                    showNationIdAndSalesRoute
                    cRef={deliveryMapModal}
                    onlyShowOrder
                    navigation={navigation}
                    visible={mapModalVisible}
                    onPressTabIcons={(modalData, index) => {
                        handleOnPressTabIcons(modalData, index)
                    }}
                    onHideMapModal={onHideMapModal}
                />
            )}
            {currentTab === TabID.TabID_Sales && (
                <ManagerMapModal
                    currentTab={currentTab}
                    cRef={salesMapModal}
                    navigation={navigation}
                    showNationIdAndSalesRoute
                    isShowRouteTab={false}
                    showSalesSubTypeBlock
                    hideFooter
                    visible={mapModalVisible}
                    onHideMapModal={onHideMapModal}
                    onPressTabIcons={(modalData, index) => {
                        handleOnPressTabIcons(modalData, index)
                    }}
                    isIndividual={isIndividual}
                />
            )}
        </>
    )
}

export default SwitchableMapModal
