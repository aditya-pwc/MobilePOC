/**
 * @description Component to show my leads.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
import React, { useEffect, useRef, FC, useImperativeHandle } from 'react'
import { RefreshControl, View, StyleSheet, DeviceEventEmitter, FlatList } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useMyLeads } from '../../../hooks/LeadHooks'
import { CommonParam } from '../../../../common/CommonParam'
import MyLeadsListTile from './tile/MyLeadsListTile'
import { DeviceEvent } from '../../../enums/DeviceEvent'
import EmptyListPlaceholder from '../../common/EmptyListPlaceholder'
import CText from '../../../../common/components/CText'
import _ from 'lodash'
import { useRepPullDownRefresh } from '../../../hooks/RefreshHooks'
import { useDispatch } from 'react-redux'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { isPersonaFSManager } from '../../../../common/enums/Persona'

interface MyLeadsListProps {
    cRef?: any
    navigation: any
    refreshFilterLead?: any
    searchValue: any
    filterQuery: any
}

const styles = StyleSheet.create({
    listContainer: {
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

const MyLeadsList: FC<MyLeadsListProps> = (props: MyLeadsListProps) => {
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const { isLoading, setIsLoading } = useRepPullDownRefresh('MyLeadsList', dispatch, false)
    const isMounted = useRef(null)
    const { searchValue, filterQuery, cRef } = props
    const { myLeads, setRefreshTimes } = useMyLeads(
        isFocused,
        CommonParam.GPID__c,
        isLoading,
        isMounted,
        searchValue,
        filterQuery
    )
    const flatListRef = useRef(null)
    useEffect(() => {
        const refreshLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_LEAD_LIST, () => {
            if (isMounted.current) {
                setRefreshTimes((refreshTimes) => {
                    return refreshTimes + 1
                })
            }
        })
        return () => {
            refreshLeadListEvent.remove()
        }
    }, [])
    useImperativeHandle(cRef, () => ({
        scrollToTop: () => {
            flatListRef.current?.scrollToOffset({ offset: 0 })
        }
    }))
    const renderItem = ({ item }) => {
        return (
            <View style={{ paddingHorizontal: 22 }}>
                <MyLeadsListTile l={item} key={item.Id} navigation={props.navigation} isGoBack={false} />
            </View>
        )
    }

    const renderList = () => {
        if (searchValue.length < 3 && searchValue !== '') {
            return (
                <EmptyListPlaceholder
                    title={
                        <View style={commonStyle.alignCenter}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_RESULTS}</CText>
                            <CText style={styles.NoResultContent}>
                                {t.labels.PBNA_MOBILE_PLEASE_ENTER_AT_LEAST_3_CHARACTERS_WHEN_SEARCHING}
                            </CText>
                        </View>
                    }
                />
            )
        } else if ((!_.isEmpty(filterQuery) || searchValue.length >= 3) && _.isEmpty(myLeads)) {
            return <EmptyListPlaceholder />
        }
        return (
            <FlatList
                ref={flatListRef}
                contentContainerStyle={commonStyle.flexGrow_1}
                data={myLeads}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id}
                onEndReachedThreshold={0.9}
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
                            <View style={commonStyle.alignCenter}>
                                <CText style={styles.titleStyle}>{t.labels.PBNA_MOBILE_NO_LEADS}</CText>
                                <CText style={styles.textStyle}>
                                    {isPersonaFSManager()
                                        ? t.labels.PBNA_MOBILE_NO_LEADS_TO_TEAM
                                        : t.labels.PBNA_MOBILE_NO_LEADS_ARE_CURRENTLY_ASSIGNED_TO_YOU}
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

export default MyLeadsList
