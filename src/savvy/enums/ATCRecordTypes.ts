export enum ATCStatus {
    DRAFT = 'Draft',
    PUSH_ACTIVE = 'Push Active',
    PUSH_INACTIVE = 'Push Inactive',
    PUSH_COMPLETED = 'Push Completed'
}

export enum OrderStatus {
    DRAFT = 'Draft',
    ACTIVATED = 'Activated',
    CLOSED = 'Closed',
    CANCELLED = 'Cancelled',
    SENT_TO_EXTERNAL = 'Sent to External',
    SENT_TO_NIS = 'Sent to NIS',
    OPEN = 'Open',
    PENDING_INVOICE = 'Pending Invoice',
    RESCHEDULE = 'Reschedule',
    SHIPPED = 'Shipped'
}

export enum OrderATCType {
    NORMAL = 'Normal',
    PRODUCT_PUSH = 'Product Push'
}

export enum PushType {
    INNOVATION = 'Innovation',
    CORE_SALES_AGENDA = 'Core Sales Agenda',
    OOS = 'OOS'
}
