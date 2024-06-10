import React, { FC, ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { renderRedDot } from '../../../../savvy/components/common/CopilotModal'
import { t } from '../../../i18n/t'
import CText from '../../CText'

const styles = StyleSheet.create({
    cellTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000'
    },
    settingContain: {
        flex: 3,
        marginTop: 57
    },
    leftLocationWrap: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    settingCellView: {
        marginLeft: 22,
        marginRight: 22,
        height: 70,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3',
        justifyContent: 'center'
    },
    locationWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    languageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    languageBtn: {
        fontSize: 14
    },
    downArrow: {
        marginLeft: 10,
        width: 12,
        height: 7
    },
    titleAndDot: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

type CommonSettingCell = {
    title: string
    index?: string | number
    onPress?: () => void
    showRedDot?: boolean
}

type CustomSettingCell = {
    component?: ReactNode
}

export type SettingCellType = CommonSettingCell & CustomSettingCell

export type SettingCellProps = SettingCellType

export const SettingCell: FC<SettingCellProps> = (props) => {
    const { title, index, onPress, component, showRedDot } = props
    return (
        <View key={index}>
            {!component && (
                <TouchableOpacity style={styles.settingCellView} onPress={onPress}>
                    <View style={[title === t.labels.PBNA_MOBILE_WHATS_NEW && styles.titleAndDot]}>
                        <CText style={styles.cellTitle}>{title}</CText>
                        {showRedDot && title === t.labels.PBNA_MOBILE_WHATS_NEW && renderRedDot()}
                    </View>
                </TouchableOpacity>
            )}
            {!!component && component}
        </View>
    )
}
