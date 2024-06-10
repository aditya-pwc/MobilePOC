import React, { useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'
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
    blackBoldText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
    grayText: { fontSize: 12, color: '#565656', width: 50 },
    redBoldText: { fontSize: 12, fontWeight: 'bold', color: '#EB445A', width: 50 },
    border: { borderBottomWidth: 1, borderColor: '#D3D3D3' },
    lineItemCon: { flexDirection: 'row', marginHorizontal: 22, alignItems: 'center', paddingRight: 45 },
    header: { flexDirection: 'row', marginHorizontal: 22, paddingRight: 45 },
    img: { position: 'absolute', width: 25, height: 25, right: 0 },
    flex: { flex: 1 },
    col: { flexShrink: 0, flexGrow: 0, marginRight: 4 },
    col1: { width: '40%' },
    col2: { width: '15%' },
    col3: { width: '15%' },
    col4: { width: '15%' },
    col5: { width: '15%' },
    marginTop_30: {
        marginTop: 30
    },
    col0: { flexShrink: 0, flexGrow: 0, marginRight: 20 }
})
interface PackageBreakdownProps {
    packagesDataArr: Array<any>
}
interface PackageBreakDownItemProps {
    products?: any
    hasBorder?: boolean
}

const LineItem = (props: any) => {
    const { isHeader, onHeaderPress, name, hasBorder, fold, cy, py, bw, sumIndex } = props
    const isNormal = cy >= py
    return (
        <TouchableOpacity onPress={() => onHeaderPress && onHeaderPress()}>
            <View style={[styles.lineItemCon, { height: isHeader ? 70 : 50 }, hasBorder && styles.border]}>
                <CText style={[{ fontSize: 12, fontWeight: isHeader ? '700' : '400' }, styles.col0, styles.col1]}>
                    {name}
                </CText>
                <CText numberOfLines={1} style={[styles.blackBoldText, styles.col, styles.col2]}>
                    {cy}
                </CText>
                <CText numberOfLines={1} style={[styles.blackBoldText, styles.col, styles.col3]}>
                    {py}
                </CText>
                <CText
                    numberOfLines={1}
                    style={[styles.redBoldText, styles.col, styles.col4, isNormal && styles.blackBoldText]}
                >
                    {bw}
                </CText>
                <CText numberOfLines={1} style={[styles.redBoldText, isNormal && styles.blackBoldText]}>
                    {sumIndex}
                </CText>
                {isHeader && <Image source={getFolderImage(fold)} style={styles.img} />}
            </View>
        </TouchableOpacity>
    )
}
const PackageBreakDownItem = (props: PackageBreakDownItemProps) => {
    const [fold, setFold] = useState(true)
    const { products, hasBorder } = props
    const { packageTypeName, totalCY, totalPY, totalBW, totalPercentage, lstBreakdownProduct } = products
    if (lstBreakdownProduct.length === 0) {
        return <View />
    }
    return (
        <View style={hasBorder && styles.border}>
            <LineItem
                isHeader
                fold={fold}
                name={packageTypeName}
                cy={totalCY}
                py={totalPY}
                bw={totalBW}
                sumIndex={totalPercentage}
                onHeaderPress={() => setFold(!fold)}
            />
            <Collapsible collapsed={fold}>
                {lstBreakdownProduct &&
                    lstBreakdownProduct.map((item: any, index: any) => {
                        return (
                            <LineItem
                                key={item?.productName + item.aloneCY + item.alonePY + item.alonePercentage}
                                data={item}
                                hasBorder={index !== lstBreakdownProduct.length - 1}
                                name={item.productName}
                                cy={item.aloneCY}
                                py={item.alonePY}
                                bw={item.aloneBW}
                                sumIndex={item.alonePercentage}
                            />
                        )
                    })}
            </Collapsible>
        </View>
    )
}

const PackageBreakdown = (props: PackageBreakdownProps) => {
    const { packagesDataArr } = props
    return (
        <View style={styles.marginTop_30}>
            <View style={styles.header}>
                <View style={[styles.col0, styles.col1]} />
                <CText style={[styles.grayText, styles.col, styles.col2]}>
                    {t.labels.PBNA_MOBILE_CY.toLocaleUpperCase()}
                </CText>
                <CText style={[styles.grayText, styles.col, styles.col3]}>
                    {t.labels.PBNA_MOBILE_PY.toLocaleUpperCase()}
                </CText>
                <CText style={[styles.grayText, styles.col, styles.col4]}>{t.labels.PBNA_MOBILE_BW}</CText>
                <CText style={[styles.grayText, styles.col, styles.col5]}>{t.labels.PBNA_MOBILE_INDEX}</CText>
            </View>
            {packagesDataArr.map((item, index) => {
                return (
                    <PackageBreakDownItem
                        key={item?.packageId}
                        products={item}
                        hasBorder={index !== packagesDataArr.length - 1}
                    />
                )
            })}
        </View>
    )
}
export default PackageBreakdown
