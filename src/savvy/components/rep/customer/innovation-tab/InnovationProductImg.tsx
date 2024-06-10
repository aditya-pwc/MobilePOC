/*
 * @Description:
 * @LastEditors: Yi Li
 */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { CommonApi } from '../../../../../common/api/CommonApi'
import { CommonParam } from '../../../../../common/CommonParam'
import FastImage from 'react-native-fast-image'
import { isCelsiusPriority } from '../../../../utils/InnovationProductUtils'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { getImageFile } from '../../../../helper/rep/ImageFileHelper'

interface InnovationProductImgProps {
    item: any
    isSelling?: boolean
    accessToken?: any
    isDetail?: boolean
}

const styles = StyleSheet.create({
    prodImageSize: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 275,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    productImageContainer: {
        alignItems: 'center',
        width: '100%',
        height: 275
    },
    noDisplay: {
        width: 0,
        height: 0
    },
    productOmg: {
        width: 198,
        height: 198,
        borderRadius: 6
    },
    innovationImg: {
        justifyContent: 'center'
    },
    sellingImg: {
        height: 198,
        marginTop: 75,
        marginBottom: 15
    },
    detailPageImg: {
        alignSelf: 'center'
    }
})

const InnovationProductImg = (props: InnovationProductImgProps) => {
    const { item, isSelling, accessToken, isDetail } = props
    const urlImg = isSelling
        ? `${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_GET_PRODUCT_PHOTO}/${item.Id}`
        : item.carouseUrl
    const tokenStr = isSelling ? `Bearer ${CommonParam.accessToken}` : accessToken
    const [isDefault, setIsDefault] = useState(true)

    const [transformedURI, setTransformedURI] = useState<any>(null)

    const getPCMIImageFile = async (id: string) => {
        const imageBase64String = await getImageFile(id, CommonApi.PBNA_MOBILE_GET_PRODUCT_PHOTO)
        if (imageBase64String) {
            setIsDefault(false)
            setTransformedURI(imageBase64String)
        } else {
            setIsDefault(true)
        }
    }

    useEffect(() => {
        isSelling && getPCMIImageFile(item.Id)
    }, [item.Id])

    const renderImage = () => {
        if (isCelsiusPriority(item)) {
            return (
                <Image
                    style={[styles.productOmg, { top: 15 }]}
                    source={ImageSrc.CELSIUS_LOGO}
                    width={198}
                    height={198}
                    resizeMode="contain"
                />
            )
        }
        const sourceObj: any = isSelling
            ? {
                  uri: transformedURI,
                  cache: 'force-cache'
              }
            : {
                  uri: urlImg,
                  headers: {
                      Authorization: tokenStr,
                      accept: 'image/png'
                  },
                  cache: FastImage.cacheControl.web
              }
        if (urlImg) {
            return (
                <Image
                    source={sourceObj}
                    style={styles.productOmg}
                    height={198}
                    width={198}
                    onLoad={() => {
                        setIsDefault(false)
                    }}
                    onError={() => {
                        setIsDefault(true)
                    }}
                />
            )
        }

        return (
            <Image
                style={styles.prodImageSize}
                source={require('../../../../../../assets/image/No_Innovation_Product.png')}
            />
        )
    }

    return (
        <View
            style={[
                styles.productImageContainer,
                isDetail ? styles.detailPageImg : {},
                !isDefault && isSelling && !isDetail ? styles.sellingImg : styles.innovationImg
            ]}
        >
            {renderImage()}
            {isDefault && isSelling && !isCelsiusPriority(item) && (
                <Image
                    style={styles.prodImageSize}
                    source={require('../../../../../../assets/image/No_Innovation_Product.png')}
                />
            )}
        </View>
    )
}

export default InnovationProductImg
