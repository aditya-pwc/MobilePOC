/*
 * @Description:
 * @Author: Christopher ZANG
 * @Date: 2022-02-10 00:45:10
 * @LastEditTime: 2022-02-16 04:43:30
 * @LastEditors: Mary Qian
 */
import React, { FC, useEffect, useState } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import Pdf from 'react-native-pdf'
import CText from '../../../common/components/CText'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { getStringValue } from '../../utils/LandingUtils'

interface PDFViewerProps {
    source: {
        uri: string
    }
    isTimeout?: boolean
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: Dimensions.get('window').width,
        height: 56
    },
    errorStyle: {
        marginTop: 50,
        marginHorizontal: 25,
        textAlign: 'center'
    }
})

const PDFViewer: FC<PDFViewerProps> = (props: PDFViewerProps) => {
    const { source, isTimeout } = props
    const [pdf, setPDFSource] = useState(source)
    const [hasError, setHasError] = useState(false)
    useEffect(() => {
        setPDFSource(source)
        return () => {
            setHasError(false)
        }
    }, [source])
    return (
        <View style={[{ height: Dimensions.get('window').height - 338 }, styles.container, styles.pdf]}>
            {!hasError && (
                <Pdf
                    source={pdf}
                    onLoadComplete={() => {
                        setHasError(false)
                    }}
                    onError={async (e) => {
                        setHasError(true)
                        const message = getStringValue(e)
                        if (!message.includes('no pdf source')) {
                            await storeClassLog(Log.MOBILE_ERROR, 'PDFViewer', message)
                        }
                    }}
                    style={styles.pdf}
                />
            )}
            {hasError && (
                <CText style={styles.errorStyle}>
                    {isTimeout
                        ? t.labels.PBNA_MOBILE_PLANOGRAM_RETRIEVAL_TIMEOUT
                        : t.labels.PBNA_MOBILE_No_PLANOGRAM_AVAILABLE}
                </CText>
            )}
        </View>
    )
}

export default PDFViewer
