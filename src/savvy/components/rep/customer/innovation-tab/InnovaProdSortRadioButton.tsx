/**
 * @description Component of radio button for innovation product sort
 * @author Qiulin Deng
 * @date 2021/12/08
 */
import { StyleSheet, View, Image } from 'react-native'
import CText from '../../../../../common/components/CText'
import React, { FC, useState, useImperativeHandle, useEffect } from 'react'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'

interface InnovaProdSortRadioButtonProps {
    title: string
    labelLeft: string
    labelRight: string
    valueLeft: string
    valueRight: string
    reset: any
    checked?: any
    setSortCheck?: any
    textStyle?: any
}

export type InnovaProdSortRadioButtonRef = {
    reset: () => void
    selected: any
}

const styles = StyleSheet.create({
    container: {
        height: 240,
        backgroundColor: 'red'
    },
    title: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    optionArea: {
        marginTop: 16
    },
    sortItemArea: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
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
        fontWeight: '400',
        fontSize: 12,
        color: '#565656',
        width: '60%'
    },
    width30: {
        width: '30%'
    },
    radioButtonTitle: {
        width: '40%',
        color: '#565656',
        fontSize: 12
    }
})

const initSetCheckedValue = (checked: any, valueLeft: any, valueRight: any) => {
    if (checked === '1') {
        return valueLeft
    } else if (checked === '2') {
        return valueRight
    }
    return ''
}
const InnovaProdSortRadioButton: FC<InnovaProdSortRadioButtonProps & { ref: React.Ref<InnovaProdSortRadioButtonRef> }> =
    React.forwardRef<InnovaProdSortRadioButtonRef, InnovaProdSortRadioButtonProps>((props, ref) => {
        const { title, labelLeft, labelRight, reset, valueLeft, valueRight, checked, setSortCheck } = props
        const [option, setOption] = useState(checked)
        const [selectedValue, setSelectedValue] = useState(initSetCheckedValue(checked, valueLeft, valueRight))
        useImperativeHandle(ref, () => ({
            reset: () => {
                setOption('')
                setSelectedValue('')
            },
            selected: selectedValue
        }))

        useEffect(() => {
            setOption(checked)
        }, [checked])

        return (
            <View style={styles.sortItemArea}>
                <CText style={styles.radioButtonTitle}>{title}</CText>
                <CheckBox
                    title={labelLeft}
                    onPress={() => {
                        reset()
                        setSelectedValue(valueLeft)
                        setOption('1')
                        if (setSortCheck) {
                            setSortCheck(valueLeft)
                        }
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} selects a sort`, 1)
                    }}
                    checked={option === '1'}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    containerStyle={[styles.width30, styles.radioContainer]}
                    textStyle={props.textStyle || styles.radioLabel}
                />
                <CheckBox
                    title={labelRight}
                    onPress={() => {
                        reset()
                        setSelectedValue(valueRight)
                        setOption('2')
                        if (setSortCheck) {
                            setSortCheck(valueRight)
                        }
                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} selects a sort`, 1)
                    }}
                    checked={option === '2'}
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    containerStyle={[styles.width30, styles.radioContainer]}
                    textStyle={props.textStyle || styles.radioLabel}
                />
            </View>
        )
    })

InnovaProdSortRadioButton.displayName = 'InnovaProdSortRadioButton'

export default InnovaProdSortRadioButton
