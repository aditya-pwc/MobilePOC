import { syncUpObjOffline } from '../api/SyncUtils'
import { CommonParam } from '../../common/CommonParam'
import { Log } from '../../common/enums/Log'
import { SoupService } from '../service/SoupService'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

export const SyncHelper = () => {
    const condRegExMap = {
        APPLY_CURRENT_USER_ID: CommonParam.profileName === 'Frontline' ? "'" + CommonParam.userId + "'" : '',
        APPLY_TODAY_VISIT_IDS: "('" + CommonParam.todayVisits.map((visit) => visit.Id).join(',') + "')",
        APPLY_ACTIVE_STORES: "('" + CommonParam.uniqueStoreIds.join(',') + "')",
        APPLY_USER_CONDITION: " Profile.Name='Frontline' AND Id='" + CommonParam.userId + "'"
    }
    const buildCondition = (cond) => {
        const regEx = new RegExp(Object.keys(condRegExMap).join('|'), 'gi')
        cond = cond.replace(regEx, function (match) {
            return condRegExMap[match]
        })
        return cond
    }

    return {
        syncUp: (soupInfo) => {
            return new Promise((resolve, reject) => {
                const soup = CommonParam.objs.find((s) => s.soupName === soupInfo.soupName)
                if (soup && soup.fieldList && !soup.skipSync) {
                    const fieldList = soup.fieldList
                        .filter((field) => !field.skipSyncUp && !field.isLocal)
                        .map((field) => field.name)
                    SoupService.retrieveDataFromSoup(soup.soupName, {}, fieldList, null, [
                        ` WHERE {${soup.name}:__locally_updated__} IN ("1", "true", true, 1)
                             OR {${soup.name}:__locally_created__} IN ("1", "true", true, 1)
                             `
                    ])
                        .then((records) => {
                            resolve(syncUpObjOffline(soup.name, records))
                        })
                        .catch((err) => {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'SyncHelper',
                                `Sync up failed: ${ErrorUtils.error2String(err)}`
                            )
                            reject(err)
                        })
                } else {
                    reject('No Sync Items')
                }
            })
        },
        buildCondition: buildCondition
    }
}

export default SyncHelper
