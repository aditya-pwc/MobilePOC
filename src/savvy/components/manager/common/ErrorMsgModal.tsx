/**
 * @description ErrorMsgModal component.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2021-10-15
 */

import React, { FC } from 'react'
import { View, TouchableOpacity, Modal } from 'react-native'
import CText from '../../../../common/components/CText'
import ErrorImage from '../../../../../assets/image/error.svg'
import ErrorMsgModalStyle from '../../../styles/manager/ErrorMsgModalStyle'
import { t } from '../../../../common/i18n/t'

const styles = ErrorMsgModalStyle

const MESSAGE_ARR = [
    {
        errorMsg: t.labels.PBNA_MOBILE_REFRESH_MSG,
        btnText: t.labels.PBNA_MOBILE_REFRESH
    },
    {
        errorMsg: t.labels.PBNA_MOBILE_VIEW_PUBLISHED_WEEK_MSG,
        btnText: t.labels.PBNA_MOBILE_VIEW_PUBLISHED_WEEK
    },
    {
        errorMsg: t.labels.PBNA_MOBILE_VIEW_TODAY_SCHEDULE_MSG,
        btnText: t.labels.PBNA_MOBILE_VIEW_TODAY_SCHEDULE
    }
]

interface ErrorMsgModalProps {
    index?: number
    visible?: boolean
    handleClick?: any
    setModalVisible?: any
}

const ErrorMsgModal: FC<ErrorMsgModalProps> = (props: ErrorMsgModalProps) => {
    const { index, visible, handleClick, setModalVisible } = props

    const handleButton = () => {
        setModalVisible(false)
        handleClick()
    }

    return (
        <Modal animationType="fade" transparent visible={visible}>
            <View style={styles.container}>
                <View style={styles.contentCon}>
                    <View style={styles.content}>
                        <ErrorImage style={styles.image} />
                        <CText style={styles.label}>{t.labels.PBNA_MOBILE_ERROR_LABEL}</CText>
                        <CText style={styles.message}>{MESSAGE_ARR[index].errorMsg} </CText>
                    </View>
                    <TouchableOpacity
                        style={styles.buttonCon}
                        onPress={() => {
                            handleButton()
                        }}
                    >
                        <CText style={styles.buttonText}>{MESSAGE_ARR[index].btnText} </CText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default ErrorMsgModal
