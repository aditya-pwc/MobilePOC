import { customerSalesTrend } from '../api/serviceCustomerMetrics'
import { CommonApi } from '../../common/api/CommonApi'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import { checkAndRefreshBreadcrumbsToken } from '../service/BreadcrumbsService'
import { storeErrorWithStatus } from './SalesSnapshotHooks'
import { useDropDown } from '../../common/contexts/DropdownContext'
import StatusCode from '../enums/StatusCode'
import { t } from '../../common/i18n/t'

// Math.round(-1.5) will be 1 not 2, so special handling negative numbers
export const cRound = (number: number, precision = 0) => {
    const sign = number < 0 ? -1 : 1

    const pow = Math.pow(10, precision)

    return (Math.round(number * sign * pow) / pow) * sign
}

export const useCustomerInvoiceHeader = (customerId: string) => {
    const { dropDownRef } = useDropDown()
    const invoiceHeaderUrl = `${CommonApi.PBNA_MOBILE_API_CUSTOMER_HEADER}?custid=${customerId}`
    const [invoiceHeader, setInvoiceHeader] = useState<{ InvoiceHeaderVolumesByYear: any[] }>({
        InvoiceHeaderVolumesByYear: []
    })

    const handleError = (e: any, className: string) => {
        storeErrorWithStatus(e, className)
        setInvoiceHeader({
            InvoiceHeaderVolumesByYear: []
        })
        const errStatus = e.error?.data?.status || e.error?.status
        const regex = /^5\d{2}$/
        if (
            errStatus === StatusCode.ClientErrorForbidden ||
            errStatus === StatusCode.ClientErrorRequestTimeout ||
            regex.test(`${errStatus}`)
        ) {
            dropDownRef?.current?.alertWithType('info', '', t.labels.PBNA_MOBILE_INVOICE_NOT_AVAILABLE)
        }
    }

    useEffect(() => {
        if (customerId) {
            checkAndRefreshBreadcrumbsToken()
                .then(() => {
                    customerSalesTrend
                        .get(invoiceHeaderUrl)
                        .then((res) => {
                            // the response from api don't have data property
                            // @ts-ignore
                            const sortedRes = _.orderBy(res?.InvoiceHeaderVolumesByYear, ['CUST_INV_DTE'], ['desc'])
                            setInvoiceHeader({
                                InvoiceHeaderVolumesByYear: sortedRes
                            })
                        })
                        .catch((err) => handleError(err, 'useCustomerInvoiceHeader'))
                })
                .catch((e) => handleError(e, 'invoiceHeaderToken'))
        }
    }, [customerId])

    return invoiceHeader
}

export const useCustomerInvoiceVolumes = (invoiceId: string, customerId: string) => {
    const invoiceVolumeUrl = `${CommonApi.PBNA_MOBILE_API_CUSTOMER_LINE}?custinvid=${invoiceId}&custid=${customerId}`
    const [invoiceVolume, setInvoiceVolume] = useState<{
        InvoiceLineVolumesByYear: any[]
        totalSalesVolume: number | null
    }>({
        InvoiceLineVolumesByYear: [],
        totalSalesVolume: null
    })

    const handleError = (e: any, className: string) => {
        storeErrorWithStatus(e, className)
        setInvoiceVolume({
            InvoiceLineVolumesByYear: [],
            totalSalesVolume: null
        })
    }

    useEffect(() => {
        if (invoiceId) {
            checkAndRefreshBreadcrumbsToken()
                .then(() => {
                    customerSalesTrend
                        .get(invoiceVolumeUrl)
                        .then((res) => {
                            // the response from api don't have data property
                            // @ts-ignore
                            const volume = _.cloneDeep(res?.InvoiceLineVolumesByYear)
                            let totalSalesVolume = 0
                            volume?.forEach((v: any) => {
                                totalSalesVolume += _.add(v?.INVC_TOT_SLS_VOL_CS_QTY || 0, v?.INVC_TOT_RTRN_CS_QTY || 0)
                            })
                            setInvoiceVolume({
                                InvoiceLineVolumesByYear: volume,
                                totalSalesVolume: cRound(totalSalesVolume)
                            })
                        })
                        .catch((err) => handleError(err, 'useCustomerInvoiceVolumes'))
                })
                .catch((e) => handleError(e, 'invoiceVolumeToken'))
        }
    }, [invoiceId, customerId])
    return invoiceVolume
}
