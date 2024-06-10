/*
 * @Description:
 * @LastEditors: Yi Li
 */
import Realm from 'realm'
// Define your object model
export default class EquipmentImage extends Realm.Object<EquipmentImage> {
    Id: string
    LinkFilename: string
    SubtypeCode: string

    static schema = {
        name: 'EquipmentImage',
        properties: {
            Id: 'string',
            LinkFilename: 'string',
            SubtypeCode: 'string'
        },
        primaryKey: 'Id'
    }
}
