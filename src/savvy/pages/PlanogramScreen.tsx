import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, View, StyleSheet, ScrollView } from 'react-native'
import { Constants } from '../../common/Constants'

import PDFViewer from '../components/common/PDFViewer'
import { Log } from '../../common/enums/Log'
import PlanogramService from '../service/PlanogramService'
import { commonStyle } from '../../common/styles/CommonStyle'
import { storeClassLog } from '../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    screenContainer: {
        height: Dimensions.get('window').height - 278
    },
    pdf: {
        width: Dimensions.get('window').width,
        backgroundColor: 'white'
    }
})

interface PlanogramScreenProps {
    customId: string
}

const AXIOS_TIMEOUT_CODE = 'ECONNABORTED'

const PlanogramScreen: FC<PlanogramScreenProps> = (props: PlanogramScreenProps) => {
    const [source, setSource] = useState([])
    const [isReady, setIsReady] = useState(false)
    const [isTimeout, setIsTimeout] = useState(false)

    const deleteLocalDataIfMoreThanTwenty = (localData) => {
        const result = { ...localData }
        if (Object.keys(result).length >= Constants.MAX_LOCAL_DATA) {
            const firstObject = result[Object.keys(result)[0]]
            delete result[Object.keys(result)[0]]
            PlanogramService.deletePDFs(firstObject)
                .then(() => {
                    return deleteLocalDataIfMoreThanTwenty(result)
                })
                .catch((err) => {
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'deleteLocalDataIfMoreThanTwenty',
                        `Delete planogram pdf failed ${ErrorUtils.error2String(err)}`
                    )
                    return deleteLocalDataIfMoreThanTwenty(result)
                })
        }
        return result
    }

    const getPlanogram = async () => {
        if (_.isEmpty(props.customId)) {
            return
        }
        const planogramLocalDataString = await AsyncStorage.getItem('PlanogramLocal')
        const planogramLocalData = planogramLocalDataString ? JSON.parse(planogramLocalDataString) : {}
        if (planogramLocalData && planogramLocalData[props.customId]) {
            const source = planogramLocalData[props.customId]
            setIsReady(true)
            setSource(
                source.map((fileName) => {
                    return { uri: fileName }
                })
            )
        } else {
            PlanogramService.retrievePDF(props.customId)
                .then((res: Array<string>) => {
                    const planogramNewData = deleteLocalDataIfMoreThanTwenty(planogramLocalData)
                    if (!_.isEmpty(res)) {
                        planogramNewData[props.customId] = res
                        AsyncStorage.setItem('PlanogramLocal', JSON.stringify(planogramNewData))
                    }
                    setIsReady(true)
                    setSource(
                        res.map((fileName) => {
                            return { uri: fileName }
                        })
                    )
                })
                .catch((err) => {
                    setIsTimeout(err.code === AXIOS_TIMEOUT_CODE)
                    setIsReady(true)
                    storeClassLog(
                        Log.MOBILE_ERROR,
                        'getPlanogram',
                        `Get planogram pdf failed ${ErrorUtils.error2String(err)}`
                    )
                })
        }
    }

    useEffect(() => {
        getPlanogram()
    }, [props.customId])
    if (!isReady) {
        return (
            <View style={[styles.screenContainer, styles.container, styles.pdf]}>
                <ActivityIndicator style={commonStyle.flex_1} />
            </View>
        )
    }
    return (
        <ScrollView style={styles.screenContainer}>
            {source.length > 0 &&
                source.map((src: any) => {
                    return <PDFViewer key={src.uri} source={src} />
                })}
            {(!source || source.length === 0) && <PDFViewer key={0} source={null} isTimeout={isTimeout} />}
        </ScrollView>
    )
}

export default PlanogramScreen
