import { MyVisitTab } from '../enum/MyVisitTab'
import { t } from '../../common/i18n/t'
export const useTabs = () => {
    return [
        {
            name: t.labels.PBNA_MOBILE_MY_VISIT.toUpperCase(),
            value: MyVisitTab.MY_VISIT,
            dot: false
        },
        {
            name: t.labels.PBNA_MOBILE_POS.toUpperCase(),
            value: MyVisitTab.POS,
            dot: false
        }
        // these tabs are hidden for now, will be used in future
        // {
        //     name: t.labels.PBNA_MOBILE_SALES_SNAPSHOT.toUpperCase(),
        //     value: MyVisitTab.SALES_SNAPSHOT,
        //     dot: false
        // },
        // {
        //     name: t.labels.PBNA_MOBILE_MY_STORE.toUpperCase(),
        //     value: MyVisitTab.MY_STORE,
        //     dot: false
        // },
        // {
        //     name: t.labels.PBNA_MOBILE_ACTIVITIES.toUpperCase(),
        //     value: MyVisitTab.ACTIVITIES,
        //     dot: false
        // },
        // {
        //     name: t.labels.PBNA_MOBILE_EQUIPMENT.toUpperCase(),
        //     value: MyVisitTab.EQUIPMENT,
        //     dot: false
        // },
        // {
        //     name: t.labels.PBNA_MOBILE_CONTACTS.toUpperCase(),
        //     value: MyVisitTab.CONTACTS,
        //     dot: false
        // },
        // {
        //     name: t.labels.PBNA_MOBILE_PROFILE.toUpperCase(),
        //     value: MyVisitTab.PROFILE,
        //     dot: false
        // }
    ]
}
