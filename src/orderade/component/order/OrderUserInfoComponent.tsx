import React, { FC } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native'
import _ from 'lodash'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import UserAvatar from '../../../common/components/UserAvatar'
import { CommonParam } from '../../../common/CommonParam'
import { CommonApi } from '../../../common/api/CommonApi'
import PhoneIcon from '../../../common/PhoneIcon'
import MessageIcon from '../../../common/MessageIcon'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import { callByPhone, openSmsUrl, formatPhoneNumber } from '../../utils/CommonUtil'
import { useOrderUserInfo } from '../../hooks/OrderHooks'
import { IntervalTime } from '../../../savvy/enums/Contract'

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    ...commonStyle,
    container: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: baseStyle.color.borderGray,
        padding: 20,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 12,
        maxHeight: 110,
        width: '100%'
    },
    imgAvatar: {
        borderRadius: 8,
        ...commonStyle.size_60
    },
    rowWithCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 35,
        height: 35
    },
    locationIcon: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 35,
        height: 35
    },
    messageIconSize: {
        width: 26,
        height: 24
    },
    iconContent: {
        alignItems: 'flex-end',
        flexDirection: 'column'
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    phoneSize: {
        width: 21,
        height: 23
    },
    userInfoContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    usernameText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    }
})

interface OrderUserInfoComponentProps {
    order: any
}

const OrderUserInfoComponent: FC<OrderUserInfoComponentProps> = (props: OrderUserInfoComponentProps) => {
    const { order } = props
    const { userData } = useOrderUserInfo(order?.Created_By_GPID__c)

    const username = (userData?.FirstName || '') + (userData?.FirstName ? ' ' : '') + (userData?.LastName || '')

    const renderUserWorkStatus = () => {
        return (
            <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                {`${
                    userData?.FT_EMPLYE_FLG_VAL__c?.toString().toLowerCase() === 'true'
                        ? t.labels.PBNA_MOBILE_USER_WORK_STATUS_FT
                        : t.labels.PBNA_MOBILE_USER_WORK_STATUS_TP
                }`}
            </CText>
        )
    }
    return (
        <View style={[styles.container, styles.flexRowSpaceBet, styles.alignItemsCenter]}>
            <View style={[styles.flexDirectionRow, { width: '85%' }]}>
                <UserAvatar
                    url={`${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${userData?.US?.Id}`}
                    firstName={userData?.FirstName}
                    lastName={userData?.LastName}
                    avatarStyle={styles.imgAvatar}
                />
                <View style={[styles.userInfoContainer, { marginLeft: 15 }]}>
                    <CText style={styles.usernameText}>{username}</CText>
                    <View style={[styles.flexRowAlignCenter, { marginVertical: 5 }]}>
                        {renderUserWorkStatus()}
                        {userData?.Title && <View style={styles.vLine} />}
                        {userData?.Title && (
                            <CText
                                numberOfLines={1}
                                style={[styles.font_12_400, styles.colorTitleGray, { maxWidth: screenWidth * 0.46 }]}
                            >
                                {userData?.Title || ''}
                            </CText>
                        )}
                    </View>
                    <View style={[styles.flexRowAlignCenter]}>
                        <View style={[styles.flexDirectionRow]}>
                            <CText style={[styles.font_12_400, styles.colorTitleGray]}>
                                {t.labels.PBNA_MOBILE_SALES_ROUTE}
                            </CText>
                            <CText
                                style={[styles.font_12_400, styles.colorBlack, { maxWidth: screenWidth * 0.1 }]}
                                numberOfLines={1}
                            >
                                {` ${userData?.ETR?.Route__r.LOCL_RTE_ID__c || t.labels.PBNA_MOBILE_NA}`}
                            </CText>
                        </View>
                        {userData?.ETR?.Route__r.GTMU_RTE_ID__c && <View style={styles.vLine} />}
                        {userData?.ETR?.Route__r.GTMU_RTE_ID__c && (
                            <View style={[styles.flexDirectionRow]}>
                                <CText style={[styles.font_12_400, styles.colorTitleGray]} numberOfLines={1}>
                                    {t.labels.PBNA_MOBILE_NATIONAL_ID}
                                </CText>
                                <CText
                                    style={[styles.font_12_400, styles.colorBlack, { maxWidth: screenWidth * 0.1 }]}
                                    numberOfLines={1}
                                >
                                    {` ${
                                        userData?.ETR?.Route__r.GTMU_RTE_ID__c
                                            ? userData?.ETR?.Route__r.GTMU_RTE_ID__c
                                            : t.labels.PBNA_MOBILE_DASH
                                    }`}
                                </CText>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View style={[styles.flexDirectionColumn, styles.alignCenter]}>
                <View style={styles.boxContentTextArea}>
                    <TouchableOpacity
                        disabled={!userData?.MobilePhone}
                        onPress={_.debounce(
                            () => callByPhone(formatPhoneNumber(userData?.MobilePhone)),
                            IntervalTime.FIVE_HUNDRED,
                            {
                                leading: true,
                                trailing: false
                            }
                        )}
                    >
                        <PhoneIcon isDisabled={!userData?.MobilePhone} imageStyle={styles.phoneSize} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={!userData?.MobilePhone}
                        onPress={() => {
                            openSmsUrl(formatPhoneNumber(userData?.MobilePhone))
                        }}
                    >
                        <MessageIcon isDisabled={!userData?.MobilePhone} imageStyle={styles.messageIconSize} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default OrderUserInfoComponent
