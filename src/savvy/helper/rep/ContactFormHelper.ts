import _ from 'lodash'
import { restDataCommonCall, syncUpObjUpdateFromMem } from '../../api/SyncUtils'
import { SoupService } from '../../service/SoupService'
import { filterExistFields } from '../../utils/SyncUtils'

export const calculateRadioGroup = (contactAs, contact, primaryContact, editMode) => {
    if (contactAs === '1' && contact.Primary_Contact__c === '0' && contact.Secondary_Contact__c === '0') {
        return false
    }
    if (primaryContact !== null || editMode) {
        return true
    }
    return true
}

export const validatePhone = (v: {
    replace: (arg0: RegExp, arg1: string) => { (): any; new (): any; length: number }
}) => {
    if (_.isEmpty(v)) {
        return true
    }
    return v.replace(/\D/g, '').length === 10 || v.replace(/\D/g, '').length === 0
}

export const deleteContactAndUpdateLead = async (type, contactId, contactSoupEntryId, l?) => {
    await restDataCommonCall(`sobjects/Contact/${contactId}`, 'DELETE')
    await SoupService.removeRecordFromSoup('Contact', [contactSoupEntryId + ''])
    if (type !== 'RetailStore') {
        const leadToUpdate = _.cloneDeep(l)
        leadToUpdate.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        const leadSyncUpFields = ['Id', 'Rep_Last_Modified_Date_c__c']
        await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [leadToUpdate], leadSyncUpFields))
    }
    global.$globalModal.closeModal()
}
