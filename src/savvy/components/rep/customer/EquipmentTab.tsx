/**
 * @description Screen to show Customer Equipment Detail.
 * @author Pawn
 * @date 2021-10-28
 */
import React, { Dispatch, FC, SetStateAction, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import SelectTab from '../../common/SelectTab'
import CustomerEquipmentList from './CustomerEquipmentList'
import CustomerEquipmentRequestList from './CustomerEquipmentRequestList'
import CustomerEquipmentAssetDetail from './CustomerEquipmentAssetDetail'
import InstallRequestModal from './equipment-tab/InstallRequestModal'
import InProgressEquipmentList from './equipment-tab/InProgressEquipmentList'
import { useInProgressEquipmentList, useEquipmentTypeCodeDesc } from '../../../hooks/EquipmentHooks'
import ServiceBadge from './equipment-tab/ServiceBadge'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import CCheckBox from '../../../../common/components/CCheckBox'
import ServiceRequestModal from './equipment-tab/ServiceRequestModal'
import { t } from '../../../../common/i18n/t'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { isPersonaCRMBusinessAdmin } from '../../../../common/enums/Persona'
import { formatString } from '../../../utils/CommonUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { SearchBar } from 'react-native-elements'

interface CustomerEquipmentDetailProps {
    showShadow?: boolean
    navigation: any
    equipmentList: any
    accountId: any
    isLoading?: boolean
    retailStore: any
    requestList: any
    onSave: any
    cRef: any
    selectEquipmentCount: number
    setSelectEquipmentCount: (selectEquipmentCount: number) => void
    activeServiceTypes: Array<any>
    setActiveServiceTypes: (activeServiceTypes: Array<any>) => void
    readonly: boolean
    assetSearchValue: string
    setAssetSearchValue: Dispatch<SetStateAction<string>>
    isEquipmentListLoading: boolean
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EFF3F6',
        justifyContent: 'center'
    },
    equipmentDetailContainer: {
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    segment: {
        marginVertical: 20
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginTop: 15,
        paddingVertical: 15,
        paddingLeft: 15,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white'
    },
    searchBarInnerContainer: {
        width: '90%',
        height: 36,
        borderRadius: 20,
        backgroundColor: 'white'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    imgStyle: {
        width: 50,
        height: 50,
        marginBottom: 20
    },
    textStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    scrollViewContainer: {
        flex: 1,
        height: 80,
        paddingHorizontal: 22,
        backgroundColor: 'white',
        paddingTop: 20
    },
    marginRight_10: { marginRight: 10 },
    assetContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 22,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    assetContainer2: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 40
    },
    fontWeight_500: { fontWeight: '500' },
    marginRight_15: {
        marginRight: -15
    },
    marginRight_15PX: {
        marginRight: 15
    },
    padding: {
        height: 100,
        width: '100%'
    },
    serviceBadgePadding: {
        width: 30
    }
})

const PICKUP_MOVE_MAX_SELECTED_NUM = 99
const EXCHANGE_MAX_SELECTED_NUM = 48

const EquipmentTab: FC<CustomerEquipmentDetailProps> = (props: CustomerEquipmentDetailProps) => {
    const {
        navigation,
        accountId,
        equipmentList,
        retailStore,
        requestList,
        onSave,
        cRef,
        selectEquipmentCount,
        setSelectEquipmentCount,
        activeServiceTypes,
        setActiveServiceTypes,
        readonly,
        assetSearchValue,
        setAssetSearchValue,
        isEquipmentListLoading
    } = props
    const [activeTab, setActiveTab] = useState(0)
    const [tabRefreshTimes, setTabRefreshTimes] = useState(0)
    const inProgressEquipmentList = useInProgressEquipmentList(accountId, '', tabRefreshTimes, equipmentList)
    const [currentAsset, setCurrentAsset] = useState({
        Id: null,
        Name: null,
        AccountId: null,
        ident_asset_num__c: null,
        serv_cntrt_nm__c: null,
        equip_site_desc__c: null,
        equip_inst_dte__c: null,
        equip_last_svc_dte__c: null,
        equip_type_desc__c: null,
        equip_styp_desc__c: null,
        SerialNumber: null,
        equip_ownr_nm__c: null,
        net_book_val_amt__c: null,
        Sls_plan_desc__c: null,
        mnth_pymt_amt__c: null
    })
    const [isDetailPage, setDetailPage] = useState(false)
    const installRequestRef = useRef(null)
    const serviceRequestRef = useRef(null)
    const [requestId, setRequestId] = useState(null)
    const [selectAllEquipments, setSelectAllEquipments] = useState(false)
    const [selectEquipmentList, setSelectEquipmentList] = useState([])
    const [serviceRequestModalVisible, setServiceRequestModalVisible] = useState(false)
    const [installRequestModalVisible, setInstallRequestModalVisible] = useState(false)
    const [assetSearchTempValue, setAssetSearchTempValue] = useState('')
    const equipmentTypeCodeDesc = useEquipmentTypeCodeDesc()
    const [maxSelectedNum, setMaxSelectedNum] = useState(0)

    useEffect(() => {
        if (activeServiceTypes[0].serviceActive || activeServiceTypes[1].serviceActive) {
            setMaxSelectedNum(PICKUP_MOVE_MAX_SELECTED_NUM)
        } else if (activeServiceTypes[3].serviceActive) {
            setMaxSelectedNum(EXCHANGE_MAX_SELECTED_NUM)
        } else {
            setMaxSelectedNum(0)
        }
    }, [activeServiceTypes])

    const handleClickServiceBadge = (serviceType) => {
        const serviceIndex = serviceType.serviceIndex
        const temporaryActiveServiceTypes = _.cloneDeep(activeServiceTypes)
        temporaryActiveServiceTypes.forEach((tempServiceType) => {
            tempServiceType.serviceActive = false
        })
        temporaryActiveServiceTypes[serviceIndex].serviceActive = !serviceType.serviceActive
        setActiveServiceTypes(temporaryActiveServiceTypes)
    }
    const handleSelectEquipment = (equipment) => {
        const tempList = _.cloneDeep(selectEquipmentList)
        let count = 0
        tempList.forEach((item) => {
            if (activeServiceTypes[2].serviceActive) {
                item.selected = false
            }
            if (equipment.Id === item.Id) {
                item.selected = !item.selected
            }
            if (item.selected) {
                count++
            }
        })
        setSelectEquipmentCount(count)
        setSelectAllEquipments(count >= maxSelectedNum)
        setSelectEquipmentList(tempList)
    }
    const calculateSelectedNumber = (item: any) => {
        if (item.status__c === 'CANCELLED' || item.status__c === 'CLOSED' || _.isEmpty(item.RequestId)) {
            if (retailStore['Account.PEPSI_COLA_NATNL_ACCT__c'] === '1') {
                if (
                    activeServiceTypes[0].serviceActive ||
                    activeServiceTypes[1].serviceActive ||
                    activeServiceTypes[3].serviceActive
                ) {
                    if (
                        item.equip_ownr_cde__c === 'PEP' &&
                        (item.equip_type_cde__c === 'COO' || item.equip_type_cde__c === 'VEN')
                    ) {
                        return true
                    }
                }
            } else {
                return true
            }
        }
        return false
    }
    const calculateNumbersCanSelected = () => {
        const calculateNumberList = _.cloneDeep(equipmentList)
        let count = 0
        calculateNumberList.forEach((item: any) => {
            if (calculateSelectedNumber(item)) {
                count++
            }
        })
        return count
    }

    const handleSelectAllEquipments = () => {
        const tempList = _.cloneDeep(equipmentList)
        let count = 0
        for (const item of tempList) {
            if (item.status__c === 'CANCELLED' || item.status__c === 'CLOSED' || _.isEmpty(item.RequestId)) {
                if (retailStore['Account.PEPSI_COLA_NATNL_ACCT__c'] === '1') {
                    if (
                        activeServiceTypes[0].serviceActive ||
                        activeServiceTypes[1].serviceActive ||
                        activeServiceTypes[3].serviceActive
                    ) {
                        if (
                            item.equip_ownr_cde__c === 'PEP' &&
                            (item.equip_type_cde__c === 'COO' || item.equip_type_cde__c === 'VEN')
                        ) {
                            item.selected = !selectAllEquipments
                        }
                    }
                } else {
                    item.selected = !selectAllEquipments
                }
            }
            if (item.selected) {
                count++
            }
            if (count >= maxSelectedNum) {
                global.$globalModal.openModal(
                    <View style={commonStyle.alignItemsCenter}>
                        <Image style={styles.imgStyle} source={ImageSrc.ICON_WARNING} />
                        <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_MAXIMUM_NUMBER_OF_SELECTIONS}</CText>
                        <CText style={styles.textStyle}>
                            {formatString(t.labels.PBNA_MOBILE_ONLY_FIRST_OF_SELECTED, [
                                maxSelectedNum.toString(),
                                calculateNumbersCanSelected().toString()
                            ])}
                        </CText>
                    </View>
                )
                setTimeout(() => {
                    global.$globalModal.closeModal()
                }, 1000)
                break
            }
        }
        if (!selectAllEquipments) {
            setSelectEquipmentCount(count)
        } else {
            setSelectEquipmentCount(0)
        }
        setSelectEquipmentList(tempList)
        setSelectAllEquipments(!selectAllEquipments)
    }

    const resetSelections = () => {
        setSelectEquipmentCount(0)
        const tempList = _.cloneDeep(equipmentList)
        tempList.forEach((item) => {
            item.selected = false
        })
        setSelectAllEquipments(false)
        const tempServiceTypeList = _.cloneDeep(activeServiceTypes)
        tempServiceTypeList.forEach((item) => {
            item.serviceActive = false
        })
        setActiveServiceTypes(tempServiceTypeList)
        setTimeout(() => {
            setSelectEquipmentList(tempList)
        }, 0)
    }

    useEffect(() => {
        if (selectEquipmentCount === 0) {
            const tempList = _.cloneDeep(equipmentList)
            tempList.forEach((item) => {
                item.selected = false
            })
            setTimeout(() => {
                setSelectEquipmentList(tempList)
            }, 0)
        }
    }, [equipmentList])

    useEffect(() => {
        const tempEquipmentList = _.cloneDeep(selectEquipmentList)
        tempEquipmentList.forEach((item) => {
            item.selected = false
        })
        setSelectAllEquipments(false)
        setSelectEquipmentList(tempEquipmentList)
        setSelectEquipmentCount(0)
    }, [activeServiceTypes])

    useImperativeHandle(cRef, () => ({
        openInstallRequestModal: () => {
            setInstallRequestModalVisible(true)
        },
        openServiceRequestModal: () => {
            // serviceRequestRef.current?.open()
            setServiceRequestModalVisible(true)
        }
    }))

    const openRequestDetail = (item) => {
        setRequestId(item.Id)
        if (item.equip_move_type_cde__c === 'INS') {
            setInstallRequestModalVisible(true)
        } else {
            let index
            switch (item.equip_move_type_cde__c) {
                case 'ONS':
                    index = 0
                    break
                case 'PIC':
                    index = 1
                    break
                case 'Repair':
                    index = 2
                    break
                case 'EXI':
                case 'EXP':
                    index = 3
                    break
                default:
                    return
            }
            const tempActiveServiceTypes = _.cloneDeep(activeServiceTypes)
            tempActiveServiceTypes[index].serviceActive = true
            setActiveServiceTypes(tempActiveServiceTypes)
            setServiceRequestModalVisible(true)
        }
    }

    const judgeShowSelectAll = () => {
        const judgeShowSelectAllList = _.cloneDeep(equipmentList)
        let count = 0
        judgeShowSelectAllList.forEach((item: any) => {
            if (calculateSelectedNumber(item)) {
                count++
            }
        })
        return count > 0
    }

    return (
        <View style={isDetailPage ? styles.equipmentDetailContainer : styles.container}>
            {isDetailPage ? (
                <View>
                    <CustomerEquipmentAssetDetail
                        setDetailPage={setDetailPage}
                        asset={currentAsset}
                        navigation={navigation}
                        onClick={(v) => {
                            const request = {
                                // For Repair
                                Id: v.request_id__c || v.Id,
                                equip_move_type_cde__c: v.equip_move_type_cde__c
                            }
                            openRequestDetail(request)
                        }}
                    />
                </View>
            ) : (
                <View>
                    <View style={styles.segment}>
                        <SelectTab
                            listData={[{ name: t.labels.PBNA_MOBILE_ASSETS }, { name: t.labels.PBNA_MOBILE_SERVICE }]}
                            changeTab={(v) => {
                                setActiveTab(v)
                            }}
                            activeTab={activeTab}
                        />
                    </View>
                    {activeTab === 1 && (
                        <CustomerEquipmentRequestList
                            draftList={requestList}
                            onClick={(v) => {
                                openRequestDetail(v)
                            }}
                            readonly={isPersonaCRMBusinessAdmin() || retailStore['Account.change_initiated__c'] === '1'}
                            onSave={onSave}
                            setTabRefreshTimes={setTabRefreshTimes}
                        />
                    )}
                    {activeTab === 0 && (
                        <InProgressEquipmentList
                            inProgressEquipmentList={inProgressEquipmentList}
                            onClick={(item) => {
                                const request = {
                                    Id: item.parent_request_record__c,
                                    equip_move_type_cde__c: item.equip_move_type_cde__c
                                }
                                openRequestDetail(request)
                            }}
                            readonly={isPersonaCRMBusinessAdmin() || retailStore['Account.change_initiated__c'] === '1'}
                            equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                        />
                    )}
                    {activeTab === 0 &&
                        (equipmentList.length > 0 ||
                            (equipmentList.length === 0 && assetSearchValue.length > 0) ||
                            isEquipmentListLoading) && (
                            <View style={styles.searchBarContainer}>
                                <SearchBar
                                    platform={'ios'}
                                    placeholder={t.labels.PBNA_MOBILE_SEARCH_ASSETS}
                                    allowFontScaling={false}
                                    showCancel={false}
                                    cancelButtonTitle={''}
                                    value={assetSearchTempValue}
                                    containerStyle={styles.searchBarInnerContainer}
                                    inputContainerStyle={styles.searchBarInputContainer}
                                    inputStyle={styles.searchInputContainer}
                                    // @ts-ignore
                                    onChangeText={(v) => {
                                        setAssetSearchTempValue(v)
                                    }}
                                    onBlur={() => {
                                        setAssetSearchValue(assetSearchTempValue)
                                    }}
                                    onClear={() => {
                                        setAssetSearchTempValue('')
                                        setAssetSearchValue('')
                                    }}
                                    cancelButtonProps={{}}
                                    lightTheme
                                    round
                                />
                                {isEquipmentListLoading && <ActivityIndicator />}
                            </View>
                        )}
                    {activeTab === 0 && equipmentList.length > 0 && (
                        <ScrollView
                            style={styles.scrollViewContainer}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {activeServiceTypes.map((serviceType) => {
                                const enable = !readonly && retailStore['Account.change_initiated__c'] !== '1'
                                return (
                                    <TouchableOpacity
                                        key={serviceType.serviceIndex}
                                        onPress={() => enable && handleClickServiceBadge(serviceType)}
                                        style={styles.marginRight_15PX}
                                    >
                                        <ServiceBadge serviceType={serviceType} />
                                    </TouchableOpacity>
                                )
                            })}
                            <View style={styles.serviceBadgePadding} />
                        </ScrollView>
                    )}
                    {activeTab === 0 &&
                        equipmentList.length > 0 &&
                        (activeServiceTypes[0].serviceActive ||
                            activeServiceTypes[1].serviceActive ||
                            activeServiceTypes[2].serviceActive ||
                            activeServiceTypes[3].serviceActive) && (
                            <View style={styles.assetContainer}>
                                <View style={styles.assetContainer2}>
                                    <CText>
                                        {selectEquipmentCount}&nbsp;{t.labels.PBNA_MOBILE_ASSETS_TO}&nbsp;
                                        {
                                            activeServiceTypes.find((serviceType) => serviceType.serviceActive)
                                                .serviceType
                                        }
                                    </CText>
                                </View>
                                {!activeServiceTypes[2].serviceActive && judgeShowSelectAll() && (
                                    <View style={styles.selectContainer}>
                                        <CText style={styles.fontWeight_500}>{t.labels.PBNA_MOBILE_SELECT_ALL}</CText>
                                        <View style={styles.marginRight_15}>
                                            <CCheckBox
                                                checked={selectAllEquipments}
                                                onPress={handleSelectAllEquipments}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    {activeTab === 0 && (
                        <CustomerEquipmentList
                            setCurrentAsset={setCurrentAsset}
                            isLoading={props.isLoading}
                            equipmentList={selectEquipmentList}
                            navigation={navigation}
                            accountId={accountId}
                            equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                            setAssetDetail={setDetailPage}
                            setSelected={handleSelectEquipment}
                            activeServiceTypes={activeServiceTypes}
                            pepsiColaNationalAccount={retailStore['Account.PEPSI_COLA_NATNL_ACCT__c']}
                            selectAllEquipments={selectAllEquipments}
                        />
                    )}
                    <View style={styles.padding} />
                </View>
            )}
            {installRequestModalVisible && (
                <InstallRequestModal
                    cRef={installRequestRef}
                    accountId={accountId}
                    customer={retailStore}
                    id={requestId}
                    onSave={onSave}
                    onBack={() => {
                        setTimeout(() => {
                            setRequestId(null)
                        }, 0)
                    }}
                    setTabRefreshTimes={setTabRefreshTimes}
                    equipmentList={equipmentList}
                    equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                    visible={installRequestModalVisible}
                    setVisible={setInstallRequestModalVisible}
                    type={'RetailStore'}
                    l={''}
                    leadId={''}
                    readonly={isPersonaCRMBusinessAdmin() || retailStore['Account.change_initiated__c'] === '1'}
                />
            )}
            {serviceRequestModalVisible && (
                <ServiceRequestModal
                    cRef={serviceRequestRef}
                    accountId={accountId}
                    customer={retailStore}
                    id={requestId}
                    equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                    serviceType={activeServiceTypes.find((serviceType) => serviceType.serviceActive)?.serviceType}
                    selectEquipmentList={selectEquipmentList}
                    resetSelections={resetSelections}
                    setTabRefreshTimes={setTabRefreshTimes}
                    onSave={onSave}
                    onBack={() => {
                        setTimeout(() => {
                            setRequestId(null)
                        }, 0)
                    }}
                    equipmentList={equipmentList}
                    visible={serviceRequestModalVisible}
                    setVisible={setServiceRequestModalVisible}
                    readonly={isPersonaCRMBusinessAdmin() || retailStore['Account.change_initiated__c'] === '1'}
                />
            )}
        </View>
    )
}

export default EquipmentTab
