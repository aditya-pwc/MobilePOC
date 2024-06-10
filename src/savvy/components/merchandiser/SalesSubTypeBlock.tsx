/*
 * @Description: Visit or store list component.
 * @Author: Christopher
 * @Date: 2021-08-06 13:23:45
 * @LastEditTime: 2022-11-27 12:15:48
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import CustomerCellStyle from '../../styles/manager/CustomerCellStyle'
import renderPill from '../common/COrderPill'
const style = StyleSheet.create({
    bottomOfAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 93,
        paddingBottom: 15,
        marginTop: -16
    },

    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    }
})

const styles = CustomerCellStyle
interface VisitCardFooterInterface {
    item: any

    showSalesSubTypeBlock: any
}

const SalesSubTypeBlock = (props: VisitCardFooterInterface) => {
    const { item, showSalesSubTypeBlock } = props
    if (showSalesSubTypeBlock) {
        return (
            <View style={style.bottomOfAddress}>
                <View style={[styles.subtypeContainer]}>
                    {item?.type?.length > 0 &&
                        item.type.map((t) => {
                            return renderPill(t)
                        })}
                </View>
            </View>
        )
    }
    return null
}

export default SalesSubTypeBlock
