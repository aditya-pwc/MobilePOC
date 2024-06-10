/**
 * @description Component to show web and social media section.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import DoorDash from '../../../../../assets/image/icon-doordash.svg'
import UberEats from '../../../../../assets/image/icon-ubereats.svg'
import Postmates from '../../../../../assets/image/icon-postmates.svg'
import Grubhub from '../../../../../assets/image/icon-grubhub.svg'
import { openLink } from '../../../../common/utils/LinkUtils'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import BaseSection from '../../common/BaseSection'
import Rating from '../../../../common/components/rating/Rating'
import _ from 'lodash'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    imageSplitter: {
        width: 3,
        height: 40,
        backgroundColor: '#D6D6D6',
        marginHorizontal: 15
    },
    imageSectionContainer: {
        paddingBottom: 15,
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
    },
    ratingContainer: {
        backgroundColor: 'black',
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    ratingText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
        marginRight: 10
    },
    textIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50
    },
    fontWeight_700: { fontWeight: '700' },
    lineStyle: {
        height: 1,
        width: '100%'
    }
})

interface CustomerWebSocialMediaProps {
    retailStore
    cRef?
}

const ImageSplitter = () => {
    return <View style={styles.imageSplitter} />
}

const CustomerWebSocialMedia = (props: CustomerWebSocialMediaProps) => {
    const { retailStore } = props

    const hasValue = (value) => {
        return value !== null && value !== '' && value !== undefined
    }

    const arrayToRenderHandler = () => {
        if (retailStore === undefined || retailStore === null) {
            return
        }
        const arrayToRender = []
        if (hasValue(retailStore.Website)) {
            arrayToRender.push(0)
        }
        if (hasValue(retailStore.ff_FACEBOOK__c)) {
            arrayToRender.push(1)
        }
        if (hasValue(retailStore.ff_FOURSQUARE__c)) {
            arrayToRender.push(2)
        }
        if (hasValue(retailStore.ff_YELP__c)) {
            arrayToRender.push(3)
        }
        if (hasValue(retailStore.FF_LINK__c)) {
            arrayToRender.push(4)
        }
        if (hasValue(retailStore.ff_DOORDASH__c)) {
            arrayToRender.push(5)
        }
        if (hasValue(retailStore.ff_UBEREATS__c)) {
            arrayToRender.push(6)
        }
        if (hasValue(retailStore.ff_POSTMATES__c)) {
            arrayToRender.push(7)
        }
        if (hasValue(retailStore.ff_GRUBHUB__c)) {
            arrayToRender.push(8)
        }
        if (hasValue(retailStore.User_Link_Label_1__c)) {
            arrayToRender.push(9)
        }
        if (hasValue(retailStore.User_Link_Label_2__c)) {
            arrayToRender.push(10)
        }
        if (hasValue(retailStore.User_Link_Label_3__c)) {
            arrayToRender.push(11)
        }
        if (arrayToRender.length === 0) {
            return
        }
        return arrayToRender
    }

    const renderIcon = (iconProps: { index; url; imageStyle?; imageSrc?; children? }) => {
        const { index, url, imageStyle, imageSrc, children } = iconProps
        return (
            <View style={commonStyle.flexRowAlignCenter} key={index}>
                <TouchableOpacity
                    onPress={async () => {
                        await openLink(url)
                    }}
                >
                    {imageSrc && <Image source={imageSrc} style={imageStyle} />}
                    {children}
                </TouchableOpacity>
            </View>
        )
    }

    const renderTextIcon = (index, url, Label) => {
        return (
            <View style={styles.textIconContainer} key={index}>
                <TouchableOpacity
                    onPress={async () => {
                        await openLink(url)
                    }}
                >
                    <CText style={styles.fontWeight_700}>{Label}</CText>
                </TouchableOpacity>
            </View>
        )
    }

    const renderSocialIcons = () => {
        const renderArray = arrayToRenderHandler()
        if (renderArray) {
            const arrayToRender = renderArray.join('yxy').split('y')
            return arrayToRender.map((item, index) => {
                const indexKey = index.toString()
                switch (item) {
                    case '0':
                        return renderIcon({
                            index: index,
                            url: retailStore.Website,
                            imageSrc: ImageSrc.ICON_WEB,
                            imageStyle: {
                                width: 40,
                                height: 40,
                                margin: 10
                            }
                        })
                    case '1':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_FACEBOOK__c,
                            imageSrc: ImageSrc.ICON_FACEBOOK,
                            imageStyle: {
                                width: 40,
                                height: 40,
                                margin: 10
                            }
                        })
                    case '2':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_FOURSQUARE__c,
                            imageSrc: ImageSrc.ICON_FOURSQUARE,
                            imageStyle: {
                                width: 50,
                                height: 50
                            }
                        })
                    case '3':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_YELP__c,
                            imageSrc: ImageSrc.ICON_YELP,
                            imageStyle: {
                                width: 50,
                                height: 50
                            }
                        })
                    case '4':
                        return renderIcon({
                            index: index,
                            url: retailStore.FF_LINK__c,
                            imageSrc: ImageSrc.ICON_FIREFLY,
                            imageStyle: {
                                width: 45,
                                height: 45
                            }
                        })
                    case '5':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_DOORDASH__c,
                            children: <DoorDash />
                        })
                    case '6':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_UBEREATS__c,
                            children: <UberEats />
                        })
                    case '7':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_POSTMATES__c,
                            children: <Postmates />
                        })
                    case '8':
                        return renderIcon({
                            index: index,
                            url: retailStore.ff_GRUBHUB__c,
                            children: <Grubhub width={120} height={45} />
                        })
                    case '9':
                        return renderTextIcon(index, retailStore.User_Link_1__c, retailStore.User_Link_Label_1__c)
                    case '10':
                        return renderTextIcon(index, retailStore.User_Link_2__c, retailStore.User_Link_Label_2__c)
                    case '11':
                        return renderTextIcon(index, retailStore.User_Link_3__c, retailStore.User_Link_Label_3__c)
                    default:
                        return <ImageSplitter key={indexKey} />
                }
            })
        }
    }

    return (
        <View>
            <BaseSection>
                <ScrollView
                    style={commonStyle.flexDirectionRow}
                    contentContainerStyle={[styles.imageSectionContainer]}
                    alwaysBounceVertical={false}
                    centerContent
                >
                    {renderSocialIcons()}
                </ScrollView>
            </BaseSection>
            <View style={styles.lineStyle} />
            {_.isNumber(retailStore.Rating__c) && (
                <View style={styles.ratingContainer}>
                    <CText style={styles.ratingText}>{t.labels.PBNA_MOBILE_CUSTOMER_YELP_RATING}</CText>
                    <Rating value={retailStore.Rating__c} />
                </View>
            )}
        </View>
    )
}

export default CustomerWebSocialMedia
