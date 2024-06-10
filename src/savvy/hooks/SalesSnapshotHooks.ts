import { CommonApi } from '../../common/api/CommonApi'
import {
    serviceCustomerMetrics,
    handleInvenData,
    customerSalesTrend,
    handleTopLineRevenue,
    formatProductMixData,
    formatSalesPerformanceData,
    formatPDPData
} from '../api/serviceCustomerMetrics'
import { IAllLineData } from '../components/manager/my-customers/SalesSnapshot/TrendsLineChart/TrendsLineChart'
import { useDropDown } from '../../common/contexts/DropdownContext'
import { CommonParam } from '../../common/CommonParam'
import StatusCode from '../enums/StatusCode'
import { useState } from 'react'
import { Log } from '../../common/enums/Log'
import _ from 'lodash'
import { checkAndRefreshBreadcrumbsToken } from '../service/BreadcrumbsService'
import { getCurrentPeriod } from '../components/merchandiser/MyPerformance'
import moment from 'moment/moment'
import { storeClassLog } from '../../common/utils/LogUtils'
import { t } from '../../common/i18n/t'
import { useDebounce } from './CommonHooks'

export const storeErrorWithStatus = (error: any, className: string) => {
    const errStatus = error.error?.data?.status || error.error?.status
    const errMsg = error.error?.data?.exceptionMsg || error.error?.exceptionMsg
    let logStatus = Log.MOBILE_ERROR
    if (errStatus === StatusCode.ClientErrorNotFound && errMsg === 'EMPTY_DATA') {
        logStatus = Log.MOBILE_WARN
    }
    storeClassLog(logStatus, className, error)
}

export const useSalesSnapshotData = (retailStore: any, periodCalendar: any, filter = 'YTD') => {
    const debounceTime = 1000
    const { dropDownRef } = useDropDown()
    const calendarData = getCurrentPeriod(moment(), periodCalendar) || {}
    const currentCalendar = {
        currentYear: calendarData?.Year__c || 1,
        currentPeriod: parseInt(calendarData?.Sequence__c) || 0
    }
    const [breakdownData, setBreakdownData] = useState([])
    const [productMixData, setProductMixData] = useState({})
    const [pdpData, setPDPData] = useState({})
    const [lineChartData, setLineChartData] = useState<IAllLineData>({
        VOLUME_YTD: {
            cy: [],
            py: []
        },
        VOLUME_QTD: {
            cy: [],
            py: []
        },
        VOLUME_PTD: {
            cy: [],
            py: []
        },
        REVENUE_YTD: {
            cy: [],
            py: []
        },
        REVENUE_QTD: {
            cy: [],
            py: []
        },
        REVENUE_PTD: {
            cy: [],
            py: []
        }
    })
    const [toplineMetricsData, setToplineMetricsData] = useState({
        volume: {
            YTD: 0,
            QTD: 0,
            PTD: 0
        },
        revenue: {
            YTD: 0,
            QTD: 0,
            PTD: 0
        }
    })

    const gpid = CommonParam.GPID__c

    const dealWithInvenRes = (resData: any) => {
        const invenRes = resData?.value || {}
        if (!_.isEmpty(invenRes) && invenRes.volumeSummaryByInven && invenRes.volumeSummaryByInven.length) {
            const tempData = handleInvenData(invenRes.volumeSummaryByInven)
            setBreakdownData(tempData)
        }
    }
    const dealWithRevenueFunRes = (resData: any) => {
        const revenueFunRes = resData?.value || {}
        const revenueFuncData = revenueFunRes?._CustomerSalesTrendByYear
        if (!_.isEmpty(revenueFuncData) && currentCalendar.currentPeriod !== 0) {
            setProductMixData(formatProductMixData(revenueFuncData, currentCalendar.currentPeriod))
            setLineChartData(formatSalesPerformanceData(revenueFuncData, currentCalendar.currentPeriod))
            const tempLineData = handleTopLineRevenue(revenueFuncData, currentCalendar)
            // @ts-ignore
            setToplineMetricsData({
                volume: {
                    YTD: _.isEmpty(tempLineData.yearList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.yearList, (v) => {
                                  return v.volume
                              })
                          ),
                    QTD: _.isEmpty(tempLineData.quarterList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.quarterList, (v) => {
                                  return v.volume
                              })
                          ),
                    PTD: _.isEmpty(tempLineData.periodList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.periodList, (v) => {
                                  return v.volume
                              })
                          )
                },
                revenue: {
                    YTD: _.isEmpty(tempLineData.yearList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.yearList, (v) => {
                                  return v.revenue
                              }),
                              2
                          ),
                    QTD: _.isEmpty(tempLineData.quarterList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.quarterList, (v) => {
                                  return v.revenue
                              }),
                              2
                          ),
                    PTD: _.isEmpty(tempLineData.periodList)
                        ? null
                        : _.round(
                              _.sumBy(tempLineData.periodList, (v) => {
                                  return v.revenue
                              }),
                              2
                          )
                }
            })
        }
    }
    const dealWithRevenueYTDRes = (resData: any) => {
        const revenueYTDRes = resData?.value || {}
        const revenueYTDData = revenueYTDRes?.RevenueTrendsByYear[0]
        if (!_.isEmpty(revenueYTDData)) {
            setPDPData(formatPDPData(revenueYTDData))
        }
    }

    const getData = async () => {
        await checkAndRefreshBreadcrumbsToken()
        const locid = retailStore['Account.LOC_PROD_ID__c']
        const custid = retailStore['Account.CUST_UNIQ_ID_VAL__c']
        const invenUrl = `${CommonApi.PBNA_MOBILE_API_CUSTOMER_METRICS_INVEN}?gpid=${gpid}&locid=${locid}&custid=${custid}&langcde=ENG`
        const revenueYTDUrl = `/${CommonApi.PBNA_MOBILE_API_CUSTOMER_TREND}?custid=${custid}`
        const revenueFuncUrl = `/${CommonApi.PBNA_MOBILE_API_CUSTOMER_SALES_TREND}?custid=${custid}`

        Promise.allSettled([
            serviceCustomerMetrics.get(invenUrl),
            customerSalesTrend.get(revenueFuncUrl),
            customerSalesTrend.get(revenueYTDUrl)
        ])
            .then((res) => {
                try {
                    let showBanner = false
                    const regex = /^5\d{2}$/
                    res.forEach((itemRes, index) => {
                        if (itemRes?.status === 'rejected') {
                            const errorInfo = itemRes?.reason || {}
                            const errStatus = errorInfo.error?.data?.status || errorInfo.error?.status
                            if (
                                errStatus === StatusCode.ClientErrorForbidden ||
                                errStatus === StatusCode.ClientErrorRequestTimeout ||
                                regex.test(`${errStatus}`)
                            ) {
                                showBanner = true
                            }
                            storeErrorWithStatus(errorInfo || {}, 'useSalesSnapshotData')
                        } else if (itemRes?.status === 'fulfilled') {
                            if (index === 0) {
                                dealWithInvenRes(res[0])
                            } else if (index === 1) {
                                dealWithRevenueFunRes(res[1])
                            } else if (index === 2) {
                                dealWithRevenueYTDRes(res[2])
                            }
                        }
                    })
                    if (showBanner) {
                        dropDownRef?.current?.alertWithType('info', '', t.labels.PBNA_MOBILE_SNAPSHOT_NOT_AVAILABLE)
                    }
                } catch (error) {
                    storeClassLog(Log.MOBILE_ERROR, 'dealWithSnapshotData', error)
                }
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'requestSnapshotData', err)
            })
    }

    useDebounce(
        () => {
            if (
                retailStore &&
                retailStore.Id &&
                currentCalendar &&
                currentCalendar.currentYear &&
                filter &&
                retailStore['Account.CUST_UNIQ_ID_VAL__c'] &&
                retailStore['Account.LOC_PROD_ID__c']
            ) {
                getData()
            } else {
                storeClassLog(Log.MOBILE_INFO, 'useSalesSnapshotData', `${CommonParam.userId} get retailStore failed`, {
                    Data__c: retailStore
                })
            }
        },
        debounceTime,
        [
            retailStore['Account.CUST_UNIQ_ID_VAL__c'],
            retailStore['Account.LOC_PROD_ID__c'],
            filter,
            currentCalendar.currentYear
        ]
    )
    return {
        breakdownData,
        productMixData,
        lineChartData,
        toplineMetricsData,
        pdpData
    }
}
