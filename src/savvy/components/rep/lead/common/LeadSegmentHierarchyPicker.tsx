/**
 * @description Component to create leads.
 * @author Qiulin Deng
 * @date 2021-05-24
 * @Lase
 */
import React, { useState, useRef, useImperativeHandle } from 'react'
import { View } from 'react-native'
import PickerTile from './PickerTile'
import { t } from '../../../../../common/i18n/t'

interface LeadSegmentHierarchy {
    labels: {
        channelLabel: string
        segmentLabel: string
        subSegmentLabel: string
    }
    lstChannel: any
    mapSegment: any
    mapSubSegment: any
    cRef: any
    noPaddingHorizontal?: boolean
    labelStyle?: any
    defValue?: {
        channel: string
        segment: string
        subsegment: string
    }
    containerStyle?: any
    onChangeValue?: any
}

const getSegmentOptions = (channel, segmentMap) => {
    if (channel === '') {
        return []
    }
    return segmentMap[channel]
}

const getSubSegmentOptions = (segment, subSegmentMap) => {
    if (segment === '') {
        return []
    }
    return subSegmentMap[segment]
}

const setSegmentDisabled = (channel) => {
    return channel === '' || channel === null
}

const setSubSegmentDisabled = (segment) => {
    return segment === '' || segment === null
}

const checkDefaultValue = (defValue) => {
    const resultObj = {
        channel: '',
        segment: '',
        subsegment: ''
    }
    if (defValue) {
        resultObj.channel = defValue.channel
        resultObj.segment = defValue.segment
        resultObj.subsegment = defValue.subsegment
    }
    return resultObj
}

const LeadSegmentHierarchyPicker = (props: LeadSegmentHierarchy) => {
    const {
        labels,
        lstChannel,
        mapSegment,
        mapSubSegment,
        cRef,
        noPaddingHorizontal,
        labelStyle,
        defValue,
        containerStyle,
        onChangeValue
    } = props
    const channelRef = useRef(null)
    const segmentRef = useRef(null)
    const subSegmentRef = useRef(null)
    const defaultValue = checkDefaultValue(defValue)

    const [channel, setChannel] = useState(defaultValue.channel)
    const [segment, setSegment] = useState(defaultValue.segment)
    const [subSegment, setSubSegment] = useState(defaultValue.subsegment)

    useImperativeHandle(cRef, () => ({
        channel,
        segment,
        subSegment,
        reset: () => {
            if (!defValue) {
                setChannel('')
                setSegment('')
                setSubSegment('')
            } else {
                setChannel(defValue.channel)
                setSegment(defValue.segment)
                setSubSegment(defValue.subsegment)
            }
            channelRef.current.reset()
            segmentRef.current.reset()
            subSegmentRef.current.reset()
        }
    }))

    return (
        <View>
            <PickerTile
                data={lstChannel}
                label={labels.channelLabel}
                placeholder={t.labels.PBNA_MOBILE_SELECT}
                title={t.labels.PBNA_MOBILE_CHANNEL.toUpperCase()}
                defValue={channel || ''}
                disabled={false}
                required={false}
                cRef={channelRef}
                labelStyle={labelStyle}
                containerStyle={containerStyle}
                noPaddingHorizontal={noPaddingHorizontal}
                onChange={(channelValue) => {
                    setChannel(channelValue)
                    setSegment('')
                    setSubSegment('')
                    segmentRef.current.resetNull()
                    subSegmentRef.current.resetNull()
                    if (onChangeValue) {
                        onChangeValue({
                            channel: channelValue,
                            segment: '',
                            subSegment: ''
                        })
                    }
                }}
            />
            <PickerTile
                data={getSegmentOptions(channel, mapSegment)}
                label={labels.segmentLabel}
                placeholder={t.labels.PBNA_MOBILE_SELECT}
                title={t.labels.PBNA_MOBILE_SEGMENT.toUpperCase()}
                defValue={segment || ''}
                disabled={setSegmentDisabled(channel)}
                required={false}
                cRef={segmentRef}
                containerStyle={containerStyle}
                noPaddingHorizontal={noPaddingHorizontal}
                labelStyle={labelStyle}
                onChange={(segmentValue) => {
                    setSegment(segmentValue)
                    setSubSegment('')
                    subSegmentRef.current.resetNull()
                    if (onChangeValue) {
                        onChangeValue({
                            channel,
                            segment: segmentValue,
                            subSegment: ''
                        })
                    }
                }}
            />
            <PickerTile
                data={getSubSegmentOptions(segment, mapSubSegment)}
                label={labels.subSegmentLabel}
                placeholder={t.labels.PBNA_MOBILE_SELECT}
                title={t.labels.PBNA_MOBILE_SUB_SEGMENT}
                defValue={subSegment || ''}
                disabled={setSubSegmentDisabled(segment)}
                required={false}
                noPaddingHorizontal={noPaddingHorizontal}
                labelStyle={labelStyle}
                cRef={subSegmentRef}
                containerStyle={containerStyle}
                onChange={(subSegmentValue) => {
                    setSubSegment(subSegmentValue)
                    if (onChangeValue) {
                        onChangeValue({
                            channel,
                            segment,
                            subSegment: subSegmentValue
                        })
                    }
                }}
            />
        </View>
    )
}

export default LeadSegmentHierarchyPicker
