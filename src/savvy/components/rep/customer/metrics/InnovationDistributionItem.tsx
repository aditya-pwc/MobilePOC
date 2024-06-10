/**
 * @description The component for show Innovation Distribution item
 * @author Qiulin Deng
 * @date 2021-11-29
 */
import React from 'react'
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native'
import CText from '../../../../../common/components/CText'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import FastImage from 'react-native-fast-image'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface InnovationDistributionItemProps {
    showContent: any
    item?: any
    isAuthEnabled?: boolean
}

const styles = StyleSheet.create({
    prodSize: {
        fontSize: baseStyle.fontSize.fs_12,
        color: baseStyle.color.titleGray,
        lineHeight: 20
    },
    prodSubName: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        lineHeight: 17
    },
    prodName: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        lineHeight: 17
    },
    natLaunch: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    line: {
        width: 3.93,
        borderRadius: 2.5,
        height: 32,
        marginLeft: 10,
        marginTop: '5%'
    },
    reorderFlagContainer: {
        borderRadius: 15,
        height: 20,
        width: 37,
        marginTop: 3,
        justifyContent: 'center',
        backgroundColor: '#FFC409',
        alignItems: 'center',
        marginEnd: 5
    },
    innovaDistItemContainer: {
        width: '96%',
        justifyContent: 'center'
    },
    innovaMainContent: {
        minHeight: 68,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15
    },
    innovaPic: {
        position: 'absolute',
        top: 14,
        right: 0
    },
    innovaDistItemTopContainer: {
        minHeight: 47.36,
        width: 45,
        marginRight: 15,
        marginTop: 15
    },
    innovaDistTimeUpperContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '75%'
    },
    InnovaDistItemImg: {
        height: 47.36,
        width: 45
    },
    InnovaDistTextContainer: {
        minHeight: 60,
        width: '77%',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    justifyCenter: {
        justifyContent: 'center'
    },
    chevronIcon: {
        width: 15,
        height: 16
    }
})

const LFRedNumber = 74
const LFYellowNumberMin = 75
const LFYellowNumberMax = 89
const SFRedNumber = 64
const SFYellowNumberMin = 65
const SFYellowNumberMax = 74
const InnovationDistributionItem = (props: InnovationDistributionItemProps) => {
    const { showContent, item, isAuthEnabled } = props
    const renderReFlag = () => {
        if (item.item.wkcCsCount > 0) {
            return (
                <View style={styles.reorderFlagContainer}>
                    <CText style={styles.prodName}>{t.labels.PBNA_MOBILE_IP_RE}</CText>
                </View>
            )
        }
    }
    const spaceFormatter = (text: string) => {
        if (text) {
            return text.replace(/ /g, '\u00a0')
        }
    }

    const getDistWTD = (v: any) => {
        let numberOfCustomers =
            v.selectedCustomersValue.length > 0
                ? Number(v.selectedCustomersValue.length)
                : Number(v.distData.wiredCount)
        if (isAuthEnabled) {
            numberOfCustomers = v.item.authCount
        }
        return Math.ceil((Number(v.item.WTDCount) / numberOfCustomers) * 100)
    }

    const renderDistWTD = (v: any) => {
        const result = getDistWTD(v)
        if (result > 100) {
            return <ActivityIndicator />
        }
        return <CText style={[styles.prodName, { textAlign: 'right', marginTop: 6 }]}>{`${result}%`}</CText>
    }

    const renderFlagColor = () => {
        const lcw = getDistWTD(item)
        if (item.distTgt === item.distData.LFValue) {
            if (lcw <= LFRedNumber) {
                return '#EB445A'
            } else if (lcw >= LFYellowNumberMin && lcw <= LFYellowNumberMax) {
                return '#FFC409'
            }
            return '#2DD36F'
        }
        if (lcw <= SFRedNumber) {
            return '#EB445A'
        } else if (lcw >= SFYellowNumberMin && lcw <= SFYellowNumberMax) {
            return '#FFC409'
        }
        return '#2DD36F'
    }

    const isAvailable = () => {
        if (item.item.Product_Availability__c > 0) {
            return '#FFFFFF'
        }
        return '#F2F4F7'
    }

    const isAvailableTextColor = () => {
        if (item.item.Product_Availability__c > 0) {
            return '#000000'
        }
        return '#565656'
    }

    return (
        <View
            style={[
                styles.innovaDistItemContainer,
                {
                    // Dynamic Inline Style
                    backgroundColor: isAvailable()
                }
            ]}
        >
            <View style={styles.innovaMainContent}>
                <View style={styles.innovaDistTimeUpperContainer}>
                    <View style={styles.innovaDistItemTopContainer}>
                        {item.ImageUrl && (
                            <FastImage
                                source={{
                                    uri: item.ImageUrl,
                                    headers: {
                                        Authorization: item.accessToken,
                                        accept: 'image/png'
                                    },
                                    cache: FastImage.cacheControl.web
                                }}
                                style={styles.InnovaDistItemImg}
                                resizeMode={'contain'}
                            />
                        )}
                        {!item.ImageUrl && (
                            <Image
                                style={styles.InnovaDistItemImg}
                                source={require('../../../../../../assets/image/No_Innovation_Product.png')}
                            />
                        )}
                    </View>
                    <View style={styles.InnovaDistTextContainer}>
                        <CText style={[styles.prodName, { color: isAvailableTextColor() }]}>
                            {item.item.Formatted_Sub_Brand_Name__c || item.item.Sub_Brand__c}
                        </CText>
                        <CText style={[styles.prodSubName, { marginTop: 3, color: isAvailableTextColor() }]}>
                            {spaceFormatter(item.item.Formatted_Flavor__c || item.item.Flavor_Name__c)}
                        </CText>
                        <CText style={[styles.prodSize, { marginTop: 3 }]}>
                            {spaceFormatter(item.item.Formatted_Package__c || item.item.Package_Type_Name__c)}
                        </CText>
                        <CText style={[styles.natLaunch, { marginTop: 3 }]}>
                            {t.labels.PBNA_MOBILE_METRICS_NAT_LAUNCH + ' ' + item.item.National_Launch_Date__c}
                        </CText>
                    </View>
                </View>
                <View style={styles.justifyCenter}>
                    <View style={commonStyle.flexRowSpaceBet}>
                        <View style={commonStyle.flexDirectionColumn}>
                            <CText style={styles.prodSize}>Dist % WTD</CText>
                            <View style={commonStyle.flexRowJustifyEnd}>
                                {renderReFlag()}
                                {renderDistWTD(item)}
                            </View>
                        </View>
                        <View style={[styles.line, { backgroundColor: renderFlagColor() }]} />
                    </View>
                </View>
            </View>
            <View style={styles.innovaPic}>
                <ChevronSvg
                    style={[
                        styles.chevronIcon,
                        {
                            transform: [{ rotate: showContent ? '0deg' : '180deg' }]
                        }
                    ]}
                />
            </View>
        </View>
    )
}
export default InnovationDistributionItem
