import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react'
import { Modal, SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import BackButton from '../../common/BackButton'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import KeyAccountSelector from './innovation-tab/KASelector'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import CustomerCell from './innovation-tab/CustomerCell'
import { CommonLabel } from '../../../enums/CommonLabel'
import InnovaProdSortRadioButton, { InnovaProdSortRadioButtonRef } from './innovation-tab/InnovaProdSortRadioButton'
import _ from 'lodash'
import { Instrumentation } from '@appdynamics/react-native-agent'
import moment from 'moment'
import { t } from '../../../../common/i18n/t'
import { CommonParam } from '../../../../common/CommonParam'
import KamGeographySelector from '../../kam/customers/KamGeographySelector'
import { useDeleteRelatedGEOs, useGetGEOEachLevelCount } from '../../../hooks/KamCustomerHooks'
import KamWiredGroupSelector, { WiredGroupItem } from '../../kam/customers/KamWiredGroupSelector'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
        marginHorizontal: '5%',
        paddingVertical: 10,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    navTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: 30
    },
    navTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    filterContainer: {
        paddingHorizontal: '5%'
    },
    filterTitle: {
        fontSize: 12,
        color: '#565656'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    buttonGroupTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 20
    },
    keyAccountFilter: {
        marginTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    keyAccountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        paddingBottom: 15
    },
    blueIcon: {
        marginTop: 2.5,
        borderWidth: 6,
        borderTopWidth: 6,
        borderColor: 'transparent',
        borderTopColor: '#00A2D9'
    },
    orderDaysContainer: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 40
    },
    checkBoxText: {
        fontWeight: '400',
        color: '#000000',
        marginLeft: 5
    },
    checkBoxContainer: {
        width: '47%',
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0,
        marginTop: 20
    },
    innovationFilterContainer: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15
    },
    topMargin30: {
        marginTop: 30
    },
    topMargin20: {
        marginTop: 20
    },
    busnSegmentFilter: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15
    },
    geoCountText: {
        fontSize: 12,
        marginBottom: 15,
        marginTop: 10
    }
})
interface CustomerSelectorProps {
    cRef: any
    onBack: Function
    selectorObj: any
    setSelectorObj: Dispatch<SetStateAction<any>>
    setQuery?: any
    channelList: any
    isOnline?: boolean
    kamAccountIds?: any[]
    setFilterParamsObject?: Dispatch<SetStateAction<any>>
}

type MapType = {
    [key: string]: string
}

const weekMap: MapType = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
}
const CustomerListSelector = (props: CustomerSelectorProps) => {
    const {
        onBack,
        setQuery,
        selectorObj,
        setSelectorObj,
        channelList,
        isOnline,
        kamAccountIds,
        setFilterParamsObject
    } = props
    const selectorKARef = useRef()
    const sortRef = useRef<InnovaProdSortRadioButtonRef>(null)
    const [isShowKAsMore, setIsShowKAsMore] = useState(true)
    const [sortValue, serSortValue] = useState(selectorObj.selectedSort)
    const busnSegmentLvl: string[] = _.cloneDeep(channelList).splice(1, 3)
    let busnSegmentLvlLabelMap: MapType = {
        0: t.labels.PBNA_MOBILE_LARGE_FORMAT,
        1: t.labels.PBNA_MOBILE_SMALL_FORMAT,
        2: t.labels.PBNA_MOBILE_FOOD_SERVICE
    }
    const busnSegmentLvlMap: MapType = {
        0: 'Large Format',
        1: 'Small Format',
        2: 'FoodService'
    }
    const [selectedBusnSegment, setSelectedBusnSegment] = useState(selectorObj.selectedBusnSegment)
    const [selectedKAs, setSelectedKAs] = useState(selectorObj.selectedKAs)
    const [isShowSelector, setIsShowSelector] = useState(false)
    const [otsSelected, setOtsSelected] = useState(selectorObj.selectedOTS)
    const [voidSelected, setVoidSelected] = useState(selectorObj.selectedVoids)
    const [wksCsSelected, setWksCsSelected] = useState(selectorObj.selectedWksCs)
    const [orderDays, setOrderDays] = useState(selectorObj.selectedOrderDays)

    const [isShowGEOSelector, setIsShowGEOSelector] = useState<boolean>(false)
    const [selectedGEOs, setSelectedGEOs] = useState<any[]>(selectorObj.selectedGEOs || [])
    const [isShowGEOsMore, setIsShowGEOsMore] = useState<boolean>(true)
    const { marketCount, locationCount, territoryCount } = useGetGEOEachLevelCount(selectedGEOs)
    const { deleteRelatedGEOs } = useDeleteRelatedGEOs()

    // Wired Group Filter state
    const [wiredGroupNames, setWiredGroupNames] = useState<WiredGroupItem[]>(selectorObj.wiredGroupNames || [])
    const [isShowWiredGroupSelector, setIsShowWiredGroupSelector] = useState<boolean>(false)
    const [isShowWiredGroupMore, setIsShowWiredGroupMore] = useState<boolean>(true)

    let week = [
        t.labels.PBNA_MOBILE_SUNDAY,
        t.labels.PBNA_MOBILE_MONDAY,
        t.labels.PBNA_MOBILE_TUESDAY,
        t.labels.PBNA_MOBILE_WEDNESDAY,
        t.labels.PBNA_MOBILE_THURSDAY,
        t.labels.PBNA_MOBILE_FRIDAY,
        t.labels.PBNA_MOBILE_SATURDAY
    ]

    useEffect(() => {
        week = [
            t.labels.PBNA_MOBILE_SUNDAY,
            t.labels.PBNA_MOBILE_MONDAY,
            t.labels.PBNA_MOBILE_TUESDAY,
            t.labels.PBNA_MOBILE_WEDNESDAY,
            t.labels.PBNA_MOBILE_THURSDAY,
            t.labels.PBNA_MOBILE_FRIDAY,
            t.labels.PBNA_MOBILE_SATURDAY
        ]
        busnSegmentLvlLabelMap = {
            0: t.labels.PBNA_MOBILE_LARGE_FORMAT,
            1: t.labels.PBNA_MOBILE_SMALL_FORMAT,
            2: t.labels.PBNA_MOBILE_FOOD_SERVICE
        }
    }, [t.labels.PBNA_MOBILE_SUNDAY])

    const restRadio = () => {
        sortRef.current?.reset()
    }

    const handlePressRest = () => {
        serSortValue('')
        restRadio()
        setSelectedKAs([])
        setOrderDays([])
        setOtsSelected(false)
        setSelectedBusnSegment([])
        setVoidSelected(false)
        setWksCsSelected(false)
        setSelectedGEOs([])
        setWiredGroupNames([])
    }

    const showKASelector = (flag: boolean) => {
        setIsShowSelector(flag)
    }

    const showWiredGroupSelector = (flag: boolean) => {
        setIsShowWiredGroupSelector(flag)
    }

    const setChecked = () => {
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
        if (sortValue === 'ASC') {
            return '1'
        } else if (sortValue === 'DESC') {
            return '2'
        }
        return '0'
    }

    const onRemoveKAs = (list: any, index: number) => {
        const tempList = JSON.parse(JSON.stringify(list))
        tempList.splice(index, 1)
        setSelectedKAs(tempList)
    }

    const onRemoveWiredGroup = (list: any[], index: number) => {
        const tempList = JSON.parse(
            JSON.stringify(
                list.map((item) => {
                    return {
                        GroupName: item.Name
                    }
                })
            )
        )
        tempList.splice(index, 1)
        setWiredGroupNames(tempList)
    }

    const onRemoveGEOs = (list: any, index: number) => {
        const newList = deleteRelatedGEOs(list, index)
        setSelectedGEOs(newList)
    }

    const computeKAsQuery = (selectedKAs: any[]) => {
        const KAsIds = selectedKAs.map((v) => `'${v.Id}'`).join(',')
        const localQuery =
            '{RetailStore:AccountId} IN ' +
            '(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ' +
            `(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN (${KAsIds})))`
        const onlineQuery = `Account.Parent.Parent.Id IN (${KAsIds})`
        return isOnline ? onlineQuery : localQuery
    }

    const computeOrderDaysQuery = (orderDays: string[]) => {
        const weekStringArr = orderDays.map((v: string) => `'${weekMap[v]}'`)
        // using INCLUDES for fuzzy search
        return orderDays.length ? `Account.Merchandising_Order_Days__c INCLUDES (${weekStringArr.join(',')})` : ''
    }

    const computeBusnSegmentQuery = (value: string) => {
        return isOnline
            ? `Account.BUSN_SGMNTTN_LVL_3_NM__c = '${busnSegmentLvlMap[value]}'`
            : `{RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c}='${busnSegmentLvlMap[value]}'`
    }

    const computeOtsQuery = () => {
        return isOnline ? 'Account.IsOTSCustomer__c = true' : "{RetailStore:Account.IsOTSCustomer__c} = '1'"
    }

    const computeLocalInnovQuery = (voidSelected: boolean, wksCsSelected: boolean) => {
        let innovQuery: string = ''
        if (!voidSelected && !wksCsSelected) {
            return innovQuery
        }
        const baseQuery = '{RetailStore:Id} IN ' + '(SELECT {StoreProduct:RetailStoreId} FROM {StoreProduct} '
        if (voidSelected && !wksCsSelected) {
            innovQuery = `WHERE {StoreProduct:No_12_LCW_Void__c} = "0" AND {StoreProduct:No_11_WTD_Void__c} = "0" AND {StoreProduct:Product.National_Launch_Date__c} <= "${moment().format(
                'YYYY-MM-DD'
            )}")`
        } else if (wksCsSelected && !voidSelected) {
            innovQuery = 'WHERE {StoreProduct:No_11_WTD_Void__c} = "0" AND {StoreProduct:No_12_LCW_Void__c} = "1")'
        } else if (voidSelected && wksCsSelected) {
            innovQuery =
                `WHERE ({StoreProduct:No_12_LCW_Void__c} = "0" AND {StoreProduct:No_11_WTD_Void__c} = "0" AND {StoreProduct:Product.National_Launch_Date__c} <= "${moment().format(
                    'YYYY-MM-DD'
                )}") OR ` + '({StoreProduct:No_11_WTD_Void__c} = "0" AND {StoreProduct:No_12_LCW_Void__c} = "1"))'
        }
        return baseQuery + innovQuery
    }

    const computeOnlineInnovQuery = (voidSelected: boolean, wksCsSelected: boolean) => {
        let innovQuery: string = ''
        if (!voidSelected && !wksCsSelected) {
            return innovQuery
        }
        // add condition for object `StoreProduct` when online search
        const atmAccountIdString = kamAccountIds?.map((v) => `'${v.AccountId}'`).join(',')
        const baseQuery = `Id IN (SELECT RetailStoreId FROM StoreProduct WHERE RetailStore.AccountId IN (${atmAccountIdString}) `

        if (voidSelected && !wksCsSelected) {
            innovQuery = `AND (No_12_LCW_Void__c = false AND No_11_WTD_Void__c = false AND Product.National_Launch_Date__c <= ${moment().format(
                'YYYY-MM-DD'
            )})`
        } else if (wksCsSelected && !voidSelected) {
            innovQuery = 'AND (No_11_WTD_Void__c = false AND No_12_LCW_Void__c = true)'
        } else if (voidSelected && wksCsSelected) {
            innovQuery =
                `AND ((No_12_LCW_Void__c = false AND No_11_WTD_Void__c = false AND Product.National_Launch_Date__c <= ${moment().format(
                    'YYYY-MM-DD'
                )}) OR ` + '(No_11_WTD_Void__c = false AND No_12_LCW_Void__c = true))'
        }

        // condition same as PSR sync StoreProduct, if not need, add ')' to the end of each innovQuery
        const suffixQuery =
            ' AND Delete_Flag__c = false' +
            " AND RecordType.Name = 'Innovation Product' AND RecordType.SobjectType = 'StoreProduct' AND Product.Innov_Flag__c = true" +
            ' AND Product.IsActive = true' +
            ' AND Product_Availability__c = true' +
            ' AND Product.ProductCode != null)'

        return baseQuery + innovQuery + suffixQuery
    }

    const computeGEOsQuery = (geos: any[]) => {
        const customerIdList: any[] = []
        geos.forEach((geoItem) => {
            customerIdList.push(...geoItem.CcId)
        })
        const idString = _.uniq(customerIdList)
            .map((id) => `'${id}'`)
            .join(',')
        return `AccountId IN (${idString})`
    }

    const computeAccountIdsFromGEOs = (geos: any[]) => {
        const customerIdList: any[] = []
        geos.forEach((geoItem) => {
            customerIdList.push(...geoItem.CcId)
        })
        return _.uniq(customerIdList)
    }

    const handlePressSave = () => {
        setSelectorObj({
            ...selectorObj,
            selectedKAs: selectedKAs,
            selectedOrderDays: orderDays,
            selectedBusnSegment: selectedBusnSegment,
            selectedSort: sortRef.current?.selected,
            selectedOTS: otsSelected,
            selectedVoids: voidSelected,
            selectedWksCs: wksCsSelected,
            selectedGEOs: selectedGEOs,
            wiredGroupNames: wiredGroupNames
        })
        let kaIdQuery = ''
        if (selectedKAs.length > 0) {
            kaIdQuery = computeKAsQuery(selectedKAs)
        }
        let geoQuery = ''
        if (selectedGEOs.length > 0) {
            geoQuery = computeGEOsQuery(selectedGEOs)
        }
        const orderDaysQuery = isOnline
            ? computeOrderDaysQuery(orderDays)
            : orderDays
                  .map((v: string) => `{RetailStore:Account.Merchandising_Order_Days__c} LIKE '%${weekMap[v]}%'`)
                  .join(' OR ')
        const busnSegmentQuery = selectedBusnSegment.map((v: string) => computeBusnSegmentQuery(v)).join(' OR ')
        const otsQuery = otsSelected ? computeOtsQuery() : ''
        kaIdQuery = [kaIdQuery, otsQuery].filter((v) => v !== '').join(' OR ')
        if (otsSelected) {
            Instrumentation.reportMetric('PSR Taps On OTS Customers in My Customer Filter', 1)
        }

        const innovQuery = isOnline
            ? computeOnlineInnovQuery(voidSelected, wksCsSelected)
            : computeLocalInnovQuery(voidSelected, wksCsSelected)
        const query = [
            kaIdQuery ? `(${kaIdQuery})` : kaIdQuery,
            orderDaysQuery ? `(${orderDaysQuery})` : orderDaysQuery,
            busnSegmentQuery ? `(${busnSegmentQuery})` : busnSegmentQuery,
            innovQuery ? `(${innovQuery})` : innovQuery,
            geoQuery ? `(${geoQuery})` : geoQuery
        ]
            .filter((v) => v !== '')
            .join(' AND ')

        if (isOnline) {
            const filterObject = {
                isOTSCustomer: otsSelected,
                merchOrderDays: orderDays.map((v: string) => weekMap[v]),
                segName: selectedBusnSegment.map((v: string) => busnSegmentLvlMap[v]),
                kaIds: selectedKAs.map((v: any) => v.Id),
                accountIds: computeAccountIdsFromGEOs(selectedGEOs),
                wiredGroupNames: wiredGroupNames.map((v) => v.GroupName)
            }
            setFilterParamsObject && setFilterParamsObject(filterObject)
        }

        setQuery && setQuery(query ? 'AND ' + query + ' ' : query)
        onBack()
    }

    return (
        <Modal visible>
            <SafeAreaView style={[styles.container, styles.whiteContainer]}>
                <View style={styles.eHeader}>
                    <View style={styles.navHeader}>
                        <BackButton extraStyle={styles.tintColor} onBackPress={() => onBack()} />
                        <View style={styles.navTitleContainer}>
                            <CText style={[styles.navTitle]}>{t.labels.PBNA_MOBILE_SORT_FILTER}</CText>
                        </View>
                    </View>
                    <ScrollView>
                        <View style={styles.filterContainer}>
                            <CText style={styles.buttonGroupTitle}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
                            <InnovaProdSortRadioButton
                                ref={sortRef}
                                title={t.labels.PBNA_MOBILE_FILTER_CUST_NAME}
                                labelLeft={t.labels.PBNA_MOBILE_SORT_A_Z}
                                labelRight={t.labels.PBNA_MOBILE_SORT_Z_A}
                                valueLeft={'ASC'}
                                valueRight={'DESC'}
                                reset={restRadio}
                                checked={setChecked()}
                            />
                            <CText style={[styles.buttonGroupTitle, styles.topMargin30]}>
                                {t.labels.PBNA_MOBILE_FILTER_BY}
                            </CText>
                            {!isOnline && (
                                <>
                                    <CText style={styles.filterTitle}>{t.labels.PBNA_MOBILE_FILTER_INNOVATION}</CText>
                                    <View style={styles.innovationFilterContainer}>
                                        <CCheckBox
                                            title={t.labels.PBNA_MOBILE_VOIDS}
                                            textStyle={styles.checkBoxText}
                                            containerStyle={styles.checkBoxContainer}
                                            onPress={() => {
                                                setVoidSelected(!voidSelected)
                                                Instrumentation.reportMetric(
                                                    `${CommonParam.PERSONA__c} Select a Filter`,
                                                    1
                                                )
                                            }}
                                            checked={voidSelected}
                                        />
                                        <CCheckBox
                                            title={t.labels.PBNA_MOBILE_METRICS_11WKS_0CS}
                                            textStyle={styles.checkBoxText}
                                            containerStyle={styles.checkBoxContainer}
                                            onPress={() => {
                                                setWksCsSelected(!wksCsSelected)
                                                Instrumentation.reportMetric(
                                                    `${CommonParam.PERSONA__c} Select a Filter`,
                                                    1
                                                )
                                            }}
                                            checked={wksCsSelected}
                                        />
                                    </View>
                                </>
                            )}
                            <CText style={[styles.filterTitle, styles.topMargin30]}>
                                {t.labels.PBNA_MOBILE_FILTER_BUSINESS}
                            </CText>
                            <View style={styles.busnSegmentFilter}>
                                {busnSegmentLvl.map((item, idx) => {
                                    return (
                                        <CCheckBox
                                            key={item}
                                            title={busnSegmentLvlLabelMap[idx]}
                                            onPress={() => {
                                                if (selectedBusnSegment.includes(idx)) {
                                                    const arr: any[] = _.cloneDeep(selectedBusnSegment)
                                                    setSelectedBusnSegment(arr.filter((v) => v !== idx))
                                                } else {
                                                    const arr = _.cloneDeep(selectedBusnSegment)
                                                    arr.push(idx)
                                                    setSelectedBusnSegment(arr)
                                                }
                                                Instrumentation.reportMetric(
                                                    `${CommonParam.PERSONA__c} Select a Filter`,
                                                    1
                                                )
                                            }}
                                            textStyle={styles.checkBoxText}
                                            checked={selectedBusnSegment.includes(idx)}
                                            containerStyle={styles.checkBoxContainer}
                                        />
                                    )
                                })}
                            </View>
                            {isOnline && (
                                <View style={styles.keyAccountFilter}>
                                    <TouchableOpacity
                                        style={styles.keyAccountContainer}
                                        onPress={() => {
                                            setIsShowWiredGroupSelector(true)
                                        }}
                                    >
                                        <CText style={styles.filterTitle}>
                                            {t.labels.PBNA_MOBILE_WIRED_COMMUNICATION_GROUP}
                                        </CText>
                                        <View style={styles.blueIcon} />
                                    </TouchableOpacity>
                                    <View>
                                        {wiredGroupNames.length !== 0 && (
                                            <View>
                                                <CustomerCell
                                                    itemArr={wiredGroupNames.map((item) => {
                                                        return { Name: item.GroupName }
                                                    })}
                                                    handleRemove={onRemoveWiredGroup}
                                                    enableHide
                                                    isShowMore={isShowWiredGroupMore}
                                                    setIsShowMore={setIsShowWiredGroupMore}
                                                    controlNum={CommonLabel.NUMBER_EIGHT}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <View>
                                        {isShowWiredGroupSelector && (
                                            <KamWiredGroupSelector
                                                onBack={() => {
                                                    showWiredGroupSelector(false)
                                                }}
                                                isShowSelector={isShowWiredGroupSelector}
                                                wiredGroupsData={wiredGroupNames}
                                                setWiredGroupsData={(item: any) => {
                                                    setWiredGroupNames(item)
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}
                            {isOnline && (
                                <View style={styles.keyAccountFilter}>
                                    <TouchableOpacity
                                        style={styles.keyAccountContainer}
                                        onPress={() => {
                                            setIsShowGEOSelector(true)
                                        }}
                                    >
                                        <CText style={styles.filterTitle}>
                                            {t.labels.PBNA_MOBILE_FILTER_GEOGRAPHY}
                                        </CText>
                                        <View style={styles.blueIcon} />
                                    </TouchableOpacity>
                                    <View>
                                        {selectedGEOs.length !== 0 && (
                                            <View>
                                                <CText style={styles.geoCountText}>
                                                    {`${marketCount} ${t.labels.PBNA_MOBILE_FILTER_GEOGRAPHY_MARKETS}, ${locationCount} ${t.labels.PBNA_MOBILE_FILTER_GEOGRAPHY_LOCATIONS} & ${territoryCount} ${t.labels.PBNA_MOBILE_FILTER_GEOGRAPHY_TERRITORIES}`}
                                                </CText>
                                                <CustomerCell
                                                    itemArr={selectedGEOs}
                                                    handleRemove={onRemoveGEOs}
                                                    enableHide
                                                    isShowMore={isShowGEOsMore}
                                                    setIsShowMore={setIsShowGEOsMore}
                                                    controlNum={CommonLabel.NUMBER_EIGHT}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <View>
                                        {isShowGEOSelector && (
                                            <KamGeographySelector
                                                onBack={() => {
                                                    setIsShowGEOSelector(false)
                                                }}
                                                selectedGEOs={selectedGEOs}
                                                isShowSelector={isShowGEOSelector}
                                                setSelectedGEOs={(item: any) => {
                                                    setSelectedGEOs(item)
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}
                            <View style={styles.keyAccountFilter}>
                                <TouchableOpacity
                                    style={styles.keyAccountContainer}
                                    onPress={() => {
                                        showKASelector(true)
                                    }}
                                >
                                    <CText style={styles.filterTitle}>{t.labels.PBNA_MOBILE_FILTER_KA_OTS_CUST}</CText>
                                    <View style={styles.blueIcon} />
                                </TouchableOpacity>
                                <View>
                                    {(selectedKAs.length !== 0 || otsSelected) && (
                                        <View>
                                            <CustomerCell
                                                itemArr={selectedKAs}
                                                handleRemove={onRemoveKAs}
                                                enableHide
                                                isShowMore={isShowKAsMore}
                                                setIsShowMore={setIsShowKAsMore}
                                                otsSelected={otsSelected}
                                                setOtsSelected={setOtsSelected}
                                                controlNum={CommonLabel.NUMBER_EIGHT}
                                            />
                                        </View>
                                    )}
                                </View>
                                <View>
                                    {isShowSelector && (
                                        <KeyAccountSelector
                                            cRef={selectorKARef}
                                            onBack={() => {
                                                showKASelector(false)
                                            }}
                                            selectedKAs={selectedKAs}
                                            page={isOnline ? 'KamCustomerList' : 'CustomerList'}
                                            isShowSelector={isShowSelector}
                                            setSelectedKAs={(item: any) => {
                                                setSelectedKAs(item)
                                            }}
                                            otsSelected={otsSelected}
                                            setOtsSelected={setOtsSelected}
                                        />
                                    )}
                                </View>
                            </View>
                            <CText style={[styles.filterTitle, styles.topMargin20]}>
                                {t.labels.PBNA_MOBILE_FILTER_ORDER_DAY}
                            </CText>
                            <View style={styles.orderDaysContainer}>
                                {week.map((item, idx) => {
                                    return (
                                        <CCheckBox
                                            key={item}
                                            title={item}
                                            onPress={() => {
                                                if (orderDays.includes(idx)) {
                                                    const arr: any[] = _.cloneDeep(orderDays)
                                                    setOrderDays(arr.filter((v) => v !== idx))
                                                } else {
                                                    const arr = _.cloneDeep(orderDays)
                                                    arr.push(idx)
                                                    setOrderDays(arr)
                                                }
                                                Instrumentation.reportMetric(
                                                    `${CommonParam.PERSONA__c} Select a Filter`,
                                                    1
                                                )
                                            }}
                                            textStyle={styles.checkBoxText}
                                            checked={orderDays.includes(idx)}
                                            containerStyle={styles.checkBoxContainer}
                                        />
                                    )
                                })}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={handlePressRest}
                onPressSave={handlePressSave}
                rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_APPLY}
                leftButtonLabel={t.labels.PBNA_MOBILE_FILTER_RESET}
                relative
            />
        </Modal>
    )
}
export default CustomerListSelector
