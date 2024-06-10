/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2024-01-18 16:05:40
 * @LastEditTime: 2024-01-26 15:45:06
 * @LastEditors: Mary Qian
 */
export interface GeoFenceProps {
    retailStore: any
    salesPin: any
    salesGeoFence: Array<any>
    deliveryPin: any
    deliveryGeoFence: Array<any>
}

export const DefaultGeoFence = {
    retailStore: {},
    salesPin: {},
    salesGeoFence: [],
    deliveryPin: {},
    deliveryGeoFence: []
}
