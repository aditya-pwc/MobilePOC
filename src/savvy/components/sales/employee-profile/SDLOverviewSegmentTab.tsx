/*
 * @Description: SDL Profile Overview
 * @Author: Aimee Zhang
 * @Date: 2021-12-16 04:32:27
 * @LastEditTime: 2023-11-30 12:20:46
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { StyleSheet, Image, View } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { ScrollView } from 'react-native-gesture-handler'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import OverviewSegmentCell from '../../del-sup/employee-profile/OverviewSegmentCell'
import { formatPhoneNumber } from '../../../utils/MerchManagerUtils'
import { merchLCodes } from '../../../helper/manager/MyTeamSDLHelper'
import { renderMerchOverview } from '../../del-sup/employee-profile/MerchProfile'
import { UserType } from '../../../redux/types/H01_Manager/data-userType'
import { isPersonaSDL, isPersonaUGM } from '../../../../common/enums/Persona'
import LocationDefault from '../../manager/my-team/LocationDefault'
import RegularWorkingDays from '../../manager/my-team/RegularWorkingDays'
import { getWorkingStatusObj } from '../../manager/helper/MerchManagerHelper'

interface OverviewSegmentTabPros {
    userData?: any
    key?: string | number
    userType?: string
}
const styles = StyleSheet.create({
    sectionTitleContain: {
        marginTop: 25
    },
    sectionTitleMargin: {
        marginVertical: 5
    },
    sectionTitleStyle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    cellTitleStyle: {
        marginVertical: 15
    },
    imgCheck: {
        width: 14,
        height: 14,
        marginLeft: 8
    },
    shortCellTitle: {
        marginTop: 20,
        marginBottom: 16
    },
    shortCellSubTitle: {
        fontSize: baseStyle.fontSize.fs_14
    },
    imgTriangle: {
        width: 10,
        height: 5,
        marginHorizontal: 10
    },
    imgClock: {
        width: 18,
        height: 18,
        marginHorizontal: 10
    },
    editContainer: {
        marginTop: 40
    },
    editBtnColor: {
        color: '#00A2D9'
    },
    noticeText: {
        marginLeft: 22,
        marginTop: 12,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    roundLabel: {
        width: 42,
        height: 42,
        marginRight: 15,
        borderRadius: 21,
        backgroundColor: baseStyle.color.tabShadowBlue,
        ...commonStyle.alignCenter
    },
    greyRound: {
        backgroundColor: baseStyle.color.borderGray
    },
    roundText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.white
    },
    weekNum: {
        marginTop: 20,
        marginBottom: 100,
        marginHorizontal: 22,
        paddingRight: 22,
        ...commonStyle.flexRowSpaceBet
    },
    locationDefaultView: {
        marginLeft: 20
    },
    regularWorkingDaysView: {
        marginLeft: 20,
        marginRight: 20
    }
})

const renderSalesOverView = (userData, key, userType) => {
    return (
        <ScrollView style={commonStyle.windowWidth} key={key}>
            <OverviewSegmentCell
                title={t.labels.PBNA_MOBILE_EMPLOYEE_DETAILS}
                cellTitleStyle={[styles.sectionTitleStyle, styles.sectionTitleMargin]}
                cellCustomerStyle={styles.sectionTitleContain}
            />
            <OverviewSegmentCell
                title={t.labels.PBNA_MOBILE_WORK_PHONE}
                cellTitleStyle={styles.cellTitleStyle}
                subTitle={userData.phone ? formatPhoneNumber(userData.phone) : '-'}
                rightIcon={userData.phone && <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.imgCheck} />}
            />
            {!(isPersonaUGM() && userType === UserType.UserType_Others) && (
                <OverviewSegmentCell
                    title={t.labels.PBNA_MOBILE_NATIONAL_ID}
                    cellTitleStyle={styles.cellTitleStyle}
                    subTitle={userData.nationalId || ''}
                />
            )}

            {isPersonaSDL() && userType === UserType.UserType_Sales && (
                <View style={styles.locationDefaultView}>
                    <LocationDefault userData={userData} isSales />
                </View>
            )}
            {isPersonaSDL() && userType === UserType.UserType_Sales && (
                <View style={styles.regularWorkingDaysView}>
                    <RegularWorkingDays
                        userData={userData}
                        originalWorkingOrder={getWorkingStatusObj(userData.workingStatus)}
                    />
                </View>
            )}
        </ScrollView>
    )
}

const SDLOverviewSegmentTab = (props: OverviewSegmentTabPros) => {
    const { userData, key, userType } = props
    return merchLCodes.includes(userData.lineCode)
        ? renderMerchOverview(userData, key)
        : renderSalesOverView(userData, key, userType)
}

export default SDLOverviewSegmentTab
