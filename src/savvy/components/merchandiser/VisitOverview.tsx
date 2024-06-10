/*
 * @Description:VisitOverview
 * @Author: Christopher ZANG
 * @Date: 2021-08-11 02:20:25
 * @LastEditTime: 2023-07-19 15:04:11
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

import React, { useState } from 'react'
import { Dimensions, View, Image, StyleSheet } from 'react-native'
import 'moment-timezone'
import CText from '../../../common/components/CText'
import { visitStyle } from './VisitStyle'
import { t } from '../../../common/i18n/t'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CommonTooltip from '../common/CommonTooltip'
import InfoSvg from '../../../../assets/image/icon-info-blue.svg'
import { baseStyle } from '../../../common/styles/BaseStyle'
import StoreMapstedView from '../rep/customer/store-tab/StoreMapstedView'
import { CommonParam } from '../../../common/CommonParam'
import { FeatureToggle } from '../../../common/enums/FeatureToggleName'

const styles = StyleSheet.create({
    additionalFieldsWrapper: {
        marginBottom: 10
    },
    fieldTitle: {
        marginTop: 40,
        marginBottom: 6,
        fontSize: 12,
        color: '#565656'
    },
    fieldValue: {
        fontSize: 14,
        color: '#000'
    },
    subtypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    subtypeTitle: {
        marginTop: 30,
        marginBottom: 2
    },
    subtypeView: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        marginRight: 10,
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'row'
    },
    subtypeText: {
        fontSize: 12,
        lineHeight: 16,
        color: '#000'
    },
    halfWrapper: {
        width: '45%'
    },
    tipText: {
        lineHeight: 21,
        fontSize: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoSvg: { width: 18, height: 18, marginLeft: 10 },
    tooltipStyle: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mapstedContainer: {
        width: Dimensions.get('window').width - 40,
        height: Dimensions.get('window').width - 40,
        marginBottom: 20
    },
    mapsted: {
        width: '100%',
        height: '100%'
    },
    mapstedButton: {
        width: 40,
        height: 40,
        top: 20,
        right: 20,
        position: 'absolute'
    },
    title: {
        fontWeight: baseStyle.fontWeight.fw_bold,
        marginBottom: 20
    }
})

const VisitOverview = (props: any) => {
    const {
        visit,
        visitSta,
        handleWorkOrderUpdate,
        navigation,
        route,
        serviceTime,
        retailStoreId,
        storePropertyId,
        isMapstedInitial,
        setIsMapstedInitial
    } = props
    const [visitSubtypes, setVisitSubtypes] = useState([])
    const [takeOrder, setTakeOrder] = useState('')
    const [pullPosition, setPullPosition] = useState(0)
    const [showPP, setShowPP] = useState(false)
    const [specialInstructions, setSpecialInstructions] = useState('')
    const [isResetVisit, setIsResetVisit] = useState<boolean>(false)
    const [pogLoading, setPogLoading] = useState<boolean>(false)
    const [unloadMap, setUnloadMap] = useState(false)
    const [propertyId, setPropertyId] = useState(storePropertyId)
    const [showMap, setShowMap] = useState(true)
    const isMapstedToggleOn = !!CommonParam.FeatureToggle[FeatureToggle.MAPSTED_PILOT]

    // useEffect(() => {
    //     const subtypes = visit.Visit_Subtype__c
    //     const takeOrderFlag = visit.Take_Order_Flag__c
    //     const pullNumberC = visit.Pull_Number__c

    //     if (subtypes?.length > 0) {
    //         const subtypeArr = subtypes.split(';')

    //         const subTypeWithDesc: any = []
    //         subtypeArr.forEach((subtype: any) => {
    //             const subtypeObj: any = {}
    //             getVisitSubtypes().forEach((subtypeDesc: any) => {
    //                 if (subtypeDesc.id === subtype) {
    //                     subtypeObj.id = subtypeDesc.name
    //                     subtypeObj.desc = subtypeDesc.desc || ''
    //                 }
    //             })
    //             subTypeWithDesc.push(subtypeObj)
    //         })
    //         setIsResetVisit(subtypes === 'Resets')
    //         setVisitSubtypes(subTypeWithDesc)
    //     } else {
    //         setVisitSubtypes([])
    //     }

    //     setTakeOrder(takeOrderFlag === '1' || takeOrderFlag === 1 ? t.labels.PBNA_MOBILE_YES : t.labels.PBNA_MOBILE_NO)
    //     setPullPosition(pullNumberC)
    //     setShowPP(!!pullNumberC)
    //     setSpecialInstructions(visit.InstructionDescription)
    //     setPropertyId(props.storePropertyId)
    // }, [props])

    // useEffect(() => {
    //     const mapstedListener = NativeAppEventEmitter.addListener(EventEmitterType.REFRESH_MAPSTED, async () => {
    //         setUnloadMap(false)
    //         setShowMap(true)
    //     })
    //     return () => {
    //         mapstedListener && mapstedListener.remove()
    //     }
    // }, [])

    const onInitialCallback = () => {
        // Do stuff with event.region.latitude, etc.
        if (!isMapstedInitial) {
            setIsMapstedInitial(true)
        }
    }

    const toolTip = (subtypeDesc: any) => {
        return (
            <View style={styles.tooltipStyle}>
                <CText numberOfLines={4} style={styles.tipText}>
                    {subtypeDesc}
                </CText>
            </View>
        )
    }

    const renderMapsted = () => {
        return (
            <View style={styles.mapstedContainer}>
                <StoreMapstedView
                    style={styles.mapsted}
                    storeId={retailStoreId}
                    propertyId={propertyId}
                    unloadMap={unloadMap}
                    navigation={navigation}
                    onMapInitialCallback={onInitialCallback}
                    setShowMap={setShowMap}
                />
            </View>
        )
    }

    const renderAdditionalFields = () => {
        return (
            <View style={styles.additionalFieldsWrapper}>
                <CText style={[styles.fieldTitle, styles.subtypeTitle]}>{t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                <View style={styles.subtypeContainer}>
                    {/* {visitSubtypes.map((subtype: any, index) => {
                        return ( */}
                    <View style={styles.subtypeView} >
                        {/* <CText style={styles.subtypeText}>{subtype.id}</CText> */}
                        <CText style={styles.subtypeText}>1</CText>
                        {/* {subtype.desc && (
                            <CommonTooltip tooltip={toolTip(subtype.desc)} width={300} height={105}>
                                <InfoSvg style={styles.infoSvg} />
                            </CommonTooltip>
                        )} */}
                    </View>
                    {/* )
                    })} */}
                </View>
                {!isResetVisit && (
                    <View style={commonStyle.flexRowSpaceBet}>
                        <View style={styles.halfWrapper}>
                            <CText style={styles.fieldTitle}>{t.labels.PBNA_MOBILE_TAKE_ORDER}</CText>
                            <CText style={styles.fieldValue}>{takeOrder}</CText>
                        </View>
                        {showPP && (
                            <View style={styles.halfWrapper}>
                                <CText style={styles.fieldTitle}>{t.labels.PBNA_MOBILE_PULL_POSITION}</CText>
                                <CText style={styles.fieldValue}>P{pullPosition}</CText>
                            </View>
                        )}
                    </View>
                )}
                {specialInstructions?.length > 0 && (
                    <View>
                        <CText style={styles.fieldTitle}>{t.labels.PBNA_MOBILE_SPECIAL_INSTRUCTIONS}</CText>
                        <CText style={styles.fieldValue}>{specialInstructions}</CText>
                    </View>
                )}
            </View>
        )
    }
    return (
        <View style={[{ flex: 1 }, visitStyle.content]}>
            <View style={[visitStyle.rowWithCenter, visitStyle.marginTop]}>
                <View style={visitStyle.column}>
                    <CText style={visitStyle.title}>{t.labels.PBNA_MOBILE_ESTIMATED_DURATION}</CText>
                    <CText style={visitStyle.duration}>
                        {Math.floor((visit.plannedDuration || 0) / 60)} {t.labels.PBNA_MOBILE_HR}{' '}
                        {Math.floor((visit.plannedDuration || 0) % 60)} {t.labels.PBNA_MOBILE_MIN}
                    </CText>
                </View>
                <View
                    style={[
                        visitStyle.column,
                        visitStyle.clock,
                        visitSta === t.labels.PBNA_MOBILE_IN_PROGRESS && visitStyle.inprogress
                    ]}
                >
                    <Image style={visitStyle.clockImg} source={require('../../../../assets/image/ios-clock.png')} />
                    <View style={[visitStyle.clockContent]}>
                        <CText
                            style={[
                                visitStyle.lightGrey,
                                visitSta === t.labels.PBNA_MOBILE_IN_PROGRESS && visitStyle.colorBlack
                            ]}
                        >
                            {serviceTime}
                        </CText>
                        <CText>{visitSta}</CText>
                    </View>
                </View>
            </View>
            {renderAdditionalFields()}
            {/* {useMemo(() => {
                return (
                    <SwipDeliveryCard
                        visit={visit}
                        navigation={navigation}
                        showDeliveryRoute // Enabled in Merch Visit Detail
                    />
                )
            }, [visit])} */}
            <CText style={styles.title}>{t.labels.PBNA_MOBILE_STORE_MAP.toUpperCase()}</CText>
            {/* {propertyId !== 0 && showMap && isMapstedToggleOn && renderMapsted()} */}
            {/* <InStoreMap visit={visit} />
            {!isResetVisit && (
                <View style={[visitStyle.fullWidth, { marginTop: 0 }]}>
                    <WorkOrderList
                        visit={visit}
                        visitStatus={visitSta}
                        workOrderUpdate={handleWorkOrderUpdate}
                        navigation={navigation}
                        route={route}
                    />
                </View>
            )}
            <TouchableOpacity
                disabled={pogLoading}
                onPress={async () => await openFile(setPogLoading, isResetVisit, navigation, null, visit)}
            >
                <View style={[visitStyle.pdf]}>
                    <Image style={visitStyle.icon} source={require('../../../../assets/image/ios-doc.png')} />
                    <CText style={[visitStyle.pdfTitle]}>
                        {isResetVisit ? t.labels.PBNA_MOBILE_VIEW_CUSTOMER_CDA_PLANOGRAM : t.labels.PBNA_MOBILE_PRE_REF}
                    </CText>
                </View>
            </TouchableOpacity> */}
            {/* <Loading isLoading={!isMapstedInitial && propertyId !== 0 && showMap && isMapstedToggleOn} /> */}
        </View>
    )
}

export default VisitOverview
