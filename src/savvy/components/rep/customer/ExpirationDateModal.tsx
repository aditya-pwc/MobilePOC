/**
 * @description The Modal to select expiration date for price group .
 * @author Kiren Cao
 * @date 2023-12-08
 */
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { syncUpObjCreateFromMem } from '../../../api/SyncUtils'
import { storeClassLog } from '../../../../common/utils/LogUtils'
import { Log } from '../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import LeadDateTimePicker from '../lead/common/LeadDateTimePicker'

interface ExpirationDateModalProps {
    showModal: boolean
    setShowModal: any
    priceGroupItem: any
    setRefreshFlag: any
    custId: string
    pricingLevelId: string
}

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container2: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 8
    },
    titleStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 50,
        marginTop: 30,
        marginBottom: 15
    },
    titleFontStyle: {
        fontWeight: '900',
        fontSize: 18
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    validAllColor: {
        backgroundColor: '#6105BD'
    },
    invalidAllColor: {
        backgroundColor: '#FFFFFF'
    },
    validAll: {
        color: '#FFFFFF'
    },
    invalidAll: {
        color: '#D3D3D3'
    },
    saveStyle: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderBottomRightRadius: 8,
        shadowColor: '#E7E7E7',
        shadowOffset: {
            width: -3,
            height: -3
        },
        shadowOpacity: 6
    },
    cancelStyle: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 60,
        borderBottomLeftRadius: 8,
        shadowColor: '#E7E7E7',
        shadowOffset: {
            width: 2,
            height: -1
        },
        shadowOpacity: 6
    },
    cancelText: {
        color: '#6105BD',
        fontWeight: '700'
    },
    effectiveDateStyle: {
        color: '#565656',
        fontSize: 12
    },
    dateStyle: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '700'
    },
    datePicker: {
        margin: 20
    },
    calendar: {
        height: 18,
        width: 20,
        marginRight: 12
    },
    marginBottom_20: {
        marginBottom: 20
    },
    marginTop_10: {
        marginTop: 10
    },
    marginTop_20: {
        marginTop: 20
    },
    priceBorder: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    datePickerCont: {
        backgroundColor: 'rgba(0, 0,0, 0.2)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    calendarModalView: {
        borderRadius: 8,
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 350,
        width: '90%'
    },
    expirationContainer: {
        marginHorizontal: 22
    },
    placeHolderStyle: {
        fontSize: 14,
        color: '#D3D3D3'
    },
    expirationStyle: {
        fontSize: 14,
        color: '#000000'
    }
})
export const ExpirationDateModal = (props: ExpirationDateModalProps) => {
    const { showModal, setShowModal, priceGroupItem, setRefreshFlag, custId, pricingLevelId } = props
    const [priceGroupList, setPriceGroupList] = useState<any[]>([])
    const [disableSave, setDisableSave] = useState(true)

    const handlePressConfirm = () => {
        setShowModal(false)
        Alert.alert(t.labels.PBNA_MOBILE_REMOVE_PRICE_GROUP, t.labels.PBNA_MOBILE_DELETE_PRICE_GROUP_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'default',
                onPress: () => {
                    setPriceGroupList([])
                    setDisableSave(true)
                }
            },
            {
                text: t.labels.PBNA_MOBILE_SUBMIT,
                style: 'default',
                onPress: async () => {
                    try {
                        const priceGroupToCreateArray = priceGroupList.map((priceGroupItem: any) => {
                            return {
                                Cust_Id__c: custId,
                                Target_Id__c: priceGroupItem?.Target_Id__c,
                                Target_Name__c: priceGroupItem?.Target_Name__c,
                                Status__c: 'Submitted',
                                Send_outbound__c: true,
                                Pricing_Level_Id__c: pricingLevelId,
                                Type__c: 'prc_grp_request',
                                End_date__c: priceGroupItem.End_date__c,
                                External_Id__c: `${custId}_${priceGroupItem?.Target_Id__c || ''}_${dayjs()
                                    .utc()
                                    .format(TIME_FORMAT.YMDTHMSSZZ)}`,
                                Is_removed__c: false
                            }
                        })
                        await syncUpObjCreateFromMem('Customer_Deal__c', priceGroupToCreateArray)
                        setRefreshFlag((v) => v + 1)
                        setDisableSave(true)
                    } catch (e) {
                        storeClassLog(
                            Log.MOBILE_ERROR,
                            'ExpirationDateModal-handlePressConfirm',
                            ErrorUtils.error2String(e) + `${priceGroupList}`
                        )
                        setDisableSave(true)
                        setPriceGroupList([])
                    }
                }
            }
        ])
    }

    return (
        <Modal visible={showModal} transparent>
            <View style={styles.container}>
                <View style={styles.container2}>
                    <View style={styles.titleStyle}>
                        <CText style={styles.titleFontStyle} numberOfLines={4}>
                            {`${t.labels.PBNA_MOBILE_SELECT_THE_EXPIRATION_DATE_MSG} ${priceGroupItem.Target_Name__c}`}
                        </CText>
                    </View>
                    <View style={[styles.marginTop_20, styles.expirationContainer, styles.marginBottom_20]}>
                        <LeadDateTimePicker
                            fieldLabel={t.labels.PBNA_MOBILE_EXPIRATION_DATE}
                            value={priceGroupItem?.End_date__c || ''}
                            onChange={(v: Date) => {
                                const updatedPriceItem = [priceGroupItem]
                                updatedPriceItem[0].End_date__c = dayjs(v).format(TIME_FORMAT.Y_MM_DD)
                                setPriceGroupList(updatedPriceItem)
                                setDisableSave(false)
                            }}
                            maximumDate={dayjs().add(14, 'days').toDate()}
                            minimumDate={new Date()}
                            deferred
                            placeHolder={t.labels.PBNA_MOBILE_IP_SELECT_DATE}
                        />
                    </View>
                    <View style={commonStyle.flexDirectionRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(false)
                                setPriceGroupList([])
                                setDisableSave(true)
                            }}
                            style={styles.cancelStyle}
                        >
                            <CText style={styles.cancelText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveStyle, disableSave ? styles.invalidAllColor : styles.validAllColor]}
                            onPress={() => handlePressConfirm()}
                            disabled={disableSave}
                        >
                            <CText style={[styles.fontWeight_700, disableSave ? styles.invalidAll : styles.validAll]}>
                                {t.labels.PBNA_MOBILE_CONFIRM.toUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
export default ExpirationDateModal
