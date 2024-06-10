const equipmentSurveyDataState = []

export const equipmentSurveyDataReducer = (state = equipmentSurveyDataState, action) => {
    // Commented out below code for fixing the code scan issue.
    // switch (action.type) {
    // case EquipmentSurveyActionType.UPDATE_SURVEY_DATA:
    //     return action.value ? action.value : state
    // default:
    //     return action.value ? action.value : state
    // }
    return action.value ? action.value : state
}
