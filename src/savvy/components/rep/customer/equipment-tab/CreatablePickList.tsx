/**
 * @description CreatablePickList
 * @author Kiren Cao
 * @date 2021/12/9
 */
import React, { FC } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import CText from '../../../../../common/components/CText'
import SearchablePicklist from '../../lead/common/SearchablePicklist'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface CreatablePickListProps {
    label: string
    data: any
    showValue: Function
    labelStyle?: any
    containerStyle?: any
    onApply?: any
    input?: boolean
    defValue?: string
    cRef?: any
    search?: boolean
    onSearchChange?: any
    extraData?: any
    setOverView?: any
    overview?: any
    lastListItem?: any
    onLastItemClick?: any
    onClear?: any
    disabled?: any
}

const styles = StyleSheet.create({
    valueContainer: {
        marginTop: 35,
        marginBottom: 35,
        marginLeft: 30
    },
    valueTextStyle: {
        fontSize: 18,
        fontWeight: '900'
    },
    titleStyle: {
        color: '#565656',
        marginTop: 4
    },
    pickListContainer: {
        height: 65,
        justifyContent: 'center',
        marginLeft: 30
    },
    addContainer: {
        height: 36,
        width: 30
    },
    addIconStyle1: {
        width: 20,
        height: 3,
        backgroundColor: '#ccc',
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    addIconStyle2: {
        width: 3,
        height: 20,
        backgroundColor: '#ccc',
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    addContactText: {
        color: '#ccc',
        fontWeight: '700'
    }
})

const CreatablePickList: FC<CreatablePickListProps> = (props: CreatablePickListProps) => {
    const { label, data, disabled, onApply, showValue, defValue, cRef, lastListItem, onLastItemClick, onClear } = props

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={commonStyle.fullWidth}
                onPress={() => {
                    cRef.current?.setValue(showValue(item))
                    if (onApply) {
                        onApply(item)
                    }
                    cRef.current?.showPickList(false)
                }}
            >
                {index !== data.length && (
                    <View style={styles.valueContainer}>
                        <CText style={styles.valueTextStyle}>{showValue(item)}</CText>
                        <CText style={styles.titleStyle}>{item?.Title}</CText>
                    </View>
                )}
                {index === data.length && (
                    <TouchableOpacity
                        style={styles.pickListContainer}
                        onPress={() => {
                            if (!disabled) {
                                onLastItemClick()
                                cRef.current?.showPickList(false)
                            }
                        }}
                    >
                        {disabled && (
                            <>
                                <View>
                                    <View style={commonStyle.flexRowAlignCenter}>
                                        <View style={styles.addContainer}>
                                            <View style={styles.addIconStyle1} />
                                            <View style={styles.addIconStyle2} />
                                        </View>
                                        <CText style={styles.addContactText}>
                                            {t.labels.PBNA_MOBILE_ADD_NEW_CONTACT.toUpperCase()}
                                        </CText>
                                    </View>
                                </View>
                            </>
                        )}
                        {!disabled && lastListItem}
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        )
    }

    return (
        <SearchablePicklist
            label={label}
            data={data.concat('')}
            placeholder={t.labels.PBNA_MOBILE_SELECT}
            renderItem={renderItem}
            defValue={defValue}
            onApply={onApply}
            cRef={cRef}
            onClear={onClear}
        />
    )
}

export default CreatablePickList
