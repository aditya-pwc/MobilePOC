/**
 * @description Component to show Innovation Product Detail Page.
 * @author Qiulin Deng
 * @date 2021-09-14
 * @Lase
 */

import React, { useState, useEffect, useRef, SetStateAction, useMemo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View, Button, DeviceEventEmitter, ScrollView, Alert } from 'react-native'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import CText from '../../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import moment from 'moment'
import { Modalize } from 'react-native-modalize'
import InnovationProductSkuItem from './InnovationProductSkuItem'
import {
    useBarCodeMap,
    usePriorityProductAttribute,
    useSellingDataFromLocalHook,
    useSKUsLocal
} from '../../../../hooks/InnovationProductHooks'
import { t } from '../../../../../common/i18n/t'
import Modal from 'react-native-modal'
import { NavigationRoute } from '../../../../enums/Manager'
import {
    downloadSalesDocumentsFile,
    isCelsiusPriority,
    translateSalesDocTypeName,
    updateStoreProdToSF
} from '../../../../utils/InnovationProductUtils'
import InnovaProdSnoozeForm from './InnovaProdSnoozeForm'
import PickerTile from '../../lead/common/PickerTile'
import _ from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceEvent } from '../../../../enums/DeviceEvent'
import ShoppingCartSvg from '../../../../../../assets/image/icon-shopping-cart-white.svg'
import { CommonParam } from '../../../../../common/CommonParam'
import { isPersonaUGMOrSDL, Persona } from '../../../../../common/enums/Persona'
import InnovationProductHeader from './InnovationProductHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { renderCardTitle, renderDaysToEndView, renderStartAndEndDate } from './InnovationProductTile'
import LookOfSuccessIcon from '../../../../../../assets/image/selling-carousel-file/thumbsup.svg'
import AuthLetterIcon from '../../../../../../assets/image/selling-carousel-file/auth_letter.svg'
import SellSheetIcon from '../../../../../../assets/image/selling-carousel-file/sell_sheet.svg'
import SigKitIcon from '../../../../../../assets/image/selling-carousel-file/signage_kit.svg'
import InnovationProductImg from './InnovationProductImg'
import Loading from '../../../../../common/components/Loading'
import NetInfo from '@react-native-community/netinfo'
import { useSelector, useDispatch } from 'react-redux'
import { addSuccessDownloadFilesAction } from '../../../../redux/action/SalesDocumentsActionType'
import CollapseContainer from '../../../common/CollapseContainer'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { SharePointTokenManager, useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import IconButton from '../../common/IconButton'
import PriorityExecutionPicturesView from './components/PriorityExecutionPicturesView'
import { PriorityProductAttributeList } from './PriorityProductAttributeList'
import { useIsFocused } from '@react-navigation/native'
import { PriorityProductMenu } from './components/PriorityProductMenu'
import { SuccessModal } from '../../../../pages/rep/atc/CustomerCarouselDetailScreen'

interface InnovationProductDetailProps {
    navigation: any
    route: any
}

interface ATCButtonProps {
    onPressBtn?: Function
    btnStyle?: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    bgtContainer: {
        height: '10.75%',
        paddingTop: 59,
        width: '100%',
        paddingHorizontal: '5%'
    },
    IconContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    AvailableContainer: {
        alignItems: 'center',
        marginBottom: '5%',
        marginTop: '5%'
    },
    availableHeader: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    starIcon: {
        width: 16,
        height: 14
    },
    prodImageSize: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    iconToNext: {
        width: 10,
        height: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '45deg' }]
    },
    iconToPREV: {
        width: 10,
        height: 10,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        transform: [{ rotate: '-45deg' }]
    },
    radioContainer: {
        marginLeft: 22,
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        paddingVertical: 20,
        marginVertical: 0
    },
    launchDateContainer: {
        flexDirection: 'row',
        height: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    upcText: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '700',
        marginTop: 5
    },
    marginTop20: {
        marginTop: 20
    },
    generalText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    atcColor: {
        color: '#FFFFFF'
    },
    atcBtn: {
        marginTop: 25
    },
    launchItemPlaceholder: {
        flexDirection: 'row',
        height: 20,
        width: 130
    },
    fastImage: {
        width: '100%',
        height: 225,
        borderRadius: 6
    },
    upcImage: {
        height: 164,
        width: 164,
        marginTop: 10
    },
    prevNextContainer: {
        height: '6%',
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: '5%'
    },
    swipeListWrap: {
        height: '83%'
    },
    productImg: {
        height: 225,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    productNameLaunch: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%'
    },
    productName: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 5,
        marginBottom: 10
    },
    productLaunch: {
        flexDirection: 'row',
        marginBottom: 10
    },
    fontSize12: {
        fontSize: 12
    },
    detailSectionWrap: {
        marginTop: 20,
        paddingHorizontal: '5%'
    },
    detailSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: '10%'
    },
    detailLabel: {
        fontSize: 12,
        color: '#565656'
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4
    },
    detailFirst: {
        width: 100,
        borderRightWidth: 0.5,
        borderRightColor: '#D3D3D3',
        justifyContent: 'center'
    },
    detailSecond: {
        width: 100,
        marginLeft: 20,
        marginRight: 20,
        borderRightWidth: 0.5,
        borderRightColor: '#D3D3D3',
        justifyContent: 'center'
    },
    detailLast: {
        width: 100,
        justifyContent: 'center'
    },
    atcBtnWrap: {
        marginTop: 25
    },
    atcBtnText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700'
    },
    productPickerWrap: {
        paddingHorizontal: '5%'
    },
    productPicker: {
        marginTop: 28,
        borderBottomWidth: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    productPickerLabel: {
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'uppercase'
    },
    pickerContainer: {
        alignItems: 'center'
    },
    pickContainer: {
        paddingHorizontal: 9
    },
    modalStyle: {
        width: '90%'
    },
    swipeRowWrap: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    swipeRowBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 98
    },
    swipeRowBtnText: {
        fontSize: 12,
        fontWeight: '700'
    },
    colorWhite: {
        color: '#FFFFFF'
    },
    colorBlack: {
        color: '#000000'
    },
    emptyListPlaceholder: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 40
    },
    emptyImg: {
        width: 115,
        height: 148
    },
    emptyLabel: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        marginTop: 42
    },
    emptyMsgWrap: {
        width: 300,
        marginTop: 10
    },
    emptyMsg: {
        fontSize: 14,
        fontWeight: '400',
        color: '#565656',
        textAlign: 'center'
    },
    footerWrap: {
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: '5%'
    },
    footerIcon: {
        width: 20,
        height: 26,
        marginRight: 15
    },
    modalHandle: {
        backgroundColor: '#D3D3D3',
        marginTop: 8
    },
    upcModalContent: {
        backgroundColor: '#F2F2F2',
        borderRadius: 14
    },
    upcModalInfo: {
        alignItems: 'center',
        marginTop: 30,
        width: 300
    },
    upcModalLabel: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600'
    },
    upcUnavailableWrap: {
        marginHorizontal: 30,
        marginTop: 10
    },
    upcUnavailableText: {
        textAlign: 'center',
        fontSize: 13
    },
    upcModalBtn: {
        height: 44,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(60, 60, 67, 0.36)',
        marginTop: 20
    },
    addMarginBottom: {
        marginBottom: 30
    },
    documentsContainer: {
        paddingTop: 20,
        paddingBottom: 10,
        marginTop: 30,
        backgroundColor: '#F2F4F7'
    },
    documentsTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginHorizontal: 22
    },
    documentBtnContainer: {
        paddingHorizontal: '5%',
        paddingRight: 10,
        paddingVertical: 20,
        flexDirection: 'row'
    },
    documentBtn: {
        width: 190,
        height: 60,
        borderRadius: 5.5,
        backgroundColor: 'white',
        marginRight: 12,
        shadowColor: '#004C97',
        shadowOpacity: 0.17,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        paddingVertical: 17,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    documentTextWrapper: {
        height: 30,
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        paddingRight: 4
    },
    documentText: {
        fontSize: 12,
        fontWeight: '400',
        marginLeft: 8
    },
    priorityProductsCollContainer: {
        marginVertical: 30,
        marginHorizontal: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    priorityProductsChevronStyle: {
        width: 18,
        height: 13,
        marginRight: 2
    },
    priorityProductsPickerContainer: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 22
    },
    cardTitleLine3Text: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center'
    },
    lastModifiedInfo: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    lastModifiedUser: {
        ...commonStyle.font_12_400,
        marginLeft: 4
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingRight: 22,
        paddingLeft: 22
    },
    flex1: {
        flex: 1
    },
    marginRight15: {
        marginRight: 15
    },
    noSaleIcon: {
        height: 14,
        width: 14,
        marginLeft: 4
    }
})

export const ATCButton = (props: ATCButtonProps) => {
    const { onPressBtn, btnStyle } = props
    return (
        <TouchableOpacity
            style={btnStyle}
            onPress={() => {
                onPressBtn && onPressBtn()
            }}
        >
            <View
                style={{
                    backgroundColor: '#00A2D9',
                    marginHorizontal: 22,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 6,
                    height: 44
                }}
            >
                <ShoppingCartSvg width={20} height={20} style={styles.atcColor} />
                <CText style={{ marginLeft: 10, fontSize: 12, color: '#FFFFFF', fontWeight: '700' }}>
                    {' '}
                    {_.toUpper(t.labels.PBNA_MOBILE_ATC_ADD_TO_CART)}{' '}
                </CText>
            </View>
        </TouchableOpacity>
    )
}

export const renderCardTitleLine3 = (item: any, isInExecutionPage?: boolean) => {
    return (
        item?.Card_LineThreeTitle__c && (
            <CText style={[styles.cardTitleLine3Text, isInExecutionPage && { textAlign: 'left' }]}>
                {item.Card_LineThreeTitle__c}
            </CText>
        )
    )
}

export const renderExecuteBorderedButton = (
    item: any,
    storeId: string,
    exeFn?: Function,
    setFlagAction?: React.Dispatch<SetStateAction<number>>,
    disabled?: boolean
) => {
    return (
        <IconButton
            type={'default'}
            imageSource={ImageSrc.IMG_CAMERA1}
            title={t.labels.PBNA_MOBILE_EXECUTE}
            disabled={disabled}
            onPress={() => {
                exeFn && exeFn(item, storeId, setFlagAction)
            }}
        />
    )
}

const InnovationProductDetail = (props: InnovationProductDetailProps) => {
    const { navigation, route } = props
    const {
        retailStore,
        accessToken,
        correctPage,
        spStatus,
        onDetailGoBack,
        navFlag,
        isGoBackToCustomer,
        isSelling,
        sellingData,
        onClickExecute,
        isFromPriorityArchive
    } = route.params

    const prodLaunchTwoWks = route.params.prodLaunchTwoWks || []
    const isArchive = route.params.isArchive
    const isLimit = route.params.isLimit
    const [Index, setIndex] = useState(isArchive ? 0 : correctPage - 1)
    const indexRef = useRef(0)
    const [count, setCount] = useState(0)
    const filterMap = {
        0: t.labels.PBNA_MOBILE_IP_SKUS_TO_ACTION,
        1: t.labels.PBNA_MOBILE_IP_SNOOZED,
        2: t.labels.PBNA_MOBILE_NO_SALE,
        3: t.labels.PBNA_MOBILE_IP_DELIVERED,
        4: _.capitalize(t.labels.PBNA_MOBILE_ALL)
    }
    const filterLst = [
        t.labels.PBNA_MOBILE_IP_SKUS_TO_ACTION,
        t.labels.PBNA_MOBILE_IP_SNOOZED,
        t.labels.PBNA_MOBILE_NO_SALE,
        t.labels.PBNA_MOBILE_IP_DELIVERED,
        _.capitalize(t.labels.PBNA_MOBILE_ALL)
    ]
    const [pickValue, setPickValue] = useState(isArchive || navFlag || isGoBackToCustomer ? 4 : 0)
    const [refreshCarousel, setRefreshCarousel] = useState(false)
    const { skuData, skuLength, allSkus } = useSKUsLocal(
        isArchive ? prodLaunchTwoWks : prodLaunchTwoWks[Index],
        count,
        pickValue,
        spStatus,
        Index,
        isArchive,
        refreshCarousel
    )
    const [orderedCount, setOrderedCount] = useState(0)
    const [deliveredCount, setDeliveredCount] = useState(0)
    const modalizeRef = useRef<Modalize>(null)
    const pickRef = useRef(null)
    const [snoozeItem, setSnoozeItem] = useState({})
    const [upcVisible, setUpcVisible] = useState(false)
    const [barCodeGTINs, setBarCodeGTINs] = useState('')
    const [upcCode, setUpcCode] = useState('')
    const [invenId, setInvenId] = useState('')
    const [upcAvailable, setUpcAvailable] = useState(true)
    const [retrievedSKU, setRetrievedSKU] = useState([])
    const NUMBER_OF_BREAK_CARD = 5
    const retrievedSKURef = useRef(null)
    const [sellingDataList, setSellingDataList] = useState(sellingData || [])
    // when click 'execute' button, need to refresh selling data
    const [executedId, setExecutedId] = useState('')
    const [refreshFlag, setRefreshFlag] = useState<number>(0)
    const useSellingDataFromLocalHookProps = {
        isLoading: false,
        retailStore,
        shouldLandOnTab: '',
        exeItemId: executedId,
        refreshFlag
    }
    const { carouselSelling, archivedPriorities, storePriorities } = useSellingDataFromLocalHook(
        useSellingDataFromLocalHookProps
    )

    // get StorePriority__c as Id {
    const priorityId = (isFromPriorityArchive ? sellingData[Index] : sellingDataList[Index])?.Id
    const storePriority = storePriorities?.find((item) => item.PriorityId__c === priorityId)
    // get StorePriority__c as Id }

    const isFocused = useIsFocused()

    const sharepointToken = useSharePointToken(true)

    const [isSalesDocsDownLoading, setIsSalesDocsDownLoading] = useState(false)

    const fileUrlsInState = useSelector((state: any) => state.salesDocumentsReducer.fileUrls)
    const dispatch = useDispatch()

    const [loadedDocUrls, setLoadedDocUrls] = useState<string[]>([])

    // Priority Product Details
    const [showPriorityProductAttributeList, setShowPriorityProductAttributeList] = useState<boolean>(false)

    // fetch product attribute details (combined with orderItem/product2 information)
    const { paItems, celsiusPriority, needAuthProducts, isLoadingProducts } = usePriorityProductAttribute(
        storePriority?.Id || '',
        isFromPriorityArchive ? sellingData[Index] : sellingDataList[Index],
        isFocused,
        retailStore
    )
    const isWarnQty = useMemo(() => {
        if (!celsiusPriority) {
            for (const paItem of paItems) {
                let subtotal = 0
                if (paItem._pushedProducts) {
                    for (const pushedProduct of paItem._pushedProducts) {
                        subtotal +=
                            pushedProduct._pushedOrderItems?.reduce(
                                (qty: number, orderItem: any) => qty + orderItem.quantity,
                                0
                            ) || 0
                    }
                }
                if (subtotal > 0 && subtotal < Number(paItem.Quantity)) {
                    return true
                }
            }
        }
        return false
    }, [paItems, celsiusPriority])

    useEffect(() => {
        if (!isArchive && !isSelling) {
            const param = {
                National_Launch_Date: prodLaunchTwoWks[Index]['Product.National_Launch_Date__c'],
                Sub_Brand_Code__c: prodLaunchTwoWks[Index]['Product.Sub_Brand_Code__c'],
                Brand_Code__c: prodLaunchTwoWks[Index]['Product.Brand_Code__c']
            }
            AsyncStorage.setItem('carousel_page', JSON.stringify(param)).then(() => {
                setDeliveredCount(prodLaunchTwoWks[Index].deliveredCount)
                setOrderedCount(prodLaunchTwoWks[Index].orderedCount)
            })
        }
        return () => {
            setDeliveredCount(0)
            setOrderedCount(0)
        }
    }, [Index])

    useEffect(() => {
        const refreshCarouselEvent = DeviceEventEmitter.addListener(DeviceEvent.CAROUSEL_REFRESH, () => {
            setRefreshCarousel(true)
        })
        return () => {
            refreshCarouselEvent.remove()
        }
    })

    const [successMessage, setSuccessMessage] = useState<string>('')

    // show message for backing from ATC flow
    useEffect(() => {
        const processBackFromATC = async () => {
            const message = (await AsyncStorage.getItem('atc.message')) ?? ''
            if (message) {
                AsyncStorage.removeItem('atc.message')
                setSuccessMessage(message)
            }
        }

        if (isFocused) {
            processBackFromATC()
        }
    }, [isFocused])

    // hide message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const h = setTimeout(() => setSuccessMessage(''), 3000)
            return () => clearTimeout(h)
        }
    }, [successMessage])

    useEffect(() => {
        if (!isFromPriorityArchive) {
            if (carouselSelling.length) {
                setSellingDataList(carouselSelling)
                // since `Index` is passed by route params, it will not update when data changed in current page
                // so if execute the last one,  manually set `Index` equal to `data.length - 1`
                if (Index === carouselSelling.length && isSelling) {
                    setIndex(carouselSelling.length - 1)
                }
            }
            if (!carouselSelling.length && executedId) {
                // if execute last one, go back?
                navigation.goBack()
            }
        } else {
            setSellingDataList(archivedPriorities)
        }
    }, [carouselSelling, archivedPriorities])

    const navigateToCart = () => {
        navigation.navigate('AddToCartScreen', {
            ...route.params,
            storePriorityId: storePriority?.Id,
            defaultIndex: Index,
            needAuthProducts: needAuthProducts,
            celsiusPriorityProducts: paItems,
            celsiusPriority: celsiusPriority
        })
    }

    const renderAddToCartButton = (onPress: () => void) => {
        let pa = sellingDataList[Index]?.ProductAttribute__c

        try {
            pa = typeof pa === 'string' ? JSON.parse(pa) : pa
        } catch (error) {
            pa = []
        }
        return (
            <IconButton
                type={'primary'}
                imageSource={ImageSrc.ICON_CART_WHITE}
                title={t.labels.PBNA_MOBILE_ATC_ADD_TO_CART}
                disabled={!pa || pa.length === 0 || (celsiusPriority && !paItems.length)}
                onPress={onPress}
            />
        )
    }

    const onDetailClickExecute = async (
        item: any,
        storeId: string,
        setFlag: React.Dispatch<SetStateAction<number>>
    ) => {
        setExecutedId(sellingDataList[Index]?.Id)
        await onClickExecute(item, storeId, setFlag)
    }

    const onOpen = () => {
        modalizeRef.current?.open()
    }

    const onClose = () => {
        modalizeRef.current?.close()
    }

    const GTINsBarCodeMap = useBarCodeMap()

    const handlePressUPC = (GTINs: string, productCode: string, isAvailable: string, invenIdString: string) => {
        setBarCodeGTINs(GTINs)
        setUpcCode(productCode)
        setInvenId(invenIdString)
        if (isAvailable === '0') {
            setUpcAvailable(false)
        } else {
            setUpcAvailable(true)
        }
        setUpcVisible(true)
    }
    const mainSP = isArchive ? prodLaunchTwoWks : prodLaunchTwoWks[Index]

    useEffect(() => {
        retrievedSKURef.current = retrievedSKU
    }, [retrievedSKU])
    useEffect(() => {
        indexRef.current = Index
    }, [Index])

    useEffect(() => {
        navigation.addListener('beforeRemove', () => {
            route.params?.updateCarousel && route.params.updateCarousel()
            if (onDetailGoBack) {
                if (navFlag && indexRef.current + 1 > NUMBER_OF_BREAK_CARD) {
                    onDetailGoBack(indexRef.current + 1)
                } else {
                    onDetailGoBack(indexRef.current)
                }
            }
            if (isArchive && _.size(retrievedSKURef.current) > 0) {
                route.params.retrieveCarousel(mainSP)
            }
            if (isArchive && route.params.handleNavToDetail) {
                route.params.handleNavToDetail()
            }
        })
        return () => {
            navigation.removeListener('beforeRemove')
        }
    }, [])

    const diffLoadSalesDocs = async () => {
        const syncedUrls = JSON.parse(
            ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
        )

        const mergedUrls = _.uniq([...syncedUrls, ...fileUrlsInState])

        const currentDocFileList = sellingDataList[Index].salesDocuments
            .map((doc: any) => {
                return doc.salesDocUrl
            })
            .filter(Boolean)
        const needToReLoad = _.differenceWith(currentDocFileList, mergedUrls, _.isEqual)

        const tokenManager = SharePointTokenManager.getInstance()
        const sharepointToken = await tokenManager.getToken()

        if (needToReLoad.length) {
            setIsSalesDocsDownLoading(true)
            const syncFilePromises = needToReLoad.map((url: any) => downloadSalesDocumentsFile(url, sharepointToken))
            const syncResults = []
            for (const promise of syncFilePromises) {
                try {
                    const result = await promise
                    if (result) {
                        syncResults.push(result)
                        dispatch(addSuccessDownloadFilesAction(result))
                    }
                } catch (err) {}
            }
            setIsSalesDocsDownLoading(false)
            mergedUrls.push(...syncResults)
            await AsyncStorage.setItem('syncSalesDocumentsFileUrls', JSON.stringify(_.uniq(mergedUrls)))
        }
    }

    useEffect(() => {
        if (isSelling) {
            diffLoadSalesDocs()
            setShowPriorityProductAttributeList(false)
        }
    }, [Index])

    const renderLaunchItem = () => {
        if (moment(mainSP['Product.National_Launch_Date__c']).diff(moment().format('YYYY-MM-DD'), 'days') > 0) {
            const countDown = moment(mainSP['Product.National_Launch_Date__c']).diff(
                moment().format('YYYY-MM-DD'),
                'days'
            )
            if (countDown === 1) {
                return (
                    <View style={[styles.launchDateContainer, { backgroundColor: '#FFC409', paddingHorizontal: 10 }]}>
                        <CText style={[styles.generalText, { color: '#000000' }]}>
                            {countDown + ' ' + t.labels.PBNA_MOBILE_IP_DAY_TO_LAUNCH}
                        </CText>
                    </View>
                )
            }
            return (
                <View style={[styles.launchDateContainer, { backgroundColor: '#FFC409', paddingHorizontal: 10 }]}>
                    <CText style={[styles.generalText, { color: '#000000' }]}>
                        {countDown + ' ' + t.labels.PBNA_MOBILE_IP_DAYS_TO_LAUNCH}
                    </CText>
                </View>
            )
        } else if (
            moment(mainSP['Product.National_Launch_Date__c']).diff(moment().format('YYYY-MM-DD'), 'days') === 0
        ) {
            return (
                <View
                    style={[
                        styles.launchDateContainer,
                        { backgroundColor: '#2DD36F', paddingLeft: 4, paddingRight: 10 }
                    ]}
                >
                    <Image
                        style={styles.starIcon}
                        source={require('../../../../../../assets/image/icon_star_white.png')}
                    />
                    <CText style={[styles.generalText, { color: '#FFFFFF' }]}>
                        {' ' + t.labels.PBNA_MOBILE_IP_LAUNCH_DAY}
                    </CText>
                </View>
            )
        }
        return <View style={styles.launchItemPlaceholder} />
    }

    const renderImage = () => {
        const correctItem = isFromPriorityArchive ? sellingData[Index] : sellingDataList[Index]
        const item = mainSP || correctItem
        if (item) {
            return <InnovationProductImg item={item} isSelling={isSelling} accessToken={accessToken} isDetail />
        }
    }

    const renderUpcImg = () => {
        if (GTINsBarCodeMap && GTINsBarCodeMap[barCodeGTINs]) {
            return (
                <FastImage
                    source={{
                        uri: GTINsBarCodeMap[barCodeGTINs],
                        headers: {
                            Authorization: accessToken,
                            accept: 'image/png'
                        },
                        cache: FastImage.cacheControl.web
                    }}
                    style={styles.upcImage}
                    resizeMode={'contain'}
                />
            )
        }
    }

    const filterRetrievedSKU = (item) => {
        if (retrievedSKU.includes(item['Product.ProductCode'])) {
            setRetrievedSKU((prevRetrievedSKU) => {
                return prevRetrievedSKU.filter((productCode) => productCode !== item['Product.ProductCode'])
            })
        }
    }
    const renderLeftTitleColor = (status: any) => {
        if (status === 'Action' || !status) {
            return styles.colorBlack
        }
        return styles.colorWhite
    }

    const renderRightTitleColor = (status: any) => {
        if (status !== 'No Sale') {
            return styles.colorWhite
        }
        return styles.colorBlack
    }

    const renderRightLabel = (status: any) => {
        if (status !== 'No Sale') {
            return t.labels.PBNA_MOBILE_NO_SALE.toUpperCase()
        }
        return t.labels.PBNA_MOBILE_IP_SNOOZE
    }

    const renderLeftLabel = (status: any) => {
        if (status === 'Action' || !status) {
            return t.labels.PBNA_MOBILE_IP_SNOOZE
        }
        return t.labels.PBNA_MOBILE_IP_RETRIEVE
    }

    const renderRightColor = (status: any) => {
        if (status !== 'No Sale') {
            return '#EB445A'
        }
        return '#FFC409'
    }

    const renderLeftColor = (status: any) => {
        if (status === 'Action' || !status) {
            return '#FFC409'
        }
        return '#2DD36F'
    }

    const updateStoreProductStatus = async (item: any) => {
        if (item.Status__c !== 'No Sale') {
            await updateStoreProdToSF('No Sale', moment().format('YYYY-MM-DD'), item)
            filterRetrievedSKU(item)
            setCount((prevCount) => prevCount + 1)
        } else if (item.Status__c === 'No Sale') {
            setSnoozeItem(item)
            filterRetrievedSKU(item)
            onOpen()
        }
    }

    const handleLeftButton = async (item: any) => {
        if (item.Status__c !== 'Action' && item.Status__c) {
            await updateStoreProdToSF('Action', '', item)
            setRetrievedSKU((prevRetrievedSKU) => [...prevRetrievedSKU, item['Product.ProductCode']])
            setCount((prevCount) => prevCount + 1)
        } else {
            setSnoozeItem(item)
            filterRetrievedSKU(item)
            onOpen()
        }
    }

    const closeRow = (rowMap: any, key: any) => {
        if (rowMap[key]) {
            rowMap[key].closeRow()
        }
    }

    const disableLeftSwipe = (productCode: string) => {
        return (
            spStatus[productCode] &&
            (spStatus[productCode].isDelivered || spStatus[productCode].isOrdered || spStatus[productCode].wksCS)
        )
    }

    const lastCarouselIndex = () => {
        if (navFlag) {
            if (isLimit) {
                if (prodLaunchTwoWks.length < NUMBER_OF_BREAK_CARD) {
                    return prodLaunchTwoWks.length - 1
                }
                return 4
            }
            return prodLaunchTwoWks.length - 1
        }
        if (isSelling) {
            return isFromPriorityArchive ? sellingData.length - 1 : sellingDataList.length - 1
        }
        return prodLaunchTwoWks.length > NUMBER_OF_BREAK_CARD
            ? prodLaunchTwoWks.length - 2
            : prodLaunchTwoWks.length - 1
    }

    const handleSalesDocumentsGoBack = (urls: string[]) => {
        setLoadedDocUrls(urls)
    }

    const navigateToSalesDocuments = (docItem: any, index: number, list: any[]) => {
        navigation.navigate('SalesDocuments', {
            docItem,
            docIndex: index,
            docList: list,
            onSalesDocumentsGoBack: handleSalesDocumentsGoBack
        })
    }

    const reTryToDownloadFiles = async (fileUrl: string) => {
        try {
            setIsSalesDocsDownLoading(true)
            const result = await downloadSalesDocumentsFile(fileUrl, sharepointToken)
            if (result) {
                dispatch(addSuccessDownloadFilesAction(result))
            }
            setIsSalesDocsDownLoading(false)
        } catch (error) {
            setIsSalesDocsDownLoading(false)
        }
    }

    const onClickDoc = async (docItem: any, index: number, list: any[]) => {
        const { salesDocUrl } = docItem
        const storageUrls = JSON.parse(
            ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
        )
        const mergedUrls = _.uniq([...fileUrlsInState, ...storageUrls, ...loadedDocUrls])
        const isItemFileSuccessfullyDownload = mergedUrls.findIndex((url: string) => url === salesDocUrl) > -1
        // if tapped item's file is not downloaded, then check net info
        if (!isItemFileSuccessfullyDownload) {
            NetInfo.fetch().then((state) => {
                if (!state.isConnected || !state.isInternetReachable) {
                    Alert.alert(t.labels.PBNA_MOBILE_ATC_UNSUCCESSFUL, t.labels.PBNA_MOBILE_NO_CONNECTION, [
                        {
                            text: t.labels.PBNA_MOBILE_OK,
                            onPress: () => {}
                        },
                        {
                            text: t.labels.PBNA_MOBILE_ATC_RETRY,
                            onPress: () => {
                                reTryToDownloadFiles(salesDocUrl)
                            }
                        }
                    ])
                } else {
                    navigateToSalesDocuments(docItem, index, list)
                }
            })
        } else {
            navigateToSalesDocuments(docItem, index, list)
        }
    }

    const renderDocuments = (list: any[]) => {
        return list.map((item: any, index: number) => {
            return (
                <TouchableOpacity
                    key={item.salesDocId}
                    onPress={() => {
                        onClickDoc(item, index, list)
                    }}
                >
                    <View style={styles.documentBtn}>
                        {item.salesDocType?.includes('Authorization Letter') && (
                            <AuthLetterIcon fill={'#00A2D9'} width={25} height={30} />
                        )}
                        {item.salesDocType?.includes('Look of Success') && (
                            <LookOfSuccessIcon fill={'#00A2D9'} width={25} height={25} />
                        )}
                        {item.salesDocType?.includes('Sell Sheet') && (
                            <SellSheetIcon fill={'#00A2D9'} width={25} height={30} />
                        )}
                        {item.salesDocType === 'Other' && item.salesDocTypeOther && (
                            <SigKitIcon fill={'#00A2D9'} width={25} height={30} />
                        )}
                        <View style={styles.documentTextWrapper}>
                            <CText style={styles.documentText}>{translateSalesDocTypeName(item)}</CText>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    const renderDocumentList = (item: any) => {
        const SCROLL_EVENT_THROTTLE = 16
        const titleText = `${t.labels.PBNA_MOBILE_SALES_SUPPORT_DOCUMENTS.toLocaleUpperCase()} (${
            item.salesDocuments.length
        })`
        return (
            <View style={styles.documentsContainer}>
                <CText style={styles.documentsTitle}>{titleText}</CText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.documentBtnContainer}
                    scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                >
                    {renderDocuments(item.salesDocuments)}
                </ScrollView>
            </View>
        )
    }

    const renderLastModifiedInfo = (item: any) => {
        const lastModifiedUserName = isCelsiusPriority(item) ? item.ModifiedBy__c : item['LastModifiedBy.Name']

        return (
            <View style={styles.lastModifiedInfo}>
                <CText style={styles.detailLabel}>{t.labels.PBNA_MOBILE_MODIFIED_BY}</CText>
                <CText style={styles.lastModifiedUser}>{lastModifiedUserName + ', '}</CText>
                <CText style={commonStyle.font_12_400}>
                    {moment(item.LastModifiedDate).format(TIME_FORMAT.MMM_DD_YYYY)}
                </CText>
            </View>
        )
    }

    const renderListHeader = () => {
        if (!isSelling) {
            return (
                <View>
                    <View style={styles.productImg}>{renderImage()}</View>
                    <View style={styles.productNameLaunch}>
                        <CText style={styles.generalText}>
                            {mainSP['Product.Formatted_Brand__c'] || mainSP['Product.Brand_Name__c']}
                        </CText>
                        <CText style={styles.productName}>
                            {mainSP['Product.Formatted_Sub_Brand_Name__c'] || mainSP['Product.Sub_Brand__c']}
                        </CText>
                        <View style={styles.productLaunch}>
                            <CText style={styles.detailLabel}> {t.labels.PBNA_MOBILE_SORT_NAT_LAUNCH_DATE}: </CText>
                            <CText style={styles.fontSize12}>
                                {moment(mainSP['Product.National_Launch_Date__c']).format('MMM DD, YYYY')}
                            </CText>
                        </View>
                        {renderLaunchItem()}
                    </View>
                    <View style={styles.detailSectionWrap}>
                        <View style={styles.detailSection}>
                            <View style={styles.detailFirst}>
                                <CText style={styles.detailLabel}> {t.labels.PBNA_MOBILE_IP_TOTAL_SKUS} </CText>
                                <CText style={styles.detailValue}> {mainSP.count} </CText>
                            </View>
                            <View style={styles.detailSecond}>
                                <CText style={styles.detailLabel}> {t.labels.PBNA_MOBILE_IP_ORDERED} </CText>
                                <CText style={styles.detailValue}>
                                    {' '}
                                    {isArchive ? route.params.orderedCount : orderedCount}{' '}
                                </CText>
                            </View>
                            <View style={styles.detailLast}>
                                <CText style={styles.detailLabel}> {t.labels.PBNA_MOBILE_IP_DELIVERED} </CText>
                                <CText style={styles.detailValue}>
                                    {' '}
                                    {isArchive ? route.params.deliveredCount : deliveredCount}{' '}
                                </CText>
                            </View>
                        </View>
                    </View>
                    {(CommonParam.PERSONA__c === Persona.PSR || isPersonaUGMOrSDL()) &&
                        CommonParam.isATC &&
                        !isArchive && (
                            <ATCButton
                                btnStyle={styles.atcBtn}
                                onPressBtn={() => {
                                    navigation.navigate(NavigationRoute.CUSTOMER_CAROUSEL_DETAIL, {
                                        retailStore: route.params.retailStore,
                                        skuData: allSkus,
                                        prodLaunchTwoWks: mainSP,
                                        accessToken: accessToken,
                                        pageIndex: Index
                                    })
                                }}
                            />
                        )}
                    <View style={styles.productPickerWrap}>
                        <View style={styles.productPicker}>
                            <CText style={styles.productPickerLabel}>{t.labels.PBNA_MOBILE_IP_PRODUCT_DETAILS}</CText>
                            <PickerTile
                                cRef={pickRef}
                                data={filterLst}
                                label={''}
                                disabled={false}
                                defValue={filterMap[pickValue]}
                                placeholder={t.labels.PBNA_MOBILE_IP_SKUS_TO_ACTION}
                                noPaddingHorizontal
                                onDone={(v: any) => {
                                    setPickValue(filterLst.indexOf(v))
                                }}
                                containerStyle={styles.pickerContainer}
                                pickContainerStyle={styles.pickContainer}
                                required={false}
                                borderStyle={{}}
                                modalStyle={styles.modalStyle}
                                title={t.labels.PBNA_MOBILE_IP_SELECT_YOUR_VIEW}
                                filterNumber={skuLength + ''}
                            />
                        </View>
                    </View>
                </View>
            )
        }

        const sellingItem = isFromPriorityArchive ? sellingData[Index] : sellingDataList[Index]

        return (
            <View>
                <View style={{ position: 'absolute', right: 22, top: 10, zIndex: 9999 }}>
                    {retailStore && storePriority && sellingItem && (
                        <PriorityProductMenu
                            retailStoreId={retailStore.Id}
                            priority={sellingItem}
                            storePriority={storePriority}
                        />
                    )}
                </View>
                <View style={[styles.productImg, styles.addMarginBottom]}>{renderImage()}</View>
                {renderCardTitle(sellingItem, isSelling)}
                {renderCardTitleLine3(sellingItem)}
                {renderStartAndEndDate(sellingItem, isSelling)}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View>{renderDaysToEndView(sellingItem, storePriority?.is_executed__c === '1')}</View>
                    {storePriority?.Status__c === 'No Sale' &&
                        storePriority?.is_executed__c !== '1' &&
                        !_.isNil(storePriority?.Date_NoSale__c) && (
                            <>
                                <CText style={{ fontSize: 12, color: '#565656' }}>{' | '}</CText>
                                <CText style={{ fontSize: 12, color: '#565656' }}>
                                    {moment(storePriority?.Date_NoSale__c).format(TIME_FORMAT.SCHEDULE_DATE_FORMAT)}
                                </CText>
                                <Image source={ImageSrc.ICON_NO_SALE} style={styles.noSaleIcon} />
                            </>
                        )}
                </View>
                {/* buttons: EXECUTE / VIEW EXECUTION / ADD TO CART */}
                <View style={styles.buttonsContainer}>
                    <View style={[styles.flex1, styles.marginRight15]}>
                        {sellingItem.Priority_Status__c === 'Publish' && storePriority?.is_executed__c === '1' ? (
                            <PriorityExecutionPicturesView storePriorityId={storePriority.Id} />
                        ) : (
                            renderExecuteBorderedButton(
                                sellingItem,
                                retailStore.Id,
                                onDetailClickExecute,
                                setRefreshFlag,
                                isFromPriorityArchive && storePriority?.is_executed__c === '1'
                            )
                        )}
                    </View>
                    <View style={styles.flex1}>{renderAddToCartButton(navigateToCart)}</View>
                </View>
                {renderLastModifiedInfo(sellingItem)}
                {renderDocumentList(sellingItem)}
            </View>
        )
    }

    const renderItem = (data: any, rowMap: any) => {
        if (!isSelling) {
            return (
                <SwipeRow
                    disableLeftSwipe={disableLeftSwipe(data.item['Product.ProductCode'])}
                    rightOpenValue={-218}
                    closeOnRowPress
                    disableRightSwipe
                    recalculateHiddenLayout
                >
                    <View style={styles.swipeRowWrap}>
                        <TouchableOpacity
                            style={[
                                styles.swipeRowBtn,
                                {
                                    backgroundColor: renderLeftColor(data.item.Status__c),
                                    right: 98
                                }
                            ]}
                            onPress={() => {
                                handleLeftButton(data.item)
                                closeRow(rowMap, data.item['Product.ProductCode'])
                            }}
                        >
                            <CText style={[styles.swipeRowBtnText, renderLeftTitleColor(data.item.Status__c)]}>
                                {renderLeftLabel(data.item.Status__c)}
                            </CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.swipeRowBtn,
                                {
                                    backgroundColor: renderRightColor(data.item.Status__c),
                                    right: 0
                                }
                            ]}
                            onPress={() => {
                                updateStoreProductStatus(data.item)
                                closeRow(rowMap, data.item['Product.ProductCode'])
                            }}
                        >
                            <CText style={[styles.swipeRowBtnText, renderRightTitleColor(data.item.Status__c)]}>
                                {renderRightLabel(data.item.Status__c)}
                            </CText>
                        </TouchableOpacity>
                    </View>
                    <InnovationProductSkuItem
                        key={data.item.Id}
                        item={data.item}
                        accessToken={accessToken}
                        spStatus={spStatus}
                        onPress={handlePressUPC}
                    />
                </SwipeRow>
            )
        }
        return <View />
    }

    const renderListFooter = () => {
        if (!isSelling) {
            return (
                <View>
                    {skuLength === 0 && (
                        <View style={styles.emptyListPlaceholder}>
                            <Image
                                style={styles.emptyImg}
                                source={require('../../../../../../assets/image/icon_no_sku_items.png')}
                            />
                            <CText style={styles.emptyLabel}>{t.labels.PBNA_MOBILE_IP_NO_SKU}</CText>
                            <View style={styles.emptyMsgWrap}>
                                <CText style={styles.emptyMsg}>{t.labels.PBNA_MOBILE_IP_NO_SKU_MSG}</CText>
                            </View>
                        </View>
                    )}
                    <View style={styles.footerWrap}>
                        <TouchableOpacity style={commonStyle.flexRowAlignCenter}>
                            <Image
                                style={styles.footerIcon}
                                source={require('../../../../../../assets/image/ios-doc.png')}
                            />
                            <CText style={[styles.generalText, { color: '#00A2D9' }]}>
                                {t.labels.PBNA_MOBILE_IP_LOOK_OF_SUCCESS}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        return (
            <CollapseContainer
                showContent={showPriorityProductAttributeList}
                setShowContent={setShowPriorityProductAttributeList}
                title={t.labels.PBNA_MOBILE_IP_PRODUCT_DETAILS}
                containerStyle={styles.priorityProductsCollContainer}
                chevronStyle={styles.priorityProductsChevronStyle}
                noTopLine
                noBottomLine
            >
                {isWarnQty && (
                    <View style={{ position: 'absolute', marginLeft: 22, marginTop: 10 }}>
                        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                            <Image style={{ width: 15, height: 15 }} source={ImageSrc.ICON_WARNING_RND_BG_Y_FG_B} />
                            <CText style={{ marginLeft: 5, fontSize: 12 }}>
                                {t.labels.PBNA_MOBILE_PUSHED_QTY_COMPARISON}
                            </CText>
                        </View>
                    </View>
                )}
                <PickerTile
                    data={[t.labels.PBNA_MOBILE_ALL]}
                    label={''}
                    disabled
                    defValue={'All'}
                    placeholder={''}
                    noPaddingHorizontal
                    containerStyle={styles.priorityProductsPickerContainer}
                    required={false}
                    borderStyle={{}}
                    modalStyle={styles.modalStyle}
                    title={''}
                />
                <PriorityProductAttributeList
                    paItems={paItems || []}
                    retailStore={retailStore}
                    needAuthProducts={needAuthProducts}
                    celsiusPriority={celsiusPriority}
                />
            </CollapseContainer>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* prev/next navigation buttons */}
            <InnovationProductHeader navigation={navigation} retailStore={retailStore} />
            <View style={styles.prevNextContainer}>
                <TouchableOpacity
                    disabled={navFlag || Index === 0 || isArchive}
                    onPress={() => {
                        if (Index - 1 === NUMBER_OF_BREAK_CARD && !isSelling) {
                            setIndex((IndexPre) => IndexPre - 2)
                        } else {
                            setIndex((IndexPre) => IndexPre - 1)
                        }
                    }}
                    hitSlop={{
                        left: 30,
                        right: 30,
                        top: 30,
                        bottom: 30
                    }}
                >
                    <View style={commonStyle.flexRowAlignCenter}>
                        <View
                            style={[
                                styles.iconToPREV,
                                {
                                    borderColor: Index !== 0 && !navFlag ? '#00A2D9' : '#D3D3D3',
                                    marginRight: 6
                                }
                            ]}
                        />
                        <CText style={[styles.generalText, { color: Index !== 0 && !navFlag ? '#00A2D9' : '#D3D3D3' }]}>
                            {t.labels.PBNA_MOBILE_IP_PREV}
                        </CText>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={navFlag || isArchive || Index === lastCarouselIndex()}
                    onPress={() => {
                        if (isLimit && Index > 3) {
                            return
                        }
                        if (Index + 1 === NUMBER_OF_BREAK_CARD && !isSelling) {
                            setIndex((IndexPre) => IndexPre + 2)
                        } else {
                            setIndex((IndexPre) => IndexPre + 1)
                        }
                    }}
                    hitSlop={{
                        left: 30,
                        right: 30,
                        top: 30,
                        bottom: 30
                    }}
                    style={commonStyle.flexRowJustifyEnd}
                >
                    <View style={commonStyle.flexRowAlignCenter}>
                        <CText
                            style={[
                                styles.generalText,
                                {
                                    color:
                                        Index !== lastCarouselIndex() && !isArchive && !navFlag ? '#00A2D9' : '#D3D3D3'
                                }
                            ]}
                        >
                            {t.labels.PBNA_MOBILE_IP_NEXT}
                        </CText>
                        <View
                            style={[
                                styles.iconToNext,
                                {
                                    borderColor:
                                        Index !== lastCarouselIndex() && !isArchive && !navFlag ? '#00A2D9' : '#D3D3D3',
                                    marginLeft: 1
                                }
                            ]}
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.swipeListWrap}>
                <SwipeListView
                    data={skuData || sellingDataList}
                    keyExtractor={(data: any) => {
                        return data?.['Product.ProductCode'] ? data?.['Product.ProductCode'] : data.Id
                    }}
                    ListHeaderComponent={renderListHeader()}
                    renderItem={renderItem}
                    ListFooterComponent={renderListFooter()}
                />
            </View>
            <Modalize ref={modalizeRef} adjustToContentHeight handlePosition="inside" handleStyle={styles.modalHandle}>
                <InnovaProdSnoozeForm
                    accessToken={accessToken}
                    spStatus={spStatus}
                    snoozeItem={snoozeItem}
                    onClose={() => onClose()}
                    retailStore={route.params.retailStore}
                    setCount={() => setCount((prevCount) => prevCount + 1)}
                />
            </Modalize>
            <Modal isVisible={upcVisible} backdropOpacity={0.2} coverScreen animationIn="fadeIn" animationOut="fadeOut">
                <View style={[commonStyle.flexRowCenter, commonStyle.flex_1]}>
                    <View style={styles.upcModalContent}>
                        <View style={styles.upcModalInfo}>
                            <CText style={styles.upcModalLabel}>{t.labels.PBNA_MOBILE_IP_UPC_TITLE}</CText>
                            <View>{renderUpcImg()}</View>
                            <CText style={[styles.upcText, styles.marginTop20]}>
                                {t.labels.PBNA_MOBILE_UPC + ' ' + upcCode}
                            </CText>
                            <CText style={styles.upcText}>{t.labels.PBNA_MOBILE_INVEN_ID + ' ' + invenId}</CText>
                            {!upcAvailable && (
                                <View style={styles.upcUnavailableWrap}>
                                    <CText style={styles.upcUnavailableText}>
                                        {t.labels.PBNA_MOBILE_IP_UPC_PRODUCT_UNAVAILABLE}
                                    </CText>
                                </View>
                            )}
                        </View>
                        <View style={styles.upcModalBtn}>
                            <Button
                                onPress={() => {
                                    setUpcVisible(false)
                                }}
                                title={t.labels.PBNA_MOBILE_OK}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <SuccessModal successModalText={successMessage} />
            <Loading isLoading={isSalesDocsDownLoading || isLoadingProducts} />
        </SafeAreaView>
    )
}

export default InnovationProductDetail
