/**
 * @description The component to show common task tile.
 * @author Kiren Cao
 * @date 2021-11-20
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import _ from 'lodash'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { renderActivityTile } from '../../../../helper/rep/CustomerHelper'
import { t } from '../../../../../common/i18n/t'
import { Visit } from '../../../../interface/VisitInterface'
import { Task } from '../../../../interface/LeadModel'
import LogCallForm from '../../lead/LogCallForm'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useGlobalModal } from '../../../../contexts/GlobalModalContext'

interface UpcomingTileProps {
    deliveryDetailList: Array<Visit>
    navigation: any
    preSellDetailList: Array<Visit>
    merDetailList: Array<Visit>
    openTaskList: Array<Task>
    onClick: any
    dropDownRef: any
    setRefreshFlag: any
    l: any
    onAddContact: any
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    imageSectionContainer: {
        paddingBottom: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    scheduleWhiteStyle: {
        borderRadius: 4,
        marginRight: 15,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    visitBackGround: {
        alignItems: 'center',
        backgroundColor: '#4656DF',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        width: 40
    },
    tileContainer: {
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 10
    },
    visitTextStyle: {
        marginTop: 40,
        marginBottom: 5,
        marginLeft: 20,
        fontSize: 12
    }
})

const ADD_DATE = 14
const initDayList = () => {
    const dayList = []
    for (let i = 0; i < ADD_DATE; i++) {
        dayList.push({
            strDate: moment().add(i, 'days').format(TIME_FORMAT.MD),
            strDay: moment().add(i, 'days').format(TIME_FORMAT.DDD).toUpperCase(),
            date: moment().add(i, 'days').format(TIME_FORMAT.Y_MM_DD),
            deliveryList: [],
            visitList: []
        })
    }
    return dayList
}

const UpcomingTile: FC<UpcomingTileProps> = (props: UpcomingTileProps) => {
    const {
        preSellDetailList,
        merDetailList,
        deliveryDetailList,
        openTaskList,
        navigation,
        onClick,
        dropDownRef,
        setRefreshFlag,
        l,
        onAddContact
    } = props
    const { globalModalRef } = useGlobalModal()
    const [selectedDate, setSelectedDate] = useState(0)
    const [editCall, setEditCall] = useState('')
    const [lstDay, setLstDay] = useState(initDayList())
    const logCallFormRef = useRef(null)
    useEffect(() => {
        const tempList = _.cloneDeep(lstDay)
        tempList.forEach((v) => {
            v.deliveryList = _.orderBy(
                _.filter(deliveryDetailList, (value) => {
                    return moment(value.PlannedVisitStartTime).format(TIME_FORMAT.Y_MM_DD) === v.date
                }),
                ['PlannedVisitStartTime'],
                ['asc']
            )
            v.preSellDetailList = _.orderBy(
                _.filter(preSellDetailList, (value) => {
                    return moment(value.PlannedVisitStartTime).format(TIME_FORMAT.Y_MM_DD) === v.date
                }),
                ['PlannedVisitStartTime'],
                ['asc']
            )
            v.merDetailList = _.orderBy(
                _.filter(merDetailList, (value) => {
                    return moment(value.PlannedVisitStartTime).format(TIME_FORMAT.Y_MM_DD) === v.date
                }),
                ['Pull_Number__c'],
                ['asc']
            )
            v.openTaskList = _.orderBy(
                _.filter(openTaskList, (value) => {
                    if (v.date === moment().format(TIME_FORMAT.Y_MM_DD)) {
                        return moment(value.ActivityDate).format(TIME_FORMAT.Y_MM_DD) <= v.date
                    }
                    return moment(value.ActivityDate).format(TIME_FORMAT.Y_MM_DD) === v.date
                }),
                ['CreatedDate'],
                ['asc']
            )
        })
        setLstDay(tempList)
    }, [deliveryDetailList, preSellDetailList, merDetailList, openTaskList])

    const renderWeekDaySelectorItem = (v, k) => {
        const disabled =
            v.deliveryList?.length === 0 &&
            v.preSellDetailList?.length === 0 &&
            v.merDetailList?.length === 0 &&
            v.openTaskList?.length === 0
        const selected = k === selectedDate
        let textColor = ''
        if (selected) {
            textColor = baseStyle.color.white
        } else if (disabled) {
            textColor = baseStyle.color.borderGray
        }
        return (
            <TouchableOpacity
                style={[styles.scheduleWhiteStyle, selected && { backgroundColor: baseStyle.color.tabBlue }]}
                key={k}
                onPress={() => {
                    setSelectedDate(k)
                }}
                disabled={disabled}
            >
                <CText style={{ fontWeight: baseStyle.fontWeight.fw_700, color: textColor || baseStyle.color.tabBlue }}>
                    {k === 0 ? t.labels.PBNA_MOBILE_TODAY.toUpperCase() : v.strDay}
                </CText>
                <CText
                    style={{
                        marginTop: 15,
                        fontWeight: baseStyle.fontWeight.fw_700,
                        color: textColor || baseStyle.color.black
                    }}
                >
                    {v.strDate}
                </CText>
            </TouchableOpacity>
        )
    }

    return (
        <View>
            <ScrollView
                style={styles.tileContainer}
                contentContainerStyle={[styles.imageSectionContainer]}
                horizontal
                centerContent
                showsHorizontalScrollIndicator={false}
            >
                {_.map(lstDay, renderWeekDaySelectorItem)}
            </ScrollView>
            <CText style={styles.visitTextStyle}>
                {lstDay[selectedDate].preSellDetailList?.length + lstDay[selectedDate].merDetailList?.length}{' '}
                {t.labels.PBNA_MOBILE_VISIT} | {lstDay[selectedDate].deliveryList?.length}{' '}
                {_.capitalize(t.labels.PBNA_MOBILE_DELIVERY)}
            </CText>
            <View>
                {renderActivityTile(
                    'UpcomingList',
                    _.compact(
                        _.concat(
                            lstDay[selectedDate].merDetailList,
                            lstDay[selectedDate].deliveryList,
                            lstDay[selectedDate].preSellDetailList,
                            lstDay[selectedDate].openTaskList
                        )
                    ),
                    navigation,
                    globalModalRef,
                    onClick,
                    dropDownRef,
                    setRefreshFlag,
                    l,
                    setEditCall,
                    logCallFormRef
                )}
            </View>
            <LogCallForm
                onAddContact={onAddContact}
                cRef={logCallFormRef}
                onSave={setRefreshFlag}
                type={'RetailStore'}
                customer={l}
                isEdit
                editCall={editCall}
            />
        </View>
    )
}

export default UpcomingTile
