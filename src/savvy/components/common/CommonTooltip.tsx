/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2021-10-15 03:54:54
 * @LastEditTime: 2021-10-20 22:42:47
 * @LastEditors: Mary Qian
 */
import React, { FC, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Tooltip } from 'react-native-elements'

const styles = StyleSheet.create({
    tooltipContainer: {
        borderRadius: 8
    }
})

interface CommonTooltipProps {
    tooltip: any
    children: any
    width: any
    height: any
    cRef?: any
}

const CommonTooltip: FC<CommonTooltipProps> = (props: CommonTooltipProps) => {
    const { tooltip, children, width, height, cRef } = props
    const toolTipRef = useRef<any>(null)

    useImperativeHandle(cRef, () => ({
        toggleTooltip: () => {
            toolTipRef?.current?.toggleTooltip()
        }
    }))

    // @ts-ignore
    return (
        <Tooltip
            ref={toolTipRef}
            popover={tooltip}
            width={width}
            height={height}
            backgroundColor="white"
            withOverlay
            overlayColor="#00000011"
            containerStyle={[styles.tooltipContainer]}
        >
            {children}
        </Tooltip>
    )
}

export default CommonTooltip
