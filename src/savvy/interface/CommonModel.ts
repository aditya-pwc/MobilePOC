/* eslint-disable camelcase */
import { BaseSoupInterface } from './SoupModel'

export interface RecordType extends BaseSoupInterface {
    Id: string
    Name: string
    SobjectType: string
}

// The naming following the Salesforce object.
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface SDF_LGR_Log__c extends BaseSoupInterface {
    Class__c: string
    Data__c: string
    Level__c: string
    Message__c: string
}

export interface Notification extends BaseSoupInterface {
    additionalData: string
    communityId: string
    communityName: string
    count: number
    id: string
    image: string
    lastModified: string
    messageBody: string
    messageTitle: string
    mostRecentActivityDate: string
    organizationId: string
    read: boolean
    recipientId: string
    seen: boolean
    target: string
    targetPageRef: string
    type: string
    url: string
}

export type CommonSoups = RecordType | SDF_LGR_Log__c | Notification
