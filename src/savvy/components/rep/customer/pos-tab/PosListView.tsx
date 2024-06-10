/*
 * @Description:
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import React from 'react'

import { StyleSheet, View } from 'react-native'
import PosListCell from './PosListCell.'

interface PosListViewProps {
    dataList?: any
    onPress: (arg: any) => void
}

const styles = StyleSheet.create({
    containerStyle: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#F2F4F7'
    },
    list: {
        width: '100%',
        backgroundColor: '#F2F4F7',
        marginTop: 16,
        marginBottom: 100
    }
})
const PosListView = (props: PosListViewProps) => {
    const { dataList, onPress } = props

    return (
        <View style={styles.list}>
            {dataList.map((item: any, index: any) => {
                return (
                    <PosListCell
                        key={item?.Id + index}
                        title={item.title}
                        subTitle={item.subTitle}
                        tagTitle={item.tagTitle}
                        tagStyle={item.tagStyle}
                        tagTitleStyle={item.tagTitleStyle}
                        onPress={() => {
                            onPress(item)
                        }}
                    />
                )
            })}
        </View>
    )
}

export default PosListView
