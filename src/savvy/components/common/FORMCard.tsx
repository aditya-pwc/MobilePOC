import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { FORMStatusEnum } from '../../enums/Contract'
import React from 'react'
import FORMIconPurple from '../../../../assets/image/icon-form-purple.svg'
import FORMIconBlack from '../../../../assets/image/icon-form-black.svg'
import FORMIconGreen from '../../../../assets/image/icon-form-green.svg'
import FORMIconBlue from '../../../../assets/image/icon-form-blue.svg'
import FORMOpenLink from '../../../../assets/image/icon-open-link.svg'
import { t } from '../../../common/i18n/t'
import CText from '../../../common/components/CText'
import { equipmentModalStyle } from '../rep/customer/equipment-tab/InstallRequestModal'
import SurveyQuestionsStyle from '../../styles/manager/SurveyQuestionsStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { FormStatus } from '../rep/customer/contract-tab/SurveyQuestionsModal'
import { DebouncedButton } from '../../../common/components/Button'
export const styles = StyleSheet.create({
    ...equipmentModalStyle,
    ...SurveyQuestionsStyle,
    mainAlertIcon: {
        marginRight: 7
    },
    mainAlertTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 5,
        marginHorizontal: 22
    },
    alertText: {
        color: '#ea455b',
        textAlign: 'left',
        fontSize: 14
    },
    addPositionHitSlop: {
        top: -10,
        bottom: -10
    },

    editPosition: {
        marginLeft: 22,
        flexDirection: 'row',
        alignItems: 'center',
        height: 60
    },

    blueBoldText12: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    blueCameraIcon: {
        height: 13,
        width: 16,
        marginRight: 10
    },
    marginRight8: {
        marginRight: 8
    }
})

export const FORMCard = ({
    variant,
    handlePressFormBtn,
    isAudit = false,
    isDisabled = false
}: {
    variant: FormStatus
    handlePressFormBtn: Function
    isAudit?: boolean
    isDisabled?: boolean
}) => {
    const onPressFormBtn = () => {
        handlePressFormBtn && handlePressFormBtn()
    }

    if (variant === FORMStatusEnum.START) {
        return (
            <View style={styles.formStartContainer}>
                <View style={styles.formTitle}>
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                        <FORMIconPurple />
                        <CText style={styles.formText}>{t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_WITH_FROM}</CText>
                    </View>
                    <CText style={styles.font12}>
                        {isAudit
                            ? t.labels.PBNA_MOBILE_CDA_AUDIT_START_SPACE_REVIEW_DES
                            : t.labels.PBNA_MOBILE_CDA_START_SPACE_REVIEW_DES}
                    </CText>
                </View>
                <DebouncedButton
                    disabled={isDisabled}
                    onPress={onPressFormBtn}
                    style={[
                        commonStyle.flexRowCenter,
                        styles.formStepContainer,
                        isDisabled ? { backgroundColor: '#DDDDDD' } : null
                    ]}
                >
                    <CText style={styles.formMainText}>
                        {t.labels.PBNA_MOBILE_CDA_START_SPACE_REVIEW.toLocaleUpperCase()}
                    </CText>
                    <FORMOpenLink style={styles.marginLeft8} width="14" />
                </DebouncedButton>
            </View>
        )
    }

    if (variant === FORMStatusEnum.PENDING) {
        return (
            <View style={styles.formPendingContainer}>
                <View style={[styles.formTitle]}>
                    <View style={[commonStyle.flexDirectionRow, { marginBottom: 16 }]}>
                        <FORMIconBlack />
                        <CText style={styles.formCardTitle}>{t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_WITH_FROM}</CText>
                    </View>
                    <CText style={styles.formBodyText}>{t.labels.PBNA_MOBILE_CDA_START_SPACE_REVIEW_PENDING}</CText>
                </View>
                <View style={[commonStyle.flexRowCenter, styles.formPendingC]}>
                    <CText style={styles.formPendingText}>{t.labels.PBNA_MOBILE_CDA_START_SPACE_REVIEW_WAIT}</CText>
                </View>
            </View>
        )
    }
    if (variant === FORMStatusEnum.COMPLETE) {
        return (
            <View style={styles.formCompleteContainer}>
                <View style={[styles.formTitle]}>
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                        <FORMIconGreen />
                        <CText style={styles.formCardTitle}>
                            {t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_COMPLETE_TITLE}
                        </CText>
                    </View>
                    <CText style={styles.formBodyText}>
                        {isAudit
                            ? t.labels.PBNA_MOBILE_CDA_AUDIT_SPACE_REVIEW_COMPLETE
                            : t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_COMPLETE}
                    </CText>
                </View>
                <DebouncedButton onPress={onPressFormBtn} style={[commonStyle.flexRowCenter, styles.formCompleteC]}>
                    <CText style={styles.formCompleteText}>
                        {t.labels.PBNA_MOBILE_CDA_REINITIATE_SPACE_REVIEW.toLocaleUpperCase()}
                    </CText>
                    <FORMOpenLink style={styles.marginLeft8} width="14" />
                </DebouncedButton>
            </View>
        )
    }
    return null
}

export const RealogramFORMCard = ({
    handlePressRealogramFormBtn,
    formStatus,
    missionResponseIDReady
}: {
    handlePressRealogramFormBtn: Function
    formStatus: FORMStatusEnum
    missionResponseIDReady?: boolean
}) => {
    const onPressRealogramFormBtn = () => {
        handlePressRealogramFormBtn && handlePressRealogramFormBtn()
    }
    if (formStatus === FORMStatusEnum.START) {
        return (
            <View style={styles.formStartContainer}>
                <View style={styles.formTitle}>
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                        <FORMIconBlue />
                        <CText style={styles.formText}>{t.labels.PBNA_MOBILE_CREATE_REALOGRAM_WITH_FORM}</CText>
                    </View>
                    <CText style={styles.font12}>{t.labels.PBNA_MOBILE_CREATE_REALOGRAM_WITH_FORM_DES}</CText>
                </View>
                <DebouncedButton
                    onPress={onPressRealogramFormBtn}
                    style={[commonStyle.flexRowCenter, styles.formStepContainer]}
                >
                    <FORMOpenLink style={styles.marginRight8} width="14" />
                    <CText style={styles.formMainText}>
                        {t.labels.PBNA_MOBILE_CREATE_REALOGRAM.toLocaleUpperCase()}
                    </CText>
                </DebouncedButton>
            </View>
        )
    }

    if (formStatus === FORMStatusEnum.IR_PROCESSING_WITHOUT_EDIT_TAG) {
        return (
            <View style={styles.formView}>
                <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_22]}>
                    <FORMIconBlue />
                    <CText style={styles.formCardTitle}>{t.labels.PBNA_MOBILE_CREATE_REALOGRAM_WITH_FORM}</CText>
                </View>
                <CText style={styles.formBodyText}>{t.labels.PBNA_MOBILE_CREATE_REALOGRAM_WAIT_MSG}</CText>

                <View style={[commonStyle.flexRowCenter, { marginTop: 17 }]}>
                    <CText style={styles.formPendingText}>{t.labels.PBNA_MOBILE_CREATE_REALOGRAM_WAIT}</CText>
                </View>
            </View>
        )
    }

    if (formStatus === FORMStatusEnum.PENDING_REVIEW_WITHOUT_EDIT_TAG) {
        return (
            <View style={styles.formStartContainer}>
                <View style={styles.formTitle}>
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                        <FORMIconBlue />
                        <CText style={styles.formText}>{t.labels.PBNA_MOBILE_PENDING_IMAGE}</CText>
                    </View>
                    <CText style={styles.font12}>{t.labels.PBNA_MOBILE_REVIEW_FORM}</CText>
                </View>
                <TouchableOpacity
                    disabled={!missionResponseIDReady}
                    onPress={onPressRealogramFormBtn}
                    style={[commonStyle.flexRowCenter, styles.formStepContainer, { backgroundColor: '#00A2D9' }]}
                >
                    <FORMOpenLink style={styles.marginRight8} width="14" />
                    <CText style={styles.formMainText}>
                        {t.labels.PBNA_MOBILE_REVIEW_IMAGES_IR_TAGS.toLocaleUpperCase()}
                    </CText>
                </TouchableOpacity>
            </View>
        )
    }

    if (formStatus === FORMStatusEnum.IR_PROCESSING_WITH_EDIT_TAG) {
        return (
            <View style={styles.formView}>
                <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_22]}>
                    <FORMIconBlue />
                    <CText style={styles.formCardTitle}>{t.labels.PBNA_MOBILE_PROCESSING_IMAGE_IR_TAG_EDIT}</CText>
                </View>
                <CText style={styles.formBodyText}>{t.labels.PBNA_MOBILE_TAG_EDIT_BEING_PROCESSED}</CText>
                <View style={[commonStyle.flexRowCenter, { marginTop: 17 }]}>
                    <CText style={styles.formPendingText}>{t.labels.PBNA_MOBILE_REALOGRAM_GENERATION}</CText>
                </View>
            </View>
        )
    }

    if (formStatus === FORMStatusEnum.PENDING_REVIEW_WITH_EDIT_TAG) {
        return (
            <View style={styles.completeFormCard}>
                <View style={[styles.formTitle]}>
                    <View style={[commonStyle.flexDirectionRow, commonStyle.marginBottom_15]}>
                        <FORMIconGreen />
                        <CText style={styles.formCardTitle}>{t.labels.PBNA_MOBILE_REALOGRAM_COMPLETE_WITH_FORM}</CText>
                    </View>
                    <CText style={styles.formBodyText}>{t.labels.PBNA_MOBILE_REALOGRAM_RECOGNITION_IS_COMPLETE}</CText>
                </View>
            </View>
        )
    }
    return null
}
