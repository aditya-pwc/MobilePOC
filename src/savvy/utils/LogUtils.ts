/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-09-13 21:28:09
 * @LastEditTime: 2023-04-20 11:08:36
 * @LastEditors: Mary Qian
 */
/**
 * @description Utils for handling logs.
 * @author Shangmin Dou
 * @date 2021-05-15
 */
import { SoupService } from '../service/SoupService'
import { syncUpObjCreate } from '../api/SyncUtils'

export const syncUpLogs = async () => {
    try {
        await syncUpObjCreate(
            'SDF_LGR_Log__c',
            ['Message__c', 'Level__c', 'Data__c', 'Class__c', 'Reference__c'],
            'SELECT {SDF_LGR_Log__c:Message__c},{SDF_LGR_Log__c:Level__c},' +
                '{SDF_LGR_Log__c:Data__c},{SDF_LGR_Log__c:Class__c},{SDF_LGR_Log__c:Reference__c} ' +
                'FROM {SDF_LGR_Log__c} LIMIT 199',
            false
        )
        await SoupService.clearSoup('SDF_LGR_Log__c')
    } catch (e) {}
}
