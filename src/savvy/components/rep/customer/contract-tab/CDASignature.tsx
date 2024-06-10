import React, { useEffect, useRef, useState } from 'react'
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { StyleSheet, Image, Modal, TouchableOpacity, View, TextInput, ImageBackground, Dimensions } from 'react-native'
import SignatureBottomBtn from '../../../merchandiser/SignatureBottomBtn'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { renderCDAStoreIcon } from '../CustomerListTile'
import { useDispatch, useSelector } from 'react-redux'
import { setSurveyQuestions } from '../../../../redux/action/ContractAction'
import { initSurveyQuestions } from '../../../../redux/reducer/ContractReducer'
import { CommonParam } from '../../../../../common/CommonParam'
import _ from 'lodash'
import { hasIllegalCharacter } from '../../../../helper/rep/ContractHelper'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { ContractStatus } from '../../../../enums/Contract'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    ...commonStyle,
    boxWithShadow: {
        marginRight: 22,
        shadowColor: '#004C97',
        marginLeft: 22,
        shadowOpacity: 0.17,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        borderRadius: 6,
        elevation: 5,
        marginBottom: 17
    },
    boxContent: {
        backgroundColor: '#FFF',
        padding: 20,
        flexDirection: 'row',
        paddingTop: 26,
        paddingBottom: 26,
        borderTopLeftRadius: 6,
        flexGrow: 1,
        borderTopRightRadius: 6,
        alignItems: 'center'
    },
    box: {
        borderRadius: 6,
        overflow: 'hidden'
    },
    contentText: {
        flexDirection: 'column',
        flexShrink: 1
    },
    itemTile: {
        fontWeight: '900',
        color: '#000',
        alignSelf: 'flex-start',
        fontSize: 18
    },
    itemSubTile: {
        flexWrap: 'wrap',
        color: '#565656',
        fontSize: 12,
        alignSelf: 'flex-start'
    },
    borderBottom: {
        borderBottomRightRadius: 6,
        borderBottomLeftRadius: 6
    },
    location: {
        borderColor: 'rgba(108, 12, 195, 0.8)',
        borderWidth: 0,
        borderTopWidth: 0,
        shadowColor: 'rgba(108, 12, 195, 0.8)',
        elevation: 5,
        shadowRadius: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8
    },
    imageGroup: {
        position: 'relative',
        marginRight: 15
    },
    status: {
        right: 0,
        height: 22,
        position: 'absolute',
        width: 22,
        bottom: 0
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    },
    clearBtnText: {
        fontSize: 16,
        color: 'rgb(211, 211, 211)',
        fontWeight: '700'
    },
    active: {
        color: 'rgb(0, 162, 217)'
    },
    icon: {
        marginLeft: 5,
        height: 16,
        width: 15
    },
    signPadStyle: {
        position: 'absolute',
        bottom: 0,
        height: 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomWidth: 15,
        borderBottomColor: '#F2F4F7',
        width: 0
    },
    iconStyle: {
        width: 58,
        height: 58
    },
    clear: {
        paddingLeft: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 35,
        position: 'absolute',
        zIndex: 1
    },
    textTitle: {
        color: 'rgb(86, 86, 86)',
        marginLeft: 22
    },
    inputBoxContainer: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '400',
        marginBottom: 20,
        paddingVertical: 9,
        marginHorizontal: 22
    },
    inputBoxContainerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },

    boxContentStyle: {
        borderTopLeftRadius: 6,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        borderTopRightRadius: 6,
        flexGrow: 1,
        paddingTop: 19,
        paddingBottom: 19
    },
    absolute: {
        minHeight: 334,
        flex: 1,
        width: 428,
        position: 'absolute'
    },
    infoView: {
        marginTop: 71,
        marginHorizontal: 40,
        marginBottom: 30,
        width: 348
    },
    infoViewTitle: {
        marginRight: 'auto',
        fontWeight: '900',
        marginLeft: 'auto',
        textAlign: 'center',
        fontSize: 24,
        color: 'white'
    },
    signatureC: {
        backgroundColor: '#F2F4F7',
        height: 400,
        marginBottom: 30
    },
    signatureThumb: { height: 90, width: 72 },
    checkmarkC: { width: 28, height: 28, margin: 20 },
    scrollViewTopBackground: {
        position: 'absolute',
        top: '-30%',
        height: '30%',
        width: '100%',
        backgroundColor: '#F2F4F7'
    },
    dateText: { marginLeft: 22, marginTop: 10 },
    pdBottom30: { paddingBottom: 30 },
    pdBottom100: { paddingBottom: 100 },
    nextStepsSignatureContent: {
        marginHorizontal: 22,
        marginTop: 13,
        marginBottom: 30
    },
    signatureCardLayout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexDirection: 'row'
    },
    signatureCardSignBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 15
    },
    signatureCardSignText: {
        color: baseStyle.color.LightBlue,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    signatureCardSubText: {
        color: baseStyle.color.titleGray,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    signatureCardNameText: {
        color: baseStyle.color.titleGray
    },
    signatureCardTextView: {
        height: '85%',
        flexShrink: 1,
        marginLeft: 10,
        justifyContent: 'space-around'
    },
    signatureCardImageText: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.white
    },
    signatureCardImage: {
        width: 72,
        height: 90,
        borderRadius: 4,
        backgroundColor: baseStyle.color.bgGray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    nextStepsSegmentContentThreeTitle: {
        fontWeight: baseStyle.fontWeight.fw_900,
        fontSize: baseStyle.fontSize.fs_18,
        marginBottom: 30
    },
    signatureCard: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 6,
        borderColor: baseStyle.color.borderGray,
        borderWidth: 1,
        height: 100,
        paddingHorizontal: 5,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: baseStyle.color.tabShadowBlue,
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.17,
        shadowRadius: 6,
        marginBottom: 16
    },
    boldText: {
        fontWeight: '700'
    },
    marginLeftAuto: { marginLeft: 'auto' }
})

const style = `
    .m-signature-pad {
        background-color: transparent;
        box-shadow: 0 !important;
        border: 0 !important;
        position: absolute;
        width: 700px;
        height: 600px;
        top: 50%;
        left: 50%;
        margin-left: -350px;
        margin-top: -300px;
    }
    body {
        background: #F2F4F7;
    }
    body::after {
        content: "SIGN HERE";
        position: absolute;
        color: #FFF;
        font-size: 62px;
        text-align: center;
        top: 40%;
        left: 50%;
        font-weight:900;
        transform: translateX(-50%);
        z-index:-1
    }
    .m-signature-pad--body {
        border: 0 !important;
    }
    .m-signature-pad--body
    canvas {
        box-shadow: 0;
    }
    .m-signature-pad--footer
    {
        display: none;
    }`
const signPadBorder = () => {
    const elements = []
    const tWidth = width / 14
    for (let i = 0; i < 14; i++) {
        elements.push(
            <View
                style={[
                    styles.signPadStyle,
                    {
                        left: i * tWidth,
                        borderLeftWidth: tWidth / 2,
                        borderRightWidth: tWidth / 2
                    }
                ]}
                key={i}
            />
        )
    }
    return elements
}

const verifySignatureInput =
    (maxLength: number, setState: React.Dispatch<React.SetStateAction<string>>) => (text: string) =>
        !hasIllegalCharacter.test(text) && text.length <= maxLength && setState(text)

const signatureDataCache = {
    // Not apply FORMStatus to change check
    signedSurveyQuestions: { ...initSurveyQuestions, FORMStatus: '' }
}

interface VisitCardProps {
    item?: any
    retailStoreIcon?: React.ReactNode
}

export const VisitCard = (props: VisitCardProps) => {
    const { item, retailStoreIcon } = props
    const storeName = item.Name || item.name || ''
    const streetText = item.Street ? item.Street + ',' : item.address || ''
    const cityStateZip =
        item.City || item.State || item.PostalCode
            ? (item.City || '') + ', ' + (item.State || '') + ' ' + (item.PostalCode || '')
            : item.cityStateZip || ''

    return (
        <View style={[styles.boxWithShadow]}>
            <View style={styles.box}>
                <View style={[styles.boxContentStyle]}>
                    <View style={[styles.imageGroup]}>{retailStoreIcon}</View>
                    <View style={[styles.flex_1, styles.flexDirectionColumn]}>
                        <View style={styles.rowWithCenter}>
                            <View style={styles.contentText}>
                                <CText numberOfLines={3} style={styles.itemTile}>
                                    {storeName}
                                </CText>
                            </View>
                        </View>
                        <View style={[styles.rowWithCenter, styles.marginTop_5]}>
                            <View style={styles.contentText}>
                                <CText numberOfLines={1} style={[styles.itemSubTile]}>
                                    {streetText}
                                </CText>
                                <CText style={[styles.itemSubTile]}>{cityStateZip}</CText>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

interface CDASignatureProps {
    showModal: boolean
    customerWithNewTier: any
    isSalesRep?: boolean
    onClose: Function
}
export const CDASignature: React.FC<CDASignatureProps> = ({
    showModal,
    customerWithNewTier,
    isSalesRep = false,
    onClose
}) => {
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const dispatch = useDispatch()

    const [name, setName] = useState(isSalesRep ? CommonParam.userName : surveyQuestions.CustomerSignedName__c)
    const [title, setTitle] = useState(isSalesRep ? surveyQuestions.Description : surveyQuestions.CustomerSignedTitle)
    const [signature, setSignature] = useState('')

    const [scrollEnabled, setScrollEnabled] = useState(true)
    const ref = useRef<SignatureViewRef>(null)

    const clear = () => {
        ref.current?.clearSignature()
        setSignature('')
    }

    const handleEnd = () => {
        setScrollEnabled(true)
        ref.current?.readSignature()
    }

    const handleSave = () => {
        const dataToSave = isSalesRep
            ? {
                  SignedRepName: name,
                  Description: title,
                  RepSignature: signature
              }
            : {
                  CustomerSignedName__c: name,
                  CustomerSignedTitle: title,
                  CustomerSignature: signature
              }
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                ...dataToSave
            })
        )
        // Update signatureDataCache
        signatureDataCache.signedSurveyQuestions = { ...surveyQuestions, ...dataToSave, FORMStatus: '' }

        onClose()
    }

    const handleGoBack = () => {
        setSignature('')
        onClose()
    }

    const canSave = signature && name && title

    useEffect(() => {
        if (surveyQuestions.Contract_Status__c === ContractStatus.Signed) {
            dispatch(
                setSurveyQuestions({
                    ...surveyQuestions,
                    CustomerSignedName__c: '',
                    CustomerSignedTitle: ''
                })
            )
        }
    }, [])

    return (
        <Modal visible={showModal} style={[commonStyle.flex_1]}>
            <View>
                <ImageBackground
                    source={require('../../../../../../assets/image/PATTERN-BLUE-BG-IMG.png')}
                    resizeMode="cover"
                    style={styles.absolute}
                />

                <View style={styles.infoView}>
                    <CText style={styles.infoViewTitle} numberOfLines={3}>
                        {isSalesRep
                            ? t.labels.PBNA_MOBILE_CDA_SIGN_ACCEPT_MSG
                            : t.labels.PBNA_MOBILE_CDA_SIGN_PARTNER_MSG}
                    </CText>
                </View>
                <View style={styles.pdBottom30}>
                    <VisitCard
                        item={customerWithNewTier}
                        retailStoreIcon={renderCDAStoreIcon(customerWithNewTier.Signed_Medal_Tier__c, styles.iconStyle)}
                    />
                </View>
                {signPadBorder()}
            </View>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.pdBottom100}
                extraHeight={-20}
                scrollEnabled={scrollEnabled}
            >
                <View style={styles.scrollViewTopBackground} />
                <TouchableOpacity onPress={clear} disabled={!signature} style={styles.clear}>
                    <CText style={[styles.clearBtnText, signature ? styles.active : null]}>
                        {t.labels.PBNA_MOBILE_CLEAR.toUpperCase() + ' '}
                    </CText>
                    {signature ? (
                        <Image
                            style={styles.icon}
                            source={require('../../../../../../assets/image/icon-reload-Blue.png')}
                        />
                    ) : (
                        <Image
                            style={styles.icon}
                            source={require('../../../../../../assets/image/icon-reload-Grey.png')}
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.signatureC}>
                    <SignatureScreen
                        ref={ref}
                        dataURL={isSalesRep ? surveyQuestions.RepSignature : surveyQuestions.CustomerSignature}
                        onEnd={handleEnd}
                        onOK={setSignature}
                        onBegin={() => setScrollEnabled(false)}
                        webStyle={style}
                    />
                </View>
                <CText style={styles.textTitle}>{t.labels.PBNA_MOBILE_NAME}</CText>
                <TextInput
                    style={[styles.inputBoxContainer, !isSalesRep && styles.inputBoxContainerBorder]}
                    keyboardAppearance={'light'}
                    returnKeyType={'done'}
                    onChangeText={verifySignatureInput(100, setName)}
                    value={name}
                    allowFontScaling={false}
                    editable={!isSalesRep}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_NAME}
                />
                <CText style={styles.textTitle}>{t.labels.PBNA_MOBILE_TITLE}</CText>
                <TextInput
                    style={[styles.inputBoxContainer, styles.inputBoxContainerBorder]}
                    keyboardAppearance={'light'}
                    returnKeyType={'done'}
                    onChangeText={verifySignatureInput(40, setTitle)}
                    value={title}
                    allowFontScaling={false}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_TITLE}
                />
                <CText style={styles.textTitle}>{t.labels.PBNA_MOBILE_DATE}</CText>
                <CText style={styles.dateText}>{moment().format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
            </KeyboardAwareScrollView>
            <SignatureBottomBtn goback={handleGoBack} checkOutHandler={handleSave} isDisabled={!canSave} />
        </Modal>
    )
}

export const CDASignatureTab = () => {
    const dispatch = useDispatch()
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)

    const customerDetailWithNewTier = {
        ...customerDetail,
        Signed_Medal_Tier__c: surveyQuestions.Signed_Medal_Tier__c
    }

    // if surveyQuestions changes reset signature state to init, also run once on component load
    useEffect(() => {
        if (!_.isEqual(signatureDataCache.signedSurveyQuestions, { ...surveyQuestions, FORMStatus: '' })) {
            if (surveyQuestions.Contract_Status__c === ContractStatus.Signed) {
                dispatch(
                    setSurveyQuestions({
                        ...surveyQuestions,
                        CustomerSignature: '',
                        RepSignature: '',
                        CustomerSignedName__c: '',
                        CustomerSignedTitle: ''
                    })
                )
            } else {
                dispatch(
                    setSurveyQuestions({
                        ...surveyQuestions,
                        CustomerSignature: '',
                        RepSignature: ''
                    })
                )
            }
        }
    }, [])

    const [showCustomerSign, setShowCustomerSign] = useState(false)
    const [showRepSign, setShowRepSign] = useState(false)
    return (
        <View style={styles.nextStepsSignatureContent}>
            <CText style={styles.nextStepsSegmentContentThreeTitle}>{t.labels.PBNA_MOBILE_SIGNATURE}</CText>
            <View style={styles.signatureCard}>
                <View style={styles.signatureCardLayout}>
                    {surveyQuestions.CustomerSignature ? (
                        <Image
                            style={styles.signatureThumb}
                            resizeMode="center"
                            source={{ uri: surveyQuestions.CustomerSignature }}
                        />
                    ) : (
                        <View style={styles.signatureCardImage}>
                            <CText style={styles.signatureCardImageText}>
                                {t.labels.PBNA_MOBILE_SIGN_HERE.toUpperCase()}
                            </CText>
                        </View>
                    )}
                    <View style={styles.signatureCardTextView}>
                        <View>
                            <CText numberOfLines={1} style={styles.boldText}>
                                {customerDetail.Name}
                            </CText>
                        </View>
                        <View>
                            <CText numberOfLines={1}>
                                {surveyQuestions.CustomerSignedName__c || t.labels.PBNA_MOBILE_NAME}
                            </CText>
                            <CText numberOfLines={1} style={styles.signatureCardSubText}>
                                {surveyQuestions.CustomerSignedTitle || t.labels.PBNA_MOBILE_DESIGNATION}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.marginLeftAuto}>
                        {surveyQuestions.CustomerSignature ? (
                            <Image
                                style={styles.checkmarkC}
                                source={require('../../../../../../assets/image/icon-checkmark-circle.png')}
                            />
                        ) : (
                            <TouchableOpacity onPress={() => setShowCustomerSign(true)}>
                                <View style={styles.signatureCardSignBtn}>
                                    <CText style={styles.signatureCardSignText}>
                                        {t.labels.PBNA_MOBILE_SIGN.toUpperCase()}
                                    </CText>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.signatureCard}>
                <View style={styles.signatureCardLayout}>
                    {surveyQuestions.RepSignature ? (
                        <Image
                            style={styles.signatureThumb}
                            resizeMode="center"
                            source={{ uri: surveyQuestions.RepSignature }}
                        />
                    ) : (
                        <View style={styles.signatureCardImage}>
                            <CText style={styles.signatureCardImageText}>
                                {t.labels.PBNA_MOBILE_SIGN_HERE.toUpperCase()}
                            </CText>
                        </View>
                    )}
                    <View style={styles.signatureCardTextView}>
                        <View>
                            <CText style={styles.boldText}>{t.labels.PBNA_MOBILE_PEPSICO}</CText>
                        </View>
                        <View>
                            <CText>{surveyQuestions.SignedRepName || CommonParam.userName}</CText>
                            <CText style={styles.signatureCardSubText}>
                                {surveyQuestions.Description || CommonParam.PERSONA__c}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.marginLeftAuto}>
                        {surveyQuestions.RepSignature ? (
                            <Image
                                style={styles.checkmarkC}
                                source={require('../../../../../../assets/image/icon-checkmark-circle.png')}
                            />
                        ) : (
                            <TouchableOpacity onPress={() => setShowRepSign(true)}>
                                <View style={styles.signatureCardSignBtn}>
                                    <CText style={styles.signatureCardSignText}>
                                        {t.labels.PBNA_MOBILE_SIGN.toUpperCase()}
                                    </CText>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <CDASignature
                showModal={showCustomerSign}
                customerWithNewTier={customerDetailWithNewTier || {}}
                onClose={() => setShowCustomerSign(false)}
            />
            <CDASignature
                showModal={showRepSign}
                customerWithNewTier={customerDetailWithNewTier || {}}
                onClose={() => setShowRepSign(false)}
                isSalesRep
            />
        </View>
    )
}
