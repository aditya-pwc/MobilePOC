/**
 * @description Delivery Route Modal
 * @author Sheng Huang
 * @date 2024-02-19
 */

import React, { FC, Ref, useImperativeHandle, useRef, useState } from 'react'
import FullScreenModal, { FullScreenModalRef } from '../../../savvy/components/rep/lead/common/FullScreenModal'
import { t } from '../../../common/i18n/t'
import InternalContactTile from '../../../savvy/components/rep/lead/contact-tab/InternalContactTile'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { renderCenterInfo, renderStoreIcon } from './CustomerCard'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { formatWithTimeZone } from '../../../savvy/utils/TimeZoneUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import ChevronSvg from '../../../../assets/image/ios-chevron.svg'
import MerchSvg from '../../../../assets/image/icon_merchandiser.svg'
import DeliveryLogo, { INDICATOR_TYPE } from '../../../savvy/components/merchandiser/DeliveryLogo'
import { getRouteListData, geUserCardData, syncDownRouteInfo } from '../../service/RouteInfoService'
import { VisitStatus } from '../../enum/VisitType'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { NavigationProp } from '@react-navigation/native'
import { getTimeFromMins } from '../../../savvy/common/DateTimeUtils'
import { getVisitSubTypeStr } from '../../../savvy/utils/MerchManagerUtils'
import _ from 'lodash'

interface DeliveryRouteModalProps {
    cRef: Ref<FullScreenModalRef>
    navigation: NavigationProp<any>
}

export type VisitType = 'Delivery' | 'Merchandising' | 'Sales'

const styles = StyleSheet.create({
    deliveryBox: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        flex: 1,
        marginTop: 30
    },
    statusBox: {
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 24,
        alignSelf: 'stretch'
    },
    statusImage: {
        height: 20,
        width: 20
    },
    verticalDividingLine: {
        flex: 1,
        marginTop: 5,
        width: 2,
        backgroundColor: '#D3D3D3',
        marginBottom: -25
    },
    customerCardContainer: {
        paddingVertical: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray
    },
    customerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexGrow: 1
    },
    iconXXL: {
        width: 58,
        height: 58
    },
    imageGroup: {
        marginRight: 15,
        position: 'relative',
        alignSelf: 'flex-start'
    },
    boxFooter: {
        marginTop: 11,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    CarImg: {
        width: 24,
        height: 16,
        marginRight: 7
    },
    Black_12_400_text: {
        fontSize: 12,
        fontWeight: '400'
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    black_12: {
        fontSize: 12,
        color: '#000000'
    },
    timeText: {
        fontSize: 12,
        color: '#000',
        fontWeight: 700
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    deliveryListContainer: {
        backgroundColor: 'white',
        width: '100%',
        zIndex: -1,
        marginTop: -84,
        paddingVertical: 84
    },
    deliverTimeFontStyle: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    chevronStyle: {
        transform: [{ rotate: '90deg' }],
        left: 5
    },
    subtype: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black,
        marginRight: 5
    },
    splitLine: {
        color: baseStyle.color.liteGrey,
        fontSize: baseStyle.fontSize.fs_12,
        marginRight: 5
    },
    orderTakenStyle: {
        color: baseStyle.color.white,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    orderTakenPill: {
        backgroundColor: '#2DD36F',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        marginTop: -2,
        marginRight: 5
    },
    orderStyle: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_bold
    },
    orderPill: {
        borderWidth: 1,
        borderColor: baseStyle.color.titleGray,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: -2,
        marginRight: 5
    }
})

const RouteInfoModal: FC<DeliveryRouteModalProps> = (props: DeliveryRouteModalProps) => {
    const { cRef, navigation } = props
    const modalRef = useRef<FullScreenModalRef>(null)
    const [user, setUser] = useState([])
    const [sectionList, setSectionList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [visitType, setVisitType] = useState<VisitType>('Sales')

    const retrieveData = async (userId: string, selectedDate: string, visitType: VisitType) => {
        const userInfo = await geUserCardData(userId, visitType)
        setUser(userInfo)
        const listData = await getRouteListData(userId, selectedDate, visitType)
        setSectionList(listData)
    }

    const onClose = () => {
        setUser([])
        setSectionList([])
        modalRef.current?.closeModal()
    }

    useImperativeHandle(cRef, () => ({
        openModal: async (userId: string, selectedDate: string, visitType: VisitType) => {
            setIsLoading(true)
            setVisitType(visitType)
            modalRef.current?.openModal()
            try {
                await retrieveData(userId, selectedDate, visitType)
                await syncDownRouteInfo(userId, selectedDate, visitType)
                await retrieveData(userId, selectedDate, visitType)
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'openDeliveryRouteModal', ErrorUtils.error2String(e))
            } finally {
                setIsLoading(false)
            }
        },
        closeModal: () => onClose()
    }))

    const calcOrderPill = (item) => {
        return (
            visitType === 'Sales' &&
            (item?.Visit?.Delivery_Date__c || item?.Visit?.Delivery_Date2__c || item?.Visit?.Delivery_Date3__c) &&
            !item?.Order?.exist
        )
    }

    const renderCustomer = (item) => {
        const { subtypeString, subtypeNumString } = getVisitSubTypeStr(item?.Visit?.Visit_Subtype__c)
        return (
            <TouchableOpacity
                style={styles.customerCardContainer}
                onPress={() => {
                    modalRef.current?.closeModal()
                    navigation?.navigate('DeliveryVisitDetail', {
                        navigation,
                        item: {
                            Id: item?.Visit?.Id || '',
                            storeId: item?.RetailStore?.Id || '',
                            Planned_Date__c: item?.Visit?.Planned_Date__c || '',
                            AccountId: item?.RetailStore?.AccountId || ''
                        },
                        showBack: true,
                        onPressBack: () => {
                            modalRef.current?.openModal()
                        }
                    })
                }}
                disabled={visitType !== 'Delivery'}
            >
                <View style={styles.customerContainer}>
                    <View style={styles.imageGroup}>{renderStoreIcon(item.RetailStore, styles.iconXXL)}</View>
                    <View style={{ flex: 1 }}>
                        {renderCenterInfo({
                            StoreName: item.RetailStore?.Name,
                            CustUniqId: item.RetailStore?.['Account.CUST_UNIQ_ID_VAL__c'],
                            ...item.RetailStore
                        })}
                        {visitType !== 'Delivery' && (
                            <View style={{ flexDirection: 'row' }}>
                                <CText numberOfLines={1} style={styles.subtype}>
                                    {subtypeString}
                                    {subtypeNumString}
                                </CText>
                                {!_.isEmpty(subtypeString) && item?.Visit?.Pull_Number__c && (
                                    <CText style={styles.splitLine}>|</CText>
                                )}
                                {item?.Visit?.Pull_Number__c && (
                                    <CText numberOfLines={1} style={[styles.subtype, { marginRight: 10 }]}>
                                        P{item?.Visit?.Pull_Number__c}
                                    </CText>
                                )}
                                {visitType === 'Sales' && item?.Order?.exist && (
                                    <View style={styles.orderTakenPill}>
                                        <CText style={styles.orderTakenStyle}>{t.labels.PBNA_MOBILE_ORDER_TAKEN}</CText>
                                    </View>
                                )}
                                {calcOrderPill(item) && (
                                    <View style={styles.orderPill}>
                                        <CText style={styles.orderStyle}>{t.labels.PBNA_MOBILE_ORDER}</CText>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                    {visitType === 'Delivery' && <ChevronSvg width={16} height={26} style={styles.chevronStyle} />}
                </View>
            </TouchableOpacity>
        )
    }

    const renderDeliveryFooter = (item) => {
        return (
            <View style={[styles.boxFooter]}>
                <View style={{ flexDirection: 'row' }}>
                    <Image style={styles.CarImg} source={ImageSrc.TAB_DELIVERY} />
                    <CText style={styles.Black_12_400_text}>
                        {formatWithTimeZone(item.Visit.PlannedVisitStartTime, TIME_FORMAT.HHMMA, true, false)}
                    </CText>
                </View>
                <View>
                    <View style={styles.flexRowAlignCenter}>
                        <CText style={styles.black_12}>{t.labels.PBNA_MOBILE_SCHEDULED_QTY} </CText>
                        <CText style={[styles.timeText]}>
                            {item.Order.plt || '-'} {t.labels.PBNA_MOBILE_PLT.toLowerCase()}
                        </CText>
                        <CText style={styles.line}> | </CText>
                        <CText style={[styles.timeText]}>
                            {item.Order.cs || '-'} {t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}
                        </CText>
                        {item.Issue && <DeliveryLogo type={INDICATOR_TYPE.RED} />}
                    </View>
                </View>
            </View>
        )
    }

    const renderMerchFooter = (item) => {
        return (
            <View style={[styles.boxFooter]}>
                <View style={{ flexDirection: 'row' }}>
                    <MerchSvg width={24} height={24} style={[styles.CarImg, { marginTop: -5 }]} />
                    <CText style={styles.Black_12_400_text}>
                        {formatWithTimeZone(item.Visit.PlannedVisitStartTime, TIME_FORMAT.HHMMA, true, false)}
                    </CText>
                </View>
            </View>
        )
    }

    const renderFooter = (item) => {
        switch (visitType) {
            case 'Delivery':
                return renderDeliveryFooter(item)
            case 'Merchandising':
                return renderMerchFooter(item)
            case 'Sales':
            default:
        }
    }

    const renderStatusIcon = (status) => {
        switch (status) {
            case VisitStatus.PUBLISHED:
                return ImageSrc.ICON_BLUE_CIRCLE
            case VisitStatus.IN_PROGRESS:
                return ImageSrc.ICON_LOCATION_CURRENT
            case VisitStatus.COMPLETE:
                return ImageSrc.ICON_CHECKMARK_CIRCLE
            default:
                return ''
        }
    }

    const renderTimeText = (item) => {
        switch (item.Visit.Status__c) {
            case VisitStatus.PUBLISHED:
                return ''
            case VisitStatus.IN_PROGRESS:
                return `${t.labels.PBNA_MOBILE_STARTED_AT} ${formatWithTimeZone(
                    item.Visit.ActualVisitStartTime,
                    TIME_FORMAT.HHMMA,
                    true,
                    false
                )}`
            case VisitStatus.COMPLETE:
                switch (visitType) {
                    case 'Delivery':
                        return `${t.labels.PBNA_MOBILE_DELIVERED_AT} ${formatWithTimeZone(
                            item.Visit.ActualVisitEndTime,
                            TIME_FORMAT.HHMMA,
                            true,
                            false
                        )}`
                    case 'Merchandising':
                    case 'Sales':
                        return `${t.labels.PBNA_MOBILE_COMPLETED} ${formatWithTimeZone(
                            item.Visit.ActualVisitEndTime,
                            TIME_FORMAT.HHMMA,
                            true,
                            false
                        )} ｜ ${getTimeFromMins(item.Visit.Actual_Duration_Minutes__c)}`
                    default:
                        return
                }
            default:
                return ''
        }
    }

    const renderVisitCard = (item) => {
        return (
            <View style={styles.deliveryBox} key={item.Visit.Id}>
                <View style={styles.statusBox}>
                    <Image style={styles.statusImage} source={renderStatusIcon(item.Visit.Status__c)} />
                    <View style={[styles.verticalDividingLine]} />
                </View>
                <View style={{ flex: 1 }}>
                    <CText style={styles.deliverTimeFontStyle}>{renderTimeText(item)}</CText>
                    {renderCustomer(item)}
                    {renderFooter(item)}
                </View>
            </View>
        )
    }

    const calcTitle = () => {
        switch (visitType) {
            case 'Delivery':
                return t.labels.PBNA_MOBILE_DELIVERY_ROUTE_TITLE
            case 'Merchandising':
                return t.labels.PBNA_MOBILE_MERCHANDISING_ROUTE
            case 'Sales':
                return t.labels.PBNA_MOBILE_SALES_ROUTE
            default:
        }
    }

    return (
        <FullScreenModal
            cRef={modalRef}
            title={calcTitle()}
            closeButton
            scrollView
            backgroundColor={'#F2F4F7'}
            isLoading={isLoading}
            onClose={onClose}
        >
            <InternalContactTile item={user} isRoute />
            <View style={styles.deliveryListContainer}>
                {sectionList.map((item) => {
                    return renderVisitCard(item)
                })}
            </View>
        </FullScreenModal>
    )
}

export default RouteInfoModal
