/**
 * @description Component to show all leads.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
import React, { FC, useEffect, useImperativeHandle, useRef } from 'react'
import { DeviceEventEmitter, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useAllLeadsPagination } from '../../../hooks/LeadHooks'
import AllLeadsListTile from './tile/AllLeadsListTile'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { useDispatch } from 'react-redux'
import { DeviceEvent } from '../../../enums/DeviceEvent'
import EmptyListPlaceholder from '../../common/EmptyListPlaceholder'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import { useRepPullDownRefresh } from '../../../hooks/RefreshHooks'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { isPersonaFSManager } from '../../../../common/enums/Persona'

interface AllLeadsListProps {
    cRef?: any
    navigation: any
    refreshFilterLead?: any
    searchValue: any
    filterQuery: any
}

const styles = StyleSheet.create({
    listContainer: {
        width: '100%',
        backgroundColor: '#EFF3F6',
        flexGrow: 1
    },
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    titleStyle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    textStyle: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    }
})

const AllLeadsList: FC<AllLeadsListProps> = (props: AllLeadsListProps) => {
    const isFocused = useIsFocused()
    const { dropDownRef } = useDropDown()
    const dispatch = useDispatch()
    const isMounted = useRef(null)
    const flatListRef = useRef(null)
    const { searchValue, filterQuery, cRef } = props
    const { isLoading, setIsLoading } = useRepPullDownRefresh('OpenLeadsList', dispatch, false)
    const { allLeads, setOffset, hasAdded, setHasAdded, setNeedRefreshCursor } = useAllLeadsPagination(
        isFocused,
        isLoading,
        dropDownRef,
        searchValue,
        filterQuery
    )
    const handleReachEnd = () => {
        setOffset((v) => v + 1)
    }
    const refreshCursor = () => {
        if (isMounted.current) {
            setNeedRefreshCursor(true)
        }
    }
    useEffect(() => {
        isMounted.current = true
        return () => {
            if (hasAdded) {
                setNeedRefreshCursor(true)
            }
            isMounted.current = false
        }
    }, [])
    useEffect(() => {
        const refreshLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_LEAD_LIST, () => {
            refreshCursor()
        })
        const refreshOpenLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_OPEN_LEAD_LIST, () => {
            refreshCursor()
        })
        return () => {
            refreshLeadListEvent.remove()
            refreshOpenLeadListEvent.remove()
        }
    }, [])
    useImperativeHandle(cRef, () => ({
        scrollToTop: () => {
            flatListRef.current?.scrollToOffset({ offset: 0 })
        }
    }))
    const renderItem = ({ item }) => (
        <View style={{ paddingHorizontal: 22 }}>
            <AllLeadsListTile l={item} navigation={props.navigation} setHasAdded={setHasAdded} isGoBack />
        </View>
    )

    const renderList = () => {
        if (searchValue.length < 3 && searchValue !== '') {
            return (
                <EmptyListPlaceholder
                    title={
                        <View style={commonStyle.alignItemsCenter}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                            <CText style={styles.NoResultContent}>
                                {t.labels.PBNA_MOBILE_PLEASE_ENTER_AT_LEAST_3_CHARACTERS_WHEN_SEARCHING}
                            </CText>
                        </View>
                    }
                />
            )
        } else if ((!_.isEmpty(filterQuery) || searchValue.length >= 3) && _.isEmpty(allLeads)) {
            return <EmptyListPlaceholder />
        }
        return (
            <FlatList
                ref={flatListRef}
                contentContainerStyle={commonStyle.flexGrow_1}
                data={allLeads}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id}
                onEndReached={() => {
                    handleReachEnd()
                }}
                onEndReachedThreshold={0.5}
                initialNumToRender={4}
                refreshControl={
                    <RefreshControl
                        title={t.labels.PBNA_MOBILE_LOADING}
                        tintColor={'#00A2D9'}
                        titleColor={'#00A2D9'}
                        refreshing={isLoading}
                        onRefresh={() => {
                            setIsLoading(true)
                        }}
                    />
                }
                ListEmptyComponent={
                    <EmptyListPlaceholder
                        title={
                            <View style={commonStyle.alignItemsCenter}>
                                <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_NO_LEADS}</CText>
                                <CText style={styles.textStyle}>
                                    {isPersonaFSManager()
                                        ? t.labels.PBNA_MOBILE_TO_TEAM_DEFINITION
                                        : t.labels
                                              .PBNA_MOBILE_YOU_ARE_NOT_CURRENTLY_ASSOCIATED_WITH_A_WIRING_DEFINITION}
                                </CText>
                            </View>
                        }
                    />
                }
            />
        )
    }
    return <View style={styles.listContainer}>{renderList()}</View>
}

export default AllLeadsList
