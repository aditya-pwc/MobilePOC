export enum EquipmentSurveyActionType {
    UPDATE_SURVEY_DATA = 'update_survey_data'
}

export const updateSurveyDataAction = (value: Array<any>) => {
    return {
        type: EquipmentSurveyActionType.UPDATE_SURVEY_DATA,
        value
    }
}
