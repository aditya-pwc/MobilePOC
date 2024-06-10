import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import { isPersonaPSR, Persona } from '../../../common/enums/Persona'
import { t } from '../../../common/i18n/t'
import { Constants } from '../../../common/Constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import StarOutlined from '../../../../assets/image/icon-star-outlined.svg'
import { useSelector } from 'react-redux'
import CoPilotStyle from '../../styles/CoPilotStyle'
import { onPSRSwitchLocation, onPSRSwitchRoute, onPSRLogout } from '../../../orderade/utils/VisitUtils'
import { useQuickLinkData } from '../../hooks/CoPilotHooks'
import {
    CopilotScreenBase,
    CopilotScreenBaseHandle
} from '../../../common/components/buz/copilot-base/CopilotScreenBase'
import { CommonApi } from '../../../common/api/CommonApi'
import { InnovationDistributionPanelWithPersonaCheck } from '../../components/rep/customer/metrics/InnovationDistributionPanel'
import ReassignResultModal from '../../components/manager/common/ReassignResultModal'
import { areContractSubmitted, logoutWithClearingDatabase } from '../../utils/SessionUtils'
import { getNewWrapString } from '../../utils/CommonUtils'
import { useSyncPressHandler } from '../../hooks/SyncHooks'
import { useSidePanelOptions } from '../../hooks/SidePanelHooks'
import { FsrTaskList } from '../../components/rep/FsrTaskList'
import { FsmDashboardWithPersonaCheck } from '../../components/rep/FsmDashboard'
import { CrmaDashboardWithPersonaCheck } from '../../components/rep/CrmaDashboard'
import { FsrDashboardWithPersonaCheck } from '../../components/rep/FsrDashboard'
import { useUserAvatarRefresh } from '../../hooks/UserHooks'
import { formatWithTimeZone } from '../../utils/TimeZoneUtils'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import { appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { useIsFocused } from '@react-navigation/native'
import _ from 'lodash'

const styles = CoPilotStyle

interface CoPilotScreenProps {
    navigation: any
}

interface ExtraItemsProps {
    cRef: any
    navigation: any
    psrUserRoute: {
        displayName: string
    }
}

const ExtraItems: FC<ExtraItemsProps> = (props: ExtraItemsProps) => {
    const { cRef, navigation, psrUserRoute } = props
    const [switchLocSuc, setSwitchLocSuc] = useState(false)
    const [switchRouteSuc, setSwitchRouteSuc] = useState(false)

    useImperativeHandle(cRef, () => ({
        showSwitchLocSuc: () => {
            setSwitchLocSuc(true)
        },
        showSwitchRouteSuc: () => {
            setSwitchRouteSuc(true)
        }
    }))

    return (
        <>
            <ReassignResultModal
                navigation={navigation}
                isLocationSwitchSuc
                switchSucMsg={
                    getNewWrapString(t.labels.PBNA_MOBILE_DELIVERIES_SWITCH_LOCATION_SUC_MSG) +
                    ' ' +
                    CommonParam.userLocationName
                }
                modalVisible={switchLocSuc}
                setModalVisible={setSwitchLocSuc}
            />
            <ReassignResultModal
                navigation={navigation}
                isLocationSwitchSuc
                switchSucMsg={
                    getNewWrapString(t.labels.PBNA_MOBILE_DELIVERIES_SWITCH_ROUTE_SUC_MSG) +
                    ' ' +
                    psrUserRoute.displayName
                }
                modalVisible={switchRouteSuc}
                setModalVisible={setSwitchRouteSuc}
            />
        </>
    )
}

const CoPilotScreen: FC<CoPilotScreenProps> = (props: CoPilotScreenProps) => {
    const { navigation } = props
    const refreshTimes = useSelector((state: any) => state.leadReducer.refreshKpiBarReducer.refreshTimes)
    const quickLinkData = useQuickLinkData()
    const [hasMultiLoc, setHasMultiLoc] = useState(true)
    const initialRouteInfo = {
        displayName: '',
        User__r: { GPID__c: '' }
    }
    const [psrUserRoute, setPSRUserRoute] = useState(initialRouteInfo)
    const copilotScreenBaseRef = useRef<CopilotScreenBaseHandle>(null)
    const extraItems = useRef(null)
    const refreshFlag = useUserAvatarRefresh()
    const isFocused = useIsFocused()
    const [userLocationName, setUserLocationName] = useState(
        CommonParam.userLocationName || t.labels.PBNA_MOBILE_SELECT_LOCATION
    )

    useEffect(() => {
        if (CommonParam.PERSONA__c === Persona.PSR) {
            setTimeout(() => {
                if (CommonParam.isSwitchLocation) {
                    CommonParam.isSwitchLocation = false
                    extraItems.current?.showSwitchLocSuc()
                }
            }, Constants.ONE_SECOND_DELAY)
            setTimeout(() => {
                if (CommonParam.isSwitchRoute) {
                    CommonParam.isSwitchRoute = false
                    extraItems.current?.showSwitchRouteSuc()
                }
            }, Constants.ONE_SECOND_DELAY)
            if (
                CommonParam.locationArr.length < 2 &&
                (CommonParam.locationArr.length !== 1 || CommonParam.userLocationName !== '')
            ) {
                setHasMultiLoc(false)
            }
        }
        if (CommonParam.isSwitchPersona) {
            CommonParam.isSwitchPersona = false
        }
    }, [isPersonaPSR() && isFocused])

    useEffect(() => {
        CommonParam.userLocationName !== userLocationName &&
            setUserLocationName(CommonParam.userLocationName || t.labels.PBNA_MOBILE_SELECT_LOCATION)
        if (isPersonaPSR() && isFocused) {
            AsyncStorage.getItem('psrUserRoute').then((res) => {
                if (_.isEmpty(res)) {
                    setPSRUserRoute(initialRouteInfo)
                } else {
                    setPSRUserRoute(JSON.parse(res))
                }
            })
        }
    }, [isFocused])

    const onSwitchLocation = async () => {
        const isSubmittedContractOK = await areContractSubmitted(
            t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_PRESS_LOCATION
        )
        if (!isSubmittedContractOK) {
            return
        }
        // only when there are multiple locations and order in progress  or visit, it will display popup
        if (CommonParam.locationArr.length > 1) {
            const allowSwitchLocation = await onPSRSwitchLocation()
            if (!allowSwitchLocation) {
                return
            }
        }
        if (isPersonaPSR()) {
            navigation.navigate('LocationList')
        } else {
            hasMultiLoc && navigation.navigate('LocationList')
        }
    }

    const renderPSRLocation = () => {
        if (!isPersonaPSR()) {
            return
        }
        return (
            <TouchableOpacity
                testID="PSRLocation"
                accessible={false}
                style={styles.switchLocAndRouteBtn}
                onPress={onSwitchLocation}
            >
                <CText style={styles.locationText}>
                    {userLocationName}
                    {(isPersonaPSR() || hasMultiLoc) && <CText> {'>'} </CText>}
                </CText>
            </TouchableOpacity>
        )
    }

    const onSwitchRoute = async () => {
        const allowSwitchRoute = await onPSRSwitchRoute()
        if (!allowSwitchRoute) {
            return
        }
        navigation.navigate('LocationList', {
            listType: 'Route'
        })
    }

    const renderPSRRoute = () => {
        if (!isPersonaPSR()) {
            return
        }
        return (
            <TouchableOpacity
                testID="PSRRoute"
                accessible={false}
                style={[styles.switchLocAndRouteBtn, styles.switchLocAndRouteBtnRight]}
                onPress={onSwitchRoute}
                disabled={!CommonParam.userLocationName}
            >
                <CText style={[styles.locationText, !CommonParam.userLocationName && { color: '#ccc' }]}>
                    {psrUserRoute.displayName || t.labels.PBNA_MOBILE_ATC_SELECT_ROUTE}
                    {psrUserRoute?.User__r?.GPID__c === CommonParam.GPID__c && (
                        <StarOutlined style={styles.starIconStyle} />
                    )}
                    <CText> {'>'} </CText>
                </CText>
            </TouchableOpacity>
        )
    }
    const sidePanelOptions = useSidePanelOptions(navigation, copilotScreenBaseRef)
    const onSyncPress = useSyncPressHandler(navigation, copilotScreenBaseRef)

    const dashboardJSX = (
        <View style={styles.padding5}>
            <FsrDashboardWithPersonaCheck refreshTimes={refreshTimes} />
            <FsmDashboardWithPersonaCheck refreshTimes={refreshTimes} />
            <CrmaDashboardWithPersonaCheck />
            <InnovationDistributionPanelWithPersonaCheck
                navigation={navigation}
                containerStyle={isPersonaPSR() ? { marginTop: 15 } : {}}
            />
        </View>
    )

    const footItemsJSX = CommonParam.PERSONA__c === Persona.FSR ? <FsrTaskList refreshTimes={refreshTimes} /> : <View />

    const extraItemsProps = {
        cRef: extraItems,
        navigation,
        psrUserRoute
    }

    const _logout = async () => {
        if (isPersonaPSR()) {
            const allowLogout = await onPSRLogout(logoutWithClearingDatabase)
            if (!allowLogout) {
                return
            }
        }
        const logMsg = `${CommonParam.GPID__c} logged out of Savvy at ${formatWithTimeZone(
            moment(),
            TIME_FORMAT.YMDTHMS,
            true,
            true
        )}`
        appendLog(Log.MOBILE_INFO, 'orderade:log out app', logMsg)
        logoutWithClearingDatabase()
    }

    return (
        <View style={{ flex: 1 }}>
            <CopilotScreenBase
                url={`${CommonParam.endpoint}/${CommonApi.PBNA_MOBILE_API_APEX_REST}/${CommonApi.PBNA_MOBILE_API_USER_PHOTO}/${CommonParam.userInfo.userStatsId}?${refreshFlag}`}
                firstName={CommonParam.userInfo.FirstName}
                lastName={CommonParam.userInfo.LastName}
                quickLinkData={quickLinkData}
                subTitle={
                    <>
                        {renderPSRLocation()}
                        {renderPSRRoute()}
                    </>
                }
                sidePanelOptions={sidePanelOptions}
                onSyncPress={onSyncPress}
                dashboard={dashboardJSX}
                footList={footItemsJSX}
                extraItems={<ExtraItems {...extraItemsProps} />}
                onLogoutPress={_logout}
                sidePanelExtraItems={<View />}
                cRef={copilotScreenBaseRef}
                needRedDot
            />
        </View>
    )
}

export default CoPilotScreen
