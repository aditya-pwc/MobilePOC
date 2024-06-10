/**
 * @description Component of sort form for lead screen
 * @author Sheng Huang
 * @date 2021/10/26
 */

import React, { FC, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../common/components/CText'
import { renderSortPickList, SortModal } from '../../../helper/rep/FilterLeadListLocationHelper'
import { getLeadSortList } from '../../../utils/LeadCustomerFilterUtils'
import { t } from '../../../../common/i18n/t'

interface SortFormProps {
    sortList: any
    setSortList: any
    isAllLead: boolean
}

const styles = StyleSheet.create({
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Gotham'
    }
})

const LeadSortForm: FC<SortFormProps> = (props: SortFormProps) => {
    const { sortList, setSortList, isAllLead } = props
    const [tempSortList, setTempSortList] = useState([])
    const [showPickList, setShowPickList] = useState(0)

    const sortButtonList = getLeadSortList(isAllLead)

    return (
        <View>
            <CText style={[styles.filterTitle, { marginTop: 30 }]}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
            {renderSortPickList(0, sortList, setShowPickList, setTempSortList)}
            <CText style={[styles.filterTitle, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
            {renderSortPickList(1, sortList, setShowPickList, setTempSortList)}
            <CText style={[styles.filterTitle, { marginTop: 20 }]}>{t.labels.PBNA_MOBILE_THEN}</CText>
            {renderSortPickList(2, sortList, setShowPickList, setTempSortList)}
            <SortModal
                showPickList={showPickList}
                setShowPickList={setShowPickList}
                sortButtonList={sortButtonList}
                sortList={sortList}
                setSortList={setSortList}
                tempSortList={tempSortList}
                setTempSortList={setTempSortList}
                title={t.labels.PBNA_MOBILE_SORT_BY.toUpperCase()}
            />
        </View>
    )
}

export default LeadSortForm
