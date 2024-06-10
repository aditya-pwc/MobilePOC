/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2024-01-16 16:01:59
 * @LastEditTime: 2024-03-01 09:58:01
 * @LastEditors: Mary Qian
 */
import React, { useEffect, useState } from 'react'
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Alert,
    DeviceEventEmitter
} from 'react-native'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import _ from 'lodash'
import moment from 'moment'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import CText from '../../../../../../common/components/CText'
import FormBottomButton from '../../../../../../common/components/FormBottomButton'
import { t } from '../../../../../../common/i18n/t'
import { TIME_FORMAT } from '../../../../../../common/enums/TimeFormat'
import { CommonParam } from '../../../../../../common/CommonParam'
import CustomerSvg from '../../../../../../../assets/image/icon-blue-location.svg'
import { GEO_FENCE_TYPE } from './SelectGeoFenceTypeModal'
import { DefaultGeoFence, GeoFenceProps } from './GeoFenceModal'
import { getFormatPhoneForGeoFence } from '../../../lead/common/PhoneNumberInput'
import { restDataCommonCall } from '../../../../../api/SyncUtils'
import { storeClassLog } from '../../../../../../common/utils/LogUtils'
import { Log } from '../../../../../../common/enums/Log'
import { GeoFenceUpdateSuccessEvent, getGeoFenceBody } from './EditGeoFenceHelper'
import { useDropDown } from '../../../../../../common/contexts/DropdownContext'
import { uploadDataToSharePoint } from './SharePointHelper'

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    editContainer: {
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
        paddingHorizontal: 22,
        paddingTop: 55
    },
    titleText: {
        fontSize: 24,
        color: '#000',
        fontWeight: 'bold'
    },
    infoView: {
        marginTop: 35
    },
    informationText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold'
    },
    infoRowView: {
        flexDirection: 'row'
    },
    infoItemView: {
        flex: 1,
        marginTop: 30
    },
    keyText: {
        lineHeight: 15,
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    valueText: {
        marginTop: 9,
        fontSize: 14,
        color: '#000',
        fontWeight: '400'
    },
    pointText: {
        marginTop: 9
    },
    updatePinView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30
    },
    updatePinText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#00A2D9',
        fontWeight: 'bold'
    },
    commentView: {
        marginTop: 30
    },
    commentInput: {
        flexWrap: 'wrap',
        marginTop: 5,
        paddingBottom: 9,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        fontFamily: 'Gotham-Book',
        fontSize: 14,
        color: '#000',
        width: '100%'
    },
    buttonText: {
        fontFamily: 'Gotham',
        fontSize: 12,
        fontWeight: 'bold'
    },
    cancelText: {
        color: '#6C0CC3'
    }
})

interface EditGeoFenceProps {
    navigation: NavigationProp<any>
    route: RouteProp<any>
}

const EditGeoFence = (props: EditGeoFenceProps) => {
    const { route, navigation } = props
    const { type } = route.params || {}

    const accountId = route?.params?.accountId
    const geoFenceData: GeoFenceProps = route?.params?.geoFenceData || DefaultGeoFence
    const newPin = route?.params?.newPin
    const isSubmitEnable = !_.isEmpty(newPin)

    const isSales = GEO_FENCE_TYPE.Sales === type
    const oldPin = isSales ? geoFenceData.salesPin : geoFenceData.deliveryPin
    const title = isSales ? t.labels.PBNA_MOBILE_EDIT_SALES_GEO_FENCE : t.labels.PBNA_MOBILE_EDIT_DEL_GEO_FENCE

    const [comments, setComments] = useState('')
    const [locationInfo, setLocationInfo] = useState<any>({})

    const { dropDownRef } = useDropDown()

    const gotoUpdatePin = () => {
        navigation.navigate('UpdatePin', {
            ...route.params
        })
    }

    const onUpdatePin = () => {
        const title = t.labels.PBNA_MOBILE_REDO_CODE_PIN
        const message = t.labels.PBNA_MOBILE_REDO_ALERT_MSG
        if (newPin) {
            Alert.alert(title, message, [
                {
                    text: t.labels.PBNA_MOBILE_GO_BACK
                },
                {
                    text: t.labels.PBNA_MOBILE_YES_PROCEED,
                    onPress: gotoUpdatePin
                }
            ])
            return
        }

        gotoUpdatePin()
    }

    const onCancel = () => {
        navigation.goBack()
    }

    const onSubmit = async () => {
        const body = await getGeoFenceBody(accountId, newPin, comments, geoFenceData, isSales)

        if (_.isEmpty(body)) {
            dropDownRef?.current?.alertWithType('error', 'Submitted Failed', 'Please sync the data')
            return
        }
        const res = await uploadDataToSharePoint([body])

        if (!_.isEmpty(res?.error)) {
            dropDownRef?.current?.alertWithType('error', 'Submitted Failed', res?.error)
        } else {
            DeviceEventEmitter.emit(GeoFenceUpdateSuccessEvent)
            setTimeout(() => {
                navigation?.goBack()
            }, 500)
        }
    }

    const getLocationInfo = async (locationId: string) => {
        try {
            const locationsRes = await restDataCommonCall(
                `query/?q=SELECT Id, SLS_UNIT_ID__c, SLS_UNIT_NM__c, LOC_ID__c, Tme_Zone_Cde__c
                FROM Route_Sales_Geo__c WHERE SLS_UNIT_ID__c  = '${locationId}'`,
                'GET'
            )

            if (locationsRes?.data?.records?.length > 0) {
                setLocationInfo(locationsRes?.data?.records[0])
            } else {
                storeClassLog(Log.MOBILE_INFO, 'GeoFence - getLocationInfo', 'cannot fetch location info' + locationId)
            }
        } catch (error) {
            storeClassLog(Log.MOBILE_ERROR, 'GeoFence - getLocationInfo', ErrorUtils.error2String(error))
        }
    }

    useEffect(() => {
        const locationID = geoFenceData.retailStore['Account.LOC_PROD_ID__c']
        if (locationID?.length > 0) {
            getLocationInfo(locationID)
        }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={'padding'}>
                <View style={styles.editContainer}>
                    <CText style={styles.titleText}>{title}</CText>

                    <View style={styles.infoView}>
                        <CText style={styles.informationText}>{t.labels.PBNA_MOBILE_CURRENT_INFORMATION}</CText>

                        <View style={styles.infoRowView}>
                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_CURRENT_GEO_CODE}</CText>
                                <CText style={[styles.keyText, styles.pointText]}>
                                    {_.capitalize(t.labels.PBNA_MOBILE_LATITUDE)}{' '}
                                    <CText style={styles.valueText}>
                                        {!oldPin?.latitude ? '-' : parseFloat(oldPin?.latitude).toFixed(6)}
                                    </CText>
                                </CText>
                                <CText style={[styles.keyText, styles.pointText]}>
                                    {_.capitalize(t.labels.PBNA_MOBILE_LONGITUDE)}{' '}
                                    <CText style={styles.valueText}>
                                        {!oldPin?.longitude ? '-' : parseFloat(oldPin?.longitude).toFixed(6)}
                                    </CText>
                                </CText>
                            </View>

                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_REQUESTING_DATE}</CText>
                                <CText style={styles.valueText}>{moment().format(TIME_FORMAT.MMM_DD_YYYY)}</CText>
                            </View>
                        </View>

                        <View style={styles.infoRowView}>
                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_REQUESTED_BY}</CText>
                                <CText style={styles.valueText}>{CommonParam.userName}</CText>
                            </View>

                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_REQUESTOR_PHONE}</CText>
                                <CText style={styles.valueText}>
                                    {getFormatPhoneForGeoFence(CommonParam.MobilePhone || '')}
                                </CText>
                            </View>
                        </View>

                        <View style={styles.infoRowView}>
                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_REQUESTOR_EMAIL}</CText>
                                <CText style={styles.valueText}>{CommonParam.Email}</CText>
                            </View>
                        </View>

                        <View style={styles.infoRowView}>
                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_PEPSICO_LOCATION_NAME}</CText>
                                <CText style={styles.valueText}>{locationInfo.SLS_UNIT_NM__c}</CText>
                            </View>

                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_PEPSICO_LOCATION_ID}</CText>
                                <CText style={styles.valueText}>{locationInfo.SLS_UNIT_ID__c}</CText>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onUpdatePin}>
                        <View style={styles.updatePinView}>
                            <CustomerSvg width={14} height={16.5} />
                            <CText style={styles.updatePinText}>
                                {t.labels.PBNA_MOBILE_UPDATE_CUSTOMER_PIN.toUpperCase() +
                                    ' (' +
                                    t.labels.PBNA_MOBILE_REQUIRED +
                                    ')'}
                            </CText>
                        </View>
                    </TouchableOpacity>

                    {newPin && (
                        <View style={styles.infoRowView}>
                            <View style={styles.infoItemView}>
                                <CText style={styles.keyText}>{t.labels.PBNA_MOBILE_REQUESTED_CODE}</CText>
                                <CText style={[styles.keyText, styles.pointText]}>
                                    {_.capitalize(t.labels.PBNA_MOBILE_LATITUDE)}{' '}
                                    <CText style={styles.valueText}>{newPin?.latitude}</CText>
                                </CText>
                                <CText style={[styles.keyText, styles.pointText]}>
                                    {_.capitalize(t.labels.PBNA_MOBILE_LONGITUDE)}{' '}
                                    <CText style={styles.valueText}>{newPin?.longitude}</CText>
                                </CText>
                            </View>
                        </View>
                    )}

                    <View style={styles.commentView}>
                        <CText style={styles.keyText}>
                            {t.labels.PBNA_MOBILE_COMMENTS + ' ' + t.labels.PBNA_MOBILE_OPTIONAL}
                        </CText>
                        <TextInput
                            blurOnSubmit
                            style={styles.commentInput}
                            autoCorrect={false}
                            scrollEnabled={false}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_COMMENTS}
                            placeholderTextColor={'#D3D3D3'}
                            value={comments}
                            onChangeText={(text: string) => {
                                setComments(text)
                            }}
                            editable
                            multiline
                            maxLength={255}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
            <FormBottomButton
                onPressCancel={onCancel}
                onPressSave={onSubmit}
                disableSave={!isSubmitEnable}
                leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                rightButtonLabel={t.labels.PBNA_MOBILE_SUBMIT.toUpperCase()}
                leftTitleStyle={[styles.buttonText, styles.cancelText]}
                rightTitleStyle={styles.buttonText}
            />
        </View>
    )
}

export default EditGeoFence
