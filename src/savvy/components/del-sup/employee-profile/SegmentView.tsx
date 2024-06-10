/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-10 03:27:24
 * @LastEditTime: 2022-07-18 02:13:50
 * @LastEditors: Yi Li
 */
import React, { useRef, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { CommonLabel } from '../../../enums/CommonLabel'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'

const screenWidth = Dimensions.get('window').width
const defaultDataSource = []

/*
 *dataSource : segment tab data array, such as defaultDataSource
 *segmentTabIcon : if any segment has icon on right, can use this parameter
 *defaultActiveTabIndex : default value is 0
 */
interface SegmentViewPros {
    dataSource?: any[]
    onClickSegmentTabAtIndex?: Function
    segmentTabIcon?: any
    defaultActiveTabIndex?: number
    children?: React.ReactChild | React.ReactChildren | React.ReactElement<any>[]
}
const styles = StyleSheet.create({
    tabView: {
        height: 56,
        backgroundColor: baseStyle.color.black,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        flexDirection: 'row',
        paddingTop: 20,
        paddingHorizontal: baseStyle.padding.pd_22,
        ...commonStyle.fullWidth
    },
    flexDirectionRow: {
        ...commonStyle.flexRowSpaceBet
    },
    marginRight_22: {
        marginRight: 22
    },
    tabButton: {
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 6,
        borderBottomColor: '#000',
        borderBottomWidth: 2
    },
    tabTitle: {
        fontWeight: '600',
        color: '#00A2D9'
    },
    isActive: {
        color: '#FFF',
        borderBottomColor: '#00A2D9'
    }
})

const SegmentView = (props: SegmentViewPros) => {
    const { dataSource, children, onClickSegmentTabAtIndex, segmentTabIcon, defaultActiveTabIndex } = props
    const [activeIndex, setActiveIndex] = useState(defaultActiveTabIndex || CommonLabel.NUMBER_ZERO)
    const resultDataSource = dataSource || defaultDataSource
    const scrollViewRef: any = useRef()
    const isEdit = false

    const onClickSegmentTab = (index) => {
        setActiveIndex(index)
        scrollViewRef.current.scrollTo({ y: 0, x: screenWidth * index })
        onClickSegmentTabAtIndex && onClickSegmentTabAtIndex(index)
    }
    const onScrollToNextPage = (event) => {
        const offset = event.nativeEvent.targetContentOffset
        const isScreenWidthTimes = offset.x % screenWidth === CommonLabel.NUMBER_ZERO
        const actIndex =
            Math.ceil(offset.x / screenWidth) + (isScreenWidthTimes ? CommonLabel.NUMBER_ZERO : CommonLabel.NUMBER_ONE)
        setActiveIndex(actIndex)
    }

    return (
        <View style={commonStyle.flex_1}>
            <View style={styles.tabView}>
                <ScrollView horizontal bounces={false}>
                    {resultDataSource.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={item.title}
                                onPress={() => {
                                    onClickSegmentTab(index)
                                }}
                            >
                                <View style={[styles.flexDirectionRow, styles.marginRight_22]}>
                                    <View style={[styles.tabButton, activeIndex === index && styles.isActive]}>
                                        <CText style={[styles.tabTitle, activeIndex === index && styles.isActive]}>
                                            {item.title}
                                        </CText>
                                    </View>
                                </View>
                                {segmentTabIcon}
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
            <ScrollView
                style={commonStyle.windowWidth}
                horizontal
                pagingEnabled
                scrollEnabled={!isEdit}
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                onScrollEndDrag={onScrollToNextPage}
            >
                {children}
            </ScrollView>
        </View>
    )
}
export default SegmentView
