/*
 * @Author: your name
 * @Date: 2021-10-19 02:58:20
 * @LastEditTime: 2022-07-18 02:16:17
 * @LastEditors: Yi Li
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/merchandiser/MeetingBar.tsx
 */
/**
 * @description A bar to show that the user is in lunch.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-03-29
 * @LastModifiedDate 2021-03-29 First Commit
 */
import React, { useEffect, useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import Utils, { formatClock } from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    containBtn: {
        height: 44,
        marginBottom: 20,
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22
    },
    containerView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#FFC409'
    },
    containBlue: {
        backgroundColor: '#00A2D9'
    },
    containGray: {
        backgroundColor: '#F2F4F7'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase',
        fontSize: 12,
        color: '#000'
    },
    timeStyle: {
        marginRight: 20,
        lineHeight: 16,
        fontFamily: 'Gotham',
        fontSize: 12
    },
    completeTextStyle: {
        color: '#565656'
    },
    unStartText: {
        color: '#FFFFFF'
    },
    iconClock: {
        width: 16,
        height: 16,
        marginLeft: 20
    },
    checkCircle: {
        width: 22,
        height: 22,
        marginRight: 10
    },
    width1: {
        width: 1
    }
})
export enum BAR_TYPE {
    UNSTART = 'unStart',
    INPROGRESS = 'inProgress',
    FINISH = 'finish'
}
interface MeetingBarPros {
    endMeeting
    d
    heightFromProps?
    barStatus?
    eventDisable?
}

const MeetingBar = (props: MeetingBarPros) => {
    const { endMeeting, d, heightFromProps, barStatus, eventDisable } = props
    const [containerStyles, setContainerStyles] = useState([styles.containerView])
    const [btnTitle, setBtnTitle] = useState('')
    const [titStyle, setTitleStyle] = useState([styles.titleStyle])
    const handlePress = () => {
        endMeeting()
    }
    const getBarStyle = (barSta, eventDis) => {
        let conStyle
        let resTitle = ''
        let titleColor = [styles.titleStyle]
        if (barSta === BAR_TYPE.UNSTART) {
            conStyle = [styles.containerView, eventDis ? styles.containGray : styles.containBlue]
            resTitle = t.labels.PBNA_MOBILE_START_MEETING
            titleColor = [styles.titleStyle, eventDis ? styles.completeTextStyle : styles.unStartText]
        } else if (barSta === BAR_TYPE.FINISH) {
            conStyle = [styles.containerView, styles.containGray]
            resTitle = t.labels.PBNA_MOBILE_COMPLETED.toUpperCase()
            titleColor = [styles.titleStyle, styles.completeTextStyle]
        } else {
            conStyle = [styles.containerView, heightFromProps]
            resTitle = t.labels.PBNA_MOBILE_END_MEETING
        }
        setContainerStyles(conStyle)
        setBtnTitle(resTitle)
        setTitleStyle(titleColor)
    }
    useEffect(() => {
        getBarStyle(barStatus, eventDisable)
    }, [barStatus, eventDisable])
    return (
        <View>
            <TouchableOpacity style={styles.containBtn} onPress={handlePress}>
                <View style={containerStyles}>
                    {(barStatus === BAR_TYPE.UNSTART || barStatus === BAR_TYPE.FINISH) && (
                        <View style={styles.width1} />
                    )}
                    {barStatus !== BAR_TYPE.UNSTART && barStatus !== BAR_TYPE.FINISH && (
                        <Image source={require('../../../../assets/image/ios-clock.png')} style={styles.iconClock} />
                    )}
                    <View style={styles.titleContainer}>
                        {barStatus === BAR_TYPE.FINISH && (
                            <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.checkCircle} />
                        )}
                        <CText style={titStyle}>{btnTitle}</CText>
                    </View>

                    {barStatus !== BAR_TYPE.UNSTART && barStatus !== BAR_TYPE.FINISH && (
                        <CText style={styles.timeStyle}>
                            {formatClock({
                                hour: Math.floor(d >= 60 ? d / 60 : 0),
                                min: d % 60
                            })}
                        </CText>
                    )}
                    {(barStatus === BAR_TYPE.UNSTART || barStatus === BAR_TYPE.FINISH) && (
                        <View style={styles.width1} />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default MeetingBar
