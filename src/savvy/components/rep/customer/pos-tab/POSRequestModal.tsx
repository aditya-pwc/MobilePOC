/**
 * @description New POS Request Model
 * @author Sheng Huang
 * @date 2023-03-16
 */

import React, { FC, ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react'
import FullScreenModal, { FullScreenModalRef } from '../../lead/common/FullScreenModal'
import StepView from '../../lead/common/StepView'
import { Alert, View } from 'react-native'
import SelectPOSView, { SelectPOSStep, SelectPOSViewRef } from './SelectPOSView'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import GlobalModal from '../../../../../common/components/GlobalModal'
import { initPosRequestOverview, usePosDisableSave } from '../../../../hooks/POSHooks'
import POSOverviewForm from './POSOverviewForm'
import { t } from '../../../../../common/i18n/t'
import { useDispatch, useSelector } from 'react-redux'
import { updateCustomerPOSDetail, updateCustomerPOSOverview } from '../../../../redux/action/CustomerActionType'
import PosStepThree from './PosStepThree'

interface POSRequestModalProps {
    customer: any
    onCloseModal?: Function
}

export enum POSRequestStep {
    OVERVIEW,
    POS,
    SUMMARY
}

const POSRequestModal: FC<POSRequestModalProps> = forwardRef(
    (props: POSRequestModalProps, ref: ForwardedRef<FullScreenModalRef>) => {
        const { customer, onCloseModal } = props
        const [activeStep, setActiveStep] = useState(POSRequestStep.OVERVIEW)
        const [activePart, setActivePart] = useState(SelectPOSStep.SELECT_CATEGORY)
        const [isSubmitting, setIsSubmitting] = useState(false)
        const globalModalRef = useRef(null)
        const selectPosRef = useRef<SelectPOSViewRef>(null)
        const step3Ref = useRef<any>(null)
        const dispatch = useDispatch()
        const overview = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posOverview)
        const posDetailList = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posDetailList)
        const disableSave = usePosDisableSave(overview, activePart, activeStep, posDetailList, isSubmitting)
        const [categoryId, setCategoryId] = useState('')

        useEffect(() => {
            dispatch(updateCustomerPOSOverview(initPosRequestOverview(customer)))
        }, [customer.Id, customer['Account.ShippingAddress']])

        const pressBackAlert = (fn: Function, msg: string, showAlert = true) => {
            if (!showAlert) {
                fn()
            } else {
                Alert.alert('', msg, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL
                    },
                    {
                        text: t.labels.PBNA_MOBILE_CONFIRM,
                        onPress: () => {
                            fn()
                        }
                    }
                ])
            }
        }

        const onClose = (showAlert = true) => {
            pressBackAlert(
                () => {
                    ref?.current?.closeModal()
                    setActivePart(SelectPOSStep.SELECT_CATEGORY)
                    setActiveStep(POSRequestStep.OVERVIEW)
                    dispatch(updateCustomerPOSOverview(initPosRequestOverview(customer)))
                    dispatch(updateCustomerPOSDetail([]))
                },
                t.labels.PBNA_MOBILE_POS_REQUEST_BACK_MSG,
                showAlert
            )
        }

        // eslint-disable-next-line camelcase
        const setStepTwoBreadcrumbs = (item: { Category_Id__c: string; Category_Name__c: string }) => {
            selectPosRef?.current?.setPOSListBreadcrumbs(item)
        }

        const renderForm = () => {
            switch (activeStep) {
                case POSRequestStep.OVERVIEW:
                    return <POSOverviewForm />
                case POSRequestStep.POS:
                    return (
                        <SelectPOSView
                            activePart={activePart}
                            setActivePart={setActivePart}
                            cRef={selectPosRef}
                            pressBackAlert={pressBackAlert}
                            customer={customer}
                            setCategoryId={setCategoryId}
                            categoryId={categoryId}
                        />
                    )
                case POSRequestStep.SUMMARY:
                    return (
                        <PosStepThree
                            step3Ref={step3Ref}
                            activePart={activePart}
                            setActivePart={setActivePart}
                            pressBackAlert={pressBackAlert}
                            onClose={() => {
                                onCloseModal && onCloseModal()
                                onClose(false)
                            }}
                            setIsSubmitting={setIsSubmitting}
                            setActiveStep={setActiveStep}
                            setCategoryId={setCategoryId}
                            setStepTwoBreadcrumbs={setStepTwoBreadcrumbs}
                        />
                    )
                default:
                    return null
            }
        }

        const onPressStepOne = () => {
            setActiveStep(POSRequestStep.OVERVIEW)
        }

        const onPressStepTwo = () => {
            setActiveStep(POSRequestStep.POS)
            setActivePart(SelectPOSStep.SELECT_CATEGORY)
        }

        const onPressStepThree = () => {
            setActiveStep(POSRequestStep.SUMMARY)
        }

        const onPressCancel = () => {
            switch (activeStep) {
                case POSRequestStep.OVERVIEW:
                    onClose()
                    break
                case POSRequestStep.POS:
                    switch (activePart) {
                        case SelectPOSStep.SELECT_CATEGORY:
                            setActiveStep(POSRequestStep.OVERVIEW)
                            break
                        case SelectPOSStep.SELECT_POS:
                            selectPosRef?.current?.backToSelectCategory(SelectPOSStep.SELECT_CATEGORY)
                            break
                        case SelectPOSStep.ADD_DETAILS: // Add details is a new page, don't need to handle go back
                        default:
                    }
                    break
                case POSRequestStep.SUMMARY:
                    setActiveStep(POSRequestStep.POS)
                    break
                default:
            }
        }
        const onPressSave = () => {
            if (activeStep === POSRequestStep.SUMMARY) {
                setIsSubmitting(true)
                step3Ref?.current?.onSubmit()
            } else {
                setActiveStep((prevState) => prevState + 1)
            }
        }
        return (
            <FullScreenModal title={t.labels.PBNA_MOBILE_NEW_POS_REQUEST} cRef={ref} onClose={onClose}>
                <View style={{ marginTop: -25 }}>
                    <StepView
                        activeStep={activeStep}
                        stepTextMap={[
                            t.labels.PBNA_MOBILE_OVERVIEW,
                            t.labels.PBNA_MOBILE_POS,
                            t.labels.PBNA_MOBILE_SUMMARY
                        ]}
                        onPressStepOne={onPressStepOne}
                        onPressStepTwo={onPressStepTwo}
                        onPressStepThree={onPressStepThree}
                        readOnly={false}
                        disableStepTwo={activeStep === POSRequestStep.OVERVIEW && disableSave}
                        disableStepThree={
                            activeStep === POSRequestStep.OVERVIEW || (activeStep === POSRequestStep.POS && disableSave)
                        }
                    />
                </View>
                {renderForm()}
                <FormBottomButton
                    onPressCancel={onPressCancel}
                    leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toUpperCase()}
                    rightButtonLabel={
                        activeStep === POSRequestStep.SUMMARY
                            ? t.labels.PBNA_MOBILE_SUBMIT.toLocaleUpperCase()
                            : t.labels.PBNA_MOBILE_NEXT
                    }
                    onPressSave={onPressSave}
                    relative
                    disableSave={disableSave}
                />
                <GlobalModal ref={globalModalRef} />
            </FullScreenModal>
        )
    }
)

POSRequestModal.displayName = 'POSRequestModal'

export default POSRequestModal
