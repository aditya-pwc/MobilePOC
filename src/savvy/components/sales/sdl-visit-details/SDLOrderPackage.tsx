/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2022-01-18 00:43:16
 * @LastEditTime: 2023-04-25 09:13:14
 * @LastEditors: Aimee Zhang
 */

import React, { useState } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import Accordion from 'react-native-collapsible/Accordion'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { t } from '../../../../common/i18n/t'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface SDLOrderPackageProps {
    section
    accordionType?
}
export enum ACCORDION_TYPE {
    ORDER = 'Order',
    RETURNS = 'Returns',
    PACKAGE = 'Package'
}

const styles = StyleSheet.create({
    ...commonStyle,
    accordionContain: {
        width: '100%',
        backgroundColor: '#FFF'
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#FFF',
        alignItems: 'center'
    },
    borderLine: {
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3'
    },
    sectionTitleCon: {
        flex: 5,
        justifyContent: 'center',
        marginLeft: 22
    },
    sectionPadding28: {
        paddingVertical: 28
    },
    sectionPadding15: {
        paddingVertical: 15
    },
    sectionTitle: {
        fontWeight: '900',
        color: '#000000',
        fontSize: 18
    },
    sectionSubTitleCon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    marginTop5: {
        marginTop: 5
    },
    sectionSubTitle: {
        fontWeight: '400',
        fontSize: 12
    },
    subTitleGray: {
        color: '#565656'
    },
    sectionSubTitle16: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 16
    },
    qtyTitle: {
        fontWeight: '400',
        color: '#565656'
    },
    qtyNum: {
        fontWeight: '700',
        color: '#000000'
    },
    fontSize12: {
        fontSize: 12
    },
    fontSize14: {
        fontSize: 14
    },
    icon: {
        width: 26,
        height: 26,
        marginRight: 22
    },
    iconRotate: {
        transform: [{ rotateX: '180deg' }]
    },
    cellContain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 22,
        paddingVertical: 18
    },
    packageQuantity: {
        flexDirection: 'row',
        flex: 1
    },
    productInfo: {
        marginHorizontal: 22,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#000000'
    },
    sumContain: {
        flex: 1,
        marginLeft: 22,
        marginBottom: 29
    },
    sepLine: {
        width: 1,
        height: 15,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 5
    },
    packageSum: {
        flex: 2,
        marginLeft: 25
    },
    flex_3: {
        flex: 3
    },
    orderContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 2
    },
    imageChevronDownStyle: {
        flex: 1,
        alignItems: 'flex-end'
    }
})

const getMathFloor = (num) => {
    return parseFloat(num || '0').toFixed(2)
}

const renderCellView = (element, index, type) => {
    const hasLine = index > 0
    const isReturn = type === ACCORDION_TYPE.RETURNS
    return (
        <View key={index} style={[styles.cellContain, hasLine && styles.borderLine]}>
            <View style={styles.flex_3}>
                <CText
                    style={[isReturn ? styles.qtyTitle : styles.qtyNum, styles.fontSize14]}
                    numberOfLines={3}
                    ellipsizeMode={'tail'}
                >
                    {element?.subBrand || ''}
                </CText>
                {!isReturn && (
                    <CText style={[styles.qtyTitle, styles.fontSize12, styles.marginTop5]}>
                        {element?.productCode || '-'}/{element?.materialUniqueID || ''}
                    </CText>
                )}
            </View>
            <View style={styles.orderContainer}>
                <CText style={[styles.qtyTitle, styles.fontSize12]}>
                    {' '}
                    {isReturn ? `${t.labels.PBNA_MOBILE_ORDER_CS} ` : ''}
                    <CText style={[styles.qtyNum, styles.fontSize12]}>
                        {isReturn
                            ? element?.wholeCasesQuantity || '0'
                            : `${t.labels.PBNA_MOBILE_ORDER_D} ${getMathFloor(element?.orderItemLnUnitPrcAmt)}`}
                    </CText>
                </CText>
                <View style={styles.sepLine} />
                <CText style={[styles.qtyTitle, styles.fontSize12]}>
                    {' '}
                    {isReturn ? t.labels.PBNA_MOBILE_ORDER_UN : t.labels.PBNA_MOBILE_ORDER_QTY}
                    <CText style={[styles.qtyNum, styles.fontSize12]}>
                        {' '}
                        {isReturn ? element?.orderItemRemainderUnitQuantity || '0' : element?.quantity || '0'}
                    </CText>
                </CText>
            </View>
        </View>
    )
}

const renderContentCell = (section, type) => {
    return (
        <View>
            <View style={styles.productInfo}>
                <CText style={[styles.qtyNum, styles.fontSize12]}>{t.labels.PBNA_MOBILE_PROD_INFO.toUpperCase()}</CText>
            </View>
            {section.orderItems.map((element, index) => {
                return renderCellView(element, index, type)
            })}
        </View>
    )
}

const renderSumView = (title, subTitle) => {
    return (
        <View style={styles.sumContain}>
            <CText style={[styles.sectionSubTitle, styles.subTitleGray]}>{title}</CText>
            <CText style={[styles.sectionSubTitle16, styles.marginTop5]}>{subTitle}</CText>
        </View>
    )
}

export const renderHeader = (content, _index, isActive) => {
    return (
        <View style={[styles.sectionHeader, styles.borderLine]}>
            <View
                style={[
                    styles.sectionTitleCon,
                    content.type === ACCORDION_TYPE.PACKAGE ? styles.sectionPadding15 : styles.sectionPadding28
                ]}
            >
                <CText style={content.type === ACCORDION_TYPE.PACKAGE ? styles.sectionSubTitle : styles.sectionTitle}>
                    {content.header}
                </CText>
                <View style={[styles.sectionSubTitleCon, styles.marginTop5]}>
                    <CText
                        style={[
                            { flex: 3 },
                            content.type === ACCORDION_TYPE.PACKAGE ? styles.sectionSubTitle16 : styles.sectionSubTitle
                        ]}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {content.type !== ACCORDION_TYPE.PACKAGE && (
                            <CText style={styles.subTitleGray}>{t.labels.PBNA_MOBILE_ORDER_DELIVERY} </CText>
                        )}
                        {content.title}
                    </CText>
                    {content.type === ACCORDION_TYPE.PACKAGE && (
                        <View style={[styles.packageQuantity, styles.packageSum]}>
                            <CText style={[styles.qtyTitle, styles.fontSize12]}>{t.labels.PBNA_MOBILE_ORDER_QTY}</CText>
                            <CText
                                style={[styles.qtyNum, styles.fontSize12, { marginRight: 25 }]}
                                numberOfLines={1}
                                ellipsizeMode={'tail'}
                            >
                                {' '}
                                {content.orderQuantity}
                            </CText>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.imageChevronDownStyle}>
                <Image style={[styles.icon, isActive && styles.iconRotate]} source={ImageSrc.IOS_CHEVRON_DOWN} />
            </View>
        </View>
    )
}

const SDLOrderPackage = (props: SDLOrderPackageProps) => {
    const { section } = props
    const [packageActiveSections, setPackageActiveSections] = useState([])

    const updatePackageActiveSections = (currentSections) => {
        setPackageActiveSections(currentSections)
    }

    return (
        <View style={styles.accordionContain} key={section?.Id + section?.header}>
            {section.type !== ACCORDION_TYPE.RETURNS && (
                <View style={styles.packageQuantity}>
                    {renderSumView(
                        t.labels.PBNA_MOBILE_ORDER_QUANTITY,
                        `${section.orderQuantity || '0'} ${t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()}`
                    )}
                    {renderSumView(
                        t.labels.PBNA_MOBILE_ORDER_TOTAL_AMOUNT,
                        `${t.labels.PBNA_MOBILE_ORDER_D} ${getMathFloor(section.totalAmount)}`
                    )}
                </View>
            )}
            <Accordion
                key={section?.header}
                containerStyle={styles.accordionContain}
                keyExtractor={(item: any, index) => item?.title + index}
                sections={section.packages}
                expandMultiple
                activeSections={packageActiveSections}
                renderHeader={(content, index, isActive) => {
                    return renderHeader(content, index, isActive)
                }}
                renderContent={(sectionPac) => {
                    return renderContentCell(sectionPac, section.type)
                }}
                onChange={updatePackageActiveSections}
            />
        </View>
    )
}

export default SDLOrderPackage
