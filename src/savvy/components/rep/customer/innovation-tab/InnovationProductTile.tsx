/**
 * @description Component to show Innovation Product Tile.
 * @author Qiulin Deng
 * @date 2021-09-14
 * @Lase
 * @param isSelling  is used to develop UI
 */

import React, { useState, useEffect, SetStateAction } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { diffDaysFromToday, isTodayDayWithTimeZone } from '../../../../utils/TimeZoneUtils'
import InnovationProductImg from './InnovationProductImg'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { PriorityProductMenu } from './components/PriorityProductMenu'

const styles = StyleSheet.create({
    container: {
        borderColor: '#D3D3D3',
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        height: 486,
        width: '100%'
    },
    InfoContainer: {
        alignItems: 'center'
    },
    DateContainer: {
        alignItems: 'flex-end'
    },
    DateFont: {
        fontSize: 12
    },
    fontGary: {
        color: '#565656'
    },
    productImageContainer: {
        width: '100%',
        borderRadius: 6
    },
    prodSubNameFont: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 8
    },
    prodNameFont: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 5,
        marginTop: 20
    },
    prodUpper: {
        textTransform: 'uppercase'
    },
    InfoFont: {
        textDecorationLine: 'underline',
        marginTop: '8%'
    },
    countContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 10
    },
    countFont: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Gotham',
        alignItems: 'center',
        justifyContent: 'center'
    },
    skuContainer: {
        paddingRight: '5%',
        justifyContent: 'center'
    },
    orderContainer: {
        marginLeft: '5%',
        marginRight: '5%',
        justifyContent: 'center'
    },
    deliveredContainer: {
        paddingLeft: '5%',
        justifyContent: 'center'
    },
    starIcon: {
        width: 16,
        height: 14
    },
    newReOrderContainer: {
        height: 22,
        minWidth: 61,
        backgroundColor: '#2DD36F',
        borderTopLeftRadius: 6,
        alignItems: 'center',
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        paddingHorizontal: 7
    },
    reOrderContainer: {
        height: 22,
        minWidth: 85,
        backgroundColor: '#FFC409',
        borderTopLeftRadius: 6,
        alignItems: 'center',
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        paddingHorizontal: 7
    },
    launchDateContainer: {
        flexDirection: 'row',
        height: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sellingName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginTop: 16
    },
    sellingSubTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000000'
    },
    rowConV: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 10,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    rowStyle: {
        flexDirection: 'row',
        overflow: 'hidden'
    },
    line: {
        color: '#D3D3D3',
        fontSize: 12,
        marginHorizontal: 2
    },
    daysToEndView: {
        alignSelf: 'center',
        flexDirection: 'row',
        height: 20,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 13,
        backgroundColor: '#FFC409'
    },
    executeBtnWrapper: {
        marginTop: 30,
        alignSelf: 'center',
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    startDayColor: {
        backgroundColor: '#2DD36F',
        paddingLeft: 4,
        paddingRight: 10
    },
    sellingBaseT: {
        fontWeight: '700',
        fontSize: 12
    },
    daysToEndT: {
        color: '#000000'
    },
    startDayT: {
        color: '#FFFFFF'
    },
    executedPill: {
        backgroundColor: '#2DD36F',
        paddingHorizontal: 10
    },
    executePillText: {
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    executeBtn: {
        color: '#00A2D9'
    },
    disabledExecuteBtn: {
        color: '#D3D3D3'
    },
    perfectV: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 10,
        right: 10
    },
    perfectFlagContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    perfectLogo: {
        height: 40,
        width: 40,
        marginLeft: 8
    },
    lobbyContainer: {
        height: 22,
        minWidth: 103,
        backgroundColor: '#004C97',
        borderTopLeftRadius: 5,
        alignItems: 'center',
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        paddingLeft: 11,
        paddingRight: 13
    },
    starWhite: {
        width: 22,
        height: 20
    },
    titleCon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    alignLeft: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    marginBottom_8: {
        marginBottom: 8
    },
    marginBottom_5: {
        marginBottom: 5
    },
    titlePadding: {
        paddingHorizontal: 40
    },
    sellingBackgroundColor: {
        // backgroundColor: '#F2F4F7'
    },
    imhWhiteBg: {
        backgroundColor: '#FFFFFF'
    },
    lineStyle: {
        width: 1,
        height: 13,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 4
    },
    tagTitle: {
        fontWeight: '400',
        fontSize: 12
    },
    flagItemCon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    ppColor: {
        color: '#EB445A',
        fontWeight: 'bold'
    },
    normalColor: {
        color: '#000000'
    },
    lobbyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    summaryViewContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        height: 40
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4
    },
    summaryDivider: {
        marginVertical: 5,
        borderLeftWidth: 1,
        borderColor: '#D3D3D3'
    },
    launchItemText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        textTransform: 'uppercase'
    },
    launchDayText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    flagPlaceHolder: {
        flexDirection: 'row',
        height: 20,
        width: 130
    },
    imgCamera: {
        width: 16,
        height: 13,
        marginRight: 5
    }
})

interface InnovationProductTileProps {
    disabled?: boolean
    navigation: any
    item?: any
    storePriority?: any
    index: number
    prodSize?: number
    accessToken?: any
    retailStore?: any
    prodLaunchTwoWks?: any
    onTileGoBack?: any
    spStatus?: any
    updateCarousel?: Function
    isLimit?: boolean
    isGoBackToCustomer?: boolean
    isSelling?: boolean
    onClickExecute?: Function
    sellingData?: any
    setReturnFromDetail?: any
    setRouteParamsEmpty?: any
}

const getPerfectStoreTagData = (itemSelling: any) => {
    const tagOriginArr = itemSelling.Perfect_Store_Tag__c !== null ? itemSelling.Perfect_Store_Tag__c.split(';') : []
    const tagArr = []
    const ppArr = tagOriginArr.filter((tagStr) => tagStr.indexOf(t.labels.PBNA_MOBILE_PP) > -1)
    const cdaArr = tagOriginArr.filter((tagStr) => tagStr.indexOf(t.labels.PBNA_MOBILE_CDA) > -1)
    const fdArr = tagOriginArr.filter((tagStr) => tagStr.indexOf(t.labels.PBNA_MOBILE_FD) > -1)
    if (ppArr.length > 0) {
        tagArr.push(t.labels.PBNA_MOBILE_PP)
    }
    if (cdaArr.length > 0) {
        tagArr.push(t.labels.PBNA_MOBILE_CDA)
    }
    if (fdArr.length > 0) {
        tagArr.push(t.labels.PBNA_MOBILE_FD)
    }
    return tagArr
}

const renderDescText = (title: string, subTitle: string) => {
    return (
        <View style={styles.rowStyle}>
            <CText style={[styles.DateFont, styles.fontGary]}>{title} </CText>
            <CText style={styles.DateFont} numberOfLines={1} ellipsizeMode="clip">
                {subTitle}
            </CText>
        </View>
    )
}

const renderLobbyFlag = (itemSelling: any) => {
    if (!itemSelling.priorityType) {
        return <View />
    }
    return (
        <View style={styles.lobbyContainer}>
            <CText style={styles.lobbyText}>{itemSelling.priorityType}</CText>
        </View>
    )
}

const renderFlagItem = (title: string, showLine: boolean) => {
    const titleColor = title === 'PP' ? styles.ppColor : styles.normalColor
    return (
        <View style={styles.flagItemCon} key={title}>
            <CText style={[styles.tagTitle, titleColor]}>{title}</CText>
            {showLine && <View style={styles.lineStyle} />}
        </View>
    )
}
export const renderPerfectFlag = (itemSelling: any, isArchivedPage?: boolean, renderAddOn?: () => React.ReactNode) => {
    if (!itemSelling) {
        return <View />
    }
    const tagArr = getPerfectStoreTagData(itemSelling)
    return (
        <View style={isArchivedPage ? styles.perfectFlagContainer : styles.perfectV}>
            {tagArr.map((titItem, index) => {
                return renderFlagItem(titItem, index < tagArr.length - 1)
            })}
            {!isArchivedPage && (
                <Image style={styles.perfectLogo} resizeMode={'stretch'} source={ImageSrc.LOGO_PERFECT_STORE} />
            )}
            {typeof renderAddOn === 'function' && renderAddOn()}
        </View>
    )
}

// export for reuse
export const renderDaysToEndView = (itemSelling: any, isExecuted = false) => {
    if (isExecuted) {
        return (
            <TouchableOpacity style={[styles.daysToEndView, styles.executedPill]}>
                <CText style={[styles.sellingBaseT, styles.executePillText]}>
                    {t.labels.PBNA_MOBILE_EXECUTE_LOWER}
                </CText>
            </TouchableOpacity>
        )
    }

    const showStartDay =
        moment().add(14, 'd') >= moment(itemSelling.Start_Date__c) && moment() < moment(itemSelling.Start_Date__c)
    const showEndDay =
        moment().add(7, 'd') >= moment(itemSelling.End_Date__c) &&
        moment() < moment(itemSelling.End_Date__c) &&
        moment() > moment(itemSelling.Start_Date__c)
    const showLastDay = isTodayDayWithTimeZone(itemSelling.End_Date__c, true)
    if (isTodayDayWithTimeZone(itemSelling.Start_Date__c, true)) {
        return (
            <TouchableOpacity style={[styles.daysToEndView, styles.startDayColor]}>
                <Image style={styles.starWhite} resizeMode={'contain'} source={ImageSrc.LOGO_STAR_WHITE} />
                <CText style={[styles.sellingBaseT, styles.startDayT]}>
                    {t.labels.PBNA_MOBILE_START.toLocaleUpperCase()} {t.labels.PBNA_MOBILE_DAY.toLocaleUpperCase()}!
                </CText>
            </TouchableOpacity>
        )
    } else if (showStartDay || showEndDay || showLastDay) {
        let titleDay = ''
        if (showStartDay) {
            const gapDays =
                diffDaysFromToday(itemSelling.Start_Date__c) > CommonLabel.NUMBER_ONE
                    ? t.labels.PBNA_MOBILE_DAYS.toLocaleUpperCase()
                    : t.labels.PBNA_MOBILE_DAY.toLocaleUpperCase()
            titleDay = `${diffDaysFromToday(itemSelling.Start_Date__c)} ${gapDays} ${
                t.labels.PBNA_MOBILE_DAYS_TO_START
            }`
        } else if (showEndDay) {
            const gapDays =
                diffDaysFromToday(itemSelling.End_Date__c) > CommonLabel.NUMBER_ONE
                    ? t.labels.PBNA_MOBILE_DAYS.toLocaleUpperCase()
                    : t.labels.PBNA_MOBILE_DAY.toLocaleUpperCase()
            titleDay = `${diffDaysFromToday(itemSelling.End_Date__c)} ${gapDays} ${t.labels.PBNA_MOBILE_DAYS_TO_END}`
        } else if (showLastDay) {
            titleDay = t.labels.PBNA_MOBILE_LAST_DAY
        }
        return (
            <TouchableOpacity style={styles.daysToEndView}>
                <CText style={[styles.sellingBaseT, styles.daysToEndT]}>{titleDay}</CText>
            </TouchableOpacity>
        )
    }
    return null
}

export const renderStartAndEndDate = (
    item: any,
    isSelling: boolean = false,
    isInExecutionPage?: boolean,
    isArchivedPage?: boolean
) => {
    let DATE_LEFT_TEXT_ONE
    if (isArchivedPage) {
        DATE_LEFT_TEXT_ONE = t.labels.PBNA_MOBILE_START
    } else if (!isArchivedPage && isSelling) {
        DATE_LEFT_TEXT_ONE = t.labels.PBNA_MOBILE_START_DATE + ':'
    } else {
        DATE_LEFT_TEXT_ONE = t.labels.PBNA_MOBILE_SORT_NAT_LAUNCH_DATE + ':'
    }
    const END_DATE_LEFT_TEXT = isArchivedPage ? t.labels.PBNA_MOBILE_END : t.labels.PBNA_MOBILE_END_DATE + ':'
    return (
        <View
            style={[
                styles.rowConV,
                (isInExecutionPage || isArchivedPage) && styles.alignLeft,
                isArchivedPage && styles.marginBottom_5
            ]}
        >
            {renderDescText(
                DATE_LEFT_TEXT_ONE,
                moment(isSelling ? item.Start_Date__c : item['Product.National_Launch_Date__c']).format('MMM DD, YYYY')
            )}
            {isSelling && <CText style={styles.line}>|</CText>}
            {isSelling &&
                renderDescText(
                    END_DATE_LEFT_TEXT,
                    moment(isSelling ? item.End_Date__c : item['Product.National_Launch_Date__c']).format(
                        'MMM DD, YYYY'
                    )
                )}
        </View>
    )
}

export const renderCardTitle = (item: any, isSelling: boolean = false, isInExecutionPage?: boolean) => {
    return (
        <View style={[styles.titleCon, !isSelling && styles.titlePadding, isInExecutionPage && styles.alignLeft]}>
            <CText
                style={[
                    styles.prodNameFont,
                    isSelling && styles.sellingName,
                    !isSelling && styles.prodUpper,
                    isInExecutionPage && styles.marginBottom_8
                ]}
                numberOfLines={1}
            >
                {isSelling ? item.Card_Title__c : item['Product.Formatted_Brand__c'] || item['Product.Brand_Name__c']}
            </CText>
            <CText
                style={[styles.prodSubNameFont, isSelling && styles.sellingSubTitle, !isSelling && styles.prodUpper]}
                numberOfLines={1}
            >
                {isSelling
                    ? item.Card_Subtitle__c
                    : item['Product.Formatted_Sub_Brand_Name__c'] || item['Product.Sub_Brand__c']}
            </CText>
        </View>
    )
}

export const renderExecuteButton = (
    item: any,
    storeId: string,
    exeFn?: Function,
    setFlagAction?: React.Dispatch<SetStateAction<number>>,
    needDisabled?: boolean
) => {
    return (
        <TouchableOpacity
            disabled={needDisabled}
            style={styles.executeBtnWrapper}
            onPress={() => {
                exeFn && exeFn(item, storeId, setFlagAction)
            }}
        >
            <Image source={ImageSrc.IMG_CAMERA1} style={styles.imgCamera} />
            <CText style={[styles.sellingBaseT, needDisabled ? styles.disabledExecuteBtn : styles.executeBtn]}>
                {t.labels.PBNA_MOBILE_EXECUTE}
            </CText>
        </TouchableOpacity>
    )
}

const renderInnovationSummaryView = (item: any, orderedC: number, deliveredC: number) => {
    return (
        <View style={styles.summaryViewContainer}>
            <View style={[styles.skuContainer, { minWidth: '25%' }]}>
                <CText style={[styles.DateFont, styles.fontGary]}> {t.labels.PBNA_MOBILE_IP_TOTAL_SKUS} </CText>
                <CText style={styles.summaryText}> {item.count} </CText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.orderContainer, { minWidth: '20%' }]}>
                <CText style={[styles.DateFont, styles.fontGary]}> {t.labels.PBNA_MOBILE_IP_ORDERED} </CText>
                <CText style={styles.summaryText}> {orderedC} </CText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.deliveredContainer, { minWidth: '24%' }]}>
                <CText style={[styles.DateFont, styles.fontGary]}> {t.labels.PBNA_MOBILE_IP_DELIVERED} </CText>
                <CText style={styles.summaryText}> {deliveredC} </CText>
            </View>
        </View>
    )
}

const InnovationProductTile = (props: InnovationProductTileProps) => {
    const {
        disabled = false,
        navigation,
        item,
        storePriority,
        index,
        prodSize,
        accessToken,
        retailStore,
        prodLaunchTwoWks,
        onTileGoBack,
        spStatus,
        updateCarousel,
        isLimit,
        isGoBackToCustomer,
        isSelling,
        onClickExecute,
        sellingData,
        setReturnFromDetail
    } = props
    const handleDetailGoBack = (pageNumber: number) => {
        onTileGoBack(pageNumber)
    }
    const [orderedCount, setOrderedCount] = useState(0)
    const [deliveredCount, setDeliveredCount] = useState(0)
    const [reorderFlag, setReorderFlag] = useState(false)
    const [noFlag, setNoFlag] = useState(false)

    useEffect(() => {
        setOrderedCount(item.orderedCount)
        setDeliveredCount(item.deliveredCount)
        setReorderFlag(item.hasReorder)
        setNoFlag(item.noFlag)
    }, [item.orderedCount, item.deliveredCount, item.hasReorder, item.noFlag])

    const renderLaunchItem = () => {
        if (moment(item['Product.National_Launch_Date__c']).diff(moment().format('YYYY-MM-DD'), 'days') > 0) {
            const countDown = moment(item['Product.National_Launch_Date__c']).diff(
                moment().format('YYYY-MM-DD'),
                'days'
            )
            if (countDown === 1) {
                return (
                    <View style={[styles.launchDateContainer, { backgroundColor: '#FFC409', paddingHorizontal: 10 }]}>
                        <CText style={styles.launchItemText}>
                            {countDown + ' ' + t.labels.PBNA_MOBILE_IP_DAY_TO_LAUNCH}
                        </CText>
                    </View>
                )
            }
            return (
                <View style={[styles.launchDateContainer, { backgroundColor: '#FFC409', paddingHorizontal: 10 }]}>
                    <CText style={styles.launchItemText}>
                        {countDown + ' ' + t.labels.PBNA_MOBILE_IP_DAYS_TO_LAUNCH}
                    </CText>
                </View>
            )
        } else if (moment(item['Product.National_Launch_Date__c']).diff(moment().format('YYYY-MM-DD'), 'days') === 0) {
            return (
                <View
                    style={[
                        styles.launchDateContainer,
                        { backgroundColor: '#2DD36F', paddingLeft: 4, paddingRight: 10 }
                    ]}
                >
                    <Image
                        style={styles.starIcon}
                        source={require('../../../../../../assets/image/icon_star_white.png')}
                    />
                    <CText style={styles.launchDayText}>{' ' + t.labels.PBNA_MOBILE_IP_LAUNCH_DAY}</CText>
                </View>
            )
        }
        return <View style={styles.flagPlaceHolder} />
    }

    const handleUpdateCarousel = () => {
        updateCarousel && updateCarousel()
    }

    const renderReOrderFlag = () => {
        if (reorderFlag) {
            return (
                <View style={styles.reOrderContainer}>
                    <CText style={styles.launchItemText}>{t.labels.PBNA_MOBILE_IP_REORDER}</CText>
                </View>
            )
        } else if (noFlag) {
            return <View />
        }
        return (
            <View style={styles.newReOrderContainer}>
                <CText style={styles.launchDayText}>{t.labels.PBNA_MOBILE_IP_NEW}</CText>
            </View>
        )
    }

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={() => {
                props.setRouteParamsEmpty && props.setRouteParamsEmpty()
                Instrumentation.reportMetric('PSR Taps On Carousel Card', 1)
                navigation.navigate('InnovationProductDetail', {
                    retailStore: retailStore,
                    accessToken: accessToken,
                    correctPage: index,
                    prodLaunchTwoWks: prodLaunchTwoWks,
                    onDetailGoBack: handleDetailGoBack,
                    orderedCount: item.orderedCount,
                    deliveredCount: item.deliveredCount,
                    spStatus: spStatus,
                    updateCarousel: handleUpdateCarousel,
                    isGoBackToCustomer: isGoBackToCustomer,
                    isLimit,
                    isSelling, // show selling carousel detail
                    sellingData,
                    onClickExecute,
                    setReturnFromDetail
                })
            }}
            activeOpacity={1}
            style={[styles.container, isSelling && styles.sellingBackgroundColor]}
        >
            {disabled && (
                <View
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#00000033'
                    }}
                />
            )}
            <View style={styles.InfoContainer} key={item.Id}>
                <View style={[styles.productImageContainer, styles.imhWhiteBg]}>
                    <InnovationProductImg item={item} isSelling={isSelling} accessToken={accessToken} />
                </View>
                <View style={[commonStyle.fullWidth, commonStyle.alignItemsCenter]}>
                    {renderCardTitle(item, isSelling)}
                    {renderStartAndEndDate(item, isSelling)}
                    {isSelling && renderDaysToEndView(item)}
                    {!isSelling && renderLaunchItem()}
                    {!isSelling && renderInnovationSummaryView(item, orderedCount, deliveredCount)}
                    {isSelling && renderExecuteButton(item, retailStore.Id, onClickExecute)}
                </View>
            </View>
            <View style={styles.countContainer}>
                <View style={styles.countFont}>
                    <CText style={styles.DateFont}>
                        {' '}
                        {index > 5 && !isSelling ? index - 1 : index}/{prodSize}
                    </CText>
                </View>
            </View>
            {!isSelling && renderReOrderFlag()}
            {isSelling && renderLobbyFlag(item)}
            {isSelling &&
                retailStore?.Id &&
                item?.Id &&
                storePriority?.Id &&
                renderPerfectFlag(item, false, () => (
                    <PriorityProductMenu retailStoreId={retailStore.Id} priority={item} storePriority={storePriority} />
                ))}
        </TouchableOpacity>
    )
}

export default InnovationProductTile
