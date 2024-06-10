import { CommonParam } from '../../common/CommonParam'
import { t } from '../../common/i18n/t'
import { judgeVisibleByRule } from '../components/rep/customer/equipment-tab/EquipmentSurvey'
import _ from 'lodash'
import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    equipmentImageStyle: {
        width: 80,
        height: 100,
        borderRadius: 6
    }
})

export const getEquipmentImgSrc = (desc) => {
    const str = typeof desc === 'string' ? desc.toLocaleUpperCase() : ''
    switch (str) {
        case 'BACKROOM':
            return require('../../../assets/image/equipment_type_img/BACKROOM.png')
        case 'BARGUN':
            return require('../../../assets/image/equipment_type_img/BARGUN.png')
        case 'SPIRE':
            return require('../../../assets/image/equipment_type_img/SPIRE.png')
        case 'FROZEN':
            return require('../../../assets/image/equipment_type_img/FROZEN.png')
        case 'BUBBLER':
            return require('../../../assets/image/equipment_type_img/BUBBLER.png')
        case 'ICE BIN':
            return require('../../../assets/image/equipment_type_img/ICE_BIN.png')
        case 'ICE MAKER':
            return require('../../../assets/image/equipment_type_img/ICE_MAKER.png')
        case 'BREWER':
            return require('../../../assets/image/equipment_type_img/BREWER.png')
        case 'URN':
            return require('../../../assets/image/equipment_type_img/URN.png')
        case 'PREMIX':
            return require('../../../assets/image/equipment_type_img/PREMIX.png')
        case 'POSTMIX':
            return require('../../../assets/image/equipment_type_img/POSTMIX_2.png')
        case 'COOLER':
            return require('../../../assets/image/equipment_type_img/COOLER_2D.png')
        case 'VENDOR':
            return require('../../../assets/image/equipment_type_img/VENDOR_LG.png')
        default:
            return require('../../../assets/image/equipment_type_img/SavvyLogo.png')
    }
}

export const initInstallRequestHeader = (accountId, customerId, lead, leadId) => {
    return {
        Email: null,
        Id: null,
        Phone: null,
        RecordTypeId: null,
        Title: null,
        caller_name__c: null,
        comments__c: null,
        customer__c: accountId,
        Lead__c: lead,
        customer_id__c: customerId,
        Lead_id__c: leadId,
        display_in_asset_tab__c: false,
        display_in_service_tab__c: true,
        equip_move_type_cde__c: 'INS',
        move_purpose_cde__c: null,
        move_request_date__c: null,
        request_gpid__c: CommonParam.GPID__c,
        request_subtype__c: 'Move Request',
        requested_by__c: CommonParam.userId,
        saleRepName: null,
        saleRepPhone: null,
        status__c: 'DRAFT',
        survey_response__c: null,
        wndw_beg_tme__c: '08:00:00.000Z',
        wndw_end_tme__c: '17:00:00.000Z',
        caller_phone_num__c: null,
        email_addr_txt__c: null,
        details_revision_num__c: null,
        fsv_contract__c: false,
        survey_general_equip_details_response__c: null,
        Created_By_Savvy__c: true
    }
}

export const initInstallRequestLineItem = () => {
    return {
        Equip_styp_cde__c: null,
        Equip_type_cde__c: null,
        Id: null,
        Mnth_pymt_amt__c: null,
        RecordTypeId: null,
        Serv_ctrct_id__c: null,
        Sls_plan_cde__c: null,
        comments__c: null,
        customer__c: null,
        customer_id__c: null,
        display_in_asset_tab__c: null,
        display_in_service_tab__c: null,
        equip_config_type_cde__c: null,
        equip_grphc_id__c: null,
        equip_move_type_cde__c: null,
        equip_setup_desc__c: null,
        equip_site_desc__c: null,
        equip_styp_desc__c: null,
        equip_type_desc__c: null,
        ident_item_id__c: null,
        ord_lne_rel_num__c: null,
        order_line_num__c: null,
        parent_request_record__c: null,
        request_gpid__c: null,
        request_id__c: null,
        request_subtype__c: null,
        requested_by__c: null,
        std_setup_equip_id__c: null,
        survey_response__c: null,
        FSV_Line_Item__c: false,
        Rate_Type__c: null,
        Contract_Type__c: null,
        Commission_Basis__c: null,
        Commission_Basis_CDE__c: null,
        Payment_Schedule__c: null,
        Deposit_Amount__c: null,
        Deduct_Deposit__c: false,
        Supplier__c: null,
        FSV_Notes__c: null,
        'Supplier__r.supplier_name__c': null,
        'Supplier__r.supplier_no__c': null,
        'Supplier__r.splr_site_addr1_txt__c': null,
        'Supplier__r.splr_site_city_nme__c': null,
        'Supplier__r.splr_site_st_cde__c': null,
        'Supplier__r.splr_site_zip_cde__c': null,
        FSV_UNIT_T1__c: null,
        FSV_COMM_RATE_T1__c: null,
        FSV_UNIT_T2__c: null,
        FSV_COMM_RATE_T2__c: null,
        FSV_UNIT_T3__c: null,
        FSV_COMM_RATE_T3__c: null,
        FSV_UNIT_T4__c: null,
        FSV_COMM_RATE_T4__c: null,
        FSV_UNIT_T5__c: null,
        FSV_COMM_RATE_T5__c: null
    }
}

export const initServiceRequestHeader = (accountId, customerId) => {
    return {
        Email: null,
        Id: null,
        Phone: null,
        RecordTypeId: null,
        Title: null,
        _soupEntryId: null,
        caller_name__c: null,
        caller_phone_num__c: null,
        canc_reas_cde_descri__c: null,
        comments__c: null,
        customer__c: accountId,
        customer_id__c: customerId,
        display_in_asset_tab__c: false,
        display_in_service_tab__c: true,
        email_addr_txt__c: null,
        equip_move_type_cde__c: null,
        move_purpose_cde__c: null,
        move_request_date__c: null,
        request_gpid__c: CommonParam.GPID__c,
        request_subtype__c: 'Move Request',
        requested_by__c: CommonParam.userId,
        saleRepName: null,
        saleRepPhone: null,
        status__c: 'DRAFT',
        survey_response__c: null,
        trbl_type_cde__c: null,
        wndw_beg_tme__c: null,
        wndw_end_tme__c: null,
        details_revision_num__c: null,
        fsv_contract__c: false,
        survey_general_equip_details_response__c: null,
        Created_By_Savvy__c: true
    }
}

export const initServiceRequestLineItem = () => {
    return {
        Equip_styp_cde__c: null,
        Equip_type_cde__c: null,
        Id: null,
        Mnth_pymt_amt__c: null,
        RecordTypeId: null,
        Serv_ctrct_id__c: null,
        Sls_plan_cde__c: null,
        comments__c: null,
        customer__c: null,
        customer_id__c: null,
        display_in_asset_tab__c: null,
        display_in_service_tab__c: null,
        equip_config_type_cde__c: null,
        equip_grphc_id__c: null,
        equip_move_type_cde__c: null,
        equip_setup_desc__c: null,
        equip_site_desc__c: null,
        equip_styp_desc__c: null,
        equip_type_desc__c: null,
        ident_item_id__c: null,
        ord_lne_rel_num__c: null,
        order_line_num__c: null,
        parent_request_record__c: null,
        request_gpid__c: null,
        request_id__c: null,
        request_subtype__c: null,
        requested_by__c: null,
        std_setup_equip_id__c: null,
        survey_response__c: null,
        FSV_Line_Item__c: false,
        Rate_Type__c: null,
        Contract_Type__c: null,
        Commission_Basis__c: null,
        Payment_Schedule__c: null,
        Deposit_Amount__c: null,
        Deduct_Deposit__c: false,
        Supplier__c: null,
        FSV_Notes__c: null,
        equip_site_id__c: null,
        prev_equip_site_id__c: null,
        asset_equip_site_id__c: null
    }
}

export const requestStatusMapping = () => {
    return {
        DRAFT: {
            label: t.labels.PBNA_MOBILE_DRAFT
        },
        INCOMPLETE: {
            label: t.labels.PBNA_MOBILE_INCOMPLETE.toUpperCase()
        },
        SUBMITTED: {
            label: t.labels.PBNA_MOBILE_SUBMITTED.toUpperCase()
        },
        CANCELLED: {
            label: t.labels.PBNA_MOBILE_CANCELLED.toUpperCase()
        },
        CLOSED: {
            label: t.labels.PBNA_MOBILE_CLOSED.toUpperCase()
        },
        FAILED: {
            label: t.labels.PBNA_MOBILE_FAILED.toUpperCase()
        }
    }
}
export const moveTypeMapping = () => {
    return {
        CNV: t.labels.PBNA_MOBILE_CONVERSION,
        EXI: t.labels.PBNA_MOBILE_EXCHANGE,
        EXP: t.labels.PBNA_MOBILE_EXCHANGE,
        INS: t.labels.PBNA_MOBILE_INSTALL,
        ONS: t.labels.PBNA_MOBILE_ONSITE_MOVE,
        PIC: t.labels.PBNA_MOBILE_PICKUP,
        PIN: t.labels.PBNA_MOBILE_PAPER_INSTALL,
        PPI: t.labels.PBNA_MOBILE_PAPER_PICKUP,
        Repair: t.labels.PBNA_MOBILE_REPAIR
    }
}

export const validateSurveyResponse = (surveyResponse) => {
    let surveyFlag = true
    if (surveyResponse?.headerResponse?.questionList) {
        const surveyHeaderResponseQuestionList = surveyResponse.headerResponse.questionList
        surveyHeaderResponseQuestionList.forEach((question) => {
            if (
                question.visibilityRule === null ||
                judgeVisibleByRule(question.visibilityRule, surveyResponse.headerResponse.questionList)
            ) {
                if (question.isRequired) {
                    surveyFlag = surveyFlag && !_.isEmpty(question.Answer)
                }
            }
        })
        const surveyLineItemResponseList = surveyResponse.lineItemResponseList
        surveyLineItemResponseList.forEach((response) => {
            response.questionList.forEach((question) => {
                if (
                    question.visibilityRule === null ||
                    judgeVisibleByRule(question.visibilityRule, response.questionList)
                ) {
                    if (question.isRequired) {
                        surveyFlag = surveyFlag && !_.isEmpty(question.Answer)
                    }
                }
            })
        })
        const surveyGeneralEquipDetailsResponseList = surveyResponse.generalEquipmentResponseList
        surveyGeneralEquipDetailsResponseList?.forEach((response) => {
            response.questionList.forEach((question) => {
                if (
                    question.visibilityRule === null ||
                    judgeVisibleByRule(question.visibilityRule, response.questionList)
                ) {
                    if (question.isRequired) {
                        surveyFlag = surveyFlag && !_.isEmpty(question.Answer)
                    }
                }
            })
        })
    }
    return surveyFlag
}

export const processTwoDecimalNumber = (v) => {
    let newValue = v
    if (newValue !== '') {
        newValue = newValue.replace(/^\D*(\d{0,16}(?:\.\d{0,2})?).*$/g, '$1')
    }
    return newValue
}

export const processIntegerNumber = (v) => {
    let newValue = v
    if (newValue !== '') {
        newValue = newValue.replace(/^\D*(\d{0,16}(?:\.\d{0})?).*$/g, '$1')
    }
    return newValue
}

export const float2Integer = (value) => {
    if (value !== null && value !== undefined) {
        return Math.trunc(Number(value)) + ''
    }
    return value
}
