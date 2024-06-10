/*
 * @Description:
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import React from 'react'
import { View } from 'react-native'
import { Log } from '../../../../common/enums/Log'
import { getStringValue } from '../../../utils/LandingUtils'
import CText from '../../../../common/components/CText'
import { storeClassLog } from '../../../../common/utils/LogUtils'

interface MarkWordsProps {
    searchStr?: string
    keyArr?: any
    markItemStyle?: any
    markActiveStyle?: any
    markBoxStyle?: any
}

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const splitTextByKeyWords = (text, keywords) => {
    try {
        const regexp = new RegExp(keywords.map((keyword) => escapeRegExp(String(keyword).trim())).join('|'), 'gi')

        return text.replace(/\t/g, '').replace(regexp, '\t$&\t').split(/\t/)
    } catch (error) {
        storeClassLog(
            Log.MOBILE_ERROR,
            'splitTextByKeyWords',
            `splitTextByKeyWords RegExp failed: ${getStringValue(error)}`
        )
    }
}

const MarkWords = (props: MarkWordsProps) => {
    const { searchStr, keyArr, markItemStyle, markActiveStyle, markBoxStyle } = props
    const markKeyWords = (searchStrValue, keyArrValue, markItemStyleValue, markActiveStyleValue, markBoxStyleValue) => {
        if (!searchStrValue) {
            return <View style={markBoxStyleValue} />
        }
        if (!keyArrValue || keyArrValue.length === 0) {
            return <CText style={markItemStyleValue}>{searchStrValue}</CText>
        }
        let strArr
        try {
            strArr = splitTextByKeyWords(searchStrValue, keyArrValue)

            return strArr.map((item, index) => {
                const indexKey = index.toString()
                if (item) {
                    if (keyArrValue.includes(item)) {
                        return (
                            <CText style={markActiveStyleValue} key={indexKey}>
                                {item}
                            </CText>
                        )
                    }
                    return (
                        <CText style={markItemStyleValue || {}} key={indexKey}>
                            {item}
                        </CText>
                    )
                }
                return null
            })
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'markKeyWords', `MarkWords failed ${getStringValue(error)}`)
        }
    }
    return (
        <CText style={markBoxStyle} numberOfLines={4}>
            {markKeyWords(searchStr, keyArr, markItemStyle, markActiveStyle, markBoxStyle)}
        </CText>
    )
}

export default MarkWords
