import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { selectCustomerDetail } from '../../../../redux/Slice/CustomerDetailSlice'
import { BottomFixedButton } from '../../common/BottomFixedButton'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'

import DatePickView from '../metrics/AddToCartDatePickView'
import { ATCModal } from './components/ATCModal'
import { ATCButton } from './components/ATCButton'
import { ATCDatePickerModal } from './components/ATCDatePickerModal'
import { getNextOrderDayDate } from '../../../../helper/rep/InnovationProductHelper'
import {
    removeAllCartItem,
    selectCartSummary,
    selectCelsiusCart,
    selectCelsiusCartSummary
} from '../../../../redux/Slice/PriorityCartSlice'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { createPriorityOrderAndItem, syncDownStorePriorities } from '../../../../helper/rep/PriorityOrderHelper'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import { getStringValue } from '../../../../utils/LandingUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import { useNavigation } from '@react-navigation/native'
import { StorePriorityStatusC, useStorePriority } from '../../../../hooks/InnovationProductHooks'
import { updateStorePriorityStatus } from '../../../../helper/rep/PriorityArchiveHelper'
import { customDelay, convertKeysToCamelCase } from '../../../../utils/CommonUtils'
import { ActiveTabName } from '../../../../pages/rep/customer/CustomerDetailScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface PushToSMARTrViewProps extends React.PropsWithChildren {
    disabled: boolean
    storePriorityId: string
    setLoading: any
    orderTitle: string
    inheritedProps: any
    isCelsiusPriority: boolean
    celsiusPriorityProducts: any[]
    isFromPriorityArchive: boolean
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalSection: {
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalButtons: {
        marginTop: 30,
        flexDirection: 'row'
    }
})

export const PushToSMARTrView: React.FC<PushToSMARTrViewProps> = ({
    disabled = false,
    storePriorityId,
    setLoading,
    orderTitle,
    inheritedProps,
    isCelsiusPriority,
    celsiusPriorityProducts,
    isFromPriorityArchive
}) => {
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const retailStore = useSelector(selectCustomerDetail)
    const { storePriority } = useStorePriority(storePriorityId)
    const nextOrderDay = getNextOrderDayDate(retailStore)

    const [modalVisible, setModalVisible] = useState(false)
    const [startDate, setStartDate] = useState<Date>(nextOrderDay)
    const [endDate, setEndDate] = useState<Date>(moment(nextOrderDay).add(1, 'day').toDate())

    const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false)

    let cartSummary = useSelector(selectCartSummary)
    const priorityCart = useSelector((state: any) => state.customerReducer.priorityCart)

    // Push to SMARTr for Celsius Priority cart
    const celsiusCart = useSelector(selectCelsiusCart)
    const celsiusCartSummary = useSelector(selectCelsiusCartSummary)
    if (isCelsiusPriority) {
        cartSummary = celsiusCartSummary
    }

    const getCelsiusProducts = () => {
        return celsiusPriorityProducts
            .map(convertKeysToCamelCase)
            .map((product) => {
                product.quantity = celsiusCart[product.materialUniqueIdC]?.quantity || 0
                return product
            })
            .filter((product) => product.quantity > 0)
    }

    const getAllProducts = (cartData: any) => {
        const result: any[] = []
        const customerId = cartData.customerId
        const groupKeys = Object.values(Object.values(cartData.customerCart[customerId]))
        groupKeys.flat().forEach((item: any) => {
            result.push(...item.products)
        })
        return result
    }

    const handleNavigationScenario = async (currentStatus: string, addedToCart: boolean) => {
        const TODAY = dayjs(new Date()).format(TIME_FORMAT.Y_MM_DD)
        const storePriorityStartDate = moment(storePriority.current.StartDate__c).format(TIME_FORMAT.MMM_D_YYYY)
        const priorityNotStart = dayjs(storePriority.current.StartDate__c).isAfter(TODAY)

        await AsyncStorage.setItem('pushToSmartR.priorityId', storePriority.current.PriorityId__c)

        const { accessToken, updateCarousel, setReturnFromDetail, onClickExecute } = inheritedProps
        const message = [
            cartSummary.productQty,
            t.labels.PBNA_MOBILE_ATC_PRODUCT_SLASH,
            cartSummary.csQty,
            t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE + '\n',
            orderTitle
        ].join(' ')
        const routeParams: any = {
            retailStore: retailStore,
            accessToken,
            updateCarousel,
            setReturnFromDetail,
            onClickExecute,
            tab: t.labels.PBNA_MOBILE_PRIORITIES.toUpperCase(),
            isFromPushToSMARTr: true,
            storePriorityStartDate,
            pushToSMARTrMessageTitle: message
        }
        if (!isFromPriorityArchive) {
            if (priorityNotStart) {
                const message = [
                    cartSummary.productQty,
                    t.labels.PBNA_MOBILE_ATC_PRODUCT_SLASH,
                    cartSummary.csQty,
                    t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE + '\n',
                    orderTitle,
                    t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PRIORITY_CARD_ARCHIVED + '\n',
                    moment(storePriority.current.StartDate__c).format(TIME_FORMAT.MMM_D_YYYY)
                ].join(' ')
                await AsyncStorage.setItem('atc.successMessage', message)
                const navigateArgs = [
                    'CustomerDetailScreen',
                    {
                        customer: { AccountId: retailStore.Id },
                        readonly: true,
                        tab: ActiveTabName.SALES_ACTIONS
                    }
                ] as never
                navigation.navigate(...navigateArgs)
            } else {
                const message = [
                    cartSummary.productQty,
                    t.labels.PBNA_MOBILE_ATC_PRODUCT_SLASH,
                    cartSummary.csQty,
                    t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE
                ].join(' ')
                const navigateArgs = [
                    'CustomerDetailScreen',
                    {
                        customer: { AccountId: retailStore.Id },
                        readonly: true,
                        tab: ActiveTabName.SALES_ACTIONS,
                        actionType: 'atcSuccess',
                        actionData: { storePriority: storePriority.current },
                        storePriorityStartDate,
                        pushToSMARTrMessageTitle: message
                    }
                ] as never
                navigation.navigate(...navigateArgs)
            }
        } else if (currentStatus === StorePriorityStatusC.noSale) {
            const CHANGE_TO_STATUS = StorePriorityStatusC.action
            const { isSuccess } = await updateStorePriorityStatus(
                retailStore.Id,
                CHANGE_TO_STATUS,
                undefined,
                storePriority.current
            )

            if (isSuccess) {
                if (priorityNotStart) {
                    routeParams.pushToSMARTrMessageType = 'NOT_START'
                    const navigateArgs = ['InnovationProductArchiveDetail', routeParams] as never
                    navigation.navigate(...navigateArgs)
                } else {
                    routeParams.pushToSMARTrMessageType = 'STARTED'
                    const navigateArgs = ['InnovationProductArchiveDetail', routeParams] as never
                    navigation.navigate(...navigateArgs)
                }
            }
        } else if (addedToCart && currentStatus === StorePriorityStatusC.action) {
            routeParams.pushToSMARTrMessageType = 'ADDED_TO_CART'
            const navigateArgs = ['InnovationProductArchiveDetail', routeParams] as never
            navigation.navigate(...navigateArgs)
        }
    }

    const handlePushToSMARTrConfirm = async () => {
        if (!storePriority.current) {
            return
        }

        const currentStatus = storePriority.current.Status__c
        const storePriorityAddedToCart = storePriority.current.AddedToCart__c === '1'
        setModalVisible(false)

        const startDateStr = dayjs(startDate).format(TIME_FORMAT.Y_MM_DD)
        const endDateStr = dayjs(endDate).format(TIME_FORMAT.Y_MM_DD)

        try {
            await customDelay(500)
            setLoading(true)
            await createPriorityOrderAndItem({
                retailStore: retailStore,
                products: isCelsiusPriority ? getCelsiusProducts() : getAllProducts(priorityCart),
                startDate: startDateStr,
                endDate: endDateStr,
                storePriorityId: storePriorityId,
                priorityTitle: orderTitle,
                isCelsiusPriority: isCelsiusPriority
            })
            await syncDownStorePriorities(retailStore.Id)
            setLoading(false)
            dispatch(removeAllCartItem())
            await handleNavigationScenario(currentStatus, storePriorityAddedToCart)
        } catch (error) {
            setLoading(false)
            Alert.alert('', t.labels.PBNA_MOBILE_PUSH_PRIORITY_PRODUCT_FAILED, [
                {
                    text: `${t.labels.PBNA_MOBILE_OK.toLocaleUpperCase()}`,
                    onPress: async () => {}
                }
            ])
            storeClassLog(
                Log.MOBILE_ERROR,
                'handlePushToSMARTrConfirm',
                `${CommonParam.PERSONA__c} Push Priority Products To SMARTr Failed: ` + getStringValue(error)
            )
        }
    }

    return (
        <>
            <BottomFixedButton
                title={t.labels.PBNA_MOBILE_IP_CART_PUSH_TO_SMARTR}
                disabled={disabled}
                onPress={() => setModalVisible(true)}
            />

            {/* This is the first example of ATCModal, ATCButton from Customer Carousel */}
            <ATCModal
                visible={modalVisible}
                messageText={'Please confirm or adjust SMARTr start date. Default shown is next order day.'}
            >
                <View style={styles.modalSection}>
                    <DatePickView
                        title={t.labels.PBNA_MOBILE_START_DATE}
                        clickable
                        dateString={moment(startDate).format()}
                        onChoseDate={() => {
                            if (!startDate) {
                                setStartDate(moment().add(1, 'day').toDate())
                                setEndDate(moment().add(2, 'day').toDate())
                            }
                            setDatePickerVisible(true)
                            // datePickerRef?.current?.show()
                        }}
                    />
                    <DatePickView title={t.labels.PBNA_MOBILE_END_DATE} dateString={moment(endDate).format()} />
                </View>
                {datePickerVisible && (
                    <ATCDatePickerModal
                        retailStore={retailStore}
                        startDate={startDate}
                        onClose={() => setDatePickerVisible(false)}
                        onSelect={(date) => {
                            if (date) {
                                setStartDate(date)
                                setEndDate(moment(date).add(1, 'day').toDate()) // end date is 1 day later than start date
                            }
                            setDatePickerVisible(false)
                        }}
                    />
                )}
                <View style={styles.modalButtons}>
                    <ATCButton type={'cancel'} onPress={() => setModalVisible(false)}>
                        <CText>{t.labels.PBNA_MOBILE_CANCEL}</CText>
                    </ATCButton>
                    <ATCButton type={'confirm'} disabled={!startDate} onPress={handlePushToSMARTrConfirm}>
                        <CText>{t.labels.PBNA_MOBILE_CONFIRM}</CText>
                    </ATCButton>
                </View>
            </ATCModal>
        </>
    )
}
