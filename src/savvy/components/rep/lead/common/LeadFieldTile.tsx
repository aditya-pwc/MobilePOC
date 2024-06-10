/**
 * @description Component to show lead detail field.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface LeadDetailFieldBaseProps {
    fieldName: string
    fieldValue: string | number
    EMPTY_VALUE_PLACEHOLDER?: string
    highlight?: boolean
    labelStyle?: any
    showPurpleDot?: boolean
    fieldValueStyle?: any
    redValue?: boolean
    containerStyle?: any
}

const styles = StyleSheet.create({
    leadDetailFieldTitle: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginTop: 15
    },
    leadDetailFieldContent: {
        fontSize: 14,
        color: 'black',
        fontWeight: '400',
        marginTop: 5
    },
    leadDetailFieldHighlightTitle: {
        lineHeight: 16,
        fontSize: 12,
        color: 'grey'
    },
    leadDetailFieldHighlightContent: {
        lineHeight: 16,
        fontSize: 16,
        fontWeight: '700',
        marginTop: '2.5%'
    },
    purpleDot: {
        backgroundColor: '#6C0CC3',
        width: 8,
        height: 8,
        marginLeft: 10,
        marginTop: 15.5,
        borderRadius: 5
    }
})

const LeadFieldTile = (props: LeadDetailFieldBaseProps) => {
    const { fieldName, fieldValue, highlight, labelStyle, showPurpleDot, redValue } = props
    const emptyPlaceholder = props.EMPTY_VALUE_PLACEHOLDER || '-'
    return (
        <View style={[{ flexDirection: 'column' }, props.containerStyle]}>
            <View style={commonStyle.flexRowAlignCenter}>
                <CText
                    style={[highlight ? styles.leadDetailFieldHighlightTitle : styles.leadDetailFieldTitle, labelStyle]}
                >
                    {fieldName}
                </CText>
                {showPurpleDot && <View style={styles.purpleDot} />}
            </View>
            <CText
                style={[
                    highlight ? styles.leadDetailFieldHighlightContent : styles.leadDetailFieldContent,
                    props.fieldValueStyle,
                    {
                        color: redValue ? '#EB445A' : 'black'
                    }
                ]}
            >
                {fieldValue || emptyPlaceholder}
            </CText>
        </View>
    )
}

export default LeadFieldTile
