import React, { FC, useState } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Input } from 'react-native-elements'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import { equipmentModalStyle } from '../equipment-tab/InstallRequestModal'
import { useDispatch, useSelector } from 'react-redux'
import { setSurveyQuestions } from '../../../../redux/action/ContractAction'
import _ from 'lodash'
import { AssessmentIndicators, EstimatedValuesEnum, IntEnum, PercentageEnum } from '../../../../enums/Contract'
import { initSurveyQuestions } from '../../../../redux/reducer/ContractReducer'
import { inputIntOnChange, wholeOrDecimalNumber } from '../../../../helper/rep/ContractHelper'
import CollapseContainer from '../../../common/CollapseContainer'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import { FORMCard } from '../../../common/FORMCard'
import { FormStatus } from './SurveyQuestionsModal'
import { handlePressFormBtnHelper } from '../../../../helper/rep/StartNewCDAHelper'
import SpaceReviewInput from './SpaceReviewInput'

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
    collapseImg: { height: 22, width: 22 }
})
interface SpaceReviewPageProps {
    answer: typeof initSurveyQuestions
    setAnswer: Function
    setTotalAnswer: Function
    onFormButtonClicked: Function
    formStatus: FormStatus
    GSCId: string
    missionId: string
}
type SingleQuestionTileParam = {
    text: string
    answer: string
    setAnswer: Function
    initAnswer?: string
    longText?: boolean
    showRedStar?: boolean
    isNoZero?: boolean // cannot enter zero
    isNeedChangedBorder?: boolean
    isEditable?: boolean
}
export const singleQuestionTile = (param: SingleQuestionTileParam) => {
    const {
        text,
        answer,
        setAnswer,
        longText = false,
        showRedStar = false,
        isNoZero = false,
        isNeedChangedBorder = true,
        isEditable = true,
        initAnswer = ''
    } = param
    return (
        <View style={[styles.tableRowView, styles.singleQuestionC]}>
            <View style={longText ? styles.tableRowTitleViewSingle : styles.tableRowTitleView}>
                <CText style={styles.tableRowTitleText}>{text}</CText>
                {showRedStar && <CText style={styles.redStar}>*</CText>}
            </View>
            <SpaceReviewInput
                initialInputValue={initAnswer || answer}
                onChangeText={(text: string) => {
                    setAnswer(inputIntOnChange(text, isNoZero ? IntEnum.ONE : '', IntEnum.NINE_HUNDRED_AND_NINETY_NINE))
                }}
                value={answer}
                isNeedChangedBorder={isNeedChangedBorder}
                isEditable={isEditable}
            />
        </View>
    )
}

const totalQuestionTile = (
    text: string,
    id: undefined | string,
    answer: string[],
    setAnswer: Function,
    showGap = false
) => {
    let total = ''
    try {
        const firstField = parseFloat(answer[0] || '0')
        const secondField = parseFloat(answer[1] || '0')
        const thirdField = parseFloat(answer[2] || '0')
        total = answer?.some((i) => i) // Check at least one field is fielded
            ? (
                  (firstField * PercentageEnum.ONE_THOUSAND +
                      secondField * PercentageEnum.ONE_THOUSAND +
                      thirdField * PercentageEnum.ONE_THOUSAND) /
                  PercentageEnum.ONE_THOUSAND
              ).toString()
            : ''
    } catch {}

    return (
        <View key={id} style={[styles.tableRowTitleViewTotal, showGap && { borderBottomWidth: 1 }]}>
            <CText style={[styles.tableRowTitleText, styles.width83]}>{text}</CText>
            <Input // For Total Field
                containerStyle={[styles.tableRowInput, styles.totalContainer]}
                inputContainerStyle={styles.borderBottomColor0}
                returnKeyType="done"
                textAlign="center"
                editable={false}
                multiline={parseFloat(total) > 99999}
                inputStyle={styles.tableRowInputStyle}
                value={total}
            />
            <Input
                containerStyle={styles.tableRowInputTotal}
                textAlign="center"
                returnKeyType="done"
                inputContainerStyle={styles.borderBottomColor0}
                onChangeText={(text) => {
                    if (_.isEmpty(text) || wholeOrDecimalNumber.test(text)) {
                        setAnswer([text, answer[1], answer[2]])
                    }
                }}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={answer[0]}
            />
            <Input
                containerStyle={styles.tableRowInputTotal}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                onChangeText={(text) => {
                    if (_.isEmpty(text) || wholeOrDecimalNumber.test(text)) {
                        setAnswer([answer[0], text, answer[2]])
                    }
                }}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={answer[1]}
            />
            <Input
                containerStyle={styles.tableRowInputTotal}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                onChangeText={(text) => {
                    if (_.isEmpty(text) || wholeOrDecimalNumber.test(text)) {
                        setAnswer([answer[0], answer[1], text])
                    }
                }}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={answer[2]}
            />
        </View>
    )
}

const otherQuestionTile = (
    text: string,
    id: undefined | string,
    answer: string[],
    setAnswer: Function,
    showGap = false
) => {
    let total = ''
    try {
        const firstField = parseFloat(answer[0] || '0')
        const secondField = parseFloat(answer[1] || '0')
        const thirdField = parseFloat(answer[2] || '0')
        total = answer?.some((i) => i) // Check at least one field is fielded
            ? (
                  (firstField * PercentageEnum.ONE_THOUSAND +
                      secondField * PercentageEnum.ONE_THOUSAND +
                      thirdField * PercentageEnum.ONE_THOUSAND) /
                  PercentageEnum.ONE_THOUSAND
              ).toString()
            : ''
    } catch {}
    return (
        <View key={id} style={[styles.tableRowTitleViewTotal, showGap && { borderBottomWidth: 1 }]}>
            <CText style={[styles.tableRowTitleText, styles.width83]}>{text}</CText>
            <Input // For Total Field
                containerStyle={[styles.tableRowInput, styles.totalContainer]}
                inputContainerStyle={styles.borderBottomColor0}
                returnKeyType="done"
                textAlign="center"
                editable={false}
                inputStyle={styles.tableRowInputStyle}
                value={total}
            />
            <Input
                editable={false}
                containerStyle={[styles.tableRowInputTotal, styles.nullContainer]}
                textAlign="center"
                returnKeyType="done"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={EstimatedValuesEnum.UNDEFINED}
            />
            <Input
                editable={false}
                containerStyle={[styles.tableRowInputTotal, styles.nullContainer]}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={EstimatedValuesEnum.UNDEFINED}
            />
            <Input
                containerStyle={styles.tableRowInputTotal}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={answer[2]}
                onChangeText={(text) => {
                    if (_.isEmpty(text) || wholeOrDecimalNumber.test(text)) {
                        setAnswer([answer[0], answer[1], text])
                    }
                }}
            />
        </View>
    )
}

const totalTitle = (text: string, answers: any) => {
    let [total, totalPepsiShelf, totalCokeShelf, totalOtherShelf] = [0, 0, 0, 0]
    _.values(answers).forEach((answer) => {
        totalPepsiShelf += parseFloat(answer[0] || '0')
        totalCokeShelf += parseFloat(answer[1] || '0')
        totalOtherShelf += parseFloat(answer[2] || '0')
        total =
            (totalPepsiShelf * PercentageEnum.ONE_THOUSAND +
                totalCokeShelf * PercentageEnum.ONE_THOUSAND +
                totalOtherShelf * PercentageEnum.ONE_THOUSAND) /
            PercentageEnum.ONE_THOUSAND
    })

    return (
        <View style={styles.tableRowTitleViewTotal}>
            <CText style={[styles.tableRowTitleText, styles.width83]}>{text}</CText>
            <Input // For Total Field
                containerStyle={[styles.tableRowInput, styles.totalContainer]}
                inputContainerStyle={styles.borderBottomColor0}
                returnKeyType="done"
                textAlign="center"
                editable={false}
                inputStyle={styles.tableRowInputStyle}
                value={total.toFixed(2) || '0'}
            />
            <Input
                editable={false}
                containerStyle={[styles.tableRowInputTotal, styles.nullContainer]}
                textAlign="center"
                returnKeyType="done"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={totalPepsiShelf.toFixed(2) || '0'}
            />
            <Input
                editable={false}
                containerStyle={[styles.tableRowInputTotal, styles.nullContainer]}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={totalCokeShelf.toFixed(2) || '0'}
            />
            <Input
                editable={false}
                containerStyle={[styles.tableRowInputTotal, styles.nullContainer]}
                returnKeyType="done"
                textAlign="center"
                inputContainerStyle={styles.borderBottomColor0}
                keyboardType="decimal-pad"
                inputStyle={styles.tableRowInputStyle}
                value={totalOtherShelf.toFixed(2) || '0'}
            />
        </View>
    )
}

function SpaceReviewHead({ showIRSync }: { showIRSync?: boolean }) {
    return (
        <View style={[styles.revertContainer, commonStyle.marginBottom_10, commonStyle.marginTop_15]}>
            {showIRSync ? (
                <View style={commonStyle.flexDirectionRow}>
                    <Image source={ImageSrc.REVERT} style={styles.irSyncImage} />
                    <CText style={styles.irSyncText}>{t.labels.PBNA_MOBILE_CDA_IR_SYNC.toLocaleUpperCase()}</CText>
                </View>
            ) : (
                <View style={styles.width72} />
            )}
            <View style={commonStyle.flexRowAlignCenter}>
                <CText style={styles.totalQuestionText}>{t.labels.PBNA_MOBILE_TOTAL}</CText>
                <View style={styles.totalSubQuestion}>
                    <View style={styles.pepsiShelvesTop}>
                        <View style={commonStyle.flexRowJustifyCenter}>
                            <CText style={styles.font12}>{t.labels.PBNA_MOBILE_CDA_PEPSI}</CText>
                            <CText style={styles.redStar}>*</CText>
                        </View>
                        <CText style={styles.pepsiShelvesBottom}>{t.labels.PBNA_MOBILE_CDA_SHELVES}</CText>
                    </View>
                    <CText style={styles.cokeShelves}>{t.labels.PBNA_MOBILE_CDA_COKE_SHELVES}</CText>
                    <CText style={styles.otherShelves}>{t.labels.PBNA_MOBILE_CDA_OTHER_SHELVES}</CText>
                </View>
            </View>
        </View>
    )
}

const ContractSpaceReviewPage: FC<SpaceReviewPageProps> = (props: SpaceReviewPageProps) => {
    const answer = props.answer
    const setAnswer = props.setAnswer
    const setTotalAnswer = props.setTotalAnswer
    const onFormButtonClicked = props.onFormButtonClicked
    const { GSCId, missionId } = props
    const formStatus = props.formStatus
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const visitId = useSelector((state: any) => state.contractReducer.visitId)
    const [showCVSContainer] = useState(false) // Future setShowCVSContainer
    const [showSSContainer] = useState(false) // Future setShowSSContainer
    const totalAnswer = answer.SpaceReviewWithTotal
    const dispatch = useDispatch()
    const surveyQuestions = useSelector(
        (state: any) => state.contractReducer.surveyQuestions
    ) as typeof initSurveyQuestions
    const handleUpdateSpaceReviewQ2 = (text: string) => {
        dispatch(
            setSurveyQuestions({
                ...surveyQuestions,
                [AssessmentIndicators.TOTAL_LRB_SHELVES]: text,
                // If this value changes, the medal, and metric in step 3 needs to be re-entered
                Signed_Medal_Tier__c: '',
                [AssessmentIndicators.PROPOSED_PEP_LRB_PERCENTAGE]: '',
                [AssessmentIndicators.PROPOSED_PEP_LRB_SHELVES]: '',
                [AssessmentIndicators.PROPOSED_PEP_COLD_VAULT_SHELVES]: '',
                [AssessmentIndicators.PROPOSED_PEP_PERIMETER_SHELVES]: ''
            })
        )
    }

    const handlePressFormBtn = () => {
        handlePressFormBtnHelper(customerDetail, visitId, missionId, GSCId, onFormButtonClicked, false, '')
    }

    const categoryBreakdown = [
        {
            id: 'CSD',
            title: t.labels.PBNA_MOBILE_CDA_CSD
        },
        {
            id: 'Isotonic',
            title: t.labels.PBNA_MOBILE_CDA_ISOTONIC
        },
        {
            id: 'Tea',
            title: t.labels.PBNA_MOBILE_CDA_TEA
        },
        {
            id: 'Coffee',
            title: t.labels.PBNA_MOBILE_CDA_COFFEE
        },
        {
            id: 'Energy',
            title: t.labels.PBNA_MOBILE_CDA_ENERGY
        },
        {
            id: 'Enhanced Water',
            title: t.labels.PBNA_MOBILE_CDA_ENHANCED_WATER
        },
        {
            id: 'Water',
            title: t.labels.PBNA_MOBILE_CDA_WATER
        },
        {
            id: 'Juice Drinks',
            title: t.labels.PBNA_MOBILE_CDA_JUICE_DRINKS
        },
        {
            id: 'Protein',
            title: t.labels.PBNA_MOBILE_CDA_PROTEIN
        }
    ] as const
    return (
        <View>
            <FORMCard variant={formStatus} handlePressFormBtn={handlePressFormBtn} />

            {singleQuestionTile({
                text: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_DOOR_Q,
                answer: String(answer[AssessmentIndicators.DOOR_SURVEY]),
                setAnswer: (text: string) => setAnswer(AssessmentIndicators.DOOR_SURVEY, text),
                longText: true,
                showRedStar: true,
                isNeedChangedBorder: false
            })}
            {singleQuestionTile({
                text: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_TOTAL_SHELVES_Q,
                answer: String(answer[AssessmentIndicators.TOTAL_LRB_SHELVES]),
                setAnswer: handleUpdateSpaceReviewQ2,
                showRedStar: true,
                isNoZero: true,
                isNeedChangedBorder: false
            })}
            {singleQuestionTile({
                text: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_PEPSI_SHELVES_Q,
                answer: String(answer[AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES]),
                setAnswer: (text: string) => setAnswer([AssessmentIndicators.TOTAL_LRB_PEPSI_SHELVES], text),
                showRedStar: true,
                isNeedChangedBorder: false
            })}

            <View style={commonStyle.marginBottom_10} />
            <CollapseContainer
                noTopLine
                showContent={showCVSContainer}
                setShowContent={() => {}}
                title={t.labels.PBNA_MOBILE_CDA_COLD_VAULT_SURVEY}
                chevronIcon={<Image style={styles.collapseImg} source={ImageSrc.IMG_CLOCK_PENDING} />}
            >
                {singleQuestionTile({
                    text: t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_DOOR_Q,
                    answer: answer.SpaceReviewCvsN,
                    setAnswer: (text: string) => setAnswer('SpaceReviewCvsN', text),
                    longText: true,
                    isEditable: false
                })}
                <SpaceReviewHead />
                {totalQuestionTile(
                    t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_TOTAL_SHELVES_Q,
                    '',
                    totalAnswer.SpaceReviewCvsTotal,
                    (answers: string[]) => setTotalAnswer('SpaceReviewCvsTotal', answers)
                )}
                <View style={commonStyle.marginBottom_22} />
            </CollapseContainer>
            <CollapseContainer
                noTopLine
                showContent={showSSContainer}
                setShowContent={() => {}}
                title={t.labels.PBNA_MOBILE_SHELF_SURVEY}
                chevronIcon={<Image style={styles.collapseImg} source={ImageSrc.IMG_CLOCK_PENDING} />}
            >
                <SpaceReviewHead showIRSync />
                {totalTitle(t.labels.PBNA_MOBILE_CDA_SPACE_REVIEW_TOTAL_SHELVES_Q, totalAnswer)}
                <View style={styles.subContainer}>
                    <CText style={styles.subContainerTitle}>{t.labels.PBNA_MOBILE_CDA_CATEGORY_BREAKDOWN}</CText>
                </View>
                {categoryBreakdown.map((item, index) =>
                    totalQuestionTile(
                        item.title,
                        item.id,
                        totalAnswer[item.id],
                        (answers: string[]) => setTotalAnswer(item.id, answers),
                        index !== categoryBreakdown.length
                    )
                )}
                <View style={styles.subContainer}>
                    <CText style={styles.subContainerTitle}>{t.labels.PBNA_MOBILE_OTHER}</CText>
                </View>
                {totalQuestionTile(
                    t.labels.PBNA_MOBILE_CDA_CHILLED_JUICE,
                    '',
                    totalAnswer['Chilled Juice'],
                    (text: string[]) => setTotalAnswer('Chilled Juice', text)
                )}
                {otherQuestionTile(
                    t.labels.PBNA_MOBILE_OTHER_LRB,
                    AssessmentIndicators.OTHER_LRB_TOTAL,
                    totalAnswer[AssessmentIndicators.OTHER_LRB_TOTAL],
                    (text: string[]) => setTotalAnswer(AssessmentIndicators.OTHER_LRB_TOTAL, text)
                )}
                <View style={commonStyle.marginBottom_22} />
            </CollapseContainer>
        </View>
    )
}
export default ContractSpaceReviewPage
