/**
 * @description Select POS View
 * @author Sheng Huang
 * @date 2023-03-20
 */

import React, { Dispatch, FC, Ref, SetStateAction, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { SearchBar } from 'react-native-elements'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { usePOSCategory, usePOSList } from '../../../../hooks/POSHooks'
import { useDebounce } from '../../../../hooks/CommonHooks'
import AddPOSDetailsModal, { AddPOSDetailsModalRef } from './AddPOSDetailsModal'
import BreadcrumbsComponent, { BreadcrumbType, sliceBreadcrumbsList } from '../../lead/common/BreadcrumbsComponent'
import { useDispatch, useSelector } from 'react-redux'
import { updateCustomerPOSDetail } from '../../../../redux/action/CustomerActionType'
import _ from 'lodash'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'

export interface SelectPOSViewRef {
    backToSelectCategory: (index: number) => void
    // eslint-disable-next-line camelcase
    setPOSListBreadcrumbs: (item: { Category_Id__c: string; Category_Name__c: string }) => void
}

interface POSSelectorProps {
    activePart: SelectPOSStep
    setActivePart: Dispatch<SetStateAction<SelectPOSStep>>
    pressBackAlert: (fn: Function, msg: string) => void
    cRef?: Ref<SelectPOSViewRef>
    customer: any
    setCategoryId: any
    categoryId: any
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 18,
        overflow: 'hidden',
        fontWeight: '800',
        color: 'black',
        marginTop: 8
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 22,
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 22
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
    listStyle: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3',
        paddingVertical: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 22
    },
    listTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginBottom: 5
    },
    editText: {
        fontWeight: '500',
        color: '#00A2D9'
    },
    removeText: {
        fontWeight: '500',
        color: '#EB445A'
    },
    labelStyle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    imgBack: {
        width: 12,
        height: 20,
        marginRight: 20,
        marginTop: 10
    },
    selectedPOSStyle: {
        backgroundColor: baseStyle.color.bgGray,
        paddingHorizontal: 22,
        marginHorizontal: 0
    },
    editTextContainer: {
        flexDirection: 'row',
        marginTop: 5
    },
    container: {
        flex: 1,
        marginTop: 22
    },
    confirmButtonStyle: {
        marginBottom: 10,
        marginHorizontal: 22
    },
    eImgCheck: {
        width: 20,
        height: 20,
        marginRight: 2
    },
    marginTop_10: {
        marginTop: 10
    }
})
export enum SelectPOSStep {
    SELECT_CATEGORY,
    SELECT_POS,
    ADD_DETAILS
}
const SelectPOSView: FC<POSSelectorProps> = (props: POSSelectorProps) => {
    const { activePart, setActivePart, pressBackAlert, customer, setCategoryId, categoryId } = props
    const addPOSDetailsModalRef = useRef<AddPOSDetailsModalRef>(null)
    const flatListRef = useRef<KeyboardAwareFlatList>(null)
    const searchBarRef = useRef<TextInput>(null)
    const [searchTempValue, setSearchTempValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [posDetail, setPosDetail] = useState<any>({})
    const [breadcrumbsList, setBreadcrumbsList] = useState<Array<BreadcrumbType>>([])
    const locationId = customer['Account.LOC_PROD_ID__c']
    const category = usePOSCategory(searchValue, locationId)
    const posList = usePOSList(searchValue, categoryId, locationId)
    const posDetailList = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posDetailList)
    const dispatch = useDispatch()

    useDebounce(
        () => {
            setSearchValue(searchTempValue)
        },
        500,
        [searchTempValue]
    )

    const judgeDisablePOS = (item: any) => {
        if (item.Product_Name__c === 'Lettered' || item.Product_Name__c === 'Special / Customer Artwork') {
            return false
        }
        return (
            _.findIndex(posDetailList, {
                Category_Id__c: item?.Category_Id__c,
                Product_Name__c: item?.Product_Name__c,
                Id: item?.Id
            }) !== -1
        )
    }

    const sortedPOSList = useMemo(() => {
        const tempList: Array<any> = []
        posList.forEach((value: any, index: number) => {
            const disable = judgeDisablePOS(value)
            tempList.push({ ...posList[index], disable: disable })
        })
        return _.orderBy(tempList, ['disable'], ['desc'])
    }, [posList, posDetailList])

    const clearSearchBar = () => {
        setSearchValue('')
        setSearchTempValue('')
        searchBarRef?.current?.clear()
    }

    const backToSelectCategory = (index: number) => {
        pressBackAlert(() => {
            setActivePart(SelectPOSStep.SELECT_CATEGORY)
            setCategoryId('')
            addPOSDetailsModalRef?.current?.closeModal()
            sliceBreadcrumbsList(setBreadcrumbsList, index)
            clearSearchBar()
        }, t.labels.PBNA_MOBILE_SELECT_POS_BACK_MSG)
    }

    const backToPOSList = (index: number) => {
        pressBackAlert(() => {
            setActivePart(SelectPOSStep.SELECT_POS)
            setPosDetail({})
            addPOSDetailsModalRef?.current?.closeModal()
            sliceBreadcrumbsList(setBreadcrumbsList, index)
        }, t.labels.PBNA_MOBILE_SELECT_POS_BACK_MSG)
    }

    useImperativeHandle(props.cRef, () => ({
        backToSelectCategory: (index: number) => {
            backToSelectCategory(index)
        },
        // eslint-disable-next-line camelcase
        setPOSListBreadcrumbs: (item: { Category_Id__c: string; Category_Name__c: string }) => {
            setBreadcrumbsList((prevState) => {
                return prevState.concat({
                    id: item.Category_Id__c,
                    label: item.Category_Name__c,
                    onPress: (index) => {
                        backToSelectCategory(index)
                    }
                })
            })
        }
    }))

    // eslint-disable-next-line camelcase
    const renderCategory = ({
        item,
        index
    }: {
        // Salesforce API Name
        // eslint-disable-next-line camelcase
        item: { Category_Id__c: string; Category_Name__c: string }
        index: number
    }) => {
        return (
            <TouchableOpacity
                key={index}
                style={styles.listStyle}
                onPress={() => {
                    setCategoryId(item.Category_Id__c)
                    setActivePart(SelectPOSStep.SELECT_POS)
                    clearSearchBar()
                    setBreadcrumbsList((prevState) => {
                        return prevState.concat({
                            id: item.Category_Id__c,
                            label: item.Category_Name__c,
                            onPress: (index) => {
                                backToSelectCategory(index)
                            }
                        })
                    })
                }}
            >
                <CText style={[styles.listTitle, { maxWidth: '90%' }]}>{item?.Category_Name__c}</CText>
                <Image source={require('../../../../../../assets/image/ios-chevron-right.png')} />
            </TouchableOpacity>
        )
    }

    const renderPOSList = ({ item, index }: any) => {
        const secondLineList = _.compact([item?.Package_Size_Name__c, item?.Color_Name__c, item?.Brand_Name__c])
        const secondLine = secondLineList.join(' ')
        return (
            <TouchableOpacity
                key={index}
                style={styles.listStyle}
                onPress={() => {
                    setPosDetail(item)
                    addPOSDetailsModalRef?.current?.openModal()
                    clearSearchBar()
                    setBreadcrumbsList((prevState) => {
                        return prevState.concat({
                            id: null,
                            label: item?.Product_Name__c,
                            onPress: (index) => {
                                backToPOSList(index)
                            }
                        })
                    })
                }}
                disabled={item?.disable}
            >
                <View style={{ width: '90%' }}>
                    <CText style={styles.listTitle}>{item?.Product_Name__c}</CText>
                    {!_.isEmpty(item?.Product_Subtype__c) && (
                        <CText style={{ marginBottom: 5 }}>{item?.Product_Subtype__c}</CText>
                    )}
                    {(!_.isEmpty(item?.Package_Size_Name__c) ||
                        !_.isEmpty(item?.Color_Name__c) ||
                        !_.isEmpty(item?.Brand_Name__c)) && (
                        <CText numberOfLines={1} style={styles.labelStyle}>
                            {secondLine}
                        </CText>
                    )}
                </View>
                {item?.disable ? (
                    <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.eImgCheck} />
                ) : (
                    <Image source={require('../../../../../../assets/image/ios-chevron-right.png')} />
                )}
            </TouchableOpacity>
        )
    }

    const onPressRemove = (index: number) => {
        const newList = _.cloneDeep(posDetailList)
        newList.splice(index, 1)
        dispatch(updateCustomerPOSDetail(newList))
    }

    const onPressEdit = (index: number) => {
        const newList = _.cloneDeep(posDetailList)
        const selectItem = newList.splice(index, 1)
        dispatch(updateCustomerPOSDetail(newList))
        setPosDetail(selectItem[0])
        setCategoryId(selectItem[0]?.Category_Id__c)
        setActivePart(SelectPOSStep.SELECT_POS)
        clearSearchBar()
        setBreadcrumbsList([
            {
                id: selectItem[0]?.Category_Id__c,
                label: selectItem[0]?.Category_Name__c,
                onPress: (index) => {
                    backToSelectCategory(index)
                }
            },
            {
                id: null,
                label: selectItem[0]?.Product_Name__c,
                onPress: (index) => {
                    backToPOSList(index)
                }
            }
        ])
        addPOSDetailsModalRef?.current?.setQuantity(selectItem[0]?.Order_Quantity__c)
        addPOSDetailsModalRef?.current?.setSpecialInstructions(selectItem[0]?.Spcl_Inst__c)
        addPOSDetailsModalRef?.current?.setBannerText({
            bannerTextOne: selectItem[0]?.BannerText1__c,
            bannerTextTwo: selectItem[0]?.BannerText2__c,
            bannerTextThree: selectItem[0]?.BannerText3__c,
            bannerTextFour: selectItem[0]?.BannerText4__c,
            bannerTextFive: selectItem[0]?.BannerText5__c
        })
        addPOSDetailsModalRef?.current?.openModal()
    }

    // eslint-disable-next-line camelcase
    const renderSelectedPOS = (
        item: {
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Product_Name__c: any
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Product_Subtype__c: any
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Package_Size_Name__c: any
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Color_Name__c: any
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Brand_Name__c: any
            // Salesforce API Name
            // eslint-disable-next-line camelcase
            Order_Quantity__c: any
        },
        index: number
    ) => {
        const secondLineList = _.compact([item?.Package_Size_Name__c, item?.Color_Name__c, item?.Brand_Name__c])
        const secondLine = secondLineList.join(' ')
        return (
            <View key={index} style={[styles.listStyle, styles.selectedPOSStyle]}>
                <View style={{ width: '90%' }}>
                    <CText style={styles.listTitle}>{item?.Product_Name__c}</CText>
                    {!_.isEmpty(item?.Product_Subtype__c) && (
                        <CText style={{ marginBottom: 5 }}>{item?.Product_Subtype__c}</CText>
                    )}
                    {(!_.isEmpty(item?.Package_Size_Name__c) ||
                        !_.isEmpty(item?.Color_Name__c) ||
                        !_.isEmpty(item?.Brand_Name__c)) && (
                        <CText numberOfLines={1} style={styles.labelStyle}>
                            {secondLine}
                        </CText>
                    )}
                    <View style={styles.editTextContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                onPressEdit(index)
                            }}
                        >
                            <CText style={styles.editText}>{t.labels.PBNA_MOBILE_EDIT.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <CText style={{ color: baseStyle.color.liteGrey }}>&nbsp;|&nbsp;</CText>
                        <TouchableOpacity
                            onPress={() => {
                                onPressRemove(index)
                            }}
                        >
                            <CText style={styles.removeText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={commonStyle.alignCenter}>
                    <CText style={[styles.titleText]}>{item?.Order_Quantity__c}</CText>
                    <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_QTY}</CText>
                </View>
            </View>
        )
    }

    const getListData = () => {
        switch (activePart) {
            case SelectPOSStep.SELECT_CATEGORY:
                return category
            case SelectPOSStep.SELECT_POS:
                return sortedPOSList
            case SelectPOSStep.ADD_DETAILS:
            default:
        }
    }

    const renderItem = ({ item, index }: any) => {
        switch (activePart) {
            case SelectPOSStep.SELECT_CATEGORY:
                return renderCategory({ item, index })
            case SelectPOSStep.SELECT_POS:
                return renderPOSList({ item, index })
            case SelectPOSStep.ADD_DETAILS:
            default:
                return <View />
        }
    }

    const onAddDetail = () => {
        setActivePart(SelectPOSStep.SELECT_CATEGORY)
        setCategoryId('')
        setBreadcrumbsList([])
        flatListRef?.current?.scrollToPosition(0, 0)
    }

    return (
        <View style={styles.container}>
            <KeyboardAwareFlatList
                data={getListData()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        {!_.isEmpty(posDetailList) && (
                            <View style={{ marginBottom: 5 }}>{posDetailList.map(renderSelectedPOS)}</View>
                        )}
                        <View style={{ marginHorizontal: 22 }}>
                            <View style={[commonStyle.flexDirectionRow, styles.marginTop_10]}>
                                {activePart === SelectPOSStep.SELECT_POS && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            backToSelectCategory(SelectPOSStep.SELECT_CATEGORY)
                                        }}
                                    >
                                        <Image source={ImageSrc.IMG_BACK} style={styles.imgBack} />
                                    </TouchableOpacity>
                                )}
                                <CText style={styles.titleText}>
                                    {activePart === SelectPOSStep.SELECT_CATEGORY
                                        ? t.labels.PBNA_MOBILE_SELECT_POS_CATEGORY
                                        : t.labels.PBNA_MOBILE_SELECT_POS}
                                </CText>
                            </View>
                            <View style={styles.searchBarContainer}>
                                {/* @ts-ignore */}
                                <SearchBar
                                    platform={'ios'}
                                    placeholder={
                                        activePart === SelectPOSStep.SELECT_CATEGORY
                                            ? t.labels.PBNA_MOBILE_SEARCH_POS_CATEGORY
                                            : t.labels.PBNA_MOBILE_SEARCH_POS
                                    }
                                    allowFontScaling={false}
                                    showCancel={false}
                                    clearButtonMode={'never'}
                                    cancelButtonTitle={''}
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
                                    }}
                                    onCancel={() => {
                                        setSearchTempValue('')
                                        setSearchValue(searchTempValue)
                                    }}
                                    cancelButtonProps={{ style: { width: 0 } }}
                                    lightTheme
                                    round
                                    ref={searchBarRef}
                                />
                            </View>
                            <BreadcrumbsComponent breadcrumbsList={breadcrumbsList} />
                        </View>
                    </>
                }
                ref={flatListRef}
            />
            <AddPOSDetailsModal
                setBreadcrumbsList={setBreadcrumbsList}
                breadcrumbsList={breadcrumbsList}
                posDetail={posDetail}
                pressBackAlert={pressBackAlert}
                onAddDetail={onAddDetail}
                cRef={addPOSDetailsModalRef}
            />
        </View>
    )
}

export default SelectPOSView
