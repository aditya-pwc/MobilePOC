/**
 * @description Component to show Customer Detail Carousel Page for PSR ATC.
 * @author Tong Jiang
 * @date 2022-08-08
 * @Lase
 */

import React, { useState, useEffect, useRef } from 'react'
import { Image, StyleSheet, TouchableOpacity, View, Animated, TextInput, Alert, Dimensions } from 'react-native'
import CText from '../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import moment from 'moment'
import Modal from 'react-native-modal'
import _ from 'lodash'
import { SafeAreaView } from 'react-native-safe-area-context'
import { t } from '../../../../common/i18n/t'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useGTINsMap } from '../../../hooks/InnovationProductHooks'
import { renderOrderDays } from '../../../components/rep/customer/CustomerListTile'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loading from '../../../../common/components/Loading'
import { compositeCommonCall } from '../../../api/SyncUtils'
import { CommonParam } from '../../../../common/CommonParam'
import { DatePickerLocale } from '../../../enums/i18n'
import {
    assembleATCReq,
    assembleCacheForLaterReq,
    cacheForLaterATCDataHandler,
    timeoutWrap,
    calculateNextOrderDay
} from '../../../helper/rep/InnovationProductHelper'
import { CommonSyncRes } from '../../../../common/interface/SyncInterface'
import InnovationProductHeader from '../../../components/rep/customer/innovation-tab/InnovationProductHeader'
import StatusCode from '../../../enums/StatusCode'
import { OrderATCType } from '../../../enums/ATCRecordTypes'
import IconAlertSolid from '../../../../../assets/image/icon-alert-solid.svg'
import { CommonLabel } from '../../../enums/CommonLabel'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { Log } from '../../../../common/enums/Log'
import { isPersonaPSR } from '../../../../common/enums/Persona'
import { storeClassLog } from '../../../../common/utils/LogUtils'

interface CustomerCarouselDetailProps {
    navigation: any
    route: any
}

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flex: 1
    },
    bodyContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f2f4f7'
    },
    imageSectionContainer: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    prodImageSize: {
        marginTop: 80,
        width: '100%',
        height: 225
    },
    cartImgSize: {
        width: '100%',
        height: '100%'
    },
    generalText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#6C0CC3',
        fontSize: 12,
        textAlign: 'center'
    },
    buttonTextGrey: {
        fontWeight: 'bold',
        color: '#D3D3D3',
        fontSize: 12,
        textAlign: 'center'
    },
    solidButton: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    bottomBarContainer: {
        width: '100%',
        height: 60,
        position: 'relative',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        display: 'flex'
    },
    boxShadow: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
    },
    buttonContainer: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        height: '100%'
    },
    buttonTextContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    solidButtonContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D3D3D3'
    },
    solidButtonContainerActive: {
        backgroundColor: '#6C0CC3'
    },
    borderRight: {
        borderRightColor: '#D3D3D3',
        borderRightWidth: 1
    },
    cartSectionContainer: {
        width: '100%',
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 60
    },
    cartSectionTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14
    },
    cartItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginTop: 16,
        borderRadius: 6,
        paddingTop: 10,
        paddingHorizontal: 15
    },
    cartSectionTitleContainer: {
        marginBottom: 9
    },
    cartItemContainer: {
        flexGrow: 1,
        height: 160,
        marginTop: 25
    },
    centeredVertivcalContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    animatedContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        marginTop: 15
    },
    textInput: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        paddingTop: 5,
        paddingBottom: 17,
        paddingHorizontal: 5,
        fontSize: 16,
        fontFamily: 'Gotham',
        color: '#000',
        fontWeight: '700',
        lineHeight: 18,
        textAlign: 'center'
    },
    cartItemWrap: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%',
        marginBottom: 25
    },
    cartItemSubTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 5,
        marginBottom: 10
    },
    cartItemLaunchDateWrap: {
        flexDirection: 'row'
    },
    cartItemLaunchDateLabel: {
        fontSize: 12,
        color: '#565656'
    },
    cartItemLaunchDateValue: {
        fontSize: 12
    },
    datePickModalContentWrap: {
        justifyContent: 'center',
        background: 'white',
        alignItems: 'center'
    },
    datePickModalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        flexDirection: 'column',
        padding: 10
    },
    dateLegend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        left: 10,
        width: '100%'
    },
    dateLegendItem: {
        flexDirection: 'row'
    },
    dateInputDisplayWrap: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    dateInputDisplayLabel: {
        fontSize: 12,
        marginBottom: 10,
        color: '#565656'
    },
    dateInputDisplayValueWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    dateInputDisplayValue: {
        fontSize: 14
    },
    dateInputDisplayIcon: {
        height: 20,
        width: 20,
        resizeMode: 'stretch'
    },
    boxWrap: {
        width: '100%',
        paddingBottom: 10
    },
    boxLeft: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    boxLeftImage: {
        width: 60,
        height: 60,
        marginRight: 15
    },
    boxLeftText: {
        flex: 1
    },
    boxLeftTitle: {
        fontSize: 14,
        color: '#000',
        fontWeight: '700',
        lineHeight: 20
    },
    boxLeftDesc: {
        fontSize: 12,
        color: '#565656',
        lineHeight: 20
    },
    boxQuantity: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    quantityBtnTouch: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityBtnWrap: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    minusBtn: {
        backgroundColor: '#00A2D9',
        width: 13.72,
        height: 2
    },
    quantityInputWrap: {
        width: 49,
        height: 40,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 5
    },
    quantityUnit: {
        position: 'relative',
        marginBottom: 5
    },
    quantityUnitText: {
        fontSize: 12,
        color: '#565656'
    },
    quantityInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        top: 0,
        left: 0
    },
    plusBtn1: {
        position: 'absolute',
        backgroundColor: '#00A2D9',
        width: 15.68,
        height: 2,
        top: 11,
        left: 4
    },
    plusBtn2: {
        position: 'absolute',
        backgroundColor: '#00A2D9',
        height: 16,
        width: 2,
        left: 11,
        top: 4
    },
    alertText: {
        color: '#ea455b',
        textAlign: 'left',
        fontSize: 14
    },
    alertTextContainer: {
        marginTop: -5,
        marginBottom: 2,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    mainAlertTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 5
    },
    mainAlertIcon: {
        marginRight: 7
    },
    dateLegendText: {
        fontSize: 12,
        color: '#565656'
    }
})

const updateArray = (inputData, targetIndex, targetName: string, updateValue) => {
    const outputArray = inputData.map((i) => {
        return { ...i }
    })
    outputArray[targetIndex][targetName] = updateValue
    return outputArray
}

export const judgeCompositeSuccess = (res) => {
    let result = false
    res.forEach((el) => {
        el.data.compositeResponse.forEach((e) => {
            if (e.httpStatusCode === StatusCode.SuccessOK || e.httpStatusCode === StatusCode.SuccessCreated) {
                result = true
            }
        })
    })
    return result
}

const processInitialSKUData = (inputSKUData, orderDays) => {
    const outputSKUData = inputSKUData.map((skuItem, index) => {
        skuItem.isBoxExpanded = false
        skuItem.itemQuantity = 0
        skuItem.boxAnim = useRef(new Animated.Value(0)).current
        skuItem.opacityAnim = useRef(new Animated.Value(0)).current
        skuItem.alertBoxAnim = useRef(new Animated.Value(0)).current
        skuItem.alertOpacityAnim = useRef(new Animated.Value(0)).current
        skuItem.startDate = calculateNextOrderDay(orderDays, false)
        skuItem.endDate = calculateNextOrderDay(orderDays, true)
        skuItem.defaultStartDate = skuItem.startDate
        skuItem.editable = false
        skuItem.index = index
        return skuItem
    })
    return outputSKUData
}

const CartItemImage = (props: { carouselUrl; accessToken }) => {
    const { carouselUrl, accessToken } = props
    if (carouselUrl) {
        return (
            <FastImage
                source={{
                    uri: carouselUrl,
                    headers: {
                        Authorization: accessToken,
                        accept: 'image/png'
                    },
                    cache: FastImage.cacheControl.web
                }}
                resizeMode={'contain'}
                style={styles.prodImageSize}
            />
        )
    }
    return (
        <Image
            style={[styles.prodImageSize, { resizeMode: 'contain' }]}
            source={require('../../../../../assets/image/No_Innovation_Product.png')}
        />
    )
}

const DateTimePickerModal = (props: {
    retailStore
    calendarVisible
    setCalendarVisible
    boxesData
    selectedCalenDarIndex
    setBoxesData
}) => {
    const { retailStore, calendarVisible, setCalendarVisible, boxesData, selectedCalenDarIndex, setBoxesData } = props
    const { width } = Dimensions.get('window')
    return (
        <Modal
            isVisible={calendarVisible}
            onBackdropPress={() => setCalendarVisible(false)}
            coverScreen
            backdropOpacity={0.2}
            animationIn="fadeIn"
            animationOut="fadeOut"
            animationOutTiming={50}
        >
            <View style={styles.datePickModalContentWrap}>
                <View style={styles.datePickModalContent}>
                    <DateTimePicker
                        textColor={'red'}
                        mode={'date'}
                        themeVariant={CommonLabel.LIGHT}
                        display={'inline'}
                        style={{ height: width * 0.85 }}
                        minimumDate={moment().add(1, 'd').toDate()}
                        value={boxesData[selectedCalenDarIndex].startDate}
                        onChange={(e, date) => {
                            setCalendarVisible(false)
                            // the data setting is delayed to cover the modal out animation time
                            // otherwise open another modal will fail
                            setTimeout(() => {
                                setBoxesData([...updateArray(boxesData, selectedCalenDarIndex, 'startDate', date)])
                            }, 100)
                        }}
                        locale={DatePickerLocale[CommonParam.locale]}
                    />
                    <View style={styles.dateLegend}>
                        <View style={styles.dateLegendItem}>
                            <CText style={styles.dateLegendText}>{t.labels.PBNA_MOBILE_CL_ORDER}</CText>
                            {renderOrderDays(retailStore['Account.Merchandising_Order_Days__c'])}
                        </View>
                        <View style={styles.dateLegendItem}>
                            <CText style={styles.dateLegendText}>{t.labels.PBNA_MOBILE_CL_DELIVERY}</CText>
                            {renderOrderDays(retailStore['Account.Merchandising_Delivery_Days__c'])}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const CartItemTitle = (props: { mainSP }) => {
    const { mainSP } = props
    return (
        <View style={styles.cartItemWrap}>
            <CText style={styles.generalText}>
                {mainSP['Product.Formatted_Brand__c'] || mainSP['Product.Brand_Name__c']}
            </CText>
            <CText style={styles.cartItemSubTitle}>
                {mainSP['Product.Formatted_Sub_Brand_Name__c'] || mainSP['Product.Sub_Brand__c']}
            </CText>
            <View style={styles.cartItemLaunchDateWrap}>
                <CText style={styles.cartItemLaunchDateLabel}> {t.labels.PBNA_MOBILE_SORT_NAT_LAUNCH_DATE}: </CText>
                <CText style={styles.cartItemLaunchDateValue}>
                    {moment(mainSP['Product.National_Launch_Date__c']).format('MMM DD, YYYY')}
                </CText>
            </View>
        </View>
    )
}

const DatePicker = (props: { isClickable: boolean; skuItem; index; setCalendarVisible; setSelectedCalenDarIndex }) => {
    const { isClickable, skuItem, index, setCalendarVisible, setSelectedCalenDarIndex } = props
    const title = isClickable ? t.labels.PBNA_MOBILE_START_DATE : t.labels.PBNA_MOBILE_END_DATE

    return (
        <TouchableOpacity
            onPress={() => {
                if (!isClickable) {
                    return
                }
                setCalendarVisible(true)
                setSelectedCalenDarIndex(index)
            }}
            style={{ width: isClickable ? '53%' : '47%', paddingBottom: 15 }}
        >
            <View style={[styles.dateInputDisplayWrap, { paddingRight: isClickable ? '12%' : 0 }]}>
                <CText style={styles.dateInputDisplayLabel}>{title}</CText>
                <View
                    style={[
                        styles.dateInputDisplayValueWrap,
                        skuItem.alert && isClickable ? { borderBottomColor: '#ea455b' } : {}
                    ]}
                >
                    <CText style={[styles.dateInputDisplayValue, { color: isClickable ? '#000000' : '#D3D3D3' }]}>
                        {moment(isClickable ? skuItem.startDate : skuItem.endDate).format('MMM DD, YYYY')}
                    </CText>
                    <Image
                        style={[styles.dateInputDisplayIcon, { tintColor: isClickable ? '#00A2D9' : '#D3D3D3' }]}
                        source={ImageSrc.IMG_CALENDAR}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const AnimatedBox = (props: {
    accessToken
    boxSKUData
    index
    GTINsMap
    setBoxesData
    boxesData
    setCalendarVisible
    setSelectedCalenDarIndex
}) => {
    const {
        accessToken,
        boxSKUData,
        index,
        GTINsMap,
        setBoxesData,
        boxesData,
        setCalendarVisible,
        setSelectedCalenDarIndex
    } = props
    const datePickerHandlers = {
        setCalendarVisible,
        setSelectedCalenDarIndex
    }
    const inputRef = useRef(null)

    return (
        <TouchableOpacity
            onPress={() => {
                if (boxSKUData.alert) {
                    return
                }
                setBoxesData([...updateArray(boxesData, index, 'isBoxExpanded', !boxSKUData.isBoxExpanded)])
            }}
            activeOpacity={1}
        >
            <Animated.View style={[styles.cartItem]}>
                <View style={[styles.centeredVertivcalContainer, styles.boxWrap]}>
                    <View style={styles.boxLeft}>
                        <View style={styles.boxLeftImage}>
                            {GTINsMap[boxSKUData['Product.GTIN__c']] ? (
                                <FastImage
                                    source={{
                                        uri: GTINsMap[boxSKUData['Product.GTIN__c']],
                                        headers: {
                                            Authorization: accessToken,
                                            accept: 'image/png'
                                        },
                                        cache: FastImage.cacheControl.web
                                    }}
                                    resizeMode={'contain'}
                                    style={styles.cartImgSize}
                                />
                            ) : (
                                <Image
                                    style={[styles.cartImgSize, { resizeMode: 'contain' }]}
                                    source={require('../../../../../assets/image/No_Innovation_Product.png')}
                                />
                            )}
                        </View>
                        <View style={styles.boxLeftText}>
                            <CText style={styles.boxLeftTitle}>
                                {boxSKUData['Product.Formatted_Flavor__c'] || boxSKUData['Product.Sub_Brand__c']}
                            </CText>
                            <CText style={styles.boxLeftDesc} numberOfLines={2}>
                                {boxSKUData['Product.Formatted_Package__c'] ||
                                    boxSKUData['Product.Package_Type_Name__c']}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.boxQuantity}>
                        <TouchableOpacity
                            style={styles.quantityBtnTouch}
                            onPress={() => {
                                if (boxSKUData.itemQuantity > 0) {
                                    setBoxesData([
                                        ...updateArray(boxesData, index, 'itemQuantity', boxSKUData.itemQuantity - 1)
                                    ])
                                }
                            }}
                        >
                            <View style={styles.quantityBtnWrap}>
                                <View style={styles.minusBtn} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.quantityInputWrap}>
                            <View style={styles.quantityUnit}>
                                <CText style={styles.quantityUnitText}>{'Qty'}</CText>
                            </View>
                            <View style={styles.quantityInput}>
                                <TextInput
                                    ref={inputRef}
                                    onPressIn={() => {
                                        setBoxesData(
                                            boxesData.map((el, idx) => {
                                                const patch =
                                                    idx === index
                                                        ? {
                                                              editable: true,
                                                              // should rewrite to '' when 0 or '0'
                                                              // eslint-disable-next-line eqeqeq
                                                              itemQuantity:
                                                                  el.itemQuantity === '0' ? '' : el.itemQuantity
                                                          }
                                                        : {}
                                                return {
                                                    ...el,
                                                    ...patch
                                                }
                                            })
                                        )
                                        setTimeout(() => {
                                            inputRef?.current?.focus()
                                        }, 0)
                                    }}
                                    onBlur={() => {
                                        setBoxesData(
                                            boxesData.map((el, idx) => {
                                                const patch =
                                                    idx === index
                                                        ? {
                                                              editable: false,
                                                              itemQuantity: el.itemQuantity || 0
                                                          }
                                                        : {}
                                                return {
                                                    ...el,
                                                    ...patch
                                                }
                                            })
                                        )
                                    }}
                                    keyboardType={'numeric'}
                                    maxLength={3}
                                    placeholderTextColor={'#000'}
                                    editable={boxSKUData.editable}
                                    onChangeText={(text = '') => {
                                        const numInput = parseInt(text.replace('.', '')) || ''
                                        setBoxesData([...updateArray(boxesData, index, 'itemQuantity', numInput)])
                                    }}
                                    value={boxSKUData.itemQuantity + ''}
                                    onEndEditing={(e) => {
                                        const inputNum = parseInt((e.nativeEvent.text || '').replace('.', ''))
                                        if (inputNum) {
                                            setBoxesData([...updateArray(boxesData, index, 'itemQuantity', inputNum)])
                                        }
                                    }}
                                    style={styles.textInput}
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.quantityBtnTouch}
                            onPress={() => {
                                if (boxSKUData.itemQuantity < 999) {
                                    setBoxesData([
                                        ...updateArray(boxesData, index, 'itemQuantity', boxSKUData.itemQuantity + 1)
                                    ])
                                }
                            }}
                        >
                            <View style={styles.quantityBtnWrap}>
                                <View style={styles.plusBtn1} />
                                <View style={styles.plusBtn2} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <Animated.View
                    style={[styles.animatedContainer, { opacity: boxSKUData.opacityAnim, height: boxSKUData.boxAnim }]}
                >
                    <DatePicker isClickable skuItem={boxSKUData} index={index} {...datePickerHandlers} />
                    <DatePicker isClickable={false} skuItem={boxSKUData} index={index} {...datePickerHandlers} />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.alertTextContainer,
                        { opacity: boxSKUData.alertOpacityAnim, height: boxSKUData.alertBoxAnim }
                    ]}
                >
                    <CText style={styles.alertText}>{boxSKUData.alert}</CText>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    )
}

const RenderBoxes = (props: {
    accessToken
    GTINsMap
    setBoxesData
    boxesData
    inputBoxesData
    setCalendarVisible
    setSelectedCalenDarIndex
}) => {
    const {
        accessToken,
        GTINsMap,
        setBoxesData,
        boxesData,
        inputBoxesData,
        setCalendarVisible,
        setSelectedCalenDarIndex
    } = props
    return inputBoxesData?.map((item: any) => {
        const props = {
            accessToken,
            boxSKUData: item,
            GTINsMap,
            setBoxesData,
            boxesData,
            setCalendarVisible,
            setSelectedCalenDarIndex
        }
        return <AnimatedBox index={item.index} key={item.index} {...props} />
    })
}

export const SuccessModal = (props: { successModalText }) => {
    const { successModalText } = props
    const successIcon = require('../../../../../assets/image/icon-success.png')
    const styles = StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        modalView: {
            backgroundColor: 'white',
            borderRadius: 8,
            position: 'absolute',
            width: 260,
            height: 250,
            justifyContent: 'center',
            alignItems: 'center'
        },
        imgSuccess: {
            width: 60,
            height: 60,
            marginTop: 10,
            marginBottom: 25
        },
        textMsg: {
            paddingHorizontal: 20,
            lineHeight: 23,
            fontSize: 16,
            fontWeight: '900',
            color: '#000',
            textAlign: 'center'
        }
    })

    return (
        <Modal
            isVisible={!!successModalText}
            coverScreen
            backdropOpacity={0.2}
            animationIn="fadeIn"
            animationOut="fadeOut"
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image style={styles.imgSuccess} source={successIcon} />
                    {
                        <View>
                            <CText style={styles.textMsg}>{successModalText}</CText>
                        </View>
                    }
                </View>
            </View>
        </Modal>
    )
}

export const renderBottomBar = (onPress: Function, activeOpacity = false) => {
    return (
        <View style={[styles.bottomBarContainer, styles.boxShadow]}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.buttonTextContainer]}>
                    <CText style={styles.buttonTextGrey}>
                        {_.upperCase(t.labels.PBNA_MOBILE_SAVE) + ' ' + _.upperCase(t.labels.PBNA_MOBILE_ATC_FOR_LATER)}
                    </CText>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    activeOpacity={activeOpacity ? 0.2 : 1}
                    style={[styles.solidButtonContainer, activeOpacity ? styles.solidButtonContainerActive : {}]}
                    onPress={() => {
                        onPress()
                    }}
                >
                    <CText style={[styles.solidButton]}>
                        {_.upperCase(t.labels.PBNA_MOBILE_ATC_PUSH) +
                            ' ' +
                            _.upperCase(t.labels.PBNE_MOBILE_ATC_TO_SMARTR) +
                            _.toLower(t.labels.PBNA_MOBILE_ATC_R)}
                    </CText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const CustomerCarouselDetailScreen = (props: CustomerCarouselDetailProps) => {
    const { navigation, route } = props
    const { retailStore, prodLaunchTwoWks, accessToken, skuData } = route.params
    const [boxesData, setBoxesData] = useState(
        processInitialSKUData(skuData, retailStore['Account.Merchandising_Order_Days__c'])
    )
    const [calendarVisible, setCalendarVisible] = useState(false)
    const [selectedCalenDarIndex, setSelectedCalenDarIndex] = useState(0)
    const [firstTime, setFirstTime] = useState(true)
    const [startDateFirstTime, setStartDateFirstTime] = useState(true)
    const GTINsMap = useGTINsMap()
    const [isLoading, setIsLoading] = useState(false)
    const [successModalText, setSuccessModalText] = useState('')
    const [isLeavingPage, setIsLeavingPage] = useState(false)
    const { dropDownRef } = useDropDown()
    moment.tz.setDefault(CommonParam.userTimeZone)

    const expandBox = (box) => {
        Animated.timing(box.boxAnim, {
            toValue: 65,
            duration: 300,
            useNativeDriver: false
        }).start()
        Animated.timing(box.opacityAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false
        }).start()
    }

    const shrinkBox = (box) => {
        Animated.timing(box.boxAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start()
        Animated.timing(box.opacityAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false
        }).start()
    }

    const expandBoxAlert = (box) => {
        Animated.timing(box.alertBoxAnim, {
            toValue: 30,
            duration: 300,
            useNativeDriver: false
        }).start()
        Animated.timing(box.alertOpacityAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false
        }).start()
    }

    const shrinkBoxAlert = (box) => {
        Animated.timing(box.alertBoxAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start()
        Animated.timing(box.alertOpacityAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false
        }).start()
    }

    const applyToAll = (applyAmount, boxesData) => {
        setBoxesData(
            boxesData.map((i) => {
                return {
                    ...i,
                    itemQuantity: applyAmount,
                    isBoxExpanded: true,
                    editable: false
                }
            })
        )
    }

    const applyStartDateToAll = (date, boxesData) => {
        setBoxesData(
            boxesData.map((i) => {
                return {
                    ...i,
                    startDate: date,
                    isBoxExpanded: true
                }
            })
        )
    }

    const applyAmountAlert = (applyAmount, boxesData) => {
        if (isLeavingPage) {
            return
        }
        Alert.alert(
            `${t.labels.PBNA_MOBILE_ATC_QUANTITY_TO_ALL}`,
            `${t.labels.PBNA_MOBILE_ATC_QUANTITY_TO_ALL_ALERT}`,
            [
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                    onPress: () => {
                        setFirstTime(false)
                    }
                },
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_YES)}`,
                    onPress: () => {
                        setFirstTime(false)
                        applyToAll(applyAmount, boxesData)
                    }
                }
            ]
        )
    }

    const applyStartDateAlert = (date, boxesData) => {
        Alert.alert(
            `${t.labels.PBNA_MOBILE_ATC_START_DATE_TO_ALL}`,
            `${t.labels.PBNA_MOBILE_ATC_START_DATE_TO_ALL_ALERT}`,
            [
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_NO)}`,
                    onPress: () => {
                        setStartDateFirstTime(false)
                    }
                },
                {
                    text: `${_.capitalize(t.labels.PBNA_MOBILE_YES)}`,
                    onPress: () => {
                        setStartDateFirstTime(false)
                        applyStartDateToAll(date, boxesData)
                    }
                }
            ]
        )
    }

    const showNoConnectionAlert = (callback) => {
        if (isLeavingPage) {
            return
        }
        Alert.alert(t.labels.PBNA_MOBILE_ATC_UNSUCCESSFUL, t.labels.PBNA_MOBILE_ATC_NO_CONNECTION, [
            {
                text: t.labels.PBNA_MOBILE_OK,
                onPress: () => {
                    // noop
                }
            },
            {
                text: t.labels.PBNA_MOBILE_ATC_RETRY,
                onPress: () => {
                    callback()
                }
            }
        ])
    }

    const noConnectionHandler = async () => {
        try {
            const productCount = boxesData.reduce((a, b) => a + (b.itemQuantity * 1 ? 1 : 0), 0)
            const csCount = boxesData.reduce((a, b) => a + b.itemQuantity * 1, 0)
            const cacheForLaterData = assembleCacheForLaterReq('customer', boxesData, retailStore)
            await cacheForLaterATCDataHandler(cacheForLaterData, async () => {
                setSuccessModalText(
                    `${productCount} ${t.labels.PBNA_MOBILE_ATC_PRODUCT_SLASH} ${csCount} ${t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE}`
                )
                setTimeout(() => {
                    navigation.goBack()
                }, 2000)
            })
        } catch (err) {
            storeClassLog(Log.MOBILE_ERROR, 'CustomerCarouselDetailScreen', err)
            dropDownRef.current.alertWithType('error', t.labels.PBNA_MOBILE_GET_TEAM_PERFORMANCE_DETAILS, err)
        }
    }

    const dupCheckForPushToSmartRAll = async (boxesData, reCheckAllBeforeSubmit, uploadDataFuc) => {
        const dupCheckBody = []
        if (isLeavingPage) {
            return
        }
        !reCheckAllBeforeSubmit && setIsLoading(true)
        let reCheckAllBeforeSubmitRes = true
        let newBoxesData = boxesData.map((el) => {
            if (el.itemQuantity && el.startDate && !el.editable) {
                if (reCheckAllBeforeSubmit || el[`${moment(el.startDate).format('YYYY-MM-DD')}checked`] === undefined) {
                    dupCheckBody.push({
                        ProductCode: el['Product.ProductCode'],
                        EffectiveDate: moment(el.startDate).format('YYYY-MM-DD')
                    })
                    return {
                        ...el,
                        alert: ''
                    }
                }
                return {
                    ...el,
                    alert: el[`${moment(el.startDate).format('YYYY-MM-DD')}checked`]
                }
            }
            return {
                ...el,
                alert: ''
            }
        })
        if (dupCheckBody.length) {
            const productCodes = dupCheckBody.map((el) => `'${el.ProductCode}'`).join(',')
            const effectiveDates = _.uniqBy(dupCheckBody, 'EffectiveDate')
                .map((el) => el.EffectiveDate)
                .join(',')

            const query =
                `/services/data/${CommonParam.apiVersion}/query/?q=SELECT Product2.ProductCode, OrderItem.Id, Order.EffectiveDate` +
                ' FROM OrderItem' +
                ` WHERE Order.RetailStore__c = '${retailStore.Id}'` +
                ` AND Order.Order_ATC_Type__c = '${OrderATCType.PRODUCT_PUSH}'` +
                ` AND Product2.ProductCode IN (${productCodes})` +
                ` AND Order.EffectiveDate IN (${effectiveDates})`
            try {
                const allRes = await timeoutWrap(
                    (timeoutRequestKeys, requestKey) => {
                        return compositeCommonCall([
                            {
                                method: 'GET',
                                url: query,
                                referenceId: 'orderItem'
                            }
                        ]).then((allRes) => {
                            // if the request has been marked timeout, then cancel it's side effects
                            if (timeoutRequestKeys[requestKey]) {
                                allRes.data.compositeResponse[0].httpStatusCode = 400
                            }
                            return allRes
                        })
                    },
                    5000,
                    () => {
                        setIsLoading(false)
                    }
                )
                const res = allRes.data.compositeResponse[0]
                const { body, httpStatusCode } = res
                if (httpStatusCode === 200) {
                    newBoxesData = newBoxesData.map((el) => {
                        if (dupCheckBody.find((one) => one.ProductCode === el['Product.ProductCode'])) {
                            const resMatch = body.records.find((one) => {
                                return (
                                    one.Product2.ProductCode === el['Product.ProductCode'] &&
                                    one.Order.EffectiveDate === moment(el.startDate).format('YYYY-MM-DD')
                                )
                            })
                            if (resMatch) {
                                return {
                                    ...el,
                                    [`${moment(el.startDate).format('YYYY-MM-DD')}checked`]:
                                        t.labels.PBNA_MOBILE_ATC_EXISTING_ALERT,
                                    alert: t.labels.PBNA_MOBILE_ATC_EXISTING_ALERT
                                }
                            }
                            return {
                                ...el,
                                [`${moment(el.startDate).format('YYYY-MM-DD')}checked`]: ''
                            }
                        }
                        return el
                    })
                }
                setBoxesData(newBoxesData)
                if (newBoxesData.find((one) => one.alert)) {
                    reCheckAllBeforeSubmitRes = false
                }
            } catch (e) {
                if (reCheckAllBeforeSubmit && e.message !== 'timeout') {
                    throw e
                }
                if (!isPersonaPSR()) {
                    setIsLoading(false)
                    const callback = reCheckAllBeforeSubmit
                        ? uploadDataFuc
                        : dupCheckForPushToSmartRAll.bind(null, boxesData, reCheckAllBeforeSubmit)
                    showNoConnectionAlert(callback)
                }
            }
        } else {
            setBoxesData(newBoxesData)
        }
        // apply to all logic
        const itemQuantityValidOne = newBoxesData.find((one) => one.itemQuantity && !one.editable)
        if (itemQuantityValidOne && firstTime && newBoxesData.length > 1) {
            setFirstTime(false)
            applyAmountAlert(itemQuantityValidOne.itemQuantity, newBoxesData)
        }
        const dateValidOne = newBoxesData.find((one) => {
            return moment(one.startDate).format('YYYY-MM-DD') !== moment(one.defaultStartDate).format('YYYY-MM-DD')
        })
        if (dateValidOne && startDateFirstTime && newBoxesData.length > 1) {
            setStartDateFirstTime(false)
            applyStartDateAlert(dateValidOne.startDate, newBoxesData)
        }
        !reCheckAllBeforeSubmitRes && setIsLoading(false)
        !reCheckAllBeforeSubmit && setIsLoading(false)
        return reCheckAllBeforeSubmitRes
    }

    useEffect(() => {
        boxesData.forEach((boxData) => {
            if (boxData.isBoxExpanded || boxData.alert) {
                expandBox(boxData)
            } else {
                shrinkBox(boxData)
            }
            if (boxData.alert) {
                expandBoxAlert(boxData)
            } else {
                shrinkBoxAlert(boxData)
            }
        })
    }, [...boxesData.map((el) => el.isBoxExpanded), ...boxesData.map((el) => el.alert)])

    const getIsPushActive = () => {
        const hasAlert = boxesData.find((one) => one.alert)
        if (hasAlert) {
            return false
        }
        let res = false
        boxesData.forEach((el) => {
            res = res || (el.itemQuantity > 0 && el.startDate)
        })
        return !!res && !isLoading
    }

    const renderBoxProps = {
        accessToken,
        GTINsMap,
        setBoxesData,
        boxesData,
        inputBoxesData: boxesData,
        setCalendarVisible,
        setSelectedCalenDarIndex,
        isLeavingPage
    }

    const dateTimePickerModalProps = {
        retailStore,
        calendarVisible,
        setCalendarVisible,
        boxesData,
        selectedCalenDarIndex,
        setBoxesData
    }

    const successModalProps = {
        successModalText
    }

    const uploadSFData = () => {
        return new Promise<CommonSyncRes | any>((resolve, reject) => {
            const reqs = []
            boxesData.forEach((boxItem) => {
                if (boxItem.itemQuantity !== 0) {
                    const reqBody = assembleATCReq(boxItem, retailStore)
                    reqs.push(
                        compositeCommonCall([
                            reqBody.getPriceBookEntryReq,
                            reqBody.insertOrderReq,
                            reqBody.insertOrderItemReq
                        ])
                    )
                }
            })
            return Promise.all(reqs)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    const pushToSmartRPromise = async (timeoutRequestKeys, requestKey) => {
        const res = await uploadSFData()
        if (judgeCompositeSuccess(res)) {
            const productCount = boxesData.reduce((a, b) => a + (b.itemQuantity * 1 ? 1 : 0), 0)
            const csCount = boxesData.reduce((a, b) => a + b.itemQuantity * 1, 0)
            // if the request has been marked timeout, then cancel it's side effects
            if (timeoutRequestKeys[requestKey]) {
                return
            }
            setIsLoading(false)
            setSuccessModalText(
                `${productCount} ${t.labels.PBNA_MOBILE_ATC_PRODUCT_SLASH} ${csCount} ${t.labels.PBNA_MOBILE_ATC_SUCCESSFUL_PUSH_MESSAGE}`
            )
            setTimeout(() => {
                navigation.goBack()
            }, 2000)
        }
    }

    const pushToSmartR = async () => {
        if (isLoading || !getIsPushActive()) {
            return
        }
        setIsLoading(true)
        try {
            // during selection phase, all dup check data is cached
            // before submit we need to reCheck all to make sure
            const reCheckOk = await dupCheckForPushToSmartRAll(boxesData, true, pushToSmartR)
            if (!reCheckOk) {
                return
            }
            await timeoutWrap(
                (timeoutRequestKeys, requestKey) => {
                    return pushToSmartRPromise(timeoutRequestKeys, requestKey)
                },
                5000,
                async () => {
                    if (isPersonaPSR()) {
                        setIsLoading(false)
                        noConnectionHandler()
                    }
                }
            )
        } catch (e) {
            // noop
        }
    }

    useEffect(() => {
        const newBoxesData = boxesData.map((el) => {
            return {
                ...el,
                isBoxExpanded: el.itemQuantity !== 0
            }
        })
        setBoxesData(newBoxesData)
        dupCheckForPushToSmartRAll(newBoxesData, false, pushToSmartR)
    }, [...boxesData.map((boxdata) => boxdata.itemQuantity)])

    useEffect(() => {
        const newBoxesData = boxesData.map((el) => {
            return {
                ...el,
                endDate: moment(el.startDate).add(1, 'day').toDate()
            }
        })
        setBoxesData(newBoxesData)
        dupCheckForPushToSmartRAll(newBoxesData, false, pushToSmartR)
    }, [...boxesData.map((boxdata) => boxdata.startDate)])

    useEffect(() => {
        dupCheckForPushToSmartRAll(boxesData, false, pushToSmartR)
    }, [...boxesData.map((boxdata) => boxdata.editable)])

    const hasAlert = !!boxesData.find((one) => one.alert)
    return (
        <SafeAreaView style={styles.container}>
            <InnovationProductHeader
                retailStore={retailStore}
                navigation={navigation}
                onLeavingPage={() => {
                    setIsLeavingPage(true)
                }}
            />
            <KeyboardAwareScrollView style={styles.bodyContainer}>
                <View style={styles.imageSectionContainer}>
                    <CartItemImage carouselUrl={prodLaunchTwoWks.carouseUrl} accessToken={accessToken} />
                    <CartItemTitle mainSP={prodLaunchTwoWks} />
                </View>
                <View style={styles.cartSectionContainer}>
                    <View style={styles.cartSectionTitleContainer}>
                        <CText numberOfLines={1} style={styles.cartSectionTitle}>
                            {t.labels.PBNA_MOBILE_ATC_TO_SELECT_PRODUCTS}
                        </CText>
                    </View>
                    {hasAlert && (
                        <View style={styles.mainAlertTextContainer}>
                            <IconAlertSolid width="15" height="15" style={styles.mainAlertIcon} />
                            <CText style={styles.alertText}>{t.labels.PBNA_MOBILE_ATC_PRIMARY_ALERT}</CText>
                        </View>
                    )}
                    <RenderBoxes {...renderBoxProps} />
                </View>
            </KeyboardAwareScrollView>
            {renderBottomBar(pushToSmartR, getIsPushActive())}
            <DateTimePickerModal {...dateTimePickerModalProps} />
            <SuccessModal {...successModalProps} />
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default CustomerCarouselDetailScreen
