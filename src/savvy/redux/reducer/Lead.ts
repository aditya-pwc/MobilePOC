/*
 * @Description:
 * @LastEditors: Yi Li
 */
import { combineReducers } from '@reduxjs/toolkit'
import { LeadActionType } from '../action/LeadActionType'
import { LeadDetailSection } from '../../enums/Lead'
import LeadQueries from '../../queries/LeadQueries'
import priceGroupSlice from './PriceName'

const editWebSocialMediaModalState = {
    showModal: false
}

const refreshKpiBarState = {
    refreshTimes: 0,
    updatingLeadWiring: false
}

const leadSqlState = {
    myLeadsSql: LeadQueries.getMyLeadsQuery.q,
    openLeadsSql: LeadQueries.getAllLeadsQuery.q
}

export const refreshKpiBarReducer = (state = refreshKpiBarState, action: { type: any; value: any }) => {
    switch (action.type) {
        case LeadActionType.REFRESH_KPI_BAR:
            return {
                ...state,
                refreshTimes: state.refreshTimes + 1
            }
        case LeadActionType.UPDATING_LEAD_WIRING:
            return {
                ...state,
                updatingLeadWiring: action.value
            }
        default:
            return {
                ...state
            }
    }
}

export const leadsSqlReducer = (state = leadSqlState, action) => {
    switch (action.type) {
        case LeadActionType.UPDATE_OPEN_LEADS_SQL:
            return {
                ...state,
                openLeadsSql: action.value
            }
        case LeadActionType.UPDATE_MY_LEADS_SQL:
            return {
                ...state,
                myLeadsSql: action.value
            }
        default:
            return {
                ...state
            }
    }
}

export const editWebSocialMediaModalReducer = (state = editWebSocialMediaModalState, action) => {
    if (action.type === LeadActionType.CHANGE_WEB_SOCIAL_MEDIA_EDIT_MODAL_STATUS) {
        return {
            ...state,
            showModal: !state.showModal
        }
    }

    return { ...state }
}

export const negotiateLeadEditReducer = (state, action) => {
    const newObj = { ...state, ...action.value }
    if (action.type === LeadActionType.UPDATE_TEMP_LEAD) {
        switch (action.section) {
            case LeadDetailSection.LEAD_DETAILS:
                return {
                    ...newObj,
                    leadDetailsEditCount: state.leadDetailsEditCount + 1
                }
            case LeadDetailSection.WEB_SOCIAL_MEDIA:
                return {
                    ...newObj,
                    webSocialMediaEditCount: state.webSocialMediaEditCount + 1
                }
            case LeadDetailSection.CUSTOMER_ATTRIBUTES:
                return {
                    ...newObj,
                    customerAttributesEditCount: state.customerAttributesEditCount + 1
                }
            case LeadDetailSection.PEPSICO_DATA:
                return {
                    ...newObj,
                    pepsiCoDataEditCount: state.pepsiCoDataEditCount + 1
                }
            case LeadDetailSection.OFFER_DETAILS:
                return {
                    ...newObj,
                    offerDetailsEditCount: state.offerDetailsEditCount + 1
                }
            case LeadDetailSection.EQUIPMENT_NEEDS:
                return {
                    ...newObj,
                    equipmentNeedsEditCount: state.equipmentNeedsEditCount + 1
                }
            case LeadDetailSection.PROSPECT_NOTES:
                return {
                    ...newObj,
                    prospectNotesEditCount: state.prospectNotesEditCount + 1
                }
            case LeadDetailSection.DELIVERY_EXECUTION:
                return {
                    ...newObj,
                    deliveryExecutionEditCount: state.deliveryExecutionEditCount + 1
                }
            case LeadDetailSection.PRICE_GROUP:
                return {
                    ...newObj,
                    PriceGroupEditCount: state.PriceGroupEditCount + 1
                }
            default:
                return newObj
        }
    }
    return {
        ...state
    }
}

export const leadReducer = combineReducers({
    editWebSocialMediaModalReducer,
    negotiateLeadEditReducer,
    refreshKpiBarReducer,
    priceGroupSlice
})
