/**
 * @description Employee item component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-19
 */

import React, { useState } from 'react'
import { View, Image, TouchableOpacity, Dimensions } from 'react-native'
import moment from 'moment'
import CText from '../../../../common/components/CText'
import { CheckBox } from 'react-native-elements'
import { SoupService } from '../../../service/SoupService'
import CCheckBox from '../../../../common/components/CCheckBox'
import { CommonParam } from '../../../../common/CommonParam'
import SwipeableRow from '../../common/SwipeableRow'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjUpdate } from '../../../api/SyncUtils'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    calculateDistanceAndTravelTime,
    getFTPT,
    getTimeFromMins,
    getVisitSubTypeStr,
    queryAndSyncDaily,
    queryAndSyncWeekly,
    ReassignModalType,
    reSequenceByVisitListId,
    formatStringByComma,
    transferMilesIntoKilometerForCanada,
    closeOtherRows,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import { EmployeeProps } from '../../../interface/MerchManagerInterface'
import EmployeeCellStyle from '../../../styles/manager/EmployeeCellStyle'
import UserAvatar from '../../common/UserAvatar'
import {
    getHourAndMin,
    isNullSpace,
    renderWorkingDayStatus,
    roundHours,
    updateSalesBucketWhenReassigning,
    updateUnscheduledVisitListByDVLId,
    updateVisitListToUnscheduled
} from '../helper/MerchManagerHelper'
import RowMsgPhoneView from './RowMsgPhoneView'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import {
    checkDataForDeleteVisit,
    checkSVGDataModifiedById,
    checkVisitListForReassignVisit
} from '../service/DataCheckService'
import _ from 'lodash'
import { CommonLabel } from '../../../enums/CommonLabel'
import { DataCheckMsgIndex, DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { VisitStatus } from '../../../enums/Visit'
import { useSelector } from 'react-redux'
import store from '../../../redux/store/Store'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { COLOR_TYPE, NUMBER_VALUE } from '../../../enums/MerchandiserEnums'
import { Instrumentation } from '@appdynamics/react-native-agent'
import FavoriteIcon from '../../../../../assets/image/favorite.svg'
import { Locale } from '../../../enums/i18n'
import { getManagerAdHocNewImage } from '../helper/VisitHelper'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
const screenWidth = Dimensions.get('window').width
const fullLength = screenWidth - NUMBER_VALUE.NINETY_NUM - NUMBER_VALUE.TEN_WIDTH

const statusColor = {
    completed: '#2DD36F',
    inProgress: '#FFC409',
    yet2Start: '#EB445A'
}

const ADD_NUM_FOR_SEQUENCE = 1
const IMG_CHEVRON = ImageSrc.IMG_CHEVRON
const IMG_UNCHECK = ImageSrc.UNCHECK_BLUE
const IMG_UNASSIGNED = ImageSrc.IMG_UNASSIGNED
const FONT_SIZE_20 = 20
const FONT_SIZE_16 = 16
const INDICATOR_DIMENSION = 20
const TAKE_ORDER_STATUS_ONE = '1'
const SPLIT_LINE = '|'
const managerReducer = (state) => state.manager

const styles = EmployeeCellStyle

const getBottomWidth = (hasCallIcon, isReview, isReassign, isOptimized = false) => {
    if ((!hasCallIcon && !isReview && !isOptimized) || isReassign) {
        return styles.borderBottomWidth1
    }
    return styles.borderBottomWidth0
}

const getEmployeeCellContainerStyle = (isReview, isReassign, isOptimized) => {
    if (isOptimized) {
        return styles.optimizedCard
    }
    if (!isReview && !isReassign) {
        return styles.myDayEmployeeCellContainer
    }
    return styles.container
}

const getBackgroundColor = (hasCallIcon, isReview, isReassign) => {
    if (!hasCallIcon && !isReview && !isReassign) {
        return styles.backgroundColorGrey
    }

    return styles.backgroundColorWhite
}

const getAvatarStyle = (fromEmployeeSchedule, isOptimized) => {
    if (isOptimized) {
        return styles.optimizedEmployeeAvatar
    }
    if (fromEmployeeSchedule) {
        return styles.imgAvatarEmployee
    }
    return styles.imgAvatar
}

const getFontSize = (fromEmployeeSchedule) => {
    if (fromEmployeeSchedule) {
        return FONT_SIZE_20
    }
    return FONT_SIZE_16
}

const renderCheckBoxOrAssign = (isReassign, onAssignClick, item, isAssign, disabled) => {
    if (isReassign) {
        return (
            <TouchableOpacity
                onPress={() => {
                    onAssignClick(item)
                }}
                disabled={isAssign}
            >
                <CText style={styles.assignStyle}>{t.labels.PBNA_MOBILE_ASSIGN}</CText>
            </TouchableOpacity>
        )
    }
    return (
        <CheckBox
            disabled={disabled}
            checked={false}
            uncheckedIcon={<Image source={IMG_UNCHECK} style={styles.uncheckStyle} />}
            containerStyle={styles.uncheckContainer}
        />
    )
}

export const renderIndicator = (dimensions: number, number: number) => {
    if (number === 0) {
        return null
    }
    return (
        <View style={[styles.indicator, { width: dimensions, height: dimensions, borderRadius: dimensions }]}>
            <CText style={styles.indicatorNumber}>{number}</CText>
        </View>
    )
}

const getDotColor = (status) => {
    if (status === t.labels.PBNA_MOBILE_IN_PROGRESS_STATUS) {
        return statusColor.inProgress
    } else if (status === VisitStatus.COMPLETED.toLowerCase()) {
        return statusColor.completed
    }
    return statusColor.yet2Start
}

const getEEHour = (item, isReview) => {
    if (isReview) {
        return item.totalHours
    }
    return item.totalPlannedTime
}

export const renderMileage = (manager, item) => {
    return (
        <CText style={styles.statusText}>
            {manager?.isInCanada ? (
                <CText style={styles.statusText}>
                    {transferMilesIntoKilometerForCanada(item.totalMiles)}
                    {` ${t.labels.PBNA_MOBILE_KM}`}
                </CText>
            ) : (
                <CText style={styles.statusText}>
                    {item.totalMiles}
                    {` ${t.labels.PBNA_MOBILE_MI}`}
                </CText>
            )}
        </CText>
    )
}

const renderRaceTrack = (item, index) => {
    const everyLength = (fullLength - (index - 1) * 3) / index

    if (item.Status__c === VisitStatus.COMPLETE) {
        const progressStyle =
            item.AMAS_Compliant__c === '0' ? { backgroundColor: COLOR_TYPE.RED } : { backgroundColor: COLOR_TYPE.GREEN }
        return (
            <View style={[styles.flexStyle, styles.height_5]}>
                <View style={[{ width: everyLength }, progressStyle]} />
                <View style={styles.width_3} />
            </View>
        )
    }
    return (
        <View style={[styles.flexStyle, styles.height_5]}>
            <View style={[{ width: everyLength, backgroundColor: COLOR_TYPE.GRAY }]} />
            <View style={styles.width_3} />
        </View>
    )
}

const renderCell = (props) => {
    const {
        isReview,
        fromEmployeeSchedule,
        item,
        hasCallIcon,
        isReassign,
        onAssignClick,
        isAssign,
        disabled,
        manager,
        isFuture,
        isLastItem,
        isOptimized
    } = props
    if (isReview || isFuture) {
        return (
            <View
                style={[
                    isFuture ? styles.myDayContent : styles.content,
                    fromEmployeeSchedule && styles.contentWithoutBorder
                ]}
            >
                <View style={styles.middle}>
                    <View style={styles.topRow}>
                        <View style={styles.leftCol}>
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                {item.name}
                            </CText>
                        </View>
                        <View style={styles.rightCol}>{renderWorkingDayStatus(item)}</View>
                    </View>
                    {isFuture && (
                        <View style={[styles.flexStyle, styles.titleWrapStyle]}>
                            {!_.isEmpty(getFTPT({ item: item })) && (
                                <View style={styles.flexStyle}>
                                    <CText style={styles.titleTextStyle}>{getFTPT({ item: item }).split(' ')[0]}</CText>
                                    <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                                </View>
                            )}
                            <CText style={styles.titleTextStyle}>{item.title}</CText>
                        </View>
                    )}
                    <View style={styles.status}>
                        <CText
                            style={[
                                styles.totalHours,
                                item.totalHours >= CommonParam.weeklyHourThreshold ? styles.totalHoursActive : null,
                                fromEmployeeSchedule &&
                                    item.totalHours >= CommonParam.dailyHourThreshold &&
                                    styles.employee
                            ]}
                        >
                            {getEEHour(item, isReview)}
                            {` ${t.labels.PBNA_MOBILE_HRS}`}
                        </CText>
                        <CText style={styles.line}> | </CText>
                        <CText style={styles.totalVisits}>
                            {item.totalVisit}
                            {` ${t.labels.PBNA_MOBILE_VISITS}`}
                        </CText>
                        <CText style={styles.line}> | </CText>
                        {renderMileage(manager, item)}
                    </View>
                    {!fromEmployeeSchedule && (
                        <View style={[styles.flexStyle, styles.alignStartStyle, styles.future10]}>
                            {item?.all === 0 ? (
                                <View style={[styles.unfinishedView, { width: fullLength }]} />
                            ) : (
                                item?.amas?.map((element) => {
                                    return renderRaceTrack(element, item.all)
                                })
                            )}
                        </View>
                    )}
                </View>
                {item.workingStatus && (
                    <View style={styles.rightBtn}>
                        <Image style={styles.imgChevron} source={IMG_CHEVRON} />
                    </View>
                )}
                {hasCallIcon &&
                    isFuture &&
                    (!isReassign ? (
                        <View style={[styles.imagesContainer, item.isFavorited && styles.isFavoriteIcon]}>
                            {RowMsgPhoneView(item.phone, false)}
                        </View>
                    ) : (
                        RowMsgPhoneView(item.phone, false)
                    ))}
                {!hasCallIcon && isFuture && (
                    <View style={styles.flexGrowEnd}>
                        {renderCheckBoxOrAssign(isReassign, onAssignClick, item, isAssign, disabled)}
                    </View>
                )}
            </View>
        )
    }
    return (
        <View
            style={[
                isReview || isReassign ? styles.content : styles.myDayContent,
                (hasCallIcon || isReview || isReassign) && !isOptimized
                    ? styles.borderBottomWidth1
                    : styles.borderBottomWidth0,
                item.isFavorited && isLastItem && styles.borderBottomWidth0,
                item.isFavorited && styles.paddingRight_12,
                isOptimized && styles.optimizedContent
            ]}
        >
            <View style={[styles.flexShrinkCol, styles.flexGrow_1]}>
                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                    {item.name}
                </CText>
                {isOptimized && (
                    <View>
                        <View style={[styles.flexStyle, styles.titleWrapStyle]}>
                            {!_.isEmpty(getFTPT({ item: item })) && (
                                <View style={styles.flexStyle}>
                                    <CText style={styles.titleTextStyle}>{getFTPT({ item: item }).split(' ')[0]}</CText>
                                    <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                                </View>
                            )}
                            {!_.isEmpty(item.title) && <CText style={styles.titleTextStyle}>{item.title}</CText>}
                        </View>
                        <View style={[styles.flexStyle, styles.alignStyle, styles.titleWrapStyle]}>
                            <CText style={styles.titleTextStyle}>{`${t.labels.PBNA_MOBILE_DAY} `}</CText>
                            <CText style={[styles.titleTextStyle, { color: 'black' }]}>
                                {roundHours(item?.dailyHours)} {t.labels.PBNA_MOBILE_HRS}
                            </CText>
                            <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                            <CText style={styles.titleTextStyle}>{`${t.labels.PBNA_MOBILE_WEEK} `}</CText>
                            <CText style={[styles.titleTextStyle, { color: 'black' }]}>
                                {roundHours(item.totalHours)} {t.labels.PBNA_MOBILE_HRS}
                            </CText>
                        </View>
                    </View>
                )}
                {hasCallIcon && (
                    <View style={[styles.favoriteCell, styles.titleWrapStyle]}>
                        <View style={[styles.flexStyle, { flex: 0 }]}>
                            {!_.isEmpty(getFTPT({ item: item })) && (
                                <View style={styles.flexStyle}>
                                    <CText style={styles.titleTextStyle}>{getFTPT({ item: item }).split(' ')[0]}</CText>
                                    <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                                </View>
                            )}
                            {!_.isEmpty(item.title) && <CText style={styles.titleTextStyle}>{item.title}</CText>}
                        </View>
                        <View style={[styles.flexStyle, styles.alignStartStyle, styles.titleWrapStyle]}>
                            <View style={[styles.statusIcon, { backgroundColor: getDotColor(item.status) }]} />
                            <View style={styles.flexStyle}>
                                <CText style={styles.titleTextStyle}>
                                    {item.workedHours}/{item.totalPlannedTime} {t.labels.PBNA_MOBILE_HRS}
                                </CText>
                                <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                                <CText style={styles.titleTextStyle}>
                                    {item.finished}/{item.all} {t.labels.PBNA_MOBILE_VISITS}
                                </CText>
                            </View>
                            <View style={[styles.flexStyle, { flex: 1, width: 'auto', height: 30 }]}>
                                <CText style={[styles.subtypeLine, styles.titleTextStyle]}>{SPLIT_LINE}</CText>
                                <CText numberOfLines={2} style={styles.titleTextStyle}>
                                    {item.WTDHours}
                                    {t.labels.PBNA_MOBILE_WTD_HOURS}
                                </CText>
                            </View>
                        </View>
                        {!fromEmployeeSchedule && (
                            <View style={[styles.flexStyle, styles.alignStartStyle, styles.marginTop_3]}>
                                {item?.all === 0 ? (
                                    <View style={[styles.unfinishedView, { width: fullLength }]} />
                                ) : (
                                    item?.amas?.map((element) => {
                                        return renderRaceTrack(element, item.all)
                                    })
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>
            {hasCallIcon &&
                (!isReassign ? (
                    <View style={styles.imagesContainer}>{RowMsgPhoneView(item.phone, false)}</View>
                ) : (
                    RowMsgPhoneView(item.phone, false)
                ))}
            {!hasCallIcon && (
                <View style={styles.flexGrowEnd}>
                    {renderCheckBoxOrAssign(isReassign, onAssignClick, item, isAssign, disabled)}
                </View>
            )}
        </View>
    )
}

const EmployeeCell = (props: EmployeeProps) => {
    const {
        item,
        isReview,
        hasCallIcon,
        isReassign,
        disabled,
        selectForAssign,
        onCellPress,
        reassignCallBack,
        fromEmployeeSchedule,
        type,
        setIsLoading,
        closeModal,
        visitListId,
        setIsErrorShow,
        setErrorMsgType,
        isFuture,
        reassignModalRef,
        isLastItem,
        isOptimized,
        itemKey
    } = props
    const manager = useSelector(managerReducer)
    const lineCodeMap = store.getState().manager.lineCodeMap
    const { dropDownRef } = useDropDown()
    const [isAssign, setIsAssign] = useState(false)

    const onAssignClick = async (assignItem: any) => {
        setIsLoading && setIsLoading(true)
        Instrumentation.startTimer('Merch Manager reassign visit')
        closeModal()
        await syncDownDataByTableNames()
        if (!_.isEmpty(visitListId)) {
            const modified = await checkSVGDataModifiedById(visitListId, setErrorMsgType, setIsErrorShow)
            if (modified) {
                setIsLoading(false)
                reassignModalRef?.current?.closeModal()
                return
            }
        }
        const isPublished =
            type === ReassignModalType.ReassignModalType_Published ||
            type === ReassignModalType.ReassignModalType_UnassignVisit_From_MyDay
        setIsAssign(true)
        const visits = selectForAssign.visits
        const visitIds = []
        const visitDates = []
        const dailyIds = []
        for (const weekDay in visits) {
            const visit = visits[weekDay]
            for (const day in visit) {
                const id = visit[day].id
                if (!visitIds.includes(id)) {
                    visitIds.push(id)
                }
                const date = visit[day].date
                if (!visitDates.includes(date)) {
                    visitDates.push(date)
                }
                const dvlId = visit[day]?.dVisitListId || visit[day]?.visitList
                if (!dailyIds.includes(dvlId) && dvlId) {
                    dailyIds.push(dvlId)
                }
            }
        }
        const selfCheck = await checkDataForDeleteVisit(visitIds, dailyIds, true)
        const targetCheck = await checkVisitListForReassignVisit(item.visitor, visitDates, setIsLoading)
        if (!selfCheck || !targetCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            setErrorMsgType(DataCheckMsgIndex.COMMON_MSG)
            reassignModalRef?.current?.closeModal()
            return
        }

        const startDate = moment(visitDates[0]).clone().day(CommonLabel.NUMBER_ZERO).format(TIME_FORMAT.Y_MM_DD)
        const endDate = moment(visitDates[0]).clone().day(CommonLabel.NUMBER_SIX).format(TIME_FORMAT.Y_MM_DD)

        const weekVisitList: any = await queryAndSyncWeekly({
            item: assignItem,
            startDate,
            endDate,
            isPublished,
            dropDownRef,
            setIsLoading
        })
        const queryDaily: any = await queryAndSyncDaily({
            item: assignItem,
            visitDates,
            weekVisitList,
            isPublished,
            dropDownRef,
            setIsLoading
        })

        let whereClause = ''
        visitIds.forEach((id, index) => {
            whereClause += index === 0 ? ` WHERE {Visit:Id} = '${id}'` : ` OR {Visit:Id} = '${id}'`
        })
        if (_.isEmpty(whereClause)) {
            return
        }
        const oldUserInfo: any = Object.values(visits)?.flat()[0]
        const oldUserId = oldUserInfo?.visitor || oldUserInfo?.VisitorId
        const needUpdateSalesVisit = await updateSalesBucketWhenReassigning(
            oldUserId,
            item?.visitor,
            visitIds,
            dailyIds,
            visitDates,
            lineCodeMap,
            isPublished
        )
        // query visits and store for reassign
        const resultArr = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveVisitAndStoreData.f,
            ScheduleQuery.retrieveVisitAndStoreData.q + whereClause + ' ORDER BY {Visit:Id}'
        )
            .then((result: any) => {
                result.forEach((visit: any) => {
                    // assign visit's ownerId〝visitor
                    const newVisit = {
                        id: visit.Id,
                        date: visit.Planned_Date__c,
                        ownerId: assignItem.id,
                        visitor: assignItem.id,
                        status: visit.Status__c,
                        sequence: CommonLabel.NUMBER_ONE
                    }
                    visit.OwnerId = assignItem.id
                    visit.Visitor = assignItem.id
                    visit.VisitorId = assignItem.id
                    // assign visit's sequence
                    for (const weekDay in visits) {
                        if (assignItem.visits[weekDay] === undefined) {
                            assignItem.visits[weekDay] = [{ ...newVisit }]
                        } else {
                            const sequenceArr = []
                            if (assignItem.visits[weekDay].length > CommonLabel.NUMBER_ZERO) {
                                assignItem.visits[weekDay].forEach((value) => {
                                    sequenceArr.push(value.sequence)
                                })
                            }
                            const maxSequence = Math.max(...sequenceArr)
                            if (visit.Planned_Date__c === visits[weekDay][0].date) {
                                const itemSequenceNum = maxSequence + ADD_NUM_FOR_SEQUENCE
                                newVisit.sequence = itemSequenceNum
                                // visit.Pull_Number__c = itemSequenceNum
                                visit.Sequence__c = itemSequenceNum
                                const isIncludeSameVisit = assignItem.visits[weekDay].filter(
                                    (res) => res.id === visit.Id
                                )
                                if (isIncludeSameVisit.length === CommonLabel.NUMBER_ZERO) {
                                    assignItem.visits[weekDay].push(newVisit)
                                }
                            }
                        }
                    }
                })
                return result
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_CELL_SEARCH_FOR_REASSIGN,
                    err
                )
            })

        const oldVisitListIds = []
        const updateVisits = await SoupService.retrieveDataFromSoup(
            'Visit',
            {},
            ScheduleQuery.retrieveVisitData.f,
            ScheduleQuery.retrieveVisitData.q + whereClause + ' ORDER BY {Visit:Id}'
        )
            .then((res: any) => {
                res.forEach((visit, index) => {
                    if (!oldVisitListIds.includes(visit.Visit_List__c)) {
                        oldVisitListIds.push(visit.Visit_List__c)
                    }
                    if (visit.Id === resultArr[index].Id) {
                        visit.OwnerId = resultArr[index].OwnerId
                        visit.Visitor = resultArr[index].Visitor ? resultArr[index].Visitor : resultArr[index].VisitorId
                        if (!_.isEmpty(visit.VisitorId)) {
                            visit.Reassigned__c = true
                        }
                        visit.VisitorId = resultArr[index].VisitorId
                        // visit.Pull_Number__c = resultArr[index].Pull_Number__c
                        visit.Sequence__c = resultArr[index].Sequence__c
                        visit.Route_Group__c = null
                        visit.Reassigned_Flag__c = isPublished ? true : visit.Reassigned_Flag__c
                        if (needUpdateSalesVisit) {
                            visit.Sales_Visit__c = needUpdateSalesVisit
                        }
                    }
                    for (const dailyVisitListItem of queryDaily) {
                        if (visit.Planned_Date__c === dailyVisitListItem.Visit_Date__c) {
                            visit.Visit_List__c = dailyVisitListItem.Id
                            updateUnscheduledVisitListByDVLId(dailyVisitListItem.Id)
                        }
                    }
                })
                return res
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_CELL_UPDATE_VISITS,
                    err
                )
            })

        await SoupService.upsertDataIntoSoup('Visit', updateVisits, true, false)
        syncUpObjUpdate(
            'Visit',
            getObjByName('Visit').syncUpCreateFields,
            getObjByName('Visit').syncUpCreateQuery + whereClause
        )
            .then(async () => {
                for (const vl of queryDaily) {
                    await reSequenceByVisitListId(vl.Id)
                    await calculateDistanceAndTravelTime(vl.Id)
                }
                const oldListIds = oldVisitListIds.filter((oId) => Boolean(oId))
                // unassigned route doesn't need to update to be unscheduled
                if (_.isEmpty(resultArr[0]?.Route_Group__c)) {
                    await updateVisitListToUnscheduled(oldVisitListIds[0], isPublished)
                }
                for (const id of oldListIds) {
                    await reSequenceByVisitListId(id)
                    await calculateDistanceAndTravelTime(id)
                }
                Instrumentation.stopTimer('Merch Manager reassign visit')
                reassignCallBack &&
                    reassignCallBack({ count: updateVisits.length, item: assignItem, lstVisitId: visitIds })
            })
            .catch((err) => {
                setIsLoading(false)
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_EMPLOYEE_CELL_SYNC_UP_VISIT,
                    err
                )
            })
    }

    const calculateAMASCompliantIssues = () => {
        let cnt = 0
        if (!_.isEmpty(item?.visits) && Array.isArray(item?.visits)) {
            item?.visits?.forEach((visit) => {
                if (visit?.AMAS_Compliant__c === '0' && visit?.Status__c === VisitStatus.COMPLETE) {
                    cnt++
                }
            })
        }
        return cnt
    }

    return (
        <TouchableOpacity
            activeOpacity={1}
            disabled={disabled}
            onPress={() => {
                onCellPress && onCellPress(item)
            }}
            key={itemKey}
        >
            <View
                style={[
                    getEmployeeCellContainerStyle(isReview, isReassign, isOptimized),
                    getBottomWidth(hasCallIcon, isReview, isReassign, isOptimized),
                    styles.borderBottomColorWhite,
                    getBackgroundColor(hasCallIcon, isReview, isReassign),
                    item.landScapeEItemSelected ? styles.backgroundColorGrey : styles.backgroundColorWhite,
                    item.isFavorited && styles.paddingLeft_12
                ]}
            >
                <View style={[styles.marginRight15, !isReview && !isReassign && styles.avatarContainerStyle]}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={getAvatarStyle(fromEmployeeSchedule, isOptimized)}
                        userNameText={{ fontSize: getFontSize(fromEmployeeSchedule) }}
                        needBorder={item.isMyDirect}
                    />
                    {!isReview && renderIndicator(INDICATOR_DIMENSION, calculateAMASCompliantIssues())}
                </View>
                {renderCell({
                    isReview,
                    fromEmployeeSchedule,
                    item,
                    hasCallIcon,
                    isReassign,
                    onAssignClick,
                    isAssign,
                    disabled,
                    manager,
                    isFuture,
                    isLastItem,
                    isOptimized
                })}
            </View>
            {item.isFavorited && !fromEmployeeSchedule && (
                <FavoriteIcon style={styles.favoriteIcon} width={19} height={24} />
            )}
        </TouchableOpacity>
    )
}

const renderAvatar = (item) => {
    if (!item.visitor) {
        return <Image style={styles.imgAvatar} source={IMG_UNASSIGNED} />
    }
    return (
        <UserAvatar
            userStatsId={item.user.userStatsId}
            firstName={item.user.firstName}
            lastName={item.user.lastName}
            avatarStyle={styles.imgAvatar}
            userNameText={{ fontSize: 16 }}
        />
    )
}

export const SelectEmployeeCell = (props: EmployeeProps) => {
    const { item, itemKey, isReview, hasCallIcon, isReassign, onCellPress, onCheckBoxClick } = props
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item.subtype)
    const ManagerAdHocNew = getManagerAdHocNewImage()
    return (
        <View
            style={[
                styles.container,
                (!hasCallIcon && !isReview) || isReassign ? styles.borderBottomWidth1 : styles.borderBottomWidth0,
                styles.borderBottomColorWhite,
                !hasCallIcon && !isReview && !isReassign ? styles.backgroundColorGrey : styles.backgroundColorWhite,
                item?.routeGroup && styles.height_100
            ]}
        >
            <TouchableOpacity
                onPress={() => {
                    onCellPress && onCellPress(item)
                }}
                activeOpacity={1}
                style={styles.touchableArea}
            >
                <View style={styles.marginRight15}>{renderAvatar(item)}</View>
                <View
                    style={[
                        styles.content,
                        hasCallIcon || isReview || isReassign ? styles.borderBottomWidth1 : styles.borderBottomWidth0,
                        { paddingRight: 0 }
                    ]}
                >
                    <View style={commonStyle.flex_1}>
                        <CText style={[styles.userName, styles.textMaxWidth_260]} numberOfLines={1}>
                            {item.visitor ? item.user.name : t.labels.PBNA_MOBILE_UNASSIGNED_VISIT}
                        </CText>
                        {!_.isEmpty(item?.routeGroupName) && (
                            <CText style={[styles.subtype, styles.marginTop5]} numberOfLines={1}>
                                {item?.routeGroupName}
                            </CText>
                        )}
                        <View style={[styles.subtypeContainer]}>
                            <CText style={[styles.subtype, { flexShrink: 1 }]} numberOfLines={1}>
                                {getTimeFromMins(item.totalDuration)}
                            </CText>
                            {item.subtype && <CText style={[styles.subtypeLine]}>{SPLIT_LINE}</CText>}
                            <CText
                                style={[styles.subtype, styles.textMaxWidth_180, { flexShrink: 1 }]}
                                numberOfLines={1}
                            >
                                {subtypeString}
                            </CText>
                            <CText style={[styles.subtype, styles.textMaxWidth_30]} numberOfLines={1}>
                                {subtypeNumString}
                            </CText>
                            <CText style={styles.subtypeLine}>
                                {item.pullNum ? SPLIT_LINE : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            <CText style={styles.subtype}>
                                {item.pullNum ? 'P' + item.pullNum : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            {/* will be add back in future */}
                            {/* <CText style={styles.subtypeLine}>{ isTrueInDB(item.dfFlag) ? SPLIT_LINE : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}</CText>
                            <CText style={styles.subtype}>{ isTrueInDB(item.dfFlag) ? t.labels.PBNA_MOBILE_OPT_VISIT : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}</CText> */}
                            {item.takeOrder === TAKE_ORDER_STATUS_ONE && (
                                <View style={[styles.orderContainer]}>
                                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <CCheckBox
                hitSlop={commonStyle.smallHitSlop}
                onPress={() => {
                    onCheckBoxClick(itemKey)
                }}
                checked={item.select}
                containerStyle={styles.uncheckContainer}
            />
            {item.managerAdHoc && (
                <ManagerAdHocNew style={styles.imgNew} width={CommonParam.locale === Locale.fr ? 82 : 45} height={22} />
            )}
        </View>
    )
}

export const ServiceDetailEmployeeCell = (props: EmployeeProps) => {
    const { item, isEdit, onCellPress } = props
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item?.subtype)
    return (
        <View
            style={[
                styles.container,
                styles.borderBottomWidth1,
                styles.borderBottomColorWhite,
                styles.backgroundColorGrey
            ]}
        >
            <TouchableOpacity
                disabled={isEdit}
                onPress={() => onCellPress && onCellPress(item)}
                style={styles.touchableArea}
            >
                <View style={styles.marginRight15}>
                    {item?.isUnassigned ? (
                        <Image source={ImageSrc.IMG_UNASSIGNED} style={styles.imgAvatar} />
                    ) : (
                        <UserAvatar
                            userStatsId={item.userStatsId}
                            firstName={item.firstName}
                            lastName={item.lastName}
                            avatarStyle={styles.imgAvatar}
                            userNameText={{ fontSize: 18 }}
                        />
                    )}
                </View>
                <View style={[styles.content, styles.borderBottomWidth0, { paddingRight: 0 }]}>
                    <View style={commonStyle.flex_1}>
                        <CText style={[styles.userName, styles.textMaxWidth_260]} numberOfLines={1}>
                            {item?.isUnassigned ? t.labels.PBNA_MOBILE_UNASSIGNED_VISIT : item.name}
                        </CText>
                        {item.routeGroupName && item.unassignedRoute && (
                            <View style={[styles.subtypeContainer]}>
                                <CText
                                    style={[styles.subtype, styles.textMaxWidth_180, { flexShrink: 1 }]}
                                    numberOfLines={1}
                                >
                                    {item.routeGroupName}
                                </CText>
                            </View>
                        )}
                        <View style={[styles.subtypeContainer]}>
                            <CText
                                style={[styles.subtype, styles.textMaxWidth_180, { flexShrink: 1 }]}
                                numberOfLines={1}
                            >
                                {subtypeString}
                            </CText>
                            <CText style={[styles.subtype, styles.textMaxWidth_30]} numberOfLines={1}>
                                {subtypeNumString}
                            </CText>
                            <CText style={styles.subtypeLine}>
                                {item.pullNum ? SPLIT_LINE : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            <CText style={styles.subtype}>
                                {item.pullNum ? 'P' + item.pullNum : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                            </CText>
                            {item.takeOrder === TAKE_ORDER_STATUS_ONE && (
                                <View style={[styles.orderContainer]}>
                                    <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            {isEdit && <CCheckBox disabled checked={item.select} containerStyle={styles.uncheckContainer} />}
        </View>
    )
}

export const UnassignEmployeeCell = (props: EmployeeProps) => {
    const { item, isReview, hasCallIcon, isReassign, extraItemKey, click } = props
    const ManagerAdHocNew = getManagerAdHocNewImage()
    const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item.subtype)
    return (
        <TouchableOpacity
            onPress={() => {
                item.canSelect && click && click(extraItemKey)
            }}
            activeOpacity={1}
            style={[
                styles.container,
                getBottomWidth(hasCallIcon, isReview, isReassign),
                styles.borderBottomColorWhite,
                getBackgroundColor(hasCallIcon, isReview, isReassign)
            ]}
        >
            <View style={styles.marginRight15}>{renderAvatar(item)}</View>
            <View
                style={[
                    styles.content,
                    hasCallIcon || isReview || isReassign ? styles.borderBottomWidth1 : styles.borderBottomWidth0,
                    { paddingRight: 0 }
                ]}
            >
                <View style={commonStyle.flex_1}>
                    <CText style={[styles.userName, styles.textMaxWidth_260]} numberOfLines={1}>
                        {item.visitor ? item.user.name : t.labels.PBNA_MOBILE_UNASSIGNED_VISIT}
                    </CText>
                    <View style={[styles.subtypeContainer]}>
                        <CText style={[styles.subtype, styles.textMinWidth_20]} numberOfLines={1}>
                            {getTimeFromMins(item.totalDuration)}
                        </CText>
                        {item.subtype && <CText style={[styles.subtypeLine]}>{SPLIT_LINE}</CText>}
                        <CText style={[styles.subtype, styles.textMaxWidth_140, { flexShrink: 1 }]} numberOfLines={1}>
                            {subtypeString}
                        </CText>
                        <CText style={[styles.subtype, styles.textMaxWidth_30]} numberOfLines={1}>
                            {subtypeNumString}
                        </CText>
                        <CText style={styles.subtypeLine}>
                            {item.pullNum ? SPLIT_LINE : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                        </CText>
                        <CText style={styles.subtype}>
                            {item.pullNum ? 'P' + item.pullNum : isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING)}
                        </CText>
                        {item.takeOrder === TAKE_ORDER_STATUS_ONE && (
                            <View style={[styles.orderContainer]}>
                                <CText style={styles.orderText}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                            </View>
                        )}
                    </View>
                </View>

                {item.canSelect && (
                    <CCheckBox disabled checked={item.select} containerStyle={styles.uncheckContainer} />
                )}
            </View>
            {item.managerAdHoc && (
                <ManagerAdHocNew style={styles.imgNew} width={CommonParam.locale === Locale.fr ? 82 : 45} height={22} />
            )}
        </TouchableOpacity>
    )
}

export const SunburstEmployeeCell = (props: EmployeeProps) => {
    const { item, click, manager } = props
    return (
        <TouchableOpacity
            onPress={() => {
                click && click(item)
            }}
        >
            <View style={[styles.container, styles.backgroundColorWhite, styles.sunburstContainer]}>
                <View style={styles.marginRight15}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={styles.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                </View>
                <View style={[styles.content, styles.contentWithoutBorder]}>
                    <View style={styles.middle}>
                        <View style={styles.topRow}>
                            <View style={styles.leftCol}>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                    {item.name}
                                </CText>
                            </View>
                            <View style={styles.rightCol}>{renderWorkingDayStatus(item)}</View>
                        </View>
                        <View style={styles.status}>
                            <CText style={styles.textRole}>{getFTPT({ item: item })}</CText>
                            <CText numberOfLines={1} style={[styles.textRole, styles.marginRight15]}>
                                {item.title}
                            </CText>
                        </View>
                        <View style={styles.status}>
                            <CText
                                style={[
                                    styles.totalHours,
                                    item.totalHours >= CommonParam.weeklyHourThreshold && styles.totalHoursActive
                                ]}
                            >
                                {formatStringByComma(Math.round(item.totalHours))}
                                {` ${t.labels.PBNA_MOBILE_HRS} `}
                            </CText>
                            <CText style={styles.line}> | </CText>
                            <CText style={styles.totalVisits}>
                                {item.totalVisit}
                                {` ${t.labels.PBNA_MOBILE_VISITS.toLocaleLowerCase()} `}
                            </CText>
                            <CText style={styles.line}> | </CText>
                            {renderMileage(manager, item)}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export const UnassignedEmployeeCell = (props: EmployeeProps) => {
    const { item, swipeableRows, onCellPress, handleBtnClick } = props
    const isInclude = item.isCostInclude
    const swipeButtonProps = [
        {
            label: isInclude ? t.labels.PBNA_MOBILE_IGNORE : t.labels.PBNA_MOBILE_INCLUDE,
            color: isInclude ? baseStyle.color.red : baseStyle.color.loadingGreen,
            width: 98,
            onBtnClick: handleBtnClick
        }
    ]

    return (
        <SwipeableRow
            uniqKey={item?.id}
            swipeableRows={swipeableRows}
            closeOtherRows={closeOtherRows}
            showBorderRadius={false}
            params={item}
            swipeButtonConfig={swipeButtonProps}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                    onCellPress && onCellPress(item)
                }}
            >
                <View
                    style={[
                        styles.container,
                        styles.UnassignedContainer,
                        !item.isCostInclude && styles.backgroundColorGrey
                    ]}
                >
                    <View style={[styles.marginRight15, styles.marginTop5]}>
                        <UserAvatar
                            userStatsId={item.userStatsId}
                            firstName={item.firstName}
                            lastName={item.lastName}
                            avatarStyle={styles.imgAvatar}
                            userNameText={{ fontSize: 16 }}
                        />
                    </View>
                    <View style={styles.content}>
                        <View style={styles.middle}>
                            <View style={styles.topRow}>
                                <View style={styles.leftCol}>
                                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                        {item.name}
                                    </CText>
                                </View>
                                <View style={styles.rightCol}>{renderWorkingDayStatus(item)}</View>
                            </View>
                            <View style={styles.unassignedStatus}>
                                <View style={styles.statusMainContainer}>
                                    <CText style={styles.statusText}>{getFTPT({ item: item })}</CText>
                                    <CText style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
                                        {item.title}
                                    </CText>
                                </View>
                                <View style={styles.statusMainContainer}>
                                    <CText style={styles.totalHours}>
                                        {`${roundHours(item.totalHours)} ${t.labels.PBNA_MOBILE_HR}`}
                                    </CText>
                                    <CText style={styles.line}> | </CText>
                                    <CText style={styles.totalVisits}>
                                        ${formatStringByComma(Math.round(item.totalCost))}
                                    </CText>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </SwipeableRow>
    )
}

export const UnassignedRouteCell = (props: EmployeeProps) => {
    const { item, onCellPress, manager, needArrowIcon, isUGMPersona } = props

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                onCellPress && onCellPress(item)
            }}
        >
            <View
                style={[
                    styles.myDayEmployeeCellContainer,
                    commonStyle.fullWidth,
                    !onCellPress && styles.paddingLeft_0,
                    isUGMPersona && styles.paddingLeft_20
                ]}
            >
                <View style={[styles.marginRight15, styles.avatarContainerStyle]}>
                    <Image
                        style={[
                            onCellPress ? styles.imgAvatar : styles.imgAvatarEmployee,
                            isUGMPersona && styles.imgUserImage
                        ]}
                        source={ImageSrc.IMG_UNASSIGNED}
                    />
                </View>
                <View
                    style={[
                        styles.content,
                        (isUGMPersona || !onCellPress) && styles.borderBottomColorWhite,
                        styles.height_100
                    ]}
                >
                    <View style={styles.middle}>
                        <View style={styles.topRow}>
                            <View style={styles.leftCol}>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                    {_.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) + ' ' + t.labels.PBNA_MOBILE_ROUTE}
                                </CText>
                            </View>
                        </View>
                        <View style={[styles.status]}>
                            <CText
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[styles.statusText, styles.maxWidth_320]}
                            >
                                {item.name}
                            </CText>
                        </View>
                        <View style={styles.status}>
                            {item.totalDurationAndTravelTimeMins >= 0
                                ? !isUGMPersona && (
                                      <CText style={styles.totalHours}>
                                          {getHourAndMin(item.totalDurationAndTravelTimeMins).hour}
                                          {` ${t.labels.PBNA_MOBILE_HRS} `}
                                          {getHourAndMin(item.totalDurationAndTravelTimeMins).min}
                                          {` ${t.labels.PBNA_MOBILE_MINS}`}
                                      </CText>
                                  )
                                : !isUGMPersona && (
                                      <CText
                                          style={[
                                              styles.totalHours,
                                              item.totalHours >= CommonParam.weeklyHourThreshold &&
                                                  styles.totalHoursActive
                                          ]}
                                      >
                                          {item.totalHours}
                                          {` ${t.labels.PBNA_MOBILE_HRS}`}
                                      </CText>
                                  )}
                            {!isUGMPersona && <CText style={styles.line}> | </CText>}
                            <CText style={styles.totalVisits}>
                                {item.totalVisit}
                                {` ${t.labels.PBNA_MOBILE_VISITS}`}
                            </CText>
                            <CText style={styles.line}> | </CText>
                            {renderMileage(manager, item)}
                        </View>
                    </View>
                    {needArrowIcon && (
                        <View style={styles.rightBtn}>
                            <Image style={styles.imgChevron} source={IMG_CHEVRON} />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default EmployeeCell
