/**
 * @description Add POS Detail Modal
 * @author Sheng Huang
 * @date 2023-03-21
 */

import React, { Dispatch, FC, Ref, SetStateAction, useImperativeHandle, useRef, useState } from 'react'
import FullScreenModal, { FullScreenModalRef } from '../../lead/common/FullScreenModal'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { StyleSheet, TextInput, View } from 'react-native'
import BreadcrumbsComponent, { BreadcrumbType } from '../../lead/common/BreadcrumbsComponent'
import CText from '../../../../../common/components/CText'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import QuantityInputBox from '../../lead/common/QuantityInputBox'
import { t } from '../../../../../common/i18n/t'
import { useDispatch, useSelector } from 'react-redux'
import { updateCustomerPOSDetail } from '../../../../redux/action/CustomerActionType'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import _, { isEmpty } from 'lodash'
import LeadInput from '../../lead/common/LeadInput'

interface AddPOSDetailsModalProps {
    breadcrumbsList: Array<BreadcrumbType>
    setBreadcrumbsList: Dispatch<SetStateAction<Array<BreadcrumbType>>>
    posDetail: any
    pressBackAlert: (fn: Function, msg: string, showAlert: boolean) => void
    onAddDetail: () => void
    cRef: Ref<AddPOSDetailsModalRef>
}

interface AddPOSDetailsModalEditProps {
    breadcrumbsList: Array<BreadcrumbType>
    setBreadcrumbsList: Dispatch<SetStateAction<Array<BreadcrumbType>>>
    posDetail: any
    pressBackAlert: (fn: Function, msg: string, showAlert: boolean) => void
    onAddDetail: () => void
    cRef: Ref<AddPOSDetailsModalRef>
    edit: boolean
    editIndex: number
}

export interface AddPOSDetailsModalRef {
    setQuantity: (value: string) => void
    setSpecialInstructions: (value: string) => void
    setBannerText: (value: object) => void
    closeModal: () => void
    openModal: () => void
}

const styles = StyleSheet.create({
    labelText: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    container: {
        flex: 1,
        marginHorizontal: 22
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    quantityContainer: {
        marginVertical: 22,
        paddingBottom: 10,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignContent: 'center'
    },
    labelStyle: {
        fontSize: 14,
        color: '#565656',
        fontWeight: '400'
    },
    textInputStyle: {
        marginTop: 10,
        paddingBottom: 10,
        fontFamily: 'Gotham'
    },
    halfWidth: {
        width: '50%'
    },
    marginTop_22: {
        marginTop: 22
    },
    marginTop_10: {
        marginTop: 10
    },
    marginTop_30: {
        marginTop: 30
    }
})

const BANNER_TEXT_LENGTH = 25

const AddPOSDetailsModal: FC<AddPOSDetailsModalProps | AddPOSDetailsModalEditProps> = (
    props: AddPOSDetailsModalProps | AddPOSDetailsModalEditProps
) => {
    const { breadcrumbsList, setBreadcrumbsList, posDetail, pressBackAlert, onAddDetail, cRef } = props
    const posDetailList = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posDetailList)
    const dispatch = useDispatch()
    const [quantity, setQuantity] = useState('0')
    const [specialInstructions, setSpecialInstructions] = useState('')
    const [bannerText, setBannerText] = useState({
        bannerTextOne: '',
        bannerTextTwo: '',
        bannerTextThree: '',
        bannerTextFour: '',
        bannerTextFive: ''
    })
    const fullScreenModalRef = useRef<FullScreenModalRef>(null)
    const isShowBanner =
        breadcrumbsList[0]?.id === 3 &&
        (breadcrumbsList[1]?.label === 'Special / Customer Artwork' || breadcrumbsList[1]?.label === 'Lettered')
    const resetPOSDetailProps = () => {
        setQuantity('0')
        setSpecialInstructions('')
        setBannerText({
            bannerTextOne: '',
            bannerTextTwo: '',
            bannerTextThree: '',
            bannerTextFour: '',
            bannerTextFive: ''
        })
    }
    const onPressAdd = () => {
        const editItem = {
            ...posDetail,
            Order_Quantity__c: quantity,
            Spcl_Inst__c: specialInstructions,
            BannerText1__c: bannerText.bannerTextOne,
            BannerText2__c: bannerText.bannerTextTwo,
            BannerText3__c: bannerText.bannerTextThree,
            BannerText4__c: bannerText.bannerTextFour,
            BannerText5__c: bannerText.bannerTextFive
        }
        if ('edit' in props) {
            const test = _.cloneDeep(posDetailList)
            test[props.editIndex] = editItem
            dispatch(updateCustomerPOSDetail(test))
        } else {
            dispatch(updateCustomerPOSDetail([...posDetailList, editItem]))
        }
        resetPOSDetailProps()
        onAddDetail()
        fullScreenModalRef?.current?.closeModal()
    }

    useImperativeHandle(cRef, () => ({
        setQuantity: (value: string) => {
            setQuantity(value)
        },
        setSpecialInstructions: (value: string) => {
            setSpecialInstructions(value)
        },
        setBannerText: (value: any) => {
            setBannerText(value)
        },
        closeModal: () => {
            fullScreenModalRef?.current?.closeModal()
            resetPOSDetailProps()
        },
        openModal: () => {
            fullScreenModalRef?.current?.openModal()
        }
    }))
    const renderBannerTextView = () => {
        return (
            <View style={styles.marginTop_30}>
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_BANNER_TEXT_1_REQUIRED}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_BANNER_TEXT_1_HERE}
                    onChangeText={(v: string) => {
                        setBannerText({
                            ...bannerText,
                            bannerTextOne: v
                        })
                    }}
                    initValue={bannerText?.bannerTextOne}
                    multiline
                    maxLength={BANNER_TEXT_LENGTH}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_BANNER_TEXT_2}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_BANNER_TEXT_2_HERE}
                    onChangeText={(v: string) => {
                        setBannerText({
                            ...bannerText,
                            bannerTextTwo: v
                        })
                    }}
                    initValue={bannerText?.bannerTextTwo}
                    multiline
                    maxLength={BANNER_TEXT_LENGTH}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_BANNER_TEXT_3}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_BANNER_TEXT_3_HERE}
                    onChangeText={(v: string) => {
                        setBannerText({
                            ...bannerText,
                            bannerTextThree: v
                        })
                    }}
                    initValue={bannerText?.bannerTextThree}
                    multiline
                    maxLength={BANNER_TEXT_LENGTH}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_BANNER_TEXT_4}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_BANNER_TEXT_4_HERE}
                    onChangeText={(v: string) => {
                        setBannerText({
                            ...bannerText,
                            bannerTextFour: v
                        })
                    }}
                    initValue={bannerText?.bannerTextFour}
                    multiline
                    maxLength={BANNER_TEXT_LENGTH}
                />
                <LeadInput
                    fieldName={t.labels.PBNA_MOBILE_BANNER_TEXT_5}
                    placeholder={t.labels.PBNA_MOBILE_ENTER_BANNER_TEXT_5_HERE}
                    onChangeText={(v: string) => {
                        setBannerText({
                            ...bannerText,
                            bannerTextFive: v
                        })
                    }}
                    initValue={bannerText?.bannerTextFive}
                    multiline
                    maxLength={BANNER_TEXT_LENGTH}
                />
            </View>
        )
    }

    const isEdit = () => {
        if ('edit' in props) {
            return props.edit
        }
        return false
    }

    return (
        <FullScreenModal
            cRef={fullScreenModalRef}
            title={isEdit() ? t.labels.PBNA_MOBILE_EDIT_POS_DETAILS : t.labels.PBNA_MOBILE_ADD_POS_DETAILS}
            closeButton={false}
            scrollView
            footerComponent={
                <FormBottomButton
                    onPressCancel={() => {
                        pressBackAlert(
                            () => {
                                fullScreenModalRef?.current?.closeModal()
                                resetPOSDetailProps()
                                setBreadcrumbsList((prevState) => prevState.slice(0, prevState.length - 1))
                            },
                            t.labels.PBNA_MOBILE_SELECT_POS_BACK_MSG,
                            !isEdit()
                        )
                    }}
                    onPressSave={onPressAdd}
                    relative
                    rightButtonLabel={isEdit() ? t.labels.PBNA_MOBILE_EDIT : t.labels.PBNA_MOBILE_ADD}
                    disableSave={quantity === '0' || (isShowBanner && isEmpty(bannerText.bannerTextOne))}
                />
            }
        >
            <View style={styles.container}>
                <BreadcrumbsComponent breadcrumbsList={breadcrumbsList} containerStyle={{ marginVertical: 22 }} />
                <View style={[styles.quantityContainer, styles.bottomLine]}>
                    <CText style={styles.labelText}>{t.labels.PBNA_MOBILE_QUANTITY_REQUIRE}</CText>
                    <QuantityInputBox
                        value={quantity}
                        onChangeText={(text) => {
                            const newText = parseInt(text || '0').toString()
                            setQuantity(newText)
                        }}
                        onPressMinus={() => {
                            if (Number(quantity) > 0) {
                                setQuantity((prevState) => (Number(prevState) - 1).toString())
                            }
                        }}
                        onPressPlus={() => {
                            // only allow 3 digits
                            if (Number(quantity) < 999) {
                                setQuantity((prevState) => (Number(prevState) + 1).toString())
                            }
                        }}
                        containerStyle={{ marginTop: -10 }}
                    />
                </View>
                <View style={styles.marginTop_22}>
                    <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS}</CText>
                    <TextInput
                        multiline
                        style={[styles.bottomLine, styles.textInputStyle]}
                        onChangeText={(v) => {
                            setSpecialInstructions(v)
                        }}
                        allowFontScaling={false}
                        value={specialInstructions}
                        placeholder={t.labels.PBNA_MOBILE_ENTER_SPECIAL_INSTRUCTIONS}
                    />
                </View>
                {isShowBanner && renderBannerTextView()}
                <View style={styles.marginTop_22}>
                    <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_POS_SUBTYPE}</CText>
                    <CText style={styles.marginTop_10}>{posDetail?.Product_Subtype__c || '-'}</CText>
                </View>
                <View style={styles.marginTop_22}>
                    <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_BRAND}</CText>
                    <CText style={styles.marginTop_10}>{posDetail?.Brand_Name__c || '-'}</CText>
                </View>
                <View style={[styles.marginTop_22, commonStyle.flexDirectionRow]}>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_COLOR}</CText>
                        <CText style={styles.marginTop_10}>{posDetail?.Color_Name__c || '-'}</CText>
                    </View>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_SIZE}</CText>
                        <CText style={styles.marginTop_10}>{posDetail?.Package_Size_Name__c || '-'}</CText>
                    </View>
                </View>
                <View style={styles.marginTop_22}>
                    <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_STYLE_NOTES}</CText>
                    <CText style={styles.marginTop_10}>{posDetail?.Notes__c || '-'}</CText>
                </View>
                <View style={[styles.marginTop_22, commonStyle.flexDirectionRow]}>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_SHIPPING_QUANTITY}</CText>
                        <CText style={styles.marginTop_10}>{posDetail?.Quantity || '-'}</CText>
                    </View>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{_.capitalize(t.labels.PBNA_MOBILE_COST)}</CText>
                        <CText style={styles.marginTop_10}>
                            $ {posDetail?.Default_Cost__c ? posDetail?.Default_Cost__c.toFixed(2) : '--'}
                        </CText>
                    </View>
                </View>
                <View style={[styles.marginTop_22, commonStyle.flexDirectionRow]}>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_TOTAL_QUANTITY}</CText>
                        <CText style={styles.marginTop_10}>
                            {Number(posDetail?.Quantity) * Number(quantity) || '-'}
                        </CText>
                    </View>
                    <View style={styles.halfWidth}>
                        <CText style={styles.labelStyle}>{t.labels.PBNA_MOBILE_TOTAL_COST}</CText>
                        <CText style={styles.marginTop_10}>
                            $ {(Number(posDetail?.Default_Cost__c) * Number(quantity)).toFixed(2) || '--'}
                        </CText>
                    </View>
                </View>
            </View>
        </FullScreenModal>
    )
}

AddPOSDetailsModal.displayName = 'AddPOSDetailsModal'

export default AddPOSDetailsModal
