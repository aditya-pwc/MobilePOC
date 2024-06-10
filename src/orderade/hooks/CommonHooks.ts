/**
 * @description Common hooks.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-04-12
 */

import { useCallback, useEffect, useState, useRef, MutableRefObject } from 'react'

/**
 * @example
 * import { useInput } from './useInput'
 * const email = useInput('')
 <TextInput
 placeholder={'Email'}
 value={email.value}
 onChangeText={email.onChangeText}
 />
 OR
 <TextInput
 placeholder={'Email'}
 {...email}
 />
 */
export const useInput = (initValue: string) => {
    const [value, setValue] = useState(initValue)

    const handleChange = (text: string) => {
        setValue(text)
    }

    return {
        value,
        onChangeText: handleChange
    }
}

export const useAsyncEffect = <T, U extends any[]>(method: () => Promise<T>, deps: U) => {
    useEffect(() => {
        ;(async () => {
            await method()
        })()
    }, deps)
}

export const useDebounce = (fn: Function, delay: number, dep: Array<any> = []) => {
    useEffect(() => {
        const timer = setTimeout(fn, delay)
        return () => clearTimeout(timer)
    }, [...dep])
}

export const useSafeMemoryEffect = <T, U extends any[]>(method: () => T, deps: U) => {
    useEffect(() => {
        let isUnmounted = false
        if (isUnmounted) {
            return
        }
        method()
        return () => {
            isUnmounted = true
        }
    }, deps)
}

export const useThrottle = (fn: Function, delay: number, dep: any[] = []) => {
    let timer: any = null
    return useCallback(() => {
        if (!timer) {
            timer = setTimeout(() => {
                fn()
                timer = null
            }, delay)
        }
    }, [...dep])
}

export function useFreshRef<T>(value: T): MutableRefObject<T> {
    const useEffectToUse = useEffect
    const ref = useRef(value)
    useEffectToUse(() => {
        ref.current = value
    })
    return ref
}
