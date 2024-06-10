import _ from 'lodash'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import { restDataCommonCall, syncDownObj } from '../api/SyncUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const generateSurveyData = async () => {
    let surveyVersionNameArr = []
    let surveyVersionResponseArr = []
    let surveyQuestionsData: any[] = []
    let surveyQuestionChoicesData: any[] = []
    let flowIdResArr = []
    let flowResData: any
    try {
        const surveyVersionNameRes = await restDataCommonCall(
            "query/?q=SELECT Id, Value__c FROM Common_Information__mdt WHERE Label = 'Equipment Survey'",
            'GET'
        )
        surveyVersionNameArr = surveyVersionNameRes.data.records
        const surveyVersionName = surveyVersionNameArr[0].Value__c
        // const surveyVersionName = 'test zoey'
        const surveyVersionResponse = await syncDownObj(
            'SurveyVersion',
            `SELECT Id FROM SurveyVersion WHERE Name='${surveyVersionName}' AND SurveyStatus='Active'`,
            false
        )
        surveyVersionResponseArr = surveyVersionResponse.data
        const surveyVersionId = surveyVersionResponseArr[0].Id
        const surveyQuestionsResponse = await syncDownObj(
            'SurveyQuestion',
            `SELECT Id, Name, DeveloperName, QuestionName, QuestionType, SurveyVersionId FROM SurveyQuestion WHERE SurveyVersionId='${surveyVersionId}'`,
            false
        )
        surveyQuestionsData = surveyQuestionsResponse.data
        const surveyQuestionChoicesResponse = await syncDownObj(
            'SurveyQuestionChoice',
            `SELECT Id, Name, DeveloperName, QuestionId, SurveyVersionId FROM SurveyQuestionChoice WHERE SurveyVersionId ='${surveyVersionId}'`,
            false
        )
        surveyQuestionChoicesData = surveyQuestionChoicesResponse.data
        const flowIdRes = await restDataCommonCall(
            `tooling/query/?q=SELECT Id, MasterLabel, Status FROM Flow WHERE MasterLabel = '${surveyVersionName}' AND Status='Active' LIMIT 1`,
            'GET'
        )
        flowIdResArr = flowIdRes.data.records
        const flowId = flowIdResArr[0].Id
        const flowRes = await restDataCommonCall(`tooling/sobjects/Flow/${flowId}`, 'GET')
        flowResData = flowRes.data.Metadata
        const flowScreens = flowResData.screens
        const pageAssignments = flowResData.assignments.find(
            (assignment) => assignment.name === 'pageNamesInOrder_Assignment'
        )
        const decisions = flowResData.decisions
        const pageAssignmentItems = pageAssignments.assignmentItems
        const screenList = []

        pageAssignmentItems.forEach((assignmentItem) => {
            // The stringValue starts with 'p_' means it refer to a page.
            if (assignmentItem.value.stringValue?.indexOf('p_') === 0) {
                flowScreens.forEach((screen) => {
                    if (screen.name === assignmentItem.value.stringValue) {
                        const fields = screen.fields
                        const questionList = []
                        fields.forEach((field) => {
                            const choiceList = []
                            const questionObj = {
                                Id: null,
                                QuestionName: null,
                                QuestionType: null,
                                Choices: null,
                                DeveloperName: null,
                                Answer: null,
                                visibilityRule: null,
                                done: false,
                                isRequired: false
                            }
                            field.choiceReferences?.forEach((ref) => {
                                surveyQuestionChoicesData.forEach((choice) => {
                                    if (ref === choice.DeveloperName) {
                                        choiceList.push({
                                            Id: choice.Id,
                                            Name: choice.Name,
                                            DeveloperName: choice.DeveloperName,
                                            QuestionId: choice.QuestionId,
                                            SurveyVersionId: choice.SurveyVersionId
                                        })
                                    }
                                })
                            })
                            questionObj.Choices = choiceList
                            surveyQuestionsData.forEach((question) => {
                                if (question.DeveloperName === field.name) {
                                    questionObj.Id = question.Id
                                    questionObj.QuestionName = question.QuestionName
                                    questionObj.QuestionType = question.QuestionType
                                    questionObj.DeveloperName = question.DeveloperName
                                    questionObj.isRequired = field.isRequired
                                    if (field.visibilityRule) {
                                        questionObj.visibilityRule = {
                                            conditionLogic: field.visibilityRule.conditionLogic,
                                            conditions: field.visibilityRule.conditions.map((condition) => {
                                                return {
                                                    leftValueReference: condition.leftValueReference,
                                                    operator: condition.operator,
                                                    rightValue: condition.rightValue
                                                }
                                            })
                                        }
                                    }
                                }
                            })
                            questionList.push(questionObj)
                        })
                        let screenVisibilityRules = null
                        decisions.forEach((decision) => {
                            if (decision?.defaultConnector?.targetReference === screen.name) {
                                screenVisibilityRules = decision.rules
                            }
                        })
                        const screenObj = {
                            name: screen.name,
                            label: screen.label,
                            showContent: false,
                            questionList,
                            screenVisibilityRules
                        }
                        screenList.push(screenObj)
                    }
                })
            }
        })
        await AsyncStorage.setItem('equipment_survey_data', JSON.stringify(screenList))
        return screenList
    } catch (e: any) {
        const dataModel = {
            surveyVersionNameArr: _.size(surveyVersionNameArr),
            surveyVersionResponseArr: _.size(surveyVersionResponseArr),
            surveyQuestionsData: _.size(surveyQuestionsData),
            surveyQuestionChoicesData: _.size(surveyQuestionChoicesData),
            flowIdResArr: _.size(flowIdResArr),
            flowResData
        }
        storeClassLog(Log.MOBILE_ERROR, 'generateSurveyData', e, {
            Data__c: JSON.stringify(dataModel)
        })
    }
}
