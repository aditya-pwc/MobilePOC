/**
 * @description The tile to show activity history.
 * @author Kiren Cao
 * @date 2021-11-20
 */
import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { TypeSelector, ActivitySelectorEnum } from './TypeSelector'
import _ from 'lodash'
import moment from 'moment'
import { renderActivityTile } from '../../../../helper/rep/CustomerHelper'
import { RecordTypeEnum } from '../../../../enums/RecordType'
import { Visit } from '../../../../interface/VisitInterface'
import { Task } from '../../../../interface/LeadModel'
import { useSelector } from 'react-redux'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useGlobalModal } from '../../../../contexts/GlobalModalContext'

interface ActivityTileProps {
    preSellDetailList: Array<Visit>
    merDetailList: Array<Visit>
    deliveryDetailList: Array<Visit>
    historyTaskList: Array<Task>
    navigation: any
    onClick: any
    dropDownRef: any
    setRefreshFlag: any
}
interface VisitProp {
    PlannedVisitStartTime: Date
    ActualVisitStartTime: Date
    LastModifiedDate: Date
    finalDisplayTime: Date
    EffectiveDate: Date
}

export const CustomerActivityTile: FC<ActivityTileProps> = (props: ActivityTileProps) => {
    const {
        preSellDetailList,
        merDetailList,
        deliveryDetailList,
        historyTaskList,
        navigation,
        onClick,
        dropDownRef,
        setRefreshFlag
    } = props
    const { globalModalRef } = useGlobalModal()
    const [selectedType, setSelectedType] = useState<ActivitySelectorEnum>(ActivitySelectorEnum.ALL)
    const [historyList, setHistoryList] = useState<Array<any>>([])
    const pepsiDirectList = useSelector((state: any) => state.customerReducer.customerActivityReducer.pepsiDirectDate)
    const checkTime = (value: VisitProp) => {
        const finalDisplayTime = value.ActualVisitStartTime || value.PlannedVisitStartTime
        value.finalDisplayTime = finalDisplayTime
        return (
            moment(finalDisplayTime).isBefore(moment(), 'day') &&
            moment(finalDisplayTime).isSameOrAfter(moment().subtract(7, 'days'), 'day')
        )
    }
    const sortData = (list: VisitProp[]) => {
        return _.orderBy(
            list,
            (item) => {
                return moment(item.finalDisplayTime || item.LastModifiedDate || item.EffectiveDate).format(
                    TIME_FORMAT.YMMDD
                )
            },
            ['desc']
        )
    }
    useEffect(() => {
        let tempList: Array<any> = []
        if (selectedType === ActivitySelectorEnum.ALL) {
            const tempData = [
                ...merDetailList,
                ...preSellDetailList,
                ...deliveryDetailList,
                ...historyTaskList,
                ...pepsiDirectList
            ]
            tempData?.forEach((v) => {
                if (v?.attributes?.type !== RecordTypeEnum.TASK && v?.attributes?.type !== RecordTypeEnum.ORDER) {
                    if (checkTime(v)) {
                        tempList.push(v)
                    }
                } else {
                    tempList.push(v)
                }
            })
        } else if (selectedType === ActivitySelectorEnum.VISITS) {
            const tempData = [...merDetailList, ...preSellDetailList]
            tempData?.forEach((v: any) => {
                if (checkTime(v)) {
                    tempList.push(v)
                }
            })
        } else if (selectedType === ActivitySelectorEnum.DELIVERIES) {
            deliveryDetailList?.forEach((v: any) => {
                if (checkTime(v)) {
                    tempList.push(v)
                }
            })
        } else if (selectedType === ActivitySelectorEnum.OTHERS) {
            tempList = _.cloneDeep(historyTaskList)
        } else if (selectedType === ActivitySelectorEnum.ORDERS) {
            tempList = _.cloneDeep(pepsiDirectList)
        }
        const sortedList = sortData(tempList)
        setHistoryList(sortedList)
    }, [merDetailList, preSellDetailList, deliveryDetailList, selectedType, historyTaskList, pepsiDirectList])

    return (
        <View style={{ marginBottom: 15 }}>
            <View>
                <TypeSelector type={selectedType} setType={setSelectedType} />
            </View>
            {renderActivityTile(
                'historyList',
                historyList,
                navigation,
                globalModalRef,
                onClick,
                dropDownRef,
                setRefreshFlag
            )}
        </View>
    )
}
