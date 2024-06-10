/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-05 03:05:17
 * @LastEditTime: 2022-11-27 12:11:17
 * @LastEditors: Mary Qian
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'

import CText from '../../../../common/components/CText'

import UserAvatar from '../../common/UserAvatar'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import { SoupService } from '../../../service/SoupService'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { getStringValue } from '../../../utils/LandingUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 80
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15
    },
    name: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700'
    },
    detailContainer: {
        flexDirection: 'row',
        marginTop: 8
    },
    valText: {
        color: '#565656',
        fontSize: 12
    },
    lineText: {
        color: '#D3D3D3',
        fontSize: 12
    }
})

interface DelEmployeeHeaderProps {
    employeeId: string
    onDataLoaded?: Function
}

interface DelEmployeeDataProps {
    id: string
    userStatsId: string
    firstName: string
    lastName: string
    fullName: string
    flagVal: string
    ftpt: string
    title: string
}

export const getFTPT = (flagVal: string) => {
    const ftFlag = flagVal && flagVal.toLocaleLowerCase()
    let ftpt = ''
    if (ftFlag === 'true') {
        ftpt = 'FT'
    }
    if (ftFlag === 'false' || !ftFlag) {
        ftpt = 'PT'
    }
    return ftpt
}

const DelEmployeeHeader = (props: DelEmployeeHeaderProps) => {
    const { employeeId, onDataLoaded } = props

    const [employee, setEmployee] = useState<DelEmployeeDataProps>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { dropDownRef } = useDropDown()

    const fetchDataDone = () => {
        setIsLoading(false)
        onDataLoaded && onDataLoaded()
    }

    const getUserStatsOffline = async (userId: string) => {
        try {
            const result = await SoupService.retrieveDataFromSoup('User_Stats__c', {}, [], null, [
                ` WHERE {User_Stats__c:User__c} = '${userId}'`
            ])
            if (result?.length > 0) {
                return result[0].Id || ''
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getUserStatsOffline', `${getStringValue(error)}`)
        }

        return ''
    }

    const getUserOffline = async (userId: string) => {
        try {
            const result = await SoupService.retrieveDataFromSoup('User', {}, [], null, [
                ` WHERE {User:Id} = '${userId}'`
            ])
            if (result?.length > 0) {
                return result[0]
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'getUserOffline', `${getStringValue(error)}`)
        }

        return {}
    }

    const fetchEmployeeInfo = async (userId: string): Promise<DelEmployeeDataProps> => {
        setIsLoading(true)
        try {
            const userStatsId = await getUserStatsOffline(userId)
            const user = await getUserOffline(userId)

            fetchDataDone()
            return {
                id: user.Id,
                userStatsId,
                firstName: user.FirstName,
                lastName: user.LastName,
                fullName: user.Name || t.labels.PBNA_MOBILE_UNASSIGNED,
                flagVal: user.FT_EMPLYE_FLG_VAL__c,
                ftpt: user.Id ? getFTPT(user.FT_EMPLYE_FLG_VAL__c) : '',
                title: user.Title
            }
        } catch (error) {
            dropDownRef.current.alertWithType(DropDownType.ERROR, 'query employee info failed', error)
            fetchDataDone()
            return null
        }
    }

    const getUserInfo = async () => {
        const user = await fetchEmployeeInfo(employeeId)
        setEmployee(user)
    }

    useEffect(() => {
        getUserInfo()
    }, [])

    if (isLoading) {
        return <View style={styles.container} />
    }

    return (
        <View style={styles.container}>
            <UserAvatar
                isUnassigned={!employee?.id}
                userStatsId={employee?.userStatsId}
                firstName={employee?.firstName}
                lastName={employee?.lastName}
                avatarStyle={styles.avatarContainer}
                userNameText={{ fontSize: 20 }}
            />

            <View>
                <CText style={styles.name}>{employee?.fullName}</CText>
                <View style={styles.detailContainer}>
                    <CText style={styles.valText}>{employee?.ftpt}</CText>
                    <CText style={styles.lineText}> | </CText>
                    <CText style={styles.valText}>{employee?.title}</CText>
                </View>
            </View>
        </View>
    )
}

export default DelEmployeeHeader
