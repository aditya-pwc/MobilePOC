/**
 * @description Top header title and close button.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-11-28
 */

import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import BlueClear from '../../../../assets/image/ios-close-circle-outline-blue.svg'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

interface OrderInformationProps {
    title: string
    onCloseBtnClick?: Function
    navigation?: any
}

const styles = StyleSheet.create({
    headerView: {
        paddingHorizontal: 22,
        ...commonStyle.flexRowSpaceCenter
    },
    titleView: {
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black
    }
})

const TitleWithCloseBtn = (props: OrderInformationProps) => {
    const { title, onCloseBtnClick, navigation } = props

    const goBack = () => {
        navigation?.goBack()
    }

    return (
        <View style={styles.headerView}>
            <CText style={styles.titleView}>{title}</CText>
            <View>
                <TouchableOpacity
                    onPress={() => {
                        onCloseBtnClick ? onCloseBtnClick() : goBack()
                    }}
                >
                    <BlueClear height={36} width={36} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default TitleWithCloseBtn
