/*
 * @Description: UGM utils
 * @Author: Hao Xiao
 * @Date: 2022-07-01
 */
import _ from 'lodash'
import { promiseQueue } from '../api/InitSyncUtils'
import { buildSyncDownObjPromise } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import UGMConfig from '../config/UGMConfig'
import SyncService, { buildManagerSyncDownQuery, condRegExMapMM } from '../service/SyncService'
import CustomLabelUtils from './CustomLabelUtils'
import { getDAMAccessToken, switchATCEntrance } from './InnovationProductUtils'
import { AssetAttributeService } from '../service/AssetAttributeService'

export const getInitQuery = () => {
    const objs = _.cloneDeep(CommonParam.objs.filter((model) => model.initQuery))
    const newQuery = objs.map((obj) => {
        if (obj.initQuery) {
            const regExpMap = condRegExMapMM()
            obj.initQuery = buildManagerSyncDownQuery(obj.initQuery, regExpMap)
        }
        return { name: obj.name, q: obj.initQuery }
    })
    return newQuery.filter((r) => r.q)
}

export const initUGM = async (setProgress?) => {
    const newQuery = getInitQuery()
    const reqArr = newQuery.map((m) => {
        return buildSyncDownObjPromise(m.name, m.q)
    })
    const allReq = [
        ...reqArr,
        async () => CustomLabelUtils.getInnovationProductLabel(),
        async () => getDAMAccessToken(),
        async () => await AssetAttributeService.syncAssetAttribute(),
        async () => await switchATCEntrance()
    ]
    await promiseQueue(allReq, setProgress)
    await SyncService.syncDownObjWithCond(UGMConfig.objs.find((soup) => soup.name === 'Visit_List__c'))
}
