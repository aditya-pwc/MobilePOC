/**
 * @description The tile to show customer price group tile .
 * @author Kiren Cao
 * @date 2023-11-29
 */
import React from 'react'
import { Animated, FlatList, StyleSheet, View } from 'react-native'
import CText from '../../../../common/components/CText'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { priceGroupStatusMapping } from '../../../utils/CustomerUtils'
import _ from 'lodash'
import { Persona } from '../../../../common/enums/Persona'
import { CommonParam } from '../../../../common/CommonParam'
import { priceCellStatus } from '../lead/overview-tab/PepsiCoDataEdit'
import { deleteCustomerDeal } from '../../../hooks/LeadHooks'

const styles = StyleSheet.create({
    marginBottom: {
        marginBottom: 10
    },
    priceStyle: {
        flex: 1,
        paddingBottom: 30,
        backgroundColor: 'white',
        marginHorizontal: 22
    },
    priceName: {
        marginTop: 16,
        marginBottom: 18,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    addPriceName: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    priceCellStyle: {
        flex: 1,
        marginHorizontal: 22
    },
    priceBorder: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    distributionSize: {
        height: 16,
        width: 16,
        marginRight: 10
    },
    leftBox: {
        width: 16,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 6,
        position: 'absolute'
    },
    rightBox: {
        width: 3,
        height: 16,
        backgroundColor: '#00A2D9',
        left: 6.5,
        top: 0,
        position: 'absolute'
    },
    priceGroupCTAText: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    removeText: {
        color: '#EB445A',
        fontWeight: '700',
        fontSize: 12
    },
    addedPriceCell: {
        flex: 1,
        paddingHorizontal: 22,
        backgroundColor: '#f2f4f7'
    },
    marginTop_10: {
        marginTop: 10
    },
    marginTop_20: {
        marginTop: 20
    },
    datePickerCont: {
        backgroundColor: 'rgba(0, 0,0, 0.2)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    calendarModalView: {
        borderRadius: 8,
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 350,
        width: '90%'
    },
    datePicker: {
        margin: 20
    },
    calendar: {
        height: 18,
        width: 20,
        marginRight: 12
    },
    marginBottom_20: {
        marginBottom: 20
    },
    addPriceBorder: {
        borderTopColor: '#FFFFFF',
        borderTopWidth: 1
    },
    addPriceCont: {
        flex: 1,
        backgroundColor: 'white'
    },
    effectiveDateStyle: {
        color: '#565656',
        fontSize: 12
    },
    dateStyle: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '700'
    },
    pillBackground: {
        paddingHorizontal: 10,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
        backgroundColor: '#FFC337'
    },
    statusStyle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000'
    },
    submittedTileColor: {
        color: '#000000'
    },
    declinedTileColor: {
        color: '#FFFFFF'
    },
    submittedPillColor: {
        backgroundColor: '#FFC337'
    },
    declinedPillColor: {
        backgroundColor: '#EB445A'
    },
    container: {
        width: '100%',
        backgroundColor: 'white',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%'
    },
    bottomBorderStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    containerStyle: {
        flex: 1,
        width: '100%'
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 10
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    width90: {
        width: 90
    },
    swipeRow: {
        width: '66%',
        height: 100,
        marginTop: 20
    },
    contactName: {
        fontWeight: '900',
        fontSize: 18
    },
    contactTitle: {
        marginTop: 5,
        color: 'gray'
    },
    width33: {
        width: '33%'
    },
    borderStyle: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginHorizontal: 22
    }
})

const PRICING_LEVEL_TYPE_CODE_BU = 'BU'
const PRICING_LEVEL_TYPE_CODE_PZ = 'PZ'

interface ContactProps {
    priceGroupList: Array<any>
    setShowExpirationDateModal: any
    setExpirationPriceGroup: any
    addedPriceGroupList: Array<any>
    setRefreshFlag: any
}

const CustomerPriceGroupTile = (props: ContactProps) => {
    const { priceGroupList, setShowExpirationDateModal, setExpirationPriceGroup, addedPriceGroupList, setRefreshFlag } =
        props

    const checkEnable = (item: any) => {
        const targetIdsA = _.map(priceGroupList, 'Target_Id__c')
        const targetIdsB = _.map(addedPriceGroupList, 'Target_Id__c')
        const uniqueTargetIds = _.difference(targetIdsA, targetIdsB)

        if (
            item?.Pricing_Level_Type_Code__c?.toUpperCase() === PRICING_LEVEL_TYPE_CODE_BU ||
            item?.Pricing_Level_Type_Code__c?.toUpperCase() === PRICING_LEVEL_TYPE_CODE_PZ
        ) {
            return false
        }
        if (item.Type__c === 'prc_grp_request') {
            return item.Status__c === priceCellStatus.PRE && CommonParam.PERSONA__c !== Persona.CRM_BUSINESS_ADMIN
        }
        return (
            !_.some(addedPriceGroupList, { Target_Id__c: item.Target_Id__c }) &&
            uniqueTargetIds.length > 1 &&
            CommonParam.PERSONA__c !== Persona.CRM_BUSINESS_ADMIN
        )
    }

    const renderPriceGroupCard = (item: any) => {
        let swipeableRow: Swipeable
        const close = () => {
            swipeableRow?.close()
        }
        const renderRightAction = (
            text: string,
            color: string,
            x: number,
            progress: Animated.AnimatedInterpolation<any>
        ) => {
            const trans = progress.interpolate({
                inputRange: [0, 1],
                outputRange: [x, 0]
            })
            const pressHandler = async () => {
                close()
                if (item.Status__c === priceCellStatus.PRE) {
                    await deleteCustomerDeal([item], 'renderPriceGroupCard')
                    setRefreshFlag((v) => v + 1)
                } else {
                    setShowExpirationDateModal(true)
                    setExpirationPriceGroup(item)
                }
            }

            return (
                <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                    <View style={[styles.rightAction, { backgroundColor: color }]}>
                        <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                            <CText style={styles.actionText}>{text}</CText>
                        </RectButton>
                    </View>
                </Animated.View>
            )
        }
        const rightDelete =
            item.Status__c === priceCellStatus.PRE
                ? t.labels.PBNA_MOBILE_DELETE.toUpperCase()
                : t.labels.PBNA_MOBILE_REMOVE.toUpperCase()

        const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
            <View style={[styles.width90, commonStyle.flexDirectionRow]}>
                {renderRightAction(rightDelete, '#EB445A', 90, progress)}
            </View>
        )

        const renderDateDisplay = (item: any) => {
            if (item?.End_date__c) {
                return (
                    <CText style={styles.effectiveDateStyle}>
                        {t.labels.PBNA_MOBILE_EXPIRATION_DATE}{' '}
                        <CText style={styles.dateStyle}>
                            {item?.End_date__c ? dayjs(item?.End_date__c).format(TIME_FORMAT.MMM_DD_YYYY) : '-'}
                        </CText>
                    </CText>
                )
            }
            return (
                <CText style={styles.effectiveDateStyle}>
                    {t.labels.PBNA_MOBILE_EFFECTIVE_DATE}{' '}
                    <CText style={styles.dateStyle}>
                        {item?.Effective_date__c ? dayjs(item?.Effective_date__c).format(TIME_FORMAT.MMM_DD_YYYY) : '-'}
                    </CText>
                </CText>
            )
        }
        const renderNameDisplay = (item: any) => {
            let priceName = item?.Target_Name__c || ''
            if (item?.Pricing_Level_Type_Code__c) {
                priceName = `${item?.Pricing_Level_Type_Code__c.toUpperCase()}-${item?.Target_Name__c}`
            }
            return priceName
        }

        return (
            <Swipeable
                ref={(ref) => {
                    if (ref !== undefined) {
                        swipeableRow = ref
                    }
                }}
                friction={1}
                containerStyle={{}}
                enableTrackpadTwoFingerGesture
                rightThreshold={10}
                renderRightActions={renderRightActions}
                enabled={checkEnable(item)}
            >
                <View key={item?.Id} style={styles.priceCellStyle}>
                    <CText style={styles.priceName} numberOfLines={0}>
                        {renderNameDisplay(item)}
                    </CText>
                    {item?.Type__c === 'prc_grp_request' && (
                        <View style={[commonStyle.flexRowSpaceBet, styles.marginBottom_20]}>
                            {renderDateDisplay(item)}
                            <View
                                style={[
                                    styles.pillBackground,
                                    item?.Status__c?.toUpperCase() === 'SUBMITTED'
                                        ? styles.submittedPillColor
                                        : styles.declinedPillColor
                                ]}
                            >
                                <CText
                                    style={[
                                        styles.statusStyle,
                                        item?.Status__c?.toUpperCase() === 'SUBMITTED'
                                            ? styles.submittedTileColor
                                            : styles.declinedTileColor
                                    ]}
                                >
                                    {priceGroupStatusMapping()[item?.Status__c?.toUpperCase()]?.toUpperCase() || ''}
                                </CText>
                            </View>
                        </View>
                    )}
                </View>
            </Swipeable>
        )
    }
    const renderItem = (item: any) => {
        return renderPriceGroupCard(item?.item)
    }
    const renderBorderLine = () => {
        return <View style={styles.borderStyle} />
    }

    return (
        <FlatList
            data={_.concat(priceGroupList, addedPriceGroupList)}
            renderItem={renderItem}
            ItemSeparatorComponent={renderBorderLine}
        />
    )
}

export default CustomerPriceGroupTile
