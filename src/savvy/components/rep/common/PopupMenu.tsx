import React, { useRef } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { Image } from 'react-native-elements'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CommonTooltip from '../../common/CommonTooltip'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface PopupMenuProps extends React.PropsWithChildren {
    menuOptions: {
        label?: string
        disabled?: boolean
        onSelect?: () => void
        render?: () => React.ReactNode
    }[]
}

const styles = StyleSheet.create({
    divider: {
        marginHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    // New
    toolTipPosition: {
        position: 'absolute',
        right: 8,
        top: 10,
        zIndex: 9999
    },
    paddingVertical_16: {
        paddingVertical: 16
    },
    optionsText: {
        fontSize: 12,
        fontWeight: '700'
    },
    lineStyle: {
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    color_grey: {
        color: 'gray'
    },
    optionsDotIcon: {
        height: 33,
        width: 30
    }
})

export const PopupMenu: React.FC<PopupMenuProps> = ({ menuOptions = [] }) => {
    const toolTipRefs = useRef<any>([])

    const renderOptions = () => {
        return (
            <View style={commonStyle.fullWidth}>
                {menuOptions.map((option: any, actionIndex: number) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                toolTipRefs.current.toggleTooltip()
                                option.onSelect && option.onSelect()
                            }}
                            key={option.label}
                            disabled={option.disabled}
                        >
                            <View style={styles.paddingVertical_16}>
                                <CText style={[styles.optionsText, option.disabled && styles.color_grey]}>
                                    {option.label}
                                </CText>
                            </View>
                            {actionIndex !== menuOptions.length - 1 && (
                                <View style={commonStyle.fullWidth}>
                                    <View style={[styles.lineStyle, commonStyle.fullWidth]} />
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    return (
        <View>
            <CommonTooltip
                cRef={(el: any) => (toolTipRefs.current = el)}
                tooltip={renderOptions()}
                width={166}
                height={135}
            >
                <Image source={ImageSrc.ICON_KEBAB_MENU} style={styles.optionsDotIcon} />
            </CommonTooltip>
        </View>
    )
}
