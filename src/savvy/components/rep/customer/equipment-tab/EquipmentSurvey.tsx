import React, { FC, useEffect, useState } from 'react'
import { Alert, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import CollapseContainer from '../../../common/CollapseContainer'
import _ from 'lodash'
import CText from '../../../../../common/components/CText'
import CRadioButton from '../../../common/CRadioButton'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeadInput from '../../lead/common/LeadInput'
import PhotoPlaceholder from '../../../../../../assets/image/photo-placeholder.svg'
import { CommonParam } from '../../../../../common/CommonParam'
import { compositeCommonCall } from '../../../../api/SyncUtils'
import StatusCode from '../../../../enums/StatusCode'
import { Log } from '../../../../../common/enums/Log'
import FastImage from 'react-native-fast-image'
import ImagePicker, { Image as ImageType } from 'react-native-image-crop-picker'
import Collapsible from '../../../../../common/components/Collapsible'
import ChevronSvg from '../../../../../../assets/image/ios-chevron.svg'
import { t } from '../../../../../common/i18n/t'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import PopMessage from '../../../common/PopMessage'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'
import { SURVEY_QUESTION_TYPES } from '../../../../helper/rep/PdfHelper'
import { CommonApi } from '../../../../../common/api/CommonApi'
import EquipmentImageDisplay from './EquipmentImageDisplay'

const styles = StyleSheet.create({
    surveyItemContainer: {
        marginTop: 10
    },
    questionContainer: {
        marginVertical: 10,
        flexDirection: 'row'
    },
    expandAllView: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: '5%',
        marginVertical: 20
    },
    radioButtonContainer: {
        width: '50%'
    },
    checkboxContainer: {
        backgroundColor: '#fff'
    },
    checkboxText: {
        fontWeight: 'normal',
        marginLeft: 5
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book',
        // marginTop: 5,
        margin: 0,
        padding: 0,
        width: '100%'
    },
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    paddingHorizontal: {
        paddingHorizontal: 21
    },
    disabledInputStyle: {
        backgroundColor: '#f1f1f1'
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 8,
        position: 'absolute',
        right: 0,
        bottom: 0
    },
    photoStyle: {
        marginRight: 5,
        width: 85,
        height: 85,
        marginTop: 5
    },
    fastImgStyle: {
        width: 80,
        height: 80,
        borderRadius: 6
    },
    surveyAnswerContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red'
    },
    surveyAnswerHitSlop: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5
    },
    textStyle: {
        color: 'white',
        fontWeight: '500'
    },
    pendingContainer: {
        height: 100,
        width: 100
    },
    showAllText: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10
    },
    pendingContainer2: {
        width: '100%',
        height: 30
    },
    applyToAll: {
        color: baseStyle.color.titleGray
    },
    installRequestLineItems: {
        height: 90,
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 18,
        marginBottom: 3
    },
    equipmentImgContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    equipmentImgContainerStyle: {
        height: 35,
        width: 27,
        resizeMode: 'contain'
    },
    setUpDescStyle: {
        fontWeight: '500',
        overflow: 'hidden',
        width: 275
    },
    chevronSvgContainer: {
        position: 'absolute',
        right: 0,
        top: 25
    },
    chevronIcon: {
        width: 19,
        height: 20
    },
    collapseContainerStyle: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    horizontalAnswerContainer: {
        marginLeft: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    redColor: { color: '#EB445A' }
})

interface EquipmentSurveyProps {
    request
    installRequestLineItems
    equipmentTypeCodeDesc
    surveyResponse
    setSurveyResponse
    openPopup
    closePopup
    setChangeSurveyAnswer
    readonly: boolean
}

const validChoice = (condition, dependentQuestion) => {
    const operator = condition.operator
    //    EqualTo NotEqualTo StartsWith EndsWith Contains IsNull
    switch (operator) {
        case 'EqualTo':
            if (condition.rightValue.elementReference) {
                if (dependentQuestion.Answer) {
                    return dependentQuestion.Answer[0]?.DeveloperName === condition.rightValue.elementReference
                }
                return false
            }
            return dependentQuestion.Answer === condition.rightValue.stringValue
        case 'NotEqualTo':
            if (condition.rightValue.elementReference) {
                if (dependentQuestion.Answer) {
                    return dependentQuestion.Answer[0]?.DeveloperName !== condition.rightValue.elementReference
                }
                return false
            }
            return dependentQuestion.Answer !== condition.rightValue.stringValue
        case 'Contains':
            if (dependentQuestion.Answer) {
                return dependentQuestion.Answer.indexOf(condition.rightValue.stringValue) !== -1
            }
            return false
        case 'StartsWith':
            if (dependentQuestion.Answer) {
                return _.startsWith(dependentQuestion.Answer, condition.rightValue.stringValue)
            }
            return false
        case 'EndsWith':
            if (dependentQuestion.Answer) {
                return _.endsWith(dependentQuestion.Answer, condition.rightValue.stringValue)
            }
            return false
        case 'IsNull':
            return condition.rightValue.booleanValue
                ? _.isEmpty(dependentQuestion.Answer)
                : !_.isEmpty(dependentQuestion.Answer)
        default:
            return false
    }
}

export const judgeVisibleByRule = (visibilityRule, questionList) => {
    const conditionLogic = visibilityRule.conditionLogic
    const conditions = visibilityRule.conditions
    if (conditionLogic === 'or') {
        let visible = false
        for (const condition of conditions) {
            const dependentQuestion = questionList.find((v) => v.DeveloperName === condition.leftValueReference)
            if (validChoice(condition, dependentQuestion)) {
                visible = true
                break
            }
        }
        return visible
    } else if (conditionLogic === 'and') {
        let visible = true
        for (const condition of conditions) {
            const dependentQuestion = questionList.find((v) => v.DeveloperName === condition.leftValueReference)
            visible = validChoice(condition, dependentQuestion) && visible
        }
        return visible
    }
}

const EquipmentSurvey: FC<EquipmentSurveyProps> = (props: EquipmentSurveyProps) => {
    const {
        request,
        installRequestLineItems,
        equipmentTypeCodeDesc,
        surveyResponse,
        setSurveyResponse,
        openPopup,
        closePopup,
        setChangeSurveyAnswer,
        readonly = false
    } = props

    const [showPhoto, setShowPhoto] = useState(false)

    const [tempVersionDataUrl, setTempVersionDataUrl] = useState('')

    const [showFirstPageContent, setShowFirstPageContent] = useState(false)

    const [showSecondPageContent, setShowSecondPageContent] = useState(false)

    const [showTypePageContent, setShowTypePageContent] = useState(false)

    const [showLineItemContentList, setShowLineItemContentList] = useState([])

    const [showGeneralEquipmentList, setShowGeneralEquipmentList] = useState([])

    const [showAll, setShowAll] = useState(false)

    const [disableChange, setDisableChange] = useState(true)

    useEffect(() => {
        if (installRequestLineItems.length > 0) {
            const tempList = []
            installRequestLineItems.forEach(() => {
                tempList.push(false)
            })
            setShowLineItemContentList(tempList)
        }
    }, [installRequestLineItems.length])

    useEffect(() => {
        if (!isPersonaCRMBusinessAdmin() && !readonly) {
            setDisableChange(false)
        }
    }, [readonly])

    useEffect(() => {
        if (surveyResponse?.generalEquipmentResponseList?.length > 0) {
            const tempList = []
            surveyResponse.generalEquipmentResponseList.forEach(() => {
                tempList.push(false)
            })
            setShowGeneralEquipmentList(tempList)
        }
    }, [surveyResponse?.generalEquipmentResponseList?.length])

    const judgeCleanQuestion = (question, questionIndex, screenIndex, questionList) => {
        if (question.visibilityRule) {
            return judgeVisibleByRule(question.visibilityRule, questionList)
        }
        return true
    }

    const judgeRenderQuestion = (question, questionIndex, screenIndex, questionList, isGeneralDetail) => {
        if (
            ((questionIndex === 0 || questionIndex === 1) && screenIndex !== -1 && !isGeneralDetail) ||
            (isGeneralDetail && questionIndex === 0)
        ) {
            return false
        }
        if (question.visibilityRule) {
            return judgeVisibleByRule(question.visibilityRule, questionList)
        }
        return true
    }

    const cleanInvalidAnswer = (screenIndex, tempSurveyData) => {
        const questionList = tempSurveyData.questionList
        for (let i = 0; i < questionList.length; i++) {
            if (!judgeCleanQuestion(questionList[i], i, screenIndex, questionList)) {
                questionList[i].Answer = null
                questionList[i].Choices.forEach((c) => {
                    c.Checked = false
                })
            }
        }
    }

    const cloneResponse = (screenIndex: number, isGeneralDetail: boolean) => {
        return _.cloneDeep(
            (() => {
                if (screenIndex === -1) {
                    return surveyResponse.headerResponse
                }
                return isGeneralDetail
                    ? surveyResponse.generalEquipmentResponseList[screenIndex]
                    : surveyResponse.lineItemResponseList[screenIndex]
            })()
        )
    }

    const judgeChecked = (
        screenIndex: number,
        questionIndex: number,
        isGeneralDetail: boolean,
        choiceIndex: number
    ) => {
        if (screenIndex === -1) {
            return surveyResponse.headerResponse.questionList[questionIndex]?.Choices[choiceIndex]?.Checked
        }
        return isGeneralDetail
            ? surveyResponse.generalEquipmentResponseList[screenIndex].questionList[questionIndex]?.Choices[choiceIndex]
                  ?.Checked
            : surveyResponse.lineItemResponseList[screenIndex].questionList[questionIndex]?.Choices[choiceIndex]
                  ?.Checked
    }

    const renderRadioButtonAnswer = (question, questionIndex, screenIndex, isGeneralDetail) => {
        const choiceList = question.Choices
        return choiceList.map((choice, choiceIndex) => {
            return (
                <View style={styles.radioButtonContainer} key={choice.Name}>
                    <CRadioButton
                        title={choice.Name}
                        onPress={() => {
                            const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
                            if (!tempResponse.questionList[questionIndex].Choices[choiceIndex].Checked) {
                                setChangeSurveyAnswer(true)
                            }
                            tempResponse.questionList[questionIndex].Choices.forEach((c) => {
                                c.Checked = false
                            })
                            tempResponse.questionList[questionIndex].Answer = [choice]
                            tempResponse.questionList[questionIndex].Choices[choiceIndex].Checked = true
                            if (screenIndex === -1) {
                                setSurveyResponse({
                                    ...surveyResponse,
                                    headerResponse: tempResponse
                                })
                            } else {
                                if (isGeneralDetail) {
                                    const tempGeneralDetail = _.cloneDeep(surveyResponse.generalEquipmentResponseList)
                                    tempGeneralDetail[screenIndex] = tempResponse
                                    setSurveyResponse({
                                        ...surveyResponse,
                                        generalEquipmentResponseList: tempGeneralDetail
                                    })
                                } else {
                                    const tempLineItemResponseList = _.cloneDeep(surveyResponse.lineItemResponseList)
                                    tempLineItemResponseList[screenIndex] = tempResponse
                                    setSurveyResponse({
                                        ...surveyResponse,
                                        lineItemResponseList: tempLineItemResponseList
                                    })
                                }
                            }
                        }}
                        checked={judgeChecked(screenIndex, questionIndex, isGeneralDetail, choiceIndex)}
                        disabled={disableChange}
                        autoWidth
                    />
                </View>
            )
        })
    }

    const renderMultiSelectionAnswer = (question, questionIndex, screenIndex, isGeneralDetail) => {
        const choiceList = question.Choices
        return choiceList.map((choice, choiceIndex) => {
            return (
                <CCheckBox
                    title={choice.Name}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkboxText}
                    onPress={() => {
                        const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
                        if (!tempResponse.questionList[questionIndex].Choices[choiceIndex].Checked) {
                            setChangeSurveyAnswer(true)
                        }
                        tempResponse.questionList[questionIndex].Choices[choiceIndex].Checked =
                            !tempResponse.questionList[questionIndex].Choices[choiceIndex].Checked
                        tempResponse.questionList[questionIndex].Answer = tempResponse.questionList[
                            questionIndex
                        ].Choices.filter((c) => c.Checked)
                        cleanInvalidAnswer(screenIndex, tempResponse)
                        if (screenIndex === -1) {
                            setSurveyResponse({
                                ...surveyResponse,
                                headerResponse: tempResponse
                            })
                        } else {
                            if (isGeneralDetail) {
                                const tempGeneralDetail = _.cloneDeep(surveyResponse.generalEquipmentResponseList)
                                tempGeneralDetail[screenIndex] = tempResponse
                                setSurveyResponse({
                                    ...surveyResponse,
                                    generalEquipmentResponseList: tempGeneralDetail
                                })
                            } else {
                                const tempLineItemResponseList = _.cloneDeep(surveyResponse.lineItemResponseList)
                                tempLineItemResponseList[screenIndex] = tempResponse
                                setSurveyResponse({
                                    ...surveyResponse,
                                    lineItemResponseList: tempLineItemResponseList
                                })
                            }
                        }
                    }}
                    checked={judgeChecked(screenIndex, questionIndex, isGeneralDetail, choiceIndex)}
                    key={choice.Name}
                    disabled={disableChange}
                />
            )
        })
    }

    const renderShortTextAnswer = (question, questionIndex, screenIndex, isGeneralDetail) => {
        return (
            <LeadInput
                fieldName={''}
                onChangeText={(v: string) => {
                    setChangeSurveyAnswer(true)
                    const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
                    tempResponse.questionList[questionIndex].Answer = v
                    cleanInvalidAnswer(screenIndex, tempResponse)
                    if (screenIndex === -1) {
                        setSurveyResponse({
                            ...surveyResponse,
                            headerResponse: tempResponse
                        })
                    } else {
                        if (isGeneralDetail) {
                            const tempGeneralDetail = _.cloneDeep(surveyResponse.generalEquipmentResponseList)
                            tempGeneralDetail[screenIndex] = tempResponse
                            setSurveyResponse({
                                ...surveyResponse,
                                generalEquipmentResponseList: tempGeneralDetail
                            })
                        } else {
                            const tempLineItemResponseList = _.cloneDeep(surveyResponse.lineItemResponseList)
                            tempLineItemResponseList[screenIndex] = tempResponse
                            setSurveyResponse({
                                ...surveyResponse,
                                lineItemResponseList: tempLineItemResponseList
                            })
                        }
                    }
                }}
                trackedValue={(() => {
                    if (screenIndex === -1) {
                        return surveyResponse.headerResponse.questionList[questionIndex]?.Answer
                    }
                    return isGeneralDetail
                        ? surveyResponse.generalEquipmentResponseList[screenIndex].questionList[questionIndex]?.Answer
                        : surveyResponse.lineItemResponseList[screenIndex].questionList[questionIndex]?.Answer
                })()}
                noMargin
                disabled={disableChange}
            />
        )
    }
    const handleUploadPhoto = async (
        photoBase64,
        questionIndex,
        screenIndex,
        isGeneralDetail,
        photoIndex,
        tempResponse
    ) => {
        let imgBase64List = {}
        let imgGroup = {}
        const createBody = {
            method: 'POST',
            url: `/services/data/${CommonParam.apiVersion}/sobjects/ContentVersion`,
            referenceId: 'refContentVersion',
            body: {
                Title: 'Survey Photo',
                PathOnClient: 'survey_shangmin.jpeg',
                VersionData: photoBase64,
                FirstPublishLocationId: request.Id
            }
        }
        const queryBody = {
            method: 'GET',
            url: `/services/data/${CommonParam.apiVersion}/query/?q=SELECT VersionData FROM ContentVersion WHERE Id='@{refContentVersion.id}'`,
            referenceId: 'getContentVersion'
        }

        const res = await compositeCommonCall([createBody, queryBody])

        if (res.data.compositeResponse[1].httpStatusCode === StatusCode.SuccessOK) {
            setChangeSurveyAnswer(true)
            if (tempResponse.questionList[questionIndex].Answer?.length > 0 || photoIndex > 0) {
                tempResponse.questionList[questionIndex].Answer.push(
                    res.data.compositeResponse[1].body.records[0].VersionData
                )
            } else {
                tempResponse.questionList[questionIndex].Answer = [
                    res.data.compositeResponse[1].body.records[0].VersionData
                ]
            }
            const imgBase64 = 'data:image/png;base64,' + photoBase64

            const tempEquipmentSurveyPhotosString = await AsyncStorage.getItem('equipment_survey_photos')
            const tempPhotoByRequestId = await AsyncStorage.getItem('survey_photos_group')
            if (tempEquipmentSurveyPhotosString) {
                imgBase64List = JSON.parse(tempEquipmentSurveyPhotosString)
            }
            if (tempPhotoByRequestId) {
                imgGroup = JSON.parse(tempPhotoByRequestId)
            }

            imgBase64List[res.data.compositeResponse[1].body.records[0].VersionData] = imgBase64
            if (imgGroup[request.Id]) {
                imgGroup[request.Id].push(res.data.compositeResponse[1].body.records[0].VersionData)
            } else {
                imgGroup[request.Id] = new Array(res.data.compositeResponse[1].body.records[0].VersionData)
            }
            await AsyncStorage.setItem('equipment_survey_photos', JSON.stringify(imgBase64List))
            await AsyncStorage.setItem('survey_photos_group', JSON.stringify(imgGroup))
            if (screenIndex === -1) {
                setSurveyResponse({
                    ...surveyResponse,
                    headerResponse: tempResponse
                })
            } else {
                if (isGeneralDetail) {
                    const tempGeneralDetail = _.cloneDeep(surveyResponse.generalEquipmentResponseList)
                    tempGeneralDetail[screenIndex] = tempResponse
                    setSurveyResponse({
                        ...surveyResponse,
                        generalEquipmentResponseList: tempGeneralDetail
                    })
                } else {
                    const tempLineItemResponseList = _.cloneDeep(surveyResponse.lineItemResponseList)
                    tempLineItemResponseList[screenIndex] = tempResponse
                    setSurveyResponse({
                        ...surveyResponse,
                        lineItemResponseList: tempLineItemResponseList
                    })
                }
            }
        }
    }

    const imagePickerCameraOption: any = {
        mediaType: 'photo',
        compressImageQuality: 0.6,
        cropping: false,
        includeBase64: true,
        compressImageMaxHeight: 720
    }

    const uploadFromCamera = async (questionIndex, screenIndex, isGeneralDetail) => {
        try {
            const { data } = (await ImagePicker.openCamera(imagePickerCameraOption)) as ImageType
            const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
            openPopup()
            await handleUploadPhoto(data, questionIndex, screenIndex, isGeneralDetail, 0, tempResponse)
            closePopup()
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'EquipmentSurvey: uploadFromCamera',
                'UploadFromCamera Error: ' + getStringValue(e)
            )
            closePopup()
            openPopup(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_UPLOAD_PHOTO_FAILED}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }
    const uploadFromLibrary = async (questionIndex, screenIndex, isGeneralDetail, questionAnswerLength) => {
        try {
            const imagePickerLibraryOption: any = {
                mediaType: 'photo',
                compressImageQuality: 0.6,
                cropping: false,
                includeBase64: true,
                compressImageMaxHeight: 720,
                multiple: true,
                maxFiles: 3 - questionAnswerLength
            }
            const dataList = (await ImagePicker.openPicker(imagePickerLibraryOption)) as ImageType[]
            const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
            openPopup()
            for (let i = 0; i < dataList.length; i++) {
                await handleUploadPhoto(dataList[i].data, questionIndex, screenIndex, isGeneralDetail, i, tempResponse)
            }
            closePopup()
        } catch (e) {
            await storeClassLog(
                Log.MOBILE_ERROR,
                'EquipmentSurvey: uploadFromLibrary',
                'UploadFromLibrary Error: ' + getStringValue(e)
            )
            closePopup()
            openPopup(
                <ProcessDoneModal type={'failed'}>
                    <PopMessage>{t.labels.PBNA_MOBILE_UPLOAD_PHOTO_FAILED}</PopMessage>
                </ProcessDoneModal>,
                t.labels.PBNA_MOBILE_OK
            )
        }
    }

    // We use free text as photo
    const renderFreeTextAnswer = (question, questionIndex, screenIndex, isGeneralDetail) => {
        return (
            <View style={commonStyle.flexDirectionRow}>
                {question.Answer &&
                    question.Answer.map((versionDataUrl, photoIndex) => {
                        return (
                            <TouchableOpacity
                                style={styles.photoStyle}
                                key={versionDataUrl}
                                onPress={() => {
                                    setTempVersionDataUrl(versionDataUrl)
                                    setShowPhoto(true)
                                }}
                            >
                                <FastImage
                                    source={{
                                        uri: `${CommonParam.endpoint}${versionDataUrl}`,
                                        headers: {
                                            Authorization: `Bearer ${CommonParam.accessToken}`,
                                            accept: 'image/png'
                                        },
                                        cache: FastImage.cacheControl.web
                                    }}
                                    style={styles.fastImgStyle}
                                />
                                {!disableChange && (
                                    <TouchableOpacity
                                        style={styles.surveyAnswerContainer}
                                        hitSlop={styles.surveyAnswerHitSlop}
                                        onPress={async () => {
                                            try {
                                                setChangeSurveyAnswer(true)
                                                const tempResponse = cloneResponse(screenIndex, isGeneralDetail)
                                                tempResponse.questionList[questionIndex].Answer.splice(photoIndex, 1)
                                                if (screenIndex === -1) {
                                                    setSurveyResponse({
                                                        ...surveyResponse,
                                                        headerResponse: tempResponse
                                                    })
                                                } else {
                                                    if (isGeneralDetail) {
                                                        const tempGeneralDetail = _.cloneDeep(
                                                            surveyResponse.generalEquipmentResponseList
                                                        )
                                                        tempGeneralDetail[screenIndex] = tempResponse
                                                        setSurveyResponse({
                                                            ...surveyResponse,
                                                            generalEquipmentResponseList: tempGeneralDetail
                                                        })
                                                    } else {
                                                        const tempLineItemResponseList = _.cloneDeep(
                                                            surveyResponse.lineItemResponseList
                                                        )
                                                        tempLineItemResponseList[screenIndex] = tempResponse
                                                        setSurveyResponse({
                                                            ...surveyResponse,
                                                            lineItemResponseList: tempLineItemResponseList
                                                        })
                                                    }
                                                }
                                            } catch (e) {
                                                await storeClassLog(
                                                    Log.MOBILE_ERROR,
                                                    'EquipmentSurvey: renderFreeTextAnswer',
                                                    'RenderFreeTextAnswer Error: ' + getStringValue(e)
                                                )
                                                closePopup()
                                                openPopup(
                                                    <ProcessDoneModal type={'failed'}>
                                                        <PopMessage>
                                                            {t.labels.PBNA_MOBILE_REMOVE_PHOTO_FAILED}
                                                        </PopMessage>
                                                    </ProcessDoneModal>,
                                                    t.labels.PBNA_MOBILE_OK
                                                )
                                            }
                                        }}
                                    >
                                        <CText style={styles.textStyle}>-</CText>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                {!disableChange && (question.Answer === null || question.Answer.length < 3) && (
                    <TouchableOpacity
                        style={styles.pendingContainer}
                        onPress={() => {
                            Alert.alert(t.labels.PBNA_MOBILE_UPLOAD_PHOTO, '', [
                                {
                                    text: t.labels.PBNA_MOBILE_CAMERA,
                                    onPress: () => {
                                        uploadFromCamera(questionIndex, screenIndex, isGeneralDetail)
                                    }
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_PHOTO_ALBUM,
                                    onPress: () => {
                                        uploadFromLibrary(
                                            questionIndex,
                                            screenIndex,
                                            isGeneralDetail,
                                            question?.Answer?.length || 0
                                        )
                                    }
                                },
                                {
                                    text: t.labels.PBNA_MOBILE_CANCEL,
                                    style: 'cancel'
                                }
                            ])
                        }}
                    >
                        <PhotoPlaceholder style={commonStyle.flex_1} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    const renderAnswer = (question, questionIndex, screenIndex, isGeneralDetail) => {
        switch (question.QuestionType) {
            case SURVEY_QUESTION_TYPES.RADIO_BUTTON:
                return renderRadioButtonAnswer(question, questionIndex, screenIndex, isGeneralDetail)
            case SURVEY_QUESTION_TYPES.MULTI_CHOICE:
                return renderMultiSelectionAnswer(question, questionIndex, screenIndex, isGeneralDetail)
            case SURVEY_QUESTION_TYPES.SHORT_TEXT:
                return renderShortTextAnswer(question, questionIndex, screenIndex, isGeneralDetail)
            case SURVEY_QUESTION_TYPES.FREE_TEXT:
                return renderFreeTextAnswer(question, questionIndex, screenIndex, isGeneralDetail)
            default:
                return <View />
        }
    }

    const renderQuestion = (question, questionIndex, screenIndex, questionList, isGeneralDetail = false) => {
        if (judgeRenderQuestion(question, questionIndex, screenIndex, questionList, isGeneralDetail)) {
            return (
                <View style={styles.surveyItemContainer} key={questionIndex}>
                    <View style={styles.questionContainer}>
                        <CText style={styles.redColor}>{question.isRequired ? '*' : ''}</CText>
                        <CText>{question.QuestionName}</CText>
                    </View>
                    <View
                        style={
                            question.QuestionType === SURVEY_QUESTION_TYPES.RADIO_BUTTON
                                ? styles.horizontalAnswerContainer
                                : {}
                        }
                    >
                        {renderAnswer(question, questionIndex, screenIndex, isGeneralDetail)}
                    </View>
                </View>
            )
        }
        return <View />
    }

    const setAllTab = () => {
        setShowFirstPageContent(!showAll)
        setShowSecondPageContent(!showAll)
        const tempShowLineItemContentList = []
        showLineItemContentList.forEach(() => {
            tempShowLineItemContentList.push(!showAll)
        })
        setShowLineItemContentList(tempShowLineItemContentList)
        setShowTypePageContent(!showAll)
        const tempShowGeneralDetailContentList = []
        showGeneralEquipmentList.forEach(() => {
            tempShowGeneralDetailContentList.push(!showAll)
        })
        setShowGeneralEquipmentList(tempShowGeneralDetailContentList)
    }

    const isAllQuestionAnswered = (response) => {
        let isAllAnswered: boolean = true
        response?.questionList?.forEach((question) => {
            if (
                question.visibilityRule === null ||
                judgeVisibleByRule(question.visibilityRule, response.questionList)
            ) {
                if (question.isRequired) {
                    isAllAnswered = isAllAnswered && !_.isEmpty(question.Answer)
                }
            }
        })
        return isAllAnswered
    }

    useEffect(() => {
        let flag = showFirstPageContent || showSecondPageContent
        showLineItemContentList.forEach((v) => {
            flag = flag || v
        })
        setShowAll(flag)
    }, [showSecondPageContent, showFirstPageContent])

    return (
        <View style={commonStyle.flex_1}>
            <View style={styles.expandAllView}>
                <TouchableOpacity
                    style={commonStyle.flexRowCenter}
                    onPress={() => {
                        setAllTab()
                    }}
                >
                    <CText style={styles.showAllText}>
                        {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                    </CText>
                    <ChevronBlue
                        width={19}
                        height={20}
                        style={{
                            transform: [{ rotate: showAll ? '0deg' : '180deg' }]
                        }}
                    />
                </TouchableOpacity>
            </View>
            <KeyboardAwareScrollView
                style={[commonStyle.flex_1, { paddingHorizontal: 22 }]}
                showsVerticalScrollIndicator={false}
            >
                <CollapseContainer
                    containerStyle={styles.collapseContainerStyle}
                    showContent={showFirstPageContent}
                    noTopLine
                    setShowContent={() => {
                        setShowFirstPageContent((v) => !v)
                    }}
                    title={t.labels.PBNA_MOBILE_PRE_SITE_ARRIVAL_DETAILS}
                    showReset={false}
                >
                    {surveyResponse.headerResponse?.questionList.map((question, questionIndex) => {
                        return renderQuestion(question, questionIndex, -1, surveyResponse.headerResponse?.questionList)
                    })}
                    <View style={styles.pendingContainer2} />
                </CollapseContainer>
                {surveyResponse?.generalEquipmentResponseList?.length > 0 && (
                    <CollapseContainer
                        containerStyle={styles.collapseContainerStyle}
                        showContent={showTypePageContent}
                        setShowContent={() => {
                            setShowTypePageContent((v) => !v)
                        }}
                        title={t.labels.PBNA_MOBILE_GENERAL_EQUIPMENT_DETAILS}
                        showReset={false}
                    >
                        <CText style={styles.applyToAll}>
                            {t.labels.PBNA_MOBILE_APPLIES_TO_ALL_EQUIPMENTS_BY_TYPE}
                            <CText style={{ color: baseStyle.color.red }}>*</CText>
                        </CText>
                        {surveyResponse?.generalEquipmentResponseList?.map((item, itemIndex) => {
                            return (
                                <CollapseContainer
                                    containerStyle={styles.collapseContainerStyle}
                                    showContent={showGeneralEquipmentList[itemIndex]}
                                    noTopLine
                                    noBottomLine
                                    setShowContent={() => {
                                        setShowGeneralEquipmentList((v) => {
                                            const temp = _.cloneDeep(v)
                                            temp[itemIndex] = !temp[itemIndex]
                                            return temp
                                        })
                                    }}
                                    title={item.type}
                                    showReset={false}
                                    key={item.type}
                                >
                                    {item?.questionList.map((question, questionIndex) => {
                                        return renderQuestion(
                                            question,
                                            questionIndex,
                                            itemIndex,
                                            item.questionList,
                                            true
                                        )
                                    })}
                                </CollapseContainer>
                            )
                        })}
                        <View style={styles.pendingContainer2} />
                    </CollapseContainer>
                )}
                <CollapseContainer
                    containerStyle={styles.collapseContainerStyle}
                    showContent={showSecondPageContent}
                    setShowContent={() => {
                        setShowSecondPageContent((v) => !v)
                    }}
                    title={t.labels.PBNA_MOBILE_EQUIPMENT_DETAILS}
                    showReset={false}
                >
                    {installRequestLineItems.map((lineItem, lineItemIndex) => {
                        return (
                            <View key={lineItem.Id}>
                                <View style={styles.installRequestLineItems}>
                                    <View>
                                        <View style={styles.equipmentImgContainer}>
                                            <EquipmentImageDisplay
                                                subtypeCde={lineItem.std_setup_equip_id__c}
                                                imageStyle={styles.equipmentImgContainerStyle}
                                                filedPath={CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_BRANDING_URL}
                                                equipTypeDesc={equipmentTypeCodeDesc[lineItem.Equip_type_cde__c]}
                                            />
                                            {isAllQuestionAnswered(
                                                surveyResponse.lineItemResponseList[lineItemIndex]
                                            ) && (
                                                <Image
                                                    source={require('../../../../../../assets/image/icon-checkmark-circle-fill.png')}
                                                    style={styles.eImgCheck}
                                                />
                                            )}
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            marginLeft: 20
                                        }}
                                    >
                                        <CText style={styles.setUpDescStyle} numberOfLines={1}>
                                            {lineItem.equip_setup_desc__c
                                                ? lineItem.equip_setup_desc__c
                                                : lineItem.Name}
                                        </CText>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const tempShowLineItemContentList = _.cloneDeep(showLineItemContentList)
                                            tempShowLineItemContentList[lineItemIndex] =
                                                !tempShowLineItemContentList[lineItemIndex]
                                            setShowLineItemContentList(tempShowLineItemContentList)
                                        }}
                                        style={styles.chevronSvgContainer}
                                    >
                                        <ChevronSvg
                                            style={[
                                                styles.chevronIcon,
                                                {
                                                    transform: [
                                                        {
                                                            rotate: showLineItemContentList[lineItemIndex]
                                                                ? '0deg'
                                                                : '180deg'
                                                        }
                                                    ]
                                                }
                                            ]}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Collapsible collapsed={!showLineItemContentList[lineItemIndex]}>
                                    {surveyResponse.lineItemResponseList[lineItemIndex]?.questionList.map(
                                        (question, questionIndex) => {
                                            return (
                                                <View key={question.Id}>
                                                    {renderQuestion(
                                                        question,
                                                        questionIndex,
                                                        lineItemIndex,
                                                        surveyResponse.lineItemResponseList[lineItemIndex]?.questionList
                                                    )}
                                                </View>
                                            )
                                        }
                                    )}
                                </Collapsible>
                            </View>
                        )
                    })}
                    <View style={styles.pendingContainer2} />
                </CollapseContainer>
            </KeyboardAwareScrollView>
            <Modal visible={showPhoto}>
                <TouchableOpacity
                    style={commonStyle.flex_1}
                    onPress={() => {
                        setShowPhoto(false)
                    }}
                >
                    <FastImage
                        source={{
                            uri: `${CommonParam.endpoint}${tempVersionDataUrl}`,
                            headers: {
                                Authorization: `Bearer ${CommonParam.accessToken}`,
                                accept: 'image/png'
                            },
                            cache: FastImage.cacheControl.web
                        }}
                        style={commonStyle.flex_1}
                        resizeMode={'contain'}
                    />
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default EquipmentSurvey
