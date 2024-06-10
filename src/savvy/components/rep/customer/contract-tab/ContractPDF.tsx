import React, { useEffect, useState } from 'react'
import { StyleSheet, Platform, SafeAreaView, TouchableOpacity, View, Modal, Alert } from 'react-native'
import Pdf from 'react-native-pdf'
import Share from 'react-native-share'
import { removeFileNameExtension } from './RewardsModals'
import ShareIcon from '../../../../../../assets/image/selling-carousel-file/share.svg'
import ZoomInIcon from '../../../../../../assets/image/selling-carousel-file/zoom_in.svg'
import ZoomOutIcon from '../../../../../../assets/image/selling-carousel-file/zoom_out.svg'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import { Log } from '../../../../../common/enums/Log'
import { t } from '../../../../../common/i18n/t'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import Orientation from 'react-native-orientation-locker'
import { WithSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

enum ZoomLevel {
    notZoom = 1,
    zoomedThreshold = 1.05,
    zoomed = 1.2
}

const maximumRetryTime = 1

const delayTime = {
    ms1000: 1000,
    ms500: 500,
    oneSecond: 1,
    oneMin: 60
}
// To allow landscape in modal
const supportedOrientations = ['portrait' as const, 'landscape-left' as const, 'landscape-right' as const]

const fitPolicyWidth = 0

const minPdfScale = 0.5

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F6'
    },
    backIcon: {
        width: 12,
        height: 12,
        marginLeft: 16,
        borderColor: '#2C75ED',
        borderTopWidth: 2,
        borderLeftWidth: 2,
        transform: [{ rotate: '-45deg' }]
    },
    backText: {
        fontWeight: '700',
        marginLeft: 4,
        fontSize: 14,
        color: '#2C75ED',
        paddingRight: 10
    },
    boldText: {
        fontSize: 14,
        fontWeight: '700',
        marginRight: 'auto',
        marginLeft: 'auto',
        flexShrink: 1
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 39,
        paddingRight: 66
    },
    bottomBtnWrapper: {
        paddingTop: 15,
        paddingHorizontal: 21,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pdfContainer: { backgroundColor: 'white', flex: 1 },
    errorContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center' }
})

export interface ContractPDFFile {
    fileName: string | null
    link: string | null
}

interface ContractPDFModalProps {
    file: ContractPDFFile
    onClose: () => void
    token: string
    cacheTime?: number
}

export const ContractPDFModal: React.FC<ContractPDFModalProps> = ({ file, onClose, token, cacheTime }) => {
    const [zoomBtnIn, setZoomBtnIn] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [retryTime, setRetryTime] = useState(0)
    const [expirationTime, setExpirationTime] = useState(cacheTime || delayTime.oneSecond) // Not using cache for current story
    const [loadCompleteUrls, setLoadCompleteUrls] = useState('')
    const zoomScale = zoomBtnIn ? ZoomLevel.notZoom : ZoomLevel.zoomed

    useEffect(() => {
        const isLock = Orientation.isLocked()
        return () => {
            isLock && Orientation.lockToPortrait()
        }
    }, [])

    const handleScale = () => {
        setZoomBtnIn(!zoomBtnIn)
    }
    const handleShare = () => {
        if (loadCompleteUrls) {
            const options = Platform.select({
                ios: {
                    activityItemSources: [
                        {
                            placeholderItem: { type: 'url' as const, content: loadCompleteUrls },
                            item: {
                                default: { type: 'url' as const, content: loadCompleteUrls }
                            },
                            subject: {
                                default: file.fileName || '-'
                            },
                            linkMetadata: {
                                title: file.fileName || '-',
                                url: loadCompleteUrls,
                                originalUrl: loadCompleteUrls
                            }
                        }
                    ]
                }
            })
            options &&
                Share.open(options).catch((e) => {
                    storeClassLog(Log.MOBILE_ERROR, 'SELL-SHEET-PDF', 'FAIL TO SHARE PDF' + ErrorUtils.error2String(e))
                })
        }
    }
    const handleScaleChange = (scaleNum: number) => {
        if (scaleNum > ZoomLevel.zoomedThreshold) {
            zoomBtnIn && setZoomBtnIn(false)
        } else {
            !zoomBtnIn && setZoomBtnIn(true)
        }
    }
    const handlePDFLoadComplete = (_: unknown, path: string) => {
        Orientation.unlockAllOrientations()
        setLoadCompleteUrls(path)
    }
    const handleError = (e: object) => {
        // toggle to trigger reload pdf component
        setHasError(true)
        if (retryTime < maximumRetryTime) {
            setExpirationTime(delayTime.oneSecond)
            setTimeout(() => {
                setRetryTime(retryTime + 1)
                setHasError(false)
            }, delayTime.ms1000)
        } else {
            storeClassLog(Log.MOBILE_ERROR, 'SELL-SHEET-PDF-DL', ErrorUtils.error2String(e))
            Alert.alert(t.labels.PBNA_MOBILE_PDF_FAIL_TO_LOAD)
            onClose()
        }
    }

    return (
        <Modal supportedOrientations={supportedOrientations}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={commonStyle.flexRowAlignCenter} onPress={onClose}>
                        <View style={styles.backIcon} />
                        <CText style={styles.backText}>{t.labels.PBNA_MOBILE_BACK}</CText>
                    </TouchableOpacity>
                    <CText style={styles.boldText} numberOfLines={1}>
                        {removeFileNameExtension(file?.fileName || '')}
                    </CText>
                </View>
                {hasError ? (
                    <View style={styles.errorContainer} />
                ) : (
                    <Pdf
                        fitPolicy={fitPolicyWidth}
                        minScale={minPdfScale}
                        style={styles.pdfContainer}
                        scale={zoomScale}
                        source={{
                            uri: encodeURI(file?.link || ''),
                            cache: true,
                            headers: {
                                Authorization: token
                            },
                            expiration: expirationTime
                        }}
                        onScaleChanged={handleScaleChange}
                        onLoadComplete={handlePDFLoadComplete}
                        onError={handleError}
                    />
                )}
                <View style={styles.bottomBtnWrapper}>
                    <TouchableOpacity disabled={!loadCompleteUrls} onPress={handleShare}>
                        <ShareIcon fill={!loadCompleteUrls ? 'grey' : '#0A7AFF'} width={25} height={25} />
                    </TouchableOpacity>
                    <TouchableOpacity disabled={!loadCompleteUrls} onPress={handleScale}>
                        {zoomBtnIn ? (
                            <ZoomInIcon fill={!loadCompleteUrls ? 'grey' : '#0A7AFF'} width={25} height={25} />
                        ) : (
                            <ZoomOutIcon fill={!loadCompleteUrls ? 'grey' : '#0A7AFF'} width={25} height={25} />
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

interface ContractPDFPageProps {
    route: any // { params: Omit<ContractPDFModalProps, 'onClose'> }
    navigation: any
}
export const ContractPDFPage: React.FC<ContractPDFPageProps> = ({ route, navigation }) => {
    const ContractPDFModalWithToken = WithSharePointToken(ContractPDFModal)

    const handleClose = () => navigation.goBack()
    return <ContractPDFModalWithToken file={route.params} onClose={handleClose} />
}
