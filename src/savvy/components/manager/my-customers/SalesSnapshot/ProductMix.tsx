import React, { useState } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'

const FolderImage = require('../../../../../../assets/image/folder.png')
const UnfolderImage = require('../../../../../../assets/image/unfolder.png')
const getFolderImage = (isExpand: boolean) => {
    return isExpand ? FolderImage : UnfolderImage
}
const styles = StyleSheet.create({
    con: { backgroundColor: '#fff' },
    border: { borderBottomWidth: 1, borderColor: '#D3D3D3' },
    image: { width: 25, height: 25, position: 'absolute', right: 22 },
    row: { flexDirection: 'row' },
    text: { fontSize: 12, color: '#565656', lineHeight: 16 },
    boldText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
        lineHeight: 20,
        marginTop: 4
    },
    flex: { flex: 1 },
    itemCon: {
        justifyContent: 'center',
        width: 130,
        paddingLeft: 20,
        paddingRight: 10,
        borderLeftWidth: 1,
        borderColor: '#D3D3D3',
        marginVertical: 30
    },
    yText: { fontSize: 12, color: '#565656' },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    csText: { color: '#000', fontWeight: 'bold', marginTop: 4 },
    redBoldText: { fontSize: 12, fontWeight: 'bold', color: '#EB445A' },
    marginBottom_10: { marginBottom: 10 }
})

const MixItem = (props: any) => {
    const { onHeaderPress, dataList, fold } = props
    return (
        <TouchableOpacity onPress={onHeaderPress}>
            <View style={styles.rowCenter}>
                {dataList.map((item, index) => {
                    const indexKey = index.toString()
                    return (
                        <View
                            key={indexKey}
                            style={[styles.itemCon, { marginTop: 20, paddingBottom: 0, marginBottom: fold ? 20 : 0 }]}
                        >
                            <CText style={styles.text}>{item.title}</CText>
                            <CText style={styles.boldText}>{item.percentage}</CText>
                        </View>
                    )
                })}
                <View style={styles.flex} />
                <Image source={getFolderImage(fold)} style={styles.image} />
            </View>
        </TouchableOpacity>
    )
}
export const ProductMixItem = (props: any) => {
    const [fold, setFold] = useState(true)
    const { dataList, isRevenue } = props
    return (
        <View style={[styles.border, { borderBottomWidth: fold ? 1 : 0 }]}>
            <MixItem dataList={dataList} fold={fold} onHeaderPress={() => setFold(!fold)} />
            <Collapsible collapsed={fold}>
                <View style={styles.row}>
                    {dataList.map((item: any, index) => {
                        const indexKey = index.toString()
                        const { cy, py } = item
                        const cyStr = isRevenue
                            ? ` ${parseFloat(cy).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  maximumFractionDigits: 2
                              })}`
                            : `  ${cy} ` + t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()
                        const pyStr = isRevenue
                            ? ` ${parseFloat(py).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  maximumFractionDigits: 2
                              })}`
                            : `  ${py} ` + t.labels.PBNA_MOBILE_ORDER_CS.toLowerCase()
                        return (
                            <View
                                key={indexKey}
                                style={[styles.itemCon, { marginBottom: 20, paddingTop: fold ? 0 : 20, marginTop: 0 }]}
                            >
                                <CText numberOfLines={1} style={[styles.yText, styles.marginBottom_10]}>
                                    {t.labels.PBNA_MOBILE_CY.toLocaleUpperCase()}
                                    <CText style={styles.csText}>{cyStr}</CText>
                                </CText>
                                <CText numberOfLines={1} style={[styles.yText, styles.marginBottom_10]}>
                                    {t.labels.PBNA_MOBILE_PY.toLocaleUpperCase()}
                                    <CText style={styles.csText}>{pyStr}</CText>
                                </CText>
                                <CText numberOfLines={1} style={styles.yText}>
                                    {t.labels.PBNA_MOBILE_INDEX}
                                    <CText style={[styles.redBoldText, item.indexBlack && styles.csText]}>
                                        {`  ${item.sumIndex}`}{' '}
                                    </CText>
                                </CText>
                            </View>
                        )
                    })}
                </View>
            </Collapsible>
        </View>
    )
}
export const ProductMix = (props: any) => {
    const { dataArr, isRevenue } = props
    return (
        <View style={styles.con}>
            {dataArr.map((item, index) => {
                return <ProductMixItem key={index} dataList={item} isRevenue={isRevenue} />
            })}
        </View>
    )
}
