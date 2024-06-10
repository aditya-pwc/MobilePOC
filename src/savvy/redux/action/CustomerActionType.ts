export enum CustomerActionType {
    UPDATE_CUSTOMER_ACTIVITY_PEPSICO_DIRECT,
    UPDATE_CUSTOMER_DETAIL,
    CLEAR_CUSTOMER_ACTIVITY_PEPSICO_DIRECT,
    CLEAR_CUSTOMER_DETAIL,
    UPDATE_CUSTOMER_POS_OVERVIEW,
    UPDATE_CUSTOMER_POS_DETAIL_LIST,
    CLEAR_CUSTOMER_POS_REQUEST,
    CLEAR_CUSTOMER_POS_DETAIL_LIST
}

export const updatePepsiDirectOrder = (payload: any) => {
    return {
        type: CustomerActionType.UPDATE_CUSTOMER_ACTIVITY_PEPSICO_DIRECT,
        payload: payload
    }
}

export const clearPepsiDirectOrder = () => {
    return {
        type: CustomerActionType.CLEAR_CUSTOMER_ACTIVITY_PEPSICO_DIRECT
    }
}

export const updateCustomerPOSOverview = (payload: any) => {
    return {
        type: CustomerActionType.UPDATE_CUSTOMER_POS_OVERVIEW,
        payload: payload
    }
}

export const updateCustomerPOSDetail = (payload: any) => {
    return {
        type: CustomerActionType.UPDATE_CUSTOMER_POS_DETAIL_LIST,
        payload: payload
    }
}

export const clearCustomerPOSDetail = () => {
    return {
        type: CustomerActionType.CLEAR_CUSTOMER_POS_DETAIL_LIST
    }
}

export const clearCustomerPOSRequest = () => {
    return {
        type: CustomerActionType.CLEAR_CUSTOMER_POS_REQUEST
    }
}
