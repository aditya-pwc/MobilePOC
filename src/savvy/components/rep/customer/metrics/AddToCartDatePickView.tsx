import React from 'react'
import { t } from '../../../../../common/i18n/t'
import { styles } from '../../../../pages/rep/atc/CustomerCarouselDetailScreen'
import { TouchableOpacity, View, Image } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import CText from '../../../../../common/components/CText'
import moment from 'moment'

interface DatePickViewProps {
    dateString: string
    select?: boolean
    clickable?: boolean
    title?: string
    placeholder?: string
    onChoseDate?: Function
}

const DatePickView = (props: DatePickViewProps) => {
    const { clickable, title, placeholder, onChoseDate, dateString } = props
    const defaultString = placeholder || t.labels.PBNA_MOBILE_IP_SELECT_DATE
    let dateColor = '#D3D3D3'
    if (clickable) {
        dateColor = dateString.length > 0 ? '#000000' : '#706E6B'
    }
    return (
        <TouchableOpacity
            onPress={() => {
                if (clickable) {
                    onChoseDate && onChoseDate()
                }
            }}
            style={{ width: '45%', paddingBottom: 15 }}
        >
            <View style={[styles.dateInputDisplayWrap]}>
                <CText style={styles.dateInputDisplayLabel}>{title}</CText>
                <View style={[styles.dateInputDisplayValueWrap]}>
                    <CText style={[styles.dateInputDisplayValue, { color: dateColor }]}>
                        {dateString ? moment(dateString).format('MMM DD, YYYY') : defaultString}
                    </CText>
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
