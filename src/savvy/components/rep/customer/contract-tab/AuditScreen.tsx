import React, { FC, useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Alert } from 'react-native'
import _ from 'lodash'
import { FORMStatusEnum, IntervalTime, StepVal, getMedalMap } from '../../../../enums/Contract'
import HeaderOfModal from '../../lead/common/HeaderOfModal'
import StepView from './StepView'
import { useDispatch, useSelector } from 'react-redux'
import AuditStyle from '../../../../styles/manager/AuditStyle'
import { t } from '../../../../../common/i18n/t'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import {
    useAuditData,
    useDisableSave,
    useListenAuditFormUrl,
    useMissionId,
    useSpaceBreakdown
} from '../../../../hooks/AuditHooks'
import { handleSubmitAudit, resetAuditAndRefreshContractTab, syncAuditKPIs } from '../../../../helper/rep/AuditHelper'
import ComplianceViewPage from './ComplianceViewPage'
import { useNavigation } from '@react-navigation/native'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import SpaceBreakdownPage from './SpaceBreakdownPage'
import { VisitStatus, VisitSubType } from '../../../../enums/Visit'
import { FormStatus } from './SurveyQuestionsModal'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { handleAuditDeleteDraftWithId } from '../../../../helper/rep/ContractHelper'
import SpaceViewPage from './SpaceViewPage'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { LinearProgress } from 'react-native-elements'
import { ScoreModal } from './ScoreModal'
import { CDASuccessModal } from './CDASuccessModal'
import { setAuditData } from '../../../../redux/action/AuditAction'
import { useUpdateLocalFormStatus } from '../../../../hooks/StartNewCDAHooks'
import { syncUpObjUpdateFromMem } from '../../../../api/SyncUtils'

const auditStyles = StyleSheet.create({
    ...AuditStyle
})

const CDAStepStyleList = [auditStyles.stepOne, auditStyles.stepTwo, auditStyles.stepThree]
// The distance to the left is the screen width of step one
const transformLength = -100

interface AuditScreenProps {
    navigation: any
    visitSubtype: string
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    auditVisitId: string
    selectedMission: string
    route: any
    retailStore?: any
}

const AuditScreen: FC<AuditScreenProps> = (props) => {
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const { route } = props
    const {
        visitSubtype,
        setRefreshFlag,
        auditVisitId,
        locProdId,
        selectedMission,
        isEdit = false,
        retailStore
    } = route.params
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const medalMap = getMedalMap()
    const [activeStep, setActiveStep] = useState<StepVal>(StepVal.ONE)
    const [loading, setLoading] = useState(false)
    const [formStatus, setFormStatus] = useState<FormStatus>(FORMStatusEnum.START)
    const { dropDownRef } = useDropDown() as any
    const [saveStatus, setSaveStatus] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showScoreModal, setShowScoreModal] = useState(false)
    const [showSaveAndExitBtn, setShowSaveAndExitBtn] = useState<Boolean>(false)
    const contractReducer = (state: any) => state.contractReducer
    const contract = useSelector(contractReducer)
    const needUpdateFormStatus = contract.needUpdateFormStatus
    useListenAuditFormUrl(setFormStatus, auditVisitId)
    useAuditData({ visitSubtype, customerDetail, auditVisitId, locProdId: locProdId, setFormStatus })
    const auditData = useSelector((state: any) => state.AuditReducer.auditData)
    useUpdateLocalFormStatus(formStatus, needUpdateFormStatus, setFormStatus)

    useEffect(() => {
        const isBasic = !medalMap[auditData.contract.Signed_Medal_Tier__c]
        const isIRProcessing =
            formStatus === FORMStatusEnum.PENDING || auditData.auditVisit?.Status__c === VisitStatus.IR_PROCESSING
        const isPendingReview = auditData.auditVisit?.Status__c === VisitStatus.PENDING_REVIEW
        if (
            !isPendingReview &&
            ((isIRProcessing && isBasic && activeStep === StepVal.ONE) ||
                (isIRProcessing && !isBasic && activeStep === StepVal.THREE))
        ) {
            setShowSaveAndExitBtn(true)
        } else {
            setShowSaveAndExitBtn(false)
        }
    }, [auditData, activeStep, formStatus])

    const spaceBreakdownRequired = useSpaceBreakdown(auditData, customerDetail)
    const handlePressCancel = () => {
        if (activeStep === StepVal.TWO) {
            setActiveStep(StepVal.ONE)
        }
        if (activeStep === StepVal.THREE) {
            setActiveStep(StepVal.TWO)
        }
    }
    const handleAuditSubmission = async () => {
        if (loading) {
            return
        }
        setLoading(true)
        try {
            setLoading(true)
            await handleSubmitAudit({
                auditData,
                activeStep,
                setActiveStep,
                navigation,
                dispatch,
                setRefreshFlag,
                customerDetail,
                retailStore,
                setShowSuccess,
                spaceBreakdownRequired
            })
            setSaveStatus(true)
        } catch (error) {
            storeClassLog(
                Log.MOBILE_ERROR,
                'handlePressSave-Audit',
                `Submit Audit KPI failed: ${ErrorUtils.error2String(error)}`
            )
        } finally {
            setLoading(false)
        }
    }

    const handlePressSave = async () => {
        if (loading) {
            return
        }
        setLoading(true)
        const isBasic = !medalMap[auditData.contract.Signed_Medal_Tier__c]
        if (isBasic && auditData?.contract?.Id) {
            setShowScoreModal(true)
            setLoading(false)
        } else {
            handleAuditSubmission()
        }
    }

    const isMedalMap = !!medalMap[auditData.contract?.Signed_Medal_Tier__c]

    const goBack = () => {
        if (loading) {
            return
        }

        Alert.alert(t.labels.PBNA_MOBILE_EXIT_AUDIT, t.labels.PBNA_MOBILE_EXIT_CHANGES_CDA_MESSAGE, [
            {
                text: `${_.capitalize(t.labels.PBNA_MOBILE_SAVE)}`,
                onPress: async () => {
                    setLoading(true)
                    await syncAuditKPIs({ auditData, step: activeStep, spaceBreakdownRequired })
                    if (isMedalMap && auditVisitId) {
                        const visitObj = {
                            Id: auditVisitId,
                            InstructionDescription: auditData?.auditVisit?.InstructionDescription || ''
                        }
                        await syncUpObjUpdateFromMem('Visit', [visitObj])
                    }
                    resetAuditAndRefreshContractTab(dispatch, navigation, setRefreshFlag, customerDetail)
                    setLoading(false)
                }
            },
            {
                text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                onPress: () => {
                    handleAuditDeleteDraftWithId(
                        auditVisitId,
                        setRefreshFlag,
                        dropDownRef,
                        navigation,
                        isEdit,
                        saveStatus,
                        dispatch
                    )
                }
            },
            {
                text: `${_.capitalize(t.labels.PBNA_MOBILE_CANCEL)}`
            }
        ])
    }
    const { missionId, GSCId } = useMissionId(visitSubtype, selectedMission, retailStore)
    const { disable } = useDisableSave(activeStep, formStatus)

    const getRightButtonLabel = () => {
        if (isMedalMap) {
            return activeStep === StepVal.THREE
                ? t.labels.PBNA_MOBILE_SUBMIT_AUDIT.toLocaleLowerCase()
                : t.labels.PBNA_MOBILE_SAVE_PROCEED.toLocaleLowerCase()
        }
        return t.labels.PBNA_MOBILE_SUBMIT_AUDIT.toLocaleLowerCase()
    }

    return (
        <SafeAreaView style={auditStyles.container}>
            <HeaderOfModal
                handleOnPress={_.debounce(goBack, IntervalTime.FIVE_HUNDRED)}
                title={
                    visitSubtype === VisitSubType.POST_CONTRACT_AUDIT
                        ? t.labels.PBNA_MOBILE_POST_CDA_AUDIT
                        : t.labels.PBNA_MOBILE_GENERAL_AUDIT
                }
            />
            {isMedalMap && (
                <StepView
                    activeStep={Number(activeStep)}
                    titleList={[
                        t.labels.PBNA_MOBILE_SPACE_REVIEW,
                        t.labels.PBNA_MOBILE_POST_SPACE_BREAKDOWN,
                        t.labels.PBNA_MOBILE_COMPLIANCE
                    ]}
                    CDAStepStyleList={CDAStepStyleList}
                    transformLength={transformLength}
                />
            )}
            <KeyboardAwareScrollView extraHeight={-20}>
                {activeStep === StepVal.ONE && (
                    <SpaceViewPage
                        formStatus={formStatus}
                        missionId={missionId}
                        GSCId={GSCId}
                        visitId={auditVisitId}
                        onFormButtonClicked={() => dispatch(setAuditData({ ...auditData, formButtonClicked: true }))}
                        loading={loading}
                    />
                )}
                {activeStep === StepVal.TWO && <SpaceBreakdownPage spaceBreakdownRequired={spaceBreakdownRequired} />}
                {activeStep === StepVal.THREE && <ComplianceViewPage retailStore={retailStore} />}
            </KeyboardAwareScrollView>

            {loading && <LinearProgress color="#7CFC00" />}

            {showSaveAndExitBtn && (
                <FormBottomButton
                    onPressCancel={handlePressCancel}
                    disableCancel={activeStep === StepVal.ONE || loading}
                    onPressSave={_.throttle(goBack, IntervalTime.FIVE_HUNDRED, { trailing: false })}
                    rightButtonLabel={t.labels.PBNA_MOBILE_SAVE_AND_EXIT}
                    leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toLocaleUpperCase()}
                    relative
                />
            )}
            {!showSaveAndExitBtn && (
                <FormBottomButton
                    disableSave={disable || !auditData.auditVisit?.Id || loading || showSuccess}
                    onPressCancel={handlePressCancel}
                    disableCancel={activeStep === StepVal.ONE || loading}
                    onPressSave={_.throttle(handlePressSave, IntervalTime.FIVE_HUNDRED, { trailing: false })}
                    rightButtonLabel={getRightButtonLabel()}
                    leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toLocaleUpperCase()}
                    relative
                />
            )}
            <CDASuccessModal
                modalVisible={showSuccess}
                message={
                    visitSubtype !== VisitSubType.POST_CONTRACT_AUDIT
                        ? t.labels.PBNA_MOBILE_GENERAL + ' ' + t.labels.PBNA_MOBILE_AUDIT_SUBMIT_SUCCESS
                        : t.labels.PBNA_MOBILE_POST_CDA + ' ' + t.labels.PBNA_MOBILE_AUDIT_SUBMIT_SUCCESS
                }
            />
            {showScoreModal && (
                <ScoreModal
                    visitSubtype={visitSubtype}
                    modalVisible={showScoreModal}
                    setModalVisible={setShowScoreModal}
                    onPressOk={_.throttle(handleAuditSubmission, IntervalTime.FIVE_HUNDRED)}
                />
            )}
        </SafeAreaView>
    )
}

export default AuditScreen
