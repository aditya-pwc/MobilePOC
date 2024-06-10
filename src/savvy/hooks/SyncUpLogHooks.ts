/**
 * @description Hooks for sync up logs
 * @author Dashun Fu
 * @date 2023-05-10
 */

import { useEffect } from 'react'
import { syncUpLogs } from '../utils/LogUtils'

export const useSyncUpLogs = () => {
    useEffect(() => {
        const interval = setInterval(async () => {
            await syncUpLogs()
        }, 60000)
        return () => {
            clearInterval(interval)
        }
    }, [])
}
