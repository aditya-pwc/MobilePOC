/**
 * @description A modal to generate schedule.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-31
 */

import React, { useRef, useImperativeHandle, useEffect, useState } from 'react'
import { View, Image, TouchableOpacity, Alert } from 'react-native'
import CText from '../../../../common/components/CText'
import { Divider } from 'react-native-elements'
import { Modalize } from 'react-native-modalize'
import { useDispatch, useSelector } from 'react-redux'
import { CommonParam } from '../../../../common/CommonParam'
import { restDataCommonCall, buildSyncDownObjPromise } from '../../../api/SyncUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { DEFAULT_DELAY_TIME, getQuerySeq, syncDownDataByTableNames } from '../../../utils/MerchManagerUtils'
import NewScheduleModalStyle from '../../../styles/manager/NewScheduleModalStyle'
import { compose } from '@reduxjs/toolkit'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import StatusCode from '../../../enums/StatusCode'
import { VisitListStatus } from '../../../enums/VisitList'
import { promiseQueue } from '../../../api/InitSyncUtils'
import { visitGeneration } from '../../../api/ApexApis'
import { DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { formatScheduleDateWithSlash, queryCancelingScheduleVisitGroup } from '../helper/VisitHelper'
import { Log } from '../../../../common/enums/Log'
import { getStringValue } from '../../../utils/LandingUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = NewScheduleModalStyle
const IMG_GEN_SCHEDULE = ImageSrc.IMG_GEN_SCHEDULE

const managerReducer = (state) => state.manager
interface NewScheduleModalProps {
    cRef?: any
    navigation?: any
    startDate?: string
    setIsGenerating?: any
    restartInterval?: boolean
    setIsRestartInterval?: any
    setDisableCancelBtn?: any
    reviewSchedule?: Function
    isLoading?: boolean
    setIsLoading?: Function
    isGenerating?: boolean
}

const compositeQuery = (visitListId) => {
    return JSON.parse(JSON.stringify(getQuerySeq())).map((item) => {
        if (item.name === 'Visit') {
            if (!item.q.includes('WHERE')) {
                item.q += visitListId ? " WHERE Schedule_Visit_Group__c = '" + visitListId + "'" : ''
            } else {
                item.q += visitListId ? " AND Schedule_Visit_Group__c = '" + visitListId + "'" : ''
            }
        }
        return item
    })
}

const cancelledSuccessfullyCallback = async (isCancel: boolean, setIsCanceling, dropDownRef) => {
    if (isCancel) {
        dropDownRef.current.alertWithType(
            DropDownType.SUCCESS,
            t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_CANCELLED_SUCCESSFULLY,
            ''
        )
        await syncDownDataByTableNames()
    }
    setIsCanceling(false)
}

const MAX_POLLING_NUM = 100
const syncDownWithLogic = async (params) => {
    const { isCancel, setIsCanceling, visitListId, dropDownRef, isLoading, setIsLoading } = params
    setIsCanceling(true)
    if (isCancel) {
        let pollingCount = 0
        const existedIntervalIds: Array<string> = []
        const intId = setInterval(() => {
            restDataCommonCall(`query/?q=SELECT Status__c FROM Visit_List__c WHERE Id='${visitListId}'`, 'GET').then(
                async (res) => {
                    try {
                        if (!isLoading) {
                            setIsLoading && setIsLoading(true)
                        }
                        pollingCount++
                        // if canceling more than 3 mins, stop the polling
                        const isCanceling = await queryCancelingScheduleVisitGroup(visitListId)
                        if (isCanceling && pollingCount > MAX_POLLING_NUM) {
                            clearInterval(intId)
                            await syncDownDataByTableNames()
                            setIsLoading && setIsLoading(false)
                            setIsCanceling(false)
                            return
                        }
                        if (
                            res.data.records[0].Status__c === VisitListStatus.CANCELLED ||
                            res.data.records[0].Status__c === VisitListStatus.ACCEPTED ||
                            res.data.records[0].Status__c === VisitListStatus.FAILED
                        ) {
                            clearInterval(intId)
                            if (!existedIntervalIds.includes(intId.toString())) {
                                existedIntervalIds.push(intId.toString())
                                await cancelledSuccessfullyCallback(isCancel, setIsCanceling, dropDownRef)
                                setIsLoading && setIsLoading(false)
                                setIsCanceling(false)
                            }
                        }
                    } catch (err) {
                        setIsLoading && setIsLoading(false)
                        setIsCanceling(false)
                        clearInterval(intId)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_QUERY_VISIT_LIST_FAILED,
                            err
                        )
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MM-SyncDownSchedule',
                            `Failed to sync down schedule: ${getStringValue(err)}`
                        )
                    }
                }
            )
        }, DEFAULT_DELAY_TIME)
    } else {
        await cancelledSuccessfullyCallback(false, setIsCanceling, dropDownRef)
        setIsLoading && setIsLoading(false)
    }
}

const generateSchedule = (params) => {
    const {
        startDate,
        setIsGenerating,
        setVisitListId,
        setIsStartInterval,
        setIsCanceling,
        visitListId,
        dropDownRef,
        modalizeRef
    } = params
    const userLocationId = CommonParam.userLocationId
    const body = { locationId: userLocationId, startDate: startDate }
    setIsGenerating(true)
    Instrumentation.startTimer('Merch Manager generate schedule')
    visitGeneration(body)
        .then((res) => {
            try {
                if (res.status === StatusCode.SuccessCreated) {
                    if (res.data) {
                        setVisitListId(res.data)
                        setIsStartInterval(true)
                    }
                } else {
                    Alert.alert(JSON.stringify(res.data)?.replace(/"/g, ''))
                    setIsGenerating(false)
                    if (res.data === 'Schedule Visit List Exists') {
                        syncDownWithLogic({ isCancel: false, setIsCanceling, visitListId, dropDownRef })
                    }
                }
            } catch (err) {
                setIsGenerating(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_FAILED_TO_GENERATE_SCHEDULE,
                    err
                )
            }
        })
        .catch((err) => {
            const errorMessage = err && JSON.parse(JSON.stringify(err))
            if (
                errorMessage.error &&
                errorMessage.error.data &&
                errorMessage.error.data === 'Schedule Visit List Exists'
            ) {
                Alert.alert(errorMessage.error.data.replace(/"/g, ''))
                syncDownWithLogic({ isCancel: false, setIsCanceling, visitListId, dropDownRef })
            } else {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_FAILED_TO_GENERATE_SCHEDULE,
                    err
                )
            }
            setIsGenerating(false)
            storeClassLog(
                Log.MOBILE_ERROR,
                'MM-GenerateSchedule',
                `Failed to generate schedule: ${getStringValue(err)}`
            )
        })
    modalizeRef.current?.close()
}

const syncDownCallback = async (params) => {
    const {
        visitListId,
        getRNSEmployeeList,
        dropDownRef,
        getRNSCustomerList,
        setIsCompleted,
        setIsGenerating,
        setIsStartInterval,
        setIsIntervalRunning,
        setDisableCancelBtn
    } = params
    await getRNSEmployeeList({
        visitListId,
        dropDownRef
    })
    await getRNSCustomerList({
        visitListId,
        dropDownRef
    })
    Instrumentation.stopTimer('Merch Manager generate schedule')
    setIsCompleted(true)
    setIsGenerating(false)
    setIsStartInterval(false)
    setIsIntervalRunning(false)
    setDisableCancelBtn(false)
}

const pollingSchedule = (params) => {
    const {
        visitListId,
        intId,
        setIntervalId,
        setDisableCancelBtn,
        setIsCanceled,
        querySeq,
        getRNSEmployeeList,
        dropDownRef,
        getRNSCustomerList,
        setIsCompleted,
        setIsGenerating,
        setIsStartInterval,
        setIsIntervalRunning,
        isCanceled
    } = params
    const intervalId = setInterval(() => {
        if (!visitListId) {
            return
        }
        if (intId) {
            clearInterval(intId)
            setIntervalId(null)
        }
        restDataCommonCall(`query/?q=SELECT Status__c FROM Visit_List__c WHERE Id='${visitListId}'`, 'GET')
            .then((res) => {
                try {
                    if (res.data.records[0].Status__c === VisitListStatus.COMPLETED) {
                        clearInterval(intervalId)
                        setDisableCancelBtn(true)
                        setIsCanceled(false)
                        const requests = querySeq.map((m) => {
                            return buildSyncDownObjPromise(m.name, m.q)
                        })
                        return new Promise((resolve, reject) => {
                            promiseQueue(requests)
                                .then(async (results) => {
                                    await syncDownCallback({
                                        visitListId,
                                        getRNSEmployeeList,
                                        dropDownRef,
                                        getRNSCustomerList,
                                        setIsCompleted,
                                        setIsGenerating,
                                        setIsStartInterval,
                                        setIsIntervalRunning,
                                        setDisableCancelBtn
                                    })
                                    return resolve(results)
                                })
                                .catch((err) => {
                                    dropDownRef.current.alertWithType(
                                        DropDownType.ERROR,
                                        t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_SYNC_DOWN_FAILED,
                                        err
                                    )
                                    return reject(err)
                                })
                        })
                    } else if (
                        isCanceled ||
                        res.data.records[0].Status__c === VisitListStatus.ACCEPTED ||
                        res.data.records[0].Status__c === VisitListStatus.FAILED ||
                        res.data.records[0].Status__c === VisitListStatus.CANCELLED
                    ) {
                        setIsGenerating(false)
                        clearInterval(intervalId)
                        setIsIntervalRunning(false)
                        setIsStartInterval(false)
                        if (res.data.records[0].Status__c === VisitListStatus.FAILED) {
                            Alert.alert(t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_WRONG)
                        }
                    }
                } catch (e) {
                    setIsGenerating(false)
                    clearInterval(intervalId)
                    dropDownRef.current.alertWithType(
                        DropDownType.ERROR,
                        t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_QUERY_VISIT_LIST_FAILED,
                        e
                    )
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MM-pollingSchedule',
                        `Failed to handle polling schedule: ${getStringValue(e)}`
                    )
                }
            })
            .catch((err) => {
                setIsGenerating(false)
                clearInterval(intervalId)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_NEW_SCHEDULE_MODAL_QUERY_VISIT_LIST_FAILED,
                    err
                )
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MM-pollingSchedule',
                    `Failed to polling schedule: ${getStringValue(err)}`
                )
            })
    }, 5000)
    return intervalId
}

const NewScheduleModal = (props: NewScheduleModalProps) => {
    const {
        cRef,
        navigation,
        startDate,
        setIsGenerating,
        restartInterval,
        setIsRestartInterval,
        setDisableCancelBtn,
        isLoading,
        setIsLoading,
        isGenerating
    } = props
    const modalizeRef = useRef<Modalize>(null)
    const manager = useSelector(managerReducer)
    const scheduleDate = manager.scheduleDate
    const visitListId = manager.visitListId
    const isCancelBtnClicked = manager.isCancelBtnClicked
    const isCanceled = manager.isCanceled
    const isCompleted = manager.isCompleted
    const [intId, setIntervalId] = useState(null)
    const [isIntervalRunning, setIsIntervalRunning] = useState(false)
    const [isStartInterval, setIsStartInterval] = useState(false)
    const { dropDownRef } = useDropDown()
    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        modalizeRef.current?.open()
    }

    const dispatch = useDispatch()
    const setIsCanceling = compose(dispatch, managerAction.setIsCanceling)
    const setIsCanceled = compose(dispatch, managerAction.setIsCanceled)
    const setIsCompleted = compose(dispatch, managerAction.setIsCompleted)
    const setVisitListId = compose(dispatch, managerAction.setVisitListId)
    const getRNSEmployeeList = compose(dispatch, managerAction.getRNSEmployeeList)
    const getRNSCustomerList = compose(dispatch, managerAction.getRNSCustomerList)
    const setCompletedSVGList = compose(dispatch, managerAction.setCompletedSVGList)

    const querySeq = compositeQuery(visitListId)

    useImperativeHandle(cRef, () => ({
        openModal: () => {
            openModal()
        }
    }))

    useEffect(() => {
        if (isCanceled) {
            clearInterval(intId)
            setIsStartInterval(false)
            setIsIntervalRunning(false)
            syncDownWithLogic({
                isCancel: true,
                setIsCanceling,
                visitListId,
                dropDownRef,
                isLoading,
                setIsLoading
            })
            setIsCanceled(false)
            setCompletedSVGList([])
        }
        if ((!isIntervalRunning && isStartInterval) || restartInterval) {
            setIsStartInterval(false)
            setIsIntervalRunning(true)
            setIsRestartInterval(false)
            if (isCompleted) {
                return
            }
            const intervalId = pollingSchedule({
                visitListId,
                intId,
                setIntervalId,
                setDisableCancelBtn,
                setIsCanceled,
                querySeq,
                getRNSEmployeeList,
                dropDownRef,
                getRNSCustomerList,
                setIsCompleted,
                setIsGenerating,
                setIsStartInterval,
                setIsIntervalRunning,
                isCanceled
            })
            setIntervalId(intervalId)
        }
        if (isCancelBtnClicked && isIntervalRunning) {
            clearInterval(intId)
            setIsIntervalRunning(false)
            setIsStartInterval(false)
            setIntervalId('')
        }
    }, [props, isCanceled, isStartInterval, isIntervalRunning, restartInterval, isCancelBtnClicked, isCompleted])

    return (
        <Modalize
            ref={modalizeRef}
            adjustToContentHeight
            handleStyle={styles.handleStyle}
            onClose={() => {
                navigation.setOptions({ tabBarVisible: true })
            }}
            modalStyle={styles.modalStyle}
        >
            <View style={styles.contentStyle}>
                <View style={styles.alignCenter}>
                    <View style={styles.titleView}>
                        <CText style={styles.titleText}>{t.labels.PBNA_MOBILE_NEW_SCHEDULE} </CText>
                    </View>
                    <View style={styles.dividerView}>
                        <Divider style={styles.divider} />
                    </View>
                    <Image source={IMG_GEN_SCHEDULE} style={styles.imgGS} />
                    <View style={styles.alignCenter}>
                        <CText style={styles.gText}>{t.labels.PBNA_MOBILE_GENERATE_SCHEDULE_FOR}</CText>
                        <CText style={styles.gText}>{formatScheduleDateWithSlash(scheduleDate)}</CText>
                    </View>
                </View>
                <TouchableOpacity
                    disabled={isGenerating}
                    onPress={() => {
                        generateSchedule({
                            startDate,
                            setIsGenerating,
                            setVisitListId,
                            setIsStartInterval,
                            setIsCanceling,
                            visitListId,
                            querySeq,
                            dropDownRef,
                            modalizeRef
                        })
                    }}
                    style={styles.gBtn}
                >
                    <CText style={styles.gBtnText}>{t.labels.PBNA_MOBILE_GENERATE_SCHEDULE}</CText>
                </TouchableOpacity>
            </View>
        </Modalize>
    )
}

export default NewScheduleModal
