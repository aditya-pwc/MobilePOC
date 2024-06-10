/**
 * @description The tile to show future tasks & calls.
 * @author Kiren Cao
 * @date 2022-08-17
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { renderActivityTile } from '../../../../helper/rep/CustomerHelper'
import { Task } from '../../../../interface/LeadModel'
import _ from 'lodash'
import moment from 'moment'
import LogCallForm from '../../lead/LogCallForm'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useGlobalModal } from '../../../../contexts/GlobalModalContext'

interface ActivityTileProps {
    futureOpenTaskList: Array<Task>
    navigation: any
    onClick: any
    dropDownRef: any
    setRefreshFlag: any
    l: any
    onAddContact: any
}

export const FutureTaskCallsTile: FC<ActivityTileProps> = (props: ActivityTileProps) => {
    const { futureOpenTaskList, navigation, onClick, dropDownRef, setRefreshFlag, l, onAddContact } = props
    const { globalModalRef } = useGlobalModal()
    const [futureTaskList, setFutureTaskList] = useState<Array<any>>([])
    const [editCall, setEditCall] = useState('')
    const logCallFormRef = useRef(null)
    const timestampFormat = 'x'
    const sortData = (data: Array<any>) => {
        return _.orderBy(
            data,
            (item) => {
                return moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
            },
            ['desc']
        )
    }
    useEffect(() => {
        const sortedCustomerScheduleCallList = _.sortBy(
            _.filter(futureOpenTaskList, (value) => {
                return (
                    value.Subject === 'Customer Logging Calls' &&
                    value.ActivityDate >= moment().add(+14, 'd').format(TIME_FORMAT.Y_MM_DD)
                )
            }),
            (item) => {
                return moment(item?.ActivityDate).format(timestampFormat)
            }
        )
        const sortedCustomerTaskList = _.sortBy(
            _.filter(futureOpenTaskList, (value) => {
                return (
                    value.Subject === 'Customer Task' &&
                    value.ActivityDate >= moment().add(+14, 'd').format(TIME_FORMAT.Y_MM_DD)
                )
            }),
            [
                (item) => {
                    return moment(item?.ActivityDate).format(timestampFormat)
                },
                (item) => {
                    return moment(item?.CreatedDate).format(timestampFormat)
                }
            ]
        )
        const tempData = [...sortedCustomerScheduleCallList, ...sortedCustomerTaskList]
        const allList = sortData(tempData)
        setFutureTaskList(allList)
    }, [futureOpenTaskList])

    return (
        <View>
            {renderActivityTile(
                'futureTaskList',
                futureTaskList,
                navigation,
                globalModalRef,
                onClick,
                dropDownRef,
                setRefreshFlag,
                l,
                setEditCall,
                logCallFormRef
            )}
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
