/*
 * @Description:
 * @Author: Christopher ZANG
 * @Date: 2021-11-18 15:54:58
 * @LastEditTime: 2021-12-03 17:09:30
 * @LastEditors: Aimee Zhang
 */
/* eslint-disable camelcase */

import React, { useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CollapseButton from '../common/CollapseButton'
import CText from '../../../common/components/CText'
import WebSocialMedia from '../rep/lead/overview-tab/WebSocialMedia'

/**
 * @description A expandalbe card shows work order of the retail store
 * @author Christopher ZANG
 * @email jiahua.zang@pwc.com
 * @date 2021-08-23
 * @LastModifiedDate 2021-08-23
 */

const styles = StyleSheet.create({
    container: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    socialMedia: {
        fontWeight: '700',
        fontSize: 18
    },
    containerWidth: {
        width: '100%',
        height: 70,
        padding: 22
    }
})
const VisitCustomerSocial = (parentProps) => {
    const { customerData } = parentProps
    const [isExpanded, setIsExpanded] = useState(true)
    customerData.Website__c = '123'
    customerData.ff_FACEBOOK_c__c = '123'
    customerData.ff_FOURSQUARE_c__c = '123'
    customerData.ff_YELP_c__c = '123'
    customerData.FF_LINK_c__c = ''
    customerData.Rating_c__c = 3

    const handleCollapse = () => {
        setIsExpanded(!isExpanded)
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    handleCollapse()
                }}
                activeOpacity={1}
                style={[styles.containerWidth, commonStyle.flexRowSpaceBet]}
            >
                <View style={commonStyle.flexRowAlignCenter}>
                    <CText style={styles.socialMedia}>{t.labels.PBNA_MOBILE_CD_WEB_SOCIAL_MEDIA}</CText>
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <CollapseButton isExpanded={isExpanded} />
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!isExpanded}>
                <WebSocialMedia l={customerData} />
            </Collapsible>
        </View>
    )
}

export default VisitCustomerSocial
