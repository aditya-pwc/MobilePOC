import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import ArrowUp from '../../../assets/image/icon-arrow-up.svg'
import CText from './CText'
import React, { FC } from 'react'
import _ from 'lodash'
import { t } from '../i18n/t'
import { IntervalTime } from '../../savvy/enums/Contract'

const styles = StyleSheet.create({
    headView: {
        width: '100%',
        marginTop: 30,
        marginBottom: 20
    },
    headTitle: {
        paddingHorizontal: '5%',
        fontSize: 16,
        lineHeight: 19,
        fontWeight: '700',
        color: '#000000'
    },
    cellView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 22,
        borderBottomColor: '#D3D3D3'
    },
    cellLeftView: {
        flex: 4
    },
    cellTitleView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellMargin: {
        marginTop: 24,
        marginBottom: 10
    },
    cellMarginShort: {
        marginTop: 17,
        marginBottom: 17
    },
    cellTitle: {
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        color: '#000000'
    },
    cellSubtitle: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: '400',
        color: '#000000',
        marginBottom: 24
    },
    callBtn: {
        width: 18,
        height: 19
    },
    callImg: {
        width: 18,
        height: 19
    }
})

export interface QuickLinkDataItem {
    id?: string
    title: string
    hasSubtitle: boolean
    subtitle?: string
    subtitle2?: string
    hideArrow?: boolean
    linkPress?: () => void
    phonePress?: () => void
}

export type QuickLinkDataArray = QuickLinkDataItem[]

interface QuickLinksProps {
    headTitle?: string
    dataSource?: QuickLinkDataArray
    QLContainerStyle?: Object
    data?: QuickLinkDataArray
}

export const QuickLinks: FC<QuickLinksProps> = (props: QuickLinksProps) => {
    const { headTitle, dataSource, data, QLContainerStyle } = props
    const titleStr = headTitle || t.labels.PBNA_MOBILE_COPILOT_QUICK_LINKS
    const finalData = dataSource || data

    const renderHeader = (title: string) => {
        return (
            <View style={styles.headView}>
                <CText style={styles.headTitle}>{title}</CText>
            </View>
        )
    }

    const cellBorderBottom = (index: number, arr: QuickLinkDataArray) => {
        return index + 1 === arr.length ? { borderBottomWidth: 0 } : { borderBottomWidth: 1 }
    }

    const renderItem = (item: QuickLinkDataItem, index: number, arr: QuickLinkDataArray) => {
        return (
            <View style={[styles.cellView, cellBorderBottom(index, arr)]} key={item.title}>
                <View style={styles.cellLeftView}>
                    <TouchableOpacity
                        style={[styles.cellTitleView, item.hasSubtitle ? styles.cellMargin : styles.cellMarginShort]}
                        onPress={item.linkPress}
                    >
                        {!item.hideArrow && <ArrowUp />}
                        <CText style={[styles.cellTitle, { marginLeft: !item.hideArrow ? 10 : 0 }]}>
                            {_.toUpper(item.title)}
                        </CText>
                    </TouchableOpacity>
                    {item.hasSubtitle && <CText style={styles.cellSubtitle}>{item.subtitle}</CText>}
                    {!_.isEmpty(item.subtitle2) && <CText style={styles.cellSubtitle}>{item.subtitle2}</CText>}
                </View>
                {item.hasSubtitle && (
                    <TouchableOpacity
                        style={styles.callBtn}
                        onPress={_.debounce(item.phonePress ? item.phonePress : () => {}, IntervalTime.FIVE_HUNDRED, {
                            leading: true,
                            trailing: false
                        })}
                    >
                        <Image style={styles.callImg} source={require('../../../assets/image/icon_call.png')} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }
    return (
        <View style={QLContainerStyle}>
            {renderHeader(titleStr)}
            {finalData!.map((item, index, arr) => {
                return renderItem(item, index, arr)
            })}
        </View>
    )
}

export default QuickLinks
