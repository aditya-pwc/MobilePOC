/**
 * @description Component to show web and social media section.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import BaseSection from '../../../common/BaseSection'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import WebSocialMediaEditModal from './WebSocialMediaEditModal'
import store from '../../../../redux/store/Store'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import Rating from '../../../../../common/components/rating/Rating'
import { LeadStatus } from '../../../../enums/Lead'
import { openLink } from '../../../../../common/utils/LinkUtils'
import DoorDash from '../../../../../../assets/image/icon-doordash.svg'
import UberEats from '../../../../../../assets/image/icon-ubereats.svg'
import Postmates from '../../../../../../assets/image/icon-postmates.svg'
import Grubhub from '../../../../../../assets/image/icon-grubhub.svg'
import { t } from '../../../../../common/i18n/t'
import { recordWebSocialMediaMetrics } from '../../../../utils/AppDynamicUtils'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

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
    textIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50
    },
    iconText: {
        fontWeight: '700'
    },
    mediaCont: {
        height: 1,
        width: '100%'
    },
    addNewImg: {
        width: 40,
        height: 40
    }
})

const ImageSplitter = () => {
    return <View style={styles.imageSplitter} />
}

const WebSocialMedia = (props: LeadDetailBaseProps) => {
    const { l, cRef } = props
    const dispatch = useDispatch()
    const [webSocialMedia, setWebSocialMedia] = useState({
        Website__c: l.Website__c,
        ff_FACEBOOK_c__c: l.ff_FACEBOOK_c__c,
        ff_FOURSQUARE_c__c: l.ff_FOURSQUARE_c__c,
        ff_YELP_c__c: l.ff_YELP_c__c,
        FF_LINK_c__c: l.FF_LINK_c__c,
        YELP_HOT_AND_NEW_c__c: l.YELP_HOT_AND_NEW_c__c,
        Rating_c__c: l.Rating_c__c,
        ff_UBEREATS_c__c: l.ff_UBEREATS_c__c,
        ff_POSTMATES_c__c: l.ff_POSTMATES_c__c,
        ff_GRUBHUB_c__c: l.ff_GRUBHUB_c__c,
        ff_DOORDASH_c__c: l.ff_DOORDASH_c__c,
        User_Link_Label_1_c__c: l.User_Link_Label_1_c__c,
        User_Link_1_c__c: l.User_Link_1_c__c,
        User_Link_Label_2_c__c: l.User_Link_Label_2_c__c,
        User_Link_2_c__c: l.User_Link_2_c__c,
        User_Link_Label_3_c__c: l.User_Link_Label_3_c__c,
        User_Link_3_c__c: l.User_Link_3_c__c
    })

    const initState = () => {
        if (
            l.Status__c === LeadStatus.OPEN ||
            l.Status__c === LeadStatus.NO_SALE ||
            l.Status__c === LeadStatus.BUSINESS_WON
        ) {
            setWebSocialMedia({
                Website__c: l.Website__c,
                ff_FACEBOOK_c__c: l.ff_FACEBOOK_c__c,
                ff_FOURSQUARE_c__c: l.ff_FOURSQUARE_c__c,
                ff_YELP_c__c: l.ff_YELP_c__c,
                FF_LINK_c__c: l.FF_LINK_c__c,
                YELP_HOT_AND_NEW_c__c: l.YELP_HOT_AND_NEW_c__c,
                Rating_c__c: l.Rating_c__c,
                ff_UBEREATS_c__c: l.ff_UBEREATS_c__c,
                ff_POSTMATES_c__c: l.ff_POSTMATES_c__c,
                ff_GRUBHUB_c__c: l.ff_GRUBHUB_c__c,
                ff_DOORDASH_c__c: l.ff_DOORDASH_c__c,
                User_Link_Label_1_c__c: l.User_Link_Label_1_c__c,
                User_Link_1_c__c: l.User_Link_1_c__c,
                User_Link_Label_2_c__c: l.User_Link_Label_2_c__c,
                User_Link_2_c__c: l.User_Link_2_c__c,
                User_Link_Label_3_c__c: l.User_Link_Label_3_c__c,
                User_Link_3_c__c: l.User_Link_3_c__c
            })
        } else if (l.Status__c === LeadStatus.NEGOTIATE) {
            const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
            setWebSocialMedia({
                Website__c: tempLead.Website__c,
                ff_FACEBOOK_c__c: tempLead.ff_FACEBOOK_c__c,
                ff_FOURSQUARE_c__c: tempLead.ff_FOURSQUARE_c__c,
                ff_YELP_c__c: tempLead.ff_YELP_c__c,
                FF_LINK_c__c: tempLead.FF_LINK_c__c,
                YELP_HOT_AND_NEW_c__c: tempLead.YELP_HOT_AND_NEW_c__c,
                Rating_c__c: tempLead.Rating_c__c,
                ff_UBEREATS_c__c: tempLead.ff_UBEREATS_c__c,
                ff_POSTMATES_c__c: tempLead.ff_POSTMATES_c__c,
                ff_GRUBHUB_c__c: tempLead.ff_GRUBHUB_c__c,
                ff_DOORDASH_c__c: tempLead.ff_DOORDASH_c__c,
                User_Link_Label_1_c__c: tempLead.User_Link_Label_1_c__c,
                User_Link_1_c__c: tempLead.User_Link_1_c__c,
                User_Link_Label_2_c__c: tempLead.User_Link_Label_2_c__c,
                User_Link_2_c__c: tempLead.User_Link_2_c__c,
                User_Link_Label_3_c__c: tempLead.User_Link_Label_3_c__c,
                User_Link_3_c__c: tempLead.User_Link_3_c__c
            })
        }
    }

    const resetData = () => {
        const originData = {
            Website__c: l.Website__c,
            ff_FACEBOOK_c__c: l.ff_FACEBOOK_c__c,
            ff_FOURSQUARE_c__c: l.ff_FOURSQUARE_c__c,
            ff_YELP_c__c: l.ff_YELP_c__c,
            FF_LINK_c__c: l.FF_LINK_c__c,
            YELP_HOT_AND_NEW_c__c: l.YELP_HOT_AND_NEW_c__c,
            Rating_c__c: l.Rating_c__c,
            webSocialMediaEditCount: 0,
            ff_UBEREATS_c__c: l.ff_UBEREATS_c__c,
            ff_POSTMATES_c__c: l.ff_POSTMATES_c__c,
            ff_GRUBHUB_c__c: l.ff_GRUBHUB_c__c,
            ff_DOORDASH_c__c: l.ff_DOORDASH_c__c,
            User_Link_Label_1_c__c: l.User_Link_Label_1_c__c,
            User_Link_1_c__c: l.User_Link_1_c__c,
            User_Link_Label_2_c__c: l.User_Link_Label_2_c__c,
            User_Link_2_c__c: l.User_Link_2_c__c,
            User_Link_Label_3_c__c: l.User_Link_Label_3_c__c,
            User_Link_3_c__c: l.User_Link_3_c__c
        }
        dispatch(updateTempLeadAction(originData))
    }

    useImperativeHandle(cRef, () => ({
        resetData
    }))

    const hasValue = (value) => {
        return value !== null && value !== ''
    }

    const arrayToRenderHandler = () => {
        if (webSocialMedia === undefined || webSocialMedia === null) {
            return
        }
        const arrayToRender = []
        if (hasValue(webSocialMedia.Website__c)) {
            arrayToRender.push(0)
        }
        if (hasValue(webSocialMedia.ff_FACEBOOK_c__c)) {
            arrayToRender.push(1)
        }
        if (hasValue(webSocialMedia.ff_FOURSQUARE_c__c)) {
            arrayToRender.push(2)
        }
        if (hasValue(webSocialMedia.ff_YELP_c__c)) {
            arrayToRender.push(3)
        }
        if (hasValue(webSocialMedia.FF_LINK_c__c)) {
            arrayToRender.push(4)
        }
        if (hasValue(webSocialMedia.ff_DOORDASH_c__c)) {
            arrayToRender.push(5)
        }
        if (hasValue(webSocialMedia.ff_UBEREATS_c__c)) {
            arrayToRender.push(6)
        }
        if (hasValue(webSocialMedia.ff_POSTMATES_c__c)) {
            arrayToRender.push(7)
        }
        if (hasValue(webSocialMedia.ff_GRUBHUB_c__c)) {
            arrayToRender.push(8)
        }
        if (hasValue(webSocialMedia.User_Link_Label_1_c__c)) {
            arrayToRender.push(9)
        }
        if (hasValue(webSocialMedia.User_Link_Label_2_c__c)) {
            arrayToRender.push(10)
        }
        if (hasValue(webSocialMedia.User_Link_Label_3_c__c)) {
            arrayToRender.push(11)
        }
        if (arrayToRender.length === 0) {
            return
        }
        return arrayToRender
    }

    useEffect(() => {
        initState()
        if (l.Status__c === LeadStatus.NEGOTIATE) {
            return store.subscribe(() => {
                initState()
            })
        }
    }, [l])

    const renderIcon = (iconProps: { index; url; item; imageStyle?; imageSrc?; children? }) => {
        const { index, url, imageStyle, imageSrc, children, item } = iconProps
        return (
            <View style={commonStyle.flexRowAlignCenter} key={index}>
                <TouchableOpacity
                    onPress={async () => {
                        await openLink(url)
                        recordWebSocialMediaMetrics(item)
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
            <View style={styles.textIcon} key={index}>
                <TouchableOpacity
                    onPress={async () => {
                        await openLink(url)
                    }}
                >
                    <CText style={styles.iconText}>{Label}</CText>
                </TouchableOpacity>
            </View>
        )
    }

    const renderImageSplitter = (item, index) => {
        return <ImageSplitter key={item + index} />
    }

    const renderSocialIcons = () => {
        const renderArray = arrayToRenderHandler()
        if (renderArray) {
            const arrayToRender = renderArray.join('yxy').split('y')
            return arrayToRender.map((item, index) => {
                switch (item) {
                    case '0':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.Website__c,
                            imageSrc: ImageSrc.ICON_WEB,
                            item,
                            imageStyle: {
                                width: 40,
                                height: 40,
                                margin: 10
                            }
                        })
                    case '1':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_FACEBOOK_c__c,
                            imageSrc: ImageSrc.ICON_FACEBOOK,
                            item,
                            imageStyle: {
                                width: 40,
                                height: 40,
                                margin: 10
                            }
                        })
                    case '2':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_FOURSQUARE_c__c,
                            imageSrc: ImageSrc.ICON_FOURSQUARE,
                            item,
                            imageStyle: {
                                width: 50,
                                height: 50
                            }
                        })
                    case '3':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_YELP_c__c,
                            imageSrc: ImageSrc.ICON_YELP,
                            item,
                            imageStyle: {
                                width: 50,
                                height: 50
                            }
                        })
                    case '4':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.FF_LINK_c__c,
                            imageSrc: ImageSrc.ICON_FIREFLY,
                            item,
                            imageStyle: {
                                width: 45,
                                height: 45
                            }
                        })
                    case '5':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_DOORDASH_c__c,
                            item,
                            children: <DoorDash />
                        })
                    case '6':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_UBEREATS_c__c,
                            item,
                            children: <UberEats />
                        })
                    case '7':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_POSTMATES_c__c,
                            item,
                            children: <Postmates />
                        })
                    case '8':
                        return renderIcon({
                            index: index,
                            url: webSocialMedia.ff_GRUBHUB_c__c,
                            item,
                            children: <Grubhub width={120} height={45} />
                        })
                    case '9':
                        return renderTextIcon(
                            index,
                            webSocialMedia.User_Link_1_c__c,
                            webSocialMedia.User_Link_Label_1_c__c
                        )
                    case '10':
                        return renderTextIcon(
                            index,
                            webSocialMedia.User_Link_2_c__c,
                            webSocialMedia.User_Link_Label_2_c__c
                        )
                    case '11':
                        return renderTextIcon(
                            index,
                            webSocialMedia.User_Link_3_c__c,
                            webSocialMedia.User_Link_Label_3_c__c
                        )
                    default:
                        return renderImageSplitter(item, index)
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
            <View style={styles.mediaCont} />
            {webSocialMedia !== undefined && webSocialMedia.Rating_c__c !== null && (
                <View style={styles.ratingContainer}>
                    {webSocialMedia.YELP_HOT_AND_NEW_c__c === '1' && (
                        <Image source={ImageSrc.HOT_AND_NEW} style={styles.addNewImg} />
                    )}
                    <CText style={styles.ratingText}>{t.labels.PBNA_MOBILE_CUSTOMER_YELP_RATING}</CText>
                    <Rating value={l.Rating_c__c} />
                </View>
            )}
            <WebSocialMediaEditModal l={l} />
        </View>
    )
}

export default WebSocialMedia
