import React, { FC } from 'react'
import Draggable from 'react-native-draggable'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { getPortraitModeScreenWidthAndHeight } from '../../../common/utils/CommonUtils'

interface MapDraggableProps {
    setIsMapView: Function
    isMapView: boolean
}

export const portraitWidth = getPortraitModeScreenWidthAndHeight().width
export const portraitHeight = getPortraitModeScreenWidthAndHeight().height
export const floatIconSize = 56
export const floatPosition = 0.82

const MapDraggable: FC<MapDraggableProps> = (props: MapDraggableProps) => {
    const { setIsMapView, isMapView } = props
    return (
        <Draggable
            x={portraitWidth * floatPosition}
            y={portraitHeight * floatPosition}
            minX={0}
            minY={90}
            maxX={portraitWidth}
            maxY={portraitHeight - 15}
            renderSize={floatIconSize}
            isCircle
            imageSource={isMapView ? ImageSrc.IMG_ICON_LIST : ImageSrc.IMG_ICON_MAP}
            onShortPressRelease={() => {
                setIsMapView(!isMapView)
            }}
        />
    )
}

export default MapDraggable
