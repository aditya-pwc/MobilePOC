/**
 * @description Add a new visit.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-04
 */

import React, { useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { useNetInfo } from '@react-native-community/netinfo'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    whiteColor: {
        backgroundColor: baseStyle.color.white
    },
    pupreColor: {
        backgroundColor: baseStyle.color.purple
    },

    btnText: {
        fontSize: 12,
        color: '#6C0CC3',
        fontWeight: '700'
    },
    bottomContainer: {
        flexDirection: 'row'
    },
    btnCancel: {
        width: '50%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: baseStyle.color.white,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.4
    },
    btnAddVisit: {
        width: '50%',
        height: 60,
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textAddGray: {
        fontSize: 12,
        color: baseStyle.color.gray,
        fontWeight: baseStyle.fontWeight.fw_900
    },

    textCancel: {
        fontSize: 12,
        color: baseStyle.color.purple,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    textAddVisit: {
        fontSize: 12,
        color: baseStyle.color.white,
        fontWeight: baseStyle.fontWeight.fw_900
    }
})

interface AddVisitBtnProps {
    syncAddVisits: any
    onClose: any
    addVisitList: Array<any>
}

const getVisitLabel = (addVisitList) => {
    return addVisitList?.length === 1
        ? `${t.labels.PBNA_MOBILE_ADD} ${addVisitList.length} ${t.labels.PBNA_MOBILE_VISIT.toUpperCase()}`
        : `${t.labels.PBNA_MOBILE_ADD} ${addVisitList.length} ${t.labels.PBNA_MOBILE_VISITS.toUpperCase()}`
}

const getAddListLength = (addVisitList) => {
    return addVisitList?.length > 0
}

const AddVisitBtn = (props: AddVisitBtnProps) => {
    const { onClose, syncAddVisits, addVisitList } = props
    const netInfo = useNetInfo()

    useEffect(() => {}, [addVisitList])

    return (
        <>
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => {
                        onClose()
                    }}
                    style={styles.btnCancel}
                >
                    <CText style={styles.textCancel}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                </TouchableOpacity>

                {getAddListLength(addVisitList) && netInfo.isInternetReachable ? (
                    <TouchableOpacity
                        onPress={() => {
                            syncAddVisits(addVisitList)
                        }}
                        style={[styles.btnAddVisit, styles.pupreColor]}
                    >
                        <CText style={styles.textAddVisit}>{getVisitLabel(addVisitList)}</CText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.btnAddVisit, styles.whiteColor]}>
                        <CText style={styles.textAddGray}>{t.labels.PBNA_MOBILE_ADD_VISIT}</CText>
                    </TouchableOpacity>
                )}
            </View>
        </>
    )
}

export default AddVisitBtn
