/**
 * @description Component to show store operation section.
 * @author Qiulin Deng
 * @date 2021-05-24
 */
import React, { useRef, useImperativeHandle, useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import LeadSegmentHierarchyPicker from '../common/LeadSegmentHierarchyPicker'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import {
    useFilterPriceGroupDataWithSearchText,
    useBusinessSegmentPicklist,
    useFindKAName,
    useRouteLists
} from '../../../../hooks/LeadHooks'
import { t } from '../../../../../common/i18n/t'
import SearchablePicklist from '../common/SearchablePicklist'
import store from '../../../../redux/store/Store'
import { getParentRoute } from '../../../../utils/LeadUtils'
import _ from 'lodash'
import CollapseContainer from '../../../common/CollapseContainer'
import { useKeyAccount } from '../../../../hooks/ChangeOfOwnershipHooks'
import PickerTile from '../common/PickerTile'
import { getParentAccount } from '../../../../utils/ChangeOfOwnershipUtils'
import { useAppSelector } from '../../../../redux/ReduxHooks'
import { updateNewPriceGroupList } from '../../../../redux/reducer/PriceName'
import PriceGroupCell from './PriceGroupCell'

const styles = StyleSheet.create({
    labelStyle: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    },
    fullWidth: {
        width: '100%'
    },
    marginBottom20: {
        marginBottom: 20
    },
    priceCont: {
        flex: 1,
        backgroundColor: 'white'
    },
    collapseTitleContainer: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    backupTitleStyle: {
        fontWeight: '700',
        fontSize: 16
    },
    customerHierarchy: {
        flex: 1,
        marginTop: 10
    },
    marginTop20: {
        marginTop: 20
    },
    paddingH5: {
        paddingHorizontal: '5%'
    },
    pickPadding: {
        paddingHorizontal: 9
    },
    priceCell: {
        flex: 1,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingVertical: 10
    },
    priceSearch: {
        backgroundColor: '#ffffff'
    },
    searchBtnStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3'
    }
})

enum pepsiCoDataSection {
    sectionName = 'pepsico_data',
    RegionApi = 'Region_c__c',
    MarketApi = 'Market_c__c',
    LocationApi = 'Location_c__c'
}

export enum priceCellStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    PRE = 'PRE',
    CMP = 'CMP'
}

const HIDE_KEY_ACCOUNT = false

const PepsiCoDataEdit = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const leadHierarchyRef = useRef(null)
    const dispatch = useDispatch()
    const primaryRef = useRef(null)
    const customerTypeRef = useRef(null)

    const [tempRegion, setTempRegion] = useState('')
    const [tempMarket, setTempMarket] = useState('')
    const [tempLocation, setTempLocation] = useState('')
    const [priceGroupInput, setPriceGroupInput] = useState('')
    const [showBusinessSegment, setBusinessSegment] = useState(false)
    const [showGeoHierarchy, setGeoHierarchy] = useState(false)
    const [showCustomerHierarchy, setCustomerHierarchy] = useState(false)
    const [showPriceGroup, setShowPriceGroup] = useState(false)
    const [priceGroupList, setPriceGroupList] = useState([])

    const regionList = useRouteLists(tempRegion, ['Region'], true)
    const marketList = useRouteLists(
        tempMarket,
        ['Market'],
        true,
        store.getState().leadReducer.negotiateLeadEditReducer.Region_ID_c__c
    )
    const locationList = useRouteLists(
        tempLocation,
        ['Location'],
        true,
        store.getState().leadReducer.negotiateLeadEditReducer.Market_ID_c__c,
        store.getState().leadReducer.negotiateLeadEditReducer.Region_ID_c__c
    )
    const regionRef = useRef(null)
    const marketRef = useRef(null)
    const locationRef = useRef(null)
    const priceGroupRef = useRef(null)
    const keyAccountRef = useRef(null)
    const keyAccountDivisionRef = useRef(null)
    const [tempKeyAccount, setTempKeyAccount] = useState(null)
    const [tempKeyAccountDivision, setTempKeyAccountDivision] = useState(null)
    const keyAccountList = useKeyAccount(tempKeyAccount, ['Key Account'])
    const keyAccountDivisionList = useKeyAccount(
        tempKeyAccountDivision,
        ['Key Account Division'],
        store.getState().leadReducer.negotiateLeadEditReducer.Proposed_Key_Account_c__c
    )
    const locationId = store.getState().leadReducer.negotiateLeadEditReducer.Location_ID_c__c

    const pgList = useAppSelector((state) => state.leadReducer.priceGroupSlice.pgList)
    const forbidAddPg = useAppSelector((state) => state.leadReducer.priceGroupSlice.withoutSellingDP)
    const searchOriginList = useAppSelector((state) => state.leadReducer.priceGroupSlice.searchOriginList)
    const newPgList = useAppSelector((state) => state.leadReducer.priceGroupSlice.newPgList)
    const priceGroupSearchList = useFilterPriceGroupDataWithSearchText(
        searchOriginList,
        priceGroupInput,
        priceGroupList
    )
    const { KAName, KADName } = useFindKAName(l)
    useEffect(() => {
        keyAccountRef?.current?.setValue(KAName)
    }, [KAName])
    useEffect(() => {
        keyAccountDivisionRef?.current?.setValue(KADName)
    }, [KADName])

    const onUpdatePriceGroupDisplayData = (updateList: any[]) => {
        priceGroupRef.current?.reset()
        setPriceGroupList(updateList)
        dispatch && dispatch(updateNewPriceGroupList(updateList))
    }

    useEffect(() => {
        setPriceGroupList(_.size(newPgList) > 0 ? newPgList : [])
    }, [newPgList])

    const resetData = () => {
        const originData = {
            BUSN_SGMNTTN_LVL_1_NM_c__c: l.BUSN_SGMNTTN_LVL_1_NM_c__c,
            BUSN_SGMNTTN_LVL_2_NM_c__c: l.BUSN_SGMNTTN_LVL_2_NM_c__c,
            BUSN_SGMNTTN_LVL_3_NM_c__c: l.BUSN_SGMNTTN_LVL_3_NM_c__c,
            BUSN_SGMNTTN_LVL_4_NM_c__c: l.BUSN_SGMNTTN_LVL_4_NM_c__c,
            BUSN_SGMNTTN_LVL_1_CDV_c__c: l.BUSN_SGMNTTN_LVL_1_CDV_c__c,
            BUSN_SGMNTTN_LVL_2_CDV_c__c: l.BUSN_SGMNTTN_LVL_2_CDV_c__c,
            BUSN_SGMNTTN_LVL_3_CDV_c__c: l.BUSN_SGMNTTN_LVL_3_CDV_c__c,
            BUSN_SGMNTTN_LVL_4_CDV_c__c: l.BUSN_SGMNTTN_LVL_4_CDV_c__c,
            Region_c__c: l.Region_c__c,
            Market_c__c: l.Market_c__c,
            Location_c__c: l.Location_c__c,
            Location_ID_c__c: l.Location_ID_c__c,
            Ethnicity_c__c: l.Ethnicity_c__c,
            Primary_Language_c__c: l.Primary_Language_c__c,
            Service_Location_c__c: l.Service_Location_c__c,
            Customer_Type_c__c: l.Customer_Type_c__c,
            pepsiCoDataEditCount: 0,
            Proposed_Key_Account_Division_Name: l.Proposed_Key_Account_Division_Name,
            Proposed_Key_Account_Name: l.Proposed_Key_Account_Name,
            Proposed_Key_Account_Division_c__c: l.Proposed_Key_Account_Division_c__c,
            Proposed_Key_Account_c__c: l.Proposed_Key_Account_c__c
        }
        dispatch(updateTempLeadAction(originData))
        primaryRef.current?.reset()
        customerTypeRef.current?.reset()
        leadHierarchyRef.current?.reset()
        regionRef.current?.reset()
        marketRef.current?.reset()
        locationRef.current?.reset()
        keyAccountDivisionRef?.current?.reset()
        keyAccountRef?.current?.reset()
        onUpdatePriceGroupDisplayData(pgList)
    }

    useImperativeHandle(cRef, () => ({
        resetData: () => {
            resetData()
        }
    }))

    const onSelectPriceGroup = (value: any) => {
        dispatch(updateTempLeadAction({}, pepsiCoDataSection.sectionName))
        const resultV = _.cloneDeep(value)
        const updatePgList = [...priceGroupList, resultV]
        if (_.size(updatePgList) > 0) {
            onUpdatePriceGroupDisplayData(updatePgList)
        }
    }
    const onRemovePriceGroup = (item: any, index: number) => {
        dispatch(updateTempLeadAction({}, pepsiCoDataSection.sectionName))
        const deletedList = _.cloneDeep(priceGroupList)
        deletedList.splice(index, 1)
        onUpdatePriceGroupDisplayData(deletedList)
    }

    const { channelList, segmentList, subSegmentList, segmentOption } = useBusinessSegmentPicklist()
    return (
        <View style={styles.fullWidth}>
            <CollapseContainer
                showContent={showBusinessSegment}
                setShowContent={setBusinessSegment}
                title={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                containerStyle={[styles.collapseTitleContainer, styles.paddingH5]}
                titleStyle={styles.backupTitleStyle}
                noTopLine
            >
                <LeadSegmentHierarchyPicker
                    labels={{
                        channelLabel: `${t.labels.PBNA_MOBILE_BUSINESS_CHANNEL} *`,
                        segmentLabel: `${t.labels.PBNA_MOBILE_BUSINESS_SEGMENT} *`,
                        subSegmentLabel: `${t.labels.PBNA_MOBILE_BUSINESS_SUB_SEGMENT} *`
                    }}
                    lstChannel={channelList}
                    mapSegment={segmentList}
                    mapSubSegment={subSegmentList}
                    cRef={leadHierarchyRef}
                    noPaddingHorizontal
                    containerStyle={[styles.marginBottom20, styles.paddingH5]}
                    labelStyle={styles.labelStyle}
                    defValue={{
                        channel: l.BUSN_SGMNTTN_LVL_3_NM_c__c,
                        segment: l.BUSN_SGMNTTN_LVL_2_NM_c__c,
                        subsegment: l.BUSN_SGMNTTN_LVL_1_NM_c__c
                    }}
                    onChangeValue={(item) => {
                        if (item.channel === '') {
                            item.segment = ''
                            item.subSegment = ''
                        }
                        if (item.segment === '') {
                            item.subSegment = ''
                        }
                        dispatch(
                            updateTempLeadAction(
                                {
                                    BUSN_SGMNTTN_LVL_3_NM_c__c: item.channel,
                                    BUSN_SGMNTTN_LVL_2_NM_c__c: item.segment,
                                    BUSN_SGMNTTN_LVL_1_NM_c__c: item.subSegment,
                                    BUSN_SGMNTTN_LVL_3_CDV_c__c:
                                        _.findKey(segmentOption?.CHANNEL_CODE, (v) => {
                                            return v === item.channel
                                        }) || '',
                                    BUSN_SGMNTTN_LVL_2_CDV_c__c:
                                        _.findKey(segmentOption?.SEGMENT_CODE, (v) => {
                                            return v === item.segment
                                        }) || '',
                                    BUSN_SGMNTTN_LVL_1_CDV_c__c:
                                        _.findKey(segmentOption?.SUB_SEGMENT_CODE, (v) => {
                                            return v === item.subSegment
                                        }) || ''
                                },
                                pepsiCoDataSection.sectionName
                            )
                        )
                    }}
                />
            </CollapseContainer>
            <CollapseContainer
                showContent={showGeoHierarchy}
                setShowContent={setGeoHierarchy}
                title={t.labels.PBNA_MOBILE_GEO_HIERARCHY}
                containerStyle={[styles.collapseTitleContainer, styles.paddingH5]}
                titleStyle={styles.backupTitleStyle}
                noTopLine
            >
                <View style={[styles.paddingH5]}>
                    <SearchablePicklist
                        cRef={regionRef}
                        label={t.labels.PBNA_MOBILE_REGION_NAME}
                        data={regionList}
                        showValue={(v) => {
                            return v?.SLS_UNIT_NM__c
                        }}
                        defValue={l.Region_c__c}
                        onSearchChange={(v) => setTempRegion(v)}
                        onApply={(v) => {
                            dispatch(
                                updateTempLeadAction(
                                    {
                                        Region_c__c: v.SLS_UNIT_NM__c,
                                        Region_ID_c__c: v.SLS_UNIT_ID__c,
                                        Market_c__c: null,
                                        Market_ID_c__c: null,
                                        Location_c__c: null,
                                        Location_ID_c__c: null
                                    },
                                    pepsiCoDataSection.sectionName
                                )
                            )
                            locationRef.current?.resetNull()
                            marketRef.current?.resetNull()
                            onUpdatePriceGroupDisplayData([])
                        }}
                    />
                    <SearchablePicklist
                        cRef={marketRef}
                        label={t.labels.PBNA_MOBILE_MARKET_NAME}
                        data={marketList}
                        showValue={(v) => {
                            return v?.SLS_UNIT_NM__c
                        }}
                        defValue={l.Market_c__c}
                        onSearchChange={(v) => setTempMarket(v)}
                        onApply={async (v) => {
                            const parentNode = await getParentRoute(v.SLS_UNIT_ID__c, 'Market')
                            dispatch(
                                updateTempLeadAction(
                                    {
                                        Market_c__c: v.SLS_UNIT_NM__c,
                                        Market_ID_c__c: v.SLS_UNIT_ID__c,
                                        Region_c__c: parentNode.Parent_Node__r?.SLS_UNIT_NM__c,
                                        Region_ID_c__c: parentNode.Parent_Node__r?.SLS_UNIT_ID__c,
                                        Location_c__c: null,
                                        Location_ID_c__c: null
                                    },
                                    pepsiCoDataSection.sectionName
                                )
                            )
                            regionRef.current?.setValue(parentNode.Parent_Node__r?.SLS_UNIT_NM__c)
                            locationRef.current?.resetNull()
                            onUpdatePriceGroupDisplayData([])
                        }}
                    />
                    <SearchablePicklist
                        cRef={locationRef}
                        label={`${t.labels.PBNA_MOBILE_LOCATION_NAME} *`}
                        data={locationList}
                        showValue={(v) => {
                            return v?.SLS_UNIT_NM__c
                        }}
                        defValue={l.Location_c__c}
                        onSearchChange={(v) => setTempLocation(v)}
                        onApply={async (v) => {
                            const parentNode = await getParentRoute(v.SLS_UNIT_ID__c, 'Location')
                            dispatch(
                                updateTempLeadAction(
                                    {
                                        Location_c__c: v.SLS_UNIT_NM__c,
                                        Location_ID_c__c: v.SLS_UNIT_ID__c,
                                        Market_c__c: parentNode.Parent_Node__r?.SLS_UNIT_NM__c,
                                        Market_ID_c__c: parentNode.Parent_Node__r?.SLS_UNIT_ID__c,
                                        Region_c__c: parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c,
                                        Region_ID_c__c: parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_ID__c
                                    },
                                    pepsiCoDataSection.sectionName
                                )
                            )
                            marketRef.current?.setValue(parentNode.Parent_Node__r?.SLS_UNIT_NM__c)
                            regionRef.current?.setValue(parentNode.Parent_Node__r?.Parent_Node__r?.SLS_UNIT_NM__c)
                            onUpdatePriceGroupDisplayData([])
                        }}
                    />
                </View>
            </CollapseContainer>
            {/* 12191266 Hide proposed key account */}
            {HIDE_KEY_ACCOUNT && (
                <CollapseContainer
                    showContent={showCustomerHierarchy}
                    setShowContent={setCustomerHierarchy}
                    title={t.labels.BNA_MOBILE_CUSTOMER_HIERARCHY}
                    containerStyle={[styles.collapseTitleContainer, styles.paddingH5]}
                    titleStyle={styles.backupTitleStyle}
                    noTopLine
                >
                    <View style={[styles.customerHierarchy, styles.paddingH5]}>
                        <SearchablePicklist
                            cRef={keyAccountRef}
                            noMarginRight
                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                            labelStyle={[styles.labelStyle, { marginTop: -10 }]}
                            label={`${t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT}`}
                            data={keyAccountList}
                            showValue={(v) => {
                                return v?.Name
                            }}
                            defValue={KAName}
                            onSearchChange={(v) => setTempKeyAccount(v)}
                            onApply={(v) => {
                                dispatch(
                                    updateTempLeadAction(
                                        {
                                            Proposed_Key_Account_c__c: v.Id,
                                            Proposed_Key_Account_Name: v.Name,
                                            Proposed_Key_Account_Division_c__c: null,
                                            Proposed_Key_Account_Division_Name: null
                                        },
                                        pepsiCoDataSection.sectionName
                                    )
                                )

                                keyAccountDivisionRef?.current?.resetNull()
                            }}
                        />
                        <SearchablePicklist
                            noMarginRight
                            cRef={keyAccountDivisionRef}
                            placeholder={t.labels.PBNA_MOBILE_SELECT}
                            labelStyle={styles.labelStyle}
                            label={`${t.labels.PBNA_MOBILE_PROPOSED_KEY_ACCOUNT_DIVISION}`}
                            data={keyAccountDivisionList}
                            showValue={(v) => {
                                return v?.Name
                            }}
                            defValue={KADName}
                            onSearchChange={(v) => setTempKeyAccountDivision(v)}
                            onApply={async (v) => {
                                const parentNode = await getParentAccount(v.Id)

                                dispatch(
                                    updateTempLeadAction(
                                        {
                                            Proposed_Key_Account_c__c: parentNode?.Parent?.Id,
                                            Proposed_Key_Account_Name: parentNode?.Parent?.Name,
                                            Proposed_Key_Account_Division_c__c: v.Id,
                                            Proposed_Key_Account_Division_Name: v.Name
                                        },
                                        pepsiCoDataSection.sectionName
                                    )
                                )

                                keyAccountRef.current?.setValue(parentNode?.Parent?.Name)
                            }}
                        />
                    </View>
                </CollapseContainer>
            )}
            <CollapseContainer
                showContent={showPriceGroup}
                setShowContent={setShowPriceGroup}
                title={t.labels.BNA_MOBILE_PRICE_GROUPS}
                containerStyle={[styles.collapseTitleContainer, styles.paddingH5]}
                titleStyle={styles.backupTitleStyle}
                noTopLine
            >
                <View style={[styles.priceCont, styles.paddingH5]}>
                    <SearchablePicklist
                        cRef={priceGroupRef}
                        disabled={forbidAddPg || !locationId}
                        containerStyle={_.size(priceGroupList) > 0 && styles.priceSearch}
                        searchIcon
                        rightTriangle={false}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH}
                        label={t.labels.PBNA_MOBILE_PROPOSED_PRICE_GROUP}
                        data={priceGroupSearchList}
                        searchBtnStyle={styles.searchBtnStyle}
                        showValue={(v) => {
                            return v?.Target_Name__c || ''
                        }}
                        onSearchChange={(v) => setPriceGroupInput(v)}
                        onApply={onSelectPriceGroup}
                    />
                    {priceGroupList.map((item: any, index: number) => {
                        return (
                            <PriceGroupCell
                                key={item?.Id}
                                item={item}
                                index={index}
                                hasBottomLine={index !== _.size(priceGroupList) - 1}
                                onRemove={onRemovePriceGroup}
                                showSubmitBtn={
                                    item?.Status__c !== priceCellStatus.CMP && item?.Status__c !== priceCellStatus.PRE
                                }
                            />
                        )
                    })}
                </View>
            </CollapseContainer>
            <PickerTile
                data={[
                    t.labels.PBNA_MOBILE_SELECT_PRIMARY_LANGUAGE,
                    t.labels.PBNA_MOBILE_ENGLISH,
                    t.labels.PBNA_MOBILE_SPANISH,
                    t.labels.PBNA_MOBILE_FRENCH,
                    t.labels.PBNA_MOBILE_KOREAN,
                    t.labels.PBNA_MOBILE_GERMAN,
                    t.labels.PBNA_MOBILE_ITALIAN
                ]}
                label={t.labels.PBNA_MOBILE_PRIMARY_LANGUAGE}
                title={t.labels.PBNA_MOBILE_PRIMARY_LANGUAGE.toUpperCase()}
                disabled={false}
                defValue={l.Primary_Language_c__c}
                placeholder={t.labels.PBNA_MOBILE_SELECT}
                required={false}
                containerStyle={[styles.marginBottom20, styles.marginTop20, styles.paddingH5]}
                noPaddingHorizontal
                labelStyle={styles.labelStyle}
                pickContainerStyle={styles.pickPadding}
                cRef={primaryRef}
                onChange={(value) => {
                    dispatch(updateTempLeadAction({ Primary_Language_c__c: value }, pepsiCoDataSection.sectionName))
                }}
            />
            <PickerTile
                data={[t.labels.PBNA_MOBILE_SELECT_CUSTOMER_TYPE, 'Product', 'FOBO Bottler', 'FSV']}
                label={t.labels.PBNA_MOBILE_CUSTOMER_TYPE}
                title={t.labels.PBNA_MOBILE_CUSTOMER_TYPE.toUpperCase()}
                disabled={false}
                defValue={l.Customer_Type_c__c}
                placeholder={t.labels.PBNA_MOBILE_SELECT}
                required={false}
                noPaddingHorizontal
                labelStyle={styles.labelStyle}
                containerStyle={[styles.paddingH5]}
                pickContainerStyle={styles.pickPadding}
                cRef={customerTypeRef}
                onChange={(value) => {
                    dispatch(updateTempLeadAction({ Customer_Type_c__c: value }, pepsiCoDataSection.sectionName))
                }}
            />
        </View>
    )
}

export default PepsiCoDataEdit
