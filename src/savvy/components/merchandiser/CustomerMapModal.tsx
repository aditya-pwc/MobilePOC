/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-09-19 15:52:28
 * @LastEditTime: 2023-10-30 17:57:53
 * @LastEditors: Mary Qian
 */

import React, { FC, useImperativeHandle, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { t } from '../../../common/i18n/t'
import { SDLMyCustomerCellModel } from '../sales/my-customer/SDLMyCustomerModel'
import { assembledDataModelForCell } from '../sales/my-customer/SDLMyCustomerHelper'
import TitleModal from '../../../common/components/TitleModal'
import SDLMyCustomerCell from '../sales/my-customer/SDLMyCustomerCell'

const styles = StyleSheet.create({
    customerContentView: {
        width: '100%'
    }
})

interface CustomerMapModalProps {
    cRef?: any
    setShowMapModal?: any
    showMapModal?: any
    navigation?: any
}

const CustomerMapModal: FC<CustomerMapModalProps> = (props: CustomerMapModalProps) => {
    const { cRef, navigation, showMapModal, setShowMapModal } = props

    const [itemModel, setItemModel] = useState<SDLMyCustomerCellModel>({} as SDLMyCustomerCellModel)

    useImperativeHandle(cRef, () => ({
        openModal: (item: any) => {
            const model = assembledDataModelForCell(item)
            setItemModel(model)
        }
    }))

    const gotoCustomerDetail = () => {
        const accountId = itemModel.AccountId
        if (accountId) {
            navigation.navigate('CustomerDetailScreen', {
                customer: { AccountId: accountId },
                readonly: true
            })
        }
    }

    const renderContentInfo = () => {
        return (
            <SDLMyCustomerCell
                isClickable
                onPressCell={() => {
                    gotoCustomerDetail()
                }}
                itemModal={itemModel}
                cRef={undefined}
            />
        )
    }

    return (
        <TitleModal
            title={t.labels.PBNA_MOBILE_CUSTOMER_INFO.toUpperCase()}
            visible={showMapModal}
            onClose={() => {
                setShowMapModal(false)
            }}
        >
            <View style={styles.customerContentView}>{renderContentInfo()}</View>
        </TitleModal>
    )
}

export default CustomerMapModal
