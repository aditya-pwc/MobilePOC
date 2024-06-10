import { StyleSheet, View } from 'react-native'

import React, { ComponentRef, Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react'
import { useDropDown } from '../../contexts/DropdownContext'
import LottieView from 'lottie-react-native'
import { usePlayLottieAnimation } from '../../../savvy/hooks/AnimationHooks'
import CText from '../../components/CText'
import { t } from '../../i18n/t'
import * as Progress from 'react-native-progress'
import { useNavigation } from '@react-navigation/native'

const styles = StyleSheet.create({
    landingBackgroundView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(255,255,255)'
    },
    loadingView: {
        width: 150,
        height: 150,
        top: 80
    },
    savvyText: {
        top: 260,
        fontWeight: '900',
        fontSize: 18
    },
    progressContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 80,
        position: 'relative',
        zIndex: 10
    },
    progressBar: {
        marginTop: 120
    },
    textContainer: {
        position: 'absolute',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99,
        alignSelf: 'center',
        width: '100%'
    },
    textStyle: {
        fontSize: 14,
        alignSelf: 'center',
        fontWeight: '700'
    },
    keepOpenText: {
        top: 290,
        marginHorizontal: 20,
        textAlign: 'center'
    }
})

type LandingExecutor = (
    setProgress: Dispatch<SetStateAction<number>>,
    setSyncText: Dispatch<SetStateAction<string>>,
    dropDownRef: ComponentRef<any>,
    navigation: any,
    route: any
) => Promise<void>

interface LandingScreenBaseProps {
    executor: LandingExecutor
    route: any
}

export const LandingScreenBase: FC<LandingScreenBaseProps> = (props) => {
    const [progress, setProgress] = useState(0)
    const { dropDownRef } = useDropDown()
    const [syncText, setSyncText] = useState('')
    const animationRef = useRef<LottieView>(null)
    const { executor, route } = props
    const navigation = useNavigation()
    usePlayLottieAnimation(animationRef)

    useEffect(() => {
        executor(setProgress, setSyncText, dropDownRef, navigation, route)
    }, [])

    return (
        <View style={styles.landingBackgroundView}>
            <LottieView
                ref={animationRef}
                source={require('../../../../assets/animation/loading.json')}
                autoPlay
                loop
                style={styles.loadingView}
            />
            <CText style={styles.savvyText}>SAVVY</CText>
            <CText style={[styles.keepOpenText, styles.textStyle]}>{t.labels.PBNA_MOBILE_KEEP_APP_OPEN}</CText>
            <View style={styles.progressContainer}>
                <Progress.Bar
                    progress={progress}
                    width={300}
                    height={20}
                    style={styles.progressBar}
                    color="rgba(98,23,185,0.8)"
                >
                    <View style={styles.textContainer}>
                        <CText style={styles.textStyle}>{syncText}</CText>
                    </View>
                </Progress.Bar>
            </View>
        </View>
    )
}
