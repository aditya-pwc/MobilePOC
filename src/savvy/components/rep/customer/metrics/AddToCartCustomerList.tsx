import React from 'react'
import CustomerListTile from '../CustomerListTile'
import EmptyListPlaceholder from '../../../common/EmptyListPlaceholder'
import CText from '../../../../../common/components/CText'
import { StyleSheet, View } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import DatePickView from './AddToCartDatePickView'
import { atcStyles } from './AddToCartView'

const styles = StyleSheet.create({
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center'
    },
    emptyContainer: {
        backgroundColor: '#F2F4F7',
        width: '100%',
        flex: 1,
        justifyContent: 'center'
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        backgroundColor: '#F2F4F7',
        display: 'flex',
        flexDirection: 'column'
    }
})

const atcCustomerList = (props) => {
    const { customerLst, onCheck, listHeader, onPickStartDate } = props
    const noResult = customerLst.length !== 0 && !customerLst.find((one) => one.visible)
    return (
        <View style={styles.listContainer}>
            {listHeader}
            {noResult && (
                <View style={styles.emptyContainer}>
                    <EmptyListPlaceholder
                        title={
                            <View style={{ alignItems: 'center', width: '120%' }}>
                                <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}
                                </CText>
                                <CText style={styles.NoResultContent}>
                                    {t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2 +
                                        ' ' +
                                        t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}
                                </CText>
                            </View>
                        }
                        transparentBackground
                    />
                </View>
            )}
            {customerLst.map((el, index) => {
                return (
                    <CustomerListTile
                        containerStyle={el.visible ? {} : { display: 'none' }}
                        customer={el}
                        key={el.Id}
                        showShadow
                        customerListAppendage
                        smallGap
                        addToCart
                        onCheck={onCheck.bind(null, index)}
                        datePickerView={
                            (el.showDatePicker || el.edited) && (
                                <View>
                                    <View style={[atcStyles.dateColumnCont, atcStyles.datePickCon]}>
                                        <DatePickView
                                            title={t.labels.PBNA_MOBILE_START_DATE}
                                            clickable
                                            dateString={el.startDate}
                                            onChoseDate={() => {
                                                onPickStartDate(el)
                                            }}
                                        />
                                        <DatePickView title={t.labels.PBNA_MOBILE_END_DATE} dateString={el.endDate} />
                                    </View>
                                    {!!el.alert && <CText style={atcStyles.alertText}>{el.alert}</CText>}
                                </View>
                            )
                        }
                    />
                )
            })}
        </View>
    )
}

export default atcCustomerList
