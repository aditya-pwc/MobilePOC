/*
 * @Description:
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */
/**
 * @description Hooks for pulling down to refresh the data.
 * @author Shangmin Dou
 */
import { useEffect, useState } from 'react'
import { processRepRefresh, RepPosition } from '../utils/refresh/RepRefreshUtils'
import { Log } from '../../common/enums/Log'
import { isPersonaUGMOrSDL } from '../../common/enums/Persona'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Dispatch, AnyAction } from '@reduxjs/toolkit'

export const useRepPullDownRefresh = (
    position: RepPosition,
    dispatch: Dispatch<AnyAction>,
    isFocused: boolean,
    syncObj?: object
) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isPullDownAction, setIsPullDownAction] = useState(false)
    useEffect(() => {
        if ((isLoading || isFocused) && !isPersonaUGMOrSDL()) {
            processRepRefresh(position, dispatch, isPullDownAction, syncObj)
                .then(() => {
                    setIsLoading(false)
                    setIsPullDownAction(false)
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'useRepPullDownRefresh',
                        'processRepRefresh: ' + ErrorUtils.error2String(e)
                    )
                    setIsLoading(false)
                    setIsPullDownAction(false)
                })
        }
    }, [isLoading, isFocused])
    return {
        isLoading,
        setIsLoading,
        isPullDownAction,
        setIsPullDownAction
    }
}
