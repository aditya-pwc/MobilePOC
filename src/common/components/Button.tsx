import _ from 'lodash'
import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

interface ButtonDebouncedProps extends TouchableOpacityProps {
    wait: number
}
/**
 * Button Debounced, will trigger instantly, will ignore onPress for a wait period
 */
export const ButtonDebounced: React.FC<ButtonDebouncedProps> = ({ wait, onPress, children, ...props }) => (
    <TouchableOpacity {...props} onPress={onPress && _.throttle(onPress, wait, { trailing: false })}>
        {children}
    </TouchableOpacity>
)

export const ButtonDebounced2000: React.FC<TouchableOpacityProps> = (props) => (
    <ButtonDebounced {...props} wait={2000} />
)
export const ButtonDebounced1000: React.FC<TouchableOpacityProps> = (props) => (
    <ButtonDebounced {...props} wait={1000} />
)
export const ButtonDebounced500: React.FC<TouchableOpacityProps> = (props) => <ButtonDebounced {...props} wait={500} />
export const DebouncedButton = ButtonDebounced1000
