/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-08-16 01:40:50
 * @LastEditTime: 2021-10-21 21:29:25
 * @LastEditors: Mary Qian
 */
export interface Promotion {
    name: string
    startDate: string
    endDate: string
    package: any
}

export interface Package {
    pack: string
    price: number
    quantity: number
}
