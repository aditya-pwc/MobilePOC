/**
 * @description Screen to show leads.
 * @author Shangmin Dou
 * @date 2021-04-06
 */
import React, { FC, useEffect, useState, useRef } from 'react'
import {
    DeviceEventEmitter,
    Image,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import { SearchBar } from 'react-native-elements'
import CText from '../../../../common/components/CText'
import AllLeadsList from '../../../components/rep/lead/AllLeadsList'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import LeadsKpiBar from '../../../components/rep/lead/LeadsKpiBar'
import { useKpiBar } from '../../../hooks/LeadHooks'
import { DeviceEvent } from '../../../enums/DeviceEvent'
import { Instrumentation } from '@appdynamics/react-native-agent'
import LeadFilterSortForm from '../../../components/rep/lead/LeadFilterSortForm'
import { t } from '../../../../common/i18n/t'
import HeaderCircle from '../../../components/rep/lead/HeaderCircle'
import { useUserCurrentPosition } from '../../../hooks/MapHooks'
import { CommonParam } from '../../../../common/CommonParam'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { isPersonaFSManager } from '../../../../common/enums/Persona'

let MyLeadsList = null

interface LeadScreenProps {
    navigation?: any
    route?: any
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%'
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 22,
        height: '100%',
        justifyContent: 'space-between'
    },
    headerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTextInnerContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTextInnerRightContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    searchBarContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        width: '100%',
        justifyContent: 'space-between'
    },
    searchBarInnerContainer: {
        width: '85%',
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    filterImage: {
        width: 32,
        height: 19,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 8
    },
    flex_175: {
        flex: 1.75
    },
    myLeadText: {
        fontWeight: '900',
        fontSize: 24
    },
    leadListContainer: {
        flex: 5,
        backgroundColor: '#EFF3F6'
    }
})

const LeadScreen: FC<LeadScreenProps> = (props: LeadScreenProps) => {
    const { navigation, route } = props
    const [showAllLeads, setShowAllLeads] = useState(true)
    const [searchAllValue, setSearchAllValue] = useState('')
    const [searchMyValue, setSearchMyValue] = useState('')
    const [searchAllText, setSearchAllText] = useState('')
    const [searchMyText, setSearchMyText] = useState('')
    const [filterAllQuery, setFilterAllQuery] = useState('')
    const [filterMyQuery, setFilterMyQuery] = useState('')
    const filterAllRef = useRef(null)
    const filterMyRef = useRef(null)
    const allLeadRef = useRef(null)
    const myLeadRef = useRef(null)
    const barData = useKpiBar(showAllLeads)
    const isMounted = useRef(null)
    const geolocation = useUserCurrentPosition()

    const requireMyLeadsListComponent = () => {
        if (MyLeadsList === null) {
            MyLeadsList = require('../../../components/rep/lead/MyLeadsList').default
        }
    }

    useEffect(() => {
        if (route?.params?.page) {
            const page = route.params.page
            if (page === 'My Leads') {
                requireMyLeadsListComponent()
                setShowAllLeads(false)
            } else if (page === 'Open Leads') {
                setShowAllLeads(true)
            }
        }
    }, [route.params])

    useEffect(() => {
        isMounted.current = true
        const refreshLeadListEvent = DeviceEventEmitter.addListener(DeviceEvent.REFRESH_LEAD_LIST, () => {})
        return () => {
            refreshLeadListEvent.remove()
            isMounted.current = false
        }
    }, [])

    const handleSearchValueChange = (v) => {
        if (showAllLeads) {
            setSearchAllValue(v)
        } else {
            setSearchMyValue(v)
        }
    }

    const handleClickMyLeads = () => {
        requireMyLeadsListComponent()
        setShowAllLeads(false)
    }

    const handleClickAllLeads = () => {
        setShowAllLeads(true)
    }

    useEffect(() => {
        allLeadRef.current?.scrollToTop()
    }, [filterAllQuery])

    useEffect(() => {
        myLeadRef.current?.scrollToTop()
    }, [filterMyQuery])

    const renderLeadList = () => {
        if (showAllLeads) {
            return (
                <AllLeadsList
                    cRef={allLeadRef}
                    navigation={navigation}
                    searchValue={searchAllText}
                    filterQuery={filterAllQuery}
                />
            )
        }
        return (
            <MyLeadsList
                navigation={navigation}
                cRef={myLeadRef}
                searchValue={searchMyText}
                filterQuery={filterMyQuery}
            />
        )
    }

    const handleSearchLead = () => {
        Instrumentation.reportMetric('FSR/PSR Presses Search Leads', 1)
        if (showAllLeads) {
            setSearchAllText(searchAllValue)
        } else {
            setSearchMyText(searchMyValue)
        }
    }
    const textLength = t.labels.PBNA_MOBILE_MY_LEADS.length + t.labels.PBNA_MOBILE_OPEN_LEADS.length > 19
    const getSearchBarPlaceholder = () => {
        return showAllLeads
            ? t.labels.PBNA_MOBILE_SEARCH_OPEN_LEADS
            : isPersonaFSManager()
            ? t.labels.PBNA_MOBILE_SEARCH_TEAM_LEADS
            : t.labels.PBNA_MOBILE_SEARCH_MY_LEADS
    }
    return (
        <View style={commonStyle.flex_1}>
            <View style={styles.flex_175}>
                <ImageBackground
                    source={ImageSrc.PATTERN_BLUE_BACKGROUND}
                    resizeMode="cover"
                    style={styles.backgroundImage}
                >
                    <SafeAreaView>
                        <View style={styles.headerContainer}>
                            <View style={styles.headerTextContainer}>
                                <View
                                    style={[
                                        { flexDirection: textLength ? 'column' : 'row' },
                                        { justifyContent: 'space-between' }
                                    ]}
                                >
                                    <View style={textLength ? {} : styles.headerTextInnerContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleClickMyLeads()
                                            }}
                                        >
                                            <CText
                                                style={[
                                                    styles.myLeadText,
                                                    {
                                                        color: showAllLeads ? '#00A2D9' : 'white'
                                                    }
                                                ]}
                                            >
                                                {isPersonaFSManager()
                                                    ? t.labels.PBNA_MOBILE_TEAM_LEAD
                                                    : t.labels.PBNA_MOBILE_MY_LEADS}
                                            </CText>
                                        </TouchableOpacity>
                                    </View>
                                    <View
                                        style={[
                                            textLength ? {} : styles.headerTextInnerRightContainer,
                                            { marginRight: '10%' }
                                        ]}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleClickAllLeads()
                                            }}
                                        >
                                            <CText
                                                style={[
                                                    styles.myLeadText,
                                                    {
                                                        color: showAllLeads ? 'white' : '#00A2D9'
                                                    }
                                                ]}
                                            >
                                                {t.labels.PBNA_MOBILE_OPEN_LEADS}
                                            </CText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {!isPersonaFSManager() && (
                                    <HeaderCircle
                                        onPress={() => navigation.navigate('CreateNewLead')}
                                        transform={[{ scale: 1 }, { rotate: '90deg' }]}
                                        color={'white'}
                                    />
                                )}
                            </View>
                            <LeadsKpiBar barData={barData} />

                            <View style={styles.searchBarContainer}>
                                <SearchBar
                                    platform={'ios'}
                                    placeholder={getSearchBarPlaceholder()}
                                    allowFontScaling={false}
                                    clearIcon={null}
                                    showCancel
                                    cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                                    containerStyle={styles.searchBarInnerContainer}
                                    inputContainerStyle={styles.searchBarInputContainer}
                                    inputStyle={styles.searchInputContainer}
                                    value={showAllLeads ? searchAllValue : searchMyValue}
                                    // @ts-ignore
                                    onChangeText={handleSearchValueChange}
                                    onBlur={() => {
                                        handleSearchLead()
                                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} searches lead`, 1)
                                    }}
                                    onCancel={() => {
                                        showAllLeads ? setSearchAllValue('') : setSearchMyValue('')
                                        handleSearchLead()
                                    }}
                                />
                                {showAllLeads && searchAllText === '' && (
                                    <TouchableOpacity
                                        style={
                                            filterAllQuery
                                                ? { borderRadius: 5, backgroundColor: '#2A82E4', marginLeft: 5 }
                                                : { marginLeft: 5 }
                                        }
                                        onPress={() => {
                                            filterAllRef.current.open()
                                        }}
                                    >
                                        <Image
                                            source={
                                                filterAllQuery
                                                    ? require('../../../../../assets/image/icon-sort-white.png')
                                                    : require('../../../../../assets/image/icon-sort.png')
                                            }
                                            style={[styles.filterImage]}
                                        />
                                    </TouchableOpacity>
                                )}
                                {!showAllLeads && searchMyText === '' && (
                                    <TouchableOpacity
                                        disabled={searchMyText !== ''}
                                        style={
                                            filterMyQuery
                                                ? { borderRadius: 5, backgroundColor: '#2A82E4', marginLeft: 5 }
                                                : { marginLeft: 5 }
                                        }
                                        onPress={() => {
                                            filterMyRef.current.open()
                                        }}
                                    >
                                        <Image
                                            source={
                                                filterMyQuery
                                                    ? require('../../../../../assets/image/icon-sort-white.png')
                                                    : require('../../../../../assets/image/icon-sort.png')
                                            }
                                            style={[styles.filterImage]}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
            <View style={styles.leadListContainer}>{renderLeadList()}</View>
            <LeadFilterSortForm
                cRef={filterAllRef}
                onApply={(q) => {
                    setFilterAllQuery(q)
                }}
                isAllLead
                geolocation={geolocation}
            />
            <LeadFilterSortForm
                cRef={filterMyRef}
                onApply={(q) => {
                    setFilterMyQuery(q)
                }}
                isAllLead={false}
                geolocation={geolocation}
            />
        </View>
    )
}

export default LeadScreen
