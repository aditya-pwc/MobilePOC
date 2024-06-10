/**
 * @description The base component for showing tab bar.
 * @author Shangmin Dou
 * @date 2021-05-11
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'

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
        borderBottomWidth: 3,
        flexDirection: 'row'
    },
    tabTitle: {
        fontWeight: '600',
        color: '#00A2D9'
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

const CHARACTER_WIDTH = 9
const PADDING_30 = 30
const SCREEN_WIDTH = Dimensions.get('window').width

interface Tab {
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
    const [refreshTab, setRefreshTab] = useState(0)
    const scrollViewRef = useRef<ScrollView | null>(null)

    useEffect(() => {
        if (scrollViewRef.current) {
            let totalTabWidth = 0
            let offset = 0
            const tabWidths: number[] = []

            tabs.forEach((value) => {
                const tabTitle = value.name
                const tabWidth = tabTitle.length * CHARACTER_WIDTH + PADDING_30
                totalTabWidth += tabWidth
                tabWidths.push(tabWidth)
            })

            for (let i = 0; i < activeTab; i++) {
                offset += tabWidths[i]
            }
            offset -= (SCREEN_WIDTH - tabWidths[activeTab]) / 2
            offset = Math.max(0, offset)
            const maxScrollableWidth = totalTabWidth - SCREEN_WIDTH + (tabs.length - 1) * PADDING_30
            offset = Math.min(maxScrollableWidth, offset)
            scrollViewRef.current.scrollTo({ x: offset, animated: true })
        }
    }, [activeTab, refreshTab])

    useImperativeHandle(cRef, () => ({
        setActiveTab: (v) => {
            setActiveTab(v)
        },
        setRefreshTab: () => {
            setRefreshTab((v: number) => v + 1)
        }
    }))
    return (
        <View style={[styles.tabContainer, tabStyle]}>
            <ScrollView
                ref={scrollViewRef}
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
