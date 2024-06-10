import React, { useEffect, useRef, useState } from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform,
    Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PickerTile from '../../lead/common/PickerTile'
import FastImage from 'react-native-fast-image'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import ZoomInIcon from '../../../../../../assets/image/selling-carousel-file/zoom_in.svg'
import ZoomOutIcon from '../../../../../../assets/image/selling-carousel-file/zoom_out.svg'
import RotateIcon from '../../../../../../assets/image/selling-carousel-file/rotate.svg'
import ShareIcon from '../../../../../../assets/image/selling-carousel-file/share.svg'

import CText from '../../../../../common/components/CText'
import { DocumentDirectoryPath, exists } from 'react-native-fs'
import Share from 'react-native-share'
import Pdf from 'react-native-pdf'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { translateSalesDocTypeName } from '../../../../utils/InnovationProductUtils'
import { useSharePointToken } from '../../../../helper/rep/SharePointTokenHelper'
import { CommonApi } from '../../../../../common/api/CommonApi'

interface SalesDocumentsProps {
    navigation: any
    route: any
}

const screenWidth = Dimensions.get('window').width
const PADDING = 24

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F6'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
        height: 39,
        paddingRight: 66
    },
    backIconContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    backIcon: {
        borderColor: '#2C75ED',
        marginLeft: 16,
        width: 12,
        height: 12,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        transform: [{ rotate: '-45deg' }]
    },
    backText: {
        fontWeight: '700',
        marginLeft: 4,
        fontSize: 14,
        color: '#2C75ED'
    },
    pickerContainerStyle: {
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 180,
        height: 39,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    imageContainer: {
        flex: 1,
        width: screenWidth,
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    docImage: {
        width: screenWidth,
        height: 'auto',
        flexGrow: 1
    },
    // to change PDFViewer width
    pdfContainer: {
        ...commonStyle.flex_1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12
    },
    pdf: {
        flexGrow: 1,
        backgroundColor: 'white'
    },
    bottomBtnWrapper: {
        height: 61,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 21
    },
    iconToNext: {
        width: 14,
        height: 14,
        borderTopWidth: 2.5,
        borderRightWidth: 2.5,
        transform: [{ rotate: '45deg' }]
    },
    iconToPREV: {
        width: 14,
        height: 14,
        borderTopWidth: 2.5,
        borderLeftWidth: 2.5,
        transform: [{ rotate: '-45deg' }]
    },
    customPickerTextStyle: {
        textAlign: 'center',
        fontWeight: '700'
    },
    failedTextCon: {
        width: screenWidth - PADDING,
        alignItems: 'center'
    }
})

const SalesDocuments = (props: SalesDocumentsProps) => {
    const { navigation, route } = props
    const { docItem, docIndex, docList, onSalesDocumentsGoBack } = route.params

    const sharepointToken = useSharePointToken(true)

    const scrollViewRef = useRef<ScrollView>(null)
    const fileRef = useRef<View>(null)
    const [zoomEnabled, setZoomEnabled] = useState(true)
    const [pageIndex, setPageIndex] = useState(0)
    const [scrollEnabled, setScrollEnabled] = useState(true)

    const [fileIndex, setFileIndex] = useState(0)

    const pickerRef: any = useRef(null)
    const [fileList, setFileList] = useState<any[]>(docList) // file list for map
    const [pickerData, setPickerData] = useState<string[]>([]) // picker options, string array
    const [pickerDefValue, setPickerDefValue] = useState(translateSalesDocTypeName(docItem))

    const [fileScale, setFileScale] = useState(1)
    const [rotateDeg, setRotateDeg] = useState(0)
    const [fileWidth, setFileWidth] = useState(screenWidth)
    const [originalHeight, setOriginalHeight] = useState(0)

    const [failedLoadFiles, setFailedLoadFiles] = useState<string[]>([])

    // when sync failed but load successfully from remote url(Scenario: change connection in docs page), record url and pass to prev page,
    // so can prevent connection message pop up when click doc
    const [loadCompleteUrls, setLoadCompleteUrls] = useState<string[]>([])

    const syncedUrls = useSelector((state: any) => state.salesDocumentsReducer.fileUrls)

    const handleComputeList = async () => {
        const storageUrls = JSON.parse(
            ((await AsyncStorage.getItem('syncSalesDocumentsFileUrls')) as any) || JSON.stringify([])
        )
        const mergedUrls = _.uniq([...syncedUrls, ...storageUrls])
        const urlPrefix = `${CommonApi.PBNA_MOBILE_SHAREPOINT_DOCUMENT_API}${CommonApi.PBNA_MOBILE_SALES_DOCUMENTS_DIRECTORY}`
        const urlSuffix = ':/content'
        const list = await Promise.all(
            docList.map(async (doc: any) => {
                const devicePath = `${DocumentDirectoryPath}/${doc.salesDocUrl}`
                doc.fileUrl = `${urlPrefix}${doc.salesDocUrl}${urlSuffix}`
                // get file type
                doc.fileType = doc.salesDocUrl.split('.').pop()
                // if sync failed, will use remote url
                const isExists = await exists(devicePath)
                doc.isFailedSync = !mergedUrls.includes(doc.salesDocUrl) || !isExists
                return doc
            })
        )
        setFileList(list)
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            if (onSalesDocumentsGoBack) {
                onSalesDocumentsGoBack(loadCompleteUrls)
            }
        })
        return unsubscribe
    }, [loadCompleteUrls])

    useEffect(() => {
        handleComputeList()
        setFileIndex(docIndex)
    }, [])

    useEffect(() => {
        const options: string[] = fileList.map((item: any) => {
            return item.salesDocType !== 'Other' ? translateSalesDocTypeName(item) : item.salesDocTypeOther
        })
        setPickerData(options)
    }, [fileList])

    useEffect(() => {
        pickerRef.current.setValue(pickerData[fileIndex])
        setPageIndex(fileIndex)
    }, [pickerData, fileIndex])

    useEffect(() => {
        // when totate, set file with equals original height
        setFileWidth((rotateDeg / 90) % 2 === 0 ? screenWidth - PADDING : originalHeight)
    }, [rotateDeg])

    const handleChangePickerFile = (salesDocType: string) => {
        setFileScale(1)
        setRotateDeg(0)
        setFileWidth(screenWidth - PADDING)
        setPickerDefValue(salesDocType)
        const index = pickerData.findIndex((item: any) => item === salesDocType)
        setPageIndex(index)
        const x = index * screenWidth
        scrollViewRef.current?.scrollTo({ x, y: 0, animated: true })
    }

    const handleScrollViewLayout = (event: any) => {
        // set original height, when rotate file, change it's width
        setOriginalHeight(event.nativeEvent.layout.height)
    }

    const handleScrollBeginDrag = () => {
        setZoomEnabled(false)
    }

    const handleScrollEndDrag = () => {
        setZoomEnabled(true)
    }

    const handlePageChange = (index: number) => {
        // Disable scrolling events for the ScrollView component
        setFileScale(1)
        setRotateDeg(0)
        setFileWidth(screenWidth - PADDING)
        setScrollEnabled(false)
        setPageIndex(index)
    }

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Enable scrolling events for the ScrollView component
        setScrollEnabled(true)
        const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth)
        setPageIndex(index)
        setFileScale(1)
        setRotateDeg(0)
        pickerRef.current.setValue(pickerData[index])
    }

    const handleScale = () => {
        setFileScale((prevV) => (prevV > 1 ? 1 : 1.2))
    }

    const handleRotate = () => {
        setRotateDeg(rotateDeg + 90)
    }

    const handleNextPage = () => {
        const nextPageIndex = pageIndex + 1
        if (nextPageIndex < docList.length) {
            scrollViewRef.current?.scrollTo({ y: 0, x: screenWidth * nextPageIndex, animated: true })
            handlePageChange(nextPageIndex)
            pickerRef.current.setValue(pickerData[nextPageIndex])
        }
    }

    const handlePrevPage = () => {
        const prevPageIndex = pageIndex - 1
        if (prevPageIndex >= 0) {
            scrollViewRef.current?.scrollTo({ y: 0, x: screenWidth * prevPageIndex, animated: true })
            handlePageChange(prevPageIndex)
            pickerRef.current.setValue(pickerData[prevPageIndex])
        }
    }

    const handleShare = async () => {
        const fileItem = fileList[pageIndex]
        const shareFileName =
            fileItem?.salesDocType && fileItem?.salesDocType !== 'Other'
                ? fileItem?.salesDocType
                : fileItem.salesDocTypeOther
        // const shareFileType = fileItem.fileType === 'pdf' ? 'application/pdf' : `image/${fileItem.fileType}`
        const fullpath = `file://${DocumentDirectoryPath}/${fileItem?.salesDocUrl}`
        if (!fileItem.isFailedSync) {
            const options: any = Platform.select({
                ios: {
                    activityItemSources: [
                        {
                            // For sharing url with custom title.
                            placeholderItem: { type: 'url', content: fullpath },
                            item: {
                                default: { type: 'url', content: fullpath }
                            },
                            subject: {
                                default: shareFileName
                            },
                            linkMetadata: { title: shareFileName, url: fullpath, originalUrl: fullpath }
                        }
                    ]
                }
            })
            Share.open(options)
                .then(() => {})
                .catch(() => {
                    /** for unhandled Promise rejection when cancel share */
                })
        } else {
            Alert.alert('Can not share remote url file')
        }
    }

    const handlePdfLoadError = (url: string) => {
        setFailedLoadFiles((preV) => _.uniq([...preV, url]))
    }

    const renderFailedText = () => {
        return (
            <View style={styles.failedTextCon}>
                <CText>{'No File Available'}</CText>
            </View>
        )
    }

    const renderPDFView = (file: any, index: number) => {
        const calculateWidth = fileWidth > screenWidth && index === pageIndex ? fileWidth : screenWidth - PADDING
        const calculateDeg = index === pageIndex ? rotateDeg : 0
        const calculateScale = index === pageIndex ? fileScale : 1
        return (
            <View
                ref={fileRef}
                key={file.salesDocUrl}
                style={[
                    styles.pdfContainer,
                    { transform: [{ rotate: `${calculateDeg}deg` }, { scale: calculateScale }] }
                ]}
            >
                {!failedLoadFiles.includes(file.salesDocUrl)
                    ? sharepointToken && (
                          <Pdf
                              key={file.salesDocUrl}
                              source={{
                                  // need encode uri when load from remote, or hermes engine will throw error message "unsupported URL"
                                  uri: file.isFailedSync
                                      ? encodeURI(file.fileUrl)
                                      : `file://${DocumentDirectoryPath}/${file?.salesDocUrl}`, // support `file://` uri
                                  cache: true,
                                  headers: file.isFailedSync
                                      ? {
                                            Authorization: `Bearer ${sharepointToken}`
                                        }
                                      : {}
                              }}
                              onLoadComplete={() => {
                                  setFailedLoadFiles((prev) => prev.filter((url) => url !== file.salesDocUrl))
                                  setLoadCompleteUrls((prev) => _.uniq([...prev, file.salesDocUrl]))
                              }}
                              onError={() => handlePdfLoadError(file.salesDocUrl)}
                              style={[
                                  styles.pdf,
                                  {
                                      width: calculateWidth,
                                      transform: [{ rotate: `${calculateDeg}deg` }, { scale: calculateScale }]
                                  }
                              ]}
                          />
                      )
                    : renderFailedText()}
            </View>
        )
    }

    const renderImageView = (file: any, index: number) => {
        const calculateImageWidth = fileWidth > screenWidth && index === pageIndex ? fileWidth : screenWidth

        const calculateDeg = index === pageIndex ? rotateDeg : 0
        const calculateScale = index === pageIndex ? fileScale : 1

        return (
            <View
                ref={fileRef}
                key={file.salesDocUrl}
                style={[
                    styles.imageContainer,
                    { transform: [{ rotate: `${calculateDeg}deg` }, { scale: calculateScale }] }
                ]}
            >
                {sharepointToken !== '' && (
                    <FastImage
                        style={[styles.docImage, { width: calculateImageWidth }]}
                        source={{
                            uri: file.isFailedSync
                                ? file.fileUrl
                                : `file://${DocumentDirectoryPath}/${file?.salesDocUrl}`,
                            headers: file.isFailedSync
                                ? {
                                      Authorization: `Bearer ${sharepointToken}`,
                                      Accept: 'image/*'
                                  }
                                : {},
                            cache: FastImage.cacheControl.web,
                            priority: 'low'
                        }}
                        onLoad={() => {
                            setLoadCompleteUrls((prev) => _.uniq([...prev, file.salesDocUrl]))
                        }}
                        onError={() => {
                            setFailedLoadFiles((preV) => _.uniq([...preV, file.salesDocUrl]))
                        }}
                        resizeMode={'contain'}
                    />
                )}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backIconContainer} onPress={() => navigation.goBack()}>
                    <View style={styles.backIcon} />
                    <CText style={styles.backText}>{t.labels.PBNA_MOBILE_BACK}</CText>
                </TouchableOpacity>
                <PickerTile
                    data={pickerData}
                    label={''}
                    cRef={pickerRef}
                    defValue={pickerDefValue}
                    title={t.labels.PBNA_MOBILE_SALES_SUPPORT_DOCUMENTS}
                    placeholder={''}
                    required={false}
                    disabled={false}
                    noPaddingHorizontal
                    containerStyle={styles.pickerContainerStyle}
                    borderStyle={{}}
                    inputStyle={styles.customPickerTextStyle}
                    onChange={handleChangePickerFile}
                    isFirstItemValuable
                    showCustomIcon
                    numberOfLines={1}
                />
            </View>
            <ScrollView
                ref={scrollViewRef}
                scrollEventThrottle={12}
                horizontal
                pagingEnabled
                style={[commonStyle.flex_1]}
                contentOffset={{ x: fileIndex * screenWidth, y: 0 }} // Set initial scroll position
                pinchGestureEnabled={zoomEnabled} // Enable or disable zooming
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                scrollEnabled={scrollEnabled} // Enable or disable scrolling events
                onMomentumScrollEnd={handleScrollEnd}
                onLayout={handleScrollViewLayout}
            >
                {fileList.map((file: any, index) => {
                    return file.fileType === 'pdf' ? renderPDFView(file, index) : renderImageView(file, index)
                })}
            </ScrollView>
            <View style={styles.bottomBtnWrapper}>
                <TouchableOpacity disabled={pageIndex === 0} onPress={handlePrevPage}>
                    <View style={[styles.iconToPREV, { borderColor: pageIndex !== 0 ? '#0A7AFF' : '#D3D3D3' }]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}>
                    <ShareIcon fill={'#0A7AFF'} width={25} height={25} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleScale}>
                    {fileScale === 1 ? (
                        <ZoomInIcon fill={'#0A7AFF'} width={25} height={25} />
                    ) : (
                        <ZoomOutIcon fill={'#0A7AFF'} width={25} height={25} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRotate}>
                    <RotateIcon fill={'#0A7AFF'} width={25} height={25} />
                </TouchableOpacity>
                <TouchableOpacity disabled={pageIndex === fileList.length - 1} onPress={handleNextPage}>
                    <View
                        style={[
                            styles.iconToNext,
                            { borderColor: pageIndex !== docList.length - 1 ? '#0A7AFF' : '#D3D3D3' }
                        ]}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default SalesDocuments
