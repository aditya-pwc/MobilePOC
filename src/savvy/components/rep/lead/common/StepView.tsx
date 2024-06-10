import React, { FC } from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'

const styles = StyleSheet.create({
    stepView: {
        marginTop: 45,
        height: 50,
        flexDirection: 'row'
    },
    activeStep: {
        backgroundColor: baseStyle.color.loadingGreen
    },
    firstStep: {
        width: '32%',
        paddingLeft: 22,
        justifyContent: 'center',
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray
    },
    firstStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    firstStepText: {
        maxWidth: 101,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    activeStepColor: {
        color: baseStyle.color.white
    },
    flexRowEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 8
    },
    selectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.loadingGreen,
        borderLeftColor: baseStyle.color.transparent
    },
    unselectTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.bgGray,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 15,
        borderBottomWidth: 25,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.white,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomLeftTriangle: {
        transform: [{ rotateX: '180deg' }]
    },
    secondStep: {
        width: '35%',
        left: -10,
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -2
    },
    thirdStep: {
        width: '33%',
        left: -20,
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullHeight,
        backgroundColor: baseStyle.color.bgGray,
        zIndex: -4
    },
    secondStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    secondStepText: {
        maxWidth: 101,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    thirdStepText: {
        maxWidth: 80,
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    maximumText: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.red
    },
    stepOneContainer: {
        position: 'absolute',
        zIndex: -2,
        flexDirection: 'row'
    },
    stepOneBottomTriangle: {
        zIndex: -2,
        width: 5,
        height: '100%',
        backgroundColor: 'white'
    },
    stepTwoContainer: {
        position: 'absolute',
        zIndex: -4,
        flexDirection: 'row'
    },
    stepTwoBottomTriangle: {
        zIndex: -4,
        width: 5,
        height: '100%',
        backgroundColor: 'white'
    }
})

interface StepViewProps {
    activeStep: number
    stepTextMap: object
    onPressStepOne: any
    onPressStepTwo: any
    onPressStepThree: any
    readOnly: any
    disableStepOne?: boolean
    disableStepTwo?: boolean
    disableStepThree?: boolean
}

const StepView: FC<StepViewProps> = (props: StepViewProps) => {
    const {
        activeStep,
        stepTextMap,
        onPressStepOne,
        onPressStepTwo,
        onPressStepThree,
        readOnly,
        disableStepOne,
        disableStepTwo,
        disableStepThree
    } = props
    // const [activeStep, setActiveStep] = useState(0)

    const IMG_GREEN_CHECK = ImageSrc.ICON_CHECKMARK_CIRCLE
    const drawHeaderTriangle = (defaultActive, activeStepNum, drawStyles) => {
        return (
            <View>
                {activeStepNum === defaultActive && (
                    <View>
                        <View style={drawStyles.selectTriangle} />
                        <View style={[drawStyles.selectTriangle, drawStyles.bottomLeftTriangle]} />
                    </View>
                )}
                {activeStepNum !== defaultActive && (
                    <View>
                        <View style={drawStyles.unselectTriangle} />
                        <View style={[drawStyles.unselectTriangle, drawStyles.bottomLeftTriangle]} />
                    </View>
                )}
            </View>
        )
    }

    const renderStepOne = () => {
        return (
            <>
                <TouchableOpacity
                    style={[styles.firstStep, activeStep === 0 && styles.activeStep]}
                    disabled={disableStepOne || activeStep === 0}
                    onPress={() => {
                        onPressStepOne && onPressStepOne()
                    }}
                >
                    <CText style={[styles.firstStepTitle, activeStep === 0 && styles.activeStepColor]}>
                        {t.labels.PBNA_MOBILE_STEP_ONE}
                    </CText>
                    <View style={styles.flexRowEnd}>
                        <CText
                            numberOfLines={1}
                            style={[styles.firstStepText, activeStep === 0 && styles.activeStepColor]}
                        >
                            {stepTextMap[0]}
                        </CText>
                        {(activeStep === 1 || activeStep === 2) && (
                            <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />
                        )}
                    </View>
                </TouchableOpacity>
                <View style={commonStyle.flexDirectionRow}>
                    {drawHeaderTriangle(0, activeStep, styles)}
                    <View style={styles.stepOneContainer}>
                        <View style={styles.stepOneBottomTriangle} />
                        <View>
                            <View style={styles.bottomTriangle} />
                            <View style={[styles.bottomTriangle, styles.bottomLeftTriangle]} />
                        </View>
                    </View>
                </View>
            </>
        )
    }

    const renderStepTwo = () => {
        return (
            <>
                <TouchableOpacity
                    style={[styles.secondStep, activeStep === 1 && styles.activeStep]}
                    disabled={disableStepTwo || activeStep === 1}
                    onPress={() => {
                        onPressStepTwo && onPressStepTwo()
                    }}
                >
                    <CText style={[styles.secondStepTitle, activeStep === 1 && styles.activeStepColor]}>
                        {t.labels.PBNA_MOBILE_STEP_TWO}
                    </CText>
                    <View style={styles.flexRowEnd}>
                        <CText
                            numberOfLines={1}
                            style={[styles.secondStepText, activeStep === 1 && styles.activeStepColor]}
                        >
                            {stepTextMap[1]}
                        </CText>
                        {(activeStep === 2 || readOnly) && <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />}
                    </View>
                </TouchableOpacity>
                <View
                    style={[
                        commonStyle.flexDirectionRow,
                        {
                            left: -10
                        }
                    ]}
                >
                    {drawHeaderTriangle(1, activeStep, styles)}
                    <View style={styles.stepTwoContainer}>
                        <View style={styles.stepTwoBottomTriangle} />
                        <View>
                            <View style={styles.bottomTriangle} />
                            <View style={[styles.bottomTriangle, styles.bottomLeftTriangle]} />
                        </View>
                    </View>
                </View>
            </>
        )
    }
    const renderStepThree = () => {
        return (
            <TouchableOpacity
                style={[styles.thirdStep, activeStep === 2 && styles.activeStep]}
                disabled={disableStepThree || activeStep === 2}
                onPress={() => {
                    onPressStepThree && onPressStepThree()
                }}
            >
                <CText style={[styles.secondStepTitle, activeStep === 2 && styles.activeStepColor]}>
                    {t.labels.PBNA_MOBILE_STEP_THREE.toLocaleUpperCase()}
                </CText>
                <View style={styles.flexRowEnd}>
                    <CText
                        numberOfLines={1}
                        style={[styles.thirdStepText, {}, activeStep === 2 && styles.activeStepColor]}
                    >
                        {stepTextMap[2]}
                    </CText>
                    {readOnly && <Image source={IMG_GREEN_CHECK} style={styles.eImgCheck} />}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.stepView}>
            {renderStepOne()}
            {renderStepTwo()}
            {renderStepThree()}
        </View>
    )
}

StepView.defaultProps = {
    disableStepOne: false,
    disableStepTwo: false,
    disableStepThree: false
}

export default StepView
