/**
 * @description Screen to show Customer List Tile.
 * @author Shangmin Dou
 * @date 2021-09-27
 */
import React, { FC } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import CText from '../../../../common/components/CText'
import StorePlaceholderSvg from '../../../../../assets/image/Icon-store-placeholder.svg'
import { renderCheckBox } from '../../../helper/rep/CommonHelper'
import {
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaFSR,
    isPersonaFSROrFSM,
    isPersonaPSRorFSRorSDLorKAM,
    Persona
} from '../../../../common/enums/Persona'
import { handleDayStatus } from '../../../utils/MerchManagerUtils'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import _ from 'lodash'
import { CommonParam } from '../../../../common/CommonParam'
import { renderLocation, renderPhone } from '../../../../common/helpers/IconHelper'
import DeliveryIcon from '../../../../../assets/image/icon-shipping.svg'
import CheckMarkIcon from '../../../../../assets/image/icon_checkmark_whitecircle.svg'
import { useCustomerTileDelivery } from '../../../hooks/CustomerHooks'
import { autoLogCall } from '../../../utils/TaskUtils'
import { useAppDispatch } from '../../../redux/ReduxHooks'
import { refreshCustomerActivityList } from '../../../redux/Slice/CustomerDetailSlice'

interface CustomerListTileProps {
    customer: any
    showShadow?: boolean
    hideAppendage?: boolean
    customerListAppendage?: boolean
    smallGap?: boolean
    hasInnov?: boolean
    addToCart?: boolean
    onCheck?: Function
    datePickerView?: React.ReactElement
    containerStyle?: any
    isCDAMapView?: boolean
    isOnDetailPage?: boolean
    isOverViewMap?: boolean
    isCurrentCdaYear?: boolean
    showCDAStatus?: boolean
    refreshFlag?: number
    isLoading?: boolean
}

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        // marginTop: 22,
        borderRadius: 5,
        flexDirection: 'column'
    },
    shadow: {
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 6
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    storeText: {
        fontSize: 12,
        color: 'black',
        marginLeft: 8,
        fontWeight: '700'
    },
    grayDay: {
        color: '#D3D3D3'
    },
    appendageBlock: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center'
    },
    innovView: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    innovText: {
        fontWeight: '400',
        color: '#000000',
        fontSize: 12,
        fontFamily: 'Gotham'
    },
    innovTextRed: {
        color: 'red'
    },
    innovTextGray: {
        color: baseStyle.color.gray
    },
    line: {
        color: '#D3D3D3',
        fontSize: 12
    },
    transferLabelStyle: {
        display: 'flex',
        flexDirection: 'row',
        borderBottomRightRadius: 20,
        borderTopLeftRadius: 6,
        height: 20,
        alignItems: 'center',
        paddingHorizontal: 14,
        backgroundColor: '#FFC409',
        position: 'absolute',
        top: 0,
        left: 0
    },
    statusTagLabelStyle: {
        display: 'flex',
        flexDirection: 'row',
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 20,
        height: 22,
        alignItems: 'center',
        paddingRight: 6,
        paddingLeft: 10,
        paddingTop: 3,
        paddingBottom: 4,
        position: 'absolute',
        top: 0,
        right: 0
    },
    transferTextStyle: {
        fontWeight: '700',
        color: '#000',
        fontSize: 12,
        fontFamily: 'Gotham'
    },
    imgStyle: {
        height: 58,
        width: 58,
        marginRight: '5%'
    },
    marginRight_5: { marginRight: '5%' },
    storePlaceHolder: {
        marginRight: 15
    },
    textStyle: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    phoneLocationContainer: {
        height: '100%',
        minWidth: 1,
        marginLeft: 10
    },
    tileBottom: {
        height: 40,
        backgroundColor: '#F2F4F7',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
    bottomBarText: {
        fontSize: 12,
        color: '#565656'
    },
    bottomBarText2: {
        fontSize: 12,
        color: '#000000'
    },
    bottomBarContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 20
    },
    bottomBarContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    bottomBarContainer3: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    customerCardContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 26,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    customerCardMain: {
        height: '100%',
        width: '90%',
        flexDirection: 'row'
    },
    customerCardTextContainer: {
        justifyContent: 'center',
        maxWidth: screenWidth * 0.9 - 40 - 25 - 58 - 18 // calculate all the width of items in the same line
    },
    customerIdStyle: {
        marginTop: 5,
        fontSize: 12,
        color: '#000000',
        fontWeight: '700',
        fontFamily: 'Gotham'
    },
    negativeTriangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 10,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'red'
    },
    positiveTriangle: {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 10,
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'green'
    },
    netRevLabel: {
        marginTop: 10,
        fontSize: 12,
        color: '#565656'
    },
    netRevText: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '700',
        marginRight: 5
    },
    marginRight_6: {
        marginRight: 6
    },
    deliveryCountStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

export const renderOrderDays = (orderDays) => {
    const dayStatus = handleDayStatus(orderDays)
    return dayStatus?.map((wStatus: any) => {
        return (
            <CText key={wStatus.name} style={[styles.storeText, !wStatus.attend && styles.grayDay]}>
                {wStatus.label}
            </CText>
        )
    })
}

export const renderCDAStoreIcon = (medal: string, overrideStyle?: {}) => {
    const imgStyle = overrideStyle || styles.imgStyle

    if (_.isEmpty(medal)) {
        return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Not-Signed.png')} />
    }
    switch (medal) {
        case 'Platinum':
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Platinum.png')} />

        case 'Gold':
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Gold.png')} />

        case 'Silver':
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Silver.png')} />

        case 'Bronze':
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Bronze.png')} />

        case 'Copper':
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Basic.png')} />

        default:
            return <Image style={imgStyle} source={require('../../../../../assets/image/OTS-Logo-Custom.png')} />
    }
}

export const renderNetRevPercent = (netRevPercent: number) => {
    let netRev = '--%'
    const isNotEmpty = (netRevPercent: any) => {
        return (
            netRevPercent !== null &&
            netRevPercent !== undefined &&
            netRevPercent !== '' &&
            !Number.isNaN(Number(netRevPercent))
        )
    }
    if (isNotEmpty(netRevPercent)) {
        netRev = `${Math.abs(_.round(Number(netRevPercent))) > 9999 ? 9999 : Math.abs(_.round(Number(netRevPercent)))}%`
        return (
            <View>
                <CText style={styles.netRevLabel}>{t.labels.PBNA_MOBILE_NET_REV}</CText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CText style={styles.netRevText}>{netRev}</CText>
                    {Number(netRevPercent) !== 0 && (
                        <View style={[netRevPercent > 0 ? styles.positiveTriangle : styles.negativeTriangle]} />
                    )}
                </View>
            </View>
        )
    }
    return <View />
}

export const renderStoreIcon = (
    cust: any,
    isOnDetailPage: boolean,
    isOverViewMap: boolean,
    iconStyle: object,
    svgProp?: { width: any; height: any }
) => {
    // Logic mainly used for my customer tab and overView map
    if (cust?.['Account.IsOTSCustomer__c'] === '1' || cust?.['Account.IsOTSCustomer__c'] === true) {
        if (isOnDetailPage) {
            return renderCDAStoreIcon(cust?.['Account.CDA_Medal__c'] || '')
        }
        if (isOverViewMap && !(isPersonaPSRorFSRorSDLorKAM() || isPersonaFSManager())) {
            return <StorePlaceholderSvg style={iconStyle} />
        }
        return renderCDAStoreIcon('')
    }
    return <StorePlaceholderSvg style={iconStyle} {...svgProp} />
}

const CustomerListTile: FC<CustomerListTileProps> = (props: CustomerListTileProps) => {
    const {
        customer,
        showShadow,
        hideAppendage,
        customerListAppendage,
        smallGap,
        hasInnov,
        addToCart,
        onCheck,
        datePickerView,
        containerStyle = {},
        isCDAMapView = false,
        isOnDetailPage = false,
        isOverViewMap = false,
        isCurrentCdaYear = false,
        showCDAStatus = false,
        refreshFlag = 0,
        isLoading = false
    } = props

    const tileDeliveryCount = useCustomerTileDelivery(customer?.Id, refreshFlag, isLoading)
    const dispatch = useAppDispatch()
    const isShowOnDetailPageAndHasCDATag = () => {
        return (
            isOnDetailPage &&
            isPersonaPSRorFSRorSDLorKAM() &&
            customer['Account.IsCDACustomer__c'] === '1' &&
            !!customer[isCurrentCdaYear ? 'Account.CDA_Status__c' : 'Account.CDA_NY_Status__c']
        )
    }

    const statusMapping = {
        'In Progress': {
            label: t.labels.PBNA_MOBILE_CDA_TAG_IN_PROGRESS.toLocaleUpperCase(),
            color: '#FFC409',
            textColor: 'black'
        },
        Signed: {
            label: t.labels.PBNA_MOBILE_CDA_SIGNED.toLocaleUpperCase(),
            color: '#2DD36F',
            textColor: 'white'
        },
        'Not Started': {
            label: t.labels.PBNA_MOBILE_CDA_NOT_STARTED.toLocaleUpperCase(),
            color: '#0067A0',
            textColor: 'white'
        },
        Declined: {
            label: t.labels.PBNA_MOBILE_CDA_DECLINED.toLocaleUpperCase(),
            color: '#EB445A',
            textColor: 'white'
        }
    }

    const renderTransfer = (cust: any) => {
        if (
            cust['Account.change_initiated__c'] === '1' ||
            cust['Account.change_initiated__c'] === true ||
            cust?.Account?.change_initiated__c === true
        ) {
            return (
                <View style={styles.transferLabelStyle}>
                    <CText style={styles.transferTextStyle}> {t.labels.PBNA_MOBILE_TRANSFER.toLocaleUpperCase()}</CText>
                </View>
            )
        }
        return null
    }

    const renderStatusTag = (cust) => {
        const status: keyof typeof statusMapping =
            cust[isCurrentCdaYear ? 'Account.CDA_Status__c' : 'Account.CDA_NY_Status__c']
        if (!status) {
            return null
        }
        const statusMappingItem = statusMapping[status]
        return (
            <View style={[styles.statusTagLabelStyle, { backgroundColor: statusMappingItem.color }]}>
                <CText style={[styles.transferTextStyle, { color: statusMappingItem.textColor }]}>
                    {' '}
                    {statusMappingItem.label}
                </CText>
            </View>
        )
    }

    const stateCode = () => {
        if (customer.StateCode === undefined) {
            return customer.State ? customer.State : ''
        }
        return customer.StateCode ? customer.StateCode : ''
    }

    const renderInnovView = (volYTD: string, netRev: string) => {
        return (
            <View style={styles.innovView}>
                <CText style={[styles.innovText, styles.innovTextGray]}>
                    Vol
                    <CText style={[styles.innovText, parseInt(volYTD || '0') < 0 && styles.innovTextRed]}>
                        {' '}
                        {parseInt(volYTD || '0').toLocaleString('en-US') + ' cs'}{' '}
                    </CText>
                </CText>
                <CText style={styles.line}> | </CText>
                <CText style={[styles.innovText, styles.innovTextGray]}>
                    {'NR '}
                    <CText style={[styles.innovText, parseFloat(netRev || '0') < 0 && styles.innovTextRed]}>
                        {parseFloat(netRev || '0') !== 0
                            ? parseFloat(netRev || '0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  maximumFractionDigits: 2
                              })
                            : t.labels.PBNA_MOBILE_ORDER_D + '0.00'}
                    </CText>
                </CText>
            </View>
        )
    }

    const renderDeliveryCount = () => {
        return (
            <View style={styles.tileBottom}>
                <View style={styles.bottomBarContainer3}>
                    <View style={styles.appendageBlock}>
                        <DeliveryIcon style={styles.marginRight_6} />
                        {tileDeliveryCount?.completeCount < tileDeliveryCount?.upcomingCount && (
                            <CText style={styles.bottomBarText2}>{t.labels.PBNA_MOBILE_UPCOMING_DELIVERY}</CText>
                        )}
                        {tileDeliveryCount?.completeCount === tileDeliveryCount?.upcomingCount && (
                            <View style={styles.deliveryCountStyle}>
                                <CText style={[styles.bottomBarText2, styles.marginRight_6]}>
                                    {t.labels.PBNA_MOBILE_DELIVERY_COMPLETED}
                                </CText>
                                <CheckMarkIcon />
                            </View>
                        )}
                    </View>
                    <View style={styles.appendageBlock}>
                        <CText style={styles.bottomBarText2}>
                            {tileDeliveryCount?.completeCount}/{tileDeliveryCount?.upcomingCount}
                        </CText>
                    </View>
                </View>
            </View>
        )
    }

    const getAddress = (customer) => {
        // Do not format
        return `${customer.Street ? customer.Street : ''}
${customer.City ? customer.City + ', ' : ''}${stateCode()}${customer.PostalCode ? ' ' + customer.PostalCode : ''}`
    }
    const isToOmitAddress = () => {
        return isCDAMapView || isShowOnDetailPageAndHasCDATag()
    }
    return (
        <View
            style={[
                styles.container,
                showShadow
                    ? {
                          shadowColor: '#DCE5EE',
                          shadowOffset: {
                              width: 0,
                              height: 2
                          },
                          shadowOpacity: 1,
                          shadowRadius: 10
                      }
                    : {},
                smallGap ? { marginTop: 16 } : { marginTop: 22 },
                containerStyle
            ]}
        >
            <View style={styles.customerCardContainer}>
                {renderTransfer(customer)}
                {showCDAStatus && renderStatusTag(customer)}
                <View style={[styles.customerCardMain, hasInnov && { paddingTop: 26, paddingBottom: 15 }]}>
                    <View>
                        {renderStoreIcon(customer, isOnDetailPage, isOverViewMap, styles.storePlaceHolder)}
                        {renderNetRevPercent(
                            customer['Account.Delta_Revenue_Percentage__c'] ||
                                customer?.Account?.Delta_Revenue_Percentage__c
                        )}
                    </View>
                    <View style={[styles.customerCardTextContainer, !hasInnov && { height: '100%' }]}>
                        <CText numberOfLines={3} style={styles.textStyle} fontFamily={'Gotham-Black'}>
                            {customer.Name}
                        </CText>
                        {(customer['Account.CUST_UNIQ_ID_VAL__c'] ||
                            customer.CustomerUniqueId ||
                            customer?.Account?.CUST_UNIQ_ID_VAL__c) && (
                            <CText style={styles.customerIdStyle}>
                                {`#${
                                    customer['Account.CUST_UNIQ_ID_VAL__c'] ||
                                    customer.CustomerUniqueId ||
                                    customer?.Account?.CUST_UNIQ_ID_VAL__c
                                }`}
                            </CText>
                        )}
                        {isToOmitAddress() && (
                            <CText numberOfLines={2} style={styles.streetText}>
                                {getAddress(customer)}
                            </CText>
                        )}
                        {!isToOmitAddress() && (
                            <>
                                <CText style={styles.streetText}>{customer.Street}</CText>
                                <CText style={styles.cityText}>
                                    {customer.City ? customer.City + ', ' : null}
                                    {stateCode()}
                                    {customer.PostalCode ? ' ' + customer.PostalCode : null}
                                </CText>
                            </>
                        )}

                        {hasInnov && renderInnovView(customer.volYTD, customer.netRev)}
                    </View>
                </View>
                <View style={styles.phoneLocationContainer}>
                    {!addToCart &&
                        renderPhone(customer['Account.Phone'] || customer.Account?.Phone, async () => {
                            if (isPersonaFSR()) {
                                await autoLogCall(customer.AccountId)
                                dispatch(refreshCustomerActivityList())
                            }
                        })}
                    {!addToCart &&
                        renderLocation(
                            customer.Customer_Latitude__c || JSON.parse(customer?.Store_Location__c || null)?.latitude,
                            customer.Customer_Longitude__c || JSON.parse(customer?.Store_Location__c || null)?.longitude
                        )}
                    {addToCart && renderCheckBox(customer, onCheck)}
                </View>
            </View>
            {addToCart && datePickerView}
            {!hideAppendage &&
                customerListAppendage &&
                (CommonParam.PERSONA__c === Persona.PSR || CommonParam.PERSONA__c === Persona.KEY_ACCOUNT_MANAGER) && (
                    <View style={styles.tileBottom}>
                        <View style={styles.bottomBarContainer2}>
                            <View style={styles.appendageBlock}>
                                <CText style={styles.bottomBarText}>{t.labels.PBNA_MOBILE_CL_ORDER}</CText>
                                <View style={commonStyle.flexDirectionRow}>
                                    {renderOrderDays(
                                        customer['Account.Merchandising_Order_Days__c'] ||
                                            customer?.Account?.Merchandising_Order_Days__c
                                    )}
                                </View>
                            </View>
                            <View style={styles.appendageBlock}>
                                <CText style={styles.bottomBarText}>{t.labels.PBNA_MOBILE_CL_DELIVERY}</CText>
                                <View style={commonStyle.flexDirectionRow}>
                                    {renderOrderDays(
                                        customer['Account.Merchandising_Delivery_Days__c'] ||
                                            customer?.Account?.Merchandising_Delivery_Days__c
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            {(isPersonaFSROrFSM() || (isPersonaCRMBusinessAdmin() && isOnDetailPage)) &&
                tileDeliveryCount?.upcomingCount !== 0 &&
                renderDeliveryCount()}
        </View>
    )
}

export default CustomerListTile
