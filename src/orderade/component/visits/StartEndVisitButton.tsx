import React, { useState, useImperativeHandle, useEffect } from 'react'
import { TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { NavigationProp, useIsFocused } from '@react-navigation/native'

import CText from '../../../common/components/CText'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import { getProductQty } from '../../pages/MyDayScreen/MyVisitDetailViewModel'
import { VisitStatus } from '../../enum/VisitType'
import { CommonParam } from '../../../common/CommonParam'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { t } from '../../../common/i18n/t'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { formatWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import moment from 'moment'
import { subjectMap } from '../../utils/VisitUtils'
import EventService from '../../service/EventService'
import VisitService from '../../service/VisitService'
import { ReturnCartItem } from '../../interface/ReturnProduct'

const styles = StyleSheet.create({
    container: {
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center'
    },
    startVisit: {
        backgroundColor: '#6C0CC3'
    },
    endVisit: {
        backgroundColor: '#fff'
    },
    text: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12
    },
    startText: {
        color: '#fff'
    },
    endText: {
        color: '#6C0CC3'
    }
})

interface StartEndVisitButtonProps {
    navigation: NavigationProp<any>
    visit: MyDayVisitModel
    cartData: ReturnCartItem[]
    updateVisitStatus?: Function
    checkVisitStatus?: Function
    cRef?: any
}

export const StartEndVisitButton = (props: StartEndVisitButtonProps) => {
    const { cRef, cartData } = props
    const isStart = props.visit.Status === VisitStatus.IN_PROGRESS
    const [isInProgress, setIsInProgress] = useState(isStart)
    const [visitStatus, setVisitStatus] = useState(props.visit.Status)
    const [currentVisitUser, setCurrentVisitUser] = useState(props.visit.User)
    const [isLoading, setIsLoading] = useState(false)
    const { dropDownRef } = useDropDown()
    const isFocused = useIsFocused()
    const inGeoFence = props.visit.inGeoFence || props?.visit?.ASASCompliant

    /* fix bug 8669840: 
    Complete visit button is not shown for planned visits 
    when user places order and come back to sales actions page 
    cause: user__c field value of visit generated through batch is null */
    useEffect(() => {
        VisitService.retrieveVisitBySoupEntryId(props.visit._soupEntryId).then((visits) => {
            if (visits && visits.length > 0) {
                const currentVisit = visits[0]
                const isStart = currentVisit.Status__c === VisitStatus.IN_PROGRESS
                setIsInProgress(isStart)
                setVisitStatus(currentVisit.Status__c as string)
                setCurrentVisitUser(currentVisit.User__c as string)
            }
        })
    }, [isFocused])

    const displayText = () => {
        if (visitStatus === VisitStatus.PUBLISHED) {
            return t.labels.PBNA_MOBILE_START_VISIT
        } else if (visitStatus === VisitStatus.IN_PROGRESS) {
            return t.labels.PBNA_MOBILE_COMPLETE_VISIT
        }
        return ''
    }

    const onStartEndButtonClicked = async () => {
        if (isLoading) {
            return
        }
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
            return
        }
        // if there are products in cart when visit status is in progress
        const qty = getProductQty(cartData)
        if (isInProgress && qty > 0) {
            props.checkVisitStatus && props.checkVisitStatus()
            return
        }
        const logMsg = `User ${isInProgress ? 'ended' : 'started'} a visit: ${
            props.visit.VisitLegacyId || props.visit.OrderCartIdentifier
        } at ${formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)}`
        Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
        appendLog(Log.MOBILE_INFO, 'orderade:onStartEndButtonClicked', logMsg)
        // if there is a in progress event, it will not be able to start a visit
        const activeEvent = await EventService.getActiveEvent()
        if (activeEvent && !isInProgress) {
            const msg = `${t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_FIRST} ${subjectMap(activeEvent.Subject)} ${
                t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_FIRST2
            }`
            Alert.alert(t.labels.PBNA_MOBILE_ORDERED_COMPLETED_EVENT_TITLE, msg, [
                {
                    text: t.labels.PBNA_MOBILE_OK
                }
            ])
            return
        }
        setIsLoading(true)
        global.$globalModal.openModal()
        await VisitService.startOrEndMyVisit(props.visit, isInProgress, dropDownRef)
        // consider case when failed to update current local visit
        const visits = await VisitService.retrieveVisitBySoupEntryId(props.visit._soupEntryId)
        const currentVisit = visits && visits.length > 0 ? visits[0] : null
        if (!currentVisit) {
            return
        }
        // update to local
        if (!isInProgress) {
            setIsInProgress(currentVisit.Status__c === VisitStatus.IN_PROGRESS)
            currentVisit.Status__c === VisitStatus.IN_PROGRESS && setVisitStatus(VisitStatus.IN_PROGRESS)
        } else {
            props.navigation.goBack()
        }
        props.updateVisitStatus && props.updateVisitStatus()
        global.$globalModal.closeModal()
        setIsLoading(false)
    }

    useImperativeHandle(cRef, () => ({
        completeVisit: () => {
            onStartEndButtonClicked()
        }
    }))

    // if visit is in progress and current user is different with the value of visit's user__c
    // we will not display the start/end visit button
    if (props.visit.Status === VisitStatus.IN_PROGRESS && currentVisitUser && CommonParam.userId !== currentVisitUser) {
        return null
    }
    // if the visit is completed, then don't show the button
    if (props.visit.Status === VisitStatus.COMPLETE) {
        return null
    }

    return (
        <TouchableOpacity
            style={[styles.container, inGeoFence ? styles.startVisit : styles.endVisit]}
            onPress={onStartEndButtonClicked}
        >
            <CText style={[styles.text, inGeoFence ? styles.startText : styles.endText]}>{displayText()}</CText>
        </TouchableOpacity>
    )
}
