import NetInfo from '@react-native-community/netinfo'

const MAX_RETRY = 3
const RETRY_INTERVAL = 500

export const checkNetworkConnection = async (retryCount = 0) => {
    const networkState = await NetInfo.fetch()
    if (networkState.isInternetReachable) {
        return networkState
    } else if (retryCount < MAX_RETRY) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL))
        return await checkNetworkConnection(retryCount + 1)
    }
    throw new Error('Network connection failed')
}
