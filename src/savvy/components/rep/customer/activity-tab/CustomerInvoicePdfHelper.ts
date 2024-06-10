import { sendEmailWithPdfAttachment } from '../../../../utils/PdfUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

export const generateCustomerInvoicePdf = async (invoiceData, retailStore) => {
    const htmlStyles = `
    h1 {
        font: bold 100% sans-serif;
        text-transform: uppercase;
        color: #00A2D9;
        font-size: 22;
    }

    h2 {
        font: bold 100% sans-serif;
        color: #00A2D9
    }

    table {
        border: 1px solid #cccccc;
        border-spacing: 0
    }

    td {
        border: 0.5px solid #cccccc
    }

    .leftLine {
        background-color: rgba(218, 218, 218, 1);
        width: 400px;
        padding: 5px
    }

    .rightLine {
        padding: 5px;
        width: 400px
    }`

    const generatePackageGroup = (item) => {
        return `
            <h2>${item?.HRZN_PROD_GRP_DESC}&nbsp;${item?.HRZN_PKG_GRP_DESC}</h2>
            <h2>SKU ${item?.UPC_CDE}</h2>
            <table>
                <tr>
                    <td class='leftLine'>Cases</td>
                    <td class='rightLine'>${item?.INVC_VOL_RAWCS_QTY?.toFixed(2) || '-'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Revenue</td>
                    <td class='rightLine'>$ ${item?.INVC_ONTKT_REV_PER_UNIT_AMT?.toFixed(2) || '-'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Discount</td>
                    <td class='rightLine'>$ ${item?.INVC_DSCNT_PER_UNIT_AMT?.toFixed(2) || '-'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Net Price</td>
                    <td class='rightLine'>$ ${item?.INVC_NET_PRC_PER_UNIT_AMT?.toFixed(2) || '-'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Pepsi Deposit</td>
                    <td class='rightLine'>$ ${item?.INV_TOT_DPST_AMT?.toFixed(2) || '-'}</td>
                </tr>
                <tr>
                    <td class='leftLine'>Net Amnt</td>
                    <td class='rightLine'>$ ${item?.INVC_NET_AMT?.toFixed(2) || '-'}</td>
                </tr>
            </table>
        `
    }

    const htmlContent = `<html lang="en">
            <head>
                <meta charset='utf-8'>
                <title>CONTACT INFORMATION FORM </title>
                <style>
                    ${htmlStyles}
                </style>
            </head>
            <body>
                <h1>Invoice ${invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_INV_ID}</h1>
                <table>
                    <tr>
                        <td class='leftLine'>Invoice Date</td>
                        <td class='rightLine'>${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_INV_DTE
                                ? moment
                                      .utc(invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_INV_DTE)
                                      .format(TIME_FORMAT.DDMMMY)
                                : '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Delivery Date</td>
                        <td class='rightLine'>${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.DELY_DTE
                                ? moment
                                      .utc(invoiceData?.InvoiceLineVolumesByYear[0]?.DELY_DTE)
                                      .format(TIME_FORMAT.DDMMMY)
                                : '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Total Cases</td>
                        <td class='rightLine'>${invoiceData?.totalSalesVolume?.toFixed(0) || '-'}</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Location</td>
                        <td class='rightLine'>${invoiceData?.InvoiceLineVolumesByYear[0]?.DELY_ADR_CITY || '-'}&nbsp;${
        invoiceData?.InvoiceLineVolumesByYear[0]?.DELY_ADR_STATE
    }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Route</td>
                        <td class='rightLine'>${invoiceData?.InvoiceLineVolumesByYear[0]?.DW_PROD_RTE_ID || '-'}</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Store Number</td>
                        <td class='rightLine'>${invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_STOR_NUM_VAL || '-'}</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Payment Term</td>
                        <td class='rightLine'>${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.INV_PYMT_MTHD_DESC || '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Tax ID</td>
                        <td class='rightLine'>${invoiceData?.InvoiceLineVolumesByYear[0]?.TAX_EXEMPT_NUM || '-'}</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Sales Tax</td>
                        <td class='rightLine'>$ ${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.SLS_TAX_AMT.toFixed(2) || '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>State Charge Amount</td>
                        <td class='rightLine'>$ ${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.ST_CHRG_AMT.toFixed(2) || '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Sales Revenue</td>
                        <td class='rightLine'>$ ${
                            invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_INV_SOLD_AMT?.toFixed(2) || '-'
                        }</td>
                    </tr>
                    <tr>
                        <td class='leftLine'>Net Revenue Return</td>
                        <td class='rightLine'>$ ${
                            invoiceData.InvoiceLineVolumesByYear[0]?.CUST_INV_RTND_AMT?.toFixed(2) || '-'
                        }</td>
                    </tr>
                </table>
                ${invoiceData?.InvoiceLineVolumesByYear?.map((item) => {
                    return generatePackageGroup(item)
                })?.join('')}
            </body>
        </html>`
    return await sendEmailWithPdfAttachment(
        `${retailStore.Name} ${retailStore['Account.CUST_UNIQ_ID_VAL__c']} - Invoice ${
            invoiceData?.InvoiceLineVolumesByYear[0]?.CUST_INV_ID
        } - ${moment().format('MM-DD-YYYY')}`,
        [],
        htmlContent
    )
}
