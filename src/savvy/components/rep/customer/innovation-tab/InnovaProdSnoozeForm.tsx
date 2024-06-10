/**
 * @description Component to show Innovation Product Snooze Product Page.
 * @author Kawai Hung
 * @date 2022-04-04
 * @Lase
 */

import React, { useState, useEffect } from 'react'
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import CText from '../../../../../common/components/CText'
import FastImage from 'react-native-fast-image'
import { useGTINsMap } from '../../../../hooks/InnovationProductHooks'
import InnovationProductSkuItem from './InnovationProductSkuItem'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import Modal from 'react-native-modal'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { t } from '../../../../../common/i18n/t'
import { handleDayStatus } from '../../../../utils/MerchManagerUtils'
import { updateStoreProdToSF } from '../../../../utils/InnovationProductUtils'
import { CommonParam } from '../../../../../common/CommonParam'
import { DatePickerLocale } from '../../../../enums/i18n'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface InnovaProdSnoozeFormProps {
    accessToken: any
    spStatus: any
    snoozeItem: any
    onClose: any
    retailStore: any
    setCount: any
}

const styles = StyleSheet.create({
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    radioContainer: {
        marginLeft: 22,
        backgroundColor: '#FFF',
        borderWidth: 0,
        padding: 0,
        paddingVertical: 20,
        marginVertical: 0
    },
    storeText: {
        fontSize: 12,
        color: 'black',
        marginLeft: 8,
        fontWeight: '700'
    },
    grayDay: {
        color: '#D3D3D3'
    },
    snoozeForm: {
        alignItems: 'center',
        paddingBottom: 110
    },
    snoozeFormLabelWrap: {
        marginTop: 40,
        marginBottom: 22
    },
    snoozeFormLabel: {
        fontSize: 12,
        fontWeight: '700'
    },
    divider: {
        backgroundColor: '#D3D3D3',
        height: 1,
        width: 384
    },
    imgWrap: {
        backgroundColor: '#FFF',
        height: 190,
        width: 267,
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center'
    },
    img: {
        height: 190,
        width: 190
    },
    checkboxWrap: {
        marginTop: 10,
        flexDirection: 'column',
        width: '100%'
    },
    checkboxText: {
        fontSize: 14,
        fontWeight: '400',
        fontFamily: 'Gotham',
        marginLeft: 0
    },
    iconSnooze: {
        width: 13,
        height: 13,
        marginRight: 7
    },
    snoozeUntil: {
        fontSize: 14,
        color: '#565656',
        width: '30%'
    },
    dateTextWrap: {
        position: 'absolute',
        right: 40
    },
    datePlaceholder: {
        fontSize: 14,
        color: '#D3D3D3'
    },
    dateText: {
        fontSize: 14
    },
    calendarIconWrap: {
        position: 'absolute',
        right: 10
    },
    calendarIcon: {
        height: 20,
        width: 20,
        resizeMode: 'stretch'
    },
    datePickerModalWrap: {
        position: 'absolute',
        width: 380,
        height: 380,
        backgroundColor: '#FFF',
        flex: 1
    },
    datePickerModal: {
        height: 330,
        marginHorizontal: 10,
        marginTop: 5
    },
    orderDays: {
        flexDirection: 'row',
        height: 25,
        alignItems: 'center',
        position: 'absolute',
        right: 20,
        bottom: 17
    },
    orderDaysLabel: {
        fontSize: 12,
        color: '#565656'
    },
    checkBoxDivider: {
        backgroundColor: '#D3D3D3',
        height: 1,
        marginHorizontal: 22
    },
    snoozeButtonContainer: {
        marginTop: 15,
        marginHorizontal: 22,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        paddingBottom: 12,
        marginBottom: 15
    }
})

const InnovaProdSnoozeForm = (props: InnovaProdSnoozeFormProps) => {
    const { accessToken, spStatus, snoozeItem, onClose, retailStore, setCount } = props
    const [option, setOption] = useState('0')
    const [calendarVisible, setCalendarVisible] = useState(false)
    const [customDate, setCustomDate] = useState(moment().toDate())
    const [disableOrderDay, setDisableOrderDay] = useState(false)
    const GTINsMap = useGTINsMap()

    useEffect(() => {
        if (!retailStore['Account.Merchandising_Order_Days__c']) {
            setDisableOrderDay(true)
        }
    }, [retailStore])

    const renderOrderDays = (orderDays) => {
        const dayStatus = handleDayStatus(orderDays)
        return dayStatus?.map((wStatus: any) => {
            return (
                <CText key={wStatus.name} style={[styles.storeText, !wStatus.attend && styles.grayDay]}>
                    {wStatus.label}
                </CText>
            )
        })
    }

    const snoozeProduct = async () => {
        let dateOfWake
        if (option === '1') {
            let dayStatus = handleDayStatus(retailStore['Account.Merchandising_Order_Days__c'])
            dayStatus = dayStatus.concat(dayStatus)
            const dayOfWeek = moment().day()
            let nextOrderDayIndex
            for (let i = dayOfWeek + 1; i < dayStatus.length; i++) {
                if (dayStatus[i].attend) {
                    nextOrderDayIndex = i
                    break
                }
            }
            dateOfWake = moment().day(nextOrderDayIndex).format('YYYY-MM-DD')
        } else if (option === '2') {
            dateOfWake = moment().add(1, 'week').format('YYYY-MM-DD')
        } else if (option === '3') {
            dateOfWake = moment(customDate).format('YYYY-MM-DD')
        }
        await updateStoreProdToSF('Snoozed', dateOfWake, snoozeItem)
        setCount()
        onClose()
    }

    return (
        <View style={styles.snoozeForm}>
            <View style={styles.snoozeFormLabelWrap}>
                <CText style={styles.snoozeFormLabel}>{t.labels.PBNA_MOBILE_IP_SNOOZE_PRODUCT.toUpperCase()}</CText>
            </View>
            <View style={styles.divider} />
            <View style={styles.imgWrap}>
                {GTINsMap[snoozeItem['Product.GTIN__c']] && (
                    <FastImage
                        source={{
                            uri: GTINsMap[snoozeItem['Product.GTIN__c']],
                            headers: {
                                Authorization: accessToken,
                                accept: 'image/png'
                            },
                            cache: FastImage.cacheControl.web
                        }}
                        style={styles.img}
                        resizeMode={'contain'}
                    />
                )}
                {!GTINsMap[snoozeItem['Product.GTIN__c']] && (
                    <Image
                        style={styles.img}
                        source={require('../../../../../../assets/image/No_Innovation_Product.png')}
                    />
                )}
            </View>
            <InnovationProductSkuItem item={snoozeItem} accessToken={accessToken} spStatus={spStatus} snoozeModal />
            <View style={styles.checkboxWrap}>
                <CheckBox
                    disabled={disableOrderDay}
                    title={t.labels.PBNA_MOBILE_IP_NEXT_ORDER_DAY}
                    onPress={() => setOption('1')}
                    checked={option === '1'}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={
                        (!disableOrderDay && (
                            <Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />
                        )) ||
                        (disableOrderDay && (
                            <Image source={ImageSrc.IMG_UNCHECK_CIRCLE_GRAY} style={styles.checkedIcon} />
                        ))
                    }
                    containerStyle={[styles.radioContainer]}
                    textStyle={[styles.checkboxText, disableOrderDay ? { color: '#D3D3D3' } : {}]}
                />
                <View style={styles.checkBoxDivider} />
                <CheckBox
                    title={t.labels.PBNA_MOBILE_IP_ONE_WEEK}
                    onPress={() => setOption('2')}
                    checked={option === '2'}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    containerStyle={[styles.radioContainer]}
                    textStyle={styles.checkboxText}
                />
                <View style={styles.checkBoxDivider} />
                <CheckBox
                    title={t.labels.PBNA_MOBILE_IP_CUSTOM}
                    onPress={() => setOption('3')}
                    checked={option === '3'}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    containerStyle={[styles.radioContainer]}
                    textStyle={styles.checkboxText}
                />
                {option === '3' && (
                    <View style={styles.snoozeButtonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                setCalendarVisible(true)
                            }}
                            style={[commonStyle.flexRowAlignCenter]}
                        >
                            <Image
                                style={styles.iconSnooze}
                                source={require('../../../../../../assets/image/icon_snooze.png')}
                            />
                            <CText style={styles.snoozeUntil}>{t.labels.PBNA_MOBILE_IP_SNOOZE_UNTIL}</CText>
                            <View style={styles.dateTextWrap}>
                                {moment(customDate).isSame(moment(), 'day') && (
                                    <CText style={styles.datePlaceholder}>{t.labels.PBNA_MOBILE_IP_SELECT_DATE}</CText>
                                )}
                                {!moment(customDate).isSame(moment(), 'day') && (
                                    <CText style={styles.dateText}>{moment(customDate).format('MMM DD, YYYY')}</CText>
                                )}
                            </View>
                            <View style={styles.calendarIconWrap}>
                                <Image style={styles.calendarIcon} source={ImageSrc.IMG_CALENDAR} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <FormBottomButton
                onPressSave={snoozeProduct}
                onPressCancel={() => onClose()}
                disableSave={option === '0' || (option === '3' && moment(customDate).isSame(moment(), 'day'))}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                rightButtonLabel={t.labels.PBNA_MOBILE_IP_SNOOZE}
            />
            <Modal
                isVisible={calendarVisible}
                onBackdropPress={() => setCalendarVisible(false)}
                coverScreen
                backdropOpacity={0.2}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <View style={styles.datePickerModalWrap}>
                    <View style={styles.datePickerModal}>
                        <DateTimePicker
                            textColor={'red'}
                            mode={'date'}
                            themeVariant={CommonLabel.LIGHT}
                            display={'inline'}
                            minimumDate={moment().toDate()}
                            maximumDate={moment().add(4, 'weeks').toDate()}
                            value={customDate}
                            onChange={(e, date) => {
                                setCustomDate(date)
                                if (!moment(date).isSame(moment(), 'day')) {
                                    setCalendarVisible(false)
                                }
                            }}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                    <View style={styles.orderDays}>
                        <CText style={styles.orderDaysLabel}>{t.labels.PBNA_MOBILE_CL_ORDER}</CText>
                        <View style={commonStyle.flexDirectionRow}>
                            {renderOrderDays(retailStore['Account.Merchandising_Order_Days__c'])}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default InnovaProdSnoozeForm
