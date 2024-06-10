/*
 * @Description:VisitTimelineItem
 * @Author: Mary Qian
 * @Date: 2022-01-09 23:56:18
 * @LastEditTime: 2022-01-11 15:27:29
 * @LastEditors: Aimee Zhang
 */

import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'
import RedIndicator from '../../../../../assets/image/icon-error-visit-list.svg'
import UpDownArrow from '../../common/UpDownArrow'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import { commonStyle, commonStyle as CommonSty } from '../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    ...commonStyle,
    boldText: {
        fontSize: 12,
        fontWeight: '700'
    },
    normalText: {
        fontSize: 12,
        fontWeight: '400'
    },
    listContainer: {
        flexDirection: 'row'
    },
    leftView: {
        flexDirection: 'column',
        width: 44
    },
    statusImage: {
        width: 20,
        height: 20
    },
    topVerticalLine: {
        marginLeft: 9,
        marginBottom: 6,
        width: 2,
        height: 30,
        backgroundColor: '#D3D3D3'
    },
    grayCircle: {
        width: 20,
        height: 20,
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#D3D3D3'
    },
    bottomVerticalLine: {
        flex: 1,
        marginTop: 6,
        marginLeft: 9,
        width: 2,
        backgroundColor: '#D3D3D3'
    },
    rightView: {
        flex: 1,
        flexDirection: 'column',
        paddingLeft: 15,
        paddingTop: 11,
        paddingRight: 20,
        marginBottom: 20,
        borderRadius: 6,
        minHeight: 80,
        backgroundColor: 'white'
    },
    emptyRightView: {
        justifyContent: 'space-between',
        paddingTop: 19,
        paddingBottom: 15,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ADA9A9',
        backgroundColor: 'transparent'
    },
    emptyTextView: {
        height: 8,
        backgroundColor: '#D3D3D3'
    },
    descriptionView: {
        flex: 1,
        flexDirection: 'row'
    },
    arrowView: {
        width: 55
    },
    arrow: {
        marginTop: -2,
        marginRight: 10,
        alignSelf: 'flex-end'
    },
    activityTimeText: {
        marginBottom: 6,
        width: '100%',
        color: '#565656'
    },
    nameText: {
        fontSize: 14,
        color: '#000'
    },
    detailText: {
        flex: 1,
        marginBottom: 12,
        lineHeight: 18,
        fontSize: 14,
        color: '#565656',
        alignSelf: 'center'
    }
})

export interface TimelineDataProps {
    id?: string
    isEmpty?: boolean
    time?: string
    merchName?: string
    message?: string
    isRed?: boolean
    hasExpand?: boolean
    hideBottomLine?: boolean
    hideTopLine?: boolean
    detailInfo?: any
}

interface VisitTimelineItemProps {
    children?: React.ReactElement
    data?: TimelineDataProps
}

const VisitTimelineItem = (props: VisitTimelineItemProps) => {
    const { children } = props
    const { hideTopLine, hideBottomLine } = props.data

    const [isExpand, setIsExpand] = useState(false)

    const onClickArrow = () => {
        setIsExpand(!isExpand)
    }

    const renderEmptyCell = () => {
        return (
            <View style={styles.listContainer}>
                <View style={styles.leftView}>
                    <View style={[styles.topVerticalLine, { opacity: hideTopLine ? 0 : 1 }]} />
                    <View style={styles.grayCircle} />
                    <View style={[styles.bottomVerticalLine, { opacity: hideBottomLine ? 0 : 1 }]} />
                </View>
                <View style={[styles.rightView, styles.emptyRightView]}>
                    <View style={[styles.emptyTextView, { width: 34, marginBottom: 11 }]} />
                    <View style={[styles.emptyTextView, { width: 233, marginBottom: 11 }]} />
                    <View style={[styles.emptyTextView, { width: 146 }]} />
                </View>
            </View>
        )
    }

    const renderCellWithData = () => {
        const { id, time, merchName, message, isRed, hasExpand } = props.data

        return (
            <View style={styles.listContainer} key={id}>
                <View style={styles.leftView}>
                    <View style={[styles.topVerticalLine, { opacity: hideTopLine ? 0 : 1 }]} />
                    {isRed ? (
                        <RedIndicator style={styles.statusImage} />
                    ) : (
                        <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.statusImage} />
                    )}
                    <View style={[styles.bottomVerticalLine, { opacity: hideBottomLine ? 0 : 1 }]} />
                </View>

                <TouchableOpacity
                    style={styles.rightView}
                    activeOpacity={1}
                    onPress={() => {
                        onClickArrow()
                    }}
                >
                    <View style={CommonSty.flex_1}>
                        <CText style={[styles.normalText, styles.activityTimeText]}>
                            {formatWithTimeZone(time, TIME_FORMAT.HHMMA, true, true)}
                        </CText>

                        <View style={styles.descriptionView}>
                            <CText style={[styles.normalText, styles.detailText]}>
                                <CText style={[styles.boldText, styles.nameText]}>{`${merchName}`}</CText>
                                {message}
                            </CText>

                            <View style={[styles.arrowView, { width: hasExpand ? 55 : 0 }]}>
                                {hasExpand && <UpDownArrow style={styles.arrow} isExpand={isExpand} />}
                            </View>
                        </View>
                        {isExpand && children}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    if (props.data.isEmpty) {
        return renderEmptyCell()
    }

    return renderCellWithData()
}

export default VisitTimelineItem
