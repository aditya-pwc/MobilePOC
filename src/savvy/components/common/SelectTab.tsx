/**
 * @description landing page component.
 * @author Beichen Li
 * @email beichen.a.li@pwc.com
 * @date 2021-07-22
 */
import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    topTabsContainer: {
        height: 44,
        marginHorizontal: 22,
        padding: 6,
        borderWidth: 1,
        borderRadius: 4,
        shadowOpacity: 0.4,
        backgroundColor: 'white',
        borderColor: '#D3D3D3',
        shadowColor: '#87939E',
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    topTabsItemActiveContainer: {
        backgroundColor: '#00A2D9',
        borderRadius: 4,
        ...commonStyle.alignCenter
    },
    topTabsItemNormalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        ...commonStyle.alignCenter
    },
    topTabsItemActiveRedContainer: {
        backgroundColor: '#EB445A'
    },
    topTabsItemActiveText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700'
    },
    topTabsItemNormalText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700'
    },
    specialItemWidth: {
        width: 120
    }
})

interface SelectTabProps {
    listData: any[]
    changeTab: any
    activeTab: any
    style?: any
    fromOptimized?: boolean
    specialWidth?: boolean
    specialIndex?: number
}

const SelectTab = (props: SelectTabProps) => {
    const { listData, changeTab, activeTab, style, fromOptimized, specialWidth, specialIndex } = props
    return (
        <View style={[styles.topTabsContainer, style]}>
            {listData.map((val, index) => {
                return (
                    <TouchableOpacity
                        key={val.name}
                        onPress={() => {
                            if (val.isForbidden) {
                                return
                            }
                            changeTab(index)
                        }}
                        style={[
                            activeTab === index && !val.isForbidden
                                ? styles.topTabsItemActiveContainer
                                : styles.topTabsItemNormalContainer,
                            fromOptimized && activeTab === index && activeTab === 1
                                ? styles.topTabsItemActiveRedContainer
                                : {},
                            specialWidth && index === specialIndex ? styles.specialItemWidth : { flex: 1 }
                        ]}
                    >
                        <CText
                            style={[
                                activeTab === index && !val.isForbidden
                                    ? styles.topTabsItemActiveText
                                    : [styles.topTabsItemNormalText, val.titleColor && { color: val.titleColor }]
                            ]}
                        >
                            {val.name}
                        </CText>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default SelectTab
