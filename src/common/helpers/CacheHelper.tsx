import * as RNFS from 'react-native-fs'
import { storeClassLog } from '../utils/LogUtils'
import { Log } from '../enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { blobToBase64 } from '../../savvy/utils/CommonUtils'

interface CacheSourceBase {
    id: string
    uri: string
    cb?: () => void
}
export interface CacheSource extends CacheSourceBase {
    config?: any
}

export interface CacheSourceBackend extends CacheSourceBase {
    headers?: any
}

interface CacheSourceWithRetryCount extends CacheSource {
    retryTime: number
}

AbortSignal.timeout ??= function timeout(ms) {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), ms)
    return ctrl.signal
}
interface CacheManagerOptions {
    serviceName: string
    maximumDownloader?: number
    retryTime?: number
}

const instancePool: { [key in string]: CacheManager } = {}

abstract class Singleton {
    static getInstance() {
        return Singleton
    }
}

export const cachedFilesMap: Map<string, true> = new Map()

class Subscriber<T> {
    private subscribePool: { [key: number]: Function } = {}
    private poolIncreaseKey = 0
    protected pendingQueue: T[] = []

    public subscribeComplete(observer: Function) {
        if (this.pendingQueue.length === 0) {
            observer()
        }
        this.poolIncreaseKey = this.poolIncreaseKey + 1
        this.subscribePool[this.poolIncreaseKey] = observer
        return this.poolIncreaseKey
    }

    public unsubscribe(key: number) {
        delete this.subscribePool[key]
    }

    protected notifySubscribers(): void {
        for (const key of Object.keys(this.subscribePool) as unknown as number[]) {
            try {
                this.subscribePool[key]()
            } catch {}
        }
    }
}

export class CacheManager extends Subscriber<CacheSourceWithRetryCount> implements Singleton {
    // Use as folder name in Documents, should be unique for different service
    private readonly serviceName: string
    protected currentJobs: { [s: string]: boolean } = {}
    protected maximumDownloader: number
    protected retryTime: number
    protected downloading = false
    protected missions = 0

    constructor(option: CacheManagerOptions) {
        super()
        this.serviceName = option.serviceName
        this.maximumDownloader = option.maximumDownloader ?? 5
        this.retryTime = option.retryTime ?? 2
    }

    protected startDownload() {
        while (this.missions !== this.maximumDownloader && this.pendingQueue.length !== 0) {
            this.missions = this.missions + 1
            const s = this.pendingQueue.pop() as unknown as CacheSourceWithRetryCount
            this.currentJobs[s.id] = true
            fetch(s.uri, { ...s.config, signal: AbortSignal.timeout(20000) })
                .then(async (res) => {
                    if (!res.ok) {
                        Promise.reject(JSON.stringify(res))
                    }
                    const blob = await res.blob()
                    const b64 = await blobToBase64(blob)
                    if (b64) {
                        const withoutPrefix = b64.split(',')[1]
                        RNFS.writeFile(
                            RNFS.DocumentDirectoryPath + '/' + this.serviceName + '/' + s.id,
                            withoutPrefix,
                            'base64'
                        )
                    }
                    // Run CallBack
                    s.cb && s.cb()
                })
                .catch((err) => {
                    if (s.retryTime !== 0) {
                        s.retryTime = s.retryTime - 1
                        this.pendingQueue.unshift(s)
                    }
                    storeClassLog(Log.MOBILE_ERROR, this.serviceName + 'startDownload', ErrorUtils.error2String(err))
                })
                .finally(() => {
                    delete this.currentJobs[s.id]
                    this.missions = this.missions - 1
                    this.startDownload()
                })
            this.startDownload()
        }
        if (this.pendingQueue.length !== 0) {
            this.notifySubscribers()
        }
    }

    public preload(source: CacheSource[]) {
        ;(async () => {
            try {
                // Create service folder, won't create if exist
                await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/' + this.serviceName)
                for (const s of source) {
                    const fileExists = await RNFS.exists(
                        RNFS.DocumentDirectoryPath + '/' + this.serviceName + '/' + s.id
                    )
                    !fileExists && this.pendingQueue.unshift({ ...s, retryTime: this.retryTime })
                }
            } catch (error) {
                storeClassLog(Log.MOBILE_ERROR, this.serviceName + 'preload', ErrorUtils.error2String(error))
            }
            this.startDownload()
        })()
    }

    private jobPool: Promise<RNFS.DownloadResult>[] = []
    public async backgroundPreload(source: CacheSourceBackend[], checkDuplicate?: false, onDone?: Function) {
        // Future split to smaller tasks, for every 400
        try {
            // Create service folder, won't create if exist
            await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/' + this.serviceName)
            for (const s of source) {
                const fileExists =
                    checkDuplicate &&
                    (await RNFS.exists(RNFS.DocumentDirectoryPath + '/' + this.serviceName + '/' + s.id))
                if (!checkDuplicate || !fileExists) {
                    const { promise } = RNFS.downloadFile({
                        fromUrl: s.uri,
                        headers: s.headers,
                        toFile: RNFS.DocumentDirectoryPath + '/' + this.serviceName + '/' + s.id,
                        background: true
                    })
                    s.cb && promise.then(s.cb)
                    onDone && this.jobPool.push(promise)
                }
            }
            onDone && Promise.all(this.jobPool).finally(() => onDone())
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, this.serviceName + 'preload', ErrorUtils.error2String(error))
        }
    }

    static getInstance(option: CacheManagerOptions) {
        if (instancePool[option.serviceName]) {
            return instancePool[option.serviceName]
        }
        const newInstance = new CacheManager(option)
        instancePool[option.serviceName] = newInstance
        return newInstance
    }
}
