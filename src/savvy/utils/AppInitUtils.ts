import SfOauthEngine from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/SfOauthEngine'
import { oauth, smartstore } from 'react-native-force'
import BaseInstance from '../../common/BaseInstance'
import SfHttpClient from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/SfHttpClient'
import { ClientConfig } from 'common-mobile-lib/@common-mobile-lib/sf-http-client/src/Interface'
import { NativeModules } from 'react-native'
import SfSyncEngine from 'common-mobile-lib/@common-mobile-lib/sf-sync-engine/src/SfSyncEngine'
import SfSoupEngine from 'common-mobile-lib/@common-mobile-lib/sf-soup-engine/src/SfSoupEngine'
import { CommonParam } from '../../common/CommonParam'
import { oauthCallback, refreshTokenCallback } from './SessionUtils'

const { RefreshToken } = NativeModules

class AppInitUtils {
    public static initOauthEngine(): void {
        BaseInstance.sfOauthEngine = new SfOauthEngine(oauth, RefreshToken)
    }

    public static initBaseInstance() {
        const clientConfig: ClientConfig = {
            baseUrl: BaseInstance.userAccount.instanceUrl,
            apiVersion: 'v54.0',
            accessToken: BaseInstance.userAccount.accessToken,
            oauth: BaseInstance.sfOauthEngine,
            refreshToken: RefreshToken,
            oauthCallback: oauthCallback,
            refreshTokenCallback: refreshTokenCallback
        }
        BaseInstance.sfHttpClient = new SfHttpClient(clientConfig)
    }

    public static initSoupAndSync() {
        const storeConfig = {
            storeName: 'LocalStore',
            isGlobalStore: true
        }
        const sfSoupEngine = new SfSoupEngine(storeConfig, smartstore, CommonParam.objs)
        const sfSyncEngine = new SfSyncEngine(BaseInstance.sfHttpClient, sfSoupEngine)
        BaseInstance.sfSoupEngine = sfSoupEngine
        BaseInstance.sfSyncEngine = sfSyncEngine
    }
}

export default AppInitUtils
