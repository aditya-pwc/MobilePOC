import _ from 'lodash'
import { Constants } from '../../../../../common/Constants'
import { t } from '../../../../../common/i18n/t'
import {
    AssessmentIndicators,
    AuditAssessmentIndicators,
    PercentageEnum,
    ShelfSurveyKeyEnum,
    getMedalMap
} from '../../../../enums/Contract'
import { getAddress } from '../../../../helper/rep/StartNewCDAHelper'
import { handleRewardValue } from './RewardsModals'
import {
    checkShowOptimizationOrStash,
    getContractedShelves,
    getExecutionData,
    getExecutionElementsData,
    multiplyBy100KeepInteger
} from '../../../../helper/rep/AuditHelper'
import { initAudit } from '../../../../redux/reducer/AuditReducer'
import { formatNullValue } from './SpaceViewPage'
import { VisitSubType } from '../../../../enums/Visit'
const auditStyles = `
<style>
    .avoid-page-break {
        break-inside: avoid;
    }

    body {
        background-color: #f0f0f0;
    }

    .paddingLeft_10 {
        padding-left: 10px;
    }

    .leftColum {
        width: 50%;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .tr {
        flex-direction: row;
    }

    .colum33 {
        width: 33%;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .halfRowItem {
        width: 50%;
        word-wrap: break-word;
        padding-top: 10px;
        font-size: 12px;
    }

    .rowItem {
        width: 100%;
        word-wrap: break-word;
        padding-top: 10px;
        font-size: 12px;
    }

    .placeholderBox {
        height: 20px;
        width: 100%;
    }

    .rightColum {
        width: 50%;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .pageContainer {
        background-color: #fff;
        padding: 22px;
        overflow: scroll;
    }

    .pageBreak {
        break-before: page;
    }

    .pageBreakAfter {
        break-after: page;
    }

    .header {
        display: flex;
        flex-direction: column;
    }

    .pageLogo {
        height: 30px;
    }

    .signaturePng {
        height: 100px;
        width: 100px;
    }

    .term{
        width: 100%;

    }

    .subHeader {
        margin-top: 10px;
    }

    .bold_18 {
        font-weight: 700;
        font-size: 18px;
    }

    .bold_12 {
        font-weight: 700;
        font-size: 12px;
    }

    .bold_14 {
        font-weight: 700;
        font-size: 14px;
    }

    .item20 {
        width: 20%;
        font-size: 12px;
        padding-top: 10px;
    }

    .item25 {
        width: 25%;
        font-size: 12px;
        padding-top: 10px;
    }
    
    .item33 {
        width: 33%;
        font-size: 12px;
        padding-top: 10px;
        word-wrap: break-word;
    }

    .itemHalf {
        width: 50%;
        font-size: 12px;
        padding-top: 10px;
    }

    .mainHeader {
        height: 20px;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pageBody {
        border-radius: 10px;
        border: 1px solid #ccc;
    }

    .detailSection {
        flex: 1;
        flex-direction: row;
        flex-wrap: wrap;
        margin: 10px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .sectionTitle {
        lineHeight: 20px,
        width: 100%;
        height: 20px;
        background-color: #ccc;
        padding-top: 5px;
        margin-top: 20px;
        padding-bottom: 5px;
        break-inside: avoid;
    }

    .PWS {
        padding-top: 20px;
        padding-left: 10px;
    }
    .pdfBox{
        width: 100%;
        height: 1500px;
    }
</style>`

const getHalfRowItem = (arr: any[], contractInfo: any, halfRowItemStyle: string, unit = '') => {
    const htmlArray = arr.map((item: any) => {
        if (item.kpiName === t.labels.PBNA_MOBILE_TOTAL) {
            return ''
        }
        const itemVal = item?.kpiRequirements?.[contractInfo.Signed_Medal_Tier__c]
        const html = `
          <div class='halfRowItem ${halfRowItemStyle}'>${item.kpiName}: ${itemVal ? `${unit}${itemVal}` : ''}</div>
        `
        return html
    })

    const html = htmlArray.join('')

    const finalHTML = `<div>${html}</div>`
    return finalHTML
}
const termList = (lstContractFile: string[]) => {
    const htmlArray = lstContractFile.map((file: any) => {
        const html = `<img class='term' src="${Constants.IMAGE_DATA_PREFIX}${file}"/>`
        return html
    })

    const html = htmlArray.join('')
    const finalHTML = `<div class="pageBreak">${html}</div>`

    return finalHTML
}

const showPOGPage = (contractInfo: any) => {
    const html = `
         <div class="pageBreak">
             <iframe  width="823px" height="600px" frameborder="0" type="application/pdf"  src="${contractInfo.POGUrl}" ></iframe>
         </div>`

    return contractInfo.POGUrl ? html : `<div/>`
}

const getRewardsInfoItem = (rewards: any[]) => {
    const htmlArray = rewards.map((item: any) => {
        const html = `<div class='placeholderBox'></div>
        <div class='rowItem bold_12'> ${item.TARGET_NAME__c || ''} x ${
            t.labels.PBNA_MOBILE_CONTRACT_NUMBER_OF_STORES
        }</div>
        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PAYMENT_FREQUENCY}: ${item.FREQ_TYPE__c || ''}</div>
        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_AGREEMENT}: ${item.Model__c || ''}</div>
        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_ADDITIONAL_DETAILS}: ${
            item.Rewards_Description__c || ''
        }</div>
        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_NUMBER_OF_STORES}: ${handleRewardValue(item) || ''}</div>`
        return html
    })
    const html = htmlArray.join('')
    const finalHTML = `<div>${html}</div>`
    return finalHTML
}
const renderHeader = (contractInfo: any) => {
    return `
    <div class='header'>
        <div class='mainHeader'>
            <div class='bold_18'> ${t.labels.PBNA_MOBILE_CONTRACT_CUSTOMER_AGREEMENT}</div>
            <img class='pageLogo' src="${Constants.IMAGE_DATA_PREFIX}${
        contractInfo.base64List?.lstPepsiPartnerShip[0] || ''
    }"/>
        </div>
        <div class='subHeader bold_18'>
           ${t.labels.PBNA_MOBILE_CONTRACT_SINGLE_OUTLET_STARTING} ${contractInfo.contractStartDate} ${
        t.labels.PBNA_MOBILE_CONTRACT_AND
    } ${contractInfo.contractEndDate}
        </div>
  </div>
  `
}

const checkValueIsNull = (val: string | number | undefined | null) => {
    return val === '' || val === undefined || val === null
}

export const contractPdfHtml = (contractInfo: any, subjectLine: string) => {
    const htmlPdf = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subjectLine}</title>
        <style>

            .avoid-page-break {
                break-inside: avoid;
            }

            body {
                background-color: #f0f0f0;
            }

            .paddingLeft_10 {
                padding-left: 10px;
            }

            .leftColum {
                width: 50%;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .halfRowItem {
                width: 50%;
                word-wrap: break-word;
                padding-top: 10px;
                font-size: 12px;
            }

            .rowItem {
                width: 100%;
                word-wrap: break-word;
                padding-top: 10px;
                font-size: 12px;
            }

            .placeholderBox {
                height: 20px;
                width: 100%;
            }

            .rightColum {
                width: 50%;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .pageContainer {
                background-color: #fff;
                padding: 22px;
            }

            .pageBreak {
                break-before: page;
            }

            .pageBreakAfter {
                break-after: page;
            }

            .header {
                display: flex;
                flex-direction: column;
            }

            .pageLogo {
                height: 30px;
            }

            .signaturePng {
                height: 100px;
                width: 100px;
            }

            .term{
                width: 100%;

            }

            .subHeader {
                margin-top: 10px;
            }

            .bold_18 {
                font-weight: 700;
                font-size: 18px;
            }

            .bold_12 {
                font-weight: 700;
                font-size: 12px;
            }

            .bold_14 {
                font-weight: 700;
                font-size: 14px;
            }

            .mainHeader {
                height: 20px;
                font-weight: 700;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pageBody {
                border-radius: 10px;
                border: 1px solid #ccc;
            }

            .detailSection {
                flex: 1;
                flex-direction: row;
                flex-wrap: wrap;
                margin: 10px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }

            .sectionTitle {
                lineHeight: 20px,
                width: 100%;
                height: 20px;
                background-color: #ccc;
                padding-top: 5px;
                margin-top: 20px;
                padding-bottom: 5px;
                break-inside: avoid;
            }

            .PWS {
                padding-top: 20px;
                padding-left: 10px;
            }
            .pdfBox{
                width: 100%;
                height: 1500px;
            }
            iframe {
                display: block;
                margin: 0 auto;
            }
        </style>
    </head>

    <body>
            <div class="pageContainer">
            ${renderHeader(contractInfo)}
                <div class='subHeader bold_18'>
                   ${t.labels.PBNA_MOBILE_CONTRACT_TERMER}:
                </div>
                <div class='pageBody'>
                    <div class='detailSection'>
                        <div class='leftColum'>
                            <div class='rowItem bold_12'>${contractInfo.customerName}</div>
                            <div class='rowItem'>${contractInfo.customerAddress}</div>
                            <div class='rowItem'>
                            ${t.labels.PBNA_MOBILE_CONTRACT_CONTRACT_NAME}: ${contractInfo.contactName}
                            </div>
                        </div>
                        <div class='rightColum'>
                            <div class='rowItem bold_12'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_CUSTOMER_ID}: ${contractInfo.customerId}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_LOCATION}: ${contractInfo.locationName}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_MARKET}: ${contractInfo.marketName}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_DATE_SIGNED}: ${contractInfo.dateSigned}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_DATE_AGREED}: ${contractInfo.dateSigned}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_CONTRACT_EMAIL}: ${contractInfo.contactEmail}
                            </div>
                        </div>

                    </div>
                    <div class="sectionTitle">
                        <div class="paddingLeft_10 bold_14">
                            ${t.labels.PBNA_MOBILE_CONTRACT_SURVEY_INFORMATION}
                        </div>
                    </div>
                    <div class='detailSection'>
                        <div class='leftColum'>
                            <div class='rowItem bold_14'>${t.labels.PBNA_MOBILE_CONTRACT_SHELVES}</div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_TOTAL_COLD_VAULT_LRB_SHELVES}:
                                ${contractInfo.totalColdVaultLRBShelves}
                           </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_TOTAL_COLD_VAULT_PEPSI_LRB_SHELVES}:
                                ${contractInfo.totalColdVaultPepsiLRBShelves}
                            </div>
                        </div>
                        <div class='rightColum'>
                            <div class='rowItem bold_14'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_DOOR_SURVEY}
                            </div>
                            <div class='rowItem'>
                                ${t.labels.PBNA_MOBILE_CONTRACT_NUMBER_OF_LRB_DOORS}: ${contractInfo.doorSurvey}
                            </div>
                        </div>

                    </div>

                    <div class="PWS bold_14">
                        ${t.labels.PBNA_MOBILE_CONTRACT_PEPSI_PROGRAM_DSD_REWARDS_PWS_CDA} - ${
        contractInfo.Signed_Medal_Tier__c
    }
                    </div>
                    <div class='detailSection'>
                        <div class='leftColum'>
                            <div class='rowItem'>
                            ${t.labels.PBNA_MOBILE_CONTRACT_LRB_SPACE_PERCENT}: ${contractInfo.LRBSpace}${
        checkValueIsNull(contractInfo.LRBSpace) ? '' : '%'
    }
                            </div>
                            <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_TOTAL_LRB_SPACE_PERCENT}:
                            ${contractInfo.ProposedTotalLRBSpace}${
        checkValueIsNull(contractInfo.ProposedTotalLRBSpace) ? '' : '%'
    }</div>
                            <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_PEP_PERIMETER_SHELVES}:
                            ${contractInfo.ProposedPEPPerimeterShelves}</div>
                        </div>
                        <div class='rightColum'>
                            <div class='rowItem'>
                            ${t.labels.PBNA_MOBILE_CONTRACT_LRB_SHELVES_SPACE}: ${contractInfo.LRBShelvesSpace}
                            </div>
                            <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_TOTAL_PEP_LRB_SHELVES}:
                             ${contractInfo.ProposedTotalPepLRBShelves}</div>
                            <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PROPOSED_PEP_COLD_VAULT_SHELVES}:
                            ${contractInfo.ProposedPepColdVaultShelves}</div>
                        </div>
                    </div>

                    <div class='paddingLeft_10'>
                        ${getHalfRowItem(contractInfo.fundingPackage, contractInfo, '', '$')}
                    </div>
                    <div class='paddingLeft_10'>
                        ${getRewardsInfoItem(contractInfo.rewards)}
                    </div>

                    <div class='PWS bold_14 '>
                       ${t.labels.PBNA_MOBILE_CONTRACT_PEPSI_COLD_VAULT_REQUESTED_STANDARDS_DSD} - ${
        contractInfo.Signed_Medal_Tier__c
    }
                    </div>

                    <div class='detailSection'>
                        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_COLD_VAULT}</div>
                        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_SPACE_TO_BE_SET_ACCORDING}</div>
                        <div class='rowItem'>${
                            t.labels.PBNA_MOBILE_CONTRACT_PEPSI_SHELVES_TO_BE_IN_FIRST_POSITION
                        }</div>
                        <div class='rowItem'>
                            ${t.labels.PBNA_MOBILE_CONTRACT_ALL_PBC_COLD_VAULT_SPACE}
                        </div>
                    </div>
                    <div class="sectionTitle">
                        <div class="paddingLeft_10 bold_14 ">
                            ${t.labels.PBNA_MOBILE_CONTRACT_MERCHANDISING_EQUIPMENT_DSD}
                        </div>
                    </div>

                    ${getHalfRowItem(contractInfo.Equipment, contractInfo, 'paddingLeft_10')}

                    <div class="sectionTitle">
                        <div class="paddingLeft_10 bold_14 ">
                        ${t.labels.PBNA_MOBILE_CONTRACT_MERCHANDISING_EQUIPMENT_REQUESTED_STANDARDS_DSD}
                        </div>
                    </div>
                    <div class='detailSection'>
                        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_MERCHANDISING_EQUIPMENT}</div>
                        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_REGISTER_COOLER}</div>
                        <div class='rowItem'>
                         ${t.labels.PBNA_MOBILE_CONTRACT_NON_CARBONATED_COOLER}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_COUNTER_TOP_COOLER}
                       </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_COLD_BARREL}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_PEPSI_BRANDED_EQUIPMENT_MUST_NOT}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_PEPSI_BRANDED_EQUIPMENT_MUST_BE}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_ALL_PBC_COOLERS_ARE_TO_BE}
                        </div>
                    </div>

                    <div class='detailSection'>
                        <div class='placeholderBox'></div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_POINT_OF_SALE_INSIDE_STORE}
                        </div>
                        <div class='rowItem'>
                        1) ${t.labels.PBNA_MOBILE_CONTRACT_STATIC_CLING_ON_COOLER_DOOR}
                        </div>
                        <div class='rowItem'>
                        2) ${t.labels.PBNA_MOBILE_CONTRACT_WINDOW_SIGN}
                        </div>
                        <div class='rowItem'>
                        3) ${t.labels.PBNA_MOBILE_CONTRACT_SHELF_STRIPS_ON_COOLER_SHELVES}
                        </div>
                        <div class='rowItem'>
                        4) ${t.labels.PBNA_MOBILE_CONTRACT_PUSH_PULL_STATIC_ON_FRONT_DOOR}
                        </div>
                    </div>

                    <div class='detailSection'>
                        <div class='placeholderBox'></div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_POINT_OF_SALE_OUTSIDE_STORE}
                        </div>
                        <div class='rowItem'>
                            1) ${t.labels.PBNA_MOBILE_CONTRACT_PARKING_LOT_SIGN}
                        </div>
                        <div class='rowItem'>
                            2) ${t.labels.PBNA_MOBILE_CONTRACT_PUMP_TOPPER}
                        </div>
                        <div class='rowItem'>
                            3) ${t.labels.PBNA_MOBILE_CONTRACT_BUMP_BLASTER}
                        </div>
                    </div>

                    <div class="sectionTitle" >
                            <div class="paddingLeft_10 bold_14 ">
                             ${t.labels.PBNA_MOBILE_CONTRACT_PRODUCTS_DISPLAY}
                            </div>
                     </div>
                       ${getHalfRowItem(contractInfo.Display, contractInfo, 'paddingLeft_10')}
                    <div class="sectionTitle">
                        <div class="paddingLeft_10 bold_14 ">
                        ${t.labels.PBNA_MOBILE_CONTRACT_PRODUCTS_DISPLAY_REQUESTED_STANDARDS}
                        </div>
                    </div>
                    <div class='detailSection'>
                        <div class='rowItem'>${t.labels.PBNA_MOBILE_CONTRACT_PRODUCTS_DISPLAY}</div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_CANS_PERMANENT_DISPLAY} ${contractInfo.CDA_Year__c || ''} ${
        t.labels.PBNA_MOBILE_CONTRACT_FULL_YEAR_INVENTORY_AND_NO_LESS_THAN
    }
                        </div>
                        <div class='rowItem'>
                           ${t.labels.PBNA_MOBILE_CONTRACT_TWO_LITERS_PERMANENT_DISPLAY} ${
        contractInfo.CDA_Year__c || ''
    } ${t.labels.PBNA_MOBILE_CONTRACT_FULL_YEAR_INVENTORY_AND_NO_LESS_THAN_COMPETITION}
                        </div>
                        <div class='rowItem'>
                           ${t.labels.PBNA_MOBILE_CONTRACT_GONDOLA_ALLOCATE_PBC_BRANDS} ${
        contractInfo.CDA_Year__c || ''
    } ${t.labels.PBNA_MOBILE_CONTRACT_FULL_YEAR_AND_NO_LESS_THAN_COMPETITION}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_NON_CARB_DISPLAY}
                        </div>
                        <div class='rowItem'>
                        ${t.labels.PBNA_MOBILE_CONTRACT_OUTSIDE_SUMMER_DISPLAY}
                        </div>
                        <div class='placeholderBox'></div>
                    </div>
                </div>
                ${termList(contractInfo.base64List.lstContractFile)}
                <div class="pageBreak ">
                    <div class='detailSection'>
                        <div class='leftColum'>
                        <div class='rowItem bold_14'>${contractInfo.customerName || ''}</div>
                        <img   class='signaturePng' src="
                        ${contractInfo.CustomerSignature}"/>
                        <div class='rowItem bold_14'>${contractInfo.customerSignedName || ''}</div>
                        <div class='rowItem bold_14'>${contractInfo.customerSignedTitle || ''}</div>
                    </div>
                    <div class='rightColum'>
                        <div class='rowItem bold_14'>PepsiCo</div>
                        <img  class='signaturePng' src="
                        ${contractInfo.RepSignature}"/>
                        <div class='rowItem bold_14'>${contractInfo.contactName || ''}</div>
                        <div class='rowItem bold_14'>${contractInfo.description || ''}</div>
                    </div>
                </div>
         </div>
        ${showPOGPage(contractInfo)}
    </body>

    </html>`

    return htmlPdf
}

export const foodServiceContractHtml = (scannedImages: string[]) => {
    let img = ''
    for (const image of scannedImages) {
        img =
            img +
            `<div class="imgContaner">
                <img class="contractImage" src="data:image/jpeg;base64,${image}" />
            </div>
        `
    }
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                .pageContainer {
                }
                .imgContaner {
                    display: flex;
                    flex-direction: column;
                    padding-top: auto;
                    padding-bottom: auto;
                }
                .contractImage {
                    align-self: center;
                    break-after: page;
                    max-height: 970px;
                    flex-grow: 0;
                }
            </style>
        </head>
        <body>
            <div class="pageContainer">
                ${img}
            </div>
        </body>
        </html>`
}

// Salesforce API name
// eslint-disable-next-line camelcase
function eeComparator(a: { VALUE_TYPE__c: 'Equipment' | 'Display'; title: string }, b: typeof a) {
    if (a.VALUE_TYPE__c === 'Equipment' && b.VALUE_TYPE__c === 'Display') {
        return -1 // Equipment comes before Display
    } else if (a.VALUE_TYPE__c === 'Display' && b.VALUE_TYPE__c === 'Equipment') {
        return 1 // Display comes after Equipment
    }
    return 0
}
function rewardSort(selectRewardArray: any[]) {
    const isSpecialCharacter = (str: string) => {
        return /[!@#$%^&*(),.?":{}|<>]/.test(str)
    }
    const isNumber = (str: string) => {
        return /^\d+$/.test(str)
    }
    selectRewardArray.sort((a, b) => {
        const lowerA = a[0]
        const lowerB = b[0]
        if (isSpecialCharacter(lowerA.charAt(0)) && !isSpecialCharacter(lowerB.charAt(0))) {
            return -1
        } else if (!isSpecialCharacter(lowerA.charAt(0)) && isSpecialCharacter(lowerB.charAt(0))) {
            return 1
        } else if (isNumber(lowerA.charAt(0)) && !isNumber(lowerB.charAt(0))) {
            return -1
        } else if (!isNumber(lowerA.charAt(0)) && isNumber(lowerB.charAt(0))) {
            return 1
        } else if (lowerA.charAt(0).toLowerCase() === lowerB.charAt(0).toLowerCase()) {
            return -lowerA.charAt(0).localeCompare(b[0].charAt(0))
        } else if (lowerA.charAt(0).toLowerCase() < lowerB.charAt(0).toLowerCase()) {
            return -1
        }
        return 1
    })
    return selectRewardArray
}
export const getAuditHtml = (
    auditData: typeof initAudit,
    customerDetail: any,
    retailStore: any,
    spaceBreakdownRequired: any
) => {
    const showComplianceScore = checkShowOptimizationOrStash(auditData, spaceBreakdownRequired)
    const medalMap = getMedalMap()
    const isVisitSubtypeGeneralAudit = auditData.auditVisit.Visit_Subtype__c === VisitSubType.GENERAL_AUDIT
    const isMedalVisit = !!medalMap[auditData.contract?.Signed_Medal_Tier__c]
    const executionElementsData = getExecutionElementsData(auditData)
    const contractedShelves = getContractedShelves(auditData)
    const executionData = getExecutionData(auditData, spaceBreakdownRequired)
    const formatSelectRewardArray = rewardSort(Object.entries(auditData.selectRewards))
    let scoreText

    if (showComplianceScore) {
        const optimizationScore = auditData?.executionDataScore?.OptimizationScore ?? null
        scoreText = formatNullValue(optimizationScore) || 'N/A'
    } else {
        scoreText = 'N/A'
    }

    const executionScoreSection = `
        <div style="padding-left: 10px; padding-top: 10px">
        ${
            t.labels.PBNA_MOBILE_AUDIT_EXECUTION_SCORE +
            '                                            ' +
            (formatNullValue(auditData.executionDataScore.executionScore) || 'N/A') +
            (formatNullValue(auditData.executionDataScore.executionScore) ? '%' : '')
        }
        </div>`

    const isCDACompliantText =
        auditData.auditVisit?.CDA_Compliance__c === true
            ? t.labels.PBNA_MOBILE_AUDIT_GENERAL_COMPLIANT
            : t.labels.PBNA_MOBILE_AUDIT_NOT_COMPLIANT
    const isEEDataCompliantText = executionElementsData?.every((item: any) => item.differenceVal >= 0)
        ? t.labels.PBNA_MOBILE_AUDIT_EXECUTION_ELEMENTS_ARE_COMPLIANT
        : t.labels.PBNA_MOBILE_AUDIT_EXECUTION_ELEMENTS_ARE_NOT_COMPLIANT
    const isRewardCompliantText = _.chain(auditData.selectRewards).values().every(Boolean).value()
        ? t.labels.PBNA_MOBILE_AUDIT_REWARDS_ARE_COMPLIANT
        : t.labels.PBNA_MOBILE_AUDIT_REWARDS_ARE_NOT_COMPLIANT

    return `
${auditStyles}
<div class="pageContainer">
    <div class="header">
        <div class="mainHeader">

            <div class="bold_18">${
                isVisitSubtypeGeneralAudit
                    ? t.labels.PBNA_MOBILE_AUDIT_GENERAL_AUDIT_EXPORT
                    : t.labels.PBNA_MOBILE_AUDIT_POST_CDA_AUDIT_EXPORT
            }
            </div>
            <img class="pageLogo" src="${Constants.IMAGE_DATA_PREFIX + auditData.logo}" />
        </div>
        <div class="subHeader bold_18">
            ${
                t.labels.PBNA_MOBILE_AUDIT_SINGLE_OUTLET +
                ' ' +
                auditData.contract.Signed_Medal_Tier__c +
                ' ' +
                t.labels.PBNA_MOBILE_CDA +
                ' - ' +
                t.labels.PBNA_MOBILE_AUDIT_STARTING +
                ' ' +
                auditData.contract.StartDate +
                ' ' +
                t.labels.PBNA_MOBILE_CONTRACT_AND +
                ' ' +
                auditData.contract.EndDate
            }
        </div>
        ${
            isMedalVisit
                ? `<div class="subHeader bold_18">
            ${isCDACompliantText}
                </div>`
                : ''
        }
    </div>
    <div class="subHeader bold_18">${t.labels.PBNA_MOBILE_AUDIT_CONTRACT_DETAILS}</div>
    <div class="pageBody">
        <div class="detailSection">
            <div class="leftColum">
                <div class="rowItem bold_12">${retailStore?.name || customerDetail.Name}</div>
                <br />
                <div class="rowItem">${getAddress(customerDetail)}</div>
            </div>
            <div class="rightColum">
                <div class="rowItem bold_12">
                    ${t.labels.PBNA_MOBILE_CONTRACT_CUSTOMER_ID}: ${
        retailStore?.customerId || customerDetail?.['Account.CUST_UNIQ_ID_VAL__c']
    }
                </div>
                <br />
                <div class="rowItem">
                    ${t.labels.PBNA_MOBILE_AUDIT_LOCATION}: ${auditData.locationInfo.locationName || ''}
                </div>
                <div class="rowItem">
                    ${t.labels.PBNA_MOBILE_AUDIT_MARKET}: ${auditData.locationInfo.marketName || ''}
                </div>
                <div class="rowItem">
                    ${t.labels.PBNA_MOBILE_AUDIT_DATE_SIGNED}: ${auditData.contract.CustomerSignedDate || ''}
                </div>
            </div>
        </div>
        <!-- END Basic Info -->
        <!-- START Space Overview -->
        <div class="paddingLeft_10"></div>
        <div class="sectionTitle">
            <div class="paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_CONTRACT_COMPARISON}</div>
        </div>
        <div class="subHeader paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_SPACE_OVERVIEW}</div>
        <div class="detailSection">
            <div style="display: flex; width: 100%; flex-direction: column">
                <div style="display: flex; justify-content: space-between">
                    <span class="item25"></span>
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_ACTUAL} </span>
                    <span class="item25">${t.labels.PBNA_MOBILE_CONTRACTED} </span>
                    <span class="item25"
                        >${t.labels.PBNA_MOBILE_TIER_DASH_REQUIRED}
                    </span>
                </div>
                <div style="display: flex; padding-left: 10px; justify-content: space-between">
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_TOTAL_PEP_LRB_PERCENT}</span>
                    <span class="item25"
                        >${multiplyBy100KeepInteger(
                            auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]?.ActualDecimalValue
                        )}</span
                    >
                    <span class="item25"
                        >${formatNullValue(auditData.requiredKPIValue.requiredShelves.totalPepLRB)}</span
                    >
                    <span class="item25">${_.round(
                        Number(auditData.coldVaultData.VALUE__c || 0) * PercentageEnum.ONE_HUNDRED,
                        1
                    )}</span>
                </div>
                <div style="display: flex; padding-left: 10px; justify-content: space-between">
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_TOTAL_PEP_LRB_SHELVES}</span>
                    <span class="item25"
                        >${formatNullValue(
                            auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]
                                ?.ActualDecimalValue
                        )}</span
                    >
                    <span class="item25"
                        >${formatNullValue(auditData.requiredKPIValue.requiredShelves.totalPepLRBShelves)}</span
                    >
                    <span class="item25">${_.round(
                        Number(auditData.CDAVisitKpi['Total LRB Shelves'].ActualDecimalValue || 0) *
                            Number(auditData.coldVaultData.VALUE__c || 0),
                        1
                    )}</span>
                </div>
                ${
                    auditData.contract.CDA_Space_Checkbox__c
                        ? `
                <div style="display: flex; padding-left: 10px; justify-content: space-between">
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_PEP_COLD_VAULT_SHELVES}</span>
                    <span class="item25"
                        >${formatNullValue(
                            auditData.auditVisitKpi?.[AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT]
                                ?.ActualDecimalValue
                        )}</span
                    >
                    <span class="item25">${
                        formatNullValue(auditData.requiredKPIValue.requiredShelves.PEPColdVaultShelves) || 'N/A'
                    }</span>
                    <span class="item25">${'N/A'}</span>
                </div>
                <div style="display: flex; padding-left: 10px; justify-content: space-between">
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_PEP_PERIMETER_SHELVES} </span>
                    <span class="item25">
                        ${formatNullValue(
                            auditData.auditVisitKpi?.[AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT]
                                ?.ActualDecimalValue
                        )}
                        </span>
                    <span class="item25">${
                        formatNullValue(auditData.requiredKPIValue.requiredShelves.PEPPerimeterShelves) || 'N/A'
                    }</span>
                    <span class="item25">${'N/A'}</span>
                </div>
                `
                        : ''
                }
            </div>
            <!-- END Space Overview -->
            <!-- START Execution Element executionData -->
            <div class="subHeader bold_14">${t.labels.PBNA_MOBILE_AUDIT_EXECUTION_ELEMENTS}</div>
            <div style="display: flex; width: 100%; flex-direction: column; padding-left: 10px">
                <div style="display: flex; justify-content: space-between">
                    <span class="item25"></span>
                    <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_ACTUAL}</span>
                    <span class="item25">${t.labels.PBNA_MOBILE_CONTRACTED}</span>
                    <span class="item25"
                        >${t.labels.PBNA_MOBILE_TIER_DASH_REQUIRED}</span
                    >
                </div>
                ${executionElementsData
                    .sort(eeComparator)
                    .map(
                        (item: any) => `
                <div style="display: flex; justify-content: space-between">
                    <span class="item25">${item.title}</span>
                    <span class="item25">${item.actual}</span>
                    <span class="item25">${formatNullValue(
                        auditData.requiredKPIValue.requiredExecutionData[item.id]
                    )}</span>
                    <span class="item25">${item.required}</span>
                </div>
                `
                    )
                    .join('')}
            </div>
            ${
                isMedalVisit && executionElementsData && executionElementsData.length > 0
                    ? `<div>
                    ${isEEDataCompliantText}
                </div>`
                    : ''
            }
        </div>
        <!-- COMPETITOR OVERVIEW -->
        <div class="subHeader bold_14 paddingLeft_10">${t.labels.PBNA_MOBILE_AUDIT_COMPETITOR_OVERVIEW}</div>
        <div style="display: flex; padding-left: 20px; justify-content: space-between padding-left: 10px">
            <span class="itemHalf">${t.labels.PBNA_MOBILE_AUDIT_ACTUAL_COMP_PERCENT}</span>
            <span class="itemHalf"
                >${formatNullValue(
                    multiplyBy100KeepInteger(
                        auditData.auditVisitKpi?.[AuditAssessmentIndicators.ACTUAL_COMP]?.ActualDecimalValue
                    )
                )}</span
            >
        </div>
        <div style="display: flex; padding-left: 20px; justify-content: space-between">
            <span class="itemHalf">${t.labels.PBNA_MOBILE_AUDIT_ACTUAL_COMP_SHELVES}</span>
            <span class="itemHalf"
                >${formatNullValue(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.ACTUAL_COMP_SHELVES]?.ActualDecimalValue
                )}</span
            >
        </div>

        <div class="subHeader paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_REWARDS}</div>
        ${formatSelectRewardArray
            .map(
                (reward) => `
        <div style="display: flex; padding-left: 20px; justify-content: space-between">
            <span class="itemHalf">${reward[0]}</span>
            <span class="itemHalf"
                >${reward[1] ? t.labels.PBNA_MOBILE_AUDIT_FOUND : t.labels.PBNA_MOBILE_AUDIT_NOT_FOUND}</span
            >
        </div>
        `
            )
            .join('')}
            ${
                auditData?.contract?.Id && auditData.selectRewards && Object.values(auditData.selectRewards).length > 0
                    ? `<div class="subHeader paddingLeft_10">
                    ${isRewardCompliantText}
                </div>`
                    : ''
            }
        ${
            isMedalVisit
                ? `
        <div class="sectionTitle">
            <div class="paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_SPACE_BREAKDOWN}</div>
        </div>
        <div style="display: flex; padding-left: 10px; justify-content: space-between">
            <span class="itemHalf">${t.labels.PBNA_MOBILE_AUDIT_CONTRACTED_SHELVES}</span>
            <span class="itemHalf">
                ${contractedShelves}
            </span>
        </div>
        <div style="display: flex; padding-left: 10px; justify-content: space-between">
            <span class="itemHalf">${t.labels.PBNA_MOBILE_AUDIT_OPTIMIZATION_SCORE}</span>
            <span class="itemHalf">
                ${scoreText}
            </span>
        </div>

        <div class="subHeader paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_CATEGORY_OPTIMIZATION}</div>
            <div style="display: flex; padding-left: 10px; justify-content: space-between">
                <span class="item25"></span>
                <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_ACTUAL}</span>
                <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_REQUIRED}</span>
                <span class="item25">${t.labels.PBNA_MOBILE_AUDIT_SHELF_DIFFERENCE}</span>
            </div>
        ${executionData
            .map(
                (item) => `
            <div style="display: flex; padding-left: 20px; justify-content: space-between">
                <span class="item25">${item.title}</span>
                <span class="item25">${item.actual}</span>
                <span class="item25">${item.required}</span>
                <span class="item25">${
                    (item.differenceVal && item.differenceVal > 0 ? '+' : '') + item.difference
                }</span>
            </div>
        `
            )
            .join('')}
        <div class="subHeader paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_FOLLOW_UP_NOTES}</div>
        <div style="font-size: 12px; padding-left: 10px; padding-top: 10px;word-wrap: break-word;text-wrap: wrap;">${
            auditData.auditVisit.InstructionDescription || ''
        }
        </div>
    `
                : ''
        }
        ${!isMedalVisit ? executionScoreSection : ''}
    </div>
</div>
`
}

const emptyToDash = (str: unknown) => {
    if (str == null || str === '') {
        return '-'
    }
    return str
}

export const getGeneralAuditHtml = (auditData: typeof initAudit, customerDetail: any, retailStore: any) => {
    return `
    ${auditStyles}
    <div class="pageContainer">
    <div class="header">
        <div class="mainHeader">
            <div class="bold_18">${t.labels.PBNA_MOBILE_AUDIT_GENERAL_AUDIT_EXPORT_NO_CONTRACT}</div>
            <img class="pageLogo" src="${Constants.IMAGE_DATA_PREFIX + auditData.logo}" />
        </div>
    </div>
    <div class="subHeader bold_18">${t.labels.PBNA_MOBILE_AUDIT_CUSTOMER_DETAILS}</div>
    <div class="pageBody">
        <div class="detailSection">
            <div class="leftColum">
                <div class="rowItem bold_12">${retailStore?.name || customerDetail.Name}</div>
                <br />
                <div class="rowItem">${getAddress(customerDetail)}</div>
            </div>
            <div class="rightColum">
                <div class="rowItem bold_12">
                    ${t.labels.PBNA_MOBILE_CONTRACT_CUSTOMER_ID}: ${
        retailStore?.customerId || customerDetail?.['Account.CUST_UNIQ_ID_VAL__c']
    }
                </div>
                <br />
                <div class="rowItem">
                    ${t.labels.PBNA_MOBILE_AUDIT_LOCATION}: ${auditData.locationInfo.locationName || ''}
                </div>
                <div class="rowItem">
                    ${t.labels.PBNA_MOBILE_AUDIT_MARKET}: ${auditData.locationInfo.marketName || ''}
                </div>
            </div>
            </div>
            <div class="sectionTitle">
                <div class="paddingLeft_10 bold_14">${t.labels.PBNA_MOBILE_AUDIT_SHELF_SURVEY}</div>
            </div>
            <div class="paddingLeft_10">
                <div class="subHeader bold_12">${
                    t.labels.PBNA_MOBILE_AUDIT_NUMBER_OF_DOORS + ': ' + auditData[AssessmentIndicators.DOOR_SURVEY]
                }</div>
                <div style="display: flex; width: 100%; flex-direction: column">
                    <div style="display: flex; justify-content: space-between">
                        <span class="item20"></span>
                        <span class="item20">${t.labels.PBNA_MOBILE_AUDIT_TOTAL}</span>
                        <span class="item20">${t.labels.PBNA_MOBILE_AUDIT_PEPSI_SHELVES}</span>
                        <span class="item20">${t.labels.PBNA_MOBILE_AUDIT_COKE_SHELVES}</span>
                        <span class="item20">${t.labels.PBNA_MOBILE_AUDIT_OTHER_SHELVES}</span>
                    </div>
                    ${auditData.shelfSurveyData
                        .map(
                            (item: any) => `
                    <div style="display: flex; justify-content: space-between">
                        <span class="item20">${item.title}</span>
                        <span class="item20">${emptyToDash(item[ShelfSurveyKeyEnum.TOTAL_VOL])}</span>
                        <span class="item20">${emptyToDash(item[ShelfSurveyKeyEnum.PEPSI_VOL])}</span>
                        <span class="item20">${emptyToDash(item[ShelfSurveyKeyEnum.COKE_VOL])}</span>
                        <span class="item20">${emptyToDash(item[ShelfSurveyKeyEnum.OTHER_VOL])}</span>
                    </div>
                    `
                        )
                        .join('')}
                </div>
            </div>
        </div>
    </div>
    `
}
