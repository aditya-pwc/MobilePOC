/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2022-02-10 09:55:25
 * @LastEditTime: 2024-01-05 14:55:36
 * @LastEditors: Yi Li
 */
import { SetStateAction, useEffect, useState } from 'react'
import _ from 'lodash'
import moment from 'moment'
import { validateSurveyResponse } from '../utils/EquipmentUtils'
import { isPersonaCRMBusinessAdmin } from '../../common/enums/Persona'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { MOMENT_STARTOF } from '../../common/enums/MomentStartOf'
import { getMoveTypeMapping } from './EquipmentHooks'
import { syncUpObjUpdateFromMem } from '../api/SyncUtils'
import { Log } from '../../common/enums/Log'
import { getStringValue } from '../utils/LandingUtils'
import { storeClassLog } from '../../common/utils/LogUtils'

export const useDisableSave = (
    overview,
    activePart,
    activeStep,
    installRequestLineItems,
    products,
    tempRequestLineItem,
    surveyResponse,
    changeSurveyAnswer,
    disableSubmit,
    readonly
) => {
    const [disableSave, setDisableSave] = useState(true)
    useEffect(() => {
        if (isPersonaCRMBusinessAdmin() || readonly) {
            activeStep === 2 ? setDisableSave(true) : setDisableSave(false)
        } else {
            if (activeStep === 0) {
                if (_.includes(['SUBMITTED', 'INCOMPLETE', 'CANCELLED', 'CLOSED'], overview.status__c)) {
                    setDisableSave(false)
                } else {
                    setDisableSave(
                        !(
                            !_.isEmpty(overview.caller_name__c) &&
                            !_.isEmpty(overview.move_purpose_cde__c) &&
                            !_.isEmpty(overview.wndw_beg_tme__c) &&
                            !_.isEmpty(overview.wndw_end_tme__c) &&
                            moment(
                                `${moment().utc(true).format(TIME_FORMAT.Y_MM_DD)}T${overview.wndw_beg_tme__c}`.slice(
                                    0,
                                    -1
                                )
                            ).isBefore(
                                `${moment().utc(true).format(TIME_FORMAT.Y_MM_DD)}T${overview.wndw_end_tme__c}`.slice(
                                    0,
                                    -1
                                )
                            ) &&
                            !_.isEmpty(overview.move_request_date__c) &&
                            moment(overview.move_request_date__c)
                                .endOf(MOMENT_STARTOF.DAY)
                                .isAfter(moment().add(7, 'days'))
                        )
                    )
                }
            } else if (activeStep === 1) {
                if (overview.status__c === 'DRAFT') {
                    if (activePart === 4) {
                        if (tempRequestLineItem.Equip_type_cde__c === 'VEN') {
                            setDisableSave(
                                !(
                                    _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === null)) &&
                                    _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === 0)) &&
                                    _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === ''))
                                ) ||
                                    _.isEmpty(products) ||
                                    tempRequestLineItem.FSV_Line_Item__c
                            )
                        } else if (tempRequestLineItem.Equip_type_cde__c === 'POS') {
                            setDisableSave(_.isEmpty(products))
                        } else {
                            setDisableSave(false)
                        }
                    } else if (activePart === 1) {
                        setDisableSave(installRequestLineItems.length === 0)
                    } else {
                        setDisableSave(true)
                    }
                } else {
                    setDisableSave(false)
                }
            } else if (activeStep === 2) {
                if (overview.status__c === 'DRAFT' || changeSurveyAnswer === true) {
                    setDisableSave(!validateSurveyResponse(surveyResponse) || disableSubmit)
                } else {
                    setDisableSave(true)
                }
            }
        }
    }, [
        overview,
        activePart,
        activeStep,
        installRequestLineItems,
        products,
        tempRequestLineItem,
        surveyResponse,
        changeSurveyAnswer,
        disableSubmit,
        readonly
    ])
    return disableSave
}

export const useSurveyResponse = (
    request: any,
    surveyResponse: any,
    surveyData: any[],
    setSurveyResponse: SetStateAction<any>
) => {
    useEffect(() => {
        const tempSurveyResponse = _.cloneDeep(surveyResponse)
        if (request?.survey_response__c) {
            if (!surveyResponse?.headerResponse) {
                tempSurveyResponse.headerResponse = JSON.parse(request.survey_response__c)
            }
        } else {
            // logic below is for the draft which doesn't have survey_response__c
            tempSurveyResponse.headerResponse = _.cloneDeep(surveyData[0])
        }
        if (request?.survey_general_equip_details_response__c) {
            tempSurveyResponse.generalEquipmentResponseList = JSON.parse(
                request.survey_general_equip_details_response__c
            )
        }
        setSurveyResponse(tempSurveyResponse)
    }, [request])
}

export const processNoSurveyResponseRequest = async (
    lineItemToProcess: any[],
    surveyData: any[],
    request,
    globalModalRef,
    setRefreshTimes,
    setActiveStep
) => {
    const requestToProcess: any[] = []
    lineItemToProcess.forEach((lineItem) => {
        if (!lineItem.survey_response__c) {
            const tempSurveyResponse = _.cloneDeep(surveyData[1])
            const question1 = tempSurveyResponse.questionList[0]
            const question2 = tempSurveyResponse.questionList[1]
            const moveType = getMoveTypeMapping()[request.equip_move_type_cde__c]
            question1?.Choices?.forEach((choice) => {
                if (choice.Name === moveType) {
                    question1.Answer = [choice]
                }
            })
            question2?.Choices?.forEach((choice) => {
                if (choice.Name.toLowerCase() === lineItem.equip_type_desc__c.toLowerCase()) {
                    question2.Answer = [choice]
                }
            })
            requestToProcess.push({
                Id: lineItem.Id,
                survey_response__c: JSON.stringify(tempSurveyResponse)
            })
        }
    })
    if (requestToProcess.length > 0) {
        try {
            globalModalRef.current.openModal()
            await syncUpObjUpdateFromMem('Request__c', requestToProcess)
            setRefreshTimes((v) => v + 1)
            globalModalRef.current.closeModal()
            setActiveStep(2)
        } catch (e) {
            globalModalRef.current.closeModal()
            storeClassLog(Log.MOBILE_ERROR, getStringValue(e), {
                Class__c: 'Request: processNoSurveyResponseRequest'
            })
        }
    } else {
        setActiveStep(2)
    }
}
