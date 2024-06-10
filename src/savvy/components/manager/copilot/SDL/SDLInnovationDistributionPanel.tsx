/**
 * @description Component to show Innovation Distribution Plane.
 * @author Qiulin Deng
 * @date 2021-11-24
 * @Lase
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'

const styles = StyleSheet.create({
    container: {
        // marginTop: 45,
        marginBottom: 236,
        paddingHorizontal: 22
    },
    background: {
        height: 110,
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 6,
        backgroundColor: '#1B4188',
        opacity: 0.4,
        width: '100%',
        position: 'absolute',
        left: 22
    },
    alignArea: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    flexRow: {
        flexDirection: 'row'
    },
    flexColumn: {
        flexDirection: 'column'
    },
    titleContainer: {
        height: 20,
        marginTop: 19,
        marginBottom: 18
    },
    skuCountFont: {
        fontSize: 12,
        color: '#FFF'
    },
    calculationFont: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF'
    },
    skuCountTitleMargin: {
        marginBottom: 4
    },
    skuCountContainer: {
        height: 40
    },
    titleBold: {
        fontWeight: '900'
    },
    iconStyle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EB445A',
        marginLeft: 10
    },
    skuContainer: {
        justifyContent: 'space-between',
        width: '100%'
    },
    iconFontBold: {
        fontWeight: '700'
    }
})

interface InnovationDistributionPanelProps {
    navigation: any
    panelObj: any
}

const InnovationDistributionPanel = (props: InnovationDistributionPanelProps) => {
    const { panelObj } = props
    return (
        <TouchableOpacity
            style={styles.container}
            // onPress={() => {
            //     if (CommonParam.PERSONA__c === Persona.PSR) {
            //         Instrumentation.reportMetric('PSR Enters My Metrics via Innovation Copilot Card', 1)
            //         Instrumentation.startTimer('PSR Time Spent On My Metrics Page')
            //     }
            //     navigation.navigate('MyMetricsScreen')
            // }}
        >
            <View style={styles.background} />
            <View style={[styles.alignArea, { paddingHorizontal: 22 }]}>
                <View style={[styles.alignArea, styles.flexRow, styles.titleContainer]}>
                    <CText style={[styles.titleBold, styles.skuCountFont]}>INNOVATION DISTRIBUTION</CText>
                    {panelObj.newCount !== 0 && (
                        <View style={[styles.alignArea, styles.iconStyle]}>
                            <CText style={[styles.skuCountFont, styles.iconFontBold]}>{panelObj.newCount}</CText>
                        </View>
                    )}
                </View>
                <View style={[styles.skuContainer, styles.flexRow]}>
                    <View style={[styles.skuCountContainer, styles.flexColumn]}>
                        <CText style={[styles.skuCountTitleMargin, styles.skuCountFont]}>Voids</CText>
                        <CText style={styles.calculationFont}>{panelObj.voids}</CText>
                    </View>
                    <View style={[styles.skuCountContainer, styles.flexColumn]}>
                        <CText style={[styles.skuCountTitleMargin, styles.skuCountFont]}>Order Day Voids</CText>
                        <CText style={[styles.calculationFont, { textAlign: 'center' }]}>{panelObj.orders}</CText>
                    </View>
                    <View style={[styles.skuCountContainer, styles.flexColumn]}>
                        <CText style={[styles.skuCountTitleMargin, styles.skuCountFont]}>11wks 0cs</CText>
                        <CText style={[styles.calculationFont, { textAlign: 'right' }]}>{panelObj.wks}</CText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default InnovationDistributionPanel
