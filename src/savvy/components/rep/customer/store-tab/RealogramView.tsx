import React, { useState, useEffect, useRef, RefObject } from 'react'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { View, Image, StyleSheet, Dimensions, FlatList, ImageResizeMode, ImageSourcePropType } from 'react-native'
import InfoIcon from '../../../../../../assets/image/icon-info-blue.svg'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import IconRealogram from '../../../../../../assets/image/icon-realogram.svg'
import IconOpenLink from '../../../../../../assets/image/icon-open-link.svg'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { DebouncedButton } from '../../../../../common/components/Button'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import moment from 'moment'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { useSelector } from 'react-redux'
import { renderStoreIcon } from '../CustomerListTile'
import Tooltip from 'react-native-walkthrough-tooltip'
import { RealogramJSON, cacheProductServiceName, usePreloadRealogram } from '../../../../hooks/RealogramViewHook'
import * as RNFS from 'react-native-fs'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import { Country, CountryType } from '../../../../enums/Contract'
import { handleChangeRealogramVisit } from '../../../../helper/rep/RealogramHelper'
import { NavigationPopNum } from '../../../../enums/Manager'
const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerC: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        marginTop: 50,
        marginBottom: 30,
        gap: 20
    },
    blueText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    doorC: {
        width,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column-reverse'
    },
    shelfC: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    img100: {
        height: '100%',
        width: '100%'
    },
    clearIcon: { width: 15, height: 15, position: 'absolute' },
    editProductC: {
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    doorTitleC: {
        height: 50,
        width: '100%',
        backgroundColor: '#F2F4F7',
        justifyContent: 'center'
    },
    doorTitleT: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center'
    },
    deleteBtn: {
        width: '48%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#EB445A'
    },
    updateBtn: {
        width: '48%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00A2D9',
        flexDirection: 'row'
    },
    updateText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700'
    },
    deleteText: {
        color: 'red',
        fontSize: 12,
        fontWeight: '700'
    },
    btnGroupC: {
        height: 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%'
    },
    bottomC: {
        backgroundColor: 'black',
        height: 125 + 500,
        marginBottom: -500
    },
    indexC: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
        marginBottom: 20
    },
    indexBtn: {
        height: 7,
        width: 7,
        marginHorizontal: 5,
        borderRadius: 7
    },
    realogramC: {
        height: 50,
        width: '100%',
        backgroundColor: '#F2F4F7',
        paddingHorizontal: '5%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    realogramMainC: {
        flex: 1,
        backgroundColor: 'white'
    },
    realogramCreateDateText: {
        textAlign: 'center',
        color: '#565656',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 2
    },
    storeIcon: { width: 38, height: 38 },
    backImg: { width: 12, height: 20.5 },
    nameText: { fontSize: 18, fontWeight: '700' },
    realogramTextC: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    divider: {
        fontSize: 14,
        fontWeight: '500',
        color: '#D3D3D3'
    },
    scrollViewContentC: {
        backgroundColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 5,
        shadowColor: '#004C97'
    },
    separator: { width: 20, height: 1 },
    packageC: {
        flex: 1,
        flexDirection: 'column-reverse',
        marginTop: 'auto',
        width: '100%'
    },
    shelfPadding: { height: 10, backgroundColor: '#D3D3D3' },
    productStackC: { justifyContent: 'space-between', height: '100%' }
})

function getPercent(value: number, total: number): `${number}%` {
    return `${(value / total) * 100}%`
}

const staticImages = {
    PepsiUnknown: require('../../../../../../assets/image/realogram/pepsi-unknown.jpg'),
    PepsiUnknownPack: require('../../../../../../assets/image/realogram/pepsi-unknown-pack.jpg'),
    Competitor: require('../../../../../../assets/image/realogram/competitor.jpg'),
    CompetitorPack: require('../../../../../../assets/image/realogram/competitor-pack.jpg'),
    EmptyFacing: require('../../../../../../assets/image/realogram/empty-facing.jpg'),
    NonLRB: require('../../../../../../assets/image/realogram/non-lrb.jpg')
}

const isStaticResource = (imgMap: { [x: string]: string | null }, upc: string, isPackage: boolean) => {
    const productKey = upc + (isPackage ? 'Y' : 'N')
    return !!(
        upc === 'Unknown' ||
        upc === 'Empty' ||
        upc === 'Non LRB' ||
        upc === null ||
        imgMap[productKey] === null ||
        imgMap[productKey] === undefined
    )
}

const upcToUrl = (
    imgMap: { [x: string]: string | null },
    upc: string,
    isPackage: boolean,
    allPepsiUpc: { [k: string]: true }
): string | number => {
    if (upc === 'Unknown') {
        if (isPackage) {
            return staticImages.CompetitorPack
        }
        return staticImages.Competitor
    }
    if (upc === 'Empty') {
        return staticImages.EmptyFacing
    }
    if (upc === 'Non LRB') {
        return staticImages.NonLRB
    }

    if (upc === null) {
        if (isPackage) {
            return staticImages.PepsiUnknownPack
        }
        return staticImages.PepsiUnknown
    }

    const productKey = upc + (isPackage ? 'Y' : 'N')
    if (imgMap[productKey] === undefined && !allPepsiUpc[upc]) {
        if (isPackage) {
            return staticImages.CompetitorPack
        }
        return staticImages.Competitor
    }
    if (imgMap[productKey] === null || (imgMap[productKey] === undefined && allPepsiUpc[upc])) {
        if (isPackage) {
            return staticImages.PepsiUnknownPack
        }
        return staticImages.PepsiUnknown
    }
    return imgMap[productKey] as string
}

function getSource(
    upc: string,
    imgMap: { [x: string]: string | null },
    isPackage: boolean,
    allPepsiUpc: { [k: string]: true }
): ImageSourcePropType {
    const uri = upcToUrl(imgMap, upc, isPackage, allPepsiUpc)
    if (typeof uri === 'number') {
        return uri
    }
    if (uri.includes(cacheProductServiceName)) {
        return {
            uri: RNFS.DocumentDirectoryPath + '/' + uri
        }
    }
    return {
        uri: uri
    }
}

function getResizeMode(imgMap: any, product: any): ImageResizeMode {
    if (product.upc === 'Empty') {
        return 'contain'
    }
    if (isStaticResource(imgMap, product.upc, product.ps === 'Y')) {
        return 'stretch'
    }
    return 'cover'
}

const renderFallbackImg = (isPackage: boolean) =>
    isPackage ? staticImages.PepsiUnknownPack : staticImages.PepsiUnknown

const ItemSeparatorComponent = () => <View style={styles.separator} />

function toLegacyObj(obj: any): Record<string, any> {
    if (!obj) {
        return {}
    }
    const object = { ...obj }
    for (const k in object) {
        let flattenObj = {}
        if (_.isObject(object[k])) {
            flattenObj = _.mapKeys(object[k], (_v, key) => {
                return k + '.' + key
            })
            Object.assign(object, flattenObj)
            delete object[k]
        }
    }
    return object
}

export const RealogramView: React.FC<any> = (props) => {
    const { navigation } = props
    const [currentIndex, setCurrentIndex] = useState(0)
    const [editing, setEditing] = useState(false)
    const [z, setZ] = useState(1)
    const [resizing, setResizing] = useState(false)
    const [data, setData] = useState<RealogramJSON>([])
    const flatListRef = useRef<FlatList>(null)
    const customerDetailS = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const customerDetail = _.isEmpty(customerDetailS) ? toLegacyObj(props.route.params.customerDetail) : customerDetailS
    const realogramCreateDate = moment(props?.route?.params?.realogramCreateDate).format(TIME_FORMAT.MMMDDYYYY)
    const { completeFlag, imgMap, allPepsiUpc } = usePreloadRealogram(
        data,
        customerDetail.CountryCode === CountryType.CA || customerDetail.Country === Country.Canada
    )
    const [showFallBackImg, setShowFallBackImg] = useState(false)
    useEffect(() => {
        if (props?.route?.params?.realogramData) {
            try {
                const data = JSON.parse(props?.route?.params?.realogramData || '{}')
                if (data?.realogram && !_.isEmpty(data.realogram)) {
                    setData(data.realogram)
                }
            } catch (error) {
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'RealogramView',
                    'Fail to parse JSON, ' + props?.route?.params?.visitId + ErrorUtils.error2String(error)
                )
            }
        }
    }, [])

    const _renderItem = ({ item, index }: { item: [string, RealogramJSON[number]]; index: number }) => {
        const ref: RefObject<KeyboardAwareScrollView> = React.createRef()
        const [dKey, door] = item
        return (
            <KeyboardAwareScrollView
                extraHeight={-20}
                ref={ref}
                disableIntervalMomentum
                decelerationRate="fast"
                scrollEnabled={z === 1}
                contentContainerStyle={[styles.scrollViewContentC, z < 1 && { shadowOpacity: 0.3 }]}
                style={{ overflow: 'visible' }}
                onContentSizeChange={() => editing || ref.current?.scrollToPosition(0, 0)}
            >
                <DebouncedButton
                    disabled={z >= 1}
                    onPress={() => {
                        setZ(1)
                        setCurrentIndex(index)
                        setResizing(true)
                        setTimeout(() => {
                            flatListRef.current?.scrollToOffset({
                                offset: index * width + 20 * index,
                                animated: false
                            })
                            setZ(1)
                            setResizing(false)
                        }, 300)
                    }}
                    style={styles.doorC}
                >
                    {/* Shelf */}

                    {door.shelves &&
                        Object.entries(door.shelves).map(([sKey, shelf]) => {
                            const shelfHeight =
                                (shelf.height / door.max_tag_img_height) *
                                ((door.max_tag_img_height / door.width) * (width * 0.9))
                            return (
                                <>
                                    <View style={[styles.shelfPadding, { width }]} />
                                    <View
                                        key={sKey}
                                        style={[
                                            styles.shelfC,
                                            {
                                                height: shelfHeight + (editing ? 20 : 0)
                                            }
                                        ]}
                                    >
                                        {/* Product */}
                                        {shelf.products.map((pack, pIndex) => {
                                            const [pHeight, pWidth] = [
                                                pack.reduce((p, c) => p + c.h, 0),
                                                Math.max(...pack.map((pack) => pack.w))
                                            ]
                                            const pKey = sKey + pIndex
                                            return (
                                                <View
                                                    key={pKey}
                                                    style={[
                                                        styles.productStackC,
                                                        { width: getPercent(pWidth, shelf.total_width) }
                                                    ]}
                                                >
                                                    {/* Future Order Realogram editing && (
                                                        <DemoComponent imgMap={imgMap} upc={pack?.[0]?.upc ?? ''} />
                                                    ) */}
                                                    <View
                                                        style={[
                                                            styles.packageC,
                                                            {
                                                                maxHeight: (pHeight / shelf.height) * shelfHeight
                                                            }
                                                        ]}
                                                    >
                                                        {pack.map((product, productIndex) => {
                                                            // Mobile display only
                                                            const productKey = productIndex + (product.upc ?? '')
                                                            return (
                                                                <DebouncedButton
                                                                    disabled
                                                                    key={completeFlag + productKey}
                                                                    style={{
                                                                        width: getPercent(product.w, pWidth),
                                                                        height: getPercent(product.h, pHeight)
                                                                    }}
                                                                >
                                                                    <Image
                                                                        style={styles.img100}
                                                                        onError={() => setShowFallBackImg(true)}
                                                                        defaultSource={
                                                                            showFallBackImg
                                                                                ? renderFallbackImg(product.ps === 'Y')
                                                                                : undefined
                                                                        }
                                                                        resizeMode={getResizeMode(imgMap, product)}
                                                                        source={
                                                                            completeFlag
                                                                                ? getSource(
                                                                                      product.upc,
                                                                                      imgMap,
                                                                                      product.ps === 'Y',
                                                                                      allPepsiUpc
                                                                                  )
                                                                                : {}
                                                                        }
                                                                    />
                                                                </DebouncedButton>
                                                            )
                                                        })}
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </>
                            )
                        })}

                    {z < 1 && (
                        <View style={[styles.doorTitleC]}>
                            <CText style={styles.doorTitleT}>{t.labels.PBNA_MOBILE_DOOR + ' ' + dKey}</CText>
                        </View>
                    )}
                </DebouncedButton>
            </KeyboardAwareScrollView>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerC}>
                <DebouncedButton onPress={navigation.goBack} style={{}}>
                    <Image style={styles.backImg} source={ImageSrc.IMG_BACK} />
                </DebouncedButton>
                {renderStoreIcon(customerDetail, true, false, styles.storeIcon, styles.storeIcon)}
                <View>
                    <CText style={styles.nameText}>{customerDetail.Name}</CText>
                    <CText style={commonStyle.font_12_700}>#{customerDetail['Account.CUST_UNIQ_ID_VAL__c']}</CText>
                </View>
            </View>
            <View style={styles.realogramC}>
                <View style={styles.realogramTextC}>
                    <IconRealogram width={21} />
                    <CText style={[commonStyle.font_14_700]}>{t.labels.PBNA_MOBILE_REALOGRAM}</CText>
                    <Tooltip>
                        <DebouncedButton>
                            <InfoIcon width={15} height={14} />
                        </DebouncedButton>
                    </Tooltip>
                    <CText style={styles.divider}>|</CText>
                    <CText style={[commonStyle.font_14_700]}>{t.labels.PBNA_MOBILE_COLD_VAULT}</CText>
                </View>
                <DebouncedButton disabled hitSlop={5} onPress={() => setEditing(!editing)}>
                    <CText style={styles.blueText}>
                        {/* Future {editing ? t.labels.PBNA_MOBILE_DONE : t.labels.PBNA_MOBILE_ORDER} */}
                        {editing ? t.labels.PBNA_MOBILE_DONE : t.labels.PBNA_MOBILE_EDIT}
                    </CText>
                </DebouncedButton>
            </View>
            <View style={styles.realogramMainC}>
                <CText style={styles.realogramCreateDateText}>
                    {t.labels.PBNA_MOBILE_REALOGRAM_CREATED_ON + ' '}
                    <CText style={{ color: 'black' }}>{realogramCreateDate}</CText>
                </CText>
                <FlatList
                    contentContainerStyle={{
                        display: resizing ? 'none' : undefined
                    }}
                    zoomScale={z}
                    contentInsetAdjustmentBehavior="automatic"
                    minimumZoomScale={z > 1 ? 1 : 0.3}
                    maximumZoomScale={z < 1 ? 1 : 2}
                    data={Object.entries(data)}
                    renderItem={_renderItem}
                    ref={flatListRef}
                    horizontal
                    disableIntervalMomentum
                    snapToInterval={z === 1 ? width + 20 : undefined}
                    decelerationRate="fast"
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    automaticallyAdjustContentInsets
                    scrollToOverflowEnabled
                    onMomentumScrollEnd={(event) => {
                        const newPageIndex = Math.floor(
                            event.nativeEvent.contentOffset.x / event.nativeEvent.zoomScale / width
                        )
                        setCurrentIndex(newPageIndex)
                    }}
                    showsHorizontalScrollIndicator={false}
                    onScrollEndDrag={(e) => {
                        setZ(e.nativeEvent.zoomScale)
                    }}
                />

                <View style={styles.bottomC}>
                    <View style={styles.indexC}>
                        {Object.keys(data).map((doorKey, index) => (
                            <DebouncedButton
                                disabled={index === currentIndex}
                                onPress={() => {
                                    if (z === 1) {
                                        flatListRef?.current?.scrollToIndex({ index: index, animated: true })
                                    } else {
                                        setZ(1)
                                        setCurrentIndex(index)
                                        setResizing(true)
                                        setTimeout(() => {
                                            flatListRef.current?.scrollToOffset({
                                                offset: index * width + 20 * index,
                                                animated: false
                                            })
                                            setZ(1)
                                            setResizing(false)
                                        }, 300)
                                    }
                                }}
                                key={doorKey}
                                hitSlop={5}
                                style={[
                                    styles.indexBtn,
                                    {
                                        backgroundColor: index === currentIndex ? 'white' : '#00A2D9'
                                    },
                                    z !== 1 && {
                                        backgroundColor: '#00A2D9'
                                    }
                                ]}
                            />
                        ))}
                    </View>
                    <View style={styles.btnGroupC}>
                        <DebouncedButton
                            style={styles.deleteBtn}
                            onPress={() => {
                                handleChangeRealogramVisit(props?.route?.params?.visitId)
                                navigation.pop(NavigationPopNum.POP_TWO)
                            }}
                        >
                            <CText style={styles.deleteText}>{t.labels.PBNA_MOBILE_DELETE.toLocaleUpperCase()}</CText>
                        </DebouncedButton>
                        <DebouncedButton style={styles.updateBtn}>
                            <IconOpenLink style={{ marginRight: 8 }} width={14} />
                            <CText style={styles.updateText}>{t.labels.PBNA_MOBILE_UPDATE.toLocaleUpperCase()}</CText>
                        </DebouncedButton>
                    </View>
                </View>
            </View>
        </View>
    )
}
