/**
 * @description Visit or store list component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-03
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import Utils from '../../common/DateTimeUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import CCheckBox from '../../../common/components/CCheckBox'
import UserAvatar from '../common/UserAvatar'
import VisitCardFooter from './VisitCardFooter'
import VisitActionBlock from './VisitActionBlock'
import VisitTimelineBlock from './VisitTimelineBlock'
import VisitSubTypeBlock from './VisitSubTypeBlock'
import SalesSubTypeBlock from './SalesSubTypeBlock'
import VisitAddedButton from './VisitAddedButton'
import { calculateOrderDetails, getShipmentFromSoup } from '../../utils/MerchandiserUtils'
import _ from 'lodash'
import { CommonParam } from '../../../common/CommonParam'
import { Locale } from '../../enums/i18n'
import { getAdHocNewImage, getManagerAdHocNewImage } from '../manager/helper/VisitHelper'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { renderStoreIcon } from '../rep/customer/CustomerListTile'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const gotoStore = (isVisitList, navigation, item) => {
    if (isVisitList) {
        navigation.navigate('VisitDetail', {
            item: item
        })
    }
}

export const goToCustomerDetail = (navigation, accountId) => {
    navigation.navigate('CustomerDetailScreen', {
        customer: {
            AccountId: accountId
        },
        barInitialPosition: { x: 300, y: 0 },
        tab: 'PROFILE',
        readonly: true
    })
}

const goToVisitDetails = (navigation, item) => {
    navigation.navigate('VisitDetails', {
        item: item
    })
}

const styles = StyleSheet.create({
    ...commonStyle,

    boxWithShadow: {
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22,
        shadowColor: '#004C97',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.17,
        elevation: 5,
        shadowRadius: 10,
        borderRadius: 6,
        marginBottom: 17
    },
    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        paddingTop: 26,
        paddingBottom: 26,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    columnContainer: {
        flexGrow: 1,
        flexDirection: 'column'
    },
    rowContainer: {
        flexGrow: 1,
        flexDirection: 'row'
    },
    box: {
        overflow: 'hidden',
        borderRadius: 6
    },
    boxContentTouch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContent: {
        alignItems: 'flex-end',
        flex: 0.2,
        flexDirection: 'column'
    },
    userInfo: {
        alignItems: 'flex-end',
        flex: 0.4,
        flexDirection: 'column'
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column'
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    imgNew: {
        width: 45,
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    borderBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    borderMMModalBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    imgCircle: {
        width: 20,
        height: 20
    },
    location: {
        shadowColor: 'rgba(108, 12, 195, 0.8)',
        borderColor: 'rgba(108, 12, 195, 0.8)',
        borderWidth: 0,
        borderTopWidth: 0,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5
    },

    imageGroup: {
        marginRight: 15,
        position: 'relative'
    },
    status: {
        position: 'absolute',
        bottom: 0,
        height: 22,
        width: 22,
        right: 0
    },
    checkBoxItem: {
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        marginRight: -10
    },
    eImgPortrait: {
        width: 20,
        height: 20,
        borderRadius: 4
    },
    userNameText: {
        fontSize: 12,
        borderRadius: 4
    },
    nameText: {
        textAlign: 'right',
        fontSize: 12,
        color: '#565656'
    },
    addressUse: {
        fontSize: 12,
        color: '#565656'
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    },
    addressUseSub: {
        fontSize: 12,
        color: '#565656',
        marginTop: 0
    },
    marginTop5: {
        marginTop: 5
    }
})

interface VisitCardProps {
    navigation?: any
    item?: any
    isVisitList?: boolean
    addVisits?: any
    withOutIcon?: boolean
    onlyShowOrder?: boolean
    withoutCallIcon?: boolean
    fromEmployeeSchedule?: boolean
    managerDetail?: boolean
    onPress?: Function
    fromManagerDetail?: boolean
    fromMyDayEESchedule?: boolean
    fromMMModal?: boolean
    notShowTimeCard?: boolean
    hasUserInfo?: boolean
    fromSMap?: boolean
    showSubTypeBlock?: boolean
    isAddVisit?: boolean
    hideFooter?: boolean
    handleCustomerSchedulePress?: any
    showSalesSubTypeBlock?: any
    notShowStatus?: any
    enableGotoCustomerDetail?: boolean
    isSales?: boolean
    isVisitDetail?: boolean
    retailStoreDetail?: object
}

const renderUserInfo = (item) => {
    return (
        <View style={styles.userInfo}>
            <UserAvatar
                userStatsId={item.UserStatsId}
                firstName={item.FirstName}
                lastName={item.LastName}
                avatarStyle={styles.eImgPortrait}
                userNameText={styles.userNameText}
            />
            <View style={styles.marginTop5}>
                {item.FirstName && (
                    <CText numberOfLines={1} style={styles.nameText}>
                        {item.FirstName}
                    </CText>
                )}
                <CText numberOfLines={1} style={styles.nameText}>
                    {item.LastName}
                </CText>
            </View>
        </View>
    )
}

const getVisitIcon = (item) => {
    if (item.status === 'Complete') {
        return <Image style={styles.status} source={require('../../../../assets/image/icon_checkmark_circle.png')} />
    } else if (['In Progress', 'inProgress'].includes(item.status)) {
        return <Image style={styles.status} source={require('../../../../assets/image/icon-location-current.png')} />
    }
    return null
}

const VisitCard = (props: VisitCardProps) => {
    const {
        navigation,
        item,
        isVisitList,
        addVisits,
        withOutIcon,
        showSubTypeBlock,
        withoutCallIcon,
        fromEmployeeSchedule,
        fromMyDayEESchedule,
        managerDetail,
        onlyShowOrder,
        notShowStatus,
        onPress,
        fromMMModal,
        notShowTimeCard,
        hasUserInfo,
        fromSMap,
        hideFooter,
        handleCustomerSchedulePress,
        enableGotoCustomerDetail,
        showSalesSubTypeBlock,
        isSales,
        isVisitDetail = false,
        retailStoreDetail
    } = props
    const [deliveryInfo, setDeliveryInfo] = useState({
        visitId: null,
        haveOpenStatus: false,
        haveDelivery: false,
        totalCertified: 0,
        totalDelivered: 0,
        totalOrdered: 0
    })
    const [visitSubtypes, setVisitSubtypes] = useState([])
    const [plusNum, setPlusNum] = useState(0)
    const { dropDownRef } = useDropDown()
    const ManagerAdHocNew = getManagerAdHocNewImage()
    const AdHocNew = getAdHocNewImage()

    const handlePress = () => {
        if (fromSMap) {
            return false
        }
        if (enableGotoCustomerDetail && !_.isEmpty(item.AccountId)) {
            goToCustomerDetail(navigation, item.AccountId)
        }
        if (!fromEmployeeSchedule && !managerDetail) {
            gotoStore(isVisitList, navigation, item)
            return
        }
        if ((fromEmployeeSchedule || fromMMModal) && item.isEdit) {
            onPress && onPress()
            return
        }
        goToVisitDetails(navigation, item)
    }

    useEffect(() => {
        const subtypes = item.Visit_Subtype__c
        if (subtypes?.length > 0) {
            const newList = subtypes.split(';')
            setVisitSubtypes(newList)
            setPlusNum(newList.length - 1)
        } else {
            setVisitSubtypes([])
        }
        if (!hideFooter) {
            getShipmentFromSoup([item], item.Planned_Date__c)
                .then((result: any[]) => {
                    const orderDetails = calculateOrderDetails(item, result)
                    setDeliveryInfo(orderDetails)
                })
                .catch((err) => {
                    dropDownRef.current.alertWithType(
                        'error',
                        'Something Wrong Visit Card',
                        ErrorUtils.error2String(err)
                    )
                })
        }
    }, [item])

    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    handleCustomerSchedulePress ? handleCustomerSchedulePress() : handlePress()
                }}
            >
                <View style={[!isSales && styles.boxWithShadow, item.inLocation && isVisitList && styles.location]}>
                    <View style={styles.box}>
                        <View
                            style={[
                                styles.boxContent,
                                isVisitList && item.status === 'Complete' && !notShowStatus && styles.complete
                            ]}
                        >
                            {item.showNew && (
                                <ManagerAdHocNew
                                    style={styles.imgNew}
                                    width={CommonParam.locale === Locale.fr ? 82 : 45}
                                    height={22}
                                />
                            )}
                            {item.showNewHollow && (
                                <AdHocNew
                                    style={styles.imgNew}
                                    width={CommonParam.locale === Locale.fr ? 82 : 45}
                                    height={22}
                                />
                            )}
                            <View style={[styles.imageGroup, fromMyDayEESchedule && { alignSelf: 'flex-start' }]}>
                                {renderStoreIcon(retailStoreDetail, isVisitDetail, false, styles.iconXXL)}

                                {!withOutIcon && !notShowStatus && getVisitIcon(item)}
                            </View>
                            <>
                                <View style={[styles.boxContentTextArea, hasUserInfo && { flex: 1.1 }]}>
                                    <View style={styles.rowWithCenter}>
                                        <View style={styles.contentText}>
                                            <CText numberOfLines={2} ellipsizeMode="tail" style={styles.itemTile}>
                                                {item.name}
                                            </CText>
                                        </View>
                                    </View>
                                    <View style={styles.rowWithCenter}>
                                        <View style={styles.contentText}>
                                            <CText
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={[styles.itemSubTile, hasUserInfo && styles.addressUse]}
                                            >
                                                {item.address}
                                            </CText>
                                            <CText style={[styles.itemSubTile, hasUserInfo && styles.addressUseSub]}>
                                                {item.cityStateZip}
                                            </CText>
                                        </View>
                                    </View>
                                </View>

                                <VisitActionBlock
                                    item={item}
                                    isVisitList={isVisitList}
                                    withoutCallIcon={withoutCallIcon}
                                    hasUserInfo={hasUserInfo}
                                />
                                {hasUserInfo && renderUserInfo(item)}
                                {item.isEdit && (
                                    <CCheckBox
                                        onPress={() => onPress && onPress()}
                                        checked={item.select}
                                        containerStyle={styles.checkBoxItem}
                                    />
                                )}
                                <VisitAddedButton isVisitList={isVisitList} addVisits={addVisits} item={item} />
                            </>
                        </View>
                        <SalesSubTypeBlock item={item} showSalesSubTypeBlock={showSalesSubTypeBlock} />

                        <VisitSubTypeBlock
                            item={item}
                            onlyShowOrder={onlyShowOrder}
                            showSubTypeBlock={showSubTypeBlock}
                            isVisitList={isVisitList}
                            visitSubtypes={visitSubtypes}
                            plusNum={plusNum}
                        />
                        {!hideFooter && (
                            <VisitCardFooter
                                item={item}
                                fromMMModal={fromMMModal}
                                isVisitList={isVisitList}
                                haveDelivery={deliveryInfo.haveDelivery}
                                haveOpenStatus={deliveryInfo.haveOpenStatus}
                                fromEmployeeSchedule={fromEmployeeSchedule}
                                deliveryInfo={deliveryInfo}
                            />
                        )}

                        <VisitTimelineBlock
                            item={item}
                            notShowTimeCard={notShowTimeCard}
                            fromEmployeeSchedule={fromEmployeeSchedule}
                            isVisitList={isVisitList}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default VisitCard
