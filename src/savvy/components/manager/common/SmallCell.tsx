/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-11-24 13:23:44
 * @LastEditTime: 2022-11-27 12:11:32
 * @LastEditors: Mary Qian
 */
/**
 * @description Small cell component.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2021-11-29
 */

import React, { FC } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import SmallCellStyle from '../../../styles/manager/SmallCellStyle'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'

const styles = SmallCellStyle

interface SmallCellProps {
    itemArr: any
    handleRemove?: Function
    enableHide?: boolean
    controlNum?: any
    isShowMore?: boolean
    setIsShowMore?: Function
}

const SmallCell: FC<SmallCellProps> = (props: SmallCellProps) => {
    const { itemArr, handleRemove, enableHide, isShowMore, setIsShowMore, controlNum } = props

    const renderItem = () => {
        return isShowMore ? (
            <CText style={[styles.attendeesText, styles.showMoreText]}>
                +{itemArr.length - controlNum} {t.labels.PBNA_MOBILE_MORE}
            </CText>
        ) : (
            <CText style={[styles.attendeesText, styles.showMoreText]}>{t.labels.PBNA_MOBILE_HIDE}</CText>
        )
    }

    const getSliceList = () => {
        return isShowMore ? itemArr.slice(CommonLabel.NUMBER_ZERO, controlNum) : itemArr
    }

    return (
        <View style={styles.selectedContainer}>
            {getSliceList().map((item, index) => {
                const indexKey = index.toString()
                return (
                    <View style={styles.itemCell} key={indexKey}>
                        <CText>{item.name}</CText>
                        <TouchableOpacity onPress={() => handleRemove(item)} style={styles.clearItemContainer}>
                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                        </TouchableOpacity>
                    </View>
                )
            })}
            {enableHide && itemArr?.length > controlNum && (
                <TouchableOpacity
                    style={[styles.itemCell, styles.readonlyShowMoreCell]}
                    onPress={() => {
                        setIsShowMore(!isShowMore)
                    }}
                >
                    {renderItem()}
                </TouchableOpacity>
            )}
        </View>
    )
}

export default SmallCell
