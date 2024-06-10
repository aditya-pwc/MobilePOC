export enum LeadActionType {
    CHANGE_WEB_SOCIAL_MEDIA_EDIT_MODAL_STATUS = 'change_web_social_media_edit_modal_status',
    UPDATE_TEMP_LEAD = 'update_temp_lead',
    REFRESH_KPI_BAR = 'refresh_kpi_bar',
    UPDATE_MY_LEADS_SQL = 'update_my_leads_sql',
    UPDATE_OPEN_LEADS_SQL = 'update_open_leads_sql',
    UPDATING_LEAD_WIRING = 'updating_lead_wiring'
}

export const changeWebSocialMediaEditModalAction = () => {
    return {
        type: LeadActionType.CHANGE_WEB_SOCIAL_MEDIA_EDIT_MODAL_STATUS
    }
}

export const updateTempLeadAction = (lead, section?) => {
    if (section) {
        return {
            type: LeadActionType.UPDATE_TEMP_LEAD,
            value: lead,
            section
        }
    }
    return {
        type: LeadActionType.UPDATE_TEMP_LEAD,
        value: lead
    }
}

export const refreshKpiBarAction = () => {
    return {
        type: LeadActionType.REFRESH_KPI_BAR
    }
}

export const updateMyLeadsQueryAction = (sql) => {
    return {
        type: LeadActionType.UPDATE_MY_LEADS_SQL,
        value: sql
    }
}

export const updateOpenLeadsQueryAction = (sql) => {
    return {
        type: LeadActionType.UPDATE_OPEN_LEADS_SQL,
        value: sql
    }
}

export const updatingLeadWiringAction = (value: boolean) => {
    return {
        type: LeadActionType.UPDATING_LEAD_WIRING,
        value
    }
}
