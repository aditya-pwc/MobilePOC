import React, { useEffect, useState } from 'react'
import { Image, StyleProp, ImageStyle } from 'react-native'
import { getImageFile } from '../../../../helper/rep/ImageFileHelper'

interface CommonOnlineImageProps {
    dataItemId: string
    apexAPI: string
    imageStyle?: StyleProp<ImageStyle>
    imageWidth?: number
    imageHeight?: number
}

const CommonOnlineImage: React.FC<CommonOnlineImageProps> = ({
    dataItemId,
    apexAPI,
    imageStyle,
    imageWidth = 60,
    imageHeight = 60
}) => {
    const [transformedURI, setTransformedURI] = useState<string>('')

    const getRemoteImageFile = async (id: string, api: string) => {
        const imageBase64String = await getImageFile(id, api)
        if (imageBase64String) {
            setTransformedURI(imageBase64String)
        }
    }

    useEffect(() => {
        if (dataItemId && apexAPI) {
            getRemoteImageFile(dataItemId, apexAPI)
        }
    }, [])

    return (
        <Image
            source={{
                uri: transformedURI,
                cache: 'force-cache'
            }}
            style={imageStyle}
            height={imageHeight}
            width={imageWidth}
        />
    )
}

export default CommonOnlineImage
