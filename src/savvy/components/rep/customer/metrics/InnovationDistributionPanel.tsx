/**
 * @description Component to show Innovation Distribution Plane.
 * @author Qiulin Deng
 * @date 2021-11-24
 * @Lase
 */

import { Instrumentation } from '@appdynamics/react-native-agent'
import React, { FC, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CommonParam } from '../../../../../common/CommonParam'
import { useInnovationPanelData } from '../../../../hooks/InnovationProductHooks'
import { isPersonaUGMOrSDL, Persona } from '../../../../../common/enums/Persona'
import CText from '../../../../../common/components/CText'
import { useIsFocused } from '@react-navigation/native'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { withPersonaCheck } from '../../../../../common/components/PersonaCheck'
import { checkPersonaPermission } from '../../../../utils/PermissionChecker'

const styles = StyleSheet.create({
    container: {
        minHeight: 110,
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 6,
        backgroundColor: '#1B4188',
        marginTop: 45,
        marginBottom: 236,
        paddingHorizontal: '3%'
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
    skuCountTitleContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    skuCountTitleMargin: {
        marginBottom: 4
    },
    skuCountContainer: {
        minHeight: 40
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
        width: '100%',
        marginBottom: 16
    },
    skuCountNumberContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    iconFontBold: {
        fontWeight: '700'
    },
    skuCountNumber1: {
        width: '15%'
    },
    skuCountNumber2: {
        width: '30%'
    },
    skuCountNumber3: {
        width: '20%'
    },
    rightMargin10: {
        marginRight: 10
    }
})

interface InnovationDistributionPanelProps {
    navigation: any
    containerStyle: Object
}

const renderUnitView = (
    title: string,
    subTitle: any,
    checkDataFlag: any,
    contStyle?: any,
    titleStyle?: any,
    subStyle?: any
) => {
    return (
        <View style={contStyle}>
            <CText style={[styles.skuCountTitleMargin, styles.skuCountFont, titleStyle]}>{title}</CText>
            {checkDataFlag && <ActivityIndicator style={styles.rightMargin10} />}
            {!checkDataFlag && <CText style={[styles.calculationFont, subStyle]}>{subTitle}</CText>}
        </View>
    )
}

const InnovationDistributionPanel: FC<InnovationDistributionPanelProps> = (props: InnovationDistributionPanelProps) => {
    const { navigation, containerStyle } = props
    const isFocused = useIsFocused()
    const [checkDataFlag, setCheckDataFlag] = useState(false)
    const panelObj = useInnovationPanelData(isFocused, setCheckDataFlag)

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle]}
            onPress={() => {
                navigation.navigate('MyMetricsScreen')
                if (CommonParam.PERSONA__c === Persona.PSR) {
                    Instrumentation.reportMetric('PSR Enters My Metrics via Innovation Copilot Card', 1)
                    Instrumentation.startTimer('PSR Time Spent On My Metrics Page')
                }
            }}
        >
            <View style={styles.alignArea}>
                <View style={[styles.alignArea, styles.flexRow, styles.titleContainer]}>
                    <CText style={[styles.titleBold, styles.skuCountFont]}>
                        {t.labels.PBNA_MOBILE_INNOV_DISTRIBUTION}
                    </CText>
                    {panelObj.newCount !== 0 && (
                        <View style={[styles.alignArea, styles.iconStyle]}>
                            <CText style={[styles.skuCountFont, styles.iconFontBold]}>{panelObj.newCount}</CText>
                        </View>
                    )}
                </View>
                <View style={[styles.skuContainer, styles.flexColumn]}>
                    <View style={[styles.skuCountTitleMargin, styles.skuCountTitleContainer]}>
                        {renderUnitView(t.labels.PBNA_MOBILE_VOIDS, panelObj.voids, checkDataFlag)}
                        {renderUnitView(
                            t.labels.PBNA_MOBILE_ORDER_DAY_VOIDS,
                            panelObj.orders,
                            checkDataFlag,
                            null,
                            commonStyle.textAlignCenter,
                            commonStyle.textAlignCenter
                        )}
                        {renderUnitView(
                            isPersonaUGMOrSDL()
                                ? t.labels.PBNA_MOBILE_METRICS_CLOSED_WTD
                                : t.labels.PBNA_MOBILE_COPILOT_11WKS_0CS,
                            panelObj.wks,
                            checkDataFlag,
                            null,
                            isPersonaUGMOrSDL() ? commonStyle.textAlignCenter : commonStyle.textAlignRight,
                            isPersonaUGMOrSDL() ? commonStyle.textAlignCenter : commonStyle.textAlignRight
                        )}
                        {isPersonaUGMOrSDL() &&
                            renderUnitView(
                                t.labels.PBNA_MOBILE_METRICS_DIST_PERCENT,
                                panelObj.wks,
                                checkDataFlag,
                                null,
                                commonStyle.textAlignRight,
                                commonStyle.textAlignRight
                            )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

InnovationDistributionPanel.displayName = 'InnovationDistributionPanel'

export const InnovationDistributionPanelWithPersonaCheck = withPersonaCheck(
    InnovationDistributionPanel,
    checkPersonaPermission
)
