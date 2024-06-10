/**
 * @description Select schedule component.
 * @author Xupeng Bao
 * @email xupeng.bao@pwc.com
 * @date 2021-05-17
 */
import { FunctionComponentElement } from 'react'
import { ImageStyle } from 'react-native'

export interface NavigationBarProps {
    left?: FunctionComponentElement<any>
    title?: string
    leftStyle?: Object
    right?: FunctionComponentElement<any>
    style?: Object
    rightStyle?: Object
}

export interface BackButtonProps {
    navigation?: any
    onBackPress?: any
    extraStyle?: ImageStyle
}

export interface SuccessInterface {
    id?: string
    errors?: Array<any>
    success: boolean
}
