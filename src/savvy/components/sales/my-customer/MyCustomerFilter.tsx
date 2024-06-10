/*
 * @Description: UGM My Customer filters
 * @Author: Howard Xiao
 * @Date: 2023-09-14
 */

import React, { useState } from 'react'
import { SafeAreaView, View, StyleSheet, NativeAppEventEmitter } from 'react-native'
import CCheckBox from '../../../../common/components/CCheckBox'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import BackButton from '../../common/BackButton'
import NavigationBar from '../../common/NavigationBar'
import { Slider } from '@miblanchard/react-native-slider'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { EventEmitterType } from '../../../enums/Manager'
import { baseStyle } from '../../../../common/styles/BaseStyle'

interface MyCustomerFilterProps {
    navigation: any
    route: any
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: baseStyle.color.white,
        marginBottom: 30
    },
    viewContainer: {
        marginHorizontal: 22
    },
    sortBy: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: '700',
        color: baseStyle.color.black
    },
    checkBox: {
        backgroundColor: baseStyle.color.white,
        marginLeft: 0,
        marginTop: 30
    },
    sliderContainer: {
        marginTop: 30
    },
    marginBottom_10: {
        marginBottom: 10
    },
    marginLeft_8: {
        marginLeft: 8
    },
    slider: {
        height: 3,
        backgroundColor: baseStyle.color.bgGray
    },
    touchSize: {
        width: 40,
        height: 40
    }
})
const DISTANCE_ARRAY = [1, 5, 10, 15, 20]
const DEFAULT_DISTANCE = 10
const MAX_SLIDER_VALUE = 20
const SLIDER_STEP = 5

const MyCustomerFilter = (props: MyCustomerFilterProps) => {
    const { navigation, route } = props
    const [switchOnStoreNearMe, setSwitchOnStoreNearMe] = useState(Boolean(route?.params?.switchOnStoreNearMe))
    const [currentDistance, setCurrentDistance] = useState(route?.params?.distanceStoreNearMe)

    const onResetClick = () => {
        setSwitchOnStoreNearMe(false)
        setCurrentDistance(0)
        NativeAppEventEmitter.emit(EventEmitterType.MY_CUSTOMER_FILTER, {
            switchOnStoreNearMe: false,
            distanceStoreNearMe: 0
        })
        navigation.goBack()
    }

    const onApplyClick = () => {
        NativeAppEventEmitter.emit(EventEmitterType.MY_CUSTOMER_FILTER, {
            switchOnStoreNearMe,
            distanceStoreNearMe: currentDistance
        })
        navigation.goBack()
    }

    const onSwitchOnStoreNearMeOpen = () => {
        setSwitchOnStoreNearMe(!switchOnStoreNearMe)
        setCurrentDistance(switchOnStoreNearMe ? 0 : DEFAULT_DISTANCE)
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.viewContainer}>
                <NavigationBar left={<BackButton navigation={navigation} />} title={t.labels.PBNA_MOBILE_SORT_FILTER} />
                <CText style={styles.sortBy}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
                <CCheckBox
                    title={
                        <View style={commonStyle.flexRowAlignCenter}>
                            <CText>{t.labels.PBNA_MOBILE_STORES_NEAR_ME}</CText>
                        </View>
                    }
                    onPress={onSwitchOnStoreNearMeOpen}
                    checked={switchOnStoreNearMe}
                    containerStyle={[styles.checkBox]}
                />
                <View style={styles.sliderContainer}>
                    <View style={[commonStyle.flexRowSpaceBet, styles.marginBottom_10]}>
                        {DISTANCE_ARRAY.map((item, index) => {
                            return (
                                // to align label and pointer, 1-5 and 5-10 are not the same distance
                                <CText style={index !== 3 && styles.marginLeft_8} key={item}>
                                    {item}
                                </CText>
                            )
                        })}
                    </View>
                    <Slider
                        thumbTouchSize={styles.touchSize}
                        containerStyle={styles.slider}
                        thumbTintColor={switchOnStoreNearMe ? baseStyle.color.tabBlue : baseStyle.color.borderGray}
                        step={SLIDER_STEP}
                        trackMarks={DISTANCE_ARRAY}
                        maximumValue={MAX_SLIDER_VALUE}
                        startFromZero={false}
                        maximumTrackTintColor={baseStyle.color.bgGray}
                        minimumTrackTintColor={
                            switchOnStoreNearMe ? baseStyle.color.tabBlue : baseStyle.color.borderGray
                        }
                        value={currentDistance}
                        onValueChange={(value) => setCurrentDistance(value[0])}
                        disabled={!switchOnStoreNearMe}
                    />
                </View>
            </View>
            <FormBottomButton
                onPressCancel={onResetClick}
                onPressSave={onApplyClick}
                disableSave={!switchOnStoreNearMe}
                rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_APPLY}
                leftButtonLabel={t.labels.PBNA_MOBILE_FILTER_RESET}
            />
        </SafeAreaView>
    )
}

export default MyCustomerFilter
