export enum LeadDetailSection {
    LEAD_DETAILS = 'lead_details',
    WEB_SOCIAL_MEDIA = 'web_social_media',
    CUSTOMER_ATTRIBUTES = 'customer_attributes',
    PEPSICO_DATA = 'pepsico_data',
    OFFER_DETAILS = 'offer_details',
    EQUIPMENT_NEEDS = 'equipment_notes',
    PROSPECT_NOTES = 'prospect_notes',
    DELIVERY_EXECUTION = 'delivery_execution',
    PRICE_GROUP = 'price_group'
}

export enum LeadStatus {
    OPEN = 'Open',
    NEGOTIATE = 'Negotiate',
    NO_SALE = 'No Sale',
    BUSINESS_WON = 'Business Won'
}

export enum LeadSubStatus {
    UNQUALIFIED_FOR_BUSINESS = 'Unqualified for Business',
    BUSINESS_CLOSED = 'Business Closed',
    PROSPECT_LOST = 'Prospect Lost',
    DUPLICATE_CUSTOMER_FOUND = 'Duplicate Customer Found',
    DEFERRED = 'Deferred',
    CORPORATE_DECISION = 'Corporate Decision'
}
