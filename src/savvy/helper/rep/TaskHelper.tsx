import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

const TASK_LABEL_MAPPING = {
    'Gather Tax Documents': 'Gather Tax Documents',
    'Complete RFP': 'Complete RFP',
    'Complete BAM': 'Complete BAM',
    'Contract/CDA Renewal': 'Contract/CDA Renewal',
    'Business Review': 'Business Review',
    'Resubmit Equipment Site Details': 'Resubmit Equipment Site Details',
    'Follow-up/Customer Issue': 'Follow-up/Customer Issue'
}

export const getTaskLabel = (v) => {
    return TASK_LABEL_MAPPING[v]
}

export const useSortOpenTaskList = (openTaskList, openCustomerTaskList) => {
    const [openList, setOpenList] = useState([])
    const timestampFormat = 'x'
    const sortData = (data) => {
        return _(data)
            .groupBy((item) => {
                return moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
            })
            .map((arr, key) => {
                const tmpArr = _.sortBy(arr, key)
                const groupedDataByDay = _(tmpArr)
                    .groupBy((item) => {
                        return moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
                    })
                    .map((element, k) => {
                        const sortedArr = _.sortBy(element, k)
                        return _.sortBy(sortedArr, (item) => {
                            return moment(item.ActivityDate).format(TIME_FORMAT.YMMDD)
                        })
                    })
                    .flatten()
                    .value()
                return _.sortBy(groupedDataByDay, 'Subject')
            })
            .flatten()
            .value()
    }
    useEffect(() => {
        const tempList = []
        const sortedCustomerScheduleCallList = _.sortBy(
            _.filter(openCustomerTaskList, (value) => {
                return value.Subject === 'Customer Logging Calls'
            }),
            (item) => {
                return moment(item?.ActivityDate).format(timestampFormat)
            }
        )
        const sortedCustomerTaskList = _.sortBy(
            _.filter(openCustomerTaskList, (value) => {
                return value.Subject === 'Customer Task'
            }),
            (item) => {
                return moment(item.ActivityDate).format(timestampFormat)
            }
        )
        const sortedLeadScheduleCallList = _.sortBy(
            _.filter(openTaskList, (value) => {
                return value.Subject === 'Lead Logging Calls'
            }),
            (item) => {
                return moment(item?.ActivityDate).format(timestampFormat)
            }
        )
        const sortedLeadTaskList = _.sortBy(
            _.filter(openTaskList, (value) => {
                return value.Subject === 'Lead Task'
            }),
            (item) => {
                return moment(item.ActivityDate).format(timestampFormat)
            }
        )
        const tempData = [
            ...sortedCustomerScheduleCallList,
            ...sortedCustomerTaskList,
            ...sortedLeadScheduleCallList,
            ...sortedLeadTaskList
        ]
        const allList = sortData(tempData)
        allList?.forEach((v) => {
            tempList.push(v)
        })
        setOpenList(tempList)
    }, [openTaskList, openCustomerTaskList])
    return openList
}
