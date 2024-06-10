import React, { useEffect, useRef, useState } from 'react'
import { Alert, FlatList, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Button, SearchBar } from 'react-native-elements'
import _ from 'lodash'
import BackButton from '../../../common/BackButton'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import ProductTab from './ProductTab'
import CText from '../../../../../common/components/CText'
import { restDataCommonCall } from '../../../../api/SyncUtils'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { Log } from '../../../../../common/enums/Log'
import { t } from '../../../../../common/i18n/t'
import { useAggregateList, useBrandList } from '../../../../hooks/EquipmentHooks'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CollapseContainer from '../../../common/CollapseContainer'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import QuantityInputBox from '../../lead/common/QuantityInputBox'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const IMG_CHECK = ImageSrc.IMG_CHECK
const UNCHECK_BLUE = ImageSrc.IMG_LEAD_UNCHECKED_BLUE
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        paddingHorizontal: 22,
        backgroundColor: baseStyle.color.white
    },
    subTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        marginTop: 31,
        marginBottom: 32,
        fontFamily: 'Gotham'
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham'
    },
    title: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham'
    },
    bottomButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    smallFontSize: {
        fontSize: 14
    },
    midFontSize: {
        fontSize: 16
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    tabTitle: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    },
    selectedStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingVertical: 10,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    listStyle: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    checkStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderBottomColor: '#d3d3d3',
        borderBottomWidth: 1
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 35,
        width: '100%',
        justifyContent: 'space-between'
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
    eHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingBottom: 20,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    titleContainer: {
        flex: 1,
        marginLeft: -30,
        alignItems: 'center'
    },
    productTabContainer: {
        marginTop: -20,
        paddingBottom: 10,
        marginBottom: 10
    },
    disableBackgroundColor: {
        backgroundColor: '#FFFFFF'
    },
    disableTitleColor: {
        color: '#D3D3D3'
    },
    selectedProductContainer: {
        width: '65%',
        alignItems: 'center',
        flexDirection: 'row'
    }
})

interface SelectedProductProps {
    Name: any
    // eslint-disable-next-line camelcase
    equip_mech_rte_amt__c: any
    // eslint-disable-next-line camelcase
    Material_UOM_Identifier__c: any
    // eslint-disable-next-line camelcase
    slct_num__c: any
}

interface MaxSelectProductNumObj {
    showMaximum: boolean
    maxNum: number
}
interface ProductSelectorProps {
    cRef: any
    onBack: any
    setSelectedProducts: any
    selectedProducts: Array<SelectedProductProps>
    isReplaced: boolean
    lastSelectNum: any
    mechRate: any
    replacedNum: any
    typeCode: any
    fullServiceVendingChecked: boolean
    maxSelectProductNumObj: MaxSelectProductNumObj
}

const ProductSelector = (props: ProductSelectorProps) => {
    const {
        onBack,
        selectedProducts,
        setSelectedProducts,
        isReplaced,
        mechRate,
        lastSelectNum,
        replacedNum,
        typeCode,
        fullServiceVendingChecked,
        maxSelectProductNumObj
    } = props

    const getProdMixCode = () => {
        if (typeCode === 'VEN') {
            return fullServiceVendingChecked ? '004' : '003'
        }
        return '002'
    }
    const [activeTab, setActiveTab] = useState(0)
    const [selectMode, setSelectMode] = useState(0)
    const [activeStep, setActiveStep] = useState(0)
    const aggregateList = useAggregateList(getProdMixCode())
    const brandList = useBrandList(getProdMixCode())
    const [nameList, setNameList] = useState([])
    const tabRef: any = useRef()
    const [selectAggregate, setSelectAggregate] = useState('')
    const [selectBrand, setSelectBrand] = useState('')
    const [btnText, setBtnText] = useState(t.labels.PBNA_MOBILE_ADD_PRODUCTS.toUpperCase())
    const [searchTempValue, setSearchTempValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [showSelectedProducts, setShowSelectedProducts] = useState(false)
    const [selectedProductList, setSelectedProductList] = useState([])
    // calculate the height of flat list
    const [containerHeight, setContainerHeight] = useState(0)
    const [collapseHeight, setCollapseHeight] = useState(0)
    const [productTabHeight, setProductTabHeight] = useState(0)

    const setTab = (flag) => {
        setActiveTab(flag)
        tabRef?.current?.setActiveTab(flag)
    }
    const FIRST_STEP = 0
    const NEXT_STEP = 1
    const TOTAL_NUMBER = 'totalNumber'

    const refreshTab = (flag, source) => {
        setSelectAggregate('')
        setSelectBrand('')
        setSearchTempValue('')
        setSearchValue('')
        setNameList([])
        setSelectedProductList([])
        setShowSelectedProducts(false)
        setActiveStep(FIRST_STEP)
        setTab(flag)
        if (source === 'productTab') {
            setActiveTab(flag)
            setSelectMode(flag)
        }
    }
    const popUp = async (flag, source = '') => {
        let count = 0
        selectedProductList.forEach((item) => {
            if (item.checked) {
                count++
            }
        })
        if (count > 0) {
            Alert.alert(
                t.labels.PBNA_MOBILE_THIS_WILL_RESET_THE_PRODUCT_SELECTION_PROCESS,
                t.labels.PBNA_MOBILE_WOULD_YOU_LIKE_TO_PROCEED,
                [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL
                    },
                    {
                        text: t.labels.PBNA_MOBILE_CONFIRM,
                        onPress: () => {
                            refreshTab(flag, source)
                        }
                    }
                ]
            )
        } else {
            refreshTab(flag, source)
        }
    }
    const handleClickBackButton = () => {
        Alert.alert(
            t.labels.PBNA_MOBILE_THIS_WILL_RESET_THE_PRODUCT_SELECTION_PROCESS,
            t.labels.PBNA_MOBILE_WOULD_YOU_LIKE_TO_PROCEED,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: t.labels.PBNA_MOBILE_CONFIRM,
                    onPress: () => {
                        onBack()
                    }
                }
            ]
        )
    }
    const getNameList = (type, value) => {
        const path =
            type === 'aggregate'
                ? `query/?q=SELECT Id,Name,Material_UOM_Identifier__c FROM Product2 WHERE Package_Type__c = '${value}' 
            AND PROD_MIX_CDE__C='${getProdMixCode()}' AND Product_Group_Code__c NOT IN ('013', '023','016') AND IsActive = TRUE AND IsDeleted = FALSE`
                : `query/?q=SELECT Id,Name,Material_UOM_Identifier__c FROM Product2 WHERE Sub_Brand__c = '${value}' 
            AND PROD_MIX_CDE__C='${getProdMixCode()}' AND Product_Group_Code__c NOT IN ('013', '023','016') AND IsActive = TRUE AND IsDeleted = FALSE`
        restDataCommonCall(path, 'GET')
            .then((res) => {
                if (res && res.data && res.data.records && res.data.records.length) {
                    const result = res.data.records
                    const arr = _.map(result, (item) => {
                        return {
                            Id: item.Id,
                            Name: item.Name,
                            equip_mech_rte_amt__c: mechRate || '',
                            Material_UOM_Identifier__c: item.Material_UOM_Identifier__c,
                            checked: false,
                            totalNumber: 1
                        }
                    })
                    setNameList(arr)
                    setActiveStep(NEXT_STEP)
                }
            })
            .catch((e) => {
                storeClassLog(Log.MOBILE_ERROR, 'getNameList', 'refresh name list: ' + ErrorUtils.error2String(e))
            })
    }
    useEffect(() => {
        let text = t.labels.PBNA_MOBILE_ADD_PRODUCTS.toUpperCase()
        if (!isReplaced) {
            if (_.sumBy(selectedProductList, TOTAL_NUMBER) === 1) {
                text = t.labels.PBNA_MOBILE_ADD_1_PRODUCT
            } else if (_.sumBy(selectedProductList, TOTAL_NUMBER) !== 0) {
                text = `${t.labels.PBNA_MOBILE_ADD} ${_.sumBy(
                    selectedProductList,
                    TOTAL_NUMBER
                )} ${t.labels.PBNA_MOBILE_PRODUCTS.toUpperCase()}`
            }
            setBtnText(text)
        }
    }, [selectedProductList])

    const handleMultiTotalProducts = (productList: any) => {
        return productList.flatMap((item: any) =>
            item.totalNumber > 0 ? Array.from({ length: item.totalNumber }, () => ({ ...item })) : item
        )
    }

    const saveSelectedProducts = () => {
        if (isReplaced) {
            const tempArr = handleMultiTotalProducts(_.cloneDeep(selectedProducts))
            tempArr[replacedNum] = {
                Name: selectedProductList[0].Name,
                Material_UOM_Identifier__c: selectedProductList[0].Material_UOM_Identifier__c,
                equip_mech_rte_amt__c: mechRate || '',
                slct_num__c: selectedProducts[replacedNum].slct_num__c
            }
            setSelectedProducts(tempArr)
        } else {
            const tempList = handleMultiTotalProducts(selectedProductList)
            const arr = _.map(tempList, (item, index) => {
                return {
                    Name: item.Name,
                    Material_UOM_Identifier__c: item.Material_UOM_Identifier__c,
                    equip_mech_rte_amt__c: mechRate || '',
                    slct_num__c: (lastSelectNum + index).toString()
                }
            })
            const combinedArr = [...selectedProducts, ...arr]
            setSelectedProducts(combinedArr)
        }
        onBack()
    }
    const imgSrc = require('../../../../../../assets/image/ios-chevron-right.png')
    const renderAggregateList = ({ index, item }) => {
        return (
            <TouchableOpacity
                key={`aggregate${index}`}
                style={styles.listStyle}
                onPress={() => {
                    setActiveStep(NEXT_STEP)
                    setSelectAggregate(item.Name)
                    getNameList('aggregate', item.Type)
                }}
            >
                <CText style={[styles.navTitle]}>{item.Name}</CText>
                <Image source={imgSrc} />
            </TouchableOpacity>
        )
    }
    const renderBrandList = ({ item }) => {
        return (
            <TouchableOpacity
                key={`brand${item}`}
                style={styles.listStyle}
                onPress={() => {
                    setActiveStep(NEXT_STEP)
                    setSelectBrand(item)
                    getNameList('brands', item)
                }}
            >
                <CText style={[styles.navTitle, { flex: 1 }]}>{item}</CText>
                <Image source={imgSrc} />
            </TouchableOpacity>
        )
    }
    const renderNameList = ({ index, item }) => {
        return item.checked ? (
            <View />
        ) : (
            <TouchableOpacity
                style={styles.checkStyle}
                onPress={() => {
                    const nameListArr = JSON.parse(JSON.stringify(nameList))
                    const tempList = _.cloneDeep(selectedProductList)
                    const tempProduct = _.cloneDeep(item)
                    tempProduct.checked = true
                    if (isReplaced) {
                        nameListArr.forEach((value, nameListIndex) => {
                            value.checked = nameListIndex === index
                        })
                        setNameList(nameListArr)
                        setSelectedProductList([tempProduct])
                    } else {
                        nameListArr[index].checked = true
                        tempList.push(tempProduct)
                        setNameList(nameListArr)
                        setSelectedProductList(tempList)
                    }
                }}
                key={index}
            >
                <View style={styles.containerStyle}>
                    {isReplaced ? (
                        <Image
                            source={item.checked ? ImageSrc.IMG_CHECK_CIRCLE : ImageSrc.IMG_UNCHECK_CIRCLE}
                            style={styles.checkedIcon}
                        />
                    ) : (
                        <Image source={item.checked ? IMG_CHECK : UNCHECK_BLUE} style={styles.checkedIcon} />
                    )}
                </View>
                <CText style={[styles.navTitle]}>{item.Name}</CText>
            </TouchableOpacity>
        )
    }
    const renderSelectedProductList = ({ index, item }) => {
        return (
            <View style={[styles.checkStyle, commonStyle.justifyContentSB]} key={index}>
                <TouchableOpacity
                    style={styles.selectedProductContainer}
                    onPress={() => {
                        const nameListArr = JSON.parse(JSON.stringify(nameList))
                        const tempList = _.cloneDeep(selectedProductList)
                        if (item.checked) {
                            tempList.splice(index, 1)
                            setSelectedProductList(tempList)
                            nameListArr.forEach((nameItem) => {
                                if (nameItem.Id === item.Id) {
                                    nameItem.checked = false
                                }
                            })
                            setNameList(nameListArr)
                        }
                    }}
                >
                    <View style={styles.containerStyle}>
                        {isReplaced ? (
                            <Image
                                source={item.checked ? ImageSrc.IMG_CHECK_CIRCLE : ImageSrc.IMG_UNCHECK_CIRCLE}
                                style={styles.checkedIcon}
                            />
                        ) : (
                            <Image source={item.checked ? IMG_CHECK : UNCHECK_BLUE} style={styles.checkedIcon} />
                        )}
                    </View>
                    <CText style={[styles.navTitle]} numberOfLines={2}>
                        {item.Name}
                    </CText>
                </TouchableOpacity>
                {!isReplaced && (
                    <QuantityInputBox
                        value={item.totalNumber}
                        title={t.labels.PBNA_MOBILE_TOTAL}
                        onChangeText={(text) => {
                            const newText = text === '0' ? '1' : parseInt(text || '1').toString()
                            const newList = [...selectedProductList]
                            newList[index].totalNumber = Number(newText)
                            setSelectedProductList(newList)
                        }}
                        onPressMinus={() => {
                            if (Number(item.totalNumber) > 1) {
                                const newList = [...selectedProductList]
                                newList[index].totalNumber -= 1
                                setSelectedProductList(newList)
                            }
                        }}
                        disableMinus={item.totalNumber <= 1}
                        onPressPlus={() => {
                            // only allow 3 digits
                            if (Number(item.totalNumber) < 999) {
                                const newList = [...selectedProductList]
                                newList[index].totalNumber += 1
                                setSelectedProductList(newList)
                            }
                        }}
                        disablePlus={
                            _.sumBy(selectedProductList, TOTAL_NUMBER) >= maxSelectProductNumObj?.maxNum &&
                            maxSelectProductNumObj?.showMaximum
                        }
                    />
                )}
            </View>
        )
    }
    const handleDisableBtn = (selectedNames) => {
        const isSelectNames = _.isEmpty(selectedNames)
        const isShowMax = maxSelectProductNumObj?.showMaximum
        if (isShowMax) {
            const calculateMaximum = isReplaced ? maxSelectProductNumObj?.maxNum + 1 : maxSelectProductNumObj?.maxNum
            const isMaxNum = _.sumBy(selectedProductList, TOTAL_NUMBER) > calculateMaximum
            return isSelectNames || isMaxNum
        }
        return isSelectNames
    }
    const searchProductsByDescription = (searchV) => {
        if (searchV.length >= 3) {
            restDataCommonCall(
                `query/?q=SELECT Id,Name,Material_UOM_Identifier__c FROM Product2 
            WHERE (Name Like '%${searchV}%' OR Sub_Brand__c LIKE '%${searchV}%' OR Package_Type_Name__c LIKE 
            '%${searchV}%') AND PROD_MIX_CDE__C='${getProdMixCode()}' AND 
            Product_Group_Code__c NOT IN ('013','023','016') AND IsActive = TRUE AND IsDeleted = FALSE`,
                'GET'
            )
                .then((res) => {
                    if (res.data.records.length > 0) {
                        const result = res.data.records
                        const arr = _.map(result, (item) => {
                            return {
                                Id: item.Id,
                                Name: item.Name,
                                equip_mech_rte_amt__c: mechRate || '',
                                Material_UOM_Identifier__c: item.Material_UOM_Identifier__c,
                                checked: false,
                                totalNumber: 1
                            }
                        })
                        if (selectedProductList.length > 0) {
                            selectedProductList.forEach((selectedItem) => {
                                arr.forEach((item) => {
                                    if (selectedItem.Id === item.Id) {
                                        item.checked = true
                                    }
                                })
                            })
                        }
                        setNameList(arr)
                        setActiveStep(1)
                        setSelectMode(3)
                    } else {
                        setNameList([])
                        setActiveStep(1)
                        setSelectMode(3)
                    }
                })
                .catch((e) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'searchProductsByDescription',
                        'search products: ' + ErrorUtils.error2String(e)
                    )
                    setNameList([])
                })
        }
    }

    const renderSelectTitle = () => {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <CText>
                    {_.sumBy(selectedProductList, TOTAL_NUMBER)}&nbsp;{t.labels.PBNA_MOBILE_SELECTED_PRODUCTS}
                </CText>
                {maxSelectProductNumObj?.showMaximum && maxSelectProductNumObj?.maxNum > 0 && (
                    <CText>
                        {' '}
                        / {maxSelectProductNumObj?.maxNum} {t.labels.PBNA_MOBILE_MAXIMUM}
                    </CText>
                )}
            </View>
        )
    }

    return (
        <Modal visible>
            <SafeAreaView style={[styles.container, styles.whiteContainer]}>
                <View style={styles.eHeader}>
                    <View style={styles.eHeaderContainer}>
                        <View>
                            <BackButton extraStyle={{ tintColor: '#0098D4' }} onBackPress={handleClickBackButton} />
                        </View>
                        <View style={styles.titleContainer}>
                            <CText style={[styles.title]}>{t.labels.PBNA_MOBILE_PRODUCT_SELECTOR.toUpperCase()}</CText>
                        </View>
                    </View>
                    <View style={commonStyle.alignCenter}>
                        <CText style={styles.subTitle}>{t.labels.PBNA_MOBILE_SELECT_ATTRIBUTE}</CText>
                    </View>
                    <View style={styles.searchBarContainer}>
                        {/* @ts-ignore */}
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH}
                            allowFontScaling={false}
                            clearIcon={null}
                            showCancel
                            cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                            containerStyle={styles.searchBarInnerContainer}
                            inputContainerStyle={styles.searchBarInputContainer}
                            inputStyle={styles.searchInputContainer}
                            value={searchTempValue}
                            // @ts-ignore
                            onChangeText={(v) => {
                                setSearchTempValue(v)
                            }}
                            onBlur={() => {
                                setSearchValue(searchTempValue)
                                searchProductsByDescription(searchTempValue)
                            }}
                            onCancel={() => {
                                setSearchTempValue('')
                                setSearchValue(searchTempValue)
                                setSelectMode(0)
                                setActiveTab(0)
                                setActiveStep(0)
                            }}
                        />
                    </View>
                    <View
                        style={{ flex: 1 }}
                        onLayout={(event) => {
                            const { height } = event.nativeEvent.layout
                            setContainerHeight(height)
                        }}
                    >
                        {selectedProductList.length > 0 && (
                            <View
                                style={{ marginBottom: 30, maxHeight: containerHeight - 60 }}
                                onLayout={(event) => {
                                    const { height } = event.nativeEvent.layout
                                    setCollapseHeight(height > 0 ? height + 30 : 0)
                                }}
                            >
                                <CollapseContainer
                                    setShowContent={setShowSelectedProducts}
                                    showContent={showSelectedProducts}
                                    title={renderSelectTitle()}
                                    noTopLine
                                    containerStyle={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 20
                                    }}
                                    titleStyle={{ fontSize: 16, fontWeight: 'bold' }}
                                >
                                    <FlatList
                                        data={selectedProductList}
                                        renderItem={renderSelectedProductList}
                                        style={{ maxHeight: containerHeight - 60 }}
                                    />
                                </CollapseContainer>
                            </View>
                        )}
                        {searchValue.length < 3 && containerHeight - 60 > collapseHeight && (
                            <View
                                style={{ marginTop: -20, paddingBottom: 10, marginBottom: 10 }}
                                onLayout={(event) => {
                                    const { height } = event.nativeEvent.layout
                                    setProductTabHeight(height + 60)
                                }}
                            >
                                <ProductTab
                                    cRef={tabRef}
                                    activeStep={activeStep || 0}
                                    tabStyle={{
                                        tabButton: { borderBottomColor: 'white' },
                                        tabTitle: { ...{ color: '#0098D4' }, ...styles.tabTitle }
                                    }}
                                    onPressTab={(idx) => {
                                        setSelectMode(idx)
                                        setActiveStep(FIRST_STEP)
                                    }}
                                    setActiveSection={(v) => {
                                        popUp(v, 'productTab')
                                        // setActiveTab(v)
                                    }}
                                />
                            </View>
                        )}
                        {containerHeight - 60 > collapseHeight && (
                            <View>
                                {selectMode === 0 && (
                                    <View>
                                        {activeTab === 0 && activeStep === 0 && (
                                            <FlatList
                                                renderItem={renderAggregateList}
                                                data={aggregateList}
                                                contentContainerStyle={{ paddingBottom: 60 }}
                                            />
                                        )}
                                        {activeTab === 0 && activeStep === 1 && (
                                            <View style={styles.selectedStyle}>
                                                <BackButton
                                                    extraStyle={styles.tintColor}
                                                    onBackPress={() => {
                                                        popUp(activeTab)
                                                    }}
                                                />
                                                <CText style={styles.midFontSize}>{selectAggregate}</CText>
                                            </View>
                                        )}
                                    </View>
                                )}
                                {selectMode === 1 && (
                                    <View>
                                        {activeTab === 1 && activeStep === 0 && (
                                            <FlatList
                                                renderItem={renderBrandList}
                                                data={brandList}
                                                contentContainerStyle={{ paddingBottom: 60 }}
                                            />
                                        )}
                                        {activeTab === 1 && activeStep === 1 && (
                                            <View style={styles.selectedStyle}>
                                                <BackButton
                                                    extraStyle={styles.tintColor}
                                                    onBackPress={() => {
                                                        popUp(activeTab)
                                                    }}
                                                />
                                                <CText style={styles.midFontSize}>{selectBrand}</CText>
                                            </View>
                                        )}
                                    </View>
                                )}
                                {activeStep === 1 && (
                                    <View
                                        style={{
                                            height:
                                                containerHeight -
                                                (selectedProductList.length > 0 ? collapseHeight : 0) -
                                                (searchValue.length < 3 ? productTabHeight : 0)
                                        }}
                                    >
                                        <FlatList
                                            renderItem={renderNameList}
                                            data={nameList}
                                            contentContainerStyle={{ paddingBottom: 60 }}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
            <SafeAreaView
                style={[
                    styles.bottomButton,
                    styles.flexDirectionRow,
                    {
                        zIndex: 1,
                        position: 'relative',
                        alignItems: 'center'
                    }
                ]}
            >
                <View style={[{ width: '100%' }]}>
                    <Button
                        onPress={() => {
                            saveSelectedProducts()
                        }}
                        title={btnText}
                        titleStyle={[
                            styles.fontFamily,
                            styles.fontPurpleColor,
                            styles.smallFontSize,
                            styles.fontWhiteColor
                        ]}
                        disabled={handleDisableBtn(selectedProductList)}
                        containerStyle={styles.buttonSize}
                        disabledStyle={styles.disableBackgroundColor}
                        disabledTitleStyle={styles.disableTitleColor}
                        buttonStyle={[styles.bgPurpleColor, styles.buttonSize]}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export default ProductSelector
