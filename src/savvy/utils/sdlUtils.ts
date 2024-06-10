/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-01-17 00:04:18
 * @LastEditTime: 2022-02-16 04:06:13
 * @LastEditors: Mary Qian
 */
import { promiseQueue } from '../api/InitSyncUtils'
import { buildSyncDownObjPromise } from '../api/SyncUtils'
import SDLConfig from '../config/SDLConfig'
import SyncService from '../service/SyncService'
import CustomLabelUtils from './CustomLabelUtils'
import { getDAMAccessToken, switchATCEntrance, clearTotalSalesDocuments } from './InnovationProductUtils'
import { generateSurveyData } from './SurveyUtils'
import { getInitQuery } from './UGMUtils'

export const initSDL = async (setProgress?) => {
    const newQuery = getInitQuery().filter((soup) => soup.name !== 'Visit_List__c')
    const reqArr = newQuery.map((m) => {
        return buildSyncDownObjPromise(m.name, m.q)
    })
    const allReq = [
        ...reqArr,
        async () => await CustomLabelUtils.getInnovationProductLabel(),
        async () => await getDAMAccessToken(),
        async () => await SyncService.syncDownObjWithCond(SDLConfig.objs.find((soup) => soup.name === 'Visit_List__c')),
        async () => await switchATCEntrance(),
        async () => await generateSurveyData(),
        async () => await clearTotalSalesDocuments()
    ]
    await promiseQueue(allReq, setProgress)
}
