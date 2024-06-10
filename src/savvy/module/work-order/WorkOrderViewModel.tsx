/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-19 05:17:02
 * @LastEditTime: 2021-08-19 05:17:35
 * @LastEditors: Mary Qian
 */

import { WorkOrderStatus } from '../../enums/Visit'

const isWorkOrderCompleted = (workOrder: any) => workOrder.Status === WorkOrderStatus.COMPLETE

export { isWorkOrderCompleted }
