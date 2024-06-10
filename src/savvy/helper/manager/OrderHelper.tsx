/**
 * @description Order related functions.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-11-29
 */

import _ from 'lodash'
import { restApexCommonCall } from '../../api/SyncUtils'
import { t } from '../../../common/i18n/t'

export const getApeOrderSummary = async (visitId: string, type: string) =>
    restApexCommonCall('getsumorder' + '/' + visitId + '&' + type, 'GET')

export const formatReturnsData = (value: any) => {
    if (_.isEmpty(value)) {
        return '-'
    }
    if (value.cs !== '-' || value.un !== '-') {
        return `${value.cs} ${t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()} ${
            value.un
        } ${t.labels.PBNA_MOBILE_ORDER_UN.toLowerCase()}`
    }
    return '0'
}
