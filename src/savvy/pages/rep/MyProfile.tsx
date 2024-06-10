/**
 * @description My profile page
 * @author Sheng Huang
 * @date 2021/9/24
 */
import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView, SafeAreaView } from 'react-native'
import CText from '../../../common/components/CText'
import { commonStyle } from '../../../common/styles/CommonStyle'
import UserAvatar from '../../components/common/UserAvatar'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { CommonParam } from '../../../common/CommonParam'
import UploadAvatar from '../../components/common/UploadAvatar'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import Loading from '../../../common/components/Loading'
import { useRouteSalesGeo, useUserMobilePhone, useUserStatsId } from '../../hooks/UserHooks'
import { formatPhoneNumber } from '../../utils/MerchManagerUtils'
import _ from 'lodash'
import { t } from '../../../common/i18n/t'
import { Persona, isPersonaKAM } from '../../../common/enums/Persona'

interface MyProfileProps {
    navigation: any
    route: any
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        ...commonStyle.alignCenter,
        position: 'relative',
        marginBottom: 48
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    btnBack: {
        position: 'absolute',
        left: 22
    },
    imgBack: {
        width: 12,
        height: 20
    },
    imgBkgroundView: {
        ...commonStyle.flexRowJustifyCenter
    },
    imgBkground: {
        height: 180,
        ...commonStyle.alignCenter,
        ...commonStyle.fullWidth
    },
    portraitView: {
        position: 'relative',
        marginTop: -40
    },
    imgPortrait: {
        width: 80,
        height: 80,
        alignSelf: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: baseStyle.color.white
    },
    imgCamera: {
        width: 22,
        height: 22,
        position: 'absolute',
        alignSelf: 'center',
        bottom: -10,
        right: -10
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.white,
        marginTop: 20,
        maxWidth: 360
    },
    roleView: {
        flexShrink: 1,
        ...commonStyle.flexRowJustifyCenter,
        marginTop: 4,
        paddingHorizontal: baseStyle.padding.pd_22,
        maxWidth: 220
    },
    roleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.white,
        maxWidth: 260
    },
    locationView: {
        marginTop: 20,
        ...commonStyle.flexRowSpaceBet,
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    location: {
        ...commonStyle.flexRowAlignEnd
    },
    imgAddress: {
        width: 26,
        height: 21,
        marginRight: 8
    },
    lineView: {
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    textColor56: {
        color: '#565656'
    },
    marginBottom30: {
        marginBottom: 30
    },
    marginBottom25: {
        marginBottom: 25
    },
    marginBottom20: {
        marginBottom: 20
    },
    textId: {
        fontWeight: '700',
        width: '40%',
        textAlign: 'right'
    },
    borderView: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    emptyView40: {
        height: 40
    },
    phoneText: {
        marginLeft: 10,
        fontWeight: '700',
        fontSize: 12
    },
    scrollView: {
        paddingHorizontal: '5%',
        paddingTop: 20
    },
    viewAddText: {
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: 12
    }
})

const MyProfile = (props: MyProfileProps) => {
    const { navigation } = props
    const { dropDownRef } = useDropDown()
    const [uploadLoading, setUploadLoading] = useState(false)
    const userStatsId = useUserStatsId()
    const routeNumber = useRouteSalesGeo(CommonParam.userId)
    const mobilePhone = useUserMobilePhone()

    const { FirstName: firstName, LastName: lastName } = CommonParam.userInfo

    const renderId = (v, k, c) => {
        if (k < 5) {
            return (
                <View style={styles.lineView} key={k}>
                    {v.NationalId && (
                        <View style={commonStyle.flexRowSpaceBet}>
                            <CText style={[styles.textColor56, styles.marginBottom30]}>
                                {t.labels.PBNA_MOBILE_NATIONAL_ROUTE_NUMBER}
                            </CText>
                            <CText style={styles.textId}>{v.NationalId}</CText>
                        </View>
                    )}
                    {v.LocalId && (
                        <View style={commonStyle.flexRowSpaceBet}>
                            <CText style={[styles.textColor56, styles.marginBottom25]}>
                                {t.labels.PBNA_MOBILE_LOCAL_ROUTE_NUMBER}
                            </CText>
                            <CText style={styles.textId}>{v.LocalId}</CText>
                        </View>
                    )}
                    {k < c.length - 1 && k !== 5 && <View style={styles.borderView} />}
                </View>
            )
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_MY_PROFILE.toUpperCase()}</CText>
                <TouchableOpacity
                    style={styles.btnBack}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        navigation.goBack()
                    }}
                >
                    <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
            </View>
            <View style={styles.imgBkgroundView}>
                <ImageBackground source={ImageSrc.IMG_BACKGROUND} style={styles.imgBkground}>
                    <View style={styles.portraitView}>
                        <UserAvatar
                            firstName={firstName}
                            lastName={lastName}
                            userStatsId={userStatsId}
                            avatarStyle={styles.imgPortrait}
                            userNameText={{ fontSize: 34 }}
                        />
                        {UploadAvatar({ setUploadLoading, dropDownRef, usId: userStatsId })}
                    </View>
                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                        {CommonParam.userName}
                    </CText>
                    <View style={styles.roleView}>
                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                            {CommonParam.PERSONA__c}
                        </CText>
                        {!_.isEmpty(CommonParam.PERSONA__c) && <CText style={styles.roleText}> | </CText>}
                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                            GPID {CommonParam.GPID__c}
                        </CText>
                    </View>
                    <View style={styles.emptyView40} />
                </ImageBackground>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator>
                <View style={{ marginBottom: 30 }}>
                    <CText style={[styles.sectionTitle, styles.marginBottom20]}>
                        {t.labels.PBNA_MOBILE_EMPLOYEE_DETAILS}
                    </CText>
                    <View style={[styles.lineView, commonStyle.flexRowSpaceBet]}>
                        <CText style={styles.textColor56}>{t.labels.PBNA_MOBILE_WORK_PHONE_NUMBER}</CText>
                        <CText style={styles.phoneText}>{formatPhoneNumber(mobilePhone)}</CText>
                    </View>
                    {(CommonParam.PERSONA__c === Persona.FSR || CommonParam.PERSONA__c === Persona.PSR) &&
                        _.map(routeNumber, renderId)}
                </View>
                {!isPersonaKAM() && (
                    <View style={commonStyle.flexRowSpaceCenter}>
                        <CText style={styles.sectionTitle}>{t.labels.PBNA_MOBILE_LEAD_AND_CUSTOMER_VISIBILITY}</CText>
                        <TouchableOpacity onPress={() => navigation.navigate('LeadCustomerVisibilityScreen')}>
                            <CText style={styles.viewAddText}>
                                {t.labels.PBNA_MOBILE_VIEW}/{t.labels.PBNA_MOBILE_ADD}
                            </CText>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
            <Loading isLoading={uploadLoading} />
        </SafeAreaView>
    )
}

export default MyProfile
