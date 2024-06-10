/**
 * @description My Team Screen for Sales Manager
 * @author Sheng Huang
 * @date 2021/12/22
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ImageSrc } from '../../../common/enums/ImageSrc'
// import { SearchBar } from 'react-native-elements'
import SalesAddEmployee from '../../components/rep/my-team/SalesAddEmployee'
import SalesMyTeamTile from '../../components/rep/my-team/SalesMyTeamTile'
import { useMyTeamList } from '../../hooks/UserHooks'
import { retrieveNewTeamMember, retrieveTeamMemberDetail } from '../../utils/FSManagerSyncUtils'
import { useRepPullDownRefresh } from '../../hooks/RefreshHooks'
import { clearLeadsGroup } from '../../utils/LeadUtils'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { useAppDispatch } from '../../redux/ReduxHooks'
import { startCustomerListLoading, stopCustomerListLoading } from '../../redux/Slice/CustomerListStateSlice'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'

interface SalesMyTeamProps {
    navigation: any
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    mainContainer: {
        backgroundColor: '#F2F4F7',
        flex: 9
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 22,
        height: '100%',
        justifyContent: 'space-between'
    },
    headerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    navigationHeaderTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000'
    },
    imgAdd: {
        width: 36,
        height: 36
    },
    hitSlop: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 35,
        width: '100%',
        justifyContent: 'space-between'
    },
    searchBarInnerContainer: {
        width: '85%',
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    filterImage: {
        width: 32,
        height: 19,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 8
    },
    teamItem: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 20,
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    userAvatar: {
        position: 'relative'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    flex1_5: {
        flex: 1.5
    },
    listStyle: {
        paddingVertical: 15
    },
    listEmptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: '20%',
        marginVertical: '40%'
    },
    noEmployeeImg: {
        width: 200,
        height: 200,
        marginHorizontal: 50
    },
    noEmployeesText: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center'
    },
    subTitleText: {
        fontSize: 14,
        fontWeight: '100',
        textAlign: 'center',
        marginTop: 10,
        color: baseStyle.color.titleGray
    }
})

const SalesMyTeam: FC<SalesMyTeamProps> = (props: SalesMyTeamProps) => {
    const { navigation } = props
    const addEmployeeRef = useRef(null)

    const dispatch = useAppDispatch()
    const [refreshFlag, setRefreshFlag] = useState(0)
    const { isLoading, setIsLoading } = useRepPullDownRefresh('SalesMyTeam', dispatch, false)
    const teamList = useMyTeamList(isLoading, refreshFlag)

    useEffect(() => {
        retrieveTeamMemberDetail().then(() => {
            setRefreshFlag((v) => v + 1)
        })
    }, [])

    const handleRemove = async () => {
        await clearLeadsGroup()
        dispatch(startCustomerListLoading())
        await retrieveTeamMemberDetail()
        await retrieveNewTeamMember(true)
        dispatch(stopCustomerListLoading())
    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigation()
                }}
                disabled
            >
                <SalesMyTeamTile
                    item={item.item}
                    setRemoveFlag={async () => {
                        try {
                            global.$globalModal.openModal()
                            setIsLoading(true)
                            await handleRemove()
                        } catch (e) {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'setRemoveFlag',
                                'retrieve team member customer and lead detail: ' + ErrorUtils.error2String(e)
                            )
                        } finally {
                            global.$globalModal.closeModal()
                        }
                    }}
                />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.flex1_5}>
                <SafeAreaView>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTextContainer}>
                            <CText style={styles.navigationHeaderTitle}>{t.labels.PBNA_MOBILE_MY_TEAM}</CText>
                            <TouchableOpacity
                                hitSlop={styles.hitSlop}
                                onPress={() => {
                                    addEmployeeRef.current?.showModal()
                                }}
                            >
                                <Image style={styles.imgAdd} source={ImageSrc.ADD_BLUE_CIRCLE} />
                            </TouchableOpacity>
                        </View>
                        {/* <View style={styles.searchBarContainer}> */}
                        {/* @ts-ignore */}
                        {/* <SearchBar
                                platform={'ios'}
                                placeholder={'Search'}
                                allowFontScaling={false}
                                clearIcon={null}
                                showCancel
                                cancelButtonTitle={'Clear'}
                                containerStyle={styles.searchBarInnerContainer}
                                inputContainerStyle={styles.searchBarInputContainer}
                                inputStyle={styles.searchInputContainer}
                                value={''}
                                // @ts-ignore
                                onChangeText={() => {}}
                                onBlur={() => {}}
                                onCancel={() => {}}
                            />
                            <TouchableOpacity disabled
                                style={{ marginLeft: 5 } ||
                                { borderRadius: 5, backgroundColor: '#2A82E4', marginLeft: 5 }}
                                onPress={() => {}}
                            >
                                <Image source={require('../../image/icon-sort.png') ||
                                    require('../../image/icon-sort-white.png')}
                                style={[styles.filterImage]}
                                />
                            </TouchableOpacity> */}
                        {/* </View> */}
                    </View>
                </SafeAreaView>
            </View>
            <View style={styles.mainContainer}>
                <FlatList
                    data={teamList}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listStyle}
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
                        <View style={styles.listEmptyContainer}>
                            <Image
                                source={require('../../../../assets/image/NoEmployees.png')}
                                resizeMode="contain"
                                style={styles.noEmployeeImg}
                            />
                            <CText style={styles.noEmployeesText}>{t.labels.PBNA_MOBILE_NO_EMPLOYEES_SELECTED}</CText>
                            <CText style={styles.subTitleText}>{t.labels.PBNA_MOBILE_NO_EMPLOYEES_SELECTED_MSG}</CText>
                        </View>
                    }
                />
            </View>
            <SalesAddEmployee
                cRef={addEmployeeRef}
                onSuccess={async () => {
                    setIsLoading(true)
                    dispatch(startCustomerListLoading())
                    await retrieveNewTeamMember()
                    dispatch(stopCustomerListLoading())
                }}
            />
        </View>
    )
}

export default SalesMyTeam
