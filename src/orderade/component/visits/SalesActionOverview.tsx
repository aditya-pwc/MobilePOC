import React, { useState, FC, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import CollapseContainer from '../common/CollapseContainer'
import CText from '../../../common/components/CText'
import VisitDuration from './VisitDuration'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
import SearchBarWithScan from '../common/SearchBarWithScan'
import SalesActionProductPanel from './SalesActionProductPanel'
import { NavigationProp } from '@react-navigation/native'
import { PositionType } from './DraggableHamburger'
import { CartDetail } from '../../interface/CartDetail'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import VisitOrderCardsComponent from '../order/VisitOrderCardsComponent'
import { VisitStatus } from '../../enum/VisitType'
import RevampTooltip from './RevampTooltip'
import { BottomSelectModalHeaderStyles } from '../common/BottomSelectModalHeader'
import { ReturnCartItem } from '../../interface/ReturnProduct'

const style = StyleSheet.create({
    ...commonStyle,
    ...BottomSelectModalHeaderStyles,
    visitType: {
        fontSize: 14,
        color: baseStyle.color.titleGray,
        marginBottom: 8
    },
    tagWrap: {
        paddingHorizontal: 10,
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        borderRadius: 15
    },
    tag: {
        fontSize: 12,
        lineHeight: 30
    },
    chevronStyle: {
        width: 18,
        height: 13,
        marginRight: 5
    },
    collapseContainer: {
        width: '100%',
        height: 86,
        flexDirection: 'row',
        paddingHorizontal: baseStyle.padding.pd_22,
        backgroundColor: '#FFFFFF'
    },
    visitOverview: {
        paddingBottom: 18
    },
    searchBarWrap: {
        marginVertical: 30
    },
    overviewTitleStyle: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000000'
    },
    overviewSubtitleStyle: {
        fontWeight: '400',
        fontSize: 12,
        color: '#565656'
    },
    selectMissionModalBody: {
        backgroundColor: '#FFFFFF'
    },
    childrenTitleView: {
        paddingVertical: 30,
        alignItems: 'center'
    },
    childrenTitle: {
        fontSize: 18,
        color: '#000000',
        fontWeight: '900',
        fontFamily: 'Gotham'
    },
    scrollView: {
        maxHeight: 350
    },
    childrenBodyView: {
        paddingHorizontal: 22,
        paddingBottom: 33
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: '400',
        fontSize: 14,
        color: 'black'
    },
    checkedIcon: {
        width: 22,
        height: 22
    },
    uncheckCircleView: {
        width: 22,
        height: 22,
        backgroundColor: '#FFF',
        borderColor: '#D3D3D3',
        borderRadius: 11,
        borderWidth: 1
    },
    radioContainer: {
        paddingVertical: 19,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    }
})
interface SalesActionOverviewType {
    visit: MyDayVisitModel
    navigation: NavigationProp<any>
    cartData: ReturnCartItem[]
    hamburgerPosition: PositionType | null
    setHamburgerPosition: Function
    cartDetail?: CartDetail
    cRef?: any
    isFocused: boolean
    offsetTop: number
    returnRef: any
}
const visitTypeDisplayNameMap: { [key: string]: string } = {
    Sales: 'Order'
}

const SalesActionOverview: FC<SalesActionOverviewType> = (props) => {
    const {
        visit,
        navigation,
        cartData,
        setHamburgerPosition,
        hamburgerPosition,
        cartDetail,
        isFocused,
        offsetTop,
        returnRef
    } = props
    const [collapsed, setCollapsed] = useState<boolean>(true)
    const [search, setSearch] = useState<string>('')
    const [showVisitCard, setShowVisitCard] = useState(false)

    const setShowContent = () => {
        setCollapsed(!collapsed)
    }

    useEffect(() => {
        if (
            (visit?.Status === VisitStatus.PUBLISHED || visit?.Status === VisitStatus.IN_PROGRESS) &&
            !(visit?.AdHoc && visit.completedOrder === 0)
        ) {
            setShowVisitCard(true)
        } else {
            setShowVisitCard(false)
        }
    }, [visit])
    const titleComponents = (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View>
                <View>
                    <CText style={style.overviewTitleStyle}>{t.labels.PBNA_MOBILE_VISIT_OVERVIEW}</CText>
                </View>
                <View
                    style={{
                        marginTop: 3
                    }}
                >
                    <CText style={style.overviewSubtitleStyle}>
                        {`${t.labels.PBNA_MOBILE_DELIVERY_ORDERS} ${t.labels.PBNA_MOBILE_COMPLETED} ${
                            visit?.completedOrder
                        }/${visit?.AdHoc ? 0 : visit?.VDelGroup.length || 0}`}
                    </CText>
                </View>
            </View>
            <RevampTooltip navigation={navigation} store={visit} returnRef={returnRef} />
        </View>
    )

    const collapseProps = {
        title: t.labels.PBNA_MOBILE_VISIT_OVERVIEW,
        showContent: !collapsed,
        setShowContent,
        titleComponents: titleComponents,
        noTopLine: true,
        noBottomLine: true,
        chevronStyle: style.chevronStyle,
        containerStyle: style.collapseContainer
    }
    const searchBarWithScanProps = {
        search,
        setSearch
    }
    const salesActionProductPanelProps = {
        navigation,
        store: visit,
        cartData,
        hamburgerPosition,
        setHamburgerPosition,
        cartDetail,
        setCollapsed,
        offsetTop: offsetTop
    }
    const getVisitType = () => {
        const originalName = visit?.RecordTypeDeveloperName || 'Sales'
        return visitTypeDisplayNameMap[originalName] || originalName
    }

    return (
        <View style={[style.flexDirectionColumn, style.flex_1]}>
            <View style={[style.bgWhite, style.visitOverview]}>
                <CollapseContainer {...collapseProps}>
                    <View
                        style={[style.flexDirectionRow, style.paddingX, style.flexRowSpaceBet, style.flexRowAlignEnd]}
                    >
                        <View>
                            <CText style={style.visitType}>{t.labels.PBNA_MOBILE_VISIT_TYPE}</CText>
                            <View style={style.flexDirectionRow}>
                                <View style={style.tagWrap}>
                                    <CText style={style.tag}>{getVisitType()}</CText>
                                </View>
                            </View>
                        </View>
                        <VisitDuration visit={visit} />
                    </View>
                    {showVisitCard && (
                        <VisitOrderCardsComponent
                            totalOrderNum={visit.completedOrder}
                            visitData={visit}
                            navigation={navigation}
                            isAdhoc={!!visit.AdHoc}
                            isFocused={isFocused}
                        />
                    )}
                    <View style={[commonStyle.paddingX, style.searchBarWrap]}>
                        <SearchBarWithScan {...searchBarWithScanProps} />
                    </View>
                </CollapseContainer>
            </View>
            <SalesActionProductPanel {...salesActionProductPanelProps} />
        </View>
    )
}

export default SalesActionOverview
