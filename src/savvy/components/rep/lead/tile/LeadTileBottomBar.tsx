/**
 * @description Component to show lead tile bottom bar.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import moment from 'moment'
import CallBlackSvg from '../../../../../../assets/image/icon-call-black.svg'
import CallTelBlackSvg from '../../../../../../assets/image/icon-call-tel-black.svg'
import { LeadStatus } from '../../../../enums/Lead'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    bottomBarContainer: {
        height: 39,
        backgroundColor: '#F0F3F6',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 19
    },
    lastModifiedTaskText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: '#706E6B',
        marginRight: 4
    },
    lastModifiedTaskDateText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: 'black'
    },
    tierText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#000000'
    },
    callCounterContainer: {
        borderColor: '#D3D3D3',
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    callCounterIcon: {
        height: 12,
        width: 12,
        margin: 1,
        marginTop: 2
    },
    callCounterText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: 'black',
        marginLeft: 4
    },
    callCountText: {
        flexDirection: 'row',
        borderColor: '#D3D3D3',

        padding: 2,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

interface LeadTileBottomBarProps {
    l: any
}

const LeadTileBottomBar = (props: LeadTileBottomBarProps) => {
    const { l } = props
    return (
        <View style={styles.bottomBarContainer}>
            <View style={commonStyle.flexDirectionRow}>
                <CText style={styles.lastModifiedTaskText}>{t.labels.PBNA_MOBILE_LAST_ACTED_ON}</CText>
                <CText style={styles.lastModifiedTaskDateText}>
                    {l.Last_Task_Modified_Date_c__c
                        ? moment(l.Last_Task_Modified_Date_c__c).format(TIME_FORMAT.MMM_DD_YYYY)
                        : null}
                </CText>
            </View>
            <View>
                <CText style={styles.tierText}>
                    {t.labels.PBNA_MOBILE_TIER} {l.Tier_c__c}
                </CText>
            </View>
            <View style={styles.callCounterContainer}>
                <View style={[styles.callCountText, { borderRightWidth: 1 }]}>
                    <CallBlackSvg width={13} height={13} />
                    <CText style={styles.callCounterText}>
                        {Math.floor(
                            l.Call_Counter_c__c +
                                (l.Status__c === LeadStatus.OPEN && l.PD_Call_Counter_c__c ? l.PD_Call_Counter_c__c : 0)
                        )}
                    </CText>
                </View>
                <View style={styles.callCountText}>
                    <CallTelBlackSvg width={15} height={15} />
                    <CText style={styles.callCounterText}>
                        {Math.floor(
                            l.Contact_Made_Counter_c__c +
                                (l.Status__c === LeadStatus.OPEN && l.PD_Contact_Made_Counter_c__c
                                    ? l.PD_Contact_Made_Counter_c__c
                                    : 0)
                        )}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export default LeadTileBottomBar
