import React, { useState, useRef } from 'react'
import {
    StyleSheet,
    View,
    ImageBackground,
    Modal,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    TextInput
} from 'react-native'
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas'
import VisitCard from './VisitCard'
import 'moment-timezone'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import Utils from '../../common/DateTimeUtils'
import CText from '../../../common/components/CText'
import { CommonParam } from '../../../common/CommonParam'
import { SoupService } from '../../service/SoupService'
import BreadcrumbsService from '../../service/BreadcrumbsService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CheckBox } from 'react-native-elements'
import { restDataCommonCall } from '../../api/SyncUtils'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { Constants } from '../../../common/Constants'
import { calculateServiceTime, getEvents } from '../../utils/MerchandiserUtils'
import SignatureBottomBtn from './SignatureBottomBtn'
import { CommonLabel } from '../../enums/CommonLabel'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import AutoRefreshOfSchedule from './AutoRefreshOfSchedule'
import { isTrueInDB } from '../../utils/CommonUtils'
import { recordAMASLogs } from '../../service/AMASService'
import { updateAssessmentTask } from '../../service/AssessmentTaskService'
import { todayDateWithTimeZone } from '../../utils/TimeZoneUtils'
import { cancelDurationAlert } from './MyVisitTab/InAppNoti'
import { rebuildObjectDepth } from '../../utils/SoupUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { redefinePositionCoords } from './VisitDetail'
import { storeClassLog } from '../../../common/utils/LogUtils'
const { width } = Dimensions.get('window')

interface SignatureProps {
    route
    navigation
}

const styles = StyleSheet.create({
    container: {
        paddingRight: Utils.isTablet ? 80 : 22,
        paddingLeft: Utils.isTablet ? 80 : 22,
        height: 350
    },
    signPad: {
        backgroundColor: '#F2F4F7',
        height: 300,
        borderWidth: 3,
        borderColor: '#F2F4F7',
        margin: 22
    },
    done: {
        borderWidth: 3,
        borderColor: '#FFFFFF'
    },
    active: {
        color: 'rgb(0, 162, 217)'
    },

    containerStyle: {
        height: 59,
        width: '100%',
        borderColor: '#FFF',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignContent: 'center',
        bottom: 0,
        position: 'absolute'
    },
    shadow: {
        backgroundColor: '#FFF',
        color: '#6217B9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        elevation: 1,
        borderColor: 'rgba(0, 0, 0, 0.14)',
        borderWidth: 1,
        alignItems: 'center',
        borderRadius: 0
    },

    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 12,
        width: '100%'
    },
    header: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        top: 70,
        textAlign: 'center'
    },
    headerCard: {
        marginTop: -180
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        position: 'relative'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 220,
        width: 200
    },
    icon: {
        marginLeft: 5,
        width: 15,
        height: 16
    },
    modalText: {
        marginTop: 15,
        marginBottom: 15,
        color: '#000',
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center'
    },

    clear: {
        backgroundColor: '#F2F4F7',
        color: 'rgb(211, 211, 211)',
        fontSize: 16,
        fontWeight: '700'
    },
    name: {
        marginLeft: 22,
        color: 'rgb(86, 86, 86)',
        backgroundColor: '#F2F4F7'
    },
    inputBoxContainer: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '400',
        marginLeft: 13,
        marginBottom: 20,
        padding: 9,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    sortOption: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 69,
        paddingLeft: 22,
        paddingRight: 22,
        backgroundColor: '#FFF'
    },
    checkBoxStyle: {
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        paddingBottom: 22,
        paddingTop: 12,
        borderWidth: 0,
        borderBottomColor: '#D3D3D3',
        padding: 0,
        marginLeft: 0,
        width: '100%'
    },
    clearButton: {
        flexDirection: 'row',
        marginLeft: 22,
        marginTop: 16,
        alignItems: 'center'
    },
    signatureColor: {
        backgroundColor: '#f3f4f7'
    },
    successIconSize: {
        width: 56,
        height: 53
    },
    skipSignText: {
        marginTop: 25,
        marginBottom: 15
    },
    signPadStyle: {
        position: 'absolute',
        bottom: 0,
        width: 0,
        height: 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#F2F4F7',
        borderBottomWidth: 15
    }
})

const signPadBorder = () => {
    const elements = []
    const tWidth = width / 14
    for (let i = 0; i < 14; i++) {
        elements.push(
            <View
                style={[
                    styles.signPadStyle,
                    {
                        left: i * tWidth,
                        borderLeftWidth: tWidth / 2,
                        borderRightWidth: tWidth / 2
                    }
                ]}
                key={i}
            />
        )
    }
    return elements
}

const style = `
    .m-signature-pad {
        background-color: transparent;
        box-shadow: 0 !important;
        border: 0 !important;

        position: absolute;
        width: 700px;
        height: 600px;
        top: 50%;
        left: 50%;
        margin-left: -350px;
        margin-top: -300px;
    }
    body {
        background: #F2F4F7;
    }
    body::after {
        content: "SIGN HERE";
        position: absolute;
        color: #FFF;
        font-size: 62px;
        text-align: center;
        top: 80px;
        left: 50%;
        font-weight:900;
        transform: translateX(-50%);
        z-index:-1
    }
    .m-signature-pad--body {
        border: 0 !important;
    }
    .m-signature-pad--body
    canvas {
        box-shadow: 0;
    }
    .m-signature-pad--footer
    {
        display: none;
    }`

const getVisit = (visit) => {
    return SoupService.retrieveDataFromSoup('Visit', {}, [], null, [
        `
      WHERE {Visit:_soupEntryId} = "${visit._soupEntryId}" OR {Visit:Id} = "${visit.Id}" 
      LIMIT 1
    `
    ])
}

const getVisitId = (visit) => {
    return visit.id || visit.Id
}

const checkIsisDisabled = (visit) => {
    const date = todayDateWithTimeZone(true)
    return (
        date !== visit.Planned_Date__c.split('T')[0] ||
        CommonParam.shiftStatus !== 'started' ||
        (CommonParam.visitStatus._soupEntryId && CommonParam.visitStatus._soupEntryId !== visit._soupEntryId) ||
        visit.status === 'Complete'
    )
}

const getObj = (visitTmp, vis, geofenceStatus) => {
    const checkInCoords = redefinePositionCoords(
        visitTmp.Check_In_Location__latitude__s,
        visitTmp.Check_In_Location__longitude__s
    )
    const checkOutCoords = redefinePositionCoords(
        visitTmp.Check_Out_Location__latitude__s,
        visitTmp.Check_Out_Location__longitude__s
    )
    return {
        ActualVisitStartTime: visitTmp.ActualVisitStartTime,
        Check_In_Location__latitude__s: checkInCoords.latitude,
        Check_In_Location__longitude__s: checkInCoords.longitude,
        Status__c: visitTmp.Status__c,
        ActualVisitEndTime: visitTmp.ActualVisitEndTime,
        Actual_Duration_Minutes__c: visitTmp.Actual_Duration_Minutes__c,
        Check_Out_Location_Flag__c: !!geofenceStatus,
        AMAS_Compliant__c:
            isTrueInDB(visitTmp.Check_In_Location_Flag__c) ||
            isTrueInDB(visitTmp.AMAS_Compliant__c) ||
            !!geofenceStatus,
        Check_Out_Location__latitude__s: checkOutCoords.latitude,
        Check_Out_Location__longitude__s: checkOutCoords.longitude
    }
}

const getSkipResonText = (isNAChecked, isCOVIDChecked) => {
    let reason = ''
    if (isNAChecked) {
        reason = 'Manager not available'
    } else if (isCOVIDChecked) {
        reason = 'COVID restrictions'
    }
    return reason
}

const getPic = (visit, managerName, isNAChecked, isCOVIDChecked, sig) => {
    return {
        Name: '',
        Type: 'Signature',
        TargetId: getVisitId(visit),
        ManagerName: managerName,
        SkipReason: getSkipResonText(isNAChecked, isCOVIDChecked),
        Data: sig ? sig.replace(Constants.IMAGE_DATA_PREFIX, '') : '',
        IsUploaded: 'false'
    }
}

const SignaturePad = (parentProps: SignatureProps) => {
    const { route, navigation } = parentProps
    const { dropDownRef } = useDropDown()
    const vis = route.params.item
    const inGeofence = route.params.inGeofence
    const checkinPosition = route.params.checkinPosition
    const ref = useRef<SignatureViewRef>(null)
    const [visit, setVisit] = useState(vis)
    const [modalVisible, setModalVisible] = useState(false)
    const [scrollEnabled, setScrollEnabled] = useState(true)
    const [isNAChecked, setIsNAChecked] = useState(false)
    const [isCOVIDChecked, setIsCOVIDChecked] = useState(false)
    const [sig, setSig] = useState(null)
    const [isDisabled, setIsDisabled] = useState(true)
    const [managerName, setManagerName] = useState('')
    let events = []
    const checkCanComplete = (sign?) => {
        const done = (sign || sig) && managerName !== ''
        setIsDisabled(!done)
    }
    const handleSignature = async (signature) => {
        setSig(signature)
        setIsCOVIDChecked(false)
        setIsNAChecked(false)
        checkCanComplete(true)
    }
    const handleEmpty = () => {
        setSig(null)
        setManagerName('')
        checkCanComplete()
    }
    const clear = () => {
        ref.current.clearSignature()
        setSig(null)
        setIsDisabled(!isNAChecked && !isCOVIDChecked)
        setManagerName('')
    }
    const handleEnd = () => {
        setScrollEnabled(true)
        checkCanComplete()
        ref.current?.readSignature()
    }
    const goback = () => {
        navigation.navigate('VisitDetail', { item: visit })
    }
    const checkOutHandler = () => {
        if (isDisabled) {
            return
        }
        if (CommonParam.isSyncing) {
            dropDownRef.current.alertWithType('info', t.labels.PBNA_MOBILE_COPILOT_SYNC_IN_PROGRESS)
        } else {
            setIsDisabled(true)
            try {
                BreadcrumbsService.endVisit()
                cancelDurationAlert()
                let visitTmp = null
                const pic = getPic(visit, managerName, isNAChecked, isCOVIDChecked, sig)
                let picture = null
                SoupService.upsertDataIntoSoup('PictureData', [pic])
                    .then((res) => {
                        picture = res[0]
                        return getVisit(visit)
                    })
                    .then(async (v: any) => {
                        visitTmp = v[0]
                        v[0].Status__c = 'Complete'
                        v[0].ActualVisitEndTime = new Date().toISOString()
                        v[0].Actual_Duration_Minutes__c = calculateServiceTime(
                            v[0],
                            events,
                            new Date(v[0].ActualVisitEndTime),
                            true
                        )
                        try {
                            if (v[0].Check_In_Location__c) {
                                let coords = JSON.parse(v[0].Check_In_Location__c)
                                coords = redefinePositionCoords(coords.latitude || null, coords.longitude || null)
                                v[0].Check_In_Location__latitude__s = coords.latitude
                                v[0].Check_In_Location__longitude__s = coords.longitude
                            }
                        } catch (err) {
                            setIsDisabled(false)
                            storeClassLog(
                                Log.MOBILE_INFO,
                                'MD-EndVisit',
                                `end visit location: ${ErrorUtils.error2String(err)}`
                            )
                        }
                        // Do not delete next line!!! Check_In_Location_Flag__c should be boolean instead of "0" or "1"
                        v[0].Check_In_Location_Flag__c = v[0].Check_In_Location_Flag__c !== '0'
                        v[0].Check_Out_Location_Flag__c = false
                        const coords = redefinePositionCoords(
                            checkinPosition?.latitude || null,
                            checkinPosition?.longitude || null
                        )
                        v[0].Check_Out_Location__latitude__s = coords.latitude
                        v[0].Check_Out_Location__longitude__s = coords.longitude
                        v[0].Check_Out_Location_Flag__c = !!inGeofence
                        recordAMASLogs(
                            'checkOutHandler 409',
                            `${v[0].Check_In_Location_Flag__c}, ${v[0].AMAS_Compliant__c}, ${!!inGeofence}`
                        )
                        v[0].AMAS_Compliant__c =
                            isTrueInDB(v[0].Check_In_Location_Flag__c) ||
                            isTrueInDB(v[0].AMAS_Compliant__c) ||
                            !!inGeofence
                        return SoupService.upsertDataIntoSoup('Visit', [rebuildObjectDepth(v[0])])
                    })
                    .then((res: any) => {
                        visit.status = 'Complete'
                        visit.ActualVisitEndTime = res[0].ActualVisitEndTime
                        CommonParam.visitStatus = {}
                        vis.ActualVisitEndTime = res[0].ActualVisitEndTime
                        vis.Status__c = 'Complete'
                        vis.Planned_Date__c = res[0].Planned_Date__c
                        setVisit(vis)
                        setIsDisabled(checkIsisDisabled(visit))
                        setModalVisible(true)
                        setTimeout(() => {
                            setModalVisible(!modalVisible)
                            navigation.navigate(CommonLabel.MY_VISIT)
                        }, 1000)
                        const obj = getObj(visitTmp, vis, inGeofence)
                        restDataCommonCall(`sobjects/Visit/${getVisitId(visit)}`, 'PATCH', obj)
                            .then(() => {
                                storeClassLog(
                                    Log.MOBILE_INFO,
                                    'checkOutHandler update',
                                    `update visit ${getVisitId(visit)}, body: ${JSON.stringify(obj)}`
                                )
                                updateAssessmentTask(getVisitId(visit), pic.SkipReason, pic.ManagerName, pic.Data)
                                    .then(() => {
                                        return SoupService.retrieveDataFromSoup('PictureData', {}, [], null, [
                                            ' WHERE {PictureData:_soupEntryId}= ' + picture._soupEntryId
                                        ])
                                    })
                                    .then((pics: any) => {
                                        if (pics && pics.length > 0) {
                                            pics[0].IsUploaded = 'true'
                                            return SoupService.upsertDataIntoSoup('PictureData', pics)
                                        }
                                        return Promise.resolve()
                                    })
                                    .then(() => {
                                        AutoRefreshOfSchedule.autoRefresh()
                                    })
                                    .catch((err) => {
                                        storeClassLog(
                                            Log.MOBILE_ERROR,
                                            'updateAssessmentTask',
                                            `upload picture failed: ${ErrorUtils.error2String(err)}`
                                        )
                                        dropDownRef.current.alertWithType(
                                            'error',
                                            'picture upload failed',
                                            ErrorUtils.error2String(err)
                                        )
                                    })
                            })
                            .catch((err) => {
                                CommonParam.pendingSync.visit = true
                                storeClassLog(
                                    Log.MOBILE_ERROR,
                                    'MD-EndVisit',
                                    `end visit failed-SF: ${ErrorUtils.error2String(err)}`
                                )
                                AsyncStorage.setItem('pendingSyncItems', JSON.stringify(CommonParam.pendingSync))
                                dropDownRef.current.alertWithType(
                                    'info',
                                    'Network unavailable, data will be synced once internet available',
                                    ErrorUtils.error2String(err)
                                )
                            })
                    })
                    .catch((err) => {
                        setIsDisabled(false)
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'MD-EndVisit',
                            `end visit failed-local: ${ErrorUtils.error2String(err)}`
                        )
                    })
            } catch (error) {
                setIsDisabled(false)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    'MD-EndVisit',
                    `end visit failed-local 422: ${ErrorUtils.error2String(error)}`
                )
            }
        }
    }
    getEvents(vis).then((res) => {
        events = res
    })
    return (
        <View style={[styles.signatureColor, commonStyle.flex_1]}>
            <KeyboardAvoidingView behavior={'height'} style={[styles.signatureColor, commonStyle.flex_1]}>
                <Modal
                    animationType="fade"
                    transparent
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible)
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Image
                                style={styles.successIconSize}
                                source={require('../../../../assets/image/icon-success.png')}
                            />
                            <CText style={styles.modalText}>{t.labels.PBNA_MOBILE_VISIT_COMPLETED_MSG}</CText>
                        </View>
                    </View>
                </Modal>
                <ImageBackground
                    source={require('../../../../assets/image/PATTERN-BLUE-BG-IMG.png')}
                    resizeMode="cover"
                    style={[styles.container]}
                >
                    <View>
                        <CText style={styles.header}>{t.labels.PBNA_MOBILE_SERVICE_COMPLETED}</CText>
                    </View>
                    {signPadBorder()}
                </ImageBackground>
                <View>
                    <View style={styles.headerCard}>
                        <VisitCard
                            navigation={navigation}
                            item={visit}
                            withOutIcon
                            isVisitList={false}
                            addVisits={false}
                        />
                    </View>
                </View>
                <ScrollView scrollEnabled={scrollEnabled}>
                    <TouchableOpacity onPress={clear} style={styles.clearButton}>
                        <CText style={[styles.clear, sig && styles.active]}>
                            {' '}
                            {t.labels.PBNA_MOBILE_CLEAR.toUpperCase()}{' '}
                        </CText>
                        {sig && (
                            <Image
                                style={styles.icon}
                                source={require('../../../../assets/image/icon-reload-Blue.png')}
                            />
                        )}
                        {!sig && (
                            <Image
                                style={styles.icon}
                                source={require('../../../../assets/image/icon-reload-Grey.png')}
                            />
                        )}
                    </TouchableOpacity>
                    <View style={[styles.signPad, styles.done]}>
                        <SignatureScreen
                            ref={ref}
                            onEnd={handleEnd}
                            onOK={handleSignature}
                            onBegin={() => setScrollEnabled(false)}
                            onEmpty={handleEmpty}
                            webStyle={style}
                        />
                    </View>
                    <CText style={styles.name}>{t.labels.PBNA_MOBILE_STORE_MGR_NAME}</CText>
                    <TextInput
                        style={styles.inputBoxContainer}
                        keyboardAppearance={'light'}
                        returnKeyType={'done'}
                        onChangeText={(value) => {
                            setManagerName(value)
                            if (value === '') {
                                setIsDisabled(true)
                            } else {
                                setIsDisabled(!sig)
                            }
                            setIsNAChecked(false)
                            setIsCOVIDChecked(false)
                        }}
                        value={managerName}
                        allowFontScaling={false}
                        placeholder="Enter Name"
                        maxLength={255}
                    />
                    <View style={styles.sortOption}>
                        <CText style={styles.skipSignText}>{t.labels.PBNA_MOBILE_SKIP_SIGN}</CText>
                        <CheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_MGR_UNAVAIL}</CText>}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            containerStyle={styles.checkBoxStyle}
                            checked={isNAChecked}
                            onPress={() => {
                                if (sig || managerName !== '') {
                                    return
                                }
                                setIsNAChecked(!isNAChecked)
                                setIsCOVIDChecked(false)
                                setIsDisabled(isNAChecked && !sig)
                            }}
                        />
                        <CheckBox
                            title={<CText>{t.labels.PBNA_MOBILE_COVID_RESTRICT}</CText>}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            containerStyle={styles.checkBoxStyle}
                            checked={isCOVIDChecked}
                            onPress={() => {
                                if (sig || managerName !== '') {
                                    return
                                }
                                setIsNAChecked(false)
                                setIsCOVIDChecked(!isCOVIDChecked)
                                setIsDisabled(isCOVIDChecked && !sig)
                            }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <SignatureBottomBtn goback={goback} checkOutHandler={checkOutHandler} isDisabled={isDisabled} />
        </View>
    )
}

export default SignaturePad
