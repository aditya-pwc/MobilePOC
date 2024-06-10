/**
 * @description Component of sort filter modal for lead
 * @author Qiulin Deng
 * @date 2021/12/08
 */
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import React, { FC, useRef, useImperativeHandle } from 'react'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import InnovaProdSortRadioButton from './InnovaProdSortRadioButton'
import { t } from '../../../../../common/i18n/t'

interface InnovaProdSortFormProps {
    cRef: any
    sortValue: any
    setSortValue: any
}

const styles = StyleSheet.create({
    container: {},
    title: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    optionArea: {
        marginTop: 10
    },
    sortItemArea: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    radioContainer: {
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: '400'
    }
})

const initSortSelected = (sortValue: any) => {
    const checkedObj = {
        Name: '',
        Date: '',
        Dist: ''
    }
    switch (sortValue) {
        case 'National Launch Date ASC':
            checkedObj.Date = '1'
            break
        case 'National Launch Date DESC':
            checkedObj.Date = '2'
            break
        case 'Name ASC':
            checkedObj.Name = '1'
            break
        case 'Name DESC':
            checkedObj.Name = '2'
            break
        case 'Distribution DESC':
            checkedObj.Dist = '1'
            break
        case 'Distribution ASC':
            checkedObj.Dist = '2'
            break
        default:
            checkedObj.Date = ''
            checkedObj.Name = ''
            checkedObj.Dist = ''
    }
    return checkedObj
}

const InnovaProdSortForm: FC<InnovaProdSortFormProps> = (props: InnovaProdSortFormProps) => {
    const { cRef, sortValue, setSortValue } = props
    const sort1Ref = useRef(null)
    const sort2Ref = useRef(null)
    const sort3Ref = useRef(null)
    const selectedValue = initSortSelected(sortValue)

    const resetAllRadio = () => {
        sort1Ref?.current?.reset()
        sort2Ref?.current?.reset()
        sort3Ref?.current?.reset()
    }
    useImperativeHandle(cRef, () => ({
        reset: () => {
            resetAllRadio()
        },
        sort1Ref: sort1Ref,
        sort2Ref: sort2Ref,
        sort3Ref: sort3Ref
    }))

    return (
        <View style={styles.container}>
            <CText style={styles.title}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
            <View style={styles.optionArea}>
                <InnovaProdSortRadioButton
                    cRef={sort1Ref}
                    setSortCheck={setSortValue}
                    title={t.labels.PBNA_MOBILE_SORT_DIST_PERCENT}
                    labelLeft={t.labels.PBNA_MOBILE_SORT_HIGH_LOW}
                    labelRight={t.labels.PBNA_MOBILE_SORT_LOW_HIGH}
                    valueLeft={'Distribution DESC'}
                    valueRight={'Distribution ASC'}
                    reset={resetAllRadio}
                    checked={selectedValue.Dist}
                />
                <InnovaProdSortRadioButton
                    cRef={sort2Ref}
                    setSortCheck={setSortValue}
                    title={t.labels.PBNA_MOBILE_SORT_NAT_LAUNCH_DATE}
                    labelLeft={t.labels.PBNA_MOBILE_SORT_OLD_NEW}
                    labelRight={t.labels.PBNA_MOBILE_SORT_NEW_OLD}
                    valueLeft={'National Launch Date ASC'}
                    valueRight={'National Launch Date DESC'}
                    reset={resetAllRadio}
                    checked={selectedValue.Date}
                />
                <InnovaProdSortRadioButton
                    cRef={sort3Ref}
                    setSortCheck={setSortValue}
                    title={t.labels.PBNA_MOBILE_SORT_PRODUCT_NAME}
                    labelLeft={t.labels.PBNA_MOBILE_SORT_A_Z}
                    labelRight={t.labels.PBNA_MOBILE_SORT_Z_A}
                    valueLeft={'Name ASC'}
                    valueRight={'Name DESC'}
                    reset={resetAllRadio}
                    checked={selectedValue.Name}
                />
            </View>
        </View>
    )
}

export default InnovaProdSortForm
