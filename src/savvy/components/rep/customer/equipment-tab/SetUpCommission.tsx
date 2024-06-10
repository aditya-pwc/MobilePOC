/**
 * @description Set Up Commission From in Request step 2
 * @author Sheng Huang
 * @date 2022/7/11
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import PickerTile from '../../lead/common/PickerTile'
import { Input } from 'react-native-elements'
import CText from '../../../../../common/components/CText'
import SearchablePicklist from '../../lead/common/SearchablePicklist'
import ConfirmButton from '../../../common/ConfirmButton'
import _ from 'lodash'
import LeadCheckBox from '../../lead/common/LeadCheckBox'
import { useSupplier } from '../../../../hooks/EquipmentHooks'
import { addZeroes } from '../../../../utils/LeadUtils'
import { SoupService } from '../../../../service/SoupService'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { processTwoDecimalNumber } from '../../../../utils/EquipmentUtils'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { formatString } from '../../../../utils/CommonUtils'

const styles = StyleSheet.create({
    pickerTileLabel: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        fontFamily: 'Gotham-Book'
    },
    pickerTileContainer: {
        marginBottom: 22
    },
    priceInput: {
        width: '100%',
        height: 40,
        borderRadius: 6,
        borderColor: '#00A2D9',
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    headerContainer: {
        backgroundColor: baseStyle.color.white,
        borderTopWidth: 1,
        borderTopColor: baseStyle.color.white,
        paddingHorizontal: 22
    },
    width_625: {
        width: '62.5%'
    },
    headerStyle: {
        fontSize: 18,
        fontWeight: '900'
    },
    headerContainer2: {
        width: '37.5%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    headerContainer3: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: baseStyle.color.white
    },
    headerContainer4: {
        width: '41%',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    headerContainer5: {
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        width: '100%',
        height: 40,
        borderRadius: 6,
        borderColor: '#00A2D9',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    inputSymbol: {
        fontSize: 14,
        fontWeight: '700',
        left: 10
    },
    inputContainerStyle: {
        marginTop: 20,
        width: 65,
        left: 3
    },
    inputColor: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },
    inputFont: {
        fontSize: 14,
        fontWeight: '700'
    },
    variableProductContainer: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: baseStyle.color.bgGray,
        marginBottom: 1,
        paddingHorizontal: 22
    },
    selectNumContainer: {
        flexDirection: 'row',
        width: '59%',
        alignItems: 'center'
    },
    selectNumStyle: {
        fontWeight: '700',
        width: '15%'
    },
    nameText: {
        marginLeft: 5,
        overflow: 'hidden',
        width: '80%'
    },
    variableProductInputContainer1: {
        width: '41%',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    variableProductInputContainer2: {
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    variableProductInputSymbol: {
        fontSize: 14,
        fontWeight: '700',
        left: 13
    },
    variableProductInputContainerStyle: {
        marginTop: 20,
        width: 65,
        left: 5
    },
    commissionRateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24
    },
    commissionRateInputContainer: {
        flex: 1,
        marginRight: 12
    },
    commissionRateContainerStyle: {
        paddingHorizontal: 0
    },
    commissionRateInputStyle: {
        fontSize: 14,
        fontFamily: 'Gotham'
    },
    finalTierLabel: {
        fontSize: 12,
        color: '#565656'
    },
    finalTierContent: {
        height: 40,
        justifyContent: 'center',
        marginVertical: 4
    },
    finalTierValue: {
        fontSize: 14,
        color: '#242424'
    },
    addTierButton: {
        marginTop: 24
    },
    inputColor2: {
        borderBottomColor: '#D3D3D3'
    },
    flex_4: {
        flex: 4
    },
    errorStyle: {
        fontFamily: 'Gotham-Book',
        marginTop: 12
    },
    marginLeft_12: {
        marginLeft: 12
    },
    trashStyle: {
        height: 26,
        width: 20
    },
    marginBottom_5: {
        marginBottom: 5
    },
    addContainer: {
        height: 36,
        width: 30
    },
    addStyle1: {
        width: 20,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    addStyle2: {
        width: 3,
        height: 20,
        backgroundColor: '#00A2D9',
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    addText: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    paddingHorizontal_22: {
        paddingHorizontal: 22
    },
    scrollViewContainer: {
        flex: 1,
        marginVertical: 22,
        marginBottom: 200
    },
    depositAmountContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 22
    },
    marginLeft_10: {
        marginLeft: -10
    },
    inputFont2: {
        fontSize: 14,
        fontFamily: 'Gotham'
    },
    checkBoxContainer: {
        flex: 1,
        flexDirection: 'row-reverse'
    },
    checkBoxStyle: {
        marginTop: 18,
        backgroundColor: '#fff'
    },
    commissionRateText: {
        fontSize: 18,
        fontWeight: '900'
    },
    paddingBottom_200: {
        paddingBottom: 200
    },
    marginHorizontal_5: {
        marginHorizontal: '5%'
    }
})

interface SetUpCommissionProps {
    cRef?: any
    equipment: any
    setEquipment: any
    setUpCommission: () => void
    readonly?: boolean
    products
    setProducts
}

export type SetUpCommissionRef = {
    processCommissionRate: () => void
}

const RateType = [
    `-- ${t.labels.PBNA_MOBILE_SELECT_RATE_TYPE} --`,
    'No Commission',
    'Variable by Product',
    'Tier',
    'Flat at Asset'
]
const ContractType = [`-- ${t.labels.PBNA_MOBILE_SELECT_CONTRACT_TYPE} --`, 'Quantity', 'Revenue']
const CommissionBasis = [`-- ${t.labels.PBNA_MOBILE_SELECT_COMMISSION_BASIS} --`, 'Cash in Bag', 'Units Vended', 'Flat']
const CommissionBasisWithoutFlat = [
    `-- ${t.labels.PBNA_MOBILE_SELECT_COMMISSION_BASIS} --`,
    'Cash in Bag',
    'Units Vended'
]
const PaymentSchedule = [`-- ${t.labels.PBNA_MOBILE_SELECT_PAYMENT_SCHEDULE} --`, 'Monthly', 'Period', 'Quarterly']
const CommissionBasisCodeMap = {
    'Cash in Bag': 'CIB',
    'Units Vended': 'Vend',
    Flat: 'Flat'
}
type CommissionRateType = {
    FSVUnit: string
    FSVRate: string
}
const COMMISSION_RATE_FINAL_TIER_VALUE = 9999
const BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT = { FSVUnit: '', FSVRate: '' }
const BLANK_FINAL_TIER_PLACEHOLDER_OBJECT = { FSVUnit: COMMISSION_RATE_FINAL_TIER_VALUE + '', FSVRate: '' }

const convertPercentToDecimal = (value: string) => {
    if (value) {
        return (parseFloat(value) / 100).toFixed(4)
    }
    return null
}

const convertDecimalToPercentage = (value: string) => {
    return value ? (parseFloat(value) * 100).toFixed(2) : ''
}

const SetUpCommission: FC<SetUpCommissionProps> = (props: SetUpCommissionProps) => {
    const { equipment, setEquipment, setUpCommission, readonly = false, products, setProducts, cRef } = props
    const rateTypeRef = useRef(null)
    const contractTypeRef = useRef(null)
    const commissionBasisRef = useRef(null)
    const paymentScheduleRef = useRef(null)
    const depositAmountRef = useRef(null)
    const supplierRef = useRef(null)
    const amountRef = useRef(null)
    const [supplierSearchValue, setSupplierSearchValue] = useState('')
    const supplierList = useSupplier(supplierSearchValue)
    const [commissionBasisList, setCommissionBasisList] = useState(CommissionBasis)
    const [allValue2, setAllValue2] = useState('')
    const allValue2Ref = useRef(null)
    const [commissionRateList, setCommissionRateList] = useState<Array<CommissionRateType>>([])
    const initTempProductCommissionRate = (productList: []) => {
        return productList.map((v: any) => {
            return {
                FSV_COMM_RATE_T1__c:
                    equipment.Contract_Type__c === 'Revenue'
                        ? convertDecimalToPercentage(v.FSV_COMM_RATE_T1__c)
                        : v.FSV_COMM_RATE_T1__c
            }
        })
    }
    // eslint-disable-next-line camelcase
    const [tempProductCommissionRate, setTempProductCommissionRate] = useState<{ FSV_COMM_RATE_T1__c: string }[]>(
        initTempProductCommissionRate(products)
    )
    const productCommissionRef = useRef(tempProductCommissionRate)

    useEffect(() => {
        if (
            equipment.Supplier__c &&
            equipment['Supplier__r.supplier_no__c'] &&
            _.isEmpty(equipment['Supplier__r.splr_site_addr1_txt__c'])
        ) {
            SoupService.retrieveDataFromSoup(
                'Asset_Attribute__c',
                {},
                [
                    'Id',
                    'splr_site_addr1_txt__c',
                    'splr_site_city_nme__c',
                    'splr_site_st_cde__c',
                    'splr_site_zip_cde__c'
                ],
                `SELECT {Asset_Attribute__c:Id},
                                 {Asset_Attribute__c:splr_site_addr1_txt__c},
                                 {Asset_Attribute__c:splr_site_city_nme__c},
                                 {Asset_Attribute__c:splr_site_st_cde__c},
                                 {Asset_Attribute__c:splr_site_zip_cde__c} 
                          FROM {Asset_Attribute__c}
                          WHERE {Asset_Attribute__c:master_data_type__c} = 'SupplierAddress' 
                            AND {Asset_Attribute__c:active_flag__c} IS TRUE 
                            AND {Asset_Attribute__c:supplier_no__c} = '${equipment['Supplier__r.supplier_no__c']}'
                            LIMIT 1`
            ).then((res) => {
                if (res.length > 0) {
                    setEquipment({
                        ...equipment,
                        'Supplier__r.splr_site_addr1_txt__c': res[0].splr_site_addr1_txt__c,
                        'Supplier__r.splr_site_city_nme__c': res[0].splr_site_city_nme__c,
                        'Supplier__r.splr_site_st_cde__c': res[0].splr_site_st_cde__c,
                        'Supplier__r.splr_site_zip_cde__c': res[0].splr_site_zip_cde__c
                    })
                    supplierRef.current.setValue(
                        `${equipment['Supplier__r.supplier_no__c']} ${equipment['Supplier__r.supplier_name__c']} ${
                            res[0].splr_site_addr1_txt__c
                                ? `${res[0].splr_site_addr1_txt__c || ''} ${res[0].splr_site_city_nme__c || ''}, ${
                                      res[0].splr_site_st_cde__c || ''
                                  } ${res[0].splr_site_zip_cde__c || ''}`
                                : ''
                        }`
                    )
                }
            })
        }
    }, [equipment.Supplier__c])

    useEffect(() => {
        if (equipment.Contract_Type__c === 'Revenue') {
            setCommissionBasisList(CommissionBasisWithoutFlat)
        } else {
            setCommissionBasisList(CommissionBasis)
        }
    }, [])

    useEffect(() => {
        const tempList: CommissionRateType[] = []
        tempList.push({
            FSVUnit: equipment.FSV_UNIT_T1__c,
            FSVRate:
                equipment.Contract_Type__c === 'Revenue'
                    ? convertDecimalToPercentage(equipment.FSV_COMM_RATE_T1__c)
                    : equipment.FSV_COMM_RATE_T1__c
        })
        _.times(4, (n) => {
            if (equipment[`FSV_UNIT_T${n + 2}__c`] && equipment[`FSV_COMM_RATE_T${n + 2}__c`]) {
                tempList.push({
                    FSVUnit: n === 3 ? COMMISSION_RATE_FINAL_TIER_VALUE + '' : equipment[`FSV_UNIT_T${n + 2}__c`],
                    FSVRate:
                        equipment.Contract_Type__c === 'Revenue'
                            ? convertDecimalToPercentage(equipment[`FSV_COMM_RATE_T${n + 2}__c`])
                            : equipment[`FSV_COMM_RATE_T${n + 2}__c`]
                })
            }
        })
        if (tempList.length === 1 && equipment.Rate_Type__c === 'Tier') {
            tempList.push({
                FSVUnit: COMMISSION_RATE_FINAL_TIER_VALUE + '',
                FSVRate: ''
            })
        }
        setCommissionRateList(tempList)
    }, [])

    const processCommissionRate = () => {
        if (equipment.Rate_Type__c === 'Variable by Product') {
            const tempProducts = _.cloneDeep(products)
            if (equipment.Contract_Type__c === 'Revenue') {
                tempProductCommissionRate.forEach((item, index) => {
                    tempProducts[index].FSV_COMM_RATE_T1__c = convertPercentToDecimal(item.FSV_COMM_RATE_T1__c)
                })
            } else {
                tempProductCommissionRate.forEach((item, index) => {
                    tempProducts[index].FSV_COMM_RATE_T1__c = item.FSV_COMM_RATE_T1__c
                })
            }
            setProducts(tempProducts)
        } else {
            const length = commissionRateList.length
            const tempEquipment = _.cloneDeep(equipment)
            _.times(5, (n) => {
                tempEquipment[`FSV_UNIT_T${n + 1}__c`] =
                    n === length - 1 && tempEquipment.Rate_Type__c === 'Tier'
                        ? COMMISSION_RATE_FINAL_TIER_VALUE
                        : commissionRateList[n]?.FSVUnit || null
                tempEquipment[`FSV_COMM_RATE_T${n + 1}__c`] =
                    tempEquipment.Contract_Type__c === 'Revenue'
                        ? convertPercentToDecimal(commissionRateList[n]?.FSVRate)
                        : commissionRateList[n]?.FSVRate || null
            })
            setEquipment(tempEquipment)
        }
    }

    useImperativeHandle(cRef, () => ({
        processCommissionRate: () => {
            processCommissionRate()
        }
    }))

    const isCommissionRateValid = () => {
        let isValid = true
        const rateLimit = equipment.Contract_Type__c === 'Revenue' ? 75.0 : 0.75
        commissionRateList.forEach((item) => {
            if (!item.FSVUnit || !item.FSVRate) {
                isValid = false
            } else {
                isValid =
                    isValid &&
                    parseFloat(item.FSVUnit || '0') > 0 &&
                    parseFloat(item.FSVRate || '0') <= rateLimit &&
                    parseFloat(item.FSVRate || '0') > 0
            }
        })
        return isValid
    }

    const isCommissionRateLargerThanLast = () => {
        let isValid = true
        if (commissionRateList.length > 1) {
            commissionRateList.forEach((item, index) => {
                if (index > 0) {
                    if (parseFloat(item.FSVUnit || '0') <= parseFloat(commissionRateList[index - 1].FSVUnit || '0')) {
                        isValid = false
                    }
                }
            })
        }
        return isValid
    }

    const setDisable = () => {
        if (equipment.Rate_Type__c === 'No Commission') {
            return false
        } else if (equipment.Rate_Type__c === 'Flat at Asset') {
            return (
                _.isEmpty(equipment.Contract_Type__c) ||
                _.isEmpty(equipment.Commission_Basis__c) ||
                _.isEmpty(equipment.Payment_Schedule__c) ||
                _.isEmpty(equipment.Supplier__c) ||
                parseFloat(equipment.Deposit_Amount__c || 0) > 2 ||
                !(
                    parseFloat(commissionRateList[0]?.FSVRate || '0') <=
                        (equipment.Contract_Type__c === 'Revenue' ? 75 : 0.75) &&
                    parseFloat(commissionRateList[0]?.FSVRate || '0') > 0
                ) ||
                _.isEmpty(commissionRateList[0]?.FSVRate?.toString())
            )
        } else if (equipment.Rate_Type__c === 'Variable by Product') {
            let isExtraValueEmpty = false
            tempProductCommissionRate.forEach((product) => {
                if (!product.FSV_COMM_RATE_T1__c) {
                    isExtraValueEmpty = true
                }
            })
            return (
                _.isEmpty(equipment.Contract_Type__c) ||
                _.isEmpty(equipment.Commission_Basis__c) ||
                _.isEmpty(equipment.Payment_Schedule__c) ||
                _.isEmpty(equipment.Supplier__c) ||
                parseFloat(equipment.Deposit_Amount__c || 0) > 2 ||
                isExtraValueEmpty
            )
        } else if (equipment.Rate_Type__c === 'Tier') {
            return (
                _.isEmpty(equipment.Contract_Type__c) ||
                _.isEmpty(equipment.Commission_Basis__c) ||
                _.isEmpty(equipment.Payment_Schedule__c) ||
                _.isEmpty(equipment.Supplier__c) ||
                parseFloat(equipment.Deposit_Amount__c || 0) > 2 ||
                parseFloat(commissionRateList[0]?.FSVUnit || '0') <= 0 ||
                !(
                    parseFloat(commissionRateList[0]?.FSVRate || '0') <=
                        (equipment.Contract_Type__c === 'Revenue' ? 75 : 0.75) &&
                    parseFloat(commissionRateList[0]?.FSVRate || '0') > 0
                ) ||
                _.isEmpty(commissionRateList[0]?.FSVUnit?.toString()) ||
                _.isEmpty(commissionRateList[0]?.FSVRate?.toString()) ||
                !isCommissionRateValid() ||
                !isCommissionRateLargerThanLast()
            )
        }
        return (
            _.isEmpty(equipment.Contract_Type__c) ||
            _.isEmpty(equipment.Commission_Basis__c) ||
            _.isEmpty(equipment.Payment_Schedule__c) ||
            _.isEmpty(equipment.Supplier__c)
        )
    }

    const processNumber = (v) => {
        let temp = _.cloneDeep(v)
        temp = temp.replace(/[^\d.]/g, '') // remove all non-digits and dots
        temp = temp.replace(/\.{2,}/g, '.') // only keep the first dots
        if (temp.length === 1 && temp[0] === '.') {
            temp = ''
        }

        if (temp.length > 1 && temp[1] !== '.') {
            temp = temp.substring(0, temp.length - 1)
        }
        temp = temp.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
        temp = temp.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // only allow two decimal places
        if (temp.indexOf('.') < 0 && temp !== '') {
            // the first digit cannot be 0
            temp = parseFloat(temp)
        }
        return temp
    }

    const processDecimal = (v) => {
        let temp = _.cloneDeep(v)
        temp = temp.replace(/[^\d.]/g, '') // remove all non-digits and dots
        temp = temp.replace(/\.{2,}/g, '.') // only keep the first dots
        if (temp.length === 1 && temp[0] === '.') {
            temp = ''
        }
        if (temp.length > 1 && temp[1] !== '.' && temp[0] === '0') {
            temp = temp.substring(1, temp.length)
        }
        temp = temp.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
        temp = temp.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // only allow two decimal places
        return temp
    }

    const calcCommissionRateLimit = (v) => {
        let newValue = _.cloneDeep(v)
        if (equipment.Contract_Type__c === 'Revenue') {
            if (newValue > 75) {
                newValue = '75.00'
            } else if (newValue < 0.01) {
                newValue = '0.01'
            }
        } else {
            if (newValue > 0.75) {
                newValue = '0.75'
            } else if (newValue < 0.01) {
                newValue = '0.01'
            }
        }
        return newValue
    }

    const handleAllValue2Blur = ({ nativeEvent }) => {
        Alert.alert(t.labels.PBNA_MOBILE_AMOUNT_CHANGE, t.labels.PBNA_MOBILE_COMMISSION_CHANGE_MESSAGE, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                onPress: () => {
                    setAllValue2(allValue2Ref.current)
                }
            },
            {
                text: t.labels.PBNA_MOBILE_CONTINUE,
                onPress: () => {
                    if (_.isEmpty(nativeEvent.text)) {
                        const tempProducts = _.cloneDeep(tempProductCommissionRate)
                        tempProducts.forEach((item) => {
                            item.FSV_COMM_RATE_T1__c = ''
                        })
                        setTempProductCommissionRate(tempProducts)
                        productCommissionRef.current = tempProducts
                        allValue2Ref.current = ''
                        setAllValue2('')
                        return ''
                    }
                    let newValue = allValue2
                    newValue = addZeroes(allValue2)
                    newValue = calcCommissionRateLimit(newValue)
                    const tempProducts = _.cloneDeep(tempProductCommissionRate)
                    tempProducts.forEach((item) => {
                        item.FSV_COMM_RATE_T1__c = newValue
                    })
                    setTempProductCommissionRate(tempProducts)
                    productCommissionRef.current = tempProducts
                    setAllValue2(newValue.toString())
                    allValue2Ref.current = newValue.toString()
                    return newValue
                }
            }
        ])
    }

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={commonStyle.flexRowSpaceBet}>
                    <View style={styles.width_625}>
                        <CText style={styles.headerStyle}>{t.labels.PBNA_MOBILE_COMMISSION_RATE}</CText>
                    </View>
                    <View style={styles.headerContainer2}>
                        <CText style={styles.inputFont}>
                            {equipment.Contract_Type__c === 'Quantity'
                                ? t.labels.PBNA_MOBILE_AMOUNT_UNIT.toUpperCase()
                                : t.labels.PBNA_MOBILE_PERCENTAGE}
                        </CText>
                    </View>
                </View>
                <View style={styles.headerContainer3}>
                    <View style={styles.headerContainer4}>
                        <View style={styles.headerContainer5}>
                            <View style={styles.inputContainer}>
                                <CText style={styles.inputSymbol}>
                                    {equipment.Contract_Type__c === 'Revenue' ? '%' : '$'}
                                </CText>
                                <Input
                                    containerStyle={styles.inputContainerStyle}
                                    onChangeText={(v) => {
                                        if (equipment.Contract_Type__c === 'Revenue') {
                                            setAllValue2(processDecimal(v))
                                        } else {
                                            setAllValue2(processTwoDecimalNumber(v))
                                        }
                                    }}
                                    onBlur={handleAllValue2Blur}
                                    placeholder={'--.--'}
                                    inputContainerStyle={styles.inputColor}
                                    keyboardType={'numeric'}
                                    inputStyle={styles.inputFont}
                                    value={allValue2 || ''}
                                    disabled={_.isEmpty(products) || readonly}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const renderVariableProducts = (item, index) => {
        return (
            <View style={styles.variableProductContainer}>
                <View style={styles.selectNumContainer}>
                    <CText style={styles.selectNumStyle}>{item.slct_num__c}</CText>
                    <CText numberOfLines={2} style={styles.nameText}>
                        {item.Name}
                    </CText>
                </View>
                <View style={styles.variableProductInputContainer1}>
                    <View style={styles.variableProductInputContainer2}>
                        <View style={styles.priceInput}>
                            <CText style={styles.variableProductInputSymbol}>
                                {equipment.Contract_Type__c === 'Revenue' ? '%' : '$'}
                            </CText>
                            <Input
                                containerStyle={styles.variableProductInputContainerStyle}
                                onChangeText={(v) => {
                                    let newValue: string
                                    if (equipment.Contract_Type__c === 'Revenue') {
                                        newValue = processDecimal(v)
                                    } else {
                                        newValue = processTwoDecimalNumber(v)
                                    }
                                    const temp = _.cloneDeep(tempProductCommissionRate)
                                    temp[index].FSV_COMM_RATE_T1__c = newValue
                                    setTempProductCommissionRate(temp)
                                }}
                                onBlur={() => {
                                    Alert.alert(
                                        t.labels.PBNA_MOBILE_AMOUNT_CHANGE,
                                        t.labels.PBNA_MOBILE_COMMISSION_CHANGE_MESSAGE,
                                        [
                                            {
                                                text: t.labels.PBNA_MOBILE_CANCEL,
                                                onPress: () => {
                                                    const temp = _.cloneDeep(tempProductCommissionRate)
                                                    if (_.isEmpty(temp[index])) {
                                                        temp[index].FSV_COMM_RATE_T1__c = ''
                                                        setTempProductCommissionRate(temp)
                                                    } else {
                                                        temp[index].FSV_COMM_RATE_T1__c =
                                                            productCommissionRef.current[index].FSV_COMM_RATE_T1__c
                                                        setTempProductCommissionRate(temp)
                                                    }
                                                }
                                            },
                                            {
                                                text: t.labels.PBNA_MOBILE_CONTINUE,
                                                onPress: () => {
                                                    if (
                                                        _.isEmpty(
                                                            tempProductCommissionRate[index].FSV_COMM_RATE_T1__c + ''
                                                        )
                                                    ) {
                                                        const temp = _.cloneDeep(tempProductCommissionRate)
                                                        temp[index].FSV_COMM_RATE_T1__c = ''
                                                        setTempProductCommissionRate(temp)
                                                        productCommissionRef.current = temp
                                                    } else {
                                                        let newValue =
                                                            tempProductCommissionRate[index].FSV_COMM_RATE_T1__c
                                                        newValue = addZeroes(newValue + '')
                                                        newValue = calcCommissionRateLimit(newValue)
                                                        const temp = _.cloneDeep(tempProductCommissionRate)
                                                        temp[index].FSV_COMM_RATE_T1__c = newValue
                                                        setTempProductCommissionRate(temp)
                                                        productCommissionRef.current = temp
                                                    }
                                                }
                                            }
                                        ]
                                    )
                                }}
                                placeholder={'--.--'}
                                inputContainerStyle={styles.inputColor}
                                keyboardType={'numeric'}
                                inputStyle={styles.inputFont}
                                value={tempProductCommissionRate[index].FSV_COMM_RATE_T1__c || ''}
                                disabled={readonly}
                            />
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const renderCommissionRate = (v: CommissionRateType, i: number) => {
        const maxIndex = commissionRateList.length - 1
        let unitLabel = formatString(
            equipment.Contract_Type__c === 'Revenue'
                ? t.labels.PBNA_MOBILE_REV_UNIT_NORMAL_BC
                : t.labels.PBNA_MOBILE_QTY_UNIT_NORMAL_BC,
            [i + 1 + '']
        )
        let amountLabel = formatString(t.labels.PBNA_MOBILE_QTY_AMOUNT_NORMAL, [i + 1 + ''])
        let percentageLabel = formatString(t.labels.PBNA_MOBILE_REV_PERCENTAGE_NORMAL, [i + 1 + ''])
        if (i === maxIndex) {
            unitLabel =
                equipment.Contract_Type__c === 'Revenue'
                    ? t.labels.PBNA_MOBILE_REV_UNIT_FINAL_BC
                    : t.labels.PBNA_MOBILE_QTY_UNIT_FINAL_BC
            amountLabel = t.labels.PBNA_MOBILE_QTY_AMOUNT_FINAL
            percentageLabel = t.labels.PBNA_MOBILE_REV_PERCENTAGE_FINAL
        }
        return (
            <View style={styles.commissionRateContainer} key={i}>
                {equipment.Rate_Type__c === 'Tier' && (
                    <View style={styles.commissionRateInputContainer}>
                        {i < maxIndex && (
                            <Input
                                label={unitLabel}
                                labelStyle={styles.pickerTileLabel}
                                containerStyle={styles.commissionRateContainerStyle}
                                inputStyle={styles.commissionRateInputStyle}
                                keyboardType={'numeric'}
                                disabled={readonly}
                                placeholder={
                                    equipment.Contract_Type__c === 'Revenue'
                                        ? t.labels.PBNA_MOBILE_ENTER_REVENUE
                                        : t.labels.PBNA_MOBILE_ENTER_QUANTITY
                                }
                                onChangeText={(v) => {
                                    const temp = _.cloneDeep(commissionRateList)
                                    if (equipment.Contract_Type__c === 'Revenue') {
                                        v = processDecimal(v)
                                    } else {
                                        v = v?.replace(/\D/g, '')
                                    }
                                    temp[i].FSVUnit = v
                                    setCommissionRateList(temp)
                                }}
                                value={commissionRateList[i].FSVUnit || ''}
                                inputContainerStyle={styles.inputColor2}
                                allowFontScaling={false}
                                leftIcon={
                                    <CText
                                        style={{
                                            fontSize: 14,
                                            color: commissionRateList[i]?.FSVUnit && !readonly ? '#000000' : '#778899'
                                        }}
                                    >
                                        {equipment.Contract_Type__c === 'Revenue' && '$'}
                                    </CText>
                                }
                                onBlur={() => {
                                    if (equipment.Contract_Type__c === 'Revenue' && commissionRateList[i].FSVUnit) {
                                        const temp = _.cloneDeep(commissionRateList)
                                        temp[i].FSVUnit = addZeroes(temp[i].FSVUnit.toString()).toString()
                                        setCommissionRateList(temp)
                                    }
                                }}
                            />
                        )}
                        {i === maxIndex && (
                            <View>
                                <CText style={styles.finalTierLabel}>{unitLabel}</CText>
                                <View style={styles.finalTierContent}>
                                    <CText style={styles.finalTierValue}>
                                        {equipment.Contract_Type__c === 'Revenue'
                                            ? '$ ' + parseFloat(commissionRateList[i]?.FSVUnit || '0').toFixed(2)
                                            : commissionRateList[i]?.FSVUnit}
                                    </CText>
                                </View>
                            </View>
                        )}
                    </View>
                )}
                <View style={[commonStyle.flex_1, commonStyle.flexDirectionRow]}>
                    <View style={styles.flex_4}>
                        {equipment.Contract_Type__c === 'Quantity' && (
                            <Input
                                label={
                                    equipment.Rate_Type__c === 'Tier' ? amountLabel : t.labels.PBNA_MOBILE_AMOUNT_UNIT
                                }
                                labelStyle={styles.pickerTileLabel}
                                containerStyle={styles.commissionRateContainerStyle}
                                onChangeText={(value) => {
                                    const temp = _.cloneDeep(commissionRateList)
                                    temp[i].FSVRate = processNumber(value)
                                    setCommissionRateList(temp)
                                }}
                                placeholder={'0.00'}
                                placeholderTextColor={'#778899'}
                                inputContainerStyle={styles.inputColor2}
                                keyboardType={'numeric'}
                                inputStyle={styles.inputFont2}
                                value={commissionRateList[i]?.FSVRate?.toString()}
                                disabled={readonly}
                                renderErrorMessage={false}
                                ref={amountRef}
                                errorMessage={
                                    parseFloat(commissionRateList[i]?.FSVRate || '0') > 0.75 &&
                                    t.labels.PBNA_MOBILE_NO_MORE_THAN_0_75_DOLLAR
                                }
                                errorStyle={styles.errorStyle}
                                leftIcon={
                                    <CText
                                        style={{
                                            fontSize: 14,
                                            color: commissionRateList[i]?.FSVRate && !readonly ? '#000000' : '#778899'
                                        }}
                                    >
                                        $
                                    </CText>
                                }
                                allowFontScaling={false}
                                maxLength={4}
                                onBlur={() => {
                                    if (equipment.Contract_Type__c === 'Quantity' && commissionRateList[i].FSVRate) {
                                        const temp = _.cloneDeep(commissionRateList)
                                        temp[i].FSVRate = addZeroes(temp[i].FSVRate.toString()).toString()
                                        setCommissionRateList(temp)
                                    }
                                }}
                            />
                        )}
                        {equipment.Contract_Type__c === 'Revenue' && (
                            <Input
                                label={
                                    equipment.Rate_Type__c === 'Tier'
                                        ? percentageLabel
                                        : t.labels.PBNA_MOBILE_PERCENTAGE
                                }
                                labelStyle={styles.pickerTileLabel}
                                containerStyle={styles.commissionRateContainerStyle}
                                onChangeText={(value) => {
                                    const temp = _.cloneDeep(commissionRateList)
                                    value = processDecimal(value)
                                    temp[i].FSVRate = value
                                    setCommissionRateList(temp)
                                }}
                                onBlur={() => {
                                    if (commissionRateList[i].FSVRate) {
                                        const temp = _.cloneDeep(commissionRateList)
                                        temp[i].FSVRate = addZeroes(temp[i].FSVRate.toString()).toString()
                                        setCommissionRateList(temp)
                                    }
                                }}
                                placeholder={'0'}
                                placeholderTextColor={'#778899'}
                                inputContainerStyle={styles.inputColor2}
                                keyboardType={'numeric'}
                                inputStyle={styles.commissionRateInputStyle}
                                value={commissionRateList[i].FSVRate?.toString() || ''}
                                disabled={readonly}
                                renderErrorMessage={false}
                                ref={amountRef}
                                errorMessage={
                                    parseFloat(commissionRateList[i].FSVRate || '0') > 75.0 &&
                                    t.labels.PBNA_MOBILE_NO_MORE_THAN_75_PERCENT
                                }
                                errorStyle={styles.errorStyle}
                                rightIcon={
                                    <CText
                                        style={{
                                            marginTop: 8,
                                            fontSize: 14,
                                            color: commissionRateList[i].FSVRate && !readonly ? '#000000' : '#778899'
                                        }}
                                    >
                                        {' '}
                                        %
                                    </CText>
                                }
                                allowFontScaling={false}
                                maxLength={5}
                            />
                        )}
                    </View>
                    {equipment.Rate_Type__c === 'Tier' && (
                        <View style={commonStyle.flexCenter}>
                            {i > 0 && i < maxIndex && !readonly && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const temp = _.cloneDeep(commissionRateList)
                                        temp.splice(i, 1)
                                        setCommissionRateList(temp)
                                    }}
                                    style={styles.marginLeft_12}
                                >
                                    <Image
                                        source={require('../../../../../../assets/image/trash.png')}
                                        style={styles.trashStyle}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        )
    }

    const renderAddTierButton = () => {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <TouchableOpacity
                    onPress={() => {
                        const temp = _.cloneDeep(commissionRateList)
                        temp.splice(temp?.length - 1, 0, BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT)
                        setCommissionRateList(temp)
                    }}
                    style={styles.addTierButton}
                >
                    <View style={commonStyle.flexRowAlignCenter}>
                        <View style={styles.addContainer}>
                            <View style={styles.addStyle1} />
                            <View style={styles.addStyle2} />
                        </View>
                        <CText style={styles.addText}>{t.labels.PBNA_MOBILE_ADD_TIER.toUpperCase()}</CText>
                    </View>
                </TouchableOpacity>
                <View style={commonStyle.flex_1} />
            </View>
        )
    }

    const clearVariableProducts = () => {
        const productList = _.cloneDeep(products)
        productList.forEach((item) => {
            delete item.FSV_UNIT_T1__c
            delete item.FSV_COMM_RATE_T1__c
        })
        setAllValue2('')
        setProducts(productList)
        setTempProductCommissionRate(initTempProductCommissionRate(productList))
    }

    const processRateTypeChange = (value) => {
        const temp = _.cloneDeep(equipment)
        temp.Rate_Type__c = value
        if (value === 'No Commission') {
            temp.Deposit_Amount__c = '0.00'
        } else {
            temp.Deposit_Amount__c = null
        }
        supplierRef.current?.setValue('')
        contractTypeRef.current?.resetNull()
        commissionBasisRef.current?.resetNull()
        paymentScheduleRef.current?.resetNull()
        supplierRef.current?.resetNull()
        temp.Deposit_Amount__c = null
        temp.Contract_Type__c = null
        temp.Commission_Basis__c = null
        temp.Payment_Schedule__c = null
        temp.Deduct_Deposit__c = false
        temp.Supplier__c = null
        temp['Supplier__r.supplier_name__c'] = null
        temp['Supplier__r.supplier_no__c'] = null
        temp['Supplier__r.splr_site_addr1_txt__c'] = null
        temp['Supplier__r.splr_site_city_nme__c'] = null
        temp['Supplier__r.splr_site_st_cde__c'] = null
        temp['Supplier__r.splr_site_zip_cde__c'] = null
        temp.FSV_Notes__c = null
        temp.FSV_UNIT_T1__c = null
        temp.FSV_COMM_RATE_T1__c = null
        temp.FSV_COMM_RATE_T2__c = null
        temp.FSV_UNIT_T2__c = null
        temp.FSV_COMM_RATE_T3__c = null
        temp.FSV_UNIT_T3__c = null
        temp.FSV_COMM_RATE_T4__c = null
        temp.FSV_UNIT_T4__c = null
        temp.FSV_COMM_RATE_T5__c = null
        temp.FSV_UNIT_T5__c = null
        if (value === 'Tier') {
            setCommissionRateList([BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT, BLANK_FINAL_TIER_PLACEHOLDER_OBJECT])
        } else {
            setCommissionRateList([BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT])
        }
        setCommissionBasisList(CommissionBasis)
        clearVariableProducts()
        setEquipment(temp)
    }

    const processContractTypeChange = (value) => {
        const temp = _.cloneDeep(equipment)
        temp.Contract_Type__c = value
        if (equipment.Rate_Type__c === 'Flat at Asset' || equipment.Rate_Type__c === 'Tier') {
            if (value === 'Quantity') {
                temp.Commission_Basis__c = 'Flat'
                temp.Commission_Basis_CDE__c = 'Flat'
                commissionBasisRef.current?.setValue('Flat')
            } else {
                temp.Commission_Basis__c = null
                temp.Commission_Basis_CDE__c = null
                commissionBasisRef.current?.resetNull()
                setCommissionBasisList(
                    _.filter(CommissionBasis, (v) => {
                        return v !== 'Flat'
                    })
                )
            }
        } else if (equipment.Rate_Type__c === 'Variable by Product') {
            if (value === 'Quantity') {
                temp.Commission_Basis__c = 'Flat'
                temp.Commission_Basis_CDE__c = 'Flat'
                commissionBasisRef.current?.setValue('Flat')
            } else if (value === 'Revenue') {
                setCommissionBasisList(CommissionBasisWithoutFlat)
                commissionBasisRef.current?.resetNull()
            }
            clearVariableProducts()
        }
        temp.FSV_COMM_RATE_T1__c = null
        temp.FSV_UNIT_T1__c = null
        temp.FSV_COMM_RATE_T2__c = null
        temp.FSV_UNIT_T2__c = null
        temp.FSV_COMM_RATE_T3__c = null
        temp.FSV_UNIT_T3__c = null
        temp.FSV_COMM_RATE_T4__c = null
        temp.FSV_UNIT_T4__c = null
        temp.FSV_COMM_RATE_T5__c = null
        temp.FSV_UNIT_T5__c = null
        if (equipment.Rate_Type__c === 'Tier') {
            setCommissionRateList([BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT, BLANK_FINAL_TIER_PLACEHOLDER_OBJECT])
        } else {
            setCommissionRateList([BLANK_NORMAL_TIER_PLACEHOLDER_OBJECT])
        }
        setEquipment(temp)
    }

    return (
        <ScrollView extraScrollHeight={-50}>
            <View style={styles.scrollViewContainer}>
                <View style={styles.paddingHorizontal_22}>
                    <PickerTile
                        data={RateType}
                        label={t.labels.PBNA_MOBILE_RATE_TYPE}
                        labelStyle={styles.pickerTileLabel}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_RATE_TYPE}
                        disabled={readonly}
                        defValue={equipment.Rate_Type__c}
                        required
                        noPaddingHorizontal
                        containerStyle={styles.pickerTileContainer}
                        cRef={rateTypeRef}
                        onChange={(value) => {
                            if (equipment.Rate_Type__c) {
                                Alert.alert(
                                    t.labels.PBNA_MOBILE_RATE_TYPE_CHANGE,
                                    t.labels.PBNA_MOBILE_COMMISSION_CHANGE_FIELD_MESSAGE,
                                    [
                                        {
                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                            onPress: () => {
                                                rateTypeRef.current?.setValue(equipment.Rate_Type__c)
                                            }
                                        },
                                        {
                                            text: t.labels.PBNA_MOBILE_CONTINUE,
                                            onPress: () => {
                                                processRateTypeChange(value)
                                            }
                                        }
                                    ]
                                )
                            } else {
                                processRateTypeChange(value)
                            }
                        }}
                    />
                    <PickerTile
                        data={ContractType}
                        label={t.labels.PBNA_MOBILE_CONTRACT_TYPE}
                        labelStyle={styles.pickerTileLabel}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_CONTRACT_TYPE}
                        disabled={readonly || equipment.Rate_Type__c === 'No Commission'}
                        defValue={equipment.Rate_Type__c === 'No Commission' ? 'N/A' : equipment?.Contract_Type__c}
                        required
                        noPaddingHorizontal
                        containerStyle={styles.pickerTileContainer}
                        cRef={contractTypeRef}
                        onChange={(value) => {
                            if (equipment.Contract_Type__c) {
                                Alert.alert(
                                    t.labels.PBNA_MOBILE_CONTRACT_TYPE_CHANGE,
                                    t.labels.PBNA_MOBILE_COMMISSION_CHANGE_FIELD_MESSAGE,
                                    [
                                        {
                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                            onPress: () => {
                                                contractTypeRef.current?.setValue(equipment.Contract_Type__c)
                                            }
                                        },
                                        {
                                            text: t.labels.PBNA_MOBILE_CONTINUE,
                                            onPress: () => {
                                                processContractTypeChange(value)
                                            }
                                        }
                                    ]
                                )
                            } else {
                                processContractTypeChange(value)
                            }
                        }}
                    />
                    <PickerTile
                        data={commissionBasisList}
                        label={t.labels.PBNA_MOBILE_COMMISSION_BASIS}
                        labelStyle={styles.pickerTileLabel}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_COMMISSION_BASIS}
                        disabled={
                            readonly ||
                            equipment.Rate_Type__c === 'No Commission' ||
                            equipment.Contract_Type__c === 'Quantity'
                        }
                        defValue={equipment.Rate_Type__c === 'No Commission' ? 'N/A' : equipment?.Commission_Basis__c}
                        required
                        noPaddingHorizontal
                        containerStyle={styles.pickerTileContainer}
                        cRef={commissionBasisRef}
                        onChange={(value) => {
                            const temp = _.cloneDeep(equipment)
                            temp.Commission_Basis__c = value
                            temp.Commission_Basis_CDE__c = CommissionBasisCodeMap[value]
                            setEquipment(temp)
                        }}
                    />
                    <PickerTile
                        data={PaymentSchedule}
                        label={t.labels.PBNA_MOBILE_PAYMENT_SCHEDULE}
                        labelStyle={styles.pickerTileLabel}
                        placeholder={t.labels.PBNA_MOBILE_SELECT}
                        title={t.labels.PBNA_MOBILE_PAYMENT_SCHEDULE}
                        disabled={readonly || equipment.Rate_Type__c === 'No Commission'}
                        defValue={equipment.Rate_Type__c === 'No Commission' ? 'N/A' : equipment?.Payment_Schedule__c}
                        required
                        noPaddingHorizontal
                        containerStyle={styles.pickerTileContainer}
                        cRef={paymentScheduleRef}
                        onChange={(value) => {
                            const temp = _.cloneDeep(equipment)
                            temp.Payment_Schedule__c = value
                            setEquipment(temp)
                        }}
                    />
                    <View style={styles.depositAmountContainer}>
                        <View style={commonStyle.flex_1}>
                            <Input
                                label={t.labels.PBNA_MOBILE_DEPOSIT_AMOUNT}
                                labelStyle={styles.pickerTileLabel}
                                containerStyle={styles.marginLeft_10}
                                onChangeText={(value) => {
                                    const temp = _.cloneDeep(equipment)
                                    temp.Deposit_Amount__c = processNumber(value)
                                    setEquipment(temp)
                                }}
                                placeholder={'0.00'}
                                placeholderTextColor={'#778899'}
                                inputContainerStyle={styles.inputColor2}
                                keyboardType={'numeric'}
                                inputStyle={styles.inputFont2}
                                value={equipment?.Deposit_Amount__c?.toString()}
                                disabled={readonly || equipment.Rate_Type__c === 'No Commission'}
                                renderErrorMessage={false}
                                ref={depositAmountRef}
                                errorMessage={
                                    parseFloat(equipment.Deposit_Amount__c || 0) > 2 &&
                                    t.labels.PBNA_MOBILE_NO_MORE_THAN_2_DOLLAR
                                }
                                errorStyle={styles.errorStyle}
                                leftIcon={
                                    <CText
                                        style={{
                                            fontSize: 14,
                                            color:
                                                equipment.Rate_Type__c !== 'No Commission' &&
                                                equipment.Deposit_Amount__c &&
                                                !readonly
                                                    ? '#000000'
                                                    : '#778899'
                                        }}
                                    >
                                        $
                                    </CText>
                                }
                                allowFontScaling={false}
                                onBlur={() => {
                                    if (equipment.Deposit_Amount__c) {
                                        const temp = _.cloneDeep(equipment)
                                        temp.Deposit_Amount__c = addZeroes(temp.Deposit_Amount__c.toString())
                                        setEquipment(temp)
                                    }
                                }}
                            />
                        </View>
                        <View style={styles.checkBoxContainer}>
                            <LeadCheckBox
                                containerStyle={styles.checkBoxStyle}
                                title={<CText>{t.labels.PBNA_MOBILE_DEDUCT_DEPOSIT}</CText>}
                                editable={!readonly && equipment.Rate_Type__c !== 'No Commission'}
                                checked={equipment.Deduct_Deposit__c}
                                onChange={() => {
                                    const temp = _.cloneDeep(equipment)
                                    temp.Deduct_Deposit__c = !temp.Deduct_Deposit__c
                                    setEquipment(temp)
                                }}
                                outerForm
                            />
                        </View>
                    </View>
                    <SearchablePicklist
                        label={t.labels.PBNA_MOBILE_SUPPLIER}
                        data={supplierList}
                        showValue={(v) => {
                            return `${v.supplier_no__c} ${v.supplier_name__c} ${
                                v.splr_site_addr1_txt__c
                                    ? `${v.splr_site_addr1_txt__c || ''} ${v.splr_site_city_nme__c || ''}, ${
                                          v.splr_site_st_cde__c || ''
                                      } ${v.splr_site_zip_cde__c || ''}`
                                    : ''
                            }`
                        }}
                        onApply={(v) => {
                            setEquipment({
                                ...equipment,
                                Supplier__c: v.Id,
                                'Supplier__r.supplier_name__c': v.supplier_name__c,
                                'Supplier__r.supplier_no__c': v.supplier_no__c,
                                'Supplier__r.splr_site_addr1_txt__c': v.splr_site_addr1_txt__c,
                                'Supplier__r.splr_site_city_nme__c': v.splr_site_city_nme__c,
                                'Supplier__r.splr_site_st_cde__c': v.splr_site_st_cde__c,
                                'Supplier__r.splr_site_zip_cde__c': v.splr_site_zip_cde__c
                            })
                        }}
                        defValue={
                            !_.isEmpty(equipment?.Supplier__c)
                                ? `${equipment['Supplier__r.supplier_no__c']} ${
                                      equipment['Supplier__r.supplier_name__c']
                                  } ${(() => {
                                      if (equipment['Supplier__r.splr_site_addr1_txt__c']) {
                                          return `${equipment['Supplier__r.splr_site_addr1_txt__c'] || ''} ${
                                              equipment['Supplier__r.splr_site_city_nme__c'] || ''
                                          }, ${equipment['Supplier__r.splr_site_st_cde__c'] || ''} ${
                                              equipment['Supplier__r.splr_site_zip_cde__c'] || ''
                                          }`
                                      }
                                      return ''
                                  })()}`
                                : ''
                        }
                        searchIcon
                        rightTriangle={false}
                        containerStyle={[
                            styles.pickerTileContainer,
                            (readonly || equipment.Rate_Type__c === 'No Commission') && {
                                borderBottomWidth: 1,
                                borderBottomColor: '#d3d3d3'
                            }
                        ]}
                        placeholder={
                            readonly || equipment.Rate_Type__c === 'No Commission'
                                ? 'N/A'
                                : t.labels.PBNA_MOBILE_SEARCH_SUPPLIER
                        }
                        disabled={readonly || equipment.Rate_Type__c === 'No Commission'}
                        cRef={supplierRef}
                        onSearchChange={(v) => {
                            setSupplierSearchValue(v)
                        }}
                        search={false}
                        onClear={
                            readonly
                                ? null
                                : () => {
                                      setEquipment({
                                          ...equipment,
                                          Supplier__c: null,
                                          'Supplier__r.supplier_name__c': null,
                                          'Supplier__r.supplier_no__c': null,
                                          'Supplier__r.splr_site_addr1_txt__c': null,
                                          'Supplier__r.splr_site_city_nme__c': null,
                                          'Supplier__r.splr_site_st_cde__c': null,
                                          'Supplier__r.splr_site_zip_cde__c': null
                                      })
                                  }
                        }
                        textColor={readonly ? '#778899' : '#000000'}
                    />
                    <Input
                        label={t.labels.PBNA_MOBILE_FSV_NOTES_COMMENTS}
                        labelStyle={styles.pickerTileLabel}
                        maxLength={255}
                        onChangeText={(v) => {
                            const temp = _.cloneDeep(equipment)
                            temp.FSV_Notes__c = v
                            setEquipment(temp)
                        }}
                        disabled={readonly}
                        multiline
                        containerStyle={styles.commissionRateContainerStyle}
                        value={equipment.FSV_Notes__c ? equipment.FSV_Notes__c : ''}
                        placeholder={readonly ? '-' : t.labels.PBNA_MOBILE_ENTER_COMMENTS_HERE}
                        placeholderTextColor={'#778899'}
                        inputStyle={styles.commissionRateInputStyle}
                        allowFontScaling={false}
                        inputContainerStyle={styles.inputColor2}
                    />
                </View>

                {(equipment.Rate_Type__c === 'Flat at Asset' || equipment.Rate_Type__c === 'Tier') &&
                    equipment.Contract_Type__c && (
                        <View style={styles.marginHorizontal_5}>
                            <CText style={styles.commissionRateText}>{t.labels.PBNA_MOBILE_COMMISSION_RATE}</CText>
                            {equipment.Rate_Type__c === 'Tier' &&
                                commissionRateList.length < 5 &&
                                !readonly &&
                                renderAddTierButton()}
                            {commissionRateList.map((v, i) => {
                                return renderCommissionRate(v, i)
                            })}
                        </View>
                    )}
                {equipment.Rate_Type__c === 'Variable by Product' && equipment.Contract_Type__c && (
                    <View>
                        {renderHeader()}
                        {products.map((product, index) => {
                            return renderVariableProducts(product, index)
                        })}
                    </View>
                )}
                <View style={styles.paddingHorizontal_22}>
                    <ConfirmButton
                        label={_.toUpper(t.labels.PBNA_MOBILE_SET_UP_COMMISSION)}
                        handlePress={() => {
                            processCommissionRate()
                            setUpCommission()
                        }}
                        disabled={setDisable()}
                    />
                </View>
                <View style={styles.paddingBottom_200} />
            </View>
        </ScrollView>
    )
}

export default SetUpCommission
