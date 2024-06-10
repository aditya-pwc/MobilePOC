import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { Log } from '../../../common/enums/Log'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { restApexCommonCall } from '../../api/SyncUtils'
import { getStringValue } from '../../utils/LandingUtils'
import { CommonApi } from '../../../common/api/CommonApi'

enum timeConfig {
    refreshInterval = 30 * 60 * 1000, // 30 min
    waitTime = 10 * 1000,
    timerRetryTime = 1000,
    timeIncreaseStep = 10 * 1000,
    maximumWaitTime = 60 * 1000
}

type TokenObserver = (token: string) => void
export const SharePointTokenManager = (function () {
    let currentWaitTime = timeConfig.waitTime
    let instance: ReturnType<typeof createInstance> | undefined // Singleton instance
    let cachedToken: string = ''
    let nextRefreshTime = 0 // Time Stamp 0
    let isFetching = false // Flag to track if token is being fetched
    let timerId: ReturnType<typeof setTimeout>
    let poolIncreaseKey = 0
    const waitingQueue: TokenObserver[] = [] // Queue to hold pending requests
    const subscribePool: { [k: number]: TokenObserver } = {} // Map to hold pending subscribe

    async function getRemoteToken() {
        // Simulate async token retrieval from remote
        return restApexCommonCall(CommonApi.PBNA_MOBILE_GET_SHAREPOINT_TOKEN_URL, 'GET')
            .then((res) => {
                const token = res.data?.token
                currentWaitTime = timeConfig.waitTime // reset to default
                nextRefreshTime = Date.now() + timeConfig.refreshInterval
                return token
            })
            .catch((e) => {
                // Error handling will use Old token and log error to backend
                storeClassLog(Log.MOBILE_ERROR, 'GET-SP-TOKEN', 'Fail to get sp token' + getStringValue(e))
                nextRefreshTime = currentWaitTime
                if (currentWaitTime < timeConfig.maximumWaitTime) {
                    currentWaitTime = currentWaitTime + timeConfig.timeIncreaseStep
                }
                return null
            })
    }

    function resolveWaitingQueue(token: string) {
        while (waitingQueue.length > 0) {
            const resolve = waitingQueue.shift()
            resolve && resolve(token)
        }
    }

    function startTokenRefreshTimer() {
        if (timerId) {
            return
        }
        if (isFetching) {
            timerId = setTimeout(startTokenRefreshTimer, timeConfig.timerRetryTime)
            return
        }
        const timeRemaining = nextRefreshTime - Date.now()
        timerId = setTimeout(async () => {
            // Complex Function
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            await getToken()
            startTokenRefreshTimer()
        }, timeRemaining)
    }
    function stopTokenRefreshTimer() {
        if (timerId) {
            return
        }
        if (isFetching) {
            setTimeout(stopTokenRefreshTimer, timeConfig.timerRetryTime)
            return
        }
        clearTimeout(timerId)
    }

    function subscribe(observer: TokenObserver) {
        poolIncreaseKey = poolIncreaseKey + 1
        subscribePool[poolIncreaseKey] = observer
        startTokenRefreshTimer()
        return poolIncreaseKey
    }
    function unsubscribe(key: number) {
        delete subscribePool[key]
        // Stop Token Refresh is no subscriber
        _.isEmpty(subscribePool) && stopTokenRefreshTimer()
    }
    function notifySubscribers(token: string): void {
        for (const key of Object.keys(subscribePool) as unknown as number[]) {
            try {
                subscribePool[key](token)
            } catch {
                unsubscribe(key)
            }
        }
    }

    async function getToken() {
        if (cachedToken && nextRefreshTime > Date.now()) {
            return cachedToken
        }

        if (isFetching) {
            // If token is being fetched, wait in queue
            return new Promise<string>((resolve) => {
                waitingQueue.push(resolve)
            })
        }

        isFetching = true

        try {
            // Error handling will use Old token and log error to backend
            const remoteToken = (await getRemoteToken()) as string
            if (remoteToken) {
                cachedToken = remoteToken
                notifySubscribers(cachedToken)
                resolveWaitingQueue(cachedToken)
            }
            return cachedToken
        } finally {
            isFetching = false
        }
    }

    function createInstance() {
        return {
            getToken,
            subscribe,
            unsubscribe
        }
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance()
            }
            return instance
        }
    }
})()

/**
 * This hook will return an empty '' on first render
 * When using <Pdf /> make sure to add {token && <Pdf />}
 */
export const useSharePointToken = (subscribe = false) => {
    const [token, setToken] = useState('')

    useEffect(() => {
        let subscriberId: number
        const tokenManager = SharePointTokenManager.getInstance()
        tokenManager.getToken().then(setToken)
        if (subscribe) {
            subscriberId = tokenManager.subscribe(setToken)
        }
        return () => {
            subscriberId && tokenManager.unsubscribe(subscriberId)
        }
    }, [])

    return token
}

/**
 * This hoc will pass an empty '' token to wrapped component on first render
 * When using <Pdf /> make sure to add {token && <Pdf />}
 */
export const WithSharePointToken = <P extends { token: string }>(WrappedComponent: React.ComponentType<P>) => {
    const token = useSharePointToken(true)
    const WithWrappedComponent = (hocProps: Omit<P, 'token'>) => {
        return <WrappedComponent {...(hocProps as P)} token={token} />
    }
    return WithWrappedComponent
}
