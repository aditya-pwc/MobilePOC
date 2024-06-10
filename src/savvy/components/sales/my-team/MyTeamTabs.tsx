/*
 * @Date: 2021-12-10 16:20:05
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2021-12-15 15:02:29
 */
/**
 * @description my team tabs .
 * @author Yuan Yue
 * @email yue.yuan@pwc.com
 * @date 2021-11-26
 * @lastModifiedDate 2021-11-26
 * @lastModifiedBy Yuan Yue.
 */

import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import CText from '../../../../common/components/CText'

const styles = MyTeamStyle

interface TabItem {
    tabIndex: number
    userType: string
    label: string
    showFilterBtn?: boolean
}

interface TabsProps {
    changeTab: Function
    tabArr: TabItem[]
    activeTab: number
    countErrorUsers?: any
}

const MyTeamTabs = (props: TabsProps) => {
    const { tabArr, activeTab, changeTab, countErrorUsers = 0 } = props

    const handlePress = (tabItem) => {
        changeTab(tabItem)
    }

    const getStyles = (tabIndex) => {
        return activeTab === tabIndex ? styles.topTabsItemActiveContainer : styles.topTabsItemNormalContainer
    }

    const getTextStyles = (tabIndex) => {
        return activeTab === tabIndex ? styles.topTabsItemActiveText : styles.topTabsItemNormalText
    }
    useEffect(() => {}, [activeTab])

    return (
        <View style={[styles.topTabsContainer, countErrorUsers > 0 && styles.marginTop_0]}>
            {tabArr.map((tabItem) => {
                return (
                    <TouchableOpacity
                        key={tabItem.tabIndex}
                        onPress={() =>
                            handlePress({
                                tabIndex: tabItem.tabIndex,
                                userTypeTemp: tabItem.userType,
                                showFilterBtn: tabItem.showFilterBtn
                            })
                        }
                        style={getStyles(tabItem.tabIndex)}
                    >
                        <CText style={getTextStyles(tabItem.tabIndex)}>{tabItem.label}</CText>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default MyTeamTabs
