/*
 * @Author: Matthew Huang
 * @Note: Story #2261392
 * @Date: 2022-06-16 15:08:59
 * @LastEditors: Mary Qian
 * @LastEditTime: 2023-10-23 17:28:13
 */
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import { restApexCommonCall } from '../../api/SyncUtils'
import { Styles as deliveryMapModalStyles } from './DeliveryMapModal'
import IMG_PEPSICO from '../../../../assets/image/Icon-store-placeholder.svg'
import { t } from '../../../common/i18n/t'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { getFTPT } from '../../utils/MerchManagerUtils'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import CText from '../../../common/components/CText'
import UserAvatar from '../common/UserAvatar'
import { BetterRowMsgPhoneView } from '../manager/common/RowMsgPhoneView'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { DropDownType } from '../../enums/Manager'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { VisitStatus } from '../../enums/Visit'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Log } from '../../../common/enums/Log'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface DeliveryRouteProps {
    route: any
    navigation: any
}

const screenHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    ...deliveryMapModalStyles,

    topContainer: {
        backgroundColor: baseStyle.color.bgGray,
        height: 150,
        paddingHorizontal: 22,
        paddingTop: 53,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    storeTitleContainer: {
        justifyContent: 'center',
        width: 267
    },
    deliveryBox: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        width: '100%',
        marginTop: 5,
        marginBottom: 45
    },
    statusImage: {
        height: 20,
        width: 20
    },
    detailText: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    textBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginRight: 20
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    boxHeader: {
        marginBottom: 15,
        flexDirection: 'row',
        alignSelf: 'flex-start'
    },
    fontBolder: {
        fontWeight: '900',
        fontSize: 24
    },
    bottomContainer: {
        backgroundColor: 'white',
        paddingTop: 70,
        zIndex: -1
    },
    storeTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginLeft: 10
    },
    card: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: 'white',
        padding: 15,
        marginTop: 25,
        borderRadius: 6,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.17,
        shadowRadius: 10,
        elevation: 5
    },
    verticalDividingLine: {
        flex: 1,
        marginTop: 5,
        width: 2,
        backgroundColor: '#D3D3D3',
        marginBottom: -40
    },
    boxFooter: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        paddingTop: 11,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    statusBox: {
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 24,
        alignSelf: 'stretch'
    },
    fillScrollTop: {
        backgroundColor: baseStyle.color.bgGray,
        height: screenHeight,
        position: 'absolute',
        top: -screenHeight,
        left: 0,
        right: 0
    },
    Black_12_400_text: {
        fontSize: 12,
        fontWeight: '400'
    },
    loading: {
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    column: {
        flexDirection: 'column'
    },
    phoneStyle: {
        marginTop: 10,
        marginRight: 5
    },
    backgroundWhite: {
        backgroundColor: 'white'
    }
})

const DeliveryStatusMap = {
    [VisitStatus.PUBLISHED]: ImageSrc.ICON_GREY_CIRCLE,
    [VisitStatus.IN_PROGRESS]: ImageSrc.ICON_LOCATION_CURRENT,
    [VisitStatus.COMPLETE]: ImageSrc.ICON_CHECKMARK_CIRCLE,
    haveMerchVisit: ImageSrc.ICON_BLUE_CIRCLE
}

const driverCard = (item) => (
    <View style={styles.card}>
        <View style={styles.userAvatar}>
            <UserAvatar
                userStatsId={item.userStatsId}
                firstName={item.firstName}
                lastName={item.lastName}
                avatarStyle={styles.imgUserImage}
                userNameText={{ fontSize: 16 }}
            />
        </View>
        <View style={[styles.itemContentContainer]}>
            <CText style={styles.userName} numberOfLines={1}>
                {item.userName}
            </CText>
            <View style={styles.textBox}>
                <CText style={styles.detailText}>
                    {getFTPT({ item: { title: item.userTitle, ftFlag: item.ftPtLabel } })}
                </CText>
                <CText style={styles.detailText} numberOfLines={1}>
                    {item.userTitle}
                </CText>
            </View>
        </View>
        <View style={styles.phoneStyle}>
            {BetterRowMsgPhoneView(item.phoneNumber, false, styles.imgMsgSize, styles.imgCallSize)}
        </View>
    </View>
)

const deliveryCard = (item, isLastOne = false) => {
    const detailAddress = (item.address || '') + '\n' + item.cityStateZip

    return (
        <View style={styles.deliveryBox}>
            <View style={styles.statusBox}>
                <Image style={styles.statusImage} source={item.deliveryStatus} />
                <View style={[styles.verticalDividingLine, isLastOne && { marginBottom: 0 }]} />
            </View>
            <View style={styles.column}>
                <View style={styles.rowCenter}>
                    <IMG_PEPSICO />
                    <View style={styles.storeTitleContainer}>
                        <CText style={styles.storeTitle} numberOfLines={2}>
                            {item.retailStoreName}
                        </CText>
                        <CText style={[styles.baseGrayTitleStyle, styles.storeSubTitle]}>{detailAddress}</CText>
                    </View>
                </View>
                <View style={[styles.boxFooter]}>
                    <View style={styles.carBox}>
                        <Image style={styles.CarImg} source={ImageSrc.TAB_DELIVERY} />
                        {item.deliveredAT && (
                            <CText style={styles.Black_12_400_text}>
                                {t.labels.PBNA_MOBILE_IP_DELIVERED +
                                    ' ' +
                                    formatWithTimeZone(item.deliveredAT, TIME_FORMAT.HHMMA, true, true)}
                            </CText>
                        )}
                        {!item.deliveredAT && item.expectedDeliverDate && (
                            <CText style={styles.Black_12_400_text}>
                                {t.labels.PBNA_MOBILE_SCHEDULED +
                                    ' ' +
                                    formatWithTimeZone(item.expectedDeliverDate, TIME_FORMAT.HHMMA, true, true)}
                            </CText>
                        )}
                    </View>
                    <View>
                        <View style={styles.flexRowAlignCenter}>
                            <CText style={styles.black_12}>{t.labels.PBNA_MOBILE_QTY} </CText>
                            <CText style={[styles.timeText, styles.font_700]}>
                                {item.scheduleQtyPLT || '-'} {t.labels.PBNA_MOBILE_PLT.toLowerCase()}
                            </CText>
                            <CText style={styles.line}> | </CText>
                            <CText style={[styles.timeText, styles.font_700]}>
                                {item.scheduleQtyCS || '-'} {t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}
                            </CText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

function DeliveryRouteView({ deliveryInfo, goBack, children }: any) {
    return (
        <ScrollView style={styles.backgroundWhite}>
            <View style={styles.fillScrollTop} />
            <View style={styles.topContainer}>
                <View style={[commonStyle.rowWithCenter]}>
                    <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_DELIVERY_ROUTE_TITLE}</CText>
                    <TouchableOpacity onPress={goBack}>
                        <Image style={commonStyle.iconLarge} source={ImageSrc.ICON_IOS_CLOSE_OUTLINE} />
                    </TouchableOpacity>
                </View>
                <View>{driverCard(deliveryInfo)}</View>
            </View>
            <View style={[styles.bottomContainer, { minHeight: screenHeight - 150 }]}>{children}</View>
        </ScrollView>
    )
}

const DeliveryRoute: React.FC<any> = ({ route, navigation }: DeliveryRouteProps) => {
    const { dropDownRef } = useDropDown()

    const { deliveryInfo, setDeliveryRouteVisible } = route.params

    const [fetchData, setFetchData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Expected to have at least one route for current story
    const { userTitle, ftPtLabel } = fetchData[0] || {}

    const requestBody = {
        strDate: deliveryInfo.Planned_Date__c,
        lstUserId: [deliveryInfo.VisitorId],
        strLocationId: CommonParam.userLocationId,
        idMerch: CommonParam.userId
    }

    const parseDeliveryRoute = (data) => {
        const items = JSON.parse(data)[deliveryInfo.VisitorId]
        items.forEach((item) => {
            if (item.haveMerchVisit && item.deliveryVisitStatus !== VisitStatus.IN_PROGRESS) {
                item.deliveryStatus = DeliveryStatusMap.haveMerchVisit
            } else {
                item.deliveryStatus = DeliveryStatusMap[item.deliveryVisitStatus]
            }
        })
        setIsLoading(false)
        setFetchData(items)
    }

    useEffect(() => {
        NetInfo.fetch().then((state) => {
            if (!state.isInternetReachable && deliveryInfo.Planned_Date__c === todayDateWithTimeZone(true)) {
                AsyncStorage.getItem('delivery_route')
                    .then((data) => {
                        parseDeliveryRoute(data)
                    })
                    .catch((err) => {
                        storeClassLog(Log.MOBILE_ERROR, 'DeliveryRoute.useEffect1', ErrorUtils.error2String(err))
                        dropDownRef.current.alertWithType(
                            DropDownType.ERROR,
                            t.labels.PBNA_MOBILE_DELIVERY_ROUTE_TITLE,
                            ErrorUtils.error2String(err)
                        )
                    })
            } else if (!_.isEmpty(deliveryInfo?.Planned_Date__c) && !_.isEmpty(deliveryInfo?.VisitorId)) {
                restApexCommonCall('getDeliveryRoute', 'POST', requestBody)
                    .then(({ data }) => {
                        parseDeliveryRoute(data)
                    })
                    .catch((err) => {
                        storeClassLog(Log.MOBILE_ERROR, 'DeliveryRoute.useEffect2', ErrorUtils.error2String(err))
                        if (deliveryInfo.Planned_Date__c === todayDateWithTimeZone(true)) {
                            dropDownRef.current.alertWithType(
                                DropDownType.ERROR,
                                t.labels.PBNA_MOBILE_DELIVERY_ROUTE_TITLE,
                                ErrorUtils.error2String(err)
                            )
                        }
                    })
            }
        })
    }, [])

    return (
        <DeliveryRouteView
            deliveryInfo={{
                userTitle,
                ftPtLabel,
                ...deliveryInfo
            }}
            goBack={() => {
                navigation.goBack()
                setDeliveryRouteVisible && setDeliveryRouteVisible(false)
            }}
        >
            {isLoading && <ActivityIndicator style={styles.loading} />}
            <FlatList
                data={fetchData}
                renderItem={({ item, index }) => {
                    return <View key={item.visitId + index}>{deliveryCard(item, index === fetchData.length - 1)}</View>
                }}
            />
        </DeliveryRouteView>
    )
}

export default DeliveryRoute
