import { StyleSheet, View, Image } from 'react-native'
import { IMG_GREEN_CHECK, styles as SurveyQuestionsStyle } from './SurveyQuestionsModal'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import React, { useEffect, useState } from 'react'
import { t } from '../../../../../common/i18n/t'
import StepperTriangle from '../../../../../../assets/image/stepper-triangle.svg'
import StepperTriangleGray from '../../../../../../assets/image/stepper-triangle-gray.svg'
import { NumberConstants } from '../../../../enums/Contract'

const styles = StyleSheet.create({
    ...SurveyQuestionsStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    stepContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 60,
        marginTop: 43
    },
    activeStep: {
        backgroundColor: baseStyle.color.loadingGreen
    },
    stepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    stepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontFamily: 'Gotham'
    },
    eImgCheck: {
        width: 20,
        height: 20,
        marginLeft: 6
    },
    titleBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})

interface TitleInfo {
    stepStyle: {
        [key: string]: any
    }
    title: string
    showCheckIcon: boolean
    step: string
}

interface StepViewProps {
    activeStep: number
    titleList: string[]
    CDAStepStyleList: object[]
    transformLength: number
}

const getStepNumberList = () => {
    return [
        t.labels.PBNA_MOBILE_STEP_ONE.toLocaleUpperCase(),
        t.labels.PBNA_MOBILE_STEP_TWO.toLocaleUpperCase(),
        t.labels.PBNA_MOBILE_STEP_THREE.toLocaleUpperCase(),
        t.labels.PBNA_MOBILE_STEP_TOUR.toLocaleUpperCase()
    ]
}

const StepView = (StepViewProps: StepViewProps) => {
    const [titleInfo, setTitleInfo] = useState<TitleInfo[]>([])
    const { activeStep, titleList, CDAStepStyleList, transformLength } = StepViewProps
    const isNextPage = activeStep > NumberConstants.TWO

    const drawHeaderTriangle = (defaultActive: number, activeStep: number) => {
        return (
            <View>
                {activeStep === defaultActive && <StepperTriangle width="20" height="60" />}
                {activeStep !== defaultActive && <StepperTriangleGray width="20" height="60" />}
            </View>
        )
    }

    useEffect(() => {
        const titleInfoTemp: TitleInfo[] = []
        if (activeStep && CDAStepStyleList) {
            titleList.forEach((title, i) => {
                titleInfoTemp.push({
                    title: title,
                    step: getStepNumberList()[i],
                    showCheckIcon: activeStep > i + NumberConstants.ONE,
                    stepStyle: { ...CDAStepStyleList[i] }
                })
            })
            setTitleInfo(titleInfoTemp)
        }
    }, [activeStep, CDAStepStyleList])

    const getStyle = (item: TitleInfo, i: number, activeStep: number) => {
        const stepBoxWidthStyle = { width: item.stepStyle?.width }
        if (item.showCheckIcon) {
            // 21 is the increased width of the check icon
            stepBoxWidthStyle.width += NumberConstants.TWENTY_ONE
        }
        if (activeStep === i + NumberConstants.ONE) {
            return { ...item.stepStyle, ...styles.activeStep, ...stepBoxWidthStyle }
        }
        return { ...item.stepStyle, ...stepBoxWidthStyle }
    }
    const setTextStyle = (originStyle: object, color: string, activeStep: number, currentLength: number) => {
        const isActiveStep = activeStep === currentLength
        return { ...originStyle, color: isActiveStep ? baseStyle.color.white : color }
    }

    return (
        <View style={[styles.stepContainer, isNextPage && { transform: [{ translateX: transformLength }] }]}>
            {titleInfo &&
                titleInfo.map((item, i) => {
                    const currentLength = i + NumberConstants.ONE
                    return (
                        <React.Fragment key={item.title}>
                            <View style={getStyle(item, i, activeStep)}>
                                <CText
                                    style={setTextStyle(
                                        styles.stepTitle,
                                        baseStyle.color.titleGray,
                                        activeStep,
                                        currentLength
                                    )}
                                >
                                    {item.step}
                                </CText>
                                <View style={styles.titleBox}>
                                    <CText
                                        numberOfLines={1}
                                        style={[
                                            setTextStyle(
                                                styles.stepText,
                                                baseStyle.color.black,
                                                activeStep,
                                                currentLength
                                            ),
                                            { flex: 1 }
                                        ]}
                                    >
                                        {item.title}
                                    </CText>
                                    {item.showCheckIcon && <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />}
                                </View>
                            </View>
                            {<>{titleInfo.length !== currentLength && drawHeaderTriangle(currentLength, activeStep)}</>}
                        </React.Fragment>
                    )
                })}
        </View>
    )
}

export default StepView
