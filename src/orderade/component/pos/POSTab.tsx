import React, { FC } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { t } from '../../../common/i18n/t'
import EmptyPos from '../../../../assets/image/empty_pos.svg'
import CText from '../../../common/components/CText'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { NavigationProp } from '@react-navigation/native'
import { MyDayVisitModel } from '../../interface/MyDayVisit'
const styles = StyleSheet.create({
    ...commonStyle,
    emptyPos: {
        width: 118,
        height: 159
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginTop: 30
    },
    emptySubTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#565656',
        textAlign: 'center',
        marginTop: 8
    },
    requestNewPosBtn: {
        height: 60,
        borderWidth: 1,
        borderColor: baseStyle.color.LightBlue
    }
})

const EmptyView = () => {
    return (
        <View style={[styles.flexCenter, { paddingBottom: 60 }]}>
            <EmptyPos style={styles.emptyPos} />
            <CText style={styles.emptyTitle}>{t.labels.PBNA_MOBILE_NO_NEW_REQUEST}</CText>
            <CText style={styles.emptySubTitle}>{t.labels.PBNA_MOBILE_NO_NEW_POINT}</CText>
        </View>
    )
}
interface POSTabProps {
    visit: MyDayVisitModel
    navigation: NavigationProp<any>
}
const POSTab: FC<POSTabProps> = (props) => {
    const { navigation, visit } = props
    const requestNew = () => {
        navigation.navigate('RequestNewPOSScreen', {
            storeId: visit.PlaceId
        })
    }
    return (
        <View style={styles.flex_1}>
            <FlatList
                style={{ backgroundColor: '#F2F6F9' }}
                contentContainerStyle={styles.flex_1}
                ListEmptyComponent={<EmptyView />}
                data={undefined}
                renderItem={undefined}
            />
            <TouchableOpacity style={[styles.requestNewPosBtn, styles.flexRowCenter]} onPress={requestNew}>
                <CText style={[styles.font_12_700, styles.colorLightBlue]}>
                    {t.labels.PBNA_MOBILE_REQUEST_NEW_POS}
                </CText>
            </TouchableOpacity>
        </View>
    )
}

export default POSTab
