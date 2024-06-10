/*
 * @Description: SDLVisitDetails
 * @Author: Matthew Huang
 * @Date: 2021-12-21 20:29:51
 * @LastEditTime: 2024-01-04 15:02:47
 * @LastEditors: Mary Qian
 */
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { getTimeFromMins } from '../../../common/DateTimeUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType, OrderDetailType } from '../../../enums/Manager'
import { RecordTypeEnum } from '../../../enums/RecordType'
import { VisitStatus } from '../../../enums/Visit'
import { t } from '../../../../common/i18n/t'
import { SoupService } from '../../../service/SoupService'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import CText from '../../../../common/components/CText'
import VisitDuration from '../../common/VisitDuration'
import { renderTab } from '../../merchandiser/DeliveryInformation'
import { ACCORDION_TYPE } from '../../merchandiser/DeliveryLogo'
import VisitCard from '../../merchandiser/VisitCard'
import DeliveryVisitActivity from '../../del-sup/delivery-visit-detail/DeliveryVisitActivity'
import { BetterSalesCard } from '../SalesCard'
import { styles } from './SDLVisitDetailsStyle'
import { getLatestData } from '../../../service/SyncService'
import SDLOrderInfo from './SDLOrderInfo'
import SwipDeliveryCard from '../../merchandiser/SwipDeliveryCard'
import ScheduleQuery from '../../../queries/ScheduleQuery'
import { formatString } from '../../../utils/CommonUtils'
import Loading from '../../../../common/components/Loading'
import { Log } from '../../../../common/enums/Log'
import { getVisitSubtypes } from '../../manager/helper/VisitHelper'
import { formatReturnsData, getApeOrderSummary } from '../../../helper/manager/OrderHelper'
import { renderStatisticsCell } from '../../del-sup/delivery-visit-detail/DeliveryVisitDetail'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface SDLVisitDetailsProps {
    route
    navigation
}

const getRelatedVisitDetail = {
    retrieve: async (placeId, plannedDate, visitorId) => {
        const field = ['id', 'duration', 'recordTypeDeveloperName', 'pullNum', 'subtypes', 'plannedCases']
        const query = `
        SELECT
            {Visit:Id},
            {Visit:Planned_Duration_Minutes__c},
            {Visit:RecordType.DeveloperName},
            {Visit:Pull_Number__c},
            {Visit:Visit_Subtype__c},
            {Visit:Cases_Goal_Quantity__c}
        FROM {Visit}
        WHERE 
            {Visit:PlaceId} = '${placeId}'
        AND {Visit:VisitorId} = '${visitorId}'
        AND {Visit:Planned_Date__c} = '${plannedDate}'
        AND {Visit:Status__c} != '${VisitStatus.CANCELLED}'
        AND {Visit:Status__c} != '${VisitStatus.PLANNED}' 
        AND {Visit:Status__c} != '${VisitStatus.REMOVED}'
        AND {Visit:Status__c} != 'Failed'`
        return SoupService.retrieveDataFromSoup('Visit', {}, field, query)
    }
}

const handleVisitDetail = (res, currentVisit) => {
    let visitDetailData: any = {}
    if (res.length > 0) {
        const visit = res[0]
        visitDetailData = {
            status: visit.Status__c,
            OwnerId: visit.VisitorId,
            Id: visit.Id,
            startTime: visit.ActualVisitStartTime,
            inLocation: currentVisit.Check_In_Location_Flag__c,
            UserName: visit.UserName,
            ActualVisitStartTime: visit.ActualVisitStartTime,
            ActualVisitEndTime: visit.ActualVisitEndTime,
            name: visit.AccountName,
            address: visit.Street,
            cityStateZip: `${visit.City || ''}, ${visit.State || ''}, ${visit.PostalCode || ''} `,
            AccountPhone: visit.AccountPhone,
            storeLocation: visit.Store_Location__c,
            AccountId: visit.AccountId
        }
    }

    return visitDetailData
}

const RenderPullNum: React.FC<any> = ({ pullNum }) => {
    const text = pullNum ? 'P' + parseInt(pullNum) : ''
    return (
        <View style={[styles.flexRow, styles.flexSelectRow, styles.marginBottom_30, { borderBottomWidth: 0 }]}>
            <View style={styles.flexDirectionRow}>
                <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_PULL_POSITION}</CText>
            </View>
            <View style={[styles.flexRowAlignCenter]}>
                <CText style={[styles.selectLabel, styles.selectValue]}>{text}</CText>
            </View>
        </View>
    )
}

const RenderVisitTypeView: React.FC<any> = ({ showOrderView, showMerchView }) => {
    const renderItems = (() => {
        if (showOrderView && showMerchView) {
            return [t.labels.PBNA_MOBILE_TAKE_ORDER, t.labels.PBNA_MOBILE_MERCHANDISING]
        }
        if (showOrderView) {
            return [t.labels.PBNA_MOBILE_TAKE_ORDER]
        }
        if (showMerchView) {
            return [t.labels.PBNA_MOBILE_MERCHANDISING]
        }
        return []
    })()
    return (
        <View>
            <View style={styles.flexDirectionRow}>
                <CText style={styles.typeLabel}>{t.labels.PBNA_MOBILE_VISIT_TYPE}</CText>
            </View>
            <View style={styles.marginBottom20}>
                <View style={styles.selectedContainer}>
                    {renderItems.map((item, index) => {
                        return (
                            <View style={styles.subtypeCell} key={`${item + index}`}>
                                <CText>{item}</CText>
                            </View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

const RenderSubtypeView = ({ subtypes }: { subtypes: string[] }) => {
    return (
        <View>
            <View style={styles.flexDirectionRow}>
                <CText style={styles.typeLabel}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
            </View>
            {!_.isEmpty(subtypes) && (
                <View style={[styles.selectedContainer]}>
                    {subtypes?.map((item) => {
                        return (
                            <View style={styles.subtypeCell} key={JSON.stringify(item)}>
                                <CText>{getVisitSubtypes()?.filter((subType) => subType.id === item)[0]?.name}</CText>
                            </View>
                        )
                    })}
                </View>
            )}
        </View>
    )
}

const RenderSwipDeliveryCard = ({ visit, navigation }: any) => {
    return (
        <View style={styles.alignItemsCenter}>
            <SwipDeliveryCard visit={visit} navigation={navigation} />
        </View>
    )
}

const RenderOrderStatView: React.FC<any> = ({ plannedCases, casesSold, returns }) => {
    const formatNumberWithCS = (value: string) =>
        value !== '-' ? parseFloat(value) + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}` : value
    return (
        <View style={styles.orderStateContainer}>
            <View style={styles.casesContainer}>
                <CText style={[styles.subTitle, styles.marginBottom_4]}>{t.labels.PBNA_MOBILE_PLANNED_CASES}</CText>
                <CText style={styles.instructionsText}>
                    {plannedCases != null
                        ? plannedCases + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`
                        : '0' + ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`}
                </CText>
            </View>
            <View style={styles.casesSoldContainer}>
                <CText style={[styles.subTitle, styles.marginBottom_4]}>{t.labels.PBNA_MOBILE_CASES_SOLD}</CText>
                <CText style={styles.instructionsText}>{formatNumberWithCS(casesSold || '-')}</CText>
            </View>
            <View style={styles.flex_1}>
                <CText style={[styles.subTitle, styles.marginBottom_4]}>{t.labels.PBNA_MOBILE_RETURNS}</CText>
                <CText style={styles.instructionsText}>{formatReturnsData(returns)}</CText>
            </View>
        </View>
    )
}

const initialVisitData = (visitData, visitId, setSalesData, setMerchData) => {
    const salesVisit = visitData.find(
        (item) => item.recordTypeDeveloperName === RecordTypeEnum.SALES && item.id === visitId
    )
    !_.isEmpty(salesVisit) && setSalesData({ hasSalesVisit: true, ...salesVisit })

    const merchVisit = visitData.find((item) => item.recordTypeDeveloperName === RecordTypeEnum.MERCHANDISING)
    !_.isEmpty(merchVisit) &&
        setMerchData({ hasMerchVisit: true, ...merchVisit, subtypes: merchVisit.subtypes?.split(';') })
}

const SDLVisitDetails: React.FC<SDLVisitDetailsProps> = ({ route, navigation }) => {
    /**
     *  Param route?.params?.item.id should be a sales visit
     *  currentVisit require: Id, VisitorId, Planned_Date__c, storeId ...
     */
    const [loading, setLoading] = useState(true)
    const currentVisit = route?.params?.item || {}
    const visitorId = currentVisit.VisitorId
    currentVisit.storeId = currentVisit.storeId || currentVisit.PlaceId
    const [salesData, setSalesData] = useState({ hasSalesVisit: false, duration: null, plannedCases: null })
    const [merchData, setMerchData] = useState({ hasMerchVisit: false, duration: null, subtypes: [], pullNum: 0 })
    const [fetchOrderStat, setFetchOrderStat] = useState({ casesSold: '-', returns: '-' })
    const [currentVisitDetail, setCurrentVisitDetail] = useState(currentVisit)
    // Init data
    const showOrderView = salesData.hasSalesVisit // True if a sales visit exist
    const showMerchView = merchData.hasMerchVisit
    const duration = showMerchView ? merchData.duration : salesData.duration
    const { dropDownRef } = useDropDown()
    const [visitTab, setVisitTab] = useState(ACCORDION_TYPE.VISIT)

    useEffect(() => {
        getLatestData()
            .catch((error) => {
                storeClassLog(Log.MOBILE_ERROR, 'SDLVisitDetails.getLatestData', getStringValue(error))
            })
            .finally(() => {
                Promise.all([
                    getApeOrderSummary(currentVisit.Id, OrderDetailType.VISIT)
                        .then((res) => setFetchOrderStat(JSON.parse(res.data)))
                        .catch((err) => {
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                t.labels.PBNA_MOBILE_SDL_VISIT_DETAILS_ORDERS,
                                err
                            )
                        }),

                    getRelatedVisitDetail
                        .retrieve(currentVisit.storeId, currentVisit.Planned_Date__c, visitorId)
                        .then((visitData) => initialVisitData(visitData, currentVisit.Id, setSalesData, setMerchData))
                        .catch((err) => {
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                t.labels.PBNA_MOBILE_SDL_VISIT_DETAILS,
                                err
                            )
                        }),

                    SoupService.retrieveDataFromSoup(
                        'Visit',
                        {},
                        ScheduleQuery.retrieveVisitDetailsData.f,
                        formatString(ScheduleQuery.retrieveVisitDetailsData.q, [currentVisit.Id])
                    )
                        .then((res) => {
                            const visitDetailData = handleVisitDetail(res, currentVisit)
                            setCurrentVisitDetail({ ...visitDetailData, ...currentVisit })
                        })
                        .catch((err) => {
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                t.labels.PBNA_MOBILE_SDL_VISIT_DETAIL_DATA,
                                err
                            )
                        })
                ]).finally(() => {
                    setLoading(false)
                })
            })
    }, [])

    const onClose = () => {
        navigation.goBack()
    }

    const onClickVisitTab = (type) => {
        setVisitTab(type)
    }

    if (loading) {
        return (
            <>
                <Loading isLoading={loading} />
            </>
        )
    }

    return (
        <ScrollView style={styles.greyBox}>
            {/* <Loading isLoading={loading} /> */}
            <View style={[styles.marginTop21, styles.rowWithCenter]}>
                <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_VISIT_DETAILS}</CText>
                {loading && <ActivityIndicator style={styles.activityIndicatorStyle} />}
                <TouchableOpacity onPress={onClose}>
                    <Image
                        style={styles.iconLarge}
                        source={require('../../../../../assets/image/ios-close-circle-outline.png')}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.sumView}>
                <View style={styles.visitCardContain}>
                    <VisitCard navigation={navigation} item={currentVisitDetail} enableGotoCustomerDetail hideFooter />
                </View>
                {renderStatisticsCell(
                    t.labels.PBNA_MOBILE_PLANNED_DATE, // Render Planned Date and Duration
                    formatWithTimeZone(currentVisit?.Planned_Date__c, `${TIME_FORMAT.MMMDDY}`, true, false),
                    showMerchView ? t.labels.PBNA_MOBILE_PLANNED_DURATION : '',
                    showMerchView ? getTimeFromMins(duration) : ''
                )}
                <View style={styles.paddingHorizontal}>
                    <RenderVisitTypeView showOrderView={showOrderView} showMerchView={showMerchView} />
                    {showOrderView && (
                        <RenderOrderStatView
                            plannedCases={salesData.plannedCases}
                            casesSold={fetchOrderStat.casesSold}
                            returns={fetchOrderStat.returns}
                        />
                    )}
                    {showMerchView && <RenderSubtypeView subtypes={merchData.subtypes} />}
                    {showMerchView && <RenderPullNum pullNum={merchData.pullNum} />}
                </View>
            </View>
            <BetterSalesCard userId={visitorId} boxStyle={styles.driverCardContain} />
            <RenderSwipDeliveryCard visit={currentVisitDetail} navigation={navigation} />
            <View style={styles.clockContain}>
                <VisitDuration visit={currentVisitDetail} />
            </View>
            <View style={styles.tabContainer}>
                {renderTab(ACCORDION_TYPE.VISIT, onClickVisitTab, visitTab, t.labels.PBNA_MOBILE_VISIT_ACTIVITY)}
                {renderTab(
                    ACCORDION_TYPE.ORDER_INFO,
                    onClickVisitTab,
                    visitTab,
                    t.labels.PBNA_MOBILE_ORDER_INFO.toUpperCase()
                )}
            </View>

            <View style={visitTab === ACCORDION_TYPE.VISIT ? styles.flexBox : styles.hiddenBox}>
                <DeliveryVisitActivity visit={currentVisitDetail} isFromSDLVisitDetail />
            </View>
            {visitTab === ACCORDION_TYPE.ORDER_INFO && (
                <SDLOrderInfo visitInfo={{ ...currentVisitDetail, type: OrderDetailType.VISIT }} />
            )}
        </ScrollView>
    )
}

export default SDLVisitDetails
