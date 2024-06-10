/*
 * @Description:
 * @LastEditors: Yi Li
 */
/**
 * @description Display Equipment Image
 * @author  Kiren Cao
 * @date 2023-08-15
 */
import React from 'react'
import { CommonApi } from '../../../../../common/api/CommonApi'
import FastImage from 'react-native-fast-image'
import { Image } from 'react-native'
import { getEquipmentImgSrc, styles } from '../../../../utils/EquipmentUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import { useAppSelector } from '../../../../redux/ReduxHooks'

interface EquipmentImageDisplayProps {
    subtypeCde: string
    imageStyle?: any
    filedPath?: string
    equipTypeDesc?: string
}

const EquipmentImageDisplay: React.FC<EquipmentImageDisplayProps> = ({
    subtypeCde,
    imageStyle,
    filedPath = CommonApi.PBNA_MOBILE_SHAREPOINT_EQ_SUBTYPE_URL,
    equipTypeDesc
}) => {
    const imageLocalMap = useAppSelector((state) => state.customerReducer.equipmentSharePointReducer.equipmentImageMap)
    const imageLocal = subtypeCde ? imageLocalMap[subtypeCde] : ''

    if (imageLocal) {
        const imageName = imageLocal?.LinkFilename + '' || ''
        const fullUrl = CommonApi.PBNA_MOBILE_SHAREPOINT_DRIVES_BASE_URL + '/' + filedPath
        const prefix = fullUrl.replace('{ImageName}', imageName)

        return (
            <FastImage
                source={{
                    uri: prefix,
                    headers: { Authorization: `Bearer ${CommonParam.equipmentSharePointToken}` },
                    cache: FastImage.cacheControl.web
                }}
                style={imageStyle || styles.equipmentImageStyle}
                resizeMode={'contain'}
            />
        )
    }

    return <Image source={getEquipmentImgSrc(equipTypeDesc)} style={imageStyle || styles.equipmentImageStyle} />
}

export default EquipmentImageDisplay
