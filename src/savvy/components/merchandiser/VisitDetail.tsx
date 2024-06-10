/* eslint-disable camelcase */
/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    Image,
    ImageBackground,
    Modal,
    NativeAppEventEmitter,
    ScrollView,
    TouchableOpacity,
    View,
    StyleSheet
} from 'react-native'
import { Button } from 'react-native-elements'
import VisitCard from './VisitCard'
import 'moment-timezone'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import CheckInModal from './CheckInModal'
import CheckOutModal from './CheckOutModal'
import { SoupService } from '../../service/SoupService'
import LocationService, { getInLocation } from '../../service/LocationService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { visitStyle } from './VisitStyle'
import moment from 'moment'
import { VisitStatus } from '../../enums/Visit'
import { calculateServiceTime, getEvents, updateStartGap } from '../../utils/MerchandiserUtils'
import VisitOverview from './VisitOverview'
import { Instrumentation } from '@appdynamics/react-native-agent'
import VisitCustomer from './VisitCustomer'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import { isTrueInDB } from '../../utils/CommonUtils'
import { recordAMASLogs } from '../../service/AMASService'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import { restDataCommonCall } from '../../api/SyncUtils'
import { setupDurationAlert, showAlertInVisitDetail } from './MyVisitTab/InAppNoti'
import CustomerMyStoreTab from '../rep/customer/CustomerMyStoreTab'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { rebuildObjectDepth } from '../../utils/SoupUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CustomerContractTab from '../rep/customer/CustomerContractTab'
import { useGetRetailStore } from '../../hooks/MerchandiserHooks'
import { isCurrentVlPastAndShiftUser } from '../../helper/merchandiser/MyVisitDataHelper'
import { MOMENT_STARTOF } from '../../../common/enums/MomentStartOf'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { useCustomerDetail } from '../../hooks/CustomerHooks'
import { useDispatch } from 'react-redux'
import _ from 'lodash'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import PushOrderBar from '../../../orderade/component/visits/PushOrderBar'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { IntervalTime } from '../../enums/Contract'

interface VisitDetailPros {
    props
    route
    navigation
}

const scrollThrottle = 20
const tabHeight = 100
const transparentOpc = 0
const untransparentOpc = 1

const isFutureInProgressVisit = (visit) => {
    const visitDate = visit.Planned_Date__c || visit.startTime
    return moment(visitDate).isAfter(moment().endOf(MOMENT_STARTOF.DAY)) && visit.status === VisitStatus.IN_PROGRESS
}

const styles = StyleSheet.create({
    iconSuccessStyle: {
        width: 56,
        height: 53
    },
    chevronIcon: {
        width: 14,
        height: 24
    },
    hitSlopStyle: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    marginTop5: {
        marginTop: -5
    },
    backgroundContainer: {
        backgroundColor: '#f3f4f7'
    },
    alignFlexStart: {
        alignItems: 'flex-start'
    }
})

const getVisitButtonLabel = (vis) => {
    if (vis.status === VisitStatus.COMPLETE) {
        return t.labels.PBNA_MOBILE_VISIT_COMPLETED
    }
    if (CommonParam.visitStatus._soupEntryId === vis._soupEntryId || isFutureInProgressVisit(vis)) {
        return t.labels.PBNA_MOBILE_COMPLETE_VISIT
    }
    return t.labels.PBNA_MOBILE_START_VISIT
}

const checkIsisDisabled = (visit, hasEvent?) => {
    const visitDate = visit.startTime || visit.Planned_Date__c
    if (moment(visitDate).isAfter(moment().endOf(MOMENT_STARTOF.DAY)) && visit.status !== VisitStatus.IN_PROGRESS) {
        return true
    }
    if (isFutureInProgressVisit(visit)) {
        return false
    }

    if (
        visit.status === VisitStatus.PUBLISHED &&
        visitDate < todayDateWithTimeZone(true) &&
        !isCurrentVlPastAndShiftUser()
    ) {
        return true
    }

    const isSameVisit =
        CommonParam.visitStatus._soupEntryId && CommonParam.visitStatus._soupEntryId !== visit._soupEntryId

    const shouldDisabled = CommonParam.inMeeting || hasEvent || isSameVisit || visit.status === VisitStatus.COMPLETE

    if (visit.status === VisitStatus.IN_PROGRESS) {
        if (CommonParam.inMeeting || hasEvent) {
            if (CommonParam.visitStatus._soupEntryId && CommonParam.visitStatus._soupEntryId === visit._soupEntryId) {
                if (visitDate < todayDateWithTimeZone(true)) {
                    return isCurrentVlPastAndShiftUser()
                }
            }
        }
        return shouldDisabled
    }

    return shouldDisabled || CommonParam.visitList.Id !== visit.visitList || CommonParam.shiftStatus !== 'started'
}

const getVisitStatus = (visit) => {
    let status = t.labels.PBNA_MOBILE_NOT_STARTED
    switch (visit.status) {
        case VisitStatus.IN_PROGRESS:
            status = t.labels.PBNA_MOBILE_IN_PROGRESS
            break
        case VisitStatus.COMPLETE:
            status = t.labels.PBNA_MOBILE_COMPLETED
            break
        case VisitStatus.NEW:
            break
        case VisitStatus.PUBLISHED:
            status = t.labels.PBNA_MOBILE_NOT_STARTED
            break
        default:
            status = t.labels.PBNA_MOBILE_NOT_STARTED
            break
    }
    return status
}

const getButtonStyle = (inGeofence) => {
    return inGeofence ? visitStyle.insideLocation : visitStyle.outOfLocation
}

const getTitleStyle = (isDisabled, inGeofence) => {
    return isDisabled ? visitStyle.disabled : getButtonStyle(inGeofence)
}

const getContainerStyle = (inGeofence) => {
    return inGeofence ? visitStyle.insideLocation : visitStyle.shadow
}

const getVisit = (visit) => {
    return SoupService.retrieveDataFromSoup('Visit', {}, [], null, [
        `
        WHERE {Visit:_soupEntryId} = "${visit._soupEntryId}" OR {Visit:Id} = "${visit.Id}" 
        LIMIT 1
   `
    ])
}

export const redefinePositionCoords = (latitude, longitude) => {
    latitude = latitude === 0 ? '0' : latitude
    longitude = longitude === 0 ? '0' : longitude
    if ((latitude && !longitude) || (!latitude && longitude)) {
        latitude = latitude || '0'
        longitude = longitude || '0'
        storeClassLog(
            Log.MOBILE_INFO,
            'redefinePositionCoords',
            'Change latitude or longitude to 0 because one of it is null'
        )
    } else if (!latitude && !longitude) {
        longitude = null
        latitude = null
    }
    return {
        longitude,
        latitude
    }
}

const getVisitWithData = (visit, vis, geofenceStatus, checkinPosition) => {
    return new Promise((resolve, reject) => {
        let visitTmp = null
        let logString = `${!!geofenceStatus}`
        getVisit(visit)
            .then(async (v: any) => {
                visitTmp = v[0]
                v[0].Status__c = VisitStatus.IN_PROGRESS
                v[0].ActualVisitStartTime = new Date().toISOString()
                v[0].Check_Out_Location_Flag__c = false
                const coords = redefinePositionCoords(
                    checkinPosition?.latitude || null,
                    checkinPosition?.longitude || null
                )
                v[0].Check_In_Location__latitude__s = coords.latitude
                v[0].Check_In_Location__longitude__s = coords.longitude
                v[0].Check_In_Location_Flag__c = !!geofenceStatus
                logString += `${v[0].AMAS_Compliant__c} ${JSON.stringify(v[0])}`
                v[0].AMAS_Compliant__c = isTrueInDB(v[0].AMAS_Compliant__c) || !!geofenceStatus
                return SoupService.upsertDataIntoSoup('Visit', [rebuildObjectDepth(v[0])])
            })
            .then((res: any) => {
                recordAMASLogs('getVisitWithData', `${visitTmp.AMAS_Compliant__c}, ${logString}`)
                const obj = {
                    Status__c: visitTmp.Status__c,
                    ActualVisitStartTime: visitTmp.ActualVisitStartTime,
                    Check_In_Location_Flag__c: !!geofenceStatus,
                    AMAS_Compliant__c: isTrueInDB(visitTmp.AMAS_Compliant__c) || !!geofenceStatus,
                    Check_In_Location__latitude__s: visitTmp.Check_In_Location__latitude__s,
                    Check_In_Location__longitude__s: visitTmp.Check_In_Location__longitude__s
                }
                restDataCommonCall(`sobjects/Visit/${visit.id}`, 'PATCH', obj)
                    .then(() => {
                        storeClassLog(
                            Log.MOBILE_INFO,
                            'getVisitWithData update',
                            `update visit ${visit.id}, body: ${JSON.stringify(obj)}`
                        )
                    })
                    .catch((err) => {
                        CommonParam.pendingSync.visitList = true
                        AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-StartVisit',
                            `Network unavailable: ${ErrorUtils.error2String(err)}`
                        )
                        reject(err)
                    })
                resolve(res)
            })
            .then(() => {
                updateStartGap()
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const renderModal = (modalVisible, onPress) => {
    return (
        <Modal transparent visible={modalVisible} onRequestClose={onPress}>
            <TouchableOpacity style={[commonStyle.fullWidth, commonStyle.fullHeight]}>
                <View style={visitStyle.centeredView}>
                    <View style={visitStyle.modalView}>
                        <Image
                            style={styles.iconSuccessStyle}
                            source={require('../../../../assets/image/icon-success.png')}
                        />
                        <CText style={visitStyle.modalText}>{t.labels.PBNA_MOBILE_VISIT_COMPLETED_MSG}</CText>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const renderBackgroundImage = (onPress) => {
    return (
        <ImageBackground
            source={require('../../../../assets/image/PATTERN-BLUE-BG-IMG.png')}
            resizeMode="cover"
            style={[visitStyle.container, { flex: 1 }]}
        >
            <View style={visitStyle.header}>
                <View style={[commonStyle.flex_1, styles.alignFlexStart]}>
                    <TouchableOpacity hitSlop={styles.hitSlopStyle} onPress={onPress}>
                        <Image
                            style={styles.chevronIcon}
                            source={require('../../../../assets/image/ios-chevron-left.png')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}
const renderScrollView = (componentArr, activeTab, onPress) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[commonStyle.flexDirectionRow, styles.marginTop5]}
        >
            <View style={commonStyle.flexDirectionRow}>
                {componentArr.map((value, index) => {
                    return (
                        <TouchableOpacity
                            key={value.name}
                            onPress={() => {
                                onPress && onPress(index)
                            }}
                        >
                            <View style={[visitStyle.tabButton, activeTab === index && visitStyle.isActive]}>
                                <CText style={[visitStyle.tabTitle, activeTab === index && visitStyle.isActive]}>
                                    {value.name}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </ScrollView>
    )
}

const VisitDetail = (parentProps: VisitDetailPros) => {
    const { route, navigation } = parentProps
    let serviceInterval
    let events = []
    const { dropDownRef } = useDropDown()
    const vis = route.params.item
    const contractAndAuditSubTab = route?.params?.subTab
    console.log('vis')
    console.log(vis)

    const [visit, setVisit] = useState(vis)
    const [customerData, setCustomerData] = useState(visit)
    const [modalVisible, setModalVisible] = useState(false)
    const [serviceTime, setServiceTime] = useState(`0 ${t.labels.PBNA_MOBILE_HR} 0 ${t.labels.PBNA_MOBILE_MIN}`)
    const [visitSta, setVisitStatus] = useState(getVisitStatus(visit))
    const [activeTab, setActiveTab] = useState(0)
    const [isDisabled, setIsDisabled] = useState(true)
    const [openWorkOrder, setOpenWorkOrder] = useState(0)
    const [buttonTitle, setButtonTitle] = useState(getVisitButtonLabel(vis))
    const [segmentPositionY, setSegmentPositionY] = useState(0)
    const [statusBarOpacity, setStatusBarOpacity] = useState(0)
    const [refreshFlag, setRefreshFlag] = useState(0)
    const [inGeofence, setInGeofence] = useState(vis.inLocation)
    const [checkinPosition, setCheckinPosition] = useState({
        longitude: null,
        latitude: null
    })
    const dispatch = useDispatch()
    const contractRef = useRef(null)
    const [showContractUploadBar, setShowContractUploadBar] = useState(false)
    const { retailStoreDetail, componentArr } = useGetRetailStore(visit.accountId, refreshFlag)
    useCustomerDetail({ AccountId: vis.accountId }, refreshFlag, dispatch, retailStoreDetail)
    const changeComponent = (index) => {
        if (index === 1) {
            Instrumentation.reportMetric('Merchandiser Planograms BTN', 1)
        }
        setActiveTab(index)
    }

    const breakModal = useRef(null)
    const checkOutModal = useRef(null)
    const [offlineLoading, setOfflineLoading] = useState<boolean>(false)
    const [isMapstedInitial, setIsMapstedInitial] = useState(false)

    const startService = () => {
        setServiceTime(calculateServiceTime(visit, events))
        serviceInterval = setInterval(() => {
            setServiceTime(calculateServiceTime(visit, events))
        }, 60000)
    }
    const endService = () => {
        clearInterval(serviceInterval)
    }

    const checkOutHandler = () => {
        endService()
        navigation.navigate('SignaturePad', {
            item: visit,
            inGeofence: inGeofence,
            checkinPosition: checkinPosition
        })
    }

    const checkInHandler = () => {
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
        } else {
            BreadcrumbsService.startVisit()
            getVisitWithData(visit, vis, inGeofence, checkinPosition)
                .then((res: any) => {
                    setupDurationAlert(visit)
                    visit.ActualVisitStartTime = res[0].ActualVisitStartTime
                    visit.status = VisitStatus.IN_PROGRESS
                    CommonParam.visitStatus = visit
                    if (!_.isEmpty(vis)) {
                        vis.ActualVisitStartTime = res[0].ActualVisitStartTime
                        vis.Status__c = VisitStatus.IN_PROGRESS
                    }
                    setVisit(vis)
                    setVisitStatus(t.labels.PBNA_MOBILE_IN_PROGRESS)
                    setButtonTitle(t.labels.PBNA_MOBILE_COMPLETE_VISIT)
                    setIsDisabled(checkIsisDisabled(visit))
                    startService()
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'MD-StartVisit',
                        `Start Visit Error: ${ErrorUtils.error2String(err)}`
                    )
                    dropDownRef.current.alertWithType(
                        'error',
                        VisitStatus.SOMETHING_WRONG,
                        ErrorUtils.error2String(err)
                    )
                })
        }
    }
    const checkin = () => {
        if (CommonParam.visitStatus._soupEntryId === visit._soupEntryId) {
            if (openWorkOrder > 0) {
                checkOutModal?.current?.openModal()
            } else {
                checkOutHandler()
            }
        } else if (!CommonParam.visitStatus._soupEntryId) {
            if (inGeofence) {
                checkInHandler()
            } else {
                breakModal?.current?.openModal()
            }
        } else if (isFutureInProgressVisit(visit)) {
            checkOutHandler()
        }
    }

    const navigateBack = () => {
        navigation.navigate('My Visits')
    }

    const throttledOnClickPushContract = _.throttle(
        async () => {
            if (offlineLoading) {
                return
            }
            setOfflineLoading(true)
            await contractRef?.current?.onClickPushContract()
        },
        IntervalTime.ONE_THOUSAND,
        { leading: true, trailing: false }
    )

    useEffect(() => {
        LocationService.getCurrentPosition(1000).then((position) => {
            if (position && position.coords) {
                const coords = redefinePositionCoords(position.coords.latitude, position.coords.longitude)
                setCheckinPosition(coords)
                setInGeofence(getInLocation(position, vis))
            } else {
                setCheckinPosition({
                    longitude: null,
                    latitude: null
                })
                setInGeofence(false)
                storeClassLog(Log.MOBILE_WARN, 'GetPositionFailed', `getCurrentPosition: ${JSON.stringify(position)}`)
            }
        })
        const event = NativeAppEventEmitter.addListener('WatchPosition', (cLocation) => {
            setCheckinPosition(cLocation.coords)
            setInGeofence(getInLocation(cLocation, vis))
        })

        SoupService.retrieveDataFromSoup('Account', {}, [], null, [` WHERE {Account:Id}='${visit.accountId}'`]).then(
            (res) => {
                const data = res[0] || null
                setCustomerData(Object.assign({}, vis, data))
            }
        )
        getEvents(visit).then((res) => {
            events = res
            const startedEvent = events.find((e) => e.Actual_End_Time__c == null && e.Actual_Start_Time__c)
            setIsDisabled(checkIsisDisabled(visit, !!startedEvent))
            if (visit.status === VisitStatus.IN_PROGRESS) {
                startService()
                const actualTimeDuration = calculateServiceTime(visit, events, '', false, true)
                showAlertInVisitDetail(visit, actualTimeDuration)
            }
            if (visit.status === VisitStatus.COMPLETE) {
                setServiceTime(calculateServiceTime(visit, events, new Date(visit.ActualVisitEndTime)))
            }
        })
        return () => {
            event.remove()
            clearInterval(serviceInterval)
        }
    }, [visit])

    const onClickVisitDetailBottomBtn = useCallback(_.throttle(checkin, 2000, { leading: true, trailing: false }), [
        visit,
        inGeofence,
        checkinPosition
    ])

    const renderCheckInButton = (inGeofence, isDisabled, buttonTitle) => {
        return (
            <View style={[visitStyle.containerStyle, getContainerStyle(inGeofence)]}>
                <Button
                    onPress={onClickVisitDetailBottomBtn}
                    title={
                        <CText style={[visitStyle.titleStyle, getTitleStyle(isDisabled, inGeofence)]}>
                            {buttonTitle}
                        </CText>
                    }
                    disabled={isDisabled}
                    disabledStyle={visitStyle.disabled}
                    buttonStyle={[visitStyle.buttonStyle, getButtonStyle(inGeofence)]}
                    containerStyle={[getContainerStyle(inGeofence)]}
                    titleStyle={[visitStyle.titleStyle, getTitleStyle(isDisabled, inGeofence)]}
                />
            </View>
        )
    }

    const handleWorkOrderUpdate = (num) => {
        setOpenWorkOrder(num)
    }
    const visitOverview = (
        <VisitOverview
            visit={visit}
            visitSta={visitSta}
            handleWorkOrderUpdate={handleWorkOrderUpdate}
            navigation={navigation}
            route={route}
            serviceTime={serviceTime}
            retailStoreId={customerData.PlaceId}
            storePropertyId={Number(retailStoreDetail?.MapstedPropertyId__c) || 0}
            isMapstedInitial={isMapstedInitial}
            setIsMapstedInitial={setIsMapstedInitial}
        />
    )

    return (
        <View style={[styles.backgroundContainer, commonStyle.flex_1]}>
            {renderModal(modalVisible, () => {
                Alert.alert('Modal has been closed.')
                setModalVisible(!modalVisible)
            })}
            <CheckInModal
                cRef={breakModal}
                navigation={navigation}
                visit={visit}
                checkinPosition={checkinPosition}
                inGeofence={inGeofence}
                onCheckin={() => {
                    checkInHandler()
                }}
            />

            <CheckOutModal
                cRef={checkOutModal}
                navigation={navigation}
                visit={visit}
                checkinPosition={checkinPosition}
                inGeofence={inGeofence}
                onCheckOut={() => {
                    checkOutHandler()
                }}
            />
            <ScrollView
                scrollEventThrottle={scrollThrottle}
                contentInset={{ bottom: 20 }}
                onScroll={(scrollEvent) => {
                    const segmentBottomY = segmentPositionY + tabHeight
                    const offsetY = scrollEvent.nativeEvent.contentOffset.y
                    let statusBarOpc = transparentOpc
                    if (offsetY > segmentBottomY) {
                        statusBarOpc = untransparentOpc
                    }
                    setStatusBarOpacity(statusBarOpc)
                }}
            >
                {renderBackgroundImage(navigateBack)}
                <View
                    style={visitStyle.tab}
                    onLayout={(resEvent) => {
                        setSegmentPositionY(resEvent.nativeEvent.layout.y)
                    }}
                >
                    <View style={visitStyle.headerCard}>
                        <VisitCard
                            retailStoreDetail={retailStoreDetail}
                            navigation={navigation}
                            item={visit}
                            isVisitList={false}
                            addVisits={false}
                            isVisitDetail
                        />
                    </View>
                    {renderScrollView(componentArr, activeTab, (index) => {
                        changeComponent(index)
                    })}
                </View>
                {activeTab === 0 && visitOverview}
                {/* {activeTab === 1 && <VisitCustomer key={2} customDetail={customerData} />} */}
                {/* {activeTab === 2 && (
                    <CustomerMyStoreTab
                        storeTabVisible
                        isOTSCustomer={retailStoreDetail?.['Account.IsOTSCustomer__c']}
                        retailStoreId={customerData.PlaceId}
                        accountId={customerData?.accountId}
                        retailStoreName={customerData.name}
                        customerUniqueVal={customerData.customerId}
                        isOnline={false}
                        storePropertyId={retailStoreDetail?.MapstedPropertyId__c}
                    />
                )} */}
                {/* {activeTab === 3 && (
                    <CustomerContractTab
                        defaultSuTab={contractAndAuditSubTab}
                        refreshFlag={refreshFlag}
                        offlineLoading={offlineLoading}
                        setOfflineLoading={setOfflineLoading}
                        setRefreshFlag={setRefreshFlag}
                        cRef={contractRef}
                        retailStore={{ ...vis, ...retailStoreDetail }}
                        editable
                        setShowContractUploadBar={setShowContractUploadBar}
                    />
                )} */}
            </ScrollView>
            {activeTab === 3 && showContractUploadBar && (
                <View style={visitStyle.pushOrderBarBox}>
                    <PushOrderBar
                        icon={ImageSrc.ICON_PUSH_ORDER}
                        text={
                            `${retailStoreDetail['Account.CUST_UNIQ_ID_VAL__c'] || ''} ` +
                            t.labels.PBNA_MOBILE_CONTRACT_NOT_SUBMITTED
                        }
                        buttonText={t.labels.PBNA_MOBILE_PUSH_ORDER_BUTTON.toLocaleUpperCase()}
                        onPress={throttledOnClickPushContract}
                        disabled={offlineLoading}
                    />
                </View>
            )}
            {renderCheckInButton(inGeofence, isDisabled, buttonTitle)}
            <View style={[visitStyle.statusBarStyle, { opacity: statusBarOpacity }]} />
        </View>
    )
}

export default VisitDetail
