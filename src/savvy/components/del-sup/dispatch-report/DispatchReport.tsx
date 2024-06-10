/*
 * @Description:
 * @Author: Fangfang Ji
 * @Date: 2021-11-23 20:53:03
 * @LastEditTime: 2024-01-05 15:47:20
 */

import React, { useState } from 'react'
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, Modal, Dimensions } from 'react-native'
import CText from '../../../../common/components/CText'
import { CommonParam } from '../../../../common/CommonParam'
import { CommonApi } from '../../../../common/api/CommonApi'
import { restApexCommonCall } from '../../../api/SyncUtils'
import { Log } from '../../../../common/enums/Log'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import moment from 'moment'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { CheckBox } from 'react-native-elements'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import DateTimePicker from '@react-native-community/datetimepicker'
import Loading from '../../../../common/components/Loading'
import { CommonLabel } from '../../../enums/CommonLabel'
import { t } from '../../../../common/i18n/t'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import Mailer from 'react-native-mail'
import _ from 'lodash'
import { DatePickerLocale } from '../../../enums/i18n'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'

const RNFS = require('react-native-fs')

const styles = StyleSheet.create({
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgCalendar: {
        width: 20,
        height: 18,
        marginLeft: 5
    },
    grayText: {
        fontFamily: 'Gotham',
        fontSize: 14,
        color: '#565656'
    },
    dateText: {
        fontFamily: 'Gotham',
        fontSize: 14,
        fontWeight: '400',
        color: '#000'
    },
    checkCircle: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    centeredView: {
        ...commonStyle.flexCenter,
        backgroundColor: 'rgba(0,0,0,0.5)'
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
    con: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontFamily: 'Gotham',
        fontSize: 24,
        fontWeight: '900'
    },
    title: {
        fontFamily: 'Gotham',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 40,
        marginBottom: 30
    },
    dateCon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        height: 50
    },
    deliveryTypeTitle: {
        marginTop: 30,
        marginBottom: 10,
        color: '#565656',
        fontSize: 12
    },
    deliveryTypeCon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -16
    },
    commentTitle: {
        marginTop: 30,
        marginBottom: 10,
        color: '#565656',
        fontSize: 12,
        marginLeft: 0
    },
    commentText: {
        fontSize: 14,
        height: 50,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        lineHeight: 18
    },
    cContainerStyle: { backgroundColor: '#fff', borderWidth: 0 },
    checkText: { fontFamily: 'Gotham', fontSize: 14, fontWeight: '400', color: '#000', marginLeft: 0 },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    dispatchReportContainer: {
        flex: 1,
        marginHorizontal: 22
    }
})
interface DispatchReportInterface {
    navigation?: any
    route?: any
}

declare type MailResponse = {
    event: any
    error: any
}

const CHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_CHECK_CIRCLE} />
const UNCHECK_CIRCLE = <Image style={styles.checkCircle} source={ImageSrc.IMG_UNCHECK_CIRCLE} />

const DispatchReport = (props: DispatchReportInterface) => {
    const { navigation } = props
    const { dropDownRef } = useDropDown()

    const [isLoading, setIsLoading] = useState(false)
    const [deliveryDate, setDeliveryDate] = useState(moment().toDate())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [comments, setComments] = useState('')
    const [activeDeliveryType, setActiveDeliveryType] = useState(1)
    const [deliveryTypeListData] = useState([
        {
            index: 1,
            deliveryType: t.labels.PBNA_MOBILE_BULK_GEO
        },
        {
            index: 2,
            deliveryType: t.labels.PBNA_MOBILE_DBAY
        }
    ])
    const deliveryTypeMap = {
        Bulk: t.labels.PBNA_MOBILE_BULK_GEO,
        DBay: t.labels.PBNA_MOBILE_DBAY
    }
    // data used for email compose
    const emailData = {
        subject: '',
        recipients: [],
        body: '',
        attachmentPath: '',
        fileName: ''
    }
    const weekOfDay = parseInt(moment().format('d'))
    const minDate = moment().toDate()
    const maxDate = moment()
        .add(7 + 7 * 4 - weekOfDay - 1, 'days')
        .toDate()

    const goBack = () => {
        navigation.goBack()
    }
    const composeEmail = () => {
        return new Promise<object>((resolve) => {
            Mailer.mail(
                {
                    subject: emailData.subject,
                    recipients: emailData.recipients,
                    isHTML: true,
                    attachments: [
                        {
                            path: emailData.attachmentPath, // The absolute path of the file from which to read data.
                            type: 'csv', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                            name: emailData.fileName
                        }
                    ]
                },
                (error, event) => {
                    if (!_.isEmpty(error)) {
                        storeClassLog(Log.MOBILE_ERROR, 'composeEmail-handleSendMail', ErrorUtils.error2String(error))
                    }
                    resolve({
                        event,
                        error
                    })
                }
            )
        })
    }
    const fetchDispatchReport = (url, params, path) => {
        setIsLoading(true)
        return new Promise((resolve, reject) => {
            restApexCommonCall(url, 'POST', params)
                .then((res: any) => {
                    // setIsLoading(false)
                    RNFS.writeFile(path, res.data, 'utf8')
                        .then(() => {
                            resolve(path)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
                .catch((err) => {
                    setIsLoading(false)
                    reject(err)
                })
        })
    }

    const handleExportAction = async () => {
        if (!deliveryDate) {
            return false
        }

        const dateStr = moment(deliveryDate).format('YYYY-MM-DD')
        const currentTime = moment().format('YYYY-MM-DD HH-mm-ss')
        const url = `${CommonApi.PBNA_MOBILE_GET_DISPATCH_REPORT}/${dateStr}`
        const delivery = deliveryTypeListData.find((d) => d.index === activeDeliveryType)
        let deliveryMethod = delivery.deliveryType
        for (const [key, val] of Object.entries(deliveryTypeMap)) {
            if (val === delivery.deliveryType) {
                deliveryMethod = key
                break
            }
        }
        const params = {
            strDeliveryDate: dateStr,
            // strUserName: `${CommonParam.userInfo.FirstName}, ${CommonParam.userInfo.LastName}`,
            strDeliveryMethod: deliveryMethod,
            strLocationName: CommonParam.userLocationName,
            strLocationId: CommonParam.userLocationId,
            strcomment: comments
        }
        let deliveryName = ''
        if (delivery?.deliveryType) {
            deliveryName = delivery.deliveryType?.includes('/')
                ? delivery.deliveryType.split('/')[0]
                : delivery.deliveryType
            deliveryName = _.trim(deliveryName)
        }
        const fileName = `${t.labels.PBNA_MOBILE_DISPATCH_REPORT}_${currentTime} ${deliveryName}.csv`
        const path = RNFS.DocumentDirectoryPath + '/' + fileName
        try {
            const targetPath: string = await fetchDispatchReport(url, params, path)
            emailData.attachmentPath = targetPath
            emailData.fileName = fileName
            if (emailData.attachmentPath !== '') {
                const res: MailResponse = await composeEmail()
                const event = res.event
                if (event === 'sent') {
                    dropDownRef.current.alertWithType('success', t.labels.PBNA_MOBILE_SEND_DISPATCH_REPORT_SUCCESSFULLY)
                } else if (event !== 'saved' && event !== 'cancelled') {
                    dropDownRef.current.alertWithType(
                        'error',
                        t.labels.PBNA_MOBILE_SEND_DISPATCH_REPORT_FAILURE,
                        JSON.stringify(res)
                    )
                }
            }
            setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            dropDownRef.current.alertWithType(
                'error',
                t.labels.PBNA_MOBILE_GENERATE_DISPATCH_REPORT_FAILURE,
                JSON.stringify(err)
            )
        }
    }

    const changeDate = (_event, selectedDate) => {
        setDeliveryDate(selectedDate)
        setShowDatePicker(false)
    }

    const renderDeliveryType = () => {
        return (
            <>
                <CText style={styles.deliveryTypeTitle}>{t.labels.PBNA_MOBILE_DELIVERY_METHOD}</CText>
                <View style={styles.deliveryTypeCon}>
                    {deliveryTypeListData.map((item) => {
                        return (
                            <CheckBox
                                key={item.deliveryType}
                                containerStyle={styles.cContainerStyle}
                                textStyle={styles.checkText}
                                fontFamily={'Gotham'}
                                title={item.deliveryType}
                                checkedIcon={CHECK_CIRCLE}
                                uncheckedIcon={UNCHECK_CIRCLE}
                                checked={activeDeliveryType === item.index}
                                onPress={() => setActiveDeliveryType(item.index)}
                            />
                        )
                    })}
                </View>
            </>
        )
    }
    return (
        <SafeAreaView style={styles.con}>
            <View style={styles.dispatchReportContainer}>
                <View style={styles.header}>
                    <CText style={styles.headerTitle}>{t.labels.PBNA_MOBILE_DISPATCH_REPORT}</CText>
                    <TouchableOpacity onPress={goBack}>
                        <BlueClear height={36} width={36} />
                    </TouchableOpacity>
                </View>
                <CText style={styles.title}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                <View style={styles.dateCon}>
                    <CText style={styles.grayText}>{t.labels.PBNA_MOBILE_DELIVERY_DATE}</CText>
                    <TouchableOpacity style={styles.dateContainer} onPress={() => setShowDatePicker(true)}>
                        <CText style={styles.dateText}>{moment(deliveryDate).format('MMM DD, YYYY')}</CText>
                        <Image style={styles.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                    </TouchableOpacity>
                </View>
                {renderDeliveryType()}
                <CText style={styles.commentTitle}>{t.labels.PBNA_MOBILE_ADDITIONAL_COMMENTS}</CText>
                <TextInput
                    placeholder={t.labels.PBNA_MOBILE_ENTER_TEXT}
                    placeholderTextColor={baseStyle.color.titleGray}
                    multiline
                    blurOnSubmit
                    style={styles.commentText}
                    onChangeText={(val) => setComments(val)}
                    autoCorrect={false}
                />
            </View>
            <FormBottomButton
                leftButtonLabel={t.labels.PBNA_MOBILE_BACK}
                rightButtonLabel={t.labels.PBNA_MOBILE_EXPORT_TO_EXCEL.toUpperCase()}
                onPressCancel={goBack}
                onPressSave={handleExportAction}
            />
            <Modal animationType="fade" transparent visible={showDatePicker}>
                <TouchableOpacity style={styles.centeredView} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.calendarModalView}>
                        <DateTimePicker
                            style={styles.datePicker}
                            themeVariant={CommonLabel.LIGHT}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            value={deliveryDate}
                            mode={'date'}
                            display={'inline'}
                            onChange={changeDate}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            locale={DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default DispatchReport
