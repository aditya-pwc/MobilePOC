/**
 * @description ErrorMsgModal component.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2022-1-5
 */

import React, { useEffect, useState } from 'react'
import { Image, TouchableOpacity, View, FlatList, NativeAppEventEmitter } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import {
    getSQLFormatScheduleDateArr,
    roundHours,
    goBackAndRefreshInRNS,
    handleIgnoreEEClick,
    getUnassignedEEInfo,
    getIdClause
} from '../helper/MerchManagerHelper'
import { queryUnassignedEEList, formatStringByComma, closeAllOpenRow } from '../../../utils/MerchManagerUtils'
import { checkSVGDataModifiedById, dataCheckWithAction } from '../service/DataCheckService'
import { EventEmitterType, DataCheckMsgIndex, NavigationPopNum, LineCodeGroupType } from '../../../enums/Manager'
import styles from '../../../styles/manager/UnassignEmployeeStyle'
import EmptyImage from '../../../../../assets/image/empty_visit.svg'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { UnassignedEmployeeCell } from '../common/EmployeeCell'
import ErrorMsgModal from '../common/ErrorMsgModal'
import Loading from '../../../../common/components/Loading'
import CText from '../../../../common/components/CText'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import store from '../../../redux/store/Store'
import _ from 'lodash'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface UnassignEmployeeProps {
    props: any
    route: any
    navigation
}

const isFromUnassignEE = true
const managerReducer = (state) => state.manager

const getLineCodeQuery = (userLineCodes, type) => {
    let lineCodesQuery = ''
    if (!_.isEmpty(userLineCodes)) {
        if (type === 0) {
            lineCodesQuery = `AND ({User:LC_ID__c} IN (${getIdClause(
                userLineCodes[UserType.UserType_Merch]
            )}) OR {User:LC_ID__c} IS NULL)`
        } else if (type === 1) {
            lineCodesQuery = `AND {User:LC_ID__c} IN (${getIdClause(userLineCodes[UserType.UserType_Sales])})`
        }
    }
    return lineCodesQuery
}

const UnassignEmployee = ({ route, navigation }: UnassignEmployeeProps) => {
    const { scheduleVisitListId, isFromScheduleSummary, activeTab } = route.params
    const manager = useSelector(managerReducer)
    const { dropDownRef } = useDropDown()
    const dateArr = getSQLFormatScheduleDateArr(manager.scheduleDate, true)
    const [unassignEEList, setUnassignEEList] = useState([])
    const initialEEInfo = {
        totalNumber: 0,
        totalTime: 0,
        totalCost: 0
    }
    const [unassignedEEInfo, setUnassignedEEInfo] = useState(initialEEInfo)
    const [swipeableRows] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const [errorMsgType, setErrorMsgType] = useState(DataCheckMsgIndex.COMMON_MSG)

    const userLineCodes = store.getState().manager.lineCodeMap.get(LineCodeGroupType.LandingPageGroup)

    const sortByLastName = (a, b) => {
        return a.lastName.charAt(0) < b.lastName.charAt(0) ? -1 : 1
    }

    const sortEmployeeList = (list) => {
        const tmpIgnoreEEList = []
        const tmpIncludeEElist = []

        list?.forEach((item) => {
            if (item.isCostInclude) {
                tmpIncludeEElist.push(item)
            } else {
                tmpIgnoreEEList.push(item)
            }
        })
        tmpIgnoreEEList.sort(sortByLastName)
        tmpIncludeEElist.sort(sortByLastName)
        setUnassignEEList(tmpIncludeEElist.concat(tmpIgnoreEEList))
    }

    const getUnassignedEEList = async (setLoadingDisplay?) => {
        queryUnassignedEEList(dateArr, setLoadingDisplay, getLineCodeQuery(userLineCodes, activeTab))
            .then((res: any) => {
                sortEmployeeList(res)
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'UnassignEmployee.getUnassignedEEList', getStringValue(err))
            })
    }

    const getSVGData = async () => {
        setIsLoading(true)
        await getUnassignedEEInfo(scheduleVisitListId, setUnassignedEEInfo, activeTab).catch((err) => {
            setIsLoading(false)
            storeClassLog(Log.MOBILE_ERROR, 'UnassignEmployee.getSVGData', getStringValue(err))
        })
        setIsLoading(false)
    }

    const handleBtnClick = async (item) => {
        closeAllOpenRow(swipeableRows)
        setIsLoading(true)
        const modified = await checkSVGDataModifiedById(scheduleVisitListId, setErrorMsgType, setIsErrorShow)

        if (modified) {
            setIsLoading(false)
            return
        }

        const wvlCheck = await dataCheckWithAction('Visit_List__c', `WHERE Id = '${item.wvlId}'`, '', false)

        if (!wvlCheck) {
            setIsLoading(false)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            setIsErrorShow(true)
            return
        }
        await handleIgnoreEEClick({
            item,
            setIsLoading,
            scheduleVisitListId,
            dropDownRef,
            navigation,
            getUnassignedEEList,
            setUnassignedEEInfo,
            activeTab
        })
        setIsLoading(false)
    }

    const goBackAndRefresh = async () => {
        goBackAndRefreshInRNS(NavigationPopNum.POP_THREE, errorMsgType, setIsLoading, navigation)
    }

    useEffect(() => {
        getUnassignedEEList(setIsLoading)
        getSVGData()
    }, [])

    useEffect(() => {
        if (isFromScheduleSummary) {
            // when swipe back to previous page
            navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
                NativeAppEventEmitter.emit(EventEmitterType.REFRESH_SCHEDULE_SUMMARY, isFromUnassignEE)
            })
            return () => {
                navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
            }
        }
    }, [])

    const renderEItem = ({ item }) => {
        return (
            <UnassignedEmployeeCell
                item={item}
                swipeableRows={swipeableRows}
                onCellPress={() => {}}
                handleBtnClick={() => handleBtnClick(item)}
            />
        )
    }

    const getListEmptyComponent = () => {
        return (
            <View style={styles.emptyListContainer}>
                <EmptyImage style={styles.emptyImg} />
                <CText style={styles.emptyText}>{t.labels.PBNA_MOBILE_NO_UNASSIGNED_EMPLOYEES}</CText>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.nvgHeaderTitleContainer}>
                        <TouchableOpacity onPress={navigation && navigation.goBack} style={styles.backButton}>
                            <Image
                                source={require('../../../../../assets/image/icon-back.png')}
                                style={styles.backButtonImage}
                            />
                        </TouchableOpacity>
                        <CText style={styles.nvgHeaderTitle}>{t.labels.PBNA_MOBILE_NEW_SCHEDULE}</CText>
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <CText style={styles.headerTitle}>{t.labels.PBNA_MOBILE_UNASSIGNED_EMPLOYEES}</CText>
                        <View style={styles.headerInfoContainer}>
                            <View style={styles.headerInfoItem}>
                                <CText style={styles.headerInfoItemTitle}>{t.labels.PBNA_MOBILE_EMPLOYEES}</CText>
                                <CText style={styles.headerInfoItemNum}>{unassignedEEInfo.totalNumber}</CText>
                            </View>
                            <View style={styles.headerInfoItem}>
                                <CText style={[styles.headerInfoItemTitle, styles.textCenter]}>
                                    {t.labels.PBNA_MOBILE_TOTAL_HOURS}
                                </CText>
                                <CText style={[styles.headerInfoItemNum, styles.textCenter]}>
                                    {`${roundHours(unassignedEEInfo.totalTime)} ${t.labels.PBNA_MOBILE_HR}`}
                                </CText>
                            </View>
                            <View style={styles.headerInfoItem}>
                                <CText style={[styles.headerInfoItemTitle, styles.textEnd]}>
                                    {t.labels.PBNA_MOBILE_TOTAL_COST}
                                </CText>
                                <CText
                                    style={[styles.headerInfoItemNum, styles.textEnd]}
                                    ellipsizeMode={'tail'}
                                    numberOfLines={1}
                                >
                                    ${formatStringByComma(Math.round(unassignedEEInfo.totalCost))}
                                </CText>
                            </View>
                        </View>
                    </View>
                </View>
                <FlatList
                    data={unassignEEList}
                    extraData={unassignEEList}
                    renderItem={renderEItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.paddingBottom_52}
                    ListEmptyComponent={getListEmptyComponent()}
                />
            </View>
            <Loading isLoading={isLoading} />
            <ErrorMsgModal
                index={errorMsgType}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
        </SafeAreaView>
    )
}

export default UnassignEmployee
