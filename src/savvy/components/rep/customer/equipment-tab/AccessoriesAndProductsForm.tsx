/**
 * @description Recurring visit detail component.
 * @author Kiren Cao
 * @email wenjie.cao@pwc.com
 * @date 2021-12-22
 */

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react'
import { View, Image, TouchableOpacity, Animated, Alert, I18nManager, StyleSheet, Dimensions } from 'react-native'
import CText from '../../../../../common/components/CText'
import RecurringVisitDetailStyle from '../../../../styles/manager/RecurringVisitDetailStyle'
import EmployeeDetailStyle from '../../../../styles/manager/EmployeeDetailStyle'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import SubTypeModal from '../../../manager/common/SubTypeModal'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import _ from 'lodash'
import ProductSelector from './ProductSelector'
import { t } from '../../../../../common/i18n/t'
import { useAccessory, useMaximum, useRecommendedProduct } from '../../../../hooks/EquipmentHooks'
import { Input } from 'react-native-elements'
import { ScrollView, Swipeable } from 'react-native-gesture-handler'
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'
import { addZeroes } from '../../../../utils/LeadUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'
import CSwitch from '../../../../../common/components/c-switch/CSwitch'
import DistributionPointModal from '../../lead/offer-tab/DistributionPointModal'
import ConfirmButton from '../../../common/ConfirmButton'
import DistributionPointTile from '../../lead/offer-tab/DistributionPointTile'
import GlobalModal from '../../../../../common/components/GlobalModal'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CopyProductsModal from './CopyProductsModal'
const screenWidth = Dimensions.get('window').width

const styles = Object.assign(
    RecurringVisitDetailStyle,
    EmployeeDetailStyle,
    StyleSheet.create({
        rightAction: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center'
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '700',
            backgroundColor: 'transparent',
            padding: 10
        },
        additionalTitle: {
            fontSize: baseStyle.fontSize.fs_14,
            fontWeight: baseStyle.fontWeight.fw_400,
            color: baseStyle.color.titleGray
        },
        marginTopSelect: {
            marginTop: -7
        },
        priceInput: {
            width: '100%',
            height: 40,
            borderRadius: 6,
            borderColor: '#00A2D9',
            borderWidth: 1,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
        },
        selectNumberContainer: {
            flexDirection: 'row',
            width: '65%'
        },
        selectNumberText: {
            fontWeight: '700',
            width: '15%'
        },
        selectNameText: {
            marginLeft: 5,
            overflow: 'hidden'
        },
        inputPriceContainer: {
            width: '20%',
            alignItems: 'center',
            justifyContent: 'center'
        },
        dollarStyle: {
            fontSize: 14,
            fontWeight: '700',
            left: 8
        },
        dollarInput: {
            marginTop: 20,
            width: 65,
            left: 2
        },
        inputContainerStyle: {
            borderBottomColor: 'rgba(0,0,0,0)'
        },
        rateInputStyle: {
            fontSize: 14,
            fontWeight: '700'
        },
        headerStyle: {
            backgroundColor: baseStyle.color.white,
            paddingHorizontal: 22,
            borderTopWidth: 1,
            borderTopColor: baseStyle.color.white,
            flex: 1
        },
        venStyle: {
            marginTop: -15,
            paddingBottom: 10
        },
        venMargin: {
            marginBottom: 10,
            marginTop: 10
        },
        marginBottom5: {
            marginBottom: 5
        },
        addIconContainer: {
            height: 36,
            width: 30
        },
        addIconStyle1: {
            width: 20,
            height: 3,
            backgroundColor: '#00A2D9',
            left: 0,
            top: 16.5,
            position: 'absolute'
        },
        addIconStyle2: {
            width: 3,
            height: 20,
            backgroundColor: '#00A2D9',
            left: 8.5,
            top: 8,
            position: 'absolute'
        },
        addTextStyle: {
            color: '#00A2D9',
            fontWeight: '700',
            fontSize: 12
        },
        selectAccessoryText: {
            fontSize: 18,
            fontWeight: '900',
            paddingBottom: 25
        },
        requiredText: {
            fontSize: 12,
            color: '#565656',
            paddingBottom: 10
        },
        selectProductContainer: {
            backgroundColor: baseStyle.color.white,
            borderTopWidth: 1,
            borderTopColor: baseStyle.color.white
        },
        selectProductText: {
            fontSize: 18,
            fontWeight: '900'
        },
        recommendedStyle: {
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: baseStyle.color.white
        },
        venContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            minHeight: 50
        },
        inputBoxContainer: {
            height: 40,
            borderRadius: 6,
            borderColor: '#00A2D9',
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 5,
            marginVertical: 10
        },
        dollarStyle2: {
            fontSize: 14,
            fontWeight: '700',
            left: 5
        },
        dollarInputStyle: {
            marginTop: 20,
            width: 65
        },
        footerContainer: {
            width: '100%',
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: baseStyle.color.bgGray,
            marginBottom: 1,
            paddingHorizontal: 22
        },
        FSVPending: {
            paddingBottom: 20,
            paddingHorizontal: '5%'
        },
        flexMarginTop: {
            flex: 1,
            marginTop: 20
        },
        scrollViewContainer: {
            backgroundColor: baseStyle.color.white,
            paddingHorizontal: 22,
            borderTopWidth: 1,
            borderTopColor: baseStyle.color.white
        },
        flexEnd: { alignItems: 'flex-end' },
        borderBottomColor: { borderBottomColor: 'rgba(0,0,0,0)' },
        threeItemRightActionRow: {
            width: 300,
            flexDirection: 'row'
        },
        rightActionReverse: {
            width: 300,
            flexDirection: 'row-reverse'
        },
        scaleDecorator: {
            width: '100%',
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 1,
            paddingHorizontal: 22
        },
        activeBackgroundColor: { backgroundColor: 'white' },
        inactiveBackgroundColor: {
            backgroundColor: baseStyle.color.bgGray
        },
        marginTop_30: { marginTop: 30 },
        paddingBottom_500: { paddingBottom: 500 },
        addChar: {
            lineHeight: 32,
            fontSize: 18,
            fontWeight: '900',
            paddingRight: 10
        },
        disableColor: {
            color: baseStyle.color.liteGrey
        },
        enableColor: {
            color: baseStyle.color.LightBlue
        },
        addNewProduct: {
            lineHeight: 32,
            fontSize: 14,
            fontWeight: '900'
        },
        selectContainerStyle: {
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: '100%',
            minHeight: 30
        },
        copyButtonColor: {
            backgroundColor: '#FFC409'
        },
        headInput: {
            flexDirection: 'row',
            width: screenWidth,
            paddingHorizontal: 22
        }
    })
)

const IMG_TRIANGLE = ImageSrc.IMG_TRIANGLE

interface AccessoriesAndProductsFormProps {
    cRef?: any
    selectedEquipSetupId: any
    selectedSubTypeCode: any
    selectedTypeCode: any
    equipment: any
    setEquipment: any
    accessories: any
    setAccessories
    products: any
    setProducts
    editedAp
    existingAccessoryRequests
    existingProductRequests
    editMode: boolean
    readonly: boolean
    customer: any
    confirmAddOns: () => void
    distributionPointList: any
    setRefreshDp: any
    type: 'Lead' | 'RetailStore'
    l: any
    itemToExchange?: any
    commissionStruct?: any
}

const AccessoriesAndProductsForm = (props: AccessoriesAndProductsFormProps) => {
    const {
        cRef,
        selectedEquipSetupId,
        selectedSubTypeCode,
        selectedTypeCode,
        equipment,
        setEquipment,
        accessories,
        setAccessories,
        editedAp,
        products,
        setProducts,
        editMode,
        readonly,
        customer,
        confirmAddOns,
        distributionPointList,
        setRefreshDp,
        type,
        l,
        itemToExchange,
        commissionStruct
    } = props
    const { requiredAccessoryList, additionalAccessoryList } = useAccessory(selectedTypeCode, selectedEquipSetupId)
    const { originalRecommendedProduct } = useRecommendedProduct(selectedEquipSetupId)
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [additionalAccessoryArray, setAdditionalAccessoryArray] = useState([])
    const [selectedAdditionalAccessory, setSelectedAdditionalAccessory] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [isShowSelector, setIsShowSelector] = useState(false)
    const maximum = useMaximum(selectedEquipSetupId)
    const [mechRateTemp, setMechRateTemp] = useState('')
    const [mechRate, setMechRate] = useState('')
    const [isReplaced, setIsReplaced] = useState(false)
    const [selectNum, setSelectNum] = useState(null)
    const [tempProducts, setTempProducts] = useState([])
    const [replacedNum, setReplacedNum] = useState(null)
    const [showDistributionPointModal, setShowDistributionPointModal] = useState(false)
    const globalModalRef = useRef(null)
    const [isEmptyAddAccessory, serIsEmptyAddAccessory] = useState(false)
    const [copyProductsModalVisible, setCopyProductsModalVisible] = useState(false)
    const [copyProductIndex, setCopyProductIndex] = useState(0)
    useImperativeHandle(cRef, () => ({
        dpLength: distributionPointList.length
    }))
    useEffect(() => {
        if (!_.isEmpty(products)) {
            setSelectNum(parseInt(_.last(products).slct_num__c) + 1)
        } else {
            setSelectNum(1)
        }
    }, [products])
    const showProductSelector = (flag) => {
        setIsShowSelector(flag)
    }
    const selectorRef = useRef()

    useEffect(() => {
        setAdditionalAccessoryArray(_.cloneDeep(additionalAccessoryList))
        setSelectedAdditionalAccessory(_.cloneDeep(additionalAccessoryList))
        if (accessories?.length > 0) {
            const tempArray = _.cloneDeep(additionalAccessoryList)
            accessories.forEach((item) => {
                tempArray.forEach((accessory) => {
                    if (item === accessory.id) {
                        accessory.select = true
                    }
                })
            })
            setAdditionalAccessoryArray(tempArray)
            setSelectedAdditionalAccessory(tempArray)
        }
    }, [additionalAccessoryList])

    const updateAccessories = (accessoryArr) => {
        const adAccessory = accessoryArr.filter((item) => item.select === true).map((item) => item.id)
        const reAccessory = requiredAccessoryList.map((item) => item.id)
        setAccessories([...reAccessory, ...adAccessory])
    }

    let accessoryArray = []
    const updateVisitSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        accessoryArray = JSON.parse(JSON.stringify(additionalAccessoryArray))
        setSelectedAdditionalAccessory(accessoryArray)
        updateAccessories(accessoryArray)
    }

    const onCancelSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        accessoryArray = JSON.parse(JSON.stringify(selectedAdditionalAccessory))
        setAdditionalAccessoryArray(accessoryArray)
    }

    const onRemoveSubType = (item) => {
        const temp = _.cloneDeep(additionalAccessoryArray)
        temp.find((sub) => sub.name === item.name).select = false
        setAdditionalAccessoryArray(temp)
        accessoryArray = JSON.parse(JSON.stringify(temp))
        setSelectedAdditionalAccessory(accessoryArray)
        updateAccessories(accessoryArray)
    }

    const clearExtraValue = (productList) => {
        if (
            equipment.FSV_Line_Item__c &&
            equipment.Rate_Type__c === 'Variable by Product' &&
            equipment.Contract_Type__c
        ) {
            productList.forEach((item) => {
                item.FSV_UNIT_T1__c = null
                item.FSV_COMM_RATE_T1__c = null
            })
        }
    }

    const checkClick = (index) => {
        additionalAccessoryArray[index].select = !additionalAccessoryArray[index].select
        setAdditionalAccessoryArray([...additionalAccessoryArray])
    }
    const swipeableRow: Array<Swipeable> = []
    const close = (index) => {
        swipeableRow[index]?.close()
    }
    const renderReplacePopUp = (index) => {
        Alert.alert(t.labels.PBNA_MOBILE_REPLACE_PRODUCT, t.labels.PBNA_MOBILE_REPLACE_PRODUCT_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL
            },
            {
                text: t.labels.PBNA_MOBILE_CONTINUE,
                onPress: () => {
                    showProductSelector(true)
                    setReplacedNum(index)
                    setIsReplaced(true)
                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} replaces a product`, 1)
                }
            }
        ])
    }

    const renderRemovePopUp = (index) => {
        Alert.alert(t.labels.PBNA_MOBILE_REMOVE_PRODUCT, t.labels.PBNA_MOBILE_REMOVE_PRODUCT_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL
            },
            {
                text: t.labels.PBNA_MOBILE_YES,
                onPress: () => {
                    const tempProds = _.cloneDeep(products)
                    const origin = _.cloneDeep(products)
                    _.pullAt(tempProds, index)
                    tempProds.forEach((item, i) => {
                        item.slct_num__c = origin[i].slct_num__c
                    })
                    clearExtraValue(tempProds)
                    setProducts(tempProds)
                    Instrumentation.reportMetric(`${CommonParam.PERSONA__c} removes a product`, 1)
                }
            }
        ])
    }

    const renderRightActions = (index, progress: Animated.AnimatedInterpolation) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [90, 0]
        })
        return (
            <View style={I18nManager.isRTL ? styles.rightActionReverse : styles.threeItemRightActionRow}>
                <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                    <View style={[styles.rightAction, { backgroundColor: '#2DD36F' }]}>
                        <TouchableOpacity
                            activeOpacity={0}
                            style={styles.rightAction}
                            onPress={() => {
                                close(index)
                                renderReplacePopUp(index)
                            }}
                        >
                            <CText style={styles.buttonText}>{t.labels.PBNA_MOBILE_REPLACE.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                    <View style={[styles.rightAction, styles.copyButtonColor]}>
                        <TouchableOpacity
                            activeOpacity={0}
                            style={styles.rightAction}
                            onPress={() => {
                                close(index)
                                setCopyProductsModalVisible(true)
                                setCopyProductIndex(index)
                            }}
                        >
                            <CText style={styles.buttonText}>{t.labels.PBNA_MOBILE_COPY.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                    <View style={[styles.rightAction, { backgroundColor: '#EB445A' }]}>
                        <TouchableOpacity
                            activeOpacity={0}
                            style={styles.rightAction}
                            onPress={() => {
                                close(index)
                                renderRemovePopUp(index)
                            }}
                        >
                            <CText style={styles.buttonText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        )
    }
    const handleAllBlur = ({ nativeEvent }) => {
        Alert.alert(t.labels.PBNA_MOBILE_MECH_RATE_CHANGE, t.labels.PBNA_MOBILE_UPDATE_MECH_RATE_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                onPress: () => {
                    setMechRateTemp(mechRate)
                }
            },
            {
                text: t.labels.PBNA_MOBILE_CONTINUE,
                onPress: () => {
                    if (_.isEmpty(nativeEvent.text)) {
                        const tempProd = _.cloneDeep(products)
                        tempProd.forEach((item) => {
                            item.equip_mech_rte_amt__c = ''
                        })
                        setProducts(tempProd)
                        setTempProducts(tempProd)
                        setMechRateTemp('')
                        setMechRate('')
                        return ''
                    }
                    let newValue = addZeroes(nativeEvent.text)
                    if (newValue > 10.0) {
                        newValue = '10.00'
                    } else if (newValue < 0.5) {
                        newValue = '0.50'
                    }
                    const temp = _.cloneDeep(products)
                    temp.forEach((item) => {
                        item.equip_mech_rte_amt__c = newValue
                    })
                    clearExtraValue(temp)
                    setProducts(temp)
                    setTempProducts(temp)
                    setMechRateTemp(newValue.toString())
                    setMechRate(newValue.toString())
                    return newValue
                }
            }
        ])
    }
    const processNumber = (v) => {
        let newValue = v
        if (newValue !== '') {
            newValue = newValue.replace(/^\D*(\d{0,16}(?:\.\d{0,2})?).*$/g, '$1')
        }
        return newValue
    }
    const mechRateRef = useRef(null)
    const handleChangeText = (v) => {
        const newValue = processNumber(v)
        setMechRateTemp(newValue)
        setTimeout(() => {
            mechRateRef?.current?.focus()
        }, 0)
    }
    useEffect(() => {
        if (!editMode && !editedAp.current) {
            if (accessories.length === 0) {
                const adAccessory = selectedAdditionalAccessory
                    .filter((item) => item.select === true)
                    .map((item) => item.id)
                const reAccessory = requiredAccessoryList.map((item) => item.id)
                setAccessories([...reAccessory, ...adAccessory])
            }
        }
        serIsEmptyAddAccessory(selectedAdditionalAccessory.filter((item: any) => item.select).length === 0)
    }, [selectedAdditionalAccessory, requiredAccessoryList])

    const moveMerchRate = (originalRecommendedProd) => {
        originalRecommendedProd.forEach((item) => {
            item.equip_mech_rte_amt__c = null
        })
        return originalRecommendedProd
    }

    useEffect(() => {
        if (!editMode && !editedAp.current) {
            if (
                (itemToExchange?.Sls_plan_cde__c === 'FSV' || itemToExchange?.Sls_plan_cde__c === 'FSR') &&
                itemToExchange?.equip_styp_cde__c === selectedSubTypeCode
            ) {
                setTempProducts([...products])
                const tempProductList = commissionStruct?.productList || []
                const tempAssetConfig = commissionStruct?.assetConfig || []
                const expProductList = []
                if (!_.isEmpty(tempProductList)) {
                    const commissionRateLimit = equipment.Contract_Type__c === 'Revenue' ? 4 : 2
                    tempProductList.forEach((v) => {
                        const item = {
                            FSV_UNIT_T1__c: null,
                            FSV_COMM_RATE_T1__c:
                                _.round(v?.fsvInvenCommissionRate, commissionRateLimit).toFixed(commissionRateLimit) ||
                                tempAssetConfig[0]?.tier_rate__c ||
                                null,
                            Material_UOM_Identifier__c: v.invenId,
                            Name: v.productName,
                            equip_mech_rte_amt__c: addZeroes(v.mechRate + ''),
                            slct_num__c: v.selectNum
                        }
                        expProductList.push(item)
                    })
                }
                setTempProducts(expProductList)
                setProducts([...expProductList])
            } else {
                const list = _.cloneDeep(moveMerchRate(originalRecommendedProduct))
                if (list.length > selectedProducts.length) {
                    const temp = _.cloneDeep(_.concat(list, selectedProducts))
                    temp.forEach((item) => {
                        if (!_.isEmpty(item.equip_mech_rte_amt__c)) {
                            item.equip_mech_rte_amt__c = addZeroes(item.equip_mech_rte_amt__c + '')
                        }
                    })
                    setTempProducts(temp)
                    setProducts([...list, ...selectedProducts])
                } else {
                    setTempProducts(selectedProducts)
                    setProducts([...selectedProducts])
                }
            }
        } else {
            setTempProducts([...products])
        }
    }, [originalRecommendedProduct])

    const rowShadow = () => {
        return {
            shadowColor: '#004C97',
            shadowOffset: {
                width: 0,
                height: 0
            },
            shadowOpacity: 0.17,
            shadowRadius: 20
        }
    }

    const renderRecommended = ({ item, getIndex, drag, isActive }: RenderItemParams<any>) => {
        const index = getIndex()
        return (
            <ScaleDecorator key={item.slct_num__c + index}>
                <TouchableOpacity onLongPress={drag} disabled={isActive || readonly} style={isActive && rowShadow()}>
                    <Swipeable
                        ref={(ref) => {
                            if (ref !== undefined) {
                                swipeableRow[index] = ref
                            }
                        }}
                        friction={1}
                        enableTrackpadTwoFingerGesture
                        renderRightActions={(progress) => renderRightActions(index, progress)}
                        overshootRight={false}
                        enabled={!isActive && !readonly}
                    >
                        <View
                            style={[
                                styles.scaleDecorator,
                                isActive ? styles.activeBackgroundColor : styles.inactiveBackgroundColor
                            ]}
                        >
                            <View style={styles.selectNumberContainer}>
                                <CText style={styles.selectNumberText}>{item.slct_num__c}</CText>
                                <CText numberOfLines={1} style={styles.selectNameText}>
                                    {item.Name}
                                </CText>
                            </View>
                            {equipment.Equip_type_cde__c === 'VEN' && (
                                <View style={styles.inputPriceContainer}>
                                    <View style={styles.priceInput}>
                                        <CText style={styles.dollarStyle}>$</CText>
                                        <Input
                                            containerStyle={styles.dollarInput}
                                            onChangeText={(e: any) => {
                                                const newValue = processNumber(e)
                                                const temp = _.cloneDeep(products)
                                                temp[index].equip_mech_rte_amt__c = newValue
                                                setProducts(temp)
                                            }}
                                            onBlur={() => {
                                                Alert.alert(
                                                    t.labels.PBNA_MOBILE_MECH_RATE_CHANGE,
                                                    t.labels.PBNA_MOBILE_UPDATE_MECH_RATE_MSG,
                                                    [
                                                        {
                                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                                            onPress: () => {
                                                                const temp = _.cloneDeep(products)
                                                                if (_.isEmpty(item.equip_mech_rte_amt__c)) {
                                                                    temp[index].equip_mech_rte_amt__c = ''
                                                                    setProducts(temp)
                                                                } else {
                                                                    temp[index].equip_mech_rte_amt__c =
                                                                        tempProducts[index].equip_mech_rte_amt__c
                                                                    setProducts(temp)
                                                                }
                                                            }
                                                        },
                                                        {
                                                            text: t.labels.PBNA_MOBILE_CONTINUE,
                                                            onPress: () => {
                                                                if (_.isEmpty(item.equip_mech_rte_amt__c)) {
                                                                    const temp = _.cloneDeep(products)
                                                                    temp[index].equip_mech_rte_amt__c = ''
                                                                    clearExtraValue(temp)
                                                                    setProducts(temp)
                                                                    setTempProducts(temp)
                                                                } else {
                                                                    let newValue = addZeroes(
                                                                        item.equip_mech_rte_amt__c + ''
                                                                    )
                                                                    if (newValue > 10.0) {
                                                                        newValue = '10.00'
                                                                    } else if (newValue < 0.5) {
                                                                        newValue = '0.50'
                                                                    }
                                                                    const temp = _.cloneDeep(products)
                                                                    temp[index].equip_mech_rte_amt__c = newValue
                                                                    clearExtraValue(temp)
                                                                    setProducts(temp)
                                                                    setTempProducts(temp)
                                                                }
                                                            }
                                                        }
                                                    ]
                                                )
                                            }}
                                            placeholder={'--.--'}
                                            inputContainerStyle={styles.inputContainerStyle}
                                            keyboardType={'numeric'}
                                            inputStyle={styles.rateInputStyle}
                                            value={item.equip_mech_rte_amt__c?.toString() || ''}
                                            disabled={readonly}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </Swipeable>
                </TouchableOpacity>
            </ScaleDecorator>
        )
    }
    const showMaximum =
        (equipment.equip_move_type_cde__c === 'INS' ||
            equipment.equip_move_type_cde__c === 'EXI' ||
            equipment.equip_move_type_cde__c === 'EXP') &&
        (equipment.Equip_type_cde__c === 'VEN' || equipment.Equip_type_cde__c === 'POS')

    const renderHeader = () => {
        return (
            <View style={styles.headerStyle}>
                {equipment.Equip_type_cde__c === 'VEN' && (
                    <View style={styles.venStyle}>
                        <CSwitch
                            labelStyle={styles.additionalTitle}
                            label={t.labels.PBNA_MOBILE_FULL_SERVICE_VENDING}
                            showBottomLine
                            checked={equipment.FSV_Line_Item__c}
                            toggleSwitch={() => {
                                const temp = _.cloneDeep(equipment)
                                temp.FSV_Line_Item__c = !temp.FSV_Line_Item__c
                                if (!temp.FSV_Line_Item__c) {
                                    const temp = _.cloneDeep(products)
                                    clearExtraValue(temp)
                                    setProducts(temp)
                                }
                                setEquipment(temp)
                            }}
                            disabled={readonly}
                        />
                    </View>
                )}
                <View style={styles.venMargin}>
                    {equipment.Equip_type_cde__c === 'VEN' &&
                        equipment.FSV_Line_Item__c &&
                        !_.isEmpty(distributionPointList) &&
                        distributionPointList.map((item) => {
                            return (
                                <DistributionPointTile
                                    key={item.Id}
                                    dpData={item}
                                    refresh={() => {
                                        setRefreshDp((prev) => prev + 1)
                                    }}
                                    showEdit={
                                        !readonly &&
                                        item?.created_by_savvy__c &&
                                        (item['Request__r.status__c'] === 'DRAFT' ||
                                            _.isEmpty(item['Request__r.status__c']))
                                    }
                                    isFromRequest
                                    customer={customer}
                                    globalModalRef={globalModalRef}
                                    type={type}
                                    l={l}
                                />
                            )
                        })}
                    {equipment.Equip_type_cde__c === 'VEN' &&
                        equipment.FSV_Line_Item__c &&
                        _.isEmpty(distributionPointList) && (
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDistributionPointModal(true)
                                }}
                                style={styles.marginBottom5}
                            >
                                <View style={commonStyle.flexRowAlignCenter}>
                                    <View style={styles.addIconContainer}>
                                        <View style={styles.addIconStyle1} />
                                        <View style={styles.addIconStyle2} />
                                    </View>
                                    <CText style={styles.addTextStyle}>
                                        {`${t.labels.PBNA_MOBILE_ADD_DISTRIBUTION_POINT}`}
                                    </CText>
                                </View>
                            </TouchableOpacity>
                        )}
                </View>
                <CText style={styles.selectAccessoryText}>{t.labels.PBNA_MOBILE_SELECT_ACCESSORIES}</CText>
                {!_.isEmpty(requiredAccessoryList) && (
                    <CText style={styles.requiredText}>{t.labels.PBNA_MOBILE_REQUIRED}</CText>
                )}
                <View style={styles.selectedContainer}>
                    {requiredAccessoryList &&
                        _.map(requiredAccessoryList, (item, index) => {
                            return (
                                <View style={styles.subTypeCell} key={index}>
                                    <CText style={commonStyle.flexShrink_1}>{item?.name}</CText>
                                </View>
                            )
                        })}
                </View>
                {!readonly && (
                    <>
                        {isEmptyAddAccessory && (
                            <View style={styles.marginTop_30}>
                                <CText style={styles.additionalTitle}>
                                    {t.labels.PBNA_MOBILE_ADDITIONAL_OPTIONAL}{' '}
                                </CText>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.flexRow,
                                styles.flexSelectRow,
                                !isEmptyAddAccessory && styles.noBottomLine,
                                isEmptyAddAccessory && styles.marginBottom_30,
                                styles.marginTopSelect
                            ]}
                            onPress={() => {
                                setTypeModalVisible(true)
                            }}
                        >
                            {!isEmptyAddAccessory && (
                                <CText style={[styles.additionalTitle, { marginTop: 30 }]}>
                                    {t.labels.PBNA_MOBILE_ADDITIONAL_OPTIONAL}
                                </CText>
                            )}
                            {isEmptyAddAccessory && (
                                <CText style={styles.placeholder}>{t.labels.PBNA_MOBILE_SELECT}</CText>
                            )}

                            <View style={[styles.flexRowAlignCenter, !isEmptyAddAccessory && { marginTop: 40 }]}>
                                <Image source={IMG_TRIANGLE} style={styles.imgTriangle} />
                            </View>
                        </TouchableOpacity>
                    </>
                )}
                <View
                    style={[
                        selectedAdditionalAccessory.filter((item: any) => item.select).length > 0 && styles.bottomLine,
                        selectedAdditionalAccessory.filter((item: any) => item.select).length > 0 &&
                            styles.marginBottom_30
                    ]}
                >
                    <View style={styles.selectedContainer}>
                        {selectedAdditionalAccessory
                            .filter((item: any) => item.select)
                            .map((item: any) => {
                                return (
                                    <View style={styles.subTypeCell} key={`select${item.id}`}>
                                        <CText>{item.name}</CText>
                                        {!readonly && (
                                            <TouchableOpacity
                                                onPress={() => onRemoveSubType(item)}
                                                style={styles.clearSubTypeContainer}
                                            >
                                                <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )
                            })}
                    </View>
                </View>
                <View style={styles.selectProductContainer}>
                    <View style={[commonStyle.flexRowSpaceBet, { marginBottom: 20 }]}>
                        <CText style={styles.selectProductText}>{t.labels.PBNA_MOBILE_SELECT_PRODUCTS}</CText>
                    </View>
                    <View style={styles.recommendedStyle}>
                        <View style={styles.selectContainerStyle}>
                            <TouchableOpacity
                                disabled={products.length === 0 || readonly}
                                onPress={async () => {
                                    Alert.alert(
                                        t.labels.PBNA_MOBILE_REMOVE_ALL_PRODUCTS_QUESTION_MARK,
                                        t.labels.PBNA_MOBILE_REMOVE_ALL_PRODUCTS_MESSAGE,
                                        [
                                            {
                                                text: t.labels.PBNA_MOBILE_CANCEL
                                            },
                                            {
                                                text: t.labels.PBNA_MOBILE_REMOVE_CHECK_MESSAGE,
                                                onPress: () => {
                                                    setProducts([])
                                                    setMechRateTemp('')
                                                    mechRateRef?.current?.clear()
                                                }
                                            }
                                        ]
                                    )
                                }}
                            >
                                <CText
                                    style={[
                                        styles.rateInputStyle,
                                        {
                                            color:
                                                products.length === 0 || readonly
                                                    ? baseStyle.color.liteGrey
                                                    : baseStyle.color.red
                                        }
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_REMOVE_ALL_PRODUCTS.toUpperCase()}
                                </CText>
                            </TouchableOpacity>
                            {equipment.Equip_type_cde__c === 'VEN' && (
                                <View style={styles.flexEnd}>
                                    <CText style={styles.rateInputStyle}>
                                        {t.labels.PBNA_MOBILE_MECH_RATE.toUpperCase()}
                                    </CText>
                                    <CText>({t.labels.PBNA_MOBILE_APPLY_ALL})</CText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const renderFooter = () => {
        const isDisableAddProduct = showMaximum && maximum > 0 && products.length >= maximum
        return (
            <View style={styles.paddingBottom_500}>
                {!readonly && (
                    <View style={styles.footerContainer}>
                        <TouchableOpacity
                            disabled={isDisableAddProduct}
                            onPress={() => {
                                showProductSelector(true)
                                Instrumentation.reportMetric(`${CommonParam.PERSONA__c} adds a product`, 1)
                            }}
                        >
                            <View style={commonStyle.flexRowAlignCenter}>
                                <CText
                                    style={[
                                        styles.addChar,
                                        isDisableAddProduct ? styles.disableColor : styles.enableColor
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_ADD_CHAR}
                                </CText>
                                <CText
                                    style={[
                                        styles.addNewProduct,
                                        isDisableAddProduct ? styles.disableColor : styles.enableColor
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_ADD_NEW_PRODUCT.toUpperCase()}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                {equipment.FSV_Line_Item__c && (
                    <View style={styles.FSVPending}>
                        <ConfirmButton
                            label={t.labels.PBNA_MOBILE_CONFIRM_ADD_ONS}
                            handlePress={() => {
                                confirmAddOns()
                            }}
                            disabled={
                                !(
                                    _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === null)) &&
                                    _.isEmpty(
                                        _.filter(
                                            products,
                                            (item) =>
                                                item.equip_mech_rte_amt__c === 0 ||
                                                item.equip_mech_rte_amt__c === '0.00'
                                        )
                                    ) &&
                                    _.isEmpty(_.filter(products, (item) => item.equip_mech_rte_amt__c === ''))
                                ) ||
                                _.isEmpty(products) ||
                                (equipment.FSV_Line_Item__c && distributionPointList.length === 0)
                            }
                        />
                    </View>
                )}
            </View>
        )
    }

    return (
        <View style={styles.flexMarginTop}>
            {(equipment.Equip_type_cde__c === 'VEN' || equipment.Equip_type_cde__c === 'POS') && (
                <DraggableFlatList
                    data={products}
                    onDragEnd={({ data }) => {
                        const temp = _.cloneDeep(products)
                        const tempData = JSON.parse(JSON.stringify(data))
                        tempData.forEach((item, index) => {
                            item.slct_num__c = temp[index].slct_num__c
                        })
                        clearExtraValue(tempData)
                        setProducts(tempData)
                    }}
                    keyExtractor={(item, k) => item.slct_num__c + item.Name + k}
                    renderItem={renderRecommended}
                    ListHeaderComponent={
                        <>
                            {renderHeader()}
                            <View style={styles.headInput}>
                                <View style={styles.venContainer}>
                                    <CText>
                                        {originalRecommendedProduct?.length || 0}&nbsp;
                                        {t.labels.PBNA_MOBILE_RECOMMENDED}
                                        {showMaximum && maximum > 0 && ` / ${maximum} ${t.labels.PBNA_MOBILE_MAXIMUM}`}
                                    </CText>
                                </View>
                                {equipment.Equip_type_cde__c === 'VEN' && (
                                    <View style={styles.inputBoxContainer}>
                                        <CText style={styles.dollarStyle2}>$</CText>
                                        <Input
                                            containerStyle={styles.dollarInputStyle}
                                            onChangeText={(e: any) => {
                                                handleChangeText(e)
                                            }}
                                            onBlur={handleAllBlur}
                                            placeholder={'--.--'}
                                            inputContainerStyle={styles.borderBottomColor}
                                            keyboardType={'numeric'}
                                            inputStyle={styles.rateInputStyle}
                                            value={mechRateTemp?.toString() || ''}
                                            ref={mechRateRef}
                                            disabled={_.isEmpty(products) || readonly}
                                        />
                                    </View>
                                )}
                            </View>
                        </>
                    }
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            )}
            {!(equipment.Equip_type_cde__c === 'VEN' || equipment.Equip_type_cde__c === 'POS') && (
                <ScrollView style={styles.scrollViewContainer}>
                    <CText style={styles.selectAccessoryText}>{t.labels.PBNA_MOBILE_SELECT_ACCESSORIES}</CText>
                    {!_.isEmpty(requiredAccessoryList) && (
                        <CText style={styles.requiredText}>{t.labels.PBNA_MOBILE_REQUIRED}</CText>
                    )}
                    <View style={styles.selectedContainer}>
                        {requiredAccessoryList &&
                            _.map(requiredAccessoryList, (item, index) => {
                                return (
                                    <View style={styles.subTypeCell} key={index}>
                                        <CText style={commonStyle.flexShrink_1}>{item?.name}</CText>
                                    </View>
                                )
                            })}
                    </View>
                    {!readonly && (
                        <View>
                            {isEmptyAddAccessory && (
                                <View style={styles.marginTop_30}>
                                    <CText style={styles.additionalTitle}>
                                        {t.labels.PBNA_MOBILE_ADDITIONAL_OPTIONAL}{' '}
                                    </CText>
                                </View>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.flexRow,
                                    styles.flexSelectRow,
                                    !isEmptyAddAccessory && styles.noBottomLine,
                                    isEmptyAddAccessory && styles.marginBottom_30,
                                    styles.marginTopSelect
                                ]}
                                onPress={() => {
                                    setTypeModalVisible(true)
                                }}
                            >
                                {!isEmptyAddAccessory && (
                                    <CText style={[styles.additionalTitle, { marginTop: 30 }]}>
                                        {t.labels.PBNA_MOBILE_ADDITIONAL_OPTIONAL}
                                    </CText>
                                )}
                                {isEmptyAddAccessory && (
                                    <CText style={styles.placeholder}>{t.labels.PBNA_MOBILE_SELECT}</CText>
                                )}
                                <View style={[styles.flexRowAlignCenter, !isEmptyAddAccessory && { marginTop: 40 }]}>
                                    <Image source={IMG_TRIANGLE} style={styles.imgTriangle} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View
                        style={[
                            selectedAdditionalAccessory.filter((item: any) => item.select).length > 0 &&
                                styles.bottomLine,
                            selectedAdditionalAccessory.filter((item: any) => item.select).length > 0 &&
                                styles.marginBottom_30
                        ]}
                    >
                        <View style={styles.selectedContainer}>
                            {selectedAdditionalAccessory
                                .filter((item: any) => item.select)
                                .map((item: any) => {
                                    return (
                                        <View style={styles.subTypeCell} key={item?.id}>
                                            <CText>{item.name}</CText>
                                            {!readonly && (
                                                <TouchableOpacity
                                                    onPress={() => onRemoveSubType(item)}
                                                    style={styles.clearSubTypeContainer}
                                                >
                                                    <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )
                                })}
                        </View>
                    </View>
                </ScrollView>
            )}
            {isShowSelector && (
                <ProductSelector
                    cRef={selectorRef}
                    onBack={() => {
                        showProductSelector(false)
                        setIsReplaced(false)
                        setReplacedNum(null)
                    }}
                    fullServiceVendingChecked={equipment.FSV_Line_Item__c}
                    maxSelectProductNumObj={{
                        maxNum: maximum - products.length,
                        showMaximum: showMaximum && maximum > 0
                    }}
                    selectedProducts={products}
                    setSelectedProducts={(item) => {
                        setSelectedProducts(item)
                        setTempProducts(item)
                        clearExtraValue(item)
                        setProducts(item)
                    }}
                    isReplaced={isReplaced}
                    lastSelectNum={selectNum}
                    mechRate={mechRateTemp}
                    replacedNum={replacedNum}
                    typeCode={equipment.Equip_type_cde__c}
                />
            )}
            <SubTypeModal
                subTypeArray={additionalAccessoryArray}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    checkClick(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType()
                }}
                updateVisitSubType={() => {
                    updateVisitSubType()
                }}
                customTitle={t.labels.PBNA_MOBILE_ADDITIONAL_ACCESSORIES_OPTIONAL}
            />
            <DistributionPointModal
                refresh={() => {
                    setRefreshDp((prev) => prev + 1)
                }}
                isEdit={false}
                showDistributionPointModal={showDistributionPointModal}
                setShowDistributionPointModal={setShowDistributionPointModal}
                isFromRequest
                customer={customer}
                dpData={distributionPointList}
                globalModalRef={globalModalRef}
                l={l}
                type={type}
            />
            <GlobalModal ref={globalModalRef} />
            <CopyProductsModal
                copyProductsModalVisible={copyProductsModalVisible}
                setCopyProductsModalVisible={setCopyProductsModalVisible}
                maxSelectProductNumObj={{
                    maxNum: maximum - products.length,
                    showMaximum: showMaximum && maximum > 0
                }}
                productsList={products}
                setProductsList={setProducts}
                copyProductIndex={copyProductIndex}
            />
        </View>
    )
}

export default AccessoriesAndProductsForm
