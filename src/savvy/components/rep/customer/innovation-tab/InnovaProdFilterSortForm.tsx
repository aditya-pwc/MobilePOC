/**
 * @description Component of sort filter modal for innovation product
 * @author Qiulin Deng
 * @date 2021/12/08
 */
import { Image, StyleSheet, TouchableOpacity, View, Modal, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import React, { FC, useRef, useState, useEffect } from 'react'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { SoupService } from '../../../../service/SoupService'
import InnovaProdSortForm from './InnovaProdSortForm'
import { usePreset } from '../../../../hooks/InnovationProductHooks'
import { checkPresetCustomerStatus, loadRoutesForSwitch } from '../../../../utils/InnovationProductUtils'
import { InnovaProdFilterQueries } from '../../../../queries/InnovationProductQueries'
import { ButtonGroup, Input } from 'react-native-elements'
import KeyAccountSelector from './KASelector'
import AccountSelector from './AccountSelector'
import CustomerCell from './CustomerCell'
import { CommonParam } from '../../../../../common/CommonParam'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import PickerTile from '../../lead/common/PickerTile'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { isPersonaUGMOrSDL } from '../../../../../common/enums/Persona'
import InnovaTerritoryFilter, { renderRoutesBtn, renderTerritoryBtn } from './InnovaTerritoryFilter'
import SubTypeModal from '../../../manager/common/SubTypeModal'

interface InnovaProdFilterSortFormProps {
    navigation: any
    route: any
}

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        marginTop: 60,
        ...commonStyle.alignCenter,
        position: 'relative',
        marginBottom: 20
    },
    title: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    buttonGroupTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginTop: 40,
        marginBottom: 20
    },
    buttonGroupLabel: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: '#565656',
        marginBottom: 15
    },
    buttonGroupText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: '#00A2D9'
    },
    buttonGroupContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        height: 32,
        marginVertical: 6
    },
    btnBack: {
        position: 'absolute',
        left: 22
    },
    checkBoxText: {
        fontWeight: '400',
        color: '#000000',
        marginLeft: 5,
        fontFamily: 'Gotham-Book',
        fontSize: 12
    },
    checkBoxContainer: {
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    imgBack: {
        width: 12,
        height: 20
    },
    line: {
        height: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: '5%'
    },
    blueIcon: {
        marginTop: 2.5,
        borderWidth: 6,
        borderTopWidth: 6,
        borderColor: 'transparent',
        borderTopColor: '#00A2D9'
    },
    keyAccountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        paddingBottom: 15
    },
    searchItem: {
        paddingBottom: 0
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book',
        marginTop: 5
    },
    noPaddingHorizontal: {
        paddingHorizontal: 0
    },
    inputStyle14: {
        marginTop: 0,
        fontSize: baseStyle.fontSize.fs_14
    },
    font12: {
        fontSize: baseStyle.fontSize.fs_12
    },
    inputContainer: {
        borderBottomColor: '#D3D3D3',
        marginBottom: 6
    },
    prestContainer: {
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 8,
        paddingHorizontal: '5%',
        marginBottom: 30,
        paddingVertical: '4%'
    },
    myFilterContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10
    },
    filterText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    savePreset: {
        borderWidth: 0.5,
        borderColor: baseStyle.color.cGray,
        borderRadius: 8,
        width: '100%',
        paddingHorizontal: '5%',
        paddingVertical: '5%'
    },
    saveContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    saveTitle: {
        marginBottom: '8%',
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    presetNameInput: {
        marginTop: 0,
        fontSize: baseStyle.fontSize.fs_14
    },
    f12Style: {
        fontSize: baseStyle.fontSize.fs_12
    },
    cancelView: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    cancelBtn: {
        width: '49%',
        height: 35,
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelTitle: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.LightBlue,
        fontSize: baseStyle.fontSize.fs_12
    },
    saveBtn: {
        width: '49%',
        alignItems: 'center',
        height: 35,
        borderRadius: 5,
        justifyContent: 'center'
    },
    customSave: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_18,
        textAlign: 'center'
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    successContainer2: {
        height: 230,
        width: 280,
        borderRadius: 8,
        backgroundColor: baseStyle.color.white
    },
    successContainer3: {
        paddingHorizontal: 21,
        justifyContent: 'center',
        alignItems: 'center'
    },
    successImg: {
        width: 60,
        marginTop: 45,
        marginBottom: 15,
        height: 57
    },
    ostContainer: {
        marginTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    ostTitle: {
        fontSize: 12,
        color: '#565656'
    },
    searchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        borderColor: '#D3D3D3',
        borderBottomWidth: 1,
        marginBottom: 20
    },
    searchImg: {
        height: 16,
        width: 16,
        marginRight: 10
    },
    searchTitle: {
        fontSize: 14,
        color: '#D3D3D3'
    },
    newViewCon: {
        marginBottom: 60,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputLengthIndicator: {
        fontSize: baseStyle.fontSize.fs_12,
        color: '#999'
    },
    deleteBtn: {
        color: baseStyle.color.red,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    width90: {
        width: '90%'
    },
    keyboard: {
        flex: 1,
        paddingTop: 29.5,
        marginHorizontal: '5%'
    },
    btnGroupCon: {
        width: '100%',
        backgroundColor: '#F2F4F7',
        marginBottom: 20,
        height: 44
    },
    btnGroupText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: '#00A2D9'
    },
    innerBorderStyle: {
        width: 0
    },
    btnStyle: {
        borderRadius: 4
    },
    btnSelect: {
        backgroundColor: '#00A2D9'
    },
    btnGroupContain: {
        width: '100%',
        backgroundColor: '#F2F4F7',
        borderRadius: 5,
        height: 44,
        marginBottom: 25
    },
    checkBoxCon: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    addCusCon: {
        marginTop: 30,
        marginBottom: 25
    },
    selectCusText: {
        fontSize: 12,
        color: '#565656',
        marginBottom: 15
    }
})

const customFilterLabelMaxLength = 19

const formatTerritoryData = (selectData?: any[]) => {
    return CommonParam.locationArr.map((item, index) => {
        const selectedItems = _.size(selectData) > 0 ? selectData.filter((selectItem) => selectItem.Id === item.Id) : []
        return {
            ...item,
            name: t.labels.PBNA_MOBILE_DENVER_TERRITORY + ` ${index + 1} - ` + item.SLS_UNIT_NM__c,
            select: _.size(selectedItems) > 0,
            Name: t.labels.PBNA_MOBILE_DENVER_TERRITORY + ` ${index + 1} - ` + item.SLS_UNIT_NM__c
        }
    })
}

const getRoutesWithTes = async (targetTes: any[]) => {
    const locData = targetTes.filter((item) => item.LOC_ID__c !== null)
    if (_.size(locData) === 0) {
        return []
    }
    return loadRoutesForSwitch(
        ` AND GTMU_RTE_ID__c!=NULL AND LOC_ID__c IN (${locData
            .map((v) => "'" + v.LOC_ID__c + "'")
            .join(',')}) ORDER BY GTMU_RTE_ID__c ASC `
    )
}

const formatRouteData = (originData) => {
    return originData.map((item) => {
        return {
            ...item,
            name: `${item.GTMU_RTE_ID__c || ''}`,
            select: true,
            Name: `${item.GTMU_RTE_ID__c || ''}`
        }
    })
}
const getCurrentSelectedRoutes = (newSelectedTes: any[], preSelectedTes: any[], selectRoutes: any[]) => {
    return new Promise((resolve, reject) => {
        const insertTesLst = newSelectedTes.reduce((pre, cur) => {
            if (preSelectedTes.every((item) => item.Id !== cur.Id)) {
                pre.push(cur)
            }
            return pre
        }, [])
        const removeTesLst = preSelectedTes.reduce((pre, cur) => {
            if (newSelectedTes.every((item) => item.Id !== cur.Id)) {
                pre.push(cur)
            }
            return pre
        }, [])
        Promise.all([getRoutesWithTes(insertTesLst), getRoutesWithTes(removeTesLst)])
            .then((res) => {
                const insertRoutes = res[0]
                const removeRoutes = res[1]
                let routeList
                routeList = selectRoutes.reduce((pre, cur) => {
                    if (removeRoutes.every((item) => item.Id !== cur.Id)) {
                        pre.push(cur)
                    }
                    return pre
                }, [])
                const checkedInsertRoutes = insertRoutes.reduce((pre, cur) => {
                    if (selectRoutes.every((item) => item.Id !== cur.Id)) {
                        pre.push(cur)
                    }
                    return pre
                }, [])
                if (routeList) {
                    routeList = routeList.concat(checkedInsertRoutes)
                } else {
                    routeList = selectRoutes.concat(checkedInsertRoutes)
                }
                resolve(formatRouteData(routeList))
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const InnovaProdFilterSortForm: FC<InnovaProdFilterSortFormProps> = (props: InnovaProdFilterSortFormProps) => {
    const { navigation, route } = props
    const sortRef = useRef(null)
    const {
        filterValue,
        selectedKAsValue,
        selectedCustomersValue,
        selectedOTS,
        selectedSortValue,
        mPickPreset,
        mPickSoupEntryId,
        setSort,
        setFilterQuery,
        mPresetRef,
        setMSelectedPreset,
        selectedBusnSegment,
        setSelectedKAsEmit
    } = route.params
    const [sortValue, setSortValue] = useState(selectedSortValue)
    const [selectedLocationIndex, setSelectedLocationIndex] = useState(filterValue[0])
    const [selectedLaunchIndex, setSelectedLaunchIndex] = useState(filterValue[1])
    const [isShowSelector, setIsShowSelector] = useState(false)
    const [isAccountShowSelector, setIsAccountShowSelector] = useState(false)
    const [selectedKAs, setSelectedKAs] = useState(selectedKAsValue)
    const [isKAChange, setIsKAChange] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState(mPickPreset)
    const [presetName, setPresetName] = useState('')
    const [saveNewPreset, setSaveNewPreset] = useState(false)
    const [isShowCustomersMore, setIsShowCustomersMore] = useState(true)
    const [isShowKAsMore, setIsShowKAsMore] = useState(true)
    const [isEdit, setIsEdit] = useState(true)
    const [renamePreset, setRenamePreset] = useState('')
    const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)
    const [isFilterChange, setIsFilterChange] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(selectedCustomersValue)
    const [otsSelected, setOtsSelected] = useState(selectedOTS)
    const [busnSegmentSelected, setBusnSegmentSelected] = useState(selectedBusnSegment)
    const [showSuccess, setShowSuccess] = useState(false)
    const [savePresetCount, setSavePresetCount] = useState(0)
    const [checkIsChangePreset, setCheckIsChangePreset] = useState(true)
    const [presets, setPresets] = useState<any>()
    const { presetNameLst, presetMap } = usePreset(savePresetCount, setPresets)
    const presetRef = useRef(null)
    const busnSegmentLvlLabelList = [
        t.labels.PBNA_MOBILE_LARGE_FORMAT,
        t.labels.PBNA_MOBILE_SMALL_FORMAT,
        t.labels.PBNA_MOBILE_FOOD_SERVICE
    ]
    const busnSegmentLvlMap = {
        0: 'Large Format',
        1: 'Small Format',
        2: 'FoodService'
    }
    const [selectTerritories, setSelectTerritories] = useState([])
    const [selectRoutes, setSelectRoutes] = useState([])
    const [territories, setTerritories] = useState(formatTerritoryData(selectTerritories))

    const [typeModalVisible, setTypeModalVisible] = useState(false)

    useEffect(() => {
        if (isKAChange && !isPersonaUGMOrSDL()) {
            SoupService.retrieveDataFromSoup('Account', {}, [], null, [
                'WHERE ({Account:Id} IN ' +
                    '(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ' +
                    `(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN (${selectedKAs
                        .map((v) => `'${v.Id}'`)
                        .join(',')})))` +
                    `${otsSelected ? " OR {Account:IsOTSCustomer__c}='1')" : ')'}` +
                    " AND {Account:CUST_LVL__c} = 'Customer Outlet'" +
                    ' ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
            ]).then((res) => {
                if (otsSelected) {
                    const customerLst = res.reduce((pre, cur) => {
                        if (selectedCustomer.every((item) => item.Id !== cur.Id)) {
                            pre.push(cur)
                        }
                        return pre
                    }, [])
                    setSelectedCustomer(selectedCustomer.concat(customerLst))
                    setIsKAChange(false)
                } else {
                    const kaCustomerLstIds = res.map((v) => v.Id)
                    const notOTSLst = selectedCustomer.filter(
                        (v) => v.IsOTSCustomer__c === '0' && !kaCustomerLstIds.includes(v.Id)
                    )
                    const relationCustomerList =
                        selectedCustomer.length > 0
                            ? selectedCustomer.filter((v) => kaCustomerLstIds.includes(v.Id))
                            : res
                    setSelectedCustomer(notOTSLst.concat(relationCustomerList))
                    setIsKAChange(false)
                }
            })
        }
    }, [selectedKAs, otsSelected])

    const showKASelector = (flag) => {
        setIsShowSelector(flag)
    }

    const showAccountSelector = (flag) => {
        setIsAccountShowSelector(flag)
    }

    const onRemoveKAs = async (list, index) => {
        const tempList = JSON.parse(JSON.stringify(list))
        const relationCustomerLst = await SoupService.retrieveDataFromSoup('Account', {}, [], null, [
            'WHERE {Account:Id} IN ' +
                '(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ' +
                `(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ('${tempList[index].Id}')))` +
                " AND {Account:CUST_LVL__c} = 'Customer Outlet'" +
                ` AND {Account:IsOTSCustomer__c}${otsSelected ? "!='1'" : ' IS NOT NULL'} ` +
                ' ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
        ])
        const customerLst = selectedCustomer.reduce(function (pre, cur) {
            if (relationCustomerLst.every((item) => item.Id !== cur.Id)) {
                pre.push(cur)
            }
            return pre
        }, [])
        setSelectedCustomer(customerLst)
        tempList.splice(index, 1)
        setSelectedKAs(tempList)
    }

    const onRemoveOTS = () => {
        setIsKAChange(true)
    }

    const onRemoveCustomer = (list, index) => {
        const tempList = JSON.parse(JSON.stringify(list))
        tempList.splice(index, 1)
        setSelectedCustomer(tempList)
    }

    const selectorKARef = useRef()
    const selectorCUstomerRef = useRef()

    const checkClick = (index) => {
        territories[index].select = !territories[index].select
        setTerritories([...territories])
    }

    const onCancelSubType = () => {
        setTerritories(formatTerritoryData(selectTerritories))
        setTypeModalVisible(!typeModalVisible)
    }
    const updateVisitSubType = async () => {
        const newSelectedTes = territories.filter((item) => item.select === true)
        getCurrentSelectedRoutes(newSelectedTes, selectTerritories, selectRoutes).then((routeRes: []) => {
            setSelectRoutes(routeRes)
        })
        setSelectTerritories(newSelectedTes)
        setTypeModalVisible(!typeModalVisible)
    }
    const onRemoveTes = async (list, index) => {
        const tempList = JSON.parse(JSON.stringify(list))
        tempList.splice(index, 1)
        getCurrentSelectedRoutes(tempList, selectTerritories, selectRoutes).then((routeRes: []) => {
            setSelectRoutes(routeRes)
        })
        setSelectTerritories(tempList)
    }

    const onRemoveRoutes = (list, index) => {
        const tempList = JSON.parse(JSON.stringify(list))
        tempList.splice(index, 1)
        setSelectRoutes(tempList)
    }

    useEffect(() => {
        setTerritories(formatTerritoryData(selectTerritories))
    }, [selectTerritories])

    const handlePressCancel = () => {
        sortRef.current?.reset()
        setSelectedKAs([])
        setSelectedCustomer([])
        setSelectedLocationIndex(0)
        setSelectedLaunchIndex(0)
        setOtsSelected(false)
        setBusnSegmentSelected([])
        setIsEdit(true)
        setSaveNewPreset(false)
        setIsFilterChange(false)
        presetRef.current.resetNull()
        setSelectedPreset('')
        setPresetName('')
        setSortValue('')
    }

    const getCustomerQuery = (filterQuery: string) => {
        let customerQuery = ''
        if (selectedCustomer.length > 0) {
            const accountIds = selectedCustomer.map((v: any) => `'${v.Id}'`).join(',')
            customerQuery =
                '({StoreProduct:RetailStoreId} IN ' +
                '(SELECT {RetailStore:Id} FROM {RetailStore}' +
                ` WHERE {RetailStore:AccountId} IN (${accountIds})))`
        }
        if (busnSegmentSelected.length > 0) {
            customerQuery += customerQuery !== '' ? ' AND ' : ''
            customerQuery +=
                '({StoreProduct:RetailStoreId} IN ' +
                '(SELECT {RetailStore:Id} FROM {RetailStore} ' +
                `WHERE ${busnSegmentSelected
                    .map((v) => `{RetailStore:Account.BUSN_SGMNTTN_LVL_3_NM__c}='${busnSegmentLvlMap[v]}'`)
                    .join(' OR ')}))`
        }
        const query = [filterQuery, customerQuery ? `(${customerQuery})` : customerQuery]
            .filter((v) => v !== '')
            .join(' AND ')
        return query
    }
    const handlePressSave = () => {
        const { filterQuery, filterSelected } = InnovaProdFilterQueries([selectedLocationIndex, selectedLaunchIndex])
        const query = getCustomerQuery(filterQuery)
        if (otsSelected) {
            Instrumentation.reportMetric('PSR Taps On OTS Customers In My Metrics Filter', 1)
        }
        Instrumentation.startTimer('PSR Rerender My Metrics After Filter Changes')
        setSort(sortValue)
        setFilterQuery(query)
        setSelectedKAsEmit(selectedKAs)
        if (selectedPreset) {
            const presetFilterObj = JSON.parse(presets[selectedPreset].FilterJSON)
            if (sortValue === presetFilterObj.sortSelected && query === presetFilterObj.filterQuery) {
                navigation.navigate('MyMetricsScreen', {
                    sortSelected: sortValue,
                    filterQuery: query,
                    filterSelected: filterSelected,
                    selectedKAsValue: selectedKAs,
                    selectedCustomersValue: selectedCustomer,
                    selectedBusnSegment: busnSegmentSelected,
                    selectedOTS: otsSelected,
                    selectedPreset: selectedPreset
                })
                setMSelectedPreset(selectedPreset)
                mPresetRef.current.reset()
            } else {
                navigation.navigate('MyMetricsScreen', {
                    sortSelected: sortValue,
                    filterQuery: query,
                    filterSelected: filterSelected,
                    selectedKAsValue: selectedKAs,
                    selectedCustomersValue: selectedCustomer,
                    selectedBusnSegment: busnSegmentSelected,
                    selectedOTS: otsSelected,
                    selectedPreset: ''
                })
                setMSelectedPreset('')
                mPresetRef.current.resetNull()
            }
        } else {
            navigation.navigate('MyMetricsScreen', {
                sortSelected: sortValue,
                filterQuery: query,
                filterSelected: filterSelected,
                selectedKAsValue: selectedKAs,
                selectedCustomersValue: selectedCustomer,
                selectedBusnSegment: busnSegmentSelected,
                selectedOTS: otsSelected,
                selectedPreset: ''
            })
            setMSelectedPreset('')
            mPresetRef.current.resetNull()
        }
    }

    const handleSavePreset = async () => {
        if (presetNameLst.includes(presetName.trim())) {
            Alert.alert(
                t.labels.PBNA_MOBILE_DUPLICATE_FILTER + ' \n' + t.labels.PBNA_MOBILE_FILTER_NAME,
                t.labels.PBNA_MOBILE_CUSTOM_FILTER + ' \n' + t.labels.PBNA_MOBILE_FILTER_RENAME
            )
        } else {
            const { filterQuery, filterSelected } = InnovaProdFilterQueries([
                selectedLocationIndex,
                selectedLaunchIndex
            ])
            const query = getCustomerQuery(filterQuery)
            const presetObj = {
                Name: presetName.trim(),
                UserId: CommonParam.userId,
                GTMUId: CommonParam.userRouteGTMUId,
                FilterJSON: JSON.stringify({
                    sortSelected: sortValue,
                    filterSelected: filterSelected,
                    selectedKAsValue: selectedKAs,
                    selectedCustomersValue: selectedCustomer,
                    selectedBusnSegment: busnSegmentSelected,
                    selectedOTS: otsSelected,
                    filterQuery: query
                })
            }
            await SoupService.upsertDataIntoSoup('Preset', [presetObj])
            setShowSuccess(true)
            setTimeout(() => {
                setSaveNewPreset(false)
                setSelectedPreset(presetName.trim())
                if (!isEdit) {
                    setIsEdit(true)
                }
                presetRef.current.reset()
                setPresetName('')
                setShowSuccess(false)
                setSavePresetCount((v) => v + 1)
            }, 2000)
        }
    }

    useEffect(() => {
        if (
            sortValue !== '' ||
            selectedLocationIndex !== 0 ||
            selectedLaunchIndex !== 0 ||
            busnSegmentSelected.length > 0 ||
            selectedCustomer.length > 0
        ) {
            setIsFilterChange(true)
        } else {
            setIsFilterChange(false)
        }
    }, [sortValue, selectedLocationIndex, selectedLaunchIndex, selectedCustomer, busnSegmentSelected])

    const setPreset = (v) => {
        const presetObj = JSON.parse(presetMap[v].FilterJSON)
        setSelectedLocationIndex(presetObj.filterSelected[0])
        setSelectedLaunchIndex(presetObj.filterSelected[1])
        setSelectedKAs(presetObj.selectedKAsValue)
        setSelectedCustomer(presetObj.selectedCustomersValue)
        setBusnSegmentSelected(presetObj.selectedBusnSegment)
        if (presetObj.selectedOTS) {
            setOtsSelected(true)
        } else {
            setOtsSelected(false)
        }
        setSortValue(presetObj.sortSelected)
    }

    const handleCancelUpdate = () => {
        setSaveNewPreset(false)
        setIsFilterChange(false)
        setSelectedPreset(selectedPreset)
        setPreset(selectedPreset)
        setIsEdit(true)
    }

    const handleDeletePreset = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_DELETE_FILTER,
            `"${selectedPreset}" ` + t.labels.PBNA_MOBILE_FILTER_DELETE_MSG,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    onPress: () => {
                        handleCancelUpdate()
                    }
                },
                {
                    text: t.labels.PBNA_MOBILE_YES + ', ' + t.labels.PBNA_MOBILE_DELETE.toLowerCase(),
                    onPress: async () => {
                        const presetObj = presetMap[selectedPreset]
                        if (presetObj._soupEntryId === mPickSoupEntryId) {
                            setMSelectedPreset('')
                            setSelectedPreset('')
                            setFilterQuery('')
                            setSort('')
                            mPresetRef.current.resetNull()
                        }
                        await SoupService.removeRecordFromSoup('Preset', [presetObj._soupEntryId])
                        setSavePresetCount((v) => v + 1)
                        handlePressCancel()
                    }
                }
            ]
        )
    }
    const renderEditOrDelete = () => {
        if (isEdit) {
            return (
                <TouchableOpacity
                    disabled={selectedPreset === ''}
                    onPress={() => {
                        setRenamePreset(selectedPreset)
                        setSaveNewPreset(false)
                        setIsFilterChange(false)
                        setSelectedPreset(selectedPreset)
                        setPreset(selectedPreset)
                        setIsEdit(false)
                    }}
                >
                    <CText
                        style={{
                            // Dynamic Inline Style
                            color: selectedPreset === '' ? baseStyle.color.cGray : baseStyle.color.LightBlue,
                            fontSize: baseStyle.fontSize.fs_12,
                            fontWeight: baseStyle.fontWeight.fw_700
                        }}
                    >
                        {t.labels.PBNA_MOBILE_EDIT}
                    </CText>
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity disabled={selectedPreset === ''} onPress={handleDeletePreset}>
                <CText style={styles.deleteBtn}>{t.labels.PBNA_MOBILE_DELETE.toUpperCase()}</CText>
            </TouchableOpacity>
        )
    }

    const handleUpdatePreset = async () => {
        if (presetNameLst.includes(renamePreset.trim()) && selectedPreset !== renamePreset) {
            Alert.alert(
                t.labels.PBNA_MOBILE_DUPLICATE_FILTER + ' \n' + t.labels.PBNA_MOBILE_FILTER_NAME,
                t.labels.PBNA_MOBILE_CUSTOM_FILTER + ' \n' + t.labels.PBNA_MOBILE_FILTER_RENAME
            )
        } else {
            const { filterQuery, filterSelected } = InnovaProdFilterQueries([
                selectedLocationIndex,
                selectedLaunchIndex
            ])
            const presetObj = _.cloneDeep(presetMap[selectedPreset])
            if (renamePreset.trim() !== presetObj.Name) {
                if (presetObj._soupEntryId === mPickSoupEntryId) {
                    setMSelectedPreset(renamePreset.trim())
                    mPresetRef.current.reset()
                }
                presetObj.Name = renamePreset.trim()
                setSelectedPreset(renamePreset.trim())
                // setPickPreset(renamePreset.trim())
            }
            const query = getCustomerQuery(filterQuery)
            presetObj.FilterJSON = JSON.stringify({
                sortSelected: sortValue,
                filterSelected: filterSelected,
                selectedKAsValue: selectedKAs,
                selectedCustomersValue: selectedCustomer,
                selectedBusnSegment: busnSegmentSelected,
                selectedOTS: otsSelected,
                filterQuery: query
            })
            await SoupService.upsertDataIntoSoup('Preset', [presetObj])
            setShowUpdateSuccess(true)
            setTimeout(() => {
                setSavePresetCount((v) => v + 1)
                setSaveNewPreset(false)
                setIsEdit(true)
                setShowUpdateSuccess(false)
                presetRef.current.reset()
            }, 2000)
        }
    }
    const renderPresetPickOrRename = () => {
        if (isEdit) {
            return (
                <PickerTile
                    cRef={presetRef}
                    data={presetNameLst}
                    label={''}
                    disabled={false}
                    defValue={selectedPreset}
                    placeholder={t.labels.PBNA_MOBILE_METRICS_CUSTOM_FILTER}
                    noPaddingHorizontal
                    onDone={async (v: any) => {
                        if (v) {
                            await checkPresetCustomerStatus(presetMap[v])
                            setSaveNewPreset(false)
                            setIsFilterChange(false)
                            setSelectedPreset(v)
                            setPreset(v)
                        } else {
                            handlePressCancel()
                        }
                    }}
                    required={false}
                    modalStyle={styles.width90}
                    title={t.labels.PBNA_MOBILE_METRICS_CUSTOM_FILTER}
                />
            )
        }
        return (
            <Input
                inputStyle={styles.inputStyle14}
                labelStyle={styles.font12}
                value={renamePreset}
                inputContainerStyle={styles.inputContainer}
                containerStyle={styles.noPaddingHorizontal}
                onChangeText={(e) => {
                    setRenamePreset(e)
                }}
                placeholder={t.labels.PBNA_MOBILE_NAME_CUSTOM_FILTER}
                maxLength={customFilterLabelMaxLength}
                rightIcon={
                    <CText style={styles.inputLengthIndicator}>
                        {renamePreset.length}/{customFilterLabelMaxLength}
                    </CText>
                }
            />
        )
    }
    const renderPresetSelect = () => {
        return (
            <View style={styles.prestContainer}>
                <View style={styles.myFilterContainer}>
                    <CText style={styles.filterText}>{t.labels.PBNA_MOBILE_METRICS_MY_FILTER}</CText>
                    {renderEditOrDelete()}
                </View>
                {renderPresetPickOrRename()}
            </View>
        )
    }
    const renderSaveNewPreset = () => {
        if (saveNewPreset) {
            return (
                <View style={styles.savePreset}>
                    <View style={styles.saveContainer}>
                        <CText style={styles.saveTitle}>{_.toUpper(t.labels.PBNA_MOBILE_METRICS_SAVE_FILTER)}</CText>
                        <Input
                            inputStyle={styles.presetNameInput}
                            labelStyle={styles.f12Style}
                            value={presetName}
                            label={t.labels.PBNA_MOBILE_NAME_FILTER}
                            inputContainerStyle={styles.inputContainer}
                            containerStyle={styles.noPaddingHorizontal}
                            onChangeText={(e) => {
                                setPresetName(e)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_NAME_CUSTOM_FILTER}
                            placeholderTextColor={'#D3D3D3'}
                            maxLength={customFilterLabelMaxLength}
                            rightIcon={
                                <CText style={styles.inputLengthIndicator}>
                                    {presetName.length}/{customFilterLabelMaxLength}
                                </CText>
                            }
                        />
                        <View style={styles.cancelView}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setPresetName('')
                                    setSaveNewPreset(false)
                                }}
                            >
                                <CText style={styles.cancelTitle}>{_.toUpper(t.labels.PBNA_MOBILE_CANCEL)}</CText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    {
                                        backgroundColor:
                                            presetName === '' || !_.isEmpty(presetName.match(/^\s+$/))
                                                ? baseStyle.color.bgGray
                                                : baseStyle.color.LightBlue
                                    }
                                ]}
                                disabled={presetName === '' || !_.isEmpty(presetName.match(/^\s+$/))}
                                onPress={handleSavePreset}
                            >
                                <CText
                                    style={{
                                        // Dynamic Inline Style
                                        color:
                                            presetName === '' || !_.isEmpty(presetName.match(/^\s+$/))
                                                ? baseStyle.color.cGray
                                                : baseStyle.color.white,
                                        fontSize: baseStyle.fontSize.fs_12,
                                        fontWeight: baseStyle.fontWeight.fw_700
                                    }}
                                >
                                    {_.toUpper(t.labels.PBNA_MOBILE_SAVE)}
                                </CText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
        return (
            <TouchableOpacity
                disabled={!isFilterChange}
                onPress={() => {
                    if (!isEdit && selectedPreset) {
                        if (presetMap[selectedPreset].Name !== renamePreset) {
                            setPresetName(renamePreset)
                        }
                    }
                    setSaveNewPreset(true)
                }}
            >
                <CText
                    style={{
                        // Dynamic Inline Style
                        fontSize: baseStyle.fontSize.fs_12,
                        fontWeight: baseStyle.fontWeight.fw_700,
                        color: isFilterChange ? baseStyle.color.LightBlue : baseStyle.color.cGray
                    }}
                >
                    {_.toUpper(t.labels.PBNA_MOBILE_METRICS_SAVE_FILTER)}
                </CText>
            </TouchableOpacity>
        )
    }

    const renderSuccessMsg = () => {
        if (isEdit) {
            return (
                <CText numberOfLines={3} style={styles.customSave}>
                    {'"' + presetName + '"' + t.labels.PBNA_MOBILE_CUSTOM_FILTER_SAVED}
                </CText>
            )
        }
        return (
            <CText numberOfLines={3} style={styles.customSave}>
                {t.labels.PBNA_MOBILE_NEW_FILTER_SAVED_MSG +
                    '"' +
                    presetName +
                    '"' +
                    t.labels.PBNA_MOBILE_CUSTOM_FILTER_SAVED}
            </CText>
        )
    }

    const renderSuccessModal = () => (
        <View style={styles.successContainer}>
            <View style={styles.successContainer2}>
                <View style={styles.successContainer3}>
                    <Image
                        style={styles.successImg}
                        source={require('../../../../../../assets/image/icon-success.png')}
                    />
                    {renderSuccessMsg()}
                </View>
            </View>
        </View>
    )

    const renderUpdateSuccessModal = () => (
        <View style={styles.successContainer}>
            <View style={styles.successContainer2}>
                <View style={styles.successContainer3}>
                    <Image
                        style={styles.successImg}
                        source={require('../../../../../../assets/image/icon-success.png')}
                    />
                    <CText numberOfLines={3} style={styles.customSave}>
                        {t.labels.PBNA_MOBILE_CHANGES_SAVED}
                    </CText>
                </View>
            </View>
        </View>
    )

    useEffect(() => {
        if (!isEdit) {
            const { filterQuery, filterSelected } = InnovaProdFilterQueries([
                selectedLocationIndex,
                selectedLaunchIndex
            ])
            let customerQuery = ''
            if (selectedCustomer.length > 0) {
                customerQuery =
                    '({StoreProduct:RetailStoreId} IN ' +
                    '(SELECT {RetailStore:Id} FROM {RetailStore}' +
                    ` WHERE {RetailStore:AccountId} IN (${selectedCustomer.map((v) => "'" + v.Id + "'").join(',')})))`
            }
            const query = [filterQuery, customerQuery ? `(${customerQuery})` : customerQuery]
                .filter((v) => v !== '')
                .join(' AND ')
            const newPreset = JSON.stringify({
                sortSelected: sortValue,
                filterSelected: filterSelected,
                selectedKAsValue: selectedKAs,
                selectedCustomersValue: selectedCustomer,
                selectedOTS: otsSelected,
                filterQuery: query
            })
            if (selectedPreset) {
                const presetObj = presetMap[selectedPreset]
                if (newPreset !== presetObj.FilterJSON || renamePreset !== presetObj.Name) {
                    setCheckIsChangePreset(false)
                } else {
                    setCheckIsChangePreset(true)
                }
            }
        }
    }, [sortValue, selectedLocationIndex, selectedLaunchIndex, selectedCustomer, renamePreset])

    const renderBottomButton = () => {
        if (isEdit) {
            return (
                <FormBottomButton
                    onPressCancel={handlePressCancel}
                    onPressSave={handlePressSave}
                    disableCancel={saveNewPreset}
                    disableSave={saveNewPreset}
                    rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_APPLY}
                    leftButtonLabel={t.labels.PBNA_MOBILE_FILTER_RESET}
                    relative
                />
            )
        }
        return (
            <FormBottomButton
                onPressCancel={handleCancelUpdate}
                onPressSave={handleUpdatePreset}
                disableCancel={saveNewPreset}
                disableSave={checkIsChangePreset}
                rightButtonLabel={t.labels.PBNA_MOBILE_SAVE}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                relative
            />
        )
    }
    const renderFilterPageTitle = () => {
        if (isEdit) {
            return <CText style={styles.title}>{t.labels.PBNA_MOBILE_SORT_AND_FILTER}</CText>
        }
        return <CText style={styles.title}>{'EDIT MY CUSTOM FILTER'}</CText>
    }
    return (
        <View style={styles.safeArea}>
            <Modal
                animationType="fade"
                transparent
                visible={showSuccess}
                onRequestClose={() => {
                    setShowSuccess(!showSuccess)
                }}
            >
                {renderSuccessModal()}
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={showUpdateSuccess}
                onRequestClose={() => {
                    setShowUpdateSuccess(!showUpdateSuccess)
                }}
            >
                {renderUpdateSuccessModal()}
            </Modal>
            <View style={styles.header}>
                {renderFilterPageTitle()}
                <TouchableOpacity
                    style={styles.btnBack}
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        navigation.goBack()
                    }}
                >
                    <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <KeyboardAwareScrollView style={styles.keyboard} showsVerticalScrollIndicator={false}>
                {renderPresetSelect()}
                <InnovaProdSortForm cRef={sortRef} sortValue={sortValue} setSortValue={setSortValue} />
                <CText style={styles.buttonGroupTitle}>{t.labels.PBNA_MOBILE_FILTER_BY}</CText>
                <CText style={styles.buttonGroupLabel}>{t.labels.PBNA_MOBILE_LOC_WAR_AVAIL}</CText>
                <View style={styles.btnGroupCon}>
                    <ButtonGroup
                        buttons={[
                            t.labels.PBNA_MOBILE_FILTER_ALL,
                            t.labels.PBNA_MOBILE_FILTER_AVAIL,
                            t.labels.PBNA_MOBILE_FILTER_UNAVAIL
                        ]}
                        selectedIndex={selectedLocationIndex}
                        onPress={(value) => {
                            setSelectedLocationIndex(value)
                        }}
                        textStyle={styles.btnGroupText}
                        innerBorderStyle={styles.innerBorderStyle}
                        buttonStyle={styles.btnStyle}
                        containerStyle={styles.buttonGroupContainer}
                        buttonContainerStyle={styles.btnStyle}
                        selectedButtonStyle={styles.btnSelect}
                    />
                </View>
                <CText style={styles.buttonGroupLabel}>{t.labels.PBNA_MOBILE_PRODUCT_LAUNCH_STATUS}</CText>
                <View style={styles.btnGroupContain}>
                    <ButtonGroup
                        buttons={[
                            t.labels.PBNA_MOBILE_FILTER_ALL,
                            t.labels.PBNA_MOBILE_FILTER_PRE_LAUNCH,
                            t.labels.PBNA_MOBILE_FILTER_LAUNCHED
                        ]}
                        selectedIndex={selectedLaunchIndex}
                        onPress={(value) => {
                            setSelectedLaunchIndex(value)
                        }}
                        textStyle={styles.buttonGroupText}
                        innerBorderStyle={styles.innerBorderStyle}
                        buttonStyle={styles.btnStyle}
                        containerStyle={styles.buttonGroupContainer}
                        buttonContainerStyle={styles.btnStyle}
                        selectedButtonStyle={styles.btnSelect}
                    />
                </View>
                {isPersonaUGMOrSDL() && (
                    <InnovaTerritoryFilter
                        selectTerritories={selectTerritories}
                        onRemoveTes={onRemoveTes}
                        selectRoutes={selectRoutes}
                        onRemoveRoutes={onRemoveRoutes}
                        onPressTerritory={() => {
                            setTypeModalVisible(true)
                        }}
                        onPreRoute={() => {
                            navigation.navigate('ChooseRoutes', {
                                navigation,
                                selectRoutes,
                                setSelectRoutes
                            })
                        }}
                    />
                )}
                <CText style={styles.buttonGroupLabel}>{t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}</CText>
                <View style={styles.checkBoxCon}>
                    {busnSegmentLvlLabelList.map((item, idx) => {
                        return (
                            <CCheckBox
                                key={item}
                                title={item}
                                onPress={() => {
                                    if (busnSegmentSelected.includes(idx)) {
                                        const arr = _.cloneDeep(busnSegmentSelected)
                                        setBusnSegmentSelected(arr.filter((v) => v !== idx))
                                    } else {
                                        const arr = _.cloneDeep(busnSegmentSelected)
                                        arr.push(idx)
                                        setBusnSegmentSelected(arr)
                                    }
                                }}
                                textStyle={styles.checkBoxText}
                                checked={busnSegmentSelected.includes(idx)}
                                containerStyle={[styles.checkBoxContainer, { width: '40%' }]}
                            />
                        )
                    })}
                </View>
                <View style={styles.ostContainer}>
                    {renderTerritoryBtn(t.labels.PBNA_MOBILE_FILTER_KA_OTS_CUST, () => {
                        showKASelector(true)
                    })}
                    <View>
                        {(selectedKAs.length !== 0 || otsSelected) && (
                            <View style={[styles.searchItem]}>
                                <CustomerCell
                                    itemArr={selectedKAs}
                                    handleRemove={onRemoveKAs}
                                    enableHide
                                    setIsKAChange={setIsKAChange}
                                    onRemoveOTS={onRemoveOTS}
                                    otsSelected={otsSelected}
                                    setOtsSelected={setOtsSelected}
                                    isShowMore={isShowKAsMore}
                                    setIsShowMore={setIsShowKAsMore}
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
                                setIsKAChange={setIsKAChange}
                                page={'Metrics'}
                                selectedCustomer={selectedCustomer}
                                setSelectedCustomer={setSelectedCustomer}
                                isShowSelector={isShowSelector}
                                setSelectedKAs={(item) => {
                                    setSelectedKAs(item)
                                }}
                                otsSelected={otsSelected}
                                setOtsSelected={setOtsSelected}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.addCusCon}>
                    {renderRoutesBtn(
                        t.labels.PBNA_MOBILE_FILTER_ADD_CUSTOMERS,
                        t.labels.PBNA_MOBILE_FILTER_ADD_CUSTOMERS,
                        () => {
                            showAccountSelector(true)
                        }
                    )}
                    <View>
                        {selectedCustomer.length > 0 && (
                            <CText style={styles.selectCusText}>
                                {selectedCustomer.length}
                                {' ' + t.labels.PBNA_MOBILE_CUSTOMER_ADDED}
                            </CText>
                        )}
                        {selectedCustomer.length !== 0 && (
                            <View style={[styles.searchItem]}>
                                <CustomerCell
                                    itemArr={selectedCustomer}
                                    handleRemove={onRemoveCustomer}
                                    enableHide
                                    isShowMore={isShowCustomersMore}
                                    setIsShowMore={setIsShowCustomersMore}
                                    controlNum={CommonLabel.NUMBER_EIGHT}
                                />
                            </View>
                        )}
                    </View>
                    <View>
                        {isAccountShowSelector && (
                            <AccountSelector
                                cRef={selectorCUstomerRef}
                                onBack={() => {
                                    showAccountSelector(false)
                                }}
                                selectedCustomers={selectedCustomer}
                                isAccountShowSelector={isAccountShowSelector}
                                setSelectedCustomers={(item) => {
                                    setSelectedCustomer(item)
                                }}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.newViewCon}>{renderSaveNewPreset()}</View>
            </KeyboardAwareScrollView>
            {renderBottomButton()}
            <SubTypeModal
                cancelTitle={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                doneTitle={t.labels.PBNA_MOBILE_SAVE}
                customTitle={t.labels.PBNA_MOBILE_SELECT_TERRITORY}
                customSubTitle={t.labels.PBNA_MOBILE_SELECT_SUBTITLE}
                subTypeArray={territories}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    checkClick(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType()
                }}
                updateVisitSubType={() => {
                    updateVisitSubType()
                }}
            />
        </View>
    )
}

export default InnovaProdFilterSortForm
