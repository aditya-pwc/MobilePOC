import React, { useMemo, useState } from 'react'
import CText from '../../../../../common/components/CText'
import { Alert, SafeAreaView, View, Image, StyleSheet, TextInput } from 'react-native'
import HeaderOfModal from '../../lead/common/HeaderOfModal'
import _ from 'lodash'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import {
    AgreementTypeMap,
    ContentTypeEnum,
    ContractRecordTypeName,
    ContractStatus,
    IntervalTime
} from '../../../../enums/Contract'
import { t } from '../../../../../common/i18n/t'
import { TouchableOpacity } from 'react-native-gesture-handler'
import DocumentPicker from 'react-native-document-picker'
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin'
import Pdf from 'react-native-pdf'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import PickerTile from '../../lead/common/PickerTile'
import { VisitCard } from './CDASignature'
import { renderCDAStoreIcon } from '../CustomerListTile'
import StorePlaceholderSvg from '../../../../../../assets/image/Icon-store-placeholder.svg'
import { CDASuccessModal, CDASuccessModalWithTimer } from './CDASuccessModal'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import dayjs from 'dayjs'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { restDataCommonCall } from '../../../../api/SyncUtils'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { SharePointTokenManager, useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import { base64ToBlob } from '../../../../../common/utils/CommonUtils'
import RNFS from 'react-native-fs'
import axios from 'axios'
import { foodServiceContractHtml } from './ContractPdfHtml'
import { DatePickerLegacy } from '../../../common/DatePicker'
import { LinearProgress } from 'react-native-elements'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { hasIllegalCharacter } from '../../../../helper/rep/ContractHelper'

const styles = StyleSheet.create({
    pickLabelTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    errorStyle: {
        marginTop: -20,
        marginBottom: 20,
        color: 'red',
        fontSize: 12,
        fontWeight: '400'
    },
    visitCardHalfBackGround: {
        position: 'absolute',
        backgroundColor: 'white',
        top: '40%',
        width: '100%',
        height: '60%'
    },
    contextContainer: {
        paddingTop: 25,
        paddingHorizontal: 22,
        backgroundColor: 'white',
        height: '100%'
    },
    pdfViewer: {
        marginTop: 10,
        height: 100,
        width: '100%'
    },
    bottomBtnContainer: {
        bottom: 0,
        position: 'absolute'
    },
    uploadImg: {
        height: 17,
        width: 21,
        marginRight: 10
    },
    uploadText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#00A2D9'
    }
})

const fsAgreementTypeGen = () => [
    '',
    t.labels.PBNA_MOBILE_FS_CONTRACT_BEVERAGE,
    t.labels.PBNA_MOBILE_FS_CONTRACT_VENDING,
    t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING,
    t.labels.PBNA_MOBILE_OTHER
]

const commonAgreementTypeGen = () => [
    '',
    t.labels.PBNA_MOBILE_VENDING_AGREEMENT,
    t.labels.PBNA_MOBILE_BEVERAGE_AGREEMENT,
    t.labels.PBNA_MOBILE_OTHER_CONTRACT,
    t.labels.PBNA_MOBILE_RETAIL_CONTRACT
]

const createFSContractPDF = async (images: string[]) => {
    const htmlContent = foodServiceContractHtml(images)
    const pdfFile = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: new Date().getTime().toString(),
        pageSize: 'Letter',
        directory: 'Documents',
        padding: 1,
        bgColor: '#ffffff',
        base64: true
    })
    return pdfFile.base64 as string | undefined
}

const handleMainBtnGen =
    (
        setLoading: React.Dispatch<React.SetStateAction<number>>,
        setPdfData: React.Dispatch<React.SetStateAction<string>>
    ) =>
    () =>
        Alert.alert(t.labels.PBNA_MOBILE_FS_UPLOAD_TITLE, t.labels.PBNA_MOBILE_FS_UPLOAD_BODY, [
            {
                text: t.labels.PBNA_MOBILE_SCAN_CONTRACT,
                onPress: () => {
                    setLoading(0.2)
                    DocumentScanner.scanDocument({ responseType: ResponseType.Base64, croppedImageQuality: 35 })
                        .then(({ scannedImages }) => {
                            if (!scannedImages) {
                                // User click cancel
                                return setLoading(0)
                            }
                            setLoading(0.6)
                            scannedImages &&
                                createFSContractPDF(scannedImages).then((pdfBS64) => {
                                    setLoading(0)
                                    pdfBS64 && setPdfData(pdfBS64)
                                })
                        })
                        .catch((err) => {
                            setLoading(0)
                            storeClassLog(Log.MOBILE_INFO, 'Upload-Contract', 'Scan' + ErrorUtils.error2String(err))
                        })
                }
            },
            {
                text: t.labels.PBNA_MOBILE_SELECT_EXIST_DOC,
                onPress: () =>
                    DocumentPicker.pickSingle({ type: DocumentPicker.types.pdf })
                        .then(async (res) => {
                            const { uri } = res
                            try {
                                if (uri) {
                                    setLoading(0.8)
                                    const { size } = await RNFS.stat(decodeURIComponent(uri))
                                    if (size > Math.pow(10, 8)) {
                                        throw new Error('File size over 100mb')
                                    }
                                    const base64Content = await RNFS.readFile(decodeURIComponent(uri), 'base64')
                                    setPdfData(base64Content)
                                }
                            } catch (err) {
                                storeClassLog(
                                    Log.MOBILE_INFO,
                                    'Upload-Contract',
                                    'Pick' + ErrorUtils.error2String(err) + uri
                                )
                            } finally {
                                setLoading(0)
                            }
                        })
                        .catch((e) => e)
            },
            {
                text: t.labels.PBNA_MOBILE_CANCEL
            }
        ])

const updateSPFileName = async (name: string, url: string, sharepointToken: string) => {
    const newUrl = url.replace(/\/content$/, '')
    return axios.patch(
        newUrl,
        {
            name: name + '.pdf'
        },
        {
            headers: {
                Authorization: sharepointToken,
                'Content-Type': 'application/json'
            }
        }
    )
}

const getFSSharepointUrl = (fileName: string) =>
    CommonApi.PBNA_MOBILE_SHAREPOINT_DRIVES_BASE_URL +
    '/' +
    CommonApi.PBNA_MOBILE_SHAREPOINT_CONTRACT_API +
    '//root:/' +
    fileName +
    '.pdf:/content'

const getNewSharepointUrl = (url: string, newFileName: string) => {
    return url.replace(/[^/]+(?=\.pdf)/, newFileName)
}

const getRetailSharepointUrl = (fileName: string) =>
    `${CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API}${CommonApi.PBNA_MOBILE_PDF_FILE_DIRECTORY}${fileName}.pdf:/content`

const uploadContractToSp = async (sharepointUrl: string, base64String: string, isUploadFS = false) => {
    const tokenManager = SharePointTokenManager.getInstance()
    const sharepointToken = await tokenManager.getToken()
    try {
        const blob = await base64ToBlob(base64String)
        const spUrl = encodeURI(sharepointUrl)
        const res = await fetch(spUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${sharepointToken}`,
                'Content-Type': 'application/octet-stream'
            },
            body: blob
        })
        if (!res.ok) {
            throw new Error(ErrorUtils.error2String(res))
        }
        const resJson = await res.json()
        if (resJson.createdDateTime !== resJson.lastModifiedDateTime && isUploadFS) {
            // indicate the we have override a file with same name and needed to check in to see changes in web
            const checkInUrl = spUrl.replace(/content$/, 'checkin')
            await axios
                .post(
                    checkInUrl,
                    {
                        comment: 'Override'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${sharepointToken}`
                        }
                    }
                )
                .catch((e) => e)
        }
        return sharepointUrl
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, `Upload-Contract`, `Upload To SharePoint failure ${ErrorUtils.error2String(e)}`)
    }
}

const alertUploadFail = (msg: string) =>
    Alert.alert(msg, '', [
        {
            text: t.labels.PBNA_MOBILE_OK
        }
    ])

export const UploadFSContract: React.FC<any> = ({ navigation, route }) => {
    const { item, retailStore } = route.params
    const isEdit = !!item
    const fsAgreementType = useMemo(fsAgreementTypeGen, [])
    const [selectAgreement, setSelectAgreement] = useState<string>(fsAgreementType[1])
    const [startDate, setStartDate] = useState(item?.StartDate || dayjs().format(TIME_FORMAT.Y_MM_DD))
    const [endDate, setEndDate] = useState(item?.EndDate || '')
    const [pdfData, setPdfData] = useState(item?.pdfData || '')
    const [showSuccessMsg, setShowSuccessMsg] = useState('')
    const [loading, setLoading] = useState(0)
    const handleMainBtn = useMemo(() => handleMainBtnGen(setLoading, setPdfData), [])
    const hasDateError = dayjs(startDate).isAfter(dayjs(endDate))
    const sharepointToken = useSharePointToken(true)

    const canSave = isEdit
        ? !hasDateError && (startDate !== item?.StartDate || endDate !== item?.EndDate)
        : selectAgreement && startDate && endDate && !hasDateError && pdfData

    const handleSubmit = async () => {
        if (isEdit) {
            setLoading(0.2)
            const updatedContractObj = {
                StartDate: startDate,
                EndDate: endDate
            }

            try {
                if (startDate !== item?.StartDate && item.Sharepoint_URL__c) {
                    const newFileName =
                        (retailStore['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c) +
                        '_' +
                        item?.Signed_Medal_Tier__c +
                        '_' +
                        startDate
                    await updateSPFileName(newFileName, item.Sharepoint_URL__c, sharepointToken)
                    Object.assign(updatedContractObj, {
                        Sharepoint_URL__c: getNewSharepointUrl(item.Sharepoint_URL__c, newFileName)
                    })
                    setLoading(0.6)
                }
                await restDataCommonCall('sobjects/Contract/' + item.Id, 'PATCH', updatedContractObj)

                setLoading(1)
                setShowSuccessMsg(t.labels.PBNA_MOBILE_FS_UPLOAD_SAVE_SUCCESS)
                setTimeout(() => {
                    setShowSuccessMsg('')
                    navigation.goBack()
                }, IntervalTime.TWO_THOUSAND)
            } catch (err) {
                storeClassLog(Log.MOBILE_ERROR, 'Upload-Contract', 'Update' + ErrorUtils.error2String(err))
                alertUploadFail(t.labels.PBNA_MOBILE_FS_UPLOAD_SAVE_FAIL)
            } finally {
                setLoading(0)
            }
        } else {
            Alert.alert(t.labels.PBNA_MOBILE_FS_UPLOAD_CONFIRM_TITLE, t.labels.PBNA_MOBILE_FS_UPLOAD_CONFIRM_BODY, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: t.labels.PBNA_MOBILE_SUBMIT,
                    onPress: async () => {
                        setLoading(0.2)
                        const fileName =
                            (retailStore['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c) +
                            '_' +
                            AgreementTypeMap()[selectAgreement] +
                            '_' +
                            startDate
                        try {
                            const fsSharepointUrl = getFSSharepointUrl(fileName)
                            const pdfUrl = await uploadContractToSp(fsSharepointUrl, pdfData, true)
                            setLoading(0.9)
                            if (!pdfUrl) {
                                setLoading(0)
                                // error logged by inner function
                                return alertUploadFail(t.labels.PBNA_MOBILE_FS_UPLOAD_FAIL)
                            }
                            const contractObj = {
                                Contract_Status__c: ContractStatus.Signed,
                                StartDate: startDate,
                                EndDate: endDate,
                                Sharepoint_URL__c: pdfUrl,
                                RecordType: {
                                    Name: ContractRecordTypeName.FSContracts
                                },
                                Signed_Medal_Tier__c: AgreementTypeMap()[selectAgreement],
                                AccountId: retailStore.AccountId || retailStore.accountId
                            }
                            await restDataCommonCall('sobjects/Contract/', 'POST', contractObj)
                            setLoading(1)
                            setShowSuccessMsg(t.labels.PBNA_MOBILE_FS_UPLOAD_SUCCESS)
                            setTimeout(() => {
                                setLoading(0)
                                setShowSuccessMsg('')
                                navigation.goBack()
                            }, IntervalTime.TWO_THOUSAND)
                        } catch (err) {
                            setLoading(0)
                            alertUploadFail(t.labels.PBNA_MOBILE_FS_UPLOAD_FAIL)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'Upload-Contract',
                                'Create' + ErrorUtils.error2String(err) + fileName
                            )
                        }
                    }
                }
            ])
        }
    }

    return (
        <View style={[commonStyle.flex_1, { backgroundColor: '#F2F4F7' }]}>
            <SafeAreaView>
                <HeaderOfModal
                    handleOnPress={_.debounce(navigation.goBack, IntervalTime.FIVE_HUNDRED)}
                    title={t.labels.PBNA_MOBILE_FS_CONTRACT}
                />

                <View style={{ marginTop: 44 }}>
                    <View style={styles.visitCardHalfBackGround} />
                    <VisitCard
                        item={retailStore}
                        retailStoreIcon={
                            retailStore['Account.IsOTSCustomer__c'] === '1' ||
                            retailStore['Account.IsOTSCustomer__c'] === true ? (
                                renderCDAStoreIcon('')
                            ) : (
                                <StorePlaceholderSvg />
                            )
                        }
                    />
                </View>

                <View style={styles.contextContainer}>
                    <PickerTile
                        data={fsAgreementType}
                        defValue={isEdit ? item?.Signed_Medal_Tier__c : selectAgreement}
                        label={t.labels.PBNA_MOBILE_AGREEMENT_TYPE}
                        title={t.labels.PBNA_MOBILE_AGREEMENT_TYPE}
                        placeholder={''}
                        required
                        disabled={isEdit || !!loading}
                        noPaddingHorizontal
                        modalStyle={{ width: '90%' }}
                        itemStyle={{ fontSize: 24 }}
                        labelStyle={styles.pickLabelTitle}
                        onChange={setSelectAgreement}
                    />
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginTop_20]}>
                        <View style={[commonStyle.flex_1, { marginRight: 32 }]}>
                            <DatePickerLegacy
                                disabled={!!loading}
                                fieldLabel={t.labels.PBNA_MOBILE_CONTRACT_START_DATE}
                                value={startDate}
                                minimumDate={new Date(0)}
                                onChange={(tempDate: Date) => setStartDate(dayjs(tempDate).format(TIME_FORMAT.Y_MM_DD))}
                            />
                        </View>
                        <View style={commonStyle.flex_1}>
                            <DatePickerLegacy
                                disabled={!!loading}
                                fieldLabel={t.labels.PBNA_MOBILE_CONTRACT_END_DATE}
                                minimumDate={new Date(0)}
                                value={endDate}
                                onChange={(tempDate: Date) => setEndDate(dayjs(tempDate).format(TIME_FORMAT.Y_MM_DD))}
                            />
                        </View>
                    </View>
                    {hasDateError && <CText style={styles.errorStyle}>{t.labels.PBNA_MOBILE_DATE_ERROR_MESSAGE}</CText>}
                    <View style={{ marginTop: 10 }}>
                        {isEdit ? (
                            <CText>{t.labels.PBNA_MOBILE_CONTRACT_IMAGES}</CText>
                        ) : (
                            <TouchableOpacity
                                disabled={!!loading}
                                style={commonStyle.flexRowAlignCenter}
                                onPress={handleMainBtn}
                            >
                                <Image
                                    style={styles.uploadImg}
                                    resizeMode="contain"
                                    source={ImageSrc.IMG_CAMERA_BOLD}
                                />
                                <CText style={styles.uploadText}>
                                    {pdfData
                                        ? t.labels.PBNA_MOBILE_RE_UPLOAD_SCAN_CONTRACT.toLocaleUpperCase()
                                        : t.labels.PBNA_MOBILE_UPLOAD_SCAN_CONTRACT.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        )}
                        {!!item?.Sharepoint_URL__c && !!sharepointToken && (
                            <Pdf
                                horizontal
                                minScale={1}
                                maxScale={1}
                                style={styles.pdfViewer}
                                source={{
                                    uri: encodeURI(item.Sharepoint_URL__c),
                                    headers: {
                                        Authorization: sharepointToken
                                    },
                                    cache: false
                                }}
                            />
                        )}
                        {!!pdfData && (
                            <Pdf
                                horizontal
                                minScale={1}
                                maxScale={1}
                                style={styles.pdfViewer}
                                source={{
                                    uri: ContentTypeEnum.PDF + pdfData
                                }}
                            />
                        )}
                    </View>
                </View>
            </SafeAreaView>
            <View style={styles.bottomBtnContainer}>
                {!!loading && <LinearProgress color="#7CFC00" variant="determinate" value={loading} />}
                <FormBottomButton
                    onPressCancel={_.debounce(navigation.goBack, IntervalTime.FIVE_HUNDRED)}
                    disableSave={!canSave || !!loading}
                    onPressSave={_.debounce(handleSubmit, IntervalTime.FIVE_HUNDRED)}
                    rightButtonLabel={
                        isEdit
                            ? t.labels.PBNA_MOBILE_SAVE + ' & ' + t.labels.PBNA_MOBILE_SUBMIT.toLocaleUpperCase()
                            : (t.labels.PBNA_MOBILE_SUBMIT + ' ' + t.labels.PBNA_MOBILE_CONTRACT).toLocaleLowerCase()
                    }
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                    relative
                />
            </View>
            <CDASuccessModal wide modalVisible={!!showSuccessMsg} message={showSuccessMsg} />
        </View>
    )
}

export const UploadContract: React.FC<any> = ({ navigation, route }) => {
    const { item, retailStore } = route.params
    const isEdit = !!item
    const commonAgreementType = useMemo(commonAgreementTypeGen, [])
    const [selectAgreement, setSelectAgreement] = useState<string>(commonAgreementType[1])
    const [agreementName, setAgreementName] = useState('')
    const [startDate, setStartDate] = useState(item?.StartDate || dayjs().format(TIME_FORMAT.Y_MM_DD))
    const [endDate, setEndDate] = useState(item?.EndDate || '')
    const [pdfData, setPdfData] = useState(item?.pdfData || '')
    const [successFlag, setSuccessFlag] = useState(0)
    const [loading, setLoading] = useState(0)
    const hasDateError = dayjs(startDate).isAfter(dayjs(endDate))
    const sharepointToken = useSharePointToken(true)
    const [successModalMsg, setSuccessModalMsg] = useState(t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_SUCCESS)
    const handleMainBtn = useMemo(() => handleMainBtnGen(setLoading, setPdfData), [])

    const canSave = isEdit
        ? !hasDateError && (startDate !== item?.StartDate || endDate !== item?.EndDate)
        : selectAgreement && startDate && endDate && !hasDateError && pdfData

    const handleSubmit = async () => {
        const fileName =
            (retailStore['Account.CUST_UNIQ_ID_VAL__c'] || retailStore?.Account?.CUST_UNIQ_ID_VAL__c) +
            '_' +
            (item?.Signed_Medal_Tier__c || selectAgreement) +
            (item?.Name || agreementName ? ` - ${agreementName || item?.Name}` : '') +
            '_' +
            startDate
        if (isEdit) {
            setLoading(0.2)
            const updatedContractObj = {
                StartDate: startDate,
                EndDate: endDate
            }

            try {
                if (startDate !== item?.StartDate && item.Sharepoint_URL__c) {
                    await updateSPFileName(fileName, item.Sharepoint_URL__c, sharepointToken)
                    Object.assign(updatedContractObj, { Sharepoint_URL__c: getRetailSharepointUrl(fileName) })
                    setLoading(0.6)
                }
                await restDataCommonCall('sobjects/Contract/' + item.Id, 'PATCH', updatedContractObj)

                setLoading(1)
                setSuccessModalMsg(t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_SAVED_SUCCESS)
                setSuccessFlag((p) => p + 1)
            } catch (err) {
                storeClassLog(Log.MOBILE_ERROR, 'Upload-Contract', 'Update' + ErrorUtils.error2String(err))
                alertUploadFail(t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_FAILED)
            } finally {
                setLoading(0)
            }
        } else {
            Alert.alert(t.labels.PBNA_MOBILE_FS_UPLOAD_CONFIRM_TITLE, t.labels.PBNA_MOBILE_FS_UPLOAD_CONFIRM_BODY, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: t.labels.PBNA_MOBILE_SUBMIT,
                    onPress: async () => {
                        setLoading(0.2)
                        try {
                            const isRetailContract = selectAgreement === commonAgreementType[4]
                            const sharepointUrl = isRetailContract
                                ? getRetailSharepointUrl(fileName)
                                : getFSSharepointUrl(fileName)
                            const pdfUrl = await uploadContractToSp(sharepointUrl, pdfData, !isRetailContract)
                            setLoading(0.9)
                            if (!pdfUrl) {
                                setLoading(0)
                                // error logged by inner function
                                return alertUploadFail(t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_FAILED)
                            }

                            const contractObj = {
                                Contract_Status__c: ContractStatus.Signed,
                                StartDate: startDate,
                                EndDate: endDate,
                                AccountId: retailStore.AccountId || retailStore.accountId,
                                Signed_Medal_Tier__c: selectAgreement,
                                RecordType: {
                                    Name:
                                        selectAgreement === commonAgreementType[4]
                                            ? ContractRecordTypeName.RetailContracts
                                            : ContractRecordTypeName.FSContracts
                                },
                                Sharepoint_URL__c: pdfUrl,
                                Name: agreementName
                            }

                            await restDataCommonCall('sobjects/Contract/', 'POST', contractObj)
                            setLoading(1)
                            setSuccessFlag((p) => p + 1)
                        } catch (err) {
                            setLoading(0)
                            alertUploadFail(t.labels.PBNA_MOBILE_UPLOAD_CONTRACT_FAILED)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'Upload-Contract',
                                'Create' + ErrorUtils.error2String(err) + fileName
                            )
                        }
                    }
                }
            ])
        }
    }

    return (
        <View style={[commonStyle.flex_1, { backgroundColor: '#F2F4F7' }]}>
            <SafeAreaView>
                <HeaderOfModal
                    handleOnPress={_.debounce(navigation.goBack, IntervalTime.FIVE_HUNDRED)}
                    title={t.labels.PBNA_MOBILE_UPLOAD_CONTRACT}
                />

                <View style={{ marginTop: 44 }}>
                    <View style={styles.visitCardHalfBackGround} />
                    <VisitCard
                        item={retailStore}
                        retailStoreIcon={
                            retailStore['Account.IsOTSCustomer__c'] === '1' ||
                            retailStore['Account.IsOTSCustomer__c'] === true ? (
                                renderCDAStoreIcon('')
                            ) : (
                                <StorePlaceholderSvg />
                            )
                        }
                    />
                </View>

                <View style={styles.contextContainer}>
                    <PickerTile
                        data={commonAgreementType}
                        defValue={isEdit ? item?.Signed_Medal_Tier__c : selectAgreement}
                        label={t.labels.PBNA_MOBILE_AGREEMENT_TYPE}
                        title={t.labels.PBNA_MOBILE_AGREEMENT_TYPE}
                        placeholder={''}
                        required
                        disabled={isEdit || !!loading}
                        noPaddingHorizontal
                        modalStyle={{ width: '90%' }}
                        itemStyle={{ fontSize: 24 }}
                        labelStyle={styles.pickLabelTitle}
                        onChange={setSelectAgreement}
                    />
                    {(selectAgreement === commonAgreementType[4] || item?.Name) && (
                        <View style={{ marginTop: 20 }}>
                            <CText style={{ color: '#565656', fontSize: 12 }}>
                                {t.labels.PBNA_MOBILE_RETAIL_AGREEMENT_NAME}
                            </CText>
                            <TextInput
                                keyboardAppearance={'light'}
                                style={{
                                    marginVertical: 10,
                                    color: isEdit ? '#86939e' : undefined
                                }}
                                maxLength={80}
                                value={isEdit ? item?.Name : agreementName}
                                onChangeText={(text) => !hasIllegalCharacter.test(text) && setAgreementName(text)}
                                returnKeyType={'done'}
                                allowFontScaling={false}
                                editable={!isEdit}
                            />
                            <View style={{ borderBottomColor: '#D3D3D3', borderBottomWidth: 1 }} />
                        </View>
                    )}
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginTop_20]}>
                        <View style={[commonStyle.flex_1, { marginRight: 32 }]}>
                            <DatePickerLegacy
                                disabled={!!loading}
                                fieldLabel={t.labels.PBNA_MOBILE_CONTRACT_START_DATE}
                                value={startDate}
                                minimumDate={new Date(0)}
                                onChange={(tempDate: Date) => setStartDate(dayjs(tempDate).format(TIME_FORMAT.Y_MM_DD))}
                            />
                        </View>
                        <View style={commonStyle.flex_1}>
                            <DatePickerLegacy
                                disabled={!!loading}
                                fieldLabel={t.labels.PBNA_MOBILE_CONTRACT_END_DATE}
                                minimumDate={new Date(0)}
                                value={endDate}
                                onChange={(tempDate: Date) => setEndDate(dayjs(tempDate).format(TIME_FORMAT.Y_MM_DD))}
                            />
                        </View>
                    </View>
                    {hasDateError && <CText style={styles.errorStyle}>{t.labels.PBNA_MOBILE_DATE_ERROR_MESSAGE}</CText>}
                    <View style={{ marginTop: 10 }}>
                        {isEdit ? (
                            <CText>{t.labels.PBNA_MOBILE_CONTRACT_IMAGES}</CText>
                        ) : (
                            <TouchableOpacity
                                disabled={!!loading}
                                style={commonStyle.flexRowAlignCenter}
                                onPress={handleMainBtn}
                            >
                                <Image
                                    style={styles.uploadImg}
                                    resizeMode="contain"
                                    source={ImageSrc.IMG_CAMERA_BOLD}
                                />
                                <CText style={styles.uploadText}>
                                    {pdfData
                                        ? t.labels.PBNA_MOBILE_RE_UPLOAD_SCAN_CONTRACT.toLocaleUpperCase()
                                        : t.labels.PBNA_MOBILE_UPLOAD_SCAN_CONTRACT.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        )}
                        {!!item?.Sharepoint_URL__c && !!sharepointToken && (
                            <Pdf
                                horizontal
                                minScale={1}
                                maxScale={1}
                                style={styles.pdfViewer}
                                source={{
                                    uri: encodeURI(item.Sharepoint_URL__c),
                                    headers: {
                                        Authorization: sharepointToken
                                    },
                                    cache: false
                                }}
                            />
                        )}
                        {!!pdfData && (
                            <Pdf
                                horizontal
                                minScale={1}
                                maxScale={1}
                                style={styles.pdfViewer}
                                source={{
                                    uri: ContentTypeEnum.PDF + pdfData
                                }}
                            />
                        )}
                    </View>
                </View>
            </SafeAreaView>
            <View style={styles.bottomBtnContainer}>
                {!!loading && <LinearProgress color="#7CFC00" variant="determinate" value={loading} />}
                <FormBottomButton
                    onPressCancel={_.throttle(navigation.goBack, IntervalTime.TWO_THOUSAND, { trailing: false })}
                    disableSave={!canSave || !!loading}
                    onPressSave={_.throttle(handleSubmit, IntervalTime.TWO_THOUSAND, { trailing: false })}
                    rightButtonLabel={
                        isEdit
                            ? t.labels.PBNA_MOBILE_SAVE + ' & ' + t.labels.PBNA_MOBILE_SUBMIT.toLocaleUpperCase()
                            : (t.labels.PBNA_MOBILE_SUBMIT + ' ' + t.labels.PBNA_MOBILE_CONTRACT).toLocaleLowerCase()
                    }
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                    relative
                />
            </View>
            <CDASuccessModalWithTimer
                wide
                message={successModalMsg}
                refreshFlag={successFlag}
                timeout={IntervalTime.TWO_THOUSAND}
                onTimeout={_.throttle(navigation.goBack, 3000, { trailing: false })}
                modalVisible={false}
            />
        </View>
    )
}
