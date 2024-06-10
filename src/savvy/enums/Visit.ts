/*
 * @Author: fangfang ji
 * @Date: 2021-09-24 12:05:54
 * @LastEditTime: 2022-04-19 23:53:42
 * @LastEditors: Yi Li
 * @Description: Visit related status
 * @FilePath: /Halo_Mobile/src/enums/Visit.ts
 */
export enum VisitStatus {
    PUBLISH = 'Published',
    IN_PROGRESS = 'In Progress',
    COMPLETE = 'Complete',
    PLANNED = 'Planned',
    REMOVED = 'Removed',
    CANCELLED = 'Cancelled',
    NOT_STARTED = 'Not Started',
    SOMETHING_WRONG = 'Something Wrong',
    NEW = 'New',
    PUBLISHED = 'Published',
    COMPLETED = 'Completed',
    UNASSIGN = 'Unassigned',
    FAILED = 'Failed',
    IR_PROCESSING = 'IR Processing',
    PENDING_REVIEW = 'Pending Review'
}

export enum VisitRecordType {
    DELIVERY = 'Delivery',
    MERCHANDISING = 'Merchandising',
    SALES = 'Sales'
}

export enum WorkOrderStatus {
    COMPLETE = 'Complete',
    OPEN = 'Open'
}

export enum ShipmentStatus {
    CLOSED = 'Closed',
    OPEN = 'Open'
}

/**
 * Reassign Result Modal Type string
 * 'Delete'
 * 'Reassign'
 * 'Unassign
 */
export enum VisitOperationType {
    DELETE = 'Delete',
    REASSIGN = 'Reassign',
    UNASSIGN = 'Unassign',
    RESCHEDULE = 'Reschedule',
    RE_SEQUENCE = 'Resequence'
}

export enum VisitType {
    RECURRING = 'Recurring',
    VISIT = 'Visit'
}

export enum OrderItemType {
    PALLET_ITEM = 'Pallet Item',
    ORDER_ITEM = 'Order Item'
}

export enum VisitSubType {
    POST_CONTRACT_AUDIT = 'Post Contract Audit',
    GENERAL_AUDIT = 'General Audit'
}

export enum InStoreLocationPickListValue {
    COLD_VAULT = 'Cold Vault'
}
