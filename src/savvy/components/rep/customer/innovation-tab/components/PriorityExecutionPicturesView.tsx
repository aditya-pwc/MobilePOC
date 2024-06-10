import React, { useEffect, useState } from 'react'
import { FlatList, Image, Modal, TouchableOpacity, View } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import moment from 'moment'
import { ExecutionPicture, useExecutionPictures } from '../../../../../hooks/InnovationProductHooks'
import CText from '../../../../../../common/components/CText'
import Loading from '../../../../../../common/components/Loading'
import IconButton from '../../../common/IconButton'
import { ImageSrc } from '../../../../../../common/enums/ImageSrc'
import { t } from '../../../../../../common/i18n/t'

interface PriorityExecutionPicturesViewProps {
    storePriorityId: string
}

const useVisibleState = (propVisible: boolean = false) => {
    const [visible, setVisible] = useState(propVisible)

    const show = () => {
        setVisible(true)
    }

    const hide = () => {
        setVisible(false)
    }

    useEffect(() => {
        setVisible(propVisible)
    }, [propVisible])

    return { visible, show, hide }
}

/**
 * A view component with fetching pictures and render them in an image preview ui
 */
const PriorityExecutionPicturesView: React.FC<PriorityExecutionPicturesViewProps> = ({ storePriorityId }) => {
    const { visible: modalVisible, show: showModal, hide: hideModal } = useVisibleState(false)
    const { visible: zoomVisible, show: showZoom, hide: hideZoom } = useVisibleState(false)
    const { isLoading, executionPictures, load: loadPictures } = useExecutionPictures(storePriorityId)
    const [zoomIndex, setZoomIndex] = useState<number>(0)

    return (
        <>
            <IconButton
                type={'default'}
                imageSource={ImageSrc.IMG_CAMERA1}
                title={t.labels.PBNA_MOBILE_VIEW_EXECUTION}
                disabled={isLoading}
                onPress={() => {
                    loadPictures().then(() => {
                        showModal()
                    })
                }}
            />

            <Modal visible={modalVisible} transparent>
                {/* render card list container */}
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#00000099',
                        paddingTop: 200,
                        display: zoomVisible ? 'none' : 'flex'
                    }}
                >
                    {/* render close icon */}
                    <View style={{ alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => hideModal()}>
                            <Image
                                style={{ position: 'absolute', right: 30, bottom: 30, width: 24, height: 24 }}
                                source={ImageSrc.ICON_IOS_CLOSE_OUTLINE_WHITE}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* render cards */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <FlatList
                            contentContainerStyle={{
                                paddingHorizontal: 15
                            }}
                            horizontal
                            scrollEnabled
                            data={executionPictures}
                            renderItem={({ item, index }: { item: ExecutionPicture; index: number }) => {
                                const takenOnDate = moment(item?.createdDate).format('MMM DD, YYYY | hh:mm A')

                                return (
                                    <View
                                        style={{
                                            paddingHorizontal: 5
                                        }}
                                    >
                                        <View
                                            style={{
                                                borderRadius: 8,
                                                paddingTop: 30,
                                                paddingLeft: 40,
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setZoomIndex(index)
                                                    showZoom()
                                                }}
                                            >
                                                <Image
                                                    source={{ uri: item.imageUri }}
                                                    style={{
                                                        width: 275,
                                                        height: 275,
                                                        transform: [{ translateX: -20 }],
                                                        backgroundColor: '#00000011'
                                                    }}
                                                    resizeMode={'cover'}
                                                />
                                            </TouchableOpacity>
                                            <View
                                                style={{
                                                    width: '100%',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    marginTop: 30,
                                                    transform: [{ translateX: -20 }]
                                                }}
                                            >
                                                <CText style={{ fontSize: 12, lineHeight: 24 }}>
                                                    {`${t.labels.PBNA_MOBILE_TAKEN_ON} `}

                                                    <CText style={{ fontWeight: '400' }}>{takenOnDate}</CText>
                                                </CText>
                                                <CText style={{ fontSize: 12, lineHeight: 24 }}>
                                                    {`${t.labels.PBNA_MOBILE_BY} `}
                                                    <CText style={{ fontWeight: '400' }}>{item.userName}</CText>
                                                </CText>
                                                <CText
                                                    style={{
                                                        fontSize: 12,
                                                        lineHeight: 24,
                                                        marginTop: 40,
                                                        marginBottom: 10
                                                    }}
                                                >
                                                    {`${index + 1}/${executionPictures?.length}`}
                                                </CText>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </View>

                {/* render preview with zoom-able */}
                {zoomVisible && (
                    <ImageViewer
                        enableImageZoom
                        enableSwipeDown
                        imageUrls={executionPictures?.map((item) => {
                            return {
                                url: item.imageUri,
                                props: { item }
                            }
                        })}
                        index={zoomIndex}
                        onClick={() => hideZoom()}
                        onCancel={() => hideZoom()}
                    />
                )}
            </Modal>

            {isLoading && <Loading isLoading={isLoading} />}
        </>
    )
}

export default PriorityExecutionPicturesView
