import React, { FC, useState, useEffect, useRef, RefObject } from 'react'
import { Button, Input, LinearProgress } from 'react-native-elements'
import { Alert, Image, Linking, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { useNavigation } from '@react-navigation/native'
import { FORMStatusEnum, IntervalTime, VisitSubtypeEnum } from '../../../../enums/Contract'
import CText from '../../../../../common/components/CText'
import { useMissionId } from '../../../../hooks/AuditHooks'
import { RealogramFORMCard } from '../../../common/FORMCard'
import { handlePressFormBtnHelper } from '../../../../helper/rep/StartNewCDAHelper'
import { useSelector } from 'react-redux'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CollapseContainer from '../../../common/CollapseContainer'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import PickerTile from '../../lead/common/PickerTile'
import { DatePickerLegacy } from '../../../common/DatePicker'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import dayjs from 'dayjs'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { restApexCommonCall, restDataCommonCall } from '../../../../api/SyncUtils'
import { Log } from '../../../../../common/enums/Log'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { useUpdateLocalRealogramFormStatus } from '../../../../hooks/StartNewCDAHooks'
import { InStoreLocationPickListValue, VisitStatus } from '../../../../enums/Visit'
import {
    deleteStockingLocation,
    handleSaveInStoreLocation,
    handleUpdateInStoreLocation
} from '../../../../helper/rep/RealogramHelper'
import { CommonApi } from '../../../../../common/api/CommonApi'
import FORMIconBlue from '../../../../../../assets/image/icon-form-blue.svg'
import { equipmentModalStyle } from '../equipment-tab/InstallRequestModal'
import { useListenRealogramFormUrl, useVisitDetails } from '../../../../hooks/RealogramHooks'
import { styles as FormBottomButtonStyles } from '../../../../../common/components/FormBottomButton'
import HeaderCircle from '../../lead/HeaderCircle'
import { DebouncedButton } from '../../../../../common/components/Button'
import Loading from '../../../../../common/components/Loading'
const Styles = StyleSheet.create({
    ...equipmentModalStyle,
    ...SurveyQuestionsStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        marginTop: 15,
        justifyContent: 'space-between',
        width: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: '900'
    },
    editPosition: {
        marginLeft: 22,
        flexDirection: 'row',
        alignItems: 'center',
        height: 60
    },
    addPositionHitSlop: {
        top: -10,
        bottom: -10
    },
    blueBoldText12: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    optionalText: {
        marginLeft: 5,
        color: baseStyle.color.titleGray
    },
    bluePositionIcon: {
        height: 21,
        width: 18,
        marginRight: 10
    },
    blueCameraIcon: {
        height: 13,
        width: 16,
        marginRight: 10
    },
    stockingLocationTitle: {
        ...SurveyQuestionsStyle.contentFieldTitle,
        marginTop: 20
    },
    stockingLocationContent: {
        paddingHorizontal: 22
    },
    pickerLabel: {
        ...SurveyQuestionsStyle.contentFieldTitle
    },
    pickContainerStyle: {
        marginTop: 40
    },
    startTime: {
        width: 165,
        flexDirection: 'row',
        marginTop: 40
    },
    specialInstructionsContainer: {
        marginTop: 40,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    realogramInputContainerStyle: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },
    realogramTableRowInputStyle: {
        fontSize: 12,
        margin: 'auto'
    },
    specialInstructionsTitle: {
        ...SurveyQuestionsStyle.contentFieldTitle
    },
    errorStyle: {
        marginTop: -20,
        marginBottom: 20,
        color: 'red',
        fontSize: 12,
        fontWeight: '400'
    },
    buttonWithRedLine: {
        borderColor: '#EB445A'
    },
    buttonWithLine: { height: 44, borderWidth: 1, borderRadius: 6 },
    buttonWithRedLineText: {
        color: '#EB445A'
    },
    buttonWithRedLineView: {
        marginLeft: 29,
        marginRight: 29,
        marginTop: 31,
        marginBottom: 50
    },
    buttonWithGreyLine: {
        borderColor: '#D3D3D3'
    },
    buttonWithLineText: { fontSize: 12, fontWeight: 'bold', lineHeight: 14 },
    buttonWithGreyLineText: {
        color: '#D3D3D3'
    }
})

interface RealogramScreenProps {
    navigation: any
    route: any
}

type StatusMap = {
    [key: string]: {
        [key: string]: FORMStatusEnum
    }
}

export type realogramFormStatus =
    | FORMStatusEnum.NOT_START
    | FORMStatusEnum.IR_PROCESSING_WITH_EDIT_TAG
    | FORMStatusEnum.IR_PROCESSING_WITHOUT_EDIT_TAG
    | FORMStatusEnum.PENDING_REVIEW_WITH_EDIT_TAG
    | FORMStatusEnum.PENDING_REVIEW_WITHOUT_EDIT_TAG

export interface VisitDetail {
    Id: string
    // eslint-disable-next-line camelcase
    Tag_Edit_Deep_Link__c: boolean
    // eslint-disable-next-line camelcase
    Mobile_Unique_ID__c: string
    // eslint-disable-next-line camelcase
    Status__c: VisitStatus | ''
    // eslint-disable-next-line camelcase
    Mission_Response_ID__c: ''
}

const filterOptionsMap = () => {
    return {
        [' -- ' + t.labels.PBNA_MOBILE_STOCKING_LOCATION + ' -- ']: '',
        [t.labels.PBNA_MOBILE_CONTRACT_COLD_VAULT]: 'Cold Vault'
    }
}

function handleTagEditsRealogramDeepLink(missionResponseID: string) {
    const callBackUrl = CommonApi.PBNA_MOBILE_SAVVY_SCHEME + missionResponseID
    const completionTrigger = encodeURIComponent(`{"action_type":"url_redirect","value":"${callBackUrl}"}`)
    const formUrl = `${CommonApi.PBNA_MOBILE_GO_SPOT_CHECK_URL}/mission_responses/${missionResponseID}/scenes?completion_trigger=${completionTrigger}`
    Linking.canOpenURL(formUrl)
        .then((supported) => {
            if (supported) {
                Linking.openURL(formUrl)
            } else {
                // If there is no GSC APP , The 'supported' would be false
                Linking.openURL(CommonApi.PBNA_MOBILE_GSP_APP_STORE_URL)
            }
        })
        .catch((err) => {
            storeClassLog(
                Log.MOBILE_ERROR,
                'RealogramScreen-handleTagEditsRealogramDeepLink',
                `Open form app failed,please check info list:${ErrorUtils.error2String(err)}`
            )
        })
}

const RealogramScreen: FC<RealogramScreenProps> = (props: RealogramScreenProps) => {
    const customerDetail = props.route.params.customerDetail
    const isFromNotification = props.route.params.isFromNotification
    const [visitId, setVisitId] = useState('')
    const { missionId, GSCId } = useMissionId(VisitSubtypeEnum.REALOGRAM, '', customerDetail) // this type do not need selected mission id
    const [stateSave, setStateSave] = useState(true)
    const [showStockingContainer, setShowStockingContainer] = useState(false)
    const [visitStatus, setVisitStatus] = useState(VisitStatus.IN_PROGRESS)
    const [clickDeepLink, setClickDeepLink] = useState(false)
    const [clickSaveDeepLink, setClickSaveDeepLink] = useState(false)
    const [realogramData, setRealogramData] = useState('')
    const [realogramCreateDate, setRealogramCreateDate] = useState('')
    const [visitDetails, setVisitDetails] = useState<VisitDetail>({
        Id: '',
        Tag_Edit_Deep_Link__c: false,
        Mobile_Unique_ID__c: '',
        Status__c: '',
        Mission_Response_ID__c: ''
    })
    const [formStatus, setFormStatus] = useState<FORMStatusEnum>(FORMStatusEnum.NOT_START)
    const [isEditForm, setIsEditForm] = useState<boolean>(false)
    const navigation: any = useNavigation()
    const [hasDateError, setHasDateError] = useState(false)
    const strLocationId = customerDetail?.Account?.LOC_PROD_ID__c || customerDetail?.['Account.LOC_PROD_ID__c']
    let strVisitStatus = ''
    const strRetailStoreId = customerDetail.Id
    const strRetailStoreName = customerDetail.Name
    const [startTime, setStartTime] = useState(dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD))
    const [endTime, setEndTime] = useState('')
    const [stockingDateDefValue, setStockingDateDefValue] = useState('')
    const [sellDefValue, setSellDateDefValue] = useState('')
    const [descriptionMessage, setDescriptionMessage] = useState('')
    const [strRealogramVisitId, setStrRealogramVisitId] = useState('')
    const [strVisitInStoreLocationId, setStrVisitInStoreLocationId] = useState('')
    const [strInStoreLocationId, setStrInStoreLocationId] = useState('')
    const [loading, setLoading] = useState(false)
    const [showEditPosition] = useState(false)
    const [showTakePicture] = useState(false)
    const stockRef: RefObject<any> = useRef(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDisableDeleteStockingLocation, setIsDisableDeleteStockingLocation] = useState(true)
    const contractReducer = (state: any) => state.contractReducer
    const contract = useSelector(contractReducer)
    const needUpdateFormStatus = contract.needUpdateFormStatus // judge if need to change the form status when user is on the offline mode
    const judgeClickDeepLink = (vStatus: string) => {
        if (
            vStatus === VisitStatus.IR_PROCESSING ||
            vStatus === VisitStatus.PENDING_REVIEW ||
            vStatus === VisitStatus.COMPLETE
        ) {
            setClickDeepLink(true)
        }
    }
    const getStoreProduct = async (strInStoreLocationId: string) => {
        try {
            const path = `query/?q=SELECT Id,Name,ProductId,InStoreLocationId FROM StoreProduct where InStoreLocationId in ('${strInStoreLocationId}')`
            const getStoreProductRes = await restDataCommonCall(path, 'GET')
            const storeProductArr = [...getStoreProductRes.data.records]
            setIsDisableDeleteStockingLocation(storeProductArr.length > 0 || !strInStoreLocationId)
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, `getStoreProduct`, `Get Data Fail` + ErrorUtils.error2String(error))
        }
    }
    const getCheckData = async (strLocationId: string, strRetailStoreId: string, strRetailStoreName: string) => {
        try {
            setIsLoading(true)
            const res = await restApexCommonCall(CommonApi.PBNA_MOBILE_API_REALOGRAM_VISIT, 'POST', {
                strLocationId: strLocationId,
                strRetailStoreId: strRetailStoreId,
                strRetailStoreName: strRetailStoreName
            })

            if (!_.isEmpty(res?.data)) {
                const resFirst = JSON.parse(res?.data)
                const resSecond = resFirst?.objData
                const foundEntries = Object.entries(filterOptionsMap()).filter(
                    // Because my item must be in the form of [key, value]
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([_, value]) => value === resSecond.strCategory
                )
                // Because my item must be in the form of [key, value]
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const foundKeys = foundEntries.map(([key, _]) => key)
                setVisitId(resSecond?.strRealogramVisitId)
                setVisitStatus(resSecond?.strStatus)
                setRealogramData(resSecond?.strRealogramJSON)
                setRealogramCreateDate(resSecond?.strCreatedDate)
                strVisitStatus = resSecond?.strStatus
                judgeClickDeepLink(resSecond?.strStatus)
                stockRef.current.setValue(foundKeys[0] || t.labels.PBNA_MOBILE_CONTRACT_COLD_VAULT)
                setStockingDateDefValue(filterOptionsMap()[foundKeys[0]] || InStoreLocationPickListValue.COLD_VAULT)
                setSellDateDefValue(resSecond.strSellDownMethod)
                if (resSecond.strStartDate) {
                    setStartTime(resSecond.strStartDate)
                }
                setEndTime(resSecond.strEndDate)
                setStrRealogramVisitId(resSecond.strRealogramVisitId)
                setStrVisitInStoreLocationId(resSecond.strVisitInStoreLocationId)
                setStrInStoreLocationId(resSecond.strInStoreLocationId)
                await getStoreProduct(resSecond.strInStoreLocationId)
                setDescriptionMessage(resSecond.strDescription)
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, `Upload-Audit-Contract`, `Check Data Fail` + ErrorUtils.error2String(error))
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        getCheckData(strLocationId, strRetailStoreId, strRetailStoreName)
    }, [])

    useVisitDetails(visitId, setVisitDetails, setIsEditForm)

    useEffect(() => {
        const tagEdit: boolean = visitDetails.Tag_Edit_Deep_Link__c
        const visitStatus = visitDetails.Status__c

        const statusMap: StatusMap = {
            [VisitStatus.IN_PROGRESS]: {
                true: FORMStatusEnum.START,
                false: FORMStatusEnum.START
            },
            [VisitStatus.IR_PROCESSING]: {
                true: FORMStatusEnum.IR_PROCESSING_WITH_EDIT_TAG,
                false: FORMStatusEnum.IR_PROCESSING_WITHOUT_EDIT_TAG
            },
            [VisitStatus.PENDING_REVIEW]: {
                true: FORMStatusEnum.PENDING_REVIEW_WITH_EDIT_TAG,
                false: FORMStatusEnum.PENDING_REVIEW_WITHOUT_EDIT_TAG
            }
        }

        const formStatus = statusMap[visitStatus]?.[tagEdit.toString()] || FORMStatusEnum.NOT_START
        setFormStatus(formStatus)
    }, [visitDetails])

    useListenRealogramFormUrl(visitId, setVisitStatus, isEditForm, setVisitDetails, visitDetails)
    useUpdateLocalRealogramFormStatus(visitStatus, needUpdateFormStatus, setVisitStatus)
    useEffect(() => {
        judgeClickDeepLink(strVisitStatus)
        if (
            (clickSaveDeepLink && startTime && stockingDateDefValue) ||
            (clickDeepLink && startTime && stockingDateDefValue)
        ) {
            setStateSave(false)
        } else {
            setStateSave(true)
        }
        setHasDateError(moment(startTime).isAfter(moment(endTime)))
    }, [startTime, endTime, stockingDateDefValue, sellDefValue, clickSaveDeepLink, clickDeepLink, visitStatus])
    const handlePressRealogramFormBtn = () => {
        if (formStatus === FORMStatusEnum.PENDING_REVIEW_WITHOUT_EDIT_TAG) {
            return handleTagEditsRealogramDeepLink(visitDetails.Mission_Response_ID__c)
        }
        setClickSaveDeepLink(true)
        // Jump into the link
        handlePressFormBtnHelper(
            customerDetail,
            visitId,
            missionId,
            GSCId,
            () => {},
            true,
            visitDetails.Mobile_Unique_ID__c
        )
    }

    const handlePressSave = async () => {
        setStateSave(true)
        setLoading(true)
        try {
            if (strInStoreLocationId || strInStoreLocationId !== strVisitInStoreLocationId) {
                await handleUpdateInStoreLocation({
                    inStoreLocationId: strInStoreLocationId,
                    strVisitInStoreLocationId: strVisitInStoreLocationId,
                    startTime: startTime,
                    endTime: endTime,
                    description: descriptionMessage,
                    category: stockingDateDefValue,
                    sellDownMethod: sellDefValue,
                    retailStoreId: strRetailStoreId,
                    strRetailStoreName: strRetailStoreName,
                    visitId: strRealogramVisitId
                })
            } else {
                await handleSaveInStoreLocation({
                    realogramVisit: visitId,
                    startTime: startTime,
                    endTime: endTime,
                    description: descriptionMessage,
                    category: stockingDateDefValue,
                    sellDownMethod: sellDefValue,
                    retailStoreId: strRetailStoreId,
                    strRetailStoreName: strRetailStoreName,
                    visitId: strRealogramVisitId
                })
            }
            navigation.goBack()
        } catch (err) {
            Alert.alert(t.labels.PBNA_MOBILE_REALOGRAM_FORM_ERROR_MESSAGE)
            storeClassLog(
                Log.MOBILE_ERROR,
                `RealogramScreen-PressSave`,
                `PressSave Fail` + ErrorUtils.error2String(err)
            )
        } finally {
            setStateSave(false)
            setLoading(false)
        }
    }

    const navigateToRealogramView = () => {
        navigation.navigate('RealogramView', {
            realogramData,
            visitId,
            realogramCreateDate,
            customerDetail
        })
    }

    const handleDeleteStockingLocation = () => {
        if (strInStoreLocationId) {
            Alert.alert(
                t.labels.PBNA_MOBILE_DELETE_STOCKING_LOCATION,
                t.labels.PBNA_MOBILE_DELETE_STOCKING_LOCATION_DESCRIPTION,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        onPress: () => {}
                    },
                    {
                        text: t.labels.PBNA_MOBILE_DELETE,
                        style: 'destructive',
                        onPress: async () => {
                            await deleteStockingLocation(visitId, strInStoreLocationId)
                            navigation.goBack()
                        }
                    }
                ]
            )
        }
    }
    const headerCircleClick = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_EXIT_STOCKING_LOCATION,
            t.labels.PBNA_MOBILE_EXIT_STOCKING_LOCATION_DESCRIPTION,
            [
                {
                    text: t.labels.PBNA_MOBILE_SAVE_EXIT,
                    onPress: () => {
                        if (startTime && stockingDateDefValue) {
                            handlePressSave()
                        } else {
                            Alert.alert(t.labels.PBNA_MOBILE_FILL_REQUIRED_FIELDS_ALERT)
                        }
                    }
                },
                {
                    text: t.labels.PBNA_MOBILE_EXIT_WITHOUT_SAVING,
                    style: 'destructive',
                    onPress: () => {
                        navigation.goBack()
                    }
                },
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                }
            ]
        )
    }
    return (
        <SafeAreaView style={Styles.container}>
            <View style={Styles.titleContainer}>
                <CText style={Styles.title}>{t.labels.PBNA_MOBILE_EDIT_STOCKING_LOCATION}</CText>
                <HeaderCircle
                    onPress={() => headerCircleClick()}
                    transform={[{ scale: 0.85 }, { rotate: '45deg' }]}
                    color={'#0098D4'}
                />
            </View>
            <KeyboardAwareScrollView extraHeight={-20}>
                <RealogramFORMCard
                    formStatus={formStatus}
                    handlePressRealogramFormBtn={handlePressRealogramFormBtn}
                    missionResponseIDReady={!!visitDetails.Mission_Response_ID__c}
                />
                {[FORMStatusEnum.PENDING_REVIEW_WITH_EDIT_TAG].includes(formStatus) && (
                    <View>
                        <TouchableOpacity style={Styles.editPosition} onPress={navigateToRealogramView}>
                            <FORMIconBlue style={Styles.blueCameraIcon} />
                            <CText style={Styles.blueBoldText12}>
                                {t.labels.PBNA_MOBILE_VIEW_EDIT_REALOGRAM.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>
                )}
                {showEditPosition && (
                    <TouchableOpacity hitSlop={Styles.addPositionHitSlop} style={Styles.editPosition}>
                        <Image style={Styles.bluePositionIcon} source={ImageSrc.ICON_LOCATION} />
                        <CText style={Styles.blueBoldText12}>
                            {t.labels.PBNA_MOBILE_EDIT_STOCKING_EDIT_POSITION.toLocaleUpperCase()}
                        </CText>
                        <CText style={Styles.optionalText}>{t.labels.PBNA_MOBILE_OPTIONAL}</CText>
                    </TouchableOpacity>
                )}
                {showTakePicture && (
                    <TouchableOpacity hitSlop={Styles.addPositionHitSlop} style={Styles.editPosition}>
                        <Image style={Styles.blueCameraIcon} source={ImageSrc.IMG_CAMERA1} />
                        <CText style={Styles.blueBoldText12}>
                            {t.labels.PBNA_MOBILE_PRIORITY_TAKE_A_PICTURE.toLocaleUpperCase()}
                        </CText>
                        <CText style={Styles.optionalText}>{t.labels.PBNA_MOBILE_OPTIONAL}</CText>
                    </TouchableOpacity>
                )}
                <View style={[Styles.stockingLocationTitle, Styles.stockingLocationContent]}>
                    <PickerTile
                        label={t.labels.PBNA_MOBILE_STOCKING_LOCATION}
                        data={Object.keys(filterOptionsMap())}
                        placeholder={''}
                        title={''}
                        disabled={false}
                        defValue={stockingDateDefValue}
                        cRef={stockRef}
                        required={false}
                        labelStyle={Styles.pickerLabel}
                        pickContainerStyle
                        onChange={(v: string) => {
                            setStockingDateDefValue(filterOptionsMap()[v])
                        }}
                    />
                    <PickerTile
                        label={t.labels.PBNA_MOBILE_SELL_DOWN_METHOD}
                        data={[' -- ' + t.labels.PBNA_MOBILE_SELL_DOWN_METHOD + ' -- ']}
                        placeholder={''}
                        title={''}
                        disabled
                        defValue={sellDefValue}
                        required={false}
                        labelStyle={Styles.pickerLabel}
                        pickContainerStyle={Styles.pickContainerStyle}
                    />
                    <View style={commonStyle.flexRowSpaceBet}>
                        <View style={Styles.startTime}>
                            <View style={{ flex: 1 }}>
                                <DatePickerLegacy
                                    minimumDate={new Date(0)}
                                    fieldLabel={t.labels.PBNA_MOBILE_START_DATE}
                                    value={startTime}
                                    onChange={(v: Date) => {
                                        const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                        setStartTime(date)
                                    }}
                                />
                            </View>
                        </View>
                        <View style={Styles.startTime}>
                            <View style={{ flex: 1 }}>
                                <DatePickerLegacy
                                    minimumDate={new Date(0)}
                                    fieldLabel={t.labels.PBNA_MOBILE_END_DATE}
                                    value={endTime}
                                    onChange={(v: Date) => {
                                        const date = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                        setEndTime(date)
                                    }}
                                    disabled
                                />
                            </View>
                        </View>
                    </View>
                    {hasDateError && <CText style={Styles.errorStyle}>{t.labels.PBNA_MOBILE_DATE_ERROR_MESSAGE}</CText>}
                    <View style={Styles.specialInstructionsContainer}>
                        <CText style={Styles.specialInstructionsTitle}>
                            {t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS_OPTIONAL}
                        </CText>
                        <Input
                            value={descriptionMessage}
                            placeholder={''}
                            multiline
                            maxLength={1000}
                            onChangeText={(v: string) => {
                                setDescriptionMessage(v)
                            }}
                            inputContainerStyle={Styles.realogramInputContainerStyle}
                            inputStyle={Styles.realogramTableRowInputStyle}
                        />
                    </View>
                </View>
                <CollapseContainer
                    preload
                    showContent={showStockingContainer}
                    setShowContent={setShowStockingContainer}
                    title={t.labels.PBNA_MOBILE_STOCKING_LOCATION_PRODUCTS}
                />
                <View style={Styles.buttonWithRedLineView}>
                    <DebouncedButton
                        disabled={isDisableDeleteStockingLocation}
                        onPress={handleDeleteStockingLocation}
                        style={[
                            commonStyle.flexRowCenter,
                            Styles.buttonWithLine,
                            !isDisableDeleteStockingLocation ? Styles.buttonWithRedLine : Styles.buttonWithGreyLine
                        ]}
                    >
                        <CText
                            style={[
                                Styles.buttonWithLineText,
                                !isDisableDeleteStockingLocation
                                    ? Styles.buttonWithRedLineText
                                    : Styles.buttonWithGreyLineText
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_DELETE_STOCKING_LOCATION.toLocaleUpperCase()}
                        </CText>
                    </DebouncedButton>
                </View>
            </KeyboardAwareScrollView>
            <View style={{ marginBottom: 20 }}>
                {loading && <LinearProgress color="#7CFC00" />}
                <View style={FormBottomButtonStyles.shadowButton}>
                    <Button
                        onPress={_.debounce(handlePressSave, IntervalTime.FIVE_HUNDRED)}
                        title={t.labels.PBNA_MOBILE_SAVE.toLocaleUpperCase()}
                        titleStyle={[
                            FormBottomButtonStyles.fontFamily,
                            FormBottomButtonStyles.fontWhiteColor,
                            FormBottomButtonStyles.smallFontSize
                        ]}
                        disabled={stateSave}
                        containerStyle={FormBottomButtonStyles.buttonSize}
                        disabledStyle={FormBottomButtonStyles.bgWhiteColor}
                        disabledTitleStyle={FormBottomButtonStyles.disableTitleColor}
                        buttonStyle={[FormBottomButtonStyles.bgPurpleColor, FormBottomButtonStyles.buttonSize]}
                    />
                </View>
            </View>
            {!isFromNotification && <Loading isLoading={isLoading} />}
        </SafeAreaView>
    )
}

export default RealogramScreen
