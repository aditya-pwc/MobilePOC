import { AuditActionType } from '../../enums/Contract'
import { initAudit } from '../reducer/AuditReducer'

export const setAuditData = (auditData: typeof initAudit) => {
    return {
        type: AuditActionType.AUDIT,
        payload: auditData
    }
}

export const setButtonBeingClicked = (buttonClicked: string) => {
    return {
        type: AuditActionType.BTN_TYPE,
        payload: buttonClicked
    }
}
