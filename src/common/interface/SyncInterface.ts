import { VisitOperationType } from '../../savvy/enums/Visit'

/**
 * @description The interface for sync method.
 * @author Shangmin Dou
 */
export interface CompositeRequestBody {
    method: string
    url: string
    referenceId: string
    body?: object
}

export interface CompositeSyncDownBody {
    name: string
    q: string
    method: string
    referenceId: string
}

export interface CommonSyncRes {
    status: CustomStatusCode
    message?: string
    error?: any
    method?: string
    data?: any
    objectName?: string
}

export type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type CustomStatusCode = 'E0' | 'E1' | 'E2' | 'E3' | 'E4'

export interface PushNotificationToMerchProps {
    type:
        | VisitOperationType.REASSIGN
        | VisitOperationType.DELETE
        | VisitOperationType.UNASSIGN
        | VisitOperationType.RESCHEDULE
        | VisitOperationType.RE_SEQUENCE
    lstVisitId: Array<string>
}

export interface LstSyncBodyProps {
    fields: Array<string>
    name: string
    whereClause: string
    lastSyncTime: string
    needSync: boolean
    data?: Array<object>
    ids?: Array<string>
    idFilterField?: string
}

export interface MobileSyncServiceProps {
    syncType: string
    lstSyncBody?: Array<LstSyncBodyProps>
    singleSyncBody?: LstSyncBodyProps
}

export type SyncFunc = () => Promise<any>

export interface SyncCustomFuncObj {
    [syncFuncName: string]: SyncFunc
}

export interface IdInClauseBody {
    dependField: string
    dependId: string
    field: string
}

export interface SyncDownBody {
    fields?: Array<string>
    usedIdFields?: Array<string>
    objName?: string
    refId?: string
    level?: number
    initClause?: string
    incrClause?: string
    idInClause?: IdInClauseBody
    lastSyncTime?: number
    initActive?: boolean
    incrActive?: boolean
    allOrNone?: boolean
    func?: string
    funcParas?: Array<any>
    initClauseReplacement?: Array<string>
    incrClauseReplacement?: Array<string>
    externalObject?: boolean
    parentObjects?: Array<string>
    type: string
}
