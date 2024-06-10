import React, { FC } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { t } from '../../../../../common/i18n/t'

const styles = StyleSheet.create({
    selectedContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    itemCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginBottom: 10,
        marginRight: 10,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 15
    },
    clearItemContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    readonlyShowMoreCell: {
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.tabBlue,
        borderWidth: 1,
        ...commonStyle.flexRowAlignCenter
    },
    attendeesText: {
        flexShrink: 1
    },
    showMoreText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    },
    betweenStyle: {
        justifyContent: 'space-between'
    },
    maxWidth: {
        maxWidth: '90%'
    }
})

interface CustomerCellProps {
    itemArr: any
    handleRemove?: Function
    enableHide?: boolean
    controlNum?: any
    isShowMore?: boolean
    setIsShowMore?: (isShowMore: boolean) => void
    otsSelected?: boolean
    setIsKAChange?: (isKAChange: boolean) => void
    onRemoveOTS?: Function
    setOtsSelected?: (otsSelected: boolean) => void
}

const CustomerCell: FC<CustomerCellProps> = (props: CustomerCellProps) => {
    const {
        itemArr,
        handleRemove,
        enableHide,
        isShowMore,
        setIsShowMore,
        controlNum,
        otsSelected,
        setOtsSelected,
        onRemoveOTS,
        setIsKAChange
    } = props

    const getControlNum = () => {
        if (otsSelected) {
            return controlNum - 1
        }
        return controlNum
    }
    const renderItem = () => {
        return isShowMore ? (
            <CText style={[styles.attendeesText, styles.showMoreText]}>
                +{itemArr.length - getControlNum()} {t.labels.PBNA_MOBILE_MORE}
            </CText>
        ) : (
            <CText style={[styles.attendeesText, styles.showMoreText]}>SHOW LESS</CText>
        )
    }

    const getSliceList = () => {
        return isShowMore ? itemArr.slice(CommonLabel.NUMBER_ZERO, getControlNum()) : itemArr
    }

    return (
        <View style={styles.selectedContainer}>
            {otsSelected && (
                <View style={[styles.itemCell, styles.betweenStyle]}>
                    <CText numberOfLines={1} style={styles.maxWidth}>
                        OTS Customers
                    </CText>
                    <TouchableOpacity
                        onPress={() => {
                            setOtsSelected(false)
                            if (setIsKAChange) {
                                setIsKAChange(true)
                            }
                            if (onRemoveOTS) {
                                onRemoveOTS()
                            }
                        }}
                    >
                        <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                    </TouchableOpacity>
                </View>
            )}
            {getSliceList().map((item, index) => {
                const indexKey = index.toString()
                return (
                    <View style={[styles.itemCell, styles.betweenStyle]} key={indexKey}>
                        <CText numberOfLines={1} style={styles.maxWidth}>
                            {item.Name}
                        </CText>
                        <TouchableOpacity
                            onPress={() => handleRemove(itemArr, index)}
                            style={styles.clearItemContainer}
                        >
                            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                        </TouchableOpacity>
                    </View>
                )
            })}
            {enableHide && itemArr.length > getControlNum() && (
                <TouchableOpacity
                    style={[styles.itemCell, styles.readonlyShowMoreCell]}
                    onPress={() => {
                        setIsShowMore(!isShowMore)
                    }}
                >
                    {renderItem()}
                </TouchableOpacity>
            )}
        </View>
    )
}

export default CustomerCell
