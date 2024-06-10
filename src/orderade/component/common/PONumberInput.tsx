/*
 * @Author: Tom tong.jiang@pwc.com
 * @Date: 2023-12-23 16:41:50
 * @LastEditors: Tom tong.jiang@pwc.com
 * @LastEditTime: 2024-01-04 09:49:27
 */
import React, { FC, useImperativeHandle } from 'react'
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import CText from '../../../common/components/CText'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    inputContainer: { width: '45%', paddingBottom: 5 },
    PONumContainer: {
        height: 24,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        marginTop: 10
    },
    POText: {
        fontSize: 14,
        fontFamily: 'Gotham'
    },
    labelText: { color: '#565656', fontSize: 12 }
})

interface PONumberInputProps {
    PONumber: string
    setPoNumber: React.Dispatch<React.SetStateAction<string>>
    cRef: any
    setIsModified: Function
}

const PONumberInput: FC<PONumberInputProps> = (props: PONumberInputProps) => {
    const { PONumber, setPoNumber, cRef, setIsModified } = props

    const promptPOInput = () => {
        Alert.prompt(
            `${t.labels.PBNA_MOBILE_PO_NUMBER} ${t.labels.PBNA_MOBILE_REQUIRED}`,
            `${t.labels.PBNA_MOBILE_PO_NUMBER_ALERT_PROMPT_MSG}`,
            [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL
                },
                {
                    text: t.labels.PBNA_MOBILE_CONFIRM,
                    onPress: (text) => {
                        setIsModified(true)
                        setPoNumber(`${text}`.replaceAll(/[^a-zA-Z0-9]/g, ''))
                    }
                }
            ],
            'plain-text',
            PONumber,
            'default'
        )
    }

    useImperativeHandle(cRef, () => ({
        promptPOInput
    }))

    const PONumberValue = PONumber || `${t.labels.PBNA_MOBILE_ENTER} ${t.labels.PBNA_MOBILE_PO_NUMBER}`
    const PONumberColor = PONumber ? '#000000' : '#D3D3D3'

    return (
        <View style={styles.inputContainer}>
            <CText style={styles.labelText}>
                {`${t.labels.PBNA_MOBILE_PO_NUMBER} (${t.labels.PBNA_MOBILE_REQUIRED})`}
            </CText>
            <TouchableOpacity onPress={promptPOInput}>
                <View style={styles.PONumContainer}>
                    <CText
                        style={[
                            styles.POText,
                            {
                                color: PONumberColor
                            }
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {PONumberValue}
                    </CText>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default PONumberInput
