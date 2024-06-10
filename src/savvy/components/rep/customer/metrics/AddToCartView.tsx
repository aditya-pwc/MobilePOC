import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import { StyleSheet, TouchableOpacity, View, Image, TextInput, Dimensions, Alert } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { judgeCompositeSuccess, styles, renderBottomBar } from '../../../../pages/rep/atc/CustomerCarouselDetailScreen'
import CText from '../../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import moment from 'moment'
import Modal from 'react-native-modal'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SearchBar } from 'react-native-elements'
import { useMetricsDetailCustomer } from '../../../../hooks/InnovationProductHooks'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDebounce } from '../../../../hooks/CommonHooks'
import PickerTile from '../../lead/common/PickerTile'
import AddToCartCustomerList from './AddToCartCustomerList'
import _ from 'lodash'
import CCheckBox from '../../../../../common/components/CCheckBox'
import IconAlertSolid from '../../../../../../assets/image/icon-alert-solid.svg'
import {
    timeoutWrap,
    calculateNextOrderDay,
    assembleATCReq,
    assembleCacheForLaterReq,
    cacheForLaterATCDataHandler
} from '../../../../helper/rep/InnovationProductHelper'
import Loading from '../../../../../common/components/Loading'
import { OrderATCType } from '../../../../enums/ATCRecordTypes'
import { CommonParam } from '../../../../../common/CommonParam'
import { compositeCommonCall } from '../../../../api/SyncUtils'
import DatePickView from './AddToCartDatePickView'
import { CommonSyncRes } from '../../../../../common/interface/SyncInterface'
import { SoupService } from '../../../../service/SoupService'
import { getIdClause } from '../../../manager/helper/MerchManagerHelper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { DatePickerLocale } from '../../../../enums/i18n'
import { useDropDown } from '../../../../../common/contexts/DropdownContext'
import { Log } from '../../../../../common/enums/Log'
import { isPersonaPSR } from '../../../../../common/enums/Persona'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { getStringValue } from '../../../../utils/LandingUtils'

interface AddToCartProps {
    navigation: any
    route: any
}

interface AdjustQuantityViewProps {
    accessToken?: string
    imgCode?: string
    quantityContStyle?: any
    title?: string
    subTitle?: string
    defaultQtyNum?: string
    onChangeQtyNum?: Function
}

interface DateColumnProps {
    showBottomLine?: boolean
    title?: string
    selected?: boolean
    onSelect?: Function
}

interface Customer {
    startDate: string
    showDatePicker?: boolean
}

interface DatePickerCalendarProps {
    cRef: any
    onPickDate?: Function
    startDate?: string
    customer?: Customer
}

interface DebouncedSearchBarProps {
    onChange: Function
}

export const atcStyles = StyleSheet.create({
    containerView: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        display: 'flex'
    },
    headCont: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        paddingTop: 59,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        backgroundColor: '#ffffff'
    },
    titleCont: {
        flex: 1,
        alignItems: 'center',
        marginLeft: 36
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    closeImg: {
        height: 36,
        width: 36
    },
    prodStatusTitle: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        textAlign: 'center',
        marginTop: 35
    },
    quantityContain: {
        paddingHorizontal: 22,
        marginTop: 25
    },
    dateColumnCont: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        height: 60
    },
    columnBottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    circleDefault: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#565656'
    },
    circleSelect: {
        borderWidth: 5,
        borderColor: '#00A2D9'
    },
    dateColumnTitle: {
        marginLeft: 10,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.black
    },
    datePickCon: {
        marginTop: 10,
        justifyContent: 'space-between'
    },
    calendarCont: {
        backgroundColor: baseStyle.color.white,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2
    },
    body: {
        flex: 1,
        display: 'flex'
    },
    searchBarWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 19,
        marginBottom: 3,
        paddingHorizontal: '5%'
    },
    searchBarInnerContainer: {
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    quickFilterContainer: {
        paddingHorizontal: '5%',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 2,
        flexDirection: 'row',
        marginTop: 10
    },
    placeholderColor: {
        color: '#565656'
    },
    customerList: {
        flex: 1
    },
    listHeader: {
        display: 'flex',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    mainAlertTextContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    alertText: {
        color: '#ea455b',
        paddingLeft: 20,
        paddingBottom: 15,
        marginTop: -3,
        textAlign: 'left',
        fontSize: 14
    },
    topPart: {
        backgroundColor: '#ffffff'
    },
    selectAll: {
        backgroundColor: 'transparent',
        marginLeft: 0,
        minWidth: '23%'
    }
})

const filterOptionsMap = () => {
    return {
        [t.labels.PBNA_MOBILE_ATC_ALL_AUTH]: 'volIds',
        [t.labels.PBNA_MOBILE_ATC_VOID]: 'voidWTDIds',
        [t.labels.PBNA_MOBILE_ATC_11_WEEKS_0_CS]: 'wksIds',
        [t.labels.PBNA_MOBILE_ATC_NO_ORDER_DAYS]: 'noOrderDays'
    }
}

const { width } = Dimensions.get('window')

const AdjustQuantityView = (props: AdjustQuantityViewProps) => {
    const inputRef = useRef(null)
    const { accessToken, imgCode, quantityContStyle, title, subTitle, defaultQtyNum, onChangeQtyNum } = props
    const [qtyCount, setQtyCount] = useState(defaultQtyNum || '0')

    const onEditQtyCount = (changedQty: string) => {
        onChangeQtyNum && onChangeQtyNum(changedQty)
        setQtyCount(changedQty)
    }
    return (
        <View style={[styles.centeredVertivcalContainer, styles.boxWrap, quantityContStyle]}>
            <View style={styles.boxLeft}>
                <View style={styles.boxLeftImage}>
                    {imgCode ? (
                        <FastImage
                            source={{
                                uri: imgCode,
                                headers: {
                                    Authorization: accessToken,
                                    accept: 'image/png'
                                },
                                cache: FastImage.cacheControl.web
                            }}
                            resizeMode={'contain'}
                            style={styles.cartImgSize}
                        />
                    ) : (
                        <Image
                            style={[styles.cartImgSize, { resizeMode: 'contain' }]}
                            source={require('../../../../../../assets/image/No_Innovation_Product.png')}
                        />
                    )}
                </View>
                <View style={styles.boxLeftText}>
                    <CText style={styles.boxLeftTitle}>{title}</CText>
                    <CText style={styles.boxLeftDesc}>{subTitle}</CText>
                </View>
            </View>
            <View style={styles.boxQuantity}>
                <TouchableOpacity
                    style={styles.quantityBtnTouch}
                    onPress={() => {
                        if (parseInt(qtyCount) > 0) {
                            if (inputRef.current.isFocused()) {
                                inputRef.current.blur()
                            }
                            const minusCount = parseInt(qtyCount) - 1
                            onEditQtyCount(minusCount + '')
                        }
                    }}
                >
                    <View style={styles.quantityBtnWrap}>
                        <View style={styles.minusBtn} />
                    </View>
                </TouchableOpacity>
                <View style={styles.quantityInputWrap}>
                    <View style={styles.quantityUnit}>
                        <CText style={styles.quantityUnitText}>{'Qty'}</CText>
                    </View>
                    <View style={styles.quantityInput}>
                        <TextInput
                            ref={inputRef}
                            onFocus={() => {
                                if (qtyCount === '0') {
                                    onEditQtyCount('')
                                }
                            }}
                            keyboardType={'numeric'}
                            maxLength={3}
                            placeholderTextColor={'#000'}
                            editable
                            onChangeText={(text = '') => {
                                const numInput = (parseInt(text.replace('.', '')) || '') + ''
                                onEditQtyCount(numInput)
                            }}
                            onBlur={(e) => {
                                const numInput = (parseInt((e.nativeEvent.text || '').replace('.', '')) || '0') + ''
                                onEditQtyCount(numInput)
                            }}
                            value={qtyCount}
                            style={styles.textInput}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.quantityBtnTouch}
                    onPress={() => {
                        if (parseInt(qtyCount || '0') < 999) {
                            if (inputRef.current.isFocused()) {
                                inputRef.current.blur()
                            }
                            const plusCount = parseInt(qtyCount || '0') + 1
                            onEditQtyCount(plusCount + '')
                        }
                    }}
                >
                    <View style={styles.quantityBtnWrap}>
                        <View style={styles.plusBtn1} />
                        <View style={styles.plusBtn2} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const DateColumnView = (props: DateColumnProps) => {
    const { showBottomLine, title, selected, onSelect } = props

    return (
        <TouchableOpacity
            style={[atcStyles.dateColumnCont, showBottomLine && atcStyles.columnBottomLine]}
            onPress={() => {
                onSelect && onSelect()
            }}
        >
            <View style={[atcStyles.circleDefault, selected && atcStyles.circleSelect]} />
            <CText style={atcStyles.dateColumnTitle}>{title}</CText>
        </TouchableOpacity>
    )
}

const DatePickerCalendar = (props: DatePickerCalendarProps) => {
    const { cRef, onPickDate, startDate, customer } = props
    const [isAvailable, setCalendarVisible] = useState(false)
    const dateStr = customer?.startDate || startDate
    const value = dateStr ? new Date(dateStr) : moment().add(1, 'day').toDate()
    const [hadChangedDate, setHadChangedDate] = useState(false)

    const onClickToHide = () => {
        if (!hadChangedDate) {
            onPickDate(value)
        }
        setCalendarVisible(false)
    }

    useImperativeHandle(cRef, () => ({
        show: () => {
            setHadChangedDate(false)
            setCalendarVisible(true)
        },
        hide: () => {
            onClickToHide()
        }
    }))
    return (
        <Modal
            isVisible={isAvailable}
            onBackdropPress={onClickToHide}
            coverScreen
            backdropOpacity={0.2}
            animationIn="fadeIn"
            animationOut="fadeOut"
        >
            <View style={atcStyles.calendarCont}>
                <DateTimePicker
                    textColor={'red'}
                    mode={'date'}
                    themeVariant={CommonLabel.LIGHT}
                    display={'inline'}
                    style={{
                        height: width * 0.85,
                        width: width - 64
                    }}
                    minimumDate={moment().add(1, 'days').toDate()}
                    value={value}
                    onChange={(e, date) => {
                        onPickDate(date)
                        setHadChangedDate(true)
                        setCalendarVisible(false)
                    }}
                    locale={DatePickerLocale[CommonParam.locale]}
                />
            </View>
        </Modal>
    )
}
const DebouncedSearchBar = (props: DebouncedSearchBarProps) => {
    const { onChange } = props
    const [searchChange, setSearchChange] = useState('')
    useDebounce(() => onChange(searchChange), 300, [searchChange])
    return (
        <SearchBar
            platform={'ios'}
            placeholder={t.labels.PBNA_MOBILE_METRICS_SEARCH_CUSTOMERS}
            allowFontScaling={false}
            cancelButtonTitle={''}
            containerStyle={[atcStyles.searchBarInnerContainer, { width: '100%' }]}
            inputContainerStyle={atcStyles.searchBarInputContainer}
            value={searchChange}
            inputStyle={atcStyles.searchInputContainer}
            onChangeText={(v) => {
                setSearchChange(v)
            }}
        />
    )
}

const AddToCartView = (props: AddToCartProps) => {
    const { navigation, route } = props
    const datePickerRef = useRef(null)
    const [qtyNum, setQtyNum] = useState('')
    const [selectColumn, setSelectColumn] = useState(0)
    const [startDate, setStartDate] = useState<any>('')
    const [endDate, setEndDate] = useState<any>('')
    const [searchText, setSearchText] = useState('')
    const [filterSelected, setFilterSelected] = useState(Object.keys(filterOptionsMap())[0])
    const customerLst = useMetricsDetailCustomer(filterOptionsMap()[filterSelected], route.params.skuItem, searchText)
    const [isLoading, setIsLoading] = useState(false)
    const [fullList, setFullList] = useState([])
    const [curCustomer, setCurCustomer] = useState(null)
    const { dropDownRef } = useDropDown()
    moment.tz.setDefault(CommonParam.userTimeZone)

    const showNoConnectionAlert = (callback) => {
        Alert.alert(t.labels.PBNA_MOBILE_ATC_UNSUCCESSFUL, t.labels.PBNA_MOBILE_ATC_NO_CONNECTION, [
            {
                text: t.labels.PBNA_MOBILE_OK,
                onPress: () => {
                    // noop
                }
            },
            {
                text: t.labels.PBNA_MOBILE_ATC_RETRY,
                onPress: () => {
                    callback()
                }
            }
        ])
    }

    const onBack = () => {
        navigation.goBack()
        route?.params?.onShowDetailScreen && route?.params?.onShowDetailScreen()
    }

    const getProductData = async () => {
        const product = route?.params?.skuItem
        const checkedOne: any = fullList.filter((el) => el.checked && el.startDate)
        const idArr = checkedOne.map((e) => e.Id)
        const ProductId = await SoupService.retrieveDataFromSoup(
            'StoreProduct',
            {},
            ['ProductId'],
            'SELECT {StoreProduct:ProductId} FROM {StoreProduct} ' +
                ` WHERE {StoreProduct:Product.GTIN__c} = '${product?.GTIN}'` +
                ` AND {StoreProduct:RetailStoreId} IN (${getIdClause(idArr)})` +
                ' ORDER BY {StoreProduct:Product.Material_Unique_ID__c} ASC LIMIT 1'
        )
        product.ProductId = ProductId[0]?.ProductId
        product.itemQuantity = Number.isNaN(Number(qtyNum)) ? 0 : qtyNum
        return product
    }

    const noConnectionHandler = async (inputData) => {
        try {
            const cacheForLaterData = assembleCacheForLaterReq('innovation', await getProductData(), inputData)
            await cacheForLaterATCDataHandler(cacheForLaterData, async () => {
                await AsyncStorage.setItem(
                    'isFromATCView',
                    `${inputData.length} ${t.labels.PBNA_MOBILE_ATC_CUSTOMERS_SLASH} ${
                        Number.isNaN(Number(qtyNum)) ? 0 : qtyNum
                    } ${t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE}`,
                    () => {
                        onBack()
                    }
                )
            })
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'AddToCartView', getStringValue(err))
            dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
        }
    }

    const onPickDate = (date) => {
        if (curCustomer) {
            setFullList(
                fullList.map((el) => {
                    if (el.Id === curCustomer.Id) {
                        return {
                            ...el,
                            alert: '',
                            startDate: date,
                            endDate: moment(date).add(1, 'day').toDate()
                        }
                    }
                    return el
                })
            )
        } else {
            setStartDate(date)
            setEndDate(moment(date).add(1, 'day').toDate())
        }
    }
    const setStartDates = () => {
        if (!fullList.length) {
            return
        }
        if (selectColumn === 0) {
            setFullList(
                fullList.map((el) => {
                    if (el['Account.Merchandising_Order_Days__c']) {
                        return {
                            ...el,
                            alert: '',
                            showDatePicker: false,
                            visible: customerLst.find((one) => one.Id === el.Id),
                            startDate: calculateNextOrderDay(el['Account.Merchandising_Order_Days__c'], false),
                            endDate: calculateNextOrderDay(el['Account.Merchandising_Order_Days__c'], true)
                        }
                    }
                    return {
                        ...el,
                        alert: '',
                        showDatePicker: false,
                        visible: customerLst.find((one) => one.Id === el.Id),
                        startDate: '',
                        endDate: ''
                    }
                })
            )
        } else {
            setFullList(
                fullList.map((el) => {
                    return {
                        ...el,
                        alert: '',
                        showDatePicker: false,
                        visible: customerLst.find((one) => one.Id === el.Id),
                        startDate,
                        endDate: moment(startDate).add(1, 'day').format('YYYY-MM-DD')
                    }
                })
            )
        }
    }

    useEffect(() => {
        if (filterSelected === t.labels.PBNA_MOBILE_ATC_ALL_AUTH && customerLst.length && !fullList.length) {
            setFullList(
                _.cloneDeep(customerLst).map((el) => {
                    return {
                        ...el,
                        checked: false,
                        visible: true
                    }
                })
            )
        }
    }, [filterSelected, customerLst])

    useEffect(() => {
        if (fullList.length) {
            setFullList(
                fullList.map((el) => {
                    return {
                        ...el,
                        visible: customerLst.find((one) => one.Id === el.Id)
                    }
                })
            )
        }
    }, [customerLst])

    useEffect(() => {
        if (selectColumn === 0) {
            setStartDate('')
        }
        setStartDates()
    }, [selectColumn, startDate, fullList.length])

    const onCheck = (index) => {
        setFullList(
            fullList.map((el, elIndex) => {
                if (elIndex === index) {
                    return {
                        ...el,
                        checked: !el.checked
                    }
                }
                return el
            })
        )
    }

    const uploadSFData = async (retailStores) => {
        const product: any = await getProductData()
        return new Promise<CommonSyncRes | any>((resolve, reject) => {
            _.isEmpty(product) && reject()
            const reqs = []
            retailStores.forEach((retailStore) => {
                product.startDate = retailStore.startDate
                product.endDate = retailStore.endDate
                const reqBody = assembleATCReq(product, retailStore)
                reqs.push(
                    compositeCommonCall([
                        reqBody.getPriceBookEntryReq,
                        reqBody.insertOrderReq,
                        reqBody.insertOrderItemReq
                    ])
                )
            })
            return Promise.all(reqs)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    const isCheckedAll =
        fullList.filter((one) => one.visible).length &&
        !fullList.filter((one) => one.visible).find((one) => !one.checked)

    const checkAll = () => {
        setFullList(
            fullList.map((el) => {
                if (el.visible) {
                    return {
                        ...el,
                        checked: !isCheckedAll
                    }
                }
                return el
            })
        )
    }

    const createStartDateAlert = (inputData, uploadDataFuc) => {
        const problematicCusCnt = fullList.reduce((a, b) => a + (_.isEmpty(b.alert) ? 0 : 1), 0)
        Alert.alert(
            t.labels.PBNA_MOBILE_ATC_START_DATE_ISSUE,
            `${problematicCusCnt} ${t.labels.PBNA_MOBILE_ATC_START_DATE_ISSUE_DETAIL}`,
            [
                {
                    text: t.labels.PBNA_MOBILE_GO_BACK
                },
                {
                    text: t.labels.PBNA_MOBILE_ATC_DROP_AND_PUSH,
                    onPress: async () => {
                        setIsLoading(true)
                        try {
                            await timeoutWrap(() => {
                                return uploadSFData(inputData)
                                    .then((res) => {
                                        if (!judgeCompositeSuccess(res)) {
                                            setIsLoading(false)
                                            throw new Error(res)
                                        }
                                    })
                                    .then(async () => {
                                        setIsLoading(false)
                                        AsyncStorage.setItem(
                                            'isFromATCView',
                                            `${inputData.length} ${t.labels.PBNA_MOBILE_ATC_CUSTOMERS_SLASH} ${
                                                Number.isNaN(Number(qtyNum)) ? 0 : qtyNum
                                            } ${t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE}`,
                                            () => {
                                                onBack()
                                            }
                                        )
                                    })
                            }, 5000)
                        } catch (e) {
                            if (isPersonaPSR()) {
                                const noConnectionInputData = inputData.filter(
                                    (el) => el.alert !== t.labels.PBNA_MOBILE_ATC_NO_ORDER_DAY
                                )
                                await noConnectionHandler(noConnectionInputData)
                                setIsLoading(false)
                            } else {
                                showNoConnectionAlert(uploadDataFuc)
                            }
                        }
                    }
                }
            ]
        )
    }

    const getIsPushActive = () => {
        return parseInt(qtyNum) > 0 && (selectColumn === 0 || startDate) && fullList.find((e) => e.checked)
    }

    const hasAlert = fullList.find((one) => one.alert)

    const hasSelectAll = fullList.find((one) => one.visible)

    const check = async () => {
        const product = route?.params?.skuItem
        const customerToCheck = fullList.filter((el) => el.checked && el.startDate)
        const customerIds = customerToCheck.map((el) => `'${el.Id}'`).join(',')
        let dupRes
        if (customerIds.length) {
            const productCodeRes = await SoupService.retrieveDataFromSoup(
                'StoreProduct',
                {},
                ['ProductCode'],
                'SELECT {StoreProduct:Product.ProductCode} FROM {StoreProduct} ' +
                    ` WHERE {StoreProduct:Product.GTIN__c} = '${product.GTIN}'` +
                    ` AND {StoreProduct:RetailStoreId} IN (${customerIds})` +
                    ' ORDER BY {StoreProduct:Product.Material_Unique_ID__c} ASC LIMIT 1'
            )
            const effectiveDates = _.uniq(customerToCheck.map((el) => moment(el.startDate).format('YYYY-MM-DD'))).join(
                ','
            )
            const query =
                `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Product2.ProductCode, OrderItem.Id, Order.EffectiveDate, Order.RetailStore__c ` +
                ' FROM OrderItem' +
                ` WHERE Order.RetailStore__c IN (${customerIds})` +
                ` AND Order.Order_ATC_Type__c = '${OrderATCType.PRODUCT_PUSH}'` +
                ` AND Product2.ProductCode = '${productCodeRes[0].ProductCode}'` +
                ` AND Order.EffectiveDate IN (${effectiveDates})`
            dupRes = await timeoutWrap(() => {
                return compositeCommonCall([
                    {
                        method: 'GET',
                        url: query,
                        referenceId: 'orderItem'
                    }
                ])
            }, 5000)
        } else {
            // when there are no customerIds, salesforce query will fail, so we mock the response
            dupRes = {
                data: {
                    compositeResponse: [
                        {
                            body: {
                                records: []
                            },
                            httpStatusCode: 200
                        }
                    ]
                }
            }
        }
        const res = dupRes.data.compositeResponse[0]
        const { body, httpStatusCode } = res
        if (httpStatusCode === 200) {
            const newFullList = fullList.map((el) => {
                el.alert = ''
                el.showDatePicker = false
                if (el.checked) {
                    if (!el.startDate) {
                        el.alert = t.labels.PBNA_MOBILE_ATC_NO_ORDER_DAY
                        el.showDatePicker = true
                        el.edited = true
                    } else {
                        const dup = body.records.find((one) => {
                            return (
                                one.Order.EffectiveDate === moment(el.startDate).format('YYYY-MM-DD') &&
                                one.Order.RetailStore__c === el.Id
                            )
                        })
                        if (dup) {
                            el.alert = t.labels.PBNA_MOBILE_ATC_EXISTING_ALERT
                            el.showDatePicker = true
                            el.edited = true
                        }
                    }
                }
                return el
            })
            setFullList(newFullList)
            return {
                ok: !newFullList.find((one) => one.alert),
                validData: newFullList.filter((e) => e.checked && e.startDate && !e.alert)
            }
        }
        throw new Error('timeout')
    }

    const pushToSmartR = async () => {
        const canSubmit = getIsPushActive()
        if (isLoading || !canSubmit) {
            return
        }
        setIsLoading(true)
        let ok, validData
        try {
            ;({ ok, validData } = await check())
        } catch (e) {
            if (isPersonaPSR()) {
                const newFullList = fullList.map((el) => {
                    el.alert = ''
                    el.showDatePicker = false
                    if (el.checked && !el.startDate) {
                        el.alert = t.labels.PBNA_MOBILE_ATC_NO_ORDER_DAY
                        el.showDatePicker = true
                        el.edited = true
                    }
                    return el
                })
                const customerWithStartDayIssue = newFullList.filter(
                    (el) => el.alert === t.labels.PBNA_MOBILE_ATC_NO_ORDER_DAY
                )
                if (!_.isEmpty(customerWithStartDayIssue)) {
                    setFullList(newFullList)
                    setIsLoading(false)
                    createStartDateAlert(newFullList, pushToSmartR)
                } else {
                    await noConnectionHandler(fullList.filter((el) => el.checked && el.startDate))
                }
            } else {
                showNoConnectionAlert(pushToSmartR)
            }
        }
        if (!ok) {
            if (validData?.length) {
                createStartDateAlert(validData, pushToSmartR)
            }
            setIsLoading(false)
            return
        }
        try {
            await timeoutWrap(() => {
                return uploadSFData(fullList.filter((el) => el.checked && el.startDate))
                    .then((res) => {
                        if (!judgeCompositeSuccess(res)) {
                            throw new Error(res)
                        }
                    })
                    .then(async () => {
                        await AsyncStorage.setItem(
                            'isFromATCView',
                            `${validData.length} ${t.labels.PBNA_MOBILE_ATC_CUSTOMERS_SLASH} ${
                                Number.isNaN(Number(qtyNum)) ? 0 : qtyNum
                            } ${t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE}`,
                            () => {
                                onBack()
                            }
                        )
                    })
            }, 5000)
        } catch (e) {
            if (isPersonaPSR()) {
                setIsLoading(false)
                await noConnectionHandler(fullList.filter((el) => el.checked && el.startDate))
            } else {
                showNoConnectionAlert(pushToSmartR)
            }
        }
        setIsLoading(false)
    }

    const getListHeader = () => {
        return (
            <View style={atcStyles.listHeader}>
                <View style={atcStyles.mainAlertTextContainer}>
                    {hasAlert && (
                        <>
                            <IconAlertSolid width="15" height="15" style={styles.mainAlertIcon} />
                            <CText numberOfLines={2} style={styles.alertText}>
                                {t.labels.PBNA_MOBILE_ATC_PRIMARY_ALERT}
                            </CText>
                        </>
                    )}
                </View>
                {hasSelectAll && (
                    <CCheckBox
                        onPress={checkAll}
                        title={
                            <CText
                                style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: '#01a2d9'
                                }}
                            >
                                {t.labels.PBNA_MOBILE_SELECT_ALL}
                            </CText>
                        }
                        checked={isCheckedAll}
                        containerStyle={atcStyles.selectAll}
                    />
                )}
            </View>
        )
    }

    const onPickStartDate = (customer) => {
        setCurCustomer(customer)
        datePickerRef?.current?.show()
    }

    const customerListProps = {
        customerLst: fullList,
        filterSelected,
        onCheck,
        listHeader: getListHeader(),
        onPickStartDate
    }
    return (
        <View style={atcStyles.containerView}>
            <View style={atcStyles.headCont}>
                <View style={atcStyles.titleCont}>
                    <CText style={[atcStyles.navTitle]}>{t.labels.PBNA_MOBILE_ATC_ADD_TO_CART.toUpperCase()}</CText>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        onBack()
                    }}
                >
                    <Image source={ImageSrc.ICON_IOS_CLOSE_OUTLINE} style={atcStyles.closeImg} />
                </TouchableOpacity>
            </View>
            <KeyboardAwareScrollView style={atcStyles.body} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={atcStyles.topPart}>
                    <CText style={atcStyles.prodStatusTitle}>{t.labels.PBNA_MOBILE_ADD_TO_CART_TITLE}</CText>
                    <AdjustQuantityView
                        quantityContStyle={atcStyles.quantityContain}
                        imgCode={route?.params?.qtyImageCode}
                        title={
                            route?.params?.skuItem?.Formatted_Sub_Brand_Name__c || route?.params?.skuItem?.Sub_Brand__c
                        }
                        subTitle={
                            route?.params?.skuItem?.Formatted_Package__c || route?.params?.skuItem?.Package_Type_Name__c
                        }
                        onChangeQtyNum={(qtyString) => {
                            setQtyNum(qtyString)
                        }}
                    />
                    <DateColumnView
                        showBottomLine
                        selected={selectColumn === 0}
                        title={t.labels.PBNA_MOBILE_IP_NEXT_ORDER_DAY}
                        onSelect={() => {
                            setSelectColumn(0)
                        }}
                    />
                    <DateColumnView
                        selected={selectColumn === 1}
                        title={t.labels.PBNA_MOBILE_CUSTOM_DATE}
                        onSelect={() => {
                            setSelectColumn(1)
                        }}
                    />
                    {selectColumn === 1 && (
                        <View style={[atcStyles.dateColumnCont, atcStyles.datePickCon]}>
                            <DatePickView
                                clickable={selectColumn === 1}
                                title={t.labels.PBNA_MOBILE_START_DATE}
                                dateString={startDate}
                                onChoseDate={() => {
                                    setCurCustomer(null)
                                    if (!startDate) {
                                        setStartDate(moment().add(1, 'day'))
                                        setEndDate(moment().add(2, 'day'))
                                    }
                                    datePickerRef?.current?.show()
                                }}
                            />
                            <DatePickView title={t.labels.PBNA_MOBILE_END_DATE} dateString={endDate} />
                        </View>
                    )}
                    <DatePickerCalendar
                        cRef={datePickerRef}
                        onPickDate={(date) => {
                            onPickDate(date)
                        }}
                        startDate={startDate}
                        customer={curCustomer}
                    />
                    <View style={atcStyles.searchBarWrap}>
                        <DebouncedSearchBar
                            onChange={(v) => {
                                setSearchText(v)
                            }}
                        />
                    </View>
                    <View style={atcStyles.quickFilterContainer}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '39%'
                            }}
                        >
                            <CText>
                                {customerLst.length} {t.labels.PBNA_MOBILE_METRICS_CUSTOMERS}
                            </CText>
                        </View>
                        <View
                            style={{
                                marginBottom: -5,
                                paddingTop: 5
                            }}
                        >
                            <PickerTile
                                data={Object.keys(filterOptionsMap())}
                                label={''}
                                disabled={false}
                                defValue={filterSelected}
                                inputStyle={atcStyles.placeholderColor}
                                placeholder={t.labels.PBNA_MOBILE_METRICS_SELECT_MY_FILTER}
                                placeholderStyle={atcStyles.placeholderColor}
                                noPaddingHorizontal
                                isFirstItemValuable
                                onDone={async (v: any) => {
                                    setFilterSelected(v)
                                }}
                                required={false}
                                modalStyle={{
                                    width: '90%'
                                }}
                                borderStyle={{}}
                                title={t.labels.PBNA_MOBILE_ATC_CUSTOMER_STATUS}
                            />
                        </View>
                    </View>
                </View>
                <View style={atcStyles.customerList}>
                    <AddToCartCustomerList {...customerListProps} />
                </View>
            </KeyboardAwareScrollView>
            {renderBottomBar(pushToSmartR, getIsPushActive())}
            <Loading isLoading={isLoading} />
        </View>
    )
}
export default AddToCartView
