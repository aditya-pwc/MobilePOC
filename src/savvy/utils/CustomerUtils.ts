import { SoupService } from '../service/SoupService'
import { syncDownObj } from '../api/SyncUtils'
import _ from 'lodash'
import { getAllFieldsByObjName } from './SyncUtils'
import CustomerEquipmentQueries from '../queries/CustomerEquipmentQueries'
import { formatString } from './CommonUtils'
import { t } from '../../common/i18n/t'

export const goToCustomerDetail = async (customer, navigation, fromCustomerDetail = false, isCDAMapView = false) => {
    global.$globalModal.openModal()
    let needDeleteFlag = false
    const result = await SoupService.retrieveDataFromSoup(
        'RetailStore',
        {},
        ['Id'],
        'SELECT {RetailStore:Id},{RetailStore:_soupEntryId}' +
            ` FROM {RetailStore} WHERE {RetailStore:Id} = '${customer.Id}'`
    )
    if (result.length === 0) {
        needDeleteFlag = true
    }
    await syncDownObj(
        'RetailStore',
        `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id='${customer.Id}'`
    )
    const newResult = await SoupService.retrieveDataFromSoup(
        'RetailStore',
        {},
        ['Id', '_soupEntryId'],
        'SELECT {RetailStore:Id},{RetailStore:_soupEntryId}' +
            ` FROM {RetailStore} WHERE {RetailStore:Id} = '${customer.Id}'`
    )
    const customerToNavigate = _.cloneDeep(customer)
    customerToNavigate._soupEntryId = newResult[0]._soupEntryId
    global.$globalModal.closeModal()
    if (fromCustomerDetail) {
        navigation.push('CustomerDetailScreen', {
            customer: customerToNavigate,
            needDelete: needDeleteFlag,
            isCDAMapView: isCDAMapView
        })
    } else {
        navigation.navigate('CustomerDetailScreen', {
            customer: customerToNavigate,
            needDelete: needDeleteFlag,
            isCDAMapView: isCDAMapView
        })
    }
}

export const isUpdateRequest = (requestId, requestSubType) => {
    return new Promise<any>((resolve) => {
        SoupService.retrieveDataFromSoup(
            'Request__c',
            {},
            CustomerEquipmentQueries.getEquipmentRequestBySubType.f,
            formatString(CustomerEquipmentQueries.getEquipmentRequestBySubType.q, [requestId, requestSubType])
        ).then((res) => {
            if (res.length > 0) {
                const temp = res[0]
                resolve({
                    Id: temp.Id,
                    request_subtype__c: temp.request_subtype__c
                })
            } else {
                resolve({
                    Id: null,
                    request_subtype__c: null
                })
            }
        })
    })
}

export const priceGroupStatusMapping = () => {
    return {
        DRAFT: t.labels.PBNA_MOBILE_DRAFT,
        SUBMITTED: t.labels.PBNA_MOBILE_SUBMITTED,
        PRE: t.labels.PBNA_MOBILE_REJECTED,
        CMP: t.labels.PBNA_MOBILE_COMPLETED
    }
}
