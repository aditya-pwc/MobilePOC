import React, { useState, useEffect, useRef } from 'react'
import { ScrollView, StyleSheet, View, Dimensions, RefreshControl, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonParam } from '../../../common/CommonParam'
import CopilotModal from '../common/CopilotModal'
import HeadView from '../common/HeadView'
import MyWeek from './MyWeek'
import MyPerformance from './MyPerformance'
import PickerModal from '../manager/common/PickerModal'
import CopilotPattern from '../../../../assets/image/copilot-pattern.svg'
import Orientation from 'react-native-orientation-locker'
import { areContractSubmitted, logout } from '../../utils/SessionUtils'
import { callByPhone, openLink } from '../../../common/utils/LinkUtils'
import QuickLinks from '../../../common/components/QuickLinks'
import { openLocationConsent } from '../../utils/PermissionUtils'
import { CommonApi } from '../../../common/api/CommonApi'
import { t } from '../../../common/i18n/t'
import { BreadcrumbsService } from '../../service/BreadcrumbsService'
import Loading from '../../../common/components/Loading'
import { Log } from '../../../common/enums/Log'
import SyncService from '../../service/SyncService'
import InStoreMapService from '../../service/InStoreMapService'
import CustomLabelUtils from '../../utils/CustomLabelUtils'
import {
    initConfigByPersona,
    retrievePhotos,
    syncDownDeliveryMap,
    syncVLData,
    syncWorkOrders
} from '../../utils/MerchandiserUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { DropDownType } from '../../enums/Manager'
import _ from 'lodash'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { clearDatabase } from '../../utils/InitUtils'
import { storeClassLog } from '../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
interface CopilotPageInterface {
    navigation
}

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: '#00A2D9',
        height: 44,
        width: 120,
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 20
    },
    QLContainerStyle: { marginTop: 22, backgroundColor: '#F2F4F7' },

    buttonStyle: {
        backgroundColor: '#00A2D9'
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent'
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
    nameViewbottom: {
        marginBottom: 17
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
    emptyView: {
        marginBottom: 100,
        marginTop: 100,
        height: 100,
        width: '100%'
    },
    absolute: { position: 'absolute', flex: 1 },
    con: { flex: 1 }
})

const mockDataGen = () => [
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
        phonePress: () => {}
    },
    {
        title: t.labels.PBNA_MOBILE_COPILOT_MY_IDM,
        hasSubtitle: false,
        subtitle: '',
        linkPress: () => {
            openLink(CommonApi.PBNA_MOBILE_URL_COPILOT_MYIDM)
        },
        phonePress: () => {}
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
        phonePress: () => {}
    }
]

const CopilotPage = (parentProps: CopilotPageInterface) => {
    const { navigation } = parentProps
    const copilotModal: any = useRef()
    const myVisitView: any = useRef()
    const headView: any = useRef()
    const performanceView: any = useRef()
    const [userInfo] = useState(CommonParam.userInfo)
    const [weekVisible, setWeekVisible] = useState(false)
    const [modalType, setModalType] = useState(0)
    const [weekTitle, setWeekTitle] = useState('')
    const [performanceTitle, setPerformanceTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isRefresh, setIsRefresh] = useState(false)
    const [isOpenSwitchPersona, setIsOpenSwitchPersona] = useState(false)
    const { dropDownRef } = useDropDown()
    const myWeek = [t.labels.PBNA_MOBILE_THIS_WEEK, t.labels.PBNA_MOBILE_COPILOT_LAST_WEEK]
    const myPerformance = [
        t.labels.PBNA_MOBILE_LAST_CLOSED_DAY,
        t.labels.PBNA_MOBILE_LAST_CLOSED_WEEK,
        t.labels.PBNA_MOBILE_LAST_CLOSED_PERIOD,
        t.labels.PBNA_MOBILE_PERIOD_TO_DATE,
        t.labels.PBNA_MOBILE_WEEK_TO_DATE
    ]

    const mockData = mockDataGen()

    const onClickToHideWeekModal = (contentStr) => {
        setWeekVisible(false)
        if (modalType === 0) {
            myVisitView.current.onChangeSelectWeek(contentStr)
        } else {
            performanceView.current.onChangeSelectPerformance(contentStr)
        }
    }

    const showWeekModalWithType = (type) => {
        setModalType(type)
        setWeekVisible(true)
    }

    const onClickPickModal = (contentStr) => {
        if (modalType === 0) {
            setWeekTitle(contentStr)
        } else {
            setPerformanceTitle(contentStr)
        }
    }

    useEffect(() => {
        openLocationConsent()
        Orientation.lockToPortrait()
    }, [])

    const handleRefresh = () => {
        setIsLoading(true)
        myVisitView.current.pullToRefreshData()
        headView.current.pullToRefreshData()
        performanceView.current.pullToRefreshData().then(() => {
            setIsLoading(false)
        })
    }

    const clearAllData = async () => {
        await clearDatabase()
        await AsyncStorage.removeItem('planogramPath')
        await AsyncStorage.removeItem('PlanogramLocal')
    }

    const syncAllData = async () => {
        await BreadcrumbsService.getBreadcrumbConfig()
        await CustomLabelUtils.getPlanogramLabel(CommonParam.isFirstTimeUser)
        const lastModifiedDate = new Date().toISOString()
        const allModel = CommonParam.objs.filter((model) => model.initQuery).slice(0)
        await Promise.all([
            InStoreMapService.downloadImages(),
            InStoreMapService.downloadPdf(),
            SyncService.syncDownByPersona(allModel)
        ])
        CommonParam.lastModifiedDate = lastModifiedDate
        AsyncStorage.setItem('lastModifiedDate', lastModifiedDate)
        // const filePath = await PlanogramService.downloadAllPdf()
        // await AsyncStorage.setItem('planogramPath', filePath.join(','))
        await retrievePhotos()
        await initConfigByPersona()
    }

    const refreshMerchData = async () => {
        copilotModal.current.hide()
        setTimeout(() => {
            setIsRefresh(true)
        }, 500)

        try {
            await syncVLData()
            await syncWorkOrders()
            await clearAllData()
            await syncAllData()
            await syncDownDeliveryMap()
            setIsRefresh(false)
            dropDownRef.current.alertWithType('success', t.labels.PBNA_MOBILE_REFRESH_DONE, '')
        } catch (error) {
            setIsRefresh(false)
            dropDownRef.current.alertWithType(
                DropDownType.ERROR,
                'Copilot - Merch refreshData',
                ErrorUtils.error2String(error)
            )
            await storeClassLog(
                Log.MOBILE_ERROR,
                'refreshMerchData',
                `refresh merch data error: ${ErrorUtils.error2String(error)}`
            )
        }
    }

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
            style={commonStyle.flex_1}
            refreshControl={
                <RefreshControl
                    title={t.labels.PBNA_MOBILE_LOADING}
                    tintColor={'#00A2D9'}
                    titleColor={'#00A2D9'}
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                />
            }
        >
            <CopilotPattern style={[styles.absolute, isOpenSwitchPersona && { top: 200 }]} />
            <View style={styles.con}>
                <HeadView
                    cRef={headView}
                    hasLocation
                    navigation={navigation}
                    userInfoView={styles.userInfoView}
                    nameView={[styles.nameView, (userInfo.Name || '').length > 28 && styles.nameViewbottom]}
                    titleStr={t.labels.PBNA_MOBILE_COPILOT_HELLO}
                    titleStyle={styles.userName}
                    subtitleStyle={styles.userType}
                    subtitleStr={userInfo.Name + ' !'}
                    userInfo={userInfo}
                    imgAvatar={styles.imgAvatar}
                    userNameText={styles.userNameText}
                    getIsOpenSwitchPersona={getIsOpenSwitchPersona}
                    onPress={() => {
                        copilotModal.current.show()
                    }}
                    needRedDot
                />
                <MyWeek
                    cRef={myVisitView}
                    onPress={() => {
                        showWeekModalWithType(0)
                    }}
                />
                <MyPerformance
                    cRef={performanceView}
                    onPress={() => {
                        showWeekModalWithType(1)
                    }}
                />
                <QuickLinks QLContainerStyle={styles.QLContainerStyle} data={mockData} />
            </View>
            <PickerModal
                DEFAULT_LABEL=""
                modalVisible={weekVisible}
                onOutsideClick={onClickToHideWeekModal}
                onDoneClick={onClickToHideWeekModal}
                optionsList={modalType === 0 ? myWeek : myPerformance}
                modalTitle={_.capitalize(t.labels.PBNA_MOBILE_TIME_INTERVAL)}
                selectedVal={modalType === 0 ? weekTitle : performanceTitle}
                defaultVal={modalType === 0 ? t.labels.PBNA_MOBILE_THIS_WEEK : t.labels.PBNA_MOBILE_WEEK_TO_DATE}
                updateSelectedVal={onClickPickModal}
            />
            <CopilotModal
                cRef={copilotModal}
                navigation={navigation}
                userInfo={userInfo}
                logout={async () => {
                    const isSubmittedContractOK = await areContractSubmitted(
                        t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_LOGOUT
                    )
                    if (!isSubmittedContractOK) {
                        return
                    }
                    if (CommonParam.isSyncing) {
                        dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
                    } else {
                        BreadcrumbsService.logout()
                        logout()
                    }
                }}
                refresh={refreshMerchData}
                type={CommonParam.PERSONA__c}
            />
            <Loading isLoading={isRefresh} />
        </ScrollView>
    )
}

export default CopilotPage
