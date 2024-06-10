/**
 * @description Favorite employee related functions.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-08-06
 */

import React from 'react'
import { StyleSheet, TouchableHighlight, View, Image } from 'react-native'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import StarIcon from '../../../../../assets/image/icon_leads.svg'

import { SoupService } from '../../../service/SoupService'
import {
    getObjByName,
    restDataCommonCall,
    syncUpObjCreateFromMem,
    syncUpObjUpdateFromMem
} from '../../../api/SyncUtils'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { filterExistFields } from '../../../utils/SyncUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

const styles = StyleSheet.create({
    backTextWhite: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_12,
        textAlign: 'center'
    },
    rowFavorite: {
        alignItems: 'center',
        backgroundColor: baseStyle.color.yellow,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        minHeight: 70,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.white
    },
    favoriteRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 90,
        minHeight: 68,
        backgroundColor: baseStyle.color.yellow,
        right: 0
    },
    unStartIcon: {
        ...commonStyle.size_24
    }
})
const SWIPE_THRESHOLD = -120

export const createUserStats = (userData) => {
    return new Promise((resolve, reject) => {
        const userStatsObj = {
            OwnerId: userData.id,
            User__c: userData.id
        }
        syncUpObjCreateFromMem('User_Stats__c', [userStatsObj])
            .then((res) => {
                resolve(res[0]?.data[0]?.Id)
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, createUserStats.name, getStringValue(e))
                reject(e)
            })
    })
}

export const handleFavoriteEmployee = async (item, employeeList, setEmployeeList, setIsLoading, isRemoveFavorite?) => {
    try {
        let userStatsId = item?.userStatsId
        if (_.isEmpty(userStatsId)) {
            userStatsId = await createUserStats(item)
        }
        setIsLoading(true)
        employeeList.forEach((employee) => {
            if (employee.id === item.id) {
                employee.isFavorited = !isRemoveFavorite
            }
        })
        setEmployeeList && setEmployeeList(_.cloneDeep(employeeList))
        const query = 'SELECT Id, Schedule_Favorited__c FROM User_Stats__c' + ` WHERE Id = '${userStatsId}'`
        const path = `query/?q=${query}`
        const res = await restDataCommonCall(path, 'GET')
        const latestData = res?.data?.records
        const userStats = await SoupService.retrieveDataFromSoup(
            'User_Stats__c',
            {},
            getObjByName('User_Stats__c').syncUpCreateFields,
            getObjByName('User_Stats__c').syncUpCreateQuery + ` WHERE {User_Stats__c:Id} = '${userStatsId}'`
        )
        if (isRemoveFavorite) {
            const managerIds = latestData[0].Schedule_Favorited__c?.split(',') || []
            managerIds.splice(managerIds.indexOf(CommonParam.userId), 1)
            userStats[0].Schedule_Favorited__c = managerIds.length > 0 ? managerIds.join(',') : ''
        } else {
            if (_.isEmpty(latestData[0].Schedule_Favorited__c)) {
                userStats[0].Schedule_Favorited__c = CommonParam.userId
            } else {
                if (!latestData[0].Schedule_Favorited__c.includes(CommonParam.userId)) {
                    latestData[0].Schedule_Favorited__c += ',' + CommonParam.userId
                    userStats[0].Schedule_Favorited__c = latestData[0].Schedule_Favorited__c
                }
            }
        }

        await syncUpObjUpdateFromMem(
            'User_Stats__c',
            filterExistFields('User_Stats__c', [...userStats], ['Id', 'Schedule_Favorited__c'])
        )
        setIsLoading(false)
    } catch (e) {
        setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, handleFavoriteEmployee.name, getStringValue(e))
    }
}

export const renderFavoriteHiddenItem = (item, swipeDistance, employeeList, setEmployeeList, setIsLoading) => {
    if (item?.item?.unassignedRoute || item?.item?.unassign) {
        return null
    }
    return (
        <TouchableHighlight
            onPress={() => handleFavoriteEmployee(item.item, employeeList, setEmployeeList, setIsLoading)}
            style={styles.rowFavorite}
        >
            <View style={styles.favoriteRightBtn}>
                {swipeDistance > SWIPE_THRESHOLD ? (
                    <CText style={styles.backTextWhite}>{t.labels.PBNA_MOBILE_MARK_AS_FAVORITE}</CText>
                ) : (
                    <StarIcon width={24} height={24} />
                )}
            </View>
        </TouchableHighlight>
    )
}

export const renderRemoveFavoriteHiddenItem = (item, swipeDistance, employeeList, setEmployeeList, setIsLoading) => {
    return (
        <TouchableHighlight
            onPress={() => handleFavoriteEmployee(item.item, employeeList, setEmployeeList, setIsLoading, true)}
            style={styles.rowFavorite}
        >
            <View style={styles.favoriteRightBtn}>
                {swipeDistance > SWIPE_THRESHOLD ? (
                    <CText style={styles.backTextWhite}>{t.labels.PBNA_MOBILE_REMOVE_FAVORITE}</CText>
                ) : (
                    <Image source={ImageSrc.ICON_UNSTAR} style={styles.unStartIcon} />
                )}
            </View>
        </TouchableHighlight>
    )
}

export const setFavoriteBarOpenStatus = async (setShowFavorites, showFavorites) => {
    setShowFavorites(!showFavorites)
    await AsyncStorage.setItem('isFavoriteBarOpen', (!showFavorites).toString())
}

export const getFavoriteBarOpenStatus = async (setShowFavorites) => {
    const isFavoriteBarOpen = JSON.parse(await AsyncStorage.getItem('isFavoriteBarOpen'))
    setShowFavorites && setShowFavorites(isFavoriteBarOpen)
}
