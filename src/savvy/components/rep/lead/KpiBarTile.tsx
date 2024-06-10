/**
 * @description Component to show Leads KPI bar tile.
 * @author Shangmin Dou
 * @date 2021-07-21
 */
import React, { FC, useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../../common/components/CText'
import Tooltip from 'react-native-walkthrough-tooltip'
import { t } from '../../../../common/i18n/t'
import _ from 'lodash'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface KpiBarTileProps {
    leadCount
    leadData
    name
    color
}

const styles = StyleSheet.create({
    fontWeight_500: {
        fontWeight: '500'
    },
    textContainer: {
        height: 9,
        width: 9,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'white'
    },
    textStyle: {
        color: 'white',
        marginLeft: 6,
        fontSize: 12
    }
})

const KpiBarTile: FC<KpiBarTileProps> = (props: KpiBarTileProps) => {
    const { leadCount, leadData, name, color } = props
    const [showTooltip, setShowTooltip] = useState(false)
    return (
        <Tooltip
            content={
                <View
                    style={{
                        padding: 8
                    }}
                >
                    <CText>
                        <CText style={styles.fontWeight_500}>
                            {leadCount}&nbsp;{_.capitalize(t.labels.PBNA_MOBILE_LEADS)}&nbsp;
                        </CText>{' '}
                        | &nbsp;<CText style={styles.fontWeight_500}>{Math.round(leadData)}%</CText>&nbsp;
                        {t.labels.PBNA_MOBILE_OF_TOTAL}
                    </CText>
                </View>
            }
            placement={'bottom'}
            isVisible={showTooltip}
            onClose={() => {
                setShowTooltip(false)
            }}
            backgroundStyle={{ backgroundColor: 'white' }}
            backgroundColor={'rgba(0,0,0,0)'}
            disableShadow
        >
            <TouchableOpacity
                onPress={() => {
                    setShowTooltip(true)
                }}
                hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
            >
                <View style={commonStyle.flexRowAlignCenter}>
                    <View
                        style={[
                            styles.textContainer,
                            {
                                backgroundColor: color
                            }
                        ]}
                    />
                    <CText style={styles.textStyle}>{name}</CText>
                </View>
            </TouchableOpacity>
        </Tooltip>
    )
}

export default KpiBarTile
