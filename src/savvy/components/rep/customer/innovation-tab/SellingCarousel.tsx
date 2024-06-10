/*
 * @Description:
 * @LastEditors: Yi Li
 */
import React, { SetStateAction, useEffect, useRef, useState } from 'react'
import { View, Dimensions, StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native'
import InnovationProductTile from './InnovationProductTile'
import Carousel from '../../../common/carousel'
import { isPersonaPSR, isPersonaKAM, isPersonaUGMOrSDL } from '../../../../../common/enums/Persona'
import { t } from '../../../../../common/i18n/t'
import { renderAllArchivedMessageText, renderEmptyDataText } from './InnovationProductCarousel'

const { width } = Dimensions.get('window')
const carouselCardContainerMargin = 80

const styles = StyleSheet.create({
    carouselContainer: {
        height: '75%',
        marginTop: 30,
        width: '100%',
        marginBottom: 30,
        flex: 1
    },
    loadingContainer: {
        backgroundColor: '#000000',
        height: 545,
        marginTop: 150
    }
})

export const useProductCarouselTabs = () => {
    const initTabs = () => {
        if (isPersonaPSR() || isPersonaKAM() || isPersonaUGMOrSDL()) {
            return [
                {
                    name: t.labels.PBNA_MOBILE_PRIORITIES.toLocaleUpperCase(),
                    value: t.labels.PBNA_MOBILE_PRIORITIES.toLocaleUpperCase(),
                    dot: false
                },
                {
                    name: t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase(),
                    value: t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase(),
                    dot: false
                }
            ]
        }
        return [
            {
                name: t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase(),
                value: t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase(),
                dot: false
            }
        ]
    }
    const [tabs] = useState(initTabs())
    return tabs
}
interface SellingCarouselProps {
    isLoading?: boolean
    navigation: any
    accessToken: any
    retailStore: any
    carouselSelling?: any
    storePriorities?: any
    onClickExecute?: Function
    handleGoBack?: Function
    currentPageNumber?: any
    setCurrentPageNumber: Function
    archivedPriorities: any
    correctPriorityIndex?: number
    updateCarousel?: any
    setReturnFromDetail?: any
    setRouteParamsEmpty?: any
}

const SellingCarousel = (props: SellingCarouselProps) => {
    const {
        isLoading = false,
        navigation,
        accessToken,
        retailStore,
        carouselSelling,
        storePriorities,
        onClickExecute,
        handleGoBack,
        currentPageNumber,
        setCurrentPageNumber,
        archivedPriorities,
        correctPriorityIndex,
        updateCarousel,
        setReturnFromDetail,
        setRouteParamsEmpty
    } = props

    const route = useRoute()
    const { actionType, actionData } = route.params as any

    const isPriorityInNoSaleAction = (priorityId: string) =>
        actionType === 'priorityNoSale' && actionData.actionData?.priority?.Id === priorityId

    const [carouselSellingData, setCarouselSellingData] = useState(carouselSelling)

    // --BEGIN-- force to snap with current page numbers Bug #12148365
    const carouselRef = useRef<Carousel>()
    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current._snapToItem(
                correctPriorityIndex !== null ? correctPriorityIndex : currentPageNumber.current,
                false,
                false,
                true
            )
        }
    }, [correctPriorityIndex, currentPageNumber.current])
    // ---END--- force to snap with current page numbers Bug #12148365

    useEffect(() => {
        setCarouselSellingData(carouselSelling)
    }, [carouselSelling])

    const onClickExecuteBtn = async (exItem: any, storeId: string, setFlag: React.Dispatch<SetStateAction<number>>) => {
        setRouteParamsEmpty && (await setRouteParamsEmpty())
        onClickExecute && (await onClickExecute(exItem, storeId, setFlag))
    }

    if (!carouselSelling?.length && archivedPriorities?.length > 0) {
        return renderAllArchivedMessageText(t.labels.PBNA_MOBILE_PRIORITIES)
    } else if (!carouselSelling?.length || !storePriorities?.length) {
        return renderEmptyDataText(t.labels.PBNA_MOBILE_PRIORITIES)
    }

    return (
        <View style={styles.carouselContainer}>
            <View>
                <Carousel
                    ref={carouselRef}
                    horizontal
                    activeSlideOffset={10}
                    sliderWidth={width}
                    itemWidth={width - carouselCardContainerMargin}
                    firstItem={correctPriorityIndex !== null ? correctPriorityIndex : currentPageNumber.current}
                    initialScrollIndex={
                        correctPriorityIndex !== null ? correctPriorityIndex : currentPageNumber.current
                    }
                    decelerationRate={'normal'}
                    enableSnap
                    inactiveSlideScale={0.9}
                    data={carouselSellingData}
                    onSnapToItem={(slideIndex: number) => {
                        setCurrentPageNumber(slideIndex)
                    }}
                    onScrollIndexChanged={(v: number) => {
                        setCurrentPageNumber(v)
                    }}
                    renderItem={({ item, index }: { item: any; index: number }) => (
                        <InnovationProductTile
                            disabled={isLoading && isPriorityInNoSaleAction(item.Id)}
                            navigation={navigation}
                            item={item}
                            storePriority={storePriorities.find((sp: any) => sp.PriorityId__c === item.Id)}
                            index={index + 1}
                            prodSize={carouselSellingData.length}
                            key={item.Id}
                            accessToken={accessToken}
                            retailStore={retailStore}
                            isSelling
                            onClickExecute={(
                                itemExe: any,
                                storeId: string,
                                setFlag: React.Dispatch<SetStateAction<number>>
                            ) => {
                                onClickExecuteBtn(itemExe, storeId, setFlag)
                            }}
                            onTileGoBack={handleGoBack}
                            sellingData={carouselSellingData}
                            updateCarousel={updateCarousel}
                            setReturnFromDetail={setReturnFromDetail}
                            setRouteParamsEmpty={setRouteParamsEmpty}
                        />
                    )}
                />
            </View>
        </View>
    )
}

export default SellingCarousel
