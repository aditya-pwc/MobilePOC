import { promiseQueue } from '../api/InitSyncUtils'
import { buildSyncDownObjPromise } from '../api/SyncUtils'
import DelSupConfig from '../config/DelSupConfig'
import SyncService from '../service/SyncService'
import { generateSurveyData } from './SurveyUtils'
import { AssetAttributeService } from '../service/AssetAttributeService'
import { getInitQuery } from './UGMUtils'

export const initDelSup = async (setProgress?) => {
    const newQuery = getInitQuery()
    const reqs = newQuery.map((m) => {
        return buildSyncDownObjPromise(m.name, m.q)
    })
    const allReq = [
        ...reqs,
        async () => await AssetAttributeService.syncAssetAttribute(),
        async () => await generateSurveyData()
    ]
    await promiseQueue(allReq, setProgress)
    await SyncService.syncDownObjWithCond(DelSupConfig.objs.find((soup) => soup.name === 'Visit_List__c'))
}
