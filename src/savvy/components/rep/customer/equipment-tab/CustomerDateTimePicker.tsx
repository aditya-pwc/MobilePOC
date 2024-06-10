/**
 * @description Component to show lead delivery and execution.
 * @author Shangmin Dou
 * @date 2021-05-25
 */
import React, { useImperativeHandle, useState } from 'react'
import {
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View
} from 'react-native'
import moment from 'moment'
import DateTimePicker from '@react-native-community/datetimepicker'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { CommonParam } from '../../../../../common/CommonParam'
import { setLoggedInUserTimezone } from '../../../../utils/TimeZoneUtils'
import { DatePickerLocale } from '../../../../enums/i18n'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book'
    },
    lookUpStyle: {
        height: 40,
        lineHeight: 50
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.001)'
    },
    modalView: {
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 20,
        width: '50%'
    },
    datePicker: {
        width: '100%',
        height: '100%'
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10
    },
    clockStyle: {
        marginTop: 15,
        width: 20,
        height: 20,
        marginLeft: 10
    },
    touchableContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.5)'
    }
})
interface CustomerDateTimePickerProps {
    value?: string
    onDone?: any
    cRef?: any
    startTime?: any
    defValue?: string
    tempDateFun?: any
}

const CustomerDateTimePicker = (props: CustomerDateTimePickerProps) => {
    const { cRef, startTime, onDone, defValue, tempDateFun } = props
    const [showTimePicker, setShowTimePicker] = useState(false)

    setLoggedInUserTimezone()

    const setInitialState = () => {
        return moment().toDate()
    }
    const [tempDate, setTempDate] = useState(defValue ? moment(defValue).toDate() : setInitialState())
    const [date, setDate] = useState(defValue ? moment(defValue).toDate() : setInitialState())
    const [disable, setDisable] = useState(false)
    useImperativeHandle(cRef, () => ({
        setValue: (v) => {
            setTempDate(moment(v).toDate())
            setDate(moment(v).toDate())
        }
    }))
    const onClickDone = () => {
        if (onDone) {
            onDone(moment(tempDate).format())
        }
        setDate(moment(tempDate).toDate())
        setShowTimePicker(false)
    }
    return (
        <View>
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setShowTimePicker(true)
                    }}
                    style={styles.timePickerContainer}
                >
                    <CText style={[styles.inputStyle, styles.lookUpStyle]}>
                        {tempDateFun ? tempDateFun(date) : moment(date).format(TIME_FORMAT.HMMA)}
                    </CText>
                    <View style={{ right: 0 }}>
                        <Image source={ImageSrc.IMG_CLOCK_BLUE} style={styles.clockStyle} />
                    </View>
                </TouchableOpacity>
            </View>
            <Modal animationType="fade" transparent visible={showTimePicker}>
                <View style={styles.centeredView}>
                    <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
                        <View style={styles.touchableContainer} />
                    </TouchableWithoutFeedback>
                    <View
                        style={[
                            styles.modalView,
                            { backgroundColor: useColorScheme() === 'dark' ? '#acacac' : 'white' }
                        ]}
                    >
                        <TouchableOpacity
                            disabled={disable}
                            style={commonStyle.flexRowJustifyEnd}
                            onPress={onClickDone}
                        >
                            <CText style={{ color: disable ? '#565656' : '#00A2D9', fontWeight: '700', fontSize: 16 }}>
                                {t.labels.PBNA_MOBILE_DONE}
                            </CText>
                        </TouchableOpacity>
                        <DateTimePicker
                            testID={'dateTimePicker'}
                            mode={'time'}
                            display={'spinner'}
                            // timeZoneOffsetInMinutes={0}
                            // @ts-ignore
                            // This is a third party library type definition issue.
                            value={tempDate}
                            timeZoneOffsetInMinutes={moment.tz(CommonParam.userTimeZone).utcOffset()}
                            onChange={(event, date) => {
                                setTempDate(date)
                                if (startTime) {
                                    const endHM = moment(date).utc(true).format('HH:mm')
                                    const startHM = startTime.substring(11, 16)
                                    if (endHM < startHM) {
                                        setDisable(true)
                                    } else {
                                        setDisable(false)
                                    }
                                }
                            }}
                            locale={tempDateFun ? DatePickerLocale.fr : DatePickerLocale[CommonParam.locale]}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default CustomerDateTimePicker
