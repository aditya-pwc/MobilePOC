/*
 * @Description:
 * @LastEditors: Yi Li
 */
import React, { useRef, useState } from 'react'
import { StyleSheet, View, Image, StyleProp, ViewStyle, Dimensions, TextStyle } from 'react-native'
import CText from '../../../../../common/components/CText'
import style from './SalesSnapshot.style'
import { t } from '../../../../../common/i18n/t'
import { getFolderImage } from './SalesSnapshot'
import TabBar from '../../../common/TabBar'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SearchBar } from 'react-native-elements'
import { useInnovationSnapShotHook } from '../../../../hooks/InnovationProductHooks'
import _ from 'lodash'
import { useDebounce } from '../../../../hooks/CommonHooks'

interface InnovationSnapShotProps {
    retailStore: any
    innovationData: any
}

interface InformationProps {
    title: string
    subTitle: string
    detTitle: string
    contStyle?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    subTitleStyle?: StyleProp<TextStyle>
    detailStyle?: StyleProp<TextStyle>
}
const styles = StyleSheet.create({
    accordionContain: {
        with: '100%',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    accordionHead: {
        ...commonStyle.flexRowSpaceBet,
        paddingVertical: 35,
        paddingHorizontal: 22,
        backgroundColor: '#FFF'
    },
    unitTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#565656'
    },
    unitSubTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginTop: 5
    },
    tabStyle: {
        paddingHorizontal: 22
    },
    tabBtn: {
        borderBottomColor: '#FFFFFF',
        borderBottomWidth: 2
    },
    tabSelectTitle: {
        color: '#000000',
        borderBottomColor: '#00A2D9'
    },
    tabTitle: {
        fontSize: 12,
        fontWeight: '700'
    },
    totalCustomerView: {
        flexDirection: 'row',
        marginHorizontal: 22,
        flexWrap: 'wrap'
    },
    performanceTabCont: {
        marginTop: 5
    },
    performanceTitle: {
        marginVertical: 30,
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 22
    },
    performanceUnit: {
        width: Dimensions.get('window').width / 2 - 22
    },
    unitBottom30: {
        marginBottom: 30
    },
    unitBottom60: {
        marginBottom: 60
    },
    infoTitle: {
        color: '#3E3E3C'
    },
    infoSubTitle: {
        fontSize: 14,
        fontWeight: '700'
    },
    infoDetailTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    skuCell: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 1
    },
    skuCellLeft: {
        width: Dimensions.get('window').width / 2 - 47,
        overflow: 'hidden'
    },
    skuCellRight: {
        width: Dimensions.get('window').width / 2 - 44,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
        marginBottom: 20
    },
    unitBottom15: {
        marginBottom: 15
    },
    skuCellRightUnit: {
        width: Dimensions.get('window').width / 4 - 22
    },
    cellCenterLine: {
        with: 1,
        height: 91,
        borderColor: '#D3D3D3',
        borderWidth: 0.5,
        marginHorizontal: 25
    },
    marginBottom5: {
        marginBottom: 5
    },
    searchBarInnerContainer: {
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6',
        marginHorizontal: 22,
        marginTop: 29
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    skuTabTitle: {
        marginTop: 30,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 22
    }
})

const tabs = () => [
    {
        name: t.labels.PBNA_MOBILE_METRICS_INNOV_PERFORMANCE.toLocaleUpperCase(),
        value: t.labels.PBNA_MOBILE_METRICS_INNOV_PERFORMANCE.toLocaleUpperCase(),
        dot: false
    },
    {
        name: t.labels.PBNA_MOBILE_INNOVATION_BY_SKU.toLocaleUpperCase(),
        value: t.labels.PBNA_MOBILE_INNOVATION_BY_SKU.toLocaleUpperCase(),
        dot: false
    }
]

const performanceData = () => [
    { title: t.labels.PBNA_MOBILE_METRICS_VOLUME },
    { title: t.labels.PBNA_MOBILE_METRICS_NET_REV },
    { title: t.labels.PBNA_MOBILE_TOTAL_VOLUME },
    { title: t.labels.PBNA_MOBILE_TOTAL_NET_REVENUE }
]
const skuDataSource = () => [
    { title: t.labels.PBNA_MOBILE_METRICS_VOLUME },
    { title: t.labels.PBNA_MOBILE_METRICS_NET_REV },
    { title: t.labels.PBNA_MOBILE_INNOV_VOL },
    { title: t.labels.PBNA_MOBILE_INNOV_NR }
]

const getSubTitle = (index, innovaArr, productData?: any, skuData?: any) => {
    let subTitle = ''
    let titleColor = { color: '#000000' }
    const innovaData = _.size(innovaArr) > 0 ? innovaArr[0] : {}
    switch (index) {
        case 0:
            {
                const volNum = skuData
                    ? Math.round(Number(skuData.YTD_LCD_Vol__c || '0'))
                    : Math.round(Number(innovaData.sumVolume || 0))
                subTitle = volNum + ' cs'
                if (volNum < 0) {
                    titleColor = { color: '#EB445A' }
                }
            }
            break
        case 1:
            {
                const revenue = skuData
                    ? Math.round(Number(skuData.YTD_Net_Revenue__c || '0'))
                    : Math.round(Number(innovaData.sumNetRevenue || 0))
                subTitle = revenue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 2
                })
                if (revenue < 0) {
                    titleColor = { color: '#EB445A' }
                }
            }
            break
        case 2:
            {
                const volNum = skuData ? Number(skuData.YTD_LCD_Vol__c || '0') : Number(innovaData.sumVolume || 0)
                const volSum = skuData ? Number(innovaData.sumVolume || 0) : Number(productData.volume.YTD || 0)
                if (volNum === 0 || volSum === 0) {
                    subTitle = '0%'
                } else {
                    const presentNum = Math.round((volNum / volSum) * 100)
                    if (presentNum < 0) {
                        titleColor = { color: '#EB445A' }
                    }
                    subTitle = presentNum + '%'
                }
            }
            break
        case 3:
            {
                const revNum = skuData
                    ? Number(skuData.YTD_Net_Revenue__c || '0')
                    : Number(innovaData.sumNetRevenue || 0)
                const revSum = skuData ? Number(innovaData.sumNetRevenue || 0) : Number(productData.revenue.YTD || 0)
                if (revNum === 0 || revSum === 0) {
                    subTitle = '0%'
                } else {
                    const presentNum = Math.round((revNum / revSum) * 100)
                    if (presentNum < 0) {
                        titleColor = { color: '#EB445A' }
                    }
                    subTitle = presentNum + '%'
                }
            }
            break
        default:
            break
    }
    return { subTitle, titleColor }
}

const renderUnitView = (
    index: number,
    title: string,
    subTitle: string,
    contStyle?: StyleProp<ViewStyle>,
    titleStyle?: StyleProp<TextStyle>,
    subTitleStyle?: StyleProp<TextStyle>
) => {
    return (
        <View style={contStyle} key={index}>
            <CText style={[styles.unitTitle, titleStyle]}>{title}</CText>
            <CText style={[styles.unitSubTitle, subTitleStyle]}>{subTitle}</CText>
        </View>
    )
}

const renderInformationView = (props: InformationProps) => {
    const { title, subTitle, detTitle, contStyle, titleStyle, subTitleStyle, detailStyle } = props
    return (
        <View style={contStyle}>
            <CText style={[styles.infoTitle, styles.tabTitle, styles.marginBottom5, titleStyle]}>{title}</CText>
            <CText style={[styles.infoSubTitle, styles.infoTitle, styles.marginBottom5, subTitleStyle]}>
                {subTitle}
            </CText>
            <CText style={[styles.infoDetailTitle, detailStyle]}>{detTitle}</CText>
        </View>
    )
}

const InnovationSnapShot = (props: InnovationSnapShotProps) => {
    const { retailStore, innovationData } = props
    const tabBarRef = useRef(null)
    const [activeTab, setActiveTab] = useState(tabs()[0].name)
    const [isExpand, setIsExpand] = useState(true)
    const [searchChange, setSearchChange] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const { innovaArr, skuArr, isShow } = useInnovationSnapShotHook(retailStore?.Id, searchValue, retailStore)

    useDebounce(() => setSearchValue(searchChange), 300, [searchChange])

    const renderPerformanceTab = () => {
        return (
            <View>
                <CText style={styles.performanceTitle}>{t.labels.PBNA_MOBILE_TOTAL_CUSTOMER}</CText>
                <View style={[styles.totalCustomerView, commonStyle.marginHorizontalWidth]}>
                    {performanceData().map((item, index) => {
                        const subData = getSubTitle(index, innovaArr, innovationData)
                        return renderUnitView(
                            index,
                            item.title,
                            subData.subTitle,
                            [styles.performanceUnit, index < 2 ? styles.unitBottom30 : styles.unitBottom60],
                            null,
                            subData.titleColor
                        )
                    })}
                </View>
            </View>
        )
    }

    const renderItem = (skuItem, index) => {
        return (
            <View key={index} style={styles.skuCell}>
                {renderInformationView({
                    title: skuItem.Formatted_Sub_Brand_Name__c || skuItem.Sub_Brand__c,
                    subTitle: skuItem.Formatted_Flavor__c || skuItem.Flavor_Name__c,
                    detTitle: skuItem.Formatted_Package__c || skuItem.Package_Type_Name__c,
                    contStyle: styles.skuCellLeft
                })}
                <View style={styles.cellCenterLine} />
                <View style={styles.skuCellRight}>
                    {skuDataSource().map((item, indexNum) => {
                        const subData = getSubTitle(indexNum, innovaArr, innovationData, skuItem)
                        return renderUnitView(
                            indexNum,
                            item.title,
                            subData.subTitle,
                            [styles.skuCellRightUnit, indexNum < 2 && styles.unitBottom15],
                            styles.infoDetailTitle,
                            [styles.tabTitle, subData.titleColor]
                        )
                    })}
                </View>
            </View>
        )
    }
    const renderSkuTab = () => {
        return (
            <View style={styles.performanceTabCont}>
                <SearchBar
                    platform={'ios'}
                    placeholder={t.labels.PBNA_MOBILE_METRICS_SEARCH_PRODUCTS}
                    allowFontScaling={false}
                    cancelButtonTitle={''}
                    containerStyle={[styles.searchBarInnerContainer]}
                    inputContainerStyle={styles.searchBarInputContainer}
                    value={searchChange}
                    inputStyle={styles.searchInputContainer}
                    onChangeText={(v) => {
                        setSearchChange(v)
                    }}
                />
                <CText style={styles.skuTabTitle}>{t.labels.PBNA_MOBILE_TOTAL_CUSTOMER}</CText>
                {skuArr.map((item, index) => {
                    return renderItem(item, index)
                })}
            </View>
        )
    }

    const renderTabBar = () => {
        return (
            <View>
                <TabBar
                    cRef={tabBarRef}
                    tabs={tabs()}
                    defaultTab={activeTab === tabs()[1].name ? 1 : 0}
                    tabStyle={styles.tabStyle}
                    tabBtnStyle={styles.tabBtn}
                    tabTitleCustom={styles.tabTitle}
                    selectTitle={styles.tabSelectTitle}
                    setActiveSection={(k, v) => {
                        setActiveTab(v.value)
                    }}
                />
                {activeTab === tabs()[0].name && renderPerformanceTab()}
                {activeTab === tabs()[1].name && renderSkuTab()}
            </View>
        )
    }

    const renderUIWithData = () => {
        if (isShow) {
            return (
                <View style={styles.accordionContain}>
                    <TouchableOpacity
                        onPress={() => {
                            setIsExpand(!isExpand)
                        }}
                    >
                        <View style={styles.accordionHead}>
                            <CText style={style.boldFont18}>{t.labels.PBNA_MOBILE_CURRENT_INNOVATION}</CText>
                            <Image source={getFolderImage(isExpand)} style={style.imgFolder} />
                        </View>
                    </TouchableOpacity>
                    {isExpand && renderTabBar()}
                </View>
            )
        }
        return null
    }
    return <View>{renderUIWithData()}</View>
}

export default InnovationSnapShot
