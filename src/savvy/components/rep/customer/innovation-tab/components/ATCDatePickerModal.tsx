import React from 'react'
import { Dimensions, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { ATCModal } from './ATCModal'
import { CommonLabel } from '../../../../../enums/CommonLabel'
import CText from '../../../../../../common/components/CText'
import { renderOrderDays } from '../../CustomerListTile'
import { t } from '../../../../../../common/i18n/t'
import { DatePickerLocale } from '../../../../../enums/i18n'
import { CommonParam } from '../../../../../../common/CommonParam'

interface ATCDatePickerModalProps extends React.PropsWithChildren {
    retailStore: any
    startDate: Date
    onClose: () => void
    onSelect: (day?: Date) => void
}

export const ATCDatePickerModal: React.FC<ATCDatePickerModalProps> = ({
    retailStore,
    startDate,
    onSelect,
    onClose
}) => {
    const { width } = Dimensions.get('window')

    return (
        <ATCModal visible onRequestClose={onClose}>
            <View style={{ padding: 10 }}>
                <DateTimePicker
                    textColor={'red'}
                    mode={'date'}
                    themeVariant={CommonLabel.LIGHT}
                    display={'inline'}
                    style={{ height: width * 0.85 }}
                    minimumDate={moment().add(1, 'd').toDate()}
                    value={startDate}
                    onChange={(e, date) => onSelect(date)}
                    locale={DatePickerLocale[CommonParam.locale]}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        // --BEGIN-- feature(10944066): Onshore asked to match the same UI as Innovation
                        // marginBottom: 15
                        position: 'absolute',
                        bottom: 15,
                        left: 10,
                        width: '100%'
                        // ---END--- feature(10944066): Onshore asked to match the same UI as Innovation
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <CText style={{ fontSize: 12, color: '#565656' }}>{t.labels.PBNA_MOBILE_CL_ORDER}</CText>
                        {renderOrderDays(retailStore['Account.Merchandising_Order_Days__c'])}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <CText style={{ fontSize: 12, color: '#565656' }}>{t.labels.PBNA_MOBILE_CL_DELIVERY}</CText>
                        {renderOrderDays(retailStore['Account.Merchandising_Delivery_Days__c'])}
                    </View>
                </View>
            </View>
        </ATCModal>
    )
}
