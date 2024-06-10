import React from 'react'
import { View, StyleSheet, Image } from 'react-native'
import CText from '../../../common/components/CText'
import VisitActionBlock from './VisitActionBlock'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { useRetailStore } from '../../hooks/VisitDetailHook'
// import {checkIfInFence} from '../../pages/MyDayScreen/MyVisitDetailViewModel'
import { RetailStoreModel } from '../../pages/MyDayScreen/MyVisitDetailViewModel'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { renderCDAStoreIcon } from '../../../savvy/components/rep/customer/CustomerListTile'
import StorePlaceholderSvg from '../../../../assets/image/Icon-store-placeholder.svg'

export const styles = StyleSheet.create({
    ...commonStyle,
    boxWithShadow: {
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        backgroundColor: 'white',
        elevation: 12,
        borderRadius: 6
    },
    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    boxContent_bcd: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    boxContentTextArea: {
        flex: 1,
        flexDirection: 'column'
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column',
        marginBottom: 6
    },
    rowCon: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        height: 40,
        backgroundColor: '#F2F4F7'
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start',
        fontFamily: 'Gotham'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start',
        fontFamily: 'Gotham'
    },
    location: {
        shadowColor: 'rgba(108, 12, 195, 0.8)',
        borderColor: 'rgba(108, 12, 195, 0.8)',
        borderWidth: 0,
        borderTopWidth: 0,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5
    },
    imageGroup: {
        marginRight: 15,
        position: 'relative',
        alignSelf: 'flex-start'
    },
    visitStatus: {
        height: 26,
        width: 26
    },
    addressUse: {
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Gotham'
    },
    complete: {
        backgroundColor: '#F2F4F7'
    },
    addressUseSub: {
        fontSize: 12,
        color: '#565656',
        marginTop: 0,
        fontFamily: 'Gotham'
    },
    timeText: {
        fontSize: 12,
        color: '#000',
        fontFamily: 'Gotham'
    },
    line: {
        color: baseStyle.color.titleGray,
        fontSize: 12
    },
    iconXXL: {
        width: 58,
        height: 58
    },
    checkWrap: {
        backgroundColor: baseStyle.color.white,
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13
    }
})

interface CustomerCardProps {
    visitId?: string
    storeId: string
    isCompletedVisit?: boolean
    isInProgressVisit?: boolean
    store?: any
}

// Geofence logic to be used in future
// interface GEOFenceIndicatorProps {
//     isInGeoFence: boolean;
//     status: string
// }
// Geofence logic to be used in future
// const GEOFenceIndicator = (props: GEOFenceIndicatorProps) => {
//     if (props.status === 'Complete') {
//         return <Image style={styles.indicator} source={require('../../image/icon_checkmark_circle.png')} />
//     } else if (['In Progress', 'inProgress'].includes(props.status)) {
//         return <Image style={styles.indicator} source={require('../../image/icon-location-current.png')} />
//     }
//     return null
// }

export const renderCenterInfo = (item: RetailStoreModel) => {
    const stateCode = () => {
        if (item.StateCode === undefined) {
            return item.State ? item.State : ''
        }
        return item.StateCode ? item.StateCode : ''
    }

    const cityStateZip = `${item.City ? item.City + ', ' : ''}${stateCode()}${
        item.PostalCode ? ' ' + item.PostalCode : ''
    } `
    return (
        <View style={[styles.boxContentTextArea]}>
            <View style={commonStyle.flexRowSpaceCenter}>
                <View style={styles.contentText}>
                    <CText numberOfLines={2} ellipsizeMode="tail" style={styles.itemTile}>
                        {item?.StoreName ? item?.StoreName : ''}
                    </CText>
                </View>
            </View>
            {!!item.CustUniqId && (
                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.font_12_700}>
                    {t.labels.PBNA_MOBILE_NUMBER_SIGN + item.CustUniqId}
                </CText>
            )}
            <View style={commonStyle.flexRowSpaceCenter}>
                <View style={styles.contentText}>
                    {!!item.Street && (
                        <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUse]}>
                            {item.Street ? item.Street + ',' : ''}
                        </CText>
                    )}
                    <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile, styles.addressUseSub]}>
                        {cityStateZip}
                    </CText>
                </View>
            </View>
        </View>
    )
}

export const renderGreenCheck = (bgColor?: string) => {
    return (
        <View style={[styles.checkWrap, { backgroundColor: bgColor || baseStyle.color.white }]}>
            <Image style={styles.visitStatus} source={ImageSrc.ICON_CHECKMARK_CIRCLE} />
        </View>
    )
}
export const renderStoreIcon = (cust: any, iconStyle: object, isListPage?: boolean) => {
    // Logic mainly used for my customer tab and overView map
    if (cust?.IsOTS === '1' || cust?.IsOTS === true) {
        if (isListPage) {
            return renderCDAStoreIcon('', iconStyle)
        }
        return renderCDAStoreIcon(cust?.CDAMedal || '', iconStyle)
    }
    // height and width has to be passed to svg directly, inside style won't work
    return <StorePlaceholderSvg {...iconStyle} style={iconStyle} />
}

const CustomerCard = (props: CustomerCardProps) => {
    const storeFromQuery = useRetailStore(props.storeId)
    const { isCompletedVisit, isInProgressVisit, store: storeFromProps } = props
    // Geofence logic to be used in future
    // const [isInGeoFence, setIsInGeoFence] = useState(false)

    // useEffect(() => {
    //     const event = NativeAppEventEmitter.addListener('WatchPosition', (cLocation) => {
    //         setIsInGeoFence(checkIfInFence(store, cLocation))
    //     })

    //     return () => {
    //         event.remove()
    //     }
    // }, [props.visitId])

    // to solve customer card glitchy, we use data from previous screen if possible
    const store = storeFromProps || storeFromQuery
    if (!store) {
        return null
    }

    return (
        <View style={styles.boxWithShadow}>
            <View style={[styles.boxContent_bcd]}>
                <View style={styles.imageGroup}>
                    {renderStoreIcon(store, styles.iconXXL)}
                    {isCompletedVisit && renderGreenCheck(baseStyle.color.white)}
                    {isInProgressVisit && <Image style={styles.checkWrap} source={ImageSrc.ICON_LOCATION_CURRENT} />}
                </View>
                {renderCenterInfo(store)}
                {<VisitActionBlock item={store} />}
            </View>
        </View>
    )
}

export default CustomerCard
