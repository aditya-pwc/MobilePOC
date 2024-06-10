/* eslint-disable camelcase */
import { LeadSoups } from './LeadModel'
import { CommonSoups } from './CommonModel'

export interface BaseSoupInterface {
    _soupEntryId?: number
    __local__?: string
    __locally_created__?: string
    __locally_updated__?: string
    __locally_deleted__?: string
    attributes?: SoupAttributes
}

export interface SoupAttributes {
    type: string
}

export type Soups = LeadSoups | CommonSoups | any
