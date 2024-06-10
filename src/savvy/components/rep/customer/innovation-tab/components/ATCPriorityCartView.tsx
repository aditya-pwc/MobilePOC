import React, { useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { t } from '../../../../../../common/i18n/t'
import ATCPriorityCartItem from './ATCPriorityCartItem'
import KamPriorityProductsViewSelect, { ProdPackageInfo } from '../../../../kam/priority/KamPriorityProductsViewSelect'
import { convertKeysToCamelCase } from '../../../../../utils/CommonUtils'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllPAProducts, setCurrentCustomer } from '../../../../../redux/Slice/PriorityCartSlice'
import { selectCustomerDetail } from '../../../../../redux/Slice/CustomerDetailSlice'
import CText from '../../../../../../common/components/CText'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'

const styles = StyleSheet.create({
    ATCPriorityCartItem: {
        marginVertical: 8,
        marginHorizontal: 22
    }
})

interface ATCPriorityCartViewProps extends React.PropsWithChildren {
    productAttribute: any[]
    needAuthProducts: string[]
}

export const ATCPriorityCartView: React.FC<ATCPriorityCartViewProps> = ({
    productAttribute: products,
    needAuthProducts
}) => {
    // select available products modal
    const [isShowViewSelectProducts, setIsShowViewSelectProducts] = useState<boolean>(false)
    const [prodTotalInfo, setProdTotalInfo] = useState<ProdPackageInfo>({} as ProdPackageInfo)
    const allPaProducts = useSelector(selectAllPAProducts())

    const dispatch = useDispatch()
    const retailStore = useSelector(selectCustomerDetail)

    useEffect(() => {
        if (retailStore) {
            // reset cart details since current customer is changed
            dispatch(setCurrentCustomer(retailStore.Id))
        }
    }, [])

    const handleSelectProducts = (product: any, index: number) => {
        setProdTotalInfo({
            flavorName: product.Flavor,
            packageName: product.Package,
            quantityNum: product.Quantity,
            prodSequence: index,
            prodInfo: convertKeysToCamelCase(product)
        })
        setIsShowViewSelectProducts(true)
    }

    // Should the top of Cart Item list show Qty warn?
    const isWarnQty = useMemo(() => {
        if (allPaProducts) {
            for (const pa of products) {
                if (allPaProducts[pa._id]?.length > 0) {
                    const subTotal = allPaProducts[pa._id].reduce((res, prod) => res + Number(prod.quantity), 0)
                    if (subTotal >= 0 && subTotal < Number(pa.Quantity)) {
                        return true
                    }
                }
            }
        }
        return false
    }, [products, allPaProducts])

    return (
        <>
            <View>
                {isWarnQty && (
                    <View style={[styles.ATCPriorityCartItem, { flexDirection: 'row', alignItems: 'center' }]}>
                        <Image style={{ width: 15, height: 15 }} source={ImageSrc.ICON_WARNING_RND_BG_Y_FG_B} />
                        <CText style={{ marginLeft: 5, fontSize: 12 }}>
                            {t.labels.PBNA_MOBILE_ADDED_QTY_COMPARISON}
                        </CText>
                    </View>
                )}

                {products.map((prod: any, productSequence: number) => {
                    // notice: there is no Name or Id like files in item, just generate one with random
                    const itemKey = `item-${prod.Flavor}-${prod.Package}-${productSequence}`
                    return (
                        <View key={itemKey} style={styles.ATCPriorityCartItem}>
                            <ATCPriorityCartItem
                                item={prod}
                                onSelectProducts={(item) => handleSelectProducts(item, productSequence)}
                                onQuantityChange={() => {}}
                                needAuthProducts={needAuthProducts}
                            />
                        </View>
                    )
                })}
            </View>
            {isShowViewSelectProducts && (
                <KamPriorityProductsViewSelect
                    prodPackageInfo={prodTotalInfo}
                    pageTitle={t.labels.PBNA_MOBILE_SELECT_AVAILABLE_PRODUCTS}
                    onBack={() => {
                        setIsShowViewSelectProducts(false)
                    }}
                    retailStore={retailStore}
                    isSelect
                />
            )}
        </>
    )
}
