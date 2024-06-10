import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { calculateFailedDate } from '../../../../hooks/EquipmentHooks'

interface RequestLineItemBottomStatusProps {
    item
}

const styles = StyleSheet.create({
    fontSize_105: {
        fontSize: 10.5
    },
    fontSize_12: {
        fontSize: 12
    },
    colorGray: {
        color: 'gray'
    },
    requestOnText: {
        fontSize: 10.5,
        marginRight: 50
    },
    marginTop_7: {
        marginTop: 7
    },
    marginTop_5: {
        marginTop: 5
    },
    submittedStatusContainer: {
        width: 6,
        height: 6,
        backgroundColor: '#FFC409',
        borderRadius: 5,
        marginRight: 6
    },
    closedStatusContainer: {
        width: 6,
        height: 6,
        backgroundColor: '#00D276',
        borderRadius: 5,
        marginRight: 6
    },
    cancelledStatusContainer: {
        width: 6,
        height: 6,
        backgroundColor: '#FB465C',
        borderRadius: 5,
        marginRight: 6
    },
    reasonContainer: {
        overflow: 'hidden',
        width: 270,
        fontSize: 10.5,
        marginTop: 3.5
    },
    pillBackground: {
        padding: 3,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        marginTop: 8,
        alignSelf: 'flex-start'
    },
    statusStyle: {
        fontWeight: '500',
        color: baseStyle.color.titleGray
    }
})

const RequestLineItemBottomStatus: FC<RequestLineItemBottomStatusProps> = (props: RequestLineItemBottomStatusProps) => {
    const { item } = props

    const renderSubmittedAndScheduled = (submitLineItem) => {
        if (
            _.isEmpty(submitLineItem.submitted_date__c) &&
            (_.isEmpty(submitLineItem.sched_beg_dte__c) || submitLineItem.sched_beg_dte__c === '1900-01-01') &&
            !_.isEmpty(submitLineItem.ord_rcv_dte_tme__c)
        ) {
            return (
                <CText style={styles.fontSize_105}>
                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_SUBMITTED_VIA_EXTERNAL_SYSTEM}</CText>
                </CText>
            )
        }
        if (submitLineItem.sched_beg_dte__c && submitLineItem.sched_beg_dte__c !== '1900-01-01') {
            return (
                <CText style={styles.fontSize_105}>
                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_SCHEDULED_ON}</CText>
                    &nbsp;{moment(submitLineItem.sched_beg_dte__c).format('MMM DD, YYYY')}
                </CText>
            )
        }
        return (
            <CText style={styles.requestOnText} numberOfLines={1}>
                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_SUBMITTED_REQUEST_ON}</CText>
                &nbsp;{moment(submitLineItem.submitted_date__c).format('MMM DD, YYYY')}&nbsp;
                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_BY.toLowerCase()}</CText>&nbsp;
                {submitLineItem['requested_by__r.Name']}
            </CText>
        )
    }

    const renderLineItemBottomStatus = (lineItem) => {
        switch (lineItem.status__c) {
            case 'INCOMPLETE':
            case 'SUBMITTED':
                return (
                    <View style={styles.marginTop_7}>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={styles.submittedStatusContainer} />
                            {renderSubmittedAndScheduled(lineItem)}
                        </View>
                    </View>
                )
            case 'CLOSED':
                if (lineItem.order_closed_date__c) {
                    return (
                        <View style={styles.marginTop_7}>
                            <View style={commonStyle.flexRowAlignCenter}>
                                <View style={styles.closedStatusContainer} />
                                <CText style={styles.fontSize_105}>
                                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_COMPLETED_ON}</CText>
                                    &nbsp;{moment(lineItem.order_closed_date__c).format('MMM DD, YYYY')}
                                </CText>
                            </View>
                        </View>
                    )
                }
                return <View />
            case 'CANCELLED':
                if (lineItem.order_cancelled_date__c) {
                    return (
                        <View style={styles.marginTop_5}>
                            <View style={commonStyle.flexRowAlignCenter}>
                                <View style={styles.cancelledStatusContainer} />
                                <CText style={styles.fontSize_105}>
                                    <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_CANCELLED_ON}</CText>&nbsp;
                                    {moment(lineItem.order_cancelled_date__c).format('MMM DD, YYYY')}
                                </CText>
                            </View>
                            <CText numberOfLines={1} style={styles.reasonContainer}>
                                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_REASON}</CText>&nbsp;
                                {lineItem.canc_reas_cde_descri__c}
                            </CText>
                        </View>
                    )
                }
                return <View />
            case 'FAILED':
                return (
                    <View style={styles.marginTop_5}>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View style={styles.cancelledStatusContainer} />
                            <CText style={styles.fontSize_105}>
                                <CText style={styles.colorGray}>{t.labels.PBNA_MOBILE_FAILED_ON}</CText>
                                &nbsp;
                                {calculateFailedDate(lineItem)}
                            </CText>
                        </View>
                        <CText style={[styles.colorGray, styles.marginTop_5, styles.fontSize_12]}>
                            {t.labels.PBNA_MOBILE_EQUIPMENT_LINE_ITEM_FAILED_MSG}
                        </CText>
                        <View style={commonStyle.flexRowAlignCenter}>
                            <View
                                style={[
                                    {
                                        backgroundColor: baseStyle.color.borderGray
                                    },
                                    styles.pillBackground
                                ]}
                            >
                                <CText style={styles.statusStyle}>{t.labels.PBNA_MOBILE_FAILED.toUpperCase()}</CText>
                            </View>
                        </View>
                    </View>
                )
            default:
                return <View />
        }
    }

    return renderLineItemBottomStatus(item)
}

export default RequestLineItemBottomStatus
