/*
 * @Description: Coming soon page
 * @Author: Howard Xiao
 * @Date: 2023-08-24
 */
import { NavigationProp } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import BlueClear from '../../../../../assets/image/ios-close-circle-outline-blue.svg'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { SafeAreaView } from 'react-native-safe-area-context'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { fetchReleasesNoteData } from './ReleaseNotes'
import Loading from '../../../../common/components/Loading'
import _ from 'lodash'

interface ComingSoonProps {
    navigation?: NavigationProp<any, any>
}

interface UpcomingData {
    title: string
    description: string
    upcomingNotes: {
        upcomingTitle: string
        upcomingDescription: string
        features: Array<{
            feature: string
            persona: Array<string>
            description: string
        }>
    }
}
const initialUpcomingData: UpcomingData = {
    title: '',
    description: '',
    upcomingNotes: {
        upcomingTitle: '',
        upcomingDescription: '',
        features: [
            {
                feature: '',
                persona: [],
                description: ''
            }
        ]
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 22
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 60
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: baseStyle.color.black
    },
    description: {
        fontWeight: '400',
        fontSize: 12,
        color: baseStyle.color.black
    },
    upcomingTitle: {
        fontWeight: '700',
        fontSize: 12,
        color: baseStyle.color.black,
        marginTop: 30
    },
    featureTitle: {
        fontWeight: '700',
        fontSize: 14,
        color: baseStyle.color.black
    },
    marginTop_10: {
        marginTop: 10
    },
    marginTop_15: {
        marginTop: 15
    },
    marginTop_20: {
        marginTop: 20
    },
    marginBottom_20: {
        marginBottom: 20
    },
    personaContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginTop: 10
    },
    personaCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        paddingVertical: 7,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5
    },
    personaText: {
        flexShrink: 1
    },
    containerBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.color.borderGray,
        paddingBottom: 20
    }
})

const ComingSoon = (props: ComingSoonProps) => {
    const { navigation } = props
    const [upcomingData, setUpcomingData] = useState(initialUpcomingData)
    const [isLoading, setIsLoading] = useState(false)

    const fetchUpcomingData = async () => {
        const res = await fetchReleasesNoteData('', setIsLoading)
        setUpcomingData(res)
    }

    useEffect(() => {
        fetchUpcomingData()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <CText style={styles.title}>{upcomingData?.title || t.labels.PBNA_MOBILE_COMING_SOON}</CText>
                <TouchableOpacity
                    hitSlop={commonStyle.hitSlop}
                    onPress={() => {
                        navigation?.goBack()
                    }}
                    activeOpacity={1}
                >
                    <BlueClear height={36} width={36} />
                </TouchableOpacity>
            </View>
            {!_.isEmpty(upcomingData) ? (
                <ScrollView>
                    <CText style={styles.description}>{upcomingData.description}</CText>
                    <CText style={styles.upcomingTitle}>
                        {upcomingData?.upcomingNotes?.upcomingTitle?.toUpperCase()}
                    </CText>
                    <CText style={[styles.description, styles.marginTop_20]}>
                        {upcomingData?.upcomingNotes?.upcomingDescription}
                    </CText>
                    {upcomingData?.upcomingNotes?.features?.map((item, index) => {
                        return (
                            <View
                                key={item.feature}
                                style={[
                                    index !== upcomingData?.upcomingNotes?.features?.length - 1 &&
                                        styles.containerBorderBottom
                                ]}
                            >
                                <CText style={[styles.featureTitle, styles.marginTop_20]}>{item.feature}</CText>
                                <View style={styles.personaContainer}>
                                    {item?.persona?.map((pItem) => {
                                        return (
                                            <View key={pItem} style={styles.personaCell}>
                                                <CText style={[styles.description, styles.personaText]}>{pItem}</CText>
                                            </View>
                                        )
                                    })}
                                    <CText style={[styles.description, styles.marginTop_15]}>{item.description}</CText>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            ) : (
                !isLoading && (
                    <View style={[commonStyle.alignCenter, commonStyle.flex_1]}>
                        <CText style={styles.featureTitle}>{t.labels.PBNA_MOBILE_NO_COMING_SOON}</CText>
                    </View>
                )
            )}
            <Loading isLoading={isLoading} />
        </SafeAreaView>
    )
}

export default ComingSoon
