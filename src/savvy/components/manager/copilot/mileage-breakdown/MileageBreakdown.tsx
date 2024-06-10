/*
 * @Author: Yuan Yue
 * @Date: 2021-10-13 17:52:48
 * @LastEditTime: 2021-10-28 13:48:47
 * @LastEditors:Yuan Yue
 * @Description: MileageBreakdown in Copilot in Home Page in  MM
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/MileageBreakdown.tsx
 */

import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import Orientation from 'react-native-orientation-locker'
import { RootStackNavigation } from '../../../../app'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CopilotNavHeader from '../CopilotNavHeader'
import PerformanceCard from './PerformanceCard'
import PickerModal from '../../common/PickerModal'
import MEmployeesList from './MEmployeesList'
import { t } from '../../../../../common/i18n/t'
import MonthWeekFilter from '../../../common/MonthWeekFilter'
import moment from 'moment'
import Loading from '../../../../../common/components/Loading'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

interface IProps {
    props?: any
    navigation: RootStackNavigation
    route?: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    header: {
        height: 115,
        backgroundColor: baseStyle.color.LightBlue,
        paddingTop: 62
        // flexDirection: 'row'
    },
    btnBack: {
        position: 'absolute',
        top: 59,
        left: 22
    },
    imgBack: {
        color: '#fff'
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white,
        alignSelf: 'center'
    }
})

const MileageBreakdown = (props: IProps) => {
    const { navigation, route } = props
    const from = route.params?.from || ''
    const popupTitle = route.params?.weekTitle
    const performanceView: any = useRef()
    const [weekTitle, setWeekTitle] = useState(popupTitle || t.labels.PBNA_MOBILE_WEEK_TO_DATE)
    const [weekVisible, setWeekVisible] = useState(false)
    const monthWeekFilter = useRef(null)
    const [selDay, setSelDay] = useState(moment().format(TIME_FORMAT.Y_MM_DD))
    const myPerformance =
        from && from !== 'hours'
            ? [
                  t.labels.PBNA_MOBILE_WEEK_TO_DATE,
                  t.labels.PBNA_MOBILE_PERIOD_TO_DATE,
                  t.labels.PBNA_MOBILE_LAST_CLOSED_WEEK,
                  t.labels.PBNA_MOBILE_LAST_CLOSED_PERIOD
              ]
            : [t.labels.PBNA_MOBILE_LAST_CLOSED_WEEK, t.labels.PBNA_MOBILE_WEEK_TO_DATE]
    const [isLoading, setIsloading] = useState(false)
    const title = (flag) => {
        let moduleTitle = ''
        switch (flag) {
            case 'adas': {
                moduleTitle = t.labels.PBNA_MOBILE_COPILOT_ADAS_ONLY
                break
            }
            case 'manifest': {
                moduleTitle = t.labels.PBNA_MOBILE_COPILOT_MANIFEST_COMPLIANCE_ONLY
                break
            }
            case 'hours': {
                moduleTitle = t.labels.PBNA_MOBILE_HOURS.toLocaleUpperCase()
                break
            }
            default: {
                moduleTitle = t.labels.PBNA_MOBILE_COPILOT_MILEAGE.toLocaleUpperCase()
                break
            }
        }
        return moduleTitle
    }

    useEffect(() => {
        Orientation.lockToPortrait()
    }, [])

    const showWeekModal = () => {
        setWeekVisible(true)
    }
    const onClickPickModal = (contentStr) => {
        setWeekTitle(contentStr)
    }
    const onClickToHideWeekModal = (contentStr) => {
        setWeekTitle(contentStr)
        setWeekVisible(false)
        performanceView.current.onChangeSelectPerformance(contentStr)
    }
    const onChangeDate = async (date) => {
        if (date._i === t.labels.PBNA_MOBILE_COPILOT_WTD_TOTAL) {
            setSelDay(t.labels.PBNA_MOBILE_WEEK_TO_DATE)
        } else {
            const date1 = date.format(TIME_FORMAT.Y_MM_DD)
            setSelDay(date1)
        }
    }
    return (
        <View style={styles.container}>
            <CopilotNavHeader navigation={navigation} title={title(from)} />
            <PerformanceCard
                navigation={navigation}
                cRef={performanceView}
                weekTitle={weekTitle}
                onPress={() => {
                    showWeekModal()
                }}
                from={from}
            />
            {!!from && (
                <MonthWeekFilter
                    cRef={monthWeekFilter}
                    isShowWeek
                    fromADAS
                    onchangeDate={(date) => onChangeDate(date)}
                />
            )}
            <MEmployeesList weekTitle={weekTitle} from={from} selDay={selDay} setIsloading={setIsloading} />
            <PickerModal
                DEFAULT_LABEL=""
                onOutsideClick={onClickToHideWeekModal}
                onDoneClick={onClickToHideWeekModal}
                modalVisible={weekVisible}
                optionsList={myPerformance}
                modalTitle={t.labels.PBNA_MOBILE_TIME_INTERVAL_CAPITALIZE}
                selectedVal={weekTitle}
                defaultVal={t.labels.PBNA_MOBILE_WEEK_TO_DATE}
                updateSelectedVal={onClickPickModal}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default MileageBreakdown
