/**
 * @description View Delivery Information component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-06-11
 */

import React, { useState, useEffect } from 'react'
import {
    ScrollView,
    StyleSheet,
    View,
    SafeAreaView,
    Image,
    TouchableOpacity,
    NativeAppEventEmitter
} from 'react-native'
import _ from 'lodash'
import CText from '../../../common/components/CText'
import DeliveryCard from './DeliveryCard'
import Accordion from 'react-native-collapsible/Accordion'
import DeliveryLogo, {
    getNumberString,
    getShipmentAndOrderItemFromLocalData,
    getIndicatorType,
    ACCORDION_TYPE,
    INDICATOR_TYPE,
    getDeliveryCardIndicator
} from './DeliveryLogo'
import { EventEmitterType } from '../../enums/Manager'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    ...commonStyle,
    containerHeader: {
        minHeight: 180
    },
    iconLarge: {
        width: 36,
        height: 36
    },
    commentView: {
        marginTop: 1,
        marginBottom: 30
    },
    commentTitle: {
        fontWeight: '400',
        color: '#565656',
        fontSize: 12
    },
    commentSubTitle: {
        marginTop: 5,
        fontWeight: '400',
        color: '#000000',
        fontSize: 14
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3'
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3'
    },
    sectionTitleCon: {
        justifyContent: 'center',
        height: 70
    },
    sectionTitle: {
        fontWeight: '900',
        color: '#000000',
        fontSize: 18,
        marginLeft: 22
    },
    palletContainer: {
        flex: 1
    },
    palletTitle: {
        fontSize: 12,
        marginTop: 31,
        paddingBottom: 10
    },
    palletLine: {
        height: 1,
        backgroundColor: '#000000'
    },
    packageView: {
        width: '100%'
    },
    packageTitle: {
        marginTop: 6
    },
    packageName: {
        marginTop: 5,
        fontSize: 16
    },
    shipmentItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    marginLength: {
        marginLeft: 22,
        marginRight: 22
    },
    shipmentItemLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    shipmentTitle: {
        flex: 2,
        fontSize: 14,
        fontWeight: '400',
        color: '#565656',
        paddingTop: 15,
        paddingBottom: 15,
        width: '50%'
    },
    shipmentDetail: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center'
    },
    shipmentRight: {
        flex: 1,
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center'
    },
    countLabel: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 12
    },
    icon: {
        width: 18,
        height: 18,
        marginRight: 22
    },
    iconRotate: {
        transform: [{ rotateX: '180deg' }]
    },
    tabContainer: {
        flexDirection: 'row',
        height: 84
    },
    tabItem: {
        marginLeft: 22,
        marginRight: 10,
        marginTop: 30,
        justifyContent: 'center'
    },
    tabTitleBlue: {
        color: '#00A2D9'
    },
    lineView: {
        marginLeft: 1,
        marginRight: 1,
        marginTop: 6,
        height: 2,
        borderRadius: 1
    },
    lineLight: {
        backgroundColor: '#00A2D9'
    },
    marginLeft22: {
        marginLeft: 22
    },
    packageBottom: {
        height: 1,
        width: 300,
        marginTop: 25
    }
})

export const groupWithPackage = (dataArr) => {
    const packageArr = _.groupBy(dataArr, (item: any) => {
        return item.Package_Type_Name__c
    })
    const pacResultArr = []
    _.forEach(packageArr, (val, keyStr) => {
        pacResultArr.push({
            packageTitle: keyStr !== 'null' ? keyStr : '',
            items: val
        })
    })
    return pacResultArr
}
export const groupWithPallet = (res) => {
    const sortedData = _.groupBy(res, (item: any) => {
        return item.Pallet_Number__c
    })
    const resultArr = []
    _.forEach(sortedData, (v, k) => {
        const pacResultArr = groupWithPackage(v)
        resultArr.push({
            title: k !== 'null' ? k : '',
            packages: pacResultArr
        })
    })
    return resultArr || []
}

export const getSumData = (groupName) => {
    const sumArr = []
    _.forEach(groupName, (v) => {
        const sumData = _.cloneDeep(v[0])
        const sumOrd = v.reduce((a, b) => a + parseFloat(b.Ordered_Quantity__c || 0), 0)
        const sumCer = v.reduce((a, b) => a + parseFloat(b.Certified_Quantity__c || 0), 0)
        sumData.Ordered_Quantity__c = sumOrd
        sumData.Certified_Quantity__c = sumCer
        sumArr.push(sumData)
    })
    return sumArr
}
export const getUniquePackageData = (resultArr) => {
    const pacData = groupWithPackage(resultArr)
    return pacData.map((pacItem) => {
        const groupName = _.groupBy(pacItem.items, (item: any) => {
            return item.Name
        })
        const sumResult = getSumData(groupName)
        return {
            packageTitle: sumResult[0].Package_Type_Name__c || '',
            items: sumResult
        }
    })
}

export const renderPackageHeader = (packageTitle) => {
    return (
        <View style={styles.marginLeft22}>
            <CText style={[styles.commentTitle, styles.packageTitle]}>{t.labels.PBNA_MOBILE_PACKAGE}</CText>
            <CText style={[styles.palletStyle, styles.packageName]}>{packageTitle}</CText>
        </View>
    )
}

export const renderCountView = (unitStr, countNum, hasLine) => {
    return (
        <View style={styles.shipmentRight}>
            <View style={styles.shipmentRight}>
                <CText style={styles.commentTitle}>{unitStr}</CText>
                <CText style={styles.countLabel}> {countNum}</CText>
            </View>
            {hasLine && <View style={styles.gapLine} />}
        </View>
    )
}

export const renderShipmentItem = (item, index, accordionType, currentShipment) => {
    const type = getIndicatorType({
        accordionType,
        status: currentShipment.Status || item.Status,
        ordered: getNumberString(item.Ordered_Quantity__c),
        certified: getNumberString(item.Certified_Quantity__c),
        delivered: getNumberString(item.Delivered_Quantity__c)
    })
    return (
        <View style={[styles.shipmentItem, styles.marginLength, styles.shipmentItemLine]} key={index}>
            <CText style={[styles.shipmentTitle]} numberOfLines={3} ellipsizeMode={'tail'}>
                {item.Name}
            </CText>
            <View style={styles.shipmentDetail}>
                {renderCountView(t.labels.PBNA_MOBILE_ORD, getNumberString(item.Ordered_Quantity__c), true)}
                {renderCountView(
                    t.labels.PBNA_MOBILE_CERT,
                    getNumberString(item.Certified_Quantity__c),
                    accordionType !== 'PALLET'
                )}
                {accordionType !== ACCORDION_TYPE.PALLET &&
                    renderCountView(
                        t.labels.PBNA_MOBILE_DEL,
                        currentShipment.Status === 'Open' && getNumberString(item.Delivered_Quantity__c) === 0
                            ? '-'
                            : getNumberString(item.Delivered_Quantity__c),
                        false
                    )}
                <DeliveryLogo type={type} />
            </View>
        </View>
    )
}
export const renderPackage = (itemsPac, index, accordionType, currentShipment) => {
    const isPackageTab = accordionType === ACCORDION_TYPE.PACKAGE
    return (
        <View key={index}>
            {!isPackageTab && renderPackageHeader(itemsPac.packageTitle)}
            <CText
                style={[
                    styles.palletStyle,
                    styles.marginLength,
                    styles.palletTitle,
                    !isPackageTab && { paddingTop: 10 }
                ]}
            >
                {t.labels.PBNA_MOBILE_PROD_INFO.toUpperCase()}
            </CText>
            <View style={[styles.palletLine, styles.marginLength]} />
            {itemsPac.items.map((item, itemIndex) => {
                return renderShipmentItem(item, itemIndex, accordionType, currentShipment)
            })}
            <View style={styles.packageBottom} />
        </View>
    )
}
export const renderContent = (section, accordionType, currentShipment) => {
    if (accordionType === ACCORDION_TYPE.PALLET) {
        return (
            <View style={styles.palletContainer}>
                {section.packages.map((element, index) => {
                    return renderPackage(element, index, accordionType, currentShipment)
                })}
            </View>
        )
    } else if (accordionType === ACCORDION_TYPE.PACKAGE) {
        return <View style={styles.palletContainer}>{renderPackage(section, 0, accordionType, currentShipment)}</View>
    } else if (accordionType === ACCORDION_TYPE.EXCEPTION || accordionType === ACCORDION_TYPE.DELIVERY_INFO) {
        return (
            <View style={styles.palletContainer}>
                {section.map((element, index) => {
                    return renderPackage(element, index, accordionType, currentShipment)
                })}
            </View>
        )
    }
}

export const renderHeader = (content, index, isActive, accordionType) => {
    const palCount = getNumberString(content?.title) || ''
    return (
        <View style={[styles.sectionHeader]}>
            <View style={styles.sectionTitleCon}>
                {accordionType === ACCORDION_TYPE.PACKAGE && renderPackageHeader(content?.packageTitle || '')}
                {accordionType === ACCORDION_TYPE.PALLET && (
                    <CText style={styles.sectionTitle}>
                        {t.labels.PBNA_MOBILE_PALLET} {palCount}
                    </CText>
                )}
                {(accordionType === ACCORDION_TYPE.EXCEPTION || accordionType === ACCORDION_TYPE.DELIVERY_INFO) && (
                    <CText style={styles.sectionTitle}>{t.labels.PBNA_MOBILE_EXCEPTIONS}</CText>
                )}
            </View>
            {isActive ? (
                <Image
                    style={[styles.icon, styles.iconRotate]}
                    source={require('../../../../assets/image/ios-chevron-down.png')}
                />
            ) : (
                <Image style={styles.icon} source={require('../../../../assets/image/ios-chevron-down.png')} />
            )}
        </View>
    )
}

export const renderTab = (title, onClick, tabType, titleName?) => {
    const isSelected = title === tabType
    return (
        <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
                onClick && onClick(title)
            }}
        >
            <CText style={[styles.countLabel, !isSelected && styles.tabTitleBlue]}>{titleName || title}</CText>
            <View style={[styles.lineView, isSelected && styles.lineLight]} />
        </TouchableOpacity>
    )
}
interface DeliveryInformationProps {
    route
    navigation
}
const DeliveryInformation = (props: DeliveryInformationProps) => {
    const { route, navigation } = props
    const currentShipment = route?.params?.shipment
    const [activeSections, setActiveSections] = useState([])
    const [palletData, setPalletData] = useState([])
    const [packageData, setPackageData] = useState([])
    const [exceptionData, setExceptionData] = useState([])
    const [indicatorType, setIndicatorType] = useState('null')
    const [exceptionActiveSections, setExceptionActiveSections] = useState([])
    const [tabType, setTabType] = useState(ACCORDION_TYPE.PALLET)

    const onClose = () => {
        navigation.goBack()
    }

    const getDataFromSoup = () => {
        getShipmentAndOrderItemFromLocalData(currentShipment).then((resultArr: any) => {
            const orderItems = resultArr.orderItems
            const palletItems = resultArr.palletItems
            const finalPalletData = groupWithPallet(palletItems)
            setPalletData(finalPalletData)
            const finalPacData = getUniquePackageData(orderItems)
            setPackageData(finalPacData)
            const type = getDeliveryCardIndicator(currentShipment, orderItems)
            setIndicatorType(type)
            const issueData = orderItems.filter((item) => {
                return (
                    getIndicatorType({
                        status: currentShipment.Status,
                        ordered: getNumberString(item.Ordered_Quantity__c),
                        certified: getNumberString(item.Certified_Quantity__c),
                        delivered: getNumberString(item.Delivered_Quantity__c)
                    }) === INDICATOR_TYPE.RED
                )
            })
            const excData = getUniquePackageData(issueData)
            setExceptionData([excData])
        })
    }

    const onClickTab = (type) => {
        setTabType(type)
        setActiveSections([])
    }

    useEffect(() => {
        getDataFromSoup()
        const subscription = NativeAppEventEmitter.addListener(EventEmitterType.NOTIFICATION_SHIPMENT, () => {
            getDataFromSoup()
        })
        return () => {
            subscription.remove()
        }
    }, [])

    const updateSections = (currentSections) => {
        setActiveSections(currentSections)
    }
    const updateExpSections = (currentSections) => {
        setExceptionActiveSections(currentSections)
    }

    return (
        <SafeAreaView style={styles.palletContainer}>
            <ScrollView style={styles.greyBox}>
                <View style={[styles.containerHeader, styles.paddingX]}>
                    <View style={[styles.marginTop51, styles.rowWithCenter]}>
                        <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_DELIVERY_INFORMATION}</CText>
                        <TouchableOpacity
                            onPress={() => {
                                onClose()
                            }}
                        >
                            <Image
                                style={styles.iconLarge}
                                source={require('../../../../assets/image/ios-close-circle-outline.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <DeliveryCard
                        navigation={navigation}
                        visit={route.params.item ? route.params.item : {}}
                        couldPush
                        showDeliveryRoute={route?.params?.showDeliveryRoute}
                        indicator={indicatorType}
                        shipment={currentShipment}
                    />
                    {/* <View style={styles.commentView}>
                        <CText style={styles.commentTitle}>Comments</CText>
                        <CText style={styles.commentSubTitle} numberOfLines={0}>{currentShipment.Description}</CText>
                    </View> */}
                </View>
                <Accordion
                    containerStyle={styles.accordionContain}
                    keyExtractor={(item, index) => item + index}
                    sections={exceptionData}
                    expandMultiple
                    activeSections={exceptionActiveSections}
                    renderHeader={(content, index, isActive) => {
                        return renderHeader(content, index, isActive, ACCORDION_TYPE.EXCEPTION)
                    }}
                    renderContent={(section) => {
                        return renderContent(section, ACCORDION_TYPE.EXCEPTION, currentShipment)
                    }}
                    onChange={updateExpSections}
                />
                <View style={styles.tabContainer}>
                    {renderTab(ACCORDION_TYPE.PALLET, onClickTab, tabType, t.labels.PBNA_MOBILE_PALLET.toUpperCase())}
                    {renderTab(ACCORDION_TYPE.PACKAGE, onClickTab, tabType, t.labels.PBNA_MOBILE_PACKAGE.toUpperCase())}
                </View>
                <Accordion
                    containerStyle={styles.accordionContain}
                    keyExtractor={(item, index) => item + index}
                    sections={tabType === ACCORDION_TYPE.PACKAGE ? packageData : palletData}
                    expandMultiple
                    activeSections={activeSections}
                    renderHeader={(content, index, isActive) => {
                        return renderHeader(content, index, isActive, tabType)
                    }}
                    renderContent={(section) => {
                        return renderContent(section, tabType, currentShipment)
                    }}
                    onChange={updateSections}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default DeliveryInformation
