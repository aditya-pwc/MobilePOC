import React, { useState } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { convertKeysToCamelCase } from '../../../../utils/CommonUtils'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import KamPriorityProductsViewSelect, { ProdPackageInfo } from '../../../kam/priority/KamPriorityProductsViewSelect'
import { PriorityProductAttributeItem, styles as itemStyles } from './PriorityProductAttributeItem'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import EmptyListPlaceholder from '../../../common/EmptyListPlaceholder'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import moment from 'moment'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { CelsiusPriorityProductCard } from '../../../kam/priority/CelsiusPriorityProductCard'

interface PriorityProductAttributeListProps extends React.PropsWithChildren {
    paItems: any[]
    needAuthProducts: any[]
    retailStore: any
    celsiusPriority: boolean
}

const styles = StyleSheet.create({
    ...itemStyles,
    colorTabBlue: {
        color: baseStyle.color.tabBlue
    },
    // for Empty List
    resultIcon: {
        width: 150,
        height: 193
    },
    resultEmpView: {
        alignItems: 'center',
        width: 370
    },
    noProductTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginTop: 20,
        marginBottom: 10
    },
    noProductMsg: {
        fontSize: baseStyle.fontSize.fs_14,
        lineHeight: 20,
        color: baseStyle.color.titleGray,
        textAlign: 'center'
    },
    cardTitleCon: {
        flexDirection: 'row'
    },
    needsAuthPillCon: {
        width: 102,
        height: 20,
        borderRadius: 10,
        backgroundColor: baseStyle.color.borderGray,
        alignItems: 'center',
        justifyContent: 'center'
    },
    needsAuthText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray,
        fontFamily: 'Gotham'
    }
})

const renderPASubItemPushHistory = (pushedOrderItems: any[]) => {
    const renderRow = (key: string, a: any, b: any) => {
        return (
            <View key={key} style={[{ marginHorizontal: 22, flex: 1, flexDirection: 'row', height: 18 }]}>
                <View style={{ flexGrow: 1 }}>{a}</View>
                <View style={{ width: '35%' }}>{b}</View>
            </View>
        )
    }

    const res = [
        renderRow(
            'header',
            <CText style={{ color: baseStyle.color.titleGray }}>
                {`${t.labels.PBNA_MOBILE_PUSHED_QTY} | `}
                <CText style={{ textTransform: 'capitalize' }}>{t.labels.PBNA_MOBILE_FOR}</CText>
            </CText>,
            <CText style={{ color: baseStyle.color.titleGray }}>{t.labels.PBNA_MOBILE_BY}</CText>
        )
    ]

    pushedOrderItems.forEach((orderItem) => {
        res.push(
            renderRow(
                orderItem.id,
                <CText key={orderItem.id}>
                    <CText style={[styles.cardText, styles.cardTextBold]}>
                        {`${orderItem.quantity} ${t.labels.PBNA_MOBILE_QUANTITY_CS}`}
                    </CText>
                    <CText style={[styles.cardText, styles.cardTextPipe]}>{' | '}</CText>
                    <CText style={[styles.cardText, styles.cardTextBold]}>
                        {moment(orderItem.order?.effectiveDate).format(TIME_FORMAT.MMM_DD_YYYY)}
                    </CText>
                </CText>,
                <CText style={{ fontWeight: '700' }}>{orderItem.createdBy?.name}</CText>
            )
        )
    })

    return res
}

export const renderNeedsAuthPill = (needMarginTop?: boolean) => {
    return (
        <View style={[styles.needsAuthPillCon, needMarginTop && commonStyle.marginTop_6]}>
            <CText style={styles.needsAuthText}>{t.labels.PBNA_MOBILE_PRODUCT_NEEDS_AUTH.toLocaleUpperCase()}</CText>
        </View>
    )
}

const renderPaItemProducts = (paItem: any, needAuthProducts: any[]) => {
    return paItem?._pushedProducts?.map((product: any, index: number) => {
        const key = `${product.id}-${product.productCode}-${index}`
        const isProductNeedsAuth = needAuthProducts.includes(product.materialUniqueId)

        return (
            <View
                key={key}
                style={[
                    styles.cardContainer,
                    { borderBottomWidth: 0.3, borderBottomColor: '#E3E3E3', paddingBottom: 18 }
                ]}
            >
                <View style={[styles.card, { borderTopWidth: 0 }]}>
                    <Image style={styles.cardImage} resizeMode={'contain'} source={ImageSrc.IMG_CAROUSEL_GUIDE} />
                    <View style={styles.cardContent}>
                        <View style={commonStyle.flexDirectionRow}>
                            <CText style={styles.cardTitle}>{product.subBrand}</CText>
                            {isProductNeedsAuth && renderNeedsAuthPill()}
                        </View>
                        <CText style={styles.cardSubtitle}>{product.packageGroupName}</CText>
                        {/* productCode | materialUniqueID */}
                        <View style={styles.flexRow}>
                            <CText style={[styles.cardText, styles.cardTextBold, styles.colorTabBlue]}>
                                {product.productCode}
                            </CText>
                            <CText style={[styles.cardText, styles.cardTextPipe]}>{` | `}</CText>
                            <CText style={[styles.cardText]}>{product.materialUniqueId}</CText>
                        </View>
                    </View>
                </View>
                {renderPASubItemPushHistory(product._pushedOrderItems || [])}
            </View>
        )
    })
}
export const PriorityProductAttributeList: React.FC<PriorityProductAttributeListProps> = ({
    paItems,
    retailStore,
    needAuthProducts,
    celsiusPriority
}) => {
    const [isShowViewSelectProducts, setIsShowViewSelectProducts] = useState<boolean>(false)
    const [prodTotalInfo, setProdTotalInfo] = useState<ProdPackageInfo>({} as ProdPackageInfo)

    if (!paItems.length) {
        return (
            <EmptyListPlaceholder
                image={<Image source={ImageSrc.IMG_NO_ITEM_RESULT} style={styles.resultIcon} />}
                title={
                    <View style={styles.resultEmpView}>
                        <CText style={styles.noProductTitle}>{t.labels.PBNA_MOBILE_PRIORITY_NO_PRODUCTS_TITLE}</CText>
                        <CText style={styles.noProductMsg}>{t.labels.PBNA_MOBILE_PRIORITY_NO_PRODUCTS_MSG}</CText>
                    </View>
                }
            />
        )
    }

    return (
        <View>
            {celsiusPriority
                ? paItems.map((paItem) => {
                      return <CelsiusPriorityProductCard key={paItem.Id} productItem={paItem} />
                  })
                : paItems.map((paItem: any, productSequence: number) => {
                      // fix: ERROR  Warning: Each child in a list should have a unique "key" prop
                      const key = `item-${paItem.Flavor}-${paItem.Package}-${productSequence}`

                      return (
                          <View key={key}>
                              <PriorityProductAttributeItem
                                  paItem={paItem}
                                  onPressViewAvailableProducts={() => {
                                      const transObj = convertKeysToCamelCase(paItem)
                                      setProdTotalInfo({
                                          flavorName: paItem.Flavor,
                                          packageName: paItem.Package,
                                          quantityNum: paItem.Quantity,
                                          prodSequence: productSequence,
                                          prodInfo: transObj
                                      })
                                      setIsShowViewSelectProducts(true)
                                  }}
                                  renderSubItems={() => renderPaItemProducts(paItem, needAuthProducts)}
                              />
                          </View>
                      )
                  })}
            {isShowViewSelectProducts && (
                <KamPriorityProductsViewSelect
                    prodPackageInfo={prodTotalInfo}
                    pageTitle={t.labels.PBNA_MOBILE_VIEW_AVAILABLE_PRODUCTS}
                    onBack={() => {
                        setIsShowViewSelectProducts(false)
                    }}
                    retailStore={retailStore}
                />
            )}
        </View>
    )
}
