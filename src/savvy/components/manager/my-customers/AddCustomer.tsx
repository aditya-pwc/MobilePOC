/**
 * @description Add customer component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-26
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Image, TouchableOpacity, FlatList, DeviceEventEmitter } from 'react-native'
import CText from '../../../../common/components/CText'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { updateCustomer } from '../../../utils/MerchManagerUtils'
import ReassignResultModal from '../common/ReassignResultModal'
import AddCustomerStyle from '../../../styles/manager/AddCustomerStyle'
import AddEmployeeStyle from '../../../styles/manager/AddEmployeeStyle'
import CustomerItem from '../common/CustomerItem'
import Loading from '../../../../common/components/Loading'
import IMG_PEPSICO from '../../../../../assets/image/Icon-store-placeholder.svg'
import {
    drawHeaderTriangle,
    getAllCustomerData,
    isFirstStep,
    isSecondStep,
    renderUserItem,
    syncRemoteUserStatsWithoutInsertLocalSoup
} from '../helper/MerchManagerHelper'
import _ from 'lodash'
import { dataCheckWithAction } from '../service/DataCheckService'
import ErrorMsgModal from '../common/ErrorMsgModal'
import { BooleanStr, DataCheckMsgIndex, EventEmitterType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import MMSearchBar from '../common/MMSearchBar'
import { filterAddCustomer } from '../helper/MMSearchBarHelper'
import { IntervalTime } from '../../../enums/Contract'

const styles = Object.assign(AddEmployeeStyle, AddCustomerStyle)

interface AddEmployeeProps {
    navigation?: any
    route?: any
}

const DEFAULT_ACTIVE_STEP = 1
const SECOND_STEP = 2
const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE

const renderOrderDays = (orderDays) => {
    return orderDays?.map((wStatus) => {
        return (
            <CText key={wStatus.name} style={[styles.storeText, !wStatus.attend && styles.grayDay]}>
                {wStatus.label}
            </CText>
        )
    })
}

const renderBottomButton = (params) => {
    const { activeStep, onCancelClick, onGoBackClick, onAddCustomerClick, selectedCustomer, setIsLoading } = params
    return (
        <View style={styles.bottomContainer}>
            {isFirstStep(activeStep) && (
                <TouchableOpacity
                    onPress={() => {
                        onCancelClick()
                    }}
                    style={styles.eBtnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>
            )}
            {isSecondStep(activeStep) && (
                <TouchableOpacity
                    onPress={() => {
                        onGoBackClick()
                    }}
                    style={styles.eBtnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_GO_BACK.toUpperCase()}</CText>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                activeOpacity={isSecondStep(activeStep) ? 0.2 : 1}
                onPress={() => {
                    setIsLoading(true)
                    isSecondStep(activeStep) && onAddCustomerClick(selectedCustomer)
                }}
                style={[styles.btnAdd, isSecondStep(activeStep) && styles.btnAddActiveColor]}
            >
                <CText style={[styles.textAdd, isSecondStep(activeStep) && styles.textAddActive]}>
                    {` ${t.labels.PBNA_MOBILE_ADD_CUSTOMER}`}
                </CText>
            </TouchableOpacity>
        </View>
    )
}

const AddCustomer = (props: AddEmployeeProps) => {
    const { navigation } = props
    const [originCustomerList, setOriginCustomerList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [activeStep, setActiveStep] = useState(DEFAULT_ACTIVE_STEP)
    const { dropDownRef } = useDropDown()
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorShow, setIsErrorShow] = useState(false)
    const searchBarRef = useRef(null)

    useEffect(() => {
        // when swipe back to previous page
        navigation.addListener(EventEmitterType.BEFORE_REMOVE, () => {
            DeviceEventEmitter.emit(EventEmitterType.REFRESH_MY_CUSTOMERS)
        })
        return () => {
            navigation.removeListener(EventEmitterType.BEFORE_REMOVE)
        }
    }, [])

    useEffect(() => {
        setIsLoading(true)
        getAllCustomerData(false, dropDownRef).then((stores: Array<any>) => {
            setOriginCustomerList(stores)
            searchBarRef?.current?.onChangeText(stores, '')
            setIsLoading(false)
        })
    }, [selectedCustomer])

    const onCardClick = async (customer) => {
        const userStats = await syncRemoteUserStatsWithoutInsertLocalSoup(customer.userId)
        setActiveStep(SECOND_STEP)
        setSelectedCustomer(Object.assign(customer, userStats))
    }

    const onCancelClick = () => {
        navigation.goBack()
    }

    const onGoBackClick = () => {
        setActiveStep(DEFAULT_ACTIVE_STEP)
        setCustomerList([])
    }

    const onAddCustomerClick = _.debounce(async () => {
        const rsCheck = await dataCheckWithAction('RetailStore', `WHERE Id='${selectedCustomer?.id}'`, '', false)
        const accountCheck = await dataCheckWithAction(
            'Account',
            `WHERE Id='${selectedCustomer?.accountId}'`,
            '',
            false
        )
        if (!rsCheck || !accountCheck) {
            setIsLoading(false)
            setIsErrorShow(true)
            return
        }
        setIsLoading(false)
        updateCustomer({
            updateVal: BooleanStr.STR_TRUE,
            selectedCustomer,
            setIsLoading,
            setResultModalVisible,
            navigation,
            dropDownRef
        })
    }, IntervalTime.FIVE_HUNDRED)

    const renderCItem = (item) => {
        return <CustomerItem item={item} isClickable={!item?.item.merchandisingBase} itemClick={onCardClick} />
    }

    const goBackAndRefresh = () => {
        navigation.goBack()
    }

    return (
        <View style={[styles.container, isSecondStep(activeStep) && styles.whiteContainer]}>
            <View style={[styles.container, isSecondStep(activeStep) && styles.whiteContainer]}>
                <View style={[styles.eHeader, isSecondStep(activeStep) && styles.heightAuto]}>
                    <CText style={styles.eTitle}>{` ${t.labels.PBNA_MOBILE_ADD_CUSTOMER_LOWER}`}</CText>
                    <View style={styles.stepView}>
                        <View style={[styles.firstStep, isFirstStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.firstStepTitle, isFirstStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_ONE}
                            </CText>
                            <View style={styles.flexRowEnd}>
                                <CText
                                    style={[styles.firstStepText, isFirstStep(activeStep) && styles.activeStepColor]}
                                >
                                    {t.labels.PBNA_MOBILE_SELECT_CUSTOMER}
                                </CText>
                                {isSecondStep(activeStep) && (
                                    <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                                )}
                            </View>
                        </View>
                        {drawHeaderTriangle(DEFAULT_ACTIVE_STEP, activeStep, styles)}
                        <View style={[styles.secondStep, isSecondStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.secondStepTitle, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_TWO}
                            </CText>
                            <CText style={[styles.secondStepText, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_CONFIRM}
                            </CText>
                        </View>
                    </View>
                    {isFirstStep(activeStep) && (
                        <View style={styles.searchBarView}>
                            <MMSearchBar
                                cRef={searchBarRef}
                                placeholder={t.labels.PBNA_MOBILE_SEARCH_BY_C_R_R}
                                originData={originCustomerList}
                                setSearchResult={setCustomerList}
                                onSearchTextChange={filterAddCustomer}
                            />
                        </View>
                    )}
                </View>
                {isFirstStep(activeStep) && (
                    <View style={[styles.listView, styles.marginBottom_20]}>
                        <FlatList
                            data={customerList}
                            extraData={customerList}
                            renderItem={renderCItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.paddingBottom_40}
                        />
                    </View>
                )}
                {isSecondStep(activeStep) && selectedCustomer && (
                    <View style={styles.editContainer}>
                        <View style={styles.ePortraitView}>
                            <IMG_PEPSICO style={styles.cImgPortrait} />
                            <View style={styles.userInfo}>
                                <CText numberOfLines={2} ellipsizeMode="tail" style={styles.cName}>
                                    {selectedCustomer?.name}
                                </CText>
                                <CText style={styles.cAddress} numberOfLines={1} ellipsizeMode="tail">
                                    {selectedCustomer?.address}
                                </CText>
                                <CText style={styles.cAddress} numberOfLines={1} ellipsizeMode="tail">
                                    {selectedCustomer?.cityStateZip}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.storeInfo}>
                            <View style={styles.storeInfoBlock}>
                                <CText style={styles.storeLabel}>{t.labels.PBNA_MOBILE_CUSTOMER_NUMBER}</CText>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.storeText}>
                                    {selectedCustomer?.cof}
                                </CText>
                            </View>
                            <View style={styles.storeInfoBlock}>
                                <CText style={styles.storeLabel}>{t.labels.PBNA_MOBILE_BUSINESS_SEGMENT}</CText>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.storeText}>
                                    {selectedCustomer?.busnLvl3}
                                </CText>
                            </View>
                        </View>
                        <View style={styles.storeInfo}>
                            <View style={styles.storeInfoBlock}>
                                <CText style={styles.storeLabel}>{t.labels.PBNA_MOBILE_ORDER_DAYS}</CText>
                                <View style={styles.flexRowAlignCenter}>
                                    {renderOrderDays(selectedCustomer.orderDays)}
                                </View>
                            </View>
                            <View style={styles.storeInfoBlock}>
                                <CText style={styles.storeLabel}>{t.labels.PBNA_MOBILE_DELIVERY_DAYS}</CText>
                                <View style={styles.flexRowAlignCenter}>
                                    {renderOrderDays(selectedCustomer.deliveryDays)}
                                </View>
                            </View>
                        </View>
                        {(!_.isEmpty(selectedCustomer.userName) ||
                            !_.isEmpty(selectedCustomer.salesRoute) ||
                            !_.isEmpty(selectedCustomer.nrid)) && (
                            <View style={styles.userInfoBox}>{renderUserItem(selectedCustomer)}</View>
                        )}
                    </View>
                )}
            </View>
            {renderBottomButton({
                activeStep,
                onCancelClick,
                onGoBackClick,
                onAddCustomerClick,
                selectedCustomer,
                setIsLoading
            })}
            <ReassignResultModal
                navigation={navigation}
                isAddToCustomer
                userName={selectedCustomer?.name}
                modalVisible={resultModalVisible}
                setModalVisible={setResultModalVisible}
            />
            <ErrorMsgModal
                index={DataCheckMsgIndex.COMMON_MSG}
                visible={isErrorShow}
                setModalVisible={setIsErrorShow}
                handleClick={goBackAndRefresh}
            />
            <Loading isLoading={isLoading} />
        </View>
    )
}

export default AddCustomer
