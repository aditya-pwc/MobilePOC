/**
 * @description Global Dropdown
 * @author Shangmin Dou
 * @date 2021-04-17
 */
import React, { useRef, useContext, useMemo } from 'react'
import DropdownAlert from 'react-native-dropdownalert'
import { ImageSrc } from '../enums/ImageSrc'

interface DropDownContextType {
    dropDownRef: React.RefObject<DropdownAlert>
}

const DropDownContext = React.createContext<DropDownContextType | null>(null)

interface DropDownComponentProviderProps {
    children?: React.ReactNode
}

export const DropDownComponentProvider = (props: DropDownComponentProviderProps) => {
    const { children } = props
    const dropDownRef = useRef<any>()

    const value: DropDownContextType = useMemo(() => {
        return {
            dropDownRef
        }
    }, [dropDownRef])
    return (
        <DropDownContext.Provider value={value}>
            {children}
            <DropdownAlert
                ref={dropDownRef}
                closeInterval={5000}
                successColor={'#6C0CC3'}
                successImageSrc={ImageSrc.ICON_CHECK_FLOWER}
                messageNumOfLines={10}
                showCancel
            />
        </DropDownContext.Provider>
    )
}

export const useDropDown = (): DropDownContextType => useContext(DropDownContext) as DropDownContextType
