/**
 * @description Visit or store list component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-03
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import VisitAddedButton from './VisitAddedButton'
import { NavigationProp } from '@react-navigation/native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { renderStoreIcon } from './CustomerCard'

export const goToCustomerDetail = (navigation: NavigationProp<any>, accountId: string) => {
    navigation.navigate('CustomerDetailScreen', {
        customer: {
            AccountId: accountId
        },
        barInitialPosition: { x: 300, y: 0 },
        tab: 'PROFILE',
        readonly: true
    })
}

const styles = StyleSheet.create({
    ...commonStyle,
    boxWithShadow: {
        marginRight: 22,
        marginLeft: 22,
        shadowColor: '#004C97',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.17,
        elevation: 5,
        shadowRadius: 10,
        borderRadius: 6,
        marginBottom: 17,
        backgroundColor: '#FFF'
    },
    boxContent: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 20,
        paddingTop: 26,
        paddingBottom: 26,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        flexGrow: 1
    },
    box: {
        overflow: 'hidden',
        borderRadius: 6
    },
    contentText: {
        flexShrink: 1,
        flexDirection: 'column'
    },
    itemTile: {
        fontWeight: '900',
        fontSize: 18,
        color: '#000',
        alignSelf: 'flex-start'
    },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        alignSelf: 'flex-start'
    },
    borderBottom: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6
    },
    location: {
        shadowColor: 'rgba(108, 12, 195, 0.8)',
        borderColor: 'rgba(108, 12, 195, 0.8)',
        borderWidth: 0,
        borderTopWidth: 0,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5
    },
    imageGroup: {
        marginRight: 15,
        position: 'relative'
    },
    status: {
        position: 'absolute',
        bottom: 0,
        height: 22,
        width: 22,
        right: 0
    },
    complete: {
        backgroundColor: 'rgb(242, 244, 247)'
    }
})

interface VisitCardProps {
    navigation?: NavigationProp<any>
    item?: any
    isVisitList?: boolean
    addVisits?: any
    onlyShowOrder?: boolean
    managerDetail?: boolean
    onPress?: Function
    isOnline: boolean | null
}

const VisitCard = (props: VisitCardProps) => {
    const { item, isVisitList, addVisits, onPress, isOnline } = props
    const handlePress = () => {
        onPress && onPress()
    }

    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    handlePress()
                }}
            >
                <View style={[styles.boxWithShadow, item.inLocation && isVisitList && styles.location]}>
                    <View style={styles.box}>
                        <View style={[styles.boxContent, isVisitList && item.status === 'Complete' && styles.complete]}>
                            <View style={[styles.imageGroup]}>{renderStoreIcon(item, styles.iconXXL, true)}</View>
                            <View style={[styles.flex_1, styles.flexDirectionColumn]}>
                                <View style={styles.rowWithCenter}>
                                    <View style={styles.contentText}>
                                        <CText numberOfLines={3} ellipsizeMode="tail" style={styles.itemTile}>
                                            {item.Name}
                                        </CText>
                                        <CText numberOfLines={1} ellipsizeMode="tail" style={styles.font_12_700}>
                                            {t.labels.PBNA_MOBILE_NUMBER_SIGN + item.CustomerId}
                                        </CText>
                                    </View>
                                </View>
                                <View style={[styles.rowWithCenter, styles.marginTop_5]}>
                                    <View style={styles.contentText}>
                                        <CText numberOfLines={1} ellipsizeMode="tail" style={[styles.itemSubTile]}>
                                            {item.Street ? item.Street + ',' : ''}
                                        </CText>
                                        <CText style={[styles.itemSubTile]}>
                                            {`${item.City ? item.City + ',' : ''} ${item.StateCode || ''} ${
                                                item.PostalCode || ''
                                            }`}
                                        </CText>
                                    </View>
                                </View>
                            </View>
                            <VisitAddedButton
                                isVisitList={isVisitList || false}
                                addVisits={addVisits}
                                item={item}
                                isOnline={isOnline}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default VisitCard
