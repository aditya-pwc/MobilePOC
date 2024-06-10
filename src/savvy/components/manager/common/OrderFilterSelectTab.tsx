/**
 * @description landing page component.
 * @author Jiajun Ma
 * @email jiajun.ma@pwc.com
 * @date 2021-07-22
 */
import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'

const styles = StyleSheet.create({
    topTabsContainer: {
        height: 44,
        padding: 6,
        marginTop: 13,
        borderRadius: 4,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row'
    },
    topTabsItemActiveContainer: {
        flex: 1,
        backgroundColor: '#00A2D9',
        borderRadius: 4,
        ...commonStyle.alignCenter
    },
    topTabsItemNormalContainer: {
        flex: 1,
        borderRadius: 4,
        ...commonStyle.alignCenter
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
    }
})

interface SelectTabProps {
    tabs: Array<string>
    changeTab: any
    activeTab: any
    style?: any
}

const OrderFilterSelectTab = (props: SelectTabProps) => {
    const { tabs, changeTab, activeTab, style } = props
    return (
        <View style={[styles.topTabsContainer, style]}>
            {tabs.map((tabName, index) => {
                return (
                    <TouchableOpacity
                        key={tabName}
                        onPress={() => changeTab(index)}
                        style={
                            activeTab === index ? styles.topTabsItemActiveContainer : styles.topTabsItemNormalContainer
                        }
                    >
                        <CText
                            style={activeTab === index ? styles.topTabsItemActiveText : styles.topTabsItemNormalText}
                        >
                            {tabName.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default OrderFilterSelectTab
