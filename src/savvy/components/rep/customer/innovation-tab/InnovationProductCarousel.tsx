/**
 * @description Component to show Innovation Product.
 * @author Qiulin Deng
 * @date 2021-09-14
 * @Lase
 */

import React, { useEffect, useRef, useState } from 'react'
import { Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import InnovationProductTile from './InnovationProductTile'
import { CommonParam } from '../../../../../common/CommonParam'
import { Persona, isPersonaKAM, isPersonaPSR, isPersonaSDL, isPersonaUGM } from '../../../../../common/enums/Persona'
import CText from '../../../../../common/components/CText'
import Carousel from '../../../common/carousel'
import moment from 'moment'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { carouselDisplayedFilter, checkStoreProductOrder } from '../../../../helper/rep/InnovationProductHelper'
import { Instrumentation } from '@appdynamics/react-native-agent'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getGTINsMap, getProductGTINs } from '../../../../utils/InnovationProductUtils'
import TabBar from '../../../common/TabBar'
import SellingCarousel, { useProductCarouselTabs } from './SellingCarousel'
import { CommonActions, useIsFocused, useRoute } from '@react-navigation/native'
import { Dialog } from 'react-native-elements'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectPrioritiesNoSaleControl,
    selectRedirectAction,
    setPriorityNoSaleControl,
    setRedirectAction
} from '../../../../redux/Slice/CustomerDetailSlice'
import { usePrevious } from '../../../../hooks/CommonHooks'
import { NavigateToArchivedPriority } from './NavigateToArchivedPriority'
import { ATCSuccessHandler } from './ATCSuccessHandler'

const { width } = Dimensions.get('window')
const numberOfDaysAhead = 14
const carouselCardContainerMargin = 80

interface InnovationProductCarouselProps {
    data: any
    accessToken: any
    navigation: any
    isLoading: boolean
    retailStore: any
    isGoBackToCustomer?: any
    updateCarousel: Function
    showInitLoadingIndicator: boolean
    returnFromDetail: boolean
    setReturnFromDetail: Function
    carouselTab?: string
    carouselSelling?: any
    storePriorities?: any[]
    onClickExecute?: Function
    archivedPriorities?: any
    prioritiesTabReady?: boolean
    priorityIndex?: number
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        minHeight: 135,
        backgroundColor: '#000000'
    },
    prodImageSize: {
        height: 30,
        width: 30,
        marginRight: 5
    },
    loadingImageSize: {
        height: 100,
        width: 100
    },
    noProdContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        width: '90%',
        backgroundColor: '#FFFFFF',
        paddingRight: 60,
        marginTop: 20
    },
    hitSlop: {
        top: 40,
        right: 50,
        bottom: 50,
        left: 50
    },
    archiveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 3
    },
    loadCon: {
        backgroundColor: '#000000',
        height: 545,
        marginTop: 150
    },
    loadImg: {
        height: 100,
        width: 100
    },
    pageStyle: {
        height: '90%',
        marginTop: 35,
        paddingBottom: 20
    },
    successView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 12,
        width: '100%'
    },
    successImg: {
        height: 33,
        width: 33
    },
    successTitle: {
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '400'
    },
    noAuthV: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 15
    },
    noAuthT: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: '400'
    },
    outLineV: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: '1.5%'
    },
    outLineImg: {
        height: 13,
        width: 10,
        marginRight: 8,
        marginLeft: 8
    },
    ipText: {
        fontSize: 14,
        marginRight: '46%',
        fontWeight: '700',
        color: '#ffffff',
        textTransform: 'uppercase'
    },
    ipAchieveT: {
        fontSize: 14,
        marginRight: '5%',
        fontWeight: '700',
        color: '#00A2D9',
        textTransform: 'uppercase'
    },
    guidBg: {
        backgroundColor: 'transparent',
        height: 486,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    guideCon: {
        borderColor: '#F2F4F7',
        backgroundColor: '#F2F4F7',
        borderRadius: 6,
        height: 412,
        width: '100%',
        alignItems: 'center'
    },
    guideImg: {
        width: 118,
        height: 170,
        marginTop: 68
    },
    guideT: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginTop: 20,
        textAlign: 'center'
    },
    guideBtnT: {
        fontSize: 12,
        fontWeight: '700',
        color: '#28BEF0',
        marginTop: 50,
        textAlign: 'center'
    },
    btnGray: {
        color: '#565656'
    },
    archiveMsgContainer: {
        backgroundColor: '#000000',
        height: 486,
        marginTop: 20,
        marginBottom: 43,
        width: '100%'
    },
    archiveMsgCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 22,
        height: '100%',
        borderRadius: 6,
        alignItems: 'center'
    },
    archiveMsgTitleFont: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        marginTop: 31
    },
    archiveMsgFont: {
        fontSize: 14,
        lineHeight: 20,
        color: '#565656',
        textAlign: 'center'
    },
    archiveMsgImg: {
        height: 101,
        width: 110,
        marginTop: 99
    },
    tabV: {
        width: '65%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    clockImgRight: {
        marginRight: 15,
        height: 26,
        width: 28
    },
    carouselBg: {
        height: '75%',
        marginTop: 30,
        width: '100%',
        marginBottom: 30,
        flex: 1
    }
})

enum GuideFlag {
    EMPTY_FLAG = 0,
    MORE_FLAG = 1,
    NO_MORE_FLAG = 2
}

export const renderEmptyDataText = (tab: string) => {
    const text =
        tab !== t.labels.PBNA_MOBILE_PRIORITIES
            ? t.labels.PBNA_MOBILE_IP_ERROR_INNOVATION_PRODUCT_NOT_AUTHORIZED
            : t.labels.PBNA_MOBILE_NO_PUBLISHED_PRIORITIES
    return (
        <View style={styles.noProdContainer}>
            <View style={styles.noAuthV}>
                <Image
                    style={styles.prodImageSize}
                    source={require('../../../../../../assets/image/icon-warning-yellow.png')}
                />
                <CText style={styles.noAuthT}>{text}</CText>
            </View>
        </View>
    )
}

export const renderAllArchivedMessageText = (tab: string) => {
    const TEXT =
        tab !== t.labels.PBNA_MOBILE_PRIORITIES
            ? t.labels.PBNA_MOBILE_IP_ALL_ITEMS_ARCHIVED_MSG_1
            : t.labels.PBNA_MOBILE_PRIORITIES_ALL_ARCHIVED_MESSAGE
    return (
        <View style={styles.archiveMsgContainer}>
            <View style={styles.archiveMsgCard}>
                <Image source={ImageSrc.IMG_ITEMS_ARCHIVED} style={styles.archiveMsgImg} />
                <CText style={styles.archiveMsgTitleFont}>{t.labels.PBNA_MOBILE_IP_ALL_ITEMS_ARCHIVED}</CText>
                <CText style={[styles.archiveMsgFont, { marginTop: 15, paddingHorizontal: 30 }]}>{TEXT}</CText>
                <CText style={[styles.archiveMsgFont, { marginTop: 20, width: '90%' }]}>
                    {t.labels.PBNA_MOBILE_IP_ALL_ITEMS_ARCHIVED_MSG_2}
                </CText>
            </View>
        </View>
    )
}

const InnovationProductCarousel = (props: InnovationProductCarouselProps) => {
    const route = useRoute<any>()
    const currentPageNumber = useRef(0)
    const carouselRef = useRef(null)
    const [spStatus, setSpStatus] = useState({})
    const [isReady, setIsReady] = useState(false)
    const timeRange = (item) => {
        const numberOfDays = moment(item['Product.National_Launch_Date__c']).diff(moment().format('YYYY-MM-DD'), 'days')
        return numberOfDays <= numberOfDaysAhead
    }
    // const [carouselData, setCarouselData] = useState(props.data.filter(timeRange))
    const [carouselDisplayed, setCarouselDisplayed] = useState([])
    const [carouselInArchive, setCarouselInArchive] = useState([])
    const [carouselValid, setCarouselValid] = useState([])
    const [isLimit, setIsLimit] = useState(true)
    const indexOfBreakCard = 5
    const [archivePopMsg, setArchivePopMsg] = useState(false)
    const [redirectCarousel, setRedirectCarousel] = useState(false)
    const tabBarRef = useRef(null)
    const [activeTab, setActiveTab] = useState(props.carouselTab)
    const tabs = useProductCarouselTabs()
    const [sellingData, setSellingData] = useState(props.carouselSelling || [])
    const [archivedPriorities, setArchivedPriorities] = useState(props?.archivedPriorities || [])
    const [isPrioritiesTabReady, setIsPrioritiesTabReady] = useState<boolean>(false)
    const [displayedCarouselIndex, setDisplayedCarouselIndex] = useState<any>(props?.priorityIndex || null)
    const isFocused = useIsFocused()
    const dispatch = useDispatch()

    const [navigateToArchivedPriority, setNavigateToArchivedPriority] = useState(0)

    const [hadShowPopUp, setHadShowPopUp] = useState(false)
    const setCurrentPageNumber = (v) => {
        currentPageNumber.current = v
    }
    const getCarouselDisplayed = (allDisplayData: any, limitStatus: boolean) => {
        if (allDisplayData.length > 5 && limitStatus) {
            const limitFive = allDisplayData.slice(0, 5)
            limitFive.push({ guidePageFlag: GuideFlag.MORE_FLAG })
            setCarouselDisplayed(limitFive)
        } else if (allDisplayData.length > 5 && !limitStatus) {
            const combFlagData = [...allDisplayData]
            combFlagData.splice(5, 0, { guidePageFlag: GuideFlag.MORE_FLAG })
            combFlagData.push({ guidePageFlag: GuideFlag.NO_MORE_FLAG })
            setCarouselDisplayed(combFlagData)
        } else {
            setCarouselDisplayed(allDisplayData)
        }
    }
    const previousData = usePrevious(sellingData)
    const dataChange = !_.isEqual(previousData, props.carouselSelling)
    const [correctPriorityIndex, setCorrectPriorityIndex] = useState<any>()

    const setRouteParamsEmpty = () => {
        props.navigation.dispatch({
            ...CommonActions.setParams({
                ...route.params,
                actionType: '',
                actionData: {},
                pushToSMARTrMessageTitle: '',
                storePriorityStartDate: '',
                isFromPushToSMARTr: false
            }),
            source: route.key
        })
    }

    // --BEGIN-- landing on invalid priority card for Archived / No Sale #12148365
    useEffect(() => {
        if (!isFocused) {
            // reset CorrectPriorityIndex once the pages in background
            setCorrectPriorityIndex(null)
        }
    }, [isFocused])

    // setDisplayedCarouselIndex
    const redirectAction = useSelector(selectRedirectAction)
    useEffect(() => {
        if (isFocused && redirectAction.showPriorityInCarousel) {
            const showPriorityId = redirectAction.showPriorityInCarousel
            const showPriorityIndex = sellingData.findIndex((item: { Id: string }) => item.Id === showPriorityId)
            if (showPriorityIndex >= 0) {
                // reset the redirectAction's state in case of rerendering
                dispatch(setRedirectAction({ type: 'showPriorityInCarousel', data: null }))
                setDisplayedCarouselIndex(showPriorityIndex)
            }
        }
    }, [isFocused, redirectAction.showPriorityInCarousel, sellingData])
    // ---END--- landing on invalid priority card for Archived / No Sale #12148365

    useEffect(() => {
        setCorrectPriorityIndex(displayedCarouselIndex)
    }, [dataChange, displayedCarouselIndex])

    const handleMsgDisplay = () => {
        setArchivePopMsg(true)
    }

    const handleGoBack = (pageNumber: number) => {
        props.setReturnFromDetail(true)
        setCurrentPageNumber(pageNumber)
    }

    const handleArchivePopMsg = (spStatus: any, cardInfo: any, prodInfo: any) => {
        setHadShowPopUp(true)
        if (spStatus[cardInfo['Product.ProductCode']]) {
            let status
            if (spStatus[prodInfo.Id]?.isDelivered) {
                status = t.labels.PBNA_MOBILE_IP_DELIVERED
            } else {
                status = spStatus[prodInfo.Id]?.status
            }
            Alert.alert(
                t.labels.PBNA_MOBILE_ARCHIVED_SKU,
                `${t.labels.PBNA_MOBILE_SKU_ALERT_CONTENT_LEFT} ${status} ${t.labels.PBNA_MOBILE_SKU_ALERT_CONTENT_RIGHT}`,
                [
                    { text: t.labels.PBNA_MOBILE_OK },
                    {
                        text: t.labels.PBNA_MOBILE_TAKE_ME_TO_ARCHIVED,
                        onPress: () => {
                            setRouteParamsEmpty()
                            props.navigation.navigate('InnovationProductArchiveDetail', {
                                retailStore: props.retailStore,
                                accessToken: props.accessToken,
                                updateCarousel: () => props.updateCarousel(),
                                handleMsgDisplay: () => handleMsgDisplay(),
                                handleGoBack: (v) => handleGoBack(v),
                                setReturnFromDetail: props.setReturnFromDetail,
                                onClickExecute: props.onClickExecute,
                                cardInfo: cardInfo,
                                navFlag: true,
                                tab: t.labels.PBNA_MOBILE_IP_INNOVATION.toUpperCase()
                            })
                        }
                    }
                ]
            )
        }
    }

    const searchCarouselCard = (prodInfo, cardCarousel, cardArchive, storeProductStatus, allDisplayData) => {
        if (
            prodInfo.National_Launch_Date === '' &&
            prodInfo.Brand_Code__c === '' &&
            prodInfo.Sub_Brand_Code__c === ''
        ) {
            if (isLimit) {
                setCurrentPageNumber(0)
            } else {
                if (currentPageNumber.current === indexOfBreakCard) {
                    setCurrentPageNumber(indexOfBreakCard)
                } else {
                    setCurrentPageNumber(cardCarousel.length + 1)
                }
            }
        } else {
            let currentPageNum = -1
            let expandCarousel = false
            cardCarousel.forEach((v, index) => {
                if (
                    v['Product.National_Launch_Date__c'] === prodInfo.National_Launch_Date &&
                    !_.isEmpty(v['Product.Brand_Code__c']) &&
                    v['Product.Brand_Code__c'] === prodInfo.Brand_Code__c &&
                    !_.isEmpty(v['Product.Sub_Brand_Code__c']) &&
                    v['Product.Sub_Brand_Code__c'] === prodInfo.Sub_Brand_Code__c
                ) {
                    if (index >= indexOfBreakCard && isLimit) {
                        getCarouselDisplayed(allDisplayData, !isLimit)
                        setIsLimit(!isLimit)
                        expandCarousel = true
                        currentPageNum = index + 1
                    } else if (index >= indexOfBreakCard) {
                        currentPageNum = index + 1
                    } else {
                        currentPageNum = index
                    }
                }
            })
            if (
                currentPageNum === -1 &&
                !archivePopMsg &&
                props.isGoBackToCustomer &&
                (!redirectCarousel || !hadShowPopUp)
            ) {
                let cardInfo
                cardArchive.forEach((v) => {
                    if (
                        v['Product.National_Launch_Date__c'] === prodInfo.National_Launch_Date &&
                        !_.isEmpty(v['Product.Brand_Code__c']) &&
                        v['Product.Brand_Code__c'] === prodInfo.Brand_Code__c &&
                        !_.isEmpty(v['Product.Sub_Brand_Code__c']) &&
                        v['Product.Sub_Brand_Code__c'] === prodInfo.Sub_Brand_Code__c
                    ) {
                        cardInfo = v
                    }
                })
                if (cardInfo) {
                    handleArchivePopMsg(storeProductStatus, cardInfo, prodInfo)
                }
                setArchivePopMsg(true)
                setRedirectCarousel(true)
                setCurrentPageNumber(0)
            } else if (currentPageNum === -1 || (currentPageNum === 0 && redirectCarousel)) {
                setCurrentPageNumber(0)
            } else {
                setCurrentPageNumber(currentPageNum)
                if ((expandCarousel || !archivePopMsg) && !redirectCarousel && props.isGoBackToCustomer) {
                    setRedirectCarousel(true)
                }
            }
        }
    }

    const handleSetTabBar = (tabName: string) => {
        setActiveTab(tabName)
        const defaultTabName = tabName || t.labels.PBNA_MOBILE_IP_INNOVATION.toLocaleUpperCase()
        const defaultIndex = tabs.findIndex((i) => i.value === defaultTabName)
        tabBarRef.current.setActiveTab(defaultIndex)
    }

    useEffect(() => {
        props.carouselTab && handleSetTabBar(props.carouselTab)
    }, [props.carouselTab])

    useEffect(() => {
        setSellingData(props.carouselSelling)
        setArchivedPriorities(props.archivedPriorities)
    }, [props.carouselSelling, props.archivedPriorities])

    useEffect(() => {
        props.prioritiesTabReady && setIsPrioritiesTabReady(props.prioritiesTabReady)
    }, [props.prioritiesTabReady])

    useEffect(() => {
        if (!isFocused) {
            setHadShowPopUp(true)
        }
    }, [isFocused])

    useEffect(() => {
        let imgUrlData = {}
        AsyncStorage.getItem('GTIN_IMG_MAP').then((imgUrl) => {
            if (imgUrl) {
                imgUrlData = JSON.parse(imgUrl)
            }
        })
        if (props.data.length) {
            const timeRangeData = props.data.filter(timeRange)
            if (props.data[0].RetailStoreId) {
                const retailStoreId = props.data[0].RetailStoreId
                checkStoreProductOrder(JSON.stringify(retailStoreId)).then((storeProductStatus) => {
                    setSpStatus(storeProductStatus)
                    const allDisplayData = carouselDisplayedFilter(timeRangeData, storeProductStatus)
                    allDisplayData.cardCarousel.forEach((carouselData) => {
                        if (!carouselData.carouseUrl) {
                            const { GTINs, pkGTINs } = getProductGTINs(carouselData.skuItems)
                            getGTINsMap(GTINs, pkGTINs).then((res) => {
                                const GTIN = carouselData['Product.GTIN__c']
                                carouselData.carouseUrl = res[GTIN]
                                imgUrlData[GTIN] = res[GTIN]
                                AsyncStorage.setItem('GTIN_IMG_MAP', JSON.stringify(imgUrlData))
                            })
                        }
                    })
                    setCarouselValid(allDisplayData.cardCarousel)
                    setCarouselInArchive(allDisplayData.cardArchive)
                    getCarouselDisplayed(allDisplayData.cardCarousel, isLimit)
                    AsyncStorage.getItem('carousel_page', (err, data) => {
                        if (!err) {
                            const lastCarousel = JSON.parse(data)
                            if (
                                ((props.isGoBackToCustomer && !archivePopMsg) || !_.isEmpty(lastCarousel)) &&
                                props.data &&
                                props.data[0] !== -1
                            ) {
                                const prodInfo = lastCarousel || _.cloneDeep(props.isGoBackToCustomer.productInfo)
                                const launchLst = _.cloneDeep(props.data).filter(
                                    (item) =>
                                        moment(item['Product.National_Launch_Date__c']).diff(
                                            moment().format('YYYY-MM-DD'),
                                            'days'
                                        ) <= numberOfDaysAhead
                                )
                                const { cardCarousel, cardArchive } = carouselDisplayedFilter(
                                    launchLst,
                                    spStatus,
                                    storeProductStatus
                                )
                                searchCarouselCard(
                                    prodInfo,
                                    cardCarousel,
                                    cardArchive,
                                    storeProductStatus,
                                    allDisplayData.cardCarousel
                                )
                            }
                            setIsReady(true)
                        }
                    })
                })
            }
        } else {
            setCarouselDisplayed([])
            setCarouselInArchive([])
            setIsReady(true)
        }
        return () => {
            setIsReady(false)
        }
    }, [props.data])

    const pageSwipe = async (pageNumber: number, carousel: any) => {
        const sp = carousel[pageNumber]
        const param = {
            National_Launch_Date: sp['Product.National_Launch_Date__c'] || '',
            Sub_Brand_Code__c: sp['Product.Sub_Brand_Code__c'] || '',
            Brand_Code__c: sp['Product.Brand_Code__c'] || ''
        }
        await AsyncStorage.setItem('carousel_page', JSON.stringify(param))
    }

    const onPressOfGuideCard = (guideFlag: number) => {
        if (!isLimit && guideFlag === GuideFlag.MORE_FLAG) {
            return
        }
        const swipeNum = isLimit ? indexOfBreakCard + 1 : 0
        setCurrentPageNumber(swipeNum)
        getCarouselDisplayed(carouselValid, !isLimit)
        setTimeout(() => {
            carouselRef?.current?._snapToItem(swipeNum, false, true, true)
        }, 50)
        setIsLimit(!isLimit)
    }

    const renderGuideCard = (guideFlag: number) => {
        let title = ''
        let btnTitle = ''
        if (guideFlag === GuideFlag.MORE_FLAG) {
            title = `${carouselValid.length - 5}
${t.labels.PBNA_MOBILE_CAROUSEL_MORE}
${t.labels.PBNA_MOBILE_CAROUSEL_CARDS}`
            btnTitle = t.labels.PBNA_MOBILE_VIEW_ALL.toLocaleUpperCase()
        } else if (guideFlag === GuideFlag.NO_MORE_FLAG) {
            title = `${t.labels.PBNA_MOBILE_NO}
${t.labels.PBNA_MOBILE_CAROUSEL_MORE}
${t.labels.PBNA_MOBILE_CAROUSEL_CARDS}`
            btnTitle = t.labels.PBNA_MOBILE_CAROUSEL_BACK_FIVE
        }
        return (
            <View style={styles.guidBg}>
                <View style={styles.guideCon}>
                    <Image style={styles.guideImg} resizeMode={'stretch'} source={ImageSrc.IMG_CAROUSEL_GUIDE} />
                    <CText style={styles.guideT}>{title}</CText>
                    <TouchableOpacity
                        onPress={() => {
                            onPressOfGuideCard(guideFlag)
                        }}
                    >
                        <CText
                            style={[styles.guideBtnT, !isLimit && guideFlag === GuideFlag.MORE_FLAG && styles.btnGray]}
                        >
                            {btnTitle}
                        </CText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const [showNoSaleMessage, setShowNoSaleMessage] = useState(false)

    useEffect(() => {
        if (showNoSaleMessage) {
            const h = setTimeout(() => setShowNoSaleMessage(false), 3000)
            return () => clearTimeout(h)
        }
    }, [showNoSaleMessage])

    // deal with redirect page --BEGIN--
    useEffect(() => {
        if (isFocused && redirectAction.goToArchive) {
            dispatch(setRedirectAction({ type: 'goToArchive', data: null }))
            // jump to archived priority page
            setNavigateToArchivedPriority(new Date().valueOf())
        }
    }, [isFocused, redirectAction.goToArchive])
    // deal with redirect page --END--

    // read current index of priority, and display the next one if there is one
    const noSaleControl = useSelector(selectPrioritiesNoSaleControl)

    useEffect(() => {
        const { actionType, actionData } = route.params as unknown as { actionType: string; actionData: any }

        if (isFocused && actionType) {
            if (sellingData.length > 0) {
                const oldIndex = sellingData.findIndex((item: any) => item.Id === actionData.priority?.Id)

                if (actionType === 'priorityNoSale') {
                    if (oldIndex !== -1 && sellingData[oldIndex] && !noSaleControl[actionData.priority?.Id]) {
                        // skip to the next one
                        setDisplayedCarouselIndex(oldIndex)
                        // render message
                        setShowNoSaleMessage(true)
                        // reset control
                        dispatch(setPriorityNoSaleControl({ id: actionData.priority?.Id, visited: true }))
                    }
                } else if (actionType === 'atcSuccess') {
                    if (oldIndex !== -1) {
                        // jump to the next one
                        setDisplayedCarouselIndex(oldIndex)
                    }
                }
            }
        }
    }, [isFocused, route.params?.actionType, route.params?.actionData, JSON.stringify(sellingData)])

    const renderNoSaleMessage = () => {
        const { actionType, actionData } = route.params

        if (actionType === 'priorityNoSale') {
            return (
                <Dialog isVisible>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={ImageSrc.IMG_ITEMS_ARCHIVED}
                            style={{ width: 53, height: 48, marginVertical: 22 }}
                        />
                        <CText style={{ fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                            {t.labels.PBNA_MOBILE_PRIORITY_NO_SALED}
                        </CText>
                        <CText style={{ fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                            {t.labels.PBNA_MOBILE_PRIORITY_HAS_BEEN_MOVED_TO_ARCHIVE.replaceAll(
                                '{title}',
                                actionData.priority.Card_Title__c
                            )}
                        </CText>
                    </View>
                </Dialog>
            )
        }

        return null
    }

    const renderLaunchTwoWks = () => {
        if (
            props.data[0] === -1 ||
            (!isReady && props.returnFromDetail) ||
            (!isReady && props.showInitLoadingIndicator)
        ) {
            return <View style={styles.loadCon} />
        }
        if (carouselDisplayed.length) {
            const renderCarouselTile = ({ item, index }: { item: any; index: number }) => {
                if (item?.guidePageFlag) {
                    return renderGuideCard(item?.guidePageFlag)
                }
                return (
                    <InnovationProductTile
                        navigation={props.navigation}
                        item={item}
                        index={index + 1}
                        prodSize={carouselValid.length}
                        key={item.Id}
                        accessToken={props.accessToken}
                        retailStore={props.retailStore}
                        prodLaunchTwoWks={carouselDisplayed}
                        onTileGoBack={handleGoBack}
                        spStatus={spStatus}
                        updateCarousel={() => props.updateCarousel()}
                        isLimit={isLimit}
                        isGoBackToCustomer={props.isGoBackToCustomer}
                    />
                )
            }
            return (
                <View style={styles.carouselBg}>
                    <View>
                        <Carousel
                            ref={carouselRef}
                            horizontal
                            activeSlideOffset={10}
                            sliderWidth={width}
                            itemWidth={width - carouselCardContainerMargin}
                            firstItem={currentPageNumber.current}
                            initialScrollIndex={currentPageNumber.current}
                            decelerationRate={'normal'}
                            enableSnap
                            inactiveSlideScale={0.9}
                            onSnapToItem={async (slideIndex) => {
                                setCurrentPageNumber(slideIndex)
                                Instrumentation.reportMetric('PSR Swipes On Carousel Card', 1)
                                await pageSwipe(slideIndex, carouselDisplayed)
                            }}
                            data={carouselDisplayed}
                            renderItem={renderCarouselTile}
                        />
                    </View>
                </View>
            )
        } else if (carouselDisplayed.length === 0 && carouselInArchive.length > 0) {
            return renderAllArchivedMessageText(t.labels.PBNA_MOBILE_IP_INNOVATION)
        }
        return renderEmptyDataText(t.labels.PBNA_MOBILE_IP_INNOVATION)
    }

    const navigateToArchivedPriorityProps =
        props.retailStore &&
        props.accessToken &&
        props.updateCarousel &&
        props.setReturnFromDetail &&
        props.onClickExecute &&
        activeTab
            ? {
                  retailStore: props.retailStore,
                  accessToken: props.accessToken,
                  updateCarousel: props.updateCarousel,
                  setReturnFromDetail: props.setReturnFromDetail,
                  onClickExecute: props.onClickExecute,
                  activeTab
              }
            : null

    const renderPrioritiesTabData = () => {
        if (
            !isPrioritiesTabReady ||
            (props.isLoading &&
                displayedCarouselIndex !== null &&
                !route.params?.actionType &&
                _.isEmpty(route.params?.actionData))
        ) {
            return <View style={styles.loadCon} />
        }
        return (
            <SellingCarousel
                isLoading={props.isLoading}
                navigation={props.navigation}
                carouselSelling={sellingData}
                storePriorities={props.storePriorities}
                accessToken={props.accessToken}
                retailStore={props.retailStore}
                onClickExecute={props.onClickExecute}
                handleGoBack={handleGoBack}
                currentPageNumber={currentPageNumber}
                setCurrentPageNumber={setCurrentPageNumber}
                archivedPriorities={archivedPriorities}
                correctPriorityIndex={correctPriorityIndex}
                updateCarousel={props.updateCarousel}
                setReturnFromDetail={props.setReturnFromDetail}
                setRouteParamsEmpty={setRouteParamsEmpty}
            />
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.outLineV}>
                <View style={styles.tabV}>
                    <Image
                        source={require('../../../../../../assets/image/icon_savvy_outlined_light.png')}
                        style={styles.outLineImg}
                    />
                    <TabBar
                        cRef={tabBarRef}
                        tabs={tabs}
                        setActiveSection={(k, v) => {
                            setActiveTab(v.value)
                            setCurrentPageNumber(0)
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.archiveButton}
                    onPress={() => {
                        props.setReturnFromDetail(false)
                        setRouteParamsEmpty()
                        props.navigation.navigate('InnovationProductArchiveDetail', {
                            retailStore: props.retailStore,
                            accessToken: props.accessToken,
                            updateCarousel: () => props.updateCarousel(),
                            setReturnFromDetail: props.setReturnFromDetail,
                            onClickExecute: props.onClickExecute,
                            tab: activeTab,
                            setRetrievedDataIndex: (v: number) => setDisplayedCarouselIndex(v)
                        })
                    }}
                    disabled={
                        activeTab === t.labels.PBNA_MOBILE_PRIORITIES
                            ? !(isPersonaPSR() || isPersonaKAM() || isPersonaSDL() || isPersonaUGM()) &&
                              isPrioritiesTabReady
                            : CommonParam.PERSONA__c !== Persona.PSR && !isReady
                    }
                >
                    <Image source={ImageSrc.IMG_ARCHIVE_CLOCK} style={styles.clockImgRight} />
                </TouchableOpacity>
            </View>
            {activeTab !== t.labels.PBNA_MOBILE_PRIORITIES && renderLaunchTwoWks()}
            {activeTab === t.labels.PBNA_MOBILE_PRIORITIES && renderPrioritiesTabData()}
            {showNoSaleMessage && renderNoSaleMessage()}
            {navigateToArchivedPriorityProps && (
                <NavigateToArchivedPriority
                    {...navigateToArchivedPriorityProps}
                    isRedirect={navigateToArchivedPriority}
                />
            )}
            <ATCSuccessHandler onGoToArchive={() => setNavigateToArchivedPriority(new Date().valueOf())} />
        </View>
    )
}

export default InnovationProductCarousel
