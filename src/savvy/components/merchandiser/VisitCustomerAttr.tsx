/* eslint-disable camelcase */

import React, { useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CCheckBox from '../../../common/components/CCheckBox'
import CollapseButton from '../common/CollapseButton'
import CText from '../../../common/components/CText'
import { visitStyle } from './VisitStyle'

/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */

const styles = StyleSheet.create({
    customerAttrContainer: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    visitAttrInner: {
        width: '100%',
        height: 70,
        padding: 22
    },
    leadAttributeText: {
        fontWeight: '700',
        fontSize: 18
    },
    width50: {
        width: '50%'
    }
})
const VisitCustomerAttr = (parentProps) => {
    const { customerData } = parentProps
    const [isExpanded, setIsExpanded] = useState(true)
    const handleCollapse = () => {
        setIsExpanded(!isExpanded)
    }
    return (
        <View style={styles.customerAttrContainer}>
            <TouchableOpacity
                onPress={() => {
                    handleCollapse()
                }}
                activeOpacity={1}
                style={[commonStyle.flexRowSpaceBet, styles.visitAttrInner]}
            >
                <View style={commonStyle.flexRowAlignCenter}>
                    <CText style={styles.leadAttributeText}>{t.labels.PBNA_MOBILE_CD_LEAD_ATTRIBUTES}</CText>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <CollapseButton isExpanded={isExpanded} />
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!isExpanded}>
                <View style={[commonStyle.flexDirectionRow, commonStyle.flex_1]}>
                    <View style={styles.width50}>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Catering__c === '1'} />
                            <CText style={customerData.Catering__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_CATERING}
                            </CText>
                        </View>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Takeout__c === '1'} />
                            <CText style={customerData.Takeout__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_TAKEOUT}
                            </CText>
                        </View>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Serves_Alcohol__c === '1'} />
                            <CText style={customerData.Serves_Alcohol__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_SERVES_ALCOHOL}
                            </CText>
                        </View>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Gas_Station__c === '1'} />
                            <CText style={customerData.Gas_Station__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_GAS_STATION}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.width50}>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Serves_Breakfast__c === '1'} />
                            <CText style={customerData.Serves_Breakfast__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_SERVES_BREAKFAST}
                            </CText>
                        </View>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Serves_Lunch__c === '1'} />
                            <CText style={customerData.Serves_Lunch__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_SERVES_LUNCH}
                            </CText>
                        </View>
                        <View style={visitStyle.subTypeItem}>
                            <CCheckBox readonly checked={customerData.Serves_Dinner__c === '1'} />
                            <CText style={customerData.Serves_Dinner__c !== '1' && { color: '#D3D3D3' }}>
                                {t.labels.PBNA_MOBILE_CD_SERVES_DINNER}
                            </CText>
                        </View>
                    </View>
                </View>
            </Collapsible>
        </View>
    )
}

export default VisitCustomerAttr
