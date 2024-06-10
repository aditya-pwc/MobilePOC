import BaseInstance from '../../common/BaseInstance'
import { SoupModel } from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupInterface'

export const SoupService = {
    upsertDataIntoSoup: (soupName: string, records, setAttr = true, fromSync?: boolean) => {
        return BaseInstance.sfSoupEngine.upsert(soupName, records, setAttr, fromSync)
    },
    upsertDataIntoSoupWithExternalId: (soupName: string, records, setAttr = true, fromSync?: boolean) => {
        return BaseInstance.sfSoupEngine.upsertWithExternalId(soupName, records, setAttr, fromSync)
    },
    retrieveDataFromSoup: (soupName: string, options, fieldList, smartSql?, condition?) => {
        return BaseInstance.sfSoupEngine.retrieve(soupName, fieldList, smartSql, condition, options, false, false)
    },
    updateDataWithPartialParamsIntoSoupWithQuery: (
        soupName: string,
        query: string,
        params: any,
        setAttr = true,
        fromSync?
    ) => {
        return BaseInstance.sfSoupEngine.upsert(soupName, [params], setAttr, fromSync, true)
    },
    removeDataFromSoup: async (soupName: string) => {
        return BaseInstance.sfSoupEngine.remove(soupName)
    },
    removeRecordFromSoup: (soupName: string, soupIds: string[]) => {
        return BaseInstance.sfSoupEngine.removeRecords(soupName, soupIds)
    },
    removeStore: () => {
        return BaseInstance.sfSoupEngine.removeStore()
    },
    clearSoup: (soupName: string) => {
        return BaseInstance.sfSoupEngine.clearDataSoup(soupName)
    },
    alterSoup: (model: SoupModel) => {
        return BaseInstance.sfSoupEngine.alterSoupModel(model)
    },
    alterSoups: (models: SoupModel[]) => {
        return BaseInstance.sfSoupEngine.alterAllSoupModel(models)
    },
    checkSoupExist: (name: string) => {
        return BaseInstance.sfSoupEngine.checkSoup(name)
    },
    getAllStores: () => {
        return BaseInstance.sfSoupEngine.getAllStores()
    },
    getAllGlobalStores: () => {
        return BaseInstance.sfSoupEngine.getAllStores(true)
    }
}
