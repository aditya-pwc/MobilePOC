import { CommonParam } from '../../common/CommonParam'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearDatabase } from '../utils/InitUtils'
import { RefObject } from 'react'
import { CopilotScreenBaseHandle } from '../../common/components/buz/copilot-base/CopilotScreenBase'
import { NavigationProp } from '@react-navigation/native'
import { t } from '../../common/i18n/t'
import { isCopilotInternetReachable } from '../../orderade/utils/VisitUtils'
import { formatWithTimeZone } from '../utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../common/enums/TimeFormat'
import { appendLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import { isPersonaPSR } from '../../common/enums/Persona'

export const useSyncPressHandler = (
    navigation: NavigationProp<any>,
    copilotScreenBaseRef: RefObject<CopilotScreenBaseHandle>
) => {
    return async () => {
        const isNetInfoOK = await isCopilotInternetReachable(t.labels.PBNA_MOBILE_OFFLINE_SYNC)
        if (!isNetInfoOK) {
            return
        }
        copilotScreenBaseRef.current?.hideSidePanel()
        CommonParam.isFirstTimeUser = true
        const removeArr = isPersonaPSR()
            ? ['isSyncSuccessfully', 'lastSyncDependentIds', 'PlanogramLocal']
            : ['isSyncSuccessfully', 'configLastSyncTime', 'lastSyncDependentIds', 'PlanogramLocal']
        await AsyncStorage.multiRemove(removeArr)
        const logMsg = `User click on resync at ${formatWithTimeZone(moment(), TIME_FORMAT.YMDTHMS, true, true)}`
        appendLog(Log.MOBILE_INFO, 'orderade:pbna sync', logMsg)
        await clearDatabase(false, false, true)
        navigation.navigate('LandingSavvy')
    }
}
