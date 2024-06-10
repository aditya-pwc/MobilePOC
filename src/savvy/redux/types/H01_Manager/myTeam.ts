/**
 * @description MerchManager reducer
 * @author Xupeng Bao
 * @date 2021-05-24
 */
import { TabIndex } from './data-tabIndex'
import { UserType } from './data-userType'

export interface MyTeamDataProps {
    myTeamIndex: number
    myTeamType: string
    myTeamSearchText: string
}

export const initMyTeamData: MyTeamDataProps = {
    myTeamIndex: TabIndex.TabIndex_Merch,
    myTeamType: UserType.UserType_Merch,
    myTeamSearchText: ''
}
