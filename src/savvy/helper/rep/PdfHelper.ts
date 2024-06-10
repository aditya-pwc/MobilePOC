import _ from 'lodash'
import { restDataCommonCall } from '../../api/SyncUtils'
import {
    retrieveProductRequests,
    retrieveSalesPlanNamePicklist,
    retrieveSupplierById,
    getMoveTypeMapping,
    retrieveSuppliersByIds
} from '../../hooks/EquipmentHooks'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { judgeVisibleByRule } from '../../components/rep/customer/equipment-tab/EquipmentSurvey'
import { fetchContentVersion } from '../../utils/BlobUtils'
import { addZeroes } from '../../utils/LeadUtils'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { sendEmailWithPdfAttachment } from '../../utils/PdfUtils'
import { CommonParam } from '../../../common/CommonParam'
import { Persona } from '../../../common/enums/Persona'

export enum SURVEY_QUESTION_TYPES {
    RADIO_BUTTON = 'RadioButton',
    MULTI_CHOICE = 'MultiChoice',
    SHORT_TEXT = 'ShortText',
    FREE_TEXT = 'FreeText'
}

const htmlStyles = `
h1{font:bold 100% sans-serif;text-transform:uppercase;color:#00A2D9}
h2{color:#00A2D9}
table{border:1px solid #cccccc;border-spacing: 0}
td{border:0.5px solid #cccccc}
.leftLine{
    background-color:rgba(218,218,218,1);
    width:400px;
    padding:5px
}
.rightLine{
    padding:5px;
    width:400px
}
.flexLine{
    flex:1;
    padding:5px;
}
.table2{margin-top:20px}
.table3{width:100%;margin-top:20px}
.grayBackground{background-color:rgba(218,218,218,1)}
img{width:400px;display:block}

`
const handleAnswer = async (eachLineItemQ, usedImg) => {
    const equipmentDetailContainImg = (item) => {
        return `
                <img src='${item}' />
            `
    }
    const equipDetailQuestion = (item) => {
        return `
                <tr>
                    <td class='leftLine'>${item.QuestionName}</td>
                    <td class='rightLine'>${item.newAnswer}</td>
                </tr>
            `
    }
    const equipmentDetailContainWholeImg = (item, imgStr) => {
        return `
                <tr>
                    <td class='leftLine'>${item.QuestionName}</td>
                    <td class='rightLine'>${imgStr}</td>
                </tr>  
            `
    }
    if (eachLineItemQ.QuestionType === SURVEY_QUESTION_TYPES.RADIO_BUTTON) {
        eachLineItemQ.newAnswer = Array.isArray(eachLineItemQ.Answer) ? eachLineItemQ.Answer[0].Name : '--'
        eachLineItemQ.content = equipDetailQuestion(eachLineItemQ)
    } else if (eachLineItemQ.QuestionType === SURVEY_QUESTION_TYPES.SHORT_TEXT) {
        eachLineItemQ.newAnswer = eachLineItemQ.Answer || '--'
        eachLineItemQ.content = equipDetailQuestion(eachLineItemQ)
    } else if (eachLineItemQ.QuestionType === SURVEY_QUESTION_TYPES.MULTI_CHOICE) {
        if (Array.isArray(eachLineItemQ.Answer)) {
            let answer = ''
            eachLineItemQ.Answer.forEach((item) => {
                answer = `${answer}${item.Name}, `
            })
            eachLineItemQ.newAnswer = answer.substring(0, answer.length - 2)
        } else {
            eachLineItemQ.newAnswer = '--'
        }
        eachLineItemQ.content = equipDetailQuestion(eachLineItemQ)
    } else if (eachLineItemQ.QuestionType === SURVEY_QUESTION_TYPES.FREE_TEXT) {
        if (Array.isArray(eachLineItemQ.Answer)) {
            let proList = ''
            let imgBase64 = {}
            if (await AsyncStorage.getItem('equipment_survey_photos')) {
                imgBase64 = JSON.parse(await AsyncStorage.getItem('equipment_survey_photos'))
            }
            for (const i of eachLineItemQ.Answer) {
                if (imgBase64) {
                    let equipImg
                    if (imgBase64[i]) {
                        equipImg = equipmentDetailContainImg(imgBase64[i])
                    } else {
                        const id = i.slice(45, 63)
                        const res = await fetchContentVersion(id)
                        equipImg = equipmentDetailContainImg(res)
                    }
                    usedImg.push(i)
                    proList = `${proList}${equipImg}`
                }
            }
            eachLineItemQ.content = equipmentDetailContainWholeImg(eachLineItemQ, proList)
        } else {
            eachLineItemQ.newAnswer = eachLineItemQ.Answer || '--'
            eachLineItemQ.content = equipDetailQuestion(eachLineItemQ)
        }
    } else {
        eachLineItemQ.content = ''
    }
}

const ArrivalMapContent = async (headerSurvey, usedImg, comments) => {
    let arrivalMapContentInner = ''
    const arrivalMapHtmlContent = (arrivalMapContentInnerHtml, comments) => {
        return `
                <table class='table2'>
                    ${arrivalMapContentInnerHtml}
                    <tr>
                        <td class='leftLine'>Customer Special Instructions</td>
                        <td class='rightLine'>${comments}</td>
                    </tr>
                </table>
            `
    }
    const ArrivalMapSurvey = _.cloneDeep(headerSurvey.questionList)
    for (const arrivalMapSurveyItem of ArrivalMapSurvey) {
        if (arrivalMapSurveyItem.visibilityRule) {
            const visible = judgeVisibleByRule(arrivalMapSurveyItem.visibilityRule, ArrivalMapSurvey)
            if (visible) {
                await handleAnswer(arrivalMapSurveyItem, usedImg)
                arrivalMapContentInner = `${arrivalMapContentInner}${arrivalMapSurveyItem.content}`
            }
        } else {
            await handleAnswer(arrivalMapSurveyItem, usedImg)
            arrivalMapContentInner = `${arrivalMapContentInner}${arrivalMapSurveyItem.content}`
        }
    }
    return arrivalMapHtmlContent(arrivalMapContentInner, comments)
}

const processProductContent = async (installRequestLineItem) => {
    if (installRequestLineItem.Equip_type_cde__c === 'VEN' || installRequestLineItem.Equip_type_cde__c === 'POS') {
        const products = await retrieveProductRequests(installRequestLineItem.Id)
        if (products.length > 0) {
            const content = products.map((item) => {
                const commissionRate =
                    installRequestLineItem.Contract_Type__c === 'Revenue'
                        ? `${(parseFloat(item.FSV_COMM_RATE_T1__c) * 100).toFixed(2).toString()} %`
                        : `$ ${addZeroes(item.FSV_COMM_RATE_T1__c)}`
                return `
                    <tr>
                         <td class='flexLine'>${item.slct_num__c}</td>
                         <td class='flexLine'>${item.inven_label__c}</td>
                         <td class='flexLine'>${item.inven_id__c}</td>
                         ${
                             installRequestLineItem.Equip_type_cde__c === 'VEN'
                                 ? `<td class='flexLine'>$ ${addZeroes(item.equip_mech_rte_amt__c)}</td>`
                                 : ''
                         }
                         ${
                             installRequestLineItem.FSV_Line_Item__c &&
                             installRequestLineItem.Rate_Type__c === 'Variable by Product'
                                 ? `<td class='flexLine'>${commissionRate}</td>`
                                 : ''
                         }
                    </tr>`
            })
            return `
                    <br>
                    <table class='table3'>
                        <tr>
                            <td class='flexLine grayBackground'>Select Number</td>
                            <td class='flexLine grayBackground'>Product Name</td>
                            <td class='flexLine grayBackground'>Product Id</td>
                            ${
                                installRequestLineItem.Equip_type_cde__c === 'VEN'
                                    ? "<td class='flexLine grayBackground'>Mech Rate</td>"
                                    : ''
                            }
                            ${
                                installRequestLineItem.FSV_Line_Item__c &&
                                installRequestLineItem.Rate_Type__c === 'Variable by Product'
                                    ? "<td class='flexLine grayBackground'>Commission Rate</td>"
                                    : ''
                            }
                        </tr>
                        ${content.join('')}
                    </table>
            `
        }
        return ''
    }
    return ''
}

const fsvCommRateContent = (commRate, contractType) => {
    if (contractType === 'Quantity') {
        return `$ ${commRate || '--'}`
    } else if (contractType === 'Revenue') {
        return `${commRate ? (parseFloat(commRate) * 100).toFixed(2).toString() : '--'} %`
    }
}

const fsvUnitContent = (unit, contractType) => {
    if (contractType === 'Quantity') {
        return `${unit || '--'}`
    } else if (contractType === 'Revenue') {
        return `$ ${unit || '--'}`
    }
}

const processFSVDetailContent = async (installRequestLineItem, supplierList) => {
    if (installRequestLineItem.FSV_Line_Item__c) {
        let supplier: any = []
        if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
            supplier = supplierList.filter((item: any) => item.Id === installRequestLineItem.Supplier__c)
        } else {
            supplier = await retrieveSupplierById(installRequestLineItem.Supplier__c)
        }
        let commissionRate = ''
        if (installRequestLineItem.Rate_Type__c === 'Flat at Asset') {
            commissionRate = `
                <tr>
                    <td class='leftLine'>FSV Tier 1 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T1__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 1 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T1__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                `
        } else if (installRequestLineItem.Rate_Type__c === 'Tier') {
            commissionRate = `
                <tr>
                    <td class='leftLine'>FSV Tier 1 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T1__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 1 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T1__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 2 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T2__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 2 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T2__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 3 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T3__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 3 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T3__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 4 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T4__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 4 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T4__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 5 Units</td>
                    <td class='rightLine'>${fsvUnitContent(
                        installRequestLineItem.FSV_UNIT_T5__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Tier 5 Amount</td>
                    <td class='rightLine'>${fsvCommRateContent(
                        installRequestLineItem.FSV_COMM_RATE_T5__c,
                        installRequestLineItem.Contract_Type__c
                    )}</td>
                </tr>
            `
        }
        return `
                <tr>
                    <td class='leftLine'>Rate Type</td>
                    <td class='rightLine'>${installRequestLineItem.Rate_Type__c}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Commission Basis</td>
                    <td class='rightLine'>${installRequestLineItem.Commission_Basis__c || 'N/A'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Contract Type</td>
                    <td class='rightLine'>${installRequestLineItem.Contract_Type__c || 'N/A'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Payment Schedule</td>
                    <td class='rightLine'>${installRequestLineItem.Payment_Schedule__c || 'N/A'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Deposit Amount</td>
                    <td class='rightLine'>$ ${installRequestLineItem.Deposit_Amount__c || '--'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Deduct Deposit</td>
                    <td class='rightLine'>${installRequestLineItem.Deduct_Deposit__c === true ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Supplier Name</td>
                    <td class='rightLine'>${supplier[0]?.supplier_name__c || 'N/A'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Supplier Number</td>
                    <td class='rightLine'>${supplier[0]?.supplier_no__c || 'N/A'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>FSV Notes / Comments </td>
                    <td class='rightLine'>${installRequestLineItem.FSV_Notes__c || '--'}</td>
                </tr>
                ${commissionRate}
        `
    }
    return ''
}

const GeneralEquipmentDetails = async (generalEquipmentSurvey, usedImg) => {
    let content = ''
    const surveys = _.cloneDeep(generalEquipmentSurvey)
    if (surveys?.length) {
        for (const survey of surveys) {
            if (survey?.questionList?.length > 1) {
                content += `
                    <h1>GENERAL EQUIPMENT DETAILS</h1>
                    <table class='table2'>
                        <tr>
                            <td class='leftLine'>Equipment Type</td>
                            <td class='rightLine'>${survey.type}</td>
                        </tr>
                `
                for (const [index, question] of survey.questionList.entries()) {
                    let visible = true
                    if (question.visibilityRule) {
                        visible = judgeVisibleByRule(question.visibilityRule, survey.questionList)
                    }
                    if (index > 0 && visible) {
                        await handleAnswer(question, usedImg)
                        content += question.content
                    }
                }
                content += '</table>'
            }
        }
    }
    return content
}

const EquipmentDetail = async (
    lineItemSurvey,
    installRequestLineItems,
    moveType,
    equipmentGrphcPicklistObject,
    usedImg
) => {
    let equipmentMoveContent = ''
    let EquipTableResult = ''
    let salesPlanDesc = '--'
    let graphicDesc = '--'
    const htmlContent = async (item, questionContent, productsList, fsvDetails) => {
        const equipSiteDesc = item.equip_site_desc__c || '--'
        const equipTypeDesc = item.equip_type_desc__c || '--'
        const equipSubtypeDesc = item.equip_styp_desc__c || '--'
        const comments = item.comments__c || '--'
        let commentContent = ''
        const salesPlanNamePicklist = await retrieveSalesPlanNamePicklist(false, item?.FSV_Line_Item__c)
        const salesPlanNamePicklistObject = {}
        salesPlanNamePicklist.forEach((v) => {
            salesPlanNamePicklistObject[v.Sls_plan_desc__c] = v.sls_plan_cde__c
        })
        for (const key in salesPlanNamePicklistObject) {
            if (salesPlanNamePicklistObject[key] === item.Sls_plan_cde__c) {
                salesPlanDesc = key
            }
        }
        for (const key in equipmentGrphcPicklistObject) {
            if (equipmentGrphcPicklistObject[key] === item.equip_grphc_id__c) {
                graphicDesc = key
            }
        }
        if (
            item.equip_move_type_cde__c === 'EXI' ||
            item.equip_move_type_cde__c === 'EXP' ||
            item.equip_move_type_cde__c === 'INS'
        ) {
            commentContent = `
                <tr>
                    <td class='leftLine'>Asset Prep Instructions</td>
                    <td class='rightLine'>${comments}</td>
                </tr>`
        }
        return `
                <h1>EQUIPMENT DETAILS</h1>
                <table class='table2'>
                    <table>
                        <tr>
                            <td class='leftLine'>Sales Plan</td>
                            <td class='rightLine'>${salesPlanDesc}</td>
                        </tr>
                        <tr>
                            <td class='leftLine'>Placement Location</td>
                            <td class='rightLine'>${equipSiteDesc}</td>
                        </tr>
                        <tr>
                            <td class='leftLine'>Equipment Type</td>
                            <td class='rightLine'>${equipTypeDesc}</td>
                        </tr>
                        <tr>
                            <td class='leftLine'>Equipment Subtype</td>
                            <td class='rightLine'>${equipSubtypeDesc}</td>
                        </tr>  
                        <tr>
                            <td class='leftLine'>Equipment Graphic</td>
                            <td class='rightLine'>${graphicDesc}</td>
                        </tr>  
                        <tr>
                            <td class='leftLine'>Equipment Move Type</td>
                            <td class='rightLine'>${moveType}</td>
                        </tr>
                        ${commentContent}
                        ${fsvDetails}
                        ${questionContent}
                    </table>
                    ${productsList}
                </table>
            `
    }
    let index = 0
    const AssetSpecificEquipment = _.cloneDeep(lineItemSurvey)
    let supplierList = []
    if (CommonParam.PERSONA__c === Persona.SALES_DISTRICT_LEADER) {
        const supplierIds = installRequestLineItems
            .filter((item: any) => item.FSV_Line_Item__c)
            .map((i: any) => i.Supplier__c)
        if (supplierIds.length > 0) {
            supplierList = await retrieveSuppliersByIds(supplierIds)
        }
    }
    for (const installRequestLineItem of installRequestLineItems) {
        let itemResult = ''
        let questionContent = ''
        if (AssetSpecificEquipment[index]) {
            for (const eachLineItemQ of AssetSpecificEquipment[index]?.questionList) {
                if (eachLineItemQ.visibilityRule) {
                    const questionList = AssetSpecificEquipment[index].questionList
                    const visible = judgeVisibleByRule(eachLineItemQ.visibilityRule, questionList)
                    if (visible) {
                        await handleAnswer(eachLineItemQ, usedImg)
                        questionContent = `${questionContent}${eachLineItemQ.content}`
                    }
                } else {
                    await handleAnswer(eachLineItemQ, usedImg)
                    questionContent = `${questionContent}${eachLineItemQ.content}`
                }
            }
        }
        if (index < installRequestLineItems.length - 1) {
            index++
        }
        const productsList = await processProductContent(installRequestLineItem)
        const fsvDetails = await processFSVDetailContent(installRequestLineItem, supplierList)
        itemResult = await htmlContent(installRequestLineItem, questionContent, productsList, fsvDetails)
        EquipTableResult = `${EquipTableResult}${itemResult}`
    }
    equipmentMoveContent = `${equipmentMoveContent}${EquipTableResult}`
    return equipmentMoveContent
}

export const PdfPage = async (
    headerSurvey,
    lineItemSurvey,
    installRequestLineItems,
    customer,
    l,
    type,
    request,
    movePurposeMapping,
    equipmentGrphcPicklistObject,
    generalEquipmentSurvey
) => {
    const usedImg = []
    let movePurpose = '--'
    const Id = type === 'Lead' ? l.LEAD_ID_c__c || '--' : customer['Account.CUST_UNIQ_ID_VAL__c'] || '--'
    const Name = type === 'Lead' ? l.Company__c || '--' : customer.Name || '--'
    const Street = type === 'Lead' ? l.Street__c || '--' : customer.Street || '--'
    const City = type === 'Lead' ? l.City__c || '--' : customer.City || '--'
    const State = type === 'Lead' ? l.State__c || '--' : customer.State || '--'
    const PostalCode = type === 'Lead' ? l.PostalCode__c || '--' : customer.PostalCode || '--'
    let requestName = ''
    let requestMobilePhone = ''

    if (request.requested_by__r === undefined) {
        requestName = request.saleRepName || '--'
        requestMobilePhone = request.saleRepPhone || '--'
    } else {
        requestName = request.requested_by__r.Name || '--'
        requestMobilePhone = request.requested_by__r.MobilePhone || '--'
    }

    const requestCallerName = request.caller_name__c || '--'
    const requestCallerPhone = request.caller_phone_num__c || '--'
    const requestEmail = request.email_addr_txt__c || '--'
    const requestComment = request.comments__c || '--'
    for (const key in movePurposeMapping) {
        if (movePurposeMapping[key] === request.move_purpose_cde__c) {
            movePurpose = key
        }
    }
    const moveType = getMoveTypeMapping()[request.equip_move_type_cde__c]
    const moveDate = moment(request.move_request_date__c).format(TIME_FORMAT.MM_DD_YYYY)
    let subjectLine = ''
    if (!request.details_revision_num__c) {
        if (type === 'Lead') {
            subjectLine = `${l.LEAD_ID_c__c}_${l.Company__c}${moveType}${moveDate}`
        } else {
            subjectLine = `${customer['Account.CUST_UNIQ_ID_VAL__c']}_${customer.Name}${moveType}${moveDate}`
        }
    } else {
        const sendEmailTimes = parseInt(request.details_revision_num__c) + 1
        if (type === 'Lead') {
            subjectLine = `Revision_${sendEmailTimes}_${l.LEAD_ID_c__c}_${l.Company__c}${moveType}${moveDate}`
        } else {
            subjectLine = `Revision_${sendEmailTimes}_${customer['Account.CUST_UNIQ_ID_VAL__c']}_${customer.Name}${moveType}${moveDate}`
        }
    }

    const leadCustomerFilterClause =
        type === 'Lead' ? `prod_loc_id__c = '${l.Location_ID_c__c}'` : `prod_loc_id__c = '${customer.LOC_PROD_ID__c}'`
    const path =
        'query/?q=SELECT bnc_site_srvy_email_addr__c,fntn_site_srvy_email_addr__c ' +
        `FROM Asset_Configuration__c WHERE ${leadCustomerFilterClause}` +
        'AND (bnc_site_srvy_email_addr__c != NULL ' +
        'OR fntn_site_srvy_email_addr__c != NULL) ' +
        'AND actv_stts_flg__c = TRUE  LIMIT 1'
    const { data } = await restDataCommonCall(path, 'GET')
    const bncEmailAddress = data?.records[0]?.bnc_site_srvy_email_addr__c || ''
    const fntnEmailAddress = data?.records[0]?.fntn_site_srvy_email_addr__c || ''
    const preSiteArrival = await ArrivalMapContent(headerSurvey, usedImg, requestComment)
    const generalEquipDetails = await GeneralEquipmentDetails(generalEquipmentSurvey, usedImg)
    const equipDetail = await EquipmentDetail(
        lineItemSurvey,
        installRequestLineItems,
        moveType,
        equipmentGrphcPicklistObject,
        usedImg
    )

    const htmlContent = `
                <html lang="en">
                    <head>
                        <meta charset='utf-8'>
                        <title>PES EQUIPMENT DETAILS FORM</title>
                        <style>
                            ${htmlStyles}
                        </style>
                        <body>
                            <header>
                                <h2>PES EQUIPMENT DETAILS FORM</h2>
                                <h1>IDENTIFICATION </h1>
                                <table>
                                    <tr>
                                        <td class='leftLine'>COF</td>
                                        <td class='rightLine'>${Id}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Name</td>
                                        <td class='rightLine'>${Name}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Street</td>
                                        <td class='rightLine'>${Street}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>City</td>
                                        <td class='rightLine'>${City}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>State</td>
                                        <td class='rightLine'>${State}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Zip</td>
                                        <td class='rightLine'>${PostalCode}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Sales Rep</td>
                                        <td class='rightLine'>${requestName}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Sales Rep Phone Number</td>
                                        <td class='rightLine'>${requestMobilePhone}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Main Contact Name</td>
                                        <td class='rightLine'>${requestCallerName}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Main Contact Phone Number</td>
                                        <td class='rightLine'>${requestCallerPhone}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Main Contact Email</td>
                                        <td class='rightLine'>${requestEmail}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Move Purpose</td>
                                        <td class='rightLine'>${movePurpose}</td>
                                    </tr>
                                </table>
                                <h1>PRE-SITE ARRIVAL DETAILS </h1>
                                ${preSiteArrival}
                                ${generalEquipDetails}
                                ${equipDetail}
                            </header>
                        <body>
                    </head>

                </html>
                    `
    return await sendEmailWithPdfAttachment(subjectLine, [bncEmailAddress, fntnEmailAddress], htmlContent, usedImg)
}
