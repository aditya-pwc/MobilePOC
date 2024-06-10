/**
 * @description Recurring visit detail component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-06-23
 */

import React, { useEffect, useState } from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    Modal,
    NativeAppEventEmitter,
    ScrollView,
    Alert
} from 'react-native'
import CText from '../../../../common/components/CText'
import RecurringVisitDetailStyle from '../../../styles/manager/RecurringVisitDetailStyle'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    E_CARD_HEIGHT,
    getFullWeekName,
    getOrderDayObj,
    handleTakeOrderSalesData,
    syncDownDataByTableNames
} from '../../../utils/MerchManagerUtils'
import { getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import SubTypeModal from '../common/SubTypeModal'
import CSwitch from '../../../../common/components/c-switch/CSwitch'
import { Picker } from '@react-native-picker/picker'
import EmployeeItem from '../common/EmployeeItem'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import CustomerItem from '../common/CustomerItem'
import Loading from '../../../../common/components/Loading'
import { SoupService } from '../../../service/SoupService'
import { getObjByName } from '../../../utils/SyncUtils'
import { syncUpObjUpdate } from '../../../api/SyncUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { database } from '../../../common/SmartSql'
import _, { max } from 'lodash'
import { DataCheckMsgIndex, DropDownType, EventEmitterType, NavigationPopNum } from '../../../enums/Manager'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { Constants } from '../../../../common/Constants'
import { dataCheckWithAction } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { useSelector } from 'react-redux'
import { Log } from '../../../../common/enums/Log'
import { t } from '../../../../common/i18n/t'
import { renderUnassignCard, renderUnassignRouteCard } from '../helper/MerchManagerHelper'
import { MerchManagerScreenMapping } from '../../../config/ScreenMapping'
import { getVisitSubtypes } from '../helper/VisitHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { useHandleVisitSubtype } from '../../../helper/manager/AllManagerMyDayHelper'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const styles = Object.assign(RecurringVisitDetailStyle, EmployeeDetailStyle)

const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE
const managerReducer = (state) => state.manager
interface RecurringVisitDetailProps {
    navigation?: any
    route?: any
}

const handleSDData = (params) => {
    const {
        res,
        detailData,
        pullNumArr,
        newVisitArray,
        SDIDs,
        orderDays,
        fullDayName,
        lineCodeMap,
        needReturnMaxPullNum,
        dropDownRef,
        indicator2P,
        allDayAbbr,
        fullDayNameArr
    } = params
    try {
        const { hasSalesLC, firstSalesVisit } = handleTakeOrderSalesData(res, lineCodeMap)
        res.forEach((visit, index) => {
            if (visit.Id !== detailData.id) {
                pullNumArr.push(visit.Pull_Number__c)
            }
            visit.Pull_Number__c = index + 1
            newVisitArray.push(visit)
            SDIDs.push("'" + visit.Id + "'")
        })
        if (!needReturnMaxPullNum) {
            const isOrderDay = orderDays[allDayAbbr[fullDayNameArr.findIndex((item) => item.key === fullDayName)]]
            newVisitArray.forEach((visit) => {
                // if no sales, set pull num one take order = true
                if (!hasSalesLC) {
                    visit.Take_Order_Flag__c = visit.Pull_Number__c === 1 && isOrderDay && indicator2P
                } else {
                    // if exist sales, set the first sales's sd take order = true
                    visit.Take_Order_Flag__c = isOrderDay && visit.Id === firstSalesVisit.Id && indicator2P
                }
            })
        }
        return { newVisitArray, pullNumArr, SDIDs }
    } catch (err) {
        dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_UPDATE, err)
        storeClassLog(Log.MOBILE_ERROR, 'RecurringVisitDetail.handleSDData', getStringValue(err))
    }
}

const updatePullNum = (params) => {
    const {
        fullDayName,
        needReturnMaxPullNum,
        detailData,
        updatePullNumFromCustomerView,
        dropDownRef,
        orderDays,
        lineCodeMap,
        allDayAbbr,
        fullDayNameArr
    } = params
    return new Promise((resolve, reject) => {
        const whereClauseArr = []
        const fields = {
            IsRemoved__c: '0',
            'Customer_to_Route__r.Customer__c': updatePullNumFromCustomerView
                ? detailData?.customerData?.accountId
                : detailData.store?.accountId,
            'Customer_to_Route__r.Merch_Flag__c': '1',
            'Customer_to_Route__r.RecordTypeId': detailData.CTRRecordTypeId,
            Day_of_the_Week__c: fullDayName
        }
        const indicator2P = updatePullNumFromCustomerView
            ? detailData?.customerData?.indicator2P
            : detailData?.indicator2P
        for (const key in fields) {
            const value = fields[key]
            const clauseForSmartSql = {
                leftTable: 'Service_Detail__c',
                leftField: key,
                rightField: `'${value}'`,
                operator: '=',
                type: 'AND'
            }
            whereClauseArr.push(clauseForSmartSql)
        }
        database()
            .use('Service_Detail__c')
            .select()
            .join({
                table: 'User',
                alias: 'User',
                options: {
                    targetTable: 'Service_Detail__c',
                    targetField: 'OwnerId',
                    mainField: 'Id'
                }
            })
            .select(['Id', 'LC_ID__c'])
            .where(whereClauseArr)
            .orderBy([{ table: 'Service_Detail__c', field: 'Pull_Number__c' }])
            .getData()
            .then((res: any) => {
                let newVisitArray = []
                let pullNumArr = []
                let SDIDs = []
                if (res.length > 0) {
                    const resObj = handleSDData({
                        res,
                        detailData,
                        pullNumArr,
                        newVisitArray,
                        SDIDs,
                        orderDays,
                        fullDayName,
                        lineCodeMap,
                        needReturnMaxPullNum,
                        dropDownRef,
                        indicator2P,
                        allDayAbbr,
                        fullDayNameArr
                    })
                    newVisitArray = resObj.newVisitArray
                    pullNumArr = resObj.pullNumArr
                    SDIDs = resObj.SDIDs
                    if (needReturnMaxPullNum) {
                        resolve(pullNumArr.length > 0 ? parseInt(max(pullNumArr)) : 0)
                    }
                    if (newVisitArray.length > 0) {
                        SoupService.upsertDataIntoSoup('Service_Detail__c', newVisitArray, true, false)
                            .then(() => {
                                syncUpObjUpdate(
                                    'Service_Detail__c',
                                    getObjByName('Service_Detail__c').syncUpCreateFields,
                                    getObjByName('Service_Detail__c').syncUpCreateQuery +
                                        ` WHERE {Service_Detail__c:Id} IN (${SDIDs.join(',')})`
                                )
                                    .then(() => {
                                        resolve(1)
                                    })
                                    .catch((err) => {
                                        dropDownRef.current.alertWithType(
                                            DropDownType.ERROR,
                                            t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_SYNC_SERVICE,
                                            err
                                        )
                                        reject(err)
                                    })
                            })
                            .catch((err) => {
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_INSERT_SERVICE,
                                    err
                                )
                                reject(err)
                            })
                    }
                }
                resolve(1)
            })
            .catch((err) => {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_QUERY_SERVICE,
                    err
                )
                reject(0)
            })
    })
}

const onSaveClick = async (params) => {
    const {
        detailData,
        selectedSubType,
        selectedDay,
        updatePullNumFromCustomerView,
        existedDayAbbr,
        allWeekData,
        dropDownRef,
        setIsLoading,
        navigation,
        orderDays,
        setIsErrorShow,
        lineCodeMap,
        allDayAbbr,
        fullDayNameArr
    } = params
    if (!detailData.id) {
        return
    }
    setIsLoading(true)
    const dataCheck = await dataCheckWithAction('Service_Detail__c', `WHERE Id='${detailData.id}'`, '', false)
    if (!dataCheck) {
        setIsLoading(false)
        setIsErrorShow(true)
        return
    }
    const accountId = detailData.accountId || detailData.customerData.accountId
    const indicator2P = updatePullNumFromCustomerView ? detailData?.customerData?.indicator2P : detailData?.indicator2P
    const existedVisits = await SoupService.retrieveDataFromSoup(
        'Service_Detail__c',
        {},
        ['Id'],
        `
        SELECT {Service_Detail__c:Id} FROM {Service_Detail__c}
        WHERE {Service_Detail__c:Day_of_the_Week__c}='${selectedDay}'
        AND {Service_Detail__c:Customer_to_Route__r.Customer__c}='${accountId}'
        AND {Service_Detail__c:IsRemoved__c}='0'
        `
    )
    if (existedVisits.filter((v: any) => v.Id !== detailData.id).length >= Constants.RECURRING_VISIT_MAX_NUM) {
        setIsLoading(false)
        Alert.alert(
            t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_LIMIT,
            `${t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_LIMIT_MSG} ${selectedDay}.`
        )
        return
    }
    setIsLoading(true)
    const updatedServiceDetail = []
    SoupService.retrieveDataFromSoup(
        'Service_Detail__c',
        {},
        getObjByName('Service_Detail__c').syncUpCreateFields,
        getObjByName('Service_Detail__c').syncUpCreateQuery + ` WHERE {Service_Detail__c:Id} = '${detailData.id}'`
    )
        .then(async (res: any) => {
            if (res?.length > 0) {
                const currentSD = _.cloneDeep(res[0])
                const subType = selectedSubType
                    .filter((item) => item.select === true)
                    .map((item) => item.id)
                    .join(';')
                currentSD.Day_of_the_Week__c = selectedDay
                currentSD.Visit_Subtype__c = subType
                const dayAbbr = allDayAbbr[fullDayNameArr.findIndex((item) => item.key === selectedDay)]
                if (selectedDay !== detailData.weekName) {
                    // update from customer view, update directly
                    if (updatePullNumFromCustomerView) {
                        if (!existedDayAbbr.includes(dayAbbr)) {
                            currentSD.Pull_Number__c = 1
                            currentSD.Take_Order_Flag__c = orderDays[dayAbbr] && indicator2P
                        } else {
                            const allPullNumNeedToUpdate = []
                            // if new day exists records
                            if (allWeekData[dayAbbr]) {
                                Object.values(allWeekData[dayAbbr]).forEach((value: any) => {
                                    allPullNumNeedToUpdate.push(value.pullNum)
                                })
                                currentSD.Pull_Number__c = max(allPullNumNeedToUpdate) + 1
                                currentSD.Take_Order_Flag__c = false
                            }
                        }
                    } else {
                        // in ee view, query all same account id's sd records and get the max pull num
                        const newPullNum: any = await updatePullNum({
                            fullDayName: selectedDay,
                            needReturnMaxPullNum: true,
                            detailData,
                            updatePullNumFromCustomerView,
                            dropDownRef,
                            orderDays,
                            lineCodeMap,
                            allDayAbbr,
                            fullDayNameArr
                        })
                        currentSD.Pull_Number__c = newPullNum + 1
                        currentSD.Take_Order_Flag__c = false
                    }
                }
                updatedServiceDetail.push(currentSD)
                SoupService.upsertDataIntoSoup('Service_Detail__c', updatedServiceDetail, true, false)
                    .then(async () => {
                        syncUpObjUpdate(
                            'Service_Detail__c',
                            getObjByName('Service_Detail__c').syncUpCreateFields,
                            getObjByName('Service_Detail__c').syncUpCreateQuery +
                                ` WHERE {Service_Detail__c:Id} = '${currentSD.Id}'`
                        )
                            .then(async () => {
                                if (selectedDay !== detailData.weekName) {
                                    await updatePullNum({
                                        fullDayName: detailData.weekName,
                                        needReturnMaxPullNum: false,
                                        detailData,
                                        updatePullNumFromCustomerView,
                                        dropDownRef,
                                        orderDays,
                                        lineCodeMap,
                                        allDayAbbr,
                                        fullDayNameArr
                                    })
                                    // if ee view, update pull num of new day
                                    await updatePullNum({
                                        fullDayName: selectedDay,
                                        needReturnMaxPullNum: false,
                                        detailData,
                                        updatePullNumFromCustomerView,
                                        dropDownRef,
                                        orderDays,
                                        lineCodeMap,
                                        allDayAbbr,
                                        fullDayNameArr
                                    })
                                }
                                await syncDownDataByTableNames(MerchManagerScreenMapping.ServiceDetailRelated)
                                setIsLoading(false)
                                updatePullNumFromCustomerView &&
                                    NativeAppEventEmitter.emit(EventEmitterType.REFRESH_CUSTOMER_SD, {
                                        selectDayKey: dayAbbr
                                    })
                                !updatePullNumFromCustomerView &&
                                    NativeAppEventEmitter.emit(EventEmitterType.REFRESH_EMPLOYEE_SD, {
                                        selectDayKey: dayAbbr
                                    })
                                navigation.goBack()
                            })
                            .catch((err) => {
                                setIsLoading(false)
                                dropDownRef.current.alertWithType(
                                    DropDownType.ERROR,
                                    t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_SYNC_SERVICE,
                                    err
                                )
                            })
                    })
                    .catch((err) => {
                        setIsLoading(false)
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_INSERT_SERVICE,
                            err
                        )
                    })
            }
        })
        .catch((err) => {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAIL_QUERY_SERVICE,
                err
            )
        })
}

const checkToShowBottomButtons = (selectedSubType, isEnabledTakeOrder, detailData, selectedDay) => {
    const subType = selectedSubType
        .filter((item) => item.select === true)
        .map((item) => item.id)
        .join(';')
    if (subType.length === 0) {
        return false
    }
    if (isEnabledTakeOrder !== (detailData.takeOrder === '1')) {
        return true
    }
    let subTypeChanged = false
    selectedSubType.forEach((item) => {
        if (
            (!item.select && detailData.subtype.includes(item.id)) ||
            (item.select && !detailData.subtype.includes(item.id))
        ) {
            subTypeChanged = true
        }
    })
    if (subTypeChanged) {
        return subTypeChanged
    }
    return selectedDay !== detailData.weekName
}

const onPickChange = (value, setSelectedDay, detailData, setIsVisitDayChanged) => {
    setSelectedDay(value)
    if (value !== detailData.weekName) {
        setIsVisitDayChanged(true)
    } else {
        setIsVisitDayChanged(false)
    }
}

const RecurringVisitDetail = (props: RecurringVisitDetailProps) => {
    const { navigation, route } = props
    const detailData = route.params?.detailData
    const allWeekData = route.params?.allWeekData
    const customerData = route.params?.customerData
    const isFromCustomer = route.params?.isFromCustomer
    const updatePullNumFromCustomerView = route.params?.updatePullNumFromCustomerView
    const orderDays = getOrderDayObj(updatePullNumFromCustomerView ? customerData : detailData.store)
    const existedDayAbbr = Object.keys(allWeekData)
    const initialSubType = JSON.parse(JSON.stringify(getVisitSubtypes())).map((item) => {
        if (detailData?.subtype?.includes(item.id)) {
            item.select = true
        }
        return item
    })
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState(JSON.parse(JSON.stringify(initialSubType)))
    const [selectedSubType, setSelectedSubType] = useState(JSON.parse(JSON.stringify(initialSubType)))
    const isEnabledTakeOrder = detailData.takeOrder === '1'
    const [weekModalVisible, setWeekModalVisible] = useState(false)
    const [selectedDay, setSelectedDay] = useState(detailData.weekName || 'Sunday')
    const [isVisitDayChanged, setIsVisitDayChanged] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const { dropDownRef } = useDropDown()
    const pullNum = detailData.pullNum ? 'P' + detailData.pullNum : ''
    const manager = useSelector(managerReducer)
    const lineCodeMap = manager.lineCodeMap
    const fullDayNameArr = getFullWeekName()
    const allDayAbbr = getWeekLabel()
    const { updateVisitSubType, onCancelSubType } = useHandleVisitSubtype({
        setTypeModalVisible,
        typeModalVisible,
        subTypeArray,
        setSelectedSubType,
        selectedSubType,
        setSubTypeArray
    })

    let visitSubType = []

    const onRemoveSubType = (item) => {
        subTypeArray.find((sub) => sub.name === item.name).select = false
        visitSubType = JSON.parse(JSON.stringify(subTypeArray))
        setSubTypeArray(visitSubType)
        setSelectedSubType(visitSubType)
    }

    const checkClick = (index) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const onDoneClick = async () => {
        setWeekModalVisible(false)
    }

    useEffect(() => {
        navigation.setOptions({ tabBarVisible: false })
    }, [])

    const refreshData = () => {
        navigation.pop(NavigationPopNum.POP_TWO)
    }

    const getUnassignedCard = () => {
        return detailData.unassignedRoute ? (
            <View style={styles.unassignedRouteContainer}>
                {renderUnassignRouteCard(detailData, true, isFromCustomer)}
            </View>
        ) : (
            renderUnassignCard()
        )
    }
    return (
        <View style={styles.flex_1}>
            <SafeAreaView style={styles.container}>
                <View style={[styles.flex_1, styles.paddingBottom_10]}>
                    <ScrollView style={[styles.marginBottom_20]}>
                        <View style={styles.reHeader}>
                            <CText style={styles.reTitle}>{t.labels.PBNA_MOBILE_RECURRING_VISIT_DETAILS}</CText>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <BlueClear height={36} width={36} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoContent}>
                            <View style={styles.customerCard}>
                                <CustomerItem
                                    containerStyle={styles.customerCardView}
                                    item={{ item: detailData.customerData || detailData.store }}
                                    touchable={false}
                                    showBottomView={false}
                                />
                            </View>
                            <TouchableOpacity onPress={() => setWeekModalVisible(true)}>
                                <View style={[styles.flexRow, styles.flexSelectRow, styles.marginBottom_20]}>
                                    <View style={styles.flexDirectionRow}>
                                        <CText style={styles.selectLabel}>
                                            {t.labels.PBNA_MOBILE_RECURRING_VISIT_DAY}
                                        </CText>
                                    </View>
                                    <View style={styles.flexRowAlignCenter}>
                                        <CText style={[styles.selectLabel, styles.selectValue]}>
                                            {fullDayNameArr.filter((item) => item.key === selectedDay)[0]?.label}
                                        </CText>
                                        <Image source={IMG_TRIANGLE} style={styles.imgTriangle} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.flexRow,
                                    styles.flexSelectRow,
                                    selectedSubType.filter((item: any) => item.select).length > 0 &&
                                        styles.noBottomLine,
                                    selectedSubType.filter((item: any) => item.select).length === 0 &&
                                        styles.marginBottom_30
                                ]}
                                onPress={() => {
                                    setTypeModalVisible(true)
                                }}
                            >
                                <View style={styles.flexDirectionRow}>
                                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                                </View>
                                <View style={styles.flexRowAlignCenter}>
                                    <Image source={IMG_TRIANGLE} style={styles.imgTriangle} />
                                </View>
                            </TouchableOpacity>
                            <View
                                style={[
                                    selectedSubType.filter((item: any) => item.select).length > 0 && styles.bottomLine,
                                    selectedSubType.filter((item: any) => item.select).length > 0 &&
                                        styles.marginBottom_30
                                ]}
                            >
                                <View style={styles.selectedContainer}>
                                    {selectedSubType
                                        .filter((item: any) => item.select)
                                        .map((item) => {
                                            return (
                                                <View style={styles.subTypeCell} key={item?.id}>
                                                    <CText>{item.name}</CText>
                                                    <TouchableOpacity
                                                        onPress={() => onRemoveSubType(item)}
                                                        style={styles.clearSubTypeContainer}
                                                    >
                                                        <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        })}
                                </View>
                            </View>
                            <View style={styles.marginBottom_30}>
                                <CSwitch
                                    label={t.labels.PBNA_MOBILE_TAKE_ORDER}
                                    labelStyle={styles.selectLabel}
                                    showBottomLine
                                    checked={isEnabledTakeOrder}
                                    disabled
                                />
                            </View>
                            <View style={[styles.flexRow, styles.flexSelectRow, styles.noBottomLine]}>
                                <View style={styles.flexDirectionRow}>
                                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_PULL_POSITION}</CText>
                                </View>
                                <View style={[styles.flexRowAlignCenter, styles.noBottomLine]}>
                                    <CText style={[styles.selectLabel, styles.selectValue]}>
                                        {isVisitDayChanged ? t.labels.PBNA_MOBILE_TBD : pullNum}
                                    </CText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.userInfoCard}>
                            {detailData?.isUnassigned ? (
                                getUnassignedCard()
                            ) : (
                                <EmployeeItem
                                    item={detailData}
                                    showContact
                                    showWorkingDays
                                    containerHeight={E_CARD_HEIGHT}
                                    navigation={navigation}
                                    isClickable={false}
                                />
                            )}
                        </View>
                    </ScrollView>
                    {checkToShowBottomButtons(selectedSubType, isEnabledTakeOrder, detailData, selectedDay) && (
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.goBack()
                                }}
                                style={styles.reBtnCancel}
                            >
                                <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                            </TouchableOpacity>
                            {
                                <TouchableOpacity
                                    onPress={() => {
                                        onSaveClick({
                                            detailData,
                                            selectedSubType,
                                            selectedDay,
                                            isEnabledTakeOrder,
                                            updatePullNumFromCustomerView,
                                            existedDayAbbr,
                                            allWeekData,
                                            dropDownRef,
                                            setIsLoading,
                                            navigation,
                                            orderDays,
                                            setIsErrorShow,
                                            lineCodeMap,
                                            allDayAbbr,
                                            fullDayNameArr
                                        })
                                    }}
                                    style={[styles.reBtnSave]}
                                >
                                    <CText style={[styles.textSave]}>{t.labels.PBNA_MOBILE_SAVE}</CText>
                                </TouchableOpacity>
                            }
                        </View>
                    )}
                </View>
            </SafeAreaView>
            <SubTypeModal
                subTypeArray={subTypeArray}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    checkClick(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType()
                }}
                updateVisitSubType={() => {
                    updateVisitSubType()
                }}
            />
            <Modal animationType="fade" transparent visible={weekModalVisible}>
                <TouchableOpacity activeOpacity={1} style={styles.centeredView}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalView, styles.tModalView]}>
                            <View style={styles.modalPadding}>
                                <View style={[styles.modalTitle, styles.tModalTitle]}>
                                    <CText style={styles.tModalTitleText}>
                                        {t.labels.PBNA_MOBILE_RECURRING_VISIT_DAY}
                                    </CText>
                                    <TouchableOpacity
                                        hitSlop={commonStyle.hitSlop}
                                        onPressOut={() => {
                                            onDoneClick()
                                        }}
                                    >
                                        <CText style={styles.tDoneBtn}>{t.labels.PBNA_MOBILE_DONE}</CText>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.modalContent}>
                                    <Picker
                                        selectedValue={selectedDay}
                                        onValueChange={(itemValue) =>
                                            onPickChange(itemValue, setSelectedDay, detailData, setIsVisitDayChanged)
                                        }
                                        itemStyle={styles.pickerItem}
                                    >
                                        {fullDayNameArr.map((day) => {
                                            return <Picker.Item key={day.key} label={day.label} value={day.key} />
                                        })}
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={refreshData}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default RecurringVisitDetail
