import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { initTabs } from '../../../../hooks/InnovationProductHooks'

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
        borderBottomColor: 'white',
        borderBottomWidth: 3,
        flexDirection: 'row'
    },
    tabTitle: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.LightBlue,
        fontSize: baseStyle.fontSize.fs_12
    },
    isActive: {
        color: baseStyle.color.black,
        borderBottomColor: baseStyle.color.LightBlue,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    grayTextColor: {
        color: baseStyle.color.titleGray,
        borderBottomColor: baseStyle.color.LightBlue,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    metricsSKUTabDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2DD36F',
        marginLeft: 2
    }
})

interface Tab {
    name: string
    dot: boolean
    haveData?: boolean
}

interface TabBarProps {
    tabs: Tab[]
    setActiveSection: any
    cRef?: any
    activeIndex: any
    isShow?: any
    isScrollEnd?: boolean
    setTabs?: any
    item?: any
    tabName?: any
}

const MetricsSKUTab: FC<TabBarProps> = (props: TabBarProps) => {
    const { tabs, setActiveSection, cRef, activeIndex, isScrollEnd, isShow, setTabs, item, tabName } = props
    const scrollViewRef: any = useRef()
    const [activeTab, setActiveTab] = useState(activeIndex || 0)

    const scrollToEndDelay = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd()
        }, 500)
    }

    useImperativeHandle(cRef, () => ({
        setActiveTab: (v: number) => {
            setActiveTab(v)
            setActiveSection(v)
        },
        scrollToEnd: () => {
            scrollToEndDelay()
        }
    }))

    useEffect(() => {
        if (isScrollEnd) {
            scrollToEndDelay()
        }
    }, [isScrollEnd])

    useEffect(() => {
        if (isShow) {
            setActiveTab(0)
            setTabs && setTabs(initTabs(item, tabName))
        }
    }, [isShow])

    return (
        <View style={styles.tabContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={commonStyle.flexDirectionRow}
            >
                {tabs.map((value, index) => {
                    const activeStyle = activeTab === index ? styles.isActive : null
                    return (
                        <TouchableOpacity
                            key={JSON.stringify(value)}
                            onPress={() => {
                                setActiveTab(index)
                                setActiveSection(index)
                            }}
                            hitSlop={{
                                left: 30,
                                right: 30,
                                top: 30,
                                bottom: 30
                            }}
                            disabled={!value.haveData}
                        >
                            <View style={[styles.tabButton, activeStyle]}>
                                <CText style={[styles.tabTitle, value.haveData ? activeStyle : styles.grayTextColor]}>
                                    {value.name}
                                </CText>
                                {value.dot && <View style={styles.metricsSKUTabDot} />}
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export default MetricsSKUTab
