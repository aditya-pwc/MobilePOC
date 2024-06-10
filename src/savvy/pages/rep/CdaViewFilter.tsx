import React, { useState, useRef } from 'react'
import { Modal, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import BackButton from '../../components/common/BackButton'
import { baseStyle } from '../../../common/styles/BaseStyle'
import CText from '../../../common/components/CText'
import CCheckBox from '../../../common/components/CCheckBox'
import FormBottomButton from '../../../common/components/FormBottomButton'
import _ from 'lodash'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { t } from '../../../common/i18n/t'
import { CommonParam } from '../../../common/CommonParam'
import CdaSignedPin from '../../../../assets/image/pin-cda-signed.svg'
import CdaInProgressPin from '../../../../assets/image/pin-cda-in-progress.svg'
import CdaNotStartedPin from '../../../../assets/image/pin-cda-not-started.svg'
import CdaDeclinedPin from '../../../../assets/image/pin-cda-declined.svg'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { OrderType } from '../../common/SmartSql'
import InnovaProdSortRadioButton from '../../components/rep/customer/innovation-tab/InnovaProdSortRadioButton'
import { isPersonaKAM, isPersonaPSR, isPersonaSDL } from '../../../common/enums/Persona'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
        marginHorizontal: '5%',
        paddingVertical: 10,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    navTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: 30
    },
    navTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    filterContainer: {
        paddingHorizontal: '5%',
        paddingTop: 10
    },
    filterTitle: {
        fontSize: 14
    },
    bottomButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        bottom: 10
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    pageTitle: {
        fontSize: baseStyle.fontSize.fs_18,
        fontWeight: baseStyle.fontWeight.fw_900,
        color: baseStyle.color.black,
        marginBottom: 10
    },
    pageDescription: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        marginBottom: 40
    },
    buttonGroupTitle: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black,
        marginBottom: 20
    },
    statusContainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 19,
        paddingBottom: 7,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    statusItemContainer: {
        minWidth: '49.5%',
        alignItems: 'center',
        paddingBottom: 8,
        flexDirection: 'row'
    },
    checkBoxText: {
        fontWeight: '400',
        color: '#000000',
        marginLeft: 5
    },
    statusBoxText: {
        marginLeft: 3,
        fontSize: 12
    },
    blackText: {
        fontWeight: '400',
        fontSize: 12,
        width: '60%',
        color: 'black'
    },
    checkBoxContainer: {
        minWidth: '47%',
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0,
        marginTop: 20
    },
    checkBoxContainerAlt: {
        width: 24,
        marginLeft: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        padding: 0
    },
    innovationFilterContainer: {
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 15,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    topMargin40: {
        marginTop: 40
    },
    topMargin10: {
        marginTop: 10
    },
    topMargin26: {
        marginTop: 26
    },
    adjustedArea: {
        zIndex: 1,
        position: 'relative',
        alignItems: 'center',
        height: '4%'
    }
})
interface CdaViewFilterProps {
    visible: boolean
    onBack: Function
    setSortFilter: React.Dispatch<React.SetStateAction<ReturnType<typeof getDefaultSortFilter>>>
}

const getCustomerTypeOptions = () => {
    return [
        {
            name: 'Retail',
            label: t.labels.PBNA_MOBILE_RETAIL
        },
        {
            name: 'FoodService',
            label: t.labels.PBNA_MOBILE_CDA_FOOD_SERVICE
        }
    ] as const
}
const getCdaStatusOptions = () => {
    return [
        {
            name: 'Signed',
            pin: CdaSignedPin,
            label: t.labels.PBNA_MOBILE_SIGNED
        },
        {
            name: 'In Progress',
            pin: CdaInProgressPin,
            label: t.labels.PBNA_MOBILE_CDA_IN_PROGRESS
        },
        {
            name: 'Not Started',
            pin: CdaNotStartedPin,
            label: t.labels.PBNA_MOBILE_NOT_STARTED
        },
        {
            name: 'Declined',
            pin: CdaDeclinedPin,
            label: t.labels.PBNA_MOBILE_DECLINED
        }
    ] as const
}
export const getInitCustomerType = () =>
    isPersonaPSR() || isPersonaSDL() || isPersonaKAM()
        ? {
              Retail: true,
              FoodService: false
          }
        : {
              Retail: false,
              FoodService: true
          }

const initCdaStatus = {
    Signed: true,
    'In Progress': true,
    'Not Started': true,
    Declined: true
}

export const getDefaultSortFilter = () => {
    return {
        enable: false,
        enableCdaStatus: false,
        sortValue: 'ASC' as OrderType,
        customerType: getInitCustomerType(),
        cdaStatus: initCdaStatus
    }
}

const CdaViewFilter = (props: CdaViewFilterProps) => {
    const { visible, onBack, setSortFilter } = props
    const sortRef = useRef(null)

    const customerTypeOptions = getCustomerTypeOptions()
    const cdaStatusOptions = getCdaStatusOptions()
    const initCustomerType = getInitCustomerType()
    const [sortValue, setSortValue] = useState<OrderType>('ASC')
    const [customerType, setCustomerType] = useState(initCustomerType)
    const [cdaStatus, setCdaStatus] = useState(initCdaStatus)
    const isEnabled = () =>
        sortValue !== 'ASC' || !_.isEqual(initCustomerType, customerType) || !_.isEqual(initCdaStatus, cdaStatus)
    const [applied, setApplied] = useState(getDefaultSortFilter)

    function refreshSortFilter(setState: typeof setApplied) {
        setState({
            enable: isEnabled(),
            enableCdaStatus: !_.isEqual(initCdaStatus, cdaStatus),
            sortValue: sortValue,
            customerType: customerType,
            cdaStatus: cdaStatus
        })
    }

    const handlePressRest = () => {
        setSortValue('ASC')
        setCustomerType(initCustomerType)
        setCdaStatus(initCdaStatus)
    }

    const setChecked = () => {
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
        if (sortValue === 'ASC') {
            return '1'
        } else if (sortValue === 'DESC') {
            return '2'
        }
        return '0'
    }

    const handleGoBack = () => {
        setSortValue(applied.sortValue)
        setCustomerType(applied.customerType)
        setCdaStatus(applied.cdaStatus)
        onBack()
    }

    const handlePressSave = () => {
        refreshSortFilter(setApplied)
        refreshSortFilter(setSortFilter)
        onBack()
    }

    return (
        <Modal visible={visible} animationType={'fade'}>
            <SafeAreaView style={[styles.container, styles.whiteContainer]}>
                <View style={styles.eHeader}>
                    <View style={styles.navHeader}>
                        <BackButton extraStyle={styles.tintColor} onBackPress={handleGoBack} />
                        <View style={styles.navTitleContainer}>
                            <CText style={[styles.navTitle]}>{t.labels.PBNA_MOBILE_SORT_FILTER}</CText>
                        </View>
                    </View>
                    <ScrollView style={styles.filterContainer}>
                        <CText style={styles.pageTitle}>{t.labels.PBNA_MOBILE_CDA_VIEW}</CText>
                        <CText style={styles.pageDescription}>{t.labels.PBNA_MOBILE_CDA_VIEW_FILTER_DESCRIPTION}</CText>
                        <CText style={styles.buttonGroupTitle}>{t.labels.PBNA_MOBILE_SORT_BY}</CText>
                        <InnovaProdSortRadioButton
                            ref={sortRef}
                            title={t.labels.PBNA_MOBILE_FILTER_CUST_NAME}
                            labelLeft={t.labels.PBNA_MOBILE_SORT_A_Z}
                            labelRight={t.labels.PBNA_MOBILE_SORT_Z_A}
                            valueLeft={'ASC'}
                            valueRight={'DESC'}
                            reset={() => {}}
                            checked={setChecked}
                            setSortCheck={setSortValue}
                        />
                        <CText style={[styles.buttonGroupTitle, styles.topMargin40]}>
                            {t.labels.PBNA_MOBILE_FILTER_BY}
                        </CText>
                        <CText style={[styles.filterTitle, styles.topMargin10]}>
                            {t.labels.PBNA_MOBILE_CUSTOMER_TYPE}
                        </CText>
                        <View style={styles.innovationFilterContainer}>
                            {customerTypeOptions.map((option) => (
                                <CCheckBox
                                    key={option.label}
                                    title={option.label}
                                    textStyle={styles.checkBoxText}
                                    containerStyle={styles.checkBoxContainer}
                                    onPress={() => {
                                        setCustomerType({
                                            ...customerType,
                                            [option.name]: !customerType[option.name]
                                        })
                                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
                                    }}
                                    checked={customerType[option.name]}
                                />
                            ))}
                        </View>
                        <CText style={[styles.filterTitle, styles.topMargin26]}>
                            {t.labels.PBNA_MOBILE_CDA_STATUS}
                        </CText>
                        <View style={styles.statusContainer}>
                            {cdaStatusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={styles.statusItemContainer}
                                    onPress={() => {
                                        setCdaStatus({
                                            ...cdaStatus,
                                            [option.name]: !cdaStatus[option.name]
                                        })
                                        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
                                    }}
                                >
                                    <CCheckBox
                                        checked={cdaStatus[option.name]}
                                        containerStyle={styles.checkBoxContainerAlt}
                                    />
                                    <option.pin width={24} />
                                    <CText style={styles.statusBoxText}>{option.label}</CText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <FormBottomButton
                        onPressCancel={handlePressRest}
                        onPressSave={handlePressSave}
                        rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_APPLY}
                        leftButtonLabel={t.labels.PBNA_MOBILE_FILTER_RESET}
                        relative
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export default CdaViewFilter
