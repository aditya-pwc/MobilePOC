/*
 * @Description:InStoreMap
 * @Author: Mary Qian
 * @Date: 2021-08-11 20:47:48
 * @LastEditTime: 2023-12-05 12:50:30
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import moment from 'moment'
import PromotionToolTip from './PromotionToolTip'
import CommonTooltip from '../common/CommonTooltip'
import { Promotion } from '../../model/InStoreMapInterface'
import InStoreMapService from '../../service/InStoreMapService'
import InStoreMapDataService from '../../service/InStoreMapDataService'
import { Log } from '../../../common/enums/Log'
import { getStringValue } from '../../utils/LandingUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../common/utils/LogUtils'
import _ from 'lodash'

const pictureHeight = 0
const pictureWidth = Dimensions.get('window').width - 40

const styles = StyleSheet.create({
    storeMap: {
        width: pictureWidth,
        zIndex: 10
    },
    locationIcon: {
        position: 'absolute',
        zIndex: 100,
        height: 30,
        marginLeft: -15,
        marginTop: -15,
        width: 30
    },
    locationContainer: {},
    depart: {
        width: 30,
        height: 30
    },
    promotionContainer: {
        width: 30,
        height: 30,
        marginLeft: 15,
        marginTop: -19
    },
    promotionWrapper: {
        width: 30,
        height: 30,
        padding: 5
    },
    promotion: {
        width: 20,
        height: 20,
        borderRadius: 0
    },
    mapPosition: {
        position: 'relative'
    }
})

interface InstoreMapProps {
    visit
    onDataLoaded?: (isSuccess: boolean) => void
    isOnline?
}

const STORE_HEIGHT = 188
const PACKAGE_HEIGHT = 73
const FLAVOR_HEIGHT = 50
const LOC_OFFSET = 22.5
const TOOLTIP_MAX_HEIGHT = 400

const InStoreMap = (props: InstoreMapProps) => {
    const { visit, isOnline, onDataLoaded } = props
    const mapRef = useRef()
    const [iconList, setIconList] = useState([])
    const [inStoreMapImg, setInStoreMapImg] = useState('')
    const [templateImgHeight, setTemplateImgHeight] = useState(pictureHeight)

    const formatDate = (dateStr) => {
        if (dateStr) {
            return moment(dateStr).format(TIME_FORMAT.DDMMMY)
        }
        return ''
    }

    const getInStoreLocation = async (heightTmp) => {
        const locationList = []

        if (!_.isEmpty(visit?.storeId)) {
            const res = await InStoreMapDataService.getValidInStoreLocationByStoreId(visit.storeId, isOnline)

            for (const item of res) {
                let promo: any = {}
                const departmentImage = InStoreMapService.getDepartmentImage(item.Department_Code__c)
                const displayImage = InStoreMapService.getDisplayImage(item.Display_Icon_Code__c)

                const packages = await InStoreMapService.getInStoreLocationProductsById(item.Id, isOnline)
                promo = {
                    name: item.Display_Name__c,
                    startDate: formatDate(item.Start_Date__c),
                    endDate: formatDate(item.End_Date__c),
                    package: packages
                }

                let storeHeight = STORE_HEIGHT
                packages.forEach((pack) => {
                    storeHeight += PACKAGE_HEIGHT + pack.flavorList.length * FLAVOR_HEIGHT
                })

                if (!item.Display_Icon_Code__c || item.Display_Icon_Code__c.length === 0) {
                    promo = null
                }

                const x = item.X_Coordinate__c * pictureWidth
                const y = item.Y_Coordinate__c * heightTmp

                const loc = {
                    Id: item.Id,
                    x: Math.min(x, pictureWidth - LOC_OFFSET),
                    y: Math.min(y, heightTmp - LOC_OFFSET),
                    departmentImage: !item.Display_Icon_Code__c ? departmentImage : null,
                    displayImage,
                    promotionIcon: '',
                    promotion: promo,
                    popupHeight: storeHeight
                }
                locationList.push(loc)
            }
        }

        setIconList(locationList)
    }

    const fetchInStoreTemplate = async () => {
        try {
            const template = await InStoreMapService.fetchInStoreTemplateByStoreIdAndName(visit.storeId, visit.name)
            const imageUrl = InStoreMapService.getTemplateImage(template)
            Image.getSize(
                imageUrl,
                async (w, h) => {
                    const height = (pictureWidth / w) * h
                    setTemplateImgHeight(height)
                    if (height > 0) {
                        try {
                            await getInStoreLocation(height)
                            onDataLoaded && onDataLoaded(true)
                        } catch (error) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'fetchInStoreTemplate.getInStoreLocation',
                                getStringValue(error)
                            )
                            onDataLoaded && onDataLoaded(false)
                        }
                    }
                },
                (error) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'fetchInStoreTemplate.getSize',
                        `Failed to get size: ${getStringValue(error)}`
                    )
                    onDataLoaded && onDataLoaded(false)
                }
            )
            setInStoreMapImg(imageUrl)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'fetchInStoreTemplate', getStringValue(error))
            onDataLoaded && onDataLoaded(false)
        }
    }

    useEffect(() => {
        fetchInStoreTemplate()
    }, [])

    const renderPromotionPopup = (promotion: Promotion) => {
        if (promotion) {
            return <PromotionToolTip key={promotion.name} promotion={promotion} />
        }
        return <View />
    }

    const renderIcon = (icon) => {
        return (
            <View style={styles.locationContainer}>
                <Image resizeMode="stretch" source={{ uri: icon.departmentImage }} style={styles.depart} />
                {icon.displayImage && (
                    <Image resizeMode="stretch" source={{ uri: icon.displayImage }} style={styles.promotion} />
                )}
            </View>
        )
    }

    return (
        <View style={styles.mapPosition}>
            {!!inStoreMapImg && (
                <Image
                    resizeMode="contain"
                    ref={mapRef}
                    style={[styles.storeMap, { height: templateImgHeight }]}
                    source={{ uri: inStoreMapImg }}
                />
            )}
            {iconList &&
                iconList.map((icon) => {
                    return (
                        <View key={icon.Id} style={[styles.locationIcon, { left: icon.x, top: icon.y }]}>
                            {icon.promotion ? (
                                <View style={styles.locationContainer}>
                                    <Image
                                        resizeMode="stretch"
                                        source={{ uri: icon.departmentImage }}
                                        style={styles.depart}
                                    />
                                    <View style={styles.promotionContainer}>
                                        <CommonTooltip
                                            tooltip={renderPromotionPopup(icon.promotion)}
                                            width={384}
                                            height={Math.min(icon.popupHeight, TOOLTIP_MAX_HEIGHT)}
                                        >
                                            <View style={styles.promotionWrapper}>
                                                <Image
                                                    resizeMode="stretch"
                                                    source={{ uri: icon.displayImage }}
                                                    style={styles.promotion}
                                                />
                                            </View>
                                        </CommonTooltip>
                                    </View>
                                </View>
                            ) : (
                                renderIcon(icon)
                            )}
                        </View>
                    )
                })}
        </View>
    )
}

export default InStoreMap
