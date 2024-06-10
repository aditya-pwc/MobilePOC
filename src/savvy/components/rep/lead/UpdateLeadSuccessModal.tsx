/**
 * @description Component to show adding lead successfully message.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import React from 'react'
import { Image, View, StyleSheet } from 'react-native'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface AddLeadSuccessModalProps {
    company: string
    leadType: string
}

const styles = StyleSheet.create({
    iconStyle: {
        width: 60,
        height: 57,
        marginBottom: 20
    },
    textStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700'
    }
})

const UpdateLeadSuccessModal = (props: AddLeadSuccessModalProps) => {
    const { company, leadType } = props
    const renderSuccessMessage = () => {
        let companyShow = company
        const MAX_COMPANY_NAME_LENGTH = 24
        if (company.length > MAX_COMPANY_NAME_LENGTH) {
            companyShow = company.slice(0, MAX_COMPANY_NAME_LENGTH - 3) + '...'
        }
        if (leadType === 'Open') {
            return `'${companyShow}' ${t.labels.PBNA_MOBILE_HAS_BEEN_SUCCESSFULLY_UNASSIGNED}`
        } else if (leadType === 'Negotiate') {
            return `'${companyShow}' ${t.labels.PBNA_MOBILE_HAS_BEEN_SUCCESSFULLY_ADDED_TO_MY_LEADS}`
        }
        return null
    }
    return (
        <View style={commonStyle.alignCenter}>
            <Image style={styles.iconStyle} source={ImageSrc.ICON_SUCCESS} />
            <CText numberOfLines={3} style={styles.textStyle}>
                {renderSuccessMessage()}
            </CText>
        </View>
    )
}

export default UpdateLeadSuccessModal
