/*
 * @Author: Matthew
 * @Date: 2022-01-09 20:25:22
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2022-01-13 23:44:09
 */

import React from 'react'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import { StyleSheet, View } from 'react-native'
import _ from 'lodash'
import { commonStyle } from '../../../common/styles/CommonStyle'

interface FTPTProps {
    title: string
    ftFlag: string
    fontSize?: number
    height?: number
    overwriteFTStyle?: any
    overwriteTitileStyle?: any
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    textRole: {
        color: baseStyle.color.titleGray
    },
    gapLine: commonStyle.gapLine
})
export const FTPTWithTitleView: React.FC<FTPTProps> = (props) => {
    /**
     * default Height and FontSzie is set to 13, show nothing if title and ftFlag are unset
     */
    const { title, ftFlag, fontSize = 13, height = 13, overwriteFTStyle, overwriteTitileStyle } = props
    const textSize = { fontSize }
    const gapLineHeight = { height }

    const showFTPT = !_.isEmpty(ftFlag) && (ftFlag?.toLowerCase() === 'true' || ftFlag?.toLowerCase() === 'false')
    const showGapLine = Boolean(showFTPT && title)

    if (!title && !showFTPT) {
        return <></>
    }
    return (
        <View style={styles.container}>
            {showFTPT && (
                <CText style={[styles.textRole, textSize, overwriteFTStyle]}>
                    {ftFlag?.toLowerCase() === 'true' ? 'FT' : 'PT'}
                </CText>
            )}
            {showGapLine && <View style={[styles.gapLine, gapLineHeight]} />}
            {!_.isEmpty(title) && <CText style={[styles.textRole, textSize, overwriteTitileStyle]}>{title}</CText>}
        </View>
    )
}
