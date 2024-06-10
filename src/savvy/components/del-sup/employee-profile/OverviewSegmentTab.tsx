/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-10 04:32:27
 * @LastEditTime: 2022-02-15 03:30:48
 * @LastEditors: Mary Qian
 */
import React from 'react'
import { StyleSheet, Image } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import OverviewSegmentCell from './OverviewSegmentCell'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { ScrollView } from 'react-native-gesture-handler'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import { formatPhoneNumber } from '../../../utils/MerchManagerUtils'

interface OverviewSegmentTabPros {
    userData?: any
    key?: string | number
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
        marginLeft: 18
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
        marginLeft: 38,
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
    }
})

const OverviewSegmentTab = (props: OverviewSegmentTabPros) => {
    const { userData, key } = props
    return (
        <ScrollView style={commonStyle.windowWidth} key={key}>
            <OverviewSegmentCell
                cellCustomerStyle={styles.sectionTitleContain}
                title={t.labels.PBNA_MOBILE_EMPLOYEE_DETAILS}
                cellTitleStyle={[styles.sectionTitleStyle, styles.sectionTitleMargin]}
            />
            <OverviewSegmentCell
                title={t.labels.PBNA_MOBILE_WORK_PHONE}
                cellTitleStyle={styles.cellTitleStyle}
                subTitle={userData.phone ? formatPhoneNumber(userData.phone) : '-'}
                rightIcon={userData.phone && <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.imgCheck} />}
            />
            <OverviewSegmentCell
                title={t.labels.PBNA_MOBILE_NATIONAL_ID}
                cellTitleStyle={styles.cellTitleStyle}
                subTitle={userData.nationalId || ''}
            />
            <OverviewSegmentCell
                title={t.labels.PBNA_MOBILE_LOCAL_ROUTE}
                cellTitleStyle={styles.cellTitleStyle}
                subTitle={userData.localRoute || ''}
            />
        </ScrollView>
    )
}
export default OverviewSegmentTab
