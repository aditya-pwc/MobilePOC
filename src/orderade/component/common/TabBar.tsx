/**
 * @description The base component for showing tab bar.
 * @author Shangmin Dou
 * @date 2021-05-11
 */
import React, { FC, useImperativeHandle, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tabButton: {
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 30,
        borderBottomColor: '#000',
        borderBottomWidth: 2,
        flexDirection: 'row'
    },
    tabTitle: {
        fontWeight: '600',
        color: '#00A2D9',
        fontSize: 12
    },
    isActive: {
        color: '#FFF',
        borderBottomColor: '#00A2D9'
    },
    dotStyle: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2DD36F',
        marginLeft: 2
    }
})

export interface Tab {
    name: string
    dot: boolean
}

interface TabBarProps {
    tabs: Tab[]
    setActiveSection: any
    tabStyle?: any
    tabTitleCustom?: any
    tabBtnStyle?: any
    selectTitle?: any
    barInitialPosition?: any
    cRef?: any
    defaultTab?: number
}

const TabBar: FC<TabBarProps> = (props: TabBarProps) => {
    const {
        tabs,
        setActiveSection,
        barInitialPosition,
        cRef,
        tabStyle,
        tabTitleCustom,
        tabBtnStyle,
        selectTitle,
        defaultTab
    } = props
    const [activeTab, setActiveTab] = useState(defaultTab || 0)
    useImperativeHandle(cRef, () => ({
        setActiveTab: (v) => {
            setActiveTab(v)
        }
    }))
    return (
        <View style={[styles.tabContainer, tabStyle]}>
            <ScrollView
                horizontal
                contentOffset={barInitialPosition}
                showsHorizontalScrollIndicator={false}
                style={commonStyle.flexDirectionRow}
            >
                {tabs.map((value, index) => {
                    return (
                        <TouchableOpacity
                            key={value.name}
                            testID={value.name}
                            accessible={false}
                            onPress={() => {
                                setActiveTab(index)
                                setActiveSection(index, value)
                            }}
                            hitSlop={commonStyle.hitSlop30}
                        >
                            <View style={[styles.tabButton, tabBtnStyle, activeTab === index ? styles.isActive : null]}>
                                <CText
                                    style={[
                                        styles.tabTitle,
                                        tabTitleCustom,
                                        activeTab === index ? selectTitle || styles.isActive : null
                                    ]}
                                >
                                    {value.name}
                                </CText>
                                {value.dot && <View style={styles.dotStyle} />}
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export default TabBar
