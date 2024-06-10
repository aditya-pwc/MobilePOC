/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-11-15 08:18:32
 * @LastEditTime: 2022-02-15 00:35:50
 * @LastEditors: Mary Qian
 */
import { repLabels } from './RepLabels'
import { merchandiserLabel } from './MerchandiserLabel'
import { managerLabel } from './ManagerLabel'
import { DelSupLabel } from './DelSupLabel'
import { SDLLabel } from './SDLLabel'
import { BaseLabel } from './BaseLabel'
import { PSRLabel } from './PSRLabels'
import { MyDayLabels } from './MyDayLabels'
import { LocationListLabels } from './LocationListLabels'
import { ContractLabel } from './ContractLabel'
import { OrderadeLabels } from './OrderadeLabels'

export const allLabels = {
    ...BaseLabel.en_US,
    ...repLabels.en_US,
    ...merchandiserLabel.en_US,
    ...managerLabel.en_US,
    ...DelSupLabel.en_US,
    ...SDLLabel.en_US,
    ...PSRLabel.en_US,
    ...MyDayLabels.en_US,
    ...LocationListLabels.en_US,
    ...ContractLabel.en_US,
    ...OrderadeLabels.en_US
}
