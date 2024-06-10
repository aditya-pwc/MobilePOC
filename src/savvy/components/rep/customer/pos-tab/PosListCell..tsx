/*
 * @Description:
 * @LastEditors: Yi Li
 */

import React from 'react'

import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import PosSvg from '../../../../../../assets/image/POS_icon.svg'
import CText from '../../../../../common/components/CText'
const { width } = Dimensions.get('window')
interface PosListCellProps {
    key: any
    title?: string
    subTitle?: string
    tagStyle?: any
    tagTitle?: string
    isYellow?: boolean
    tagTitleStyle?: any
    onPress: () => void
}

const styles = StyleSheet.create({
    cellCont: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width - 44,
        marginHorizontal: 22,
        paddingHorizontal: 20,
        borderRadius: 11,
        backgroundColor: '#FFFFFF'
    },
    cellImage: {
        width: 60,
        height: 60,
        borderRadius: 10
    },
    cellRight: {
        flex: 1,
        marginLeft: 15,
        marginVertical: 18
    },
    titleSting: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 18
    },
    subTitleSting: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 20
    },
    targetCont: {
        flexDirection: 'row'
    },
    tagView: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        height: 20,
        borderRadius: 10,
        marginTop: 4
    },
    tagText: {
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center'
    },
    cellGap: {
        height: 16,
        width: '100%',
        backgroundColor: 'transparent'
    }
})

const PosListCell = (props: PosListCellProps) => {
    const { title, subTitle, tagStyle, tagTitle, tagTitleStyle, key, onPress } = props
    return (
        <View key={key}>
            <TouchableOpacity style={styles.cellCont} onPress={onPress}>
                <PosSvg style={styles.cellImage} />
                <View style={styles.cellRight}>
                    <CText style={styles.titleSting}>{title}</CText>
                    <CText style={styles.subTitleSting}>{subTitle}</CText>
                    <View style={styles.targetCont}>
                        <View style={[styles.tagView, tagStyle]}>
                            <CText style={[styles.tagText, tagTitleStyle]}>{tagTitle?.toUpperCase()}</CText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.cellGap} />
        </View>
    )
}

export default PosListCell
