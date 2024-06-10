import React, { useEffect, useState } from 'react'
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, StyleSheet, Image } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { DatePickerLocale } from '../../enums/i18n'
import { CommonParam } from '../../../common/CommonParam'
import { dateTimePickerStyle } from '../../styles/DateTimePickerStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import dayjs from 'dayjs'

const styles = StyleSheet.create({
    absoluteRight_8: {
        right: 8,
        position: 'absolute'
    },
    redStarText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#EB445A'
    },
    inputStyle: {
        marginRight: 38
    },
    titleHorizontalStyle: {
        flex: 1,
        fontSize: 14,
        marginRight: 16
    },
    displayNone: {
        display: 'none'
    }
})

function formatDateToYYYYMMDD(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

interface DateTimeModalProps {
    date: Date | undefined
    setShowDatePicker: Function
    handleDone: Function
    minimumDate?: Date
    maximumDate?: Date
}
const DateTimeModal: React.FC<DateTimeModalProps> = ({
    date,
    setShowDatePicker,
    handleDone,
    minimumDate,
    maximumDate
}) => {
    const [tempDate, setTempDate] = useState(date || new Date())
    const onChangeDate = (_: any, newDate: Date | undefined) => {
        newDate && setTempDate(newDate)
    }
    return (
        <Modal animationType="fade" transparent>
            <View style={dateTimePickerStyle.centeredView}>
                <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                    <View style={dateTimePickerStyle.touchableStyle} />
                </TouchableWithoutFeedback>
                <View style={[dateTimePickerStyle.modalView, { backgroundColor: 'white' }]}>
                    <View style={dateTimePickerStyle.pickerContainer}>
                        <DateTimePicker
                            style={dateTimePickerStyle.datePicker}
                            testID={'dateTimePicker'}
                            textColor={'red'}
                            mode={'date'}
                            display={'inline'}
                            value={tempDate}
                            onChange={onChangeDate}
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            locale={DatePickerLocale[CommonParam.locale as keyof typeof DatePickerLocale]}
                            themeVariant="light"
                        />
                    </View>
                    <View style={commonStyle.alignItemsEnd}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDatePicker(false)
                                handleDone(tempDate)
                            }}
                            style={dateTimePickerStyle.doneView}
                        >
                            <CText style={dateTimePickerStyle.doneText}>{t.labels.PBNA_MOBILE_DONE}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

interface DateTimeTileProps {
    disabled?: boolean
    setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>
    require?: boolean
    fieldLabel: string
    tempDateLabel: string
    titleHorizontal?: boolean
}

const DateTimeTile: React.FC<DateTimeTileProps> = ({
    disabled,
    setShowDatePicker,
    require,
    fieldLabel,
    tempDateLabel,
    titleHorizontal
}) => {
    return (
        <View style={dateTimePickerStyle.formItem}>
            <View style={[commonStyle.flexDirectionRow, titleHorizontal && styles.displayNone]}>
                <CText style={dateTimePickerStyle.title}>{fieldLabel}</CText>
                {require && <CText style={styles.redStarText}>*</CText>}
            </View>

            <TouchableOpacity
                disabled={disabled}
                onPress={() => {
                    setShowDatePicker(true)
                }}
                style={commonStyle.flexDirectionRow}
            >
                <CText
                    style={[
                        dateTimePickerStyle.title,
                        dateTimePickerStyle.lookUpStyle,
                        titleHorizontal ? styles.titleHorizontalStyle : styles.displayNone
                    ]}
                >
                    {fieldLabel}
                </CText>
                <CText
                    style={[
                        dateTimePickerStyle.inputStyle,
                        dateTimePickerStyle.lookUpStyle,
                        titleHorizontal && styles.inputStyle
                    ]}
                >
                    {tempDateLabel || '-'}
                </CText>
                <View style={styles.absoluteRight_8}>
                    <Image style={dateTimePickerStyle.imgCalendar} source={ImageSrc.IMG_CALENDAR} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

interface DatePickerProps {
    disabled?: boolean
    defaultDate?: string
    fieldLabel: string
    handleDone: (newDateString: string) => void
    minimumDate?: Date
    maximumDate?: Date
    require?: boolean
    titleHorizontal?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({
    disabled,
    defaultDate,
    handleDone,
    fieldLabel,
    minimumDate,
    maximumDate,
    require,
    titleHorizontal
}) => {
    const [date, setDate] = useState<undefined | Date>()
    const [showDatePicker, setShowDatePicker] = useState(false)

    const dateLabel = date ? dayjs(date).format(TIME_FORMAT.MMM_DD_YYYY) : ''

    useEffect(() => {
        setDate(defaultDate ? dayjs(defaultDate).toDate() : undefined)
    }, [defaultDate])

    const handleModalDone = (newDate: Date) => {
        setDate(newDate)
        handleDone(formatDateToYYYYMMDD(newDate))
    }
    return (
        <>
            <DateTimeTile
                disabled={disabled}
                setShowDatePicker={setShowDatePicker}
                fieldLabel={fieldLabel}
                tempDateLabel={dateLabel}
                require={require}
                titleHorizontal={titleHorizontal}
            />
            {showDatePicker && (
                <DateTimeModal
                    date={date}
                    setShowDatePicker={setShowDatePicker}
                    handleDone={handleModalDone}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}
        </>
    )
}

interface DatePickerLegacyProps extends Omit<DatePickerProps, 'handleDone'> {
    onChange: (newDate: Date) => void
    value: string
    deferred?: boolean
    titleHorizontal?: boolean
}

export const DatePickerLegacy: React.FC<DatePickerLegacyProps> = ({
    value,
    onChange,
    deferred,
    minimumDate,
    ...props
}) => {
    const handleDone = (newDateString: string) => {
        onChange(dayjs(newDateString).toDate())
    }
    return (
        <DatePicker
            {...props}
            minimumDate={deferred ? new Date() : minimumDate}
            defaultDate={value}
            handleDone={handleDone}
        />
    )
}
