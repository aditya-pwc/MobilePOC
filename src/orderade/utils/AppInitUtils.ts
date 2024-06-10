import SfOauthEngine from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/SfOauthEngine'
import { oauth, smartstore } from 'react-native-force'
import BaseInstance from '../../common/BaseInstance'
import SfHttpClient from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/SfHttpClient'
import SfSyncEngine from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/SfSyncEngine'
import SfSoupEngine from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupEngine'
import { ClientConfig } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/Interface'
import { NativeModules } from 'react-native'
import { CommonParam } from '../../common/CommonParam'

const { RefreshToken } = NativeModules

class AppInitUtils {
    public static initOauthEngine(): void {
        const sfOauthEngine = new SfOauthEngine(oauth, RefreshToken)
        BaseInstance.sfOauthEngine = sfOauthEngine
    }

    public static initBaseInstance() {
        const clientConfig: ClientConfig = {
            baseUrl: BaseInstance.userAccount.instanceUrl,
            apiVersion: 'v54.0',
            accessToken: BaseInstance.userAccount.accessToken,
            oauth: BaseInstance.sfOauthEngine.authenticate
        }
        const sfHttpClient = new SfHttpClient(clientConfig)
        const sfSoupEngine = new SfSoupEngine(
            {
                storeName: 'LocalStore',
                isGlobalStore: true
            },
            smartstore,
            CommonParam.objs
        )
        const sfSyncEngine = new SfSyncEngine(sfHttpClient, sfSoupEngine)
        BaseInstance.sfHttpClient = sfHttpClient
        BaseInstance.sfSoupEngine = sfSoupEngine
        BaseInstance.sfSyncEngine = sfSyncEngine
    }
}

export default AppInitUtils
