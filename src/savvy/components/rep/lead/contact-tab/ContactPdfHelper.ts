import { restDataCommonCall } from '../../../../api/SyncUtils'
import _ from 'lodash'
import { sendEmailWithPdfAttachment } from '../../../../utils/PdfUtils'
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
const processContactContent = async (contactItem) => {
    if (contactItem.length > 0) {
        const content = contactItem.map((item) => {
            return _.isEmpty(item)
                ? ''
                : `
                    <tr>
                         <td class='flexLine'>${item.Name || '--'}</td>
                         <td class='flexLine'>${item.Phone || item.phone || '--'}</td>
                         <td class='flexLine'>${item.Email || '--'}</td>
                         <td class='flexLine'>${item.Preferred_Contact_Method__c || '--'}</td>
                    </tr>`
        })
        return `
                    <br>
                    <table class='table3'>
                        <tr>
                            <td class='flexLine grayBackground'>Contact Name</td>
                            <td class='flexLine grayBackground'>Contact Phone</td>
                            <td class='flexLine grayBackground'>Contact Email</td>
                            <td class='flexLine grayBackground'>Contact Preferred Contact Method</td>
                        </tr>
                        ${content.join('')}
                    </table>
            `
    }
    return ''
}

export const ContactPdfPage = async (contactItem, l, type) => {
    const Name = l?.Company__c || l?.Name || '--'
    const Address = l?.Street__c || l?.Street || '--'
    const City = l?.City__c || l?.City || '--'
    const State = l?.State__c || l?.State || '--'
    const postalCode = l?.PostalCode__c || l?.PostalCode || '--'
    const CustomerNumber = l['Account.CUST_UNIQ_ID_VAL__c'] || '--'
    const phone = l?.Phone__c || l['Account.Phone'] || '--'
    const email = l?.Email__c || '--'
    const pepsiChannel = l?.BUSN_SGMNTTN_LVL_3_NM_c__c || l['Account.BUSN_SGMNTTN_LVL_3_NM__c'] || '--'
    const pepsiBusinessSegment = l?.BUSN_SGMNTTN_LVL_2_NM_c__c || l['Account.BUSN_SGMNTTN_LVL_2_NM__c'] || '--'
    const pepsiSubsegment = l?.BUSN_SGMNTTN_LVL_1_NM_c__c || l['Account.BUSN_SGMNTTN_LVL_1_NM__c'] || '--'
    let pepsiLocation
    if (type === 'RetailStore') {
        const path =
            'query/?q=SELECT Location__c ' +
            `FROM Route_Sales_Geo__c WHERE LOC_ID__c = '${l['Account.LOC_PROD_ID__c']}' AND Location__c != NULL LIMIT 1`
        const { data } = await restDataCommonCall(path, 'GET')
        pepsiLocation = data?.records[0]?.Location__c || '--'
    } else {
        pepsiLocation = l?.Location_c__c || '--'
    }

    let subjectLine
    if (type === 'RetailStore') {
        subjectLine = `${l['Account.Name']} ${l['Account.CUST_UNIQ_ID_VAL__c']}`
    } else {
        subjectLine = `${l.Company__c}`
    }
    const contactDetail = await processContactContent(contactItem)
    const htmlContent = `
                <html lang="en">
                    <head>
                        <meta charset='utf-8'>
                        <title>CONTACT INFORMATION FORM </title>
                        <style>
                            ${htmlStyles}
                        </style>
                        <body>
                            <header>
                                <h2>CONTACT INFORMATION FORM </h2>
                                <h1>IDENTIFICATION </h1>
                                <table>
                                    <tr>
                                        <td class='leftLine'>Name</td>
                                        <td class='rightLine'>${Name}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Address</td>
                                        <td class='rightLine'>${Address}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>City</td>
                                        <td class='rightLine'>${City}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>State/Province</td>
                                        <td class='rightLine'>${State}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Zip</td>
                                        <td class='rightLine'>${postalCode}</td>
                                    </tr>
                                    ${
                                        type === 'RetailStore'
                                            ? ` <tr>
                                        <td class='leftLine'>Customer Number</td>
                                        <td class='rightLine'>${CustomerNumber}</td>
                                    </tr>`
                                            : ''
                                    }
                                    <tr>
                                        <td class='leftLine'>Phone Number</td>
                                        <td class='rightLine'>${phone}</td>
                                    </tr>
                                     ${
                                         type === 'Lead'
                                             ? ` <tr>
                                        <td class='leftLine'>Email</td>
                                        <td class='rightLine'>${email}</td>
                                    </tr>`
                                             : ''
                                     }
                                    <tr>
                                        <td class='leftLine'>Pepsi Channel</td>
                                        <td class='rightLine'>${pepsiChannel}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Pepsi Business Segment</td>
                                        <td class='rightLine'>${pepsiBusinessSegment}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Pepsi Subsegment</td>
                                        <td class='rightLine'>${pepsiSubsegment}</td>
                                    </tr>
                                    <tr>
                                        <td class='leftLine'>Pepsi Location</td>
                                        <td class='rightLine'>${pepsiLocation}</td>
                                    </tr>
                                </table>
                                 ${
                                     _.isEmpty(contactItem[0])
                                         ? '<h1>NO CONTACT YET </h1>'
                                         : `<h1>CONTACT DETAILS </h1>
        ${contactDetail}`
                                 }
                            </header>
                        <body>
                    </head>

                </html>
                    `
    return await sendEmailWithPdfAttachment(subjectLine, [], htmlContent)
}
