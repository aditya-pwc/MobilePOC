import _ from 'lodash'
import React, { useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native'
import { useRouteLists } from '../../../../hooks/LeadHooks'
import { t } from '../../../../../common/i18n/t'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import SearchablePicklist from '../common/SearchablePicklist'
import TopKpiPanel from './TopKpiPanel'

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'flex-end',
        width: '100%'
    },

    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },

    pickerBorder: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },

    labelStyle: {},

    flexDirectionRow: {
        flexDirection: 'row'
    },

    defPickerIconLayout: {
        paddingLeft: 10,
        paddingTop: 5,
        alignItems: 'flex-end'
    },

    defPickerLabelLayout: {
        flexGrow: 1
    },
    pickText: {
        color: 'white',
        textAlign: 'right'
    },

    whiteIcon: {
        width: 0,
        height: 0,
        marginTop: 2.5,
        borderWidth: 5,
        borderTopWidth: 5,
        borderColor: 'transparent',
        borderTopColor: '#fff'
    },

    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },

    selectView: { marginHorizontal: '5%' },
    locationSelectLabel: {
        alignItems: 'center',
        marginVertical: 20
    },
    width200: {
        width: 200
    }
})

interface TopKpiFSManagerInterface {
    topKpiCRMManagerData: any
    topKpiFilterLocation: any
    setTopKpiFilterLocation: any
    isTopKpiLoading: boolean
}

const TopKpiCRMManager = (props: TopKpiFSManagerInterface) => {
    const { topKpiCRMManagerData, setTopKpiFilterLocation, topKpiFilterLocation, isTopKpiLoading } = props
    const [showModal, setShowModal] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [currentSelectedLocation, setCurrentSelectedLocation] = useState({})
    const routeLists = useRouteLists(searchValue, ['Location'])
    const locationRef = useRef(null)
    return (
        <View>
            <Modal visible={showModal} animationType={'fade'}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.selectView}>
                        <View style={styles.locationSelectLabel}>
                            <CText style={styles.eTitle}>{t.labels.PBNA_MOBILE_CHOOSE_LOCATION}</CText>
                        </View>
                        <SearchablePicklist
                            cRef={locationRef}
                            label={`${t.labels.PBNA_MOBILE_LOCATION_NAME} `}
                            data={routeLists}
                            onSearchChange={(v) => {
                                setSearchValue(v)
                            }}
                            showValue={(v) => {
                                return v?.SLS_UNIT_NM__c
                            }}
                            defValue={topKpiFilterLocation.SLS_UNIT_NM__c || ''}
                            onApply={async (v) => {
                                setCurrentSelectedLocation(v)
                            }}
                        />
                    </View>

                    <FormBottomButton
                        onPressCancel={() => {
                            setShowModal(false)
                        }}
                        onPressSave={() => {
                            setTopKpiFilterLocation(currentSelectedLocation)
                            setShowModal(false)
                        }}
                        rightButtonLabel={t.labels.PBNA_MOBILE_SAVE}
                        disableSave={_.isEmpty(currentSelectedLocation)}
                    />
                </SafeAreaView>
            </Modal>
            <View style={styles.topContainer}>
                <View style={styles.width200}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowModal(true)
                        }}
                    >
                        <View style={styles.flexDirectionRow}>
                            <View style={[styles.defPickerLabelLayout]}>
                                <CText style={styles.pickText}>
                                    {topKpiFilterLocation.SLS_UNIT_NM__c || t.labels.PBNA_MOBILE_LOCATION}
                                </CText>
                            </View>
                            <View style={[styles.defPickerIconLayout]}>
                                <View style={styles.whiteIcon} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <TopKpiPanel
                topKpiCRMManagerData={topKpiCRMManagerData}
                leftLabel={t.labels.PBNA_MOBILE_LOCATION_LEADS}
                isTopKpiLoading={isTopKpiLoading}
            />
        </View>
    )
}

export default TopKpiCRMManager
