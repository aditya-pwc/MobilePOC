import SfHttpClient from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/SfHttpClient'
import SfOauthEngine from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/SfOauthEngine'
import SfSoupEngine from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupEngine'
import SfSyncEngine from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/SfSyncEngine'
import { UserAccount } from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/Interface'

export const BaseInstance = {
    sfOauthEngine: {} as SfOauthEngine,
    userAccount: {} as UserAccount,
    sfHttpClient: {} as SfHttpClient,
    sfSoupEngine: {} as SfSoupEngine,
    sfSyncEngine: {} as SfSyncEngine
}

export default BaseInstance
