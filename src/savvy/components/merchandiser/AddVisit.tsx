/**
 * @description Add a new visit.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-04
 */

import React, { useState, useEffect, useRef } from 'react'
import { StatusBar, Modal, FlatList, StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { SearchBar } from 'react-native-elements'
import VisitCard from './VisitCard'
import { visitStyle } from './VisitStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { SoupService } from '../../service/SoupService'
import { useIsFocused } from '@react-navigation/native'
import { CommonParam } from '../../../common/CommonParam'
import { syncWithVId } from '../../utils/MerchandiserUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { Log } from '../../../common/enums/Log'
import { getObjByName, syncUpObjCreate } from '../../api/SyncUtils'
import AddVisitBtn from './AddVisitBtn'
import BrandingLoading from '../../../common/components/BrandingLoading'
import { useRecordsPagination } from '../../hooks/CommonHooks'
import _ from 'lodash'
import MyVisitQueries from '../../queries/MyVisitQueries'
import { t } from '../../../common/i18n/t'
import { CommonLabel } from '../../enums/CommonLabel'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    ...commonStyle,
    ...visitStyle,
    containerHeader: {
        minHeight: 180,
        backgroundColor: '#FFFFFF'
    },
    searchBarContainer: {
        height: 36,
        marginTop: 0,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1
    },
    inputContainerStyle: {
        height: 36,
        backgroundColor: '#F2F4F7',
        padding: 0,
        borderRadius: 10
    },
    searchBarStyle: {
        borderRadius: 10,
        backgroundColor: '#F2F4F7',
        margin: 0
    },
    storeList: {
        flex: 1,
        paddingTop: StatusBar.currentHeight
    },
    modalStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    footerContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    whiteColor: {
        backgroundColor: baseStyle.color.white
    },
    pupreColor: {
        backgroundColor: baseStyle.color.purple
    },
    viewText: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textMeg: {
        fontWeight: '900',
        fontSize: 12
    },
    wihiteText: {
        color: 'white'
    },
    pupreText: {
        color: '#6C0CC3'
    },

    btnText: {
        fontSize: 12,
        color: '#6C0CC3',
        fontWeight: '700'
    },
    bottomContainer: {
        flexDirection: 'row'
    },
    btnCancel: {
        width: '50%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: baseStyle.color.white,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.4
    },
    btnAddVisit: {
        width: '50%',
        height: 60,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textAddGray: {
        fontSize: 12,
        color: baseStyle.color.gray,
        fontWeight: baseStyle.fontWeight.fw_900
    },

    textCancel: {
        fontSize: 12,
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    textAddVisit: {
        fontSize: 12,
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    disabledBtnBg: {
        backgroundColor: baseStyle.color.borderGray
    },
    disabledBtnText: {
        color: baseStyle.color.white
    },
    paddingBottom22: {
        paddingBottom: 22
    },
    paddingTop22: {
        paddingTop: 22,
        flex: 1
    },
    safeArea: {
        height: '100%',
        width: '100%'
    },
    successImgSize: {
        width: 56,
        height: 53
    }
})

interface AddVisitProps {
    navigation
}

interface VisitInterface {
    store: any
    visit: any
}

const tempStoreItem = (store) => {
    return {
        accountId: store.AccountId,
        name: store.Name,
        address: `${store.Street || ''}`,
        cityStateZip: `${store.City || ''}, ${store.State || ''}, ${store.PostalCode || ''} `,
        id: store.Id,
        isAdded: false,
        customerId: store['Account.CUST_UNIQ_ID_VAL__c']
    }
}

const chandeSelectStatus = (searchRes, item, val) => {
    searchRes.forEach((element) => {
        if (element.id === item.id) {
            element.isAdded = val
        }
    })
    return searchRes
}

const getVisitType = (res) => {
    return res.filter((type) => type.Name === 'Merchandising' && type.SobjectType === 'Visit')[0] || {}
}

const getShowText = (addVisitList) => {
    return addVisitList?.length === 1 ? 'visit' : 'visits'
}
const getAddListLength = (addVisitList) => {
    return addVisitList?.length > 0
}

const prepareVisitsForCreation = (items) => {
    // Merchandising Visit Only
    return new Promise<Array<VisitInterface>>((resolve, reject) => {
        SoupService.retrieveDataFromSoup('RecordType', {}, [])
            .then((res: any) => {
                const visits = []
                let plannedDate = todayDateWithTimeZone(true)
                if (CommonParam.Is_Night_Shift__c && CommonParam.visitList && CommonParam.visitList.Visit_Date__c) {
                    plannedDate = CommonParam.visitList.Visit_Date__c
                }
                items.forEach((item) => {
                    const visitType = getVisitType(res)
                    const storeId = item.id
                    const visitData = {
                        PlaceId: storeId,
                        VisitorId: CommonParam.userId,
                        OwnerId: CommonParam.userId,
                        Status__c: 'Published',
                        Ad_Hoc__c: true,
                        RecordTypeId: visitType?.Id,
                        Planned_Date__c: plannedDate,
                        Visit_List__c: CommonParam?.visitList?.Id,
                        RecordType: {
                            Id: visitType?.Id,
                            Name: 'Merchandising',
                            DeveloperName: 'Merchandising'
                        }
                    }
                    visits.push({
                        store: item,
                        visit: visitData
                    })
                })
                resolve(visits)
            })
            .catch((err) => {
                reject(err)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'AddVisit.prepareVisitsForCreation',
                    `Get RecordType failed-${CommonParam?.visitList?.Id}: ${ErrorUtils.error2String(err)}`
                )
            })
    })
}

const AddVisit = (props: AddVisitProps) => {
    const [finalQuery, setSearchQuery] = useState(MyVisitQueries.addVisitQuery.q)
    const { navigation } = props
    const isFocused = useIsFocused()
    const [searchVal, setSearchVal] = useState<string>('')
    const [searchRes, setSearchRes] = useState<any>([])
    const [isCleared, setIsCleared] = useState(false)
    const [addVisitList, setAddVisitList] = useState([])
    const { dropDownRef } = useDropDown()
    const [modalVisible, setModalVisible] = useState(false)
    const brandingLoading: any = useRef()
    const { records, offset, setOffset, setNeedRefreshCursor } = useRecordsPagination(
        isFocused,
        false,
        MyVisitQueries.addVisitQuery.f,
        finalQuery,
        'RetailStore'
    )
    const onClose = () => {
        navigation.navigate(CommonLabel.MY_VISIT)
    }

    useEffect(() => {
        const tempStoreList = []
        const addedVisits = [...addVisitList]
        records.forEach((store) => {
            const item = tempStoreItem(store)
            if (addedVisits.find((vis) => item.id === vis.id)) {
                item.isAdded = true
            }
            tempStoreList.push(item)
        })
        setSearchRes(tempStoreList)
    }, [isFocused, records])

    const handleReachEnd = () => {
        setOffset(offset + 1)
    }
    const onSearchTextChange = _.debounce((text) => {
        const t = text.toLowerCase()
        const finalQue =
            MyVisitQueries.addVisitQuery.q +
            `
          AND ({RetailStore:Name} LIKE '%${t}%' OR
          {RetailStore:Street} LIKE '%${t}%' OR
          {RetailStore:City} LIKE '%${t}%' OR
          {RetailStore:State} LIKE '%${t}%' OR
          {RetailStore:Account.CUST_UNIQ_ID_VAL__c} LIKE '%${t}%' OR
          {RetailStore:PostalCode} LIKE '%${t}%')
        `
        // const tempList = []
        setSearchQuery(finalQue)
        setNeedRefreshCursor(true)
        setIsCleared(false)
    })

    const addVisits = (item, type) => {
        const newAddList = [...addVisitList]
        if (type === 'add') {
            const newSearchRes = chandeSelectStatus(searchRes, item, true)
            setSearchRes(newSearchRes)
            if (addVisitList.findIndex((element) => element.id === item.id) === -1) {
                item.isAdded = true
                newAddList.push(item)
            }
        }
        if (type === 'reduce') {
            const newSearchRes = chandeSelectStatus(searchRes, item, false)
            setSearchRes(newSearchRes)
            const index = addVisitList.findIndex((element) => element.id === item.id)
            newAddList.splice(index, 1)
        }

        setAddVisitList(newAddList)
    }

    const syncAddVisits = async (items) => {
        brandingLoading.current.show()
        let visits = []
        try {
            Instrumentation.startTimer('Merchandiser add visit')
            const res = await prepareVisitsForCreation(items)
            const visitData = res.map((r) => r.visit)
            const storeData = res.map((r) => r.store)
            visits = await SoupService.upsertDataIntoSoup('Visit', visitData)
            const data = await syncUpObjCreate(
                'Visit',
                getObjByName('Visit').syncUpCreateFields,
                getObjByName('Visit').syncUpCreateQuery
            )
            await SoupService.removeRecordFromSoup(
                'Visit',
                visits.map((v) => v._soupEntryId)
            )
            const vis = data[0].data.map((v) => v.Id)
            CommonParam.uniqueStoreIds = storeData.map((st) => st.id)
            CommonParam.uniqueAccountIds = storeData.map((st) => st.accountId)
            CommonParam.uniqueCustomerIds = storeData.map((st) => st.customerId)

            syncWithVId(vis).then(() => {
                const cloneRes = JSON.parse(JSON.stringify(searchRes))
                cloneRes.map((oItem) => {
                    if (storeData.map((st) => st.id).indexOf(oItem.id) !== -1) {
                        oItem.isAdded = true
                    }
                    return oItem
                })
                setSearchRes(cloneRes)
                brandingLoading.current.hide()
                setModalVisible(true)
                Instrumentation.stopTimer('Merchandiser add visit')
                const timeoutId = setTimeout(() => {
                    setModalVisible(false)
                    clearTimeout(timeoutId)
                    onClose()
                }, 1000)
            })
        } catch (error) {
            await SoupService.removeRecordFromSoup(
                'Visit',
                visits.map((v) => v._soupEntryId)
            )
            storeClassLog(
                Log.MOBILE_INFO,
                'AddVisit.syncAddVisits',
                `Create visit failed: ${ErrorUtils.error2String(error)}`
            )
            dropDownRef.current.alertWithType('error', 'Create visit failed', ErrorUtils.error2String(error))
            brandingLoading.current.hide()
        }
    }

    const renderItem = ({ item }) => {
        return <VisitCard addVisits={addVisits} item={item} withoutCallIcon />
    }

    return (
        <View style={styles.greyBox}>
            <View style={[styles.containerHeader, styles.paddingX]}>
                <View style={[styles.marginTop51, styles.rowWithCenter]}>
                    <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_ADD_NEW_VISIT}</CText>
                </View>
                <View style={[styles.marginTop37, styles.rowWithCenter]}>
                    <SearchBar
                        containerStyle={[styles.searchBarContainer, styles.greyBox]}
                        inputContainerStyle={styles.inputContainerStyle}
                        inputStyle={[styles.colorBlack, styles.marginX0]}
                        leftIconContainerStyle={styles.marginLeft5}
                        searchIcon={
                            <Image
                                style={styles.iconMedium}
                                source={require('../../../../assets/image/icon-search.png')}
                            />
                        }
                        clearIcon={
                            !isCleared && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsCleared(true)
                                        setSearchVal('')
                                        onSearchTextChange('')
                                    }}
                                >
                                    <Image
                                        style={styles.iconSmall}
                                        source={require('../../../../assets/image/ios-clear.png')}
                                    />
                                </TouchableOpacity>
                            )
                        }
                        placeholder={t.labels.PBNA_MOBILE_SEARCH_CUSTOMER}
                        onChangeText={(text) => {
                            onSearchTextChange(text)
                            setSearchVal(text)
                        }}
                        value={searchVal}
                        allowFontScaling={false}
                    />
                </View>
            </View>

            <View style={styles.storeList}>
                <FlatList
                    data={searchRes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    style={styles.paddingTop22}
                    contentContainerStyle={styles.paddingBottom22}
                    onEndReached={() => {
                        handleReachEnd()
                    }}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={5}
                />
            </View>

            <AddVisitBtn onClose={onClose} syncAddVisits={syncAddVisits} addVisitList={addVisitList} />

            <BrandingLoading cRef={brandingLoading} />

            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableOpacity
                    style={styles.safeArea}
                    onPress={() => {
                        setModalVisible(!modalVisible)
                        onClose()
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Image
                                style={styles.successImgSize}
                                source={require('../../../../assets/image/icon-success.png')}
                            />
                            {getAddListLength(addVisitList) && (
                                <CText style={styles.modalText}>
                                    {addVisitList.length} {t.labels.PBNA_MOBILE_NEW.toLowerCase()}{' '}
                                    {getShowText(addVisitList)} {t.labels.PBNA_MOBILE_ADD_SUCCESS}!
                                </CText>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default AddVisit
