/**
 * @description In order to use custom image in checkbox.
 * @author Qiulin Deng
 * @email qiulin.deng@pwc.com
 * @date 2021-05-28
 * @lastModifiedDate 2021-05-28
 */

import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'

const IMG_CHECK_BLUE = ImageSrc.IMG_LEAD_CHECKED_BLUE
const UNCHECK_BLUE = ImageSrc.IMG_LEAD_UNCHECKED_BLUE
const IMG_CHECK_GRAY = ImageSrc.IMG_LEAD_CHECKED_GRAY
const UNCHECK_GRAY = ImageSrc.IMG_LEAD_UNCHECKED_GRAY

interface LeadCheckBoxProps {
    title?: any
    containerStyle?: any
    textStyle?: any
    checked?: boolean
    editable?: boolean
    onPress?: any
    fieldApiName?: string
    section?: string
    onChange?: any
    customTrueValue?: string
    customFalseValue?: string
    outerForm?: boolean
    checkedIcon?: any
    checkedIconStyles?: any
    uncheckedIcon?: any
    disableCheckedIcon?: any
    disableUncheckedIcon?: any
}

const styles = StyleSheet.create({
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    }
})

const LeadCheckBox = (props: LeadCheckBoxProps) => {
    const dispatch = useDispatch()
    const { checked, editable, onChange, customTrueValue, customFalseValue, outerForm } = props
    return (
        <View>
            {editable && (
                <CheckBox
                    {...props}
                    checkedIcon={
                        props.checkedIcon || (
                            <Image source={IMG_CHECK_BLUE} style={props.checkedIconStyles || styles.checkedIcon} />
                        )
                    }
                    uncheckedIcon={
                        props.uncheckedIcon || (
                            <Image source={UNCHECK_BLUE} style={props.checkedIconStyles || styles.checkedIcon} />
                        )
                    }
                    containerStyle={[styles.containerStyle, props.containerStyle]}
                    textStyle={[{ fontSize: 14 }, props.textStyle]}
                    checked={checked}
                    onPress={() => {
                        const newObj = {}
                        let newValue = ''
                        if (props.checked) {
                            newValue = customFalseValue || 'No'
                        } else {
                            newValue = customTrueValue || 'Yes'
                        }
                        if (outerForm && onChange) {
                            onChange(newValue)
                            return
                        }
                        newObj[props.fieldApiName] = newValue
                        dispatch(updateTempLeadAction(newObj, props.section))
                        if (onChange) {
                            onChange(newValue)
                        }
                    }}
                />
            )}
            {!editable && (
                <CheckBox
                    {...props}
                    checkedIcon={
                        props.disableCheckedIcon || <Image source={IMG_CHECK_GRAY} style={styles.checkedIcon} />
                    }
                    uncheckedIcon={
                        props.disableUncheckedIcon || <Image source={UNCHECK_GRAY} style={styles.checkedIcon} />
                    }
                    containerStyle={[styles.containerStyle, props.containerStyle]}
                    textStyle={[{ fontSize: 14 }, props.textStyle]}
                    checked={checked}
                    disabled
                />
            )}
        </View>
    )
}

export default LeadCheckBox
