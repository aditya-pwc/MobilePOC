/*
 * @Description:
 * @LastEditors: Yi Li
 */

import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { getRouteData } from '../../../../hooks/InnovationProductHooks'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CCheckBox from '../../../../../common/components/CCheckBox'
import CText from '../../../../../common/components/CText'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import SearchBarWithFilter from '../../../sales/my-customer/SearchBarWithFilter'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        color: '#000',
        marginBottom: 34,
        marginTop: 10,
        fontWeight: '900'
    },
    sectionHeadCon: {
        height: 60,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        paddingLeft: 22,
        marginTop: 30
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    },
    subTypeItem: {
        ...commonStyle.flexRowAlignCenter,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 10
    },
    content: {
        flex: 1
    },
    list: {
        flex: 1,
        marginBottom: 60
    },
    headPadding: {
        paddingHorizontal: 22
    }
})

interface ChooseRoutesProps {
    route?: any
    navigation?: any
}

const renderCell = (item, index, onCheckClick) => {
    return (
        <View style={styles.subTypeItem} key={`subType${index}`}>
            <CCheckBox
                onPress={() => {
                    onCheckClick && onCheckClick(index)
                }}
                checked={item.select}
            />
            <TouchableOpacity
                style={styles.content}
                onPress={() => {
                    onCheckClick && onCheckClick(index)
                }}
            >
                <CText>{item.name}</CText>
            </TouchableOpacity>
        </View>
    )
}

const ChooseRoutes = (props: ChooseRoutesProps) => {
    const { route, navigation } = props
    const [searchText, setSearchText] = useState('')
    const [disableSave, setDisableSave] = useState(true)
    const [routes, setRoutes] = useState([])
    const [pageSelectRoutes, setPageSelectRoutes] = useState(route.params?.selectRoutes)
    const [routeCount, setRouteCount] = useState(route.params?.selectRoutes.count)

    const onPressCancel = () => {
        navigation.goBack()
    }
    const onPressSave = () => {
        route?.params?.setSelectRoutes(pageSelectRoutes)
        navigation.goBack()
    }
    const searchAction = _.debounce((text) => {
        setSearchText(text)
    }, 500)

    const checkClick = (index) => {
        const currentRoutes = _.cloneDeep(routes)
        const currentSelectedRoute = _.cloneDeep(pageSelectRoutes)
        currentRoutes[index].select = !currentRoutes[index].select
        if (currentRoutes[index].select) {
            const filterArr = currentSelectedRoute.filter((item) => item?.Id === currentRoutes[index]?.Id)
            if (_.size(filterArr) === 0) {
                currentSelectedRoute.push(currentRoutes[index])
            }
        } else {
            const filterIndex = currentSelectedRoute.findIndex((item) => item?.Id === currentRoutes[index]?.Id)
            if (filterIndex > -1) {
                currentSelectedRoute.splice(filterIndex, 1)
            }
        }

        setRoutes([...currentRoutes])
        setPageSelectRoutes(currentSelectedRoute)
    }

    const getRouteWithNet = async () => {
        const routeData = await getRouteData(pageSelectRoutes, searchText)
        setRoutes(routeData)
    }

    useEffect(() => {
        setRouteCount(pageSelectRoutes.length)
    }, [routes])

    useEffect(() => {
        getRouteWithNet()
    }, [searchText])

    useEffect(() => {
        setDisableSave(_.size(pageSelectRoutes) === 0)
    }, [pageSelectRoutes])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headPadding}>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_SELECT_ROUTES}</CText>
                <SearchBarWithFilter
                    hideFilterBtn
                    placeholder={t.labels.PBNA_MOBILE_SEARCH_ROUTES_1}
                    onChangeSearchBarText={searchAction}
                    onClickClearIcon={() => {
                        setSearchText('')
                    }}
                />
            </View>
            <View style={styles.sectionHeadCon}>
                <CText style={styles.sectionTitle}>{t.labels.PBNA_MOBILE_ATC_AVAILABLE_ROUTE}</CText>
            </View>
            <FlatList
                style={styles.list}
                data={routes}
                extraData={routes}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => renderCell(item, index, checkClick)}
                keyExtractor={(item) => item.Id}
            />
            <FormBottomButton
                disableSave={disableSave}
                rightButtonLabel={`${t.labels.PBNA_MOBILE_ADD} ${routeCount > 0 ? routeCount : ''} ${
                    t.labels.PBNA_MOBILE_FILTER_ROUTES
                }`}
                onPressCancel={onPressCancel}
                onPressSave={onPressSave}
            />
        </SafeAreaView>
    )
}

export default ChooseRoutes
