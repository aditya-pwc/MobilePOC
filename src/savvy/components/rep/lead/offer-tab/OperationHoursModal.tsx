/**
 * @description This component is for the user to edit the operation hours.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { useEffect, useState } from 'react'
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import OperationHoursTile from './OperationHoursTile'
import _ from 'lodash'
import store from '../../../../redux/store/Store'
import { useDispatch } from 'react-redux'
import { updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import { LeadDetailSection } from '../../../../enums/Lead'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    modalViewContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    paddingHorizontal_5_per: {
        paddingHorizontal: '5%'
    },
    height_81_percent: {
        height: '81%'
    },
    opeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop: 30
    },
    slopStyle: {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30
    },
    opeTouchable: {
        position: 'absolute',
        left: 0
    },
    opeContentBox: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }],
        borderTopColor: '#0098D4',
        borderRightColor: '#0098D4'
    },
    editOpeTextStyle: {
        fontSize: 12,
        fontWeight: '500'
    },
    dividerLine: {
        height: 1.5,
        width: '100%',
        backgroundColor: '#CFCFCF'
    },
    opeTextStyle: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 33
    },
    btnContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 22,
        width: '100%'
    },
    cancelBtnContainer: {
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
    cancelTextStyle: {
        color: '#6105BD',
        fontWeight: '700'
    },
    saveBtnContainer: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6105BD',
        height: 60,
        borderBottomRightRadius: 8,
        shadowColor: '#E7E7E7',
        shadowOffset: {
            width: -3,
            height: -3
        },
        shadowOpacity: 6
    },
    saveTextStyle: {
        color: 'white',
        fontWeight: '700'
    }
})

interface OperationHoursModalProps {
    showOperationHoursModal: any
    setShowOperationHoursModal: any
}

const OperationHoursModal = (props: OperationHoursModalProps) => {
    const { showOperationHoursModal, setShowOperationHoursModal } = props
    const dispatch = useDispatch()
    const initDaysOpenData = () => {
        return {
            Sunday: {
                open: false,
                from: '',
                to: ''
            },
            Monday: {
                open: false,
                from: '',
                to: ''
            },
            Tuesday: {
                open: false,
                from: '',
                to: ''
            },
            Wednesday: {
                open: false,
                from: '',
                to: ''
            },
            Thursday: {
                open: false,
                from: '',
                to: ''
            },
            Friday: {
                open: false,
                from: '',
                to: ''
            },
            Saturday: {
                open: false,
                from: '',
                to: ''
            }
        }
    }
    const [daysOpen, setDaysOpen] = useState(initDaysOpenData())

    const initDaysOpen = () => {
        const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
        if (
            tempLead &&
            tempLead.Days_Open_c__c !== null &&
            tempLead.Days_Open_c__c !== '' &&
            tempLead.Days_Open_c__c !== undefined &&
            typeof tempLead.Days_Open_c__c === 'string'
        ) {
            const daysOpenList = tempLead.Days_Open_c__c.split(';')
            if (daysOpenList.length === 0 && daysOpenList[0] === '') {
                return
            }
            const tempDaysOpen = initDaysOpenData()
            _.forEach(daysOpenList, (v) => {
                tempDaysOpen[v].from = tempLead[`${v}_Start_Hours_of_Operation_c__c`]
                tempDaysOpen[v].to = tempLead[`${v}_End_Hours_of_Operation_c__c`]
                tempDaysOpen[v].open = true
            })
            setDaysOpen(tempDaysOpen)
        } else {
            setDaysOpen(initDaysOpenData())
        }
    }

    useEffect(() => {
        initDaysOpen()
        return store.subscribe(() => {
            initDaysOpen()
        })
    }, [])

    useEffect(() => {
        initDaysOpen()
    }, [showOperationHoursModal])

    const saveData = () => {
        const daysOpenList = []
        const newData = {
            Days_Open_c__c: null,
            Sunday_Start_Hours_of_Operation_c__c: null,
            Sunday_End_Hours_of_Operation_c__c: null,
            Monday_Start_Hours_of_Operation_c__c: null,
            Monday_End_Hours_of_Operation_c__c: null,
            Tuesday_Start_Hours_of_Operation_c__c: null,
            Tuesday_End_Hours_of_Operation_c__c: null,
            Wednesday_Start_Hours_of_Operation_c__c: null,
            Wednesday_End_Hours_of_Operation_c__c: null,
            Thursday_Start_Hours_of_Operation_c__c: null,
            Thursday_End_Hours_of_Operation_c__c: null,
            Friday_Start_Hours_of_Operation_c__c: null,
            Friday_End_Hours_of_Operation_c__c: null,
            Saturday_Start_Hours_of_Operation_c__c: null,
            Saturday_End_Hours_of_Operation_c__c: null
        }
        _.forOwn(daysOpen, (v, k) => {
            if (v.open) {
                daysOpenList.push(k)
                newData[`${k}_Start_Hours_of_Operation_c__c`] = v.from
                newData[`${k}_End_Hours_of_Operation_c__c`] = v.to
            }
        })
        newData.Days_Open_c__c = daysOpenList.join(';')
        dispatch(updateTempLeadAction(newData, LeadDetailSection.DELIVERY_EXECUTION))
        setShowOperationHoursModal(false)
    }

    return (
        <Modal animationType="fade" transparent visible={showOperationHoursModal}>
            <View style={styles.modalViewContainer}>
                <View style={[commonStyle.fullWidth, styles.paddingHorizontal_5_per]}>
                    <View style={styles.opeContainer}>
                        <TouchableOpacity
                            style={styles.opeTouchable}
                            onPress={() => {
                                setShowOperationHoursModal(false)
                            }}
                            hitSlop={styles.slopStyle}
                        >
                            <View style={styles.opeContentBox} />
                        </TouchableOpacity>
                        <CText style={styles.editOpeTextStyle}>{t.labels.PBNA_MOBILE_EDIT_HOURS_OF_OPERATION}</CText>
                    </View>
                    <View style={styles.dividerLine} />
                    <KeyboardAwareScrollView style={styles.height_81_percent} showsVerticalScrollIndicator={false}>
                        <CText style={styles.opeTextStyle}>{t.labels.PBNA_MOBILE_HOURS_OF_OPERATION_NO_DOT}</CText>
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Sunday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Monday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Tuesday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Wednesday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Thursday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Friday'} />
                        <OperationHoursTile daysOpen={daysOpen} setDaysOpen={setDaysOpen} weekDay={'Saturday'} />
                    </KeyboardAwareScrollView>
                </View>
                <View style={styles.btnContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowOperationHoursModal(false)
                        }}
                        style={styles.cancelBtnContainer}
                    >
                        <CText style={styles.cancelTextStyle}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.saveBtnContainer}
                        onPress={() => {
                            saveData()
                        }}
                    >
                        <CText style={styles.saveTextStyle}>{t.labels.PBNA_MOBILE_SAVE.toUpperCase()}</CText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default OperationHoursModal
