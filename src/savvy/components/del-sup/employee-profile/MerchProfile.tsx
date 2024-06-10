/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-02-21 01:11:29
 * @LastEditTime: 2022-03-22 04:18:59
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { ScrollView, View, Image, Dimensions } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { isPersonaUGM } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import EmployeeDetailStyle from '../../../styles/manager/EmployeeDetailStyle'
import { getWeekLabel } from '../../../utils/MerchManagerComputeUtils'
import { formatPhoneNumber, formatUTCToLocalTime } from '../../../utils/MerchManagerUtils'
import CText from '../../../../common/components/CText'
import { getLocationList, getWorkingStatusObj } from '../../manager/helper/MerchManagerHelper'
const styles = EmployeeDetailStyle
const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
const screenWidth = Dimensions.get('window').width
const getGreyRoundStyle = (params) => {
    if (!params) {
        return styles.greyRound
    }
}
export const renderMerchOverview = (userData, key) => {
    const weekLabel = getWeekLabel()
    const isUGMPersona = isPersonaUGM()
    return (
        <ScrollView style={[styles.content, { width: screenWidth }]} key={key}>
            <CText style={styles.contentTitle}>{t.labels.PBNA_MOBILE_EMPLOYEE_DETAILS}</CText>
            <View style={[styles.flexRow, isUGMPersona && styles.marginBottom_20]}>
                <CText style={styles.fieldLabel}>{t.labels.PBNA_MOBILE_WORK_PHONE}</CText>
                <View style={styles.flexRowAlignCenter}>
                    {userData.phone ? (
                        <CText style={styles.fieldText}>{formatPhoneNumber(userData.phone)}</CText>
                    ) : (
                        <CText style={styles.fieldText}>-</CText>
                    )}
                    {userData.phone && <Image source={IMG_GREEN_CHECK} style={styles.imgCheck} />}
                </View>
            </View>
            <CText style={[styles.contentTitle, styles.marginTop_15]}>{t.labels.PBNA_MOBILE_LOCATION_DEFAULT}</CText>
            <View style={[styles.flexRow, styles.flexSelectRow, isUGMPersona && styles.borderBottomWihte]}>
                <View style={styles.flexDirectionRow}>
                    <CText style={styles.selectLabel}>{t.labels.PBNA_MOBILE_STARTING_LOCATION}</CText>
                </View>
                <View style={styles.flexRowAlignCenter}>
                    <CText style={styles.selectText}>
                        {getLocationList()?.filter((item) => item.value === userData.startLocation)[0]?.text}
                    </CText>
                </View>
            </View>
            <View style={[styles.flexRow, styles.flexSelectRow, isUGMPersona && styles.borderBottomWihte]}>
                <View style={styles.flexDirectionRow}>
                    <CText style={[styles.selectLabel]}>{t.labels.PBNA_MOBILE_STARTING_TIME}</CText>
                </View>
                <View style={styles.flexRowAlignCenter}>
                    <CText style={styles.selectText}>{formatUTCToLocalTime(userData.startTime) || '-'}</CText>
                </View>
            </View>
            <View style={[styles.workingDayRow, isUGMPersona && styles.marginTop_20]}>
                <CText style={[styles.contentTitle, styles.lineHeight_25]}>
                    {t.labels.PBNA_MOBILE_REGULAR_WORKING_DAYS}
                </CText>
            </View>
            <CText style={styles.subTitle}>{t.labels.PBNA_MOBILE_WEEKLY_SCHEDULE}</CText>
            <View style={styles.weekNum}>
                {weekLabel.map((value, index) => {
                    return (
                        <View
                            key={value}
                            style={[
                                styles.roundLabel,
                                getGreyRoundStyle(Object.values(getWorkingStatusObj(userData.workingStatus))[index])
                            ]}
                        >
                            <CText style={styles.roundText}>{value}</CText>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    )
}
