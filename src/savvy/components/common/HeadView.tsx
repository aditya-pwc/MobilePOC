/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-10-19 02:58:20
 * @LastEditTime: 2023-11-23 14:24:35
 * @LastEditors: Yi Li
 */
/**
 * @description CopilotModal Component
 * @author Yi Li
 * @email yi.b.li@pwc.com
 * @date 2021-08-19
 */

import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CommonParam } from '../../../common/CommonParam'
import CText from '../../../common/components/CText'
import { NUMBER_VALUE } from '../../enums/MerchandiserEnums'
import { SoupService } from '../../service/SoupService'
import UserAvatar from './UserAvatar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { getPersonaMap, isPersonaSDL, isPersonaUGM, Persona } from '../../../common/enums/Persona'
import { t } from '../../../common/i18n/t'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { restApexCommonCall } from '../../api/SyncUtils'
import { Log } from '../../../common/enums/Log'
import { getNewWrapString } from '../../utils/CommonUtils'
import { Instrumentation } from '@appdynamics/react-native-agent'
import _ from 'lodash'
import { getStringValue } from '../../utils/LandingUtils'
import { AssetAttributeService } from '../../service/AssetAttributeService'
import { storeClassLog } from '../../../common/utils/LogUtils'
import { SDLHeader } from '../del-sup/deliveries/DelComponents'
import { useIsFocused } from '@react-navigation/native'
import SubTypeModal from '../manager/common/SubTypeModal'
import { getSalesTerritory } from '../../helper/manager/AllManagerMyDayHelper'
import { renderRedDot, needShowRedDot } from './CopilotModal'
import { areContractSubmitted } from '../../utils/SessionUtils'

interface HeadViewProps {
    cRef?
    navigation?
    userInfoView?
    nameView?
    titleStr?
    titleStyle?
    subtitleStyle?
    subtitleStr?
    userInfo?
    imgAvatar?
    userNameText?
    onPress?
    hasLocation?
    isLoading?: boolean
    getIsOpenSwitchPersona?: any
    setSubTypeArray?: any
    subTypeArray?: any
    ugmPersonaTab?: string
    selectedSubType?: any
    setSelectedSubType?: any
    sideBarVisible?: boolean
    needRedDot?: boolean
}
const styles = StyleSheet.create({
    locationText: { color: '#fff', fontSize: 14, marginTop: 10, fontFamily: 'Gotham' },
    logo: { marginRight: 4 },
    personaView: { backgroundColor: '#F2F4F7' },
    titleText: { textAlign: 'center', fontSize: 12, marginTop: 14 },
    scroll: { flexDirection: 'row' },
    itemCon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,
        paddingVertical: 20,
        borderRadius: 12,
        borderWidth: 2
    },
    bottomView: { alignItems: 'center' },
    switchText: { fontSize: 12, fontWeight: 'bold', marginTop: 30, marginBottom: 24 },
    bottomLine: {
        backgroundColor: '#D3D3D3',
        width: 41,
        height: 4,
        borderRadius: 2,
        marginBottom: 12
    },
    blackText: { color: '#000' },
    switchView: { backgroundColor: '#F2F4F7' },
    scrollHeight: { height: 120 },
    blueText: { color: baseStyle.color.tabBlue },
    marginTop_10: {
        marginTop: 10
    },
    territory: {
        flexDirection: 'column'
    },
    avator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    marginTop_35: {
        marginTop: 35
    },
    territoryText: {
        color: '#fff'
    },
    redDot: {
        position: 'absolute',
        bottom: -5,
        right: 22
    }
})
const HeadView: FC<HeadViewProps> = (props: HeadViewProps) => {
    const {
        cRef,
        userInfoView,
        nameView,
        titleStr,
        titleStyle,
        subtitleStyle,
        subtitleStr,
        userInfo,
        imgAvatar,
        userNameText,
        onPress,
        navigation,
        hasLocation,
        isLoading,
        getIsOpenSwitchPersona,
        setSubTypeArray,
        subTypeArray,
        ugmPersonaTab,
        selectedSubType,
        setSelectedSubType,
        sideBarVisible,
        needRedDot
    } = props
    const [switchPersona, setSwitchPersona] = useState(false)
    const [selPersona] = useState(CommonParam.PERSONA__c)
    const [userInfoData, setUserInfo] = useState(userInfo)
    const [personaArr, setPersonaArr] = useState([])
    const [typeModalVisible, setTypeModalVisible] = useState(false)
    const [selectRouteNum, setSelectRouteNum] = useState(0)
    const isFocused = useIsFocused()
    const getRouteNum = () => {
        let num = 0
        subTypeArray?.forEach((subType: any) => {
            if (subType.select) {
                num++
            }
        })
        setSelectRouteNum(num)
    }
    const [showRedDot, setShowRedDot] = useState(false)

    useEffect(() => {
        getRouteNum()
    }, [subTypeArray])

    const onChangeLocation = async () => {
        const isSubmittedContractOK = await areContractSubmitted(
            t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_PRESS_LOCATION
        )
        if (!isSubmittedContractOK) {
            return
        }

        navigation.navigate('LocationList')
    }
    const renderLocation = () => {
        if (!hasLocation) {
            return <View />
        }

        return (
            <TouchableOpacity onPress={() => CommonParam.multiLocation && onChangeLocation()}>
                <CText style={[styles.locationText, switchPersona && styles.blackText]}>
                    {CommonParam.userLocationName}
                    {CommonParam.multiLocation && (
                        <CText style={[styles.logo, switchPersona && styles.blueText]}> {'>'} </CText>
                    )}
                </CText>
            </TouchableOpacity>
        )
    }
    const personaItemPress = async (item) => {
        try {
            if (CommonParam.PERSONA__c === item.persona) {
                return
            }
            Instrumentation.startTimer('Switch Persona')
            const MDSwitchToMM =
                CommonParam.PERSONA__c === Persona.MERCHANDISER && item.persona === Persona.MERCH_MANAGER
            const MMSwitchToSDL =
                CommonParam.PERSONA__c === Persona.MERCH_MANAGER && item.persona === Persona.SALES_DISTRICT_LEADER
            if (MDSwitchToMM || MMSwitchToSDL) {
                // Md may need addition action
                await restApexCommonCall(`getUserAssignPermissions/${CommonParam.userId}&${item.persona}`, 'GET')
            }
            const param = await AsyncStorage.getItem('Persona')
            const persona = JSON.parse(param)
            persona.PERSONA__c = item.persona
            await SoupService.removeStore()
            await AsyncStorage.removeItem('user')
            await AsyncStorage.removeItem('lastModifiedDate')
            await AsyncStorage.removeItem('PlanogramLocal')
            await AssetAttributeService.removeAssetAttributeLastSyncTime()
            await AsyncStorage.setItem('Persona', JSON.stringify(persona))
            CommonParam.isSwitchPersona = true
            Instrumentation.stopTimer('Switch Persona')
            navigation.navigate('LandingSavvy')
        } catch (e) {
            storeClassLog(Log.MOBILE_ERROR, 'personaItemPress', `${getStringValue(e)}`)
        }
    }

    const onClickPersona = (item) => {
        const message = `${t.labels.PBNA_MOBILE_SWITCH_PERSONA_CONFIRM_PREFIX} ${item.title} ${t.labels.PBNA_MOBILE_SWITCH_PERSONA_CONFIRM_SUFFIX}`
        Alert.alert(t.labels.PBNA_MOBILE_R_U_SURE, message, [
            {
                text: t.labels.PBNA_MOBILE_NO
            },
            {
                text: t.labels.PBNA_MOBILE_YES,
                onPress: () => {
                    personaItemPress(item)
                }
            }
        ])
    }

    const handleSwitchPersona = async () => {
        const isSubmittedContractOK = await areContractSubmitted(
            t.labels.PBNA_MOBILE_CONTRACT_NOT_COMMIT_WHEN_SWITCH_PERSONAL
        )
        if (!isSubmittedContractOK) {
            return
        }

        setSwitchPersona(!switchPersona)
        if (!hasLocation || !switchPersona || personaArr.length === 0) {
            getIsOpenSwitchPersona(false)
        }
        getIsOpenSwitchPersona(!switchPersona)
    }

    useImperativeHandle(cRef, () => ({
        pullToRefreshData: () => {
            setUserInfo({})
        }
    }))
    const getPersonaArr = async () => {
        const PersonaMap = getPersonaMap()
        const param = await AsyncStorage.getItem('Persona')
        const persona = JSON.parse(param)
        const tempArr = []
        persona?.setPerson &&
            persona?.setPerson.forEach((item: any) => {
                if (PersonaMap[item.switchPerson]) {
                    tempArr.push(PersonaMap[item.switchPerson])
                }
            })
        setPersonaArr(tempArr)
    }

    const onCancelSubType = () => {
        setTypeModalVisible(!typeModalVisible)
        setSubTypeArray(_.cloneDeep(selectedSubType))
    }

    const checkClick = (index: number) => {
        subTypeArray[index].select = !subTypeArray[index].select
        setSubTypeArray([...subTypeArray])
    }

    const updateVisitSubType = () => {
        setSubTypeArray([...subTypeArray])
        setTypeModalVisible(!typeModalVisible)
        AsyncStorage.setItem('SDLCopilotTerritoryList', JSON.stringify(subTypeArray))
        setSelectedSubType(_.cloneDeep(subTypeArray))
    }

    const showRedDotCB = async () => {
        const flag = await needShowRedDot()
        setShowRedDot(flag)
    }

    useEffect(() => {
        getPersonaArr()
        setUserInfo(userInfo)
    }, [userInfoData])

    useEffect(() => {
        if ((isPersonaSDL() || (isPersonaUGM() && ugmPersonaTab === Persona.SALES_DISTRICT_LEADER)) && !switchPersona) {
            getSalesTerritory(setSubTypeArray, setSelectedSubType)
        }
        isFocused && showRedDotCB()
    }, [isFocused])

    const throttlePress = _.throttle((item) => onClickPersona(item), 1000, { trailing: false })

    const renderPersonaView = () => {
        if (!hasLocation || !switchPersona || personaArr.length === 0) {
            return <View />
        }

        return (
            <View style={styles.personaView}>
                <View style={styles.scrollHeight}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
                        {personaArr.map((item: any, index) => {
                            const isCurrent = CommonParam.PERSONA__c === item.persona
                            const isSelect = selPersona === item.persona
                            const hasBorder = isCurrent || isSelect
                            return (
                                <TouchableOpacity key={item.persona + item.title} onPress={() => throttlePress(item)}>
                                    <View
                                        style={[
                                            styles.itemCon,
                                            {
                                                marginRight: index === personaArr.length - 1 ? 22 : 12,
                                                marginLeft: index === 0 ? 22 : 0,
                                                backgroundColor: isCurrent
                                                    ? baseStyle.color.tabBlue
                                                    : baseStyle.color.white,
                                                borderColor: hasBorder ? baseStyle.color.tabBlue : baseStyle.color.white
                                            }
                                        ]}
                                    >
                                        {isCurrent ? item.selIcon : item.icon}
                                        <CText
                                            style={[
                                                styles.titleText,
                                                { color: isCurrent ? baseStyle.color.white : baseStyle.color.black }
                                            ]}
                                        >
                                            {getNewWrapString(item.title)}
                                        </CText>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
                <View style={styles.bottomView}>
                    <CText
                        style={[
                            styles.switchText,
                            {
                                color:
                                    selPersona !== CommonParam.PERSONA__c
                                        ? baseStyle.color.tabBlue
                                        : baseStyle.color.borderGray
                            }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_SWITCH_VIEW.toUpperCase()}
                    </CText>
                    <View style={styles.bottomLine} />
                </View>
            </View>
        )
    }
    return (
        <View>
            <View style={[userInfoView, switchPersona && styles.switchView]}>
                <View style={nameView}>
                    <CText
                        style={[titleStyle, switchPersona && styles.blackText]}
                        numberOfLines={NUMBER_VALUE.TWO_NUM}
                        ellipsizeMode={'tail'}
                    >
                        {titleStr}
                    </CText>
                    <CText
                        style={[subtitleStyle, switchPersona && styles.blackText]}
                        numberOfLines={NUMBER_VALUE.TWO_NUM}
                        ellipsizeMode={'tail'}
                    >
                        {subtitleStr || t.labels.PBNA_MOBILE_MERCH_MERCHANDISER}
                    </CText>
                    {renderLocation()}
                </View>
                <View style={styles.territory}>
                    <View
                        style={[
                            styles.avator,
                            (isPersonaSDL() || (isPersonaUGM() && ugmPersonaTab === Persona.SALES_DISTRICT_LEADER)) &&
                            !sideBarVisible
                                ? styles.marginTop_35
                                : null
                        ]}
                    >
                        {hasLocation && CommonParam.canSwitchPersona && (
                            <TouchableOpacity onPress={handleSwitchPersona}>
                                {switchPersona ? (
                                    <Image source={ImageSrc.PERSONA_SWITCHING_ON} />
                                ) : (
                                    <Image source={ImageSrc.PERSONA_SWITCHING_OFF} />
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            disabled={isLoading}
                            onPress={() => {
                                onPress && onPress()
                            }}
                            testID="CopilotUserAvatar"
                        >
                            <UserAvatar
                                userStatsId={userInfoData.userStatsId}
                                firstName={userInfoData.FirstName}
                                lastName={userInfoData.LastName}
                                avatarStyle={imgAvatar}
                                userNameText={userNameText}
                            />
                            {needRedDot && showRedDot && <View style={styles.redDot}>{renderRedDot(true)}</View>}
                        </TouchableOpacity>
                    </View>
                    {(isPersonaSDL() || (isPersonaUGM() && ugmPersonaTab === Persona.SALES_DISTRICT_LEADER)) &&
                        !sideBarVisible && (
                            <SDLHeader
                                style={styles.marginTop_10}
                                textStyle={styles.territoryText}
                                setTypeModalVisible={setTypeModalVisible}
                                typeModalVisible={typeModalVisible}
                                selectRouteNum={selectRouteNum}
                            />
                        )}
                </View>
            </View>
            {renderPersonaView()}
            <SubTypeModal
                customTitle={t.labels.PBNA_MOBILE_SELECT_TERRITORY}
                customSubTitle={t.labels.PBNA_MOBILE_SELECT_SUBTITLE}
                subTypeArray={subTypeArray}
                doneTitle={t.labels.PBNA_MOBILE_DONE}
                typeModalVisible={typeModalVisible}
                setTypeModalVisible={setTypeModalVisible}
                onCheckClick={(index) => {
                    checkClick(index)
                }}
                onCancelSubType={() => {
                    onCancelSubType()
                }}
                updateVisitSubType={() => {
                    updateVisitSubType()
                }}
            />
        </View>
    )
}

export default HeadView
