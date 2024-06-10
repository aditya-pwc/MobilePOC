/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2023-05-18 15:05:03
 * @LastEditTime: 2023-08-16 11:21:52
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 */

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import { formatWithTimeZone } from '../../../utils/TimeZoneUtils'
import NavigationBar from '../NavigationBar'
import BackButton from '../BackButton'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { t } from '../../../../common/i18n/t'
import { CommonApi } from '../../../../common/api/CommonApi'
import BaseInstance from '../../../../common/BaseInstance'
import _ from 'lodash'
import FastImage from 'react-native-fast-image'
import Loading from '../../../../common/components/Loading'
import { Log } from '../../../../common/enums/Log'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'

const styles = StyleSheet.create({
    viewContainer: {
        paddingTop: 56,
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    headerContainer: {
        paddingHorizontal: 22
    },
    notesTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#000',
        fontFamily: 'Gotham'
    },
    scrollViewContainer: {
        paddingHorizontal: 20,
        marginBottom: 40
    },
    newFeatureText: {
        fontSize: 24,
        fontWeight: '700'
    },
    versionView: {
        display: 'flex'
    },
    versionText: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: '300'
    },
    separateView: {
        flex: 1,
        height: 1,
        marginTop: 20,
        backgroundColor: '#fff'
    },
    allFeatureViewContainer: {
        marginTop: 20,
        marginBottom: 50
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000'
    },
    descText: {
        marginTop: 15,
        marginBottom: 10,
        fontSize: 14,
        color: '#000'
    },
    personaTeamView: {
        marginTop: 10
    },
    boldText: {
        fontWeight: '500'
    },
    previewImage: {
        width: 250,
        height: 500,
        borderRadius: 16,
        marginRight: 10,
        marginTop: 15,
        marginBottom: 30
    },
    centerImage: {
        flex: 1,
        alignSelf: 'center'
    },
    previewImageScrollView: {
        flex: 1
    },
    buttonMargin: {
        marginBottom: 15
    },
    centerText: {
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'Gotham'
    },
    subTypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        paddingVertical: 7,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        marginTop: 5
    },
    personaText: {
        flexShrink: 1
    },
    marginRight10: {
        marginRight: 10
    },
    selectedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginTop: 15
    },
    viewMoreText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: '#6C0CC3'
    },
    deleteBtn: {
        height: 44,
        borderWidth: 1,
        borderColor: '#6C0CC3',
        borderRadius: 6,
        ...commonStyle.alignCenter
    },
    marginBottom_10: {
        marginBottom: 10
    },
    marginBottom_40: {
        marginBottom: 40
    },
    fontWeight_0: {
        fontWeight: 'normal'
    },
    summarizeText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginBottom: 20
    },
    comingSoon: {
        fontSize: 12,
        color: '#00A2D9',
        fontWeight: '700'
    }
})

interface ReleaseNotesPageProps {
    navigation?: NavigationProp<any, any>
    route?: RouteProp<any>
}

interface ReleaseNoteFeatureProps {
    title: string
    persona: Array<string>
    team: string
    description: string
    images: string[]
}

interface ReleaseNoteProps {
    version: string
    releaseDate: string
    releaseType: string
    releaseNotes: ReleaseNoteFeatureProps[]
}

export const fetchVersionNumbers = async (setVersionNumbers?: Dispatch<SetStateAction<Array<string>>>) => {
    try {
        const query =
            'SELECT ID, PUBLISH_DATE__c, VERSION_NUMBER__c, VERSION_ORDER__c FROM RELEASENOTES_VERSION__c ORDER BY VERSION_ORDER__C DESC LIMIT 3'
        const path = `query/?q=${query}`
        const res = await BaseInstance.sfHttpClient.callData(path, 'GET')
        const versions: Array<string> = []
        res?.data?.records?.forEach((item: any) => {
            versions.push(item.Version_Number__c)
        })
        setVersionNumbers && setVersionNumbers(versions)
        return versions
    } catch (error) {
        storeClassLog(Log.MOBILE_ERROR, `${fetchVersionNumbers.name}: `, ErrorUtils.error2String(error))
    }
}

export const fetchReleasesNoteData = async (
    version: string,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    isInitialFetch?: boolean
) => {
    try {
        !isInitialFetch && setIsLoading(true)
        const res = await BaseInstance.sfHttpClient.callApex(
            `${CommonApi.PBNA_MOBILE_API_RELEASE_NOTE}`,
            'POST',
            _.isEmpty(version)
                ? {}
                : {
                      strVersion: version
                  }
        )
        setIsLoading(false)
        return JSON.parse(res?.data)
    } catch (error) {
        setIsLoading(false)
        storeClassLog(Log.MOBILE_ERROR, `${fetchReleasesNoteData.name + version}: `, ErrorUtils.error2String(error))
    }
}

const ReleaseNotes = (props: ReleaseNotesPageProps) => {
    const initialReleaseNotes: Array<ReleaseNoteProps> = [
        {
            version: '',
            releaseDate: '',
            releaseType: '',
            releaseNotes: []
        }
    ]
    const { navigation } = props
    const [showMore, setShowMore] = useState(false)
    const [releaseNotesData, setReleaseNotesData] = useState(initialReleaseNotes)
    const [isLoading, setIsLoading] = useState(false)
    const [versionNumbers, setVersionNumbers] = useState(Array<string>)
    const [currentVersion, setCurrentVersion] = useState('')

    const fetchInitialData = async () => {
        setIsLoading(true)
        const versions = await fetchVersionNumbers(setVersionNumbers)
        const latestVersion = versions?.[0] || ''
        setCurrentVersion(latestVersion)
        const releaseData = await fetchReleasesNoteData(latestVersion, setIsLoading, true)
        const localVersion = await AsyncStorage.getItem('localVersion')
        if (_.isEmpty(localVersion) || (localVersion || '') < latestVersion) {
            AsyncStorage.setItem('localVersion', latestVersion)
        }
        if (!_.isEmpty(releaseData)) {
            setReleaseNotesData([releaseData])
        }
    }

    const fetchMoreReleaseData = async (version: string) => {
        setCurrentVersion(version)
        const releaseData = await fetchReleasesNoteData(version, setIsLoading)
        if (!_.isEmpty(releaseData)) {
            setReleaseNotesData([...releaseNotesData, releaseData])
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const renderImages = (imagePath: string[]) => {
        if (!imagePath || imagePath.length === 0) {
            return null
        }

        if (imagePath.length === 1) {
            return (
                <FastImage
                    source={{
                        uri: imagePath[0],
                        cache: FastImage.cacheControl.web
                    }}
                    style={[styles.previewImage, styles.centerImage]}
                />
            )
        }

        if (imagePath.length > 1) {
            return (
                <ScrollView style={styles.previewImageScrollView} horizontal showsHorizontalScrollIndicator={false}>
                    {imagePath.map((path) => {
                        return (
                            <FastImage
                                key={path}
                                source={{
                                    uri: path,
                                    cache: FastImage.cacheControl.web
                                }}
                                style={styles.previewImage}
                            />
                        )
                    })}
                </ScrollView>
            )
        }
    }

    const renderNewFeatureItem = (item: ReleaseNoteFeatureProps) => {
        const personaArr = item?.persona
        return (
            <View key={item.title}>
                <CText style={styles.featureText}>{item.title} </CText>
                <View style={styles.selectedContainer}>
                    {personaArr.map((item) => {
                        return (
                            item && (
                                <View style={styles.subTypeCell} key={`select${item}`}>
                                    <CText style={styles.personaText}>{item}</CText>
                                </View>
                            )
                        )
                    })}
                </View>
                {Boolean(item.description) && <CText style={styles.descText}>{item.description}</CText>}
                {renderImages(item.images)}
            </View>
        )
    }

    const renderOneRelease = (noteObj: any) => {
        return (
            <View style={styles.marginBottom_40}>
                <View style={commonStyle.alignCenter}>
                    <CText style={styles.newFeatureText}>
                        {t.labels.PBNA_MOBILE_VERSION} {noteObj.version}
                    </CText>
                    <CText style={[styles.versionText, styles.marginBottom_40]}>
                        {formatWithTimeZone(noteObj.releaseDate, TIME_FORMAT.MMMDDYYYY, true, false)}
                    </CText>
                </View>
                {noteObj?.releaseNotes?.map((note: any) => {
                    return renderNewFeatureItem(note)
                })}
            </View>
        )
    }

    return (
        <>
            <View style={styles.viewContainer}>
                <View style={styles.headerContainer}>
                    <NavigationBar
                        left={<BackButton navigation={navigation} />}
                        right={
                            <TouchableOpacity
                                hitSlop={commonStyle.hitSlop}
                                onPress={() => navigation?.navigate('ComingSoon')}
                            >
                                <CText style={styles.comingSoon}>
                                    {t.labels.PBNA_MOBILE_COMING_SOON.toUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        }
                        leftStyle={styles.buttonMargin}
                        rightStyle={styles.buttonMargin}
                        title={t.labels.PBNA_MOBILE_WHATS_NEW.toUpperCase()}
                    />
                </View>

                {!_.isEmpty(releaseNotesData?.[0]?.version) ? (
                    <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
                        {renderOneRelease(releaseNotesData[0])}
                        {showMore &&
                            releaseNotesData?.slice(1, releaseNotesData?.length)?.map((item) => {
                                return renderOneRelease(item)
                            })}
                        {!isLoading &&
                            versionNumbers?.length - 1 !== versionNumbers?.indexOf(currentVersion) &&
                            !_.isEmpty(releaseNotesData?.[0]?.version) && (
                                <TouchableOpacity
                                    onPress={async () => {
                                        setShowMore(true)
                                        const currentIndex = versionNumbers?.indexOf(currentVersion)
                                        if (currentIndex < versionNumbers?.length) {
                                            await fetchMoreReleaseData(versionNumbers[currentIndex + 1])
                                        }
                                    }}
                                    style={styles.deleteBtn}
                                >
                                    <CText style={[styles.viewMoreText]}>{t.labels.PBNA_MOBILE_VIEW_MORE}</CText>
                                </TouchableOpacity>
                            )}
                    </ScrollView>
                ) : (
                    !isLoading && (
                        <View style={[commonStyle.alignCenter, commonStyle.flex_1]}>
                            <CText style={styles.featureText}>{t.labels.PBNA_MOBILE_NO_RELEASE_INFO}</CText>
                        </View>
                    )
                )}
            </View>
            <Loading isLoading={isLoading} />
        </>
    )
}

export default ReleaseNotes
