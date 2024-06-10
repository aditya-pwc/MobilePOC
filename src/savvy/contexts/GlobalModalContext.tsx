/**
 * @description Global Modal
 * @author Sheng Huang
 */
import React, { useRef, useContext } from 'react'
import GlobalModal from '../../common/components/GlobalModal'

const GlobalModalContext = React.createContext(null)

interface GlobalModalComponentProviderProps {
    children?: any
}

export const GlobalModalComponentProvider = (props: GlobalModalComponentProviderProps) => {
    const { children } = props
    const globalModalRef = useRef()
    return (
        <GlobalModalContext.Provider
            value={{
                globalModalRef
            }}
        >
            {children}
            <GlobalModal ref={globalModalRef} />
        </GlobalModalContext.Provider>
    )
}

export const useGlobalModal: any = () => useContext(GlobalModalContext)
