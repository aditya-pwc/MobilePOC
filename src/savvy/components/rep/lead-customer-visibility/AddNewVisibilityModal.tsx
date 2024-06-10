/* eslint-disable camelcase */
/**
 * @description A modal for add new lead and customer visibility
 * @author Sheng Huang
 * @date 2022/5/26
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import SearchablePicklist from '../lead/common/SearchablePicklist'
import { t } from '../../../../common/i18n/t'
import CCheckBox from '../../../../common/components/CCheckBox'
import { useBusinessSegmentPicklist, useRouteLists } from '../../../hooks/LeadHooks'
import _ from 'lodash'
import { createWiringUser, getWiringDefinition, getWiringUser, updateWiringUser } from '../../../hooks/WiringHooks'
import { Log } from '../../../../common/enums/Log'
import { CommonParam } from '../../../../common/CommonParam'
import GlobalModal from '../../../../common/components/GlobalModal'
import { useKeyAccount } from '../../../hooks/ChangeOfOwnershipHooks'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface AddNewVisibilityModalProps {
    cRef?: any
    onSuccess?: (status: 'create' | 'exist') => Promise<void>
    onFail?: () => void
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    header: {
        ...commonStyle.alignCenter,
        position: 'relative',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        marginHorizontal: '5%'
    },
    title: {
        fontWeight: baseStyle.fontWeight.fw_500,
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontFamily: 'Gotham-Bold'
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    psrTitle: {
        color: '#D3D3D3'
    },
    visibilityCont: {
        alignItems: 'center',
        marginVertical: 20
    },
    searchableCont: {
        marginHorizontal: '5%',
        marginTop: 20
    },
    pickTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    pickPlaceholder: {
        color: baseStyle.color.liteGrey
    },
    definitionText: {
        color: '#565656',
        fontWeight: '400',
        marginVertical: 20,
        fontSize: 12,
        lineHeight: 18
    },
    checkBoxCont: {
        backgroundColor: 'white',
        paddingLeft: -20,
        marginLeft: 0
    },
    leftButtonTitle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        fontSize: 12,
        color: '#6C0CC3'
    },
    rightButtonTitle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        fontSize: 12,
        color: '#FFFFFF'
    },
    marginBottom_30: { marginBottom: 30 }
})

interface Wiring {
    SLS_UNIT_LVL__c: string
    SLS_UNIT_CODE__c: string
    SLS_UNIT_NODE__c: string
    BUSN_SGMNTTN_LVL__c: string
    BUSN_SGMNTTN_CODE__c: string
    BUSN_SGMNTTN_NODE__c: string
    CUST_LVL__c: string
    CUST_LVL_NODE__c: string
    apply_to_cust__c: boolean
    Apply_To_Leads__c: boolean
}
export const routeHierarchyNameMapping = {
    Region: 'Rgn',
    Market: 'Mkt',
    Location: 'Loc',
    Route: 'Rte',
    Territory: 'Ter'
}

export const keyAccountTypeNameMapping = {
    'Key Account': 'KA',
    'Key Account Division': 'KAD',
    Owner: 'Owner'
}
export const handleSegmentOptionCodeList = (type, segmentOption) => {
    switch (type) {
        case 'Channel':
            return segmentOption.CHANNEL_CODE
        case 'Segment':
            return segmentOption.SEGMENT_CODE
        case 'Sub-Seg':
            return segmentOption.SUB_SEGMENT_CODE
        default:
            return []
    }
}
const initWiring = (): Wiring => {
    return {
        SLS_UNIT_LVL__c: '',
        SLS_UNIT_CODE__c: '',
        SLS_UNIT_NODE__c: '',
        BUSN_SGMNTTN_LVL__c: '',
        BUSN_SGMNTTN_CODE__c: '',
        BUSN_SGMNTTN_NODE__c: '',
        CUST_LVL__c: '',
        CUST_LVL_NODE__c: '',
        apply_to_cust__c: false,
        Apply_To_Leads__c: false
    }
}

const AddNewVisibilityModal: FC<AddNewVisibilityModalProps> = (props: AddNewVisibilityModalProps) => {
    const { cRef, onSuccess, onFail } = props
    const [showModal, setShowModal] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const routeLists = useRouteLists(searchValue, ['Region', 'Market', 'Location', 'Route', 'Territory'])
    const { channelList, segmentList, subSegmentList, segmentOption } = useBusinessSegmentPicklist()
    const [businessSegmentList, setBusinessSegmentList] = useState([])
    const [tempKeyAccount, setTempKeyAccount] = useState(null)
    const keyAccountList = useKeyAccount(tempKeyAccount, ['Key Account', 'Key Account Division', 'Owner'])
    const [disableSave, setDisableSave] = useState(false)
    const [wiringDefinition, setWiringDefinition] = useState<Wiring>(initWiring)
    const globalModalRef = useRef(null)

    const handleBusinessSegmentData = (channelOptionList, segmentOptionList, subSegmentOptionList) => {
        const tempList = []
        channelOptionList?.forEach((v, k) => {
            if (k !== 0) {
                tempList.push({ option: v, type: 'Channel' })
            }
        })
        segmentOptionList?.forEach((v, k) => {
            if (k !== 0) {
                tempList.push({ option: v, type: 'Segment' })
            }
        })
        subSegmentOptionList?.forEach((v, k) => {
            if (k !== 0) {
                tempList.push({ option: v, type: 'Sub-Seg' })
            }
        })
        setBusinessSegmentList(tempList)
    }

    useEffect(() => {
        setWiringDefinition(initWiring)
        handleBusinessSegmentData(channelList, segmentList?.Select, subSegmentList?.Select)
    }, [showModal])

    useEffect(() => {
        if (_.isEmpty(wiringDefinition.SLS_UNIT_NODE__c)) {
            setDisableSave(true)
        } else if (!wiringDefinition.Apply_To_Leads__c && !wiringDefinition.apply_to_cust__c) {
            setDisableSave(true)
        } else {
            setDisableSave(false)
        }
    }, [wiringDefinition])
    const closeModal = () => {
        setShowModal(false)
    }

    useImperativeHandle(cRef, () => ({
        showModal: () => {
            setShowModal(true)
        },
        closeModal: closeModal
    }))

    const addCustomerWiring = async () => {
        globalModalRef.current?.openModal()
        try {
            const wiringId = await getWiringDefinition(_.cloneDeep(wiringDefinition))
            const res = await getWiringUser(wiringId, CommonParam.userId)
            if (res?.data?.records?.length === 0) {
                await createWiringUser(
                    wiringId,
                    wiringDefinition.apply_to_cust__c,
                    wiringDefinition.Apply_To_Leads__c,
                    CommonParam.userId,
                    CommonParam.PERSONA__c
                )
                globalModalRef.current?.closeModal()
                closeModal()
                onSuccess && (await onSuccess('create'))
            } else {
                const wiringUserId = res?.data?.records[0]?.Id
                await updateWiringUser(
                    wiringUserId,
                    wiringDefinition.apply_to_cust__c,
                    wiringDefinition.Apply_To_Leads__c
                )
                globalModalRef.current?.closeModal()
                closeModal()
                onSuccess && (await onSuccess('exist'))
            }
        } catch (e) {
            globalModalRef.current?.closeModal()
            closeModal()
            onFail && onFail()
            storeClassLog(
                Log.MOBILE_ERROR,
                'addCustomerWiring',
                'add customer wiring: ' + ErrorUtils.error2String(e) + JSON.stringify(wiringDefinition)
            )
        }
    }

    return (
        <Modal visible={showModal} animationType={'fade'}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <CText style={styles.title}>{_.toUpper(t.labels.PBNA_MOBILE_LEAD_CUSTOMER_VISIBILITY)}</CText>
                </View>
                <View style={commonStyle.flex_1}>
                    <View style={styles.visibilityCont}>
                        <CText style={styles.eTitle}>{t.labels.PBNA_MOBILE_ADD_NEW_VISIBILITY}</CText>
                    </View>
                    <View style={styles.searchableCont}>
                        <SearchablePicklist
                            label={t.labels.PBNA_MOBILE_GEOGRAPHY_REQUIRED}
                            data={routeLists}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_AND_SELECT_LOCATION}
                            searchIcon
                            onSearchChange={(v) => {
                                setSearchValue(v)
                            }}
                            showValue={(v) => {
                                return v?.SLS_UNIT_NM__c + ' - ' + routeHierarchyNameMapping[v?.HRCHY_LVL__c]
                            }}
                            onApply={(v) => {
                                const temp = _.cloneDeep(wiringDefinition)
                                temp.SLS_UNIT_LVL__c = v.HRCHY_LVL__c
                                temp.SLS_UNIT_CODE__c = v.UNIQ_ID_VAL__c
                                temp.SLS_UNIT_NODE__c = v.SLS_UNIT_NM__c
                                setWiringDefinition(temp)
                            }}
                            containerStyle={styles.marginBottom_30}
                        />
                        <SearchablePicklist
                            label={t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}
                            data={businessSegmentList}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_AND_SELECT_BUSINESS_SEGMENT}
                            searchIcon
                            search
                            showValue={(v) => {
                                return v?.option + ' - ' + v?.type
                            }}
                            onApply={(v) => {
                                const temp = _.cloneDeep(wiringDefinition)
                                const segmentOptionCodeList = handleSegmentOptionCodeList(v?.type, segmentOption)
                                temp.BUSN_SGMNTTN_LVL__c = v?.type === 'Sub-Seg' ? 'Subsegment' : v?.type
                                temp.BUSN_SGMNTTN_CODE__c =
                                    _.findKey(segmentOptionCodeList, (item) => {
                                        return item === v?.option
                                    }) || ''
                                temp.BUSN_SGMNTTN_NODE__c = v?.option
                                setWiringDefinition(temp)
                            }}
                            containerStyle={styles.marginBottom_30}
                        />
                        <SearchablePicklist
                            label={t.labels.PBNA_MOBILE_CUSTOMER}
                            data={_.filter(keyAccountList, (v) => {
                                return (
                                    v?.CUST_LVL__c === 'Key Account' ||
                                    v?.CUST_LVL__c === 'Key Account Division' ||
                                    v?.CUST_LVL__c === 'Owner'
                                )
                            })}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_AND_SELECT_KEY_ACCOUNT}
                            searchIcon
                            onSearchChange={(v) => {
                                setTempKeyAccount(v)
                            }}
                            showValue={(v) => {
                                return v?.Name + ' - ' + keyAccountTypeNameMapping[v?.CUST_LVL__c]
                            }}
                            onApply={(v) => {
                                const temp = _.cloneDeep(wiringDefinition)
                                temp.CUST_LVL__c = v?.CUST_LVL__c
                                temp.CUST_LVL_NODE__c = v.Name
                                setWiringDefinition(temp)
                            }}
                        />
                        <CText style={styles.definitionText}>{t.labels.PBNA_MOBILE_DO_YOU_NEED_THIS_DEFINITION}</CText>
                        <CCheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_APPLY_TO_CUSTOMERS}</CText>}
                            containerStyle={styles.checkBoxCont}
                            checked={wiringDefinition.apply_to_cust__c}
                            onPress={() => {
                                const temp = _.cloneDeep(wiringDefinition)
                                temp.apply_to_cust__c = !temp.apply_to_cust__c
                                setWiringDefinition(temp)
                            }}
                        />
                        <CCheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_APPLY_TO_LEADS}</CText>}
                            containerStyle={styles.checkBoxCont}
                            checked={wiringDefinition.Apply_To_Leads__c}
                            onPress={() => {
                                const temp = _.cloneDeep(wiringDefinition)
                                temp.Apply_To_Leads__c = !temp.Apply_To_Leads__c
                                setWiringDefinition(temp)
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={() => {
                    closeModal()
                }}
                onPressSave={async () => {
                    if (wiringDefinition.apply_to_cust__c) {
                        Alert.alert(
                            t.labels.PBNA_MOBILE_EXPAND_VIEW_TO_CUSTOMERS,
                            t.labels.PBNA_MOBILE_ARE_YOU_SURE_YOU_WANT_TO_APPLY_THIS_DEFINITION,
                            [
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_YES_ADD,
                                    onPress: addCustomerWiring
                                }
                            ]
                        )
                    } else {
                        await addCustomerWiring()
                    }
                }}
                rightButtonLabel={t.labels.PBNA_MOBILE_ADD}
                disableSave={disableSave}
                relative
                leftTitleStyle={styles.leftButtonTitle}
                rightTitleStyle={styles.rightButtonTitle}
            />
            <GlobalModal ref={globalModalRef} />
        </Modal>
    )
}

export default AddNewVisibilityModal
