/**
 * @description The customer contact tab.
 * @author Sylvia Yuan
 */
import React, { useState, FC, useEffect, useContext, useRef, useImperativeHandle, useMemo } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback
} from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import {
    contractData,
    useContractTab,
    useCDABtnVisible,
    useShowContractUploadBar,
    useCDAPendingUploads
} from '../../../hooks/CustomerContractTabHooks'
import { t } from '../../../../common/i18n/t'
import CollapseContainer from '../../common/CollapseContainer'
import CText from '../../../../common/components/CText'
import EmptyListPlaceholder from '../../common/EmptyListPlaceholder'
import SelectTab from '../../common/SelectTab'
import { Tooltip } from 'react-native-elements'
import _ from 'lodash'
import { renderCDAStoreIcon } from './CustomerListTile'
import moment from 'moment'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import {
    BtnGroupProps,
    ContractBtnType,
    ContractRecordTypeName,
    ContractStatus,
    StepNumVal,
    getMedalMap,
    AuditBtnGroupProps,
    IntervalTime,
    VisitSubtypeEnum,
    ContractAndAuditSubTab,
    HttpError
} from '../../../enums/Contract'
import { restApexCommonCall, restDataCommonCall, syncDownObj } from '../../../api/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import { HttpStatusCode } from 'axios'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { DropDownType } from '../../../enums/Manager'
import SurveyQuestionsModal from './contract-tab/SurveyQuestionsModal'
import { getAllFieldsByObjName } from '../../../utils/SyncUtils'
import { useDispatch, useSelector } from 'react-redux'
import {
    setButtonClicked,
    setCheckedYear,
    setDisabledYear,
    setSurveyQuestionsModalVisible
} from '../../../redux/action/ContractAction'
import {
    handleAuditDeleteDraft,
    handleCancelCDA,
    handleDeleteDraft,
    handleOpenDraftCDA,
    handlePressDeclineCDA,
    refreshCustomerDetailData,
    updateVisitStatus
} from '../../../helper/rep/ContractHelper'
import { getStringValue } from '../../../utils/LandingUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import {
    createAuditVisit,
    createRetailVisitKPI,
    editAuditVisit,
    getAddress
} from '../../../helper/rep/StartNewCDAHelper'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import IconFoodService from '../../../../../assets/image/icon-food-service.svg'
import IconResetVisit from '../../../../../assets/image/icon-reset-visit.svg'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import { VisitStatus, VisitSubType } from '../../../enums/Visit'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { CommonParam } from '../../../../common/CommonParam'
import { ScrollView } from 'react-native-gesture-handler'
import SelectYearModalHeader, { styles as stylesMission } from './contract-tab/SelectYearModalHeader'
import { CheckBox } from 'react-native-elements/dist/checkbox/CheckBox'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { Persona } from '../../../../common/enums/Persona'
import { setButtonBeingClicked } from '../../../redux/action/AuditAction'
import SelectYearModalChildren from './contract-tab/SelectYearModalChildren'
import { usePepsiCoPeriodCalendar } from '../../../hooks/CustomerHooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSharePointToken } from '../../../helper/rep/SharePointTokenHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import {
    deleteDataLocalIsNotInprogressContract,
    findUploadInprogressContract,
    getInprogressContracts,
    uploadOfflineContract
} from '../../../helper/rep/ContractAndAuditHelper'
import NetInfo from '@react-native-community/netinfo'
import { CDASuccessModal } from './contract-tab/CDASuccessModal'

interface CustomerContractTabProps {
    cRef?: any
    retailStore: any
    activeTab?: string
    refreshFlag?: number
    editable?: boolean
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    defaultSuTab?: ContractAndAuditSubTab
    setShowContractUploadBar: React.Dispatch<React.SetStateAction<boolean>>
    setOfflineLoading: React.Dispatch<React.SetStateAction<boolean>>
    offlineLoading: boolean
}
interface EditAuditVisitsProps {
    list: any[]
    retailStore: any
    onEditAuditVisit: Function
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
}
interface AuditCardProps {
    list: any[]
    readonly: boolean
    isSpaceBreakdown?: boolean
    customerDetail?: any
    onEditAuditVisit?: Function
    setRefreshFlag?: React.Dispatch<React.SetStateAction<number>>
}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    },
    checkBoxContainerStyle: {
        marginLeft: -10,
        paddingVertical: 19,
        backgroundColor: '#FFFFFF',
        borderWidth: 0
    },
    checkBoxBottomLine: {
        marginLeft: 20,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    container: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        marginBottom: 50
    },
    tabContainer: {
        marginTop: 20
    },
    newCDABtnContainer: {
        marginVertical: 30,
        height: 44,
        flex: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    readonlyNewBtnStyle: {
        marginHorizontal: 22
    },
    nonReadonlyNewBtnStyle: {
        marginRight: 22
    },
    customerDeclinedBtnContainer: {
        marginVertical: 30,
        marginLeft: 22,
        flex: 1,
        height: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnTitle: {
        fontWeight: '700',
        fontSize: 12,
        color: '#FFF'
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    noResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    noResultContent: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    potentialCDACustomerContainer: {
        display: 'flex',
        flex: 1,
        paddingTop: 95,
        backgroundColor: 'red'
    },
    ResultIcon: {
        width: 180,
        height: 135
    },
    placeholderContainer: {
        paddingTop: 51, // Because I added a margin bottom 30 to the start new cda button so this is 81-50
        paddingHorizontal: 59,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    alignCenter: {
        alignItems: 'center'
    },
    noResult: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    noResultMsg: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    placeholderTextContainer: {
        width: 310,
        alignItems: 'center'
    },
    placeholderImageContainer: {
        width: 197,
        height: 201,
        marginBottom: 20
    },
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        fontFamily: 'Gotham',
        color: '#565656',
        textAlign: 'center'
    },
    newActiveBtn: {
        backgroundColor: '#6C0CC3'
    },
    disabledBtn: {
        borderWidth: 1,
        borderColor: '#FFF',
        backgroundColor: '#FFF'
    },
    disabledBtnText: {
        color: '#D3D3D3'
    },
    newActiveBtnText: {
        color: '#FFF'
    },

    declinedActiveBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EB445A'
    },

    declinedActiveBtnText: {
        color: '#EB445A'
    },

    threePointIcon: {
        width: 26,
        height: 28
    },
    tooltipContainer: {
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    checkItem: {
        marginRight: 14,
        height: 30,
        borderRadius: 20,
        borderColor: '#00A2D9',
        borderWidth: 1,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        paddingHorizontal: 14
    },
    checkItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingLeft: 22,
        paddingRight: 8,
        paddingVertical: 5,
        justifyContent: 'space-between'
    },
    selectedTab: { backgroundColor: '#00A2D9' },
    emptyCurrentList: {
        flex: 1,
        paddingBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    moreBtnDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#000000',
        marginBottom: 4
    },
    moreBtn: {
        flexDirection: 'column',
        width: 33,
        height: 33,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tooltipTap: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000'
    },
    redText: {
        color: '#EB445A'
    },
    lineStyle: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    dateString: {
        fontSize: 12,
        color: '#565656'
    },
    font12: {
        fontSize: 12
    },
    cardMenuContainer: {
        flex: 1,
        paddingHorizontal: 10,
        width: '100%',
        justifyContent: 'space-around'
    },
    cdaCardContainer: {
        flex: 1,
        paddingTop: 13,
        paddingBottom: 17,
        backgroundColor: 'white',
        paddingLeft: 22,
        paddingRight: 12
    },
    cdaCardSubContainer: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        marginVertical: 7
    },
    cdaCardTextContainer: {
        flex: 1,
        justifyContent: 'space-between'
    },
    medalText: {
        fontSize: 16,
        fontWeight: '700'
    },
    cdaSectionTitle: {
        marginBottom: 20,
        marginLeft: 22,
        fontSize: 20,
        fontWeight: '900'
    },
    historyTabCardContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 13,
        paddingHorizontal: 22
    },
    historyCardContainer: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        marginVertical: 15
    },
    historyCardSubContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0
    },
    cancelledPill: {
        overflow: 'hidden',
        backgroundColor: '#D3D3D3',
        color: '#565656',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 2,
        fontWeight: '700',
        fontSize: 12
    },
    storeIcon: {
        width: 50,
        height: 50,
        marginRight: 15
    },
    historyCardSep: {
        height: 1,
        backgroundColor: '#D3D3D3',
        marginLeft: 65,
        width: '100%'
    },
    historyTabText: {
        fontWeight: '400',
        color: '#00A2D9'
    },
    historyTabActiveText: {
        color: 'white'
    },
    cdaCardSep: {
        backgroundColor: '#F2F4F7',
        marginLeft: 25,
        width: 3,
        height: 20
    },
    placeholderView: { width: 14, height: 44 },
    groupBtnView: { flexDirection: 'row', justifyContent: 'space-between' },
    readonlyTabContainer: {
        marginBottom: 30
    },
    visitIconBox: {
        width: 50,
        height: 50,
        marginRight: 15
    },
    visitIcon: {
        borderRadius: 10,
        backgroundColor: '#4656DF',
        width: 40,
        height: 40
    },
    visitDate: {
        fontWeight: '400',
        fontSize: 12,
        fontStyle: 'normal',
        color: '#565656'
    },
    visitTitle: {
        fontWeight: '700',
        fontSize: 14,
        fontStyle: 'normal',
        color: '#000000',
        lineHeight: 18,
        marginVertical: 3
    },
    visitSubText: {
        lineHeight: 16
    },
    visitBadge: {
        borderWidth: 1,
        borderColor: '#565656',
        paddingHorizontal: 9,
        paddingVertical: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 10
    },
    visitBadgeText: {
        fontWeight: '700',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 16,
        color: '#565656'
    },
    visitBadgeInProgress: {
        borderColor: '#FFC409',
        backgroundColor: '#FFC409'
    },
    visitBadgeTextInProgress: {
        color: '#000000'
    },
    visitBadgeCannel: {
        borderColor: '#D3D3D3',
        backgroundColor: '#D3D3D3'
    },
    visitBadgeTextCannel: {
        color: '#565656'
    },
    auditBtnGroupBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 22
    },
    activeBtnBox: {
        marginVertical: 30,
        flex: 1,
        height: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: 185,
        borderWidth: 1,
        borderColor: '#6C0CC3'
    },
    activeBtnText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#6C0CC3'
    },
    uploadFSContract: {
        backgroundColor: '#6C0CC3',
        marginHorizontal: 22,
        flex: 1,
        borderRadius: 5,
        height: 44
    },
    uploadFSContractText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '700',
        marginTop: 'auto',
        marginBottom: 'auto',
        textAlign: 'center'
    },
    noCurrentImg: {
        marginTop: 30,
        marginBottom: 10,
        width: 162,
        height: 166
    },
    newBorderBtn: {
        borderWidth: 1,
        borderColor: '#6C0CC3',
        backgroundColor: '#FFF'
    },
    newBorderBtnText: {
        color: '#6C0CC3'
    },
    emptyAuditCurrentList: {
        backgroundColor: '#F2F4F7'
    },
    moreAuditBtn: {
        marginLeft: 5
    },
    cdaAuditCardContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 22
    },
    bottomBorder: {
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#D3D3D3',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1
    },
    borderWhite: {
        borderColor: '#FFFFFF'
    },
    cdaShadow: {
        shadowOpacity: 0.17,
        shadowColor: '#004C97',
        shadowRadius: 10,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        padding: 20,
        paddingBottom: 0,
        backgroundColor: '#ffffff',
        marginTop: 30,
        marginBottom: 20
    },
    detailStyle: {
        paddingTop: 4
    },
    removePill: {
        borderColor: '#EB445A',
        color: '#FFFFFF',
        backgroundColor: '#EB445A'
    },
    successPill: {
        color: '#FFFFFF',
        borderColor: '#2DD36F',
        backgroundColor: '#2DD36F'
    },
    badgeCommon: {
        marginTop: 6,
        alignSelf: 'flex-start'
    },
    badgeCompleted: {
        borderColor: '#2DD36F',
        backgroundColor: '#2DD36F'
    },
    badgeTextCompleted: {
        color: '#ffffff'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        zIndex: 1,
        backgroundColor: baseStyle.color.modalBlack
    },
    childrenTitleView: {
        paddingVertical: 30,
        alignItems: 'center'
    },
    childrenBodyView: {
        backgroundColor: '#FFFFFF',
        paddingLeft: 0,
        paddingBottom: 33
    },
    selectMissionModalBody: {
        backgroundColor: '#FFFFFF'
    },
    scrollView: {
        maxHeight: 350
    },
    safeAreaView: {
        width: '100%',
        overflow: 'hidden',
        zIndex: 2,
        backgroundColor: '#FFFFFF'
    },
    imgUserImage: {
        marginRight: '5%'
    },
    displayNone: {
        display: 'none'
    },
    emptyAuditC: {
        backgroundColor: 'white',
        paddingBottom: 40
    },
    uploadContractC: {
        flexDirection: 'row',
        marginLeft: 'auto',
        marginRight: '5%',
        alignItems: 'center',
        marginTop: 30
    },
    cdaBtnVisible: {
        marginTop: 0,
        marginBottom: 30
    },
    uploadIcon: {
        height: 17,
        width: 16.65
    },
    uploadText: {
        color: '#00A2D9',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 10
    }
})
const menuContext = React.createContext<
    { setRefreshFlag: React.Dispatch<React.SetStateAction<number>>; retailStoreID: string } | any
>({})

const CDAStoreIcon = ({ item }: { item: contractData }) => {
    if (item?.RecordType?.Name === ContractRecordTypeName.FSContracts) {
        return <IconFoodService width={40} height={40} style={{ marginRight: 25 }} />
    }
    if (item.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_RETAIL_CONTRACT) {
        return <IMG_STORE_PLACEHOLDER width={50} height={50} style={styles.imgUserImage} />
    }
    return renderCDAStoreIcon(item?.Signed_Medal_Tier__c, styles.storeIcon)
}

const renderDateString = (str: string, date: string) => (
    <View style={commonStyle.flexDirectionRow}>
        <CText style={styles.dateString}>{str + ' '}</CText>
        <CText style={styles.font12}>{date}</CText>
    </View>
)
const renderVisitStatusBadge = (resetVisitObj: any) => {
    const status = resetVisitObj.Status__c
    let viewStyle, statusText, textStyle
    switch (status) {
        case VisitStatus.PUBLISH:
            statusText = t.labels.PBNA_MOBILE_NOT_STARTED
            viewStyle = [styles.visitBadge]
            textStyle = [styles.visitBadgeText]
            break
        case VisitStatus.IN_PROGRESS:
            statusText = t.labels.PBNA_MOBILE_IN_PROGRESS
            viewStyle = [styles.visitBadge, styles.visitBadgeInProgress]
            textStyle = [styles.visitBadgeText, styles.visitBadgeTextInProgress]
            break
        case VisitStatus.CANCELLED:
            statusText = t.labels.PBNA_MOBILE_CANCELLED
            viewStyle = [styles.visitBadge, styles.visitBadgeCannel]
            textStyle = [styles.visitBadgeText, styles.visitBadgeTextCannel]
            break
        default:
            statusText = t.labels.PBNA_MOBILE_REMOVED
            viewStyle = [styles.visitBadge, styles.visitBadgeCannel]
            textStyle = [styles.visitBadgeText, styles.visitBadgeTextCannel]
    }
    return (
        <View style={commonStyle.flexRowCenter}>
            <View style={viewStyle}>
                <CText style={textStyle}>{statusText}</CText>
            </View>
        </View>
    )
}
const getSubText = (resetVisitObj: any) => {
    const label =
        resetVisitObj.Status__c === VisitStatus.COMPLETE
            ? t.labels.PBNA_MOBILE_COMPLETED_BY
            : t.labels.PBNA_MOBILE_ASSIGNED_TO
    const visitorName = resetVisitObj.Visitor?.Name || ''
    const isNotStarted = resetVisitObj.Status__c === VisitStatus.PUBLISH && !_.isEmpty(visitorName)
    return [VisitStatus.IN_PROGRESS, VisitStatus.COMPLETE].indexOf(resetVisitObj.Status__c) > -1 || isNotStarted
        ? `${label} ${visitorName}`
        : _.capitalize(t.labels.PBNA_MOBILE_UNASSIGNED)
}
const getVisitTitle = (resetVisitObj: any) => {
    const label = t.labels.PBNA_MOBILE_RESET_VISIT
    return resetVisitObj.Status__c === VisitStatus.COMPLETE ? `${label} ${t.labels.PBNA_MOBILE_COMPLETE}` : label
}
function usePrevious(value: any) {
    const ref = useRef()
    useEffect(() => {
        ref.current = value // assign the value of ref to the argument
    }, [value]) // this code will run when the value of 'value' changes
    return ref.current // in the end, return the current ref value.
}

const CardMenuContainer = ({ item }: { item: contractData }) => {
    const dispatch = useDispatch()
    const navigation = useNavigation() as any

    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const statusInProgress = item?.Contract_Status__c === 'In progress'
    const [loadingDecline, setLoadingDecline] = useState(false)
    const [loadingDeleteDraft, setLoadingDeleteDraft] = useState(false)
    const { dropDownRef } = useDropDown() as any
    const { setRefreshFlag, retailStoreID, retailStore } = useContext(menuContext)
    const tooltipRef = useRef(null)

    const isLoading = loadingDecline || loadingDeleteDraft

    const handlePressDecline = async () => {
        try {
            setLoadingDecline(true)
            const res = await restDataCommonCall(`sobjects/Contract/${item.Id}`, 'PATCH', {
                Contract_Status__c: 'Declined'
            })
            if (res?.status === HttpStatusCode.Ok || res?.status === HttpStatusCode.NoContent) {
                await syncDownObj(
                    'RetailStore',
                    `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id='${retailStoreID}'`
                )
                updateVisitStatus(item.CDA_Visit__c)
                if (!_.isEmpty(item.CDA_Reset_Visit__c)) {
                    updateVisitStatus(item.CDA_Reset_Visit__c, VisitStatus.REMOVED)
                }
                // loadingDecline will reset to false after refresh
                setRefreshFlag && setRefreshFlag((v: number) => v + 1)
            } else {
                throw new Error(getStringValue(res))
            }
        } catch (err) {
            setLoadingDecline(false)
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_CDA_DECLINE_CDA_FAILURE, err)
            storeClassLog(
                Log.MOBILE_ERROR,
                'CDA-UpdateContractButton',
                `Update Contract Contract_Status__c: ${getStringValue(err)}`
            )
        }
    }

    const handleEditContractDates = () => {
        tooltipRef?.current?.toggleTooltip(false)
        navigation.navigate(
            item.RecordType?.Name === ContractRecordTypeName.FSContracts ? 'UploadFSContract' : 'UploadContract',
            {
                retailStore,
                item,
                setRefreshFlag
            }
        )
    }

    let height

    if (statusInProgress) {
        height = 155
    } else {
        const isFSContract = item.RecordType?.Name === ContractRecordTypeName.FSContracts
        const isMobileRetailContract = item.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_RETAIL_CONTRACT

        if (!(isFSContract || isMobileRetailContract)) {
            height = 100
        } else {
            height = 60
        }
    }

    return (
        <View style={commonStyle.alignItemsEnd}>
            <Tooltip
                ref={tooltipRef}
                width={244}
                height={height}
                containerStyle={styles.tooltipContainer}
                pointerColor={'#D3D3D3'}
                withOverlay={false}
                backgroundColor={'white'}
                popover={
                    <View style={styles.cardMenuContainer}>
                        {statusInProgress && (
                            <>
                                <TouchableOpacity
                                    disabled={isLoading}
                                    style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                    onPress={() => {
                                        dispatch(setButtonClicked(ContractBtnType.EDIT_DRAFT))
                                        tooltipRef?.current?.toggleTooltip(false)
                                        handleOpenDraftCDA(item, dispatch)
                                    }}
                                >
                                    <CText style={styles.tooltipTap}>
                                        {t.labels.PBNA_MOBILE_EDIT_DRAFT.toLocaleUpperCase()}
                                    </CText>
                                </TouchableOpacity>
                                <View style={styles.lineStyle} />
                            </>
                        )}
                        {statusInProgress && (
                            <>
                                <TouchableOpacity
                                    style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                    disabled={isLoading}
                                    onPress={() => handlePressDeclineCDA(item.CDA_Year__c, handlePressDecline)}
                                >
                                    <CText
                                        style={[
                                            styles.tooltipTap,
                                            styles.redText,
                                            loadingDecline && styles.disabledBtnText
                                        ]}
                                    >
                                        {t.labels.PBNA_MOBILE_CUSTOMER_DECLINED_CDA.toLocaleUpperCase()}
                                    </CText>
                                    {loadingDecline && <ActivityIndicator />}
                                </TouchableOpacity>
                                <View style={styles.lineStyle} />
                                <TouchableOpacity
                                    disabled={isLoading}
                                    style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                    onPress={() =>
                                        Alert.alert(
                                            t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA,
                                            t.labels.PBNA_MOBILE_CDA_DELETE_DRAFT,
                                            [
                                                {
                                                    text: `${t.labels.PBNA_MOBILE_CANCEL}`
                                                },
                                                {
                                                    text: `${_.capitalize(t.labels.PBNA_MOBILE_DELETE)}`,
                                                    onPress: () =>
                                                        handleDeleteDraft(
                                                            item,
                                                            { ...customerDetail, ...retailStore },
                                                            setLoadingDeleteDraft,
                                                            setRefreshFlag,
                                                            dropDownRef
                                                        ),
                                                    style: 'destructive'
                                                }
                                            ]
                                        )
                                    }
                                >
                                    <CText style={[styles.tooltipTap, styles.redText]}>
                                        {t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA.toLocaleUpperCase()}
                                    </CText>
                                    {loadingDeleteDraft && <ActivityIndicator />}
                                </TouchableOpacity>
                            </>
                        )}
                        {(item.RecordType?.Name === ContractRecordTypeName.FSContracts ||
                            item.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_RETAIL_CONTRACT) && (
                            <TouchableOpacity
                                style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                onPress={handleEditContractDates}
                            >
                                <CText style={styles.tooltipTap}>
                                    {t.labels.PBNA_MOBILE_EDIT_CONTRACT_DATES.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        )}
                        {!statusInProgress &&
                            !(
                                item.RecordType?.Name === ContractRecordTypeName.FSContracts ||
                                item.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_RETAIL_CONTRACT
                            ) && (
                                <>
                                    <TouchableOpacity
                                        style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                        onPress={() => {
                                            tooltipRef?.current?.toggleTooltip(false)
                                            handleOpenDraftCDA(item, dispatch)
                                        }}
                                    >
                                        <CText style={[styles.tooltipTap]}>
                                            {t.labels.PBNA_MOBILE_EDIT_REWARDS.toLocaleUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                    <View style={styles.lineStyle} />
                                    <TouchableOpacity
                                        style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                                        onPress={() => {
                                            handleCancelCDA(item, setRefreshFlag, dropDownRef, retailStoreID)
                                        }}
                                    >
                                        <CText style={[styles.tooltipTap, styles.redText]}>
                                            {t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                </>
                            )}
                    </View>
                }
            >
                <View style={styles.moreBtn}>
                    <View style={styles.moreBtnDot} />
                    <View style={styles.moreBtnDot} />
                    <View style={styles.moreBtnDot} />
                </View>
            </Tooltip>
        </View>
    )
}

const AuditCardMenuContainer = ({
    item,
    onEditAuditVisit,
    setRefreshFlag
}: {
    item: any
    onEditAuditVisit: Function
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
}) => {
    const tooltipRef = useRef(null)
    const [loadingDeleteDraft, setLoadingDeleteDraft] = useState(false)
    // const { setRefreshFlag } = useContext(menuContext)
    const { dropDownRef } = useDropDown() as any
    const handleAuditEditDraft = () => {
        tooltipRef?.current?.toggleTooltip(false)
        onEditAuditVisit()
    }
    return (
        <View style={commonStyle.alignItemsEnd}>
            <Tooltip
                ref={tooltipRef}
                width={244}
                height={90}
                containerStyle={styles.tooltipContainer}
                pointerColor={'#D3D3D3'}
                withOverlay={false}
                backgroundColor={'white'}
                popover={
                    <View style={styles.cardMenuContainer}>
                        <TouchableOpacity
                            style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                            onPress={handleAuditEditDraft}
                        >
                            <CText style={styles.tooltipTap}>
                                {t.labels.PBNA_MOBILE_EDIT_DRAFT.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                        <View style={[styles.lineStyle, commonStyle.marginVertical_8]} />
                        <TouchableOpacity
                            style={[commonStyle.flex_1, commonStyle.flexRowAlignCenter]}
                            onPress={() =>
                                Alert.alert(
                                    t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA,
                                    t.labels.PBNA_MOBILE_CDA_DELETE_DRAFT,
                                    [
                                        {
                                            text: `${t.labels.PBNA_MOBILE_CANCEL}`
                                        },
                                        {
                                            text: `${_.capitalize(t.labels.PBNA_MOBILE_DELETE)}`,
                                            onPress: () => {
                                                tooltipRef?.current?.toggleTooltip(false)
                                                handleAuditDeleteDraft(
                                                    item,
                                                    setLoadingDeleteDraft,
                                                    setRefreshFlag,
                                                    dropDownRef
                                                )
                                            },
                                            style: 'destructive'
                                        }
                                    ]
                                )
                            }
                        >
                            <CText style={[styles.tooltipTap, styles.redText]}>
                                {t.labels.PBNA_MOBILE_DELETE_DRAFT_CDA.toLocaleUpperCase()}
                            </CText>
                            {loadingDeleteDraft && <ActivityIndicator />}
                        </TouchableOpacity>
                    </View>
                }
            >
                <View style={[styles.moreBtn, styles.moreAuditBtn]}>
                    <View style={styles.moreBtnDot} />
                    <View style={styles.moreBtnDot} />
                    <View style={styles.moreBtnDot} />
                </View>
            </Tooltip>
        </View>
    )
}

const renderSignMedalText = (item: contractData) => {
    const medalMap = getMedalMap()
    const title = (() => {
        // Feature UI Only
        if (ContractRecordTypeName.FSContracts === item.RecordType?.Name) {
            return item.Signed_Medal_Tier__c
        }
        if (item.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_RETAIL_CONTRACT) {
            return item.Signed_Medal_Tier__c + (item.Name ? ` - ${item.Name}` : '')
        }
        if (item.Contract_Status__c === ContractStatus.InProgress) {
            return t.labels.PBNA_MOBILE_DRAFT_CDA
        }
        if (item.Contract_Status__c === ContractStatus.Declined) {
            return t.labels.PBNA_MOBILE_DECLINED
        }
        return item.Signed_Medal_Tier__c
            ? medalMap[item.Signed_Medal_Tier__c] || item.Signed_Medal_Tier__c
            : t.labels.PBNA_MOBILE_MEDAL
    })()
    return (
        <>
            <CText style={styles.medalText}>{title}</CText>
        </>
    )
}
const BasicCDACard = ({
    list,
    readonly,
    handleOpenContractPDF
}: {
    list: contractData[]
    readonly: boolean
    handleOpenContractPDF: (item: contractData) => void
}) => {
    const getOpenPDFFuc = (item: contractData) => () => handleOpenContractPDF(item)
    const getStepText = (step: string) => {
        switch (step) {
            case '1':
                return t.labels.PBNA_MOBILE_PROGRESS_ONE

            case '2':
                return t.labels.PBNA_MOBILE_PROGRESS_TWO

            case '3':
                return t.labels.PBNA_MOBILE_PROGRESS_THREE

            case '4':
                return t.labels.PBNA_MOBILE_PROGRESS_FOUR

            default:
                return t.labels.PBNA_MOBILE_PROGRESS_ZERO
        }
    }
    return (
        <View style={styles.cdaCardContainer}>
            {list.map((item) => (
                <View key={item.Id}>
                    <View>
                        <TouchableOpacity
                            disabled={!item.Sharepoint_URL__c || item.Contract_Status__c !== 'Signed'}
                            onPress={getOpenPDFFuc(item)}
                            key={item.Id}
                            style={styles.cdaCardSubContainer}
                        >
                            <CDAStoreIcon item={item} />
                            <View style={styles.cdaCardTextContainer}>
                                {item.RecordType?.Name === ContractRecordTypeName.FSContracts &&
                                    renderDateString(
                                        moment(item.StartDate).format(TIME_FORMAT.MMM_D_YYYY) +
                                            ' - ' +
                                            moment(item.EndDate).format(TIME_FORMAT.MMM_D_YYYY),
                                        ''
                                    )}
                                {renderSignMedalText(item)}
                                {item.RecordType?.Name === ContractRecordTypeName.FSContracts ? (
                                    <View style={{ marginTop: 3 }}>
                                        {renderDateString(t.labels.PBNA_MOBILE_COMPLETED_BY, item?.CreatedBy?.Name)}
                                    </View>
                                ) : (
                                    item.Contract_Status__c !== ContractStatus.InProgress && (
                                        <>
                                            {renderDateString(
                                                t.labels.PBNA_MOBILE_START_DATE,
                                                moment(item.StartDate).format(TIME_FORMAT.MMM_D_YYYY)
                                            )}
                                            {renderDateString(
                                                t.labels.PBNA_MOBILE_END_DATE,
                                                moment(item.EndDate).format(TIME_FORMAT.MMM_D_YYYY)
                                            )}
                                        </>
                                    )
                                )}

                                {item.Contract_Status__c === ContractStatus.InProgress && (
                                    <>
                                        {renderDateString(
                                            t.labels.PBNA_MOBILE_CREATED_ON,
                                            moment(item.CreatedDate).format(TIME_FORMAT.MMM_D_YYYY)
                                        )}
                                        {renderDateString(
                                            t.labels.PBNA_MOBILE_PROGRESS,
                                            getStepText(item.Draft_Survey_Step__c)
                                        )}
                                    </>
                                )}
                            </View>
                            {!readonly && item.Contract_Status__c !== 'Declined' && <CardMenuContainer item={item} />}
                        </TouchableOpacity>
                        {item.resetVisitObj && <View style={styles.cdaCardSep} />}
                    </View>
                    {item.resetVisitObj && (
                        <View key={item.resetVisitObj.Id}>
                            <View style={styles.cdaCardSubContainer}>
                                <View style={[styles.visitIconBox, commonStyle.flexRowCenter]}>
                                    <View style={[styles.visitIcon, commonStyle.flexRowCenter]}>
                                        <IconResetVisit style={{ height: 24, width: 19 }} />
                                    </View>
                                </View>
                                <View style={styles.cdaCardTextContainer}>
                                    <CText style={styles.visitDate}>
                                        {moment(item.resetVisitObj.Planned_Date__c).format(TIME_FORMAT.MMM_D_YYYY)}
                                    </CText>
                                    <CText style={styles.visitTitle}>{getVisitTitle(item.resetVisitObj)}</CText>
                                    <CText style={[styles.visitDate, styles.visitSubText]}>
                                        {getSubText(item.resetVisitObj)}
                                    </CText>
                                </View>
                                {item.resetVisitObj.Status__c !== VisitStatus.COMPLETE &&
                                    renderVisitStatusBadge(item.resetVisitObj)}
                            </View>
                        </View>
                    )}
                </View>
            ))}
        </View>
    )
}

export const AuditCDACard = ({
    list,
    readonly,
    isSpaceBreakdown = false,
    customerDetail = {},
    onEditAuditVisit,
    setRefreshFlag
}: AuditCardProps) => {
    const navigation: any = useNavigation()
    const getAuditCDACard = (elem: any, idx: number) => {
        const listLength = list.length - 1
        const isComplete = elem.Status__c === VisitStatus.COMPLETE
        const label = isComplete ? t.labels.PBNA_MOBILE_COMPLETED_BY : t.labels.PBNA_MOBILE_ASSIGNED_TO
        const name = elem.CreatedBy?.Name || ''
        let viewStyle, statusText, textStyle
        switch (elem.Status__c) {
            case VisitStatus.IN_PROGRESS:
                statusText = t.labels.PBNA_MOBILE_DRAFT
                viewStyle = [styles.visitBadge, styles.badgeCommon]
                textStyle = [styles.visitBadgeText]
                break
            case VisitStatus.IR_PROCESSING:
            case VisitStatus.PENDING_REVIEW:
                statusText =
                    elem.Status__c === VisitStatus.IR_PROCESSING
                        ? t.labels.PBNA_MOBILE_IR_PROCESSING.toLocaleUpperCase()
                        : t.labels.PBNA_MOBILE_PENDING_REVIEW.toLocaleUpperCase()
                viewStyle = [styles.visitBadge, styles.visitBadgeInProgress, styles.badgeCommon]
                textStyle = [styles.visitBadgeText, styles.visitBadgeTextInProgress]
                break
            default:
                statusText = t.labels.PBNA_MOBILE_COMPLETED
                viewStyle = [styles.visitBadge, styles.badgeCompleted, styles.badgeCommon, styles.displayNone]
                textStyle = [styles.visitBadgeText, styles.badgeTextCompleted]
        }
        const isStatusPill = [VisitStatus.IN_PROGRESS, VisitStatus.IR_PROCESSING].indexOf(elem.Status__c) > -1
        const isCompleteStyle = isComplete || isSpaceBreakdown ? null : styles.displayNone
        const nonCompliantStyles = elem.CDA_Compliance__c
            ? [styles.cancelledPill, styles.successPill, isCompleteStyle]
            : [styles.cancelledPill, styles.removePill, isCompleteStyle]
        const nonCompliantText = !elem.CDA_Compliance__c
            ? t.labels.PBNA_MOBILE_NON_COMPLIANT
            : t.labels.PBNA_MOBILE_COMPLIANT
        const isPostContractAudit = elem.Visit_Subtype__c === VisitSubType.POST_CONTRACT_AUDIT
        const medalMap = getMedalMap()
        const isMedal = medalMap[elem?.contractObj?.Signed_Medal_Tier__c]

        return (
            <TouchableOpacity
                disabled={!elem.CDA_Audit_Sharepoint_URL__c}
                style={{ flex: 1, flexDirection: 'row' }}
                onPress={() =>
                    navigation.navigate('ContractPDFPage', {
                        fileName: isPostContractAudit
                            ? t.labels.PBNA_MOBILE_POST_CDA_AUDIT
                            : t.labels.PBNA_MOBILE_GENERAL_AUDIT,
                        link: elem.CDA_Audit_Sharepoint_URL__c
                    })
                }
            >
                {isPostContractAudit && elem.contractObj ? (
                    <CDAStoreIcon item={elem.contractObj} />
                ) : (
                    <IMG_STORE_PLACEHOLDER width={50} height={50} style={styles.imgUserImage} />
                )}
                <View style={[styles.bottomBorder, idx === listLength ? styles.borderWhite : null]}>
                    <View style={[styles.cdaCardTextContainer]}>
                        {!isSpaceBreakdown ? (
                            <>
                                <View style={styles.historyCardSubContainer}>
                                    <CText style={styles.medalText}>
                                        {isPostContractAudit
                                            ? t.labels.PBNA_MOBILE_POST_CDA_AUDIT
                                            : t.labels.PBNA_MOBILE_GENERAL_AUDIT}
                                    </CText>
                                    {!!isMedal && (
                                        <CText style={nonCompliantStyles}>{nonCompliantText.toLocaleUpperCase()}</CText>
                                    )}
                                </View>
                                <View style={[commonStyle.flexDirectionRow, styles.detailStyle]}>
                                    <CText style={styles.dateString}>{label + ' '}</CText>
                                    <CText style={styles.font12}>{name}</CText>
                                    <CText style={styles.dateString}>{' | '}</CText>
                                    <CText style={styles.font12}>
                                        {moment(elem.LastModifiedDate).format(TIME_FORMAT.MMM_D_YYYY)}
                                    </CText>
                                </View>
                                <View style={viewStyle}>
                                    <CText style={textStyle}>{statusText}</CText>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.historyCardSubContainer}>
                                    <CText style={styles.medalText}>
                                        {customerDetail?.['Account.Name'] ||
                                            customerDetail?.Account?.Name ||
                                            customerDetail.name ||
                                            ''}
                                    </CText>
                                </View>
                                <View style={[commonStyle.flexDirectionRow, styles.detailStyle]}>
                                    <CText style={styles.dateString}>{getAddress(customerDetail)}</CText>
                                </View>
                                {isStatusPill ? (
                                    <View style={viewStyle}>
                                        <CText style={textStyle}>{statusText}</CText>
                                    </View>
                                ) : (
                                    <View style={[styles.historyCardSubContainer, { marginTop: 6 }]}>
                                        <CText style={nonCompliantStyles}>{nonCompliantText.toLocaleUpperCase()}</CText>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                    {!readonly && elem.Status__c !== VisitStatus.COMPLETE && (
                        <AuditCardMenuContainer
                            item={elem}
                            onEditAuditVisit={() => onEditAuditVisit && onEditAuditVisit(elem)}
                            setRefreshFlag={setRefreshFlag}
                        />
                    )}
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={[styles.cdaCardContainer, styles.cdaAuditCardContainer]}>
            {list.map((item, idx) => (
                <View key={item.Id} style={[styles.cdaCardSubContainer, isSpaceBreakdown ? styles.cdaShadow : null]}>
                    {getAuditCDACard(item, idx)}
                </View>
            ))}
        </View>
    )
}

const FutureCDAList = ({
    list,
    readonly,
    handleOpenContractPDF
}: {
    isFSCustomer?: boolean
    list: contractData[]
    readonly: boolean
    handleOpenContractPDF: (item: contractData) => void
}) => {
    if (!list.length) {
        return null
    }
    return (
        <View style={commonStyle.marginBottom_20}>
            <CText style={styles.cdaSectionTitle}>{t.labels.PBNA_MOBILE_FUTURE}</CText>
            <BasicCDACard list={list} readonly={readonly} handleOpenContractPDF={handleOpenContractPDF} />
        </View>
    )
}

const CurrentCDAList = ({
    list,
    readonly,
    handleOpenContractPDF,
    isFSCustomer
}: {
    list: contractData[]
    readonly: boolean
    handleOpenContractPDF: (item: contractData) => void
    isFSCustomer: boolean
}) => {
    const tabName = {
        All: _.capitalize(t.labels.PBNA_MOBILE_ALL),
        Beverage: t.labels.PBNA_MOBILE_BEVERAGE,
        Vending: t.labels.PBNA_MOBILE_VENDING,
        'Full Service Vending': t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING,
        Other: t.labels.PBNA_MOBILE_OTHER
    }
    const [activeTab, setActiveTab] = useState<keyof typeof tabName>('All')
    const [filteredList, setFilteredList] = useState<contractData[]>([])
    const [expandCurrent, setExpandCurrent] = useState(list.length > 0)
    const previousListLength = usePrevious(list.length)

    useEffect(() => {
        switch (activeTab) {
            case 'All':
                setFilteredList(list)
                break
            case 'Beverage':
                setFilteredList(list.filter((i) => i.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_BEVERAGE))
                break
            case 'Vending':
                setFilteredList(list.filter((i) => i.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_VENDING))
                break
            case 'Full Service Vending':
                setFilteredList(
                    list.filter((i) => i.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING)
                )
                break
            case 'Other':
                setFilteredList(list.filter((i) => i.Signed_Medal_Tier__c === t.labels.PBNA_MOBILE_OTHER))
                break
            default:
                break
        }
    }, [list, activeTab])
    useEffect(() => {
        !expandCurrent && previousListLength === 0 && list.length === 1 && setExpandCurrent(true)
    }, [list])
    return (
        <View style={commonStyle.marginBottom_20}>
            <CollapseContainer
                showContent={expandCurrent}
                setShowContent={setExpandCurrent}
                title={t.labels.PBNA_MOBILE_CURRENT}
            >
                {isFSCustomer && (
                    <ScrollView
                        style={{ backgroundColor: 'white' }}
                        horizontal
                        contentContainerStyle={{ paddingLeft: 22 }}
                        showsHorizontalScrollIndicator={false}
                    >
                        {_.entries(tabName).map(([k, tabName]) => {
                            const tabKey = k as typeof activeTab
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.checkItem,
                                        tabKey === activeTab && styles.selectedTab,
                                        { marginRight: 15 }
                                    ]}
                                    key={tabKey}
                                    onPress={() => setActiveTab(tabKey)}
                                >
                                    <CText
                                        style={[
                                            styles.historyTabText,
                                            tabKey === activeTab && styles.historyTabActiveText
                                        ]}
                                    >
                                        {tabName}
                                    </CText>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                )}
                {list.length > 0 ? (
                    <BasicCDACard
                        list={filteredList}
                        readonly={readonly}
                        handleOpenContractPDF={handleOpenContractPDF}
                    />
                ) : (
                    <View style={styles.emptyCurrentList}>
                        <View style={styles.placeholderTextContainer}>
                            {isFSCustomer && (
                                <Image
                                    source={ImageSrc.EMPTY_CDA_CUSTOMER}
                                    style={styles.noCurrentImg}
                                    resizeMode="contain"
                                />
                            )}
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_CURRENT_CONTRACT}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_NO_CURRENT_MESSAGE}</CText>
                        </View>
                    </View>
                )}
            </CollapseContainer>
        </View>
    )
}

const CurrentAuditList = ({ list, retailStore, onEditAuditVisit, setRefreshFlag }: EditAuditVisitsProps) => {
    const [expandCurrent, setExpandCurrent] = useState(true)
    return (
        <View style={commonStyle.marginBottom_20}>
            <CollapseContainer
                showContent={expandCurrent}
                setShowContent={setExpandCurrent}
                title={t.labels.PBNA_MOBILE_IN_PROGRESS}
            >
                {list.length > 0 ? (
                    <AuditCDACard
                        list={list}
                        readonly={false}
                        customerDetail={retailStore}
                        onEditAuditVisit={onEditAuditVisit}
                        setRefreshFlag={setRefreshFlag}
                    />
                ) : (
                    <View style={styles.emptyAuditC}>
                        <CText style={[styles.NoResultTitle, { textAlign: 'center' }]}>
                            {t.labels.PBNA_MOBILE_NO_CURRENT_AUDITS}
                        </CText>
                        <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_DRAFT_AUDIT_MESSAGE}</CText>
                    </View>
                )}
            </CollapseContainer>
        </View>
    )
}

const HistoryCardList = ({
    list,
    handleOpenContractPDF
}: {
    list: contractData[]
    handleOpenContractPDF: (item: contractData) => void
}) => {
    const getOpenPDFFuc = (item: contractData) => () => handleOpenContractPDF(item)
    return (
        <>
            {list.map((item) => (
                <View key={item.Id}>
                    <View>
                        <TouchableOpacity
                            disabled={!item.Sharepoint_URL__c || item.Contract_Status__c !== 'Signed'}
                            onPress={getOpenPDFFuc(item)}
                            style={styles.historyCardContainer}
                        >
                            <CDAStoreIcon item={item} />
                            <View style={commonStyle.flex_1}>
                                <View style={styles.historyCardSubContainer}>
                                    {renderSignMedalText(item)}
                                    {item.Contract_Status__c === 'Cancelled' && (
                                        <CText style={styles.cancelledPill}>
                                            {t.labels.PBNA_MOBILE_CANCELLED.toLocaleUpperCase()}
                                        </CText>
                                    )}
                                </View>
                                {renderDateString(
                                    t.labels.PBNA_MOBILE_CDA_CONTRACT_DURATION,
                                    moment(item.StartDate).format('MMM D, YYYY') +
                                        ' - ' +
                                        moment(item.EndDate).format('MMM D, YYYY')
                                )}
                            </View>
                        </TouchableOpacity>
                        {item.resetVisitObj && <View style={styles.cdaCardSep} />}
                    </View>
                    {item.resetVisitObj && (
                        <View key={item.resetVisitObj.Id} style={styles.cdaCardSubContainer}>
                            <View style={[styles.visitIconBox, commonStyle.flexRowCenter]}>
                                <View style={[styles.visitIcon, commonStyle.flexRowCenter]}>
                                    <IconResetVisit style={{ height: 24, width: 19 }} />
                                </View>
                            </View>
                            <View style={styles.cdaCardTextContainer}>
                                <CText style={styles.visitDate}>
                                    {moment(item.resetVisitObj.Planned_Date__c).format(TIME_FORMAT.MMM_D_YYYY)}
                                </CText>
                                <CText style={styles.visitTitle}>{getVisitTitle(item.resetVisitObj)}</CText>
                                <CText style={[styles.visitDate, styles.visitSubText]}>
                                    {getSubText(item.resetVisitObj)}
                                </CText>
                            </View>
                            {item.resetVisitObj.Status__c !== VisitStatus.COMPLETE &&
                                renderVisitStatusBadge(item.resetVisitObj)}
                        </View>
                    )}
                </View>
            ))}
        </>
    )
}

const HistoryTab = ({
    list,
    handleOpenContractPDF,
    isFSCustomer,
    isAuditTab,
    auditList,
    setRefreshFlag
}: {
    list: contractData[]
    handleOpenContractPDF: (item: contractData) => void
    isFSCustomer: boolean
    isAuditTab: boolean
    auditList: any[]
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
}) => {
    const tabName = isAuditTab
        ? {
              All: t.labels.PBNA_MOBILE_ALL,
              General: t.labels.PBNA_MOBILE_GENERAL,
              PostCDA: t.labels.PBNA_MOBILE_POST_CDA,
              NonCompliant: t.labels.PBNA_MOBILE_NON_COMPLIANT
          }
        : {
              All: _.capitalize(t.labels.PBNA_MOBILE_ALL),
              Expired: t.labels.PBNA_MOBILE_EXPIRED,
              Cancelled: t.labels.PBNA_MOBILE_CANCELLED,
              Declined: t.labels.PBNA_MOBILE_DECLINED
          }
    const previousListLength = usePrevious(isAuditTab ? auditList.length : list.length)
    const [expandHistory, setExpendHistory] = useState((isAuditTab ? auditList.length : list.length) > 0)
    const [activeTab, setActiveTab] = useState<keyof typeof tabName>('All')
    const [activeAuditTab, setActiveAuditTab] = useState<keyof typeof tabName>('All')
    const [filteredList, setFilteredList] = useState<contractData[]>([])
    const [filteredAuditList, setFilteredAuditList] = useState<any[]>([])
    const medalMap = getMedalMap()

    useEffect(() => {
        !expandHistory &&
            previousListLength === 0 &&
            (isAuditTab ? auditList.length : list.length) === 1 &&
            setExpendHistory(true)
    }, [list])

    useEffect(() => {
        switch (activeTab) {
            case 'All':
                setFilteredList(list)
                break
            case 'Expired':
                setFilteredList(
                    list.filter(
                        (i) => i.Contract_Status__c === 'Signed' && new Date(i.EndDate).getTime() < new Date().getTime()
                    )
                )
                break
            case 'Cancelled':
                setFilteredList(list.filter((i) => i.Contract_Status__c === 'Cancelled'))
                break
            case 'Declined':
                setFilteredList(list.filter((i) => i.Contract_Status__c === 'Declined'))
                break
            default:
                break
        }
    }, [list, activeTab])

    useEffect(() => {
        switch (activeAuditTab) {
            case 'General':
                setFilteredAuditList(
                    _.chain(auditList)
                        .filter((i) => i.Visit_Subtype__c === VisitSubType.GENERAL_AUDIT)
                        .orderBy('LastModifiedDate', 'desc')
                        .value()
                )
                break
            case 'PostCDA':
                setFilteredAuditList(
                    _.chain(auditList)
                        .filter((i) => i.Visit_Subtype__c === VisitSubType.POST_CONTRACT_AUDIT)
                        .orderBy('LastModifiedDate', 'desc')
                        .value()
                )
                break
            case 'NonCompliant':
                setFilteredAuditList(
                    _.chain(auditList)
                        .filter((i) => !i.CDA_Compliance__c && medalMap[i?.contractObj?.Signed_Medal_Tier__c])
                        .orderBy('LastModifiedDate', 'desc')
                        .value()
                )
                break
            default:
                setFilteredAuditList(auditList)
                break
        }
    }, [auditList, activeAuditTab])

    const getAuditCDACard = () => {
        return auditList.length > 0 ? (
            <AuditCDACard list={filteredAuditList} readonly setRefreshFlag={setRefreshFlag} />
        ) : (
            <EmptyListPlaceholder
                containerStyle={[styles.placeholderContainer, { backgroundColor: 'white' }]}
                sourceImageUrl={ImageSrc.EMPTY_CDA_CUSTOMER}
                imageContainer={styles.placeholderImageContainer}
                title={
                    <View style={[styles.placeholderTextContainer, commonStyle.marginBottom_22]}>
                        <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_NO_HISTORY_AUDIT}</CText>
                        <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_NO_HISTORY_AUDIT_MESSAGE}</CText>
                    </View>
                }
            />
        )
    }
    return (
        <CollapseContainer
            showContent={expandHistory}
            setShowContent={setExpendHistory}
            title={t.labels.PBNA_MOBILE_HISTORY}
        >
            {isAuditTab || list.length > 0 ? (
                <>
                    {((!isFSCustomer && !isAuditTab) || isAuditTab) && (
                        <ScrollView style={{ flex: 1 }} horizontal>
                            <View style={styles.checkItemContainer}>
                                {_.entries(tabName).map(([k, tabName]) => {
                                    const tabKey = k as typeof activeTab
                                    const tabValue = isAuditTab ? activeAuditTab : activeTab
                                    return (
                                        <TouchableOpacity
                                            style={[styles.checkItem, tabKey === tabValue && styles.selectedTab]}
                                            key={tabKey}
                                            onPress={() => {
                                                if (isAuditTab) {
                                                    setActiveAuditTab(tabKey)
                                                } else {
                                                    setActiveTab(tabKey)
                                                }
                                            }}
                                        >
                                            <CText
                                                style={[
                                                    styles.historyTabText,
                                                    tabKey === tabValue && styles.historyTabActiveText
                                                ]}
                                            >
                                                {tabName}
                                            </CText>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    )}
                    <View style={[styles.historyTabCardContainer, isAuditTab ? { paddingHorizontal: 0 } : null]}>
                        {isAuditTab ? (
                            getAuditCDACard()
                        ) : (
                            <HistoryCardList list={filteredList} handleOpenContractPDF={handleOpenContractPDF} />
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.emptyCurrentList}>
                    <View style={styles.placeholderTextContainer}>
                        <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_POTENTIAL_CONTRACT_HOLDER}</CText>
                        <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_NO_HISTORY_SUB_MESSAGE}</CText>
                    </View>
                </View>
            )}
        </CollapseContainer>
    )
}

const StartNewCDABtn = ({
    disableNewButton,
    readonly,
    setShowYearModalVisible,
    visitKpiIsGenerating,
    retailStore
}: {
    disableNewButton: boolean
    readonly: boolean
    setShowYearModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    visitKpiIsGenerating: boolean
    retailStore: any
}) => {
    const dispatch = useDispatch()
    const defaultYear = useSelector((state: any) => state.contractReducer.defaultYear)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)

    const onPressStartNewCDABtn = () => {
        if (!visitKpiIsGenerating) {
            const popSelectTheYear = () => {
                dispatch(setButtonClicked(ContractBtnType.START_NEW_CDA))
                dispatch(setCheckedYear(defaultYear[ContractBtnType.START_NEW_CDA].checkedYear))
                dispatch(setDisabledYear(defaultYear[ContractBtnType.START_NEW_CDA].disabledYear))
                // To avoid modal flicking
                setTimeout(() => setShowYearModalVisible(true))
            }
            createRetailVisitKPI({ ...customerDetail, ...retailStore }, dispatch, popSelectTheYear)
        }
    }

    return (
        <TouchableOpacity
            disabled={disableNewButton}
            style={[
                styles.newCDABtnContainer,
                !disableNewButton ? styles.newActiveBtn : styles.disabledBtn,
                readonly ? styles.readonlyNewBtnStyle : styles.nonReadonlyNewBtnStyle
            ]}
            onPress={onPressStartNewCDABtn}
        >
            <CText
                style={[styles.btnTitle, !disableNewButton ? styles.newActiveBtnText : styles.disabledBtnText]}
                numberOfLines={1}
            >
                {t.labels.PBNA_MOBILE_START_NEW.toLocaleUpperCase()}
            </CText>
            {visitKpiIsGenerating && <ActivityIndicator animating={visitKpiIsGenerating} style={{ marginLeft: 10 }} />}
        </TouchableOpacity>
    )
}

const CustomerDeclinedBtn = ({
    disableDeclineButton,
    setShowYearModalVisible,
    declinedCDALoading
}: {
    disableDeclineButton: boolean
    setShowYearModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    declinedCDALoading: boolean
}) => {
    const dispatch = useDispatch()
    const defaultYear = useSelector((state: any) => state.contractReducer.defaultYear)

    const getBtnViewStyle = () => (!disableDeclineButton ? styles.declinedActiveBtn : styles.disabledBtn)

    const getBtnTextStyle = () => {
        return !disableDeclineButton ? styles.declinedActiveBtnText : styles.disabledBtnText
    }

    return (
        <TouchableOpacity
            style={[styles.customerDeclinedBtnContainer, getBtnViewStyle()]}
            disabled={declinedCDALoading || disableDeclineButton}
            onPress={() => {
                dispatch(setButtonClicked(ContractBtnType.CUSTOMER_DECLINED))
                dispatch(setCheckedYear(defaultYear[ContractBtnType.CUSTOMER_DECLINED].checkedYear))
                dispatch(setDisabledYear(defaultYear[ContractBtnType.CUSTOMER_DECLINED].disabledYear))
                setShowYearModalVisible(true)
            }}
        >
            {declinedCDALoading && (
                <ActivityIndicator animating={declinedCDALoading} hidesWhenStopped style={{ marginRight: 10 }} />
            )}
            <CText numberOfLines={1} style={[styles.btnTitle, getBtnTextStyle()]}>
                {declinedCDALoading
                    ? t.labels.PBNA_MOBILE_LOADING.toLocaleUpperCase()
                    : t.labels.PBNA_MOBILE_CDA_CUSTOMER_DECLINED.toLocaleUpperCase()}
            </CText>
        </TouchableOpacity>
    )
}

const BtnGroup = (props: BtnGroupProps) => {
    const {
        disableNewButton,
        disableDeclineButton,
        readonly,
        setShowYearModalVisible,
        declinedCDALoading,
        visitKpiIsGenerating,
        retailStore
    } = props
    return (
        <View style={styles.groupBtnView}>
            <CustomerDeclinedBtn
                setShowYearModalVisible={setShowYearModalVisible}
                disableDeclineButton={disableDeclineButton}
                declinedCDALoading={declinedCDALoading}
            />
            <View style={styles.placeholderView} />
            <StartNewCDABtn
                visitKpiIsGenerating={visitKpiIsGenerating}
                setShowYearModalVisible={setShowYearModalVisible}
                disableNewButton={disableNewButton}
                readonly={readonly}
                retailStore={retailStore}
            />
        </View>
    )
}

const PostCDAAuditBtn = ({
    disabled,
    onPostCDAAudit,
    isPostCDAAuditLoading
}: {
    disabled: boolean
    onPostCDAAudit: any
    isPostCDAAuditLoading: boolean
}) => {
    return (
        <TouchableOpacity
            disabled={disabled || isPostCDAAuditLoading}
            style={[styles.customerDeclinedBtnContainer, disabled ? styles.disabledBtn : styles.newBorderBtn]}
            onPress={_.throttle(onPostCDAAudit, IntervalTime.FIVE_HUNDRED)}
        >
            <CText
                style={[styles.btnTitle, disabled ? styles.disabledBtnText : styles.newBorderBtnText]}
                numberOfLines={1}
            >
                {t.labels.PBNA_MOBILE_POST_CDA_AUDIT.toLocaleUpperCase()}
            </CText>
            {isPostCDAAuditLoading && (
                <ActivityIndicator animating={isPostCDAAuditLoading} style={{ marginLeft: 10 }} />
            )}
        </TouchableOpacity>
    )
}

const GeneralAuditBtn = ({
    disabled,
    onGeneralAudit,
    isGeneralAuditLoading
}: {
    disabled: boolean
    onGeneralAudit: any
    isGeneralAuditLoading: boolean
}) => {
    return (
        <TouchableOpacity
            disabled={disabled || isGeneralAuditLoading}
            style={[
                styles.newCDABtnContainer,
                disabled ? styles.disabledBtn : styles.newBorderBtn,
                styles.nonReadonlyNewBtnStyle
            ]}
            onPress={_.debounce(onGeneralAudit, IntervalTime.FIVE_HUNDRED)}
        >
            <CText
                style={[styles.btnTitle, disabled ? styles.disabledBtnText : styles.newBorderBtnText]}
                numberOfLines={1}
            >
                {t.labels.PBNA_MOBILE_GENERAL_AUDIT.toLocaleUpperCase()}
            </CText>
            {isGeneralAuditLoading && (
                <ActivityIndicator animating={isGeneralAuditLoading} style={{ marginLeft: 10 }} />
            )}
        </TouchableOpacity>
    )
}
const AuditBtnGroup = (props: AuditBtnGroupProps) => {
    const {
        disablePostCDAAuditBtn,
        disableGeneralAuditBtn,
        onGeneralAudit,
        onPostCDAAudit,
        isPostCDAAuditLoading,
        isGeneralAuditLoading
    } = props
    return (
        <View style={styles.groupBtnView}>
            <PostCDAAuditBtn
                onPostCDAAudit={onPostCDAAudit}
                isPostCDAAuditLoading={isPostCDAAuditLoading}
                disabled={disablePostCDAAuditBtn}
            />
            <View style={styles.placeholderView} />
            <GeneralAuditBtn
                onGeneralAudit={onGeneralAudit}
                isGeneralAuditLoading={isGeneralAuditLoading}
                disabled={disableGeneralAuditBtn}
            />
        </View>
    )
}

const CustomerContractTab: FC<CustomerContractTabProps> = (props) => {
    const {
        retailStore,
        activeTab: currentTab = 'CONTRACT',
        refreshFlag,
        editable = false,
        setRefreshFlag,
        cRef,
        defaultSuTab = ContractAndAuditSubTab.CONTRACT,
        setShowContractUploadBar,
        setOfflineLoading,
        offlineLoading
    } = props

    const isFSCustomer =
        retailStore['Account.BUSN_SGMNTTN_LVL_3_CDV__c'] === '003' ||
        retailStore?.Account?.BUSN_SGMNTTN_LVL_3_CDV__c === '003'

    const cdaBtnVisible = useCDABtnVisible(retailStore)
    const sharepointToken = useSharePointToken(true)
    const [activeSubTab, setActiveSubTab] = useState(defaultSuTab === ContractAndAuditSubTab.AUDIT ? 1 : 0)
    const readonly = !editable
    const dispatch = useDispatch()
    const { dropDownRef } = useDropDown()
    const navigation = useNavigation() as any
    const [selectedMission, setSelectedMission] = useState<string>('')
    const [showModalVisible, setShowModalVisible] = useState(false)
    const [showYearModalVisible, setShowYearModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPostCDAAuditLoading, setIsPostCDAAuditLoading] = useState(false)
    const [isGeneralAuditLoading, setIsGeneralAuditLoading] = useState(false)
    const [editVisitItem, setEditVisitItem] = useState(null)
    const [declinedCDALoading, setDeclinedCDALoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const surveyQuestionsModalVisible = useSelector((state: any) => state.contractReducer.surveyQuestionsModalVisible)
    const disableNewButton = useSelector((state: any) => state.contractReducer.disableNewButton)
    const visitKpiIsGenerating = useSelector((state: any) => state.contractReducer.visitKpiIsGenerating)
    const buttonBeingClicked = useSelector((state: any) => state.AuditReducer.buttonBeingClicked)
    const checkedYear = useSelector((state: any) => state.contractReducer.checkedYear)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)

    const isFocused = useIsFocused()
    const {
        disableDeclineButton,
        isPotentialCDACustomer,
        currentArr,
        futureArr,
        historyArr,
        missionArr,
        auditCurrentArr,
        auditHistoryArr,
        isPostAuditDisabled,
        isPostAuditTips,
        isGeneralAuditDisabled,
        auditValidContract,
        locProdId,
        postMissionId
    } = useContractTab(retailStore, readonly, refreshFlag, dropDownRef, isFocused)
    const handleOpenContractPDF = (contractPDFItem: contractData) => {
        const fileName =
            contractPDFItem?.RecordType?.Name === ContractRecordTypeName.RetailContracts
                ? t.labels.PBNA_MOBILE_RETAIL_STORE_CONTRACT
                : t.labels.PBNA_MOBILE_FOOD_SERVICE_CONTRACT
        navigation.navigate('ContractPDFPage', {
            fileName: fileName,
            link: contractPDFItem.Sharepoint_URL__c
        })
    }

    useShowContractUploadBar(futureArr, setShowContractUploadBar, customerDetail)

    const { pendingUploadContracts } = useCDAPendingUploads(futureArr)

    usePepsiCoPeriodCalendar()

    const menuContextVal = useMemo(() => {
        return {
            setRefreshFlag,
            retailStoreID: retailStore.Id,
            retailStore,
            locProdId
        }
    }, [retailStore, locProdId])

    const onCreateAuditVisit = async (strSubtype: string, setBtnLoading: Function) => {
        await createAuditVisit({
            customerDetail: retailStore,
            strSubtype,
            strContractId: auditValidContract,
            selectedMission,
            locProdId,
            setRefreshFlag,
            setIsLoading,
            setBtnLoading,
            dispatch,
            navigation,
            dropDownRef,
            setSelectedMission
        })
    }
    const onPostCDAAudit = () => {
        if (!isPostCDAAuditLoading) {
            dispatch(setButtonBeingClicked(ContractBtnType.POST_CDA_AUDIT))
            setIsPostCDAAuditLoading(true)
            onCreateAuditVisit(VisitSubType.POST_CONTRACT_AUDIT, setIsPostCDAAuditLoading)
        }
    }
    const onGeneralAudit = () => {
        dispatch(setButtonBeingClicked(ContractBtnType.GENERAL_AUDIT))
        if (isPostAuditTips) {
            Alert.alert('', t.labels.PBNA_MOBILE_GENERAL_AUDIT_TIPS, [
                {
                    text: `${t.labels.PBNA_MOBILE_CANCEL}`,
                    onPress: () => {}
                },
                {
                    text: `${t.labels.PBNA_MOBILE_PROCEED}`,
                    onPress: () => {
                        setShowModalVisible(true)
                    }
                }
            ])
        } else {
            setShowModalVisible(true)
        }
    }
    const unCheckCircle = () => {
        return <View style={stylesMission.uncheckCircleView} />
    }
    const handlePressCancel = () => {
        setShowModalVisible(false)
    }
    const onPressSaveMission = () => {
        if (buttonBeingClicked === ContractBtnType.EDIT_DRAFT) {
            editAuditVisit({
                customerDetail: retailStore,
                visit: editVisitItem,
                selectedMission,
                locProdId,
                setRefreshFlag,
                navigation,
                setSelectedMission
            })
        } else {
            onCreateAuditVisit(VisitSubType.GENERAL_AUDIT, setIsGeneralAuditLoading)
        }
        handlePressCancel()
    }
    const getSelectMissionModal = () => {
        return (
            <View style={styles.selectMissionModalBody}>
                <TouchableWithoutFeedback>
                    <View style={styles.childrenTitleView}>
                        <CText style={[stylesMission.childrenTitle]}>{t.labels.PBNA_MOBILE_SELECT_MISSION}</CText>
                    </View>
                </TouchableWithoutFeedback>
                <ScrollView directionalLockEnabled style={styles.scrollView}>
                    <TouchableWithoutFeedback>
                        <View style={styles.childrenBodyView}>
                            {missionArr.map((item) => (
                                <View key={item.Id} style={styles.checkBoxBottomLine}>
                                    <CheckBox
                                        key={item.Id}
                                        title={item.Mission_Name__c || ''}
                                        onPress={() => {
                                            setSelectedMission(item.Mission_Id_Value__c || '')
                                        }}
                                        checked={item.Mission_Id_Value__c === selectedMission}
                                        checkedIcon={
                                            <Image
                                                source={ImageSrc.IMG_CHECK_CIRCLE}
                                                style={stylesMission.checkedIcon}
                                            />
                                        }
                                        uncheckedIcon={unCheckCircle()}
                                        containerStyle={[styles.checkBoxContainerStyle]}
                                        textStyle={[stylesMission.radioLabel, { color: '#000' }]}
                                    />
                                </View>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
                <View>
                    <FormBottomButton
                        onPressCancel={handlePressCancel}
                        onPressSave={onPressSaveMission}
                        disableSave={!selectedMission}
                        rightButtonLabel={
                            buttonBeingClicked === ContractBtnType.EDIT_DRAFT
                                ? t.labels.PBNA_MOBILE_CONTINUE_AUDIT.toLocaleUpperCase()
                                : t.labels.PBNA_MOBILE_START_AUDIT.toLocaleUpperCase()
                        }
                        leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                        relative
                    />
                </View>
            </View>
        )
    }

    const onEditAuditVisit = async (visit: any) => {
        dispatch(setButtonBeingClicked(ContractBtnType.EDIT_DRAFT))
        try {
            if (visit.Visit_Subtype__c === VisitSubtypeEnum.POST_CONTRACT_AUDIT) {
                editAuditVisit({
                    customerDetail: retailStore,
                    visit,
                    selectedMission: '',
                    locProdId,
                    setRefreshFlag,
                    navigation,
                    setSelectedMission
                })
            } else {
                const params = {
                    strLocationId: retailStore?.['Account.LOC_PROD_ID__c'],
                    strAuditVisitId: visit.Id,
                    lstAuditVisitKPIs: [],
                    lstCDAVisitKPIs: []
                }
                const res = await restApexCommonCall('getCDAKpi/', 'POST', params)
                if (res.status === HttpStatusCode.Ok) {
                    const KPIData = res.data
                    if (!_.isEmpty(KPIData.mobileUniqueId)) {
                        editAuditVisit({
                            customerDetail: retailStore,
                            visit,
                            selectedMission,
                            locProdId,
                            setRefreshFlag,
                            navigation,
                            setSelectedMission
                        })
                    } else {
                        setEditVisitItem(visit)
                        setShowModalVisible(true)
                    }
                } else {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'onEditAuditVisit',
                        `Fetch audit data failure' ${getStringValue(res)}`
                    )
                }
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'onEditAuditVisit', `Fetch audit data failure' ${getStringValue(error)}`)
        }
    }

    const taskManager = async (sharepointToken: string) => {
        try {
            if (offlineLoading) {
                return
            }
            const state = await NetInfo.fetch()
            if (state.isInternetReachable) {
                // Pull all Remote's contracts
                // Check if it is Inprogress, upload it, if it is other status
                const customerUniqId =
                    retailStore?.['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c
                // only one Inprogress Contract
                const contractList = await getInprogressContracts(customerUniqId)
                // Pull the contract of the remote Inprogress, check whether there are any contracts that have not been uploaded locally, and return the ID if there are any
                const pendingContractId = await findUploadInprogressContract(contractList)
                const json = await AsyncStorage.getItem('NewCDAPendingUploads')
                const jobs = await JSON.parse(json || '{}')
                if (pendingContractId) {
                    const jobKey = pendingContractId
                    const result = await uploadOfflineContract(jobKey, sharepointToken)
                    if (result) {
                        delete jobs[jobKey]
                        await AsyncStorage.setItem('NewCDAPendingUploads', JSON.stringify(jobs))
                        await AsyncStorage.removeItem('PendingUploadCDA' + jobKey)
                        setShowSuccessModal(true)
                        setTimeout(() => {
                            setShowSuccessModal(false)
                        }, IntervalTime.ONE_THOUSAND)
                    } else {
                        Alert.alert(t.labels.PBNA_MOBILE_SUBMIT_CDA_FAIL)
                    }
                } else {
                    await deleteDataLocalIsNotInprogressContract()
                }
                setShowContractUploadBar(false)
                refreshCustomerDetailData(setRefreshFlag, customerDetail)
            } else {
                Alert.alert(t.labels.PBNA_MOBILE_CONTRACT_OFFLINE, undefined, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        onPress: () => {
                            setOfflineLoading(false)
                        }
                    },
                    {
                        text: t.labels.PBNA_MOBILE_RETRY,
                        onPress: () => {
                            try {
                                if (offlineLoading) {
                                    return
                                }
                                setOfflineLoading(true)
                                taskManager(sharepointToken)
                            } catch (error) {
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'CDAContract_taskManager_offline',
                                    `CDA contract upload task manager failed: ${ErrorUtils.error2String(error)}`
                                )
                            } finally {
                                setOfflineLoading(false)
                            }
                        }
                    }
                ])
            }
        } catch (error: any) {
            if (error?.error === HttpError.NETWORK_ERROR) {
                Alert.alert(t.labels.PBNA_MOBILE_LOW_CONNECTIVITY, undefined, [])
            }
            setOfflineLoading(false)
            storeClassLog(
                Log.MOBILE_ERROR,
                'CDAContract_taskManager',
                `CDA contract upload task manager failed: ${ErrorUtils.error2String(error)}`
            )
        }
    }

    useImperativeHandle(cRef, () => ({
        openSurveyQuestionsModalVisible: () => {
            dispatch(setSurveyQuestionsModalVisible(true))
        },
        onClickPushContract: () => {
            if (offlineLoading) {
                return
            }
            taskManager(sharepointToken)
        }
    }))

    const getFutureContractArr = (futureArr: contractData[]) => {
        // If the local contract is waiting to be uploaded, it will not be displayed on futureList
        if (_.isEmpty(pendingUploadContracts) || _.isEmpty(futureArr)) {
            return futureArr
        }
        const filterFutureArr = futureArr.filter(
            (item: contractData) =>
                item.Contract_Status__c !== ContractStatus.InProgress || !pendingUploadContracts?.[item.Id]
        )

        return filterFutureArr
    }

    if (currentTab === 'CONTRACT') {
        return (
            <>
                <View style={styles.container}>
                    <View
                        style={[
                            styles.tabContainer,
                            readonly && activeSubTab === StepNumVal.ZERO && styles.readonlyTabContainer
                        ]}
                    >
                        <SelectTab
                            listData={[
                                { name: t.labels.PBNA_MOBILE_CONTRACT.toLocaleUpperCase() },
                                { name: t.labels.PBNA_MOBILE_AUDIT.toLocaleUpperCase() }
                            ]}
                            changeTab={(tab: React.SetStateAction<number>) => {
                                setActiveSubTab(tab)
                            }}
                            activeTab={activeSubTab}
                        />
                    </View>
                    {activeSubTab === StepNumVal.ZERO && (
                        <>
                            {isFSCustomer && (
                                <View style={[{ marginBottom: 30 }, !readonly && { marginTop: 30 }]}>
                                    <TouchableOpacity
                                        style={styles.uploadFSContract}
                                        onPress={() =>
                                            navigation.navigate('UploadFSContract', {
                                                retailStore,
                                                setRefreshFlag
                                            })
                                        }
                                    >
                                        <CText style={styles.uploadFSContractText}>
                                            {t.labels.PBNA_MOBILE_UPLOAD_CONTRACT.toLocaleUpperCase()}
                                        </CText>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!readonly && cdaBtnVisible && (
                                <BtnGroup
                                    visitKpiIsGenerating={visitKpiIsGenerating}
                                    disableNewButton={disableNewButton}
                                    disableDeclineButton={disableDeclineButton}
                                    readonly={readonly}
                                    setShowYearModalVisible={setShowYearModalVisible}
                                    declinedCDALoading={declinedCDALoading}
                                    retailStore={retailStore}
                                />
                            )}
                            {!readonly && !isFSCustomer && (
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('UploadContract', {
                                            retailStore,
                                            setRefreshFlag
                                        })
                                    }}
                                    style={[styles.uploadContractC, cdaBtnVisible && styles.cdaBtnVisible]}
                                >
                                    <Image
                                        style={styles.uploadIcon}
                                        source={require('../../../../../assets/image/icon-upload.png')}
                                    />
                                    <CText style={styles.uploadText}>
                                        {t.labels.PBNA_MOBILE_UPLOAD_CONTRACT.toLocaleUpperCase()}
                                    </CText>
                                </TouchableOpacity>
                            )}
                            {!(!readonly && retailStore['Account.IsOTSCustomer__c'] === '1') &&
                                CommonParam.PERSONA__c !== Persona.MERCHANDISER && (
                                    <View style={commonStyle.marginTop_30} />
                                )}
                            {isPotentialCDACustomer ? (
                                <EmptyListPlaceholder
                                    containerStyle={styles.placeholderContainer}
                                    sourceImageUrl={ImageSrc.EMPTY_CDA_CUSTOMER}
                                    imageContainer={styles.placeholderImageContainer}
                                    title={
                                        <View style={styles.placeholderTextContainer}>
                                            <CText style={styles.NoResultTitle}>
                                                {t.labels.PBNA_MOBILE_CDA_POTENTIAL}
                                            </CText>
                                            <CText style={styles.NoResultContent}>
                                                {t.labels.PBNA_MOBILE_CDA_POTENTIAL_MESSAGE}
                                            </CText>
                                        </View>
                                    }
                                />
                            ) : (
                                <menuContext.Provider value={menuContextVal}>
                                    <FutureCDAList
                                        readonly={readonly}
                                        list={getFutureContractArr(futureArr)}
                                        handleOpenContractPDF={handleOpenContractPDF}
                                    />
                                    <CurrentCDAList
                                        readonly={readonly}
                                        list={currentArr}
                                        handleOpenContractPDF={handleOpenContractPDF}
                                        isFSCustomer={isFSCustomer}
                                    />
                                    <HistoryTab
                                        list={historyArr}
                                        handleOpenContractPDF={handleOpenContractPDF}
                                        isFSCustomer={isFSCustomer}
                                        auditList={[]}
                                        isAuditTab={false}
                                        setRefreshFlag={setRefreshFlag}
                                    />
                                </menuContext.Provider>
                            )}
                        </>
                    )}
                    {activeSubTab === StepNumVal.ONE && (
                        <AuditBtnGroup
                            onGeneralAudit={onGeneralAudit}
                            onPostCDAAudit={onPostCDAAudit}
                            isPostCDAAuditLoading={isPostCDAAuditLoading}
                            isGeneralAuditLoading={isGeneralAuditLoading}
                            disablePostCDAAuditBtn={
                                isPostAuditDisabled || isLoading || _.isEmpty(postMissionId) || isPostCDAAuditLoading
                            }
                            disableGeneralAuditBtn={
                                isGeneralAuditDisabled || _.isEmpty(missionArr) || isLoading || isGeneralAuditLoading
                            }
                        />
                    )}
                    {activeSubTab === StepNumVal.ONE && (
                        <menuContext.Provider value={menuContextVal}>
                            <CurrentAuditList
                                onEditAuditVisit={onEditAuditVisit}
                                list={auditCurrentArr || []}
                                retailStore={retailStore}
                                setRefreshFlag={setRefreshFlag}
                            />
                            <HistoryTab
                                setRefreshFlag={setRefreshFlag}
                                list={[]}
                                auditList={auditHistoryArr}
                                isFSCustomer={isFSCustomer}
                                handleOpenContractPDF={handleOpenContractPDF}
                                isAuditTab
                            />
                        </menuContext.Provider>
                    )}
                    {surveyQuestionsModalVisible && <SurveyQuestionsModal setRefreshFlag={setRefreshFlag} />}
                </View>
                <Modal animationType="slide" transparent visible={showModalVisible}>
                    <TouchableOpacity activeOpacity={1} style={styles.centeredView} onPressOut={handlePressCancel}>
                        <SafeAreaView style={styles.safeAreaView}>
                            <SelectYearModalHeader
                                title={
                                    buttonBeingClicked === ContractBtnType.EDIT_DRAFT
                                        ? t.labels.PBNA_MOBILE_CONTINUE_GENERAL_AUDIT.toLocaleUpperCase()
                                        : t.labels.PBNA_MOBILE_START_GENERAL_AUDIT.toLocaleUpperCase()
                                }
                            />
                            {getSelectMissionModal()}
                        </SafeAreaView>
                    </TouchableOpacity>
                </Modal>

                <CDASuccessModal
                    modalVisible={showSuccessModal}
                    message={t.labels.PBNA_MOBILE_CONTRACT_SUBMIT_SUCCESSFULLY}
                />

                <Modal animationType="slide" transparent visible={showYearModalVisible}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.centeredView}
                        onPressOut={() => {
                            setShowYearModalVisible(false)
                        }}
                    >
                        <SafeAreaView style={styles.safeAreaView}>
                            <SelectYearModalHeader />
                            <SelectYearModalChildren
                                setShowYearModalVisible={setShowYearModalVisible}
                                setRefreshFlag={setRefreshFlag}
                                setDeclinedCDALoading={setDeclinedCDALoading}
                                declinedCDALoading={declinedCDALoading}
                                checkedYear={checkedYear}
                                dropDownRef={dropDownRef}
                                retailStore={{ ...customerDetail, ...retailStore }}
                            />
                        </SafeAreaView>
                    </TouchableOpacity>
                </Modal>
            </>
        )
    }
    return null
}

export default CustomerContractTab
