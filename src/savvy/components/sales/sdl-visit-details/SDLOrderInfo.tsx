/*
 * @Description: Do not edit
 * @Author: Yi Li
 * @Date: 2022-01-18 00:43:16
 * @LastEditTime: 2022-12-28 10:14:47
 * @LastEditors: Aimee Zhang
 */

import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Accordion from 'react-native-collapsible/Accordion'
import { CommonApi } from '../../../../common/api/CommonApi'
import { restApexCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { Log } from '../../../../common/enums/Log'
import { OrderDetailType } from '../../../enums/Manager'
import { t } from '../../../../common/i18n/t'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import SDLOrderPackage, { ACCORDION_TYPE, renderHeader } from './SDLOrderPackage'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { getStringValue } from '../../../utils/LandingUtils'

interface SDLOrderInfoProps {
    visitInfo
    navigation?
}
const styles = StyleSheet.create({
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3'
    },
    emptyLine8: {
        backgroundColor: '#D3D3D3',
        height: 8
    },
    emptyCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 22,
        paddingBottom: 21,
        paddingTop: 21,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    emptyImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#D3D3D3'
    },
    emptyContain: {
        marginTop: 10,
        marginBottom: 100
    },
    emptyColumn: {
        flex: 2,
        justifyContent: 'center'
    },
    emptyShortLineCon: {
        flex: 2,
        flexDirection: 'row',
        marginLeft: 69
    },
    emptyColumnContainer: {
        marginLeft: 27,
        justifyContent: 'center'
    }
})

const parseOrderInfo = (orderArr, type) => {
    return orderArr.map((elementArr) => {
        const packageGroupData = _.groupBy(elementArr.packages, (item: any) => {
            return item.packageTypeName || ''
        })
        const orderItemsArr = []
        _.forEach(packageGroupData, (val, keyStr) => {
            let packageOrderQuantity = ''
            if (type === ACCORDION_TYPE.ORDER) {
                packageOrderQuantity =
                    val.reduce((a, b) => a + parseFloat(b.quantity || 0), 0) +
                    ` ${t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}`
            } else {
                const returnCases = val.reduce((a, b) => a + parseFloat(b.wholeCasesQuantity || 0), 0)
                const unitQuantity = val.reduce((a, b) => a + parseFloat(b.orderItemRemainderUnitQuantity || 0), 0)
                packageOrderQuantity = `${returnCases} ${t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()} ${unitQuantity} ${t.labels.PBNA_MOBILE_ORDER_UN.toLowerCase()}`
            }
            orderItemsArr.push({
                type: ACCORDION_TYPE.PACKAGE,
                title: keyStr,
                orderQuantity: packageOrderQuantity,
                orderItems: val,
                header: t.labels.PBNA_MOBILE_PACKAGE
            })
        })
        const redefineItem = _.cloneDeep(elementArr)
        redefineItem.packages = orderItemsArr
        return redefineItem
    })
}

const formatOrderItemDataWithType = (dataArr, type) => {
    if (dataArr.length === 0) {
        return []
    }
    const orderArr = []
    if (type === ACCORDION_TYPE.ORDER) {
        const orderGroupData = _.groupBy(dataArr, (item: any) => {
            return item.orderId
        })
        let index = 0
        _.forEach(orderGroupData, (val) => {
            index = index + 1
            const orderObject = val.length > 0 ? val[0] : {}
            const totalQua = val.reduce((a, b) => a + parseFloat(b.quantity || 0), 0)
            orderArr.push({
                Id: orderObject.orderId,
                type: Object.keys(orderGroupData)?.length === 1 ? `${type}` : `${type} ${index}`,
                title: formatWithTimeZone(orderObject?.orderDlvryRqstdDtm || '', TIME_FORMAT.MMMDDYYYY, true, false),
                totalAmount: orderObject?.totalAmount || '',
                orderQuantity: totalQua,
                packages: val,
                header:
                    Object.keys(orderGroupData)?.length === 1
                        ? t.labels.PBNA_MOBILE_ORDER
                        : `${t.labels.PBNA_MOBILE_ORDER} ${index}`
            })
        })
    } else {
        const orderObject = dataArr.length > 0 ? dataArr[0] : {}
        orderArr.push({
            Id: orderObject.orderId,
            type: type,
            title: formatWithTimeZone(orderObject?.orderDlvryRqstdDtm || '', TIME_FORMAT.MMMDDYYYY, true, false),
            totalAmount: '',
            orderQuantity: '',
            packages: dataArr,
            header: t.labels.PBNA_MOBILE_RETURNS
        })
    }
    const finalData = parseOrderInfo(orderArr, type)
    return finalData
}

const renderShortLine = (marginStyle?) => {
    return <View style={[styles.emptyLine8, { width: 34 }, marginStyle]} />
}
const renderTwoLineEmptyColumn = () => {
    return (
        <View style={styles.emptyColumn}>
            {renderShortLine()}
            <View style={[styles.emptyLine8, { width: 126, marginTop: 11 }]} />
        </View>
    )
}

const renderEmptyCell = () => {
    return (
        <View style={styles.emptyCell}>
            <View style={styles.emptyImage} />
            <View style={styles.emptyColumnContainer}>{renderTwoLineEmptyColumn()}</View>
            <View style={styles.emptyShortLineCon}>
                {renderShortLine()}
                {renderShortLine({ marginLeft: 29 })}
            </View>
        </View>
    )
}

const SDLOrderInfo = (props: SDLOrderInfoProps) => {
    const { visitInfo } = props
    const currentVisit = visitInfo || {}
    const [orderData, setOrderData] = useState([])
    const [orderActiveSections, setOrderActiveSections] = useState([])

    const getOrderDataFromSoup = () => {
        let entryId = ''
        let currentDate = ''
        if (currentVisit.type === OrderDetailType.ORDER) {
            entryId = currentVisit.accountId || ''
            currentDate = currentVisit.currentDate || ''
        } else if (currentVisit.type === OrderDetailType.VISIT) {
            entryId = currentVisit.Id || ''
        }
        restApexCommonCall(
            `${CommonApi.PBNA_MOBILE_URL_ORDER_INFORMATION}/${entryId}&${currentVisit.type}&${currentDate}&${CommonParam.userLocationId}`,
            'GET'
        )
            .then((result) => {
                if (!result?.data) {
                    return
                }
                const dataSource = JSON.parse(result?.data || '')
                const orderDataSource = dataSource.filter((ele) => ele.orderItemLnActvyCdv !== 'RET')
                const retData = dataSource.filter((ele) => ele.orderItemLnActvyCdv === 'RET')
                const orderGroup = formatOrderItemDataWithType(orderDataSource, ACCORDION_TYPE.ORDER)
                const retGroup = formatOrderItemDataWithType(retData, ACCORDION_TYPE.RETURNS)
                setOrderData([...orderGroup, ...retGroup])
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'SDLOrderInfo.getOrderDataFromSoup', getStringValue(err))
            })
    }

    useEffect(() => {
        getOrderDataFromSoup()
    }, [currentVisit?.Id])

    const updateExpSections = (currentSections) => {
        setOrderActiveSections(currentSections)
    }

    return (
        <View>
            {orderData.length > 0 ? (
                <Accordion
                    key={currentVisit?.Id}
                    containerStyle={[
                        styles.accordionContain,
                        { marginBottom: 100, backgroundColor: '#FFF', marginTop: 20 }
                    ]}
                    keyExtractor={(item, index) => item + index}
                    sections={orderData}
                    expandMultiple
                    activeSections={orderActiveSections}
                    renderHeader={(content, index, isActive) => {
                        return renderHeader(content, index, isActive)
                    }}
                    renderContent={(section) => {
                        return <SDLOrderPackage section={section} key={section?.Id + section?.header} />
                    }}
                    onChange={updateExpSections}
                />
            ) : (
                <View style={styles.emptyContain}>
                    <View style={styles.emptyCell}>
                        {renderTwoLineEmptyColumn()}
                        {renderTwoLineEmptyColumn()}
                    </View>
                    {renderEmptyCell()}
                    {renderEmptyCell()}
                </View>
            )}
        </View>
    )
}

export default SDLOrderInfo
