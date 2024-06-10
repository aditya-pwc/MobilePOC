import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native'
import CText from '../../../../common/components/CText'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { CommonLabel } from '../../../enums/CommonLabel'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import _ from 'lodash'

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 71
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 24,
        fontWeight: '900'
    },
    commentTitle: {
        marginTop: 30,
        marginBottom: 10,
        color: '#565656',
        fontSize: 12
    },
    commentText: {
        fontSize: 14,
        height: 50,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        lineHeight: 18
    },
    orderList: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    orderItem: {
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        paddingHorizontal: 7,
        marginRight: 10
    },
    orderText: { fontSize: 12, color: '#000', fontWeight: '400' },
    showMoreText: { color: baseStyle.color.LightBlue, fontSize: 12, fontWeight: '700' },
    hideText: { fontSize: 12, fontWeight: '700' },
    addMoreCon: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
    addText: { fontSize: 26, color: baseStyle.color.LightBlue, fontWeight: '700', marginRight: 10 },
    addMoreText: { fontSize: 12, color: baseStyle.color.LightBlue, fontWeight: '700' },
    imgClear: {
        width: 18,
        height: 19,
        marginLeft: 5
    },
    listTitleText: {
        marginTop: 30,
        marginBottom: 15
    }
})
export const Header = (props: any) => {
    const { onPress, title } = props
    return (
        <View style={styles.header}>
            <CText style={styles.headerTitle}>{title}</CText>
            <TouchableOpacity onPress={() => onPress && onPress()}>
                <BlueClear height={36} width={36} />
            </TouchableOpacity>
        </View>
    )
}
export const Comments = (props: any) => {
    const { title, onChangeText, value } = props
    return (
        <>
            <CText style={styles.commentTitle}>{title}</CText>
            <TextInput
                multiline
                blurOnSubmit
                value={value}
                placeholderTextColor={baseStyle.color.titleGray}
                placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                style={styles.commentText}
                onChangeText={(val) => onChangeText && onChangeText(val)}
                autoCorrect={false}
            />
        </>
    )
}

export const EditList = (props: any) => {
    const [isShowMore, setIsShowMore] = useState(true)

    const { clearOrderPress, addMoreAction, list, addMoreText, title } = props
    const num = list.length
    const orderArr = isShowMore ? list.slice(CommonLabel.NUMBER_ZERO, CommonLabel.NUMBER_EIGHT) : list
    return (
        <View>
            <CText style={styles.listTitleText}>
                {title} ({num})
            </CText>
            <View style={styles.orderList}>
                {orderArr.length > 0 &&
                    orderArr.map((item: any) => {
                        return (
                            <View key={item?.Id} style={styles.orderItem}>
                                <CText style={styles.orderText}>
                                    {item?.RetailStoreName} - {_.isNumber(item.volume) ? Math.round(item.volume) : '--'}{' '}
                                    {t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()}
                                </CText>
                                <TouchableOpacity onPress={() => clearOrderPress && clearOrderPress(item)}>
                                    <Image source={ImageSrc.IMG_CLEAR} style={styles.imgClear} />
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                {num - CommonLabel.NUMBER_EIGHT > 0 && (
                    <TouchableOpacity onPress={() => setIsShowMore((v) => !v)}>
                        {isShowMore ? (
                            <CText style={styles.showMoreText}>
                                +{num - CommonLabel.NUMBER_EIGHT} {t.labels.PBNA_MOBILE_MORE}
                            </CText>
                        ) : (
                            <CText style={styles.hideText}>{t.labels.PBNA_MOBILE_HIDE}</CText>
                        )}
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.addMoreCon} onPress={() => addMoreAction && addMoreAction()}>
                <CText style={styles.addText}>+</CText>
                <CText style={styles.addMoreText}>{addMoreText}</CText>
            </TouchableOpacity>
        </View>
    )
}
