/**
 * @description Pdf Utils
 * @author Kiren Cao
 * @date 2022/9/19
 */
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Mailer from 'react-native-mail'
import { Log } from '../../common/enums/Log'
import { storeClassLog } from '../../common/utils/LogUtils'
import { getStringValue } from './LandingUtils'

const SEND_EMAIL_ERROR = 'Sending email '
const createPDF = async (htmlContent, subjectLine) => {
    const options = {
        html: htmlContent,
        fileName: subjectLine,
        directory: 'Documents',
        base64: true
    }
    return await RNHTMLtoPDF.convert(options)
}
const handleSendMail = async (subjectLine: string, recipients: string[], file: { base64: any }) => {
    return new Promise<string>((resolve, reject) => {
        const pdfBase64 = `data:application/pdf;base64,${file.base64}`
        Mailer.mail(
            {
                subject: subjectLine,
                recipients: recipients,
                isHTML: true,
                attachments: [
                    {
                        type: 'pdf',
                        uri: pdfBase64,
                        name: `${subjectLine}.pdf`
                    }
                ]
            },
            (error, event) => {
                if (error) {
                    storeClassLog(Log.MOBILE_ERROR, 'handleSendMail', SEND_EMAIL_ERROR + getStringValue(error), {
                        Data__c: JSON.stringify({
                            subjectLine: subjectLine,
                            bncEmailAddress: recipients?.[0],
                            fntnEmailAddress: recipients?.[1]
                        })
                    })
                    reject(error)
                }
                resolve(event)
            }
        )
    })
}
export const sendEmailWithPdfAttachment = async (
    subjectLine: string,
    recipients: string[],
    htmlContent: string,
    usedImg?: any[]
) => {
    const file = await createPDF(htmlContent, subjectLine)
    if (file?.base64) {
        const mailRes = await handleSendMail(subjectLine, recipients, file)
        return { mailRes: mailRes, usedImg: usedImg }
    }
    throw new Error('Creat Pdf Failed')
}
