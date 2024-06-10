/**
 * @description Component of a type selector
 * @author Kiren Cao
 * @date 2021/11/25
 */
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import React, { Dispatch, FC, SetStateAction } from 'react'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'

interface TypeSelectorProps {
    type: ActivitySelectorEnum | string
    setType: Dispatch<SetStateAction<ActivitySelectorEnum>> | any
    typeArray?: any[]
    itemStyle?: any
}

const styles = StyleSheet.create({
    checkItem: {
        height: 30,
        borderRadius: 20,
        borderColor: '#00A2D9',
        borderWidth: 1,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
        paddingHorizontal: 20,
        marginRight: 10
    },
    checkItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '3%',
        justifyContent: 'space-between'
    }
})
export enum ActivitySelectorEnum {
    'ALL',
    'ORDERS',
    'VISITS',
    'DELIVERIES',
    'OTHERS'
}

export const TypeSelector: FC<TypeSelectorProps> = (props: TypeSelectorProps) => {
    const { type, setType, typeArray, itemStyle } = props
    const lstType: { name: string; type: ActivitySelectorEnum }[] = [
        {
            name: _.capitalize(t.labels.PBNA_MOBILE_ALL),
            type: ActivitySelectorEnum.ALL
        },
        {
            name: t.labels.PBNA_MOBILE_VISITS,
            type: ActivitySelectorEnum.VISITS
        },
        {
            name: t.labels.PBNA_MOBILE_ORDERS_NO_BRACKET,
            type: ActivitySelectorEnum.ORDERS
        },
        {
            name: t.labels.PBNA_MOBILE_DELIVERIES,
            type: ActivitySelectorEnum.DELIVERIES
        },
        {
            name: _.capitalize(t.labels.PBNA_MOBILE_OTHERS),
            type: ActivitySelectorEnum.OTHERS
        }
    ]

    const renderItem = (v: { type: ActivitySelectorEnum; name: string }, k: React.Key) => {
        const isSelected = v.type === type
        const getTextColor = () => {
            return isSelected ? '#ffffff' : '#00A2D9'
        }
        const getTextWeight = () => {
            return isSelected ? 'bold' : '400'
        }
        return (
            <TouchableOpacity
                style={[styles.checkItem, v.type === type && { backgroundColor: '#00A2D9' }, itemStyle]}
                key={k}
                onPress={() => {
                    setType(v.type)
                }}
            >
                <CText style={{ fontWeight: getTextWeight(), color: getTextColor() }}>{v.name}</CText>
            </TouchableOpacity>
        )
    }
    return (
        <ScrollView contentContainerStyle={styles.checkItemContainer} horizontal showsHorizontalScrollIndicator={false}>
            {_.map(typeArray || lstType, renderItem)}
        </ScrollView>
    )
}
