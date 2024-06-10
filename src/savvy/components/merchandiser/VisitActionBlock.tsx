/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import _ from 'lodash'
import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { callByPhone } from '../../../common/utils/LinkUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { Log } from '../../../common/enums/Log'
import LocationService from '../../service/LocationService'
import PhoneIcon from '../common/PhoneIcon'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { getStringValue } from '../../utils/LandingUtils'
const styles = StyleSheet.create({
    iconContent: {
        alignItems: 'flex-end',
        flex: 0.2,
        flexDirection: 'column'
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column'
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    imageCall: {
        marginLeft: 10
    },
    locationicon: {
        marginTop: 20
    },
    imageLocation: {
        width: 18,
        height: 21,
        alignSelf: 'flex-end',
        marginLeft: 10
    }
})
interface VisitCardFooterInterface {
    item: any
    isVisitList: boolean
    withoutCallIcon: boolean
    hasUserInfo: boolean
}

const VisitActionBlock = (props: VisitCardFooterInterface) => {
    const { item, isVisitList, withoutCallIcon, hasUserInfo } = props
    const { dropDownRef } = useDropDown()

    const clickStoreLocation = (item) => {
        if (
            _.isEmpty(item?.Latitude || item?.latitude) &&
            _.isEmpty(item?.Longitude || item?.longitude) &&
            _.isEmpty(item?.storeLocation)
        ) {
            return
        }
        LocationService.getCurrentPosition().then((position: any) => {
            if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                const bounding = LocationService.getBoundingBox(position.coords, [])
                const originLocation = bounding.initialRegion
                const { latitude, longitude } = originLocation

                if (!latitude || !longitude) {
                    return
                }
                if (item.storeLocation) {
                    const location = JSON.parse(item.storeLocation)
                    item.Longitude = location.longitude || item.longitude
                    item.Latitude = location.latitude || item.latitude
                }
                const originRegion = { latitude: originLocation.latitude, longitude: originLocation.longitude }
                const targetLocation = {
                    latitude: item?.Latitude || item?.latitude,
                    longitude: item?.Longitude || item?.longitude
                }

                LocationService.gotoLocation(originRegion, targetLocation)
            } else {
                dropDownRef.current.alertWithType('info', 'Cannot get your location')
                storeClassLog(Log.MOBILE_WARN, 'GetPositionFailed', `clickStoreLocation: ${getStringValue(position)}`)
            }
        })
    }
    if ((isVisitList || !withoutCallIcon) && !item.isEdit && !hasUserInfo) {
        return (
            <View style={styles.iconContent}>
                <View style={styles.boxContentTextArea}>
                    <TouchableOpacity
                        onPress={() => {
                            callByPhone(item.AccountPhone)
                        }}
                    >
                        <View style={styles.rowWithCenter}>
                            <PhoneIcon imageStyle={styles.imageCall} isDisabled={!item.AccountPhone} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            clickStoreLocation(item)
                        }}
                    >
                        <View style={styles.locationicon}>
                            <Image
                                style={styles.imageLocation}
                                source={require('../../../../assets/image/icon_location.png')}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return null
}

export default VisitActionBlock
