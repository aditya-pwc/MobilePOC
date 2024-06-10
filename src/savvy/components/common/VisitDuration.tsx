/*
 * @Description:VisitDuration
 * @Author: Mary Qian
 * @Date: 2021-08-11 02:20:25
 * @LastEditTime: 2022-05-04 03:39:33
 * @LastEditors: Yi Li
 */
import React, { useState, useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import 'moment-timezone'
import CText from '../../../common/components/CText'
import { SoupService } from '../../service/SoupService'
import { VisitStatus } from '../../enums/Visit'
import { calculateServiceTime } from '../../utils/MerchandiserUtils'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    ...commonStyle,
    clock: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 164,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 10
    },
    lightGrey: {
        color: '#D3D3D3',
        fontSize: 12,
        fontWeight: '700'
    },
    statusText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '400'
    },
    clockContent: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    clockImg: {
        marginLeft: 20,
        marginRight: 20,
        height: 22,
        width: 22
    },
    inprogress: {
        borderColor: 'rgb(45, 211, 111)',
        borderWidth: 1
    }
})

interface VisitForDurationProps {
    status: string
    OwnerId: string
    ActualVisitStartTime: string
    ActualVisitEndTime: string
}
interface VisitDurationProps {
    visit: VisitForDurationProps
}

const REFRESH_DURATION_INTERVAL = 60000

const VisitDuration = (props: VisitDurationProps) => {
    let serviceInterval
    let events = []

    const visit = props.visit
    const [serviceTime, setServiceTime] = useState('0 ' + t.labels.PBNA_MOBILE_HR + ' 0 ' + t.labels.PBNA_MOBILE_MIN)
    const [visitSta, setVisitStatus] = useState('')

    const getVisitStatus = () => {
        let status = t.labels.PBNA_MOBILE_NOT_STARTED
        switch (visit.status) {
            case VisitStatus.IN_PROGRESS:
                status = t.labels.PBNA_MOBILE_IN_PROGRESS
                break
            case VisitStatus.COMPLETE:
                status = t.labels.PBNA_MOBILE_COMPLETED
                break
            case VisitStatus.PUBLISH:
                status = t.labels.PBNA_MOBILE_NOT_STARTED
                break
            default:
                break
        }
        setVisitStatus(status)
    }

    const startService = () => {
        setServiceTime(calculateServiceTime(visit, events))
        serviceInterval = setInterval(() => {
            setServiceTime(calculateServiceTime(visit, events))
        }, REFRESH_DURATION_INTERVAL)
    }

    const endService = () => {
        clearInterval(serviceInterval)
    }

    useEffect(() => {
        getVisitStatus()
        let soql = 'SELECT {Event:Actual_Start_Time__c}, {Event:Actual_End_Time__c}, {Event:OwnerId} FROM {Event}'
        if (visit.status !== VisitStatus.IN_PROGRESS && visit.status !== VisitStatus.COMPLETE) {
            soql += ` WHERE {Event:Actual_End_Time__c} IS NULL AND {Event:Actual_Start_Time__c} IS NOT NULL AND {Event:OwnerId} = '${visit.OwnerId}'`
        } else {
            soql +=
                ` WHERE
            {Event:OwnerId} = '${visit.OwnerId}'
            AND
            (({Event:Actual_Start_Time__c} > '` +
                visit.ActualVisitStartTime +
                `'
                AND {Event:Actual_Start_Time__c} < '` +
                visit.ActualVisitEndTime +
                `')
            OR ({Event:Actual_Start_Time__c} > '` +
                visit.ActualVisitStartTime +
                `'
                AND '` +
                visit.ActualVisitEndTime +
                "' IS NULL)) "
        }
        soql += ' ORDER BY {Event:Actual_Start_Time__c}'
        SoupService.retrieveDataFromSoup('Event', {}, ['Actual_Start_Time__c', 'Actual_End_Time__c'], soql).then(
            (res: any) => {
                events = res
                if (visit.status === VisitStatus.IN_PROGRESS) {
                    startService()
                }
                if (visit.status === VisitStatus.COMPLETE) {
                    setServiceTime(calculateServiceTime(visit, events, new Date(visit.ActualVisitEndTime)))
                }
            }
        )
        return () => {
            clearInterval(serviceInterval)
        }
    }, [props])

    useEffect(() => {
        return () => {
            endService()
        }
    }, [])

    return (
        <View style={[styles.clock, visitSta === VisitStatus.IN_PROGRESS && styles.inprogress]}>
            <Image style={styles.clockImg} source={require('../../../../assets/image/ios-clock.png')} />
            <View style={[styles.clockContent]}>
                <CText style={[styles.lightGrey, visitSta !== VisitStatus.NOT_STARTED && styles.colorBlack]}>
                    {serviceTime}
                </CText>
                <CText style={styles.statusText}>{visitSta}</CText>
            </View>
        </View>
    )
}

export default VisitDuration
