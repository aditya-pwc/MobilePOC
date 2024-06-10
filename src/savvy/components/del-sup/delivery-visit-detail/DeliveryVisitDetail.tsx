/*
 * @Description: DeliveryVisitDetail
 * @Author: Yi Li
 * @Date: 2021-12-21 20:29:51
 * @LastEditTime: 2024-03-08 09:39:27
 * @LastEditors: Yi Li
 */

import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import Accordion from 'react-native-collapsible/Accordion'
import { getTimeFromMins } from '../../../common/DateTimeUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { getLatestData } from '../../../service/SyncService'
import { getRound } from '../../../utils/CommonUtils'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import CText from '../../../../common/components/CText'
import VisitDuration from '../../common/VisitDuration'
import { renderContent, renderHeader, renderTab } from '../../merchandiser/DeliveryInformation'
import DeliveryLogo, { ACCORDION_TYPE, INDICATOR_TYPE } from '../../merchandiser/DeliveryLogo'
import VisitCard from '../../merchandiser/VisitCard'
import DeliveryVisitActivity from './DeliveryVisitActivity'
import { getDeliveryVisitDetailData, getDeliveryVisitDetail } from './DeliveryVisitDetailHelper'
import DriverCard from './DriverCard'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'

const styles = StyleSheet.create({
    ...commonStyle,
    marginTop21: {
        minHeight: 180,
        paddingHorizontal: 22
    },
    statisticsTitleStyle: {
        color: '#565656',
        fontSize: 12,
        marginBottom: 4
    },
    statisticsColumnStyle: {
        flex: 1,
        alignItems: 'flex-start',
        paddingVertical: 15
    },
    statisticsSubTitleStyle: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16
    },
    statisticsSubTitleRight: {
        marginRight: 10
    },
    statisticsSubTitleContain: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellContainStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 23
    },
    sumView: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 70
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 30
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3'
    },
    driverCardContain: {
        marginTop: -57
    },
    visitCardContain: {
        marginTop: -35
    },
    clockContainer: {
        width: 164,
        height: 50,
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    clockImg: {
        width: 22,
        height: 22
    },
    clockContent: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20
    },
    clockTime: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 12
    },
    clockStatus: {
        fontWeight: '400'
    },
    lineView: {
        height: 16,
        width: 1,
        marginHorizontal: 5,
        backgroundColor: '#D3D3D3'
    },
    clockContain: {
        alignItems: 'flex-end',
        paddingHorizontal: 22,
        marginTop: 30
    },
    activityIndicatorStyle: {
        marginLeft: 20,
        marginRight: 'auto'
    },
    flexBox: {
        display: 'flex'
    },
    hiddenBox: {
        display: 'none'
    }
})

interface DeliveryVisitDetailProps {
    route
    navigation
}

export const renderStatisticsColumn = (key: string, value: string, valueView?: any) => {
    return (
        <View style={styles.statisticsColumnStyle}>
            <CText style={styles.statisticsTitleStyle}>{key}</CText>
            {!valueView && <CText style={styles.statisticsSubTitleStyle}>{value}</CText>}
            {valueView}
        </View>
    )
}

export const renderStatisticsCell = (
    leftKey: string,
    leftValue: string,
    rightKey: string,
    rightValue: string,
    valueView?: any
) => {
    return (
        <View style={styles.cellContainStyle}>
            {renderStatisticsColumn(leftKey, leftValue)}
            {renderStatisticsColumn(rightKey, rightValue, valueView)}
        </View>
    )
}

const renderValueView = (
    leftValue: string,
    unitOfLeft: string,
    rightValue: string,
    unitOfRignt: string,
    hasIcon?: boolean
) => {
    return (
        <View style={styles.statisticsSubTitleContain}>
            <CText style={styles.statisticsSubTitleStyle}>
                {leftValue} {unitOfLeft}
            </CText>
            <View style={styles.lineView} />
            <CText style={[styles.statisticsSubTitleStyle, styles.statisticsSubTitleRight]}>
                {rightValue} {unitOfRignt}{' '}
            </CText>
            {hasIcon && <DeliveryLogo type={INDICATOR_TYPE.RED} />}
        </View>
    )
}

const DeliveryVisitDetail = (props: DeliveryVisitDetailProps) => {
    const { route, navigation } = props
    const currentVisit = route?.params?.item || {}
    const showBack = route?.params?.showBack
    const { dropDownRef } = useDropDown()
    const [visitInfo, setVisitInfo] = useState(Object)
    const [orderTotal, setOrderTotal] = useState(Object)
    const [shipmentTotal, setShipmentTotal] = useState(Object)
    const [shipmentTab, setShipmentTab] = useState(ACCORDION_TYPE.PALLET)
    const [visitTab, setVisitTab] = useState(showBack ? ACCORDION_TYPE.DELIVERY_INFO : ACCORDION_TYPE.VISIT)
    const [palletData, setPalletData] = useState([])
    const [packageData, setPackageData] = useState([])
    const [exceptionData, setExceptionData] = useState([])
    const [exceptionActiveSections, setExceptionActiveSections] = useState([])
    const [activeSections, setActiveSections] = useState([])
    const [loading, setLoading] = useState(true)

    const useMemoWithVisitInfo = (component) => useMemo(() => component, [visitInfo])

    useEffect(() => {
        getLatestData()
            .catch(() => {})
            .finally(() => {
                getDeliveryVisitDetail(currentVisit.Id, currentVisit.storeId, currentVisit.Planned_Date__c)
                    .then((res) => {
                        setOrderTotal(res.orderTotal)
                        setShipmentTotal(res.shipmentTotal)
                    })
                    .catch((err) => {
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_DELIVERY_VISIT_DETAIL,
                            err
                        )
                    })

                getDeliveryVisitDetailData(currentVisit)
                    .then((result) => {
                        if (!result) {
                            return
                        }
                        setPalletData(result.palletData)
                        setPackageData(result.packageData)
                        setExceptionData(result.exceptionData)
                        setVisitInfo(result.currentVisitInfo)
                    })
                    .catch((err) => {
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_DELIVERY_VISIT_DETAIL,
                            err
                        )
                    })
                setLoading(false)
            })
    }, [])

    const onClose = () => {
        navigation.goBack()
    }

    const onClickTab = (type) => {
        setShipmentTab(type)
        setActiveSections([])
    }
    const onClickVisitTab = (type) => {
        setVisitTab(type)
        setActiveSections([])
    }
    const updateSections = (currentSections) => {
        setActiveSections(currentSections)
    }
    const updateExpSections = (currentSections) => {
        setExceptionActiveSections(currentSections)
    }

    const renderDeliveryInfo = () => {
        if (visitTab !== ACCORDION_TYPE.DELIVERY_INFO) {
            return <></>
        }

        return (
            <View>
                <Accordion
                    containerStyle={styles.accordionContain}
                    keyExtractor={(item, index) => item + index}
                    sections={exceptionData}
                    expandMultiple
                    activeSections={exceptionActiveSections}
                    renderHeader={(content, index, isActive) => {
                        return renderHeader(content, index, isActive, ACCORDION_TYPE.DELIVERY_INFO)
                    }}
                    renderContent={(section) => {
                        return renderContent(section, ACCORDION_TYPE.DELIVERY_INFO, {})
                    }}
                    onChange={updateExpSections}
                />
                <View style={styles.tabContainer}>
                    {renderTab(
                        ACCORDION_TYPE.PALLET,
                        onClickTab,
                        shipmentTab,
                        t.labels.PBNA_MOBILE_PALLET.toUpperCase()
                    )}
                    {renderTab(
                        ACCORDION_TYPE.PACKAGE,
                        onClickTab,
                        shipmentTab,
                        t.labels.PBNA_MOBILE_PACKAGE.toUpperCase()
                    )}
                </View>
                <Accordion
                    containerStyle={[styles.accordionContain, { marginBottom: 100 }]}
                    keyExtractor={(item, index) => item + index}
                    sections={shipmentTab === ACCORDION_TYPE.PACKAGE ? packageData : palletData}
                    expandMultiple
                    activeSections={activeSections}
                    renderHeader={(content, index, isActive) => {
                        return renderHeader(content, index, isActive, shipmentTab)
                    }}
                    renderContent={(section) => {
                        return renderContent(section, shipmentTab, {})
                    }}
                    onChange={updateSections}
                />
            </View>
        )
    }

    return (
        <ScrollView style={styles.greyBox}>
            <View style={[styles.marginTop21, styles.rowWithCenter]}>
                <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_DELIVERY_DETAILS}</CText>
                {loading && <ActivityIndicator style={styles.activityIndicatorStyle} />}

                <TouchableOpacity
                    onPress={() => {
                        if (showBack) {
                            route?.params?.onPressBack && route?.params?.onPressBack()
                        }
                        onClose()
                    }}
                >
                    <Image style={styles.iconLarge} source={ImageSrc.ICON_IOS_CLOSE_OUTLINE} />
                </TouchableOpacity>
            </View>

            <View style={styles.sumView}>
                <View style={styles.visitCardContain}>
                    <VisitCard
                        navigation={navigation}
                        item={{ ...visitInfo, AccountId: currentVisit.AccountId || visitInfo.accountId }}
                        isVisitList={false}
                        addVisits={false}
                        enableGotoCustomerDetail
                    />
                </View>
                {renderStatisticsCell(
                    t.labels.PBNA_MOBILE_PLANNED_DATE,
                    formatWithTimeZone(visitInfo.Planned_Date__c, `${TIME_FORMAT.MMMDDY}`, true, false),
                    t.labels.PBNA_MOBILE_PLANNED_DURATION,
                    getTimeFromMins(visitInfo.Planned_Duration)
                )}
                {renderStatisticsCell(
                    t.labels.PBNA_MOBILE_PLANNED_TIME,
                    formatWithTimeZone(visitInfo.PlannedVisitStartTime, `${TIME_FORMAT.HHMMA}`, true, false),
                    t.labels.PBNA_MOBILE_SCHE_QTY,
                    '',
                    renderValueView(
                        orderTotal.PalletCount,
                        t.labels.PBNA_MOBILE_PLT.toLowerCase(),
                        getRound(orderTotal.TotalOrdered, '0'),
                        t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()
                    )
                )}
                {renderStatisticsCell(
                    t.labels.PBNA_MOBILE_ACTUAL_TIME,
                    formatWithTimeZone(visitInfo.ActualVisitStartTime, `${TIME_FORMAT.HHMMA}`, true, false),
                    t.labels.PBNA_MOBILE_DELIVERY_QUANTITY,
                    '',
                    shipmentTotal.isShipmentEmpty ? (
                        <CText style={styles.statisticsSubTitleStyle}>-</CText>
                    ) : (
                        renderValueView(
                            shipmentTotal.PalletCount,
                            t.labels.PBNA_MOBILE_PLT.toLowerCase(),
                            getRound(shipmentTotal.TotalDelivered, '0'),
                            t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase(),
                            shipmentTotal.TotalDelivered < orderTotal.TotalOrdered
                        )
                    )
                )}
                {
                    <View style={styles.cellContainStyle}>
                        {renderStatisticsColumn(
                            t.labels.PBNA_MOBILE_RETURNS,
                            '',
                            renderValueView(
                                getRound(orderTotal.TotalReturnsCs, '0'),
                                t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase(),
                                getRound(orderTotal.TotalReturnsUn, '0'),
                                t.labels.PBNA_MOBILE_ORDER_UN.toLocaleLowerCase()
                            )
                        )}
                    </View>
                }
            </View>
            {visitInfo.UserId && (
                <View style={styles.driverCardContain}>
                    <DriverCard
                        navigation
                        firstName={visitInfo.FirstName}
                        lastName={visitInfo.LastName}
                        userStatsId={visitInfo.UserStatsId}
                        roleFlag={visitInfo?.FT_EMPLYE_FLG_VAL__c}
                        roleTitle={visitInfo.Title}
                        localRout={visitInfo.LocalRoute}
                        nationalId={visitInfo.NationalId}
                        phoneString={visitInfo.MobilePhone}
                    />
                </View>
            )}
            <View style={styles.clockContain}>{useMemoWithVisitInfo(<VisitDuration visit={visitInfo} />)}</View>
            <View style={styles.tabContainer}>
                {renderTab(ACCORDION_TYPE.VISIT, onClickVisitTab, visitTab, t.labels.PBNA_MOBILE_VISIT_ACTIVITY)}
                {renderTab(ACCORDION_TYPE.DELIVERY_INFO, onClickVisitTab, visitTab, t.labels.PBNA_MOBILE_DELIVERY_INFO)}
            </View>

            <View style={visitTab === ACCORDION_TYPE.VISIT ? styles.flexBox : styles.hiddenBox}>
                <DeliveryVisitActivity visit={visitInfo} />
            </View>

            <View style={visitTab === ACCORDION_TYPE.DELIVERY_INFO ? styles.flexBox : styles.hiddenBox}>
                {renderDeliveryInfo()}
            </View>
        </ScrollView>
    )
}

export default DeliveryVisitDetail
