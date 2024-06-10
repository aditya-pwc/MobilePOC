import React, { FC } from 'react'
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native'
import { ImageSrc } from '../enums/ImageSrc'
import moment from 'moment'
import { baseStyle } from '../styles/BaseStyle'
import { t } from '../i18n/t'

interface DatePickViewProps {
    dateString: string
    select?: boolean
    clickable?: boolean
    title?: string
    placeholder?: string
    onChoseDate?: Function
}

const styles = StyleSheet.create({
    dateInputDisplayWrap: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    dateInputDisplayLabel: {
        fontSize: 12,
        marginBottom: 10,
        color: baseStyle.color.titleGray
    },
    dateInputDisplayValueWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: 24,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.liteGrey
    },
    dateInputDisplayValue: {
        fontSize: 14
    },
    dateInputDisplayIcon: {
        height: 20,
        width: 20,
        resizeMode: 'stretch'
    }
})

const DatePickView: FC<DatePickViewProps> = (props: DatePickViewProps) => {
    const { clickable, title, placeholder, onChoseDate, dateString } = props
    const defaultString = placeholder || t.labels.PBNA_MOBILE_IP_SELECT_DATE
    let dateColor = '#D3D3D3'
    if (clickable) {
        dateColor = dateString?.toString().length > 0 ? '#000000' : '#706E6B'
    }
    return (
        <TouchableOpacity
            onPress={() => {
                if (clickable) {
                    onChoseDate && onChoseDate()
                }
            }}
            style={{ width: '45%', paddingBottom: 5 }}
        >
            <View style={[styles.dateInputDisplayWrap]}>
                <Text style={styles.dateInputDisplayLabel}>{title}</Text>
                <View style={[styles.dateInputDisplayValueWrap]}>
                    <Text style={[styles.dateInputDisplayValue, { color: dateColor }]}>
                        {dateString ? moment(dateString).format('MMMM DD, YYYY') : defaultString}
                    </Text>
                    <Image
                        style={[styles.dateInputDisplayIcon, { tintColor: clickable ? '#00A2D9' : '#D3D3D3' }]}
                        source={ImageSrc.IMG_CALENDAR}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default DatePickView
