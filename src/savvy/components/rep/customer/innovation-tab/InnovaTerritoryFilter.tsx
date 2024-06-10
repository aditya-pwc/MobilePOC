/*
 * @Description:
 * @LastEditors: Yi Li
 */
import React, { useState } from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'
import CustomerCell from './CustomerCell'
import { styles } from './InnovaProdFilterSortForm'
interface InnovaTerritoryFilterProps {
    onPressTerritory: Function
    onPreRoute: Function
    selectTerritories: any
    selectRoutes: any
    onRemoveTes: Function
    onRemoveRoutes: Function
}

export const renderTerritoryBtn = (title: string, onPressBtn: Function) => {
    return (
        <TouchableOpacity
            style={styles.keyAccountContainer}
            onPress={() => {
                onPressBtn && onPressBtn()
            }}
        >
            <CText style={styles.ostTitle}>{title}</CText>
            <View style={styles.blueIcon} />
        </TouchableOpacity>
    )
}

export const renderRoutesBtn = (title: string, placeholder: string, onPressBtn: Function) => {
    return (
        <View>
            <View style={styles.keyAccountContainer}>
                <CText style={styles.ostTitle}>{title}</CText>
            </View>
            <TouchableOpacity
                onPress={() => {
                    onPressBtn && onPressBtn()
                }}
                style={styles.searchBtn}
            >
                <Image style={styles.searchImg} source={require('../../../../../../assets/image/icon-search.png')} />
                <CText style={styles.searchTitle}>{placeholder}</CText>
            </TouchableOpacity>
        </View>
    )
}

const InnovaTerritoryFilter = (props: InnovaTerritoryFilterProps) => {
    const { onPressTerritory, onPreRoute, selectTerritories, selectRoutes, onRemoveTes, onRemoveRoutes } = props
    const [isShowKAsMore, setIsShowKAsMore] = useState(true)
    const [isShowCustomersMore, setIsShowCustomersMore] = useState(true)

    return (
        <View>
            <View style={styles.ostContainer}>
                {renderTerritoryBtn(t.labels.PBNA_MOBILE_TERRITORIES, () => {
                    onPressTerritory && onPressTerritory()
                })}
                <View>
                    {selectTerritories.length !== 0 && (
                        <View style={[styles.searchItem]}>
                            <CustomerCell
                                itemArr={selectTerritories}
                                handleRemove={onRemoveTes}
                                enableHide
                                isShowMore={isShowKAsMore}
                                setIsShowMore={setIsShowKAsMore}
                                controlNum={2}
                            />
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.addCusCon}>
                {renderRoutesBtn(t.labels.PBNA_MOBILE_FILTER_ROUTES, t.labels.PBNA_MOBILE_SEARCH_ROUTES, () => {
                    onPreRoute && onPreRoute()
                })}
                <View>
                    {selectRoutes.length > 0 && (
                        <CText style={styles.selectCusText}>
                            {selectRoutes.length}
                            {' ' + t.labels.PBNA_MOBILE_ROUTES_ADDED}
                        </CText>
                    )}
                    {selectRoutes.length !== 0 && (
                        <View style={[styles.searchItem]}>
                            <CustomerCell
                                itemArr={selectRoutes}
                                handleRemove={onRemoveRoutes}
                                enableHide
                                isShowMore={isShowCustomersMore}
                                setIsShowMore={setIsShowCustomersMore}
                                controlNum={8}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}

export default InnovaTerritoryFilter
