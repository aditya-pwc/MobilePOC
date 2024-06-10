import React, { FC, useImperativeHandle, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

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
        color: '#00A2D9'
    },
    isActive: {
        color: 'black',
        borderBottomColor: '#00A2D9'
    }
})

interface ProductTabProps {
    setActiveSection: any
    tabStyle?: any
    cRef?: any
    activeIndex?: number
    onPressTab?: any
    activeStep?: number
}

const ProductTab: FC<ProductTabProps> = (props: ProductTabProps) => {
    const {
        setActiveSection,
        tabStyle,
        cRef,
        activeIndex,
        // onPressTab,
        activeStep
    } = props
    const tabList = [
        {
            name: t.labels.PBNA_MOBILE_AGGREGATE.toUpperCase()
        },
        {
            name: t.labels.PBNA_MOBILE_BRANDS.toUpperCase()
        }
    ]
    const [activeTab, setActiveTab] = useState(activeIndex || 0)
    const tabButtonStyle = { ...styles.tabButton, ...((tabStyle && tabStyle.tabButton) || {}) }
    const isActiveStyle = { ...styles.isActive, ...((tabStyle && tabStyle.isActive) || {}) }
    const tabTitleStyle = { ...styles.tabTitle, ...((tabStyle && tabStyle.tabTitle) || {}) }
    useImperativeHandle(cRef, () => ({
        setActiveTab: (v: number) => {
            setActiveTab(v)
        }
    }))
    return (
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={commonStyle.flexDirectionRow}>
                {tabList.map((value, index) => {
                    const indexKey = index.toString()
                    return (
                        <TouchableOpacity
                            key={indexKey}
                            onPress={() => {
                                // setActiveTab(index)
                                setActiveSection(index)
                                // onPressTab(index)
                            }}
                            hitSlop={{
                                left: 30,
                                right: 30,
                                top: 30,
                                bottom: 30
                            }}
                        >
                            <CText>{activeTab !== index}</CText>
                            <View
                                style={[
                                    tabButtonStyle,
                                    activeTab === index ? isActiveStyle : null,
                                    activeStep === 1 &&
                                        activeTab !== index && {
                                            borderBottomColor: '#000',
                                            borderBottomWidth: 3
                                        },
                                    activeStep === 1 && activeTab === index && { borderBottomColor: 'transparent' }
                                ]}
                            >
                                <CText style={[tabTitleStyle, activeTab === index ? isActiveStyle : null]}>
                                    {value.name}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export default ProductTab
