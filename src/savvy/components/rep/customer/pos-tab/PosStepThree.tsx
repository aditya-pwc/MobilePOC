/*
 * @Description:
 * @LastEditors: Yi Li
 */

import _ from 'lodash'
import React, { Dispatch, SetStateAction, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { View, StyleSheet, Image, Dimensions, Alert, TouchableOpacity } from 'react-native'
import Accordion from 'react-native-collapsible/Accordion'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { onSubmitRequestData } from '../../../../hooks/POSHooks'
import { t } from '../../../../../common/i18n/t'
import { updateCustomerPOSDetail } from '../../../../redux/action/CustomerActionType'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import GlobalModal from '../../../../../common/components/GlobalModal'
import PopMessage from '../../../common/PopMessage'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import SuccessView, { SuccessViewRef } from '../../../common/SuccessView'
import { BreadcrumbType, sliceBreadcrumbsList } from '../../lead/common/BreadcrumbsComponent'
import AddPOSDetailsModal, { AddPOSDetailsModalRef } from './AddPOSDetailsModal'
import { POSRequestStep } from './POSRequestModal'
import { SelectPOSStep } from './SelectPOSView'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'

const { width } = Dimensions.get('window')
interface PosStepThreeProps {
    step3Ref: any
    activePart: SelectPOSStep
    setActivePart: Dispatch<SetStateAction<SelectPOSStep>>
    pressBackAlert: (fn: Function, msg: string) => void
    onClose: Function
    setIsSubmitting: Function
    setActiveStep: any
    setCategoryId: any
    setStepTwoBreadcrumbs: Function
}

const styles = StyleSheet.create({
    collapseAllView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 22,
        marginBottom: 13,
        marginTop: 30
    },
    collapseAllText: {
        color: '#00A2D9',
        fontWeight: '700',
        fontSize: 12,
        marginRight: 5
    },
    accordionContain: {
        width: '100%',
        backgroundColor: 'transparent'
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width,
        paddingHorizontal: 22
    },
    accordionHeaderColor: {
        backgroundColor: '#FFF',
        alignItems: 'center'
    },
    accordionHeaderLine: {
        width: width - 44,
        marginHorizontal: 22,
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    accordionHeaderTitle: {
        color: '#000',
        fontWeight: '900',
        fontSize: 18,
        marginTop: 16.5,
        marginBottom: 27.5
    },
    headIcon: {
        marginTop: 14
    },
    icon: {
        width: 23,
        height: 25
    },
    iconRotate: {
        transform: [{ rotateX: '180deg' }]
    },
    cellCont: {
        paddingVertical: 20,
        backgroundColor: '#F2F4F7',
        marginBottom: 1
    },
    cellLeft: {
        width: width - 88
    },
    productName: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14
    },
    productSubtype: {
        color: '#000',
        fontWeight: '400',
        fontSize: 14
    },
    packageSizeName: {
        color: '#565656',
        fontWeight: '400',
        fontSize: 12
    },
    cellLineHeight20: {
        lineHeight: 20
    },
    cellLineHeight18: {
        lineHeight: 20
    },
    funcBtnCont: {
        marginTop: 5,
        flexDirection: 'row'
    },
    funcBtnTitle: {
        fontWeight: '700',
        fontSize: 12
    },
    gapLine: {
        width: 1,
        height: 13,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#D3D3D3'
    },
    editColor: {
        color: '#0095BE'
    },
    removeColor: {
        color: '#EB445A'
    },
    cellRight: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    qtyTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#000000'
    },
    qtyUnit: {
        fontWeight: '400',
        fontSize: 8,
        color: '#565656'
    },
    footView: {
        height: 15,
        marginHorizontal: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    successModel: {
        width: 300,
        height: 225
    }
})

const renderAccordionIcon = (isActive: boolean, imageStyle?: any) => {
    return <Image style={[styles.icon, imageStyle, isActive && styles.iconRotate]} source={ImageSrc.IOS_CHEVRON_DOWN} />
}

const renderCollapseAllView = (isActive: boolean, onPress: any) => {
    return (
        <TouchableOpacity style={styles.collapseAllView} onPress={onPress}>
            <CText style={styles.collapseAllText}>
                {isActive ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
            </CText>
            <ChevronBlue
                width={19}
                height={20}
                style={{
                    transform: [{ rotate: isActive ? '0deg' : '180deg' }]
                }}
            />
        </TouchableOpacity>
    )
}
const renderAccordionHeader = (titleString: string, isActive: boolean) => {
    return (
        <View style={styles.accordionHeaderColor}>
            <View style={[styles.accordionHeader]}>
                <CText style={styles.accordionHeaderTitle}>{titleString}</CText>
                {renderAccordionIcon(isActive, styles.headIcon)}
            </View>
            {!isActive && <View style={styles.accordionHeaderLine} />}
        </View>
    )
}

const renderFuncBtn = (title: string, onPress: any, titleStyle?: any) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <CText style={[styles.funcBtnTitle, titleStyle]}>{title}</CText>
        </TouchableOpacity>
    )
}

const renderCell = (
    keyEx: any,
    productName: string,
    productSubtype: string,
    packageSizeName: string,
    qtyNum: string,
    editFunc: any,
    removeFunc: any
) => {
    return (
        <View style={[styles.cellCont, styles.accordionHeader]} key={keyEx}>
            <View style={styles.cellLeft}>
                {productName?.length > 0 && (
                    <CText style={[styles.productName, styles.cellLineHeight20]} numberOfLines={0}>
                        {productName}
                    </CText>
                )}
                {productSubtype?.length > 0 && (
                    <CText style={[styles.productSubtype, styles.cellLineHeight18]}>{productSubtype}</CText>
                )}
                {packageSizeName?.length > 0 && (
                    <CText
                        style={[styles.packageSizeName, styles.cellLineHeight20]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {packageSizeName}
                    </CText>
                )}
                <View style={styles.funcBtnCont}>
                    {renderFuncBtn(t.labels.PBNA_MOBILE_EDIT, editFunc, styles.editColor)}
                    <View style={styles.gapLine} />
                    {renderFuncBtn(t.labels.PBNA_MOBILE_REMOVE, removeFunc, styles.removeColor)}
                </View>
            </View>
            <View style={styles.cellRight}>
                <CText style={styles.qtyTitle} numberOfLines={0}>
                    {qtyNum}
                </CText>
                <CText style={styles.qtyUnit} numberOfLines={0}>
                    {t.labels.PBNA_MOBILE_QTY}
                </CText>
            </View>
        </View>
    )
}

const renderContent = (section: any, onPressEditBtn: Function, onPressRemoveBtn: Function) => {
    return (
        <View>
            {section.data.map((item: any, index: any) => {
                const secondLineList = _.compact([item?.Package_Size_Name__c, item?.Color_Name__c, item?.Brand_Name__c])
                const secondLine = secondLineList.join(' ')
                return renderCell(
                    item.Id + index,
                    item.Product_Name__c || '',
                    item.Product_Subtype__c || '',
                    secondLine,
                    item.Order_Quantity__c || '',
                    () => {
                        onPressEditBtn && onPressEditBtn(item)
                    },
                    () => {
                        onPressRemoveBtn && onPressRemoveBtn(item)
                    }
                )
            })}
        </View>
    )
}

const renderFooterView = (isActive: boolean) => {
    return isActive ? <View style={styles.footView} /> : <View />
}

const PosStepThree = (props: PosStepThreeProps) => {
    const {
        step3Ref,
        pressBackAlert,
        setActivePart,
        onClose,
        setIsSubmitting,
        setActiveStep,
        setCategoryId,
        setStepTwoBreadcrumbs
    } = props
    const dispatch = useDispatch()
    const globalModalRef = useRef(null)
    const posDetailList = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posDetailList)
    const overview = useSelector((state: any) => state.customerReducer.customerPOSRequestReducer.posOverview)
    const sectionData = useMemo(() => {
        const formatData = []
        const keyArr = []
        const groupData = _.groupBy(posDetailList, 'Category_Id__c')
        for (const key in groupData) {
            const element = groupData[key] || []
            formatData.push({
                categoryId: key,
                categoryName: element[0]?.Category_Name__c || '',
                uniqueKey: key + 1000,
                data: element
            })
            keyArr.push(key + 1000)
        }
        return {
            formatData,
            keyArr
        }
    }, [posDetailList])
    const successRef = useRef<SuccessViewRef>(null)
    const [collapseAllExp, setCollapseAllExp] = useState(false)
    const [activeSections, setActiveSections] = useState([])
    const [breadcrumbsList, setBreadcrumbsList] = useState<Array<BreadcrumbType>>([])
    const [posDetail, setPosDetail] = useState<any>({})
    const addPOSDetailsModalRef = useRef<AddPOSDetailsModalRef>(null)
    const [editIndex, setEditIndex] = useState(0)
    const onPressCollapseAllFunc = () => {
        if (collapseAllExp) {
            setActiveSections([])
            setCollapseAllExp(false)
        } else {
            setActiveSections(sectionData?.keyArr)
            setCollapseAllExp(true)
        }
    }
    const updateExpSections = (currentSections: any[]) => {
        setActiveSections(currentSections)
    }

    const onClickConfirmCancel = () => {
        setIsSubmitting && setIsSubmitting(false)
    }
    const onClickConfirmSubmit = async () => {
        onSubmitRequestData(overview, posDetailList)
            .then(() => {
                successRef.current?.openModal()
                const timeoutId = setTimeout(() => {
                    setIsSubmitting && setIsSubmitting(false)
                    clearTimeout(timeoutId)
                    onClose && onClose()
                }, 1000)
            })
            .catch(() => {
                globalModalRef?.current?.openModal(
                    <ProcessDoneModal type={'failed'}>
                        <PopMessage>{t.labels.PBNA_MOBILE_CREATE_REQUEST_FAILED}</PopMessage>
                    </ProcessDoneModal>,
                    t.labels.PBNA_MOBILE_OK
                )
                setIsSubmitting && setIsSubmitting(false)
            })
    }
    const showConfirmSubmitAlert = () => {
        Alert.alert(t.labels.PBNA_MOBILE_CONFIRM_SUBMIT, t.labels.PBNA_MOBILE_CONFIRM_SUBMIT_DESCRIBE, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                onPress: onClickConfirmCancel
            },
            {
                text: t.labels.PBNA_MOBILE_CONFIRM,
                onPress: onClickConfirmSubmit
            }
        ])
    }
    useImperativeHandle(step3Ref, () => ({
        onSubmit: () => {
            showConfirmSubmitAlert()
        }
    }))

    const removeTargetItem = (index: number) => {
        const newList = _.cloneDeep(posDetailList)
        newList.splice(index, 1)
        dispatch(updateCustomerPOSDetail(newList))
    }
    const backToSelectCategory = (index: number, originIndex: number) => {
        pressBackAlert(() => {
            setActivePart(SelectPOSStep.SELECT_CATEGORY)
            setActiveStep(POSRequestStep.POS)
            setCategoryId('')
            removeTargetItem(originIndex)
            addPOSDetailsModalRef?.current?.closeModal()
            sliceBreadcrumbsList(setBreadcrumbsList, index)
        }, t.labels.PBNA_MOBILE_SELECT_POS_BACK_MSG)
    }

    const backToPOSList = (index: number, originIndex: number) => {
        pressBackAlert(() => {
            setActivePart(SelectPOSStep.SELECT_POS)
            setActiveStep(POSRequestStep.POS)
            setPosDetail({})
            setStepTwoBreadcrumbs(posDetailList[originIndex])
            setCategoryId(posDetailList[originIndex].Category_Id__c)
            removeTargetItem(originIndex)
            addPOSDetailsModalRef?.current?.closeModal()
            sliceBreadcrumbsList(setBreadcrumbsList, index)
        }, t.labels.PBNA_MOBILE_SELECT_POS_BACK_MSG)
    }

    const onAddDetail = () => {
        setActivePart(SelectPOSStep.SELECT_CATEGORY)
        setBreadcrumbsList([])
    }

    const onPressEditBtn = (item: any) => {
        const newList = _.cloneDeep(posDetailList)
        const originIndex = posDetailList.findIndex((targetItem: any) => targetItem.Id === item.Id)
        setEditIndex(originIndex)
        dispatch(updateCustomerPOSDetail(newList))
        setPosDetail(item)
        addPOSDetailsModalRef?.current?.setQuantity(item?.Order_Quantity__c)
        addPOSDetailsModalRef?.current?.setSpecialInstructions(item?.Spcl_Inst__c)
        setBreadcrumbsList([
            {
                id: item?.Category_Id__c,
                label: item?.Category_Name__c,
                onPress: (index) => {
                    backToSelectCategory(index, originIndex)
                }
            },
            {
                id: null,
                label: item?.Product_Name__c,
                onPress: (index) => {
                    backToPOSList(index, originIndex)
                }
            }
        ])
        addPOSDetailsModalRef?.current?.setBannerText({
            bannerTextOne: item?.BannerText1__c,
            bannerTextTwo: item?.BannerText2__c,
            bannerTextThree: item?.BannerText3__c,
            bannerTextFour: item?.BannerText4__c,
            bannerTextFive: item?.BannerText5__c
        })
        addPOSDetailsModalRef?.current?.openModal()
    }

    const onPressRemoveBtn = (item: any) => {
        const newList = _.cloneDeep(posDetailList)
        const originIndex = posDetailList.findIndex((targetItem: any) => targetItem.Id === item.Id)
        newList.splice(originIndex, 1)
        dispatch(updateCustomerPOSDetail(newList))
    }

    return (
        <ScrollView style={[commonStyle.bgWhite, commonStyle.flex_1]}>
            {renderCollapseAllView(collapseAllExp, onPressCollapseAllFunc)}
            <Accordion
                containerStyle={styles.accordionContain}
                keyExtractor={(item) => item.uniqueKey}
                sections={sectionData?.formatData}
                expandMultiple
                activeSections={activeSections}
                renderHeader={(content, index, isActive) => {
                    return renderAccordionHeader(content?.categoryName, isActive)
                }}
                renderContent={(section) => {
                    return renderContent(section, onPressEditBtn, onPressRemoveBtn)
                }}
                renderFooter={(content, index, isActive) => {
                    return renderFooterView(isActive)
                }}
                onChange={(indexes: number[]) => {
                    updateExpSections(indexes)
                }}
            />
            <AddPOSDetailsModal
                setBreadcrumbsList={setBreadcrumbsList}
                breadcrumbsList={breadcrumbsList}
                posDetail={posDetail}
                pressBackAlert={pressBackAlert}
                onAddDetail={onAddDetail}
                cRef={addPOSDetailsModalRef}
                edit
                editIndex={editIndex}
            />
            <SuccessView
                ref={successRef}
                title={t.labels.PBNA_MOBILE_POS_REQUEST_SUBMITTED}
                modalViewStyle={styles.successModel}
            />
            <GlobalModal ref={globalModalRef} />
        </ScrollView>
    )
}

export default PosStepThree
