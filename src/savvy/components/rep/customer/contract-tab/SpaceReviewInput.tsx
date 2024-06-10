import { Input, InputProps } from 'react-native-elements'
import { styles } from './ContractSpaceReviewPage'
import React, { useEffect, useState } from 'react'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
interface SpaceReviewInputProps {
    initialInputValue: string
    onChangeText: any
    value: any
    isNeedChangedBorder?: boolean
    isEditable?: boolean
}
const SpaceReviewInput = (props: SpaceReviewInputProps & InputProps) => {
    const { initialInputValue, onChangeText, value, isNeedChangedBorder = true, isEditable = true } = props
    const [initValue] = useState(initialInputValue)
    const [inputBorderColor, setInputBorderColor] = useState(baseStyle.color.tabBlue)
    const judgeBorderColorByInputChange = (
        inputText: number | string,
        initialText: number | string,
        changedBorderColor = baseStyle.color.yellow,
        initialBorderColor = baseStyle.color.tabBlue
    ) => {
        return setInputBorderColor(
            (inputText !== initialText || !inputText) && isNeedChangedBorder ? changedBorderColor : initialBorderColor
        )
    }
    useEffect(() => {
        judgeBorderColorByInputChange(initialInputValue, value)
    }, [])
    return (
        <Input
            editable={isEditable}
            containerStyle={[styles.tableRowInputTotal, { borderColor: isEditable ? inputBorderColor : '#dddddd' }]}
            textAlign="center"
            returnKeyType="done"
            inputContainerStyle={styles.borderBottomColor0}
            onChangeText={(text) => {
                onChangeText(text)
                judgeBorderColorByInputChange(text, initValue)
            }}
            keyboardType="decimal-pad"
            inputStyle={styles.tableRowInputStyle}
            value={value}
            onBlur={(e: any) => {
                const tmpVal = e.nativeEvent.text
                if (!tmpVal) {
                    onChangeText('0')
                    judgeBorderColorByInputChange('0', initValue)
                }
            }}
        />
    )
}
export default SpaceReviewInput
