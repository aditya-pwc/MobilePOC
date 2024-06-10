import _ from 'lodash'
import { useEffect, useState } from 'react'
import { restDataCommonCall, syncUpObjCreateFromMem, syncUpObjDelete, syncUpObjUpdateFromMem } from '../api/SyncUtils'
import { SoupService } from '../service/SoupService'
import { getRecordTypeId } from './CommonUtils'
import { getParentRoute } from './LeadUtils'
import { filterExistFields } from './SyncUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const leadSyncUpFields = () => {
    return [
        'Id',
        'Company__c',
        'Street__c',
        'City__c',
        'State__c',
        'Country__c',
        'PostalCode__c',
        'Lead_Type_c__c',
        'Phone__c',
        'LastName__c',
        'Email__c',
        'BUSN_SGMNTTN_LVL_3_NM_c__c',
        'BUSN_SGMNTTN_LVL_2_NM_c__c',
        'BUSN_SGMNTTN_LVL_1_NM_c__c',
        'BUSN_SGMNTTN_LVL_1_CDV_c__c',
        'BUSN_SGMNTTN_LVL_2_CDV_c__c',
        'BUSN_SGMNTTN_LVL_3_CDV_c__c',
        'LeadSource__c',
        'Status__c',
        'Lead_Sub_Status_c__c',
        'Moved_to_Negotiate_Time_c__c',
        'Call_Counter_c__c',
        'Last_Task_Modified_Date_c__c',
        'Owner_GPID_c__c',
        'CreatedBy_GPID_c__c',
        'LastModifiedBy_GPID_c__c',
        'Source_ID_c__c',
        'Device_Source_c__c',
        'Rep_Last_Modified_Date_c__c',
        'Assigned_Date_c__c',
        'Location_c__c',
        'Location_ID_c__c',
        'Market_c__c',
        'Market_ID_c__c',
        'Region_c__c',
        'Region_ID_c__c',
        'Proposed_Key_Account_c__c',
        'Proposed_Key_Account_Division_c__c'
    ]
}

export const useInitLeadForm = (customer, segmentOption) => {
    const [initLead, setInitLead] = useState({})
    const segment3Name = segmentOption?.CHANNEL_CODE?.[customer?.['Account.BUSN_SGMNTTN_LVL_3_CDV__c']] || ''
    const segment2Name = segmentOption?.SEGMENT_CODE?.[customer?.['Account.BUSN_SGMNTTN_LVL_2_CDV__c']] || ''
    const segment1Name = segmentOption?.SUB_SEGMENT_CODE?.[customer?.['Account.BUSN_SGMNTTN_LVL_1_CDV__c']] || ''
    useEffect(() => {
        if (customer.Id) {
            getParentRoute(customer.LOC_PROD_ID__c, 'Location').then((currentNode) => {
                const initLead = {
                    Id: null,
                    Company__c: customer?.Name || '',
                    Street__c: customer?.Street || '',
                    City__c: customer?.City || '',
                    State__c: customer?.State || '',
                    Country__c: customer?.Country || '',
                    PostalCode__c: customer?.PostalCode,
                    Lead_Type_c__c: 'Change of Ownership',
                    Phone__c: customer?.['Account.Phone'] || '',
                    LastName__c: customer?.Name || '',
                    Email__c: '',
                    BUSN_SGMNTTN_LVL_3_NM_c__c: segment3Name,
                    BUSN_SGMNTTN_LVL_2_NM_c__c: segment2Name,
                    BUSN_SGMNTTN_LVL_1_NM_c__c: segment1Name,
                    BUSN_SGMNTTN_LVL_1_CDV_c__c: '',
                    BUSN_SGMNTTN_LVL_2_CDV_c__c: '',
                    BUSN_SGMNTTN_LVL_3_CDV_c__c: '',
                    LeadSource__c: 'Cold Call',
                    Status__c: 'Negotiate',
                    Lead_Sub_Status_c__c: 'Assigned',
                    Moved_to_Negotiate_Time_c__c: '',
                    Call_Counter_c__c: 0,
                    Last_Task_Modified_Date_c__c: '',
                    Owner_GPID_c__c: null,
                    CreatedBy_GPID_c__c: null,
                    LastModifiedBy_GPID_c__c: null,
                    Source_ID_c__c: null,
                    Device_Source_c__c: null,
                    Rep_Last_Modified_Date_c__c: null,
                    Assigned_Date_c__c: null,
                    Location_c__c: currentNode?.SLS_UNIT_NM__c || '',
                    Location_ID_c__c: currentNode?.SLS_UNIT_ID__c || '',
                    Market_c__c: currentNode?.Parent_Node__r.SLS_UNIT_NM__c || '',
                    Market_ID_c__c: currentNode?.Parent_Node__r.SLS_UNIT_ID__c || '',
                    Region_c__c: currentNode?.Parent_Node__r.Parent_Node__r.SLS_UNIT_NM__c || '',
                    Region_ID_c__c: currentNode?.Parent_Node__r.Parent_Node__r.SLS_UNIT_ID__c || '',
                    Proposed_Key_Account_c__c: null,
                    Proposed_Key_Account_Division_c__c: null,
                    Proposed_Key_Account_Name: null,
                    Proposed_Key_Account_Division_Name: null,
                    Payment_Method_c__c: 'Check', // default value
                    _soupEntryId: null
                }

                setInitLead(initLead)
            })
        }
    }, [customer.LOC_PROD_ID__c, segment3Name, segment2Name, segment1Name])

    return initLead
}

export interface OverviewLeadProps {
    Id: string
    ExternalId: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Company__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Street__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    City__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    State__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Country__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    PostalCode__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Lead_Type_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Phone__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    LastName__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Email__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_3_NM_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_2_NM_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_1_NM_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    LeadSource__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Status__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Lead_Sub_Status_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Moved_to_Negotiate_Time_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Call_Counter_c__c: number
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Last_Task_Modified_Date_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Owner_GPID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    CreatedBy_GPID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    LastModifiedBy_GPID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Source_ID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Device_Source_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Rep_Last_Modified_Date_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Assigned_Date_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Location_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Location_ID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Market_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Market_ID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Region_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Region_ID_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Proposed_Key_Account_Division_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Proposed_Key_Account_Division_Name: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Proposed_Key_Account_Name: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Proposed_Key_Account_c__c: any
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_1_CDV_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_2_CDV_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    BUSN_SGMNTTN_LVL_3_CDV_c__c: string
    // Salesforce API Name
    // eslint-disable-next-line camelcase
    Payment_Method_c__c: string
}

export const getParentAccount = async (Id: string) => {
    const result = await restDataCommonCall(
        `query/?q=SELECT Id,Name, Parent.Name , parent.Id FROM Account WHERE Id = '${Id}'`,
        'GET'
    )
    return _.cloneDeep(result.data?.records[0])
}
const copyDpToLead = (tempDPArr, setCopyDPList) => {
    // dpObj.DELY_DAYS__c = dpObj.SLS_MTHD_NM__c === 'Food Service Calls' ? 'Sunday' : dpObj.DELY_DAYS__c

    const dpCreateFields = [
        'SLS_MTHD_NM__c',
        'PROD_GRP_NM__c',
        'DLVRY_MTHD_NM__c',
        'DELY_DAYS__c',
        'Route_Text__c',
        'Lead__c',
        'RecordTypeId',
        'CUST_RTE_FREQ_CDE__c',
        'SLS_MTHD_CDE__c',
        'DELY_MTHD_CDE__c',
        'PROD_GRP_CDE__c',
        'Lead_DP_Route_Disp_NM__c',
        'Route__c'
    ]
    try {
        syncUpObjCreateFromMem(
            'Customer_to_Route__c',
            filterExistFields('Customer_to_Route__c', tempDPArr, dpCreateFields)
        )
            .then((res) => {
                setCopyDPList(res[0].data)
            })
            .catch(() => {
                setCopyDPList([])
            })
    } catch (error) {}
}

const formatCustomerDP = (DPArr, l, RecordTypeId) => {
    const newDP = []

    DPArr.forEach((DP) => {
        const item = {
            SLS_MTHD_NM__c: DP.SLS_MTHD_NM__c,
            PROD_GRP_NM__c: DP.PROD_GRP_NM__c,
            DLVRY_MTHD_NM__c: DP.DLVRY_MTHD_NM__c,
            DELY_DAYS__c: DP.SLS_MTHD_NM__c === 'Food Service Calls' ? 'Sunday' : DP.DELY_DAYS__c,
            Route_Text__c: `${DP['Route__r.GTMU_RTE_ID__c']}`,
            Lead__c: l.ExternalId,
            RecordTypeId,
            CUST_RTE_FREQ_CDE__c: DP.CUST_RTE_FREQ_CDE__c,
            SLS_MTHD_CDE__c: DP.SLS_MTHD_CDE__c,
            DELY_MTHD_CDE__c: DP.DELY_MTHD_CDE__c,
            PROD_GRP_CDE__c: DP.PROD_GRP_CDE__c,
            Lead_DP_Route_Disp_NM__c: `${DP['Route__r.GTMU_RTE_ID__c']} ${DP['Route__r.RTE_TYP_GRP_NM__c'] || '-'} ${
                DP['User__r.Name'] || ''
            }`,
            Route__c: DP.Route__c
        }
        newDP.push(item)
    })
    return newDP
}

export const useCopyDistributionPointsFromCustomer = (accountId: string, l, readOnly, setCopyDPList) => {
    useEffect(() => {
        if (accountId && l?.Id && !readOnly) {
            SoupService.retrieveDataFromSoup(
                'Customer_to_Route__c',
                {},
                [
                    'Id',
                    'SLS_MTHD_NM__c',
                    'PROD_GRP_NM__c',
                    'DLVRY_MTHD_NM__c',
                    'DELY_DAYS__c',
                    'Route_Text__c',
                    'Lead__c',
                    'RecordTypeId',
                    'CUST_RTE_FREQ_CDE__c',
                    'SLS_MTHD_CDE__c',
                    'DELY_MTHD_CDE__c',
                    'PROD_GRP_CDE__c',
                    'Route__r.GTMU_RTE_ID__c',
                    'Route__r.RTE_TYP_GRP_NM__c',
                    'ORD_DAYS__c',
                    'Lead_DP_Route_Disp_NM__c',
                    'Pending__c',
                    'RecordType.Name',
                    'updated_dp__c',
                    'User__r.Name',
                    'Route__c'
                ],
                'SELECT {Customer_to_Route__c:Id},{Customer_to_Route__c:SLS_MTHD_NM__c}, ' +
                    '{Customer_to_Route__c:PROD_GRP_NM__c}, {Customer_to_Route__c:DLVRY_MTHD_NM__c}, ' +
                    '{Customer_to_Route__c:DELY_DAYS__c}, {Customer_to_Route__c:Route_Text__c},{Customer_to_Route__c:Lead__c},' +
                    '{Customer_to_Route__c:RecordTypeId},{Customer_to_Route__c:CUST_RTE_FREQ_CDE__c},' +
                    '{Customer_to_Route__c:SLS_MTHD_CDE__c},{Customer_to_Route__c:DELY_MTHD_CDE__c},' +
                    '{Customer_to_Route__c:PROD_GRP_CDE__c},{Customer_to_Route__c:Route__r.GTMU_RTE_ID__c},' +
                    '{Customer_to_Route__c:Route__r.RTE_TYP_GRP_NM__c},' +
                    '{Customer_to_Route__c:ORD_DAYS__c},{Customer_to_Route__c:Lead_DP_Route_Disp_NM__c},' +
                    '{Customer_to_Route__c:Pending__c},{Customer_to_Route__c:RecordType.Name},{Customer_to_Route__c:updated_dp__c},' +
                    '{Employee_To_Route__c:User__r.Name},{Customer_to_Route__c:Route__c},{Customer_to_Route__c:_soupEntryId},' +
                    '{Customer_to_Route__c:__local__},{Customer_to_Route__c:__locally_created__},' +
                    '{Customer_to_Route__c:__locally_updated__}, {Customer_to_Route__c:__locally_deleted__} ' +
                    'FROM {Customer_to_Route__c} ' +
                    'LEFT JOIN (SELECT * FROM {Employee_To_Route__c} WHERE ' +
                    '{Employee_To_Route__c:User__r.Name} IS NOT NULL AND {Employee_To_Route__c:Active_Flag__c} IS TRUE AND ' +
                    "{Employee_To_Route__c:Status__c} = 'Processed' GROUP BY {Employee_To_Route__c:Route__c}) " +
                    'ON {Employee_To_Route__c:Route__c} = {Customer_to_Route__c:Route__c} ' +
                    `WHERE {Customer_to_Route__c:Customer__c} = '${accountId}' ` +
                    'AND {Customer_to_Route__c:ACTV_FLG__c} IS TRUE AND {Customer_to_Route__c:Merch_Flag__c} IS FALSE ' +
                    'ORDER BY {Customer_to_Route__c:Pending__c} DESC'
            ).then((res) => {
                const sortedRes = _.sortBy(res, (item) => {
                    return item['RecordType.Name'] !== 'Requested Customer DP'
                })

                sortedRes.forEach((v) => {
                    v.Pending__c = v.Pending__c === '1'
                })
                const filteredRes = sortedRes.filter((item) => {
                    let isUpdated = false
                    item.Id = null

                    sortedRes.forEach((v) => {
                        delete item.Id
                        if (v.updated_dp__c === item.Id) {
                            isUpdated = true
                        }
                    })
                    return !isUpdated
                })
                getRecordTypeId('Lead DP', 'Customer_to_Route__c').then((RecordTypeId) => {
                    copyDpToLead(formatCustomerDP(filteredRes, l, RecordTypeId), setCopyDPList)
                })
            })
        }
    }, [accountId, l?.Id])
}

const setContactAsPrimary = (contact, dropDownRef) => {
    const syncUpUpdateFields = ['Id', 'Title', 'Phone', 'Primary_Contact__c']
    const contactToUpdate = {
        Id: contact?.Id,
        Title: contact?.Title,
        Phone: contact?.Phone,
        Primary_Contact__c: '1'
    }
    try {
        syncUpObjUpdateFromMem('Contact', filterExistFields('Contact', [contactToUpdate], syncUpUpdateFields))
    } catch (e) {
        dropDownRef.current.alertWithType('error', 'Update Contact failed', ErrorUtils.error2String(e))
    }
}

export const deleteContactOnLeadAndUpdateAsPrimaryContact = (
    contactList,
    needUpdateContact,
    contact?,
    dropDownRef?
) => {
    if (contactList.length > 0) {
        syncUpObjDelete(contactList.map((v) => v.Id + '')).then(() => {
            if (needUpdateContact) {
                setContactAsPrimary(contact, dropDownRef)
            }
        })

        SoupService.removeRecordFromSoup(
            'Contact',
            contactList.map((v) => v._soupEntryId + '')
        )
    }
}

export const deleteLead = (objLead) => {
    if (objLead?.Id) {
        syncUpObjDelete([objLead.Id])

        SoupService.removeRecordFromSoup('Lead__x', [objLead._soupEntryId + ''])
    }
}

export const fetchContact = (Id, setContact) => {
    // Id = 'x0202000004MOn6AAG'
    restDataCommonCall(
        `query/?q=SELECT Id, Name,Phone ,Email ,Title,Notes__c FROM Contact WHERE Lead__c = '${Id}'`,
        'GET'
    )
        .then((lead) => {
            const contact = lead.data?.records[0]

            setContact(contact)
            return lead
        })
        .catch(() => {
            setContact({})
        })
}

export const fetchLeadAndContact = (Id, setObjLead, setContact) => {
    restDataCommonCall(
        `query/?q=SELECT 
    Id,ExternalId,Company__c,Street__c,City__c,State__c,Country__c,PostalCode__c,
    Lead_Type_c__c,Phone__c,LastName__c,Email__c,
    BUSN_SGMNTTN_LVL_3_NM_c__c,BUSN_SGMNTTN_LVL_2_NM_c__c,
    BUSN_SGMNTTN_LVL_1_NM_c__c,LeadSource__c,Status__c,Lead_Sub_Status_c__c,
    Call_Counter_c__c,Owner_GPID_c__c,CreatedBy_GPID_c__c,Source_ID_c__c,Location_c__c,
    Location_ID_c__c,Market_c__c,Market_ID_c__c,Region_c__c,Region_ID_c__c,Proposed_Key_Account_Division_c__c,
    Proposed_Key_Account_c__c,Payment_Method_c__c   
    FROM Lead__x WHERE Id = '${Id}'`,
        'GET'
    )
        .then((result) => {
            const lead = result?.data?.records[0]
            setObjLead(lead)
            return lead
        })
        .then((lead: any) => {
            fetchContact(lead.ExternalId, setContact)
        })
        .catch(() => {
            setObjLead({})
        })
}
