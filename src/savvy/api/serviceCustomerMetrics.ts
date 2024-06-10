/**
 * @description Network request configuration for EDW
 * @author Kevin Gu
 * @date 2022/03/05
 */
import axios from 'axios'
import _ from 'lodash'
import { CommonParam } from '../../common/CommonParam'
import StatusCode from '../enums/StatusCode'
import { fetchBreadcrumbsToken } from '../service/BreadcrumbsService'
import { CommonApi } from '../../common/api/CommonApi'
import { t } from '../../common/i18n/t'
import moment from 'moment/moment'

let isRefreshing = false

export const serviceCustomerMetrics = axios.create({
    timeout: 80000
})

export const customerSalesTrend = axios.create({
    timeout: 80000
})

/**
 * http request interceptors
 */
serviceCustomerMetrics.interceptors.request.use(
    (config) => {
        config.headers = {
            Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`,
            'Content-Type': 'application/json',
            ...config.headers
        }
        config.baseURL = CommonApi.PBNA_MOBILE_API_CUST_METRICS_BASEURL
        return config
    },
    (error) => {
        return Promise.reject({ status: 'E98', error })
    }
)
customerSalesTrend.interceptors.request.use(
    (config) => {
        config.headers = {
            Authorization: `Bearer ${CommonParam.breadcrumbsAccessToken}`,
            'Content-Type': 'application/json',
            ...config.headers
        }
        config.baseURL = CommonApi.PBNA_MYPEPSICO_BASE_URL
        return config
    },
    (error) => {
        return Promise.reject({ status: 'E98', error })
    }
)

/**
 * http response interceptors
 */
serviceCustomerMetrics.interceptors.response.use(
    (response) => {
        if (response?.status === StatusCode.SuccessOK) {
            return response.data
        }
        return Promise.reject(response)
    },
    function (error) {
        const code = error?.response?.status
        // if the session is expired, try to refresh the token.
        if (error.response) {
            if (code === StatusCode.ClientErrorUnauthorized) {
                if (!isRefreshing) {
                    isRefreshing = true
                    return fetchBreadcrumbsToken()
                        .then((res) => {
                            const config = _.cloneDeep(error.config)
                            config.headers = {
                                ...config.headers,
                                Authorization: `Bearer ${res}`
                            }
                            return serviceCustomerMetrics(config)
                        })
                        .finally(() => {
                            isRefreshing = false
                        })
                }
            }
            return Promise.reject({ status: 'E98', error: error.response })
        }
        return Promise.reject({ status: 'E98', error })
    }
)
customerSalesTrend.interceptors.response.use(
    (response) => {
        if (response?.status === StatusCode.SuccessOK) {
            return response.data
        }
        return Promise.reject(response)
    },
    function (error) {
        const code = error?.response?.status
        // if the session is expired, try to refresh the token.
        if (error.response) {
            if (code === StatusCode.ClientErrorUnauthorized) {
                if (!isRefreshing) {
                    isRefreshing = true
                    return fetchBreadcrumbsToken()
                        .then((res) => {
                            const config = _.cloneDeep(error.config)
                            config.headers = {
                                ...config.headers,
                                Authorization: `Bearer ${res}`
                            }
                            return customerSalesTrend(config)
                        })
                        .finally(() => {
                            isRefreshing = false
                        })
                }
            }
            return Promise.reject({ status: 'E98', error: error.response })
        }

        return Promise.reject({ status: 'E98', error })
    }
)

export const handleCategoryData = (data: any) => {
    const csd = { title: 'CSD', cy: 0, py: 0, sumIndex: '' }
    const ncsd = { title: 'NCSD', cy: 0, py: 0, sumIndex: '' }
    const bc = { title: 'B&C', cy: 0, py: 0, sumIndex: '' }
    const fountain = { title: t.labels.PBNA_MOBILE_FOUNTAIN, cy: 0, py: 0, sumIndex: '' }
    const fsv = { title: 'FSV', cy: 0, py: 0, sumIndex: '' }
    const th = { title: t.labels.PBNA_MOBILE_TAKE_HOME, cy: 0, py: 0, sumIndex: '' }
    const cd = { title: t.labels.PBNA_MOBILE_COOL_DRINK, cy: 0, py: 0, sumIndex: '' }
    if (!data || _.isEmpty(data)) {
        return [
            [csd, ncsd],
            [bc, fountain, fsv],
            [th, cd]
        ]
    }
    csd.cy = data.csd_ytd_cy_meas_actl_qty ? Math.round(data.csd_ytd_cy_meas_actl_qty) : 0
    csd.py = data.csd_ytd_py_meas_actl_qty ? Math.round(data.csd_ytd_py_meas_actl_qty) : 0
    // csd.sumIndex = csd.py === 0 ? 'NA' : Math.round((csd.cy / csd.py) * 100) + '%'

    ncsd.cy = data.non_csd_ytd_cy_meas_actl_qty ? Math.round(data.non_csd_ytd_cy_meas_actl_qty) : 0
    ncsd.py = data.non_csd_ytd_py_meas_actl_qty ? Math.round(data.non_csd_ytd_py_meas_actl_qty) : 0
    // ncsd.sumIndex = ncsd.py === 0 ? 'NA' : Math.round((csd.cy / csd.py) * 100) + '%'
    const rowOneSum = csd.cy + ncsd.cy
    csd.sumIndex = rowOneSum === 0 ? 'NA' : Math.round((csd.cy / rowOneSum) * 100) + '%'
    ncsd.sumIndex = rowOneSum === 0 ? 'NA' : Math.round((ncsd.cy / rowOneSum) * 100) + '%'

    bc.cy = data.bc_ytd_cy_meas_actl_qty ? Math.round(data.bc_ytd_cy_meas_actl_qty) : 0
    bc.py = data.bc_ytd_py_meas_actl_qty ? Math.round(data.bc_ytd_py_meas_actl_qty) : 0
    // bc.sumIndex = bc.py === 0 ? 'NA' : Math.round((bc.cy / bc.py) * 100) + '%'

    fountain.cy = data.ftn_ytd_cy_meas_actl_qty ? Math.round(data.ftn_ytd_cy_meas_actl_qty) : 0
    fountain.py = data.ftn_ytd_py_meas_actl_qty ? Math.round(data.ftn_ytd_py_meas_actl_qty) : 0
    // fountain.sumIndex = fountain.py === 0 ? 'NA' : Math.round((fountain.cy / fountain.py) * 100) + '%'

    fsv.cy = data.fsv_ytd_cy_meas_actl_qty ? Math.round(data.fsv_ytd_cy_meas_actl_qty) : 0
    fsv.py = data.fsv_ytd_py_meas_actl_qty ? Math.round(data.fsv_ytd_py_meas_actl_qty) : 0
    // fsv.sumIndex = fsv.py === 0 ? 'NA' : Math.round((fsv.cy / fsv.py) * 100) + '%'

    const rowTwoSum = bc.cy + fountain.cy + fsv.cy
    bc.sumIndex = rowTwoSum === 0 ? 'NA' : Math.round((bc.cy / rowTwoSum) * 100) + '%'
    fountain.sumIndex = rowTwoSum === 0 ? 'NA' : Math.round((fountain.cy / rowTwoSum) * 100) + '%'
    fsv.sumIndex = rowTwoSum === 0 ? 'NA' : Math.round((fsv.cy / rowTwoSum) * 100) + '%'

    th.cy = data.take_home_ytd_cy_meas_actl_qty ? Math.round(data.take_home_ytd_cy_meas_actl_qty) : 0
    th.py = data.take_home_ytd_py_meas_actl_qty ? Math.round(data.take_home_ytd_py_meas_actl_qty) : 0
    // th.sumIndex = th.py === 0 ? 'NA' : Math.round((th.cy / th.py) * 100) + '%'

    cd.cy = data.cold_drink_ytd_cy_meas_actl_qty ? Math.round(data.cold_drink_ytd_cy_meas_actl_qty) : 0
    cd.py = data.cold_drink_ytd_py_meas_actl_qty ? Math.round(data.cold_drink_ytd_py_meas_actl_qty) : 0
    // cd.sumIndex = cd.py === 0 ? 'NA' : Math.round((cd.cy / cd.py) * 100) + '%'

    const rowThreeSum = th.cy + cd.cy
    th.sumIndex = rowThreeSum === 0 ? 'NA' : Math.round((th.cy / rowThreeSum) * 100) + '%'
    cd.sumIndex = rowThreeSum === 0 ? 'NA' : Math.round((cd.cy / rowThreeSum) * 100) + '%'

    return [
        [csd, ncsd],
        [bc, fountain, fsv],
        [th, cd]
    ]
}

export const handleLineChartData = (data: Object) => {
    const ytdCy = []
    const ytdPy = []
    const qtdCy = []
    const qtdPy = []
    const ptdCy = []
    const ptdPy = []
    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('pd') && key.includes('cqtr_cy_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            qtdCy[index] = value ? Math.round(value) : 0
        } else if (key.startsWith('pd') && key.includes('cqtr_py_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            qtdPy[index] = value ? Math.round(value) : 0
        }
        if (key.startsWith('pd') && !key.includes('cqtr_cy_meas_actl_qty') && key.includes('cy_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            ytdCy[index] = value ? Math.round(value) : 0
        } else if (key.startsWith('pd') && !key.includes('cqtr_py_meas_actl_qty') && key.includes('py_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            ytdPy[index] = value ? Math.round(value) : 0
        }
        if (key.startsWith('wk') && key.includes('cpd_cy_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            ptdCy[index] = value ? Math.round(value) : 0
        } else if (key.startsWith('wk') && key.includes('cpd_py_meas_actl_qty')) {
            const index = key.match(/\d+/)[0] - 1
            ptdPy[index] = value ? Math.round(value) : 0
        }
    }
    return {
        YTD: { cy: ytdCy, py: ytdPy },
        QTD: { cy: qtdCy, py: qtdPy },
        PTD: { cy: ptdCy, py: ptdPy }
    }
}

export const handleTopLineRevenue = (data: any, currentCalendar: any) => {
    const tempQuarterList: { volume: any; revenue: any }[] = []
    const tempPeriodList: { volume: any; revenue: any }[] = []
    const tempYearList: { volume: any; revenue: any }[] = []
    const quarterType = 'Quarter'
    const periodType = 'Period'
    const yearType = 'YEAR'
    const fourQuartersInAYear = [
        [1, 12],
        [13, 24],
        [25, 36],
        [37, 53]
    ]
    let quarterValue = 0
    const currentYearDataList = _.filter(data, (item) => {
        return item.FSCL_YR_NUM === moment().year()
    })[0]?._PeriodType
    const getQuarterByDate = () => {
        fourQuartersInAYear.forEach((item, index) => {
            const totalWeek = _.range(item[0], item[1] + 1)
            if (totalWeek.includes(moment().week())) {
                quarterValue = index + 1
            }
        })
    }
    getQuarterByDate()
    const getRevenueDataByType = (type: string) => {
        const dataList = _.filter(
            _.filter(currentYearDataList, (item) => {
                return item.TMPRD_TYP_CDV === type
            })[0]._PeriodInYearValue,
            (item) => {
                if (type === quarterType) {
                    return item?.TMPRD_IN_YR_NUM === quarterValue
                } else if (type === periodType) {
                    return item?.TMPRD_IN_YR_NUM === currentCalendar.currentPeriod
                } else if (type === yearType) {
                    return item?.FSCL_YR_TMPRD_VAL === `${currentCalendar.currentYear}-YR1`
                }
            }
        )[0]?._DetailsBySalesCode
        _.map(dataList, (item) => {
            if (type === quarterType) {
                tempQuarterList.push({
                    volume: item?._Quantity?.CY_VOL_CS_QTY,
                    revenue: item?._RevenueAmounts?.CY_NET_REV_AMT
                })
            } else if (type === periodType) {
                tempPeriodList.push({
                    volume: item?._Quantity?.CY_VOL_CS_QTY,
                    revenue: item?._RevenueAmounts?.CY_NET_REV_AMT
                })
            } else if (type === yearType && item?.SLST_CDTH_CD === 'ALL_CDTH') {
                tempYearList.push({
                    volume: item?._Quantity?.CY_VOL_CS_QTY,
                    revenue: item?._RevenueAmounts?.CY_NET_REV_AMT
                })
            }
        })
    }
    getRevenueDataByType(quarterType)
    getRevenueDataByType(periodType)
    getRevenueDataByType(yearType)
    return {
        quarterList: tempQuarterList,
        periodList: tempPeriodList,
        yearList: tempYearList
    }
}

export const handleInvenData = (data: any) => {
    let packageData = []
    if (!data || !data.length) {
        return packageData
    }
    packageData = _.uniqBy(
        data.map((d) => {
            return {
                totalPY: 0,
                totalPercentage: '',
                totalCY: 0,
                totalBW: 0,
                packageTypeName: d.pkg_desc || '',
                packageId: d.PKG_ID,
                lstBreakdownProduct: []
            }
        }),
        'packageId'
    )
    const productData = data.map((d) => {
        return {
            packageId: d.PKG_ID,
            productName: d.inven_name,
            aloneCY: d.ytd_cy_meas_actl_qty ? Math.round(d.ytd_cy_meas_actl_qty) : 0,
            alonePY: d.ytd_py_meas_actl_qty ? Math.round(d.ytd_py_meas_actl_qty) : 0,
            alonePercentage:
                Math.round(d.ytd_py_meas_actl_qty) === 0
                    ? 'NA'
                    : Math.round((d.ytd_cy_meas_actl_qty / d.ytd_py_meas_actl_qty) * 100) + '%',
            aloneBW: Math.round(d.ytd_cy_meas_actl_qty) - Math.round(d.ytd_py_meas_actl_qty)
        }
    })
    packageData.forEach((pkg) => {
        const products = productData.filter((prod) => prod.packageId === pkg.packageId)
        if (products.length) {
            pkg.lstBreakdownProduct = [...products]
            products.forEach((pd) => {
                pkg.totalCY += pd.aloneCY
                pkg.totalPY += pd.alonePY
            })
            pkg.totalBW = pkg.totalCY - pkg.totalPY
            pkg.totalPercentage = pkg.totalPY === 0 ? 'NA' : Math.round((pkg.totalCY / pkg.totalPY) * 100) + '%'
        }
    })
    return packageData
}

const MAX_PERIOD_IN_YEAR = 13
const MAX_WEEK_IN_YEAR = 53

export const getPeriodsWeeksRanges = () => {
    // split 13 periods into 4 arrays, [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12, 13]]
    const periodsRange = _.chunk(_.range(1, MAX_PERIOD_IN_YEAR), 3)
    periodsRange[3].push(MAX_PERIOD_IN_YEAR)
    // split 53 weeks into 13 arrays, [[1, 2, 3, 4], [5, 6, 7, 8], ... , [49, 50, 51, 52, 53]]
    const weeksRange = _.chunk(_.range(1, MAX_WEEK_IN_YEAR), 4)
    weeksRange[12].push(MAX_WEEK_IN_YEAR)
    return { periodsRange, weeksRange }
}
export const getCurrentQuarter = (periodsRange: number[][], currentPeriod: number) => {
    let currentQuarter = 0
    periodsRange.forEach((periodsItem: number[], index: number) => {
        const findPeriod = periodsItem.find((periodNum) => periodNum === currentPeriod)
        if (findPeriod) {
            currentQuarter = index + 1
        }
    })
    return currentQuarter
}

const getTargetPeriodValue = (periodData: any, targetFiled: string, filterFSCL: string) => {
    let targetPeriod = null
    periodData.forEach((item: any) => {
        const periodItem = item._PeriodInYearValue || []
        const arrFSCL = periodItem.filter((itemFSCL: any) => {
            const stringFSCL = itemFSCL[targetFiled] || ''
            return stringFSCL.indexOf(filterFSCL) > -1
        })
        if (_.size(arrFSCL) > 0) {
            targetPeriod = arrFSCL[0]
        }
    })
    return targetPeriod?._DetailsBySalesCode || []
}

const getAllCDTH = (detailsData: any, isRevenue = false, isCDAndTH = false) => {
    const volYTDDenominators = isCDAndTH
        ? detailsData.filter(
              (detailItem: any) =>
                  detailItem.SLST_CDTH_CD.indexOf('Take Home') > -1 ||
                  detailItem.SLST_CDTH_CD.indexOf('Cold Drink') > -1
          )
        : detailsData.filter((detailItem: any) => detailItem.SLST_CDTH_CD.indexOf('ALL_CDTH') > -1)
    if (isRevenue) {
        return _.sum(
            volYTDDenominators.map((v: any) => {
                return v?._RevenueAmounts?.CY_NET_REV_AMT
            })
        )
    }
    return _.sum(
        volYTDDenominators.map((v: any) => {
            return v?._Quantity?.CY_VOL_CS_QTY
        })
    )
}

const dealWithVolYTDData = (
    dataModel: any,
    percentageNumerators: any[],
    percentageDenominator: any,
    pyData: any[],
    isRevenue = false,
    cdAndThNumerator = 0
) => {
    const bcVolYTD = _.cloneDeep(dataModel)
    const percentageNumerator = isRevenue
        ? _.sum(
              percentageNumerators.map((v: any) => {
                  return v?._RevenueAmounts?.CY_NET_REV_AMT
              })
          )
        : _.sum(
              percentageNumerators.map((v: any) => {
                  return v?._Quantity?.CY_VOL_CS_QTY
              })
          )
    const pySum = isRevenue
        ? _.sum(
              pyData.map((v: any) => {
                  return v?._RevenueAmounts?.PY_NET_REV_AMT
              })
          )
        : _.sum(
              pyData.map((v: any) => {
                  return v?._Quantity?.PY_VOL_CS_QTY
              })
          )
    const numeratorRes = cdAndThNumerator > 0 ? cdAndThNumerator : percentageNumerator
    if (isRevenue) {
        bcVolYTD.percentage =
            percentageDenominator === 0 ? '0%' : Math.round((numeratorRes / percentageDenominator) * 100) + '%'
        bcVolYTD.sumIndex = pySum === 0 ? '0%' : Math.round((percentageNumerator / pySum) * 100) + '%'
        bcVolYTD.cy = percentageNumerator
        bcVolYTD.py = pySum
        bcVolYTD.indexBlack = Number(percentageNumerator) >= Number(pySum)
    } else {
        const roundDenominator = percentageDenominator ? Math.round(percentageDenominator) : 0
        const roundCy = percentageNumerator ? Math.round(percentageNumerator) : 0
        const roundPy = pySum ? Math.round(pySum) : 0
        const roundNumeratorRes = numeratorRes ? Math.round(numeratorRes) : 0
        bcVolYTD.percentage =
            roundDenominator === 0 ? '0%' : Math.round((roundNumeratorRes / roundDenominator) * 100) + '%'
        bcVolYTD.cy = roundCy
        bcVolYTD.py = roundPy
        bcVolYTD.sumIndex = roundPy === 0 ? '0%' : Math.round((roundCy / roundPy) * 100) + '%'
        bcVolYTD.indexBlack = Number(roundCy) >= Number(roundPy)
    }
    return bcVolYTD
}
const getPyDataWithFilter = (weekDetails: any[], filedName: string, filterString: string) => {
    let targetDetails: any[] = []
    weekDetails.forEach((weekItem) => {
        const filterData = weekItem.filter((itemSLST: any) => {
            const stringSLST = itemSLST[filedName] || ''
            return stringSLST.indexOf(filterString) > -1
        })
        if (_.size(filterData) > 0) {
            targetDetails = [...targetDetails, ...filterData]
        }
    })
    return targetDetails
}

const dealWithRow1Data = (
    dataModel: any,
    detailsData: any,
    filterString: string,
    percentageDenominator: any,
    weekDetails: any[],
    isRevenue = false,
    isCDAndTH = false
) => {
    let cdAndThNumerator = 0
    if (isCDAndTH) {
        const cdAndThNumerators = detailsData.filter(
            (detailItem: any) =>
                (detailItem.SLST_CDTH_CD.indexOf('Take Home') > -1 ||
                    detailItem.SLST_CDTH_CD.indexOf('Cold Drink') > -1) &&
                detailItem.SLST_PROD_CHNL_NM.indexOf(filterString) > -1
        )
        cdAndThNumerator = isRevenue
            ? _.sum(
                  cdAndThNumerators.map((v: any) => {
                      return v?._RevenueAmounts?.CY_NET_REV_AMT
                  })
              )
            : _.sum(
                  cdAndThNumerators.map((v: any) => {
                      return v?._Quantity?.CY_VOL_CS_QTY
                  })
              )
    }
    const percentageNumerators = detailsData.filter(
        (detailItem: any) => detailItem.SLST_PROD_CHNL_NM.indexOf(filterString) > -1
    )
    const pyData = getPyDataWithFilter(weekDetails, 'SLST_PROD_CHNL_NM', filterString)
    return dealWithVolYTDData(
        dataModel,
        percentageNumerators,
        percentageDenominator,
        pyData,
        isRevenue,
        cdAndThNumerator
    )
}

const dealWithRow2Data = (
    dataModel: any,
    detailsData: any,
    filterString: string,
    percentageDenominator: any,
    weekDetails: any[],
    isRevenue = false
) => {
    const percentageNumerators = detailsData.filter(
        (detailItem: any) => detailItem.SLST_CDTH_CD.indexOf(filterString) > -1
    )
    const pyData = getPyDataWithFilter(weekDetails, 'SLST_CDTH_CD', filterString)
    return dealWithVolYTDData(dataModel, percentageNumerators, percentageDenominator, pyData, isRevenue)
}

const getDataModelWithTitle = (titleStr = '') => {
    return { title: titleStr, percentage: '', cy: 0, py: 0, sumIndex: '', indexBlack: false }
}

const getVolumeData = (
    periodData: any,
    targetFiled: string,
    filterPeriod: string,
    weekDetails: any[],
    isRevenue = false,
    isCDAndTH = false
) => {
    const bcVolYTD = getDataModelWithTitle('B&C')
    const founVolYTD = getDataModelWithTitle('Fountain')
    const fsvVolYTD = getDataModelWithTitle('FSV')
    const tkVolYTD = getDataModelWithTitle('Take Home')
    const cdVolYTD = getDataModelWithTitle('Cold Drink')
    const detailVolYTD = getTargetPeriodValue(periodData, targetFiled, filterPeriod)
    const volYTDDenominator = getAllCDTH(detailVolYTD, isRevenue, isCDAndTH)
    const bcVolYTDData = dealWithRow1Data(
        bcVolYTD,
        detailVolYTD,
        'Base B&C',
        volYTDDenominator,
        weekDetails,
        isRevenue,
        isCDAndTH
    )
    const founVolYTDData = dealWithRow1Data(
        founVolYTD,
        detailVolYTD,
        'FOUNTAIN',
        volYTDDenominator,
        weekDetails,
        isRevenue,
        isCDAndTH
    )
    const fsvVolYTDData = dealWithRow1Data(
        fsvVolYTD,
        detailVolYTD,
        'FSV',
        volYTDDenominator,
        weekDetails,
        isRevenue,
        isCDAndTH
    )
    const tkVolYTDData = dealWithRow2Data(
        tkVolYTD,
        detailVolYTD,
        'Take Home',
        volYTDDenominator,
        weekDetails,
        isRevenue
    )
    const cdVolYTDData = dealWithRow2Data(
        cdVolYTD,
        detailVolYTD,
        'Cold Drink',
        volYTDDenominator,
        weekDetails,
        isRevenue
    )
    return [
        [bcVolYTDData, founVolYTDData, fsvVolYTDData],
        [tkVolYTDData, cdVolYTDData]
    ]
}
const getWeeksDataForQuarterOrPeriod = (periodData: any, currentPeriod: number, gapType: string) => {
    const { periodsRange, weeksRange } = getPeriodsWeeksRanges()
    const currentQuarter = getCurrentQuarter(periodsRange, currentPeriod)
    let startPeriod = currentPeriod
    if (gapType.indexOf('QTD') > -1) {
        startPeriod = periodsRange[currentQuarter - 1][0]
    }
    let startWeek = weeksRange[startPeriod - 1][0]
    if (gapType.indexOf('YTD') > -1) {
        startWeek = 1
    }
    const endWeek = moment().week()
    let targetWeeks: any[] = []
    periodData.forEach((item: any) => {
        const periodItem = item._PeriodInYearValue || []
        const filterWeeks = periodItem.filter((itemFSCL: any) => {
            const weekNum = Number(itemFSCL.TMPRD_IN_YR_NUM || '0')
            return weekNum >= startWeek && weekNum < endWeek && itemFSCL.TMPRD_TYP_IN_YR_VAL.indexOf('Week') > -1
        })
        if (_.size(filterWeeks) > 0) {
            targetWeeks = filterWeeks
        }
    })
    return targetWeeks.map((weekItem) => {
        return weekItem?._DetailsBySalesCode || []
    })
}

export const formatProductMixData = (numeratorData: any, currentPeriod: number) => {
    let periodData = []
    if (_.size(numeratorData) > 0) {
        const currentY = moment().year()
        periodData =
            _.find(numeratorData, (v) => {
                return v.FSCL_YR_NUM === currentY
            })._PeriodType || []
    }
    const { periodsRange } = getPeriodsWeeksRanges()
    const currentQuarter = getCurrentQuarter(periodsRange, currentPeriod)
    const weekDetailsYTD = getWeeksDataForQuarterOrPeriod(periodData, currentPeriod, 'YTD')
    const weekDetailsQTD = getWeeksDataForQuarterOrPeriod(periodData, currentPeriod, 'QTD')
    const weekDetailsPTD = getWeeksDataForQuarterOrPeriod(periodData, currentPeriod, 'PTD')
    return {
        'Volume YTD': getVolumeData(periodData, 'FSCL_YR_TMPRD_VAL', '-YR1', weekDetailsYTD),
        'Volume QTD': getVolumeData(
            periodData,
            'TMPRD_TYP_IN_YR_VAL',
            `Quarter ${currentQuarter}`,
            weekDetailsQTD,
            false,
            true
        ),
        'Volume PTD': getVolumeData(
            periodData,
            'TMPRD_TYP_IN_YR_VAL',
            `Period ${currentPeriod}`,
            weekDetailsPTD,
            false,
            true
        ),
        'Revenue YTD': getVolumeData(periodData, 'FSCL_YR_TMPRD_VAL', '-YR1', weekDetailsYTD, true),
        'Revenue QTD': getVolumeData(
            periodData,
            'TMPRD_TYP_IN_YR_VAL',
            `Quarter ${currentQuarter}`,
            weekDetailsQTD,
            true,
            true
        ),
        'Revenue PTD': getVolumeData(
            periodData,
            'TMPRD_TYP_IN_YR_VAL',
            `Period ${currentPeriod}`,
            weekDetailsPTD,
            true,
            true
        )
    }
}

const calculateSalesPerformanceNodeData = (sumData: Array<any>, isPrevious = false, isRevenue = false) => {
    return _.sum(
        sumData.map((v: any) => {
            if (isPrevious) {
                return isRevenue ? v?._RevenueAmounts?.PY_NET_REV_AMT : v?._Quantity?.PY_VOL_CS_QTY
            }
            return isRevenue ? v?._RevenueAmounts?.CY_NET_REV_AMT : v?._Quantity?.CY_VOL_CS_QTY
        })
    )
}

const calculateSalesPerformanceCategoryData = (
    categoryData: Array<any>,
    category: string,
    currentPeriod: number,
    isPrevious = false,
    isRevenue = false
) => {
    const totalData: number[] = []
    const { periodsRange, weeksRange } = getPeriodsWeeksRanges()
    const currentQuarter = getCurrentQuarter(periodsRange, currentPeriod)
    let filterIndexes = _.range(1, 5)
    if (category === 'Period') {
        filterIndexes = periodsRange[currentQuarter - 1]
    }
    if (category === 'Week') {
        filterIndexes = weeksRange[currentPeriod > 0 ? currentPeriod - 1 : 0]
    }
    if (categoryData?.length) {
        categoryData.forEach((item: any) => {
            const index = parseInt(item?.TMPRD_IN_YR_NUM || 0, 10)
            if (filterIndexes.includes(index)) {
                totalData[index - filterIndexes[0]] = _.round(
                    calculateSalesPerformanceNodeData(item?._DetailsBySalesCode || [], isPrevious, isRevenue),
                    isRevenue ? 2 : 0
                )
            }
        })
    }
    return totalData
}

const getSalesPerformanceCategoryData = (allData: Array<any>, category: string) => {
    return _.find(allData, (item) => item?.TMPRD_TYP_CDV === category)?._PeriodInYearValue
}

const getSalesPerformanceData = (
    allData: Array<any>,
    category: string,
    currentPeriod: number,
    isPrevious = false,
    isRevenue = false
) => {
    const categoryData = getSalesPerformanceCategoryData(allData, category) || []
    return calculateSalesPerformanceCategoryData(categoryData, category, currentPeriod, isPrevious, isRevenue)
}

export const formatSalesPerformanceData = (data: any, currentPeriod: number) => {
    const currentY = moment().year()
    let allData: any[] = []
    if (_.isArray(data) && data?.length) {
        allData = _.find(data, (v) => v?.FSCL_YR_NUM === currentY)?._PeriodType || []
    }
    return {
        VOLUME_YTD: {
            cy: getSalesPerformanceData(allData, 'Quarter', currentPeriod, false, false),
            py: getSalesPerformanceData(allData, 'Quarter', currentPeriod, true, false)
        },
        VOLUME_QTD: {
            cy: getSalesPerformanceData(allData, 'Period', currentPeriod, false, false),
            py: getSalesPerformanceData(allData, 'Period', currentPeriod, true, false)
        },
        VOLUME_PTD: {
            cy: getSalesPerformanceData(allData, 'Week', currentPeriod, false, false),
            py: getSalesPerformanceData(allData, 'Week', currentPeriod, true, false)
        },
        REVENUE_YTD: {
            cy: getSalesPerformanceData(allData, 'Quarter', currentPeriod, false, true),
            py: getSalesPerformanceData(allData, 'Quarter', currentPeriod, true, true)
        },
        REVENUE_QTD: {
            cy: getSalesPerformanceData(allData, 'Period', currentPeriod, false, true),
            py: getSalesPerformanceData(allData, 'Period', currentPeriod, true, true)
        },
        REVENUE_PTD: {
            cy: getSalesPerformanceData(allData, 'Week', currentPeriod, false, true),
            py: getSalesPerformanceData(allData, 'Week', currentPeriod, true, true)
        }
    }
}

const getPDPDataModelWithTitle = (titleString: string, percentageDenominator: number, cyNum: number, pyNum: number) => {
    return {
        title: titleString,
        percentage:
            Math.round(percentageDenominator) === 0
                ? '0%'
                : Math.round((Math.round(cyNum) / Math.round(percentageDenominator)) * 100) + '%',
        cy: Math.round(cyNum),
        py: Math.round(pyNum),
        sumIndex: Math.round(pyNum) === 0 ? '0%' : Math.round((Math.round(cyNum) / Math.round(pyNum)) * 100) + '%',
        indexBlack: cyNum >= pyNum
    }
}

export const formatPDPData = (revenueTrends: any) => {
    return {
        DSD: [
            [
                getPDPDataModelWithTitle(
                    'B&C',
                    revenueTrends?.DSD_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_BNC_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_BNC_YTD_VOL_PY_QTY || 0
                ),
                getPDPDataModelWithTitle(
                    'Fountain',
                    revenueTrends?.DSD_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_FTN_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_FTN_YTD_VOL_PY_QTY || 0
                ),
                getPDPDataModelWithTitle(
                    'FSV',
                    revenueTrends?.DSD_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_FSV_YTD_VOL_QTY || 0,
                    revenueTrends?.DSD_FSV_YTD_VOL_PY_QTY || 0
                )
            ]
        ],
        PDP: [
            [
                getPDPDataModelWithTitle(
                    'B&C',
                    revenueTrends?.PDP_YTD_VOL_QTY || 0,
                    revenueTrends?.PDP_BNC_YTD_VOL_QTY || 0,
                    revenueTrends?.PDP_BNC_YTD_VOL_PY_QTY || 0
                ),
                getPDPDataModelWithTitle(
                    'Fountain',
                    revenueTrends?.PDP_YTD_VOL_QTY || 0,
                    revenueTrends?.PDP_FTN_YTD_VOL_QTY || 0,
                    revenueTrends?.PDP_FTN_YTD_PY_QTY || 0
                ),
                getPDPDataModelWithTitle('FSV', 0, 0, 0)
            ]
        ],
        ICEE: [
            [
                getPDPDataModelWithTitle('B&C', 0, 0, 0),
                getPDPDataModelWithTitle(
                    'Fountain',
                    revenueTrends?.ICEE_YTD_VOL_QTY || 0,
                    revenueTrends?.ICEE_YTD_VOL_QTY || 0,
                    revenueTrends?.ICEE_VOL_YTD_PY_QTY || 0
                ),
                getPDPDataModelWithTitle('FSV', 0, 0, 0)
            ]
        ]
    }
}
