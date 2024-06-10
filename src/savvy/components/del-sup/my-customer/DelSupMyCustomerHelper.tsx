/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2021-12-03 03:58:53
 * @LastEditTime: 2021-12-03 06:20:31
 * @LastEditors: Yi Li
 */
import { SoupService } from '../../../service/SoupService'
import { formatString } from '../../../utils/CommonUtils'
import { CommonParam } from '../../../../common/CommonParam'
import DelMyCustomerQueries from '../../../queries/DelMyCustomerQueries'

export const queryTargetAccount = () => {
    return new Promise<any[]>((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'Account',
            {},
            DelMyCustomerQueries.getMyCustomers.f,
            formatString(DelMyCustomerQueries.getMyCustomers.q, [CommonParam.userLocationId])
        )
            .then((customerData: any) => {
                resolve(customerData)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
