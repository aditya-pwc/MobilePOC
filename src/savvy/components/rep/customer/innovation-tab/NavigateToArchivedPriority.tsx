import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef } from 'react'

interface NavigateToArchivedPriorityProps {
    isRedirect: number
    retailStore: any
    accessToken: string
    updateCarousel: Function
    setReturnFromDetail: Function
    onClickExecute: Function
    activeTab: string
}

export const NavigateToArchivedPriority: React.FC<NavigateToArchivedPriorityProps> = ({
    isRedirect,
    retailStore,
    accessToken,
    updateCarousel,
    setReturnFromDetail,
    onClickExecute,
    activeTab
}) => {
    const navigation = useNavigation()
    enum RedirectStatus {
        Initial,
        InProgress
    }
    const status = useRef<RedirectStatus>()
    status.current = RedirectStatus.Initial

    useEffect(() => {
        const navigate = async () => {
            if (isRedirect) {
                if (status.current === RedirectStatus.Initial) {
                    status.current = RedirectStatus.InProgress

                    setReturnFromDetail(false)
                    const navigateArgs = [
                        'InnovationProductArchiveDetail',
                        {
                            retailStore: retailStore,
                            accessToken: accessToken,
                            updateCarousel: updateCarousel,
                            setReturnFromDetail: setReturnFromDetail,
                            onClickExecute: onClickExecute,
                            tab: activeTab
                        }
                    ] as never
                    navigation.navigate(...navigateArgs)

                    status.current = RedirectStatus.Initial
                }
            }
        }

        navigate()
    }, [isRedirect])

    return null
}
