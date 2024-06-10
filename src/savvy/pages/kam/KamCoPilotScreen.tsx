import React, { FC, useRef } from 'react'
import { View } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import { useNavigation } from '@react-navigation/native'
import { useUserAvatarRefresh, useUserStatsId } from '../../hooks/UserHooks'
import { useQuickLinkData } from '../../hooks/CoPilotHooks'
import { CommonApi } from '../../../common/api/CommonApi'
import {
    CopilotScreenBase,
    CopilotScreenBaseHandle
} from '../../../common/components/buz/copilot-base/CopilotScreenBase'
import { logoutWithClearingDatabase } from '../../utils/SessionUtils'
import { useSidePanelOptions } from '../../hooks/SidePanelHooks'
import { useSyncPressHandler } from '../../hooks/SyncHooks'

interface KamCoPilotScreenProps {}

const KamCoPilotScreen: FC<KamCoPilotScreenProps> = () => {
    const navigation = useNavigation<any>()
    const userStatsId = useUserStatsId()
    const quickLinkData = useQuickLinkData()
    const copilotScreenBaseRef = useRef<CopilotScreenBaseHandle>(null)
    const sidePanelOptions = useSidePanelOptions(navigation, copilotScreenBaseRef)
    const onSyncPress = useSyncPressHandler(navigation, copilotScreenBaseRef)
    const refreshFlag = useUserAvatarRefresh()

    return (
        <CopilotScreenBase
            url={`${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${userStatsId}?${refreshFlag}`}
            firstName={CommonParam.userInfo.FirstName}
            lastName={CommonParam.userInfo.LastName}
            quickLinkData={quickLinkData}
            subTitle={<View />}
            sidePanelOptions={sidePanelOptions}
            onSyncPress={onSyncPress}
            dashboard={<View />}
            footList={<View />}
            extraItems={<View />}
            onLogoutPress={logoutWithClearingDatabase}
            cRef={copilotScreenBaseRef}
            sidePanelExtraItems={<View />}
            needRedDot
        />
    )
}

export default KamCoPilotScreen
