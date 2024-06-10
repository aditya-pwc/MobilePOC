/**
 * @description Visit or store list component.
 * @author Christopher
 * @email jiahua.zang@pwc.com
 * @date 2021-08-06
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { callByPhone, formatPhoneNumber } from '../../utils/CommonUtil'
import PhoneIcon from '../../../common/PhoneIcon'
import LocationService from '../../service/LocationService'
import _ from 'lodash'
import IconLocation from '../../../../assets/image/icon_location.svg'
import { IntervalTime } from '../../../savvy/enums/Contract'

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
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40
    },
    locationIcon: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40
    },
    imageLocation: {
        width: 18,
        height: 21
    }
})
interface VisitCardFooterInterface {
    item: any
}

const VisitActionBlock = (props: VisitCardFooterInterface) => {
    const { item } = props

    const clickStoreLocation = (item) => {
        if (_.isEmpty(_.toString(item?.CustomerLongitude)) && _.isEmpty(_.toString(item?.CustomerLatitude))) {
            return
        }
        const targetLocation = { latitude: item?.CustomerLatitude, longitude: item?.CustomerLongitude }
        LocationService.gotoLocation(null, targetLocation)
    }

    const isDisabled = _.isEmpty(_.toString(item?.CustomerLongitude)) && _.isEmpty(_.toString(item?.CustomerLatitude))
    const locationColor = isDisabled ? '#D3D3D3' : '#00A2D9'

    return (
        <View style={styles.iconContent}>
            <View style={styles.boxContentTextArea}>
                <TouchableOpacity
                    testID="OD_Order_INFO_PHONE_ICON"
                    onPress={_.debounce(
                        () => callByPhone(formatPhoneNumber(item.PhoneNum)),
                        IntervalTime.FIVE_HUNDRED,
                        {
                            leading: true,
                            trailing: false
                        }
                    )}
                >
                    <View style={styles.rowWithCenter}>
                        <PhoneIcon isDisabled={!item.PhoneNum} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        clickStoreLocation(item)
                    }}
                >
                    <View style={styles.locationIcon}>
                        <IconLocation style={[styles.imageLocation, { color: locationColor } as ViewStyle]} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default VisitActionBlock
