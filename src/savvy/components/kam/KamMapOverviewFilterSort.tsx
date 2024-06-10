/**
 * @description KAM Explore tab Overview filter component
 * @author Dashun Fu
 * @email drake.fu@pwc.com
 * @date 2023/09/19
 */

import React, { useState } from 'react'
import { Modal, SafeAreaView, ScrollView, StyleSheet, View, Image } from 'react-native'
import BackButton from '../../components/common/BackButton'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import CCheckBox from '../../../common/components/CCheckBox'
import FormBottomButton from '../../../common/components/FormBottomButton'
import { t } from '../../../common/i18n/t'
import { useBusinessSegmentPicklist } from '../../hooks/LeadHooks'
import { Slider } from '@miblanchard/react-native-slider'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { CommonParam } from '../../../common/CommonParam'
import { Locale } from '../../enums/i18n'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
        marginHorizontal: '5%',
        paddingVertical: 10,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    navTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: 30
    },
    navTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    filterContainer: {
        paddingHorizontal: '5%',
        paddingTop: 10
    },
    filterTitle: {
        fontSize: 14
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    filterOrSortTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 20
    },
    bizSegmentCheckBoxText: {
        fontWeight: '400',
        color: '#000000',
        marginLeft: 5
    },
    bizSegmentCheckBoxContainer: {
        minWidth: '47%',
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0,
        marginTop: 20
    },
    bizSegmentFilterContainer: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingBottom: 15
    },
    topMargin10: {
        marginTop: 10
    },
    distanceCheckBoxContainer: {
        backgroundColor: baseStyle.color.white,
        alignSelf: 'flex-start',
        borderWidth: 0,
        padding: 0,
        flex: 1,
        marginBottom: 22,
        marginLeft: 0
    },
    distanceCheckBoxText: {
        color: baseStyle.color.black,
        fontSize: 14,
        fontWeight: '400',
        marginLeft: 0
    },
    checkCircle: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    distanceFilter: {
        marginTop: 20,
        position: 'relative',
        flex: 1,
        width: '100%',
        height: 'auto'
    },
    defaultThumbStyle: {
        height: 15,
        width: 15
    },
    boldText: {
        fontWeight: baseStyle.fontWeight.fw_700
    },
    valueText: {
        minWidth: 16,
        fontSize: 14,
        justifyContent: 'center',
        textAlign: 'center'
    },
    marginBottom_20: {
        marginBottom: 20
    },
    sliderContainer: {
        height: 3,
        backgroundColor: baseStyle.color.bgGray
    },
    sliderTouchSize: {
        width: 30,
        height: 30
    }
})

export const getDefaultKamOverviewSortFilter = () => {
    return {
        bizSegment: [] as string[],
        milesFilterValue: 0,
        milesFilterChecked: false
    }
}

type Location = {
    latitude: number
    longitude: number
}

interface KamMapOverviewFilterSortProps {
    visible: boolean
    onBack: Function
    userLocation: Location
    kamOverviewSortFilterObject: ReturnType<typeof getDefaultKamOverviewSortFilter>
    setKamOverviewSortFilterObject: React.Dispatch<
        React.SetStateAction<ReturnType<typeof getDefaultKamOverviewSortFilter>>
    >
    setKamOverviewSortFilterQuery: React.Dispatch<React.SetStateAction<string>>
}

const getBizSegmentOptions = (sourceData: string[]) => {
    const map: Record<string, string> = {
        'Large Format': t.labels.PBNA_MOBILE_LARGE_FORMAT,
        'Small Format': t.labels.PBNA_MOBILE_SMALL_FORMAT,
        FoodService: t.labels.PBNA_MOBILE_FOOD_SERVICE
    }

    return sourceData
        .map((item) => {
            return {
                label: map[item],
                value: item
            }
        })
        .filter(Boolean) as { label: string; value: string }[]
}

const MILES_FILTER_MIN = 0
const MILES_FILTER_MAX = 10
const MILES_FILTER_STEP = 2
const KAM_DISTANCE_FILTER_ARRAY = [1, 2, 4, 6, 8, 10]

const KamMapOverviewFilterSort = (props: KamMapOverviewFilterSortProps) => {
    const {
        visible,
        onBack,
        userLocation,
        kamOverviewSortFilterObject,
        setKamOverviewSortFilterObject,
        setKamOverviewSortFilterQuery
    } = props

    const { channelList } = useBusinessSegmentPicklist()
    const bizSegmentOptions = getBizSegmentOptions(channelList.slice(1, 4))

    const [bizSegment, setBizSegment] = useState<string[]>(kamOverviewSortFilterObject.bizSegment)
    const [milesFilterChecked, setMilesFilterChecked] = useState<boolean>(
        kamOverviewSortFilterObject.milesFilterChecked
    )
    const [milesFilterValue, setMilesFilterValue] = useState<number>(kamOverviewSortFilterObject.milesFilterValue)

    const CHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_CHECK_CIRCLE} />
    const UNCHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_UNCHECK_CIRCLE} />

    const handlePressRest = () => {
        setBizSegment([])
        setMilesFilterChecked(false)
        setMilesFilterValue(0)
    }

    const handleGoBack = () => {
        const { bizSegment, milesFilterChecked, milesFilterValue } = kamOverviewSortFilterObject
        setBizSegment(bizSegment)
        setMilesFilterChecked(milesFilterChecked)
        setMilesFilterValue(milesFilterValue)
        onBack()
    }

    const handlePressSave = () => {
        setKamOverviewSortFilterObject({
            ...kamOverviewSortFilterObject,
            bizSegment: bizSegment,
            milesFilterChecked: milesFilterChecked,
            milesFilterValue: milesFilterValue
        })
        let bizSegmentQuery = ''
        if (bizSegment.length) {
            bizSegmentQuery = bizSegment.map((v: string) => `Account.BUSN_SGMNTTN_LVL_3_NM__c = '${v}'`).join(' OR ')
        }
        let distanceQuery = ''
        if (milesFilterChecked && milesFilterValue) {
            const DISTANCE_UNIT = CommonParam.locale === Locale.en ? 'mi' : 'km'
            distanceQuery = `DISTANCE(Store_Location__c, GEOLOCATION(${userLocation.latitude}, ${userLocation.longitude}), '${DISTANCE_UNIT}') < ${milesFilterValue}`
        }
        let resultQuery = ''
        if (bizSegmentQuery || distanceQuery) {
            const splicedBizQuery = bizSegmentQuery ? `AND (${bizSegmentQuery}) ` : ''
            const splicedDistanceQuery = distanceQuery ? `AND ${distanceQuery} ` : ''
            resultQuery = splicedBizQuery + splicedDistanceQuery
        }
        setKamOverviewSortFilterQuery(resultQuery)
        onBack()
    }

    const showValueBoldText = (value: number) => {
        return milesFilterChecked && (milesFilterValue === value || (milesFilterValue === 1 && value === 0))
    }

    return (
        <Modal visible={visible} animationType={'fade'}>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={styles.navHeader}>
                        <BackButton extraStyle={styles.tintColor} onBackPress={handleGoBack} />
                        <View style={styles.navTitleContainer}>
                            <CText style={[styles.navTitle]}>{t.labels.PBNA_MOBILE_SORT_FILTER}</CText>
                        </View>
                    </View>
                    <ScrollView style={styles.filterContainer}>
                        <CText style={styles.filterOrSortTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                        <CText style={[styles.filterTitle, styles.topMargin10]}>
                            {t.labels.PBNA_MOBILE_FILTER_BUSINESS}
                        </CText>
                        <View style={styles.bizSegmentFilterContainer}>
                            {bizSegmentOptions.map((option) => (
                                <CCheckBox
                                    key={option.label}
                                    title={option.label}
                                    textStyle={styles.bizSegmentCheckBoxText}
                                    containerStyle={styles.bizSegmentCheckBoxContainer}
                                    onPress={() => {
                                        if (bizSegment.includes(option.value)) {
                                            setBizSegment(bizSegment.filter((value) => value !== option.value))
                                        } else {
                                            setBizSegment([...bizSegment, option.value])
                                        }
                                    }}
                                    checked={bizSegment.includes(option.value)}
                                />
                            ))}
                        </View>

                        <View style={styles.distanceFilter}>
                            <CheckBox
                                center
                                title={t.labels.PBNA_MOBILE_FILTER_DISTANCE}
                                checkedIcon={CHECK_CIRCLE}
                                uncheckedIcon={UNCHECK_CIRCLE}
                                checked={milesFilterChecked}
                                containerStyle={styles.distanceCheckBoxContainer}
                                textStyle={styles.distanceCheckBoxText}
                                onPress={() => {
                                    setMilesFilterValue(1)
                                    setMilesFilterChecked((prevValue) => !prevValue)
                                }}
                            />
                            <View>
                                <View style={[commonStyle.flexRowSpaceBet, styles.marginBottom_20]}>
                                    {KAM_DISTANCE_FILTER_ARRAY.map((item) => {
                                        return (
                                            <CText
                                                style={[
                                                    styles.valueText,
                                                    showValueBoldText(item) ? styles.boldText : null
                                                ]}
                                                key={item}
                                            >
                                                {item}
                                            </CText>
                                        )
                                    })}
                                </View>
                                <Slider
                                    thumbTouchSize={styles.sliderTouchSize}
                                    thumbStyle={styles.defaultThumbStyle}
                                    containerStyle={styles.sliderContainer}
                                    thumbTintColor={
                                        milesFilterChecked ? baseStyle.color.tabBlue : baseStyle.color.borderGray
                                    }
                                    step={MILES_FILTER_STEP}
                                    trackMarks={KAM_DISTANCE_FILTER_ARRAY}
                                    maximumValue={MILES_FILTER_MAX}
                                    startFromZero={false}
                                    maximumTrackTintColor={baseStyle.color.bgGray}
                                    minimumTrackTintColor={
                                        milesFilterChecked ? baseStyle.color.tabBlue : baseStyle.color.borderGray
                                    }
                                    value={milesFilterValue === 1 ? MILES_FILTER_MIN : milesFilterValue}
                                    onValueChange={(value) => {
                                        setMilesFilterValue(value[0] || 1)
                                    }}
                                    disabled={!milesFilterChecked}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <FormBottomButton
                        onPressCancel={handlePressRest}
                        onPressSave={handlePressSave}
                        rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_APPLY}
                        leftButtonLabel={t.labels.PBNA_MOBILE_FILTER_RESET}
                        relative
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default KamMapOverviewFilterSort
