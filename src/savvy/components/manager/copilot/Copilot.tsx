/*
 * @Author: Yuan Yue
 * @Date: 2021-09-06 17:52:48
 * @LastEditTime: 2023-12-18 18:05:20
 * @LastEditors: Mary Qian
 * @Description: Copilot in Home Page in  MM
 * @FilePath: /Halo_Mobile/src/components/manager/Copilot/Copilot.tsx
 */

import React, { useEffect, useRef, useState } from 'react'
import {
    DeviceEventEmitter,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CopilotPattern from '../../../../../assets/image/Copilot-pattern-MM.svg'
import { CommonParam } from '../../../../common/CommonParam'
import CopilotModal from '../../common/CopilotModal'
import {
    isPersonaManager,
    isPersonaSDL,
    isPersonaUGM,
    isPersonaUGMOrDelSupOrSDL,
    Persona
} from '../../../../common/enums/Persona'
import HeadView from '../../common/HeadView'
import { SoupService } from '../../../service/SoupService'
import SummaryCard from './SummaryCard'
import MMCopilotPerformance from './MMCopilotPerformance'
import { RootStackNavigation } from '../../../app'
import Orientation from 'react-native-orientation-locker'
import PickerModal from '../common/PickerModal'
import QuickLinks from '../../../../common/components/QuickLinks'
import InStoreMapService from '../../../service/InStoreMapService'
import { getUserCityName, initManager, refreshManager } from '../../../utils/MerchManagerUtils'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import Loading from '../../../../common/components/Loading'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { t } from '../../../../common/i18n/t'
import { useIsFocused } from '@react-navigation/native'
import { DropDownType } from '../../../enums/Manager'
import { initDelSup } from '../../../utils/DelSupUtils'
import { initSDL } from '../../../utils/sdlUtils'
import SDLSummaryCard from './SDL/SDLSummaryCard'
import { CommonApi } from '../../../../common/api/CommonApi'
import { callByPhone, openLink } from '../../../../common/utils/LinkUtils'
import CText from '../../../../common/components/CText'
import DelSupSummaryCard from './DelSup/DelSupSummaryCard'
import DelSupCopilotPerformance from './DelSup/DelSupCopilotPerformance'
import { initUGM } from '../../../utils/UGMUtils'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { clearDatabase } from '../../../utils/InitUtils'
import { AssetAttributeService } from '../../../service/AssetAttributeService'
import BaseInstance from '../../../../common/BaseInstance'
import { getPortraitModeScreenWidthAndHeight } from '../../../../common/utils/CommonUtils'
import SDLCopilotPerformance from './SDL/SDLCopilotPerformance'
import _ from 'lodash'
import { compose } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import managerAction from '../../../redux/action/H01_Manager/managerAction'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { NotificationType } from '../../../../common/enums/NotificationType'
import { areContractSubmitted } from '../../../utils/SessionUtils'

interface IProps {
    props?: any
    navigation: RootStackNavigation
}
const screenWidth = getPortraitModeScreenWidthAndHeight().width

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F7'
    },
    QLContainerStyle: {
        marginBottom: 34,
        backgroundColor: '#F2F4F7'
    },
    containerStyle: {
        backgroundColor: '#00A2D9',
        height: 44,
        width: 120,
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 20
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontSize: 12,
        textAlign: 'center',
        width: 100
    },
    userInfoView: {
        height: 153,
        width: screenWidth,
        flexDirection: 'row',
        alignItems: 'center'
    },
    nameView: {
        flex: 1,
        marginTop: 58,
        marginLeft: 22,
        marginBottom: 37,
        width: screenWidth - 22 - 40 - 60,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    userType: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF'
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginLeft: 10,
        marginRight: 22
    },
    userNameText: {
        fontSize: 18
    },
    headView: {
        width: screenWidth,
        marginTop: 30,
        marginBottom: 20
    },
    absolute: {
        position: 'absolute',
        flex: 1,
        transform: [{ scaleX: 1.1 }]
    },
    switchContainer: {
        height: 44,
        backgroundColor: 'white',
        flexDirection: 'row'
    },
    switchButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'white',
        borderBottomWidth: 2
    },
    switchText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A2D9'
    },
    selectedSwitch: {
        borderBottomColor: '#00A2D9',
        borderBottomWidth: 2
    },
    selectedSwitchText: {
        color: 'black'
    },
    disPanel: {
        marginTop: 20,
        marginBottom: 20,
        marginHorizontal: '5%',
        backgroundColor: 'rgba(0, 0, 0, 0.35)'
    }
})

export const getUserStatsFromLocal = (userId: string) => {
    return new Promise((resolve, reject) => {
        SoupService.retrieveDataFromSoup(
            'User',
            {},
            ['Id', 'Name', 'FirstName', 'LastName', 'userStatsId'],
            `
            SELECT
           {User:Id},
           {User:Name},
           {User:FirstName},
           {User:LastName},
           {User_Stats__c:Id}
           FROM {User}
           LEFT JOIN {User_Stats__c} ON {User_Stats__c:User__c} = {User:Id}
           WHERE {User:Id}='${userId}'
           `
        )
            .then((result: any[]) => {
                resolve(result)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const logout = async () => {
    const isSubmittedContractOK = await areContractSubmitted(t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_LOGOUT)
    if (!isSubmittedContractOK) {
        return
    }
    CommonParam.userId = null
    CommonParam.user = null
    CommonParam.lastModifiedDate = new Date('2021-01-01').toISOString()
    if (isPersonaManager()) {
        await clearDatabase()
        const itemsToRemove = [
            'clientInfo',
            'user',
            'lastModifiedDate',
            'isSyncSuccessfully',
            'PlanogramLocal',
            'user_account'
        ]
        await AsyncStorage.multiRemove(itemsToRemove)
        BaseInstance.sfOauthEngine.logout()
    } else {
        const itemsToRemove = ['clientInfo', 'user', 'PlanogramLocal', 'user_account']
        Promise.all([
            AsyncStorage.multiRemove(itemsToRemove),
            AsyncStorage.setItem('lastModifiedDate', new Date().toISOString())
        ]).then(() => {
            BaseInstance.sfOauthEngine.logout()
        })
    }
}

const mockDataGenerator = () => [
    {
        title: t.labels.PBNA_MOBILE_COPILOT_SCHOOX,
        hasSubtitle: false,
        subtitle: '',
        linkPress: () => {
            Linking.canOpenURL(CommonApi.PBNA_MOBILE_SCHOOX_SCHEMES).then((supported) => {
                if (supported) {
                    Linking.openURL(CommonApi.PBNA_MOBILE_SCHOOX_SCHEMES)
                } else {
                    openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_SCHOOX)
                }
            })
        },
        phonePress: () => null
    },
    {
        title: t.labels.PBNA_MOBILE_COPILOT_MY_PEPSICO,
        hasSubtitle: false,
        subtitle: '',
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_MYPEPSICO)
        },
        phonePress: () => null
    },
    {
        title: t.labels.PBNA_MOBILE_COPILOT_MY_IDM,
        hasSubtitle: false,
        subtitle: '',
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_MYIDM)
        },
        phonePress: () => null
    },
    {
        title: t.labels.PBNA_MOBILE_COPILOT_JOB_HURT,
        hasSubtitle: true,
        subtitle: t.labels.PBNA_MOBILE_COPILOT_NUM_JOB_HURT,
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_JOB_HURT)
        },
        phonePress: () => {
            callByPhone(CommonApi.PBNA_MOBILE_NUM_COPILOT_PHONE)
        }
    },
    {
        title: t.labels.PBNA_MOBILE_COPILOT_HELP_DESK,
        hasSubtitle: true,
        subtitle: t.labels.PBNA_MOBILE_COPILOT_PEPSICO,
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_HELP_DESK)
        },
        phonePress: () => {
            callByPhone(CommonApi.PBNA_MOBILE_NUM_COPILOT_PHONE_TWO)
        }
    },
    {
        title: t.labels.PBNA_MOBILE_SAVVY_CENTER,
        hasSubtitle: false,
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_SAVVY_CENTER)
        },
        phonePress: () => null
    }
]

const myPerformanceGen = () => [
    t.labels.PBNA_MOBILE_LAST_CLOSED_DAY,
    t.labels.PBNA_MOBILE_LAST_CLOSED_WEEK,
    t.labels.PBNA_MOBILE_LAST_CLOSED_PERIOD,
    t.labels.PBNA_MOBILE_PERIOD_TO_DATE,
    t.labels.PBNA_MOBILE_WEEK_TO_DATE
]

const SwitchUGMView = (currentUGMTab, setCurrentUGMTab) => (
    <View style={styles.switchContainer}>
        <TouchableOpacity
            onPress={() => setCurrentUGMTab(Persona.SALES_DISTRICT_LEADER)}
            style={[styles.switchButton, currentUGMTab === Persona.SALES_DISTRICT_LEADER && styles.selectedSwitch]}
        >
            <CText
                style={[
                    styles.switchText,
                    currentUGMTab === Persona.SALES_DISTRICT_LEADER && styles.selectedSwitchText
                ]}
            >
                {t.labels.PBNA_MOBILE_SALES}
            </CText>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setCurrentUGMTab(Persona.MERCH_MANAGER)}
            style={[styles.switchButton, currentUGMTab === Persona.MERCH_MANAGER && styles.selectedSwitch]}
        >
            <CText style={[styles.switchText, currentUGMTab === Persona.MERCH_MANAGER && styles.selectedSwitchText]}>
                {t.labels.PBNA_MOBILE_MERCH}
            </CText>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setCurrentUGMTab(Persona.DELIVERY_SUPERVISOR)}
            style={[styles.switchButton, currentUGMTab === Persona.DELIVERY_SUPERVISOR && styles.selectedSwitch]}
        >
            <CText
                style={[styles.switchText, currentUGMTab === Persona.DELIVERY_SUPERVISOR && styles.selectedSwitchText]}
            >
                {t.labels.PBNA_MOBILE_DELIVERY}
            </CText>
        </TouchableOpacity>
    </View>
)

const MMCopilotPage = (parentProps: IProps) => {
    const myPerformance = myPerformanceGen()
    // SDL and UGM to see sales tab need PTD, WTD only, so splice(3,2)
    const SDLDateFilterArr = _.cloneDeep(myPerformance).splice(3, 2)
    const { navigation } = parentProps
    const copilotModal: any = useRef()
    const myVisitView: any = useRef()
    const performanceView: any = useRef()
    const [weekVisible, setWeekVisible] = useState(false)
    const [weekTitle, setWeekTitle] = useState(t.labels.PBNA_MOBILE_WEEK_TO_DATE)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefresh, setIsRefresh] = useState(false)
    const [isOpenSwitchPersona, setIsOpenSwitchPersona] = useState(false)
    const [subTypeArray, setSubTypeArray] = useState([])
    const [selectedSubType, setSelectedSubType] = useState([])
    const [selectedTerritoryId, setSelectedTerritoryId] = useState([])
    const { dropDownRef } = useDropDown()
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const updateIsInCanada = compose(dispatch, managerAction.setIsInCanada)
    const [isInitLoaded, setIsInitLoaded] = useState(false)

    const getSelectedTerritoryId = () => {
        const selectTerritoryId: any = []
        subTypeArray.forEach((territory: any) => {
            if (territory.select) {
                selectTerritoryId.push(territory.items[0].TRouteSales_Parent_Node__c)
            }
        })
        setSelectedTerritoryId(selectTerritoryId)
    }

    const mockData = React.useMemo(() => mockDataGenerator(), []) // Support i18n

    // For UGM Persona to switch tabs
    const [persona, setPersona] = useState(isPersonaUGM() ? Persona.SALES_DISTRICT_LEADER : CommonParam.PERSONA__c)

    const onClickToHideWeekModal = (contentStr) => {
        setWeekTitle(contentStr)
        setWeekVisible(false)
        performanceView.current.onChangeSelectPerformance(contentStr)
    }

    const handleRefresh = async () => {
        setIsLoading(true)
        await myVisitView.current.pullToRefreshData()
        performanceView.current && (await performanceView.current.pullToRefreshData())
        setIsLoading(false)
    }

    const refreshData = async () => {
        copilotModal.current.hide()
        setTimeout(() => setIsRefresh(true), 500)
        await AsyncStorage.removeItem('PlanogramLocal')
        await AssetAttributeService.removeAssetAttributeLastSyncTime()
        await clearDatabase(true)

        async function refreshDataByPersona() {
            const strategies = {
                [Persona.DELIVERY_SUPERVISOR]: initDelSup,
                [Persona.SALES_DISTRICT_LEADER]: initSDL,
                [Persona.MERCH_MANAGER]: async () =>
                    await Promise.all([
                        InStoreMapService.downloadImages(),
                        initManager(),
                        AssetAttributeService.syncAssetAttribute()
                    ]),
                [Persona.UNIT_GENERAL_MANAGER]: initUGM
            }
            try {
                await strategies[CommonParam.PERSONA__c]()
                dropDownRef.current.alertWithType('success', t.labels.PBNA_MOBILE_REFRESH_DONE, '')
            } catch (error) {
                dropDownRef.current.alertWithType(
                    DropDownType.ERROR,
                    'Copilot - refreshData',
                    ErrorUtils.error2String(error)
                )
            } finally {
                setIsRefresh(false)
                DeviceEventEmitter.emit(NotificationType.RECALCULATE_MY_TEAM_AND_CUSTOMER_BADGE)
            }
        }
        refreshDataByPersona()
    }

    useEffect(() => {
        if (isPersonaUGMOrDelSupOrSDL() || !isFocused) {
            copilotModal.current.hide()
            return
        }
        if (!isInitLoaded) {
            !CommonParam.isSwitchLocation && setIsRefresh(true)
            setIsInitLoaded(true)
        }
        refreshManager()
        handleRefresh()
        setTimeout(() => setIsRefresh(false), 500)
    }, [isFocused])

    useEffect(() => {
        getSelectedTerritoryId()
    }, [selectedSubType, isFocused])

    useEffect(() => {
        Orientation.lockToPortrait()
        isPersonaUGM() && getUserCityName(updateIsInCanada)
    }, [])

    useEffect(() => {
        // when UGM switching copilot tab, if there is no weekTitle for SDL tab, default to WTD
        if (persona === Persona.SALES_DISTRICT_LEADER && !SDLDateFilterArr.includes(weekTitle)) {
            setWeekTitle(SDLDateFilterArr[1])
        }
    }, [persona])

    // TBD
    const delSupComponent = () => (
        <>
            <DelSupSummaryCard cRef={myVisitView} />
            <DelSupCopilotPerformance
                navigation={navigation}
                cRef={performanceView}
                weekTitle={weekTitle}
                title={t.labels.PBNA_MOBILE_COPILOT_MY_TEAM_PERFORMANCE}
                onPress={() => {
                    setWeekVisible(true)
                }}
            />
            <QuickLinks QLContainerStyle={styles.QLContainerStyle} data={mockData} />
        </>
    )

    const sdlComponent = () => (
        <>
            <SDLSummaryCard
                cRef={myVisitView}
                subTypeArray={subTypeArray}
                selectedSubType={selectedSubType}
                selectedTerritoryId={selectedTerritoryId}
            />
            <SDLCopilotPerformance
                navigation={navigation}
                cRef={performanceView}
                weekTitle={weekTitle}
                title={t.labels.PBNA_MOBILE_COPILOT_MY_TEAM_PERFORMANCE}
                onPress={() => {
                    setWeekVisible(true)
                }}
                selectedTerritoryId={selectedTerritoryId}
            />
            <QuickLinks QLContainerStyle={styles.QLContainerStyle} data={mockData} />
        </>
    )

    const merchandiserManagerComponent = () => (
        <>
            <SummaryCard cRef={myVisitView} />
            <MMCopilotPerformance
                navigation={navigation}
                cRef={performanceView}
                weekTitle={weekTitle}
                title={t.labels.PBNA_MOBILE_COPILOT_MY_TEAM_PERFORMANCE}
                onPress={() => {
                    setWeekVisible(true)
                }}
            />
            <QuickLinks QLContainerStyle={styles.QLContainerStyle} data={mockData} />
        </>
    )

    const getIsOpenSwitchPersona = async (isOpen: boolean) => {
        const isSubmittedContractOK = await areContractSubmitted(
            t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_SWITCH_PERSONAL
        )
        if (!isSubmittedContractOK) {
            return
        }
        setIsOpenSwitchPersona(isOpen)
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    title={t.labels.PBNA_MOBILE_LOADING}
                    tintColor={baseStyle.color.tabBlue}
                    titleColor={baseStyle.color.tabBlue}
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                />
            }
        >
            <CopilotPattern style={[styles.absolute, isOpenSwitchPersona && { top: 205 }]} />
            <View style={commonStyle.flex_1}>
                <HeadView
                    hasLocation
                    navigation={navigation}
                    userInfoView={styles.userInfoView}
                    nameView={styles.nameView}
                    titleStr={t.labels.PBNA_MOBILE_COPILOT_HELLO}
                    titleStyle={styles.userName}
                    subtitleStyle={styles.userType}
                    subtitleStr={`${CommonParam.userInfo.FirstName} !`}
                    userInfo={CommonParam.userInfo}
                    imgAvatar={styles.imgAvatar}
                    userNameText={styles.userNameText}
                    onPress={() => {
                        copilotModal.current.show()
                    }}
                    isLoading={isRefresh}
                    getIsOpenSwitchPersona={getIsOpenSwitchPersona}
                    setSubTypeArray={setSubTypeArray}
                    subTypeArray={subTypeArray}
                    ugmPersonaTab={persona}
                    setSelectedSubType={setSelectedSubType}
                    selectedSubType={selectedSubType}
                    needRedDot
                />
                {isPersonaUGM() && SwitchUGMView(persona, setPersona)}

                {persona === Persona.DELIVERY_SUPERVISOR && delSupComponent()}
                {persona === Persona.SALES_DISTRICT_LEADER && sdlComponent()}
                {persona === Persona.MERCH_MANAGER && merchandiserManagerComponent()}
            </View>

            <CopilotModal
                cRef={copilotModal}
                navigation={navigation}
                userInfo={CommonParam.userInfo}
                logout={() => logout(dropDownRef)}
                type={CommonParam.PERSONA__c}
                refresh={refreshData}
            />
            <PickerModal
                DEFAULT_LABEL=""
                onOutsideClick={onClickToHideWeekModal}
                onDoneClick={onClickToHideWeekModal}
                modalVisible={weekVisible}
                optionsList={
                    isPersonaSDL() || persona === Persona.SALES_DISTRICT_LEADER ? SDLDateFilterArr : myPerformance
                }
                modalTitle={t.labels.PBNA_MOBILE_TIME_INTERVAL_CAPITALIZE}
                selectedVal={weekTitle}
                defaultVal={t.labels.PBNA_MOBILE_WEEK_TO_DATE}
                updateSelectedVal={setWeekTitle}
            />
            <Loading isLoading={isRefresh} />
        </ScrollView>
    )
}

export default MMCopilotPage
