/**
 * @description Component to show lead tile.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import LeadTileBottomBar from './LeadTileBottomBar'
import _ from 'lodash'
import moment from 'moment'
import { addZeroClock } from '../../../../../common/utils/DateUtils'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { MOMENT_STARTOF } from '../../../../../common/enums/MomentStartOf'

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        marginTop: 22,
        borderRadius: 5,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        flexDirection: 'column'
    },
    preQualifiedOuterContainer: {
        height: 22
    },
    preQualifiedContainer: {
        height: 22,
        width: 63,
        backgroundColor: '#2DD36F',
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 20,
        justifyContent: 'center'
    },
    preQualifiedText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 7
    },
    addressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 19.38,
        justifyContent: 'space-between'
    },
    addressInnerContainer: {
        width: '90%',
        marginTop: 10,
        marginLeft: '6%'
    },
    companyText: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden',
        marginRight: 10
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 10
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    addButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    addButton: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#00A2D9'
    },
    addedContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkmark: {
        width: 18,
        height: 18
    },
    addedText: {
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16
    },
    whiteBoxContainer: {
        height: 130,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    whiteBoxInfoContainer: {
        width: '85%',
        flexDirection: 'column'
    },
    buttonOuterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '7.5%'
    },
    locationButton: {
        height: 20.58,
        width: 18
    },
    callButton: {
        height: 18.35,
        width: 18,
        marginBottom: 20
    },
    fullWidthWarpRow: {
        width: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    purpleDot: {
        backgroundColor: '#6C0CC3',
        width: 8,
        height: 8,
        marginLeft: 10,
        borderRadius: 5
    },
    yellowDot: {
        width: 6,
        height: 6,
        backgroundColor: '#FFC409',
        borderRadius: 5
    }
})

interface LeadTileProps {
    l: any
    children?: any
    containerStyle?: any
}

const LeadTile = (props: LeadTileProps) => {
    const { l, children, containerStyle } = props

    const renderPreQualified = (leadDetail) => {
        if (leadDetail.Pre_qualified_c__c === '1' || leadDetail.Pre_qualified_c__c === true) {
            return (
                <View style={styles.preQualifiedContainer}>
                    <CText style={styles.preQualifiedText}>{t.labels.PBNA_MOBILE_PRE_Q}</CText>
                </View>
            )
        }
        return null
    }
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.whiteBoxContainer}>
                <View style={styles.whiteBoxInfoContainer}>
                    <View style={styles.preQualifiedOuterContainer}>{renderPreQualified(l)}</View>
                    <View style={styles.addressInnerContainer}>
                        <View style={styles.fullWidthWarpRow}>
                            <CText numberOfLines={2} style={styles.companyText}>
                                {l.Company__c}
                                {((!_.isEmpty(l.Deferred_Resume_Date_c__c) &&
                                    moment(addZeroClock(l.Deferred_Resume_Date_c__c)).isAfter(
                                        moment().add(-30, MOMENT_STARTOF.DAY)
                                    ) &&
                                    moment(addZeroClock(l.Deferred_Resume_Date_c__c)).isBefore(moment())) ||
                                    l.COF_Rejected_c__c === '1' ||
                                    l.COF_Rejected_c__c === true) && (
                                    <View
                                        style={[
                                            commonStyle.flexRowAlignCenter,
                                            {
                                                paddingBottom: '3.5%'
                                            }
                                        ]}
                                    >
                                        <View style={styles.purpleDot} />
                                    </View>
                                )}
                            </CText>
                            <View style={commonStyle.flexDirectionRow}>
                                {(l.COF_Triggered_c__c === '1' || l.COF_Triggered_c__c === true) && (
                                    <View style={commonStyle.flexRowAlignCenter}>
                                        <View style={styles.yellowDot} />
                                        <CText
                                            style={{
                                                marginLeft: 8
                                            }}
                                        >
                                            {t.labels.PBNA_MOBILE_SUBMITTED_CUSTOMER_NUMBER}
                                        </CText>
                                    </View>
                                )}
                            </View>
                        </View>
                        <CText style={styles.streetText} numberOfLines={1}>
                            {l.Street__c}
                        </CText>
                        <CText style={styles.cityText} numberOfLines={1}>
                            {l.City__c ? l.City__c + ', ' : null}
                            {l.State__c}
                            {l.PostalCode__c ? ' ' + l.PostalCode__c : null}
                        </CText>
                    </View>
                </View>
                <View style={styles.buttonOuterContainer}>{children}</View>
            </View>
            <LeadTileBottomBar l={l} />
        </View>
    )
}

export default LeadTile
