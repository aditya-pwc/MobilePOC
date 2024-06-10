/**
 * @description This component is to show contact info
 * @author Shangmin Dou
 * @email shangmin.dou@gmail.com
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    infoWrap: {
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 65,
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        width: '100%'
    },
    colorGray: {
        color: '#575858'
    },
    text: {
        color: 'black',
        marginTop: 5,
        fontWeight: '900',
        fontSize: 20
    }
})

interface ContactInfoProps {
    label: string
    value: string
    children?: any
}

const ContactInfo = (props: ContactInfoProps) => {
    const { label, value, children } = props
    return (
        <View style={styles.infoWrap}>
            <View style={commonStyle.flex_1}>
                <CText style={styles.colorGray}>{label}</CText>
                <CText style={styles.text}>{value}</CText>
            </View>
            {children}
        </View>
    )
}

export default ContactInfo
