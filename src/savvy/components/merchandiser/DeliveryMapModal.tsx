/**
 * @description A modal to ask if the user want to take a lunch or have a break.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-03-21
 * @LastModifiedDate 2021-03-21 First Commit
 */
import React, { useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import TitleModal from '../../../common/components/TitleModal'
import { styles as mapModalStyles } from './MapModal'
import UserAvatar from '../common/UserAvatar'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'
import MyTeamStyle from '../../styles/manager/MyTeamStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { getFTPT } from '../../utils/MerchManagerUtils'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import { baseStyle } from '../../../common/styles/BaseStyle'
import IMG_PEPSICO from '../../../../assets/image/Icon-store-placeholder.svg'
import { styles as managerMapModalStyles } from './ManagerMapModal'
import VisitActionBlock from './VisitActionBlock'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'
import { BetterRowMsgPhoneView } from '../manager/common/RowMsgPhoneView'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'

export const Styles = StyleSheet.create({
    ...MyTeamStyle,
    ...mapModalStyles,
    ...managerMapModalStyles,

    employeeContainer: {
        //  marginTop  34-16
        marginTop: 18,
        height: 80,
        paddingLeft: 22,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 8
    },

    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7
    },
    salesRouteLabel: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        color: '#565656'
    },
    salesRouteSplitLine: {
        marginHorizontal: 4
    },
    salesRouteVal: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        color: '#000000'
    },

    Grey_12_400_text: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    statusIcon: {
        marginRight: 8,
        marginLeft: 15,
        width: 8,
        height: 8,
        backgroundColor: '#FFF',
        borderRadius: 4
    },
    statusText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    marginRight15: {
        marginRight: 15
    },
    marginTop8: {
        marginTop: -6
    },
    tabItemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabButton: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStyle: {
        width: 24,
        height: 24,
        resizeMode: 'stretch'
    },
    callIcon: {
        width: 18,
        height: 19,
        resizeMode: 'stretch'
    },
    tabTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 10
    },
    tabLine: {
        width: 1,
        height: 20,
        backgroundColor: '#D3D3D3'
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center'
    },
    imgUserImage: {
        width: 40,
        height: 40,
        borderRadius: 8
    },

    visitCardBox: {
        width: '100%',
        // visit has style marginBottom: 17 current marginBottom=30-17
        marginBottom: 13
    },
    box: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    innerBox: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 19,
        marginBottom: 19
    },
    userAvatar: {
        position: 'relative'
    },
    phoneStyle: {
        flexDirection: 'row'
    },
    storeImg: {
        width: 58,
        height: 58,
        borderRadius: 29,
        resizeMode: 'stretch'
    },
    boxHeader: {
        marginBottom: 15,
        flexDirection: 'row',
        alignSelf: 'flex-start'
    },
    boxFooter: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        flex: 1,
        paddingBottom: 18,
        paddingTop: 11,
        // width: '100%',
        justifyContent: 'space-between',

        flexDirection: 'row'
    },
    accountWithDeliveryBox: {
        paddingHorizontal: 37,
        width: '100%',
        paddingBottom: 18
    },
    font_700: {
        fontWeight: '700'
    },
    black_12: {
        fontSize: 12,
        color: '#000000'
    },
    carBox: {
        flexDirection: 'row'
    },
    fontSize_18: {
        fontSize: 18
    },
    CarImg: {
        width: 24,
        height: 16,
        marginRight: 7
    },
    imgMsgSize: {
        width: 20,
        height: 19
    },
    imgCallSize: {
        width: 18,
        height: 19
    },
    timeText: {
        fontSize: 12,
        color: '#000'
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    marginRight20: {
        marginRight: 20
    },
    deliveryActiveImg: {
        width: 28,
        height: 20
    }
})

interface DeliveryMapModalProps {
    cRef
    navigation
    visible
    onHideMapModal
    onPressTabIcons?: any
    hideButtonGroup?: any
    modalStyle?: any
    showNationIdAndSalesRoute?: boolean
    isShowRouteTab?: boolean
    onlyShowOrder?: boolean
}

const formatNumberData = (text) => {
    if (text) {
        return text
    }
    return '-'
}

const DeliveryMapModal = (props: DeliveryMapModalProps) => {
    const { visible, navigation, onHideMapModal, modalStyle, cRef } = props

    const [mark, setMarks] = useState({ phoneNumber: null, AccountPhone: null })

    useImperativeHandle(cRef, () => ({
        openModal: (item) => {
            setMarks(item)
        }
    }))

    const employeeInfo = (item) => {
        return (
            <View style={Styles.teamItem_without_border}>
                <View style={Styles.userAvatar}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={Styles.imgUserImage}
                        userNameText={{ fontSize: 16 }}
                    />
                </View>
                <View style={[Styles.itemContentContainer]}>
                    <CText
                        style={[Styles.fontColor_black, Styles.fontWeight_700, Styles.fontSize_18]}
                        numberOfLines={1}
                    >
                        {item.userName}
                    </CText>
                    <View style={[Styles.rowCenter, Styles.marginTop_6, Styles.marginRight_20]}>
                        <CText style={[Styles.fontColor_gary, Styles.fontWeight_400, Styles.fontSize_12]}>
                            {getFTPT({ item: { title: item.userTitle, ftFlag: item.ftPtLabel } })}
                        </CText>
                        <CText
                            style={[Styles.fontColor_gary, Styles.fontWeight_400, Styles.fontSize_12]}
                            numberOfLines={1}
                        >
                            {item.userTitle}
                        </CText>
                    </View>
                </View>
                {CommonParam.PERSONA__c === Persona.MERCHANDISER && (
                    <TouchableOpacity
                        style={Styles.marginRight20}
                        onPress={() => navigation.navigate('DeliveryRoute', { deliveryInfo: item })}
                    >
                        <Image style={Styles.deliveryActiveImg} source={ImageSrc.TAB_DELIVERY_ACTIVE} />
                    </TouchableOpacity>
                )}
                {BetterRowMsgPhoneView(item.phoneNumber, false, Styles.imgMsgSize, Styles.imgCallSize)}
            </View>
        )
    }

    const accountWithDelivery = (item) => {
        const detailAddress = (item.address || '') + '\n' + item.cityStateZip
        return (
            <View style={Styles.accountWithDeliveryBox}>
                {item.deliveredAT && (
                    <View style={[Styles.boxHeader]}>
                        <CText style={Styles.Grey_12_400_text}>
                            {t.labels.PBNA_MOBILE_DELIVERED_AT}{' '}
                            {formatWithTimeZone(item.deliveredAT, TIME_FORMAT.HHMMA, true, true)}
                        </CText>
                    </View>
                )}
                <View style={[commonStyle.flexRowSpaceCenter, commonStyle.fullWidth]}>
                    <View style={commonStyle.flexRowAlignCenter}>
                        <IMG_PEPSICO />
                        <View style={Styles.storeTitleContainer}>
                            <CText style={Styles.storeTitle} numberOfLines={2}>
                                {item.retailStoreName}
                            </CText>
                            <CText style={[Styles.baseGrayTitleStyle, Styles.storeSubTitle]}>{detailAddress}</CText>
                        </View>
                    </View>

                    <VisitActionBlock item={item} isVisitList withoutCallIcon={false} hasUserInfo={false} />
                </View>
                <View style={[Styles.boxFooter]}>
                    <View style={[Styles.carBox]}>
                        {item.expectedDeliverDate && (
                            <>
                                <Image style={Styles.CarImg} source={ImageSrc.TAB_DELIVERY} />
                                <CText style={Styles.black_12}>
                                    {formatWithTimeZone(item.expectedDeliverDate, TIME_FORMAT.HHMMA, true, true)}{' '}
                                </CText>
                            </>
                        )}
                    </View>
                    <View>
                        <View style={[commonStyle.flexRowAlignCenter]}>
                            <CText style={Styles.black_12}>{t.labels.PBNA_MOBILE_SCHEDULED_QTY} </CText>
                            <CText style={[Styles.timeText, Styles.font_700]}>
                                {' '}
                                {formatNumberData(item.scheduleQtyPLT)} {t.labels.PBNA_MOBILE_PLT.toLowerCase()}
                            </CText>
                            <CText style={Styles.line}> | </CText>
                            <CText style={[Styles.timeText, Styles.font_700]}>
                                {formatNumberData(item.scheduleQtyCS)}{' '}
                                {t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}
                            </CText>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <TitleModal
            title={t.labels.PBNA_MOBILE_DELIVERY_INFO}
            modalStyle={modalStyle}
            visible={visible}
            onClose={onHideMapModal}
        >
            <View style={Styles.box}>
                {employeeInfo(mark)}
                {accountWithDelivery(mark)}
            </View>
        </TitleModal>
    )
}

export default DeliveryMapModal
