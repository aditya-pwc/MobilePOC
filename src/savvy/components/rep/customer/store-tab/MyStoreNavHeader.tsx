/**
 * @description store navigate header component.
 * @author Jiaxiang Wang
 * @date 2023-12-30
 */
import React, { FC, useEffect, useState } from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CText from '../../../../../common/components/CText'
import IMG_STORE_PLACEHOLDER from '../../../../../../assets/image/Icon-store-placeholder.svg'
import { t } from '../../../../../common/i18n/t'
import BackButton from '../../../common/BackButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RetailStoreModel } from '../../../../../orderade/pages/MyDayScreen/MyVisitDetailViewModel'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { renderCDAStoreIcon } from '../CustomerListTile'
import VisitService from '../../../../../orderade/service/VisitService'

interface MyStoreNavHeaderProps {
    storeId: string
    onLeftButtonClick?: Function
    onRightButtonClick?: Function
    showRightButton?: boolean
    rightButtonImgSrc?: ImageSrc
}

const styles = StyleSheet.create({
    imgUserImage: {
        width: 38,
        height: 38,
        borderRadius: 19
    },
    fontWeight_800: {
        fontWeight: '800'
    },
    fontWeight_600: {
        fontWeight: '600'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    fontSize_18: {
        fontSize: 18
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_lightGary: {
        color: '#D3D3D3'
    },
    paddingTop_10: {
        paddingTop: 10
    },
    marginTop_6: {
        marginTop: 6
    },
    marginTop_3: {
        marginTop: 1
    },
    marginRight_20: {
        marginRight: 20
    },
    container: {
        height: 150,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#F2F4F7'
    },
    itemContentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        marginLeft: 15,
        marginRight: 5
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    errIcon: {
        position: 'absolute',
        right: -0.5,
        bottom: -0.5
    },
    iconSize: {
        width: 12,
        height: 12,
        resizeMode: 'contain'
    },
    backButtonIcon: {
        width: 36,
        height: 36
    }
})

export const renderAddressContent = (store: RetailStoreModel) => {
    const stateCode = () => {
        if (store.StateCode === undefined) {
            return store.State ? store.State : ''
        }
        return store.StateCode ? store.StateCode : ''
    }

    const cityStateZip = `${store.City ? store.City + ', ' : ''}${stateCode()}${
        store.PostalCode ? ' ' + store.PostalCode : ''
    } `
    return (
        <View style={[styles.itemContentContainer]}>
            <CText
                ellipsizeMode="tail"
                style={[styles.fontColor_black, styles.fontWeight_800, styles.fontSize_18]}
                numberOfLines={1}
            >
                {store?.StoreName ? store?.StoreName : ''}
            </CText>
            {!!store.CustUniqId && (
                <CText
                    ellipsizeMode="tail"
                    style={[styles.fontColor_black, styles.fontWeight_600, styles.fontSize_12, styles.marginTop_3]}
                    numberOfLines={1}
                >
                    {t.labels.PBNA_MOBILE_NUMBER_SIGN + store.CustUniqId}
                </CText>
            )}
            <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                {!!store.Street && (
                    <CText
                        style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                    >
                        {store.Street ? store.Street + ',' : ''}
                    </CText>
                )}
            </View>
            <View style={[styles.rowCenter, styles.marginTop_3, styles.marginRight_20]}>
                <CText
                    style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                >
                    {cityStateZip}
                </CText>
            </View>
        </View>
    )
}

const renderLeftButton = (props: MyStoreNavHeaderProps) => {
    return <BackButton onBackPress={props.onLeftButtonClick} />
}

const renderRightButton = (props: MyStoreNavHeaderProps) => {
    return (
        <TouchableOpacity
            onPress={() => {
                if (props.onRightButtonClick) {
                    props.onRightButtonClick()
                }
            }}
        >
            <Image
                source={props.rightButtonImgSrc || ImageSrc.IOS_ADD_CIRCLE_OUTLINE_BLUE}
                style={styles.backButtonIcon}
            />
        </TouchableOpacity>
    )
}

const MyStoreNavHeader: FC<MyStoreNavHeaderProps> = (props: MyStoreNavHeaderProps) => {
    const { dropDownRef } = useDropDown()
    const [store, setStore] = useState<RetailStoreModel>()
    const fetStoreData = async () => {
        const storeFromQuery = await VisitService.fetchRetailStoreData(props.storeId, dropDownRef)
        setStore(storeFromQuery)
    }
    useEffect(() => {
        fetStoreData()
    }, [props.storeId])
    const insets = useSafeAreaInsets()
    const statusbarheight = insets.top
    return (
        <View style={[styles.container, { paddingTop: statusbarheight }]}>
            {renderLeftButton(props)}
            <View style={styles.imgUserImage}>
                {!store && <IMG_STORE_PLACEHOLDER height={38} width={38} />}
                {store && renderCDAStoreIcon(store?.CDAMedal || '', styles.imgUserImage)}
            </View>
            {store && renderAddressContent(store)}
            {props.showRightButton && renderRightButton(props)}
        </View>
    )
}

export default MyStoreNavHeader
