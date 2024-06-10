/**
 * @description Component to show and add customer price group .
 * @author Kiren Cao
 * @date 2023-11-29
 */
import React, { FC, useState } from 'react'
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { t } from '../../../../common/i18n/t'
import SearchablePicklist from '../lead/common/SearchablePicklist'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import DateTimePicker from '@react-native-community/datetimepicker'
import { DatePickerLocale } from '../../../enums/i18n'
import { CommonParam } from '../../../../common/CommonParam'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { useFilterPriceGroupDataWithSearchText } from '../../../hooks/LeadHooks'
import CustomerPriceGroupTile from './CustomerPriceGroupTile'
import ExpirationDateModal from './ExpirationDateModal'

interface CustomerPriceGroupExecutionProps {
    priceGroup: Array<any>
    addedPriceGroup: Array<any>
    priceGroupRef: any
    addingPriceGroup: Array<any>
    setAddingPriceGroup: any
    setCustomerPriceGroupCount: any
    showPriceGroupSearch: boolean
    setShowPriceGroupSearch: (showPriceGroupSearch: boolean) => void
    showPriceGroupCTA: boolean
    priceGroupOriginSearchList: Array<any>
    setRefreshFlag: any
    custId: string
    pricingLevelId: string
}

const styles = StyleSheet.create({
    marginBottom: {
        marginBottom: 10
    },
    priceStyle: {
        flex: 1,
        paddingBottom: 30,
        backgroundColor: 'white'
    },
    priceName: {
        marginTop: 16,
        marginBottom: 18,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    addPriceName: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '400',
        fontSize: 12,
        color: '#000000'
    },
    priceCellStyle: {
        flex: 1
    },
    priceBorder: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    distributionSize: {
        height: 16,
        width: 16,
        marginRight: 10
    },
    leftBox: {
        width: 16,
        height: 3,
        backgroundColor: '#00A2D9',
        left: 0,
        top: 6,
        position: 'absolute'
    },
    rightBox: {
        width: 3,
        height: 16,
        backgroundColor: '#00A2D9',
        left: 6.5,
        top: 0,
        position: 'absolute'
    },
    priceGroupCTAText: {
        color: '#00A2D9',
        fontWeight: '700'
    },
    removeText: {
        color: '#EB445A',
        fontWeight: '700',
        fontSize: 12
    },
    addedPriceCell: {
        flex: 1,
        paddingHorizontal: 22,
        backgroundColor: '#f2f4f7'
    },
    marginTop_10: {
        marginTop: 10
    },
    marginTop_20: {
        marginTop: 20
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
    addPriceBorder: {
        borderTopColor: '#FFFFFF',
        borderTopWidth: 1
    },
    addPriceCont: {
        flex: 1,
        backgroundColor: 'white'
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
    priceGroupSearchContainer: {
        marginHorizontal: 22
    }
})
const CustomerPriceGroupExecution: FC<CustomerPriceGroupExecutionProps> = (props: CustomerPriceGroupExecutionProps) => {
    const {
        priceGroup,
        addedPriceGroup,
        priceGroupRef,
        addingPriceGroup,
        setAddingPriceGroup,
        setCustomerPriceGroupCount,
        showPriceGroupSearch,
        setShowPriceGroupSearch,
        showPriceGroupCTA,
        priceGroupOriginSearchList,
        setRefreshFlag,
        custId,
        pricingLevelId
    } = props
    const [selectedDate, setSelectedDate] = useState<any>(new Date())
    const [selectedPriceGroupIndex, setSelectedPriceGroupIndex] = useState(0)
    const [priceGroupInput, setPriceGroupInput] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showExpirationDateModal, setShowExpirationDateModal] = useState(false)
    const [expirationPriceGroup, setExpirationPriceGroup] = useState([])
    const priceGroupSearchList = useFilterPriceGroupDataWithSearchText(
        priceGroupOriginSearchList,
        priceGroupInput,
        _.concat(addedPriceGroup, addingPriceGroup, priceGroup)
    )

    const onSelectPriceGroup = (value: any) => {
        priceGroupRef.current.resetNull()
        const dupList = addingPriceGroup.find((obj: any) => {
            return obj?.Id === value.Id
        })
        if (_.size(dupList) === 0) {
            const resultV = _.cloneDeep(value)
            resultV.Effective_date__c = dayjs().toDate()
            setAddingPriceGroup([...addingPriceGroup, resultV])
            setCustomerPriceGroupCount((v: number) => v + 1)
        }
    }
    const renderAddingPriceGroupList = (priceList: any[]) => {
        if (_.size(priceList) === 0) {
            return null
        }
        return (
            <View style={styles.addPriceCont}>
                {priceList.map((item: any, index: number) => {
                    return (
                        <View key={item?.Id} style={[styles.addedPriceCell, index !== 0 && styles.addPriceBorder]}>
                            <CText style={styles.addPriceName} numberOfLines={0}>
                                {item?.Target_Name__c}
                            </CText>
                            <TouchableOpacity
                                onPress={() => {
                                    const updatedPriceList = [...priceList]
                                    updatedPriceList.splice(index, 1)
                                    setAddingPriceGroup(updatedPriceList)
                                    setCustomerPriceGroupCount((v: number) => v - 1)
                                }}
                            >
                                <CText style={styles.removeText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                            </TouchableOpacity>
                            <View style={styles.marginTop_20}>
                                <CText style={styles.effectiveDateStyle}>{t.labels.PBNA_MOBILE_EFFECTIVE_DATE}</CText>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowDatePicker(true)
                                        setSelectedDate(item?.Effective_date__c || '')
                                        setSelectedPriceGroupIndex(index)
                                    }}
                                    style={[commonStyle.flexRowSpaceBet, styles.marginTop_10]}
                                >
                                    <CText>
                                        {item?.Effective_date__c
                                            ? dayjs(item?.Effective_date__c).format(TIME_FORMAT.MMM_DD_YYYY)
                                            : dayjs().format(TIME_FORMAT.MMM_DD_YYYY)}
                                    </CText>
                                    <Image style={styles.calendar} source={ImageSrc.IMG_CALENDAR} />
                                </TouchableOpacity>
                                <View style={[styles.priceBorder, styles.marginTop_10, styles.marginBottom_20]} />
                            </View>
                        </View>
                    )
                })}
                <Modal
                    animationType="fade"
                    transparent
                    visible={showDatePicker}
                    onRequestClose={() => {
                        setShowDatePicker((v) => !v)
                    }}
                >
                    <TouchableOpacity
                        style={commonStyle.flex_1}
                        onPress={() => {
                            setShowDatePicker((v) => !v)
                        }}
                    >
                        <View style={styles.datePickerCont}>
                            <View style={styles.calendarModalView}>
                                <DateTimePicker
                                    style={styles.datePicker}
                                    themeVariant={'light'}
                                    value={selectedDate}
                                    maximumDate={dayjs().add(14, 'days').toDate()}
                                    minimumDate={new Date()}
                                    mode={'date'}
                                    display={'inline'}
                                    onChange={(event, date) => {
                                        const updatedPriceList = [...priceList]
                                        updatedPriceList[selectedPriceGroupIndex].Effective_date__c =
                                            dayjs(date).toDate()
                                        setAddingPriceGroup(updatedPriceList)
                                        setShowDatePicker(false)
                                    }}
                                    locale={DatePickerLocale[CommonParam.locale]}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }

    return (
        <View>
            <View style={styles.priceStyle}>
                <CustomerPriceGroupTile
                    priceGroupList={priceGroup}
                    setShowExpirationDateModal={setShowExpirationDateModal}
                    setExpirationPriceGroup={setExpirationPriceGroup}
                    addedPriceGroupList={addedPriceGroup}
                    setRefreshFlag={setRefreshFlag}
                />
                {showPriceGroupCTA && _.size(priceGroup) > 0 && (
                    <View style={[styles.marginBottom, styles.priceBorder, styles.priceGroupSearchContainer]} />
                )}
                {showPriceGroupCTA && !showPriceGroupSearch && (
                    <TouchableOpacity onPress={() => setShowPriceGroupSearch(true)} style={styles.marginTop_10}>
                        <View style={[commonStyle.flexRowAlignCenter, styles.priceGroupSearchContainer]}>
                            <View style={styles.distributionSize}>
                                <View style={styles.leftBox} />
                                <View style={styles.rightBox} />
                            </View>
                            <CText style={styles.priceGroupCTAText}>
                                {`${t.labels.PBNA_MOBILE_CD_ADD_PRICE_GROUP.toUpperCase()}`}
                            </CText>
                        </View>
                    </TouchableOpacity>
                )}
                {showPriceGroupSearch && (
                    <SearchablePicklist
                        cRef={priceGroupRef}
                        searchIcon
                        rightTriangle={false}
                        containerStyle={[styles.marginTop_10, styles.priceGroupSearchContainer]}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH}
                        label={t.labels.PBNA_MOBILE_PROPOSED_PRICE_GROUP}
                        data={priceGroupSearchList}
                        showValue={(v: any) => v?.Target_Name__c || ''}
                        onSearchChange={(v: any) => setPriceGroupInput(v)}
                        onApply={onSelectPriceGroup}
                    />
                )}
            </View>
            {renderAddingPriceGroupList(addingPriceGroup)}
            <ExpirationDateModal
                showModal={showExpirationDateModal}
                setShowModal={setShowExpirationDateModal}
                priceGroupItem={_.cloneDeep(expirationPriceGroup)}
                setRefreshFlag={setRefreshFlag}
                custId={custId}
                pricingLevelId={pricingLevelId}
            />
        </View>
    )
}

export default CustomerPriceGroupExecution
