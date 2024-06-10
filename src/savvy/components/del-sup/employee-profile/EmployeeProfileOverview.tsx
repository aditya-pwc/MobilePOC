/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-09 21:35:58
 * @LastEditTime: 2022-08-16 14:30:15
 * @LastEditors: Aimee Zhang
 */
import React, { useEffect, useRef, useState } from 'react'
import { View, Image, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { t } from '../../../../common/i18n/t'
import UserAvatar from '../../common/UserAvatar'
import SegmentView from './SegmentView'
import { getCustomerDataSDL, getFTPT, refreshView } from '../../../utils/MerchManagerUtils'
import RowMsgPhoneView from '../../manager/common/RowMsgPhoneView'
import OverviewSegmentTab from './OverviewSegmentTab'
import { CommonLabel } from '../../../enums/CommonLabel'
import { isPersonaSDL, isPersonaUGM } from '../../../../common/enums/Persona'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import SDLOverviewSegmentTab from '../../sales/employee-profile/SDLOverviewSegmentTab'
import SortableList from 'react-native-sortable-list'
import SDLVisitSegmentTab from '../../sales/employee-profile/SDLVisitSegmentTab'
import { NavigationRoute } from '../../../enums/Manager'
import { SDLVisitSegmentCell } from '../../sales/employee-profile/SDLVisitSegmentCell'
import SDLMyCustomer from '../../sales/my-customer/SDLMyCustomer'
import Loading from '../../../../common/components/Loading'
import { merchLCodes, salesLCodes } from '../../../helper/manager/MyTeamSDLHelper'
import UploadAvatar from '../../common/UploadAvatar'
import { useDropDown } from '../../../../common/contexts/DropdownContext'

const getTabs = (lineCode, userType, unassignedRoute) => {
    let tabs = [{ title: t.labels.PBNA_MOBILE_OVERVIEW.toUpperCase() }]
    if (salesLCodes.includes(lineCode) || (isPersonaUGM() && userType === UserType.UserType_Sales)) {
        tabs.push({ title: t.labels.PBNA_MOBILE_VISITS.toUpperCase() }, { title: t.labels.PBNA_MOBILE_CUSTOMERS })
    }
    if (merchLCodes.includes(lineCode)) {
        tabs.push({ title: t.labels.PBNA_MOBILE_VISITS.toUpperCase() })
    }
    if (unassignedRoute) {
        tabs = [{ title: t.labels.PBNA_MOBILE_VISITS.toUpperCase() }]
    }
    return tabs
}
interface EmployeeProfileOverviewInterface {
    navigation?: any
    route?: any
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        marginTop: 60,
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
    imgBgView: {
        ...commonStyle.flexRowJustifyCenter
    },
    imgBg: {
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
    roleView: {
        flexShrink: 1,
        ...commonStyle.flexRowJustifyCenter,
        marginTop: 4,
        paddingHorizontal: baseStyle.padding.pd_22,
        maxWidth: 220
    },
    userName: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.white,
        marginTop: 14,
        maxWidth: 360
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
    tabView: {
        height: 56,
        backgroundColor: baseStyle.color.black,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        flexDirection: 'row',
        paddingTop: 20,
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    }
})

const getBgImage = (userType) => {
    if (userType === UserType.UserType_Merch) {
        return ImageSrc.GREEN_BG
    } else if (userType === UserType.UserType_Sales) {
        return ImageSrc.RED_BG
    } else if (userType === UserType.UserType_Delivery) {
        return ImageSrc.BLUE_BG
    }
    return ImageSrc.PINK_BG
}

const renderUserHeadView = (userData: any, userType: string, dropDownRef, setNewUserStatsData: any) => {
    return (
        <View style={styles.imgBgView}>
            <ImageBackground source={getBgImage(userType)} style={styles.imgBg}>
                <View style={styles.portraitView}>
                    {userData?.unassignedRoute ? (
                        <View style={[styles.portraitView, { marginTop: -40 }]}>
                            <Image
                                style={[styles.imgPortrait, { borderRadius: 14 }]}
                                source={ImageSrc.IMG_UNASSIGNED}
                            />
                        </View>
                    ) : (
                        <UserAvatar
                            userStatsId={userData.userStatsId}
                            firstName={userData.firstName}
                            lastName={userData.lastName}
                            avatarStyle={styles.imgPortrait}
                            userNameText={{ fontSize: 34 }}
                        />
                    )}
                    {!userData?.unassignedRoute &&
                        UploadAvatar({
                            setUploadLoading: null,
                            dropDownRef,
                            usId: userData.userStatsId,
                            userData,
                            setNewUserStatsData
                        })}
                </View>
                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                    {userData?.unassignedRoute
                        ? _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED) + ' ' + t.labels.PBNA_MOBILE_ROUTE
                        : userData.name}
                </CText>
                <View style={styles.roleView}>
                    <CText style={styles.roleText}>{getFTPT({ item: userData })}</CText>
                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                        {userData.title}
                    </CText>
                    {userData.title && <CText style={styles.roleText}> | </CText>}
                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                        {t.labels.PBNA_MOBILE_GPID} {userData.gpid}
                    </CText>
                </View>
                {!userData?.unassignedRoute && (
                    <View style={styles.locationView}>
                        <View style={styles.location}>
                            <Image source={ImageSrc.IMG_ADDRESS} style={styles.imgAddress} />
                            <CText numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>
                                {userData.location}
                            </CText>
                        </View>
                        {RowMsgPhoneView(userData.phone, true)}
                    </View>
                )}
            </ImageBackground>
        </View>
    )
}

const EmployeeProfileOverview = (props: EmployeeProfileOverviewInterface) => {
    const { navigation, route } = props
    const { userData, userType } = route?.params || {}
    const refMonthWeek: any = useRef()
    const sortListRef = useRef<SortableList<any>>()
    const [weekDays, setWeekDays] = useState({})
    const [sortList, setSortList] = useState({})
    const [allSDData, setAllSDData] = useState({})
    const [selectDayKey, setSelectDayKey] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const { dropDownRef } = useDropDown()
    const [newUserStatsData, setNewUserStatsData] = useState(route?.params?.userData || {})

    useEffect(() => {
        getCustomerDataSDL({ userData })
            .then((store) => {
                refreshView({
                    selectDayKey,
                    setData: setAllSDData,
                    setWeekDays,
                    refMonthWeek,
                    setSelectDayKey,
                    setSortList,
                    store
                })
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }, [])

    const changeDay = (value) => {
        if (value === selectDayKey) {
            return
        }
        setSelectDayKey(value)
        setSortList(allSDData[value] || {})
        sortListRef?.current?._scrollView?.scrollTo({ x: 0, y: 0, animated: true })
    }

    const weekDayClick = (value) => {
        changeDay(value.weekLabel)
    }

    const goBack = () => {
        navigation.goBack()
    }

    const goToDetails = (item) => {
        navigation.navigate(NavigationRoute.SDL_VISIT_DETAIL, { item: item })
    }

    const renderRow = ({ item }) => {
        return <SDLVisitSegmentCell onCellPress={goToDetails} item={item} />
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_EMPLOYEE_PROFILE}</CText>
                <TouchableOpacity
                    style={styles.btnBack}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        goBack()
                    }}
                >
                    <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
            </View>
            {renderUserHeadView(newUserStatsData || {}, userType, dropDownRef, setNewUserStatsData)}
            <SegmentView dataSource={getTabs(userData.lineCode, userType, userData?.unassignedRoute)}>
                <>
                    {(isPersonaSDL() ||
                        (isPersonaUGM() && userType !== UserType.UserType_Delivery && !userData?.unassignedRoute)) && (
                        <SDLOverviewSegmentTab
                            userType={userType}
                            userData={userData}
                            key={0 || CommonLabel.NUMBER_ZERO}
                        />
                    )}
                    {((isPersonaSDL() && userType !== UserType.UserType_Others) ||
                        (isPersonaUGM() &&
                            (userType === UserType.UserType_Sales || userType === UserType.UserType_Merch))) && (
                        <SDLVisitSegmentTab
                            userData={userData}
                            key={1 || CommonLabel.NUMBER_ZERO}
                            weekDayClick={weekDayClick}
                            refMonthWeek={refMonthWeek}
                            weekDays={weekDays}
                            sortList={sortList}
                            renderRow={renderRow}
                        />
                    )}
                    {((isPersonaSDL() && salesLCodes.includes(userData.lineCode)) ||
                        (isPersonaUGM() && userType === UserType.UserType_Sales)) && (
                        <View style={commonStyle.windowWidth}>
                            <SDLMyCustomer navigation={navigation} userData={userData} isEmployeeProfile />
                        </View>
                    )}
                    {((!isPersonaSDL() && !isPersonaUGM()) ||
                        (isPersonaUGM() && userType === UserType.UserType_Delivery)) && (
                        <OverviewSegmentTab userData={userData} key={userData.id || CommonLabel.NUMBER_ZERO} />
                    )}
                </>
            </SegmentView>
            <Loading isLoading={isLoading} />
        </View>
    )
}
export default EmployeeProfileOverview
