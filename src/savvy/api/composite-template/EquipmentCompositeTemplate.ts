import { getAllFieldsByObjName } from '../../utils/SyncUtils'

export const getEquipmentAssetCompositeGroup = (id: string) => {
    return [
        {
            method: 'GET',
            q: `SELECT ${getAllFieldsByObjName(
                'Asset'
            ).join()} FROM Asset WHERE AccountId='${id}' AND IsDeleted=false  ORDER BY Name`,
            referenceId: 'refAssets',
            name: 'Asset'
        }
    ]
}
